import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, X, Download, BarChart3, ChevronLeft, PieChart } from 'lucide-react';
import * as XLSX from 'xlsx';
import { normalizeBusinessUnitDisplay } from '../utils/normalizeBusinessUnitDisplay';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
`;

const HeaderTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

const UploadContainer = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin: 1rem 0;
`;

const FileDetails = styled.div`
  text-align: left;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TableContainer = styled.div`
  overflow: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  max-height: 600px; /* Set maximum height for vertical scroll */
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 12px;
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const TableWrapper = styled.div`
  min-width: 1000px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
  table-layout: auto;
`;

const Th = styled.th`
  background: #f8fafc;
  padding: 0.6rem 0.75rem;
  font-size: 0.85rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  position: sticky;
  top: 0;
  z-index: 10;

  &:hover {
    background: #f1f5f9;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  min-width: 150px;
`;

const ResultsSummary = styled.div`
  background: #dbeafe;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #3b82f6;
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
  }
`;

const ChartContainer = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: space-between;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DonutChart = styled.div`
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  position: relative;
`;

const ChartLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  margin-top: 2px;
`;

const ChartSummary = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SummaryItem = styled.div`
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #3b82f6;
  }
  
  .label {
    font-size: 0.875rem;
    color: #6b7280;
    margin-top: 0.25rem;
  }
