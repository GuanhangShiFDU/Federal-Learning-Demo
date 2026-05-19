const steps = [
  ["1. Local Data", "Alice and Bob keep raw data locally."],
  ["2. Local Training", "Each party trains on private data."],
  ["3. Send Updates", "Only model parameters are returned."],
  ["4. FedAvg", "Server averages Alice and Bob parameters."],
  ["5. Global Model", "Updated model is used in the next round."],
];

export default function FlowCards() {
  return (
    <div className="card">
      <h2>Federated Learning Flow</h2>
      <div className="flow-grid">
        {steps.map(([title, body]) => (
          <div className="flow-card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
