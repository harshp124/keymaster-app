import { useState, useEffect } from 'react';
import './EmployeeDetail.css';

function EmployeeDetail({ employeeId, onBack }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

  useEffect(() => {
    fetchEmployeeDetail();
  }, [employeeId]);

  const fetchEmployeeDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/employees/${employeeId}`);

      if (!response.ok) {
        throw new Error(`Employee not found (${response.status})`);
      }

      const data = await response.json();
      setEmployee(data.data);
    } catch (err) {
      setError(err.message);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (skill) => {
    const colors = {
      aws: '#FF9900',
      docker: '#2496ED',
      gcp: '#4285F4',
      sql: '#336791',
      ai: '#FF6B6B',
      golang: '#00ADD8',
    };
    return colors[skill.toLowerCase()] || '#6C757D';
  };

  if (loading) {
    return (
      <div className="employee-detail">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-detail">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-detail">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="no-results">
          <p>😔 Employee not found</p>
        </div>
      </div>
    );
  }

  // Handle both API response formats
  const empData = employee.employee_data || employee;
  const displayName = empData.display_name || empData.name || `${empData.first_name || ''} ${empData.last_name || ''}`.trim() || 'Unknown';

  return (
    <div className="employee-detail">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-card">
        <div className="detail-header">
          <div className="employee-avatar-large">
            {displayName.charAt(0).toUpperCase() || 'E'}
          </div>
          <div className="header-info">
            <h1>{displayName}</h1>
            <p className="employee-id">ID: {employee.id || employee.employee_id}</p>
          </div>
        </div>

        <div className="detail-content">
          <div className="detail-section">
            <h3>📋 Basic Information</h3>
            <div className="info-grid">
              {(empData.email || empData.first_name || empData.last_name) && (
                <>
                  {empData.first_name && (
                    <div className="info-item">
                      <label>First Name</label>
                      <p>{empData.first_name}</p>
                    </div>
                  )}
                  {empData.last_name && (
                    <div className="info-item">
                      <label>Last Name</label>
                      <p>{empData.last_name}</p>
                    </div>
                  )}
                  {empData.username && (
                    <div className="info-item">
                      <label>Username</label>
                      <p>{empData.username}</p>
                    </div>
                  )}
                  {empData.email && (
                    <div className="info-item">
                      <label>Email</label>
                      <p>{empData.email}</p>
                    </div>
                  )}
                  {empData.user_type && (
                    <div className="info-item">
                      <label>User Type</label>
                      <p>{empData.user_type}</p>
                    </div>
                  )}
                  {empData.department && (
                    <div className="info-item">
                      <label>Department</label>
                      <p>{empData.department}</p>
                    </div>
                  )}
                  {empData.position && (
                    <div className="info-item">
                      <label>Position</label>
                      <p>{empData.position}</p>
                    </div>
                  )}
                  {empData.experience && (
                    <div className="info-item">
                      <label>Experience</label>
                      <p>{empData.experience} years</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {employee.matching_skills && employee.matching_skills.length > 0 && (
            <div className="detail-section">
              <h3>🛠️ Skills</h3>
              <div className="skills-grid">
                {employee.matching_skills.map((skill) => (
                  <div
                    key={skill}
                    className="skill-item"
                    style={{ backgroundColor: getSkillColor(skill) }}
                  >
                    <span className="skill-name">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {empData.bio && (
            <div className="detail-section">
              <h3>📝 Bio</h3>
              <p className="bio-text">{empData.bio}</p>
            </div>
          )}

          {empData.phone && (
            <div className="detail-section">
              <h3>📞 Contact</h3>
              <p>{empData.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmployeeDetail;

