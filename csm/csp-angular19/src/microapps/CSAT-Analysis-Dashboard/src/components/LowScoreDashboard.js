import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Star, ChevronLeft, ChevronUp, ChevronDown, Download } from 'lucide-react';

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #f87171 0%, #fbbf24 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const HeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  position: relative;
  margin-top: 2rem;
  
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
    &:hover {
      background: #94a3b8;
    }
  }
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  table-layout: auto;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.875rem;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 150px;
  &:hover {
    background: #f1f5f9;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 150px;
`;

const ScoreCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #dc2626;
  vertical-align: top;
  background: #fef2f2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 150px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const InfoPanel = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #b91c1c;
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #7f1d1d;
  margin: 0;
  line-height: 1.5;
`;

const SortIcon = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] || '';
        const escapedValue = String(value).replace(/"/g, '""');
        return `"${escapedValue}"`;
      }).join(',')
    )
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const LowScoreDashboard = ({ data, onBackToDashboard }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Helper for 1,2,3
  const isLow = v => v === 1 || v === 2 || v === 3;
  // Helper for 0/empty/N/A
  const isZeroEmptyNA = v => v === 0 || v === null || v === undefined || v === '' || v === 'N/A';

  const columns = [
    { key: 'sno', label: 'SNO' },
    { key: 'prId', label: 'PrId' },
    { key: 'cusId', label: 'CusId' },
    { key: 'score', label: 'Score' },
    { key: 'category', label: 'Category' },
    { key: 'OVERALL_EXP', label: 'OVERALL_EXP' },
    { key: 'TIMELINE_ADHERENCE', label: 'TIMELINE_ADHERENCE' },
    { key: 'QUALITY_OF_DELIVERY', label: 'QUALITY_OF_DELIVERY' },
    { key: 'TIMELY_RESOURCE_FULFILLMENT', label: 'TIMELY_RESOURCE_FULFILLMENT' },
    { key: 'RISK_MANAGEMENT', label: 'RISK_MANAGEMENT' },
    { key: 'THOUGHT_LEADERSHIP', label: 'THOUGHT_LEADERSHIP' },
    { key: 'RESOURCE_COMPETENCY', label: 'RESOURCE_COMPETENCY' }
  ];

  const lowScoreProjects = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(row => {
      // Extract values
      const overallExp = row['OVERALL_EXP'];
      const timelineAdherence = row['TIMELINE_ADHERENCE'];
      const qualityOfDelivery = row['QUALITY_OF_DELIVERY'];
      const timelyResourceFulfillment = row['TIMELY_RESOURCE_FULFILLMENT'];
      const riskManagement = row['RISK_MANAGEMENT'];
      const thoughtLeadership = row['THOUGHT_LEADERSHIP'];
      const resourceCompetency = row['RESOURCE_COMPETENCY'];

      // Condition 1
      const cond1 = isLow(overallExp) && isLow(timelineAdherence) && isLow(qualityOfDelivery) && isLow(timelyResourceFulfillment) && isLow(riskManagement) && isLow(thoughtLeadership) && isZeroEmptyNA(resourceCompetency);
      // Condition 2
      const cond2 = isZeroEmptyNA(timelineAdherence) && isZeroEmptyNA(qualityOfDelivery) && isZeroEmptyNA(riskManagement) && isZeroEmptyNA(thoughtLeadership) && isLow(resourceCompetency) && isLow(timelyResourceFulfillment) && isLow(overallExp);
      return cond1 || cond2;
    }).map((row, index) => {
      // Extract values again for category
      const overallExp = row['OVERALL_EXP'];
      const timelineAdherence = row['TIMELINE_ADHERENCE'];
      const qualityOfDelivery = row['QUALITY_OF_DELIVERY'];
      const timelyResourceFulfillment = row['TIMELY_RESOURCE_FULFILLMENT'];
      const riskManagement = row['RISK_MANAGEMENT'];
      const thoughtLeadership = row['THOUGHT_LEADERSHIP'];
      const resourceCompetency = row['RESOURCE_COMPETENCY'];
      const cond1 = isLow(overallExp) && isLow(timelineAdherence) && isLow(qualityOfDelivery) && isLow(timelyResourceFulfillment) && isLow(riskManagement) && isLow(thoughtLeadership) && isZeroEmptyNA(resourceCompetency);
      const cond2 = isZeroEmptyNA(timelineAdherence) && isZeroEmptyNA(qualityOfDelivery) && isZeroEmptyNA(riskManagement) && isZeroEmptyNA(thoughtLeadership) && isLow(resourceCompetency) && isLow(timelyResourceFulfillment) && isLow(overallExp);
      // Calculate average score for the 7 columns
      const scores = [overallExp, timelineAdherence, qualityOfDelivery, timelyResourceFulfillment, riskManagement, thoughtLeadership, resourceCompetency];
      const validScores = scores.filter(v => typeof v === 'number' && !isNaN(v));
      const avgScore = validScores.length > 0 ? (validScores.reduce((sum, v) => sum + v, 0) / validScores.length).toFixed(2) : '0.00';
      return {
        sno: row['S No.'] || (index + 1),
        prId: row.proj_id || row.P_id || 'N/A',
        cusId: row.cust_id || row.C_id || 'N/A',
        score: avgScore,
        category: cond1 ? 'Condition 1' : 'Condition 2',
        OVERALL_EXP: row['OVERALL_EXP'],
        TIMELINE_ADHERENCE: row['TIMELINE_ADHERENCE'],
        QUALITY_OF_DELIVERY: row['QUALITY_OF_DELIVERY'],
        TIMELY_RESOURCE_FULFILLMENT: row['TIMELY_RESOURCE_FULFILLMENT'],
        RISK_MANAGEMENT: row['RISK_MANAGEMENT'],
        THOUGHT_LEADERSHIP: row['THOUGHT_LEADERSHIP'],
        RESOURCE_COMPETENCY: row['RESOURCE_COMPETENCY']
      };
    });
  }, [data]);

  // Sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ChevronUp size={12} style={{ opacity: 0.3 }} />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };
  const sortedData = useMemo(() => {
    if (!sortConfig.key || !lowScoreProjects) return lowScoreProjects || [];
    return [...lowScoreProjects].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';
      aValue = String(aValue);
      bValue = String(bValue);
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [lowScoreProjects, sortConfig]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Star size={48} style={{ marginBottom: '1rem', color: '#f87171' }} />
          <h3>No Customer Data Found</h3>
          <p>Upload Excel data to view Low Score analysis.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ flex: 1 }}>
            <HeaderTitle>
              <Star size={32} />
              Low Score Dashboard
            </HeaderTitle>
            <HeaderSubtitle>
              Projects with low ratings based on specified criteria
            </HeaderSubtitle>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DownloadButton
              onClick={() => downloadCSV(sortedData, 'low_score_dashboard.csv')}
              title="Download Low Score Dashboard as CSV"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              <Download size={16} /> Download
            </DownloadButton>
            <BackButton onClick={(e) => {
              e.preventDefault();
              onBackToDashboard();
            }}>
              <ChevronLeft size={20} />
              Back to Dashboard
            </BackButton>
          </div>
        </div>
      </DashboardHeader>

      <InfoPanel>
        <InfoTitle>Low Score Criteria</InfoTitle>
        <InfoText>
          <strong>Condition 1:</strong> OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP must be 1, 2, or 3, and RESOURCE_COMPETENCY must be 0, empty, or N/A.<br />
          <strong>Condition 2:</strong> TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, RISK_MANAGEMENT, THOUGHT_LEADERSHIP must be 0, empty, or N/A, and RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT, OVERALL_EXP must be 1, 2, or 3.
        </InfoText>
      </InfoPanel>

      {sortedData.length === 0 ? (
        <TableContainer>
          <EmptyState>
            <Star size={48} style={{ marginBottom: '1rem', color: '#f87171' }} />
            <h3>No Low Score Projects Found</h3>
            <p>No projects meet the Low Score criteria.</p>
          </EmptyState>
        </TableContainer>
      ) : (
        <TableContainer>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <Table>
              <TableHeader>
                <tr>
                  {columns.map(col => (
                    <TableHeaderCell
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {col.label}
                      <SortIcon>{getSortIcon(col.key)}</SortIcon>
                    </TableHeaderCell>
                  ))}
                </tr>
              </TableHeader>
              <TableBody>
                {sortedData.map((project, idx) => (
                  <TableRow key={`lowscore-${project.sno}-${idx}`}>
                    {columns.map(col =>
                      col.key === 'score' ? (
                        <ScoreCell key={col.key}>{project[col.key]}</ScoreCell>
                      ) : (
                        <TableCell key={col.key}>{project[col.key]}</TableCell>
                      )
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      )}
    </DashboardContainer>
  );
};

export default LowScoreDashboard;