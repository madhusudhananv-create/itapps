import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Star, Upload } from 'lucide-react';

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
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
  
  /* Add a subtle gradient to indicate scrollable content */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8));
    pointer-events: none;
    z-index: 5;
  }
  
  /* Ensure horizontal scrolling works */
  white-space: nowrap;
  display: block;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  table-layout: fixed;
`;

const SecondTableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: auto;
  max-height: 400px;
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

const SecondTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 4200px;
  table-layout: fixed;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.75rem;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: #f8fafc;
  z-index: 10;
  white-space: normal;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  vertical-align: top;
  
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
  padding: 0.75rem;
  font-size: 0.75rem;
  color: #374151;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  
  &:last-child {
    border-right: none;
  }
  
  /* Ensure proper table layout */
  box-sizing: border-box;
`;

const CalculatedCell = styled.td`
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  background: #f0fdf4;
  
  &:last-child {
    border-right: none;
  }
`;

const SentimentCell = styled.td`
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: 120px;
  min-width: 120px;
  max-width: 120px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  
  &:last-child {
    border-right: none;
  }
`;

const StatusCell = styled.td`
  padding: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: auto;
  min-width: 100px;
  max-width: 120px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  text-align: center;
  border-radius: 4px;
  
  &:last-child {
    border-right: none;
  }
`;

const EngagementCell = styled.td`
  padding: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: auto;
  min-width: 100px;
  max-width: 120px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  text-align: center;
  border-radius: 4px;
  
  &:last-child {
    border-right: none;
  }
`;

const StrengthCell = styled.td`
  padding: 0.75rem;
  font-size: 0.7rem;
  font-weight: 500;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: 250px;
  min-width: 250px;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  text-align: left;
  border-radius: 4px;
  line-height: 1.3;
  background: #f0fdf4;
  color: #059669;
  
  &:last-child {
    border-right: none;
  }
`;

const ImprovementCell = styled.td`
  padding: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  vertical-align: top;
  border-right: 1px solid #f1f5f9;
  width: 180px;
  min-width: 180px;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  border-radius: 4px;
  
  &:last-child {
    border-right: none;
  }
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
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: inline-block;
`;

const ReloadButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1rem;
  
  &:hover {
    background: #5a67d8;
  }
`;

const DownloadButton = styled.button`
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  
  &:hover {
    background: #047857;
  }
`;

const ScrollIndicator = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  z-index: 20;
  display: inline-block;
`;

const HorizontalScrollBar = styled.div`
  width: 100%;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
`;

const TableInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const ExcelDataTable = ({ data, headers, itemsPerPage = 20, onReload, onSwitchToPerfect5Rater, onSwitchToLowScore, onSwitchToTop10Accounts, onSwitchToTop10FiveRaterAccounts, onSwitchToAccountWiseAvg, onSwitchToCSATSurvey }) => {
    // Safety check for data
    if (!data || !Array.isArray(data)) {
      console.warn('ExcelDataTable: data is not an array:', data);
      return (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
          <p>No data available to display.</p>
          <p>Please upload an Excel file first.</p>
        </div>
      );
    }
    
    // Calculate additional columns for each row
  const enhancedData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Filter out empty rows and rows without valid S No.
    const filteredData = data.filter(row => {
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
    
    return filteredData.map(row => {
      // Calculate average rating from all available score columns
      const scores = [];
      const availableColumns = [];
      
      // Check for all possible score columns
      const scoreColumns = [
        'OVERALL_EXP',
        'TIMELINE_ADHERENCE', 
        'QUALITY_OF_DELIVERY',
        'TIMELY_RESOURCE_FULFILLMENT',
        'RISK_MANAGEMENT',
        'THOUGHT_LEADERSHIP',
        'RESOURCE_COMPETENCY'
      ];
      
      scoreColumns.forEach(column => {
        if (row[column] !== undefined && row[column] !== null && row[column] !== '') {
          const score = Number(row[column]);
          if (!isNaN(score)) {
            scores.push(score);
            availableColumns.push(column);
          }
        }
      });
      
      const avgRating = scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : '0.00';
      
      // Calculate sentiment based on average rating
      let avgSentiment = 'Neutral';
      let isPositive = false;
      let isNeutral = false;
      let isNegative = false;
      
      const numRating = parseFloat(avgRating);
      if (numRating >= 4.0) {
        avgSentiment = 'Positive';
        isPositive = true;
      } else if (numRating <= 2.0) {
        avgSentiment = 'Negative';
        isNegative = true;
      } else {
        avgSentiment = 'Neutral';
        isNeutral = true;
      }
      
      // Calculate customer sentiment based on comments
      const commentColumns = [
        'OVERALL_EXP_COMMENTS',
        'TIMELINE_ADHERENCE_COMMENTS',
        'QUALITY_OF_DELIVERY_COMMENTS',
        'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
        'RISK_MANAGEMENT_COMMENTS',
        'THOUGHT_LEADERSHIP_COMMENTS',
        'RESOURCE_COMPETENCY_COMMENTS',
        'QUALITATIVE_FEEDBACK_COMMENTS'
      ];
      
      // Count positive, negative, neutral words from all comment columns
      let positiveWords = 0;
      let negativeWords = 0;
      let neutralWords = 0;
      let totalComments = 0;
      let compoundScores = [];
      
      // Process all comment columns
      commentColumns.forEach(column => {
        const comment = row[column];
        if (comment && comment !== '' && comment !== 'N/A') {
          totalComments++;
          // Enhanced sentiment analysis for all comment columns
          const words = comment.toLowerCase().split(' ').filter(word => word.length > 0);
          const positiveWordCount = words.filter(word => 
            ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 'superb', 'brilliant', 'satisfied', 'happy', 'pleased', 'impressed', 'delighted', 'thrilled', 'ecstatic', 'overjoyed', 'content', 'grateful'].includes(word)
          ).length;
          const negativeWordCount = words.filter(word => 
            ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'poor', 'worst', 'frustrated', 'angry', 'upset', 'dissatisfied', 'unhappy', 'displeased', 'annoyed', 'irritated', 'furious', 'livid', 'disgusted', 'disappointed', 'let down'].includes(word)
          ).length;
          const neutralWordCount = words.filter(word => 
            ['okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'satisfactory', 'adequate', 'decent', 'reasonable', 'moderate', 'fair', 'tolerable', 'passable', 'mediocre'].includes(word)
          ).length;
          
          positiveWords += positiveWordCount;
          negativeWords += negativeWordCount;
          neutralWords += neutralWordCount;
          
          // Calculate compound sentiment score for this comment
          const totalMeaningfulWords = words.length;
          if (totalMeaningfulWords > 0) {
            const compoundScore = (positiveWordCount / totalMeaningfulWords) - (negativeWordCount / totalMeaningfulWords);
            compoundScores.push(compoundScore);
          }
        }
      });
      
      // Calculate average compound sentiment using the mean of all compound sentiment scores
      const avgCompoundSentiment = compoundScores.length > 0 
        ? (compoundScores.reduce((sum, score) => sum + score, 0) / compoundScores.length).toFixed(3)
        : '0.000';
      
      // Determine overall sentiment based on compound score
      let customerAvgSentiment = 'Neutral';
      const compoundValue = parseFloat(avgCompoundSentiment);
      if (compoundValue >= 0.1) {
        customerAvgSentiment = 'Positive';
      } else if (compoundValue <= -0.1) {
        customerAvgSentiment = 'Negative';
      }
      
      // Calculate Status based on defined criteria
      let status = 'Monitor | Improve'; // Default status
      
      // Calculate percentages for comment analysis
      const totalWords = positiveWords + negativeWords + neutralWords;
      const positivePercentage = totalWords > 0 ? (positiveWords / totalWords) * 100 : 0;
      const negativePercentage = totalWords > 0 ? (negativeWords / totalWords) * 100 : 0;
      
      // Check for any single negative sentiment comment
      const hasNegativeComment = compoundScores.some(score => score < -0.1);
      
      // Status 1: Healthy | Reference
      if (compoundValue >= 0.3 && 
          parseFloat(avgRating) >= 4.5 && 
          positivePercentage >= 80 && 
          negativePercentage <= 10) {
        status = 'Healthy | Reference';
      }
      // Status 2: At Risk | Immediate
      else if ((compoundValue <= 0.0 && parseFloat(avgRating) <= 3.0 && negativePercentage >= 30) || 
               hasNegativeComment) {
        status = 'At Risk | Immediate';
      }
      // Status 3: Monitor | Improve (default case)
      else if (compoundValue >= 0.0 && compoundValue < 0.3 && 
               parseFloat(avgRating) >= 3.0 && parseFloat(avgRating) < 4.5) {
        status = 'Monitor | Improve';
      }
      

       
       // Calculate Strength as one-liner sentence from all comments
       let strength = 'No specific strengths identified';
       const allComments = [];
       
       // Collect all non-empty comments
      commentColumns.forEach(column => {
        const comment = row[column];
        if (comment && comment !== '' && comment !== 'N/A') {
           allComments.push(comment.trim());
         }
       });
       
       // Create strength sentence from all comments
       if (allComments.length > 0) {
         // Combine all comments into one sentence
         const combinedComments = allComments.join('. ');
         
         // Extract key positive phrases or create a summary
         const positiveWords = ['excellent', 'outstanding', 'superb', 'brilliant', 'perfect', 'great', 'good', 'fantastic', 'amazing', 'wonderful', 'satisfied', 'happy', 'pleased', 'delighted', 'thrilled', 'impressed', 'content', 'grateful', 'ecstatic', 'overjoyed'];
         
         // Find sentences with positive words
         const sentences = combinedComments.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
         const positiveSentences = sentences.filter(sentence => 
           positiveWords.some(word => sentence.toLowerCase().includes(word))
         );
         
         if (positiveSentences.length > 0) {
           // Use the first positive sentence or create a summary
           strength = positiveSentences[0].trim();
           if (!strength.endsWith('.') && !strength.endsWith('!') && !strength.endsWith('?')) {
             strength += '.';
           }
         } else {
           // If no positive sentences found, create a general strength statement
           strength = `Customer feedback indicates overall satisfaction with the project delivery and service quality.`;
         }
       }
       
       // Calculate Area of Improvement from negative words
       let areaOfImprovement = 'No specific areas for improvement identified';
       const negativeWordCategories = {
         'Service Quality': ['bad', 'terrible', 'awful', 'horrible', 'poor'],
         'Timeline Issues': ['disappointing', 'frustrated', 'angry', 'upset'],
         'Communication': ['dissatisfied', 'unhappy', 'displeased', 'annoyed'],
         'Resource Management': ['irritated', 'furious', 'livid', 'disgusted'],
         'Delivery Issues': ['disappointed', 'let down', 'worst']
       };
       
       // Count negative words by category
       const negativeWordCounts = {};
       commentColumns.forEach(column => {
         const comment = row[column];
         if (comment && comment !== '' && comment !== 'N/A') {
           const words = comment.toLowerCase().split(' ').filter(word => word.length > 0);
           words.forEach(word => {
             Object.entries(negativeWordCategories).forEach(([category, wordList]) => {
               if (wordList.includes(word)) {
                 negativeWordCounts[category] = (negativeWordCounts[category] || 0) + 1;
               }
             });
           });
         }
       });
       
       // Determine primary area of improvement
       if (Object.keys(negativeWordCounts).length > 0) {
         const maxCategory = Object.entries(negativeWordCounts).reduce((a, b) => 
           (negativeWordCounts[a[0]] || 0) > (negativeWordCounts[b[0]] || 0) ? a : b
         );
         areaOfImprovement = maxCategory[0];
       }
      
             return {
         'S No.': row['S No.'] || '',
         'cust_id': row['C_id'] || row['cust_id'] || '',
         'proj_id': row['proj_id'] || row['P_id'] || '',
         'OVERALL_EXP': row['OVERALL_EXP'] || 'N/A',
         'TIMELINE_ADHERENCE': row['TIMELINE_ADHERENCE'] || 'N/A',
         'QUALITY_OF_DELIVERY': row['QUALITY_OF_DELIVERY'] || 'N/A',
         'TIMELY_RESOURCE_FULFILLMENT': row['TIMELY_RESOURCE_FULFILLMENT'] || 'N/A',
         'RISK_MANAGEMENT': row['RISK_MANAGEMENT'] || 'N/A',
         'THOUGHT_LEADERSHIP': row['THOUGHT_LEADERSHIP'] || 'N/A',
         'RESOURCE_COMPETENCY': row['RESOURCE_COMPETENCY'] || 'N/A',
         'TIMELY_RESOURCE_FULFILLMENT_StaffAug': row['TIMELY_RESOURCE_FULFILLMENT_StaffAug'] || 'N/A',
         'Avg Rating': avgRating,
         'Avg Sentiment': avgSentiment,
         'Positive': isPositive ? 'Yes' : 'No',
         'Neutral': isNeutral ? 'Yes' : 'No',
         'Negative': isNegative ? 'Yes' : 'No',
         // Comment columns for second dashboard
         'OVERALL_EXP_COMMENTS': row['OVERALL_EXP_COMMENTS'] || '',
         'TIMELINE_ADHERENCE_COMMENTS': row['TIMELINE_ADHERENCE_COMMENTS'] || '',
         'QUALITY_OF_DELIVERY_COMMENTS': row['QUALITY_OF_DELIVERY_COMMENTS'] || '',
         'TIMELY_RESOURCE_FULFILLMENT_COMMENTS': row['TIMELY_RESOURCE_FULFILLMENT_COMMENTS'] || '',
         'RISK_MANAGEMENT_COMMENTS': row['RISK_MANAGEMENT_COMMENTS'] || '',
         'THOUGHT_LEADERSHIP_COMMENTS': row['THOUGHT_LEADERSHIP_COMMENTS'] || '',
         'RESOURCE_COMPETENCY_COMMENTS': row['RESOURCE_COMPETENCY_COMMENTS'] || '',
         'QUALITATIVE_FEEDBACK_COMMENTS': row['QUALITATIVE_FEEDBACK_COMMENTS'] || '',
        // Customer sentiment columns for second dashboard (with different names to avoid conflicts)
        'Comment_Avg_Rating': avgRating,
        'Comment_Positive': positiveWords.toString(),
        'Comment_Neutral': neutralWords.toString(),
        'Comment_Negative': negativeWords.toString(),
         'Sentiment Compound': avgCompoundSentiment,
        'Comment_Avg_Sentiment': customerAvgSentiment,
         'Status': status,
         'Strength': strength,
         'Area of Improvement': areaOfImprovement
       };
    });
  }, [data]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [scrollPosition, setScrollPosition] = useState(0);

  // Create new headers with all requested columns
  const newHeaders = useMemo(() => {
    const originalHeaders = [
      'S No.',
      'cust_id', 
      'proj_id',
      'OVERALL_EXP',
      'TIMELINE_ADHERENCE',
      'QUALITY_OF_DELIVERY', 
      'TIMELY_RESOURCE_FULFILLMENT',
      'RISK_MANAGEMENT',
      'THOUGHT_LEADERSHIP',
      'RESOURCE_COMPETENCY'
    ];
    const calculatedHeaders = ['Avg Rating', 'Avg Sentiment', 'Positive', 'Neutral', 'Negative'];
    return [...originalHeaders, ...calculatedHeaders];
  }, []);

  // Create headers for second dashboard (comment columns + calculated columns)
  const secondDashboardHeaders = useMemo(() => [
    'S No.',
    'cust_id',
    'proj_id',
    'OVERALL_EXP_COMMENTS',
    'TIMELINE_ADHERENCE_COMMENTS',
    'QUALITY_OF_DELIVERY_COMMENTS',
    'TIMELY_RESOURCE_FULFILLMENT_COMMENTS',
    'RISK_MANAGEMENT_COMMENTS',
    'THOUGHT_LEADERSHIP_COMMENTS',
    'RESOURCE_COMPETENCY_COMMENTS',
    'QUALITATIVE_FEEDBACK_COMMENTS',
    'Comment_Avg_Rating',
    'Comment_Positive',
    'Comment_Neutral',
    'Comment_Negative',
    'Sentiment Compound',
    'Comment_Avg_Sentiment',
    'Status',
    'Strength',
    'Area of Improvement'
  ], []);

  // (Preview removed) Five Star Accounts inline preview moved to dedicated page

  // Use new headers for display
  const columns = newHeaders;

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !enhancedData) return enhancedData || [];

    return [...enhancedData].sort((a, b) => {
      let aValue = a[sortConfig.key] || '';
      let bValue = b[sortConfig.key] || '';

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
  }, [enhancedData, sortConfig]);

  const totalPages = Math.ceil((sortedData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData?.slice(startIndex, endIndex) || [];

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    setScrollPosition(scrollLeft);
  };

  // Download functions
  const downloadCSV = (data, filename) => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    
    // Get headers from the first row
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          // Escape commas and quotes in the value
          const escapedValue = String(value).replace(/"/g, '""');
          return `"${escapedValue}"`;
        }).join(',')
      )
    ].join('\n');
    
    // Create and download file
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

  const downloadFirstDashboard = () => {
    downloadCSV(enhancedData, 'first_dashboard_data.csv');
  };

  const downloadSecondDashboard = () => {
    // Create data for second dashboard with only the columns we want to show
    const secondDashboardData = enhancedData.map(row => {
      const filteredRow = {};
      secondDashboardHeaders.forEach(header => {
        filteredRow[header] = row[header] || '';
      });
      return filteredRow;
    });
    downloadCSV(secondDashboardData, 'second_dashboard_data.csv');
  };

  // Add download functions for each dashboard
  const downloadGolden5StarScore = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    // Use the same logic as Golden5StarScoreDashboard for filtering
    // For simplicity, download all enhancedData as CSV
    downloadCSV(enhancedData, 'golden_5_star_score_dashboard.csv');
  };
  const downloadGolden5StarSentiments = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    // For simplicity, download all enhancedData as CSV
    downloadCSV(enhancedData, 'golden_5_star_sentiments_dashboard.csv');
  };
  const downloadPerfect5Rater = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    // For simplicity, download all enhancedData as CSV
    downloadCSV(enhancedData, 'perfect_5_rater_score_based_dashboard.csv');
  };
  const downloadLowScore = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return;
    // For simplicity, download all enhancedData as CSV
    downloadCSV(enhancedData, 'low_score_dashboard.csv');
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <h3>No Excel data available</h3>
          <p>Upload an Excel file to view the data.</p>
        </EmptyState>
      </TableContainer>
    );
  }

    return (
    <TableContainer onScroll={handleScroll}>
      {onReload && (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <ReloadButton 
            onClick={onReload}
            aria-label="Upload new Excel file"
            title="Upload new Excel file"
          >
            Upload New Excel File
          </ReloadButton>
        </div>
      )}
      
      {/* Golden 5 Star Navigation Buttons */}
      <div style={{ 
        padding: '1rem', 
        textAlign: 'right',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        margin: '1rem 0',
        borderRadius: '8px'
      }}>
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: 'white', 
          fontSize: '1.2rem',
          fontWeight: '600',
          textAlign: 'right'
        }}>
          🏆 Analysis Options
        </h3>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToPerfect5Rater}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Perfect-5 Rater (Score-Based) Dashboard"
              title="Switch to Perfect-5 Rater (Score-Based) Dashboard"
            >
              <Star size={16} />
              Perfect-5 Rater (Score-Based)
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onSwitchToLowScore}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Low Score Dashboard"
              title="Switch to Low Score Dashboard"
            >
              <Star size={16} />
              Low Score Dashboard
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => {
                console.log('Top 10 Five Rater Accounts button clicked');
                onSwitchToTop10FiveRaterAccounts();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Top 10 Five Rater Accounts Dashboard"
              title="Switch to Top 10 Five Rater Accounts Dashboard"
            >
              <Star size={16} />
              Top 10 Five Rater Accounts
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => { console.log('Account-wise Avg button clicked'); onSwitchToAccountWiseAvg && onSwitchToAccountWiseAvg(); }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Switch to Account-wise Averages"
              title="Switch to Account-wise Averages"
            >
              <Star size={16} />
              Account-wise Avg (Questions)
            </button>
          </div>
          {/* 5 Star Accounts navigation removed as requested */}
        </div>
       </div>
       {/* Inline preview removed; provide navigation button instead */}
       
       {/* Download First Dashboard Button - Right Aligned */}
       <div style={{ 
         padding: '1rem', 
         textAlign: 'right'
       }}>
          <DownloadButton 
            onClick={downloadFirstDashboard}
           aria-label="Download the dashboard data"
           title="Download the dashboard data as CSV"
           style={{
             margin: '0',
             background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
             border: 'none',
             color: 'white',
             padding: '0.75rem 1.5rem',
             borderRadius: '8px',
             cursor: 'pointer',
             fontWeight: '600',
             fontSize: '0.9rem',
             transition: 'all 0.2s',
             display: 'inline-flex',
             alignItems: 'center',
             gap: '0.5rem'
           }}
           onMouseOver={(e) => {
             e.target.style.transform = 'translateY(-2px)';
             e.target.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.3)';
           }}
           onMouseOut={(e) => {
             e.target.style.transform = 'translateY(0)';
             e.target.style.boxShadow = 'none';
           }}
          >
            <Download size={16} />
           Download the Dashboard
          </DownloadButton>
        </div>
      
             {/* Dashboard Label - Below the button */}
       <div style={{ 
         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
         color: 'white', 
         padding: '1rem', 
         textAlign: 'center',
         marginBottom: '0'
       }}>
         <h2 style={{ 
           margin: '0', 
           fontSize: '1.5rem', 
           fontWeight: '600',
           textShadow: '0 2px 4px rgba(0,0,0,0.1)'
         }}>
           Sentiments based on Avg rating(score)
         </h2>
         <p style={{ 
           margin: '0.5rem 0 0 0', 
           fontSize: '0.9rem', 
           opacity: '0.9',
           fontWeight: '300'
         }}>
           Customer sentiment analysis derived from average rating calculations
         </p>
       </div>
       
       
      
                          <TableInfo>
        <div>
          {scrollPosition > 0 && (
             <ScrollIndicator style={{ marginLeft: '1rem' }}>
               Scrolled: {Math.round(scrollPosition)}px
             </ScrollIndicator>
           )}
        </div>
      </TableInfo>
      
      <div style={{ overflowX: 'auto', width: '100%' }}>
      <Table>
        <TableHeader>
          <tr>
            {columns.map((column) => (
              <TableHeaderCell 
                key={column}
                onClick={() => handleSort(column)}
                style={{ width: '120px', position: 'relative' }}
                title={column}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingRight: '20px' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#667eea', marginBottom: '2px' }}>
                    {column}
                  </div>
                                     <div style={{ fontSize: '0.6rem', lineHeight: '1.1', color: '#6b7280' }}>
                     {column === 'Avg Rating' ? 'Avg of all available score columns' :
                      column === 'Avg Sentiment' ? 'Based on average rating' :
                      column === 'Positive' ? 'Yes/No indicator' :
                      column === 'Neutral' ? 'Yes/No indicator' :
                      column === 'Negative' ? 'Yes/No indicator' : 
                                               ['OVERALL_EXP', 'TIMELINE_ADHERENCE', 'QUALITY_OF_DELIVERY', 'TIMELY_RESOURCE_FULFILLMENT', 'RISK_MANAGEMENT', 'THOUGHT_LEADERSHIP', 'RESOURCE_COMPETENCY'].includes(column) ? 'Score column (0-5)' : 'Original data'}
                   </div>
                </div>
                <SortIcon>{getSortIcon(column)}</SortIcon>
              </TableHeaderCell>
            ))}
          </tr>
        </TableHeader>
        <TableBody>
          {currentData.map((row, index) => (
            <TableRow key={row.id || index}>
              {columns.map((column) => {
                const value = row[column] || '';
                
                                 // Use different styled components based on column type
                 if (column === 'Avg Rating') {
                   return (
                     <CalculatedCell key={column} title={value}>
                       {value}
                     </CalculatedCell>
                   );
                 } else if (column === 'Avg Sentiment') {
                   const sentimentColor = value === 'Positive' ? '#059669' : 
                                        value === 'Negative' ? '#dc2626' : '#6b7280';
                   return (
                     <SentimentCell key={column} title={value} style={{ color: sentimentColor }}>
                       {value}
                     </SentimentCell>
                   );

                 } else if (['Positive', 'Neutral', 'Negative'].includes(column)) {
                   const isYes = value === 'Yes';
                   return (
                     <SentimentCell key={column} title={value} style={{ color: isYes ? '#059669' : '#6b7280' }}>
                       {value}
                     </SentimentCell>
                   );
                 } else if (['OVERALL_EXP', 'TIMELINE_ADHERENCE', 'QUALITY_OF_DELIVERY', 'TIMELY_RESOURCE_FULFILLMENT', 'RISK_MANAGEMENT', 'THOUGHT_LEADERSHIP', 'RESOURCE_COMPETENCY', 'TIMELY_RESOURCE_FULFILLMENT_StaffAug'].includes(column)) {
                   // Style for score columns
                   const scoreValue = value === 'N/A' ? 'N/A' : value;
                   const isScore = !isNaN(Number(value)) && value !== 'N/A';
                   return (
                     <TableCell key={column} title={value} style={{ 
                       color: isScore ? (Number(value) >= 4 ? '#059669' : Number(value) <= 2 ? '#dc2626' : '#6b7280') : '#6b7280',
                       fontWeight: isScore ? '600' : 'normal'
                     }}>
                       {scoreValue}
                     </TableCell>
                   );
                 } else {
                   return (
                     <TableCell key={column} title={value}>
                       {value}
                     </TableCell>
                   );
                 }
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
      
             <PaginationContainer>
         <PaginationInfo>
           Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
         </PaginationInfo>
         
         <PaginationControls>
           <PaginationButton
             onClick={() => handlePageChange(currentPage - 1)}
             disabled={currentPage === 1}
             aria-label="Go to previous page"
             title="Go to previous page"
           >
             <ChevronLeft size={16} />
           </PaginationButton>
           
           {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
             <PaginationButton
               key={page}
               onClick={() => handlePageChange(page)}
               className={currentPage === page ? 'active' : ''}
               aria-label={`Go to page ${page}`}
               title={`Go to page ${page}`}
             >
               {page}
             </PaginationButton>
           ))}
           
           <PaginationButton
             onClick={() => handlePageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             aria-label="Go to next page"
             title="Go to next page"
           >
             <ChevronRight size={16} />
           </PaginationButton>
         </PaginationControls>
       </PaginationContainer>
       
       {/* Horizontal Scroll Bar for First Dashboard */}
       <HorizontalScrollBar />
       
               {/* Second Dashboard Label */}
        <div style={{ 
          background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', 
          color: 'white', 
          padding: '1rem', 
          textAlign: 'center',
          marginTop: '2rem',
          marginBottom: '0'
        }}>
                     <h2 style={{ 
             margin: '0', 
             fontSize: '1.5rem', 
             fontWeight: '600',
             textShadow: '0 2px 4px rgba(0,0,0,0.1)'
           }}>
             Customer Feedback Comments
           </h2>
           <p style={{ 
             margin: '0.5rem 0 0 0', 
             fontSize: '0.9rem', 
             opacity: '0.9',
             fontWeight: '300'
           }}>
             Displaying all customer feedback comments from the Excel file
           </p>
        </div>
        
                         {/* Second Table - Customer Sentiment Dashboard */}
         <div style={{ marginTop: '0' }}>
           <div style={{ 
             background: '#f8fafc', 
             padding: '0.5rem 1rem', 
             borderBottom: '1px solid #e2e8f0',
             fontSize: '0.75rem',
             color: '#059669',
             fontWeight: '500',
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center'
           }}>
             <span>Second Dashboard - Scroll horizontally and vertically to view all data</span>
             <DownloadButton 
               onClick={downloadSecondDashboard}
               aria-label="Download the dashboard data"
               title="Download the dashboard data as CSV"
               style={{ margin: 0, fontSize: '0.7rem', padding: '0.5rem 1rem' }}
             >
               <Download size={14} />
               Download the Dashboard
             </DownloadButton>
           </div>
           <SecondTableContainer>
             <SecondTable>
            <TableHeader>
              <tr>
                                 {secondDashboardHeaders.map((column) => (
                   <TableHeaderCell 
                     key={column}
                     onClick={() => handleSort(column)}
                     style={{ width: '120px', position: 'relative' }}
                     title={column}
                   >
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingRight: '20px' }}>
                       <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#059669', marginBottom: '2px' }}>
                         {column}
                       </div>
                       <div style={{ fontSize: '0.6rem', lineHeight: '1.1', color: '#6b7280' }}>
                         {column.includes('_COMMENTS') ? (column === 'QUALITATIVE_FEEDBACK_COMMENTS' ? 'Qualitative feedback comments' : 'Customer feedback comments') :
                          column === 'Comment_Avg_Rating' ? 'Average of all score columns' :
                          column === 'Sentiment Compound' ? 'Compound sentiment score (-1 to 1)' :
                          column === 'Comment_Avg_Sentiment' ? 'Based on compound score' :
                          column === 'Status' ? 'Health status based on criteria' :
                          column === 'Strength' ? 'One-liner sentence summarizing strengths from all comments' :
                          column === 'Area of Improvement' ? 'Areas needing improvement' :
                          column === 'Comment_Positive' ? 'Positive word count' :
                          column === 'Comment_Neutral' ? 'Neutral word count' :
                          column === 'Comment_Negative' ? 'Negative word count' :
                          'Original data'}
                       </div>
                     </div>
                     <SortIcon>{getSortIcon(column)}</SortIcon>
                   </TableHeaderCell>
                 ))}
              </tr>
            </TableHeader>
                         <TableBody>
               {currentData.map((row, index) => (
                 <TableRow key={`customer-${row.id || index}`}>
                   {secondDashboardHeaders.map((column) => {
                     const value = row[column] || '';
                     
                     // Check if it's a comment column
                     if (column.includes('_COMMENTS')) {
                       const commentValue = value || '';
                       return (
                         <TableCell key={column} title={commentValue} style={{ 
                           maxWidth: '200px',
                           wordWrap: 'break-word',
                           whiteSpace: 'normal',
                           fontSize: '0.7rem',
                           lineHeight: '1.2'
                         }}>
                           {commentValue || 'No comment'}
                         </TableCell>
                       );
                     } else if (column === 'Comment_Avg_Rating') {
                       // Style for Comment Avg Rating column
                       return (
                         <CalculatedCell key={column} title={value}>
                           {value}
                         </CalculatedCell>
                       );
                     } else if (column === 'Sentiment Compound') {
                       // Style for Sentiment Compound column
                       const compoundValue = parseFloat(value);
                       let compoundColor = '#6b7280'; // Neutral
                       if (compoundValue >= 0.1) {
                         compoundColor = '#059669'; // Positive
                       } else if (compoundValue <= -0.1) {
                         compoundColor = '#dc2626'; // Negative
                       }
                       return (
                         <SentimentCell key={column} title={`Compound Score: ${value}`} style={{ color: compoundColor, fontWeight: '600' }}>
                           {value}
                         </SentimentCell>
                       );
                     } else if (column === 'Comment_Avg_Sentiment') {
                       // Style for Comment Avg Sentiment column
                       const sentimentColor = value === 'Positive' ? '#059669' : 
                                            value === 'Negative' ? '#dc2626' : '#6b7280';
                       return (
                         <SentimentCell key={column} title={value} style={{ color: sentimentColor }}>
                           {value}
                         </SentimentCell>
                       );
                     } else if (column === 'Status') {
                       // Style for Status column
                       let statusColor = '#6b7280'; // Default gray
                       let backgroundColor = '#f3f4f6'; // Default light gray
                       
                       if (value === 'Healthy | Reference') {
                         statusColor = '#059669'; // Green
                         backgroundColor = '#f0fdf4';
                       } else if (value === 'At Risk | Immediate') {
                         statusColor = '#dc2626'; // Red
                         backgroundColor = '#fef2f2';
                       } else if (value === 'Monitor | Improve') {
                         statusColor = '#d97706'; // Orange
                         backgroundColor = '#fffbeb';
                       }
                       
                       return (
                         <StatusCell key={column} title={value} style={{ 
                           color: statusColor, 
                           backgroundColor: backgroundColor,
                           border: `1px solid ${statusColor}20`
                         }}>
                           {value}
                         </StatusCell>
                       );
                     } else if (['Comment_Positive', 'Comment_Neutral', 'Comment_Negative'].includes(column)) {
                       // Style for Comment Positive/Neutral/Negative columns (word counts)
                       const numValue = parseInt(value);
                       let color = '#6b7280'; // Default gray
                       if (numValue > 0) {
                         color = '#059669'; // Green for positive counts
                       }
                       return (
                         <SentimentCell key={column} title={`Word count: ${value}`} style={{ color: color }}>
                           {value}
                         </SentimentCell>
                       );
                     } else if (column === 'Strength') {
                       // Style for Strength column (one-liner sentence)
                       return (
                         <StrengthCell key={column} title={value}>
                           {value}
                         </StrengthCell>
                       );
                     } else {
                       return (
                         <TableCell key={column} title={value}>
                           {value}
                         </TableCell>
                       );
                     }
                   })}
                 </TableRow>
               ))}
             </TableBody>
           </SecondTable>
           </SecondTableContainer>
          
          {/* Pagination for Second Dashboard */}
          <PaginationContainer>
            <PaginationInfo>
              Showing {startIndex + 1} to {Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
            </PaginationInfo>
            
            <PaginationControls>
              <PaginationButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                title="Go to previous page"
              >
                <ChevronLeft size={16} />
              </PaginationButton>
              
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(page => (
                <PaginationButton
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={currentPage === page ? 'active' : ''}
                  aria-label={`Go to page ${page}`}
                  title={`Go to page ${page}`}
                >
                  {page}
                </PaginationButton>
              ))}
              
              <PaginationButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                title="Go to next page"
              >
                <ChevronRight size={16} />
              </PaginationButton>
            </PaginationControls>
          </PaginationContainer>
        </div>
    </TableContainer>
  );
};

export default ExcelDataTable; 