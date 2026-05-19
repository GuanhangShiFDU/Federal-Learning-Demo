import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function LossChart({ logs }) {
  return (
    <div className="card chart-card">
      <h2>Training Loss</h2>
      <p>Loss should decrease as Alice and Bob collaboratively train.</p>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={logs}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="round" />
          <YAxis domain={[0.3, 0.75]} />
          <Tooltip />
          <Line type="monotone" dataKey="alice_loss" strokeWidth={2} name="Alice Loss" />
          <Line type="monotone" dataKey="bob_loss" strokeWidth={2} name="Bob Loss" />
          <Line type="monotone" dataKey="avg_loss" strokeWidth={3} name="Average Loss" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