`;

const BUWiseResponseRateDashboard = ({ onBackToDashboard }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setUploadStatus(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid Excel file (.xlsx)' });
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadedData(null);
  };

  const processFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadStatus(null);

    try {
      const result = await readExcelFile(selectedFile);
      if (result && result.data && result.data.length > 0) {
        setUploadedData(result.data);
        setUploadStatus({ type: 'success', message: `Successfully loaded ${result.data.length} records from Excel file.` });
      } else {
        setUploadStatus({ type: 'error', message: 'No data found in the Excel file' });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({ type: 'error', message: 'Error processing Excel file. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Show all available sheets for debugging
          console.log('=== EXCEL SHEET ANALYSIS ===');
          console.log('Available sheets in workbook:', workbook.SheetNames);
          console.log('Total sheets found:', workbook.SheetNames.length);
          console.log('Sheet names with exact lengths:');
          workbook.SheetNames.forEach((sheet, index) => {
            console.log(`  Sheet ${index + 1}: "${sheet}" (length: ${sheet.length})`);
          });
          
          // SPECIFICALLY look for the 2nd sheet "CSAT sent and received Report"
          let cssSheetName = 'CSAT sent and received Report';
          
          if (!workbook.SheetNames.includes(cssSheetName)) {
            // Try to find the sheet with flexible matching (handle trailing spaces, etc.)
            const flexibleMatch = workbook.SheetNames.find(sheet => 
              sheet.trim() === 'CSAT sent and received Report' ||
              sheet.toLowerCase().trim() === 'csat sent and received report' ||
              sheet.toLowerCase().includes('csat') && sheet.toLowerCase().includes('sent') && sheet.toLowerCase().includes('received') && sheet.toLowerCase().includes('report')
            );
            
            if (flexibleMatch) {
              cssSheetName = flexibleMatch;
              console.log(`Found CSS sheet with flexible matching: "${cssSheetName}"`);
            } else if (workbook.SheetNames.length >= 2) {
              // If not found, use the 2nd sheet by index (Sheet2)
              cssSheetName = workbook.SheetNames[1]; // Use 2nd sheet (index 1)
              console.log(`CSS sheet not found. Using 2nd sheet: "${cssSheetName}"`);
            } else {
              reject(new Error('No second sheet found. File must have at least 2 sheets.'));
              return;
            }
          } else {
            console.log(`Found CSS sheet: "${cssSheetName}"`);
          }
          
          console.log(`Using CSS sheet: "${cssSheetName}"`);
          console.log('=== END SHEET ANALYSIS ===');
          
          // Read CSS data from the identified sheet
          const cssWorksheet = workbook.Sheets[cssSheetName];
          const cssJsonData = XLSX.utils.sheet_to_json(cssWorksheet, { header: 1 });
          
          if (cssJsonData.length < 2) {
            reject(new Error('CSS sheet must have at least a header row and one data row'));
            return;
          }
          
          // Extract headers and data from CSS sheet
          const cssHeaders = cssJsonData[0];
          const cssDataRows = cssJsonData.slice(1);
          
          // Convert to array of objects for CSS data
          const cssResult = cssDataRows.map(row => {
            const obj = {};
            cssHeaders.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
          
          console.log(`CSS data loaded: ${cssResult.length} rows`);
          console.log('CSS headers found:', cssHeaders);
          
          resolve({ 
            data: cssResult, 
            headers: cssHeaders
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

     // Process data to calculate response rates grouped by BUSSINESS UNIT
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    // Find column names dynamically
    const availableColumns = Object.keys(uploadedData[0]);
    
    // Debug: Show all available columns
    console.log('=== EXCEL FILE STRUCTURE ANALYSIS ===');
    console.log('Available columns in uploaded data:', availableColumns);
    console.log('Total columns found:', availableColumns.length);
    console.log('Sample row data:', uploadedData[0]);
    console.log('Column names with exact values:');
    availableColumns.forEach((col, index) => {
      console.log(`  Column ${index + 1}: "${col}" (length: ${col.length})`);
    });
    
    // Try to find business unit column with more comprehensive search
    let businessUnitColumn = null;
    
    // First, try exact matches including BUSSINESS UNIT (with two S's)
    businessUnitColumn = availableColumns.find(col => 
      col === 'BUSSINESS UNIT' || col === 'BUSINESS_UNIT' || col === 'Business Unit' || col === 'business_unit' || col === 'BU' || col === 'bu' || col === 'BusinessUnit' || 
      col === 'BUSINESS UNIT' || col === 'BusinessUnit' || col === 'BUSINESSUNIT' || col === 'businessunit' || col === 'Business_Unit' || col === 'business_unit'
    );
    
         // Debug: Check for exact match with BUSSINESS UNIT
     console.log('Looking for BUSSINESS UNIT column...');
     const exactMatch = availableColumns.find(col => col === 'BUSSINESS UNIT');
     console.log('Exact match for "BUSSINESS UNIT":', exactMatch);
     console.log('All columns that contain "BUSSINESS":', availableColumns.filter(col => col.includes('BUSSINESS')));
     console.log('All columns that contain "UNIT":', availableColumns.filter(col => col.includes('UNIT')));
     console.log('All columns that contain "BUSINESS":', availableColumns.filter(col => col.includes('BUSINESS')));
     
     // Check each column individually for business unit patterns
     console.log('Checking each column for business unit patterns:');
     availableColumns.forEach((col, index) => {
       const lowerCol = col.toLowerCase();
       if (lowerCol.includes('business') || lowerCol.includes('unit') || lowerCol.includes('bu')) {
         console.log(`  Column ${index + 1}: "${col}" - potential business unit column`);
       }
     });
    
    // Check for columns with trailing spaces or hidden characters
    console.log('Checking for columns with trailing spaces...');
    availableColumns.forEach((col, index) => {
      if (col.includes('BUSSINESS') || col.includes('UNIT')) {
        console.log(`Column ${index + 1}: "${col}" (length: ${col.length}) - trimmed: "${col.trim()}"`);
        console.log(`  Contains BUSSINESS: ${col.includes('BUSSINESS')}`);
        console.log(`  Contains UNIT: ${col.includes('UNIT')}`);
        console.log(`  Trimmed equals "BUSSINESS UNIT": ${col.trim() === 'BUSSINESS UNIT'}`);
      }
    });
    
    // If not found, try partial matches
    if (!businessUnitColumn) {
      businessUnitColumn = availableColumns.find(col => 
        col.toLowerCase().includes('business') && col.toLowerCase().includes('unit') ||
        col.toLowerCase().includes('bu') ||
        col.toLowerCase().includes('business_unit') ||
        col.toLowerCase().includes('division') ||
        col.toLowerCase().includes('department') ||
        col.toLowerCase().includes('org') ||
        col.toLowerCase().includes('organization') ||
        col.toLowerCase().includes('team') ||
        col.toLowerCase().includes('group')
      );
    }
    
    // If still not found, try trimming spaces
    if (!businessUnitColumn) {
      console.log('Trying to find column with trimmed spaces...');
      businessUnitColumn = availableColumns.find(col => 
        col.trim() === 'BUSSINESS UNIT' || 
        col.trim() === 'BUSINESS UNIT' ||
        col.trim().toLowerCase() === 'bussiness unit' ||
        col.trim().toLowerCase() === 'business unit'
      );
      if (businessUnitColumn) {
        console.log('Found business unit column after trimming spaces:', businessUnitColumn);
      }
    }
    
    const customerIdColumn = availableColumns.find(col => 
      col === 'CUST_ID' || col === 'CUSTOMER_ID' || col === 'Customer ID' || col === 'customer_id' || col === 'C_ID' || col === 'C_id' ||
      col === 'CUSTOMERID' || col === 'CustomerID' || col === 'customerid' ||
      col.toLowerCase().includes('customer') && col.toLowerCase().includes('id')
    );
    
    const cssSentColumn = availableColumns.find(col => 
      col === 'CSS_SENT_DATE' || col === 'CSS Sent Date' || col === 'css_sent_date' ||
      col === 'CSS_SENT' || col === 'CSS Sent' || col === 'css_sent' ||
      col.toLowerCase().includes('css') && col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')
    );
    
    const cssReceivedColumn = availableColumns.find(col => 
      col === 'CSS_RECEIVED_DATE' || col === 'CSS Received Date' || col === 'css_received_date' ||
      col === 'CSS_RECEIVED' || col === 'CSS Received' || col === 'css_received' ||
      col.toLowerCase().includes('css') && col.toLowerCase().includes('received') && col.toLowerCase().includes('date')
    );
    
    // Debug: Show detected columns
    console.log('Detected columns:', {
      businessUnitColumn,
      customerIdColumn,
      cssSentColumn,
      cssReceivedColumn
    });
    
    if (!customerIdColumn || !cssSentColumn || !cssReceivedColumn) {
      console.error('Required columns not found:', { businessUnitColumn, customerIdColumn, cssSentColumn, cssReceivedColumn });
      return [];
    }
    
    // If business unit column is not found, try to find any column that might contain business unit data
    let finalBusinessUnitColumn = businessUnitColumn;
    if (!businessUnitColumn) {
      console.warn('Business Unit column not found, looking for alternatives...');
      const alternativeColumns = availableColumns.filter(col => 
        col.toLowerCase().includes('unit') || 
        col.toLowerCase().includes('bu') || 
        col.toLowerCase().includes('business') ||
        col.toLowerCase().includes('division') ||
        col.toLowerCase().includes('department') ||
        col.toLowerCase().includes('org') ||
        col.toLowerCase().includes('organization') ||
        col.toLowerCase().includes('team') ||
        col.toLowerCase().includes('group')
      );
      if (alternativeColumns.length > 0) {
        finalBusinessUnitColumn = alternativeColumns[0];
        console.log('Using alternative business unit column:', finalBusinessUnitColumn);
      } else {
        // If still not found, use customer ID as business unit (group by customer)
        console.warn('No business unit column found, grouping by customer ID instead');
        console.log('Available columns for grouping:', availableColumns);
        console.log('All available columns that might be useful:');
        availableColumns.forEach((col, index) => {
          console.log(`  ${index + 1}. "${col}" - might contain: ${getColumnPurpose(col)}`);
        });
        finalBusinessUnitColumn = customerIdColumn;
      }
    }
    
         console.log('Final business unit column being used:', finalBusinessUnitColumn);
     console.log('Sample business unit values from first 3 rows:');
     if (uploadedData.length > 0) {
       for (let i = 0; i < Math.min(3, uploadedData.length); i++) {
         console.log(`  Row ${i + 1}: ${finalBusinessUnitColumn} = "${uploadedData[i][finalBusinessUnitColumn]}"`);
       }
     }
    
    // Helper function to suggest column purpose
    function getColumnPurpose(columnName) {
      const name = columnName.toLowerCase();
      if (name.includes('customer') || name.includes('client') || name.includes('id')) return 'Customer identification';
      if (name.includes('date') || name.includes('time')) return 'Date/time information';
      if (name.includes('rating') || name.includes('score')) return 'Rating/score data';
      if (name.includes('survey') || name.includes('feedback')) return 'Survey/feedback data';
      if (name.includes('status') || name.includes('state')) return 'Status information';
      if (name.includes('type') || name.includes('category')) return 'Classification data';
      if (name.includes('name') || name.includes('title')) return 'Name/title information';
      return 'General data';
    }
    
         // First pass: Calculate totals for each BUSSINESS UNIT
     const businessUnitTotals = new Map();
     
     uploadedData.forEach(row => {
       const rawBU = finalBusinessUnitColumn ? (row[finalBusinessUnitColumn] || 'N/A') : 'No BU Column Found';
       const businessUnitValue = rawBU === 'N/A' || rawBU === 'No BU Column Found' ? rawBU : normalizeBusinessUnitDisplay(rawBU);
       const cssSentDate = row[cssSentColumn];
       const cssReceivedDate = row[cssReceivedColumn];
       
       if (!businessUnitTotals.has(businessUnitValue)) {
         businessUnitTotals.set(businessUnitValue, {
           surveysSent: 0,
           surveysReceived: 0
         });
       }
       
       const businessUnitData = businessUnitTotals.get(businessUnitValue);
       
       // Count CSS_SENT_DATE for business unit
       if (cssSentDate && cssSentDate !== '' && cssSentDate !== 'N/A' && cssSentDate !== null) {
         businessUnitData.surveysSent++;
       }
       
       // Count CSS_RECEIVED_DATE for business unit
       if (cssReceivedDate && cssReceivedDate !== '' && cssReceivedDate !== 'N/A' && cssReceivedDate !== null) {
         businessUnitData.surveysReceived++;
       }
     });
     
     // Second pass: Create rows with business unit totals
     const result = [];
     let sNo = 1;
     
     businessUnitTotals.forEach((businessUnitData, businessUnitValue) => {
       // Calculate response rate for business unit
       const responseRate = businessUnitData.surveysSent > 0 
         ? ((businessUnitData.surveysReceived / businessUnitData.surveysSent) * 100).toFixed(2)
         : '0.00';
       
       result.push({
         sNo: sNo++,
         businessUnit: businessUnitValue,
         surveysSent: businessUnitData.surveysSent,
         surveysReceived: businessUnitData.surveysReceived,
         responseRate: `${responseRate}%`
       });
     });
    
    console.log('Processed data for BU Wise Response Rate:', result);
    return result;
  }, [uploadedData]);

  // Sort business units in the specified order
  const sortedProcessedData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    const businessUnitOrder = ['Healthcare', 'New Growth', 'Tech', 'India & UK'];
    
    return processedData.sort((a, b) => {
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
  }, [processedData]);

     // Apply filters to processed data
  const filteredData = useMemo(() => {
    if (!sortedProcessedData || sortedProcessedData.length === 0) return [];
    return sortedProcessedData; // No filtering needed since we're grouping by BUSSINESS UNIT
  }, [sortedProcessedData]);

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
      
      // Handle percentage values
      if (typeof aVal === 'string' && aVal.includes('%')) {
        aVal = parseFloat(aVal);
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

  const sortedData = getSortedData(filteredData);

  // Color coding functions for Response Rate %
  const getResponseRateCellColor = (responseRate) => {
    const rate = parseFloat(responseRate.replace('%', ''));
    if (isNaN(rate)) return 'transparent';
    if (rate >= 0 && rate <= 50) {
      return '#fecaca'; // Red for 0% to 50%
    } else if (rate >= 51 && rate <= 74) {
      return '#fef3c7'; // Amber for 51% to 74%
    } else if (rate >= 75) {
      return '#d1fae5'; // Green for >=75%
    }
    return 'transparent';
  };

  const getResponseRateTextColor = (responseRate) => {
    const rate = parseFloat(responseRate.replace('%', ''));
    if (isNaN(rate)) return '#374151';
    if (rate >= 0 && rate <= 50) {
      return '#991b1b'; // Dark red text for red background
    } else if (rate >= 51 && rate <= 74) {
      return '#92400e'; // Dark amber text for amber background
    } else if (rate >= 75) {
      return '#065f46'; // Dark green text for green background
    }
    return '#374151';
  };

  // Prepare chart data for donut chart
  const chartData = useMemo(() => {
    if (!sortedProcessedData || sortedProcessedData.length === 0) return [];
    
    return sortedProcessedData.map((item, index) => ({
      id: item.businessUnit,
      label: item.businessUnit,
      value: parseFloat(item.responseRate.replace('%', '')),
      color: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
      surveysSent: item.surveysSent,
      surveysReceived: item.surveysReceived
    }));
  }, [sortedProcessedData]);

  // Download functionality
    const downloadData = () => {
    if (!sortedProcessedData || sortedProcessedData.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(sortedProcessedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BU Wise Response Rate');
    
         // Set column widths
     const columnWidths = [
       { wch: 10 }, // S No.
       { wch: 25 }, // BUSSINESS UNIT
       { wch: 25 }, // Number of CSAT Surveys Sent
       { wch: 28 }, // Number of CSAT Surveys Received
       { wch: 20 }, // Response Rate %
     ];
     
     worksheet['!cols'] = columnWidths;
     
     XLSX.writeFile(workbook, 'BU_Wise_Response_Rate_Analysis.xlsx');
   };

  // Download chart as image
  const downloadChart = () => {
    if (!chartData || chartData.length === 0) return;
    
    const svg = document.querySelector('.donut-chart svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 800;
    canvas.height = 800;
    
    img.onload = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'BU_Wise_Response_Rate_Chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Render donut chart
  const renderDonutChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          No data available for chart
        </div>
      );
    }

    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    const centerX = 200;
    const centerY = 200;
    const radius = 120;
    const innerRadius = 60;

    let currentAngle = 0;
    const paths = [];
    const labels = [];

    chartData.forEach((item, index) => {
      const sliceAngle = (item.value / totalValue) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      // Create donut slice path
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

      const outerArc = `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
      const innerArc = `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startAngle)} ${centerY + innerRadius * Math.sin(startAngle)}`;

      const pathData = `M ${x1} ${y1} ${outerArc} L ${centerX + innerRadius * Math.cos(endAngle)} ${centerY + innerRadius * Math.sin(endAngle)} ${innerArc} Z`;

      paths.push(
        <path
          key={index}
          d={pathData}
          fill={item.color}
          stroke="#fff"
          strokeWidth="2"
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => {
            e.target.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = '1';
          }}
        />
      );

      // Add labels with better positioning and visibility
      const labelAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius + 35;
      const labelX = centerX + labelRadius * Math.cos(labelAngle);
      const labelY = centerY + labelRadius * Math.sin(labelAngle);

      // Add label background for better readability
      const labelText = item.label;
      const textLength = labelText.length * 6; // Approximate text width
      
      labels.push(
        <g key={`label-${index}`}>
          {/* Label background */}
          <rect
            x={labelX - textLength/2 - 4}
            y={labelY - 8}
            width={textLength + 8}
            height={16}
            fill="rgba(255, 255, 255, 0.9)"
            stroke={item.color}
            strokeWidth="1"
            rx="3"
          />
          {/* Label text */}
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="600"
            fill="#374151"
          >
            {item.label}
          </text>
          {/* Percentage label */}
          <text
            x={labelX}
            y={labelY + 18}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="500"
            fill={item.color}
          >
            {item.value.toFixed(1)}%
          </text>
        </g>
      );

      currentAngle = endAngle;
    });

    return (
      <svg width="400" height="400" viewBox="0 0 400 400" className="donut-chart-svg">
        {paths}
        {labels}
        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="700"
          fill="#374151"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#6b7280"
        >
          {totalValue.toFixed(1)}%
        </text>
      </svg>
    );
  };

  if (!uploadedData) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <BarChart3 size={24} /> Dashboard for BU Wise Response Rate
          </HeaderTitle>
          {onBackToDashboard && (
            <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </DashboardHeader>

        <UploadContainer>
          <p style={{ color: '#3b82f6', fontSize: '1.125rem', marginBottom: '2rem' }}>
            Please upload the Excel file to view BU Wise Response Rate
          </p>
          
          {!selectedFile ? (
            <UploadArea onClick={() => document.getElementById('file-input').click()}>
              <Upload size={48} color="#3b82f6" />
              <p>Drop your Excel file here or click to browse</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Supports .xlsx files</p>
            </UploadArea>
          ) : (
            <FileInfo>
              <FileSpreadsheet size={24} color="#3b82f6" />
              <FileDetails>
                <FileName>{selectedFile.name}</FileName>
                <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
              </FileDetails>
              <RemoveButton onClick={removeFile}>
                <X size={16} />
              </RemoveButton>
            </FileInfo>
          )}
          
          <input
            id="file-input"
            type="file"
            accept=".xlsx"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
          
          {selectedFile && (
            <ActionButton 
              onClick={processFile}
              disabled={isProcessing}
              style={{ marginTop: '1rem' }}
            >
              {isProcessing ? 'Processing...' : 'Load Dashboard for BU Wise Response Rate data'}
            </ActionButton>
          )}
          

          
          {uploadStatus && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              borderRadius: '8px',
              background: uploadStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: uploadStatus.type === 'success' ? '#065f46' : '#991b1b',
              border: `1px solid ${uploadStatus.type === 'success' ? '#a7f3d0' : '#fecaca'}`
            }}>
              {uploadStatus.message}
            </div>
          )}
        </UploadContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <BarChart3 size={24} /> Dashboard for BU Wise Response Rate
        </HeaderTitle>
        {onBackToDashboard && (
          <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
            <ChevronLeft size={16} /> Back
          </BackButton>
        )}
      </DashboardHeader>

             <FilterContainer>
         <DownloadButton onClick={downloadData}>
           <Download size={16} />
           Download Data
         </DownloadButton>
       </FilterContainer>

               {/* Donut Chart */}
        <ChartContainer>
          <ChartTitle>
            <ChartHeader>
              <PieChart size={20} />
              Response Rate Distribution by Business Unit
            </ChartHeader>
            <DownloadButton onClick={downloadChart} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              <Download size={16} />
              Download Chart
            </DownloadButton>
          </ChartTitle>
          <ChartSummary>
            <SummaryItem>
              <div className="value">{chartData.length}</div>
              <div className="label">Business Units</div>
            </SummaryItem>
            <SummaryItem>
              <div className="value">
                {chartData.reduce((sum, item) => sum + item.surveysSent, 0).toLocaleString()}
              </div>
              <div className="label">Total Surveys Sent</div>
            </SummaryItem>
            <SummaryItem>
              <div className="value">
                {chartData.reduce((sum, item) => sum + item.surveysReceived, 0).toLocaleString()}
              </div>
              <div className="label">Total Surveys Received</div>
            </SummaryItem>
            <SummaryItem>
              <div className="value">
                {chartData.reduce((sum, item) => sum + item.value, 0).toFixed(1)}%
              </div>
              <div className="label">Average Response Rate</div>
            </SummaryItem>
          </ChartSummary>
          <DonutChart className="donut-chart">
            {renderDonutChart()}
          </DonutChart>
          <ChartLegend>
            {chartData.map((item, index) => (
              <LegendItem key={index}>
                <LegendColor color={item.color} />
                <span>
                  <strong>{item.label}</strong>: {item.value.toFixed(1)}% 
                  <br />
                  <small style={{ color: '#6b7280' }}>
                    Surveys: {item.surveysReceived}/{item.surveysSent}
                  </small>
                </span>
              </LegendItem>
            ))}
          </ChartLegend>
        </ChartContainer>

        {/* Color Legend for Response Rate - Below Chart */}
        <div style={{
          margin: '1rem',
          padding: '1rem',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Response Rate Color Legend:</span>
          
          {/* Red - 0% to 50% */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#fecaca',
              border: '1px solid #f87171',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>0% to 50% (Red)</span>
          </div>
          
          {/* Amber - 51% to 74% */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>51% to 74% (Amber)</span>
          </div>
          
          {/* Green - >=75% */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '4px'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#374151' }}>≥75% (Green)</span>
          </div>
        </div>

       <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                                 <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                   S No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </Th>
                 <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                   BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </Th>
                 <Th onClick={() => handleSort('surveysSent')} style={{ cursor: 'pointer' }}>
                   Number of CSAT Surveys Sent {sortConfig.key === 'surveysSent' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </Th>
                 <Th onClick={() => handleSort('surveysReceived')} style={{ cursor: 'pointer' }}>
                   Number of CSAT Surveys Received {sortConfig.key === 'surveysReceived' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </Th>
                 <Th onClick={() => handleSort('responseRate')} style={{ cursor: 'pointer' }}>
                   Response Rate % {sortConfig.key === 'responseRate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                 </Th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                                 sortedData.map((row, index) => (
                   <tr key={index}>
                     <Td>{row.sNo}</Td>
                     <Td>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                     <Td>{row.surveysSent}</Td>
                     <Td>{row.surveysReceived}</Td>
                     <Td style={{ backgroundColor: getResponseRateCellColor(row.responseRate), color: getResponseRateTextColor(row.responseRate) }}>
                       {row.responseRate}
                     </Td>
                   </tr>
                 ))
              ) : (
                                 <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                     No data found
                   </td>
                 </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>
    </DashboardContainer>
  );
};

export default BUWiseResponseRateDashboard;
