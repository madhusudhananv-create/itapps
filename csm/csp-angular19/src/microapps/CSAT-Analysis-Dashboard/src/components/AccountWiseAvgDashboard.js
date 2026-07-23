
import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Calculator, ChevronLeft, Upload, FileSpreadsheet, X, CheckCircle, Download, Building2, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY, isDateGreaterThanOrEqual } from '../utils/dateUtils';

// Helper function to parse various date formats from Excel and convert to MM-DD-YYYY
const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  
  try {
    let date;
    
    // Handle different date formats that might come from Excel
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
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

// Proper rounding to 2 decimal places (avoids JS floating-point issues with .toFixed).
// e.g. 4.175 → "4.18" (not "4.17" as native .toFixed(2) would produce).
const avgToFixed2 = (num) => (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(2);
// e.g. 83.95 → "84.0"
const pctToFixed1 = (num) => (Math.round((num + Number.EPSILON) * 10) / 10).toFixed(1);

// Normalize portfolio keys for grouping/lookup (handle case/extra spaces)
const normalizePortfolioKey = (p) => {
  const s = (p == null ? '' : String(p)).trim();
  return (s === '' ? 'n/a' : s.toLowerCase());
};

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
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  line-height: 1.4;
  word-break: break-word;
  hyphens: auto;
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

const UploadButton = styled.button`
  background: #667eea;
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
    background: #5a67d8;
    transform: translateY(-1px);
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
    background: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const DownloadButton = styled.button`
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #047857;
    transform: translateY(-1px);
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const FileDetails = styled.div`
  flex: 1;
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

const FilterContainer = styled.div`
  padding: 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #374151;
  min-width: 120px;
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

const SearchInput = styled.input`
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
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const ResultsSummary = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin: 1rem;
  font-size: 0.875rem;
  color: #0c4a6e;
  font-weight: 500;
`;

const TableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
  margin: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const Th = styled.th`
  padding: 0.6rem 0.75rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.85rem;
  color: #ffffff; /* White text */
  background: #1e3a8a; /* Navy blue - same as ACSAT dashboard */
  border: 1px solid #9ca3af; /* Cell border */
  white-space: nowrap;

  &:hover {
    background: #1e3a8a !important;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0; /* Cell border on all sides */
  color: #000000;
  text-align: center;
  white-space: nowrap;
  font-size: 0.85rem;

  &:first-child {
    font-weight: 600;
  }
`;

// Resolve engagement type column: prefer ENGAGEMENT TYPE, then Project Engagement Type (Sheet1 or Sheet2)
const getEngagementTypeKey = (firstRow) => {
  if (!firstRow || typeof firstRow !== 'object') return null;
  const key = (k) => k && String(k).toLowerCase().replace(/\s/g, '').replace(/-/g, '');
  return Object.keys(firstRow).find(k => key(k) === 'engagementtype') ||
    Object.keys(firstRow).find(k => key(k) === 'projectengagementtype') ||
    null;
};
const isCoManagedRow = (row, colKey) => {
  if (!colKey) return false;
  const val = (row[colKey] ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
  return val === 'co managed';
};

const isFullyManagedRow = (row, colKey) => {
  if (!colKey) return false;
  const val = (row[colKey] ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
  return val === 'fully managed';
};

const isStaffAugmentationRow = (row, colKey) => {
  if (!colKey) return false;
  const val = (row[colKey] ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ').replace(/-/g, ' ');
  return val === 'staff augmentation';
};

// Perspective columns by ENGAGEMENT TYPE for "Average CSAT Scores by Perspective" dashboards.
// Grand Total perspective columns = Avg(RATING) for that perspective (by ENGAGEMENT TYPE), 2 decimal places.
// Fully Managed & Co-Managed – account-wise and BU-wise:
const FULLY_MANAGED_CO_MANAGED_PERSPECTIVES = [
  'Overall Experience',
  'Timeline Adherence',
  'Quality of Delivery',
  'Timely Resource Fulfillment',
  'Risk Management & Responsiveness',
  'Thought Leadership'
];
// Staff Augmentation – account-wise and BU-wise:
const STAFF_AUGMENTATION_PERSPECTIVES = [
  'Overall Experience',
  'Resource Competency',
  'Timely Resource Fulfillment'
];

// Normalize perspective names for display/grouping (canonical casing).
// Important: these values are used as object keys across multiple dashboards, so keep them stable.
const normalizePerspectiveForDisplay = (p) => {
  if (p == null) return p;
  const raw = String(p).trim().replace(/\u00a0/g, ' ').trim();
  if (!raw) return p;
  // Remove common "(%)" / "%" suffixes coming from Excel labels
  const s = raw.replace(/\(\s*%\s*\)/g, '').replace(/%/g, '').replace(/\s+/g, ' ').trim();
  if (!s) return p;
  const lower = s.toLowerCase();
  if (lower === 'quality of deliverables' || lower === 'quality of delivery') return 'Quality of Delivery';
  if (lower === 'overall experience') return 'Overall Experience';
  if (lower === 'timeline adherence') return 'Timeline Adherence';
  if (lower === 'timely resource fulfillment') return 'Timely Resource Fulfillment';
  if (lower === 'resource competency') return 'Resource Competency';
  if (lower === 'risk management & responsiveness' || lower === 'risk management and responsiveness') return 'Risk Management & Responsiveness';
  if (lower === 'thought leadership') return 'Thought Leadership';
  return s;
};

// Get perspective value from row, handling both "Quality of deliverables" and "Quality of Delivery" keys
const getPerspectiveValue = (row, perspective) => {
  if (!row || !perspective) return null;
  // Try normalized name first
  let value = row[perspective];
  if (value !== undefined && value !== null) return value;
  // If normalized is "Quality of Delivery", also try "Quality of deliverables"
  if (perspective === 'Quality of Delivery') {
    value = row['Quality of deliverables'];
    if (value !== undefined && value !== null) return value;
  }
  // If original is "Quality of deliverables", also try "Quality of Delivery"
  if (perspective === 'Quality of deliverables') {
    value = row['Quality of Delivery'];
    if (value !== undefined && value !== null) return value;
  }
  // Resource Competency: try "Resource Competency (%)" and other variants (same as Account/BU wise alt keys)
  if (perspective === 'Resource Competency') {
    value = row['Resource Competency (%)'];
    if (value !== undefined && value !== null) return value;
    value = row['Resource competency'];
    if (value !== undefined && value !== null) return value;
  }
  return value;
};

// Get trend % satisfied for a perspective, tolerant to key variations like "(%)", "%" and casing.
// Uses same logic as Account/BU wise: try main key then alternate keys (e.g. "Resource Competency (%)").
const getTrendPctValue = (pctObj, perspective) => {
  if (!pctObj || perspective == null) return null;
  const canon = normalizePerspectiveForDisplay(perspective);
  if (!canon) return null;
  // Direct keys (same as Account/BU wise alt list)
  const keysToTry = [
    canon,
    perspective,
    canon === 'Resource Competency' ? 'Resource Competency (%)' : null,
    canon === 'Resource Competency' ? 'Resource competency' : null,
    canon === 'Quality of Delivery' ? 'Quality of deliverables' : null,
    canon === 'Quality of deliverables' ? 'Quality of Delivery' : null,
    canon === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
    canon === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
  ].filter(Boolean);
  for (let i = 0; i < keysToTry.length; i++) {
    const k = keysToTry[i];
    const v = pctObj[k];
    if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
  }
  // Fallback: iterate all keys and match by normalized name
  const keys = Object.keys(pctObj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (normalizePerspectiveForDisplay(k) === canon) {
      const v = pctObj[k];
      if (v !== undefined && v !== null) return Number(v);
      return null;
    }
    const keyNorm = String(k).trim().toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').replace(/%/g, '').trim();
    if (keyNorm === canon.toLowerCase()) {
      const v = pctObj[k];
      if (v !== undefined && v !== null) return Number(v);
      return null;
    }
  }
  return null;
};

// Get trend average score for a perspective (Portfolio-wise Perspective wise Avg), tolerant to key variations.
const getTrendAvgValue = (avgsObj, perspective) => {
  if (avgsObj == null || perspective == null) return null;
  const canon = normalizePerspectiveForDisplay(perspective);
  if (!canon) return null;
  const v = avgsObj[canon];
  if (v !== undefined && v !== null && !Number.isNaN(Number(v))) return Number(v);
  if (avgsObj[perspective] !== undefined && avgsObj[perspective] !== null && !Number.isNaN(Number(avgsObj[perspective]))) return Number(avgsObj[perspective]);
  const keys = Object.keys(avgsObj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (normalizePerspectiveForDisplay(k) === canon) {
      const val = avgsObj[k];
      if (val !== undefined && val !== null && !Number.isNaN(Number(val))) return Number(val);
      return null;
    }
  }
  return null;
};

// Column order for Account/BU wise and Top 10 "Average CSAT Scores - Perspective Wise" (perspective columns; Total Avg last)
// Display "Quality of Delivery" instead of "Quality of deliverables"
const PERSPECTIVE_DISPLAY_ORDER = [
  'Overall Experience',
  'Timeline Adherence',
  'Quality of Delivery',
  'Timely Resource Fulfillment',
  'Resource Competency',
  'Risk Management & Responsiveness',
  'Thought Leadership'
];
const getPerspectiveOrderIndex = (p) => {
  if (!p) return PERSPECTIVE_DISPLAY_ORDER.length;
  const normalized = normalizePerspectiveForDisplay(p);
  const i = PERSPECTIVE_DISPLAY_ORDER.indexOf(normalized);
  if (i !== -1) return i;
  // Also check original name in case it's not normalized yet
  const originalIndex = PERSPECTIVE_DISPLAY_ORDER.indexOf(p);
  if (originalIndex !== -1) return originalIndex;
  return PERSPECTIVE_DISPLAY_ORDER.length;
};
const sortPerspectivesByDisplayOrder = (arr) => {
  if (!arr || arr.length === 0) return [];
  // Normalize perspectives for display, then sort
  return [...arr].map(p => normalizePerspectiveForDisplay(p))
    .filter((p, index, self) => self.indexOf(p) === index) // Remove duplicates after normalization
    .sort((a, b) => {
      const i = getPerspectiveOrderIndex(a);
      const j = getPerspectiveOrderIndex(b);
      if (i !== j) return i - j;
      return String(a).localeCompare(String(b));
    });
};

const getTrendPerspectiveHeaderLabel = (p) => {
  const normalized = normalizePerspectiveForDisplay(p);
  if (normalized === 'Timely Resource Fulfillment') return 'Trend for Timely Resource Fulfillment';
  return `Trend for ${normalized}`;
};

const getPracticeWiseTrendPerspectiveHeaderLabel = (p) => {
  const normalized = normalizePerspectiveForDisplay(p);
  if (normalized === 'Risk Management & Responsiveness') return 'Risk Management & Responsivenes';
  return normalized;
};

const parsePracticePerspectiveNumber = (row, perspective) => {
  const raw = getPerspectiveValue(row, perspective);
  if (raw == null || raw === '' || raw === '-' || raw === '－') return null;
  const n = parseFloat(raw);
  return Number.isNaN(n) ? null : n;
};

const computePracticePerspectiveTrendDisplay = (currentRow, trendRow, perspective, hyphenForPerspectiveOnly) => {
  if (hyphenForPerspectiveOnly || !trendRow) {
    return { display: '-', color: '#1e293b' };
  }
  let currentVal = parsePracticePerspectiveNumber(currentRow, perspective);
  let trendVal = parsePracticePerspectiveNumber(trendRow, perspective);
  const altPerspectives = [
    perspective === 'Quality of Delivery' ? 'Quality of deliverables' : null,
    perspective === 'Quality of deliverables' ? 'Quality of Delivery' : null,
    perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
    perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
  ].filter(Boolean);
  if (currentVal == null) {
    for (const altP of altPerspectives) {
      currentVal = parsePracticePerspectiveNumber(currentRow, altP);
      if (currentVal != null) break;
    }
  }
  if (trendVal == null) {
    for (const altP of altPerspectives) {
      trendVal = parsePracticePerspectiveNumber(trendRow, altP);
      if (trendVal != null) break;
    }
  }
  if (currentVal == null && trendVal == null) {
    return { display: '-', color: '#1e293b' };
  }
  const effectiveMain = currentVal != null ? currentVal : (trendVal != null ? 0 : null);
  const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
  if (diff == null) {
    return { display: '-', color: '#1e293b' };
  }
  const diffRounded = Math.round(diff * 100) / 100;
  const display = `${diffRounded >= 0 ? '+' : ''}${diffRounded.toFixed(2)} ${diffRounded > 0 ? '↑' : diffRounded < 0 ? '↓' : '−'}`;
  const color = diffRounded > 0 ? '#166534' : diffRounded < 0 ? '#dc2626' : '#6b7280';
  return { display, color };
};

const PRACTICE_AVG_FILE_URL = '/data/New_customer_feedback_analysis_New.xlsx';
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

// Filters detail rows (sheet1 "CSAT received Report") and second-sheet rows (sheet2 "CSAT sent and received Report")
// down to a single Business Unit, using the second sheet's own BUSINESS UNIT column plus a CUST_ID -> BUSINESS UNIT
// map (since sheet1 rows don't always carry BUSINESS UNIT directly). Returns the inputs unchanged when no filter is set.
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

const matchesBusinessUnitFilter = (row, businessUnitFilter) => {
  if (!businessUnitFilter) return true;
  const bu = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim();
  return bu.toLowerCase().includes(businessUnitFilter.toLowerCase());
};

const buildPracticeWiseAvgFromReceivedReport = (source, csatCycleStartDateFormatted, secondSheetSource = null) => {
  if (!source || !Array.isArray(source) || source.length === 0) {
    return { rows: [], perspectives: [], orgLevelRow: null };
  }

  const polledRespondedByPractice = new Map();
  if (secondSheetSource && secondSheetSource.length > 0) {
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

    secondSheetSource.forEach(row => {
      const practice = (row[practiceCol2] ?? row['Practice'] ?? row['PRACTICE'] ?? '').toString().trim();
      if (!practice || practice.toLowerCase() === 'n/a') return;
      if (!polledRespondedByPractice.has(practice)) {
        polledRespondedByPractice.set(practice, { polled: 0, responded: 0 });
      }
      const rec = polledRespondedByPractice.get(practice);
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'] ?? row['CSS SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) {
          rec.polled++;
        }
      }
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'] ?? row['CSS RECEIVED DATE'];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
        if (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted))) {
          rec.responded++;
        }
      }
    });
  }

  const practiceByCustomerId = new Map();
  if (secondSheetSource && secondSheetSource.length > 0) {
    secondSheetSource.forEach((row) => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      if (!customerId) return;
      const key = String(customerId).trim();
      const practiceVal = (row['Practice'] ?? row['PRACTICE'] ?? row['practice'] ?? row['PRACTICE MAPPED'] ?? row['Practice Mapped'] ?? '').toString().trim();
      if (!practiceVal || practiceVal.toLowerCase() === 'n/a') return;
      const existingVal = practiceByCustomerId.get(key);
      if (!existingVal || existingVal.toLowerCase() === 'n/a') {
        practiceByCustomerId.set(key, practiceVal);
      }
    });
  }
  const firstRow = source[0] || {};
  const practiceCol = Object.keys(firstRow).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
  const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
  const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
  const receivedDateKey = Object.keys(firstRow).find(k => {
    const kk = String(k).toLowerCase();
    return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
  });

  const ratingsByPractice = new Map();
  const perspectiveSet = new Set();

  source.forEach(row => {
    const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
    if (qc === 'Qualitative Feedback') return;

    if (csatCycleStartDateFormatted && receivedDateKey) {
      const receivedVal = row[receivedDateKey];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const d = parseExcelDateToMMDDYYYY(receivedVal);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
    }

    const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
    const rawPractice = (row[practiceCol] ?? row['Practice'] ?? row['PRACTICE'] ?? '').toString().trim();
    const practiceFromSecond = customerId ? (practiceByCustomerId.get(String(customerId).trim()) || '') : '';
    const practice = rawPractice && rawPractice.toLowerCase() !== 'n/a'
      ? rawPractice
      : (practiceFromSecond || 'N/A');
    if (!practice || practice === 'N/A') return;
    const perspectiveRaw = row[perspectiveCol] ?? row['PERSPECTIVE'];
    if (!perspectiveRaw || perspectiveRaw === 'Qualitative Feedback') return;
    const perspective = normalizePerspectiveForDisplay(perspectiveRaw);
    const rating = parseFloat(row[ratingCol] ?? row['RATING']);
    if (isNaN(rating)) return;

    perspectiveSet.add(perspective);
    if (!ratingsByPractice.has(practice)) ratingsByPractice.set(practice, {});
    const g = ratingsByPractice.get(practice);
    if (!g[perspective]) g[perspective] = [];
    g[perspective].push(rating);
  });

  const perspectivesList = sortPerspectivesByDisplayOrder([...perspectiveSet].filter(p => p !== 'Qualitative Feedback'));

  const allPractices = new Set([
    ...ratingsByPractice.keys(),
    ...polledRespondedByPractice.keys()
  ]);

  let rows = [...allPractices].map((practice) => {
    const ratingsByP = ratingsByPractice.get(practice) || {};
    const pr = polledRespondedByPractice.get(practice) || { polled: 0, responded: 0 };
    const resultRow = {
      practice,
      Polled: pr.polled,
      Responded: pr.responded
    };
    if (pr.responded === 0) {
      perspectivesList.forEach(p => { resultRow[p] = '-'; });
    } else {
      perspectivesList.forEach(p => {
        const ratings = (ratingsByP[p] || []).filter(r => r > 0 && !isNaN(r));
        resultRow[p] = ratings.length > 0
          ? avgToFixed2(ratings.reduce((s, r) => s + r, 0) / ratings.length)
          : '-';
      });
    }
    return resultRow;
  }).filter(row => row.Polled > 0 || row.Responded > 0 || perspectivesList.some(p => row[p] !== '-'));

  rows.sort((a, b) => {
    const ia = getPracticeOrderIndex(a.practice);
    const ib = getPracticeOrderIndex(b.practice);
    if (ia !== ib) return ia - ib;
    return (a.practice || '').localeCompare(b.practice || '');
  });
  rows = rows.map((r, i) => ({ ...r, sNo: i + 1 }));

  const orgPerspectiveRatings = {};
  let orgPolled = 0;
  let orgResponded = 0;
  if (secondSheetSource && secondSheetSource.length > 0) {
    const shFirst = secondSheetSource[0] || {};
    const sentDateColOrg = Object.keys(shFirst).find(k => {
      const lower = String(k || '').toLowerCase();
      return k === 'CSAT SENT DATE' || lower.includes('csat_sent_date') || lower.includes('css_sent_date') || lower.includes('sent date');
    }) || 'CSAT SENT DATE';
    const receivedDateColOrg = Object.keys(shFirst).find(k => {
      const lower = String(k || '').toLowerCase();
      return k === 'CSAT RECEIVED DATE' || lower.includes('csat_received_date') || lower.includes('css_received_date') || lower.includes('received date');
    }) || 'CSAT RECEIVED DATE';
    secondSheetSource.forEach(row => {
      const sentVal = row[sentDateColOrg] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'] ?? row['CSS SENT DATE'];
      if (sentVal != null && sentVal !== '' && sentVal !== 'N/A') {
        const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
        if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) {
          orgPolled++;
        }
      }
      const receivedVal = row[receivedDateColOrg] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'] ?? row['CSS RECEIVED DATE'];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
        if (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted))) {
          orgResponded++;
        }
      }
    });
  } else {
    polledRespondedByPractice.forEach((pr) => {
      orgPolled += pr.polled || 0;
      orgResponded += pr.responded || 0;
    });
  }

  source.forEach(row => {
    const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
    if (qc === 'Qualitative Feedback') return;
    if (csatCycleStartDateFormatted && receivedDateKey) {
      const receivedVal = row[receivedDateKey];
      if (receivedVal != null && receivedVal !== '' && receivedVal !== 'N/A') {
        const d = parseExcelDateToMMDDYYYY(receivedVal);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
    }
    const perspectiveRaw = row[perspectiveCol] ?? row['PERSPECTIVE'];
    if (!perspectiveRaw || perspectiveRaw === 'Qualitative Feedback') return;
    const perspective = normalizePerspectiveForDisplay(perspectiveRaw);
    const rating = parseFloat(row[ratingCol] ?? row['RATING']);
    if (!perspective || isNaN(rating)) return;
    if (!orgPerspectiveRatings[perspective]) orgPerspectiveRatings[perspective] = [];
    orgPerspectiveRatings[perspective].push(rating);
  });

  const orgLevelRow = {
    practice: 'Org level',
    sNo: '',
    isOrgLevel: true,
    Polled: orgPolled,
    Responded: orgResponded
  };
  if (orgResponded === 0) {
    perspectivesList.forEach(p => { orgLevelRow[p] = '-'; });
  } else {
    perspectivesList.forEach(p => {
      const ratings = (orgPerspectiveRatings[p] || []).filter(r => r > 0 && !isNaN(r));
      orgLevelRow[p] = ratings.length > 0
        ? avgToFixed2(ratings.reduce((s, r) => s + r, 0) / ratings.length)
        : '-';
    });
  }

  return { rows, perspectives: perspectivesList, orgLevelRow };
};

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

const normalizeCustomerIdKey = (value) => {
  if (value == null) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  // Normalize numeric ids like "123.0" -> "123"
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!Number.isNaN(num) && Number.isInteger(num)) return String(num);
  }
  return raw;
};

// Top 10 account: consider TYPE OF ACCOUNT = "Top 10" or legacy column "Top 10" = "Y" as same
const isTop10AccountRow = (row) => {
  const typeOfAccount = (row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
  return typeOfAccount === 'Top 10' || typeOfAccount.toUpperCase() === 'Y';
};

const AccountWiseAvgDashboard = ({ onBack, excelData, engagementTypeFilter = null, trendAnalysisFiles = [] }) => {
  // Get CSAT cycle start date and ACSAT cycle from context
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  // Dynamic "Trend analysis (<main period> Vs <comparison period>)" header label, driven by the
  // actual selected main period (acsatCycle) and the most recently fetched/uploaded comparison period.
  const trendComparisonPeriodLabel = (trendAnalysisFiles && trendAnalysisFiles.length > 0)
    ? (trendAnalysisFiles[trendAnalysisFiles.length - 1].saveName || trendAnalysisFiles[trendAnalysisFiles.length - 1].originalName || 'comparison period')
    : 'comparison period';
  const trendHeaderLabel = `Trend analysis (${acsatCycle || 'current period'} Vs ${trendComparisonPeriodLabel})`;
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [accountCustomerFilter, setAccountCustomerFilter] = useState('');
  const [showTop10, setShowTop10] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showBUWiseView, setShowBUWiseView] = useState(false);
  const [showPracticeWise, setShowPracticeWise] = useState(false);
  const [practiceFileReceivedData, setPracticeFileReceivedData] = useState(null);
  const [practiceFileSheet2Data, setPracticeFileSheet2Data] = useState(null);
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  const [showProjectData, setShowProjectData] = useState(false);
  const projectDataSectionRef = React.useRef(null);

  useEffect(() => {
    if (showProjectData && projectDataSectionRef.current) {
      projectDataSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showProjectData]);

  useEffect(() => {
    if (!showPracticeWise) return;
    const base = typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const url = (base.replace(/\/$/, '') || '') + PRACTICE_AVG_FILE_URL;
    fetch(url)
      .then(res => { if (!res.ok) throw new Error('File not found'); return res.arrayBuffer(); })
      .then(buffer => {
        const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
        const sheetNames = workbook.SheetNames || [];
        const sheet1Name = sheetNames.find(SHEET1_RECEIVED_NAME_MATCH) || sheetNames[0];
        if (!sheet1Name || !workbook.Sheets[sheet1Name]) {
          setPracticeFileReceivedData(null);
          setPracticeFileSheet2Data(null);
          return;
        }
        const sheet1Data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet1Name], { defval: '' });
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
  }, [showPracticeWise]);

  // Display "Health care" / "Health Care" as "Healthcare"; display "Sead" as "SEAD"
  const normalizeBusinessUnitDisplay = (bu) => {
    if (bu == null || bu === '') return bu;
    const s = String(bu).trim();
    // Robust BU normalization: treat Health care / Health Care / Healthcare (and minor punctuation/hidden spaces) as same
    if (s.toLowerCase().replace(/[^a-z0-9]/g, '') === 'healthcare') return 'Healthcare';
    if (s.toLowerCase() === 'sead') return 'SEAD';
    return bu;
  };
  // BUSINESS UNIT display order: Healthcare, CIT, Tech, India & UK, SEAD. Used for dashboard tables and Excel export.
  const BUSINESS_UNIT_DISPLAY_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK', 'SEAD'];
  const getBusinessUnitOrderIndex = (bu) => {
    if (bu == null || bu === '') return -1;
    const s = String(bu).trim();
    let normalized = s.toLowerCase().replace(/[^a-z0-9]/g, '') === 'healthcare' ? 'Healthcare' : s;
    if (normalized.toLowerCase() === 'sead') normalized = 'SEAD';
    const i = BUSINESS_UNIT_DISPLAY_ORDER.indexOf(normalized);
    if (i !== -1) return i;
    const byLower = BUSINESS_UNIT_DISPLAY_ORDER.findIndex(b => String(b).toLowerCase() === normalized.toLowerCase());
    return byLower >= 0 ? byLower : -1;
  };
  // Portfolio display order for Premier Healthcare dashboards
  const PORTFOLIO_DISPLAY_ORDER = [
    'Clinical Intelligence',
    'Margin Improvement',
    'Foundations',
    'Corp Apps',
    'Supply Chain',
    'PAS',
    'Remitra',
    'Infrastructure'
  ];
  const getPortfolioOrderIndex = (portfolio) => {
    if (!portfolio) return 999;
    const s = String(portfolio).trim();
    const idx = PORTFOLIO_DISPLAY_ORDER.findIndex(p => p.toLowerCase() === s.toLowerCase());
    return idx >= 0 ? idx : 999;
  };
  const sortByPortfolioOrder = (a, b) => {
    const iA = getPortfolioOrderIndex(a.portfolio);
    const iB = getPortfolioOrderIndex(b.portfolio);
    if (iA !== iB) return iA - iB;
    return (a.portfolio || '').localeCompare(b.portfolio || '');
  };

  // Check if BUSINESS UNIT is SEAD (for display normalization only - SEAD is treated same as other BUs for rating calculation)
  const isSeadBU = (bu) => String(bu ?? '').trim().toLowerCase() === 'sead';
  
  // REMOVED special SEAD handling - SEAD should calculate avg rating same as other BUs
  // isSeadAndPolledZero now always returns false so SEAD is treated like any other BU
  const isSeadAndPolledZero = (row) => {
    // SEAD BU should use same logic as other BUs - calculate avg rating when rating data exists
    // Return false to disable special SEAD handling
    return false;
  };
  
  // Normalize BU for grouping so "Sead" and "SEAD" are the same; return display form (SEAD, Healthcare).
  const normalizeBUForGrouping = (bu) => {
    if (bu == null || bu === '') return bu;
    const s = String(bu).trim();
    if (s.toLowerCase().replace(/[^a-z0-9]/g, '') === 'healthcare') return 'Healthcare';
    if (s.toLowerCase() === 'sead') return 'SEAD';
    return s;
  };
  
  // Show hyphen only in perspective columns when there's NO rating data (same logic for ALL BUs including SEAD)
  const showHyphenForPerspectiveColumns = (row) => {
    if (!row) return false;
    // Only show hyphen if there's no rating data - NOT based on BU type
    return false; // Let the perspective value itself determine if hyphen should be shown
  };

  // Utility function to compare dates (MM-DD-YYYY format)
  const isDateGreaterThanOrEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const [month1, day1, year1] = date1.split('-').map(Number);
    const [month2, day2, year2] = date2.split('-').map(Number);
    
    if (year1 !== year2) return year1 > year2;
    if (month1 !== month2) return month1 > month2;
    return day1 >= day2;
  };

  // Auto-process data when excelData prop is received
  useEffect(() => {
    if (excelData) {
      console.log('=== AUTO-PROCESSING EXCEL DATA ===');
      console.log('excelData structure:', excelData);
      console.log('excelData keys:', Object.keys(excelData));
      
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
        setUploadStatus({ type: 'success', message: `Successfully loaded ${dataToProcess.length} records from Excel file.` });
      } else {
        console.error('No data to process');
      }
    } else {
      console.log('No excelData received or excelData is empty');
    }
  }, [excelData]);

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadedData(null);
    } else {
      setUploadStatus({ type: 'error', message: 'Please select a valid Excel file (.xlsx)' });
    }
  };

  const handleFileInput = (e) => {
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
          
          let sheetName = 'CSAT received Report';
          if (!workbook.SheetNames.includes(sheetName)) {
            sheetName = workbook.SheetNames[0];
          }
          
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 2) {
            reject(new Error('No data found'));
            return;
          }

          const headers = jsonData[0];
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

  // Function to sanitize sheet names for Excel compatibility
  const sanitizeSheetName = (name) => {
    return name
      .replace(/[\/\\\?\*\[\]]/g, '_') // Replace invalid characters with underscore
      .substring(0, 31); // Excel sheet names are limited to 31 characters
  };

  // Function to get sorted data with correct Sr. No. assignment
  const getSortedData = (data, isTop10View = false) => {
    // Separate special rows (Org Level, Count, Top 10 Accounts, Top 10 Count, Other Account, Other Account Count, Overall) from regular rows
    const orgLevelRow = data.find(row => row.isOrgLevel);
    const countRow = data.find(row => row.isCountRow);
    const top10AccountsRow = data.find(row => row.isTop10Accounts);
    const top10CountRow = data.find(row => row.isTop10CountRow);
    const otherAccountRow = data.find(row => row.isOtherAccount);
    const otherAccountCountRow = data.find(row => row.isOtherAccountCountRow);
    const overallRow = data.find(row => row.isOverall);
    const overallCountRow = data.find(row => row.isOverallCountRow);
    const regularRows = data.filter(row => !row.isOrgLevel && !row.isCountRow && !row.isTop10Accounts && !row.isTop10CountRow && !row.isOtherAccount && !row.isOtherAccountCountRow && !row.isOverall && !row.isOverallCountRow);
    
    let sorted;
    if (isTop10View) {
      // Top 10 view: preserve fixed order and Sr. No. (1–12) already set in filteredData
      sorted = [...regularRows];
    } else if (!sortConfig.key) {
      // Default order: BUSINESS UNIT order (Health Care/Health care, CIT, Tech, India & UK, Sead)
      sorted = [...regularRows].sort((a, b) => {
        const indexA = getBusinessUnitOrderIndex(a.businessUnit);
        const indexB = getBusinessUnitOrderIndex(b.businessUnit);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return (a.businessUnit || '').localeCompare(b.businessUnit || '');
      });
    } else {
      sorted = [...regularRows].sort((a, b) => {
        if (sortConfig.key === 'businessUnit') {
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== -1 && indexB !== -1) {
            return sortConfig.direction === 'asc' ? indexA - indexB : indexB - indexA;
          }
          if (indexA !== -1) return sortConfig.direction === 'asc' ? -1 : 1;
          if (indexB !== -1) return sortConfig.direction === 'asc' ? 1 : -1;
          return sortConfig.direction === 'asc' ? (a.businessUnit || '').localeCompare(b.businessUnit || '') : (b.businessUnit || '').localeCompare(a.businessUnit || '');
        }

        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'sNo' || sortConfig.key === 'category' || sortConfig.key === 'customerCount' || 
            sortConfig.key === 'cssSentCount' || sortConfig.key === 'cssReceivedCount' ||
            sortConfig.key === 'Polled' || sortConfig.key === 'Responded') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }

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
        
        // If values are equal, maintain business unit order as secondary sort
        const indexA = getBusinessUnitOrderIndex(a.businessUnit);
        const indexB = getBusinessUnitOrderIndex(b.businessUnit);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return 0;
      });
    }
    
    // Reassign Sr. No. after sorting (Top 10 view keeps existing sNo 1–12)
    const sortedWithSrNo = isTop10View ? sorted : sorted.map((row, index) => ({
      ...row,
      sNo: index + 1
    }));
    
    // Add special rows at the end in correct order
    const result = [...sortedWithSrNo];
    
    // Add Top 10 Accounts row, then Top 10 Count row, then Other Account row after it, then Overall row
    if (top10AccountsRow) {
      top10AccountsRow.sNo = ''; // Keep empty for Top 10 Accounts row
      result.push(top10AccountsRow);
    }

    if (top10CountRow) {
      top10CountRow.sNo = '';
      result.push(top10CountRow);
    }
    
    // Add Other Account row after Top 10 Count row
    if (otherAccountRow) {
      otherAccountRow.sNo = ''; // Keep empty for Other Account row
      result.push(otherAccountRow);
    }

    // Add Other Account Count row after Other Account row
    if (otherAccountCountRow) {
      otherAccountCountRow.sNo = '';
      result.push(otherAccountCountRow);
    }
    
    // Add Overall row after Other Account Count row
    if (overallRow) {
      overallRow.sNo = ''; // Keep empty for Overall row
      result.push(overallRow);
    }

    // Add Overall Count row after Overall row
    if (overallCountRow) {
      overallCountRow.sNo = '';
      result.push(overallCountRow);
    }
    
    // Add Org Level row at the end (for BU-wise view)
    if (orgLevelRow) {
      orgLevelRow.sNo = ''; // Keep empty for Org Level row
      result.push(orgLevelRow);
    }

    // Add Count row right after Org Level row
    if (countRow) {
      countRow.sNo = '';
      result.push(countRow);
    }
    
    return result;
  };

  const buildProjectDataExcel = async (sourceData, filenamePrefix) => {
    const { data, perspectives } = sourceData;
    if (!data || data.length === 0) {
      alert('No project data to download');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sanitizeSheetName('Project_Data_Perspective_Wise'), { views: [{ state: 'frozen', ySplit: 1 }] });
    const headers = ['Sr. No.', 'Account Name', 'Project Name', 'Respondent Name', ...perspectives.map(p => normalizePerspectiveForDisplay(p))];
    sheet.addRow(headers);
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    headerRow.eachCell(c => {
      c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
    data.forEach(row => {
      const rowData = [row.sNo, row.accountName, row.projectName, row.respondentName, ...perspectives.map(p => (row[p] !== '' && row[p] != null) ? row[p] : '')];
      const dataRow = sheet.addRow(rowData);
      dataRow.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: colNumber <= 4 ? (colNumber === 1 ? 'center' : 'left') : 'center', vertical: 'middle', wrapText: true };
        if (colNumber >= 5) {
          const val = rowData[colNumber - 1];
          const leg = getRatingLegendForValue(val);
          if (leg) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: leg.argb } };
            cell.font = { color: { argb: leg.text === '#ffffff' ? 'FFFFFFFF' : 'FF000000' }, bold: true };
          } else if (val === '' || val === '-') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
          }
        }
      });
    });
    const legendStartRow = data.length + 3;
    sheet.getRow(legendStartRow).getCell(1).value = 'Legend (RATING): 1=Dark Red, 2=Red, 3=Amber, 4=Yellow, 5=Green';
    sheet.getRow(legendStartRow).getCell(1).font = { bold: true, size: 12 };
    [
      { label: '1 = Dark Red', argb: 'FFb91c1c', text: 'FFFFFFFF' },
      { label: '2 = Red', argb: 'FFef4444', text: 'FF000000' },
      { label: '3 = Amber', argb: 'FFF59E0B', text: 'FF000000' },
      { label: '4 = Yellow', argb: 'FFeab308', text: 'FF000000' },
      { label: '5 = Green', argb: 'FF22c55e', text: 'FF000000' }
    ].forEach((item, i) => {
      const r = sheet.getRow(legendStartRow + 1 + i);
      r.getCell(1).value = item.label;
      r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: item.argb } };
      r.getCell(1).font = { color: { argb: item.text }, bold: true };
    });
    sheet.getColumn(1).width = 10;
    sheet.getColumn(2).width = 22;
    sheet.getColumn(3).width = 22;
    sheet.getColumn(4).width = 22;
    perspectives.forEach((_, i) => { sheet.getColumn(5 + i).width = 18; });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filenamePrefix}_${csatCycleStartDateFormatted || 'export'}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadProjectDataFromMainFile = async () => {
    try {
      await buildProjectDataExcel(projectDataFromMainFile, 'Project_Data_Main_File_Perspective_Wise');
    } catch (err) {
      console.error('Project data (main file) Excel export error:', err);
      alert('Failed to export project data to Excel.');
    }
  };

  const downloadProjectData = async () => {
    try {
      await buildProjectDataExcel(projectDataWithPerspectives, 'Project_Data_Trend_File_Perspective_Wise');
    } catch (err) {
      console.error('Project data (trend file) Excel export error:', err);
      alert('Failed to export project data to Excel.');
    }
  };

  const downloadPracticeWiseData = async () => {
    try {
      const rows = practiceWiseData.rows || [];
      const pList = PERSPECTIVE_DISPLAY_ORDER;
      if (!rows.length) {
        alert('No practice-wise data available to download');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Avg CSAT');
      const trendHeaders = showTrendAnalysis ? pList.map(p => getPracticeWiseTrendPerspectiveHeaderLabel(p)) : [];
      const headers = ['Sr. No.', 'Practice', 'Polled', 'Responded', ...pList.map(p => normalizePerspectiveForDisplay(p)), ...trendHeaders];
      if (showTrendAnalysis && trendHeaders.length > 0) {
        const headerRow1 = worksheet.addRow([
          'Sr. No.',
          'Practice',
          'Polled',
          'Responded',
          (acsatCycle || 'H2 2025'),
          ...Array(pList.length - 1).fill(''),
          trendHeaderLabel,
          ...Array(trendHeaders.length - 1).fill('')
        ]);
        const headerRow2 = worksheet.addRow([
          '', '', '', '',
          ...pList.map(p => normalizePerspectiveForDisplay(p)),
          ...trendHeaders
        ]);
        worksheet.mergeCells(1, 5, 1, 4 + pList.length);
        worksheet.mergeCells(1, 5 + pList.length, 1, 4 + pList.length + trendHeaders.length);
        [headerRow1, headerRow2].forEach((hr) => {
          hr.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          hr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          hr.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
        });
        const trendStartCol = 5 + pList.length;
        headerRow1.getCell(trendStartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        headerRow1.getCell(trendStartCol).font = { bold: true, color: { argb: 'FF000000' } };
        trendHeaders.forEach((_, idx) => {
          headerRow2.getCell(trendStartCol + idx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          headerRow2.getCell(trendStartCol + idx).font = { bold: true, color: { argb: 'FF000000' } };
        });
      } else {
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        headerRow.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
      }

      getSortedData(rows).forEach((row) => {
        const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
        const trendRow = practiceWiseTrendLookup[(row.practice || '').toString().trim().toLowerCase()] || null;
        const trendValues = showTrendAnalysis
          ? pList.map((p) => computePracticePerspectiveTrendDisplay(row, trendRow, p, hyphenForPerspectiveOnly).display)
          : [];
        const rowValues = [
          row.sNo,
          row.practice,
          row.Polled ?? 0,
          row.Responded ?? 0,
          ...pList.map(p => hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p))),
          ...trendValues
        ];
        const dataRow = worksheet.addRow(rowValues);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        pList.forEach((p, colIndex) => {
          const val = hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p));
          const cell = dataRow.getCell(colIndex + 5);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.value = val;
          if (val === '-' || val === '－') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else {
            const score = parseFloat(val || 0);
            if (score < 4) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score >= 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
        if (showTrendAnalysis) {
          pList.forEach((p, idx) => {
            const { display, color } = computePracticePerspectiveTrendDisplay(row, trendRow, p, hyphenForPerspectiveOnly);
            const cell = dataRow.getCell(5 + pList.length + idx);
            cell.value = display;
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            const fg = color === '#166534' ? 'FF166534' : color === '#dc2626' ? 'FFDC2626' : 'FF6B7280';
            cell.font = { bold: true, color: { argb: fg } };
          });
        }
      });

      if (practiceWiseData.orgLevelRow) {
        const row = practiceWiseData.orgLevelRow;
        const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
        const trendRow = practiceWiseTrendData.orgLevelRow || null;
        const trendValues = showTrendAnalysis
          ? pList.map((p) => computePracticePerspectiveTrendDisplay(row, trendRow, p, hyphenForPerspectiveOnly).display)
          : [];
        const rowValues = [
          row.sNo ?? '',
          row.practice,
          row.Polled ?? 0,
          row.Responded ?? 0,
          ...pList.map(p => hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p))),
          ...trendValues
        ];
        const dataRow = worksheet.addRow(rowValues);
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          cell.font = { ...(cell.font || {}), bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        pList.forEach((p, colIndex) => {
          const val = hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p));
          const cell = dataRow.getCell(colIndex + 5);
          cell.value = val;
          if (!(val === '-' || val === '－')) {
            const score = parseFloat(val || 0);
            if (score < 4) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score >= 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
        if (showTrendAnalysis) {
          pList.forEach((p, idx) => {
            const { display, color } = computePracticePerspectiveTrendDisplay(row, trendRow, p, hyphenForPerspectiveOnly);
            const cell = dataRow.getCell(5 + pList.length + idx);
            cell.value = display;
            const fg = color === '#166534' ? 'FF166534' : color === '#dc2626' ? 'FFDC2626' : 'FF6B7280';
            cell.font = { bold: true, color: { argb: fg } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          });
        }
      }

      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 28;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 12;
      pList.forEach((_, i) => { worksheet.getColumn(i + 5).width = 18; });
      if (showTrendAnalysis) {
        pList.forEach((_, i) => { worksheet.getColumn(i + 5 + pList.length).width = 22; });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Practice_wise_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise Excel export error:', err);
      alert('Failed to export practice-wise data to Excel.');
    }
  };

  const downloadPracticeWiseTrendData = async () => {
    try {
      const rows = practiceWiseTrendData.rows || [];
      const pList = PERSPECTIVE_DISPLAY_ORDER;
      if (!rows.length) {
        alert('No practice-wise trend analysis data available to download. Fetch or upload a comparison period and open Trend Analysis.');
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise Avg CSAT (Trend)');
      const headers = ['Sr. No.', 'Practice', 'Polled', 'Responded', ...pList.map(p => normalizePerspectiveForDisplay(p))];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });

      rows.forEach((row) => {
        const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
        const rowValues = [
          row.sNo,
          row.practice,
          row.Polled ?? 0,
          row.Responded ?? 0,
          ...pList.map(p => hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p)))
        ];
        const dataRow = worksheet.addRow(rowValues);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        pList.forEach((p, colIndex) => {
          const val = hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(row, p));
          const cell = dataRow.getCell(colIndex + 5);
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.value = val;
          if (val === '-' || val === '－') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else {
            const score = parseFloat(val || 0);
            if (score < 4) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score >= 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
      });

      if (practiceWiseTrendData.orgLevelRow) {
        const orgRow = practiceWiseTrendData.orgLevelRow;
        const hyphenForPerspectiveOnly = (orgRow.Responded ?? 0) === 0;
        const rowValues = [
          orgRow.sNo ?? '',
          orgRow.practice,
          orgRow.Polled ?? 0,
          orgRow.Responded ?? 0,
          ...pList.map(p => hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(orgRow, p)))
        ];
        const dataRow = worksheet.addRow(rowValues);
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          cell.font = { ...(cell.font || {}), bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        pList.forEach((p, colIndex) => {
          const val = hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(getPerspectiveValue(orgRow, p));
          const cell = dataRow.getCell(colIndex + 5);
          cell.value = val;
          if (!(val === '-' || val === '－')) {
            const score = parseFloat(val || 0);
            if (score < 4) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (score >= 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
      }

      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 28;
      worksheet.getColumn(3).width = 10;
      worksheet.getColumn(4).width = 12;
      pList.forEach((_, i) => { worksheet.getColumn(i + 5).width = 18; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const trendSuffix = practiceWiseTrendData.sourceName
        ? practiceWiseTrendData.sourceName.replace(/\.xlsx?$/i, '')
        : 'Trend_Analysis';
      a.download = `Practice_wise_Average_CSAT_Scores_Trend_Analysis_${trendSuffix}_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise trend analysis Excel export error:', err);
      alert('Failed to export practice-wise trend analysis data to Excel.');
    }
  };

  const downloadData = async () => {
    try {
      if (showPracticeWise) {
        await downloadPracticeWiseData();
        return;
      }
      if (showBUWiseView) {
        if (!buWiseData || buWiseData.length === 0) {
          alert('No BU-wise data available to download');
          return;
        }

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('BU Wise CSAT Scores');
        
        // Get perspectives from BU-wise data (order by PERSPECTIVE_DISPLAY_ORDER) - exclude engagement columns
        const currentPerspectivesRaw = Object.keys(buWiseData[0] || {}).filter(key => 
          !['sNo', 'businessUnit', 'customerCount', 'stakeholdersPolledCount', 'cssSentCount', 'cssReceivedCount', 'fullyManaged', 'coManaged', 'staffAugmentation', 'isOrgLevel', 'isCountRow'].includes(key)
        );
        const currentPerspectives = sortPerspectivesByDisplayOrder(currentPerspectivesRaw);
        
        // Prepare two header rows: row 1 with "H2 2025" (merged over # Accounts Polled, Number of Customer Stakeholders Polled, #Polled, #Responded, perspectives), "Number of Stakeholders by Project Engagement Type" (merged over 3), "Trend analysis (H2 Vs H1)"; row 2 with sub-headers
        const trendHeaders = showTrendAnalysis ? currentPerspectives.map(p => sanitizeSheetName(normalizePerspectiveForDisplay(p))) : [];
        const h2ColSpan = 4 + currentPerspectives.length;
        const headerRow1 = [
          'Sr. No.',
          'Business Unit',
          (acsatCycle || 'H2 2025'),
          ...Array(h2ColSpan - 1).fill(''),
          'Number of Stakeholders by Project Engagement Type',
          '', '',
          ...(showTrendAnalysis && trendHeaders.length > 0 ? [trendHeaderLabel, ...Array(trendHeaders.length - 1).fill('')] : [])
        ];
        const numDataCols = 9 + currentPerspectives.length + (trendHeaders.length || 0);
        const headerRow2 = [
          '', '',
          '# Accounts Polled',
          'Number of Customer Stakeholders Polled',
          '#Polled',
          '#Responded',
          ...currentPerspectives.map(perspective => sanitizeSheetName(normalizePerspectiveForDisplay(perspective))),
          'Fully Managed',
          'Co-Managed',
          'Staff Augmentation',
          ...trendHeaders
        ];
        
        worksheet.addRow(headerRow1);
        worksheet.addRow(headerRow2);
        worksheet.mergeCells(1, 3, 1, 3 + h2ColSpan - 1); // H2 2025 over # Accounts Polled, #Polled, #Responded, perspectives
        const row1 = worksheet.getRow(1);
        row1.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        worksheet.mergeCells(1, 3 + h2ColSpan, 1, 3 + h2ColSpan + 2); // Number of Stakeholders by Project Engagement Type
        if (showTrendAnalysis && trendHeaders.length > 0) {
          const trendStartCol = 3 + h2ColSpan + 3;
          worksheet.mergeCells(1, trendStartCol, 1, trendStartCol + trendHeaders.length - 1);
          row1.getCell(trendStartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(trendStartCol).font = { bold: true, color: { argb: 'FF000000' } };
          row1.getCell(trendStartCol).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        }
        
        // Style both header rows - Navy blue; then re-apply light blue for "Number of Stakeholders by Project Engagement Type" and Trend analysis; H2 2025 keeps navy
        [1, 2].forEach((rowNum) => {
          const headerRow = worksheet.getRow(rowNum);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A8A' }
          };
          if (rowNum === 1) headerRow.height = 30;
          headerRow.eachCell((cell) => {
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
        });
        if (showTrendAnalysis && trendHeaders.length > 0) {
          const trendStartCol = 3 + h2ColSpan + 3;
          row1.getCell(trendStartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(trendStartCol).font = { bold: true, color: { argb: 'FF000000' } };
        }
        
        // Get sorted data to ensure correct order
        const sortedBuWiseData = getSortedData(buWiseData);
        const trendFileData = (showTrendAnalysis && trendAnalysisData?.length > 0) ? trendAnalysisData[0] : null;
        
        // Add data rows with color coding for perspective scores
        sortedBuWiseData.forEach((row, index) => {
          const isOrgLevel = row.isOrgLevel;
          const isCountRow = row.isCountRow;
          const hyphenRow = !isOrgLevel && !isCountRow && isSeadAndPolledZero(row);

          // Count row: "Number of CSATs considered==>" in #Responded column, perspective counts, other cells empty
          if (isCountRow) {
            const countRowValues = [
              '',
              '',
              '', '', '', 'Number of CSATs considered==>',
              ...currentPerspectives.map(perspective => row[perspective] != null ? row[perspective] : ''),
              '', '', '',
              ...(showTrendAnalysis ? currentPerspectives.map(() => '') : [])
            ];
            const excelCountRow = worksheet.addRow(countRowValues);
            excelCountRow.eachCell((cell) => {
              cell.font = { bold: true, color: { argb: 'FF1E3A8A' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
            excelCountRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            return;
          }
          
          // Build trend values when showTrendAnalysis: compare main dashboard vs trend analysis by BU
          // When BU (e.g. SEAD) not in trend file, show hyphen (-) for all Trend columns
          let trendValues = [];
          if (showTrendAnalysis && trendFileData) {
            const trendRow = trendFileData.rows?.find(tr => {
              const trBU = normalizeBusinessUnitDisplay(tr.businessUnit);
              const rowBU = normalizeBusinessUnitDisplay(row.businessUnit);
              return trBU === rowBU || (row.isOrgLevel && tr.isOrgLevel) || trBU?.toLowerCase() === rowBU?.toLowerCase();
            });
            if (!trendRow) {
              trendValues = currentPerspectives.map(() => '-');
            } else {
              trendValues = currentPerspectives.map(perspective => {
                const currentParsed = parseFloat(getPerspectiveValue(row, perspective));
                const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
                let trendVal = parseFloat(trendRow[perspective]);
                if (isNaN(trendVal)) {
                  const altP = perspective === 'Quality of Delivery' ? 'Quality of deliverables' : perspective === 'Quality of deliverables' ? 'Quality of Delivery' : perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null;
                  if (altP) trendVal = parseFloat(trendRow[altP]);
                }
                if (hyphenRow) return '-';
                if (isNaN(trendVal)) trendVal = 0;
                const diff = currentVal - trendVal;
                const diffRounded = Math.round(diff * 100) / 100;
                if (diff > 0) return `(+${diffRounded.toFixed(2)}) ↑`;
                if (diff < 0) return `(${diffRounded.toFixed(2)}) ↓`;
                return '(0) −';
              });
            }
          }
          
          const rowValues = hyphenRow
            ? Array(numDataCols).fill('-')
            : [
                isOrgLevel ? '' : row.sNo,
                normalizeBusinessUnitDisplay(row.businessUnit),
                row.customerCount,
                row.stakeholdersPolledCount ?? 0,
                row.cssSentCount || 0,
                row.cssReceivedCount || 0,
                ...currentPerspectives.map(perspective => formatPerspectiveDisplay(getPerspectiveValue(row, perspective))),
                row.fullyManaged ?? 0,
                row.coManaged ?? 0,
                row.staffAugmentation ?? 0,
                ...trendValues
              ];
          const dataRow = worksheet.addRow(rowValues);
          
          // Set alignment for data cells with word wrap (text columns left, rest center)
          dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          [7 + currentPerspectives.length, 8 + currentPerspectives.length, 9 + currentPerspectives.length].forEach(col => {
            dataRow.getCell(col).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
          
          // Style Org Level row differently
          if (isOrgLevel) {
            dataRow.eachCell((cell) => {
              cell.font = { bold: true, color: { argb: 'FF000000' } };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE2E8F0' }
              };
            });
          }
          
          // Apply color coding to perspective score cells (skip for Sead+Polled=0 hyphen row)
          if (!hyphenRow) {
            currentPerspectives.forEach((perspective, colIndex) => {
              const val = formatPerspectiveDisplay(row[perspective]);
              const cell = dataRow.getCell(colIndex + 7); // +7: Sr.No, BU, # Accounts Polled, # Stakeholders Polled, #Polled, #Responded, then perspectives
              cell.value = val;
              if (val === '-' || val === '－') {
                cell.value = '-';
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              } else {
                const score = parseFloat(val || 0);
                if (score < 4) {
                  // Red
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFF0000' }
                  };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (score >= 4 && score < 4.5) {
                  // Orange
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFA500' }
                  };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else if (score >= 4.5) {
                  // Light Green
                  cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFC6EFCE' }
                  };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
              }
              
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
          }
          
          // Style Trend for [Perspective] columns: font only by arrow (green ↑, red ↓), no cell fill/legend color
          if (showTrendAnalysis && trendFileData) {
            currentPerspectives.forEach((perspective, pIdx) => {
              const trendColIndex = 10 + currentPerspectives.length + pIdx;
              const cell = dataRow.getCell(trendColIndex);
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
              const val = cell.value;
              if (isOrgLevel) {
                cell.font = { bold: true, color: { argb: val && String(val).includes('↑') ? 'FF166534' : val && String(val).includes('↓') ? 'FFDC2626' : 'FF6B7280' } };
              } else if (val && String(val).includes('↑')) {
                cell.font = { color: { argb: 'FF166534' }, bold: true };
              } else if (val && String(val).includes('↓')) {
                cell.font = { color: { argb: 'FFDC2626' }, bold: true };
              } else if (val && String(val).includes('−')) {
                cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              }
            });
          }
        });
        
        // Add legend rows
        const legendStartRow = sortedBuWiseData.length + 3; // Add some space after data
        
        // Add legend title
        const legendTitleRow = worksheet.addRow(['Legend:']);
        legendTitleRow.getCell(1).font = { bold: true, size: 12 };
        
        // Add legend items
        const legendRow1 = worksheet.addRow(['< 4 (Red - White Text)']);
        const legendRow2 = worksheet.addRow(['4 to 4.49 (Orange - Black Text)']);
        const legendRow3 = worksheet.addRow(['>= 4.5 (Green - Black Text)']);
        
        // Style legend cells with colors
        const redCell = legendRow1.getCell(1);
        redCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }
        };
        redCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        
        const orangeCell = legendRow2.getCell(1);
        orangeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' }
        };
        orangeCell.font = { color: { argb: 'FF000000' }, bold: true };
        
        const lightGreenCell = legendRow3.getCell(1);
        lightGreenCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        };
        lightGreenCell.font = { color: { argb: 'FF000000' }, bold: true };
        
        // Set column widths
        worksheet.getColumn(1).width = 8;   // Sr. No.
        worksheet.getColumn(2).width = 20;  // Business Unit
        worksheet.getColumn(3).width = 18;  // # Accounts Polled
        worksheet.getColumn(4).width = 30;  // Number of Customer Stakeholders Polled
        worksheet.getColumn(5).width = 25;  // #Polled
        worksheet.getColumn(6).width = 25;  // #Responded
        currentPerspectives.forEach((_, index) => {
          worksheet.getColumn(index + 7).width = 18; // perspective columns start at col 7
        });
        worksheet.getColumn(7 + currentPerspectives.length).width = 18; // Fully Managed
        worksheet.getColumn(8 + currentPerspectives.length).width = 18; // Co-Managed
        worksheet.getColumn(9 + currentPerspectives.length).width = 22; // Staff Augmentation
        if (showTrendAnalysis) {
          currentPerspectives.forEach((_, idx) => {
            worksheet.getColumn(10 + currentPerspectives.length + idx).width = 18; // Trend for [Perspective]
          });
        }
        
        // Generate and download the file with name according to current view (BU Wise)
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Account_BU_Wise_Average_CSAT_Scores_BU_Wise.xlsx';
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('BU-wise data exported successfully with color coding');
      } else {
        if (!processedData || processedData.length === 0) {
          alert('No account-wise data available to download');
          return;
        }
        
        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Account BU wise CSAT Scores');
        
        // Get perspectives from processed data for account-wise view (order by PERSPECTIVE_DISPLAY_ORDER)
        const accountPerspectivesRaw = Object.keys(processedData[0] || {}).filter(key => 
          !['sNo', 'customerId', 'customerName', 'practice', 'businessUnit', 'cssSentCount', 'cssReceivedCount', 'category', 'Total Avg CSAT Scores(Overall Experience)', 'Response Rate %', 'Polled', 'Responded'].includes(key)
        );
        const accountPerspectives = sortPerspectivesByDisplayOrder(accountPerspectivesRaw);
        
        // Prepare headers (Account Name, Business Unit, #Polled, #Responded; display Healthcare for Health care)
        // When showTrendAnalysis: add "Trend for [Perspective]" columns and a merged "Trend analysis (H2 Vs H1)" header row above them
        const accountTrendHeaders = showTrendAnalysis
          ? accountPerspectives.map(p => sanitizeSheetName(getTrendPerspectiveHeaderLabel(p)))
          : [];
        const headers = [
          'Sr. No.',
          'Business Unit',
          'Account Name',
          '#Polled',
          '#Responded',
          ...accountPerspectives.map(perspective => sanitizeSheetName(normalizePerspectiveForDisplay(perspective))),
          'Total Avg CSAT Scores(Overall Experience)',
          ...accountTrendHeaders
        ];
        
        if (showTop10 && showTrendAnalysis && accountTrendHeaders.length > 0) {
          const nP = accountPerspectives.length;
          const h2Cols = 2 + nP;
          const row1Values = [
            ...Array(3).fill(''),
            (acsatCycle || 'H2 2025'),
            ...Array(h2Cols - 1).fill(''),
            '',
            trendHeaderLabel,
            ...Array(accountTrendHeaders.length - 1).fill('')
          ];
          worksheet.addRow(row1Values);
          worksheet.mergeCells(1, 4, 1, 4 + h2Cols - 1);
          const trendStartCol = 4 + h2Cols + 1;
          worksheet.mergeCells(1, trendStartCol, 1, trendStartCol + accountTrendHeaders.length - 1);
          const row1 = worksheet.getRow(1);
          // Style row 1 with same navy as Business Unit; then re-apply light blue only for Trend analysis
          row1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          row1.height = 30;
          row1.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
          row1.getCell(trendStartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(trendStartCol).font = { bold: true, color: { argb: 'FF000000' } };
        }
        if (!showTop10 && showTrendAnalysis && accountTrendHeaders.length > 0) {
          const nP = accountPerspectives.length;
          const h2Cols = 2 + nP + 1; // #Polled, #Responded, perspectives, Total Avg
          const row1Values = [
            ...Array(3).fill(''),
            (acsatCycle || 'H2 2025'),
            ...Array(h2Cols - 1).fill(''),
            trendHeaderLabel,
            ...Array(accountTrendHeaders.length - 1).fill('')
          ];
          worksheet.addRow(row1Values);
          worksheet.mergeCells(1, 4, 1, 4 + h2Cols - 1);
          const trendStartCol = 4 + h2Cols;
          worksheet.mergeCells(1, trendStartCol, 1, trendStartCol + accountTrendHeaders.length - 1);
          const row1 = worksheet.getRow(1);
          row1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          row1.height = 30;
          row1.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
          row1.getCell(trendStartCol).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
          row1.getCell(trendStartCol).font = { bold: true, color: { argb: 'FF000000' } };
        }
        worksheet.addRow(headers);
        const mainHeaderRowIndex = (showTrendAnalysis && accountTrendHeaders.length > 0) ? 2 : 1;
        const headerRow = worksheet.getRow(mainHeaderRowIndex);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E3A8A' }
        };
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        
        // Get sorted data to ensure correct order
        const sortedAccountData = getSortedData(filteredData, showTop10);
        const trendFileData = (showTop10 && showTrendAnalysis && trendAnalysisData?.length > 0) ? trendAnalysisData[0] : null;
        
        // Helper to get trend row for a given main-dashboard row (Top 10 view)
        const getTrendRowForTop10 = (row) => {
          if (!trendFileData?.hasTop10Data) return null;
          if (row.isTop10Accounts) return trendFileData.top10GrandTotalRow;
          if (row.isOtherAccount) return trendFileData.otherAccountsRow;
          if (row.isOverall) return trendFileData.overallRow;
          const rowAccount = row.customerName || '';
          const rowBU = normalizeBusinessUnitDisplay(row.businessUnit);
          return trendFileData.top10Rows?.find(tr => {
            const trAccount = tr.accountName || '';
            const trBU = normalizeBusinessUnitDisplay(tr.businessUnit);
            return (trAccount === rowAccount || trAccount?.toLowerCase() === rowAccount?.toLowerCase()) &&
                   (trBU === rowBU || trBU?.toLowerCase() === rowBU?.toLowerCase());
          }) || null;
        };
        
        // Add data rows with color coding for perspective scores
        sortedAccountData.forEach((row, index) => {
          const isTop10Accounts = row.isTop10Accounts;
          const isOtherAccount = row.isOtherAccount;
          const isOverall = row.isOverall;
          const isTop10CountRow = row.isTop10CountRow;
          const isOtherAccountCountRow = row.isOtherAccountCountRow;
          const isOverallCountRow = row.isOverallCountRow;
          const hyphenRow = !isTop10Accounts && !isOtherAccount && !isOverall && !isTop10CountRow && !isOtherAccountCountRow && !isOverallCountRow && isSeadAndPolledZero(row);

          // Count rows (Top 10, Other Account, Overall): "Number of CSATs considered==>" in #Responded column
          if (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) {
            const countRowValues = [
              '',
              '',
              '',
              '',
              '',
              'Number of CSATs considered==>',
              ...accountPerspectives.map(perspective => row[perspective] != null ? row[perspective] : ''),
              '',
              ...(showTrendAnalysis ? accountTrendHeaders.map(() => '') : [])
            ];
            const excelCountRow = worksheet.addRow(countRowValues);
            excelCountRow.eachCell((cell) => {
              cell.font = { bold: true, color: { argb: 'FF1E3A8A' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
            excelCountRow.getCell(6).alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
            return;
          }
          
          // Build trend values for Trend for [Perspective] columns
          let trendValues = [];
          if (showTop10 && showTrendAnalysis && trendFileData) {
            const trendRow = getTrendRowForTop10(row);
            trendValues = accountPerspectives.map(perspective => {
              const currentParsed = parseFloat(getPerspectiveValue(row, perspective));
              const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
              let trendVal = trendRow ? parseFloat(trendRow[perspective]) : null;
              if (trendRow && isNaN(trendVal)) {
                const altPerspectives = [
                  perspective === 'Quality of Delivery' ? 'Quality of deliverables' : null,
                  perspective === 'Quality of deliverables' ? 'Quality of Delivery' : null,
                  perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
                  perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
                ].filter(Boolean);
                for (const altP of altPerspectives) {
                  trendVal = parseFloat(trendRow[altP]);
                  if (!isNaN(trendVal)) break;
                }
              }
              if (hyphenRow) return '-';
              if (isNaN(trendVal)) trendVal = 0;
              const diff = currentVal - trendVal;
              const diffRounded = Math.round(diff * 100) / 100;
              if (diff > 0) return `(+${diffRounded.toFixed(2)}) ↑`;
              if (diff < 0) return `(${diffRounded.toFixed(2)}) ↓`;
              return '(0) −';
            });
          }
          if (!showTop10 && showTrendAnalysis && accountTrendHeaders.length > 0) {
            const rowBU = normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase();
            const rowId = normalizeCustomerIdKey(row.customerId ?? '');
            const rowName = (row.customerName || '').toString().trim().toLowerCase();
            const trendRow =
              (rowId ? accountWiseTrendLookup[`id|||${rowId}|||${rowBU}`] : null) ||
              (rowName ? accountWiseTrendLookup[`name|||${rowName}|||${rowBU}`] : null) ||
              (rowName ? accountWiseTrendLookup[`nameOnly|||${rowName}`] : null) ||
              null;

            trendValues = accountPerspectives.map((perspective) => {
              const currentParsed = parseFloat(getPerspectiveValue(row, perspective));
              const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
              let trendVal = trendRow ? parseFloat(trendRow[perspective]) : null;
              if (trendRow && isNaN(trendVal)) {
                const altPerspectives = [
                  perspective === 'Quality of Delivery' ? 'Quality of deliverables' : null,
                  perspective === 'Quality of deliverables' ? 'Quality of Delivery' : null,
                  perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
                  perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
                ].filter(Boolean);
                for (const altP of altPerspectives) {
                  const v = parseFloat(trendRow?.[altP]);
                  if (!isNaN(v)) { trendVal = v; break; }
                }
              }
              if (!trendRow || hyphenRow) return '-';
              if (isNaN(trendVal)) trendVal = 0;
              const diffRounded = Math.round((currentVal - trendVal) * 100) / 100;
              if (diffRounded > 0) return `(+${diffRounded.toFixed(2)}) ↑`;
              if (diffRounded < 0) return `(${diffRounded.toFixed(2)}) ↓`;
              return '(0) −';
            });
          }
          
          const rowValues = hyphenRow
            ? headers.map(() => '-')
            : [
                (isTop10Accounts || isOtherAccount || isOverall) ? '' : row.sNo,
                (isTop10Accounts || isOtherAccount || isOverall) ? '' : normalizeBusinessUnitDisplay(row.businessUnit),
                row.customerName,
                row['Polled'] || 0,
                row['Responded'] || 0,
                ...accountPerspectives.map(perspective => formatPerspectiveDisplay(getPerspectiveValue(row, perspective))),
                formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)']),
                ...trendValues
              ];
          const dataRow = worksheet.addRow(rowValues);
          
          // Set alignment for data cells with word wrap (text columns left, rest center)
          dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          dataRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          dataRow.getCell(4).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          dataRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          dataRow.getCell(6).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          
          // Style Top 10 Accounts, Other Account, and Overall rows: row bg for cols 1-5, legend colors for perspective/Total Avg
          if (!hyphenRow && (isTop10Accounts || isOtherAccount || isOverall)) {
            let bgColor;
            if (isOtherAccount) bgColor = { argb: 'FFB4C6E7' };
            else if (isTop10Accounts) bgColor = { argb: 'FFFFEB9C' };
            else bgColor = { argb: 'FFD9D2E9' };
            dataRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
              const isPerspectiveCell = colNumber >= 6 && colNumber < 6 + accountPerspectives.length;
              const isTotalAvgCell = colNumber === 6 + accountPerspectives.length;
              if (!isPerspectiveCell && !isTotalAvgCell) {
                cell.font = { bold: true, color: { argb: 'FF000000' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
              }
            });
            // Apply legend colors to perspective and Total Avg cells
            accountPerspectives.forEach((perspective, colIndex) => {
              const val = formatPerspectiveDisplay(row[perspective]);
              const cell = dataRow.getCell(colIndex + 6);
              if (val === '-' || val === '－') {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                cell.font = { color: { argb: 'FF6B7280' }, bold: true };
              } else {
                const score = parseFloat(val || 0);
                if (!isNaN(score)) {
                  if (score < 4) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                  } else if (score >= 4 && score < 4.5) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                    cell.font = { color: { argb: 'FF000000' }, bold: true };
                  } else {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                    cell.font = { color: { argb: 'FF000000' }, bold: true };
                  }
                }
              }
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
            const totalAvgVal = formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)']);
            const totalAvgCell = dataRow.getCell(6 + accountPerspectives.length);
            if (totalAvgVal === '-' || totalAvgVal === '－') {
              totalAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              totalAvgCell.font = { color: { argb: 'FF6B7280' }, bold: true };
            } else {
              const totalAvgScore = parseFloat(totalAvgVal || 0);
              if (!isNaN(totalAvgScore)) {
                if (totalAvgScore < 4) {
                  totalAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  totalAvgCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (totalAvgScore >= 4 && totalAvgScore < 4.5) {
                  totalAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  totalAvgCell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  totalAvgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  totalAvgCell.font = { color: { argb: 'FF000000' }, bold: true };
                }
              }
            }
            totalAvgCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          }

          // Apply color coding to perspective score cells (skip for special rows - already handled above)
          if (!hyphenRow && !isTop10Accounts && !isOtherAccount && !isOverall) {
          accountPerspectives.forEach((perspective, colIndex) => {
            const val = formatPerspectiveDisplay(row[perspective]);
              const cell = dataRow.getCell(colIndex + 6); // +6: Sr. No., Business Unit, Account Name, Polled, Responded
            if (val === '-' || val === '－') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' }, bold: true };
            } else {
            const score = parseFloat(val || 0);
            if (score < 4) {
                // Red
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                  fgColor: { argb: 'FFFF0000' }
              };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (score >= 4 && score < 4.5) {
                // Orange
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                  fgColor: { argb: 'FFFFA500' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else if (score >= 4.5) {
              // Light Green
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                  fgColor: { argb: 'FFC6EFCE' }
              };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
            }
            
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
          } else {
            // For special rows, just align center and make bold (no legend color coding)
            accountPerspectives.forEach((perspective, colIndex) => {
              const cell = dataRow.getCell(colIndex + 6);
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
              cell.font = { bold: true };
            });
          }
          
          // Apply color coding to Total Avg CSAT Scores(Overall Experience) cell (skip legend for special rows)
          const totalAvgOverallExperienceCell = dataRow.getCell(accountPerspectives.length + 6); // Total Avg CSAT Scores(Overall Experience) column
          const totalAvgVal = formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)']);
          totalAvgOverallExperienceCell.value = totalAvgVal;
          
          if (!isTop10Accounts && !isOtherAccount && !isOverall) {
          if (totalAvgVal === '-' || totalAvgVal === '－') {
            totalAvgOverallExperienceCell.value = '-';
            totalAvgOverallExperienceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            totalAvgOverallExperienceCell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else {
          const totalAvgOverallExperienceScore = parseFloat(totalAvgVal || 0);
          
          if (totalAvgOverallExperienceScore < 4) {
              // Red
            totalAvgOverallExperienceCell.fill = {
              type: 'pattern',
              pattern: 'solid',
                fgColor: { argb: 'FFFF0000' }
            };
            totalAvgOverallExperienceCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (totalAvgOverallExperienceScore >= 4 && totalAvgOverallExperienceScore < 4.5) {
              // Orange
            totalAvgOverallExperienceCell.fill = {
              type: 'pattern',
              pattern: 'solid',
                fgColor: { argb: 'FFFFA500' }
            };
            totalAvgOverallExperienceCell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (totalAvgOverallExperienceScore >= 4.5) {
            // Light Green
            totalAvgOverallExperienceCell.fill = {
              type: 'pattern',
              pattern: 'solid',
                fgColor: { argb: 'FFC6EFCE' }
            };
            totalAvgOverallExperienceCell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
          } else {
            // For special rows, just align center and make bold (no legend color coding)
            totalAvgOverallExperienceCell.font = { bold: true };
          }
          
          totalAvgOverallExperienceCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          
          // Style Trend for [Perspective] columns: font only by arrow (green ↑, red ↓), no cell fill/legend color
          if (showTrendAnalysis && accountTrendHeaders.length > 0) {
            accountPerspectives.forEach((perspective, pIdx) => {
              const trendColIndex = 6 + accountPerspectives.length + 1 + pIdx;
              const cell = dataRow.getCell(trendColIndex);
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
              const val = cell.value;
              const isSpecial = isTop10Accounts || isOtherAccount || isOverall;
              if (isSpecial) {
                const bgColor = isOtherAccount ? { argb: 'FFB4C6E7' } : isTop10Accounts ? { argb: 'FFFFEB9C' } : { argb: 'FFD9D2E9' };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: bgColor };
                cell.font = { bold: true, color: { argb: val && String(val).includes('↑') ? 'FF166534' : val && String(val).includes('↓') ? 'FFDC2626' : 'FF6B7280' } };
              } else {
                if (val && String(val).includes('↑')) {
                  cell.font = { color: { argb: 'FF166534' }, bold: true };
                } else if (val && String(val).includes('↓')) {
                  cell.font = { color: { argb: 'FFDC2626' }, bold: true };
                } else if (val && String(val).includes('−')) {
                  cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                }
              }
            });
          }
          
        });
        
        // Add legend rows
        const legendStartRow = sortedAccountData.length + 3; // Add some space after data
        
        // Add legend title
        const legendTitleRow = worksheet.addRow(['Legend:']);
        legendTitleRow.getCell(1).font = { bold: true, size: 12 };
        
        // Add legend items
        const legendRow1 = worksheet.addRow(['< 4 (Red - White Text)']);
        const legendRow2 = worksheet.addRow(['4 to 4.49 (Orange - Black Text)']);
        const legendRow3 = worksheet.addRow(['>= 4.5 (Green - Black Text)']);
        
        // Style legend cells with colors
        const redCell = legendRow1.getCell(1);
        redCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF0000' }
        };
        redCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        
        const orangeCell = legendRow2.getCell(1);
        orangeCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFA500' }
        };
        orangeCell.font = { color: { argb: 'FF000000' }, bold: true };
        
        const lightGreenCell = legendRow3.getCell(1);
        lightGreenCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFC6EFCE' }
        };
        lightGreenCell.font = { color: { argb: 'FF000000' }, bold: true };
        
        // Set column widths
        worksheet.getColumn(1).width = 8;   // Sr. No.
        worksheet.getColumn(2).width = 20;  // Business Unit
        worksheet.getColumn(3).width = 24;  // Account Name
        worksheet.getColumn(4).width = 25;  // Polled
        worksheet.getColumn(5).width = 25;  // Responded
        accountPerspectives.forEach((_, index) => {
          worksheet.getColumn(index + 6).width = 18;
        });
        worksheet.getColumn(accountPerspectives.length + 6).width = 35; // Total Avg CSAT Scores(Overall Experience)
        if (showTrendAnalysis) {
          accountPerspectives.forEach((_, idx) => {
            worksheet.getColumn(6 + accountPerspectives.length + 1 + idx).width = 18; // Trend for [Perspective]
          });
        }
        
        // Generate and download the file with name according to current view (Account Wise or Top 10 Accounts)
        const viewSuffix = showTop10 ? 'Top10_Accounts' : 'Account_Wise';
        const downloadFileName = `Account_BU_Wise_Average_CSAT_Scores_${viewSuffix}.xlsx`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFileName;
        link.click();
        window.URL.revokeObjectURL(url);
        
        console.log('Account-wise data exported successfully with color coding');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // RATING legend for Project Data: 1=Dark Red, 2=Red, 3=Amber, 4=Yellow, 5=Green
  const getRatingLegendForValue = (numRating) => {
    if (numRating == null || numRating === '' || isNaN(parseFloat(numRating))) return null;
    const n = Math.round(parseFloat(numRating));
    if (n === 1) return { bg: '#b91c1c', text: '#ffffff', argb: 'FFb91c1c' }; // Dark Red
    if (n === 2) return { bg: '#ef4444', text: '#000000', argb: 'FFef4444' };  // Red
    if (n === 3) return { bg: '#f59e0b', text: '#000000', argb: 'FFF59E0B' }; // Amber
    if (n === 4) return { bg: '#eab308', text: '#000000', argb: 'FFeab308' }; // Yellow
    if (n === 5) return { bg: '#22c55e', text: '#000000', argb: 'FF22c55e' }; // Green
    return null;
  };

  // Function to get cell color based on rating value
  const getCellColor = (rating) => {
    if (rating === '-' || rating === '－') return '#f9fafb'; // Gray for no response (PCSAT)
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'transparent';
    
    if (numRating < 4) {
      return '#ff0000'; // Red for <4
    } else if (numRating >= 4 && numRating < 4.5) {
      return '#FFA500'; // Orange for 4 to 4.49
    } else if (numRating >= 4.5) {
      return '#c6efce'; // Light Green for >=4.5
    }
    return 'transparent';
  };

  // Function to get text color based on background color
  const getTextColor = (rating) => {
    if (rating === '-' || rating === '－') return '#6b7280'; // Gray text for no response (PCSAT)
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return '#000000'; // Black text for transparent/other cells
    
    if (numRating < 4) {
      return '#ffffff'; // White text for red background
    } else if (numRating >= 4 && numRating < 4.5) {
      return '#000000'; // Black text for orange background
    } else if (numRating >= 4.5) {
      return '#000000'; // Black text for light green background
    }
    return '#000000'; // Black text for other cases
  };

  // When perspective value is zero or 0%, display hyphen (-) in dashboard and Excel (Account/BU wise, BU Wise, Top 10).
  const formatPerspectiveDisplay = (value) => {
    if (value === null || value === undefined) return '-';
    const s = String(value).trim();
    if (s === '' || s === '0' || s === '0%') return '-';
    const num = parseFloat(value);
    if (!isNaN(num) && num === 0) return '-';
    return value;
  };

  // Org level row for BU-wise perspective tables: grand total Polled, Responded, Customer Count; avg of perspective column values
  const computeBUWiseOrgLevelRow = (data, perspectives) => {
    if (!data || data.length === 0) return null;
    const totalResponded = data.reduce((s, r) => s + (r.Responded ?? r.cssReceivedCount ?? 0), 0);
    const org = {
      sNo: '',
      businessUnit: 'Org level',
      customerCount: data.reduce((s, r) => s + (r.customerCount || 0), 0),
      Polled: data.reduce((s, r) => s + (r.Polled ?? r.cssSentCount ?? 0), 0),
      Responded: totalResponded
    };
    if (totalResponded === 0) {
      perspectives.forEach(p => { org[p] = '-'; });
    } else {
      perspectives.forEach(p => {
        const vals = data.map(r => parseFloat(r[p])).filter(n => !isNaN(n));
        org[p] = vals.length > 0 ? avgToFixed2(vals.reduce((a, b) => a + b, 0) / vals.length) : '0.00';
      });
    }
    return org;
  };

  // Grand total row for account-wise "Average CSAT Scores by Perspective": sum #Polleded, #Responded; avg of each perspective (exclude hyphen rows)
  const computeAccountWiseGrandTotalRow = (data, perspectives) => {
    if (!data || data.length === 0) return null;
    const validRows = data.filter(r => !isSeadAndPolledZero(r));
    const totalPolled = validRows.reduce((s, r) => s + (Number(r.Polled) || 0), 0);
    const totalResponded = validRows.reduce((s, r) => s + (Number(r.Responded) || 0), 0);
    const grand = {
      sNo: '',
      businessUnit: 'Grand Total',
      accountName: '',
      Polled: totalPolled,
      Responded: totalResponded
    };
    if (validRows.length === 0 || totalResponded === 0) {
      perspectives.forEach(p => { grand[p] = '-'; });
    } else {
      perspectives.forEach(p => {
        const vals = validRows.map(r => parseFloat(getPerspectiveValue(r, p))).filter(n => !isNaN(n));
        grand[p] = vals.length > 0 ? avgToFixed2(vals.reduce((a, b) => a + b, 0) / vals.length) : '-';
      });
    }
    return grand;
  };

  const processedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];

    // Co-Managed filter: use only rows where ENGAGEMENT TYPE = "Co-Managed" when engagementTypeFilter is set
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;
    const secondSheetDataToUse = engagementTypeFilter === 'Co-Managed' && secondSheetEngagementKey
      ? secondSheetDataRaw.filter(row => isCoManagedRow(row, secondSheetEngagementKey))
      : secondSheetDataRaw;

    const filteredData = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      return questionCategory !== 'Qualitative Feedback';
    });

    // Filter by Top 10 accounts if showTop10 is true
    let top10FilteredData = filteredData;
    let otherAccountData = [];
    let top10Customers = new Set();
    
    if (showTop10 && secondSheetDataToUse.length > 0) {
      // Get Top 10 customers from second sheet (TYPE OF ACCOUNT = "Top 10" or "Top 10" = "Y")
      secondSheetDataToUse.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (customerId && isTop10AccountRow(row)) {
          top10Customers.add(customerId);
        }
      });
      
      console.log('Top 10 customers for Average CSAT Scores:', Array.from(top10Customers));
      
      // Filter data to only include Top 10 customers
      top10FilteredData = filteredData.filter(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        return top10Customers.has(customerId);
      });
      
      // Get Other Account data (where TYPE OF ACCOUNT is not "Top 10" / "Top 10" is not "Y")
      otherAccountData = secondSheetDataToUse.filter(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        return customerId && !isTop10AccountRow(row);
      });
      
      console.log('=== OTHER ACCOUNT DEBUG ===');
      console.log('Top 10 customers set:', Array.from(top10Customers));
      console.log('Total filtered data:', filteredData.length);
      console.log('Top 10 filtered data:', top10FilteredData.length);
      console.log('Other Account data for Average CSAT Scores:', otherAccountData.length, 'rows');
      console.log('Sample Other Account data:', otherAccountData.slice(0, 3));
      
      // Debug customer ID matching
      const firstSheetCustomerIds = [...new Set(filteredData.map(row => row['CUST_ID'] ?? row['CUSTOMER_ID']).filter(Boolean))];
      const secondSheetCustomerIds = [...new Set(secondSheetDataToUse.map(row => row['CUST_ID'] ?? row['CUSTOMER_ID']).filter(Boolean))];
      console.log('First sheet customer IDs (first 10):', firstSheetCustomerIds.slice(0, 10));
      console.log('Second sheet customer IDs (first 10):', secondSheetCustomerIds.slice(0, 10));
      console.log('Top 10 customer IDs from second sheet:', Array.from(top10Customers));
      console.log('Matching customer IDs between sheets:', firstSheetCustomerIds.filter(id => secondSheetCustomerIds.includes(id)).slice(0, 10));
      console.log('=== END OTHER ACCOUNT DEBUG ===');
    }

    // Find the correct perspective column name
    const perspectiveColumn = top10FilteredData.length > 0 ? 
      (Object.keys(top10FilteredData[0]).find(key => 
        key.toLowerCase().includes('perspective') || key === 'PERSPECTIVE'
      ) || 'PERSPECTIVE') : 'PERSPECTIVE';
    
    const perspectives = [...new Set(top10FilteredData.map(row => row[perspectiveColumn]).filter(Boolean))].filter(perspective => 
      perspective !== 'Qualitative Feedback'
    );
    
    console.log('AccountWiseAvgDashboard - Perspective detection:', {
      perspectiveColumn,
      totalRows: top10FilteredData.length,
      perspectives: perspectives,
      sampleRow: top10FilteredData.length > 0 ? top10FilteredData[0] : null
    });

    const customerGroups = new Map();
    
    // Use actual column names from the Excel file
    // Consider CUST_ID and CUSTOMER_ID as same; consider CUSTOMER NAME and CUST_NM as same
    const customerNameColumn = 'CUSTOMER NAME';
    // Prefer BUSINESS UNIT; fallback to BUSSINESS UNIT for backward compatibility
    const firstRowForColumns = filteredData[0] || uploadedData[0] || {};
    const practiceColumn = Object.keys(firstRowForColumns).find(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase())) || 'Practice';
    const businessUnitColumn = Object.prototype.hasOwnProperty.call(firstRowForColumns, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const practiceByCustomerId = new Map();
    if (secondSheetDataToUse.length > 0) {
      secondSheetDataToUse.forEach((row) => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!customerId) return;
        const key = String(customerId).trim();
        if (!key) return;
        const practiceVal = (row['Practice'] ?? row['PRACTICE'] ?? row['practice'] ?? row['PRACTICE MAPPED'] ?? row['Practice Mapped'] ?? '').toString().trim();
        if (!practiceVal || practiceVal.toLowerCase() === 'n/a') return;
        const existingVal = practiceByCustomerId.get(key);
        if (!existingVal || existingVal.toLowerCase() === 'n/a') {
          practiceByCustomerId.set(key, practiceVal);
        }
      });
    }
    
    console.log('AccountWiseAvgDashboard - Data processing debug:', {
      totalUploadedData: uploadedData.length,
      filteredDataLength: filteredData.length,
      top10FilteredDataLength: top10FilteredData.length,
      showTop10: showTop10,
      availableColumns: filteredData.length > 0 ? Object.keys(filteredData[0]) : [],
      customerIdSource: 'CUST_ID or CUSTOMER_ID',
      customerNameColumn,
      businessUnitColumn
    });
    
    top10FilteredData.forEach((row, index) => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      if (!customerId) return;

      const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';
      const rawPractice = row[practiceColumn] ?? row['Practice'] ?? row['PRACTICE'] ?? '';
      const practiceFromRow = (rawPractice ?? '').toString().trim();
      const practiceFromSecondSheet = practiceByCustomerId.get(String(customerId).trim()) || '';
      const practice = practiceFromRow && practiceFromRow.toLowerCase() !== 'n/a'
        ? practiceFromRow
        : (practiceFromSecondSheet || 'N/A');
      
      // Debug logging for first few rows
      if (index < 3) {
        console.log(`Row ${index + 1} - Customer ${customerId}:`, {
          customerIdSource: 'CUST_ID or CUSTOMER_ID',
          customerNameColumn,
          rawValue: row[customerNameColumn],
          finalCustomerName: customerName
        });
      }

      const businessUnit = row[businessUnitColumn] || 'N/A';
      
      // Get CSS counts from the second sheet data, filtered by CSAT cycle start date
      let cssSentCount = 0;
      let cssReceivedCount = 0;
      
      // If we have CSS dates and CSAT cycle start date, filter them
      if (csatCycleStartDateFormatted && row['CSS_SENT_DATES'] && row['CSS_RECEIVED_DATES']) {
        // Filter CSS_SENT_DATES that are >= CSAT cycle start date
        const filteredSentDates = row['CSS_SENT_DATES'].filter(sentDate => {
          if (!sentDate || sentDate === 'N/A' || sentDate === '') return false;
          // Convert sentDate to MM-DD-YYYY format for comparison
          const sentDateFormatted = formatDateToMMDDYYYY(sentDate);
          return isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
        });
        cssSentCount = filteredSentDates.length;
        
        // Filter CSS_RECEIVED_DATES that are >= CSAT cycle start date
        const filteredReceivedDates = row['CSS_RECEIVED_DATES'].filter(receivedDate => {
          if (!receivedDate || receivedDate === 'N/A' || receivedDate === '') return false;
          // Convert receivedDate to MM-DD-YYYY format for comparison
          const receivedDateFormatted = formatDateToMMDDYYYY(receivedDate);
          return isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
        });
        cssReceivedCount = filteredReceivedDates.length;
        
        // Debug logging for first few rows
        if (index < 3) {
          console.log(`Customer ${customerId} CSS filtering:`, {
            csatCycleStartDate: csatCycleStartDateFormatted,
            originalSentCount: row['CSS_SENT_DATES'].length,
            filteredSentCount: cssSentCount,
            originalReceivedCount: row['CSS_RECEIVED_DATES'].length,
            filteredReceivedCount: cssReceivedCount
          });
        }
      } else {
        // Fallback to original counts if no filtering possible
        cssSentCount = row['CSS_SENT_COUNT'] || 0;
        cssReceivedCount = row['CSS_RECEIVED_COUNT'] || 0;
      }

      if (!customerGroups.has(customerId)) {
        customerGroups.set(customerId, {
          customerId,
          customerName,
          practice: (practice ?? 'N/A').toString().trim() || 'N/A',
          businessUnit: businessUnit,
          cssSentCount: cssSentCount,
          cssReceivedCount: cssReceivedCount,
          perspectives: {},
          ratings: []
        });
      } else {
        const existingGroup = customerGroups.get(customerId);
        if (!existingGroup.businessUnit && businessUnit) {
          existingGroup.businessUnit = businessUnit;
        }
        if (!existingGroup.customerName && customerName !== 'N/A') {
          existingGroup.customerName = customerName;
        }
        if ((!existingGroup.practice || existingGroup.practice === 'N/A') && practice && String(practice).trim() !== '') {
          existingGroup.practice = String(practice).trim();
        }
        // Update CSS counts if we find better data
        if (cssSentCount > existingGroup.cssSentCount) {
          existingGroup.cssSentCount = cssSentCount;
        }
        if (cssReceivedCount > existingGroup.cssReceivedCount) {
          existingGroup.cssReceivedCount = cssReceivedCount;
        }
      }

      const group = customerGroups.get(customerId);
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']) || 0;

      // Apply CSAT date filtering for rating calculations
      // For "CSAT received Report" sheet, filter by CSAT RECEIVED DATE >= CSAT cycle start date (MM-DD-YYYY format)
      // If CSAT SENT DATE is also available, check both; otherwise just check CSAT RECEIVED DATE
      const csatSentDate = row['CSAT SENT DATE'] || row['CSS_SENT_DATE'] || row['csat_sent_date'];
      const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSS_RECEIVED_DATE'] || row['csat_received_date'];
      
      let shouldIncludeRating = true;
      
      if (csatCycleStartDateFormatted) {
        // If we have CSAT RECEIVED DATE, check if it's >= cycle start date
        if (csatReceivedDate) {
        const receivedDateFormatted = formatDateToMMDDYYYY(csatReceivedDate);
          if (receivedDateFormatted) {
            shouldIncludeRating = isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
          }
          // If receivedDateFormatted is null/undefined, include the rating (can't validate)
        }
        // If CSAT SENT DATE is also available, check it too
        if (shouldIncludeRating && csatSentDate) {
          const sentDateFormatted = formatDateToMMDDYYYY(csatSentDate);
          if (sentDateFormatted) {
            shouldIncludeRating = isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
          }
        }
        
        // Debug logging for first few rows
        if (index < 5) {
          console.log(`Customer ${customerId} Rating filtering:`, {
            csatSentDate,
            csatReceivedDate,
            csatCycleStartDate: csatCycleStartDateFormatted,
            shouldIncludeRating,
            rating,
            perspective
          });
        }
      }
      // If no csatCycleStartDateFormatted, include all ratings (shouldIncludeRating remains true)

      if (perspective && !isNaN(rating) && shouldIncludeRating) {
        const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
        if (!group.perspectives[normalizedPerspective]) {
          group.perspectives[normalizedPerspective] = [];
        }
        group.perspectives[normalizedPerspective].push(rating);
      }

      if (!isNaN(rating) && shouldIncludeRating) {
        group.ratings.push(rating);
      }
    });

    console.log('AccountWiseAvgDashboard - Customer groups created:', {
      totalGroups: customerGroups.size,
      groupKeys: Array.from(customerGroups.keys()),
      sampleGroup: customerGroups.size > 0 ? customerGroups.get(Array.from(customerGroups.keys())[0]) : null
    });

    // Debug: Count customers with rating data vs without
    let customersWithRatings = 0;
    let customersWithoutRatings = 0;
    let seadCustomers = [];
    customerGroups.forEach((group, id) => {
      const hasRatings = Object.keys(group.perspectives).some(p => group.perspectives[p] && group.perspectives[p].length > 0);
      if (hasRatings) {
        customersWithRatings++;
      } else {
        customersWithoutRatings++;
      }
      if (isSeadBU(group.businessUnit)) {
        seadCustomers.push({ id, name: group.customerName, bu: group.businessUnit, hasRatings, perspectives: group.perspectives });
      }
    });
    console.log('🔍 RATING DATA ANALYSIS:', {
      customersWithRatings,
      customersWithoutRatings,
      seadCustomersCount: seadCustomers.length,
      seadCustomers: seadCustomers.slice(0, 10)
    });

    // Build second-sheet counts by customer once (for adding second-sheet-only rows with Responded=0 / hyphen)
    const secondSheetCountsByCustomer = new Map();
    if (secondSheetDataToUse.length > 0 && perspectives.length > 0) {
      const shFirst = secondSheetDataToUse[0] || {};
      const cssSentCol = Object.keys(shFirst).find(key => {
        const lower = (key || '').toLowerCase();
        return key === 'CSAT SENT DATE' || lower.includes('csat_sent_date') || lower.includes('css_sent_date') || lower.includes('sent date');
      });
      const cssReceivedCol = Object.keys(shFirst).find(key => {
        const lower = (key || '').toLowerCase();
        return key === 'CSAT RECEIVED DATE' || lower.includes('csat_received_date') || lower.includes('css_received_date') || lower.includes('received date');
      });
      secondSheetDataToUse.forEach(secondRow => {
        const custId = secondRow['CUST_ID'] ?? secondRow['CUSTOMER_ID'];
        if (!custId) return;
        const key = String(custId).trim();
        if (!secondSheetCountsByCustomer.has(key)) secondSheetCountsByCustomer.set(key, { sent: 0, received: 0 });
        const rec = secondSheetCountsByCustomer.get(key);
        const sentVal = cssSentCol ? secondRow[cssSentCol] : secondRow['CSAT SENT DATE'] ?? secondRow['CSS_SENT_DATE'];
        if (sentVal && sentVal !== '' && sentVal !== 'N/A') {
          const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
          if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) rec.sent++;
        }
        const receivedVal = cssReceivedCol ? secondRow[cssReceivedCol] : secondRow['CSAT RECEIVED DATE'] ?? secondRow['CSS_RECEIVED_DATE'];
        if (receivedVal && receivedVal !== '' && receivedVal !== 'N/A') {
          const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
          if (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted))) rec.received++;
        }
      });
    }

    // Include second-sheet-only customers (Polled > 0) so rows with Responded=0 show hyphen for perspective columns only
    // These customers should still display BUSINESS UNIT and CUSTOMER NAME (Account Name)
    const customerIdsToConsider = showTop10 ? top10Customers : new Set(secondSheetCountsByCustomer.keys());
    let secondSheetOnlyCustomers = 0;
    customerIdsToConsider.forEach(customerId => {
      const id = String(customerId).trim();
      const counts = secondSheetCountsByCustomer.get(id) || secondSheetCountsByCustomer.get(customerId);
      if (!counts || counts.sent <= 0) return;
      if (customerGroups.has(id) || customerGroups.has(customerId)) return;
      secondSheetOnlyCustomers++;
      
      // Find customer info from second sheet - try multiple column name variations
      const matchingRow = secondSheetDataToUse.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID'])?.toString().trim() === id) 
        || secondSheetDataToUse.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === customerId) 
        || {};
      
      // Extract CUSTOMER NAME with multiple column name variations
      const customerName = (
        matchingRow['CUSTOMER NAME'] ?? 
        matchingRow['CUST_NM'] ?? 
        matchingRow['Account Name'] ?? 
        matchingRow['ACCOUNT NAME'] ??
        matchingRow['Customer Name'] ??
        matchingRow['customer_name'] ??
        id
      )?.toString().trim() || id;
      const practice = (
        matchingRow['Practice'] ??
        matchingRow['PRACTICE'] ??
        matchingRow['practice'] ??
        'N/A'
      )?.toString().trim() || 'N/A';
      
      // Extract BUSINESS UNIT with multiple column name variations
      const businessUnit = (
        matchingRow['BUSINESS UNIT'] ?? 
        matchingRow['BUSSINESS UNIT'] ?? 
        matchingRow['Business Unit'] ??
        matchingRow['business_unit'] ??
        matchingRow['BU'] ??
        'N/A'
      )?.toString().trim() || 'N/A';
      
      // Debug logging for second-sheet-only customers
      if (secondSheetOnlyCustomers <= 5) {
        console.log(`🔍 Second-sheet-only customer ${secondSheetOnlyCustomers}:`, {
          customerId: id,
          customerName,
          businessUnit,
          matchingRowKeys: Object.keys(matchingRow),
          polled: counts.sent,
          responded: counts.received
        });
      }
      
      customerGroups.set(id, {
        customerId: id,
        customerName,
        practice,
        businessUnit,
        cssSentCount: 0,
        cssReceivedCount: 0,
        perspectives: {},
        ratings: []
      });
    });
    console.log('🔍 SECOND SHEET ONLY CUSTOMERS:', {
      secondSheetOnlyCustomers,
      totalCustomersInSecondSheet: secondSheetCountsByCustomer.size,
      totalCustomerGroups: customerGroups.size
    });

    const result = Array.from(customerGroups.values()).map((group, index) => {
      const row = {
        sNo: index + 1,
        customerId: group.customerId,
        practice: group.practice || 'N/A',
        customerName: group.customerName || 'N/A',
        businessUnit: group.businessUnit || 'N/A',
        cssSentCount: group.cssSentCount || 0,
        cssReceivedCount: group.cssReceivedCount || 0
      };

      // Get CSAT counts from second sheet data for this customer
      // Count logic: For each CUSTOMER_ID/CUST_ID, count non-empty "CSAT SENT DATE" and "CSAT RECEIVED DATE" values
      // from the "CSAT sent and received Report" sheet
      let secondSheetSentCount = 0;
      let secondSheetReceivedCount = 0;
      
      if (secondSheetDataToUse.length > 0) {
        console.log(`\n🔍 SECOND SHEET DATA CHECK:`);
        console.log(`Second sheet data (filtered) length: ${secondSheetDataToUse.length}`);
        console.log(`First row keys:`, Object.keys(secondSheetDataToUse[0] || {}));
        const cssSentColumn = Object.keys(secondSheetDataToUse[0] || {}).find(key => {
          const lowerKey = key.toLowerCase();
          return key === 'CSAT SENT DATE' ||           // Exact match - highest priority
                 key === 'CSAT_SENT_DATE' ||
                 lowerKey.includes('csat sent date') ||
                 lowerKey.includes('csat_sent_date') || 
                 key === 'CSS_SENT_DATE' ||
                 key === 'CSS SENT DATE' ||
                 lowerKey.includes('css sent date') ||
                 lowerKey.includes('css_sent_date') ||
                 lowerKey.includes('sent_date') ||
                 lowerKey.includes('sent date');
        });
        
        const cssReceivedColumn = Object.keys(secondSheetDataToUse[0] || {}).find(key => {
          const lowerKey = key.toLowerCase();
          return key === 'CSAT RECEIVED DATE' ||       // Exact match - highest priority
                 key === 'CSAT_RECEIVED_DATE' ||
                 lowerKey.includes('csat received date') ||
                 lowerKey.includes('csat_received_date') || 
                 key === 'CSS_RECEIVED_DATE' ||
                 key === 'CSS RECEIVED DATE' ||
                 lowerKey.includes('css received date') ||
                 lowerKey.includes('css_received_date') ||
                 lowerKey.includes('received_date') ||
                 lowerKey.includes('received date');
        });
        
        console.log('=== CSAT COUNTING DEBUG ===');
        console.log('CSAT columns found:', { cssSentColumn, cssReceivedColumn });
        console.log('CSAT Cycle Start Date:', csatCycleStartDateFormatted);
        console.log('Second sheet sample row:', secondSheetDataToUse[0]);
        console.log('All second sheet columns:', Object.keys(secondSheetDataToUse[0] || {}));
        console.log('Total second sheet rows:', secondSheetDataToUse.length);
        
        // Debug: Show what we're counting for this customer
        console.log(`\n🔍 COUNTING SURVEYS FOR CUSTOMER: ${group.customerId} (${group.customerName})`);
        console.log('Counting logic:');
        console.log('- Count rows where CUST_ID or CUSTOMER_ID matches current customer');
        console.log('- Count non-empty "CSAT SENT DATE" values (with date filtering)');
        console.log('- Count non-empty "CSAT RECEIVED DATE" values (with date filtering)');
        console.log('- Apply CSAT cycle start date filtering if available');
        
        // Debug: Check if columns exist and have data
        if (cssSentColumn) {
          const sentColumnData = secondSheetDataToUse.map(row => row[cssSentColumn]).filter(val => val && val !== '');
          console.log(`CSS Sent Column "${cssSentColumn}" - Non-empty values:`, sentColumnData.slice(0, 5));
        } else {
          console.log('❌ CSS Sent Column not found!');
          console.log('Available columns in second sheet:', Object.keys(secondSheetDataToUse[0] || {}));
        }
        if (cssReceivedColumn) {
          const receivedColumnData = secondSheetDataToUse.map(row => row[cssReceivedColumn]).filter(val => val && val !== '');
          console.log(`CSS Received Column "${cssReceivedColumn}" - Non-empty values:`, receivedColumnData.slice(0, 5));
        } else {
          console.log('❌ CSS Received Column not found!');
        }
        
        // Show unique customer IDs in second sheet
        const secondSheetCustomerIds = [...new Set(excelData.secondSheetData.map(row => row['CUST_ID'] || row['CUSTOMER_ID']).filter(id => id))];
        console.log('Unique customer IDs in second sheet (first 10):', secondSheetCustomerIds.slice(0, 10));
        
        // Show current customer being processed
        console.log('Current customer being processed:', {
          customerId: group.customerId,
          customerName: group.customerName,
          customerIdType: typeof group.customerId
        });
        
        // Show first few rows of second sheet data
        console.log('First 3 rows of second sheet:');
        secondSheetDataToUse.slice(0, 3).forEach((row, idx) => {
          console.log(`Row ${idx + 1}:`, {
            CUST_ID: row['CUST_ID'],
            CUSTOMER_ID: row['CUSTOMER_ID'],
            CSS_SENT_DATE: row['CSS_SENT_DATE'],
            CSS_RECEIVED_DATE: row['CSS_RECEIVED_DATE'],
            [cssSentColumn]: cssSentColumn ? row[cssSentColumn] : 'N/A',
            [cssReceivedColumn]: cssReceivedColumn ? row[cssReceivedColumn] : 'N/A'
          });
        });
        
        let totalRowsProcessed = 0;
        let matchingRowsFound = 0;
        
        secondSheetDataToUse.forEach(secondRow => {
          totalRowsProcessed++;
          const custId = secondRow['CUST_ID'] ?? secondRow['CUSTOMER_ID'];
          
          // More robust customer ID matching
          const isMatch = custId && (
            custId.toString() === group.customerId.toString() ||
            custId === group.customerId ||
            String(custId).trim() === String(group.customerId).trim()
          );
          
          // Debug customer matching for first few rows
          if (totalRowsProcessed <= 5) {
            console.log(`Row ${totalRowsProcessed} customer matching:`, {
              secondRowCustId: custId,
              currentCustomerId: group.customerId,
              isMatch,
              custIdType: typeof custId,
              currentCustomerIdType: typeof group.customerId
            });
          }
          
          // Debug: Show all customer IDs in second sheet for comparison
          if (totalRowsProcessed <= 10) {
            console.log(`Row ${totalRowsProcessed} - All customer ID fields:`, {
              CUST_ID: secondRow['CUST_ID'],
              CUSTOMER_ID: secondRow['CUSTOMER_ID'],
              'Customer ID': secondRow['Customer ID'],
              'CUST_ID (string)': secondRow['CUST_ID']?.toString(),
              'CUSTOMER_ID (string)': secondRow['CUSTOMER_ID']?.toString()
            });
          }
          
          if (isMatch) {
            matchingRowsFound++;
            console.log(`\n--- Processing row for Customer ${group.customerId} (${group.customerName}) ---`);
            console.log('Row data:', {
              CUST_ID: secondRow['CUST_ID'],
              CUSTOMER_ID: secondRow['CUSTOMER_ID'],
              CSAT_SENT_DATE: secondRow['CSAT SENT DATE'] || secondRow['CSAT_SENT_DATE'] || secondRow['CSS_SENT_DATE'] || secondRow['CSS SENT DATE'],
              CSAT_RECEIVED_DATE: secondRow['CSAT RECEIVED DATE'] || secondRow['CSAT_RECEIVED_DATE'] || secondRow['CSS_RECEIVED_DATE'] || secondRow['CSS RECEIVED DATE'],
              YEAR_QUARTER: secondRow['YEAR - QUARTER'] || secondRow['YEAR_QUARTER'] || secondRow['Year Quarter']
            });
            
            // Count CSAT_SENT_DATE with date filtering
            // Date filtering condition: CSS_SENT_DATE >= CSAT cycle start date (csatCycleStartDateFormatted)
            // Format: MM-DD-YYYY for comparison
            // Priority: Use detected column first, then try "CSAT SENT DATE" (with spaces), then other variations
            const sentDateValue = cssSentColumn ? secondRow[cssSentColumn] : 
              secondRow['CSAT SENT DATE'] ||    // Primary: "CSAT SENT DATE"
              secondRow['CSAT_SENT_DATE'] || 
              secondRow['CSS_SENT_DATE'] || 
              secondRow['CSS SENT DATE'];
            
            console.log('🔍 DETAILED SENT DATE DEBUG:');
            console.log('Detected column:', cssSentColumn);
            console.log('Sent date value:', sentDateValue);
            console.log('Raw sent date value type:', typeof sentDateValue);
            console.log('Sent date value length:', sentDateValue?.toString().length);
            console.log('Is empty string?', sentDateValue === '');
            console.log('Is null?', sentDateValue === null);
            console.log('Is undefined?', sentDateValue === undefined);
            console.log('Is N/A?', sentDateValue === 'N/A');
            console.log('All CSAT SENT DATE variations:', {
              'CSAT SENT DATE': secondRow['CSAT SENT DATE'],
              'CSAT_SENT_DATE': secondRow['CSAT_SENT_DATE'],
              'CSS_SENT_DATE': secondRow['CSS_SENT_DATE'],
              'CSS SENT DATE': secondRow['CSS SENT DATE'],
              'detected_column': cssSentColumn ? secondRow[cssSentColumn] : 'N/A'
            });
            
            if (sentDateValue && sentDateValue !== '' && sentDateValue !== 'N/A') {
              // Convert to MM-DD-YYYY format for comparison
              const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateValue);
              console.log('Sent date formatted:', sentDateFormatted);
              console.log('parseExcelDateToMMDDYYYY result:', {
                input: sentDateValue,
                output: sentDateFormatted,
                isValid: !!sentDateFormatted
              });
              console.log('Date comparison:', {
                sentDateFormatted,
                csatCycleStartDateFormatted,
                isDateGreaterThanOrEqual: sentDateFormatted ? isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted) : 'N/A'
              });
              
              // Apply date filtering: only count if CSS_SENT_DATE >= CSAT cycle start date (MM-DD-YYYY format)
              if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
                secondSheetSentCount++;
                console.log(`✅ Customer ${group.customerId}: CSAT_SENT_DATE ${sentDateValue} -> ${sentDateFormatted} (count: ${secondSheetSentCount})`);
              } else {
                console.log(`❌ Customer ${group.customerId}: CSAT_SENT_DATE ${sentDateValue} -> ${sentDateFormatted} (filtered out)`);
              }
            } else {
              console.log(`❌ Customer ${group.customerId}: CSAT_SENT_DATE invalid: ${sentDateValue}`);
            }
            
            // Count CSAT_RECEIVED_DATE with date filtering
            // Date filtering condition: CSS_RECEIVED_DATE >= CSAT cycle start date (csatCycleStartDateFormatted)
            // Format: MM-DD-YYYY for comparison
            // Priority: Use detected column first, then try "CSAT RECEIVED DATE" (with spaces), then other variations
            const receivedDateValue = cssReceivedColumn ? secondRow[cssReceivedColumn] : 
              secondRow['CSAT RECEIVED DATE'] ||    // Primary: "CSAT RECEIVED DATE"
              secondRow['CSAT_RECEIVED_DATE'] || 
              secondRow['CSS_RECEIVED_DATE'] || 
              secondRow['CSS RECEIVED DATE'];
            console.log('Received date value:', receivedDateValue, 'Column:', cssReceivedColumn);
            if (receivedDateValue && receivedDateValue !== '' && receivedDateValue !== 'N/A') {
              // Convert to MM-DD-YYYY format for comparison
              const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateValue);
              console.log('Received date formatted:', receivedDateFormatted);
              // Apply date filtering: only count if CSS_RECEIVED_DATE >= CSAT cycle start date (MM-DD-YYYY format)
              if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
                secondSheetReceivedCount++;
                console.log(`✅ Customer ${group.customerId}: CSAT_RECEIVED_DATE ${receivedDateValue} -> ${receivedDateFormatted} (count: ${secondSheetReceivedCount})`);
              } else {
                console.log(`❌ Customer ${group.customerId}: CSAT_RECEIVED_DATE ${receivedDateValue} -> ${receivedDateFormatted} (filtered out)`);
              }
            } else {
              console.log(`❌ Customer ${group.customerId}: CSAT_RECEIVED_DATE invalid: ${receivedDateValue}`);
            }
          }
        });
        
        console.log(`\n=== SUMMARY for Customer ${group.customerId} ===`);
        console.log(`Total rows processed: ${totalRowsProcessed}`);
        console.log(`Matching rows found: ${matchingRowsFound}`);
        console.log(`Final counts - CSAT Sent: ${secondSheetSentCount}, CSAT Received: ${secondSheetReceivedCount}`);
        
        // Additional debug info
        if (secondSheetSentCount === 0) {
          console.log(`⚠️  WARNING: CSAT Sent count is 0 for customer ${group.customerId}`);
          console.log('Possible reasons:');
          console.log('1. No matching customer ID in second sheet');
          console.log('2. CSAT SENT DATE column not found');
          console.log('3. All CSAT SENT DATE values are empty/invalid');
          console.log('4. Date filtering is excluding all dates');
          console.log('5. CSAT cycle start date is filtering out all dates');
        }
        
        // Show final calculation summary
        console.log(`\n📊 FINAL CALCULATION SUMMARY:`);
        console.log(`Customer ID: ${group.customerId}`);
        console.log(`Customer Name: ${group.customerName}`);
        console.log(`Number of CSAT Surveys Sent: ${secondSheetSentCount} (count of "CSAT SENT DATE" for this CUSTOMER_ID/CUST_ID)`);
        console.log(`Number of CSAT Surveys Received: ${secondSheetReceivedCount} (count of "CSAT RECEIVED DATE" for this CUSTOMER_ID/CUST_ID)`);
        console.log(`Data Source: "CSAT sent and received Report" sheet`);
        console.log(`Date Filter Applied: ${csatCycleStartDateFormatted ? 'Yes' : 'No'} ${csatCycleStartDateFormatted ? `(>= ${csatCycleStartDateFormatted})` : ''}`);
        
        // Additional debugging for zero counts
        if (secondSheetSentCount === 0 && secondSheetReceivedCount === 0) {
          console.log(`\n🚨 ZERO COUNTS DIAGNOSIS:`);
          console.log(`Total rows in second sheet: ${secondSheetDataToUse.length}`);
          console.log(`Rows processed: ${totalRowsProcessed}`);
          console.log(`Matching customer rows: ${matchingRowsFound}`);
          console.log(`CSAT columns detected: Sent="${cssSentColumn}", Received="${cssReceivedColumn}"`);
          if (matchingRowsFound === 0) {
            console.log(`❌ ISSUE: No matching customer rows found`);
            console.log(`Current customer ID: "${group.customerId}" (type: ${typeof group.customerId})`);
            console.log(`Sample customer IDs from second sheet:`, 
              secondSheetDataToUse.slice(0, 5).map(row => ({
                CUST_ID: row['CUST_ID'],
                CUSTOMER_ID: row['CUSTOMER_ID'],
                types: { CUST_ID: typeof row['CUST_ID'], CUSTOMER_ID: typeof row['CUSTOMER_ID'] }
              }))
            );
          } else {
            console.log(`❌ ISSUE: Customer rows found but no valid dates`);
            console.log(`Check if CSAT SENT DATE and CSAT RECEIVED DATE columns exist and have data`);
          }
        }
      }
      
      row['Polled'] = secondSheetSentCount;
      row['Responded'] = secondSheetReceivedCount;
      
      // Log final counts for debugging
      if (index < 3) { // Only log first 3 customers to avoid spam
        console.log(`Customer ${group.customerId} (${group.customerName}): Final counts - CSAT Sent: ${secondSheetSentCount}, CSAT Received: ${secondSheetReceivedCount}`);
      }

      // ALWAYS calculate perspective averages from first sheet data ("CSAT received Report")
      // The rating data comes from the first sheet, grouped by CUSTOMER_ID/CUST_ID
        const perspectiveAverages = [];
      let hasAnyRatingData = false;
      
        perspectives.forEach(perspective => {
          const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
          const ratings = group.perspectives[normalizedPerspective] || [];
          // Filter out zero ratings when calculating average
          const nonZeroRatings = ratings.filter(r => r > 0);
        if (nonZeroRatings.length > 0) {
          hasAnyRatingData = true;
          const average = nonZeroRatings.reduce((sum, r) => sum + r, 0) / nonZeroRatings.length;
          row[normalizedPerspective] = avgToFixed2(average);
            perspectiveAverages.push(average);
        } else {
          row[normalizedPerspective] = '-';
          }
        });

        // Calculate Total Avg CSAT Scores(Overall Experience): Average of "Overall Experience" perspective ratings
        const overallExperienceRatings = group.perspectives['Overall Experience'] || [];
        const nonZeroOverallExperienceRatings = overallExperienceRatings.filter(r => r > 0 && !isNaN(r));
      if (nonZeroOverallExperienceRatings.length > 0) {
        const totalAvgOverallExperience = avgToFixed2(nonZeroOverallExperienceRatings.reduce((sum, r) => sum + r, 0) / nonZeroOverallExperienceRatings.length);
        row['Total Avg CSAT Scores(Overall Experience)'] = totalAvgOverallExperience;
      } else {
        row['Total Avg CSAT Scores(Overall Experience)'] = '-';
      }

        // Calculate Response Rate % from second sheet data: (CSS Received / CSS Sent) * 100
      // Display with 1 decimal place as per PCSAT requirement
        const responseRate = secondSheetSentCount > 0 
        ? ((secondSheetReceivedCount / secondSheetSentCount) * 100).toFixed(1)
        : '-';
        row['Response Rate %'] = responseRate;

      // Perspective columns already show hyphen if no rating data (handled above)
      // No special handling for SEAD - treat same as other BUs

      return row;
    });

    // Add Other Account row for Top 10 view (always create it when showTop10 is true)
    console.log('=== OTHER ACCOUNT PROCESSING CHECK ===');
    console.log('showTop10:', showTop10);
    console.log('otherAccountData exists:', !!otherAccountData);
    console.log('otherAccountData.length:', otherAccountData ? otherAccountData.length : 'undefined');
    console.log('otherAccountData:', otherAccountData);
    
    if (showTop10) {
      console.log('=== PROCESSING OTHER ACCOUNT ===');
      console.log('Processing Other Account data for Top 10 view...');
      console.log('otherAccountData.length:', otherAccountData.length);
      
      // Process Other Account data similar to Top 10 customers
      const otherAccountGroup = {
        customerId: 'OTHER',
        customerName: 'Other Account',
        businessUnit: '',
        cssSentCount: 0,
        cssReceivedCount: 0,
        perspectives: {},
        ratings: []
      };
      
      // Process Other Account data - need to get rating data from first sheet for these customers
      const otherAccountCustomerIds = otherAccountData && otherAccountData.length > 0 
        ? [...new Set(otherAccountData.map(row => row['CUSTOMER_ID'] || row['CUST_ID']).filter(Boolean))]
        : [];
      console.log('Other Account customer IDs:', otherAccountCustomerIds.slice(0, 10));
      
      // Get rating data from first sheet for Other Account customers
      const otherAccountRatingData = otherAccountCustomerIds.length > 0
        ? filteredData.filter(row => {
        const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
        return otherAccountCustomerIds.includes(customerId);
          })
        : [];
      
      console.log('Other Account rating data from first sheet:', otherAccountRatingData.length, 'rows');
      
      // Recalculate Other Account counts from raw second sheet data
      // Count rows where:
      // - TYPE OF ACCOUNT ≠ "Top 10" (from second sheet column)
      // - YEAR - QUARTER = acsatCycle
      // - CSAT SENT DATE >= csatCycleStartDateFormatted
      // - CSAT RECEIVED DATE >= csatCycleStartDateFormatted AND NOT blank/empty
      // For "Number of CSAT Surveys Sent": count only rows where both CSAT SENT DATE and CSAT RECEIVED DATE are valid and not blank
      if (secondSheetDataToUse.length > 0) {
        // Find column indices in second sheet data (prefer CSAT SENT DATE / CSAT RECEIVED DATE)
        const firstRow = secondSheetDataToUse[0] || {};
        
        // Find TYPE OF ACCOUNT column
        const typeOfAccountColumn = Object.keys(firstRow).find(key => {
          const lowerKey = key.toLowerCase();
          return lowerKey.includes('type of account') ||
                 lowerKey.includes('typeofaccount') ||
                 lowerKey.includes('account type') ||
                 lowerKey.includes('type_of_account');
        });
        
        // Find YEAR - QUARTER column
        const yearQuarterColumn = Object.keys(firstRow).find(key => {
          const lowerKey = key.toLowerCase();
          return lowerKey.includes('year') && lowerKey.includes('quarter') ||
                 lowerKey === 'year - quarter' ||
                 lowerKey === 'year_quarter';
        });
        
        // Find CSAT SENT DATE column
        const cssSentColumn = Object.keys(firstRow).find(key => {
          const lowerKey = key.toLowerCase();
          return key === 'CSAT SENT DATE' ||
                 key === 'CSAT_SENT_DATE' ||
                 lowerKey.includes('csat sent date') ||
                 lowerKey.includes('csat_sent_date') || 
                 key === 'CSS_SENT_DATE' ||
                 key === 'CSS SENT DATE' ||
                 lowerKey.includes('css sent date') ||
                 lowerKey.includes('css_sent_date');
        });

        // Find CSAT RECEIVED DATE column
        const cssReceivedColumn = Object.keys(firstRow).find(key => {
          const lowerKey = key.toLowerCase();
          return key === 'CSAT RECEIVED DATE' ||
                 key === 'CSAT_RECEIVED_DATE' ||
                 lowerKey.includes('csat received date') ||
                 lowerKey.includes('csat_received_date') || 
                 key === 'CSS_RECEIVED_DATE' ||
                 key === 'CSS RECEIVED DATE' ||
                 lowerKey.includes('css received date') ||
                 lowerKey.includes('css_received_date');
        });
        
        console.log('🔍 Other Account - Column detection:', {
          typeOfAccountColumn,
          yearQuarterColumn,
          cssSentColumn,
          cssReceivedColumn,
          acsatCycle,
          csatCycleStartDateFormatted
        });
        
        // Count rows that meet all criteria
        // Note: For "Other Account", we don't filter by YEAR-QUARTER to get all blank/empty "Top 10" rows
        let totalRowsProcessed = 0;
        let rowsWithBlankTop10 = 0;
        let rowsFilteredByTop10 = 0;
        let rowsWithValidSentDate = 0;
        let rowsWithValidReceivedDate = 0;
        let rowsWithInvalidSentDate = 0;
        let rowsWithInvalidReceivedDate = 0;
        
        secondSheetDataToUse.forEach((row) => {
          totalRowsProcessed++;
          
          // Other Account: include rows where TYPE OF ACCOUNT is not "Top 10" (and not "Top 10" = "Y")
          if (isTop10AccountRow(row)) {
            rowsFilteredByTop10++;
            return;
          }
          rowsWithBlankTop10++;
          
          // Count Polled: CSAT SENT DATE (or CSS_SENT_DATE) where row is Other Account and date >= cycle start
          const sentDateValue = row['CSAT SENT DATE'] ?? (cssSentColumn ? row[cssSentColumn] : null) ?? row['CSS_SENT_DATE'];
          if (sentDateValue) {
            if (sentDateValue && sentDateValue !== '' && sentDateValue !== 'N/A') {
              const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateValue);
              if (sentDateFormatted) {
                if (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
                  otherAccountGroup.cssSentCount++;
                  rowsWithValidSentDate++;
                } else {
                  rowsWithInvalidSentDate++;
                }
              } else {
                rowsWithInvalidSentDate++;
              }
            }
          } else if (rowsWithBlankTop10 === 1) {
            console.warn('⚠️ CSAT SENT DATE / CSS_SENT_DATE column not found in second sheet for Other Account calculation');
          }
          
          // Count Responded: CSAT RECEIVED DATE (or CSS_RECEIVED_DATE) where row is Other Account and date >= cycle start
          const receivedDateValue = row['CSAT RECEIVED DATE'] ?? (cssReceivedColumn ? row[cssReceivedColumn] : null) ?? row['CSS_RECEIVED_DATE'];
          if (receivedDateValue) {
            if (receivedDateValue && receivedDateValue !== '' && receivedDateValue !== 'N/A' && receivedDateValue !== null && receivedDateValue !== undefined) {
              const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateValue);
              if (receivedDateFormatted) {
                if (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) {
                  otherAccountGroup.cssReceivedCount++;
                  rowsWithValidReceivedDate++;
                } else {
                  rowsWithInvalidReceivedDate++;
                }
              } else {
                rowsWithInvalidReceivedDate++;
              }
            }
          } else if (rowsWithBlankTop10 === 1) {
            console.warn('⚠️ CSAT RECEIVED DATE / CSS_RECEIVED_DATE column not found in second sheet for Other Account calculation');
          }
        });
        
        // Sample a few rows to see what TYPE OF ACCOUNT / Top 10 values look like
        const sampleTop10Values = [];
        secondSheetDataToUse.slice(0, 20).forEach((row, idx) => {
          const top10Val = row['TYPE OF ACCOUNT'] ?? row['Top 10'];
          sampleTop10Values.push({
            index: idx,
            top10Value: top10Val,
            top10Type: typeof top10Val,
            top10String: top10Val ? top10Val.toString() : 'null/undefined',
            isBlank: !top10Val || top10Val === '' || top10Val === null || top10Val === undefined || (typeof top10Val === 'string' && top10Val.trim() === '')
          });
        });
        
        console.log('🔍 Other Account - Detailed Debug Info:', {
          totalRowsProcessed,
          rowsWithBlankTop10,
          rowsFilteredByTop10,
          rowsWithValidSentDate,
          rowsWithValidReceivedDate,
          rowsWithInvalidSentDate,
          rowsWithInvalidReceivedDate,
          cssSentColumn,
          cssReceivedColumn,
          csatCycleStartDateFormatted,
          acsatCycle,
          sampleTop10Values: sampleTop10Values.slice(0, 10),
          finalCounts: {
            cssSentCount: otherAccountGroup.cssSentCount,
            cssReceivedCount: otherAccountGroup.cssReceivedCount
          }
        });
        
        console.log('🔍 Other Account - Final counts:', {
          cssSentCount: otherAccountGroup.cssSentCount,
          cssReceivedCount: otherAccountGroup.cssReceivedCount
        });
      }
      
      // Process ratings and perspectives for Other Account from first sheet data
      otherAccountRatingData.forEach((row, index) => {
        const perspective = row[perspectiveColumn];
        const rating = parseFloat(row['RATING']);
        
        // Check if this rating should be included based on CSS filtering
        let shouldIncludeRating = true;
        if (csatCycleStartDateFormatted && row['CSS_SENT_DATES'] && row['CSS_RECEIVED_DATES']) {
          const hasValidSentDate = row['CSS_SENT_DATES'].some(sentDate => {
            if (!sentDate || sentDate === 'N/A' || sentDate === '') return false;
            const sentDateFormatted = formatDateToMMDDYYYY(sentDate);
            return isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted);
          });
          const hasValidReceivedDate = row['CSS_RECEIVED_DATES'].some(receivedDate => {
            if (!receivedDate || receivedDate === 'N/A' || receivedDate === '') return false;
            const receivedDateFormatted = formatDateToMMDDYYYY(receivedDate);
            return isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
          });
          shouldIncludeRating = hasValidSentDate && hasValidReceivedDate;
        }

        if (perspective && !isNaN(rating) && shouldIncludeRating) {
          const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
          if (!otherAccountGroup.perspectives[normalizedPerspective]) {
            otherAccountGroup.perspectives[normalizedPerspective] = [];
          }
          otherAccountGroup.perspectives[normalizedPerspective].push(rating);
        }

        if (!isNaN(rating) && shouldIncludeRating) {
          otherAccountGroup.ratings.push(rating);
        }
      });
      
      // Create Other Account row (no Sr. No.)
      const otherAccountRow = {
        sNo: '', // No Sr. No. for Other Account row
        customerId: otherAccountGroup.customerId,
        customerName: otherAccountGroup.customerName,
        businessUnit: otherAccountGroup.businessUnit,
        cssSentCount: otherAccountGroup.cssSentCount,
        cssReceivedCount: otherAccountGroup.cssReceivedCount,
        isOtherAccount: true // Flag to identify Other Account row
      };

      // When Responded = 0, show hyphen for perspective and Total Avg (PCSAT requirement)
      if (otherAccountGroup.cssReceivedCount === 0) {
        perspectives.forEach(perspective => {
          otherAccountRow[perspective] = '-';
        });
        otherAccountRow['Total Avg CSAT Scores(Overall Experience)'] = '-';
      } else {
        // Add perspective averages for Other Account
        perspectives.forEach(perspective => {
          const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
          const perspectiveRatings = otherAccountGroup.perspectives[normalizedPerspective] || [];
          const average = perspectiveRatings.length > 0 
            ? perspectiveRatings.reduce((sum, rating) => sum + rating, 0) / perspectiveRatings.length 
            : 0;
          otherAccountRow[normalizedPerspective] = Math.round(average * 100) / 100;
        });

        // Calculate Total Avg CSAT Scores(Overall Experience): Average of "Overall Experience" perspective ratings only
        const overallExperienceRatings = otherAccountGroup.perspectives['Overall Experience'] || [];
        const nonZeroOverallExperienceRatings = overallExperienceRatings.filter(r => r > 0 && !isNaN(r));
        const totalAvgOverallExperience = nonZeroOverallExperienceRatings.length > 0 
          ? avgToFixed2(nonZeroOverallExperienceRatings.reduce((sum, r) => sum + r, 0) / nonZeroOverallExperienceRatings.length)
          : '0.00';
        
        console.log('Other Account Overall Experience calculation:', {
          overallExperienceRatings: overallExperienceRatings,
          nonZeroOverallExperienceRatings: nonZeroOverallExperienceRatings,
          totalAvgOverallExperience: totalAvgOverallExperience,
          allPerspectives: Object.keys(otherAccountGroup.perspectives)
        });
        
        otherAccountRow['Total Avg CSAT Scores(Overall Experience)'] = totalAvgOverallExperience;
      }
      otherAccountRow['Polled'] = otherAccountGroup.cssSentCount;
      otherAccountRow['Responded'] = otherAccountGroup.cssReceivedCount;

      // Create Other Account Count row: "Number of CSATs considered==>" in #Responded column
      const otherAccountCountRow = {
        sNo: '',
        customerId: 'OTHER_COUNT',
        customerName: '',
        businessUnit: '',
        'Polled': '',
        'Responded': 'Number of CSATs considered==>',
        isOtherAccountCountRow: true
      };
      perspectives.forEach(perspective => {
        const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
        otherAccountCountRow[perspective] = (otherAccountGroup.perspectives[normalizedPerspective] || []).length;
      });
      otherAccountCountRow['Total Avg CSAT Scores(Overall Experience)'] = '';

      // Add Other Account row and Other Account Count row to result
      result.push(otherAccountRow);
      result.push(otherAccountCountRow);
      
      console.log('Other Account row added:', otherAccountRow);
      console.log('Result length after adding Other Account:', result.length);
      console.log('=== END PROCESSING OTHER ACCOUNT ===');
    } else {
      console.log('Other Account processing skipped - conditions not met');
      console.log('showTop10:', showTop10);
      console.log('otherAccountData exists:', !!otherAccountData);
      console.log('otherAccountData length:', otherAccountData ? otherAccountData.length : 'N/A');
    }

    // Include all rows (including Polled = 0) so SEAD and other accounts appear; hyphen for perspective columns when Responded = 0 or (SEAD and Polled = 0)
    const filteredResult = result;

    // Check if Other Account row exists in filteredResult
    const otherAccountInResult = filteredResult.find(row => row.isOtherAccount);
    console.log('AccountWiseAvgDashboard - Final processed data:', {
      totalGroups: customerGroups.size,
      resultLength: result.length,
      filteredResultLength: filteredResult.length,
      sampleData: filteredResult.slice(0, 3),
      perspectives: perspectives,
      hasOtherAccountRow: !!otherAccountInResult,
      otherAccountRow: otherAccountInResult
    });
    return filteredResult;
  }, [uploadedData, showTop10, excelData, csatCycleStartDateFormatted, acsatCycle, engagementTypeFilter]);

  const filteredData = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];

    // Co-Managed filter: same second sheet filter as processedData (for Top 10 / Overall row logic)
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;
    const secondSheetDataToUse = engagementTypeFilter === 'Co-Managed' && secondSheetEngagementKey
      ? secondSheetDataRaw.filter(row => isCoManagedRow(row, secondSheetEngagementKey))
      : secondSheetDataRaw;

    let filtered = processedData;

    // Filter by business unit (but always include special rows)
    if (businessUnitFilter) {
      filtered = filtered.filter(row => 
        row.isOtherAccount || row.isOtherAccountCountRow || row.isTop10Accounts || row.isTop10CountRow || row.isOverall || row.isOverallCountRow || // Always include special rows
        (row.businessUnit && 
        row.businessUnit.toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      );
    }
    
    // Filter by customer name search (but always include special rows)
    if (customerNameSearch) {
      filtered = filtered.filter(row => 
        row.isOtherAccount || row.isOtherAccountCountRow || row.isTop10Accounts || row.isTop10CountRow || row.isOverall || row.isOverallCountRow || // Always include special rows
        (row.customerName && 
        row.customerName.toString().toLowerCase().includes(customerNameSearch.toLowerCase()))
      );
    }
    
    // Filter by account/customer dropdown (but always include special rows)
    if (accountCustomerFilter) {
      filtered = filtered.filter(row => 
        row.isOtherAccount || row.isOtherAccountCountRow || row.isTop10Accounts || row.isTop10CountRow || row.isOverall || row.isOverallCountRow || // Always include special rows
        (row.customerName && 
        row.customerName === accountCustomerFilter)
      );
    }
    
    // Custom sorting for Top 10 accounts (fixed order with correct Sr. No. 1–12)
    if (showTop10) {
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
      const normalizeForOrder = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
      const orderByNormalized = new Map();
      top10Order.forEach((name, i) => { orderByNormalized.set(normalizeForOrder(name), i); });
      const getOrderIndex = (row) => {
        const n = normalizeForOrder(row.customerName);
        return orderByNormalized.has(n) ? orderByNormalized.get(n) : 999;
      };

      filtered.sort((a, b) => {
        const indexA = getOrderIndex(a);
        const indexB = getOrderIndex(b);
        if (indexA !== indexB) return indexA - indexB;
        return (a.customerName || '').localeCompare(b.customerName || '');
      });

      // Reassign Sr. No. after Top 10 sorting (1, 2, … for account rows only; special rows get no Sr. No.)
      let srNo = 1;
      filtered = filtered.map((row) => {
        if (row.isOtherAccount || row.isOtherAccountCountRow || row.isTop10Accounts || row.isTop10CountRow || row.isOverall || row.isOverallCountRow) {
          return { ...row, sNo: '' };
        }
        return { ...row, sNo: srNo++ };
      });
      
      // Calculate Top 10 Accounts grand totals (exclude Other Account from calculation)
      const top10AccountsData = filtered.filter(row => row.customerName !== 'Other Account');
      
      if (top10AccountsData.length > 0) {
        // Calculate grand totals from original processedData for accurate perspective averages
        // We need to collect all individual ratings from Top 10 accounts
        const top10AccountIds = new Set(top10AccountsData.map(row => row.customerId));
        
        // Get all Top 10 account data from processedData
        const top10AccountsFromProcessed = processedData.filter(row => 
          top10AccountIds.has(row.customerId) && row.customerName !== 'Other Account'
        );
        
        // Calculate totals
        const top10UniqueCustomers = new Set();
        let top10TotalPolled = 0;
        let top10TotalResponded = 0;
        const top10PerspectiveRatings = {};
        
        top10AccountsFromProcessed.forEach(row => {
          if (row.customerId) {
            top10UniqueCustomers.add(row.customerId);
          }
        });
        
        // Count Polled and Responded from second sheet where TYPE OF ACCOUNT = "Top 10" or "Top 10" = "Y"
        if (secondSheetDataToUse.length > 0) {
          const firstRow = secondSheetDataToUse[0] || {};
          const cssSentColumn = Object.keys(firstRow).find(key => {
            const lowerKey = key.toLowerCase();
            return key === 'CSAT SENT DATE' || lowerKey.includes('csat sent date') || key === 'CSS_SENT_DATE' || lowerKey.includes('css sent date');
          });
          const cssReceivedColumn = Object.keys(firstRow).find(key => {
            const lowerKey = key.toLowerCase();
            return key === 'CSAT RECEIVED DATE' || lowerKey.includes('csat received date') || key === 'CSS_RECEIVED_DATE' || lowerKey.includes('css received date');
          });
          secondSheetDataToUse.forEach(row => {
            if (!isTop10AccountRow(row)) return;
            const sentDateValue = row['CSAT SENT DATE'] ?? (cssSentColumn ? row[cssSentColumn] : null) ?? row['CSS_SENT_DATE'];
            if (sentDateValue && sentDateValue !== '' && sentDateValue !== 'N/A') {
              const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateValue);
              if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
                top10TotalPolled++;
              }
            }
            const receivedDateValue = row['CSAT RECEIVED DATE'] ?? (cssReceivedColumn ? row[cssReceivedColumn] : null) ?? row['CSS_RECEIVED_DATE'];
            if (receivedDateValue && receivedDateValue !== '' && receivedDateValue !== 'N/A') {
              const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateValue);
              if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
                top10TotalResponded++;
              }
            }
          });
        }
        
        // Collect all individual ratings for each perspective from original uploadedData
        // Filter to only Top 10 accounts
        if (uploadedData) {
          const top10FilteredData = uploadedData.filter(row => {
            const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
            if (questionCategory === 'Qualitative Feedback') return false;
            const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
            return top10AccountIds.has(customerId);
          });
          
          const perspectiveColumn = 'PERSPECTIVE' || 'Perspective' || 'perspective';
          
          top10FilteredData.forEach(row => {
            const perspective = row[perspectiveColumn];
            const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']) || 0;
            
            if (perspective && !isNaN(rating) && rating > 0) {
              if (!top10PerspectiveRatings[perspective]) {
                top10PerspectiveRatings[perspective] = [];
              }
              top10PerspectiveRatings[perspective].push(rating);
            }
          });
        }
        
        // Get all unique perspectives from the collected ratings
        const allPerspectives = Object.keys(top10PerspectiveRatings);
        
        // Create Top 10 Accounts grand total row
        const top10AccountsRow = {
          sNo: '', // No Sr. No. for Top 10 Accounts row
          customerId: 'TOP10_TOTAL',
          customerName: 'Top 10 Accounts',
          businessUnit: '',
          'Polled': top10TotalPolled,
          'Responded': top10TotalResponded,
          isTop10Accounts: true // Flag to identify Top 10 Accounts row
        };
        
        // When Responded = 0, show hyphen (PCSAT requirement)
        const perspectiveKeysForHyphen = processedData.length > 0
          ? Object.keys(processedData[0]).filter(k => !['sNo', 'customerId', 'customerName', 'businessUnit', 'cssSentCount', 'cssReceivedCount', 'category', 'Total Avg CSAT Scores(Overall Experience)', 'Response Rate %', 'Polled', 'Responded'].includes(k))
          : allPerspectives;
        if (top10TotalResponded === 0) {
          perspectiveKeysForHyphen.forEach(perspective => {
            top10AccountsRow[perspective] = '-';
          });
          top10AccountsRow['Total Avg CSAT Scores(Overall Experience)'] = '-';
        } else {
          // Calculate perspective averages from all individual ratings
          allPerspectives.forEach(perspective => {
            const ratings = top10PerspectiveRatings[perspective] || [];
            const average = ratings.length > 0 
              ? avgToFixed2(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
              : '0.00';
            top10AccountsRow[perspective] = average;
          });
          
          // Calculate Total Avg CSAT Scores(Overall Experience) from all Overall Experience ratings
          const overallExperienceRatings = top10PerspectiveRatings['Overall Experience'] || [];
          const totalAvgOverallExperience = overallExperienceRatings.length > 0 
            ? avgToFixed2(overallExperienceRatings.reduce((sum, r) => sum + r, 0) / overallExperienceRatings.length)
            : '0.00';
          
          top10AccountsRow['Total Avg CSAT Scores(Overall Experience)'] = totalAvgOverallExperience;
        }
        
        // Create Top 10 Count row: "Number of CSATs considered==>" in #Responded column
        const top10CountRow = {
          sNo: '',
          customerId: 'TOP10_COUNT',
          customerName: '',
          businessUnit: '',
          'Polled': '',
          'Responded': 'Number of CSATs considered==>',
          isTop10CountRow: true
        };
        Object.keys(top10PerspectiveRatings).forEach(perspective => {
          top10CountRow[perspective] = (top10PerspectiveRatings[perspective] || []).length;
        });
        top10CountRow['Total Avg CSAT Scores(Overall Experience)'] = '';

        // Add Top 10 Accounts row, then Top 10 Count row, then Other Account row, then Other Account Count row
        const otherAccountRow = filtered.find(row => row.isOtherAccount || row.customerName === 'Other Account');
        const otherAccountCountRow = filtered.find(row => row.isOtherAccountCountRow);
        if (otherAccountRow) {
          // Remove Other Account and Other Account Count from current positions
          const otherAccountIndex = filtered.indexOf(otherAccountRow);
          filtered.splice(otherAccountIndex, 1);
          const otherCountIndex = otherAccountCountRow ? filtered.indexOf(otherAccountCountRow) : -1;
          if (otherCountIndex >= 0) filtered.splice(otherCountIndex, 1);
          
          // Add Top 10 Accounts row, Top 10 Count row, Other Account row, Other Account Count row
          filtered.push(top10AccountsRow);
          filtered.push(top10CountRow);
          filtered.push(otherAccountRow);
          if (otherAccountCountRow) filtered.push(otherAccountCountRow);
        } else {
          // Add Top 10 Accounts row and Count row at the end if no Other Account
          filtered.push(top10AccountsRow);
          filtered.push(top10CountRow);
          if (otherAccountCountRow) {
            const otherCountIndex = filtered.indexOf(otherAccountCountRow);
            if (otherCountIndex >= 0) {
              filtered.splice(otherCountIndex, 1);
              filtered.push(otherAccountCountRow);
            }
          }
          console.log('⚠️ Other Account row not found in filtered data when showTop10 is true');
          console.log('Filtered data customer names:', filtered.map(r => r.customerName));
        }
        
        // Calculate Overall row (grand totals for ALL accounts) using filtered second sheet
        if (secondSheetDataToUse.length > 0 && uploadedData) {
          const firstRow = secondSheetDataToUse[0] || {};
          const cssSentColumn = Object.keys(firstRow).find(key => {
            const lowerKey = key.toLowerCase();
            return key === 'CSAT SENT DATE' || lowerKey.includes('csat sent date') || key === 'CSS_SENT_DATE' || lowerKey.includes('css sent date');
          });
          const cssReceivedColumn = Object.keys(firstRow).find(key => {
            const lowerKey = key.toLowerCase();
            return key === 'CSAT RECEIVED DATE' || lowerKey.includes('csat received date') || key === 'CSS_RECEIVED_DATE' || lowerKey.includes('css received date');
          });
          let overallPolled = 0;
          secondSheetDataToUse.forEach(row => {
            const sentDateValue = row['CSAT SENT DATE'] ?? (cssSentColumn ? row[cssSentColumn] : null) ?? row['CSS_SENT_DATE'];
            if (sentDateValue && sentDateValue !== '' && sentDateValue !== 'N/A') {
              const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateValue);
              if (sentDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted))) {
                overallPolled++;
              }
            }
          });
          let overallResponded = 0;
          secondSheetDataToUse.forEach(row => {
            const receivedDateValue = row['CSAT RECEIVED DATE'] ?? (cssReceivedColumn ? row[cssReceivedColumn] : null) ?? row['CSS_RECEIVED_DATE'];
            if (receivedDateValue && receivedDateValue !== '' && receivedDateValue !== 'N/A') {
              const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateValue);
              if (receivedDateFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted))) {
                overallResponded++;
              }
            }
          });
          
          // Calculate Response % = Responded/Polled*100
          // Display with 1 decimal place as per PCSAT requirement
          const overallResponseRate = overallPolled > 0 
            ? ((overallResponded / overallPolled) * 100).toFixed(1)
            : '0.0';
          
          // Calculate perspective averages from ALL accounts in uploadedData
          const overallPerspectiveRatings = {};
          const perspectiveColumn = 'PERSPECTIVE' || 'Perspective' || 'perspective';
          
          // Filter out Qualitative Feedback
          const allAccountsData = uploadedData.filter(row => {
            const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
            return questionCategory !== 'Qualitative Feedback';
          });
          
          allAccountsData.forEach(row => {
            const perspective = row[perspectiveColumn];
            const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']) || 0;
            
            if (perspective && !isNaN(rating) && rating > 0) {
              if (!overallPerspectiveRatings[perspective]) {
                overallPerspectiveRatings[perspective] = [];
              }
              overallPerspectiveRatings[perspective].push(rating);
            }
          });
          
          // Create Overall row
          const overallRow = {
            sNo: '', // No Sr. No. for Overall row
            customerId: 'OVERALL',
            customerName: 'Overall',
            businessUnit: '',
            'Polled': overallPolled,
            'Responded': overallResponded,
            'Response Rate %': overallResponseRate,
            isOverall: true // Flag to identify Overall row
          };
          
          if (overallResponded === 0) {
            const overallPerspectiveKeys = processedData.length > 0
              ? Object.keys(processedData[0]).filter(k => !['sNo', 'customerId', 'customerName', 'businessUnit', 'cssSentCount', 'cssReceivedCount', 'category', 'Total Avg CSAT Scores(Overall Experience)', 'Response Rate %', 'Polled', 'Responded'].includes(k))
              : Object.keys(overallPerspectiveRatings);
            overallPerspectiveKeys.forEach(perspective => {
              overallRow[perspective] = '-';
            });
            overallRow['Total Avg CSAT Scores(Overall Experience)'] = '-';
          } else {
            // Calculate perspective averages from all individual ratings
            const allPerspectives = Object.keys(overallPerspectiveRatings);
            allPerspectives.forEach(perspective => {
              const ratings = overallPerspectiveRatings[perspective] || [];
              const average = ratings.length > 0 
                ? avgToFixed2(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
                : '0.00';
              overallRow[perspective] = average;
            });
            
            // Calculate Total Avg CSAT Scores(Overall Experience) from all Overall Experience ratings
            const overallExperienceRatings = overallPerspectiveRatings['Overall Experience'] || [];
            const totalAvgOverallExperience = overallExperienceRatings.length > 0 
              ? avgToFixed2(overallExperienceRatings.reduce((sum, r) => sum + r, 0) / overallExperienceRatings.length)
              : '0.00';
            
            overallRow['Total Avg CSAT Scores(Overall Experience)'] = totalAvgOverallExperience;
          }

          // Create Overall Count row: "Number of CSATs considered==>" in #Responded column
          const overallCountRow = {
            sNo: '',
            customerId: 'OVERALL_COUNT',
            customerName: '',
            businessUnit: '',
            'Polled': '',
            'Responded': 'Number of CSATs considered==>',
            isOverallCountRow: true
          };
          const allPerspectivesForCount = Object.keys(overallPerspectiveRatings);
          allPerspectivesForCount.forEach(perspective => {
            const count = (overallPerspectiveRatings[perspective] || []).length;
            overallCountRow[perspective] = count;
            // Set alternate keys for getPerspectiveValue compatibility
            if (perspective === 'Quality of deliverables') overallCountRow['Quality of Delivery'] = count;
            else if (perspective === 'Quality of Delivery') overallCountRow['Quality of deliverables'] = count;
            else if (perspective === 'Risk Management & Responsivenes') overallCountRow['Risk Management & Responsiveness'] = count;
            else if (perspective === 'Risk Management & Responsiveness') overallCountRow['Risk Management & Responsivenes'] = count;
          });
          overallCountRow['Total Avg CSAT Scores(Overall Experience)'] = '';
          
          // Add Overall row and Overall Count row at the end
          filtered.push(overallRow);
          filtered.push(overallCountRow);
        }
      }
    }
    
    return filtered;
  }, [processedData, businessUnitFilter, customerNameSearch, accountCustomerFilter, showTop10, uploadedData, excelData, csatCycleStartDateFormatted, engagementTypeFilter]);

  const uniqueBusinessUnits = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    const buList = [...new Set(processedData.map(row => row.businessUnit).filter(Boolean))];
    return buList.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a);
      const iB = getBusinessUnitOrderIndex(b);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a || '').localeCompare(b || '');
    });
  }, [processedData]);

  const uniqueAccountsCustomers = useMemo(() => {
    if (!processedData || processedData.length === 0) return [];
    return [...new Set(processedData.map(row => row.customerName).filter(Boolean))].sort();
  }, [processedData]);

  const perspectives = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];
    
    const perspectiveColumn = 'PERSPECTIVE' || 'Perspective' || 'perspective';
    const filteredData = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      return questionCategory !== 'Qualitative Feedback';
    });
    
    const raw = [...new Set(filteredData.map(row => row[perspectiveColumn]).filter(Boolean))].filter(perspective => 
      perspective !== 'Qualitative Feedback'
    );
    return sortPerspectivesByDisplayOrder(raw);
  }, [uploadedData]);

  const practiceWiseData = useMemo(() => {
    const uploadedHasPractice = uploadedData && uploadedData.length > 0 && Object.keys(uploadedData[0] || {}).some(k => ['practice', 'practice mapped'].includes(String(k).trim().toLowerCase()));
    const source = (practiceFileReceivedData && practiceFileReceivedData.length > 0)
      ? practiceFileReceivedData
      : (uploadedData && uploadedData.length > 0 ? uploadedData : null);
    const secondSheet = (practiceFileSheet2Data && practiceFileSheet2Data.length > 0)
      ? practiceFileSheet2Data
      : (excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : null);
    if (!source) return { rows: [], perspectives: [], dataSource: 'none' };
    const { source: filteredSource, secondSheetSource: filteredSecondSheet } = filterSheetsByBusinessUnit(source, secondSheet, businessUnitFilter);
    const built = buildPracticeWiseAvgFromReceivedReport(filteredSource, csatCycleStartDateFormatted, filteredSecondSheet);
    return {
      ...built,
      dataSource: practiceFileReceivedData && practiceFileReceivedData.length > 0 ? 'file' : 'uploaded'
    };
  }, [practiceFileReceivedData, practiceFileSheet2Data, uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  const practiceWisePerspectives = practiceWiseData.perspectives || [];

  const practiceWiseTrendData = useMemo(() => {
    if (!showPracticeWise || !showTrendAnalysis) {
      return { rows: [], perspectives: [], sourceName: '', error: null };
    }
    if (!csatCycleStartDateFormatted) {
      return { rows: [], perspectives: [], sourceName: '', error: 'CSAT cycle start date is required.' };
    }
    const nameLower = (s) => (s || '').toLowerCase();
    const h12025File =
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis') && nameLower(f.saveName).includes('h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis') && nameLower(f.originalName).includes('h12025')) ||
      (trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null);
    if (!h12025File) {
      return {
        rows: [],
        perspectives: [],
        sourceName: '',
        error: 'Fetch or upload a comparison period in "Upload data for trend analysis" to view trend data.'
      };
    }
    const { sheet1, sheet2 } = getTrendFilePracticeSheets(h12025File);
    if (!sheet1.length && !sheet2.length) {
      return {
        rows: [],
        perspectives: [],
        sourceName: h12025File.saveName || h12025File.originalName || 'Trend-Analysis-H12025.xlsx',
        error: 'No data found in trend file sheets "CSAT received Report" or "CSAT sent and received Report".'
      };
    }
    const { source: filteredSheet1, secondSheetSource: filteredSheet2 } = filterSheetsByBusinessUnit(sheet1, sheet2, businessUnitFilter);
    const built = buildPracticeWiseAvgFromReceivedReport(filteredSheet1, csatCycleStartDateFormatted, filteredSheet2);
    return {
      ...built,
      sourceName: h12025File.saveName || h12025File.originalName || 'Trend-Analysis-H12025.xlsx',
      error: built.rows.length === 0 ? 'No rows with date ≥ CSAT cycle start in trend file.' : null
    };
  }, [showPracticeWise, showTrendAnalysis, trendAnalysisFiles, csatCycleStartDateFormatted, businessUnitFilter]);

  const practiceWiseTrendPerspectives = practiceWiseTrendData.perspectives || [];

  const practiceWiseTrendLookup = useMemo(() => {
    const lookup = {};
    (practiceWiseTrendData.rows || []).forEach((r) => {
      const key = (r.practice || '').toString().trim().toLowerCase();
      if (key) lookup[key] = r;
    });
    return lookup;
  }, [practiceWiseTrendData]);

  // Project Data from main file (e.g. New_customer_feedback_analysis_New.xlsx), sheet "CSAT received Report". One row per (CUSTOMER NAME, PROJECT NAME, RESPONDENT NAME) with perspective columns = RATING. Used for first dashboard "Project Data – Account / Project / Respondent (Perspective Wise)".
  const projectDataFromMainFile = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const customerNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const projectNameCol = Object.keys(firstRow).find(k => /project\s*name/i.test(String(k))) || 'PROJECT NAME';
    const respondentNameCol = Object.keys(firstRow).find(k => /respondent\s*name/i.test(String(k))) || 'RESPONDENT NAME';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const filtered = uploadedData.filter(row => {
      const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
      if (qc === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted && receivedDateKey && (row[receivedDateKey] != null && row[receivedDateKey] !== '')) {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return false;
      }
      return true;
    });
    const perspectiveSet = new Set();
    const groups = new Map();
    filtered.forEach(row => {
      const accountName = String(row[customerNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').trim() || 'N/A';
      const projectName = (projectNameCol && row[projectNameCol] != null) ? String(row[projectNameCol]).trim() : '';
      const respondentName = (respondentNameCol && row[respondentNameCol] != null) ? String(row[respondentNameCol]).trim() : '';
      const perspective = row[perspectiveCol] ?? row['PERSPECTIVE'];
      const rating = parseFloat(row[ratingCol] ?? row['RATING']);
      if (!perspective || perspective === 'Qualitative Feedback') return;
      perspectiveSet.add(perspective);
      const key = `${accountName}|${projectName}|${respondentName}`;
      if (!groups.has(key)) {
        groups.set(key, { accountName, projectName, respondentName, perspectives: {} });
      }
      const g = groups.get(key);
      g.perspectives[perspective] = rating;
    });
    const perspectivesList = sortPerspectivesByDisplayOrder([...perspectiveSet].filter(p => p !== 'Qualitative Feedback'));
    const data = Array.from(groups.values())
      .map((row) => ({
        accountName: row.accountName,
        projectName: row.projectName,
        respondentName: row.respondentName,
        ...Object.fromEntries(perspectivesList.map(p => [p, row.perspectives[p] != null ? row.perspectives[p] : '']))
      }))
      .sort((a, b) => {
        const c = (a.accountName || '').localeCompare(b.accountName || '');
        if (c !== 0) return c;
        const d = (a.projectName || '').localeCompare(b.projectName || '');
        if (d !== 0) return d;
        return (a.respondentName || '').localeCompare(b.respondentName || '');
      })
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));
    return { data, perspectives: perspectivesList };
  }, [uploadedData, csatCycleStartDateFormatted]);

  // Project Data: from trend file "CSAT received Report" (e.g. Trend-Analysis-H12025.xlsx / Upload data for trend analysis). One row per (CUSTOMER NAME, PROJECT NAME, RESPONDENT NAME) with perspective columns = RATING. Used for second dashboard "Project Data – From Trend File".
  const projectDataWithPerspectives = useMemo(() => {
    if (!trendAnalysisFiles?.length) return { data: [], perspectives: [] };
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return { data: [], perspectives: [] };
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { data: [], perspectives: [] };
    const firstRow = sheetData[0] || {};
    const customerNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const projectNameCol = Object.keys(firstRow).find(k => /project\s*name/i.test(String(k))) || 'PROJECT NAME';
    const respondentNameCol = Object.keys(firstRow).find(k => /respondent\s*name/i.test(String(k))) || 'RESPONDENT NAME';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const businessUnitCol = Object.keys(firstRow).find(k => {
      const t = String(k || '').toLowerCase().replace(/\s/g, '');
      return t === 'businessunit' || t === 'bussinessunit';
    });
    const filtered = sheetData.filter(row => {
      const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
      if (qc === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted && receivedDateKey && (row[receivedDateKey] != null && row[receivedDateKey] !== '')) {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return false;
      }
      if (businessUnitFilter && businessUnitCol) {
        const bu = (row[businessUnitCol] ?? '').toString().trim();
        if (!bu.toLowerCase().includes(businessUnitFilter.toLowerCase())) return false;
      }
      return true;
    });
    const perspectiveSet = new Set();
    const groups = new Map();
    filtered.forEach(row => {
      const accountName = String(row[customerNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').trim() || 'N/A';
      const projectName = (projectNameCol && row[projectNameCol] != null) ? String(row[projectNameCol]).trim() : '';
      const respondentName = (respondentNameCol && row[respondentNameCol] != null) ? String(row[respondentNameCol]).trim() : '';
      const perspective = row[perspectiveCol] ?? row['PERSPECTIVE'];
      const rating = parseFloat(row[ratingCol] ?? row['RATING']);
      if (!perspective || perspective === 'Qualitative Feedback') return;
      perspectiveSet.add(perspective);
      const key = `${accountName}|${projectName}|${respondentName}`;
      if (!groups.has(key)) {
        groups.set(key, {
          accountName,
          projectName,
          respondentName,
          perspectives: {}
        });
      }
      const g = groups.get(key);
      g.perspectives[perspective] = rating;
    });
    const perspectivesList = sortPerspectivesByDisplayOrder([...perspectiveSet].filter(p => p !== 'Qualitative Feedback'));
    const data = Array.from(groups.values())
      .map((row) => ({
        accountName: row.accountName,
        projectName: row.projectName,
        respondentName: row.respondentName,
        ...Object.fromEntries(perspectivesList.map(p => [p, row.perspectives[p] != null ? row.perspectives[p] : '']))
      }))
      .sort((a, b) => {
        const c = (a.accountName || '').localeCompare(b.accountName || '');
        if (c !== 0) return c;
        const d = (a.projectName || '').localeCompare(b.projectName || '');
        if (d !== 0) return d;
        return (a.respondentName || '').localeCompare(b.respondentName || '');
      })
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));
    return { data, perspectives: perspectivesList, fileName: file.saveName || file.originalName || '' };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, businessUnitFilter]);

  // Fully Managed dashboard: from "CSAT received Report" (first sheet), ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID/CUST_ID, avg RATING per perspective; Polled/Responded from second sheet "CSAT sent and received Report" with date >= CSAT cycle start (MM-DD-YYYY)
  const fullyManagedAccountData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const engagementKeyFirst = getEngagementTypeKey(firstRow);
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;

    let fullyManagedCustomerIds = new Set();
    if (engagementKeyFirst) {
      uploadedData.forEach(row => {
        if (isFullyManagedRow(row, engagementKeyFirst)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) fullyManagedCustomerIds.add(id);
        }
      });
    }
    if (secondSheetEngagementKey) {
      secondSheetDataRaw.forEach(row => {
        if (isFullyManagedRow(row, secondSheetEngagementKey)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) fullyManagedCustomerIds.add(id);
        }
      });
    }
    if (fullyManagedCustomerIds.size === 0) return { data: [], perspectives: [] };

    // Polled / Responded from second sheet "CSAT sent and received Report": count(CSAT SENT DATE) and count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted (MM-DD-YYYY), grouped by CUSTOMER_ID/CUST_ID, only Fully Managed rows
    const polledRespondedMap = new Map();
    fullyManagedCustomerIds.forEach(id => polledRespondedMap.set(id, { polled: 0, responded: 0 }));
    if (secondSheetDataRaw.length > 0 && secondSheetEngagementKey && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';
      secondSheetDataRaw.forEach(row => {
        if (!isFullyManagedRow(row, secondSheetEngagementKey)) return;
        if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return;
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!customerId) return;
        if (!polledRespondedMap.has(customerId)) polledRespondedMap.set(customerId, { polled: 0, responded: 0 });
        const entry = polledRespondedMap.get(customerId);
        const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
        const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) entry.polled++;
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) entry.responded++;
      });
    }

    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    // Only rows from "CSAT received Report" where ENGAGEMENT TYPE = "Fully Managed" (Grand Total = avg RATING by perspective for these rows)
    const rowsFiltered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      return id && fullyManagedCustomerIds.has(id) && engagementKeyFirst && isFullyManagedRow(row, engagementKeyFirst) && matchesBusinessUnitFilter(row, businessUnitFilter);
    });

    const fmPerspectives = FULLY_MANAGED_CO_MANAGED_PERSPECTIVES;
    const groups = new Map();
    const globalSums = {};
    const globalCounts = {};
    rowsFiltered.forEach(row => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';
      const businessUnit = row[businessUnitCol] ?? 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!customerId) return;
      if (!groups.has(customerId)) {
        groups.set(customerId, {
          customerId,
          businessUnit,
          accountName: customerName,
          sums: {},
          counts: {}
        });
      }
      const g = groups.get(customerId);
      if (!g.sums[perspective]) { g.sums[perspective] = 0; g.counts[perspective] = 0; }
      if (perspective && !isNaN(rating)) {
        g.sums[perspective] += rating;
        g.counts[perspective]++;
        const canon = normalizePerspectiveForDisplay(perspective);
        if (canon && fmPerspectives.includes(canon)) {
          globalSums[canon] = (globalSums[canon] || 0) + rating;
          globalCounts[canon] = (globalCounts[canon] || 0) + 1;
        }
      }
    });

    // Include accounts that appear only in second sheet (Polled > 0) so rows with Responded=0 show hyphen
    polledRespondedMap.forEach((pr, customerId) => {
      if (pr.polled > 0 && !groups.has(customerId)) {
        const firstRow = secondSheetDataRaw.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === customerId) || {};
        const accountName = (firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? firstRow['Account Name'] ?? customerId)?.toString().trim() || customerId;
        const bu = (firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A')?.toString().trim() || 'N/A';
        const g = { customerId, businessUnit: bu, accountName, sums: {}, counts: {} };
        fmPerspectives.forEach(p => { g.sums[p] = 0; g.counts[p] = 0; });
        groups.set(customerId, g);
      }
    });

    let data = Array.from(groups.values())
      .filter(g => (polledRespondedMap.get(g.customerId) || {}).polled > 0)
      .map((g, idx) => {
        const pr = polledRespondedMap.get(g.customerId) || { polled: 0, responded: 0 };
        const row = { sNo: idx + 1, customerId: g.customerId, businessUnit: g.businessUnit, accountName: g.accountName, Polled: pr.polled, Responded: pr.responded };
        fmPerspectives.forEach(p => {
          const n = g.counts[p] || 0;
          const sum = g.sums[p] || 0;
          row[p] = pr.responded === 0 ? '-' : (n > 0 ? avgToFixed2(sum / n) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '') || (a.accountName || '').localeCompare(b.accountName || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));
    const totalPolled = data.reduce((s, r) => s + (Number(r.Polled) || 0), 0);
    const totalResponded = data.reduce((s, r) => s + (Number(r.Responded) || 0), 0);
    // Grand Total: perspective columns = Avg(RATING) for that perspective (by ENGAGEMENT TYPE), 2 decimal places; row shown at end of table and Excel
    const grandTotal = {
      sNo: '',
      businessUnit: 'Grand Total',
      accountName: '',
      Polled: totalPolled,
      Responded: totalResponded
    };
    fmPerspectives.forEach(p => {
      grandTotal[p] = (globalCounts[p] > 0)
        ? avgToFixed2(globalSums[p] / globalCounts[p])
        : '-';
    });
    return { data, perspectives: fmPerspectives, grandTotal };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Co-Managed dashboard: from "CSAT received Report" (first sheet), ENGAGEMENT TYPE = "Co-Managed", group by CUSTOMER_ID/CUST_ID, avg RATING per perspective; Polled/Responded from second sheet with date >= CSAT cycle start (MM-DD-YYYY)
  const coManagedAccountData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const engagementKeyFirst = getEngagementTypeKey(firstRow);
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;

    let coManagedCustomerIds = new Set();
    if (engagementKeyFirst) {
      uploadedData.forEach(row => {
        if (isCoManagedRow(row, engagementKeyFirst)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) coManagedCustomerIds.add(id);
        }
      });
    }
    if (secondSheetEngagementKey) {
      secondSheetDataRaw.forEach(row => {
        if (isCoManagedRow(row, secondSheetEngagementKey)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) coManagedCustomerIds.add(id);
        }
      });
    }
    if (coManagedCustomerIds.size === 0) return { data: [], perspectives: [] };

    const polledRespondedMap = new Map();
    coManagedCustomerIds.forEach(id => polledRespondedMap.set(id, { polled: 0, responded: 0 }));
    if (secondSheetDataRaw.length > 0 && secondSheetEngagementKey && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';
      secondSheetDataRaw.forEach(row => {
        if (!isCoManagedRow(row, secondSheetEngagementKey)) return;
        if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return;
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!customerId) return;
        if (!polledRespondedMap.has(customerId)) polledRespondedMap.set(customerId, { polled: 0, responded: 0 });
        const entry = polledRespondedMap.get(customerId);
        const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
        const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) entry.polled++;
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) entry.responded++;
      });
    }

    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    // Only rows from "CSAT received Report" where ENGAGEMENT TYPE = "Co-Managed" (Grand Total = avg RATING by perspective for these rows)
    const rowsFiltered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      return id && coManagedCustomerIds.has(id) && engagementKeyFirst && isCoManagedRow(row, engagementKeyFirst) && matchesBusinessUnitFilter(row, businessUnitFilter);
    });

    const cmPerspectives = FULLY_MANAGED_CO_MANAGED_PERSPECTIVES;
    const groups = new Map();
    const globalSums = {};
    const globalCounts = {};
    rowsFiltered.forEach(row => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';
      const businessUnit = row[businessUnitCol] ?? 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!customerId) return;
      if (!groups.has(customerId)) {
        groups.set(customerId, {
          customerId,
          businessUnit,
          accountName: customerName,
          sums: {},
          counts: {}
        });
      }
      const g = groups.get(customerId);
      if (!g.sums[perspective]) { g.sums[perspective] = 0; g.counts[perspective] = 0; }
      if (perspective && !isNaN(rating)) {
        g.sums[perspective] += rating;
        g.counts[perspective]++;
        const canon = normalizePerspectiveForDisplay(perspective);
        if (canon && cmPerspectives.includes(canon)) {
          globalSums[canon] = (globalSums[canon] || 0) + rating;
          globalCounts[canon] = (globalCounts[canon] || 0) + 1;
        }
      }
    });

    if (secondSheetDataRaw.length > 0) {
      polledRespondedMap.forEach((pr, customerId) => {
        if (pr.polled > 0 && !groups.has(customerId)) {
          const firstRow = secondSheetDataRaw.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === customerId) || {};
          const accountName = (firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? firstRow['Account Name'] ?? customerId)?.toString().trim() || customerId;
          const bu = (firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A')?.toString().trim() || 'N/A';
          const g = { customerId, businessUnit: bu, accountName, sums: {}, counts: {} };
          cmPerspectives.forEach(p => { g.sums[p] = 0; g.counts[p] = 0; });
          groups.set(customerId, g);
        }
      });
    }

    let data = Array.from(groups.values())
      .filter(g => (polledRespondedMap.get(g.customerId) || {}).polled > 0)
      .map((g, idx) => {
        const pr = polledRespondedMap.get(g.customerId) || { polled: 0, responded: 0 };
        const row = { sNo: idx + 1, customerId: g.customerId, businessUnit: g.businessUnit, accountName: g.accountName, Polled: pr.polled, Responded: pr.responded };
        cmPerspectives.forEach(p => {
          const n = g.counts[p] || 0;
          const sum = g.sums[p] || 0;
          row[p] = pr.responded === 0 ? '-' : (n > 0 ? avgToFixed2(sum / n) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '') || (a.accountName || '').localeCompare(b.accountName || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));
    const totalPolled = data.reduce((s, r) => s + (Number(r.Polled) || 0), 0);
    const totalResponded = data.reduce((s, r) => s + (Number(r.Responded) || 0), 0);
    const grandTotal = {
      sNo: '',
      businessUnit: 'Grand Total',
      accountName: '',
      Polled: totalPolled,
      Responded: totalResponded
    };
    cmPerspectives.forEach(p => {
      grandTotal[p] = (globalCounts[p] > 0)
        ? avgToFixed2(globalSums[p] / globalCounts[p])
        : '-';
    });
    return { data, perspectives: cmPerspectives, grandTotal };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Staff Augmentation dashboard: from "CSAT received Report" (first sheet), ENGAGEMENT TYPE = "Staff Augmentation", group by CUSTOMER_ID/CUST_ID, avg RATING per perspective; Polled/Responded from second sheet with date >= CSAT cycle start (MM-DD-YYYY)
  const staffAugmentationAccountData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const engagementKeyFirst = getEngagementTypeKey(firstRow);
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;

    let staffAugmentationCustomerIds = new Set();
    if (engagementKeyFirst) {
      uploadedData.forEach(row => {
        if (isStaffAugmentationRow(row, engagementKeyFirst)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) staffAugmentationCustomerIds.add(id);
        }
      });
    }
    if (secondSheetEngagementKey) {
      secondSheetDataRaw.forEach(row => {
        if (isStaffAugmentationRow(row, secondSheetEngagementKey)) {
          const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          if (id) staffAugmentationCustomerIds.add(id);
        }
      });
    }
    if (staffAugmentationCustomerIds.size === 0) return { data: [], perspectives: [] };

    const polledRespondedMap = new Map();
    staffAugmentationCustomerIds.forEach(id => polledRespondedMap.set(id, { polled: 0, responded: 0 }));
    if (secondSheetDataRaw.length > 0 && secondSheetEngagementKey && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';
      secondSheetDataRaw.forEach(row => {
        if (!isStaffAugmentationRow(row, secondSheetEngagementKey)) return;
        if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return;
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!customerId) return;
        if (!polledRespondedMap.has(customerId)) polledRespondedMap.set(customerId, { polled: 0, responded: 0 });
        const entry = polledRespondedMap.get(customerId);
        const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
        const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';
        if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) entry.polled++;
        if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) entry.responded++;
      });
    }

    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    // Only rows from "CSAT received Report" where ENGAGEMENT TYPE = "Staff Augmentation" (Grand Total = avg RATING by perspective for these rows)
    const rowsFiltered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      const id = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      return id && staffAugmentationCustomerIds.has(id) && engagementKeyFirst && isStaffAugmentationRow(row, engagementKeyFirst) && matchesBusinessUnitFilter(row, businessUnitFilter);
    });

    const saPerspectives = STAFF_AUGMENTATION_PERSPECTIVES;
    const groups = new Map();
    const globalSums = {};
    const globalCounts = {};
    rowsFiltered.forEach(row => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
      const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';
      const businessUnit = row[businessUnitCol] ?? 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!customerId) return;
      if (!groups.has(customerId)) {
        groups.set(customerId, {
          customerId,
          businessUnit,
          accountName: customerName,
          sums: {},
          counts: {}
        });
      }
      const g = groups.get(customerId);
      if (!g.sums[perspective]) { g.sums[perspective] = 0; g.counts[perspective] = 0; }
      if (perspective && !isNaN(rating)) {
        g.sums[perspective] += rating;
        g.counts[perspective]++;
        const canon = normalizePerspectiveForDisplay(perspective);
        if (canon && saPerspectives.includes(canon)) {
          globalSums[canon] = (globalSums[canon] || 0) + rating;
          globalCounts[canon] = (globalCounts[canon] || 0) + 1;
        }
      }
    });

    if (secondSheetDataRaw.length > 0) {
      polledRespondedMap.forEach((pr, customerId) => {
        if (pr.polled > 0 && !groups.has(customerId)) {
          const firstRow = secondSheetDataRaw.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === customerId) || {};
          const accountName = (firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? firstRow['Account Name'] ?? customerId)?.toString().trim() || customerId;
          const bu = (firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A')?.toString().trim() || 'N/A';
          const g = { customerId, businessUnit: bu, accountName, sums: {}, counts: {} };
          saPerspectives.forEach(p => { g.sums[p] = 0; g.counts[p] = 0; });
          groups.set(customerId, g);
        }
      });
    }

    let data = Array.from(groups.values())
      .filter(g => (polledRespondedMap.get(g.customerId) || {}).polled > 0)
      .map((g, idx) => {
        const pr = polledRespondedMap.get(g.customerId) || { polled: 0, responded: 0 };
        const row = { sNo: idx + 1, customerId: g.customerId, businessUnit: g.businessUnit, accountName: g.accountName, Polled: pr.polled, Responded: pr.responded };
        saPerspectives.forEach(p => {
          const n = g.counts[p] || 0;
          const sum = g.sums[p] || 0;
          row[p] = pr.responded === 0 ? '-' : (n > 0 ? avgToFixed2(sum / n) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '') || (a.accountName || '').localeCompare(b.accountName || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));
    const totalPolled = data.reduce((s, r) => s + (Number(r.Polled) || 0), 0);
    const totalResponded = data.reduce((s, r) => s + (Number(r.Responded) || 0), 0);
    const grandTotal = {
      sNo: '',
      businessUnit: 'Grand Total',
      accountName: '',
      Polled: totalPolled,
      Responded: totalResponded
    };
    saPerspectives.forEach(p => {
      grandTotal[p] = (globalCounts[p] > 0)
        ? avgToFixed2(globalSums[p] / globalCounts[p])
        : '-';
    });
    return { data, perspectives: saPerspectives, grandTotal };
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Premier Healthcare Solutions Inc (L80) – Portfolio-wise Average CSAT Scores: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Columns: Sr.No., BUSINESS UNIT, PORTFOLIO, Polled, Responded, perspective columns (avg RATING). Polled/Responded from sheet 2 "CSAT sent and received Report", date >= csatCycleStartDateFormatted (MM-DD-YYYY), group by PORTFOLIO.
  const premierHealthcarePortfolioData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitCol = Object.keys(firstRow).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';

    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    const filtered = uploadedData.filter(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return false;
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted) {
        const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSS_RECEIVED_DATE'] || row['csat_received_date'];
        const csatSentDate = row['CSAT SENT DATE'] || row['CSS_SENT_DATE'] || row['csat_sent_date'];
        if (csatReceivedDate) {
          const receivedFormatted = typeof csatReceivedDate === 'number' ? parseExcelDateToMMDDYYYY(csatReceivedDate) : formatDateToMMDDYYYY(csatReceivedDate);
          if (receivedFormatted && !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return false;
        }
        if (csatSentDate) {
          const sentFormatted = typeof csatSentDate === 'number' ? parseExcelDateToMMDDYYYY(csatSentDate) : formatDateToMMDDYYYY(csatSentDate);
          if (sentFormatted && !isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) return { data: [], perspectives: [] };

    const groups = new Map();
    const allPerspectives = new Set();
    filtered.forEach(row => {
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitCol] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? 'N/A').toString().trim() || 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!portfolio) return;
      if (!groups.has(portfolio)) {
        groups.set(portfolio, { portfolio, businessUnit, sums: {}, counts: {}, polled: 0, responded: 0 });
      }
      const g = groups.get(portfolio);
      if (g.businessUnit === 'N/A' && businessUnit !== 'N/A') g.businessUnit = businessUnit;
      const normPerspective = perspective ? normalizePerspectiveForDisplay(perspective) : null;
      if (normPerspective && !isNaN(rating)) {
        allPerspectives.add(normPerspective);
        g.sums[normPerspective] = (g.sums[normPerspective] || 0) + rating;
        g.counts[normPerspective] = (g.counts[normPerspective] || 0) + 1;
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report": count(CSAT SENT DATE) and count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted (MM-DD-YYYY), group by PORTFOLIO, filter by CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)"
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const premierHealthcareCustomerId = filtered.length > 0 ? (filtered[0]['CUST_ID'] ?? filtered[0]['CUSTOMER_ID']) : null;
    if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondCustomerNameKey = Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const secondPortfolioKey = Object.keys(secondFirst).find(k => /^portfolio$/i.test(String(k).trim()));
      const secondBusinessUnitKey = Object.keys(secondFirst).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(secondFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';

      if (secondPortfolioKey) {
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const portfolio = (row[secondPortfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
          const rowBusinessUnit = (row[secondBusinessUnitKey] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? '').toString().trim() || 'N/A';
          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, sums: {}, counts: {}, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).polled++;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, sums: {}, counts: {}, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).responded++;
          }
        });
      } else {
        let totalPolled = 0;
        let totalResponded = 0;
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) totalPolled++;
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) totalResponded++;
        });
        groups.forEach(g => {
          g.polled = totalPolled;
          g.responded = totalResponded;
        });
      }
    }

    // Fallback: for portfolios with businessUnit 'N/A', use BUSINESS UNIT from first sheet (Premier Healthcare rows) - same customer so BU applies
    let fallbackBUValue = 'N/A';
    const fallbackBU = filtered.find(r => {
      const bu = (r[businessUnitCol] ?? r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'] ?? r['Business Unit'] ?? r['business_unit'] ?? '').toString().trim();
      return bu && bu !== 'N/A';
    });
    if (fallbackBU) {
      fallbackBUValue = (fallbackBU[businessUnitCol] ?? fallbackBU['BUSINESS UNIT'] ?? fallbackBU['BUSSINESS UNIT'] ?? fallbackBU['Business Unit'] ?? fallbackBU['business_unit'] ?? '').toString().trim() || 'N/A';
    }
    // If first sheet has no BU, try second sheet (CSAT sent and received Report) for Premier Healthcare rows
    if (fallbackBUValue === 'N/A' && secondSheetDataRaw.length > 0) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondBUKey = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k).trim()));
      const sh2Row = secondSheetDataRaw.find(r => {
        const cn = (r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? r[Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) ?? ''] ?? '').toString().trim();
        return cn === PREMIER_HEALTHCARE_NAME;
      });
      if (sh2Row && secondBUKey) {
        const bu = (sh2Row[secondBUKey] ?? sh2Row['BUSINESS UNIT'] ?? sh2Row['BUSSINESS UNIT'] ?? sh2Row['Business Unit'] ?? '').toString().trim();
        if (bu && bu !== 'N/A') fallbackBUValue = bu;
      }
    }
    if (fallbackBUValue !== 'N/A') {
      groups.forEach((g) => {
        if (!g.businessUnit || g.businessUnit === 'N/A') g.businessUnit = fallbackBUValue;
      });
    }

    const perspectives = sortPerspectivesByDisplayOrder(Array.from(allPerspectives));
    const data = Array.from(groups.values())
      .map((g, idx) => {
        const row = { sNo: idx + 1, businessUnit: g.businessUnit, portfolio: g.portfolio || 'N/A', Polled: g.polled ?? 0, Responded: g.responded ?? 0 };
        perspectives.forEach(p => {
          const n = g.counts[p] || 0;
          const sum = g.sums[p] || 0;
          row[p] = n > 0 ? avgToFixed2(sum / n) : '-';
        });
        return row;
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Grand Total: sum/average across ALL portfolios for CUSTOMER NAME="Premier Healthcare Solutions Inc (L80)"
    const allGroups = Array.from(groups.values());
    let grandTotal = null;
    if (allGroups.length > 0) {
      const totalPolled = allGroups.reduce((s, g) => s + (g.polled ?? 0), 0);
      const totalResponded = allGroups.reduce((s, g) => s + (g.responded ?? 0), 0);
      const globalSums = {};
      const globalCounts = {};
      perspectives.forEach(p => { globalSums[p] = 0; globalCounts[p] = 0; });
      allGroups.forEach(g => {
        perspectives.forEach(p => {
          const n = g.counts[p] || 0;
          const sum = g.sums[p] || 0;
          if (n > 0) {
            globalSums[p] += sum;
            globalCounts[p] += n;
          }
        });
      });
      grandTotal = {
        sNo: '',
        businessUnit: 'Grand Total',
        portfolio: '',
        Polled: totalPolled,
        Responded: totalResponded
      };
      perspectives.forEach(p => {
        grandTotal[p] = globalCounts[p] > 0 ? avgToFixed2(globalSums[p] / globalCounts[p]) : '-';
      });
    }

    // Count row below Grand Total: number of data inputs per perspective (sum of counts across all portfolios)
    let countRow = null;
    if (allGroups.length > 0 && perspectives.length > 0) {
      const totalCountByPerspective = {};
      perspectives.forEach(p => { totalCountByPerspective[p] = 0; });
      allGroups.forEach(g => {
        perspectives.forEach(p => {
          totalCountByPerspective[p] += g.counts[p] || 0;
        });
      });
      countRow = {
        sNo: '',
        businessUnit: '',
        portfolio: '',
        Polled: '',
        Responded: 'Number of CSATs considered==>',
        isCountRow: true
      };
      perspectives.forEach(p => {
        countRow[p] = totalCountByPerspective[p] ?? 0;
      });
    }

    return { data, perspectives, grandTotal, countRow };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Premier Healthcare Solutions Inc (L80) – Portfolio-wise % Satisfied Customers: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO.
  // % = (count of RATING 4 or 5 for that perspective in that portfolio) / (count of data input for that perspective in that portfolio) × 100. Do NOT use #Responded. Grand Total = sum of count 4,5 / sum of data input per perspective.
  // Polled/Responded from sheet 2 "CSAT sent and received Report", date >= csatCycleStartDateFormatted (MM-DD-YYYY), group by PORTFOLIO.
  const premierHealthcarePortfolioSatisfiedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [] };
    const firstRow = uploadedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitCol = Object.keys(firstRow).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';

    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    const filtered = uploadedData.filter(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return false;
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted) {
        const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSS_RECEIVED_DATE'] || row['csat_received_date'];
        const csatSentDate = row['CSAT SENT DATE'] || row['CSS_SENT_DATE'] || row['csat_sent_date'];
        if (csatReceivedDate) {
          const receivedFormatted = typeof csatReceivedDate === 'number' ? parseExcelDateToMMDDYYYY(csatReceivedDate) : formatDateToMMDDYYYY(csatReceivedDate);
          if (receivedFormatted && !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return false;
        }
        if (csatSentDate) {
          const sentFormatted = typeof csatSentDate === 'number' ? parseExcelDateToMMDDYYYY(csatSentDate) : formatDateToMMDDYYYY(csatSentDate);
          if (sentFormatted && !isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) return false;
        }
      }
      return true;
    });

    // Group by portfolio: count satisfied (rating 4 or 5) and total per perspective
    const groups = new Map();
    const allPerspectives = new Set();
    filtered.forEach(row => {
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitCol] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? 'N/A').toString().trim() || 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!portfolio) return;
      if (!groups.has(portfolio)) {
        groups.set(portfolio, { portfolio, businessUnit, satisfied: {}, totals: {}, polled: 0, responded: 0 });
      }
      const g = groups.get(portfolio);
      if (g.businessUnit === 'N/A' && businessUnit !== 'N/A') g.businessUnit = businessUnit;
      const normPerspective = perspective ? normalizePerspectiveForDisplay(perspective) : null;
      if (normPerspective && !isNaN(rating)) {
        allPerspectives.add(normPerspective);
        g.totals[normPerspective] = (g.totals[normPerspective] || 0) + 1;
        if (rating === 4 || rating === 5) {
          g.satisfied[normPerspective] = (g.satisfied[normPerspective] || 0) + 1;
        }
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report": count(CSAT SENT DATE) and count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted (MM-DD-YYYY), group by PORTFOLIO
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const premierHealthcareCustomerId = filtered.length > 0 ? (filtered[0]['CUST_ID'] ?? filtered[0]['CUSTOMER_ID']) : null;
    if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondCustomerNameKey = Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const secondPortfolioKey = Object.keys(secondFirst).find(k => /^portfolio$/i.test(String(k).trim()));
      const secondBusinessUnitKey = Object.keys(secondFirst).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(secondFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';

      if (secondPortfolioKey) {
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const portfolio = (row[secondPortfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
          const rowBusinessUnit = (row[secondBusinessUnitKey] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? '').toString().trim() || 'N/A';
          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, satisfied: {}, totals: {}, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).polled++;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, satisfied: {}, totals: {}, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).responded++;
          }
        });
      } else {
        let totalPolled = 0;
        let totalResponded = 0;
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) totalPolled++;
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) totalResponded++;
        });
        groups.forEach(g => {
          g.polled = totalPolled;
          g.responded = totalResponded;
        });
      }
    }

    // Fallback: for portfolios with businessUnit 'N/A', use BUSINESS UNIT from first sheet
    let fallbackBUValue = 'N/A';
    const fallbackBU = filtered.find(r => {
      const bu = (r[businessUnitCol] ?? r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'] ?? r['Business Unit'] ?? r['business_unit'] ?? '').toString().trim();
      return bu && bu !== 'N/A';
    });
    if (fallbackBU) {
      fallbackBUValue = (fallbackBU[businessUnitCol] ?? fallbackBU['BUSINESS UNIT'] ?? fallbackBU['BUSSINESS UNIT'] ?? fallbackBU['Business Unit'] ?? fallbackBU['business_unit'] ?? '').toString().trim() || 'N/A';
    }
    if (fallbackBUValue === 'N/A' && secondSheetDataRaw.length > 0) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondBUKey = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k).trim()));
      const sh2Row = secondSheetDataRaw.find(r => {
        const cn = (r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? r[Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) ?? ''] ?? '').toString().trim();
        return cn === PREMIER_HEALTHCARE_NAME;
      });
      if (sh2Row && secondBUKey) {
        const bu = (sh2Row[secondBUKey] ?? sh2Row['BUSINESS UNIT'] ?? sh2Row['BUSSINESS UNIT'] ?? sh2Row['Business Unit'] ?? '').toString().trim();
        if (bu && bu !== 'N/A') fallbackBUValue = bu;
      }
    }
    if (fallbackBUValue !== 'N/A') {
      groups.forEach((g) => {
        if (!g.businessUnit || g.businessUnit === 'N/A') g.businessUnit = fallbackBUValue;
      });
    }

    const perspectives = sortPerspectivesByDisplayOrder(Array.from(allPerspectives));
    // Include all rows even if Responded = 0 (display hyphen for perspective columns)
    // % = (count of RATING 4 or 5 for that perspective in this portfolio, group by PORTFOLIO) / (count of data input for that perspective in this portfolio from "CSAT received Report") * 100. Do NOT use #Responded.
    const data = Array.from(groups.values())
      .map((g, idx) => {
        const polled = g.polled || 0;
        const responded = g.responded || 0;
        const row = { sNo: idx + 1, businessUnit: g.businessUnit, portfolio: g.portfolio || 'N/A', Polled: polled, Responded: responded };
        perspectives.forEach(p => {
          const satisfied = g.satisfied[p] || 0;
          const dataInputForPerspective = g.totals[p] || 0;
          row[p] = dataInputForPerspective > 0 ? ((satisfied / dataInputForPerspective) * 100).toFixed(0) : '-';
        });
        return row;
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Grand Total: (total satisfied per perspective across all portfolios / total data input per perspective across all portfolios) * 100
    const allGroups = Array.from(groups.values());
    let grandTotal = null;
    if (allGroups.length > 0) {
      const totalPolled = allGroups.reduce((s, g) => s + (g.polled ?? 0), 0);
      const totalResponded = allGroups.reduce((s, g) => s + (g.responded ?? 0), 0);
      const globalSatisfied = {};
      const globalTotalByPerspective = {};
      perspectives.forEach(p => { globalSatisfied[p] = 0; globalTotalByPerspective[p] = 0; });
      allGroups.forEach(g => {
        perspectives.forEach(p => {
          globalSatisfied[p] += g.satisfied[p] || 0;
          globalTotalByPerspective[p] += g.totals[p] || 0;
        });
      });
      grandTotal = {
        sNo: '',
        businessUnit: 'Grand Total',
        portfolio: '',
        Polled: totalPolled,
        Responded: totalResponded
      };
      perspectives.forEach(p => {
        const totalDataInput = globalTotalByPerspective[p] || 0;
        grandTotal[p] = totalDataInput > 0 ? ((globalSatisfied[p] / totalDataInput) * 100).toFixed(0) : '-';
      });
    }

    // Count row below Grand Total: number of data inputs per perspective (sum of totals across all portfolios)
    let countRow = null;
    if (allGroups.length > 0 && perspectives.length > 0) {
      const totalCountByPerspective = {};
      perspectives.forEach(p => { totalCountByPerspective[p] = 0; });
      allGroups.forEach(g => {
        perspectives.forEach(p => {
          totalCountByPerspective[p] += g.totals[p] || 0;
        });
      });
      countRow = {
        sNo: '',
        businessUnit: '',
        portfolio: '',
        Polled: '',
        Responded: 'Number of CSATs considered==>',
        isCountRow: true
      };
      perspectives.forEach(p => {
        countRow[p] = totalCountByPerspective[p] ?? 0;
      });
    }

    return { data, perspectives, grandTotal, countRow };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Premier Healthcare Solutions Inc (L80) – Portfolio-wise Overall CSAT Score Distribution: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", PERSPECTIVE = "Overall Experience", group by PORTFOLIO.
  // Columns: Sr.No., Business Unit, Portfolio, Polled, Responded, Highly Dissatisfied (RATING=1), Dissatisfied (RATING=2), Neutral (RATING=3), Satisfied (RATING=4), Highly Satisfied (RATING=5).
  // Values = count(RATING=X) / Responded * 100
  const premierHealthcarePortfolioDistributionData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [] };
    const firstRow = uploadedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitCol = Object.keys(firstRow).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';

    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    // Filter: CUSTOMER NAME = Premier Healthcare, PERSPECTIVE = "Overall Experience", date filtering
    const filtered = uploadedData.filter(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return false;
      const perspective = (row[perspectiveColumn] ?? '').toString().trim().toLowerCase();
      if (perspective !== 'overall experience') return false;
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted) {
        const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSS_RECEIVED_DATE'] || row['csat_received_date'];
        const csatSentDate = row['CSAT SENT DATE'] || row['CSS_SENT_DATE'] || row['csat_sent_date'];
        if (csatReceivedDate) {
          const receivedFormatted = typeof csatReceivedDate === 'number' ? parseExcelDateToMMDDYYYY(csatReceivedDate) : formatDateToMMDDYYYY(csatReceivedDate);
          if (receivedFormatted && !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return false;
        }
        if (csatSentDate) {
          const sentFormatted = typeof csatSentDate === 'number' ? parseExcelDateToMMDDYYYY(csatSentDate) : formatDateToMMDDYYYY(csatSentDate);
          if (sentFormatted && !isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) return false;
        }
      }
      return true;
    });

    // Group by portfolio: count each RATING (1-5)
    const groups = new Map();
    filtered.forEach(row => {
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitCol] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? 'N/A').toString().trim() || 'N/A';
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!portfolio) return;
      if (!groups.has(portfolio)) {
        groups.set(portfolio, { portfolio, businessUnit, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, polled: 0, responded: 0 });
      }
      const g = groups.get(portfolio);
      if (g.businessUnit === 'N/A' && businessUnit !== 'N/A') g.businessUnit = businessUnit;
      if (!isNaN(rating) && rating >= 1 && rating <= 5) {
        g.ratingCounts[Math.round(rating)] = (g.ratingCounts[Math.round(rating)] || 0) + 1;
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report"
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const premierHealthcareCustomerId = filtered.length > 0 ? (filtered[0]['CUST_ID'] ?? filtered[0]['CUSTOMER_ID']) : null;
    if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondCustomerNameKey = Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const secondPortfolioKey = Object.keys(secondFirst).find(k => /^portfolio$/i.test(String(k).trim()));
      const secondBusinessUnitKey = Object.keys(secondFirst).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || (Object.prototype.hasOwnProperty.call(secondFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT');
      const sentDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat sent date' || lower.includes('csat_sent_date') || lower.includes('css_sent_date');
      }) || 'CSAT SENT DATE';
      const receivedDateKey = Object.keys(secondFirst).find(k => {
        const lower = (k || '').toLowerCase();
        return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
      }) || 'CSAT RECEIVED DATE';

      if (secondPortfolioKey) {
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const portfolio = (row[secondPortfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
          const rowBusinessUnit = (row[secondBusinessUnitKey] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? row['business_unit'] ?? '').toString().trim() || 'N/A';
          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).polled++;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            if (!groups.has(portfolio)) {
              groups.set(portfolio, { portfolio, businessUnit: rowBusinessUnit, ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, polled: 0, responded: 0 });
            } else if (groups.get(portfolio).businessUnit === 'N/A' && rowBusinessUnit !== 'N/A') {
              groups.get(portfolio).businessUnit = rowBusinessUnit;
            }
            groups.get(portfolio).responded++;
          }
        });
      } else {
        let totalPolled = 0;
        let totalResponded = 0;
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          const sentFormatted = sentVal ? (typeof sentVal === 'number' ? parseExcelDateToMMDDYYYY(sentVal) : formatDateToMMDDYYYY(sentVal)) : '';
          const receivedFormatted = receivedVal ? (typeof receivedVal === 'number' ? parseExcelDateToMMDDYYYY(receivedVal) : formatDateToMMDDYYYY(receivedVal)) : '';

          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) totalPolled++;
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) totalResponded++;
        });
        groups.forEach(g => {
          g.polled = totalPolled;
          g.responded = totalResponded;
        });
      }
    }

    // Fallback BU
    let fallbackBUValue = 'N/A';
    const fallbackBU = filtered.find(r => {
      const bu = (r[businessUnitCol] ?? r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'] ?? r['Business Unit'] ?? r['business_unit'] ?? '').toString().trim();
      return bu && bu !== 'N/A';
    });
    if (fallbackBU) {
      fallbackBUValue = (fallbackBU[businessUnitCol] ?? fallbackBU['BUSINESS UNIT'] ?? fallbackBU['BUSSINESS UNIT'] ?? fallbackBU['Business Unit'] ?? fallbackBU['business_unit'] ?? '').toString().trim() || 'N/A';
    }
    if (fallbackBUValue === 'N/A' && secondSheetDataRaw.length > 0) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondBUKey = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k).trim()));
      const sh2Row = secondSheetDataRaw.find(r => {
        const cn = (r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? r[Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) ?? ''] ?? '').toString().trim();
        return cn === PREMIER_HEALTHCARE_NAME;
      });
      if (sh2Row && secondBUKey) {
        const bu = (sh2Row[secondBUKey] ?? sh2Row['BUSINESS UNIT'] ?? sh2Row['BUSSINESS UNIT'] ?? sh2Row['Business Unit'] ?? '').toString().trim();
        if (bu && bu !== 'N/A') fallbackBUValue = bu;
      }
    }
    if (fallbackBUValue !== 'N/A') {
      groups.forEach((g) => {
        if (!g.businessUnit || g.businessUnit === 'N/A') g.businessUnit = fallbackBUValue;
      });
    }

    const data = Array.from(groups.values())
      .map((g, idx) => {
        const polled = g.polled || 0;
        const responded = g.responded || 0;
        const row = {
          sNo: idx + 1,
          businessUnit: g.businessUnit,
          portfolio: g.portfolio || 'N/A',
          Polled: polled,
          Responded: responded,
          highlyDissatisfied: responded > 0 ? ((g.ratingCounts[1] / responded) * 100).toFixed(1) : '-',
          dissatisfied: responded > 0 ? ((g.ratingCounts[2] / responded) * 100).toFixed(1) : '-',
          neutral: responded > 0 ? ((g.ratingCounts[3] / responded) * 100).toFixed(1) : '-',
          satisfied: responded > 0 ? ((g.ratingCounts[4] / responded) * 100).toFixed(1) : '-',
          highlySatisfied: responded > 0 ? ((g.ratingCounts[5] / responded) * 100).toFixed(1) : '-',
          ratingCounts: g.ratingCounts
        };
        return row;
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Grand Total
    const allGroups = Array.from(groups.values());
    let grandTotal = null;
    if (allGroups.length > 0) {
      const totalPolled = allGroups.reduce((s, g) => s + (g.polled ?? 0), 0);
      const totalResponded = allGroups.reduce((s, g) => s + (g.responded ?? 0), 0);
      const globalRatingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allGroups.forEach(g => {
        for (let r = 1; r <= 5; r++) {
          globalRatingCounts[r] += g.ratingCounts[r] || 0;
        }
      });
      grandTotal = {
        sNo: '',
        businessUnit: 'Grand Total',
        portfolio: '',
        Polled: totalPolled,
        Responded: totalResponded,
        highlyDissatisfied: totalResponded > 0 ? ((globalRatingCounts[1] / totalResponded) * 100).toFixed(1) : '-',
        dissatisfied: totalResponded > 0 ? ((globalRatingCounts[2] / totalResponded) * 100).toFixed(1) : '-',
        neutral: totalResponded > 0 ? ((globalRatingCounts[3] / totalResponded) * 100).toFixed(1) : '-',
        satisfied: totalResponded > 0 ? ((globalRatingCounts[4] / totalResponded) * 100).toFixed(1) : '-',
        highlySatisfied: totalResponded > 0 ? ((globalRatingCounts[5] / totalResponded) * 100).toFixed(1) : '-'
      };
    }

    return { data, grandTotal };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Premier Healthcare (L80) – Portfolio-wise Response Rate from TREND file (Upload data for trend analysis): Sheet2 "CSAT sent and received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Columns: Sr.No., BUSINESS UNIT, Portfolio, #Polled, #Responded, Response Rate %, Average CSAT Score. Date filter: CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY).
  const premierHealthcareTrendPortfolioData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return { data: [], grandTotal: null, trendFileName: '' };
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && file.sheets) {
      sentReceivedSheetName = Object.keys(file.sheets).find(s => {
        const sheetLower = String(s).toLowerCase().trim();
        return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2';
      });
    }
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return { data: [], grandTotal: null, trendFileName: file.saveName || '' };

    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { data: [], grandTotal: null, trendFileName: file.saveName || '' };

    const firstRow = sheetData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitKey = Object.keys(firstRow).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || 'BUSINESS UNIT';
    const sentDateKey = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';
    const actualScoreKey = Object.keys(firstRow).find(k => /actual\s*score/i.test(String(k).trim())) || 'ACTUAL SCORE';

    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    const groups = new Map(); // portfolio -> { businessUnit, polled, responded, scoreSum, scoreCount }

    sheetData.forEach(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return;

      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitKey] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
      const sentVal = row[sentDateKey] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      const sentFormatted = sentVal ? parseExcelDateToMMDDYYYY(sentVal) : '';
      const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';

      if (!groups.has(portfolio)) groups.set(portfolio, { portfolio, businessUnit, polled: 0, responded: 0, scoreSum: 0, scoreCount: 0 });
      const g = groups.get(portfolio);
      if (g.businessUnit === 'N/A' && businessUnit !== 'N/A') g.businessUnit = businessUnit;

      if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) g.polled += 1;
      if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
        g.responded += 1;
        const scoreVal = row[actualScoreKey] ?? row['ACTUAL SCORE'] ?? row['Actual Score'];
        const scoreNum = typeof scoreVal === 'number' ? scoreVal : parseFloat(String(scoreVal ?? '').trim());
        if (!Number.isNaN(scoreNum)) {
          g.scoreSum += scoreNum;
          g.scoreCount += 1;
        }
      }
    });

    const data = Array.from(groups.values())
      .map((g, idx) => {
        const polled = g.polled ?? 0;
        const responded = g.responded ?? 0;
        const rate = polled > 0 ? (responded / polled) * 100 : null;
        const avgScore = g.scoreCount > 0 ? (g.scoreSum / g.scoreCount) : null;
        return {
          sNo: idx + 1,
          businessUnit: g.businessUnit,
          portfolio: g.portfolio,
          Polled: polled,
          Responded: responded,
          rate,
          avgScore
        };
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));

    let grandTotal = null;
    if (data.length > 0) {
      const totalPolled = data.reduce((s, r) => s + (r.Polled || 0), 0);
      const totalResponded = data.reduce((s, r) => s + (r.Responded || 0), 0);
      const totalScoreSum = Array.from(groups.values()).reduce((s, g) => s + (g.scoreSum || 0), 0);
      const totalScoreCount = Array.from(groups.values()).reduce((s, g) => s + (g.scoreCount || 0), 0);
      grandTotal = {
        sNo: '',
        businessUnit: 'Grand Total',
        portfolio: '',
        Polled: totalPolled,
        Responded: totalResponded,
        rate: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : null,
        avgScore: totalScoreCount > 0 ? totalScoreSum / totalScoreCount : null
      };
    }
    return { data, grandTotal, trendFileName: file.saveName || 'Trend file' };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend portfolio data with perspective-wise avg rating from trend file "CSAT received Report": CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Each row has #Polled, #Responded from Sheet2 and perspective columns = avg(RATING) from Sheet1.
  const premierHealthcareTrendPortfolioWithPerspectives = useMemo(() => {
    const base = premierHealthcareTrendPortfolioData;
    if (!trendAnalysisFiles?.length || !base.data.length) return { data: [], grandTotal: null, perspectives: [], trendFileName: base.trendFileName || '' };
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) return { data: base.data.map(r => ({ ...r, perspectiveAvgs: {} })), grandTotal: base.grandTotal, perspectives: [], trendFileName: base.trendFileName };
    let receivedData = file.sheets[receivedSheetName];
    if (!receivedData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) receivedData = file.sheets[exactKey];
    }
    if (!receivedData || !Array.isArray(receivedData) || receivedData.length === 0) return { data: base.data.map(r => ({ ...r, perspectiveAvgs: {} })), grandTotal: base.grandTotal, perspectives: [], trendFileName: base.trendFileName };
    const firstRow = receivedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    const byPortfolio = new Map(); // portfolio -> { perspectiveNorm -> { sum, count } }
    const grandSums = {};
    const grandCounts = {};
    receivedData.forEach(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return;
      const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
      if (qc === 'Qualitative Feedback') return;
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const perspective = (row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').toString().trim();
      const rating = parseFloat(row[ratingCol] ?? row['RATING'] ?? '');
      if (!perspective || Number.isNaN(rating)) return;
      const norm = normalizePerspectiveForDisplay(perspective);
      if (!byPortfolio.has(portfolio)) byPortfolio.set(portfolio, {});
      const pers = byPortfolio.get(portfolio);
      if (!pers[norm]) pers[norm] = { sum: 0, count: 0 };
      pers[norm].sum += rating;
      pers[norm].count += 1;
      grandSums[norm] = (grandSums[norm] || 0) + rating;
      grandCounts[norm] = (grandCounts[norm] || 0) + 1;
    });
    // Include all standard perspectives so "Resource Competency" and others always have a key for trend diff
    const fromFile = new Set([...Object.keys(grandSums), ...Object.keys(grandCounts)]);
    const allPerspectives = sortPerspectivesByDisplayOrder([...new Set([...PERSPECTIVE_DISPLAY_ORDER, ...fromFile])]);
    const data = base.data.map(row => {
      const portfolio = row.portfolio || 'N/A';
      const pers = byPortfolio.get(portfolio) || {};
      const perspectiveAvgs = {};
      allPerspectives.forEach(p => {
        if (pers[p] && pers[p].count > 0) perspectiveAvgs[p] = Math.round((pers[p].sum / pers[p].count) * 100) / 100;
        else perspectiveAvgs[p] = null;
      });
      return { ...row, perspectiveAvgs };
    });
    let grandTotal = null;
    if (base.grandTotal) {
      const gtPerspectiveAvgs = {};
      allPerspectives.forEach(p => {
        const sum = grandSums[p];
        const count = grandCounts[p];
        if (sum != null && count != null && count > 0) gtPerspectiveAvgs[p] = Math.round((sum / count) * 100) / 100;
        else gtPerspectiveAvgs[p] = null;
      });
      grandTotal = { ...base.grandTotal, perspectiveAvgs: gtPerspectiveAvgs };
    }
    return { data, grandTotal, perspectives: allPerspectives, trendFileName: base.trendFileName };
  }, [trendAnalysisFiles, premierHealthcareTrendPortfolioData]);

  // Trend of Satisfied Customer – Portfolio-wise % Satisfied (by Perspective): Sheet1 "CSAT received Report" for perspective %. Value = (count RATING 4 or 5 per perspective / count of data input for that perspective) × 100, group by PORTFOLIO, CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)". Grand Total = sum(satisfied per perspective) / sum(data input per perspective). Do NOT use #Responded for perspective %. Sheet2 "CSAT sent and received Report" for Polled and Responded only.
  const premierHealthcareTrendPortfolioSatisfiedPct = useMemo(() => {
    if (!trendAnalysisFiles?.length) return { data: [], perspectives: [], grandTotal: null, trendFileName: '' };
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';

    // Sheet 2 "CSAT sent and received Report": Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE), group by Portfolio, date >= csatCycleStartDateFormatted
    let polledByPortfolio = {};
    let respondedByPortfolio = {};
    let businessUnitByPortfolio = {};
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && file.sheets) sentReceivedSheetName = Object.keys(file.sheets).find(s => String(s).toLowerCase().includes('sent and received') || String(s).toLowerCase() === 'sheet2');
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (sentReceivedSheetName && file.sheets) {
      let sheet2Data = file.sheets[sentReceivedSheetName];
      if (!sheet2Data) {
        const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
        if (exactKey) sheet2Data = file.sheets[exactKey];
      }
      if (sheet2Data && Array.isArray(sheet2Data) && sheet2Data.length > 0) {
        const s2First = sheet2Data[0] || {};
        const customerNameKeyS2 = Object.keys(s2First).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
        const portfolioKeyS2 = Object.keys(s2First).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
        const businessUnitKeyS2 = Object.keys(s2First).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || 'BUSINESS UNIT';
        const sentDateKeyS2 = Object.keys(s2First).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
        const receivedDateKeyS2 = Object.keys(s2First).find(k => /csat received date|css_received_date|received date/i.test(String(k)));
        sheet2Data.forEach(row => {
          const custName = (row[customerNameKeyS2] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          if (custName !== PREMIER_HEALTHCARE_NAME) return;
          const portfolio = (row[portfolioKeyS2] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
          const businessUnit = (row[businessUnitKeyS2] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
          if (!polledByPortfolio[portfolio]) { polledByPortfolio[portfolio] = 0; respondedByPortfolio[portfolio] = 0; businessUnitByPortfolio[portfolio] = businessUnit || 'N/A'; }
          if (businessUnit !== 'N/A') businessUnitByPortfolio[portfolio] = businessUnit;
          const sentVal = row[sentDateKeyS2] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A') {
            const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
            if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) polledByPortfolio[portfolio]++;
          }
          const receivedVal = row[receivedDateKeyS2] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A') {
            const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
            if (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted))) respondedByPortfolio[portfolio]++;
          }
        });
      }
    }

    // Sheet 1 "CSAT received Report": perspective % (count RATING 4 or 5 per perspective / responded for that perspective in sheet1)
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) {
      const allPortfolios = new Set([...Object.keys(polledByPortfolio), ...Object.keys(respondedByPortfolio)]);
      const data = Array.from(allPortfolios).map((portfolio, idx) => ({
        sNo: idx + 1,
        businessUnit: businessUnitByPortfolio[portfolio] || 'N/A',
        portfolio,
        Polled: polledByPortfolio[portfolio] || 0,
        Responded: respondedByPortfolio[portfolio] || 0,
        perspectivePct: {}
      })).sort(sortByPortfolioOrder).map((row, idx) => ({ ...row, sNo: idx + 1 }));
      const grandTotal = data.length > 0 ? { sNo: '', businessUnit: 'Grand Total', portfolio: '', Polled: data.reduce((s, r) => s + (r.Polled || 0), 0), Responded: data.reduce((s, r) => s + (r.Responded || 0), 0), perspectivePct: {} } : null;
      return { data, perspectives: [], grandTotal, trendFileName: file.saveName || 'Trend file' };
    }
    let receivedData = file.sheets[receivedSheetName];
    if (!receivedData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) receivedData = file.sheets[exactKey];
    }
    if (!receivedData || !Array.isArray(receivedData) || receivedData.length === 0) {
      const allPortfolios = new Set([...Object.keys(polledByPortfolio), ...Object.keys(respondedByPortfolio)]);
      const data = Array.from(allPortfolios).map((portfolio, idx) => ({
        sNo: idx + 1,
        businessUnit: businessUnitByPortfolio[portfolio] || 'N/A',
        portfolio,
        Polled: polledByPortfolio[portfolio] || 0,
        Responded: respondedByPortfolio[portfolio] || 0,
        perspectivePct: {}
      })).sort(sortByPortfolioOrder).map((row, idx) => ({ ...row, sNo: idx + 1 }));
      const grandTotal = data.length > 0 ? { sNo: '', businessUnit: 'Grand Total', portfolio: '', Polled: data.reduce((s, r) => s + (r.Polled || 0), 0), Responded: data.reduce((s, r) => s + (r.Responded || 0), 0), perspectivePct: {} } : null;
      return { data, perspectives: [], grandTotal, trendFileName: file.saveName || 'Trend file' };
    }
    const firstRow = receivedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitKey = Object.keys(firstRow).find(k => /^business\s*unit$|^bussiness\s*unit$/i.test(String(k).trim())) || 'BUSINESS UNIT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const ratingCol = Object.keys(firstRow).find(k => k === 'RATING' || String(k).toLowerCase() === 'rating') || 'RATING';
    const byPortfolio = new Map();
    const grandRespondedByPerspective = {};
    const grandSatisfiedByPerspective = {};
    receivedData.forEach(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return;
      const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
      if (qc === 'Qualitative Feedback') return;
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitKey] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim() || 'N/A';
      if (!businessUnitByPortfolio[portfolio] || businessUnitByPortfolio[portfolio] === 'N/A') businessUnitByPortfolio[portfolio] = businessUnit || 'N/A';
      const perspective = (row[perspectiveCol] ?? row['PERSPECTIVE'] ?? '').toString().trim();
      const rating = parseFloat(row[ratingCol] ?? row['RATING'] ?? '');
      if (!perspective || Number.isNaN(rating)) return;
      const norm = normalizePerspectiveForDisplay(perspective);
      if (!byPortfolio.has(portfolio)) byPortfolio.set(portfolio, { portfolio, businessUnit: businessUnitByPortfolio[portfolio] || businessUnit, respondedByPerspective: {}, satisfiedByPerspective: {} });
      const g = byPortfolio.get(portfolio);
      if (g.businessUnit === 'N/A' && businessUnit !== 'N/A') g.businessUnit = businessUnit;
      g.respondedByPerspective[norm] = (g.respondedByPerspective[norm] || 0) + 1;
      grandRespondedByPerspective[norm] = (grandRespondedByPerspective[norm] || 0) + 1;
      if (rating === 4 || rating === 5) {
        g.satisfiedByPerspective[norm] = (g.satisfiedByPerspective[norm] || 0) + 1;
        grandSatisfiedByPerspective[norm] = (grandSatisfiedByPerspective[norm] || 0) + 1;
      }
    });
    // Include all standard perspectives so "Resource Competency" and others always have a key for trend diff lookup
    const fromFile = new Set([...Object.keys(grandRespondedByPerspective), ...Object.keys(grandSatisfiedByPerspective)]);
    const mergedSet = new Set([...PERSPECTIVE_DISPLAY_ORDER, ...fromFile]);
    const allPerspectives = sortPerspectivesByDisplayOrder([...mergedSet]);
    const allPortfoliosSet = new Set([...Object.keys(polledByPortfolio), ...Object.keys(respondedByPortfolio), ...byPortfolio.keys()]);
    const data = Array.from(allPortfoliosSet)
      .map(portfolio => {
        const g = byPortfolio.get(portfolio);
        const perspectivePct = {};
        allPerspectives.forEach(p => {
          let responded = g?.respondedByPerspective?.[p] || 0;
          let satisfied = g?.satisfiedByPerspective?.[p] || 0;
          // Fallback: trend file may have stored under variant key (e.g. "Resource Competency (%)"); match by normalized key
          if (responded === 0 && g?.respondedByPerspective && typeof g.respondedByPerspective === 'object') {
            const keys = Object.keys(g.respondedByPerspective);
            for (let i = 0; i < keys.length; i++) {
              const k = keys[i];
              if (normalizePerspectiveForDisplay(k) === p) {
                responded = g.respondedByPerspective[k] || 0;
                satisfied = (g.satisfiedByPerspective && g.satisfiedByPerspective[k]) || 0;
                break;
              }
            }
          }
          perspectivePct[p] = responded > 0 ? Math.round((satisfied / responded) * 100) : null;
        });
        const respondedSheet2 = respondedByPortfolio[portfolio] || 0;
        return {
          sNo: 0,
          businessUnit: businessUnitByPortfolio[portfolio] || (g?.businessUnit) || 'N/A',
          portfolio,
          Polled: polledByPortfolio[portfolio] || 0,
          Responded: respondedSheet2,
          perspectivePct
        };
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));
    let grandTotal = null;
    const hasGrand = data.length > 0;
    if (hasGrand) {
      const totalPolled = data.reduce((s, r) => s + (r.Polled || 0), 0);
      const totalResponded = data.reduce((s, r) => s + (r.Responded || 0), 0);
      const gtPct = {};
      // Grand Total per perspective: (count RATING 4 or 5 for that perspective / count of data input for that perspective) × 100. Do NOT use #Responded (Sheet 2).
      allPerspectives.forEach(p => {
        const dataInputCount = grandRespondedByPerspective[p] || 0;
        const satisfied = grandSatisfiedByPerspective[p] || 0;
        gtPct[p] = dataInputCount > 0 ? Math.round((satisfied / dataInputCount) * 100) : null;
      });
      grandTotal = { sNo: '', businessUnit: 'Grand Total', portfolio: '', Polled: totalPolled, Responded: totalResponded, perspectivePct: gtPct };
    }
    return { data, perspectives: allPerspectives, grandTotal, trendFileName: file.saveName || 'Trend file' };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  const buWiseData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return [];

    // Co-Managed filter for BU-wise: use only rows where ENGAGEMENT TYPE = "Co-Managed" when engagementTypeFilter is set
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondSheetEngagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;
    const secondSheetDataToUse = engagementTypeFilter === 'Co-Managed' && secondSheetEngagementKey
      ? secondSheetDataRaw.filter(row => isCoManagedRow(row, secondSheetEngagementKey))
      : secondSheetDataRaw;

    console.log('=== PROCESSING BU-WISE AVERAGE CSAT SCORES DATA ===');
    console.log('Input data length:', uploadedData.length);
    console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);

    // Create a map to track which customer ratings should be included based on CSAT SENT DATE / CSAT RECEIVED DATE
    const validCustomerRatings = new Set();
    
    // If we have second sheet data and CSAT cycle start date, filter by dates
    if (secondSheetDataToUse.length > 0 && csatCycleStartDateFormatted) {
      console.log('=== CSAT SENT DATE / CSAT RECEIVED DATE FILTERING FOR BU-WISE DATA ===');
      console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);
      console.log('Second sheet data length:', secondSheetDataToUse.length);
      console.log('Filtering rule: Only include ratings from customers where CSAT SENT DATE AND CSAT RECEIVED DATE >= CSAT cycle start date');
      
      let totalRowsProcessed = 0;
      let validRowsCount = 0;
      
      secondSheetDataToUse.forEach(row => {
        const custId = row['CUST_ID'] || row['CUSTOMER_ID'];
        if (!custId) return;
        
        totalRowsProcessed++;
        
        // Check if CSAT SENT DATE and CSAT RECEIVED DATE are >= CSAT cycle start date (consider CSAT SENT DATE / CSAT RECEIVED DATE columns first)
        let hasValidSentDate = false;
        let hasValidReceivedDate = false;
        const sentDateVal = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedDateVal = row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        if (sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A') {
          const sentDateFormatted = formatDateToMMDDYYYY(sentDateVal);
          if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
            hasValidSentDate = true;
          }
        }
        if (receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A') {
          const receivedDateFormatted = formatDateToMMDDYYYY(receivedDateVal);
          if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) {
            hasValidReceivedDate = true;
          }
        }
        
        // Include this customer if both dates are valid (AND condition)
        if (hasValidSentDate && hasValidReceivedDate) {
          validCustomerRatings.add(custId.toString());
          validRowsCount++;
        }
      });
      
      console.log(`CSAT SENT DATE / CSAT RECEIVED DATE filtering results for BU-wise:`);
      console.log(`- Total rows processed: ${totalRowsProcessed}`);
      console.log(`- Valid rows (both dates >= CSAT start): ${validRowsCount}`);
      console.log(`- Unique valid customer IDs: ${validCustomerRatings.size}`);
      console.log('Sample valid customer IDs:', Array.from(validCustomerRatings).slice(0, 10));
    } else {
      console.log('CSAT SENT DATE / CSAT RECEIVED DATE filtering for BU-wise: Not applied (missing second sheet data or CSAT cycle start date)');
    }

    // Filter out Qualitative Feedback rows
    const filteredData = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      return questionCategory !== 'Qualitative Feedback';
    });

    const perspectiveColumn = 'PERSPECTIVE' || 'Perspective' || 'perspective';
    const perspectives = sortPerspectivesByDisplayOrder(
      [...new Set(filteredData.map(row => row[perspectiveColumn]).filter(Boolean))].filter(perspective => 
        perspective !== 'Qualitative Feedback'
      )
    );
    
    console.log('BU-wise processing - Detected perspectives:', perspectives);
    console.log('BU-wise processing - Sample raw data:', filteredData.slice(0, 2));

    const buGroups = new Map();
    
    // # Accounts Polled = count(CUSTOMER_ID or CUST_ID) from 2nd sheet "CSAT sent and received Report", grouped by BUSINESS UNIT (Sead/SEAD normalized to SEAD)
    const buAccountsPolledFromSecondSheet = {};
    if (secondSheetDataToUse.length > 0) {
      secondSheetDataToUse.forEach(row => {
        const rawBU = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || 'N/A';
        if (!rawBU || rawBU === 'N/A') return;
        const businessUnit = normalizeBUForGrouping(rawBU);
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId !== '') {
          if (!buAccountsPolledFromSecondSheet[businessUnit]) buAccountsPolledFromSecondSheet[businessUnit] = new Set();
          buAccountsPolledFromSecondSheet[businessUnit].add(custId);
        }
      });
    }

    // Number of Customer Stakeholders Polled = count unique RESPONDENT NAME from 2nd sheet, grouped by BUSINESS UNIT.
    // Use CSAT SENT DATE filter when csatCycleStartDateFormatted is present (same as #Polled logic).
    const buStakeholdersPolledFromSecondSheet = {};
    if (secondSheetDataToUse.length > 0) {
      const shFirst = secondSheetDataToUse[0] || {};
      const respondentNameKey =
        Object.keys(shFirst).find(k => {
          const lk = String(k || '').toLowerCase().replace(/[\s_]+/g, '');
          return lk.includes('respondent') && lk.includes('name');
        }) || 'RESPONDENT NAME';

      secondSheetDataToUse.forEach(row => {
        const rawBU = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || 'N/A';
        if (!rawBU || rawBU === 'N/A') return;
        const businessUnit = normalizeBUForGrouping(rawBU);
        const respondentRaw = row[respondentNameKey] ?? row['RESPONDENT NAME'] ?? row['Respondent Name'] ?? row['RESPONDENT_NAME'] ?? row['respondent name'];
        const respondentName = respondentRaw != null ? String(respondentRaw).trim() : '';
        if (!respondentName || respondentName === 'N/A') return;

        const sentDateVal = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        if (!sentDateVal || sentDateVal === '' || sentDateVal === 'N/A') return;
        if (csatCycleStartDateFormatted) {
          const sentDateFormatted = formatDateToMMDDYYYY(sentDateVal);
          if (!sentDateFormatted || !isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) return;
        }
        if (!buStakeholdersPolledFromSecondSheet[businessUnit]) buStakeholdersPolledFromSecondSheet[businessUnit] = new Set();
        buStakeholdersPolledFromSecondSheet[businessUnit].add(respondentName);
      });
    }

    // Fully Managed, Co-Managed, Staff Augmentation: count(CUSTOMER_ID or CUST_ID) from 2nd sheet "CSAT sent and received Report", group by BUSINESS UNIT where ENGAGEMENT TYPE = respective value
    const buFullyManagedCount = {};
    const buCoManagedCount = {};
    const buStaffAugmentationCount = {};
    const engagementKey = secondSheetDataRaw.length > 0 ? getEngagementTypeKey(secondSheetDataRaw[0]) : null;
    if (secondSheetDataRaw.length > 0 && engagementKey) {
      secondSheetDataRaw.forEach(row => {
        const rawBU = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || 'N/A';
        if (!rawBU || rawBU === 'N/A') return;
        const businessUnit = normalizeBUForGrouping(rawBU);
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (!custId || custId === '') return;
        if (isFullyManagedRow(row, engagementKey)) {
          if (!buFullyManagedCount[businessUnit]) buFullyManagedCount[businessUnit] = new Set();
          buFullyManagedCount[businessUnit].add(custId);
        }
        if (isCoManagedRow(row, engagementKey)) {
          if (!buCoManagedCount[businessUnit]) buCoManagedCount[businessUnit] = new Set();
          buCoManagedCount[businessUnit].add(custId);
        }
        if (isStaffAugmentationRow(row, engagementKey)) {
          if (!buStaffAugmentationCount[businessUnit]) buStaffAugmentationCount[businessUnit] = new Set();
          buStaffAugmentationCount[businessUnit].add(custId);
        }
      });
    }

    // First, calculate survey counts from second sheet (consider CSAT SENT DATE / CSAT RECEIVED DATE columns), grouped by Business Unit
    if (secondSheetDataToUse.length > 0) {
      console.log('=== CALCULATING SURVEY COUNTS BY BUSINESS UNIT ===');
      console.log('Second sheet data length:', secondSheetDataToUse.length);
      console.log('CSAT cycle start date for filtering:', csatCycleStartDateFormatted);
      
      secondSheetDataToUse.forEach(row => {
        const rawBU = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || 'N/A';
        if (!rawBU || rawBU === 'N/A') return;
        const businessUnit = normalizeBUForGrouping(rawBU);
        const sentDateVal = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const receivedDateVal = row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        
        // Apply date filtering for sent dates (CSAT SENT DATE)
        if (sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A') {
          if (csatCycleStartDateFormatted) {
            const sentDateFormatted = formatDateToMMDDYYYY(sentDateVal);
            if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) {
              if (!buGroups.has(businessUnit)) {
                buGroups.set(businessUnit, {
                  businessUnit,
                  customerCount: 0,
                  cssSentCount: 0,
                  cssReceivedCount: 0,
                  perspectives: {},
                  uniqueCustomers: new Set()
                });
              }
              buGroups.get(businessUnit).cssSentCount++;
            }
          } else {
            if (!buGroups.has(businessUnit)) {
              buGroups.set(businessUnit, {
                businessUnit,
                customerCount: 0,
                cssSentCount: 0,
                cssReceivedCount: 0,
                perspectives: {},
                uniqueCustomers: new Set()
              });
            }
            buGroups.get(businessUnit).cssSentCount++;
          }
        }
        
        // Apply date filtering for received dates (CSAT RECEIVED DATE)
        if (receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A') {
          if (csatCycleStartDateFormatted) {
            const receivedDateFormatted = formatDateToMMDDYYYY(receivedDateVal);
            if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) {
              if (!buGroups.has(businessUnit)) {
                buGroups.set(businessUnit, {
                  businessUnit,
                  customerCount: 0,
                  cssSentCount: 0,
                  cssReceivedCount: 0,
                  perspectives: {},
                  uniqueCustomers: new Set()
                });
              }
              buGroups.get(businessUnit).cssReceivedCount++;
            }
          } else {
            if (!buGroups.has(businessUnit)) {
              buGroups.set(businessUnit, {
                businessUnit,
                customerCount: 0,
                cssSentCount: 0,
                cssReceivedCount: 0,
                perspectives: {},
                uniqueCustomers: new Set()
              });
            }
            buGroups.get(businessUnit).cssReceivedCount++;
          }
        }
      });
      
      console.log('CSS Survey Counts by Business Unit:');
      buGroups.forEach((group, bu) => {
        console.log(`  ${bu}: Sent=${group.cssSentCount}, Received=${group.cssReceivedCount}`);
      });
    }
    
    // Then, process rating data from first sheet "CSAT received Report", using each row's own
    // CSAT SENT DATE and CSAT RECEIVED DATE for date filtering (>= csatCycleStartDateFormatted).
    // Perspective columns = avg(RATING) grouped by BUSINESS UNIT.
    filteredData.forEach(row => {
      const rawBU = row['BUSINESS UNIT'] || row['BUSSINESS UNIT'] || 'N/A';
      const businessUnit = normalizeBUForGrouping(rawBU);
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']) || 0;
      const customerId = row['CUSTOMER_ID'] || row['CUST_ID'];
      
      if (!businessUnit || !perspective || isNaN(rating)) return;

      // Date filter: use each row's own CSAT SENT DATE and CSAT RECEIVED DATE from the first sheet
      if (csatCycleStartDateFormatted) {
        const sentDateVal = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'] ?? row['CSAT_SENT_DATE'];
        const receivedDateVal = row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT_RECEIVED_DATE'];
        if (sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A') {
          const sentDateFormatted = formatDateToMMDDYYYY(sentDateVal);
          if (!sentDateFormatted || !isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) return;
        }
        if (receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A') {
          const receivedDateFormatted = formatDateToMMDDYYYY(receivedDateVal);
          if (!receivedDateFormatted || !isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) return;
        }
      }
      
      if (!buGroups.has(businessUnit)) {
        buGroups.set(businessUnit, {
          businessUnit,
          customerCount: 0,
          cssSentCount: 0,
          cssReceivedCount: 0,
          perspectives: {},
          uniqueCustomers: new Set()
        });
      }

      const group = buGroups.get(businessUnit);
      
      // Count unique customers for this business unit
      if (customerId) {
        group.uniqueCustomers.add(customerId);
      }

      // Collect ratings for each perspective
      const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
      if (!group.perspectives[normalizedPerspective]) {
        group.perspectives[normalizedPerspective] = [];
      }
      group.perspectives[normalizedPerspective].push(rating);
    });

    const result = Array.from(buGroups.values()).map((group, index) => {
      const row = {
        sNo: index + 1,
        businessUnit: group.businessUnit,
        customerCount: buAccountsPolledFromSecondSheet[group.businessUnit]?.size ?? 0,
        stakeholdersPolledCount: buStakeholdersPolledFromSecondSheet[group.businessUnit]?.size ?? 0,
        cssSentCount: group.cssSentCount,
        cssReceivedCount: group.cssReceivedCount,
        fullyManaged: buFullyManagedCount[group.businessUnit]?.size ?? 0,
        coManaged: buCoManagedCount[group.businessUnit]?.size ?? 0,
        staffAugmentation: buStaffAugmentationCount[group.businessUnit]?.size ?? 0
      };

      // Calculate average rating for each perspective (same logic for ALL BUs including SEAD)
      // avg RATING from CSAT received Report, group by CUSTOMER_ID/CUST_ID
        perspectives.forEach(perspective => {
          const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
          const ratings = group.perspectives[normalizedPerspective] || [];
        // Filter out zero ratings
        const nonZeroRatings = ratings.filter(r => r > 0);
        if (nonZeroRatings.length > 0) {
          const average = avgToFixed2(nonZeroRatings.reduce((sum, r) => sum + r, 0) / nonZeroRatings.length);
          row[normalizedPerspective] = average;
        } else {
          row[normalizedPerspective] = '-';
        }
          
          // Debug logging for first few business units
          if (index < 2) {
          console.log(`BU: ${group.businessUnit}, Perspective: ${perspective}, Ratings: [${ratings.join(', ')}], Average: ${row[normalizedPerspective]}`);
          }
        });

      return row;
    });

    // Include all BUs with data (same logic for ALL BUs including SEAD)
    const filteredResult = result.filter(row => row.cssSentCount > 0 || row.cssReceivedCount > 0);

    console.log(`=== BU-WISE AVERAGE CSAT SCORES DATA PROCESSING COMPLETE ===`);
    console.log(`Total business units processed: ${filteredResult.length}`);
    console.log(`CSAT date filtering applied: ${validCustomerRatings.size > 0 ? 'Yes' : 'No'}`);
    if (validCustomerRatings.size > 0) {
      console.log(`Valid customer IDs for filtering: ${validCustomerRatings.size}`);
    }
    console.log('BU-wise data with correct perspective averages:', filteredResult.slice(0, 3));
    
    // Sort business units in the specified order: Health Care/Health care, CIT, Tech, India & UK, Sead
    const sortedResult = filteredResult.sort((a, b) => {
      const indexA = getBusinessUnitOrderIndex(a.businessUnit);
      const indexB = getBusinessUnitOrderIndex(b.businessUnit);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    
    // Calculate Org Level grand totals
    const orgLevelRatings = {};
    let orgLevelTotalPolled = 0;
    let orgLevelTotalResponded = 0;
    let orgLevelAccountsPolled = 0;
    let orgLevelStakeholdersPolled = 0;
    let orgLevelFullyManaged = 0;
    let orgLevelCoManaged = 0;
    let orgLevelStaffAugmentation = 0;

    buGroups.forEach(group => {
      if (group.cssSentCount > 0) { // Only include BUs with data
        orgLevelTotalPolled += group.cssSentCount;
        orgLevelTotalResponded += group.cssReceivedCount;
        orgLevelAccountsPolled += buAccountsPolledFromSecondSheet[group.businessUnit]?.size ?? 0;
        orgLevelStakeholdersPolled += buStakeholdersPolledFromSecondSheet[group.businessUnit]?.size ?? 0;
        orgLevelFullyManaged += buFullyManagedCount[group.businessUnit]?.size ?? 0;
        orgLevelCoManaged += buCoManagedCount[group.businessUnit]?.size ?? 0;
        orgLevelStaffAugmentation += buStaffAugmentationCount[group.businessUnit]?.size ?? 0;
        perspectives.forEach(perspective => {
          const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
          if (!orgLevelRatings[normalizedPerspective]) orgLevelRatings[normalizedPerspective] = [];
          orgLevelRatings[normalizedPerspective].push(...(group.perspectives[normalizedPerspective] || []));
        });
      }
    });

    const orgLevelRow = {
      sNo: '',
      businessUnit: 'Org Level',
      customerCount: orgLevelAccountsPolled,
      stakeholdersPolledCount: orgLevelStakeholdersPolled,
      cssSentCount: orgLevelTotalPolled,
      cssReceivedCount: orgLevelTotalResponded,
      fullyManaged: orgLevelFullyManaged,
      coManaged: orgLevelCoManaged,
      staffAugmentation: orgLevelStaffAugmentation,
      isOrgLevel: true
    };
    
    if (orgLevelTotalResponded === 0) {
      perspectives.forEach(p => { orgLevelRow[p] = '-'; });
    } else {
      perspectives.forEach(perspective => {
        const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
        const ratings = orgLevelRatings[normalizedPerspective] || [];
        const average = ratings.length > 0 
          ? avgToFixed2(ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
          : '0.00';
        orgLevelRow[normalizedPerspective] = average;
      });
    }
    
    // Count row: number of data inputs (ratings) per perspective column across all BUs. Label "Number of CSATs considered==>" in #Responded column.
    const countRow = {
      sNo: '',
      businessUnit: '',
      customerCount: '',
      stakeholdersPolledCount: '',
      cssSentCount: '',
      cssReceivedCount: 'Number of CSATs considered==>',
      fullyManaged: '',
      coManaged: '',
      staffAugmentation: '',
      isCountRow: true
    };
    perspectives.forEach(perspective => {
      const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
      const ratings = orgLevelRatings[normalizedPerspective] || [];
      countRow[normalizedPerspective] = ratings.filter(r => r > 0).length;
    });

    // Add Org Level row and Count row at the end
    return [...sortedResult, orgLevelRow, countRow];
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Trend Analysis Data Processing: from uploaded trend files "Upload data for trend analysis"
  // Sheet "CSAT sent and received Report", group by BUSINESS UNIT. Polled=count(CSAT SENT DATE), Responded=count(CSAT RECEIVED DATE) - NO date filter for trend dashboards
  // Also read "CSAT received Report" sheet to get perspective avg ratings grouped by BUSINESS UNIT
  const trendAnalysisData = useMemo(() => {
    if (!trendAnalysisFiles?.length) return [];
    
    return trendAnalysisFiles.map(file => {
      console.log('=== TREND FILE PROCESSING DEBUG ===');
      console.log('File:', file.saveName);
      console.log('Available sheet names:', file.sheetNames);
      console.log('Available sheets keys:', file.sheets ? Object.keys(file.sheets) : 'No sheets');
      
      // Find "CSAT sent and received Report" sheet for Polled/Responded counts (Sheet2)
      let sentReceivedSheetName = file.sheetNames?.find(s => {
        const sheetLower = String(s).toLowerCase().trim();
        return sheetLower.includes('csat sent and received') || 
               sheetLower.includes('sent and received') ||
               sheetLower === 'sheet2' ||
               sheetLower === 'sheet 2';
      });
      
      // Find "CSAT received Report" sheet for perspective ratings (Sheet1)
      const receivedSheetName = file.sheetNames?.find(s => {
        const sheetLower = String(s).toLowerCase().trim();
        return (sheetLower.includes('csat received') && !sheetLower.includes('sent and received')) || 
               sheetLower === 'sheet1' ||
               sheetLower === 'sheet 1';
      });
      
      console.log('Detected sentReceivedSheetName:', sentReceivedSheetName);
      console.log('Detected receivedSheetName:', receivedSheetName);
      
      // Also try to find sheet by iterating over file.sheets keys if sheetNames didn't work
      if (!sentReceivedSheetName && file.sheets) {
        const sheetKeys = Object.keys(file.sheets);
        sentReceivedSheetName = sheetKeys.find(s => {
          const sheetLower = String(s).toLowerCase().trim();
          return sheetLower.includes('csat sent and received') || 
                 sheetLower.includes('sent and received') ||
                 sheetLower === 'sheet2';
        });
        console.log('Found sent sheet from file.sheets keys:', sentReceivedSheetName);
      }
      // Fallback: use 2nd sheet by index (Sheet2) - many workbooks have Sheet1=received, Sheet2=sent and received
      if (!sentReceivedSheetName && file.sheetNames?.length >= 2) {
        sentReceivedSheetName = file.sheetNames[1];
        console.log('Using 2nd sheet as sent sheet (fallback):', sentReceivedSheetName);
      }
      
      // For Top 10: find sheet that HAS CSAT SENT DATE + CSAT RECEIVED DATE + TYPE OF ACCOUNT (most robust)
      // Sheet2 "CSAT sent and received Report" should have all three columns
      let sentSheetForTop10 = null;
      const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
      for (const sn of sheetNamesToCheck) {
        const sd = file.sheets?.[sn];
        if (!sd || !Array.isArray(sd) || sd.length === 0) continue;
        const fr = sd[0] || {};
        const keys = Object.keys(fr);
        // Check for CSAT SENT DATE column (multiple patterns)
        const hasSent = keys.some(k => {
          const kLower = (k || '').toLowerCase();
          return kLower === 'csat sent date' || kLower.includes('csat sent') || 
                 kLower.includes('sent date') || kLower.includes('css_sent_date');
        });
        // Check for CSAT RECEIVED DATE column
        const hasReceived = keys.some(k => {
          const kLower = (k || '').toLowerCase();
          return kLower === 'csat received date' || kLower.includes('csat received') || 
                 kLower.includes('received date') || kLower.includes('css_received_date');
        });
        // Check for TYPE OF ACCOUNT column
        const hasTypeOfAccount = keys.some(k => {
          const kLower = (k || '').toLowerCase();
          return kLower === 'type of account' || kLower.includes('type of account') || 
                 kLower.includes('account type');
        });
        console.log(`Sheet "${sn}" - hasSent: ${hasSent}, hasReceived: ${hasReceived}, hasTypeOfAccount: ${hasTypeOfAccount}`);
        if (hasSent && hasReceived && hasTypeOfAccount) {
          sentSheetForTop10 = sn;
          console.log('Top 10: Found sheet with all required columns:', sn);
          break;
        }
      }
      // Fallback: use sheet named "CSAT sent and received Report" or 2nd sheet
      if (!sentSheetForTop10) {
        sentSheetForTop10 = sheetNamesToCheck.find(sn => 
          sn.toLowerCase().includes('sent and received')
        ) || (file.sheetNames?.length >= 2 ? file.sheetNames[1] : sentReceivedSheetName);
        console.log('Top 10: Using fallback sheet:', sentSheetForTop10);
      }
      if (!sentReceivedSheetName && receivedSheetName) {
        sentReceivedSheetName = receivedSheetName;
        console.log('Trend Analysis: Using "CSAT received Report" for BU-wise Polled/Responded (fallback)');
      }
      
      if (!sentReceivedSheetName) {
        console.log('ERROR: No valid sheet found for trend analysis');
        return { saveName: file.saveName, rows: [], hasData: false, perspectives: [], top10Rows: [], hasTop10Data: false };
      }
      
      // Try to get sheet data - handle potential whitespace in sheet names
      let sheetData = file.sheets?.[sentReceivedSheetName];
      if (!sheetData) {
        // Try finding the sheet with exact match including spaces
        const exactSheetName = Object.keys(file.sheets || {}).find(k => 
          k.toLowerCase().trim() === sentReceivedSheetName.toLowerCase().trim()
        );
        if (exactSheetName) {
          sheetData = file.sheets[exactSheetName];
          console.log('Found sheet with exact match:', exactSheetName);
        }
      }
      
      if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
        console.log('ERROR: Sheet data is empty or invalid');
        return { saveName: file.saveName, rows: [], hasData: false, perspectives: [] };
      }
      
      console.log('Sheet data loaded, rows:', sheetData.length);

      const firstRow = sheetData[0] || {};
      const buCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit' ||
        (k || '').toLowerCase() === 'business unit' ||
        (k || '').toLowerCase() === 'bussiness unit'
      ) || 'BUSINESS UNIT';
      const sentCol = Object.keys(firstRow).find(k => {
        const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') ||
               (kNorm.includes('sent') && kNorm.includes('date')) || kNorm.includes('datesent');
      }) || 'CSAT SENT DATE';
      const receivedCol = Object.keys(firstRow).find(k => {
        const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') ||
               (kNorm.includes('received') && kNorm.includes('date')) || kNorm.includes('datereceived');
      }) || 'CSAT RECEIVED DATE';

      // Group by BUSINESS UNIT, count CSAT SENT DATE and CSAT RECEIVED DATE
      const buGroups = {};
      sheetData.forEach(row => {
        const bu = row[buCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
        if (!bu || bu === 'N/A') return;

        const sentDateRaw = row[sentCol];
        const receivedDateRaw = row[receivedCol];
        const sentDateFormatted = parseExcelDateToMMDDYYYY(sentDateRaw);
        const receivedDateFormatted = parseExcelDateToMMDDYYYY(receivedDateRaw);

        if (!buGroups[bu]) {
          buGroups[bu] = { businessUnit: bu, polled: 0, responded: 0 };
        }

        // Trend dashboards: count ALL Polled/Responded (no date filter per requirement)
        if (sentDateFormatted) buGroups[bu].polled++;
        if (receivedDateFormatted) buGroups[bu].responded++;
      });

      // Process "CSAT received Report" sheet for perspective avg RATING grouped by BUSINESS UNIT (value = avg RATING per perspective)
      let perspectivesByBU = {};
      let allPerspectives = new Set();
      // Org-level: sum and count per perspective across entire sheet (for Org Level row = avg RATING per perspective)
      const orgPerspectiveSums = {};
      const orgPerspectiveCounts = {};
      
      if (receivedSheetName && file.sheets?.[receivedSheetName]) {
        const receivedData = file.sheets[receivedSheetName];
        if (Array.isArray(receivedData) && receivedData.length > 0) {
          const recFirstRow = receivedData[0] || {};
          const recBuCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit' ||
            (k || '').toLowerCase() === 'business unit' ||
            (k || '').toLowerCase() === 'bussiness unit'
          ) || 'BUSINESS UNIT';
          const perspectiveCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'perspective' ||
            (k || '').toLowerCase().includes('perspective')
          ) || 'PERSPECTIVE';
          const ratingCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'rating' ||
            (k || '').toLowerCase().includes('rating')
          ) || 'RATING';
          
          // Group by BU and perspective: sum and count of RATING (value = avg RATING for each perspective)
          receivedData.forEach(row => {
            const bu = row[recBuCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
            const perspective = row[perspectiveCol] || row['Perspective'] || '';
            const rating = parseFloat(row[ratingCol] || row['Rating'] || row['rating']);
            
            if (!perspective || isNaN(rating)) return;
            
            // Skip qualitative feedback
            const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
            if (questionCategory === 'Qualitative Feedback') return;
            
            allPerspectives.add(perspective);
            
            if (bu && bu !== 'N/A') {
              if (!perspectivesByBU[bu]) perspectivesByBU[bu] = {};
              if (!perspectivesByBU[bu][perspective]) perspectivesByBU[bu][perspective] = { sum: 0, count: 0 };
              perspectivesByBU[bu][perspective].sum += rating;
              perspectivesByBU[bu][perspective].count++;
            }
            // Org-level: include all rows for avg RATING per perspective
            if (!orgPerspectiveSums[perspective]) { orgPerspectiveSums[perspective] = 0; orgPerspectiveCounts[perspective] = 0; }
            orgPerspectiveSums[perspective] += rating;
            orgPerspectiveCounts[perspective]++;
          });
        }
      }
      
      // Define perspective order for display
      const perspectiveOrder = [
        'Overall Experience',
        'Timeline Adherence',
        'Quality of Delivery',
        'Quality of deliverables',
        'Timely Resource Fulfillment',
        'Risk Management & Responsiveness',
        'Thought Leadership',
        'Resource Competency'
      ];
      
      // Sort perspectives according to predefined order
      const sortedPerspectives = [...allPerspectives].sort((a, b) => {
        const idxA = perspectiveOrder.findIndex(p => p.toLowerCase() === a.toLowerCase());
        const idxB = perspectiveOrder.findIndex(p => p.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });

      // Convert to array and sort, adding perspective data: value = avg RATING for each perspective (from CSAT received Report, group by BU)
      const rows = Object.values(buGroups)
        .filter(g => g.polled > 0 || g.responded > 0)
        .map(g => {
          const buPerspectives = perspectivesByBU[g.businessUnit] || {};
          const rowData = { ...g };
          sortedPerspectives.forEach(p => {
            if (buPerspectives[p] && buPerspectives[p].count > 0) {
              const avg = buPerspectives[p].sum / buPerspectives[p].count;
              rowData[p] = Math.round(avg * 100) / 100;
            } else {
              rowData[p] = '-';
            }
          });
          return rowData;
        })
        .sort((a, b) => {
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return (a.businessUnit || '').localeCompare(b.businessUnit || '');
        });

      // Calculate Org Level totals
      let orgPolled = 0;
      let orgResponded = 0;
      rows.forEach(r => {
        orgPolled += r.polled;
        orgResponded += r.responded;
      });
      
      // Org Level perspective: avg RATING for each perspective from entire "CSAT received Report" sheet
      const orgPerspectives = {};
      sortedPerspectives.forEach(p => {
        const count = orgPerspectiveCounts[p] || 0;
        const sum = orgPerspectiveSums[p] || 0;
        if (count > 0 && sum != null) {
          const avg = sum / count;
          orgPerspectives[p] = Math.round(avg * 100) / 100;
        } else {
          orgPerspectives[p] = '-';
        }
      });

      const orgLevelRow = {
        businessUnit: 'Org Level',
        polled: orgPolled,
        responded: orgResponded,
        isOrgLevel: true,
        ...orgPerspectives
      };

      // ===== TOP 10 ACCOUNTS DATA =====
      // Filter by TYPE OF ACCOUNT = "Top 10" from "CSAT sent and received Report" sheet
      // Show individual accounts (CUSTOMER NAME as Account Name) - no grouping
      const allColumnKeys = Object.keys(firstRow);
      const typeOfAccountCol = allColumnKeys.find(k => {
        const kLower = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kLower === 'typeofaccount' || 
               kLower === 'accounttype' ||
               (k || '').toLowerCase() === 'type of account' ||
               (k || '').toLowerCase() === 'account type' ||
               ((k || '').toLowerCase().includes('type') && (k || '').toLowerCase().includes('account'));
      }) || 'TYPE OF ACCOUNT';
      
      const customerNameCol = allColumnKeys.find(k => {
        const kLower = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kLower === 'customername' || 
               (k || '').toLowerCase() === 'customer name' ||
               (k || '').toLowerCase() === 'customer_name' ||
               ((k || '').toLowerCase().includes('customer') && (k || '').toLowerCase().includes('name'));
      }) || 'CUSTOMER NAME';
      
      // Debug: Log available columns and sample data
      console.log('=== TOP 10 TREND ANALYSIS DEBUG ===');
      console.log('Sheet data length:', sheetData.length);
      console.log('Available columns:', allColumnKeys);
      console.log('Detected TYPE OF ACCOUNT column:', typeOfAccountCol);
      console.log('Detected CUSTOMER NAME column:', customerNameCol);
      console.log('Detected BUSINESS UNIT column:', buCol);
      console.log('Detected CSAT SENT DATE column:', sentCol);
      console.log('Detected CSAT RECEIVED DATE column:', receivedCol);
      
      // Helper function to check if value is "Top 10" (flexible matching for Excel variations)
      const isTop10Value = (val) => {
        if (val == null || val === '') return false;
        const str = String(val).toLowerCase().trim().replace(/\s+/g, ' ');
        return str === 'top 10' || str === 'top10' || str === 'top-10' ||
               str === 'y' || str === 'yes' ||
               str.includes('top 10') || str.includes('top10') ||
               str.startsWith('top 10') || str.startsWith('top10') ||
               /^top\s*10(\s|$)/i.test(str);
      };
      
      // ========== TOP 10 POLLED/RESPONDED CALCULATION ==========
      // EXACT SAME LOGIC AS AccountBUWiseResponseRateDashboard.js (without date filter for Trend Analysis)
      // From Sheet2 "CSAT sent and received Report": Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE)
      // Filter by TYPE OF ACCOUNT = "Top 10"
      
      const top10AccountRows = {};
      
      // Get Sheet2 data - use the same approach as AccountBUWiseResponseRateDashboard
      const sheet2Name = file.sheetNames?.find(s =>
        String(s).toLowerCase().includes('csat sent and received') ||
        String(s).toLowerCase() === 'sheet2'
      ) || (file.sheetNames?.[1] || file.sheetNames?.[0]);
      
      const sheet2Data = sheet2Name ? (file.sheets?.[sheet2Name] || []) : [];
      
      console.log('=== TOP 10 POLLED/RESPONDED (SIMPLIFIED) ===');
      console.log('Sheet2 name:', sheet2Name);
      console.log('Sheet2 data length:', sheet2Data.length);
      
      if (sheet2Data.length > 0) {
        const firstRow = sheet2Data[0] || {};
        const allKeys = Object.keys(firstRow);
        console.log('Sheet2 columns:', allKeys);
        
        // Column detection using regex (same as AccountBUWiseResponseRateDashboard)
        const sentDateCol = allKeys.find(k => /csat\s*sent\s*date|css_sent_date/i.test(String(k))) || 'CSAT SENT DATE';
        const receivedDateCol = allKeys.find(k => /csat\s*received\s*date|css_received_date/i.test(String(k))) || 'CSAT RECEIVED DATE';
        const customerNameCol = allKeys.find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUST_NM';
        const buColName = allKeys.find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
        const typeOfAccountColName = allKeys.find(k => /type\s*of\s*account/i.test(String(k))) || 'TYPE OF ACCOUNT';
        
        console.log('Detected columns:', { sentDateCol, receivedDateCol, customerNameCol, buColName, typeOfAccountColName });
        
        // isTop10Account function - EXACT same logic as AccountBUWiseResponseRateDashboard
        const isTop10Account = (row) => {
          const val = (row[typeOfAccountColName] ?? row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
          return val.toLowerCase() === 'top 10';
        };
        
        // Process each row
        sheet2Data.forEach((row, idx) => {
          if (!isTop10Account(row)) return;
          
          const custName = (row[customerNameCol] ?? row['CUST_NM'] ?? row['CUSTOMER NAME'] ?? '').toString().trim();
          if (!custName || custName === 'N/A') return;
          
          const bu = (row[buColName] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A').toString().trim();
          
          // Initialize account if not exists
          if (!top10AccountRows[custName]) {
            top10AccountRows[custName] = { businessUnit: bu, accountName: custName, polled: 0, responded: 0 };
          }
          
          // Count Polled (CSAT SENT DATE has value) - NO date filter for Trend Analysis
          const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
          if (sentVal != null && sentVal !== '' && String(sentVal).trim() !== '' && String(sentVal).toLowerCase() !== 'n/a') {
            top10AccountRows[custName].polled++;
          }
          
          // Count Responded (CSAT RECEIVED DATE has value) - NO date filter for Trend Analysis
          const recvVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          if (recvVal != null && recvVal !== '' && String(recvVal).trim() !== '' && String(recvVal).toLowerCase() !== 'n/a') {
            top10AccountRows[custName].responded++;
          }
        });
        
        // Debug: Log all accounts with Polled/Responded
        console.log('=== TOP 10 ACCOUNTS POLLED/RESPONDED ===');
        Object.entries(top10AccountRows).forEach(([name, data]) => {
          console.log(`  ${name}: Polled=${data.polled}, Responded=${data.responded}`);
        });
        
        // Specific debug for AgileOne
        const agileOneData = top10AccountRows['AgileOne'];
        console.log('AgileOne final data:', agileOneData || 'NOT FOUND');
      } else {
        console.log('ERROR: Sheet2 data is empty');
      }
      
      // Process Top 10 perspective data from "CSAT received Report" sheet - by individual account
      let top10PerspectivesByAccount = {};
      let top10AllPerspectives = new Set();
      
      if (receivedSheetName && file.sheets?.[receivedSheetName]) {
        const receivedData = file.sheets[receivedSheetName];
        if (Array.isArray(receivedData) && receivedData.length > 0) {
          const recFirstRow = receivedData[0] || {};
          const recBuCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit' ||
            (k || '').toLowerCase() === 'business unit' ||
            (k || '').toLowerCase() === 'bussiness unit'
          ) || 'BUSINESS UNIT';
          const recTypeOfAccountCol = Object.keys(recFirstRow).find(k => {
            const kLower = (k || '').toLowerCase().replace(/[\s_]/g, '');
            return kLower === 'typeofaccount' || kLower === 'accounttype' ||
                   (k || '').toLowerCase() === 'type of account' ||
                   (k || '').toLowerCase() === 'account type' ||
                   (kLower.includes('type') && kLower.includes('account'));
          }) || 'TYPE OF ACCOUNT';
          const recCustomerNameCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername' ||
            (k || '').toLowerCase() === 'customer name' ||
            (k || '').toLowerCase() === 'customer_name'
          ) || 'CUSTOMER NAME';
          const perspectiveCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'perspective' ||
            (k || '').toLowerCase().includes('perspective')
          ) || 'PERSPECTIVE';
          const ratingCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'rating' ||
            (k || '').toLowerCase().includes('rating')
          ) || 'RATING';
          
          // Group ratings by Account (CUSTOMER NAME) and perspective for Top 10 accounts only
          receivedData.forEach(row => {
            const typeOfAccount = row[recTypeOfAccountCol] || row['TYPE OF ACCOUNT'] || row['Type of Account'] || '';
            if (!isTop10Value(typeOfAccount)) return;
            
            const bu = row[recBuCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
            const customerName = row[recCustomerNameCol] || row['CUSTOMER NAME'] || row['Customer Name'] || 'N/A';
            if (!customerName || customerName === 'N/A') return;
            
            const perspective = row[perspectiveCol] || row['Perspective'] || '';
            const rating = parseFloat(row[ratingCol] || row['Rating'] || row['rating']);
            
            if (!perspective || isNaN(rating)) return;
            
            // Skip qualitative feedback
            const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
            if (questionCategory === 'Qualitative Feedback') return;
            
            top10AllPerspectives.add(perspective);
            
            const accountKey = customerName;
            if (!top10PerspectivesByAccount[accountKey]) {
              top10PerspectivesByAccount[accountKey] = { businessUnit: bu };
            }
            if (!top10PerspectivesByAccount[accountKey][perspective]) {
              top10PerspectivesByAccount[accountKey][perspective] = { sum: 0, count: 0 };
            }
            top10PerspectivesByAccount[accountKey][perspective].sum += rating;
            top10PerspectivesByAccount[accountKey][perspective].count++;
          });
        }
      }
      
      // Sort Top 10 perspectives
      const top10SortedPerspectives = [...top10AllPerspectives].sort((a, b) => {
        const idxA = perspectiveOrder.findIndex(p => p.toLowerCase() === a.toLowerCase());
        const idxB = perspectiveOrder.findIndex(p => p.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      
      // Merge accounts from both sheets: "CSAT sent and received Report" (top10AccountRows) and "CSAT received Report" (top10PerspectivesByAccount)
      // If sent sheet has no Top 10 data (e.g. wrong sheet or different structure), use accounts from received sheet with polled=0, responded=0
      const allTop10Accounts = { ...top10AccountRows };
      Object.keys(top10PerspectivesByAccount).forEach(accountName => {
        if (!allTop10Accounts[accountName]) {
          const accData = top10PerspectivesByAccount[accountName];
          allTop10Accounts[accountName] = {
            businessUnit: accData.businessUnit || 'N/A',
            accountName,
            polled: 0,
            responded: 0
          };
        }
      });
      
      // Convert to array - include accounts with polled/responded from sent sheet OR perspective data from received sheet
      const top10Rows = Object.values(allTop10Accounts)
        .filter(g => {
          const hasPolledResponded = g.polled > 0 || g.responded > 0;
          const accPerspectives = top10PerspectivesByAccount[g.accountName] || {};
          const hasPerspectiveData = top10SortedPerspectives.some(p => (accPerspectives[p]?.count || 0) > 0);
          return hasPolledResponded || hasPerspectiveData;
        })
        .map(g => {
          const accountPerspectives = top10PerspectivesByAccount[g.accountName] || {};
          const rowData = { ...g };
          top10SortedPerspectives.forEach(p => {
            if (accountPerspectives[p] && accountPerspectives[p].count > 0) {
              rowData[p] = avgToFixed2(accountPerspectives[p].sum / accountPerspectives[p].count);
            } else {
              rowData[p] = '-';
            }
          });
          return rowData;
        })
        .sort((a, b) => {
          // Sort by Business Unit first, then by Account Name
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== -1 && indexB !== -1) {
            if (indexA !== indexB) return indexA - indexB;
          } else if (indexA !== -1) return -1;
          else if (indexB !== -1) return 1;
          else {
            const buCompare = (a.businessUnit || '').localeCompare(b.businessUnit || '');
            if (buCompare !== 0) return buCompare;
          }
          return (a.accountName || '').localeCompare(b.accountName || '');
        });
      
      // Calculate Top 10 Grand Total
      let top10TotalPolled = 0;
      let top10TotalResponded = 0;
      top10Rows.forEach(r => {
        top10TotalPolled += r.polled;
        top10TotalResponded += r.responded;
      });
      
      // Calculate Top 10 Grand Total perspective averages (from all individual account ratings)
      const top10GrandTotalPerspectives = {};
      top10SortedPerspectives.forEach(p => {
        let totalSum = 0;
        let totalCount = 0;
        Object.values(top10PerspectivesByAccount).forEach(accountData => {
          if (accountData[p]) {
            totalSum += accountData[p].sum;
            totalCount += accountData[p].count;
          }
        });
        if (totalCount > 0) {
          top10GrandTotalPerspectives[p] = avgToFixed2(totalSum / totalCount);
        } else {
          top10GrandTotalPerspectives[p] = '-';
        }
      });
      
      const top10GrandTotalRow = {
        businessUnit: '',
        accountName: 'Top 10 Accounts',
        polled: top10TotalPolled,
        responded: top10TotalResponded,
        isGrandTotal: true,
        ...top10GrandTotalPerspectives
      };

      // ===== OTHER ACCOUNTS & OVERALL CALCULATION =====
      // EXACT SAME LOGIC as AccountBUWiseResponseRateDashboard.js
      // Other Accounts = TYPE OF ACCOUNT is blank or N/A
      // Overall = ALL rows in Sheet2 (Top 10 + Other)
      let otherAccountsPolled = 0;
      let otherAccountsResponded = 0;
      let overallPolled = 0;
      let overallResponded = 0;
      
      // Use sheet2Data which is already loaded from "CSAT sent and received Report"
      console.log('=== CALCULATING OTHER ACCOUNTS & OVERALL ===');
      console.log('sheet2Data.length:', sheet2Data.length);
      
      if (sheet2Data && sheet2Data.length > 0) {
        sheet2Data.forEach((row, idx) => {
          // Get TYPE OF ACCOUNT value
          const typeOfAccount = (row['TYPE OF ACCOUNT'] || '').toString().trim().toLowerCase();
          const isTop10 = typeOfAccount === 'top 10';
          const isOther = typeOfAccount === '' || typeOfAccount === 'n/a';
          
          // Get CSAT SENT DATE and CSAT RECEIVED DATE
          const sentDate = row['CSAT SENT DATE'];
          const receivedDate = row['CSAT RECEIVED DATE'];
          
          // Check if dates have values (not empty, not null, not N/A)
          const hasSentDate = sentDate != null && sentDate !== '' && String(sentDate).trim() !== '' && String(sentDate).toLowerCase() !== 'n/a';
          const hasReceivedDate = receivedDate != null && receivedDate !== '' && String(receivedDate).trim() !== '' && String(receivedDate).toLowerCase() !== 'n/a';
          
          // Count for Overall (ALL rows)
          if (hasSentDate) overallPolled++;
          if (hasReceivedDate) overallResponded++;
          
          // Count for Other Accounts (only if TYPE OF ACCOUNT is blank or N/A)
          if (isOther) {
            if (hasSentDate) otherAccountsPolled++;
            if (hasReceivedDate) otherAccountsResponded++;
          }
        });
      }
      
      console.log('Other Accounts: Polled=' + otherAccountsPolled + ', Responded=' + otherAccountsResponded);
      console.log('Overall: Polled=' + overallPolled + ', Responded=' + overallResponded);
      console.log('Top 10 Total (from top10AccountRows): Polled=' + top10TotalPolled + ', Responded=' + top10TotalResponded);
      console.log('Verification: Top10(' + top10TotalPolled + ') + Other(' + otherAccountsPolled + ') = ' + (top10TotalPolled + otherAccountsPolled) + ' (should equal Overall: ' + overallPolled + ')');

      // Process Other Accounts perspective data from "CSAT received Report" sheet
      let otherPerspectivesByAccount = {};
      
      if (receivedSheetName && file.sheets?.[receivedSheetName]) {
        const receivedData = file.sheets[receivedSheetName];
        if (Array.isArray(receivedData) && receivedData.length > 0) {
          const recFirstRow = receivedData[0] || {};
          const recBuCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit' ||
            (k || '').toLowerCase() === 'business unit' ||
            (k || '').toLowerCase() === 'bussiness unit'
          ) || 'BUSINESS UNIT';
          const recTypeOfAccountCol = Object.keys(recFirstRow).find(k => {
            const kLower = (k || '').toLowerCase().replace(/[\s_]/g, '');
            return kLower === 'typeofaccount' || kLower === 'accounttype' ||
                   (k || '').toLowerCase() === 'type of account' ||
                   (k || '').toLowerCase() === 'account type' ||
                   (kLower.includes('type') && kLower.includes('account'));
          }) || 'TYPE OF ACCOUNT';
          const recCustomerNameCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername' ||
            (k || '').toLowerCase() === 'customer name' ||
            (k || '').toLowerCase() === 'customer_name'
          ) || 'CUSTOMER NAME';
          const perspectiveCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'perspective' ||
            (k || '').toLowerCase().includes('perspective')
          ) || 'PERSPECTIVE';
          const ratingCol = Object.keys(recFirstRow).find(k => 
            (k || '').toLowerCase() === 'rating' ||
            (k || '').toLowerCase().includes('rating')
          ) || 'RATING';
          
          receivedData.forEach(row => {
            const typeOfAccount = row[recTypeOfAccountCol] || row['TYPE OF ACCOUNT'] || '';
            const typeStr = String(typeOfAccount).toLowerCase().trim();
            if (typeStr === 'top 10' || typeStr === 'top10') return;
            
            const bu = row[recBuCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
            const customerName = row[recCustomerNameCol] || row['CUSTOMER NAME'] || row['Customer Name'] || 'N/A';
            if (!customerName || customerName === 'N/A') return;
            
            const perspective = row[perspectiveCol] || row['Perspective'] || '';
            const rating = parseFloat(row[ratingCol] || row['Rating'] || row['rating']);
            
            if (!perspective || isNaN(rating)) return;
            
            const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
            if (questionCategory === 'Qualitative Feedback') return;
            
            const accountKey = customerName;
            if (!otherPerspectivesByAccount[accountKey]) {
              otherPerspectivesByAccount[accountKey] = { businessUnit: bu };
            }
            if (!otherPerspectivesByAccount[accountKey][perspective]) {
              otherPerspectivesByAccount[accountKey][perspective] = { sum: 0, count: 0 };
            }
            otherPerspectivesByAccount[accountKey][perspective].sum += rating;
            otherPerspectivesByAccount[accountKey][perspective].count++;
          });
        }
      }

      // Calculate Other Accounts Grand Total perspectives (from "CSAT received Report" sheet)
      const otherGrandTotalPerspectives = {};
      top10SortedPerspectives.forEach(p => {
        let totalSum = 0;
        let totalCount = 0;
        Object.values(otherPerspectivesByAccount).forEach(accountData => {
          if (accountData[p]) {
            totalSum += accountData[p].sum;
            totalCount += accountData[p].count;
          }
        });
        if (totalCount > 0) {
          otherGrandTotalPerspectives[p] = avgToFixed2(totalSum / totalCount);
        } else {
          otherGrandTotalPerspectives[p] = '-';
        }
      });

      // Other Accounts row - using calculated values from Sheet2
      const otherAccountsRow = {
        businessUnit: '',
        accountName: 'Other Accounts',
        polled: otherAccountsPolled,
        responded: otherAccountsResponded,
        isOtherAccounts: true,
        ...otherGrandTotalPerspectives
      };

      // ===== OVERALL ROW (Grand Total from ALL rows in Sheet2) =====
      // Using allRowsAgg which counts ALL rows regardless of TYPE OF ACCOUNT (same logic as AccountBUWiseResponseRateDashboard)
      const overallPerspectives = {};
      top10SortedPerspectives.forEach(p => {
        let totalSum = 0;
        let totalCount = 0;
        // Sum from Top 10 accounts
        Object.values(top10PerspectivesByAccount).forEach(accountData => {
          if (accountData[p]) {
            totalSum += accountData[p].sum;
            totalCount += accountData[p].count;
          }
        });
        // Sum from Other accounts
        Object.values(otherPerspectivesByAccount).forEach(accountData => {
          if (accountData[p]) {
            totalSum += accountData[p].sum;
            totalCount += accountData[p].count;
          }
        });
        if (totalCount > 0) {
          overallPerspectives[p] = avgToFixed2(totalSum / totalCount);
        } else {
          overallPerspectives[p] = '-';
        }
      });

      // Overall row - using calculated values from Sheet2 (ALL rows)
      const overallRow = {
        businessUnit: '',
        accountName: 'Overall',
        polled: overallPolled,
        responded: overallResponded,
        isOverall: true,
        ...overallPerspectives
      };

      // Final debug log before return
      console.log('=== FINAL TOP 10 DATA BEFORE RETURN ===');
      console.log('top10Rows count:', top10Rows.length);
      const agileOneInFinal = top10Rows.find(r => r.accountName?.toLowerCase().includes('agileone'));
      console.log('AgileOne in final top10Rows:', agileOneInFinal ? `Polled=${agileOneInFinal.polled}, Responded=${agileOneInFinal.responded}` : 'NOT FOUND');
      console.log('=== SUMMARY ROWS ===');
      console.log('Top 10 Grand Total: Polled=', top10GrandTotalRow?.polled, ', Responded=', top10GrandTotalRow?.responded);
      console.log('Other Accounts Row: Polled=', otherAccountsRow?.polled, ', Responded=', otherAccountsRow?.responded);
      console.log('Overall Row: Polled=', overallRow?.polled, ', Responded=', overallRow?.responded);
      
      return { 
        saveName: file.saveName, 
        rows: [...rows, orgLevelRow], 
        hasData: rows.length > 0,
        perspectives: sortedPerspectives,
        // Top 10 specific data - now with individual accounts
        top10Rows: top10Rows,
        top10GrandTotalRow: top10GrandTotalRow,
        otherAccountsRow: otherAccountsRow,
        overallRow: overallRow,
        top10Perspectives: top10SortedPerspectives,
        hasTop10Data: top10Rows.length > 0 || !!top10GrandTotalRow || !!otherAccountsRow || !!overallRow
      };
    });
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Top 10 Trend Analysis: from "CSAT received Report" sheet ONLY, TYPE OF ACCOUNT = "Top 10"
  // Columns: Sr.No., Business Unit, Account Name, perspective columns (avg RATING per perspective)
  // Used ONLY on "Top 10 Account - Average CSAT Scores - Perspective Wise" page when "View trend analysis" is clicked
  const top10TrendAnalysisData = useMemo(() => {
    if (!trendAnalysisFiles?.length) return [];
    
    const perspectiveOrder = [
      'Overall Experience', 'Timeline Adherence', 'Quality of Delivery', 'Quality of deliverables',
      'Timely Resource Fulfillment', 'Risk Management & Responsiveness', 'Thought Leadership', 'Resource Competency'
    ];
    
    return trendAnalysisFiles.map(file => {
      const receivedSheetName = file.sheetNames?.find(s => {
        const sheetLower = String(s).toLowerCase().trim();
        return sheetLower.includes('csat received') || sheetLower === 'sheet1';
      });
      
      if (!receivedSheetName || !file.sheets?.[receivedSheetName]) {
        return { saveName: file.saveName, rows: [], hasData: false, perspectives: [] };
      }
      
      const receivedData = file.sheets[receivedSheetName];
      if (!Array.isArray(receivedData) || receivedData.length === 0) {
        return { saveName: file.saveName, rows: [], hasData: false, perspectives: [] };
      }
      
      const firstRow = receivedData[0] || {};
      const buCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit' ||
        (k || '').toLowerCase() === 'business unit' || (k || '').toLowerCase() === 'bussiness unit'
      ) || 'BUSINESS UNIT';
      const typeOfAccountCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount' ||
        (k || '').toLowerCase() === 'type of account'
      ) || 'TYPE OF ACCOUNT';
      const customerNameCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername' ||
        (k || '').toLowerCase() === 'customer name'
      ) || 'CUSTOMER NAME';
      const perspectiveCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase() === 'perspective' || (k || '').toLowerCase().includes('perspective')
      ) || 'PERSPECTIVE';
      const ratingCol = Object.keys(firstRow).find(k => 
        (k || '').toLowerCase() === 'rating' || (k || '').toLowerCase().includes('rating')
      ) || 'RATING';
      
      const isTop10Value = (val) => {
        if (!val) return false;
        const str = String(val).toLowerCase().trim();
        return str === 'top 10' || str === 'top10' || str === 'top-10' || str.includes('top 10') || str.includes('top10');
      };
      
      const accountPerspectives = {};
      const allPerspectives = new Set();
      
      receivedData.forEach(row => {
        const typeOfAccount = row[typeOfAccountCol] || row['TYPE OF ACCOUNT'] || '';
        if (!isTop10Value(typeOfAccount)) return;
        
        const bu = row[buCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
        const customerName = row[customerNameCol] || row['CUSTOMER NAME'] || row['Customer Name'] || 'N/A';
        if (!customerName || customerName === 'N/A') return;
        
        const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
        if (questionCategory === 'Qualitative Feedback') return;
        
        const perspective = row[perspectiveCol] || row['Perspective'] || '';
        const rating = parseFloat(row[ratingCol] || row['Rating'] || row['rating']);
        if (!perspective || isNaN(rating)) return;
        
        allPerspectives.add(perspective);
        const accountKey = `${customerName}|||${bu}`;
        
        if (!accountPerspectives[accountKey]) {
          accountPerspectives[accountKey] = { businessUnit: bu, accountName: customerName, perspectives: {} };
        }
        if (!accountPerspectives[accountKey].perspectives[perspective]) {
          accountPerspectives[accountKey].perspectives[perspective] = { sum: 0, count: 0 };
        }
        accountPerspectives[accountKey].perspectives[perspective].sum += rating;
        accountPerspectives[accountKey].perspectives[perspective].count++;
      });
      
      const sortedPerspectives = [...allPerspectives].sort((a, b) => {
        const idxA = perspectiveOrder.findIndex(p => p.toLowerCase() === a.toLowerCase());
        const idxB = perspectiveOrder.findIndex(p => p.toLowerCase() === b.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.localeCompare(b);
      });
      
      const rows = Object.values(accountPerspectives)
        .map((acc, idx) => {
          const rowData = {
            sNo: idx + 1,
            businessUnit: acc.businessUnit,
            accountName: acc.accountName
          };
          sortedPerspectives.forEach(p => {
            if (acc.perspectives[p] && acc.perspectives[p].count > 0) {
              rowData[p] = avgToFixed2(acc.perspectives[p].sum / acc.perspectives[p].count);
            } else {
              rowData[p] = '-';
            }
          });
          return rowData;
        })
        .sort((a, b) => {
          const indexA = getBusinessUnitOrderIndex(a.businessUnit);
          const indexB = getBusinessUnitOrderIndex(b.businessUnit);
          if (indexA !== -1 && indexB !== -1) {
            if (indexA !== indexB) return indexA - indexB;
          } else if (indexA !== -1) return -1;
          else if (indexB !== -1) return 1;
          const buCompare = (a.businessUnit || '').localeCompare(b.businessUnit || '');
          if (buCompare !== 0) return buCompare;
          return (a.accountName || '').localeCompare(b.accountName || '');
        });
      
      return {
        saveName: file.saveName,
        rows,
        hasData: rows.length > 0,
        perspectives: sortedPerspectives
      };
    });
  }, [trendAnalysisFiles]);

  // Account-wise Trend Analysis table (H1 2025 reference) for this dashboard:
  // Use uploaded Trend-Analysis-H12025.xlsx, Sheet2 "CSAT sent and received Report"
  // Group by CUSTOMER_ID/CUST_ID (fallback: CUSTOMER NAME) + BUSINESS UNIT.
  // Columns: Business Unit, Account Name, Polled=count(CSAT SENT DATE), Responded=count(CSAT RECEIVED DATE),
  // then perspective columns = Avg(RATING) from Sheet1 "CSAT received Report" grouped by CUSTOMER_ID/CUST_ID (+ BU).
  const accountWiseTrendSentReceived = useMemo(() => {
    if (!showTrendAnalysis || !trendAnalysisFiles?.length) return { rows: [], hasData: false, perspectives: [], sourceName: '', error: null };

    const nameLower = (s) => (s || '').toString().toLowerCase();
    const file =
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis-h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis') && nameLower(f.saveName).includes('h12025')) ||
      (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis') && nameLower(f.originalName).includes('h12025')) ||
      (trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null);

    if (!file) return { rows: [], hasData: false, perspectives: [], sourceName: '', error: 'No trend file uploaded.' };

    // Find "CSAT sent and received Report" (Sheet2)
    const sheetName =
      file.sheetNames?.find(s => {
        const t = String(s).toLowerCase().trim();
        return t.includes('csat sent and received') || t.includes('sent and received') || t === 'sheet2' || t === 'sheet 2';
      }) ||
      (file.sheetNames?.length >= 2 ? file.sheetNames[1] : file.sheetNames?.[0]);

    // Find "CSAT received Report" (Sheet1) for perspective ratings
    const receivedSheetName =
      file.sheetNames?.find(s => {
        const t = String(s).toLowerCase().trim();
        return (t.includes('csat received') && !t.includes('sent and received')) || t === 'sheet1' || t === 'sheet 1';
      }) ||
      (file.sheetNames?.[0] || null);

    const sheetData = sheetName ? (file.sheets?.[sheetName] || []) : [];
    if (!Array.isArray(sheetData) || sheetData.length === 0) {
      return { rows: [], hasData: false, perspectives: [], sourceName: file.saveName || '', error: `No rows found in sheet "${sheetName || 'Sheet2'}".` };
    }

    const firstRow = sheetData[0] || {};
    const buCol =
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().includes('business unit')) ||
      'BUSINESS UNIT';
    const custIdCol =
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'customerid') ||
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'custid') ||
      'CUSTOMER_ID';
    const custNameCol =
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'customername') ||
      Object.keys(firstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'custnm') ||
      'CUSTOMER NAME';
    const sentCol =
      Object.keys(firstRow).find(k => {
        const kn = (k || '').toString().toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || kn.includes('csssentdate') || (kn.includes('sent') && kn.includes('date'));
      }) || 'CSAT SENT DATE';
    const receivedCol =
      Object.keys(firstRow).find(k => {
        const kn = (k || '').toString().toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || kn.includes('cssreceiveddate') || (kn.includes('received') && kn.includes('date'));
      }) || 'CSAT RECEIVED DATE';

    const map = new Map();
    sheetData.forEach((row) => {
      const buRaw = row?.[buCol] ?? row?.['BUSSINESS UNIT'] ?? row?.['Business Unit'];
      const businessUnit = buRaw != null && String(buRaw).trim() !== '' ? String(buRaw).trim() : 'N/A';
      if (businessUnit === 'N/A') return;

      const custId = normalizeCustomerIdKey(row?.[custIdCol] ?? row?.['CUSTOMER_ID'] ?? row?.['CUST_ID'] ?? '');
      const accountName = (row?.[custNameCol] ?? row?.['CUSTOMER NAME'] ?? row?.['CUST_NM'] ?? '').toString().trim() || 'N/A';
      const keyId = custId || accountName;
      const key = `${keyId}|||${normalizeBusinessUnitDisplay(businessUnit)}`;

      if (!map.has(key)) {
        map.set(key, { customerId: custId || '', accountName, businessUnit, polled: 0, responded: 0, perspectiveAgg: {} });
      }
      const agg = map.get(key);

      const sentVal = row?.[sentCol] ?? row?.['CSAT SENT DATE'] ?? row?.['CSS_SENT_DATE'];
      const recvVal = row?.[receivedCol] ?? row?.['CSAT RECEIVED DATE'] ?? row?.['CSS_RECEIVED_DATE'];
      if (parseExcelDateToMMDDYYYY(sentVal)) agg.polled += 1;
      if (parseExcelDateToMMDDYYYY(recvVal)) agg.responded += 1;
    });

    // Read perspective ratings from "CSAT received Report" and aggregate per (CUSTOMER_ID/CUST_ID [+ BU])
    const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];
    const allPerspectives = new Set();
    if (Array.isArray(receivedData) && receivedData.length > 0) {
      const recFirstRow = receivedData[0] || {};
      const recBuCol =
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().includes('business unit')) ||
        'BUSINESS UNIT';
      const recCustIdCol =
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'customerid') ||
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'custid') ||
        'CUSTOMER_ID';
      const recCustNameCol =
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'customername') ||
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().replace(/[\s_]/g, '') === 'custnm') ||
        'CUSTOMER NAME';
      const perspectiveCol =
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().trim() === 'perspective' || (k || '').toString().toLowerCase().includes('perspective')) ||
        'PERSPECTIVE';
      const ratingCol =
        Object.keys(recFirstRow).find(k => (k || '').toString().toLowerCase().trim() === 'rating' || (k || '').toString().toLowerCase().includes('rating')) ||
        'RATING';

      receivedData.forEach((row) => {
        const buRaw = row?.[recBuCol] ?? row?.['BUSSINESS UNIT'] ?? row?.['Business Unit'];
        const businessUnit = buRaw != null && String(buRaw).trim() !== '' ? String(buRaw).trim() : 'N/A';
        if (businessUnit === 'N/A') return;

        const custId = normalizeCustomerIdKey(row?.[recCustIdCol] ?? row?.['CUSTOMER_ID'] ?? row?.['CUST_ID'] ?? '');
        const accountName = (row?.[recCustNameCol] ?? row?.['CUSTOMER NAME'] ?? row?.['CUST_NM'] ?? '').toString().trim() || 'N/A';
        const keyId = custId || accountName;
        const key = `${keyId}|||${normalizeBusinessUnitDisplay(businessUnit)}`;
        if (!map.has(key)) return; // only enrich keys present in sent/received aggregation

        const perspectiveRaw = row?.[perspectiveCol];
        if (perspectiveRaw == null || String(perspectiveRaw).trim() === '') return;
        const perspective = normalizePerspectiveForDisplay(String(perspectiveRaw).trim());
        const ratingNum = parseFloat(row?.[ratingCol] ?? row?.['RATING'] ?? row?.['Rating']);
        if (isNaN(ratingNum)) return;

        allPerspectives.add(perspective);
        const agg = map.get(key);
        if (!agg.perspectiveAgg[perspective]) agg.perspectiveAgg[perspective] = { sum: 0, count: 0 };
        agg.perspectiveAgg[perspective].sum += ratingNum;
        agg.perspectiveAgg[perspective].count += 1;
      });
    }

    // Sort perspectives using dashboard's standard perspective ordering
    const sortedPerspectives = sortPerspectivesByDisplayOrder([...allPerspectives]);

    const rows = Array.from(map.values()).map((r) => {
      const row = { ...r };
      sortedPerspectives.forEach((p) => {
        const st = r.perspectiveAgg?.[p];
        row[p] = st && st.count > 0 ? avgToFixed2(st.sum / st.count) : '-';
      });
      return row;
    }).sort((a, b) => {
      const an = (a.accountName || '').localeCompare(b.accountName || '');
      if (an !== 0) return an;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });

    return { rows, hasData: rows.length > 0, perspectives: sortedPerspectives, sourceName: file.saveName || '', error: null };
  }, [showTrendAnalysis, trendAnalysisFiles]);

  // Lookup for Account-wise trend (H1 reference) by CUSTOMER_ID (preferred) or Account Name + BU
  const accountWiseTrendLookup = useMemo(() => {
    const lookup = {};
    (accountWiseTrendSentReceived?.rows || []).forEach(r => {
      const buKey = normalizeBusinessUnitDisplay(r.businessUnit || '').toString().trim().toLowerCase();
      const idKey = normalizeCustomerIdKey(r.customerId || '');
      const nameKey = (r.accountName || '').toString().trim().toLowerCase();
      if (buKey && idKey) lookup[`id|||${idKey}|||${buKey}`] = r;
      if (buKey && nameKey) lookup[`name|||${nameKey}|||${buKey}`] = r;
      if (nameKey) lookup[`nameOnly|||${nameKey}`] = r;
    });
    return lookup;
  }, [accountWiseTrendSentReceived]);

  const downloadAccountWiseTrendH1Reference = async () => {
    if (!accountWiseTrendSentReceived?.hasData || !(accountWiseTrendSentReceived.rows || []).length) {
      alert('No Account-wise H1 2025 reference data available for download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Trend Analysis (H1 2025)');

      const cellBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const perspectives = accountWiseTrendSentReceived.perspectives || [];

      const headers = ['Business Unit', 'Account Name', 'Polled', 'Responded', ...perspectives.map(p => normalizePerspectiveForDisplay(p))];
      ws.addRow(headers);
      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
      headerRow.height = 30;
      headerRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = cellBorder;
      });

      (accountWiseTrendSentReceived.rows || []).forEach((r) => {
        const rowVals = [
          normalizeBusinessUnitDisplay(r.businessUnit),
          r.accountName,
          r.polled,
          r.responded,
          ...perspectives.map(p => (r[p] != null ? String(r[p]) : '-'))
        ];
        const excelRow = ws.addRow(rowVals);
        excelRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
        excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
        excelRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        excelRow.eachCell((cell) => { cell.border = cellBorder; });

        // Perspective cell coloring (same thresholds as dashboard)
        perspectives.forEach((p, idx) => {
          const raw = r[p];
          const display = formatPerspectiveDisplay(raw);
          const numVal = parseFloat(display);
          const cell = excelRow.getCell(5 + idx);
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          cell.value = display === '-' ? '-' : (!isNaN(numVal) ? Number(numVal).toFixed(2) : String(display));
          if (display !== '-' && !isNaN(numVal)) {
            if (numVal < 4) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (numVal >= 4 && numVal < 4.5) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          } else {
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          }
        });
      });

      ws.getColumn(1).width = 20;
      ws.getColumn(2).width = 34;
      ws.getColumn(3).width = 10;
      ws.getColumn(4).width = 12;
      perspectives.forEach((_, idx) => { ws.getColumn(5 + idx).width = 18; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Account_Wise_Trend_Analysis_H1_2025_Reference.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Account-wise H1 reference export error:', err);
      alert('Failed to export H1 2025 reference Excel. Please try again.');
    }
  };

  // Fully Managed – BU Wise: from "CSAT received Report", ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT.
  // Columns: Sr. No., BUSINESS UNIT, # Accounts Polled, Polled, Responded (from Sheet2), then perspective columns (avg RATING).
  const buWiseFullyManagedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: FULLY_MANAGED_CO_MANAGED_PERSPECTIVES, orgLevelRow: null };
    const firstRow = uploadedData[0] || {};
    const engagementKey = getEngagementTypeKey(firstRow);
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || String(key).toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    const filtered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      return engagementKey && isFullyManagedRow(row, engagementKey);
    });

    const buMap = new Map();
    filtered.forEach(row => {
      const buRaw = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';
      if (!buRaw || buRaw === 'N/A') return;
      const bu = normalizeBUForGrouping(buRaw);
      if (!bu || bu === 'N/A') return;
      const customerId = row['CUSTOMER_ID'] ?? row['CUST_ID'];
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective) return;

      if (!buMap.has(bu)) {
        buMap.set(bu, { businessUnit: bu, uniqueCustomers: new Set(), perspectives: {} });
      }
      const g = buMap.get(bu);
      if (customerId) g.uniqueCustomers.add(String(customerId).trim());
      const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
      if (!g.perspectives[normalizedPerspective]) g.perspectives[normalizedPerspective] = [];
      if (!isNaN(rating)) g.perspectives[normalizedPerspective].push(rating);
    });

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT
    const buAccountsPolledFullyManaged = {};
    const polledByBU = {};
    const respondedByBU = {};
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    if (secondSheet.length > 0) {
      const shFirst = secondSheet[0] || {};
      const engKey = getEngagementTypeKey(shFirst);
      const buCol = Object.prototype.hasOwnProperty.call(shFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
      const sentCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatsentdate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_sent_date') || 'CSAT SENT DATE';
      const receivedCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatreceiveddate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_received_date') || 'CSAT RECEIVED DATE';
      secondSheet.forEach(row => {
        if (!engKey || !isFullyManagedRow(row, engKey)) return;
        const buRaw = row[buCol] || row['BUSSINESS UNIT'] || 'N/A';
        if (!buRaw || buRaw === 'N/A') return;
        const bu = normalizeBUForGrouping(buRaw);
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId !== '') {
          if (!buAccountsPolledFullyManaged[bu]) buAccountsPolledFullyManaged[bu] = new Set();
          buAccountsPolledFullyManaged[bu].add(custId);
        }
        if (csatCycleStartDateFormatted) {
          const sentVal = row[sentCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          const receivedVal = row[receivedCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          const sentFormatted = sentVal ? parseExcelDateToMMDDYYYY(sentVal) : '';
          const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            polledByBU[bu] = (polledByBU[bu] || 0) + 1;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            respondedByBU[bu] = (respondedByBU[bu] || 0) + 1;
          }
        }
      });
    }

    const perspectives = FULLY_MANAGED_CO_MANAGED_PERSPECTIVES;
    const allBuKeys = [...new Set([...buMap.keys(), ...Object.keys(polledByBU).filter(bu => (polledByBU[bu] || 0) > 0)])];
    let data = allBuKeys
      .filter(bu => (polledByBU[bu] || 0) > 0)
      .map(bu => {
        const g = buMap.get(bu) || { businessUnit: bu, perspectives: {}, uniqueCustomers: new Set() };
        perspectives.forEach(p => { if (!g.perspectives[p]) g.perspectives[p] = []; });
        const responded = respondedByBU[bu] ?? 0;
        const row = {
          businessUnit: g.businessUnit,
          customerCount: (buAccountsPolledFullyManaged[bu] && buAccountsPolledFullyManaged[bu].size) ? buAccountsPolledFullyManaged[bu].size : 0,
          Polled: polledByBU[bu] ?? 0,
          Responded: responded
        };
        perspectives.forEach(p => {
          const ratings = g.perspectives[p] || [];
          row[p] = responded === 0 ? '-' : (ratings.length > 0 ? avgToFixed2(ratings.reduce((s, r) => s + r, 0) / ratings.length) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Org level row: perspective averages must be computed from raw "CSAT received Report" rows
    // for this ENGAGEMENT TYPE (Fully Managed), not from BU-level averages.
    const orgResponded = data.reduce((s, r) => s + (r.Responded ?? 0), 0);
    const orgPolled = data.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const orgCustomerCount = data.reduce((s, r) => s + (r.customerCount || 0), 0);

    const orgPerspectiveRatings = {};
    perspectives.forEach(p => { orgPerspectiveRatings[p] = []; });
    filtered.forEach(row => {
      const pRaw = row[perspectiveColumn];
      const p = normalizePerspectiveForDisplay(pRaw);
      if (!p || !orgPerspectiveRatings[p]) return;
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!isNaN(rating)) orgPerspectiveRatings[p].push(rating);
    });

    const orgLevelRow = {
      sNo: '',
      businessUnit: 'Org level',
      customerCount: orgCustomerCount,
      Polled: orgPolled,
      Responded: orgResponded
    };
    if (orgResponded === 0) {
      perspectives.forEach(p => { orgLevelRow[p] = '-'; });
    } else {
      perspectives.forEach(p => {
        const ratings = orgPerspectiveRatings[p] || [];
        orgLevelRow[p] = ratings.length > 0 ? avgToFixed2(ratings.reduce((a, b) => a + b, 0) / ratings.length) : '0.00';
      });
    }

    return { data, perspectives, orgLevelRow };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Co-Managed – BU Wise: from "CSAT received Report", ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT.
  // Columns: Sr. No., BUSINESS UNIT, # Accounts Polled, Polled, Responded (from Sheet2), then perspective columns (avg RATING) for Co-Managed perspectives.
  const buWiseCoManagedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: FULLY_MANAGED_CO_MANAGED_PERSPECTIVES, orgLevelRow: null };
    const firstRow = uploadedData[0] || {};
    const engagementKey = getEngagementTypeKey(firstRow);
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || String(key).toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    const filtered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      return engagementKey && isCoManagedRow(row, engagementKey);
    });

    const buMap = new Map();
    filtered.forEach(row => {
      const buRaw = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';
      if (!buRaw || buRaw === 'N/A') return;
      const bu = normalizeBUForGrouping(buRaw);
      if (!bu || bu === 'N/A') return;
      const customerId = row['CUSTOMER_ID'] ?? row['CUST_ID'];
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective) return;

      if (!buMap.has(bu)) {
        buMap.set(bu, { businessUnit: bu, uniqueCustomers: new Set(), perspectives: {} });
      }
      const g = buMap.get(bu);
      if (customerId) g.uniqueCustomers.add(String(customerId).trim());
      const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
      if (!g.perspectives[normalizedPerspective]) g.perspectives[normalizedPerspective] = [];
      if (!isNaN(rating)) g.perspectives[normalizedPerspective].push(rating);
    });

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT
    const buAccountsPolledCoManaged = {};
    const polledByBU = {};
    const respondedByBU = {};
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    if (secondSheet.length > 0) {
      const shFirst = secondSheet[0] || {};
      const engKey = getEngagementTypeKey(shFirst);
      const buCol = Object.prototype.hasOwnProperty.call(shFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
      const sentCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatsentdate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_sent_date') || 'CSAT SENT DATE';
      const receivedCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatreceiveddate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_received_date') || 'CSAT RECEIVED DATE';
      secondSheet.forEach(row => {
        if (!engKey || !isCoManagedRow(row, engKey)) return;
        const buRaw = row[buCol] || row['BUSSINESS UNIT'] || 'N/A';
        if (!buRaw || buRaw === 'N/A') return;
        const bu = normalizeBUForGrouping(buRaw);
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId !== '') {
          if (!buAccountsPolledCoManaged[bu]) buAccountsPolledCoManaged[bu] = new Set();
          buAccountsPolledCoManaged[bu].add(custId);
        }
        if (csatCycleStartDateFormatted) {
          const sentVal = row[sentCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          const receivedVal = row[receivedCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          const sentFormatted = sentVal ? parseExcelDateToMMDDYYYY(sentVal) : '';
          const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            polledByBU[bu] = (polledByBU[bu] || 0) + 1;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            respondedByBU[bu] = (respondedByBU[bu] || 0) + 1;
          }
        }
      });
    }

    const perspectives = FULLY_MANAGED_CO_MANAGED_PERSPECTIVES;
    const allBuKeysCM = [...new Set([...buMap.keys(), ...Object.keys(polledByBU).filter(bu => (polledByBU[bu] || 0) > 0)])];
    let data = allBuKeysCM
      .filter(bu => (polledByBU[bu] || 0) > 0)
      .map(bu => {
        const g = buMap.get(bu) || { businessUnit: bu, perspectives: {}, uniqueCustomers: new Set() };
        perspectives.forEach(p => { if (!g.perspectives[p]) g.perspectives[p] = []; });
        const responded = respondedByBU[bu] ?? 0;
        const row = {
          businessUnit: g.businessUnit,
          customerCount: (buAccountsPolledCoManaged[bu] && buAccountsPolledCoManaged[bu].size) ? buAccountsPolledCoManaged[bu].size : 0,
          Polled: polledByBU[bu] ?? 0,
          Responded: responded
        };
        perspectives.forEach(p => {
          const ratings = g.perspectives[p] || [];
          row[p] = responded === 0 ? '-' : (ratings.length > 0 ? avgToFixed2(ratings.reduce((s, r) => s + r, 0) / ratings.length) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Org level row: perspective averages must be computed from raw "CSAT received Report" rows
    // for this ENGAGEMENT TYPE (Co-Managed), not from BU-level averages.
    const orgResponded = data.reduce((s, r) => s + (r.Responded ?? 0), 0);
    const orgPolled = data.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const orgCustomerCount = data.reduce((s, r) => s + (r.customerCount || 0), 0);

    const orgPerspectiveRatings = {};
    perspectives.forEach(p => { orgPerspectiveRatings[p] = []; });
    filtered.forEach(row => {
      const pRaw = row[perspectiveColumn];
      const p = normalizePerspectiveForDisplay(pRaw);
      if (!p || !orgPerspectiveRatings[p]) return;
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!isNaN(rating)) orgPerspectiveRatings[p].push(rating);
    });

    const orgLevelRow = {
      sNo: '',
      businessUnit: 'Org level',
      customerCount: orgCustomerCount,
      Polled: orgPolled,
      Responded: orgResponded
    };
    if (orgResponded === 0) {
      perspectives.forEach(p => { orgLevelRow[p] = '-'; });
    } else {
      perspectives.forEach(p => {
        const ratings = orgPerspectiveRatings[p] || [];
        orgLevelRow[p] = ratings.length > 0 ? avgToFixed2(ratings.reduce((a, b) => a + b, 0) / ratings.length) : '0.00';
      });
    }

    return { data, perspectives, orgLevelRow };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  // Staff Augmentation – BU Wise: from "CSAT received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT.
  // Columns: Sr. No., BUSINESS UNIT, # Accounts Polled, Polled, Responded (from Sheet2), then STAFF_AUGMENTATION_PERSPECTIVES (avg RATING).
  const buWiseStaffAugmentationData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: STAFF_AUGMENTATION_PERSPECTIVES, orgLevelRow: null };
    const firstRow = uploadedData[0] || {};
    const engagementKey = getEngagementTypeKey(firstRow);
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || String(key).toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';

    const filtered = uploadedData.filter(row => {
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      return engagementKey && isStaffAugmentationRow(row, engagementKey);
    });

    const buMap = new Map();
    filtered.forEach(row => {
      const buRaw = row[businessUnitCol] || row['BUSSINESS UNIT'] || 'N/A';
      if (!buRaw || buRaw === 'N/A') return;
      const bu = normalizeBUForGrouping(buRaw);
      if (!bu || bu === 'N/A') return;
      const customerId = row['CUSTOMER_ID'] ?? row['CUST_ID'];
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective) return;

      if (!buMap.has(bu)) {
        buMap.set(bu, { businessUnit: bu, uniqueCustomers: new Set(), perspectives: {} });
      }
      const g = buMap.get(bu);
      if (customerId) g.uniqueCustomers.add(String(customerId).trim());
      const normalizedPerspective = normalizePerspectiveForDisplay(perspective);
      if (!g.perspectives[normalizedPerspective]) g.perspectives[normalizedPerspective] = [];
      if (!isNaN(rating)) g.perspectives[normalizedPerspective].push(rating);
    });

    // # Accounts Polled = count of unique CUSTOMER_ID from sheet "CSAT sent and received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT
    const buAccountsPolledStaffAugmentation = {};
    const polledByBU = {};
    const respondedByBU = {};
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    if (secondSheet.length > 0) {
      const shFirst = secondSheet[0] || {};
      const engKey = getEngagementTypeKey(shFirst);
      const buCol = Object.prototype.hasOwnProperty.call(shFirst, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
      const sentCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatsentdate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_sent_date') || 'CSAT SENT DATE';
      const receivedCol = Object.keys(shFirst).find(k => (k || '').toLowerCase().replace(/\s/g, '') === 'csatreceiveddate' || (k || '').toLowerCase().replace(/_/g, '') === 'css_received_date') || 'CSAT RECEIVED DATE';
      secondSheet.forEach(row => {
        if (!engKey || !isStaffAugmentationRow(row, engKey)) return;
        const buRaw = row[buCol] || row['BUSSINESS UNIT'] || 'N/A';
        if (!buRaw || buRaw === 'N/A') return;
        const bu = normalizeBUForGrouping(buRaw);
        if (!bu || bu === 'N/A') return;
        const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'])?.toString();
        if (custId && custId !== '') {
          if (!buAccountsPolledStaffAugmentation[bu]) buAccountsPolledStaffAugmentation[bu] = new Set();
          buAccountsPolledStaffAugmentation[bu].add(custId);
        }
        if (csatCycleStartDateFormatted) {
          const sentVal = row[sentCol] ?? row['CSS_SENT_DATE'] ?? row['CSAT SENT DATE'];
          const receivedVal = row[receivedCol] ?? row['CSS_RECEIVED_DATE'] ?? row['CSAT RECEIVED DATE'];
          const sentFormatted = sentVal ? parseExcelDateToMMDDYYYY(sentVal) : '';
          const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
          if (sentFormatted && isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) {
            polledByBU[bu] = (polledByBU[bu] || 0) + 1;
          }
          if (receivedFormatted && isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) {
            respondedByBU[bu] = (respondedByBU[bu] || 0) + 1;
          }
        }
      });
    }

    const perspectives = STAFF_AUGMENTATION_PERSPECTIVES;
    const allBuKeysSA = [...new Set([...buMap.keys(), ...Object.keys(polledByBU).filter(bu => (polledByBU[bu] || 0) > 0)])];
    let data = allBuKeysSA
      .filter(bu => (polledByBU[bu] || 0) > 0)
      .map(bu => {
        const g = buMap.get(bu) || { businessUnit: bu, perspectives: {}, uniqueCustomers: new Set() };
        perspectives.forEach(p => { if (!g.perspectives[p]) g.perspectives[p] = []; });
        const responded = respondedByBU[bu] ?? 0;
        const row = {
          businessUnit: g.businessUnit,
          customerCount: (buAccountsPolledStaffAugmentation[bu] && buAccountsPolledStaffAugmentation[bu].size) ? buAccountsPolledStaffAugmentation[bu].size : 0,
          Polled: polledByBU[bu] ?? 0,
          Responded: responded
        };
        perspectives.forEach(p => {
          const ratings = g.perspectives[p] || [];
          row[p] = responded === 0 ? '-' : (ratings.length > 0 ? avgToFixed2(ratings.reduce((s, r) => s + r, 0) / ratings.length) : '0.00');
        });
        return row;
      });
    data = data.sort((a, b) => {
      const iA = getBusinessUnitOrderIndex(a.businessUnit);
      const iB = getBusinessUnitOrderIndex(b.businessUnit);
      if (iA !== -1 && iB !== -1) return iA - iB;
      if (iA !== -1) return -1;
      if (iB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    }).map((row, idx) => ({ ...row, sNo: idx + 1 }));

    // Org level row: perspective averages must be computed from raw "CSAT received Report" rows
    // for this ENGAGEMENT TYPE (Staff Augmentation), not from BU-level averages.
    const orgResponded = data.reduce((s, r) => s + (r.Responded ?? 0), 0);
    const orgPolled = data.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const orgCustomerCount = data.reduce((s, r) => s + (r.customerCount || 0), 0);

    const orgPerspectiveRatings = {};
    perspectives.forEach(p => { orgPerspectiveRatings[p] = []; });
    filtered.forEach(row => {
      const pRaw = row[perspectiveColumn];
      const p = normalizePerspectiveForDisplay(pRaw);
      if (!p || !orgPerspectiveRatings[p]) return;
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!isNaN(rating)) orgPerspectiveRatings[p].push(rating);
    });

    const orgLevelRow = {
      sNo: '',
      businessUnit: 'Org level',
      customerCount: orgCustomerCount,
      Polled: orgPolled,
      Responded: orgResponded
    };
    if (orgResponded === 0) {
      perspectives.forEach(p => { orgLevelRow[p] = '-'; });
    } else {
      perspectives.forEach(p => {
        const ratings = orgPerspectiveRatings[p] || [];
        orgLevelRow[p] = ratings.length > 0 ? avgToFixed2(ratings.reduce((a, b) => a + b, 0) / ratings.length) : '0.00';
      });
    }

    return { data, perspectives, orgLevelRow };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  if (!uploadedData) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <HeaderTitle>
            <Calculator size={24} /> Account/BU Wise Average CSAT Scores - Perspective Wise
          </HeaderTitle>
          {onBack && (
            <BackButton onClick={onBack} aria-label="Back" title="Back">
              <ChevronLeft size={16} />
              Back
            </BackButton>
          )}
        </DashboardHeader>

        <UploadContainer>
          <p style={{ color: '#3b82f6' }}>Please upload the Excel file to view Account/BU wise Average CSAT Scores</p>
          
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
              {isProcessing ? 'Processing...' : 'Load Account/BU wise Average CSAT Scores Data'}
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

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
        <HeaderTitle>
            <Calculator size={24} style={{ flexShrink: 0 }} /> 
            <span style={{ flex: 1, minWidth: 0 }}>
              {showPracticeWise ? 'Practice wise Average CSAT Scores - Perspective Wise' : showBUWiseView ? 'BU Wise Average CSAT Scores - Perspective Wise' : showTop10 ? 'Top 10 Account - Average CSAT Scores - Perspective Wise' : 'Account/BU Wise Average CSAT Scores - Perspective Wise'}
            </span>
        </HeaderTitle>
        {csatCycleStartDateFormatted && (
          <div style={{ 
            fontSize: '0.875rem', 
            opacity: 0.9, 
            marginTop: '0.5rem',
              textAlign: 'left'
          }}>
            📅 Filtered by CSAT Cycle Start Date: {csatCycleStartDateFormatted}
          </div>
        )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {processedData && processedData.length > 0 && (
            <>
              <button
                onClick={() => {
                  setShowBUWiseView(false);
                  setShowTop10(false);
                  setShowPracticeWise(false);
                  setShowProjectData(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: !showBUWiseView && !showTop10 && !showPracticeWise && !showProjectData ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: !showBUWiseView && !showTop10 && !showPracticeWise && !showProjectData ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = !showBUWiseView && !showTop10 && !showPracticeWise && !showProjectData ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Show Account-wise view"
                title="Show Account-wise view"
              >
                <Building2 size={14} />
                Account-wise
              </button>
              <button
                onClick={() => {
                  setShowBUWiseView(true);
                  setShowTop10(false);
                  setShowPracticeWise(false);
                  setShowProjectData(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showBUWiseView ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showBUWiseView ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = showBUWiseView ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Show BU-wise view"
                title="BU Wise Average CSAT Scores - Perspective Wise"
              >
                <Building2 size={14} />
                BU Wise
              </button>
              <button
                onClick={() => {
                  setShowTop10(true);
                  setShowBUWiseView(false);
                  setShowPracticeWise(false);
                  setShowProjectData(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showTop10 ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Show Top 10 accounts view"
                title="Top 10 Account - Average CSAT Scores - Perspective Wise"
              >
                <Building2 size={14} />
                Top 10
              </button>
              <button
                onClick={() => {
                  setShowPracticeWise(true);
                  setShowBUWiseView(false);
                  setShowTop10(false);
                  setShowProjectData(false);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showPracticeWise ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Practice wise Average CSAT Scores - Perspective Wise"
                title="Practice wise Average CSAT Scores - Perspective Wise"
              >
                <Building2 size={14} />
                Practice wise
              </button>
              <button
                onClick={() => {
                  if (showProjectData) {
                    setShowProjectData(false);
                  } else {
                    setShowProjectData(true);
                    setShowBUWiseView(false);
                    setShowTop10(false);
                    setShowPracticeWise(false);
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showProjectData ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showProjectData ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = showProjectData ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="Show Project Data"
                title="Show Project Data"
              >
                <Building2 size={14} />
                Show Project Data
              </button>
              <button
                onClick={() => setShowTrendAnalysis(!showTrendAnalysis)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showTrendAnalysis ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)';
                  e.target.style.transform = 'translateY(0)';
                }}
                aria-label="View trend analysis"
                title="View trend analysis"
              >
                <TrendingUp size={14} />
                Trend Analysis
              </button>
            <DownloadButton 
              onClick={downloadData}
              aria-label="Download data to Excel"
              title="Download data to Excel"
            >
              <Download size={14} />
              Download
            </DownloadButton>
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
            {onBack && (
              <BackButton onClick={onBack} aria-label="Back" title="Back">
                <ChevronLeft size={14} />
                Back
              </BackButton>
            )}
          </div>
        </div>
      </DashboardHeader>

      {showPracticeWise ? (
        <>
          <div style={{ margin: '1rem', padding: '1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.875rem', color: '#166534' }}>
            <strong>Customer Success Survey All PCSAT</strong> report: average <strong>RATING</strong> per <strong>PERSPECTIVE</strong>, grouped by <strong>Practice</strong>.
            <strong>Customer Success Survey Status</strong> report: <strong>Polled</strong> = count(CSAT SENT DATE), <strong>Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
            {csatCycleStartDateFormatted && <> Dates counted only when CSAT SENT DATE / CSAT RECEIVED DATE ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
          </div>
          <ResultsSummary>
            Showing {practiceWiseData.rows.length} practice{practiceWiseData.rows.length !== 1 ? 's' : ''}.
            <span style={{ marginLeft: '1rem', fontWeight: '600' }}>• Grouped by Practice</span>
          </ResultsSummary>
          <div style={{ 
            margin: '1rem', 
            padding: '1rem', 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#ff0000', border: '1px solid #ff0000', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt; 4 (Red - White Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', border: '1px solid #FFA500', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>4 to 4.49 (Orange - Black Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#c6efce', border: '1px solid #c6efce', borderRadius: '4px' }}></div>
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;= 4.5 (Green - Black Text)</span>
            </div>
          </div>
          {practiceWiseData.rows.length === 0 && (
            <div style={{ margin: '1rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
              No practice data found in the Customer Success Survey All PCSAT / Status reports.
            </div>
          )}
          <TableContainer>
            <Table role="table" aria-label="Practice wise Average CSAT Scores - Perspective Wise">
              <TableHeader>
                {showTrendAnalysis ? (
                  <>
                    <tr>
                      <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                        Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th rowSpan={2} onClick={() => handleSort('practice')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                        Practice {sortConfig.key === 'practice' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th rowSpan={2} onClick={() => handleSort('Polled')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                        Polled {sortConfig.key === 'Polled' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th rowSpan={2} onClick={() => handleSort('Responded')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                        Responded {sortConfig.key === 'Responded' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th colSpan={PERSPECTIVE_DISPLAY_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {acsatCycle || 'H2 2025'}
                      </Th>
                      <Th colSpan={PERSPECTIVE_DISPLAY_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#BDD7EE', color: '#000000' }}>
                        {trendHeaderLabel}
                      </Th>
                    </tr>
                    <tr>
                      {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => (
                        <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                          {normalizePerspectiveForDisplay(perspective)} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                      ))}
                      {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => (
                        <Th key={`trend-h-${perspective}`} style={{ textAlign: 'center', minWidth: '120px', backgroundColor: '#BDD7EE', color: '#000000' }}>
                          {getPracticeWiseTrendPerspectiveHeaderLabel(perspective)}
                        </Th>
                      ))}
                    </tr>
                  </>
                ) : (
                <tr>
                  <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                    Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('practice')} style={{ cursor: 'pointer' }}>
                    Practice {sortConfig.key === 'practice' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer' }}>
                    Polled {sortConfig.key === 'Polled' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer' }}>
                    Responded {sortConfig.key === 'Responded' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => (
                    <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                      {normalizePerspectiveForDisplay(perspective)} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                    </Th>
                  ))}
                </tr>
                )}
              </TableHeader>
              <tbody>
                {getSortedData(practiceWiseData.rows).map((row) => {
                  const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
                  const trendRow = practiceWiseTrendLookup[(row.practice || '').toString().trim().toLowerCase()] || null;
                  return (
                  <tr key={row.practice}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                      const displayVal = formatPerspectiveDisplay(getPerspectiveValue(row, perspective));
                      return (
                        <Td
                          key={perspective}
                          style={{
                            backgroundColor: hyphenForPerspectiveOnly ? 'transparent' : getCellColor(displayVal),
                            color: hyphenForPerspectiveOnly ? '#374151' : getTextColor(displayVal),
                            fontWeight: '600',
                            textAlign: 'center'
                          }}
                        >
                          {hyphenForPerspectiveOnly ? '-' : displayVal}
                        </Td>
                      );
                    })}
                    {showTrendAnalysis && PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                      const { display, color } = computePracticePerspectiveTrendDisplay(row, trendRow, perspective, hyphenForPerspectiveOnly);
                      return (
                        <Td
                          key={`trend-${row.practice}-${perspective}`}
                          style={{
                            textAlign: 'center',
                            fontWeight: '600',
                            color,
                            backgroundColor: '#f8fafc'
                          }}
                        >
                          {display}
                        </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {practiceWiseData.orgLevelRow && (() => {
                  const row = practiceWiseData.orgLevelRow;
                  const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
                  const trendRow = practiceWiseTrendData.orgLevelRow || null;
                  const orgStyle = { fontWeight: 'bold', backgroundColor: '#eff6ff' };
                  return (
                    <tr key="practice-avg-org-level">
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', ...orgStyle }}>{row.practice}</Td>
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Responded ?? 0}</Td>
                      {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                        const displayVal = formatPerspectiveDisplay(getPerspectiveValue(row, perspective));
                        return (
                          <Td
                            key={`org-${perspective}`}
                            style={{
                              ...orgStyle,
                              backgroundColor: hyphenForPerspectiveOnly ? '#eff6ff' : getCellColor(displayVal),
                              color: hyphenForPerspectiveOnly ? '#1e3a8a' : getTextColor(displayVal),
                              textAlign: 'center'
                            }}
                          >
                            {hyphenForPerspectiveOnly ? '-' : displayVal}
                          </Td>
                        );
                      })}
                      {showTrendAnalysis && PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                        const { display, color } = computePracticePerspectiveTrendDisplay(row, trendRow, perspective, hyphenForPerspectiveOnly);
                        return (
                          <Td
                            key={`org-trend-${perspective}`}
                            style={{
                              textAlign: 'center',
                              fontWeight: 600,
                              color,
                              backgroundColor: '#eff6ff'
                            }}
                          >
                            {display}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })()}
                {practiceWiseData.rows.length > 0 && practiceWisePerspectives.length === 0 && !showTrendAnalysis && (
                  <tr>
                    <Td colSpan={4 + PERSPECTIVE_DISPLAY_ORDER.length} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      No perspective columns found in Customer Success Survey All PCSAT report.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>

          {showTrendAnalysis && (
            <div style={{ margin: '2rem 1rem 1rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e40af' }}>
                  Practice wise Average CSAT Scores - Perspective Wise (Trend Analysis)
                </h2>
                {practiceWiseTrendData.rows.length > 0 && (
                  <DownloadButton
                    onClick={downloadPracticeWiseTrendData}
                    aria-label="Download practice-wise trend analysis data to Excel"
                    title="Download practice-wise trend analysis data to Excel"
                    style={{ flexShrink: 0 }}
                  >
                    <Download size={14} />
                    Download
                  </DownloadButton>
                )}
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#1d4ed8' }}>
                Data from <strong>{practiceWiseTrendData.sourceName || 'the selected comparison period'}</strong> uploaded in <strong>&quot;Upload data for trend analysis&quot;</strong>.
                <strong>Customer Success Survey All PCSAT report</strong>: average <strong>RATING</strong> per <strong>PERSPECTIVE</strong>, grouped by <strong>Practice</strong>.
                <strong>Customer Success Survey Status report</strong>: <strong>Polled</strong> = count(CSAT SENT DATE), <strong>Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
                {csatCycleStartDateFormatted && <> Dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
              </p>
              {practiceWiseTrendData.error && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {practiceWiseTrendData.error}
                </div>
              )}
              {practiceWiseTrendData.rows.length > 0 && (
                <TableContainer>
                  <Table role="table" aria-label="Practice wise Average CSAT Scores - Trend Analysis">
                    <TableHeader>
                      <tr>
                        <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                        <Th style={{ textAlign: 'left' }}>Practice</Th>
                        <Th style={{ textAlign: 'center' }}>Polled</Th>
                        <Th style={{ textAlign: 'center' }}>Responded</Th>
                        {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => (
                          <Th key={`trend-${perspective}`} style={{ textAlign: 'center' }}>
                            {normalizePerspectiveForDisplay(perspective)}
                          </Th>
                        ))}
                      </tr>
                    </TableHeader>
                    <tbody>
                      {practiceWiseTrendData.rows.map((row) => {
                        const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
                        return (
                          <tr key={`trend-${row.practice}`}>
                            <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                            <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                            {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                              const displayVal = formatPerspectiveDisplay(getPerspectiveValue(row, perspective));
                              return (
                                <Td
                                  key={`trend-${row.practice}-${perspective}`}
                                  style={{
                                    backgroundColor: hyphenForPerspectiveOnly ? 'transparent' : getCellColor(displayVal),
                                    color: hyphenForPerspectiveOnly ? '#374151' : getTextColor(displayVal),
                                    fontWeight: '600',
                                    textAlign: 'center'
                                  }}
                                >
                                  {hyphenForPerspectiveOnly ? '-' : displayVal}
                                </Td>
                              );
                            })}
                          </tr>
                        );
                      })}
                      {practiceWiseTrendData.orgLevelRow && (() => {
                        const row = practiceWiseTrendData.orgLevelRow;
                        const hyphenForPerspectiveOnly = (row.Responded ?? 0) === 0;
                        const orgStyle = { fontWeight: 'bold', backgroundColor: '#eff6ff' };
                        return (
                          <tr key="practice-avg-trend-org-level">
                            <Td style={{ textAlign: 'center', ...orgStyle }}>{row.sNo}</Td>
                            <Td style={{ textAlign: 'left', ...orgStyle }}>{row.practice}</Td>
                            <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Polled ?? 0}</Td>
                            <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Responded ?? 0}</Td>
                            {PERSPECTIVE_DISPLAY_ORDER.map((perspective) => {
                              const displayVal = formatPerspectiveDisplay(getPerspectiveValue(row, perspective));
                              return (
                                <Td
                                  key={`trend-org-${perspective}`}
                                  style={{
                                    ...orgStyle,
                                    backgroundColor: hyphenForPerspectiveOnly ? '#eff6ff' : getCellColor(displayVal),
                                    color: hyphenForPerspectiveOnly ? '#1e3a8a' : getTextColor(displayVal),
                                    textAlign: 'center'
                                  }}
                                >
                                  {hyphenForPerspectiveOnly ? '-' : displayVal}
                                </Td>
                              );
                            })}
                          </tr>
                        );
                      })()}
                    </tbody>
                  </Table>
                </TableContainer>
              )}
            </div>
          )}
        </>
      ) : (
      <>
      {!showBUWiseView && (
      <FilterContainer>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <FilterLabel htmlFor="customerNameSearchInput">Customer Name:</FilterLabel>
              <SearchInput
                id="customerNameSearchInput"
                type="text"
                placeholder="Search by customer name..."
                value={customerNameSearch}
                onChange={(e) => setCustomerNameSearch(e.target.value)}
              />
              {customerNameSearch && (
                <ClearFilterButton 
                  onClick={() => setCustomerNameSearch('')}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Clear
                </ClearFilterButton>
              )}
            </div>
            
            <div>
        <FilterLabel htmlFor="businessUnitFilterInput">Business Unit:</FilterLabel>
        <FilterSelect 
          id="businessUnitFilterInput"
          value={businessUnitFilter} 
          onChange={(e) => setBusinessUnitFilter(e.target.value)}
        >
          <option value="">All Business Units</option>
          {uniqueBusinessUnits.map(bu => (
            <option key={bu} value={bu}>{bu}</option>
          ))}
        </FilterSelect>
        {businessUnitFilter && (
                <ClearFilterButton 
                  onClick={() => setCustomerNameSearch('')}
                  style={{ marginLeft: '0.5rem' }}
                >
                  Clear
                </ClearFilterButton>
              )}
            </div>
          </div>
      </FilterContainer>
      )}

      <ResultsSummary>
        Showing {showBUWiseView ? buWiseData.length : filteredData.length} of {showBUWiseView ? buWiseData.length : processedData.length} records.
        {showBUWiseView && <span style={{ marginLeft: '1rem', fontWeight: '600' }}>• Grouped by Business Unit</span>}
        {showTop10 && <span style={{ marginLeft: '1rem', fontWeight: '600' }}>• Filtered to Top 10 accounts (TYPE OF ACCOUNT = "Top 10" or Top 10 = "Y" from second sheet)</span>}
      </ResultsSummary>

      {/* CSAT Cycle Date Filtering Summary */}
      {csatCycleStartDateFormatted && (
        <div style={{ 
          margin: '1rem', 
          padding: '1rem', 
          background: '#f0f9ff', 
          border: '1px solid #bae6fd', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#0c4a6e'
        }}>
          <strong>📅 CSAT Cycle Date Filtering Applied:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <p><strong>CSAT Cycle Start Date:</strong> {csatCycleStartDateFormatted}</p>
            <p><strong>Filtering Rule:</strong> Only CSAT SENT DATE and CSAT RECEIVED DATE values greater than or equal to {csatCycleStartDateFormatted} are included in the counts.</p>
            <p><strong>Impact:</strong> The "Number of CSAT Surveys Sent" and "Number of CSAT Surveys Received" columns now show filtered counts based on the selected cycle start date.</p>
            <p><strong>BU-wise Data:</strong> For Business Unit view, Polled (CSAT SENT DATE) and Responded (CSAT RECEIVED DATE) counts are aggregated across all customers within each Business Unit, maintaining the same date filtering.</p>
          </div>
        </div>
      )}

      {/* BU-wise Data Processing Summary */}
      {showBUWiseView && buWiseData.length > 0 && (
        <div style={{ 
          margin: '1rem', 
          padding: '1rem', 
          background: '#f0fdf4', 
          border: '1px solid #bbf7d0', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#166534'
        }}>
          <strong>🏢 BU-wise Data Processing:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <p><strong>Data Source:</strong> Raw Excel data from Customer Success Survey All PCSAT report sheet (perspectives/ratings); counts from Customer Success Survey Status report sheet</p>
            <p><strong>Grouping:</strong> Data is grouped by BUSINESS UNIT column</p>
            <p><strong>Perspective Calculations:</strong> Average rating for each perspective value is calculated from the RATING column</p>
            <p><strong># Accounts Polled:</strong> Count of unique CUSTOMER_ID from the Customer Success Survey Status report, grouped by BUSINESS UNIT</p>
            <p><strong>Number of Customer Stakeholders Polled:</strong> Count of unique RESPONDENT NAME from the Customer Success Survey Status report (CSAT SENT DATE ≥ CSAT cycle start), grouped by BUSINESS UNIT</p>
            <p><strong>Fully Managed / Co-Managed / Staff Augmentation:</strong> Count of CUSTOMER_ID / CUST_ID from the Customer Success Survey Status report, grouped by BUSINESS UNIT where ENGAGEMENT TYPE = &quot;Fully Managed&quot;, &quot;Co-Managed&quot;, or &quot;Staff Augmentation&quot; respectively</p>
            <p><strong>CSS Counts:</strong> Aggregated from account-wise processed data with date filtering</p>
          </div>
        </div>
      )}

      {/* Color Legend */}
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
        <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#ff0000', 
            border: '1px solid #ff0000',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt; 4 (Red - White Text)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FFA500', 
            border: '1px solid #FFA500',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>4 to 4.49 (Orange - Black Text)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#c6efce', 
            border: '1px solid #c6efce',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;= 4.5 (Green - Black Text)</span>
        </div>
      </div>



      <TableContainer>
        <Table role="table" aria-label={showBUWiseView ? "BU Wise Average CSAT Scores - Perspective Wise" : "Account/BU wise Average CSAT Scores - Perspective Wise"}>
          <TableHeader>
            {showBUWiseView ? (
              <>
                <tr>
                  <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                    Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                    Business Unit {sortConfig.key === 'businessUnit' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th colSpan={4 + perspectives.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {acsatCycle || 'H2 2025'}
                  </Th>
                  <Th colSpan={3} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    Number of Stakeholders by Project Engagement Type
                  </Th>
                  {showTrendAnalysis && (
                    <Th colSpan={perspectives.length} style={{ textAlign: 'center', minWidth: '100px', verticalAlign: 'middle', backgroundColor: '#BDD7EE', color: '#000000' }}>
                      {trendHeaderLabel}
                    </Th>
                  )}
                </tr>
                <tr>
                  <Th onClick={() => handleSort('customerCount')} style={{ cursor: 'pointer' }}>
                    # Accounts Polled {sortConfig.key === 'customerCount' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('stakeholdersPolledCount')} style={{ cursor: 'pointer' }}>
                    Number of Customer Stakeholders Polled {sortConfig.key === 'stakeholdersPolledCount' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer' }}>
                    #Polled {sortConfig.key === 'cssSentCount' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer' }}>
                    #Responded {sortConfig.key === 'cssReceivedCount' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  {perspectives.map((perspective) => (
                    <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                      {perspective} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                    </Th>
                  ))}
                  <Th onClick={() => handleSort('fullyManaged')} style={{ cursor: 'pointer' }}>
                    Fully Managed {sortConfig.key === 'fullyManaged' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('coManaged')} style={{ cursor: 'pointer' }}>
                    Co-Managed {sortConfig.key === 'coManaged' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('staffAugmentation')} style={{ cursor: 'pointer' }}>
                    Staff Augmentation {sortConfig.key === 'staffAugmentation' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  {showTrendAnalysis && perspectives.map((perspective) => (
                    <Th key={`trend-${perspective}`} style={{ textAlign: 'center', minWidth: '100px' }}>
                      {normalizePerspectiveForDisplay(perspective)}
                    </Th>
                  ))}
                </tr>
              </>
            ) : (
              <>
                {showTop10 && showTrendAnalysis ? (
                  <>
                <tr>
                  <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                    Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                    Business Unit {sortConfig.key === 'businessUnit' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                    Account Name {sortConfig.key === 'customerName' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th colSpan={2 + perspectives.length} style={{ textAlign: 'center', minWidth: '100px', verticalAlign: 'middle' }}>
                    {acsatCycle || 'H2 2025'}
                  </Th>
                  <Th colSpan={perspectives.length} style={{ textAlign: 'center', minWidth: '100px', verticalAlign: 'middle', backgroundColor: '#BDD7EE', color: '#000000' }}>
                    {trendHeaderLabel}
                  </Th>
                </tr>
                <tr>
                  <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer' }}>
                    #Polled {sortConfig.key === 'Polled' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer' }}>
                    #Responded {sortConfig.key === 'Responded' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                  </Th>
                  {perspectives.map((perspective) => (
                    <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                      {perspective} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                    </Th>
                  ))}
                  {perspectives.map((perspective) => (
                    <Th key={`trend-top10-${perspective}`} style={{ textAlign: 'center', minWidth: '100px' }}>
                      {normalizePerspectiveForDisplay(perspective)}
                    </Th>
                  ))}
                </tr>
                  </>
                ) : (
                  showTrendAnalysis ? (
                    <>
                      <tr>
                        <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                          Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                          Business Unit {sortConfig.key === 'businessUnit' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        <Th rowSpan={2} onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', verticalAlign: 'middle' }}>
                          Account Name {sortConfig.key === 'customerName' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        <Th colSpan={2 + perspectives.length + 1} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                          {acsatCycle || 'H2 2025'}
                        </Th>
                        <Th colSpan={perspectives.length} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#BDD7EE', color: '#000000' }}>
                          {trendHeaderLabel}
                        </Th>
                      </tr>
                      <tr>
                        <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer' }}>
                          #Polled {sortConfig.key === 'Polled' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer' }}>
                          #Responded {sortConfig.key === 'Responded' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        {perspectives.map((perspective) => (
                          <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                            {perspective} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                          </Th>
                        ))}
                        <Th onClick={() => handleSort('Total Avg CSAT Scores(Overall Experience)')} style={{ cursor: 'pointer' }}>
                          Total Avg CSAT Scores(Overall Experience) {sortConfig.key === 'Total Avg CSAT Scores(Overall Experience)' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                        {perspectives.map((p) => (
                          <Th key={`trend-${p}`} style={{ textAlign: 'center', minWidth: '140px' }}>
                            {getTrendPerspectiveHeaderLabel(p)}
                          </Th>
                        ))}
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                        Sr. No. {sortConfig.key === 'sNo' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                        Business Unit {sortConfig.key === 'businessUnit' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                        Account Name {sortConfig.key === 'customerName' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer' }}>
                        #Polled {sortConfig.key === 'Polled' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer' }}>
                        #Responded {sortConfig.key === 'Responded' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                      </Th>
                      {perspectives.map((perspective) => (
                        <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                          {perspective} {sortConfig.key === perspective && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                      ))}
                      {!showBUWiseView && !showTop10 && (
                        <Th onClick={() => handleSort('Total Avg CSAT Scores(Overall Experience)')} style={{ cursor: 'pointer' }}>
                          Total Avg CSAT Scores(Overall Experience) {sortConfig.key === 'Total Avg CSAT Scores(Overall Experience)' && sortConfig.direction === 'asc' ? '↑' : sortConfig.direction === 'desc' ? '↓' : ''}
                        </Th>
                      )}
                    </tr>
                  )
                ) }
              </>
            ) }
          </TableHeader>
          <tbody>
            {showBUWiseView ? (
              getSortedData(buWiseData).map((row) => {
                // Get trend data for this BU from trendAnalysisData (first file)
                const trendFileData = trendAnalysisData && trendAnalysisData.length > 0 ? trendAnalysisData[0] : null;
                const trendRow = trendFileData?.rows?.find(tr => {
                  const trBU = normalizeBusinessUnitDisplay(tr.businessUnit);
                  const rowBU = normalizeBusinessUnitDisplay(row.businessUnit);
                  return trBU === rowBU || 
                    (row.isOrgLevel && tr.isOrgLevel) ||
                    trBU?.toLowerCase() === rowBU?.toLowerCase();
                });
                
                return (
                <tr key={row.isCountRow ? 'count-row' : (row.businessUnit || `org-level`)} style={row.isOrgLevel ? { backgroundColor: '#E2E8F0', fontWeight: 'bold' } : row.isCountRow ? { backgroundColor: '#DBEAFE', fontWeight: 'bold' } : {}}>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{(row.isOrgLevel || row.isCountRow) ? '' : (isSeadAndPolledZero(row) ? '-' : row.sNo)}</Td>
                <Td style={{ textAlign: 'left', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{isSeadAndPolledZero(row) ? '-' : normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : row.customerCount)}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : (row.stakeholdersPolledCount ?? 0))}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : (row.cssSentCount || 0))}</Td>
                  <Td style={{ textAlign: row.isCountRow ? 'right' : 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? (row.cssReceivedCount || '') : (isSeadAndPolledZero(row) ? '-' : (row.cssReceivedCount || 0))}</Td>
                  {perspectives.map((perspective) => {
                    if (row.isCountRow) {
                      return (
                        <Td key={perspective} style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#DBEAFE', color: '#1e3a8a' }}>
                          {row[perspective] != null ? row[perspective] : ''}
                        </Td>
                      );
                    }
                    const displayVal = formatPerspectiveDisplay(row[perspective]);
                    return (
                    <Td 
                      key={perspective}
                      style={{
                        backgroundColor: isSeadAndPolledZero(row) ? 'transparent' : getCellColor(displayVal),
                        color: isSeadAndPolledZero(row) ? '#374151' : getTextColor(displayVal),
                        fontWeight: row.isOrgLevel ? 'bold' : '600',
                        textAlign: 'center'
                      }}
                    >
                      {isSeadAndPolledZero(row) ? '-' : displayVal}
                    </Td>
                    );
                  })}
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : (row.fullyManaged ?? 0))}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : (row.coManaged ?? 0))}</Td>
                  <Td style={{ textAlign: 'center', fontWeight: (row.isOrgLevel || row.isCountRow) ? 'bold' : 'normal' }}>{row.isCountRow ? '' : (isSeadAndPolledZero(row) ? '-' : (row.staffAugmentation ?? 0))}</Td>
                  {showTrendAnalysis && perspectives.map((perspective) => {
                    if (row.isCountRow) {
                      return <Td key={`trend-${perspective}`} style={{ textAlign: 'center', backgroundColor: '#DBEAFE' }}>{''}</Td>;
                    }
                    // Calculate trend: compare current value with trend analysis value
                    // When BU (e.g. SEAD) is not present in trend file, show hyphen (-)
                    const currentParsed = parseFloat(row[perspective]);
                    const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
                    let trendVal = null;
                    if (trendRow) {
                      trendVal = parseFloat(trendRow[perspective]);
                      if (isNaN(trendVal)) {
                        const altPerspectives = [
                          perspective === 'Quality of Delivery' ? 'Quality of deliverables' : null,
                          perspective === 'Quality of deliverables' ? 'Quality of Delivery' : null,
                          perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
                          perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
                        ].filter(Boolean);
                        for (const altP of altPerspectives) {
                          trendVal = parseFloat(trendRow[altP]);
                          if (!isNaN(trendVal)) break;
                        }
                      }
                    }
                    
                    let trendDisplay = '-';
                    let trendColor = '#1e293b';
                    // Show hyphen when BU not in trend file (e.g. SEAD not in Trend-Analysis-H12025) or invalid values
                    if (trendRow && !isSeadAndPolledZero(row)) {
                      if (isNaN(trendVal)) trendVal = 0;
                      const diff = currentVal - trendVal;
                      const diffRounded = Math.round(diff * 100) / 100;
                      if (diff > 0) {
                        trendDisplay = `(+${diffRounded.toFixed(2)}) ↑`;
                        trendColor = '#166534'; // Green for up arrow
                      } else if (diff < 0) {
                        trendDisplay = `(${diffRounded.toFixed(2)}) ↓`;
                        trendColor = '#dc2626'; // Red for down arrow
                      } else {
                        trendDisplay = '(0) −';
                        trendColor = '#6b7280';
                      }
                    }
                    
                    return (
                      <Td 
                        key={`trend-${perspective}`}
                        style={{
                          textAlign: 'center',
                          fontWeight: row.isOrgLevel ? 'bold' : '600',
                          color: trendColor,
                          backgroundColor: 'transparent'
                        }}
                      >
                        {trendDisplay}
                    </Td>
                    );
                  })}
                </tr>
                );
              })
            ) : (
              getSortedData(filteredData, showTop10).map((row) => {
                // Determine background color and text color based on row type
                const isSpecialRow = row.isTop10Accounts || row.isOtherAccount || row.isOverall;
                const isTop10CountRow = row.isTop10CountRow;
                const isOtherAccountCountRow = row.isOtherAccountCountRow;
                const isOverallCountRow = row.isOverallCountRow;
                let rowBgColor = '';
                if (row.isOtherAccount) {
                  rowBgColor = '#B4C6E7'; // Light Cornflower Blue 3
                } else if (row.isTop10Accounts) {
                  rowBgColor = '#FFEB9C'; // Light Yellow 2
                } else if (row.isOverall) {
                  rowBgColor = '#D9D2E9'; // Light Purple 3
                } else if (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) {
                  rowBgColor = '#DBEAFE'; // Light blue for Count rows
                }
                
                // Only show hyphen for perspective columns when SEAD with Polled=0
                // ALWAYS show Sr.No., Business Unit, Account Name, Polled, Responded
                const hyphenForPerspectiveOnly = isSeadAndPolledZero(row);
                return (
                  <tr key={row.customerId || `top10-accounts-${row.sNo}` || `other-account-${row.customerName}` || `overall-${row.customerName}` || (isTop10CountRow ? 'top10-count' : '') || (isOtherAccountCountRow ? 'other-count' : '') || (isOverallCountRow ? 'overall-count' : '')} style={(isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? { backgroundColor: rowBgColor, fontWeight: 'bold' } : {}}>
                    <Td style={{ textAlign: 'center', fontWeight: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'bold' : 'normal', backgroundColor: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent' }}>{(isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? '' : row.sNo}</Td>
                    <Td style={{ textAlign: 'left', fontWeight: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'bold' : 'normal', backgroundColor: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent' }}>{(isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? '' : (normalizeBusinessUnitDisplay(row.businessUnit) || 'N/A')}</Td>
                    <Td style={{ textAlign: 'left', fontWeight: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'bold' : 'normal', backgroundColor: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent' }}>{row.customerName || 'N/A'}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'bold' : 'normal', backgroundColor: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent' }}>{(isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? '' : (row['Polled'] || 0)}</Td>
                    <Td style={{ textAlign: (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'right' : 'center', fontWeight: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? 'bold' : 'normal', backgroundColor: (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent' }}>{(isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? (row['Responded'] || '') : (row['Responded'] || 0)}</Td>
                    {perspectives.map((perspective) => {
                      if (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) {
                        const countVal = row[perspective] != null ? row[perspective] : '';
                        return (
                          <Td key={perspective} style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: rowBgColor, color: '#1e3a8a' }}>
                            {countVal}
                          </Td>
                        );
                      }
                      const value = getPerspectiveValue(row, perspective);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                    <Td 
                      key={perspective}
                      style={{
                            backgroundColor: hyphenForPerspectiveOnly ? 'transparent' : getCellColor(displayVal),
                            color: hyphenForPerspectiveOnly ? '#374151' : getTextColor(displayVal),
                            fontWeight: isSpecialRow ? 'bold' : '600',
                        textAlign: 'center'
                      }}
                    >
                      {hyphenForPerspectiveOnly ? '-' : displayVal}
                    </Td>
                      );
                    })}
                    {!showTop10 && (
                      <Td 
                        style={{
                          backgroundColor: hyphenForPerspectiveOnly ? 'transparent' : getCellColor(formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)'])),
                          color: hyphenForPerspectiveOnly ? '#374151' : getTextColor(formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)'])),
                          fontWeight: isSpecialRow ? 'bold' : '600',
                          textAlign: 'center'
                        }}
                      >
                        {hyphenForPerspectiveOnly ? '-' : formatPerspectiveDisplay(row['Total Avg CSAT Scores(Overall Experience)'])}
                      </Td>
                    )}
                    {!showTop10 && showTrendAnalysis && perspectives.map((p) => {
                      // Trend analysis (H2 vs H1) per perspective: difference then arrow
                      const rowBU = normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase();
                      const rowId = normalizeCustomerIdKey(row.customerId ?? '');
                      const rowName = (row.customerName || '').toString().trim().toLowerCase();
                      const trendRow =
                        (rowId ? accountWiseTrendLookup[`id|||${rowId}|||${rowBU}`] : null) ||
                        (rowName ? accountWiseTrendLookup[`name|||${rowName}|||${rowBU}`] : null) ||
                        (rowName ? accountWiseTrendLookup[`nameOnly|||${rowName}`] : null) ||
                        null;

                      if (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) {
                        return <Td key={`trend-${p}`} style={{ textAlign: 'center', backgroundColor: rowBgColor, fontWeight: 'bold' }}>{''}</Td>;
                      }
                      if (!trendRow || hyphenForPerspectiveOnly) {
                        return <Td key={`trend-${p}`} style={{ textAlign: 'center', backgroundColor: rowBgColor || 'transparent' }}>-</Td>;
                      }

                      const currentParsed = parseFloat(getPerspectiveValue(row, p));
                      const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
                      let trendVal = parseFloat(trendRow[p]);
                      if (isNaN(trendVal)) {
                        const altPerspectives = [
                          p === 'Quality of Delivery' ? 'Quality of deliverables' : null,
                          p === 'Quality of deliverables' ? 'Quality of Delivery' : null,
                          p === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
                          p === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
                        ].filter(Boolean);
                        for (const altP of altPerspectives) {
                          const v = parseFloat(trendRow[altP]);
                          if (!isNaN(v)) { trendVal = v; break; }
                        }
                      }
                      if (isNaN(trendVal)) trendVal = 0;

                      const diff = Math.round((currentVal - trendVal) * 100) / 100;
                      let display = '(0) −';
                      let color = '#6b7280';
                      if (diff > 0) { display = `(+${diff.toFixed(2)}) ↑`; color = '#166534'; }
                      else if (diff < 0) { display = `(${diff.toFixed(2)}) ↓`; color = '#dc2626'; }
                      return (
                        <Td key={`trend-${p}`} style={{ textAlign: 'center', fontWeight: isSpecialRow ? 'bold' : 600, color, backgroundColor: rowBgColor || 'transparent' }}>
                          {display}
                        </Td>
                      );
                    })}
                {showTop10 && showTrendAnalysis && (() => {
                  // Get trend data for this account from trendAnalysisData (first file, Top 10 data)
                  const trendFileData = trendAnalysisData && trendAnalysisData.length > 0 ? trendAnalysisData[0] : null;
                  
                  // For special rows (Top 10 Accounts, Other Account, Overall), find matching trend row
                  let trendRow = null;
                  if (trendFileData?.hasTop10Data) {
                    if (row.isTop10Accounts) {
                      trendRow = trendFileData.top10GrandTotalRow;
                    } else if (row.isOtherAccount) {
                      trendRow = trendFileData.otherAccountsRow;
                    } else if (row.isOverall) {
                      trendRow = trendFileData.overallRow;
                    } else {
                      // For regular rows, match by account name and business unit
                      const rowAccount = row.customerName || '';
                      const rowBU = normalizeBusinessUnitDisplay(row.businessUnit);
                      trendRow = trendFileData.top10Rows?.find(tr => {
                        const trAccount = tr.accountName || '';
                        const trBU = normalizeBusinessUnitDisplay(tr.businessUnit);
                        return (trAccount === rowAccount || trAccount?.toLowerCase() === rowAccount?.toLowerCase()) &&
                               (trBU === rowBU || trBU?.toLowerCase() === rowBU?.toLowerCase());
                      });
                    }
                  }
                  
                  return perspectives.map((perspective) => {
                    if (isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) {
                      return <Td key={`trend-${perspective}`} style={{ textAlign: 'center', backgroundColor: rowBgColor, fontWeight: 'bold' }}>{''}</Td>;
                    }
                    const currentParsed = parseFloat(getPerspectiveValue(row, perspective));
                    const currentVal = isNaN(currentParsed) ? 0 : currentParsed;
                    let trendVal = null;
                    if (trendRow) {
                      trendVal = parseFloat(trendRow[perspective]);
                      if (isNaN(trendVal)) {
                        const altPerspectives = [
                          perspective === 'Quality of Delivery' ? 'Quality of deliverables' : null,
                          perspective === 'Quality of deliverables' ? 'Quality of Delivery' : null,
                          perspective === 'Risk Management & Responsiveness' ? 'Risk Management & Responsivenes' : null,
                          perspective === 'Risk Management & Responsivenes' ? 'Risk Management & Responsiveness' : null
                        ].filter(Boolean);
                        for (const altP of altPerspectives) {
                          trendVal = parseFloat(trendRow[altP]);
                          if (!isNaN(trendVal)) break;
                        }
                      }
                    }
                    
                    let trendDisplay = '-';
                    let trendColor = '#1e293b';
                    const bgColor = (isSpecialRow || isTop10CountRow || isOtherAccountCountRow || isOverallCountRow) ? rowBgColor : 'transparent';
                    
                    // Apply trend for all rows including Top 10 Accounts, Other Accounts, Overall (font color only by arrow, no cell/legend color)
                    if (!hyphenForPerspectiveOnly) {
                      if (isNaN(trendVal)) trendVal = 0;
                      const diff = currentVal - trendVal;
                      const diffRounded = Math.round(diff * 100) / 100;
                      if (diff > 0) {
                        trendDisplay = `(+${diffRounded.toFixed(2)}) ↑`;
                        trendColor = '#166534'; // Green for up arrow
                      } else if (diff < 0) {
                        trendDisplay = `(${diffRounded.toFixed(2)}) ↓`;
                        trendColor = '#dc2626'; // Red for down arrow
                      } else {
                        trendDisplay = '(0) −';
                        trendColor = '#6b7280';
                      }
                    }
                    
                    return (
                      <Td 
                        key={`trend-${perspective}`}
                        style={{
                          textAlign: 'center',
                          fontWeight: isSpecialRow ? 'bold' : '600',
                          color: trendColor,
                          backgroundColor: bgColor
                        }}
                      >
                        {trendDisplay}
                      </Td>
                    );
                  });
                })()}
              </tr>
                );
              })
            )}
            {(showBUWiseView ? buWiseData.length : filteredData.length) === 0 && (
              <tr>
                <Td colSpan={showBUWiseView ? (5 + perspectives.length + (showTrendAnalysis ? perspectives.length : 0)) : (showTop10 ? (6 + perspectives.length + (showTrendAnalysis ? perspectives.length : 0)) : (6 + perspectives.length + 1))}>
                  No data found. Please ensure your Excel file contains the required columns and data.
                </Td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Project Data: from main file (New_customer_feedback_analysis_New.xlsx) sheet "CSAT received Report" */}
      {showProjectData && (
        <div ref={projectDataSectionRef} style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>
              Project Data – Account / Project / Respondent (Perspective Wise)
            </h2>
            {projectDataFromMainFile.data.length > 0 && (
              <button
                onClick={downloadProjectDataFromMainFile}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                title="Download Project Data as Excel"
              >
                <Download size={16} />
                Download Excel
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            Data from the Customer Success Survey All PCSAT report. Columns: Sr. No., Account Name (CUSTOMER NAME), Project Name (PROJECT NAME), Respondent Name (RESPONDENT NAME), and perspective columns with RATING values.
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: '600' }}>Legend (RATING):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#b91c1c', marginRight: 4, verticalAlign: 'middle', border: '1px solid #991b1b', borderRadius: 2 }} /> 1 = Dark Red</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ef4444', marginRight: 4, verticalAlign: 'middle', border: '1px solid #dc2626', borderRadius: 2 }} /> 2 = Red</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 4, verticalAlign: 'middle', border: '1px solid #d97706', borderRadius: 2 }} /> 3 = Amber</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#eab308', marginRight: 4, verticalAlign: 'middle', border: '1px solid #ca8a04', borderRadius: 2 }} /> 4 = Yellow</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#22c55e', marginRight: 4, verticalAlign: 'middle', border: '1px solid #16a34a', borderRadius: 2 }} /> 5 = Green</span>
          </p>
          {projectDataFromMainFile.data.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                    <Th style={{ textAlign: 'left' }}>Account Name</Th>
                    <Th style={{ textAlign: 'left' }}>Project Name</Th>
                    <Th style={{ textAlign: 'left' }}>Respondent Name</Th>
                    {projectDataFromMainFile.perspectives.map(p => (
                      <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectDataFromMainFile.data.map((row, idx) => (
                    <tr key={`project-${idx}-${row.accountName}-${row.projectName}-${row.respondentName}`}>
                      <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.projectName}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.respondentName}</Td>
                      {projectDataFromMainFile.perspectives.map(p => {
                        const val = row[p] !== '' && row[p] != null ? Number(row[p]) : '-';
                        const leg = val !== '-' ? getRatingLegendForValue(val) : null;
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              backgroundColor: leg ? leg.bg : (val === '-' ? '#f9fafb' : 'transparent'),
                              color: leg ? leg.text : (val === '-' ? '#6b7280' : '#000')
                            }}
                          >
                            {val !== '-' ? val : '-'}
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
              No project data found in the Customer Success Survey All PCSAT report.
            </div>
          )}
        </div>
      )}

      {/* New dashboard: Project Data from trend file – same data as above, below "Project Data – Account / Project / Respondent (Perspective Wise)" */}
      {showProjectData && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e3a8a' }}>
              Project Data – From Trend File (Account / Project / Respondent – Perspective Wise)
            </h2>
            {projectDataWithPerspectives.data.length > 0 && (
              <button
                onClick={downloadProjectData}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                title="Download Project Data as Excel"
              >
                <Download size={16} />
                Download Excel
              </button>
            )}
          </div>
          <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#1e40af' }}>
            Data from <strong>{projectDataWithPerspectives.fileName || 'the selected comparison period'}</strong> uploaded in <strong>&quot;Upload data for trend analysis&quot;</strong>, from the <strong>Customer Success Survey All PCSAT report</strong>. Columns: Sr. No., Account Name (CUSTOMER NAME), Project Name (PROJECT NAME), Respondent Name (RESPONDENT NAME), and perspective columns with RATING values.
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: '#1e40af', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontWeight: '600' }}>Legend (RATING):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#b91c1c', marginRight: 4, verticalAlign: 'middle', border: '1px solid #991b1b', borderRadius: 2 }} /> 1 = Dark Red</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ef4444', marginRight: 4, verticalAlign: 'middle', border: '1px solid #dc2626', borderRadius: 2 }} /> 2 = Red</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 4, verticalAlign: 'middle', border: '1px solid #d97706', borderRadius: 2 }} /> 3 = Amber</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#eab308', marginRight: 4, verticalAlign: 'middle', border: '1px solid #ca8a04', borderRadius: 2 }} /> 4 = Yellow</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#22c55e', marginRight: 4, verticalAlign: 'middle', border: '1px solid #16a34a', borderRadius: 2 }} /> 5 = Green</span>
          </p>
          {projectDataWithPerspectives.data.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                    <Th style={{ textAlign: 'left' }}>Account Name</Th>
                    <Th style={{ textAlign: 'left' }}>Project Name</Th>
                    <Th style={{ textAlign: 'left' }}>Respondent Name</Th>
                    {projectDataWithPerspectives.perspectives.map(p => (
                      <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectDataWithPerspectives.data.map((row, idx) => (
                    <tr key={`project-trend-${idx}-${row.accountName}-${row.projectName}-${row.respondentName}`}>
                      <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.projectName}</Td>
                      <Td style={{ textAlign: 'left' }}>{row.respondentName}</Td>
                      {projectDataWithPerspectives.perspectives.map(p => {
                        const val = row[p] !== '' && row[p] != null ? Number(row[p]) : '-';
                        const leg = val !== '-' ? getRatingLegendForValue(val) : null;
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              backgroundColor: leg ? leg.bg : (val === '-' ? '#f9fafb' : 'transparent'),
                              color: leg ? leg.text : (val === '-' ? '#6b7280' : '#000')
                            }}
                          >
                            {val !== '-' ? val : '-'}
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
              No project data found in the comparison period fetched in <strong>&quot;Upload data for trend analysis&quot;</strong>.
            </div>
          )}
        </div>
      )}

      {/* Fully Managed – BU Wise Average CSAT Scores by Perspective: below BU Wise dashboard, ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT, from CSAT received Report */}
      {showBUWiseView && buWiseFullyManagedData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '8px', fontSize: '0.95rem', color: '#1E40AF', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Fully Managed – BU Wise Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT). # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT; Polled / Responded from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY); perspective columns = average RATING.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Fully Managed BU Wise - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...buWiseFullyManagedData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const addBUWiseExcelRow = (row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.Polled ?? row.cssSentCount ?? 0, row.Responded ?? row.cssReceivedCount ?? 0, ...buWiseFullyManagedData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) buWiseFullyManagedData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const cell = excelRow.getCell(5 + idx);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  };
                  buWiseFullyManagedData.data.forEach(addBUWiseExcelRow);
                  const fmOrgRow = buWiseFullyManagedData.orgLevelRow;
                  if (fmOrgRow) {
                    addBUWiseExcelRow(fmOrgRow);
                    const orgExcelRow = sheet.getRow(sheet.rowCount);
                    for (let c = 1; c <= 4; c++) {
                      orgExcelRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      orgExcelRow.getCell(c).font = { bold: true, color: { argb: 'FF000000' } };
                    }
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 10;
                  sheet.getColumn(4).width = 12;
                  buWiseFullyManagedData.perspectives.forEach((_, idx) => { sheet.getColumn(5 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Fully_Managed_BU_Wise_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Fully Managed BU Wise Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Fully Managed BU Wise table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Fully Managed BU Wise Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {buWiseFullyManagedData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {buWiseFullyManagedData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.businessUnit || `fm-bu-${row.sNo}`}>
                        {[...Array(4 + buWiseFullyManagedData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: i === 1 ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.businessUnit || `fm-bu-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {buWiseFullyManagedData.perspectives.map((p) => {
                      const value = getPerspectiveValue(row, p);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const orgRow = buWiseFullyManagedData.orgLevelRow;
                  const orgRowBg = '#E2E8F0';
                  return orgRow ? (
                    <tr key="fm-bu-org" style={{ fontWeight: '700', backgroundColor: orgRowBg }}>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.sNo}</Td>
                      <Td style={{ textAlign: 'left', backgroundColor: orgRowBg, fontWeight: '700' }}>{normalizeBusinessUnitDisplay(orgRow.businessUnit)}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Responded ?? 0}</Td>
                      {buWiseFullyManagedData.perspectives.map((p) => {
                        const value = getPerspectiveValue(orgRow, p);
                        const displayVal = formatPerspectiveDisplay(value);
                        return (
                        <Td
                          key={p}
                          style={{
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: getCellColor(displayVal),
                            color: getTextColor(displayVal)
                          }}
                        >
                          {displayVal}
                        </Td>
                        );
                      })}
                    </tr>
                  ) : null;
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Co-Managed – BU Wise Average CSAT Scores by Perspective: below Fully Managed BU Wise, ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT */}
      {showBUWiseView && buWiseCoManagedData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '0.95rem', color: '#166534', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Co-Managed – BU Wise Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by BUSINESS UNIT). # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by BUSINESS UNIT; Polled / Responded from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY); perspective columns = average RATING.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Co-Managed BU Wise - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...buWiseCoManagedData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const addCMBUWiseExcelRow = (row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.Polled ?? row.cssSentCount ?? 0, row.Responded ?? row.cssReceivedCount ?? 0, ...buWiseCoManagedData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) buWiseCoManagedData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const cell = excelRow.getCell(5 + idx);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  };
                  buWiseCoManagedData.data.forEach(addCMBUWiseExcelRow);
                  const cmOrgRow = buWiseCoManagedData.orgLevelRow;
                  if (cmOrgRow) {
                    addCMBUWiseExcelRow(cmOrgRow);
                    const orgExcelRow = sheet.getRow(sheet.rowCount);
                    for (let c = 1; c <= 4; c++) {
                      orgExcelRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      orgExcelRow.getCell(c).font = { bold: true, color: { argb: 'FF000000' } };
                    }
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 10;
                  sheet.getColumn(4).width = 12;
                  buWiseCoManagedData.perspectives.forEach((_, idx) => { sheet.getColumn(5 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Co_Managed_BU_Wise_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Co-Managed BU Wise Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Co-Managed BU Wise table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Co-Managed BU Wise Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {buWiseCoManagedData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {buWiseCoManagedData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.businessUnit || `cm-bu-${row.sNo}`}>
                        {[...Array(4 + buWiseCoManagedData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: i === 1 ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.businessUnit || `cm-bu-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {buWiseCoManagedData.perspectives.map((p) => {
                      const displayVal = formatPerspectiveDisplay(row[p]);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const orgRow = buWiseCoManagedData.orgLevelRow;
                  const orgRowBg = '#E2E8F0';
                  return orgRow ? (
                    <tr key="cm-bu-org" style={{ fontWeight: '700', backgroundColor: orgRowBg }}>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.sNo}</Td>
                      <Td style={{ textAlign: 'left', backgroundColor: orgRowBg, fontWeight: '700' }}>{normalizeBusinessUnitDisplay(orgRow.businessUnit)}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Responded ?? 0}</Td>
                      {buWiseCoManagedData.perspectives.map((p) => {
                        const value = getPerspectiveValue(orgRow, p);
                        const displayVal = formatPerspectiveDisplay(value);
                        return (
                        <Td
                          key={p}
                          style={{
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: getCellColor(displayVal),
                            color: getTextColor(displayVal)
                          }}
                        >
                          {displayVal}
                        </Td>
                        );
                      })}
                    </tr>
                  ) : null;
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Staff Augmentation – BU Wise Average CSAT Scores by Perspective: below Co-Managed BU Wise, ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT */}
      {showBUWiseView && buWiseStaffAugmentationData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', fontSize: '0.95rem', color: '#9A3412', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Staff Augmentation – BU Wise Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by BUSINESS UNIT). # Accounts Polled = count of unique CUSTOMER_ID from the Customer Success Survey Status report, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by BUSINESS UNIT; Polled / Responded from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY); perspective columns = average RATING.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Staff Augmentation BU Wise - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...buWiseStaffAugmentationData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const addSABUWiseExcelRow = (row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.Polled ?? row.cssSentCount ?? 0, row.Responded ?? row.cssReceivedCount ?? 0, ...buWiseStaffAugmentationData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) buWiseStaffAugmentationData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const cell = excelRow.getCell(5 + idx);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  };
                  buWiseStaffAugmentationData.data.forEach(addSABUWiseExcelRow);
                  const saOrgRow = buWiseStaffAugmentationData.orgLevelRow;
                  if (saOrgRow) {
                    addSABUWiseExcelRow(saOrgRow);
                    const orgExcelRow = sheet.getRow(sheet.rowCount);
                    for (let c = 1; c <= 4; c++) {
                      orgExcelRow.getCell(c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      orgExcelRow.getCell(c).font = { bold: true, color: { argb: 'FF000000' } };
                    }
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 10;
                  sheet.getColumn(4).width = 12;
                  buWiseStaffAugmentationData.perspectives.forEach((_, idx) => { sheet.getColumn(5 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Staff_Augmentation_BU_Wise_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Staff Augmentation BU Wise Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#EA580C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Staff Augmentation BU Wise table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Staff Augmentation BU Wise Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {buWiseStaffAugmentationData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {buWiseStaffAugmentationData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.businessUnit || `sa-bu-${row.sNo}`}>
                        {[...Array(4 + buWiseStaffAugmentationData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: i === 1 ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.businessUnit || `sa-bu-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {buWiseStaffAugmentationData.perspectives.map((p) => {
                      const value = getPerspectiveValue(row, p);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const orgRow = buWiseStaffAugmentationData.orgLevelRow;
                  const orgRowBg = '#E2E8F0';
                  return orgRow ? (
                    <tr key="sa-bu-org" style={{ fontWeight: '700', backgroundColor: orgRowBg }}>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.sNo}</Td>
                      <Td style={{ textAlign: 'left', backgroundColor: orgRowBg, fontWeight: '700' }}>{normalizeBusinessUnitDisplay(orgRow.businessUnit)}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', backgroundColor: orgRowBg, fontWeight: '700' }}>{orgRow.Responded ?? 0}</Td>
                      {buWiseStaffAugmentationData.perspectives.map((p) => {
                        const value = getPerspectiveValue(orgRow, p);
                        const displayVal = formatPerspectiveDisplay(value);
                        return (
                        <Td
                          key={p}
                          style={{
                            textAlign: 'center',
                            fontWeight: '700',
                            backgroundColor: getCellColor(displayVal),
                            color: getTextColor(displayVal)
                          }}
                        >
                          {displayVal}
                        </Td>
                        );
                      })}
                    </tr>
                  ) : null;
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Trend Analysis Section - BU Wise (from uploaded trend files) */}
      {showBUWiseView && showTrendAnalysis && (
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
            {trendAnalysisData && trendAnalysisData.length > 0 && trendAnalysisData[0]?.hasData && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const workbook = new ExcelJS.Workbook();
                    
                    trendAnalysisData.forEach((fileData, fileIdx) => {
                      if (!fileData.hasData) return;
                      
                      const sheetName = `Trend Analysis ${fileIdx + 1}`.substring(0, 31);
                      const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
                      
                      const headers = ['Business Unit', '#Polled', '#Responded', ...(fileData.perspectives || []).map(p => normalizePerspectiveForDisplay(p))];
                      sheet.addRow(headers);
                      
                      const headerRow = sheet.getRow(1);
                      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } };
                      headerRow.height = 30;
                      headerRow.eachCell((cell) => { 
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; 
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      });
                      
                      fileData.rows.forEach((row) => {
                        const rowData = [
                          normalizeBusinessUnitDisplay(row.businessUnit),
                          row.polled,
                          row.responded,
                          ...(fileData.perspectives || []).map(p => row[p] !== '-' ? row[p] : '-')
                        ];
                        const excelRow = sheet.addRow(rowData);
                        
                        excelRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelRow.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
                        
                        if (row.isOrgLevel) {
                          excelRow.font = { bold: true };
                          excelRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };
                        }
                        
                        excelRow.eachCell((cell) => {
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                        
                        (fileData.perspectives || []).forEach((p, pIdx) => {
                          const val = row[p];
                          const numVal = parseFloat(val);
                          const cell = excelRow.getCell(4 + pIdx);
                          cell.alignment = { horizontal: 'center', vertical: 'middle' };
                          cell.value = val === '-' ? val : (typeof val === 'number' ? val.toFixed(2) : String(val));
                          if (val !== '-' && !isNaN(numVal)) {
                            if (numVal < 4) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                            } else if (numVal >= 4 && numVal < 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            } else if (numVal >= 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            }
                          }
                        });
                      });
                      
                      sheet.getColumn(1).width = 20;
                      sheet.getColumn(2).width = 10;
                      sheet.getColumn(3).width = 12;
                      (fileData.perspectives || []).forEach((_, idx) => { sheet.getColumn(4 + idx).width = 18; });
                      sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                    });
                    
                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `BU_Wise_Trend_Analysis_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Trend Analysis Excel export error:', err);
                    alert('Failed to export Excel. Please try again.');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.15)'; }}
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
            trendAnalysisData.map((fileData, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderBottom: 'none', 
                  borderRadius: idx === 0 ? '0' : '8px 8px 0 0',
                  fontWeight: 600,
                  color: '#1e3a5f',
                  fontSize: '0.95rem'
                }}>
                  {fileData.saveName}
                </div>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ textAlign: 'left', minWidth: '150px' }}>Business Unit</Th>
                        <Th style={{ textAlign: 'center', minWidth: '80px' }}>#Polled</Th>
                        <Th style={{ textAlign: 'center', minWidth: '90px' }}>#Responded</Th>
                        {fileData.perspectives && fileData.perspectives.map((p, pi) => (
                          <Th key={pi} style={{ textAlign: 'center', minWidth: '120px' }}>{normalizePerspectiveForDisplay(p)}</Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.hasData ? fileData.rows.map((row, ri) => (
                        <tr key={ri} style={row.isOrgLevel ? { fontWeight: 600, backgroundColor: '#e0f2fe' } : {}}>
                          <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                          <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                          {fileData.perspectives && fileData.perspectives.map((p, pi) => {
                            const val = row[p];
                            const numVal = parseFloat(val);
                            let bgColor = 'transparent';
                            let textColor = '#1e293b';
                            if (val !== '-' && !isNaN(numVal)) {
                              if (numVal < 4) {
                                bgColor = '#FF0000';
                                textColor = '#FFFFFF';
                              } else if (numVal >= 4 && numVal < 4.5) {
                                bgColor = '#FFA500';
                                textColor = '#000000';
                              } else if (numVal >= 4.5) {
                                bgColor = '#C6EFCE';
                                textColor = '#000000';
                              }
                            }
                            return (
                              <Td key={pi} style={{ 
                                textAlign: 'center', 
                                backgroundColor: bgColor, 
                                color: textColor,
                                fontWeight: val !== '-' && !isNaN(numVal) ? 600 : 'normal'
                              }}>
                                {val === '-' ? val : (typeof val === 'number' ? val.toFixed(2) : val)}
                              </Td>
                            );
                          })}
                        </tr>
                      )) : (
                        <tr>
                          <Td colSpan={3 + (fileData.perspectives?.length || 0)} style={{ textAlign: 'center', color: '#94a3b8' }}>
                            No Customer Success Survey Status report sheet or no rows after date filter.
                          </Td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            ))
          )}
        </div>
      )}

      {/* Trend Analysis Section - Account-wise (H1 2025 reference from uploaded Trend-Analysis-H12025.xlsx) */}
      {!showBUWiseView && !showTop10 && showTrendAnalysis && (
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
              Trend Analysis ({accountWiseTrendSentReceived?.sourceName || 'reference'})
            </span>
            {accountWiseTrendSentReceived?.hasData && (
              <button
                type="button"
                onClick={downloadAccountWiseTrendH1Reference}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.15)'; }}
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
            {accountWiseTrendSentReceived?.error ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                {accountWiseTrendSentReceived.error}
              </div>
            ) : !accountWiseTrendSentReceived?.hasData ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No rows found in Customer Success Survey Status report.
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'left' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'left' }}>Account Name</Th>
                      <Th style={{ textAlign: 'center' }}>Polled</Th>
                      <Th style={{ textAlign: 'center' }}>Responded</Th>
                        {accountWiseTrendSentReceived.perspectives.map((p) => (
                          <Th key={p} style={{ textAlign: 'center', minWidth: '140px' }}>{normalizePerspectiveForDisplay(p)}</Th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {accountWiseTrendSentReceived.rows.map((r, idx) => (
                      <tr key={`${r.accountName}|||${r.businessUnit}|||${idx}`}>
                        <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(r.businessUnit)}</Td>
                        <Td style={{ textAlign: 'left' }}>{r.accountName}</Td>
                        <Td style={{ textAlign: 'center' }}>{r.polled}</Td>
                        <Td style={{ textAlign: 'center' }}>{r.responded}</Td>
                          {accountWiseTrendSentReceived.perspectives.map((p) => {
                            const displayVal = formatPerspectiveDisplay(r[p]);
                            return (
                              <Td
                                key={p}
                                style={{
                                  textAlign: 'center',
                                  backgroundColor: getCellColor(displayVal),
                                  color: getTextColor(displayVal),
                                  fontWeight: displayVal !== '-' ? 600 : 'normal'
                                }}
                              >
                                {displayVal}
                              </Td>
                            );
                          })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      )}

      {/* Trend Analysis Section - Top 10 Accounts (from uploaded trend files, where TYPE OF ACCOUNT = Top 10) */}
      {showTop10 && showTrendAnalysis && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ 
            padding: '1rem 1.25rem', 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
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
            {trendAnalysisData && trendAnalysisData.length > 0 && trendAnalysisData[0]?.hasTop10Data && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const workbook = new ExcelJS.Workbook();
                    
                    trendAnalysisData.forEach((fileData, fileIdx) => {
                      if (!fileData.hasTop10Data) return;
                      
                      const sheetName = `Top 10 Trend Analysis ${fileIdx + 1}`.substring(0, 31);
                      const sheet = workbook.addWorksheet(sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
                      
                      // Headers with Polled and Responded columns after Account Name
                      const headers = ['Sr.No.', 'Business Unit', 'Account Name', 'Polled', 'Responded', ...(fileData.top10Perspectives || []).map(p => normalizePerspectiveForDisplay(p))];
                      sheet.addRow(headers);
                      
                      const headerRow = sheet.getRow(1);
                      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } };
                      headerRow.height = 30;
                      headerRow.eachCell((cell) => { 
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; 
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      });
                      
                      fileData.top10Rows.forEach((row, ri) => {
                        const rowData = [
                          ri + 1,
                          normalizeBusinessUnitDisplay(row.businessUnit),
                          row.accountName || '-',
                          row.polled || 0,
                          row.responded || 0,
                          ...(fileData.top10Perspectives || []).map(p => row[p] !== '-' ? row[p] : '-')
                        ];
                        const excelRow = sheet.addRow(rowData);
                        
                        excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
                        
                        excelRow.eachCell((cell) => {
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                        
                        (fileData.top10Perspectives || []).forEach((p, pIdx) => {
                          const val = row[p];
                          const numVal = parseFloat(val);
                          const cell = excelRow.getCell(6 + pIdx); // Column 6 onwards for perspectives (after Sr.No, BU, Account, Polled, Responded)
                          cell.alignment = { horizontal: 'center', vertical: 'middle' };
                          
                          if (val !== '-' && !isNaN(numVal)) {
                            if (numVal < 4) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                            } else if (numVal >= 4 && numVal < 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            } else if (numVal >= 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            }
                          }
                        });
                      });
                      
                      // Add Top 10 Accounts grand total row (with Polled and Responded columns)
                      if (fileData.top10GrandTotalRow) {
                        const gtRow = fileData.top10GrandTotalRow;
                        const grandRowData = [
                          '',
                          gtRow.businessUnit || '',
                          gtRow.accountName || '',
                          gtRow.polled || 0,
                          gtRow.responded || 0,
                          ...(fileData.top10Perspectives || []).map(p => gtRow[p] !== '-' ? gtRow[p] : '-')
                        ];
                        const excelGrandRow = sheet.addRow(grandRowData);
                        excelGrandRow.font = { bold: true };
                        excelGrandRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
                        excelGrandRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelGrandRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelGrandRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelGrandRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelGrandRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelGrandRow.eachCell((cell) => {
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                        
                        (fileData.top10Perspectives || []).forEach((p, pIdx) => {
                          const val = gtRow[p];
                          const numVal = parseFloat(val);
                          const cell = excelGrandRow.getCell(6 + pIdx);
                          cell.alignment = { horizontal: 'center', vertical: 'middle' };
                          
                          if (val !== '-' && !isNaN(numVal)) {
                            if (numVal < 4) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                            } else if (numVal >= 4 && numVal < 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            } else if (numVal >= 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            }
                          }
                        });
                      }
                      
                      // Add Other Accounts row (grand total where TYPE OF ACCOUNT = Blank/Empty/N/A)
                      if (fileData.otherAccountsRow) {
                        const oaRow = fileData.otherAccountsRow;
                        const oaRowData = [
                          '',
                          oaRow.businessUnit || '',
                          oaRow.accountName || '',
                          oaRow.polled || 0,
                          oaRow.responded || 0,
                          ...(fileData.top10Perspectives || []).map(p => oaRow[p] !== '-' ? oaRow[p] : '-')
                        ];
                        const excelOARow = sheet.addRow(oaRowData);
                        excelOARow.font = { bold: true };
                        excelOARow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB4C6E7' } };
                        excelOARow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOARow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelOARow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelOARow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOARow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOARow.eachCell((cell) => {
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                        
                        (fileData.top10Perspectives || []).forEach((p, pIdx) => {
                          const val = oaRow[p];
                          const numVal = parseFloat(val);
                          const cell = excelOARow.getCell(6 + pIdx); // Column 6 onwards (after Sr.No, BU, Account, Polled, Responded)
                          cell.alignment = { horizontal: 'center', vertical: 'middle' };
                          
                          if (val !== '-' && !isNaN(numVal)) {
                            if (numVal < 4) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                            } else if (numVal >= 4 && numVal < 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            } else if (numVal >= 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            }
                          }
                        });
                      }
                      
                      // Add Overall row (grand total for all rows) - WITH Polled and Responded columns
                      if (fileData.overallRow) {
                        const ovRow = fileData.overallRow;
                        const ovRowData = [
                          '',
                          ovRow.businessUnit || '',
                          ovRow.accountName || '',
                          ovRow.polled || 0,
                          ovRow.responded || 0,
                          ...(fileData.top10Perspectives || []).map(p => ovRow[p] !== '-' ? ovRow[p] : '-')
                        ];
                        const excelOvRow = sheet.addRow(ovRowData);
                        excelOvRow.font = { bold: true };
                        excelOvRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D2E9' } };
                        excelOvRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOvRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelOvRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle' };
                        excelOvRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOvRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle' };
                        excelOvRow.eachCell((cell) => {
                          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        });
                        
                        (fileData.top10Perspectives || []).forEach((p, pIdx) => {
                          const val = ovRow[p];
                          const numVal = parseFloat(val);
                          const cell = excelOvRow.getCell(6 + pIdx); // Column 6 onwards (after Sr.No, BU, Account, Polled, Responded)
                          cell.alignment = { horizontal: 'center', vertical: 'middle' };
                          
                          if (val !== '-' && !isNaN(numVal)) {
                            if (numVal < 4) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                            } else if (numVal >= 4 && numVal < 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            } else if (numVal >= 4.5) {
                              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                              cell.font = { color: { argb: 'FF000000' }, bold: true };
                            }
                          }
                        });
                      }
                      
                      sheet.getColumn(1).width = 8;
                      sheet.getColumn(2).width = 20;
                      sheet.getColumn(3).width = 28;
                      sheet.getColumn(4).width = 10; // Polled column
                      sheet.getColumn(5).width = 12; // Responded column
                      (fileData.top10Perspectives || []).forEach((_, idx) => { sheet.getColumn(6 + idx).width = 18; });
                      sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                    });
                    
                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Top10_Trend_Analysis_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error('Top 10 Trend Analysis Excel export error:', err);
                    alert('Failed to export Excel. Please try again.');
                  }
                }}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                onMouseOut={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.15)'; }}
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
            trendAnalysisData.map((fileData, idx) => (
              <div key={idx} style={{ marginBottom: '1.5rem' }}>
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderBottom: 'none', 
                  borderRadius: idx === 0 ? '0' : '8px 8px 0 0',
                  fontWeight: 600,
                  color: '#1e3a5f',
                  fontSize: '0.95rem'
                }}>
                  {fileData.saveName}
                </div>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <Th style={{ textAlign: 'center', minWidth: '60px' }}>Sr.No.</Th>
                        <Th style={{ textAlign: 'left', minWidth: '120px' }}>Business Unit</Th>
                        <Th style={{ textAlign: 'left', minWidth: '200px' }}>Account Name</Th>
                        <Th style={{ textAlign: 'center', minWidth: '80px' }}>#Polled</Th>
                        <Th style={{ textAlign: 'center', minWidth: '100px' }}>#Responded</Th>
                        {fileData.top10Perspectives && fileData.top10Perspectives.map((p, pi) => (
                          <Th key={pi} style={{ textAlign: 'center', minWidth: '120px' }}>{normalizePerspectiveForDisplay(p)}</Th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fileData.hasTop10Data ? (
                        <>
                          {fileData.top10Rows.map((row, ri) => (
                            <tr key={ri}>
                              <Td style={{ textAlign: 'center' }}>{ri + 1}</Td>
                              <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                              <Td style={{ textAlign: 'left' }}>{row.accountName || '-'}</Td>
                              <Td style={{ textAlign: 'center' }}>{row.polled || 0}</Td>
                              <Td style={{ textAlign: 'center' }}>{row.responded || 0}</Td>
                              {fileData.top10Perspectives && fileData.top10Perspectives.map((p, pi) => {
                                const val = row[p];
                                const numVal = parseFloat(val);
                                let bgColor = 'transparent';
                                let textColor = '#1e293b';
                                if (val !== '-' && !isNaN(numVal)) {
                                  if (numVal < 4) {
                                    bgColor = '#FF0000';
                                    textColor = '#FFFFFF';
                                  } else if (numVal >= 4 && numVal < 4.5) {
                                    bgColor = '#FFA500';
                                    textColor = '#000000';
                                  } else if (numVal >= 4.5) {
                                    bgColor = '#C6EFCE';
                                    textColor = '#000000';
                                  }
                                }
                                return (
                                  <Td key={pi} style={{ 
                                    textAlign: 'center', 
                                    backgroundColor: bgColor, 
                                    color: textColor,
                                    fontWeight: val !== '-' && !isNaN(numVal) ? 600 : 'normal'
                                  }}>
                                    {val}
                                  </Td>
                                );
                              })}
                            </tr>
                          ))}
                          {fileData.top10GrandTotalRow && (
                            <tr style={{ fontWeight: 600, backgroundColor: '#FFEB9C' }}>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}></Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.top10GrandTotalRow.businessUnit || ''}</Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.top10GrandTotalRow.accountName}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.top10GrandTotalRow.polled || 0}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.top10GrandTotalRow.responded || 0}</Td>
                              {fileData.top10Perspectives && fileData.top10Perspectives.map((p, pi) => {
                                const val = fileData.top10GrandTotalRow[p];
                                const numVal = parseFloat(val);
                                let bgColor = '#FFEB9C';
                                let textColor = '#1e293b';
                                if (val !== '-' && !isNaN(numVal)) {
                                  if (numVal < 4) {
                                    bgColor = '#FF0000';
                                    textColor = '#FFFFFF';
                                  } else if (numVal >= 4 && numVal < 4.5) {
                                    bgColor = '#FFA500';
                                    textColor = '#000000';
                                  } else if (numVal >= 4.5) {
                                    bgColor = '#C6EFCE';
                                    textColor = '#000000';
                                  }
                                }
                                return (
                                  <Td key={pi} style={{ 
                                    textAlign: 'center', 
                                    backgroundColor: bgColor, 
                                    color: textColor,
                                    fontWeight: 700
                                  }}>
                                    {val}
                                  </Td>
                                );
                              })}
                            </tr>
                          )}
                          {fileData.otherAccountsRow && (
                            <tr style={{ fontWeight: 600, backgroundColor: '#B4C6E7' }}>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}></Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.otherAccountsRow.businessUnit || ''}</Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.otherAccountsRow.accountName}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.otherAccountsRow.polled || 0}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.otherAccountsRow.responded || 0}</Td>
                              {fileData.top10Perspectives && fileData.top10Perspectives.map((p, pi) => {
                                const val = fileData.otherAccountsRow[p];
                                const numVal = parseFloat(val);
                                let bgColor = '#B4C6E7';
                                let textColor = '#1e293b';
                                if (val !== '-' && !isNaN(numVal)) {
                                  if (numVal < 4) {
                                    bgColor = '#FF0000';
                                    textColor = '#FFFFFF';
                                  } else if (numVal >= 4 && numVal < 4.5) {
                                    bgColor = '#FFA500';
                                    textColor = '#000000';
                                  } else if (numVal >= 4.5) {
                                    bgColor = '#C6EFCE';
                                    textColor = '#000000';
                                  }
                                }
                                return (
                                  <Td key={pi} style={{ 
                                    textAlign: 'center', 
                                    backgroundColor: bgColor, 
                                    color: textColor,
                                    fontWeight: 700
                                  }}>
                                    {val}
                                  </Td>
                                );
                              })}
                            </tr>
                          )}
                          {fileData.overallRow && (
                            <tr style={{ fontWeight: 600, backgroundColor: '#D9D2E9' }}>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}></Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.overallRow.businessUnit || ''}</Td>
                              <Td style={{ textAlign: 'left', fontWeight: 700 }}>{fileData.overallRow.accountName}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.overallRow.polled || 0}</Td>
                              <Td style={{ textAlign: 'center', fontWeight: 700 }}>{fileData.overallRow.responded || 0}</Td>
                              {fileData.top10Perspectives && fileData.top10Perspectives.map((p, pi) => {
                                const val = fileData.overallRow[p];
                                const numVal = parseFloat(val);
                                let bgColor = '#D9D2E9';
                                let textColor = '#1e293b';
                                if (val !== '-' && !isNaN(numVal)) {
                                  if (numVal < 4) {
                                    bgColor = '#FF0000';
                                    textColor = '#FFFFFF';
                                  } else if (numVal >= 4 && numVal < 4.5) {
                                    bgColor = '#FFA500';
                                    textColor = '#000000';
                                  } else if (numVal >= 4.5) {
                                    bgColor = '#C6EFCE';
                                    textColor = '#000000';
                                  }
                                }
                                return (
                                  <Td key={pi} style={{ 
                                    textAlign: 'center', 
                                    backgroundColor: bgColor, 
                                    color: textColor,
                                    fontWeight: 700
                                  }}>
                                    {val}
                                  </Td>
                                );
                              })}
                            </tr>
                          )}
                        </>
                      ) : (
                        <tr>
                          <Td colSpan={3 + (fileData.top10Perspectives?.length || 0)} style={{ textAlign: 'center', color: '#94a3b8' }}>
                            No Top 10 account data found in Customer Success Survey Status report sheet (TYPE OF ACCOUNT = &quot;Top 10&quot;).
                          </Td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </div>
            ))
          )}
        </div>
      )}

      {/* Fully Managed - Average CSAT Scores by Perspective (from CSAT received Report), account-wise only; Polled/Responded from second sheet with date >= CSAT cycle start */}
      {!showBUWiseView && !showTop10 && fullyManagedAccountData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '8px', fontSize: '0.95rem', color: '#1E40AF', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Fully Managed – Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, grouped by CUSTOMER_ID / CUST_ID). Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY).</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Fully Managed - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', 'Account Name', '#Polled', '#Responded', ...fullyManagedAccountData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const baseCols = 5;
                  fullyManagedAccountData.data.forEach((row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.accountName, row.Polled ?? 0, row.Responded ?? 0, ...fullyManagedAccountData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) fullyManagedAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const colIndex = baseCols + idx + 1;
                      const cell = excelRow.getCell(colIndex);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  });
                  const fmGrandTotal = fullyManagedAccountData.grandTotal;
                  if (fmGrandTotal) {
                    const grandRowData = [fmGrandTotal.sNo, fmGrandTotal.businessUnit, fmGrandTotal.accountName, fmGrandTotal.Polled ?? 0, fmGrandTotal.Responded ?? 0, ...fullyManagedAccountData.perspectives.map(p => formatPerspectiveDisplay(fmGrandTotal[p]))];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.font = { bold: true };
                    grandRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                    grandRow.eachCell((cell, colNumber) => {
                      cell.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle', wrapText: true };
                    });
                    fullyManagedAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(fmGrandTotal[p]);
                      const cell = grandRow.getCell(baseCols + idx + 1);
                      cell.value = val;
                      if (val !== '-' && val !== '－') {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                          else if (num >= 4 && num < 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                          else if (num >= 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        }
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  fullyManagedAccountData.perspectives.forEach((_, idx) => { sheet.getColumn(6 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Fully_Managed_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Fully Managed Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Fully Managed table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Fully Managed Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {fullyManagedAccountData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {fullyManagedAccountData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.customerId || `fm-${row.sNo}`}>
                        {[...Array(5 + fullyManagedAccountData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: (i === 1 || i === 2) ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.customerId || `fm-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {fullyManagedAccountData.perspectives.map((p) => {
                      const value = getPerspectiveValue(row, p);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const fmGrandTotal = fullyManagedAccountData.grandTotal;
                  if (!fmGrandTotal) return null;
                  return (
                    <tr key="fm-account-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{fmGrandTotal.sNo}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{fmGrandTotal.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{fmGrandTotal.accountName}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{fmGrandTotal.Polled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{fmGrandTotal.Responded}</Td>
                      {fullyManagedAccountData.perspectives.map((p) => {
                        const displayVal = formatPerspectiveDisplay(fmGrandTotal[p]);
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              fontWeight: '700',
                              backgroundColor: getCellColor(displayVal),
                              color: getTextColor(displayVal)
                            }}
                          >
                            {displayVal}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Co-Managed - Average CSAT Scores by Perspective (from CSAT received Report), account-wise only; Polled/Responded from second sheet with date >= CSAT cycle start */}
      {!showBUWiseView && !showTop10 && coManagedAccountData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '0.95rem', color: '#166534', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Co-Managed – Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, grouped by CUSTOMER_ID / CUST_ID). Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY).</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Co-Managed - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', 'Account Name', '#Polled', '#Responded', ...coManagedAccountData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const baseCols = 5;
                  coManagedAccountData.data.forEach((row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.accountName, row.Polled ?? 0, row.Responded ?? 0, ...coManagedAccountData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) coManagedAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const colIndex = baseCols + idx + 1;
                      const cell = excelRow.getCell(colIndex);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  });
                  const cmGrandTotal = coManagedAccountData.grandTotal;
                  if (cmGrandTotal) {
                    const grandRowData = [cmGrandTotal.sNo, cmGrandTotal.businessUnit, cmGrandTotal.accountName, cmGrandTotal.Polled ?? 0, cmGrandTotal.Responded ?? 0, ...coManagedAccountData.perspectives.map(p => formatPerspectiveDisplay(cmGrandTotal[p]))];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.font = { bold: true };
                    grandRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                    grandRow.eachCell((cell, colNumber) => {
                      cell.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle', wrapText: true };
                    });
                    coManagedAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(cmGrandTotal[p]);
                      const cell = grandRow.getCell(baseCols + idx + 1);
                      cell.value = val;
                      if (val !== '-' && val !== '－') {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                          else if (num >= 4 && num < 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                          else if (num >= 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        }
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  coManagedAccountData.perspectives.forEach((_, idx) => { sheet.getColumn(6 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Co_Managed_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Co-Managed Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Co-Managed table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Co-Managed Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {coManagedAccountData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {coManagedAccountData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.customerId || `cm-${row.sNo}`}>
                        {[...Array(5 + coManagedAccountData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: (i === 1 || i === 2) ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.customerId || `cm-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {coManagedAccountData.perspectives.map((p) => {
                      const value = getPerspectiveValue(row, p);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const cmGrandTotal = coManagedAccountData.grandTotal;
                  if (!cmGrandTotal) return null;
                  return (
                    <tr key="cm-account-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{cmGrandTotal.sNo}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{cmGrandTotal.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{cmGrandTotal.accountName}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{cmGrandTotal.Polled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{cmGrandTotal.Responded}</Td>
                      {coManagedAccountData.perspectives.map((p) => {
                        const displayVal = formatPerspectiveDisplay(cmGrandTotal[p]);
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              fontWeight: '700',
                              backgroundColor: getCellColor(displayVal),
                              color: getTextColor(displayVal)
                            }}
                          >
                            {displayVal}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Staff Augmentation - Average CSAT Scores by Perspective (from CSAT received Report), account-wise only; Polled/Responded from second sheet with date >= CSAT cycle start */}
      {!showBUWiseView && !showTop10 && staffAugmentationAccountData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#FFF7ED', border: '1px solid #FDBA74', borderRadius: '8px', fontSize: '0.95rem', color: '#9A3412', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Staff Augmentation – Average CSAT Scores by Perspective (from the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, grouped by CUSTOMER_ID / CUST_ID). Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY).</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Staff Augmentation - Perspective Wise', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', 'Account Name', '#Polled', '#Responded', ...staffAugmentationAccountData.perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => { cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; });
                  const baseCols = 5;
                  staffAugmentationAccountData.data.forEach((row) => {
                    const hyphenRow = isSeadAndPolledZero(row);
                    const rowData = hyphenRow
                      ? headers.map(() => '-')
                      : [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.accountName, row.Polled ?? 0, row.Responded ?? 0, ...staffAugmentationAccountData.perspectives.map(p => formatPerspectiveDisplay(getPerspectiveValue(row, p)))];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                    excelRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    excelRow.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    if (!hyphenRow) staffAugmentationAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(getPerspectiveValue(row, p));
                      const colIndex = baseCols + idx + 1;
                      const cell = excelRow.getCell(colIndex);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                  });
                  const saGrandTotal = staffAugmentationAccountData.grandTotal;
                  if (saGrandTotal) {
                    const grandRowData = [saGrandTotal.sNo, saGrandTotal.businessUnit, saGrandTotal.accountName, saGrandTotal.Polled ?? 0, saGrandTotal.Responded ?? 0, ...staffAugmentationAccountData.perspectives.map(p => formatPerspectiveDisplay(saGrandTotal[p]))];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.font = { bold: true };
                    grandRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                    grandRow.eachCell((cell, colNumber) => {
                      cell.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle', wrapText: true };
                    });
                    staffAugmentationAccountData.perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(saGrandTotal[p]);
                      const cell = grandRow.getCell(baseCols + idx + 1);
                      cell.value = val;
                      if (val !== '-' && val !== '－') {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                          else if (num >= 4 && num < 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                          else if (num >= 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        }
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  staffAugmentationAccountData.perspectives.forEach((_, idx) => { sheet.getColumn(6 + idx).width = 20; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Staff_Augmentation_Average_CSAT_Scores_Perspective_Wise_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Staff Augmentation Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#EA580C', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Staff Augmentation table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Staff Augmentation Average CSAT Scores by Perspective">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {staffAugmentationAccountData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {staffAugmentationAccountData.data.map((row) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={row.customerId || `sa-${row.sNo}`}>
                        {[...Array(5 + staffAugmentationAccountData.perspectives.length)].map((_, i) => (
                          <Td key={i} style={{ textAlign: (i === 1 || i === 2) ? 'left' : 'center' }}>-</Td>
                        ))}
                      </tr>
                    );
                  }
                  return (
                  <tr key={row.customerId || `sa-${row.sNo}`}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {staffAugmentationAccountData.perspectives.map((p) => {
                      const value = getPerspectiveValue(row, p);
                      const displayVal = formatPerspectiveDisplay(value);
                      return (
                      <Td
                        key={p}
                        style={{
                          textAlign: 'center',
                          fontWeight: '600',
                          backgroundColor: getCellColor(displayVal),
                          color: getTextColor(displayVal)
                        }}
                      >
                        {displayVal}
                      </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const saGrandTotal = staffAugmentationAccountData.grandTotal;
                  if (!saGrandTotal) return null;
                  return (
                    <tr key="sa-account-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{saGrandTotal.sNo}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{saGrandTotal.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{saGrandTotal.accountName}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{saGrandTotal.Polled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{saGrandTotal.Responded}</Td>
                      {staffAugmentationAccountData.perspectives.map((p) => {
                        const displayVal = formatPerspectiveDisplay(saGrandTotal[p]);
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              fontWeight: '700',
                              backgroundColor: getCellColor(displayVal),
                              color: getTextColor(displayVal)
                            }}
                          >
                            {displayVal}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Premier Healthcare Solutions Inc (L80) – Portfolio-wise % Satisfied Customers: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Columns: Sr.No., Business Unit, Portfolio, perspective columns (% Satisfied = (count of RATING 4 or 5 / Responded) * 100). */}
      {!showBUWiseView && !showTop10 && premierHealthcarePortfolioSatisfiedData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', fontSize: '0.95rem', color: '#92400E', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Premier Healthcare Solutions Inc (L80) – Portfolio-wise % Satisfied Customers (from the Customer Success Survey All PCSAT report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, group by Portfolio). Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY). % = (count of RATING 4 or 5 / count of data input for that perspective in that portfolio) × 100. Grand Total uses sum of count 4,5 / sum of data input per perspective.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Premier Healthcare Portfolio % Satisfied', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const hasTrend = trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0;
                  const perspectives = premierHealthcarePortfolioSatisfiedData.perspectives || [];
                  const numPerspectives = perspectives.length;
                  const trendSubHeaders = hasTrend ? perspectives.map(p => normalizePerspectiveForDisplay(p)) : [];

                  // Two-row header: merged "H2 2025" over #Polled/#Responded + perspective columns (same navy style as other headers)
                  const row1 = ['Sr. No.', 'Business Unit', 'Portfolio', (acsatCycle || 'H2 2025'), ...Array((2 + numPerspectives) - 1).fill(''), ...(hasTrend ? [trendHeaderLabel, ...Array(numPerspectives - 1).fill('')] : [])];
                  const row2 = ['', '', '', 'Polled', 'Responded', ...perspectives.map(p => normalizePerspectiveForDisplay(p)), ...(hasTrend ? perspectives.map(p => normalizePerspectiveForDisplay(p)) : [])];
                  sheet.addRow(row1);
                  sheet.addRow(row2);

                  // Merge cells for header layout
                  sheet.mergeCells(1, 1, 2, 1); // Sr. No.
                  sheet.mergeCells(1, 2, 2, 2); // Business Unit
                  sheet.mergeCells(1, 3, 2, 3); // Portfolio
                  const h2StartCol = 4;
                  const h2EndCol = h2StartCol + (2 + numPerspectives) - 1;
                  sheet.mergeCells(1, h2StartCol, 1, h2EndCol); // H2 2025
                  if (hasTrend) {
                    const trendStartCol = h2EndCol + 1;
                    const trendEndCol = trendStartCol + numPerspectives - 1;
                    sheet.mergeCells(1, trendStartCol, 1, trendEndCol);
                  }

                  // Style header rows (same as existing header style)
                  [1, 2].forEach((rowNum) => {
                    const r = sheet.getRow(rowNum);
                    r.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                    r.height = 30;
                    r.eachCell((cell) => {
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    });
                  });
                  const baseCols = 5;
                  const trendMap = new Map();
                  if (hasTrend) {
                    (premierHealthcareTrendPortfolioSatisfiedPct.data || []).forEach(r => {
                      trendMap.set(normalizePortfolioKey(r.portfolio), r);
                    });
                  }
                  premierHealthcarePortfolioSatisfiedData.data.forEach((row) => {
                    const trendRow = hasTrend ? trendMap.get(normalizePortfolioKey(row.portfolio)) : null;
                    const rowData = [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.portfolio, row.Polled ?? 0, row.Responded ?? 0, ...premierHealthcarePortfolioSatisfiedData.perspectives.map(p => {
                      const val = row[p];
                      const num = typeof val === 'number' ? val : parseFloat(val);
                      return val === '-' || Number.isNaN(num) ? '-' : `${Math.round(num)}%`;
                    }), ...(hasTrend ? premierHealthcarePortfolioSatisfiedData.perspectives.map(p => {
                      const baseValRaw = getPerspectiveValue(row, p);
                      const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                      const tv = getTrendPctValue(trendRow?.perspectivePct, p);
                      const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (tv != null ? 0 : null);
                      const diff = (tv != null && effectiveBase !== null) ? (effectiveBase - tv) : null;
                      return diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                    }) : [])];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                    });
                    premierHealthcarePortfolioSatisfiedData.perspectives.forEach((p, idx) => {
                      const val = row[p];
                      const num = typeof val === 'number' ? val : parseFloat(val);
                      const displayVal = val === '-' || Number.isNaN(num) ? '-' : `${Math.round(num)}%`;
                      const colIndex = baseCols + idx + 1;
                      const cell = excelRow.getCell(colIndex);
                      cell.value = displayVal;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      if (val === '-') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 75) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 75 && num < 90) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFBF00' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 90) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                    if (hasTrend) {
                      premierHealthcarePortfolioSatisfiedData.perspectives.forEach((p, idx) => {
                        const baseValRaw = getPerspectiveValue(row, p);
                        const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                        const tv = getTrendPctValue(trendRow?.perspectivePct, p);
                        const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (tv != null ? 0 : null);
                        const diff = (tv != null && effectiveBase !== null) ? (effectiveBase - tv) : null;
                        const displayVal = diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                        const colIndex = baseCols + premierHealthcarePortfolioSatisfiedData.perspectives.length + idx + 1;
                        const cell = excelRow.getCell(colIndex);
                        cell.value = displayVal;
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        // Trend diff styling: green for up, red for down, gray for no change / missing
                        if (diff == null) {
                          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                          cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                        } else if (diff > 0) {
                          cell.font = { bold: true, color: { argb: 'FF166534' } };
                        } else if (diff < 0) {
                          cell.font = { bold: true, color: { argb: 'FFDC2626' } };
                        } else {
                          cell.font = { bold: true, color: { argb: 'FF6B7280' } };
                        }
                      });
                    }
                  });
                  if (premierHealthcarePortfolioSatisfiedData.grandTotal) {
                    const gt = premierHealthcarePortfolioSatisfiedData.grandTotal;
                    const gtTrend = hasTrend ? premierHealthcareTrendPortfolioSatisfiedPct.grandTotal : null;
                    const grandRowData = [gt.sNo, gt.businessUnit, gt.portfolio, gt.Polled ?? 0, gt.Responded ?? 0, ...premierHealthcarePortfolioSatisfiedData.perspectives.map(p => {
                      const val = gt[p];
                      const num = typeof val === 'number' ? val : parseFloat(val);
                      return val === '-' || Number.isNaN(num) ? '-' : `${Math.round(num)}%`;
                    }), ...(hasTrend ? premierHealthcarePortfolioSatisfiedData.perspectives.map(p => {
                      const baseValRaw = getPerspectiveValue(gt, p);
                      const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                      const tv = getTrendPctValue(gtTrend?.perspectivePct, p);
                      const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (tv != null ? 0 : null);
                      const diff = (tv != null && effectiveBase !== null) ? (effectiveBase - tv) : null;
                      return diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                    }) : [])];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                    });
                    premierHealthcarePortfolioSatisfiedData.perspectives.forEach((p, idx) => {
                      const val = gt[p];
                      const num = typeof val === 'number' ? val : parseFloat(val);
                      const displayVal = val === '-' || Number.isNaN(num) ? '-' : `${avgToFixed2(num)}%`;
                      const cell = grandRow.getCell(baseCols + idx + 1);
                      cell.value = displayVal;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      if (val !== '-') {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 75) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                          else if (num >= 75 && num < 90) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFBF00' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                          else if (num >= 90) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        }
                      }
                    });
                    if (hasTrend) {
                      premierHealthcarePortfolioSatisfiedData.perspectives.forEach((p, idx) => {
                        const baseValRaw = getPerspectiveValue(gt, p);
                        const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                        const tv = getTrendPctValue(gtTrend?.perspectivePct, p);
                        const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (tv != null ? 0 : null);
                        const diff = (tv != null && effectiveBase !== null) ? (effectiveBase - tv) : null;
                        const displayVal = diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                        const cell = grandRow.getCell(baseCols + premierHealthcarePortfolioSatisfiedData.perspectives.length + idx + 1);
                        cell.value = displayVal;
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                        if (diff == null) {
                          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                          cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                        } else if (diff > 0) {
                          cell.font = { bold: true, color: { argb: 'FF166534' } };
                        } else if (diff < 0) {
                          cell.font = { bold: true, color: { argb: 'FFDC2626' } };
                        } else {
                          cell.font = { bold: true, color: { argb: 'FF6B7280' } };
                        }
                      });
                    }
                  }
                  if (premierHealthcarePortfolioSatisfiedData.countRow) {
                    const cr = premierHealthcarePortfolioSatisfiedData.countRow;
                    const countRowData = [cr.sNo, cr.businessUnit ?? '', cr.portfolio ?? '', cr.Polled ?? '', cr.Responded ?? '', ...premierHealthcarePortfolioSatisfiedData.perspectives.map(p => cr[p] ?? 0), ...(hasTrend ? premierHealthcarePortfolioSatisfiedData.perspectives.map(() => '') : [])];
                    const countRowExcel = sheet.addRow(countRowData);
                    countRowExcel.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
                      if (colNumber === 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
                      } else if (colNumber === 1 || colNumber === 4) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        const hAlign = colNumber <= 5 ? 'left' : 'center';
                        cell.alignment = { horizontal: hAlign, vertical: 'middle', wrapText: true };
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 22;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  perspectives.forEach((_, idx) => { sheet.getColumn(6 + idx).width = 20; });
                  if (hasTrend) perspectives.forEach((_, idx) => { sheet.getColumn(6 + numPerspectives + idx).width = 18; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 2) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Premier_Healthcare_Portfolio_Satisfied_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Premier Healthcare Portfolio % Satisfied Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#D97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Premier Healthcare Portfolio % Satisfied table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 75% (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFBF00', marginRight: 4, verticalAlign: 'middle' }} /> 75% to 89.99% (Amber – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 90% (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Premier Healthcare Portfolio-wise % Satisfied Customers">
              <TableHeader>
                <tr>
                  <Th rowSpan={2} style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center' }}>Portfolio</Th>
                  <Th colSpan={2 + premierHealthcarePortfolioSatisfiedData.perspectives.length} style={{ textAlign: 'center' }}>{acsatCycle || 'H2 2025'}</Th>
                  {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0 && (
                    <Th colSpan={premierHealthcarePortfolioSatisfiedData.perspectives.length} style={{ textAlign: 'center' }}>{trendHeaderLabel}</Th>
                  )}
                </tr>
                <tr>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                  {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0 && premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => (
                    <Th key={`trend-${p}`} style={{ textAlign: 'center' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcarePortfolioSatisfiedData.data.map((row) => {
                  const hasTrend = trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0;
                  const trendRow = hasTrend ? (premierHealthcareTrendPortfolioSatisfiedPct.data || []).find(r => normalizePortfolioKey(r.portfolio) === normalizePortfolioKey(row.portfolio)) : null;
                  return (
                  <tr key={`ph-portfolio-satisfied-${row.sNo}-${row.portfolio}`}>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.portfolio}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.Responded ?? 0}</Td>
                    {premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => {
                      const value = row[p];
                      const num = typeof value === 'number' ? value : parseFloat(value);
                      const displayVal = value === '-' || Number.isNaN(num) ? '-' : `${Math.round(num)}%`;
                      let bgColor = '#F9FAFB';
                      let textColor = '#6B7280';
                      if (value !== '-' && !Number.isNaN(num)) {
                        if (num < 75) { bgColor = '#ff0000'; textColor = '#ffffff'; }
                        else if (num >= 75 && num < 90) { bgColor = '#FFBF00'; textColor = '#000000'; }
                        else if (num >= 90) { bgColor = '#c6efce'; textColor = '#000000'; }
                      }
                      return (
                        <Td key={p} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: bgColor, color: textColor, border: '1px solid #e5e7eb' }}>{displayVal}</Td>
                      );
                    })}
                    {hasTrend && premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => {
                      const baseValRaw = getPerspectiveValue(row, p);
                      const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                      const trendVal = getTrendPctValue(trendRow?.perspectivePct, p);
                      // Same as Account/BU wise: when H2 has no data (NaN/'-') but trend has value, treat H2 as 0 so diff = 0 - trendVal (e.g. (-100) ↓)
                      const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (trendVal != null ? 0 : null);
                      const diff = (trendVal != null && effectiveBase !== null) ? (effectiveBase - trendVal) : null;
                      const displayVal = diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                      const bgColor = '#F9FAFB';
                      const textColor = diff == null ? '#6B7280' : (diff > 0 ? '#166534' : diff < 0 ? '#dc2626' : '#6B7280');
                      return (
                        <Td key={`trend-td-${row.portfolio}-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: bgColor, color: textColor, border: '1px solid #e5e7eb' }}>{displayVal}</Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const gt = premierHealthcarePortfolioSatisfiedData.grandTotal;
                  if (!gt) return null;
                  const hasTrend = trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0;
                  const gtTrend = hasTrend ? premierHealthcareTrendPortfolioSatisfiedPct.grandTotal : null;
                  return (
                    <tr key="ph-portfolio-satisfied-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.Responded ?? 0}</Td>
                      {premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => {
                        const value = gt[p];
                        const num = typeof value === 'number' ? value : parseFloat(value);
                        const displayVal = value === '-' || Number.isNaN(num) ? '-' : `${avgToFixed2(num)}%`;
                        let bgColor = '#E2E8F0';
                        let textColor = '#000000';
                        if (value !== '-' && !Number.isNaN(num)) {
                          if (num < 75) { bgColor = '#ff0000'; textColor = '#ffffff'; }
                          else if (num >= 75 && num < 90) { bgColor = '#FFBF00'; textColor = '#000000'; }
                          else if (num >= 90) { bgColor = '#c6efce'; textColor = '#000000'; }
                        }
                        return (
                          <Td key={p} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: bgColor, color: textColor, border: '1px solid #e5e7eb' }}>{displayVal}</Td>
                        );
                      })}
                      {hasTrend && premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => {
                        const baseValRaw = getPerspectiveValue(gt, p);
                        const baseNum = typeof baseValRaw === 'number' ? baseValRaw : parseFloat(String(baseValRaw || '').replace(/%/g, ''));
                        const trendVal = getTrendPctValue(gtTrend?.perspectivePct, p);
                        const effectiveBase = (baseNum != null && !Number.isNaN(baseNum)) ? baseNum : (trendVal != null ? 0 : null);
                        const diff = (trendVal != null && effectiveBase !== null) ? (effectiveBase - trendVal) : null;
                        const displayVal = diff == null ? '-' : `(${diff >= 0 ? '+' : ''}${Math.round(diff)}) ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                        const bgColor = '#E2E8F0';
                        const textColor = diff == null ? '#6B7280' : (diff > 0 ? '#166534' : diff < 0 ? '#dc2626' : '#6B7280');
                        return (
                          <Td key={`gt-trend-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: bgColor, color: textColor, border: '1px solid #e5e7eb' }}>{displayVal}</Td>
                        );
                      })}
                    </tr>
                  );
                })()}
                {premierHealthcarePortfolioSatisfiedData.countRow && (
                  <tr key="ph-portfolio-satisfied-count-row" style={{ fontWeight: '600', backgroundColor: '#DBEAFE' }}>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow.sNo}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow.businessUnit}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow.portfolio}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow.Polled}</Td>
                    <Td style={{ textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow.Responded}</Td>
                    {premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => (
                      <Td key={p} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }}>{premierHealthcarePortfolioSatisfiedData.countRow[p] ?? 0}</Td>
                    ))}
                    {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct?.data?.length > 0 && premierHealthcarePortfolioSatisfiedData.perspectives.map((p) => (
                      <Td key={`count-trend-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE', border: '1px solid #e5e7eb' }} />
                    ))}
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Premier Healthcare Solutions Inc (L80) – Portfolio-wise Overall CSAT Score Distribution: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", PERSPECTIVE = "Overall Experience", group by PORTFOLIO. */}
      {!showBUWiseView && !showTop10 && premierHealthcarePortfolioDistributionData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#E0E7FF', border: '1px solid #A5B4FC', borderRadius: '8px', fontSize: '0.95rem', color: '#3730A3', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Premier Healthcare Solutions Inc (L80) – Portfolio-wise Overall CSAT Score Distribution (from the Customer Success Survey All PCSAT report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, PERSPECTIVE = &quot;Overall Experience&quot;, group by Portfolio). Values = count(RATING) / Responded * 100.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Premier Healthcare Distribution', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'Business Unit', 'Portfolio', 'Polled', 'Responded', 'Highly Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Highly Satisfied'];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell, colNumber) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  });
                  premierHealthcarePortfolioDistributionData.data.forEach((row) => {
                    const rowData = [
                      row.sNo,
                      normalizeBusinessUnitDisplay(row.businessUnit),
                      row.portfolio,
                      row.Polled ?? 0,
                      row.Responded ?? 0,
                      row.highlyDissatisfied === '-' ? '-' : `${row.highlyDissatisfied}%`,
                      row.dissatisfied === '-' ? '-' : `${row.dissatisfied}%`,
                      row.neutral === '-' ? '-' : `${row.neutral}%`,
                      row.satisfied === '-' ? '-' : `${row.satisfied}%`,
                      row.highlySatisfied === '-' ? '-' : `${row.highlySatisfied}%`
                    ];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                      // Apply legend colors for distribution columns (matching Account/BU wise Overall CSAT score - Distribution)
                      // Don't apply color if Responded=0
                      const respondedIsZero = row.Responded === 0 || row.Responded === '0';
                      if (colNumber === 6) {
                        if (!respondedIsZero) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' } }; }
                      }
                      if (colNumber === 7) {
                        if (!respondedIsZero) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' } }; }
                      }
                      if (colNumber === 8) {
                        if (!respondedIsZero) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' } }; }
                      }
                      if (colNumber === 9) {
                        if (!respondedIsZero) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' } }; }
                      }
                      if (colNumber === 10) {
                        if (!respondedIsZero) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' } }; }
                      }
                    });
                  });
                  if (premierHealthcarePortfolioDistributionData.grandTotal) {
                    const gt = premierHealthcarePortfolioDistributionData.grandTotal;
                    const grandRowData = [
                      gt.sNo,
                      gt.businessUnit,
                      gt.portfolio,
                      gt.Polled ?? 0,
                      gt.Responded ?? 0,
                      gt.highlyDissatisfied === '-' ? '-' : `${gt.highlyDissatisfied}%`,
                      gt.dissatisfied === '-' ? '-' : `${gt.dissatisfied}%`,
                      gt.neutral === '-' ? '-' : `${gt.neutral}%`,
                      gt.satisfied === '-' ? '-' : `${gt.satisfied}%`,
                      gt.highlySatisfied === '-' ? '-' : `${gt.highlySatisfied}%`
                    ];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      if (colNumber <= 5) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      }
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                      // Apply legend colors for distribution columns in Grand Total row (matching Account/BU wise Overall CSAT score - Distribution)
                      // Don't apply color if value is 0 or 0%
                      const isZeroOrDash = (val) => val === '-' || val === 0 || val === '0' || val === '0%' || val === '0.0' || parseFloat(val) === 0;
                      if (colNumber === 6) {
                        if (isZeroOrDash(gt.highlyDissatisfied)) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDC2626' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                      }
                      if (colNumber === 7) {
                        if (isZeroOrDash(gt.dissatisfied)) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                      }
                      if (colNumber === 8) {
                        if (isZeroOrDash(gt.neutral)) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                      }
                      if (colNumber === 9) {
                        if (isZeroOrDash(gt.satisfied)) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF86EFAC' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                      }
                      if (colNumber === 10) {
                        if (isZeroOrDash(gt.highlySatisfied)) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        else { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 22;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  sheet.getColumn(6).width = 18;
                  sheet.getColumn(7).width = 14;
                  sheet.getColumn(8).width = 10;
                  sheet.getColumn(9).width = 12;
                  sheet.getColumn(10).width = 16;
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Premier_Healthcare_Portfolio_Distribution_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Premier Healthcare Portfolio Distribution Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Premier Healthcare Portfolio Distribution table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#16a34a', marginRight: 4, verticalAlign: 'middle' }} /> Highly Satisfied (Dark Green)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#86efac', marginRight: 4, verticalAlign: 'middle' }} /> Satisfied (Green)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 4, verticalAlign: 'middle' }} /> Neutral (Amber)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#fca5a5', marginRight: 4, verticalAlign: 'middle' }} /> Dissatisfied (Light Red)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#dc2626', marginRight: 4, verticalAlign: 'middle' }} /> Highly Dissatisfied (Dark Red)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Premier Healthcare Portfolio-wise Overall CSAT Score Distribution">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>Portfolio</Th>
                  <Th style={{ textAlign: 'center' }}>Polled</Th>
                  <Th style={{ textAlign: 'center' }}>Responded</Th>
                  <Th style={{ textAlign: 'center' }}>Highly Dissatisfied</Th>
                  <Th style={{ textAlign: 'center' }}>Dissatisfied</Th>
                  <Th style={{ textAlign: 'center' }}>Neutral</Th>
                  <Th style={{ textAlign: 'center' }}>Satisfied</Th>
                  <Th style={{ textAlign: 'center' }}>Highly Satisfied</Th>
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcarePortfolioDistributionData.data.map((row) => (
                  <tr key={`ph-portfolio-dist-${row.sNo}-${row.portfolio}`}>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.portfolio}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb' }}>{row.Responded ?? 0}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb', backgroundColor: (row.Responded === 0 || row.Responded === '0') ? 'transparent' : '#dc2626', color: (row.Responded === 0 || row.Responded === '0') ? '#000000' : '#ffffff' }}>{row.highlyDissatisfied === '-' ? '-' : `${row.highlyDissatisfied}%`}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb', backgroundColor: (row.Responded === 0 || row.Responded === '0') ? 'transparent' : '#fca5a5', color: '#000000' }}>{row.dissatisfied === '-' ? '-' : `${row.dissatisfied}%`}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb', backgroundColor: (row.Responded === 0 || row.Responded === '0') ? 'transparent' : '#f59e0b', color: '#000000' }}>{row.neutral === '-' ? '-' : `${row.neutral}%`}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb', backgroundColor: (row.Responded === 0 || row.Responded === '0') ? 'transparent' : '#86efac', color: '#000000' }}>{row.satisfied === '-' ? '-' : `${row.satisfied}%`}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', border: '1px solid #e5e7eb', backgroundColor: (row.Responded === 0 || row.Responded === '0') ? 'transparent' : '#16a34a', color: '#000000' }}>{row.highlySatisfied === '-' ? '-' : `${row.highlySatisfied}%`}</Td>
                  </tr>
                ))}
                {(() => {
                  const gt = premierHealthcarePortfolioDistributionData.grandTotal;
                  if (!gt) return null;
                  return (
                    <tr key="ph-portfolio-dist-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', border: '1px solid #e5e7eb' }}>{gt.Responded ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', border: '1px solid #e5e7eb', backgroundColor: (gt.highlyDissatisfied === '-' || parseFloat(gt.highlyDissatisfied) === 0) ? '#E2E8F0' : '#dc2626', color: (gt.highlyDissatisfied === '-' || parseFloat(gt.highlyDissatisfied) === 0) ? '#000000' : '#ffffff' }}>{gt.highlyDissatisfied === '-' ? '-' : `${gt.highlyDissatisfied}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', border: '1px solid #e5e7eb', backgroundColor: (gt.dissatisfied === '-' || parseFloat(gt.dissatisfied) === 0) ? '#E2E8F0' : '#fca5a5', color: '#000000' }}>{gt.dissatisfied === '-' ? '-' : `${gt.dissatisfied}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', border: '1px solid #e5e7eb', backgroundColor: (gt.neutral === '-' || parseFloat(gt.neutral) === 0) ? '#E2E8F0' : '#f59e0b', color: '#000000' }}>{gt.neutral === '-' ? '-' : `${gt.neutral}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', border: '1px solid #e5e7eb', backgroundColor: (gt.satisfied === '-' || parseFloat(gt.satisfied) === 0) ? '#E2E8F0' : '#86efac', color: '#000000' }}>{gt.satisfied === '-' ? '-' : `${gt.satisfied}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', border: '1px solid #e5e7eb', backgroundColor: (gt.highlySatisfied === '-' || parseFloat(gt.highlySatisfied) === 0) ? '#E2E8F0' : '#16a34a', color: '#000000' }}>{gt.highlySatisfied === '-' ? '-' : `${gt.highlySatisfied}%`}</Td>
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Premier Healthcare Solutions Inc (L80) – Portfolio-wise Average CSAT Scores: from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Columns: Sr.No., BUSINESS UNIT, PORTFOLIO, perspective columns (avg RATING). */}
      {!showBUWiseView && !showTop10 && premierHealthcarePortfolioData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: '8px', fontSize: '0.95rem', color: '#166534', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Premier Healthcare Solutions Inc (L80) – Portfolio-wise Average CSAT Scores (from the Customer Success Survey All PCSAT report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, group by Portfolio). Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report, date &gt;= CSAT cycle start (MM-DD-YYYY). Perspective columns = average RATING.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Premier Healthcare Portfolio Wise', { views: [{ state: 'frozen', ySplit: 2 }] });
                  const hasTrend = trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0;
                  const numPerspectives = premierHealthcarePortfolioData.perspectives.length;
                  const trendSubHeaders = hasTrend ? premierHealthcarePortfolioData.perspectives.map(p => normalizePerspectiveForDisplay(p)) : [];
                  const h2ColSpan = 2 + numPerspectives;
                  const row1 = ['Sr. No.', 'Business Unit', 'Portfolio', (acsatCycle || 'H2 2025'), ...Array(h2ColSpan - 1).fill(''), ...(hasTrend ? [trendHeaderLabel, ...Array(numPerspectives - 1).fill('')] : [])];
                  const row2 = ['', '', '', '#Polled', '#Responded', ...premierHealthcarePortfolioData.perspectives.map(p => normalizePerspectiveForDisplay(p)), ...trendSubHeaders];
                  sheet.addRow(row1);
                  sheet.addRow(row2);
                  sheet.mergeCells(1, 4, 1, 3 + h2ColSpan);
                  if (hasTrend && numPerspectives >= 1) sheet.mergeCells(1, 4 + h2ColSpan, 1, 3 + h2ColSpan + numPerspectives);
                  const headerRow1 = sheet.getRow(1);
                  const headerRow2 = sheet.getRow(2);
                  headerRow1.height = 24;
                  headerRow2.height = 24;
                  const headerStyle = { font: { bold: true, color: { argb: 'FFFFFFFF' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } } };
                  headerRow1.eachCell((cell) => { cell.font = headerStyle.font; cell.fill = headerStyle.fill; cell.alignment = headerStyle.alignment; cell.border = headerStyle.border; });
                  headerRow2.eachCell((cell) => { cell.font = headerStyle.font; cell.fill = headerStyle.fill; cell.alignment = headerStyle.alignment; cell.border = headerStyle.border; });
                  const baseCols = 5;
                  premierHealthcarePortfolioData.data.forEach((row) => {
                    const trendRow = hasTrend ? premierHealthcareTrendPortfolioWithPerspectives.data.find(d => normalizePortfolioKey(d.portfolio) === normalizePortfolioKey(row.portfolio)) : null;
                    const trendAvgs = trendRow?.perspectiveAvgs || {};
                    const trendCells = hasTrend ? premierHealthcarePortfolioData.perspectives.map((p) => {
                      const mainVal = row[p] != null && row[p] !== '' && !Number.isNaN(Number(row[p])) ? Number(row[p]) : null;
                      const trendVal = getTrendAvgValue(trendAvgs, p);
                      const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                      const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                      return diff == null ? '-' : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                    }) : [];
                    const rowData = [row.sNo, normalizeBusinessUnitDisplay(row.businessUnit), row.portfolio, row.Polled ?? 0, row.Responded ?? 0, ...premierHealthcarePortfolioData.perspectives.map(p => {
                      const v = formatPerspectiveDisplay(row[p] || '-');
                      if (v === '-' || v === '－') return '-';
                      const num = Number(v);
                      return Number.isNaN(num) ? '-' : avgToFixed2(num);
                    }), ...trendCells];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                    });
                    premierHealthcarePortfolioData.perspectives.forEach((p, idx) => {
                      const raw = formatPerspectiveDisplay(row[p] || '-');
                      const val = (raw === '-' || raw === '－') ? '-' : (Number.isNaN(Number(raw)) ? '-' : avgToFixed2(Number(raw)));
                      const colIndex = baseCols + idx + 1;
                      const cell = excelRow.getCell(colIndex);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val === '-' || val === '－') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
                        cell.font = { color: { argb: 'FF6B7280' }, bold: true };
                      } else {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                          } else if (num >= 4 && num < 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          } else if (num >= 4.5) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                            cell.font = { color: { argb: 'FF000000' }, bold: true };
                          }
                        }
                      }
                    });
                    if (hasTrend) {
                      premierHealthcarePortfolioData.perspectives.forEach((p, idx) => {
                        const mainVal = row[p] != null && row[p] !== '' && !Number.isNaN(Number(row[p])) ? Number(row[p]) : null;
                        const trendVal = getTrendAvgValue(trendAvgs, p);
                        const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                        const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                        const cell = excelRow.getCell(baseCols + numPerspectives + idx + 1);
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.font = { bold: true, color: { argb: diff == null ? 'FF000000' : diff > 0 ? 'FF166534' : diff < 0 ? 'FFDC2626' : 'FF6B7280' } };
                      });
                    }
                  });
                  if (premierHealthcarePortfolioData.grandTotal) {
                    const gt = premierHealthcarePortfolioData.grandTotal;
                    const gtTrendAvgs = premierHealthcareTrendPortfolioWithPerspectives?.grandTotal?.perspectiveAvgs || {};
                    const gtTrendCells = hasTrend ? premierHealthcarePortfolioData.perspectives.map((p) => {
                      const mainVal = gt[p] != null && gt[p] !== '' && !Number.isNaN(Number(gt[p])) ? Number(gt[p]) : null;
                      const trendVal = getTrendAvgValue(gtTrendAvgs, p);
                      const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                      const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                      return diff == null ? '-' : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                    }) : [];
                    const grandRowData = [gt.sNo, gt.businessUnit, gt.portfolio, gt.Polled ?? 0, gt.Responded ?? 0, ...premierHealthcarePortfolioData.perspectives.map(p => {
                      const v = formatPerspectiveDisplay(gt[p] || '-');
                      if (v === '-' || v === '－') return '-';
                      const num = Number(v);
                      return Number.isNaN(num) ? '-' : avgToFixed2(num);
                    }), ...gtTrendCells];
                    const grandRow = sheet.addRow(grandRowData);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      if (colNumber === 1 || colNumber === 4 || colNumber === 5 || colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                    });
                    premierHealthcarePortfolioData.perspectives.forEach((p, idx) => {
                      const raw = formatPerspectiveDisplay(gt[p] || '-');
                      const val = (raw === '-' || raw === '－') ? '-' : (Number.isNaN(Number(raw)) ? '-' : avgToFixed2(Number(raw)));
                      const cell = grandRow.getCell(baseCols + idx + 1);
                      cell.value = val;
                      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      if (val !== '-' && val !== '－') {
                        const num = parseFloat(val);
                        if (!isNaN(num)) {
                          if (num < 4) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; cell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; }
                          else if (num >= 4 && num < 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                          else if (num >= 4.5) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; cell.font = { color: { argb: 'FF000000' }, bold: true }; }
                        }
                      }
                    });
                    if (hasTrend) {
                      premierHealthcarePortfolioData.perspectives.forEach((p, idx) => {
                        const mainVal = gt[p] != null && gt[p] !== '' && !Number.isNaN(Number(gt[p])) ? Number(gt[p]) : null;
                        const trendVal = getTrendAvgValue(gtTrendAvgs, p);
                        const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                        const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                        const cell = grandRow.getCell(baseCols + numPerspectives + idx + 1);
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        cell.font = { bold: true, color: { argb: diff == null ? 'FF000000' : diff > 0 ? 'FF166534' : diff < 0 ? 'FFDC2626' : 'FF6B7280' } };
                      });
                    }
                  }
                  if (premierHealthcarePortfolioData.countRow) {
                    const cr = premierHealthcarePortfolioData.countRow;
                    const countRowPerspectiveCells = premierHealthcarePortfolioData.perspectives.map(p => cr[p] ?? 0);
                    const countRowTrendCells = hasTrend ? premierHealthcarePortfolioData.perspectives.map(() => '') : [];
                    const countRowData = [cr.sNo, cr.businessUnit ?? '', cr.portfolio ?? '', cr.Polled ?? '', cr.Responded ?? '', ...countRowPerspectiveCells, ...countRowTrendCells];
                    const countRowExcel = sheet.addRow(countRowData);
                    countRowExcel.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDBEAFE' } };
                      if (colNumber === 5) {
                        cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
                      } else if (colNumber === 1 || colNumber === 4 || colNumber >= 6) {
                        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                      } else {
                        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
                      }
                    });
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 18;
                  sheet.getColumn(3).width = 22;
                  sheet.getColumn(4).width = 10;
                  sheet.getColumn(5).width = 12;
                  premierHealthcarePortfolioData.perspectives.forEach((_, idx) => { sheet.getColumn(6 + idx).width = 20; });
                  if (hasTrend) premierHealthcarePortfolioData.perspectives.forEach((_, idx) => { sheet.getColumn(6 + numPerspectives + idx).width = 18; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 2) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Premier_Healthcare_Portfolio_Wise_Avg_CSAT_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Premier Healthcare Portfolio Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#16A34A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Premier Healthcare Portfolio table as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Premier Healthcare Portfolio-wise Average CSAT Scores">
              <TableHeader>
                <tr>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Sr. No.</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Business Unit</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Portfolio</Th>
                  <Th colSpan={2 + premierHealthcarePortfolioData.perspectives.length} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{acsatCycle || 'H2 2025'}</Th>
                  {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0 && (
                    <Th colSpan={premierHealthcarePortfolioData.perspectives.length} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{trendHeaderLabel}</Th>
                  )}
                </tr>
                <tr>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Responded</Th>
                  {premierHealthcarePortfolioData.perspectives.map((p) => (
                    <Th key={p} style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                  {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0 && premierHealthcarePortfolioData.perspectives.map((p) => (
                    <Th key={`trend-${p}`} style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcarePortfolioData.data.map((row) => {
                  const trendRow = trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0
                    ? premierHealthcareTrendPortfolioWithPerspectives.data.find(d => normalizePortfolioKey(d.portfolio) === normalizePortfolioKey(row.portfolio))
                    : null;
                  const trendAvgs = trendRow?.perspectiveAvgs || {};
                  return (
                  <tr key={`ph-portfolio-${row.sNo}-${row.portfolio}`}>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{row.portfolio}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Responded ?? 0}</Td>
                    {premierHealthcarePortfolioData.perspectives.map((p) => {
                      const value = row[p] || '-';
                      const raw = formatPerspectiveDisplay(value);
                      const displayVal = (raw === '-' || raw === '－') ? '-' : (Number.isNaN(Number(raw)) ? '-' : avgToFixed2(Number(raw)));
                      return (
                        <Td
                          key={p}
                          style={{
                            textAlign: 'center',
                            verticalAlign: 'middle',
                            fontWeight: '600',
                            backgroundColor: getCellColor(displayVal),
                            color: getTextColor(displayVal)
                          }}
                        >
                          {displayVal}
                        </Td>
                      );
                    })}
                    {/* Trend for Perspective: compare main table vs Trend Analysis – Portfolio-wise Perspective wise Avg rating; show difference then arrow; green ↑ for increase, red ↓ for decrease */}
                    {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0 && premierHealthcarePortfolioData.perspectives.map((p) => {
                      const mainVal = row[p] != null && row[p] !== '' && !Number.isNaN(Number(row[p])) ? Number(row[p]) : null;
                      const trendVal = getTrendAvgValue(trendAvgs, p);
                      const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                      const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                      const text = diff == null ? '-' : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                      const color = diff == null ? undefined : (diff > 0 ? '#166534' : diff < 0 ? '#dc2626' : '#6b7280');
                      return <Td key={`trend-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', color }}>{text}</Td>;
                    })}
                  </tr>
                  );
                })}
                {(() => {
                  const gt = premierHealthcarePortfolioData.grandTotal;
                  if (!gt) return null;
                  const gtTrend = premierHealthcareTrendPortfolioWithPerspectives?.grandTotal?.perspectiveAvgs || {};
                  return (
                    <tr key="ph-portfolio-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Responded ?? 0}</Td>
                      {premierHealthcarePortfolioData.perspectives.map((p) => {
                        const raw = formatPerspectiveDisplay(gt[p]);
                        const displayVal = (raw === '-' || raw === '－') ? '-' : (Number.isNaN(Number(raw)) ? '-' : avgToFixed2(Number(raw)));
                        return (
                          <Td
                            key={p}
                            style={{
                              textAlign: 'center',
                              verticalAlign: 'middle',
                              fontWeight: '700',
                              backgroundColor: getCellColor(displayVal),
                              color: getTextColor(displayVal)
                            }}
                          >
                            {displayVal}
                          </Td>
                        );
                      })}
                      {/* Trend for Perspective: difference then arrow; green ↑ increase, red ↓ decrease */}
                      {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0 && premierHealthcarePortfolioData.perspectives.map((p) => {
                        const mainVal = gt[p] != null && gt[p] !== '' && !Number.isNaN(Number(gt[p])) ? Number(gt[p]) : null;
                        const trendVal = getTrendAvgValue(gtTrend, p);
                        const effectiveMain = (mainVal != null && !Number.isNaN(mainVal)) ? mainVal : (trendVal != null ? 0 : null);
                        const diff = (trendVal != null && effectiveMain !== null) ? (effectiveMain - trendVal) : null;
                        const text = diff == null ? '-' : `${diff >= 0 ? '+' : ''}${diff.toFixed(2)} ${diff > 0 ? '↑' : diff < 0 ? '↓' : '−'}`;
                        const color = diff == null ? undefined : (diff > 0 ? '#166534' : diff < 0 ? '#dc2626' : '#6b7280');
                        return <Td key={`trend-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', color }}>{text}</Td>;
                      })}
                    </tr>
                  );
                })()}
                {premierHealthcarePortfolioData.countRow && (
                  <tr key="ph-portfolio-avg-count-row" style={{ fontWeight: '600', backgroundColor: '#DBEAFE' }}>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow.sNo}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow.businessUnit}</Td>
                    <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow.portfolio}</Td>
                    <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow.Polled}</Td>
                    <Td style={{ textAlign: 'right', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow.Responded}</Td>
                    {premierHealthcarePortfolioData.perspectives.map((p) => (
                      <Td key={p} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}>{premierHealthcarePortfolioData.countRow[p] ?? 0}</Td>
                    ))}
                    {trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives?.data?.length > 0 && premierHealthcarePortfolioData.perspectives.map((p) => (
                      <Td key={`trend-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: '#DBEAFE' }}></Td>
                    ))}
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Premier Healthcare Solutions Inc (L80) – Portfolio-wise Response Rate: from Sheet2 "CSAT sent and received Report", group by Portfolio. Columns: Sr.No., BUSINESS UNIT, Portfolio, #Polled, #Responded, Response Rate %, Average CSAT Score (Avg(ACTUAL SCORE)). */}
      {!showBUWiseView && !showTop10 && premierHealthcarePortfolioData.data.length > 0 && (
        <>
          <div style={{ margin: '1rem 1rem 0.5rem', padding: '0.75rem', background: '#EFF6FF', border: '1px solid #93C5FD', borderRadius: '8px', fontSize: '0.95rem', color: '#1E3A8A', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Premier Healthcare Solutions Inc (L80) – Portfolio-wise Response Rate (from the Customer Success Survey Status report, group by Portfolio). #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE), where dates &gt;= CSAT cycle start (MM-DD-YYYY). Response Rate % = #Responded / #Polled × 100. Average CSAT Score = Avg(ACTUAL SCORE).</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const getResponseRateBg = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return null;
                    if (rateNum < 50) return 'FFDC2626'; // Red
                    if (rateNum < 75) return 'FFF59E0B'; // Orange
                    return 'FF86EFAC'; // Light Green
                  };
                  const getAvgScoreBg = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return null;
                    if (scoreNum < 4) return 'FFDC2626'; // Red
                    if (scoreNum < 4.5) return 'FFF59E0B'; // Orange
                    return 'FF86EFAC'; // Light Green
                  };

                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('PH Portfolio Response Rate', { views: [{ state: 'frozen', ySplit: 2 }] });
                  const headerRow1 = ['Sr. No.', 'BUSINESS UNIT', 'Portfolio', (acsatCycle || 'H2 2025'), '', '', '', 'Response Rate Trend', 'Average CSAT Score Trend'];
                  sheet.addRow(headerRow1);
                  const row1 = sheet.getRow(1);
                  row1.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  row1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  row1.height = 30;
                  row1.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  });
                  sheet.mergeCells(1, 4, 1, 7);
                  const h2Cell = sheet.getCell(1, 4);
                  h2Cell.value = (acsatCycle || 'H2 2025');
                  h2Cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                  h2Cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  h2Cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  h2Cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  const headerRow2 = ['', '', '', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score', '', ''];
                  sheet.addRow(headerRow2);
                  const row2 = sheet.getRow(2);
                  row2.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  row2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  row2.height = 24;
                  row2.eachCell((cell, colNumber) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                    if (colNumber >= 4 && colNumber <= 7) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
                  });

                  // Build Avg(ACTUAL SCORE) from Sheet2 "CSAT sent and received Report" by Portfolio (Premier Healthcare only, date filter on CSAT RECEIVED DATE >= cycle start).
                  const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
                  const scoreByPortfolio = new Map(); // portfolio -> {sum, count}
                  let overallScoreSum = 0;
                  let overallScoreCount = 0;
                  if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
                    const sh2First = secondSheetDataRaw[0] || {};
                    const sh2CustomerNameKey = Object.keys(sh2First).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
                    const sh2PortfolioKey = Object.keys(sh2First).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
                    const sh2ReceivedDateKey = Object.keys(sh2First).find(k => {
                      const lower = (k || '').toLowerCase();
                      return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
                    }) || 'CSAT RECEIVED DATE';
                    const sh2ActualScoreKey = Object.keys(sh2First).find(k => /actual\s*score/i.test(String(k).trim())) || 'ACTUAL SCORE';
                    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';

                    secondSheetDataRaw.forEach((r) => {
                      const custName = (r[sh2CustomerNameKey] ?? r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? '').toString().trim();
                      if (custName !== PREMIER_HEALTHCARE_NAME) return;

                      const portfolio = (r[sh2PortfolioKey] ?? r['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
                      const portfolioKey = normalizePortfolioKey(portfolio);
                      const receivedVal = r[sh2ReceivedDateKey] ?? r['CSAT RECEIVED DATE'] ?? r['CSS_RECEIVED_DATE'];
                      // Use MM-DD-YYYY normalization for comparison (sheet can contain Excel serials or MM-DD-YYYY strings)
                      const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
                      if (!receivedFormatted || !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return;

                      const scoreValRaw = r[sh2ActualScoreKey] ?? r['ACTUAL SCORE'] ?? r['Actual Score'];
                      const scoreNum = typeof scoreValRaw === 'number' ? scoreValRaw : parseFloat(String(scoreValRaw ?? '').trim());
                      if (Number.isNaN(scoreNum)) return;

                      const cur = scoreByPortfolio.get(portfolioKey) || { sum: 0, count: 0 };
                      cur.sum += scoreNum;
                      cur.count += 1;
                      scoreByPortfolio.set(portfolioKey, cur);
                      overallScoreSum += scoreNum;
                      overallScoreCount += 1;
                    });
                  }

                  const rows = premierHealthcarePortfolioData.data.map((row) => {
                    const polled = Number(row.Polled) || 0;
                    const responded = Number(row.Responded) || 0;
                    const rate = polled > 0 ? ((responded / polled) * 100) : null;
                    const scoreAgg = scoreByPortfolio.get(normalizePortfolioKey(row.portfolio)) || null;
                    const avgScore = scoreAgg && scoreAgg.count > 0 ? (scoreAgg.sum / scoreAgg.count) : null;
                    return {
                      sNo: row.sNo,
                      businessUnit: row.businessUnit,
                      portfolio: row.portfolio,
                      polled,
                      responded,
                      rate,
                      avgScore
                    };
                  });

                  const trendByPortfolio = (premierHealthcareTrendPortfolioData?.data || []).reduce((acc, d) => {
                    acc[(d.portfolio || 'N/A')] = d;
                    return acc;
                  }, {});

                  rows.forEach((r) => {
                    const trendRow = trendByPortfolio[r.portfolio || 'N/A'];
                    const rateTrend = trendRow?.rate;
                    const avgScoreTrend = trendRow?.avgScore;
                    const diffRate = (r.rate != null && rateTrend != null && !Number.isNaN(r.rate) && !Number.isNaN(rateTrend)) ? (r.rate - rateTrend) : null;
                    const rrTrendText = diffRate == null ? '-' : `${diffRate >= 0 ? '+' : ''}${diffRate.toFixed(2)}% ${diffRate > 0 ? '↑' : diffRate < 0 ? '↓' : '−'}`;
                    const diffScore = (r.avgScore != null && avgScoreTrend != null && !Number.isNaN(r.avgScore) && !Number.isNaN(avgScoreTrend)) ? (r.avgScore - avgScoreTrend) : null;
                    const scoreTrendText = diffScore == null ? '-' : `${diffScore > 0 ? '+' : ''}${diffScore.toFixed(2)} ${diffScore > 0 ? '↑' : diffScore < 0 ? '↓' : '−'}`;
                    const rowData = [
                      r.sNo,
                      normalizeBusinessUnitDisplay(r.businessUnit),
                      r.portfolio,
                      r.polled,
                      r.responded,
                      r.rate == null ? '-' : `${pctToFixed1(r.rate)}%`,
                      r.avgScore == null ? '-' : avgToFixed2(r.avgScore),
                      rrTrendText,
                      scoreTrendText
                    ];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 4)
                        ? { horizontal: 'center', vertical: 'middle', wrapText: true }
                        : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });

                    // Apply legend fills (Response Rate %, Average CSAT Score)
                    const rrCell = excelRow.getCell(6);
                    const rrBg = getResponseRateBg(r.rate);
                    if (rrBg) {
                      rrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rrBg } };
                      rrCell.font = { bold: true, color: { argb: rrBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    const avgCell = excelRow.getCell(7);
                    const avgBg = getAvgScoreBg(r.avgScore);
                    if (avgBg) {
                      avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: avgBg } };
                      avgCell.font = { bold: true, color: { argb: avgBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    // Response Rate Trend, Average CSAT Score Trend (columns 8, 9): difference + arrow, green up / red down
                    const rrTrendCell = excelRow.getCell(8);
                    rrTrendCell.font = { bold: true, color: { argb: diffRate == null ? 'FF000000' : diffRate > 0 ? 'FF166534' : diffRate < 0 ? 'FFDC2626' : 'FF6B7280' } };
                    const avgTrendCell = excelRow.getCell(9);
                    avgTrendCell.font = { bold: true, color: { argb: diffScore == null ? 'FF000000' : diffScore > 0 ? 'FF166534' : diffScore < 0 ? 'FFDC2626' : 'FF6B7280' } };
                  });

                  if (premierHealthcarePortfolioData.grandTotal) {
                    const gt = premierHealthcarePortfolioData.grandTotal;
                    const polled = Number(gt.Polled) || 0;
                    const responded = Number(gt.Responded) || 0;
                    const rate = polled > 0 ? ((responded / polled) * 100) : null;
                    const avgScore = overallScoreCount > 0 ? (overallScoreSum / overallScoreCount) : null;
                    const gtTrend = premierHealthcareTrendPortfolioData?.grandTotal || null;
                    const rateTrend = gtTrend?.rate;
                    const avgScoreTrend = gtTrend?.avgScore;
                    const diffRate = (rate != null && rateTrend != null && !Number.isNaN(rate) && !Number.isNaN(rateTrend)) ? (rate - rateTrend) : null;
                    const rrTrendText = diffRate == null ? '-' : `${diffRate >= 0 ? '+' : ''}${pctToFixed1(diffRate)}% ${diffRate > 0 ? '↑' : diffRate < 0 ? '↓' : '−'}`;
                    const diffScore = (avgScore != null && avgScoreTrend != null && !Number.isNaN(avgScore) && !Number.isNaN(avgScoreTrend)) ? (avgScore - avgScoreTrend) : null;
                    const scoreTrendText = diffScore == null ? '-' : `${diffScore > 0 ? '+' : ''}${diffScore.toFixed(2)} ${diffScore > 0 ? '↑' : diffScore < 0 ? '↓' : '−'}`;
                    const grandRow = sheet.addRow([
                      gt.sNo,
                      gt.businessUnit,
                      gt.portfolio,
                      polled,
                      responded,
                      rate == null ? '-' : `${pctToFixed1(rate)}%`,
                      avgScore == null ? '-' : avgToFixed2(avgScore),
                      rrTrendText,
                      scoreTrendText
                    ]);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 4)
                        ? { horizontal: 'center', vertical: 'middle', wrapText: true }
                        : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });

                    const rrCell = grandRow.getCell(6);
                    const rrBg = getResponseRateBg(rate);
                    if (rrBg) {
                      rrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rrBg } };
                      rrCell.font = { bold: true, color: { argb: rrBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    const avgCell = grandRow.getCell(7);
                    const avgBg = getAvgScoreBg(avgScore);
                    if (avgBg) {
                      avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: avgBg } };
                      avgCell.font = { bold: true, color: { argb: avgBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    const rrTrendCell = grandRow.getCell(8);
                    rrTrendCell.font = { bold: true, color: { argb: diffRate == null ? 'FF000000' : diffRate > 0 ? 'FF166534' : diffRate < 0 ? 'FFDC2626' : 'FF6B7280' } };
                    const avgTrendCell = grandRow.getCell(9);
                    avgTrendCell.font = { bold: true, color: { argb: diffScore == null ? 'FF000000' : diffScore > 0 ? 'FF166534' : diffScore < 0 ? 'FFDC2626' : 'FF6B7280' } };
                  }

                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 22;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 12;
                  sheet.getColumn(5).width = 12;
                  sheet.getColumn(6).width = 16;
                  sheet.getColumn(7).width = 18;
                  sheet.getColumn(8).width = 18;
                  sheet.getColumn(9).width = 22;
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });

                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Premier_Healthcare_Portfolio_Response_Rate_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Premier Healthcare Portfolio Response Rate Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Premier Healthcare Portfolio Response Rate as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>

          <div style={{ margin: '0 1rem 0.75rem', padding: '0.5rem', fontSize: '0.8rem', color: '#1E293B', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '700' }}>Legend (Response Rate %):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#dc2626', marginRight: 6, verticalAlign: 'middle' }} /> &lt; 50%</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} /> 50% to 74%</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#86efac', marginRight: 6, verticalAlign: 'middle', border: '1px solid #22c55e' }} /> ≥ 75%</span>
            <span style={{ fontWeight: '700', marginLeft: '0.75rem' }}>Legend (Average CSAT Score):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#dc2626', marginRight: 6, verticalAlign: 'middle' }} /> &lt; 4</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} /> 4 to 4.49</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#86efac', marginRight: 6, verticalAlign: 'middle', border: '1px solid #22c55e' }} /> ≥ 4.5</span>
          </div>

          <TableContainer>
            <Table role="table" aria-label="Premier Healthcare Portfolio-wise Response Rate">
              <TableHeader>
                <tr>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Sr. No.</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>BUSINESS UNIT</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Portfolio</Th>
                  <Th colSpan={4} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{acsatCycle || 'H2 2025'}</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Response Rate Trend</Th>
                  <Th rowSpan={2} style={{ textAlign: 'center', verticalAlign: 'middle', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Average CSAT Score Trend</Th>
                </tr>
                <tr>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Responded</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Response Rate %</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Average CSAT Score</Th>
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcarePortfolioData.data.map((row) => {
                  const trendRow = (premierHealthcareTrendPortfolioData?.data || []).find(d => (d.portfolio || 'N/A') === (row.portfolio || 'N/A'));
                  const rateTrend = trendRow?.rate;
                  const avgScoreTrend = trendRow?.avgScore != null ? trendRow.avgScore : null;
                  const getResponseRateStyle = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return {};
                    if (rateNum < 50) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (rateNum < 75) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  const getAvgScoreStyle = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return {};
                    if (scoreNum < 4) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (scoreNum < 4.5) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };

                  const polled = Number(row.Polled) || 0;
                  const responded = Number(row.Responded) || 0;
                  const rate = polled > 0 ? ((responded / polled) * 100) : null;
                  // Avg(ACTUAL SCORE) from second sheet, Premier Healthcare only, received date >= cycle start.
                  const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
                  let avgScore = null;
                  if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
                    const sh2First = secondSheetDataRaw[0] || {};
                    const sh2CustomerNameKey = Object.keys(sh2First).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
                    const sh2PortfolioKey = Object.keys(sh2First).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
                    const sh2ReceivedDateKey = Object.keys(sh2First).find(k => {
                      const lower = (k || '').toLowerCase();
                      return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
                    }) || 'CSAT RECEIVED DATE';
                    const sh2ActualScoreKey = Object.keys(sh2First).find(k => /actual\s*score/i.test(String(k).trim())) || 'ACTUAL SCORE';
                    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';

                    let sum = 0;
                    let cnt = 0;
                    secondSheetDataRaw.forEach((r) => {
                      const custName = (r[sh2CustomerNameKey] ?? r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? '').toString().trim();
                      if (custName !== PREMIER_HEALTHCARE_NAME) return;
                      const portfolio = (r[sh2PortfolioKey] ?? r['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
                      if (normalizePortfolioKey(portfolio) !== normalizePortfolioKey(row.portfolio || 'N/A')) return;

                      const receivedVal = r[sh2ReceivedDateKey] ?? r['CSAT RECEIVED DATE'] ?? r['CSS_RECEIVED_DATE'];
                      const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
                      if (!receivedFormatted || !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return;

                      const scoreValRaw = r[sh2ActualScoreKey] ?? r['ACTUAL SCORE'] ?? r['Actual Score'];
                      const scoreNum = typeof scoreValRaw === 'number' ? scoreValRaw : parseFloat(String(scoreValRaw ?? '').trim());
                      if (Number.isNaN(scoreNum)) return;
                      sum += scoreNum;
                      cnt += 1;
                    });
                    avgScore = cnt > 0 ? (sum / cnt) : null;
                  }
                  return (
                    <tr key={`ph-portfolio-rr-${row.sNo}-${row.portfolio}`}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{row.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{polled}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{responded}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getResponseRateStyle(rate) }}>{rate == null ? '-' : `${pctToFixed1(rate)}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getAvgScoreStyle(avgScore) }}>{avgScore == null ? '-' : avgToFixed2(avgScore)}</Td>
                      {(() => {
                        const diffRate = (rate != null && rateTrend != null && !Number.isNaN(rate) && !Number.isNaN(rateTrend)) ? (rate - rateTrend) : null;
                        const rrTrendText = diffRate == null ? '-' : `${diffRate >= 0 ? '+' : ''}${diffRate.toFixed(2)}% ${diffRate > 0 ? '↑' : diffRate < 0 ? '↓' : '−'}`;
                        const rrTrendColor = diffRate == null ? undefined : (diffRate > 0 ? '#166534' : diffRate < 0 ? '#dc2626' : '#6b7280');
                        return <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: rrTrendColor }}>{rrTrendText}</Td>;
                      })()}
                      {(() => {
                        const diffScore = (avgScore != null && avgScoreTrend != null && !Number.isNaN(avgScore) && !Number.isNaN(avgScoreTrend)) ? (avgScore - avgScoreTrend) : null;
                        const scoreTrendText = diffScore == null ? '-' : `${diffScore > 0 ? '+' : ''}${diffScore.toFixed(2)} ${diffScore > 0 ? '↑' : diffScore < 0 ? '↓' : '−'}`;
                        const scoreTrendColor = diffScore == null ? undefined : (diffScore > 0 ? '#166534' : diffScore < 0 ? '#dc2626' : '#6b7280');
                        return <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', color: scoreTrendColor }}>{scoreTrendText}</Td>;
                      })()}
                    </tr>
                  );
                })}
                {(() => {
                  const gt = premierHealthcarePortfolioData.grandTotal;
                  if (!gt) return null;
                  const polled = Number(gt.Polled) || 0;
                  const responded = Number(gt.Responded) || 0;
                  const rate = polled > 0 ? ((responded / polled) * 100) : null;
                  // Grand Total Avg(ACTUAL SCORE) from second sheet (Premier Healthcare only, received date >= cycle start).
                  const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
                  let avgScore = null;
                  if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
                    const sh2First = secondSheetDataRaw[0] || {};
                    const sh2CustomerNameKey = Object.keys(sh2First).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
                    const sh2ReceivedDateKey = Object.keys(sh2First).find(k => {
                      const lower = (k || '').toLowerCase();
                      return lower === 'csat received date' || lower.includes('csat_received_date') || lower.includes('css_received_date');
                    }) || 'CSAT RECEIVED DATE';
                    const sh2ActualScoreKey = Object.keys(sh2First).find(k => /actual\s*score/i.test(String(k).trim())) || 'ACTUAL SCORE';
                    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
                    let sum = 0;
                    let cnt = 0;
                    secondSheetDataRaw.forEach((r) => {
                      const custName = (r[sh2CustomerNameKey] ?? r['CUSTOMER NAME'] ?? r['CUST_NM'] ?? '').toString().trim();
                      if (custName !== PREMIER_HEALTHCARE_NAME) return;
                      const receivedVal = r[sh2ReceivedDateKey] ?? r['CSAT RECEIVED DATE'] ?? r['CSS_RECEIVED_DATE'];
                      const receivedFormatted = receivedVal ? parseExcelDateToMMDDYYYY(receivedVal) : '';
                      if (!receivedFormatted || !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return;
                      const scoreValRaw = r[sh2ActualScoreKey] ?? r['ACTUAL SCORE'] ?? r['Actual Score'];
                      const scoreNum = typeof scoreValRaw === 'number' ? scoreValRaw : parseFloat(String(scoreValRaw ?? '').trim());
                      if (Number.isNaN(scoreNum)) return;
                      sum += scoreNum;
                      cnt += 1;
                    });
                    avgScore = cnt > 0 ? (sum / cnt) : null;
                  }

                  const getResponseRateStyle = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return {};
                    if (rateNum < 50) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (rateNum < 75) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  const getAvgScoreStyle = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return {};
                    if (scoreNum < 4) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (scoreNum < 4.5) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };

                  const gtTrend = premierHealthcareTrendPortfolioData?.grandTotal || null;
                  const rateTrend = gtTrend?.rate;
                  const avgScoreTrend = gtTrend?.avgScore;
                  const diffRate = (rate != null && rateTrend != null && !Number.isNaN(rate) && !Number.isNaN(rateTrend)) ? (rate - rateTrend) : null;
                  const rrTrendText = diffRate == null ? '-' : `${diffRate >= 0 ? '+' : ''}${diffRate.toFixed(2)}% ${diffRate > 0 ? '↑' : diffRate < 0 ? '↓' : '−'}`;
                  const rrTrendColor = diffRate == null ? undefined : (diffRate > 0 ? '#166534' : diffRate < 0 ? '#dc2626' : '#6b7280');
                  const diffScore = (avgScore != null && avgScoreTrend != null && !Number.isNaN(avgScore) && !Number.isNaN(avgScoreTrend)) ? (avgScore - avgScoreTrend) : null;
                  const scoreTrendText = diffScore == null ? '-' : `${diffScore > 0 ? '+' : ''}${diffScore.toFixed(2)} ${diffScore > 0 ? '↑' : diffScore < 0 ? '↓' : '−'}`;
                  const scoreTrendColor = diffScore == null ? undefined : (diffScore > 0 ? '#166534' : diffScore < 0 ? '#dc2626' : '#6b7280');

                  return (
                    <tr key="ph-portfolio-rr-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{polled}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{responded}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getResponseRateStyle(rate) }}>{rate == null ? '-' : `${pctToFixed1(rate)}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getAvgScoreStyle(avgScore) }}>{avgScore == null ? '-' : avgToFixed2(avgScore)}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', color: rrTrendColor }}>{rrTrendText}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0', color: scoreTrendColor }}>{scoreTrendText}</Td>
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Premier Healthcare (L80) – Portfolio-wise Response Rate (Trend Analysis): from trend file Sheet2 "CSAT sent and received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by Portfolio. Same columns and legends. */}
      {!showBUWiseView && !showTop10 && trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioData.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#FEF3C7', border: '1px solid #F59E0B', borderRadius: '8px', fontSize: '0.95rem', color: '#92400E', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Premier Healthcare Solutions Inc (L80) – Portfolio-wise Response Rate (Trend Analysis). Data from <strong>&quot;Upload data for trend analysis&quot;</strong> file ({premierHealthcareTrendPortfolioData.trendFileName}), the Customer Success Survey Status report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, group by Portfolio. #Polled, #Responded, Response Rate %, Average CSAT Score. Dates &gt;= CSAT cycle start (MM-DD-YYYY).</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const getResponseRateBg = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return null;
                    if (rateNum < 50) return 'FFDC2626';
                    if (rateNum < 75) return 'FFF59E0B';
                    return 'FF86EFAC';
                  };
                  const getAvgScoreBg = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return null;
                    if (scoreNum < 4) return 'FFDC2626';
                    if (scoreNum < 4.5) return 'FFF59E0B';
                    return 'FF86EFAC';
                  };
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('PH Portfolio Response Rate (Trend)', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const headers = ['Sr. No.', 'BUSINESS UNIT', 'Portfolio', '#Polled', '#Responded', 'Response Rate %', 'Average CSAT Score'];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF92400E' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  });
                  premierHealthcareTrendPortfolioData.data.forEach((r) => {
                    const rowData = [
                      r.sNo,
                      normalizeBusinessUnitDisplay(r.businessUnit),
                      r.portfolio,
                      r.Polled ?? 0,
                      r.Responded ?? 0,
                      r.rate == null ? '-' : `${pctToFixed1(r.rate)}%`,
                      r.avgScore == null ? '-' : avgToFixed2(r.avgScore)
                    ];
                    const excelRow = sheet.addRow(rowData);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 4) ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });
                    const rrCell = excelRow.getCell(6);
                    const rrBg = getResponseRateBg(r.rate);
                    if (rrBg) {
                      rrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rrBg } };
                      rrCell.font = { bold: true, color: { argb: rrBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    const avgCell = excelRow.getCell(7);
                    const avgBg = getAvgScoreBg(r.avgScore);
                    if (avgBg) {
                      avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: avgBg } };
                      avgCell.font = { bold: true, color: { argb: avgBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                  });
                  if (premierHealthcareTrendPortfolioData.grandTotal) {
                    const gt = premierHealthcareTrendPortfolioData.grandTotal;
                    const grandRow = sheet.addRow([
                      gt.sNo,
                      gt.businessUnit,
                      gt.portfolio,
                      gt.Polled ?? 0,
                      gt.Responded ?? 0,
                      gt.rate == null ? '-' : `${pctToFixed1(gt.rate)}%`,
                      gt.avgScore == null ? '-' : avgToFixed2(gt.avgScore)
                    ]);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 4) ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });
                    const rrCell = grandRow.getCell(6);
                    const rrBg = getResponseRateBg(gt.rate);
                    if (rrBg) {
                      rrCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rrBg } };
                      rrCell.font = { bold: true, color: { argb: rrBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                    const avgCell = grandRow.getCell(7);
                    const avgBg = getAvgScoreBg(gt.avgScore);
                    if (avgBg) {
                      avgCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: avgBg } };
                      avgCell.font = { bold: true, color: { argb: avgBg === 'FFDC2626' ? 'FFFFFFFF' : 'FF000000' } };
                    }
                  }
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 22;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 12;
                  sheet.getColumn(5).width = 12;
                  sheet.getColumn(6).width = 16;
                  sheet.getColumn(7).width = 18;
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Premier_Healthcare_Portfolio_Response_Rate_Trend_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Premier Healthcare Trend Portfolio Response Rate Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#D97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Trend Portfolio Response Rate as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem 0.75rem', padding: '0.5rem', fontSize: '0.8rem', color: '#1E293B', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '700' }}>Legend (Response Rate %):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#dc2626', marginRight: 6, verticalAlign: 'middle' }} /> &lt; 50%</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} /> 50% to 74%</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#86efac', marginRight: 6, verticalAlign: 'middle', border: '1px solid #22c55e' }} /> ≥ 75%</span>
            <span style={{ fontWeight: '700', marginLeft: '0.75rem' }}>Legend (Average CSAT Score):</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#dc2626', marginRight: 6, verticalAlign: 'middle' }} /> &lt; 4</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#f59e0b', marginRight: 6, verticalAlign: 'middle' }} /> 4 to 4.49</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#86efac', marginRight: 6, verticalAlign: 'middle', border: '1px solid #22c55e' }} /> ≥ 4.5</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Premier Healthcare Portfolio-wise Response Rate (Trend Analysis)">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>BUSINESS UNIT</Th>
                  <Th style={{ textAlign: 'center' }}>Portfolio</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  <Th style={{ textAlign: 'center' }}>Response Rate %</Th>
                  <Th style={{ textAlign: 'center' }}>Average CSAT Score</Th>
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcareTrendPortfolioData.data.map((row) => {
                  const getResponseRateStyle = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return {};
                    if (rateNum < 50) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (rateNum < 75) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  const getAvgScoreStyle = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return {};
                    if (scoreNum < 4) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (scoreNum < 4.5) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  return (
                    <tr key={`ph-trend-rr-${row.sNo}-${row.portfolio}`}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{row.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Responded ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getResponseRateStyle(row.rate) }}>{row.rate == null ? '-' : `${pctToFixed1(row.rate)}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getAvgScoreStyle(row.avgScore) }}>{row.avgScore == null ? '-' : avgToFixed2(row.avgScore)}</Td>
                    </tr>
                  );
                })}
                {premierHealthcareTrendPortfolioData.grandTotal && (() => {
                  const gt = premierHealthcareTrendPortfolioData.grandTotal;
                  const getResponseRateStyle = (rateNum) => {
                    if (rateNum == null || Number.isNaN(rateNum)) return {};
                    if (rateNum < 50) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (rateNum < 75) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  const getAvgScoreStyle = (scoreNum) => {
                    if (scoreNum == null || Number.isNaN(scoreNum)) return {};
                    if (scoreNum < 4) return { backgroundColor: '#dc2626', color: '#ffffff' };
                    if (scoreNum < 4.5) return { backgroundColor: '#f59e0b', color: '#000000' };
                    return { backgroundColor: '#86efac', color: '#000000' };
                  };
                  return (
                    <tr key="ph-trend-rr-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Responded ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getResponseRateStyle(gt.rate) }}>{gt.rate == null ? '-' : `${pctToFixed1(gt.rate)}%`}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getAvgScoreStyle(gt.avgScore) }}>{gt.avgScore == null ? '-' : avgToFixed2(gt.avgScore)}</Td>
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* New dashboard: Trend Analysis – Portfolio-wise Perspective wise Avg rating. #Polled/#Responded from Sheet2; perspective columns = avg(RATING) from trend file "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by Portfolio. */}
      {!showBUWiseView && !showTop10 && trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioWithPerspectives.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#DBEAFE', border: '1px solid #3B82F6', borderRadius: '8px', fontSize: '0.95rem', color: '#1E40AF', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Trend Analysis – Portfolio-wise Perspective wise Avg rating. Data from <strong>&quot;Upload data for trend analysis&quot;</strong> file ({premierHealthcareTrendPortfolioWithPerspectives.trendFileName}). #Polled, #Responded from the Customer Success Survey Status report; perspective columns = average RATING from the Customer Success Survey All PCSAT report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, group by Portfolio.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Trend Portfolio Perspective Avg', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const perspectives = premierHealthcareTrendPortfolioWithPerspectives.perspectives || [];
                  const headers = ['Sr. No.', 'BUSINESS UNIT', 'Portfolio', '#Polled', '#Responded', ...perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  });
                  const formatPerspectiveDisplay = (v) => {
                    if (v == null || v === '' || Number.isNaN(Number(v))) return '-';
                    const num = Number(v);
                    return Number.isNaN(num) ? '-' : Number(avgToFixed2(num));
                  };
                  const getExcelPerspectiveFill = (val) => {
                    if (val === '-' || val === '－') return 'FFF9FAFB';
                    const num = parseFloat(val);
                    if (Number.isNaN(num)) return null;
                    if (num < 4) return 'FFFF0000';
                    if (num >= 4 && num < 4.5) return 'FFFFA500';
                    if (num >= 4.5) return 'FFC6EFCE';
                    return null;
                  };
                  const getExcelPerspectiveFont = (val) => {
                    if (val === '-' || val === '－') return { bold: true, color: { argb: 'FF6B7280' } };
                    const num = parseFloat(val);
                    if (Number.isNaN(num)) return { bold: true };
                    if (num < 4) return { bold: true, color: { argb: 'FFFFFFFF' } };
                    return { bold: true, color: { argb: 'FF000000' } };
                  };
                  premierHealthcareTrendPortfolioWithPerspectives.data.forEach((r) => {
                    const perspectiveAvgs = r.perspectiveAvgs || {};
                    const excelRow = sheet.addRow([
                      r.sNo,
                      normalizeBusinessUnitDisplay(r.businessUnit),
                      r.portfolio,
                      r.Polled ?? 0,
                      r.Responded ?? 0,
                      ...perspectives.map(p => formatPerspectiveDisplay(perspectiveAvgs[p]))
                    ]);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 3) ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });
                    perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(perspectiveAvgs[p]);
                      const cell = excelRow.getCell(6 + idx);
                      const fill = getExcelPerspectiveFill(val);
                      if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
                      cell.font = getExcelPerspectiveFont(val);
                    });
                  });
                  if (premierHealthcareTrendPortfolioWithPerspectives.grandTotal) {
                    const gt = premierHealthcareTrendPortfolioWithPerspectives.grandTotal;
                    const gtAvgs = gt.perspectiveAvgs || {};
                    const grandRow = sheet.addRow([
                      gt.sNo,
                      gt.businessUnit,
                      gt.portfolio,
                      gt.Polled ?? 0,
                      gt.Responded ?? 0,
                      ...perspectives.map(p => formatPerspectiveDisplay(gtAvgs[p]))
                    ]);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      cell.alignment = (colNumber === 1 || colNumber >= 3) ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: 'left', vertical: 'middle', wrapText: true };
                    });
                    perspectives.forEach((p, idx) => {
                      const val = formatPerspectiveDisplay(gtAvgs[p]);
                      const cell = grandRow.getCell(6 + idx);
                      const fill = getExcelPerspectiveFill(val);
                      if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
                      cell.font = getExcelPerspectiveFont(val);
                    });
                  }
                  const legendStartRow = (premierHealthcareTrendPortfolioWithPerspectives.data.length + (premierHealthcareTrendPortfolioWithPerspectives.grandTotal ? 1 : 0)) + 3;
                  sheet.getRow(legendStartRow).getCell(1).value = 'Legend:';
                  sheet.getRow(legendStartRow).getCell(1).font = { bold: true, size: 12 };
                  sheet.getRow(legendStartRow + 1).getCell(1).value = '< 4 (Red - White Text)';
                  sheet.getRow(legendStartRow + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  sheet.getRow(legendStartRow + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
                  sheet.getRow(legendStartRow + 2).getCell(1).value = '4 to 4.49 (Orange - Black Text)';
                  sheet.getRow(legendStartRow + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  sheet.getRow(legendStartRow + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
                  sheet.getRow(legendStartRow + 3).getCell(1).value = '>= 4.5 (Green - Black Text)';
                  sheet.getRow(legendStartRow + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                  sheet.getRow(legendStartRow + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 22;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 12;
                  sheet.getColumn(5).width = 12;
                  perspectives.forEach((_, i) => { sheet.getColumn(6 + i).width = 18; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Trend_Analysis_Portfolio_Perspective_Avg_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Trend Portfolio Perspective Avg Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Trend Portfolio Perspective-wise Avg rating as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 4 (Red – White Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 4 to 4.49 (Orange – Black Text)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#c6efce', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 4.5 (Green – Black Text)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Trend Analysis Portfolio-wise Perspective wise Avg rating">
              <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>BUSINESS UNIT</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>Portfolio</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>#Responded</Th>
                  {(premierHealthcareTrendPortfolioWithPerspectives.perspectives || []).map((p) => (
                    <Th key={`th-${p}`} style={{ textAlign: 'center', backgroundColor: '#1e3a8a', color: '#fff', border: '1px solid #e5e7eb' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcareTrendPortfolioWithPerspectives.data.map((row) => {
                  const perspectiveAvgs = row.perspectiveAvgs || {};
                  const formatVal = (v) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : '-');
                  const getDisplayVal = (v) => (typeof formatVal(v) === 'number' ? formatVal(v).toFixed(2) : formatVal(v));
                  return (
                    <tr key={`trend-polled-resp-${row.sNo}-${row.portfolio}`}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{row.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Responded ?? 0}</Td>
                      {(premierHealthcareTrendPortfolioWithPerspectives.perspectives || []).map((p) => {
                        const displayVal = getDisplayVal(perspectiveAvgs[p]);
                        return (
                          <Td key={`td-${row.portfolio}-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '600', backgroundColor: getCellColor(displayVal), color: getTextColor(displayVal) }}>{displayVal}</Td>
                        );
                      })}
                    </tr>
                  );
                })}
                {premierHealthcareTrendPortfolioWithPerspectives.grandTotal && (() => {
                  const gt = premierHealthcareTrendPortfolioWithPerspectives.grandTotal;
                  const gtAvgs = gt.perspectiveAvgs || {};
                  const formatVal = (v) => (v != null && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : '-');
                  const getDisplayVal = (v) => (typeof formatVal(v) === 'number' ? formatVal(v).toFixed(2) : formatVal(v));
                  return (
                    <tr key="trend-polled-resp-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Responded ?? 0}</Td>
                      {(premierHealthcareTrendPortfolioWithPerspectives.perspectives || []).map((p) => {
                        const displayVal = getDisplayVal(gtAvgs[p]);
                        return (
                          <Td key={`gt-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: getCellColor(displayVal), color: getTextColor(displayVal) }}>{displayVal}</Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Trend of Satisfied Customer – Portfolio-wise % Satisfied (by Perspective): sheet "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Value = (count RATING 4 or 5 per perspective / count of data input for that perspective) × 100. Grand Total = sum(satisfied) / sum(data input per perspective). */}
      {!showBUWiseView && !showTop10 && trendAnalysisFiles?.length > 0 && premierHealthcareTrendPortfolioSatisfiedPct.data.length > 0 && (
        <>
          <div style={{ margin: '2rem 1rem 0.5rem', padding: '0.75rem', background: '#D1FAE5', border: '1px solid #059669', borderRadius: '8px', fontSize: '0.95rem', color: '#065F46', fontWeight: '600', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>Trend of Satisfied Customer – Portfolio-wise % Satisfied (by Perspective). Data from <strong>&quot;Upload data for trend analysis&quot;</strong> file ({premierHealthcareTrendPortfolioSatisfiedPct.trendFileName}), the Customer Success Survey All PCSAT report, CUSTOMER NAME = &quot;Premier Healthcare Solutions Inc (L80)&quot;, group by Portfolio. Perspective % = (count of RATING 4 or 5 for that perspective / count of data input for that perspective) × 100. Grand Total = sum(satisfied per perspective) / sum(data input per perspective). Polled/Responded from the Customer Success Survey Status report.</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  const workbook = new ExcelJS.Workbook();
                  const sheet = workbook.addWorksheet('Trend_Satisfied_Customer_Portfolio', { views: [{ state: 'frozen', ySplit: 1 }] });
                  const perspectives = premierHealthcareTrendPortfolioSatisfiedPct.perspectives || [];
                  const headers = ['Sr. No.', 'Business Unit', 'Portfolio', 'Polled', 'Responded', ...perspectives.map(p => normalizePerspectiveForDisplay(p))];
                  sheet.addRow(headers);
                  const headerRow = sheet.getRow(1);
                  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } };
                  headerRow.height = 30;
                  headerRow.eachCell((cell) => {
                    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                  });
                  const getPctFill = (val) => {
                    if (val == null || val === '-' || val === '－') return 'FFF9FAFB';
                    const num = typeof val === 'number' ? val : parseFloat(val);
                    if (Number.isNaN(num)) return null;
                    if (num < 75) return 'FFFF0000';
                    if (num >= 75 && num < 90) return 'FFFFA500';
                    return 'FF70AD47';
                  };
                  const getPctFont = (val) => {
                    if (val == null || val === '-' || val === '－') return { bold: true, color: { argb: 'FF6B7280' } };
                    const num = typeof val === 'number' ? val : parseFloat(val);
                    if (Number.isNaN(num)) return { bold: true };
                    if (num < 75) return { bold: true, color: { argb: 'FFFFFFFF' } };
                    return { bold: true, color: { argb: 'FF000000' } };
                  };
                  premierHealthcareTrendPortfolioSatisfiedPct.data.forEach((r) => {
                    const pct = r.perspectivePct || {};
                    const excelRow = sheet.addRow([
                      r.sNo,
                      normalizeBusinessUnitDisplay(r.businessUnit),
                      r.portfolio,
                      r.Polled ?? 0,
                      r.Responded ?? 0,
                      ...perspectives.map(p => (pct[p] != null ? `${pct[p]}%` : '-'))
                    ]);
                    excelRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.alignment = (colNumber <= 5) ? (colNumber === 1 ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: colNumber <= 3 ? 'left' : 'center', vertical: 'middle', wrapText: true }) : { horizontal: 'center', vertical: 'middle', wrapText: true };
                    });
                    perspectives.forEach((p, idx) => {
                      const val = pct[p];
                      const cell = excelRow.getCell(6 + idx);
                      const fill = getPctFill(val);
                      if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
                      cell.font = getPctFont(val);
                    });
                  });
                  if (premierHealthcareTrendPortfolioSatisfiedPct.grandTotal) {
                    const gt = premierHealthcareTrendPortfolioSatisfiedPct.grandTotal;
                    const gtPct = gt.perspectivePct || {};
                    const grandRow = sheet.addRow([
                      gt.sNo,
                      gt.businessUnit,
                      gt.portfolio,
                      gt.Polled ?? 0,
                      gt.Responded ?? 0,
                      ...perspectives.map(p => (gtPct[p] != null ? `${gtPct[p]}%` : '-'))
                    ]);
                    grandRow.eachCell((cell, colNumber) => {
                      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                      cell.font = { bold: true };
                      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
                      cell.alignment = (colNumber <= 5) ? (colNumber === 1 ? { horizontal: 'center', vertical: 'middle', wrapText: true } : { horizontal: colNumber <= 3 ? 'left' : 'center', vertical: 'middle', wrapText: true }) : { horizontal: 'center', vertical: 'middle', wrapText: true };
                    });
                    perspectives.forEach((p, idx) => {
                      const val = gtPct[p];
                      const cell = grandRow.getCell(6 + idx);
                      const fill = getPctFill(val);
                      if (fill) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
                      cell.font = getPctFont(val);
                    });
                  }
                  const legendStartRow = (premierHealthcareTrendPortfolioSatisfiedPct.data.length + (premierHealthcareTrendPortfolioSatisfiedPct.grandTotal ? 1 : 0)) + 3;
                  sheet.getRow(legendStartRow).getCell(1).value = 'Legend:';
                  sheet.getRow(legendStartRow).getCell(1).font = { bold: true, size: 12 };
                  sheet.getRow(legendStartRow + 1).getCell(1).value = '< 75% (Red - White Text)';
                  sheet.getRow(legendStartRow + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  sheet.getRow(legendStartRow + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
                  sheet.getRow(legendStartRow + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
                  sheet.getRow(legendStartRow + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  sheet.getRow(legendStartRow + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
                  sheet.getRow(legendStartRow + 3).getCell(1).value = '>= 90% (Green - Black Text)';
                  sheet.getRow(legendStartRow + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  sheet.getRow(legendStartRow + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
                  sheet.getColumn(1).width = 8;
                  sheet.getColumn(2).width = 22;
                  sheet.getColumn(3).width = 28;
                  sheet.getColumn(4).width = 12;
                  sheet.getColumn(5).width = 12;
                  perspectives.forEach((_, i) => { sheet.getColumn(6 + i).width = 18; });
                  sheet.eachRow((row, rowNumber) => { if (rowNumber > 1) row.height = 22; });
                  const buffer = await workbook.xlsx.writeBuffer();
                  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Trend_Satisfied_Customer_Portfolio_${csatCycleStartDateFormatted || 'export'}.xlsx`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error('Trend Satisfied Customer Portfolio Excel export error:', err);
                  alert('Failed to export Excel. Please try again.');
                }
              }}
              style={{ padding: '0.5rem 0.75rem', background: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
              title="Download Trend of Satisfied Customer – Portfolio-wise % as Excel"
            >
              <Download size={14} />
              Download Excel
            </button>
          </div>
          <div style={{ margin: '0 1rem', padding: '0.5rem', fontSize: '0.8rem', color: '#374151', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontWeight: '600' }}>Legend:</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#ff0000', marginRight: 4, verticalAlign: 'middle' }} /> &lt; 75% (Red)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#FFA500', marginRight: 4, verticalAlign: 'middle' }} /> 75% to 90% (Amber)</span>
            <span><span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: '#70AD47', marginRight: 4, verticalAlign: 'middle' }} /> &gt;= 90% (Green)</span>
          </div>
          <TableContainer>
            <Table role="table" aria-label="Trend of Satisfied Customer Portfolio-wise % Satisfied by Perspective">
                  <TableHeader>
                <tr>
                  <Th style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>Portfolio</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>Polled</Th>
                  <Th style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>Responded</Th>
                  {(premierHealthcareTrendPortfolioSatisfiedPct.perspectives || []).map((p) => (
                    <Th key={`th-sat-${p}`} style={{ textAlign: 'center', backgroundColor: '#059669', color: '#fff', border: '1px solid #e5e7eb' }}>{normalizePerspectiveForDisplay(p)}</Th>
                  ))}
                </tr>
              </TableHeader>
              <tbody>
                {premierHealthcareTrendPortfolioSatisfiedPct.data.map((row) => {
                  const pct = row.perspectivePct || {};
                  const getCellStyle = (val) => {
                    if (val == null || val === '-') return { backgroundColor: '#F9FAFB', color: '#6B7280' };
                    const num = typeof val === 'number' ? val : parseFloat(val);
                    if (Number.isNaN(num)) return {};
                    if (num < 75) return { backgroundColor: '#ff0000', color: '#fff', fontWeight: '700' };
                    if (num >= 75 && num < 90) return { backgroundColor: '#FFA500', color: '#000', fontWeight: '700' };
                    return { backgroundColor: '#70AD47', color: '#000', fontWeight: '700' };
                  };
                  return (
                    <tr key={`trend-sat-${row.sNo}-${row.portfolio}`}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle' }}>{row.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle' }}>{row.Responded ?? 0}</Td>
                      {(premierHealthcareTrendPortfolioSatisfiedPct.perspectives || []).map((p) => {
                        const val = pct[p];
                        const display = val != null ? `${val}%` : '-';
                        return (
                          <Td key={`td-sat-${row.portfolio}-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', ...getCellStyle(val) }}>{display}</Td>
                        );
                      })}
                    </tr>
                  );
                })}
                {premierHealthcareTrendPortfolioSatisfiedPct.grandTotal && (() => {
                  const gt = premierHealthcareTrendPortfolioSatisfiedPct.grandTotal;
                  const gtPct = gt.perspectivePct || {};
                  const getCellStyle = (val) => {
                    if (val == null || val === '-') return { backgroundColor: '#E2E8F0', color: '#6B7280', fontWeight: '700' };
                    const num = typeof val === 'number' ? val : parseFloat(val);
                    if (Number.isNaN(num)) return { backgroundColor: '#E2E8F0', fontWeight: '700' };
                    if (num < 75) return { backgroundColor: '#ff0000', color: '#fff', fontWeight: '700' };
                    if (num >= 75 && num < 90) return { backgroundColor: '#FFA500', color: '#000', fontWeight: '700' };
                    return { backgroundColor: '#70AD47', color: '#000', fontWeight: '700' };
                  };
                  return (
                    <tr key="trend-sat-grand-total" style={{ fontWeight: '700', backgroundColor: '#E2E8F0' }}>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.sNo}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.businessUnit}</Td>
                      <Td style={{ textAlign: 'left', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.portfolio}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', backgroundColor: '#E2E8F0' }}>{gt.Responded ?? 0}</Td>
                      {(premierHealthcareTrendPortfolioSatisfiedPct.perspectives || []).map((p) => {
                        const val = gtPct[p];
                        const display = val != null ? `${val}%` : '-';
                        return (
                          <Td key={`gt-sat-${p}`} style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '700', ...getCellStyle(val) }}>{display}</Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </>
      )}
      </>
      )}
    </DashboardContainer>
  );
};

export default AccountWiseAvgDashboard; 