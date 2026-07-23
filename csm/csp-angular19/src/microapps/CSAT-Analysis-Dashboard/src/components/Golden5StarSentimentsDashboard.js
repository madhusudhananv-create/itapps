import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Star, Trophy, MessageCircle, Heart, Award, Target, ArrowLeft } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
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
  background: #fce7f3;
  border-bottom: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #ec4899;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #ec4899;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #be185d;
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
  min-width: 1000px;
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background: #fce7f3;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #be185d;
  font-size: 0.875rem;
  border-bottom: 2px solid #ec4899;
  border-right: 1px solid #ec4899;
  white-space: nowrap;
  
  &:last-child {
    border-right: none;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #fce7f3;
  transition: background-color 0.2s;
  
  &:hover {
    background: #fce7f3;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #fce7f3;
  
  &:last-child {
    border-right: none;
  }
`;

const ScoreCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #fce7f3;
  text-align: center;
  font-weight: 600;
  
  &:last-child {
    border-right: none;
  }
`;

const Golden5StarCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 700;
  text-align: center;
  border-right: 1px solid #fce7f3;
  background: #fce7f3;
  color: #be185d;
  
  &:last-child {
    border-right: none;
  }
`;

const CommentCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #fce7f3;
  min-width: 250px;
  max-width: 300px;
  word-wrap: break-word;
  white-space: normal;
  
  &:last-child {
    border-right: none;
  }
`;

const SentimentTag = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    if (props.sentiment === 'positive') return '#d1fae5';
    if (props.sentiment === 'negative') return '#fee2e2';
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.sentiment === 'positive') return '#065f46';
    if (props.sentiment === 'negative') return '#991b1b';
    return '#6b7280';
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const InfoPanel = styled.div`
  background: #fce7f3;
  border: 1px solid #ec4899;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #be185d;
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

const Golden5StarSentimentsDashboard = ({ data, onBackToDashboard }) => {
  // Process and analyze Golden 5 Star accounts based on sentiments
  const golden5StarAccounts = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Group data by cust_id to analyze accounts
    const accountGroups = {};
    
    data.forEach(row => {
      const custId = row.cust_id || 'Unknown';
      if (!accountGroups[custId]) {
        accountGroups[custId] = [];
      }
      accountGroups[custId].push(row);
    });

    // Analyze each account for Golden 5 Star criteria based on sentiments
    const accountAnalysis = Object.entries(accountGroups).map(([custId, rows]) => {
      // Analyze comments for sentiment
      let positiveComments = 0;
      let negativeComments = 0;
      let neutralComments = 0;
      let totalComments = 0;
      let positiveWords = 0;
      let negativeWords = 0;
      let neutralWords = 0;
      let totalWords = 0;
      
      const positiveKeywords = [
        'excellent', 'fantastic', 'great', 'good', 'satisfied', 'happy', 'pleased', 
        'outstanding', 'amazing', 'wonderful', 'perfect', 'confident', 'proactive',
        'skilled', 'competent', 'reliable', 'timely', 'quality', 'professional'
      ];
      
      const negativeKeywords = [
        'poor', 'bad', 'terrible', 'disappointed', 'unhappy', 'dissatisfied',
        'replacement', 'concern', 'issue', 'problem', 'delay', 'late', 'missing',
        'incompetent', 'unskilled', 'unreliable', 'slow', 'low quality'
      ];

      rows.forEach(row => {
        // Analyze TIMELY_RESOURCE_FULFILLMENT_COMMENTS
        if (row.TIMELY_RESOURCE_FULFILLMENT_COMMENTS) {
          totalComments++;
          const comment = row.TIMELY_RESOURCE_FULFILLMENT_COMMENTS.toLowerCase();
          const words = comment.split(/\s+/);
          totalWords += words.length;
          
          let commentSentiment = 'neutral';
          let positiveCount = 0;
          let negativeCount = 0;
          
          words.forEach(word => {
            if (positiveKeywords.includes(word)) {
              positiveCount++;
              positiveWords++;
            } else if (negativeKeywords.includes(word)) {
              negativeCount++;
              negativeWords++;
            } else {
              neutralWords++;
            }
          });
          
          if (positiveCount > negativeCount) {
            commentSentiment = 'positive';
            positiveComments++;
          } else if (negativeCount > positiveCount) {
            commentSentiment = 'negative';
            negativeComments++;
          } else {
            neutralComments++;
          }
        }
        
        // Analyze RESOURCE_COMPETENCY_COMMENTS
        if (row.RESOURCE_COMPETENCY_COMMENTS) {
          totalComments++;
          const comment = row.RESOURCE_COMPETENCY_COMMENTS.toLowerCase();
          const words = comment.split(/\s+/);
          totalWords += words.length;
          
          let commentSentiment = 'neutral';
          let positiveCount = 0;
          let negativeCount = 0;
          
          words.forEach(word => {
            if (positiveKeywords.includes(word)) {
              positiveCount++;
              positiveWords++;
            } else if (negativeKeywords.includes(word)) {
              negativeCount++;
              negativeWords++;
            } else {
              neutralWords++;
            }
          });
          
          if (positiveCount > negativeCount) {
            commentSentiment = 'positive';
            positiveComments++;
          } else if (negativeCount > positiveCount) {
            commentSentiment = 'negative';
            negativeComments++;
          } else {
            neutralComments++;
          }
        }
      });
      
      // Calculate sentiment scores
      const positiveSentimentRatio = totalComments > 0 ? positiveComments / totalComments : 0;
      const negativeSentimentRatio = totalComments > 0 ? negativeComments / totalComments : 0;
      const positiveWordRatio = totalWords > 0 ? positiveWords / totalWords : 0;
      const negativeWordRatio = totalWords > 0 ? negativeWords / totalWords : 0;
      
      // Calculate compound sentiment score (-1 to 1)
      const compoundSentiment = (positiveSentimentRatio - negativeSentimentRatio) * 0.7 + 
                               (positiveWordRatio - negativeWordRatio) * 0.3;
      
      // Golden 5 Star Criteria Scoring based on sentiments
      let golden5Score = 0;
      let criteria = [];
      
      // Criterion 1: Positive Sentiment Ratio (35% weight)
      if (positiveSentimentRatio >= 0.8) {
        golden5Score += 35;
        criteria.push('Excellent Sentiment (≥80% positive)');
      } else if (positiveSentimentRatio >= 0.6) {
        golden5Score += 25;
        criteria.push('Very Good Sentiment (≥60% positive)');
      } else if (positiveSentimentRatio >= 0.4) {
        golden5Score += 15;
        criteria.push('Good Sentiment (≥40% positive)');
      } else {
        criteria.push('Poor Sentiment (<40% positive)');
      }
      
      // Criterion 2: Compound Sentiment Score (30% weight)
      if (compoundSentiment >= 0.5) {
        golden5Score += 30;
        criteria.push('Excellent Compound Score (≥0.5)');
      } else if (compoundSentiment >= 0.3) {
        golden5Score += 20;
        criteria.push('Very Good Compound Score (≥0.3)');
      } else if (compoundSentiment >= 0.1) {
        golden5Score += 10;
        criteria.push('Good Compound Score (≥0.1)');
      } else {
        criteria.push('Poor Compound Score (<0.1)');
      }
      
      // Criterion 3: Comment Volume and Engagement (20% weight)
      if (totalComments >= 4) {
        golden5Score += 20;
        criteria.push('High Engagement (≥4 comments)');
      } else if (totalComments >= 2) {
        golden5Score += 15;
        criteria.push('Good Engagement (≥2 comments)');
      } else if (totalComments >= 1) {
        golden5Score += 10;
        criteria.push('Moderate Engagement (≥1 comment)');
      } else {
        criteria.push('Low Engagement (no comments)');
      }
      
      // Criterion 4: No Negative Comments (15% weight)
      if (negativeComments === 0 && totalComments > 0) {
        golden5Score += 15;
        criteria.push('No Negative Comments');
      } else if (negativeSentimentRatio <= 0.2) {
        golden5Score += 10;
        criteria.push('Minimal Negative Comments (≤20%)');
      } else {
        criteria.push('Has Negative Comments (>20%)');
      }
      
      // Determine Golden 5 Star Status
      let golden5StarStatus = 'Basic 1 Star';
      if (golden5Score >= 85) {
        golden5StarStatus = 'Golden 5 Star';
      } else if (golden5Score >= 70) {
        golden5StarStatus = 'Silver 4 Star';
      } else if (golden5Score >= 55) {
        golden5StarStatus = 'Bronze 3 Star';
      } else if (golden5Score >= 40) {
        golden5StarStatus = 'Standard 2 Star';
      }
      
      // Get sample comments
      const sampleComments = rows
        .filter(row => row.TIMELY_RESOURCE_FULFILLMENT_COMMENTS || row.RESOURCE_COMPETENCY_COMMENTS)
        .slice(0, 2)
        .map(row => row.TIMELY_RESOURCE_FULFILLMENT_COMMENTS || row.RESOURCE_COMPETENCY_COMMENTS)
        .join('; ');
      
      return {
        custId,
        projectCount: rows.length,
        totalComments,
        positiveComments,
        negativeComments,
        neutralComments,
        positiveSentimentRatio: (positiveSentimentRatio * 100).toFixed(1) + '%',
        negativeSentimentRatio: (negativeSentimentRatio * 100).toFixed(1) + '%',
        compoundSentiment: compoundSentiment.toFixed(3),
        golden5Score,
        golden5StarStatus,
        criteria: criteria.join('; '),
        sampleComments: sampleComments.substring(0, 150) + (sampleComments.length > 150 ? '...' : ''),
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by Golden 5 Star score (highest first) and get top 5
    const sortedAccounts = accountAnalysis
      .sort((a, b) => b.golden5Score - a.golden5Score)
      .slice(0, 5)
      .map((account, index) => ({
        ...account,
        rank: index + 1
      }));

    return sortedAccounts;
  }, [data]);

  const stats = useMemo(() => {
    if (golden5StarAccounts.length === 0) {
      return {
        totalAccounts: 0,
        golden5StarCount: 0,
        silver4StarCount: 0,
        bronze3StarCount: 0,
        averageSentiment: 0
      };
    }

    const golden5StarCount = golden5StarAccounts.filter(a => a.golden5StarStatus === 'Golden 5 Star').length;
    const silver4StarCount = golden5StarAccounts.filter(a => a.golden5StarStatus === 'Silver 4 Star').length;
    const bronze3StarCount = golden5StarAccounts.filter(a => a.golden5StarStatus === 'Bronze 3 Star').length;
    const averageSentiment = golden5StarAccounts.reduce((sum, a) => sum + parseFloat(a.compoundSentiment), 0) / golden5StarAccounts.length;

    return {
      totalAccounts: golden5StarAccounts.length,
      golden5StarCount,
      silver4StarCount,
      bronze3StarCount,
      averageSentiment: averageSentiment.toFixed(3)
    };
  }, [golden5StarAccounts]);

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <MessageCircle size={48} style={{ marginBottom: '1rem', color: '#ec4899' }} />
          <h3>No Customer Data Found</h3>
          <p>Upload Excel data to view Golden 5 Star sentiment analysis.</p>
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
              <Heart size={32} />
              Golden 5 Star Sentiments-Based Dashboard
            </HeaderTitle>
            <HeaderSubtitle>
              Top 5 accounts ranked by Golden 5 Star criteria based on sentiment analysis
            </HeaderSubtitle>
          </div>
          {onBackToDashboard && (
            <BackButton 
              onClick={(e) => {
                console.log('Back button clicked in Golden5StarSentimentsDashboard');
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
        <strong>💖 Golden 5 Star Criteria (Sentiments-Based):</strong>
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>Positive Sentiment Ratio (35%):</strong> Excellent (≥80%), Very Good (≥60%), Good (≥40%)</p>
          <p><strong>Compound Sentiment Score (30%):</strong> Excellent (≥0.5), Very Good (≥0.3), Good (≥0.1)</p>
          <p><strong>Comment Volume & Engagement (20%):</strong> High (≥4 comments), Good (≥2), Moderate (≥1)</p>
          <p><strong>No Negative Comments (15%):</strong> No negative comments or minimal (≤20%)</p>
          <p><strong>Golden 5 Star Threshold:</strong> ≥85 points</p>
        </div>
      </InfoPanel>

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalAccounts}</StatValue>
          <StatLabel>Top Accounts</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.golden5StarCount}</StatValue>
          <StatLabel>Golden 5 Star</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.silver4StarCount}</StatValue>
          <StatLabel>Silver 4 Star</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.bronze3StarCount}</StatValue>
          <StatLabel>Bronze 3 Star</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageSentiment}</StatValue>
          <StatLabel>Avg Sentiment</StatLabel>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        <Table role="table" aria-label="Golden 5 Star Sentiment Analysis">
          <TableHeader>
            <tr>
              <TableHeaderCell scope="col" style={{ width: '80px' }}>Rank</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px' }}>Customer ID</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '100px' }}>Projects</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '100px' }}>Comments</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px' }}>Positive %</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px' }}>Negative %</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px' }}>Compound Score</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '100px' }}>Golden 5 Score</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '120px' }}>Status</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '300px' }}>Sample Comments</TableHeaderCell>
              <TableHeaderCell scope="col" style={{ width: '300px' }}>Criteria Met</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {golden5StarAccounts.map((account, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} color={account.rank <= 3 ? "#fbbf24" : "#ec4899"} />
                    {account.rank}
                  </div>
                </TableCell>
                <TableCell>{account.custId}</TableCell>
                <ScoreCell>{account.projectCount}</ScoreCell>
                <ScoreCell>{account.totalComments}</ScoreCell>
                <ScoreCell style={{ color: '#065f46' }}>{account.positiveSentimentRatio}</ScoreCell>
                <ScoreCell style={{ color: '#991b1b' }}>{account.negativeSentimentRatio}</ScoreCell>
                <ScoreCell>{account.compoundSentiment}</ScoreCell>
                <ScoreCell>{account.golden5Score}</ScoreCell>
                <Golden5StarCell>{account.golden5StarStatus}</Golden5StarCell>
                <CommentCell>{account.sampleComments}</CommentCell>
                <TableCell style={{ fontSize: '0.75rem' }}>{account.criteria}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {golden5StarAccounts.length === 0 && (
        <EmptyState>
          <Target size={48} style={{ marginBottom: '1rem', color: '#ec4899' }} />
          <h3>No Golden 5 Star Accounts Found</h3>
          <p>No accounts meet the Golden 5 Star criteria based on sentiment analysis.</p>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default Golden5StarSentimentsDashboard; 