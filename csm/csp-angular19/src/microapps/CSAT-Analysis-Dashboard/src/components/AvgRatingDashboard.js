import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Star, Trophy, TrendingUp, Award, Calculator, ChevronLeft } from 'lucide-react';

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
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const StatCard = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  
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
  border-right: 1px solid #f1f5f9;
  
  &:last-child {
    border-right: none;
  }
`;

const ScoreCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  text-align: center;
  font-weight: 600;
  
  &:last-child {
    border-right: none;
  }
`;

const StarCell = styled.td`
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  text-align: center;
  
  &:last-child {
    border-right: none;
  }
`;

const StarIcon = styled.span`
  color: #fbbf24;
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const InfoPanel = styled.div`
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #065f46;
`;

const WarningPanel = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #92400e;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

const AvgRatingDashboard = ({ data, onBack }) => {
  // Process and calculate average ratings
  const ratedCustomers = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Calculate average rating for each customer based on available columns
    const customersWithAvgRating = data
      .filter(customer => {
        // Only include customers with at least one valid score
        const hasValidScore = (
          (customer.RESOURCE_COMPETENCY !== undefined && customer.RESOURCE_COMPETENCY !== null && customer.RESOURCE_COMPETENCY !== '')
        );
        return hasValidScore;
      })
      .map(customer => {
        // Calculate average rating from available columns
        const scores = [];
        
        if (customer.RESOURCE_COMPETENCY !== undefined && customer.RESOURCE_COMPETENCY !== null && customer.RESOURCE_COMPETENCY !== '') {
          scores.push(Number(customer.RESOURCE_COMPETENCY) || 0);
        }
        

        
        const avgRating = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : 0;
        
        return {
          ...customer,
          avgRating: parseFloat(avgRating),
          rank: 0 // Will be set after sorting
        };
      });

    // Sort by average rating (highest first) and add ranking
    const sortedCustomers = customersWithAvgRating
      .sort((a, b) => b.avgRating - a.avgRating)
      .map((customer, index) => ({
        ...customer,
        rank: index + 1
      }));

    return sortedCustomers.slice(0, 20); // Return top 20
  }, [data]);

  const stats = useMemo(() => {
    if (ratedCustomers.length === 0) {
      return {
        totalCustomers: 0,
        averageRating: 0,
        topRating: 0,
        fiveStarCustomers: 0
      };
    }

    const ratings = ratedCustomers.map(c => c.avgRating);
    const fiveStarCount = ratedCustomers.filter(c => c.avgRating >= 4.5).length;

    return {
      totalCustomers: ratedCustomers.length,
      averageRating: (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2),
      topRating: Math.max(...ratings).toFixed(2),
      fiveStarCustomers: fiveStarCount
    };
  }, [ratedCustomers]);

  const getCustomerId = (customer) => {
    return customer.CUST_ID || customer.C_id || customer.Test_C_Id || customer.CID || customer.CusId || customer.CustomerID || customer.Customer_Id || 'N/A';
  };

  const getProjectId = (customer) => {
    return customer.proj_id || customer.P_id || customer.Test_P_Id || customer.PID || customer.PrId || customer.ProjectID || customer.Project_Id || 'N/A';
  };

  const getSerialNumber = (customer) => {
    return customer['S No.'] || customer.S_No || customer.SNo || customer.SNO || customer.id || 'N/A';
  };

  const getScoreDisplay = (rating) => {
    const numRating = parseFloat(rating);
    if (numRating >= 4.5) return '★★★★★';
    if (numRating >= 3.5) return '★★★★☆';
    if (numRating >= 2.5) return '★★★☆☆';
    if (numRating >= 1.5) return '★★☆☆☆';
    if (numRating >= 0.5) return '★☆☆☆☆';
    return '☆☆☆☆☆';
  };

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Calculator size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
          <h3>No Customer Data Found</h3>
          <p>Upload Excel data to view average rating calculations.</p>
        </EmptyState>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}></div>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <HeaderTitle>
              <Calculator size={32} />
              Average Rating Dashboard
            </HeaderTitle>
            <HeaderSubtitle>
              Customers ranked by calculated average ratings
            </HeaderSubtitle>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {onBack && (
              <BackButton onClick={onBack} aria-label="Back" title="Back">
                <ChevronLeft size={16} />
                Back
              </BackButton>
            )}
          </div>
        </div>
      </DashboardHeader>

      <WarningPanel>
        <strong>⚠️ Limited Data Available:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>Available Columns:</strong> RESOURCE_COMPETENCY</p>
          <p><strong>Missing Columns:</strong> OVERALL_EXP, TIMELINE_ADHERENCE, QUALITY_OF_DELIVERY, TIMELY_RESOURCE_FULFILLMENT, RISK_MANAGEMENT, THOUGHT_LEADERSHIP</p>
          <p><em>Note: Average rating is calculated using only the available columns.</em></p>
        </div>
      </WarningPanel>

      <InfoPanel>
        <strong>📊 Calculation Method:</strong>
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>Average Rating =</strong> RESOURCE_COMPETENCY (single column)</p>
          <p><strong>Display Columns:</strong> S No., C_id, proj_id, Average Rating, Rating Stars</p>
          <p><em>Customers are ranked by their calculated average rating in descending order.</em></p>
        </div>
      </InfoPanel>

      <StatsContainer>
        <StatCard>
          <StatValue>{stats.totalCustomers}</StatValue>
          <StatLabel>Total Customers</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.averageRating}</StatValue>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.topRating}</StatValue>
          <StatLabel>Top Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.fiveStarCustomers}</StatValue>
          <StatLabel>5-Star Customers</StatLabel>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        <Table role="table" aria-label="Average Rating Customer Rankings">
          <TableHeader>
            <tr>
              <TableHeaderCell scope="col">Rank</TableHeaderCell>
              <TableHeaderCell scope="col">S No.</TableHeaderCell>
              <TableHeaderCell scope="col">C_id</TableHeaderCell>
                             <TableHeaderCell scope="col">proj_id</TableHeaderCell>
              <TableHeaderCell scope="col">Average Rating</TableHeaderCell>
              <TableHeaderCell scope="col">Rating</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {ratedCustomers.map((customer, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} color={customer.rank <= 3 ? "#fbbf24" : "#10b981"} />
                    {customer.rank}
                  </div>
                </TableCell>
                <TableCell>{getSerialNumber(customer)}</TableCell>
                <TableCell>{getCustomerId(customer)}</TableCell>
                <TableCell>{getProjectId(customer)}</TableCell>
                <ScoreCell>{customer.avgRating}</ScoreCell>
                <StarCell>
                  <StarIcon>{getScoreDisplay(customer.avgRating)}</StarIcon>
                </StarCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {ratedCustomers.length === 0 && (
        <EmptyState>
          <Star size={48} style={{ marginBottom: '1rem', color: '#10b981' }} />
          <h3>No Valid Ratings Found</h3>
          <p>No customers have valid scores for average rating calculation. Check your data.</p>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default AvgRatingDashboard; 