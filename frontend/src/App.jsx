import { useState } from "react";
import ConfigPanel from "./components/ConfigPanel";
import MetricCard from "./components/MetricCard";
import LossChart from "./components/LossChart";
import LLMModelPanel from "./components/LLMModelPanel";
import ProcessTimeline from "./components/ProcessTimeline";
import { runDemo, runLLMDemo, startLLMJob, getJobStatus } from "./api/demoApi";
import "./styles.css";
import JobProgressPanel from "./components/JobProgressPanel";



export default function App() {
  const [config, setConfig] = useState({
    party_scenario: "hospital",
    model_type: "logistic",
    backend_mode: "simulation",
    rounds: 10,
    local_steps: 2,
    model_name: "Qwen/Qwen2.5-7B-Instruct",
  });
  const [job, setJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const isLora = config.model_type === "lora";

  // const handleRun = async () => {
  //   setLoading(true);
  //   setLogs([]);
  //   setResult(null);

  //   try {
  //     const data = isLora ? await runLLMDemo(config) : await runDemo(config);
  //     setLogs(data.logs);
  //     setResult(data);
  //   } catch (err) {
  //     alert(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleRun = async () => {
    setLoading(true);
    setLogs([]);
    setResult(null);
    setJob(null);

    try {
      if (isLora) {
        const started = await startLLMJob(config);
        setJob(started);

        const timer = setInterval(async () => {
          try {
            const current = await getJobStatus(started.job_id);
            setJob(current);

            if (current.partial_logs) {
              setLogs(current.partial_logs);
            }

            if (current.status === "completed") {
              clearInterval(timer);
              setResult(current.result);
              setLogs(current.result.logs);
              setLoading(false);
            }

            if (current.status === "failed") {
              clearInterval(timer);
              setLoading(false);
              alert(current.message || "LLM job failed");
              console.error(current.error);
            }
          } catch (err) {
            clearInterval(timer);
            setLoading(false);
            alert(err.message);
          }
        }, 1000);
      } else {
        const data = await runDemo(config);
        setLogs(data.logs);
        setResult(data);
        setLoading(false);
      }
    } catch (err) {
      alert(err.message);
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
      <header className={`hero ${isLora ? "hero-llm" : ""}`}>
        <div>
          <span className="badge">Federated Learning</span>
          <span className="badge">{isLora ? "Qwen 7B" : "SecretFlow"}</span>
          <span className="badge">{isLora ? "LoRA / QLoRA" : "FedAvg"}</span>
          <h1>
            {isLora
              ? "Qwen 7B LoRA Federated Fine-tuning"
              : "Federated Learning Demo Dashboard"}
          </h1>
          <p>
            {isLora
              ? "Alice and Bob fine-tune LoRA adapters locally. The server aggregates adapter tensors with FedAvg."
              : "Alice and Bob keep private data locally. The server only receives model updates and aggregates them."}
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
          <MetricCard
            title="Model"
            value={isLora ? "Qwen 7B" : "LogReg"}
            note={isLora ? "LoRA adapter training" : "Small trainable model"}
          />
          <MetricCard
            title="Aggregation"
            value={isLora ? "Adapter FedAvg" : "FedAvg"}
            note={isLora ? "Average LoRA tensors" : "Parameter average"}
          />
          <MetricCard
            title="Loss Improvement"
            value={improvement}
            note="Average loss drop"
          />
        </section>

        {isLora && <LLMModelPanel result={result} />}
        
        {isLora && <JobProgressPanel job={job} />}

        <LossChart logs={logs} />

        {result && (
          <div className="card">
            <h2>{isLora ? "LLM Federated Result JSON" : "Final Global Model"}</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}

        <ProcessTimeline modelType={config.model_type} />

      </main>
    </div>
  );
}
