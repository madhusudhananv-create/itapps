import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Download, BarChart3, ChevronLeft, Building2 } from 'lucide-react';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY } from '../utils/dateUtils';

// Helper function to parse various date formats from Excel and convert to MM-DD-YYYY
const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  
  try {
    let date;
    
    // Handle different date formats that might come from Excel
    if (typeof dateValue === 'number') {
      // Excel serial date number
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      // Try to parse various string formats
      if (dateValue.includes('/')) {
        // MM/DD/YYYY or DD/MM/YYYY format
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          // Assume MM/DD/YYYY format
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          date = new Date(`${year}-${month}-${day}`);
        }
      } else if (dateValue.includes('-')) {
        // YYYY-MM-DD or MM-DD-YYYY format
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            date = new Date(dateValue);
          } else {
            // MM-DD-YYYY format
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            date = new Date(`${year}-${month}-${day}`);
          }
        }
      } else {
        // Try direct parsing
        date = new Date(dateValue);
      }
    } else {
      date = new Date(dateValue);
    }
    
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateValue}`);
      return '';
    }
    
    // Convert to MM-DD-YYYY format
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}-${day}-${year}`;
  } catch (error) {
    console.error(`Error parsing date: ${dateValue}`, error);
    return '';
  }
};

const PRACTICE_DISTRIBUTION_FILE_URL = '/data/New_customer_feedback_analysis_New.xlsx';
const PRACTICE_DISPLAY_ORDER = ['Digital Platform Engineering', 'RunOps', 'Data & Analytics', 'Cybersecurity'];
const getPracticeOrderIndex = (practice) => {
  if (!practice) return 999;
  const s = String(practice).trim();
  const idx = PRACTICE_DISPLAY_ORDER.findIndex(p => String(p).trim().toLowerCase() === s.toLowerCase());
  return idx >= 0 ? idx : 999;
};
const SHEET1_RECEIVED_NAME_MATCH = (s) => {
  const t = String(s || '').toLowerCase().trim();
  return (t.includes('csat received') && !t.includes('sent and received')) || t === 'sheet1' || t === 'sheet 1';
};
const SHEET2_SENT_RECEIVED_NAME_MATCH = (s) => {
  const t = String(s || '').toLowerCase().trim();
  return t.includes('csat sent and received') || t.includes('sent and received') || t === 'sheet2';
};
const isDateGreaterThanOrEqualMMDDYYYY = (date1, date2) => {
  if (!date1 || !date2) return false;
  try {
    const [mm1, dd1, yyyy1] = date1.split('-').map(Number);
    const [mm2, dd2, yyyy2] = date2.split('-').map(Number);
    const d1 = new Date(yyyy1, mm1 - 1, dd1);
    const d2 = new Date(yyyy2, mm2 - 1, dd2);
    return d1 >= d2;
  } catch {
    return false;
  }
};

const matchesBusinessUnitFilter = (row, businessUnitFilter) => {
  if (!businessUnitFilter) return true;
  const bu = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim();
  return bu.toLowerCase().includes(businessUnitFilter.toLowerCase());
};

const PRACTICE_RATING_COLUMN_NAMES = {
  1: 'Highly Dissatisfied',
  2: 'Dissatisfied',
  3: 'Neutral',
  4: 'Satisfied',
  5: 'Highly Satisfied'
};
const PRACTICE_RATING_DISPLAY_ORDER = [5, 4, 3, 2, 1];

const computePracticeTrendDiff = (dashVal, trendVal) => {
  const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
  const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
  if (dashNum == null || trendNum == null) {
    return { diffStr: null, arrow: null, arrowColor: '#374151', isEmpty: true };
  }
  const diff = Math.round((dashNum - trendNum) * 10) / 10;
  const diffStr = diff > 0 ? `+${diff}%` : `${diff}%`;
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : null;
  const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
  return { diffStr, arrow, arrowColor, isEmpty: false, diff };
};

// Filters detail rows (sheet1) and second-sheet rows down to a single Business Unit, using the second sheet's own
// BUSINESS UNIT column plus a CUST_ID -> BUSINESS UNIT map (sheet1 rows don't always carry BUSINESS UNIT directly).
const filterSheetsByBusinessUnit = (source, secondSheetSource, businessUnitFilter) => {
  if (!businessUnitFilter) return { source, secondSheetSource };
  const buLower = businessUnitFilter.toLowerCase();
  const secondSheetFirstRow = (secondSheetSource && secondSheetSource[0]) || {};
  const buCol = Object.keys(secondSheetFirstRow).find(k => {
    const t = String(k || '').toLowerCase().replace(/\s/g, '');
    return t === 'businessunit' || t === 'bussinessunit';
  }) || 'BUSINESS UNIT';
  const custIdToBU = new Map();
  const filteredSecondSheet = (secondSheetSource || []).filter(row => {
    const bu = (row[buCol] ?? row['BUSSINESS UNIT'] ?? '').toString().trim();
    const matches = bu.toLowerCase().includes(buLower);
    const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
    if (custId != null && bu) custIdToBU.set(String(custId).trim(), bu);
    return matches;
  });
  const filteredSource = (source || []).filter(row => {
    const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
    if (custId == null) return true;
    const bu = custIdToBU.get(String(custId).trim());
    if (bu == null) return true;
    return bu.toLowerCase().includes(buLower);
  });
  return { source: filteredSource, secondSheetSource: filteredSecondSheet };
};

const buildPracticeWiseDistributionData = (source, secondSheetSource, csatCycleStartDateFormatted) => {
  const practicePolledResponded = {};
  const practiceByCustomerId = new Map();
  const hasSecondSheet = secondSheetSource && Array.isArray(secondSheetSource) && secondSheetSource.length > 0;

  if (hasSecondSheet) {
    const shFirst = secondSheetSource[0] || {};
    const practiceCol2 = Object.keys(shFirst).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const sentDateCol = Object.keys(shFirst).find(k => {
      const lower = String(k || '').toLowerCase();
      return k === 'CSAT SENT DATE' || lower.includes('csat_sent_date') || lower.includes('css_sent_date') || lower.includes('sent date');
    }) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(shFirst).find(k => {
      const lower = String(k || '').toLowerCase();
      return k === 'CSAT RECEIVED DATE' || lower.includes('csat_received_date') || lower.includes('css_received_date') || lower.includes('received date');
    }) || 'CSAT RECEIVED DATE';

    secondSheetSource.forEach((row) => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      if (customerId) {
        const key = String(customerId).trim();
        const practiceVal = (row[practiceCol2] ?? row['Practice'] ?? row['PRACTICE'] ?? row['practice'] ?? '').toString().trim();
        if (practiceVal && practiceVal.toLowerCase() !== 'n/a') {
          const existing = practiceByCustomerId.get(key);
          if (!existing || existing.toLowerCase() === 'n/a') practiceByCustomerId.set(key, practiceVal);
        }
      }
      const practice = (row[practiceCol2] ?? row['Practice'] ?? row['PRACTICE'] ?? row['practice'] ?? '').toString().trim();
      if (!practice || practice.toLowerCase() === 'n/a') return;
      if (!practicePolledResponded[practice]) {
        practicePolledResponded[practice] = { cssSentCount: 0, cssReceivedCount: 0 };
      }
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'] ?? row['CSS SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqualMMDDYYYY(sentFormatted, csatCycleStartDateFormatted))) {
          practicePolledResponded[practice].cssSentCount++;
        }
      }
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'] ?? row['CSS RECEIVED DATE'];
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      const receivedFormatted = (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') ? parseExcelDateToMMDDYYYY(receivedVal) : null;
      if (isCompletedStatus && (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqualMMDDYYYY(receivedFormatted, csatCycleStartDateFormatted)))) {
        practicePolledResponded[practice].cssReceivedCount++;
      }
    });
  }

  const practiceRatingCounts = {};
  const ensureRatingCounts = (practice) => {
    if (!practiceRatingCounts[practice]) {
      practiceRatingCounts[practice] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    }
  };

  if (source && Array.isArray(source) && source.length > 0) {
    const firstRow = source[0] || {};
    const questionCategoryColumn = Object.keys(firstRow).find(k =>
      k === 'QUESTION_CATEGORY' || k === 'Question Category' || String(k).toLowerCase().includes('question_category')
    ) || 'QUESTION_CATEGORY';
    const practiceCol = Object.keys(firstRow).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingColumn = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));

    source.forEach((row) => {
      if (row[questionCategoryColumn] === 'Qualitative Feedback') return;
      const perspectiveVal = (row[perspectiveCol] ?? row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      const rawPractice = (row[practiceCol] ?? row['Practice'] ?? row['PRACTICE'] ?? '').toString().trim();
      const practiceFromSecond = customerId ? (practiceByCustomerId.get(String(customerId).trim()) || '') : '';
      const practice = rawPractice && rawPractice.toLowerCase() !== 'n/a'
        ? rawPractice
        : (practiceFromSecond || '');
      if (!practice || practice.toLowerCase() === 'n/a') return;

      const ratingResolved = parseInt(row[ratingColumn] ?? row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      if (csatCycleStartDateFormatted) {
        const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const hasSent = sentVal != null && sentVal !== '' && sentVal !== 'N/A';
        const hasReceived = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A';
        const hasValidSentDate = !hasSent || (parseExcelDateToMMDDYYYY(sentVal) && isDateGreaterThanOrEqualMMDDYYYY(parseExcelDateToMMDDYYYY(sentVal), csatCycleStartDateFormatted));
        const hasValidReceivedDate = !hasReceived || (parseExcelDateToMMDDYYYY(receivedVal) && isDateGreaterThanOrEqualMMDDYYYY(parseExcelDateToMMDDYYYY(receivedVal), csatCycleStartDateFormatted));
        if (!hasValidSentDate || !hasValidReceivedDate) return;
      }

      ensureRatingCounts(practice);
      practiceRatingCounts[practice][ratingResolved]++;
    });
  }

  const allPractices = new Set([
    ...Object.keys(practicePolledResponded),
    ...Object.keys(practiceRatingCounts)
  ]);

  let result = [...allPractices]
    .filter(practice => {
      const pr = practicePolledResponded[practice] || { cssSentCount: 0, cssReceivedCount: 0 };
      return !hasSecondSheet || pr.cssSentCount > 0;
    })
    .map((practice) => {
      const pr = practicePolledResponded[practice] || { cssSentCount: 0, cssReceivedCount: 0 };
      const counts = practiceRatingCounts[practice] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const responded = pr.cssReceivedCount || 0;
      const row = {
        practice,
        cssSentCount: pr.cssSentCount || 0,
        cssReceivedCount: responded,
        ratingCounts: counts
      };
      PRACTICE_RATING_DISPLAY_ORDER.forEach((rating) => {
        const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
        row[colName] = responded > 0
          ? Math.round((counts[rating] / responded) * 1000) / 10
          : '-';
      });
      return row;
    });

  result.sort((a, b) => {
    const ia = getPracticeOrderIndex(a.practice);
    const ib = getPracticeOrderIndex(b.practice);
    if (ia !== ib) return ia - ib;
    return (a.practice || '').localeCompare(b.practice || '');
  });
  result = result.map((r, i) => ({ ...r, sNo: i + 1 }));
  return { data: result };
};

const buildPracticeWisePolledRespondedFromSheet2 = (secondSheetSource, csatCycleStartDateFormatted) =>
  buildPracticeWiseDistributionData(null, secondSheetSource, csatCycleStartDateFormatted);

const getTrendFilePracticeSheets = (file) => {
  if (!file?.sheets) return { sheet1: [], sheet2: [] };
  const sheetNames = file.sheetNames || Object.keys(file.sheets);
  const sheet1Name = sheetNames.find(SHEET1_RECEIVED_NAME_MATCH) || sheetNames[0];
  const sheet2Name = sheetNames.find(SHEET2_SENT_RECEIVED_NAME_MATCH) || sheetNames[1];
  const readSheet = (name) => {
    if (!name) return [];
    let data = file.sheets[name];
    if (!data) {
      const exactKey = Object.keys(file.sheets).find(
        k => String(k).toLowerCase().trim() === String(name).toLowerCase().trim()
      );
      if (exactKey) data = file.sheets[exactKey];
    }
    return Array.isArray(data) ? data : [];
  };
  return { sheet1: readSheet(sheet1Name), sheet2: readSheet(sheet2Name) };
};

