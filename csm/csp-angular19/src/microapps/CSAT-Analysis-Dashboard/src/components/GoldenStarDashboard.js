import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Star, Trophy, TrendingUp, Users, ChevronLeft } from 'lucide-react';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
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
  color: #f59e0b;
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

const CriteriaInfo = styled.div`
  background: #fef3c7;
  border: 1px solid #fbbf24;
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

const GoldenStarDashboard = ({ data, onBack }) => {
  // Filter and rank customers based on criteria - apply both criteria automatically
  const goldenStarCustomers = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    // Apply both criteria and combine results
    const criteria1Data = data.filter(customer => {
      // Criteria 1: OVERALL_EXP,TIMELINE_ADHERENCE,QUALITY_OF_DELIVERY,TIMELY_RESOURCE_FULFILLMENT,RISK_MANAGEMENT,THOUGHT_LEADERSHIP = 5
      // and RESOURCE_COMPETENCY = 0 or empty
      return (
        (customer.RESOURCE_COMPETENCY === 0 || customer.RESOURCE_COMPETENCY === '' || customer.RESOURCE_COMPETENCY === null)
      );
    });

    const criteria2Data = data.filter(customer => {
      // Criteria 2: TIMELINE_ADHERENCE,QUALITY_OF_DELIVERY,TIMELY_RESOURCE_FULFILLMENT,RISK_MANAGEMENT,THOUGHT_LEADERSHIP = 0 or empty
      // and RESOURCE_COMPETENCY,OVERALL_EXP = 5
      return (
        customer.RESOURCE_COMPETENCY === 5
      );
    });

    // Combine both criteria results and add criteria type
    const combinedData = [
      ...criteria1Data.map(customer => ({ ...customer, criteriaType: 'Criteria 1' })),
      ...criteria2Data.map(customer => ({ ...customer, criteriaType: 'Criteria 2' }))
    ];

    // Remove duplicates based on S No.
    const uniqueData = combinedData.filter((customer, index, self) => 
      index === self.findIndex(c => c['S No.'] === customer['S No.'])
    );

    // Add ranking and average score
    const mappedData = uniqueData.map((customer, index) => ({
      ...customer,
      rank: index + 1,
      averageScore: customer.criteriaType === 'Criteria 1' 
        ? 0 // For Criteria 1, score is 0 since both values are 0/empty
        : 5 // For Criteria 2, score is 5 since both values are 5
    }));

    // Sort by criteria type (Criteria 1 first) then by S No.
    const sortedData = mappedData.sort((a, b) => {
      if (a.criteriaType !== b.criteriaType) {
        return a.criteriaType === 'Criteria 1' ? -1 : 1;
      }
      return a['S No.'] - b['S No.'];
    });

    return sortedData.slice(0, 20); // Return top 20
  }, [data]);

  const stats = useMemo(() => {
    const criteria1Count = goldenStarCustomers.filter(c => c.criteriaType === 'Criteria 1').length;
    const criteria2Count = goldenStarCustomers.filter(c => c.criteriaType === 'Criteria 2').length;
    
    return {
      totalGoldenCustomers: goldenStarCustomers.length,
      criteria1Count: criteria1Count,
      criteria2Count: criteria2Count,
      averageScore: goldenStarCustomers.length > 0 
        ? (goldenStarCustomers.reduce((sum, c) => sum + c.averageScore, 0) / goldenStarCustomers.length).toFixed(2)
        : 0,
      topScore: goldenStarCustomers.length > 0 ? Math.max(...goldenStarCustomers.map(c => c.averageScore)).toFixed(2) : 0
    };
  }, [goldenStarCustomers]);

  const getCustomerId = (customer) => {
    // Try to find customer ID from various possible column names
    return customer.CUST_ID || customer.C_id || customer.Test_C_Id || customer.CID || customer.CusId || customer.CustomerID || customer.Customer_Id || 'N/A';
  };

  const getProjectId = (customer) => {
    // Try to find project ID from various possible column names
    return customer.proj_id || customer.P_id || customer.Test_P_Id || customer.PID || customer.PrId || customer.ProjectID || customer.Project_Id || 'N/A';
  };

  const getSerialNumber = (customer) => {
    // Try to find serial number from various possible column names
    return customer['S No.'] || customer.S_No || customer.SNo || customer.SNO || customer.id || 'N/A';
  };

  if (!data || data.length === 0) {
    return (
      <DashboardContainer>
        <EmptyState>
          <Trophy size={48} style={{ marginBottom: '1rem', color: '#fbbf24' }} />
          <h3>No Golden 5 Star Customers Found</h3>
          <p>Upload Excel data to view Golden 5 Star customers.</p>
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
              <Trophy size={32} />
              Golden 5 Star Customer Dashboard
            </HeaderTitle>
            <HeaderSubtitle>
              Top 10 customers based on exceptional performance criteria
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

             <CriteriaInfo>
         <strong>Golden 5 Star Criteria Applied:</strong>
         <div style={{ marginTop: '0.5rem' }}>
                   <p><strong>Criteria 1:</strong> RESOURCE_COMPETENCY = 0 or empty</p>
        <p><strong>Criteria 2:</strong> RESOURCE_COMPETENCY = 5</p>
           <p><em>Note: Both criteria are automatically applied. Customers matching either criteria are shown below.</em></p>
         </div>
       </CriteriaInfo>

             <StatsContainer>
         <StatCard>
           <StatValue>{stats.totalGoldenCustomers}</StatValue>
           <StatLabel>Total Golden 5 Star Customers</StatLabel>
         </StatCard>
         <StatCard>
           <StatValue>{stats.criteria1Count}</StatValue>
           <StatLabel>Criteria 1 Matches</StatLabel>
         </StatCard>
         <StatCard>
           <StatValue>{stats.criteria2Count}</StatValue>
           <StatLabel>Criteria 2 Matches</StatLabel>
         </StatCard>
         <StatCard>
           <StatValue>{stats.averageScore}</StatValue>
           <StatLabel>Average Score</StatLabel>
         </StatCard>
       </StatsContainer>

             <TableContainer>
         <Table role="table" aria-label="Golden 5 Star Customer Results">
           <TableHeader>
             <tr>
                              <TableHeaderCell scope="col">Rank</TableHeaderCell>
                <TableHeaderCell scope="col">S No.</TableHeaderCell>
                <TableHeaderCell scope="col">C_id</TableHeaderCell>
                                 <TableHeaderCell scope="col">proj_id</TableHeaderCell>
                                 <TableHeaderCell scope="col">Criteria Type</TableHeaderCell>
                <TableHeaderCell scope="col">Rating</TableHeaderCell>
             </tr>
           </TableHeader>
          <TableBody>
            {goldenStarCustomers.map((customer, index) => (
              <TableRow key={index}>
                                 <TableCell>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Trophy size={16} color="#fbbf24" />
                     {customer.rank}
                   </div>
                 </TableCell>
                 <TableCell>{getSerialNumber(customer)}</TableCell>
                 <TableCell>{getCustomerId(customer)}</TableCell>
                 <TableCell>{getProjectId(customer)}</TableCell>
                 <TableCell>{customer.criteriaType}</TableCell>
                 <StarCell>
                   <StarIcon>★★★★★</StarIcon>
                 </StarCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {goldenStarCustomers.length === 0 && (
        <EmptyState>
          <Star size={48} style={{ marginBottom: '1rem', color: '#fbbf24' }} />
          <h3>No Golden 5 Star Customers Found</h3>
          <p>No customers match the selected criteria. Try switching criteria or check your data.</p>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

export default GoldenStarDashboard; 