import { useState, useEffect } from 'react';
import './EmployeeList.css';

function EmployeeList({ employees, onViewEmployee }) {
  const [employeeSkills, setEmployeeSkills] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
  const ALL_SKILLS = ['gcp', 'docker', 'aws', 'ai', 'sql', 'golang'];

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

  // Fetch all skills for each employee by querying each skill
  useEffect(() => {
    const fetchAllEmployeeSkills = async () => {
      const skillsMap = {};

      // Initialize all employees with empty skills array
      // Convert all IDs to strings for consistent key matching
      for (const employee of employees) {
        const empId = String(employee.employee_id || employee.id);
        // If employee already has matching_skills (from search), use those
        if (employee.matching_skills && employee.matching_skills.length > 0) {
          skillsMap[empId] = employee.matching_skills;
        } else {
          skillsMap[empId] = [];
        }
      }

      // For employees without matching_skills, fetch all skills
      const employeesNeedingSkills = employees.filter(emp => !emp.matching_skills || emp.matching_skills.length === 0);

      if (employeesNeedingSkills.length > 0) {
        // For each skill, fetch employees who have it
        for (const skill of ALL_SKILLS) {
          try {
            const response = await fetch(
              `${API_BASE_URL}/v1/employees/search/by-skills?skills=${skill}`
            );
            if (response.ok) {
              const data = await response.json();
              // Add this skill to each employee who has it
              data.data.forEach(emp => {
                const empId = String(emp.employee_id || emp.id);
                if (skillsMap.hasOwnProperty(empId) && !skillsMap[empId].includes(skill)) {
                  skillsMap[empId].push(skill);
                }
              });
            }
          } catch (err) {
            console.error(`Error fetching skill ${skill}:`, err);
          }
        }
      }

      setEmployeeSkills(skillsMap);
    };

    if (employees.length > 0) {
      fetchAllEmployeeSkills();
    }
  }, [employees]);

  return (
    <div className="employee-list">
      <div className="employees-grid">
        {employees.map((employee) => {
          // Handle both API response formats
          // Format 1: Nested (from skills search) - has employee_data and employee_id
          // Format 2: Flat (from all employees) - has id, display_name, etc directly

          const empData = employee.employee_data || employee;
          const empId = String(employee.employee_id || employee.id);

          const displayName = empData.display_name ||
                             empData.name ||
                             `${empData.first_name || ''} ${empData.last_name || ''}`.trim() ||
                             'Unknown';
          const email = empData.email || '';
          const department = empData.department || '';
          const position = empData.position || '';
          const experience = empData.experience || '';
          // Use fetched skills (always fetch all skills for each employee)
          const skills = employeeSkills[empId] || [];
          const firstLetter = (displayName.charAt(0) || 'E').toUpperCase();

          return (
            <div key={empId} className="employee-card">
              <div className="card-header">
                <div className="employee-avatar">
                  {firstLetter}
                </div>
                <div className="employee-info">
                  <h3 className="employee-name">{displayName}</h3>
                  <p className="employee-id">ID: {empId}</p>
                </div>
              </div>

              <div className="card-body">
                {email && (
                  <div className="info-row">
                    <span className="label">📧 Email:</span>
                    <span className="value">{email}</span>
                  </div>
                )}

                {department && (
                  <div className="info-row">
                    <span className="label">🏢 Department:</span>
                    <span className="value">{department}</span>
                  </div>
                )}

                {position && (
                  <div className="info-row">
                    <span className="label">💼 Position:</span>
                    <span className="value">{position}</span>
                  </div>
                )}

                {experience && (
                  <div className="info-row">
                    <span className="label">📅 Experience:</span>
                    <span className="value">{experience} years</span>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="skills-section">
                  <p className="skills-label">Skills:</p>
                  <div className="skills-container">
                    {skills && skills.length > 0 ? (
                      skills.map((skill) => (
                        <span
                          key={skill}
                          className="skill-badge"
                          style={{ backgroundColor: getSkillColor(skill) }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="no-skills">No skills</span>
                    )}
                  </div>
                </div>
                <button
                  className="view-btn"
                  onClick={() => onViewEmployee && onViewEmployee(empId)}
                >
                  View Details →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EmployeeList;

