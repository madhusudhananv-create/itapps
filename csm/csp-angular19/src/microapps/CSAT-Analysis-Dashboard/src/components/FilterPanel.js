import React from 'react';
import styled from 'styled-components';
import { Filter, X } from 'lucide-react';

const FilterContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const FilterHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  color: #374151;
  font-weight: 600;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:hover {
    border-color: #9ca3af;
  }
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const ActiveFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const FilterChip = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: #dbeafe;
  color: #1e40af;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const FilterPanel = ({ 
  selectedAccount, 
  selectedProject, 
  selectedBU, 
  onAccountChange, 
  onProjectChange, 
  onBUChange, 
  onClearFilters,
  accounts,
  projects,
  businessUnits 
}) => {
  const hasActiveFilters = selectedAccount || selectedProject || selectedBU;

  return (
    <FilterContainer>
      <FilterHeader>
        <Filter size={20} />
        <span>Filter Data</span>
      </FilterHeader>
      
      <FilterGrid>
        <FilterGroup>
          <FilterLabel htmlFor="account-select">Account</FilterLabel>
          <FilterSelect 
            id="account-select"
            name="account"
            aria-label="Select account to filter by"
            value={selectedAccount || ''} 
            onChange={(e) => onAccountChange(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map(account => (
              <option key={account} value={account}>{account}</option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="project-select">Project</FilterLabel>
          <FilterSelect 
            id="project-select"
            name="project"
            aria-label="Select project to filter by"
            value={selectedProject || ''} 
            onChange={(e) => onProjectChange(e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="bu-select">Business Unit</FilterLabel>
          <FilterSelect 
            id="bu-select"
            name="businessUnit"
            aria-label="Select business unit to filter by"
            value={selectedBU || ''} 
            onChange={(e) => onBUChange(e.target.value)}
          >
            <option value="">All Business Units</option>
            {businessUnits.map(bu => (
              <option key={bu} value={bu}>{bu}</option>
            ))}
          </FilterSelect>
        </FilterGroup>
      </FilterGrid>
      
      {hasActiveFilters && (
        <>
          <ClearFiltersButton 
          onClick={onClearFilters}
          aria-label="Clear all filters"
          title="Clear all filters"
        >
            <X size={16} />
            Clear All Filters
          </ClearFiltersButton>
          
          <ActiveFilters>
            {selectedAccount && (
              <FilterChip>
                Account: {selectedAccount}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => onAccountChange('')} />
              </FilterChip>
            )}
            {selectedProject && (
              <FilterChip>
                Project: {selectedProject}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => onProjectChange('')} />
              </FilterChip>
            )}
            {selectedBU && (
              <FilterChip>
                BU: {selectedBU}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => onBUChange('')} />
              </FilterChip>
            )}
          </ActiveFilters>
        </>
      )}
    </FilterContainer>
  );
};

export default FilterPanel; 