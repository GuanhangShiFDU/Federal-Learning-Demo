export default function JobProgressPanel({ job }) {
  if (!job) return null;

  const logs = job.logs || [];
  const partialLogs = job.partial_logs || [];

  return (
    <div className="card job-panel">
      <div className="job-header">
        <div>
          <h2>Backend Progress</h2>
          <p>{job.message}</p>
        </div>
        <span className={`job-status ${job.status}`}>{job.status}</span>
      </div>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${job.progress || 0}%` }}
          />
        </div>
        <strong>{job.progress || 0}%</strong>
      </div>

      <div className="stage-box">
        <span>Current Stage</span>
        <strong>{job.stage}</strong>
      </div>

      {partialLogs.length > 0 && (
        <div className="mini-loss-table">
          <h3>Partial Training Logs</h3>
          <table>
            <thead>
              <tr>
                <th>Round</th>
                <th>Alice Loss</th>
                <th>Bob Loss</th>
                <th>Avg Loss</th>
              </tr>
            </thead>
            <tbody>
              {partialLogs.map((row) => (
                <tr key={row.round}>
                  <td>{row.round}</td>
                  <td>{row.alice_loss}</td>
                  <td>{row.bob_loss}</td>
                  <td>{row.avg_loss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="log-box">
        <h3>Backend Logs</h3>
        {logs.slice(-8).map((log, index) => (
          <div className="log-line" key={index}>
            <span>{log.time}</span>
            <p>{log.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
