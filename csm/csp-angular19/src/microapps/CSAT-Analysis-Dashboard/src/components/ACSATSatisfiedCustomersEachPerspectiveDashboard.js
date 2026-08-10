import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { normalizeBusinessUnitDisplay, businessUnitsMatch } from '../utils/normalizeBusinessUnitDisplay';

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

const ToggleButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' 
      : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
    };
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 80vh;
  max-width: 100%;
  
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
    border: 2px solid #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  
  &::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }
`;

const Table = styled.table`
  width: 100%;
  min-width: 1200px; /* Ensure table has minimum width for all columns */
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const TableHeader = styled.thead`
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #d1d5db;
  white-space: nowrap;
  background: ${props => props.isFirstColumn ? 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)' : 'transparent'};
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  z-index: ${props => props.isFirstColumn ? '11' : 'auto'};
  box-shadow: ${props => props.isFirstColumn ? '2px 0 5px rgba(0,0,0,0.1)' : 'none'};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }

  &:hover {
    background-color: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  background: ${props => props.isFirstColumn ? '#ffffff' : 'transparent'};
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  z-index: ${props => props.isFirstColumn ? '9' : 'auto'};
  box-shadow: ${props => props.isFirstColumn ? '2px 0 5px rgba(0,0,0,0.1)' : 'none'};
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
`;

const GrandTotalRow = styled.tr`
  background: #f8fafc;
  font-weight: bold;
  border-top: 2px solid #3b82f6;
`;

const GrandTotalCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #000000;
  background: #e2e8f0;
  font-weight: bold;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #dc2626;
  font-size: 1.125rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
`;

const SuccessMessage = styled.div`
  text-align: center;
  padding: 1rem;
  color: #059669;
  font-size: 0.875rem;
  background: #f0fdf4;
  border-radius: 8px;
  border: 1px solid #bbf7d0;
  margin-bottom: 1rem;
`;

const DebugInfo = styled.div`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.75rem;
  color: #374151;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px -1px rgba(0, 0, 0, 0.1);
  max-width: 600px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  height: 36px;
  transition: border-color 0.2s ease;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
    font-size: 0.8rem;
  }
`;

const SearchLabel = styled.label`
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  font-size: 0.8rem;
`;

const ClearButton = styled.button`
  padding: 0.375rem 0.75rem;
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
  font-weight: 500;
  height: 36px;
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #4b5563;
  }
`;

const ColoredTableCell = styled.td`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
  font-weight: 500;
  background-color: ${props => {
    if (props.percentage === null || props.percentage === undefined) return '#f3f4f6';
    if (props.percentage < 75) return '#FF0000'; // Red (Excel standard)
    if (props.percentage >= 75 && props.percentage < 90) return '#FFA500'; // Orange (Excel standard)
    if (props.percentage >= 90) return '#059669'; // Dark Green
    return '#f3f4f6';
  }};
  color: ${props => {
    if (props.percentage === null || props.percentage === undefined) return '#6b7280';
    if (props.percentage < 75) return '#ffffff'; // White text for Dark Red
    if (props.percentage >= 75 && props.percentage < 90) return '#ffffff'; // White text for Orange
    if (props.percentage >= 90) return '#ffffff'; // White text for Dark Green
    return '#6b7280';
  }};
  border-radius: 4px;
  margin: 2px;
`;

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
`;

const LegendTitle = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-right: 0.5rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  background-color: ${props => props.color};
`;

const LegendText = styled.span`
  color: #374151;
  font-weight: 500;
