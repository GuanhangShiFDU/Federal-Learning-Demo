const logisticSteps = [
  ["Initialize", "Server initializes logistic regression weights."],
  ["Local Data", "Alice and Bob each keep private toy datasets."],
  ["Local Train", "Each party runs gradient descent locally."],
  ["FedAvg", "Server averages local parameters."],
  ["Global Model", "Updated global weights are returned."],
];

const loraSteps = [
  ["Load Qwen", "Backend loads Qwen2.5-7B-Instruct."],
  ["Attach LoRA", "Base model is frozen; only LoRA adapters are trainable."],
  ["Alice Train", "Alice trains adapter tensors on local instruction samples."],
  ["Bob Train", "Bob trains adapter tensors on local instruction samples."],
  ["Adapter FedAvg", "Server averages LoRA adapter tensors into a global adapter."],
];

export default function ProcessTimeline({ modelType }) {
  const steps = modelType === "lora" ? loraSteps : logisticSteps;

  return (
    <div className="card">
      <h2>{modelType === "lora" ? "LLM LoRA FL Process" : "Federated Learning Flow"}</h2>
      <div className="timeline">
        {steps.map(([title, body], index) => (
          <div className="timeline-item" key={title}>
            <div className="timeline-index">{index + 1}</div>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
