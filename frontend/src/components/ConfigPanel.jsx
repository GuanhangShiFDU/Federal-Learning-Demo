export default function ConfigPanel({ config, setConfig, onRun, loading }) {
  const update = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const isLora = config.model_type === "lora";

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
          <option value="lora">Qwen 7B LoRA Federated Fine-tuning</option>
        </select>
      </label>

      {isLora && (
        <>
          <label>
            LLM Base Model
            <select
              value={config.model_name}
              onChange={(e) => update("model_name", e.target.value)}
            >
              <option value="Qwen/Qwen2.5-7B-Instruct">
                Qwen/Qwen2.5-7B-Instruct
              </option>
              <option value="Qwen/Qwen2.5-1.5B-Instruct">
                Qwen/Qwen2.5-1.5B-Instruct
              </option>
              <option value="Qwen/Qwen2.5-0.5B-Instruct">
                Qwen/Qwen2.5-0.5B-Instruct
              </option>
            </select>
          </label>

          <label>
            Local Steps per Client: {config.local_steps}
            <input
              type="range"
              min="1"
              max="5"
              value={config.local_steps}
              onChange={(e) => update("local_steps", Number(e.target.value))}
            />
          </label>
        </>
      )}

      <label>
        Backend Mode
        <select
          value={config.backend_mode}
          onChange={(e) => update("backend_mode", e.target.value)}
        >
          <option value="simulation">Local Simulation</option>
          <option value="two_machine">Two Machines Future</option>
          <option value="production">Production Future</option>
        </select>
      </label>

      <label>
        Training Rounds: {config.rounds}
        <input
          type="range"
          min={isLora ? "1" : "5"}
          max={isLora ? "3" : "30"}
          value={config.rounds}
          onChange={(e) => update("rounds", Number(e.target.value))}
        />
      </label>

      <button onClick={onRun} disabled={loading}>
        {loading
          ? isLora
            ? "Running Qwen LoRA FL..."
            : "Running SecretFlow..."
          : isLora
            ? "Run Qwen LoRA FL Demo"
            : "Run SecretFlow Demo"}
      </button>
    </div>
  );
}
