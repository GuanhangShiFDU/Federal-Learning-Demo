from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import RunConfig, RunResult, LLMRunConfig, LLMRunResult
from app.services.secretflow_runner import run_secretflow_demo
from app.services.qwen_lora_fed_runner import run_qwen_lora_federated_demo
from app.services.job_store import create_job, get_job, run_background


app = FastAPI(title="Federated Learning Demo Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/run-demo", response_model=RunResult)
def run_demo(config: RunConfig):
    result = run_secretflow_demo(rounds=config.rounds)
    return result

@app.post("/api/run-llm-demo", response_model=LLMRunResult)
def run_llm_demo(config: LLMRunConfig):
    result = run_qwen_lora_federated_demo(
        rounds=config.rounds,
        local_steps=config.local_steps,
        model_name=config.model_name,
    )
    return result

@app.post("/api/run-llm-demo-async")
def run_llm_demo_async(config: LLMRunConfig):
    job_id = create_job("qwen_lora_fed", config.model_dump())

    run_background(
        job_id,
        run_qwen_lora_federated_demo,
        rounds=config.rounds,
        local_steps=config.local_steps,
        model_name=config.model_name,
    )

    return {
        "job_id": job_id,
        "status": "queued",
        "message": "LLM federated training job started.",
    }


@app.get("/api/jobs/{job_id}")
def get_job_status(job_id: str):
    job = get_job(job_id)
    if job is None:
        return {
            "status": "not_found",
            "message": "Job not found.",
        }
    return job
