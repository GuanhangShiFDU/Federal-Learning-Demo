export default function ConfigPanel({ config, setConfig, onRun, loading }) {
  const update = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="card">
      <h2>Demo Configuration</h2>

      <label>
        Party Scenario
        <select
          value={config.party_scenario}
          onChange={(e) => update("party_scenario", e.target.value)}
        >
          <option value="hospital">Hospital Alice / Bob</option>
          <option value="bank">Bank Alice / Bob</option>
          <option value="mobile">Mobile App Alice / Bob</option>
        </select>
      </label>

      <label>
        Model Type
        <select
          value={config.model_type}
          onChange={(e) => update("model_type", e.target.value)}
        >
          <option value="logistic">Logistic Regression</option>
          <option value="pytorch">PyTorch Model Future</option>
          <option value="lora">LLM LoRA Future</option>
        </select>
      </label>

      <label>
        Backend Mode
        <select
          value={config.backend_mode}
          onChange={(e) => update("backend_mode", e.target.value)}
        >
          <option value="simulation">SecretFlow Local Simulation</option>
          <option value="two_machine">Two Machines Future</option>
          <option value="production">Production Future</option>
        </select>
      </label>

      <label>
        Training Rounds: {config.rounds}
        <input
          type="range"
          min="5"
          max="30"
          value={config.rounds}
          onChange={(e) => update("rounds", Number(e.target.value))}
        />
      </label>

      <button onClick={onRun} disabled={loading}>
        {loading ? "Running SecretFlow..." : "Run SecretFlow Demo"}
      </button>
    </div>
  );
}
