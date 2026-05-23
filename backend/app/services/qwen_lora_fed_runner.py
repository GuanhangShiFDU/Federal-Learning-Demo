import os
import copy
import time
from dataclasses import dataclass
from typing import Dict, List, Any
from app.services.job_store import update_job, append_log

import torch
from torch.utils.data import Dataset, DataLoader

from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
)

from peft import (
    LoraConfig,
    get_peft_model,
    prepare_model_for_kbit_training,
)


@dataclass
class LLMFedConfig:
    model_name: str = "Qwen/Qwen2.5-7B-Instruct"
    rounds: int = 2
    local_steps: int = 2
    batch_size: int = 1
    learning_rate: float = 2e-4
    max_length: int = 128
    lora_r: int = 8
    lora_alpha: int = 16
    lora_dropout: float = 0.05
    use_4bit: bool = True


class TextInstructionDataset(Dataset):
    def __init__(self, tokenizer, samples: List[Dict[str, str]], max_length: int):
        self.tokenizer = tokenizer
        self.samples = samples
        self.max_length = max_length

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        sample = self.samples[idx]

        prompt = (
            "You are a helpful assistant.\n"
            f"Instruction: {sample['instruction']}\n"
            f"Answer: {sample['answer']}"
        )

        encoded = self.tokenizer(
            prompt,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt",
        )

        input_ids = encoded["input_ids"].squeeze(0)
        attention_mask = encoded["attention_mask"].squeeze(0)

        labels = input_ids.clone()
        labels[attention_mask == 0] = -100

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "labels": labels,
        }


def get_alice_samples():
    return [
        {
            "instruction": "Classify this medical note: patient has fever and cough.",
            "answer": "The case may indicate respiratory infection.",
        },
        {
            "instruction": "Classify this medical note: patient has normal temperature.",
            "answer": "The case appears low risk.",
        },
        {
            "instruction": "Summarize: patient reports headache and fatigue.",
            "answer": "The patient reports headache and fatigue.",
        },
    ]


def get_bob_samples():
    return [
        {
            "instruction": "Classify this medical note: patient has chest pain.",
            "answer": "The case may require urgent evaluation.",
        },
        {
            "instruction": "Classify this medical note: patient has mild sore throat.",
            "answer": "The case may indicate mild respiratory symptoms.",
        },
        {
            "instruction": "Summarize: patient reports dizziness after exercise.",
            "answer": "The patient reports dizziness after exercise.",
        },
    ]


def load_qwen_lora_model(config: LLMFedConfig):
    tokenizer = AutoTokenizer.from_pretrained(
        config.model_name,
        trust_remote_code=True,
    )

    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    quant_config = None
    torch_dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32

    if config.use_4bit:
        quant_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch.bfloat16,
            bnb_4bit_use_double_quant=True,
        )

    model = AutoModelForCausalLM.from_pretrained(
        config.model_name,
        quantization_config=quant_config,
        torch_dtype=torch_dtype,
        device_map="auto",
        trust_remote_code=False,
    )

    if config.use_4bit:
        model = prepare_model_for_kbit_training(model)

    lora_config = LoraConfig(
        r=config.lora_r,
        lora_alpha=config.lora_alpha,
        lora_dropout=config.lora_dropout,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj",
            "k_proj",
            "v_proj",
            "o_proj",
            "gate_proj",
            "up_proj",
            "down_proj",
        ],
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()

    return tokenizer, model


def get_lora_state_dict(model) -> Dict[str, torch.Tensor]:
    state = {}
    for name, param in model.named_parameters():
        if "lora_" in name:
            state[name] = param.detach().cpu().clone()
    return state


def load_lora_state_dict(model, state: Dict[str, torch.Tensor]):
    named_params = dict(model.named_parameters())
    for name, value in state.items():
        if name in named_params:
            named_params[name].data.copy_(value.to(named_params[name].device))


def fedavg_lora_states(states: List[Dict[str, torch.Tensor]]) -> Dict[str, torch.Tensor]:
    avg = {}
    keys = states[0].keys()
    for key in keys:
        stacked = torch.stack([state[key].float() for state in states], dim=0)
        avg[key] = stacked.mean(dim=0)
    return avg


