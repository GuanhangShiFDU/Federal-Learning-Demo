export default function LLMModelPanel({ result }) {
  if (!result) {
    return (
      <div className="card llm-card">
        <h2>Qwen LoRA Federated Fine-tuning</h2>
        <p>
          Select <b>LLM LoRA Future</b> and click Run. The backend will load
          Qwen, train LoRA adapters on Alice/Bob data, and aggregate adapter
          tensors with FedAvg.
        </p>

        <div className="llm-grid">
          <div>
            <span>Base Model</span>
            <strong>Qwen/Qwen2.5-7B-Instruct</strong>
          </div>
          <div>
            <span>Training Method</span>
            <strong>LoRA / QLoRA</strong>
          </div>
          <div>
            <span>Aggregation</span>
            <strong>FedAvg over adapters</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>Ready</strong>
          </div>
        </div>
      </div>
    );
  }

  const trainablePercent = (result.trainable_ratio * 100).toFixed(4);

  return (
    <div className="card llm-card">
      <h2>Qwen LoRA Federated Fine-tuning Result</h2>

      <div className="llm-grid">
        <div>
          <span>Base Model</span>
          <strong>{result.model_name}</strong>
        </div>
        <div>
          <span>Training Method</span>
          <strong>{result.training_method}</strong>
        </div>
        <div>
          <span>Aggregation</span>
          <strong>{result.aggregation}</strong>
        </div>
        <div>
          <span>Device</span>
          <strong>{result.device}</strong>
        </div>
        <div>
          <span>CUDA_VISIBLE_DEVICES</span>
          <strong>{result.cuda_visible_devices}</strong>
        </div>
        <div>
          <span>Elapsed Time</span>
          <strong>{result.elapsed_seconds}s</strong>
        </div>
        <div>
          <span>Trainable Params</span>
          <strong>{result.trainable_params.toLocaleString()}</strong>
        </div>
        <div>
          <span>Total Params</span>
          <strong>{result.total_params.toLocaleString()}</strong>
        </div>
        <div>
          <span>Trainable Ratio</span>
          <strong>{trainablePercent}%</strong>
        </div>
      </div>
    </div>
  );
}
