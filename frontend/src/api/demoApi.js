const API_BASE = "http://127.0.0.1:18000";

export async function runDemo(config) {
  const res = await fetch(`${API_BASE}/api/run-demo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to run demo");
  }

  return res.json();
}

export async function runLLMDemo(config) {
  const res = await fetch(`${API_BASE}/api/run-llm-demo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_name: config.model_name || "Qwen/Qwen2.5-7B-Instruct",
      rounds: config.rounds || 2,
      local_steps: config.local_steps || 2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to run LLM demo");
  }

  return res.json();
}

export async function startLLMJob(config) {
  const res = await fetch(`${API_BASE}/api/run-llm-demo-async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model_name: config.model_name || "Qwen/Qwen2.5-7B-Instruct",
      rounds: config.rounds || 2,
      local_steps: config.local_steps || 2,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to start LLM job");
  }

  return res.json();
}

export async function getJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/api/jobs/${jobId}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get job status");
  }

  return res.json();
}
