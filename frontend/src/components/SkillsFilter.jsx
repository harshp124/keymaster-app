import { useState, useRef, useEffect } from 'react';
import './SkillsFilter.css';

function SkillsFilter({ allSkills, selectedSkills, onSkillsChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredSkills = allSkills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      onSkillsChange(selectedSkills.filter(s => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSkills.length === allSkills.length) {
      onSkillsChange([]);
    } else {
      onSkillsChange([...allSkills]);
    }
  };

  const handleClearAll = () => {
    onSkillsChange([]);
    setSearchTerm('');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="skills-filter">
      <div className="filter-header">
        <h2>Filter by Skills</h2>
        <p className="filter-description">
          Select one or more skills to find employees with ALL of them
        </p>
      </div>

      <div className="filter-container" ref={dropdownRef}>
        <div
          className="filter-input-wrapper"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="selected-skills">
            {selectedSkills.length === 0 ? (
              <span className="placeholder">Choose skills...</span>
            ) : (
              selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="skill-tag"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkillToggle(skill);
                  }}
                >
                  {skill}
                  <button className="remove-btn">×</button>
                </span>
              ))
            )}
          </div>
          <div className="dropdown-arrow">
            <span className={isOpen ? 'open' : ''}>▼</span>
          </div>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-search">
              <input
                type="text"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div className="dropdown-actions">
              <button
                className="action-btn"
                onClick={handleSelectAll}
              >
                {selectedSkills.length === allSkills.length ? '✓ Deselect All' : 'Select All'}
              </button>
              {selectedSkills.length > 0 && (
                <button
                  className="action-btn clear"
                  onClick={handleClearAll}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="dropdown-options">
              {filteredSkills.length === 0 ? (
                <div className="no-options">No skills found</div>
              ) : (
                filteredSkills.map(skill => (
                  <label key={skill} className="option">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                    />
                    <span className="option-label">{skill}</span>
                    <span className="option-icon">
                      {selectedSkills.includes(skill) ? '✓' : ''}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {selectedSkills.length > 0 && (
        <div className="filter-stats">
          <p>
            <strong>{selectedSkills.length}</strong> skill{selectedSkills.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );
}

export default SkillsFilter;

