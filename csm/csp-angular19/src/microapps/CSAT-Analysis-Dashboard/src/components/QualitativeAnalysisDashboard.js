import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { ChevronLeft, Download, FileText, Search, Filter, Upload, CheckCircle, AlertCircle, X, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import html2canvas from 'html2canvas';
import { useCSATContext } from '../context/CSATContext';

const DashboardContainer = styled.div`
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const SearchFilterSection = styled.div`
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
`;

const SearchFilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchFilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const ClearButton = styled.button`
  padding: 0.75rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;

  &:hover {
    background: #b91c1c;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  }
`;

const HeaderTitle = styled.h1`
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OrgLevelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #059669;
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
  overflow-y: auto;
  max-height: 600px;
  max-width: 100%;
  
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
    
    &:hover {
      background: #94a3b8;
    }
  }
  
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1200px;
  table-layout: auto;
`;

const Th = styled.th`
  background: #1e3a8a;
  color: #ffffff;
  font-weight: 600;
  padding: 0.6rem 0.75rem;
  text-align: center;
  border-bottom: 2px solid #172e6e;
  border-right: 1px solid #172e6e;
  font-size: 0.8rem;
  letter-spacing: 0.02em;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  min-width: 100px;
  max-width: 200px;
  
  &:first-child {
    border-top-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
    border-right: none;
  }
`;

const Td = styled.td`
  padding: 0.4rem 0.6rem;
  border-bottom: 1px solid #e5e7eb;
  border-right: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #374151;
  vertical-align: top;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
  
  &:first-child {
    font-weight: 600;
    color: #6b7280;
  }
  
  &:last-child {
    border-right: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
  color: #dc2626;
  font-size: 1.125rem;
`;

const LegendContainer = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const LegendTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 0.75rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  flex-shrink: 0;
`;

const LegendText = styled.span`
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.4;
`;

const UploadSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  max-width: 500px;
`;

const UploadSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const UploadSectionTitle = styled.h3`
  margin: 0;
  color: #1e3a5f;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UploadArea = styled.div`
  padding: 1rem;
  border: 2px dashed ${props => props.$isDragOver ? '#667eea' : '#cbd5e1'};
  border-radius: 6px;
  text-align: center;
  background: ${props => props.$isDragOver ? '#f0f4ff' : '#fafbfc'};
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const UploadIcon = styled.div`
  color: #94a3b8;
  margin-bottom: 0.25rem;
`;

const UploadText = styled.p`
  font-size: 0.8rem;
  font-weight: 500;
  color: #334155;
  margin: 0 0 0.15rem 0;
`;

const UploadSubtext = styled.p`
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  margin-top: 0.75rem;
  background: ${props => props.$type === 'success' ? '#f0fdf4' : props.$type === 'error' ? '#fef2f2' : '#eff6ff'};
  color: ${props => props.$type === 'success' ? '#166534' : props.$type === 'error' ? '#991b1b' : '#1e40af'};
  border: 1px solid ${props => props.$type === 'success' ? '#bbf7d0' : props.$type === 'error' ? '#fecaca' : '#bfdbfe'};
`;

const UploadedFileCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  margin-top: 0.75rem;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileName = styled.span`
  font-weight: 600;
  color: #1e3a5f;
  font-size: 0.8rem;
`;

const FileDetails = styled.span`
  color: #64748b;
  font-size: 0.7rem;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClearFileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.5rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  &:hover { background: #e2e8f0; }
`;

const RemoveFileButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  &:hover { background: #fecaca; }
`;

const BucketAnalysisButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s;
  &:hover { 
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  }
`;

const BucketAnalysisContainer = styled.div`
  margin-top: 1.5rem;
`;

const BucketSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin-bottom: 1.5rem;
  overflow: hidden;
`;

const BucketSectionHeader = styled.div`
  padding: 1rem 1.5rem;
  background: ${props => props.$type === 'negative' ? 
    'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 
    'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/* Same header styling as Account/BU wise percentage of Satisfied Customers - Dark Cornflower Blue 3 */
const CombinedCategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1.5rem;
  background: #26428B;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  color: white;
  gap: 0.75rem;
`;

/* Same font as HeaderTitle - matches Main Qualitative Analysis dashboard header */
const CombinedCategoryTitle = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

/* Wrapper for Combined Category section - legend placed below dashboard */
const CombinedCategoryWrapper = styled.div`
  margin-bottom: 1.5rem;
`;

const BucketSectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
`;

const BucketTableWrapper = styled.div`
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
`;

const ChartContainer = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const ChartTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: #374151;
  margin-bottom: 1rem;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-size: 0.8rem;
  color: #64748b;
`;

const BucketTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const BucketTh = styled.th`
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: ${props => props.$align || 'left'};
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.8rem;
  position: sticky;
  top: 0;
  z-index: 5;
  white-space: nowrap;
`;

/* Same header cell styling as Account/BU wise percentage of Satisfied Customers - Dark Cornflower Blue 3 (#1e3a8a) */
const CombinedCategoryTh = styled.th`
  background: #1e3a8a;
  color: #ffffff;
  font-weight: 600;
  padding: 0.75rem 1rem;
  text-align: ${props => props.$align || 'left'};
  border: 1px solid #9ca3af;
  font-size: 0.8rem;
  position: sticky;
  top: 0;
  z-index: 5;
  white-space: nowrap;
`;

const BucketTd = styled.td`
  padding: 0.6rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.8rem;
  color: #374151;
  text-align: ${props => props.$align || 'left'};
  background: ${props => props.$highlight ? '#fef3c7' : 'transparent'};
`;

const BucketCountBadge = styled.span`
  display: inline-block;
  min-width: 28px;
  padding: 0.2rem 0.5rem;
  background: ${props => props.$type === 'negative' ? '#fee2e2' : '#dcfce7'};
  color: ${props => props.$type === 'negative' ? '#dc2626' : '#16a34a'};
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
`;

const TotalRow = styled.tr`
  background: #f1f5f9;
  font-weight: 600;
  
  td {
    border-top: 2px solid #cbd5e1;
  }
`;

const NoBucketData = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.9rem;
`;

const QualitativeAnalysisDashboard = ({ excelData, onBack }) => {
  const [uploadedData, setUploadedData] = useState(null);
  const [wordBankData, setWordBankData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerNameFilter, setCustomerNameFilter] = useState('');
  const [projectNameFilter, setProjectNameFilter] = useState('');
  const [perspectiveFilter, setPerspectiveFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showOrgLevelView, setShowOrgLevelView] = useState(false);
  const { csatCycleStartDate, csatCycleStartDateFormatted } = useCSATContext();

  // File upload states
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ type: '', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBucketAnalysis, setShowBucketAnalysis] = useState(false);
  const [updatedRemarksFile, setUpdatedRemarksFile] = useState(null);
  const [updatedRemarksData, setUpdatedRemarksData] = useState([]);
  const [showNewBucketSections, setShowNewBucketSections] = useState(false);
  const [showUpdatedRemarksUpload, setShowUpdatedRemarksUpload] = useState(true);
  const fileInputRef = useRef(null);
  const updatedRemarksInputRef = useRef(null);

  // Clear all filters
  const clearAllFilters = () => {
    setCustomerNameFilter('');
    setProjectNameFilter('');
    setPerspectiveFilter('');
    setCategoryFilter('all');
  };

  // Process uploaded Excel file for Qualitative Analysis
  const processQualitativeFile = async (file) => {
    setIsProcessing(true);
    setUploadStatus({ type: '', message: '' });

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      
      console.log('=== Qualitative Analysis File Upload ===');
      console.log('File name:', file.name);
      console.log('Available sheets:', workbook.SheetNames);

      // Find the appropriate sheet (first sheet or one named appropriately)
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      console.log('Sheet used:', sheetName);
      console.log('Total rows:', jsonData.length);
      console.log('Sample row:', jsonData[0]);
      const columns = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];
      console.log('Columns found:', columns);
      
      // Debug: Check for CUSTOMER NAME and BUSINESS UNIT columns
      if (jsonData.length > 0) {
        const sampleRow = jsonData[0];
        console.log('=== Column Detection Debug ===');
        console.log('CUSTOMER NAME variations:');
        console.log('  CUSTOMER NAME:', sampleRow['CUSTOMER NAME']);
        console.log('  CUSTOMER_NAME:', sampleRow['CUSTOMER_NAME']);
        console.log('  CUST_NM:', sampleRow['CUST_NM']);
        console.log('  Customer Name:', sampleRow['Customer Name']);
        console.log('  Account Name:', sampleRow['Account Name']);
        console.log('BUSINESS UNIT variations:');
        console.log('  BUSINESS UNIT:', sampleRow['BUSINESS UNIT']);
        console.log('  BUSINESS_UNIT:', sampleRow['BUSINESS_UNIT']);
        console.log('  Business Unit:', sampleRow['Business Unit']);
        console.log('  BU:', sampleRow['BU']);
        console.log('All columns with values:');
        columns.forEach(col => {
          if (sampleRow[col] !== undefined && sampleRow[col] !== '') {
            console.log(`  "${col}": "${sampleRow[col]}"`);
          }
        });
      }

      if (jsonData.length === 0) {
        throw new Error('The uploaded file contains no data');
      }

      // Store the uploaded file info
      setUploadedFile({
        name: file.name,
        size: file.size,
        rows: jsonData.length,
        uploadedAt: new Date().toISOString()
      });

      // Set the uploaded data for processing
      setUploadedData(jsonData);
      setLoading(false);
      setError(null);
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully loaded ${jsonData.length} rows from "${file.name}"` 
      });

      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Error processing Qualitative Analysis file:', err);
      setUploadStatus({ type: 'error', message: `Error processing file: ${err.message}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    const validExtensions = ['.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setUploadStatus({ type: 'error', message: 'Please upload a valid Excel file (.xlsx or .xls)' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: 'error', message: 'File size exceeds 10MB limit' });
      return;
    }
    processQualitativeFile(file);
  };

  // Drag and drop handlers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedData(null);
    setUploadStatus({ type: '', message: '' });
    setLoading(true);
    setError('No data available. Please upload a Qualitative Analysis Excel file.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load word bank data from the Qualitative-specific reference sheet
  const loadWordBankData = async () => {
    try {
      console.log('Loading Qualitative sentiment analysis word bank...');
      const response = await fetch('/data/Sentiment_analysis_word_bank_Qualitative.xlsx');
      if (!response.ok) {
        throw new Error(`Failed to load word bank: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      console.log('Available sheets:', workbook.SheetNames);
      
      let worksheet = workbook.Sheets['Qualitative analysis'] || 
                     workbook.Sheets['Qualitative Analysis'] || 
                     workbook.Sheets['qualitative analysis'] ||
                     workbook.Sheets[workbook.SheetNames[0]];
      
      if (!worksheet) {
        throw new Error('Could not find appropriate worksheet in word bank file');
      }
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      console.log('Qualitative word bank rows:', jsonData.length);
      
      // Group entries by the PERSPECTIVE column (row[0]) in each data row
      const wordBank = {};
      
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || row.length === 0) continue;
        
        const perspectiveVal = (row[0] || '').toString().trim();
        const ratingDescription = (row[1] || '').toString().trim();
        const positive = (row[2] || '').toString().trim();
        const negative = (row[3] || '').toString().trim();
        const neutral = (row[4] || '').toString().trim();
        
        // Skip rows that are just section headers (perspective name only, no description)
        if (!ratingDescription) continue;
        
        if (!wordBank[perspectiveVal]) {
          wordBank[perspectiveVal] = [];
        }
        
        wordBank[perspectiveVal].push({
              ratingDescription: ratingDescription.toLowerCase(),
              positive,
              negative,
              neutral
            });
      }
      
      console.log('Qualitative word bank loaded:', Object.keys(wordBank).length, 'perspectives');
      Object.entries(wordBank).forEach(([k, v]) => console.log(`  ${k}: ${v.length} entries`));
      setWordBankData(wordBank);
    } catch (error) {
      console.error('Error loading qualitative word bank:', error);
      setWordBankData({});
    }
  };

  // Valid category names that can appear in POSITIVE, NEGATIVE, NEUTRAL columns
  const VALID_CATEGORIES = new Set([
      'Collaborative Partnership',
      'Team Collaboration',
      'Team Commitment',
      'Communication Skills',
      'Proactive Approach',
      'Resource On-boarding',
      'Relationship',
      'Risk Management & Responsiveness',
      'Thought Leadership',
      'Timeline Adherence',
      'Timely Resource Fulfillment',
      'Overall Experience',
      'Quality of Delivery',
      'Resource Competency'
  ]);

  // Normalize category values from the word bank (handle case variations)
  const normalizeCategory = (val) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed === '' || trimmed === 'NA' || trimmed === 'N' || trimmed === 'N/A') return '';
    if (trimmed.toLowerCase().includes('neutral feedback was given')) return '';
    if (trimmed.toLowerCase() === 'documentation') return '';
    for (const cat of VALID_CATEGORIES) {
      if (cat.toLowerCase() === trimmed.toLowerCase()) return cat;
    }
    return '';
  };

  // Calculate similarity score between two texts
  const calculateSimilarityScore = (inputText, exampleText) => {
    const stopWords = new Set(['the', 'and', 'are', 'have', 'has', 'been', 'with', 'for', 'that', 'this', 
      'they', 'their', 'our', 'but', 'very', 'not', 'all', 'can', 'will', 'should', 'would', 'could', 
      'may', 'might', 'must', 'shall', 'was', 'were', 'its', 'from', 'also', 'into', 'more', 'some']);

    const tokenize = (text) => text.toLowerCase().split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    const inputTokens = tokenize(inputText);
    const exampleTokens = tokenize(exampleText);
    if (inputTokens.length === 0 || exampleTokens.length === 0) return 0;

    const exampleSet = new Set(exampleTokens);
    const exactMatches = inputTokens.filter(w => exampleSet.has(w)).length;

    const partialMatches = inputTokens.filter(w => 
      exampleTokens.some(ew => (ew.includes(w) || w.includes(ew)) && !exampleSet.has(w))
        ).length;
        
    // 2-word phrase matching
    const getPhrases = (tokens) => {
      const phrases = [];
      for (let i = 0; i < tokens.length - 1; i++) phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
      return phrases;
    };
    const inputPhrases = getPhrases(inputTokens);
    const examplePhrases = new Set(getPhrases(exampleTokens));
    const phraseMatches = inputPhrases.filter(p => examplePhrases.has(p)).length;

    const maxTokens = Math.max(inputTokens.length, exampleTokens.length);
    return (exactMatches * 2 + partialMatches + phraseMatches * 3) / (maxTokens * 2);
  };

  // Keyword groups mapped to specific categories for mixed-sentiment detection
  const POSITIVE_CATEGORY_PATTERNS = [
    { keywords: ['good progress', 'helpful', 'well done', 'great job', 'committed', 'dedication', 'dedicated', 'hard work', 'effort', 'motivated', 'ownership', 'punctual', 'diligent'], category: 'Team Commitment' },
    { keywords: ['collaborative', 'collaboration', 'collaborator', 'team work', 'teamwork', 'working together', 'partnership', 'partner', 'strong partner', 'cooperat', 'pleasure', 'no issues', 'no complaints', 'always a pleasure', 'enjoyable', 'pleasure to work with', 'professionalism', 'professional', 'transparent', 'candor', 'ambassador', 'appreciate', 'appreciate their', 'amazing resource', 'excellent resource', 'good job', 'done a good job', 'committed', 'maintaining quality', 'essential to our', 'major asset', 'long term', 'asset to our', 'worked with this team', 'consistent', 'high-caliber', 'willingness to learn', 'curiosity', 'support our', 'leadership', 'ongoing collaboration'], category: 'Team Collaboration' },
    { keywords: ['proactive', 'initiative', 'anticipat', 'ahead of time', 'self-driven', 'self driven', 'go above and beyond', 'above and beyond'], category: 'Proactive Approach' },
    { keywords: ['communicat', 'transparent', 'updates', 'status meeting', 'weekly meeting', 'regular meeting', 'clear communication', 'responsive'], category: 'Communication Skills' },
    { keywords: ['quality', 'high quality', 'excellent work', 'deliver', 'deliverables', 'accuracy', 'reliable output', 'bug free', 'zero defect', 'best practice', 'velocity'], category: 'Quality of Delivery' },
    { keywords: ['on time', 'timely', 'timeline', 'timelines', 'deadline', 'schedule', 'milestone', 'punctual delivery', 'originally promised', 'deliver on these', 'longer to deliver', 'on track', 'staying on track', 'keeping on track', 'keeping everyone on track', 'steadily improved', 'deliveries'], category: 'Timeline Adherence' },
    { keywords: ['resource fulfil', 'resource fulfill', 'staffing', 'ramp up', 'onboard', 'onboarding', 'quick replacement', 'filled position', 'stabilized', 'addition of', 'foster', 'develop that team', 'team has stabilized', 'build the team', 'growing the team', 'added resource', 'resources onboarded', 'transition', 'integration of', 'selection process', 'contribute immediately', 'prepared to contribute', 'successful onboarding', 'stability', 'new employees', 'new hires', 'new team member', 'on time', 'hassle-free', 'hassle free'], category: 'Timely Resource Fulfillment' },
    { keywords: ['skilled', 'competent', 'knowledgeable', 'experienced', 'expert', 'capable', 'technical skill', 'strong skill', 'talent pool', 'talent', 'great talent', 'good resource', 'strong resource', 'qualified', 'up to speed', 'getting up to speed', 'quickly', 'quick learner', 'address issues', 'work to address', 'resource', 'not a single issue', 'no issues faced', 'learning curve', 'training', 'technical domain', 'new members'], category: 'Resource Competency' },
    { keywords: ['risk', 'mitigat', 'escalat', 'resolve', 'contingency', 'responsive to issue'], category: 'Risk Management & Responsiveness' },
    { keywords: ['innovat', 'thought leader', 'thought leaders', 'creative', 'new idea', 'suggest', 'recommend', 'value add', 'beyond scope', 'process improvement', 'process improvements', 'leaders in this space'], category: 'Thought Leadership' },
    { keywords: ['relationship', 'rapport', 'trust', 'comfortable', 'friendly', 'approachable'], category: 'Relationship' }
  ];

  const NEGATIVE_CATEGORY_PATTERNS = [
    { keywords: ['needs improvement', 'need improvement', 'areas of improvement', 'area of improvement', 'room for improvement', 'opportunities for improvement', 'scope for improvement', 'needs work', 'could be better', 'could improve', 'lacking', 'shortcoming', 'fail to test', 'fail to deliver', 'test their code', 'code quality'], category: 'Quality of Delivery' },
    { keywords: ['delay', 'late', 'missed deadline', 'behind schedule', 'not on time', 'slippage', 'overdue'], category: 'Timeline Adherence' },
    { keywords: ['security issue', 'risk exposure', 'incident', 'outage', 'downtime', 'unresponsive', 'no escalation'], category: 'Risk Management & Responsiveness' },
    { keywords: ['communication gap', 'lack of communication', 'poor communication', 'not transparent', 'no update', 'unclear'], category: 'Communication Skills' },
    { keywords: ['resource issue', 'skill gap', 'not skilled', 'incompetent', 'inexperienced', 'needed to replace', 'lack of skills', 'not having required', 'attrition'], category: 'Resource Competency' },
    { keywords: ['staffing delay', 'resource not available', 'unfilled position', 'slow onboard', 'replacement delay'], category: 'Timely Resource Fulfillment' },
    { keywords: ['no innovation', 'not proactive', 'reactive', 'no suggestion', 'no initiative', 'not a strength', 'innovation is not', 'not innovative', 'solve problems is not'], category: 'Thought Leadership' },
    { keywords: ['poor', 'bad', 'terrible', 'awful', 'disappointing', 'frustrating', 'unsatisfied', 'unhappy', 'displeased', 'problem', 'complaint', 'below expectation', 'not satisfied'], category: 'Overall Experience' }
  ];

  // Detect the best positive category from text using keyword patterns
  const detectPositiveCategory = (textLower, perspective) => {
    let bestCat = '';
    let bestHits = 0;
    for (const group of POSITIVE_CATEGORY_PATTERNS) {
      const hits = group.keywords.filter(k => textLower.includes(k)).length;
      if (hits > bestHits) { bestHits = hits; bestCat = group.category; }
    }
    if (bestHits === 0 && VALID_CATEGORIES.has(perspective)) return perspective;
    return bestCat;
  };

  // Detect the best negative category from text using keyword patterns
  const detectNegativeCategory = (textLower, perspective) => {
    let bestCat = '';
    let bestHits = 0;
    for (const group of NEGATIVE_CATEGORY_PATTERNS) {
      const hits = group.keywords.filter(k => textLower.includes(k)).length;
      if (hits > bestHits) { bestHits = hits; bestCat = group.category; }
    }
    if (bestHits === 0 && VALID_CATEGORIES.has(perspective)) return perspective;
    return bestCat;
  };

  // Check if text has positive indicators (with negation awareness)
  const hasPositiveSignals = (textLower) => {
    const posWords = ['excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding',
      'perfect', 'satisfied', 'happy', 'pleased', 'impressed', 'helpful', 'professional', 'skilled',
      'competent', 'knowledgeable', 'experienced', 'timely', 'efficient', 'effective', 'reliable',
      'supportive', 'responsive', 'proactive', 'dedicated', 'committed', 'quality', 'superior',
      'brilliant', 'strong', 'confident', 'trust', 'appreciate', 'well done', 'good progress',
      'good job', 'great job', 'collaborative', 'seamless', 'stabilized', 'addition of',
      'foster', 'develop that', 'develop the', 'continue to see', 'well established', 'matured',
      'pleasure', 'no issues', 'no complaints', 'smooth', 'enjoyable', 'satisified',
      'acceptable', 'adequate', 'suffici', 'up to speed', 'quickly',
      'address issues', 'work to address', 'marking as satisfied',
      'gets a 5', 'score of 5', 'rating of 5', 'won\'t score this lower',
      'delivered', 'on track', 'steadily improved', 'has improved', 'have improved',
      'transparent', 'willingness to learn', 'curiosity', 'devoted', 'motivated', 'proud',
      'training', 'better positioned', 'learning curve', 'on time', 'hassle-free', 'hassle free'];
    let count = posWords.filter(k => textLower.includes(k)).length;

    // Negation phrases that negate/cancel positive sentiment in the text
    const negationPhrases = ['not a strength', 'is not a strength', 'not recognized',
      'not evident', 'no longer', 'not proactive', 'not helpful', 'not reliable',
      'not effective', 'not efficient', 'not responsive', 'not satisfied', 'fail to'];
    const negations = negationPhrases.filter(p => textLower.includes(p)).length;

    return Math.max(0, count - negations);
  };

  // Check if text has negative indicators (with neutralization awareness)
  const hasNegativeSignals = (textLower) => {
    const negWords = ['poor', 'bad', 'terrible', 'awful', 'disappointing', 'frustrating', 'unsatisfied',
      'unhappy', 'displeased', 'disappointed', 'incompetent', 'inexperienced', 'inadequate',
      'delayed', 'inefficient', 'ineffective', 'unreliable', 'unresponsive',
      'problem', 'complaint', 'needed to replace', 'lack of skills', 'skill gap',
      'needs improvement', 'need improvement', 'areas of improvement', 'room for improvement',
      'opportunities for improvement', 'scope for improvement', 'needs work', 'below expectation',
      'could be better', 'could improve', 'can be improved', 'should be improved',
      'needs to be improved', 'hope to see improvement', 'should improve',
      'not satisfied', 'lacking', 'shortcoming', 'not up to the mark',
      'not a strength', 'is not a strength', 'not proactive', 'not recognized',
      'fail to', 'still fail', 'failed'];
    let count = negWords.filter(k => textLower.includes(k)).length;

    // Neutralization phrases that excuse/cancel negative sentiment
    const neutralizers = ['in no way', 'doesn\'t reflect', 'does not reflect',
      'don\'t think it reflects', 'do not think it reflects',
      'not their fault', 'not the team', 'no fault of',
      'not because of them', 'not due to them', 'don\'t blame',
      'understand the situation', 'understandable'];
    const neutralizations = neutralizers.filter(p => textLower.includes(p)).length;

    return Math.max(0, count - neutralizations);
  };

  // Sentiment analysis using the Qualitative word bank
  const analyzeSentiment = (text, perspective) => {
    if (!text || text === 'N/A' || text === '') return { positive: '', negative: '', neutral: '' };

    const textLower = text.toLowerCase();

    // Explicit neutral declarations override all other analysis
    const neutralDeclarations = [
      'assessment is neutral', 'overall assessment is neutral', 'my assessment is neutral',
      'overall neutral', 'i would say neutral', 'rating is neutral', 'i am neutral',
      'neither positive nor negative', 'balanced view', 'taking both into account'
    ];
    if (neutralDeclarations.some(phrase => textLower.includes(phrase))) {
      const neutralCategory = VALID_CATEGORIES.has(perspective) ? perspective : 'Overall Experience';
      return { positive: '', negative: '', neutral: neutralCategory };
    }

    if (!wordBankData || Object.keys(wordBankData).length === 0) {
      return fallbackSentiment(text, perspective);
    }

    const MATCH_THRESHOLD = 0.15;
    let bestMatch = null;
    let bestScore = 0;

    // Search in the same perspective first, then across all
    const searchOrder = [];
    if (wordBankData[perspective]) searchOrder.push(wordBankData[perspective]);
    for (const [perspKey, entries] of Object.entries(wordBankData)) {
      if (perspKey !== perspective) searchOrder.push(entries);
    }

    for (const entries of searchOrder) {
      for (const entry of entries) {
        const score = calculateSimilarityScore(text, entry.ratingDescription);
        if (score > bestScore && score > MATCH_THRESHOLD) {
          bestScore = score;
          bestMatch = entry;
        }
      }
    }

    let result = { positive: '', negative: '', neutral: '' };
        
        if (bestMatch) {
      result = {
        positive: normalizeCategory(bestMatch.positive),
        negative: normalizeCategory(bestMatch.negative),
        neutral: normalizeCategory(bestMatch.neutral)
      };
    }

    // Validate word bank results against actual keyword signals in the text
    const posSignals = hasPositiveSignals(textLower);
    const negSignals = hasNegativeSignals(textLower);

    // If text has no actual negative keywords, clear any word-bank-sourced negative
    if (negSignals === 0 && result.negative) {
      result.negative = '';
    }

    // Use keyword patterns for category mapping (more reliable than word bank for categories)
    if (posSignals > 0) {
      result.positive = detectPositiveCategory(textLower, perspective);
    }
    if (negSignals > 0) {
      result.negative = detectNegativeCategory(textLower, perspective);
    }

    // If still nothing detected, use fallback
    if (!result.positive && !result.negative && !result.neutral) {
      return fallbackSentiment(text, perspective);
    }

    return result;
  };

  // Keyword-based fallback when word bank has no match
  const fallbackSentiment = (text, perspective) => {
    const textLower = text.toLowerCase();
    const posCount = hasPositiveSignals(textLower);
    const negCount = hasNegativeSignals(textLower);

    let positive = '';
    let negative = '';
    let neutral = '';

    if (posCount > 0) {
      positive = detectPositiveCategory(textLower, perspective);
    }
    if (negCount > 0) {
      negative = detectNegativeCategory(textLower, perspective);
    }

    // If neither detected, mark as neutral
    if (!positive && !negative) {
      neutral = VALID_CATEGORIES.has(perspective) ? perspective : 'Overall Experience';
    }

    return { positive, negative, neutral };
  };

  useEffect(() => {
    console.log('=== Qualitative Analysis Dashboard useEffect ===');
    console.log('excelData:', excelData);
    console.log('excelData type:', typeof excelData);
    console.log('excelData.data:', excelData?.data);
    console.log('excelData.data type:', typeof excelData?.data);
    console.log('isArray:', Array.isArray(excelData?.data));
    console.log('excelData keys:', excelData ? Object.keys(excelData) : 'null');
    
    // Load word bank data first
    loadWordBankData();
    
    // If a file was already uploaded, don't override with excelData prop
    if (uploadedFile) {
      console.log('=== Using uploaded file data ===');
      return;
    }
    
    // Check if excelData is directly an array (like some other dashboards)
    if (Array.isArray(excelData)) {
      console.log('=== Data is directly an array ===');
      setUploadedData(excelData);
      setLoading(false);
      setError(null);
      console.log('Data length:', excelData.length);
      console.log('Sample data:', excelData[0]);
    } else if (excelData && excelData.data && Array.isArray(excelData.data)) {
      console.log('=== Data is in excelData.data ===');
      setUploadedData(excelData.data);
      setLoading(false);
      setError(null);
      console.log('Data length:', excelData.data.length);
      console.log('Sample data:', excelData.data[0]);
    } else {
      console.log('=== Qualitative Analysis Dashboard: No valid data, showing upload option ===');
      setError(null);
      setLoading(false);
    }
  }, [excelData, uploadedFile]);

  // Date comparison function
  const isDateGreaterThanOrEqual = (dateStr, compareDateStr) => {
    if (!dateStr || dateStr === 'N/A' || !compareDateStr) return true;
    
    try {
      const date = new Date(dateStr);
      const compareDate = new Date(compareDateStr);
      
      // Check if dates are valid
      if (isNaN(date.getTime()) || isNaN(compareDate.getTime())) {
        return true; // If date is invalid, include the row
      }
      
      return date >= compareDate;
    } catch (error) {
      console.log('Date comparison error:', error);
      return true; // If error, include the row
    }
  };

  // Process data to show only the required columns from CSAT received Report sheet
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) {
      return [];
    }

    console.log('=== Processing Qualitative Analysis Data ===');
    console.log('Source: CSAT received Report sheet from uploaded Excel file');
    console.log('Total rows to process:', uploadedData.length);
    console.log('Sample row keys:', uploadedData[0] ? Object.keys(uploadedData[0]) : 'No data');
    console.log('Sample row data:', uploadedData[0]);
    console.log('CSAT Cycle Start Date:', csatCycleStartDate);

    // Process the data to show only the required columns
    const result = uploadedData
      .filter(row => {
        // Filter based on CSAT cycle start date
        const csatSentDate = row['CSAT SENT DATE'];
        const csatReceivedDate = row['CSAT RECEIVED DATE'];
        
        // If no CSAT cycle start date is set, include all rows
        if (!csatCycleStartDate) {
          return true;
        }
        
        // Check if both dates are greater than or equal to CSAT cycle start date
        const sentDateValid = isDateGreaterThanOrEqual(csatSentDate, csatCycleStartDate);
        const receivedDateValid = isDateGreaterThanOrEqual(csatReceivedDate, csatCycleStartDate);
        
        console.log('Date filtering:', {
          csatSentDate,
          csatReceivedDate,
          csatCycleStartDate,
          sentDateValid,
          receivedDateValid,
          include: sentDateValid && receivedDateValid
        });
        
        return sentDateValid && receivedDateValid;
      })
      .map((row, index) => {
        // Get the rating description and perspective for sentiment analysis
        const ratingDescription = row['RATING_DESCRIPTION'] || 'N/A';
        const perspective = row['PERSPECTIVE'] || 'N/A';
        const sentiment = analyzeSentiment(ratingDescription, perspective);
        
        // Calculate category based on the specified logic
        const resourceCompetency = row['Resource Competency'] || 0;
        const timelyResourceFulfillment = row['Timely Resource Fulfillment'] || 0;
        const overallExperience = row['Overall Experience'] || 0;
        
        const isZeroOrBlank = (value) => {
          return value === 0 || value === '' || value === 'N/A' || value === null || value === undefined;
        };
        
        const category = (isZeroOrBlank(resourceCompetency) && 
                         isZeroOrBlank(timelyResourceFulfillment) && 
                         isZeroOrBlank(overallExperience)) ? 1 : 2;

        // Prefer SENTIMENT CATEGORY from uploaded sheet for bucket analysis (Areas of Improvement / Strength)
        const sheetSentimentCategory = row['SENTIMENT CATEGORY'] || row['SENTIMENT_CATEGORY'] ||
          row['Sentiment Category'] || row['sentiment category'] || row['SentimentCategory'] ||
          row['Sentiment_Category'] || row['Category'] || '';
        const sheetSentimentType = row['SENTIMENT TYPE'] || row['SENTIMENT_TYPE'] ||
          row['Sentiment Type'] || row['sentiment type'] || row['SentimentType'] ||
          row['Sentiment_Type'] || '';

        // Determine SENTIMENT TYPE and SENTIMENT CATEGORY - use uploaded sheet columns when present
        let sentimentType = 'Neutral';
        let sentimentCategory = '';

        if (sheetSentimentCategory && String(sheetSentimentCategory).trim()) {
          // Use SENTIMENT CATEGORY from uploaded sheet for Category in bucket analysis dashboards
          sentimentCategory = String(sheetSentimentCategory).trim();
          if (sheetSentimentType && String(sheetSentimentType).trim()) {
            sentimentType = String(sheetSentimentType).trim();
          } else {
            // SENTIMENT TYPE not in sheet - derive from sentiment analysis for bucket routing
            if (sentiment.positive) sentimentType = 'Positive';
            else if (sentiment.negative) sentimentType = 'Negative';
            else sentimentType = 'Neutral';
          }
        }

        if (!sentimentCategory) {
          // Fallback: derive from sentiment analysis when sheet has no SENTIMENT CATEGORY
          if (sentiment.positive) {
            sentimentType = 'Positive';
            sentimentCategory = sentiment.positive;
          } else if (sentiment.negative) {
            sentimentType = 'Negative';
            sentimentCategory = sentiment.negative;
          } else if (sentiment.neutral) {
            sentimentType = 'Neutral';
            sentimentCategory = sentiment.neutral;
          }
        }

        // If no category found, use perspective as fallback
        if (!sentimentCategory) {
          sentimentCategory = perspective !== 'N/A' ? perspective : 'General';
        }

        // Handle various column name formats for CUSTOMER NAME and BUSINESS UNIT
        const customerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['CUST_NM'] || 
                            row['Customer Name'] || row['customer name'] || row['CustomerName'] ||
                            row['Account Name'] || row['ACCOUNT NAME'] || row['Account_Name'] || 'N/A';
        
        const businessUnit = row['BUSINESS UNIT'] || row['BUSINESS_UNIT'] || row['BUSSINESS UNIT'] || 
                            row['Business Unit'] || row['business unit'] || row['BusinessUnit'] ||
                            row['BU'] || row['Bu'] || 'N/A';

        return {
          sNo: index + 1,
          businessUnit: businessUnit,
          customerId: row['CUSTOMER_ID'] || row['CUST_ID'] || row['Customer_ID'] || 'N/A',
          customerName: customerName,
          projId: row['PROJ_ID'] || row['Project_ID'] || row['PROJECT_ID'] || 'N/A',
          category: category,
          projectName: row['PROJECT NAME'] || row['PROJECT_NAME'] || row['Project Name'] || row['ProjectName'] || 'N/A',
          respondentName: row['RESPONDENT NAME'] || row['RESPONDENT_NAME'] || row['Respondent Name'] || row['RespondentName'] || 'N/A',
          perspective: perspective,
          ratingDescription: ratingDescription,
          rating: row['RATING'] || row['Rating'] || 'N/A',
          sentimentType: sentimentType,
          sentimentCategory: sentimentCategory,
          csatSentDate: row['CSAT SENT DATE'] || row['CSAT_SENT_DATE'] || row['CSS_SENT_DATE'] || 'N/A',
          csatReceivedDate: row['CSAT RECEIVED DATE'] || row['CSAT_RECEIVED_DATE'] || row['CSS_RECEIVED_DATE'] || 'N/A',
          positive: sentiment.positive,
          negative: sentiment.negative,
          neutral: sentiment.neutral
        };
      });

    console.log('Processed data length:', result.length);
    console.log('Sample processed row:', result[0]);
    console.log('First 5 rows:', result.slice(0, 5));
    console.log('All processed data:', result);

    // Sort by Business Unit in the specified order
    const businessUnitOrder = ['Healthcare', 'India & GCC', 'CIT', 'Tech'];
    
    const sortedResult = result.sort((a, b) => {
      const aIndex = businessUnitOrder.indexOf(a.businessUnit);
      const bIndex = businessUnitOrder.indexOf(b.businessUnit);
      
      // If both are in the order array, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one is in the order array, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither is in the order array, sort alphabetically
      return a.businessUnit.localeCompare(b.businessUnit);
    });

    console.log('Data sorted by Business Unit order:', businessUnitOrder);
    console.log('Sorted data length:', sortedResult.length);

    return sortedResult;
  }, [uploadedData, csatCycleStartDate, wordBankData]);

  // Filter data based on search criteria
  const filteredData = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return [];
    }

    return processedData.filter(row => {
      const matchesCustomerName = customerNameFilter === '' || 
        row.customerName.toLowerCase().includes(customerNameFilter.toLowerCase());
      
      const matchesProjectName = projectNameFilter === '' || 
        row.projectName.toLowerCase().includes(projectNameFilter.toLowerCase());
      
      const matchesPerspective = perspectiveFilter === '' || 
        row.perspective.toLowerCase().includes(perspectiveFilter.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || 
        row.category.toString() === categoryFilter;

      return matchesCustomerName && matchesProjectName && matchesPerspective && matchesCategory;
    });
  }, [processedData, customerNameFilter, projectNameFilter, perspectiveFilter, categoryFilter]);

  // Process data for Org Level - Perspective wise Qualitative Analysis
  const orgLevelData = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return [];
    }

    console.log('=== Processing Org Level Data ===');
    console.log('Source: Processed Qualitative Analysis data');
    console.log('Total rows to process:', processedData.length);

    // Group by PERSPECTIVE and count positive/negative comments
    const perspectiveGroups = {};
    
    processedData.forEach(row => {
      const perspective = row.perspective || 'N/A';
      
      // Skip Overall Experience and Qualitative Feedback perspectives
      if (perspective === 'Overall Experience' || perspective === 'Qualitative Feedback') {
        console.log('Skipping perspective:', perspective);
        return;
      }
      
      if (!perspectiveGroups[perspective]) {
        perspectiveGroups[perspective] = {
          perspective: perspective,
          positiveCount: 0,
          negativeCount: 0
        };
      }
      
      // Count positive comments
      if (row.positive && row.positive.trim() !== '') {
        perspectiveGroups[perspective].positiveCount++;
      }
      
      // Count negative comments
      if (row.negative && row.negative.trim() !== '') {
        perspectiveGroups[perspective].negativeCount++;
      }
    });

    // Convert to array and add S No. and percentage calculations
    const result = Object.values(perspectiveGroups).map((group, index) => {
      const totalComments = group.positiveCount + group.negativeCount;
      const pPercentage = totalComments > 0 ? (group.positiveCount / totalComments) * 100 : 0;
      const nPercentage = totalComments > 0 ? (group.negativeCount / totalComments) * 100 : 0;
      const deltaPercentage = pPercentage - nPercentage;

      // Calculate Remarks based on Delta percentage
      let remarks = '';
      if (deltaPercentage >= 50) {
        remarks = 'Strength';
      } else if (deltaPercentage >= 10 && deltaPercentage < 50) {
        remarks = 'Need to build on';
      } else if (deltaPercentage >= -50 && deltaPercentage < -20) {
        remarks = 'Area for Improvement';
      } else if (deltaPercentage < -50) {
        remarks = 'Needs focus';
      } else {
        remarks = 'Neutral'; // For cases between -20% and 10%
      }

      return {
        sNo: index + 1,
        perspective: group.perspective,
        positiveCount: group.positiveCount,
        negativeCount: group.negativeCount,
        pPercentage: Math.round(pPercentage * 100) / 100, // Round to 2 decimal places
        nPercentage: Math.round(nPercentage * 100) / 100, // Round to 2 decimal places
        deltaPercentage: Math.round(deltaPercentage * 100) / 100, // Round to 2 decimal places
        remarks: remarks
      };
    });

    // Sort by perspective name
    result.sort((a, b) => a.perspective.localeCompare(b.perspective));

    // Reassign SNO after sorting to maintain sequential order
    result.forEach((group, index) => {
      group.sNo = index + 1;
    });

    console.log('Org Level data processed:', result.length, 'perspectives');
    console.log('Sample org level data:', result[0]);
    console.log('All org level data:', result);

    return result;
  }, [processedData]);

  // Process Bucket Analysis data - Areas of Improvement (Negative) and Strength (Positive)
  // New structure: Group by Category, show Count, Accounts, and Respondent Names
  const bucketAnalysisData = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return { negative: [], positive: [], combined: [] };
    }

    console.log('=== Processing Bucket Analysis Data ===');

    // Process Negative (Areas of Improvement) - group by Category
    const negativeByCategory = {};
    const positiveByCategory = {};

    processedData.forEach(row => {
      const category = row.sentimentCategory || 'Other';
      const accountName = row.customerName || 'N/A';
      const respondentName = row.respondentName || 'N/A';

      // Process Negative sentiment
      if (row.sentimentType === 'Negative') {
        if (!negativeByCategory[category]) {
          negativeByCategory[category] = {
            category: category,
            count: 0,
            accounts: new Set(),
            respondents: new Set()
          };
        }
        negativeByCategory[category].count += 1;
        if (accountName !== 'N/A') negativeByCategory[category].accounts.add(accountName);
        if (respondentName !== 'N/A') negativeByCategory[category].respondents.add(respondentName);
      }

      // Process Positive sentiment
      if (row.sentimentType === 'Positive') {
        if (!positiveByCategory[category]) {
          positiveByCategory[category] = {
            category: category,
            count: 0,
            accounts: new Set(),
            respondents: new Set()
          };
        }
        positiveByCategory[category].count += 1;
        if (accountName !== 'N/A') positiveByCategory[category].accounts.add(accountName);
        if (respondentName !== 'N/A') positiveByCategory[category].respondents.add(respondentName);
      }
    });

    // Convert to arrays, convert Sets to comma-separated strings, and sort by count descending
    const negativeData = Object.values(negativeByCategory)
      .map(item => ({
        category: item.category,
        count: item.count,
        accounts: Array.from(item.accounts).sort().join(', '),
        respondents: Array.from(item.respondents).sort().join(', ')
      }))
      .sort((a, b) => b.count - a.count);

    const positiveData = Object.values(positiveByCategory)
      .map(item => ({
        category: item.category,
        count: item.count,
        accounts: Array.from(item.accounts).sort().join(', '),
        respondents: Array.from(item.respondents).sort().join(', ')
      }))
      .sort((a, b) => b.count - a.count);

    // Create combined view - all unique categories with both negative and positive counts
    const allCategories = new Set([
      ...Object.keys(negativeByCategory),
      ...Object.keys(positiveByCategory)
    ]);

    const combinedData = Array.from(allCategories)
      .map(category => {
        const negData = negativeByCategory[category];
        const posData = positiveByCategory[category];
        const negCount = negData ? negData.count : 0;
        const posCount = posData ? posData.count : 0;
        const totalComments = negCount + posCount;
        const pPercentage = totalComments > 0 ? (posCount / totalComments) * 100 : 0;
        const nPercentage = totalComments > 0 ? (negCount / totalComments) * 100 : 0;
        const deltaPercentage = pPercentage - nPercentage;

        // Calculate Remarks based on Delta percentage (legend conditions)
        // Delta > 50%: Strength | 20% ≤ Delta ≤ 50%: Need to build on | Delta ≤ -50%: Area for Improvement
        // -50% < Delta ≤ -20%: Needs focus | -19% ≤ Delta ≤ 19%: Subjective Decision
        let remarks = '';
        if (deltaPercentage > 50) {
          remarks = 'Strength';
        } else if (deltaPercentage <= -50) {
          remarks = 'Area for Improvement';
        } else if (deltaPercentage <= -20) {
          remarks = 'Needs focus';
        } else if (deltaPercentage >= 20) {
          remarks = 'Need to build on';
        } else {
          remarks = 'Subjective Decision';
        }

        return {
          category: category,
          positiveCount: posCount,
          negativeCount: negCount,
          pPercentage: Math.round(pPercentage * 100) / 100,
          nPercentage: Math.round(nPercentage * 100) / 100,
          deltaPercentage: Math.round(deltaPercentage * 100) / 100,
          remarks: remarks
        };
      })
      .sort((a, b) => a.category.localeCompare(b.category));

    console.log('Negative categories:', negativeData.length);
    console.log('Positive categories:', positiveData.length);
    console.log('Combined categories:', combinedData.length);
    console.log('Combined data:', combinedData);

    return {
      negative: negativeData,
      positive: positiveData,
      combined: combinedData
    };
  }, [processedData]);

  const buildUpdatedRemarksBucketSummary = (data, viewType, sourceField) => {
    const rows = Array.isArray(data) ? data : [];
    const groups = {};
    rows.forEach((row) => {
      const rawCat = row && row[sourceField];
      if (!rawCat) return;
      const cats = String(rawCat)
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c);
      const customerName =
        row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['CUST_NM'] ||
        row['Customer Name'] || row['customer name'] || row['CustomerName'] ||
        row['Account Name'] || row['ACCOUNT NAME'] || row['Account_Name'] || 'N/A';
      const businessUnit =
        row['BUSINESS UNIT'] || row['BUSINESS_UNIT'] || row['BUSSINESS UNIT'] ||
        row['Business Unit'] || row['business unit'] || row['BusinessUnit'] ||
        row['BU'] || row['Bu'] || 'N/A';
      const respondentName =
        row['RESPONDENT NAME'] || row['RESPONDENT_NAME'] || row['Respondent Name'] || row['RespondentName'] || 'N/A';
      cats.forEach((cat) => {
        const key = `${viewType}||${cat}`;
        if (!groups[key]) {
          groups[key] = {
            category: cat,
            count: 0,
            groups: new Set(),
            respondentNames: new Set()
          };
        }
        groups[key].count += 1;
        if (viewType === 'account' && customerName && customerName !== 'N/A') {
          groups[key].groups.add(customerName);
        }
        if (viewType === 'bu' && businessUnit && businessUnit !== 'N/A') {
          groups[key].groups.add(businessUnit);
        }
        if (respondentName && respondentName !== 'N/A') {
          groups[key].respondentNames.add(respondentName);
        }
      });
    });
    const result = Object.values(groups).map((g) => ({
      category: g.category,
      count: g.count,
      groups: Array.from(g.groups).sort(),
      respondentNames: Array.from(g.respondentNames).sort()
    }));
    result.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
    return result;
  };

  const updatedNegativeAccountData = useMemo(() => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) return [];
    return buildUpdatedRemarksBucketSummary(updatedRemarksData, 'account', 'NEGATIVE (Areas of Improvement)');
  }, [updatedRemarksData]);

  const updatedNegativeBUData = useMemo(() => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) return [];
    return buildUpdatedRemarksBucketSummary(updatedRemarksData, 'bu', 'NEGATIVE (Areas of Improvement)');
  }, [updatedRemarksData]);

  const updatedPositiveAccountData = useMemo(() => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) return [];
    return buildUpdatedRemarksBucketSummary(updatedRemarksData, 'account', 'POSITIVE (Strength)');
  }, [updatedRemarksData]);

  const updatedPositiveBUData = useMemo(() => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) return [];
    return buildUpdatedRemarksBucketSummary(updatedRemarksData, 'bu', 'POSITIVE (Strength)');
  }, [updatedRemarksData]);

  // Combined by common category: all categories from NEGATIVE and POSITIVE Updated Bucket Analysis,
  // with counts and derived P%, N%, Delta %, and Remarks
  const combinedUpdatedBucketData = useMemo(() => {
    const negMap = new Map();
    (updatedNegativeAccountData || []).forEach((row) => {
      if (!row || row.category == null) return;
      const cat = String(row.category).trim();
      if (!cat) return;
      negMap.set(cat, (negMap.get(cat) || 0) + (row.count || 0));
    });
    const posMap = new Map();
    (updatedPositiveAccountData || []).forEach((row) => {
      if (!row || row.category == null) return;
      const cat = String(row.category).trim();
      if (!cat) return;
      posMap.set(cat, (posMap.get(cat) || 0) + (row.count || 0));
    });
    const allCats = new Set([...negMap.keys(), ...posMap.keys()]);
    return Array.from(allCats).sort((a, b) => a.localeCompare(b)).map((cat) => {
      const negativeCount = negMap.get(cat) || 0;
      const positiveCount = posMap.get(cat) || 0;
      const total = negativeCount + positiveCount;
      const pPercent = total > 0 ? (negativeCount / total) * 100 : 0;
      const nPercent = total > 0 ? (positiveCount / total) * 100 : 0;
      const deltaPercent = pPercent - nPercent;
      const roundedP = Math.round(pPercent * 100) / 100;
      const roundedN = Math.round(nPercent * 100) / 100;
      const roundedDelta = Math.round(deltaPercent * 100) / 100;
      let remarks = '';
      if (roundedDelta > 50) {
        remarks = 'Strength';
      } else if (roundedDelta >= 20 && roundedDelta <= 50) {
        remarks = 'Need to build on (Potential to become Strength)';
      } else if (roundedDelta <= -50) {
        remarks = 'Area for Improvement';
      } else if (roundedDelta <= -20) {
        remarks = 'Needs focus (Likely to become Area of Improvement)';
      } else {
        remarks = 'Subjective Decision';
      }
      return {
        category: cat,
        negativeCount,
        positiveCount,
        pPercent: roundedP,
        nPercent: roundedN,
        deltaPercent: roundedDelta,
        remarks
      };
    });
  }, [updatedNegativeAccountData, updatedPositiveAccountData]);

  // Chart data for Combined Category Analysis - P% and N% stacked bar (horizontal)
  const combinedChartData = useMemo(() => {
    if (!bucketAnalysisData.combined || bucketAnalysisData.combined.length === 0) return [];
    return bucketAnalysisData.combined.map(row => {
      let p = typeof row.pPercentage === 'number' ? row.pPercentage : parseFloat(row.pPercentage) || 0;
      let n = typeof row.nPercentage === 'number' ? row.nPercentage : parseFloat(row.nPercentage) || 0;
      p = Math.max(0, Math.min(100, Number(p)));
      n = Math.max(0, Math.min(100, Number(n)));
      return {
        category: row.category || '',
        pPercent: parseFloat(p.toFixed(2)),
        nPercent: parseFloat(n.toFixed(2))
      };
    });
  }, [bucketAnalysisData.combined]);

  const combinedChartRef = useRef(null);
  const updatedCombinedChartRef = useRef(null);

  const downloadCombinedChartImage = async () => {
    if (!combinedChartRef.current) {
      alert('No chart available to download');
      return;
    }
    try {
      const canvas = await html2canvas(combinedChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        link.href = url;
        link.download = `Qualitative_Combined_Category_Analysis_Chart_${yyyy}-${mm}-${dd}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  const downloadUpdatedCombinedChartImage = async () => {
    if (!updatedCombinedChartRef.current) {
      alert('No chart available to download');
      return;
    }
    try {
      const canvas = await html2canvas(updatedCombinedChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        link.href = url;
        link.download = `Qualitative_Updated_Combined_Category_Analysis_Chart_${yyyy}-${mm}-${dd}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading updated combined chart:', error);
      alert('Error downloading updated combined chart image');
    }
  };

  const downloadData = async () => {
    try {
      if (processedData.length === 0) {
        alert('No data available to download');
        return;
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Qualitative Analysis');
      
      // Define headers - including SENTIMENT TYPE and SENTIMENT CATEGORY after RATING
      const headers = [
        'S No.',
        'Business Unit',
        'Account Name',
        'PROJECT NAME',
        'Category',
        'RESPONDENT NAME',
        'PERSPECTIVE',
        'RATING_DESCRIPTION',
        'RATING',
        'SENTIMENT TYPE',
        'SENTIMENT CATEGORY',
        'POSITIVE (Strength)',
        'NEGATIVE (Areas of Improvement)',
        'NEUTRAL'
      ];
      
      // Add headers
      worksheet.addRow(headers);
      
      const thinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Style the header row: dark cornflower blue background, white bold font, centered, word wrap
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerRow.eachCell((cell) => {
        cell.border = thinBorder;
      });
      
      // Column alignment definitions: center for numeric, left for text
      // Cols: 1=S No.(center), 2=BU(left), 3=Account(left), 4=Project(left), 5=Category(center),
      //       6=Respondent(left), 7=Perspective(left), 8=RatingDesc(left), 9=Rating(center),
      //       10=SentimentType(center), 11=SentimentCategory(left), 12=Positive(left), 13=Negative(left), 14=Neutral(left)
      const colAlignments = {
        1: 'center', 2: 'left', 3: 'left', 4: 'left', 5: 'center',
        6: 'left', 7: 'left', 8: 'left', 9: 'center',
        10: 'center', 11: 'left', 12: 'left', 13: 'left', 14: 'left'
      };
      
      // Add data rows - including sentimentType and sentimentCategory after rating
      processedData.forEach((row) => {
        const dataRow = worksheet.addRow([
          row.sNo,
          row.businessUnit,
          row.customerName,
          row.projectName,
          row.category,
          row.respondentName,
          row.perspective,
          row.ratingDescription,
          row.rating,
          row.sentimentType,
          row.sentimentCategory,
          row.positive,
          row.negative,
          row.neutral
        ]);
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Apply color coding for SENTIMENT TYPE column (column 10)
          if (colNumber === 10) {
            const sentimentValue = row.sentimentType;
            if (sentimentValue === 'Positive') {
              cell.font = { color: { argb: 'FF16a34a' }, bold: true };
            } else if (sentimentValue === 'Negative') {
              cell.font = { color: { argb: 'FFdc2626' }, bold: true };
            } else {
              cell.font = { color: { argb: 'FFd97706' }, bold: true };
            }
          }
          cell.alignment = {
            horizontal: colAlignments[colNumber] || 'left',
            vertical: 'top',
            wrapText: true
          };
          cell.border = thinBorder;
        });
      });
      
      // Set column widths
      worksheet.getColumn(1).width = 8;    // S No.
      worksheet.getColumn(2).width = 20;   // Business Unit
      worksheet.getColumn(3).width = 30;   // Account Name
      worksheet.getColumn(4).width = 30;   // PROJECT NAME
      worksheet.getColumn(5).width = 12;   // Category
      worksheet.getColumn(6).width = 25;   // RESPONDENT NAME
      worksheet.getColumn(7).width = 28;   // PERSPECTIVE
      worksheet.getColumn(8).width = 55;   // RATING_DESCRIPTION
      worksheet.getColumn(9).width = 10;   // RATING
      worksheet.getColumn(10).width = 15;  // SENTIMENT TYPE
      worksheet.getColumn(11).width = 25;  // SENTIMENT CATEGORY
      worksheet.getColumn(12).width = 30;  // POSITIVE (Strength)
      worksheet.getColumn(13).width = 30;  // NEGATIVE (Areas of Improvement)
      worksheet.getColumn(14).width = 30;  // NEUTRAL
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Qualitative_Analysis.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadUpdatedBucketAnalysis = async () => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) {
      alert('No updated remarks data available to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const thinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      const addSheetFromRows = (sheetName, rows, groupLabel) => {
        const ws = workbook.addWorksheet(sheetName);
        const header = ['Category', 'Sr. No.', 'Count', groupLabel, 'Respondent Names'];
        ws.addRow(header);
        const headerRow = ws.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' }
        };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        headerRow.eachCell((cell) => {
          cell.border = thinBorder;
        });
        const list = Array.isArray(rows) ? rows : [];
        list.forEach((row, idx) => {
          const excelRow = ws.addRow([
            row.category || '',
            idx + 1,
            row.count || 0,
            (row.groups || []).join(', ') || '-',
            (row.respondentNames || []).join(', ') || '-'
          ]);
          excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            cell.border = thinBorder;
            cell.alignment = {
              vertical: 'top',
              horizontal: colNumber === 2 || colNumber === 3 ? 'center' : 'left',
              wrapText: true
            };
          });
        });
        ws.getColumn(1).width = 22;
        ws.getColumn(2).width = 8;
        ws.getColumn(3).width = 10;
        ws.getColumn(4).width = 32;
        ws.getColumn(5).width = 38;
      };

      // Combined by Category sheet: Category, # Negative Customer Comments (P), # Positive Customer Comments (N), P%, N%, Delta %, Remarks
      const wsCombined = workbook.addWorksheet('Combined by Category');
      const combinedHeader = [
        'Category',
        '# Negative Customer Comments (P)',
        '# Positive Customer Comments (N)',
        'P%',
        'N%',
        'Delta %',
        'Remarks'
      ];
      wsCombined.addRow(combinedHeader);
      const combinedHeaderRow = wsCombined.getRow(1);
      combinedHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      combinedHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      combinedHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      combinedHeaderRow.eachCell((cell) => { cell.border = thinBorder; });
      (combinedUpdatedBucketData || []).forEach((row) => {
        const r = wsCombined.addRow([
          row.category || '',
          row.negativeCount || 0,
          row.positiveCount || 0,
          row.pPercent != null ? row.pPercent : '',
          row.nPercent != null ? row.nPercent : '',
          row.deltaPercent != null ? row.deltaPercent : '',
          row.remarks || ''
        ]);
        r.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.border = thinBorder;
          cell.alignment = {
            vertical: 'top',
            horizontal: colNumber === 1 || colNumber === 7 ? 'left' : 'center',
            wrapText: true
          };
        });
      });
      wsCombined.getColumn(1).width = 28;
      wsCombined.getColumn(2).width = 24;
      wsCombined.getColumn(3).width = 24;
      wsCombined.getColumn(4).width = 10;
      wsCombined.getColumn(5).width = 10;
      wsCombined.getColumn(6).width = 12;
      wsCombined.getColumn(7).width = 26;

      addSheetFromRows('NEGATIVE (AoI) - Account', updatedNegativeAccountData, 'Account Name');
      addSheetFromRows('NEGATIVE (AoI) - BU', updatedNegativeBUData, 'Business Unit');
      addSheetFromRows('POSITIVE (Strength) - Account', updatedPositiveAccountData, 'Account Name');
      addSheetFromRows('POSITIVE (Strength) - BU', updatedPositiveBUData, 'Business Unit');

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      link.download = `Updated_Remarks_Bucket_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error('Error downloading updated bucket analysis:', err);
      alert('Error downloading updated bucket analysis. Please try again.');
    }
  };

  const downloadOrgLevelData = async () => {
    try {
      if (orgLevelData.length === 0) {
        alert('No data available to download');
        return;
      }

      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Org Level - Perspective wise Qualitative Analysis');
      
      // Define headers
      const headers = [
        'S No.',
        'PERSPECTIVE',
        '# Positive Comments (P)',
        '# Negative Comments (N)',
        'P%',
        'N%',
        'Delta %',
        'Remarks'
      ];
      
      // Add headers
      worksheet.addRow(headers);
      
      const orgThinBorder = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };

      // Style the header row: dark cornflower blue background, white bold font, centered, word wrap
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      headerRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      headerRow.eachCell((cell) => {
        cell.border = orgThinBorder;
      });
      
      // Org level column alignments: 1=SNo(center), 2=Perspective(left), 3=PositiveCount(center),
      // 4=NegativeCount(center), 5=P%(center), 6=N%(center), 7=Delta%(center), 8=Remarks(left)
      const orgColAlignments = {
        1: 'center', 2: 'left', 3: 'center', 4: 'center',
        5: 'center', 6: 'center', 7: 'center', 8: 'left'
      };
      
      // Add data rows with styling
      orgLevelData.forEach((row, index) => {
        const rowNumber = index + 2;
        
        const dataRow = worksheet.addRow([
          row.sNo,
          row.perspective,
          row.positiveCount,
          row.negativeCount,
          `${row.pPercentage}%`,
          `${row.nPercentage}%`,
          `${row.deltaPercentage > 0 ? '+' : ''}${row.deltaPercentage}%`,
          row.remarks
        ]);
        dataRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          cell.alignment = {
            horizontal: orgColAlignments[colNumber] || 'left',
            vertical: 'middle',
            wrapText: true
          };
          cell.border = orgThinBorder;
        });
        
        // Apply Delta% column styling
        const deltaCell = worksheet.getCell(`G${rowNumber}`);
        const deltaValue = row.deltaPercentage;
        
        if (deltaValue >= 50) {
          deltaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF16a34a' }
          };
          deltaCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (deltaValue >= 10) {
          deltaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF86efac' }
          };
          deltaCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (deltaValue >= -20) {
          deltaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFfef3c7' }
          };
          deltaCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (deltaValue >= -50) {
          deltaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFdc2626' }
          };
          deltaCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else {
          deltaCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFd97706' }
          };
          deltaCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        
        deltaCell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      
      // Add legend below the data
      const dataRowCount = orgLevelData.length;
      const legendStartRow = dataRowCount + 3; // Add some spacing
      
      // Add legend title
      worksheet.getCell(`A${legendStartRow}`).value = 'LEGEND FOR ORG LEVEL - PERSPECTIVE WISE QUALITATIVE ANALYSIS';
      worksheet.getCell(`A${legendStartRow}`).font = { bold: true, size: 14 };
      
      // Add empty row
      worksheet.getCell(`A${legendStartRow + 1}`).value = '';
      
      // Add Delta% Column Legend
      worksheet.getCell(`A${legendStartRow + 2}`).value = 'DELTA% COLUMN LEGEND:';
      worksheet.getCell(`A${legendStartRow + 2}`).font = { bold: true };
      
      // Add legend headers
      worksheet.getCell(`A${legendStartRow + 3}`).value = 'Delta Range';
      worksheet.getCell(`B${legendStartRow + 3}`).value = 'Background Color';
      worksheet.getCell(`C${legendStartRow + 3}`).value = 'Text Color';
      worksheet.getCell(`D${legendStartRow + 3}`).value = 'Description';
      
      // Style legend headers
      const legendHeaderRow = worksheet.getRow(legendStartRow + 3);
      legendHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      legendHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      legendHeaderRow.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      legendHeaderRow.eachCell((cell) => {
        cell.border = orgThinBorder;
      });
      
      // Add legend data rows
      const legendData = [
        ['≥ 50%', 'Dark Green', 'White', 'Strength'],
        ['10% to 50%', 'Green', 'Black', 'Need to build on'],
        ['-20% to 10%', 'Light Yellow', 'Black', 'Neutral'],
        ['-50% to -20%', 'Dark Red', 'White', 'Area for Improvement'],
        ['≤ -20%', 'Dark Amber', 'White', 'Needs focus']
      ];
      
      legendData.forEach((row, index) => {
        const rowNum = legendStartRow + 4 + index;
        worksheet.getCell(`A${rowNum}`).value = row[0];
        worksheet.getCell(`B${rowNum}`).value = row[1];
        worksheet.getCell(`C${rowNum}`).value = row[2];
        worksheet.getCell(`D${rowNum}`).value = row[3];
        
        // Add borders to legend data
        for (let col = 1; col <= 4; col++) {
          const cell = worksheet.getCell(rowNum, col);
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        }
      });
      
      // Set column widths
      worksheet.getColumn(1).width = 10;   // S No.
      worksheet.getColumn(2).width = 30;   // PERSPECTIVE
      worksheet.getColumn(3).width = 25;   // # Positive Customer Comments (P)
      worksheet.getColumn(4).width = 25;   // # Negative Customer Comments (N)
      worksheet.getColumn(5).width = 12;   // P%
      worksheet.getColumn(6).width = 12;   // N%
      worksheet.getColumn(7).width = 12;   // Delta %
      worksheet.getColumn(8).width = 20;   // Remarks
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Org_Level_Perspective_wise_Qualitative_Analysis.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Org Level data exported successfully');
    } catch (error) {
      console.error('Error exporting org level data:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  // Download Combined Category Analysis (Account-wise) to Excel
  const downloadCombinedCategoryAnalysis = async () => {
    try {
      if (!bucketAnalysisData.combined || bucketAnalysisData.combined.length === 0) {
        alert('No data available to download');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Combined Category Analysis');

      const headers = [
        'S.No',
        'Category',
        '# Positive Customer Comments (P)',
        '# Negative Customer Comments (N)',
        'P%',
        'N%',
        'Delta %',
        'Remarks'
      ];
      worksheet.addRow(headers);

      // Header row - same color/font as Main Qualitative Analysis dashboard (gradient #667eea to #764ba2)
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF667eea' }
      };

      bucketAnalysisData.combined.forEach((row, index) => {
        const rowData = [
          index + 1,
          row.category,
          row.positiveCount,
          row.negativeCount,
          `${row.pPercentage}%`,
          `${row.nPercentage}%`,
          `${row.deltaPercentage > 0 ? '+' : ''}${row.deltaPercentage}%`,
          row.remarks
        ];
        const r = worksheet.addRow(rowData);
        // Delta % column (7) - font color only, same as Remarks cell colors (no background)
        const deltaCell = r.getCell(7);
        const deltaFontColor = row.remarks === 'Strength' ? 'FF16a34a' :
          row.remarks === 'Need to build on' ? 'FF16a34a' :
            row.remarks === 'Area for Improvement' ? 'FFdc2626' :
              row.remarks === 'Needs focus' ? 'FFF59e0b' : 'FF9ca3af';
        deltaCell.font = { bold: true, color: { argb: deltaFontColor } };
        // Remarks column (8) - Strength(Dark Green), Need to build on(Light Green), Area for Improvement(Red), Needs focus(Amber), Subjective Decision(Grey)
        const remarksCell = r.getCell(8);
        const remarksColor = row.remarks === 'Strength' ? 'FF16a34a' :
          row.remarks === 'Need to build on' ? 'FF86efac' :
            row.remarks === 'Area for Improvement' ? 'FFdc2626' :
              row.remarks === 'Needs focus' ? 'FFF59e0b' : 'FF9ca3af';
        remarksCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: remarksColor } };
        remarksCell.font = {
          bold: true,
          color: { argb: (row.remarks === 'Strength' || row.remarks === 'Area for Improvement') ? 'FFFFFFFF' : 'FF000000' }
        };
      });

      const totalRow = worksheet.addRow([
        'Total',
        '',
        bucketAnalysisData.combined.reduce((sum, row) => sum + row.positiveCount, 0),
        bucketAnalysisData.combined.reduce((sum, row) => sum + row.negativeCount, 0),
        '',
        '',
        '',
        ''
      ]);
      totalRow.font = { bold: true };

      // Legend below the dashboard - same as page
      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['Remarks Column Legend (Delta % / Remarks):']);
      legendTitleRow.font = { bold: true, size: 11 };
      worksheet.addRow(['• Delta > 50%: Strength (Dark Green)']);
      worksheet.addRow(['• 20% ≤ Delta ≤ 50%: Need to build on - Potential to become Strength (Light Green)']);
      worksheet.addRow(['• -19% ≤ Delta ≤ 19%: Subjective Decision (Grey)']);
      worksheet.addRow(['• -50% < Delta ≤ -20%: Needs focus - Likely to become Area of Improvement (Amber)']);
      worksheet.addRow(['• Delta ≤ -50%: Area for Improvement (Red)']);

      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 25;
      worksheet.getColumn(3).width = 28;
      worksheet.getColumn(4).width = 28;
      worksheet.getColumn(5).width = 10;
      worksheet.getColumn(6).width = 10;
      worksheet.getColumn(7).width = 12;
      worksheet.getColumn(8).width = 20;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Combined_Category_Analysis.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting combined category analysis:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  // Handle clearing file to upload new one
  const handleClearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = '';
    fileInputRef.current?.click();
  };

  const handleUpdatedRemarksUpload = (file) => {
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const wb = XLSX.read(data, { type: 'array' });
          const firstSheetName = wb.SheetNames[0];
          const ws = wb.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
          setUpdatedRemarksFile(file);
          setUpdatedRemarksData(Array.isArray(json) ? json : []);
          console.log('Updated category for Remarks uploaded. Rows:', Array.isArray(json) ? json.length : 0);
        } catch (err) {
          console.error('Failed to read Updated Remarks file:', err);
          alert('Failed to read the Updated Remarks file. Please ensure it is a valid Excel file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('Error while uploading Updated Remarks file:', err);
    }
  };

  const handleClearUpdatedRemarks = () => {
    setUpdatedRemarksFile(null);
    setUpdatedRemarksData([]);
    if (updatedRemarksInputRef.current) {
      updatedRemarksInputRef.current.value = '';
    }
  };

  const handleShowNewBucketAnalysis = () => {
    if (!updatedRemarksData || updatedRemarksData.length === 0) {
      alert('Please upload "Updated category for Remarks for different perspectives" file first.');
      return;
    }
    console.log('Show New Bucket Analysis clicked. Updated remarks rows:', updatedRemarksData.length);
    setShowNewBucketSections(true);
  };

  // Render upload section component
  const renderUploadSection = () => (
    <UploadSection>
      <UploadSectionHeader>
        <UploadSectionTitle>
          <Upload size={16} />
          Upload Qualitative Analysis Data
        </UploadSectionTitle>
        {uploadedFile && (
          <BucketAnalysisButton onClick={() => setShowBucketAnalysis(!showBucketAnalysis)}>
            <FileText size={14} />
            {showBucketAnalysis ? 'Hide Bucket Analysis' : 'Show Bucket Analysis'}
          </BucketAnalysisButton>
        )}
      </UploadSectionHeader>
      
      {!uploadedFile ? (
        <UploadArea
          $isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadIcon>
            <Upload size={24} />
          </UploadIcon>
          <UploadText>Drag & Drop Excel File Here</UploadText>
          <UploadSubtext>or click to browse • .xlsx, .xls • Max 10MB</UploadSubtext>
        </UploadArea>
      ) : (
        <UploadedFileCard>
          <FileInfo>
            <FileSpreadsheet size={18} color="#10b981" />
            <div>
              <FileName>{uploadedFile.name}</FileName>
              <FileDetails>
                {(uploadedFile.size / 1024).toFixed(1)} KB • {uploadedFile.rows} rows • 
                Uploaded: {new Date(uploadedFile.uploadedAt).toLocaleTimeString()}
              </FileDetails>
            </div>
          </FileInfo>
          <FileActions>
            <ClearFileButton onClick={handleClearFile}>
              <Upload size={12} />
              Upload New
            </ClearFileButton>
            <RemoveFileButton onClick={handleRemoveFile}>
              <X size={12} />
              Remove
            </RemoveFileButton>
          </FileActions>
        </UploadedFileCard>
      )}

      <FileInput
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
      />

      {isProcessing && (
        <StatusMessage $type="info">
          <Upload size={14} />
          Processing file...
        </StatusMessage>
      )}

      {uploadStatus.message && (
        <StatusMessage $type={uploadStatus.type}>
          {uploadStatus.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {uploadStatus.message}
        </StatusMessage>
      )}
    </UploadSection>
  );

  if (loading && !uploadedFile) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <FileText size={24} />
            Qualitative Analysis
          </HeaderTitle>
          <BackButton onClick={onBack}>
            <ChevronLeft size={16} />
            Back
          </BackButton>
        </DashboardHeader>
        
        {renderUploadSection()}
        
        <LoadingContainer>
          <FileText size={24} style={{ marginRight: '0.5rem' }} />
          Please upload a Qualitative Analysis Excel file to view data.
        </LoadingContainer>
      </DashboardContainer>
    );
  }

  if (error && !uploadedFile) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <FileText size={24} />
            Qualitative Analysis
          </HeaderTitle>
          <BackButton onClick={onBack}>
            <ChevronLeft size={16} />
            Back
          </BackButton>
        </DashboardHeader>
        
        {renderUploadSection()}
        
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <HeaderTitle>
          <FileText size={24} />
          Qualitative Analysis
        </HeaderTitle>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <DownloadButton onClick={showOrgLevelView ? downloadOrgLevelData : downloadData}>
            <Download size={16} />
            Download Data
          </DownloadButton>
          <OrgLevelButton onClick={() => setShowOrgLevelView(!showOrgLevelView)}>
            <FileText size={16} />
            {showOrgLevelView ? 'Back to Detailed View' : 'Org Level - Perspective wise Qualitative Analysis'}
          </OrgLevelButton>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-end' }}>
            <BackButton onClick={onBack}>
              <ChevronLeft size={16} />
              Back
            </BackButton>
            <BucketAnalysisButton onClick={() => setShowBucketAnalysis(true)}>
              <FileText size={14} />
              Show updated Bucket analysis
            </BucketAnalysisButton>
          </div>
        </div>
      </DashboardHeader>

      {/* Upload Section - always visible when data is loaded */}
      {renderUploadSection()}

      {/* Bucket Analysis Section - shown when button is clicked */}
      {showBucketAnalysis && (
        <BucketAnalysisContainer>
          {/* Upload updated category for Remarks for different perspectives */}
          {showUpdatedRemarksUpload && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#0f172a' }}>
                  Upload <span style={{ fontWeight: 700 }}>Updated category for Remarks for different perspectives</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <BucketAnalysisButton onClick={handleShowNewBucketAnalysis}>
                    <FileText size={14} />
                    Show New Bucket Analysis
                  </BucketAnalysisButton>
                  <ClearFileButton type="button" onClick={() => setShowUpdatedRemarksUpload(false)}>
                    Hide Upload
                  </ClearFileButton>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    ref={updatedRemarksInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) handleUpdatedRemarksUpload(file);
                    }}
                  />
                  <BucketAnalysisButton as="span">
                    <Upload size={14} style={{ marginRight: 6 }} />
                    Choose File
                  </BucketAnalysisButton>
                </label>
                {updatedRemarksFile && (
                  <>
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      {updatedRemarksFile.name}
                    </span>
                    <BucketAnalysisButton type="button" onClick={handleClearUpdatedRemarks}>
                      <X size={14} style={{ marginRight: 6 }} />
                      Clear
                    </BucketAnalysisButton>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Existing Bucket Analysis content */}
          {/* Combined Category Analysis (Account-wise) */}
          <BucketSection>
            <CombinedCategoryHeader>
              <FileText size={24} />
              <CombinedCategoryTitle>Combined Category Analysis (Account-wise)</CombinedCategoryTitle>
              {bucketAnalysisData.combined && bucketAnalysisData.combined.length > 0 && (
                <DownloadButton
                  onClick={() => downloadCombinedCategoryAnalysis()}
                  style={{ marginLeft: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  <Download size={14} />
                  Download Excel
                </DownloadButton>
              )}
            </CombinedCategoryHeader>
            {bucketAnalysisData.combined && bucketAnalysisData.combined.length > 0 ? (
              <BucketTableWrapper>
                <BucketTable>
                  <thead>
                    <tr>
                      <BucketTh $align="center" style={{ width: '60px' }}>S.No</BucketTh>
                      <BucketTh style={{ width: '200px' }}>Category</BucketTh>
                      <BucketTh $align="center" style={{ width: '140px' }}># Positive Customer Comments (P)</BucketTh>
                      <BucketTh $align="center" style={{ width: '140px' }}># Negative Customer Comments (N)</BucketTh>
                      <BucketTh $align="center" style={{ width: '80px' }}>P%</BucketTh>
                      <BucketTh $align="center" style={{ width: '80px' }}>N%</BucketTh>
                      <BucketTh $align="center" style={{ width: '90px' }}>Delta %</BucketTh>
                      <BucketTh style={{ width: '140px' }}>Remarks</BucketTh>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketAnalysisData.combined.map((row, index) => (
                      <tr key={index}>
                        <BucketTd $align="center">{index + 1}</BucketTd>
                        <BucketTd style={{ fontWeight: 500 }}>{row.category}</BucketTd>
                        <BucketTd $align="center">
                          <BucketCountBadge $type="positive">{row.positiveCount}</BucketCountBadge>
                        </BucketTd>
                        <BucketTd $align="center">
                          <BucketCountBadge $type="negative">{row.negativeCount}</BucketCountBadge>
                        </BucketTd>
                        <BucketTd $align="center" style={{ color: '#16a34a', fontWeight: 500 }}>
                          {row.pPercentage}%
                        </BucketTd>
                        <BucketTd $align="center" style={{ color: '#dc2626', fontWeight: 500 }}>
                          {row.nPercentage}%
                        </BucketTd>
                        <BucketTd
                          $align="center"
                          style={{
                            fontWeight: 'bold',
                            color: row.remarks === 'Strength' ? '#16a34a' :
                              row.remarks === 'Need to build on' ? '#15803d' :
                                row.remarks === 'Area for Improvement' ? '#dc2626' :
                                  row.remarks === 'Needs focus' ? '#f59e0b' : '#9ca3af'
                          }}
                        >
                          {row.deltaPercentage > 0 ? '+' : ''}{row.deltaPercentage}%
                        </BucketTd>
                        <BucketTd
                          style={{
                            fontWeight: 500,
                            backgroundColor: row.remarks === 'Strength' ? '#16a34a' :
                              row.remarks === 'Need to build on' ? '#86efac' :
                                row.remarks === 'Area for Improvement' ? '#dc2626' :
                                  row.remarks === 'Needs focus' ? '#f59e0b' : '#9ca3af',
                            color: row.remarks === 'Strength' || row.remarks === 'Area for Improvement' ? '#ffffff' : '#000000'
                          }}
                        >
                          {row.remarks}
                        </BucketTd>
                      </tr>
                    ))}
                    <TotalRow>
                      <BucketTd $align="center" colSpan={2}><strong>Total</strong></BucketTd>
                      <BucketTd $align="center">
                        <BucketCountBadge $type="positive">
                          {bucketAnalysisData.combined.reduce((sum, row) => sum + row.positiveCount, 0)}
                        </BucketCountBadge>
                      </BucketTd>
                      <BucketTd $align="center">
                        <BucketCountBadge $type="negative">
                          {bucketAnalysisData.combined.reduce((sum, row) => sum + row.negativeCount, 0)}
                        </BucketCountBadge>
                      </BucketTd>
                      <BucketTd colSpan={4}></BucketTd>
                    </TotalRow>
                  </tbody>
                </BucketTable>
              </BucketTableWrapper>
            ) : (
              <NoBucketData>No sentiment data available for category summary.</NoBucketData>
            )}
            {/* Horizontal Stacked Bar Chart - P% and N% on x-axis, two colors, download option */}
            {combinedChartData.length > 0 && (
              <ChartContainer ref={combinedChartRef} style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <ChartTitle style={{ marginBottom: 0 }}>P% vs N% by Category</ChartTitle>
                  <button
                    type="button"
                    onClick={downloadCombinedChartImage}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600,
                      background: '#10b981', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer'
                    }}
                  >
                    <Download size={18} />
                    Download Chart
                  </button>
                </div>
                <div style={{ width: '100%', height: Math.max(350, combinedChartData.length * 48), minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={combinedChartData}
                      layout="vertical"
                      margin={{ top: 16, right: 24, left: 8, bottom: 48 }}
                      barCategoryGap={combinedChartData.length > 10 ? 6 : 10}
                      barGap={2}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#374151' }}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#374151' }} width={140} interval={0} />
                      <Tooltip
                        formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) + '%' : value, name === 'pPercent' ? 'P%' : 'N%']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #94a3b8', borderRadius: 8 }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Legend formatter={(v) => (v === 'pPercent' ? 'P% (Positive)' : 'N% (Negative)')} iconType="rect" />
                      <Bar dataKey="pPercent" name="pPercent" stackId="a" fill="#16a34a" barSize={28} radius={[0, 0, 0, 0]}>
                        <LabelList dataKey="pPercent" position="center" formatter={(v) => (v > 0 ? `${v}%` : '')} fill="#1f2937" fontSize={10} />
                      </Bar>
                      <Bar dataKey="nPercent" name="nPercent" stackId="a" fill="#dc2626" barSize={28} radius={[0, 4, 4, 0]}>
                        <LabelList dataKey="nPercent" position="center" formatter={(v) => (v > 0 ? `${v}%` : '')} fill="#fff" fontSize={10} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <ChartLegend>
                  <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#16a34a', marginRight: 4, verticalAlign: 'middle', borderRadius: 2 }} /> P% (Positive Customer Comments)</span>
                  <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#dc2626', marginRight: 4, verticalAlign: 'middle', borderRadius: 2 }} /> N% (Negative Customer Comments)</span>
                </ChartLegend>
              </ChartContainer>
            )}
            {/* Legend - below Combined Category Analysis dashboard table */}
            {bucketAnalysisData.combined && bucketAnalysisData.combined.length > 0 && (
              <LegendContainer style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                <LegendTitle>Remarks Column Legend (Delta % / Remarks):</LegendTitle>
                <LegendGrid>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#16a34a' }}></LegendColor>
                    <LegendText><strong>Dark Green</strong> - Delta &gt; 50%: Strength</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#86efac' }}></LegendColor>
                    <LegendText><strong>Light Green</strong> - 20% ≤ Delta ≤ 50%: Need to build on (Potential to become Strength)</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#9ca3af' }}></LegendColor>
                    <LegendText><strong>Grey</strong> - -19% ≤ Delta ≤ 19%: Subjective Decision</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#f59e0b' }}></LegendColor>
                    <LegendText><strong>Amber</strong> - -50% &lt; Delta ≤ -20%: Needs focus (Likely to become Area of Improvement)</LegendText>
                  </LegendItem>
                  <LegendItem>
                    <LegendColor style={{ backgroundColor: '#dc2626' }}></LegendColor>
                    <LegendText><strong>Red</strong> - Delta ≤ -50%: Area for Improvement</LegendText>
                  </LegendItem>
                </LegendGrid>
              </LegendContainer>
            )}
          </BucketSection>

          {/* Areas of Improvement (Negative) Section */}
          <BucketSection>
            <BucketSectionHeader $type="negative">
              <AlertCircle size={20} />
              <BucketSectionTitle>Areas of Improvement - Bucket Analysis (Negative Sentiment)</BucketSectionTitle>
            </BucketSectionHeader>
            {bucketAnalysisData.negative.length > 0 ? (
              <BucketTableWrapper>
                <BucketTable>
                  <thead>
                    <tr>
                      <BucketTh $align="center" style={{ width: '60px' }}>Sr. No.</BucketTh>
                      <BucketTh style={{ width: '200px' }}>Category</BucketTh>
                      <BucketTh $align="center" style={{ width: '80px' }}>Count</BucketTh>
                      <BucketTh style={{ width: '250px' }}>Account Name</BucketTh>
                      <BucketTh>Respondent Names</BucketTh>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketAnalysisData.negative.map((row, index) => (
                      <tr key={index}>
                        <BucketTd $align="center">{index + 1}</BucketTd>
                        <BucketTd style={{ fontWeight: 500 }}>{row.category}</BucketTd>
                        <BucketTd $align="center">
                          <BucketCountBadge $type="negative">{row.count}</BucketCountBadge>
                        </BucketTd>
                        <BucketTd style={{ fontSize: '0.75rem' }}>{row.accounts || '-'}</BucketTd>
                        <BucketTd style={{ fontSize: '0.75rem' }}>{row.respondents || '-'}</BucketTd>
                      </tr>
                    ))}
                    <TotalRow>
                      <BucketTd $align="center" colSpan={2}><strong>Total</strong></BucketTd>
                      <BucketTd $align="center">
                        <BucketCountBadge $type="negative">
                          {bucketAnalysisData.negative.reduce((sum, row) => sum + row.count, 0)}
                        </BucketCountBadge>
                      </BucketTd>
                      <BucketTd colSpan={2}></BucketTd>
                    </TotalRow>
                  </tbody>
                </BucketTable>
              </BucketTableWrapper>
            ) : (
              <NoBucketData>No negative sentiment data available for bucket analysis.</NoBucketData>
            )}
          </BucketSection>

          {/* Strength (Positive) Section */}
          <BucketSection>
            <BucketSectionHeader $type="positive">
              <CheckCircle size={20} />
              <BucketSectionTitle>Strength - Bucket Analysis (Positive Sentiment)</BucketSectionTitle>
            </BucketSectionHeader>
            {bucketAnalysisData.positive.length > 0 ? (
              <BucketTableWrapper>
                <BucketTable>
                  <thead>
                    <tr>
                      <BucketTh $align="center" style={{ width: '60px' }}>Sr. No.</BucketTh>
                      <BucketTh style={{ width: '200px' }}>Category</BucketTh>
                      <BucketTh $align="center" style={{ width: '80px' }}>Count</BucketTh>
                      <BucketTh style={{ width: '250px' }}>Account Name</BucketTh>
                      <BucketTh>Respondent Names</BucketTh>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketAnalysisData.positive.map((row, index) => (
                      <tr key={index}>
                        <BucketTd $align="center">{index + 1}</BucketTd>
                        <BucketTd style={{ fontWeight: 500 }}>{row.category}</BucketTd>
                        <BucketTd $align="center">
                          <BucketCountBadge $type="positive">{row.count}</BucketCountBadge>
                        </BucketTd>
                        <BucketTd style={{ fontSize: '0.75rem' }}>{row.accounts || '-'}</BucketTd>
                        <BucketTd style={{ fontSize: '0.75rem' }}>{row.respondents || '-'}</BucketTd>
                      </tr>
                    ))}
                    <TotalRow>
                      <BucketTd $align="center" colSpan={2}><strong>Total</strong></BucketTd>
                      <BucketTd $align="center">
                        <BucketCountBadge $type="positive">
                          {bucketAnalysisData.positive.reduce((sum, row) => sum + row.count, 0)}
                        </BucketCountBadge>
                      </BucketTd>
                      <BucketTd colSpan={2}></BucketTd>
                    </TotalRow>
                  </tbody>
                </BucketTable>
              </BucketTableWrapper>
            ) : (
              <NoBucketData>No positive sentiment data available for bucket analysis.</NoBucketData>
            )}
          </BucketSection>
        </BucketAnalysisContainer>
      )}

      {showNewBucketSections && updatedRemarksData && updatedRemarksData.length > 0 && (
        <>
          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              Updated Bucket Analysis
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <DownloadButton type="button" onClick={downloadUpdatedBucketAnalysis}>
                <Download size={14} />
                Download NEGATIVE & POSITIVE Updated Bucket Analysis
              </DownloadButton>
              <BucketAnalysisButton type="button" onClick={() => setShowNewBucketSections(false)}>
                Hide Updated Bucket Analysis
              </BucketAnalysisButton>
            </div>
          </div>

          {/* Combined dashboard by common Category: NEGATIVE count + POSITIVE count */}
          <div style={{ marginTop: '1.25rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
            Combined by Category (NEGATIVE & POSITIVE Updated Bucket Analysis)
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th style={{ textAlign: 'center' }}># Negative Customer Comments (P)</Th>
                  <Th style={{ textAlign: 'center' }}># Positive Customer Comments (N)</Th>
                  <Th style={{ textAlign: 'center' }}>P%</Th>
                  <Th style={{ textAlign: 'center' }}>N%</Th>
                  <Th style={{ textAlign: 'center' }}>Delta %</Th>
                  <Th>Remarks</Th>
                </tr>
              </thead>
              <tbody>
                {combinedUpdatedBucketData.map((row, idx) => {
                  // Background colors for Remarks cell based on Delta % legend
                  let remarksBg = '#e5e7eb'; // Grey default (Subjective Decision)
                  let remarksTextColor = '#111827';
                  if (row.remarks === 'Strength') {
                    remarksBg = '#006400'; // Dark Green
                    remarksTextColor = '#ffffff';
                  } else if (row.remarks && row.remarks.startsWith('Need to build on')) {
                    remarksBg = '#90EE90'; // Light Green
                    remarksTextColor = '#111827';
                  } else if (row.remarks === 'Area for Improvement') {
                    remarksBg = '#DC2626'; // Red
                    remarksTextColor = '#ffffff';
                  } else if (row.remarks && row.remarks.startsWith('Needs focus')) {
                    remarksBg = '#F59E0B'; // Amber
                    remarksTextColor = '#111827';
                  }
                  return (
                    <tr key={`combined-upd-${idx}-${row.category}`}>
                      <Td style={{ textAlign: 'left' }}>{row.category}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.negativeCount}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.positiveCount}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.pPercent != null ? row.pPercent : ''}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.nPercent != null ? row.nPercent : ''}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.deltaPercent != null ? row.deltaPercent : ''}</Td>
                      <Td
                        style={{
                          textAlign: 'left',
                          fontWeight: 600,
                          backgroundColor: remarksBg,
                          color: remarksTextColor,
                          borderRadius: '4px'
                        }}
                      >
                        {row.remarks || ''}
                      </Td>
                    </tr>
                  );
                })}
                {combinedUpdatedBucketData.length > 0 && (
                  <TotalRow>
                    <Td style={{ textAlign: 'center' }}><strong>Total</strong></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{combinedUpdatedBucketData.reduce((s, r) => s + (r.negativeCount || 0), 0)}</strong>
                    </Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{combinedUpdatedBucketData.reduce((s, r) => s + (r.positiveCount || 0), 0)}</strong>
                    </Td>
                    <Td></Td>
                    <Td></Td>
                    <Td></Td>
                    <Td></Td>
                  </TotalRow>
                )}
                {combinedUpdatedBucketData.length === 0 && (
                  <tr>
                    <Td colSpan={7} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No combined category data. Upload Updated category for Remarks and run Show New Bucket Analysis.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          {/* Legend for Remarks / Delta % for Combined by Category */}
          {combinedUpdatedBucketData.length > 0 && (
            <div style={{ marginTop: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#4b5563' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Remarks Legend (by Delta %):</div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Delta &gt; 50%: <strong>Strength</strong> (Dark Green)</li>
                <li>20% ≤ Delta ≤ 50%: <strong>Need to build on (Potential to become Strength)</strong> (Light Green)</li>
                <li>Delta ≤ -50%: <strong>Area for Improvement</strong> (Red)</li>
                <li>-50% &lt; Delta ≤ -20%: <strong>Needs focus (Likely to become Area of Improvement)</strong> (Amber)</li>
                <li>-19% ≤ Delta ≤ 19%: <strong>Subjective Decision</strong> (Grey)</li>
              </ul>
            </div>
          )}

          {/* Horizontal stacked bar chart for Combined by Category (Updated Bucket Analysis) – P% vs N% */}
          {combinedUpdatedBucketData.length > 0 && (
            <ChartContainer>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12, flexWrap: 'wrap' }}>
                <ChartTitle style={{ marginBottom: 0 }}>
                  Combined by Category (NEGATIVE &amp; POSITIVE Updated Bucket Analysis) – P% vs N%
                </ChartTitle>
                <DownloadButton
                  type="button"
                  onClick={downloadUpdatedCombinedChartImage}
                  style={{ padding: '0.4rem 0.9rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={14} />
                  Download Chart
                </DownloadButton>
              </div>
              <div
                ref={updatedCombinedChartRef}
                style={{ width: '100%', height: Math.max(350, combinedUpdatedBucketData.length * 48), minHeight: 300 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={combinedUpdatedBucketData}
                    layout="vertical"
                    margin={{ top: 16, right: 24, left: 8, bottom: 48 }}
                    barCategoryGap={combinedUpdatedBucketData.length > 10 ? 6 : 10}
                    barGap={2}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      ticks={[0, 20, 40, 60, 80, 100]}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <YAxis
                      type="category"
                      dataKey="category"
                      tick={{ fontSize: 11, fill: '#374151' }}
                      width={140}
                      interval={0}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(2) + '%' : value,
                        name === 'pPercent' ? 'P%' : 'N%'
                      ]}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #94a3b8', borderRadius: 8 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <Legend
                      formatter={(v) => (v === 'pPercent' ? 'P% (Negative Customer Comments)' : 'N% (Positive Customer Comments)')}
                      iconType="rect"
                    />
                    <Bar dataKey="pPercent" name="pPercent" stackId="a" fill="#16a34a" barSize={28} radius={[0, 0, 0, 0]}>
                      <LabelList
                        dataKey="pPercent"
                        position="center"
                        formatter={(v) => (v > 0 ? `${v}%` : '')}
                        fill="#1f2937"
                        fontSize={10}
                      />
                    </Bar>
                    <Bar dataKey="nPercent" name="nPercent" stackId="a" fill="#dc2626" barSize={28} radius={[0, 4, 4, 0]}>
                      <LabelList
                        dataKey="nPercent"
                        position="center"
                        formatter={(v) => (v > 0 ? `${v}%` : '')}
                        fill="#fff"
                        fontSize={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ChartLegend>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      background: '#16a34a',
                      marginRight: 4,
                      verticalAlign: 'middle',
                      borderRadius: 2
                    }}
                  />{' '}
                  P% (Negative Customer Comments)
                </span>
                <span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 14,
                      height: 14,
                      background: '#dc2626',
                      marginRight: 4,
                      verticalAlign: 'middle',
                      borderRadius: 2
                    }}
                  />{' '}
                  N% (Positive Customer Comments)
                </span>
              </ChartLegend>
            </ChartContainer>
          )}

          <div style={{ marginTop: '2rem', marginBottom: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            NEGATIVE (Areas of Improvement) - Updated Bucket Analysis
          </div>
          <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 600, color: '#1e40af' }}>Account-wise</div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Sr. No.</Th>
                  <Th>Count</Th>
                  <Th>Account Name</Th>
                  <Th>Respondent Names</Th>
                </tr>
              </thead>
              <tbody>
                {updatedNegativeAccountData.map((row, idx) => (
                  <tr key={`upd-neg-account-${idx}-${row.category}`}>
                    <Td style={{ textAlign: 'left' }}>{row.category}</Td>
                    <Td style={{ textAlign: 'center' }}>{idx + 1}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.count}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.groups || []).join(', ') || '-'}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.respondentNames || []).join(', ') || '-'}</Td>
                  </tr>
                ))}
                {updatedNegativeAccountData.length > 0 && (
                  <TotalRow>
                    <Td colSpan={2} style={{ textAlign: 'center' }}><strong>Total</strong></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{updatedNegativeAccountData.reduce((s, r) => s + (r.count || 0), 0)}</strong>
                    </Td>
                    <Td colSpan={2}></Td>
                  </TotalRow>
                )}
                {updatedNegativeAccountData.length === 0 && (
                  <tr>
                    <Td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No data for NEGATIVE (Areas of Improvement) Account-wise
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#1e40af' }}>BU-wise</div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Sr. No.</Th>
                  <Th>Count</Th>
                  <Th>Business Unit</Th>
                  <Th>Respondent Names</Th>
                </tr>
              </thead>
              <tbody>
                {updatedNegativeBUData.map((row, idx) => (
                  <tr key={`upd-neg-bu-${idx}-${row.category}`}>
                    <Td style={{ textAlign: 'left' }}>{row.category}</Td>
                    <Td style={{ textAlign: 'center' }}>{idx + 1}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.count}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.groups || []).join(', ') || '-'}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.respondentNames || []).join(', ') || '-'}</Td>
                  </tr>
                ))}
                {updatedNegativeBUData.length > 0 && (
                  <TotalRow>
                    <Td colSpan={2} style={{ textAlign: 'center' }}><strong>Total</strong></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{updatedNegativeBUData.reduce((s, r) => s + (r.count || 0), 0)}</strong>
                    </Td>
                    <Td colSpan={2}></Td>
                  </TotalRow>
                )}
                {updatedNegativeBUData.length === 0 && (
                  <tr>
                    <Td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No data for NEGATIVE (Areas of Improvement) BU-wise
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: '2rem', fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            POSITIVE (Strength) - Updated Bucket Analysis
          </div>
          <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem', fontWeight: 600, color: '#1e40af' }}>Account-wise</div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Sr. No.</Th>
                  <Th>Count</Th>
                  <Th>Account Name</Th>
                  <Th>Respondent Names</Th>
                </tr>
              </thead>
              <tbody>
                {updatedPositiveAccountData.map((row, idx) => (
                  <tr key={`upd-pos-account-${idx}-${row.category}`}>
                    <Td style={{ textAlign: 'left' }}>{row.category}</Td>
                    <Td style={{ textAlign: 'center' }}>{idx + 1}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.count}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.groups || []).join(', ') || '-'}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.respondentNames || []).join(', ') || '-'}</Td>
                  </tr>
                ))}
                {updatedPositiveAccountData.length > 0 && (
                  <TotalRow>
                    <Td colSpan={2} style={{ textAlign: 'center' }}><strong>Total</strong></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{updatedPositiveAccountData.reduce((s, r) => s + (r.count || 0), 0)}</strong>
                    </Td>
                    <Td colSpan={2}></Td>
                  </TotalRow>
                )}
                {updatedPositiveAccountData.length === 0 && (
                  <tr>
                    <Td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No data for POSITIVE (Strength) Account-wise
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', fontWeight: 600, color: '#1e40af' }}>BU-wise</div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Sr. No.</Th>
                  <Th>Count</Th>
                  <Th>Business Unit</Th>
                  <Th>Respondent Names</Th>
                </tr>
              </thead>
              <tbody>
                {updatedPositiveBUData.map((row, idx) => (
                  <tr key={`upd-pos-bu-${idx}-${row.category}`}>
                    <Td style={{ textAlign: 'left' }}>{row.category}</Td>
                    <Td style={{ textAlign: 'center' }}>{idx + 1}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.count}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.groups || []).join(', ') || '-'}</Td>
                    <Td style={{ textAlign: 'left' }}>{(row.respondentNames || []).join(', ') || '-'}</Td>
                  </tr>
                ))}
                {updatedPositiveBUData.length > 0 && (
                  <TotalRow>
                    <Td colSpan={2} style={{ textAlign: 'center' }}><strong>Total</strong></Td>
                    <Td style={{ textAlign: 'center' }}>
                      <strong>{updatedPositiveBUData.reduce((s, r) => s + (r.count || 0), 0)}</strong>
                    </Td>
                    <Td colSpan={2}></Td>
                  </TotalRow>
                )}
                {updatedPositiveBUData.length === 0 && (
                  <tr>
                    <Td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No data for POSITIVE (Strength) BU-wise
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {showOrgLevelView ? (
        // Org Level - Perspective wise Qualitative Analysis View
        <>
          {/* Legend for Delta% and Remarks Columns */}
          <LegendContainer>
            <LegendTitle>Delta% Column Legend:</LegendTitle>
            <LegendGrid>
              <LegendItem>
                <LegendColor style={{ backgroundColor: '#16a34a' }}></LegendColor>
                <LegendText><strong>Dark Green</strong> - Delta ≥ 50%</LegendText>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{ backgroundColor: '#86efac' }}></LegendColor>
                <LegendText><strong>Green</strong> - Delta 10% to 50%</LegendText>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{ backgroundColor: '#fef3c7' }}></LegendColor>
                <LegendText><strong>Light Yellow</strong> - Delta -20% to 10%</LegendText>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{ backgroundColor: '#dc2626' }}></LegendColor>
                <LegendText><strong>Dark Red</strong> - Delta -50% to -20%</LegendText>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{ backgroundColor: '#d97706' }}></LegendColor>
                <LegendText><strong>Dark Amber</strong> - Delta ≤ -20%</LegendText>
              </LegendItem>
            </LegendGrid>
          </LegendContainer>
          
          <TableContainer>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>S No.</Th>
                  <Th>PERSPECTIVE</Th>
                  <Th># Positive<br/>Comments (P)</Th>
                  <Th># Negative<br/>Comments (N)</Th>
                  <Th>P%</Th>
                  <Th>N%</Th>
                  <Th>Delta %</Th>
                  <Th>Remarks</Th>
                </tr>
              </thead>
              <tbody>
                {orgLevelData.map((row, index) => (
                  <tr key={index}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.perspective}</Td>
                    <Td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>
                      {row.positiveCount}
                    </Td>
                    <Td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }}>
                      {row.negativeCount}
                    </Td>
                    <Td style={{ textAlign: 'center', color: '#16a34a', fontWeight: 'bold' }}>
                      {row.pPercentage}%
                    </Td>
                    <Td style={{ textAlign: 'center', color: '#dc2626', fontWeight: 'bold' }}>
                      {row.nPercentage}%
                    </Td>
                    <Td style={{ 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      backgroundColor: row.deltaPercentage >= 50 ? '#16a34a' : 
                                     row.deltaPercentage >= 10 ? '#86efac' :
                                     row.deltaPercentage >= -20 ? '#fef3c7' :
                                     row.deltaPercentage >= -50 ? '#dc2626' : '#d97706',
                      color: row.deltaPercentage >= 50 ? '#ffffff' : 
                             row.deltaPercentage >= 10 ? '#000000' :
                             row.deltaPercentage >= -20 ? '#000000' :
                             row.deltaPercentage >= -50 ? '#ffffff' : '#ffffff'
                    }}>
                      {row.deltaPercentage > 0 ? '+' : ''}{row.deltaPercentage}%
                    </Td>
                    <Td style={{ 
                      textAlign: 'center', 
                      fontWeight: 'bold',
                      color: row.remarks === 'Strength' ? '#16a34a' : 
                             row.remarks === 'Need to build on' ? '#d97706' :
                             row.remarks === 'Area for Improvement' ? '#dc2626' :
                             row.remarks === 'Needs focus' ? '#991b1b' : '#6b7280'
                    }}>
                      {row.remarks}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </TableContainer>
        </>
      ) : (
        // Detailed Qualitative Analysis View
        <>
          <SearchFilterSection>
        <SearchFilterTitle>
          <Search size={20} />
          Search & Filter Data
        </SearchFilterTitle>
        <SearchFilterGrid>
          <div>
            <SearchLabel htmlFor="customer-name-search">Customer Name</SearchLabel>
            <SearchInput
              id="customer-name-search"
              type="text"
              placeholder="Search by customer name..."
              value={customerNameFilter}
              onChange={(e) => setCustomerNameFilter(e.target.value)}
            />
          </div>
          <div>
            <SearchLabel htmlFor="project-name-search">Project Name</SearchLabel>
            <SearchInput
              id="project-name-search"
              type="text"
              placeholder="Search by project name..."
              value={projectNameFilter}
              onChange={(e) => setProjectNameFilter(e.target.value)}
            />
          </div>
          <div>
            <SearchLabel htmlFor="perspective-search">PERSPECTIVE</SearchLabel>
            <SearchInput
              id="perspective-search"
              type="text"
              placeholder="Search by perspective..."
              value={perspectiveFilter}
              onChange={(e) => setPerspectiveFilter(e.target.value)}
            />
          </div>
          <div>
            <SearchLabel htmlFor="category-filter">Category</SearchLabel>
            <FilterSelect
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="1">Category 1</option>
              <option value="2">Category 2</option>
            </FilterSelect>
          </div>
          <div>
            <SearchLabel>&nbsp;</SearchLabel>
            <ClearButton onClick={clearAllFilters}>
              Clear All Filters
            </ClearButton>
          </div>
        </SearchFilterGrid>
      </SearchFilterSection>

      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>S No.</Th>
                <Th>Business Unit</Th>
                <Th>Account Name</Th>
                <Th>PROJECT NAME</Th>
                <Th>Category</Th>
                <Th>RESPONDENT NAME</Th>
                <Th>PERSPECTIVE</Th>
                <Th>RATING_DESCRIPTION</Th>
                <Th>RATING</Th>
                <Th>SENTIMENT TYPE</Th>
                <Th>SENTIMENT CATEGORY</Th>
                <Th>POSITIVE (Strength)</Th>
                <Th>NEGATIVE (Areas of Improvement)</Th>
                <Th>NEUTRAL</Th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index}>
                  <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.projectName}</Td>
                  <Td style={{ textAlign: 'center' }}>{row.category}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.respondentName}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.perspective}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.ratingDescription}</Td>
                  <Td style={{ textAlign: 'center' }}>{row.rating}</Td>
                  <Td style={{ 
                    textAlign: 'center', 
                    color: row.sentimentType === 'Positive' ? '#16a34a' : row.sentimentType === 'Negative' ? '#dc2626' : '#d97706',
                    fontWeight: 500
                  }}>
                    {row.sentimentType}
                  </Td>
                  <Td style={{ textAlign: 'left' }}>{row.sentimentCategory}</Td>
                  <Td style={{ textAlign: 'left', color: row.positive ? '#16a34a' : '#6b7280' }}>
                    {row.positive}
                  </Td>
                  <Td style={{ textAlign: 'left', color: row.negative ? '#dc2626' : '#6b7280' }}>
                    {row.negative}
                  </Td>
                  <Td style={{ textAlign: 'left', color: row.neutral ? '#d97706' : '#6b7280' }}>
                    {row.neutral}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>
        </>
      )}
    </DashboardContainer>
  );
};

export default QualitativeAnalysisDashboard;