`;

const ACSATSatisfiedCustomersEachPerspectiveDashboard = ({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, onBack }) => {
  const [uploadedData, setUploadedData] = useState(null);
  const [secondSheetData, setSecondSheetData] = useState(null);
  const [groupByBU, setGroupByBU] = useState(true);
  const [showScrollable, setShowScrollable] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20;

  // Helper function to parse MM-DD-YYYY date and compare with CSAT cycle start date
  const isDateOnOrAfterCsatStart = (dateValue) => {
    console.log(`\n📅 Date validation for: "${dateValue}"`);
    console.log(`CSAT Cycle Start Date Formatted: ${acsatCycleStartDateFormatted}`);
    console.log(`CSAT Cycle Start Date Object: ${acsatCycleStartDate ? acsatCycleStartDate.toISOString().split('T')[0] : 'Not set'}`);
    
    if (!acsatCycleStartDateFormatted || !dateValue) {
      console.log(`Result: ${!acsatCycleStartDateFormatted ? 'No start date set' : 'No date value'} - including all dates`);
      return true;
    }
    
    try {
      // Parse the date value (could be in various formats)
      let dateToCheck;
      
      if (typeof dateValue === 'string') {
        // Try to parse MM-DD-YYYY format first
        if (dateValue.includes('/')) {
          const parts = dateValue.split('/');
          if (parts.length === 3) {
            // Assume MM/DD/YYYY format
            dateToCheck = new Date(parts[2], parts[0] - 1, parts[1]);
          }
        } else if (dateValue.includes('-')) {
          const parts = dateValue.split('-');
          if (parts.length === 3) {
            // Check if it's MM-DD-YYYY or YYYY-MM-DD
            if (parts[0].length === 4) {
              // YYYY-MM-DD format
              dateToCheck = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
              // MM-DD-YYYY format
              dateToCheck = new Date(parts[2], parts[0] - 1, parts[1]);
            }
          }
        } else {
          // Try direct parsing
          dateToCheck = new Date(dateValue);
        }
      } else if (dateValue instanceof Date) {
        dateToCheck = dateValue;
      } else {
        // Try to convert to date
        dateToCheck = new Date(dateValue);
      }
      
      // Check if date is valid
      if (isNaN(dateToCheck.getTime())) {
        console.log('Invalid date format:', dateValue);
        return true; // Include invalid dates by default
      }
      
      // Compare with CSAT cycle start date
      const isAfterOrEqual = dateToCheck >= acsatCycleStartDate;
      console.log('Date comparison:', {
        dateValue,
        parsedDate: dateToCheck.toISOString().split('T')[0],
        csatStartDate: acsatCycleStartDate.toISOString().split('T')[0],
        isAfterOrEqual
      });
      
      console.log(`✅ Final result: ${isAfterOrEqual ? 'VALID' : 'INVALID'} - ${isAfterOrEqual ? 'including' : 'excluding'} this date`);
      return isAfterOrEqual;
    } catch (error) {
      console.error('Error parsing date:', dateValue, error);
      return true; // Include dates that can't be parsed
    }
  };

  useEffect(() => {
    console.log('=== ACSATSatisfiedCustomersEachPerspectiveDashboard useEffect ===');
    console.log('excelData received:', excelData);
    
    if (!excelData) {
      console.log('No excelData provided to ACSATSatisfiedCustomersEachPerspectiveDashboard');
      return;
    }

    try {
      console.log('Processing ACSAT data for Satisfied Customers Each Perspective Dashboard');
      console.log('Excel data:', excelData);
      console.log('Sheet names:', excelData.SheetNames);

      // Look for the "CSAT received Report" sheet
      const targetSheetName = excelData.SheetNames.find(name => 
        name.toLowerCase().includes('csat received report') || 
        name.toLowerCase().includes('csat received') ||
        name.toLowerCase().includes('received report')
      );

      if (!targetSheetName) {
        console.log('CSAT received Report sheet not found. Available sheets:', excelData.SheetNames);
        return;
      }

      console.log('Found target sheet:', targetSheetName);

      const sheet = excelData.Sheets[targetSheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!jsonData || jsonData.length === 0) {
        console.log('No data found in the sheet');
        return;
      }

      console.log('Raw sheet data (first 5 rows):', jsonData.slice(0, 5));

      // Find the header row
      let headerRowIndex = -1;
      let headers = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const rowStr = row.join(' ').toLowerCase();
          if (rowStr.includes('s no') || rowStr.includes('business unit') || rowStr.includes('customer')) {
            headerRowIndex = i;
            headers = row;
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        console.log('Header row not found');
        return;
      }

      console.log('Header row found at index:', headerRowIndex);
      console.log('Headers:', headers);

      // Convert to objects using headers
      const dataRows = jsonData.slice(headerRowIndex + 1);
      const processedData = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      }).filter(row => Object.values(row).some(value => value !== ''));

      console.log('Processed data length:', processedData.length);
      console.log('First processed row:', processedData[0]);
      console.log('Column names:', processedData[0] ? Object.keys(processedData[0]) : 'No columns');
      
      // Check for required columns
      if (processedData[0]) {
        console.log('Required columns check:');
        console.log('- BUSSINESS UNIT:', processedData[0]['BUSSINESS UNIT'] || processedData[0]['Business Unit'] || 'NOT FOUND');
        console.log('- CUSTOMER_ID:', processedData[0]['CUSTOMER_ID'] || processedData[0]['CUST_ID'] || 'NOT FOUND');
        console.log('- CUSTOMER NAME:', processedData[0]['CUSTOMER NAME'] || processedData[0]['CUST_NM'] || 'NOT FOUND');
        console.log('- PERSPECTIVE:', Object.keys(processedData[0]).find(key => key.toLowerCase().includes('perspective')) || 'NOT FOUND');
        console.log('- RATING:', processedData[0]['RATING'] || 'NOT FOUND');
      }

      setUploadedData(processedData);
      
      // Process second sheet "CSAT sent and received Report"
      if (excelData.SheetNames.length > 1) {
        const secondSheetName = excelData.SheetNames.find(name => 
          name.toLowerCase().includes('csat sent and received report') || 
          name.toLowerCase().includes('sent and received') ||
          name.toLowerCase().includes('sent received')
        );

        if (secondSheetName) {
          console.log('Found second sheet:', secondSheetName);
          
          const secondSheet = excelData.Sheets[secondSheetName];
          const secondJsonData = XLSX.utils.sheet_to_json(secondSheet, { header: 1 });

          if (secondJsonData && secondJsonData.length > 0) {
            console.log('Second sheet data (first 5 rows):', secondJsonData.slice(0, 5));

            // Find header row for second sheet
            let secondHeaderRowIndex = -1;
            let secondHeaders = [];
            
            for (let i = 0; i < secondJsonData.length; i++) {
              const row = secondJsonData[i];
              if (row && row.length > 0) {
                const rowStr = row.join(' ').toLowerCase();
                if (rowStr.includes('customer') || rowStr.includes('css') || rowStr.includes('sent') || rowStr.includes('received')) {
                  secondHeaderRowIndex = i;
                  secondHeaders = row;
                  break;
                }
              }
            }
            
            if (secondHeaderRowIndex !== -1) {
              const secondDataRows = secondJsonData.slice(secondHeaderRowIndex + 1);
              const processedSecondData = secondDataRows.map(row => {
                const obj = {};
                secondHeaders.forEach((header, index) => {
                  obj[header] = row[index] || '';
                });
                return obj;
              }).filter(row => Object.values(row).some(value => value !== ''));
              
              console.log('Second sheet processed data length:', processedSecondData.length);
              console.log('Second sheet headers:', secondHeaders);
              console.log('First second sheet row:', processedSecondData[0]);
              
              // Check for required columns
              if (processedSecondData[0]) {
                console.log('Second sheet required columns check:');
                console.log('- CUSTOMER_ID:', processedSecondData[0]['CUSTOMER_ID'] || processedSecondData[0]['CUST_ID'] || 'NOT FOUND');
                console.log('- CSS_SENT_DATE:', processedSecondData[0]['CSS_SENT_DATE'] || 'NOT FOUND');
                console.log('- CSS_RECEIVED_DATE:', processedSecondData[0]['CSS_RECEIVED_DATE'] || 'NOT FOUND');
              }
              
              setSecondSheetData(processedSecondData);
            } else {
              console.log('Second sheet header row not found');
            }
          } else {
            console.log('No data found in second sheet');
          }
        } else {
          console.log('CSAT sent and received Report sheet not found. Available sheets:', excelData.SheetNames);
        }
      }
      
    } catch (error) {
      console.error('Error processing ACSAT data:', error);
    }
  }, [excelData]);

  // Process data for display
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) {
      return { data: [], error: 'No data available' };
    }

    console.log('Processing data for display...');
    console.log('Uploaded data length:', uploadedData.length);
    console.log('Second sheet data length:', secondSheetData?.length || 0);
    
    // Manual column mapping - update these if columns are not found automatically
    const manualColumnMapping = {
      'Meeting Delivery Commitments': null, // Will be auto-detected, or set manually here
      'Customer Engagement and Relationship': null, // Will be auto-detected, or set manually here  
      'Partner adding value to Customer Business': null // Will be auto-detected, or set manually here
    };
    
    console.log('Manual column mapping:', manualColumnMapping);

    try {
      // Group data by Business Unit or Customer
      const groupedData = {};
      
      uploadedData.forEach(row => {
        // Apply date filtering to first sheet data
        const cssSentDate = row['CSS_SENT_DATE'] || row['CSS SENT DATE'] || row['CSAT SENT DATE'];
        const cssReceivedDate = row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'] || row['CSAT RECEIVED DATE'];
        
        // Check if dates are valid and on or after CSAT cycle start date
        const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
        const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

        // Only include records where both dates are valid (or no dates are present)
        if (!sentDateValid || !receivedDateValid) {
          console.log(`⏰ Skipping first sheet record - dates don't meet cycle start date requirement`);
          console.log(`  CSS_SENT_DATE: ${cssSentDate} (valid: ${sentDateValid})`);
          console.log(`  CSS_RECEIVED_DATE: ${cssReceivedDate} (valid: ${receivedDateValid})`);
          console.log(`  Cycle Start Date: ${acsatCycleStartDateFormatted}`);
          return; // Skip this record
        }
        
        const key = groupByBU 
          ? normalizeBusinessUnitDisplay(row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown')
          : (row['CUSTOMER_ID'] || row['CUST_ID'] || 'Unknown');
        
        if (!groupedData[key]) {
          groupedData[key] = {
            businessUnit: normalizeBusinessUnitDisplay(row['BUSSINESS UNIT'] || row['Business Unit'] || 'Unknown'),
            customerId: row['CUSTOMER_ID'] || row['CUST_ID'] || 'Unknown',
            customerName: row['CUSTOMER NAME'] || row['CUST_NM'] || 'Unknown',
            data: []
          };
        }
        
        groupedData[key].data.push(row);
      });

      // Add CSS counts from second sheet
      if (secondSheetData && secondSheetData.length > 0) {
        console.log('Adding CSS counts from second sheet...');
        console.log('CSAT Cycle Start Date for filtering:', acsatCycleStartDateFormatted);
        console.log('CSAT Cycle Start Date object:', acsatCycleStartDate);
        
        // Create a map of customer ID to CSS counts
        const cssCounts = {};
        secondSheetData.forEach(row => {
          const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
          if (customerId) {
            if (!cssCounts[customerId]) {
              cssCounts[customerId] = {
                sentCount: 0,
                receivedCount: 0
              };
            }
            
            // Count CSS_SENT_DATE (non-empty values that are >= CSAT cycle start date)
            if (row['CSS_SENT_DATE'] && row['CSS_SENT_DATE'].toString().trim() !== '') {
              if (isDateOnOrAfterCsatStart(row['CSS_SENT_DATE'])) {
                cssCounts[customerId].sentCount++;
                console.log('Including CSS_SENT_DATE:', row['CSS_SENT_DATE'], 'for customer:', customerId);
              } else {
                console.log('Excluding CSS_SENT_DATE:', row['CSS_SENT_DATE'], 'for customer:', customerId, '(before CSAT start date)');
              }
            }
            
            // Count CSS_RECEIVED_DATE (non-empty values that are >= CSAT cycle start date), or STATUS = Completed
            {
              const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
              const isCompletedStatus = statusVal === 'completed';
              const hasValidReceivedDate = row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'].toString().trim() !== '' && isDateOnOrAfterCsatStart(row['CSS_RECEIVED_DATE']);
              if (isCompletedStatus && hasValidReceivedDate) {
                cssCounts[customerId].receivedCount++;
                console.log('Including CSS_RECEIVED_DATE:', row['CSS_RECEIVED_DATE'], 'for customer:', customerId);
              } else {
                console.log('Excluding CSS_RECEIVED_DATE:', row['CSS_RECEIVED_DATE'], 'for customer:', customerId, '(before CSAT start date)');
              }
            }
          }
        });
        
        console.log('CSS counts map:', cssCounts);
        
        // Log summary of filtering
        const totalSentRecords = secondSheetData.filter(row => 
          row['CSS_SENT_DATE'] && row['CSS_SENT_DATE'].toString().trim() !== ''
        ).length;
        const totalReceivedRecords = secondSheetData.filter(row => 
          row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'].toString().trim() !== ''
        ).length;
        
        console.log('Date filtering summary:', {
          totalSentRecords,
          totalReceivedRecords,
          csatCycleStartDate: acsatCycleStartDateFormatted,
          note: groupByBU ? 'BU-wise grouping will be calculated separately' : 'Customer-wise grouping calculated above'
        });
        
        // Add CSS counts to grouped data
        console.log('Adding CSS counts to grouped data...');
        Object.values(groupedData).forEach(group => {
          console.log(`Processing group: ${groupByBU ? 'BU' : 'Customer'} = ${groupByBU ? group.businessUnit : group.customerName}`);
          if (groupByBU) {
            // For BU-wise view, group CSS data by BUSSINESS UNIT and count surveys
            const businessUnit = group.businessUnit;
            let totalSent = 0;
            let totalReceived = 0;
            
            // Filter second sheet data by this business unit
            const buCssData = secondSheetData.filter(row => {
              const rowBusinessUnit = row['BUSSINESS UNIT'] || row['Business Unit'];
              return rowBusinessUnit && businessUnitsMatch(rowBusinessUnit, businessUnit);
            });
            
            console.log(`Processing CSS data for BU: ${businessUnit}, found ${buCssData.length} records`);
            
            // Count CSS surveys for this business unit
            buCssData.forEach(row => {
              // Count CSS_SENT_DATE (non-empty values that are >= CSAT cycle start date)
              if (row['CSS_SENT_DATE'] && row['CSS_SENT_DATE'].toString().trim() !== '') {
                if (isDateOnOrAfterCsatStart(row['CSS_SENT_DATE'])) {
                  totalSent++;
                  console.log('Including CSS_SENT_DATE for BU:', businessUnit, 'Date:', row['CSS_SENT_DATE']);
                } else {
                  console.log('Excluding CSS_SENT_DATE for BU:', businessUnit, 'Date:', row['CSS_SENT_DATE'], '(before CSAT start date)');
                }
              }
              
              // Count CSS_RECEIVED_DATE (non-empty values that are >= CSAT cycle start date), or STATUS = Completed
              {
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const hasValidReceivedDate = row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'].toString().trim() !== '' && isDateOnOrAfterCsatStart(row['CSS_RECEIVED_DATE']);
                if (isCompletedStatus && hasValidReceivedDate) {
                  totalReceived++;
                  console.log('Including CSS_RECEIVED_DATE for BU:', businessUnit, 'Date:', row['CSS_RECEIVED_DATE']);
                } else {
                  console.log('Excluding CSS_RECEIVED_DATE for BU:', businessUnit, 'Date:', row['CSS_RECEIVED_DATE'], '(before CSAT start date)');
                }
              }
            });
            
            group.cssSentCount = totalSent;
            group.cssReceivedCount = totalReceived;
            
            console.log(`BU ${businessUnit} CSS counts:`, { sent: totalSent, received: totalReceived });
          } else {
            // For account-wise view, get counts for specific customer
            const customerId = group.customerId;
            console.log(`Account-wise: Looking for customer ${customerId} in cssCounts`);
            console.log(`Available customers in cssCounts:`, Object.keys(cssCounts));
            
            if (customerId && cssCounts[customerId]) {
              group.cssSentCount = cssCounts[customerId].sentCount;
              group.cssReceivedCount = cssCounts[customerId].receivedCount;
              console.log(`Found CSS counts for customer ${customerId}: sent=${group.cssSentCount}, received=${group.cssReceivedCount}`);
            } else {
              group.cssSentCount = 0;
              group.cssReceivedCount = 0;
              console.log(`No CSS counts found for customer ${customerId}, setting to 0`);
            }
          }
        });
      } else {
        console.log('No second sheet data available for CSS counts');
        // Set default values
        Object.values(groupedData).forEach(group => {
          group.cssSentCount = 0;
          group.cssReceivedCount = 0;
        });
      }

      // Calculate perspective counts (ratings 4 or 5 for each perspective)
      console.log('=== CALCULATING PERSPECTIVE COUNTS ===');
      console.log('Total groups to process:', Object.keys(groupedData).length);
      console.log('Second sheet data available:', secondSheetData ? secondSheetData.length : 0, 'rows');
      console.log('CSAT Cycle Start Date:', acsatCycleStartDateFormatted);
      
      // Debug: Show sample of grouped data
      if (Object.keys(groupedData).length > 0) {
        const firstGroupKey = Object.keys(groupedData)[0];
        const firstGroup = groupedData[firstGroupKey];
        console.log('\n🔍 SAMPLE GROUP DATA:');
        console.log('Group key:', firstGroupKey);
        console.log('Group data length:', firstGroup.data.length);
        if (firstGroup.data.length > 0) {
          console.log('First row columns:', Object.keys(firstGroup.data[0]));
          console.log('First row sample:', firstGroup.data[0]);
          console.log('Sample RATING values:', firstGroup.data.slice(0, 3).map(row => row['RATING']));
        }
      }
      
      // Quick data validation
      if (Object.keys(groupedData).length === 0) {
        console.log('❌ ERROR: No grouped data found!');
        return { data: [], error: 'No data available' };
      }
      
      if (!secondSheetData || secondSheetData.length === 0) {
        console.log('❌ ERROR: No second sheet data found!');
        return { data: [], error: 'No second sheet data available' };
      }

      const targetPerspectives = [
        'Meeting Delivery Commitments',
        'Customer Engagement and Relationship', 
        'Partner adding value to Customer Business'
      ];
      
      console.log('Target perspectives:', targetPerspectives);

      Object.values(groupedData).forEach((group, groupIndex) => {
        // Initialize perspective counts
        group.perspectiveCounts = {};
        
        console.log(`\n--- Processing Group ${groupIndex + 1} ---`);
        console.log(`${groupByBU ? 'BU' : 'Customer'}: ${groupByBU ? group.businessUnit : group.customerName}`);
        console.log(`Customer ID: ${group.customerId}`);
        console.log(`Data rows: ${group.data.length}`);
        
        // Show sample data for this customer
        if (group.data.length > 0) {
          console.log(`\n📋 Sample data for ${group.customerName}:`);
          const sampleRow = group.data[0];
          console.log(`  RATING: ${sampleRow['RATING']}`);
          console.log(`  PERSPECTIVE: ${sampleRow['PERSPECTIVE']}`);
          console.log(`  CSS_SENT_DATE: ${sampleRow['CSS_SENT_DATE'] || sampleRow['CSS SENT DATE'] || sampleRow['CSAT SENT DATE']}`);
          console.log(`  CSS_RECEIVED_DATE: ${sampleRow['CSS_RECEIVED_DATE'] || sampleRow['CSS RECEIVED DATE'] || sampleRow['CSAT RECEIVED DATE']}`);
          
          // Show all available columns
          const availableColumns = Object.keys(sampleRow);
          console.log(`  Available columns (${availableColumns.length}):`, availableColumns);
        }
        
        // Calculate CSS received count for display
        let cssReceivedCount = 0;
        if (secondSheetData && secondSheetData.length > 0) {
          if (groupByBU) {
            // For BU-wise view, count CSS_RECEIVED_DATE for all customers in this BU
            const businessUnit = group.businessUnit;
            console.log(`🔍 Counting CSS_RECEIVED_DATE for BU: ${businessUnit}`);
            
            secondSheetData.forEach(row => {
              const rowBusinessUnit = row['BUSSINESS UNIT'] || row['Business Unit'];
              if (rowBusinessUnit && businessUnitsMatch(rowBusinessUnit, businessUnit)) {
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const hasValidReceivedDate = row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'].toString().trim() !== '' && isDateOnOrAfterCsatStart(row['CSS_RECEIVED_DATE']);
                if (isCompletedStatus && hasValidReceivedDate) {
                  cssReceivedCount++;
                  console.log(`✅ Including CSS_RECEIVED_DATE for BU ${businessUnit}:`, row['CSS_RECEIVED_DATE']);
                } else {
                  console.log(`❌ Excluding CSS_RECEIVED_DATE for BU ${businessUnit}:`, row['CSS_RECEIVED_DATE'], '(before CSAT start date)');
                }
              }
            });
            
            console.log(`CSS_RECEIVED_DATE count for BU ${businessUnit}: ${cssReceivedCount}`);
          } else {
            // For customer-wise view, count CSS_RECEIVED_DATE for specific customer
            const customerId = group.customerId;
            console.log(`🔍 Counting CSS_RECEIVED_DATE for customer: ${customerId}`);
            
            secondSheetData.forEach(row => {
              const rowCustomerId = row['CUSTOMER_ID'] || row['CUST_ID'];
              if (rowCustomerId && rowCustomerId.toString().trim() === customerId.toString().trim()) {
                const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
                const isCompletedStatus = statusVal === 'completed';
                const hasValidReceivedDate = row['CSS_RECEIVED_DATE'] && row['CSS_RECEIVED_DATE'].toString().trim() !== '' && isDateOnOrAfterCsatStart(row['CSS_RECEIVED_DATE']);
                if (isCompletedStatus && hasValidReceivedDate) {
                  cssReceivedCount++;
                  console.log(`✅ Including CSS_RECEIVED_DATE for customer ${customerId}:`, row['CSS_RECEIVED_DATE']);
                } else {
                  console.log(`❌ Excluding CSS_RECEIVED_DATE for customer ${customerId}:`, row['CSS_RECEIVED_DATE'], '(before CSAT start date)');
                }
              }
            });
            
            console.log(`CSS_RECEIVED_DATE count for customer ${customerId}: ${cssReceivedCount}`);
          }
        }
        
        // Calculate perspective counts (ratings 4 or 5 for each perspective)
        console.log(`\n🔍 CALCULATING PERSPECTIVE COUNTS FOR GROUP ${groupIndex + 1}`);
        if (groupByBU) {
          console.log(`BU: ${group.businessUnit}`);
          console.log(`Data rows: ${group.data.length}`);
        } else {
          console.log(`Customer: ${group.customerName} (ID: ${group.customerId})`);
          console.log(`Data rows: ${group.data.length}`);
        }
        
        // Show all available columns for debugging
        const availableColumns = Object.keys(group.data[0] || {});
        console.log(`\n📋 Available columns (${availableColumns.length}):`);
        availableColumns.forEach((col, index) => {
          console.log(`  ${index + 1}. "${col}"`);
        });
        
        // Show sample data to understand the structure
        if (group.data.length > 0) {
          console.log(`\n📊 Sample data row:`);
          const sampleRow = group.data[0];
          availableColumns.forEach(col => {
            console.log(`  "${col}": "${sampleRow[col]}"`);
          });
          
          // Show all PERSPECTIVE values in this BU for debugging
          if (groupByBU) {
            console.log(`\n🔍 BU DEBUG - All PERSPECTIVE values in BU ${group.businessUnit}:`);
            const allPerspectives = group.data.map(row => row['PERSPECTIVE'] || row['Perspective']).filter(p => p);
            const uniquePerspectives = [...new Set(allPerspectives)];
            console.log(`  Total rows with PERSPECTIVE: ${allPerspectives.length}`);
            console.log(`  Unique PERSPECTIVE values: ${uniquePerspectives.join(', ')}`);
            
            // Show sample of each perspective
            uniquePerspectives.forEach(perspective => {
              const sampleRows = group.data.filter(row => (row['PERSPECTIVE'] || row['Perspective']) === perspective).slice(0, 2);
              console.log(`  Sample rows for "${perspective}":`);
              sampleRows.forEach((row, idx) => {
                console.log(`    Row ${idx}: RATING="${row['RATING']}", PERSPECTIVE="${row['PERSPECTIVE'] || row['Perspective']}"`);
              });
            });
          }
        }
        
        targetPerspectives.forEach(perspective => {
          console.log(`\n--- Processing perspective: "${perspective}" ---`);
          if (groupByBU) {
            console.log(`BU: ${group.businessUnit}`);
            console.log(`🎯 GOAL: COUNT OCCURRENCES of ratings 4 or 5 for this perspective GROUPED BY BU (NOT SUM)`);
            console.log(`📊 BU Data Summary:`);
            console.log(`  Total rows in BU: ${group.data.length}`);
            console.log(`  Unique customers in BU: ${new Set(group.data.map(d => d['CUSTOMER_ID'] || d['CUST_ID'])).size}`);
            console.log(`  Sample customer IDs: ${Array.from(new Set(group.data.map(d => d['CUSTOMER_ID'] || d['CUST_ID']))).slice(0, 5).join(', ')}`);
          } else {
            console.log(`Customer: ${group.customerName} (ID: ${group.customerId})`);
            console.log(`🎯 GOAL: COUNT OCCURRENCES of ratings 4 or 5 for this perspective (NOT SUM)`);
          }
          
          // Special debugging for Northern Trust Company and Customer Engagement
          if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
            console.log(`\n🔍 SPECIAL DEBUG for Northern Trust Company - Customer Engagement and Relationship:`);
            console.log(`Total data rows: ${group.data.length}`);
            group.data.forEach((row, index) => {
              console.log(`Row ${index}:`);
              console.log(`  RATING: "${row['RATING']}"`);
              console.log(`  PERSPECTIVE: "${row['PERSPECTIVE']}"`);
              console.log(`  CSS_SENT_DATE: "${row['CSS_SENT_DATE'] || row['CSS SENT DATE'] || row['CSAT SENT DATE']}"`);
              console.log(`  CSS_RECEIVED_DATE: "${row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'] || row['CSAT RECEIVED DATE']}"`);
            });
          }
          
          // Check if manual mapping is available first
          let perspectiveColumn = manualColumnMapping[perspective];
          
          if (perspectiveColumn) {
            console.log(`✅ Using manual mapping for "${perspective}": "${perspectiveColumn}"`);
          } else {
            console.log(`🔍 Auto-detecting column for "${perspective}"...`);
            console.log(`Available columns:`, availableColumns);
            
            // Try to find column by looking for key words in the perspective name
            const perspectiveWords = perspective.toLowerCase().split(' ').filter(word => word.length > 3);
            console.log(`Looking for columns containing these words:`, perspectiveWords);
            
            // First, try to find exact matches or very close matches
            for (const col of availableColumns) {
              const colLower = col.toLowerCase();
              console.log(`Checking column: "${col}" (lowercase: "${colLower}")`);
              
              // Check if any key word from perspective is in the column name
              for (const word of perspectiveWords) {
                if (colLower.includes(word)) {
                  perspectiveColumn = col;
                  console.log(`✅ Found column "${col}" containing word "${word}" for perspective "${perspective}"`);
                  break;
                }
              }
              if (perspectiveColumn) break;
            }
            
            // If still no match, try more flexible matching
            if (!perspectiveColumn) {
              console.log(`Trying flexible matching...`);
              for (const col of availableColumns) {
                const colLower = col.toLowerCase().replace(/[_\s-]/g, '');
                const perspectiveLower = perspective.toLowerCase().replace(/[_\s-]/g, '');
                
                // Check if column contains any significant part of the perspective
                if (colLower.includes('delivery') && perspectiveLower.includes('delivery')) {
                  perspectiveColumn = col;
                  console.log(`✅ Delivery match: "${col}" for "${perspective}"`);
                  break;
                }
                if (colLower.includes('engagement') && perspectiveLower.includes('engagement')) {
                  perspectiveColumn = col;
                  console.log(`✅ Engagement match: "${col}" for "${perspective}"`);
                  break;
                }
                if (colLower.includes('relationship') && perspectiveLower.includes('relationship')) {
                  perspectiveColumn = col;
                  console.log(`✅ Relationship match: "${col}" for "${perspective}"`);
                  break;
                }
                if (colLower.includes('partner') && perspectiveLower.includes('partner')) {
                  perspectiveColumn = col;
                  console.log(`✅ Partner match: "${col}" for "${perspective}"`);
                  break;
                }
                if (colLower.includes('value') && perspectiveLower.includes('value')) {
                  perspectiveColumn = col;
                  console.log(`✅ Value match: "${col}" for "${perspective}"`);
                  break;
                }
              }
            }
            
            // If still no match, check if we have a PERSPECTIVE column and filter by value
            if (!perspectiveColumn) {
              console.log(`No column match found. Checking if we have a PERSPECTIVE column...`);
              const perspectiveCol = availableColumns.find(col => 
                col.toLowerCase().includes('perspective')
              );
              
              if (perspectiveCol) {
                console.log(`✅ Found PERSPECTIVE column: "${perspectiveCol}"`);
                console.log(`Will filter rows where ${perspectiveCol} = "${perspective}"`);
                perspectiveColumn = perspectiveCol; // Use this for filtering
              } else {
                console.log(`❌ No PERSPECTIVE column found either`);
              }
            }
          }

          if (perspectiveColumn) {
            console.log(`✅ Found perspective column for "${perspective}": "${perspectiveColumn}"`);
            
            // Count ratings 4 or 5 for this perspective from CSAT received Report
            let highRatingCount = 0; // This will count OCCURRENCES of ratings 4 or 5
            let totalProcessedRows = 0;
            let rowsWithRating = 0;
            let rowsWithPerspectiveValue = 0;
            let validRows = 0;
            let rating4Count = 0; // Count of rating 4 occurrences
            let rating5Count = 0; // Count of rating 5 occurrences
            
            console.log(`Processing ${group.data.length} rows for perspective "${perspective}"`);
            console.log(`Looking for column: "${perspectiveColumn}"`);
            
            // Show what we're looking for vs what we have
            if (groupByBU) {
              console.log(`🔍 BU DEBUG - Perspective matching for BU ${group.businessUnit}:`);
              console.log(`  Target perspective: "${perspective}"`);
              console.log(`  Using column: "${perspectiveColumn}"`);
              
              // Show sample of what we're filtering
              const sampleRows = group.data.slice(0, 5);
              console.log(`  Sample rows to process:`);
              sampleRows.forEach((row, idx) => {
                const perspectiveValue = row[perspectiveColumn];
                const rating = row['RATING'];
                console.log(`    Row ${idx}: RATING="${rating}", ${perspectiveColumn}="${perspectiveValue}"`);
              });
            }
            
            // Special debugging for Northern Trust Company
            if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
              console.log(`🔍 NORTHERN TRUST DEBUG - Starting perspective analysis:`);
              console.log(`  Customer: ${group.customerName}`);
              console.log(`  Perspective: ${perspective}`);
              console.log(`  Column being used: ${perspectiveColumn}`);
              console.log(`  Total rows to process: ${group.data.length}`);
              
              // Show all available columns
              const availableCols = Object.keys(group.data[0] || {});
              console.log(`  Available columns:`, availableCols);
              
              // Show sample data
              const sampleData = group.data.slice(0, 10);
              console.log(`  Sample data rows:`);
              sampleData.forEach((row, idx) => {
                const perspectiveValue = row[perspectiveColumn];
                const rating = row['RATING'];
                const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
                console.log(`    Row ${idx}: CUSTOMER_ID="${customerId}", RATING="${rating}", ${perspectiveColumn}="${perspectiveValue}"`);
              });
            }
            
            group.data.forEach((row, index) => {
              totalProcessedRows++;
                const rating = row['RATING'];
                const perspectiveValue = row[perspectiveColumn];
                
                // Apply date filtering - check if dates are on or after CSAT cycle start date
                const cssSentDate = row['CSS_SENT_DATE'] || row['CSS SENT DATE'] || row['CSAT SENT DATE'];
                const cssReceivedDate = row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'] || row['CSAT RECEIVED DATE'];
                
                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate);
                const receivedDateValid = !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate);

                // Special debugging for BU-wise data
                if (groupByBU && index < 3) { // Show first 3 rows for debugging
                  console.log(`🔍 BU DEBUG - Row ${index} for BU ${group.businessUnit}:`);
                  console.log(`  RATING: "${rating}"`);
                  console.log(`  ${perspectiveColumn}: "${perspectiveValue}"`);
                  console.log(`  CSS_SENT_DATE: "${cssSentDate}" (valid: ${sentDateValid})`);
                  console.log(`  CSS_RECEIVED_DATE: "${cssReceivedDate}" (valid: ${receivedDateValid})`);
                  console.log(`  Target perspective: "${perspective}"`);
                }
                
                // Special debugging for Northern Trust Company and Customer Engagement
                if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
                  console.log(`\n🔍 SPECIAL DEBUG - Row ${index} processing:`);
                  console.log(`  RATING: "${rating}"`);
                  console.log(`  ${perspectiveColumn}: "${perspectiveValue}"`);
                  console.log(`  CSS_SENT_DATE: "${cssSentDate}" (valid: ${sentDateValid})`);
                  console.log(`  CSS_RECEIVED_DATE: "${cssReceivedDate}" (valid: ${receivedDateValid})`);
                  console.log(`  Will ${(!sentDateValid || !receivedDateValid) ? 'SKIP' : 'PROCESS'} this row`);
                }
                
                console.log(`Row ${index}: RATING="${rating}", ${perspectiveColumn}="${perspectiveValue}"`);
                console.log(`  CSS_SENT_DATE: ${cssSentDate} (valid: ${sentDateValid})`);
                console.log(`  CSS_RECEIVED_DATE: ${cssReceivedDate} (valid: ${receivedDateValid})`);
                console.log(`  Customer: ${group.customerName} (ID: ${group.customerId})`);
                
                // Only process rows where both dates are valid (or no dates are present)
                if (!sentDateValid || !receivedDateValid) {
                  console.log(`  ⏰ Skipping row ${index} - dates don't meet cycle start date requirement`);
                  return; // Skip this row
                }
                
                // If we're using PERSPECTIVE column for filtering, check if this row matches our target perspective
                if (perspectiveColumn.toLowerCase().includes('perspective')) {
                  if (perspectiveValue !== perspective) {
                    if (groupByBU && index < 3) { // Show first 3 rows for debugging
                      console.log(`  ⏰ BU DEBUG - Row ${index} skipped - perspective "${perspectiveValue}" does not match target "${perspective}"`);
                    }
                    console.log(`  ⏰ Skipping row ${index} - perspective "${perspectiveValue}" does not match target "${perspective}"`);
                    return; // Skip this row
                  }
                  if (groupByBU && index < 3) { // Show first 3 rows for debugging
                    console.log(`  ✅ BU DEBUG - Row ${index} matches target perspective "${perspective}"`);
                  }
                  console.log(`  ✅ Row ${index} matches target perspective "${perspective}"`);
                }
                
                // Check if we have both rating and perspective value
              if (rating !== null && rating !== undefined && rating !== '') {
                rowsWithRating++;
                const ratingNum = parseFloat(rating);
                console.log(`  Rating parsed: ${ratingNum} (isNaN: ${isNaN(ratingNum)})`);
                
                // Special debugging for Northern Trust Company and Customer Engagement
                if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
                  console.log(`🔍 SPECIAL DEBUG - Rating processing for row ${index}:`);
                  console.log(`  RATING: "${rating}" -> parsed: ${ratingNum}`);
                  console.log(`  ${perspectiveColumn}: "${perspectiveValue}"`);
                  console.log(`  Will ${(!isNaN(ratingNum) && ratingNum > 0) ? 'PROCESS' : 'SKIP'} rating`);
                }
                
                if (!isNaN(ratingNum) && ratingNum > 0) {
                  // For PERSPECTIVE column filtering, we already validated the perspective matches
                  // For other columns, check if perspective value exists
                  let isValidPerspective = false;
                  
                  if (perspectiveColumn.toLowerCase().includes('perspective')) {
                    // We already filtered by perspective value above, so this row is valid
                    isValidPerspective = true;
                    console.log(`  ✅ Using PERSPECTIVE column filtering - row already validated for "${perspective}"`);
                  } else {
                    // Check if perspective value exists (not null, undefined, or empty string)
                    if (perspectiveValue !== null && perspectiveValue !== undefined && perspectiveValue !== '') {
                      isValidPerspective = true;
                      console.log(`  ✅ Valid perspective value: "${perspectiveValue}"`);
                    } else {
                      console.log(`  ❌ No perspective value for row ${index} (value: "${perspectiveValue}")`);
                    }
                  }
                  
                  if (isValidPerspective) {
                    rowsWithPerspectiveValue++;
                    validRows++;
                    console.log(`  ✅ Valid row: rating=${ratingNum}, perspectiveValue="${perspectiveValue}"`);
                    
                    // Special debugging for Northern Trust Company and Customer Engagement
                    if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
                      console.log(`🔍 SPECIAL DEBUG - Final counting for row ${index}:`);
                      console.log(`  RATING: ${ratingNum}`);
                      console.log(`  PERSPECTIVE VALUE: "${perspectiveValue}"`);
                      console.log(`  IS VALID PERSPECTIVE: ${isValidPerspective}`);
                      console.log(`  Will ${(ratingNum === 4 || ratingNum === 5) ? 'COUNT' : 'NOT COUNT'} this rating`);
                    }
                    
                    // Count ratings 4 or 5 specifically - COUNT OCCURRENCES, NOT SUM
                    if (ratingNum === 4) {
                      rating4Count++;
                      highRatingCount++;
                      if (groupByBU) {
                        console.log(`  🎯 BU RATING 4 FOUND: Count occurrence #${rating4Count} for perspective "${perspective}" (BU: ${group.businessUnit})`);
                      } else {
                        console.log(`  🎯 RATING 4 FOUND: Count occurrence #${rating4Count} for perspective "${perspective}" (Customer: ${group.customerName})`);
                      }
                    } else if (ratingNum === 5) {
                      rating5Count++;
                      highRatingCount++;
                      if (groupByBU) {
                        console.log(`  🎯 BU RATING 5 FOUND: Count occurrence #${rating5Count} for perspective "${perspective}" (BU: ${group.businessUnit})`);
                      } else {
                        console.log(`  🎯 RATING 5 FOUND: Count occurrence #${rating5Count} for perspective "${perspective}" (Customer: ${group.customerName})`);
                      }
                    } else {
                      if (groupByBU) {
                        console.log(`  ⚠️ BU Rating ${ratingNum} is not 4 or 5 for perspective "${perspective}" (BU: ${group.businessUnit})`);
                      } else {
                        console.log(`  ⚠️ Rating ${ratingNum} is not 4 or 5 for perspective "${perspective}" (Customer: ${group.customerName})`);
                      }
                    }
                  }
                } else {
                  console.log(`  ❌ Invalid rating: "${rating}" (not a valid number)`);
                }
              } else {
                console.log(`  ❌ No rating for row ${index} (value: "${rating}")`);
              }
            });
            
            if (groupByBU) {
              console.log(`\n📊 SUMMARY for "${perspective}" (BU: ${group.businessUnit}):`);
              console.log(`  Total rows processed: ${totalProcessedRows}`);
              console.log(`  Rows with rating: ${rowsWithRating}`);
              console.log(`  Rows with perspective value: ${rowsWithPerspectiveValue}`);
              console.log(`  Valid rows (both rating and perspective): ${validRows}`);
              console.log(`  Rating 4 occurrences: ${rating4Count}`);
              console.log(`  Rating 5 occurrences: ${rating5Count}`);
              console.log(`  Total high ratings (4 or 5) OCCURRENCES: ${highRatingCount}`);
              console.log(`  CSS received count (denominator): ${cssReceivedCount}`);
            } else {
              console.log(`\n📊 SUMMARY for "${perspective}" (Customer: ${group.customerName}):`);
              console.log(`  Total rows processed: ${totalProcessedRows}`);
              console.log(`  Rows with rating: ${rowsWithRating}`);
              console.log(`  Rows with perspective value: ${rowsWithPerspectiveValue}`);
              console.log(`  Valid rows (both rating and perspective): ${validRows}`);
              console.log(`  Rating 4 occurrences: ${rating4Count}`);
              console.log(`  Rating 5 occurrences: ${rating5Count}`);
              console.log(`  Total high ratings (4 or 5) OCCURRENCES: ${highRatingCount}`);
              console.log(`  CSS received count (denominator): ${cssReceivedCount}`);
            }
              
              // Calculate percentage: (COUNT of ratings 4 or 5 OCCURRENCES / CSS_RECEIVED_DATE count) * 100
              let percentage = 0;
              if (cssReceivedCount > 0) {
                percentage = Math.round((highRatingCount / cssReceivedCount) * 100);
                console.log(`  Percentage calculation: (${highRatingCount} OCCURRENCES / ${cssReceivedCount}) * 100 = ${percentage}%`);
                console.log(`  Note: ${highRatingCount} = ${rating4Count} occurrences of rating 4 + ${rating5Count} occurrences of rating 5`);
              } else {
                console.log(`  ⚠️ Cannot calculate percentage - CSS received count is 0`);
              }
              
              group.perspectiveCounts[perspective] = highRatingCount;
              
              // Special debugging for Northern Trust Company
              if (group.customerName === 'Northern Trust Company' && perspective === 'Customer Engagement and Relationship') {
                console.log(`🔍 NORTHERN TRUST FINAL RESULT:`);
                console.log(`  Customer: ${group.customerName}`);
                console.log(`  Perspective: ${perspective}`);
                console.log(`  Column used: ${perspectiveColumn}`);
                console.log(`  Total rows processed: ${totalProcessedRows}`);
                console.log(`  Rows with rating: ${rowsWithRating}`);
                console.log(`  Rows with perspective value: ${rowsWithPerspectiveValue}`);
                console.log(`  Valid rows: ${validRows}`);
                console.log(`  Rating 4 occurrences: ${rating4Count}`);
                console.log(`  Rating 5 occurrences: ${rating5Count}`);
                console.log(`  FINAL COUNT: ${highRatingCount}`);
                console.log(`  This should be the value displayed in the dashboard`);
              }
              
              if (groupByBU) {
                console.log(`✅ BU Final result for "${perspective}" in BU ${group.businessUnit}: ${highRatingCount} occurrences (${percentage}%)`);
                console.log(`   Breakdown: ${rating4Count} rating 4s + ${rating5Count} rating 5s = ${highRatingCount} total`);
              } else {
                console.log(`✅ Final result for "${perspective}": ${highRatingCount} occurrences (${percentage}%)`);
              }
          } else {
            console.log(`❌ No column found for perspective: "${perspective}"`);
            console.log(`Available columns:`, availableColumns);
            
            // Show potential matches
            const potentialMatches = availableColumns.filter(col => {
              const colLower = col.toLowerCase();
              return colLower.includes('delivery') ||
                     colLower.includes('engagement') ||
                     colLower.includes('relationship') ||
                     colLower.includes('partner') ||
                     colLower.includes('value') ||
                     colLower.includes('commitment') ||
                     colLower.includes('business');
            });
            
            if (potentialMatches.length > 0) {
              console.log(`🔍 Potential matches found:`, potentialMatches);
              console.log(`Please check if any of these columns correspond to "${perspective}"`);
            } else {
              console.log(`❌ No potential matches found for "${perspective}"`);
              console.log(`This perspective will show 0 count.`);
            }
            
            // Set count to 0 for this perspective
            group.perspectiveCounts[perspective] = 0;
          }
        });
        
        // Store CSS received count for display (keeping old structure for compatibility)
        group.perspectivePercentages = {
          'Meeting Delivery Commitments': {
            receivedCount: cssReceivedCount
          }
        };
      });

      // Convert to array and sort
      let result = Object.values(groupedData).sort((a, b) => {
        if (groupByBU) {
          return a.businessUnit.localeCompare(b.businessUnit);
        } else {
          return a.customerName.localeCompare(b.customerName);
        }
      });

      // Apply search filter for account-wise view
      if (!groupByBU && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        result = result.filter(group => 
          group.customerName.toLowerCase().includes(searchLower) ||
          group.customerId.toLowerCase().includes(searchLower)
        );
        console.log(`Search filter applied: "${searchTerm}" - ${result.length} results`);
      }

      console.log('Processed data result:', result.length, 'groups');
      console.log('Sample group with CSS counts:', result[0]);
      return { data: result, error: null };

    } catch (error) {
      console.error('Error processing data:', error);
      return { data: [], error: error.message };
    }
  }, [uploadedData, secondSheetData, groupByBU, searchTerm, acsatCycleStartDate, acsatCycleStartDateFormatted]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    if (!processedData?.data || processedData.data.length === 0) return null;

    const totals = {
      totalSent: 0,
      totalReceived: 0,
      perspectiveCounts: {
        'Meeting Delivery Commitments': 0,
        'Customer Engagement and Relationship': 0,
        'Partner adding value to Customer Business': 0
      }
    };

    processedData.data.forEach(group => {
      totals.totalSent += group.cssSentCount || 0;
      totals.totalReceived += group.cssReceivedCount || 0;
      totals.perspectiveCounts['Meeting Delivery Commitments'] += group.perspectiveCounts?.['Meeting Delivery Commitments'] || 0;
      totals.perspectiveCounts['Customer Engagement and Relationship'] += group.perspectiveCounts?.['Customer Engagement and Relationship'] || 0;
      totals.perspectiveCounts['Partner adding value to Customer Business'] += group.perspectiveCounts?.['Partner adding value to Customer Business'] || 0;
    });

    return totals;
  }, [processedData]);

  // Download Excel function
  const downloadExcel = async () => {
    if (!processedData?.data || processedData.data.length === 0) {
      alert('No data available to download');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('ACSAT Satisfied Customers Analysis');

      // Headers
      const targetPerspectives = [
        'Meeting Delivery Commitments',
        'Customer Engagement and Relationship', 
        'Partner adding value to Customer Business'
      ];
      
        const headers = groupByBU
          ? ['Sr. No.', 'Business Unit', 'Customer Count', 'Number of CSAT Surveys Sent', 'Number of CSAT Surveys Received', 'Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business']
          : ['Sr. No.', 'Business Unit', 'Customer ID', 'Customer Name', 'Number of CSAT Surveys Sent', 'Number of CSAT Surveys Received', 'Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business'];

      worksheet.addRow(headers);

      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell, colNumber) => {
        // Determine if this column is numeric (same logic as data rows)
        // BU-wise: Columns 3+ are numeric (Customer Count, Polled, Responded, Perspectives)
        // Account-wise: Columns 5+ are numeric (Polled, Responded, Perspectives)
        let isNumericColumn = false;
        if (groupByBU) {
          isNumericColumn = colNumber >= 3;
        } else {
          isNumericColumn = colNumber >= 5;
        }
        
        // Apply formatting
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF3B82F6' }
        };
        
        // Set alignment - this must be done after all formatting
        // Explicitly set alignment to ensure Excel respects it
        cell.alignment = { 
          horizontal: isNumericColumn ? 'center' : 'left', 
          vertical: 'middle',
          indent: 0,
          readingOrder: 'left-to-right'
        };
      });
      
      // Set header row height to ensure proper vertical alignment
      headerRow.height = 30;

      // Add data rows
      processedData.data.forEach((group, index) => {
        const perspectiveValues = targetPerspectives.map(perspective => 
          group.perspectiveCounts?.[perspective] || 0
        );
        
        const rowData = groupByBU
          ? [
              index + 1,
              normalizeBusinessUnitDisplay(group.businessUnit),
              new Set(group.data.map(d => d['CUSTOMER_ID'] || d['CUST_ID'])).size,
              group.cssSentCount || 0,
              group.cssReceivedCount || 0,
              ...perspectiveValues
            ]
          : [
              index + 1,
              normalizeBusinessUnitDisplay(group.businessUnit),
              group.customerId,
              group.customerName,
              group.cssSentCount || 0,
              group.cssReceivedCount || 0,
              ...perspectiveValues
            ];
        
        const row = worksheet.addRow(rowData);
        
        // Apply alignment and formatting to all cells in the data row
        row.eachCell((cell, colNumber) => {
          // Determine if this column is numeric
          // BU-wise: Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Customer Count (numeric),
          //          Column 4: Polled (numeric), Column 5: Responded (numeric), Column 6-8: Perspectives (numeric)
          // Account-wise: Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Customer ID (text),
          //               Column 4: Customer Name (text), Column 5: Polled (numeric), Column 6: Responded (numeric),
          //               Column 7-9: Perspectives (numeric)
          let isNumericColumn = false;
          if (groupByBU) {
            // BU-wise: Columns 3+ are numeric (Customer Count, Polled, Responded, Perspectives)
            isNumericColumn = colNumber >= 3;
          } else {
            // Account-wise: Columns 5+ are numeric (Polled, Responded, Perspectives)
            isNumericColumn = colNumber >= 5;
          }
          
          // Set cell format for numeric columns first
          if (isNumericColumn) {
            cell.numFmt = '0'; // Format as number
          }
          
          // Set border
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          // Set alignment - this must be done after all formatting (format, border)
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = {
            horizontal: isNumericColumn ? 'center' : 'left', // Text: left, Numeric: center
            vertical: 'middle', // All cells: middle vertical alignment
            wrapText: !isNumericColumn, // Enable word wrapping only for text cells
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });
        
        // Set row height to ensure proper vertical alignment
        row.height = 30;
        
        // No color coding needed for count columns
      });

      // Add Grand Total Row
      if (grandTotals) {
        const grandTotalRowData = groupByBU
          ? [
              '',
              'Org Level',
              '',
              grandTotals.totalSent,
              grandTotals.totalReceived,
              grandTotals.perspectiveCounts['Meeting Delivery Commitments'],
              grandTotals.perspectiveCounts['Customer Engagement and Relationship'],
              grandTotals.perspectiveCounts['Partner adding value to Customer Business']
            ]
          : [
              '',
              'Grand Total',
              '',
              '',
              grandTotals.totalSent,
              grandTotals.totalReceived,
              grandTotals.perspectiveCounts['Meeting Delivery Commitments'],
              grandTotals.perspectiveCounts['Customer Engagement and Relationship'],
              grandTotals.perspectiveCounts['Partner adding value to Customer Business']
            ];
        
        const grandTotalRow = worksheet.addRow(grandTotalRowData);
        
        // Style grand total row
        grandTotalRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric first
          // BU-wise: Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Customer Count (numeric),
          //          Column 4: Polled (numeric), Column 5: Responded (numeric), Column 6-8: Perspectives (numeric)
          // Account-wise: Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Customer ID (text),
          //               Column 4: Customer Name (text), Column 5: Polled (numeric), Column 6: Responded (numeric),
          //               Column 7-9: Perspectives (numeric)
          let isNumericColumn = false;
          if (groupByBU) {
            // BU-wise: Columns 3+ are numeric (Customer Count, Polled, Responded, Perspectives)
            isNumericColumn = colNumber >= 3;
          } else {
            // Account-wise: Columns 5+ are numeric (Polled, Responded, Perspectives)
            isNumericColumn = colNumber >= 5;
          }
          
          // Set cell format for numeric columns first
          if (isNumericColumn) {
            cell.numFmt = '0'; // Format as number
          }
          
          // Apply formatting
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          // Set alignment - this must be done after all other formatting (format, font, fill, border)
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = {
            horizontal: isNumericColumn ? 'center' : 'left', // Text: left, Numeric: center
            vertical: 'middle', // All cells: middle vertical alignment
            wrapText: !isNumericColumn, // Enable word wrapping only for text cells
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });
        
        // Set row height to ensure proper vertical alignment
        grandTotalRow.height = 30;
      }

      // No legend needed for count columns

      // Auto-fit columns
      worksheet.columns.forEach((column) => {
        column.width = 15;
      });

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ACSAT_Satisfied_Customers_Analysis_${groupByBU ? 'BU_Wise' : 'Account_Wise'}_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  if (!excelData) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT - Org level/BU wise percentage of Satisfied Customers (Each Perspective)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <LoadingMessage>
          No Excel data provided. Please upload an Excel file first.
        </LoadingMessage>
      </DashboardContainer>
    );
  }

  if (processedData?.error) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT - Org level/BU wise percentage of Satisfied Customers (Each Perspective)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <ErrorMessage>
          Error processing data: {processedData.error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!processedData?.data || processedData.data.length === 0) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT - Org level/BU wise percentage of Satisfied Customers (Each Perspective)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <ErrorMessage>
          No data available. Please check your Excel file format.
        </ErrorMessage>
        <DebugInfo>
          <div><strong>Debug Information:</strong></div>
          <div>Uploaded Data: {uploadedData ? `${uploadedData.length} rows` : 'null'}</div>
          <div>Excel Data: {excelData ? 'Available' : 'null'}</div>
          <div>Sheet Names: {excelData?.SheetNames?.join(', ') || 'None'}</div>
          {uploadedData && uploadedData.length > 0 && (
            <div>
              <div><strong>Raw Data Preview (first 5 rows):</strong></div>
              <pre>{JSON.stringify(uploadedData.slice(0, 5), null, 2)}</pre>
              <div><strong>All Column Names:</strong></div>
              <div>{Object.keys(uploadedData[0] || {}).join(', ')}</div>
            </div>
          )}
        </DebugInfo>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title>📊 ACSAT - Org level/BU wise percentage of Satisfied Customers (Each Perspective)</Title>
          {acsatCycleStartDateFormatted && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.875rem', 
              color: '#6b7280',
              fontWeight: '500'
            }}>
              📅 CSAT Cycle Start Date: {acsatCycleStartDateFormatted}
            </div>
          )}
        </div>
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
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </div>
      </Header>

      {uploadedData && uploadedData.length > 0 && (
        <SuccessMessage>
          ✅ Data loaded successfully! Found {uploadedData.length} records from Excel file.
        </SuccessMessage>
      )}

      {/* Search functionality for account-wise view */}
      {!groupByBU && (
        <SearchContainer>
          <SearchLabel htmlFor="customer-search">
            🔍 Search Customer:
          </SearchLabel>
          <SearchInput
            id="customer-search"
            type="text"
            placeholder="Enter customer name or ID to search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              Clear
            </ClearButton>
          )}
          {searchTerm && (
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#6b7280',
              whiteSpace: 'nowrap',
              fontWeight: '500'
            }}>
              {processedData?.data?.length || 0} result(s)
            </div>
          )}
        </SearchContainer>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
              <TableHeaderCell>Business Unit</TableHeaderCell>
              {!groupByBU && <TableHeaderCell>Customer ID</TableHeaderCell>}
              {!groupByBU && <TableHeaderCell>Customer Name</TableHeaderCell>}
              {groupByBU && <TableHeaderCell>Customer Count</TableHeaderCell>}
              <TableHeaderCell>Number of CSAT Surveys Sent</TableHeaderCell>
              <TableHeaderCell>Number of CSAT Surveys Received</TableHeaderCell>
              <TableHeaderCell>Meeting Delivery Commitments</TableHeaderCell>
              <TableHeaderCell>Customer Engagement and Relationship</TableHeaderCell>
              <TableHeaderCell>Partner adding value to Customer Business</TableHeaderCell>
            </tr>
          </TableHeader>
          <TableBody>
            {processedData.data.map((group, index) => (
              <TableRow key={index}>
                <TableCell isFirstColumn>{index + 1}</TableCell>
                <TableCell>{normalizeBusinessUnitDisplay(group.businessUnit)}</TableCell>
                {!groupByBU && <TableCell>{group.customerId}</TableCell>}
                {!groupByBU && <TableCell>{group.customerName}</TableCell>}
                {groupByBU && (
                  <TableCell isNumeric>
                    {new Set(group.data.map(d => d['CUSTOMER_ID'] || d['CUST_ID'])).size}
                  </TableCell>
                )}
                <TableCell isNumeric>{group.cssSentCount || 0}</TableCell>
                <TableCell isNumeric>{group.cssReceivedCount || 0}</TableCell>
                <TableCell isNumeric>{group.perspectiveCounts?.['Meeting Delivery Commitments'] || 0}</TableCell>
                <TableCell isNumeric>{group.perspectiveCounts?.['Customer Engagement and Relationship'] || 0}</TableCell>
                <TableCell isNumeric>{group.perspectiveCounts?.['Partner adding value to Customer Business'] || 0}</TableCell>
              </TableRow>
            ))}
            {/* Grand Total Row */}
            {grandTotals && (
              <GrandTotalRow>
                <GrandTotalCell isFirstColumn></GrandTotalCell>
                <GrandTotalCell>{groupByBU ? 'Org Level' : 'Grand Total'}</GrandTotalCell>
                {!groupByBU && <GrandTotalCell></GrandTotalCell>}
                {!groupByBU && <GrandTotalCell></GrandTotalCell>}
                {groupByBU && <GrandTotalCell isNumeric></GrandTotalCell>}
                <GrandTotalCell isNumeric>{grandTotals.totalSent}</GrandTotalCell>
                <GrandTotalCell isNumeric>{grandTotals.totalReceived}</GrandTotalCell>
                <GrandTotalCell isNumeric>{grandTotals.perspectiveCounts['Meeting Delivery Commitments']}</GrandTotalCell>
                <GrandTotalCell isNumeric>{grandTotals.perspectiveCounts['Customer Engagement and Relationship']}</GrandTotalCell>
                <GrandTotalCell isNumeric>{grandTotals.perspectiveCounts['Partner adding value to Customer Business']}</GrandTotalCell>
              </GrandTotalRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Legend removed since we're showing counts, not percentages */}
    </DashboardContainer>
  );
};

export default ACSATSatisfiedCustomersEachPerspectiveDashboard;
