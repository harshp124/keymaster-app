import './HealthStatus.css';

function HealthStatus({ status }) {
  if (!status) return null;

  const isHealthy = status.status === 'healthy';
  const redisStatus = status.components?.redis?.status;
  const redisResponseTime = status.components?.redis?.response_time_ms;

  return (
    <div className={`health-status ${isHealthy ? 'healthy' : 'unhealthy'}`}>
      <div className="status-indicator">
        <span className={`status-dot ${isHealthy ? 'green' : 'red'}`}></span>
        <span className="status-text">
          {isHealthy ? 'System Healthy' : 'System Issues'}
        </span>
      </div>

      <div className="status-details">
        {redisStatus && (
          <div className="detail-item">
            <span className="detail-label">Redis:</span>
            <span className="detail-value">
              {redisStatus === 'connected' ? '✓ Connected' : '✗ Disconnected'}
              {redisResponseTime && ` (${redisResponseTime}ms)`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthStatus;

