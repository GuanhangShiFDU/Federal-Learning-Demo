from pydantic import BaseModel
from typing import List


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
