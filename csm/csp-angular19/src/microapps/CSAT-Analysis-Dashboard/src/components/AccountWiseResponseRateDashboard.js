import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { BarChart3, ChevronLeft, Upload, FileSpreadsheet, X, CheckCircle, Download, BarChart } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { normalizeBusinessUnitDisplay } from '../utils/normalizeBusinessUnitDisplay';

const DashboardContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const DashboardHeader = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const UploadContainer = styled.div`
  padding: 2rem;
  text-align: center;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  margin: 1rem 0;
  
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const LoadDataButton = styled.button`
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const DownloadButton = styled.button`
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem 0;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #7c3aed;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  margin: 1rem 0;
  justify-content: center;
`;

const FileDetails = styled.div`
  text-align: left;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #0c4a6e;
  margin-bottom: 0.25rem;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: #0369a1;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin: 1rem 0;
  color: #166534;
  font-weight: 500;
  justify-content: center;
`;

const TableContainer = styled.div`
  width: 100%;
  max-height: 70vh;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  position: relative;
`;

const TableWrapper = styled.div`
  width: 100%;
  max-height: 70vh;
  overflow: auto;
  
  /* Force scrollbars to always be visible */
  scrollbar-width: thin;
  -ms-overflow-style: scrollbar;
  
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
    background: #94a3b8;
    border-radius: 6px;
    
    &:hover {
      background: #64748b;
    }
  }
  
  &::-webkit-scrollbar-corner {
    background: #f1f5f9;
  }
`;

const Table = styled.table`
  width: max-content;
  min-width: 1750px;
  border-collapse: collapse;
  white-space: nowrap;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  border-right: 1px solid #e2e8f0;
  white-space: nowrap;
  min-width: 250px;
  width: 250px;

  &:last-child {
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: #374151;
  border-right: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
  min-width: 250px;
  width: 250px;

  &:last-child {
    border-right: none;
  }
`;

const FilterContainer = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 200px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const ClearFilterButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4b5563;
  }
`;

const ResultsSummary = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  color: #0c4a6e;
  font-weight: 500;
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

const BarChartContainer = styled.div`
  width: 100%;
  min-height: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  position: relative;
  overflow: auto;
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

