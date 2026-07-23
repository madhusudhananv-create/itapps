import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Star, Download, BarChart3, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';


const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const ToggleButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem 0;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  
  &.active {
    background: #dc2626;
    
    &:hover {
      background: #b91c1c;
    }
  }
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
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
    border-color: #fbbf24;
    background: #fef3c7;
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
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  /* Custom scrollbar styling */
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
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

const TableWrapper = styled.div`
  min-width: 1200px;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
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
  background: #fef3c7;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #fbbf24;
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

const Golden5StarScoreDashboard = ({ onBackToDashboard, excelData }) => {
  console.log('Golden5StarScoreDashboard component rendered with props:', { onBackToDashboard, excelData });
  const [uploadedData, setUploadedData] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [cssSentCounts, setCssSentCounts] = useState(new Map()); // Store CSS_SENT_DATE counts per customer
  const [cssReceivedCounts, setCssReceivedCounts] = useState(new Map()); // Store CSS_RECEIVED_DATE counts per customer
  const [showBUWiseView, setShowBUWiseView] = useState(false);
  const [finalCustomerNameColumn, setFinalCustomerNameColumn] = useState(null);

  // Auto-process data when excelData prop is received
  useEffect(() => {
    console.log('=== useEffect triggered ===');
    console.log('excelData prop:', excelData);
    console.log('excelData type:', typeof excelData);
    console.log('excelData keys:', excelData ? Object.keys(excelData) : 'No keys');
    
    // Handle new data structure where excelData contains loadedData object
    let actualData = null;
    let secondSheetData = null;
    
    if (excelData) {
      if (excelData.data && Array.isArray(excelData.data)) {
        // New structure: excelData.data contains the actual data array
        actualData = excelData.data;
        secondSheetData = excelData.secondSheetData;
        console.log('=== NEW DATA STRUCTURE DETECTED ===');
        console.log('Using excelData.data:', actualData);
        console.log('Using excelData.secondSheetData:', secondSheetData);
      } else if (Array.isArray(excelData)) {
        // Old structure: excelData is directly the data array
        actualData = excelData;
        console.log('=== OLD DATA STRUCTURE DETECTED ===');
        console.log('Using excelData directly:', actualData);
    } else {
        console.log('=== UNKNOWN DATA STRUCTURE ===');
        console.log('excelData is neither an array nor has a data property');
        console.log('excelData:', excelData);
      }
    } else {
      console.log('=== NO EXCEL DATA RECEIVED ===');
      console.log('excelData prop is null/undefined');
    }
    
    if (actualData && actualData.length > 0) {
      console.log('=== AUTO-PROCESSING EXCEL DATA FOR GOLDEN5STARSCORE ===');
      console.log('actualData length:', actualData.length);
      console.log('actualData sample:', actualData[0]);
      console.log('actualData columns:', Object.keys(actualData[0]));
      
      // Set the uploaded data immediately
      setUploadedData(actualData);
      console.log('uploadedData state set to:', actualData);
      
      // Process CSS data if available (this component expects both CSAT and CSS data)
      // The excelData should contain both sheets: CSAT received Report and CSAT sent and received Report
      if (actualData.length > 0) {
        const availableColumns = Object.keys(actualData[0]);
        console.log('Available columns in actualData:', availableColumns);
        
        // Look for CSAT score columns
        const scoreColumns = availableColumns.filter(col => 
          col.toLowerCase().includes('score') || 
          col.toLowerCase().includes('rating') ||
          col.toLowerCase().includes('csat')
        );
        console.log('Score-related columns found:', scoreColumns);
        
        // Look for perspective columns
        const perspectiveColumns = availableColumns.filter(col => 
          col.toLowerCase().includes('perspective') || 
          col.toLowerCase().includes('question') ||
          col.toLowerCase().includes('category')
        );
        console.log('Perspective-related columns found:', perspectiveColumns);
        
        // Look for customer ID columns
        const customerIdColumns = availableColumns.filter(col => 
          col.toLowerCase().includes('cust') || 
          col.toLowerCase().includes('customer') ||
          col.toLowerCase().includes('account')
        );
        console.log('Customer ID columns found:', customerIdColumns);
        
        // CSS data is now pre-calculated in the combined data
        console.log('=== CSS DATA STATUS ===');
        
        // Check if CSS count columns are available
        const cssSentCountColumn = availableColumns.find(col => col === 'CSS_SENT_COUNT');
        const cssReceivedCountColumn = availableColumns.find(col => col === 'CSS_RECEIVED_COUNT');
        
        if (cssSentCountColumn && cssReceivedCountColumn) {
          console.log('✅ CSS count columns found in data');
          console.log('CSS_SENT_COUNT column:', cssSentCountColumn);
          console.log('CSS_RECEIVED_COUNT column:', cssReceivedCountColumn);
      } else {
          console.log('⚠️ CSS count columns not found, will calculate from second sheet');
          console.log('Available columns:', availableColumns);
        }
      }
      } else {
      console.log('❌ No valid data found in excelData prop');
      console.log('excelData:', excelData);
      setUploadedData(null);
    }
  }, [excelData]);



  const toggleBUWiseView = () => {
    setShowBUWiseView(!showBUWiseView);
  };

  // Process data to calculate count of RATING column having 4 or 5 for each perspective
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    // Find column names dynamically
    const availableColumns = Object.keys(uploadedData[0]);
    
    // Debug: Show all available columns
    console.log('=== EXCEL FILE STRUCTURE ANALYSIS ===');
    console.log('Available columns in uploaded data:', availableColumns);
    console.log('Total columns found:', availableColumns.length);
    
    // Debug: Show sample data to understand the structure
    if (uploadedData.length > 0) {
      console.log('Sample row data:', uploadedData[0]);
      console.log('Sample row keys:', Object.keys(uploadedData[0]));
    }
    
    // Use actual column names from the Excel file
    const customerIdColumn = 'CUSTOMER_ID';
    const customerNameColumn = 'CUSTOMER NAME';
    const businessUnitColumn = 'BUSSINESS UNIT';
    const ratingColumn = 'RATING';
    
    console.log('Golden5StarScoreDashboard - Using actual column names:', {
      customerIdColumn,
      customerNameColumn,
      businessUnitColumn,
      ratingColumn,
      availableColumns
    });
    
    // Set the final customer name column in state
    setFinalCustomerNameColumn(customerNameColumn);
    
    // Find perspective columns dynamically
    const perspectiveColumns = availableColumns.filter(col => 
      col.toLowerCase().includes('perspective') || 
      col.toLowerCase().includes('question') ||
      col.toLowerCase().includes('category')
    );
    
    console.log('Detected perspective columns:', perspectiveColumns);
    
    if (!customerIdColumn || !ratingColumn) {
      console.error('Required columns not found:', { customerIdColumn, ratingColumn });
      return [];
    }
    
    // Group by customer ID and business unit
    const customerData = new Map();
    
    uploadedData.forEach(row => {
      const customerId = row[customerIdColumn];
      const customerName = finalCustomerNameColumn ? row[finalCustomerNameColumn] : 'N/A';
      const businessUnit = row[businessUnitColumn] || 'N/A';
      const rating = parseFloat(row[ratingColumn]);
      
      if (!customerId) return;
      
      if (!customerData.has(customerId)) {
        customerData.set(customerId, {
          customerId,
          customerName,
          businessUnit,
          perspectives: {},
          totalRatings: 0
        });
      }
      
      const customer = customerData.get(customerId);
      
      // Process each perspective column
      perspectiveColumns.forEach(perspectiveCol => {
        const perspectiveValue = row[perspectiveCol];
        
        if (perspectiveValue && perspectiveValue !== 'N/A' && perspectiveValue !== '') {
          if (!customer.perspectives[perspectiveValue]) {
            customer.perspectives[perspectiveValue] = {
          count4or5: 0,
          totalRatings: 0
        };
      }
      
      if (!isNaN(rating)) {
            customer.perspectives[perspectiveValue].totalRatings++;
        
        // Count ratings 4 or 5
        if (rating === 4 || rating === 5) {
              customer.perspectives[perspectiveValue].count4or5++;
            }
        }
      }
    });
    
      if (!isNaN(rating)) {
        customer.totalRatings++;
      }
    });
    
    // Convert to array and calculate percentage for each perspective
    const result = Array.from(customerData.values()).map(customer => {
      const row = {
        sNo: 0, // Will be set later
        customerId: customer.customerId,
        customerName: customer.customerName,
        businessUnit: customer.businessUnit,
        // Add CSS counts from the second sheet (CSAT sent and received Report)
        // count(CSS_SENT_DATE) for the CUSTOMER_ID as column "Number of CSAT Surveys Sent"
        cssSentCount: (() => {
          // Use the pre-calculated CSS_SENT_COUNT from the combined data
          const cssSentCount = uploadedData.find(dataRow => {
            const rowCustomerId = dataRow[customerIdColumn];
            return rowCustomerId === customer.customerId;
          })?.['CSS_SENT_COUNT'] || 0;
          
          console.log(`📊 CSS_SENT_COUNT for customer ${customer.customerId}: ${cssSentCount}`);
          return cssSentCount;
        })(),
        
        // count(CSS_RECEIVED_DATE) for the CUSTOMER_ID as column "Number of CSAT Surveys Received"
        cssReceivedCount: (() => {
          // Use the pre-calculated CSS_RECEIVED_COUNT from the combined data
          const cssReceivedCount = uploadedData.find(dataRow => {
            const rowCustomerId = dataRow[customerIdColumn];
            return rowCustomerId === customer.customerId;
          })?.['CSS_RECEIVED_COUNT'] || 0;
          
          console.log(`📊 CSS_RECEIVED_COUNT for customer ${customer.customerId}: ${cssReceivedCount}`);
          return cssReceivedCount;
        })()
      };
      
      // Add perspective columns with percentage calculation using the exact formula:
      // ((count of RATING column having 4 or 5 for each value of perspective column of the sheet name "CSAT received Report") / 
      // count(CSS_RECEIVED_DATE) for CUSTOMER_ID as "Number of CSAT Surveys Received" of the 2nd sheet name "CSAT sent and received Report") * 100
      
      Object.keys(customer.perspectives).forEach(perspective => {
        const perspectiveData = customer.perspectives[perspective];
        
        // Step 1: Get count of ratings 4 or 5 for this perspective from the first sheet (CSAT received Report)
        const ratings4or5Count = perspectiveData.count4or5;
        
        // Step 2: Use the CSS_RECEIVED_DATE count that was already calculated above
        const cssReceivedCount = row.cssReceivedCount;
        
        // Step 3: Calculate percentage using the exact formula
        if (ratings4or5Count > 0 && cssReceivedCount > 0) {
          const percentage = ((ratings4or5Count / cssReceivedCount) * 100).toFixed(2);
          row[perspective] = `${percentage}%`;
          console.log(`✅ Customer ${customer.customerId}, Perspective ${perspective}: ${ratings4or5Count} ratings 4-5 / ${cssReceivedCount} CSS_RECEIVED_DATE entries = ${percentage}%`);
      } else {
          row[perspective] = '0.00%';
          if (ratings4or5Count === 0) {
            console.log(`❌ Customer ${customer.customerId}, Perspective ${perspective}: No ratings 4-5 found`);
          }
          if (cssReceivedCount === 0) {
            console.log(`❌ Customer ${customer.customerId}, Perspective ${perspective}: No CSS_RECEIVED_DATE entries found`);
          }
        }
      });
      
      return row;
    });
    
    // Add S No.
    result.forEach((row, index) => {
      row.sNo = index + 1;
    });
    
    console.log('Processed data for percentage of satisfied customers (scores with >=4) for each perspective:', result);
    return result;
  }, [uploadedData]);

  // Process data grouped by Business Unit for BU-wise view
  const buWiseData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    // Find column names dynamically
    const availableColumns = Object.keys(uploadedData[0]);
    
    // Use actual column names from the Excel file
    const customerIdColumn = 'CUSTOMER_ID';
    const ratingColumn = 'RATING';
    const perspectiveColumn = 'PERSPECTIVE';
    const businessUnitColumn = 'BUSSINESS UNIT';
    
    if (!customerIdColumn || !ratingColumn || !perspectiveColumn) {
      return [];
    }
    
    const finalBusinessUnitColumn = businessUnitColumn;
    
    // Get unique perspective values
    const perspectiveValues = [...new Set(uploadedData.map(row => row[perspectiveColumn]).filter(Boolean))];
    
    // Group by Business Unit
    const buData = new Map();
    
    uploadedData.forEach(row => {
      const customerId = row[customerIdColumn];
      const businessUnit = row[finalBusinessUnitColumn] || 'N/A';
      const rating = parseFloat(row[ratingColumn]);
      const perspective = row[perspectiveColumn];
      
      if (!customerId || !perspective || !businessUnit) return;
      
      if (!buData.has(businessUnit)) {
        buData.set(businessUnit, {
          businessUnit,
          customerCount: new Set(),
          perspectives: {}
        });
      }
      
      const bu = buData.get(businessUnit);
      bu.customerCount.add(customerId);
      
      if (!bu.perspectives[perspective]) {
        bu.perspectives[perspective] = {
          count4or5: 0,
          totalRatings: 0
        };
      }
      
      if (!isNaN(rating)) {
        bu.perspectives[perspective].totalRatings++;
        
        // Count ratings 4 or 5
        if (rating === 4 || rating === 5) {
          bu.perspectives[perspective].count4or5++;
        }
      }
    });
    
    // Convert to array and calculate percentages
    const result = Array.from(buData.values()).map((bu, index) => {
      const row = {
        sNo: index + 1,
        businessUnit: bu.businessUnit,
        customerCount: bu.customerCount.size,
        // Calculate total CSS counts for this business unit from the second sheet
        cssSentCount: (() => {
          let total = 0;
          Array.from(bu.customerCount).forEach(customerId => {
            const customerRow = uploadedData.find(dataRow => dataRow[customerIdColumn] === customerId);
            if (customerRow && customerRow['CSS_SENT_COUNT']) {
              total += customerRow['CSS_SENT_COUNT'];
            }
          });
          return total;
        })(),
        cssReceivedCount: (() => {
          let total = 0;
          Array.from(bu.customerCount).forEach(customerId => {
            const customerRow = uploadedData.find(dataRow => dataRow[customerIdColumn] === customerId);
            if (customerRow && customerRow['CSS_RECEIVED_COUNT']) {
              total += customerRow['CSS_RECEIVED_COUNT'];
            }
          });
          return total;
        })()
      };
      
      // Add perspective columns with percentage calculation
      perspectiveValues.forEach(perspective => {
        const perspectiveData = bu.perspectives[perspective];
        
        // Calculate total CSS_RECEIVED_DATE count for this business unit from the second sheet
        let totalCssReceived = 0;
        Array.from(bu.customerCount).forEach(customerId => {
          const customerRow = uploadedData.find(dataRow => dataRow[customerIdColumn] === customerId);
          if (customerRow && customerRow['CSS_RECEIVED_COUNT']) {
            totalCssReceived += customerRow['CSS_RECEIVED_COUNT'];
          }
        });
        
        if (perspectiveData && perspectiveData.count4or5 !== undefined && totalCssReceived > 0) {
          // Calculate percentage: (count of ratings 4 or 5) / (total CSS_RECEIVED_DATE count for BU) * 100
          const percentage = ((perspectiveData.count4or5 / totalCssReceived) * 100).toFixed(2);
          row[perspective] = `${percentage}%`;
          console.log(`BU ${bu.businessUnit}, Perspective ${perspective}: ${perspectiveData.count4or5} ratings 4-5 / ${totalCssReceived} total CSS received = ${percentage}%`);
        } else {
          row[perspective] = '0.00%';
          console.log(`BU ${bu.businessUnit}, Perspective ${perspective}: No CSS received data or no ratings 4-5`);
        }
      });
      
      return row;
    });
    
    return result;
  }, [uploadedData]);

  // Apply filters to processed data
  const filteredData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    
    let filtered = processedData;
    
    // Apply business unit filter
    if (businessUnitFilter) {
      filtered = filtered.filter(row => 
        row.businessUnit && 
        row.businessUnit.toString().toLowerCase().includes(businessUnitFilter.toLowerCase())
      );
    }
    
    return filtered;
  }, [processedData, businessUnitFilter]);

  // Apply filters to BU-wise data
  const filteredBUWiseData = useMemo(() => {
    if (!buWiseData || buWiseData.length === 0) return [];
    
    let filtered = buWiseData;
    
    // Apply business unit filter
    if (businessUnitFilter) {
      filtered = filtered.filter(row => 
        row.businessUnit && 
        row.businessUnit.toString().toLowerCase().includes(businessUnitFilter.toLowerCase())
      );
    }
    
    return filtered;
  }, [buWiseData, businessUnitFilter]);

  // Get unique business units for filter dropdown
  const uniqueBusinessUnits = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return [...new Set(processedData.map(row => row.businessUnit).filter(Boolean))].sort();
  }, [processedData]);

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle average rating values and N/A
      if (aVal === 'N/A') aVal = 0;
      if (bVal === 'N/A') bVal = 0;
      
      if (typeof aVal === 'string' && aVal !== 'N/A') {
        aVal = parseFloat(aVal);
        bVal = parseFloat(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData(filteredData);
  const sortedBUWiseData = getSortedData(filteredBUWiseData);

  // Download functionality
  const downloadData = () => {
    const dataToDownload = showBUWiseView ? buWiseData : processedData;
    if (!dataToDownload || dataToDownload.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    const sheetName = showBUWiseView ? 'BU Wise % Ratings 4or5' : 'Ratings 4or5 with CSS Counts';
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Set column widths
    const columnWidths = [
      { wch: 10 }, // S No.
      { wch: showBUWiseView ? 25 : 20 }, // Number of Customers or CUSTOMER_ID
      { wch: showBUWiseView ? 0 : 25 }, // CUSTOMER NAME (only for customer view, using fallback column)
      { wch: 20 }, // BUSINESS UNIT
      { wch: 25 }, // Number of CSAT Surveys Sent
      { wch: 28 }, // Number of CSAT Surveys Received
    ];
    
    // Add widths for perspective columns
    if (dataToDownload.length > 0) {
      const perspectiveColumns = Object.keys(dataToDownload[0]).filter(key => 
        !['sNo', 'customerId', 'customerName', 'customerCount', 'businessUnit', 'cssSentCount', 'cssReceivedCount'].includes(key)
      );
      perspectiveColumns.forEach(() => {
        columnWidths.push({ wch: 15 });
      });
    }
    
    worksheet['!cols'] = columnWidths;
    
    const fileName = showBUWiseView ? 'BU_Wise_Ratings_4or5_Analysis.xlsx' : 'Account_Ratings_4or5_Analysis.xlsx';
    XLSX.writeFile(workbook, fileName);
  };

  console.log('=== RENDER DEBUG ===');
  console.log('uploadedData state:', uploadedData);
  console.log('excelData prop:', excelData);
  console.log('uploadedData length:', uploadedData?.length);

  if (!uploadedData) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <BarChart3 size={24} /> Account/BU wise percentage of Satisfied Customers for Each Perspective
          </HeaderTitle>
          {onBackToDashboard && (
            <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
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
            <p>excelData prop: {excelData ? `Received (${excelData.length} rows)` : 'Not received'}</p>
            <p>uploadedData state: {uploadedData ? `Set (${uploadedData.length} rows)` : 'Not set'}</p>
            </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
            <HeaderTitle>
          <BarChart3 size={24} /> Account/BU wise percentage of Satisfied Customers for Each Perspective
            </HeaderTitle>
          {onBackToDashboard && (
          <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
            <ChevronLeft size={16} /> Back
            </BackButton>
          )}
      </DashboardHeader>

        
        {!showBUWiseView && (
      <FilterContainer>
        <div>
          <label htmlFor="bu-filter" style={{ marginRight: '0.5rem', fontWeight: '500' }}>
            Filter by Business Unit:
          </label>
          <FilterSelect
            id="bu-filter"
            value={businessUnitFilter}
            onChange={(e) => setBusinessUnitFilter(e.target.value)}
          >
            <option value="">All Business Units</option>
            {uniqueBusinessUnits.map(bu => (
              <option key={bu} value={bu}>{bu}</option>
            ))}
          </FilterSelect>
        </div>
          </FilterContainer>
        )}
        
      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <DownloadButton onClick={downloadData}>
          <Download size={16} />
          Download Data
        </DownloadButton>
      </div>

      {/* Toggle Button for BU-wise View */}
      <div style={{ textAlign: 'center', margin: '1rem 0' }}>
        <ToggleButton 
          onClick={toggleBUWiseView}
          className={showBUWiseView ? 'active' : ''}
        >
          {showBUWiseView ? 'Show Customer-wise View' : 'Display BU Wise Satisfied Customers for each perspective'}
        </ToggleButton>
        </div>

      <ResultsSummary>
        <strong>Results Summary:</strong> 
                    {showBUWiseView
              ? `Showing ${filteredBUWiseData.length} business units with percentage of satisfied customers (scores with >=4) for each perspective`
              : `Showing ${filteredData.length} customers with percentage of satisfied customers (scores with >=4) for each perspective`
            }
        {businessUnitFilter && ` filtered by "${businessUnitFilter}"`}
      </ResultsSummary>

      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                  S No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                {!showBUWiseView && (
                  <Th onClick={() => handleSort('customerId')} style={{ cursor: 'pointer' }}>
                    CUSTOMER_ID {sortConfig.key === 'customerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                )}
                {!showBUWiseView && finalCustomerNameColumn && (
                  <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                    CUSTOMER NAME {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                )}
                {showBUWiseView && (
                  <Th onClick={() => handleSort('customerCount')} style={{ cursor: 'pointer' }}>
                    Number of Customers {sortConfig.key === 'customerCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                )}
                <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                  BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer' }}>
                  Number of CSAT Surveys Sent {sortConfig.key === 'cssSentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer' }}>
                  Number of CSAT Surveys Received {sortConfig.key === 'cssReceivedCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                {(showBUWiseView ? buWiseData : processedData).length > 0 && Object.keys(showBUWiseView ? buWiseData[0] : processedData[0]).filter(key => 
                  !['sNo', 'customerId', 'customerCount', 'businessUnit', 'cssSentCount', 'cssReceivedCount'].includes(key)
                ).map(perspective => (
                  <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                    {perspective} {sortConfig.key === perspective && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                ))}
            </tr>
            </thead>
            <tbody>
              {(showBUWiseView ? sortedBUWiseData : sortedData).length > 0 ? (
                (showBUWiseView ? sortedBUWiseData : sortedData).map((row, index) => (
                  <tr key={index}>
                    <Td>{row.sNo}</Td>
                    {!showBUWiseView && <Td>{row.customerId}</Td>}
                    {!showBUWiseView && finalCustomerNameColumn && <Td>{row.customerName}</Td>}
                    {showBUWiseView && <Td>{row.customerCount}</Td>}
                    <Td>{row.businessUnit}</Td>
                    <Td>{row.cssSentCount}</Td>
                    <Td>{row.cssReceivedCount}</Td>
                    {Object.keys(row).filter(key => 
                      !['sNo', 'customerId', 'customerCount', 'businessUnit', 'cssSentCount', 'cssReceivedCount'].includes(key)
                    ).map(perspective => (
                      <Td key={perspective}>{row[perspective]}</Td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={Object.keys(showBUWiseView ? (buWiseData[0] || {}) : (processedData[0] || {})).length + (showBUWiseView ? 1 : 2)} style={{ textAlign: 'center', padding: '2rem' }}>
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

export default Golden5StarScoreDashboard; 