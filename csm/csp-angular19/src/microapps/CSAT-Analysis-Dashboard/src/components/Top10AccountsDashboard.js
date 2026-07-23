import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Star, Trophy, TrendingUp, Award, Target, ArrowLeft, Crown } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2rem;
  text-align: center;
`;

const HeaderTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #ecfdf5;
  border-bottom: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #10b981;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #065f46;
  font-weight: 500;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  
  /* Ensure horizontal scroll works properly */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
  table-layout: auto;
`;

const TableHeader = styled.thead`
  background: #ecfdf5;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #065f46;
  font-size: 0.875rem;
  border-bottom: 2px solid #10b981;
  border-right: 1px solid #10b981;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 300px;
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #ecfdf5;
  transition: background-color 0.2s;
  
  &:hover {
    background: #ecfdf5;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #ecfdf5;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 300px;
  
  &:last-child {
    border-right: none;
  }
`;

const ScoreCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #ecfdf5;
  text-align: center;
  font-weight: 600;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 300px;
  
  &:last-child {
    border-right: none;
  }
`;

const PerfectScoreCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  border-right: 1px solid #ecfdf5;
  background: #ecfdf5;
  color: #059669;
  white-space: normal;
  word-wrap: break-word;
  min-width: 120px;
  max-width: 300px;
  
  &:last-child {
    border-right: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const InfoPanel = styled.div`
  background: #ecfdf5;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #065f46;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const Top10AccountsDashboard = ({ data, onBackToDashboard }) => {
  // Process data to find accounts with all scores of 5
  const top10Accounts = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Group data by customer ID to analyze accounts
    const accountGroups = {};
    
    data.forEach((row, index) => {
      const custId = row.cust_id || row.C_id || 'N/A';
      const prId = row.proj_id || row.P_id || 'N/A';
      
      if (!accountGroups[custId]) {
        accountGroups[custId] = {
          custId,
          projects: [],
          totalProjects: 0,
          perfectScoreProjects: 0,
          averageScore: 0
        };
      }
      
      // Check if this project has all scores of 5
      const scoreColumns = [
        'OVERALL_EXP',
        'TIMELINE_ADHERENCE',
        'QUALITY_OF_DELIVERY',
        'TIMELY_RESOURCE_FULFILLMENT',
        'RISK_MANAGEMENT',
        'THOUGHT_LEADERSHIP',
        'RESOURCE_COMPETENCY'
      ];
      
      const scores = scoreColumns.map(col => {
        const value = row[col];
        return value && !isNaN(Number(value)) ? Number(value) : null;
      }).filter(score => score !== null);
      
      const hasAllScores = scores.length === scoreColumns.length;
      const allPerfectScores = hasAllScores && scores.every(score => score === 5);
      
      const projectData = {
        sno: row['S No.'] || (index + 1),
        prId,
        scores: scores,
        hasAllScores,
        allPerfectScores,
        scoreColumns: scoreColumns.map(col => ({ column: col, value: row[col] }))
      };
      
      accountGroups[custId].projects.push(projectData);
      accountGroups[custId].totalProjects++;
      
      if (allPerfectScores) {
        accountGroups[custId].perfectScoreProjects++;
      }
    });
    
    // Calculate account-level metrics
    Object.values(accountGroups).forEach(account => {
      const allScores = [];
      account.projects.forEach(project => {
        if (project.hasAllScores) {
          allScores.push(...project.scores);
        }
      });
      
      account.averageScore = allScores.length > 0 
        ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(2)
        : '0.00';
    });
    
    // Filter accounts that have at least one project with all perfect scores
    const accountsWithPerfectScores = Object.values(accountGroups)
      .filter(account => account.perfectScoreProjects > 0)
      .sort((a, b) => {
        // Sort by number of perfect score projects (descending)
        if (b.perfectScoreProjects !== a.perfectScoreProjects) {
          return b.perfectScoreProjects - a.perfectScoreProjects;
        }
        // Then by average score (descending)
        return parseFloat(b.averageScore) - parseFloat(a.averageScore);
      })
      .slice(0, 20); // Get top 20
    
    return accountsWithPerfectScores;
  }, [data]);

  const stats = useMemo(() => {
    if (top10Accounts.length === 0) {
      return {
        totalAccounts: 0,
        totalPerfectProjects: 0,
        averagePerfectProjects: 0,
        highestPerfectProjects: 0
      };
    }

    const totalPerfectProjects = top10Accounts.reduce((sum, account) => sum + account.perfectScoreProjects, 0);
    const averagePerfectProjects = (totalPerfectProjects / top10Accounts.length).toFixed(1);
    const highestPerfectProjects = Math.max(...top10Accounts.map(account => account.perfectScoreProjects));

    return {
      totalAccounts: top10Accounts.length,
      totalPerfectProjects,
      averagePerfectProjects,
      highestPerfectProjects
    };
  }, [top10Accounts]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Award size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
          <h3>No Customer Data Found</h3>
          <p>Upload Excel data to view Top 10 Accounts analysis.</p>
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
              <Crown size={32} />
              Top 10 Accounts - Perfect 5 Scores
            </HeaderTitle>
            <HeaderSubtitle>
              Accounts with projects achieving perfect scores (5) across all rating categories
            </HeaderSubtitle>
          </div>
          {onBackToDashboard && (
            <BackButton 
              onClick={(e) => {
                console.log('Back button clicked in Top10AccountsDashboard');
                e.preventDefault();
                onBackToDashboard();
              }}
              aria-label="Back to dashboard"
              title="Back to dashboard"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </BackButton>
          )}
        </div>
      </DashboardHeader>

      <InfoPanel>
        <strong>🏆 Perfect 5 Score Criteria:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>Perfect Score:</strong> All rating categories (OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP, RESOURCE_COMPETENCY) must have a score of 5.</p>
          <p><strong>Account Ranking:</strong> Ranked by number of perfect score projects, then by average score.</p>
          <p><strong>Display:</strong> Top 10 accounts with the highest number of perfect score projects.</p>
        </div>
      </InfoPanel>

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalAccounts}</StatValue>
          <StatLabel>Top Accounts</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.totalPerfectProjects}</StatValue>
          <StatLabel>Perfect Score Projects</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averagePerfectProjects}</StatValue>
          <StatLabel>Avg Perfect Projects/Account</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.highestPerfectProjects}</StatValue>
          <StatLabel>Highest Perfect Projects</StatLabel>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        <Table role="table" aria-label="Top 10 Accounts with Perfect 5 Scores">
          <TableHeader>
            <tr>
              <TableHeaderCell scope="col" style={{ width: '80px', minWidth: '80px' }}>Rank</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px', minWidth: '120px' }}>Customer ID</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '100px', minWidth: '100px' }}>Total Projects</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px', minWidth: '120px' }}>Perfect Score Projects</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '100px', minWidth: '100px' }}>Average Score</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '200px', minWidth: '200px' }}>Perfect Score Project IDs</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '300px', minWidth: '300px' }}>Score Breakdown</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {top10Accounts.map((account, index) => {
              const perfectProjects = account.projects.filter(p => p.allPerfectScores);
              const perfectProjectIds = perfectProjects.map(p => p.prId).join(', ');
              
              return (
                <TableRow key={index}>
                  <TableCell>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Crown size={16} color={index < 3 ? "#fbbf24" : "#10b981"} />
                      {index + 1}
                    </div>
                  </TableCell>
                  <TableCell>{account.custId}</TableCell>
                  <ScoreCell>{account.totalProjects}</ScoreCell>
                  <PerfectScoreCell>{account.perfectScoreProjects}</PerfectScoreCell>
                  <ScoreCell>{account.averageScore}</ScoreCell>
                  <TableCell style={{ fontSize: '0.75rem', wordBreak: 'break-word' }}>
                    {perfectProjectIds || 'None'}
                  </TableCell>
                  <TableCell style={{ fontSize: '0.75rem' }}>
                    {perfectProjects.length > 0 ? (
                      <div>
                        <strong>Perfect Score Projects:</strong> {perfectProjects.length}
                        <br />
                        <strong>Score Categories:</strong> All 7 categories = 5
                      </div>
                    ) : (
                      'No perfect score projects'
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {top10Accounts.length === 0 && (
        <EmptyState>
          <Target size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
          <h3>No Perfect Score Accounts Found</h3>
          <p>No accounts have projects with perfect scores (5) across all rating categories.</p>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default Top10AccountsDashboard; 