const AccountWiseResponseRateDashboard = ({ onBack, excelData }) => {
  console.log('AccountWiseResponseRateDashboard component rendered with props:', { onBack, excelData });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(excelData || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [cssSentColumn, setCssSentColumn] = useState(null);
  const [cssReceivedColumn, setCssReceivedColumn] = useState(null);
  const [showDonutChart, setShowDonutChart] = useState(false);
  const [showBUWiseView, setShowBUWiseView] = useState(false);

  // Auto-process data when excelData prop is received
  useEffect(() => {
    if (excelData) {
      console.log('=== AUTO-PROCESSING EXCEL DATA ===');
      console.log('excelData structure:', excelData);
      console.log('excelData keys:', Object.keys(excelData));
      
      // Ensure we always set uploadedData to an array
      if (!excelData || (excelData.data && !Array.isArray(excelData.data)) && !Array.isArray(excelData)) {
        console.error('Invalid excelData structure - setting empty array');
        setUploadedData([]);
        return;
      }
      
      // Check if excelData has the expected structure with .data property
      let dataToProcess;
      if (excelData.data && Array.isArray(excelData.data)) {
        // excelData is the full result object with .data property
        dataToProcess = excelData.data;
        console.log('Excel data received (from excelData.data):', dataToProcess.length, 'rows');
      } else if (Array.isArray(excelData)) {
        // excelData is directly the data array
        dataToProcess = excelData;
        console.log('Excel data received (direct array):', dataToProcess.length, 'rows');
      } else {
        console.error('excelData is neither an object with .data property nor an array');
        return;
      }
      
      if (dataToProcess && dataToProcess.length > 0) {
        console.log('excelData length:', dataToProcess.length);
        console.log('excelData sample:', dataToProcess[0]);
        
        setUploadedData(dataToProcess);
        
        // Auto-detect CSS columns from the uploaded data
        const availableColumns = Object.keys(dataToProcess[0]);
        console.log('Available columns in excelData:', availableColumns);
        
        // Look for CSS_SENT_DATE column with more flexible detection
        let detectedCssSentColumn = null;
        
        // First try exact matches
        const cssSentExactMatches = [
          'CSS_SENT_DATE', 'CSS Sent Date', 'css_sent_date', 'CSS_SENT', 'CSS Sent', 'css_sent',
          'SENT_DATE', 'Sent Date', 'sent_date', 'SENT', 'Sent', 'sent'
        ];
        
        for (const variation of cssSentExactMatches) {
          detectedCssSentColumn = availableColumns.find(col => col === variation);
          if (detectedCssSentColumn) {
            console.log(`Found CSS_SENT_DATE with exact match: "${variation}"`);
            break;
          }
        }
        
        // If not found, try case-insensitive search
        if (!detectedCssSentColumn) {
          detectedCssSentColumn = availableColumns.find(col => 
            (col.toLowerCase().includes('css') && col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')) ||
            (col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')) ||
            (col.toLowerCase().includes('css') && col.toLowerCase().includes('sent'))
          );
          if (detectedCssSentColumn) {
            console.log(`Found CSS_SENT_DATE with case-insensitive search: "${detectedCssSentColumn}"`);
          }
        }
        
        // If still not found, try broader search
        if (!detectedCssSentColumn) {
          const broaderSearch = availableColumns.filter(col => 
            col.toLowerCase().includes('sent') || 
            col.toLowerCase().includes('css')
          );
          if (broaderSearch.length > 0) {
            detectedCssSentColumn = broaderSearch[0];
            console.log(`Found CSS_SENT_DATE with broader search: "${detectedCssSentColumn}"`);
          }
        }
        
        // Look for CSS_RECEIVED_DATE column with similar approach
        let detectedCssReceivedColumn = null;
        
        const cssReceivedExactMatches = [
          'CSS_RECEIVED_DATE', 'CSS Received Date', 'css_received_date', 'CSS_RECEIVED', 'CSS Received', 'css_received',
          'RECEIVED_DATE', 'Received Date', 'received_date', 'RECEIVED', 'Received', 'received'
        ];
        
        for (const variation of cssReceivedExactMatches) {
          detectedCssReceivedColumn = availableColumns.find(col => col === variation);
          if (detectedCssReceivedColumn) {
            console.log(`Found CSS_RECEIVED_DATE with exact match: "${variation}"`);
            break;
          }
        }
        
        if (!detectedCssReceivedColumn) {
          detectedCssReceivedColumn = availableColumns.find(col => 
            (col.toLowerCase().includes('css') && col.toLowerCase().includes('received') && col.toLowerCase().includes('date')) ||
            (col.toLowerCase().includes('received') && col.toLowerCase().includes('date')) ||
            (col.toLowerCase().includes('css') && col.toLowerCase().includes('received'))
          );
          if (detectedCssReceivedColumn) {
            console.log(`Found CSS_RECEIVED_DATE with case-insensitive search: "${detectedCssReceivedColumn}"`);
          }
        }
        
        if (!detectedCssReceivedColumn) {
          const broaderSearch = availableColumns.filter(col => 
            col.toLowerCase().includes('received') || 
            col.toLowerCase().includes('css')
          );
          if (broaderSearch.length > 0) {
            detectedCssReceivedColumn = broaderSearch[0];
            console.log(`Found CSS_RECEIVED_DATE with broader search: "${detectedCssReceivedColumn}"`);
          }
        }
        
        // Set the detected columns immediately
        if (detectedCssSentColumn) {
          setCssSentColumn(detectedCssSentColumn);
          console.log('CSS_SENT_DATE column set to:', detectedCssSentColumn);
        } else {
          console.log('⚠️ CSS_SENT_DATE column NOT detected!');
        }
        
        if (detectedCssReceivedColumn) {
          setCssReceivedColumn(detectedCssReceivedColumn);
          console.log('CSS_RECEIVED_DATE column set to:', detectedCssReceivedColumn);
        } else {
          console.log('⚠️ CSS_RECEIVED_DATE column NOT detected!');
        }
        
        // Show sample data for debugging
        if (dataToProcess.length > 0) {
          console.log('Sample data from first row:');
          const sampleRow = dataToProcess[0];
          availableColumns.forEach(col => {
            if (col.toLowerCase().includes('sent') || col.toLowerCase().includes('received') || 
                col.toLowerCase().includes('css') || col.toLowerCase().includes('date')) {
              console.log(`  ${col}: "${sampleRow[col]}"`);
            }
          });
        }
        
        console.log('=== END AUTO-PROCESSING ===');
      }
    } else {
      console.log('No excelData received or excelData is empty');
    }
  }, [excelData]);

  // Color coding functions for Response Rate %
  const getResponseRateCellColor = (responseRate) => {
    const rate = parseFloat(responseRate);
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
    const rate = parseFloat(responseRate);
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

  const handleFileSelect = (file) => {
    console.log('handleFileSelect called with file:', file);
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadedData(null);
      console.log('File selected successfully:', file.name);
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid Excel file (.xlsx)' });
      console.log('Invalid file type:', file?.type);
    }
  };

  const handleFileInput = (e) => {
    console.log('handleFileInput called with event:', e);
    const file = e.target.files[0];
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
    console.log('processFile called with selectedFile:', selectedFile);
    if (!selectedFile) {
      console.log('No file selected, returning early');
      return;
    }

    setIsProcessing(true);
    setUploadStatus(null);
    console.log('Starting file processing...');

    try {
      const result = await readExcelFile(selectedFile);
      if (result && result.data && result.data.length > 0) {
        setUploadedData(result.data);
        
        // Debug: Show available columns and inspect structure
        if (result.data.length > 0) {
          const availableColumns = Object.keys(result.data[0]);
          console.log('=== EXCEL FILE STRUCTURE ANALYSIS ===');
          console.log('Available columns in uploaded data:', availableColumns);
          console.log('Total columns found:', availableColumns.length);
          
          // Look for CSS_SENT_DATE column with multiple variations
          const cssSentVariations = [
            'CSS_SENT_DATE', 'CSS Sent Date', 'css_sent_date', 'CSS_SENT', 'CSS Sent', 'css_sent',
            'SENT_DATE', 'Sent Date', 'sent_date', 'SENT', 'Sent', 'sent',
            'CSS_SENT_DATE', 'CSS Sent Date', 'css_sent_date', 'CSS_SENT', 'CSS Sent', 'css_sent',
            'SENT_DATE', 'Sent Date', 'sent_date', 'SENT', 'Sent', 'sent',
            'CSS_SENT_DATE', 'CSS Sent Date', 'css_sent_date', 'CSS_SENT', 'CSS Sent', 'css_sent',
            'SENT_DATE', 'Sent Date', 'sent_date', 'SENT', 'Sent', 'sent'
          ];
          
          let detectedCssSentColumn = null;
          for (const variation of cssSentVariations) {
            detectedCssSentColumn = availableColumns.find(col => col === variation);
            if (detectedCssSentColumn) {
              console.log(`CSS_SENT_DATE column found with variation: "${variation}"`);
              break;
            }
          }
          
          if (!detectedCssSentColumn) {
            // Try case-insensitive search with more flexible patterns
            detectedCssSentColumn = availableColumns.find(col => 
              (col.toLowerCase().includes('css') && col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')) ||
              (col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')) ||
              (col.toLowerCase().includes('css') && col.toLowerCase().includes('sent'))
            );
            if (detectedCssSentColumn) {
              console.log(`CSS_SENT_DATE column found with case-insensitive search: "${detectedCssSentColumn}"`);
            }
          }
          
          // If still not found, try to find any column that might be a date column
          if (!detectedCssSentColumn) {
            const possibleDateColumns = availableColumns.filter(col => 
              col.toLowerCase().includes('date') && 
              (col.toLowerCase().includes('sent') || col.toLowerCase().includes('css'))
            );
            if (possibleDateColumns.length > 0) {
              detectedCssSentColumn = possibleDateColumns[0];
              console.log(`CSS_SENT_DATE column auto-detected as: "${detectedCssSentColumn}"`);
            }
          }
          
          // If still not found, try broader search
          if (!detectedCssSentColumn) {
            const broaderSearch = availableColumns.filter(col => 
              col.toLowerCase().includes('sent') || 
              col.toLowerCase().includes('css')
            );
            if (broaderSearch.length > 0) {
              detectedCssSentColumn = broaderSearch[0];
              console.log(`CSS_SENT_DATE column found with broader search: "${detectedCssSentColumn}"`);
            }
          }
          
          console.log('CSS_SENT_DATE column found:', detectedCssSentColumn ? 'YES' : 'NO');
          if (detectedCssSentColumn) {
            console.log('CSS_SENT_DATE column index:', availableColumns.indexOf(detectedCssSentColumn));
            setCssSentColumn(detectedCssSentColumn);
          }
          
          // Look for CSS_RECEIVED_DATE column with multiple variations
          const cssReceivedVariations = [
            'CSS_RECEIVED_DATE', 'CSS Received Date', 'css_received_date', 'CSS_RECEIVED', 'CSS Received', 'css_received',
            'RECEIVED_DATE', 'Received Date', 'received_date', 'RECEIVED', 'Received', 'received',
            'CSS_RECEIVED_DATE', 'CSS Received Date', 'css_received_date', 'CSS_RECEIVED', 'CSS Received', 'css_received',
            'RECEIVED_DATE', 'Received Date', 'received_date', 'RECEIVED', 'Received', 'received',
            'CSS_RECEIVED_DATE', 'CSS Received Date', 'css_received_date', 'CSS_RECEIVED', 'CSS Received', 'css_received',
            'RECEIVED_DATE', 'Received Date', 'received_date', 'RECEIVED', 'Received', 'received'
          ];
          
          let detectedCssReceivedColumn = null;
          for (const variation of cssReceivedVariations) {
            detectedCssReceivedColumn = availableColumns.find(col => col === variation);
            if (detectedCssReceivedColumn) {
              console.log(`CSS_RECEIVED_DATE column found with variation: "${variation}"`);
              break;
            }
          }
          
          if (!detectedCssReceivedColumn) {
            // Try case-insensitive search with more flexible patterns
            detectedCssReceivedColumn = availableColumns.find(col => 
              (col.toLowerCase().includes('css') && col.toLowerCase().includes('received') && col.toLowerCase().includes('date')) ||
              (col.toLowerCase().includes('received') && col.toLowerCase().includes('date')) ||
              (col.toLowerCase().includes('css') && col.toLowerCase().includes('received'))
            );
            if (detectedCssReceivedColumn) {
              console.log(`CSS_RECEIVED_DATE column found with case-insensitive search: "${detectedCssReceivedColumn}"`);
            }
          }
          
          // If still not found, try to find any column that might be a date column
          if (!detectedCssReceivedColumn) {
            const possibleDateColumns = availableColumns.filter(col => 
              col.toLowerCase().includes('date') && 
              (col.toLowerCase().includes('received') || col.toLowerCase().includes('css'))
            );
            if (possibleDateColumns.length > 0) {
              detectedCssReceivedColumn = possibleDateColumns[0];
              console.log(`CSS_RECEIVED_DATE column auto-detected as: "${detectedCssReceivedColumn}"`);
            }
          }
          
          // If still not found, try broader search
          if (!detectedCssReceivedColumn) {
            const broaderSearch = availableColumns.filter(col => 
              col.toLowerCase().includes('received') || 
              col.toLowerCase().includes('css')
            );
            if (broaderSearch.length > 0) {
              detectedCssReceivedColumn = broaderSearch[0];
              console.log(`CSS_RECEIVED_DATE column found with broader search: "${detectedCssReceivedColumn}"`);
            }
          }
          
          console.log('CSS_RECEIVED_DATE column found:', detectedCssReceivedColumn ? 'YES' : 'NO');
          if (detectedCssReceivedColumn) {
            console.log('CSS_RECEIVED_DATE column index:', availableColumns.indexOf(detectedCssReceivedColumn));
            setCssReceivedColumn(detectedCssReceivedColumn);
          }
          
          // Show first few rows data for inspection
          console.log('First 3 rows data sample:');
          for (let i = 0; i < Math.min(3, result.data.length); i++) {
            console.log(`Row ${i + 1}:`, result.data[i]);
          }
          
          // Show sample of CSS_SENT_DATE and CSS_RECEIVED_DATE values
          if (detectedCssSentColumn || detectedCssReceivedColumn) {
            console.log('=== SAMPLE CSS COLUMN VALUES ===');
            const sampleRows = result.data.slice(0, 5);
            sampleRows.forEach((row, index) => {
              console.log(`Row ${index + 1}:`);
              if (detectedCssSentColumn) {
                console.log(`  ${detectedCssSentColumn}: "${row[detectedCssSentColumn]}" (type: ${typeof row[detectedCssSentColumn]})`);
              }
              if (detectedCssReceivedColumn) {
                console.log(`  ${detectedCssReceivedColumn}: "${row[detectedCssReceivedColumn]}" (type: ${typeof row[detectedCssReceivedColumn]})`);
              }
            });
          }
          
          console.log('=== END ANALYSIS ===');
          
          // Final column detection summary
          console.log('=== FINAL COLUMN DETECTION SUMMARY ===');
          console.log('CSS_SENT_DATE column:', detectedCssSentColumn);
          console.log('CSS_RECEIVED_DATE column:', detectedCssReceivedColumn);
          console.log('Available columns:', availableColumns);
          console.log('First row sample:', result.data[0]);
          
          // If columns not detected, show all available columns for manual inspection
          if (!detectedCssSentColumn || !detectedCssReceivedColumn) {
            console.log('=== COLUMN DETECTION FAILED ===');
            console.log('Available columns that might be relevant:');
            availableColumns.forEach(col => {
              if (col.toLowerCase().includes('date') || col.toLowerCase().includes('sent') || 
                  col.toLowerCase().includes('received') || col.toLowerCase().includes('css')) {
                console.log(`  - "${col}" (might be CSS_SENT_DATE or CSS_RECEIVED_DATE)`);
              }
            });
            console.log('=== END COLUMN DETECTION FAILED ===');
          }
          
          console.log('=== END SUMMARY ===');
          
          // Set the detected columns immediately
          if (detectedCssSentColumn) {
            setCssSentColumn(detectedCssSentColumn);
            console.log('CSS_SENT_DATE column set to:', detectedCssSentColumn);
          }
          if (detectedCssReceivedColumn) {
            setCssReceivedColumn(detectedCssReceivedColumn);
            console.log('CSS_RECEIVED_DATE column set to:', detectedCssReceivedColumn);
          }
        }
        
        setUploadStatus({ type: 'success', message: `Successfully loaded ${result.data.length} records from Excel file. Check console for column analysis.` });
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
          
          // Look for the specific sheet "CSAT sent and received Report" (Sheet2 as specified)
          let sheetName = 'CSAT sent and received Report';
          if (!workbook.SheetNames.includes(sheetName)) {
            // If not found, try alternative names
            const alternativeNames = [
              'CSAT sent and received Report',
              'Customer Success Survey sent and received Report',
              'CSAT sent and received',
              'CSAT sent received',
              'Sent and Received Report'
            ];
            
            let foundSheet = null;
            for (const altName of alternativeNames) {
              if (workbook.SheetNames.includes(altName)) {
                foundSheet = altName;
                break;
              }
            }
            
            if (foundSheet) {
              sheetName = foundSheet;
              console.log(`Found alternative sheet: "${sheetName}"`);
            } else {
              // If no alternative found, try to find the 2nd sheet
              if (workbook.SheetNames.length >= 2) {
                sheetName = workbook.SheetNames[1]; // Use 2nd sheet (index 1)
                console.log(`No target sheet found. Using 2nd sheet: "${sheetName}"`);
              } else {
                // If less than 2 sheets, use the first sheet
                sheetName = workbook.SheetNames[0];
                console.log(`Less than 2 sheets available. Using first sheet: "${sheetName}"`);
              }
              console.log('Available sheets:', workbook.SheetNames);
            }
          } else {
            console.log(`Found target sheet: "${sheetName}"`);
          }
          
          console.log(`Using sheet: "${sheetName}"`);
          console.log('=== END SHEET ANALYSIS ===');
          console.log('Note: This dashboard expects data with CSS_SENT_DATE and CSS_RECEIVED_DATE columns.');
          console.log('Target sheet should be "CSAT sent and received Report" (Sheet2) containing both sent and received data.');
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('No data found'));
            return;
          }

          // Get headers (first row)
          const headers = jsonData[0];
          
          // Convert data rows to objects
          const processedData = jsonData.slice(1).map((row, index) => {
            const rowData = {};
            headers.forEach((header, colIndex) => {
              const columnName = header || `Column ${String.fromCharCode(65 + (colIndex % 26))}`;
              rowData[columnName] = row[colIndex] !== undefined ? row[colIndex] : '';
            });
            rowData.id = index + 1;
            return rowData;
          });

          resolve({ 
            data: processedData, 
            headers: headers
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadData = async () => {
    if (!processedData || processedData.length === 0) {
      alert('No data available to download');
      return;
    }

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Account Wise Response Rate');
      
      // Prepare headers
      const headers = [
        'CUSTOMER_ID',
        'CUSTOMER NAME',
        'BUSSINESS UNIT',
        'Number of CSAT Surveys Sent',
        'Number of CSAT Surveys Received',
        'Response Rate %'
      ];
      
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
      
      // Add data rows with percentage formatting and color coding for Response Rate %
      processedData.forEach((row) => {
        const dataRow = worksheet.addRow([
          row.customerId,
          row.customerName,
          normalizeBusinessUnitDisplay(row.businessUnit),
          row.surveysSent,
          row.surveysReceived,
          parseFloat(row.responseRate) / 100 // Convert to decimal for Excel percentage formatting
        ]);
        
        // Apply percentage formatting and color coding to Response Rate % column
        const responseRateCell = dataRow.getCell(6); // Response Rate % column
        responseRateCell.numFmt = '0.00%';
        responseRateCell.alignment = { horizontal: 'center' };
        
        // Apply color coding based on response rate
        const responseRate = parseFloat(row.responseRate);
        if (responseRate >= 0 && responseRate <= 50) {
          // Light red background with dark red text
          responseRateCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFECACA' }
          };
          responseRateCell.font = { color: { argb: 'FF991B1B' }, bold: true };
        } else if (responseRate >= 51 && responseRate <= 74) {
          // Light amber background with dark amber text
          responseRateCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }
          };
          responseRateCell.font = { color: { argb: 'FF92400E' }, bold: true };
        } else if (responseRate >= 75) {
          // Light green background with dark green text
          responseRateCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD1FAE5' }
          };
          responseRateCell.font = { color: { argb: 'FF065F46' }, bold: true };
        }
      });
      
      // Add legend
      const legendStartRow = processedData.length + 3;
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      // Add legend items with colors
      const legendRow1 = worksheet.addRow(['0% to 50%: Light Red']);
      const legendRow2 = worksheet.addRow(['51% to 74%: Light Amber']);
      const legendRow3 = worksheet.addRow(['75% and above: Green']);
      
      // Style legend cells with colors
      const redLegendCell = legendRow1.getCell(1);
      redLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFECACA' }
      };
      redLegendCell.font = { color: { argb: 'FF991B1B' }, bold: true };
      
      const amberLegendCell = legendRow2.getCell(1);
      amberLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }
      };
      amberLegendCell.font = { color: { argb: 'FF92400E' }, bold: true };
      
      const greenLegendCell = legendRow3.getCell(1);
      greenLegendCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD1FAE5' }
      };
      greenLegendCell.font = { color: { argb: 'FF065F46' }, bold: true };
      
      // Set column widths
      worksheet.getColumn(1).width = 20;  // CUSTOMER_ID
      worksheet.getColumn(2).width = 25;  // CUSTOMER NAME
      worksheet.getColumn(3).width = 20;  // BUSSINESS UNIT
      worksheet.getColumn(4).width = 25;  // Number of CSAT Surveys Sent
      worksheet.getColumn(5).width = 28;  // Number of CSAT Surveys Received
      worksheet.getColumn(6).width = 18;  // Response Rate %
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `Account_Wise_Response_Rate_${timestamp}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Data exported successfully with percentage formatting');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric values
      if (sortConfig.key === 'surveysSent' || sortConfig.key === 'surveysReceived') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      // Handle string values
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
  };

  // Process the data according to requirements
  const processedData = useMemo(() => {
    console.log('=== PROCESSING DATA ===');
    console.log('uploadedData length:', uploadedData?.length);
    console.log('cssSentColumn:', cssSentColumn);
    console.log('cssReceivedColumn:', cssReceivedColumn);
    
    if (!uploadedData || uploadedData.length === 0) {
      console.log('No uploaded data available');
      return [];
    }
    
    // If CSS columns are not detected, try to auto-detect them here as a fallback
    let sentColumn = cssSentColumn;
    let receivedColumn = cssReceivedColumn;
    
    if (!sentColumn || !receivedColumn) {
      console.log('CSS columns not detected, attempting fallback detection...');
      
      // Check if uploadedData[0] exists before calling Object.keys
      if (!uploadedData[0]) {
        console.log('No data rows available for column detection');
        return [];
      }
      
      const availableColumns = Object.keys(uploadedData[0]);
      
      // Try to find any column that might contain sent/received information
      if (!sentColumn) {
        sentColumn = availableColumns.find(col => 
          col.toLowerCase().includes('sent') || 
          col.toLowerCase().includes('css')
        );
        console.log('Fallback detected sentColumn:', sentColumn);
      }
      
      if (!receivedColumn) {
        receivedColumn = availableColumns.find(col => 
          col.toLowerCase().includes('received') || 
          col.toLowerCase().includes('response')
        );
        console.log('Fallback detected receivedColumn:', receivedColumn);
      }
      
      // If still not found, use the first two columns as a last resort
      if (!sentColumn && availableColumns.length > 0) {
        sentColumn = availableColumns[0];
        console.log('Using first column as sentColumn:', sentColumn);
      }
      
      if (!receivedColumn && availableColumns.length > 1) {
        receivedColumn = availableColumns[1];
        console.log('Using second column as receivedColumn:', receivedColumn);
      }
    }
    
    if (!sentColumn || !receivedColumn) {
      // Check if uploadedData[0] exists before calling Object.keys
      if (uploadedData[0]) {
        console.log('Still cannot detect required columns. Available columns:', Object.keys(uploadedData[0]));
      } else {
        console.log('Still cannot detect required columns. No data rows available.');
      }
      return [];
    }

    // First pass: Calculate totals for each customer
    const customerTotals = new Map();
    
    if (!Array.isArray(uploadedData)) {
      console.error('uploadedData is not an array:', uploadedData);
      return [];
    }
    
    uploadedData.forEach(row => {
      const customerId = row['CUST_ID'] || row['CUSTOMER_ID'] || row['Customer ID'] || row['customer_id'] || row['C_ID'] || row['C_id'];
      const customerName = row['CUSTOMER_NAME'] || row['Customer Name'] || row['customer_name'] || row['CUST_NAME'] || row['Cust Name'] || row['cust_name'] || 
                          row['CUSTOMER'] || row['Customer'] || row['customer'] || row['CUST'] || row['Cust'] || row['cust'] || 
                          row['NAME'] || row['Name'] || row['name'] ||
                          // Additional variations that might exist in Excel files
                          row['Client Name'] || row['client_name'] || row['CLIENT_NAME'] ||
                          row['Account Name'] || row['account_name'] || row['ACCOUNT_NAME'] ||
                          row['Company Name'] || row['company_name'] || row['COMPANY_NAME'] ||
                          row['Organization'] || row['organization'] || row['ORGANIZATION'] ||
                          row['Org Name'] || row['org_name'] || row['ORG_NAME'] ||
                          row['Customer Account'] || row['customer_account'] || row['CUSTOMER_ACCOUNT'] ||
                          row['Account'] || row['account'] || row['ACCOUNT'] ||
                          row['Client'] || row['client'] || row['CLIENT'] ||
                          row['Company'] || row['company'] || row['COMPANY'] || 'N/A';
      if (!customerId) return;

      if (!customerTotals.has(customerId)) {
        customerTotals.set(customerId, {
          customerId,
          customerName,
          businessUnit: '',
          surveysSent: 0,
          surveysReceived: 0
        });
      }

      const total = customerTotals.get(customerId);
      
      // Extract business unit from various possible column names
      if (!total.businessUnit) {
        const buColumns = [
          'BUSINESS_UNIT', 'Business Unit', 'business_unit', 'BU', 'Bu', 'Business_Unit', 'BUSINESS UNIT',
          'BusinessUnit', 'businessUnit', 'BUSINESSUNIT', 'businessunit', 'B.U.', 'B U', 'B.U',
          'Business_Unit', 'BusinessUnit', 'business_unit', 'businessUnit', 'BUSINESS_UNIT', 'BUSINESSUNIT'
        ];
        
        for (const col of buColumns) {
          if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
            total.businessUnit = row[col];
            break;
          }
        }
        
        // If not found, try case-insensitive search
        if (!total.businessUnit) {
          const availableColumns = Object.keys(row);
          for (const col of availableColumns) {
            if (col.toLowerCase().includes('business') || 
                col.toLowerCase().includes('bu') || 
                col.toLowerCase().includes('unit')) {
              if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
                total.businessUnit = row[col];
                break;
              }
            }
          }
        }
      }
      
      // Count surveys sent using detected column
      const sentValue = row[sentColumn];
      console.log(`Processing row for customer ${customerId}:`);
      console.log(`  sentColumn: "${sentColumn}"`);
      console.log(`  sentValue: "${sentValue}" (type: ${typeof sentValue})`);
      
      if (sentValue && sentValue !== '' && sentValue !== 'N/A' && sentValue !== null && 
          sentValue !== undefined && sentValue !== 'NULL' && sentValue !== 'null' &&
          sentValue !== 'undefined' && sentValue !== 'None' && sentValue !== 'none' &&
          sentValue !== ' ' && sentValue !== '  ' && sentValue !== '   ') {
        total.surveysSent++;
        console.log(`  -> Incrementing surveysSent to ${total.surveysSent}`);
      } else {
        console.log(`  -> NOT counting (invalid value)`);
      }

      // Count surveys received using detected column
      const receivedValue = row[receivedColumn];
      console.log(`  receivedColumn: "${receivedColumn}"`);
      console.log(`  receivedValue: "${receivedValue}" (type: ${typeof receivedValue})`);
      
      if (receivedValue && receivedValue !== '' && receivedValue !== 'N/A' && receivedValue !== null && 
          receivedValue !== undefined && receivedValue !== 'NULL' && receivedValue !== 'null' &&
          receivedValue !== 'undefined' && receivedValue !== 'None' && receivedValue !== 'none' &&
          receivedValue !== ' ' && receivedValue !== '  ' && receivedValue !== '   ') {
        total.surveysReceived++;
        console.log(`  -> Incrementing surveysReceived to ${total.surveysReceived}`);
      } else {
        console.log(`  -> NOT counting (invalid value)`);
      }
    });

    // Second pass: Create result rows with calculated totals (grouped by CUSTOMER_ID)
    const result = [];
    
    // Use the customerTotals Map to create one row per customer
    customerTotals.forEach((total, customerId) => {
      const responseRate = total.surveysSent > 0 
        ? ((total.surveysReceived / total.surveysSent) * 100).toFixed(2)
        : '0.00';

      // Create a row for this customer with aggregated totals
      const resultRow = {
        customerId: customerId,
        customerName: total.customerName || 'N/A',
        businessUnit: total.businessUnit || 'N/A',
        surveysSent: total.surveysSent,
        surveysReceived: total.surveysReceived,
        responseRate: responseRate
      };
      
      console.log(`Creating result row for customer ${customerId}:`);
      console.log(`  surveysSent: ${resultRow.surveysSent}`);
      console.log(`  surveysReceived: ${resultRow.surveysReceived}`);
      console.log(`  responseRate: ${resultRow.responseRate}%`);
      
      result.push(resultRow);
    });

    // Debug: Log the final counts for each customer
    console.log('=== FINAL CUSTOMER TOTALS (GROUPED BY CUSTOMER_ID) ===');
    customerTotals.forEach((total, customerId) => {
      const responseRate = total.surveysSent > 0 
        ? ((total.surveysReceived / total.surveysSent) * 100).toFixed(2)
        : '0.00';
      console.log(`Customer ${customerId}: Sent=${total.surveysSent}, Received=${total.surveysReceived}, Rate=${responseRate}%`);
    });
    console.log('=== END TOTALS ===');
    
    console.log('Final processed data (grouped by CUSTOMER_ID):', result);
    console.log('Total unique customers:', result.length);
    return result;
  }, [uploadedData, cssSentColumn, cssReceivedColumn]);

  // BU Wise Response Rate data processing
  const buWiseData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    console.log('=== PROCESSING BU WISE DATA ===');
    
    // Group data by Business Unit
    const buGroups = new Map();
    
    if (!Array.isArray(uploadedData)) {
      console.error('uploadedData is not an array in BU-wise processing:', uploadedData);
      return [];
    }
    
    uploadedData.forEach(row => {
      const customerId = row['CUST_ID'] || row['CUSTOMER_ID'] || row['Customer ID'] || row['customer_id'] || row['C_ID'] || row['C_id'];
      if (!customerId) return;

      // Extract business unit from various possible column names
      let businessUnit = '';
      const buColumns = [
        'BUSINESS_UNIT', 'Business Unit', 'business_unit', 'BU', 'Bu', 'Business_Unit', 'BUSINESS UNIT',
        'BusinessUnit', 'businessUnit', 'BUSINESSUNIT', 'businessunit', 'B.U.', 'B U', 'B.U',
        'Business_Unit', 'BusinessUnit', 'business_unit', 'businessUnit', 'BUSINESS_UNIT', 'BUSINESSUNIT'
      ];
      
      for (const col of buColumns) {
        if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
          businessUnit = row[col];
          break;
        }
      }
      
      // If not found, try case-insensitive search
      if (!businessUnit) {
        const availableColumns = Object.keys(row);
        for (const col of availableColumns) {
          if (col.toLowerCase().includes('business') || 
              col.toLowerCase().includes('bu') || 
              col.toLowerCase().includes('unit')) {
            if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
              businessUnit = row[col];
              break;
            }
          }
        }
      }
      
      if (!businessUnit) businessUnit = 'Unknown';
      else businessUnit = normalizeBusinessUnitDisplay(businessUnit);
      
      // Count surveys sent and received
      const sentValue = row[cssSentColumn];
      const receivedValue = row[cssReceivedColumn];
      
      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, {
          businessUnit,
          customers: new Set(),
          surveysSent: 0,
          surveysReceived: 0
        });
      }
      
      const buGroup = buGroups.get(businessUnit);
      buGroup.customers.add(customerId);
      
      // Count surveys sent
      if (sentValue && sentValue !== '' && sentValue !== 'N/A' && sentValue !== null && 
          sentValue !== undefined && sentValue !== 'NULL' && sentValue !== 'null') {
        buGroup.surveysSent++;
      }
      
      // Count surveys received
      if (receivedValue && receivedValue !== '' && receivedValue !== 'N/A' && receivedValue !== null && 
          receivedValue !== undefined && receivedValue !== 'NULL' && receivedValue !== 'null') {
        buGroup.surveysReceived++;
      }
    });
    
    // Convert to array and calculate response rates
    const result = Array.from(buGroups.values()).map((buGroup, index) => {
      const responseRate = buGroup.surveysSent > 0 
        ? ((buGroup.surveysReceived / buGroup.surveysSent) * 100).toFixed(2)
        : '0.00';
      
      return {
        sNo: index + 1,
        businessUnit: buGroup.businessUnit,
        customerCount: buGroup.customers.size,
        surveysSent: buGroup.surveysSent,
        surveysReceived: buGroup.surveysReceived,
        responseRate: responseRate
      };
    });
    
    // Sort business units in the specified order
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
    
    console.log('BU Wise data processed and sorted:', sortedResult);
    return sortedResult;
  }, [uploadedData, cssSentColumn, cssReceivedColumn]);

  // Apply filters to processed data
  const filteredData = useMemo(() => {
    console.log('=== FILTERING DATA ===');
    console.log('Original processedData:', processedData);
    
    if (!processedData || processedData.length === 0) return [];
    
    let filtered = processedData;
    
    // Apply business unit filter
    if (businessUnitFilter) {
      filtered = filtered.filter(row => 
        row.businessUnit && 
        row.businessUnit.toString().toLowerCase().includes(businessUnitFilter.toLowerCase())
      );
    }
    
    console.log('Filtered data:', filtered);
    console.log('=== END FILTERING ===');
    return filtered;
  }, [processedData, businessUnitFilter]);

  // Get unique business units for filter dropdown
  const uniqueBusinessUnits = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return [...new Set(processedData.map(row => row.businessUnit).filter(Boolean))].sort();
  }, [processedData]);

  // Prepare chart data for vertical bar chart grouped by Response Rate %
  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    
    // Group customers by Response Rate % ranges
    const responseRateGroups = {
      '90-100%': { min: 90, max: 100, customers: [], color: '#10b981' },
      '80-89%': { min: 80, max: 89, customers: [], color: '#3b82f6' },
      '70-79%': { min: 70, max: 79, customers: [], color: '#f59e0b' },
      '60-69%': { min: 60, max: 69, customers: [], color: '#ef4444' },
      '50-59%': { min: 50, max: 59, customers: [], color: '#8b5cf6' },
      '40-49%': { min: 40, max: 49, customers: [], color: '#ec4899' },
      '30-39%': { min: 30, max: 39, customers: [], color: '#06b6d4' },
      '20-29%': { min: 20, max: 29, customers: [], color: '#84cc16' },
      '10-19%': { min: 10, max: 19, customers: [], color: '#f97316' },
      '0-9%': { min: 0, max: 9, customers: [], color: '#6b7280' }
    };
    
    // Categorize customers into groups
    filteredData.forEach(item => {
      const responseRate = parseFloat(item.responseRate);
      for (const [range, group] of Object.entries(responseRateGroups)) {
        if (responseRate >= group.min && responseRate <= group.max) {
          group.customers.push({
            id: item.customerId,
            label: item.customerId,
            responseRate: responseRate,
            surveysSent: item.surveysSent,
            surveysReceived: item.surveysReceived,
            businessUnit: item.businessUnit
          });
          break;
        }
      }
    });
    
    // Convert to array and filter out empty groups
    return Object.entries(responseRateGroups)
      .filter(([range, group]) => group.customers.length > 0)
      .map(([range, group]) => ({
        range,
        count: group.customers.length,
        color: group.color,
        customers: group.customers
      }));
  }, [filteredData]);

  // Download vertical bar chart as image
  const downloadChart = () => {
    if (!chartData || chartData.length === 0) return;
    
    const svg = document.querySelector('.vertical-bar-chart svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 1600;
    canvas.height = 800;
    
    img.onload = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'Account_Wise_Response_Rate_Vertical_Chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Download donut chart as image
  const downloadDonutChart = () => {
    if (!chartData || chartData.length === 0) return;
    
    const svg = document.querySelector('.donut-chart svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 2000;
    canvas.height = 1200;
    
    img.onload = () => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'Account_Wise_Response_Rate_Donut_Chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Download BU Wise data to Excel
  const downloadBUWiseData = async () => {
    if (!buWiseData || buWiseData.length === 0) return;
    
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('BU Wise Response Rate');
      
      // Prepare headers
      const headers = [
        'S No.',
        'BUSSINESS UNIT',
        'Customer Count',
        'Number of CSAT Surveys Sent',
        'Number of CSAT Surveys Received',
        'Response Rate %'
      ];
      
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
      
      // Add data rows with percentage formatting for Response Rate %
      buWiseData.forEach((row) => {
        const dataRow = worksheet.addRow([
          row.sNo,
          normalizeBusinessUnitDisplay(row.businessUnit),
          row.customerCount,
          row.surveysSent,
          row.surveysReceived,
          parseFloat(row.responseRate) / 100 // Convert to decimal for Excel percentage formatting
        ]);
        
        // Apply percentage formatting to Response Rate % column
        const responseRateCell = dataRow.getCell(6); // Response Rate % column
        responseRateCell.numFmt = '0.00%';
        responseRateCell.alignment = { horizontal: 'center' };
      });
      
      // Set column widths
      worksheet.getColumn(1).width = 10; // S No.
      worksheet.getColumn(2).width = 25; // BUSSINESS UNIT
      worksheet.getColumn(3).width = 20; // Customer Count
      worksheet.getColumn(4).width = 30; // Number of CSAT Surveys Sent
      worksheet.getColumn(5).width = 30; // Number of CSAT Surveys Received
      worksheet.getColumn(6).width = 20; // Response Rate %
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BU_Wise_Response_Rate_Analysis.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('BU Wise data downloaded successfully with percentage formatting');
    } catch (error) {
      console.error('Error downloading BU Wise data:', error);
      alert('Error downloading BU Wise data. Please try again.');
    }
  };



  // Render donut chart with account IDs in legend
  const renderDonutChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          No data available for chart
        </div>
      );
    }

    const chartWidth = 1000; // Increased width to prevent legend overlap
    const chartHeight = 600;
    const centerX = 400; // Center the donut chart in the left portion
    const centerY = chartHeight / 2;
    const radius = 150;
    const innerRadius = 80;

    // Calculate total customers for percentage
    const totalCustomers = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="donut-chart-svg">
        {/* Chart background */}
        <rect width={chartWidth} height={chartHeight} fill="#f8fafc" rx="8" />
        
        {/* Chart title */}
        <text
          x={centerX}
          y={50}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#374151"
        >
          Response Rate Distribution (Donut Chart)
        </text>
        
        {/* Chart subtitle */}
        <text
          x={centerX}
          y={70}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
        >
          Click legend items to see Account IDs
        </text>

        {/* Donut segments */}
        {chartData.map((item, index) => {
          const previousAngle = chartData
            .slice(0, index)
            .reduce((sum, d) => sum + (d.count / totalCustomers) * 360, 0);
          const currentAngle = (item.count / totalCustomers) * 360;
          
          const startAngle = previousAngle;
          const endAngle = previousAngle + currentAngle;
          
          const startRadians = (startAngle - 90) * (Math.PI / 180);
          const endRadians = (endAngle - 90) * (Math.PI / 180);
          
          const x1 = centerX + radius * Math.cos(startRadians);
          const y1 = centerY + radius * Math.sin(startRadians);
          const x2 = centerX + radius * Math.cos(endRadians);
          const y2 = centerY + radius * Math.sin(endRadians);
          
          const largeArcFlag = currentAngle > 180 ? 1 : 0;
          
          const pathData = [
            `M ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L ${centerX + innerRadius * Math.cos(endRadians)} ${centerY + innerRadius * Math.sin(endRadians)}`,
            `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${centerX + innerRadius * Math.cos(startRadians)} ${centerY + innerRadius * Math.sin(startRadians)}`,
            'Z'
          ].join(' ');
          
          // Calculate position for Response Rate % label
          const midAngle = (startAngle + endAngle) / 2;
          const midRadians = (midAngle - 90) * (Math.PI / 180);
          const labelRadius = radius + 20;
          const labelX = centerX + labelRadius * Math.cos(midRadians);
          const labelY = centerY + labelRadius * Math.sin(midRadians);
          
          return (
            <g key={index}>
              <path
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
              
              {/* Response Rate % Label on donut segment */}
              <g>
                {/* Background for better readability */}
                <rect
                  x={labelX - 25}
                  y={labelY - 8}
                  width={50}
                  height={16}
                  fill="rgba(255, 255, 255, 0.9)"
                  stroke="rgba(0, 0, 0, 0.1)"
                  strokeWidth="0.5"
                  rx="8"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="600"
                  fill="#374151"
                  dominantBaseline="middle"
                >
                  {item.range}
                </text>
              </g>
            </g>
          );
        })}

        {/* Center text */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          fontSize="16"
          fontWeight="600"
          fill="#374151"
        >
          Total
        </text>
        <text
          x={centerX}
          y={centerY + 15}
          textAnchor="middle"
          fontSize="24"
          fontWeight="700"
          fill="#374151"
        >
          {totalCustomers}
        </text>
        <text
          x={centerX}
          y={centerY + 35}
          textAnchor="middle"
          fontSize="14"
          fontWeight="500"
          fill="#6b7280"
        >
          Customers
        </text>

        {/* Legend with Account IDs - Positioned to the right */}
        <g transform={`translate(${chartWidth - 280}, 80)`}>
          {/* Legend Background */}
          <rect
            x={-15}
            y={-35}
            width={290}
            height={chartData.length * 35 + 50}
            fill="rgba(255, 255, 255, 0.95)"
            stroke="#e2e8f0"
            strokeWidth="2"
            rx="10"
            filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
          />
          
          {/* Legend Title */}
          <text
            x={0}
            y={-20}
            fontSize="16"
            fontWeight="700"
            fill="#374151"
          >
            Response Rate Groups
          </text>
          
          {chartData.map((item, index) => {
            const legendX = 0;
            const legendY = index * 35; // Increased spacing between legend items
            const legendWidth = 15;
            const legendHeight = 15;
            
            return (
              <g key={index}>
                {/* Legend color box */}
                <rect
                  x={legendX}
                  y={legendY}
                  width={legendWidth}
                  height={legendHeight}
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth="1"
                  rx="3"
                />
                
                {/* Legend text */}
                <text
                  x={legendX + legendWidth + 10}
                  y={legendY + legendHeight / 2 + 4}
                  fontSize="12"
                  fontWeight="500"
                  fill="#374151"
                >
                  {item.range}: {item.count} customers
                </text>
                
                {/* Clickable Account IDs section */}
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const accountList = item.customers.map(c => c.label).join(', ');
                    const businessUnits = [...new Set(item.customers.map(c => c.businessUnit))].join(', ');
                    alert(`Account IDs for ${item.range}:\n\nAccount IDs: ${accountList}\n\nBusiness Units: ${businessUnits}\n\nTotal Customers: ${item.count}`);
                  }}
                  onMouseEnter={(e) => {
                    // Highlight the entire legend item on hover
                    const parentGroup = e.target.closest('g');
                    if (parentGroup) {
                      parentGroup.style.opacity = '0.7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Restore opacity on mouse leave
                    const parentGroup = e.target.closest('g');
                    if (parentGroup) {
                      parentGroup.style.opacity = '1';
                    }
                  }}
                >
                  {/* Clickable background for better UX */}
                  <rect
                    x={legendX + legendWidth + 5}
                    y={legendY + 5}
                    width={200}
                    height={25}
                    fill="transparent"
                    stroke="transparent"
                  />
                  
                  {/* Account IDs text */}
                  <text
                    x={legendX + legendWidth + 10}
                    y={legendY + legendHeight / 2 + 20}
                    fontSize="10"
                    fill="#3b82f6"
                    textDecoration="underline"
                    fontWeight="500"
                  >
                    👆 Click to see Account IDs ({item.customers.length})
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  // Render vertical bar chart grouped by Response Rate %
  const renderVerticalBarChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          No data available for chart
        </div>
      );
    }

    const chartWidth = Math.max(1000, chartData.length * 120 + 300); // Added 300px for legend
    const chartHeight = 500;
    const barWidth = 80;
    const barSpacing = 40;
    const margin = { top: 60, right: 40, bottom: 100, left: 80 };

    return (
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="vertical-bar-chart-svg">
        {/* Chart background */}
        <rect width={chartWidth} height={chartHeight} fill="#f8fafc" rx="8" />
        
        {/* Y-axis grid lines */}
        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(tick => {
          const y = chartHeight - margin.bottom - (tick / 50) * (chartHeight - margin.top - margin.bottom);
          return (
            <g key={tick}>
              <line
                x1={margin.left}
                y1={y}
                x2={chartWidth - margin.right}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={margin.left - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Vertical Bars */}
        {chartData.map((item, index) => {
          const x = margin.left + index * (barWidth + barSpacing);
          const maxCount = Math.max(...chartData.map(d => d.count));
          const barHeight = (item.count / maxCount) * (chartHeight - margin.top - margin.bottom);
          const y = chartHeight - margin.bottom - barHeight;
          
          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={item.color}
                stroke="#fff"
                strokeWidth="2"
                rx="6"
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                }}
              />
              
              {/* Count Label on Bar */}
              <text
                x={x + barWidth / 2}
                y={y - 10}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill="#374151"
              >
                {item.count}
              </text>
              
              {/* Response Rate Range Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight - margin.bottom + 20}
                textAnchor="middle"
                fontSize="12"
                fontWeight="500"
                fill="#374151"
              >
                {item.range}
              </text>
            </g>
          );
        })}

        {/* Chart title */}
        <text
          x={chartWidth / 2}
          y={30}
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#374151"
        >
          Customer Distribution by Response Rate %
        </text>
        
        {/* Chart subtitle */}
        <text
          x={chartWidth / 2}
          y={50}
          textAnchor="middle"
          fontSize="12"
          fill="#6b7280"
        >
          Click legend items to see Account IDs
        </text>
        
        {/* Y-axis label */}
        <text
          x={-chartHeight / 2}
          y={20}
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="#6b7280"
          transform={`rotate(-90, 20, ${chartHeight / 2})`}
        >
          Number of Customers
        </text>

        {/* Legend for Vertical Bar Chart */}
        <g transform={`translate(${chartWidth - 280}, 80)`}>
          {/* Legend Background */}
          <rect
            x={-15}
            y={-35}
            width={290}
            height={chartData.length * 35 + 50}
            fill="rgba(255, 255, 255, 0.95)"
            stroke="#e2e8f0"
            strokeWidth="2"
            rx="10"
            filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))"
          />
          
          {/* Legend Title */}
          <text
            x={0}
            y={-20}
            fontSize="16"
            fontWeight="700"
            fill="#374151"
          >
            Response Rate Groups
          </text>
          
          {chartData.map((item, index) => {
            const legendX = 0;
            const legendY = index * 35;
            const legendWidth = 15;
            const legendHeight = 15;
            
            return (
              <g key={index}>
                {/* Legend color box */}
                <rect
                  x={legendX}
                  y={legendY}
                  width={legendWidth}
                  height={legendHeight}
                  fill={item.color}
                  stroke="#fff"
                  strokeWidth="1"
                  rx="3"
                />
                
                {/* Legend text */}
                <text
                  x={legendX + legendWidth + 10}
                  y={legendY + legendHeight / 2 + 4}
                  fontSize="12"
                  fontWeight="500"
                  fill="#374151"
                >
                  {item.range}: {item.count} customers
                </text>
                
                {/* Clickable Account IDs section */}
                <g
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const accountList = item.customers.map(c => c.label).join(', ');
                    const businessUnits = [...new Set(item.customers.map(c => c.businessUnit))].join(', ');
                    alert(`Account IDs for ${item.range}:\n\nAccount IDs: ${accountList}\n\nBusiness Units: ${businessUnits}\n\nTotal Customers: ${item.count}`);
                  }}
                  onMouseEnter={(e) => {
                    // Highlight the entire legend item on hover
                    const parentGroup = e.target.closest('g');
                    if (parentGroup) {
                      parentGroup.style.opacity = '0.7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Restore opacity on mouse leave
                    const parentGroup = e.target.closest('g');
                    if (parentGroup) {
                      parentGroup.style.opacity = '1';
                    }
                  }}
                >
                  {/* Clickable background for better UX */}
                  <rect
                    x={legendX + legendWidth + 5}
                    y={legendY + 5}
                    width={200}
                    height={25}
                    fill="transparent"
                    stroke="transparent"
                  />
                  
                  {/* Account IDs text */}
                  <text
                    x={legendX + legendWidth + 10}
                    y={legendY + legendHeight / 2 + 20}
                    fontSize="10"
                    fill="#3b82f6"
                    textDecoration="underline"
                    fontWeight="500"
                  >
                    👆 Click to see Account IDs ({item.customers.length})
                  </text>
                </g>
              </g>
            );
          })}
        </g>
      </svg>
    );
  };

  if (!uploadedData) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <BarChart3 size={24} /> Dashboard for Account/BU wise Response Rate
          </HeaderTitle>
          {onBack && (
            <BackButton onClick={onBack} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </DashboardHeader>

        <UploadContainer>
          <p style={{ color: '#3b82f6' }}>Please upload the Excel file to view Account Wise Response Rate</p>
          
          {!selectedFile ? (
            <UploadArea onClick={() => document.getElementById('file-input').click()}>
              <Upload size={48} color="#6b7280" />
              <p>Drop your Excel file here or click to browse</p>
              <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Supports .xlsx files</p>
            </UploadArea>
          ) : (
            <FileInfo>
              <FileSpreadsheet size={24} color="#0c4a6e" />
              <FileDetails>
                <FileName>{selectedFile.name}</FileName>
                <FileSize>{formatFileSize(selectedFile.size)}</FileSize>
              </FileDetails>
              <RemoveButton onClick={removeFile}>
                <X size={16} />
              </RemoveButton>
            </FileInfo>
          )}

          <FileInput
            id="file-input"
            type="file"
            accept=".xlsx"
            onChange={handleFileInput}
          />

          {selectedFile && (
            <LoadDataButton
              onClick={processFile}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Load Dashboard for Account/BU wise Response Rate data button'}
            </LoadDataButton>
          )}

          {uploadStatus && (
            uploadStatus.type === 'success' ? (
              <SuccessMessage>
                <CheckCircle size={20} />
                {uploadStatus.message}
              </SuccessMessage>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '1rem', 
                background: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                margin: '1rem 0', 
                color: '#dc2626', 
                fontWeight: '500',
                justifyContent: 'center'
              }}>
                <X size={20} />
                {uploadStatus.message}
              </div>
            )
          )}
        </UploadContainer>
      </DashboardContainer>
    );
  }

  // Show loading state if data is not ready
  if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <BarChart3 size={24} /> Dashboard for Account/BU wise Response Rate
          </HeaderTitle>
        </DashboardHeader>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#3b82f6' }}>Loading dashboard data... Please wait while we process your uploaded Excel file.</p>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <BarChart3 size={24} /> Dashboard for Account/BU wise Response Rate
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {processedData && processedData.length > 0 && (
            <DownloadButton 
              onClick={downloadData}
              aria-label="Download data to Excel"
              title="Download data to Excel"
            >
              <Download size={16} />
              Download Excel
            </DownloadButton>
          )}
          {onBack && (
            <BackButton onClick={onBack} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </div>
      </DashboardHeader>

      {!showBUWiseView && (
        <FilterContainer>
          <FilterLabel htmlFor="businessUnitFilterSelect">BUSSINESS UNIT:</FilterLabel>
          <FilterSelect value={businessUnitFilter} onChange={(e) => setBusinessUnitFilter(e.target.value)}>
            <option value="">All Business Units</option>
            {uniqueBusinessUnits.map(bu => (
              <option key={bu} value={bu}>{bu}</option>
            ))}
          </FilterSelect>
          {businessUnitFilter && (
            <ClearFilterButton onClick={() => setBusinessUnitFilter('')}>Clear Filter</ClearFilterButton>
          )}
        </FilterContainer>
      )}

      <ResultsSummary>
        {showBUWiseView ? (
          <>Showing {buWiseData.length} Business Units</>
        ) : (
          <>Showing {filteredData.length} of {processedData.length} records.</>
        )}
      </ResultsSummary>

      {/* Chart Toggle Button */}
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <button
          onClick={() => setShowDonutChart(!showDonutChart)}
          style={{
            background: showDonutChart ? '#10b981' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          {showDonutChart ? '📊 Show Vertical Bar Chart' : '🍩 Show Donut Chart'}
        </button>
      </div>

      {/* BU Wise Response Rate Button */}
      <div style={{ textAlign: 'center', margin: '2rem 0' }}>
        <button
          onClick={() => setShowBUWiseView(!showBUWiseView)}
          style={{
            background: showBUWiseView ? '#10b981' : '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
        >
          {showBUWiseView ? '👥 Show Account-wise View' : '🏢 Show BU Wise Response Rate Dashboard'}
        </button>
      </div>

      {/* Conditional Chart Display */}
      {!showBUWiseView && (
        <>
          {!showDonutChart ? (
            /* Vertical Bar Chart */
            <ChartContainer>
              <ChartTitle>
                <ChartHeader>
                  <BarChart size={20} />
                  Customer Distribution by Response Rate % (Vertical Bar Chart)
                </ChartHeader>
                <DownloadButton onClick={downloadChart} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  <Download size={16} />
                  Download Chart
                </DownloadButton>
              </ChartTitle>
              <ChartSummary>
                <SummaryItem>
                  <div className="value">{chartData.length}</div>
                  <div className="label">Response Rate Groups</div>
                </SummaryItem>
                <SummaryItem>
                  <div className="value">
                    {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                  </div>
                  <div className="label">Total Customers</div>
                </SummaryItem>
                <SummaryItem>
                  <div className="value">
                    {filteredData.reduce((sum, item) => sum + item.surveysSent, 0).toLocaleString()}
                  </div>
                  <div className="label">Total Surveys Sent</div>
                </SummaryItem>
                <SummaryItem>
                  <div className="value">
                    {filteredData.reduce((sum, item) => sum + item.surveysReceived, 0).toLocaleString()}
                  </div>
                  <div className="label">Total Surveys Received</div>
                </SummaryItem>
              </ChartSummary>
              <BarChartContainer className="vertical-bar-chart">
                {renderVerticalBarChart()}
              </BarChartContainer>
            </ChartContainer>
          ) : (
            /* Donut Chart */
            <ChartContainer>
              <ChartTitle>
                <ChartHeader>
                  <BarChart size={20} />
                  Response Rate Distribution (Donut Chart with Account IDs)
                </ChartHeader>
                <DownloadButton onClick={downloadDonutChart} style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                  <Download size={16} />
                  Download Chart
                </DownloadButton>
              </ChartTitle>
              <ChartSummary>
                <SummaryItem>
                  <div className="value">{chartData.length}</div>
                  <div className="label">Response Rate Groups</div>
                </SummaryItem>
                <SummaryItem>
                  <div className="value">
                    {chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
                  </div>
                  <div className="label">Total Customers</div>
                </SummaryItem>
                <SummaryItem>
                  <div className="value">
                    {filteredData.reduce((sum, item) => sum + parseFloat(item.responseRate), 0).toFixed(1)}%
                  </div>
                  <div className="label">Average Response Rate</div>
                </SummaryItem>
              </ChartSummary>
              <BarChartContainer className="donut-chart">
                {renderDonutChart()}
              </BarChartContainer>
            </ChartContainer>
          )}
        </>
      )}

      {/* Color Legend for Response Rate - Below Charts */}
      {!showBUWiseView && (
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
      )}

      {/* BU Wise Response Rate Table */}
      {showBUWiseView && (
        <div style={{ margin: '2rem 0' }}>
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
                  🏢 BU Wise Response Rate Dashboard
                </h3>
                <p style={{ margin: '0', opacity: '0.9' }}>
                  Response rate analysis grouped by Business Unit
                </p>
              </div>
              {buWiseData && buWiseData.length > 0 && (
                <button
                  onClick={downloadBUWiseData}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                >
                  <Download size={16} />
                  Download Excel
                </button>
              )}
            </div>
          </div>

          <TableContainer>
            <TableWrapper>
              <Table role="table" aria-label="BU Wise Response Rate">
                <TableHeader>
                  <tr>
                    <Th>S No.</Th>
                    <Th>BUSSINESS UNIT</Th>
                    <Th>Customer Count</Th>
                    <Th>Number of CSAT Surveys Sent</Th>
                    <Th>Number of CSAT Surveys Received</Th>
                    <Th>Response Rate %</Th>
                  </tr>
                </TableHeader>
                <tbody>
                  {buWiseData.map((row) => (
                    <tr key={row.businessUnit}>
                      <Td>{row.sNo}</Td>
                      <Td>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td>{row.customerCount}</Td>
                      <Td>{row.surveysSent}</Td>
                      <Td>{row.surveysReceived}</Td>
                      <Td style={{ 
                        backgroundColor: getResponseRateCellColor(row.responseRate), 
                        color: getResponseRateTextColor(row.responseRate),
                        fontWeight: '600'
                      }}>
                        {row.responseRate}%
                      </Td>
                    </tr>
                  ))}
                  {buWiseData.length === 0 && (
                    <tr>
                      <Td colSpan={6}>
                        No BU Wise data found. Please ensure your Excel file contains the required columns and data.
                      </Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </TableContainer>
        </div>
      )}

      {/* Account-wise Response Rate Table */}
      {!showBUWiseView && (
        <TableContainer>
          <TableWrapper>
            <Table role="table" aria-label="Account Wise Response Rate">
              {console.log('=== TABLE RENDERING ===')}
              {console.log('filteredData for table:', filteredData)}
              {console.log('Sample row structure:', filteredData[0])}
              {console.log('=== END TABLE RENDERING ===')}
              <TableHeader>
                <tr>
                  <Th onClick={() => handleSort('customerId')} style={{ cursor: 'pointer' }}>
                    CUSTOMER_ID {sortConfig.key === 'customerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                    CUSTOMER NAME {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
              </TableHeader>
              <tbody>
                {getSortedData(filteredData).map((row) => (
                  <tr key={row.customerId}>
                    <Td>{row.customerId}</Td>
                    <Td>{row.customerName}</Td>
                    <Td>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td>{row.surveysSent}</Td>
                    <Td>{row.surveysReceived}</Td>
                    <Td style={{ backgroundColor: getResponseRateCellColor(row.responseRate), color: getResponseRateTextColor(row.responseRate) }}>
                      {row.responseRate}%
                    </Td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <Td colSpan={6}>
                      No data found. Please ensure your Excel file contains the required columns and data.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </TableContainer>
      )}
    </DashboardContainer>
  );
};

export default AccountWiseResponseRateDashboard;