def train_one_client(
    client_name: str,
    model,
    tokenizer,
    samples: List[Dict[str, str]],
    global_lora_state: Dict[str, torch.Tensor],
    config: LLMFedConfig,
):
    load_lora_state_dict(model, global_lora_state)

    dataset = TextInstructionDataset(
        tokenizer=tokenizer,
        samples=samples,
        max_length=config.max_length,
    )

    dataloader = DataLoader(
        dataset,
        batch_size=config.batch_size,
        shuffle=True,
    )

    model.train()

    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad],
        lr=config.learning_rate,
    )

    losses = []
    step_count = 0

    for batch in dataloader:
        if step_count >= config.local_steps:
            break

        batch = {
            key: value.to(model.device)
            for key, value in batch.items()
        }

        outputs = model(**batch)
        loss = outputs.loss

        loss.backward()
        optimizer.step()
        optimizer.zero_grad()

        losses.append(float(loss.detach().cpu()))
        step_count += 1

    local_lora_state = get_lora_state_dict(model)
    avg_loss = sum(losses) / max(len(losses), 1)

    return {
        "client": client_name,
        "loss": avg_loss,
        "steps": step_count,
        "lora_state": local_lora_state,
    }

def report(job_id, stage, progress, message):
    if job_id:
        update_job(job_id, stage=stage, progress=progress, message=message)
        append_log(job_id, message)


def run_qwen_lora_federated_demo(
    job_id=None,
    rounds: int = 2,
    local_steps: int = 2,
    model_name: str = "Qwen/Qwen2.5-7B-Instruct",
):
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    report(job_id, "Preparing", 5, "Preparing Qwen LoRA federated demo.")

    config = LLMFedConfig(
        model_name=model_name,
        rounds=rounds,
        local_steps=local_steps,
    )

    started_at = time.time()

    report(job_id, "Loading Model", 10, f"Loading base model: {model_name}")
    tokenizer, model = load_qwen_lora_model(config)

    report(job_id, "Initializing LoRA", 35, "Extracting initial LoRA adapter tensors.")
    global_lora_state = get_lora_state_dict(model)

    logs = []

    for round_id in range(config.rounds):
        base_progress = 40 + int((round_id / config.rounds) * 45)

        report(
            job_id,
            f"Round {round_id + 1}/{config.rounds}",
            base_progress,
            f"Round {round_id + 1}: Alice local LoRA training started.",
        )

        alice_result = train_one_client(
            client_name="alice",
            model=model,
            tokenizer=tokenizer,
            samples=get_alice_samples(),
            global_lora_state=global_lora_state,
            config=config,
        )

        report(
            job_id,
            f"Round {round_id + 1}/{config.rounds}",
            base_progress + 8,
            f"Round {round_id + 1}: Bob local LoRA training started.",
        )

        bob_result = train_one_client(
            client_name="bob",
            model=model,
            tokenizer=tokenizer,
            samples=get_bob_samples(),
            global_lora_state=global_lora_state,
            config=config,
        )

        report(
            job_id,
            f"Round {round_id + 1}/{config.rounds}",
            base_progress + 15,
            "Server is aggregating LoRA adapter tensors with FedAvg.",
        )

        global_lora_state = fedavg_lora_states([
            alice_result["lora_state"],
            bob_result["lora_state"],
        ])

        avg_loss = (alice_result["loss"] + bob_result["loss"]) / 2

        round_log = {
            "round": round_id,
            "alice_loss": round(alice_result["loss"], 4),
            "bob_loss": round(bob_result["loss"], 4),
            "avg_loss": round(avg_loss, 4),
            "alice_steps": alice_result["steps"],
            "bob_steps": bob_result["steps"],
        }

        logs.append(round_log)

        report(
            job_id,
            f"Round {round_id + 1}/{config.rounds}",
            base_progress + 20,
            f"Round {round_id + 1} completed. Avg loss={round_log['avg_loss']}",
        )

        if job_id:
            update_job(job_id, partial_logs=logs)

    report(job_id, "Finalizing", 90, "Collecting trainable parameter statistics.")

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    elapsed = time.time() - started_at

    return {
        "status": "success",
        "message": "Qwen LoRA federated fine-tuning demo completed.",
        "model_name": model_name,
        "training_method": "LoRA / QLoRA",
        "aggregation": "FedAvg over LoRA adapter tensors",
        "rounds": config.rounds,
        "local_steps": config.local_steps,
        "logs": logs,
        "trainable_params": int(trainable_params),
        "total_params": int(total_params),
        "trainable_ratio": float(trainable_params / total_params),
        "elapsed_seconds": round(elapsed, 2),
        "cuda_visible_devices": os.environ.get("CUDA_VISIBLE_DEVICES", "not set"),
        "device": str(model.device),
    }
