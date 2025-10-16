import { useState, useEffect } from 'react';
import './App.css';
import SkillsFilter from './components/SkillsFilter';
import EmployeeList from './components/EmployeeList';
import HealthStatus from './components/HealthStatus';
import AllEmployees from './components/AllEmployees';
import EmployeeDetail from './components/EmployeeDetail';

function App() {
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'all', 'detail'
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Hardcoded skills
  const ALL_SKILLS = ['gcp', 'docker', 'aws', 'ai', 'sql', 'golang'];

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

  // Fetch health status on mount
  useEffect(() => {
    fetchHealthStatus();
  }, []);

  // Fetch employees when skills change
  useEffect(() => {
    if (selectedSkills.length > 0) {
      fetchEmployeesBySkills();
    } else {
      setEmployees([]);
    }
  }, [selectedSkills]);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health/detailed`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const fetchEmployeesBySkills = async () => {
    if (selectedSkills.length === 0) {
      setEmployees([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skillsQuery = selectedSkills.join(',');
      const response = await fetch(
        `${API_BASE_URL}/v1/employees/search/by-skills?skills=${skillsQuery}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data.data || []);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsChange = (skills) => {
    setSelectedSkills(skills);
  };

  const handleViewEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setActiveTab('detail');
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🔑 Keymaster</h1>
          <p>Employee Skills Finder</p>
        </div>
        {healthStatus && <HealthStatus status={healthStatus} />}
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search by Skills
        </button>
        <button
          className={`nav-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          👥 All Employees
        </button>
      </nav>

      <main className="app-main">
        <div className="container">
          {activeTab === 'search' && (
            <>
              <div className="filter-section">
                <SkillsFilter
                  allSkills={ALL_SKILLS}
                  selectedSkills={selectedSkills}
                  onSkillsChange={handleSkillsChange}
                />
              </div>

              <div className="results-section">
                {error && (
                  <div className="error-message">
                    <span>⚠️ {error}</span>
                  </div>
                )}

                {loading && (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>Searching for employees...</p>
                  </div>
                )}

                {!loading && selectedSkills.length > 0 && (
                  <div className="results-header">
                    <h2>
                      Results: {employees.length} employee{employees.length !== 1 ? 's' : ''} found
                    </h2>
                    <p className="skills-summary">
                      Looking for: <strong>{selectedSkills.join(', ')}</strong>
                    </p>
                  </div>
                )}

                {!loading && selectedSkills.length === 0 && (
                  <div className="empty-state">
                    <p>👇 Select skills above to find employees</p>
                  </div>
                )}

                {!loading && selectedSkills.length > 0 && employees.length === 0 && (
                  <div className="no-results">
                    <p>😔 No employees found with all selected skills</p>
                  </div>
                )}

                {!loading && employees.length > 0 && (
                  <EmployeeList employees={employees} onViewEmployee={handleViewEmployee} />
                )}
              </div>
            </>
          )}

          {activeTab === 'all' && (
            <AllEmployees onViewEmployee={handleViewEmployee} />
          )}

          {activeTab === 'detail' && selectedEmployeeId && (
            <EmployeeDetail
              employeeId={selectedEmployeeId}
              onBack={() => setActiveTab('all')}
            />
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Keymaster © 2024 | Powered by Redis</p>
      </footer>
    </div>
  );
}

export default App;

