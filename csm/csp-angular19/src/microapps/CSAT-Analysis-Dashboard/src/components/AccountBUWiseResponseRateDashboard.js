import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Download, ChevronLeft, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY } from '../utils/dateUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList, ComposedChart, Line } from 'recharts';

// Parse dates from Excel (serial numbers or strings) to MM-DD-YYYY for comparison with csatCycleStartDateFormatted
const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  try {
    let date;
    if (typeof dateValue === 'number') {
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      if (dateValue.includes('/')) {
        const parts = dateValue.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          date = new Date(`${year}-${month}-${day}`);
        } else date = new Date(dateValue);
      } else if (dateValue.includes('-')) {
        const parts = dateValue.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 4) date = new Date(dateValue);
          else {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            date = new Date(`${year}-${month}-${day}`);
          }
        } else date = new Date(dateValue);
      } else date = new Date(dateValue);
    } else date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch (e) {
    return '';
  }
};

const normalizeCustomerIdKey = (value) => {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num) && Number.isInteger(num)) return String(num);
  }
  return raw;
};

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  gap: 0.5rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.3;
  flex-shrink: 0;
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
  max-height: 600px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 1px solid #9ca3af;
`;

const Th = styled.th`
  background: #1e3a8a; /* Navy blue - same as ACSAT: Org & BU Level Average CSAT Scores (ARGB: FF1E3A8A) */
  color: #ffffff;
  font-weight: 600;
  padding: 1rem 0.75rem;
  text-align: center;
  border: 1px solid #9ca3af;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: normal;
  word-wrap: break-word;
  max-width: 150px;
  &:hover {
    background: #1e3a8a !important;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  border: 1px solid #9ca3af;
  color: #374151;
  white-space: nowrap;
  text-align: center;
`;

// Second header row in two-row (group header + column header) tables.
// Th itself sticks at top:0 — without this override, the second row's cells
// would also stick at top:0 and overlap the group-header row above them
// while scrolling. This pins the second row just below the first row's height.
const ThSubHeader = styled(Th)`
  top: 48px;
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 42px;
  white-space: nowrap;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
`;

const ResponseRateTd = styled.td`
  padding: 0.75rem;
  border: 1px solid #9ca3af;
  color: ${props => {
    if (props.$noSurveysReceived) return '#374151'; // No surveys received: normal text, no grey
    if (props.rate >= 75) return '#000000'; // Black text for green
    if (props.rate >= 50) return '#000000'; // Black text for orange
    return '#ffffff'; // White text for red
  }};
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  background-color: ${props => {
    if (props.$noSurveysReceived) return 'transparent'; // No grey when No surveys received / #Responded=0
    if (props.rate >= 75) return '#c6efce'; // Light Green >= 75% (Excel Light Green)
    if (props.rate >= 50) return '#FFA500'; // Orange 50% to 74% (same as ACSAT dashboard)
    return '#FF0000'; // Red < 50% (Excel Red)
  }};
`;

// Average CSAT Score cell: < 4 Red/White, 4 to 4.49 Orange/Black, >= 4.5 Green/Black, Responded=0 -> hyphen only (no grey)
const parseScore = (v) => {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};
const AverageCSATScoreTd = styled.td`
  padding: 0.75rem;
  border: 1px solid #9ca3af;
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  color: ${props => {
    if (props.$noSurveysReceived) return '#374151'; // No surveys received: normal text, no grey
    if (props.$score !== null && props.$score < 4) return '#ffffff'; // White text for red
    return '#000000'; // Black text for orange and green
  }};
  background-color: ${props => {
    if (props.$noSurveysReceived) return 'transparent'; // No grey when No surveys received / #Responded=0
    if (props.$score !== null && props.$score < 4) return '#FF0000'; // Red < 4
    if (props.$score !== null && props.$score < 4.5) return '#FFA500'; // Orange 4 to 4.49
    if (props.$score !== null && props.$score >= 4.5) return '#c6efce'; // Green >= 4.5
    return 'transparent'; // fallback
  }};
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-wrap: wrap;
`;

const LegendSection = styled.div`
  margin: 0.25rem 0;
  padding: 0.5rem 0.75rem;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex: 1;
  min-width: 280px;
`;

const LegendSectionTitle = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 0.35rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #e2e8f0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const LegendColor = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #d1d5db;
`;

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ChartTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
`;

const DownloadChartButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  min-height: 42px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
  }
`;

// Labels used in table and Excel export (PCSAT Account/BU wise Response Rate Dashboard)
const ACCOUNT_NAME_LABEL = 'Account Name';
const PRACTICE_LABEL = 'Practice';
const BUSINESS_UNIT_LABEL = 'Business Unit';
const POLLED_LABEL = '#Polled';
const RESPONDED_LABEL = '#Responded';
const RESPONSE_RATE_LABEL = 'Response Rate%';
const AVERAGE_CSAT_SCORE_LABEL = 'Average CSAT Score';
const AVG_PREDICTED_SCORE_LABEL = 'Avg. Predicted Score for the Surveys Responses Received';
// Avg. Predicted Score is shown only when the corresponding Average CSAT Score has a value; otherwise show '-'
const hasAvgCsatValue = (v) => v != null && v !== '' && v !== '-';

// Format Average CSAT Score (and Avg. Predicted Score) to exactly two digits after decimal for dashboard and Excel
const formatAverageCSATScoreTwoDecimals = (val) => {
  if (val == null || val === '' || val === '-') return '-';
  const n = parseFloat(val);
  return isNaN(n) ? '-' : n.toFixed(2);
};

const round2 = (n) => {
  const num = typeof n === 'number' ? n : parseFloat(n);
  if (Number.isNaN(num)) return NaN;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Response Rate % with one decimal place (e.g. 75.5)
const responseRateOneDecimal = (responded, polled) => (polled > 0 ? Math.round((responded / polled) * 1000) / 10 : 0);
// Display Response Rate with exactly one decimal place (e.g. 75 -> "75.0", 75.5 -> "75.5")
const formatResponseRateOneDecimal = (val) => {
  if (val == null || val === '' || val === '-') return '-';
  const n = parseFloat(val);
  return isNaN(n) ? '-' : n.toFixed(1);
};

// Column names for reading data (prefer new names; fallback to old for backward compatibility)
const COL_SENT_DATE = 'CSAT SENT DATE';
const COL_RECEIVED_DATE = 'CSAT RECEIVED DATE';
const COL_TYPE_OF_ACCOUNT = 'TYPE OF ACCOUNT';
const COL_BUSINESS_UNIT = 'BUSINESS UNIT'; // Sheet column name; display uses BUSINESS_UNIT_LABEL
// Prefer ENGAGEMENT TYPE; support "Project Engagement Type" as legacy (both read from sheet; display/export use ENGAGEMENT TYPE)
const COL_ENGAGEMENT_TYPE = 'ENGAGEMENT TYPE';

// Display "Health care" / "Health Care" as "Healthcare"
const normalizeBusinessUnitDisplay = (bu) => {
  if (bu == null || bu === '') return bu;
  const s = String(bu).trim();
  if (s.toLowerCase().replace(/\s/g, '') === 'healthcare') return 'Healthcare';
  return bu;
};

// Practice column display order for Practice wise Response Rate Dashboard and Trend Analysis (dashboard + Excel).
const PRACTICE_DISPLAY_ORDER = ['Digital Platform Engineering', 'RunOps', 'Data & Analytics', 'Cybersecurity'];
const getPracticeOrderIndex = (practice) => {
  if (practice == null || practice === '') return -1;
  const s = String(practice).trim();
  const idx = PRACTICE_DISPLAY_ORDER.findIndex(p => String(p).trim().toLowerCase() === s.toLowerCase());
  return idx;
};

// BUSINESS UNIT display order: Healthcare, CIT, Tech, India & UK, Sead. Used for dashboard and Excel.
const BUSINESS_UNIT_DISPLAY_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK', 'Sead'];
const getBusinessUnitOrderIndex = (bu) => {
  if (bu == null || bu === '') return -1;
  const s = String(bu).trim();
  const normalized = s.toLowerCase().replace(/\s/g, '') === 'healthcare' ? 'Healthcare' : s;
  const i = BUSINESS_UNIT_DISPLAY_ORDER.indexOf(normalized);
  if (i !== -1) return i;
  const byLower = BUSINESS_UNIT_DISPLAY_ORDER.findIndex(b => String(b).toLowerCase() === normalized.toLowerCase());
  return byLower >= 0 ? byLower : -1;
};

// When BUSINESS UNIT = Sead and Polled = 0, display hyphen for the entire row (dashboard and Excel).
const isSeadBU = (bu) => String(bu ?? '').trim().toLowerCase() === 'sead';
const isSeadAndPolledZero = (row) => isSeadBU(row?.businessUnit) && (row?.cssSentCount ?? 0) === 0;

// Practice-wise dashboards use these fixed files from public/data (requested).
// If they are missing in public/data, the dashboard falls back to already-uploaded/trend-uploaded sources.
const PRACTICE_FILE_URL = '/data/New_customer_feedback_analysis_New.xlsx';
const PRACTICE_TREND_FILE_URL = '/data/Trend-Analysis-H12025.xlsx';
const SHEET2_NAME_MATCH = (s) => {
  const t = String(s || '').toLowerCase().trim();
  return t.includes('csat sent and received') || t.includes('sent and received') || t === 'sheet2';
};

const AccountBUWiseResponseRateDashboard = ({ excelData, onBack, trendAnalysisFiles = [] }) => {
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [showBuWise, setShowBuWise] = useState(false);
  const [showTop10, setShowTop10] = useState(false);
  const [showPracticeWise, setShowPracticeWise] = useState(false);
  const [practiceBusinessUnitFilter, setPracticeBusinessUnitFilter] = useState('');
  const [showTrendSection, setShowTrendSection] = useState(false);
  const [practiceFileSheet2Data, setPracticeFileSheet2Data] = useState(null);
  const [practiceTrendFileSheet2Data, setPracticeTrendFileSheet2Data] = useState(null);
  // Chart state variables removed - charts now display automatically based on view mode
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  // Dynamic "Trend analysis (<main period> Vs <comparison period>)" header label, driven by the
  // actual selected main period (acsatCycle) and the most recently fetched/uploaded comparison period.
  const trendComparisonPeriodLabel = (trendAnalysisFiles && trendAnalysisFiles.length > 0)
    ? (trendAnalysisFiles[trendAnalysisFiles.length - 1].saveName || trendAnalysisFiles[trendAnalysisFiles.length - 1].originalName || 'comparison period')
    : 'comparison period';
  const trendHeaderLabel = `Trend analysis (${acsatCycle || 'current period'} Vs ${trendComparisonPeriodLabel})`;

  // When "Practice wise Response Rate Dashboard" is shown, load data from fixed local file (Sheet2 "CSAT sent and received Report") if available.
  useEffect(() => {
    if (!showPracticeWise) return;
    const base = typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const url = (base.replace(/\/$/, '') || '') + PRACTICE_FILE_URL;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error('File not found'); return res.arrayBuffer(); })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const sheet2Name = sheetNames.find(SHEET2_NAME_MATCH) || sheetNames[1] || sheetNames[0];
        if (!sheet2Name || !workbook.Sheets[sheet2Name]) { setPracticeFileSheet2Data(null); return; }
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet2Name], { defval: '' });
        if (!Array.isArray(data) || data.length === 0) { setPracticeFileSheet2Data(null); return; }
        const firstRow = data[0] || {};
        const hasPractice = Object.keys(firstRow).some(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase()));
        setPracticeFileSheet2Data(hasPractice ? data : null);
      })
      .catch(() => setPracticeFileSheet2Data(null));
  }, [showPracticeWise]);

  // When "Practice wise Response Rate – Trend Analysis" is shown, load data from fixed trend file Trend-Analysis-H12025.xlsx (Sheet2) if available.
  useEffect(() => {
    if (!showPracticeWise) return;
    const base = typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const url = (base.replace(/\/$/, '') || '') + PRACTICE_TREND_FILE_URL;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error('File not found'); return res.arrayBuffer(); })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const sheet2Name = sheetNames.find(SHEET2_NAME_MATCH) || sheetNames[1] || sheetNames[0];
        if (!sheet2Name || !workbook.Sheets[sheet2Name]) { setPracticeTrendFileSheet2Data(null); return; }
        const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet2Name], { defval: '' });
        if (!Array.isArray(data) || data.length === 0) { setPracticeTrendFileSheet2Data(null); return; }
        const firstRow = data[0] || {};
        const hasPractice = Object.keys(firstRow).some(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase()));
        setPracticeTrendFileSheet2Data(hasPractice ? data : null);
      })
      .catch(() => setPracticeTrendFileSheet2Data(null));
  }, [showPracticeWise]);

  // Utility function to compare dates (MM-DD-YYYY format)
  const isDateGreaterThanOrEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const [month1, day1, year1] = date1.split('-').map(Number);
    const [month2, day2, year2] = date2.split('-').map(Number);
    
    if (year1 !== year2) return year1 > year2;
    if (month1 !== month2) return month1 > month2;
    return day1 >= day2;
  };

  // Practice data: (1) from already-uploaded Excel (Upload CSAT Data page) Sheet2 "CSAT sent and received Report" if it has Practice column, else public/data/ or "Upload data for trend analysis" New-Practice file; (2) Trend-Analysis-H12025-Practice.xlsx from upload only.
  const uploadedSheet2WithPractice = useMemo(() => {
    const data = excelData?.secondSheetData;
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const firstRow = data[0] || {};
    const hasPractice = Object.keys(firstRow).some(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase()));
    return hasPractice ? data : null;
  }, [excelData]);

  const practiceTrendSources = useMemo(() => {
    const getSheet2WithPractice = (file) => {
      const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
      const sheet2Name = sheetNames.find(s => {
        const t = String(s).toLowerCase().trim();
        return t.includes('csat sent and received') || t.includes('sent and received') || t === 'sheet2';
      }) || sheetNames[1] || sheetNames[0];
      if (!sheet2Name || !file.sheets) return null;
      let data = file.sheets[sheet2Name];
      if (!data && file.sheets) {
        const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sheet2Name).toLowerCase().trim());
        if (exactKey) data = file.sheets[exactKey];
      }
      if (!data || !Array.isArray(data) || data.length === 0) return null;
      const firstRow = data[0] || {};
      const hasPractice = Object.keys(firstRow).some(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase()));
      return hasPractice ? data : null;
    };
    const nameLower = (s) => (s || '').toLowerCase();
    const withPractice = (trendAnalysisFiles || []).map(f => ({ file: f, data: getSheet2WithPractice(f) })).filter(x => x.data != null);
    // First dashboard (requested): New_customer_feedback_analysis_New.xlsx (Sheet2) from public/data.
    // Fallback: already-uploaded Excel (Upload CSAT Data) Sheet2 with Practice; then any uploaded file matching New_customer_feedback_analysis_New.
    const first = (practiceFileSheet2Data && practiceFileSheet2Data.length > 0)
      ? practiceFileSheet2Data
      : ((uploadedSheet2WithPractice && uploadedSheet2WithPractice.length > 0)
        ? uploadedSheet2WithPractice
        : (withPractice.find(x => nameLower(x.file.saveName).includes('new_customer_feedback_analysis_new'))?.data ?? null));

    // Second dashboard (requested): Trend-Analysis-H12025.xlsx (Sheet2) from public/data.
    // Fallback: any uploaded trend file matching Trend-Analysis-H12025 that contains Practice in Sheet2.
    const withPracticeReversed = [...withPractice].reverse();
    const second = (practiceTrendFileSheet2Data && practiceTrendFileSheet2Data.length > 0)
      ? practiceTrendFileSheet2Data
      : (withPracticeReversed.find(x => nameLower(x.file.saveName).includes('trend-analysis-h12025'))?.data
        ?? withPracticeReversed.find(x => nameLower(x.file.saveName).includes('trend-analysis') && nameLower(x.file.saveName).includes('h12025'))?.data
        ?? withPracticeReversed[0]?.data
        ?? null);
    return { first, second };
  }, [trendAnalysisFiles, practiceFileSheet2Data, practiceTrendFileSheet2Data, uploadedSheet2WithPractice]);

  const buildPracticeWiseRows = (source) => {
    if (!source || !csatCycleStartDateFormatted) return [];
    const firstRow = source[0] || {};
    const practiceCol = Object.keys(firstRow).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const actualScoreCol =
      Object.keys(firstRow).find(k => k && /actual\s*score/i.test(String(k))) ||
      Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) ||
      'ACTUAL SCORE';
    const avgScoreCol = Object.keys(firstRow).find(k => {
      const t = String(k || '').trim().toLowerCase().replace(/\s/g, '');
      return t === 'averagecsatscore' || t === 'avgcsatscore' || t === 'averagecsat' || t === 'avgscore';
    });
    const byPractice = {};
    source.forEach(row => {
      const practice = (row[practiceCol] ?? row['Practice'] ?? '').toString().trim() || 'N/A';
      if (!byPractice[practice]) byPractice[practice] = { practice, polled: 0, responded: 0, actualScoreSum: 0, actualScoreCount: 0 };
      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) byPractice[practice].polled++;
      }
      const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
          byPractice[practice].responded++;
          const scoreVal = row[actualScoreCol] ?? row['ACTUAL SCORE'] ?? (avgScoreCol ? row[avgScoreCol] : undefined);
          if (scoreVal != null && scoreVal !== '' && scoreVal !== 'N/A') {
            const n = parseFloat(scoreVal);
            if (!isNaN(n)) { byPractice[practice].actualScoreSum += n; byPractice[practice].actualScoreCount++; }
          }
        }
      }
    });
    const rows = Object.values(byPractice)
      .filter(p => p.polled > 0 || p.responded > 0)
      .map(p => ({
        practice: p.practice,
        polled: p.polled,
        responded: p.responded,
        actualScoreCount: p.actualScoreCount,
        responseRatePct: p.polled > 0 ? (p.responded / p.polled) * 100 : null,
        avgActualScore: p.actualScoreCount > 0 ? p.actualScoreSum / p.actualScoreCount : null
      }));
    rows.sort((a, b) => {
      const ia = getPracticeOrderIndex(a.practice);
      const ib = getPracticeOrderIndex(b.practice);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return (a.practice || '').localeCompare(b.practice || '');
    });
    return rows.map((r, i) => ({ ...r, srNo: i + 1 }));
  };

  // Practice + BU wise Response Rate table (requested):
  // Sheet2 "CSAT sent and received Report" (New_customer_feedback_analysis_New.xlsx): group by Practice + BUSINESS UNIT.
  // #Polled = count(CSS_SENT_DATE), #Responded = count(CSS_RECEIVED_DATE) (date >= CSAT cycle start).
  // Response Rate% = #Responded/#Polled*100, Average CSAT Score = Avg(ACTUAL SCORE) for responded rows.
  const buildPracticeBuWiseRows = (source) => {
    if (!source || !csatCycleStartDateFormatted) return [];
    const firstRow = source[0] || {};
    const practiceCol = Object.keys(firstRow).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const businessUnitCol =
      Object.prototype.hasOwnProperty.call(firstRow, COL_BUSINESS_UNIT)
        ? COL_BUSINESS_UNIT
        : (Object.prototype.hasOwnProperty.call(firstRow, 'BUSSINESS UNIT') ? 'BUSSINESS UNIT' : COL_BUSINESS_UNIT);
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';

    const byKey = {};
    source.forEach(row => {
      const practice = (row[practiceCol] ?? row['Practice'] ?? '').toString().trim() || 'N/A';
      const buRaw = (row[businessUnitCol] ?? row[COL_BUSINESS_UNIT] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBusinessUnitDisplay(buRaw);
      const key = `${practice}||${businessUnit}`;
      if (!byKey[key]) byKey[key] = { practice, businessUnit, polled: 0, responded: 0, actualScoreSum: 0, actualScoreCount: 0 };

      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) byKey[key].polled++;
      }

      const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
          byKey[key].responded++;
          const scoreVal = row[actualScoreCol] ?? row['ACTUAL SCORE'];
          if (scoreVal != null && scoreVal !== '' && scoreVal !== 'N/A') {
            const n = parseFloat(scoreVal);
            if (!isNaN(n)) {
              byKey[key].actualScoreSum += n;
              byKey[key].actualScoreCount++;
            }
          }
        }
      }
    });

    const rows = Object.values(byKey)
      .filter(r => r.polled > 0 || r.responded > 0)
      .map(r => ({
        practice: r.practice,
        businessUnit: r.businessUnit,
        polled: r.polled,
        responded: r.responded,
        responseRatePct: r.polled > 0 ? (r.responded / r.polled) * 100 : null,
        avgActualScore: r.actualScoreCount > 0 ? r.actualScoreSum / r.actualScoreCount : null
      }));

    rows.sort((a, b) => {
      const ia = getPracticeOrderIndex(a.practice);
      const ib = getPracticeOrderIndex(b.practice);
      if (ia >= 0 && ib >= 0 && ia !== ib) return ia - ib;
      if (ia >= 0 && ib < 0) return -1;
      if (ia < 0 && ib >= 0) return 1;
      const cmpPractice = (a.practice || '').localeCompare(b.practice || '');
      if (cmpPractice !== 0) return cmpPractice;
      const bua = getBusinessUnitOrderIndex(a.businessUnit);
      const bub = getBusinessUnitOrderIndex(b.businessUnit);
      if (bua !== -1 && bub !== -1) return bua - bub;
      if (bua !== -1) return -1;
      if (bub !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });

    return rows.map((r, i) => ({ ...r, srNo: i + 1 }));
  };

  // Business Unit + Practice wise Response Rate table (requested):
  // Sheet2 "CSAT sent and received Report" (New_customer_feedback_analysis_New.xlsx): group by BUSINESS UNIT + Practice.
  // Columns order: Sr. No., Business Unit, Practice, #Polled, #Responded, Response Rate %, Average CSAT Score.
  const buildBuPracticeWiseRows = (source) => {
    if (!source || !csatCycleStartDateFormatted) return [];
    const firstRow = source[0] || {};
    const practiceCol = Object.keys(firstRow).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const businessUnitCol =
      Object.prototype.hasOwnProperty.call(firstRow, COL_BUSINESS_UNIT)
        ? COL_BUSINESS_UNIT
        : (Object.prototype.hasOwnProperty.call(firstRow, 'BUSSINESS UNIT') ? 'BUSSINESS UNIT' : COL_BUSINESS_UNIT);
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';

    const byKey = {};
    source.forEach(row => {
      const buRaw = (row[businessUnitCol] ?? row[COL_BUSINESS_UNIT] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '').toString().trim() || 'N/A';
      const businessUnit = normalizeBusinessUnitDisplay(buRaw);
      const practice = (row[practiceCol] ?? row['Practice'] ?? '').toString().trim() || 'N/A';
      const key = `${businessUnit}||${practice}`;
      if (!byKey[key]) byKey[key] = { businessUnit, practice, polled: 0, responded: 0, actualScoreSum: 0, actualScoreCount: 0 };

      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) byKey[key].polled++;
      }

      const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
          byKey[key].responded++;
          const scoreVal = row[actualScoreCol] ?? row['ACTUAL SCORE'];
          if (scoreVal != null && scoreVal !== '' && scoreVal !== 'N/A') {
            const n = parseFloat(scoreVal);
            if (!isNaN(n)) {
              byKey[key].actualScoreSum += n;
              byKey[key].actualScoreCount++;
            }
          }
        }
      }
    });

    const rows = Object.values(byKey)
      .filter(r => r.polled > 0 || r.responded > 0)
      .map(r => ({
        businessUnit: r.businessUnit,
        practice: r.practice,
        polled: r.polled,
        responded: r.responded,
        responseRatePct: r.polled > 0 ? (r.responded / r.polled) * 100 : null,
        avgActualScore: r.actualScoreCount > 0 ? r.actualScoreSum / r.actualScoreCount : null
      }));

    rows.sort((a, b) => {
      const bua = getBusinessUnitOrderIndex(a.businessUnit);
      const bub = getBusinessUnitOrderIndex(b.businessUnit);
      if (bua !== -1 && bub !== -1 && bua !== bub) return bua - bub;
      if (bua !== -1 && bub === -1) return -1;
      if (bua === -1 && bub !== -1) return 1;
      const cmpBu = (a.businessUnit || '').localeCompare(b.businessUnit || '');
      if (cmpBu !== 0) return cmpBu;

      const ia = getPracticeOrderIndex(a.practice);
      const ib = getPracticeOrderIndex(b.practice);
      if (ia >= 0 && ib >= 0 && ia !== ib) return ia - ib;
      if (ia >= 0 && ib < 0) return -1;
      if (ia < 0 && ib >= 0) return 1;
      return (a.practice || '').localeCompare(b.practice || '');
    });

    return rows.map((r, i) => ({ ...r, srNo: i + 1 }));
  };

  // First dashboard: New_customer_feedback_analysis_New-Practice.xlsx (from Upload data for trend analysis). Sheet2 "CSAT sent and received Report", group by Practice.
  const practiceWiseTableData = useMemo(() => buildPracticeWiseRows(practiceTrendSources.first), [practiceTrendSources.first, csatCycleStartDateFormatted]);
  // Second dashboard: Trend-Analysis-H12025-Practice.xlsx (from Upload data for trend analysis). Sheet2 "CSAT sent and received Report", same columns.
  const practiceWiseTableDataSecond = useMemo(() => buildPracticeWiseRows(practiceTrendSources.second), [practiceTrendSources.second, csatCycleStartDateFormatted]);

  // New dashboard (requested): Practice + Business Unit response rate table from Sheet2 "CSAT sent and received Report"
  const practiceBuWiseTableData = useMemo(() => buildPracticeBuWiseRows(practiceTrendSources.first), [practiceTrendSources.first, csatCycleStartDateFormatted]);

  // New dashboard (requested): Business Unit + Practice response rate table from Sheet2 "CSAT sent and received Report"
  const buPracticeWiseTableData = useMemo(() => buildBuPracticeWiseRows(practiceTrendSources.first), [practiceTrendSources.first, csatCycleStartDateFormatted]);

  const practiceBusinessUnitOptions = useMemo(() => {
    const sourceRows = [...(practiceBuWiseTableData || []), ...(buPracticeWiseTableData || [])];
    const unique = [...new Set(sourceRows.map(r => normalizeBusinessUnitDisplay(r.businessUnit)).filter(Boolean))];
    return unique.sort((a, b) => {
      const ia = getBusinessUnitOrderIndex(a);
      const ib = getBusinessUnitOrderIndex(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return (a || '').localeCompare(b || '');
    });
  }, [practiceBuWiseTableData, buPracticeWiseTableData]);

  const filteredPracticeBuWiseTableData = useMemo(() => {
    const selected = normalizeBusinessUnitDisplay(practiceBusinessUnitFilter);
    const rows = practiceBuWiseTableData || [];
    const out = selected
      ? rows.filter(r => normalizeBusinessUnitDisplay(r.businessUnit) === selected)
      : rows;
    return out.map((r, i) => ({ ...r, srNo: i + 1 }));
  }, [practiceBuWiseTableData, practiceBusinessUnitFilter]);

  const filteredBuPracticeWiseTableData = useMemo(() => {
    const selected = normalizeBusinessUnitDisplay(practiceBusinessUnitFilter);
    const rows = buPracticeWiseTableData || [];
    const out = selected
      ? rows.filter(r => normalizeBusinessUnitDisplay(r.businessUnit) === selected)
      : rows;
    return out.map((r, i) => ({ ...r, srNo: i + 1 }));
  }, [buPracticeWiseTableData, practiceBusinessUnitFilter]);

  // Org level (grand total) row for Practice + Business Unit Response Rate Dashboard.
  const practiceBuWiseOrgRow = useMemo(() => {
    const rows = filteredPracticeBuWiseTableData || [];
    if (rows.length === 0) return null;
    const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
    const responseRatePct = totalPolled > 0 ? (totalResponded / totalPolled) * 100 : null;
    let avgActualScore = null;
    let weightSum = 0;
    let scoreSum = 0;
    rows.forEach(r => {
      if ((r.responded || 0) > 0 && r.avgActualScore != null) {
        scoreSum += r.avgActualScore * (r.responded || 0);
        weightSum += r.responded || 0;
      }
    });
    if (weightSum > 0) avgActualScore = scoreSum / weightSum;
    return {
      practice: 'Org level',
      businessUnit: '',
      polled: totalPolled,
      responded: totalResponded,
      responseRatePct,
      avgActualScore
    };
  }, [filteredPracticeBuWiseTableData]);

  // Org level (grand total) row for Business Unit + Practice Response Rate Dashboard.
  const buPracticeWiseOrgRow = useMemo(() => {
    const rows = filteredBuPracticeWiseTableData || [];
    if (rows.length === 0) return null;
    const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
    const responseRatePct = totalPolled > 0 ? (totalResponded / totalPolled) * 100 : null;
    let avgActualScore = null;
    let weightSum = 0;
    let scoreSum = 0;
    rows.forEach(r => {
      if ((r.responded || 0) > 0 && r.avgActualScore != null) {
        scoreSum += r.avgActualScore * (r.responded || 0);
        weightSum += r.responded || 0;
      }
    });
    if (weightSum > 0) avgActualScore = scoreSum / weightSum;
    return {
      businessUnit: '',
      practice: 'Org level',
      polled: totalPolled,
      responded: totalResponded,
      responseRatePct,
      avgActualScore
    };
  }, [filteredBuPracticeWiseTableData]);

  // Normalize practice name for matching (trim + lowercase) so "Digital Platform Engineering" matches trend row regardless of case/whitespace.
  const normalizePracticeKey = (p) => (p == null ? '' : String(p).trim().toLowerCase());

  // Practice wise Response Rate Dashboard: enrich rows with trend vs "Practice wise Response Rate – Trend Analysis" (compare Dashboard vs Trend by Practice).
  const practiceWiseTableDataWithTrend = useMemo(() => {
    const trendByPractice = {};
    (practiceWiseTableDataSecond || []).forEach(t => {
      const key = normalizePracticeKey(t.practice);
      if (key) trendByPractice[key] = t;
    });
    return (practiceWiseTableData || []).map(row => {
      const trend = trendByPractice[normalizePracticeKey(row.practice)];
      const responseRateDiff = (trend != null && row.responseRatePct != null && trend.responseRatePct != null)
        ? row.responseRatePct - trend.responseRatePct
        : null;
      let avgCSATDiffRaw = null;
      if (trend != null && row.avgActualScore != null && trend.avgActualScore != null) {
        const dashScore = Math.round(Number(row.avgActualScore) * 100) / 100;
        let trendScore = Math.round(Number(trend.avgActualScore) * 100) / 100;
        if (trendScore < 1 && dashScore >= 3 && dashScore <= 5 && (dashScore - trendScore) > 2) {
          trendScore = trendScore + 4;
        }
        avgCSATDiffRaw = dashScore - trendScore;
      }
      const avgCSATTrendDiff = avgCSATDiffRaw != null ? Math.round(avgCSATDiffRaw * 100) / 100 : null;
      return {
        ...row,
        responseRateTrendDiff: responseRateDiff,
        avgCSATTrendDiff
      };
    });
  }, [practiceWiseTableData, practiceWiseTableDataSecond]);

  // Org level (grand total) row for Practice wise Response Rate Dashboard: sum #Polled, #Responded; Response Rate % = totalResponded/totalPolled*100; Average CSAT Score = sum(avgActualScore * actualScoreCount) / sum(actualScoreCount) (weight by count of scores, not responded).
  const practiceWiseOrgRow = useMemo(() => {
    const rows = practiceWiseTableData || [];
    if (rows.length === 0) return null;
    const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
    const responseRatePct = totalPolled > 0 ? (totalResponded / totalPolled) * 100 : null;
    let avgActualScore = null;
    let weightSum = 0;
    let scoreSum = 0;
    rows.forEach(r => {
      const count = r.actualScoreCount ?? r.responded ?? 0;
      if (count > 0 && r.avgActualScore != null) {
        scoreSum += r.avgActualScore * count;
        weightSum += count;
      }
    });
    if (weightSum > 0) avgActualScore = scoreSum / weightSum;
    return {
      practice: 'Org level',
      polled: totalPolled,
      responded: totalResponded,
      responseRatePct,
      avgActualScore,
      responseRateTrendDiff: null,
      avgCSATTrendDiff: null
    };
  }, [practiceWiseTableData]);

  // Org level (grand total) row for Practice wise Response Rate – Trend Analysis. Average CSAT Score = sum(avgActualScore * actualScoreCount) / sum(actualScoreCount).
  const practiceWiseSecondOrgRow = useMemo(() => {
    const rows = practiceWiseTableDataSecond || [];
    if (rows.length === 0) return null;
    const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
    const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
    const responseRatePct = totalPolled > 0 ? (totalResponded / totalPolled) * 100 : null;
    let avgActualScore = null;
    let weightSum = 0;
    let scoreSum = 0;
    rows.forEach(r => {
      const count = r.actualScoreCount ?? r.responded ?? 0;
      if (count > 0 && r.avgActualScore != null) {
        scoreSum += r.avgActualScore * count;
        weightSum += count;
      }
    });
    if (weightSum > 0) avgActualScore = scoreSum / weightSum;
    return { practice: 'Org level', polled: totalPolled, responded: totalResponded, responseRatePct, avgActualScore };
  }, [practiceWiseTableDataSecond]);

  // Org level trend diffs for first dashboard: Response Rate Trend = org dash rate − org trend rate.
  // Average CSAT Score Trend = org dash avgActualScore − org trend avgActualScore (2 decimal places; both weighted by actualScoreCount).
  const practiceWiseOrgRowWithTrend = useMemo(() => {
    if (!practiceWiseOrgRow) return practiceWiseOrgRow;
    const dash = practiceWiseOrgRow;
    const trend = practiceWiseSecondOrgRow;
    const responseRateTrendDiff = (trend && dash.responseRatePct != null && trend.responseRatePct != null) ? dash.responseRatePct - trend.responseRatePct : null;
    let avgCSATDiffRaw = null;
    if (trend && dash.avgActualScore != null && trend.avgActualScore != null) {
      const dashScore = Math.round(Number(dash.avgActualScore) * 100) / 100;
      let trendScore = Math.round(Number(trend.avgActualScore) * 100) / 100;
      if (trendScore < 1 && dashScore >= 3 && dashScore <= 5 && (dashScore - trendScore) > 2) {
        trendScore = trendScore + 4;
      }
      avgCSATDiffRaw = dashScore - trendScore;
    }
    const avgCSATTrendDiff = avgCSATDiffRaw != null ? Math.round(avgCSATDiffRaw * 100) / 100 : null;
    return { ...dash, responseRateTrendDiff, avgCSATTrendDiff };
  }, [practiceWiseOrgRow, practiceWiseSecondOrgRow]);

  // Function to get cell color based on response rate (Red < 50%, Orange 50-74%, Light Green >= 75%; No surveys received = no grey)
  const getResponseRateColor = (responseRate, noSurveysReceived) => {
    if (noSurveysReceived) return { backgroundColor: 'transparent', color: '#374151' }; // No grey when #Responded=0
    if (responseRate >= 75) return { backgroundColor: '#c6efce', color: '#000000' }; // Light Green (Excel)
    if (responseRate >= 50) return { backgroundColor: '#FFA500', color: '#000000' }; // Orange (same as ACSAT)
    return { backgroundColor: '#FF0000', color: '#ffffff' }; // Red (Excel Red)
  };

  // Function to get cell color based on Average CSAT Score (< 4 Red/White, 4 to 4.49 Orange/Black, >= 4.5 Green/Black)
  const getAvgCSATScoreColor = (score, noSurveysReceived) => {
    if (noSurveysReceived || score == null || score === '-') return { backgroundColor: 'transparent', color: '#374151' };
    const n = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(n)) return { backgroundColor: 'transparent', color: '#374151' };
    if (n >= 4.5) return { backgroundColor: '#c6efce', color: '#000000' }; // Green
    if (n >= 4) return { backgroundColor: '#FFA500', color: '#000000' }; // Orange
    return { backgroundColor: '#FF0000', color: '#ffffff' }; // Red
  };
  
  // Process data to show response rate data
  // All Polled and Responded use the 2nd sheet "CSAT sent and received Report" only
  // (file: data/New_customer_feedback_analysis_New.xlsx — Sheet1: CSAT received Report, Sheet2: CSAT sent and received Report).
  // Polled = count(CSAT SENT DATE / CSS_SENT_DATE), Responded = count(CSAT RECEIVED DATE / CSS_RECEIVED_DATE), grouped by CUSTOMER_ID or CUST_ID.
  // Only rows where date >= csatCycleStartDateFormatted (MM-DD-YYYY) are counted. Applies to main table and to Fully Managed, Co-Managed, Staff Augmentation sections (each filtered by ENGAGEMENT TYPE).
  const processedData = useMemo(() => {
    if (!excelData || !excelData.secondSheetData || excelData.secondSheetData.length === 0) {
      console.log('No second sheet data available for processing');
      return { data: [] };
    }

    const data = excelData.secondSheetData; // Sheet2: CSAT sent and received Report — used for all Polled/Responded
    console.log('Processing response rate data (Sheet2 only):', data.length, 'rows');

    const firstRow = data[0] || {};
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, COL_BUSINESS_UNIT) ? COL_BUSINESS_UNIT : 'BUSSINESS UNIT';
    const yearQuarterCol = Object.keys(firstRow).find(k => {
      const lower = (k || '').toString().toLowerCase().replace(/\s|_/g, '');
      return lower === 'year-quarter' || lower === 'yearquarter' || (lower.includes('year') && lower.includes('quarter'));
    }) || 'YEAR - QUARTER';
    const typeOfAccountCol = Object.prototype.hasOwnProperty.call(firstRow, COL_TYPE_OF_ACCOUNT) ? COL_TYPE_OF_ACCOUNT : 'Top 10';
    const engagementTypeKey = Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype') || COL_ENGAGEMENT_TYPE;
    const predictedScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'PREDICTED SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'predictedscore')) || 'PREDICTED SCORE';
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';
    const parseScore = (row, col) => {
      const val = row[col];
      if (val == null || val === '' || val === 'N/A') return null;
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };

    // CUST_ID and CUSTOMER_ID are treated as the same; normalize to string for consistent grouping
    const getCustomerId = (row) => {
      const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      return id != null && id !== '' ? String(id).trim() : '';
    };
    // CUSTOMER NAME and CUST_NM are treated as the same
    const getCustomerName = (row) => {
      const name = row['CUSTOMER NAME'] ?? row['CUST_NM'];
      return name != null && String(name).trim() !== '' ? String(name).trim() : 'N/A';
    };
    const getPracticeName = (row) => {
      const practice = row['Practice'] ?? row['PRACTICE'];
      return practice != null && String(practice).trim() !== '' ? String(practice).trim() : 'N/A';
    };
    // TYPE OF ACCOUNT = "Top 10" (when column is TYPE OF ACCOUNT) or Top 10 = 'Y' (legacy) means Top 10 account
    const isTop10Account = (row) => {
      const val = (row[typeOfAccountCol] ?? row['Top 10'] ?? '').toString().trim();
      if (typeOfAccountCol === COL_TYPE_OF_ACCOUNT) {
        return val.toLowerCase() === 'top 10';
      }
      return val.toUpperCase() === 'Y';
    };

    // Get Top 10 customers from the second sheet (TYPE OF ACCOUNT = "Top 10" or Top 10 = 'Y')
    const top10Customers = new Set();
    data.forEach(row => {
      if (isTop10Account(row)) {
        const customerId = getCustomerId(row);
        if (customerId) {
          top10Customers.add(customerId);
        }
      }
    });

    if (showBuWise) {
      // Group by Business Unit for BU-wise view
      // Polled, Responded, Response Rate% after BUSINESS UNIT: from 2nd sheet "CSAT sent and received Report",
      // count(CSAT SENT DATE) and count(CSAT RECEIVED DATE) group by BUSINESS UNIT, date >= csatCycleStartDateFormatted (MM-DD-YYYY)
      const buGroups = {};

      data.forEach(row => {
        const businessUnit = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';

        if (businessUnit && businessUnit !== 'N/A') {
          if (!buGroups[businessUnit]) {
            buGroups[businessUnit] = {
              businessUnit,
              cssSentCount: 0,
              cssReceivedCount: 0,
              predictedScoreSum: 0,
              predictedScoreCount: 0,
              actualScoreSum: 0,
              actualScoreCount: 0,
              nonStaffingReceivedCount: 0,
              staffingReceivedCount: 0,
              yearQuarter: null
            };
          }

          // Capture YEAR - QUARTER (CSAT Cycle) from row - first non-null value for this BU
          const yqVal = row[yearQuarterCol] ?? row['YEAR_QUARTER'] ?? row['Year Quarter'];
          if (yqVal != null && yqVal !== '' && yqVal !== 'N/A' && !buGroups[businessUnit].yearQuarter) {
            buGroups[businessUnit].yearQuarter = String(yqVal).trim();
          }

          // Count CSAT SENT DATE (Polled) with date filtering: >= CSAT cycle start date (MM-DD-YYYY)
          const sentDateVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          if (sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A') {
            const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateVal);
            if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
              buGroups[businessUnit].cssSentCount++;
              const pred = parseScore(row, predictedScoreCol);
              const act = parseScore(row, actualScoreCol);
              if (pred != null) { buGroups[businessUnit].predictedScoreSum += pred; buGroups[businessUnit].predictedScoreCount += 1; }
              if (act != null) { buGroups[businessUnit].actualScoreSum += act; buGroups[businessUnit].actualScoreCount += 1; }
            }
          }

          // Count CSAT RECEIVED DATE (Responded) with date filtering: >= CSAT cycle start date (MM-DD-YYYY)
          const receivedDateVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          if (receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A') {
            const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateVal);
            if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
              buGroups[businessUnit].cssReceivedCount++;
              
              // Count for Non Staffing (Time and Material, Fixed Bid, Managed Services)
              const revenueType = row['REVENUE_TYPE'] || '';
              if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
                buGroups[businessUnit].nonStaffingReceivedCount++;
              }
              
              // Count for Staffing (Fixed Monthly)
              if (revenueType === 'Fixed Monthly') {
                buGroups[businessUnit].staffingReceivedCount++;
              }
            }
          }
        }
      });

      const avgScore = (sum, count) => (count > 0 ? Math.round((sum / count) * 100) / 100 : null);
      // Convert to array and calculate response rate for BU-wise data
      const result = Object.values(buGroups)
        .filter(group => group.cssSentCount > 0) // Filter out rows with 0 surveys sent
        .map((group, index) => {
          return {
            sNo: index + 1,
            businessUnit: group.businessUnit,
            cssSentCount: group.cssSentCount,
            cssReceivedCount: group.cssReceivedCount,
            averageCSATScore: avgScore(group.actualScoreSum, group.actualScoreCount),
            avgPredictedScore: avgScore(group.predictedScoreSum, group.predictedScoreCount),
            yearQuarter: group.yearQuarter || acsatCycle || '', // YEAR - QUARTER from Sheet2, fallback to acsatCycle
            nonStaffingReceivedCount: group.nonStaffingReceivedCount,
            staffingReceivedCount: group.staffingReceivedCount,
            responseRate: responseRateOneDecimal(group.cssReceivedCount, group.cssSentCount)
          };
        })
        .sort((a, b) => {
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return (a.businessUnit || '').localeCompare(b.businessUnit || '');
        })
        .map((item, index) => ({
          ...item,
          sNo: index + 1 // Update sNo after sorting
        }));

      // Fully Managed, Co-Managed, Staff Augmentation (BU-wise): Polled, Responded, Response Rate% by BUSINESS UNIT
      // From same second sheet (CSAT sent and received Report), date >= CSAT cycle start (MM-DD-YYYY)
      const fullyManagedByBU = {};
      const coManagedByBU = {};
      const staffAugmentationByBU = {};
      if (data.length > 0) {
        const countRowForBU = (row, buMap, bu, polledKey, respondedKey, prefix) => {
          if (!buMap[bu]) buMap[bu] = { [polledKey]: 0, [respondedKey]: 0, [`${prefix}PredictedSum`]: 0, [`${prefix}PredictedCount`]: 0, [`${prefix}ActualSum`]: 0, [`${prefix}ActualCount`]: 0 };
          const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          if (sentVal && sentVal !== '' && sentVal !== 'N/A') {
            const sentDateFormatted = parseExcelDateToMMDDYYYY(sentVal);
            if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
              buMap[bu][polledKey]++;
              const pred = parseScore(row, predictedScoreCol);
              const act = parseScore(row, actualScoreCol);
              if (pred != null) { buMap[bu][`${prefix}PredictedSum`] += pred; buMap[bu][`${prefix}PredictedCount`] += 1; }
              if (act != null) { buMap[bu][`${prefix}ActualSum`] += act; buMap[bu][`${prefix}ActualCount`] += 1; }
            }
          }
          const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          if (receivedVal && receivedVal !== '' && receivedVal !== 'N/A') {
            const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedVal);
            if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
              buMap[bu][respondedKey]++;
            }
          }
        };

        data.forEach(row => {
          const engagementType = (row[engagementTypeKey] || '').toString().trim().toLowerCase();
          const businessUnit = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';
          if (!businessUnit || businessUnit === 'N/A') return;

          if (engagementType === 'fully managed') {
            countRowForBU(row, fullyManagedByBU, businessUnit, 'fmPolled', 'fmResponded', 'fm');
          } else if (engagementType === 'co-managed') {
            countRowForBU(row, coManagedByBU, businessUnit, 'cmPolled', 'cmResponded', 'cm');
          } else if (engagementType === 'staff augmentation') {
            countRowForBU(row, staffAugmentationByBU, businessUnit, 'saPolled', 'saResponded', 'sa');
          }
        });

        const resultWithSections = result.map(row => {
          const fm = fullyManagedByBU[row.businessUnit];
          const cm = coManagedByBU[row.businessUnit];
          const sa = staffAugmentationByBU[row.businessUnit];
          const fmPolled = fm ? fm.fmPolled : 0;
          const fmResponded = fm ? fm.fmResponded : 0;
          const fmResponseRate = responseRateOneDecimal(fmResponded, fmPolled);
          const fmAverageCSATScore = fm && fm.fmActualCount > 0 ? Math.round((fm.fmActualSum / fm.fmActualCount) * 100) / 100 : null;
          const fmAvgPredictedScore = fm && fm.fmPredictedCount > 0 ? Math.round((fm.fmPredictedSum / fm.fmPredictedCount) * 100) / 100 : null;
          const cmPolled = cm ? cm.cmPolled : 0;
          const cmResponded = cm ? cm.cmResponded : 0;
          const cmResponseRate = responseRateOneDecimal(cmResponded, cmPolled);
          const cmAverageCSATScore = cm && cm.cmActualCount > 0 ? Math.round((cm.cmActualSum / cm.cmActualCount) * 100) / 100 : null;
          const cmAvgPredictedScore = cm && cm.cmPredictedCount > 0 ? Math.round((cm.cmPredictedSum / cm.cmPredictedCount) * 100) / 100 : null;
          const saPolled = sa ? sa.saPolled : 0;
          const saResponded = sa ? sa.saResponded : 0;
          const saResponseRate = responseRateOneDecimal(saResponded, saPolled);
          const saAverageCSATScore = sa && sa.saActualCount > 0 ? Math.round((sa.saActualSum / sa.saActualCount) * 100) / 100 : null;
          const saAvgPredictedScore = sa && sa.saPredictedCount > 0 ? Math.round((sa.saPredictedSum / sa.saPredictedCount) * 100) / 100 : null;
          return { ...row, fmPolled, fmResponded, fmResponseRate, fmAverageCSATScore, fmAvgPredictedScore, cmPolled, cmResponded, cmResponseRate, cmAverageCSATScore, cmAvgPredictedScore, saPolled, saResponded, saResponseRate, saAverageCSATScore, saAvgPredictedScore };
        });
        console.log('Processed BU-wise response rate data:', resultWithSections.length, 'business units');
        return { data: resultWithSections };
      } else {
        const resultWithSections = result.map(row => ({
          ...row,
          fmPolled: 0, fmResponded: 0, fmResponseRate: 0, fmAverageCSATScore: null, fmAvgPredictedScore: null,
          cmPolled: 0, cmResponded: 0, cmResponseRate: 0, cmAverageCSATScore: null, cmAvgPredictedScore: null,
          saPolled: 0, saResponded: 0, saResponseRate: 0, saAverageCSATScore: null, saAvgPredictedScore: null
        }));
        console.log('Processed BU-wise response rate data:', resultWithSections.length, 'business units');
        return { data: resultWithSections };
      }
    } else {
      // Group by customer ID for account-wise view
      const customerGroups = {};
      const otherAccountGroup = {
        customerId: 'OTHER',
        customerName: 'Other Accounts',
        businessUnit: '',
        cssSentCount: 0,
        cssReceivedCount: 0,
        predictedScoreSum: 0,
        predictedScoreCount: 0,
        actualScoreSum: 0,
        actualScoreCount: 0,
        nonStaffingReceivedCount: 0,
        staffingReceivedCount: 0
      };

    data.forEach(row => {
      const customerId = getCustomerId(row);
      const customerName = getCustomerName(row);
      const businessUnit = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';

      if (customerId) {
        // Filter for TYPE OF ACCOUNT = "Top 10" (or Top 10 = 'Y') if showTop10 is true AND we're in account-wise view
        if (showTop10 && !showBuWise) {
          if (isTop10Account(row)) {
            // This is a Top 10 customer
            if (!customerGroups[customerId]) {
              customerGroups[customerId] = {
                customerId,
                practice: getPracticeName(row),
                customerName,
                businessUnit,
                cssSentCount: 0,
                cssReceivedCount: 0,
                predictedScoreSum: 0,
                predictedScoreCount: 0,
                actualScoreSum: 0,
                actualScoreCount: 0,
                nonStaffingReceivedCount: 0,
                staffingReceivedCount: 0
              };
            }
          } else {
            // This is not a Top 10 customer, add to Other Account
            return; // We'll handle Other Account separately
          }
        } else {
          // Not in Top 10 view, include all customers
          if (!customerGroups[customerId]) {
            customerGroups[customerId] = {
              customerId,
              practice: getPracticeName(row),
              customerName,
              businessUnit,
              cssSentCount: 0,
              cssReceivedCount: 0,
              predictedScoreSum: 0,
              predictedScoreCount: 0,
              actualScoreSum: 0,
              actualScoreCount: 0,
              nonStaffingReceivedCount: 0,
              staffingReceivedCount: 0
            };
          }
        }

        // Count CSAT SENT DATE with date filtering (parse Excel serial or string to MM-DD-YYYY)
        const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
        if (sentVal && sentVal !== '' && sentVal !== 'N/A') {
          const sentDateFormatted = parseExcelDateToMMDDYYYY(sentVal);
          if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
            if (showTop10 && !showBuWise && isTop10Account(row)) {
              customerGroups[customerId].cssSentCount++;
              const pred = parseScore(row, predictedScoreCol);
              const act = parseScore(row, actualScoreCol);
              if (pred != null) { customerGroups[customerId].predictedScoreSum += pred; customerGroups[customerId].predictedScoreCount += 1; }
              if (act != null) { customerGroups[customerId].actualScoreSum += act; customerGroups[customerId].actualScoreCount += 1; }
            } else if (!showTop10) {
              customerGroups[customerId].cssSentCount++;
              const pred = parseScore(row, predictedScoreCol);
              const act = parseScore(row, actualScoreCol);
              if (pred != null) { customerGroups[customerId].predictedScoreSum += pred; customerGroups[customerId].predictedScoreCount += 1; }
              if (act != null) { customerGroups[customerId].actualScoreSum += act; customerGroups[customerId].actualScoreCount += 1; }
            }
          }
        }

        // Count CSAT RECEIVED DATE with date filtering (parse Excel serial or string to MM-DD-YYYY)
        const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
        if (receivedVal && receivedVal !== '' && receivedVal !== 'N/A') {
          const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedVal);
          if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
            if (showTop10 && !showBuWise && isTop10Account(row)) {
              customerGroups[customerId].cssReceivedCount++;
              
              // Count for Non Staffing (Time and Material, Fixed Bid, Managed Services)
              const revenueType = row['REVENUE_TYPE'] || '';
              if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
                customerGroups[customerId].nonStaffingReceivedCount++;
              }
              
              // Count for Staffing (Fixed Monthly)
              if (revenueType === 'Fixed Monthly') {
                customerGroups[customerId].staffingReceivedCount++;
              }
            } else if (!showTop10) {
              customerGroups[customerId].cssReceivedCount++;
              
              // Count for Non Staffing (Time and Material, Fixed Bid, Managed Services)
              const revenueType = row['REVENUE_TYPE'] || '';
              if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
                customerGroups[customerId].nonStaffingReceivedCount++;
              }
              
              // Count for Staffing (Fixed Monthly)
              if (revenueType === 'Fixed Monthly') {
                customerGroups[customerId].staffingReceivedCount++;
              }
            }
          }
        }
      }
    });

    // Add Other Account data for Top 10 view (TYPE OF ACCOUNT not "Top 10" / Top 10 not 'Y')
    if (showTop10 && !showBuWise) {
      data.forEach(row => {
        const customerId = getCustomerId(row);
        
        if (customerId && !isTop10Account(row)) {
          // This is not a Top 10 customer, add to Other Account
          // Count CSAT SENT DATE with date filtering (parse Excel serial or string to MM-DD-YYYY)
          const otherSentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          if (otherSentVal && otherSentVal !== '' && otherSentVal !== 'N/A') {
            const sentDateFormatted = parseExcelDateToMMDDYYYY(otherSentVal);
            if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
              otherAccountGroup.cssSentCount++;
              const pred = parseScore(row, predictedScoreCol);
              const act = parseScore(row, actualScoreCol);
              if (pred != null) { otherAccountGroup.predictedScoreSum += pred; otherAccountGroup.predictedScoreCount += 1; }
              if (act != null) { otherAccountGroup.actualScoreSum += act; otherAccountGroup.actualScoreCount += 1; }
            }
          }

          // Count CSAT RECEIVED DATE with date filtering (parse Excel serial or string to MM-DD-YYYY)
          const otherReceivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          if (otherReceivedVal && otherReceivedVal !== '' && otherReceivedVal !== 'N/A') {
            const receivedDateFormatted = parseExcelDateToMMDDYYYY(otherReceivedVal);
            if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
              otherAccountGroup.cssReceivedCount++;
              
              // Count for Non Staffing (Time and Material, Fixed Bid, Managed Services)
              const revenueType = row['REVENUE_TYPE'] || '';
              if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
                otherAccountGroup.nonStaffingReceivedCount++;
              }
              
              // Count for Staffing (Fixed Monthly)
              if (revenueType === 'Fixed Monthly') {
                otherAccountGroup.staffingReceivedCount++;
              }
            }
          }
        }
      });
    }

    const avgScore = (sum, count) => (count > 0 ? Math.round((sum / count) * 100) / 100 : null);
    // Convert to array and calculate response rate
    let result = Object.values(customerGroups)
      .filter(group => group.cssSentCount > 0) // Filter out rows with 0 surveys sent
      .map((group, index) => {
        return {
          sNo: index + 1,
          customerId: group.customerId,
          practice: group.practice || 'N/A',
          customerName: group.customerName,
          businessUnit: group.businessUnit,
          cssSentCount: group.cssSentCount,
          cssReceivedCount: group.cssReceivedCount,
            averageCSATScore: avgScore(group.actualScoreSum, group.actualScoreCount),
            avgPredictedScore: avgScore(group.predictedScoreSum, group.predictedScoreCount),
            nonStaffingReceivedCount: group.nonStaffingReceivedCount,
          staffingReceivedCount: group.staffingReceivedCount,
          responseRate: responseRateOneDecimal(group.cssReceivedCount, group.cssSentCount)
        };
      });

    // Add Other Account row for Top 10 view
    if (showTop10 && !showBuWise && otherAccountGroup.cssSentCount > 0) {
      result.push({
        sNo: result.length + 1,
        customerId: otherAccountGroup.customerId,
        practice: '',
        customerName: otherAccountGroup.customerName,
        businessUnit: otherAccountGroup.businessUnit,
        cssSentCount: otherAccountGroup.cssSentCount,
        cssReceivedCount: otherAccountGroup.cssReceivedCount,
        averageCSATScore: avgScore(otherAccountGroup.actualScoreSum, otherAccountGroup.actualScoreCount),
        avgPredictedScore: avgScore(otherAccountGroup.predictedScoreSum, otherAccountGroup.predictedScoreCount),
        nonStaffingReceivedCount: otherAccountGroup.nonStaffingReceivedCount,
        staffingReceivedCount: otherAccountGroup.staffingReceivedCount,
        responseRate: responseRateOneDecimal(otherAccountGroup.cssReceivedCount, otherAccountGroup.cssSentCount)
      });
    }

    // Fully Managed section: where ENGAGEMENT TYPE = "Fully Managed"
    // From 2nd sheet "CSAT sent and received Report": count(CSAT SENT DATE) as Polled, count(CSAT RECEIVED DATE) as Responded, Response Rate %, group by CUSTOMER_ID/CUST_ID.
    // Only rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY) are counted.
    // Key: customerId for each account; 'OTHER' only when showTop10 and row is not Top 10 (so Other Accounts row gets section totals).
    const fullyManagedMap = {};
    if (data.length > 0) {
      data.forEach(row => {
        const engagementType = (row[engagementTypeKey] || '').toString().trim();
        if (engagementType.toLowerCase() !== 'fully managed') return;

        const key = (showTop10 && !isTop10Account(row)) ? 'OTHER' : getCustomerId(row);
        if (!key) return;

        if (!fullyManagedMap[key]) {
          fullyManagedMap[key] = { fmPolled: 0, fmResponded: 0, fmPredictedSum: 0, fmPredictedCount: 0, fmActualSum: 0, fmActualCount: 0 };
        }

        const fmSentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
        if (fmSentVal && fmSentVal !== '' && fmSentVal !== 'N/A') {
          const sentDateFormatted = parseExcelDateToMMDDYYYY(fmSentVal);
          if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
            fullyManagedMap[key].fmPolled++;
            const pred = parseScore(row, predictedScoreCol);
            const act = parseScore(row, actualScoreCol);
            if (pred != null) { fullyManagedMap[key].fmPredictedSum += pred; fullyManagedMap[key].fmPredictedCount += 1; }
            if (act != null) { fullyManagedMap[key].fmActualSum += act; fullyManagedMap[key].fmActualCount += 1; }
          }
        }
        const fmReceivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
        if (fmReceivedVal && fmReceivedVal !== '' && fmReceivedVal !== 'N/A') {
          const receivedDateFormatted = parseExcelDateToMMDDYYYY(fmReceivedVal);
          if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
            fullyManagedMap[key].fmResponded++;
          }
        }
      });

      result = result.map(row => {
        const fm = fullyManagedMap[row.customerId];
        const fmPolled = fm ? fm.fmPolled : 0;
        const fmResponded = fm ? fm.fmResponded : 0;
        const fmResponseRate = responseRateOneDecimal(fmResponded, fmPolled);
        const fmAverageCSATScore = fm && fm.fmActualCount > 0 ? Math.round((fm.fmActualSum / fm.fmActualCount) * 100) / 100 : null;
        const fmAvgPredictedScore = fm && fm.fmPredictedCount > 0 ? Math.round((fm.fmPredictedSum / fm.fmPredictedCount) * 100) / 100 : null;
        return { ...row, fmPolled, fmResponded, fmResponseRate, fmAverageCSATScore, fmAvgPredictedScore };
      });
    } else {
      result = result.map(row => ({ ...row, fmPolled: 0, fmResponded: 0, fmResponseRate: 0, fmAverageCSATScore: null, fmAvgPredictedScore: null }));
    }

    // Co-Managed section: where ENGAGEMENT TYPE = "Co-Managed"
    // From 2nd sheet "CSAT sent and received Report": count(CSAT SENT DATE) as Polled, count(CSAT RECEIVED DATE) as Responded, Response Rate %, group by CUSTOMER_ID/CUST_ID.
    // Only rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY) are counted.
    const coManagedMap = {};
    if (data.length > 0) {
      data.forEach(row => {
        const engagementType = (row[engagementTypeKey] || '').toString().trim();
        if (engagementType.toLowerCase() !== 'co-managed') return;

        const key = (showTop10 && !isTop10Account(row)) ? 'OTHER' : getCustomerId(row);
        if (!key) return;

        if (!coManagedMap[key]) {
          coManagedMap[key] = { cmPolled: 0, cmResponded: 0, cmPredictedSum: 0, cmPredictedCount: 0, cmActualSum: 0, cmActualCount: 0 };
        }

        const cmSentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
        if (cmSentVal && cmSentVal !== '' && cmSentVal !== 'N/A') {
          const sentDateFormatted = parseExcelDateToMMDDYYYY(cmSentVal);
          if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
            coManagedMap[key].cmPolled++;
            const pred = parseScore(row, predictedScoreCol);
            const act = parseScore(row, actualScoreCol);
            if (pred != null) { coManagedMap[key].cmPredictedSum += pred; coManagedMap[key].cmPredictedCount += 1; }
            if (act != null) { coManagedMap[key].cmActualSum += act; coManagedMap[key].cmActualCount += 1; }
          }
        }
        const cmReceivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
        if (cmReceivedVal && cmReceivedVal !== '' && cmReceivedVal !== 'N/A') {
          const receivedDateFormatted = parseExcelDateToMMDDYYYY(cmReceivedVal);
          if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
            coManagedMap[key].cmResponded++;
          }
        }
      });

      result = result.map(row => {
        const cm = coManagedMap[row.customerId];
        const cmPolled = cm ? cm.cmPolled : 0;
        const cmResponded = cm ? cm.cmResponded : 0;
        const cmResponseRate = responseRateOneDecimal(cmResponded, cmPolled);
        const cmAverageCSATScore = cm && cm.cmActualCount > 0 ? Math.round((cm.cmActualSum / cm.cmActualCount) * 100) / 100 : null;
        const cmAvgPredictedScore = cm && cm.cmPredictedCount > 0 ? Math.round((cm.cmPredictedSum / cm.cmPredictedCount) * 100) / 100 : null;
        return { ...row, cmPolled, cmResponded, cmResponseRate, cmAverageCSATScore, cmAvgPredictedScore };
      });
    } else {
      result = result.map(row => ({ ...row, cmPolled: 0, cmResponded: 0, cmResponseRate: 0, cmAverageCSATScore: null, cmAvgPredictedScore: null }));
    }

    // Staff Augmentation section: where ENGAGEMENT TYPE = "Staff Augmentation"
    // From 2nd sheet "CSAT sent and received Report": count(CSAT SENT DATE) as Polled, count(CSAT RECEIVED DATE) as Responded, Response Rate %, group by CUSTOMER_ID/CUST_ID.
    // Only rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY) are counted.
    const staffAugmentationMap = {};
    if (data.length > 0) {
      data.forEach(row => {
        const engagementType = (row[engagementTypeKey] || '').toString().trim();
        if (engagementType.toLowerCase() !== 'staff augmentation') return;

        const key = (showTop10 && !isTop10Account(row)) ? 'OTHER' : getCustomerId(row);
        if (!key) return;

        if (!staffAugmentationMap[key]) {
          staffAugmentationMap[key] = { saPolled: 0, saResponded: 0, saPredictedSum: 0, saPredictedCount: 0, saActualSum: 0, saActualCount: 0 };
        }

        const saSentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
        if (saSentVal && saSentVal !== '' && saSentVal !== 'N/A') {
          const sentDateFormatted = parseExcelDateToMMDDYYYY(saSentVal);
          if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
            staffAugmentationMap[key].saPolled++;
            const pred = parseScore(row, predictedScoreCol);
            const act = parseScore(row, actualScoreCol);
            if (pred != null) { staffAugmentationMap[key].saPredictedSum += pred; staffAugmentationMap[key].saPredictedCount += 1; }
            if (act != null) { staffAugmentationMap[key].saActualSum += act; staffAugmentationMap[key].saActualCount += 1; }
          }
        }
        const saReceivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
        if (saReceivedVal && saReceivedVal !== '' && saReceivedVal !== 'N/A') {
          const receivedDateFormatted = parseExcelDateToMMDDYYYY(saReceivedVal);
          if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
            staffAugmentationMap[key].saResponded++;
          }
        }
      });

      result = result.map(row => {
        const sa = staffAugmentationMap[row.customerId];
        const saPolled = sa ? sa.saPolled : 0;
        const saResponded = sa ? sa.saResponded : 0;
        const saResponseRate = responseRateOneDecimal(saResponded, saPolled);
        const saAverageCSATScore = sa && sa.saActualCount > 0 ? Math.round((sa.saActualSum / sa.saActualCount) * 100) / 100 : null;
        const saAvgPredictedScore = sa && sa.saPredictedCount > 0 ? Math.round((sa.saPredictedSum / sa.saPredictedCount) * 100) / 100 : null;
        return { ...row, saPolled, saResponded, saResponseRate, saAverageCSATScore, saAvgPredictedScore };
      });
    } else {
      result = result.map(row => ({ ...row, saPolled: 0, saResponded: 0, saResponseRate: 0, saAverageCSATScore: null, saAvgPredictedScore: null }));
    }

    result = result.sort((a, b) => a.sNo - b.sNo); // Sort by S No. ascending

    console.log('Processed response rate data:', result.length, 'customers');
    if (showTop10 && !showBuWise) {
      console.log('Other Account data:', otherAccountGroup);
    }
    return { data: result };
    }
  }, [excelData, csatCycleStartDateFormatted, showBuWise, showTop10, acsatCycle]);

  // Apply search filter
  const filteredData = useMemo(() => {
    if (!processedData.data || processedData.data.length === 0) return [];
    
    let filtered = processedData.data;
    
    // Apply customer name search (only for account-wise view)
    if (customerNameSearch && !showBuWise && !showTop10) {
      filtered = filtered.filter(row => 
        row.customerName.toLowerCase().includes(customerNameSearch.toLowerCase())
      );
    }

    // Default order by BUSINESS UNIT (Health Care/Health care, CIT, Tech, India & UK, Sead) when account-wise and not Top 10
    if (!showBuWise && !showTop10 && filtered.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const indexA = getBusinessUnitOrderIndex(a.businessUnit);
        const indexB = getBusinessUnitOrderIndex(b.businessUnit);
        if (indexA !== -1 && indexB !== -1) {
          if (indexA !== indexB) return indexA - indexB;
          return (a.customerName || '').localeCompare(b.customerName || '');
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.businessUnit || '').localeCompare(b.businessUnit || '');
      }).map((row, idx) => ({ ...row, sNo: idx + 1 }));
    }
    
    // Custom sorting for Top 10 accounts (Sr. No. 1–12 in correct order)
    if (showTop10 && !showBuWise) {
      const top10Order = [
        'Premier Healthcare Solutions Inc (L80)',
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
      
      filtered.sort((a, b) => {
        const indexA = top10Order.indexOf(a.customerName);
        const indexB = top10Order.indexOf(b.customerName);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.customerName || '').localeCompare(b.customerName || '');
      });
    }

    // Reassign Sr. No. in correct display order (1, 2, … 12 for Top 10 account rows; empty for Other Account / summary rows)
    if (showTop10 && !showBuWise) {
      let srNo = 1;
      filtered = filtered.map((row) => ({
        ...row,
        sNo: (row.customerId === 'OTHER' || row.customerName === 'Other Accounts') ? '' : srNo++
      }));
    } else {
    filtered = filtered.map((row, i) => ({ ...row, sNo: i + 1 }));
    }
    
    return filtered;
  }, [processedData.data, customerNameSearch, showBuWise, showTop10]);

  // Trend analysis: process uploaded trend files from "Upload data for trend analysis"
  // Sheet "CSAT sent and received Report", group by BUSINESS UNIT, date filter: >= csatCycleStartDateFormatted
  const trendDataProcessed = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return [];
    return trendAnalysisFiles.map(file => {
      const sheetName = file.sheetNames?.find(s => 
        String(s).toLowerCase().includes('csat sent and received') || 
        String(s).toLowerCase() === 'sheet2'
      ) || (file.sheetNames?.[1] || file.sheetNames?.[0]);
      const data = sheetName ? (file.sheets?.[sheetName] || []) : [];
      if (!data.length) return { saveName: file.saveName, rows: [], hasData: false };

      const firstRow = data[0] || {};
      const sentDateCol = Object.keys(firstRow).find(k => 
        /csat\s*sent\s*date|css_sent_date/i.test(String(k))
      ) || 'CSAT SENT DATE';
      const receivedDateCol = Object.keys(firstRow).find(k => 
        /csat\s*received\s*date|css_received_date/i.test(String(k))
      ) || 'CSAT RECEIVED DATE';
      const buCol = Object.keys(firstRow).find(k => 
        /business\s*unit|bussiness\s*unit/i.test(String(k))
      ) || 'BUSINESS UNIT';
      const actualScoreCol = Object.keys(firstRow).find(k => 
        /actual\s*score/i.test(String(k))
      ) || 'ACTUAL SCORE';
      const predictedScoreCol = Object.keys(firstRow).find(k => 
        /predicted\s*score/i.test(String(k))
      ) || 'PREDICTED SCORE';
      const yearQuarterCol = Object.keys(firstRow).find(k => {
        const lower = (k || '').toString().toLowerCase().replace(/\s|_/g, '');
        return lower === 'year-quarter' || lower === 'yearquarter' || (lower.includes('year') && lower.includes('quarter'));
      }) || 'YEAR - QUARTER';

      const buMap = {};
      const orgLevelAgg = { actualSum: 0, actualCount: 0, predictedSum: 0, predictedCount: 0 };
      data.forEach(row => {
        const bu = (row[buCol] ?? row['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
        if (!buMap[bu]) buMap[bu] = { polled: 0, responded: 0, actualSum: 0, actualCount: 0, predictedSum: 0, predictedCount: 0, yearQuarter: null };

        const yqVal = row[yearQuarterCol] ?? row['YEAR_QUARTER'] ?? row['Year Quarter'];
        if (yqVal != null && yqVal !== '' && yqVal !== 'N/A' && !buMap[bu].yearQuarter) {
          buMap[bu].yearQuarter = String(yqVal).trim();
        }

        const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'];
        if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
          const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            buMap[bu].polled += 1;
          }
        }
        const recvVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'];
        if (recvVal != null && recvVal !== '' && recvVal !== 'N/A') {
          const recvFormatted = parseExcelDateToMMDDYYYY(recvVal);
          if (recvFormatted && isDateGreaterThanOrEqual(recvFormatted, csatCycleStartDateFormatted)) {
            buMap[bu].responded += 1;
            const scoreVal = row[actualScoreCol];
            const score = scoreVal != null && scoreVal !== '' && scoreVal !== 'N/A' ? parseFloat(scoreVal) : null;
            if (score != null && !isNaN(score)) {
              buMap[bu].actualSum += score;
              buMap[bu].actualCount += 1;
              orgLevelAgg.actualSum += score;
              orgLevelAgg.actualCount += 1;
            }
            const predVal = row[predictedScoreCol];
            const pred = predVal != null && predVal !== '' && predVal !== 'N/A' ? parseFloat(predVal) : null;
            if (pred != null && !isNaN(pred)) {
              buMap[bu].predictedSum += pred;
              buMap[bu].predictedCount += 1;
              orgLevelAgg.predictedSum += pred;
              orgLevelAgg.predictedCount += 1;
            }
          }
        }
      });

      const order = BUSINESS_UNIT_DISPLAY_ORDER;
      const rows = Object.entries(buMap)
        .map(([bu, v]) => ({
          businessUnit: bu,
          polled: v.polled,
          responded: v.responded,
          responseRatePct: v.polled > 0 ? (v.responded / v.polled) * 100 : 0,
          avgCSATScore: v.actualCount > 0 ? Math.round((v.actualSum / v.actualCount) * 100) / 100 : null,
          avgPredictedScore: v.predictedCount > 0 ? Math.round((v.predictedSum / v.predictedCount) * 100) / 100 : null,
          yearQuarter: v.yearQuarter || acsatCycle || ''
        }))
        .sort((a, b) => {
          const ia = order.indexOf(a.businessUnit);
          const ib = order.indexOf(b.businessUnit);
          if (ia >= 0 && ib >= 0) return ia - ib;
          if (ia >= 0) return -1;
          if (ib >= 0) return 1;
          return String(a.businessUnit).localeCompare(b.businessUnit);
        });

      const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
      const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
      // Org level: Average CSAT Score = Avg(ACTUAL SCORE), Avg. Predicted Score = Avg(PREDICTED SCORE) from all rows in Sheet2
      const orgLevelRow = {
        businessUnit: 'Org level',
        polled: totalPolled,
        responded: totalResponded,
        responseRatePct: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : 0,
        avgCSATScore: orgLevelAgg.actualCount > 0 ? Math.round((orgLevelAgg.actualSum / orgLevelAgg.actualCount) * 100) / 100 : null,
        avgPredictedScore: orgLevelAgg.predictedCount > 0 ? Math.round((orgLevelAgg.predictedSum / orgLevelAgg.predictedCount) * 100) / 100 : null,
        // Prefer the real YEAR - QUARTER value captured from this trend file's own rows
        // (same source as every BU row above) over acsatCycle, which reflects the main
        // dashboard's period and can disagree with what this specific trend file contains.
        yearQuarter: rows.map(r => r.yearQuarter).find(Boolean) || acsatCycle || ''
      };
      return { saveName: file.saveName, rows, orgLevelRow, hasData: rows.length > 0 };
    });
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, acsatCycle]);

  // Account-wise trend analysis reference (H1 2025):
  // Read Trend-Analysis-H12025.xlsx from "Upload data for trend analysis" (Sheet2 / "CSAT sent and received Report")
  // Group by CUSTOMER_ID/CUST_ID (+ BUSINESS UNIT) and compute:
  // #Polled=count(CSAT SENT DATE), #Responded=count(CSAT RECEIVED DATE),
  // Response Rate % = #Responded/#Polled*100, Average CSAT Score = Avg(ACTUAL SCORE)
  const trendAccountBuH1 = useMemo(() => {
    if (!showTrendSection) return { rows: [], hasData: false, sourceName: null, error: null };
    if (!csatCycleStartDateFormatted) return { rows: [], hasData: false, sourceName: null, error: 'CSAT cycle start date is required.' };

    const nameLower = (s) => (s || '').toLowerCase();
    const h12025File =
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis') && nameLower(f.saveName).includes('h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis') && nameLower(f.originalName).includes('h12025')) ||
      // No file matches the old fixed "H1 2025" naming convention — fall back to
      // whichever comparison period was fetched/uploaded most recently, since the
      // reference period is now chosen by the user (via API fetch) rather than fixed.
      (trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null);

    if (!h12025File) {
      return {
        rows: [],
        hasData: false,
        sourceName: null,
        error: 'Fetch or upload a comparison period in "Upload data for trend analysis" to view this table.'
      };
    }

    const sheetName = h12025File.sheetNames?.find(s => String(s).toLowerCase().includes('csat sent and received')) || h12025File.sheetNames?.[1] || h12025File.sheetNames?.[0];
    const data = sheetName ? (h12025File.sheets?.[sheetName] || []) : [];
    if (!data.length) {
      return { rows: [], hasData: false, sourceName: h12025File.saveName, error: `No rows found in sheet "${sheetName || 'Sheet2'}".` };
    }

    const firstRow = data[0] || {};
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const custIdCol =
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'customer_id') ||
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'cust_id') ||
      'CUST_ID';
    const custNameCol =
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'customername') ||
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'cust_nm') ||
      'CUSTOMER NAME';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, COL_BUSINESS_UNIT) ? COL_BUSINESS_UNIT : (Object.prototype.hasOwnProperty.call(firstRow, 'BUSSINESS UNIT') ? 'BUSSINESS UNIT' : COL_BUSINESS_UNIT);
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';

    const group = new Map();
    data.forEach((row) => {
      const sentVal = row?.[sentDateCol] ?? row?.['CSS_SENT_DATE'];
      if (sentVal == null || sentVal === '' || sentVal === 'N/A') return;
      const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
      if (!sentFormatted || !isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) return;

      const recvVal = row?.[receivedDateCol] ?? row?.['CSS_RECEIVED_DATE'];
      const hasReceived = recvVal != null && recvVal !== '' && recvVal !== 'N/A';

      const custId = normalizeCustomerIdKey(row?.[custIdCol] ?? row?.['CUST_ID'] ?? row?.['CUSTOMER_ID'] ?? '');
      const accountName = (row?.[custNameCol] ?? row?.['CUST_NM'] ?? '').toString().trim();
      const businessUnit = (row?.[businessUnitCol] ?? row?.['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
      const key = `${custId || accountName || 'N/A'}|||${normalizeBusinessUnitDisplay(businessUnit)}`;

      if (!group.has(key)) {
        group.set(key, { customerId: custId || '', accountName: accountName || 'N/A', businessUnit, polled: 0, responded: 0, scoreSum: 0, scoreCount: 0 });
      }
      const agg = group.get(key);
      agg.polled += 1;

      if (hasReceived) {
        const recvFormatted = parseExcelDateToMMDDYYYY(recvVal);
        if (!recvFormatted || !isDateGreaterThanOrEqual(recvFormatted, csatCycleStartDateFormatted)) return;
        agg.responded += 1;
        const rawScore = row?.[actualScoreCol];
        const score = rawScore != null && rawScore !== '' && rawScore !== 'N/A' ? parseFloat(rawScore) : null;
        if (score != null && !isNaN(score)) {
          agg.scoreSum += score;
          agg.scoreCount += 1;
        }
      }
    });

    const rows = Array.from(group.values()).map(v => {
      const responseRatePct = v.polled > 0 ? (v.responded / v.polled) * 100 : 0;
      const avgCSATScore = v.scoreCount > 0 ? (v.scoreSum / v.scoreCount) : null;
      return {
        customerId: v.customerId || '',
        accountName: v.accountName,
        businessUnit: v.businessUnit,
        polled: v.polled,
        responded: v.responded,
        responseRatePct,
        avgCSATScore
      };
    }).sort((a, b) => {
      const an = (a.accountName || '').localeCompare(b.accountName || '');
      if (an !== 0) return an;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });

    return { rows, hasData: rows.length > 0, sourceName: h12025File.saveName, error: null };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, showTrendSection]);

  // Lookup for account-wise trend (H1) by CUSTOMER_ID (preferred) or Account+BU
  const trendAccountBuLookup = useMemo(() => {
    const lookup = {};
    (trendAccountBuH1?.rows || []).forEach(r => {
      const acc = (r.accountName || '').toString().trim().toLowerCase();
      const bu = normalizeBusinessUnitDisplay(r.businessUnit || '').toString().trim().toLowerCase();
      const id = normalizeCustomerIdKey(r.customerId || '');
      if (id) lookup[`id|||${id}|||${bu}`] = r;
      if (acc) lookup[`name|||${acc}|||${bu}`] = r;
      if (acc) lookup[`nameOnly|||${acc}`] = r;
    });
    return lookup;
  }, [trendAccountBuH1]);

  // Trend Top 10: process uploaded trend files for Top 10 view
  // Sheet2 "CSAT sent and received Report", TYPE OF ACCOUNT = "Top 10", group by Account (CUSTOMER NAME)
  // Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE), date >= csatCycleStartDateFormatted (MM-DD-YYYY)
  const trendTop10DataProcessed = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return [];
    return trendAnalysisFiles.map(file => {
      const sheetName = file.sheetNames?.find(s =>
        String(s).toLowerCase().includes('csat sent and received') ||
        String(s).toLowerCase() === 'sheet2'
      ) || (file.sheetNames?.[1] || file.sheetNames?.[0]);
      const data = sheetName ? (file.sheets?.[sheetName] || []) : [];
      if (!data.length) return { saveName: file.saveName, rows: [], hasData: false };

      const firstRow = data[0] || {};
      const sentDateCol = Object.keys(firstRow).find(k => /csat\s*sent\s*date|css_sent_date/i.test(String(k))) || 'CSAT SENT DATE';
      const receivedDateCol = Object.keys(firstRow).find(k => /csat\s*received\s*date|css_received_date/i.test(String(k))) || 'CSAT RECEIVED DATE';
      const customerNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const buCol = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
      const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account|top\s*10/i.test(String(k))) || 'TYPE OF ACCOUNT';
      const actualScoreCol = Object.keys(firstRow).find(k => /actual\s*score/i.test(String(k))) || 'ACTUAL SCORE';
      const custIdCol = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k)));

      const isTop10Account = (row) => {
        const val = (row[typeOfAccountCol] ?? row['Top 10'] ?? '').toString().trim();
        if (typeOfAccountCol === 'TYPE OF ACCOUNT') return val.toLowerCase() === 'top 10';
        return val.toUpperCase() === 'Y';
      };
      const isOtherAccount = (row) => {
        const val = (row[typeOfAccountCol] ?? row['Top 10'] ?? '').toString().trim().toLowerCase();
        return val === '' || val === 'n/a';
      };

      const getCustomerId = (row) => {
        const id = custIdCol ? row[custIdCol] : (row['CUST_ID'] ?? row['CUSTOMER_ID']);
        return id != null && id !== '' ? String(id).trim() : '';
      };
      const getCustomerName = (row) => {
        const name = row[customerNameCol] ?? row['CUST_NM'];
        return name != null && String(name).trim() !== '' ? String(name).trim() : 'N/A';
      };

      const accountMap = {};
      const otherAgg = { polled: 0, responded: 0, actualSum: 0, actualCount: 0 };
      const allRowsAgg = { polled: 0, responded: 0, actualSum: 0, actualCount: 0 };
      data.forEach(row => {
        const isTop10 = isTop10Account(row);
        const isOther = isOtherAccount(row);
        const custName = getCustomerName(row);
        const bu = (row[buCol] ?? row['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
        const key = `${custName}|||${bu}`;
        if (isTop10) {
          if (!accountMap[key]) {
            accountMap[key] = { accountName: custName, businessUnit: bu, polled: 0, responded: 0, actualSum: 0, actualCount: 0 };
          }
        }
        const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'];
        if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
          const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            if (isTop10) accountMap[key].polled += 1;
            else if (isOther) otherAgg.polled += 1;
            allRowsAgg.polled += 1;
          }
        }
        const recvVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'];
        if (recvVal != null && recvVal !== '' && recvVal !== 'N/A') {
          const recvFormatted = parseExcelDateToMMDDYYYY(recvVal);
          if (recvFormatted && isDateGreaterThanOrEqual(recvFormatted, csatCycleStartDateFormatted)) {
            const scoreVal = row[actualScoreCol];
            const score = scoreVal != null && scoreVal !== '' && scoreVal !== 'N/A' ? parseFloat(scoreVal) : null;
            if (isTop10) {
              accountMap[key].responded += 1;
              if (score != null && !isNaN(score)) {
                accountMap[key].actualSum += score;
                accountMap[key].actualCount += 1;
              }
            } else if (isOther) {
              otherAgg.responded += 1;
              if (score != null && !isNaN(score)) {
                otherAgg.actualSum += score;
                otherAgg.actualCount += 1;
              }
            }
            allRowsAgg.responded += 1;
            if (score != null && !isNaN(score)) {
              allRowsAgg.actualSum += score;
              allRowsAgg.actualCount += 1;
            }
          }
        }
      });

      const rows = Object.values(accountMap)
        .filter(a => a.polled > 0)
        .map(a => ({
          accountName: a.accountName,
          businessUnit: a.businessUnit,
          polled: a.polled,
          responded: a.responded,
          responseRatePct: a.polled > 0 ? (a.responded / a.polled) * 100 : 0,
          avgCSATScore: a.actualCount > 0 ? Math.round((a.actualSum / a.actualCount) * 100) / 100 : null
        }))
        .sort((a, b) => {
          const cmp = (a.accountName || '').localeCompare(b.accountName || '');
          return cmp !== 0 ? cmp : (a.businessUnit || '').localeCompare(b.businessUnit || '');
        });

      // Top 10 Accounts grand total row: sum of all TYPE OF ACCOUNT = Top 10
      let top10GrandTotalRow = null;
      if (rows.length > 0) {
        const totalPolled = rows.reduce((s, r) => s + r.polled, 0);
        const totalResponded = rows.reduce((s, r) => s + r.responded, 0);
        const totalActualSum = rows.reduce((s, r) => s + (r.avgCSATScore != null && r.responded > 0 ? r.avgCSATScore * r.responded : 0), 0);
        const totalActualCount = rows.reduce((s, r) => s + (r.avgCSATScore != null && r.responded > 0 ? r.responded : 0), 0);
        top10GrandTotalRow = {
          accountName: 'Top 10 Accounts',
          businessUnit: 'N/A',
          polled: totalPolled,
          responded: totalResponded,
          responseRatePct: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : 0,
          avgCSATScore: totalActualCount > 0 ? Math.round((totalActualSum / totalActualCount) * 100) / 100 : null
        };
      }

      // Other Accounts grand total row: sum of all TYPE OF ACCOUNT = Blank or Empty or N/A
      let otherAccountsRow = null;
      if (otherAgg.polled > 0) {
        otherAccountsRow = {
          accountName: 'Other Accounts',
          businessUnit: 'N/A',
          polled: otherAgg.polled,
          responded: otherAgg.responded,
          responseRatePct: otherAgg.polled > 0 ? (otherAgg.responded / otherAgg.polled) * 100 : 0,
          avgCSATScore: otherAgg.actualCount > 0 ? Math.round((otherAgg.actualSum / otherAgg.actualCount) * 100) / 100 : null
        };
      }

      // Overall grand total row: sum of all rows (every row in sheet)
      let overallRow = null;
      if (allRowsAgg.polled > 0) {
        overallRow = {
          accountName: 'Overall',
          businessUnit: 'N/A',
          polled: allRowsAgg.polled,
          responded: allRowsAgg.responded,
          responseRatePct: (allRowsAgg.responded / allRowsAgg.polled) * 100,
          avgCSATScore: allRowsAgg.actualCount > 0 ? Math.round((allRowsAgg.actualSum / allRowsAgg.actualCount) * 100) / 100 : null
        };
      }

      return { saveName: file.saveName, rows, top10GrandTotalRow, otherAccountsRow, overallRow, hasData: rows.length > 0 || otherAgg.polled > 0 || allRowsAgg.polled > 0 };
    });
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Lookup for trend columns: first trend file with data, keyed by normalized Business Unit
  const trendBuLookup = useMemo(() => {
    const firstWithData = [...(trendDataProcessed || [])].reverse().find(f => f.hasData);
    if (!firstWithData?.rows?.length) return {};
    const map = {};
    firstWithData.rows.forEach(r => {
      const key = normalizeBusinessUnitDisplay(r.businessUnit) || r.businessUnit;
      map[key] = { responseRatePct: r.responseRatePct, avgCSATScore: r.avgCSATScore, yearQuarter: r.yearQuarter };
    });
    return map;
  }, [trendDataProcessed]);

  // Lookup for Top 10 trend columns: first trend file with data, keyed by accountName|||businessUnit
  const trendTop10Lookup = useMemo(() => {
    const firstWithData = [...(trendTop10DataProcessed || [])].reverse().find(f => f.hasData);
    if (!firstWithData?.rows?.length) return {};
    const map = {};
    firstWithData.rows.forEach(r => {
      const acc = (r.accountName || '').trim().toLowerCase();
      const bu = (normalizeBusinessUnitDisplay(r.businessUnit) || r.businessUnit || '').toString().trim().toLowerCase();
      const value = { responseRatePct: r.responseRatePct, avgCSATScore: r.avgCSATScore };
      if (acc && bu) map[`${acc}|||${bu}`] = value;
      if (acc) map[`nameOnly|||${acc}`] = value;
    });
    return map;
  }, [trendTop10DataProcessed]);

  // Lookup for Top 10 trend summary rows (Top 10 Accounts, Other Accounts, Overall) for arrow comparison
  const trendTop10SummaryLookup = useMemo(() => {
    const firstWithData = [...(trendTop10DataProcessed || [])].reverse().find(f => f.hasData);
    if (!firstWithData) return {};
    const map = {};
    if (firstWithData.top10GrandTotalRow) {
      map['Top 10 Accounts|||N/A'] = { responseRatePct: firstWithData.top10GrandTotalRow.responseRatePct, avgCSATScore: firstWithData.top10GrandTotalRow.avgCSATScore };
    }
    if (firstWithData.otherAccountsRow) {
      map['Other Accounts|||N/A'] = { responseRatePct: firstWithData.otherAccountsRow.responseRatePct, avgCSATScore: firstWithData.otherAccountsRow.avgCSATScore };
    }
    if (firstWithData.overallRow) {
      map['Overall|||N/A'] = { responseRatePct: firstWithData.overallRow.responseRatePct, avgCSATScore: firstWithData.overallRow.avgCSATScore };
    }
    return map;
  }, [trendTop10DataProcessed]);

  // Chart data: BU-wise Response Rate % comparison (Dashboard vs Trend)
  // Dashboard: Response Rate % from "Account/BU wise Response Rate Dashboard" BU-wise view (excelData Sheet2)
  // Trend: Response Rate % from uploaded trend files (e.g. Trend-Analysis-H12025) for YEAR - QUARTER comparison
  const responseRateComparisonChartData = useMemo(() => {
    if (!showBuWise || !filteredData?.length || Object.keys(trendBuLookup).length === 0) return [];
    const buRows = filteredData.filter(r => !r.isOrgLevel && r.businessUnit !== 'Org level');
    const buSet = new Set();
    buRows.forEach(r => buSet.add(normalizeBusinessUnitDisplay(r.businessUnit)));
    Object.keys(trendBuLookup).forEach(k => buSet.add(k));
    return Array.from(buSet)
      .filter(Boolean)
      .sort((a, b) => {
        const order = BUSINESS_UNIT_DISPLAY_ORDER;
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return String(a).localeCompare(b);
      })
      .map(bu => {
        const dashRow = buRows.find(r => normalizeBusinessUnitDisplay(r.businessUnit) === bu);
        const trend = trendBuLookup[bu];
        const dashboardRate = dashRow?.responseRate != null ? parseFloat(dashRow.responseRate) : null;
        const trendRate = trend?.responseRatePct;
        const yearQuarterDashboard = dashRow?.yearQuarter || acsatCycle || '';
        const yearQuarterTrend = trend?.yearQuarter || acsatCycle || '';
        const yearQuarterVal = yearQuarterDashboard || yearQuarterTrend;
        return {
          name: bu,
          dashboard: dashboardRate != null && !isNaN(dashboardRate) ? Math.round(dashboardRate * 10) / 10 : null,
          trend: trendRate != null && !isNaN(trendRate) ? Math.round(trendRate * 10) / 10 : null,
          yearQuarter: yearQuarterVal,
          yearQuarterDashboard,
          yearQuarterTrend
        };
      })
      .filter(row => row.dashboard != null || row.trend != null);
  }, [showBuWise, filteredData, trendBuLookup, acsatCycle]);

  // Chart data: BU-wise Average CSAT Score comparison (Dashboard vs Trend)
  // Dashboard: Average CSAT Score from "Account/BU wise Response Rate Dashboard" BU-wise view | Trend: from uploaded file (e.g. Trend-Analysis-H12025) for YEAR - QUARTER comparison
  const avgCSATScoreComparisonChartData = useMemo(() => {
    if (!showBuWise || !filteredData?.length || Object.keys(trendBuLookup).length === 0) return [];
    const buRows = filteredData.filter(r => !r.isOrgLevel && r.businessUnit !== 'Org level');
    const buSet = new Set();
    buRows.forEach(r => buSet.add(normalizeBusinessUnitDisplay(r.businessUnit)));
    Object.keys(trendBuLookup).forEach(k => buSet.add(k));
    return Array.from(buSet)
      .filter(Boolean)
      .sort((a, b) => {
        const order = BUSINESS_UNIT_DISPLAY_ORDER;
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return String(a).localeCompare(b);
      })
      .map(bu => {
        const dashRow = buRows.find(r => normalizeBusinessUnitDisplay(r.businessUnit) === bu);
        const trend = trendBuLookup[bu];
        const dashScore = dashRow?.averageCSATScore != null ? parseFloat(dashRow.averageCSATScore) : null;
        const trendScore = trend?.avgCSATScore;
        const yearQuarterDashboard = dashRow?.yearQuarter || acsatCycle || '';
        const yearQuarterTrend = trend?.yearQuarter || acsatCycle || '';
        return {
          name: bu,
          dashboard: dashScore != null && !isNaN(dashScore) ? Math.round(dashScore * 100) / 100 : null,
          trend: trendScore != null && !isNaN(trendScore) ? Math.round(trendScore * 100) / 100 : null,
          yearQuarter: yearQuarterDashboard || yearQuarterTrend,
          yearQuarterDashboard,
          yearQuarterTrend
        };
      })
      .filter(row => row.dashboard != null || row.trend != null);
  }, [showBuWise, filteredData, trendBuLookup, acsatCycle]);

  // Org-level score averages for BU-wise view: computed from Sheet2 "CSAT sent and received Report"
  // Main: Avg(ACTUAL SCORE), Avg(PREDICTED SCORE) for all rows where CSAT SENT DATE >= cycle start
  // Fully Managed / Co-Managed / Staff Augmentation: same averages filtered by ENGAGEMENT TYPE (column may be "Project Engagement Type" in file; we use ENGAGEMENT TYPE for display)
  const orgLevelScoresBuWise = useMemo(() => {
    if (!showBuWise || !excelData?.secondSheetData?.length) return null;
    const data = excelData.secondSheetData;
    const firstRow = data[0] || {};
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const engagementTypeKey = Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype') || COL_ENGAGEMENT_TYPE;
    const predictedScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'PREDICTED SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'predictedscore')) || 'PREDICTED SCORE';
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';
    const parseScore = (row, col) => {
      const val = row[col];
      if (val == null || val === '' || val === 'N/A') return null;
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };
    const avgScore = (sum, count) => (count > 0 ? Math.round((sum / count) * 100) / 100 : null);
    // Normalize ENGAGEMENT TYPE for matching: trim, lower case, collapse spaces, treat hyphen as space
    const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
    const isFullyManaged = (et) => norm(et) === 'fully managed';
    const isCoManaged = (et) => norm(et) === 'co managed';
    const isStaffAugmentation = (et) => norm(et) === 'staff augmentation';

    let actualSum = 0, actualCount = 0, predictedSum = 0, predictedCount = 0;
    let fmActualSum = 0, fmActualCount = 0, fmPredictedSum = 0, fmPredictedCount = 0;
    let cmActualSum = 0, cmActualCount = 0, cmPredictedSum = 0, cmPredictedCount = 0;
    let saActualSum = 0, saActualCount = 0, saPredictedSum = 0, saPredictedCount = 0;

    data.forEach(row => {
      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal === undefined || sentVal === null || sentVal === '' || sentVal === 'N/A') return;
      const sentDateFormatted = parseExcelDateToMMDDYYYY(sentVal);
      if (!sentDateFormatted || (csatCycleStartDateFormatted && !isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) return;

      const pred = parseScore(row, predictedScoreCol);
      const act = parseScore(row, actualScoreCol);
      if (act != null) { actualSum += act; actualCount += 1; }
      if (pred != null) { predictedSum += pred; predictedCount += 1; }

      const engagementTypeRaw = row[engagementTypeKey];
      const engagementType = (engagementTypeRaw != null && engagementTypeRaw !== '') ? String(engagementTypeRaw).trim() : '';
      if (isFullyManaged(engagementType)) {
        if (act != null) { fmActualSum += act; fmActualCount += 1; }
        if (pred != null) { fmPredictedSum += pred; fmPredictedCount += 1; }
      } else if (isCoManaged(engagementType)) {
        if (act != null) { cmActualSum += act; cmActualCount += 1; }
        if (pred != null) { cmPredictedSum += pred; cmPredictedCount += 1; }
      } else if (isStaffAugmentation(engagementType)) {
        if (act != null) { saActualSum += act; saActualCount += 1; }
        if (pred != null) { saPredictedSum += pred; saPredictedCount += 1; }
      }
    });

    return {
      averageCSATScore: avgScore(actualSum, actualCount),
      avgPredictedScore: avgScore(predictedSum, predictedCount),
      fmAverageCSATScore: avgScore(fmActualSum, fmActualCount),
      fmAvgPredictedScore: avgScore(fmPredictedSum, fmPredictedCount),
      cmAverageCSATScore: avgScore(cmActualSum, cmActualCount),
      cmAvgPredictedScore: avgScore(cmPredictedSum, cmPredictedCount),
      saAverageCSATScore: avgScore(saActualSum, saActualCount),
      saAvgPredictedScore: avgScore(saPredictedSum, saPredictedCount)
    };
  }, [showBuWise, excelData, csatCycleStartDateFormatted]);

  // Org level grand total row for BU-wise view (sum of all columns; score averages from Sheet2 when BU-wise)
  const orgLevelRow = useMemo(() => {
    if (!showBuWise || !filteredData || filteredData.length === 0) return null;
    const totalPolled = filteredData.reduce((s, r) => s + (r.cssSentCount || 0), 0);
    const totalResponded = filteredData.reduce((s, r) => s + (r.cssReceivedCount || 0), 0);
    const totalFmPolled = filteredData.reduce((s, r) => s + (r.fmPolled || 0), 0);
    const totalFmResponded = filteredData.reduce((s, r) => s + (r.fmResponded || 0), 0);
    const totalCmPolled = filteredData.reduce((s, r) => s + (r.cmPolled || 0), 0);
    const totalCmResponded = filteredData.reduce((s, r) => s + (r.cmResponded || 0), 0);
    const totalSaPolled = filteredData.reduce((s, r) => s + (r.saPolled || 0), 0);
    const totalSaResponded = filteredData.reduce((s, r) => s + (r.saResponded || 0), 0);
    const scores = orgLevelScoresBuWise;
    return {
      sNo: '',
      businessUnit: 'Org level',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      averageCSATScore: scores ? scores.averageCSATScore : null,
      avgPredictedScore: scores ? scores.avgPredictedScore : null,
      // Scan every BU row for the first real (non-empty) YEAR - QUARTER value instead of
      // trusting only filteredData[0] or the acsatCycle context — acsatCycle can be stale
      // relative to the currently fetched period (e.g. showing the default "last completed"
      // half-year instead of whatever period was actually selected/fetched), while the BU
      // rows' yearQuarter values come from the real report data and are already known-correct
      // (this is exactly what's displayed for every individual BU row on screen).
      yearQuarter: filteredData.map(r => r.yearQuarter).find(Boolean) || acsatCycle || '',
      responseRate: responseRateOneDecimal(totalResponded, totalPolled),
      fmPolled: totalFmPolled,
      fmResponded: totalFmResponded,
      fmResponseRate: responseRateOneDecimal(totalFmResponded, totalFmPolled),
      fmAverageCSATScore: scores ? scores.fmAverageCSATScore : null,
      fmAvgPredictedScore: scores ? scores.fmAvgPredictedScore : null,
      cmPolled: totalCmPolled,
      cmResponded: totalCmResponded,
      cmResponseRate: responseRateOneDecimal(totalCmResponded, totalCmPolled),
      cmAverageCSATScore: scores ? scores.cmAverageCSATScore : null,
      cmAvgPredictedScore: scores ? scores.cmAvgPredictedScore : null,
      saPolled: totalSaPolled,
      saResponded: totalSaResponded,
      saResponseRate: responseRateOneDecimal(totalSaResponded, totalSaPolled),
      saAverageCSATScore: scores ? scores.saAverageCSATScore : null,
      saAvgPredictedScore: scores ? scores.saAvgPredictedScore : null,
      isOrgLevel: true
    };
  }, [showBuWise, filteredData, orgLevelScoresBuWise, acsatCycle]);

  // Chart data: Org level Response Rate % comparison (Dashboard vs Trend)
  // YEAR - QUARTER: same as Account/BU wise Response Rate Dashboard (BU-wise) and BU-wise Response Rate % chart
  const orgLevelResponseRateComparisonChartData = useMemo(() => {
    if (!showBuWise || !orgLevelRow || !trendDataProcessed?.length) return [];
    const firstTrend = [...trendDataProcessed].reverse().find(f => f.hasData);
    if (!firstTrend?.orgLevelRow) return [];
    const dashRate = orgLevelRow.responseRate != null ? parseFloat(orgLevelRow.responseRate) : null;
    const trendRate = firstTrend.orgLevelRow?.responseRatePct;
    const yearQuarterDashboard = orgLevelRow.yearQuarter || filteredData?.[0]?.yearQuarter || acsatCycle || '';
    const yearQuarterTrend = firstTrend.rows?.[0]?.yearQuarter || firstTrend.orgLevelRow?.yearQuarter || acsatCycle || '';
    const data = [];
    if (trendRate != null && !isNaN(trendRate)) {
      data.push({
        name: 'Trend Analysis (from uploaded data)',
        value: Math.round(trendRate * 10) / 10,
        yearQuarter: yearQuarterTrend
      });
    }
    if (dashRate != null && !isNaN(dashRate)) {
      data.push({
        name: 'Account/BU wise Dashboard',
        value: Math.round(dashRate * 10) / 10,
        yearQuarter: yearQuarterDashboard
      });
    }
    return data;
  }, [showBuWise, orgLevelRow, trendDataProcessed, filteredData, acsatCycle]);

  // Chart data: Org level Average CSAT Score comparison (Dashboard vs Trend)
  // YEAR - QUARTER: same as Account/BU wise Response Rate Dashboard (BU-wise) and BU-wise Average CSAT Score chart
  const orgLevelAvgCSATScoreComparisonChartData = useMemo(() => {
    if (!showBuWise || !orgLevelRow || !trendDataProcessed?.length) return [];
    const firstTrend = [...trendDataProcessed].reverse().find(f => f.hasData);
    if (!firstTrend?.orgLevelRow) return [];
    const dashScore = orgLevelRow.averageCSATScore != null ? parseFloat(orgLevelRow.averageCSATScore) : null;
    const trendScore = firstTrend.orgLevelRow?.avgCSATScore;
    const yearQuarterDashboard = orgLevelRow.yearQuarter || filteredData?.[0]?.yearQuarter || acsatCycle || '';
    const yearQuarterTrend = firstTrend.rows?.[0]?.yearQuarter || firstTrend.orgLevelRow?.yearQuarter || acsatCycle || '';
    const data = [];
    if (trendScore != null && !isNaN(trendScore)) {
      data.push({
        name: 'Trend Analysis (from uploaded data)',
        value: Math.round(trendScore * 100) / 100,
        yearQuarter: yearQuarterTrend
      });
    }
    if (dashScore != null && !isNaN(dashScore)) {
      data.push({
        name: 'Account/BU wise Dashboard',
        value: Math.round(dashScore * 100) / 100,
        yearQuarter: yearQuarterDashboard
      });
    }
    return data;
  }, [showBuWise, orgLevelRow, trendDataProcessed, filteredData, acsatCycle]);

  // Combined chart data: Org level Response Rate % + Average CSAT Score (bars + line, by YEAR - QUARTER)
  const orgLevelResponseRateWithAvgCSATChartData = useMemo(() => {
    if (orgLevelResponseRateComparisonChartData.length === 0) return [];
    return orgLevelResponseRateComparisonChartData.map((rrItem) => {
      const csatItem = orgLevelAvgCSATScoreComparisonChartData.find((c) => c.name === rrItem.name);
      return {
        ...rrItem,
        avgCSATScore: csatItem?.value ?? null
      };
    });
  }, [orgLevelResponseRateComparisonChartData, orgLevelAvgCSATScoreComparisonChartData]);

  // Top 10 Accounts row score averages (Top 10 Account-wise view):
  // Avg(ACTUAL SCORE) and Avg(PREDICTED SCORE) computed by grouping rows by CUSTOMER_ID/CUST_ID first,
  // then taking the mean of per-customer averages (so each Top 10 customer has equal weight).
  // Sections (Fully Managed / Co-Managed / Staff Augmentation) are additionally filtered by ENGAGEMENT TYPE.
  const top10AccountsScoresTop10View = useMemo(() => {
    if (!showTop10 || showBuWise || !excelData?.secondSheetData?.length) return null;
    const data = excelData.secondSheetData;
    const firstRow = data[0] || {};

    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE)
      ? COL_SENT_DATE
      : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);

    const typeOfAccountCol = Object.prototype.hasOwnProperty.call(firstRow, COL_TYPE_OF_ACCOUNT) ? COL_TYPE_OF_ACCOUNT : 'Top 10';
    const engagementTypeKey =
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype') ||
      COL_ENGAGEMENT_TYPE;

    const predictedScoreCol =
      Object.keys(firstRow).find(k => k && (String(k).trim() === 'PREDICTED SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'predictedscore')) ||
      'PREDICTED SCORE';
    const actualScoreCol =
      Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) ||
      'ACTUAL SCORE';

    const parseScore = (row, col) => {
      const val = row[col];
      if (val == null || val === '' || val === 'N/A') return null;
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };
    const avgScore = (sum, count) => (count > 0 ? Math.round((sum / count) * 100) / 100 : null);

    const isTop10Account = (row) => {
      const val = (row[typeOfAccountCol] ?? row['Top 10'] ?? '').toString().trim();
      if (typeOfAccountCol === COL_TYPE_OF_ACCOUNT) return val.toLowerCase() === 'top 10';
      return val.toUpperCase() === 'Y';
    };
    const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
    const isFullyManaged = (et) => norm(et) === 'fully managed';
    const isCoManaged = (et) => norm(et) === 'co managed';
    const isStaffAugmentation = (et) => norm(et) === 'staff augmentation';

    // Row-level sums/counts: Avg(ACTUAL SCORE) and Avg(PREDICTED SCORE) over all rows where TYPE OF ACCOUNT = "Top 10" and sent date in range
    let actualSum = 0, actualCount = 0, predictedSum = 0, predictedCount = 0;
    let fmActualSum = 0, fmActualCount = 0, fmPredictedSum = 0, fmPredictedCount = 0;
    let cmActualSum = 0, cmActualCount = 0, cmPredictedSum = 0, cmPredictedCount = 0;
    let saActualSum = 0, saActualCount = 0, saPredictedSum = 0, saPredictedCount = 0;

    data.forEach(row => {
      if (!isTop10Account(row)) return;

      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal === undefined || sentVal === null || sentVal === '' || sentVal === 'N/A') return;
      const sentDateFormatted = parseExcelDateToMMDDYYYY(sentVal);
      if (!sentDateFormatted || (csatCycleStartDateFormatted && !isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) return;

      const pred = parseScore(row, predictedScoreCol);
      const act = parseScore(row, actualScoreCol);

      if (act != null) { actualSum += act; actualCount += 1; }
      if (pred != null) { predictedSum += pred; predictedCount += 1; }

      const engagementTypeRaw = row[engagementTypeKey];
      const engagementType = (engagementTypeRaw != null && engagementTypeRaw !== '') ? String(engagementTypeRaw).trim() : '';
      if (isFullyManaged(engagementType)) {
        if (act != null) { fmActualSum += act; fmActualCount += 1; }
        if (pred != null) { fmPredictedSum += pred; fmPredictedCount += 1; }
      } else if (isCoManaged(engagementType)) {
        if (act != null) { cmActualSum += act; cmActualCount += 1; }
        if (pred != null) { cmPredictedSum += pred; cmPredictedCount += 1; }
      } else if (isStaffAugmentation(engagementType)) {
        if (act != null) { saActualSum += act; saActualCount += 1; }
        if (pred != null) { saPredictedSum += pred; saPredictedCount += 1; }
      }
    });

    return {
      averageCSATScore: avgScore(actualSum, actualCount),       // Avg(ACTUAL SCORE) where TYPE OF ACCOUNT = "Top 10"
      avgPredictedScore: avgScore(predictedSum, predictedCount), // Avg(PREDICTED SCORE) where TYPE OF ACCOUNT = "Top 10"
      fmAverageCSATScore: avgScore(fmActualSum, fmActualCount),
      fmAvgPredictedScore: avgScore(fmPredictedSum, fmPredictedCount),
      cmAverageCSATScore: avgScore(cmActualSum, cmActualCount),
      cmAvgPredictedScore: avgScore(cmPredictedSum, cmPredictedCount),
      saAverageCSATScore: avgScore(saActualSum, saActualCount),
      saAvgPredictedScore: avgScore(saPredictedSum, saPredictedCount),
    };
  }, [showTop10, showBuWise, excelData, csatCycleStartDateFormatted]);

  // Top 10 Accounts grand total row for Top 10 response rate view (sum of columns where TYPE OF ACCOUNT = "Top 10" only, exclude Other Account)
  const top10GrandTotalRow = useMemo(() => {
    if (!showTop10 || showBuWise || !filteredData || filteredData.length === 0) return null;
    const top10OnlyRows = filteredData.filter(r => r.customerId !== 'OTHER');
    const totalPolled = top10OnlyRows.reduce((s, r) => s + (r.cssSentCount || 0), 0);
    const totalResponded = top10OnlyRows.reduce((s, r) => s + (r.cssReceivedCount || 0), 0);
    const totalFmPolled = top10OnlyRows.reduce((s, r) => s + (r.fmPolled || 0), 0);
    const totalFmResponded = top10OnlyRows.reduce((s, r) => s + (r.fmResponded || 0), 0);
    const totalCmPolled = top10OnlyRows.reduce((s, r) => s + (r.cmPolled || 0), 0);
    const totalCmResponded = top10OnlyRows.reduce((s, r) => s + (r.cmResponded || 0), 0);
    const totalSaPolled = top10OnlyRows.reduce((s, r) => s + (r.saPolled || 0), 0);
    const totalSaResponded = top10OnlyRows.reduce((s, r) => s + (r.saResponded || 0), 0);
    const scores = top10AccountsScoresTop10View;
    return {
      sNo: '',
      customerName: 'Top 10 Accounts',
      businessUnit: '',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      averageCSATScore: scores ? scores.averageCSATScore : null,
      avgPredictedScore: scores ? scores.avgPredictedScore : null,
      responseRate: responseRateOneDecimal(totalResponded, totalPolled),
      fmPolled: totalFmPolled,
      fmResponded: totalFmResponded,
      fmResponseRate: responseRateOneDecimal(totalFmResponded, totalFmPolled),
      fmAverageCSATScore: scores ? scores.fmAverageCSATScore : null,
      fmAvgPredictedScore: scores ? scores.fmAvgPredictedScore : null,
      cmPolled: totalCmPolled,
      cmResponded: totalCmResponded,
      cmResponseRate: responseRateOneDecimal(totalCmResponded, totalCmPolled),
      cmAverageCSATScore: scores ? scores.cmAverageCSATScore : null,
      cmAvgPredictedScore: scores ? scores.cmAvgPredictedScore : null,
      saPolled: totalSaPolled,
      saResponded: totalSaResponded,
      saResponseRate: responseRateOneDecimal(totalSaResponded, totalSaPolled),
      saAverageCSATScore: scores ? scores.saAverageCSATScore : null,
      saAvgPredictedScore: scores ? scores.saAvgPredictedScore : null,
      isTop10GrandTotal: true
    };
  }, [showTop10, showBuWise, filteredData, top10AccountsScoresTop10View]);

  // Overall row score averages for Top 10 Account-wise view: from Sheet2 "CSAT sent and received Report"
  // Main: Avg(ACTUAL SCORE), Avg(PREDICTED SCORE); sections: same filtered by ENGAGEMENT TYPE
  const overallRowScoresTop10 = useMemo(() => {
    if (!showTop10 || showBuWise || !excelData?.secondSheetData?.length) return null;
    const data = excelData.secondSheetData;
    const firstRow = data[0] || {};
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const engagementTypeKey = Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype') || COL_ENGAGEMENT_TYPE;
    const predictedScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'PREDICTED SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'predictedscore')) || 'PREDICTED SCORE';
    const actualScoreCol = Object.keys(firstRow).find(k => k && (String(k).trim() === 'ACTUAL SCORE' || String(k).toLowerCase().replace(/\s/g, '') === 'actualscore')) || 'ACTUAL SCORE';
    const parseScore = (row, col) => {
      const val = row[col];
      if (val == null || val === '' || val === 'N/A') return null;
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    };
    const avgScore = (sum, count) => (count > 0 ? Math.round((sum / count) * 100) / 100 : null);
    const norm = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
    const isFullyManaged = (et) => norm(et) === 'fully managed';
    const isCoManaged = (et) => norm(et) === 'co managed';
    const isStaffAugmentation = (et) => norm(et) === 'staff augmentation';

    let actualSum = 0, actualCount = 0, predictedSum = 0, predictedCount = 0;
    let fmActualSum = 0, fmActualCount = 0, fmPredictedSum = 0, fmPredictedCount = 0;
    let cmActualSum = 0, cmActualCount = 0, cmPredictedSum = 0, cmPredictedCount = 0;
    let saActualSum = 0, saActualCount = 0, saPredictedSum = 0, saPredictedCount = 0;

    data.forEach(row => {
      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      if (sentVal === undefined || sentVal === null || sentVal === '' || sentVal === 'N/A') return;
      const sentDateFormatted = parseExcelDateToMMDDYYYY(sentVal);
      if (!sentDateFormatted || (csatCycleStartDateFormatted && !isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) return;

      const pred = parseScore(row, predictedScoreCol);
      const act = parseScore(row, actualScoreCol);
      if (act != null) { actualSum += act; actualCount += 1; }
      if (pred != null) { predictedSum += pred; predictedCount += 1; }

      const engagementTypeRaw = row[engagementTypeKey];
      const engagementType = (engagementTypeRaw != null && engagementTypeRaw !== '') ? String(engagementTypeRaw).trim() : '';
      if (isFullyManaged(engagementType)) {
        if (act != null) { fmActualSum += act; fmActualCount += 1; }
        if (pred != null) { fmPredictedSum += pred; fmPredictedCount += 1; }
      } else if (isCoManaged(engagementType)) {
        if (act != null) { cmActualSum += act; cmActualCount += 1; }
        if (pred != null) { cmPredictedSum += pred; cmPredictedCount += 1; }
      } else if (isStaffAugmentation(engagementType)) {
        if (act != null) { saActualSum += act; saActualCount += 1; }
        if (pred != null) { saPredictedSum += pred; saPredictedCount += 1; }
      }
    });

    return {
      averageCSATScore: avgScore(actualSum, actualCount),
      avgPredictedScore: avgScore(predictedSum, predictedCount),
      fmAverageCSATScore: avgScore(fmActualSum, fmActualCount),
      fmAvgPredictedScore: avgScore(fmPredictedSum, fmPredictedCount),
      cmAverageCSATScore: avgScore(cmActualSum, cmActualCount),
      cmAvgPredictedScore: avgScore(cmPredictedSum, cmPredictedCount),
      saAverageCSATScore: avgScore(saActualSum, saActualCount),
      saAvgPredictedScore: avgScore(saPredictedSum, saPredictedCount)
    };
  }, [showTop10, showBuWise, excelData, csatCycleStartDateFormatted]);

  // Overall row for Top 10 view: grand total from entire Sheet2 "CSAT sent and received Report"
  // Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE), Response % = Responded/Polled*100 (date >= csatCycleStartDateFormatted)
  const overallRow = useMemo(() => {
    if (!showTop10 || showBuWise || !excelData?.secondSheetData?.length) return null;
    const data = excelData.secondSheetData;
    const firstRow = data[0] || {};
    const sentDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_SENT_DATE) ? COL_SENT_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_SENT_DATE') ? 'CSS_SENT_DATE' : COL_SENT_DATE);
    const receivedDateCol = Object.prototype.hasOwnProperty.call(firstRow, COL_RECEIVED_DATE) ? COL_RECEIVED_DATE : (Object.prototype.hasOwnProperty.call(firstRow, 'CSS_RECEIVED_DATE') ? 'CSS_RECEIVED_DATE' : COL_RECEIVED_DATE);
    const engagementTypeKey = Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') || Object.keys(firstRow).find(k => k && String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype') || COL_ENGAGEMENT_TYPE;

    let totalPolled = 0;
    let totalResponded = 0;
    let fmPolled = 0;
    let fmResponded = 0;
    let cmPolled = 0;
    let cmResponded = 0;
    let saPolled = 0;
    let saResponded = 0;

    data.forEach(row => {
      const sentVal = row[sentDateCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
      const receivedVal = row[receivedDateCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
      const sentFormatted = sentVal ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
      const sentValid = sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted));
      const receivedValid = receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted));
      if (sentValid) totalPolled++;
      if (receivedValid) totalResponded++;

      const engagementType = (row[engagementTypeKey] || '').toString().trim().toLowerCase();
      if (engagementType === 'fully managed') {
        if (sentValid) fmPolled++;
        if (receivedValid) fmResponded++;
      } else if (engagementType === 'co-managed') {
        if (sentValid) cmPolled++;
        if (receivedValid) cmResponded++;
      } else if (engagementType === 'staff augmentation') {
        if (sentValid) saPolled++;
        if (receivedValid) saResponded++;
      }
    });

    const scores = overallRowScoresTop10;
    return {
      sNo: '',
      customerName: 'Overall',
      businessUnit: '',
      cssSentCount: totalPolled,
      cssReceivedCount: totalResponded,
      averageCSATScore: scores ? scores.averageCSATScore : null,
      avgPredictedScore: scores ? scores.avgPredictedScore : null,
      responseRate: responseRateOneDecimal(totalResponded, totalPolled),
      fmPolled,
      fmResponded,
      fmResponseRate: responseRateOneDecimal(fmResponded, fmPolled),
      fmAverageCSATScore: scores ? scores.fmAverageCSATScore : null,
      fmAvgPredictedScore: scores ? scores.fmAvgPredictedScore : null,
      cmPolled,
      cmResponded,
      cmResponseRate: responseRateOneDecimal(cmResponded, cmPolled),
      cmAverageCSATScore: scores ? scores.cmAverageCSATScore : null,
      cmAvgPredictedScore: scores ? scores.cmAvgPredictedScore : null,
      saPolled,
      saResponded,
      saResponseRate: responseRateOneDecimal(saResponded, saPolled),
      saAverageCSATScore: scores ? scores.saAverageCSATScore : null,
      saAvgPredictedScore: scores ? scores.saAvgPredictedScore : null,
      isOverall: true
    };
  }, [showTop10, showBuWise, excelData, csatCycleStartDateFormatted, overallRowScoresTop10]);

  // Chart data processing
  const barChartData = useMemo(() => {
    console.log('Processing bar chart data:', { filteredData, isArray: Array.isArray(filteredData), length: filteredData?.length });
    if (!filteredData || !Array.isArray(filteredData) || filteredData.length === 0) {
      console.log('No data for bar chart, using sample data');
      // Return sample data for testing
      return [
        { name: 'Sample Customer 1', fullName: 'Sample Customer 1', responseRate: 85, sent: 100, received: 85 },
        { name: 'Sample Customer 2', fullName: 'Sample Customer 2', responseRate: 72, sent: 50, received: 36 },
        { name: 'Sample Customer 3', fullName: 'Sample Customer 3', responseRate: 95, sent: 80, received: 76 }
      ];
    }
    
    const chartData = filteredData.slice(0, 20).map(item => ({
      name: item.customerName && item.customerName.length > 15 ? item.customerName.substring(0, 15) + '...' : item.customerName || 'Unknown',
      fullName: item.customerName || 'Unknown',
      responseRate: item.responseRate || 0,
      sent: item.cssSentCount || 0,
      received: item.cssReceivedCount || 0
    }));
    
    console.log('Bar chart data processed:', chartData);
    return chartData;
  }, [filteredData]);

  const donutChartData = useMemo(() => {
    console.log('Processing donut chart data:', { 
      processedData, 
      data: processedData?.data, 
      isArray: Array.isArray(processedData?.data), 
      length: processedData?.data?.length,
      showBuWise,
      showTop10
    });
    
    // Only process data when in BU-wise view
    if (!showBuWise || !processedData || !processedData.data || !Array.isArray(processedData.data) || processedData.data.length === 0) {
      console.log('No BU-wise data for donut chart, using sample data');
      return [
        { name: 'India & UK', responseRate: 78, sent: 200, received: 156 },
        { name: 'US', responseRate: 65, sent: 150, received: 98 },
        { name: 'Europe', responseRate: 82, sent: 100, received: 82 },
        { name: 'Asia Pacific', responseRate: 71, sent: 120, received: 85 },
        { name: 'Middle East', responseRate: 89, sent: 90, received: 80 }
      ];
    }
    
    // Process actual BU-wise data; display "Health care" as "Healthcare"
    const buData = {};
    processedData.data.forEach(item => {
      const bu = item.businessUnit || 'Unknown';
      const buKey = normalizeBusinessUnitDisplay(bu);
      if (!buData[buKey]) {
        buData[buKey] = {
          name: buKey,
          responseRate: 0,
          sent: 0,
          received: 0,
          count: 0
        };
      }
      buData[buKey].responseRate += item.responseRate || 0;
      buData[buKey].sent += item.cssSentCount || 0;
      buData[buKey].received += item.cssReceivedCount || 0;
      buData[buKey].count += 1;
    });

    const chartData = Object.values(buData).map(item => ({
      name: item.name,
      responseRate: Math.round((item.responseRate / item.count) * 10) / 10,
      sent: item.sent,
      received: item.received
    }));
    
    console.log('Donut chart data processed from BU-wise data:', chartData);
    return chartData;
  }, [processedData, showBuWise, showTop10]);

  // Chart download functions
  const downloadChart = (chartType) => {
    console.log(`Downloading ${chartType} chart...`);
    
    try {
      // Find the chart container
      const chartContainer = document.querySelector(`#${chartType}-chart`);
      if (!chartContainer) {
        console.error(`Chart container #${chartType}-chart not found`);
        alert(`Chart container not found. Please try again.`);
        return;
      }

      // For donut chart, we need to capture the entire container including the legend
      if (chartType === 'donut') {
        // Use html2canvas to capture the entire chart container including legend
        import('html2canvas').then(html2canvas => {
          // Wait a bit for the chart to fully render
          setTimeout(() => {
            html2canvas.default(chartContainer, {
              backgroundColor: '#ffffff',
              scale: 2,
              useCORS: true,
              allowTaint: true,
              width: chartContainer.offsetWidth,
              height: chartContainer.offsetHeight,
              logging: false,
              onclone: (clonedDoc) => {
                // Ensure the legend is visible in the cloned document
                const clonedContainer = clonedDoc.querySelector(`#${chartType}-chart`);
                if (clonedContainer) {
                  // Make sure the custom color legend is visible
                  const legend = clonedContainer.querySelector('div[style*="display: flex"]');
                  if (legend) {
                    legend.style.display = 'flex';
                    legend.style.visibility = 'visible';
                    legend.style.opacity = '1';
                    legend.style.backgroundColor = '#f8fafc';
                    legend.style.border = '1px solid #e2e8f0';
                    legend.style.borderRadius = '8px';
                    legend.style.padding = '1rem';
                  }
                  
                  // Ensure all text elements are visible
                  const textElements = clonedContainer.querySelectorAll('text, span');
                  textElements.forEach(text => {
                    text.style.visibility = 'visible';
                    text.style.display = 'block';
                    text.style.opacity = '1';
                  });
                  
                  // Ensure SVG elements are visible
                  const svgElements = clonedContainer.querySelectorAll('svg');
                  svgElements.forEach(svg => {
                    svg.style.visibility = 'visible';
                    svg.style.display = 'block';
                  });
                }
              }
            }).then(canvas => {
              // Create download link
              const link = document.createElement('a');
              link.download = `${chartType}-chart-${new Date().toISOString().split('T')[0]}.png`;
              link.href = canvas.toDataURL('image/png');
              link.click();
              console.log(`${chartType} chart with legend downloaded successfully`);
            }).catch(error => {
              console.error(`Error capturing ${chartType} chart:`, error);
              alert(`Error capturing chart: ${error.message}`);
            });
          }, 1000); // Wait 1 second for chart to render
        }).catch(error => {
          console.error(`Error loading html2canvas:`, error);
          alert(`Error loading chart capture library: ${error.message}`);
        });
        return;
      }

      // For bar chart, also use html2canvas to capture labels
      import('html2canvas').then(html2canvas => {
        html2canvas.default(chartContainer, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true,
          allowTaint: true,
          width: chartContainer.offsetWidth,
          height: chartContainer.offsetHeight
        }).then(canvas => {
          // Create download link
          const link = document.createElement('a');
          link.download = `${chartType}-chart-${new Date().toISOString().split('T')[0]}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          console.log(`${chartType} chart with labels downloaded successfully`);
        }).catch(error => {
          console.error(`Error capturing ${chartType} chart:`, error);
          alert(`Error capturing chart: ${error.message}`);
        });
      }).catch(error => {
        console.error(`Error loading html2canvas:`, error);
        alert(`Error loading chart capture library: ${error.message}`);
      });
      
    } catch (error) {
      console.error(`Error downloading ${chartType} chart:`, error);
      alert(`Error downloading chart: ${error.message}`);
    }
  };

  // Download Practice wise Response Rate (Sheet2 "CSAT sent and received Report", group by Practice)
  const downloadPracticeWiseData = async () => {
    if (!practiceWiseTableDataWithTrend || practiceWiseTableDataWithTrend.length === 0) {
      alert('No practice data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Response Rate');
      const cellBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      const trendHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
      // Row 1: blank for Sr. No./Practice (avoid duplicate text), merged "H2 2025" (cols 3-6), merged "Trend analysis (H2 Vs H1)" (cols 7-8)
      const row1Cells = ['', '', (acsatCycle || 'H2 2025'), trendHeaderLabel];
      const headerRow1 = worksheet.addRow(row1Cells);
      const row1 = worksheet.getRow(1);
      row1.eachCell(c => { c.fill = c.col <= 6 ? headerFill : trendHeaderFill; c.font = { bold: true, color: { argb: c.col <= 6 ? 'FFFFFFFF' : 'FF000000' } }; c.border = cellBorder; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      worksheet.mergeCells(1, 3, 1, 6); // C1:F1 = "H2 2025"
      row1.getCell(3).value = (acsatCycle || 'H2 2025');
      row1.getCell(3).fill = headerFill;
      row1.getCell(3).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      row1.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(1, 7, 1, 8); // G1:H1 = "Trend analysis (H2 Vs H1)"
      row1.getCell(7).value = trendHeaderLabel;
      row1.getCell(7).fill = trendHeaderFill;
      row1.getCell(7).font = { bold: true, color: { argb: 'FF000000' } };
      row1.getCell(7).alignment = { horizontal: 'center', vertical: 'middle' };
      row1.getCell(7).border = cellBorder;
      // Row 2: sub-headers #Polled, #Responded, Response Rate %, Average CSAT Score, Response Rate Trend, Average CSAT Score Trend
      const row2Cells = ['Sr. No.', 'Practice', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score', 'Response Rate Trend', 'Average CSAT Score Trend'];
      const headerRow2 = worksheet.addRow(row2Cells);
      headerRow2.eachCell(c => { c.fill = c.col <= 6 ? headerFill : trendHeaderFill; c.font = { bold: true, color: { argb: c.col <= 6 ? 'FFFFFFFF' : 'FF000000' } }; c.border = cellBorder; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      const excelResponseRateFill = (pct, noResp) => {
        if (noResp) return null;
        if (pct >= 75) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (pct >= 50) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      const excelAvgCSATFill = (score, noResp) => {
        if (noResp || score == null) return null;
        const n = Number(score);
        if (isNaN(n)) return null;
        if (n >= 4.5) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (n >= 4) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      practiceWiseTableDataWithTrend.forEach(row => {
        const responseRateDisplay = row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-';
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const rrDiff = row.responseRateTrendDiff;
        const csatDiff = row.avgCSATTrendDiff;
        const rrTrendDisplay = rrDiff == null ? '-' : `(${rrDiff >= 0 ? '+' : ''}${Number(rrDiff).toFixed(1)}%) ${rrDiff > 0 ? '\u2191' : rrDiff < 0 ? '\u2193' : '\u2212'}`;
        const csatTrendDisplay = csatDiff == null ? '-' : `(${csatDiff >= 0 ? '+' : ''}${Number(csatDiff).toFixed(2)}) ${csatDiff > 0 ? '\u2191' : csatDiff < 0 ? '\u2193' : '\u2212'}`;
        const excelRow = worksheet.addRow([row.srNo, row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay, rrTrendDisplay, csatTrendDisplay]);
        excelRow.eachCell(c => { c.border = cellBorder; c.alignment = { horizontal: c.col === 1 || c.col === 2 ? 'left' : 'center', vertical: 'middle' }; });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(5)) { excelRow.getCell(5).fill = rrFill; excelRow.getCell(5).font = { color: { argb: row.responseRatePct >= 50 ? 'FF000000' : 'FFFFFFFF' } }; }
        if (csatFill && excelRow.getCell(6)) { excelRow.getCell(6).fill = csatFill; excelRow.getCell(6).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' } }; }
        const rrTrendColor = rrDiff != null && rrDiff > 0 ? 'FF16a34a' : rrDiff != null && rrDiff < 0 ? 'FFdc2626' : null;
        const csatTrendColor = csatDiff != null && csatDiff > 0 ? 'FF16a34a' : csatDiff != null && csatDiff < 0 ? 'FFdc2626' : null;
        if (rrTrendColor && excelRow.getCell(7)) excelRow.getCell(7).font = { color: { argb: rrTrendColor } };
        if (csatTrendColor && excelRow.getCell(8)) excelRow.getCell(8).font = { color: { argb: csatTrendColor } };
      });
      if (practiceWiseOrgRowWithTrend) {
        const row = practiceWiseOrgRowWithTrend;
        const responseRateDisplay = row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-';
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const rrDiff = row.responseRateTrendDiff;
        const csatDiff = row.avgCSATTrendDiff;
        const rrTrendDisplay = rrDiff == null ? '-' : `(${rrDiff >= 0 ? '+' : ''}${Number(rrDiff).toFixed(1)}%) ${rrDiff > 0 ? '\u2191' : rrDiff < 0 ? '\u2193' : '\u2212'}`;
        const csatTrendDisplay = csatDiff == null ? '-' : `(${csatDiff >= 0 ? '+' : ''}${Number(csatDiff).toFixed(2)}) ${csatDiff > 0 ? '\u2191' : csatDiff < 0 ? '\u2193' : '\u2212'}`;
        const excelRow = worksheet.addRow(['', row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay, rrTrendDisplay, csatTrendDisplay]);
        excelRow.eachCell(c => { c.border = cellBorder; c.alignment = { horizontal: c.col === 1 || c.col === 2 ? 'left' : 'center', vertical: 'middle' }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; c.font = { bold: true }; });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(5)) { excelRow.getCell(5).fill = rrFill; excelRow.getCell(5).font = { color: { argb: row.responseRatePct >= 50 ? 'FF000000' : 'FFFFFFFF' }, bold: true }; }
        if (csatFill && excelRow.getCell(6)) { excelRow.getCell(6).fill = csatFill; excelRow.getCell(6).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' }, bold: true }; }
        const rrTrendColor = rrDiff != null && rrDiff > 0 ? 'FF16a34a' : rrDiff != null && rrDiff < 0 ? 'FFdc2626' : null;
        const csatTrendColor = csatDiff != null && csatDiff > 0 ? 'FF16a34a' : csatDiff != null && csatDiff < 0 ? 'FFdc2626' : null;
        if (rrTrendColor && excelRow.getCell(7)) excelRow.getCell(7).font = { color: { argb: rrTrendColor }, bold: true };
        if (csatTrendColor && excelRow.getCell(8)) excelRow.getCell(8).font = { color: { argb: csatTrendColor }, bold: true };
      }
      worksheet.addRow([]);
      const r1 = worksheet.addRow(['Legend']); r1.getCell(1).font = { bold: true, size: 11 };
      const r2 = worksheet.addRow(['Response Rate %']); r2.getCell(1).font = { bold: true };
      const r3 = worksheet.addRow(['Red: <50%']); r3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; r3.getCell(1).font = { color: { argb: 'FFFFFFFF' } };
      const r4 = worksheet.addRow(['Orange: 50% to 74%']); r4.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      const r5 = worksheet.addRow(['Light Green: ≥75%']); r5.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
      const r6 = worksheet.addRow(['Response Rate % = #Responded ÷ #Polled × 100']); r6.getCell(1).font = { italic: true };
      const r7 = worksheet.addRow(['Average CSAT Score']); r7.getCell(1).font = { bold: true };
      const r8 = worksheet.addRow(['Red: <4']); r8.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; r8.getCell(1).font = { color: { argb: 'FFFFFFFF' } };
      const r9 = worksheet.addRow(['Orange: 4 to 4.49']); r9.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      const r10 = worksheet.addRow(['Light Green: ≥4.5']); r10.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 28 : (i === 0 ? 10 : (i >= 6 ? 24 : 16)); });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Practice_wise_Response_Rate_Dashboard.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading practice data:', err);
      alert('Error downloading data. Please try again.');
    }
  };

  // Download second Practice dashboard (Trend-Analysis-H12025-Practice.xlsx)
  const downloadPracticeWiseDataSecond = async () => {
    if (!practiceWiseTableDataSecond || practiceWiseTableDataSecond.length === 0) {
      alert('No practice trend data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Response Rate - Trend');
      const cellBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const excelResponseRateFillSecond = (pct, noResp) => {
        if (noResp) return null;
        if (pct >= 75) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (pct >= 50) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      const excelAvgCSATFillSecond = (score, noResp) => {
        if (noResp || score == null) return null;
        const n = Number(score);
        if (isNaN(n)) return null;
        if (n >= 4.5) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (n >= 4) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      const headers = ['Sr. No.', 'Practice', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score'];
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.border = cellBorder; c.alignment = { horizontal: 'center', vertical: 'middle' }; });
      practiceWiseTableDataSecond.forEach(row => {
        const responseRateDisplay = row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-';
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow([row.srNo, row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => { c.border = cellBorder; c.alignment = { horizontal: c.col === 1 || c.col === 2 ? 'left' : 'center', vertical: 'middle' }; });
        const rrFill = excelResponseRateFillSecond(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFillSecond(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(5)) { excelRow.getCell(5).fill = rrFill; excelRow.getCell(5).font = { color: { argb: row.responseRatePct >= 50 ? 'FF000000' : 'FFFFFFFF' } }; }
        if (csatFill && excelRow.getCell(6)) { excelRow.getCell(6).fill = csatFill; excelRow.getCell(6).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' } }; }
      });
      if (practiceWiseSecondOrgRow) {
        const row = practiceWiseSecondOrgRow;
        const responseRateDisplay = row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-';
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow(['', row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => { c.border = cellBorder; c.alignment = { horizontal: c.col === 1 || c.col === 2 ? 'left' : 'center', vertical: 'middle' }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; c.font = { bold: true }; });
        const rrFill = excelResponseRateFillSecond(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFillSecond(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(5)) { excelRow.getCell(5).fill = rrFill; excelRow.getCell(5).font = { color: { argb: row.responseRatePct >= 50 ? 'FF000000' : 'FFFFFFFF' }, bold: true }; }
        if (csatFill && excelRow.getCell(6)) { excelRow.getCell(6).fill = csatFill; excelRow.getCell(6).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' }, bold: true }; }
      }
      worksheet.addRow([]);
      const s1 = worksheet.addRow(['Legend']); s1.getCell(1).font = { bold: true, size: 11 };
      const s2 = worksheet.addRow(['Response Rate %']); s2.getCell(1).font = { bold: true };
      const s3 = worksheet.addRow(['Red: <50%']); s3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; s3.getCell(1).font = { color: { argb: 'FFFFFFFF' } };
      const s4 = worksheet.addRow(['Orange: 50% to 74%']); s4.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      const s5 = worksheet.addRow(['Light Green: ≥75%']); s5.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
      const s6 = worksheet.addRow(['Response Rate % = #Responded ÷ #Polled × 100']); s6.getCell(1).font = { italic: true };
      const s7 = worksheet.addRow(['Average CSAT Score']); s7.getCell(1).font = { bold: true };
      const s8 = worksheet.addRow(['Red: <4']); s8.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; s8.getCell(1).font = { color: { argb: 'FFFFFFFF' } };
      const s9 = worksheet.addRow(['Orange: 4 to 4.49']); s9.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      const s10 = worksheet.addRow(['Light Green: ≥4.5']); s10.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
      worksheet.columns.forEach((col, i) => { col.width = i === 1 ? 28 : (i === 0 ? 10 : 16); });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Practice_wise_Response_Rate_Trend_Analysis.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading practice trend data:', err);
      alert('Error downloading data. Please try again.');
    }
  };

  // Download: Practice + Business Unit Response Rate table (requested)
  const downloadPracticeBuWiseData = async () => {
    if (!filteredPracticeBuWiseTableData || filteredPracticeBuWiseTableData.length === 0) {
      alert('No Practice + Business Unit data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice_BU_wise_Response_Rate');
      const cellBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };

      // Row 1: Sr. No., Practice, Business Unit, merged "H2 2025" (same header color as Business Unit)
      const row1 = worksheet.addRow(['Sr. No.', 'Practice', 'Business Unit', (acsatCycle || 'H2 2025')]);
      row1.eachCell(c => {
        c.fill = headerFill;
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.border = cellBorder;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      worksheet.mergeCells(1, 4, 1, 7);

      // Row 2: sub-headers under H2 2025 (#Polled, #Responded, Response Rate %, Average CSAT Score)
      const row2 = worksheet.addRow(['', '', '', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score']);
      row2.eachCell(c => {
        c.fill = headerFill;
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.border = cellBorder;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      const excelResponseRateFill = (pct, noResp) => {
        if (noResp) return null;
        if (pct >= 75) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (pct >= 50) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      const excelAvgCSATFill = (score, noResp) => {
        if (noResp || score == null) return null;
        const n = Number(score);
        if (isNaN(n)) return null;
        if (n >= 4.5) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (n >= 4) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };

      filteredPracticeBuWiseTableData.forEach(row => {
        const responseRateDisplay = row.responded === 0 ? '0.0%' : (row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-');
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow([row.srNo, row.practice, row.businessUnit, row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => {
          c.border = cellBorder;
          c.alignment = { horizontal: (c.col === 2 || c.col === 3) ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(6)) {
          excelRow.getCell(6).fill = rrFill;
          excelRow.getCell(6).font = { color: { argb: (row.responseRatePct != null && row.responseRatePct >= 50) ? 'FF000000' : 'FFFFFFFF' } };
        }
        if (csatFill && excelRow.getCell(7)) {
          excelRow.getCell(7).fill = csatFill;
          excelRow.getCell(7).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' } };
        }
      });

      if (practiceBuWiseOrgRow) {
        const row = practiceBuWiseOrgRow;
        const responseRateDisplay = row.responded === 0 ? '0.0%' : (row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-');
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow(['', row.practice, row.businessUnit ?? '', row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => {
          c.border = cellBorder;
          c.alignment = { horizontal: (c.col === 2 || c.col === 3) ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          c.font = { bold: true, color: { argb: 'FF000000' } };
        });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(6)) {
          excelRow.getCell(6).fill = rrFill;
          excelRow.getCell(6).font = { color: { argb: (row.responseRatePct != null && row.responseRatePct >= 50) ? 'FF000000' : 'FFFFFFFF' }, bold: true };
        }
        if (csatFill && excelRow.getCell(7)) {
          excelRow.getCell(7).fill = csatFill;
          excelRow.getCell(7).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' }, bold: true };
        }
      }

      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 10; // Sr. No.
        else if (i === 1) col.width = 28; // Practice
        else if (i === 2) col.width = 20; // Business Unit
        else col.width = 16;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Practice_BU_wise_Response_Rate_Dashboard.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Practice + BU data:', err);
      alert('Error downloading data. Please try again.');
    }
  };

  // Download: Business Unit + Practice Response Rate table (requested)
  const downloadBuPracticeWiseData = async () => {
    if (!filteredBuPracticeWiseTableData || filteredBuPracticeWiseTableData.length === 0) {
      alert('No Business Unit + Practice data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('BU_Practice_Response_Rate');
      const cellBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };

      // Row 1: Sr. No., Business Unit, Practice, merged "H2 2025" (same header color as Business Unit)
      const row1 = worksheet.addRow(['Sr. No.', 'Business Unit', 'Practice', (acsatCycle || 'H2 2025')]);
      row1.eachCell(c => {
        c.fill = headerFill;
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.border = cellBorder;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      worksheet.mergeCells(1, 4, 1, 7);

      // Row 2: sub-headers under H2 2025
      const row2 = worksheet.addRow(['', '', '', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score']);
      row2.eachCell(c => {
        c.fill = headerFill;
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.border = cellBorder;
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      const excelResponseRateFill = (pct, noResp) => {
        if (noResp) return null;
        if (pct >= 75) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (pct >= 50) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };
      const excelAvgCSATFill = (score, noResp) => {
        if (noResp || score == null) return null;
        const n = Number(score);
        if (isNaN(n)) return null;
        if (n >= 4.5) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFc6efce' } };
        if (n >= 4) return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        return { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      };

      filteredBuPracticeWiseTableData.forEach(row => {
        const responseRateDisplay = row.responded === 0 ? '0.0%' : (row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-');
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow([row.srNo, row.businessUnit, row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => {
          c.border = cellBorder;
          c.alignment = { horizontal: (c.col === 2 || c.col === 3) ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(6)) {
          excelRow.getCell(6).fill = rrFill;
          excelRow.getCell(6).font = { color: { argb: (row.responseRatePct != null && row.responseRatePct >= 50) ? 'FF000000' : 'FFFFFFFF' } };
        }
        if (csatFill && excelRow.getCell(7)) {
          excelRow.getCell(7).fill = csatFill;
          excelRow.getCell(7).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' } };
        }
      });

      if (buPracticeWiseOrgRow) {
        const row = buPracticeWiseOrgRow;
        const responseRateDisplay = row.responded === 0 ? '0.0%' : (row.responseRatePct != null ? `${formatResponseRateOneDecimal(row.responseRatePct)}%` : '-');
        const avgScoreDisplay = row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-';
        const excelRow = worksheet.addRow(['', row.businessUnit ?? '', row.practice, row.polled, row.responded, responseRateDisplay, avgScoreDisplay]);
        excelRow.eachCell(c => {
          c.border = cellBorder;
          c.alignment = { horizontal: (c.col === 2 || c.col === 3) ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          c.font = { bold: true, color: { argb: 'FF000000' } };
        });
        const rrFill = excelResponseRateFill(row.responseRatePct, row.responded === 0);
        const csatFill = excelAvgCSATFill(row.avgActualScore, row.responded === 0);
        if (rrFill && excelRow.getCell(6)) {
          excelRow.getCell(6).fill = rrFill;
          excelRow.getCell(6).font = { color: { argb: (row.responseRatePct != null && row.responseRatePct >= 50) ? 'FF000000' : 'FFFFFFFF' }, bold: true };
        }
        if (csatFill && excelRow.getCell(7)) {
          excelRow.getCell(7).fill = csatFill;
          excelRow.getCell(7).font = { color: { argb: (row.avgActualScore == null || row.avgActualScore >= 4) ? 'FF000000' : 'FFFFFFFF' }, bold: true };
        }
      }

      worksheet.columns.forEach((col, i) => {
        if (i === 0) col.width = 10; // Sr. No.
        else if (i === 1) col.width = 20; // Business Unit
        else if (i === 2) col.width = 28; // Practice
        else col.width = 16;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BU_Practice_wise_Response_Rate_Dashboard.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading BU + Practice data:', err);
      alert('Error downloading data. Please try again.');
    }
  };

  // Download function using ExcelJS for proper color coding.
  // CUSTOMER_ID excluded from Excel in all view modes (Show All Customers, Top 10 account, Show Account-wise View).
  const downloadData = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert('No data available for download');
      return;
    }

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Response Rate Data');
      // Black cell borders so they are visible in Excel (style-only borders can appear faint)
      const cellBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      
      // Get headers (exclude customerId and Non Staffing/Staffing columns - not displayed or exported)
      // Order columns so Response Rate% appears before Average CSAT Score (main and each section: FM, CM, SA)
      const rawKeys = Object.keys(filteredData[0]).filter(key => 
        key !== 'customerId' && key !== 'nonStaffingReceivedCount' && key !== 'staffingReceivedCount'
      );
      const preferredOrder = [
        'sNo', 'customerName', 'businessUnit', 'cssSentCount', 'cssReceivedCount',
        'responseRate', 'averageCSATScore', 'avgPredictedScore',
        'yearQuarter',
        'fmPolled', 'fmResponded', 'fmResponseRate', 'fmAverageCSATScore', 'fmAvgPredictedScore',
        'cmPolled', 'cmResponded', 'cmResponseRate', 'cmAverageCSATScore', 'cmAvgPredictedScore',
        'saPolled', 'saResponded', 'saResponseRate', 'saAverageCSATScore', 'saAvgPredictedScore'
      ];
      let headers = preferredOrder.filter(k => rawKeys.includes(k)).concat(rawKeys.filter(k => !preferredOrder.includes(k)));
      if (!showBuWise) {
        headers = headers.filter(h => h !== 'practice');
      }
      // BU-wise: ensure yearQuarter after avgPredictedScore (add if not present)
      if (showBuWise && !headers.includes('yearQuarter')) {
        const apIdx = headers.indexOf('avgPredictedScore');
        if (apIdx >= 0) {
          headers = [...headers.slice(0, apIdx + 1), 'yearQuarter', ...headers.slice(apIdx + 1)];
        }
      }
      // Insert trend columns after avgPredictedScore (or after yearQuarter if BU-wise) when BU-wise and trend section shown
      if (showBuWise && showTrendSection) {
        const insIdx = headers.indexOf('yearQuarter') >= 0 ? headers.indexOf('yearQuarter') + 1 : headers.indexOf('avgPredictedScore') + 1;
        if (insIdx >= 0) {
          headers = [...headers.slice(0, insIdx), 'trendResponseRate', 'trendAvgCSATScore', ...headers.slice(insIdx)];
        }
      }
      // Insert trend columns after avgPredictedScore when Top 10 and trend section shown
      if (showTop10 && !showBuWise && showTrendSection) {
        const insIdx = headers.indexOf('avgPredictedScore') + 1;
        if (insIdx >= 0) {
          headers = [...headers.slice(0, insIdx), 'trendResponseRate', 'trendAvgCSATScore', ...headers.slice(insIdx)];
        }
      }
      // Insert trend columns after avgPredictedScore for Account-wise view when trend section shown
      if (!showBuWise && !showTop10 && showTrendSection) {
        const insIdx = headers.indexOf('avgPredictedScore') + 1;
        if (insIdx >= 0) {
          headers = [...headers.slice(0, insIdx), 'trendResponseRate', 'trendAvgCSATScore', ...headers.slice(insIdx)];
        }
      }
      // Display names for Excel (user-friendly column titles)
      const headerDisplayNames = {
        sNo: 'Sr. No.',
        practice: PRACTICE_LABEL,
        customerName: ACCOUNT_NAME_LABEL,
        businessUnit: BUSINESS_UNIT_LABEL,
        cssSentCount: POLLED_LABEL,
        cssReceivedCount: RESPONDED_LABEL,
        responseRate: RESPONSE_RATE_LABEL,
        averageCSATScore: AVERAGE_CSAT_SCORE_LABEL,
        avgPredictedScore: AVG_PREDICTED_SCORE_LABEL,
        yearQuarter: 'YEAR - QUARTER',
        trendResponseRate: 'Response Rate Trend',
        trendAvgCSATScore: 'Average CSAT Score Trend',
        fmPolled: POLLED_LABEL,
        fmResponded: RESPONDED_LABEL,
        fmResponseRate: RESPONSE_RATE_LABEL,
        fmAverageCSATScore: AVERAGE_CSAT_SCORE_LABEL,
        fmAvgPredictedScore: AVG_PREDICTED_SCORE_LABEL,
        cmPolled: POLLED_LABEL,
        cmResponded: RESPONDED_LABEL,
        cmResponseRate: RESPONSE_RATE_LABEL,
        cmAverageCSATScore: AVERAGE_CSAT_SCORE_LABEL,
        cmAvgPredictedScore: AVG_PREDICTED_SCORE_LABEL,
        saPolled: POLLED_LABEL,
        saResponded: RESPONDED_LABEL,
        saResponseRate: RESPONSE_RATE_LABEL,
        saAverageCSATScore: AVERAGE_CSAT_SCORE_LABEL,
        saAvgPredictedScore: AVG_PREDICTED_SCORE_LABEL
      };
      const displayHeaders = headers.map(h => (headerDisplayNames[h] || h));
      const hasGroupSections = headers.includes('fmPolled') && headers.includes('cmPolled') && headers.includes('saPolled');
      // BU-wise view: only Fully Managed columns (no Co-Managed / Staff Augmentation)
      const hasFullyManagedOnly = headers.includes('fmPolled') && !headers.includes('cmPolled');
      
      // Find the response rate column indices
      const responseRateColIndex = headers.findIndex(header => 
        header === 'responseRate' || (header.includes('Response Rate') && header !== 'fmResponseRate' && header !== 'cmResponseRate' && header !== 'saResponseRate')
      );
      const fmResponseRateColIndex = headers.findIndex(header => header === 'fmResponseRate');
      const cmResponseRateColIndex = headers.findIndex(header => header === 'cmResponseRate');
      const saResponseRateColIndex = headers.findIndex(header => header === 'saResponseRate');
      const averageCSATScoreColIndex = headers.findIndex(header => header === 'averageCSATScore');
      const fmAverageCSATScoreColIndex = headers.findIndex(header => header === 'fmAverageCSATScore');
      const cmAverageCSATScoreColIndex = headers.findIndex(header => header === 'cmAverageCSATScore');
      const saAverageCSATScoreColIndex = headers.findIndex(header => header === 'saAverageCSATScore');
      const avgPredictedScoreColIndex = headers.findIndex(header => header === 'avgPredictedScore');
      const fmAvgPredictedScoreColIndex = headers.findIndex(header => header === 'fmAvgPredictedScore');
      const cmAvgPredictedScoreColIndex = headers.findIndex(header => header === 'cmAvgPredictedScore');
      const saAvgPredictedScoreColIndex = headers.findIndex(header => header === 'saAvgPredictedScore');
      const trendResponseRateColIndex = headers.findIndex(header => header === 'trendResponseRate');
      const trendAvgCSATScoreColIndex = headers.findIndex(header => header === 'trendAvgCSATScore');
      // Apply Average CSAT Score cell style: Responded=0 -> hyphen only (no grey); <4 Red/White; 4 to 4.49 Orange/Black; >=4.5 Green/Black
      const applyAverageCSATScoreCellStyle = (cell, noSurveysReceived, value) => {
        cell.border = cellBorder;
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (noSurveysReceived) {
          cell.value = '-';
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          return;
        }
        const score = parseScore(value);
        if (score !== null && score < 4) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (score !== null && score < 4.5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (score !== null && score >= 4.5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        }
      };
      
      // Add upper section row (Fully Managed, Co-Managed, Staff Augmentation) when account-wise or BU-wise with all 3 sections
      let mainHeaderRowIndex = 1;
      if (hasGroupSections) {
        const isBuWiseExport = !headers.includes('customerName');
        const hasTrendCols = headers.includes('trendResponseRate');
        const hasYearQuarter = headers.includes('yearQuarter');
        const baseCols = isBuWiseExport ? (hasYearQuarter ? (hasTrendCols ? 10 : 8) : (hasTrendCols ? 9 : 7)) : (hasTrendCols ? 10 : 8); // BU-wise: 7 base, +1 yearQuarter, +2 trend; account-wise/Top10: 8 base, +2 trend
        const h2StartCol = isBuWiseExport ? 3 : 4;  // H2 2025: BU-wise cols 3-8 (6), account-wise cols 4-8 (5)
        const h2EndCol = isBuWiseExport ? 8 : 8;
        const row1Values = headers.map((_, i) => {
          if (i < baseCols) {
            if (hasTrendCols && i === baseCols - 2) return trendHeaderLabel;
            if (hasTrendCols && i === baseCols - 1) return '';
            return '';
          }
          if (i < baseCols + 5) return i === baseCols ? 'Fully Managed' : '';
          if (i < baseCols + 10) return i === baseCols + 5 ? 'Co-Managed' : '';
          return i === baseCols + 10 ? 'Staff Augmentation' : '';
        });
        row1Values[h2StartCol - 1] = (acsatCycle || 'H2 2025');
        worksheet.addRow(row1Values);
        const row1 = worksheet.getRow(1);
        for (let c = 1; c <= headers.length; c++) {
          row1.getCell(c).border = cellBorder;
        }
        worksheet.mergeCells(1, h2StartCol, 1, h2EndCol);
        row1.getCell(h2StartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        row1.getCell(h2StartCol).font = { bold: true, color: { argb: 'FF000000' } };
        row1.getCell(h2StartCol).alignment = { horizontal: 'center', vertical: 'middle' };
        if (hasTrendCols) {
          worksheet.mergeCells(1, baseCols - 1, 1, baseCols);
          row1.getCell(baseCols - 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(baseCols - 1).font = { bold: true, color: { argb: 'FF000000' } };
          row1.getCell(baseCols - 1).alignment = { horizontal: 'center', vertical: 'middle' };
        }
        worksheet.mergeCells(1, baseCols + 1, 1, baseCols + 5);
        worksheet.mergeCells(1, baseCols + 6, 1, baseCols + 10);
        worksheet.mergeCells(1, baseCols + 11, 1, baseCols + 15);
        [baseCols + 1, baseCols + 6, baseCols + 11].forEach(col => {
          row1.getCell(col).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(col).font = { bold: true, color: { argb: 'FF000000' } };
          row1.getCell(col).alignment = { horizontal: 'center', vertical: 'middle' };
        });
        mainHeaderRowIndex = 2;
      } else if (hasFullyManagedOnly) {
        // BU-wise: one section "Fully Managed" for last 3 columns (cols 7–9)
        const row1Values = headers.map((_, i) => (i === 5 ? 'Fully Managed' : ''));
        worksheet.addRow(row1Values);
        const row1 = worksheet.getRow(1);
        for (let c = 1; c <= headers.length; c++) {
          row1.getCell(c).border = cellBorder;
        }
        worksheet.mergeCells(1, 6, 1, 8);
        row1.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        row1.getCell(6).font = { bold: true, color: { argb: 'FF000000' } };
        row1.getCell(6).alignment = { horizontal: 'center', vertical: 'middle' };
        mainHeaderRowIndex = 2;
      }
      
      // Add headers (with "Account Name" instead of "customerName")
      worksheet.addRow(displayHeaders);
      
      // Set column widths early so header wrap and borders display correctly (Avg. Predicted Score columns need width for wrap)
      headers.forEach((header, index) => {
        if (header === 'avgPredictedScore' || header === 'fmAvgPredictedScore' || header === 'cmAvgPredictedScore' || header === 'saAvgPredictedScore') {
          worksheet.getColumn(index + 1).width = 28;
        } else if (header === 'trendResponseRate' || header === 'trendAvgCSATScore') {
          worksheet.getColumn(index + 1).width = 22;
        } else if (header === 'yearQuarter') {
          worksheet.getColumn(index + 1).width = 16;
        } else if (header === 'responseRate' || header === 'fmResponseRate' || header === 'cmResponseRate' || header === 'saResponseRate') {
          worksheet.getColumn(index + 1).width = 14;
        } else if (header === 'customerName' || header === 'businessUnit' || header === 'cssSentCount' || header === 'cssReceivedCount') {
          worksheet.getColumn(index + 1).width = 18;
        } else {
          worksheet.getColumn(index + 1).width = 14;
        }
      });
      
      // Style the header row - Navy blue (ARGB: FF1E3A8A) same as ACSAT: Org & BU Level Average CSAT Scores
      const headerRow = worksheet.getRow(mainHeaderRowIndex);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' }
      };
      for (let c = 1; c <= headers.length; c++) {
        const cell = headerRow.getCell(c);
        cell.border = cellBorder;
        const headerKey = headers[c - 1];
        const isAvgPredictedCol = headerKey === 'avgPredictedScore' || headerKey === 'fmAvgPredictedScore' || headerKey === 'cmAvgPredictedScore' || headerKey === 'saAvgPredictedScore';
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      }
      headerRow.height = 45;

      // Column alignment: text (Account Name, Business Unit) = left; headers and numeric = center
      const textAlignLeftHeaders = ['customerName', 'businessUnit'];
      const isTextColumn = (h) => textAlignLeftHeaders.includes(h);

      // Add data rows with color coding (exclude customerId from export)
      // Top 10 view: export Top 10 accounts first, then Top 10 Accounts row (below), then Other Account with no Sr. No.
      const dataRowsForExport = top10GrandTotalRow ? filteredData.filter(r => r.customerId !== 'OTHER') : filteredData;
      dataRowsForExport.forEach((row, index) => {
        // Create a copy of the row data and format response rate with % sign; omit customerId; display Healthcare for Health care
        const rowData = { ...row };
        delete rowData.customerId;
        rowData.businessUnit = normalizeBusinessUnitDisplay(row.businessUnit);
        if (rowData.responseRate !== undefined) {
          rowData.responseRate = `${formatResponseRateOneDecimal(rowData.responseRate)}%`;
        }
        if (rowData.fmResponseRate !== undefined) {
          rowData.fmResponseRate = `${formatResponseRateOneDecimal(rowData.fmResponseRate)}%`;
        }
        if (rowData.cmResponseRate !== undefined) {
          rowData.cmResponseRate = `${formatResponseRateOneDecimal(rowData.cmResponseRate)}%`;
        }
        if (rowData.saResponseRate !== undefined) {
          rowData.saResponseRate = `${formatResponseRateOneDecimal(rowData.saResponseRate)}%`;
        }
        // Average CSAT Score: show hyphen when Responded=0; otherwise display with two decimal places
        if (row.cssReceivedCount === 0) rowData.averageCSATScore = '-';
        else if (hasAvgCsatValue(row.averageCSATScore)) rowData.averageCSATScore = formatAverageCSATScoreTwoDecimals(row.averageCSATScore);
        if ((row.fmResponded ?? 0) === 0) rowData.fmAverageCSATScore = '-';
        else if (hasAvgCsatValue(row.fmAverageCSATScore)) rowData.fmAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.fmAverageCSATScore);
        if ((row.cmResponded ?? 0) === 0) rowData.cmAverageCSATScore = '-';
        else if (hasAvgCsatValue(row.cmAverageCSATScore)) rowData.cmAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.cmAverageCSATScore);
        if ((row.saResponded ?? 0) === 0) rowData.saAverageCSATScore = '-';
        else if (hasAvgCsatValue(row.saAverageCSATScore)) rowData.saAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.saAverageCSATScore);
        // Avg. Predicted Score: show value only when corresponding Average CSAT Score has a value, else '-'; display with two decimal places
        if (!hasAvgCsatValue(rowData.averageCSATScore)) rowData.avgPredictedScore = '-';
        else if (hasAvgCsatValue(row.avgPredictedScore)) rowData.avgPredictedScore = formatAverageCSATScoreTwoDecimals(row.avgPredictedScore);
        if (!hasAvgCsatValue(rowData.fmAverageCSATScore)) rowData.fmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(row.fmAvgPredictedScore)) rowData.fmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.fmAvgPredictedScore);
        if (!hasAvgCsatValue(rowData.cmAverageCSATScore)) rowData.cmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(row.cmAvgPredictedScore)) rowData.cmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.cmAvgPredictedScore);
        if (!hasAvgCsatValue(rowData.saAverageCSATScore)) rowData.saAvgPredictedScore = '-';
        else if (hasAvgCsatValue(row.saAvgPredictedScore)) rowData.saAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.saAvgPredictedScore);
        // Trend columns: BU-wise/Top10/Account-wise = arrows with difference values (↑ +X% / ↓ -X%)
        if (headers.includes('trendResponseRate')) {
          if (showBuWise) {
            const buKey = normalizeBusinessUnitDisplay(row.businessUnit);
            const trend = trendBuLookup[buKey];
            const currRateParsed = row.responseRate != null ? parseFloat(row.responseRate) : NaN;
            const currRate = Number.isNaN(currRateParsed) ? 0 : currRateParsed;
            let trendRate = trend?.responseRatePct;
            const currScoreParsed = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : NaN;
            const currScore = row.cssReceivedCount === 0 ? 0 : (Number.isNaN(currScoreParsed) ? 0 : round2(currScoreParsed));
            let trendScore = trend?.avgCSATScore;
            // Symmetric zero-handling: if H1 row exists but value missing, treat as 0
            if (trend != null && (trendRate == null || Number.isNaN(Number(trendRate)))) trendRate = 0;
            if (trend != null && (trendScore == null || Number.isNaN(Number(trendScore)))) trendScore = 0;
            if (trend != null) {
              const diff = Math.round((currRate - trendRate) * 10) / 10;
              if (currRate > trendRate) { rowData.trendResponseRate = `(+${diff}%) ↑`; }
              else if (currRate < trendRate) { rowData.trendResponseRate = `(${diff}%) ↓`; }
              else { rowData.trendResponseRate = `(0%) −`; }
            } else {
              rowData.trendResponseRate = '-';
            }
            if (trend != null) {
              trendScore = round2(trendScore);
              const diff = round2(currScore - trendScore);
              if (currScore > trendScore) { rowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
              else if (currScore < trendScore) { rowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
              else { rowData.trendAvgCSATScore = `(0.00) −`; }
            } else {
              rowData.trendAvgCSATScore = '-';
            }
          } else if (showTop10) {
            const accKeyT10 = (row.customerName || '').trim().toLowerCase();
            const buKeyT10 = (normalizeBusinessUnitDisplay(row.businessUnit) || row.businessUnit || '').toString().trim().toLowerCase();
            const trend = (accKeyT10 && buKeyT10 ? trendTop10Lookup[`${accKeyT10}|||${buKeyT10}`] : null) || (accKeyT10 ? trendTop10Lookup[`nameOnly|||${accKeyT10}`] : null);
            const currRateParsed = row.responseRate != null ? parseFloat(row.responseRate) : NaN;
            const currRate = Number.isNaN(currRateParsed) ? 0 : currRateParsed;
            const trendRate = trend?.responseRatePct;
            const currScoreParsed = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : NaN;
            const currScore = row.cssReceivedCount === 0 ? 0 : (Number.isNaN(currScoreParsed) ? 0 : round2(currScoreParsed));
            let trendScore = trend?.avgCSATScore;
            if (trend != null && (trendScore == null || Number.isNaN(Number(trendScore)))) trendScore = 0;
            if (trend != null) trendScore = round2(trendScore);
            if (trend != null && trendRate != null) {
              const diff = Math.round((currRate - trendRate) * 10) / 10;
              if (currRate > trendRate) { rowData.trendResponseRate = `(+${diff}%) ↑`; }
              else if (currRate < trendRate) { rowData.trendResponseRate = `(${diff}%) ↓`; }
              else { rowData.trendResponseRate = `(0%) −`; }
            } else {
              rowData.trendResponseRate = '-';
            }
            if (trend != null) {
              const diff = round2(currScore - trendScore);
              if (currScore > trendScore) { rowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
              else if (currScore < trendScore) { rowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
              else { rowData.trendAvgCSATScore = `(0.00) −`; }
            } else {
              rowData.trendAvgCSATScore = '-';
            }
          } else {
            // Account-wise: compare current (H2) row vs H1 trend reference by Account+BU
            const accKey = (row.customerName || '').toString().trim().toLowerCase();
            const buKey = normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase();
            const idKey = normalizeCustomerIdKey(row.customerId || '');
            const trend =
              (idKey ? trendAccountBuLookup[`id|||${idKey}|||${buKey}`] : null) ||
              (accKey ? trendAccountBuLookup[`name|||${accKey}|||${buKey}`] : null) ||
              ((!buKey && accKey) ? trendAccountBuLookup[`nameOnly|||${accKey}`] : null);
            const currRateParsed = row.responseRate != null ? parseFloat(row.responseRate) : NaN;
            const currRate = Number.isNaN(currRateParsed) ? 0 : currRateParsed;
            let trendRate = trend?.responseRatePct;
            const currScoreParsed = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : NaN;
            const currScore = row.cssReceivedCount === 0 ? 0 : (Number.isNaN(currScoreParsed) ? 0 : round2(currScoreParsed));
            let trendScore = trend?.avgCSATScore;
            // Symmetric zero-handling: if H1 row exists but value missing, treat as 0 (match dashboard behavior)
            if (trend != null && (trendRate == null || Number.isNaN(Number(trendRate)))) trendRate = 0;
            if (trend != null && (trendScore == null || Number.isNaN(Number(trendScore)))) trendScore = 0;
            if (trend != null) {
              const diff = Math.round((currRate - trendRate) * 10) / 10;
              if (currRate > trendRate) { rowData.trendResponseRate = `(+${diff}%) ↑`; }
              else if (currRate < trendRate) { rowData.trendResponseRate = `(${diff}%) ↓`; }
              else { rowData.trendResponseRate = `(0%) −`; }
            } else {
              rowData.trendResponseRate = '-';
            }
            if (trend != null) {
              trendScore = round2(trendScore);
              const diff = round2(currScore - trendScore);
              if (currScore > trendScore) { rowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
              else if (currScore < trendScore) { rowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
              else { rowData.trendAvgCSATScore = `(0.00) −`; }
            } else {
              rowData.trendAvgCSATScore = '-';
            }
          }
        }
        // BUSINESS UNIT = Sead and Polled = 0: display hyphen for entire row in Excel
        if (isSeadAndPolledZero(row)) {
          headers.forEach(h => { rowData[h] = '-'; });
        }
        
        const dataRow = worksheet.addRow(headers.map(h => (rowData[h] !== undefined && rowData[h] !== null ? rowData[h] : '')));
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          const cell = dataRow.getCell(colNumber);
          cell.border = cellBorder;
          const headerKey = headers[colNumber - 1];
          cell.alignment = { horizontal: isTextColumn(headerKey) ? 'left' : 'center', vertical: 'middle' };
        }

        // Trend arrow columns: up arrow green, down arrow red (check if value contains arrow)
        if (trendResponseRateColIndex >= 0 && rowData.trendResponseRate) {
          const trCell = dataRow.getCell(trendResponseRateColIndex + 1);
          const trVal = String(rowData.trendResponseRate);
          if (trVal.includes('↑')) trCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (trVal.includes('↓')) trCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        if (trendAvgCSATScoreColIndex >= 0 && rowData.trendAvgCSATScore) {
          const tsCell = dataRow.getCell(trendAvgCSATScoreColIndex + 1);
          const tsVal = String(rowData.trendAvgCSATScore);
          if (tsVal.includes('↑')) tsCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (tsVal.includes('↓')) tsCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }

        // Skip color coding for Sead + Polled=0 rows (entire row is hyphen)
        if (!isSeadAndPolledZero(row)) {
        // Apply color coding to response rate cell: Red (Excel) < 50%, Orange (#FFA500) 50-74%, Light Green (Excel) >= 75%, Gray = No surveys received (0)
        if (responseRateColIndex >= 0) {
          const responseRate = parseFloat(row.responseRate);
          const noSurveysReceived = row.cssReceivedCount === 0;
          const responseRateCell = dataRow.getCell(responseRateColIndex + 1);
          
          if (noSurveysReceived) {
            // No surveys received / #Responded=0: no grey fill
            responseRateCell.font = { color: { argb: 'FF374151' }, bold: true };
          } else if (responseRate >= 75) {
            // Light Green >= 75% (Excel Light Green)
            responseRateCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFC6EFCE' }
            };
            responseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (responseRate >= 50) {
            // Orange 50% to 74% (same as ACSAT dashboard - #FFA500)
            responseRateCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFA500' }
            };
            responseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            // Red < 50% (Excel Red)
            responseRateCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFF0000' }
            };
            responseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          
          // Center align the response rate cell
          responseRateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Apply color coding to Fully Managed Response Rate cell (same as main Response Rate)
        if (fmResponseRateColIndex >= 0 && row.fmResponseRate !== undefined) {
          const fmRate = typeof row.fmResponseRate === 'number' ? row.fmResponseRate : parseFloat(row.fmResponseRate);
          const noFmSurveysReceived = (row.fmResponded ?? 0) === 0;
          const fmResponseRateCell = dataRow.getCell(fmResponseRateColIndex + 1);
          if (noFmSurveysReceived) {
            fmResponseRateCell.font = { color: { argb: 'FF374151' }, bold: true };
          } else if (fmRate >= 75) {
            fmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            fmResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (fmRate >= 50) {
            fmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            fmResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            fmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            fmResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          fmResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Apply color coding to Co-Managed Response Rate cell (same as main Response Rate)
        if (cmResponseRateColIndex >= 0 && row.cmResponseRate !== undefined) {
          const cmRate = typeof row.cmResponseRate === 'number' ? row.cmResponseRate : parseFloat(row.cmResponseRate);
          const noCmSurveysReceived = (row.cmResponded ?? 0) === 0;
          const cmResponseRateCell = dataRow.getCell(cmResponseRateColIndex + 1);
          if (noCmSurveysReceived) {
            cmResponseRateCell.font = { color: { argb: 'FF374151' }, bold: true };
          } else if (cmRate >= 75) {
            cmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            cmResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (cmRate >= 50) {
            cmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cmResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cmResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cmResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          cmResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Apply color coding to Staff Augmentation Response Rate cell (same as main Response Rate)
        if (saResponseRateColIndex >= 0 && row.saResponseRate !== undefined) {
          const saRate = typeof row.saResponseRate === 'number' ? row.saResponseRate : parseFloat(row.saResponseRate);
          const noSaSurveysReceived = (row.saResponded ?? 0) === 0;
          const saResponseRateCell = dataRow.getCell(saResponseRateColIndex + 1);
          if (noSaSurveysReceived) {
            saResponseRateCell.font = { color: { argb: 'FF374151' }, bold: true };
          } else if (saRate >= 75) {
            saResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
            saResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (saRate >= 50) {
            saResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            saResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            saResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            saResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          }
          saResponseRateCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        // Apply Average CSAT Score color coding (main and FM, CM, SA columns)
        if (averageCSATScoreColIndex >= 0) {
          const cell = dataRow.getCell(averageCSATScoreColIndex + 1);
          applyAverageCSATScoreCellStyle(cell, row.cssReceivedCount === 0, rowData.averageCSATScore);
        }
        if (fmAverageCSATScoreColIndex >= 0) {
          const cell = dataRow.getCell(fmAverageCSATScoreColIndex + 1);
          applyAverageCSATScoreCellStyle(cell, (row.fmResponded ?? 0) === 0, rowData.fmAverageCSATScore);
        }
        if (cmAverageCSATScoreColIndex >= 0) {
          const cell = dataRow.getCell(cmAverageCSATScoreColIndex + 1);
          applyAverageCSATScoreCellStyle(cell, (row.cmResponded ?? 0) === 0, rowData.cmAverageCSATScore);
        }
        if (saAverageCSATScoreColIndex >= 0) {
          const cell = dataRow.getCell(saAverageCSATScoreColIndex + 1);
          applyAverageCSATScoreCellStyle(cell, (row.saResponded ?? 0) === 0, rowData.saAverageCSATScore);
        }
        // Avg. Predicted Score: when #Responded=0 show hyphen and gray (same as Average CSAT Score)
        if (avgPredictedScoreColIndex >= 0 && row.cssReceivedCount === 0) {
          const cell = dataRow.getCell(avgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmAvgPredictedScoreColIndex >= 0 && (row.fmResponded ?? 0) === 0) {
          const cell = dataRow.getCell(fmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmAvgPredictedScoreColIndex >= 0 && (row.cmResponded ?? 0) === 0) {
          const cell = dataRow.getCell(cmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saAvgPredictedScoreColIndex >= 0 && (row.saResponded ?? 0) === 0) {
          const cell = dataRow.getCell(saAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        }
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          dataRow.getCell(colNumber).border = cellBorder;
        }
      });

      // Add Top 10 Accounts grand total row for Top 10 response rate export
      if (top10GrandTotalRow && headers.includes('customerName')) {
        const top10RowData = { ...top10GrandTotalRow };
        delete top10RowData.customerId;
        delete top10RowData.isTop10GrandTotal;
        top10RowData.businessUnit = normalizeBusinessUnitDisplay(top10RowData.businessUnit);
        if (top10RowData.responseRate !== undefined) top10RowData.responseRate = `${formatResponseRateOneDecimal(top10RowData.responseRate)}%`;
        if (top10RowData.fmResponseRate !== undefined) top10RowData.fmResponseRate = `${formatResponseRateOneDecimal(top10RowData.fmResponseRate)}%`;
        if (top10RowData.cmResponseRate !== undefined) top10RowData.cmResponseRate = `${formatResponseRateOneDecimal(top10RowData.cmResponseRate)}%`;
        if (top10RowData.saResponseRate !== undefined) top10RowData.saResponseRate = `${formatResponseRateOneDecimal(top10RowData.saResponseRate)}%`;
        if (top10GrandTotalRow.cssReceivedCount === 0) top10RowData.averageCSATScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.averageCSATScore)) top10RowData.averageCSATScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.averageCSATScore);
        if (top10GrandTotalRow.fmResponded === 0) top10RowData.fmAverageCSATScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.fmAverageCSATScore)) top10RowData.fmAverageCSATScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.fmAverageCSATScore);
        if (top10GrandTotalRow.cmResponded === 0) top10RowData.cmAverageCSATScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.cmAverageCSATScore)) top10RowData.cmAverageCSATScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.cmAverageCSATScore);
        if (top10GrandTotalRow.saResponded === 0) top10RowData.saAverageCSATScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.saAverageCSATScore)) top10RowData.saAverageCSATScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.saAverageCSATScore);
        if (!hasAvgCsatValue(top10RowData.averageCSATScore)) top10RowData.avgPredictedScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.avgPredictedScore)) top10RowData.avgPredictedScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.avgPredictedScore);
        if (!hasAvgCsatValue(top10RowData.fmAverageCSATScore)) top10RowData.fmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.fmAvgPredictedScore)) top10RowData.fmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.fmAvgPredictedScore);
        if (!hasAvgCsatValue(top10RowData.cmAverageCSATScore)) top10RowData.cmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.cmAvgPredictedScore)) top10RowData.cmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.cmAvgPredictedScore);
        if (!hasAvgCsatValue(top10RowData.saAverageCSATScore)) top10RowData.saAvgPredictedScore = '-';
        else if (hasAvgCsatValue(top10GrandTotalRow.saAvgPredictedScore)) top10RowData.saAvgPredictedScore = formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.saAvgPredictedScore);
        if (headers.includes('trendResponseRate')) {
          const key = `Top 10 Accounts|||N/A`;
          const trend = trendTop10SummaryLookup[key];
          const currRate = top10GrandTotalRow.responseRate != null ? parseFloat(top10GrandTotalRow.responseRate) : null;
          const trendRate = trend?.responseRatePct;
          const currScore = top10GrandTotalRow.averageCSATScore != null ? parseFloat(top10GrandTotalRow.averageCSATScore) : null;
          const trendScore = trend?.avgCSATScore;
          if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
            const diff = Math.round((currRate - trendRate) * 10) / 10;
            if (currRate > trendRate) { top10RowData.trendResponseRate = `(+${diff}%) ↑`; }
            else if (currRate < trendRate) { top10RowData.trendResponseRate = `(${diff}%) ↓`; }
            else { top10RowData.trendResponseRate = `(0%) −`; }
          } else {
            top10RowData.trendResponseRate = '-';
          }
          if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
            const diff = Math.round((currScore - trendScore) * 100) / 100;
            if (currScore > trendScore) { top10RowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
            else if (currScore < trendScore) { top10RowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
            else { top10RowData.trendAvgCSATScore = `(0.00) −`; }
          } else {
            top10RowData.trendAvgCSATScore = '-';
          }
        }
        const top10DataRow = worksheet.addRow(headers.map(h => (top10RowData[h] !== undefined && top10RowData[h] !== null ? top10RowData[h] : '')));
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          const cell = top10DataRow.getCell(colNumber);
          cell.border = cellBorder;
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
          const headerKey = headers[colNumber - 1];
          cell.alignment = { horizontal: isTextColumn(headerKey) ? 'left' : 'center', vertical: 'middle' };
        }
        if (responseRateColIndex >= 0) {
          const r = top10GrandTotalRow.responseRate;
          const cell = top10DataRow.getCell(responseRateColIndex + 1);
          if (top10GrandTotalRow.cssReceivedCount === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmResponseRateColIndex >= 0) {
          const r = top10GrandTotalRow.fmResponseRate;
          const cell = top10DataRow.getCell(fmResponseRateColIndex + 1);
          if (top10GrandTotalRow.fmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmResponseRateColIndex >= 0) {
          const r = top10GrandTotalRow.cmResponseRate;
          const cell = top10DataRow.getCell(cmResponseRateColIndex + 1);
          if (top10GrandTotalRow.cmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saResponseRateColIndex >= 0) {
          const r = top10GrandTotalRow.saResponseRate;
          const cell = top10DataRow.getCell(saResponseRateColIndex + 1);
          if (top10GrandTotalRow.saResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (averageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(top10DataRow.getCell(averageCSATScoreColIndex + 1), top10GrandTotalRow.cssReceivedCount === 0, top10RowData.averageCSATScore);
        if (fmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(top10DataRow.getCell(fmAverageCSATScoreColIndex + 1), top10GrandTotalRow.fmResponded === 0, top10RowData.fmAverageCSATScore);
        if (cmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(top10DataRow.getCell(cmAverageCSATScoreColIndex + 1), top10GrandTotalRow.cmResponded === 0, top10RowData.cmAverageCSATScore);
        if (saAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(top10DataRow.getCell(saAverageCSATScoreColIndex + 1), top10GrandTotalRow.saResponded === 0, top10RowData.saAverageCSATScore);
        if (avgPredictedScoreColIndex >= 0 && top10GrandTotalRow.cssReceivedCount === 0) {
          const cell = top10DataRow.getCell(avgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmAvgPredictedScoreColIndex >= 0 && top10GrandTotalRow.fmResponded === 0) {
          const cell = top10DataRow.getCell(fmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmAvgPredictedScoreColIndex >= 0 && top10GrandTotalRow.cmResponded === 0) {
          const cell = top10DataRow.getCell(cmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saAvgPredictedScoreColIndex >= 0 && top10GrandTotalRow.saResponded === 0) {
          const cell = top10DataRow.getCell(saAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (trendResponseRateColIndex >= 0 && top10RowData.trendResponseRate) {
          const trCell = top10DataRow.getCell(trendResponseRateColIndex + 1);
          const trVal = String(top10RowData.trendResponseRate);
          if (trVal.includes('↑')) trCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (trVal.includes('↓')) trCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        if (trendAvgCSATScoreColIndex >= 0 && top10RowData.trendAvgCSATScore) {
          const tsCell = top10DataRow.getCell(trendAvgCSATScoreColIndex + 1);
          const tsVal = String(top10RowData.trendAvgCSATScore);
          if (tsVal.includes('↑')) tsCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (tsVal.includes('↓')) tsCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          top10DataRow.getCell(colNumber).border = cellBorder;
        }
      }

      // Add Other Account row(s) for Top 10 export (below Top 10 Accounts row, no Sr. No.)
      if (top10GrandTotalRow && headers.includes('customerName')) {
        filteredData.filter(r => r.customerId === 'OTHER').forEach((row) => {
          const rowData = { ...row, sNo: '', businessUnit: row.businessUnit === 'N/A' ? '' : normalizeBusinessUnitDisplay(row.businessUnit) };
          delete rowData.customerId;
          if (rowData.responseRate !== undefined) rowData.responseRate = `${formatResponseRateOneDecimal(rowData.responseRate)}%`;
          if (rowData.fmResponseRate !== undefined) rowData.fmResponseRate = `${formatResponseRateOneDecimal(rowData.fmResponseRate)}%`;
          if (rowData.cmResponseRate !== undefined) rowData.cmResponseRate = `${formatResponseRateOneDecimal(rowData.cmResponseRate)}%`;
          if (rowData.saResponseRate !== undefined) rowData.saResponseRate = `${formatResponseRateOneDecimal(rowData.saResponseRate)}%`;
          if (row.cssReceivedCount === 0) rowData.averageCSATScore = '-';
          else if (hasAvgCsatValue(row.averageCSATScore)) rowData.averageCSATScore = formatAverageCSATScoreTwoDecimals(row.averageCSATScore);
          if ((row.fmResponded ?? 0) === 0) rowData.fmAverageCSATScore = '-';
          else if (hasAvgCsatValue(row.fmAverageCSATScore)) rowData.fmAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.fmAverageCSATScore);
          if ((row.cmResponded ?? 0) === 0) rowData.cmAverageCSATScore = '-';
          else if (hasAvgCsatValue(row.cmAverageCSATScore)) rowData.cmAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.cmAverageCSATScore);
          if ((row.saResponded ?? 0) === 0) rowData.saAverageCSATScore = '-';
          else if (hasAvgCsatValue(row.saAverageCSATScore)) rowData.saAverageCSATScore = formatAverageCSATScoreTwoDecimals(row.saAverageCSATScore);
          if (!hasAvgCsatValue(rowData.averageCSATScore)) rowData.avgPredictedScore = '-';
          else if (hasAvgCsatValue(row.avgPredictedScore)) rowData.avgPredictedScore = formatAverageCSATScoreTwoDecimals(row.avgPredictedScore);
          if (!hasAvgCsatValue(rowData.fmAverageCSATScore)) rowData.fmAvgPredictedScore = '-';
          else if (hasAvgCsatValue(row.fmAvgPredictedScore)) rowData.fmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.fmAvgPredictedScore);
          if (!hasAvgCsatValue(rowData.cmAverageCSATScore)) rowData.cmAvgPredictedScore = '-';
          else if (hasAvgCsatValue(row.cmAvgPredictedScore)) rowData.cmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.cmAvgPredictedScore);
          if (!hasAvgCsatValue(rowData.saAverageCSATScore)) rowData.saAvgPredictedScore = '-';
          else if (hasAvgCsatValue(row.saAvgPredictedScore)) rowData.saAvgPredictedScore = formatAverageCSATScoreTwoDecimals(row.saAvgPredictedScore);
          if (headers.includes('trendResponseRate')) {
            const key = `Other Accounts|||N/A`;
            const trend = trendTop10SummaryLookup[key];
            const currRate = row.responseRate != null ? parseFloat(row.responseRate) : null;
            const trendRate = trend?.responseRatePct;
            const currScore = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : null;
            const trendScore = trend?.avgCSATScore;
            if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
              const diff = Math.round((currRate - trendRate) * 10) / 10;
              if (currRate > trendRate) { rowData.trendResponseRate = `(+${diff}%) ↑`; }
              else if (currRate < trendRate) { rowData.trendResponseRate = `(${diff}%) ↓`; }
              else { rowData.trendResponseRate = `(0%) −`; }
            } else {
              rowData.trendResponseRate = '-';
            }
            if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
              const diff = Math.round((currScore - trendScore) * 100) / 100;
              if (currScore > trendScore) { rowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
              else if (currScore < trendScore) { rowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
              else { rowData.trendAvgCSATScore = `(0.00) −`; }
            } else {
              rowData.trendAvgCSATScore = '-';
            }
          }
          const otherDataRow = worksheet.addRow(headers.map(h => (rowData[h] !== undefined && rowData[h] !== null ? rowData[h] : '')));
          for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
            const cell = otherDataRow.getCell(colNumber);
            cell.border = cellBorder;
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF93CCEA' } };
            const headerKey = headers[colNumber - 1];
            cell.alignment = { horizontal: isTextColumn(headerKey) ? 'left' : 'center', vertical: 'middle' };
          }
          if (responseRateColIndex >= 0) {
            const responseRate = parseFloat(row.responseRate);
            const noSurveysReceived = row.cssReceivedCount === 0;
            const cell = otherDataRow.getCell(responseRateColIndex + 1);
            if (noSurveysReceived) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
            else if (responseRate >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (responseRate >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (fmResponseRateColIndex >= 0 && row.fmResponseRate !== undefined) {
            const r = typeof row.fmResponseRate === 'number' ? row.fmResponseRate : parseFloat(row.fmResponseRate);
            const cell = otherDataRow.getCell(fmResponseRateColIndex + 1);
            if ((row.fmResponded ?? 0) === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
            else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (cmResponseRateColIndex >= 0 && row.cmResponseRate !== undefined) {
            const r = typeof row.cmResponseRate === 'number' ? row.cmResponseRate : parseFloat(row.cmResponseRate);
            const cell = otherDataRow.getCell(cmResponseRateColIndex + 1);
            if ((row.cmResponded ?? 0) === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
            else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (saResponseRateColIndex >= 0 && row.saResponseRate !== undefined) {
            const r = typeof row.saResponseRate === 'number' ? row.saResponseRate : parseFloat(row.saResponseRate);
            const cell = otherDataRow.getCell(saResponseRateColIndex + 1);
            if ((row.saResponded ?? 0) === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
            else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
            else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (averageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(otherDataRow.getCell(averageCSATScoreColIndex + 1), row.cssReceivedCount === 0, rowData.averageCSATScore);
          if (fmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(otherDataRow.getCell(fmAverageCSATScoreColIndex + 1), (row.fmResponded ?? 0) === 0, rowData.fmAverageCSATScore);
          if (cmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(otherDataRow.getCell(cmAverageCSATScoreColIndex + 1), (row.cmResponded ?? 0) === 0, rowData.cmAverageCSATScore);
          if (saAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(otherDataRow.getCell(saAverageCSATScoreColIndex + 1), (row.saResponded ?? 0) === 0, rowData.saAverageCSATScore);
          if (avgPredictedScoreColIndex >= 0 && row.cssReceivedCount === 0) {
            const cell = otherDataRow.getCell(avgPredictedScoreColIndex + 1);
            cell.value = '-';
            cell.border = cellBorder;
            cell.font = { color: { argb: 'FF374151' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (fmAvgPredictedScoreColIndex >= 0 && (row.fmResponded ?? 0) === 0) {
            const cell = otherDataRow.getCell(fmAvgPredictedScoreColIndex + 1);
            cell.value = '-';
            cell.border = cellBorder;
            cell.font = { color: { argb: 'FF374151' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (cmAvgPredictedScoreColIndex >= 0 && (row.cmResponded ?? 0) === 0) {
            const cell = otherDataRow.getCell(cmAvgPredictedScoreColIndex + 1);
            cell.value = '-';
            cell.border = cellBorder;
            cell.font = { color: { argb: 'FF374151' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (saAvgPredictedScoreColIndex >= 0 && (row.saResponded ?? 0) === 0) {
            const cell = otherDataRow.getCell(saAvgPredictedScoreColIndex + 1);
            cell.value = '-';
            cell.border = cellBorder;
            cell.font = { color: { argb: 'FF374151' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
          }
          if (trendResponseRateColIndex >= 0 && rowData.trendResponseRate) {
            const trCell = otherDataRow.getCell(trendResponseRateColIndex + 1);
            const trVal = String(rowData.trendResponseRate);
            if (trVal.includes('↑')) trCell.font = { color: { argb: 'FF16A34A' }, bold: true };
            else if (trVal.includes('↓')) trCell.font = { color: { argb: 'FFDC2626' }, bold: true };
          }
          if (trendAvgCSATScoreColIndex >= 0 && rowData.trendAvgCSATScore) {
            const tsCell = otherDataRow.getCell(trendAvgCSATScoreColIndex + 1);
            const tsVal = String(rowData.trendAvgCSATScore);
            if (tsVal.includes('↑')) tsCell.font = { color: { argb: 'FF16A34A' }, bold: true };
            else if (tsVal.includes('↓')) tsCell.font = { color: { argb: 'FFDC2626' }, bold: true };
          }
          for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
            otherDataRow.getCell(colNumber).border = cellBorder;
          }
        });
      }

      // Add Overall row for Top 10 export (grand total from entire Sheet2 "CSAT sent and received Report")
      if (overallRow && headers.includes('customerName')) {
        const overallRowData = { ...overallRow };
        delete overallRowData.customerId;
        delete overallRowData.isOverall;
        overallRowData.businessUnit = normalizeBusinessUnitDisplay(overallRowData.businessUnit);
        if (overallRowData.responseRate !== undefined) overallRowData.responseRate = `${formatResponseRateOneDecimal(overallRowData.responseRate)}%`;
        if (overallRowData.fmResponseRate !== undefined) overallRowData.fmResponseRate = `${formatResponseRateOneDecimal(overallRowData.fmResponseRate)}%`;
        if (overallRowData.cmResponseRate !== undefined) overallRowData.cmResponseRate = `${formatResponseRateOneDecimal(overallRowData.cmResponseRate)}%`;
        if (overallRowData.saResponseRate !== undefined) overallRowData.saResponseRate = `${formatResponseRateOneDecimal(overallRowData.saResponseRate)}%`;
        if (overallRow.cssReceivedCount === 0) overallRowData.averageCSATScore = '-';
        else if (hasAvgCsatValue(overallRow.averageCSATScore)) overallRowData.averageCSATScore = formatAverageCSATScoreTwoDecimals(overallRow.averageCSATScore);
        if (overallRow.fmResponded === 0) overallRowData.fmAverageCSATScore = '-';
        else if (hasAvgCsatValue(overallRow.fmAverageCSATScore)) overallRowData.fmAverageCSATScore = formatAverageCSATScoreTwoDecimals(overallRow.fmAverageCSATScore);
        if (overallRow.cmResponded === 0) overallRowData.cmAverageCSATScore = '-';
        else if (hasAvgCsatValue(overallRow.cmAverageCSATScore)) overallRowData.cmAverageCSATScore = formatAverageCSATScoreTwoDecimals(overallRow.cmAverageCSATScore);
        if (overallRow.saResponded === 0) overallRowData.saAverageCSATScore = '-';
        else if (hasAvgCsatValue(overallRow.saAverageCSATScore)) overallRowData.saAverageCSATScore = formatAverageCSATScoreTwoDecimals(overallRow.saAverageCSATScore);
        if (!hasAvgCsatValue(overallRowData.averageCSATScore)) overallRowData.avgPredictedScore = '-';
        else if (hasAvgCsatValue(overallRow.avgPredictedScore)) overallRowData.avgPredictedScore = formatAverageCSATScoreTwoDecimals(overallRow.avgPredictedScore);
        if (!hasAvgCsatValue(overallRowData.fmAverageCSATScore)) overallRowData.fmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(overallRow.fmAvgPredictedScore)) overallRowData.fmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(overallRow.fmAvgPredictedScore);
        if (!hasAvgCsatValue(overallRowData.cmAverageCSATScore)) overallRowData.cmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(overallRow.cmAvgPredictedScore)) overallRowData.cmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(overallRow.cmAvgPredictedScore);
        if (!hasAvgCsatValue(overallRowData.saAverageCSATScore)) overallRowData.saAvgPredictedScore = '-';
        else if (hasAvgCsatValue(overallRow.saAvgPredictedScore)) overallRowData.saAvgPredictedScore = formatAverageCSATScoreTwoDecimals(overallRow.saAvgPredictedScore);
        if (headers.includes('trendResponseRate')) {
          const key = `Overall|||N/A`;
          const trend = trendTop10SummaryLookup[key];
          const currRate = overallRow.responseRate != null ? parseFloat(overallRow.responseRate) : null;
          const trendRate = trend?.responseRatePct;
          const currScore = overallRow.averageCSATScore != null ? parseFloat(overallRow.averageCSATScore) : null;
          const trendScore = trend?.avgCSATScore;
          if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
            const diff = Math.round((currRate - trendRate) * 10) / 10;
            if (currRate > trendRate) { overallRowData.trendResponseRate = `(+${diff}%) ↑`; }
            else if (currRate < trendRate) { overallRowData.trendResponseRate = `(${diff}%) ↓`; }
            else { overallRowData.trendResponseRate = `(0%) −`; }
          } else {
            overallRowData.trendResponseRate = '-';
          }
          if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
            const diff = Math.round((currScore - trendScore) * 100) / 100;
            if (currScore > trendScore) { overallRowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
            else if (currScore < trendScore) { overallRowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
            else { overallRowData.trendAvgCSATScore = `(0.00) −`; }
          } else {
            overallRowData.trendAvgCSATScore = '-';
          }
        }
        const overallDataRow = worksheet.addRow(headers.map(h => (overallRowData[h] !== undefined && overallRowData[h] !== null ? overallRowData[h] : '')));
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          const cell = overallDataRow.getCell(colNumber);
          cell.border = cellBorder;
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
          const headerKey = headers[colNumber - 1];
          cell.alignment = { horizontal: isTextColumn(headerKey) ? 'left' : 'center', vertical: 'middle' };
        }
        if (responseRateColIndex >= 0) {
          const r = overallRow.responseRate;
          const cell = overallDataRow.getCell(responseRateColIndex + 1);
          if (overallRow.cssReceivedCount === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmResponseRateColIndex >= 0) {
          const r = overallRow.fmResponseRate;
          const cell = overallDataRow.getCell(fmResponseRateColIndex + 1);
          if (overallRow.fmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmResponseRateColIndex >= 0) {
          const r = overallRow.cmResponseRate;
          const cell = overallDataRow.getCell(cmResponseRateColIndex + 1);
          if (overallRow.cmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saResponseRateColIndex >= 0) {
          const r = overallRow.saResponseRate;
          const cell = overallDataRow.getCell(saResponseRateColIndex + 1);
          if (overallRow.saResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (averageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(overallDataRow.getCell(averageCSATScoreColIndex + 1), overallRow.cssReceivedCount === 0, overallRowData.averageCSATScore);
        if (fmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(overallDataRow.getCell(fmAverageCSATScoreColIndex + 1), overallRow.fmResponded === 0, overallRowData.fmAverageCSATScore);
        if (cmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(overallDataRow.getCell(cmAverageCSATScoreColIndex + 1), overallRow.cmResponded === 0, overallRowData.cmAverageCSATScore);
        if (saAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(overallDataRow.getCell(saAverageCSATScoreColIndex + 1), overallRow.saResponded === 0, overallRowData.saAverageCSATScore);
        if (avgPredictedScoreColIndex >= 0 && overallRow.cssReceivedCount === 0) {
          const cell = overallDataRow.getCell(avgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmAvgPredictedScoreColIndex >= 0 && overallRow.fmResponded === 0) {
          const cell = overallDataRow.getCell(fmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmAvgPredictedScoreColIndex >= 0 && overallRow.cmResponded === 0) {
          const cell = overallDataRow.getCell(cmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saAvgPredictedScoreColIndex >= 0 && overallRow.saResponded === 0) {
          const cell = overallDataRow.getCell(saAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (trendResponseRateColIndex >= 0 && overallRowData.trendResponseRate) {
          const trCell = overallDataRow.getCell(trendResponseRateColIndex + 1);
          const trVal = String(overallRowData.trendResponseRate);
          if (trVal.includes('↑')) trCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (trVal.includes('↓')) trCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        if (trendAvgCSATScoreColIndex >= 0 && overallRowData.trendAvgCSATScore) {
          const tsCell = overallDataRow.getCell(trendAvgCSATScoreColIndex + 1);
          const tsVal = String(overallRowData.trendAvgCSATScore);
          if (tsVal.includes('↑')) tsCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (tsVal.includes('↓')) tsCell.font = { color: { argb: 'FFDC2626' }, bold: true };
        }
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          overallDataRow.getCell(colNumber).border = cellBorder;
        }
      }

      // Add Org level grand total row for BU-wise export
      if (orgLevelRow && headers.includes('businessUnit') && !headers.includes('customerName')) {
        const orgRowData = { ...orgLevelRow };
        delete orgRowData.customerId;
        delete orgRowData.isOrgLevel;
        orgRowData.businessUnit = normalizeBusinessUnitDisplay(orgRowData.businessUnit);
        if (orgRowData.responseRate !== undefined) orgRowData.responseRate = `${formatResponseRateOneDecimal(orgRowData.responseRate)}%`;
        if (orgRowData.fmResponseRate !== undefined) orgRowData.fmResponseRate = `${formatResponseRateOneDecimal(orgRowData.fmResponseRate)}%`;
        if (orgRowData.cmResponseRate !== undefined) orgRowData.cmResponseRate = `${formatResponseRateOneDecimal(orgRowData.cmResponseRate)}%`;
        if (orgRowData.saResponseRate !== undefined) orgRowData.saResponseRate = `${formatResponseRateOneDecimal(orgRowData.saResponseRate)}%`;
        if (orgLevelRow.cssReceivedCount === 0) orgRowData.averageCSATScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.averageCSATScore)) orgRowData.averageCSATScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.averageCSATScore);
        if (orgLevelRow.fmResponded === 0) orgRowData.fmAverageCSATScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.fmAverageCSATScore)) orgRowData.fmAverageCSATScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.fmAverageCSATScore);
        if (orgLevelRow.cmResponded === 0) orgRowData.cmAverageCSATScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.cmAverageCSATScore)) orgRowData.cmAverageCSATScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.cmAverageCSATScore);
        if (orgLevelRow.saResponded === 0) orgRowData.saAverageCSATScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.saAverageCSATScore)) orgRowData.saAverageCSATScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.saAverageCSATScore);
        if (!hasAvgCsatValue(orgRowData.averageCSATScore)) orgRowData.avgPredictedScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.avgPredictedScore)) orgRowData.avgPredictedScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.avgPredictedScore);
        if (!hasAvgCsatValue(orgRowData.fmAverageCSATScore)) orgRowData.fmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.fmAvgPredictedScore)) orgRowData.fmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.fmAvgPredictedScore);
        if (!hasAvgCsatValue(orgRowData.cmAverageCSATScore)) orgRowData.cmAvgPredictedScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.cmAvgPredictedScore)) orgRowData.cmAvgPredictedScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.cmAvgPredictedScore);
        if (!hasAvgCsatValue(orgRowData.saAverageCSATScore)) orgRowData.saAvgPredictedScore = '-';
        else if (hasAvgCsatValue(orgLevelRow.saAvgPredictedScore)) orgRowData.saAvgPredictedScore = formatAverageCSATScoreTwoDecimals(orgLevelRow.saAvgPredictedScore);
        if (headers.includes('trendResponseRate')) {
          const firstTrend = trendDataProcessed?.find(f => f.hasData);
          const trend = firstTrend?.orgLevelRow;
          const currRate = orgLevelRow.responseRate != null ? parseFloat(orgLevelRow.responseRate) : null;
          const trendRate = trend?.responseRatePct;
          const currScore = orgLevelRow.averageCSATScore != null ? parseFloat(orgLevelRow.averageCSATScore) : null;
          const trendScore = trend?.avgCSATScore;
          if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
            const diff = Math.round((currRate - trendRate) * 10) / 10;
            if (currRate > trendRate) { orgRowData.trendResponseRate = `(+${diff}%) ↑`; }
            else if (currRate < trendRate) { orgRowData.trendResponseRate = `(${diff}%) ↓`; }
            else { orgRowData.trendResponseRate = `(0%) −`; }
          } else {
            orgRowData.trendResponseRate = '-';
          }
          if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
            const diff = Math.round((currScore - trendScore) * 100) / 100;
            if (currScore > trendScore) { orgRowData.trendAvgCSATScore = `(+${Number(diff).toFixed(2)}) ↑`; }
            else if (currScore < trendScore) { orgRowData.trendAvgCSATScore = `(${Number(diff).toFixed(2)}) ↓`; }
            else { orgRowData.trendAvgCSATScore = `(0.00) −`; }
          } else {
            orgRowData.trendAvgCSATScore = '-';
          }
        }
        const orgDataRow = worksheet.addRow(headers.map(h => (orgRowData[h] !== undefined && orgRowData[h] !== null ? orgRowData[h] : '')));
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          const cell = orgDataRow.getCell(colNumber);
          cell.border = cellBorder;
          cell.font = { bold: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
          const headerKey = headers[colNumber - 1];
          cell.alignment = { horizontal: isTextColumn(headerKey) ? 'left' : 'center', vertical: 'middle' };
        }
        if (responseRateColIndex >= 0) {
          const r = orgLevelRow.responseRate;
          const cell = orgDataRow.getCell(responseRateColIndex + 1);
          if (orgLevelRow.cssReceivedCount === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmResponseRateColIndex >= 0) {
          const r = orgLevelRow.fmResponseRate;
          const cell = orgDataRow.getCell(fmResponseRateColIndex + 1);
          if (orgLevelRow.fmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmResponseRateColIndex >= 0) {
          const r = orgLevelRow.cmResponseRate;
          const cell = orgDataRow.getCell(cmResponseRateColIndex + 1);
          if (orgLevelRow.cmResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saResponseRateColIndex >= 0) {
          const r = orgLevelRow.saResponseRate;
          const cell = orgDataRow.getCell(saResponseRateColIndex + 1);
          if (orgLevelRow.saResponded === 0) { cell.font = { color: { argb: 'FF374151' }, bold: true }; }
          else if (r >= 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else if (r >= 50) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
          else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (averageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(orgDataRow.getCell(averageCSATScoreColIndex + 1), orgLevelRow.cssReceivedCount === 0, orgRowData.averageCSATScore);
        if (fmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(orgDataRow.getCell(fmAverageCSATScoreColIndex + 1), orgLevelRow.fmResponded === 0, orgRowData.fmAverageCSATScore);
        if (cmAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(orgDataRow.getCell(cmAverageCSATScoreColIndex + 1), orgLevelRow.cmResponded === 0, orgRowData.cmAverageCSATScore);
        if (saAverageCSATScoreColIndex >= 0) applyAverageCSATScoreCellStyle(orgDataRow.getCell(saAverageCSATScoreColIndex + 1), orgLevelRow.saResponded === 0, orgRowData.saAverageCSATScore);
        if (avgPredictedScoreColIndex >= 0 && orgLevelRow.cssReceivedCount === 0) {
          const cell = orgDataRow.getCell(avgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (fmAvgPredictedScoreColIndex >= 0 && orgLevelRow.fmResponded === 0) {
          const cell = orgDataRow.getCell(fmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (cmAvgPredictedScoreColIndex >= 0 && orgLevelRow.cmResponded === 0) {
          const cell = orgDataRow.getCell(cmAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (saAvgPredictedScoreColIndex >= 0 && orgLevelRow.saResponded === 0) {
          const cell = orgDataRow.getCell(saAvgPredictedScoreColIndex + 1);
          cell.value = '-';
          cell.border = cellBorder;
          cell.font = { color: { argb: 'FF374151' }, bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (trendResponseRateColIndex >= 0 && orgRowData.trendResponseRate) {
          const trCell = orgDataRow.getCell(trendResponseRateColIndex + 1);
          const trVal = String(orgRowData.trendResponseRate);
          if (trVal.includes('↑')) trCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (trVal.includes('↓')) trCell.font = { color: { argb: 'FFDC2626' }, bold: true };
          trCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        if (trendAvgCSATScoreColIndex >= 0 && orgRowData.trendAvgCSATScore) {
          const tsCell = orgDataRow.getCell(trendAvgCSATScoreColIndex + 1);
          const tsVal = String(orgRowData.trendAvgCSATScore);
          if (tsVal.includes('↑')) tsCell.font = { color: { argb: 'FF16A34A' }, bold: true };
          else if (tsVal.includes('↓')) tsCell.font = { color: { argb: 'FFDC2626' }, bold: true };
          tsCell.alignment = { horizontal: 'center', vertical: 'middle' };
        }
        for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
          orgDataRow.getCell(colNumber).border = cellBorder;
        }
      }

      // Add legend rows: both "Response Rate%" and "Average CSAT Score" legends
      worksheet.addRow([]); // blank row before legends
      
      // Legend 1: Response Rate%
      const legendResponseRateTitleRow = worksheet.addRow([`${RESPONSE_RATE_LABEL} - Legend:`]);
      legendResponseRateTitleRow.getCell(1).font = { bold: true, size: 12 };
      legendResponseRateTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      legendResponseRateTitleRow.eachCell((cell) => { cell.border = cellBorder; });
      
      const rrLegendRow1 = worksheet.addRow(['Red: <50%']);
      const rrLegendRow2 = worksheet.addRow(['Orange: 50% to 74%']);
      const rrLegendRow3 = worksheet.addRow(['Light Green: ≥75%']);
      [rrLegendRow1, rrLegendRow2, rrLegendRow3].forEach((row) => {
        row.eachCell((cell) => { cell.border = cellBorder; });
      });
      rrLegendRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      rrLegendRow1.getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      rrLegendRow2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      rrLegendRow2.getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      rrLegendRow3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      rrLegendRow3.getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      
      worksheet.addRow([]); // blank row between legends
      
      // Legend 2: Average CSAT Score
      const legendAvgCSATTitleRow = worksheet.addRow([`${AVERAGE_CSAT_SCORE_LABEL} - Legend:`]);
      legendAvgCSATTitleRow.getCell(1).font = { bold: true, size: 12 };
      legendAvgCSATTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      legendAvgCSATTitleRow.eachCell((cell) => { cell.border = cellBorder; });
      
      const csatLegendRow1 = worksheet.addRow(['Red: <4']);
      const csatLegendRow2 = worksheet.addRow(['Orange: 4 to 4.49']);
      const csatLegendRow3 = worksheet.addRow(['Light Green: ≥4.5']);
      [csatLegendRow1, csatLegendRow2, csatLegendRow3].forEach((row) => {
        row.eachCell((cell) => { cell.border = cellBorder; });
      });
      csatLegendRow1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      csatLegendRow1.getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      csatLegendRow2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      csatLegendRow2.getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      csatLegendRow3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      csatLegendRow3.getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      
      // Set column widths (wider for Avg. Predicted Score columns so header text wraps properly)
      headers.forEach((header, index) => {
        if (header === 'avgPredictedScore' || header === 'fmAvgPredictedScore' || header === 'cmAvgPredictedScore' || header === 'saAvgPredictedScore') {
          worksheet.getColumn(index + 1).width = 28;
        } else if (header === 'responseRate' || header.includes('Response Rate')) {
          worksheet.getColumn(index + 1).width = 25;
        } else if (header === 'customerName' || header === 'cssSentCount' || header === 'cssReceivedCount' || header.includes('BUSINESS UNIT') || header.includes('businessUnit')) {
          worksheet.getColumn(index + 1).width = 20;
        } else {
          worksheet.getColumn(index + 1).width = 15;
        }
      });
      
      // If Account-wise view + Trend toggled, include the H1 2025 trend table as a second sheet in the same download
      if (!showBuWise && !showTop10 && !showPracticeWise && showTrendSection && trendAccountBuH1?.hasData) {
        const trendWs = workbook.addWorksheet('Trend Analysis (H1 2025)');
        const headerRow2 = trendWs.addRow([ACCOUNT_NAME_LABEL, BUSINESS_UNIT_LABEL, POLLED_LABEL, RESPONDED_LABEL, RESPONSE_RATE_LABEL, AVERAGE_CSAT_SCORE_LABEL]);
        headerRow2.eachCell((cell) => {
          cell.border = cellBorder;
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
        });
        (trendAccountBuH1.rows || []).forEach(r => {
          const rrDisplay = r.responded === 0 ? '0.0%' : `${formatResponseRateOneDecimal(r.responseRatePct)}%`;
          const csatDisplay = r.avgCSATScore != null ? Number(r.avgCSATScore).toFixed(2) : '-';
          const row = trendWs.addRow([r.accountName, r.businessUnit, r.polled, r.responded, rrDisplay, csatDisplay]);
          row.eachCell((cell, colNumber) => {
            cell.border = cellBorder;
            cell.alignment = { horizontal: (colNumber === 1 || colNumber === 2) ? 'left' : 'center', vertical: 'middle', wrapText: true };
          });
        });
        trendWs.getColumn(1).width = 34;
        trendWs.getColumn(2).width = 22;
        trendWs.getColumn(3).width = 14;
        trendWs.getColumn(4).width = 14;
        trendWs.getColumn(5).width = 18;
        trendWs.getColumn(6).width = 20;
      }

      // Generate and download the file with name according to current view
      const viewSuffix = showBuWise ? 'BU_Wise' : (showTop10 ? 'Top10_Accounts' : 'Account_Wise');
      const downloadFileName = `Account_BU_Wise_Response_Rate_${viewSuffix}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading data:', error);
      alert('Error downloading data. Please try again.');
    }
  };

  const downloadTrendData = async () => {
    if (!trendDataProcessed?.length || trendDataProcessed.every(f => !f.hasData)) {
      alert('No trend data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const cellBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      trendDataProcessed.forEach((fileData, idx) => {
        const wsName = (fileData.saveName || `Trend_${idx + 1}`).replace(/[\\/*?:\[\]]/g, '_').substring(0, 31);
        const ws = workbook.addWorksheet(wsName);
        const headers = ['Business Unit', 'Polled', 'Responded', 'Response Rate %', 'Average CSAT Score', 'Avg. Predicted Score for the Surveys Responses Received', 'YEAR - QUARTER'];
        const headerRow = ws.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headers.forEach((_, c) => { headerRow.getCell(c + 1).border = cellBorder; });

        if (fileData.hasData) {
          fileData.rows.forEach(row => {
            const r = ws.addRow([
              normalizeBusinessUnitDisplay(row.businessUnit),
              row.polled,
              row.responded,
              row.responded === 0 ? '0.0%' : `${formatResponseRateOneDecimal(row.responseRatePct)}%`,
              row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-',
              row.responded > 0 && row.avgPredictedScore != null ? row.avgPredictedScore.toFixed(2) : '-',
              row.yearQuarter || '-'
            ]);
            r.alignment = { horizontal: 'center', vertical: 'middle' };
            [1, 2, 3, 4, 5, 6, 7].forEach(c => { r.getCell(c).border = cellBorder; });
            if (row.responded > 0) {
              const col = getResponseRateColor(row.responseRatePct, false);
              const bgHex = col.backgroundColor?.replace('#', '');
              if (bgHex && col.backgroundColor !== 'transparent') r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex.toUpperCase() } };
              const fgHex = col.color?.replace('#', '');
              if (fgHex) r.getCell(4).font = { color: { argb: 'FF' + fgHex.toUpperCase() } };
              // Apply Average CSAT Score color coding to column 5
              const avgCol = getAvgCSATScoreColor(row.avgCSATScore, false);
              const avgBgHex = avgCol.backgroundColor?.replace('#', '');
              if (avgBgHex && avgCol.backgroundColor !== 'transparent') r.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + avgBgHex.toUpperCase() } };
              const avgFgHex = avgCol.color?.replace('#', '');
              if (avgFgHex) r.getCell(5).font = { color: { argb: 'FF' + avgFgHex.toUpperCase() } };
            }
          });
          if (fileData.orgLevelRow) {
            const org = fileData.orgLevelRow;
            const orgRow = ws.addRow([
              org.businessUnit,
              org.polled,
              org.responded,
              org.responded === 0 ? '0.0%' : `${formatResponseRateOneDecimal(org.responseRatePct)}%`,
              org.avgCSATScore != null ? org.avgCSATScore.toFixed(2) : '-',
              org.responded > 0 && org.avgPredictedScore != null ? org.avgPredictedScore.toFixed(2) : '-',
              org.yearQuarter || '-'
            ]);
            orgRow.font = { bold: true };
            orgRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
            orgRow.alignment = { horizontal: 'center', vertical: 'middle' };
            [1, 2, 3, 4, 5, 6, 7].forEach(c => { orgRow.getCell(c).border = cellBorder; });
            if (org.responded > 0) {
              const col = getResponseRateColor(org.responseRatePct, false);
              const bgHex = col.backgroundColor?.replace('#', '');
              if (bgHex && col.backgroundColor !== 'transparent') orgRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex.toUpperCase() } };
              const fgHex = col.color?.replace('#', '');
              if (fgHex) orgRow.getCell(4).font = { color: { argb: 'FF' + fgHex.toUpperCase() } };
              // Apply Average CSAT Score color coding to column 5
              const avgCol = getAvgCSATScoreColor(org.avgCSATScore, false);
              const avgBgHex = avgCol.backgroundColor?.replace('#', '');
              if (avgBgHex && avgCol.backgroundColor !== 'transparent') orgRow.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + avgBgHex.toUpperCase() } };
              const avgFgHex = avgCol.color?.replace('#', '');
              if (avgFgHex) orgRow.getCell(5).font = { bold: true, color: { argb: 'FF' + avgFgHex.toUpperCase() } };
            }
          }
        }
      });
      // Add BU-wise Response Rate % comparison sheet (Dashboard: Account/BU wise | Trend: uploaded file e.g. Trend-Analysis-H12025 – YEAR - QUARTER comparison)
      if (responseRateComparisonChartData.length > 0) {
        const wsRR = workbook.addWorksheet('Response Rate % Comparison');
        const rrHeaders = ['Business Unit', 'Trend Analysis (from uploaded data)', 'YEAR - QUARTER (Trend)', 'Account/BU wise Dashboard', 'YEAR - QUARTER (Dashboard)'];
        const rrHeaderRow = wsRR.addRow(rrHeaders);
        rrHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        rrHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        rrHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        rrHeaders.forEach((_, c) => { rrHeaderRow.getCell(c + 1).border = cellBorder; });
        responseRateComparisonChartData.forEach(row => {
          const r = wsRR.addRow([
            row.name,
            row.trend != null ? `${formatResponseRateOneDecimal(row.trend)}%` : '-',
            row.yearQuarterTrend || '-',
            row.dashboard != null ? `${formatResponseRateOneDecimal(row.dashboard)}%` : '-',
            row.yearQuarterDashboard || '-'
          ]);
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          [1, 2, 3, 4, 5].forEach(c => { r.getCell(c).border = cellBorder; });
        });
        wsRR.getColumn(1).width = 22;
        wsRR.getColumn(2).width = 35;
        wsRR.getColumn(3).width = 22;
        wsRR.getColumn(4).width = 28;
        wsRR.getColumn(5).width = 22;
      }
      // Add BU-wise Average CSAT Score comparison sheet (Dashboard: Account/BU wise Response Rate | Trend: e.g. Trend-Analysis-H12025 – YEAR - QUARTER comparison)
      if (avgCSATScoreComparisonChartData.length > 0) {
        const wsCSAT = workbook.addWorksheet('Average CSAT Score Comparison');
        const csatHeaders = ['Business Unit', 'Trend Analysis (from uploaded data)', 'YEAR - QUARTER (Trend)', 'Account/BU wise Dashboard', 'YEAR - QUARTER (Dashboard)'];
        const csatHeaderRow = wsCSAT.addRow(csatHeaders);
        csatHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        csatHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        csatHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        csatHeaders.forEach((_, c) => { csatHeaderRow.getCell(c + 1).border = cellBorder; });
        avgCSATScoreComparisonChartData.forEach(row => {
          const r = wsCSAT.addRow([
            row.name,
            row.trend != null ? row.trend.toFixed(2) : '-',
            row.yearQuarterTrend || '-',
            row.dashboard != null ? row.dashboard.toFixed(2) : '-',
            row.yearQuarterDashboard || '-'
          ]);
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          [1, 2, 3, 4, 5].forEach(c => { r.getCell(c).border = cellBorder; });
        });
        wsCSAT.getColumn(1).width = 22;
        wsCSAT.getColumn(2).width = 35;
        wsCSAT.getColumn(3).width = 22;
        wsCSAT.getColumn(4).width = 28;
        wsCSAT.getColumn(5).width = 22;
      }
      // Add Org level Response Rate % comparison sheet (with Average CSAT Score)
      if (orgLevelResponseRateWithAvgCSATChartData.length > 0) {
        const wsOrgRR = workbook.addWorksheet('Org level Response Rate % Comparison');
        const orgRRHeaders = ['Source', 'Response Rate (%)', 'Average CSAT Score', 'YEAR - QUARTER'];
        const orgRRHeaderRow = wsOrgRR.addRow(orgRRHeaders);
        orgRRHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        orgRRHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        orgRRHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        orgRRHeaders.forEach((_, c) => { orgRRHeaderRow.getCell(c + 1).border = cellBorder; });
        orgLevelResponseRateWithAvgCSATChartData.forEach(row => {
          const r = wsOrgRR.addRow([
            row.name,
            row.value != null ? `${formatResponseRateOneDecimal(row.value)}%` : '-',
            row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-',
            row.yearQuarter || '-'
          ]);
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          [1, 2, 3, 4].forEach(c => { r.getCell(c).border = cellBorder; });
        });
        wsOrgRR.getColumn(1).width = 35;
        wsOrgRR.getColumn(2).width = 18;
        wsOrgRR.getColumn(3).width = 22;
        wsOrgRR.getColumn(4).width = 22;
      }
      // Add Org level Average CSAT Score comparison sheet
      if (orgLevelAvgCSATScoreComparisonChartData.length > 0) {
        const wsOrgCSAT = workbook.addWorksheet('Org level Avg CSAT Score Comparison');
        const orgCSATHeaders = ['Source', 'Average CSAT Score', 'YEAR - QUARTER'];
        const orgCSATHeaderRow = wsOrgCSAT.addRow(orgCSATHeaders);
        orgCSATHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        orgCSATHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        orgCSATHeaderRow.alignment = { horizontal: 'center', vertical: 'middle' };
        orgCSATHeaders.forEach((_, c) => { orgCSATHeaderRow.getCell(c + 1).border = cellBorder; });
        orgLevelAvgCSATScoreComparisonChartData.forEach(row => {
          const r = wsOrgCSAT.addRow([
            row.name,
            row.value != null ? row.value.toFixed(2) : '-',
            row.yearQuarter || '-'
          ]);
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          [1, 2, 3].forEach(c => { r.getCell(c).border = cellBorder; });
        });
        wsOrgCSAT.getColumn(1).width = 35;
        wsOrgCSAT.getColumn(2).width = 22;
        wsOrgCSAT.getColumn(3).width = 22;
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Trend_Analysis_Response_Rate.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download trend data error:', err);
      alert('Failed to download trend data');
    }
  };

  // Download Account-wise Trend Analysis (H1 2025 reference) table
  const downloadAccountWiseH1ReferenceData = async () => {
    if (!trendAccountBuH1?.hasData || !(trendAccountBuH1.rows || []).length) {
      alert('No Account-wise H1 2025 reference data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Trend Analysis (H1 2025)');
      const cellBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      const headers = [ACCOUNT_NAME_LABEL, BUSINESS_UNIT_LABEL, POLLED_LABEL, RESPONDED_LABEL, RESPONSE_RATE_LABEL, AVERAGE_CSAT_SCORE_LABEL];
      const headerRow = ws.addRow(headers);
      headerRow.eachCell((cell) => {
        cell.border = cellBorder;
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      });

      (trendAccountBuH1.rows || []).forEach(r => {
        const rrVal = r.responded === 0 ? 0 : r.responseRatePct;
        const rrDisplay = r.responded === 0 ? '0.0%' : `${formatResponseRateOneDecimal(rrVal)}%`;
        const csatDisplay = r.avgCSATScore != null ? Number(r.avgCSATScore).toFixed(2) : '-';
        const row = ws.addRow([r.accountName, r.businessUnit, r.polled, r.responded, rrDisplay, csatDisplay]);
        row.eachCell((cell, colNumber) => {
          cell.border = cellBorder;
          cell.alignment = { horizontal: (colNumber === 1 || colNumber === 2) ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });

        // Apply Response Rate % color coding to column 5
        const rrColor = getResponseRateColor(rrVal, r.responded === 0);
        const rrBgHex = rrColor.backgroundColor?.replace('#', '');
        const rrFgHex = rrColor.color?.replace('#', '');
        if (rrBgHex && rrColor.backgroundColor !== 'transparent') row.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + rrBgHex.toUpperCase() } };
        if (rrFgHex) row.getCell(5).font = { color: { argb: 'FF' + rrFgHex.toUpperCase() }, bold: true };

        // Apply Average CSAT Score color coding to column 6
        const csColor = getAvgCSATScoreColor(r.avgCSATScore, r.responded === 0);
        const csBgHex = csColor.backgroundColor?.replace('#', '');
        const csFgHex = csColor.color?.replace('#', '');
        if (csBgHex && csColor.backgroundColor !== 'transparent') row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + csBgHex.toUpperCase() } };
        if (csFgHex) row.getCell(6).font = { color: { argb: 'FF' + csFgHex.toUpperCase() }, bold: true };
      });

      ws.getColumn(1).width = 34;
      ws.getColumn(2).width = 22;
      ws.getColumn(3).width = 14;
      ws.getColumn(4).width = 14;
      ws.getColumn(5).width = 18;
      ws.getColumn(6).width = 20;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Trend_Analysis_H1_2025_Reference.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Account-wise H1 reference data:', err);
      alert('Failed to download H1 2025 reference data');
    }
  };

  const downloadTop10TrendData = async () => {
    if (!trendTop10DataProcessed?.length || trendTop10DataProcessed.every(f => !f.hasData)) {
      alert('No Top 10 trend data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const cellBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      
      trendTop10DataProcessed.forEach((fileData, idx) => {
        let wsName = (fileData.saveName || `Top10_Trend_${idx + 1}`).replace(/[\\/*?:\[\]]/g, '_').substring(0, 31).trim();
        if (!wsName) wsName = `Top10_Trend_${idx + 1}`;
        const ws = workbook.addWorksheet(wsName);
        // Match dashboard: Account Name, then H1 2025 (5 cols: #Polled, #Responded, Business Unit, Response Rate %, Average CSAT Score)
        const row1Values = ['Account Name', 'H1 2025', '', '', '', ''];
        ws.addRow(row1Values);
        ws.mergeCells(1, 2, 1, 6);
        const row1 = ws.getRow(1);
        row1.getCell(1).font = { bold: true };
        row1.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        row1.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        row1.getCell(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        row1.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
        for (let c = 1; c <= 6; c++) row1.getCell(c).border = cellBorder;
        const headerRow = ws.addRow(['', '#Polled', '#Responded', 'Business Unit', 'Response Rate %', 'Average CSAT Score']);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        for (let c = 1; c <= 6; c++) headerRow.getCell(c).border = cellBorder;

        const addDataRow = (row, fillColor) => {
          const r = ws.addRow([
            row.accountName,
            row.polled,
            row.responded,
            row.businessUnit,
            row.responded === 0 ? '0.0%' : `${formatResponseRateOneDecimal(row.responseRatePct)}%`,
            row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-'
          ]);
          r.alignment = { horizontal: 'center', vertical: 'middle' };
          r.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
          if (fillColor) {
            r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
            r.font = { bold: true };
          }
          for (let c = 1; c <= 6; c++) r.getCell(c).border = cellBorder;
          if (row.responded > 0) {
            const col = getResponseRateColor(row.responseRatePct, false);
            const bgHex = col.backgroundColor?.replace('#', '');
            if (bgHex && col.backgroundColor !== 'transparent') r.getCell(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + bgHex.toUpperCase() } };
            const fgHex = col.color?.replace('#', '');
            if (fgHex) r.getCell(5).font = { ...r.getCell(5).font, color: { argb: 'FF' + fgHex.toUpperCase() } };
            const avgCol = getAvgCSATScoreColor(row.avgCSATScore, false);
            const avgBgHex = avgCol.backgroundColor?.replace('#', '');
            if (avgBgHex && avgCol.backgroundColor !== 'transparent') r.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + avgBgHex.toUpperCase() } };
            const avgFgHex = avgCol.color?.replace('#', '');
            if (avgFgHex) r.getCell(6).font = { ...r.getCell(6).font, color: { argb: 'FF' + avgFgHex.toUpperCase() } };
          }
        };
        if (fileData.hasData) {
          fileData.rows.forEach(row => addDataRow(row, null));
          if (fileData.top10GrandTotalRow) addDataRow(fileData.top10GrandTotalRow, 'FFFFF2CC');
          if (fileData.otherAccountsRow) addDataRow(fileData.otherAccountsRow, 'FF93CCEA');
          if (fileData.overallRow) addDataRow(fileData.overallRow, 'FFE4DFEC');
        }
        ws.getColumn(1).width = 30;
        ws.getColumn(2).width = 10;
        ws.getColumn(3).width = 12;
        ws.getColumn(4).width = 18;
        ws.getColumn(5).width = 16;
        ws.getColumn(6).width = 20;
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Top10_Trend_Analysis_Response_Rate.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Top 10 trend data error:', err);
      alert('Failed to download Top 10 trend data');
    }
  };

  return (
    <DashboardContainer data-component="AccountBUWiseResponseRateDashboard" data-account-label={ACCOUNT_NAME_LABEL}>
      <DashboardHeader>
        <HeaderTitle>
          📊 Account/BU wise Response Rate Dashboard
        </HeaderTitle>
        {csatCycleStartDateFormatted && (
          <div style={{ fontSize: '0.875rem', opacity: 0.95, marginTop: '0.25rem' }}>
            Polled and Responded counts include only rows where CSAT SENT DATE and CSAT RECEIVED DATE ≥ CSAT Cycle Start Date ({csatCycleStartDateFormatted}, MM-DD-YYYY).
          </div>
        )}
        <ButtonContainer>
          <button
            onClick={() => { setShowBuWise(false); setShowTop10(false); setShowPracticeWise(false); }}
            style={{
              background: !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: !showBuWise && !showTop10 && !showPracticeWise ? '#1e3a8a' : 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              minHeight: '32px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
            }}
          >
            Show Account-wise View
          </button>

          <button
            onClick={() => { setShowBuWise(true); setShowTop10(false); setShowPracticeWise(false); }}
            style={{
              background: showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: showBuWise ? '#1e3a8a' : 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              minHeight: '32px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
            }}
          >
            BU wise Response Rate Dashboard
          </button>

          <button
            onClick={() => { setShowBuWise(false); setShowTop10(true); setShowPracticeWise(false); }}
            style={{
              background: showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: showTop10 ? '#1e3a8a' : 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              minHeight: '32px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
            }}
          >
            Top 10 account - Response Rate Dashboard
          </button>

          <button
            onClick={() => setShowTrendSection(prev => !prev)}
            style={{
              background: showTrendSection ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: showTrendSection ? '#1e3a8a' : 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              minHeight: '32px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = showTrendSection ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
            }}
          >
            <TrendingUp size={16} />
            {showTrendSection ? 'Hide trend analysis' : 'View trend analysis'}
          </button>

          <DownloadButton onClick={downloadData}>
            <Download size={16} />
            Download Data
          </DownloadButton>

          {onBack && (
            <BackButton onClick={onBack} aria-label="Back" title="Back">
              <ChevronLeft size={16} />
              Back
            </BackButton>
          )}

          <button
            onClick={() => { setShowBuWise(false); setShowTop10(false); setShowPracticeWise(true); }}
            style={{
              background: showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
              color: showPracticeWise ? '#1e3a8a' : 'white',
              border: '2px solid white',
              borderRadius: '8px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              minHeight: '32px',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
            }}
          >
            Practice wise Response Rate Dashboard
          </button>
        </ButtonContainer>
      </DashboardHeader>


      {processedData.data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <p>No data available.</p>
        </div>
      ) : (
        <React.Fragment>
          {showPracticeWise ? (
            <div style={{ marginTop: '1rem' }}>
              {/* Dashboard 1: New_customer_feedback_analysis_New-Practice.xlsx from Upload data for trend analysis */}
              <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#166534' }}>Practice wise Response Rate Dashboard</h2>
                  {practiceWiseTableData.length > 0 && (
                    <button type="button" onClick={downloadPracticeWiseData} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Download size={16} />
                      Download Excel
                    </button>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#15803d' }}>
                  Data from the <strong>Customer Success Survey Status</strong> report. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}, MM-DD-YYYY). Response Rate % = #Responded ÷ #Polled × 100. Average CSAT Score = Avg(ACTUAL SCORE). Group by Practice.
                </p>
                {!csatCycleStartDateFormatted && (
                  <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>CSAT cycle start date is required. Set it in the main upload flow.</div>
                )}
                {csatCycleStartDateFormatted && !practiceTrendSources.first && (
                  <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                    No Practice data found in the <strong>Customer Success Survey Status</strong> report.
                  </div>
                )}
                {csatCycleStartDateFormatted && practiceTrendSources.first && practiceWiseTableData.length === 0 && (
                  <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>No rows with date ≥ CSAT cycle start.</div>
                )}
                {practiceWiseTableData.length > 0 && (
                  <TableContainer>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <tr>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th colSpan={4} style={{ textAlign: 'center' }}>
                              {acsatCycle || 'H2 2025'}
                            </Th>
                            {showTrendSection && (
                              <Th colSpan={2} style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>
                                {trendHeaderLabel}
                              </Th>
                            )}
                          </tr>
                          <tr>
                            <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                            <Th style={{ textAlign: 'center' }}>Practice</Th>
                            <Th style={{ textAlign: 'center' }}>#Polled</Th>
                            <Th style={{ textAlign: 'center' }}>#Responded</Th>
                            <Th style={{ textAlign: 'center' }}>Response Rate %</Th>
                            <Th style={{ textAlign: 'center' }}>Average CSAT Score</Th>
                            {showTrendSection && <Th style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>Response Rate Trend</Th>}
                            {showTrendSection && <Th style={{ textAlign: 'center', backgroundColor: '#BDD7EE', color: '#000000' }}>Average CSAT Score Trend</Th>}
                          </tr>
                        </thead>
                        <tbody>
                          {practiceWiseTableDataWithTrend.map((row) => {
                            const rrDiff = row.responseRateTrendDiff;
                            const csatDiff = row.avgCSATTrendDiff;
                            const rrTrendDisplay = rrDiff == null ? '-' : `(${rrDiff >= 0 ? '+' : ''}${Number(rrDiff).toFixed(1)}%) ${rrDiff > 0 ? '\u2191' : rrDiff < 0 ? '\u2193' : '\u2212'}`;
                            const csatTrendDisplay = csatDiff == null ? '-' : `(${csatDiff >= 0 ? '+' : ''}${Number(csatDiff).toFixed(2)}) ${csatDiff > 0 ? '\u2191' : csatDiff < 0 ? '\u2193' : '\u2212'}`;
                            const rrTrendColor = rrDiff == null ? {} : rrDiff > 0 ? { color: '#16a34a' } : rrDiff < 0 ? { color: '#dc2626' } : {};
                            const csatTrendColor = csatDiff == null ? {} : csatDiff > 0 ? { color: '#16a34a' } : csatDiff < 0 ? { color: '#dc2626' } : {};
                            return (
                              <tr key={`p1-${row.practice}`}>
                                <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.srNo}</Td>
                                <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.practice}</Td>
                                <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                                <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                                <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                                  {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                                </Td>
                                <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getAvgCSATScoreColor(row.avgActualScore, row.responded === 0) }}>
                                  {row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-'}
                                </Td>
                                {showTrendSection && (
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...rrTrendColor }}>
                                    {rrTrendDisplay}
                                  </Td>
                                )}
                                {showTrendSection && (
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...csatTrendColor }}>
                                    {csatTrendDisplay}
                                  </Td>
                                )}
                              </tr>
                            );
                          })}
                          {practiceWiseOrgRowWithTrend && (
                            (() => {
                              const row = practiceWiseOrgRowWithTrend;
                              const rrDiff = row.responseRateTrendDiff;
                              const csatDiff = row.avgCSATTrendDiff;
                              const rrTrendDisplay = rrDiff == null ? '-' : `(${rrDiff >= 0 ? '+' : ''}${Number(rrDiff).toFixed(1)}%) ${rrDiff > 0 ? '\u2191' : rrDiff < 0 ? '\u2193' : '\u2212'}`;
                              const csatTrendDisplay = csatDiff == null ? '-' : `(${csatDiff >= 0 ? '+' : ''}${Number(csatDiff).toFixed(2)}) ${csatDiff > 0 ? '\u2191' : csatDiff < 0 ? '\u2193' : '\u2212'}`;
                              const rrTrendColor = rrDiff == null ? {} : rrDiff > 0 ? { color: '#16a34a' } : rrDiff < 0 ? { color: '#dc2626' } : {};
                              const csatTrendColor = csatDiff == null ? {} : csatDiff > 0 ? { color: '#16a34a' } : csatDiff < 0 ? { color: '#dc2626' } : {};
                              const orgRowStyle = { backgroundColor: '#e2e8f0', fontWeight: '700' };
                              return (
                                <tr key="p1-org-level" style={orgRowStyle}>
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle }}></Td>
                                  <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', ...orgRowStyle }}>{row.practice}</Td>
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle }}>{row.polled}</Td>
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle }}>{row.responded}</Td>
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle, ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                                    {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                                  </Td>
                                  <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle, ...getAvgCSATScoreColor(row.avgActualScore, row.responded === 0) }}>
                                    {row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-'}
                                  </Td>
                                  {showTrendSection && <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle, ...rrTrendColor }}>{rrTrendDisplay}</Td>}
                                  {showTrendSection && <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...orgRowStyle, ...csatTrendColor }}>{csatTrendDisplay}</Td>}
                                </tr>
                              );
                            })()
                          )}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TableContainer>
                )}
              </div>

              {/* Dashboard 2: Trend-Analysis-H12025-Practice.xlsx from Upload data for trend analysis */}
              <div style={{ padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e40af' }}>Practice wise Response Rate – Trend Analysis</h2>
                  {practiceWiseTableDataSecond.length > 0 && (
                    <button type="button" onClick={downloadPracticeWiseDataSecond} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Download size={16} />
                      Download Excel
                    </button>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#1d4ed8' }}>
                  Data from <strong>Trend-Analysis-H12025.xlsx</strong> (Sheet2: &quot;CSAT sent and received Report&quot;) in <code>public/data/</code>. Same columns: Sr. No., Practice, #Polled, #Responded, Response Rate %, Average CSAT Score. Date ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}).
                </p>
                {csatCycleStartDateFormatted && !practiceTrendSources.second && (
                  <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                    No Practice trend data found. Ensure <strong>Trend-Analysis-H12025.xlsx</strong> exists in <code>public/data/</code> and its Sheet2 (&quot;CSAT sent and received Report&quot;) contains a <strong>Practice</strong> column.
                  </div>
                )}
                {csatCycleStartDateFormatted && practiceTrendSources.second && practiceWiseTableDataSecond.length === 0 && (
                  <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>No rows with date ≥ CSAT cycle start in trend file.</div>
                )}
                {practiceWiseTableDataSecond.length > 0 && (
                  <TableContainer>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <tr>
                            <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                            <Th style={{ textAlign: 'center' }}>Practice</Th>
                            <Th style={{ textAlign: 'center' }}>#Polled</Th>
                            <Th style={{ textAlign: 'center' }}>#Responded</Th>
                            <Th style={{ textAlign: 'center' }}>Response Rate %</Th>
                            <Th style={{ textAlign: 'center' }}>Average CSAT Score</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {practiceWiseTableDataSecond.map((row) => (
                            <tr key={`p2-${row.practice}`}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.srNo}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.practice}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                                {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getAvgCSATScoreColor(row.avgActualScore, row.responded === 0) }}>
                                {row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          ))}
                          {practiceWiseSecondOrgRow && (
                            <tr key="p2-org-level" style={{ backgroundColor: '#e2e8f0', fontWeight: '700' }}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700' }}></Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700' }}>{practiceWiseSecondOrgRow.practice}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700' }}>{practiceWiseSecondOrgRow.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700' }}>{practiceWiseSecondOrgRow.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700', ...getResponseRateColor(practiceWiseSecondOrgRow.responseRatePct, practiceWiseSecondOrgRow.responded === 0) }}>
                                {practiceWiseSecondOrgRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(practiceWiseSecondOrgRow.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', backgroundColor: '#e2e8f0', fontWeight: '700', ...getAvgCSATScoreColor(practiceWiseSecondOrgRow.avgActualScore, practiceWiseSecondOrgRow.responded === 0) }}>
                                {practiceWiseSecondOrgRow.avgActualScore != null ? Number(practiceWiseSecondOrgRow.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TableContainer>
                )}
              </div>

              {/* Dashboard 3 (requested): Practice + Business Unit Response Rate (Sheet2 "CSAT sent and received Report") */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#9a3412' }}>Practice + Business Unit Response Rate Dashboard</h2>
                  {filteredPracticeBuWiseTableData.length > 0 && (
                    <button type="button" onClick={downloadPracticeBuWiseData} style={{ background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Download size={16} />
                      Download Excel
                    </button>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#9a3412' }}>
                  From the <strong>Customer Success Survey Status</strong> report: group by <strong>Practice</strong> and <strong>BUSINESS UNIT</strong>. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}). Response Rate % = #Responded ÷ #Polled × 100. Average CSAT Score = Avg(ACTUAL SCORE) for received rows.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <label htmlFor="practice-bu-filter" style={{ fontSize: '0.875rem', color: '#9a3412', fontWeight: 600 }}>Business Unit Filter:</label>
                  <select
                    id="practice-bu-filter"
                    value={practiceBusinessUnitFilter}
                    onChange={(e) => setPracticeBusinessUnitFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.6rem', border: '1px solid #fdba74', borderRadius: '8px', background: 'white', color: '#7c2d12', minWidth: '180px' }}
                  >
                    <option value="">All Business Units</option>
                    {practiceBusinessUnitOptions.map((bu) => (
                      <option key={`practice-bu-opt-${bu}`} value={bu}>{bu}</option>
                    ))}
                  </select>
                </div>
                {!csatCycleStartDateFormatted && (
                  <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>CSAT cycle start date is required. Set it in the main upload flow.</div>
                )}
                {csatCycleStartDateFormatted && practiceTrendSources.first && filteredPracticeBuWiseTableData.length === 0 && (
                  <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>No rows with date ≥ CSAT cycle start (or missing Practice/BUSINESS UNIT columns) in the Customer Success Survey Status report.</div>
                )}
                {filteredPracticeBuWiseTableData.length > 0 && (
                  <TableContainer>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <tr>
                            <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                            <Th style={{ textAlign: 'center' }}>Practice</Th>
                            <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                            <Th colSpan={4} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                          </tr>
                          <tr>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}>#Polled</Th>
                            <Th style={{ textAlign: 'center' }}>#Responded</Th>
                            <Th style={{ textAlign: 'center' }}>Response Rate %</Th>
                            <Th style={{ textAlign: 'center' }}>Average CSAT Score</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredPracticeBuWiseTableData.map((row) => (
                            <tr key={`p3-${row.practice}-${row.businessUnit}`}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.srNo}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.practice}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                                {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getAvgCSATScoreColor(row.avgActualScore, row.responded === 0) }}>
                                {row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          ))}
                          {practiceBuWiseOrgRow && (
                            <tr key="p3-org-level" style={{ fontWeight: '700', backgroundColor: '#e2e8f0' }}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}></Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{practiceBuWiseOrgRow.practice}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}></Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{practiceBuWiseOrgRow.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{practiceBuWiseOrgRow.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0', ...getResponseRateColor(practiceBuWiseOrgRow.responseRatePct, practiceBuWiseOrgRow.responded === 0) }}>
                                {practiceBuWiseOrgRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(practiceBuWiseOrgRow.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0', ...getAvgCSATScoreColor(practiceBuWiseOrgRow.avgActualScore, practiceBuWiseOrgRow.responded === 0) }}>
                                {practiceBuWiseOrgRow.avgActualScore != null ? Number(practiceBuWiseOrgRow.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TableContainer>
                )}
              </div>

              {/* Dashboard 4 (requested): Business Unit + Practice Response Rate (Sheet2 "CSAT sent and received Report") */}
              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#5b21b6' }}>Business Unit + Practice Response Rate Dashboard</h2>
                  {filteredBuPracticeWiseTableData.length > 0 && (
                    <button type="button" onClick={downloadBuPracticeWiseData} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Download size={16} />
                      Download Excel
                    </button>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#5b21b6' }}>
                  From the <strong>Customer Success Survey Status</strong> report: group by <strong>BUSINESS UNIT</strong> and <strong>Practice</strong>. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}). Response Rate % = #Responded ÷ #Polled × 100. Average CSAT Score = Avg(ACTUAL SCORE) for received rows.
                </p>
                {!csatCycleStartDateFormatted && (
                  <div style={{ padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>CSAT cycle start date is required. Set it in the main upload flow.</div>
                )}
                {csatCycleStartDateFormatted && practiceTrendSources.first && filteredBuPracticeWiseTableData.length === 0 && (
                  <div style={{ padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', color: '#64748b' }}>No rows with date ≥ CSAT cycle start (or missing Practice/BUSINESS UNIT columns) in the Customer Success Survey Status report.</div>
                )}
                {filteredBuPracticeWiseTableData.length > 0 && (
                  <TableContainer>
                    <TableWrapper>
                      <Table>
                        <thead>
                          <tr>
                            <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                            <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                            <Th style={{ textAlign: 'center' }}>Practice</Th>
                            <Th colSpan={4} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                          </tr>
                          <tr>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}></Th>
                            <Th style={{ textAlign: 'center' }}>#Polled</Th>
                            <Th style={{ textAlign: 'center' }}>#Responded</Th>
                            <Th style={{ textAlign: 'center' }}>Response Rate %</Th>
                            <Th style={{ textAlign: 'center' }}>Average CSAT Score</Th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBuPracticeWiseTableData.map((row) => (
                            <tr key={`p4-${row.businessUnit}-${row.practice}`}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.srNo}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.practice}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db' }}>{row.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                                {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', ...getAvgCSATScoreColor(row.avgActualScore, row.responded === 0) }}>
                                {row.avgActualScore != null ? Number(row.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          ))}
                          {buPracticeWiseOrgRow && (
                            <tr key="p4-org-level" style={{ fontWeight: '700', backgroundColor: '#e2e8f0' }}>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}></Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}></Td>
                              <Td style={{ textAlign: 'left', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{buPracticeWiseOrgRow.practice}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{buPracticeWiseOrgRow.polled}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0' }}>{buPracticeWiseOrgRow.responded}</Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0', ...getResponseRateColor(buPracticeWiseOrgRow.responseRatePct, buPracticeWiseOrgRow.responded === 0) }}>
                                {buPracticeWiseOrgRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(buPracticeWiseOrgRow.responseRatePct)}%
                              </Td>
                              <Td style={{ textAlign: 'center', border: '1px solid #d1d5db', fontWeight: '700', backgroundColor: '#e2e8f0', ...getAvgCSATScoreColor(buPracticeWiseOrgRow.avgActualScore, buPracticeWiseOrgRow.responded === 0) }}>
                                {buPracticeWiseOrgRow.avgActualScore != null ? Number(buPracticeWiseOrgRow.avgActualScore).toFixed(2) : '-'}
                              </Td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </TableWrapper>
                  </TableContainer>
                )}
              </div>
            </div>
          ) : (
          <React.Fragment>
          {/* Search Section - Only show for account-wise view */}
          {!showBuWise && !showTop10 && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label htmlFor="customerNameSearch" style={{
                  fontWeight: '500',
                  fontSize: '0.8rem',
                  color: '#374151',
                  minWidth: '100px'
                }}>
                  Search Account:
                </label>
                <input
                  id="customerNameSearch"
                  type="text"
                  value={customerNameSearch}
                  onChange={(e) => setCustomerNameSearch(e.target.value)}
                  placeholder="Type account name to search..."
                  style={{
                    padding: '0.35rem 0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    minWidth: '220px',
                    background: 'white'
                  }}
                />
                {customerNameSearch && (
                  <button
                    onClick={() => setCustomerNameSearch('')}
                    style={{
                      padding: '0.35rem 0.75rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search
                  </button>
                )}
              </div>

              {customerNameSearch && (
                <div style={{
                  marginTop: '0.35rem',
                  fontSize: '0.8rem',
                  color: '#6b7280'
                }}>
                  Showing {filteredData.length} of {processedData.data.length} accounts
                  {customerNameSearch && ` (searched: ${customerNameSearch})`}
                </div>
              )}
            </div>
          )}


           {/* Legend: separate sections for Response Rate% and Average CSAT Score */}
           <LegendContainer style={{ flexDirection: 'column', alignItems: 'stretch' }}>
             <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
               <LegendSection>
                 <LegendSectionTitle>{RESPONSE_RATE_LABEL}</LegendSectionTitle>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem' }}>
             <LegendItem>
               <LegendColor color="#FF0000" />
               <span>Red: &lt;50%</span>
             </LegendItem>
             <LegendItem>
               <LegendColor color="#FFA500" />
               <span>Orange: 50% to 74%</span>
             </LegendItem>
            <LegendItem>
              <LegendColor color="#c6efce" />
              <span>Light Green: ≥75%</span>
            </LegendItem>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#6b7280', fontWeight: 600 }}>
                  {RESPONSE_RATE_LABEL} = {RESPONDED_LABEL} ÷ {POLLED_LABEL} × 100
                </div>
              </LegendSection>
               <LegendSection>
                 <LegendSectionTitle>{AVERAGE_CSAT_SCORE_LABEL}</LegendSectionTitle>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem 1.5rem' }}>
                   <LegendItem>
                     <LegendColor color="#FF0000" />
                     <span>Red: &lt;4</span>
             </LegendItem>
                   <LegendItem>
                     <LegendColor color="#FFA500" />
                     <span>Orange: 4 to 4.49</span>
                   </LegendItem>
                  <LegendItem>
                    <LegendColor color="#c6efce" />
                    <span>Light Green: ≥4.5</span>
                  </LegendItem>
                </div>
              </LegendSection>
             </div>
           </LegendContainer>

           {/* CUSTOMER_ID column omitted in all views: Show All Customers, Top 10 account, Show Account-wise View */}
           <TableContainer>
            <TableWrapper>
              <Table>
                <thead>
                  {!showBuWise ? (
                    <>
                      <tr>
                        <Th rowSpan={2}>Sr. No.</Th>
                        <Th rowSpan={2}>{ACCOUNT_NAME_LABEL}</Th>
                        <Th rowSpan={2}>{BUSINESS_UNIT_LABEL}</Th>
                        <Th colSpan={5} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                        {showTrendSection && (
                          <Th colSpan={2} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>{trendHeaderLabel}</Th>
                        )}
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Fully Managed</Th>
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Co-Managed</Th>
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Staff Augmentation</Th>
                      </tr>
                      <tr>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        {showTrendSection && <><ThSubHeader>Response Rate Trend</ThSubHeader><ThSubHeader>Average CSAT Score Trend</ThSubHeader></>}
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                      </tr>
                    </>
                  ) : (
                    <>
                      <tr>
                        <Th rowSpan={2}>Sr. No.</Th>
                        <Th rowSpan={2}>{BUSINESS_UNIT_LABEL}</Th>
                        {/* Prefer the real YEAR - QUARTER value from the dashboard data (same
                            source as the Org level row and every BU row below) over acsatCycle,
                            which can be stale relative to whatever period was actually fetched. */}
                        <Th colSpan={6} style={{ textAlign: 'center' }}>{orgLevelRow?.yearQuarter || acsatCycle || 'H2 2025'}</Th>
                        {showTrendSection && (
                          <Th colSpan={2} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>{trendHeaderLabel}</Th>
                        )}
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Fully Managed</Th>
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Co-Managed</Th>
                        <Th colSpan={5} style={{ backgroundColor: '#BDD7EE', color: '#000000' }}>Staff Augmentation</Th>
                      </tr>
                      <tr>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>YEAR - QUARTER</ThSubHeader>
                        {showTrendSection && <><ThSubHeader>Response Rate Trend</ThSubHeader><ThSubHeader>Average CSAT Score Trend</ThSubHeader></>}
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{POLLED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONDED_LABEL}</ThSubHeader>
                        <ThSubHeader>{RESPONSE_RATE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVERAGE_CSAT_SCORE_LABEL}</ThSubHeader>
                        <ThSubHeader>{AVG_PREDICTED_SCORE_LABEL}</ThSubHeader>
                      </tr>
                    </>
                  )}
                </thead>
                <tbody>
                  {(showTop10 && !showBuWise ? filteredData.filter(r => r.customerId !== 'OTHER') : filteredData).map((row, index) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    if (hyphenRow) {
                      return (
                        <tr key={showTop10 && !showBuWise ? `top10-${index}` : index}>
                          <Td>-</Td>
                          {!showBuWise && <Td style={{ textAlign: 'left' }}>-</Td>}
                          <Td style={{ textAlign: 'left' }}>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          {showBuWise && <Td>-</Td>}
                          {showTrendSection && <><Td>-</Td><Td>-</Td></>}
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                          <Td>-</Td>
                        </tr>
                      );
                    }
                    return (
                    <tr key={showTop10 && !showBuWise ? `top10-${index}` : index}>
                      <Td>{row.sNo}</Td>
                      {!showBuWise && <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>}
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td>{row.cssSentCount}</Td>
                      <Td>{row.cssReceivedCount}</Td>
                      <ResponseRateTd rate={row.responseRate} $noSurveysReceived={row.cssReceivedCount === 0}>{formatResponseRateOneDecimal(row.responseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={row.cssReceivedCount === 0} $score={parseScore(row.averageCSATScore)}>{row.cssReceivedCount === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.averageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(row.averageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.avgPredictedScore) : '-'}</Td>
                      {showBuWise && <Td style={{ textAlign: 'center' }}>{row.yearQuarter ?? '-'}</Td>}
                      {!showBuWise && showTrendSection && (() => {
                        const currRateParsed = row.responseRate != null ? parseFloat(row.responseRate) : NaN;
                        const currRate = Number.isNaN(currRateParsed) ? 0 : currRateParsed;
                        const currScoreParsed = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : NaN;
                        const currScore = row.cssReceivedCount === 0 ? 0 : (Number.isNaN(currScoreParsed) ? 0 : currScoreParsed);

                        let trend = null;
                        if (showTop10) {
                          const accKeyT10 = (row.customerName || '').trim().toLowerCase();
                          const buKeyT10 = (normalizeBusinessUnitDisplay(row.businessUnit) || row.businessUnit || '').toString().trim().toLowerCase();
                          trend = (accKeyT10 && buKeyT10 ? trendTop10Lookup[`${accKeyT10}|||${buKeyT10}`] : null) || (accKeyT10 ? trendTop10Lookup[`nameOnly|||${accKeyT10}`] : null);
                        } else {
                          const accKey = (row.customerName || '').toString().trim().toLowerCase();
                          const buKey = normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase();
                          const idKey = normalizeCustomerIdKey(row.customerId || '');
                          trend =
                            (idKey ? trendAccountBuLookup[`id|||${idKey}|||${buKey}`] : null) ||
                            (accKey ? trendAccountBuLookup[`name|||${accKey}|||${buKey}`] : null) ||
                            ((!buKey && accKey) ? trendAccountBuLookup[`nameOnly|||${accKey}`] : null);
                        }

                        let trendRate = trend?.responseRatePct;
                        let trendScore = trend?.avgCSATScore;
                        // Symmetric zero-handling: if H1 row exists but value missing, treat as 0
                        if (trend != null && (trendRate == null || Number.isNaN(Number(trendRate)))) trendRate = 0;
                        if (trend != null && (trendScore == null || Number.isNaN(Number(trendScore)))) trendScore = 0;

                        let trendRateDisplay = '-';
                        let trendRateColor = 'inherit';
                        if (trend != null) {
                          const diff = Math.round((currRate - trendRate) * 10) / 10;
                          if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                          else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                          else { trendRateDisplay = `(0%) −`; }
                        }

                        let trendScoreDisplay = '-';
                        let trendScoreColor = 'inherit';
                        if (trend != null) {
                          const diff = Math.round((currScore - trendScore) * 100) / 100;
                          if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                          else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                          else { trendScoreDisplay = `(0.00) −`; }
                        }

                        return (
                          <>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                          </>
                        );
                      })()}
                      {!showBuWise ? (
                        <>
                          <Td>{row.fmPolled ?? 0}</Td>
                          <Td>{row.fmResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.fmResponseRate ?? 0} $noSurveysReceived={(row.fmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.fmResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.fmResponded ?? 0) === 0} $score={parseScore(row.fmAverageCSATScore)}>{(row.fmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.fmAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.fmAvgPredictedScore) : '-'}</Td>
                          <Td>{row.cmPolled ?? 0}</Td>
                          <Td>{row.cmResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.cmResponseRate ?? 0} $noSurveysReceived={(row.cmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.cmResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.cmResponded ?? 0) === 0} $score={parseScore(row.cmAverageCSATScore)}>{(row.cmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.cmAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.cmAvgPredictedScore) : '-'}</Td>
                          <Td>{row.saPolled ?? 0}</Td>
                          <Td>{row.saResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.saResponseRate ?? 0} $noSurveysReceived={(row.saResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.saResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.saResponded ?? 0) === 0} $score={parseScore(row.saAverageCSATScore)}>{(row.saResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.saAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.saAvgPredictedScore) : '-'}</Td>
                        </>
                      ) : (
                        <>
                          {showTrendSection && (() => {
                            const buKey = normalizeBusinessUnitDisplay(row.businessUnit);
                            const trend = trendBuLookup[buKey];
                            const currRate = row.responseRate != null ? parseFloat(row.responseRate) : null;
                            const trendRate = trend?.responseRatePct;
                            const currScore = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : null;
                            const trendScore = trend?.avgCSATScore;
                            let trendRateDisplay = '-';
                            let trendRateColor = 'inherit';
                            if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
                              const diff = Math.round((currRate - trendRate) * 10) / 10;
                              if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                              else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                              else { trendRateDisplay = `(0%) −`; }
                            }
                            let trendScoreDisplay = '-';
                            let trendScoreColor = 'inherit';
                            if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
                              const diff = Math.round((currScore - trendScore) * 100) / 100;
                              if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                              else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                              else { trendScoreDisplay = `(0.00) −`; }
                            }
                            return (
                              <>
                                <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                                <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                              </>
                            );
                          })()}
                          <Td>{row.fmPolled ?? 0}</Td>
                          <Td>{row.fmResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.fmResponseRate ?? 0} $noSurveysReceived={(row.fmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.fmResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.fmResponded ?? 0) === 0} $score={parseScore(row.fmAverageCSATScore)}>{(row.fmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.fmAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.fmAvgPredictedScore) : '-'}</Td>
                          <Td>{row.cmPolled ?? 0}</Td>
                          <Td>{row.cmResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.cmResponseRate ?? 0} $noSurveysReceived={(row.cmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.cmResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.cmResponded ?? 0) === 0} $score={parseScore(row.cmAverageCSATScore)}>{(row.cmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.cmAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.cmAvgPredictedScore) : '-'}</Td>
                          <Td>{row.saPolled ?? 0}</Td>
                          <Td>{row.saResponded ?? 0}</Td>
                          <ResponseRateTd rate={row.saResponseRate ?? 0} $noSurveysReceived={(row.saResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.saResponseRate ?? 0)}%</ResponseRateTd>
                          <AverageCSATScoreTd $noSurveysReceived={(row.saResponded ?? 0) === 0} $score={parseScore(row.saAverageCSATScore)}>{(row.saResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.saAverageCSATScore)}</AverageCSATScoreTd>
                          <Td>{hasAvgCsatValue(row.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.saAvgPredictedScore) : '-'}</Td>
                        </>
                      )}
                    </tr>
                  );
                  })}
                  {showTop10 && !showBuWise && top10GrandTotalRow && (
                    <tr style={{ fontWeight: 600, backgroundColor: '#FFF2CC' }}>
                      <Td>{top10GrandTotalRow.sNo}</Td>
                      <Td style={{ textAlign: 'left' }}>{top10GrandTotalRow.customerName}</Td>
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(top10GrandTotalRow.businessUnit)}</Td>
                      <Td>{top10GrandTotalRow.cssSentCount}</Td>
                      <Td>{top10GrandTotalRow.cssReceivedCount}</Td>
                      <ResponseRateTd rate={top10GrandTotalRow.responseRate} $noSurveysReceived={top10GrandTotalRow.cssReceivedCount === 0}>{formatResponseRateOneDecimal(top10GrandTotalRow.responseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={top10GrandTotalRow.cssReceivedCount === 0} $score={parseScore(top10GrandTotalRow.averageCSATScore)}>{top10GrandTotalRow.cssReceivedCount === 0 ? '-' : formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.averageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(top10GrandTotalRow.averageCSATScore) ? formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.avgPredictedScore) : '-'}</Td>
                      {showTrendSection && (() => {
                        const key = `${(top10GrandTotalRow.customerName || '').trim()}|||${normalizeBusinessUnitDisplay(top10GrandTotalRow.businessUnit) || top10GrandTotalRow.businessUnit || 'N/A'}`;
                        const trend = trendTop10SummaryLookup[key];
                        const currRate = top10GrandTotalRow.responseRate != null ? parseFloat(top10GrandTotalRow.responseRate) : null;
                        const trendRate = trend?.responseRatePct;
                        const currScore = top10GrandTotalRow.averageCSATScore != null ? parseFloat(top10GrandTotalRow.averageCSATScore) : null;
                        const trendScore = trend?.avgCSATScore;
                        let trendRateDisplay = '-';
                        let trendRateColor = 'inherit';
                        if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
                          const diff = Math.round((currRate - trendRate) * 10) / 10;
                          if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                          else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                          else { trendRateDisplay = `(0%) −`; }
                        }
                        let trendScoreDisplay = '-';
                        let trendScoreColor = 'inherit';
                        if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
                          const diff = Math.round((currScore - trendScore) * 100) / 100;
                          if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                          else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                          else { trendScoreDisplay = `(0.00) −`; }
                        }
                        return (
                          <>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                          </>
                        );
                      })()}
                      <Td>{top10GrandTotalRow.fmPolled}</Td>
                      <Td>{top10GrandTotalRow.fmResponded}</Td>
                      <ResponseRateTd rate={top10GrandTotalRow.fmResponseRate} $noSurveysReceived={top10GrandTotalRow.fmResponded === 0}>{formatResponseRateOneDecimal(top10GrandTotalRow.fmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={top10GrandTotalRow.fmResponded === 0} $score={parseScore(top10GrandTotalRow.fmAverageCSATScore)}>{top10GrandTotalRow.fmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.fmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(top10GrandTotalRow.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.fmAvgPredictedScore) : '-'}</Td>
                      <Td>{top10GrandTotalRow.cmPolled}</Td>
                      <Td>{top10GrandTotalRow.cmResponded}</Td>
                      <ResponseRateTd rate={top10GrandTotalRow.cmResponseRate} $noSurveysReceived={top10GrandTotalRow.cmResponded === 0}>{formatResponseRateOneDecimal(top10GrandTotalRow.cmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={top10GrandTotalRow.cmResponded === 0} $score={parseScore(top10GrandTotalRow.cmAverageCSATScore)}>{top10GrandTotalRow.cmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.cmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(top10GrandTotalRow.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.cmAvgPredictedScore) : '-'}</Td>
                      <Td>{top10GrandTotalRow.saPolled}</Td>
                      <Td>{top10GrandTotalRow.saResponded}</Td>
                      <ResponseRateTd rate={top10GrandTotalRow.saResponseRate} $noSurveysReceived={top10GrandTotalRow.saResponded === 0}>{formatResponseRateOneDecimal(top10GrandTotalRow.saResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={top10GrandTotalRow.saResponded === 0} $score={parseScore(top10GrandTotalRow.saAverageCSATScore)}>{top10GrandTotalRow.saResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.saAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(top10GrandTotalRow.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(top10GrandTotalRow.saAvgPredictedScore) : '-'}</Td>
                    </tr>
                  )}
                  {showTop10 && !showBuWise && filteredData.filter(r => r.customerId === 'OTHER').map((row, index) => (
                    <tr key={`other-${index}`} style={{ backgroundColor: '#93CCEA' }}>
                      <Td></Td>
                      <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.businessUnit === 'N/A' ? '' : normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td>{row.cssSentCount}</Td>
                      <Td>{row.cssReceivedCount}</Td>
                      <ResponseRateTd rate={row.responseRate} $noSurveysReceived={row.cssReceivedCount === 0}>{formatResponseRateOneDecimal(row.responseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={row.cssReceivedCount === 0} $score={parseScore(row.averageCSATScore)}>{row.cssReceivedCount === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.averageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(row.averageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.avgPredictedScore) : '-'}</Td>
                      {showTrendSection && (() => {
                        const key = `${(row.customerName || '').trim()}|||${normalizeBusinessUnitDisplay(row.businessUnit) || row.businessUnit || 'N/A'}`;
                        const trend = trendTop10SummaryLookup[key];
                        const currRate = row.responseRate != null ? parseFloat(row.responseRate) : null;
                        const trendRate = trend?.responseRatePct;
                        const currScore = row.averageCSATScore != null ? parseFloat(row.averageCSATScore) : null;
                        const trendScore = trend?.avgCSATScore;
                        let trendRateDisplay = '-';
                        let trendRateColor = 'inherit';
                        if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
                          const diff = Math.round((currRate - trendRate) * 10) / 10;
                          if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                          else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                          else { trendRateDisplay = `(0%) −`; }
                        }
                        let trendScoreDisplay = '-';
                        let trendScoreColor = 'inherit';
                        if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
                          const diff = Math.round((currScore - trendScore) * 100) / 100;
                          if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                          else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                          else { trendScoreDisplay = `(0.00) −`; }
                        }
                        return (
                          <>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                          </>
                        );
                      })()}
                      <Td>{row.fmPolled ?? 0}</Td>
                      <Td>{row.fmResponded ?? 0}</Td>
                      <ResponseRateTd rate={row.fmResponseRate ?? 0} $noSurveysReceived={(row.fmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.fmResponseRate ?? 0)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={(row.fmResponded ?? 0) === 0} $score={parseScore(row.fmAverageCSATScore)}>{(row.fmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.fmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(row.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.fmAvgPredictedScore) : '-'}</Td>
                      <Td>{row.cmPolled ?? 0}</Td>
                      <Td>{row.cmResponded ?? 0}</Td>
                      <ResponseRateTd rate={row.cmResponseRate ?? 0} $noSurveysReceived={(row.cmResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.cmResponseRate ?? 0)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={(row.cmResponded ?? 0) === 0} $score={parseScore(row.cmAverageCSATScore)}>{(row.cmResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.cmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(row.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.cmAvgPredictedScore) : '-'}</Td>
                      <Td>{row.saPolled ?? 0}</Td>
                      <Td>{row.saResponded ?? 0}</Td>
                      <ResponseRateTd rate={row.saResponseRate ?? 0} $noSurveysReceived={(row.saResponded ?? 0) === 0}>{formatResponseRateOneDecimal(row.saResponseRate ?? 0)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={(row.saResponded ?? 0) === 0} $score={parseScore(row.saAverageCSATScore)}>{(row.saResponded ?? 0) === 0 ? '-' : formatAverageCSATScoreTwoDecimals(row.saAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(row.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(row.saAvgPredictedScore) : '-'}</Td>
                    </tr>
                  ))}
                  {showTop10 && !showBuWise && overallRow && (
                    <tr style={{ fontWeight: 600, backgroundColor: '#E4DFEC' }}>
                      <Td></Td>
                      <Td style={{ textAlign: 'left' }}>{overallRow.customerName}</Td>
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(overallRow.businessUnit)}</Td>
                      <Td>{overallRow.cssSentCount}</Td>
                      <Td>{overallRow.cssReceivedCount}</Td>
                      <ResponseRateTd rate={overallRow.responseRate} $noSurveysReceived={overallRow.cssReceivedCount === 0}>{formatResponseRateOneDecimal(overallRow.responseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={overallRow.cssReceivedCount === 0} $score={parseScore(overallRow.averageCSATScore)}>{overallRow.cssReceivedCount === 0 ? '-' : formatAverageCSATScoreTwoDecimals(overallRow.averageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(overallRow.averageCSATScore) ? formatAverageCSATScoreTwoDecimals(overallRow.avgPredictedScore) : '-'}</Td>
                      {showTrendSection && (() => {
                        const key = `${(overallRow.customerName || '').trim()}|||${normalizeBusinessUnitDisplay(overallRow.businessUnit) || overallRow.businessUnit || 'N/A'}`;
                        const trend = trendTop10SummaryLookup[key];
                        const currRate = overallRow.responseRate != null ? parseFloat(overallRow.responseRate) : null;
                        const trendRate = trend?.responseRatePct;
                        const currScore = overallRow.averageCSATScore != null ? parseFloat(overallRow.averageCSATScore) : null;
                        const trendScore = trend?.avgCSATScore;
                        let trendRateDisplay = '-';
                        let trendRateColor = 'inherit';
                        if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
                          const diff = Math.round((currRate - trendRate) * 10) / 10;
                          if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                          else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                          else { trendRateDisplay = `(0%) −`; }
                        }
                        let trendScoreDisplay = '-';
                        let trendScoreColor = 'inherit';
                        if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
                          const diff = Math.round((currScore - trendScore) * 100) / 100;
                          if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                          else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                          else { trendScoreDisplay = `(0.00) −`; }
                        }
                        return (
                          <>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                          </>
                        );
                      })()}
                      <Td>{overallRow.fmPolled}</Td>
                      <Td>{overallRow.fmResponded}</Td>
                      <ResponseRateTd rate={overallRow.fmResponseRate} $noSurveysReceived={overallRow.fmResponded === 0}>{formatResponseRateOneDecimal(overallRow.fmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={overallRow.fmResponded === 0} $score={parseScore(overallRow.fmAverageCSATScore)}>{overallRow.fmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(overallRow.fmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(overallRow.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(overallRow.fmAvgPredictedScore) : '-'}</Td>
                      <Td>{overallRow.cmPolled}</Td>
                      <Td>{overallRow.cmResponded}</Td>
                      <ResponseRateTd rate={overallRow.cmResponseRate} $noSurveysReceived={overallRow.cmResponded === 0}>{formatResponseRateOneDecimal(overallRow.cmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={overallRow.cmResponded === 0} $score={parseScore(overallRow.cmAverageCSATScore)}>{overallRow.cmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(overallRow.cmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(overallRow.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(overallRow.cmAvgPredictedScore) : '-'}</Td>
                      <Td>{overallRow.saPolled}</Td>
                      <Td>{overallRow.saResponded}</Td>
                      <ResponseRateTd rate={overallRow.saResponseRate} $noSurveysReceived={overallRow.saResponded === 0}>{formatResponseRateOneDecimal(overallRow.saResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={overallRow.saResponded === 0} $score={parseScore(overallRow.saAverageCSATScore)}>{overallRow.saResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(overallRow.saAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(overallRow.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(overallRow.saAvgPredictedScore) : '-'}</Td>
                    </tr>
                  )}
                  {showBuWise && orgLevelRow && (
                    <tr style={{ fontWeight: 600, backgroundColor: '#e0f2fe' }}>
                      <Td>{orgLevelRow.sNo}</Td>
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(orgLevelRow.businessUnit)}</Td>
                      <Td>{orgLevelRow.cssSentCount}</Td>
                      <Td>{orgLevelRow.cssReceivedCount}</Td>
                      <ResponseRateTd rate={orgLevelRow.responseRate} $noSurveysReceived={orgLevelRow.cssReceivedCount === 0}>{formatResponseRateOneDecimal(orgLevelRow.responseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={orgLevelRow.cssReceivedCount === 0} $score={parseScore(orgLevelRow.averageCSATScore)}>{orgLevelRow.cssReceivedCount === 0 ? '-' : formatAverageCSATScoreTwoDecimals(orgLevelRow.averageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(orgLevelRow.averageCSATScore) ? formatAverageCSATScoreTwoDecimals(orgLevelRow.avgPredictedScore) : '-'}</Td>
                      <Td style={{ textAlign: 'center' }}>{orgLevelRow.yearQuarter || '-'}</Td>
                      {showTrendSection && (() => {
                        const firstTrend = trendDataProcessed?.find(f => f.hasData);
                        const trend = firstTrend?.orgLevelRow;
                        const currRate = orgLevelRow.responseRate != null ? parseFloat(orgLevelRow.responseRate) : null;
                        const trendRate = trend?.responseRatePct;
                        const currScore = orgLevelRow.averageCSATScore != null ? parseFloat(orgLevelRow.averageCSATScore) : null;
                        const trendScore = trend?.avgCSATScore;
                        let trendRateDisplay = '-';
                        let trendRateColor = 'inherit';
                        if (trend != null && trendRate != null && currRate != null && !isNaN(currRate)) {
                          const diff = Math.round((currRate - trendRate) * 10) / 10;
                          if (currRate > trendRate) { trendRateDisplay = `(+${diff}%) ↑`; trendRateColor = '#16a34a'; }
                          else if (currRate < trendRate) { trendRateDisplay = `(${diff}%) ↓`; trendRateColor = '#dc2626'; }
                          else { trendRateDisplay = `(0%) −`; }
                        }
                        let trendScoreDisplay = '-';
                        let trendScoreColor = 'inherit';
                        if (trend != null && trendScore != null && currScore != null && !isNaN(currScore)) {
                          const diff = Math.round((currScore - trendScore) * 100) / 100;
                          if (currScore > trendScore) { trendScoreDisplay = `(+${Number(diff).toFixed(2)}) ↑`; trendScoreColor = '#16a34a'; }
                          else if (currScore < trendScore) { trendScoreDisplay = `(${Number(diff).toFixed(2)}) ↓`; trendScoreColor = '#dc2626'; }
                          else { trendScoreDisplay = `(0.00) −`; }
                        }
                        return (
                          <>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendRateColor }}>{trendRateDisplay}</Td>
                            <Td style={{ textAlign: 'center', fontWeight: 600, color: trendScoreColor }}>{trendScoreDisplay}</Td>
                          </>
                        );
                      })()}
                      <Td>{orgLevelRow.fmPolled}</Td>
                      <Td>{orgLevelRow.fmResponded}</Td>
                      <ResponseRateTd rate={orgLevelRow.fmResponseRate} $noSurveysReceived={orgLevelRow.fmResponded === 0}>{formatResponseRateOneDecimal(orgLevelRow.fmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={orgLevelRow.fmResponded === 0} $score={parseScore(orgLevelRow.fmAverageCSATScore)}>{orgLevelRow.fmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(orgLevelRow.fmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(orgLevelRow.fmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(orgLevelRow.fmAvgPredictedScore) : '-'}</Td>
                      <Td>{orgLevelRow.cmPolled}</Td>
                      <Td>{orgLevelRow.cmResponded}</Td>
                      <ResponseRateTd rate={orgLevelRow.cmResponseRate} $noSurveysReceived={orgLevelRow.cmResponded === 0}>{formatResponseRateOneDecimal(orgLevelRow.cmResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={orgLevelRow.cmResponded === 0} $score={parseScore(orgLevelRow.cmAverageCSATScore)}>{orgLevelRow.cmResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(orgLevelRow.cmAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(orgLevelRow.cmAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(orgLevelRow.cmAvgPredictedScore) : '-'}</Td>
                      <Td>{orgLevelRow.saPolled}</Td>
                      <Td>{orgLevelRow.saResponded}</Td>
                      <ResponseRateTd rate={orgLevelRow.saResponseRate} $noSurveysReceived={orgLevelRow.saResponded === 0}>{formatResponseRateOneDecimal(orgLevelRow.saResponseRate)}%</ResponseRateTd>
                      <AverageCSATScoreTd $noSurveysReceived={orgLevelRow.saResponded === 0} $score={parseScore(orgLevelRow.saAverageCSATScore)}>{orgLevelRow.saResponded === 0 ? '-' : formatAverageCSATScoreTwoDecimals(orgLevelRow.saAverageCSATScore)}</AverageCSATScoreTd>
                      <Td>{hasAvgCsatValue(orgLevelRow.saAverageCSATScore) ? formatAverageCSATScoreTwoDecimals(orgLevelRow.saAvgPredictedScore) : '-'}</Td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </TableWrapper>
          </TableContainer>

          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8fafc', 
            borderRadius: '8px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '0.875rem'
          }}>
            Showing {filteredData.length} {showBuWise ? 'business units' : showTop10 ? 'Top 10 accounts' : 'accounts'} with response rate data
            {customerNameSearch && !showBuWise && !showTop10 && ` (searched: ${customerNameSearch})`}
          </div>
        </React.Fragment>
      )}

      {/* Bar Chart for Account-wise Response Rate - Display automatically for Account-wise view */}
      {console.log('Bar chart render check:', { showBuWise, showTop10, barChartDataLength: barChartData?.length, filteredDataLength: filteredData?.length })}
      {!showBuWise && !showTop10 && (
        <ChartContainer>
          <ChartHeader>
            <ChartTitle>📊 Display Response Rate (%) for accounts</ChartTitle>
            <DownloadChartButton onClick={() => downloadChart('bar')}>
              <Download size={16} />
              Download Chart
            </DownloadChartButton>
          </ChartHeader>
          <div id="bar-chart" style={{ height: '400px' }}>
            {barChartData && barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 60, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    fontSize={11}
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis 
                    label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, 'Response Rate']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullName;
                      }
                      return label;
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="responseRate" 
                    fill="#3b82f6" 
                    name="Response Rate"
                    radius={[4, 4, 0, 0]}
                    label={{ 
                      position: 'top', 
                      formatter: (value, entry) => `${value}%`,
                      style: { 
                        fontSize: '10px', 
                        fill: '#1f2937',
                        fontWeight: '600',
                        textAnchor: 'middle'
                      },
                      angle: 0,
                      offset: 5
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#6b7280',
                fontSize: '1rem'
              }}>
                No data available for bar chart. Please ensure you have uploaded data and are in Account-wise view.
              </div>
            )}
          </div>
        </ChartContainer>
      )}

      {/* Donut Chart for BU-wise Response Rate - Display automatically for BU-wise view */}
      {console.log('Donut chart render check:', { showBuWise, donutChartDataLength: donutChartData?.length, processedDataLength: processedData?.data?.length })}
      {showBuWise && (
        <ChartContainer>
          <ChartHeader>
            <ChartTitle>🍩 BU-wise Response Rate Distribution</ChartTitle>
            <DownloadChartButton onClick={() => downloadChart('donut')}>
              <Download size={16} />
              Download Chart
            </DownloadChartButton>
          </ChartHeader>
          <div id="donut-chart" style={{ height: '400px' }}>
            {donutChartData && donutChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, responseRate }) => `${normalizeBusinessUnitDisplay(name)}: ${formatResponseRateOneDecimal(responseRate)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="responseRate"
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.responseRate === 0 ? '#9ca3af' :  // Gray = No surveys received (0)
                            entry.responseRate >= 75 ? '#c6efce' :  // Light Green ≥75% (Excel Light Green)
                            entry.responseRate >= 50 ? '#FFA500' : '#FF0000'  // Orange 50-74% (same as ACSAT), Red <50% (Excel Red)
                          } 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, 'Response Rate']}
                      labelFormatter={(label) => `Business Unit: ${normalizeBusinessUnitDisplay(label)}`}
                    />
                    <Legend formatter={(value) => normalizeBusinessUnitDisplay(value)} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Color Legend: Red <50%, Orange 50-74%, Light Green ≥75%, Gray = No surveys received (0) */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  gap: '2rem', 
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', borderRadius: '50%', border: '2px solid #ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Red: &lt;50%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', borderRadius: '50%', border: '2px solid #ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Orange: 50% to 74%</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', backgroundColor: '#c6efce', borderRadius: '50%', border: '2px solid #ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#374151' }}>Light Green: ≥75%</span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                color: '#6b7280',
                fontSize: '1rem',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>No data available for donut chart.</div>
                <div>Please ensure you have uploaded data and are in BU-wise view.</div>
                <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Chart state: Visible | Data length: {donutChartData?.length || 0}
                </div>
              </div>
            )}
          </div>
        </ChartContainer>
      )}

      {/* Trend Analysis Section - from uploaded files, displayed below BU wise dashboard only */}
      {showBuWise && showTrendSection && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            padding: '1rem 1.25rem', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            color: 'white', 
            borderRadius: '12px 12px 0 0', 
            fontWeight: 600, 
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              Trend Analysis (from uploaded data)
            </span>
            {trendDataProcessed.some(f => f.hasData) && (
              <button
                onClick={downloadTrendData}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={14} />
                Download Excel
              </button>
            )}
          </div>
          {trendAnalysisFiles?.length === 0 ? (
            <div style={{ 
              padding: '2rem', 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderTop: 'none', 
              borderRadius: '0 0 12px 12px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              No trend data uploaded. Upload files in &quot;Upload data for trend analysis&quot; section and return here.
            </div>
          ) : (
            trendDataProcessed.map((fileData, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderBottom: 'none', 
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  color: '#1e3a5f',
                  fontSize: '0.95rem'
                }}>
                  {fileData.saveName}
                </div>
                <TableContainer>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th rowSpan={2} style={{ width: '18%' }}>Business Unit</Th>
                          <Th colSpan={6} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                        </tr>
                        <tr>
                          <Th style={{ width: '10%' }}>#Polled</Th>
                          <Th style={{ width: '10%' }}>#Responded</Th>
                          <Th style={{ width: '12%' }}>Response Rate %</Th>
                          <Th style={{ width: '15%' }}>Average CSAT Score</Th>
                          <Th style={{ width: '18%' }}>Avg. Predicted Score for the Surveys Responses Received</Th>
                          <Th style={{ width: '15%' }}>YEAR - QUARTER</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileData.hasData ? fileData.rows.map((row, ri) => (
                          <tr key={ri}>
                            <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(row.responseRatePct, row.responded === 0) 
                            }}>
                              {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(row.avgCSATScore, row.responded === 0) 
                            }}>
                              {row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                            <Td style={{ textAlign: 'center' }}>{row.responded > 0 && row.avgPredictedScore != null ? row.avgPredictedScore.toFixed(2) : '-'}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.yearQuarter || '-'}</Td>
                          </tr>
                        )) : (
                          <tr>
                            <Td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8' }}>
                              No data found in the Customer Success Survey Status report after date filter.
                            </Td>
                          </tr>
                        )}
                        {fileData.hasData && fileData.orgLevelRow && (
                          <tr style={{ fontWeight: 600, backgroundColor: '#e0f2fe' }}>
                            <Td style={{ textAlign: 'left' }}>{fileData.orgLevelRow.businessUnit}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.orgLevelRow.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.orgLevelRow.responded}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(fileData.orgLevelRow.responseRatePct, fileData.orgLevelRow.responded === 0) 
                            }}>
                              {fileData.orgLevelRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(fileData.orgLevelRow.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(fileData.orgLevelRow.avgCSATScore, fileData.orgLevelRow.responded === 0) 
                            }}>
                              {fileData.orgLevelRow.avgCSATScore != null ? fileData.orgLevelRow.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.orgLevelRow.responded > 0 && fileData.orgLevelRow.avgPredictedScore != null ? fileData.orgLevelRow.avgPredictedScore.toFixed(2) : '-'}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.orgLevelRow.yearQuarter || '-'}</Td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TableContainer>
              </div>
            ))
          )}
          {/* BU-wise Response Rate % comparison chart */}
          {trendDataProcessed.some(f => f.hasData) && responseRateComparisonChartData.length > 0 && (
            <ChartContainer style={{ marginTop: '1.5rem' }}>
              <ChartHeader>
                <ChartTitle>📊 BU-wise Response Rate % – Dashboard vs Trend</ChartTitle>
                <DownloadChartButton onClick={() => downloadChart('response-rate-comparison')}>
                  <Download size={16} />
                  Download Chart
                </DownloadChartButton>
              </ChartHeader>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                Dashboard: Account/BU wise Response Rate Dashboard (BU-wise) | Trend: Uploaded file (e.g. Trend-Analysis-H12025) – YEAR - QUARTER comparison
              </div>
              <div id="response-rate-comparison-chart" style={{ height: '480px', padding: '1rem', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseRateComparisonChartData} margin={{ top: 50, right: 30, left: 20, bottom: 80 }} barCategoryGap={12} barGap={8} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis
                      label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const payload = props?.payload;
                        const yq = name === 'dashboard' ? (payload?.yearQuarterDashboard || '-') : (payload?.yearQuarterTrend || '-');
                        return [`${value != null ? `${value}%` : '-'} (YEAR - QUARTER: ${yq})`, name === 'dashboard' ? 'Account/BU wise Dashboard' : 'Trend Analysis'];
                      }}
                      labelFormatter={(label) => `Business Unit: ${normalizeBusinessUnitDisplay(label)}`}
                    />
                    <Legend formatter={(v) => (v === 'trend' ? 'Trend Analysis (from uploaded data)' : 'Account/BU wise Dashboard')} />
                    <Bar dataKey="trend" name="trend" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="trend" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {`${value}%`}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarterTrend" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">{value}</text>
                        );
                      }} />
                    </Bar>
                    <Bar dataKey="dashboard" name="dashboard" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="dashboard" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {`${value}%`}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarterDashboard" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">{value}</text>
                        );
                      }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
          {/* BU-wise Average CSAT Score comparison chart */}
          {trendDataProcessed.some(f => f.hasData) && avgCSATScoreComparisonChartData.length > 0 && (
            <ChartContainer style={{ marginTop: '1.5rem' }}>
              <ChartHeader>
                <ChartTitle>📈 BU-wise Average CSAT Score – Dashboard vs Trend</ChartTitle>
                <DownloadChartButton onClick={() => downloadChart('avg-csat-comparison')}>
                  <Download size={16} />
                  Download Chart
                </DownloadChartButton>
              </ChartHeader>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                Average CSAT Score: Dashboard from Account/BU wise Response Rate Dashboard (BU-wise) | Trend from uploaded file (e.g. Trend-Analysis-H12025) – YEAR - QUARTER comparison
              </div>
              <div id="avg-csat-comparison-chart" style={{ height: '480px', padding: '1rem', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgCSATScoreComparisonChartData} margin={{ top: 50, right: 30, left: 20, bottom: 80 }} barCategoryGap={12} barGap={8} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis
                      label={{ value: 'Average CSAT Score', angle: -90, position: 'insideLeft' }}
                      domain={[0, 5]}
                    />
                    <Tooltip
                      formatter={(value, name, props) => {
                        const payload = props?.payload;
                        const yq = name === 'dashboard' ? (payload?.yearQuarterDashboard || '-') : (payload?.yearQuarterTrend || '-');
                        return [`${value != null ? value.toFixed(2) : '-'} (YEAR - QUARTER: ${yq})`, name === 'dashboard' ? 'Account/BU wise Dashboard' : 'Trend Analysis'];
                      }}
                      labelFormatter={(label) => `Business Unit: ${normalizeBusinessUnitDisplay(label)}`}
                    />
                    <Legend formatter={(v) => (v === 'trend' ? 'Trend Analysis (from uploaded data)' : 'Account/BU wise Dashboard')} />
                    <Bar dataKey="trend" name="trend" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="trend" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarterTrend" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">{value}</text>
                        );
                      }} />
                    </Bar>
                    <Bar dataKey="dashboard" name="dashboard" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="dashboard" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarterDashboard" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">{value}</text>
                        );
                      }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
          {/* Org level Response Rate % comparison chart (with Average CSAT Score as line) */}
          {trendDataProcessed.some(f => f.hasData) && orgLevelResponseRateWithAvgCSATChartData.length > 0 && (
            <ChartContainer style={{ marginTop: '1.5rem' }}>
              <ChartHeader>
                <ChartTitle>📊 Org level Response Rate % – Dashboard vs Trend</ChartTitle>
                <DownloadChartButton onClick={() => downloadChart('org-response-rate-comparison')}>
                  <Download size={16} />
                  Download Chart
                </DownloadChartButton>
              </ChartHeader>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                Dashboard: Account/BU wise Response Rate Dashboard (BU-wise) | Trend: Uploaded file (e.g. Trend-Analysis-H12025) – YEAR - QUARTER comparison. Bars: Response Rate %. Line: Average CSAT Score (by YEAR - QUARTER).
              </div>
              <div id="org-response-rate-comparison-chart" style={{ height: '350px', padding: '1.5rem', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', width: '100%', minWidth: '480px', maxWidth: '500px', margin: '0 auto', overflow: 'visible' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={orgLevelResponseRateWithAvgCSATChartData} margin={{ top: 50, right: 100, left: 95, bottom: 30 }} barCategoryGap={18} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={false} axisLine={false} />
                    <YAxis
                      yAxisId="left"
                      label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft', offset: 15, style: { textAnchor: 'middle' } }}
                      domain={[0, 100]}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      label={{ value: 'Average CSAT Score', angle: 90, position: 'insideRight', offset: 15, style: { textAnchor: 'middle' } }}
                      domain={[3, 5]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0]?.payload;
                        if (!p) return null;
                        return (
                          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</div>
                            <div>Response Rate: {p.value != null ? `${p.value}%` : '-'}</div>
                            <div>Average CSAT Score: {p.avgCSATScore != null ? p.avgCSATScore.toFixed(2) : '-'}</div>
                            <div>YEAR - QUARTER: {p.yearQuarter || '-'}</div>
                          </div>
                        );
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" yAxisId="left" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Response Rate %">
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                      <LabelList dataKey="value" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {`${value}%`}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarter" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">
                            {value}
                          </text>
                        );
                      }} />
                    </Bar>
                    <Line type="monotone" dataKey="avgCSATScore" yAxisId="right" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} name="Average CSAT Score" connectNulls>
                      <LabelList dataKey="avgCSATScore" position="top" content={(props) => {
                        const { x, y, value } = props;
                        if (value == null) return null;
                        return (
                          <text x={x} y={(y ?? 0) - 8} textAnchor="middle" fontSize={10} fill="#16a34a" fontWeight={600}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </text>
                        );
                      }} />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
          {/* Org level Average CSAT Score comparison chart */}
          {trendDataProcessed.some(f => f.hasData) && orgLevelAvgCSATScoreComparisonChartData.length > 0 && (
            <ChartContainer style={{ marginTop: '1.5rem' }}>
              <ChartHeader>
                <ChartTitle>📈 Org level Average CSAT Score – Dashboard vs Trend</ChartTitle>
                <DownloadChartButton onClick={() => downloadChart('org-avg-csat-comparison')}>
                  <Download size={16} />
                  Download Chart
                </DownloadChartButton>
              </ChartHeader>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem', paddingLeft: '1rem' }}>
                Dashboard: Account/BU wise Response Rate Dashboard (BU-wise) | Trend: Uploaded file (e.g. Trend-Analysis-H12025) – YEAR - QUARTER comparison
              </div>
              <div id="org-avg-csat-comparison-chart" style={{ height: '430px', padding: '1rem', background: 'white', borderRadius: '0 0 12px 12px', border: '1px solid #e2e8f0', borderTop: 'none', maxWidth: '320px', margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orgLevelAvgCSATScoreComparisonChartData} margin={{ top: 50, right: 20, left: 20, bottom: 30 }} barCategoryGap={8} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={false} axisLine={false} />
                    <YAxis
                      label={{ value: 'Average CSAT Score', angle: -90, position: 'insideLeft' }}
                      domain={[0, 5]}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.[0]) return null;
                        const p = payload[0].payload;
                        return (
                          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{p.name}</div>
                            <div>Average CSAT Score: {p.value != null ? p.value.toFixed(2) : '-'}</div>
                            <div>YEAR - QUARTER: {p.yearQuarter || '-'}</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                      <LabelList dataKey="value" position="inside" content={(props) => {
                        const { x, y, width, height, value } = props;
                        if (value == null) return null;
                        const cy = (y ?? 0) + (height ?? 0) / 2;
                        return (
                          <text x={x + width / 2} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="#ffffff" fontWeight={600}>
                            {typeof value === 'number' ? value.toFixed(2) : value}
                          </text>
                        );
                      }} />
                      <LabelList dataKey="yearQuarter" position="top" content={(props) => {
                        const { x, y, width, value } = props;
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 8} textAnchor="middle" fontSize={9} fill="#6b7280" fontWeight="bold">
                            {value}
                          </text>
                        );
                      }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
        </div>
      )}

      {/* Trend Analysis Section - Account-wise (from Trend-Analysis-H12025.xlsx uploaded in trend analysis upload) */}
      {!showBuWise && !showTop10 && !showPracticeWise && showTrendSection && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              Trend Analysis ({trendAccountBuH1?.sourceName || 'reference'})
            </span>
            {trendAccountBuH1?.hasData && (
              <button
                onClick={downloadAccountWiseH1ReferenceData}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={14} />
                Download Excel
              </button>
            )}
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px'
          }}>
            {trendAccountBuH1?.error ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                {trendAccountBuH1.error}
              </div>
            ) : !trendAccountBuH1?.hasData ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No trend rows found after applying CSAT cycle start date filter ({csatCycleStartDateFormatted}).
              </div>
            ) : (
              <TableContainer>
                <TableWrapper>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ width: '28%' }}>{ACCOUNT_NAME_LABEL}</Th>
                        <Th style={{ width: '20%' }}>{BUSINESS_UNIT_LABEL}</Th>
                        <Th style={{ width: '12%' }}>{POLLED_LABEL}</Th>
                        <Th style={{ width: '12%' }}>{RESPONDED_LABEL}</Th>
                        <Th style={{ width: '14%' }}>{RESPONSE_RATE_LABEL}</Th>
                        <Th style={{ width: '14%' }}>{AVERAGE_CSAT_SCORE_LABEL}</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendAccountBuH1.rows.map((row, idx) => (
                        <tr key={`${row.accountName}|||${row.businessUnit}|||${idx}`}>
                          <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                          <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                          <Td style={{ textAlign: 'center', ...getResponseRateColor(row.responseRatePct, row.responded === 0) }}>
                            {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                          </Td>
                          <Td style={{ textAlign: 'center', ...getAvgCSATScoreColor(row.avgCSATScore, row.responded === 0) }}>
                            {row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-'}
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </TableContainer>
            )}
          </div>
        </div>
      )}

      {/* Trend Analysis Section - Top 10 (from uploaded files, displayed below Top 10 dashboard) */}
      {showTop10 && showTrendSection && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            padding: '1rem 1.25rem', 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
            color: 'white', 
            borderRadius: '12px 12px 0 0', 
            fontWeight: 600, 
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              Trend Analysis – Top 10 (from uploaded data)
            </span>
            {trendTop10DataProcessed?.some(f => f.hasData) && (
              <button
                onClick={downloadTop10TrendData}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.5)',
                  borderRadius: '6px',
                  padding: '0.4rem 0.9rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={14} />
                Download Excel
              </button>
            )}
          </div>
          {!trendAnalysisFiles?.length ? (
            <div style={{ 
              padding: '2rem', 
              background: 'white', 
              border: '1px solid #e2e8f0', 
              borderTop: 'none', 
              borderRadius: '0 0 12px 12px',
              color: '#64748b',
              textAlign: 'center'
            }}>
              No trend data uploaded. Upload files in &quot;Upload data for trend analysis&quot; section and return here.
            </div>
          ) : (
            trendTop10DataProcessed?.map((fileData, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderBottom: 'none', 
                  borderRadius: '8px 8px 0 0',
                  fontWeight: 600,
                  color: '#1e3a5f',
                  fontSize: '0.95rem'
                }}>
                  {fileData.saveName}
                </div>
                <TableContainer>
                  <TableWrapper>
                    <Table>
                      <thead>
                        <tr>
                          <Th rowSpan={2} style={{ width: '22%' }}>Account Name</Th>
                          <Th colSpan={5} style={{ textAlign: 'center' }}>{acsatCycle || 'H1 2025'}</Th>
                        </tr>
                        <tr>
                          <Th style={{ width: '10%' }}>#Polled</Th>
                          <Th style={{ width: '10%' }}>#Responded</Th>
                          <Th style={{ width: '18%' }}>Business Unit</Th>
                          <Th style={{ width: '12%' }}>Response Rate %</Th>
                          <Th style={{ width: '15%' }}>Average CSAT Score</Th>
                        </tr>
                      </thead>
                      <tbody>
                        {fileData.hasData ? fileData.rows.map((row, ri) => (
                          <tr key={ri}>
                            <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                            <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(row.responseRatePct, row.responded === 0) 
                            }}>
                              {row.responded === 0 ? '0.0' : formatResponseRateOneDecimal(row.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(row.avgCSATScore, row.responded === 0) 
                            }}>
                              {row.avgCSATScore != null ? row.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                          </tr>
                        )) : (
                          <tr>
                            <Td colSpan={6} style={{ textAlign: 'center', color: '#94a3b8' }}>
                              No Top 10 accounts found in the Customer Success Survey Status report after date filter.
                            </Td>
                          </tr>
                        )}
                        {fileData.hasData && fileData.top10GrandTotalRow && (
                          <tr style={{ fontWeight: 600, backgroundColor: '#FFF2CC' }}>
                            <Td style={{ textAlign: 'left' }}>{fileData.top10GrandTotalRow.accountName}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.top10GrandTotalRow.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.top10GrandTotalRow.responded}</Td>
                            <Td style={{ textAlign: 'left' }}>{fileData.top10GrandTotalRow.businessUnit}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(fileData.top10GrandTotalRow.responseRatePct, fileData.top10GrandTotalRow.responded === 0) 
                            }}>
                              {fileData.top10GrandTotalRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(fileData.top10GrandTotalRow.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(fileData.top10GrandTotalRow.avgCSATScore, fileData.top10GrandTotalRow.responded === 0) 
                            }}>
                              {fileData.top10GrandTotalRow.avgCSATScore != null ? fileData.top10GrandTotalRow.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                          </tr>
                        )}
                        {fileData.hasData && fileData.otherAccountsRow && (
                          <tr style={{ fontWeight: 600, backgroundColor: '#93CCEA' }}>
                            <Td style={{ textAlign: 'left' }}>{fileData.otherAccountsRow.accountName}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.otherAccountsRow.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.otherAccountsRow.responded}</Td>
                            <Td style={{ textAlign: 'left' }}>{fileData.otherAccountsRow.businessUnit}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(fileData.otherAccountsRow.responseRatePct, fileData.otherAccountsRow.responded === 0) 
                            }}>
                              {fileData.otherAccountsRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(fileData.otherAccountsRow.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(fileData.otherAccountsRow.avgCSATScore, fileData.otherAccountsRow.responded === 0) 
                            }}>
                              {fileData.otherAccountsRow.avgCSATScore != null ? fileData.otherAccountsRow.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                          </tr>
                        )}
                        {fileData.hasData && fileData.overallRow && (
                          <tr style={{ fontWeight: 600, backgroundColor: '#E4DFEC' }}>
                            <Td style={{ textAlign: 'left' }}>{fileData.overallRow.accountName}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.overallRow.polled}</Td>
                            <Td style={{ textAlign: 'center' }}>{fileData.overallRow.responded}</Td>
                            <Td style={{ textAlign: 'left' }}>{fileData.overallRow.businessUnit}</Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getResponseRateColor(fileData.overallRow.responseRatePct, fileData.overallRow.responded === 0) 
                            }}>
                              {fileData.overallRow.responded === 0 ? '0.0' : formatResponseRateOneDecimal(fileData.overallRow.responseRatePct)}%
                            </Td>
                            <Td style={{ 
                              textAlign: 'center', 
                              ...getAvgCSATScoreColor(fileData.overallRow.avgCSATScore, fileData.overallRow.responded === 0) 
                            }}>
                              {fileData.overallRow.avgCSATScore != null ? fileData.overallRow.avgCSATScore.toFixed(2) : '-'}
                            </Td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableWrapper>
                </TableContainer>
              </div>
            ))
          )}
        </div>
      )}
        </React.Fragment>
      )}
    </DashboardContainer>
  );
};

export default AccountBUWiseResponseRateDashboard;
