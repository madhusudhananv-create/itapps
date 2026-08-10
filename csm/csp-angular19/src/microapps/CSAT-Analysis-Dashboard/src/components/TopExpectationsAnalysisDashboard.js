import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { useCSATContext } from '../context/CSATContext';
import { normalizeBusinessUnitDisplay } from '../utils/normalizeBusinessUnitDisplay';
import {
  buildRowFromHeaders,
  getCsatReceivedDateFromRow,
  getCsatSentDateFromRow,
  getYearQuarterFromRow,
  isDateOnOrAfterAcsatCycleStart,
  normalizeAcsatRowCanonicalFields,
  yearQuarterMatchesCycle,
} from '../utils/acsatExcelRowUtils';

const Container = styled.div`
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #64748b;
  margin-bottom: 1rem;
`;

const DateInfo = styled.div`
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const DateLabel = styled.span`
  font-weight: 600;
  color: #475569;
`;

const DateValue = styled.span`
  color: #1e293b;
  font-weight: 700;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ToggleButton = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 80vh;
  max-width: 100%;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
    transition: background 0.2s;
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
  border-collapse: collapse;
  min-width: 1200px;
`;

const TableHeader = styled.thead`
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
  color: white;
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 700;
  font-size: 0.95rem;
  border: none;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8fafc;
  }
  
  &:hover {
    background-color: #e0f2fe;
    transform: scale(1.01);
    transition: all 0.2s ease;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
`;

const BusinessUnitCell = styled.td`
  padding: 1rem;
  text-align: left;
  vertical-align: middle;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  background-color: #f1f5f9;
  position: sticky;
  left: 0;
  z-index: 5;
`;

const CustomerIdCell = styled.td`
  padding: 1rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  background-color: #f8fafc;
  position: sticky;
  left: 0;
  z-index: 5;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ScrollIndicator = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SearchLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

const ClearButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SearchResults = styled.div`
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: left;
  width: 100%;
  max-width: 400px;
`;

const ProjectSearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  max-width: 400px;
`;

const ProjectSearchInput = styled.input`
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ProjectSearchLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

const ProjectClearButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    background: #4b5563;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProjectSearchResults = styled.div`
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: left;
  width: 100%;
  max-width: 400px;
`;

// Helper function to categorize improvement areas based on RATING_DESCRIPTION
const categorizeImprovementArea = (ratingDescription) => {
  if (!ratingDescription) return [];
  
  const description = ratingDescription.toLowerCase();
  
  // Split by comma and process each part
  const parts = description.split(',').map(part => part.trim()).filter(part => part);
  const categories = [];
  
  parts.forEach(part => {
  // Define categories based on common improvement areas
    if (part.includes('communication') || part.includes('response') || part.includes('feedback')) {
      categories.push('Communication');
    } else if (part.includes('delivery') || part.includes('timeline') || part.includes('schedule')) {
      categories.push('Delivery & Timeline');
    } else if (part.includes('quality') || part.includes('testing') || part.includes('bug') || part.includes('defect')) {
      categories.push('Quality & Testing');
    } else if (part.includes('support') || part.includes('help') || part.includes('assistance')) {
      categories.push('Support & Assistance');
    } else if (part.includes('documentation') || part.includes('guide') || part.includes('manual')) {
      categories.push('Documentation');
    } else if (part.includes('training') || part.includes('knowledge') || part.includes('skill')) {
      categories.push('Training & Knowledge');
    } else if (part.includes('process') || part.includes('workflow') || part.includes('procedure')) {
      categories.push('Process & Workflow');
    } else if (part.includes('performance') || part.includes('speed') || part.includes('efficiency')) {
      categories.push('Performance & Efficiency');
    } else if (part.includes('cost') || part.includes('pricing') || part.includes('budget')) {
      categories.push('Cost & Pricing');
    } else if (part.includes('security') || part.includes('compliance') || part.includes('audit')) {
      categories.push('Security & Compliance');
    } else if (part.includes('automation') || part.includes('ansible') || part.includes('scripting')) {
      categories.push('Automation');
    } else if (part.includes('follow') || part.includes('update') || part.includes('tracking')) {
      categories.push('Follow-up & Updates');
    } else if (part.includes('ticket') || part.includes('issue') || part.includes('incident')) {
      categories.push('Ticket Management');
  } else {
      categories.push('Other');
    }
  });
  
  // Remove duplicates and return
  return [...new Set(categories)];
};

// Helper function to categorize strength areas based on RATING_DESCRIPTION
const categorizeStrengthArea = (ratingDescription) => {
  if (!ratingDescription) return [];
  
  const description = ratingDescription.toLowerCase();
  
  // Split by comma and process each part
  const parts = description.split(',').map(part => part.trim()).filter(part => part);
  const categories = [];
  
  parts.forEach(part => {
    // Define categories based on common strength areas
    if (part.includes('communication') || part.includes('response') || part.includes('feedback') || part.includes('listening')) {
      categories.push('Communication Excellence');
    } else if (part.includes('delivery') || part.includes('timeline') || part.includes('schedule') || part.includes('on-time') || part.includes('punctual')) {
      categories.push('Delivery Excellence');
    } else if (part.includes('quality') || part.includes('testing') || part.includes('thorough') || part.includes('attention to detail')) {
      categories.push('Quality Excellence');
    } else if (part.includes('support') || part.includes('help') || part.includes('assistance') || part.includes('responsive')) {
      categories.push('Support Excellence');
    } else if (part.includes('documentation') || part.includes('guide') || part.includes('manual') || part.includes('clear')) {
      categories.push('Documentation Excellence');
    } else if (part.includes('training') || part.includes('knowledge') || part.includes('skill') || part.includes('expertise')) {
      categories.push('Knowledge Excellence');
    } else if (part.includes('process') || part.includes('workflow') || part.includes('procedure') || part.includes('efficient')) {
      categories.push('Process Excellence');
    } else if (part.includes('performance') || part.includes('speed') || part.includes('efficiency') || part.includes('fast')) {
      categories.push('Performance Excellence');
    } else if (part.includes('cost') || part.includes('pricing') || part.includes('budget') || part.includes('value')) {
      categories.push('Value Excellence');
    } else if (part.includes('security') || part.includes('compliance') || part.includes('audit') || part.includes('reliable')) {
      categories.push('Security Excellence');
    } else if (part.includes('innovation') || part.includes('creative') || part.includes('solution') || part.includes('problem-solving')) {
      categories.push('Innovation Excellence');
    } else if (part.includes('team') || part.includes('collaboration') || part.includes('partnership') || part.includes('relationship')) {
      categories.push('Partnership Excellence');
    } else if (part.includes('automation') || part.includes('ansible') || part.includes('scripting') || part.includes('automated')) {
      categories.push('Automation Excellence');
    } else if (part.includes('follow') || part.includes('update') || part.includes('tracking') || part.includes('monitoring')) {
      categories.push('Follow-up Excellence');
    } else if (part.includes('ticket') || part.includes('issue') || part.includes('incident') || part.includes('resolution')) {
      categories.push('Ticket Management Excellence');
    } else if (part.includes('great') || part.includes('excellent') || part.includes('good') || part.includes('outstanding')) {
      categories.push('General Excellence');
    } else {
      categories.push('General Excellence');
    }
  });
  
  // Remove duplicates and return
  return [...new Set(categories)];
};


// Summary styled components
const SummaryContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SummaryTitle = styled.h2`
  color: #1f2937;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 2px solid #cbd5e0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const SummaryCardTitle = styled.h3`
  color: #1f2937;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  text-align: center;
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const CategoryName = styled.span`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
`;

const CategoryCount = styled.span`
  font-weight: 700;
  color: #059669;
  font-size: 0.9rem;
  background: #f0fdf4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const StrengthCount = styled.span`
  font-weight: 700;
  color: #059669;
  font-size: 0.9rem;
  background: #f0fdf4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const ImprovementCount = styled.span`
  font-weight: 700;
  color: #dc2626;
  font-size: 0.9rem;
  background: #fef2f2;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

function TopExpectationsAnalysisDashboard({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, onBack }) {
  const [secondSheetData, setSecondSheetData] = useState([]);
  const [firstSheetData, setFirstSheetData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBucketAnalysis, setShowBucketAnalysis] = useState(false);
  const [bucketViewType, setBucketViewType] = useState('account'); // 'account' or 'bu'
  const [showDoingWellBucketAnalysis, setShowDoingWellBucketAnalysis] = useState(false);
  const [doingWellBucketViewType, setDoingWellBucketViewType] = useState('account'); // 'account' or 'bu'
  // Remarks upload state
  const [remarksFileName, setRemarksFileName] = useState('');
  const [remarksData, setRemarksData] = useState([]);
  const remarksInputRef = useRef(null);
  const [remarksImpView, setRemarksImpView] = useState('account'); // 'account' | 'bu'
  const [remarksStrView, setRemarksStrView] = useState('account'); // 'account' | 'bu'

  const handleRemarksUpload = async (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      setRemarksFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setRemarksData(json);
      // Persist to sessionStorage for session retention
      try {
        sessionStorage.setItem('remarksTopExpectationsData', JSON.stringify(json));
        sessionStorage.setItem('remarksTopExpectationsFileName', file.name);
      } catch (storageErr) {
        console.warn('Unable to persist remarks to sessionStorage:', storageErr);
      }
      console.log('📝 Loaded Remarks for Top Expectations:', { file: file.name, rows: json.length, sample: json.slice(0, 3) });
    } catch (err) {
      console.error('Failed to read Remarks file:', err);
      alert('Failed to read the Remarks file. Please ensure it is a valid Excel file.');
    }
  };

  const clearRemarksUpload = () => {
    setRemarksFileName('');
    setRemarksData([]);
    if (remarksInputRef.current) {
      remarksInputRef.current.value = '';
    }
    try {
      sessionStorage.removeItem('remarksTopExpectationsData');
      sessionStorage.removeItem('remarksTopExpectationsFileName');
    } catch (storageErr) {
      console.warn('Unable to clear remarks from sessionStorage:', storageErr);
    }
  };

  // Restore remarks from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('remarksTopExpectationsData');
      const storedName = sessionStorage.getItem('remarksTopExpectationsFileName');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRemarksData(parsed);
          setRemarksFileName(storedName || '');
          console.log('📝 Restored Remarks for Top Expectations from sessionStorage:', {
            file: storedName,
            rows: parsed.length
          });
        }
      }
    } catch (err) {
      console.warn('Failed to restore remarks from sessionStorage:', err);
    }
  }, []);

  // Helpers to resolve column names from remarks file
  const getRemarksValue = (row, keys) => {
    // Normalize helper: lowercase, remove spaces/underscores/dashes
    const norm = (s) => (s || '').toString().toLowerCase().replace(/[\s_\-–—]+/g, '');
    const normalizedRow = {};
    try {
      Object.keys(row || {}).forEach(k => {
        normalizedRow[norm(k)] = row[k];
      });
    } catch {}

    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const k of keyList) {
      const nk = norm(k);
      if (nk in normalizedRow) {
        const val = normalizedRow[nk];
        if (val !== undefined && val !== null && val !== '') return val;
      }
    }

    // loose contains match
    const targets = keyList.map(k => norm(k));
    for (const nk in normalizedRow) {
      if (targets.some(t => nk.includes(t))) {
        const val = normalizedRow[nk];
        if (val !== undefined && val !== null && val !== '') return val;
      }
    }
    return undefined;
  };

  const buildRemarksBuckets = (viewBy, columnLabels) => {
    if (!Array.isArray(remarksData) || remarksData.length === 0) return [];
    const buKeys = ['BUSINESS UNIT', 'BUSSINESS UNIT', 'BUSINESS_UNIT', 'Business Unit'];
    const acctKeys = ['CUSTOMER NAME', 'CUSTOMER_NAME', 'Customer Name'];
    const colKeys = Array.isArray(columnLabels) ? columnLabels : [columnLabels];

    const counterMap = new Map(); // key: `${group}|${category}` -> count

    remarksData.forEach(row => {
      const bu = normalizeBusinessUnitDisplay((getRemarksValue(row, buKeys) || 'Unknown').toString().trim());
      const acct = (getRemarksValue(row, acctKeys) || 'Unknown').toString().trim();
      const group = viewBy === 'bu' ? bu : acct;
      const rawVal = getRemarksValue(row, colKeys);
      if (!rawVal) return;
      const parts = rawVal.toString().split(',').map(p => p.trim()).filter(Boolean);
      if (parts.length === 0) return;
      parts.forEach(cat => {
        const key = `${group}|${cat}`;
        counterMap.set(key, (counterMap.get(key) || 0) + 1);
      });
    });

    // Convert to rows
    const rows = [];
    for (const [key, count] of counterMap.entries()) {
      const [group, category] = key.split('|');
      rows.push({ group, category, count });
    }

    // Sort: fixed BU order when BU view
    if (viewBy === 'bu') {
      const ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];
      rows.sort((a, b) => (ORDER.indexOf(a.group) - ORDER.indexOf(b.group)) || a.category.localeCompare(b.category));
    } else {
      rows.sort((a, b) => a.group.localeCompare(b.group) || a.category.localeCompare(b.category));
    }

    return rows.map((r, idx) => ({ sNo: idx + 1, ...r }));
  };

  // Category-level summary: group by Category, count occurrences, and list accounts (or BUs) per category
  const buildRemarksCategorySummary = (viewBy, columnLabels) => {
    if (!Array.isArray(remarksData) || remarksData.length === 0) return [];
    const buKeys = ['BUSINESS UNIT', 'BUSSINESS UNIT', 'BUSINESS_UNIT', 'Business Unit'];
    const acctKeys = ['CUSTOMER NAME', 'CUSTOMER_NAME', 'Customer Name'];
    const respKeys = ['RESPONDENT NAME', 'RESPONDENT_NAME', 'Respondent Name'];
    const colKeys = Array.isArray(columnLabels) ? columnLabels : [columnLabels];

    const categoryToGroups = new Map(); // category -> Set(groups)
    const categoryToRespondents = new Map(); // category -> Set(respondent names)

    remarksData.forEach(row => {
      const bu = normalizeBusinessUnitDisplay((getRemarksValue(row, buKeys) || 'Unknown').toString().trim());
      const acct = (getRemarksValue(row, acctKeys) || 'Unknown').toString().trim();
      const respondent = (getRemarksValue(row, respKeys) || '').toString().trim();
      const group = viewBy === 'bu' ? bu : acct;
      const rawVal = getRemarksValue(row, colKeys);
      if (!rawVal) return;
      const parts = rawVal.toString().split(',').map(p => p.trim()).filter(Boolean);
      parts.forEach(cat => {
        if (!categoryToGroups.has(cat)) categoryToGroups.set(cat, new Set());
        categoryToGroups.get(cat).add(group);
        if (respondent) {
          if (!categoryToRespondents.has(cat)) categoryToRespondents.set(cat, new Set());
          categoryToRespondents.get(cat).add(respondent);
        }
      });
    });

    // Build rows
    let rows = Array.from(categoryToGroups.entries()).map(([category, groupSet], idx) => {
      const groups = Array.from(groupSet);
      const respondents = Array.from(categoryToRespondents.get(category) || []);
      return {
        sNo: idx + 1,
        category,
        count: groups.length,
        groups,
        respondents
      };
    });

    // Sort by Category; BU order only applies within listing if needed
    rows.sort((a, b) => a.category.localeCompare(b.category));
    return rows;
  };
  
  // Get ACSAT cycle from global context
  const { acsatCycle } = useCSATContext();

  const isDateOnOrAfterCsatStart = (dateValue, cycleStartDate) => {
    if (!cycleStartDate || !dateValue) return true;
    return isDateOnOrAfterAcsatCycleStart(dateValue, cycleStartDate);
  };

  // Load first sheet data for QUESTION
  useEffect(() => {
    console.log('🔍 TopExpectationsAnalysisDashboard: Loading first sheet data...');
    console.log('excelData:', excelData);
    console.log('SheetNames:', excelData?.SheetNames);
    
    if (excelData && excelData.SheetNames) {
      const firstSheetName = excelData.SheetNames.find(name => 
        name.toLowerCase().includes('csat received report') || 
        name.toLowerCase().includes('csat received') ||
        name.toLowerCase().includes('received report')
      );

      console.log('Found first sheet name:', firstSheetName);

      if (firstSheetName) {
        const sheet = excelData.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData && jsonData.length > 0) {
          let headerRowIndex = -1;
          let headers = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowStr = row.join(' ').toLowerCase();
              if (rowStr.includes('customer') || rowStr.includes('question') || rowStr.includes('rating') || 
                  rowStr.includes('business') || rowStr.includes('perspective') || rowStr.includes('project')) {
                headerRowIndex = i;
                headers = row.map((h) => (h != null ? String(h).trim() : h));
                console.log('🔍 Found header row at index:', i);
                console.log('🔍 Headers:', headers);
                break;
              }
            }
          }

          if (headerRowIndex !== -1) {
            const dataRows = jsonData.slice(headerRowIndex + 1);
            const processedFirstSheet = dataRows
              .filter(row => row && row.length > 0)
              .map((row) => normalizeAcsatRowCanonicalFields(buildRowFromHeaders(headers, row)))
              .filter(row => row.CUSTOMER_ID || row.CUST_ID)
              .filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));
            
            setFirstSheetData(processedFirstSheet);
            console.log('🔍 TopExpectationsAnalysisDashboard - First sheet data loaded:', processedFirstSheet.length, 'rows');
            console.log('ACSAT Cycle for filtering:', acsatCycle);
            console.log('First sheet sample data:', processedFirstSheet.slice(0, 2));
            if (processedFirstSheet.length > 0) {
              console.log('Available columns in first sheet:', Object.keys(processedFirstSheet[0]));
              console.log('YEAR - QUARTER values in filtered data:', [...new Set(processedFirstSheet.map((row) => getYearQuarterFromRow(row)))]);
              
              // Debug: Check for BUSINESS UNIT, CUSTOMER_ID, CUSTOMER NAME data
              const businessUnits = [...new Set(processedFirstSheet.map(row => row.BUSINESS_UNIT || row['BUSINESS UNIT'] || row['Business Unit']).filter(bu => bu))];
              const customerIds = [...new Set(processedFirstSheet.map(row => row.CUSTOMER_ID || row['CUSTOMER_ID'] || row.CUST_ID || row['CUST_ID']).filter(id => id))];
              const customerNames = [...new Set(processedFirstSheet.map(row => row.CUSTOMER_NAME || row['CUSTOMER NAME'] || row['Customer Name']).filter(name => name))];
              
              console.log('Business Units found in first sheet:', businessUnits.slice(0, 10));
              console.log('Customer IDs found in first sheet:', customerIds.slice(0, 10));
              console.log('Customer Names found in first sheet:', customerNames.slice(0, 10));
              
              // Debug: Check for PROJ_ID and PROJECT NAME data
              const projIds = [...new Set(processedFirstSheet.map(row => row.PROJ_ID || row['PROJ_ID'] || row['Project ID'] || row['PROJECT_ID'] || row['proj_id'] || row['project_id']).filter(id => id))];
              const projectNames = [...new Set(processedFirstSheet.map(row => row.PROJECT_NAME || row['PROJECT NAME'] || row['Project Name'] || row['PROJECT_NAME'] || row['project_name']).filter(name => name))];
              
              console.log('PROJ_IDs found in first sheet:', projIds.slice(0, 10));
              console.log('PROJECT NAMEs found in first sheet:', projectNames.slice(0, 10));
              
              // Debug: Show all column names to help identify the correct column names
              if (processedFirstSheet.length > 0) {
                const allColumns = Object.keys(processedFirstSheet[0]);
                console.log('🔍 All available columns in first sheet:', allColumns);
                console.log('🔍 Columns containing "proj" or "project":', allColumns.filter(col => col.toLowerCase().includes('proj')));
                console.log('🔍 Columns containing "name":', allColumns.filter(col => col.toLowerCase().includes('name')));
              }
            }
          }
        } else {
          setFirstSheetData([]);
        }
      } else {
        setFirstSheetData([]);
      }
    }
  }, [excelData, acsatCycle]);

  // Load second sheet data
  useEffect(() => {
    console.log('🔍 TopExpectationsAnalysisDashboard: Loading second sheet data...');
    console.log('excelData:', excelData);
    console.log('SheetNames:', excelData?.SheetNames);
    
    if (excelData && excelData.SheetNames) {
      const secondSheetName = excelData.SheetNames.find(name => 
        name.toLowerCase().includes('csat sent and received report') || 
        name.toLowerCase().includes('csat sent and received') ||
        name.toLowerCase().includes('sent and received report')
      );

      console.log('Found second sheet name:', secondSheetName);

      if (secondSheetName) {
        const sheet = excelData.Sheets[secondSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        if (jsonData && jsonData.length > 0) {
          let headerRowIndex = -1;
          let headers = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowStr = row.join(' ').toLowerCase();
              if (rowStr.includes('customer') || rowStr.includes('css_sent_date') || rowStr.includes('css_received_date')) {
                headerRowIndex = i;
                headers = row.map((h) => (h != null ? String(h).trim() : h));
                break;
              }
            }
          }

          if (headerRowIndex !== -1) {
            const dataRows = jsonData.slice(headerRowIndex + 1);
            const processedSecondSheet = dataRows
              .filter(row => row && row.length > 0)
              .map((row) => normalizeAcsatRowCanonicalFields(buildRowFromHeaders(headers, row)))
              .filter(row => row.CUSTOMER_ID || row.CUST_ID)
              .filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle));
            
            setSecondSheetData(processedSecondSheet);
            console.log('Second sheet data loaded:', processedSecondSheet.length, 'rows');
            console.log('Second sheet sample data:', processedSecondSheet.slice(0, 2));
            if (processedSecondSheet.length > 0) {
              console.log('Available columns in second sheet:', Object.keys(processedSecondSheet[0]));
            }
          }
        } else {
          setSecondSheetData([]);
        }
      } else {
        setSecondSheetData([]);
      }
    }
  }, [excelData, acsatCycle]);

  // Process Excel data
  const processedData = useMemo(() => {
    console.log('🔍 TopExpectationsAnalysisDashboard: Processing data...');
    console.log('excelData:', excelData);
    console.log('secondSheetData.length:', secondSheetData.length);
    console.log('firstSheetData.length:', firstSheetData.length);
    console.log('acsatCycleStartDateFormatted:', acsatCycleStartDateFormatted);
    console.log('searchTerm:', searchTerm);
    
    if (!excelData || !secondSheetData.length) {
      console.log('❌ No Excel data or second sheet data available');
      return { data: [], headers: {} };
    }

    try {
      console.log('✅ Processing Top Expectations Analysis data...');
      console.log('Second sheet data sample:', secondSheetData.slice(0, 3));
      console.log('CSAT cycle start date:', acsatCycleStartDateFormatted);

      // Process individual records (no grouping)
      const individualRecords = [];
      let processedCount = 0;
      let includedCount = 0;
      let skippedCount = 0;
        
        // Process first sheet data for individual records
        if (firstSheetData.length > 0) {
          console.log('🔍 Processing individual records from first sheet...');
          console.log('First sheet data sample:', firstSheetData.slice(0, 2));
          console.log('Total first sheet records to process:', firstSheetData.length);
          
          firstSheetData.forEach((row, index) => {
            processedCount++;
            const businessUnit = normalizeBusinessUnitDisplay(row.BUSINESS_UNIT || row['BUSINESS UNIT'] || row['Business Unit'] || 'Unknown');
            const customerId = row.CUSTOMER_ID || row['CUSTOMER_ID'] || row['Customer ID'] || row.CUST_ID || row['CUST_ID'] || 'Unknown';
            const customerName = row.CUSTOMER_NAME || row['CUSTOMER NAME'] || row['Customer Name'] || 'Unknown';
            const respondentName = row.RESPONDENT_NAME || row['RESPONDENT NAME'] || row['Respondent Name'] || row['RESPONDENT_NAME'] || 'Unknown';
            // Debug: Show all available keys for the first few records
            if (index < 3) {
              console.log(`🔍 All keys in row ${index}:`, Object.keys(row));
              console.log(`🔍 Row data sample:`, Object.entries(row).slice(0, 10));
            }
            
            // Try to find PROJ_ID column with specific naming conventions
            const projIdKeys = Object.keys(row).filter(key => 
              key && (
                key.toLowerCase() === 'proj_id' ||
                key.toLowerCase() === 'project_id' ||
                key.toLowerCase() === 'projectid' ||
                key.toLowerCase() === 'projid' ||
                (key.toLowerCase().includes('proj') && key.toLowerCase().includes('id')) ||
                (key.toLowerCase().includes('project') && key.toLowerCase().includes('id'))
              )
            );
            let projId = 'N/A';
            if (projIdKeys.length > 0) {
              const projIdValue = row[projIdKeys[0]];
              console.log(`🔍 Proj ID value extraction:`, {
                key: projIdKeys[0],
                value: projIdValue,
                type: typeof projIdValue,
                isUndefined: projIdValue === undefined,
                isNull: projIdValue === null,
                isEmpty: projIdValue === '',
                stringValue: String(projIdValue)
              });
              
              // If the detected column has undefined value, try other variations
              if (projIdValue === undefined || projIdValue === null || projIdValue === '') {
                console.log(`🔍 Detected PROJ_ID column has undefined value, trying other variations...`);
                // Try different column name variations
                const alternativeKeys = [
                  'PROJ_ID', 'Project ID', 'project_id', 'Project_ID',
                  'PROJECT_ID', 'ProjectId', 'proj_id', 'Proj_ID'
                ];
                
                for (const altKey of alternativeKeys) {
                  if (row[altKey] !== undefined && row[altKey] !== null && row[altKey] !== '') {
                    projId = row[altKey];
                    console.log(`🔍 Found proj ID in alternative column:`, { key: altKey, value: projId });
                    break;
                  }
                }
              } else {
                projId = projIdValue;
              }
            }
            
            // Try to find PROJECT NAME column with specific naming conventions
            const projectNameKeys = Object.keys(row).filter(key => 
              key && (
                key.toLowerCase() === 'project_name' ||
                key.toLowerCase() === 'project name' ||
                key.toLowerCase() === 'projectname' ||
                key.toLowerCase() === 'project_name' ||
                key.toLowerCase() === 'project name' ||
                (key.toLowerCase().includes('project') && key.toLowerCase().includes('name') && !key.toLowerCase().includes('email'))
              )
            );
            let projectName = 'N/A';
            if (projectNameKeys.length > 0) {
              const projectNameValue = row[projectNameKeys[0]];
              console.log(`🔍 Project name value extraction:`, {
                key: projectNameKeys[0],
                value: projectNameValue,
                type: typeof projectNameValue,
                isUndefined: projectNameValue === undefined,
                isNull: projectNameValue === null,
                isEmpty: projectNameValue === '',
                stringValue: String(projectNameValue)
              });
              
              // If the detected column has undefined value, try other variations
              if (projectNameValue === undefined || projectNameValue === null || projectNameValue === '') {
                console.log(`🔍 Detected column has undefined value, trying other variations...`);
                // Try different column name variations
                const alternativeKeys = [
                  'PROJECT_NAME', 'Project Name', 'project_name', 'Project_Name',
                  'PROJ_NAME', 'Proj Name', 'proj_name', 'Proj_Name'
                ].filter(key => !key.toLowerCase().includes('email'));
                
                for (const altKey of alternativeKeys) {
                  if (row[altKey] !== undefined && row[altKey] !== null && row[altKey] !== '') {
                    projectName = row[altKey];
                    console.log(`🔍 Found project name in alternative column:`, { key: altKey, value: projectName });
                    break;
                  }
                }
              } else {
                projectName = projectNameValue;
              }
            }
            
            // Debug: Show what was found for the first few records
            if (index < 3) {
              console.log(`🔍 PROJ_ID search for row ${index}:`, {
                projIdKeys,
                projId,
                allKeys: Object.keys(row),
                keysWithProj: Object.keys(row).filter(k => k.toLowerCase().includes('proj')),
                keysWithProject: Object.keys(row).filter(k => k.toLowerCase().includes('project'))
              });
              console.log(`🔍 PROJECT NAME search for row ${index}:`, {
                projectNameKeys,
                projectName,
                keysWithName: Object.keys(row).filter(k => k.toLowerCase().includes('name')),
                rawProjectName: row['PROJECT NAME'],
                rawProjectName2: row['PROJECT_NAME'],
                rawProjectName3: row['Project Name'],
                allProjectValues: projectNameKeys.map(key => ({ key, value: row[key] }))
              });
            }
            
            // Additional fallback: If we still don't have project data, try to find any column with actual data
            if (projId === 'N/A' && projectName === 'N/A') {
              console.log(`🔍 No project data found, searching for any columns with actual data...`);
              const allKeys = Object.keys(row);
              const columnsWithData = allKeys.filter(key => 
                key && 
                row[key] !== undefined && 
                row[key] !== null && 
                row[key] !== '' &&
                !key.toLowerCase().includes('customer') &&
                !key.toLowerCase().includes('business') &&
                !key.toLowerCase().includes('question') &&
                !key.toLowerCase().includes('rating') &&
                !key.toLowerCase().includes('perspective') &&
                !key.toLowerCase().includes('email') &&
                !key.toLowerCase().includes('date') &&
                !key.toLowerCase().includes('time')
              );
              
              console.log(`🔍 Columns with actual data:`, 
                columnsWithData.map(key => ({ key, value: row[key], type: typeof row[key] }))
              );
              
              if (columnsWithData.length >= 2) {
                projId = row[columnsWithData[0]];
                projectName = row[columnsWithData[1]];
                console.log(`🔍 Using first two available columns:`, { projId, projectName });
              } else if (columnsWithData.length === 1) {
                projId = row[columnsWithData[0]];
                projectName = 'N/A';
                console.log(`🔍 Using only available column:`, { projId, projectName });
              }
            }
            
            // Fallback: If no specific columns found, try to use any column that might contain project info
            if (projId === 'N/A' && projectName === 'N/A') {
              // Try direct access to common column names first
              const directProjId = row['PROJ_ID'] || row['PROJECT_ID'] || row['Project ID'] || row['proj_id'] || row['project_id'] || row['PROJ_ID'] || row['Project_ID'];
              const directProjectName = row['PROJECT NAME'] || row['PROJECT_NAME'] || row['Project Name'] || row['project_name'];
              
              console.log(`🔍 Direct access attempt:`, {
                directProjId,
                directProjectName,
                allKeys: Object.keys(row),
                projectNameKeys: projectNameKeys
              });
              
              if (directProjId) {
                projId = directProjId;
                console.log(`🔍 Direct access found PROJ_ID:`, directProjId);
              }
              if (directProjectName) {
                projectName = directProjectName;
                console.log(`🔍 Direct access found PROJECT NAME:`, directProjectName);
              }
              
              // If still not found, look for any column that might be project-related
              if (projId === 'N/A' && projectName === 'N/A') {
                const allKeys = Object.keys(row);
                const possibleProjColumns = allKeys.filter(key => 
                  key && (
                    key.toLowerCase().includes('proj') ||
                    key.toLowerCase().includes('project')
                  )
                );
                
                console.log(`🔍 All possible project columns with values:`, 
                  possibleProjColumns.map(key => ({ key, value: row[key], type: typeof row[key] }))
                );
                
                if (possibleProjColumns.length > 0) {
                  console.log(`🔍 Fallback: Found possible project columns:`, possibleProjColumns);
                  // Use the first column that might be project-related
                  const projValue = row[possibleProjColumns[0]];
                  projId = (projValue !== undefined && projValue !== null && projValue !== '') ? projValue : 'N/A';
                  if (possibleProjColumns.length > 1) {
                    const projectValue = row[possibleProjColumns[1]];
                    projectName = (projectValue !== undefined && projectValue !== null && projectValue !== '') ? projectValue : 'N/A';
                  }
                } else {
                  // Last resort: try to use any available columns that are not customer-related
                  const allAvailableKeys = Object.keys(row).filter(key => 
                    key && 
                    row[key] && 
                    row[key] !== '' && 
                    !key.toLowerCase().includes('customer') &&
                    !key.toLowerCase().includes('business') &&
                    !key.toLowerCase().includes('question') &&
                    !key.toLowerCase().includes('rating') &&
                    !key.toLowerCase().includes('perspective') &&
                    !key.toLowerCase().includes('email') &&
                    !key.toLowerCase().includes('date') &&
                    !key.toLowerCase().includes('time')
                  );
                  
                  console.log(`🔍 All available non-customer columns with values:`, 
                    allAvailableKeys.map(key => ({ key, value: row[key], type: typeof row[key] }))
                  );
                  
                  if (allAvailableKeys.length > 0) {
                    console.log(`🔍 Last resort: Using available non-customer columns:`, allAvailableKeys);
                    // Try to use columns that might contain useful data
                    if (allAvailableKeys.length >= 2) {
                      const projValue = row[allAvailableKeys[0]];
                      const projectValue = row[allAvailableKeys[1]];
                      projId = (projValue !== undefined && projValue !== null && projValue !== '') ? projValue : 'N/A';
                      projectName = (projectValue !== undefined && projectValue !== null && projectValue !== '') ? projectValue : 'N/A';
                    } else if (allAvailableKeys.length === 1) {
                      const projValue = row[allAvailableKeys[0]];
                      projId = (projValue !== undefined && projValue !== null && projValue !== '') ? projValue : 'N/A';
                      projectName = 'N/A';
                    }
                  }
                }
              }
            }
            
            // Debug: Log every 10th record to see what's being processed
            if (index % 10 === 0) {
              console.log(`🔍 Processing record ${index}:`, {
                businessUnit,
                customerId,
                customerName,
                projId,
                projectName,
                question: row.QUESTION || row['QUESTION'],
                ratingDescription: row.RATING_DESCRIPTION || row['RATING_DESCRIPTION'],
                availableKeys: Object.keys(row).slice(0, 10),
                projIdKeys,
                projectNameKeys,
                allKeys: Object.keys(row)
              });
            }
            
            // Get dates from the first sheet (CSAT received Report) for date filtering
            const firstSheetSentDate = getCsatSentDateFromRow(row);
            const firstSheetReceivedDate = getCsatReceivedDateFromRow(row);

            const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
            const isCompletedStatus = statusVal === 'completed';

            // Check if both dates meet the cycle start date requirement (both must be >= cycle start date)
            const sentDateValid = !firstSheetSentDate || isDateOnOrAfterCsatStart(firstSheetSentDate, acsatCycleStartDateFormatted);
            const receivedDateValid = (!firstSheetReceivedDate || isDateOnOrAfterCsatStart(firstSheetReceivedDate, acsatCycleStartDateFormatted));
            
            // Check if this record has the specific QUESTION for expectations
            const rating = row.RATING || row['RATING'] || row['Rating'];
            const perspective = row.PERSPECTIVE || row['PERSPECTIVE'] || row['Perspective'];
            const question = row.QUESTION || row['QUESTION'] || row['Question'];
            const isRatingZero = rating === 0 || rating === '0';
            const isPerspectiveBlank = !perspective || perspective === '' || perspective === null || perspective === undefined;
            const isExpectationsQuestion = question === 'Please list your top expectations where Neurealm is doing well.' || 
                                         question === 'Please list your top expectations where Neurealm can do better.';
            const isSpecialCase = isRatingZero && isPerspectiveBlank && isExpectationsQuestion;
            
            // Only include records with specific QUESTION for expectations
            if (!isExpectationsQuestion) {
              skippedCount++;
              console.log(`⏰ Skipping record for ${customerId} - not an expectations question`);
              console.log(`  QUESTION: ${question} (isExpectationsQuestion: ${isExpectationsQuestion})`);
              return; // Skip this record
            }
            
            // Only include records where both dates are valid (or no dates are present) OR if RATING=0 and PERSPECTIVE=blank
            if ((!sentDateValid || !receivedDateValid) && !isSpecialCase) {
              skippedCount++;
              console.log(`⏰ Skipping record for ${customerId} - dates don't meet cycle start date requirement`);
              console.log(`  CSAT SENT DATE: ${firstSheetSentDate} (valid: ${sentDateValid})`);
              console.log(`  CSAT RECEIVED DATE: ${firstSheetReceivedDate} (valid: ${receivedDateValid})`);
              console.log(`  RATING: ${rating} (isRatingZero: ${isRatingZero})`);
              console.log(`  PERSPECTIVE: ${perspective} (isPerspectiveBlank: ${isPerspectiveBlank})`);
              console.log(`  QUESTION: ${question} (isExpectationsQuestion: ${isExpectationsQuestion})`);
              console.log(`  Cycle Start Date: ${acsatCycleStartDateFormatted}`);
              return; // Skip this record
            }
            
            if (isSpecialCase) {
              console.log(`✅ Including record for ${customerId} - RATING=0, PERSPECTIVE=blank, and expectations question (special case)`);
              console.log(`  RATING: ${rating} (isRatingZero: ${isRatingZero})`);
              console.log(`  PERSPECTIVE: ${perspective} (isPerspectiveBlank: ${isPerspectiveBlank})`);
              console.log(`  QUESTION: ${question} (isExpectationsQuestion: ${isExpectationsQuestion})`);
            } else {
              console.log(`✅ Including record for ${customerId} - dates meet cycle start date requirement`);
              console.log(`  CSAT SENT DATE: ${firstSheetSentDate} (valid: ${sentDateValid})`);
              console.log(`  CSAT RECEIVED DATE: ${firstSheetReceivedDate} (valid: ${receivedDateValid})`);
              console.log(`  Cycle Start Date: ${acsatCycleStartDateFormatted}`);
            }
            
            // Get CSS counts and CSAT SENT DATE from second sheet for this customer
            let sentCount = 0;
            let receivedCount = 0;
            let csatSentDate = 'N/A';
            
            if (secondSheetData.length > 0) {
              const customerSecondSheetData = secondSheetData.filter(secondRow => {
                const secondRowCustomerId = secondRow.CUSTOMER_ID || secondRow['CUSTOMER_ID'] || secondRow['Customer ID'] || secondRow.CUST_ID || secondRow['CUST_ID'];
                return secondRowCustomerId === customerId;
              });
              
              // Filter records by date and get the most recent valid CSAT SENT DATE
              const validRecords = customerSecondSheetData.filter(secondRow => {
                const cssSentDate = getCsatSentDateFromRow(secondRow);
                const cssReceivedDate = getCsatReceivedDateFromRow(secondRow);

                const secondRowStatusVal = (secondRow['STATUS'] ?? secondRow['Status'] ?? '').toString().trim().toLowerCase();
                const secondRowIsCompletedStatus = secondRowStatusVal === 'completed';

                const sentDateValid = !cssSentDate || isDateOnOrAfterCsatStart(cssSentDate, acsatCycleStartDateFormatted);
                const receivedDateValid = secondRowIsCompletedStatus || !cssReceivedDate || isDateOnOrAfterCsatStart(cssReceivedDate, acsatCycleStartDateFormatted);

                return sentDateValid && receivedDateValid;
              });
              
              // Get the most recent valid CSAT SENT DATE
              if (validRecords.length > 0) {
                const latestValidRecord = validRecords[validRecords.length - 1];
                csatSentDate = getCsatSentDateFromRow(latestValidRecord) || 'N/A';
              }
              
              // Count valid survey records
              customerSecondSheetData.forEach(secondRow => {
                const cssSentDate = getCsatSentDateFromRow(secondRow);
                const cssReceivedDate = getCsatReceivedDateFromRow(secondRow);

                const secondRowStatusVal = (secondRow['STATUS'] ?? secondRow['Status'] ?? '').toString().trim().toLowerCase();
                const secondRowIsCompletedStatus = secondRowStatusVal === 'completed';

                if (cssSentDate && isDateOnOrAfterCsatStart(cssSentDate, acsatCycleStartDateFormatted)) {
                  sentCount++;
                }
                if (secondRowIsCompletedStatus || (cssReceivedDate && isDateOnOrAfterCsatStart(cssReceivedDate, acsatCycleStartDateFormatted))) {
                  receivedCount++;
                }
              });
            }
            
            // Only include records that have valid CSAT SENT DATE from second sheet
            if (csatSentDate === 'N/A' || !isDateOnOrAfterCsatStart(csatSentDate, acsatCycleStartDateFormatted)) {
              console.log(`⏰ Skipping record for ${customerId} - no valid CSAT SENT DATE from second sheet`);
              console.log(`  CSAT SENT DATE from second sheet: ${csatSentDate}`);
              console.log(`  Cycle Start Date: ${acsatCycleStartDateFormatted}`);
              return; // Skip this record
            }
            
             const result = {
               sno: individualRecords.length + 1,
               businessUnit,
               customerId,
               customerName,
               respondentName,
               projId,
               projectName,
               csatSentDate
             };
            
            // Process QUESTION data for this record
            const questionCategories = {};
            const improvementAreas = [];
            const strengthAreas = [];
            
            const ratingDescription = row.RATING_DESCRIPTION || row['RATING_DESCRIPTION'] || row['Rating Description'];
            
            if (question && ratingDescription) {
              if (!questionCategories[question]) {
                questionCategories[question] = [];
              }
              questionCategories[question].push(ratingDescription);
              
              // Categorize improvement areas for specific question
              if (question === 'Please list your top expectations where Neurealm can do better.') {
                const categories = categorizeImprovementArea(ratingDescription);
                categories.forEach(category => {
                if (category && !improvementAreas.includes(category)) {
                  improvementAreas.push(category);
                }
                });
              }
              
              // Categorize strength areas for specific question
              if (question === 'Please list your top expectations where Neurealm is doing well.') {
                const categories = categorizeStrengthArea(ratingDescription);
                categories.forEach(category => {
                  if (category && !strengthAreas.includes(category)) {
                    strengthAreas.push(category);
                  }
                });
              }
              
            }
            
            // Add question category columns
            Object.keys(questionCategories).forEach(category => {
              result[category] = questionCategories[category].join('; ');
            });
            
            // Add Top Expectations - Can do Better column
            result['Top Expectations - Can do Better'] = improvementAreas.join(', ');
            
            // Add Top Expectations - Doing Well column
            result['Top Expectations - Doing Well'] = strengthAreas.join(', ');
            
            individualRecords.push(result);
            includedCount++;
            
            // Debug: Log the first few included records to verify PROJ_ID and PROJECT NAME
            if (includedCount <= 5) {
              console.log(`✅ Included record ${includedCount}:`, {
                businessUnit: result.businessUnit,
                customerId: result.customerId,
                customerName: result.customerName,
                projId: result.projId,
                projectName: result.projectName,
                sno: result.sno
              });
            }
          });
        }
        
        const processedRows = individualRecords;
        console.log('📊 Individual records processed:', processedRows.length);
        console.log('📊 Processing Summary:');
        console.log(`  - Total records processed: ${processedCount}`);
        console.log(`  - Records included: ${includedCount}`);
        console.log(`  - Records skipped: ${skippedCount}`);
        console.log(`  - Final records in dashboard: ${processedRows.length}`);
        console.log('📊 Individual records sample:', processedRows.slice(0, 3));

      console.log('Processed rows count:', processedRows.length);
      console.log('Sample processed data:', processedRows.slice(0, 3));

      // Apply search filtering
      let filteredRows = processedRows;
      if (searchTerm.trim()) {
        filteredRows = processedRows.filter(row => {
          const customerName = (row.customerName || '').toLowerCase();
          const searchLower = searchTerm.toLowerCase();
          
          const customerMatch = !searchTerm.trim() || customerName.includes(searchLower);
          
          return customerMatch;
        });
        console.log('🔍 Search filtering applied:', filteredRows.length, 'rows match search terms');
        console.log('  Customer search term:', searchTerm);
      }

      // Calculate summary data
      const summaryData = {
        improvements: {},
        strengths: {}
      };

      // Count improvement categories
      filteredRows.forEach(row => {
        const improvement = row['Top Expectations - Can do Better'];
        if (improvement && improvement !== 'N/A') {
          const improvementCategories = improvement.split(', ').filter(cat => cat.trim());
          improvementCategories.forEach(category => {
            const trimmedCategory = category.trim();
            if (trimmedCategory) {
              summaryData.improvements[trimmedCategory] = (summaryData.improvements[trimmedCategory] || 0) + 1;
            }
          });
        }
      });

      // Count strength categories
      filteredRows.forEach(row => {
        const strength = row['Top Expectations - Doing Well'];
        if (strength && strength !== 'N/A') {
          const strengthCategories = strength.split(', ').filter(cat => cat.trim());
          strengthCategories.forEach(category => {
            const trimmedCategory = category.trim();
            if (trimmedCategory) {
              summaryData.strengths[trimmedCategory] = (summaryData.strengths[trimmedCategory] || 0) + 1;
            }
          });
        }
      });

      // Sort categories by count (descending)
      const sortedImprovements = summaryData.improvements ? Object.entries(summaryData.improvements)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) : []; // Top 10 improvements

      const sortedStrengths = summaryData.strengths ? Object.entries(summaryData.strengths)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10) : []; // Top 10 strengths

      console.log('📊 Summary data calculated:', {
        improvements: sortedImprovements,
        strengths: sortedStrengths
      });

      // Apply fixed BU order for consistency
      const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];
      const sortedByBU = [...filteredRows].sort((a, b) => {
        const aBU = (a.businessUnit || '').toString().trim();
        const bBU = (b.businessUnit || '').toString().trim();
        const aIndex = BU_ORDER.findIndex(bu => 
          bu.toLowerCase() === aBU.toLowerCase() || 
          aBU.toLowerCase().includes(bu.toLowerCase()) ||
          bu.toLowerCase().includes(aBU.toLowerCase())
        );
        const bIndex = BU_ORDER.findIndex(bu => 
          bu.toLowerCase() === bBU.toLowerCase() || 
          bBU.toLowerCase().includes(bu.toLowerCase()) ||
          bu.toLowerCase().includes(bBU.toLowerCase())
        );
        // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });

      return {
        data: sortedByBU,
        headers: {
          businessUnit: 'BUSINESS UNIT',
          customerId: 'CUSTOMER_ID',
          customerName: 'CUSTOMER NAME'
        },
        summary: {
          improvements: sortedImprovements,
          strengths: sortedStrengths
        }
      };
    } catch (error) {
      console.error('Error processing Top Expectations Analysis data:', error);
      return { data: [], headers: {} };
    }
  }, [excelData, secondSheetData, firstSheetData, acsatCycleStartDateFormatted, searchTerm]);

  // Bucket analysis for Top Expectations - Can do Better and Doing Well
  const bucketAnalysis = useMemo(() => {
    if (!processedData.data || processedData.data.length === 0) {
      return { 
        improvements: { accountWise: {}, buWise: {} },
        strengths: { accountWise: {}, buWise: {} }
      };
    }

    const improvementAccountWiseBuckets = {};
    const improvementBuWiseBuckets = {};
    const strengthAccountWiseBuckets = {};
    const strengthBuWiseBuckets = {};

    processedData.data.forEach(row => {
      const areasOfImprovement = row['Top Expectations - Can do Better'] || '';
      const areasOfStrength = row['Top Expectations - Doing Well'] || '';
      const businessUnit = row.businessUnit || 'Unknown';
      const customerName = row.customerName || 'Unknown';
      const respondentName = row.respondentName || 'Unknown';

      // Process improvement areas
      if (areasOfImprovement && areasOfImprovement !== 'N/A' && areasOfImprovement.trim() !== '') {
        const areas = areasOfImprovement.split(',').map(area => area.trim()).filter(area => area);
        
        areas.forEach(area => {
          // Account-wise buckets
          if (!improvementAccountWiseBuckets[area]) {
            improvementAccountWiseBuckets[area] = {
              count: 0,
              accounts: new Set(),
              respondents: new Set()
            };
          }
          improvementAccountWiseBuckets[area].count++;
          improvementAccountWiseBuckets[area].accounts.add(customerName);
          improvementAccountWiseBuckets[area].respondents.add(respondentName);

          // BU-wise buckets
          if (!improvementBuWiseBuckets[area]) {
            improvementBuWiseBuckets[area] = {
              count: 0,
              businessUnits: new Set(),
              respondents: new Set()
            };
          }
          improvementBuWiseBuckets[area].count++;
          improvementBuWiseBuckets[area].businessUnits.add(businessUnit);
          improvementBuWiseBuckets[area].respondents.add(respondentName);
        });
      }

      // Process strength areas
      if (areasOfStrength && areasOfStrength !== 'N/A' && areasOfStrength.trim() !== '') {
        const areas = areasOfStrength.split(',').map(area => area.trim()).filter(area => area);
        
        areas.forEach(area => {
          // Account-wise buckets
          if (!strengthAccountWiseBuckets[area]) {
            strengthAccountWiseBuckets[area] = {
              count: 0,
              accounts: new Set(),
              respondents: new Set()
            };
          }
          strengthAccountWiseBuckets[area].count++;
          strengthAccountWiseBuckets[area].accounts.add(customerName);
          strengthAccountWiseBuckets[area].respondents.add(respondentName);

          // BU-wise buckets
          if (!strengthBuWiseBuckets[area]) {
            strengthBuWiseBuckets[area] = {
              count: 0,
              businessUnits: new Set(),
              respondents: new Set()
            };
          }
          strengthBuWiseBuckets[area].count++;
          strengthBuWiseBuckets[area].businessUnits.add(businessUnit);
          strengthBuWiseBuckets[area].respondents.add(respondentName);
        });
      }
    });

    // Convert Sets to Arrays for display
    Object.keys(improvementAccountWiseBuckets).forEach(area => {
      improvementAccountWiseBuckets[area].accounts = Array.from(improvementAccountWiseBuckets[area].accounts);
      improvementAccountWiseBuckets[area].respondents = Array.from(improvementAccountWiseBuckets[area].respondents);
    });

    Object.keys(improvementBuWiseBuckets).forEach(area => {
      improvementBuWiseBuckets[area].businessUnits = Array.from(improvementBuWiseBuckets[area].businessUnits);
      improvementBuWiseBuckets[area].respondents = Array.from(improvementBuWiseBuckets[area].respondents);
    });

    Object.keys(strengthAccountWiseBuckets).forEach(area => {
      strengthAccountWiseBuckets[area].accounts = Array.from(strengthAccountWiseBuckets[area].accounts);
      strengthAccountWiseBuckets[area].respondents = Array.from(strengthAccountWiseBuckets[area].respondents);
    });

    Object.keys(strengthBuWiseBuckets).forEach(area => {
      strengthBuWiseBuckets[area].businessUnits = Array.from(strengthBuWiseBuckets[area].businessUnits);
      strengthBuWiseBuckets[area].respondents = Array.from(strengthBuWiseBuckets[area].respondents);
    });

    return { 
      improvements: { accountWise: improvementAccountWiseBuckets, buWise: improvementBuWiseBuckets },
      strengths: { accountWise: strengthAccountWiseBuckets, buWise: strengthBuWiseBuckets }
    };
  }, [processedData.data]);

  const topExpectationsCanDoBetterAccountSummary = useMemo(() => buildRemarksCategorySummary('account', [
    'Top Expectations - Can do Better',
    'Top Expectations – Can do Better',
    'Top Expectations Can do Better',
    'Areas of improvement'
  ]), [remarksData]);

  const topExpectationsDoingWellAccountSummary = useMemo(() => buildRemarksCategorySummary('account', [
    'Top Expectations - Doing Well',
    'Top Expectations – Doing Well',
    'Top Expectations Doing Well',
    'Strength'
  ]), [remarksData]);

  const accountBusinessUnitMap = useMemo(() => {
    const map = new Map();
    if (!Array.isArray(remarksData) || remarksData.length === 0) return map;
    const buKeys = ['BUSINESS UNIT', 'BUSSINESS UNIT', 'BUSINESS_UNIT', 'Business Unit'];
    const acctKeys = ['CUSTOMER NAME', 'CUSTOMER_NAME', 'Customer Name'];
    remarksData.forEach(row => {
      const bu = normalizeBusinessUnitDisplay((getRemarksValue(row, buKeys) || 'Unknown').toString().trim());
      const account = (getRemarksValue(row, acctKeys) || '').toString().trim();
      if (!account) return;
      if (!map.has(account)) map.set(account, new Set());
      map.get(account).add(bu || 'Unknown');
    });
    return map;
  }, [remarksData]);

  const isValidCategory = (category) => {
    if (!category) return false;
    const trimmed = category.trim();
    if (!trimmed) return false;
    const upper = trimmed.toUpperCase();
    return upper !== 'NA' && upper !== 'N/A' && trimmed !== '-' && trimmed !== '–' && trimmed !== '—';
  };

  const accountWiseTopExpectationsRemarksData = useMemo(() => {
    const accountMap = new Map();

    (topExpectationsDoingWellAccountSummary || []).forEach(item => {
      if (!item) return;
      (item.groups || []).forEach(account => {
        const accountName = (account || '').trim();
        if (!accountName) return;
        if (!accountMap.has(accountName)) {
          accountMap.set(accountName, { account: accountName, businessUnits: new Set(), doingWell: new Set(), canDoBetter: new Set() });
        }
        const buSet = accountBusinessUnitMap.get(accountName);
        if (buSet) buSet.forEach(bu => accountMap.get(accountName).businessUnits.add(bu));
        if (isValidCategory(item.category)) {
          accountMap.get(accountName).doingWell.add(item.category.trim());
        }
      });
    });

    (topExpectationsCanDoBetterAccountSummary || []).forEach(item => {
      if (!item) return;
      (item.groups || []).forEach(account => {
        const accountName = (account || '').trim();
        if (!accountName) return;
        if (!accountMap.has(accountName)) {
          accountMap.set(accountName, { account: accountName, businessUnits: new Set(), doingWell: new Set(), canDoBetter: new Set() });
        }
        const buSet = accountBusinessUnitMap.get(accountName);
        if (buSet) buSet.forEach(bu => accountMap.get(accountName).businessUnits.add(bu));
        if (isValidCategory(item.category)) {
          accountMap.get(accountName).canDoBetter.add(item.category.trim());
        }
      });
    });

  const normalizeValue = (val) => {
    if (!val) return '-';
    const trimmed = val.trim();
    const upper = trimmed.toUpperCase();
    if (
      !trimmed ||
      upper === 'NA' ||
      upper === 'N/A' ||
      trimmed === '-' ||
      trimmed === '–' ||
      trimmed === '—'
    ) {
      return '-';
    }
    return trimmed;
  };

  const rowsWithRanks = Array.from(accountMap.values()).map(entry => {
    const doingWellText = entry.doingWell.size > 0 ? Array.from(entry.doingWell).sort().join(', ') : '-';
    const canDoBetterText = entry.canDoBetter.size > 0 ? Array.from(entry.canDoBetter).sort().join(', ') : '-';
    const doingWell = normalizeValue(doingWellText);
    const canDoBetter = normalizeValue(canDoBetterText);
    const hasDoing = doingWell !== '-';
    const hasBetter = canDoBetter !== '-';
    const rank = hasDoing && hasBetter ? 0 : (!hasBetter && hasDoing ? 1 : (!hasDoing && hasBetter ? 2 : 3));
    return {
      account: entry.account,
      businessUnits: entry.businessUnits,
      doingWell,
      canDoBetter,
      rank
    };
  });

  rowsWithRanks.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return a.account.localeCompare(b.account);
  });

  return rowsWithRanks.map((entry, index) => ({
    srNo: index + 1,
    businessUnit: entry.businessUnits.size > 0 ? Array.from(entry.businessUnits).sort().join(', ') : '-',
    account: entry.account,
    doingWell: entry.doingWell,
    canDoBetter: entry.canDoBetter
  }));
  }, [topExpectationsDoingWellAccountSummary, topExpectationsCanDoBetterAccountSummary, accountBusinessUnitMap]);

  const downloadExcel = () => {
    if (!processedData.data || processedData.data.length === 0) {
      alert('No data available to download');
      return;
    }

    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Account-wise Top Expectations Analysis');

       // Set column widths
       const colWidths = firstSheetData.length > 0 
         ? [8, 25, 30, 25, 60, 60, 35, 35] // SNO, Business Unit, Customer Name, RESPONDENT NAME, Expectations 1, Expectations 2, Top Expectations - Can do Better, Top Expectations - Doing Well
         : [8, 25, 30, 25]; // SNO, Business Unit, Customer Name, RESPONDENT NAME
      
      // Set column properties with proper formatting
      worksheet.columns = colWidths.map((width, index) => ({
        width: width,
        style: {
          alignment: {
            wrapText: true,
            vertical: 'top'
          }
        }
      }));

       // Add headers
       const headers = firstSheetData.length > 0
         ? ['SNO', 'Business Unit', 'Customer Name', 'RESPONDENT NAME', 'Please list your top expectations where Neurealm is doing well.', 'Please list your top expectations where Neurealm can do better.', 'Top Expectations - Can do Better', 'Top Expectations - Doing Well']
         : ['SNO', 'Business Unit', 'Customer Name', 'RESPONDENT NAME'];
      
      worksheet.addRow(headers);

      // Style header row
      const headerRow = worksheet.getRow(1);
      headerRow.height = 60; // Increased height for better visibility with wrapped text
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1D4ED8' } // Blue background
        };
        cell.font = {
          bold: true,
          size: 11,
          color: { argb: 'FFFFFFFF' } // White text
        };
        
        // Set header alignment and text wrapping for all columns
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle', 
          wrapText: true,
          shrinkToFit: false
        };
        
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF000000' } },
          bottom: { style: 'medium', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Add data rows
      processedData.data.forEach((row, rowIndex) => {
         const dataRow = firstSheetData.length > 0
           ? [
               row.sno || (rowIndex + 1),
               normalizeBusinessUnitDisplay(row.businessUnit) || '',
               row.customerName || '',
               row.respondentName || 'N/A',
               row['Please list your top expectations where Neurealm is doing well.'] || 'N/A',
               row['Please list your top expectations where Neurealm can do better.'] || 'N/A',
               row['Top Expectations - Can do Better'] || 'N/A',
               row['Top Expectations - Doing Well'] || 'N/A'
             ]
           : [
               row.sno || (rowIndex + 1),
               normalizeBusinessUnitDisplay(row.businessUnit) || '',
               row.customerName || '',
               row.respondentName || 'N/A'
             ];

        const addedRow = worksheet.addRow(dataRow);
        addedRow.height = 50; // Increased height for better visibility with wrapped text
        
        // Style data row
        addedRow.eachCell((cell, colNumber) => {
          // Set alignment and text wrapping based on column
          if (colNumber === 1) { // SNO column
            cell.alignment = { 
              horizontal: 'left', 
              vertical: 'middle', 
              wrapText: true,
              shrinkToFit: false
            };
          } else if (colNumber === 4 || colNumber === 6) { // Customer Name and Project Name columns
            cell.alignment = { 
              horizontal: 'left', 
              vertical: 'top', 
              wrapText: true,
              shrinkToFit: false
            };
          } else if (colNumber >= 7) { // Expectations columns
            cell.alignment = { 
              horizontal: 'left', 
              vertical: 'top', 
              wrapText: true,
              shrinkToFit: false
            };
          } else { // Other columns
            cell.alignment = { 
              horizontal: 'left', 
              vertical: 'middle', 
              wrapText: true,
              shrinkToFit: false
            };
          }
          
          // Set font size for better readability
          cell.font = {
            size: 10
          };
          
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      });

      // Auto-fit row heights for better content visibility
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          row.height = Math.max(30, Math.ceil(row.height * 1.2)); // Ensure minimum height and add some padding
        }
      });

      // Add data filter information
      worksheet.addRow([]);
      const filterInfoRow = worksheet.addRow(['Data filtered by CSAT cycle start date: ' + acsatCycleStartDateFormatted]);
      const filterInfoRowNum = filterInfoRow.number;
      filterInfoRow.getCell(1).font = {
        bold: true,
        size: 12,
        color: { argb: 'FF374151' }
      };
      filterInfoRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      filterInfoRow.height = 25;
      worksheet.mergeCells(`A${filterInfoRowNum}:J${filterInfoRowNum}`);


      // Add simple summary section below dashboard data
      if (processedData?.summary && (processedData.summary.improvements.length > 0 || processedData.summary.strengths.length > 0)) {
        // Add separator
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Record the start row for the summary section
        const summaryStartRow = worksheet.lastRow.number + 1;
        
        // Simple Summary Title
        const simpleSummaryTitleRow = worksheet.addRow(['📊 Top Expectations Analysis Dashboard Summary']);
        const simpleTitleRowNum = simpleSummaryTitleRow.number;
        simpleSummaryTitleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        simpleSummaryTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
        simpleSummaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        simpleSummaryTitleRow.height = 45;
        worksheet.mergeCells(`A${simpleTitleRowNum}:F${simpleTitleRowNum}`);
        
        // Add empty row
        worksheet.addRow([]);
        
        // Add spacing
        worksheet.addRow([]);
        
        // Top Expectations - Can do Better summary
        if (processedData.summary.improvements.length > 0) {
          const improvementsSummaryRow = worksheet.addRow(['⚠️ Categories that have been identified as Top Expectations - Can do Better based on the Customer remarks provided in CSAT:']);
          const improvementsSummaryRowNum = improvementsSummaryRow.number;
          improvementsSummaryRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFDC2626' } };
          improvementsSummaryRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          improvementsSummaryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
          improvementsSummaryRow.height = 35;
          worksheet.mergeCells(`A${improvementsSummaryRowNum}:F${improvementsSummaryRowNum}`);
          
          // List improvements
          processedData.summary.improvements.forEach(([category, count], index) => {
            const improvementItemRow = worksheet.addRow([`• ${category} (${count} mentions)`]);
            const improvementItemRowNum = improvementItemRow.number;
            improvementItemRow.getCell(1).font = { size: 12, color: { argb: 'FF1F2937' } };
            improvementItemRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            improvementItemRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            improvementItemRow.height = 28;
            worksheet.mergeCells(`A${improvementItemRowNum}:F${improvementItemRowNum}`);
          });
        }

        // Top Expectations - Doing Well summary
        if (processedData.summary.strengths.length > 0) {
          // Add spacing
          worksheet.addRow([]);
          
          const strengthsSummaryRow = worksheet.addRow(['✅ Categories that have been identified as Top Expectations - Doing Well based on the Customer remarks provided in CSAT:']);
          const strengthsSummaryRowNum = strengthsSummaryRow.number;
          strengthsSummaryRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF059669' } };
          strengthsSummaryRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          strengthsSummaryRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
          strengthsSummaryRow.height = 35;
          worksheet.mergeCells(`A${strengthsSummaryRowNum}:F${strengthsSummaryRowNum}`);
          
          // List strengths
          processedData.summary.strengths.forEach(([category, count], index) => {
            const strengthItemRow = worksheet.addRow([`• ${category} (${count} mentions)`]);
            const strengthItemRowNum = strengthItemRow.number;
            strengthItemRow.getCell(1).font = { size: 12, color: { argb: 'FF1F2937' } };
            strengthItemRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            strengthItemRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            strengthItemRow.height = 28;
            worksheet.mergeCells(`A${strengthItemRowNum}:F${strengthItemRowNum}`);
          });
        }
        
        // Add final separator
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Add blue borders to the entire summary section
        const summaryEndRow = worksheet.lastRow.number;
        
        for (let rowNum = summaryStartRow; rowNum <= summaryEndRow; rowNum++) {
          const row = worksheet.getRow(rowNum);
          for (let colNum = 1; colNum <= 6; colNum++) {
            const cell = row.getCell(colNum);
            cell.border = {
              top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              left: { style: 'medium', color: { argb: 'FF1D4ED8' } },
              right: { style: 'medium', color: { argb: 'FF1D4ED8' } }
            };
          }
        }
        
        // Add extra spacing after the bordered section
        worksheet.addRow([]);
        worksheet.addRow([]);
      }


      // Generate and download file
      workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
         link.download = `Account-wise_Top_Expectations_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Error generating Excel file:', error);
      alert('Error generating Excel file: ' + error.message);
    }
  };

  // Download Bucket Analysis Excel
  const downloadBucketAnalysisExcel = () => {
    console.log('🔍 Download Bucket Analysis - Debug Info:');
    console.log('bucketAnalysis:', bucketAnalysis);
    console.log('bucketViewType:', bucketViewType);
    
    if (!bucketAnalysis || (!bucketAnalysis.improvements && !bucketAnalysis.strengths)) {
      console.log('❌ No bucket analysis data available');
      alert('No bucket analysis data available to download');
      return;
    }

    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${bucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Top Expectations - Can do Better Analysis`);

      // Get the appropriate data based on view type
      const buckets = bucketViewType === 'account' ? bucketAnalysis.improvements.accountWise : bucketAnalysis.improvements.buWise;
      console.log('🔍 Selected buckets:', buckets);
      
      const bucketEntries = buckets ? Object.entries(buckets).sort((a, b) => b[1].count - a[1].count) : [];
      console.log('🔍 Bucket entries:', bucketEntries);

      if (bucketEntries.length === 0) {
        console.log('❌ No data available for the selected view type');
        alert('No data available for the selected view type');
        return;
      }

      // Define headers
      const headers = [
        'Sr. No.',
        'Area of Improvement',
        'Count',
        bucketViewType === 'account' ? 'Accounts' : 'Business Units',
        'Respondent Names'
      ];

      // Add headers with dark blue background and white text
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 40;
      
      // Style the header row
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' } // Dark blue
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }, // White text
          size: 12
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Set column widths
      worksheet.columns = [
        { width: 8 },   // Sr. No.
        { width: 40 },  // Area of Improvement
        { width: 10 },  // Count
        { width: 30 },  // Accounts/Business Units
        { width: 30 }   // Respondent Names
      ];

      // Add data rows
      bucketEntries.forEach(([area, data], index) => {
        const accountsOrBUs = bucketViewType === 'account' ? data.accounts : data.businessUnits;
        const accountsOrBUsText = accountsOrBUs.join(', ');
        const respondentsText = data.respondents.join(', ');

        const row = worksheet.addRow([
          index + 1,
          area,
          data.count,
          accountsOrBUsText,
          respondentsText
        ]);

        // Style data rows
        row.height = 30;
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber === 3 ? 'center' : 'left', // Center align count column
            vertical: 'middle',
            wrapText: true
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
          
          // Alternate row colors
          if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // White
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' } // Light gray
            };
          }
        });
      });

      // Generate and download the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${bucketViewType === 'account' ? 'Account-wise' : 'BU-wise'}_Top_Expectations_Can_do_Better_Analysis.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Error downloading bucket analysis Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  // Download Doing Well Bucket Analysis Excel
  const downloadDoingWellBucketAnalysisExcel = () => {
    console.log('🔍 Download Doing Well Bucket Analysis - Debug Info:');
    console.log('bucketAnalysis:', bucketAnalysis);
    console.log('doingWellBucketViewType:', doingWellBucketViewType);
    
    if (!bucketAnalysis || (!bucketAnalysis.improvements && !bucketAnalysis.strengths)) {
      console.log('❌ No bucket analysis data available');
      alert('No bucket analysis data available to download');
      return;
    }

    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`${doingWellBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Top Expectations - Doing Well Analysis`);

      // Get the appropriate data based on view type
      const buckets = doingWellBucketViewType === 'account' ? bucketAnalysis.strengths.accountWise : bucketAnalysis.strengths.buWise;
      console.log('🔍 Selected doing well buckets:', buckets);
      
      const bucketEntries = buckets ? Object.entries(buckets).sort((a, b) => b[1].count - a[1].count) : [];
      console.log('🔍 Doing well bucket entries:', bucketEntries);

      if (bucketEntries.length === 0) {
        console.log('❌ No doing well data available for the selected view type');
        alert('No data available for the selected view type');
        return;
      }

      // Define headers
      const headers = [
        'Sr. No.',
        'Area of Strength',
        'Count',
        doingWellBucketViewType === 'account' ? 'Accounts' : 'Business Units',
        'Respondent Names'
      ];

      // Add headers with dark blue background and white text
      const headerRow = worksheet.addRow(headers);
      headerRow.height = 40;
      
      // Style the header row
      headerRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' } // Dark blue
        };
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' }, // White text
          size: 12
        };
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      // Set column widths
      worksheet.columns = [
        { width: 8 },   // Sr. No.
        { width: 40 },  // Area of Strength
        { width: 10 },  // Count
        { width: 30 },  // Accounts/Business Units
        { width: 30 }   // Respondent Names
      ];

      // Add data rows
      bucketEntries.forEach(([area, data], index) => {
        const accountsOrBUs = doingWellBucketViewType === 'account' ? data.accounts : data.businessUnits;
        const accountsOrBUsText = accountsOrBUs.join(', ');
        const respondentsText = data.respondents.join(', ');

        const row = worksheet.addRow([
          index + 1,
          area,
          data.count,
          accountsOrBUsText,
          respondentsText
        ]);

        // Style data rows
        row.height = 30;
        row.eachCell((cell, colNumber) => {
          cell.alignment = {
            horizontal: colNumber === 3 ? 'center' : 'left', // Center align count column
            vertical: 'middle',
            wrapText: true
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
          
          // Alternate row colors
          if (index % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' } // White
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF9FAFB' } // Light gray
            };
          }
        });
      });

      // Generate and download the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doingWellBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'}_Top_Expectations_Doing_Well_Analysis.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Error downloading doing well bucket analysis Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  if (!excelData) {
    return (
      <Container>
        <NoDataMessage>
          <h2>No Excel Data Available</h2>
          <p>Please upload an Excel file first to view the Top Expectations Analysis.</p>
        </NoDataMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>📊 Top Expectations Analysis Dashboard</Title>
        <Subtitle>
          Account-wise Analysis - 
          Survey Data Analysis and Insights
        </Subtitle>
        <DateInfo>
          <DateLabel>CSAT Cycle Start Date: </DateLabel>
          <DateValue>{acsatCycleStartDateFormatted || 'Not Set'}</DateValue>
        </DateInfo>
      </Header>

      <ControlsContainer>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="remarks-upload" style={{ fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
              📝 Remarks for Top Expectations:
            </label>
            <input
              id="remarks-upload"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleRemarksUpload}
              ref={remarksInputRef}
              style={{
                padding: '0.35rem 0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
            {remarksFileName && (
              <>
                <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>
                  Loaded: {remarksFileName} ({remarksData.length} rows)
                </span>
                <button
                  onClick={clearRemarksUpload}
                  style={{
                    marginLeft: '0.5rem',
                    padding: '0.35rem 0.6rem',
                    background: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                  title="Clear uploaded remarks file"
                >
                  Clear
                </button>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <DownloadButton onClick={downloadExcel}>
              📥 Download Excel Report
            </DownloadButton>
            {Array.isArray(remarksData) && remarksData.length > 0 && (
              <button
                onClick={() => setShowBucketAnalysis(true)}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Show Bucket Analysis"
              >
                📊 Show Bucket Analysis
              </button>
            )}
            {Array.isArray(remarksData) && remarksData.length > 0 && showBucketAnalysis && (
              <button
                onClick={async () => {
                  try {
                    // Dynamic import exceljs
                    const ExcelJS = (await import('exceljs')).default || (await import('exceljs'));
                    const workbook = new ExcelJS.Workbook();

                    // Helper to add a sheet from rows
                    const addSheet = (title, rows, viewBy) => {
                      const ws = workbook.addWorksheet(title);
                      const headers = ['Sr. No.', 'Category', 'Count', viewBy === 'bu' ? 'Business Units' : 'Accounts', 'Respondent Names'];
                      ws.addRow(headers);
                      const headerRow = ws.getRow(1);
                      headerRow.eachCell((cell) => {
                        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      });
                      (rows || []).forEach(r => {
                        const excelRow = ws.addRow([
                          r.sNo,
                          r.category,
                          r.count,
                          (r.groups || []).join(', '),
                          (r.respondents || []).join(', ')
                        ]);
                        excelRow.eachCell((cell) => {
                          cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                      });
                      ws.columns = [
                        { width: 8 },
                        { width: 40 },
                        { width: 10 },
                        { width: 50 },
                        { width: 50 }
                      ];
                    };

                    // Build current-view rows for both analyses
                    const canDoBetterRows = buildRemarksCategorySummary(remarksImpView, [
                      'Top Expectations - Can do Better',
                      'Top Expectations – Can do Better',
                      'Areas of improvement',
                      'Top Expectations Can do Better'
                    ]);
                    const doingWellRows = buildRemarksCategorySummary(remarksStrView, [
                      'Top Expectations - Doing Well',
                      'Top Expectations – Doing Well',
                      'Top Expectations Doing Well',
                      'Strength'
                    ]);

                    addSheet(`Remarks - Can do Better (${remarksImpView === 'bu' ? 'BU-wise' : 'Account-wise'})`, canDoBetterRows, remarksImpView);
                    addSheet(`Remarks - Doing Well (${remarksStrView === 'bu' ? 'BU-wise' : 'Account-wise'})`, doingWellRows, remarksStrView);

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    const today = new Date().toISOString().split('T')[0];
                    link.download = `Remarks_Top_Expectations_Bucket_Analysis_${today}.xlsx`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Error exporting Remarks-based Bucket Analysis:', err);
                    alert('Failed to download Remarks-based Bucket Analysis.');
                  }
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Download Remarks-based Bucket Analysis"
              >
                📥 Download Remarks Analysis
              </button>
            )}
            {Array.isArray(remarksData) && remarksData.length > 0 && showBucketAnalysis && (
              <button
                onClick={() => setShowBucketAnalysis(false)}
                style={{
                  background: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Hide Bucket Analysis"
              >
                🙈 Hide Bucket Analysis
              </button>
            )}
            <BackButton onClick={onBack}>
              ← Back to ACSAT Dashboard
            </BackButton>
          </div>
        </div>
      </ControlsContainer>

      <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <SearchContainer>
          <SearchLabel htmlFor="customer-search">🔍 Search Customer:</SearchLabel>
          <SearchInput
            id="customer-search"
            type="text"
            placeholder="Enter customer name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <ClearButton onClick={() => setSearchTerm('')}>
              ✕ Clear
            </ClearButton>
          )}
        </SearchContainer>

      </div>

      {/* Remarks-based Bucket Analysis (Top Expectations) */}
      {showBucketAnalysis && Array.isArray(remarksData) && remarksData.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Top Expectations - Can do Better from Remarks */}
          <div style={{ marginBottom: '1rem', padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.05rem' }}>📝 Remarks - Top Expectations - Can do Better Bucket Analysis</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setRemarksImpView('account')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: remarksImpView==='account' ? '#1d4ed8' : '#ffffff', color: remarksImpView==='account' ? '#ffffff' : '#111827', fontWeight: 600 }}>Account-wise</button>
                <button onClick={() => setRemarksImpView('bu')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: remarksImpView==='bu' ? '#1d4ed8' : '#ffffff', color: remarksImpView==='bu' ? '#ffffff' : '#111827', fontWeight: 600 }}>BU-wise</button>
              </div>
            </div>
            {(() => {
              const rows = buildRemarksCategorySummary(remarksImpView, [
                'Top Expectations - Can do Better',
                'Top Expectations – Can do Better',
                'Areas of improvement',
                'Top Expectations Can do Better'
              ]);
              return (
                <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Sr. No.</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Category</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Count</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>{remarksImpView==='bu' ? 'Business Units' : 'Accounts'}</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Respondent Names</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>No data found in remarks</td>
                        </tr>
                      ) : rows.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'center' }}>{r.sNo}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{r.category}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'center', fontWeight: 700 }}>{r.count}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{(r.groups || []).join(', ')}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{(r.respondents || []).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          {/* Top Expectations - Doing Well from Remarks */}
          <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.05rem' }}>📝 Remarks - Top Expectations - Doing Well Bucket Analysis</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setRemarksStrView('account')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: remarksStrView==='account' ? '#1d4ed8' : '#ffffff', color: remarksStrView==='account' ? '#ffffff' : '#111827', fontWeight: 600 }}>Account-wise</button>
                <button onClick={() => setRemarksStrView('bu')} style={{ padding: '0.4rem 0.75rem', borderRadius: 6, border: '1px solid #d1d5db', background: remarksStrView==='bu' ? '#1d4ed8' : '#ffffff', color: remarksStrView==='bu' ? '#ffffff' : '#111827', fontWeight: 600 }}>BU-wise</button>
              </div>
            </div>
            {(() => {
              const rows = buildRemarksCategorySummary(remarksStrView, [
                'Top Expectations - Doing Well',
                'Top Expectations – Doing Well',
                'Top Expectations Doing Well',
                'Strength'
              ]);
              return (
                <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Sr. No.</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Category</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Count</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>{remarksStrView==='bu' ? 'Business Units' : 'Accounts'}</th>
                        <th style={{ padding: '0.6rem', border: '1px solid #9ca3af' }}>Respondent Names</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>No data found in remarks</td>
                        </tr>
                      ) : rows.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'center' }}>{r.sNo}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{r.category}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'center', fontWeight: 700 }}>{r.count}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{(r.groups || []).join(', ')}</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{(r.respondents || []).join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>

          <div style={{ padding: '1rem', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.05rem' }}>📊 Account Wise Top Expectations Analysis Dashboard</h3>
            <p style={{ margin: '0.5rem 0 1rem', color: '#475569', fontSize: '0.9rem' }}>
              Derived from both <strong>Remarks - Top Expectations - Doing Well</strong> and <strong>Remarks - Top Expectations - Can do Better</strong> bucket analyses.
            </p>
            {accountWiseTopExpectationsRemarksData && accountWiseTopExpectationsRemarksData.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                <button
                  onClick={() => {
                    try {
                      const ExcelJS = require('exceljs');
                      const workbook = new ExcelJS.Workbook();
                      const worksheet = workbook.addWorksheet('Account Wise Top Expectations');
                      
                      worksheet.columns = [
                        { header: 'Sr. No.', key: 'srNo', width: 10 },
                        { header: 'Business Unit', key: 'businessUnit', width: 25 },
                        { header: 'Account Name', key: 'account', width: 30 },
                        { header: 'Doing Well', key: 'doingWell', width: 40 },
                        { header: 'Can do Better', key: 'canDoBetter', width: 40 }
                      ];
                      
                      worksheet.getRow(1).eachCell((cell) => {
                        cell.fill = {
                          type: 'pattern',
                          pattern: 'solid',
                          fgColor: { argb: 'FF1e3a8a' }
                        };
                        cell.font = {
                          color: { argb: 'FFFFFFFF' },
                          bold: true
                        };
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.border = {
                          top: { style: 'thin' },
                          left: { style: 'thin' },
                          bottom: { style: 'thin' },
                          right: { style: 'thin' }
                        };
                      });
                      
                      accountWiseTopExpectationsRemarksData.forEach((row) => {
                        const excelRow = worksheet.addRow(row);
                        excelRow.eachCell((cell) => {
                          cell.alignment = { vertical: 'top', wrapText: true };
                          cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                          };
                        });
                      });
                      
                      workbook.xlsx.writeBuffer().then((buffer) => {
                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        const today = new Date().toISOString().split('T')[0];
                        link.download = `Account_Wise_Top_Expectations_${today}.xlsx`;
                        link.click();
                        window.URL.revokeObjectURL(url);
                      });
                    } catch (err) {
                      console.error('Error exporting Account Wise Top Expectations:', err);
                      alert('Failed to download Account Wise Top Expectations data.');
                    }
                  }}
                  style={{
                    background: '#001f3f',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  📥 Download Dashboard
                </button>
              </div>
            )}
          {accountWiseTopExpectationsRemarksData && accountWiseTopExpectationsRemarksData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#1e3a8a', color: '#ffffff' }}>
                    <th style={{ padding: '0.6rem', border: '1px solid #1e293b' }}>Sr. No.</th>
                    <th style={{ padding: '0.6rem', border: '1px solid #1e293b' }}>Business Unit</th>
                    <th style={{ padding: '0.6rem', border: '1px solid #1e293b' }}>Account Name</th>
                    <th style={{ padding: '0.6rem', border: '1px solid #1e293b' }}>Doing Well</th>
                    <th style={{ padding: '0.6rem', border: '1px solid #1e293b' }}>Can do Better</th>
                  </tr>
                </thead>
                <tbody>
                  {accountWiseTopExpectationsRemarksData.map(row => (
                    <tr key={`account-top-exp-${row.account}`}>
                      <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'center', fontWeight: 600 }}>{row.srNo}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', fontWeight: 600 }}>{row.account}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', color: '#047857' }}>{row.doingWell}</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #d1d5db', color: '#b91c1c' }}>{row.canDoBetter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>
              No remarks available to display account-wise top expectations.
            </div>
          )}
          </div>
        </div>
      )}

      {/* Bucket Analysis Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
            📊 Top Expectations - Can do Better Bucket Analysis
          </h3>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
            Analyze top expectations areas by account or business unit with counts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setBucketViewType('account')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: bucketViewType === 'account' ? '#3b82f6' : '#ffffff',
                color: bucketViewType === 'account' ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Account-wise
            </button>
            <button
              onClick={() => setBucketViewType('bu')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: bucketViewType === 'bu' ? '#3b82f6' : '#ffffff',
                color: bucketViewType === 'bu' ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              BU-wise
            </button>
          </div>
          <button
            onClick={() => setShowBucketAnalysis(!showBucketAnalysis)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #3b82f6',
              borderRadius: '6px',
              backgroundColor: showBucketAnalysis ? '#3b82f6' : '#ffffff',
              color: showBucketAnalysis ? '#ffffff' : '#3b82f6',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            {showBucketAnalysis ? 'Hide Analysis' : 'Show Analysis'}
          </button>
          {showBucketAnalysis && (
            <button
              onClick={downloadBucketAnalysisExcel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #059669',
                borderRadius: '6px',
                backgroundColor: '#059669',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginLeft: '0.5rem'
              }}
            >
              📥 Download Excel
            </button>
          )}
        </div>
      </div>

      {/* Bucket Analysis Display */}
      {showBucketAnalysis && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
            {bucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Top Expectations - Can do Better Analysis
          </h3>
          
          {(() => {
            const buckets = bucketViewType === 'account' ? bucketAnalysis.improvements.accountWise : bucketAnalysis.improvements.buWise;
            const bucketEntries = buckets ? Object.entries(buckets).sort((a, b) => b[1].count - a[1].count) : [];
            
            if (bucketEntries.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No top expectations data available
                </div>
              );
            }
            
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a8a' }}>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Sr. No.
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Top Expectations - Can do Better
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Count
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        {bucketViewType === 'account' ? 'Accounts' : 'Business Units'}
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Respondent Names
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketEntries.map(([area, data], index) => (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <td style={{ 
                          padding: '12px 16px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          color: '#1f2937',
                          fontWeight: '500',
                          maxWidth: '300px',
                          wordWrap: 'break-word'
                        }}>
                          {area}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 12px', 
                            backgroundColor: '#3b82f6', 
                            color: '#ffffff', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600' 
                          }}>
                            {data.count}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          maxWidth: '400px',
                          wordWrap: 'break-word'
                        }}>
                          {bucketViewType === 'account' ? (
                            <div>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                                {data.accounts.length} account{data.accounts.length !== 1 ? 's' : ''}:
                              </div>
                              <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                {data.accounts.map((account, idx) => (
                                  <div key={idx} style={{ 
                                    marginBottom: '4px',
                                    padding: '2px 0',
                                    borderBottom: idx < data.accounts.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}>
                                    {account}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                                {data.businessUnits.length} business unit{data.businessUnits.length !== 1 ? 's' : ''}:
                              </div>
                              <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                {data.businessUnits.map((bu, idx) => (
                                  <div key={idx} style={{ 
                                    marginBottom: '4px',
                                    padding: '2px 0',
                                    borderBottom: idx < data.businessUnits.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}>
                                    {normalizeBusinessUnitDisplay(bu)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          maxWidth: '400px',
                          wordWrap: 'break-word'
                        }}>
                          <div>
                            <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                              {data.respondents.length} respondent{data.respondents.length !== 1 ? 's' : ''}:
                            </div>
                            <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                              {data.respondents.map((respondent, idx) => (
                                <div key={idx} style={{ 
                                  marginBottom: '4px',
                                  padding: '2px 0',
                                  borderBottom: idx < data.respondents.length - 1 ? '1px solid #e5e7eb' : 'none'
                                }}>
                                  {respondent}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Top Expectations - Doing Well Bucket Analysis Options */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
        <div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
            ✅ Top Expectations - Doing Well Bucket Analysis
          </h3>
          <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
            Analyze strength areas by account or business unit with counts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setDoingWellBucketViewType('account')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: doingWellBucketViewType === 'account' ? '#059669' : '#ffffff',
                color: doingWellBucketViewType === 'account' ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Account-wise
            </button>
            <button
              onClick={() => setDoingWellBucketViewType('bu')}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                backgroundColor: doingWellBucketViewType === 'bu' ? '#059669' : '#ffffff',
                color: doingWellBucketViewType === 'bu' ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              BU-wise
            </button>
          </div>
          <button
            onClick={() => setShowDoingWellBucketAnalysis(!showDoingWellBucketAnalysis)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #059669',
              borderRadius: '6px',
              backgroundColor: showDoingWellBucketAnalysis ? '#059669' : '#ffffff',
              color: showDoingWellBucketAnalysis ? '#ffffff' : '#059669',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}
          >
            {showDoingWellBucketAnalysis ? 'Hide Analysis' : 'Show Analysis'}
          </button>
          {showDoingWellBucketAnalysis && (
            <button
              onClick={downloadDoingWellBucketAnalysisExcel}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #059669',
                borderRadius: '6px',
                backgroundColor: '#059669',
                color: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginLeft: '0.5rem'
              }}
            >
              📥 Download Excel
            </button>
          )}
        </div>
      </div>

      {/* Top Expectations - Doing Well Bucket Analysis Display */}
      {showDoingWellBucketAnalysis && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
            {doingWellBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Top Expectations - Doing Well Analysis
          </h3>
          
          {(() => {
            const buckets = doingWellBucketViewType === 'account' ? bucketAnalysis.strengths.accountWise : bucketAnalysis.strengths.buWise;
            const bucketEntries = buckets ? Object.entries(buckets).sort((a, b) => b[1].count - a[1].count) : [];
            
            if (bucketEntries.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No strength areas data available
                </div>
              );
            }
            
            return (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#059669' }}>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Sr. No.
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Area of Strength
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Count
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        borderRight: '1px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        {doingWellBucketViewType === 'account' ? 'Accounts' : 'Business Units'}
                      </th>
                      <th style={{ 
                        padding: '12px 16px', 
                        textAlign: 'left', 
                        fontWeight: '600', 
                        color: '#ffffff',
                        borderBottom: '2px solid #d1d5db',
                        fontSize: '0.875rem'
                      }}>
                        Respondent Names
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bucketEntries.map(([area, data], index) => (
                      <tr key={index} style={{ 
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        borderBottom: '1px solid #e5e7eb'
                      }}>
                        <td style={{ 
                          padding: '12px 16px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          color: '#374151',
                          fontWeight: '500'
                        }}>
                          {index + 1}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem',
                          color: '#1f2937',
                          fontWeight: '500',
                          maxWidth: '300px',
                          wordWrap: 'break-word'
                        }}>
                          {area}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          textAlign: 'center',
                          borderRight: '1px solid #e5e7eb',
                          fontSize: '0.875rem'
                        }}>
                          <span style={{ 
                            display: 'inline-block',
                            padding: '4px 12px', 
                            backgroundColor: '#059669', 
                            color: '#ffffff', 
                            borderRadius: '12px', 
                            fontSize: '0.75rem', 
                            fontWeight: '600' 
                          }}>
                            {data.count}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          maxWidth: '400px',
                          wordWrap: 'break-word'
                        }}>
                          {doingWellBucketViewType === 'account' ? (
                            <div>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                                {data.accounts.length} account{data.accounts.length !== 1 ? 's' : ''}:
                              </div>
                              <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                {data.accounts.map((account, idx) => (
                                  <div key={idx} style={{ 
                                    marginBottom: '4px',
                                    padding: '2px 0',
                                    borderBottom: idx < data.accounts.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}>
                                    {account}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                                {data.businessUnits.length} business unit{data.businessUnits.length !== 1 ? 's' : ''}:
                              </div>
                              <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                                {data.businessUnits.map((bu, idx) => (
                                  <div key={idx} style={{ 
                                    marginBottom: '4px',
                                    padding: '2px 0',
                                    borderBottom: idx < data.businessUnits.length - 1 ? '1px solid #e5e7eb' : 'none'
                                  }}>
                                    {normalizeBusinessUnitDisplay(bu)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                        <td style={{ 
                          padding: '12px 16px', 
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          maxWidth: '400px',
                          wordWrap: 'break-word'
                        }}>
                          <div>
                            <div style={{ marginBottom: '8px', fontWeight: '500', color: '#374151', fontSize: '0.8rem' }}>
                              {data.respondents.length} respondent{data.respondents.length !== 1 ? 's' : ''}:
                            </div>
                            <div style={{ fontSize: '0.8rem', lineHeight: '1.6' }}>
                              {data.respondents.map((respondent, idx) => (
                                <div key={idx} style={{ 
                                  marginBottom: '4px',
                                  padding: '2px 0',
                                  borderBottom: idx < data.respondents.length - 1 ? '1px solid #e5e7eb' : 'none'
                                }}>
                                  {respondent}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {searchTerm && (
        <SearchResults>
          {processedData.data.length > 0 
            ? `Found ${processedData.data.length} record(s) matching your search`
            : `No records found matching your search`
          }
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>
            Customer search: "{searchTerm}"
          </div>
        </SearchResults>
      )}

      {/* Top Expectations Analysis Summary */}
      {processedData?.summary && (processedData.summary.improvements.length > 0 || processedData.summary.strengths.length > 0) && (
        <SummaryContainer>
          <SummaryTitle>📊 Top Expectations Analysis Summary</SummaryTitle>
          
          <SummaryGrid>
            <SummaryCard>
              <SummaryCardTitle>⚠️ Categories identified as Top Expectations - Can do Better</SummaryCardTitle>
              <CategoryList>
                {processedData.summary.improvements.length > 0 ? (
                  processedData.summary.improvements.map(([category, count], index) => (
                    <CategoryItem key={index}>
                      <CategoryName>{category}</CategoryName>
                      <ImprovementCount>{count}</ImprovementCount>
                    </CategoryItem>
                  ))
                ) : (
                  <CategoryItem>
                    <CategoryName>No top expectations areas identified</CategoryName>
                    <ImprovementCount>-</ImprovementCount>
                  </CategoryItem>
                )}
              </CategoryList>
            </SummaryCard>
            
            <SummaryCard>
              <SummaryCardTitle>✅ Categories identified as Top Expectations - Doing Well</SummaryCardTitle>
              <CategoryList>
                {processedData.summary.strengths.length > 0 ? (
                  processedData.summary.strengths.map(([category, count], index) => (
                    <CategoryItem key={index}>
                      <CategoryName>{category}</CategoryName>
                      <StrengthCount>{count}</StrengthCount>
                    </CategoryItem>
                  ))
                ) : (
                  <CategoryItem>
                    <CategoryName>No strength areas identified</CategoryName>
                    <StrengthCount>-</StrengthCount>
                  </CategoryItem>
                )}
              </CategoryList>
            </SummaryCard>
          </SummaryGrid>
        </SummaryContainer>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>SNO</TableHeaderCell>
              <TableHeaderCell>{processedData.headers.businessUnit || 'BUSINESS UNIT'}</TableHeaderCell>
              <TableHeaderCell>{processedData.headers.customerName || 'CUSTOMER NAME'}</TableHeaderCell>
              <TableHeaderCell>RESPONDENT NAME</TableHeaderCell>
              {firstSheetData.length > 0 && (
                <>
                  <TableHeaderCell>Please list your top expectations where Neurealm is doing well.</TableHeaderCell>
                  <TableHeaderCell>Please list your top expectations where Neurealm can do better.</TableHeaderCell>
                  <TableHeaderCell>Top Expectations - Can do Better</TableHeaderCell>
                  <TableHeaderCell>Top Expectations - Doing Well</TableHeaderCell>
                </>
              )}
            </tr>
          </TableHeader>
          <TableBody>
            {processedData.data && processedData.data.length > 0 ? (
              processedData.data.map((row, index) => {
                // Debug: Log the first few rows to see what data is being rendered
                if (index < 3) {
                  console.log(`🔍 Rendering table row ${index}:`, {
                    sno: row.sno,
                    businessUnit: row.businessUnit,
                    customerId: row.customerId,
                    customerName: row.customerName,
                    projId: row.projId,
                    projectName: row.projectName
                  });
                }
                return (
                <TableRow key={index}>
                  <TableCell style={{ textAlign: 'center', fontWeight: 'bold' }}>{row.sno}</TableCell>
                  <BusinessUnitCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</BusinessUnitCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>{row.respondentName}</TableCell>
                  {firstSheetData.length > 0 && (
                    <>
                      <TableCell style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                        {row['Please list your top expectations where Neurealm is doing well.'] || 'N/A'}
                      </TableCell>
                      <TableCell style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                        {row['Please list your top expectations where Neurealm can do better.'] || 'N/A'}
                      </TableCell>
                      <TableCell style={{ maxWidth: '200px', wordWrap: 'break-word', fontWeight: '600', color: '#dc2626' }}>
                        {row['Top Expectations - Can do Better'] || 'N/A'}
                      </TableCell>
                      <TableCell style={{ maxWidth: '200px', wordWrap: 'break-word', fontWeight: '600', color: '#059669' }}>
                        {row['Top Expectations - Doing Well'] || 'N/A'}
                      </TableCell>
                    </>
                  )}
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                 <TableCell colSpan={firstSheetData.length > 0 ? 8 : 4} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm.trim() ? 'No records found matching your search' : 'No data available'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ScrollIndicator>
        📊 Scroll to view all data
      </ScrollIndicator>
    </Container>
  );
}

export default TopExpectationsAnalysisDashboard;
