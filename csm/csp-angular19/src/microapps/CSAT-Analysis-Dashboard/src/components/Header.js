import React from 'react';
import styled from 'styled-components';
import { BarChart3, Users, TrendingUp, FileSpreadsheet, Trophy, Award, Calculator, MessageCircle } from 'lucide-react';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 5rem;
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 2rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
`;

const Header = ({ totalRecords, averageScore, totalAccounts, isExcelData = false, isGoldenStar = false, isScoreBased = false, isAvgRating = false, isSentiments = false, hideStats = false }) => {
  
  return (
    <HeaderContainer>
      <HeaderContent>
        <TitleSection>
          {isGoldenStar ? <Trophy size={32} /> : 
           isScoreBased ? <Award size={32} /> : 
           isAvgRating ? <Calculator size={32} /> :
           isSentiments ? <MessageCircle size={32} /> :
           isExcelData ? <FileSpreadsheet size={32} /> : <BarChart3 size={32} />}
          <div>
            <Title>
              {isGoldenStar ? 'Golden 5 Star Customer Dashboard' : 
               isScoreBased ? 'Score-Based Customer Dashboard' :
               isAvgRating ? 'Average Rating Dashboard' :
               isSentiments ? 'Sentiments Dashboard' :
               'CSAT Analysis Dashboard'}
            </Title>
            <Subtitle>
              {isGoldenStar ? 'Top 10 Customers Based on Exceptional Performance' :
               isScoreBased ? 'Customers Ranked by RESOURCE_COMPETENCY Scores' :
               isAvgRating ? 'Customers Ranked by Average Ratings' :
               isSentiments ? 'Customer Sentiment Analysis' :
               'Customer Satisfaction Analysis & Insights'}
            </Subtitle>
          </div>
        </TitleSection>
        
        {!hideStats && (
          <StatsContainer>
            <StatItem>
              {isGoldenStar ? <Trophy size={16} /> : 
               isScoreBased ? <Award size={16} /> : 
               isAvgRating ? <Calculator size={16} /> :
               isSentiments ? <MessageCircle size={16} /> :
               isExcelData ? <FileSpreadsheet size={16} /> : <Users size={16} />}
              <span>{totalRecords} {isGoldenStar ? 'Golden Customers' : 
               isScoreBased ? 'Scored Customers' : 
               isAvgRating ? 'Rated Customers' :
               isSentiments ? 'Analyzed Customers' :
               isExcelData ? 'Excel Records' : 'Records'}</span>
            </StatItem>
            {!isExcelData && !isGoldenStar && !isScoreBased && !isAvgRating && !isSentiments && (
              <>
                <StatItem>
                  <TrendingUp size={16} />
                  <span>{averageScore.toFixed(1)} Avg Score</span>
                </StatItem>
                <StatItem>
                  <BarChart3 size={16} />
                  <span>{totalAccounts} Accounts</span>
                </StatItem>
              </>
            )}
          </StatsContainer>
        )}
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 