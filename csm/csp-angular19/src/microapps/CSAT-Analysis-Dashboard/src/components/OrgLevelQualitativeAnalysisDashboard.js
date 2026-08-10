import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCSATContext } from '../context/CSATContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import html2canvas from 'html2canvas';

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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 1.875rem;
  font-weight: 700;
  margin: 0;
`;

const BackButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #2563eb;
  }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  max-height: 70vh;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 2px solid #6b7280;
`;

const TableHeader = styled.th`
  background: #1e3a8a;
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: white;
  border: 1px solid #9ca3af;
  position: sticky;
  top: 0;
  z-index: 10;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: #1e40af;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  color: #374151;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
`;

const StatusContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

const ExportButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #059669;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  width: 300px;
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ClearButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const RemarksUploadContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: #eff6ff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;
const FileInput = styled.input`
  padding: 0.7rem 0.8rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 0.95rem;
  outline: none;
`;
const FileNameDisplay = styled.span`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
`;

const RemarksBucketButton = styled.button`
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 0.75rem 1.7rem;
  font-weight: 500;
  border-radius: 7px;
  box-shadow: 0 2px 6px #dbeafe99;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.1rem;
  white-space: nowrap;
  &:hover {
    background: #0369a1;
  }
`;

// Custom label component for vertical stacked bars
const CustomStackedBarLabel = (props) => {
  const { x, y, width, height, value, index, payload, dataKey, chartData } = props;
  
  // CRITICAL: For stacked bars, always get value from chartData using index
  // The value prop is cumulative for stacked bars, so we MUST use chartData[index][dataKey]
  if (!chartData || !Array.isArray(chartData)) {
    return null;
  }
  
  if (index === undefined || index < 0 || index >= chartData.length) {
    return null;
  }
  
  const chartItem = chartData[index];
  if (!chartItem) {
    return null;
  }
  
  // Get the segment value directly from chartData
  const segmentValue = chartItem[dataKey];
  
  // Handle undefined/null values
  if (segmentValue === undefined || segmentValue === null) {
    return null;
  }
  
  const numValue = typeof segmentValue === 'number' ? segmentValue : parseFloat(segmentValue) || 0;
  
  // Don't render if value is 0 or invalid
  if (numValue <= 0 || isNaN(numValue)) {
    return null;
  }
  
  // Don't render if height is too small (but be very lenient for bottom segment)
  const isBottomSegment = dataKey === 'pPercent';
  const minHeight = isBottomSegment ? 0.5 : 3;
  
  if (!height || height < minHeight) {
    return null;
  }
  
  // Format the value - show the percentage value
  const displayValue = numValue.toFixed(1);
  
  // Determine text color based on dataKey
  // N% (red bars) uses white text, P% (green bars) uses black text
  const textColor = dataKey === 'nPercent' ? '#ffffff' : '#000000';
  
  // Position label at center of the segment
  const labelX = x + width / 2;
  const labelY = y + height / 2;
  
  // Return the value text - ensure it's always visible
  return (
    <text
      x={labelX}
      y={labelY}
      fill={textColor}
      fontSize={12}
      fontWeight="700"
      textAnchor="middle"
      dominantBaseline="middle"
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      {displayValue}%
    </text>
  );
};

const SentimentAnalysisButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.75rem 1.7rem;
  font-weight: 500;
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  &:hover {
    background: #2563eb;
  }