const findH12025TrendFile = (trendAnalysisFiles) => {
  const nameLower = (s) => (s || '').toLowerCase();
  return (
    (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis-h12025')) ||
    (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis-h12025')) ||
    (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis') && nameLower(f.saveName).includes('h12025')) ||
    (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis') && nameLower(f.originalName).includes('h12025')) ||
    (trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null) ||
    null
  );
};

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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  max-height: 600px;
  overflow-y: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
`;

const Th = styled.th`
  background: #1e3a8a; /* Navy blue - same as ACSAT: Org & BU Level Average CSAT Scores (ARGB: FF1E3A8A) */
  color: #ffffff;
  padding: 0.6rem 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #9ca3af;
  white-space: nowrap;
  position: sticky;
  top: 0;
  z-index: 10;
  &:hover {
    background: #1e3a8a !important;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  color: #374151;
  white-space: nowrap;
  text-align: center;
  font-size: 0.85rem;
  line-height: 1.4;
`;
// Trend analysis (H2 Vs H1) cells: word wrap + keep value and arrow in cell properly
const trendCellStyle = {
  whiteSpace: 'normal',
  wordWrap: 'break-word',
  overflowWrap: 'break-word',
  padding: '0.5rem 0.5rem',
  verticalAlign: 'middle',
  minWidth: '4.5rem',
  maxWidth: '120px'
};

const ResultsSummary = styled.div`
  background: #f8fafc;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  border-left: 4px solid #3b82f6;
`;

const AccountBUWiseOverallCSATScoreDistributionDashboard = ({ onBack, excelData, trendAnalysisFiles = [] }) => {
  // Get CSAT cycle start date from context
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  // Dynamic "Trend analysis (<main period> Vs <comparison period>)" header label, driven by the
  // actual selected main period (acsatCycle) and the most recently fetched/uploaded comparison period.
  const trendComparisonPeriodLabel = (trendAnalysisFiles && trendAnalysisFiles.length > 0)
    ? (trendAnalysisFiles[trendAnalysisFiles.length - 1].saveName || trendAnalysisFiles[trendAnalysisFiles.length - 1].originalName || 'comparison period')
    : 'comparison period';
  const trendHeaderLabel = `Trend analysis (${acsatCycle || 'current period'} Vs ${trendComparisonPeriodLabel})`;
  
  const [uploadedData, setUploadedData] = useState(null);
  const [showBuWise, setShowBuWise] = useState(false);
  const [showTop10, setShowTop10] = useState(false);
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  const [showPracticeWise, setShowPracticeWise] = useState(false);
  const [practiceFileReceivedData, setPracticeFileReceivedData] = useState(null);
  const [practiceFileSheet2Data, setPracticeFileSheet2Data] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  useEffect(() => {
    if (excelData && excelData.data && Array.isArray(excelData.data)) {
      setUploadedData(excelData.data);
    }
  }, [excelData]);

  useEffect(() => {
    const base = typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const url = (base.replace(/\/$/, '') || '') + PRACTICE_DISTRIBUTION_FILE_URL;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error('File not found'); return res.arrayBuffer(); })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const sheet1Name = sheetNames.find(SHEET1_RECEIVED_NAME_MATCH) || sheetNames[0];
        const sheet1Data = (sheet1Name && workbook.Sheets[sheet1Name])
          ? XLSX.utils.sheet_to_json(workbook.Sheets[sheet1Name], { defval: '' })
          : null;
        const sheet2Name = sheetNames.find(SHEET2_SENT_RECEIVED_NAME_MATCH) || sheetNames[1];
        const sheet2Data = (sheet2Name && workbook.Sheets[sheet2Name])
          ? XLSX.utils.sheet_to_json(workbook.Sheets[sheet2Name], { defval: '' })
          : null;
        setPracticeFileReceivedData(Array.isArray(sheet1Data) && sheet1Data.length > 0 ? sheet1Data : null);
        setPracticeFileSheet2Data(Array.isArray(sheet2Data) && sheet2Data.length > 0 ? sheet2Data : null);
      })
      .catch(() => {
        setPracticeFileReceivedData(null);
        setPracticeFileSheet2Data(null);
      });
  }, []);

  // BUSINESS UNIT display order: Healthcare, CIT, Tech, India & GCC, Sead/SEAD (BU-wise, Top 10, Account-wise; dashboard + Excel)
  const BUSINESS_UNIT_DISPLAY_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC', 'Sead'];
  const getBusinessUnitOrderIndex = (bu) => {
    if (bu == null || bu === '') return -1;
    const s = String(bu).trim();
    if (/^health\s*care$/i.test(s) || s.toLowerCase().replace(/\s/g, '') === 'healthcare') return 0;
    if (s === 'Sead' || s === 'SEAD') return 4;
    const idx = BUSINESS_UNIT_DISPLAY_ORDER.indexOf(s);
    return idx >= 0 ? idx : 999;
  };

  // Normalize BU for grouping (Health care/Health Care/Healthcare → Healthcare, SEAD/Sead → Sead)
  const normalizeBU = (bu) => {
    if (bu == null || bu === '') return '';
    const s = String(bu).trim();
    if (/^health\s*care$/i.test(s) || s.toLowerCase().replace(/\s/g, '') === 'healthcare') return 'Healthcare';
    if (/^sead$/i.test(s)) return 'Sead';
    return s;
  };
  // Display: "Health care" / "Health Care" as "Healthcare"; "Sead" as "SEAD" (dashboard + Excel). Function so it's hoisted and safe to use in any useMemo.
  function normalizeBUDisplay(bu) {
    const s = String(bu ?? '').trim();
    if (/^health\s*care$/i.test(s)) return 'Healthcare';
    if (/^sead$/i.test(s)) return 'SEAD';
    return s;
  }

  // Trend analysis: from uploaded trend file sheet "CSAT sent and received Report" (2nd sheet), group by BUSINESS UNIT. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted (MM-DD-YYYY).
  const trendBuWiseSentReceivedData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return [];
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return [];
    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return [];
    const firstRow = sheetData[0] || {};
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const sentCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';
    const buGroups = {};
    sheetData.forEach(row => {
      const buRaw = row[buCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
      if (!buRaw || buRaw === 'N/A') return;
      const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (!buGroups[businessUnit]) buGroups[businessUnit] = { businessUnit, polled: 0, responded: 0 };
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) buGroups[businessUnit].polled++;
      if (isCompletedStatus && (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) buGroups[businessUnit].responded++;
    });
    const rows = Object.values(buGroups)
      .filter(g => g.polled > 0 || g.responded > 0)
      .map(g => ({ businessUnit: g.businessUnit, polled: g.polled, responded: g.responded }));
    rows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a.businessUnit);
      const idxB = getBusinessUnitOrderIndex(b.businessUnit);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    return rows;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend Top 10: from uploaded trend file sheet 2 "CSAT sent and received Report", TYPE OF ACCOUNT = "Top 10", date >= csatCycleStartDateFormatted. Group by Account Name (CUSTOMER NAME/CUST_NM) and BUSINESS UNIT. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE).
  const trendTop10SentReceivedData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return [];
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return [];
    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return [];
    const firstRow = sheetData[0] || {};
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const accountNameCol = Object.keys(firstRow).find(k => {
      const s = String(k).toLowerCase().replace(/\s/g, ' ').trim();
      return /customer\s*name|cust_nm|cust\s*nm/.test(s) || s === 'cust_nm';
    }) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const sentCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';
    const groups = {};
    sheetData.forEach(row => {
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
      if (typeVal !== 'Top 10' && typeVal.toUpperCase() !== 'Y') return;
      const accountName = (row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBU(buRaw) || 'N/A';
      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const key = `${accountName}|${businessUnit}`;
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (!groups[key]) groups[key] = { accountName, businessUnit, polled: 0, responded: 0 };
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) groups[key].polled++;
      if (isCompletedStatus && (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) groups[key].responded++;
    });
    const rows = Object.values(groups)
      .filter(g => g.polled > 0 || g.responded > 0)
      .map(g => ({ accountName: g.accountName, businessUnit: g.businessUnit, polled: g.polled, responded: g.responded }));
    // Same fixed account order as the Top 10 Accounts table (Premier first)
    const top10FixedOrder = [
      'Premier Healthcare Solutions Inc',
      'Blue Cross Blue Shield Association BCBSA',
      'Frontier Airlines INC',
      'Premier - Horizon II - Covenant Health',
      'Tufts Medicine',
      'BronxCare Health System',
      'AgFirst Farm Credit Bank',
      'embecta MEDICAL II LLC',
      'Northern Trust Company',
      'Jewish Board of Family and Childrens Services JBFCS',
      'Healthfirst',
      'AgileOne'
    ];
    const normalizeForOrder = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    rows.sort((a, b) => {
      const idxA = top10FixedOrder.findIndex(n => normalizeForOrder(n) === normalizeForOrder(a.accountName));
      const idxB = top10FixedOrder.findIndex(n => normalizeForOrder(n) === normalizeForOrder(b.accountName));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.accountName || '').localeCompare(b.accountName || '');
    });
    return rows;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Helper: TYPE OF ACCOUNT is Blank / Empty / N/A (for "Other Accounts")
  const isOtherTypeOfAccount = (val) => {
    const s = (val ?? '').toString().trim();
    return s === '' || /^n\/a$/i.test(s);
  };

  // Trend Other Accounts: from sheet 2 "CSAT sent and received Report", TYPE OF ACCOUNT = Blank/Empty/N/A, date >= csatCycleStartDateFormatted. Group by Account Name and BUSINESS UNIT.
  const trendOtherAccountsSentReceivedData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return [];
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return [];
    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return [];
    const firstRow = sheetData[0] || {};
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const accountNameCol = Object.keys(firstRow).find(k => {
      const s = String(k).toLowerCase().replace(/\s/g, ' ').trim();
      return /customer\s*name|cust_nm|cust\s*nm/.test(s) || s === 'cust_nm';
    }) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const sentCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';
    const groups = {};
    sheetData.forEach(row => {
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
      if (!isOtherTypeOfAccount(typeVal)) return;
      const accountName = (row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBU(buRaw) || 'N/A';
      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const key = `${accountName}|${businessUnit}`;
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (!groups[key]) groups[key] = { accountName, businessUnit, polled: 0, responded: 0 };
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) groups[key].polled++;
      if (isCompletedStatus && (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) groups[key].responded++;
    });
    const rows = Object.values(groups)
      .filter(g => g.polled > 0 || g.responded > 0)
      .map(g => ({ accountName: g.accountName, businessUnit: g.businessUnit, polled: g.polled, responded: g.responded }));
    rows.sort((a, b) => {
      const buA = getBusinessUnitOrderIndex(a.businessUnit);
      const buB = getBusinessUnitOrderIndex(b.businessUnit);
      if (buA !== buB) return buA - buB;
      return (a.accountName || '').localeCompare(b.accountName || '');
    });
    return rows;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend Analysis (H1 2025 reference) – Account-wise sent/received (Sheet2 "CSAT sent and received Report")
  // Group by CUSTOMER_ID/CUST_ID (+ BUSINESS UNIT), ordered by Business Unit.
  const trendAccountWiseSentReceivedH1 = useMemo(() => {
    if (!showTrendAnalysis || showBuWise || showTop10) return { rows: [], hasData: false, error: null };
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return { rows: [], hasData: false, error: null };

    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return { rows: [], hasData: false, error: 'No \"CSAT sent and received Report\" sheet found.' };

    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { rows: [], hasData: false, error: 'No rows in trend sheet.' };

    const firstRow = sheetData[0] || {};
    const accountNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const custIdCol = Object.keys(firstRow).find(k => {
      const n = String(k).toLowerCase().replace(/[\s_]/g, '');
      return n === 'customerid' || n === 'custid';
    }) || 'CUSTOMER_ID';
    const sentCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';

    const groups = new Map();
    sheetData.forEach(row => {
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBU(buRaw) || 'N/A';
      if (!businessUnit || businessUnit === 'N/A') return;
      const accountName = (row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['Customer Name'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const custId = (row[custIdCol] ?? row['CUSTOMER_ID'] ?? row['CUST_ID'] ?? '').toString().trim();
      const keyId = custId || accountName;
      const key = `${keyId}|||${businessUnit}`;
      if (!groups.has(key)) groups.set(key, { businessUnit, accountName, polled: 0, responded: 0, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });

      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) groups.get(key).polled++;
      if (isCompletedStatus && (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) groups.get(key).responded++;
    });

    // Sheet1 "CSAT received Report": count ratings 1..5 for PERSPECTIVE="Overall Experience", grouped by CUSTOMER_ID/CUST_ID (+ BU).
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];

    if (receivedSheetName && file.sheets) {
      let receivedSheetData = file.sheets[receivedSheetName];
      if (!receivedSheetData && file.sheets) {
        const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
        if (exactKey) receivedSheetData = file.sheets[exactKey];
      }
      if (receivedSheetData && Array.isArray(receivedSheetData) && receivedSheetData.length > 0) {
        const rFirst = receivedSheetData[0] || {};
        const perspectiveCol = Object.keys(rFirst).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
        const buColR = Object.keys(rFirst).find(k =>
          (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
          (String(k).toLowerCase() === 'business unit') ||
          (String(k).toLowerCase() === 'bussiness unit')
        ) || 'BUSINESS UNIT';
        const custIdColR = Object.keys(rFirst).find(k => {
          const n = String(k).toLowerCase().replace(/[\s_]/g, '');
          return n === 'customerid' || n === 'custid';
        }) || 'CUSTOMER_ID';
        const accountNameColR = Object.keys(rFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
        const ratingCol = Object.keys(rFirst).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
        const receivedDateKey = Object.keys(rFirst).find(k => {
          const kk = String(k).toLowerCase();
          return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
        });

        receivedSheetData.forEach(row => {
          const perspective = (row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').toString().trim();
          if (perspective !== 'Overall Experience') return;

          const buRaw = (row[buColR] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
          const businessUnit = normalizeBU(buRaw) || 'N/A';
          if (!businessUnit || businessUnit === 'N/A') return;

          if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
            const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
            if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
          }

          const custId = (row[custIdColR] ?? row['CUSTOMER_ID'] ?? row['CUST_ID'] ?? '').toString().trim();
          const accountName = (row[accountNameColR] ?? row['CUSTOMER NAME'] ?? row['Customer Name'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
          const keyId = custId || accountName;
          const key = `${keyId}|||${businessUnit}`;
          const g = groups.get(key);
          if (!g) return;

          const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
          if (![1, 2, 3, 4, 5].includes(rating)) return;
          g.ratingCounts[rating] = (g.ratingCounts[rating] || 0) + 1;
        });
      }
    }

    const rows = Array.from(groups.values())
      .filter(r => (r.polled || 0) > 0 || (r.responded || 0) > 0)
      .sort((a, b) => {
        const idxA = getBusinessUnitOrderIndex(a.businessUnit);
        const idxB = getBusinessUnitOrderIndex(b.businessUnit);
        if (idxA !== idxB) return idxA - idxB;
        return (a.accountName || '').localeCompare(b.accountName || '');
      });

    // Convert ratingCounts to % columns using #Responded from Sheet2 as denominator
    const RATING_COLUMN_NAMES = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    rows.forEach(r => {
      const responded = r.responded || 0;
      [1, 2, 3, 4, 5].forEach(rt => {
        const count = r.ratingCounts?.[rt] || 0;
        r[RATING_COLUMN_NAMES[rt]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
    });

    // Org level row (for Account-wise reference + trend comparison): sum across all account+BU groups.
    const org = { businessUnit: 'Org level', accountName: 'Org level', polled: 0, responded: 0, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    rows.forEach(r => {
      org.polled += r.polled || 0;
      org.responded += r.responded || 0;
      [1, 2, 3, 4, 5].forEach(rt => { org.ratingCounts[rt] += r.ratingCounts?.[rt] || 0; });
    });
    [1, 2, 3, 4, 5].forEach(rt => {
      const count = org.ratingCounts?.[rt] || 0;
      org[RATING_COLUMN_NAMES[rt]] = org.responded > 0 ? Math.round((count / org.responded) * 1000) / 10 : '-';
    });

    const withOrg = rows.length ? [...rows, org] : [];
    return { rows: withOrg, hasData: withOrg.length > 0, error: null };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, showTrendAnalysis, showBuWise, showTop10]);

  // Trend Other Accounts rating counts: from trend file sheet "CSAT received Report", PERSPECTIVE = "Overall Experience", TYPE OF ACCOUNT = Blank/Empty/N/A. Group by (accountName, businessUnit).
  const trendOtherAccountsRatingCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const accountNameCol = Object.keys(firstRow).find(k => {
      const s = String(k).toLowerCase().replace(/\s/g, ' ').trim();
      return /customer\s*name|cust_nm|cust\s*nm/.test(s) || s === 'cust_nm';
    }) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const byKey = {};
    sheetData.forEach(row => {
      const perspective = String(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').trim();
      if (perspective !== 'Overall Experience') return;
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
      if (!isOtherTypeOfAccount(typeVal)) return;
      const accountName = (row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBU(buRaw) || 'N/A';
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (![1, 2, 3, 4, 5].includes(rating)) return;
      const key = `${accountName}|${businessUnit}`;
      if (!byKey[key]) byKey[key] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      byKey[key][rating]++;
    });
    return byKey;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend Top 10 rating counts: from trend file sheet "CSAT received Report" / "CSAT received Report " (e.g. Trend-Analysis-H12025.xlsx). Consider only PERSPECTIVE = "Overall Experience", TYPE OF ACCOUNT = "Top 10". Group by (accountName, businessUnit), count RATING 1..5. Column names: RATING 1 = "Highly Dissatisfied", 2 = "Dissatisfied", 3 = "Neutral", 4 = "Satisfied", 5 = "Highly Satisfied". Value per row = count(RATING=n)/#Responded*100.
  const trendTop10RatingCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const t = String(s).trim();
      return t === 'CSAT received Report' || t === 'CSAT received Report ';
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const accountNameCol = Object.keys(firstRow).find(k => {
      const s = String(k).toLowerCase().replace(/\s/g, ' ').trim();
      return /customer\s*name|cust_nm|cust\s*nm/.test(s) || s === 'cust_nm';
    }) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const byKey = {};
    sheetData.forEach(row => {
      const perspective = String(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').trim();
      if (perspective !== 'Overall Experience') return;
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
      if (typeVal !== 'Top 10' && typeVal.toUpperCase() !== 'Y') return;
      const accountName = (row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBU(buRaw) || 'N/A';
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (![1, 2, 3, 4, 5].includes(rating)) return;
      const key = `${accountName}|${businessUnit}`;
      if (!byKey[key]) byKey[key] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      byKey[key][rating]++;
    });
    return byKey;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Merge Top 10 trend sent/received with rating % from sheet "CSAT received Report": PERSPECTIVE = "Overall Experience", TYPE OF ACCOUNT = "Top 10". Highly Satisfied = count(RATING=5)/#Responded*100, Satisfied = count(RATING=4)/#Responded*100, Neutral = count(RATING=3)/#Responded*100, Dissatisfied = count(RATING=2)/#Responded*100, Highly Dissatisfied = count(RATING=1)/#Responded*100.
  const trendTop10TableData = useMemo(() => {
    const RATING_COLUMN_NAMES = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    return trendTop10SentReceivedData.map(row => {
      const key = `${row.accountName}|${row.businessUnit}`;
      const counts = trendTop10RatingCounts[key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const responded = row.responded || 0;
      const out = { ...row };
      [1, 2, 3, 4, 5].forEach(r => {
        out[RATING_COLUMN_NAMES[r]] = responded > 0 ? Math.round((counts[r] || 0) / responded * 1000) / 10 : '-';
      });
      return out;
    });
  }, [trendTop10SentReceivedData, trendTop10RatingCounts]);

  // Merge Other Accounts trend sent/received with rating %: same structure as trendTop10TableData.
  const trendOtherAccountsTableData = useMemo(() => {
    const RATING_COLUMN_NAMES = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    return trendOtherAccountsSentReceivedData.map(row => {
      const key = `${row.accountName}|${row.businessUnit}`;
      const counts = trendOtherAccountsRatingCounts[key] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      const responded = row.responded || 0;
      const out = { ...row };
      [1, 2, 3, 4, 5].forEach(r => {
        out[RATING_COLUMN_NAMES[r]] = responded > 0 ? Math.round((counts[r] || 0) / responded * 1000) / 10 : '-';
      });
      return out;
    });
  }, [trendOtherAccountsSentReceivedData, trendOtherAccountsRatingCounts]);

  // Lookup Top 10 trend row by Account Name + Business Unit (for Trend columns in first dashboard when showTop10 && showTrendAnalysis)
  const trendTop10ByAccountBu = useMemo(() => {
    const m = {};
    trendTop10TableData.forEach(r => {
      m[`${(r.accountName || '').toString().trim()}|${normalizeBUDisplay(r.businessUnit)}`] = r;
    });
    return m;
  }, [trendTop10TableData]);

  // Org-level (grand total) row for Trend Analysis Top 10: sum #Polled, #Responded; rating % = weighted sum (count per row / total Responded × 100).
  const trendTop10OrgRow = useMemo(() => {
    if (!trendTop10TableData.length) return null;
    const totalPolled = trendTop10TableData.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = trendTop10TableData.reduce((s, r) => s + (r.responded || 0), 0);
    const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
    const totalCountByRating = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const colToRating = { 'Highly Satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Highly Dissatisfied': 1 };
    trendTop10TableData.forEach(row => {
      const responded = row.responded || 0;
      ratingCols.forEach(col => {
        const val = row[col];
        if (val != null && val !== '-' && typeof val === 'number' && responded > 0) {
          totalCountByRating[colToRating[col]] += (val / 100) * responded;
        }
      });
    });
    const pct = (rating) => totalResponded === 0 ? '-' : Math.round((totalCountByRating[rating] / totalResponded) * 1000) / 10;
    return {
      accountName: 'Org level',
      businessUnit: 'Org level',
      polled: totalPolled,
      responded: totalResponded,
      'Highly Satisfied': pct(5),
      'Satisfied': pct(4),
      'Neutral': pct(3),
      'Dissatisfied': pct(2),
      'Highly Dissatisfied': pct(1)
    };
  }, [trendTop10TableData]);

  // Summary row "Top 10 Accounts": grand total of Top 10 rows (same values as trendTop10OrgRow, labels for Trend Analysis table).
  const trendTop10AccountsSummaryRow = useMemo(() => {
    if (!trendTop10OrgRow) return null;
    return { ...trendTop10OrgRow, accountName: 'Top 10 Accounts', businessUnit: '' };
  }, [trendTop10OrgRow]);

  // Summary row "Other Accounts": grand total of rows where TYPE OF ACCOUNT = Blank/Empty/N/A. Same weighted % logic.
  const trendOtherAccountsSummaryRow = useMemo(() => {
    const rows = trendOtherAccountsTableData;
    if (!rows.length) {
      return {
        accountName: 'Other Accounts',
        businessUnit: '',
        polled: 0,
        responded: 0,
        'Highly Satisfied': '-',
        'Satisfied': '-',
        'Neutral': '-',
        'Dissatisfied': '-',
        'Highly Dissatisfied': '-'
      };
    }
    const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
    const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
    const totalCountByRating = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const colToRating = { 'Highly Satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Highly Dissatisfied': 1 };
    rows.forEach(row => {
      const responded = row.responded || 0;
      ratingCols.forEach(col => {
        const val = row[col];
        if (val != null && val !== '-' && typeof val === 'number' && responded > 0) {
          totalCountByRating[colToRating[col]] += (val / 100) * responded;
        }
      });
    });
    const pct = (rating) => totalResponded === 0 ? '-' : Math.round((totalCountByRating[rating] / totalResponded) * 1000) / 10;
    return {
      accountName: 'Other Accounts',
      businessUnit: '',
      polled: totalPolled,
      responded: totalResponded,
      'Highly Satisfied': pct(5),
      'Satisfied': pct(4),
      'Neutral': pct(3),
      'Dissatisfied': pct(2),
      'Highly Dissatisfied': pct(1)
    };
  }, [trendOtherAccountsTableData]);

  // Summary row "Overall": grand total of Top 10 + Other Accounts (all rows). Same weighted % logic.
  const trendOverallSummaryRow = useMemo(() => {
    const allRows = [...trendTop10TableData, ...trendOtherAccountsTableData];
    if (!allRows.length) return null;
    const totalPolled = allRows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = allRows.reduce((s, r) => s + (r.responded || 0), 0);
    const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
    const totalCountByRating = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const colToRating = { 'Highly Satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Highly Dissatisfied': 1 };
    allRows.forEach(row => {
      const responded = row.responded || 0;
      ratingCols.forEach(col => {
        const val = row[col];
        if (val != null && val !== '-' && typeof val === 'number' && responded > 0) {
          totalCountByRating[colToRating[col]] += (val / 100) * responded;
        }
      });
    });
    const pct = (rating) => totalResponded === 0 ? '-' : Math.round((totalCountByRating[rating] / totalResponded) * 1000) / 10;
    return {
      accountName: 'Overall',
      businessUnit: '',
      polled: totalPolled,
      responded: totalResponded,
      'Highly Satisfied': pct(5),
      'Satisfied': pct(4),
      'Neutral': pct(3),
      'Dissatisfied': pct(2),
      'Highly Dissatisfied': pct(1)
    };
  }, [trendTop10TableData, trendOtherAccountsTableData]);

  // Trend rating distribution: from trend file sheet "CSAT received Report" (e.g. Trend-Analysis-H12025.xlsx).
  // Consider only PERSPECTIVE = "Overall Experience". Group by BUSINESS UNIT. Count RATING 1..5.
  // RATING 1 = "Highly Dissatisfied", 2 = "Dissatisfied", 3 = "Neutral", 4 = "Satisfied", 5 = "Highly Satisfied".
  // Returns { businessUnit: { 1: count, 2: count, 3: count, 4: count, 5: count } }.
  const trendBuWiseRatingCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const t = String(s).trim();
      return t === 'CSAT received Report' || t === 'CSAT received Report ';
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const byBu = {};
    sheetData.forEach(row => {
      const perspective = String(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').trim();
      if (perspective !== 'Overall Experience') return;
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit']) || '';
      if (!buRaw) return;
      const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (![1, 2, 3, 4, 5].includes(rating)) return;
      if (!byBu[businessUnit]) byBu[businessUnit] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      byBu[businessUnit][rating]++;
    });
    return byBu;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Org-level rating counts: from trend file sheet "CSAT received Report" / "CSAT received Report ", PERSPECTIVE = "Overall Experience" only. Count RATING 1..5 across all rows (no group by BU). Used for Org level row: value = count(RATING=n)/#Responded*100.
  const trendBuWiseOrgLevelRatingCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const t = String(s).trim();
      return t === 'CSAT received Report' || t === 'CSAT received Report ';
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const firstRow = sheetData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    sheetData.forEach(row => {
      const perspective = String(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').trim();
      if (perspective !== 'Overall Experience') return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (![1, 2, 3, 4, 5].includes(rating)) return;
      counts[rating]++;
    });
    return counts;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend BU-wise table rows: merge sent/received with rating distribution. #Polled/#Responded from sheet "CSAT sent and received Report" (count(CSAT SENT DATE) and count(CSAT RECEIVED DATE) by BUSINESS UNIT); rating columns from sheet "CSAT received Report", PERSPECTIVE = "Overall Experience", value = count(RATING=n)/#Responded*100. Column names: Highly Satisfied (RATING=5), Satisfied (4), Neutral (3), Dissatisfied (2), Highly Dissatisfied (1).
  const trendBuWiseDistributionData = useMemo(() => {
    if (!trendBuWiseSentReceivedData.length) return [];
    return trendBuWiseSentReceivedData.map(row => {
      const counts = trendBuWiseRatingCounts[row.businessUnit] || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      // #Responded = count(CSAT RECEIVED DATE) from Sheet2 "CSAT sent and received Report" grouped by BUSINESS UNIT.
      const responded = row.responded != null ? row.responded : 0;
      const pct = (rating) => responded === 0 ? null : Math.round(((counts[rating] || 0) / responded) * 1000) / 10;
      return {
        businessUnit: row.businessUnit,
        polled: row.polled,
        responded,
        'Highly Satisfied': pct(5),
        'Satisfied': pct(4),
        'Neutral': pct(3),
        'Dissatisfied': pct(2),
        'Highly Dissatisfied': pct(1)
      };
    });
  }, [trendBuWiseSentReceivedData, trendBuWiseRatingCounts]);

  // Perspective order for Trend analysis (H2 Vs H1) – same as Satisfied Customers Each Perspective dashboard
  const PERSPECTIVE_ORDER = [
    'Overall Experience',
    'Timeline Adherence',
    'Quality of Delivery',
    'Timely Resource Fulfillment',
    'Resource Competency',
    'Risk Management & Responsiveness',
    'Thought Leadership'
  ];
  const normalizePerspective = (p) => {
    if (!p || typeof p !== 'string') return '';
    const s = String(p).trim();
    if (/overall\s*experience/i.test(s)) return 'Overall Experience';
    if (/timeline\s*adherence/i.test(s)) return 'Timeline Adherence';
    if (/quality\s*of\s*delivery|quality\s*of\s*deliverables/i.test(s)) return 'Quality of Delivery';
    if (/timely\s*resource\s*fulfillment/i.test(s)) return 'Timely Resource Fulfillment';
    if (/resource\s*competency/i.test(s)) return 'Resource Competency';
    if (/risk\s*management/i.test(s)) return 'Risk Management & Responsiveness';
    if (/thought\s*leadership/i.test(s)) return 'Thought Leadership';
    return s;
  };

  // Trend perspective % by BU (from trend file "CSAT received Report": count RATING 4 or 5 per perspective / responded × 100)
  const trendBuWisePerspectivePct = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted || !trendBuWiseSentReceivedData.length) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const byBu = {};
    sheetData.forEach(row => {
      const buRaw = (row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit']) || '';
      if (!buRaw) return;
      const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      if (!byBu[businessUnit]) byBu[businessUnit] = {};
      PERSPECTIVE_ORDER.forEach(p => { if (!byBu[businessUnit][p]) byBu[businessUnit][p] = 0; });
      byBu[businessUnit][perspective]++;
    });
    const respondedByBu = {};
    trendBuWiseSentReceivedData.forEach(r => { respondedByBu[r.businessUnit] = r.responded || 0; });
    const result = {};
    Object.keys(byBu).forEach(bu => {
      result[bu] = {};
      const responded = respondedByBu[bu] || 0;
      PERSPECTIVE_ORDER.forEach(p => {
        result[bu][p] = responded > 0 ? Math.round((byBu[bu][p] || 0) / responded * 100) : null;
      });
    });
    return result;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, trendBuWiseSentReceivedData]);

  // Trend perspective % at Org level (for Trend analysis H2 Vs H1 on Org row): weighted sum across BUs
  const trendOrgLevelPerspectivePct = useMemo(() => {
    if (!trendBuWiseSentReceivedData.length || !trendBuWisePerspectivePct || Object.keys(trendBuWisePerspectivePct).length === 0) return {};
    const totalResponded = trendBuWiseSentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    if (totalResponded === 0) return {};
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => {
      let totalSatisfied = 0;
      trendBuWiseSentReceivedData.forEach(row => {
        const responded = row.responded || 0;
        const pct = trendBuWisePerspectivePct[row.businessUnit]?.[p];
        if (pct != null && responded > 0) totalSatisfied += (pct / 100) * responded;
      });
      result[p] = Math.round(totalSatisfied / totalResponded * 100);
    });
    return result;
  }, [trendBuWiseSentReceivedData, trendBuWisePerspectivePct]);

  // Dashboard (main data) org-level perspective %: from sheet 1, filter date >= cycle, count RATING 4 or 5 per perspective; totalResponded from sheet 2
  const dashboardOrgLevelPerspectivePct = useMemo(() => {
    if (!uploadedData?.length || !csatCycleStartDateFormatted) return {};
    const firstRow = uploadedData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    let totalResponded = 0;
    if (excelData?.secondSheetData?.length) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const receivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        const receivedVal = (receivedKey ? row[receivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        let d = null;
        if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A') {
          d = parseExcelDateToMMDDYYYY(receivedVal);
        }
        if (isCompletedStatus && (d && isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted))) totalResponded++;
      });
    }
    const countByPerspective = {};
    PERSPECTIVE_ORDER.forEach(p => { countByPerspective[p] = 0; });
    uploadedData.forEach(row => {
      if (row['QUESTION_CATEGORY'] === 'Qualitative Feedback') return;
      if ((row['QUESTION_CATEGORY'] ?? row['Question Category']) !== 'Criteria') return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      if (sentDateKey && row[sentDateKey] != null && row[sentDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[sentDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      countByPerspective[perspective]++;
    });
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => {
      result[p] = totalResponded > 0 ? Math.round((countByPerspective[p] || 0) / totalResponded * 100) : null;
    });
    return result;
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Top 10 / Other customer ID sets from sheet 2 (for dashboard perspective % by segment)
  const top10AndOtherCustomerIds = useMemo(() => {
    const top10 = new Set();
    const other = new Set();
    if (!excelData?.secondSheetData?.length) return { top10, other };
    excelData.secondSheetData.forEach(row => {
      const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      const typeVal = (row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
      if (!custId) return;
      if (typeVal === 'Top 10' || typeVal.toUpperCase() === 'Y') top10.add(custId.toString());
      else if (typeVal === '' || /^n\/a$/i.test(typeVal) || typeVal === 'NA' || typeVal == null) other.add(custId.toString());
    });
    return { top10, other };
  }, [excelData?.secondSheetData]);

  // Dashboard perspective % for Top 10 accounts only (from sheet 1, filter by Top 10 CUSTOMER_ID; responded from sheet 2 TYPE = Top 10)
  const dashboardTop10PerspectivePct = useMemo(() => {
    if (!uploadedData?.length || !csatCycleStartDateFormatted || !excelData?.secondSheetData?.length) return {};
    const { top10 } = top10AndOtherCustomerIds;
    if (!top10.size) return {};
    const firstRow = uploadedData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const custIdCol = Object.keys(firstRow).find(k => k === 'CUST_ID' || k === 'CUSTOMER_ID') || 'CUSTOMER_ID';
    const receivedDateKey = Object.keys(firstRow).find(k => /csat received date|css_received_date/i.test(String(k)));
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date/i.test(String(k)));
    const typeCol = Object.keys(excelData.secondSheetData[0] || {}).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const receivedKeyS2 = Object.keys(excelData.secondSheetData[0] || {}).find(k => /csat received date|css_received_date/i.test(String(k)));
    let totalResponded = 0;
    excelData.secondSheetData.forEach(row => {
      const typeVal = (row[typeCol] ?? row['TYPE OF ACCOUNT'] ?? '').toString().trim();
      if (typeVal !== 'Top 10' && typeVal.toUpperCase() !== 'Y') return;
      const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      if (!custId || !top10.has(custId.toString())) return;
      const d = parseExcelDateToMMDDYYYY(receivedKeyS2 ? row[receivedKeyS2] : row['CSAT RECEIVED DATE']);
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (isCompletedStatus && (d && isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted))) totalResponded++;
    });
    const countByPerspective = {};
    PERSPECTIVE_ORDER.forEach(p => { countByPerspective[p] = 0; });
    uploadedData.forEach(row => {
      if ((row['QUESTION_CATEGORY'] ?? row['Question Category']) !== 'Criteria') return;
      const custId = (row[custIdCol] ?? row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
      if (!custId || !top10.has(custId)) return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      if (sentDateKey && row[sentDateKey] != null && row[sentDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[sentDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      countByPerspective[perspective]++;
    });
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => { result[p] = totalResponded > 0 ? Math.round((countByPerspective[p] || 0) / totalResponded * 100) : null; });
    return result;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, top10AndOtherCustomerIds]);

  // Dashboard perspective % for Other accounts only
  const dashboardOtherAccountsPerspectivePct = useMemo(() => {
    if (!uploadedData?.length || !csatCycleStartDateFormatted || !excelData?.secondSheetData?.length) return {};
    const { other } = top10AndOtherCustomerIds;
    if (!other.size) return {};
    const firstRow = uploadedData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const custIdCol = Object.keys(firstRow).find(k => k === 'CUST_ID' || k === 'CUSTOMER_ID') || 'CUSTOMER_ID';
    const receivedDateKey = Object.keys(firstRow).find(k => /csat received date|css_received_date/i.test(String(k)));
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date/i.test(String(k)));
    const typeCol = Object.keys(excelData.secondSheetData[0] || {}).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const receivedKeyS2 = Object.keys(excelData.secondSheetData[0] || {}).find(k => /csat received date|css_received_date/i.test(String(k)));
    let totalResponded = 0;
    excelData.secondSheetData.forEach(row => {
      const typeVal = (row[typeCol] ?? row['TYPE OF ACCOUNT'] ?? '').toString().trim();
      if (typeVal !== '' && !/^n\/a$/i.test(typeVal) && typeVal !== 'NA') return;
      const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      if (!custId || !other.has(custId.toString())) return;
      const d = parseExcelDateToMMDDYYYY(receivedKeyS2 ? row[receivedKeyS2] : row['CSAT RECEIVED DATE']);
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (isCompletedStatus && (d && isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted))) totalResponded++;
    });
    const countByPerspective = {};
    PERSPECTIVE_ORDER.forEach(p => { countByPerspective[p] = 0; });
    uploadedData.forEach(row => {
      if ((row['QUESTION_CATEGORY'] ?? row['Question Category']) !== 'Criteria') return;
      const custId = (row[custIdCol] ?? row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
      if (!custId || !other.has(custId)) return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      if (sentDateKey && row[sentDateKey] != null && row[sentDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[sentDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      countByPerspective[perspective]++;
    });
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => { result[p] = totalResponded > 0 ? Math.round((countByPerspective[p] || 0) / totalResponded * 100) : null; });
    return result;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, top10AndOtherCustomerIds]);

  // Trend perspective % for Top 10 aggregate (from trend file "CSAT received Report", TYPE OF ACCOUNT = "Top 10")
  const trendTop10PerspectivePct = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return {};
    const totalResponded = trendTop10SentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    if (totalResponded === 0) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().includes('csat received') && !String(s).toLowerCase().includes('sent and received'));
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|received date/i.test(String(k).toLowerCase()));
    const countByPerspective = {};
    PERSPECTIVE_ORDER.forEach(p => { countByPerspective[p] = 0; });
    sheetData.forEach(row => {
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').toString().trim();
      if (typeVal !== 'Top 10' && typeVal.toUpperCase() !== 'Y') return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      countByPerspective[perspective]++;
    });
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => { result[p] = Math.round((countByPerspective[p] || 0) / totalResponded * 100); });
    return result;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, trendTop10SentReceivedData]);

  // Trend perspective % for Other accounts aggregate
  const trendOtherAccountsPerspectivePct = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return {};
    const totalResponded = trendOtherAccountsSentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    if (totalResponded === 0) return {};
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().includes('csat received') && !String(s).toLowerCase().includes('sent and received'));
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return {};
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return {};
    const firstRow = sheetData[0] || {};
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k).replace(/\s/g, ' '))) || 'TYPE OF ACCOUNT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|received date/i.test(String(k).toLowerCase()));
    const countByPerspective = {};
    PERSPECTIVE_ORDER.forEach(p => { countByPerspective[p] = 0; });
    sheetData.forEach(row => {
      const typeVal = (row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').toString().trim();
      if (!isOtherTypeOfAccount(typeVal)) return;
      if (receivedDateKey && row[receivedDateKey] != null && row[receivedDateKey] !== '') {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (!d || !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '');
      if (!perspective || !PERSPECTIVE_ORDER.includes(perspective)) return;
      const rating = parseInt(row[ratingCol] ?? row['RATING'], 10);
      if (rating !== 4 && rating !== 5) return;
      countByPerspective[perspective]++;
    });
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => { result[p] = Math.round((countByPerspective[p] || 0) / totalResponded * 100); });
    return result;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, trendOtherAccountsSentReceivedData]);

  // Trend perspective % for Overall (Top 10 + Other) – weighted by responded
  const trendOverallPerspectivePctTop10View = useMemo(() => {
    const totalTop10 = trendTop10SentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    const totalOther = trendOtherAccountsSentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    const totalResponded = totalTop10 + totalOther;
    if (totalResponded === 0) return {};
    const result = {};
    PERSPECTIVE_ORDER.forEach(p => {
      const t10 = trendTop10PerspectivePct[p] != null ? trendTop10PerspectivePct[p] : 0;
      const tOther = trendOtherAccountsPerspectivePct[p] != null ? trendOtherAccountsPerspectivePct[p] : 0;
      const weighted = totalTop10 * (t10 / 100) + totalOther * (tOther / 100);
      result[p] = Math.round(weighted / totalResponded * 100);
    });
    return result;
  }, [trendTop10SentReceivedData, trendOtherAccountsSentReceivedData, trendTop10PerspectivePct, trendOtherAccountsPerspectivePct]);

  // Org-level row for Trend Analysis table: #Polled/#Responded = sum from Sheet2 "CSAT sent and received Report"; rating % from sheet "CSAT received Report", PERSPECTIVE = "Overall Experience", using same total #Responded as denominator.
  const trendBuWiseOrgRow = useMemo(() => {
    if (!trendBuWiseSentReceivedData.length) return null;
    const totalPolled = trendBuWiseSentReceivedData.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = trendBuWiseSentReceivedData.reduce((s, r) => s + (r.responded || 0), 0);
    if (totalResponded === 0) {
      return {
        businessUnit: 'Org level',
        polled: totalPolled,
        responded: totalResponded,
        'Highly Satisfied': null,
        'Satisfied': null,
        'Neutral': null,
        'Dissatisfied': null,
        'Highly Dissatisfied': null
      };
    }
    const counts = trendBuWiseOrgLevelRatingCounts;
    const pct = (rating) => totalResponded === 0 ? null : Math.round(((counts[rating] || 0) / totalResponded) * 1000) / 10;
    return {
      businessUnit: 'Org level',
      polled: totalPolled,
      responded: totalResponded,
      'Highly Satisfied': pct(5),
      'Satisfied': pct(4),
      'Neutral': pct(3),
      'Dissatisfied': pct(2),
      'Highly Dissatisfied': pct(1)
    };
  }, [trendBuWiseSentReceivedData, trendBuWiseOrgLevelRatingCounts]);

  // Process data for account-wise and BU-wise views
  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], ratingColumns: [] };
    
    // Counters for debugging - initialize at the beginning using var to avoid temporal dead zone
    var totalRatingsProcessed = 0;
    var ratingsFilteredByCSS = 0;
    var ratingsFilteredByTop10 = 0;
    var ratingsIncluded = 0;
    
    // Column names - prefer new names; support legacy (BUSSINESS UNIT → BUSINESS UNIT, CSS_* → CSAT * DATE, Top 10 → TYPE OF ACCOUNT, CUSTOMER NAME / CUST_NM same)
    const questionCategoryColumn = 'QUESTION_CATEGORY';
    const firstRowForCols = (uploadedData && uploadedData[0]) || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRowForCols, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const ratingColumn = 'RATING';
    const customerIdColumn = 'CUSTOMER_ID'; // when reading use CUST_ID ?? CUSTOMER_ID
    const customerNameColumn = 'CUSTOMER NAME'; // when reading use CUSTOMER NAME ?? CUST_NM

    // Get Top 10 customer IDs from second sheet (TYPE OF ACCOUNT = "Top 10" or Top 10 = "Y")
    const top10CustomerIds = new Set();
    const otherAccountCustomerIds = new Set();
    if (excelData && excelData.secondSheetData && showTop10) {
      excelData.secondSheetData.forEach(row => {
        const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        const typeOfAccountVal = (row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
        const isTop10 = typeOfAccountVal === 'Top 10' || typeOfAccountVal.toUpperCase() === 'Y';

        if (custId) {
          if (isTop10) {
            top10CustomerIds.add(custId.toString());
          } else if (typeOfAccountVal === '' || typeOfAccountVal === 'NA' || typeOfAccountVal === null) {
            otherAccountCustomerIds.add(custId.toString());
          }
        }
      });
      console.log('Top 10 customer IDs found:', Array.from(top10CustomerIds));
      console.log('Other Account customer IDs found:', Array.from(otherAccountCustomerIds));
    }

    // Create a map to track valid CSS date records for each customer
    const validCSSDateRecords = new Map();
    
    // If we have first sheet data and CSAT cycle start date, filter by CSS dates
    if (excelData && excelData.data && csatCycleStartDateFormatted) {
      console.log('=== CSS DATE FILTERING ===');
      console.log('Data Source: First sheet "CSAT received Report" from Excel file');
      console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);
      console.log('First sheet data length:', excelData.data.length);
      console.log('Filtering rule: Only include rating records where CSAT SENT DATE and CSAT RECEIVED DATE (or CSS_*) >= CSAT cycle start date (MM-DD-YYYY)');
      console.log('CSS dates are taken from the first sheet "CSAT received Report"');
      
      let totalRowsProcessed = 0;
      let validRowsCount = 0;
      let invalidSentDateCount = 0;
      let invalidReceivedDateCount = 0;
      let missingDatesCount = 0;
      
      excelData.data.forEach(row => {
        const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? row[customerIdColumn];
        if (!custId) return;
        
        totalRowsProcessed++;
        
        // Check if CSAT SENT DATE and CSAT RECEIVED DATE (or CSS_SENT_DATE/CSS_RECEIVED_DATE) are >= CSAT cycle start date; format MM-DD-YYYY for comparison
        let hasValidSentDate = false;
        let hasValidReceivedDate = false;
        const sentDateVal = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedDateVal = row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        
        if (sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A') {
          const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateVal);
          const isSentDateValid = sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
          if (isSentDateValid) {
            hasValidSentDate = true;
          } else {
            invalidSentDateCount++;
            if (custId.toString() === '202100065') {
              console.log(`❌ Invalid CSAT SENT DATE for customer ${custId}: "${sentDateVal}" -> "${sentDateFormatted}" (CSAT start: ${csatCycleStartDateFormatted})`);
            }
          }
        } else {
          missingDatesCount++;
        }
        
        if (receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A') {
          const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateVal);
          const isReceivedDateValid = receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
          if (isReceivedDateValid) {
            hasValidReceivedDate = true;
          } else {
            invalidReceivedDateCount++;
            if (custId.toString() === '202100065') {
              console.log(`❌ Invalid CSAT RECEIVED DATE for customer ${custId}: "${receivedDateVal}" -> "${receivedDateFormatted}" (CSAT start: ${csatCycleStartDateFormatted})`);
            }
          }
        } else {
          missingDatesCount++;
        }
        
                 // Debug logging for customer 202100065
         if (custId.toString() === '202100065') {
           console.log(`CSAT Date Check for Customer ${custId}:`);
           console.log(`  CSAT SENT DATE: ${sentDateVal} -> hasValidSentDate: ${hasValidSentDate}`);
           console.log(`  CSAT RECEIVED DATE: ${receivedDateVal} -> hasValidReceivedDate: ${hasValidReceivedDate}`);
           console.log(`  CSAT Cycle Start Date: ${csatCycleStartDateFormatted}`);
           console.log(`  Will be included: ${hasValidSentDate && hasValidReceivedDate}`);
           if (sentDateVal) {
             const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateVal);
             console.log(`  CSAT SENT DATE formatted (MM-DD-YYYY): ${sentDateFormatted}`);
           }
           if (receivedDateVal) {
             const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateVal);
             console.log(`  CSAT RECEIVED DATE formatted (MM-DD-YYYY): ${receivedDateFormatted}`);
           }
         }
        
        // Include this record if both dates are valid (AND condition)
        if (hasValidSentDate && hasValidReceivedDate) {
          if (!validCSSDateRecords.has(custId.toString())) {
            validCSSDateRecords.set(custId.toString(), []);
          }
          validCSSDateRecords.get(custId.toString()).push(row);
          validRowsCount++;
        }
      });
      
      console.log(`CSS Date Filtering Results:`);
      console.log(`- Total rows processed: ${totalRowsProcessed}`);
      console.log(`- Valid rows (both dates >= CSAT start): ${validRowsCount}`);
      console.log(`- Invalid CSAT SENT DATE: ${invalidSentDateCount}`);
      console.log(`- Invalid CSAT RECEIVED DATE: ${invalidReceivedDateCount}`);
      console.log(`- Missing dates: ${missingDatesCount}`);
      console.log(`- Unique customers with valid CSS dates: ${validCSSDateRecords.size}`);
      console.log('Sample valid customer IDs:', Array.from(validCSSDateRecords.keys()).slice(0, 10));
      console.log(`CSAT Cycle Start Date: ${csatCycleStartDateFormatted}`);
      
      // Log sample date parsing for debugging
      if (excelData.data && excelData.data.length > 0) {
        console.log('Sample CSS date parsing:');
        const sampleRow = excelData.data[0];
        if (sampleRow['CSAT SENT DATE']) {
          const sampleSentFormatted = parseExcelDateToMMDDYYYY(sampleRow['CSAT SENT DATE']);
          console.log(`  Sample CSAT SENT DATE: "${sampleRow['CSAT SENT DATE']}" (type: ${typeof sampleRow['CSAT SENT DATE']}) -> "${sampleSentFormatted}"`);
        }
        if (sampleRow['CSAT RECEIVED DATE']) {
          const sampleReceivedFormatted = parseExcelDateToMMDDYYYY(sampleRow['CSAT RECEIVED DATE']);
          console.log(`  Sample CSAT RECEIVED DATE: "${sampleRow['CSAT RECEIVED DATE']}" (type: ${typeof sampleRow['CSAT RECEIVED DATE']}) -> "${sampleReceivedFormatted}"`);
        }
        
        // Show more sample rows to understand the data pattern
        console.log('First 3 rows of CSS date data:');
        excelData.data.slice(0, 3).forEach((row, index) => {
          console.log(`  Row ${index + 1}:`);
          console.log(`    CUSTOMER_ID: ${row['CUST_ID'] ?? row['CUSTOMER_ID']}`);
          console.log(`    CSAT SENT DATE: "${row['CSAT SENT DATE']}" (type: ${typeof row['CSAT SENT DATE']})`);
          console.log(`    CSAT RECEIVED DATE: "${row['CSAT RECEIVED DATE']}" (type: ${typeof row['CSAT RECEIVED DATE']})`);
        });
      }
      
      // Check if customer 202100065 has valid CSS date records
      if (validCSSDateRecords.has('202100065')) {
        console.log(`✅ Customer 202100065 has ${validCSSDateRecords.get('202100065').length} valid CSS date records`);
      } else {
        console.log('❌ Customer 202100065 has NO valid CSS date records');
        console.log('This means customer 202100065 will be filtered out due to CSS date filtering');
      }
      
      console.log(`\n📊 CSS Date Filtering Summary:`);
      console.log(`- CSAT Cycle Start Date: ${csatCycleStartDateFormatted}`);
      console.log(`- Total customers with valid CSS dates: ${validCSSDateRecords.size}`);
      console.log(`- This means only these ${validCSSDateRecords.size} customers will have their ratings counted`);
      console.log(`- All other customers will be excluded from rating calculations`);
      
      // Additional debugging for CSS date filtering
      console.log(`\n🔍 CSS Date Filtering Debug Info:`);
      console.log(`- Second sheet data available: ${excelData && excelData.secondSheetData ? 'Yes' : 'No'}`);
      console.log(`- Second sheet data length: ${excelData && excelData.secondSheetData ? excelData.secondSheetData.length : 0}`);
      console.log(`- CSAT cycle start date: ${csatCycleStartDateFormatted}`);
      console.log(`- CSS date filtering will be applied: ${validCSSDateRecords.size > 0 ? 'Yes' : 'No'}`);
      
      if (validCSSDateRecords.size === 0) {
        console.log(`\n⚠️ WARNING: CSS Date Filtering is NOT working!`);
        console.log(`This means ALL ratings will be counted regardless of CSS dates.`);
        console.log(`Possible causes:`);
        console.log(`1. No customers have both CSAT SENT DATE and CSAT RECEIVED DATE >= ${csatCycleStartDateFormatted}`);
        console.log(`2. CSS dates are in an unexpected format`);
        console.log(`3. Customer ID mismatch between sheets`);
        console.log(`4. Missing or invalid CSS date columns`);
      }
      
      // Show sample of valid customers
      if (validCSSDateRecords.size > 0) {
        console.log('Sample valid customers:', Array.from(validCSSDateRecords.keys()).slice(0, 5));
        
        // Check if any of the valid customers exist in the rating data
        const validCustomerIds = Array.from(validCSSDateRecords.keys());
        const ratingDataCustomerIds = uploadedData.map(row => row['CUST_ID'] ?? row['CUSTOMER_ID']).filter(id => id && id !== 'Unknown');
        const matchingCustomers = validCustomerIds.filter(id => ratingDataCustomerIds.includes(id));
        console.log(`- Valid customers that exist in rating data: ${matchingCustomers.length}`);
        console.log(`- Sample matching customers:`, matchingCustomers.slice(0, 3));
      } else {
        console.log('⚠️ WARNING: No customers have valid CSS dates! This means NO ratings will be counted.');
        console.log('This could be due to:');
        console.log('1. CSS dates are in an unexpected format');
        console.log('2. CSAT cycle start date is too restrictive');
        console.log('3. CSAT SENT DATE or CSAT RECEIVED DATE columns are missing or empty');
        console.log('4. Customer ID mismatch between sheets');
        
        // Show sample customer IDs from the first sheet for comparison
        const firstSheetCustomerIds = uploadedData.map(row => row['CUST_ID'] ?? row['CUSTOMER_ID']).filter(id => id && id !== 'Unknown').slice(0, 5);
        console.log('Sample customer IDs from first sheet (both CSS dates and ratings):', firstSheetCustomerIds);
      }
    } else {
      console.log('CSS Date Filtering: Not applied (missing first sheet data or CSAT cycle start date)');
      console.log('- First sheet data available:', excelData && excelData.data ? 'Yes' : 'No');
      console.log('- CSAT cycle start date available:', csatCycleStartDateFormatted ? 'Yes' : 'No');
      console.log('- This means ALL ratings will be counted without CSS date filtering');
    }

    console.log('=== PROCESSING CSAT SCORE DISTRIBUTION DATA ===');
    console.log(`\n📊 Final Rating Processing Summary:`);
    console.log(`- Total ratings processed: ${totalRatingsProcessed}`);
    console.log(`- Ratings filtered by CSS dates: ${ratingsFilteredByCSS}`);
    console.log(`- Ratings filtered by Top 10: ${ratingsFilteredByTop10}`);
    console.log(`- Ratings included in final count: ${ratingsIncluded}`);
    console.log(`- CSS date filtering applied: ${validCSSDateRecords.size > 0 ? 'Yes' : 'No'}`);
    console.log(`- Valid CSS date customers: ${validCSSDateRecords.size}`);
    
    if (validCSSDateRecords.size > 0) {
      console.log(`✅ CSS Date Filtering is WORKING - Only ratings from customers with valid CSS dates are counted`);
    } else {
      console.log(`❌ CSS Date Filtering is NOT WORKING - All ratings are being counted regardless of CSS dates`);
    }
    console.log('Input data length:', uploadedData.length);
    console.log('Purpose: Calculate count/percentage of each rating value (1,2,3,4,5) grouped by customer or business unit');
    console.log('Formula: BU-wise = Count of rating value, Account-wise = (count of rating value / Number of CSAT Surveys Received) * 100');
    console.log('Example: BU-wise shows count (5), Account-wise shows percentage (25.00%)');
    console.log('Data Source: "CSAT received Report" sheet from Excel file');
    console.log('CSS Date Filtering: Only includes ratings from rows with valid CSAT SENT DATE AND CSAT RECEIVED DATE >= CSAT cycle start date');
    console.log('CSS Date Source: First sheet "CSAT received Report" from Excel file');
    console.log('');
    console.log('DETAILED EXPLANATION:');
    console.log('- BU-wise: Each row represents one business unit (grouped by BUSINESS UNIT)');
    console.log('- Account-wise: Each row represents one customer (grouped by CUSTOMER_ID)');
    console.log('- BU-wise Formula: (count of rating value / Number of CSAT Surveys Received) * 100 (only PERSPECTIVE="Overall Experience")');
    console.log('- Account-wise Formula: (count of rating value / Number of CSAT Surveys Received) * 100 (only PERSPECTIVE="Overall Experience")');
    console.log('- Example: If business unit has ratings [1,1,1,2,3,4,4,5] and received 8 surveys:');
    console.log('  * BU-wise "Highly Dissatisfied" (rating=1) column will show: 37.50% (3/8 * 100)');
    console.log('  * Account-wise "Highly Dissatisfied" (rating=1) column will show: 37.50% (3/8 * 100)');
    console.log('');
    console.log('COLUMN MAPPING:');
    console.log('  Rating 1 → "Highly Dissatisfied" column (shows percentage)');
    console.log('  Rating 2 → "Dissatisfied" column (shows percentage)');
    console.log('  Rating 3 → "Neutral" column (shows percentage)');
    console.log('  Rating 4 → "Satisfied" column (shows percentage)');
    console.log('  Rating 5 → "Highly Satisfied" column (shows percentage)');
    console.log('');
    
    // Count raw ratings for customer 202100065 before any filtering
    const customer202100065RawRatings = uploadedData.filter(row => {
      const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
      return customerId === '202100065';
    });
    console.log(`=== CUSTOMER 202100065 RAW DATA ANALYSIS ===`);
    console.log(`Total raw rows found for customer 202100065: ${customer202100065RawRatings.length}`);
    if (customer202100065RawRatings.length > 0) {
      const rawRatings = customer202100065RawRatings.map(row => parseInt(row['RATING'])).filter(r => !isNaN(r) && r >= 1 && r <= 5);
      console.log(`Raw ratings found: [${rawRatings.join(', ')}]`);
      const ratingCounts = {};
      rawRatings.forEach(rating => {
        ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
      });
      console.log('Raw rating counts:', ratingCounts);
      console.log('Expected: Rating=1:0, Rating=2:0, Rating=3:1, Rating=4:4, Rating=5:0');
    } else {
      console.log('❌ No raw data found for customer 202100065 in uploaded data');
    }
    console.log('===============================================');
    console.log('');

    // Column names already declared at the beginning of useMemo

    // Get unique rating values (5, 4, 3, 2, 1) - ordered from Highly Satisfied to Highly Dissatisfied
    const uniqueRatings = [...new Set(uploadedData.map(row => parseInt(row[ratingColumn])).filter(r => !isNaN(r) && r >= 1 && r <= 5))].sort((a, b) => b - a);
    console.log('Unique rating values found:', uniqueRatings);

    // RATING column (CSAT received Report) → display column name (dashboard + Excel)
    // 1 = Highly Dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Highly Satisfied
    const ratingColumnMapping = {
      5: 'Highly Satisfied',
      4: 'Satisfied',
      3: 'Neutral',
      2: 'Dissatisfied',
      1: 'Highly Dissatisfied'
    };
    // Always show all five rating columns so "Highly Dissatisfied" etc. get a % even when count is 0
    const allRatingColumns = [5, 4, 3, 2, 1];

    if (showBuWise) {
      // BU Wise Overall CSAT score - Distribution (Score 1 to 5):
      // Source: 1st sheet "CSAT received Report". Consider only PERSPECTIVE="Overall Experience". Group by BUSINESS UNIT.
      // Include only rows where both CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY).
      // Column names: RATING 1="Highly Dissatisfied", 2="Dissatisfied", 3="Neutral", 4="Satisfied", 5="Highly Satisfied".
      // Value = count(RATING=x)/Responded*100. # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", group by BUSINESS UNIT. Responded, Polled from same sheet by BUSINESS UNIT.
      const buGroups = new Map();
      const firstRowSample = uploadedData[0] || {};
      const firstSheetSentKey = Object.keys(firstRowSample).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const firstSheetReceivedKey = Object.keys(firstRowSample).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const buCSSCounts = {}; // Polled/Responded from 2nd sheet "CSAT sent and received Report" by BUSINESS UNIT
      const buCustomerCountFromSecondSheet = {}; // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", group by BUSINESS UNIT
      if (excelData && excelData.secondSheetData && excelData.secondSheetData.length > 0) {
        const secondFirst = excelData.secondSheetData[0] || {};
        const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
        const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
        const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
        excelData.secondSheetData.forEach(row => {
          const businessUnit = (secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '';
          if (!businessUnit || businessUnit === 'N/A') return;
          if (!buCSSCounts[businessUnit]) buCSSCounts[businessUnit] = { cssSentCount: 0, cssReceivedCount: 0 };
          if (!buCustomerCountFromSecondSheet[businessUnit]) buCustomerCountFromSecondSheet[businessUnit] = new Set();
          const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
          if (custId && custId !== '') buCustomerCountFromSecondSheet[businessUnit].add(custId);
          const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
          const isCompletedStatus = statusVal === 'completed';
          if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A') buCSSCounts[businessUnit].cssSentCount++;
          if (isCompletedStatus && (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A')) buCSSCounts[businessUnit].cssReceivedCount++;
        });
      }

      uploadedData.forEach(row => {
        // Skip qualitative feedback rows and only process Criteria rows
        if (row[questionCategoryColumn] === 'Qualitative Feedback') {
          return;
        }
        
        // Only process rows where QUESTION_CATEGORY = "Criteria"
        if (row[questionCategoryColumn] !== 'Criteria') {
          return;
        }
        
        // Consider only PERSPECTIVE="Overall Experience" for rating % calculation
        const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
        if (perspectiveVal !== 'Overall Experience') {
          return;
        }

        const businessUnit = row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A';
        const ratingResolved = parseInt(row[ratingColumn], 10);
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? 'Unknown';
        const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';

        if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;
        
        totalRatingsProcessed++;

        // Filter by CSS dates if enabled - only count when BOTH dates >= cycle start (first sheet)
        let hasValidSentDate = true;
        let hasValidReceivedDate = true;
        if (csatCycleStartDateFormatted) {
          const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const hasSent = sentVal != null && sentVal !== '' && sentVal !== 'N/A';
          const hasReceived = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A';
          hasValidSentDate = !hasSent || (parseExcelDateToMMDDYYYY(sentVal) && isDateGreaterThanOrEqual(parseExcelDateToMMDDYYYY(sentVal), csatCycleStartDateFormatted));
          hasValidReceivedDate = !hasReceived || (parseExcelDateToMMDDYYYY(receivedVal) && isDateGreaterThanOrEqual(parseExcelDateToMMDDYYYY(receivedVal), csatCycleStartDateFormatted));
          if (!hasValidSentDate || !hasValidReceivedDate) {
            ratingsFilteredByCSS++;
            if (customerId === '202100065') {
              console.log(`BU-wise: Customer ${customerId} rating filtered out due to CSS date filtering`);
              console.log(`  Sent: "${sentVal}" -> valid: ${hasValidSentDate}, Received: "${receivedVal}" -> valid: ${hasValidReceivedDate}`);
            }
            return;
          }
        } else {
          if (customerId === '202100065') {
            console.log(`⚠️ BU-wise: CSS Date Filtering NOT applied - customer ${customerId} rating ${ratingResolved} will be counted`);
          }
        }

        if (!buGroups.has(businessUnit)) {
          buGroups.set(businessUnit, {
            businessUnit,
            customers: new Set(),
            ratings: {}
          });
        }

        const group = buGroups.get(businessUnit);
        // Count unique customers by CUSTOMER_ID only (not by CUSTOMER_ID + CUSTOMER_NAME combination)
        group.customers.add(customerId);

        // Count ratings - increment count for each rating value (1, 2, 3, 4, 5); use ratingResolved (handles string "4" etc.)
        if (!group.ratings[ratingResolved]) {
          group.ratings[ratingResolved] = 0;
        }
        group.ratings[ratingResolved]++;
        
        // Debug logging for first few business units
        if (businessUnit === 'India & GCC' && group.ratings[ratingResolved] <= 10) {
          console.log(`BU ${businessUnit}: Rating ${ratingResolved} count = ${group.ratings[ratingResolved]} (Customer: ${customerId}, Total ratings processed so far: ${Object.values(group.ratings).reduce((sum, count) => sum + count, 0)})`);
        }
      });

      // Include all BUs from first sheet (buGroups) and second sheet (buCSSCounts) so rows with Responded=0 are still shown with hyphen (-)
      const allBuKeys = new Set([...buGroups.keys(), ...Object.keys(buCSSCounts || {})]);
      const result = Array.from(allBuKeys).map((businessUnit, index) => {
        const group = buGroups.get(businessUnit);
        const row = {
          sNo: index + 1,
          businessUnit,
          customerCount: buCustomerCountFromSecondSheet[businessUnit]?.size ?? 0,
          cssSentCount: buCSSCounts[businessUnit]?.cssSentCount || 0,
          cssReceivedCount: buCSSCounts[businessUnit]?.cssReceivedCount || 0
        };
        const responded = row.cssReceivedCount || 0;
        // When Responded=0 show hyphen (-) for all distribution columns. Else percentage (1 decimal).
        allRatingColumns.forEach(rating => {
          const count = group ? (group.ratings[rating] || 0) : 0;
          row[ratingColumnMapping[rating]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
        });

        if (index === 0 && group) {
          console.log(`Sample BU ${businessUnit}:`);
          console.log(`- # Accounts Polled (from 2nd sheet): ${row.customerCount}`);
          console.log(`- Rating counts:`, group.ratings);
        }

        return row;
      });

             console.log(`=== BU-WISE DATA PROCESSING COMPLETE ===`);
       console.log(`Total business units processed: ${result.length}`);
       console.log(`CSS date filtering applied: ${validCSSDateRecords.size > 0 ? 'Yes' : 'No'}`);
      
      // Calculate total unique customers across all BUs
      const totalUniqueCustomers = result.reduce((sum, row) => sum + row.customerCount, 0);
      console.log(`Total unique customers across all BUs: ${totalUniqueCustomers}`);
      
      // Calculate total ratings processed
      const totalRatingsProcessedBU = result.reduce((sum, row) => {
        return sum + allRatingColumns.reduce((ratingSum, rating) => {
          const columnName = ratingColumnMapping[rating];
          return ratingSum + (row[columnName] || 0);
        }, 0);
      }, 0);
      console.log(`Total ratings processed across all BUs: ${totalRatingsProcessedBU}`);
      
      // Sort by BUSINESS UNIT order: Healthcare, CIT, Tech, India & GCC, Sead
      const sortedResult = result.sort((a, b) => {
        const indexA = getBusinessUnitOrderIndex(a.businessUnit);
        const indexB = getBusinessUnitOrderIndex(b.businessUnit);
        if (indexA !== indexB) return indexA - indexB;
        return (a.businessUnit || '').localeCompare(b.businessUnit || '');
      });
      
      // Update S.No. after sorting
      const finalResult = sortedResult.map((item, index) => ({
        ...item,
        sNo: index + 1
      }));

      // Org-level raw counts from first sheet (for accurate 1-decimal org row: sum of rating counts across BUs, not recomputed from rounded BU %)
      let orgTotalResponded = 0;
      let orgTotalPolled = 0;
      let orgTotalCustomerCount = 0;
      const orgCountByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      finalResult.forEach(r => {
        orgTotalResponded += r.cssReceivedCount || 0;
        orgTotalPolled += r.cssSentCount || 0;
        orgTotalCustomerCount += r.customerCount ?? 0;
      });
      buGroups.forEach((group) => {
        [1, 2, 3, 4, 5].forEach(r => {
          orgCountByRating[r] += group.ratings[r] || 0;
        });
      });

      return {
        data: finalResult,
        ratingColumns: allRatingColumns,
        buWiseOrgLevelCounts: { countByRating: orgCountByRating, totalResponded: orgTotalResponded, totalPolled: orgTotalPolled, totalCustomerCount: orgTotalCustomerCount }
      };
    } else {
      // Top 10 / Account-wise Overall CSAT score - Distribution (Score 1 to 5):
      // Source: 1st sheet "CSAT received Report". Consider only PERSPECTIVE="Overall Experience". Group by CUSTOMER_ID/CUST_ID.
      // Include only rows where both CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY).
      // Column names: RATING 1="Highly Dissatisfied", 2="Dissatisfied", 3="Neutral", 4="Satisfied", 5="Highly Satisfied".
      // Value = count(RATING=x)/Responded*100. Polled and Responded from 2nd sheet "CSAT sent and received Report" by CUSTOMER_ID/CUST_ID.
      const customerGroups = new Map();
      const firstRowSample = uploadedData[0] || {};
      const firstSheetSentKey = Object.keys(firstRowSample).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const firstSheetReceivedKey = Object.keys(firstRowSample).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const customerPolledRespondedFromSecondSheet = {}; // Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) per CUSTOMER_ID/CUST_ID from 2nd sheet
      const customerInfoFromSecondSheet = {}; // accountName, businessUnit from 2nd sheet (first occurrence per custId) for accounts that may have Responded=0
      if (excelData && excelData.secondSheetData && excelData.secondSheetData.length > 0) {
        const secondFirst = excelData.secondSheetData[0] || {};
        const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
        const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
        const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
        const secondNameKey = Object.keys(secondFirst).find(k => /customer name|cust_nm|customername/i.test(String(k)));
        excelData.secondSheetData.forEach(row => {
          const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
          if (!custId) return;
          if (!customerPolledRespondedFromSecondSheet[custId]) {
            customerPolledRespondedFromSecondSheet[custId] = { cssSentCount: 0, cssReceivedCount: 0 };
            customerInfoFromSecondSheet[custId] = {
              accountName: (secondNameKey ? row[secondNameKey] : null) ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? custId,
              businessUnit: (secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A'
            };
          }
          const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
          const isCompletedStatus = statusVal === 'completed';
          if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A') customerPolledRespondedFromSecondSheet[custId].cssSentCount++;
          if (isCompletedStatus && (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A')) customerPolledRespondedFromSecondSheet[custId].cssReceivedCount++;
        });
      }

      uploadedData.forEach(row => {
        if (row[questionCategoryColumn] === 'Qualitative Feedback') return;
        if (row[questionCategoryColumn] !== 'Criteria') return;
        const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
        if (perspectiveVal !== 'Overall Experience') return;

        const customerId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (!customerId || customerId === 'Unknown') return;

        const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const bothDatesValid = csatCycleStartDateFormatted && sentFormatted && receivedFormatted &&
          isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted) &&
          isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted);

        if (csatCycleStartDateFormatted && !bothDatesValid) {
          totalRatingsProcessed++;
          ratingsFilteredByCSS++;
          return;
        }

        if (showTop10 && top10CustomerIds.size > 0 && !top10CustomerIds.has(customerId)) {
          ratingsFilteredByTop10++;
          return;
        }

        const ratingResolved = parseInt(row[ratingColumn], 10);
        if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

        totalRatingsProcessed++;
        ratingsIncluded++;

        if (!customerGroups.has(customerId)) {
          customerGroups.set(customerId, {
            customerId,
            customerName: row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A',
            businessUnit: row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A',
            ratings: {},
            responded: 0,
            polled: 0
          });
        }
        const group = customerGroups.get(customerId);
        group.responded++;
        const sentOk = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        if (sentOk) group.polled++;
        if (!group.ratings[ratingResolved]) group.ratings[ratingResolved] = 0;
        group.ratings[ratingResolved]++;
      });

      // Process Other Accounts from first sheet only: same (count/Responded)*100, both dates >= cycle start
      let otherAccountGroup = null;
      if (showTop10 && otherAccountCustomerIds.size > 0) {
        otherAccountGroup = {
          customerId: 'OTHER',
          customerName: 'Other Accounts',
          businessUnit: '',
          ratings: {},
          responded: 0,
          polled: 0
        };
        uploadedData.forEach(row => {
          if (row[questionCategoryColumn] === 'Qualitative Feedback' || row[questionCategoryColumn] !== 'Criteria') return;
          const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
          if (perspectiveVal !== 'Overall Experience') return;
          const customerId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
          if (!customerId || !otherAccountCustomerIds.has(customerId)) return;
          const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
          const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
          const bothDatesValid = csatCycleStartDateFormatted && sentFormatted && receivedFormatted &&
            isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted) &&
            isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted);
          if (csatCycleStartDateFormatted && !bothDatesValid) return;
          const ratingResolved = parseInt(row[ratingColumn], 10);
          if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;
          otherAccountGroup.responded++;
          if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) otherAccountGroup.polled++;
          otherAccountGroup.ratings[ratingResolved] = (otherAccountGroup.ratings[ratingResolved] || 0) + 1;
        });
        otherAccountGroup.cssSentCount = 0;
        otherAccountGroup.cssReceivedCount = 0;
        otherAccountCustomerIds.forEach(custId => {
          const c = customerPolledRespondedFromSecondSheet[custId];
          if (c) {
            otherAccountGroup.cssSentCount += c.cssSentCount || 0;
            otherAccountGroup.cssReceivedCount += c.cssReceivedCount || 0;
          }
        });
      }

      // Include all customers from second sheet (even Responded=0); show hyphen (-) for distribution when Responded=0
      const allCustIds = showTop10 && top10CustomerIds.size > 0
        ? Array.from(top10CustomerIds).filter(id => customerPolledRespondedFromSecondSheet[id])
        : Object.keys(customerPolledRespondedFromSecondSheet);
      const result = allCustIds.map((custId, index) => {
        const group = customerGroups.get(custId);
        const secondSheetCounts = customerPolledRespondedFromSecondSheet[custId];
        const infoFromSheet2 = customerInfoFromSecondSheet[custId];
        const row = {
          sNo: index + 1,
          customerId: custId,
          customerName: group ? group.customerName : (infoFromSheet2?.accountName ?? custId),
          businessUnit: group ? group.businessUnit : (infoFromSheet2?.businessUnit ?? 'N/A'),
          cssSentCount: secondSheetCounts?.cssSentCount ?? 0,
          cssReceivedCount: secondSheetCounts?.cssReceivedCount ?? 0
        };
        const responded = row.cssReceivedCount || 0;
        // When Responded=0 show hyphen (-) for all distribution columns; else percentage (1 decimal)
        allRatingColumns.forEach(rating => {
          const count = group ? (group.ratings[rating] || 0) : 0;
          row[ratingColumnMapping[rating]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
        });

        if (index === 0 && group) {
          console.log(`Sample Customer ${group.customerId} (${group.customerName}) rating counts:`, group.ratings);
          console.log(`Total CSAT Surveys Received: ${row.cssReceivedCount}`);
        }
        if (custId === '202100065' && group) {
          console.log(`=== CUSTOMER 202100065 VERIFICATION ===`);
          console.log(`Customer ${group.customerId} (${group.customerName}) rating counts:`, group.ratings);
          console.log(`Total CSAT Surveys Received: ${row.cssReceivedCount}`);
        }

        return row;
      });

             console.log(`=== ACCOUNT-WISE DATA PROCESSING COMPLETE ===`);
       console.log(`Total customers processed: ${result.length}`);
       console.log(`CSS date filtering applied: ${validCSSDateRecords.size > 0 ? 'Yes' : 'No'}`);
       console.log(`Top 10 filtering applied: ${showTop10 ? 'Yes' : 'No'}`);
       if (validCSSDateRecords.size > 0) {
         console.log(`CSS Date Filtering Impact: Only customers with valid CSS dates are included`);
         console.log(`Total customers with valid CSS dates: ${validCSSDateRecords.size}`);
         console.log(`CSAT Cycle Start Date: ${csatCycleStartDateFormatted}`);
       }
       console.log(`Data Source: "CSAT received Report" sheet grouped by CUSTOMER_ID`);
       console.log(`CSS Date Source: Second sheet "CSAT sent and received Report" for filtering`);
       console.log(`Rating Columns: Each column shows count of that rating value for each customer`);
       console.log(`Formula: Count of rating value (not percentage)`);
       console.log(`Example: If customer has 5 ratings of "1", "Highly Dissatisfied" column shows 5`);
       console.log('');
       console.log('FINAL RESULT SUMMARY:');
       console.log('- Each row = One customer (grouped by CUSTOMER_ID)');
       console.log('- Each rating column = Count of that rating value for that customer');
       console.log('- Formula: Count of rating value (not percentage)');
       console.log('- Column names: "Highly Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Highly Satisfied"');
       console.log('- Values: Count of rating values 1, 2, 3, 4, 5 respectively (e.g., 5, 3, 1, 2, 1)');
       console.log('- CSS Date Filtering: Only ratings from customers with CSAT SENT DATE and CSAT RECEIVED DATE >= CSAT cycle start date');
      
      // Calculate total ratings processed
      const totalRatingsProcessedAccount = result.reduce((sum, row) => {
        return sum + uniqueRatings.reduce((ratingSum, rating) => {
          const columnName = ratingColumnMapping[rating];
          return ratingSum + (row[columnName] || 0);
        }, 0);
      }, 0);
      console.log(`Total ratings processed across all customers: ${totalRatingsProcessedAccount}`);
      
      // Add Other Account row if it exists
      let finalResult = result.sort((a, b) => a.customerId.localeCompare(b.customerId));
      
      if (otherAccountGroup) {
        console.log('=== ADDING OTHER ACCOUNT ROW ===');
        const otherAccountRow = {
          sNo: finalResult.length + 1,
          customerId: otherAccountGroup.customerId,
          customerName: otherAccountGroup.customerName,
          businessUnit: otherAccountGroup.businessUnit,
          cssSentCount: otherAccountGroup.cssSentCount,
          cssReceivedCount: otherAccountGroup.cssReceivedCount
        };
        
        // When Responded=0 show hyphen (-); else percentage (1 decimal)
        const otherResponded = otherAccountRow.cssReceivedCount || 0;
        allRatingColumns.forEach(rating => {
          const count = otherAccountGroup.ratings[rating] || 0;
          otherAccountRow[ratingColumnMapping[rating]] = otherResponded > 0 ? Math.round((count / otherResponded) * 1000) / 10 : '-';
        });
        
        finalResult.push(otherAccountRow);
        console.log('Other Account row added:', otherAccountRow);
        console.log('=== END ADDING OTHER ACCOUNT ROW ===');
      }
      
      return { data: finalResult, ratingColumns: allRatingColumns };
    }
  }, [uploadedData, showBuWise, showTop10, excelData, csatCycleStartDateFormatted]);

  // Fully Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
  // Data: Sheet 1 "CSAT received Report" – ENGAGEMENT TYPE = "Fully Managed", PERSPECTIVE = "Overall Experience", group by CUSTOMER_ID/CUST_ID.
  // Responded from Sheet 2 "CSAT sent and received Report" – ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID, date >= CSAT cycle start.
  // Columns: Sr.No., Account Name, BUSINESS UNIT, Highly Dissatisfied (%), Dissatisfied (%), Neutral (%), Satisfied (%), Highly Satisfied (%).
  // Column order: Highly Satisfied, Satisfied, Neutral, Dissatisfied, Highly Dissatisfied (dashboard + Excel)
  const RATING_DISPLAY_ORDER = [5, 4, 3, 2, 1];
  const RATING_COLUMN_NAMES = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
  // Distribution % display: one decimal place (e.g. 75.5%)
  const formatDistributionOneDecimal = (val) => {
    if (val == null || val === '' || val === '-') return '-';
    const n = parseFloat(val);
    return isNaN(n) ? '-' : (Math.round(n * 10) / 10).toFixed(1);
  };
  // Round to one decimal for Excel (value 37.5 → 0.375 for numFmt 0.0% → displays 37.5%)
  const roundDistributionForExcel = (v) => typeof v === 'number' ? (Math.round(v * 10) / 10) / 100 : v;
  // Lookup trend row by BU for Trend columns in BU Wise first dashboard (key by display-normalized BU)
  const trendByBuMap = useMemo(() => {
    const m = {};
    trendBuWiseDistributionData.forEach(r => {
      m[normalizeBUDisplay(r.businessUnit)] = r;
    });
    return m;
  }, [trendBuWiseDistributionData]);
  // When BUSINESS UNIT is SEAD (or Sead) and Polled = 0, show hyphen for entire row (dashboard + Excel)
  const isSeadAndPolledZero = (row) => {
    if (!row) return false;
    const bu = String(row.businessUnit ?? row['BUSINESS UNIT'] ?? '').trim();
    const polled = row.cssSentCount ?? row.Polled ?? row.polled ?? 0;
    return /^sead$/i.test(bu) && (polled === 0 || polled === '0');
  };

  const fullyManagedAccountWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return [];
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return [];

    const isFullyManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'fully managed' || v === 'fullymanaged';
    };

    // Polled and Responded per account from sheet 2 "CSAT sent and received Report": ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID/CUST_ID. Count only where date >= CSAT cycle start (MM-DD-YYYY).
    const polledByCid = {};
    const respondedByCid = {};
    const fullyManagedInfoFromSecondSheet = {}; // accountName, businessUnit from 2nd sheet for Responded=0 rows
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      const secondNameKey = Object.keys(secondFirst).find(k => /customer name|cust_nm|customername/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isFullyManaged(engVal)) return;
        }
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (!custId) return;
        if (!fullyManagedInfoFromSecondSheet[custId]) {
          fullyManagedInfoFromSecondSheet[custId] = {
            accountName: (secondNameKey ? row[secondNameKey] : null) ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? custId,
            businessUnit: normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A')
          };
        }
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) polledByCid[custId] = (polledByCid[custId] || 0) + 1;
        if (receivedValid) respondedByCid[custId] = (respondedByCid[custId] || 0) + 1;
      });
    }

    // From sheet 1: ENGAGEMENT TYPE = "Fully Managed", PERSPECTIVE = "Overall Experience", QUESTION_CATEGORY = "Criteria", both dates >= cycle start; group by CUSTOMER_ID, count RATING 1..5
    const customerGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isFullyManaged(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const customerId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
      if (!customerId || customerId === 'Unknown') return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      if (!customerGroups.has(customerId)) {
        customerGroups.set(customerId, {
          customerId,
          customerName: row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A',
          businessUnit: normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A'),
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
      const group = customerGroups.get(customerId);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    const allRatingColumns = [1, 2, 3, 4, 5];
    const result = [];
    // Include all accounts from second sheet (polledByCid), even when Responded=0; show hyphen for distribution when Responded=0
    Object.keys(polledByCid).forEach(cid => {
      const group = customerGroups.get(cid);
      const responded = respondedByCid[cid] || 0;
      const infoFromSheet2 = fullyManagedInfoFromSecondSheet[cid];
      const row = {
        sNo: 0,
        accountName: group ? group.customerName : (infoFromSheet2?.accountName ?? cid),
        businessUnit: group ? group.businessUnit : (infoFromSheet2?.businessUnit ?? 'N/A'),
        customerId: cid,
        polled: polledByCid[cid] || 0,
        responded
      };
      allRatingColumns.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[RATING_COLUMN_NAMES[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      result.push(row);
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.accountName || '').localeCompare(b.accountName || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });
    return filteredResult;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Fully Managed – BU Wise: Sheet 1 "CSAT received Report" ENGAGEMENT TYPE = "Fully Managed", PERSPECTIVE = "Overall Experience", group by BUSINESS UNIT. # Accounts Polled & Responded from sheet 2 by BU (Fully Managed). Value = count(RATING=x)/Responded*100.
  const fullyManagedBUWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return { data: [], orgLevelCounts: null };
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return { data: [], orgLevelCounts: null };

    const isFullyManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'fully managed' || v === 'fullymanaged';
    };

    const ratingColNames = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    const allRatingCols = [1, 2, 3, 4, 5];

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT
    const buFullyManagedCustomerIds = {};
    // Sheet 2: ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT → # Accounts Polled (unique CUSTOMER_ID), Polled, Responded (date >= cycle start)
    const buFullyManagedCounts = {};
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isFullyManaged(engVal)) return;
        }
        const bu = normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '');
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId.trim() !== '') {
          if (!buFullyManagedCustomerIds[bu]) buFullyManagedCustomerIds[bu] = new Set();
          buFullyManagedCustomerIds[bu].add(custId.trim());
        }
        if (!buFullyManagedCounts[bu]) buFullyManagedCounts[bu] = { cssSentCount: 0, cssReceivedCount: 0 };
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) buFullyManagedCounts[bu].cssSentCount++;
        if (receivedValid) buFullyManagedCounts[bu].cssReceivedCount++;
      });
    }

    // Sheet 1: ENGAGEMENT TYPE = "Fully Managed", PERSPECTIVE = "Overall Experience", QUESTION_CATEGORY = "Criteria", both dates >= cycle start; group by BUSINESS UNIT, count RATING 1..5
    const buGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isFullyManaged(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const businessUnit = normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A');
      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, { businessUnit, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
      const group = buGroups.get(businessUnit);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    // Build result: all BUs that appear in sheet 2 (Fully Managed) so we show every BU with # Accounts Polled; if no sheet 1 ratings for that BU, counts are 0
    const buSet = new Set([...buGroups.keys(), ...Object.keys(buFullyManagedCounts || {})]);
    const result = Array.from(buSet).map((businessUnit, index) => {
      const group = buGroups.get(businessUnit);
      const counts = buFullyManagedCounts[businessUnit] || { cssSentCount: 0, cssReceivedCount: 0 };
      const customerCount = (buFullyManagedCustomerIds[businessUnit] || new Set()).size;
      const responded = counts.cssReceivedCount || 0;
      const row = {
        sNo: index + 1,
        businessUnit,
        customerCount,
        cssSentCount: counts.cssSentCount || 0,
        cssReceivedCount: responded
      };
      allRatingCols.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[ratingColNames[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      return row;
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });

    let orgTotalResponded = 0, orgTotalPolled = 0, orgTotalCustomerCount = 0;
    const orgCountByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredResult.forEach(r => {
      orgTotalResponded += r.cssReceivedCount || 0;
      orgTotalPolled += r.cssSentCount || 0;
      orgTotalCustomerCount += r.customerCount ?? 0;
    });
    buGroups.forEach((group, bu) => {
      if (businessUnitFilter && !(bu || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase())) return;
      [1, 2, 3, 4, 5].forEach(r => { orgCountByRating[r] += group.ratings[r] || 0; });
    });
    return {
      data: filteredResult,
      orgLevelCounts: { countByRating: orgCountByRating, totalResponded: orgTotalResponded, totalPolled: orgTotalPolled, totalCustomerCount: orgTotalCustomerCount }
    };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Co-Managed – BU Wise: Sheet 1 "CSAT received Report" ENGAGEMENT TYPE = "Co-Managed", PERSPECTIVE = "Overall Experience", group by BUSINESS UNIT. # Accounts Polled, Polled, Responded from sheet 2 by BU (Co-Managed). Value = count(RATING=x)/Responded*100.
  const coManagedBUWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return { data: [], orgLevelCounts: null };
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return { data: [], orgLevelCounts: null };

    const isCoManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'co-managed' || v === 'comanaged' || v === 'co managed';
    };

    const ratingColNames = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    const allRatingCols = [1, 2, 3, 4, 5];

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT
    const buCoManagedCustomerIds = {};
    const buCoManagedCounts = {};
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isCoManaged(engVal)) return;
        }
        const bu = normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '');
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId.trim() !== '') {
          if (!buCoManagedCustomerIds[bu]) buCoManagedCustomerIds[bu] = new Set();
          buCoManagedCustomerIds[bu].add(custId.trim());
        }
        if (!buCoManagedCounts[bu]) buCoManagedCounts[bu] = { cssSentCount: 0, cssReceivedCount: 0 };
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) buCoManagedCounts[bu].cssSentCount++;
        if (receivedValid) buCoManagedCounts[bu].cssReceivedCount++;
      });
    }

    const buGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isCoManaged(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const businessUnit = normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A');
      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, { businessUnit, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
      const group = buGroups.get(businessUnit);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    const buSet = new Set([...buGroups.keys(), ...Object.keys(buCoManagedCounts || {})]);
    const result = Array.from(buSet).map((businessUnit, index) => {
      const group = buGroups.get(businessUnit);
      const counts = buCoManagedCounts[businessUnit] || { cssSentCount: 0, cssReceivedCount: 0 };
      const customerCount = (buCoManagedCustomerIds[businessUnit] || new Set()).size;
      const responded = counts.cssReceivedCount || 0;
      const row = {
        sNo: index + 1,
        businessUnit,
        customerCount,
        cssSentCount: counts.cssSentCount || 0,
        cssReceivedCount: responded
      };
      allRatingCols.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[ratingColNames[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      return row;
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });

    let orgTotalResponded = 0, orgTotalPolled = 0, orgTotalCustomerCount = 0;
    const orgCountByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredResult.forEach(r => {
      orgTotalResponded += r.cssReceivedCount || 0;
      orgTotalPolled += r.cssSentCount || 0;
      orgTotalCustomerCount += r.customerCount ?? 0;
    });
    buGroups.forEach((group, bu) => {
      if (businessUnitFilter && !(bu || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase())) return;
      [1, 2, 3, 4, 5].forEach(r => { orgCountByRating[r] += group.ratings[r] || 0; });
    });
    return {
      data: filteredResult,
      orgLevelCounts: { countByRating: orgCountByRating, totalResponded: orgTotalResponded, totalPolled: orgTotalPolled, totalCustomerCount: orgTotalCustomerCount }
    };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Staff Augmentation – BU Wise: Sheet 1 "CSAT received Report" ENGAGEMENT TYPE = "Staff Augmentation", PERSPECTIVE = "Overall Experience", group by BUSINESS UNIT. # Accounts Polled, Polled, Responded from sheet 2 by BU (Staff Augmentation). Value = count(RATING=x)/Responded*100.
  const staffAugmentationBUWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return { data: [], orgLevelCounts: null };
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return { data: [], orgLevelCounts: null };

    const isStaffAugmentation = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'staff augmentation' || v === 'staffaugmentation';
    };

    const ratingColNames = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
    const allRatingCols = [1, 2, 3, 4, 5];

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT
    const buStaffAugmentationCustomerIds = {};
    const buStaffAugmentationCounts = {};
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isStaffAugmentation(engVal)) return;
        }
        const bu = normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '');
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId.trim() !== '') {
          if (!buStaffAugmentationCustomerIds[bu]) buStaffAugmentationCustomerIds[bu] = new Set();
          buStaffAugmentationCustomerIds[bu].add(custId.trim());
        }
        if (!buStaffAugmentationCounts[bu]) buStaffAugmentationCounts[bu] = { cssSentCount: 0, cssReceivedCount: 0 };
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) buStaffAugmentationCounts[bu].cssSentCount++;
        if (receivedValid) buStaffAugmentationCounts[bu].cssReceivedCount++;
      });
    }

    const buGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isStaffAugmentation(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const businessUnit = normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A');
      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, { businessUnit, ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
      const group = buGroups.get(businessUnit);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    const buSet = new Set([...buGroups.keys(), ...Object.keys(buStaffAugmentationCounts || {})]);
    const result = Array.from(buSet).map((businessUnit, index) => {
      const group = buGroups.get(businessUnit);
      const counts = buStaffAugmentationCounts[businessUnit] || { cssSentCount: 0, cssReceivedCount: 0 };
      const customerCount = (buStaffAugmentationCustomerIds[businessUnit] || new Set()).size;
      const responded = counts.cssReceivedCount || 0;
      const row = {
        sNo: index + 1,
        businessUnit,
        customerCount,
        cssSentCount: counts.cssSentCount || 0,
        cssReceivedCount: responded
      };
      allRatingCols.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[ratingColNames[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      return row;
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });

    let orgTotalResponded = 0, orgTotalPolled = 0, orgTotalCustomerCount = 0;
    const orgCountByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredResult.forEach(r => {
      orgTotalResponded += r.cssReceivedCount || 0;
      orgTotalPolled += r.cssSentCount || 0;
      orgTotalCustomerCount += r.customerCount ?? 0;
    });
    buGroups.forEach((group, bu) => {
      if (businessUnitFilter && !(bu || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase())) return;
      [1, 2, 3, 4, 5].forEach(r => { orgCountByRating[r] += group.ratings[r] || 0; });
    });
    return {
      data: filteredResult,
      orgLevelCounts: { countByRating: orgCountByRating, totalResponded: orgTotalResponded, totalPolled: orgTotalPolled, totalCustomerCount: orgTotalCustomerCount }
    };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Co-Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
  // Data: Sheet 1 "CSAT received Report" – ENGAGEMENT TYPE = "Co-Managed", PERSPECTIVE = "Overall Experience", group by CUSTOMER_ID/CUST_ID.
  // Polled/Responded from Sheet 2 "CSAT sent and received Report" – ENGAGEMENT TYPE = "Co-Managed", group by CUSTOMER_ID, date >= CSAT cycle start.
  const coManagedAccountWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return [];
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return [];

    const isCoManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'co-managed' || v === 'comanaged' || v === 'co managed';
    };

    const polledByCid = {};
    const respondedByCid = {};
    const coManagedInfoFromSecondSheet = {};
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      const secondNameKey = Object.keys(secondFirst).find(k => /customer name|cust_nm|customername/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isCoManaged(engVal)) return;
        }
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (!custId) return;
        if (!coManagedInfoFromSecondSheet[custId]) {
          coManagedInfoFromSecondSheet[custId] = {
            accountName: (secondNameKey ? row[secondNameKey] : null) ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? custId,
            businessUnit: normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A')
          };
        }
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) polledByCid[custId] = (polledByCid[custId] || 0) + 1;
        if (receivedValid) respondedByCid[custId] = (respondedByCid[custId] || 0) + 1;
      });
    }

    const customerGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isCoManaged(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const customerId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
      if (!customerId || customerId === 'Unknown') return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      if (!customerGroups.has(customerId)) {
        customerGroups.set(customerId, {
          customerId,
          customerName: row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A',
          businessUnit: normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A'),
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
      const group = customerGroups.get(customerId);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    const allRatingColumns = [1, 2, 3, 4, 5];
    const result = [];
    Object.keys(polledByCid).forEach(cid => {
      const group = customerGroups.get(cid);
      const responded = respondedByCid[cid] || 0;
      const infoFromSheet2 = coManagedInfoFromSecondSheet[cid];
      const row = {
        sNo: 0,
        accountName: group ? group.customerName : (infoFromSheet2?.accountName ?? cid),
        businessUnit: group ? group.businessUnit : (infoFromSheet2?.businessUnit ?? 'N/A'),
        customerId: cid,
        polled: polledByCid[cid] || 0,
        responded
      };
      allRatingColumns.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[RATING_COLUMN_NAMES[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      result.push(row);
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.accountName || '').localeCompare(b.accountName || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });
    return filteredResult;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Staff Augmentation – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
  // Data: Sheet 1 "CSAT received Report" – ENGAGEMENT TYPE = "Staff Augmentation", PERSPECTIVE = "Overall Experience", group by CUSTOMER_ID/CUST_ID.
  // Polled/Responded from Sheet 2 "CSAT sent and received Report" – ENGAGEMENT TYPE = "Staff Augmentation", group by CUSTOMER_ID, date >= CSAT cycle start.
  const staffAugmentationAccountWiseScoreDistribution = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0 || !excelData) return [];
    const firstRow = uploadedData[0] || {};
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return [];

    const isStaffAugmentation = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'staff augmentation' || v === 'staffaugmentation';
    };

    const polledByCid = {};
    const respondedByCid = {};
    const staffAugmentationInfoFromSecondSheet = {};
    if (excelData.secondSheetData && excelData.secondSheetData.length > 0) {
      const secondFirst = excelData.secondSheetData[0] || {};
      const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      const secondSentKey = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
      const secondReceivedKey = Object.keys(secondFirst).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
      const secondBuKey = Object.keys(secondFirst).find(k => /business unit|bussiness unit/i.test(String(k)));
      const secondNameKey = Object.keys(secondFirst).find(k => /customer name|cust_nm|customername/i.test(String(k)));
      excelData.secondSheetData.forEach(row => {
        if (secondEngagementKey) {
          const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
          if (!isStaffAugmentation(engVal)) return;
        }
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (!custId) return;
        if (!staffAugmentationInfoFromSecondSheet[custId]) {
          staffAugmentationInfoFromSecondSheet[custId] = {
            accountName: (secondNameKey ? row[secondNameKey] : null) ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? custId,
            businessUnit: normalizeBUDisplay((secondBuKey ? row[secondBuKey] : null) ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A')
          };
        }
        const sentVal = (secondSentKey ? row[secondSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = (secondReceivedKey ? row[secondReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal != null && String(sentVal).trim() !== '' && String(sentVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
        const receivedFormatted = receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal) !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
        const sentValid = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
        const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
        const isCompletedStatus = statusVal === 'completed';
        const receivedValid = isCompletedStatus && (!csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)));
        if (sentValid) polledByCid[custId] = (polledByCid[custId] || 0) + 1;
        if (receivedValid) respondedByCid[custId] = (respondedByCid[custId] || 0) + 1;
      });
    }

    const customerGroups = new Map();
    uploadedData.forEach(row => {
      const engVal = (row[engagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
      if (!isStaffAugmentation(engVal)) return;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return;
      const perspectiveVal = (row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
      if (perspectiveVal !== 'Overall Experience') return;

      const customerId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
      if (!customerId || customerId === 'Unknown') return;

      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentDateValidForBoth = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedDateValidForBoth = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      const bothDatesValid = isSentDateValidForBoth && isReceivedDateValidForBoth;
      if (!bothDatesValid) return;

      const ratingResolved = parseInt(row['RATING'], 10);
      if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

      if (!customerGroups.has(customerId)) {
        customerGroups.set(customerId, {
          customerId,
          customerName: row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A',
          businessUnit: normalizeBUDisplay(row[businessUnitColumn] ?? row['BUSSINESS UNIT'] ?? 'N/A'),
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
      const group = customerGroups.get(customerId);
      group.ratings[ratingResolved] = (group.ratings[ratingResolved] || 0) + 1;
    });

    const allRatingColumns = [1, 2, 3, 4, 5];
    const result = [];
    Object.keys(polledByCid).forEach(cid => {
      const group = customerGroups.get(cid);
      const responded = respondedByCid[cid] || 0;
      const infoFromSheet2 = staffAugmentationInfoFromSecondSheet[cid];
      const row = {
        sNo: 0,
        accountName: group ? group.customerName : (infoFromSheet2?.accountName ?? cid),
        businessUnit: group ? group.businessUnit : (infoFromSheet2?.businessUnit ?? 'N/A'),
        customerId: cid,
        polled: polledByCid[cid] || 0,
        responded
      };
      allRatingColumns.forEach(r => {
        const count = group ? (group.ratings[r] || 0) : 0;
        row[RATING_COLUMN_NAMES[r]] = responded > 0 ? Math.round((count / responded) * 1000) / 10 : '-';
      });
      result.push(row);
    });

    const filteredResult = businessUnitFilter
      ? result.filter(r => (r.businessUnit || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : result;
    filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== indexB) return indexA - indexB;
      return (a.accountName || '').localeCompare(b.accountName || '');
    });
    filteredResult.forEach((row, i) => { row.sNo = i + 1; });
    return filteredResult;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Grand Total for Account/BU wise distribution: #Polleded = sum(rows.polled), #Responded = sum(rows.responded), each column = (count RATING=n in sheet 1 "CSAT received Report", PERSPECTIVE="Overall Experience", ENGAGEMENT TYPE match, CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted) / #Responded * 100 (one decimal).
  const grandTotalFullyManagedDistribution = useMemo(() => {
    if (!fullyManagedAccountWiseScoreDistribution || fullyManagedAccountWiseScoreDistribution.length === 0) return null;
    const totalPolled = fullyManagedAccountWiseScoreDistribution.reduce((s, r) => s + (r.polled ?? 0), 0);
    const totalResponded = fullyManagedAccountWiseScoreDistribution.reduce((s, r) => s + (r.responded ?? 0), 0);
    if (!uploadedData || uploadedData.length === 0) {
      const vals = {};
      [1, 2, 3, 4, 5].forEach(r => { vals[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? 0 : '-'; });
      return { totalPolled, totalResponded, ...vals };
    }
    const firstRow = uploadedData[0] || {};
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return null;
    const isFullyManaged = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'fully managed' || v === 'fullymanaged'; };
    const filtered = uploadedData.filter(row => {
      if (!isFullyManaged(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return false;
      if ((row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim() !== 'Overall Experience') return false;
      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentOk = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedOk = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      return isSentOk && isReceivedOk;
    });
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach(row => {
      const r = parseInt(row['RATING'], 10);
      if (r >= 1 && r <= 5) countByRating[r]++;
    });
    const out = { totalPolled, totalResponded };
    [1, 2, 3, 4, 5].forEach(r => { out[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-'; });
    return out;
  }, [fullyManagedAccountWiseScoreDistribution, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  const grandTotalCoManagedDistribution = useMemo(() => {
    if (!coManagedAccountWiseScoreDistribution || coManagedAccountWiseScoreDistribution.length === 0) return null;
    const totalPolled = coManagedAccountWiseScoreDistribution.reduce((s, r) => s + (r.polled ?? 0), 0);
    const totalResponded = coManagedAccountWiseScoreDistribution.reduce((s, r) => s + (r.responded ?? 0), 0);
    if (!uploadedData || uploadedData.length === 0) {
      const vals = {};
      [1, 2, 3, 4, 5].forEach(r => { vals[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? 0 : '-'; });
      return { totalPolled, totalResponded, ...vals };
    }
    const firstRow = uploadedData[0] || {};
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return null;
    const isCoManaged = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'co-managed' || v === 'comanaged' || v === 'co managed'; };
    const filtered = uploadedData.filter(row => {
      if (!isCoManaged(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return false;
      if ((row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim() !== 'Overall Experience') return false;
      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentOk = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedOk = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      return isSentOk && isReceivedOk;
    });
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach(row => {
      const r = parseInt(row['RATING'], 10);
      if (r >= 1 && r <= 5) countByRating[r]++;
    });
    const out = { totalPolled, totalResponded };
    [1, 2, 3, 4, 5].forEach(r => { out[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-'; });
    return out;
  }, [coManagedAccountWiseScoreDistribution, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  const grandTotalStaffAugmentationDistribution = useMemo(() => {
    if (!staffAugmentationAccountWiseScoreDistribution || staffAugmentationAccountWiseScoreDistribution.length === 0) return null;
    const totalPolled = staffAugmentationAccountWiseScoreDistribution.reduce((s, r) => s + (r.polled ?? 0), 0);
    const totalResponded = staffAugmentationAccountWiseScoreDistribution.reduce((s, r) => s + (r.responded ?? 0), 0);
    if (!uploadedData || uploadedData.length === 0) {
      const vals = {};
      [1, 2, 3, 4, 5].forEach(r => { vals[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? 0 : '-'; });
      return { totalPolled, totalResponded, ...vals };
    }
    const firstRow = uploadedData[0] || {};
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const firstSheetSentKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|css sent date/i.test(String(k)));
    const firstSheetReceivedKey = Object.keys(firstRow).find(k => /csat received date|css_received_date|css received date/i.test(String(k)));
    if (!engagementKey) return null;
    const isStaffAugmentation = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'staff augmentation' || v === 'staffaugmentation'; };
    const filtered = uploadedData.filter(row => {
      if (!isStaffAugmentation(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      if ((row['QUESTION_CATEGORY'] ?? '') !== 'Criteria') return false;
      if ((row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim() !== 'Overall Experience') return false;
      const sentVal = (firstSheetSentKey ? row[firstSheetSentKey] : null) ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = (firstSheetReceivedKey ? row[firstSheetReceivedKey] : null) ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal != null && sentVal !== '' && sentVal !== 'N/A' ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A' ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const isSentOk = !csatCycleStartDateFormatted || (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const isReceivedOk = !csatCycleStartDateFormatted || (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      return isSentOk && isReceivedOk;
    });
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filtered.forEach(row => {
      const r = parseInt(row['RATING'], 10);
      if (r >= 1 && r <= 5) countByRating[r]++;
    });
    const out = { totalPolled, totalResponded };
    [1, 2, 3, 4, 5].forEach(r => { out[RATING_COLUMN_NAMES[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-'; });
    return out;
  }, [staffAugmentationAccountWiseScoreDistribution, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Rating column names used by Top 10 grand total and BU-wise org row (must be before filteredData useMemo)
  const RATING_COLS_ORG = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
  const computeTop10AccountsGrandTotalRow = (top10Rows) => {
    if (!top10Rows || top10Rows.length === 0) return null;
    let totalPolled = 0, totalResponded = 0;
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    top10Rows.forEach(row => {
      totalPolled += row.cssSentCount ?? 0;
      totalResponded += row.cssReceivedCount ?? 0;
      const responded = row.cssReceivedCount ?? 0;
      if (responded > 0) {
        [1, 2, 3, 4, 5].forEach(r => {
          const val = row[RATING_COLS_ORG[r]];
          if (typeof val === 'number') countByRating[r] += (val / 100) * responded;
        });
      }
    });
    const row = {
      sNo: '',
      customerName: 'Top 10 Accounts',
      businessUnit: '',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      isTop10GrandTotal: true
    };
    [1, 2, 3, 4, 5].forEach(r => {
      row[RATING_COLS_ORG[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-';
    });
    return row;
  };

  // Top 10 view: Org level row = grand total over Top 10 rows + Other Account (Polled, Responded, rating % = count(RATING=x)/Responded*100)
  const computeTop10OrgLevelRow = (top10Rows, otherAccountRow) => {
    const rows = otherAccountRow ? [...top10Rows, otherAccountRow] : top10Rows;
    if (!rows || rows.length === 0) return null;
    let totalPolled = 0, totalResponded = 0;
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach(row => {
      totalPolled += row.cssSentCount ?? 0;
      totalResponded += row.cssReceivedCount ?? 0;
      const responded = row.cssReceivedCount ?? 0;
      if (responded > 0) {
        [1, 2, 3, 4, 5].forEach(r => {
          const val = row[RATING_COLS_ORG[r]];
          if (typeof val === 'number') countByRating[r] += (val / 100) * responded;
        });
      }
    });
    const row = {
      sNo: '',
      customerName: 'Overall',
      businessUnit: '',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      isTop10OrgLevel: true
    };
    [1, 2, 3, 4, 5].forEach(r => {
      row[RATING_COLS_ORG[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-';
    });
    return row;
  };

  // Top 10 view row colors (Excel theme–style)
  const TOP10_ACCOUNTS_ROW_BG = '#FFF2CC';   // Light Yellow 2
  const OTHER_ACCOUNTS_ROW_BG = '#BDD7EE';   // Light Cornflower Blue 3
  const TOP10_OVERALL_ROW_BG = '#E4DFEC';   // Light Purple 3

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = processedData.data;

    if (showBuWise) {
      // BU-wise filtering
      if (businessUnitFilter) {
        filtered = filtered.filter(row => 
          row.businessUnit.toLowerCase().includes(businessUnitFilter.toLowerCase())
        );
      }
    } else {
      // Account-wise filtering
      if (businessUnitFilter) {
        filtered = filtered.filter(row => 
          row.businessUnit.toLowerCase().includes(businessUnitFilter.toLowerCase())
        );
      }
      if (customerNameSearch) {
        filtered = filtered.filter(row => 
          row.customerName.toLowerCase().includes(customerNameSearch.toLowerCase())
        );
      }
      // Default order by BUSINESS UNIT (Healthcare, CIT, Tech, India & GCC, Sead) when account-wise and not Top 10
      if (!showTop10 && filtered.length > 0) {
        filtered = [...filtered].sort((a, b) => {
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== indexB) return indexA - indexB;
          return (a.customerName || '').localeCompare(b.customerName || '');
        });
      }
    }

    // Top 10: order = Top 10 account rows (Sr.No. 1–12), then "Top 10 Accounts" grand total row, then "Other Accounts" (no Sr.No.), then "Overall"
    if (showTop10 && !showBuWise) {
      const top10Order = [
        'Premier Healthcare Solutions Inc',
        'Blue Cross Blue Shield Association BCBSA',
        'Frontier Airlines INC',
        'Premier - Horizon II - Covenant Health',
        'Tufts Medicine',
        'BronxCare Health System',
        'AgFirst Farm Credit Bank',
        'embecta MEDICAL II LLC',
        'Northern Trust Company',
        'Jewish Board of Family and Childrens Services JBFCS',
        'Healthfirst',
        'AgileOne'
      ];
      const otherAccountRow = filtered.find(r => (r.customerName || '') === 'Other Accounts');
      const top10Rows = filtered.filter(r => (r.customerName || '') !== 'Other Accounts');
      const normalizeForOrder = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
      const orderByNormalized = new Map();
      top10Order.forEach((name, i) => { orderByNormalized.set(normalizeForOrder(name), i); });
      const getOrderIndex = (row) => {
        const n = normalizeForOrder(row.customerName);
        return orderByNormalized.has(n) ? orderByNormalized.get(n) : 999;
      };
      // Sort Top 10 account rows by fixed order only (Sr. No. 1–12)
      top10Rows.sort((a, b) => {
        const indexA = getOrderIndex(a);
        const indexB = getOrderIndex(b);
        if (indexA !== indexB) return indexA - indexB;
        return (a.customerName || '').localeCompare(b.customerName || '');
      });
      const withSNo = top10Rows.map((row, i) => ({ ...row, sNo: i + 1 }));
      const grandTotalRow = computeTop10AccountsGrandTotalRow(withSNo);
      if (otherAccountRow) otherAccountRow.sNo = '';
      const orgLevelRow = computeTop10OrgLevelRow(withSNo, otherAccountRow);
      const base = grandTotalRow
        ? (otherAccountRow ? [...withSNo, grandTotalRow, otherAccountRow] : [...withSNo, grandTotalRow])
        : (otherAccountRow ? [...withSNo, otherAccountRow] : withSNo);
      filtered = orgLevelRow ? [...base, orgLevelRow] : base;
      return filtered;
    }

    // Reassign Sr. No. in correct display order (1, 2, 3...)
    filtered = filtered.map((row, i) => ({ ...row, sNo: i + 1 }));

    return filtered;
  }, [processedData.data, showBuWise, businessUnitFilter, customerNameSearch, showTop10]);

  // Org level row for BU-wise distribution: use raw counts when provided (buWiseOrgLevelCounts) for correct 1-decimal; else recompute from row percentages.
  const computeBUWiseDistributionOrgRow = (data, buWiseOrgLevelCounts) => {
    if (!data || data.length === 0) return null;
    const rows = data.filter(r => (r.businessUnit || '') !== 'Org level');
    if (rows.length === 0) return null;
    let totalCustomerCount = 0, totalPolled = 0, totalResponded = 0;
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (buWiseOrgLevelCounts && buWiseOrgLevelCounts.totalResponded != null) {
      totalResponded = buWiseOrgLevelCounts.totalResponded;
      totalPolled = buWiseOrgLevelCounts.totalPolled ?? 0;
      totalCustomerCount = buWiseOrgLevelCounts.totalCustomerCount ?? 0;
      [1, 2, 3, 4, 5].forEach(r => { countByRating[r] = buWiseOrgLevelCounts.countByRating[r] ?? 0; });
    } else {
      rows.forEach(row => {
        totalCustomerCount += row.customerCount ?? 0;
        totalPolled += row.cssSentCount ?? 0;
        totalResponded += row.cssReceivedCount ?? 0;
        const responded = row.cssReceivedCount ?? 0;
        if (responded > 0) {
          [1, 2, 3, 4, 5].forEach(r => {
            const val = row[RATING_COLS_ORG[r]];
            if (typeof val === 'number') countByRating[r] += (val / 100) * responded;
          });
        }
      });
    }
    const orgRow = {
      sNo: '',
      businessUnit: 'Org level',
      customerCount: totalCustomerCount,
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      isOrgLevel: true
    };
    [1, 2, 3, 4, 5].forEach(r => {
      orgRow[RATING_COLS_ORG[r]] = totalResponded > 0 ? Math.round((countByRating[r] / totalResponded) * 1000) / 10 : '-';
    });
    return orgRow;
  };

  const ORG_LEVEL_ROW_BG = '#E2E8F0'; // same as BU Wise Average CSAT Scores - Perspective Wise

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    // If sorting by businessUnit, use BUSINESS UNIT order (Healthcare, CIT, Tech, India & GCC, Sead/SEAD)
    if (sortConfig.key === 'businessUnit') {
      return [...data].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const indexA = getBusinessUnitOrderIndex(aVal);
        const indexB = getBusinessUnitOrderIndex(bVal);
        if (indexA !== indexB) {
          return sortConfig.direction === 'asc' ? indexA - indexB : indexB - indexA;
        }
        return sortConfig.direction === 'asc' ? (aVal || '').localeCompare(bVal || '') : (bVal || '').localeCompare(aVal || '');
      });
    }

    // For other columns, sort normally but maintain Business Unit order as secondary sort
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === bVal) {
        const indexA = getBusinessUnitOrderIndex(a.businessUnit);
        const indexB = getBusinessUnitOrderIndex(b.businessUnit);
        if (indexA !== indexB) return indexA - indexB;
        return (a.businessUnit || '').localeCompare(b.businessUnit || '');
      }

      // Hyphen (Responded=0) sorts last when ascending, first when descending
      if (aVal === '-') return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal === '-') return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle numeric values
      let aNum = aVal;
      let bNum = bVal;
      if (typeof aNum === 'string' && !isNaN(parseFloat(aNum))) aNum = parseFloat(aNum);
      if (typeof bNum === 'string' && !isNaN(parseFloat(bNum))) bNum = parseFloat(bNum);

      if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedData = getSortedData(filteredData);

  const practiceWiseProcessedData = useMemo(() => {
    const source = (practiceFileReceivedData && practiceFileReceivedData.length > 0)
      ? practiceFileReceivedData
      : (uploadedData && uploadedData.length > 0 ? uploadedData : (excelData?.data && Array.isArray(excelData.data) ? excelData.data : null));
    const secondSheet = (practiceFileSheet2Data && practiceFileSheet2Data.length > 0)
      ? practiceFileSheet2Data
      : (excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : null);
    if ((!source || source.length === 0) && (!secondSheet || secondSheet.length === 0)) {
      return { data: [], dataSource: 'none' };
    }
    const { source: filteredSource, secondSheetSource: filteredSecondSheet } = filterSheetsByBusinessUnit(source, secondSheet, businessUnitFilter);
    const built = buildPracticeWiseDistributionData(filteredSource, filteredSecondSheet, csatCycleStartDateFormatted);
    const fromFile = (practiceFileReceivedData && practiceFileReceivedData.length > 0)
      || (practiceFileSheet2Data && practiceFileSheet2Data.length > 0);
    return {
      ...built,
      dataSource: fromFile ? 'file' : 'uploaded'
    };
  }, [practiceFileReceivedData, practiceFileSheet2Data, uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  const practiceWiseGrandTotal = useMemo(() => {
    const rows = practiceWiseProcessedData.data || [];
    const polled = rows.reduce((sum, row) => sum + (row.cssSentCount || 0), 0);
    const responded = rows.reduce((sum, row) => sum + (row.cssReceivedCount || 0), 0);
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach((row) => {
      const counts = row.ratingCounts || {};
      [1, 2, 3, 4, 5].forEach((r) => {
        countByRating[r] += counts[r] || 0;
      });
    });
    const ratingPct = {};
    PRACTICE_RATING_DISPLAY_ORDER.forEach((rating) => {
      const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
      ratingPct[colName] = responded > 0
        ? Math.round((countByRating[rating] / responded) * 1000) / 10
        : '-';
    });
    return { polled, responded, ...ratingPct };
  }, [practiceWiseProcessedData.data]);

  const getPracticeRatingCellColor = (rating, val) => {
    if (val === '-' || val == null) return { backgroundColor: 'transparent', color: '#374151' };
    const n = parseFloat(val);
    if (isNaN(n) || n === 0) return { backgroundColor: 'transparent', color: '#374151' };
    switch (rating) {
      case 1: return { backgroundColor: '#dc2626', color: 'white' };
      case 2: return { backgroundColor: '#fca5a5', color: 'black' };
      case 3: return { backgroundColor: '#f59e0b', color: 'black' };
      case 4: return { backgroundColor: '#86efac', color: 'black' };
      case 5: return { backgroundColor: '#16a34a', color: 'black' };
      default: return { backgroundColor: 'transparent', color: '#374151' };
    }
  };

  const practiceWiseTrendData = useMemo(() => {
    if (!showPracticeWise || !showTrendAnalysis) {
      return { data: [], sourceName: '', error: null };
    }
    if (!csatCycleStartDateFormatted) {
      return { data: [], sourceName: '', error: 'CSAT cycle start date is required for trend analysis.' };
    }
    const h12025File = findH12025TrendFile(trendAnalysisFiles);
    if (!h12025File) {
      return {
        data: [],
        sourceName: '',
        error: 'Upload "Trend-Analysis-H12025.xlsx" in "Upload data for trend analysis" to view trend data.'
      };
    }
    const { sheet1, sheet2 } = getTrendFilePracticeSheets(h12025File);
    const sourceName = h12025File.saveName || h12025File.originalName || 'Trend-Analysis-H12025.xlsx';
    if (!sheet1.length && !sheet2.length) {
      return {
        data: [],
        sourceName,
        error: 'No data found in trend file sheets "CSAT received Report" or "CSAT sent and received Report".'
      };
    }
    const built = buildPracticeWiseDistributionData(sheet1, sheet2, csatCycleStartDateFormatted);
    return {
      data: built.data || [],
      sourceName,
      error: (built.data || []).length === 0 ? 'No practice rows with date ≥ CSAT cycle start in trend file.' : null
    };
  }, [showPracticeWise, showTrendAnalysis, trendAnalysisFiles, csatCycleStartDateFormatted]);

  const practiceWiseTrendGrandTotal = useMemo(() => {
    const rows = practiceWiseTrendData.data || [];
    const polled = rows.reduce((sum, row) => sum + (row.cssSentCount || 0), 0);
    const responded = rows.reduce((sum, row) => sum + (row.cssReceivedCount || 0), 0);
    const countByRating = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach((row) => {
      const counts = row.ratingCounts || {};
      [1, 2, 3, 4, 5].forEach((r) => {
        countByRating[r] += counts[r] || 0;
      });
    });
    const ratingPct = {};
    PRACTICE_RATING_DISPLAY_ORDER.forEach((rating) => {
      const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
      ratingPct[colName] = responded > 0
        ? Math.round((countByRating[rating] / responded) * 1000) / 10
        : '-';
    });
    return { polled, responded, ...ratingPct };
  }, [practiceWiseTrendData.data]);

  const practiceWiseTrendByPractice = useMemo(() => {
    const m = {};
    (practiceWiseTrendData.data || []).forEach((r) => {
      const key = String(r.practice || '').trim().toLowerCase();
      if (key) m[key] = r;
    });
    return m;
  }, [practiceWiseTrendData.data]);

  const renderPracticeTrendDiffCells = (dashRow, trendRow, isHyphen, rowBg) => {
    return PRACTICE_RATING_DISPLAY_ORDER.map((rating) => {
      const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
      if (isHyphen) {
        return (
          <Td
            key={`practice-trend-${rating}`}
            style={{
              border: '1px solid #d1d5db',
              textAlign: 'center',
              backgroundColor: rowBg || '#f9fafb',
              color: '#6b7280',
              fontWeight: rowBg ? '700' : 'normal',
              ...trendCellStyle
            }}
          >
            -
          </Td>
        );
      }
      const dashVal = dashRow[colName];
      const trendVal = trendRow ? trendRow[colName] : null;
      const { diffStr, arrow, arrowColor, isEmpty } = computePracticeTrendDiff(dashVal, trendVal);
      const display = isEmpty ? '-' : (
        <span style={{ whiteSpace: 'nowrap' }}>
          <span style={{ color: '#374151', fontWeight: rowBg ? '700' : 'normal' }}>{diffStr}</span>
          {arrow != null && (
            <span style={{ color: arrowColor, fontWeight: '700', marginLeft: '0.25rem' }}>{arrow}</span>
          )}
        </span>
      );
      return (
        <Td
          key={`practice-trend-${rating}`}
          style={{
            border: '1px solid #d1d5db',
            textAlign: 'center',
            backgroundColor: rowBg || 'transparent',
            fontWeight: rowBg ? '700' : 'normal',
            ...trendCellStyle
          }}
        >
          {display}
        </Td>
      );
    });
  };

  const formatPracticeTrendDiffExcel = (dashVal, trendVal) => {
    const { diffStr, arrow, isEmpty } = computePracticeTrendDiff(dashVal, trendVal);
    if (isEmpty) return '-';
    return arrow ? `${diffStr} ${arrow}` : diffStr;
  };

  const getPracticeWiseSortedData = (data) => {
    if (!sortConfig.key) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.key === 'practice') {
        const ia = getPracticeOrderIndex(aVal);
        const ib = getPracticeOrderIndex(bVal);
        if (ia !== ib) return sortConfig.direction === 'asc' ? ia - ib : ib - ia;
      }
      if (aVal === '-') return sortConfig.direction === 'asc' ? 1 : -1;
      if (bVal === '-') return sortConfig.direction === 'asc' ? -1 : 1;
      let aNum = aVal;
      let bNum = bVal;
      if (typeof aNum === 'string' && !isNaN(parseFloat(aNum))) aNum = parseFloat(aNum);
      if (typeof bNum === 'string' && !isNaN(parseFloat(bNum))) bNum = parseFloat(bNum);
      if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const practiceWiseSortedData = getPracticeWiseSortedData(practiceWiseProcessedData.data || []);
  const practiceWiseTrendSortedData = getPracticeWiseSortedData(practiceWiseTrendData.data || []);

  const handlePracticeWiseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBuWise(false);
    setShowTop10(false);
    setShowPracticeWise(true);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleBackToAccountBuDistributionDashboard = () => {
    setShowPracticeWise(false);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const hasPcsatDashboardData = (uploadedData && uploadedData.length > 0)
    || (excelData?.data && Array.isArray(excelData.data) && excelData.data.length > 0);

  const showHeaderNavButtons = hasPcsatDashboardData || showPracticeWise;
  const showPracticeWiseButton = hasPcsatDashboardData
    || (practiceFileReceivedData && practiceFileReceivedData.length > 0)
    || (practiceFileSheet2Data && practiceFileSheet2Data.length > 0);

  const downloadPracticeWiseDistributionData = async () => {
    try {
      const rows = practiceWiseProcessedData.data || [];
      if (!rows.length) {
        alert('No practice-wise data available to download');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Distribution');
      if (showTrendAnalysis) {
        const row1 = ['Sr. No.', 'Practice', (acsatCycle || 'H2 2025'), '', '', '', '', '', ''];
        row1.push(trendHeaderLabel, '', '', '', '');
        const headerRow1 = worksheet.addRow(row1);
        headerRow1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' } };
        worksheet.mergeCells(1, 3, 1, 9);
        worksheet.mergeCells(1, 10, 1, 14);
        headerRow1.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow1.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow1.getCell(10).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        headerRow1.getCell(10).font = { bold: true, color: { argb: 'FF000000' } };
        const row2Headers = [
          'Sr. No.',
          'Practice',
          'Polled',
          'Responded',
          ...PRACTICE_RATING_DISPLAY_ORDER.map(r => PRACTICE_RATING_COLUMN_NAMES[r]),
          ...PRACTICE_RATING_DISPLAY_ORDER.map(r => PRACTICE_RATING_COLUMN_NAMES[r])
        ];
        const headerRow2 = worksheet.addRow(row2Headers);
        headerRow2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' } };
        headerRow2.eachCell((cell, colNumber) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          if (colNumber >= 10) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
          }
        });
        worksheet.mergeCells(1, 1, 2, 1);
        worksheet.mergeCells(1, 2, 2, 2);
      } else {
        const headers = [
          'Sr. No.',
          'Practice',
          'Polled',
          'Responded',
          ...PRACTICE_RATING_DISPLAY_ORDER.map(r => PRACTICE_RATING_COLUMN_NAMES[r])
        ];
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' } };
        headerRow.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
      }
      const excelRatingColors = { 1: 'FFDC2626', 2: 'FFFCA5A5', 3: 'FFF59E0B', 4: 'FF86EFAC', 5: 'FF16A34A' };

      practiceWiseSortedData.forEach((row) => {
        const responded = row.cssReceivedCount ?? 0;
        const isHyphen = responded === 0;
        const trendRow = practiceWiseTrendByPractice[String(row.practice || '').trim().toLowerCase()];
        const base = [
          row.sNo,
          row.practice,
          row.cssSentCount ?? 0,
          row.cssReceivedCount ?? 0,
          ...PRACTICE_RATING_DISPLAY_ORDER.map(r => {
            const colName = PRACTICE_RATING_COLUMN_NAMES[r];
            return isHyphen ? '-' : (row[colName] ?? '-');
          })
        ];
        if (showTrendAnalysis) {
          base.push(...PRACTICE_RATING_DISPLAY_ORDER.map((r) => {
            const colName = PRACTICE_RATING_COLUMN_NAMES[r];
            if (isHyphen) return '-';
            return formatPracticeTrendDiffExcel(row[colName], trendRow ? trendRow[colName] : null);
          }));
        }
        const dataRow = worksheet.addRow(base);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        PRACTICE_RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
          const val = isHyphen ? '-' : (row[colName] ?? '-');
          const cell = dataRow.getCell(colIndex + 5);
          cell.value = val;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (val !== '-' && !Number.isNaN(Number(val))) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: excelRatingColors[rating] } };
            cell.font = { bold: true, color: { argb: rating === 1 ? 'FFFFFFFF' : 'FF000000' } };
          }
        });
        if (showTrendAnalysis) {
          PRACTICE_RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
            const cell = dataRow.getCell(colIndex + 10);
            const val = cell.value != null ? String(cell.value) : '';
            if (val.includes('↑')) cell.font = { color: { argb: 'FF16A34A' }, bold: true };
            else if (val.includes('↓')) cell.font = { color: { argb: 'FFDC2626' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
        }
      });
      const grandTotalBase = [
        '',
        'Grand Total',
        practiceWiseGrandTotal.polled,
        practiceWiseGrandTotal.responded,
        ...PRACTICE_RATING_DISPLAY_ORDER.map(r => {
          const colName = PRACTICE_RATING_COLUMN_NAMES[r];
          const val = practiceWiseGrandTotal[colName];
          return practiceWiseGrandTotal.responded === 0 ? '-' : (val ?? '-');
        })
      ];
      if (showTrendAnalysis) {
        grandTotalBase.push(...PRACTICE_RATING_DISPLAY_ORDER.map((r) => {
          const colName = PRACTICE_RATING_COLUMN_NAMES[r];
          return formatPracticeTrendDiffExcel(
            practiceWiseGrandTotal[colName],
            practiceWiseTrendGrandTotal[colName]
          );
        }));
      }
      const grandTotalRow = worksheet.addRow(grandTotalBase);
      grandTotalRow.font = { bold: true };
      grandTotalRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      grandTotalRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 28;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 12;
      PRACTICE_RATING_DISPLAY_ORDER.forEach((_, i) => { worksheet.getColumn(i + 5).width = 18; });
      if (showTrendAnalysis) {
        PRACTICE_RATING_DISPLAY_ORDER.forEach((_, i) => { worksheet.getColumn(i + 10).width = 18; });
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Practice_wise_Overall_CSAT_Score_Distribution_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise distribution Excel export error:', err);
      alert('Failed to export practice-wise distribution data to Excel.');
    }
  };

  const downloadPracticeWiseTrendData = async () => {
    try {
      const rows = practiceWiseTrendData.data || [];
      if (!rows.length) {
        alert('No practice-wise trend data available to download');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Trend Distribution');
      const headers = [
        'Sr. No.',
        'Practice',
        'Polled',
        'Responded',
        ...PRACTICE_RATING_DISPLAY_ORDER.map(r => PRACTICE_RATING_COLUMN_NAMES[r])
      ];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      const excelRatingColors = { 1: 'FFDC2626', 2: 'FFFCA5A5', 3: 'FFF59E0B', 4: 'FF86EFAC', 5: 'FF16A34A' };
      practiceWiseTrendSortedData.forEach((row) => {
        const responded = row.cssReceivedCount ?? 0;
        const isHyphen = responded === 0;
        const dataRow = worksheet.addRow([
          row.sNo,
          row.practice,
          row.cssSentCount ?? 0,
          row.cssReceivedCount ?? 0,
          ...PRACTICE_RATING_DISPLAY_ORDER.map(r => {
            const colName = PRACTICE_RATING_COLUMN_NAMES[r];
            return isHyphen ? '-' : (row[colName] ?? '-');
          })
        ]);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        PRACTICE_RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
          const val = isHyphen ? '-' : (row[colName] ?? '-');
          const cell = dataRow.getCell(colIndex + 5);
          cell.value = val;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          if (val !== '-' && !Number.isNaN(Number(val))) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: excelRatingColors[rating] } };
            cell.font = { bold: true, color: { argb: rating === 1 ? 'FFFFFFFF' : 'FF000000' } };
          }
        });
      });
      const grandTotalRow = worksheet.addRow([
        '',
        'Grand Total',
        practiceWiseTrendGrandTotal.polled,
        practiceWiseTrendGrandTotal.responded,
        ...PRACTICE_RATING_DISPLAY_ORDER.map(r => {
          const colName = PRACTICE_RATING_COLUMN_NAMES[r];
          const val = practiceWiseTrendGrandTotal[colName];
          return practiceWiseTrendGrandTotal.responded === 0 ? '-' : (val ?? '-');
        })
      ]);
      grandTotalRow.font = { bold: true };
      grandTotalRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      grandTotalRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 28;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 12;
      PRACTICE_RATING_DISPLAY_ORDER.forEach((_, i) => { worksheet.getColumn(i + 5).width = 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Practice_wise_Trend_Overall_CSAT_Score_Distribution_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise trend Excel export error:', err);
      alert('Failed to export practice-wise trend data to Excel.');
    }
  };

  // Download functionality
  const downloadData = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(showBuWise ? 'BU Wise Overall CSAT score - Distribution (Score 1 to 5)' : 'Account Wise CSAT Score Distribution');

      // Define headers with new rating column names - ordered from Highly Satisfied to Highly Dissatisfied
      const ratingColumnMapping = {
        5: 'Highly Satisfied',
        4: 'Satisfied',
        3: 'Neutral',
        2: 'Dissatisfied',
        1: 'Highly Dissatisfied'
      };
      
      const headers = showBuWise 
        ? ['Sr. No.', 'Business Unit', '# Accounts Polled', '#Polled', '#Responded', ...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r])]
        : ['Sr. No.', 'Business Unit', 'Account Name', '#Polled', '#Responded', ...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r])];

      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      let mainHeaderRowIndex = 1;

      if (showBuWise) {
        // Row 1: Sr. No., Business Unit, merged "H2 2025" (columns 3–10), optionally merged "Trend analysis (H2 Vs H1)" (columns 11–15)
        const row1Cells = ['Sr. No.', 'Business Unit', (acsatCycle || 'H2 2025')];
        if (showTrendAnalysis) row1Cells.push(trendHeaderLabel);
        worksheet.addRow(row1Cells);
        const row1 = worksheet.getRow(1);
        row1.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        worksheet.mergeCells(1, 3, 1, 10); // C1:J1 = "H2 2025"
        if (showTrendAnalysis) {
          worksheet.mergeCells(1, 11, 1, 15); // K1:O1 = "Trend analysis (H2 Vs H1)" over 5 columns
          row1.getCell(11).value = trendHeaderLabel;
        }
        // Row 2: sub-headers
        const row2Cells = ['Sr. No.', 'Business Unit', '# Accounts Polled', '#Polled', '#Responded', ...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r])];
        if (showTrendAnalysis) row2Cells.push(...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r]));
        worksheet.addRow(row2Cells);
        const row2 = worksheet.getRow(2);
        row2.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      } else {
        // Account-wise / Top 10: Row 1 = Sr. No., Business Unit, Account Name, merged "H2 2025" (cols 4–10); optionally "Trend analysis (H2 Vs H1)" (cols 11–15)
        const row1Cells = ['Sr. No.', 'Business Unit', 'Account Name', (acsatCycle || 'H2 2025')];
        if ((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) row1Cells.push(trendHeaderLabel);
        worksheet.addRow(row1Cells);
        const row1 = worksheet.getRow(1);
        row1.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        worksheet.mergeCells(1, 4, 1, 10); // D1:J1 = "H2 2025" (7 columns)
        if ((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) {
          worksheet.mergeCells(1, 11, 1, 15); // K1:O1 = "Trend analysis (H2 Vs H1)" over 5 rating trend columns
          row1.getCell(11).value = trendHeaderLabel;
          row1.getCell(11).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(11).font = { bold: true, color: { argb: 'FF000000' } };
          row1.getCell(11).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        const row2Cells = ['Sr. No.', 'Business Unit', 'Account Name', '#Polled', '#Responded', ...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r])];
        if ((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) row2Cells.push(...RATING_DISPLAY_ORDER.map(r => ratingColumnMapping[r]));
        worksheet.addRow(row2Cells);
        const row2 = worksheet.getRow(2);
        row2.eachCell((cell) => {
          cell.fill = headerFill;
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        if ((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) {
          for (let c = 11; c <= 15; c++) {
            row2.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
            row2.getCell(c).font = { bold: true, color: { argb: 'FF000000' } };
          }
        }
        mainHeaderRowIndex = 2;
      }

      // Top 10 row fill colors (Excel theme style)
      const excelTop10AccountsBg = 'FFF2CC';   // Light Yellow 2
      const excelOtherAccountsBg = 'BDD7EE';   // Light Cornflower Blue 3
      const excelOverallBg = 'E4DFEC';         // Light Purple 3

      // Add data rows with color coding (hyphen when Responded=0; SEAD+Polled=0 → entire row hyphen)
      const buWiseColCount = showBuWise ? (10 + (showTrendAnalysis ? 5 : 0)) : 0;
      const accountWiseColCount = 10 + (((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) ? 5 : 0);
      sortedData.forEach((row, index) => {
        const hyphenRow = !row.isTop10GrandTotal && !row.isTop10OrgLevel && (row.customerName || '') !== 'Other Accounts' && isSeadAndPolledZero(row);
        const srNo = showBuWise ? (index + 1) : (showTop10 ? (row.sNo ?? '') : index + 1);
        let rowData;
        if (hyphenRow) {
          rowData = showBuWise ? Array(buWiseColCount).fill('-') : Array(accountWiseColCount).fill('-');
        } else if (showBuWise) {
          const base = [srNo, normalizeBUDisplay(row.businessUnit), row.customerCount, row.cssSentCount, row.cssReceivedCount, ...RATING_DISPLAY_ORDER.map(r => row[ratingColumnMapping[r]] ?? 0)];
          if (showTrendAnalysis) {
            const trendRow = trendByBuMap[normalizeBUDisplay(row.businessUnit)];
            const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
            base.push(...RATING_DISPLAY_ORDER.map(r => {
              const colName = ratingColNames[r];
              const dashVal = row[colName];
              const trendVal = trendRow ? trendRow[colName] : null;
              const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
              const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
              if (dashNum == null && trendNum == null) return '-';
              const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
              const diffStr = diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '';
              const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
              return diffStr ? `(${diffStr}) ${arrow}` : '-';
            }));
          }
          rowData = base;
        } else {
          const base = [srNo, normalizeBUDisplay(row.businessUnit), row.customerName, row.cssSentCount, row.cssReceivedCount, ...RATING_DISPLAY_ORDER.map(r => row[ratingColumnMapping[r]] ?? 0)];
          if (((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis)) {
            const isTop10GrandTotal = row.isTop10GrandTotal === true;
            const isOtherAccounts = (row.customerName || '') === 'Other Accounts';
            const isTop10Org = row.isTop10OrgLevel === true;
            const isSummaryRow = isTop10GrandTotal || isOtherAccounts || isTop10Org;
            if (showTop10 && isSummaryRow) {
              const trendRowForSummary = isTop10GrandTotal ? trendTop10OrgRow : isOtherAccounts ? trendOtherAccountsSummaryRow : (isTop10Org ? trendOverallSummaryRow : null);
              const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
              base.push(...RATING_DISPLAY_ORDER.map(r => {
                const colName = ratingColNames[r];
                const dashVal = row[colName];
                const trendVal = trendRowForSummary ? trendRowForSummary[colName] : null;
                const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
                const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
                if (dashNum == null && trendNum == null) return '-';
                const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
                const diffStr = diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
                return diffStr ? `(${diffStr}) ${arrow}` : '-';
              }));
            } else {
              // Account-wise: compare against H1 reference built from Sheet1/Sheet2
              const trendRow = showTop10
                ? trendTop10ByAccountBu[`${(row.customerName || '').toString().trim()}|${normalizeBUDisplay(row.businessUnit)}`]
                : (() => {
                    const byKey = {};
                    (trendAccountWiseSentReceivedH1?.rows || []).forEach(tr => {
                      const k = `${(tr.accountName || '').toString().trim()}|${normalizeBUDisplay(tr.businessUnit)}`;
                      byKey[k] = tr;
                    });
                    return byKey[`${(row.customerName || '').toString().trim()}|${normalizeBUDisplay(row.businessUnit)}`];
                  })();
              const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
              base.push(...RATING_DISPLAY_ORDER.map(r => {
                const colName = ratingColNames[r];
                const dashVal = row[colName];
                const trendVal = trendRow ? trendRow[colName] : null;
                if (!trendRow) return '-';
                const dashNum = (dashVal != null && dashVal !== '-' && !Number.isNaN(Number(dashVal))) ? Number(dashVal) : 0;
                const trendNum = (trendVal != null && trendVal !== '-' && !Number.isNaN(Number(trendVal))) ? Number(trendVal) : 0;
                const diff = Math.round((dashNum - trendNum) * 10) / 10;
                const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                const arrow = diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
                return `(${diffStr}) ${arrow}`.trim();
              }));
            }
          }
          rowData = base;
        }
        
        const excelRow = worksheet.addRow(rowData);
        const isTop10GrandTotal = row.isTop10GrandTotal === true;
        const isTop10OrgLevel = row.isTop10OrgLevel === true;
        const isOtherAccounts = (row.customerName || '') === 'Other Accounts';
        const isTop10SummaryRow = isTop10GrandTotal || isTop10OrgLevel;
        const top10RowFill = showTop10 && !showBuWise
          ? (isTop10GrandTotal ? excelTop10AccountsBg : (isTop10OrgLevel ? excelOverallBg : (isOtherAccounts ? excelOtherAccountsBg : null)))
          : (isTop10SummaryRow ? 'E2E8F0' : null); // BU-wise org row keeps gray
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (hyphenRow) {
            cell.alignment = { horizontal: (showBuWise ? colNumber === 2 : (colNumber === 2 || colNumber === 3)) ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (top10RowFill) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + top10RowFill } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
          }
          // Alignment: header center; text (BU, Account Name) left; numeric center; vertical middle
          if (showBuWise) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
          }
        });
        
        // Apply color coding to rating columns; show hyphen when Responded=0 (skip for Top 10 summary rows and SEAD+Polled=0 hyphen row)
        if (hyphenRow) {
          RATING_DISPLAY_ORDER.forEach((_, colIndex) => {
            const cell = excelRow.getCell(6 + colIndex);
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
        } else {
        RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const value = row[ratingColumnMapping[rating]];
          const cell = excelRow.getCell(6 + colIndex); // Sr. No., BUSINESS UNIT, Account Name/# Accounts Polled, Polled, Responded, then rating columns
          if (isTop10SummaryRow || isOtherAccounts) {
            if (value === '-' || value === undefined) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { bold: true, color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number' && value > 0) {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              switch (rating) {
                case 1: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; break;
                case 2: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 3: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 4: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 5: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                default: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            }
            cell.alignment = { horizontal: 'center' };
            return;
          }
          const isHyphen = value === '-' || (value === 0 && (row.cssReceivedCount || 0) === 0);
          
          if (isHyphen || value === '-') {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
          } else if (typeof value === 'number') {
            cell.numFmt = '0.0%';
            cell.value = roundDistributionForExcel(value);
          if (value > 0) {
            switch (rating) {
                case 1: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; break;
                case 2: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 3: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 4: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 5: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                default: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; cell.font = { color: { argb: 'FF6B7280' } };
            }
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
          }
          }
          cell.alignment = { ...(cell.alignment || {}), horizontal: 'center', vertical: 'middle' };
        });
        // Trend columns (11 to 15) for Account-wise / Top10: green for ↑, red for ↓
        if (!showBuWise && showTrendAnalysis && !hyphenRow) {
          for (let c = 11; c <= 15; c++) {
            const cell = excelRow.getCell(c);
            const val = cell.value != null ? String(cell.value) : '';
            if (val.includes('↑')) cell.font = { ...(cell.font || {}), color: { argb: 'FF16A34A' }, bold: true };
            else if (val.includes('↓')) cell.font = { ...(cell.font || {}), color: { argb: 'FFDC2626' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
        }
        // Trend columns (11 to 15) when showBuWise && showTrendAnalysis: (diff) ↑/↓ for 5 rating columns
        if (showBuWise && showTrendAnalysis && !hyphenRow) {
          const trendRow = trendByBuMap[normalizeBUDisplay(row.businessUnit)];
          const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
          RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
            const cell = excelRow.getCell(11 + colIndex);
            const colName = ratingColNames[rating];
            const dashVal = row[colName];
            const trendVal = trendRow ? trendRow[colName] : null;
            const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
            const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
            if (dashNum == null && trendNum == null) {
              cell.value = '-';
              cell.font = { color: { argb: 'FF6B7280' } };
            } else {
              const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
              const diffStr = diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '';
              const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
              cell.value = diffStr ? `(${diffStr}) ${arrow}` : '-';
              cell.font = { color: { argb: diff != null && diff > 0 ? 'FF16A34A' : diff != null && diff < 0 ? 'FFDC2626' : 'FF374151' } };
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
        }
        }
      });

      // Account-wise: add Org level row (and trend) to Excel download
      if (!showBuWise && !showTop10 && sortedData.length > 0) {
        const orgRow = computeAccountWiseOrgRow(sortedData);
        if (orgRow) {
          const byKey = {};
          (trendAccountWiseSentReceivedH1?.rows || []).forEach(tr => {
            const k = `${(tr.accountName || '').toString().trim()}|${normalizeBUDisplay(tr.businessUnit)}`;
            byKey[k] = tr;
          });
          const trendOrg = byKey['Org level|Org level'];
          const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
          const base = [
            '',
            normalizeBUDisplay(orgRow.businessUnit),
            orgRow.customerName,
            orgRow.cssSentCount,
            orgRow.cssReceivedCount,
            ...RATING_DISPLAY_ORDER.map(r => orgRow[ratingColNames[r]] ?? '-')
          ];
          if (showTrendAnalysis) {
            base.push(...RATING_DISPLAY_ORDER.map(r => {
              if (!trendOrg) return '-';
              const colName = ratingColNames[r];
              const dashVal = orgRow[colName];
              const trendVal = trendOrg[colName];
              const dashNum = (dashVal != null && dashVal !== '-' && !Number.isNaN(Number(dashVal))) ? Number(dashVal) : 0;
              const trendNum = (trendVal != null && trendVal !== '-' && !Number.isNaN(Number(trendVal))) ? Number(trendVal) : 0;
              const diff = Math.round((dashNum - trendNum) * 10) / 10;
              const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
              const arrow = diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
              return `(${diffStr}) ${arrow}`.trim();
            }));
          }

          const excelRow = worksheet.addRow(base);
          excelRow.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle', wrapText: true };
          });

          // Color rating distribution cells
          RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
            const value = orgRow[ratingColNames[rating]];
            const cell = excelRow.getCell(6 + colIndex);
            if (value == null || value === '-' || Number(value) <= 0) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              return;
            }
            cell.value = roundDistributionForExcel(value);
            if (value > 0) {
              switch (rating) {
                case 1: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; break;
                case 2: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 3: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 4: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 5: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                default: break;
              }
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });

          // Trend cells font color
          if (showTrendAnalysis) {
            for (let c = 11; c <= 15; c++) {
              const cell = excelRow.getCell(c);
              const val = cell.value != null ? String(cell.value) : '';
              if (val.includes('↑')) cell.font = { ...(cell.font || {}), color: { argb: 'FF16A34A' }, bold: true };
              else if (val.includes('↓')) cell.font = { ...(cell.font || {}), color: { argb: 'FFDC2626' }, bold: true };
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
          }
        }
      }

      // BU Wise: add Org level row (grand total) with same styling as BU Wise Perspective Wise
      if (showBuWise && sortedData.length > 0) {
        const orgRow = computeBUWiseDistributionOrgRow(sortedData, processedData.buWiseOrgLevelCounts);
        if (orgRow) {
          const ratingColumnMappingForOrg = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
          let orgRowData = [orgRow.sNo, normalizeBUDisplay(orgRow.businessUnit), orgRow.customerCount, orgRow.cssSentCount, orgRow.cssReceivedCount, ...RATING_DISPLAY_ORDER.map(r => orgRow[ratingColumnMappingForOrg[r]] ?? '-')];
          if (showTrendAnalysis) {
            const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
            const trendCells = RATING_DISPLAY_ORDER.map(r => {
              const colName = ratingColNames[r];
              const dashPct = orgRow[colName];
              const trendPct = trendBuWiseOrgRow ? trendBuWiseOrgRow[colName] : null;
              const dashNum = (dashPct != null && dashPct !== '-') ? Number(dashPct) : null;
              const trendNum = (trendPct != null && trendPct !== '-') ? Number(trendPct) : null;
              const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
              const diffStr = diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '';
              const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : '';
              return (diffStr || arrow) ? `(${diffStr}) ${arrow}`.trim() : '-';
            });
            orgRowData = [...orgRowData, ...trendCells];
          }
          const excelOrgRow = worksheet.addRow(orgRowData);
          excelOrgRow.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
          });
          RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
            const value = orgRow[ratingColumnMappingForOrg[rating]];
            const cell = excelOrgRow.getCell(6 + colIndex);
            if (value === '-' || value === undefined) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            } else if (typeof value === 'number' && value > 0) {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              switch (rating) {
                case 1: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; break;
                case 2: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 3: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 4: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                case 5: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; break;
                default: cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          });
          if (showTrendAnalysis) {
            RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
              const cell = excelOrgRow.getCell(11 + colIndex);
              const ratingColNames = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
              const colName = ratingColNames[rating];
              const dashPct = orgRow[colName];
              const trendPct = trendBuWiseOrgRow ? trendBuWiseOrgRow[colName] : null;
              const dashNum = (dashPct != null && dashPct !== '-') ? Number(dashPct) : null;
              const trendNum = (trendPct != null && trendPct !== '-') ? Number(trendPct) : null;
              const diff = (dashNum != null && trendNum != null) ? dashNum - trendNum : null;
              if (diff != null && diff > 0) {
                cell.font = { color: { argb: 'FF16A34A' }, bold: true };
              } else if (diff != null && diff < 0) {
                cell.font = { color: { argb: 'FFDC2626' }, bold: true };
              }
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            });
          }
        }
      }

      // Add legend rows (when showBuWise we have 2 header rows so data starts at row 3)
      const hasAccountWiseOrg = (!showBuWise && !showTop10 && sortedData.length > 0) ? 1 : 0;
      const legendStartRow = (showBuWise ? 4 : 3) + sortedData.length + hasAccountWiseOrg + (showBuWise && sortedData.length > 0 && computeBUWiseDistributionOrgRow(sortedData, processedData.buWiseOrgLevelCounts) ? 1 : 0);
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      worksheet.addRow(['Highly Satisfied: Dark Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
      worksheet.addRow(['Satisfied: Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
      worksheet.addRow(['Neutral: Amber']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
      worksheet.addRow(['Dissatisfied: Light Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
      worksheet.addRow(['Highly Dissatisfied: Dark Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };
      
      // Style legend cells
      for (let i = 0; i < 6; i++) {
        const legendRow = worksheet.getRow(legendStartRow + i);
        if (i === 0) {
          // Legend title
          legendRow.getCell(1).font = { bold: true, size: 12 };
        } else {
          // Legend items
          legendRow.getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        legendRow.getCell(1).alignment = { horizontal: 'left' };
      }

      // Auto-fit columns
      worksheet.columns.forEach(column => {
        column.width = 15;
      });

      // Generate and download file with name according to current view (Account Wise, Top 10 Accounts, or BU Wise)
      const downloadFileName = showBuWise
        ? 'BU_Wise_Overall_CSAT_Score_Distribution_Score_1_to_5.xlsx'
        : `Account_BU_Wise_Overall_CSAT_Score_Distribution_${showTop10 ? 'Top10_Accounts' : 'Account_Wise'}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadFullyManagedBUWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fully Managed BU Wise Score Distribution');
      const ratingColumnMapping = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
      const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const ratingKeys = RATING_DISPLAY_ORDER;
      fullyManagedBUWiseScoreDistribution.data.forEach((row, index) => {
        const fmHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = ratingKeys.map(r => row[ratingColumnMapping[r]]);
        const rowData = fmHyphenRow
          ? headers.map(() => '-')
          : [
              index + 1,
              normalizeBUDisplay(row.businessUnit),
              row.cssSentCount ?? 0,
              row.cssReceivedCount ?? 0,
              ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))
            ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (fmHyphenRow) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber <= 4) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const ratingColIndex = colNumber - 5;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              if (value > 0) {
                const r = ratingKeys[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      const fmOrgRow = computeBUWiseDistributionOrgRow(fullyManagedBUWiseScoreDistribution.data, fullyManagedBUWiseScoreDistribution.orgLevelCounts);
      if (fmOrgRow) {
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => fmOrgRow[ratingColumnMapping[r]]);
        const orgRowData = [fmOrgRow.sNo, normalizeBUDisplay(fmOrgRow.businessUnit), fmOrgRow.cssSentCount ?? 0, fmOrgRow.cssReceivedCount ?? 0, ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))];
        const excelOrgRow = worksheet.addRow(orgRowData);
        excelOrgRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (colNumber <= 4) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
          }
          cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        });
        RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const value = rawRatingValues[colIndex];
          const cell = excelOrgRow.getCell(5 + colIndex);
          if (value === '-' || value === undefined) {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else if (typeof value === 'number' && value > 0) {
            cell.numFmt = '0.0%';
            cell.value = roundDistributionForExcel(value);
            if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 20 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Fully_Managed_BU_Wise_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Fully Managed BU Wise score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadCoManagedBUWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Co-Managed BU Wise Score Distribution');
      const ratingColumnMapping = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
      const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const ratingKeys = RATING_DISPLAY_ORDER;
      coManagedBUWiseScoreDistribution.data.forEach((row, index) => {
        const cmHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = ratingKeys.map(r => row[ratingColumnMapping[r]]);
        const rowData = cmHyphenRow
          ? headers.map(() => '-')
          : [
              index + 1,
              normalizeBUDisplay(row.businessUnit),
              row.cssSentCount ?? 0,
              row.cssReceivedCount ?? 0,
              ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))
            ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (cmHyphenRow) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber <= 4) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const ratingColIndex = colNumber - 5;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              if (value > 0) {
                const r = ratingKeys[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      const cmOrgRow = computeBUWiseDistributionOrgRow(coManagedBUWiseScoreDistribution.data, coManagedBUWiseScoreDistribution.orgLevelCounts);
      if (cmOrgRow) {
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => cmOrgRow[ratingColumnMapping[r]]);
        const orgRowData = [cmOrgRow.sNo, normalizeBUDisplay(cmOrgRow.businessUnit), cmOrgRow.cssSentCount ?? 0, cmOrgRow.cssReceivedCount ?? 0, ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))];
        const excelOrgRow = worksheet.addRow(orgRowData);
        excelOrgRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (colNumber <= 4) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
          }
          cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        });
        RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const value = rawRatingValues[colIndex];
          const cell = excelOrgRow.getCell(5 + colIndex);
          if (value === '-' || value === undefined) {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else if (typeof value === 'number' && value > 0) {
            cell.numFmt = '0.0%';
            cell.value = roundDistributionForExcel(value);
            if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 20 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Co_Managed_BU_Wise_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Co-Managed BU Wise score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadStaffAugmentationBUWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Staff Augmentation BU Wise Score Distribution');
      const ratingColumnMapping = { 1: 'Highly Dissatisfied', 2: 'Dissatisfied', 3: 'Neutral', 4: 'Satisfied', 5: 'Highly Satisfied' };
      const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const ratingKeys = RATING_DISPLAY_ORDER;
      staffAugmentationBUWiseScoreDistribution.data.forEach((row, index) => {
        const saHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = ratingKeys.map(r => row[ratingColumnMapping[r]]);
        const rowData = saHyphenRow
          ? headers.map(() => '-')
          : [
              index + 1,
              normalizeBUDisplay(row.businessUnit),
              row.cssSentCount ?? 0,
              row.cssReceivedCount ?? 0,
              ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))
            ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (saHyphenRow) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber <= 4) {
            cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const ratingColIndex = colNumber - 5;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              if (value > 0) {
                const r = ratingKeys[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      const saOrgRow = computeBUWiseDistributionOrgRow(staffAugmentationBUWiseScoreDistribution.data, staffAugmentationBUWiseScoreDistribution.orgLevelCounts);
      if (saOrgRow) {
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => saOrgRow[ratingColumnMapping[r]]);
        const orgRowData = [saOrgRow.sNo, normalizeBUDisplay(saOrgRow.businessUnit), saOrgRow.cssSentCount ?? 0, saOrgRow.cssReceivedCount ?? 0, ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))];
        const excelOrgRow = worksheet.addRow(orgRowData);
        excelOrgRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (colNumber <= 4) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            cell.font = { bold: true, color: { argb: 'FF000000' } };
          }
          cell.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        });
        RATING_DISPLAY_ORDER.forEach((rating, colIndex) => {
          const value = rawRatingValues[colIndex];
          const cell = excelOrgRow.getCell(5 + colIndex);
          if (value === '-' || value === undefined) {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else if (typeof value === 'number' && value > 0) {
            cell.numFmt = '0.0%';
            cell.value = roundDistributionForExcel(value);
            if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      }

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 20 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Staff_Augmentation_BU_Wise_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Staff Augmentation BU Wise score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadFullyManagedAccountWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Fully Managed Account Wise Score Distribution');
      const headers = ['Sr. No.', 'Account Name', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      fullyManagedAccountWiseScoreDistribution.forEach((row, index) => {
        const fmAccHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => row[RATING_COLUMN_NAMES[r]]);
        const ratingValuesForRow = rawRatingValues.map(v => (v === '-' ? '-' : (typeof v === 'number' ? v : (v != null ? v : 0))));
        const rowData = fmAccHyphenRow
          ? headers.map(() => '-')
          : [
          index + 1,
          row.accountName,
              normalizeBUDisplay(row.businessUnit),
              row.polled != null ? row.polled : 0,
              row.responded != null ? row.responded : 0,
              ...ratingValuesForRow
        ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (fmAccHyphenRow) {
            cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber === 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber === 2 || colNumber === 3) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else if (colNumber === 4 || colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const ratingColIndex = colNumber - 6;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
            if (value > 0) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
              if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      if (grandTotalFullyManagedDistribution) {
        const gt = grandTotalFullyManagedDistribution;
        const gtRatingValues = RATING_DISPLAY_ORDER.map(r => gt[RATING_COLUMN_NAMES[r]]);
        const gtRowData = ['-', 'Grand Total', '-', gt.totalPolled, gt.totalResponded, ...gtRatingValues.map(v => (v === '-' ? '-' : roundDistributionForExcel(v)))];
        const gtRow = worksheet.addRow(gtRowData);
        gtRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.font = { bold: true, color: { argb: 'FF374151' } };
          cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 6) {
            const ratingColIndex = colNumber - 6;
            const value = gtRatingValues[ratingColIndex];
            if (value !== '-' && typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              // Don't apply color if value is 0 or 0.0%
              const isZeroOrZeroPct = value === 0 || (typeof value === 'number' && Math.abs(value) < 0.01);
              if (!isZeroOrZeroPct) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              }
            }
          }
        });
      }

      const legendStartRow = fullyManagedAccountWiseScoreDistribution.length + (grandTotalFullyManagedDistribution ? 3 : 2);
      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      worksheet.addRow(['Highly Satisfied: Dark Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
      worksheet.addRow(['Satisfied: Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
      worksheet.addRow(['Neutral: Amber']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
      worksheet.addRow(['Dissatisfied: Light Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
      worksheet.addRow(['Highly Dissatisfied: Dark Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 35 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Fully_Managed_Account_BU_Wise_Overall_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Fully Managed score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadCoManagedAccountWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Co-Managed Account Wise Score Distribution');
      const headers = ['Sr. No.', 'Account Name', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      coManagedAccountWiseScoreDistribution.forEach((row, index) => {
        const cmAccHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => row[RATING_COLUMN_NAMES[r]]);
        const rowData = cmAccHyphenRow
          ? headers.map(() => '-')
          : [
          index + 1,
          row.accountName,
              normalizeBUDisplay(row.businessUnit),
          row.polled ?? 0,
          row.responded ?? 0,
              ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))
        ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (cmAccHyphenRow) {
            cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber === 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber === 2 || colNumber === 3) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else if (colNumber === 4 || colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const ratingColIndex = colNumber - 6;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
            if (value > 0) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
              if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      if (grandTotalCoManagedDistribution) {
        const gt = grandTotalCoManagedDistribution;
        const gtRatingValues = RATING_DISPLAY_ORDER.map(r => gt[RATING_COLUMN_NAMES[r]]);
        const gtRowData = ['-', 'Grand Total', '-', gt.totalPolled, gt.totalResponded, ...gtRatingValues.map(v => (v === '-' ? '-' : roundDistributionForExcel(v)))];
        const gtRow = worksheet.addRow(gtRowData);
        gtRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.font = { bold: true, color: { argb: 'FF374151' } };
          cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 6) {
            const ratingColIndex = colNumber - 6;
            const value = gtRatingValues[ratingColIndex];
            if (value !== '-' && typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              // Don't apply color if value is 0 or 0.0%
              const isZeroOrZeroPct = value === 0 || (typeof value === 'number' && Math.abs(value) < 0.01);
              if (!isZeroOrZeroPct) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              }
            }
          }
        });
      }

      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      worksheet.addRow(['Highly Satisfied: Dark Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
      worksheet.addRow(['Satisfied: Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
      worksheet.addRow(['Neutral: Amber']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
      worksheet.addRow(['Dissatisfied: Light Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
      worksheet.addRow(['Highly Dissatisfied: Dark Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 35 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Co_Managed_Account_BU_Wise_Overall_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Co-Managed score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadStaffAugmentationAccountWiseScoreDistribution = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Staff Augmentation Account Wise Score Distribution');
      const headers = ['Sr. No.', 'Account Name', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      staffAugmentationAccountWiseScoreDistribution.forEach((row, index) => {
        const saAccHyphenRow = isSeadAndPolledZero(row);
        const rawRatingValues = RATING_DISPLAY_ORDER.map(r => row[RATING_COLUMN_NAMES[r]]);
        const rowData = saAccHyphenRow
          ? headers.map(() => '-')
          : [
          index + 1,
          row.accountName,
              normalizeBUDisplay(row.businessUnit),
          row.polled ?? 0,
          row.responded ?? 0,
              ...rawRatingValues.map(v => (v === '-' ? '-' : (v ?? 0)))
        ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          if (saAccHyphenRow) {
            cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
            return;
          }
          if (colNumber === 1) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else if (colNumber === 2 || colNumber === 3) {
            cell.alignment = { horizontal: 'left', vertical: 'middle' };
          } else if (colNumber === 4 || colNumber === 5) {
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          } else {
            cell.alignment = { horizontal: 'center' };
            const ratingColIndex = colNumber - 6;
            const value = rawRatingValues[ratingColIndex];
            const isHyphen = value === '-';
            if (isHyphen) {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            } else if (typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
            if (value > 0) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
              if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              }
            }
          }
        });
      });

      if (grandTotalStaffAugmentationDistribution) {
        const gt = grandTotalStaffAugmentationDistribution;
        const gtRatingValues = RATING_DISPLAY_ORDER.map(r => gt[RATING_COLUMN_NAMES[r]]);
        const gtRowData = ['-', 'Grand Total', '-', gt.totalPolled, gt.totalResponded, ...gtRatingValues.map(v => (v === '-' ? '-' : roundDistributionForExcel(v)))];
        const gtRow = worksheet.addRow(gtRowData);
        gtRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.font = { bold: true, color: { argb: 'FF374151' } };
          cell.alignment = { horizontal: (colNumber === 2 || colNumber === 3) ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 6) {
            const ratingColIndex = colNumber - 6;
            const value = gtRatingValues[ratingColIndex];
            if (value !== '-' && typeof value === 'number') {
              cell.numFmt = '0.0%';
              cell.value = roundDistributionForExcel(value);
              // Don't apply color if value is 0 or 0.0%
              const isZeroOrZeroPct = value === 0 || (typeof value === 'number' && Math.abs(value) < 0.01);
              if (!isZeroOrZeroPct) {
                const r = RATING_DISPLAY_ORDER[ratingColIndex];
                if (r === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                else if (r === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                else if (r === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              }
            }
          }
        });
      }

      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      worksheet.addRow(['Highly Satisfied: Dark Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
      worksheet.addRow(['Satisfied: Green']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } };
      worksheet.addRow(['Neutral: Amber']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } };
      worksheet.addRow(['Dissatisfied: Light Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
      worksheet.addRow(['Highly Dissatisfied: Dark Red']).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } };

      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 35 : 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Staff_Augmentation_Account_BU_Wise_Overall_CSAT_Score_Distribution.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Staff Augmentation score distribution:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadTrendAnalysisTable = async () => {
    try {
      if (!trendBuWiseDistributionData.length) {
        alert('No trend data to download.');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trend Analysis by Business Unit');
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      const headers = ['Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      trendBuWiseDistributionData.forEach((row) => {
        const rowData = [
          normalizeBUDisplay(row.businessUnit),
          row.polled ?? 0,
          row.responded ?? 0,
          ...ratingCols.map(c => (row[c] != null && row[c] !== '-' ? roundDistributionForExcel(Number(row[c])) : '-'))
        ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 4) {
            const val = rowData[colNumber - 1];
            if (val !== '-' && typeof val === 'number') {
              cell.numFmt = '0.0%';
              const rating = [5, 4, 3, 2, 1][colNumber - 4];
              if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            }
          }
        });
      });
      if (trendBuWiseOrgRow) {
        const orgRowData = [
          trendBuWiseOrgRow.businessUnit,
          trendBuWiseOrgRow.polled ?? 0,
          trendBuWiseOrgRow.responded ?? 0,
          ...ratingCols.map(c => (trendBuWiseOrgRow[c] != null && trendBuWiseOrgRow[c] !== '-' ? roundDistributionForExcel(Number(trendBuWiseOrgRow[c])) : '-'))
        ];
        const excelOrgRow = worksheet.addRow(orgRowData);
        excelOrgRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 4) {
            const val = orgRowData[colNumber - 1];
            if (val !== '-' && typeof val === 'number') {
              cell.numFmt = '0.0%';
              const rating = [5, 4, 3, 2, 1][colNumber - 4];
              if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            }
          }
        });
      }
      worksheet.columns.forEach((col, i) => { col.width = i === 0 ? 20 : 16; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Trend_Analysis_CSAT_received_Report_by_Business_Unit.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Trend Analysis table:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadTrendAnalysisTop10Table = async () => {
    try {
      if (!trendTop10TableData.length) {
        alert('No trend data for Top 10 to download.');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Trend Analysis Top 10');
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      const headers = ['Account Name', 'Business Unit', '#Polled', '#Responded', 'Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = headerFill;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
      trendTop10TableData.forEach((row) => {
        const rowData = [
          row.accountName ?? '',
          normalizeBUDisplay(row.businessUnit),
          row.polled ?? 0,
          row.responded ?? 0,
          ...ratingCols.map(c => (row[c] != null && row[c] !== '-' ? roundDistributionForExcel(Number(row[c])) : '-'))
        ];
        const excelRow = worksheet.addRow(rowData);
        excelRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 5) {
            const val = rowData[colNumber - 1];
            if (val !== '-' && typeof val === 'number') {
              cell.numFmt = '0.0%';
              const rating = [5, 4, 3, 2, 1][colNumber - 5];
              if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
            }
          }
        });
      });
      const addSummaryRow = (summaryRow) => {
        const rowData = [
          summaryRow.accountName ?? '',
          summaryRow.businessUnit ?? '',
          summaryRow.polled ?? 0,
          summaryRow.responded ?? 0,
          ...ratingCols.map(c => (summaryRow[c] != null && summaryRow[c] !== '-' ? roundDistributionForExcel(Number(summaryRow[c])) : '-'))
        ];
        const excelSummaryRow = worksheet.addRow(rowData);
        excelSummaryRow.eachCell((cell, colNumber) => {
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle' };
          if (colNumber >= 5) {
            const val = rowData[colNumber - 1];
            if (val !== '-' && typeof val === 'number') {
              cell.numFmt = '0.0%';
              const rating = [5, 4, 3, 2, 1][colNumber - 5];
              if (rating === 1) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
              else if (rating === 2) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 3) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
              else if (rating === 5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            } else {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            }
          }
        });
      };
      if (trendTop10AccountsSummaryRow) addSummaryRow(trendTop10AccountsSummaryRow);
      addSummaryRow(trendOtherAccountsSummaryRow);
      if (trendOverallSummaryRow) addSummaryRow(trendOverallSummaryRow);
      worksheet.columns.forEach((col, i) => { col.width = i === 0 ? 28 : (i === 1 ? 18 : 16); });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Trend_Analysis_CSAT_sent_and_received_Report_Top_10.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Trend Analysis Top 10 table:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadTrendAnalysisAccountWiseH1SentReceived = async () => {
    const rows = trendAccountWiseSentReceivedH1?.rows || [];
    if (!rows.length) {
      alert('No account-wise trend reference data to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Trend_Analysis_Account_Wise', { pageSetup: { fitToPage: true } });

      const headers = [
        'Business Unit',
        'Account Name',
        '#Polled',
        '#Responded',
        'Highly Satisfied',
        'Satisfied',
        'Neutral',
        'Dissatisfied',
        'Highly Dissatisfied'
      ];
      sheet.addRow(headers);
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      const ratingOrder = [5, 4, 3, 2, 1];
      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
      const getCellColor = (rating, val) => {
        if (val == null || val === '-' || Number.isNaN(Number(val))) return null;
        // match dashboard colors
        switch (rating) {
          case 1: return { fg: 'FFDC2626', font: 'FFFFFFFF' };
          case 2: return { fg: 'FFFCA5A5', font: 'FF000000' };
          case 3: return { fg: 'FFF59E0B', font: 'FF000000' };
          case 4: return { fg: 'FF86EFAC', font: 'FF000000' };
          case 5: return { fg: 'FF16A34A', font: 'FF000000' };
          default: return null;
        }
      };

      rows.forEach(r => {
        const isOrg = (r.businessUnit || '') === 'Org level' || (r.accountName || '') === 'Org level';
        const rowData = [
          normalizeBUDisplay(r.businessUnit),
          r.accountName,
          r.polled ?? 0,
          r.responded ?? 0,
          ...ratingOrder.map(rt => r[ratingColumnMapping[rt]] ?? '-')
        ];
        const dataRow = sheet.addRow(rowData);
        dataRow.eachCell((c) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        // left align BU/name
        dataRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };

        if (isOrg) {
          dataRow.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            c.font = { ...(c.font || {}), bold: true };
          });
        }

        // rating cell fills
        ratingOrder.forEach((rt, idx) => {
          const cell = dataRow.getCell(5 + idx);
          const raw = cell.value;
          if (raw == null || raw === '-') return;
          const colors = getCellColor(rt, raw);
          if (!colors) return;
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.fg } };
          cell.font = { color: { argb: colors.font }, bold: true };
        });
      });

      // widths
      sheet.getColumn(1).width = 18;
      sheet.getColumn(2).width = 32;
      sheet.getColumn(3).width = 12;
      sheet.getColumn(4).width = 12;
      for (let c = 5; c <= 9; c++) sheet.getColumn(c).width = 18;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Trend_Analysis_Account_Wise_${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download account-wise trend reference');
    }
  };

  const computeAccountWiseOrgRow = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const ratingCols = ['Highly Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Highly Dissatisfied'];
    const colToRating = { 'Highly Satisfied': 5, 'Satisfied': 4, 'Neutral': 3, 'Dissatisfied': 2, 'Highly Dissatisfied': 1 };
    const totalPolled = rows.reduce((s, r) => s + (r.cssSentCount || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.cssReceivedCount || 0), 0);
    const estCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    rows.forEach(r => {
      const responded = r.cssReceivedCount || 0;
      ratingCols.forEach(col => {
        const pctVal = r[col];
        const pct = (pctVal != null && pctVal !== '-' && !Number.isNaN(Number(pctVal))) ? Number(pctVal) : 0;
        estCounts[colToRating[col]] += Math.round((pct / 100) * responded);
      });
    });
    const out = {
      sNo: '',
      businessUnit: 'Org level',
      customerName: 'Org level',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      isAccountOrgLevel: true
    };
    ratingCols.forEach(col => {
      const r = colToRating[col];
      out[col] = totalResponded > 0 ? Math.round((estCounts[r] / totalResponded) * 1000) / 10 : '-';
    });
    return out;
  };

  return (
    <DashboardContainer>
      <DashboardHeader style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-start', overflow: 'visible' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <HeaderTitle>
            <BarChart3 size={24} /> {
              showPracticeWise ? 'Practice wise Overall CSAT score -Distribution(Score 1 to 5)' :
              showBuWise ? 'BU Wise Overall CSAT score -Distribution(Score 1 to 5)' : 
              showTop10 ? 'Top 10 account - Overall CSAT score -Distribution(Score 1 to 5)' :
              'Account/BU wise Overall CSAT score -Distribution(Score 1 to 5)'
            }
          </HeaderTitle>
          {csatCycleStartDateFormatted && (
            <div style={{ 
              fontSize: '0.875rem', 
              opacity: 0.9, 
              marginTop: '0.5rem'
            }}>
              📅 Filtered by CSAT Cycle Start Date: {csatCycleStartDateFormatted}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'flex-end', flex: '1 1 auto', minWidth: 0, position: 'relative', zIndex: 2 }}>
          {showHeaderNavButtons && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end', minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch', flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setShowBuWise(true);
                    setShowTop10(false);
                    setShowPracticeWise(false);
                    setBusinessUnitFilter('');
                    setCustomerNameSearch('');
                  }}
                  style={{
                    background: showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                    border: '2px solid white',
                    color: showBuWise ? '#1e3a8a' : 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  }}
                >
                  <Building2 size={16} />
                  Display BU Wise CSAT Score Distribution
                </button>
                {showPracticeWiseButton && (
                  <button
                    type="button"
                    onClick={handlePracticeWiseClick}
                    style={{
                      width: '100%',
                      minHeight: '2.5rem',
                      padding: '0.5rem 1rem',
                      border: 'none',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.7rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      whiteSpace: 'normal',
                      textAlign: 'center',
                      lineHeight: '1.3',
                      boxSizing: 'border-box',
                      boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.25)'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = '#3b82f6';
                    }}
                    aria-label="Practice wise Overall CSAT score -Distribution(Score 1 to 5)"
                    title="Practice wise Overall CSAT score -Distribution(Score 1 to 5)"
                  >
                    Practice wise Overall CSAT score -Distribution(Score 1 to 5)
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setShowBuWise(false);
                  setShowTop10(true);
                  setShowPracticeWise(false);
                  setBusinessUnitFilter('');
                  setCustomerNameSearch('');
                }}
                style={{
                  background: showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  border: '2px solid white',
                  color: showTop10 ? '#1e3a8a' : 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                }}
              >
                <BarChart3 size={16} />
                Top 10 account - Overall CSAT score -Distribution(Score 1 to 5)
              </button>
              <button
                onClick={() => {
                  setShowBuWise(false);
                  setShowTop10(false);
                  setShowPracticeWise(false);
                  setBusinessUnitFilter('');
                  setCustomerNameSearch('');
                }}
                style={{
                  background: !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  border: '2px solid white',
                  color: !showBuWise && !showTop10 && !showPracticeWise ? '#1e3a8a' : 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                }}
              >
                Show Account-wise View
              </button>
              <button
                onClick={() => setShowTrendAnalysis(!showTrendAnalysis)}
                style={{
                  background: showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  border: '2px solid white',
                  color: showTrendAnalysis ? '#1e3a8a' : 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s ease',
                  alignSelf: 'flex-start',
                  whiteSpace: 'nowrap',
                  boxSizing: 'border-box',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                }}
              >
                {showTrendAnalysis ? 'Hide trend analysis' : 'View trend analysis'}
              </button>
              {showPracticeWise ? (
                <>
                  <button
                    type="button"
                    onClick={downloadPracticeWiseDistributionData}
                    disabled={!practiceWiseProcessedData.data?.length}
                    style={{
                      background: practiceWiseProcessedData.data?.length ? '#10b981' : '#9ca3af',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: practiceWiseProcessedData.data?.length ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      alignSelf: 'flex-start',
                      whiteSpace: 'nowrap',
                      boxSizing: 'border-box',
                      flexShrink: 0
                    }}
                  >
                    <Download size={16} />
                    Download Data
                  </button>
                  {showTrendAnalysis && (
                    <button
                      type="button"
                      onClick={downloadPracticeWiseTrendData}
                      disabled={!practiceWiseTrendData.data?.length}
                      style={{
                        background: practiceWiseTrendData.data?.length ? '#0ea5e9' : '#9ca3af',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        cursor: practiceWiseTrendData.data?.length ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        alignSelf: 'flex-start',
                        whiteSpace: 'nowrap',
                        boxSizing: 'border-box',
                        flexShrink: 0
                      }}
                    >
                      <Download size={16} />
                      Download Trend Data
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={downloadData}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    alignSelf: 'flex-start',
                    whiteSpace: 'nowrap',
                    boxSizing: 'border-box',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#059669';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#10b981';
                  }}
                >
                  <Download size={16} />
                  Download Data
                </button>
              )}
            </div>
          )}
          {(onBack || showPracticeWise) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch', width: '220px', flexShrink: 0 }}>
              {showPracticeWise ? (
                <BackButton onClick={handleBackToAccountBuDistributionDashboard} aria-label="Back to Account/BU Dashboard" title="Back to Account/BU Dashboard" style={{ width: '100%', justifyContent: 'center' }}>
                  <ChevronLeft size={16} />
                  Back to Account/BU Dashboard
                </BackButton>
              ) : (
                onBack && (
                  <BackButton onClick={onBack} aria-label="Back" title="Back" style={{ width: '100%', justifyContent: 'center' }}>
                    <ChevronLeft size={16} />
                    Back
                  </BackButton>
                )
              )}
              {showPracticeWise && onBack && (
                <BackButton onClick={onBack} aria-label="Back" title="Back" style={{ width: '100%', justifyContent: 'center' }}>
                  <ChevronLeft size={16} />
                  Back
                </BackButton>
              )}
            </div>
          )}
        </div>
      </DashboardHeader>

      {showPracticeWise ? (
        <>
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.875rem', color: '#166534' }}>
            <strong>Customer Success Survey Status report</strong>: <strong>Polled</strong> = count(CSAT SENT DATE), <strong>Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
            <strong>Customer Success Survey All PCSAT report</strong>: rating % = count(RATING=n) ÷ Responded × 100 for <strong>PERSPECTIVE = &quot;Overall Experience&quot;</strong>, grouped by <strong>Practice</strong>.
            {showTrendAnalysis && <> Trend columns compare rating % of this dashboard vs <strong>Practice wise Overall CSAT score -Distribution (Trend Analysis)</strong> — difference shown first, then <span style={{ color: '#16a34a', fontWeight: '600' }}>↑</span> (green) for increase or <span style={{ color: '#dc2626', fontWeight: '600' }}>↓</span> (red) for decrease.</>}
            {csatCycleStartDateFormatted && <> Dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
            {practiceWiseProcessedData.dataSource === 'uploaded' && <> Using uploaded PCSAT file (reference file not found in <code>public/data/</code>).</>}
          </div>
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
            </div>
          </div>
          {showTrendAnalysis && (
            <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Trend legend:</div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.875rem', color: '#374151' }}>
                <span><strong>+X%</strong> <span style={{ color: '#16a34a', fontWeight: '700' }}>↑</span> — rating % increased vs Trend Analysis</span>
                <span><strong>-X%</strong> <span style={{ color: '#dc2626', fontWeight: '700' }}>↓</span> — rating % decreased vs Trend Analysis</span>
                <span><strong>0%</strong> — no change</span>
              </div>
            </div>
          )}
          <ResultsSummary style={{ marginBottom: '0.75rem' }}>
            <strong>Results Summary:</strong> Showing {practiceWiseProcessedData.data?.length || 0} practice{(practiceWiseProcessedData.data?.length || 0) !== 1 ? 's' : ''}.
            <span style={{ marginLeft: '1rem', fontWeight: '600' }}>• Grouped by Practice</span>
          </ResultsSummary>
          {practiceWiseProcessedData.data?.length > 0 ? (
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    {showTrendAnalysis ? (
                      <>
                        <tr>
                          <Th rowSpan={2} style={{ textAlign: 'center', width: '80px', verticalAlign: 'middle' }}>Sr. No.</Th>
                          <Th rowSpan={2} style={{ textAlign: 'left', verticalAlign: 'middle' }}>Practice</Th>
                          <Th colSpan={7} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                          <Th colSpan={5} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>
                            {trendHeaderLabel}
                          </Th>
                        </tr>
                        <tr>
                          <Th style={{ textAlign: 'center' }}>Polled</Th>
                          <Th style={{ textAlign: 'center' }}>Responded</Th>
                          {PRACTICE_RATING_DISPLAY_ORDER.map(r => (
                            <Th key={r} style={{ textAlign: 'center' }}>{PRACTICE_RATING_COLUMN_NAMES[r]}</Th>
                          ))}
                          {PRACTICE_RATING_DISPLAY_ORDER.map(r => (
                            <Th key={`practice-trend-h-${r}`} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000', ...trendCellStyle }}>
                              {PRACTICE_RATING_COLUMN_NAMES[r]}
                            </Th>
                          ))}
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <Th style={{ textAlign: 'center', width: '80px' }}>Sr. No.</Th>
                        <Th style={{ textAlign: 'left' }}>Practice</Th>
                        <Th style={{ textAlign: 'center' }}>Polled</Th>
                        <Th style={{ textAlign: 'center' }}>Responded</Th>
                        {PRACTICE_RATING_DISPLAY_ORDER.map(r => (
                          <Th key={r} style={{ textAlign: 'center' }}>{PRACTICE_RATING_COLUMN_NAMES[r]}</Th>
                        ))}
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {practiceWiseSortedData.map((row) => {
                      const responded = row.cssReceivedCount ?? 0;
                      const isHyphen = responded === 0;
                      const trendRow = practiceWiseTrendByPractice[String(row.practice || '').trim().toLowerCase()];
                      return (
                        <tr key={row.practice}>
                          <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                          <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.cssSentCount ?? 0}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.cssReceivedCount ?? 0}</Td>
                          {PRACTICE_RATING_DISPLAY_ORDER.map(rating => {
                            const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
                            const value = row[colName];
                            const displayVal = isHyphen || value === '-' ? '-' : formatDistributionOneDecimal(value);
                            return (
                              <Td key={rating} style={{ ...getPracticeRatingCellColor(rating, displayVal), textAlign: 'center' }}>
                                {displayVal === '-' ? '-' : `${displayVal}%`}
                              </Td>
                            );
                          })}
                          {showTrendAnalysis && renderPracticeTrendDiffCells(row, trendRow, isHyphen)}
                        </tr>
                      );
                    })}
                    <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>Grand Total</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{practiceWiseGrandTotal.polled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{practiceWiseGrandTotal.responded}</Td>
                      {PRACTICE_RATING_DISPLAY_ORDER.map(rating => {
                        const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
                        const value = practiceWiseGrandTotal[colName];
                        const displayVal = practiceWiseGrandTotal.responded === 0 || value === '-' ? '-' : formatDistributionOneDecimal(value);
                        return (
                          <Td key={rating} style={{ ...getPracticeRatingCellColor(rating, displayVal), textAlign: 'center', fontWeight: '700', backgroundColor: displayVal === '-' ? '#E2E8F0' : undefined }}>
                            {displayVal === '-' ? '-' : `${displayVal}%`}
                          </Td>
                        );
                      })}
                      {showTrendAnalysis && renderPracticeTrendDiffCells(
                        practiceWiseGrandTotal,
                        practiceWiseTrendGrandTotal,
                        practiceWiseGrandTotal.responded === 0,
                        '#E2E8F0'
                      )}
                    </tr>
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          ) : (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              No practice-wise data found in the Customer Success Survey Status report.
            </div>
          )}

          {showTrendAnalysis && (
            <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BarChart3 size={22} />
                  Practice wise Overall CSAT score -Distribution (Trend Analysis)
                </h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={downloadPracticeWiseTrendData}
                    disabled={!practiceWiseTrendData.data?.length}
                    style={{
                      background: practiceWiseTrendData.data?.length ? '#10b981' : '#9ca3af',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: practiceWiseTrendData.data?.length ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    <Download size={16} />
                    Download Data
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrendAnalysis(false)}
                    style={{
                      background: '#64748b',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Hide trend analysis
                  </button>
                </div>
              </div>
              <div style={{ margin: '1rem 0', padding: '1rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '0.875rem', color: '#1e3a8a' }}>
                Data from uploaded trend file <strong>{practiceWiseTrendData.sourceName || 'Trend-Analysis-H12025.xlsx'}</strong> in <strong>&quot;Upload data for trend analysis&quot;</strong>.
                <strong>Customer Success Survey Status report</strong>: <strong>Polled</strong> = count(CSAT SENT DATE), <strong>Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
                <strong>Customer Success Survey All PCSAT report</strong>: rating % = count(RATING=n) ÷ Responded × 100 for <strong>PERSPECTIVE = &quot;Overall Experience&quot;</strong>, grouped by <strong>Practice</strong>.
                {csatCycleStartDateFormatted && <> Dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
              </div>
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
                </div>
              </div>
              {practiceWiseTrendData.error ? (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#b45309', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d' }}>
                  {practiceWiseTrendData.error}
                </div>
              ) : practiceWiseTrendData.data?.length > 0 ? (
                <TableContainer>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th style={{ textAlign: 'center', width: '80px' }}>Sr. No.</Th>
                          <Th style={{ textAlign: 'left' }}>Practice</Th>
                          <Th style={{ textAlign: 'center' }}>Polled</Th>
                          <Th style={{ textAlign: 'center' }}>Responded</Th>
                          {PRACTICE_RATING_DISPLAY_ORDER.map(r => (
                            <Th key={`trend-h-${r}`} style={{ textAlign: 'center' }}>{PRACTICE_RATING_COLUMN_NAMES[r]}</Th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {practiceWiseTrendSortedData.map((row) => {
                          const responded = row.cssReceivedCount ?? 0;
                          const isHyphen = responded === 0;
                          return (
                            <tr key={`trend-${row.practice}`}>
                              <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                              <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                              <Td style={{ textAlign: 'center' }}>{row.cssSentCount ?? 0}</Td>
                              <Td style={{ textAlign: 'center' }}>{row.cssReceivedCount ?? 0}</Td>
                              {PRACTICE_RATING_DISPLAY_ORDER.map(rating => {
                                const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
                                const value = row[colName];
                                const displayVal = isHyphen || value === '-' ? '-' : formatDistributionOneDecimal(value);
                                return (
                                  <Td key={`trend-${row.practice}-${rating}`} style={{ ...getPracticeRatingCellColor(rating, displayVal), textAlign: 'center' }}>
                                    {displayVal === '-' ? '-' : `${displayVal}%`}
                                  </Td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                          <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                          <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>Grand Total</Td>
                          <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{practiceWiseTrendGrandTotal.polled}</Td>
                          <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{practiceWiseTrendGrandTotal.responded}</Td>
                          {PRACTICE_RATING_DISPLAY_ORDER.map(rating => {
                            const colName = PRACTICE_RATING_COLUMN_NAMES[rating];
                            const value = practiceWiseTrendGrandTotal[colName];
                            const displayVal = practiceWiseTrendGrandTotal.responded === 0 || value === '-' ? '-' : formatDistributionOneDecimal(value);
                            return (
                              <Td key={`trend-gt-${rating}`} style={{ ...getPracticeRatingCellColor(rating, displayVal), textAlign: 'center', fontWeight: '700', backgroundColor: displayVal === '-' ? '#E2E8F0' : undefined }}>
                                {displayVal === '-' ? '-' : `${displayVal}%`}
                              </Td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TableContainer>
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  No trend data available for the selected CSAT cycle.
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
      {uploadedData && uploadedData.length > 0 && (
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '1rem', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontWeight: '500', color: '#374151' }}>Filter by Business Unit:</label>
            <input
              type="text"
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              placeholder="Search business unit..."
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            />
          </div>
          {!showBuWise && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontWeight: '500', color: '#374151' }}>Search Customer:</label>
              <input
                type="text"
                value={customerNameSearch}
                onChange={(e) => setCustomerNameSearch(e.target.value)}
                placeholder="Search customer name..."
                style={{
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  minWidth: '200px'
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ 
        background: '#f8fafc', 
        padding: '1rem', 
        borderRadius: '8px', 
        marginBottom: '1rem',
        borderLeft: '4px solid #3b82f6'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#16a34a', 
                borderRadius: '4px',
                border: '1px solid #15803d'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied: Dark Green</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#86efac', 
                borderRadius: '4px',
                border: '1px solid #16a34a'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied: Green</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#f59e0b', 
                borderRadius: '4px',
                border: '1px solid #d97706'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral: Amber</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#fca5a5', 
                borderRadius: '4px',
                border: '1px solid #dc2626'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied: Light Red</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '20px', 
                height: '20px', 
                backgroundColor: '#dc2626', 
                borderRadius: '4px',
                border: '1px solid #991b1b'
              }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied: Dark Red</span>
            </div>
        </div>
      </div>

      {/* Results Summary */}
             <ResultsSummary>
         <strong>Results Summary:</strong> 
         {showBuWise 
           ? `Showing count distribution of ratings (1-5) grouped by Business Unit. Total BUs: ${processedData.data.length}, Filtered: ${filteredData.length}`
           : showTop10
           ? `Showing count distribution of ratings (1-5) for Top 10 customers only. Total Top 10 customers: ${processedData.data.length}, Filtered: ${filteredData.length}`
           : `Showing count distribution of ratings (1-5) for each customer. Total customers: ${processedData.data.length}, Filtered: ${filteredData.length}`
         }
        {filteredData.length > 0 && (
          <span> | Showing all {filteredData.length} records</span>
        )}
      </ResultsSummary>

      {/* Table */}
      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              {showBuWise ? (
                <>
                  <tr>
                    <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Business Unit {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th colSpan={8} style={{ textAlign: 'center' }}>
                      {acsatCycle || 'H2 2025'}
                    </Th>
                    {showTrendAnalysis && (
                      <Th colSpan={5} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>
                        {trendHeaderLabel}
                      </Th>
                    )}
                  </tr>
                  <tr>
                    <Th onClick={() => handleSort('customerCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      # Accounts Polled {sortConfig.key === 'customerCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Polled {sortConfig.key === 'cssSentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Responded {sortConfig.key === 'cssReceivedCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    {processedData.ratingColumns.map(rating => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      return (
                        <Th key={rating} onClick={() => handleSort(ratingColumnMapping[rating])} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          {ratingColumnMapping[rating]} {sortConfig.key === ratingColumnMapping[rating] && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </Th>
                      );
                    })}
                    {showTrendAnalysis && RATING_DISPLAY_ORDER.map(rating => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      return <Th key={`trend-${rating}`} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '120px', padding: '0.5rem' }}>{ratingColumnMapping[rating]}</Th>;
                    })}
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Business Unit {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th rowSpan={2} onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Account Name {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th colSpan={7} style={{ textAlign: 'center' }}>
                      {acsatCycle || 'H2 2025'}
                    </Th>
                    {((showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis) && (
                      <Th colSpan={5} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>
                        {trendHeaderLabel}
                      </Th>
                    )}
                  </tr>
                  <tr>
                    <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Polled {sortConfig.key === 'cssSentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Responded {sortConfig.key === 'cssReceivedCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    {processedData.ratingColumns.map(rating => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      return (
                        <Th key={rating} onClick={() => handleSort(ratingColumnMapping[rating])} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          {ratingColumnMapping[rating]} {sortConfig.key === ratingColumnMapping[rating] && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </Th>
                      );
                    })}
                    {(showTop10 || (!showBuWise && !showTop10)) && showTrendAnalysis && RATING_DISPLAY_ORDER.map(rating => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      return <Th key={`trend-${rating}`} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000', whiteSpace: 'normal', wordWrap: 'break-word', overflowWrap: 'break-word', maxWidth: '120px', padding: '0.5rem' }}>{ratingColumnMapping[rating]}</Th>;
                    })}
                  </tr>
                </>
              )}
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => {
                  const isTop10GrandTotal = row.isTop10GrandTotal === true;
                  const isTop10OrgLevel = row.isTop10OrgLevel === true;
                  const isOtherAccounts = (row.customerName || '') === 'Other Accounts';
                  const rowBg = showTop10 && !showBuWise
                    ? (isTop10GrandTotal ? TOP10_ACCOUNTS_ROW_BG : (isTop10OrgLevel ? TOP10_OVERALL_ROW_BG : (isOtherAccounts ? OTHER_ACCOUNTS_ROW_BG : undefined)))
                    : ((isTop10GrandTotal || isTop10OrgLevel) ? ORG_LEVEL_ROW_BG : undefined);
                  const cellStyle = (align, isNumeric) => {
                    const base = { border: '1px solid #d1d5db', ...align };
                    if (rowBg) return { ...base, backgroundColor: rowBg, fontWeight: '700' };
                    return base;
                  };
                  const srNo = showBuWise ? row.sNo : (showTop10 ? row.sNo : index + 1);
                  const rowKey = isTop10GrandTotal ? 'top10-grand' : (isTop10OrgLevel ? 'top10-org' : (isOtherAccounts ? 'other-accounts' : index));
                  const hyphenRow = !isTop10GrandTotal && !isTop10OrgLevel && !isOtherAccounts && isSeadAndPolledZero(row);
                  return (
                  <tr key={rowKey} style={rowBg ? { backgroundColor: rowBg, fontWeight: '700' } : undefined}>
                    <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : srNo}</Td>
                    {showBuWise ? (
                      <>
                        <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', ...(rowBg && { backgroundColor: rowBg, fontWeight: '700' }) }}>{hyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : row.customerCount}</Td>
                        <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : row.cssSentCount}</Td>
                        <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : row.cssReceivedCount}</Td>
                      </>
                     ) : (
                       <>
                         <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', ...(rowBg && { backgroundColor: rowBg, fontWeight: '700' }) }}>{hyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                         <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', ...(rowBg && { backgroundColor: rowBg, fontWeight: '700' }) }}>{hyphenRow ? '-' : row.customerName}</Td>
                         <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : row.cssSentCount}</Td>
                         <Td style={cellStyle({ textAlign: 'center' }, true)}>{hyphenRow ? '-' : row.cssReceivedCount}</Td>
                       </>
                     )}
                    {processedData.ratingColumns.map(rating => {
                      const ratingColumnMapping = {
                        5: 'Highly Satisfied',
                        4: 'Satisfied',
                        3: 'Neutral',
                        2: 'Dissatisfied',
                        1: 'Highly Dissatisfied'
                      };
                      const value = row[ratingColumnMapping[rating]];
                      const isHyphen = hyphenRow || value === '-' || (value === 0 && (row.cssReceivedCount || 0) === 0);
                      const getCellColor = (rating, val) => {
                        if (isHyphen || val === '-') return { backgroundColor: rowBg ? rowBg : '#f9fafb', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                        if (val === 0) return { backgroundColor: rowBg ? rowBg : '#f9fafb', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                        switch (rating) {
                          case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                          case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                          case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                          case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                          case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                          default: return { backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', border: '1px solid #d1d5db' };
                        }
                      };
                      return (
                        <Td key={rating} style={{ ...getCellColor(rating, value), border: '1px solid #d1d5db', textAlign: 'center' }}>
                          {isHyphen || value === '-' ? '-' : `${formatDistributionOneDecimal(value)}%`}
                        </Td>
                      );
                    })}
                    {showTop10 && showTrendAnalysis && !showBuWise && (() => {
                      const isSummaryRow = isTop10GrandTotal || isOtherAccounts || isTop10OrgLevel;
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      const trendRowForSummary = isTop10GrandTotal ? trendTop10OrgRow : isOtherAccounts ? trendOtherAccountsSummaryRow : (isTop10OrgLevel ? trendOverallSummaryRow : null);
                      if (hyphenRow) {
                        return RATING_DISPLAY_ORDER.map(rating => (
                          <Td key={`trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || '#f9fafb', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>-</Td>
                        ));
                      }
                      if (isSummaryRow && trendRowForSummary) {
                        return RATING_DISPLAY_ORDER.map(rating => {
                          const colName = ratingColumnMapping[rating];
                          const dashVal = row[colName];
                          const trendVal = trendRowForSummary[colName];
                          const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
                          const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
                          const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
                          const diffStr = diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                          const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                          const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                          const display = (dashNum == null && trendNum == null) ? '-' : (
                            <span style={{ whiteSpace: 'nowrap' }}>{diffStr ? `(${diffStr}) ` : ''}{arrow != null && <span style={{ color: arrowColor, fontWeight: '700' }}>{arrow}</span>}</span>
                          );
                          return (
                            <Td key={`trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: arrowColor, fontWeight: '700', ...trendCellStyle }}>
                              {display}
                            </Td>
                          );
                        });
                      }
                      if (isSummaryRow) {
                        return RATING_DISPLAY_ORDER.map(rating => (
                          <Td key={`trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: '#6b7280', fontWeight: '700', ...trendCellStyle }}>-</Td>
                        ));
                      }
                      const trendRow = trendTop10ByAccountBu[`${(row.customerName || '').toString().trim()}|${normalizeBUDisplay(row.businessUnit)}`];
                      return RATING_DISPLAY_ORDER.map(rating => {
                        const colName = ratingColumnMapping[rating];
                        const dashVal = row[colName];
                        const trendVal = trendRow ? trendRow[colName] : null;
                        const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
                        const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
                        const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
                        const diffStr = diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                        const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                        const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                        const display = (dashNum == null && trendNum == null) ? '-' : (
                          <span style={{ whiteSpace: 'nowrap' }}>{diffStr ? `(${diffStr}) ` : ''}{arrow != null && <span style={{ color: arrowColor, fontWeight: '700' }}>{arrow}</span>}</span>
                        );
                        return (
                          <Td key={`trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: arrowColor, fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>
                            {display}
                          </Td>
                        );
                      });
                    })()}
                    {/* Account-wise trend columns: compare H2 vs H1 reference (trendAccountWiseSentReceivedH1) */}
                    {!showBuWise && !showTop10 && showTrendAnalysis && (() => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      if (hyphenRow) {
                        return RATING_DISPLAY_ORDER.map(rating => (
                          <Td key={`trend-account-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || '#f9fafb', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>-</Td>
                        ));
                      }
                      const byKey = {};
                      (trendAccountWiseSentReceivedH1?.rows || []).forEach(tr => {
                        const k = `${(tr.accountName || '').toString().trim()}|${normalizeBUDisplay(tr.businessUnit)}`;
                        byKey[k] = tr;
                      });
                      const trendRow = byKey[`${(row.customerName || '').toString().trim()}|${normalizeBUDisplay(row.businessUnit)}`];
                      return RATING_DISPLAY_ORDER.map(rating => {
                        const colName = ratingColumnMapping[rating];
                        const dashVal = row[colName];
                        const trendVal = trendRow ? trendRow[colName] : null;
                        if (!trendRow) {
                          return <Td key={`trend-account-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: '#6b7280', fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>-</Td>;
                        }
                        const dashNum = (dashVal != null && dashVal !== '-' && !Number.isNaN(Number(dashVal))) ? Number(dashVal) : 0;
                        const trendNum = (trendVal != null && trendVal !== '-' && !Number.isNaN(Number(trendVal))) ? Number(trendVal) : 0;
                        const diff = Math.round((dashNum - trendNum) * 10) / 10;
                        const diffStr = diff != null ? (diff > 0 ? `+${diff}` : `${diff}`) : '';
                        const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                        const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                        const display = (
                          <span style={{ whiteSpace: 'nowrap' }}>{diffStr ? `(${diffStr}) ` : ''}{arrow != null && <span style={{ color: arrowColor, fontWeight: '700' }}>{arrow}</span>}</span>
                        );
                        return (
                          <Td key={`trend-account-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: arrowColor, fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>
                            {display}
                          </Td>
                        );
                      });
                    })()}
                    {showBuWise && showTrendAnalysis && (() => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      const trendRow = trendByBuMap[normalizeBUDisplay(row.businessUnit)];
                      return RATING_DISPLAY_ORDER.map(rating => {
                        const colName = ratingColumnMapping[rating];
                        const dashVal = row[colName];
                        const trendVal = trendRow ? trendRow[colName] : null;
                        const dashNum = (dashVal != null && dashVal !== '-') ? Number(dashVal) : null;
                        const trendNum = (trendVal != null && trendVal !== '-') ? Number(trendVal) : null;
                        const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
                        const diffStr = diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '';
                        const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                        const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                        const display = (dashNum == null && trendNum == null) ? '-' : (
                          <span style={{ whiteSpace: 'nowrap' }}>{diffStr ? `(${diffStr}) ` : ''}{arrow != null && <span style={{ color: arrowColor, fontWeight: '700' }}>{arrow}</span>}</span>
                        );
                        return (
                          <Td key={`trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', backgroundColor: rowBg || 'transparent', color: arrowColor, fontWeight: rowBg ? '700' : 'normal', ...trendCellStyle }}>
                            {display}
                          </Td>
                        );
                      });
                    })()}
                  </tr>
                  );
                })
              ) : null}
              {/* Account-wise Org level row (grand total) */}
              {!showBuWise && !showTop10 && sortedData.length > 0 && (() => {
                const orgRow = computeAccountWiseOrgRow(sortedData);
                if (!orgRow) return null;
                const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                const trendByKey = {};
                (trendAccountWiseSentReceivedH1?.rows || []).forEach(tr => {
                  const k = `${(tr.accountName || '').toString().trim()}|${normalizeBUDisplay(tr.businessUnit)}`;
                  trendByKey[k] = tr;
                });
                const trendOrg = trendByKey['Org level|Org level'];
                return (
                  <tr key="account-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}></Td>
                    <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{normalizeBUDisplay(orgRow.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.customerName}</Td>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.cssSentCount}</Td>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.cssReceivedCount}</Td>
                    {RATING_DISPLAY_ORDER.map(rating => {
                      const colName = ratingColumnMapping[rating];
                      const val = orgRow[colName];
                      const isHyphen = val === '-' || val == null;
                      const getCellColor = (r, v) => {
                        if (isHyphen || v == null || v === '-') return { backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        switch (r) {
                          case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          default: return { backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        }
                      };
                      return (
                        <Td key={`account-org-${colName}`} style={getCellColor(rating, isHyphen ? null : val)}>
                          {isHyphen ? '-' : `${formatDistributionOneDecimal(val)}%`}
                        </Td>
                      );
                    })}
                    {!showBuWise && !showTop10 && showTrendAnalysis && RATING_DISPLAY_ORDER.map(rating => {
                      const colName = ratingColumnMapping[rating];
                      if (!trendOrg) return <Td key={`account-org-trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', color: '#6b7280', fontWeight: '700', ...trendCellStyle }}>-</Td>;
                      const dashVal = orgRow[colName];
                      const trendVal = trendOrg[colName];
                      const dashNum = (dashVal != null && dashVal !== '-' && !Number.isNaN(Number(dashVal))) ? Number(dashVal) : 0;
                      const trendNum = (trendVal != null && trendVal !== '-' && !Number.isNaN(Number(trendVal))) ? Number(trendVal) : 0;
                      const diff = Math.round((dashNum - trendNum) * 10) / 10;
                      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
                      const arrow = diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                      const arrowColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                      return (
                        <Td key={`account-org-trend-${rating}`} style={{ border: '1px solid #d1d5db', textAlign: 'center', color: arrowColor, fontWeight: '700', ...trendCellStyle }}>
                          <span style={{ whiteSpace: 'nowrap' }}>{`(${diffStr}) `}{arrow != null && <span style={{ color: arrowColor, fontWeight: '700' }}>{arrow}</span>}</span>
                        </Td>
                      );
                    })}
                  </tr>
                );
              })()}
              {showBuWise && sortedData.length > 0 && (() => {
                const orgRow = computeBUWiseDistributionOrgRow(sortedData, processedData.buWiseOrgLevelCounts);
                if (!orgRow) return null;
                const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                return (
                  <tr key="bu-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.sNo}</Td>
                    <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.businessUnit}</Td>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.customerCount}</Td>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.cssSentCount}</Td>
                    <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{orgRow.cssReceivedCount}</Td>
                    {processedData.ratingColumns.map(rating => {
                      const value = orgRow[ratingColumnMapping[rating]];
                      const isHyphen = value === '-';
                      const getCellColor = (r, val) => {
                        if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                        if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                        switch (r) {
                          case 1: return { backgroundColor: '#dc2626', color: 'white' };
                          case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                          case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                          case 4: return { backgroundColor: '#86efac', color: 'black' };
                          case 5: return { backgroundColor: '#16a34a', color: 'black' };
                          default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                        }
                      };
                      return (
                        <Td key={rating} style={{ ...getCellColor(rating, value), fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' }}>
                          {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                        </Td>
                      );
                    })}
                    {showBuWise && showTrendAnalysis && (() => {
                      const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                      return RATING_DISPLAY_ORDER.map(rating => {
                        const colName = ratingColumnMapping[rating];
                        const dashPct = orgRow[colName];
                        const trendPct = trendBuWiseOrgRow ? trendBuWiseOrgRow[colName] : null;
                        const dashNum = (dashPct != null && dashPct !== '-') ? Number(dashPct) : null;
                        const trendNum = (trendPct != null && trendPct !== '-') ? Number(trendPct) : null;
                        const diff = (dashNum != null && trendNum != null) ? Math.round((dashNum - trendNum) * 10) / 10 : null;
                        const diffStr = diff != null ? (diff > 0 ? `+${diff}%` : `${diff}%`) : '';
                        const arrow = diff != null && diff !== 0 ? (diff > 0 ? '↑' : '↓') : null;
                        const trendCellFontColor = arrow === '↑' ? '#16a34a' : arrow === '↓' ? '#dc2626' : '#374151';
                        const display = (dashNum == null && trendNum == null) ? '-' : (
                          <span style={{ whiteSpace: 'nowrap' }}>{diffStr ? `(${diffStr}) ` : ''}{arrow != null && <span style={{ color: arrow === '↑' ? '#16a34a' : '#dc2626', fontWeight: '700' }}>{arrow}</span>}</span>
                        );
                        return (
                          <Td key={`org-trend-${rating}`} style={{ backgroundColor: 'transparent', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center', color: trendCellFontColor, ...trendCellStyle }}>
                            {display}
                          </Td>
                        );
                      });
                    })()}
                  </tr>
                );
              })()}
              {sortedData.length === 0 && !(showBuWise && computeBUWiseDistributionOrgRow(sortedData, processedData.buWiseOrgLevelCounts)) ? (
                <tr>
                  <Td colSpan={showBuWise ? (5 + processedData.ratingColumns.length + (showTrendAnalysis ? 5 : 0)) : (3 + 7 + (showTop10 && showTrendAnalysis ? 5 : 0))} style={{ textAlign: 'center', padding: '2rem' }}>
                    No data found
                  </Td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>

      {/* Trend Analysis (H1 2025 reference) – Account-wise sent/received report. Shown below the account-wise dashboard when "View trend analysis" is on. */}
      {!showPracticeWise && !showBuWise && !showTop10 && showTrendAnalysis && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              Trend Analysis ({trendAnalysisFiles?.[0]?.saveName || 'reference'}) – CSAT sent and received Report (Account-wise)
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                onClick={downloadTrendAnalysisAccountWiseH1SentReceived}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
              <button
                type="button"
                onClick={() => setShowTrendAnalysis(false)}
                style={{
                  background: '#64748b',
                  border: 'none',
                  color: 'white',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Hide trend analysis
              </button>
            </div>
          </div>
          <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.875rem', color: '#64748b' }}>
            Data from uploaded trend file (e.g. Trend-Analysis-H12025.xlsx). Sheet Customer Success Survey Status report: #Polled = count(CSAT SENT DATE),
            #Responded = count(CSAT RECEIVED DATE), grouped by CUSTOMER_ID/CUST_ID and Business Unit (date ≥ cycle start {csatCycleStartDateFormatted || 'MM-DD-YYYY'}), ordered by Business Unit.
          </p>
          {trendAnalysisFiles?.length === 0 ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend data uploaded. Upload files in &quot;Upload data for trend analysis&quot; section and return here.
            </div>
          ) : !csatCycleStartDateFormatted ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              CSAT cycle start date is required to filter trend data. Set it in the main upload flow.
            </div>
          ) : trendAccountWiseSentReceivedH1?.error ? (
            <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.875rem', color: '#b91c1c' }}>
              {trendAccountWiseSentReceivedH1.error}
            </div>
          ) : trendAccountWiseSentReceivedH1?.rows?.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                    <Th style={{ textAlign: 'center' }}>Account Name</Th>
                    <Th style={{ textAlign: 'center' }}>#Polled</Th>
                    <Th style={{ textAlign: 'center' }}>#Responded</Th>
                    <Th style={{ textAlign: 'center' }}>Highly Satisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Satisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Neutral</Th>
                    <Th style={{ textAlign: 'center' }}>Dissatisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Highly Dissatisfied</Th>
                  </tr>
                </thead>
                <tbody>
                  {trendAccountWiseSentReceivedH1.rows.map((r, idx) => (
                    <tr key={`trend-account-sentrecv-${idx}-${r.businessUnit}-${r.accountName}`}>
                      <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{normalizeBUDisplay(r.businessUnit)}</Td>
                      <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{r.accountName}</Td>
                      <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{r.polled}</Td>
                      <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{r.responded}</Td>
                      {[5, 4, 3, 2, 1].map(rating => {
                        const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                        const colName = ratingColumnMapping[rating];
                        const val = r[colName];
                        const isHyphen = val == null || val === '-' || (Number(val) === 0 && (r.responded || 0) === 0);
                        const getCellColor = (rt, v) => {
                          if (isHyphen || v == null || v === '-') return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                          switch (rt) {
                            case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            default: return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                          }
                        };
                        return (
                          <Td key={`trend-account-h1-${colName}-${idx}`} style={getCellColor(rating, isHyphen ? null : val)}>
                            {isHyphen ? '-' : `${formatDistributionOneDecimal(val)}%`}
                          </Td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          ) : (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend rows for the selected cycle. Ensure the trend file has the Customer Success Survey Status report and rows with CSAT SENT DATE / CSAT RECEIVED DATE ≥ {csatCycleStartDateFormatted}.
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis – Top 10: rating columns from sheet "CSAT received Report", PERSPECTIVE = "Overall Experience", TYPE OF ACCOUNT = "Top 10"; #Polled/#Responded from sheet "CSAT sent and received Report". Shown below "Top 10 account - Overall CSAT score -Distribution(Score 1 to 5)" when "View trend analysis" is on. */}
      {!showPracticeWise && showTop10 && showTrendAnalysis && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              Trend Analysis – CSAT received Report (Top 10)
            </h2>
            {trendTop10TableData.length > 0 && (
              <button
                type="button"
                onClick={downloadTrendAnalysisTop10Table}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={16} />
                Download
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#64748b' }}>
            Data from uploaded trend file (e.g. Trend-Analysis-H12025.xlsx in data folder). Sheet Customer Success Survey All PCSAT report: consider only PERSPECTIVE = &quot;Overall Experience&quot;, TYPE OF ACCOUNT = &quot;Top 10&quot;. Column names: RATING 1 = Highly Dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Highly Satisfied. Value = count(RATING)/#Responded×100 (Highly Satisfied = count(RATING=5)/#Responded×100, etc.) by Account Name and Business Unit. #Polled and #Responded from the Customer Success Survey Status report, TYPE OF ACCOUNT = &quot;Top 10&quot;, dates ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}).
          </p>
          {trendAnalysisFiles?.length === 0 ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend data uploaded. Upload files in &quot;Upload data for trend analysis&quot; section and return here.
            </div>
          ) : !csatCycleStartDateFormatted ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              CSAT cycle start date is required. Set it in the main upload flow.
            </div>
          ) : trendTop10TableData.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ textAlign: 'center' }}>Account Name</Th>
                    <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                    <Th style={{ textAlign: 'center' }}>#Polled</Th>
                    <Th style={{ textAlign: 'center' }}>#Responded</Th>
                    {RATING_DISPLAY_ORDER.map(r => (
                      <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trendTop10TableData.map((row, idx) => {
                    const getCellColor = (rating, val) => {
                      if (val == null || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                      switch (rating) {
                        case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        default: return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                      }
                    };
                    return (
                      <tr key={`trend-top10-${idx}-${row.accountName}-${row.businessUnit}`}>
                        <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.accountName}</Td>
                        <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                        <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = value === '-' || value == null;
                          return (
                            <Td key={colName} style={getCellColor(rating, isHyphen ? null : value)}>
                              {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {[trendTop10AccountsSummaryRow, trendOtherAccountsSummaryRow, trendOverallSummaryRow].filter(Boolean).map((summaryRow, summaryIdx) => {
                    const rowKey = summaryRow.accountName || `summary-${summaryIdx}`;
                    return (
                      <tr key={rowKey} style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                        <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{summaryRow.accountName}</Td>
                        <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{summaryRow.businessUnit || ''}</Td>
                        <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{summaryRow.polled}</Td>
                        <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{summaryRow.responded}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = summaryRow[colName];
                          const isHyphen = value === '-' || value == null;
                          const getCellColor = (r, val) => {
                            if (val == null || val === '-') return { backgroundColor: ORG_LEVEL_ROW_BG, color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                              case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                              default: return { backgroundColor: ORG_LEVEL_ROW_BG, color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                            }
                          };
                          return (
                            <Td key={colName} style={getCellColor(rating, isHyphen ? null : value)}>
                              {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </TableContainer>
          ) : (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend data for Top 10 in the selected cycle. Ensure the trend file has the Customer Success Survey Status report with TYPE OF ACCOUNT = &quot;Top 10&quot; and CSAT SENT DATE / CSAT RECEIVED DATE ≥ {csatCycleStartDateFormatted}. For rating columns, the Customer Success Survey All PCSAT report must have PERSPECTIVE = &quot;Overall Experience&quot; and TYPE OF ACCOUNT = &quot;Top 10&quot;.
            </div>
          )}
        </div>
      )}

      {/* Trend Analysis – rating distribution from sheet "CSAT received Report", PERSPECTIVE = "Overall Experience"; #Polled/#Responded from sheet "CSAT sent and received Report". Group by BUSINESS UNIT. Shown when BU-wise view is active and "View trend analysis" is on. */}
      {!showPracticeWise && showBuWise && showTrendAnalysis && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              Trend Analysis – CSAT received Report (by Business Unit)
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {trendBuWiseDistributionData.length > 0 && (
                <button
                  type="button"
                  onClick={downloadTrendAnalysisTable}
                  style={{
                    background: '#10b981',
                    border: 'none',
                    color: 'white',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Download size={16} />
                  Download Excel
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowTrendAnalysis(false)}
                style={{
                  background: '#64748b',
                  border: 'none',
                  color: 'white',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Hide trend analysis
              </button>
            </div>
          </div>
          <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.875rem', color: '#64748b' }}>
            Data from uploaded trend file (e.g. Trend-Analysis-H12025.xlsx). Sheet Customer Success Survey All PCSAT report: PERSPECTIVE = &quot;Overall Experience&quot;, group by BUSINESS UNIT for rating distribution. #Polled and #Responded from the Customer Success Survey Status report: #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE), grouped by BUSINESS UNIT (date ≥ cycle start). Rating columns = count(RATING=n)/#Responded×100 (RATING 1–5: Highly Dissatisfied to Highly Satisfied).
          </p>
          {trendAnalysisFiles?.length === 0 ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend data uploaded. Upload files in &quot;Upload data for trend analysis&quot; section and return here.
            </div>
          ) : !csatCycleStartDateFormatted ? (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              CSAT cycle start date is required to filter trend data. Set it in the main upload flow.
            </div>
          ) : trendBuWiseDistributionData.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                    <Th style={{ textAlign: 'center' }}>#Polled</Th>
                    <Th style={{ textAlign: 'center' }}>#Responded</Th>
                    <Th style={{ textAlign: 'center' }}>Highly Satisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Satisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Neutral</Th>
                    <Th style={{ textAlign: 'center' }}>Dissatisfied</Th>
                    <Th style={{ textAlign: 'center' }}>Highly Dissatisfied</Th>
                  </tr>
                </thead>
                <tbody>
                  {trendBuWiseDistributionData.map((row, idx) => {
                    const ratingColumnMapping = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                    const getCellColor = (rating, val) => {
                      if (val == null || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                      switch (rating) {
                        case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                        default: return { backgroundColor: '#f9fafb', color: '#6b7280', border: '1px solid #d1d5db', textAlign: 'center' };
                      }
                    };
                    return (
                      <tr key={`trend-bu-${idx}-${row.businessUnit}`}>
                        <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                        <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                        {[5, 4, 3, 2, 1].map(rating => {
                          const colName = ratingColumnMapping[rating];
                          const val = row[colName];
                          const displayVal = val == null ? '-' : `${formatDistributionOneDecimal(val)}%`;
                          return (
                            <Td key={colName} style={getCellColor(rating, val == null ? null : val)}>
                              {displayVal}
                            </Td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {trendBuWiseOrgRow && (
                    <tr key="trend-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                      <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{trendBuWiseOrgRow.businessUnit}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{trendBuWiseOrgRow.polled}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700', border: '1px solid #d1d5db' }}>{trendBuWiseOrgRow.responded}</Td>
                      {[5, 4, 3, 2, 1].map(rating => {
                        const trendOrgRatingCols = { 5: 'Highly Satisfied', 4: 'Satisfied', 3: 'Neutral', 2: 'Dissatisfied', 1: 'Highly Dissatisfied' };
                        const colName = trendOrgRatingCols[rating];
                        const val = trendBuWiseOrgRow[colName];
                        const displayVal = val == null ? '-' : `${formatDistributionOneDecimal(val)}%`;
                        const getTrendOrgCellColor = (r, v) => {
                          if (v == null || v === '-') return { backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          switch (r) {
                            case 1: return { backgroundColor: '#dc2626', color: 'white', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 2: return { backgroundColor: '#fca5a5', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 3: return { backgroundColor: '#f59e0b', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 4: return { backgroundColor: '#86efac', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            case 5: return { backgroundColor: '#16a34a', color: 'black', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                            default: return { backgroundColor: '#f9fafb', color: '#6b7280', fontWeight: '700', border: '1px solid #d1d5db', textAlign: 'center' };
                          }
                        };
                        return (
                          <Td key={`trend-org-${colName}`} style={getTrendOrgCellColor(rating, val == null ? null : val)}>
                            {displayVal}
                          </Td>
                        );
                      })}
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          ) : (
            <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
              No trend data for the selected cycle. Ensure the trend file has the Customer Success Survey Status report and rows with CSAT SENT DATE / CSAT RECEIVED DATE ≥ {csatCycleStartDateFormatted}.
            </div>
          )}
        </div>
      )}

      {/* Fully Managed – BU Wise CSAT score - Distribution (Score 1 to 5) - below BU Wise dashboard, ENGAGEMENT TYPE = "Fully Managed" only */}
      {showBuWise && uploadedData && uploadedData.length > 0 && fullyManagedBUWiseScoreDistribution.data.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Fully Managed – BU Wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
              <button
                onClick={downloadFullyManagedBUWiseScoreDistribution}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
          display: 'flex', 
          alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Fully Managed only.</strong> Sheet Customer Success Survey All PCSAT report: PERSPECTIVE = &quot;Overall Experience&quot;, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT. # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT. Polled/Responded from the Customer Success Survey Status report (Fully Managed) by BUSINESS UNIT. Rating columns = count(RATING)/Responded×100.
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                      <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {fullyManagedBUWiseScoreDistribution.data.map((row, index) => {
                      const fmHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.businessUnit || index}>
                        <Td style={{ textAlign: 'center' }}>{fmHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{fmHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{fmHyphenRow ? '-' : (row.cssSentCount ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{fmHyphenRow ? '-' : (row.cssReceivedCount ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = fmHyphenRow || value === '-';
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center' }}>
                              {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {fullyManagedBUWiseScoreDistribution.data.length > 0 && (() => {
                      const orgRow = computeBUWiseDistributionOrgRow(fullyManagedBUWiseScoreDistribution.data, fullyManagedBUWiseScoreDistribution.orgLevelCounts);
                      if (!orgRow) return null;
                      return (
                        <tr key="fm-bu-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.sNo}</Td>
                          <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{normalizeBUDisplay(orgRow.businessUnit)}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssSentCount}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssReceivedCount}</Td>
                          {RATING_DISPLAY_ORDER.map(rating => {
                            const value = orgRow[RATING_COLUMN_NAMES[rating]];
                            const isHyphen = value === '-';
                            const getCellColor = (r, val) => {
                              if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              switch (r) { case 1: return { backgroundColor: '#dc2626', color: 'white' }; case 2: return { backgroundColor: '#fca5a5', color: 'black' }; case 3: return { backgroundColor: '#f59e0b', color: 'black' }; case 4: return { backgroundColor: '#86efac', color: 'black' }; case 5: return { backgroundColor: '#16a34a', color: 'black' }; default: return { backgroundColor: '#f9fafb', color: '#6b7280' }; }
                            };
                            return (
                              <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center', fontWeight: '700' }}>
                                {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                              </Td>
                            );
                          })}
                        </tr>
                      );
                    })()}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

      {/* Co-Managed – BU Wise Overall CSAT score - Distribution (Score 1 to 5) - below Fully Managed BU Wise, ENGAGEMENT TYPE = "Co-Managed" only */}
      {showBuWise && uploadedData && uploadedData.length > 0 && coManagedBUWiseScoreDistribution.data.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Co-Managed – BU Wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
          <button
                onClick={downloadCoManagedBUWiseScoreDistribution}
            style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
              padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
          </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Co-Managed only.</strong> Sheet Customer Success Survey All PCSAT report: PERSPECTIVE = &quot;Overall Experience&quot;, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by BUSINESS UNIT. # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by BUSINESS UNIT. Polled/Responded from the Customer Success Survey Status report (Co-Managed) by BUSINESS UNIT. Rating columns = count(RATING)/Responded×100.
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                      <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {coManagedBUWiseScoreDistribution.data.map((row, index) => {
                      const cmHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.businessUnit || index}>
                        <Td style={{ textAlign: 'center' }}>{cmHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{cmHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{cmHyphenRow ? '-' : (row.cssSentCount ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{cmHyphenRow ? '-' : (row.cssReceivedCount ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = cmHyphenRow || value === '-';
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center' }}>
                              {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {coManagedBUWiseScoreDistribution.data.length > 0 && (() => {
                      const orgRow = computeBUWiseDistributionOrgRow(coManagedBUWiseScoreDistribution.data, coManagedBUWiseScoreDistribution.orgLevelCounts);
                      if (!orgRow) return null;
                      return (
                        <tr key="cm-bu-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.sNo}</Td>
                          <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{normalizeBUDisplay(orgRow.businessUnit)}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssSentCount}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssReceivedCount}</Td>
                          {RATING_DISPLAY_ORDER.map(rating => {
                            const value = orgRow[RATING_COLUMN_NAMES[rating]];
                            const isHyphen = value === '-';
                            const getCellColor = (r, val) => {
                              if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              switch (r) { case 1: return { backgroundColor: '#dc2626', color: 'white' }; case 2: return { backgroundColor: '#fca5a5', color: 'black' }; case 3: return { backgroundColor: '#f59e0b', color: 'black' }; case 4: return { backgroundColor: '#86efac', color: 'black' }; case 5: return { backgroundColor: '#16a34a', color: 'black' }; default: return { backgroundColor: '#f9fafb', color: '#6b7280' }; }
                            };
                            return (
                              <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center', fontWeight: '700' }}>
                                {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                              </Td>
                            );
                          })}
                        </tr>
                      );
                    })()}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

      {/* Staff Augmentation – BU Wise Overall CSAT score - Distribution (Score 1 to 5) - below Co-Managed BU Wise, ENGAGEMENT TYPE = "Staff Augmentation" only */}
      {showBuWise && uploadedData && uploadedData.length > 0 && staffAugmentationBUWiseScoreDistribution.data.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Staff Augmentation – BU Wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
          <button
                onClick={downloadStaffAugmentationBUWiseScoreDistribution}
            style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
              padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
          </button>
        </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Staff Augmentation only.</strong> Sheet Customer Success Survey All PCSAT report: PERSPECTIVE = &quot;Overall Experience&quot;, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by BUSINESS UNIT. # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by BUSINESS UNIT. Polled/Responded from the Customer Success Survey Status report (Staff Augmentation) by BUSINESS UNIT. Rating columns = count(RATING)/Responded×100.
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                      <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {staffAugmentationBUWiseScoreDistribution.data.map((row, index) => {
                      const saHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.businessUnit || index}>
                        <Td style={{ textAlign: 'center' }}>{saHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{saHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{saHyphenRow ? '-' : (row.cssSentCount ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{saHyphenRow ? '-' : (row.cssReceivedCount ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = saHyphenRow || value === '-';
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center' }}>
                              {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {staffAugmentationBUWiseScoreDistribution.data.length > 0 && (() => {
                      const orgRow = computeBUWiseDistributionOrgRow(staffAugmentationBUWiseScoreDistribution.data, staffAugmentationBUWiseScoreDistribution.orgLevelCounts);
                      if (!orgRow) return null;
                      return (
                        <tr key="sa-bu-org" style={{ fontWeight: '700', backgroundColor: ORG_LEVEL_ROW_BG }}>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.sNo}</Td>
                          <Td style={{ textAlign: 'left', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{normalizeBUDisplay(orgRow.businessUnit)}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssSentCount}</Td>
                          <Td style={{ textAlign: 'center', backgroundColor: ORG_LEVEL_ROW_BG, fontWeight: '700' }}>{orgRow.cssReceivedCount}</Td>
                          {RATING_DISPLAY_ORDER.map(rating => {
                            const value = orgRow[RATING_COLUMN_NAMES[rating]];
                            const isHyphen = value === '-';
                            const getCellColor = (r, val) => {
                              if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              if (val === 0) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                              switch (r) { case 1: return { backgroundColor: '#dc2626', color: 'white' }; case 2: return { backgroundColor: '#fca5a5', color: 'black' }; case 3: return { backgroundColor: '#f59e0b', color: 'black' }; case 4: return { backgroundColor: '#86efac', color: 'black' }; case 5: return { backgroundColor: '#16a34a', color: 'black' }; default: return { backgroundColor: '#f9fafb', color: '#6b7280' }; }
                            };
                            return (
                              <Td key={rating} style={{ ...getCellColor(rating, value), textAlign: 'center', fontWeight: '700' }}>
                                {isHyphen ? '-' : `${formatDistributionOneDecimal(value)}%`}
                              </Td>
                            );
                          })}
                        </tr>
                      );
                    })()}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

      {/* Fully Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5) - Account-wise only (not Top 10, not BU-wise) */}
      {!showBuWise && !showTop10 && uploadedData && uploadedData.length > 0 && fullyManagedAccountWiseScoreDistribution.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Fully Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
              <button
                onClick={downloadFullyManagedAccountWiseScoreDistribution}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Fully Managed only.</strong> PERSPECTIVE = &quot;Overall Experience&quot;. Responded from the Customer Success Survey Status report. Total accounts: {fullyManagedAccountWiseScoreDistribution.length}
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {fullyManagedAccountWiseScoreDistribution.map((row, index) => {
                      const fmAccHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.customerId || index}>
                        <Td style={{ textAlign: 'center' }}>{fmAccHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{fmAccHyphenRow ? '-' : row.accountName}</Td>
                        <Td style={{ textAlign: 'left' }}>{fmAccHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{fmAccHyphenRow ? '-' : (row.polled ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{fmAccHyphenRow ? '-' : (row.responded ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = fmAccHyphenRow || value === '-';
                          const displayVal = isHyphen ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === '0.0') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            const n = parseFloat(val);
                            if (isNaN(n)) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {grandTotalFullyManagedDistribution && (
                      <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>Grand Total</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalFullyManagedDistribution.totalPolled}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalFullyManagedDistribution.totalResponded}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = grandTotalFullyManagedDistribution[colName];
                          const displayVal = value === '-' ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (val === '-') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            if (val === '0.0' || val === '0') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            const n = parseFloat(val);
                            if (isNaN(n) || n === 0) return { backgroundColor: '#E2E8F0', color: '#374151' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#E2E8F0', color: '#374151' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center', fontWeight: '700' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

      {/* Co-Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5) - Account-wise only (not Top 10, not BU-wise) */}
      {!showBuWise && !showTop10 && uploadedData && uploadedData.length > 0 && coManagedAccountWiseScoreDistribution.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Co-Managed – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
              <button
                onClick={downloadCoManagedAccountWiseScoreDistribution}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Co-Managed only.</strong> PERSPECTIVE = &quot;Overall Experience&quot;. Polled/Responded from the Customer Success Survey Status report. Total accounts: {coManagedAccountWiseScoreDistribution.length}
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {coManagedAccountWiseScoreDistribution.map((row, index) => {
                      const cmAccHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.customerId || index}>
                        <Td style={{ textAlign: 'center' }}>{cmAccHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{cmAccHyphenRow ? '-' : row.accountName}</Td>
                        <Td style={{ textAlign: 'left' }}>{cmAccHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{cmAccHyphenRow ? '-' : (row.polled ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{cmAccHyphenRow ? '-' : (row.responded ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = cmAccHyphenRow || value === '-';
                          const displayVal = isHyphen ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === '0.0') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            const n = parseFloat(val);
                            if (isNaN(n)) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {grandTotalCoManagedDistribution && (
                      <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>Grand Total</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalCoManagedDistribution.totalPolled}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalCoManagedDistribution.totalResponded}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = grandTotalCoManagedDistribution[colName];
                          const displayVal = value === '-' ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (val === '-') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            if (val === '0.0' || val === '0') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            const n = parseFloat(val);
                            if (isNaN(n) || n === 0) return { backgroundColor: '#E2E8F0', color: '#374151' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#E2E8F0', color: '#374151' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center', fontWeight: '700' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

      {/* Staff Augmentation – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5) - Account-wise only (not Top 10, not BU-wise) */}
      {!showBuWise && !showTop10 && uploadedData && uploadedData.length > 0 && staffAugmentationAccountWiseScoreDistribution.length > 0 && (
        <>
          <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={22} />
                Staff Augmentation – Account/BU wise Overall CSAT score - Distribution (Score 1 to 5)
              </h2>
              <button
                onClick={downloadStaffAugmentationAccountWiseScoreDistribution}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }}>Legend:</div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#16a34a', borderRadius: '4px', border: '1px solid #15803d' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#86efac', borderRadius: '4px', border: '1px solid #16a34a' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Satisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#f59e0b', borderRadius: '4px', border: '1px solid #d97706' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Neutral</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#fca5a5', borderRadius: '4px', border: '1px solid #dc2626' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Dissatisfied</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: '20px', height: '20px', backgroundColor: '#dc2626', borderRadius: '4px', border: '1px solid #991b1b' }}></div><span style={{ fontSize: '0.875rem', color: '#374151' }}>Highly Dissatisfied</span></div>
              </div>
            </div>
            <ResultsSummary style={{ marginBottom: '0.75rem' }}>
              <strong>Staff Augmentation only.</strong> PERSPECTIVE = &quot;Overall Experience&quot;. Polled/Responded from the Customer Success Survey Status report. Total accounts: {staffAugmentationAccountWiseScoreDistribution.length}
            </ResultsSummary>
            <TableContainer>
              <TableWrapper>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {RATING_DISPLAY_ORDER.map(r => <Th key={r} style={{ textAlign: 'center' }}>{RATING_COLUMN_NAMES[r]}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {staffAugmentationAccountWiseScoreDistribution.map((row, index) => {
                      const saAccHyphenRow = isSeadAndPolledZero(row);
                      return (
                      <tr key={row.customerId || index}>
                        <Td style={{ textAlign: 'center' }}>{saAccHyphenRow ? '-' : row.sNo}</Td>
                        <Td style={{ textAlign: 'left' }}>{saAccHyphenRow ? '-' : row.accountName}</Td>
                        <Td style={{ textAlign: 'left' }}>{saAccHyphenRow ? '-' : normalizeBUDisplay(row.businessUnit)}</Td>
                        <Td style={{ textAlign: 'center' }}>{saAccHyphenRow ? '-' : (row.polled ?? 0)}</Td>
                        <Td style={{ textAlign: 'center' }}>{saAccHyphenRow ? '-' : (row.responded ?? 0)}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = row[colName];
                          const isHyphen = saAccHyphenRow || value === '-';
                          const displayVal = isHyphen ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (isHyphen || val === '-') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            if (val === '0.0') return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            const n = parseFloat(val);
                            if (isNaN(n)) return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#f9fafb', color: '#6b7280' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    ); })}
                    {grandTotalStaffAugmentationDistribution && (
                      <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>Grand Total</Td>
                        <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>-</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalStaffAugmentationDistribution.totalPolled}</Td>
                        <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{grandTotalStaffAugmentationDistribution.totalResponded}</Td>
                        {RATING_DISPLAY_ORDER.map(rating => {
                          const colName = RATING_COLUMN_NAMES[rating];
                          const value = grandTotalStaffAugmentationDistribution[colName];
                          const displayVal = value === '-' ? '-' : formatDistributionOneDecimal(value);
                          const getCellColor = (r, val) => {
                            if (val === '-') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            if (val === '0.0' || val === '0') return { backgroundColor: '#E2E8F0', color: '#374151' };
                            const n = parseFloat(val);
                            if (isNaN(n) || n === 0) return { backgroundColor: '#E2E8F0', color: '#374151' };
                            switch (r) {
                              case 1: return { backgroundColor: '#dc2626', color: 'white' };
                              case 2: return { backgroundColor: '#fca5a5', color: 'black' };
                              case 3: return { backgroundColor: '#f59e0b', color: 'black' };
                              case 4: return { backgroundColor: '#86efac', color: 'black' };
                              case 5: return { backgroundColor: '#16a34a', color: 'black' };
                              default: return { backgroundColor: '#E2E8F0', color: '#374151' };
                            }
                          };
                          return (
                            <Td key={rating} style={{ ...getCellColor(rating, displayVal), textAlign: 'center', fontWeight: '700' }}>
                              {displayVal === '-' ? '-' : `${displayVal}%`}
                            </Td>
                          );
                        })}
                      </tr>
                    )}
                  </tbody>
                </Table>
              </TableWrapper>
            </TableContainer>
          </div>
        </>
      )}

        </>
      )}

    </DashboardContainer>
  );
};

export default AccountBUWiseOverallCSATScoreDistributionDashboard;
