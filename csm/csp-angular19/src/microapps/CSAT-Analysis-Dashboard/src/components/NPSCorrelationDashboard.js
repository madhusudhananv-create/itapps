import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { normalizeBusinessUnitDisplay, businessUnitsMatch } from '../utils/normalizeBusinessUnitDisplay';
import {
  getCsatReceivedDateFromRow,
  getCsatSentDateFromRow,
  getYearQuarterFromRow,
  isDateOnOrAfterAcsatCycleStart,
  normalizeAcsatRowCanonicalFields,
  rowsFromSheetJson,
  yearQuarterMatchesCycle,
} from '../utils/acsatExcelRowUtils';

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
  background: #1E3A8A; /* Dark Blue */
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: white;
  border: 1px solid #ffffff;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.4;
  min-width: 120px;
  max-width: 150px;

  &:first-child {
    position: sticky;
    left: 0;
    background: #1E3A8A; /* Dark Blue */
    z-index: 11;
  }
`;

const SortableHeaderCell = styled(TableHeaderCell)`
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1e40af;
  }
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
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
  border: 1px solid #6b7280;
  white-space: nowrap;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;

  &:first-child {
    position: sticky;
    left: 0;
    background: inherit;
    z-index: 1;
    font-weight: 600;
  }
`;

const NPSCell = styled.td`
  padding: 1rem;
  border: 1px solid #6b7280;
  white-space: nowrap;
  text-align: center;
  font-weight: 700;
  background-color: ${props => {
    // For respondent view, use category-based colors
    if (props.category) {
      if (props.category === 'Promoter') return '#C6EFCE'; // Green for Promoters
      if (props.category === 'Passive') return '#FFA500'; // Orange for Passives
      if (props.category === 'Detractor') return '#FF0000'; // Red for Detractors
    }
    // For account/BU views, use score-based colors
    const score = parseFloat(props.score) || 0;
    if (score >= 75) return '#C6EFCE'; // Light Green 2 ≥75% (Great) - Excel standard
    if (score >= 0 && score < 75) return '#FFA500'; // Orange 0% to 74.99% (Good) (Excel standard)
    return '#FF0000'; // Red <0% (Needs Attention) (Excel standard)
  }};
  color: ${props => {
    // For respondent view, use category-based text colors
    if (props.category) {
      if (props.category === 'Promoter') return '#000000'; // Black text for Green
      if (props.category === 'Passive') return '#000000'; // Black text for Orange
      if (props.category === 'Detractor') return '#ffffff'; // White text for Red
    }
    // For account/BU views, use score-based text colors
    const score = parseFloat(props.score) || 0;
    if (score >= 75) return '#000000'; // Black text for Light Green 2
    if (score >= 0 && score < 75) return '#000000'; // Black text for Orange
    return '#ffffff'; // White text for Red
  }};
