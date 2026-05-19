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
    throw new Error("Failed to run demo");
  }

  return res.json();
}
