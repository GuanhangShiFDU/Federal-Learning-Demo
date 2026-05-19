import json
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, BACKEND_DIR)

from app.services.qwen_lora_fed_runner import run_qwen_lora_federated_demo


if __name__ == "__main__":
    result = run_qwen_lora_federated_demo(
        rounds=2,
        local_steps=2,
        model_name="Qwen/Qwen2.5-7B-Instruct",
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))

