import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Trophy, Star, ChevronLeft, ChevronUp, ChevronDown, Download } from 'lucide-react';

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  border-left: 4px solid #667eea;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  position: relative;
  
  /* Custom scrollbar styling */
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
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
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
  color: #059669;
  vertical-align: top;
  background: #f0fdf4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 150px;
`;

const CategoryCell = styled.td`
  padding: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  vertical-align: top;
  background: #f0f9ff;
  text-align: center;
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
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
`;

const InfoTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #0369a1;
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #0c4a6e;
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
  font-size: 0.8rem;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
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

const Perfect5RaterDashboard = ({ data, onBackToDashboard, onSwitchToTop10Accounts }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const perfect5Projects = useMemo(() => {
    if (!data || data.length === 0) return [];

    const projectData = data.filter(row => {
      // Check if row has a valid S No.
      const sno = row['S No.'];
      if (!sno || sno === '' || sno === null || sno === undefined) {
        return false;
      }
      
      // Check if row has any meaningful data
      return Object.values(row).some(value => 
        value !== undefined && 
        value !== null && 
        value !== '' && 
        value !== 'N/A'
      );
    });

    const perfect5Projects = [];

    projectData.forEach((row, index) => {
      // Get all score values
      const overallExp = parseFloat(row['OVERALL_EXP']) || 0;
      const timelineAdherence = parseFloat(row['TIMELINE_ADHERENCE']) || 0;
      const qualityOfDelivery = parseFloat(row['QUALITY_OF_DELIVERY']) || 0;
      const timelyResourceFulfillment = parseFloat(row['TIMELY_RESOURCE_FULFILLMENT']) || 0;
      const riskManagement = parseFloat(row['RISK_MANAGEMENT']) || 0;
      const thoughtLeadership = parseFloat(row['THOUGHT_LEADERSHIP']) || 0;
      const resourceCompetency = parseFloat(row['RESOURCE_COMPETENCY']) || 0;

      // Calculate average score
      const scores = [overallExp, timelineAdherence, qualityOfDelivery, timelyResourceFulfillment, riskManagement, thoughtLeadership, resourceCompetency];
      const validScores = scores.filter(score => score > 0);
      const avgScore = validScores.length > 0 ? (validScores.reduce((sum, score) => sum + score, 0) / validScores.length).toFixed(2) : '0.00';

      // Check Criteria 1: All 5s except RESOURCE_COMPETENCY (should be 0, empty, or N/A)
      const criteria1Met = overallExp === 5 && 
                          timelineAdherence === 5 && 
                          qualityOfDelivery === 5 && 
                          timelyResourceFulfillment === 5 && 
                          riskManagement === 5 && 
                          thoughtLeadership === 5 && 
                          (resourceCompetency === 0 || resourceCompetency === null || resourceCompetency === undefined || resourceCompetency === '' || resourceCompetency === 'N/A');

      // Check Criteria 2: RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT, and OVERALL_EXP are 5, others are 0, empty, or N/A
      const criteria2Met = (timelineAdherence === 0 || timelineAdherence === null || timelineAdherence === undefined || timelineAdherence === '' || timelineAdherence === 'N/A') &&
                          (qualityOfDelivery === 0 || qualityOfDelivery === null || qualityOfDelivery === undefined || qualityOfDelivery === '' || qualityOfDelivery === 'N/A') &&
                          (riskManagement === 0 || riskManagement === null || riskManagement === undefined || riskManagement === '' || riskManagement === 'N/A') &&
                          (thoughtLeadership === 0 || thoughtLeadership === null || thoughtLeadership === undefined || thoughtLeadership === '' || thoughtLeadership === 'N/A') &&
                          resourceCompetency === 5 && 
                          timelyResourceFulfillment === 5 &&
                          overallExp === 5;

      if (criteria1Met || criteria2Met) {
        perfect5Projects.push({
          sno: row['S No.'] || (index + 1),
          prId: row.proj_id || row.P_id || 'N/A',
          cusId: row.cust_id || row.C_id || 'N/A',
          score: avgScore,
          category: criteria1Met ? 'Category 1' : 'Category 2',
          overallExp,
          timelineAdherence,
          qualityOfDelivery,
          timelyResourceFulfillment,
          riskManagement,
          thoughtLeadership,
          resourceCompetency,
          rank: 0 // Will be set after sorting
        });
      }
    });

    // Sort by average score (highest first) and get top projects
    const sortedProjects = perfect5Projects
      .sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
      .map((project, index) => ({
        ...project,
        rank: index + 1
      }));

    return sortedProjects;
  }, [data]);

  const stats = useMemo(() => {
    if (perfect5Projects.length === 0) {
      return {
        totalProjects: 0,
        category1Count: 0,
        category2Count: 0,
        averageScore: 0
      };
    }

    const category1Count = perfect5Projects.filter(p => p.category === 'Category 1').length;
    const category2Count = perfect5Projects.filter(p => p.category === 'Category 2').length;
    const averageScore = perfect5Projects.reduce((sum, p) => sum + parseFloat(p.score), 0) / perfect5Projects.length;

    return {
      totalProjects: perfect5Projects.length,
      category1Count,
      category2Count,
      averageScore: averageScore.toFixed(2)
    };
  }, [perfect5Projects]);

  // Sorting functions
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
    if (!sortConfig.key || !perfect5Projects) return perfect5Projects || [];

    return [...perfect5Projects].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

      // Convert to strings for consistent comparison
      aValue = String(aValue);
      bValue = String(bValue);

      // Handle numeric values (check if they are actually numbers)
      const aNum = parseFloat(aValue);
      const bNum = parseFloat(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Handle string values (case-insensitive)
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
  }, [perfect5Projects, sortConfig]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Star size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
          <h3>No Customer Data Found</h3>
          <p>Upload Excel data to view Perfect-5 Rater (Score-Based) analysis.</p>
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
              Perfect-5 Rater (Score-Based) Dashboard
            </HeaderTitle>
            <HeaderSubtitle>
              Projects with perfect 5 ratings based on specific criteria combinations
            </HeaderSubtitle>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {onSwitchToTop10Accounts && (
              <DownloadButton
                onClick={() => onSwitchToTop10Accounts()}
                title="Go to Top 10 Accounts - Perfect 5 Scores"
                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              >
                <Trophy size={16} /> Top 10 Accounts
              </DownloadButton>
            )}
            <DownloadButton
              onClick={() => downloadCSV(sortedData, 'perfect_5_rater_score_based_dashboard.csv')}
              title="Download Perfect-5 Rater (Score-Based) Dashboard as CSV"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
            >
              <Download size={16} /> Download
            </DownloadButton>
            <BackButton onClick={(e) => {
              console.log('Back button clicked');
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
        <InfoTitle>Perfect-5 Rater (Score-Based) Criteria</InfoTitle>
        <InfoText>
          <strong>Category 1:</strong> All columns (OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP) must be 5, while RESOURCE_COMPETENCY must be 0, empty, or N/A.
          <br />
          <strong>Category 2:</strong> RESOURCE_COMPETENCY, TIMELY_RESOURCE_FULFILLMENT, and OVERALL_EXP must be 5, while TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, RISK_MANAGEMENT, and THOUGHT_LEADERSHIP must be 0, empty, or N/A.
        </InfoText>
      </InfoPanel>

      <StatsContainer>
        <StatCard>
          <StatNumber>{stats.totalProjects}</StatNumber>
          <StatLabel>Total Perfect-5 Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.category1Count}</StatNumber>
          <StatLabel>Category 1 Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.category2Count}</StatNumber>
          <StatLabel>Category 2 Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.averageScore}</StatNumber>
          <StatLabel>Average Score</StatLabel>
        </StatCard>
      </StatsContainer>

      {perfect5Projects.length === 0 ? (
        <TableContainer>
          <EmptyState>
            <Star size={48} style={{ marginBottom: '1rem', color: '#f59e0b' }} />
            <h3>No Perfect-5 Projects Found</h3>
            <p>No projects meet the Perfect-5 Rater (Score-Based) criteria.</p>
          </EmptyState>
        </TableContainer>
      ) : (
        <TableContainer>
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell onClick={() => handleSort('rank')} style={{ cursor: 'pointer', position: 'relative' }}>
                    Rank
                    <SortIcon>{getSortIcon('rank')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('sno')} style={{ cursor: 'pointer', position: 'relative' }}>
                    SNO
                    <SortIcon>{getSortIcon('sno')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('prId')} style={{ cursor: 'pointer', position: 'relative' }}>
                    PrId
                    <SortIcon>{getSortIcon('prId')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('cusId')} style={{ cursor: 'pointer', position: 'relative' }}>
                    CusId
                    <SortIcon>{getSortIcon('cusId')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('score')} style={{ cursor: 'pointer', position: 'relative' }}>
                    Score
                    <SortIcon>{getSortIcon('score')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('category')} style={{ cursor: 'pointer', position: 'relative' }}>
                    Category
                    <SortIcon>{getSortIcon('category')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('overallExp')} style={{ cursor: 'pointer', position: 'relative' }}>
                    OVERALL_EXP
                    <SortIcon>{getSortIcon('overallExp')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('timelineAdherence')} style={{ cursor: 'pointer', position: 'relative' }}>
                    TIMELINE_ADHERENCE
                    <SortIcon>{getSortIcon('timelineAdherence')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('qualityOfDelivery')} style={{ cursor: 'pointer', position: 'relative' }}>
                    QUALITY_OF_DELIVERY
                    <SortIcon>{getSortIcon('qualityOfDelivery')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('timelyResourceFulfillment')} style={{ cursor: 'pointer', position: 'relative' }}>
                    TIMELY_RESOURCE_FULFILLMENT
                    <SortIcon>{getSortIcon('timelyResourceFulfillment')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('riskManagement')} style={{ cursor: 'pointer', position: 'relative' }}>
                    RISK_MANAGEMENT
                    <SortIcon>{getSortIcon('riskManagement')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('thoughtLeadership')} style={{ cursor: 'pointer', position: 'relative' }}>
                    THOUGHT_LEADERSHIP
                    <SortIcon>{getSortIcon('thoughtLeadership')}</SortIcon>
                  </TableHeaderCell>
                  <TableHeaderCell onClick={() => handleSort('resourceCompetency')} style={{ cursor: 'pointer', position: 'relative' }}>
                    RESOURCE_COMPETENCY
                    <SortIcon>{getSortIcon('resourceCompetency')}</SortIcon>
                  </TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {sortedData.map((project) => (
                  <TableRow key={`perfect5-${project.sno}`}>
                    <TableCell>{project.rank}</TableCell>
                    <TableCell>{project.sno}</TableCell>
                    <TableCell>{project.prId}</TableCell>
                    <TableCell>{project.cusId}</TableCell>
                    <ScoreCell>{project.score}</ScoreCell>
                    <CategoryCell>{project.category}</CategoryCell>
                    <TableCell>{project.overallExp}</TableCell>
                    <TableCell>{project.timelineAdherence}</TableCell>
                    <TableCell>{project.qualityOfDelivery}</TableCell>
                    <TableCell>{project.timelyResourceFulfillment}</TableCell>
                    <TableCell>{project.riskManagement}</TableCell>
                    <TableCell>{project.thoughtLeadership}</TableCell>
                    <TableCell>{project.resourceCompetency}</TableCell>
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

export default Perfect5RaterDashboard; 