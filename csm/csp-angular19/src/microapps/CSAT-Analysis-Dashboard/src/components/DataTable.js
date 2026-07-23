import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 10;
  
  &:hover {
    background: #f1f5f9;
  }
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8fafc;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  
  &:last-child {
    border-right: none;
  }
`;

const ScoreCell = styled(TableCell)`
  font-weight: 600;
  color: ${props => {
    if (props.score >= 4.5) return '#059669';
    if (props.score >= 4.0) return '#d97706';
    if (props.score >= 3.5) return '#dc2626';
    return '#6b7280';
  }};
`;

const CommentsCell = styled(TableCell)`
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  display: inline-block;
`;

const DataTable = ({ data, itemsPerPage = 20 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={14} style={{ opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (data.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <h3>No data available</h3>
          <p>Try adjusting your filters to see more results.</p>
        </EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableHeaderCell 
              onClick={() => handleSort('sno')}
              style={{ width: '80px' }}
            >
              SNO
              <SortIcon>{getSortIcon('sno')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('prId')}
              style={{ width: '120px' }}
            >
              Project ID
              <SortIcon>{getSortIcon('prId')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('cusId')}
              style={{ width: '120px' }}
            >
              Customer ID
              <SortIcon>{getSortIcon('cusId')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('score')}
              style={{ width: '80px' }}
            >
              Score
              <SortIcon>{getSortIcon('score')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell style={{ width: '300px' }}>
              Comments
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('account')}
              style={{ width: '180px' }}
            >
              Account
              <SortIcon>{getSortIcon('account')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('project')}
              style={{ width: '180px' }}
            >
              Project
              <SortIcon>{getSortIcon('project')}</SortIcon>
            </TableHeaderCell>
            <TableHeaderCell 
              onClick={() => handleSort('bu')}
              style={{ width: '180px' }}
            >
              Business Unit
              <SortIcon>{getSortIcon('bu')}</SortIcon>
            </TableHeaderCell>
          </tr>
        </TableHeader>
        <TableBody>
          {currentData.map((row) => (
            <TableRow key={row.sno}>
              <TableCell style={{ width: '80px' }}>{row.sno}</TableCell>
              <TableCell style={{ width: '120px' }}>{row.prId}</TableCell>
              <TableCell style={{ width: '120px' }}>{row.cusId}</TableCell>
              <ScoreCell score={row.score} style={{ width: '80px' }}>{row.score}</ScoreCell>
              <CommentsCell style={{ width: '300px' }}>{row.comments}</CommentsCell>
              <TableCell style={{ width: '180px' }}>{row.account}</TableCell>
              <TableCell style={{ width: '180px' }}>{row.project}</TableCell>
              <TableCell style={{ width: '180px' }}>{row.bu}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <PaginationContainer>
        <PaginationInfo>
          Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
        </PaginationInfo>
        
        <PaginationControls>
          <PaginationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </PaginationButton>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <PaginationButton
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? 'active' : ''}
            >
              {page}
            </PaginationButton>
          ))}
          
          <PaginationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </PaginationButton>
        </PaginationControls>
      </PaginationContainer>
    </TableContainer>
  );
};

export default DataTable;