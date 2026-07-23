import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Download, BarChart3, ChevronLeft, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  text-align: left;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

// Upload-related styled components removed - no longer needed

// ActionButton styled component removed - no longer needed

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-width: 100%;
  
  &::-webkit-scrollbar {
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
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1600px;
  table-layout: auto;
`;

const Th = styled.th`
  background: #dbeafe; /* Light blue 1 */
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: sticky;
  top: 0;
  z-index: 10;
  vertical-align: top;
  
  /* Set specific widths for different column types */
  &:nth-child(1) { width: 80px; }   /* S No. */
  &:nth-child(2) { width: 150px; }  /* CUSTOMER_ID */
  &:nth-child(3) { width: 120px; }  /* PROJ_ID */
  &:nth-child(4) { width: 80px; }   /* Category */
  &:nth-child(5) { width: 150px; }  /* BUSSINESS UNIT */
  
  /* Perspective columns get flexible width */
  &:nth-child(n+6):not(:nth-last-child(-n+4)) { 
    min-width: 120px; 
    max-width: 200px;
    line-height: 1.3;
    hyphens: auto;
  }
  
  /* Sentiment columns get fixed width */
  &:nth-last-child(4) { width: 100px; } /* Avg Rating */
  &:nth-last-child(3) { width: 80px; }  /* Positive */
  &:nth-last-child(2) { width: 80px; }  /* Neutral */
  &:nth-last-child(1) { width: 80px; }  /* Negative */
`;

const Td = styled.td`
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  color: #374151;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  vertical-align: top;
  text-align: center;
`;

const ResultsSummary = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #0c4a6e;
  font-size: 1.25rem;
  font-weight: 600;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const SentimentsDashboard = ({ onBackToDashboard, excelData }) => {
  // Get CSAT cycle start date from context
  const { csatCycleStartDateFormatted } = useCSATContext();
  
  // Define the specific perspective columns we want to display
  const expectedPerspectives = [
    'Risk Management & Responsiveness',
    'Thought Leadership',
    'Timeline Adherence',
    'Timely Resource Fulfillment',
    'Overall Experience',
    'Quality of Delivery',
    'Resource Competency'
  ];

  // Utility function to format date to MM-DD-YYYY format
  const formatDateToMMDDYYYY = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      let date;
      if (typeof dateValue === 'string') {
        // Handle various date formats
        if (dateValue.includes('/')) {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${month}-${day}-${year}`;
          }
        } else if (dateValue.includes('-')) {
          const parts = dateValue.split('-');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${month}-${day}-${year}`;
          }
        }
        date = new Date(dateValue);
      } else if (typeof dateValue === 'number') {
        // Excel serial date
        date = new Date((dateValue - 25569) * 86400 * 1000);
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) return null;
      
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${month}-${day}-${year}`;
    } catch (error) {
      console.error('Error formatting date:', dateValue, error);
      return null;
    }
  };

  // Utility function to compare dates (MM-DD-YYYY format)
  const isDateGreaterThanOrEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    try {
      const [mm1, dd1, yyyy1] = date1.split('-').map(Number);
      const [mm2, dd2, yyyy2] = date2.split('-').map(Number);
      
      const d1 = new Date(yyyy1, mm1 - 1, dd1);
      const d2 = new Date(yyyy2, mm2 - 1, dd2);
      
      return d1 >= d2;
    } catch (error) {
      console.error('Error comparing dates:', date1, date2, error);
      return false;
    }
  };

  const [uploadedData, setUploadedData] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [projectNameSearch, setProjectNameSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [showBUWiseView, setShowBUWiseView] = useState(false);
  const [showAccountWiseView, setShowAccountWiseView] = useState(false);

  // Process excelData when it's received
  useEffect(() => {
    console.log('=== SENTIMENTS DASHBOARD: useEffect triggered ===');
    console.log('excelData prop:', excelData);
    console.log('excelData type:', typeof excelData);
    console.log('excelData keys:', excelData ? Object.keys(excelData) : 'null');
    
    if (excelData && excelData.data) {
      console.log('=== SENTIMENTS DASHBOARD: Processing excelData ===');
      console.log('Excel data received:', excelData.data.length, 'rows');
      console.log('Sample data:', excelData.data[0]);
      
      // Set the uploaded data for processing
      setUploadedData(excelData.data);
    } else if (excelData) {
      console.log('=== SENTIMENTS DASHBOARD: excelData exists but no data property ===');
      console.log('excelData structure:', excelData);
      console.log('Available properties:', Object.keys(excelData));
      
      // Try to find the data in a different property
      if (Array.isArray(excelData)) {
        console.log('excelData is an array, using directly');
        setUploadedData(excelData);
      } else if (excelData.rows) {
        console.log('excelData has rows property');
        setUploadedData(excelData.rows);
      } else {
        console.log('No recognizable data structure found');
      }
    } else {
      console.log('=== SENTIMENTS DASHBOARD: No valid excelData ===');
      console.log('excelData exists:', !!excelData);
      console.log('excelData.data exists:', !!(excelData && excelData.data));
    }
  }, [excelData]);

  // Process data according to requirements
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    console.log('=== PROCESSING SENTIMENTS DATA ===');
    console.log('Total rows to process:', uploadedData.length);
    
    // Use actual column names from the Excel file
    const customerIdColumn = 'CUSTOMER_ID';
    const customerNameColumn = 'CUSTOMER NAME';
    const projIdColumn = 'PROJ_ID';
    const projectNameColumn = 'PROJECT NAME';
    const businessUnitColumn = 'BUSSINESS UNIT';
    const ratingColumn = 'RATING';
    const questionCategoryColumn = 'QUESTION_CATEGORY';
    
    console.log('Column detection:', {
      customerIdColumn,
      customerNameColumn,
      projIdColumn,
      projectNameColumn,
      businessUnitColumn,
      ratingColumn,
      questionCategoryColumn
    });
    
    if (!customerIdColumn || !ratingColumn) {
      console.error('Required columns not found');
      return [];
    }
    
    // First, filter out rows with "Qualitative Feedback" and group by project
    const projectGroups = new Map();
    
    uploadedData.forEach((row, index) => {
      // Skip rows where QUESTION_CATEGORY equals "Qualitative Feedback"
      if (questionCategoryColumn && row[questionCategoryColumn] === 'Qualitative Feedback') {
        console.log(`Skipping row ${index + 1}: Qualitative Feedback`);
        return;
      }
      
      const customerId = row[customerIdColumn];
      const customerName = customerNameColumn ? row[customerNameColumn] : 'N/A';
      const projId = projIdColumn ? row[projIdColumn] : 'N/A';
      const projectName = projectNameColumn ? row[projectNameColumn] : 'N/A';
      const businessUnit = businessUnitColumn ? row[businessUnitColumn] : 'N/A';
      const rating = parseFloat(row[ratingColumn]);
      const perspective = row['PERSPECTIVE'];
      
      if (!customerId || !projId || isNaN(rating) || !perspective) return;
      
      // Create unique key for each project
      const projectKey = `${customerId}_${projId}`;
      
      if (!projectGroups.has(projectKey)) {
        projectGroups.set(projectKey, {
          customerId,
          customerName,
          projId,
          projectName,
          businessUnit,
          perspectives: {},
          ratings: [],
          totalRating: 0,
          ratingCount: 0
        });
      }
      
      const projectData = projectGroups.get(projectKey);
      
      // Store rating for specific perspective (only one rating per perspective per project)
      if (!projectData.perspectives[perspective]) {
        projectData.perspectives[perspective] = rating; // Store single rating, not array
      }
    });
    
    // Convert to array and calculate metrics for each project
    const result = Array.from(projectGroups.values()).map((project, index) => {
      // Calculate Avg Rating = Average of ratings for all perspectives for this project
      // Get all perspective ratings (one per perspective)
      const perspectiveRatings = Object.values(project.perspectives).filter(rating => rating > 0);
      const totalRating = perspectiveRatings.reduce((sum, rating) => sum + rating, 0);
      const ratingCount = perspectiveRatings.length;
      const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : '0.00';
      
      // Debug logging for first few projects
      if (index < 3) {
        console.log(`Project ${index + 1}: ${project.customerId}_${project.projId}`);
        console.log(`  Perspective ratings: [${perspectiveRatings.join(', ')}]`);
        console.log(`  Total rating sum: ${totalRating}`);
        console.log(`  Number of perspectives: ${ratingCount}`);
        console.log(`  Avg Rating = ${totalRating} ÷ ${ratingCount} = ${avgRating}`);
        console.log(`  Perspectives found:`, Object.keys(project.perspectives));
        
        // Show individual perspective ratings
        Object.keys(project.perspectives).forEach(perspective => {
          const rating = project.perspectives[perspective];
          console.log(`    ${perspective}: ${rating}`);
        });
      }
      
      // Calculate sentiment categories based on average rating
      let positive = 0, neutral = 0, negative = 0;
      const avgRatingNum = parseFloat(avgRating);
      if (avgRatingNum >= 4) {
        positive = 1;
      } else if (avgRatingNum >= 3 && avgRatingNum < 4) {
        neutral = 1;
      } else {
        negative = 1;
      }
      
      // Calculate category based on Resource Competency, Timely Resource Fulfillment, Overall Experience
      // For now, we'll set category based on the average rating
      let category = 2; // Default to category 2
      if (avgRating < 3) {
        category = 1; // Low average rating
      }
      
      // Create perspective columns with actual rating values for each perspective
      const perspectiveData = {};
      expectedPerspectives.forEach(perspective => {
        // Get the actual rating value for this perspective
        const perspectiveRating = project.perspectives[perspective] || 0;
        perspectiveData[perspective] = parseFloat(perspectiveRating);
      });
      
      return {
        sNo: index + 1,
        customerId: project.customerId,
        customerName: project.customerName,
        projId: project.projId,
        projectName: project.projectName,
        category: category,
        businessUnit: project.businessUnit,
        avgRating: avgRating,
        positive: positive,
        neutral: neutral,
        negative: negative,
        ...perspectiveData
      };
    });
    
    console.log('Processed data:', result);
    console.log('Sample processed row:', result[0]);
    return result;
  }, [uploadedData]);

  // Process account-wise data
  const accountWiseData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    console.log('=== PROCESSING ACCOUNT-WISE SENTIMENTS DATA ===');
    console.log('Input data length:', uploadedData.length);
    
    // Use actual column names from the Excel file
    const questionCategoryColumn = 'QUESTION_CATEGORY';
    const customerIdColumn = 'CUSTOMER_ID';
    const customerNameColumn = 'CUSTOMER NAME';
    const businessUnitColumn = 'BUSSINESS UNIT';
    const perspectiveColumn = 'PERSPECTIVE';
    const ratingColumn = 'RATING';
    
    // Group data by customer ID (account-wise)
    const accountGroups = new Map();
    
    uploadedData.forEach((row, index) => {
      // Skip qualitative feedback rows
      if (row[questionCategoryColumn] === 'Qualitative Feedback') {
        return;
      }
      
      const customerId = row[customerIdColumn] || 'Unknown';
      const customerName = row[customerNameColumn] || 'Unknown';
      const businessUnit = row[businessUnitColumn] || 'Unknown';
      const perspective = row[perspectiveColumn] || 'Unknown';
      const rating = parseFloat(row[ratingColumn]) || 0;
      
      if (!accountGroups.has(customerId)) {
        accountGroups.set(customerId, {
          customerId,
          customerName,
          businessUnit,
          perspectives: {},
          ratings: [],
          totalRating: 0,
          ratingCount: 0
        });
      }
      
      const accountData = accountGroups.get(customerId);
      
      // Store all ratings for each perspective (to calculate average later)
      if (!accountData.perspectives[perspective]) {
        accountData.perspectives[perspective] = [];
      }
      accountData.perspectives[perspective].push(rating);
      
      // Collect all ratings for overall average calculation
      accountData.ratings.push(rating);
      accountData.totalRating += rating;
      accountData.ratingCount++;
    });
    
    // Convert to array and calculate metrics for each account
    const result = Array.from(accountGroups.values()).map((account, index) => {
      // Calculate Avg Rating = Avg(Avg (Rating column values for these perspectives) for a customer)
      // First calculate average for each perspective, then average those perspective averages
      const perspectiveAverages = [];
      expectedPerspectives.forEach(perspective => {
        const perspectiveRatings = account.perspectives[perspective] || [];
        if (perspectiveRatings.length > 0) {
          const avgPerspectiveRating = perspectiveRatings.reduce((sum, rating) => sum + rating, 0) / perspectiveRatings.length;
          perspectiveAverages.push(avgPerspectiveRating);
        }
      });
      
      const totalPerspectiveAvg = perspectiveAverages.reduce((sum, avg) => sum + avg, 0);
      const perspectiveCount = perspectiveAverages.length;
      const avgRating = perspectiveCount > 0 ? (totalPerspectiveAvg / perspectiveCount).toFixed(2) : '0.00';
      
      // Debug logging for first few accounts
      if (index < 3) {
        console.log(`Account ${index + 1}: ${account.customerId}`);
        console.log(`  Perspective averages: [${perspectiveAverages.map(avg => avg.toFixed(2)).join(', ')}]`);
        console.log(`  Total perspective avg sum: ${totalPerspectiveAvg.toFixed(2)}`);
        console.log(`  Number of perspectives: ${perspectiveCount}`);
        console.log(`  Final Avg Rating = ${totalPerspectiveAvg.toFixed(2)} ÷ ${perspectiveCount} = ${avgRating}`);
        console.log(`  Perspectives found:`, Object.keys(account.perspectives));
        
        // Show individual perspective ratings and averages
        expectedPerspectives.forEach(perspective => {
          const ratings = account.perspectives[perspective] || [];
          if (ratings.length > 0) {
            const avgPerspectiveRating = (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
            console.log(`    ${perspective}: [${ratings.join(', ')}] → Avg: ${avgPerspectiveRating}`);
          } else {
            console.log(`    ${perspective}: No ratings → Avg: 0.00`);
          }
        });
      }
      
      // Calculate sentiment categories based on average rating
      let positive = 0, neutral = 0, negative = 0;
      const avgRatingNum = parseFloat(avgRating);
      if (avgRatingNum >= 4) {
        positive = 1;
      } else if (avgRatingNum >= 3 && avgRatingNum < 4) {
        neutral = 1;
      } else {
        negative = 1;
      }
      
      // Create perspective columns with average rating values for each perspective
      const perspectiveData = {};
      expectedPerspectives.forEach(perspective => {
        // Get all ratings for this perspective and calculate average
        const perspectiveRatings = account.perspectives[perspective] || [];
        if (perspectiveRatings.length > 0) {
          const avgPerspectiveRating = perspectiveRatings.reduce((sum, rating) => sum + rating, 0) / perspectiveRatings.length;
          perspectiveData[perspective] = parseFloat(avgPerspectiveRating.toFixed(2));
        } else {
          perspectiveData[perspective] = 0;
        }
      });
      
      return {
        sNo: index + 1,
        customerId: account.customerId,
        customerName: account.customerName,
        businessUnit: account.businessUnit,
        ...perspectiveData,
        avgRating: parseFloat(avgRating),
        positive,
        neutral,
        negative
      };
    });
    
    console.log('Account-wise processed data:', result);
    console.log('Sample account-wise row:', result[0]);
    return result;
  }, [uploadedData]);

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadedData(null);
      setUploadStatus(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedData(null);
    setUploadStatus(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Look for "CSAT received Report" sheet
          let sheetName = 'CSAT received Report';
          let worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            // Try to find sheet with similar name
            const sheetNames = workbook.SheetNames;
            const foundSheet = sheetNames.find(name => 
              name.toLowerCase().includes('csat') && 
              name.toLowerCase().includes('received') && 
              name.toLowerCase().includes('report')
            );
            
            if (foundSheet) {
              sheetName = foundSheet;
              worksheet = workbook.Sheets[foundSheet];
              console.log(`Using sheet: ${foundSheet}`);
            } else {
              // Use first sheet as fallback
              sheetName = sheetNames[0];
              worksheet = workbook.Sheets[sheetNames[0]];
              console.log(`Sheet 'CSAT received Report' not found. Using first sheet: ${sheetName}`);
            }
          }
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve({ data: jsonData, sheetName });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setUploadStatus({ type: 'info', message: 'Processing file...' });
    
    try {
      const { data, sheetName } = await readExcelFile(selectedFile);
      
      if (!data || data.length < 2) {
        throw new Error('Invalid Excel file structure. Please ensure the file contains data.');
      }
      
      // Extract headers and data
      const headers = data[0];
      const rows = data.slice(1);
      
      console.log('Headers found:', headers);
      console.log('Sample row:', rows[0]);
      
      // Find required columns first
      const businessUnitColumn = headers.findIndex(col => 
        col === 'BUSSINESS UNIT' || col === 'BUSINESS UNIT' || col === 'business_unit' || col === 'Business Unit' ||
        col === 'BU' || col === 'bu' || col === 'BUSSINESS_UNIT' || col === 'BUSINESS_UNIT' ||
        col.toLowerCase().includes('business') && col.toLowerCase().includes('unit') ||
        col.toLowerCase().includes('bussiness') && col.toLowerCase().includes('unit')
      );
      
      const customerIdColumn = headers.findIndex(col => 
        col === 'CUST_ID' || col === 'CUSTOMER_ID' || col === 'Customer ID' || col === 'customer_id' || col === 'C_ID' ||
        col.toLowerCase().includes('customer') && col.toLowerCase().includes('id')
      );
      
      const projIdColumn = headers.findIndex(col => 
        col === 'PROJ_ID' || col === 'Project ID' || col === 'proj_id' || col === 'P_ID' ||
        col.toLowerCase().includes('project') && col.toLowerCase().includes('id')
      );
      
      const ratingColumn = headers.findIndex(col => 
        col === 'RATING' || col === 'Rating' || col === 'rating' || col === 'RATE' || col === 'Rate' ||
        col.toLowerCase().includes('rating') || col.toLowerCase().includes('rate')
      );
      
      const questionCategoryColumn = headers.findIndex(col => 
        col === 'QUESTION_CATEGORY' || col === 'question_category' || col === 'Question Category'
      );
      
      // Find the perspective column
      const perspectiveColumn = headers.findIndex(col => 
        col === 'PERSPECTIVE' || col === 'perspective' || col === 'Perspective' ||
        col === 'QUESTION_PERSPECTIVE' || col === 'question_perspective' ||
        col.toLowerCase().includes('perspective')
      );
      
      console.log('Perspective column index:', perspectiveColumn);
      if (perspectiveColumn !== -1) {
        console.log('Perspective column name:', headers[perspectiveColumn]);
        // Show unique perspective values
        const uniquePerspectives = [...new Set(rows.map(row => row[perspectiveColumn]).filter(Boolean))];
        console.log('Unique perspective values found:', uniquePerspectives);
        console.log('Total unique perspectives:', uniquePerspectives.length);
        
        // Show which expected perspectives are found in the data
        const foundPerspectives = expectedPerspectives.filter(p => 
          uniquePerspectives.some(up => 
            up.toString().toLowerCase().includes(p.toLowerCase()) ||
            p.toLowerCase().includes(up.toString().toLowerCase())
          )
        );
        console.log('Found expected perspectives:', foundPerspectives);
        console.log('Missing expected perspectives:', expectedPerspectives.filter(p => !foundPerspectives.includes(p)));
        
        // Show sample perspective values with their ratings
        const samplePerspectives = rows.slice(0, 5).map(row => ({
          customerId: row[customerIdColumn],
          perspective: row[perspectiveColumn],
          rating: row[ratingColumn]
        }));
        console.log('Sample perspective data:', samplePerspectives);
      } else {
        console.log('No perspective column found. Available columns:', headers);
      }
      
      if (customerIdColumn === -1 || ratingColumn === -1) {
        throw new Error('Required columns not found. Please ensure the file contains CUSTOMER_ID and RATING columns.');
      }
      
      console.log('Column indices:', {
        businessUnitColumn,
        customerIdColumn,
        projIdColumn,
        ratingColumn,
        questionCategoryColumn
      });
      
      if (businessUnitColumn !== -1) {
        console.log('Business Unit column found:', headers[businessUnitColumn]);
        const uniqueBusinessUnits = [...new Set(rows.map(row => row[businessUnitColumn]).filter(Boolean))];
        console.log('Unique Business Units found:', uniqueBusinessUnits);
      } else {
        console.log('No Business Unit column found');
      }
      
      // Process data rows
      const processedRows = [];
      const customerData = new Map();
      
      rows.forEach((row, index) => {
        if (row.length < Math.max(businessUnitColumn, customerIdColumn, ratingColumn, projIdColumn) + 1) return;
        
        const businessUnit = businessUnitColumn !== -1 ? row[businessUnitColumn] : 'N/A';
        const customerId = row[customerIdColumn];
        const projId = projIdColumn !== -1 ? row[projIdColumn] : 'N/A';
        const rating = parseFloat(row[ratingColumn]);
        const questionCategory = questionCategoryColumn !== -1 ? row[questionCategoryColumn] : '';
        
        // Skip rows where QUESTION_CATEGORY equals "Qualitative Feedback"
        if (questionCategory === 'Qualitative Feedback') {
          return;
        }
        
        if (!customerId || isNaN(rating)) return;
        
        // Find the perspective column (the column that contains values like "Resource Competency", "Timely Resource Fulfillment", etc.)
        const perspectiveColumn = headers.findIndex(col => 
          col === 'PERSPECTIVE' || col === 'perspective' || col === 'Perspective' ||
          col === 'QUESTION_PERSPECTIVE' || col === 'question_perspective' ||
          col.toLowerCase().includes('perspective')
        );
        
        // Store data for aggregation
        if (!customerData.has(customerId)) {
          customerData.set(customerId, {
            customerId,
            businessUnit,
            projId,
            ratings: [],
            perspectives: {},
            questionCategories: new Set()
          });
        }
        
        const customer = customerData.get(customerId);
        customer.ratings.push(rating);
        customer.questionCategories.add(questionCategory);
        
        // Process perspective data for each expected perspective
        if (perspectiveColumn !== -1) {
          const perspectiveValue = row[perspectiveColumn];
          
          // For each expected perspective, check if this row matches and store the rating
          expectedPerspectives.forEach(expectedPerspective => {
            if (perspectiveValue && 
                (perspectiveValue.toLowerCase().includes(expectedPerspective.toLowerCase()) ||
                 expectedPerspective.toLowerCase().includes(perspectiveValue.toLowerCase()))) {
              if (!customer.perspectives[expectedPerspective]) {
                customer.perspectives[expectedPerspective] = [];
              }
              customer.perspectives[expectedPerspective].push(rating);
            }
          });
        }
      });
      
      // Convert to final format
      const finalData = Array.from(customerData.values()).map((customer, index) => {
        const avgRating = customer.ratings.reduce((sum, rating) => sum + rating, 0) / customer.ratings.length;
        
        // Calculate sentiments based on average rating
        let positive = 0, neutral = 0, negative = 0;
        if (avgRating >= 4) {
          positive = 1;
        } else if (avgRating >= 3) {
          neutral = 1;
        } else {
          negative = 1;
        }
        
        const result = {
          sNo: index + 1,
          businessUnit: customer.businessUnit,
          customerId: customer.customerId,
          projId: customer.projId,
          avgRating: avgRating.toFixed(2),
          positive,
          neutral,
          negative
        };
        
        // Add all expected perspective columns with ratings
        expectedPerspectives.forEach(perspective => {
          if (customer.perspectives[perspective] && customer.perspectives[perspective].length > 0) {
            // Get the most recent rating for this perspective
            const validRatings = customer.perspectives[perspective].filter(r => !isNaN(r) && r > 0);
            if (validRatings.length > 0) {
              result[perspective] = validRatings[validRatings.length - 1];
            } else {
              result[perspective] = 'N/A';
            }
          } else {
            result[perspective] = 'N/A';
          }
        });
        
        // Calculate Category based on Resource Competency, Timely Resource Fulfillment, and Overall Experience
        const resourceCompetency = result['Resource Competency'];
        const timelyResourceFulfillment = result['Timely Resource Fulfillment'];
        const overallExperience = result['Overall Experience'];
        
        let category = 2; // Default to Category 2
        
        // Check if any of the three perspectives are 0, blank, or N/A
        if ((resourceCompetency === 0 || resourceCompetency === '' || resourceCompetency === 'N/A' || resourceCompetency === null || resourceCompetency === undefined) ||
            (timelyResourceFulfillment === 0 || timelyResourceFulfillment === '' || timelyResourceFulfillment === 'N/A' || timelyResourceFulfillment === null || timelyResourceFulfillment === undefined) ||
            (overallExperience === 0 || overallExperience === '' || overallExperience === 'N/A' || overallExperience === null || overallExperience === undefined)) {
          category = 1;
        }
        
        result.category = category;
        
        return result;
      });
      
      // Get perspective column names
      const perspectiveColumns = Object.keys(customerData.values().next().value.perspectives);
      console.log('Perspective columns found:', perspectiveColumns);
      console.log('Sample processed data:', finalData[0]);
      console.log('Total perspective columns:', perspectiveColumns.length);
      console.log('All perspective values:', perspectiveColumns);
      
      // Show detailed structure of first customer's perspectives
      if (finalData.length > 0) {
        const firstCustomer = finalData[0];
        console.log('First customer data structure:');
        console.log('- CUSTOMER_ID:', firstCustomer.customerId);
        console.log('- PROJ_ID:', firstCustomer.projId);
        console.log('- Avg Rating:', firstCustomer.avgRating);
        console.log('- Perspective columns and values:');
        Object.entries(firstCustomer).forEach(([key, value]) => {
          if (key !== 'sNo' && key !== 'customerId' && key !== 'projId' && 
              key !== 'avgRating' && key !== 'positive' && key !== 'neutral' && key !== 'negative') {
            console.log(`  ${key}: ${value}`);
          }
        });
      }
      
      setUploadedData({
        headers: ['S No.', 'CUSTOMER_ID', 'CUSTOMER NAME', 'PROJ_ID', 'PROJECT NAME', 'Category', 'BUSSINESS UNIT', ...expectedPerspectives, 'Avg Rating', 'Positive', 'Neutral', 'Negative'],
        data: finalData
      });
      
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully processed ${finalData.length} customer records from ${sheetName}` 
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({ 
        type: 'error', 
        message: `Error processing file: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get unique business units for filter
  const uniqueBusinessUnits = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    // Get unique business units from the processed data
    return [...new Set(processedData.map(row => row.businessUnit).filter(Boolean))].sort();
  }, [processedData]);

  // Get unique categories for filter
  const uniqueCategories = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    // Get unique categories from the processed data
    return [...new Set(processedData.map(row => row.category).filter(Boolean))].sort();
  }, [processedData]);

  // Apply filters
  const filteredData = useMemo(() => {
      // Choose data source based on view
      const dataSource = showAccountWiseView ? accountWiseData : processedData;
    
      if (!dataSource || dataSource.length === 0) return [];
      
      let filtered = dataSource;
    
    // Apply business unit filter if available
    if (businessUnitFilter) {
      filtered = filtered.filter(item => 
        item.businessUnit && 
        item.businessUnit.toString() === businessUnitFilter
      );
    }
    
    // Apply category filter if available
    if (categoryFilter) {
      filtered = filtered.filter(item => 
        item.category && 
        item.category.toString() === categoryFilter
      );
    }
    
          // Apply customer name search if available
      if (customerNameSearch) {
        filtered = filtered.filter(item => 
          item.customerName && 
          item.customerName.toString().toLowerCase().includes(customerNameSearch.toLowerCase())
        );
      }
      
      // Apply project name search if available
      if (projectNameSearch) {
        filtered = filtered.filter(item => 
          item.projectName && 
          item.projectName.toString().toLowerCase().includes(projectNameSearch.toLowerCase())
      );
    }
    
    return filtered;
    }, [processedData, accountWiseData, showAccountWiseView, businessUnitFilter, categoryFilter, customerNameSearch, projectNameSearch]);

  // Process BU-wise data
  const buWiseData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];

    console.log('=== PROCESSING BU-WISE SENTIMENTS DATA ===');
    console.log('Input data length:', uploadedData.length);
    console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);
    
    // Use actual column names from the Excel file
    const questionCategoryColumn = 'QUESTION_CATEGORY';
    const businessUnitColumn = 'BUSSINESS UNIT';
    const perspectiveColumn = 'PERSPECTIVE';
    const ratingColumn = 'RATING';
    const customerIdColumn = 'CUSTOMER_ID';

    // Create a map to track which customer ratings should be included based on CSS dates
    const validCustomerRatings = new Set();
    
    // If we have second sheet data and CSAT cycle start date, filter by CSS dates
    if (excelData && excelData.secondSheetData && csatCycleStartDateFormatted) {
      console.log('Filtering by CSS dates from second sheet...');
      
      excelData.secondSheetData.forEach(row => {
        const custId = row['CUST_ID'] || row['CUSTOMER_ID'];
        if (!custId) return;
        
        // Check if CSS_SENT_DATE and CSS_RECEIVED_DATE are >= CSAT cycle start date
        let hasValidSentDate = false;
        let hasValidReceivedDate = false;
        
        if (row['CSS_SENT_DATE'] && row['CSS_SENT_DATE'] !== '' && row['CSS_SENT_DATE'] !== 'N/A') {
          const sentDateFormatted = formatDateToMMDDYYYY(row['CSS_SENT_DATE']);
          if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
            hasValidSentDate = true;
          }
        }
        
        if (row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'] !== '' && row['CSS_RECEIVED_DATE'] !== 'N/A') {
          const receivedDateFormatted = formatDateToMMDDYYYY(row['CSS_RECEIVED_DATE']);
          if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) {
            hasValidReceivedDate = true;
          }
        }
        
        // Include this customer if both dates are valid
        if (hasValidSentDate && hasValidReceivedDate) {
          validCustomerRatings.add(custId.toString());
        }
      });
      
      console.log('Valid customer IDs after CSS date filtering:', Array.from(validCustomerRatings).slice(0, 10));
    }

    const buGroups = new Map();
    
    uploadedData.forEach(row => {
      // Skip qualitative feedback rows
      if (row[questionCategoryColumn] === 'Qualitative Feedback') {
        return;
      }
      
      const businessUnit = row[businessUnitColumn] || 'N/A';
      const perspective = row[perspectiveColumn] || 'Unknown';
      const rating = parseFloat(row[ratingColumn]) || 0;
      const customerId = row[customerIdColumn] || 'Unknown';
      
      // If we have date filtering, only include ratings from valid customers
      if (validCustomerRatings.size > 0 && !validCustomerRatings.has(customerId.toString())) {
        return;
      }
      
      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, {
          businessUnit,
          customers: new Set(),
          totalRating: 0,
          totalPositive: 0,
          totalNeutral: 0,
          totalNegative: 0,
          perspectives: {},
          categoryCounts: { 1: 0, 2: 0 }
        });
      }

      const group = buGroups.get(businessUnit);
      
      // Track unique customers
      group.customers.add(customerId);
      
      // Store all ratings for each perspective (to calculate average later)
        if (!group.perspectives[perspective]) {
          group.perspectives[perspective] = [];
        }
      group.perspectives[perspective].push(rating);
    });

    // Calculate averages for each BU and perspective
    const result = Array.from(buGroups.values()).map((group, index) => {
      // Calculate Avg Rating = Avg(Avg(Rating column values for each perspective))
      // First calculate average for each perspective, then average those perspective averages
      const perspectiveAverages = [];
      expectedPerspectives.forEach(perspective => {
        if (group.perspectives[perspective] && group.perspectives[perspective].length > 0) {
          const avgPerspectiveRating = group.perspectives[perspective].reduce((sum, rating) => sum + rating, 0) / group.perspectives[perspective].length;
          perspectiveAverages.push(avgPerspectiveRating);
        }
      });
      
      const totalPerspectiveAvg = perspectiveAverages.reduce((sum, avg) => sum + avg, 0);
      const perspectiveCount = perspectiveAverages.length;
      const avgRating = perspectiveCount > 0 ? (totalPerspectiveAvg / perspectiveCount).toFixed(2) : '0.00';
      
      // Calculate sentiment categories based on average rating
      let positive = 0, neutral = 0, negative = 0;
      const avgRatingNum = parseFloat(avgRating);
      if (avgRatingNum >= 4) {
        positive = 1;
      } else if (avgRatingNum >= 3 && avgRatingNum < 4) {
        neutral = 1;
      } else {
        negative = 1;
      }
      
      // Debug logging for first few BUs
      if (index < 3) {
        console.log(`BU ${index + 1}: ${group.businessUnit}`);
        console.log(`  Unique customers: ${group.customers.size} (${Array.from(group.customers).join(', ')})`);
        console.log(`  Perspective averages: [${perspectiveAverages.map(avg => avg.toFixed(2)).join(', ')}]`);
        console.log(`  Total perspective avg sum: ${totalPerspectiveAvg.toFixed(2)}`);
        console.log(`  Number of perspectives: ${perspectiveCount}`);
        console.log(`  Final Avg Rating = ${totalPerspectiveAvg.toFixed(2)} ÷ ${perspectiveCount} = ${avgRating}`);
        
        // Show individual perspective calculations
        expectedPerspectives.forEach(perspective => {
          if (group.perspectives[perspective] && group.perspectives[perspective].length > 0) {
            const ratings = group.perspectives[perspective];
            const avgPerspectiveRating = (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2);
            console.log(`    ${perspective}: [${ratings.join(', ')}] → Avg: ${avgPerspectiveRating}`);
          } else {
            console.log(`    ${perspective}: No ratings → Avg: 0.00`);
          }
        });
      }
      
      const row = {
        sNo: index + 1,
        businessUnit: group.businessUnit,
        customerCount: group.customers.size,
        avgRating: parseFloat(avgRating),
        positive: positive,
        neutral: neutral,
        negative: negative
      };

      // Calculate average for each perspective
      expectedPerspectives.forEach(perspective => {
        const ratings = group.perspectives[perspective] || [];
        if (ratings.length > 0) {
          const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          row[perspective] = avgRating.toFixed(2);
        } else {
          row[perspective] = 'N/A';
        }
      });

      return row;
    });

    console.log(`=== BU-WISE SENTIMENTS DATA PROCESSING COMPLETE ===`);
    console.log(`Total business units processed: ${result.length}`);
    console.log(`CSS date filtering applied: ${validCustomerRatings.size > 0 ? 'Yes' : 'No'}`);
    if (validCustomerRatings.size > 0) {
      console.log(`Valid customer IDs for filtering: ${validCustomerRatings.size}`);
    }

    // Sort by custom Business Unit order
    const businessUnitOrder = ['Healthcare', 'New Growth', 'Tech', 'India & UK'];
    const sortedResult = result.sort((a, b) => {
      const indexA = businessUnitOrder.indexOf(a.businessUnit);
      const indexB = businessUnitOrder.indexOf(b.businessUnit);
      
      // If both are in the predefined order, sort by that order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one is in the predefined order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // If neither is in the predefined order, sort alphabetically
      return a.businessUnit.localeCompare(b.businessUnit);
    });
    
    // Update S.No. after sorting
    return sortedResult.map((item, index) => ({
      ...item,
      sNo: index + 1
    }));
  }, [uploadedData, expectedPerspectives, excelData, csatCycleStartDateFormatted]);

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    // If sorting by businessUnit, use our custom order
    if (sortConfig.key === 'businessUnit') {
      const businessUnitOrder = ['Healthcare', 'New Growth', 'Tech', 'India & UK'];
      return [...data].sort((a, b) => {
        const indexA = businessUnitOrder.indexOf(a.businessUnit);
        const indexB = businessUnitOrder.indexOf(b.businessUnit);
        
        // If both are in the predefined order, sort by that order
        if (indexA !== -1 && indexB !== -1) {
          return sortConfig.direction === 'asc' ? indexA - indexB : indexB - indexA;
        }
        // If only one is in the predefined order, prioritize it
        if (indexA !== -1) return sortConfig.direction === 'asc' ? -1 : 1;
        if (indexB !== -1) return sortConfig.direction === 'asc' ? 1 : -1;
        // If neither is in the predefined order, sort alphabetically
        return sortConfig.direction === 'asc' ? 
          a.businessUnit.localeCompare(b.businessUnit) : 
          b.businessUnit.localeCompare(a.businessUnit);
      });
    }
    
    // For other columns, sort normally but maintain Business Unit order as secondary sort
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle numeric values
      if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
      }
      if (typeof bVal === 'string' && !isNaN(parseFloat(bVal))) {
        bVal = parseFloat(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // If values are equal, maintain Business Unit order
      const businessUnitOrder = ['Healthcare', 'New Growth', 'Tech', 'India & UK'];
      const indexA = businessUnitOrder.indexOf(a.businessUnit);
      const indexB = businessUnitOrder.indexOf(b.businessUnit);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.businessUnit.localeCompare(b.businessUnit);
    });
  };

  // Download functionality
  const downloadData = async () => {
    if (!processedData || processedData.length === 0) return;
    
    try {
    let exportData;
    let sheetName;
    let filename;

    if (showAccountWiseView) {
      // Account-wise export
      exportData = accountWiseData;
      sheetName = 'Account-wise Sentiments Analysis';
      filename = 'Account_wise_Sentiments_Analysis.xlsx';
    } else if (showBUWiseView) {
      // BU-wise export
      exportData = buWiseData;
      sheetName = 'BU Wise Sentiments Analysis';
      filename = 'BU_Wise_Sentiments_Analysis.xlsx';
    } else {
      // Project-wise export
      exportData = processedData;
      sheetName = 'Project-wise Sentiments Analysis';
      filename = 'Project_wise_Sentiments_Analysis.xlsx';
    }
      
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(sheetName);
      
      // Get headers from the first row of data
      const headers = Object.keys(exportData[0]);
      
      // Add headers
      worksheet.addRow(headers);
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      
      // Add data rows with color coding for perspective score columns
      exportData.forEach((row, index) => {
        const dataRow = worksheet.addRow(Object.values(row));
        
        // Apply color coding to perspective score columns
        headers.forEach((header, colIndex) => {
          // Check if this is a perspective column (not sentiment columns)
          if (header !== 'sNo' && 
              header !== 'customerId' && 
              header !== 'projId' && 
              header !== 'projectName' && 
              header !== 'category' && 
              header !== 'customerCount' && 
              header !== 'category1Count' && 
              header !== 'category2Count' && 
              header !== 'avgRating' && 
              header !== 'positive' && 
              header !== 'neutral' && 
              header !== 'negative' &&
              header !== 'customerName' &&
              header !== 'businessUnit') {
            
            const score = parseFloat(row[header] || 0);
            const cell = dataRow.getCell(colIndex + 1);
            
            if (score < 4) {
              // Dark Red
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDC2626' }
              };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
              // Dark Amber
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD97706' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score >= 4.5 && score < 5) {
              // Light Green
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF86EFAC' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score === 5) {
              // Dark Green
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF16A34A' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
            
            cell.alignment = { horizontal: 'center' };
          }
        });
      });
      
      // Add legend
      const legendStartRow = exportData.length + 3;
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      // Add legend items with colors
      const legendRow1 = worksheet.addRow(['Dark Red: <4']);
      const legendRow2 = worksheet.addRow(['Dark Amber: 4 to 4.49']);
      const legendRow3 = worksheet.addRow(['Green: >=4.5 and <5']);
      const legendRow4 = worksheet.addRow(['Dark Green: 5']);
      
      // Style legend cells with colors
      const redLegendCell = legendRow1.getCell(1);
      redLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFDC2626' }
      };
      redLegendCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      const amberLegendCell = legendRow2.getCell(1);
      amberLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD97706' }
      };
      amberLegendCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      const lightGreenLegendCell = legendRow3.getCell(1);
      lightGreenLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF86EFAC' }
      };
      lightGreenLegendCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      const darkGreenLegendCell = legendRow4.getCell(1);
      darkGreenLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF16A34A' }
      };
      darkGreenLegendCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      // Set column widths
      headers.forEach((header, index) => {
        if (header.includes('CUSTOMER NAME') || header.includes('BUSSINESS UNIT') || header.includes('PROJECT NAME')) {
          worksheet.getColumn(index + 1).width = 25;
        } else if (header === 'sNo') {
          worksheet.getColumn(index + 1).width = 10;
        } else if (header === 'avgRating' || header === 'positive' || header === 'neutral' || header === 'negative') {
          worksheet.getColumn(index + 1).width = 15;
        } else if (header === 'category') {
          worksheet.getColumn(index + 1).width = 12;
        } else {
          worksheet.getColumn(index + 1).width = 20;
        }
      });
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Data exported successfully with color coding');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  // Handle table scroll to hide scroll hint
  const handleTableScroll = (event) => {
    if (event.target.scrollLeft > 0) {
      setShowScrollHint(false);
    }
  };

  if (!excelData || !uploadedData) {
    console.log('=== SENTIMENTS DASHBOARD: Rendering loading state ===');
    console.log('excelData:', excelData);
    console.log('uploadedData:', uploadedData);
    console.log('Condition check:', { '!excelData': !excelData, '!uploadedData': !uploadedData });
    
    return (
      <DashboardContainer>
        <DashboardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <HeaderTitle>
              <BarChart3 size={24} /> Project-wise Sentiments based on Avg rating(score) - Perspective Wise
            </HeaderTitle>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DownloadButton onClick={downloadData}>
              <Download size={16} />
              Download Data
            </DownloadButton>
            {onBackToDashboard && (
              <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
                <ChevronLeft size={16} /> Back
              </BackButton>
            )}
          </div>
        </DashboardHeader>

            <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '12px',
          margin: '2rem 0'
        }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            Loading dashboard data...
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Please wait while we process your uploaded Excel file.
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', fontSize: '0.75rem' }}>
            <p><strong>Debug Info:</strong></p>
            <p>excelData prop: {excelData ? `Received (${excelData.data?.length || 0} rows)` : 'Not received'}</p>
            <p>uploadedData state: {uploadedData ? `Set (${uploadedData.length || 0} rows)` : 'Not set'}</p>
            <p>excelData type: {typeof excelData}</p>
            <p>excelData keys: {excelData ? Object.keys(excelData).join(', ') : 'null'}</p>
            <p>excelData.data type: {excelData?.data ? typeof excelData.data : 'undefined'}</p>
            <p>excelData.data length: {excelData?.data?.length || 'undefined'}</p>
            </div>
        </div>
      </DashboardContainer>
    );
  }

  const sortedData = getSortedData(filteredData);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <BarChart3 size={24} /> {
            showAccountWiseView ? 'Accountwise Sentiments based on Avg rating(score) - Perspective Wise' :
            showBUWiseView ? 'BU Wise Sentiments based on Avg rating(score) - Perspective Wise' : 
            'Sentiments based on Avg rating(score) - Perspective Wise'
          }
        </HeaderTitle>
        {csatCycleStartDateFormatted && showBUWiseView && (
          <div style={{ 
            fontSize: '0.875rem', 
            opacity: 0.9, 
            marginTop: '0.5rem',
            textAlign: 'center'
          }}>
            📅 Filtered by CSAT Cycle Start Date: {csatCycleStartDateFormatted}
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {uploadedData && uploadedData.length > 0 && (
              <>
            <button
                  onClick={() => {
                    setShowAccountWiseView(!showAccountWiseView);
                    setShowBUWiseView(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    border: '2px solid white',
                    background: showAccountWiseView ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
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
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = showAccountWiseView ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                  aria-label="Toggle between Project-wise and Account-wise views"
                  title="Toggle between Project-wise and Account-wise views"
                >
                  <BarChart3 size={16} />
                  {showAccountWiseView ? 'Show Project-wise View' : 'Accountwise Sentiments based on Avg rating(score) - Perspective Wise'}
                </button>
            <button
              onClick={() => {
                setShowBUWiseView(!showBUWiseView);
                setShowAccountWiseView(false);
              }}
              style={{
                padding: '0.75rem 1.5rem',
                border: '2px solid white',
                background: showBUWiseView ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
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
                e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = showBUWiseView ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }}
              aria-label="Toggle between Customer-wise and BU-wise views"
              title="Toggle between Customer-wise and BU-wise views"
            >
              <Building2 size={16} />
              {showBUWiseView ? 'Show Customer-wise View' : 'Display BU Wise Sentiments based on Avg rating(score) - Perspective Wise'}
            </button>
              </>
          )}
          <DownloadButton onClick={downloadData}>
            <Download size={16} />
            Download Excel
          </DownloadButton>
          {onBackToDashboard && (
            <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </div>
      </DashboardHeader>

            {!showBUWiseView && (
            <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <label htmlFor="bu-filter" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Filter by Business Unit:
            </label>
            <FilterSelect
              id="bu-filter"
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="">All Business Units</option>
              {uniqueBusinessUnits.map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))}
            </FilterSelect>
          </div>
          
          <div>
            <label htmlFor="category-filter" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Filter by Category:
            </label>
            <FilterSelect
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              <option value="1">Category 1</option>
              <option value="2">Category 2</option>
            </FilterSelect>
          </div>
          
          <div>
            <label htmlFor="customer-search" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Search Customer:
            </label>
            <input
              id="customer-search"
              type="text"
              placeholder="Enter customer name..."
              value={customerNameSearch}
              onChange={(e) => setCustomerNameSearch(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            />
          </div>
          
          {!showAccountWiseView && !showBUWiseView && (
            <div>
              <label htmlFor="project-search" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
                Search Project:
              </label>
              <input
                id="project-search"
                type="text"
                placeholder="Enter project name..."
                value={projectNameSearch}
                onChange={(e) => setProjectNameSearch(e.target.value)}
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '0.875rem',
                  minWidth: '200px'
                }}
              />
            </div>
          )}
          
          {(businessUnitFilter || categoryFilter || customerNameSearch || projectNameSearch) && (
            <button
              onClick={() => {
                setBusinessUnitFilter('');
                setCategoryFilter('');
                setCustomerNameSearch('');
                setProjectNameSearch('');
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
              </FilterContainer>
            )}
        

      <ResultsSummary>
          <SummaryTitle>{
            showAccountWiseView ? 'Account-wise Sentiments Analysis Results' :
            showBUWiseView ? 'BU Wise Sentiments Analysis Results' : 
            'Project-wise Sentiments Analysis Results'
          }</SummaryTitle>
        <SummaryGrid>
          <SummaryItem>
              <SummaryValue>{showAccountWiseView ? accountWiseData.length : showBUWiseView ? buWiseData.length : filteredData.length}</SummaryValue>
              <SummaryLabel>{
                showAccountWiseView ? 'Total Accounts' :
                showBUWiseView ? 'Total Business Units' : 
                'Total Projects'
              }</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {showAccountWiseView 
                ? accountWiseData.reduce((sum, item) => sum + parseFloat(item.avgRating), 0).toFixed(2)
                : showBUWiseView 
                ? buWiseData.reduce((sum, item) => sum + parseFloat(item.avgRating), 0).toFixed(2)
                : filteredData.reduce((sum, item) => sum + parseFloat(item.avgRating), 0).toFixed(2)
              }
            </SummaryValue>
            <SummaryLabel>Average Rating</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {showAccountWiseView 
                ? accountWiseData.reduce((sum, item) => sum + item.positive, 0)
                : showBUWiseView 
                ? buWiseData.reduce((sum, item) => sum + item.positive, 0)
                : filteredData.reduce((sum, item) => sum + item.positive, 0)
              }
            </SummaryValue>
            <SummaryLabel>Positive Sentiments</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {showAccountWiseView 
                ? accountWiseData.reduce((sum, item) => sum + item.neutral, 0)
                : showBUWiseView 
                ? buWiseData.reduce((sum, item) => sum + item.neutral, 0)
                : filteredData.reduce((sum, item) => sum + item.neutral, 0)
              }
            </SummaryValue>
            <SummaryLabel>Neutral Sentiments</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {showAccountWiseView 
                ? accountWiseData.reduce((sum, item) => sum + item.negative, 0)
                : showBUWiseView 
                ? buWiseData.reduce((sum, item) => sum + item.negative, 0)
                : filteredData.reduce((sum, item) => sum + item.negative, 0)
              }
            </SummaryValue>
            <SummaryLabel>Negative Sentiments</SummaryLabel>
          </SummaryItem>
          {showBUWiseView && (
            <SummaryItem>
              <SummaryValue>
                {buWiseData.reduce((sum, item) => sum + item.customerCount, 0)}
              </SummaryValue>
              <SummaryLabel>Total Customers</SummaryLabel>
            </SummaryItem>
          )}
        </SummaryGrid>
        
        {/* Show filter status */}
        {(businessUnitFilter || categoryFilter || customerNameSearch || projectNameSearch) && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            <strong>Active Filters:</strong>
            {businessUnitFilter && <span> Business Unit: "{businessUnitFilter}"</span>}
            {categoryFilter && <span> Category: "{categoryFilter}"</span>}
            {customerNameSearch && <span> Customer: "{customerNameSearch}"</span>}
            {projectNameSearch && <span> Project: "{projectNameSearch}"</span>}
            <span> • Showing {filteredData.length} of {processedData.length} records</span>
          </div>
        )}
      </ResultsSummary>

      {/* Sentiment Classification Legend */}
      <div style={{
        margin: '1rem 0',
        padding: '1rem',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#374151', fontSize: '1rem', fontWeight: '600' }}>
          Sentiment Classification (Positive, Neutral, Negative)
        </h4>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#10b981', 
              border: '1px solid #047857',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              <strong>Positive:</strong> Avg Rating ≥ 4 → Value = 1, otherwise = 0
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#f59e0b', 
              border: '1px solid #d97706',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              <strong>Neutral:</strong> Avg Rating is between 3 to 4 → Value = 1, otherwise = 0
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '20px', 
              height: '20px', 
              backgroundColor: '#ef4444', 
              border: '1px solid #dc2626',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>
              <strong>Negative:</strong> Avg Rating &lt; 3 → Value = 1, otherwise = 0
            </span>
          </div>
        </div>
      </div>

      <TableContainer>
        {showScrollHint && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#0c4a6e'
          }}>
            💡 <strong>Tip:</strong> Use the horizontal scroll bar below to view all columns in the {showBUWiseView ? 'BU-wise' : 'project-wise'} table
          </div>
        )}
        <TableWrapper onScroll={handleTableScroll}>
          <Table>
            <thead>
              <tr>
                <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                  S No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                {showAccountWiseView ? (
                  <>
                    <Th onClick={() => handleSort('customerId')} style={{ cursor: 'pointer' }}>
                      CUSTOMER_ID {sortConfig.key === 'customerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                      CUSTOMER NAME {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                  BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                  </>
                ) : showBUWiseView ? (
                  <>
                    <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                      BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('customerCount')} style={{ cursor: 'pointer' }}>
                      Customer Count {sortConfig.key === 'customerCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                  </>
                ) : (
                  <>
                    <Th onClick={() => handleSort('customerId')} style={{ cursor: 'pointer' }}>
                      CUSTOMER_ID {sortConfig.key === 'customerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                      CUSTOMER NAME {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('projId')} style={{ cursor: 'pointer' }}>
                      PROJ_ID {sortConfig.key === 'projId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>
                      PROJECT NAME {sortConfig.key === 'projectName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                      Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                      BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                  </>
                )}
                
                {/* Expected perspective columns */}
                {expectedPerspectives.map(perspective => (
                  <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                    {perspective} {sortConfig.key === perspective && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                ))}
                
                <Th onClick={() => handleSort('avgRating')} style={{ cursor: 'pointer' }}>
                  Avg Rating {sortConfig.key === 'avgRating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('positive')} style={{ cursor: 'pointer' }}>
                  Positive {sortConfig.key === 'positive' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('neutral')} style={{ cursor: 'pointer' }}>
                  Neutral {sortConfig.key === 'neutral' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('negative')} style={{ cursor: 'pointer' }}>
                  Negative {sortConfig.key === 'negative' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
              </tr>
            </thead>
            <tbody>
              {showAccountWiseView ? (
                // Account-wise view
                sortedData.map((row, index) => (
                  <tr key={index}>
                    <Td>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.customerId}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                    
                    {/* Expected perspective columns */}
                    {expectedPerspectives.map(perspective => (
                      <Td key={perspective}>{row[perspective] || 'N/A'}</Td>
                    ))}
                    
                    <Td>{row.avgRating}</Td>
                    <Td>{row.positive}</Td>
                    <Td>{row.neutral}</Td>
                    <Td>{row.negative}</Td>
                  </tr>
                ))
              ) : showBUWiseView ? (
                // BU-wise view
                getSortedData(buWiseData).map((row, index) => (
                  <tr key={index}>
                    <Td>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                    <Td>{row.customerCount}</Td>
                    
                    {/* Expected perspective columns */}
                    {expectedPerspectives.map(perspective => (
                      <Td key={perspective}>{row[perspective] || 'N/A'}</Td>
                    ))}
                    
                    <Td>{row.avgRating}</Td>
                    <Td>{row.positive}</Td>
                    <Td>{row.neutral}</Td>
                    <Td>{row.negative}</Td>
                  </tr>
                ))
              ) : (
                // Project-wise view
                sortedData.map((row, index) => (
                  <tr key={index}>
                    <Td>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.customerId}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.projId}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.projectName}</Td>
                    <Td>{row.category}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                    
                    {/* Expected perspective columns */}
                    {expectedPerspectives.map(perspective => (
                      <Td key={perspective}>{row[perspective] || 'N/A'}</Td>
                    ))}
                    
                    <Td>{row.avgRating}</Td>
                    <Td>{row.positive}</Td>
                    <Td>{row.neutral}</Td>
                    <Td>{row.negative}</Td>
                  </tr>
                ))
              )}
            </tbody>
        </Table>
        </TableWrapper>
        
        {/* Scroll indicator */}
        {showScrollHint && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            🔄 Scroll horizontally to view all columns
          </div>
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default SentimentsDashboard; 