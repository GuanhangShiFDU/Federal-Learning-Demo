import threading
import uuid
import traceback
from datetime import datetime


JOBS = {}
LOCK = threading.Lock()


def create_job(job_type, config):
    job_id = str(uuid.uuid4())

    with LOCK:
        JOBS[job_id] = {
            "job_id": job_id,
            "job_type": job_type,
            "status": "queued",
            "stage": "Queued",
            "progress": 0,
            "message": "Job created.",
            "logs": [],
            "result": None,
            "error": None,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "config": config,
        }

    return job_id


def update_job(job_id, **kwargs):
    with LOCK:
        job = JOBS[job_id]
        for key, value in kwargs.items():
            job[key] = value
        job["updated_at"] = datetime.utcnow().isoformat()


def append_log(job_id, message):
    with LOCK:
        job = JOBS[job_id]
        job["logs"].append({
            "time": datetime.utcnow().strftime("%H:%M:%S"),
            "message": message,
        })
        job["updated_at"] = datetime.utcnow().isoformat()


def get_job(job_id):
    with LOCK:
        return JOBS.get(job_id)


def run_background(job_id, target, *args, **kwargs):
    def runner():
        try:
            update_job(
                job_id,
                status="running",
                stage="Starting",
                progress=1,
                message="Background job started.",
            )
            result = target(job_id, *args, **kwargs)
            update_job(
                job_id,
                status="completed",
                stage="Completed",
                progress=100,
                message="Job completed.",
                result=result,
            )
        except Exception as exc:
            update_job(
                job_id,
                status="failed",
                stage="Failed",
                progress=100,
                message=str(exc),
                error=traceback.format_exc(),
            )

    thread = threading.Thread(target=runner, daemon=True)
    thread.start()
