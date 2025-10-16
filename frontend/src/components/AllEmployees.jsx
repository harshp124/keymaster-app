import { useState, useEffect } from 'react';
import './AllEmployees.css';
import EmployeeList from './EmployeeList';

function AllEmployees({ onViewEmployee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    // Filter employees based on search term
    if (searchTerm.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = employees.filter(emp => {
        const name = (emp.display_name || emp.first_name || '').toLowerCase();
        const id = emp.id?.toString() || '';
        const email = (emp.email || '').toLowerCase();
        const username = (emp.username || '').toLowerCase();

        return (
          name.includes(term) ||
          id.includes(term) ||
          email.includes(term) ||
          username.includes(term)
        );
      });
      setFilteredEmployees(filtered);
    }
  }, [searchTerm, employees]);

  const fetchAllEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/v1/employees`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setEmployees(data.data || []);
      setFilteredEmployees(data.data || []);
    } catch (err) {
      setError(err.message);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="all-employees">
      <div className="all-employees-header">
        <h2>All Employees</h2>
        <p className="employee-count">
          Total: <strong>{employees.length}</strong> employees
        </p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by name, ID, email, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        {searchTerm && (
          <button
            className="clear-search"
            onClick={() => setSearchTerm('')}
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
        </div>
      )}

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      )}

      {!loading && employees.length === 0 && (
        <div className="no-results">
          <p>😔 No employees found</p>
        </div>
      )}

      {!loading && employees.length > 0 && filteredEmployees.length === 0 && (
        <div className="no-results">
          <p>🔍 No employees match your search</p>
        </div>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <div className="results-info">
          <p>
            Showing <strong>{filteredEmployees.length}</strong> of <strong>{employees.length}</strong> employees
          </p>
        </div>
      )}

      {!loading && filteredEmployees.length > 0 && (
        <EmployeeList employees={filteredEmployees} onViewEmployee={onViewEmployee} />
      )}
    </div>
  );
}

export default AllEmployees;

