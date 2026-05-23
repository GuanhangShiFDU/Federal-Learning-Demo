from pydantic import BaseModel
from typing import List, Optional


class RunConfig(BaseModel):
    party_scenario: str = "hospital"
    model_type: str = "logistic"
    backend_mode: str = "simulation"
    rounds: int = 10


class RoundLog(BaseModel):
    round: int
    alice_loss: float
    bob_loss: float
    avg_loss: float


class RunResult(BaseModel):
    status: str
    message: str
    logs: List[RoundLog]
    final_w: List[float]
    final_b: float

class LLMRunConfig(BaseModel):
    model_name: str = "Qwen/Qwen2.5-7B-Instruct"
    rounds: int = 2
    local_steps: int = 2


class LLMRoundLog(BaseModel):
    round: int
    alice_loss: float
    bob_loss: float
    avg_loss: float
    alice_steps: int
    bob_steps: int


class LLMRunResult(BaseModel):
    status: str
    message: str
    model_name: str
    training_method: str
    aggregation: str
    rounds: int
    local_steps: int
    logs: List[LLMRoundLog]
    trainable_params: int
    total_params: int
    trainable_ratio: float
    elapsed_seconds: float
    cuda_visible_devices: str
    device: str
