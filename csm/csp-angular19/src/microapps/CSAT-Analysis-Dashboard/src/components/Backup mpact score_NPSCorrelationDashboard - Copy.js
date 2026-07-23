import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';

const DashboardContainer = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
    transform: translateY(-1px);
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-1px);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchLabel = styled.label`
  font-weight: 500;
  color: #374151;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  width: 250px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ClearButton = styled.button`
  padding: 0.5rem 1rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background: #dc2626;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1400px;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: white;
  border-right: 1px solid #4b5563;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
  min-width: 120px;
  max-width: 150px;

  &:first-child {
    position: sticky;
    left: 0;
    background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
    z-index: 11;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9fafb;
  }

  &:hover {
    background: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  white-space: nowrap;

  &:first-child {
    position: sticky;
    left: 0;
    background: inherit;
    z-index: 1;
    font-weight: 600;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

const ScrollIndicator = styled.div`
  text-align: center;
  padding: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
`;

const SuccessMessage = styled.div`
  background: #d1fae5;
  color: #065f46;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #a7f3d0;
`;

const AnalysisContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  padding: 1.5rem;
`;

const AnalysisTitle = styled.h3`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ImpactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ImpactCard = styled.div`
  background: ${props => props.isHighest ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f8fafc'};
  color: ${props => props.isHighest ? 'white' : '#374151'};
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid ${props => props.isHighest ? '#059669' : '#e5e7eb'};
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ImpactTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: inherit;
`;

const ImpactValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: inherit;
`;

const ImpactLabel = styled.div`
  font-size: 0.75rem;
  opacity: 0.8;
  color: inherit;
`;

const CorrelationMatrix = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const MatrixTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
`;

const MatrixTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
`;

const MatrixCell = styled.td`
  padding: 0.5rem;
  text-align: center;
  border: 1px solid #e5e7eb;
  background: ${props => {
    if (props.value >= 0.7) return '#dcfce7';
    if (props.value >= 0.5) return '#fef3c7';
    if (props.value >= 0.3) return '#fed7aa';
    return '#fee2e2';
  }};
  color: ${props => {
    if (props.value >= 0.7) return '#166534';
    if (props.value >= 0.5) return '#92400e';
    if (props.value >= 0.3) return '#9a3412';
    return '#991b1b';
  }};
  font-weight: 600;
`;

const InsightsContainer = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const InsightTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 600;
`;

const InsightText = styled.p`
  margin: 0.5rem 0;
  font-size: 0.875rem;
  line-height: 1.4;
`;

const FormulaContainer = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  font-family: 'Courier New', monospace;
`;

const FormulaTitle = styled.h4`
  margin: 0 0 1rem 0;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormulaBox = styled.div`
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  font-size: 0.9rem;
  line-height: 1.6;
`;

const FormulaLine = styled.div`
  margin: 0.5rem 0;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
    font-weight: 700;
    color: #059669;
    background: #f0fdf4;
    padding: 0.5rem;
    border-radius: 4px;
    margin-top: 0.75rem;
  }
`;

const Variable = styled.span`
  color: #7c3aed;
  font-weight: 600;
`;

const Operator = styled.span`
  color: #dc2626;
  font-weight: 700;
  margin: 0 0.5rem;
`;

const Weight = styled.span`
  color: #ea580c;
  font-weight: 600;
`;

const Comment = styled.span`
  color: #6b7280;
  font-style: italic;
  font-size: 0.8rem;
  margin-left: 0.5rem;
`;

const NPSCorrelationDashboard = ({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, onBack }) => {
  const [uploadedData, setUploadedData] = useState(null);
  const [groupByBU, setGroupByBU] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get ACSAT cycle from global context
  const { acsatCycle } = useCSATContext();

  // Define target perspectives at component level
  const targetPerspectives = [
    'NPS',
    'Meeting Delivery Commitments',
    'Customer Engagement and Relationship', 
    'Partner adding value to Customer Business'
  ];

  // Helper function to calculate correlation coefficient
  const calculateCorrelation = (x, y) => {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
    const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
    const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Helper function to calculate impact score
  const calculateImpactScore = (correlation, avgRating, dataPoints) => {
    // Impact score combines correlation strength, average rating, and data volume
    const correlationWeight = Math.abs(correlation);
    const ratingWeight = avgRating / 5; // Normalize to 0-1
    const volumeWeight = Math.min(dataPoints / 10, 1); // Normalize data points
    
    return (correlationWeight * 0.5 + ratingWeight * 0.3 + volumeWeight * 0.2) * 100;
  };

  // Helper function to parse MM-DD-YYYY date and compare with CSAT cycle start date
  const isDateOnOrAfterCsatStart = (dateValue) => {
    if (!dateValue || !acsatCycleStartDateFormatted) return true;
    
    try {
      let parsedDate;
      const originalValue = dateValue.toString().trim();
      
      // Handle different date formats
      if (originalValue.includes('/')) {
        // MM/DD/YYYY format
        const [month, day, year] = originalValue.split('/');
        parsedDate = new Date(year, month - 1, day);
      } else if (originalValue.includes('-')) {
        // MM-DD-YYYY format
        const [month, day, year] = originalValue.split('-');
        parsedDate = new Date(year, month - 1, day);
      } else if (originalValue.includes(' ')) {
        // Try parsing as standard date
        parsedDate = new Date(originalValue);
      } else {
        // Try parsing as Excel serial date
        const excelDate = parseFloat(originalValue);
        if (!isNaN(excelDate) && excelDate > 25569) { // Excel date threshold
          parsedDate = new Date((excelDate - 25569) * 86400 * 1000);
        } else {
          parsedDate = new Date(originalValue);
        }
      }
      
      if (isNaN(parsedDate.getTime())) {
        console.log(`Invalid date format: ${originalValue}`);
        return true; // Include if we can't parse
      }
      
      const cycleStartDate = new Date(acsatCycleStartDateFormatted);
      const isAfterOrEqual = parsedDate >= cycleStartDate;
      
      console.log(`Date comparison: ${originalValue} -> ${parsedDate.toISOString()} >= ${cycleStartDate.toISOString()} = ${isAfterOrEqual}`);
      return isAfterOrEqual;
    } catch (error) {
      console.log(`Error parsing date: ${dateValue}`, error);
      return true; // Include if we can't parse
    }
  };

  // Load data from Excel
  useEffect(() => {
    if (excelData) {
      try {
        console.log('Loading data for NPS Correlation Dashboard...');
        
        // Find the "CSAT received Report" sheet
        const sheetName = excelData.SheetNames.find(name => 
          name.toLowerCase().includes('csat received') || 
          name.toLowerCase().includes('received report')
        );
        
        if (!sheetName) {
          console.error('CSAT received Report sheet not found');
          return;
        }
        
        const worksheet = excelData.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          console.error('No data found in CSAT received Report sheet');
          return;
        }
        
        // Convert to objects using first row as headers
        const headers = jsonData[0];
        const data = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index];
          });
          return obj;
        });
        
        // Filter by YEAR_QUARTER if acsatCycle is provided
        const filteredData = data.filter(row => {
          if (acsatCycle && row.YEAR_QUARTER) {
            return row.YEAR_QUARTER === acsatCycle;
          }
          return true; // Include all rows if no acsatCycle specified
        });
        
        console.log('Data loaded successfully:', filteredData.length, 'records');
        console.log('Sample data:', filteredData[0]);
        setUploadedData(filteredData);
        
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }
  }, [excelData, acsatCycle]);

  // Process data for display
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) {
      return { data: [], error: 'No data available' };
    }

    console.log('Processing data for NPS Correlation Dashboard...');
    console.log('Uploaded data length:', uploadedData.length);
    console.log('CSAT Cycle Start Date:', acsatCycleStartDateFormatted);

    try {
      // Group data by Customer ID or Business Unit
      const groupedData = {};
      
      uploadedData.forEach(row => {
        // Apply date filtering
        const cssSentDate = row['CSS_SENT_DATE'] || row['CSS SENT DATE'] || row['CSAT SENT DATE'];
        const cssReceivedDate = row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'] || row['CSAT RECEIVED DATE'];
        
        const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
        const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
        
        if (!sentDateValid || !receivedDateValid) {
          return; // Skip this row
        }
        
        // Use flexible column mapping
        const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || row['Business Unit'] || 'Unknown';
        const customerId = row['CUSTOMER_ID'] || row['CUST_ID'] || row['Customer ID'] || row['Customer ID'] || 'Unknown';
        const customerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'] || row['Customer Name'] || 'Unknown';
        const respondentName = row['RESPONDENT NAME'] || row['RESPONDENT_NAME'] || row['Respondent Name'] || row['Respondent Name'] || 'Unknown';
        
        const key = groupByBU ? businessUnit : customerId;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            businessUnit,
            customerId,
            customerName,
            respondentName,
            data: []
          };
        }
        
        groupedData[key].data.push(row);
      });

      // Calculate average ratings for each perspective

      Object.values(groupedData).forEach(group => {
        group.perspectiveAverages = {};
        
        targetPerspectives.forEach(perspective => {
          // Find rows with this perspective
          const perspectiveRows = group.data.filter(row => {
            const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
            return rowPerspective && rowPerspective.toString().trim() === perspective;
          });
          
          if (perspectiveRows.length > 0) {
            // Calculate average rating
            const validRatings = perspectiveRows
              .map(row => parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']))
              .filter(rating => !isNaN(rating) && rating > 0);
            
            if (validRatings.length > 0) {
              const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
              group.perspectiveAverages[perspective] = Math.round(average * 100) / 100; // Round to 2 decimal places
            } else {
              group.perspectiveAverages[perspective] = 0;
            }
          } else {
            group.perspectiveAverages[perspective] = 0;
          }
        });
      });

      // Helper function to calculate filtered customer count for a group
      const calculateFilteredCustomerCount = (group) => {
        const uniqueCustomers = new Set();
        group.data.forEach(row => {
          const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
          if (customerId) {
            // Check if this customer's data meets the date criteria
            const sentDate = row['CSS_SENT_DATE'] || row['CSAT SENT DATE'];
            const receivedDate = row['CSS_RECEIVED_DATE'] || row['CSAT RECEIVED DATE'];
            
            // Check if either sent date or received date meets the criteria
            const sentDateValid = sentDate && isDateOnOrAfterCsatStart(sentDate);
            const receivedDateValid = receivedDate && isDateOnOrAfterCsatStart(receivedDate);
            
            if (sentDateValid || receivedDateValid) {
              uniqueCustomers.add(customerId);
            }
          }
        });
        return uniqueCustomers.size;
      };

      // Calculate individual impact scores for each group (both account-wise and BU-wise)
      Object.values(groupedData).forEach(group => {
        group.impactScores = {};
        
        // Calculate filtered customer count for this group
        group.filteredCustomerCount = calculateFilteredCustomerCount(group);
        
        const npsValue = group.perspectiveAverages?.['NPS'] || 0;
        
        // Calculate impact score for each perspective
        targetPerspectives.forEach(perspective => {
          if (perspective === 'NPS') return;
          
          const perspectiveValue = group.perspectiveAverages?.[perspective] || 0;
          
          if (npsValue > 0 && perspectiveValue > 0) {
            // Calculate correlation between this group's NPS and perspective
            // For individual customers, we'll use a simplified impact score
            // For BU groups, we'll use the same logic but consider the aggregated data
            const correlation = Math.min(Math.max((perspectiveValue - 1) / 4, 0), 1); // Normalize to 0-1
            const ratingWeight = perspectiveValue / 5; // Normalize rating to 0-1
            const volumeWeight = groupByBU ? Math.min(group.data.length / 10, 1) : 1; // Volume weight based on data points
            
            const impactScore = (correlation * 0.5 + ratingWeight * 0.3 + volumeWeight * 0.2) * 100;
            group.impactScores[perspective] = Math.round(impactScore * 10) / 10; // Round to 1 decimal place
          } else {
            group.impactScores[perspective] = 0;
          }
        });
        
        // Find the perspective with highest impact score
        const impactEntries = Object.entries(group.impactScores).filter(([key]) => key !== 'NPS');
        if (impactEntries.length > 0) {
          const highestImpact = impactEntries.reduce((max, current) => 
            current[1] > max[1] ? current : max
          );
          
          // Only set the highest impact perspective if the score is greater than 0
          if (highestImpact[1] > 0) {
            group.highestImpactPerspective = highestImpact[0];
            group.highestImpactScore = highestImpact[1];
          } else {
            group.highestImpactPerspective = 'N/A';
            group.highestImpactScore = 0;
          }
        } else {
          group.highestImpactPerspective = 'N/A';
          group.highestImpactScore = 0;
        }
      });


      // Calculate grand total for BU-wise data only
      let grandTotal = null;
      if (groupByBU && Object.values(groupedData).length > 0) {
        // Calculate total filtered customer count across all BUs
        const totalFilteredCustomers = Object.values(groupedData).reduce((sum, group) => 
          sum + (group.filteredCustomerCount || 0), 0
        );

        grandTotal = {
          businessUnit: 'GRAND TOTAL',
          customerCount: totalFilteredCustomers,
          perspectiveAverages: {},
          impactScores: {},
          highestImpactPerspective: 'N/A',
          highestImpactScore: 0,
          isGrandTotal: true
        };

        // Calculate grand total averages for each perspective
        targetPerspectives.forEach(perspective => {
          const allValues = Object.values(groupedData)
            .map(group => group.perspectiveAverages?.[perspective] || 0)
            .filter(value => value > 0);
          
          if (allValues.length > 0) {
            const grandAverage = allValues.reduce((sum, value) => sum + value, 0) / allValues.length;
            grandTotal.perspectiveAverages[perspective] = Math.round(grandAverage * 100) / 100;
          } else {
            grandTotal.perspectiveAverages[perspective] = 0;
          }
        });

        // Calculate grand total impact scores
        const grandNpsValue = grandTotal.perspectiveAverages?.['NPS'] || 0;
        console.log('Grand total NPS value:', grandNpsValue);
        console.log('Grand total perspective averages:', grandTotal.perspectiveAverages);
        
        targetPerspectives.forEach(perspective => {
          if (perspective === 'NPS') return;
          
          const perspectiveValue = grandTotal.perspectiveAverages?.[perspective] || 0;
          
          if (grandNpsValue > 0 && perspectiveValue > 0) {
            const correlation = Math.min(Math.max((perspectiveValue - 1) / 4, 0), 1);
            const ratingWeight = perspectiveValue / 5;
            const volumeWeight = Math.min(grandTotal.customerCount / 10, 1);
            
            const impactScore = (correlation * 0.5 + ratingWeight * 0.3 + volumeWeight * 0.2) * 100;
            grandTotal.impactScores[perspective] = Math.round(impactScore * 10) / 10;
            console.log(`Grand total impact score for ${perspective}:`, grandTotal.impactScores[perspective]);
          } else {
            grandTotal.impactScores[perspective] = 0;
            console.log(`Grand total impact score for ${perspective}: 0 (no data)`);
          }
        });
        
        console.log('Final grand total impact scores:', grandTotal.impactScores);

        // Find the perspective with highest grand total impact score
        const grandImpactEntries = Object.entries(grandTotal.impactScores).filter(([key]) => key !== 'NPS');
        if (grandImpactEntries.length > 0) {
          const highestGrandImpact = grandImpactEntries.reduce((max, current) => 
            current[1] > max[1] ? current : max
          );
          
          if (highestGrandImpact[1] > 0) {
            grandTotal.highestImpactPerspective = highestGrandImpact[0];
            grandTotal.highestImpactScore = highestGrandImpact[1];
          }
        }
      }

      // Calculate correlation analysis
      const correlationAnalysis = {
        correlations: {},
        impactScores: {},
        insights: []
      };

      // Collect all data points for correlation analysis
      const allDataPoints = [];
      Object.values(groupedData).forEach(group => {
        const dataPoint = {
          nps: group.perspectiveAverages?.['NPS'] || 0,
          meetingDelivery: group.perspectiveAverages?.['Meeting Delivery Commitments'] || 0,
          customerEngagement: group.perspectiveAverages?.['Customer Engagement and Relationship'] || 0,
          partnerValue: group.perspectiveAverages?.['Partner adding value to Customer Business'] || 0,
          businessUnit: group.businessUnit,
          customerId: group.customerId
        };
        allDataPoints.push(dataPoint);
      });

      // Calculate correlations with NPS
      const npsValues = allDataPoints.map(d => d.nps).filter(v => v > 0);
      
      targetPerspectives.forEach(perspective => {
        if (perspective === 'NPS') return;
        
        const perspectiveKey = perspective === 'Meeting Delivery Commitments' ? 'meetingDelivery' :
                              perspective === 'Customer Engagement and Relationship' ? 'customerEngagement' :
                              'partnerValue';
        
        const perspectiveValues = allDataPoints.map(d => d[perspectiveKey]).filter(v => v > 0);
        
        // Only calculate if we have enough data points
        if (npsValues.length >= 2 && perspectiveValues.length >= 2) {
          const correlation = calculateCorrelation(npsValues, perspectiveValues);
          const avgRating = perspectiveValues.reduce((sum, val) => sum + val, 0) / perspectiveValues.length;
          const impactScore = calculateImpactScore(correlation, avgRating, perspectiveValues.length);
          
          correlationAnalysis.correlations[perspective] = correlation;
          correlationAnalysis.impactScores[perspective] = impactScore;
        }
      });

      // Generate insights using the appropriate impact scores
      // Use the same logic as Correlation Matrix to ensure consistency
      let insightsImpactScores = {};
      let insightsCorrelations = {};
      
      // This will be set later when we have access to processedData
      // For now, use the individual correlation analysis as fallback
      insightsImpactScores = correlationAnalysis.impactScores;
      insightsCorrelations = correlationAnalysis.correlations;
      console.log('Initial insights impact scores:', insightsImpactScores);
      
      // Insights will be generated later with the correct data source

      // Convert to array and sort (enforce BU order when BU-wise)
      const BU_ORDER = ['Health Care', 'New Growth', 'Tech', 'India & UK'];
      let result = Object.values(groupedData).sort((a, b) => {
        if (groupByBU) {
          return BU_ORDER.indexOf((a.businessUnit || '').toString()) - BU_ORDER.indexOf((b.businessUnit || '').toString());
        } else {
          return a.customerName.localeCompare(b.customerName);
        }
      });

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        result = result.filter(group => 
          group.customerName.toLowerCase().includes(searchLower) ||
          group.respondentName.toLowerCase().includes(searchLower) ||
          group.businessUnit.toLowerCase().includes(searchLower)
        );
      }

      // Add grand total for BU-wise data only
      if (groupByBU && grandTotal) {
        result.push(grandTotal);
        // Also add grand total to analysis for BU-wise data
        correlationAnalysis.grandTotal = grandTotal;
        console.log('Added grand total to analysis:', grandTotal);
      }

      // Update insights with the correct impact scores to match Correlation Matrix
      if (groupByBU && grandTotal && grandTotal.impactScores) {
        // Use grand total impact scores for BU-wise data (same as Correlation Matrix)
        correlationAnalysis.insights = [];
        const grandTotalImpactScores = grandTotal.impactScores;
        const grandTotalCorrelations = correlationAnalysis.correlations;
        
        console.log('Updating insights with grand total impact scores:', grandTotalImpactScores);
        
        // Ensure all perspectives have valid impact scores
        targetPerspectives.forEach(perspective => {
          if (perspective !== 'NPS' && !grandTotalImpactScores[perspective]) {
            grandTotalImpactScores[perspective] = 0;
          }
        });
        
        const sortedImpacts = Object.entries(grandTotalImpactScores)
          .sort(([,a], [,b]) => b - a);
        
        console.log('Key Insights - updated sortedImpacts:', sortedImpacts);
        
        if (sortedImpacts.length > 0) {
          const [highestImpact, highestScore] = sortedImpacts[0];
          const highestCorrelation = grandTotalCorrelations[highestImpact] || 0;
          
          // Ensure highestScore is a valid number
          const validHighestScore = typeof highestScore === 'number' && !isNaN(highestScore) ? highestScore : 0;
          
          correlationAnalysis.insights.push(
            `🎯 **${highestImpact}** has the highest impact on NPS with a score of ${validHighestScore.toFixed(1)}%`
          );
          
          if (Math.abs(highestCorrelation) >= 0.7) {
            correlationAnalysis.insights.push(
              `📈 Strong ${highestCorrelation > 0 ? 'positive' : 'negative'} correlation (${highestCorrelation.toFixed(3)}) between NPS and ${highestImpact}`
            );
          } else if (Math.abs(highestCorrelation) >= 0.5) {
            correlationAnalysis.insights.push(
              `📊 Moderate ${highestCorrelation > 0 ? 'positive' : 'negative'} correlation (${highestCorrelation.toFixed(3)}) between NPS and ${highestImpact}`
            );
          } else {
            correlationAnalysis.insights.push(
              `📉 Weak correlation (${highestCorrelation.toFixed(3)}) between NPS and ${highestImpact}`
            );
          }

          // Add secondary insights
          if (sortedImpacts.length > 1) {
            const [secondImpact, secondScore] = sortedImpacts[1];
            correlationAnalysis.insights.push(
              `🥈 **${secondImpact}** is the second most impactful perspective (${secondScore.toFixed(1)}%)`
            );
          }
        }
      }

      return { data: result, analysis: correlationAnalysis };

    } catch (error) {
      console.error('Error processing data:', error);
      return { data: [], error: error.message };
    }
  }, [uploadedData, groupByBU, searchTerm, acsatCycleStartDateFormatted]);

  // Download Excel function
  const downloadExcel = async () => {
    if (!processedData?.data || processedData.data.length === 0) {
      alert('No data available to download');
      return;
    }

    console.log('Starting Excel download...', { 
      dataLength: processedData.data.length, 
      groupByBU, 
      targetPerspectives 
    });

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('NPS Correlation Analysis');

      // Add title
      const titleRow = worksheet.addRow(['NPS Correlation Analysis Dashboard']);
      titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF1F2937' } };
      titleRow.getCell(1).alignment = { horizontal: 'center' };
      
      // Merge cells for title (adjust range based on number of columns)
      const maxCols = groupByBU ? 6 : 8; // S.No, BU, Customer Name, RESPONDENT NAME, 3 perspectives
      const endCol = String.fromCharCode(65 + maxCols - 1); // Convert to letter
      worksheet.mergeCells(`A1:${endCol}1`);

      // Add empty row
      worksheet.addRow([]);

      // Add Impact Score Formula Section
      const formulaRow1 = worksheet.addRow(['Impact Score Calculation Formula:']);
      formulaRow1.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };
      
      const formulaRow2 = worksheet.addRow(['correlationWeight = |correlation|']);
      const formulaRow3 = worksheet.addRow(['ratingWeight = avgRating ÷ 5']);
      const formulaRow4 = worksheet.addRow(['volumeWeight = min(dataPoints ÷ 10, 1)']);
      const formulaRow5 = worksheet.addRow(['Impact Score = (correlationWeight × 0.5 + ratingWeight × 0.3 + volumeWeight × 0.2) × 100']);
      
      formulaRow5.getCell(1).font = { bold: true, color: { argb: 'FF059669' } };
      formulaRow5.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };

      const weightRow = worksheet.addRow(['Weight Distribution: Correlation (50%) + Rating Quality (30%) + Data Reliability (20%)']);
      weightRow.getCell(1).font = { italic: true, color: { argb: 'FF6B7280' } };

      // Add empty row
      worksheet.addRow([]);

      // Add correlation analysis if available (only for BU-wise data)
      if (groupByBU && processedData.analysis && Object.keys(processedData.analysis.impactScores).length > 0) {
        const analysisTitleRow = worksheet.addRow(['Correlation Analysis Results:']);
        analysisTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };

        // Add correlation matrix headers
        const matrixHeaderRow = worksheet.addRow(['Perspective', 'Correlation with NPS', 'Impact Score (%)']);
        matrixHeaderRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
          cell.alignment = { horizontal: 'center' };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });

         // Add correlation data - use grand total values for BU-wise data
         const insightsImpactScores = groupByBU && processedData.analysis.grandTotal?.impactScores 
           ? processedData.analysis.grandTotal.impactScores 
           : processedData.analysis.impactScores;
           
         Object.entries(insightsImpactScores).forEach(([perspective, impactScore]) => {
           const correlation = processedData.analysis.correlations[perspective] || 0;
           const validImpactScore = typeof impactScore === 'number' && !isNaN(impactScore) ? impactScore : 0;
           const validCorrelation = typeof correlation === 'number' && !isNaN(correlation) ? correlation : 0;
           
           const correlationRow = worksheet.addRow([
             perspective,
             validCorrelation.toFixed(3),
             validImpactScore.toFixed(1) + '%'
           ]);
          
          // Color code based on correlation strength
          const correlationCell = correlationRow.getCell(2);
          const absCorrelation = Math.abs(correlation);
          if (absCorrelation >= 0.7) {
            correlationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            correlationCell.font = { color: { argb: 'FF166534' }, bold: true };
          } else if (absCorrelation >= 0.5) {
            correlationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            correlationCell.font = { color: { argb: 'FF92400E' }, bold: true };
          } else if (absCorrelation >= 0.3) {
            correlationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
            correlationCell.font = { color: { argb: 'FF9A3412' }, bold: true };
          } else {
            correlationCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            correlationCell.font = { color: { argb: 'FF991B1B' }, bold: true };
          }

          // Style impact score cell
          const impactCell = correlationRow.getCell(3);
          impactCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
          impactCell.font = { color: { argb: 'FF0369A1' }, bold: true };

          // Add borders
          correlationRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
              right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
            };
            cell.alignment = { horizontal: 'center' };
          });
        });

        // Add empty row
        worksheet.addRow([]);
      }

      // Add dashboard data title
      const dataTitleRow = worksheet.addRow([`Dashboard Data (${groupByBU ? 'BU-Wise' : 'Account-Wise'}):`]);
      dataTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };

      const headers = groupByBU
        ? [
            'S.No', 
            'Business Unit', 
            ...targetPerspectives,
            'Meeting Delivery Commitments Impact Score',
            'Customer Engagement Impact Score',
            'Partner Value Impact Score',
            'Perspective which have highest impact on NPS'
          ]
        : [
            'S.No', 
            'Business Unit', 
            'Customer Name', 
            'RESPONDENT NAME',
            ...targetPerspectives,
            'Meeting Delivery Commitments Impact Score',
            'Customer Engagement Impact Score',
            'Partner Value Impact Score',
            'Perspective which have highest impact on NPS'
          ];

      // Add headers
      const headerRow = worksheet.addRow(headers);

      // Style headers
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Add data rows
      processedData.data.forEach((group, index) => {
        const perspectiveValues = targetPerspectives.map(perspective => 
          group.perspectiveAverages?.[perspective] || 0
        );
        
        const rowData = groupByBU
          ? [
              group.isGrandTotal ? 'TOTAL' : index + 1,
              group.businessUnit,
              ...perspectiveValues,
              group.impactScores?.['Meeting Delivery Commitments'] || 0,
              group.impactScores?.['Customer Engagement and Relationship'] || 0,
              group.impactScores?.['Partner adding value to Customer Business'] || 0,
              group.highestImpactPerspective || 'N/A'
            ]
          : [
              index + 1,
              group.businessUnit,
              group.customerName,
              group.respondentName || 'N/A',
              ...perspectiveValues,
              group.impactScores?.['Meeting Delivery Commitments'] || 0,
              group.impactScores?.['Customer Engagement and Relationship'] || 0,
              group.impactScores?.['Partner adding value to Customer Business'] || 0,
              group.highestImpactPerspective || 'N/A'
            ];
        
        const row = worksheet.addRow(rowData);
        
        // Style data rows
        row.eachCell((cell, colNumber) => {
          // Set alignment based on column type
          if (colNumber === 1) {
            // S.No column - center aligned
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber <= 4 || (groupByBU && colNumber <= 3)) {
            // Basic info columns - left aligned
            cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          } else if (colNumber <= 7 || (groupByBU && colNumber <= 6)) {
            // Perspective rating columns - center aligned
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber <= 10 || (groupByBU && colNumber <= 9)) {
            // Impact score columns - center aligned
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            // Highest impact perspective column - left aligned with wrap
            cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          }
          
          // Style grand total row differently
          if (group.isGrandTotal) {
            cell.font = { bold: true };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
          
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      });

      // Add legend for correlation colors
      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['Correlation Strength Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
      
      const legendRow1 = worksheet.addRow(['Strong (≥0.7)', 'Moderate (0.5-0.7)', 'Weak (0.3-0.5)', 'Very Weak (<0.3)']);
      legendRow1.eachCell((cell, colNumber) => {
        cell.font = { size: 9, bold: true };
        if (colNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          cell.font.color = { argb: 'FF166534' };
        } else if (colNumber === 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
          cell.font.color = { argb: 'FF92400E' };
        } else if (colNumber === 3) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
          cell.font.color = { argb: 'FF9A3412' };
        } else if (colNumber === 4) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          cell.font.color = { argb: 'FF991B1B' };
        }
        cell.alignment = { horizontal: 'center' };
      });

      // Add data interpretation legend
      worksheet.addRow([]);
      const dataLegendTitleRow = worksheet.addRow(['Data Interpretation:']);
      dataLegendTitleRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
      
      const dataLegendRow1 = worksheet.addRow(['- NPS: Average NPS rating (0-10 scale)']);
      const dataLegendRow2 = worksheet.addRow(['- Meeting Delivery Commitments: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow3 = worksheet.addRow(['- Customer Engagement and Relationship: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow4 = worksheet.addRow(['- Partner adding value to Customer Business: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow5 = worksheet.addRow([`- Data filtered by CSAT Cycle Start Date: ${acsatCycleStartDateFormatted}`]);

      // Add analysis sections for BU-wise data only
      if (groupByBU && processedData.analysis && Object.keys(processedData.analysis.impactScores).length > 0) {
        // Add NPS Impact Analysis section
        worksheet.addRow([]);
        const npsImpactTitleRow = worksheet.addRow(['📊 NPS Impact Analysis']);
        npsImpactTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1F2937' } };
        npsImpactTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

        // Add impact scores in a grid format
        const impactScores = groupByBU && processedData.analysis.grandTotal?.impactScores 
          ? processedData.analysis.grandTotal.impactScores 
          : processedData.analysis.impactScores;
        
        const sortedImpacts = Object.entries(impactScores)
          .sort(([,a], [,b]) => b - a)
          .filter(([perspective]) => perspective !== 'NPS');

        if (sortedImpacts.length > 0) {
          // Add headers for impact analysis
          const impactHeaderRow = worksheet.addRow(['Perspective', 'Impact Score (%)', 'Rank']);
          impactHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            cell.alignment = { horizontal: 'center' };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          });

          // Add impact score data
          sortedImpacts.forEach(([perspective, score], index) => {
            const impactRow = worksheet.addRow([
              perspective,
              typeof score === 'number' ? score.toFixed(1) : '0.0',
              index + 1
            ]);
            
            // Color code based on rank
            const scoreCell = impactRow.getCell(2);
            const rankCell = impactRow.getCell(3);
            
            if (index === 0) {
              scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light green
              rankCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
            } else if (index === 1) {
              scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } }; // Light amber
              rankCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF3C7' } };
            } else {
              scoreCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } }; // Light gray
              rankCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            }
            
            impactRow.eachCell((cell) => {
              cell.alignment = { horizontal: 'center' };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            });
          });
        }

        // Add Key Insights section
        worksheet.addRow([]);
        const keyInsightsTitleRow = worksheet.addRow(['💡 Key Insights']);
        keyInsightsTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1F2937' } };
        keyInsightsTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

        // Add insights
        if (processedData.analysis.insights && processedData.analysis.insights.length > 0) {
          processedData.analysis.insights.forEach((insight, index) => {
            const insightRow = worksheet.addRow([insight.replace(/\*\*(.*?)\*\*/g, '$1')]);
            insightRow.getCell(1).font = { size: 11 };
            insightRow.getCell(1).alignment = { wrapText: true };
            insightRow.height = 20;
          });
        } else {
          worksheet.addRow(['No insights available']);
        }
      }

      // Set column widths
      const colWidths = groupByBU
        ? [8, 25, 15, 15, 30, 30, 30, 25, 25, 25, 35] // Added widths for impact score columns
        : [8, 25, 15, 25, 15, 30, 30, 30, 25, 25, 25, 35]; // Added widths for impact score columns
      worksheet.columns = colWidths.map(width => ({ width }));

      console.log('Excel file created successfully, starting download...');

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NPS_Correlation_Analysis_${groupByBU ? 'BU_Wise' : 'Account_Wise'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      console.log('Excel download completed successfully');

    } catch (error) {
      console.error('Error downloading Excel:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      alert(`Error downloading Excel file: ${error.message}`);
    }
  };

  if (processedData.error) {
    return (
      <DashboardContainer>
        <Header>
          <Title>NPS Correlation Analysis Dashboard</Title>
          <BackButton onClick={onBack}>
            <ArrowLeft size={16} />
            Back
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
          Error: {processedData.error}
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>NPS Correlation Analysis Dashboard</Title>
        <BackButton onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </BackButton>
      </Header>

      {uploadedData && (
        <SuccessMessage>
          ✅ Data loaded successfully! Found {uploadedData.length} records from Excel file.
        </SuccessMessage>
      )}

      <ControlsContainer>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ToggleButton 
            active={groupByBU}
            onClick={() => setGroupByBU(!groupByBU)}
          >
            {groupByBU ? '👥 Show by Customer' : '🏢 Show by BU Only'}
          </ToggleButton>
          <DownloadButton onClick={downloadExcel}>
            <Download size={16} />
            Download Excel
          </DownloadButton>
        </div>
        
        <SearchContainer>
          <SearchLabel htmlFor="search">
            🔍 Search:
          </SearchLabel>
          <SearchInput
            id="search"
            type="text"
            placeholder={groupByBU ? "Search Business Unit..." : "Search Customer..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              Clear
            </ClearButton>
          )}
        </SearchContainer>
      </ControlsContainer>

      {/* Impact Score Formula Section */}
      <FormulaContainer>
        <FormulaTitle>
          🧮 Impact Score Calculation Formula
        </FormulaTitle>
        
        <FormulaBox>
          <FormulaLine>
            <Variable>correlationWeight</Variable> = |<Variable>correlation</Variable>| <Comment>// Absolute value of Pearson correlation coefficient</Comment>
          </FormulaLine>
          
          <FormulaLine>
            <Variable>ratingWeight</Variable> = <Variable>avgRating</Variable> ÷ 5 <Comment>// Normalize rating to 0-1 scale</Comment>
          </FormulaLine>
          
          <FormulaLine>
            <Variable>volumeWeight</Variable> = min(<Variable>dataPoints</Variable> ÷ 10, 1) <Comment>// Normalize data points, capped at 1.0</Comment>
          </FormulaLine>
          
          <FormulaLine>
            <Variable>Impact Score</Variable> = (<Variable>correlationWeight</Variable> <Operator>×</Operator> <Weight>0.5</Weight> <Operator>+</Operator> <Variable>ratingWeight</Variable> <Operator>×</Operator> <Weight>0.3</Weight> <Operator>+</Operator> <Variable>volumeWeight</Variable> <Operator>×</Operator> <Weight>0.2</Weight>) <Operator>×</Operator> <Weight>100</Weight>
          </FormulaLine>
        </FormulaBox>
        
        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
          <strong>Weight Distribution:</strong> Correlation (50%) + Rating Quality (30%) + Data Reliability (20%)
        </div>
      </FormulaContainer>

       {/* Analysis Section - Only for BU-wise view */}
       {groupByBU && processedData.analysis && Object.keys(processedData.analysis.impactScores).length > 0 && (
        <AnalysisContainer>
          <AnalysisTitle>
            📊 NPS Impact Analysis
          </AnalysisTitle>
          
          <ImpactGrid>
            {Object.entries(
              groupByBU && processedData.analysis.grandTotal?.impactScores 
                ? processedData.analysis.grandTotal.impactScores 
                : processedData.analysis.impactScores
            )
              .sort(([,a], [,b]) => b - a)
              .map(([perspective, score], index) => {
                console.log(`NPS Impact Analysis - ${perspective}:`, score);
                return (
                <ImpactCard key={perspective} isHighest={index === 0}>
                  <ImpactTitle>{perspective}</ImpactTitle>
                  <ImpactValue>{score.toFixed(1)}%</ImpactValue>
                  <ImpactLabel>
                    Impact Score
                    {index === 0 && ' 🏆'}
                  </ImpactLabel>
                </ImpactCard>
                );
              })}
          </ImpactGrid>

          <CorrelationMatrix>
            <MatrixTitle>Correlation Matrix</MatrixTitle>
            <MatrixTable>
              <thead>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Perspective</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Correlation with NPS</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center' }}>Impact Score</th>
                </tr>
              </thead>
                <tbody>
                  {Object.entries(
                    groupByBU && processedData.analysis.grandTotal?.impactScores 
                      ? processedData.analysis.grandTotal.impactScores 
                      : processedData.analysis.impactScores
                  ).map(([perspective, impactScore]) => {
                    console.log(`Correlation Matrix - ${perspective}:`, impactScore);
                    const correlation = processedData.analysis.correlations[perspective] || 0;
                    const validImpactScore = typeof impactScore === 'number' && !isNaN(impactScore) ? impactScore : 0;
                    const validCorrelation = typeof correlation === 'number' && !isNaN(correlation) ? correlation : 0;
                    
                    return (
                      <tr key={perspective}>
                        <td style={{ padding: '0.5rem', fontWeight: '600' }}>{perspective}</td>
                        <MatrixCell value={Math.abs(validCorrelation)}>
                          {validCorrelation.toFixed(3)}
                        </MatrixCell>
                        <MatrixCell value={validImpactScore / 100}>
                          {validImpactScore.toFixed(1)}%
                        </MatrixCell>
                      </tr>
                    );
                  })}
                </tbody>
            </MatrixTable>
          </CorrelationMatrix>

          <InsightsContainer>
            <InsightTitle>💡 Key Insights</InsightTitle>
            {processedData.analysis.insights.map((insight, index) => (
              <InsightText key={index} dangerouslySetInnerHTML={{ 
                __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }} />
            ))}
          </InsightsContainer>
        </AnalysisContainer>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell isFirstColumn>S.No</TableHeaderCell>
              <TableHeaderCell>Business Unit</TableHeaderCell>
              {!groupByBU && <TableHeaderCell>Customer Name</TableHeaderCell>}
              {!groupByBU && <TableHeaderCell>RESPONDENT NAME</TableHeaderCell>}
              <TableHeaderCell>NPS</TableHeaderCell>
              <TableHeaderCell>Meeting Delivery Commitments</TableHeaderCell>
              <TableHeaderCell>Customer Engagement and Relationship</TableHeaderCell>
              <TableHeaderCell>Partner adding value to Customer Business</TableHeaderCell>
              <TableHeaderCell>Meeting Delivery Commitments Impact Score</TableHeaderCell>
              <TableHeaderCell>Customer Engagement Impact Score</TableHeaderCell>
              <TableHeaderCell>Partner Value Impact Score</TableHeaderCell>
              <TableHeaderCell>Perspective which have highest impact on NPS</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {processedData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={groupByBU ? 12 : 13} style={{ textAlign: 'center' }}>
                  <NoDataMessage>
                    {searchTerm ? 'No data found matching your search criteria.' : 'No data available.'}
                  </NoDataMessage>
                </TableCell>
              </TableRow>
            ) : (
              processedData.data.map((group, index) => (
                <TableRow 
                  key={index}
                  style={{
                    backgroundColor: group.isGrandTotal ? '#f8fafc' : 'inherit',
                    fontWeight: group.isGrandTotal ? 'bold' : 'normal',
                    borderTop: group.isGrandTotal ? '2px solid #3b82f6' : 'none'
                  }}
                >
                  <TableCell isFirstColumn>
                    {group.isGrandTotal ? 'TOTAL' : index + 1}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.businessUnit}
                  </TableCell>
                  {!groupByBU && <TableCell>{group.customerName}</TableCell>}
                  {!groupByBU && <TableCell>{group.respondentName || 'N/A'}</TableCell>}
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.perspectiveAverages?.['NPS'] || 0}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.perspectiveAverages?.['Meeting Delivery Commitments'] || 0}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.perspectiveAverages?.['Customer Engagement and Relationship'] || 0}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.perspectiveAverages?.['Partner adding value to Customer Business'] || 0}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.impactScores?.['Meeting Delivery Commitments'] || 0}%
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.impactScores?.['Customer Engagement and Relationship'] || 0}%
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.impactScores?.['Partner adding value to Customer Business'] || 0}%
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {group.highestImpactPerspective || 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollIndicator>
          ← Scroll horizontally to view all columns →
        </ScrollIndicator>
      </TableContainer>
    </DashboardContainer>
  );
};

export default NPSCorrelationDashboard;