`;

const OrgLevelQualitativeAnalysisDashboard = ({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, onBack }) => {
  const [processedData, setProcessedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showBucketAnalysis, setShowBucketAnalysis] = useState(false);
  const [showStrengthBucketAnalysis, setShowStrengthBucketAnalysis] = useState(false);
  const [strengthBucketViewType, setStrengthBucketViewType] = useState('account'); // 'account' or 'bu'
  const [showSubImprovementBucketAnalysis, setShowSubImprovementBucketAnalysis] = useState(false);
  const [subImprovementBucketViewType, setSubImprovementBucketViewType] = useState('account'); // 'account' or 'bu'
  const [showSubStrengthBucketAnalysis, setShowSubStrengthBucketAnalysis] = useState(false);
  const [subStrengthBucketViewType, setSubStrengthBucketViewType] = useState('account'); // 'account' or 'bu'
  const [topExpectationsCanDoBetterView, setTopExpectationsCanDoBetterView] = useState('account'); // 'account' or 'bu'
  const [topExpectationsDoingWellView, setTopExpectationsDoingWellView] = useState('account'); // 'account' or 'bu'
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  // Prefer ACSAT cycle date from props when provided (e.g. when opened from ACSAT flow)
  const effectiveCycleStartDateFormatted = acsatCycleStartDateFormatted || csatCycleStartDateFormatted;

  // Remarks upload state
  const [remarksFileName, setRemarksFileName] = useState('');
  const [remarksData, setRemarksData] = useState([]);
  const remarksInputRef = useRef(null);
  const [chartLayout, setChartLayout] = useState('vertical'); // 'vertical' or 'horizontal'

  // NEW state for showing/hiding remarks bucket analysis
  const [showRemarksBucketAnalysis, setShowRemarksBucketAnalysis] = useState(false);
  const [remarksSubImpView, setRemarksSubImpView] = useState('account'); // 'account' | 'bu'
  const [remarksSubStrView, setRemarksSubStrView] = useState('account'); // 'account' | 'bu'
  
  // Ref for chart download
  const combinedChartRef = useRef(null);

  // Fixed BU order for consistency
  const buOrder = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];

  // Helper: robust column value getter for remarks dataset
  const getRemarksValue = (row, targetHeader) => {
    if (!row || !targetHeader) return '';
    const headers = Array.isArray(targetHeader) ? targetHeader : [targetHeader];
    const normalize = (s) => s.toString().toLowerCase().replace(/\s|_|-/g, '');
    
    // exact normalized match first for each header candidate
    for (const header of headers) {
      if (!header) continue;
      const targetNorm = normalize(header);
      for (const key of Object.keys(row)) {
        if (!key) continue;
        if (normalize(key) === targetNorm) return row[key] ?? '';
      }
    }
    
    // loose includes fallback
    for (const header of headers) {
      if (!header) continue;
      const targetNorm = normalize(header);
      for (const key of Object.keys(row)) {
        if (!key) continue;
        if (normalize(key).includes(targetNorm)) return row[key] ?? '';
      }
    }
    return '';
  };

  // Build category summary from remarks for a specific column key ("Sub Areas of Improvement" or "Sub Strength")
  const buildRemarksCategorySummary = (data, viewType, targetColumnKey) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const resultMap = new Map(); // category -> { count, groups:Set, respondents:Set }

    data.forEach((row) => {
      const categoryRaw = getRemarksValue(row, targetColumnKey);
      if (!categoryRaw) return;
      // split by comma if multiple categories provided in one cell
      const categories = categoryRaw
        .toString()
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const bu = getRemarksValue(row, 'BUSINESS UNIT');
      const account = getRemarksValue(row, 'CUSTOMER NAME') || getRemarksValue(row, 'ACCOUNT NAME') || getRemarksValue(row, 'CUSTOMER');
      const respondentName = getRemarksValue(row, 'RESPONDENT NAME') || getRemarksValue(row, 'RESPONDENT');
      const groupName = viewType === 'bu' ? bu : account;
      if (!groupName) return;

      categories.forEach((cat) => {
        const key = cat || 'Uncategorized';
        if (!resultMap.has(key)) {
          resultMap.set(key, { category: key, count: 0, groups: new Set(), respondents: new Set() });
        }
        const entry = resultMap.get(key);
        entry.count += 1;
        entry.groups.add(groupName);
        if (respondentName) entry.respondents.add(respondentName);
      });
    });

    let rows = Array.from(resultMap.values()).map((r) => ({
      category: r.category,
      count: r.count,
      groups: Array.from(r.groups),
      respondentNames: Array.from(r.respondents)
    }));

    // For BU view, sort groups and overall rows by fixed BU order
    if (viewType === 'bu') {
      rows.forEach((r) => {
        r.groups.sort((a, b) => buOrder.indexOf(a) - buOrder.indexOf(b));
      });
      rows.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      // account view: sort groups and respondents alphabetically; rows by category
      rows.forEach((r) => {
        r.groups.sort((a, b) => a.localeCompare(b));
        r.respondentNames.sort((a, b) => a.localeCompare(b));
      });
      rows.sort((a, b) => a.category.localeCompare(b.category));
    }

    return rows;
  };

  const remarksSubImpAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', 'Sub Areas of Improvement'), [remarksData]);
  const remarksSubImpBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', 'Sub Areas of Improvement'), [remarksData]);
  const remarksSubStrAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', 'Sub Strength'), [remarksData]);
  const remarksSubStrBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', 'Sub Strength'), [remarksData]);
  
  // Top Expectations bucket analysis
  const doingWellHeaders = ['Top Expectations - Doing Well', 'Top Expectations – Doing Well', 'Top Expectations Doing Well', 'Strength'];
  const canDoBetterHeaders = ['Top Expectations - Can do Better', 'Top Expectations – Can do Better', 'Top Expectations Can do Better', 'Areas of improvement'];
  
  const topExpectationsDoingWellAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', doingWellHeaders), [remarksData]);
  const topExpectationsDoingWellBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', doingWellHeaders), [remarksData]);
  const topExpectationsCanDoBetterAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', canDoBetterHeaders), [remarksData]);
  const topExpectationsCanDoBetterBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', canDoBetterHeaders), [remarksData]);

  // Combined dashboard: Merge account-wise data from both Sub Areas of Improvement and Sub Strength
  const combinedRemarksAccountData = useMemo(() => {
    // Create maps for quick lookup
    const impMap = new Map();
    (remarksSubImpAccountData || []).forEach(item => {
      impMap.set(item.category, item.count);
    });

    const strMap = new Map();
    (remarksSubStrAccountData || []).forEach(item => {
      strMap.set(item.category, item.count);
    });

    // Get all unique categories from both datasets
    const allCategories = new Set([
      ...(remarksSubImpAccountData || []).map(item => item.category),
      ...(remarksSubStrAccountData || []).map(item => item.category)
    ]);

    // Create combined data
    const combined = Array.from(allCategories).map(category => {
      const positiveCount = strMap.get(category) || 0; // Count from Sub Strength as Positive
      const negativeCount = impMap.get(category) || 0; // Count from Sub Areas of Improvement as Negative
      const totalCount = positiveCount + negativeCount;
      
      // Calculate percentages
      const pPercent = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;
      const nPercent = totalCount > 0 ? (negativeCount / totalCount) * 100 : 0;
      const deltaPercent = pPercent - nPercent;
      const roundedDelta = Math.round(deltaPercent * 100) / 100; // Round to 2 decimal places
      
      // Determine remarks based on new Delta % legend
      let remarks = '';
      if (roundedDelta > 50) {
        remarks = 'Strength';
      } else if (roundedDelta >= 20 && roundedDelta <= 50) {
        remarks = 'Need to build on (Potential to become Strength)';
      } else if (roundedDelta <= -50) {
        remarks = 'Area for Improvement';
      } else if (roundedDelta <= -20 && roundedDelta > -50) {
        remarks = 'Needs focus (Likely to become Area of Improvement)';
      } else if (roundedDelta >= -19 && roundedDelta <= 19) {
        remarks = 'Subjective Decision';
      } else {
        remarks = 'Subjective Decision';
      }
      
      return {
        category,
        positiveCount,
        negativeCount,
        pPercent: Math.round(pPercent * 100) / 100, // Round to 2 decimal places
        nPercent: Math.round(nPercent * 100) / 100, // Round to 2 decimal places
        deltaPercent: roundedDelta,
        remarks
      };
    });

    // Sort by category alphabetically
    combined.sort((a, b) => a.category.localeCompare(b.category));

    return combined;
  }, [remarksSubImpAccountData, remarksSubStrAccountData]);
  
  // Account Wise Top Expectations Analysis
  const accountWiseTopExpectationsData = useMemo(() => {
    const accountMap = new Map();
    
    (topExpectationsDoingWellAccountData || []).forEach(item => {
      if (!item || !item.groups) return;
      item.groups.forEach(account => {
        const accountName = (account || '').trim();
        if (!accountName) return;
        if (!accountMap.has(accountName)) {
          accountMap.set(accountName, { account: accountName, doingWell: new Set(), canDoBetter: new Set() });
        }
        if (item.category) {
          accountMap.get(accountName).doingWell.add(item.category);
        }
      });
    });
    
    (topExpectationsCanDoBetterAccountData || []).forEach(item => {
      if (!item || !item.groups) return;
      item.groups.forEach(account => {
        const accountName = (account || '').trim();
        if (!accountName) return;
        if (!accountMap.has(accountName)) {
          accountMap.set(accountName, { account: accountName, doingWell: new Set(), canDoBetter: new Set() });
        }
        if (item.category) {
          accountMap.get(accountName).canDoBetter.add(item.category);
        }
      });
    });
    
    const rows = Array.from(accountMap.values())
      .sort((a, b) => a.account.localeCompare(b.account))
      .map((entry, index) => ({
        srNo: index + 1,
        account: entry.account,
        doingWell: entry.doingWell.size > 0 ? Array.from(entry.doingWell).sort().join(', ') : '-',
        canDoBetter: entry.canDoBetter.size > 0 ? Array.from(entry.canDoBetter).sort().join(', ') : '-'
      }));
    
    return rows;
  }, [topExpectationsDoingWellAccountData, topExpectationsCanDoBetterAccountData]);
  
  const topExpectationsCanDoBetterTableData = topExpectationsCanDoBetterView === 'bu' ? topExpectationsCanDoBetterBUData : topExpectationsCanDoBetterAccountData;
  const topExpectationsDoingWellTableData = topExpectationsDoingWellView === 'bu' ? topExpectationsDoingWellBUData : topExpectationsDoingWellAccountData;

  // Prepare chart data for horizontal bar chart - using P% and N% from Combined Category Analysis table
  const chartData = useMemo(() => {
    console.log('🔍 DEBUG: chartData useMemo triggered');
    console.log('🔍 DEBUG: combinedRemarksAccountData:', combinedRemarksAccountData);
    
    if (!combinedRemarksAccountData || combinedRemarksAccountData.length === 0) {
      console.log('⚠️ No combinedRemarksAccountData available for chart');
      return [];
    }
    
    console.log('🔍 DEBUG: Processing', combinedRemarksAccountData.length, 'items');
    
    const data = combinedRemarksAccountData.map((item, index) => {
      // Directly use pPercent and nPercent from the table data
      // These are already calculated percentages from the Combined Category Analysis
      let pPercent = 0;
      let nPercent = 0;
      
      if (item.pPercent !== undefined && item.pPercent !== null) {
        pPercent = typeof item.pPercent === 'number' ? item.pPercent : parseFloat(item.pPercent) || 0;
      }
      if (item.nPercent !== undefined && item.nPercent !== null) {
        nPercent = typeof item.nPercent === 'number' ? item.nPercent : parseFloat(item.nPercent) || 0;
      }
      
      // Ensure values are within 0-100 range and are proper numbers
      // Convert to number first, then clamp, then format
      pPercent = parseFloat((Math.max(0, Math.min(100, Number(pPercent)))).toFixed(2));
      nPercent = parseFloat((Math.max(0, Math.min(100, Number(nPercent)))).toFixed(2));
      
      // Ensure they're valid numbers (not NaN)
      if (isNaN(pPercent)) pPercent = 0;
      if (isNaN(nPercent)) nPercent = 0;
      
      const result = {
        category: String(item.category || ''),
        pPercent: pPercent,
        nPercent: nPercent
      };
      
      // Debug first 3 items
      if (index < 3) {
        console.log(`🔍 DEBUG: Item ${index}:`, {
          original: item,
          processed: result,
          pPercentRaw: item.pPercent,
          nPercentRaw: item.nPercent,
          pPercentProcessed: pPercent,
          nPercentProcessed: nPercent
        });
      }
      
      return result;
    });
    
    // Filter out items without category, but keep all items with valid data
    const filteredData = data.filter(item => {
      const hasCategory = item.category && item.category.trim() !== '';
      return hasCategory;
    });
    
    // If no data after filtering, log warning
    if (filteredData.length === 0 && data.length > 0) {
      console.warn('⚠️ All chart data filtered out. Sample data:', data.slice(0, 3));
    }
    
    // Debug: Log comprehensive data structure
    console.log('📊 DEBUG: Chart Data Processing Complete:', {
      sourceDataLength: combinedRemarksAccountData.length,
      processedDataLength: data.length,
      filteredDataLength: filteredData.length,
      first3SourceEntries: combinedRemarksAccountData.slice(0, 3).map(item => ({
        category: item.category,
        pPercent: item.pPercent,
        nPercent: item.nPercent,
        pPercentType: typeof item.pPercent,
        nPercentType: typeof item.nPercent,
        positiveCount: item.positiveCount,
        negativeCount: item.negativeCount
      })),
      first3ProcessedEntries: data.slice(0, 3),
      first3FilteredEntries: filteredData.slice(0, 3),
      sampleEntry: filteredData[0] || null,
      allCategories: filteredData.map(d => d.category),
      allPPercent: filteredData.map(d => d.pPercent),
      allNPercent: filteredData.map(d => d.nPercent),
      dataStructure: filteredData.length > 0 ? {
        category: typeof filteredData[0].category,
        pPercent: typeof filteredData[0].pPercent,
        nPercent: typeof filteredData[0].nPercent
      } : 'No data'
    });
    
    return filteredData;
  }, [combinedRemarksAccountData]);

  // Download chart as image
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

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        link.href = url;
        link.download = `Combined_Category_Analysis_Chart_${yyyy}-${mm}-${dd}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  // Download main qualitative analysis data to Excel
  const downloadQualitativeAnalysisExcel = () => {
    try {
      if (!filteredData || filteredData.length === 0) {
        alert('No data available to download');
        return;
      }

      // Prepare data for Excel export
      const excelData = filteredData.map((row) => ({
        'Sr. No.': row.id,
        'Business Unit': row.businessUnit || '',
        'Customer Name': row.customerName || '',
        'Respondent Name': row.respondentName || '',
        'NPS': row.NPS || '',
        'Meeting Delivery Commitments': row['Meeting Delivery Commitments'] || '',
        'Customer Engagement and Relationship': row['Customer Engagement and Relationship'] || '',
        'Partner adding value to Customer Business': row['Partner adding value to Customer Business'] || '',
        'Resource Competency': row['Resource Competency'] || '',
        'Team Commitment & Collaboration': row['Team Commitment & Collaboration'] || '',
        'Timely Resource Fulfillment': row['Timely Resource Fulfillment'] || '',
        'Quality of Delivery': row['Quality of Delivery'] || '',
        'Areas of Improvement': row.areasOfImprovement || '',
        'Strength': row.strength || '',
        'Sub Areas of Improvement': row.subAreasOfImprovement || '',
        'Sub Strength': row.subStrength || ''
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      ws['!cols'] = [
        { wch: 8 },   // Sr. No.
        { wch: 20 },  // Business Unit
        { wch: 30 },  // Customer Name
        { wch: 25 },  // Respondent Name
        { wch: 10 },  // NPS
        { wch: 30 },  // Meeting Delivery Commitments
        { wch: 30 },  // Customer Engagement and Relationship
        { wch: 30 },  // Partner adding value to Customer Business
        { wch: 30 },  // Resource Competency
        { wch: 30 },  // Team Commitment & Collaboration
        { wch: 30 },  // Timely Resource Fulfillment
        { wch: 30 },  // Quality of Delivery
        { wch: 30 },  // Areas of Improvement
        { wch: 30 },  // Strength
        { wch: 30 },  // Sub Areas of Improvement
        { wch: 30 }   // Sub Strength
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Qualitative Analysis');

      // Generate filename with date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `Org_Level_Qualitative_Analysis_${yyyy}-${mm}-${dd}.xlsx`;

      // Download file
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error('Error downloading qualitative analysis:', error);
      alert('Error downloading qualitative analysis data');
    }
  };

  // Function to analyze sentiment of a remark
  const analyzeSentiment = (ratingDescription) => {
    if (!ratingDescription || typeof ratingDescription !== 'string') {
      return 'neutral';
    }

    const description = ratingDescription.toLowerCase();
    
    // Negative words for identifying negative sentiment
    const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'disappointed', 'unhappy', 
      'frustrated', 'angry', 'dissatisfied', 'worst', 'horrible', 
      'unacceptable', 'failing', 'broken', 'improve', 'better', 'enhance', 
      'issue', 'problem', 'concern', 'challenge', 'difficult', 'slow', 
      'delay', 'lack', 'missing', 'insufficient', 'not good', 'could be better'];
    
    // Positive words for identifying positive sentiment
    const positiveWords = ['excellent', 'great', 'good', 'amazing', 'outstanding', 'perfect', 
      'satisfied', 'happy', 'pleased', 'impressed', 'wonderful', 
      'fantastic', 'superb', 'brilliant', 'exceeded', 'above', 'beyond', 
      'exceptional', 'marvelous', 'top-notch', 'first-class', 'premium', 
      'quality', 'professional', 'reliable'];
    
    // Count occurrences
    const negativeCount = negativeWords.filter(word => description.includes(word)).length;
    const positiveCount = positiveWords.filter(word => description.includes(word)).length;
    
    // Determine sentiment
    if (positiveCount > negativeCount) {
      return 'positive';
    } else if (negativeCount > positiveCount) {
      return 'negative';
    } else {
      return 'neutral';
    }
  };

  // Download Remarks with Sentiment Analysis (Positive, Negative, Neutral with category names)
  const downloadRemarksSentimentAnalysisExcel = () => {
    try {
      if (!remarksData || remarksData.length === 0) {
        alert('No remarks data available to download. Please upload remarks and try again.');
        return;
      }

      console.log('📊 Starting sentiment analysis export...');
      console.log('📝 Total remarks rows:', remarksData.length);
      console.log('📋 Sample row keys:', remarksData[0] ? Object.keys(remarksData[0]) : 'No data');

      const wb = XLSX.utils.book_new();
      const wsData = [];

      // Headers
      const headers = [
        'Sr. No.',
        'Business Unit',
        'Customer Name',
        'Respondent Name',
        'PERSPECTIVE',
        'RATING_DESCRIPTION',
        'Sub Areas of Improvement',
        'Sub Strength',
        'Positive',
        'Negative',
        'Neutral'
      ];
      wsData.push(headers);

      // Process each remark row
      remarksData.forEach((row, index) => {
        // Get all possible column name variations
        const ratingDescription = getRemarksValue(row, 'RATING_DESCRIPTION') || 
                                  getRemarksValue(row, 'RATING DESCRIPTION') ||
                                  getRemarksValue(row, 'Rating Description') || '';
        
        const subAreasOfImprovement = getRemarksValue(row, 'Sub Areas of Improvement') || 
                                      getRemarksValue(row, 'SUB AREAS OF IMPROVEMENT') ||
                                      getRemarksValue(row, 'Sub Areas Of Improvement') || '';
        
        const subStrength = getRemarksValue(row, 'Sub Strength') || 
                           getRemarksValue(row, 'SUB STRENGTH') ||
                           getRemarksValue(row, 'Sub Strength') || '';
        
        const businessUnit = getRemarksValue(row, 'BUSINESS UNIT') || 
                            getRemarksValue(row, 'Business Unit') || '';
        const customerName = getRemarksValue(row, 'CUSTOMER NAME') || 
                            getRemarksValue(row, 'ACCOUNT NAME') || 
                            getRemarksValue(row, 'CUSTOMER') ||
                            getRemarksValue(row, 'Customer Name') || '';
        const respondentName = getRemarksValue(row, 'RESPONDENT NAME') || 
                               getRemarksValue(row, 'RESPONDENT') ||
                               getRemarksValue(row, 'Respondent Name') || '';
        const perspective = getRemarksValue(row, 'PERSPECTIVE') || 
                           getRemarksValue(row, 'Perspective') || '';

        // Debug first few rows
        if (index < 3) {
          console.log(`Row ${index + 1}:`, {
            ratingDescription: ratingDescription.substring(0, 50) + '...',
            subAreasOfImprovement,
            subStrength,
            businessUnit,
            customerName
          });
        }

        // Analyze sentiment
        const sentiment = analyzeSentiment(ratingDescription);
        
        if (index < 3) {
          console.log(`Row ${index + 1} sentiment:`, sentiment);
        }

        // Determine category names based on sentiment
        // Positive column: contains Sub Strength category names when sentiment is positive
        // Negative column: contains Sub Areas of Improvement category names when sentiment is negative
        // Neutral column: contains both category names when sentiment is neutral
        let positiveCategory = '';
        let negativeCategory = '';
        let neutralCategory = '';

        if (sentiment === 'positive') {
          // For positive sentiment, put Sub Strength in Positive column
          positiveCategory = subStrength || '';
        } else if (sentiment === 'negative') {
          // For negative sentiment, put Sub Areas of Improvement in Negative column
          negativeCategory = subAreasOfImprovement || '';
        } else {
          // For neutral sentiment, put both in Neutral column
          const categories = [];
          if (subStrength && subStrength.trim()) {
            categories.push(subStrength);
          }
          if (subAreasOfImprovement && subAreasOfImprovement.trim()) {
            categories.push(subAreasOfImprovement);
          }
          neutralCategory = categories.join(', ');
        }

        if (index < 3) {
          console.log(`Row ${index + 1} categories:`, {
            positiveCategory,
            negativeCategory,
            neutralCategory
          });
        }

        // Add row
        wsData.push([
          index + 1,
          businessUnit,
          customerName,
          respondentName,
          perspective,
          ratingDescription,
          subAreasOfImprovement,
          subStrength,
          positiveCategory,
          negativeCategory,
          neutralCategory
        ]);
      });

      console.log('✅ Processed', wsData.length - 1, 'rows (excluding header)');

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 8 },   // Sr. No.
        { wch: 15 },  // Business Unit
        { wch: 25 },  // Customer Name
        { wch: 20 },  // Respondent Name
        { wch: 20 },  // PERSPECTIVE
        { wch: 50 },  // RATING_DESCRIPTION
        { wch: 35 },  // Sub Areas of Improvement
        { wch: 35 },  // Sub Strength
        { wch: 35 },  // Positive
        { wch: 35 },  // Negative
        { wch: 35 }   // Neutral
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Sentiment Analysis');

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `Remarks_Sentiment_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      console.log('✅ Excel file downloaded:', fileName);
      alert('Sentiment Analysis Excel file downloaded successfully!');
    } catch (err) {
      console.error('❌ Error downloading Remarks Sentiment Analysis:', err);
      console.error('Error details:', err.stack);
      alert('Error downloading Remarks Sentiment Analysis. Please check the console for details.');
    }
  };

  // Download Remarks-based Bucket Analysis (4 sheets)
  const downloadRemarksAnalysisExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const safeSheetName = (name) => {
        if (!name) return 'Sheet';
        // Remove invalid characters: : \\ / ? * [ ]
        const cleaned = name.replace(/[:\\/?*\[\]]/g, ' ').trim();
        return cleaned.length > 31 ? cleaned.slice(0, 31) : cleaned;
      };

      const buildSheet = (rows, viewLabel, title) => {
        const header = ['Sr. No.', 'Category', 'Count', viewLabel === 'BU' ? 'Business Units' : 'Accounts', 'Respondent Names'];
        const aoa = [header];
        rows.forEach((r, idx) => {
          aoa.push([
            idx + 1,
            r.category,
            r.count,
            (r.groups && r.groups.length ? r.groups.join(', ') : '-'),
            (r.respondentNames && r.respondentNames.length ? r.respondentNames.join(', ') : '-')
          ]);
        });
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName(title));
      };

      const allCounts = [
        (remarksSubImpAccountData || []).length,
        (remarksSubImpBUData || []).length,
        (remarksSubStrAccountData || []).length,
        (remarksSubStrBUData || []).length
      ].reduce((a, b) => a + b, 0);

      if (allCounts === 0) {
        alert('No remarks data available to download. Please upload remarks and try again.');
        return;
      }

      buildSheet(remarksSubImpAccountData || [], 'Account', 'Remarks - Sub AoI (Account)');
      buildSheet(remarksSubImpBUData || [], 'BU', 'Remarks - Sub AoI (BU)');
      // Use a shorter sheet name to fit Excel 31-char limit
      buildSheet(remarksSubStrAccountData || [], 'Account', 'Remarks - Sub Strength (Acc)');
      buildSheet(remarksSubStrBUData || [], 'BU', 'Remarks - Sub Strength (BU)');

      // Add combined dashboard sheet with ExcelJS for cell coloring
      if (combinedRemarksAccountData && combinedRemarksAccountData.length > 0) {
        // Use ExcelJS for the combined sheet to support cell colors
        const ExcelJS = require('exceljs');
        const excelWorkbook = new ExcelJS.Workbook();
        
        // Add existing sheets from XLSX workbook to ExcelJS workbook
        // First, we need to save XLSX workbook and read it, or create ExcelJS workbook from scratch
        // For simplicity, let's create a new ExcelJS workbook and add all sheets
        
        // Create new ExcelJS workbook
        const newWorkbook = new ExcelJS.Workbook();
        
        // Add existing sheets using XLSX data
        const sheetNames = wb.SheetNames;
        sheetNames.forEach(sheetName => {
          const ws = wb.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
          const newSheet = newWorkbook.addWorksheet(safeSheetName(sheetName));
          
          jsonData.forEach((row, rowIndex) => {
            const newRow = newSheet.addRow(row);
            if (rowIndex === 0) {
              // Style header row
              newRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a8a' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                };
              });
            }
          });
        });
        
        // Add combined dashboard sheet with cell colors
        const combinedSheet = newWorkbook.addWorksheet(safeSheetName('Combined Category Analysis'));
        combinedSheet.columns = [
          { header: 'Sr. No.', key: 'sno', width: 10 },
          { header: 'Category', key: 'category', width: 30 },
          { header: '# Positive Customer Comments (P)', key: 'positiveCount', width: 35 },
          { header: '# Negative Customer Comments (N)', key: 'negativeCount', width: 35 },
          { header: 'P%', key: 'pPercent', width: 12 },
          { header: 'N%', key: 'nPercent', width: 12 },
          { header: 'Delta %', key: 'deltaPercent', width: 12 },
          { header: 'Remarks', key: 'remarks', width: 25 }
        ];
        
        // Style header row
        combinedSheet.getRow(1).eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1e3a8a' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
        
        // Add data rows
        combinedRemarksAccountData.forEach((r, idx) => {
          const row = combinedSheet.addRow({
            sno: idx + 1,
            category: r.category,
            positiveCount: r.positiveCount,
            negativeCount: r.negativeCount,
            pPercent: `${r.pPercent.toFixed(2)}%`,
            nPercent: `${r.nPercent.toFixed(2)}%`,
            deltaPercent: `${r.deltaPercent.toFixed(2)}%`,
            remarks: r.remarks || ''
          });
          
          // Style the Remarks column (column 8)
          const remarksCell = row.getCell(8);
          remarksCell.alignment = { horizontal: 'center', vertical: 'middle' };
          remarksCell.font = { bold: true };
          remarksCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          // Apply cell colors based on remarks value
          if (r.remarks === 'Strength') {
            // Dark Green
            remarksCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006400' } };
            remarksCell.font = { ...remarksCell.font, color: { argb: 'FFFFFFFF' } };
          } else if (r.remarks === 'Area for Improvement') {
            // Red
            remarksCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            remarksCell.font = { ...remarksCell.font, color: { argb: 'FFFFFFFF' } };
          } else if (r.remarks === 'Needs focus') {
            // Amber
            remarksCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            remarksCell.font = { ...remarksCell.font, color: { argb: 'FF000000' } };
          } else if (r.remarks === 'Need to build on') {
            // Light Green
            remarksCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
            remarksCell.font = { ...remarksCell.font, color: { argb: 'FF000000' } };
          }
          
          // Style other cells
          row.eachCell((cell, colNumber) => {
            if (colNumber !== 8) { // Not the Remarks column
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
              if (colNumber <= 2 || colNumber === 8) {
                cell.alignment = { horizontal: 'left', vertical: 'middle' };
              } else {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            }
          });
        });
        
        // Add legend rows
        combinedSheet.addRow([]);
        const legendRows = [
          ['Legend:'],
          ['Delta > 50% : Strength'],
          ['20% ≤ Delta ≤ 50% : Need to build on (Potential to become Strength)'],
          ['Delta ≤ -50% : Area for Improvement'],
          ['-50% < Delta ≤ -20% : Needs focus (Likely to become Area of Improvement)'],
          ['-19% ≤ Delta ≤ 19% : Subjective Decision']
        ];

        legendRows.forEach((text, index) => {
          const legendRow = combinedSheet.addRow(text);
          const cell = legendRow.getCell(1);
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
          cell.font = {
            bold: index === 0,
            color: { argb: '000000' },
            size: 11
          };
        });

        // Save the ExcelJS workbook
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const fileName = `Remarks_Bucket_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
        
        newWorkbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          window.URL.revokeObjectURL(url);
          alert('Remarks Bucket Analysis Excel file downloaded successfully!');
        }).catch((err) => {
          console.error('Error downloading Excel file:', err);
          alert('Error downloading Excel file. Please try again.');
        });
        
        return; // Exit early since we're using ExcelJS
      }

      // If no combined data, use XLSX for the other sheets
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const fileName = `Remarks_Bucket_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error('Error downloading Remarks Bucket Analysis:', err);
      alert('Error downloading Remarks Bucket Analysis.');
    }
  };

  // Remarks upload handlers
  const handleRemarksUpload = async (e) => {
    try {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      console.log('📤 Uploading remarks file:', file.name);
      setRemarksFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setRemarksData(json);
      // Persist to sessionStorage for session retention
      try {
        sessionStorage.setItem('remarksQualitativeAnalysisData', JSON.stringify(json));
        sessionStorage.setItem('remarksQualitativeAnalysisFileName', file.name);
      } catch (storageErr) {
        console.warn('Unable to persist remarks to sessionStorage:', storageErr);
      }
      console.log('📝 Loaded Remarks for Different Perspectives:', { file: file.name, rows: json.length, sample: json.slice(0, 3) });
      console.log('✅ Remarks file name set:', file.name);
    } catch (err) {
      console.error('Failed to read Remarks file:', err);
      alert('Failed to read the Remarks file. Please ensure it is a valid Excel/CSV file.');
    }
  };

  const clearRemarksUpload = () => {
    setRemarksFileName('');
    setRemarksData([]);
    if (remarksInputRef.current) {
      remarksInputRef.current.value = '';
    }
    try {
      sessionStorage.removeItem('remarksQualitativeAnalysisData');
      sessionStorage.removeItem('remarksQualitativeAnalysisFileName');
    } catch (storageErr) {
      console.warn('Unable to clear remarks from sessionStorage:', storageErr);
    }
  };

  // Restore remarks from sessionStorage on mount
  useEffect(() => {
    try {
      const dataStr = sessionStorage.getItem('remarksQualitativeAnalysisData');
      const fileName = sessionStorage.getItem('remarksQualitativeAnalysisFileName');
      if (dataStr) {
        setRemarksData(JSON.parse(dataStr));
        setRemarksFileName(fileName || '');
      }
    } catch (err) {
      // Ignore
    }
  }, []);

  // Enhanced date comparison function with robust parsing
  const isDateGreaterThanOrEqual = (dateStr1, dateStr2) => {
    if (!dateStr1 || !dateStr2) return false;
    
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      
      // Handle Excel serial dates
      if (typeof dateStr === 'number') {
        const excelEpoch = new Date(1900, 0, 1);
        return new Date(excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000);
      }
      
      // Handle MM-DD-YYYY format (primary format)
      if (typeof dateStr === 'string') {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
          // Check if it's DD-MMM-YYYY format (e.g., "14-Oct-2025")
          if (parts[1].length === 3 && isNaN(parts[1])) {
            const [day, monthStr, year] = parts;
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            const month = monthMap[monthStr];
            if (month !== undefined && day && year) {
              return new Date(year, month, day);
            }
          } else {
            // Handle MM-DD-YYYY format
        const [month, day, year] = parts;
            if (month && day && year) {
        return new Date(year, month - 1, day);
      }
          }
        }
        
        // Handle MM/DD/YYYY format
        const slashParts = dateStr.split('/');
        if (slashParts.length === 3) {
          const [month, day, year] = slashParts;
          if (month && day && year) {
            return new Date(year, month - 1, day);
          }
        }
        
        // Handle YYYY-MM-DD format
        const dashParts = dateStr.split('-');
        if (dashParts.length === 3 && dashParts[0].length === 4) {
          const [year, month, day] = dashParts;
          if (year && month && day) {
            return new Date(year, month - 1, day);
          }
        }
        
        // Fallback to standard Date parsing
        return new Date(dateStr);
      }
      
      return new Date(dateStr);
    };

    const date1 = parseDate(dateStr1);
    const date2 = parseDate(dateStr2);
    
    // Debug: Log parsed dates for troubleshooting
    if (dateStr1 && dateStr2) {
      console.log('🔍 Date comparison debug:', {
        originalDate1: dateStr1,
        originalDate2: dateStr2,
        parsedDate1: date1,
        parsedDate2: date2,
        isValidDate1: date1 && !isNaN(date1.getTime()),
        isValidDate2: date2 && !isNaN(date2.getTime()),
        comparison: date1 >= date2
      });
    }
    
    if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      return false;
    }
    
    return date1 >= date2;
  };

  // Function to categorize RATING_DESCRIPTION into specific sub areas of improvement
  const categorizeSubAreasOfImprovement = (ratingDescription) => {
    if (!ratingDescription || typeof ratingDescription !== 'string') {
      return [];
    }

    const description = ratingDescription.toLowerCase();
    const subAreas = [];
    
    // Check for Timely Resource Fulfillment at description level
    if (description.includes('resources we needed') || description.includes('timely manner') || (description.includes('couldn\'t') && description.includes('resource')) || (description.includes('could not') && description.includes('resource'))) {
      subAreas.push('Timely Resource Fulfillment');
    }
    // Check for Team Commitment & Collaboration at description level (not impressed)
    if (description.includes('not impressed')) {
      subAreas.push('Team Commitment & Collaboration');
    }
    // Check for Quality of Delivery at description level
    if (description.includes('insufficient') || description.includes('not meeting') || description.includes('template design') || description.includes('form template') || description.includes('better job') || description.includes('promoting their value') || description.includes('barely overlap')) {
      subAreas.push('Quality of Delivery');
    }
    
    // Negative words for identifying areas of improvement
    const negativeWords = ['poor', 'bad', 'terrible', 'awful', 'disappointed', 'unhappy', 
      'frustrated', 'angry', 'dissatisfied', 'worst', 'horrible', 
      'unacceptable', 'failing', 'broken', 'unfortunately'];
    
    // Check if description contains any negative words
    const hasNegativeWords = negativeWords.some(word => description.includes(word));
    if (hasNegativeWords) {
      subAreas.push('General Improvement Needed');
    }
    
    // Split by comma and process each part
    const parts = description.split(',').map(part => part.trim()).filter(part => part);
    
    parts.forEach(part => {
      // Check for Team Commitment & Collaboration first (not impressed)
      if (part.includes('not impressed')) {
        subAreas.push('Team Commitment & Collaboration');
        return;
      }
      // Check for Timely Resource Fulfillment (resources we needed, timely manner, couldn't get)
      if (part.includes('resources we needed') || part.includes('timely manner') || (part.includes('couldn\'t') && part.includes('resource')) || (part.includes('could not') && part.includes('resource')) || part.includes('resource fulfillment')) {
        subAreas.push('Timely Resource Fulfillment');
        return;
      }
      // Check for Quality of Delivery (insufficient, not meeting, template design, better job)
      if (part.includes('insufficient') || part.includes('not meeting') || part.includes('template design') || part.includes('form template') || part.includes('better job') || part.includes('promoting their value') || part.includes('barely overlap')) {
        subAreas.push('Quality of Delivery');
        return;
      }
      // Check for negative words in each part
      const partHasNegativeWords = negativeWords.some(word => part.includes(word));
      if (partHasNegativeWords) {
        subAreas.push('General Improvement Needed');
        return; // Skip further categorization for this part
      }
      
      // Define specific sub categories for improvement areas
      if (part.includes('communication') || part.includes('response') || part.includes('feedback') || part.includes('listening')) {
        subAreas.push('Communication Issues');
      } else if (part.includes('insufficient') || part.includes('not meeting') || part.includes('template design') || part.includes('form template') || part.includes('better job') || part.includes('promoting') || part.includes('barely')) {
        subAreas.push('Quality of Delivery');
      } else if (part.includes('delivery') || part.includes('timeline') || part.includes('schedule') || part.includes('deadline')) {
        subAreas.push('Delivery & Timeline Issues');
      } else if (part.includes('quality') || part.includes('testing') || part.includes('bug') || part.includes('defect') || part.includes('error')) {
        subAreas.push('Quality & Testing Issues');
      } else if (part.includes('support') || part.includes('help') || part.includes('assistance') || part.includes('service')) {
        subAreas.push('Support & Service Issues');
      } else if (part.includes('documentation') || part.includes('guide') || part.includes('manual') || part.includes('instructions')) {
        subAreas.push('Documentation Issues');
      } else if (part.includes('training') || part.includes('knowledge') || part.includes('skill') || part.includes('expertise')) {
        subAreas.push('Training & Knowledge Gaps');
      } else if (part.includes('process') || part.includes('workflow') || part.includes('procedure') || part.includes('method')) {
        subAreas.push('Process & Workflow Issues');
      } else if (part.includes('performance') || part.includes('speed') || part.includes('efficiency') || part.includes('slow')) {
        subAreas.push('Performance Issues');
      } else if (part.includes('cost') || part.includes('pricing') || part.includes('budget') || part.includes('expensive')) {
        subAreas.push('Cost & Pricing Concerns');
      } else if (part.includes('security') || part.includes('compliance') || part.includes('audit') || part.includes('risk')) {
        subAreas.push('Security & Compliance Issues');
      } else if (part.includes('automation') || part.includes('ansible') || part.includes('scripting') || part.includes('manual work')) {
        subAreas.push('Automation & Efficiency Issues');
      } else if (part.includes('follow') || part.includes('update') || part.includes('tracking') || part.includes('monitoring')) {
        subAreas.push('Follow-up & Tracking Issues');
      } else if (part.includes('ticket') || part.includes('issue') || part.includes('incident') || part.includes('resolution')) {
        subAreas.push('Ticket Management Issues');
      } else if (part.includes('team') || part.includes('collaboration') || part.includes('coordination') || part.includes('cooperation')) {
        subAreas.push('Team Collaboration Issues');
      } else if (part.includes('expectation') || part.includes('requirement') || part.includes('scope') || part.includes('deliverable')) {
        subAreas.push('Expectation Management Issues');
      } else if (part.includes('resource') && (part.includes('needed') || part.includes('timely') || part.includes('fulfillment'))) {
        subAreas.push('Timely Resource Fulfillment');
      } else if (part.includes('improve') || part.includes('better') || part.includes('enhance') || part.includes('upgrade')) {
        subAreas.push('General Improvement Needed');
      } else {
        subAreas.push('Other Issues');
      }
    });
    
    // Remove duplicates and return
    return [...new Set(subAreas)];
  };

  // Function to categorize RATING_DESCRIPTION into specific sub strengths
  const categorizeSubStrength = (ratingDescription) => {
    if (!ratingDescription || typeof ratingDescription !== 'string') {
      return [];
    }

    const description = ratingDescription.toLowerCase();
    const subStrengths = [];
    
    // Check for Resource Competency at description level (background knowledge, seamlessly + transition)
    if (description.includes('background knowledge') || (description.includes('seamlessly') && description.includes('transition')) || (description.includes('take on') && description.includes('audit process'))) {
      subStrengths.push('Resource Competency');
    }
    
    // Positive words for identifying strengths
    const positiveWords = ['excellent', 'great', 'good', 'amazing', 'outstanding', 'perfect', 
      'satisfied', 'happy', 'pleased', 'impressed', 'wonderful', 
      'fantastic', 'superb', 'brilliant'];
    
    // Check if description contains any positive words
    const hasPositiveWords = positiveWords.some(word => description.includes(word));
    if (hasPositiveWords) {
      subStrengths.push('General Excellence');
    }
    
    // Split by comma and process each part
    const parts = description.split(',').map(part => part.trim()).filter(part => part);
    
    parts.forEach(part => {
      // Check for Resource Competency first (background knowledge, seamlessly, take on, audit process, transition)
      if (part.includes('background knowledge') || (part.includes('seamlessly') && part.includes('transition')) || (part.includes('take on') && part.includes('audit process'))) {
        subStrengths.push('Resource Competency');
        return;
      }
      // Check for Team Commitment & Collaboration (support + consultant, significantly helped, administration support)
      if (part.includes('significantly helped') || (part.includes('support') && part.includes('consultant')) || part.includes('administration support')) {
        subStrengths.push('Team Commitment & Collaboration');
        return;
      }
      // Check for positive words in each part
      const partHasPositiveWords = positiveWords.some(word => part.includes(word));
      if (partHasPositiveWords) {
        subStrengths.push('General Excellence');
        return; // Skip further categorization for this part
      }
      
      // Define specific sub categories for strength areas
      if (part.includes('communication') || part.includes('response') || part.includes('feedback') || part.includes('listening') || part.includes('clear')) {
        subStrengths.push('Communication Excellence');
      } else if (part.includes('delivery') || part.includes('timeline') || part.includes('schedule') || part.includes('on-time') || part.includes('punctual')) {
        subStrengths.push('Delivery Excellence');
      } else if (part.includes('quality') || part.includes('testing') || part.includes('thorough') || part.includes('attention to detail') || part.includes('high quality')) {
        subStrengths.push('Quality Excellence');
      } else if (part.includes('significantly helped') || (part.includes('support') && part.includes('consultant')) || part.includes('team commitment') || part.includes('commitment & collaboration')) {
        subStrengths.push('Team Commitment & Collaboration');
      } else if (part.includes('support') || part.includes('help') || part.includes('assistance') || part.includes('responsive') || part.includes('helpful')) {
        subStrengths.push('Support Excellence');
      } else if (part.includes('documentation') || part.includes('guide') || part.includes('manual') || part.includes('clear') || part.includes('detailed')) {
        subStrengths.push('Documentation Excellence');
      } else if (part.includes('background knowledge') || part.includes('seamlessly') || part.includes('take on') || part.includes('audit process') || part.includes('transition') || part.includes('high level')) {
        subStrengths.push('Resource Competency');
      } else if (part.includes('training') || part.includes('knowledge') || part.includes('skill') || part.includes('expertise') || part.includes('professional')) {
        subStrengths.push('Knowledge Excellence');
      } else if (part.includes('process') || part.includes('workflow') || part.includes('procedure') || part.includes('efficient') || part.includes('streamlined')) {
        subStrengths.push('Process Excellence');
      } else if (part.includes('performance') || part.includes('speed') || part.includes('efficiency') || part.includes('fast') || part.includes('quick')) {
        subStrengths.push('Performance Excellence');
      } else if (part.includes('cost') || part.includes('pricing') || part.includes('budget') || part.includes('value') || part.includes('affordable')) {
        subStrengths.push('Value Excellence');
      } else if (part.includes('security') || part.includes('compliance') || part.includes('audit') || part.includes('reliable') || part.includes('secure')) {
        subStrengths.push('Security Excellence');
      } else if (part.includes('automation') || part.includes('ansible') || part.includes('scripting') || part.includes('automated') || part.includes('efficient')) {
        subStrengths.push('Automation Excellence');
      } else if (part.includes('follow') || part.includes('update') || part.includes('tracking') || part.includes('monitoring') || part.includes('proactive')) {
        subStrengths.push('Follow-up Excellence');
      } else if (part.includes('ticket') || part.includes('issue') || part.includes('incident') || part.includes('resolution') || part.includes('quick resolution')) {
        subStrengths.push('Ticket Management Excellence');
      } else if (part.includes('team') || part.includes('collaboration') || part.includes('coordination') || part.includes('cooperation') || part.includes('partnership')) {
        subStrengths.push('Team Commitment & Collaboration');
      } else if (part.includes('innovation') || part.includes('creative') || part.includes('solution') || part.includes('problem-solving') || part.includes('innovative')) {
        subStrengths.push('Innovation Excellence');
      } else if (part.includes('great') || part.includes('excellent') || part.includes('good') || part.includes('outstanding') || part.includes('amazing')) {
        subStrengths.push('General Excellence');
      } else {
        subStrengths.push('General Excellence');
      }
    });
    
    // Remove duplicates and return
    return [...new Set(subStrengths)];
  };

  // Function to categorize RATING_DESCRIPTION into Areas of improvement or Strength
  const categorizeRatingDescription = (ratingDescription, perspective) => {
    if (!ratingDescription || typeof ratingDescription !== 'string') {
      return { areasOfImprovement: '', strength: '' };
    }

    const description = ratingDescription.toLowerCase();
    
    // Define keywords for areas of improvement (negative feedback)
    const improvementKeywords = [
      'improve', 'better', 'enhance', 'issue', 'problem', 'concern', 'challenge',
      'difficult', 'slow', 'delay', 'lack', 'missing', 'insufficient', 'poor',
      'disappointed', 'frustrated', 'unsatisfied', 'needs improvement', 'should be',
      'could be better', 'not good', 'bad', 'terrible', 'awful', 'worst',
      // Additional negative words for Sub Areas of Improvement analysis
      'unhappy', 'angry', 'horrible', 'unacceptable', 'failing', 'broken',
      // Timely Resource Fulfillment - couldn't get resources, timely manner
      'unfortunately', 'couldn\'t', 'couldnt', 'could not', 'resources we needed', 'timely manner',
      // Team Commitment & Collaboration - not impressed
      'not impressed',
      // Quality of Delivery - insufficient, not meeting, template design, better job
      'barely', 'not meeting', 'template design', 'form template', 'better job', 'promoting their value'
    ];

    // Define keywords for strengths (positive feedback)
    const strengthKeywords = [
      'excellent', 'great', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding',
      'perfect', 'satisfied', 'happy', 'pleased', 'impressed', 'exceeded', 'above',
      'beyond', 'exceptional', 'superb', 'brilliant', 'marvelous', 'outstanding',
      'top-notch', 'first-class', 'premium', 'quality', 'professional', 'reliable',
      // Resource Competency - skilled, knowledgeable, capable feedback
      'background knowledge', 'seamlessly', 'high level', 'take on', 'transition',
      // Team Commitment & Collaboration - support, consultant, helped feedback
      'significantly helped', 'support from'
    ];

    // Check for improvement keywords
    const hasImprovementKeywords = improvementKeywords.some(keyword => 
      description.includes(keyword)
    );

    // Check for strength keywords
    const hasStrengthKeywords = strengthKeywords.some(keyword => 
      description.includes(keyword)
    );

    // Categorize based on keywords and perspective
    let areasOfImprovement = '';
    let strength = '';

    if (hasImprovementKeywords) {
      areasOfImprovement = perspective;
    }

    // Exclude "not impressed" from strength - it's negative feedback
    if (hasStrengthKeywords && !description.includes('not impressed')) {
      strength = perspective;
    }

    // If no clear keywords, try to determine based on perspective and content
    if (!hasImprovementKeywords && !hasStrengthKeywords) {
      // For NPS, check if it's a recommendation score context
      if (perspective === 'NPS') {
        // This would need actual rating values to determine, but for now we'll leave empty
        // In a real implementation, you'd check the actual rating number
      } else {
        // For other perspectives, default categorization based on content length and sentiment
        if (description.length > 50) {
          // Longer descriptions might indicate areas for improvement
          areasOfImprovement = perspective;
        } else if (description.length < 30) {
          // Shorter, positive descriptions might indicate strengths
          strength = perspective;
        }
      }
    }

    return { areasOfImprovement, strength };
  };

  useEffect(() => {
    const processExcelData = async () => {
      if (!excelData) {
        setError('No Excel data available');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log('Processing Excel data for Org Level Qualitative Analysis...');
        console.log('Excel data:', excelData);

        // Get the "CSAT received Report" sheet (ACSAT/PCSAT may use different names)
        const sheetName = 'CSAT received Report ';
        let worksheet;
        
        if (excelData.SheetNames && excelData.SheetNames.includes(sheetName)) {
          worksheet = excelData.Sheets[sheetName];
        } else {
          const alternativeNames = [
            'CSAT received Report ',  // With trailing space
            'CSAT received Report',
            'CSAT Received Report',
            'Sheet1',
            'CSAT_Received_Report',
            'Qualitative',
            'Qualitative Analysis'
          ];
          for (const name of alternativeNames) {
            if (excelData.SheetNames && excelData.SheetNames.includes(name)) {
              worksheet = excelData.Sheets[name];
              break;
            }
          }
          // Fallback: use first sheet (common for ACSAT single-sheet uploads)
          if (!worksheet && excelData.SheetNames && excelData.SheetNames.length > 0) {
            worksheet = excelData.Sheets[excelData.SheetNames[0]];
          }
        }

        if (!worksheet) {
          const availableSheets = excelData.SheetNames ? excelData.SheetNames.join(', ') : 'No sheets found';
          throw new Error(`Sheet "CSAT received Report" not found in the Excel file. Available sheets: ${availableSheets}`);
        }

        // Convert sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('No data found in the sheet');
        }

        // Get headers and data rows
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);

        console.log('Headers found:', headers);
        console.log('Data rows count:', dataRows.length);

        // Find required columns (support ACSAT variants: BUSSINESS UNIT, CUST_ID, CUST_NM)
        const businessUnitIndex = headers.findIndex(header => {
          if (!header) return false;
          const h = header.toString().toLowerCase();
          return (h.includes('business') && h.includes('unit')) || (h.includes('bussiness') && h.includes('unit'));
        });

        const customerIdIndex = headers.findIndex(header => {
          if (!header) return false;
          const h = header.toString().toLowerCase();
          return (h.includes('customer') && h.includes('id')) || (h === 'cust_id' || h.includes('cust_id'));
        });

        const customerNameIndex = headers.findIndex(header => {
          if (!header) return false;
          const h = header.toString().toLowerCase();
          return (h.includes('customer') && h.includes('name')) || (h === 'cust_nm' || h.includes('cust_nm'));
        });

        const respondentNameIndex = headers.findIndex(header => {
          if (!header) return false;
          const h = header.toString().toLowerCase();
          return (h.includes('respondent') && h.includes('name')) || h === 'respondent name' || h.includes('respondent_name');
        });

        const perspectiveIndex = headers.findIndex(header => 
          header && header.toString().toLowerCase().includes('perspective')
        );

        const ratingDescriptionIndex = headers.findIndex(header => 
          header && header.toString().toLowerCase().includes('rating') && 
          header.toString().toLowerCase().includes('description')
        );

        // Find YEAR - QUARTER column for filtering by CSAT cycle
        const yearQuarterIndex = headers.findIndex(header => {
          if (!header) return false;
          const lowerHeader = header.toString().toLowerCase();
          return lowerHeader === 'year - quarter' || 
                 lowerHeader === 'year_quarter' ||
                 lowerHeader === 'year quarter' ||
                 lowerHeader.includes('year') && lowerHeader.includes('quarter');
        });

        // Note: CSAT Sent Date and CSAT Received Date columns are not displayed but still used for filtering
        const csatSentDateIndex = headers.findIndex(header => {
          if (!header) return false;
          const lowerHeader = header.toString().toLowerCase();
          // Priority: Use "CSAT SENT DATE" column, fallback to "CSS SENT DATE" for backward compatibility
          return lowerHeader === 'csat sent date' || 
                 lowerHeader === 'csat_sent_date' ||
                 lowerHeader.includes('csat sent date') ||
                 lowerHeader.includes('csat_sent_date') ||
                 lowerHeader === 'css sent date' ||
                 lowerHeader === 'css_sent_date' ||
                 lowerHeader.includes('css sent date') ||
                 lowerHeader.includes('css_sent_date') ||
                 (lowerHeader.includes('sent') && lowerHeader.includes('date'));
        });

        const csatReceivedDateIndex = headers.findIndex(header => {
          if (!header) return false;
          const lowerHeader = header.toString().toLowerCase();
          // Priority: Use "CSAT RECEIVED DATE" column, fallback to "CSS RECEIVED DATE" for backward compatibility
          return lowerHeader === 'csat received date' || 
                 lowerHeader === 'csat_received_date' ||
                 lowerHeader.includes('csat received date') ||
                 lowerHeader.includes('csat_received_date') ||
                 lowerHeader === 'css received date' ||
                 lowerHeader === 'css_received_date' ||
                 lowerHeader.includes('css received date') ||
                 lowerHeader.includes('css_received_date') ||
                 (lowerHeader.includes('received') && lowerHeader.includes('date'));
        });

        // Find STATUS column - used to fully override the received-date/date-range check
        // when a row's status is "Completed" (case-insensitive)
        const statusIndex = headers.findIndex(header => {
          if (!header) return false;
          const lowerHeader = header.toString().toLowerCase();
          return lowerHeader === 'status';
        });

        console.log('Column indices:', {
          businessUnitIndex,
          customerIdIndex,
          customerNameIndex,
          respondentNameIndex,
          perspectiveIndex,
          ratingDescriptionIndex,
          yearQuarterIndex,
          csatSentDateIndex,
          csatReceivedDateIndex
        });

        // Debug: Show detected column names
        console.log('Detected column names:', {
          yearQuarterColumn: yearQuarterIndex !== -1 ? headers[yearQuarterIndex] : 'Not found',
          csatSentDateColumn: csatSentDateIndex !== -1 ? headers[csatSentDateIndex] : 'Not found',
          csatReceivedDateColumn: csatReceivedDateIndex !== -1 ? headers[csatReceivedDateIndex] : 'Not found',
          effectiveCycleStartDateFormatted,
          acsatCycle
        });

        if (businessUnitIndex === -1 || customerIdIndex === -1 || customerNameIndex === -1) {
          throw new Error('Required columns (BUSINESS UNIT, CUSTOMER_ID, CUSTOMER NAME) not found');
        }

        if (perspectiveIndex === -1 || ratingDescriptionIndex === -1) {
          throw new Error('Required columns (PERSPECTIVE, RATING_DESCRIPTION) not found');
        }
        
        if (respondentNameIndex === -1) {
          throw new Error('Required column (RESPONDENT NAME) not found');
        }

        // Define the specific perspectives we want to include
        const targetPerspectives = [
          'NPS',
          'Meeting Delivery Commitments',
          'Customer Engagement and Relationship',
          'Partner adding value to Customer Business',
          'Resource Competency',
          'Team Commitment & Collaboration',
          'Timely Resource Fulfillment',
          'Quality of Delivery'
        ];

        // Process data with date filtering and group by customer
        const rawFilteredData = dataRows
          .filter(row => {
            // Check if row has required data
            if (!row[businessUnitIndex] || !row[customerIdIndex] || !row[customerNameIndex]) {
              console.log('❌ Row filtered out - missing required data:', {
                businessUnit: row[businessUnitIndex],
                customerId: row[customerIdIndex],
                customerName: row[customerNameIndex]
              });
              return false;
            }

            // Filter by PERSPECTIVE column only
            const perspective = row[perspectiveIndex];
            
            // Normalize values for case-insensitive comparison
            const normalizedPerspective = perspective ? perspective.toString().trim().toLowerCase() : '';
            const normalizedTargetPerspectives = targetPerspectives.map(p => p.toString().trim().toLowerCase());
            
            // Filter by PERSPECTIVE only (case-insensitive)
            if (!normalizedPerspective || !normalizedTargetPerspectives.includes(normalizedPerspective)) {
              console.log('❌ Row filtered out - perspective not in target:', {
                perspective,
                normalizedPerspective,
                targetPerspectives
              });
              return false;
            }

            // Apply date filtering if dates are available (use effective cycle start from props or context)
            if (effectiveCycleStartDateFormatted) {
              const sentDate = row[csatSentDateIndex];
              const receivedDate = row[csatReceivedDateIndex];

              // Debug: Log date filtering details for first few rows
              if (dataRows.indexOf(row) < 3) {
                console.log(`🔍 Date filtering for row ${dataRows.indexOf(row)}:`, {
                  sentDate,
                  receivedDate,
                  effectiveCycleStartDateFormatted,
                  csatSentDateIndex,
                  csatReceivedDateIndex,
                  headers: headers[csatSentDateIndex],
                  headers: headers[csatReceivedDateIndex]
                });
              }
              
              // If we have sent date, check it
              if (sentDate && !isDateGreaterThanOrEqual(sentDate, effectiveCycleStartDateFormatted)) {
                console.log('❌ Row filtered out - sent date before cycle start:', {
                  sentDate,
                  cycleStartDate: effectiveCycleStartDateFormatted
                });
                return false;
              }
              
              // If we have received date, check it
              if (receivedDate && !isDateGreaterThanOrEqual(receivedDate, effectiveCycleStartDateFormatted)) {
                console.log('❌ Row filtered out - received date before cycle start:', {
                  receivedDate,
                  cycleStartDate: effectiveCycleStartDateFormatted
                });
                return false;
              }
            }

            // Apply YEAR-QUARTER filtering if acsatCycle is available
            if (acsatCycle && yearQuarterIndex !== -1) {
              const yearQuarter = row[yearQuarterIndex];
              
              // Debug: Log YEAR-QUARTER filtering details for first few rows
              if (dataRows.indexOf(row) < 3) {
                console.log(`🔍 YEAR-QUARTER filtering for row ${dataRows.indexOf(row)}:`, {
                  yearQuarter,
                  acsatCycle,
                  yearQuarterIndex,
                  header: headers[yearQuarterIndex]
                });
              }
              
              if (yearQuarter && acsatCycle) {
                const normalizedYQ = String(yearQuarter).trim().toLowerCase();
                const normalizedCycle = String(acsatCycle).trim().toLowerCase();
                if (normalizedYQ !== normalizedCycle) {
                  console.log('❌ Row filtered out - YEAR-QUARTER does not match CSAT cycle:', {
                    yearQuarter,
                    acsatCycle
                  });
                  return false;
                }
              }
            }

            console.log('✅ Row passed all filters:', {
              businessUnit: row[businessUnitIndex],
              customerId: row[customerIdIndex],
              customerName: row[customerNameIndex],
              perspective: row[perspectiveIndex]
            });
            return true;
          });

        // Group data by RESPONDENT NAME (and CUSTOMER_ID or CUST_ID for uniqueness)
        const groupedData = {};
        let respondentCounter = 1;
        
        // Find CUST_ID column index as fallback
        const custIdIndex = headers.findIndex(h => h && (h.toString().toLowerCase().includes('cust_id') || h.toString().toLowerCase().includes('customer_id')));
        
        rawFilteredData.forEach((row, index) => {
          const customerId = row[customerIdIndex] || (custIdIndex !== -1 ? row[custIdIndex] : null);
          const customerName = row[customerNameIndex];
          const respondentName = row[respondentNameIndex];
          const businessUnit = row[businessUnitIndex];
          const perspective = row[perspectiveIndex];
          const ratingDescription = row[ratingDescriptionIndex];
          
          // Create a unique key combining RESPONDENT NAME and CUSTOMER_ID/CUST_ID
          const uniqueKey = `${respondentName || 'Unknown'}_${customerId || 'Unknown'}`;

          if (!groupedData[uniqueKey]) {
            groupedData[uniqueKey] = {
              id: respondentCounter++,
              customerId: customerId || '',
              customerName: customerName || '',
              respondentName: respondentName || '',
              businessUnit: businessUnit || '',
              NPS: '',
              'Meeting Delivery Commitments': '',
              'Customer Engagement and Relationship': '',
              'Partner adding value to Customer Business': '',
              'Resource Competency': '',
              'Team Commitment & Collaboration': '',
              'Timely Resource Fulfillment': '',
              'Quality of Delivery': '',
              areasOfImprovement: '',
              strength: '',
              subAreasOfImprovement: '',
              subStrength: ''
            };
          }

          // Add rating description to the appropriate perspective column
          // Use PERSPECTIVE column value to determine which column to populate
          // Normalize perspective value for comparison (trim and case-insensitive)
          const normalizedPerspective = perspective ? perspective.toString().trim().toLowerCase() : '';
          
          // Find matching perspective using PERSPECTIVE column value (case-insensitive)
          let matchingPerspective = null;
          if (normalizedPerspective) {
            for (const targetPerspective of targetPerspectives) {
              const normalizedTarget = targetPerspective.toString().trim().toLowerCase();
              if (normalizedPerspective === normalizedTarget) {
                matchingPerspective = targetPerspective;
                break;
              }
            }
          }
          
          // Debug logging for perspective matching
          if (index < 5) {
            console.log('🔍 Perspective matching debug:', {
              index,
              perspective,
              normalizedPerspective,
              ratingDescription: ratingDescription ? ratingDescription.substring(0, 50) + '...' : '',
              matchingPerspective,
              targetPerspectives
            });
          }
          
          if (matchingPerspective) {
            groupedData[uniqueKey][matchingPerspective] = ratingDescription || '';
            
            // Debug logging for successful assignment
            if (index < 5) {
              console.log('✅ Assigned RATING_DESCRIPTION to column:', {
                matchingPerspective,
                ratingDescription: ratingDescription ? ratingDescription.substring(0, 50) + '...' : '',
                uniqueKey
              });
            }
            
            // Categorize the rating description (use the original perspective value for categorization)
            const categorization = categorizeRatingDescription(ratingDescription, perspective);
            
            // Add to areas of improvement if applicable
            if (categorization.areasOfImprovement) {
              if (groupedData[uniqueKey].areasOfImprovement) {
                groupedData[uniqueKey].areasOfImprovement += `, ${categorization.areasOfImprovement}`;
              } else {
                groupedData[uniqueKey].areasOfImprovement = categorization.areasOfImprovement;
              }
            }
            
            // Add to strength if applicable
            if (categorization.strength) {
              if (groupedData[uniqueKey].strength) {
                groupedData[uniqueKey].strength += `, ${categorization.strength}`;
              } else {
                groupedData[uniqueKey].strength = categorization.strength;
              }
            }
            
            // Categorize into sub areas of improvement
            const subImprovementAreas = categorizeSubAreasOfImprovement(ratingDescription);
            if (subImprovementAreas.length > 0) {
              const existingSubImprovements = groupedData[uniqueKey].subAreasOfImprovement ? 
                groupedData[uniqueKey].subAreasOfImprovement.split(', ') : [];
              const combinedSubImprovements = [...new Set([...existingSubImprovements, ...subImprovementAreas])];
              groupedData[uniqueKey].subAreasOfImprovement = combinedSubImprovements.join(', ');
            }
            
            // Categorize into sub strengths
            const subStrengths = categorizeSubStrength(ratingDescription);
            if (subStrengths.length > 0) {
              const existingSubStrengths = groupedData[uniqueKey].subStrength ? 
                groupedData[uniqueKey].subStrength.split(', ') : [];
              const combinedSubStrengths = [...new Set([...existingSubStrengths, ...subStrengths])];
              groupedData[uniqueKey].subStrength = combinedSubStrengths.join(', ');
            }
          }
        });

        const filteredData = Object.values(groupedData);

        console.log('📊 Filtering Summary:', {
          totalDataRows: dataRows.length,
          rawFilteredDataCount: rawFilteredData.length,
          effectiveCycleStartDateFormatted,
          dateFilteringApplied: !!effectiveCycleStartDateFormatted,
          csatSentDateColumnFound: csatSentDateIndex !== -1,
          csatReceivedDateColumnFound: csatReceivedDateIndex !== -1,
          acsatCycle,
          yearQuarterFilteringApplied: !!(acsatCycle && yearQuarterIndex !== -1),
          yearQuarterColumnFound: yearQuarterIndex !== -1
        });
        console.log('Sample raw filtered data:', rawFilteredData[0]);
        console.log('Grouped data count:', Object.keys(groupedData).length);
        console.log('Sample grouped data:', Object.values(groupedData)[0]);
        console.log('Final filtered data count:', filteredData.length);
        console.log('Sample filtered data:', filteredData[0]);

        if (filteredData.length === 0) {
          console.log('❌ No data found after processing. Debug info:');
          console.log('  - Raw data rows:', dataRows.length);
          console.log('  - Raw filtered data:', rawFilteredData.length);
          console.log('  - Grouped data keys:', Object.keys(groupedData).length);
          console.log('  - Target perspectives:', targetPerspectives);
          console.log('  - Date filter:', effectiveCycleStartDateFormatted);
          console.log('  - Column indices:', {
            businessUnitIndex,
            customerIdIndex,
            customerNameIndex,
            respondentNameIndex,
            perspectiveIndex,
            ratingDescriptionIndex,
            csatSentDateIndex,
            csatReceivedDateIndex
          });
        }

        setProcessedData(filteredData);
        setFilteredData(filteredData);
        setLoading(false);

      } catch (err) {
        console.error('Error processing Excel data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    processExcelData();
  }, [excelData, effectiveCycleStartDateFormatted, acsatCycle]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filter and sort data based on search term and sort config
  useEffect(() => {
    let filtered = processedData;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = processedData.filter(row =>
          row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (sortConfig.key === 'id' || sortConfig.key === 'NPS' || 
            sortConfig.key === 'Meeting Delivery Commitments' ||
            sortConfig.key === 'Customer Engagement and Relationship' ||
            sortConfig.key === 'Partner adding value to Customer Business' ||
            sortConfig.key === 'Resource Competency' ||
            sortConfig.key === 'Team Commitment & Collaboration' ||
            sortConfig.key === 'Timely Resource Fulfillment' ||
            sortConfig.key === 'Quality of Delivery') {
          aValue = typeof aValue === 'number' ? aValue : parseFloat(aValue) || 0;
          bValue = typeof bValue === 'number' ? bValue : parseFloat(bValue) || 0;
        } else {
          // Handle string values
          aValue = (aValue || '').toString().toLowerCase();
          bValue = (bValue || '').toString().toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      // Default sorting: Sort by BU order when no manual sort is applied
      filtered = [...filtered].sort((a, b) => {
        const aBU = (a.businessUnit || '').toString().trim();
        const bBU = (b.businessUnit || '').toString().trim();
        const aIndex = buOrder.findIndex(bu => 
          bu.toLowerCase() === aBU.toLowerCase() || 
          aBU.toLowerCase().includes(bu.toLowerCase()) ||
          bu.toLowerCase().includes(aBU.toLowerCase())
        );
        const bIndex = buOrder.findIndex(bu => 
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
    }
    
    // Add id to each row
    const filteredWithId = filtered.map((row, index) => ({
          ...row,
          id: index + 1
        }));
    
    setFilteredData(filteredWithId);
  }, [searchTerm, processedData, sortConfig]);

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    try {
      // Create workbook with ExcelJS for better formatting
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Org Level Qualitative Analysis');

      // Define columns
      worksheet.columns = [
        { header: '#', key: 'id', width: 10 },
        { header: 'Business Unit', key: 'businessUnit', width: 20 },
        { header: 'Customer Name', key: 'customerName', width: 25 },
        { header: 'Respondent Name', key: 'respondentName', width: 25 },
        { header: 'NPS', key: 'NPS', width: 30 },
        { header: 'Meeting Delivery Commitments', key: 'Meeting Delivery Commitments', width: 30 },
        { header: 'Customer Engagement and Relationship', key: 'Customer Engagement and Relationship', width: 30 },
        { header: 'Partner adding value to Customer Business', key: 'Partner adding value to Customer Business', width: 30 },
        { header: 'Resource Competency', key: 'Resource Competency', width: 30 },
        { header: 'Team Commitment & Collaboration', key: 'Team Commitment & Collaboration', width: 30 },
        { header: 'Timely Resource Fulfillment', key: 'Timely Resource Fulfillment', width: 30 },
        { header: 'Quality of Delivery', key: 'Quality of Delivery', width: 30 },
        { header: 'Areas of Improvement', key: 'areasOfImprovement', width: 25 },
        { header: 'Strength', key: 'strength', width: 25 },
        { header: 'Sub Areas of Improvement', key: 'subAreasOfImprovement', width: 30 },
        { header: 'Sub Strength', key: 'subStrength', width: 30 }
      ];

      // Style the header row
      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1e3a8a' } // Dark blue
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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

      // Add data rows
      filteredData.forEach((row) => {
        const excelRow = worksheet.addRow(row);
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = Math.max(column.width || 10, 15);
      });

      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'org_level_qualitative_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });

    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Error exporting data');
    }
  };

  const exportBucketAnalysis = () => {
    try {
      const { accountWiseAnalysis, buWiseAnalysis } = generateBucketAnalysis();
      
      // Convert to detailed rows for account-wise analysis
      const accountWiseData = [];
      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
        const accounts = Array.from(data.accounts);
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each account-respondent combination
        accounts.forEach((account, index) => {
          accountWiseData.push({
            sno: accountWiseData.length + 1,
            areaOfImprovement: area,
            count: data.count,
            account: account,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });

      // Convert to detailed rows for BU-wise analysis
      const buWiseData = [];
      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
          return ORDER.indexOf(a)-ORDER.indexOf(b);
        });
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each BU-respondent combination
        businessUnits.forEach((businessUnit, index) => {
          buWiseData.push({
            sno: buWiseData.length + 1,
            areaOfImprovement: area,
            count: data.count,
            businessUnit: businessUnit,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });
      
      // Create workbook with ExcelJS for better formatting
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Create Account-wise Analysis sheet
      const accountWorksheet = workbook.addWorksheet('Account-wise Analysis');
      
      // Define columns for account-wise analysis
      accountWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Improvement', key: 'areaOfImprovement', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for account-wise analysis
      accountWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1e3a8a' } // Dark blue
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add account-wise data with merged cell logic
      accountWiseData.forEach((row, index) => {
        // Check if this is the first row for this area of improvement
        const isFirstRow = index === 0 || accountWiseData[index - 1].areaOfImprovement !== row.areaOfImprovement;
        
        const excelRow = accountWorksheet.addRow({
          sno: row.sno,
          areaOfImprovement: isFirstRow ? row.areaOfImprovement : '',
          count: isFirstRow ? row.count : '',
          account: row.account,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Create BU-wise Analysis sheet
      const buWorksheet = workbook.addWorksheet('BU-wise Analysis');
      
      // Define columns for BU-wise analysis
      buWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Improvement', key: 'areaOfImprovement', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for BU-wise analysis
      buWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1e3a8a' } // Dark blue
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add BU-wise data with merged cell logic
      buWiseData.forEach((row, index) => {
        // Check if this is the first row for this area of improvement
        const isFirstRow = index === 0 || buWiseData[index - 1].areaOfImprovement !== row.areaOfImprovement;
        
        const excelRow = buWorksheet.addRow({
          sno: row.sno,
          areaOfImprovement: isFirstRow ? row.areaOfImprovement : '',
          count: isFirstRow ? row.count : '',
          businessUnit: row.businessUnit,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'areas_of_improvement_bucket_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting bucket analysis:', error);
      alert('Error exporting bucket analysis data');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Function to categorize areas of improvement into buckets
  const categorizeAreasOfImprovement = (areasOfImprovement) => {
    if (!areasOfImprovement || areasOfImprovement.trim() === '') {
      return 'No Areas Identified';
    }

    const areas = areasOfImprovement.toLowerCase();
    
    // Define bucket categories based on the actual perspective names that appear in Areas of Improvement
    const buckets = {
      'NPS': ['nps'],
      'Meeting Delivery Commitments': ['meeting delivery commitments', 'delivery commitments', 'meeting delivery'],
      'Customer Engagement and Relationship': ['customer engagement and relationship', 'customer engagement', 'engagement and relationship'],
      'Partner adding value to Customer Business': ['partner adding value to customer business', 'partner adding value', 'adding value to customer business'],
      'Resource Competency': ['resource competency', 'resource competence', 'competency'],
      'Team Commitment & Collaboration': ['team commitment & collaboration', 'team commitment', 'commitment & collaboration'],
      'Timely Resource Fulfillment': ['timely resource fulfillment', 'resource fulfillment', 'timely manner'],
      'Quality of Delivery': ['quality of delivery', 'quality delivery', 'delivery quality']
    };

    // Find matching bucket - check for exact matches first
    for (const [bucketName, keywords] of Object.entries(buckets)) {
      if (keywords.some(keyword => areas.includes(keyword))) {
        return bucketName;
      }
    }

    // If no exact match, try partial matches
    if (areas.includes('nps')) return 'NPS';
    if (areas.includes('delivery') || areas.includes('meeting')) return 'Meeting Delivery Commitments';
    if (areas.includes('engagement') || areas.includes('relationship')) return 'Customer Engagement and Relationship';
    if (areas.includes('partner') || areas.includes('value')) return 'Partner adding value to Customer Business';
    if (areas.includes('resource') || areas.includes('competency')) return 'Resource Competency';
    if (areas.includes('team') || areas.includes('commitment') || areas.includes('collaboration')) return 'Team Commitment & Collaboration';
    if (areas.includes('timely') || areas.includes('fulfillment')) return 'Timely Resource Fulfillment';
    if (areas.includes('quality of delivery') || areas.includes('quality delivery')) return 'Quality of Delivery';

    // Default bucket for unmatched areas
    return 'Other Areas';
  };

  // Function to generate bucket analysis data
  const generateBucketAnalysis = () => {
    console.log('generateBucketAnalysis function called');
    const accountWiseAnalysis = {};
    const buWiseAnalysis = {};

    // Safety check for processedData
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      console.log('generateBucketAnalysis: processedData is empty or invalid:', processedData);
      return { accountWiseAnalysis, buWiseAnalysis };
    }

    console.log('generateBucketAnalysis: processedData length:', processedData.length);
    console.log('generateBucketAnalysis: first row sample:', processedData[0]);

    try {
    processedData.forEach(row => {
      const account = row.customerName;
      const businessUnit = row.businessUnit;
      const respondentName = row.respondentName;
      const areasOfImprovement = row.areasOfImprovement;

      // Handle multiple areas of improvement (comma-separated)
      if (areasOfImprovement && areasOfImprovement.trim() !== '') {
        // Split by comma and process each area
        const areas = areasOfImprovement.split(',').map(area => area.trim()).filter(area => area !== '');
        
        areas.forEach(area => {
          const bucket = categorizeAreasOfImprovement(area);

          // Account-wise analysis
          if (!accountWiseAnalysis[bucket]) {
            accountWiseAnalysis[bucket] = {
              count: 0,
              accounts: new Set(),
              respondentNames: new Set()
            };
          }
          accountWiseAnalysis[bucket].count++;
          accountWiseAnalysis[bucket].accounts.add(account);
          accountWiseAnalysis[bucket].respondentNames.add(respondentName);

          // BU-wise analysis
          if (!buWiseAnalysis[bucket]) {
            buWiseAnalysis[bucket] = {
              count: 0,
              businessUnits: new Set(),
              respondentNames: new Set()
            };
          }
          buWiseAnalysis[bucket].count++;
          buWiseAnalysis[bucket].businessUnits.add(businessUnit);
          buWiseAnalysis[bucket].respondentNames.add(respondentName);
        });
      } else {
        // Handle cases with no areas of improvement
        const bucket = 'No Areas Identified';
        
        // Account-wise analysis
        if (!accountWiseAnalysis[bucket]) {
          accountWiseAnalysis[bucket] = {
            count: 0,
            accounts: new Set(),
            respondentNames: new Set()
          };
        }
        accountWiseAnalysis[bucket].count++;
        accountWiseAnalysis[bucket].accounts.add(account);
        accountWiseAnalysis[bucket].respondentNames.add(respondentName);

        // BU-wise analysis
        if (!buWiseAnalysis[bucket]) {
          buWiseAnalysis[bucket] = {
            count: 0,
            businessUnits: new Set(),
            respondentNames: new Set()
          };
        }
        buWiseAnalysis[bucket].count++;
        buWiseAnalysis[bucket].businessUnits.add(businessUnit);
        buWiseAnalysis[bucket].respondentNames.add(respondentName);
      }
    });

    return { accountWiseAnalysis, buWiseAnalysis };
    } catch (error) {
      console.error('Error in generateBucketAnalysis:', error);
      return { accountWiseAnalysis: {}, buWiseAnalysis: {} };
    }
  };

  // Function to categorize strengths into buckets
  const categorizeStrengths = (strength) => {
    if (!strength || strength.trim() === '') {
      return 'No Strengths Identified';
    }

    const strengths = strength.toLowerCase();
    
    // Define bucket categories based on the actual perspective names that appear in Strengths
    const buckets = {
      'NPS': ['nps'],
      'Meeting Delivery Commitments': ['meeting delivery commitments', 'delivery commitments', 'meeting delivery'],
      'Customer Engagement and Relationship': ['customer engagement and relationship', 'customer engagement', 'engagement and relationship'],
      'Partner adding value to Customer Business': ['partner adding value to customer business', 'partner adding value', 'adding value to customer business'],
      'Resource Competency': ['resource competency', 'resource competence', 'competency'],
      'Team Commitment & Collaboration': ['team commitment & collaboration', 'team commitment', 'commitment & collaboration'],
      'Timely Resource Fulfillment': ['timely resource fulfillment', 'resource fulfillment', 'timely manner'],
      'Quality of Delivery': ['quality of delivery', 'quality delivery', 'delivery quality']
    };

    // Find matching bucket - check for exact matches first
    for (const [bucketName, keywords] of Object.entries(buckets)) {
      if (keywords.some(keyword => strengths.includes(keyword))) {
        return bucketName;
      }
    }

    // If no exact match, try partial matches
    for (const [bucketName, keywords] of Object.entries(buckets)) {
      if (keywords.some(keyword => strengths.includes(keyword.split(' ')[0]))) {
        return bucketName;
      }
    }

    return 'Other Strengths';
  };

  // Function to generate strength bucket analysis
  const generateStrengthBucketAnalysis = () => {
    const accountWiseAnalysis = {};
    const buWiseAnalysis = {};

    // Safety check for processedData
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      return { accountWiseAnalysis, buWiseAnalysis };
    }

    processedData.forEach(row => {
      const account = row.customerName;
      const businessUnit = row.businessUnit;
      const respondentName = row.respondentName;
      const strength = row.strength;

      // Handle multiple strengths (comma-separated)
      if (strength && strength.trim() !== '') {
        // Split by comma and process each strength
        const strengths = strength.split(',').map(s => s.trim()).filter(s => s !== '');
        
        strengths.forEach(s => {
          const bucket = categorizeStrengths(s);

          // Account-wise analysis
          if (!accountWiseAnalysis[bucket]) {
            accountWiseAnalysis[bucket] = {
              count: 0,
              accounts: new Set(),
              respondentNames: new Set()
            };
          }
          accountWiseAnalysis[bucket].count++;
          accountWiseAnalysis[bucket].accounts.add(account);
          accountWiseAnalysis[bucket].respondentNames.add(respondentName);

          // BU-wise analysis
          if (!buWiseAnalysis[bucket]) {
            buWiseAnalysis[bucket] = {
              count: 0,
              businessUnits: new Set(),
              respondentNames: new Set()
            };
          }
          buWiseAnalysis[bucket].count++;
          buWiseAnalysis[bucket].businessUnits.add(businessUnit);
          buWiseAnalysis[bucket].respondentNames.add(respondentName);
        });
      } else {
        // Handle cases with no strengths
        const bucket = 'No Strengths Identified';
        
        // Account-wise analysis
        if (!accountWiseAnalysis[bucket]) {
          accountWiseAnalysis[bucket] = {
            count: 0,
            accounts: new Set(),
            respondentNames: new Set()
          };
        }
        accountWiseAnalysis[bucket].count++;
        accountWiseAnalysis[bucket].accounts.add(account);
        accountWiseAnalysis[bucket].respondentNames.add(respondentName);

        // BU-wise analysis
        if (!buWiseAnalysis[bucket]) {
          buWiseAnalysis[bucket] = {
            count: 0,
            businessUnits: new Set(),
            respondentNames: new Set()
          };
        }
        buWiseAnalysis[bucket].count++;
        buWiseAnalysis[bucket].businessUnits.add(businessUnit);
        buWiseAnalysis[bucket].respondentNames.add(respondentName);
      }
    });

    return { accountWiseAnalysis, buWiseAnalysis };
  };

  // Function to export strength bucket analysis
  const exportStrengthBucketAnalysis = () => {
    try {
      const { accountWiseAnalysis, buWiseAnalysis } = generateStrengthBucketAnalysis();
      
      // Convert to detailed rows for account-wise analysis
      const accountWiseData = [];
      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
        const accounts = Array.from(data.accounts);
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each account-respondent combination
        accounts.forEach((account, index) => {
          accountWiseData.push({
            sno: accountWiseData.length + 1,
            areaOfStrength: area,
            count: data.count,
            account: account,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });

      // Convert to detailed rows for BU-wise analysis
      const buWiseData = [];
      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
          return ORDER.indexOf(a)-ORDER.indexOf(b);
        });
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each BU-respondent combination
        businessUnits.forEach((businessUnit, index) => {
          buWiseData.push({
            sno: buWiseData.length + 1,
            areaOfStrength: area,
            count: data.count,
            businessUnit: businessUnit,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });
      
      // Create workbook with ExcelJS for better formatting
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Create Account-wise Analysis sheet
      const accountWorksheet = workbook.addWorksheet('Account-wise Strength Analysis');
      
      // Define columns for account-wise analysis
      accountWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Strength', key: 'areaOfStrength', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for account-wise analysis
      accountWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' } // Green
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add account-wise data with merged cell logic
      accountWiseData.forEach((row, index) => {
        // Check if this is the first row for this area of strength
        const isFirstRow = index === 0 || accountWiseData[index - 1].areaOfStrength !== row.areaOfStrength;
        
        const excelRow = accountWorksheet.addRow({
          sno: row.sno,
          areaOfStrength: isFirstRow ? row.areaOfStrength : '',
          count: isFirstRow ? row.count : '',
          account: row.account,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Create BU-wise Analysis sheet
      const buWorksheet = workbook.addWorksheet('BU-wise Strength Analysis');
      
      // Define columns for BU-wise analysis
      buWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Strength', key: 'areaOfStrength', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for BU-wise analysis
      buWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' } // Green
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add BU-wise data with merged cell logic
      buWiseData.forEach((row, index) => {
        // Check if this is the first row for this area of strength
        const isFirstRow = index === 0 || buWiseData[index - 1].areaOfStrength !== row.areaOfStrength;
        
        const excelRow = buWorksheet.addRow({
          sno: row.sno,
          areaOfStrength: isFirstRow ? row.areaOfStrength : '',
          count: isFirstRow ? row.count : '',
          businessUnit: row.businessUnit,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'strength_bucket_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting strength bucket analysis:', error);
      alert('Error exporting strength bucket analysis data');
    }
  };

  // Function to generate sub improvement bucket analysis
  const generateSubImprovementBucketAnalysis = () => {
    const accountWiseAnalysis = {};
    const buWiseAnalysis = {};

    // Safety check for processedData
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      return { accountWiseAnalysis, buWiseAnalysis };
    }

    processedData.forEach(row => {
      const account = row.customerName;
      const businessUnit = row.businessUnit;
      const respondentName = row.respondentName;
      const subAreasOfImprovement = row.subAreasOfImprovement;

      // Handle multiple sub areas of improvement (comma-separated)
      if (subAreasOfImprovement && subAreasOfImprovement.trim() !== '') {
        // Split by comma and process each sub area
        const subAreas = subAreasOfImprovement.split(',').map(area => area.trim()).filter(area => area !== '');
        
        subAreas.forEach(area => {
          // Account-wise analysis
          if (!accountWiseAnalysis[area]) {
            accountWiseAnalysis[area] = {
              count: 0,
              accounts: new Set(),
              respondentNames: new Set()
            };
          }
          accountWiseAnalysis[area].count++;
          accountWiseAnalysis[area].accounts.add(account);
          accountWiseAnalysis[area].respondentNames.add(respondentName);

          // BU-wise analysis
          if (!buWiseAnalysis[area]) {
            buWiseAnalysis[area] = {
              count: 0,
              businessUnits: new Set(),
              respondentNames: new Set()
            };
          }
          buWiseAnalysis[area].count++;
          buWiseAnalysis[area].businessUnits.add(businessUnit);
          buWiseAnalysis[area].respondentNames.add(respondentName);
        });
      } else {
        // Handle cases with no sub areas of improvement
        const bucket = 'No Sub Areas Identified';
        
        // Account-wise analysis
        if (!accountWiseAnalysis[bucket]) {
          accountWiseAnalysis[bucket] = {
            count: 0,
            accounts: new Set(),
            respondentNames: new Set()
          };
        }
        accountWiseAnalysis[bucket].count++;
        accountWiseAnalysis[bucket].accounts.add(account);
        accountWiseAnalysis[bucket].respondentNames.add(respondentName);

        // BU-wise analysis
        if (!buWiseAnalysis[bucket]) {
          buWiseAnalysis[bucket] = {
            count: 0,
            businessUnits: new Set(),
            respondentNames: new Set()
          };
        }
        buWiseAnalysis[bucket].count++;
        buWiseAnalysis[bucket].businessUnits.add(businessUnit);
        buWiseAnalysis[bucket].respondentNames.add(respondentName);
      }
    });

    return { accountWiseAnalysis, buWiseAnalysis };
  };

  // Function to export sub improvement bucket analysis
  const exportSubImprovementBucketAnalysis = () => {
    try {
      const { accountWiseAnalysis, buWiseAnalysis } = generateSubImprovementBucketAnalysis();
      
      // Convert to detailed rows for account-wise analysis
      const accountWiseData = [];
      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
        const accounts = Array.from(data.accounts);
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each account-respondent combination
        accounts.forEach((account, index) => {
          accountWiseData.push({
            sno: accountWiseData.length + 1,
            subAreaOfImprovement: area,
            count: data.count,
            account: account,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });

      // Convert to detailed rows for BU-wise analysis
      const buWiseData = [];
      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
          return ORDER.indexOf(a)-ORDER.indexOf(b);
        });
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each BU-respondent combination
        businessUnits.forEach((businessUnit, index) => {
          buWiseData.push({
            sno: buWiseData.length + 1,
            subAreaOfImprovement: area,
            count: data.count,
            businessUnit: businessUnit,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });
      
      // Create workbook with ExcelJS for better formatting
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Create Account-wise Analysis sheet
      const accountWorksheet = workbook.addWorksheet('Account-wise Sub Improvement Analysis');
      
      // Define columns for account-wise analysis
      accountWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Area of Improvement', key: 'subAreaOfImprovement', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for account-wise analysis
      accountWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDC2626' } // Red
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add account-wise data with merged cell logic
      accountWiseData.forEach((row, index) => {
        // Check if this is the first row for this sub area of improvement
        const isFirstRow = index === 0 || accountWiseData[index - 1].subAreaOfImprovement !== row.subAreaOfImprovement;
        
        const excelRow = accountWorksheet.addRow({
          sno: row.sno,
          subAreaOfImprovement: isFirstRow ? row.subAreaOfImprovement : '',
          count: isFirstRow ? row.count : '',
          account: row.account,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Create BU-wise Analysis sheet
      const buWorksheet = workbook.addWorksheet('BU-wise Sub Improvement Analysis');
      
      // Define columns for BU-wise analysis
      buWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Area of Improvement', key: 'subAreaOfImprovement', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for BU-wise analysis
      buWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDC2626' } // Red
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add BU-wise data with merged cell logic
      buWiseData.forEach((row, index) => {
        // Check if this is the first row for this sub area of improvement
        const isFirstRow = index === 0 || buWiseData[index - 1].subAreaOfImprovement !== row.subAreaOfImprovement;
        
        const excelRow = buWorksheet.addRow({
          sno: row.sno,
          subAreaOfImprovement: isFirstRow ? row.subAreaOfImprovement : '',
          count: isFirstRow ? row.count : '',
          businessUnit: row.businessUnit,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sub_improvement_bucket_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting sub improvement bucket analysis:', error);
      alert('Error exporting sub improvement bucket analysis data');
    }
  };

  // Function to generate sub strength bucket analysis
  const generateSubStrengthBucketAnalysis = () => {
    const accountWiseAnalysis = {};
    const buWiseAnalysis = {};

    // Safety check for processedData
    if (!processedData || !Array.isArray(processedData) || processedData.length === 0) {
      return { accountWiseAnalysis, buWiseAnalysis };
    }

    processedData.forEach(row => {
      const account = row.customerName;
      const businessUnit = row.businessUnit;
      const respondentName = row.respondentName;
      const subStrength = row.subStrength;

      // Handle multiple sub strengths (comma-separated)
      if (subStrength && subStrength.trim() !== '') {
        // Split by comma and process each sub strength
        const subStrengths = subStrength.split(',').map(s => s.trim()).filter(s => s !== '');
        
        subStrengths.forEach(s => {
          // Account-wise analysis
          if (!accountWiseAnalysis[s]) {
            accountWiseAnalysis[s] = {
              count: 0,
              accounts: new Set(),
              respondentNames: new Set()
            };
          }
          accountWiseAnalysis[s].count++;
          accountWiseAnalysis[s].accounts.add(account);
          accountWiseAnalysis[s].respondentNames.add(respondentName);

          // BU-wise analysis
          if (!buWiseAnalysis[s]) {
            buWiseAnalysis[s] = {
              count: 0,
              businessUnits: new Set(),
              respondentNames: new Set()
            };
          }
          buWiseAnalysis[s].count++;
          buWiseAnalysis[s].businessUnits.add(businessUnit);
          buWiseAnalysis[s].respondentNames.add(respondentName);
        });
      } else {
        // Handle cases with no sub strengths
        const bucket = 'No Sub Strengths Identified';
        
        // Account-wise analysis
        if (!accountWiseAnalysis[bucket]) {
          accountWiseAnalysis[bucket] = {
            count: 0,
            accounts: new Set(),
            respondentNames: new Set()
          };
        }
        accountWiseAnalysis[bucket].count++;
        accountWiseAnalysis[bucket].accounts.add(account);
        accountWiseAnalysis[bucket].respondentNames.add(respondentName);

        // BU-wise analysis
        if (!buWiseAnalysis[bucket]) {
          buWiseAnalysis[bucket] = {
            count: 0,
            businessUnits: new Set(),
            respondentNames: new Set()
          };
        }
        buWiseAnalysis[bucket].count++;
        buWiseAnalysis[bucket].businessUnits.add(businessUnit);
        buWiseAnalysis[bucket].respondentNames.add(respondentName);
      }
    });

    return { accountWiseAnalysis, buWiseAnalysis };
  };

  // Function to export sub strength bucket analysis
  const exportSubStrengthBucketAnalysis = () => {
    try {
      const { accountWiseAnalysis, buWiseAnalysis } = generateSubStrengthBucketAnalysis();
      
      // Convert to detailed rows for account-wise analysis
      const accountWiseData = [];
      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
        const accounts = Array.from(data.accounts);
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each account-respondent combination
        accounts.forEach((account, index) => {
          accountWiseData.push({
            sno: accountWiseData.length + 1,
            subStrength: area,
            count: data.count,
            account: account,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });

      // Convert to detailed rows for BU-wise analysis
      const buWiseData = [];
      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
          return ORDER.indexOf(a)-ORDER.indexOf(b);
        });
        const respondentNames = Array.from(data.respondentNames);
        
        // Create separate rows for each BU-respondent combination
        businessUnits.forEach((businessUnit, index) => {
          buWiseData.push({
            sno: buWiseData.length + 1,
            subStrength: area,
            count: data.count,
            businessUnit: businessUnit,
            respondentName: respondentNames[index] || respondentNames[0] || ''
          });
        });
      });
      
      // Create workbook with ExcelJS for better formatting
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Create Account-wise Analysis sheet
      const accountWorksheet = workbook.addWorksheet('Account-wise Sub Strength Analysis');
      
      // Define columns for account-wise analysis
      accountWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Strength', key: 'subStrength', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for account-wise analysis
      accountWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' } // Green
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add account-wise data with merged cell logic
      accountWiseData.forEach((row, index) => {
        // Check if this is the first row for this sub strength
        const isFirstRow = index === 0 || accountWiseData[index - 1].subStrength !== row.subStrength;
        
        const excelRow = accountWorksheet.addRow({
          sno: row.sno,
          subStrength: isFirstRow ? row.subStrength : '',
          count: isFirstRow ? row.count : '',
          account: row.account,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Create BU-wise Analysis sheet
      const buWorksheet = workbook.addWorksheet('BU-wise Sub Strength Analysis');
      
      // Define columns for BU-wise analysis
      buWorksheet.columns = [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Strength', key: 'subStrength', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ];
      
      // Style the header row for BU-wise analysis
      buWorksheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF059669' } // Green
        };
        cell.font = {
          color: { argb: 'FFFFFFFF' }, // White text
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
      
      // Add BU-wise data with merged cell logic
      buWiseData.forEach((row, index) => {
        // Check if this is the first row for this sub strength
        const isFirstRow = index === 0 || buWiseData[index - 1].subStrength !== row.subStrength;
        
        const excelRow = buWorksheet.addRow({
          sno: row.sno,
          subStrength: isFirstRow ? row.subStrength : '',
          count: isFirstRow ? row.count : '',
          businessUnit: row.businessUnit,
          respondentName: row.respondentName
        });
        
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric (typically none in qualitative analysis, but check if needed)
          // For qualitative analysis, most columns are text, but we'll check for numeric values
          const cellValue = cell.value;
          const isNumeric = typeof cellValue === 'number' || (!isNaN(parseFloat(cellValue)) && isFinite(cellValue));
          
          cell.alignment = {
            horizontal: isNumeric ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumeric
          };
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sub_strength_bucket_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting sub strength bucket analysis:', error);
      alert('Error exporting sub strength bucket analysis data');
    }
  };

  // Function to export comprehensive Account-wise Analysis
  const exportComprehensiveAccountWiseAnalysis = () => {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Get all bucket analysis data
      const { accountWiseAnalysis: improvementAnalysis } = generateBucketAnalysis();
      const { accountWiseAnalysis: strengthAnalysis } = generateStrengthBucketAnalysis();
      const { accountWiseAnalysis: subImprovementAnalysis } = generateSubImprovementBucketAnalysis();
      const { accountWiseAnalysis: subStrengthAnalysis } = generateSubStrengthBucketAnalysis();
      
      // Helper function to create worksheet
      const createWorksheet = (name, analysis, headers) => {
        const worksheet = workbook.addWorksheet(name);
        
        // Define columns
        worksheet.columns = headers;
        
        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1e3a8a' } // Dark blue
          };
          cell.font = {
            color: { argb: 'FFFFFFFF' }, // White text
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
        
        // Convert analysis to detailed rows
        const data = [];
        Object.entries(analysis).forEach(([area, data]) => {
          const accounts = Array.from(data.accounts);
          const respondentNames = Array.from(data.respondentNames);
          
          accounts.forEach((account, index) => {
            data.push({
              sno: data.length + 1,
              area: area,
              count: data.count,
              account: account,
              respondentName: respondentNames[index] || respondentNames[0] || ''
            });
          });
        });
        
        // Add data with merged cell logic
        data.forEach((row, index) => {
          const isFirstRow = index === 0 || data[index - 1].area !== row.area;
          
          const excelRow = worksheet.addRow({
            sno: row.sno,
            area: isFirstRow ? row.area : '',
            count: isFirstRow ? row.count : '',
            account: row.account,
            respondentName: row.respondentName
          });
          
          excelRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      };
      
      // Create worksheets for each analysis type
      createWorksheet('Areas of Improvement', improvementAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Improvement', key: 'area', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Strength Analysis', strengthAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Strength', key: 'area', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Sub Areas of Improvement', subImprovementAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Area of Improvement', key: 'area', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Sub Strength Analysis', subStrengthAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Strength', key: 'area', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Account', key: 'account', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comprehensive_account_wise_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting comprehensive account-wise analysis:', error);
      alert('Error exporting comprehensive account-wise analysis data');
    }
  };

  // Function to export comprehensive Business Unit-wise Analysis
  const exportComprehensiveBUWiseAnalysis = () => {
    try {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      
      // Get all bucket analysis data
      const { buWiseAnalysis: improvementAnalysis } = generateBucketAnalysis();
      const { buWiseAnalysis: strengthAnalysis } = generateStrengthBucketAnalysis();
      const { buWiseAnalysis: subImprovementAnalysis } = generateSubImprovementBucketAnalysis();
      const { buWiseAnalysis: subStrengthAnalysis } = generateSubStrengthBucketAnalysis();
      
      // Helper function to create worksheet
      const createWorksheet = (name, analysis, headers) => {
        const worksheet = workbook.addWorksheet(name);
        
        // Define columns
        worksheet.columns = headers;
        
        // Style the header row
        worksheet.getRow(1).eachCell((cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1e3a8a' } // Dark blue
          };
          cell.font = {
            color: { argb: 'FFFFFFFF' }, // White text
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
        
        // Convert analysis to detailed rows
        const data = [];
        Object.entries(analysis).forEach(([area, data]) => {
          const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
            const ORDER=['Healthcare','CIT','Tech','India & GCC'];
            return ORDER.indexOf(a)-ORDER.indexOf(b);
          });
          const respondentNames = Array.from(data.respondentNames);
          
          businessUnits.forEach((businessUnit, index) => {
            data.push({
              sno: data.length + 1,
              area: area,
              count: data.count,
              businessUnit: businessUnit,
              respondentName: respondentNames[index] || respondentNames[0] || ''
            });
          });
        });
        
        // Add data with merged cell logic
        data.forEach((row, index) => {
          const isFirstRow = index === 0 || data[index - 1].area !== row.area;
          
          const excelRow = worksheet.addRow({
            sno: row.sno,
            area: isFirstRow ? row.area : '',
            count: isFirstRow ? row.count : '',
            businessUnit: row.businessUnit,
            respondentName: row.respondentName
          });
          
          excelRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
          });
        });
      };
      
      // Create worksheets for each analysis type
      createWorksheet('Areas of Improvement', improvementAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Improvement', key: 'area', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Strength Analysis', strengthAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Area of Strength', key: 'area', width: 30 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Sub Areas of Improvement', subImprovementAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Area of Improvement', key: 'area', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      createWorksheet('Sub Strength Analysis', subStrengthAnalysis, [
        { header: 'Sr. No.', key: 'sno', width: 10 },
        { header: 'Sub Strength', key: 'area', width: 35 },
        { header: 'Count', key: 'count', width: 15 },
        { header: 'Business Unit', key: 'businessUnit', width: 30 },
        { header: 'Respondent Name', key: 'respondentName', width: 30 }
      ]);
      
      // Save the file
      workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'comprehensive_bu_wise_analysis.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
      });
      
    } catch (error) {
      console.error('Error exporting comprehensive BU-wise analysis:', error);
      alert('Error exporting comprehensive BU-wise analysis data');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📝 Org level/BU wise Qualitative analysis with bucket analysis</Title>
          <BackButton onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </BackButton>
        </Header>
        <StatusContainer>
          <div>Loading data...</div>
        </StatusContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📝 Org level/BU wise Qualitative analysis with bucket analysis</Title>
          <BackButton onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </BackButton>
        </Header>
        <ErrorMessage>
          Error: {error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <BackButton onClick={onBack}><ArrowLeft size={22}/>Back</BackButton>
        <Title>📝 Org level/BU wise Qualitative analysis with bucket analysis</Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButton onClick={downloadQualitativeAnalysisExcel}>
            <Download size={20} />
            Download Excel
          </ExportButton>
        </div>
      </Header>

      {/* Remarks Upload UI */}
      <RemarksUploadContainer>
        <label htmlFor="remarks-upload-input" style={{ fontWeight: 500 }}>
          Remarks for different perspectives:
        </label>
        <FileInput
          id="remarks-upload-input"
          ref={remarksInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleRemarksUpload}
          style={{ width: 'auto' }}
        />
        {remarksFileName && (
          <FileNameDisplay>{remarksFileName}</FileNameDisplay>
        )}
        {remarksFileName && (
          <ClearButton type="button" onClick={clearRemarksUpload}>
            Clear
          </ClearButton>
        )}
        {/* Show Sentiment Analysis and Bucket Analysis Buttons, only if file is uploaded */}
        {remarksFileName && (
          <>
            <SentimentAnalysisButton
              type="button"
              onClick={() => {
                console.log('🔵 Download Sentiment Analysis clicked');
                downloadRemarksSentimentAnalysisExcel();
              }}
            >
              <Download size={16} />
              Download Sentiment Analysis
            </SentimentAnalysisButton>
            <RemarksBucketButton
              type="button"
              onClick={() => setShowRemarksBucketAnalysis((prev) => !prev)}
            >
              {showRemarksBucketAnalysis ? 'Hide Bucket Analysis' : '📊 Show Bucket Analysis'}
            </RemarksBucketButton>
          </>
        )}
      </RemarksUploadContainer>

      {/* Remarks-based Bucket Analysis Section -- placeholder for now */}
      {showRemarksBucketAnalysis && (
        <div style={{ background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 11, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: 8 }}>
          <button
              type="button"
              onClick={downloadRemarksSentimentAnalysisExcel}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} />
              Download Sentiment Analysis
          </button>
          <button
              type="button"
              onClick={downloadRemarksAnalysisExcel}
              style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={16} />
              Download Remarks Analysis
          </button>
        </div>
          <div style={{ marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Remarks - Sub Areas of Improvement Bucket Analysis</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setRemarksSubImpView('account')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: remarksSubImpView === 'account' ? '#1d4ed8' : '#fff', color: remarksSubImpView === 'account' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              Account-wise
            </button>
            <button
              type="button"
              onClick={() => setRemarksSubImpView('bu')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: remarksSubImpView === 'bu' ? '#1d4ed8' : '#fff', color: remarksSubImpView === 'bu' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              BU-wise
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Category</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Count</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>{remarksSubImpView === 'bu' ? 'Business Units' : 'Accounts'}</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Respondent Names</th>
                </tr>
              </thead>
              <tbody>
                {(remarksSubImpView === 'bu' ? remarksSubImpBUData : remarksSubImpAccountData).map((row, idx) => (
                  <tr key={`${row.category}-${idx}`}>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.category}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#b91c1c', fontWeight: 700 }}>{row.count}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.groups && row.groups.length ? row.groups.join(', ') : '-'}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.respondentNames && row.respondentNames.length ? row.respondentNames.join(', ') : '-'}</td>
                  </tr>
                ))}
                {((remarksSubImpView === 'bu' ? remarksSubImpBUData : remarksSubImpAccountData).length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>No data found in remarks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: 24, marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Remarks - Top Expectations - Can do Better Bucket Analysis</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setTopExpectationsCanDoBetterView('account')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: topExpectationsCanDoBetterView === 'account' ? '#1d4ed8' : '#fff', color: topExpectationsCanDoBetterView === 'account' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              Account-wise
            </button>
            <button
              type="button"
              onClick={() => setTopExpectationsCanDoBetterView('bu')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: topExpectationsCanDoBetterView === 'bu' ? '#1d4ed8' : '#fff', color: topExpectationsCanDoBetterView === 'bu' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              BU-wise
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Category</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Count</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>{topExpectationsCanDoBetterView === 'bu' ? 'Business Units' : 'Accounts'}</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Respondent Names</th>
                </tr>
              </thead>
              <tbody>
                {topExpectationsCanDoBetterTableData && topExpectationsCanDoBetterTableData.length > 0 ? (
                  topExpectationsCanDoBetterTableData.map((row, idx) => (
                    <tr key={`can-do-better-${row.category}-${idx}`}>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.category}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#b91c1c', fontWeight: 700 }}>{row.count}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.groups && row.groups.length ? row.groups.join(', ') : '-'}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.respondentNames && row.respondentNames.length ? row.respondentNames.join(', ') : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>No data found in remarks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: 24, marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Remarks - Top Expectations - Doing Well Bucket Analysis</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setTopExpectationsDoingWellView('account')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: topExpectationsDoingWellView === 'account' ? '#1d4ed8' : '#fff', color: topExpectationsDoingWellView === 'account' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              Account-wise
            </button>
            <button
              type="button"
              onClick={() => setTopExpectationsDoingWellView('bu')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: topExpectationsDoingWellView === 'bu' ? '#1d4ed8' : '#fff', color: topExpectationsDoingWellView === 'bu' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              BU-wise
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Category</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Count</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>{topExpectationsDoingWellView === 'bu' ? 'Business Units' : 'Accounts'}</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Respondent Names</th>
                </tr>
              </thead>
              <tbody>
                {topExpectationsDoingWellTableData && topExpectationsDoingWellTableData.length > 0 ? (
                  topExpectationsDoingWellTableData.map((row, idx) => (
                    <tr key={`doing-well-${row.category}-${idx}`}>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.category}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#047857', fontWeight: 700 }}>{row.count}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.groups && row.groups.length ? row.groups.join(', ') : '-'}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.respondentNames && row.respondentNames.length ? row.respondentNames.join(', ') : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>No data found in remarks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: 32, marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            Account Wise Top Expectations Analysis Dashboard
          </div>
          <p style={{ marginTop: 0, marginBottom: 16, color: '#475569', fontSize: '0.9rem' }}>
            Derived from both <strong>Remarks - Top Expectations - Doing Well Bucket Analysis</strong> and <strong>Remarks - Top Expectations - Can do Better Bucket Analysis</strong>.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Account Name</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Doing Well</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Can do Better</th>
                </tr>
              </thead>
              <tbody>
                {accountWiseTopExpectationsData && accountWiseTopExpectationsData.length > 0 ? (
                  accountWiseTopExpectationsData.map((row) => (
                    <tr key={`account-top-exp-${row.account}`}>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', textAlign: 'center', fontWeight: 600 }}>{row.srNo}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.account}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#047857' }}>{row.doingWell}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#b91c1c' }}>{row.canDoBetter}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>
                      No remarks available to display account wise top expectations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>Remarks - Sub Strength Bucket Analysis</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setRemarksSubStrView('account')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: remarksSubStrView === 'account' ? '#1d4ed8' : '#fff', color: remarksSubStrView === 'account' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              Account-wise
            </button>
            <button
              type="button"
              onClick={() => setRemarksSubStrView('bu')}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #93c5fd', background: remarksSubStrView === 'bu' ? '#1d4ed8' : '#fff', color: remarksSubStrView === 'bu' ? '#fff' : '#0f172a', cursor: 'pointer' }}
            >
              BU-wise
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Category</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Count</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>{remarksSubStrView === 'bu' ? 'Business Units' : 'Accounts'}</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Respondent Names</th>
                </tr>
              </thead>
              <tbody>
                {(remarksSubStrView === 'bu' ? remarksSubStrBUData : remarksSubStrAccountData).map((row, idx) => (
                  <tr key={`${row.category}-${idx}`}>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{idx + 1}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.category}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#047857', fontWeight: 700 }}>{row.count}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.groups && row.groups.length ? row.groups.join(', ') : '-'}</td>
                    <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{row.respondentNames && row.respondentNames.length ? row.respondentNames.join(', ') : '-'}</td>
                  </tr>
                ))}
                {((remarksSubStrView === 'bu' ? remarksSubStrBUData : remarksSubStrAccountData).length === 0) && (
                  <tr>
                    <td colSpan={5} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>No data found in remarks</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Combined Dashboard: Category-wise Positive and Negative Comments */}
          <div style={{ marginTop: 32, marginBottom: 10, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
            Combined Category Analysis (Account-wise)
          </div>
          <div style={{ marginBottom: 16, padding: '10px 12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', color: '#0f172a', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong>Legend:</strong>
            <div>• Delta &gt; 50%: Strength</div>
            <div>• 20% ≤ Delta ≤ 50%: Need to build on (Potential to become Strength)</div>
            <div>• Delta ≤ -50%: Area for Improvement</div>
            <div>• -50% &lt; Delta ≤ -20%: Needs focus (Likely to become Area of Improvement)</div>
            <div>• -19% ≤ Delta ≤ 19%: Subjective Decision</div>
          </div>
          <div style={{ overflowX: 'auto', marginBottom: 20 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Sr. No.</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Category</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}># Positive Customer Comments (P)</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}># Negative Customer Comments (N)</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>P%</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>N%</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Delta %</th>
                  <th style={{ border: '1px solid #93c5fd', padding: '8px', background: '#dbeafe' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {combinedRemarksAccountData && combinedRemarksAccountData.length > 0 ? (
                  combinedRemarksAccountData.map((row, idx) => (
                    <tr key={`combined-${row.category}-${idx}`}>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600 }}>{row.category}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#047857', fontWeight: 700, textAlign: 'center' }}>{row.positiveCount}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', color: '#b91c1c', fontWeight: 700, textAlign: 'center' }}>{row.negativeCount}</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600, textAlign: 'center' }}>{row.pPercent.toFixed(2)}%</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 600, textAlign: 'center' }}>{row.nPercent.toFixed(2)}%</td>
                      <td style={{ border: '1px solid #bfdbfe', padding: '8px', fontWeight: 700, textAlign: 'center', color: row.deltaPercent >= 0 ? '#047857' : '#b91c1c' }}>{row.deltaPercent.toFixed(2)}%</td>
                      <td style={{ 
                        border: '1px solid #bfdbfe', 
                        padding: '8px', 
                        fontWeight: row.remarks ? 700 : 'normal',
                        backgroundColor: row.remarks === 'Strength' ? '#006400' : // Dark Green
                                        row.remarks === 'Area for Improvement' ? '#FF0000' : // Red
                                        row.remarks === 'Needs focus' ? '#FFA500' : // Amber
                                        row.remarks === 'Need to build on' ? '#90EE90' : // Light Green
                                        'transparent',
                        color: row.remarks === 'Strength' || row.remarks === 'Area for Improvement' ? '#FFFFFF' : // White text for dark backgrounds
                               row.remarks === 'Needs focus' || row.remarks === 'Need to build on' ? '#000000' : // Black text for light backgrounds
                               '#000000',
                        textAlign: 'center'
                      }}>{row.remarks || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} style={{ border: '1px solid #bfdbfe', padding: '10px', textAlign: 'center', color: '#64748b' }}>
                      No data available. Please upload remarks data to see combined category analysis.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Stacked Bar Chart for Combined Category Analysis */}
          {combinedRemarksAccountData && combinedRemarksAccountData.length > 0 && (
            <div style={{ marginTop: 32, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                  Combined Category Analysis - P% vs N% Chart
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', border: '1px solid #93c5fd', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      onClick={() => setChartLayout('vertical')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: chartLayout === 'vertical' ? '#1d4ed8' : '#fff',
                        color: chartLayout === 'vertical' ? '#fff' : '#0f172a',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Vertical
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartLayout('horizontal')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: chartLayout === 'horizontal' ? '#1d4ed8' : '#fff',
                        color: chartLayout === 'horizontal' ? '#fff' : '#0f172a',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Horizontal
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={downloadCombinedChartImage}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                  >
                    <Download size={16} />
                    Download Chart
                  </button>
                </div>
              </div>
              <div 
                ref={combinedChartRef}
                style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', minHeight: '400px' }}
              >
                {(() => {
                  console.log('🔍 DEBUG: Chart render check:', {
                    chartDataExists: !!chartData,
                    chartDataLength: chartData?.length || 0,
                    chartData: chartData,
                    combinedRemarksAccountDataLength: combinedRemarksAccountData?.length || 0
                  });
                  
                  if (chartData && chartData.length > 0) {
                    console.log('🔍 DEBUG: Rendering chart with data:', {
                      dataLength: chartData.length,
                      firstEntry: chartData[0],
                      allCategories: chartData.map(d => d.category),
                      allPPercent: chartData.map(d => d.pPercent),
                      allNPercent: chartData.map(d => d.nPercent),
                      dataStructure: {
                        category: typeof chartData[0]?.category,
                        pPercent: typeof chartData[0]?.pPercent,
                        nPercent: typeof chartData[0]?.nPercent
                      }
                    });
                    
                    // Calculate chart height with reduced spacing for better layout
                    // For horizontal layout, use fixed height; for vertical, scale with data length
                    const perCategoryHeight = chartLayout === 'horizontal' ? 60 : 40;
                    const chartHeight = chartLayout === 'horizontal' 
                      ? Math.max(480, chartData.length * perCategoryHeight) 
                      : Math.max(400, chartData.length * perCategoryHeight);
                    console.log('🔍 DEBUG: Chart rendering with height:', chartHeight, 'data length:', chartData.length, 'layout:', chartLayout);
                    console.log('🔍 DEBUG: First 3 chart data entries:', JSON.stringify(chartData.slice(0, 3), null, 2));
                    
                    // Verify data structure and values
                    const testEntry = chartData[0];
                    const sampleValues = chartData.slice(0, 5).map(d => ({
                      category: d.category,
                      pPercent: d.pPercent,
                      nPercent: d.nPercent,
                      sum: d.pPercent + d.nPercent
                    }));
                    console.log('🔍 DEBUG: Sample values from first 5 entries:', sampleValues);
                    
                    if (testEntry) {
                      console.log('🔍 DEBUG: Test entry structure:', {
                        category: testEntry.category,
                        pPercent: testEntry.pPercent,
                        nPercent: testEntry.nPercent,
                        pPercentType: typeof testEntry.pPercent,
                        nPercentType: typeof testEntry.nPercent,
                        pPercentValue: testEntry.pPercent,
                        nPercentValue: testEntry.nPercent,
                        isPValid: !isNaN(testEntry.pPercent) && testEntry.pPercent > 0,
                        isNValid: !isNaN(testEntry.nPercent) && testEntry.nPercent > 0
                      });
                    }
                    
                    // Calculate actual chart container height
                    const actualChartHeight = Math.max(chartLayout === 'horizontal' ? 450 : 400, chartHeight - 40);
                    const horizontalBarSize = chartLayout === 'horizontal'
                      ? Math.max(14, Math.min(30, Math.floor(actualChartHeight / (chartData.length * 2 || 1))))
                      : null;
                    console.log('🔍 DEBUG: Actual chart height:', actualChartHeight);
                    console.log('🔍 DEBUG: First entry values:', testEntry ? { p: testEntry.pPercent, n: testEntry.nPercent, sum: testEntry.pPercent + testEntry.nPercent } : 'No entry');
                    
                    // Verify at least one entry has non-zero values
                    const hasNonZeroData = chartData.some(d => d.pPercent > 0 || d.nPercent > 0);
                    console.log('🔍 DEBUG: Has non-zero data:', hasNonZeroData);
                    
                    return (
                      <div style={{ width: '100%', minHeight: '400px', position: 'relative', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', padding: '10px' }}>
                        <div style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f0f9ff', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace' }}>
                          <strong>Chart Data Preview:</strong> {chartData.length} categories | 
                          Layout: {chartLayout} |
                          First: {testEntry ? `${testEntry.category}: P%=${testEntry.pPercent}%, N%=${testEntry.nPercent}%` : 'N/A'} |
                          Has Data: {hasNonZeroData ? 'Yes' : 'No'}
                        </div>
                        <div style={{ width: '100%', height: `${actualChartHeight}px`, minHeight: '350px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', overflow: 'visible' }}>
                          <ResponsiveContainer width="100%" height={actualChartHeight}>
                            {chartLayout === 'horizontal' ? (
                              <BarChart
                                data={chartData}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                                barCategoryGap={chartData.length > 10 ? 8 : 12}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  type="number" 
                                  domain={[0, 100]}
                                  tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
                                  ticks={[0, 20, 40, 60, 80, 100]}
                                  height={60}
                                  label={{
                                    value: 'P% and N% Stacked Distribution (%)',
                                    position: 'bottom',
                                    offset: 10,
                                    style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '700', fill: '#1f2937' }
                                  }}
                                />
                                <YAxis 
                                  type="category" 
                                  dataKey="category"
                                  tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
                                  width={150}
                                  interval={0}
                                />
                                <Tooltip 
                                  formatter={(value, name, props) => {
                                    const val = typeof value === 'number' ? value : parseFloat(value) || 0;
                                    const dataKey = props?.dataKey;
                                    const label = dataKey === 'pPercent' ? 'P%' : 'N%';
                                    return [`${val.toFixed(2)}%`, label];
                                  }}
                                  labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
                                />
                                <Legend 
                                  formatter={(value) => {
                                    if (value === 'pPercent') return 'P%';
                                    if (value === 'nPercent') return 'N%';
                                    return value;
                                  }}
                                  wrapperStyle={{ paddingTop: '20px' }}
                                  iconType="rect"
                                />
                                {/* P% bar - base of stack (left side) - Light Green (Excel Light Green #90EE90) */}
                                <Bar 
                                  dataKey="pPercent" 
                                  name="P%"
                                  fill="#90EE90"
                                  stroke="#90EE90"
                                  strokeWidth={2}
                                  stackId="a"
                                  isAnimationActive={false}
                                  barSize={chartLayout === 'horizontal' ? horizontalBarSize : (chartData.length > 0 ? Math.max(50, Math.min(100, Math.floor((actualChartHeight - 100) / Math.max(1, chartData.length)))) : 60)}
                                  radius={[0, 0, 0, 0]}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-p-horiz-${index}`} fill="#90EE90" />
                                  ))}
                                  <LabelList 
                                    dataKey="pPercent" 
                                    content={(props) => {
                                      // Always try to render if chartData exists
                                      if (!chartData) return null;
                                      return <CustomStackedBarLabel {...props} dataKey="pPercent" chartData={chartData} />;
                                    }}
                                  />
                                </Bar>
                                {/* N% bar - stacked on top of P% (right side) - Red (Excel Red #FF0000) */}
                                <Bar 
                                  dataKey="nPercent" 
                                  name="N%"
                                  fill="#FF0000"
                                  stroke="#FF0000"
                                  strokeWidth={2}
                                  stackId="a"
                                  isAnimationActive={false}
                                  barSize={chartLayout === 'horizontal' ? horizontalBarSize : (chartData.length > 0 ? Math.max(50, Math.min(100, Math.floor((actualChartHeight - 100) / Math.max(1, chartData.length)))) : 60)}
                                  radius={[0, 4, 4, 0]}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-n-horiz-${index}`} fill="#FF0000" />
                                  ))}
                                  <LabelList 
                                    dataKey="nPercent" 
                                    content={(props) => {
                                      // Always try to render if chartData exists
                                      if (!chartData) return null;
                                      return <CustomStackedBarLabel {...props} dataKey="nPercent" chartData={chartData} />;
                                    }}
                                  />
                                </Bar>
                              </BarChart>
                            ) : (
                              <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                barCategoryGap="10%"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                  dataKey="category"
                                  angle={-45}
                                  textAnchor="end"
                                  height={100}
                                  tick={{ fontSize: 11, fill: '#374151', fontWeight: '600' }}
                                  interval={0}
                                />
                                <YAxis 
                                  type="number"
                                  domain={[0, 100]}
                                  tick={{ fontSize: 12, fill: '#374151', fontWeight: '600' }}
                                  ticks={[0, 20, 40, 60, 80, 100]}
                                  label={{ value: 'P% and N% Stacked Distribution (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '14px', fontWeight: '700', fill: '#1f2937' } }}
                                />
                                <Tooltip 
                                  formatter={(value, name, props) => {
                                    const val = typeof value === 'number' ? value : parseFloat(value) || 0;
                                    const dataKey = props?.dataKey;
                                    const label = dataKey === 'pPercent' ? 'P%' : 'N%';
                                    return [`${val.toFixed(2)}%`, label];
                                  }}
                                  labelStyle={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}
                                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #3b82f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', padding: '10px' }}
                                />
                                <Legend 
                                  formatter={(value) => {
                                    if (value === 'pPercent') return 'P%';
                                    if (value === 'nPercent') return 'N%';
                                    return value;
                                  }}
                                  wrapperStyle={{ paddingTop: '20px' }}
                                  iconType="rect"
                                />
                                {/* P% bar - base of stack (bottom) - Light Green (Excel Light Green #90EE90) */}
                                <Bar 
                                  dataKey="pPercent" 
                                  name="P%"
                                  fill="#90EE90"
                                  stroke="#90EE90"
                                  strokeWidth={1}
                                  stackId="a"
                                  isAnimationActive={false}
                                  barSize={40}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-p-vert-${index}`} fill="#90EE90" />
                                  ))}
                                  <LabelList 
                                    dataKey="pPercent" 
                                    content={(props) => {
                                      // Always try to render if chartData exists
                                      if (!chartData) return null;
                                      return <CustomStackedBarLabel {...props} dataKey="pPercent" chartData={chartData} />;
                                    }}
                                  />
                                </Bar>
                                {/* N% bar - stacked on top of P% (top) - Red (Excel Red #FF0000) */}
                                <Bar 
                                  dataKey="nPercent" 
                                  name="N%"
                                  fill="#FF0000"
                                  stroke="#FF0000"
                                  strokeWidth={1}
                                  stackId="a"
                                  isAnimationActive={false}
                                  barSize={40}
                                >
                                  {chartData.map((entry, index) => (
                                    <Cell key={`cell-n-vert-${index}`} fill="#FF0000" />
                                  ))}
                                  <LabelList 
                                    dataKey="nPercent" 
                                    content={(props) => {
                                      // Always try to render if chartData exists
                                      if (!chartData) return null;
                                      return <CustomStackedBarLabel {...props} dataKey="nPercent" chartData={chartData} />;
                                    }}
                                  />
                                </Bar>
                              </BarChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  } else {
                    console.log('🔍 DEBUG: No chart data, showing empty state');
                    return (
                      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <div style={{ marginBottom: '10px', fontWeight: '600' }}>No chart data available</div>
                        <div style={{ fontSize: '0.9rem' }}>
                          Please ensure the Combined Category Analysis table has data with P% and N% values.
                        </div>
                        <div style={{ fontSize: '0.85rem', marginTop: '10px', color: '#94a3b8' }}>
                          Chart data length: {chartData?.length || 0}, Combined data length: {combinedRemarksAccountData?.length || 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', marginTop: '10px', color: '#cbd5e1', fontFamily: 'monospace', textAlign: 'left', background: '#f1f5f9', padding: '10px', borderRadius: '4px' }}>
                          <div>🔍 DEBUG INFO:</div>
                          <div>chartData exists: {chartData ? 'Yes' : 'No'}</div>
                          <div>chartData type: {typeof chartData}</div>
                          <div>chartData length: {chartData?.length || 0}</div>
                          <div>combinedRemarksAccountData length: {combinedRemarksAccountData?.length || 0}</div>
                          {chartData && chartData.length > 0 && (
                            <div>
                              <div>First entry: {JSON.stringify(chartData[0], null, 2)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      <ContentContainer>
        {processedData.length > 0 ? (
          <>
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <SuccessMessage>
                Found {processedData.length} customers matching the criteria
                {effectiveCycleStartDateFormatted && ` (filtered by CSAT cycle start date: ${effectiveCycleStartDateFormatted})`}
              </SuccessMessage>
            </div>
            
            {showBucketAnalysis ? (
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.25rem' }}>
                    📊 Areas of Improvement Bucket Analysis
                  </h3>
                  <button
                    onClick={exportBucketAnalysis}
                    style={{
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Download size={20} />
                    Download Analysis
                  </button>
                </div>
                {(() => {
                  try {
                    console.log('About to call generateBucketAnalysis');
                    console.log('generateBucketAnalysis function type:', typeof generateBucketAnalysis);
                    
                    if (typeof generateBucketAnalysis !== 'function') {
                      throw new Error('generateBucketAnalysis is not a function: ' + typeof generateBucketAnalysis);
                    }
                    
                    const result = generateBucketAnalysis();
                    console.log('generateBucketAnalysis result:', result);
                    
                    if (!result || typeof result !== 'object') {
                      throw new Error('generateBucketAnalysis returned invalid result: ' + typeof result);
                    }
                    
                    const { accountWiseAnalysis, buWiseAnalysis } = result;
                  
                  // Convert to detailed rows for account-wise analysis
                  const accountWiseData = [];
                  Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
                    const accounts = Array.from(data.accounts);
                    const respondentNames = Array.from(data.respondentNames);
                    
                    // Create separate rows for each account-respondent combination
                    accounts.forEach((account, index) => {
                      accountWiseData.push({
                        sno: accountWiseData.length + 1,
                        areaOfImprovement: area,
                        count: data.count,
                        account: account,
                        respondentName: respondentNames[index] || respondentNames[0] || ''
                      });
                    });
                  });

                  // Convert to detailed rows for BU-wise analysis
                  const buWiseData = [];
                  Object.entries(buWiseAnalysis).forEach(([area, data]) => {
                    const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
                      const ORDER=['Healthcare','CIT','Tech','India & GCC'];
                      return ORDER.indexOf(a)-ORDER.indexOf(b);
                    });
                    const respondentNames = Array.from(data.respondentNames);
                    
                    // Create separate rows for each BU-respondent combination
                    businessUnits.forEach((businessUnit, index) => {
                      buWiseData.push({
                        sno: buWiseData.length + 1,
                        areaOfImprovement: area,
                        count: data.count,
                        businessUnit: businessUnit,
                        respondentName: respondentNames[index] || respondentNames[0] || ''
                      });
                    });
                  });
                  
                  return (
                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                      {/* Account-wise Analysis */}
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Account-wise Analysis</h4>
                        <TableContainer>
                          <Table>
                            <thead>
                              <tr>
                                <TableHeader>Sr. No.</TableHeader>
                                <TableHeader>Area of Improvement</TableHeader>
                                <TableHeader>Count</TableHeader>
                                <TableHeader>Account</TableHeader>
                                <TableHeader>Respondent Name</TableHeader>
                              </tr>
                            </thead>
                            <tbody>
                              {accountWiseData.map((row, index) => {
                                // Check if this is the first row for this area of improvement
                                const isFirstRow = index === 0 || accountWiseData[index - 1].areaOfImprovement !== row.areaOfImprovement;
                                
                                return (
                                  <TableRow key={`account-${index}`}>
                                    <TableCell>{row.sno}</TableCell>
                                    <TableCell style={{ fontWeight: '600' }}>
                                      {isFirstRow ? row.areaOfImprovement : ''}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: '600', textAlign: 'center' }}>
                                      {isFirstRow ? row.count : ''}
                                    </TableCell>
                                    <TableCell>{row.account}</TableCell>
                                    <TableCell>{row.respondentName}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </tbody>
                          </Table>
                        </TableContainer>
                      </div>
                      
                      {/* BU-wise Analysis */}
                      <div style={{ flex: 1, minWidth: '300px' }}>
                        <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Business Unit-wise Analysis</h4>
                        <TableContainer>
                          <Table>
                            <thead>
                              <tr>
                                <TableHeader>Sr. No.</TableHeader>
                                <TableHeader>Area of Improvement</TableHeader>
                                <TableHeader>Count</TableHeader>
                                <TableHeader>Business Unit</TableHeader>
                                <TableHeader>Respondent Name</TableHeader>
                              </tr>
                            </thead>
                            <tbody>
                              {buWiseData.map((row, index) => {
                                // Check if this is the first row for this area of improvement
                                const isFirstRow = index === 0 || buWiseData[index - 1].areaOfImprovement !== row.areaOfImprovement;
                                
                                return (
                                  <TableRow key={`bu-${index}`}>
                                    <TableCell>{row.sno}</TableCell>
                                    <TableCell style={{ fontWeight: '600' }}>
                                      {isFirstRow ? row.areaOfImprovement : ''}
                                    </TableCell>
                                    <TableCell style={{ fontWeight: '600', textAlign: 'center' }}>
                                      {isFirstRow ? row.count : ''}
                                    </TableCell>
                                    <TableCell>{row.businessUnit}</TableCell>
                                    <TableCell>{row.respondentName}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </tbody>
                          </Table>
                        </TableContainer>
                      </div>
                    </div>
                  );
                  } catch (error) {
                    console.error('Error in bucket analysis:', error);
                    console.error('Error details:', error.message, error.stack);
                    return (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                        Error loading bucket analysis data: {error.message}
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <>
                {/* Sub Areas of Improvement Bucket Analysis Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                      🔍 Sub Areas of Improvement Bucket Analysis
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                      Analyze specific improvement sub-areas by account or business unit with counts
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSubImprovementBucketViewType('account')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: subImprovementBucketViewType === 'account' ? '#DC2626' : '#ffffff',
                          color: subImprovementBucketViewType === 'account' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Account-wise
                      </button>
                      <button
                        onClick={() => setSubImprovementBucketViewType('bu')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: subImprovementBucketViewType === 'bu' ? '#DC2626' : '#ffffff',
                          color: subImprovementBucketViewType === 'bu' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        BU-wise
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSubImprovementBucketAnalysis(!showSubImprovementBucketAnalysis)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #DC2626',
                        borderRadius: '6px',
                        backgroundColor: showSubImprovementBucketAnalysis ? '#DC2626' : '#ffffff',
                        color: showSubImprovementBucketAnalysis ? '#ffffff' : '#DC2626',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      {showSubImprovementBucketAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                    </button>
                    {showSubImprovementBucketAnalysis && (
                      <button
                        onClick={exportSubImprovementBucketAnalysis}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #DC2626',
                          borderRadius: '6px',
                          backgroundColor: '#DC2626',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          marginLeft: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Download size={16} />
                        Download Excel
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Areas of Improvement Bucket Analysis Display */}
                {showSubImprovementBucketAnalysis && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #fecaca', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
                      {subImprovementBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Sub Areas of Improvement Analysis
                    </h3>
                    
                    {(() => {
                      try {
                        const { accountWiseAnalysis, buWiseAnalysis } = generateSubImprovementBucketAnalysis();
                      
                      // Convert to detailed rows for account-wise analysis
                      const accountWiseData = [];
                      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
                        const accounts = Array.from(data.accounts);
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each account-respondent combination
                        accounts.forEach((account, index) => {
                          accountWiseData.push({
                            sno: accountWiseData.length + 1,
                            subAreaOfImprovement: area,
                            count: data.count,
                            account: account,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      // Convert to detailed rows for BU-wise analysis
                      const buWiseData = [];
                      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
                        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
                          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
                          return ORDER.indexOf(a)-ORDER.indexOf(b);
                        });
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each BU-respondent combination
                        businessUnits.forEach((businessUnit, index) => {
                          buWiseData.push({
                            sno: buWiseData.length + 1,
                            subAreaOfImprovement: area,
                            count: data.count,
                            businessUnit: businessUnit,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      const currentData = subImprovementBucketViewType === 'account' ? accountWiseData : buWiseData;
                      
                      if (currentData.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            No sub improvement data available
                          </div>
                        );
                      }
                      
                      return (
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          {/* Account-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Account-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Sub Area of Improvement</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Account</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {accountWiseData.map((row, index) => {
                                    // Check if this is the first row for this sub area of improvement
                                    const isFirstRow = index === 0 || accountWiseData[index - 1].subAreaOfImprovement !== row.subAreaOfImprovement;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.subAreaOfImprovement : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.account}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                          
                          {/* BU-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Business Unit-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Sub Area of Improvement</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Business Unit</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {buWiseData.map((row, index) => {
                                    // Check if this is the first row for this sub area of improvement
                                    const isFirstRow = index === 0 || buWiseData[index - 1].subAreaOfImprovement !== row.subAreaOfImprovement;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.subAreaOfImprovement : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.businessUnit}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                      );
                      } catch (error) {
                        console.error('Error in sub improvement bucket analysis:', error);
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            Error loading sub improvement bucket analysis data
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Sub Strength Bucket Analysis Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                      💪 Sub Strength Bucket Analysis
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                      Analyze specific strength sub-areas by account or business unit with counts
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setSubStrengthBucketViewType('account')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: subStrengthBucketViewType === 'account' ? '#059669' : '#ffffff',
                          color: subStrengthBucketViewType === 'account' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Account-wise
                      </button>
                      <button
                        onClick={() => setSubStrengthBucketViewType('bu')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: subStrengthBucketViewType === 'bu' ? '#059669' : '#ffffff',
                          color: subStrengthBucketViewType === 'bu' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        BU-wise
                      </button>
                    </div>
                    <button
                      onClick={() => setShowSubStrengthBucketAnalysis(!showSubStrengthBucketAnalysis)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #059669',
                        borderRadius: '6px',
                        backgroundColor: showSubStrengthBucketAnalysis ? '#059669' : '#ffffff',
                        color: showSubStrengthBucketAnalysis ? '#ffffff' : '#059669',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      {showSubStrengthBucketAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                    </button>
                    {showSubStrengthBucketAnalysis && (
                      <button
                        onClick={exportSubStrengthBucketAnalysis}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #059669',
                          borderRadius: '6px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          marginLeft: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Download size={16} />
                        Download Excel
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Strength Bucket Analysis Display */}
                {showSubStrengthBucketAnalysis && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
                      {subStrengthBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Sub Strength Analysis
                    </h3>
                    
                    {(() => {
                      try {
                        const { accountWiseAnalysis, buWiseAnalysis } = generateSubStrengthBucketAnalysis();
                      
                      // Convert to detailed rows for account-wise analysis
                      const accountWiseData = [];
                      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
                        const accounts = Array.from(data.accounts);
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each account-respondent combination
                        accounts.forEach((account, index) => {
                          accountWiseData.push({
                            sno: accountWiseData.length + 1,
                            subStrength: area,
                            count: data.count,
                            account: account,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      // Convert to detailed rows for BU-wise analysis
                      const buWiseData = [];
                      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
                        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
                          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
                          return ORDER.indexOf(a)-ORDER.indexOf(b);
                        });
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each BU-respondent combination
                        businessUnits.forEach((businessUnit, index) => {
                          buWiseData.push({
                            sno: buWiseData.length + 1,
                            subStrength: area,
                            count: data.count,
                            businessUnit: businessUnit,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      const currentData = subStrengthBucketViewType === 'account' ? accountWiseData : buWiseData;
                      
                      if (currentData.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            No sub strength data available
                          </div>
                        );
                      }
                      
                      return (
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          {/* Account-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Account-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Sub Strength</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Account</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {accountWiseData.map((row, index) => {
                                    // Check if this is the first row for this sub strength
                                    const isFirstRow = index === 0 || accountWiseData[index - 1].subStrength !== row.subStrength;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.subStrength : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.account}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                          
                          {/* BU-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Business Unit-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Sub Strength</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Business Unit</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {buWiseData.map((row, index) => {
                                    // Check if this is the first row for this sub strength
                                    const isFirstRow = index === 0 || buWiseData[index - 1].subStrength !== row.subStrength;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.subStrength : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.businessUnit}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                      );
                      } catch (error) {
                        console.error('Error in sub strength bucket analysis:', error);
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            Error loading sub strength bucket analysis data
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Strength Bucket Analysis Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.1rem' }}>
                      ✅ Strength Bucket Analysis
                    </h3>
                    <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                      Analyze strength areas by account or business unit with counts
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setStrengthBucketViewType('account')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: strengthBucketViewType === 'account' ? '#059669' : '#ffffff',
                          color: strengthBucketViewType === 'account' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        Account-wise
                      </button>
                      <button
                        onClick={() => setStrengthBucketViewType('bu')}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          backgroundColor: strengthBucketViewType === 'bu' ? '#059669' : '#ffffff',
                          color: strengthBucketViewType === 'bu' ? '#ffffff' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        BU-wise
                      </button>
                    </div>
                    <button
                      onClick={() => setShowStrengthBucketAnalysis(!showStrengthBucketAnalysis)}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #059669',
                        borderRadius: '6px',
                        backgroundColor: showStrengthBucketAnalysis ? '#059669' : '#ffffff',
                        color: showStrengthBucketAnalysis ? '#ffffff' : '#059669',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      {showStrengthBucketAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                    </button>
                    {showStrengthBucketAnalysis && (
                      <button
                        onClick={exportStrengthBucketAnalysis}
                        style={{
                          padding: '0.5rem 1rem',
                          border: '1px solid #059669',
                          borderRadius: '6px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          marginLeft: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <Download size={16} />
                        Download Excel
                      </button>
                    )}
                  </div>
                </div>

                {/* Strength Bucket Analysis Display */}
                {showStrengthBucketAnalysis && (
                  <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #bbf7d0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937', fontSize: '1.2rem' }}>
                      {strengthBucketViewType === 'account' ? 'Account-wise' : 'BU-wise'} Strength Analysis
                    </h3>
                    
                    {(() => {
                      try {
                        const { accountWiseAnalysis, buWiseAnalysis } = generateStrengthBucketAnalysis();
                      
                      // Convert to detailed rows for account-wise analysis
                      const accountWiseData = [];
                      Object.entries(accountWiseAnalysis).forEach(([area, data]) => {
                        const accounts = Array.from(data.accounts);
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each account-respondent combination
                        accounts.forEach((account, index) => {
                          accountWiseData.push({
                            sno: accountWiseData.length + 1,
                            areaOfStrength: area,
                            count: data.count,
                            account: account,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      // Convert to detailed rows for BU-wise analysis
                      const buWiseData = [];
                      Object.entries(buWiseAnalysis).forEach(([area, data]) => {
                        const businessUnits = Array.from(data.businessUnits).sort((a,b)=>{
                          const ORDER=['Healthcare','CIT','Tech','India & GCC'];
                          return ORDER.indexOf(a)-ORDER.indexOf(b);
                        });
                        const respondentNames = Array.from(data.respondentNames);
                        
                        // Create separate rows for each BU-respondent combination
                        businessUnits.forEach((businessUnit, index) => {
                          buWiseData.push({
                            sno: buWiseData.length + 1,
                            areaOfStrength: area,
                            count: data.count,
                            businessUnit: businessUnit,
                            respondentName: respondentNames[index] || respondentNames[0] || ''
                          });
                        });
                      });

                      const currentData = strengthBucketViewType === 'account' ? accountWiseData : buWiseData;
                      
                      if (currentData.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            No strength data available
                          </div>
                        );
                      }
                      
                      return (
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          {/* Account-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Account-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Area of Strength</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Account</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {accountWiseData.map((row, index) => {
                                    // Check if this is the first row for this area of strength
                                    const isFirstRow = index === 0 || accountWiseData[index - 1].areaOfStrength !== row.areaOfStrength;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.areaOfStrength : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.account}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                          
                          {/* BU-wise Analysis */}
                          <div style={{ flex: 1, minWidth: '300px' }}>
                            <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Business Unit-wise Analysis</h4>
                            <TableContainer>
                              <Table>
                                <thead>
                                  <tr>
                                    <TableHeader>Sr. No.</TableHeader>
                                    <TableHeader>Area of Strength</TableHeader>
                                    <TableHeader>Count</TableHeader>
                                    <TableHeader>Business Unit</TableHeader>
                                    <TableHeader>Respondent Name</TableHeader>
                                  </tr>
                                </thead>
                                <tbody>
                                  {buWiseData.map((row, index) => {
                                    // Check if this is the first row for this area of strength
                                    const isFirstRow = index === 0 || buWiseData[index - 1].areaOfStrength !== row.areaOfStrength;
                                    
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>{isFirstRow ? row.sno : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.areaOfStrength : ''}</TableCell>
                                        <TableCell>{isFirstRow ? row.count : ''}</TableCell>
                                        <TableCell>{row.businessUnit}</TableCell>
                                        <TableCell>{row.respondentName}</TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </tbody>
                              </Table>
                            </TableContainer>
                          </div>
                        </div>
                      );
                      } catch (error) {
                        console.error('Error in strength bucket analysis:', error);
                        return (
                          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            Error loading strength bucket analysis data
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                <SearchContainer>
                  <SearchInput
                    type="text"
                    placeholder="Search by customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <ClearButton onClick={clearSearch}>
                    Clear
                  </ClearButton>
                </SearchContainer>
                <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>#</TableHeader>
                    <TableHeader>Business Unit</TableHeader>
                    <TableHeader>Customer Name</TableHeader>
                    <TableHeader>Respondent Name</TableHeader>
                    <TableHeader>NPS</TableHeader>
                    <TableHeader>Meeting Delivery Commitments</TableHeader>
                    <TableHeader>Customer Engagement and Relationship</TableHeader>
                    <TableHeader>Partner adding value to Customer Business</TableHeader>
                    <TableHeader>Resource Competency</TableHeader>
                    <TableHeader>Team Commitment & Collaboration</TableHeader>
                    <TableHeader>Timely Resource Fulfillment</TableHeader>
                    <TableHeader>Quality of Delivery</TableHeader>
                    <TableHeader>Areas of Improvement</TableHeader>
                    <TableHeader>Strength</TableHeader>
                    <TableHeader>Sub Areas of Improvement</TableHeader>
                    <TableHeader>Sub Strength</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.id}</TableCell>
                      <TableCell>{row.businessUnit}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.respondentName}</TableCell>
                      <TableCell>{row.NPS}</TableCell>
                      <TableCell>{row['Meeting Delivery Commitments']}</TableCell>
                      <TableCell>{row['Customer Engagement and Relationship']}</TableCell>
                      <TableCell>{row['Partner adding value to Customer Business']}</TableCell>
                      <TableCell>{row['Resource Competency']}</TableCell>
                      <TableCell>{row['Team Commitment & Collaboration']}</TableCell>
                      <TableCell>{row['Timely Resource Fulfillment']}</TableCell>
                      <TableCell>{row['Quality of Delivery']}</TableCell>
                      <TableCell>{row.areasOfImprovement}</TableCell>
                      <TableCell>{row.strength}</TableCell>
                      <TableCell>{row.subAreasOfImprovement}</TableCell>
                      <TableCell>{row.subStrength}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
              </>
            )}
          </>
        ) : (
          <StatusContainer>
            <div>No data found matching the criteria</div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Ensure your file has sheet &quot;CSAT received Report&quot; (or Sheet1) with columns: BUSINESS UNIT (or BUSSINESS UNIT), CUSTOMER_ID (or CUST_ID), CUSTOMER NAME (or CUST_NM), RESPONDENT NAME, PERSPECTIVE, RATING_DESCRIPTION. Rows must have PERSPECTIVE in: NPS, Meeting Delivery Commitments, Customer Engagement and Relationship, Partner adding value to Customer Business, Resource Competency, Team Commitment & Collaboration, Timely Resource Fulfillment, Quality of Delivery. If CSAT cycle start date or YEAR-QUARTER is set, rows must match.
            </div>
          </StatusContainer>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default OrgLevelQualitativeAnalysisDashboard;