`;

const PerspectiveCell = styled.td`
  padding: 1rem;
  border: 1px solid #6b7280;
  white-space: nowrap;
  text-align: center;
  font-weight: 700;
  position: relative;
  z-index: 2;
  background-color: ${props => {
    const rating = parseFloat(props.rating) || 0;
    if (rating >= 4.5) return '#C6EFCE'; // Green >= 4.5 (Black Text)
    if (rating >= 4 && rating < 4.5) return '#FFA500'; // Orange 4 to 4.49 (Black Text)
    return '#FF0000'; // Red < 4 (White Text)
  }};
  color: ${props => {
    const rating = parseFloat(props.rating) || 0;
    if (rating >= 4.5) return '#000000'; // Black text for Green
    if (rating >= 4 && rating < 4.5) return '#000000'; // Black text for Orange
    return '#ffffff'; // White text for Red
  }};
  
  /* Increase specificity to override row background */
  &&& {
    background-color: ${props => {
      const rating = parseFloat(props.rating) || 0;
      if (rating >= 4.5) return '#C6EFCE';
      if (rating >= 4 && rating < 4.5) return '#FFA500';
      return '#FF0000';
    }};
    color: ${props => {
      const rating = parseFloat(props.rating) || 0;
      if (rating >= 4.5) return '#000000';
      if (rating >= 4 && rating < 4.5) return '#000000';
      return '#ffffff';
    }};
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

const LegendContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
`;

const LegendTitle = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
`;

const LegendGrid = styled.div`
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: ${props => props.color || '#f3f4f6'};
`;

const LegendText = styled.span`
  font-size: 0.875rem;
  color: #374151;
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
  const [sentReceivedData, setSentReceivedData] = useState(null); // Data from "CSAT sent and received Report" sheet
  const [viewType, setViewType] = useState('respondent'); // 'respondent', 'account', or 'bu'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  // Get ACSAT cycle from global context
  const { acsatCycle } = useCSATContext();

  // Account order for account-wise dashboard (only for account-wise view)
  const accountOrder = [
    'Premier Healthcare Solutions Inc',
    'Blue Cross Blue Shield Association BCBSA',
    'Frontier Airlines INC',
    'Tufts Medicine',
    'Premier - Horizon II - Covenant Health',
    'BronxCare Health System',
    'AgFirst Farm Credit Bank',
    'embecta MEDICAL II LLC',
    'Avaya LLC',
    'Northern Trust Company',
    'Jewish Board of Family and Childrens Services JBFCS',
    'Apollo Hospitals',
    'Aditya Birla Capital Digital Limited',
    'Healthfirst',
    'Firstsource Solutions Ltd',
    'Ooma Inc.',
    'Palo Alto Networks',
    'Hachette Book Group',
    'INFOBLOX INC.',
    'Arista Networks India Private Limited',
    'AthenaHealth',
    'VOCERA COMMUNICATIONS INDIA PRIVATE LIMITED',
    'Zoll Data Systems',
    'Foundation Building Materials, LLC',
    'CINQ CONNECT LLC',
    'ESSEN CARE MANAGEMENT LLC',
    'AgileOne',
    'Resonetics',
    'General Mills Private Limited',
    'Computer Data Source LLC',
    'Aditya Birla Sunlife AMC Limited',
    'Nerdio, Inc.',
    'CloudCall Ltd'
  ];

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

  const isDateOnOrAfterCsatStart = (dateValue) => {
    if (!dateValue || !acsatCycleStartDateFormatted) return true;
    return isDateOnOrAfterAcsatCycleStart(dateValue, acsatCycleStartDateFormatted);
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
        
        const data = rowsFromSheetJson(jsonData);
        const filteredData = data
          .map((row) => normalizeAcsatRowCanonicalFields(row))
          .filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));
        
        console.log('Data loaded successfully:', filteredData.length, 'records');
        console.log('Sample data:', filteredData[0]);
        setUploadedData(filteredData);

        // Load "CSAT sent and received Report" sheet
        const sentReceivedSheetName = excelData.SheetNames.find(name => 
          name.toLowerCase().includes('csat sent and received') || 
          name.toLowerCase().includes('sent and received report')
        );
        
        if (sentReceivedSheetName) {
          const sentReceivedWorksheet = excelData.Sheets[sentReceivedSheetName];
          const sentReceivedJsonData = XLSX.utils.sheet_to_json(sentReceivedWorksheet, { header: 1 });
          
          if (sentReceivedJsonData.length > 0) {
            const filteredSentReceivedData = rowsFromSheetJson(sentReceivedJsonData)
              .map((row) => normalizeAcsatRowCanonicalFields(row))
              .filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));

            console.log('Sent and received data loaded successfully:', filteredSentReceivedData.length, 'records');
            setSentReceivedData(filteredSentReceivedData);
          }
        } else {
          console.warn('CSAT sent and received Report sheet not found');
          setSentReceivedData([]);
        }
        
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
        const cssSentDate = getCsatSentDateFromRow(row);
        const cssReceivedDate = getCsatReceivedDateFromRow(row);
        
        const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
        const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
        
        if (!sentDateValid || !receivedDateValid) {
          return; // Skip this row
        }
        
        // Use flexible column mapping
        const businessUnit = normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || row['Business Unit'] || 'Unknown');
        const customerId = row['CUSTOMER_ID'] || row['CUST_ID'] || row['Customer ID'] || row['Customer ID'] || 'Unknown';
        const customerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'] || row['Customer Name'] || 'Unknown';
        const respondentName = row['RESPONDENT NAME'] || row['RESPONDENT_NAME'] || row['Respondent Name'] || row['Respondent Name'] || 'Unknown';
        
        // Determine grouping key based on view type
        let key;
        if (viewType === 'bu') {
          // BU view: group by businessUnit only
          key = businessUnit;
        } else if (viewType === 'account') {
          // Account Wise view: group by customerId only (aggregate all respondents)
          key = customerId;
        } else {
          // Respondent view: group by customerId + respondentName to show all respondents per customer
          key = `${customerId}|||${respondentName}`;
        }
        
        if (!groupedData[key]) {
          groupedData[key] = {
            businessUnit,
            customerId,
            customerName,
            respondentName: viewType === 'account' ? '' : respondentName, // Empty for account view
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

        // Calculate NPS for Account-wise and BU-wise views
        // Always calculate NPS (even if no NPS rows exist) to ensure groups with perspective data are displayed
        if (viewType === 'account' || viewType === 'bu') {
          // Filter data for NPS perspective with date filtering
          const npsRows = group.data.filter(row => {
            // Check PERSPECTIVE
            const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
            if (!rowPerspective || rowPerspective.toString().trim() !== 'NPS') {
              return false;
            }

            // Check date filtering
            const cssSentDate = getCsatSentDateFromRow(row);
            const cssReceivedDate = getCsatReceivedDateFromRow(row);
            
            const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
            const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
            
            if (!sentDateValid || !receivedDateValid) {
              return false;
            }

            return true;
          });

          // Calculate NPS: (count(Rating equal to 9 or 10) - count(Rating equal to less than 7)) * 100
          let promoters = 0; // Rating 9 or 10
          let detractors = 0; // Rating < 7

          npsRows.forEach(row => {
            const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']);
            if (!isNaN(rating)) {
              if (rating === 9 || rating === 10) {
                promoters++;
              } else if (rating < 7) {
                detractors++;
              }
            }
          });

          let nps;
          if (viewType === 'account') {
            // For Account-wise view: (promoters - detractors) / Responded * 100
            // Calculate Responded from "CSAT sent and received Report" sheet
            // Grouped by CUSTOMER_ID or CUST_ID
            const customerId = group.customerId;
            let surveysReceived = 0;

            if (sentReceivedData && sentReceivedData.length > 0 && customerId) {
              const customerSurveys = sentReceivedData.filter(row => {
                const rowCustomerId = row['CUSTOMER_ID'] || row['CUST_ID'];
                const cssSentDate = getCsatSentDateFromRow(row);
                const cssReceivedDate = getCsatReceivedDateFromRow(row);
                
                // Match customer ID
                if (!rowCustomerId || rowCustomerId.toString().trim() !== customerId.toString().trim()) {
                  return false;
                }
                
                // Check date filtering
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
                const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

                if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                  return false;
                }

                // Count if CSS_RECEIVED_DATE exists (or STATUS is Completed, which fully overrides the date check)
                return isCompletedStatus && !!cssReceivedDate;
              });

              surveysReceived = customerSurveys.length;
            }

            // Calculate NPS with denominator
            // When count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
            if (surveysReceived > 0) {
              nps = ((promoters - detractors) / surveysReceived) * 100;
            } else {
              // When count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
              nps = '-';
            }
          } else if (viewType === 'bu') {
            // For BU-wise view: (promoters - detractors) / Responded * 100
            // Calculate Responded from "CSAT sent and received Report" sheet
            // Grouped by BUSINESS UNIT
            const businessUnit = group.businessUnit;
            let surveysReceived = 0;

            if (sentReceivedData && sentReceivedData.length > 0 && businessUnit) {
              const buSurveys = sentReceivedData.filter(row => {
                const rowBusinessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
                const cssSentDate = getCsatSentDateFromRow(row);
                const cssReceivedDate = getCsatReceivedDateFromRow(row);
                
                // Match Business Unit
                if (!rowBusinessUnit || !businessUnitsMatch(rowBusinessUnit, businessUnit) || rowBusinessUnit === 'Unknown') {
                  return false;
                }
                
                // Check date filtering
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
                const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

                if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                  return false;
                }

                // Count if CSS_RECEIVED_DATE exists (or STATUS is Completed, which fully overrides the date check)
                return isCompletedStatus && !!cssReceivedDate;
              });

              surveysReceived = buSurveys.length;
            }

            // Calculate NPS with denominator
            if (surveysReceived > 0) {
              nps = ((promoters - detractors) / surveysReceived) * 100;
            } else {
              // When count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
              nps = '-';
            }
          } else {
            // For Respondent view: (promoters - detractors) * 100 (no denominator change)
            nps = (promoters - detractors) * 100;
          }

          // Store NPS value - if it's '-', keep it as string, otherwise round to 2 decimal places
          // When count(CSAT RECEIVED DATE) = 0, NPS is set to '-' to ensure rows with perspective data are displayed
          group.perspectiveAverages['NPS'] = (nps === '-') ? '-' : Math.round(nps * 100) / 100;
        }
        
        // Ensure NPS is set for account/BU views even if there's no NPS data in group.data but there is perspective data
        // This handles cases where count(CSAT RECEIVED DATE) = 0 from "CSAT sent and received Report"
        if ((viewType === 'account' || viewType === 'bu') && !group.perspectiveAverages['NPS']) {
          const hasPerspectiveData = (group.perspectiveAverages['Meeting Delivery Commitments'] > 0 ||
                                      group.perspectiveAverages['Customer Engagement and Relationship'] > 0 ||
                                      group.perspectiveAverages['Partner adding value to Customer Business'] > 0);
          
          if (hasPerspectiveData) {
            // Check surveysReceived from "CSAT sent and received Report" to determine if NPS should be '-'
            let surveysReceived = 0;
            
            if (viewType === 'account' && sentReceivedData && sentReceivedData.length > 0 && group.customerId) {
              const customerSurveys = sentReceivedData.filter(row => {
                const rowCustomerId = row['CUSTOMER_ID'] || row['CUST_ID'];
                const cssSentDate = getCsatSentDateFromRow(row);
                const cssReceivedDate = getCsatReceivedDateFromRow(row);
                
                if (!rowCustomerId || rowCustomerId.toString().trim() !== group.customerId.toString().trim()) {
                  return false;
                }
                
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
                const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

                if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                  return false;
                }

                return isCompletedStatus && !!cssReceivedDate;
              });
              surveysReceived = customerSurveys.length;
            } else if (viewType === 'bu' && sentReceivedData && sentReceivedData.length > 0 && group.businessUnit) {
              const buSurveys = sentReceivedData.filter(row => {
                const rowBusinessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
                const cssSentDate = getCsatSentDateFromRow(row);
                const cssReceivedDate = getCsatReceivedDateFromRow(row);
                
                if (!rowBusinessUnit || !businessUnitsMatch(rowBusinessUnit, group.businessUnit) || rowBusinessUnit === 'Unknown') {
                  return false;
                }
                
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
                const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

                if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                  return false;
                }

                return isCompletedStatus && !!cssReceivedDate;
              });
              surveysReceived = buSurveys.length;
            }
            
            // If count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
            if (surveysReceived === 0) {
              group.perspectiveAverages['NPS'] = '-';
            }
          }
        }
        
        // Calculate NPS category for Respondent view only
        if (viewType === 'respondent' && group.data.length > 0) {
          // Filter data for NPS perspective with date filtering
          const npsRows = group.data.filter(row => {
            // Check PERSPECTIVE
            const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
            if (!rowPerspective || rowPerspective.toString().trim() !== 'NPS') {
              return false;
            }

            // Check date filtering
            const cssSentDate = getCsatSentDateFromRow(row);
            const cssReceivedDate = getCsatReceivedDateFromRow(row);
            
            const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
            const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
            
            if (!sentDateValid || !receivedDateValid) {
              return false;
            }

            return true;
          });

          // Get the NPS rating value (0-10) for this respondent
          let npsRating = null;
          if (npsRows.length > 0) {
            const rating = parseFloat(npsRows[0]['RATING'] || npsRows[0]['Rating'] || npsRows[0]['rating'] || npsRows[0]['RATING_VALUE'] || npsRows[0]['Rating Value']);
            if (!isNaN(rating) && rating >= 0 && rating <= 10) {
              npsRating = rating;
            }
          }

          // Determine NPS category based on rating
          let npsCategory = '';
          if (npsRating !== null) {
            if (npsRating === 9 || npsRating === 10) {
              npsCategory = 'Promoter';
            } else if (npsRating === 7 || npsRating === 8) {
              npsCategory = 'Passive';
            } else if (npsRating < 7) {
              npsCategory = 'Detractor';
            }
          }

          // Store category for display
          group.npsCategory = npsCategory;
        }
      });

      // Helper function to calculate filtered customer count for a group
      const calculateFilteredCustomerCount = (group) => {
        const uniqueCustomers = new Set();
        group.data.forEach(row => {
          const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
          if (customerId) {
            // Check if this customer's data meets the date criteria
            const sentDate = getCsatSentDateFromRow(row);
            const receivedDate = getCsatReceivedDateFromRow(row);
            
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
        
        const npsValue = group.perspectiveAverages?.['NPS'];
        // Handle '-' NPS values - treat as 0 for impact score calculation
        const npsValueForCalculation = (npsValue === '-' || npsValue === null || npsValue === undefined) ? 0 : (npsValue || 0);
        
        // Calculate impact score for each perspective
        targetPerspectives.forEach(perspective => {
          if (perspective === 'NPS') return;
          
          const perspectiveValue = group.perspectiveAverages?.[perspective] || 0;
          
          if (npsValueForCalculation > 0 && perspectiveValue > 0) {
            // Calculate correlation between this group's NPS and perspective
            // For individual customers, we'll use a simplified impact score
            // For BU groups, we'll use the same logic but consider the aggregated data
            const correlation = Math.min(Math.max((perspectiveValue - 1) / 4, 0), 1); // Normalize to 0-1
            const ratingWeight = perspectiveValue / 5; // Normalize rating to 0-1
            const volumeWeight = viewType === 'bu' ? Math.min(group.data.length / 10, 1) : 1; // Volume weight based on data points
            
            const impactScore = (correlation * 0.5 + ratingWeight * 0.3 + volumeWeight * 0.2) * 100;
            group.impactScores[perspective] = Math.round(impactScore * 10) / 10; // Round to 1 decimal place
          } else {
            group.impactScores[perspective] = 0;
          }
        });
        
        // Determine highest and lowest impact perspectives based on ratings and color coding (only for account-wise and BU-wise views)
        if (viewType === 'account' || viewType === 'bu') {
          const avgEntries = Object.entries(group.perspectiveAverages || {}).filter(([p]) => p !== 'NPS');
          if (avgEntries.length > 0) {
            const highest = avgEntries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
            const lowest = avgEntries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));
            const highestValue = typeof highest[1] === 'number' ? highest[1] : parseFloat(highest[1]) || 0;
            const lowestValue = typeof lowest[1] === 'number' ? lowest[1] : parseFloat(lowest[1]) || 0;
            
            // Find all perspectives with the same highest rating value
            const allHighest = avgEntries
              .filter(([_, value]) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                return Math.abs(numValue - highestValue) < 0.01; // Allow for floating point precision
              })
              .map(([name]) => name);
            
            // Find all perspectives with the same lowest rating value
            const allLowest = avgEntries
              .filter(([_, value]) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                return Math.abs(numValue - lowestValue) < 0.01; // Allow for floating point precision
              })
              .map(([name]) => name);
            
            // Check if all perspectives have amber color (>= 4 && < 4.5)
            const allAmber = avgEntries.every(([_, value]) => {
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              return numValue >= 4 && numValue < 4.5;
            });
            
            // Check if all perspectives have equal rating values (within 0.01 tolerance)
            const allEqual = avgEntries.length > 0 && avgEntries.every(([_, value]) => {
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              return Math.abs(numValue - highestValue) < 0.01;
            });
            
            // Initialize both to hyphen
            group.highestImpactPerspective = '-';
            group.lowestImpactPerspective = '-';
            
            // Special case: If all perspectives are equal and all are amber, show "-" in both columns
            if (allEqual && allAmber) {
              group.highestImpactPerspective = '-';
              group.lowestImpactPerspective = '-';
            }
            // Special case: If all perspectives are amber (but not equal), apply both rules together
            else if (allAmber) {
              // Rule 1: If lowest is amber -> display in negative impact
              // Rule 2: If highest is amber -> display in positive impact
              // Both rules apply together
              if (lowestValue >= 4 && lowestValue < 4.5) {
                group.lowestImpactPerspective = allLowest.join(', ');
              }
              if (highestValue >= 4 && highestValue < 4.5) {
                group.highestImpactPerspective = allHighest.join(', ');
              }
            }
            // Check if highest rating is Green (>= 4.5) - goes to positive impact
            else if (highestValue >= 4.5) {
              group.highestImpactPerspective = allHighest.join(', ');
              group.lowestImpactPerspective = '-';
            }
            // Check if lowest rating is Red (< 4) - goes to negative impact (priority over highest amber)
            else if (lowestValue < 4) {
              group.highestImpactPerspective = '-';
              group.lowestImpactPerspective = allLowest.join(', ');
            }
            // Check if highest rating is Amber (>= 4 && < 4.5) - goes to positive impact
            else if (highestValue >= 4 && highestValue < 4.5) {
              group.highestImpactPerspective = allHighest.join(', ');
              group.lowestImpactPerspective = '-';
            }
            // Check if lowest rating is Amber (>= 4 && < 4.5) - goes to negative impact
            else if (lowestValue >= 4 && lowestValue < 4.5) {
              group.highestImpactPerspective = '-';
              group.lowestImpactPerspective = allLowest.join(', ');
            }
            
            group.highestImpactScore = highestValue;
            group.lowestImpactScore = lowestValue;
          } else {
            group.highestImpactPerspective = 'N/A';
            group.highestImpactScore = 0;
            group.lowestImpactPerspective = 'N/A';
            group.lowestImpactScore = 0;
          }
        } else {
          // For respondent view, keep original logic
        const avgEntries = Object.entries(group.perspectiveAverages || {}).filter(([p]) => p !== 'NPS');
        if (avgEntries.length > 0) {
          const highest = avgEntries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
          const highestValue = typeof highest[1] === 'number' ? highest[1] : parseFloat(highest[1]) || 0;
          group.highestImpactPerspective = highestValue > 0 ? highest[0] : 'N/A';
          group.highestImpactScore = highestValue;
            
            // Determine lowest impact perspective (highest negative impact) based on lowest perspective average (excluding NPS)
            const lowest = avgEntries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));
            const lowestValue = typeof lowest[1] === 'number' ? lowest[1] : parseFloat(lowest[1]) || 0;
            group.lowestImpactPerspective = lowestValue > 0 ? lowest[0] : 'N/A';
            group.lowestImpactScore = lowestValue;
        } else {
          group.highestImpactPerspective = 'N/A';
          group.highestImpactScore = 0;
            group.lowestImpactPerspective = 'N/A';
            group.lowestImpactScore = 0;
          }
        }
      });


      // Calculate grand total for both BU-wise and Respondent Name views
      let grandTotal = null;
      const filteredGroupedData = Object.values(groupedData).filter(group => {
        return group.businessUnit && group.businessUnit.toString().trim() !== 'Unknown';
      });

      if (filteredGroupedData.length > 0) {
        // Calculate total filtered customer count
        const totalFilteredCustomers = filteredGroupedData.reduce((sum, group) => 
          sum + (group.filteredCustomerCount || 0), 0
        );

        grandTotal = {
          businessUnit: viewType === 'bu' ? 'Org Level' : '',
          customerName: viewType === 'bu' ? '' : 'GRAND TOTAL',
          respondentName: '',
          customerId: '',
          customerCount: totalFilteredCustomers,
          perspectiveAverages: {},
          impactScores: {},
          highestImpactPerspective: 'N/A',
          highestImpactScore: 0,
          lowestImpactPerspective: 'N/A',
          lowestImpactScore: 0,
          isGrandTotal: true
        };

        // Calculate grand total averages for each perspective
        if (viewType === 'bu') {
          // For BU view: calculate directly from raw data for only the three specified perspectives
          const buGrandTotalPerspectives = [
            'Meeting Delivery Commitments',
            'Customer Engagement and Relationship',
            'Partner adding value to Customer Business'
          ];
          
          buGrandTotalPerspectives.forEach(perspective => {
            // Filter raw data by:
            // 1. Date: CSAT SENT DATE and CSAT RECEIVED DATE >= acsatCycleStartDateFormatted
            // 2. YEAR-QUARTER == acsatCycle
            // 3. PERSPECTIVE == current perspective
            // 4. Business Unit != 'Unknown'
            const filteredRatings = uploadedData.filter(row => {
              // Check date filtering
              const cssSentDate = getCsatSentDateFromRow(row);
              const cssReceivedDate = getCsatReceivedDateFromRow(row);
              
              const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
              const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
              
              if (!sentDateValid || !receivedDateValid) {
                return false;
              }

              // Check YEAR-QUARTER filtering
              const yearQuarter = getYearQuarterFromRow(row);
              if (acsatCycle && yearQuarter && !yearQuarterMatchesCycle(yearQuarter, acsatCycle)) {
                return false;
              }

              // Check PERSPECTIVE
              const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
              if (!rowPerspective || rowPerspective.toString().trim() !== perspective) {
                return false;
              }

              // Check Business Unit != 'Unknown'
              const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
              if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
                return false;
              }

              return true;
            });

            // Extract RATING values and calculate average
            const validRatings = filteredRatings
              .map(row => parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']))
              .filter(rating => !isNaN(rating) && rating > 0);
            
            if (validRatings.length > 0) {
              const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
              grandTotal.perspectiveAverages[perspective] = Math.round(average * 100) / 100;
          } else {
            grandTotal.perspectiveAverages[perspective] = 0;
          }
        });

          // Calculate NPS for Grand Total in BU view: (count(Rating equal to 9 or 10) - count(Rating equal to less than 7)) * 100
          const buNpsRows = uploadedData.filter(row => {
            // Check PERSPECTIVE
            const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
            if (!rowPerspective || rowPerspective.toString().trim() !== 'NPS') {
              return false;
            }

            // Check date filtering
            const cssSentDate = getCsatSentDateFromRow(row);
            const cssReceivedDate = getCsatReceivedDateFromRow(row);
            
            const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
            const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
            
            if (!sentDateValid || !receivedDateValid) {
              return false;
            }

            // Check YEAR-QUARTER filtering
            const yearQuarter = getYearQuarterFromRow(row);
            if (acsatCycle && yearQuarter && !yearQuarterMatchesCycle(yearQuarter, acsatCycle)) {
              return false;
            }

            // Check Business Unit != 'Unknown'
            const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
            if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
              return false;
            }

            return true;
          });

          let buPromoters = 0;
          let buDetractors = 0;
          buNpsRows.forEach(row => {
            const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']);
            if (!isNaN(rating)) {
              if (rating === 9 || rating === 10) {
                buPromoters++;
              } else if (rating < 7) {
                buDetractors++;
              }
            }
          });

          // Calculate Responded for BU-wise Grand Total
          // From "CSAT sent and received Report" sheet, grouped by all BUs (not 'Unknown')
          let buSurveysReceived = 0;
          if (sentReceivedData && sentReceivedData.length > 0) {
            const buSurveys = sentReceivedData.filter(row => {
              const rowBusinessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
              const cssSentDate = getCsatSentDateFromRow(row);
              const cssReceivedDate = getCsatReceivedDateFromRow(row);
              
              // Exclude Unknown Business Unit
              if (!rowBusinessUnit || rowBusinessUnit === 'Unknown') {
                return false;
              }
              
              // Check date filtering
              const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
              const isCompletedStatus = statusVal === 'completed';
              const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
              const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

              if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                return false;
              }

              // Count if CSS_RECEIVED_DATE exists (or STATUS is Completed, which fully overrides the date check)
              return isCompletedStatus && !!cssReceivedDate;
            });

            buSurveysReceived = buSurveys.length;
          }

          // Calculate NPS with denominator
          if (buSurveysReceived > 0) {
            grandTotal.perspectiveAverages['NPS'] = ((buPromoters - buDetractors) / buSurveysReceived) * 100;
          } else {
            // When count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
            grandTotal.perspectiveAverages['NPS'] = '-';
          }
        } else if (viewType === 'account') {
          // For Account view: calculate directly from raw data for only the three specified perspectives
          const accountGrandTotalPerspectives = [
            'Meeting Delivery Commitments',
            'Customer Engagement and Relationship',
            'Partner adding value to Customer Business'
          ];
          
          accountGrandTotalPerspectives.forEach(perspective => {
            // Filter raw data by:
            // 1. Date: CSAT SENT DATE and CSAT RECEIVED DATE >= acsatCycleStartDateFormatted
            // 2. YEAR-QUARTER == acsatCycle
            // 3. PERSPECTIVE == current perspective
            // 4. Business Unit != 'Unknown'
            const filteredRatings = uploadedData.filter(row => {
              // Check date filtering
              const cssSentDate = getCsatSentDateFromRow(row);
              const cssReceivedDate = getCsatReceivedDateFromRow(row);
              
              const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
              const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
              
              if (!sentDateValid || !receivedDateValid) {
                return false;
              }

              // Check YEAR-QUARTER filtering
              const yearQuarter = getYearQuarterFromRow(row);
              if (acsatCycle && yearQuarter && !yearQuarterMatchesCycle(yearQuarter, acsatCycle)) {
                return false;
              }

              // Check PERSPECTIVE
              const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
              if (!rowPerspective || rowPerspective.toString().trim() !== perspective) {
                return false;
              }

              // Check Business Unit != 'Unknown'
              const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
              if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
                return false;
              }

              return true;
            });

            // Extract RATING values and calculate average
            const validRatings = filteredRatings
              .map(row => parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']))
              .filter(rating => !isNaN(rating) && rating > 0);
            
            if (validRatings.length > 0) {
              const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
              grandTotal.perspectiveAverages[perspective] = Math.round(average * 100) / 100;
          } else {
              grandTotal.perspectiveAverages[perspective] = 0;
            }
          });
          
          // Calculate NPS for Grand Total in Account view: (count(Rating equal to 9 or 10) - count(Rating equal to less than 7)) * 100
          const accountNpsRows = uploadedData.filter(row => {
            // Check PERSPECTIVE
            const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
            if (!rowPerspective || rowPerspective.toString().trim() !== 'NPS') {
              return false;
            }

            // Check date filtering
            const cssSentDate = getCsatSentDateFromRow(row);
            const cssReceivedDate = getCsatReceivedDateFromRow(row);
            
            const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
            const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
            
            if (!sentDateValid || !receivedDateValid) {
              return false;
            }

            // Check YEAR-QUARTER filtering
            const yearQuarter = getYearQuarterFromRow(row);
            if (acsatCycle && yearQuarter && !yearQuarterMatchesCycle(yearQuarter, acsatCycle)) {
              return false;
            }

            // Check Business Unit != 'Unknown'
            const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
            if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
              return false;
            }

            return true;
          });

          let accountPromoters = 0;
          let accountDetractors = 0;
          accountNpsRows.forEach(row => {
            const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']);
            if (!isNaN(rating)) {
              if (rating === 9 || rating === 10) {
                accountPromoters++;
              } else if (rating < 7) {
                accountDetractors++;
              }
            }
          });

          // Calculate Responded for Account-wise Grand Total
          // From "CSAT sent and received Report" sheet, grouped by all customer IDs
          let accountSurveysReceived = 0;
          if (sentReceivedData && sentReceivedData.length > 0) {
            const accountSurveys = sentReceivedData.filter(row => {
              const rowCustomerId = row['CUSTOMER_ID'] || row['CUST_ID'];
              const cssSentDate = getCsatSentDateFromRow(row);
              const cssReceivedDate = getCsatReceivedDateFromRow(row);
              
              // Must have customer ID
              if (!rowCustomerId) {
                return false;
              }
              
              // Check date filtering
              const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
              const isCompletedStatus = statusVal === 'completed';
              const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
              const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

              if (!sentDateValid || !isCompletedStatus || !receivedDateValid) {
                return false;
              }

              // Check Business Unit != 'Unknown'
              const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
              if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
                return false;
              }

              // Count if CSS_RECEIVED_DATE exists (or STATUS is Completed, which fully overrides the date check)
              return isCompletedStatus && !!cssReceivedDate;
            });

            accountSurveysReceived = accountSurveys.length;
          }

          // Calculate NPS with denominator
          if (accountSurveysReceived > 0) {
            grandTotal.perspectiveAverages['NPS'] = ((accountPromoters - accountDetractors) / accountSurveysReceived) * 100;
          } else {
            // When count(CSAT RECEIVED DATE) = 0, set NPS to '-' to display row with perspective values
            grandTotal.perspectiveAverages['NPS'] = '-';
          }
        } else {
          // For Respondent Name view: calculate directly from raw data with proper filtering (all perspectives including NPS)
          targetPerspectives.forEach(perspective => {
            // Filter raw data by:
            // 1. Date: CSAT SENT DATE and CSAT RECEIVED DATE >= acsatCycleStartDateFormatted
            // 2. YEAR-QUARTER == acsatCycle
            // 3. PERSPECTIVE == current perspective
            // 4. Business Unit != 'Unknown'
            const filteredRatings = uploadedData.filter(row => {
              // Check date filtering
              const cssSentDate = getCsatSentDateFromRow(row);
              const cssReceivedDate = getCsatReceivedDateFromRow(row);
              
              const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
              const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);
              
              if (!sentDateValid || !receivedDateValid) {
                return false;
              }

              // Check YEAR-QUARTER filtering
              const yearQuarter = getYearQuarterFromRow(row);
              if (acsatCycle && yearQuarter && !yearQuarterMatchesCycle(yearQuarter, acsatCycle)) {
                return false;
              }

              // Check PERSPECTIVE
              const rowPerspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
              if (!rowPerspective || rowPerspective.toString().trim() !== perspective) {
                return false;
              }

              // Check Business Unit != 'Unknown'
              const businessUnit = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown';
              if (!businessUnit || businessUnit.toString().trim() === 'Unknown') {
                return false;
              }

              return true;
            });

            // Extract RATING values and calculate average
            const validRatings = filteredRatings
              .map(row => parseFloat(row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']))
              .filter(rating => !isNaN(rating) && rating > 0);
            
            if (validRatings.length > 0) {
              const average = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
              grandTotal.perspectiveAverages[perspective] = Math.round(average * 100) / 100;
            } else {
              grandTotal.perspectiveAverages[perspective] = 0;
            }
          });
        }

        // Determine grand total highest and lowest impact perspectives based on ratings and color coding (only for account-wise and BU-wise views)
        if (viewType === 'account' || viewType === 'bu') {
          const gtAvgEntries = Object.entries(grandTotal.perspectiveAverages || {}).filter(([p]) => p !== 'NPS');
          if (gtAvgEntries.length > 0) {
            const highestGT = gtAvgEntries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
            const lowestGT = gtAvgEntries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));
            const highestGTValue = typeof highestGT[1] === 'number' ? highestGT[1] : parseFloat(highestGT[1]) || 0;
            const lowestGTValue = typeof lowestGT[1] === 'number' ? lowestGT[1] : parseFloat(lowestGT[1]) || 0;
            
            // Find all perspectives with the same highest rating value
            const allHighestGT = gtAvgEntries
              .filter(([_, value]) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                return Math.abs(numValue - highestGTValue) < 0.01; // Allow for floating point precision
              })
              .map(([name]) => name);
            
            // Find all perspectives with the same lowest rating value
            const allLowestGT = gtAvgEntries
              .filter(([_, value]) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
                return Math.abs(numValue - lowestGTValue) < 0.01; // Allow for floating point precision
              })
              .map(([name]) => name);
            
            // Check if all perspectives have amber color (>= 4 && < 4.5)
            const allAmberGT = gtAvgEntries.every(([_, value]) => {
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              return numValue >= 4 && numValue < 4.5;
            });
            
            // Check if all perspectives have equal rating values (within 0.01 tolerance)
            const allEqualGT = gtAvgEntries.length > 0 && gtAvgEntries.every(([_, value]) => {
              const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
              return Math.abs(numValue - highestGTValue) < 0.01;
            });
            
            // Initialize both to hyphen
            grandTotal.highestImpactPerspective = '-';
            grandTotal.lowestImpactPerspective = '-';
            
            // Special case: If all perspectives are equal and all are amber, show "-" in both columns
            if (allEqualGT && allAmberGT) {
              grandTotal.highestImpactPerspective = '-';
              grandTotal.lowestImpactPerspective = '-';
            }
            // Special case: If all perspectives are amber (but not equal), apply both rules together
            else if (allAmberGT) {
              // Rule 1: If lowest is amber -> display in negative impact
              // Rule 2: If highest is amber -> display in positive impact
              // Both rules apply together
              if (lowestGTValue >= 4 && lowestGTValue < 4.5) {
                grandTotal.lowestImpactPerspective = allLowestGT.join(', ');
              }
              if (highestGTValue >= 4 && highestGTValue < 4.5) {
                grandTotal.highestImpactPerspective = allHighestGT.join(', ');
              }
            }
            // Check if highest rating is Green (>= 4.5) - goes to positive impact
            else if (highestGTValue >= 4.5) {
              grandTotal.highestImpactPerspective = allHighestGT.join(', ');
              grandTotal.lowestImpactPerspective = '-';
            }
            // Check if lowest rating is Red (< 4) - goes to negative impact (priority over highest amber)
            else if (lowestGTValue < 4) {
              grandTotal.highestImpactPerspective = '-';
              grandTotal.lowestImpactPerspective = allLowestGT.join(', ');
            }
            // Check if highest rating is Amber (>= 4 && < 4.5) - goes to positive impact
            else if (highestGTValue >= 4 && highestGTValue < 4.5) {
              grandTotal.highestImpactPerspective = allHighestGT.join(', ');
              grandTotal.lowestImpactPerspective = '-';
            }
            // Check if lowest rating is Amber (>= 4 && < 4.5) - goes to negative impact
            else if (lowestGTValue >= 4 && lowestGTValue < 4.5) {
              grandTotal.highestImpactPerspective = '-';
              grandTotal.lowestImpactPerspective = allLowestGT.join(', ');
            }
            
            grandTotal.highestImpactScore = highestGTValue;
            grandTotal.lowestImpactScore = lowestGTValue;
          }
        } else {
          // For respondent view, keep original logic
        const gtAvgEntries = Object.entries(grandTotal.perspectiveAverages || {}).filter(([p]) => p !== 'NPS');
        if (gtAvgEntries.length > 0) {
          const highestGT = gtAvgEntries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));
          const highestGTValue = typeof highestGT[1] === 'number' ? highestGT[1] : parseFloat(highestGT[1]) || 0;
          if (highestGTValue > 0) {
            grandTotal.highestImpactPerspective = highestGT[0];
            grandTotal.highestImpactScore = highestGTValue;
            }
            
            // Determine grand total lowest impact (highest negative impact) based on lowest perspective average (excluding NPS)
            const lowestGT = gtAvgEntries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));
            const lowestGTValue = typeof lowestGT[1] === 'number' ? lowestGT[1] : parseFloat(lowestGT[1]) || 0;
            if (lowestGTValue > 0) {
              grandTotal.lowestImpactPerspective = lowestGT[0];
              grandTotal.lowestImpactScore = lowestGTValue;
            }
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

      // Convert to array and filter out rows with "Unknown" business unit
      let result = Object.values(groupedData).filter(group => {
        return group.businessUnit && group.businessUnit.toString().trim() !== 'Unknown';
      });

      // Separate Grand Total from regular data
      const regularData = result.filter(group => !group.isGrandTotal);
      const grandTotalData = result.filter(group => group.isGrandTotal);

      // Sort regular data based on sortConfig or default sorting
      let sortedRegularData = [...regularData];
      
      if (sortConfig.key) {
        // Apply user-selected sorting
        sortedRegularData.sort((a, b) => {
          let aValue, bValue;
          
          // Get values based on sort key
          switch (sortConfig.key) {
            case 'businessUnit':
              aValue = (a.businessUnit || '').toString().trim().toLowerCase();
              bValue = (b.businessUnit || '').toString().trim().toLowerCase();
              break;
            case 'customerName':
              aValue = (a.customerName || '').toString().trim().toLowerCase();
              bValue = (b.customerName || '').toString().trim().toLowerCase();
              break;
            case 'respondentName':
              aValue = (a.respondentName || '').toString().trim().toLowerCase();
              bValue = (b.respondentName || '').toString().trim().toLowerCase();
              break;
            case 'nps':
              // Handle '-' values - treat as lowest value
              const aNps = a.perspectiveAverages?.['NPS'];
              const bNps = b.perspectiveAverages?.['NPS'];
              if (aNps === '-' || aNps === null || aNps === undefined) aValue = -Infinity;
              else aValue = typeof aNps === 'number' ? aNps : parseFloat(aNps) || 0;
              if (bNps === '-' || bNps === null || bNps === undefined) bValue = -Infinity;
              else bValue = typeof bNps === 'number' ? bNps : parseFloat(bNps) || 0;
              break;
            case 'meetingDeliveryCommitments':
              aValue = parseFloat(a.perspectiveAverages?.['Meeting Delivery Commitments']) || 0;
              bValue = parseFloat(b.perspectiveAverages?.['Meeting Delivery Commitments']) || 0;
              break;
            case 'customerEngagement':
              aValue = parseFloat(a.perspectiveAverages?.['Customer Engagement and Relationship']) || 0;
              bValue = parseFloat(b.perspectiveAverages?.['Customer Engagement and Relationship']) || 0;
              break;
            case 'partnerAddingValue':
              aValue = parseFloat(a.perspectiveAverages?.['Partner adding value to Customer Business']) || 0;
              bValue = parseFloat(b.perspectiveAverages?.['Partner adding value to Customer Business']) || 0;
              break;
            case 'highestImpact':
              aValue = (a.highestImpactPerspective || '').toString().trim().toLowerCase();
              bValue = (b.highestImpactPerspective || '').toString().trim().toLowerCase();
              break;
            case 'lowestImpact':
              aValue = (a.lowestImpactPerspective || '').toString().trim().toLowerCase();
              bValue = (b.lowestImpactPerspective || '').toString().trim().toLowerCase();
              break;
            default:
              return 0;
          }
          
          // Compare values
          if (aValue < bValue) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      } else {
        // Apply default sorting (enforce BU order when BU-wise, sort by account order for account view, alphabetical for respondent view)
      const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];
        sortedRegularData.sort((a, b) => {
        if (viewType === 'bu') {
          const aBU = (a.businessUnit || '').toString().trim();
          const bBU = (b.businessUnit || '').toString().trim();
          const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
          const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
          // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        } else if (viewType === 'account') {
          // Account view: sort by accountOrder
          const aCustomerName = (a.customerName || '').toString().trim();
          const bCustomerName = (b.customerName || '').toString().trim();
          
          const aIndex = accountOrder.findIndex(name => 
            aCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(aCustomerName.toLowerCase())
          );
          const bIndex = accountOrder.findIndex(name => 
            bCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(bCustomerName.toLowerCase())
          );
          
          // If not found in predefined list, put at the end
          const aPos = aIndex === -1 ? 999 : aIndex;
          const bPos = bIndex === -1 ? 999 : bIndex;
          return aPos - bPos;
        } else {
          // Respondent view: Sort by customer name first, then by respondent name
          const customerCompare = a.customerName.localeCompare(b.customerName);
          if (customerCompare !== 0) return customerCompare;
          return (a.respondentName || '').localeCompare(b.respondentName || '');
        }
      });
      }
      
      // Combine sorted regular data with grand total (always at the end)
      result = [...sortedRegularData, ...grandTotalData];

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        result = result.filter(group => 
          group.customerName.toLowerCase().includes(searchLower) ||
          group.respondentName.toLowerCase().includes(searchLower) ||
          group.businessUnit.toLowerCase().includes(searchLower)
        );
      }

      // Grand total is already added in the sorting logic above
      if (grandTotal) {
        // Also add grand total to analysis
        correlationAnalysis.grandTotal = grandTotal;
        console.log('Added grand total to analysis:', grandTotal);
      }

      // Update insights with the correct impact scores to match Correlation Matrix
      if (viewType === 'bu' && grandTotal && grandTotal.impactScores) {
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
  }, [uploadedData, sentReceivedData, viewType, searchTerm, acsatCycleStartDateFormatted, acsatCycle, accountOrder, sortConfig]);

  // Download Excel function
  const downloadExcel = async () => {
    if (!processedData?.data || processedData.data.length === 0) {
      alert('No data available to download');
      return;
    }

    console.log('Starting Excel download...', { 
      dataLength: processedData.data.length, 
      viewType, 
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
      // BU view: Sr. No. (1), BU (1), NPS (1), 3 perspectives (Meeting, Engagement, Partner), Highest Positive Impact (1), Highest Negative Impact (1) = 8
      // Account view: Sr. No. (1), BU (1), Account Name (1), NPS (1), 3 perspectives, Highest Positive Impact (1), Highest Negative Impact (1) = 9
      // Respondent view: Sr. No. (1), BU (1), Account Name (1), Respondent Name (1), 4 perspectives (NPS included) = 9
      const maxCols = viewType === 'bu' ? 8 : viewType === 'account' ? 9 : 9;
      const endCol = String.fromCharCode(65 + maxCols - 1); // Convert to letter
      worksheet.mergeCells(`A1:${endCol}1`);

      // Add empty row
      worksheet.addRow([]);

      // Impact Score Formula Section removed

      // Correlation analysis removed

      // Add dashboard data title
      const viewTypeLabel = viewType === 'bu' ? 'BU-Wise' : viewType === 'account' ? 'Account-Wise' : 'Respondent-Wise';
      const dataTitleRow = worksheet.addRow([`Dashboard Data (${viewTypeLabel}):`]);
      dataTitleRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1F2937' } };

      // Filter perspectives: for Account and BU views, include NPS, then add other perspectives (excluding NPS from perspectivesForView)
      const otherPerspectives = targetPerspectives.filter(p => p !== 'NPS');

      const headers = viewType === 'bu'
        ? [
            'Sr. No.', 
            'Business Unit', 
            'NPS',
            ...otherPerspectives,
            'Perspective(s) which has/ have the highest positive impact on NPS',
            'Perspective(s) which has/ have the highest negative impact on NPS'
          ]
        : viewType === 'account'
        ? [
            'Sr. No.', 
            'Business Unit', 
            'Account Name',
            'NPS',
            ...otherPerspectives,
            'Perspective(s) which has/ have the highest positive impact on NPS',
            'Perspective(s) which has/ have the highest negative impact on NPS'
          ]
        : [
            'Sr. No.', 
            'Business Unit', 
            'Account Name', 
            'Respondent Name',
            ...targetPerspectives
          ];

      // Add headers
      const headerRow = worksheet.addRow(headers);

      // Style headers - Dark Blue (#1E3A8A)
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
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
        const otherPerspectiveValues = otherPerspectives.map(perspective => {
          const value = group.perspectiveAverages?.[perspective];
          return (value !== undefined && value !== null && !isNaN(value)) ? value : 0;
        });
        const npsValueRaw = group.perspectiveAverages?.['NPS'];
        // Handle '-' or blank NPS values - keep as '-' if it's a string, otherwise parse as number
        const npsValue = (npsValueRaw === '-' || npsValueRaw === null || npsValueRaw === undefined || npsValueRaw === '') 
          ? '-' 
          : (!isNaN(npsValueRaw) 
          ? parseFloat((Math.round(npsValueRaw * 100) / 100).toFixed(2))
            : '-');
        
        let rowData;
        if (viewType === 'bu') {
          rowData = [
            group.isGrandTotal ? '' : index + 1,
              normalizeBusinessUnitDisplay(group.businessUnit) || '',
              npsValue,
              ...otherPerspectiveValues,
              group.highestImpactPerspective || '-',
              group.lowestImpactPerspective || '-'
          ];
        } else if (viewType === 'account') {
          rowData = [
            group.isGrandTotal ? '' : index + 1,
            normalizeBusinessUnitDisplay(group.businessUnit) || '',
            group.customerName || '',
            npsValue,
            ...otherPerspectiveValues,
            group.highestImpactPerspective || '-',
            group.lowestImpactPerspective || '-'
          ];
        } else {
          const allPerspectiveValues = targetPerspectives.map(perspective => {
            const value = group.perspectiveAverages?.[perspective];
            if (perspective === 'NPS' && viewType === 'respondent' && group.npsCategory) {
              // For respondent view, include category in NPS value (integer only, no decimals)
              const npsValue = (value !== undefined && value !== null && !isNaN(value)) ? value : 0;
              return `${Math.round(npsValue)} (${group.npsCategory})`;
            }
            return (value !== undefined && value !== null && !isNaN(value)) ? value : 0;
          });
          rowData = [
            group.isGrandTotal ? '' : index + 1,
              normalizeBusinessUnitDisplay(group.businessUnit) || '',
              group.customerName || '',
              group.respondentName || 'N/A',
              ...allPerspectiveValues
            ];
        }
        
        const row = worksheet.addRow(rowData);
        
        // Style data rows
        row.eachCell((cell, colNumber) => {
          // Set alignment based on column type
          // Determine if this column is numeric
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
          // Column 4: Respondent Name (text if exists), NPS and perspective columns: numeric, Highest Impact: text
          let isNumericColumn = false;
          if (viewType === 'bu') {
            // BU view: Sr. No. (1), BU (2), NPS (3), 3 perspectives (4-6), Highest Impact (7)
            isNumericColumn = colNumber >= 3 && colNumber <= 6;
          } else if (viewType === 'account') {
            // Account view: Sr. No. (1), BU (2), Account Name (3), NPS (4), 3 perspectives (5-7), Highest Impact (8)
            isNumericColumn = colNumber === 4 || (colNumber >= 5 && colNumber <= 7);
          } else if (viewType === 'respondent') {
            // Respondent view: Sr. No. (1), BU (2), Account Name (3), Respondent Name (4), NPS (5), 3 perspectives (6-8), Highest Impact (9)
            isNumericColumn = colNumber === 5 || (colNumber >= 6 && colNumber <= 8);
          }
          
          // Set number format for numeric columns
          if (isNumericColumn) {
            cell.numFmt = '0.00'; // Decimal format for NPS and perspective values
          }
          
          cell.alignment = { 
            horizontal: isNumericColumn ? 'center' : 'left', 
            vertical: 'middle', 
            wrapText: !isNumericColumn,
            indent: !isNumericColumn ? 1 : 0,
            readingOrder: 'left-to-right'
          };
          
          // Apply NPS color coding for all view types (BU-wise, account-wise, and respondent-wise)
          // NPS column index: BU view = column 3, Account view = column 4, Respondent view = column 5
          const npsColumnIndex = viewType === 'bu' ? 3 : (viewType === 'account' ? 4 : 5);
            if (colNumber === npsColumnIndex) {
              const npsValue = cell.value;
            // For respondent view, NPS value is a string with category, use category-based colors
            if (viewType === 'respondent' && typeof npsValue === 'string' && npsValue.includes('(')) {
              // Extract category from string like "100.00 (Promoter)"
              const categoryMatch = npsValue.match(/\(([^)]+)\)/);
              if (categoryMatch) {
                const category = categoryMatch[1].trim();
                if (category === 'Promoter') {
                  // Green for Promoters - Black text
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else if (category === 'Passive') {
                  // Orange for Passives - Black text
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else if (category === 'Detractor') {
                  // Red for Detractors - White text
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
                }
                
                // Reapply alignment after color coding
                cell.alignment = { 
                  horizontal: 'center', 
                  vertical: 'middle',
                  wrapText: false,
                  indent: 0,
                  readingOrder: 'left-to-right'
                };
              }
            } else if (npsValue === '-') {
              // No color for '-' NPS values
              cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
              cell.alignment = { 
                horizontal: 'center', 
                vertical: 'middle',
                wrapText: false,
                indent: 0,
                readingOrder: 'left-to-right'
              };
            } else if (npsValue !== null && npsValue !== undefined && !isNaN(npsValue)) {
                const npsScore = parseFloat(npsValue);
                if (npsScore >= 75) {
                  // Light Green 2 ≥75% (Great) - Black text - Excel standard
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else if (npsScore >= 0 && npsScore < 75) {
                  // Orange 0% to 74.99% (Good) - Black text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else {
                  // Red <0% (Needs Attention) - White text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
                }
                
                // Reapply alignment after color coding
                cell.alignment = { 
                  horizontal: 'center', 
                  vertical: 'middle',
                  wrapText: false,
                  indent: 0,
                  readingOrder: 'left-to-right'
                };
              }
            }
          
          // Apply perspective column color coding for all view types
          if (viewType !== 'respondent') {
            
            // Apply perspective column color coding
            // Perspective columns: BU view = columns 4-6, Account view = columns 5-7
            const perspectiveColumnStart = viewType === 'bu' ? 4 : 5;
            const perspectiveColumnEnd = viewType === 'bu' ? 6 : 7;
            if (colNumber >= perspectiveColumnStart && colNumber <= perspectiveColumnEnd) {
              const perspectiveValue = cell.value;
              if (perspectiveValue !== null && perspectiveValue !== undefined && !isNaN(perspectiveValue)) {
                const rating = parseFloat(perspectiveValue);
                if (rating >= 4.5) {
                  // Green >= 4.5 - Black text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else if (rating >= 4 && rating < 4.5) {
                  // Orange 4 to 4.49 - Black text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else {
                  // Red < 4 - White text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
                }
                
                // Reapply alignment after color coding
                cell.alignment = { 
                  horizontal: 'center', 
                  vertical: 'middle',
                  wrapText: false,
                  indent: 0,
                  readingOrder: 'left-to-right'
                };
              }
            }
          } else {
            // For respondent view, apply perspective color coding
            // Respondent view: NPS (5), perspectives (6-8)
            if (colNumber >= 6 && colNumber <= 8) {
              const perspectiveValue = cell.value;
              if (perspectiveValue !== null && perspectiveValue !== undefined && !isNaN(perspectiveValue)) {
                const rating = parseFloat(perspectiveValue);
                if (rating >= 4.5) {
                  // Green >= 4.5 - Black text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else if (rating >= 4 && rating < 4.5) {
                  // Orange 4 to 4.49 - Black text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { ...cell.font, color: { argb: 'FF000000' }, bold: true };
                } else {
                  // Red < 4 - White text (Excel standard)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
                }
                
                // Reapply alignment after color coding
                cell.alignment = { 
                  horizontal: 'center', 
                  vertical: 'middle',
                  wrapText: false,
                  indent: 0,
                  readingOrder: 'left-to-right'
                };
              }
            }
          }
          
          // Style grand total row differently
          if (group.isGrandTotal) {
            cell.font = { ...cell.font, bold: true };
            // Only apply gray background if not NPS column and not perspective columns (for all view types)
            const isNPSColumn = (viewType === 'bu' && colNumber === 3) || (viewType === 'account' && colNumber === 4) || (viewType === 'respondent' && colNumber === 5);
            const isPerspectiveColumn = (viewType === 'bu' && colNumber >= 4 && colNumber <= 6) || 
                                       (viewType === 'account' && colNumber >= 5 && colNumber <= 7) ||
                                       (viewType === 'respondent' && colNumber >= 6 && colNumber <= 8);
            if (!isNPSColumn && !isPerspectiveColumn) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            }
          }
          
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
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
        cell.alignment = { horizontal: 'left' };
      });

      // Add NPS color legend for all view types (BU-wise, account-wise, and respondent-wise)
        worksheet.addRow([]);
        const npsLegendTitleRow = worksheet.addRow(['NPS Score Legend:']);
        npsLegendTitleRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
        
        const npsLegendRow1 = worksheet.addRow(['Green: ≥75%', 'Orange: 0% to 74.99%', 'Red: <0%']);
        npsLegendRow1.eachCell((cell, colNumber) => {
          cell.font = { size: 9, bold: true };
          if (colNumber === 1) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            cell.font.color = { argb: 'FF000000' };
          } else if (colNumber === 2) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange (Excel standard)
            cell.font.color = { argb: 'FF000000' };
          } else if (colNumber === 3) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel standard)
            cell.font.color = { argb: 'FFFFFFFF' };
          }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = { horizontal: 'left' };
        });
      
      // Add Perspective color legend
      worksheet.addRow([]);
      const perspectiveLegendTitleRow = worksheet.addRow(['Perspective Rating Legend (Meeting Delivery Commitments, Customer Engagement and Relationship, Partner adding value to Customer Business):']);
      perspectiveLegendTitleRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
      
      const perspectiveLegendRow1 = worksheet.addRow(['Green: ≥4.5 (Black Text)', 'Orange: 4 to 4.49 (Black Text)', 'Red: <4 (White Text)']);
      perspectiveLegendRow1.eachCell((cell, colNumber) => {
        cell.font = { size: 9, bold: true };
        if (colNumber === 1) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 2) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange (Excel standard)
          cell.font.color = { argb: 'FF000000' };
        } else if (colNumber === 3) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel standard)
          cell.font.color = { argb: 'FFFFFFFF' };
        }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { horizontal: 'left' };
      });

      // Add data interpretation legend
      worksheet.addRow([]);
      const dataLegendTitleRow = worksheet.addRow(['Data Interpretation:']);
      dataLegendTitleRow.getCell(1).font = { bold: true, size: 10, color: { argb: 'FF1F2937' } };
      
      const dataLegendRow1 = worksheet.addRow(['- NPS: Average NPS rating (0-10 scale)']);
      const dataLegendRow2 = worksheet.addRow(['- Meeting Delivery Commitments: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow3 = worksheet.addRow(['- Customer Engagement and Relationship: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow4 = worksheet.addRow(['- Partner adding value to Customer Business: Average rating for this perspective (1-5 scale)']);
      const dataLegendRow5 = worksheet.addRow([`- Data filtered by CSAT Cycle Start Date: ${acsatCycleStartDateFormatted || 'N/A'}`]);

      // Add analysis sections for BU-wise data only
      if (viewType === 'bu' && processedData.analysis && processedData.analysis.impactScores && Object.keys(processedData.analysis.impactScores).length > 0) {
        // Add NPS Impact Analysis section
        worksheet.addRow([]);
        const npsImpactTitleRow = worksheet.addRow(['📊 NPS Impact Analysis']);
        npsImpactTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1F2937' } };
        npsImpactTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };

        // Add impact scores in a grid format
        const impactScores = viewType === 'bu' && processedData.analysis.grandTotal?.impactScores 
          ? processedData.analysis.grandTotal.impactScores 
          : (processedData.analysis.impactScores || {});
        
        const sortedImpacts = impactScores && typeof impactScores === 'object'
          ? Object.entries(impactScores)
          .sort(([,a], [,b]) => b - a)
              .filter(([perspective]) => perspective !== 'NPS')
          : [];

        if (sortedImpacts.length > 0) {
          // Add headers for impact analysis
          const impactHeaderRow = worksheet.addRow(['Perspective', 'Impact Score (%)', 'Rank']);
          impactHeaderRow.eachCell((cell) => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            cell.alignment = { horizontal: 'left' };
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
              cell.alignment = { horizontal: 'left' };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            });
          });
        }

      // Key Insights section removed
      }

      // Set column widths
      // BU view: Sr. No., BU, NPS, 3 perspectives (Meeting, Engagement, Partner), Highest Positive Impact, Highest Negative Impact = 8 columns
      // Account view: Sr. No., BU, Account Name, NPS, 3 perspectives, Highest Positive Impact, Highest Negative Impact = 9 columns
      // Respondent view: Sr. No., BU, Account Name, Respondent Name, 4 perspectives (NPS included) = 9 columns
      let colWidths;
      if (viewType === 'bu') {
        colWidths = [8, 25, 15, 30, 30, 30, 35, 35]; // Sr. No., BU, NPS, Meeting, Engagement, Partner, Highest Positive Impact, Highest Negative Impact
      } else if (viewType === 'account') {
        colWidths = [8, 25, 25, 15, 30, 30, 30, 35, 35]; // Sr. No., BU, Account Name, NPS, Meeting, Engagement, Partner, Highest Positive Impact, Highest Negative Impact
      } else {
        colWidths = [8, 25, 25, 15, 30, 30, 30, 30]; // Sr. No., BU, Account Name, Respondent Name, NPS, Meeting, Engagement, Partner
      }
      worksheet.columns = colWidths.map(width => ({ width }));

      console.log('Excel file created successfully, starting download...');

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const viewTypeSuffix = viewType === 'bu' ? 'BU_Wise' : viewType === 'account' ? 'Account_Wise' : 'Respondent_Wise';
      link.href = url;
      link.download = `NPS_Correlation_Analysis_${viewTypeSuffix}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
            active={viewType === 'respondent'}
            onClick={() => setViewType('respondent')}
          >
            Show by Respondent Name
          </ToggleButton>
          <ToggleButton 
            active={viewType === 'account'}
            onClick={() => setViewType('account')}
          >
            Show by Account
          </ToggleButton>
          <ToggleButton 
            active={viewType === 'bu'}
            onClick={() => setViewType('bu')}
          >
            🏢 Show by BU Only
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
            placeholder={viewType === 'bu' ? "Search Business Unit..." : viewType === 'account' ? "Search Account..." : "Search Customer..."}
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

      {/* Impact Score Formula Section removed as per request */}

       {/* Analysis Section - Only for BU-wise view */}
      {/* Correlation Matrix and Key Insights removed as per request */}

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
              <SortableHeaderCell onClick={() => {
                setSortConfig(prev => ({
                  key: prev.key === 'businessUnit' && prev.direction === 'asc' ? 'businessUnit' : 'businessUnit',
                  direction: prev.key === 'businessUnit' && prev.direction === 'asc' ? 'desc' : 'asc'
                }));
              }}>
                Business Unit
                <SortIcon>
                  {sortConfig.key === 'businessUnit' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeaderCell>
              {viewType !== 'bu' && (
                <SortableHeaderCell onClick={() => {
                  setSortConfig(prev => ({
                    key: prev.key === 'customerName' && prev.direction === 'asc' ? 'customerName' : 'customerName',
                    direction: prev.key === 'customerName' && prev.direction === 'asc' ? 'desc' : 'asc'
                  }));
                }}>
                  Account Name
                  <SortIcon>
                    {sortConfig.key === 'customerName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </SortIcon>
                </SortableHeaderCell>
              )}
              {viewType === 'respondent' && (
                <SortableHeaderCell onClick={() => {
                  setSortConfig(prev => ({
                    key: prev.key === 'respondentName' && prev.direction === 'asc' ? 'respondentName' : 'respondentName',
                    direction: prev.key === 'respondentName' && prev.direction === 'asc' ? 'desc' : 'asc'
                  }));
                }}>
                  Respondent Name
                  <SortIcon>
                    {sortConfig.key === 'respondentName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </SortIcon>
                </SortableHeaderCell>
              )}
              <SortableHeaderCell onClick={() => {
                setSortConfig(prev => ({
                  key: prev.key === 'nps' && prev.direction === 'asc' ? 'nps' : 'nps',
                  direction: prev.key === 'nps' && prev.direction === 'asc' ? 'desc' : 'asc'
                }));
              }}>
                NPS
                <SortIcon>
                  {sortConfig.key === 'nps' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeaderCell>
              <SortableHeaderCell onClick={() => {
                setSortConfig(prev => ({
                  key: prev.key === 'meetingDeliveryCommitments' && prev.direction === 'asc' ? 'meetingDeliveryCommitments' : 'meetingDeliveryCommitments',
                  direction: prev.key === 'meetingDeliveryCommitments' && prev.direction === 'asc' ? 'desc' : 'asc'
                }));
              }}>
                Meeting Delivery Commitments
                <SortIcon>
                  {sortConfig.key === 'meetingDeliveryCommitments' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeaderCell>
              <SortableHeaderCell onClick={() => {
                setSortConfig(prev => ({
                  key: prev.key === 'customerEngagement' && prev.direction === 'asc' ? 'customerEngagement' : 'customerEngagement',
                  direction: prev.key === 'customerEngagement' && prev.direction === 'asc' ? 'desc' : 'asc'
                }));
              }}>
                Customer Engagement and Relationship
                <SortIcon>
                  {sortConfig.key === 'customerEngagement' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeaderCell>
              <SortableHeaderCell onClick={() => {
                setSortConfig(prev => ({
                  key: prev.key === 'partnerAddingValue' && prev.direction === 'asc' ? 'partnerAddingValue' : 'partnerAddingValue',
                  direction: prev.key === 'partnerAddingValue' && prev.direction === 'asc' ? 'desc' : 'asc'
                }));
              }}>
                Partner adding value to Customer Business
                <SortIcon>
                  {sortConfig.key === 'partnerAddingValue' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeaderCell>
              {viewType !== 'respondent' && (
                <SortableHeaderCell onClick={() => {
                  setSortConfig(prev => ({
                    key: prev.key === 'highestImpact' && prev.direction === 'asc' ? 'highestImpact' : 'highestImpact',
                    direction: prev.key === 'highestImpact' && prev.direction === 'asc' ? 'desc' : 'asc'
                  }));
                }}>
                  Perspective(s) which has/ have the highest positive impact on NPS
                  <SortIcon>
                    {sortConfig.key === 'highestImpact' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </SortIcon>
                </SortableHeaderCell>
              )}
              {viewType !== 'respondent' && (
                <SortableHeaderCell onClick={() => {
                  setSortConfig(prev => ({
                    key: prev.key === 'lowestImpact' && prev.direction === 'asc' ? 'lowestImpact' : 'lowestImpact',
                    direction: prev.key === 'lowestImpact' && prev.direction === 'asc' ? 'desc' : 'asc'
                  }));
                }}>
                  Perspective(s) which has/ have the highest negative impact on NPS
                  <SortIcon>
                    {sortConfig.key === 'lowestImpact' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                  </SortIcon>
                </SortableHeaderCell>
              )}
            </tr>
          </TableHeader>
          <TableBody>
            {processedData.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={viewType === 'bu' ? 9 : viewType === 'account' ? 10 : 9} style={{ textAlign: 'center' }}>
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
                    {group.isGrandTotal ? '' : index + 1}
                  </TableCell>
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                    {normalizeBusinessUnitDisplay(group.businessUnit)}
                  </TableCell>
                  {viewType !== 'bu' && <TableCell>{group.customerName}</TableCell>}
                  {viewType === 'respondent' && <TableCell>{group.respondentName || 'N/A'}</TableCell>}
                    <NPSCell 
                    score={group.perspectiveAverages?.['NPS'] === '-' || group.perspectiveAverages?.['NPS'] === null || group.perspectiveAverages?.['NPS'] === undefined ? '-' : (group.perspectiveAverages?.['NPS'] || 0)} 
                    category={viewType === 'respondent' ? group.npsCategory : null}
                    style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}
                  >
                    {viewType === 'respondent' && group.npsCategory ? (
                      group.perspectiveAverages?.['NPS'] === '-' || group.perspectiveAverages?.['NPS'] === null || group.perspectiveAverages?.['NPS'] === undefined
                        ? '-'
                        : `${group.perspectiveAverages?.['NPS'] ? Math.round(group.perspectiveAverages['NPS'] || 0) : '0'} (${group.npsCategory})`
                    ) : (
                      group.perspectiveAverages?.['NPS'] === '-' || group.perspectiveAverages?.['NPS'] === null || group.perspectiveAverages?.['NPS'] === undefined
                        ? '-'
                        : (group.perspectiveAverages?.['NPS'] ? (Math.round((group.perspectiveAverages['NPS'] || 0) * 100) / 100).toFixed(2) : '0.00')
                    )}
                  </NPSCell>
                  <PerspectiveCell 
                    rating={parseFloat(group.perspectiveAverages?.['Meeting Delivery Commitments']) || 0} 
                  >
                    {group.perspectiveAverages?.['Meeting Delivery Commitments'] ? 
                      (typeof group.perspectiveAverages['Meeting Delivery Commitments'] === 'number' 
                        ? group.perspectiveAverages['Meeting Delivery Commitments'].toFixed(2)
                        : parseFloat(group.perspectiveAverages['Meeting Delivery Commitments']).toFixed(2)
                      ) : '0.00'}
                  </PerspectiveCell>
                  <PerspectiveCell 
                    rating={parseFloat(group.perspectiveAverages?.['Customer Engagement and Relationship']) || 0} 
                  >
                    {group.perspectiveAverages?.['Customer Engagement and Relationship'] ? 
                      (typeof group.perspectiveAverages['Customer Engagement and Relationship'] === 'number' 
                        ? group.perspectiveAverages['Customer Engagement and Relationship'].toFixed(2)
                        : parseFloat(group.perspectiveAverages['Customer Engagement and Relationship']).toFixed(2)
                      ) : '0.00'}
                  </PerspectiveCell>
                  <PerspectiveCell 
                    rating={parseFloat(group.perspectiveAverages?.['Partner adding value to Customer Business']) || 0} 
                  >
                    {group.perspectiveAverages?.['Partner adding value to Customer Business'] ? 
                      (typeof group.perspectiveAverages['Partner adding value to Customer Business'] === 'number' 
                        ? group.perspectiveAverages['Partner adding value to Customer Business'].toFixed(2)
                        : parseFloat(group.perspectiveAverages['Partner adding value to Customer Business']).toFixed(2)
                      ) : '0.00'}
                  </PerspectiveCell>
                  {viewType !== 'respondent' && (
                  <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                      {(viewType === 'account' || viewType === 'bu') ? (group.highestImpactPerspective || '-') : (group.highestImpactPerspective || 'N/A')}
                  </TableCell>
                  )}
                  {viewType !== 'respondent' && (
                    <TableCell style={{ fontWeight: group.isGrandTotal ? 'bold' : 'normal' }}>
                      {(viewType === 'account' || viewType === 'bu') ? (group.lowestImpactPerspective || '-') : (group.lowestImpactPerspective || 'N/A')}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <ScrollIndicator>
          ← Scroll horizontally to view all columns →
        </ScrollIndicator>
      </TableContainer>

      {/* NPS Color Legend - For all view types (BU-wise, account-wise, and respondent-wise) */}
        <LegendContainer>
          <LegendTitle>NPS Score Legend:</LegendTitle>
          <LegendGrid>
            <LegendItem>
              <LegendColor color="#C6EFCE" />
              <LegendText>Green ≥75%</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FFA500" />
              <LegendText>Orange 0% to 74.99%</LegendText>
            </LegendItem>
            <LegendItem>
              <LegendColor color="#FF0000" />
              <LegendText>Red &lt;0%</LegendText>
            </LegendItem>
          </LegendGrid>
        </LegendContainer>
      
      {/* Perspective Color Legend */}
      <LegendContainer>
        <LegendTitle>Perspective Rating Legend (Meeting Delivery Commitments, Customer Engagement and Relationship, Partner adding value to Customer Business):</LegendTitle>
        <LegendGrid>
          <LegendItem>
            <LegendColor color="#C6EFCE" />
            <LegendText>Green ≥4.5 (Black Text)</LegendText>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#FFA500" />
            <LegendText>Orange 4 to 4.49 (Black Text)</LegendText>
          </LegendItem>
          <LegendItem>
            <LegendColor color="#FF0000" />
            <LegendText>Red &lt;4 (White Text)</LegendText>
          </LegendItem>
        </LegendGrid>
      </LegendContainer>
    </DashboardContainer>
  );
};

export default NPSCorrelationDashboard;

