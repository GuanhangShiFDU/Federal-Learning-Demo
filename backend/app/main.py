from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import RunConfig, RunResult
from app.services.secretflow_runner import run_secretflow_demo


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
