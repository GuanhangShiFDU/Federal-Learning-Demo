import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricCard from "./components/MetricCard";
import LossChart from "./components/LossChart";
import FlowCards from "./components/FlowCards";
import { runDemo } from "./api/demoApi";
import "./styles.css";

export default function App() {
  const [config, setConfig] = useState({
    party_scenario: "hospital",
    model_type: "logistic",
    backend_mode: "simulation",
    rounds: 10,
  });

  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const data = await runDemo(config);
      setLogs(data.logs);
      setResult(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const firstLoss = logs[0]?.avg_loss;
  const lastLoss = logs[logs.length - 1]?.avg_loss;
  const improvement =
    firstLoss && lastLoss
      ? (((firstLoss - lastLoss) / firstLoss) * 100).toFixed(1) + "%"
      : "—";

  return (
    <div className="page">
      <header className="hero">
        <div>
          <span className="badge">SecretFlow Demo</span>
          <span className="badge">FedAvg</span>
          <span className="badge">Local Simulation</span>
          <h1>Federated Learning Demo Dashboard</h1>
          <p>
            Alice and Bob keep private data locally. The server only receives
            model updates and aggregates them.
          </p>
        </div>
      </header>

      <main className="layout">
        <ConfigPanel
          config={config}
          setConfig={setConfig}
          onRun={handleRun}
          loading={loading}
        />

        <section className="metrics">
          <MetricCard title="Parties" value="2" note="Alice and Bob" />
          <MetricCard title="Aggregation" value="FedAvg" note="Parameter average" />
          <MetricCard title="Loss Improvement" value={improvement} note="Average loss drop" />
          <MetricCard title="Backend" value="SecretFlow" note="Ray local simulation" />
        </section>

        <LossChart logs={logs} />

        {result && (
          <div className="card">
            <h2>Final Global Model</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <FlowCards />

        {/* <div className="card">
          <h2>Presentation Notes</h2>
          <ul>
            <li>Real: SecretFlow runtime, local training, FedAvg aggregation.</li>
            <li>Simulated: Alice/Bob are logical parties on one server.</li>
            <li>Future: connect to real machines or add secure aggregation.</li>
          </ul>
        </div> */}
      </main>
    </div>
  );
}