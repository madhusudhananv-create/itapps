import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { Download, TrendingUp } from 'lucide-react';
import { useCSATContext } from '../context/CSATContext';

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
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: auto;
  max-height: 70vh;
  max-width: 100%;
`;

const Table = styled.table`
  width: 100%;
  min-width: 800px;
  border-collapse: collapse;
  border: 2px solid #6b7280;
`;

const TableHeader = styled.thead`
  background: #1e3a8a; /* Navy blue */
`;

const Th = styled.th`
  padding: 0.6rem 0.75rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: white;
  font-size: 0.8rem;
  text-transform: none;
  letter-spacing: 0.05em;
  white-space: nowrap;
  border: 1px solid #9ca3af;

  &:hover {
    background: #1e3a8a !important;
    cursor: pointer;
  }
`;

const Tbody = styled.tbody`
  background: white;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  color: #374151;
  font-size: 0.8rem;
  white-space: nowrap;
  border: 1px solid #6b7280;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
`;

const BusinessUnitTd = styled(Td)`
  font-weight: 500;
  color: #1f2937;
`;

const CustomerIdTd = styled(Td)`
  font-family: 'Courier New', monospace;
  color: #059669;
  font-weight: 500;
`;

const CustomerNameTd = styled(Td)`
  font-weight: 600;
  color: #1f2937;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
`;

const LoadingMessage = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem 0;
`;

const SearchContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
`;

const SearchTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  background: white;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
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

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
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

const DownloadButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;

  &:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ToggleButton = styled.button`
  background: ${props => props.active 
    ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' 
    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  };
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 1rem;

  &:hover {
    background: ${props => props.active 
      ? 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)' 
      : 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LegendContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const LegendTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 6px;
  background: #f8fafc;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #6b7280;
`;

const LegendText = styled.span`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
`;

const RatingCell = styled.td`
  padding: 1rem;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.4;
  max-width: 250px;
  min-width: 150px;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  border-radius: 4px;
  margin: 2px;
  
  /* Color coding based on rating value */
  background-color: ${props => {
    // Handle '-' (hyphen) as null for styling purposes
    if (props.rating === null || props.rating === undefined || props.rating === '-') return '#f3f4f6';
    if (typeof props.rating === 'number') {
    if (props.rating < 4) return '#FF0000'; // Red background (Excel standard)
    if (props.rating >= 4 && props.rating < 4.5) return '#FFA500'; // Orange background (Excel standard)
    if (props.rating >= 4.5) return '#C6EFCE'; // Light Green 2 (Excel standard) background
    }
    return '#f3f4f6';
  }};
  
  color: ${props => {
    // Handle '-' (hyphen) as null for styling purposes
    if (props.rating === null || props.rating === undefined || props.rating === '-') return '#6b7280';
    if (typeof props.rating === 'number') {
    if (props.rating < 4) return '#ffffff'; // White text for Red
    if (props.rating >= 4 && props.rating < 4.5) return '#000000'; // Black text for Orange
    if (props.rating >= 4.5) return '#000000'; // Black text for Light Green 2
    }
    return '#6b7280';
  }};
`;

const SummaryContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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

const PerspectiveList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PerspectiveItem = styled.div`
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

const PerspectiveName = styled.span`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.9rem;
`;

const PerspectiveRating = styled.span`
  font-weight: 700;
  color: #059669;
  font-size: 0.9rem;
`;

const BULevelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BUCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.5rem;
`;

const BUName = styled.h4`
  color: #1f2937;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3b82f6;
`;

const BUAnalysis = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BUAnalysisItem = styled.div`
  background: #f8fafc;
  border-radius: 6px;
  padding: 0.75rem;
`;

const BUAnalysisTitle = styled.div`
  font-weight: 600;
  color: #374151;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BUAnalysisList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BUAnalysisText = styled.span`
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.3;
`;

const PERSPECTIVE_DISPLAY_ORDER = [
  'Overall Experience',
  'Timeline Adherence',
  'Quality of Delivery',
  'Timely Resource Fulfillment',
  'Resource Competency',
  'Risk Management & Responsiveness',
  'Thought Leadership'
];

const normalizePerspectiveForDisplay = (p) => {
  if (p == null) return p;
  const raw = String(p).trim().replace(/\u00a0/g, ' ').trim();
  if (!raw) return p;
  const s = raw.replace(/\(\s*%\s*\)/g, '').replace(/%/g, '').replace(/\s+/g, ' ').trim();
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

const getPerspectiveOrderIndex = (p) => {
  if (!p) return PERSPECTIVE_DISPLAY_ORDER.length;
  const normalized = normalizePerspectiveForDisplay(p);
  const i = PERSPECTIVE_DISPLAY_ORDER.indexOf(normalized);
  return i !== -1 ? i : PERSPECTIVE_DISPLAY_ORDER.length;
};

const sortPerspectivesByDisplayOrder = (arr) => {
  if (!arr || arr.length === 0) return [];
  return [...arr]
    .map(p => normalizePerspectiveForDisplay(p))
    .filter((p, index, self) => self.indexOf(p) === index)
    .sort((a, b) => {
      const i = getPerspectiveOrderIndex(a);
      const j = getPerspectiveOrderIndex(b);
      if (i !== j) return i - j;
      return String(a).localeCompare(String(b));
    });
};

const normalizeBusinessUnitDisplay = (bu) => {
  if (bu == null || bu === '') return bu;
  const s = String(bu).trim();
  const buNorm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (buNorm === 'healthcare') return 'Healthcare';
  if (s.toLowerCase() === 'sead') return 'SEAD';
  return bu;
};

const ACSAT_MAIN_BU_PERSPECTIVES = [
  'Meeting Delivery Commitments',
  'Customer Engagement and Relationship',
  'Partner adding value to Customer Business'
];

const sortAcsatTrendPerspectives = (perspectives) => {
  const list = [...perspectives];
  return list.sort((a, b) => {
    const aTrim = String(a).trim();
    const bTrim = String(b).trim();
    const aIndex = ACSAT_MAIN_BU_PERSPECTIVES.indexOf(aTrim);
    const bIndex = ACSAT_MAIN_BU_PERSPECTIVES.indexOf(bTrim);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return aTrim.localeCompare(bTrim);
  });
};

const getBuWiseMainTrendColumnLabel = (perspective) => `${perspective} (Trend)`;

const parseDashboardPerspectiveValue = (row, perspective) => {
  if (!row) return null;
  const v = row[perspective];
  if (v === '-' || v == null || v === undefined || v === '') return null;
  const n = parseFloat(v);
  return Number.isNaN(n) ? null : n;
};

const computeBuPerspectiveTrendDiff = (mainValue, trendValue) => {
  if (mainValue == null || trendValue == null || Number.isNaN(mainValue) || Number.isNaN(trendValue)) {
    return null;
  }
  return Math.round((mainValue - trendValue) * 100) / 100;
};

const formatBuTrendDiffDisplay = (diff) => {
  if (diff == null || Number.isNaN(diff)) {
    return { text: '-', color: '#6b7280', excelColor: 'FF6B7280' };
  }
  const rounded = Math.round(diff * 100) / 100;
  const sign = rounded > 0 ? '+' : '';
  const valueText = `${sign}${rounded.toFixed(2)}`;
  if (rounded > 0) {
    return { text: `${valueText} ↑`, color: '#16a34a', excelColor: 'FF16A34A' };
  }
  if (rounded < 0) {
    return { text: `${valueText} ↓`, color: '#dc2626', excelColor: 'FFDC2626' };
  }
  return { text: '0.00 −', color: '#6b7280', excelColor: 'FF6B7280' };
};

const applyBuTrendDiffExcelCellStyle = (cell, diffDisplay) => {
  cell.value = diffDisplay.text;
  cell.font = { bold: true, color: { argb: diffDisplay.excelColor } };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

const normalizeBuTrendKey = (businessUnit) =>
  normalizeBusinessUnitDisplay(businessUnit)?.toString().trim().toLowerCase() || '';

const findBuWiseTrendRowForBusinessUnit = (businessUnit, trendRows) => {
  if (!trendRows?.length) return null;
  const key = normalizeBuTrendKey(businessUnit);
  if (!key) return null;
  const exact = trendRows.find((tr) => normalizeBuTrendKey(tr.businessUnit) === key);
  if (exact) return exact;
  return (
    trendRows.find((tr) => {
      const tk = normalizeBuTrendKey(tr.businessUnit);
      return tk.includes(key) || key.includes(tk);
    }) || null
  );
};

const getBuWiseTrendRatingFromRow = (trendRow, perspective) => {
  if (!trendRow) return null;
  const val = trendRow[perspective];
  if (val === '-' || val == null || val === '') return null;
  return val;
};

const normalizeTop10TrendKey = (businessUnit, customerName) => {
  const buKey = normalizeBuTrendKey(businessUnit);
  const custKey = normalizeCustomerIdKey(customerName)?.toString().trim().toLowerCase() || '';
  return `${buKey}|||${custKey}`;
};

const findTop10TrendRowForAccount = (businessUnit, customerName, trendRows) => {
  if (!trendRows?.length) return null;
  const key = normalizeTop10TrendKey(businessUnit, customerName);
  if (!key || key === '|||') return null;
  const exact = trendRows.find(
    (tr) => normalizeTop10TrendKey(tr.businessUnit, tr.customerName) === key
  );
  if (exact) return exact;
  return (
    trendRows.find((tr) => {
      const tk = normalizeTop10TrendKey(tr.businessUnit, tr.customerName);
      return tk.includes(key) || key.includes(tk);
    }) || null
  );
};

const findAccountWiseTrendRowForCustomer = (businessUnit, customerId, customerName, trendRows) => {
  if (!trendRows?.length) return null;
  const buKey = normalizeBuTrendKey(businessUnit);
  if (!buKey) return null;

  const idKey = normalizeCustomerIdKey(customerId)?.toString().trim().toLowerCase() || '';
  const nameKey = normalizeCustomerIdKey(customerName)?.toString().trim().toLowerCase() || '';

  if (idKey) {
    const byId = trendRows.find((tr) => {
      const trBu = normalizeBuTrendKey(tr.businessUnit);
      if (trBu !== buKey && !trBu.includes(buKey) && !buKey.includes(trBu)) return false;
      const trId = normalizeCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
      const trName = normalizeCustomerIdKey(tr.customerName)?.toString().trim().toLowerCase() || '';
      return trId === idKey || trName === idKey;
    });
    if (byId) return byId;
  }

  if (nameKey) {
    const byName = findTop10TrendRowForAccount(businessUnit, customerName, trendRows);
    if (byName) return byName;
  }

  return null;
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
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else date = new Date(dateValue);
      } else if (dateValue.includes('-')) {
        const parts = dateValue.split('-');
        if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else {
          date = new Date(dateValue);
        }
      } else {
        date = new Date(dateValue);
      }
    } else date = new Date(dateValue);
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch {
    return '';
  }
};

const findAcsatReceivedReportSheetName = (sheetNames) => {
  if (!sheetNames?.length) return null;
  const exact = sheetNames.find((n) => String(n).toLowerCase().trim() === 'csat received report');
  if (exact) return exact;
  return (
    sheetNames.find((n) => {
      const t = String(n).toLowerCase().trim();
      if (t.includes('sent and received') || t.includes('sent & received')) return false;
      return t.includes('csat received') || (t.includes('received') && !t.includes('sent'));
    }) || null
  );
};

const findAcsatSentReceivedSheetName = (sheetNames) => {
  if (!sheetNames?.length) return null;
  const exact = sheetNames.find((n) => String(n).toLowerCase().trim() === 'csat sent and received report');
  if (exact) return exact;
  return (
    sheetNames.find((n) => {
      const t = String(n).toLowerCase().trim();
      return t.includes('csat sent and received') || t.includes('sent and received');
    }) ||
    (sheetNames.length >= 2 ? sheetNames[1] : null)
  );
};

const normalizeHeaderLabel = (h) =>
  (h != null ? String(h).trim().toLowerCase() : '').replace(/\s+/g, ' ');

const findHeaderIndexInRow = (headers, predicate) =>
  headers.findIndex((h) => predicate(normalizeHeaderLabel(h)));

const isDateOnOrAfterCsatStart = (dateValue, cycleStartDate) => {
  if (!cycleStartDate || dateValue == null || dateValue === '') return true;
  try {
    const [month, day, year] = cycleStartDate.split('-');
    const cycleStart = new Date(year, month - 1, day);
    let parsedDate;
    if (typeof dateValue === 'number') {
      parsedDate = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      const dv = dateValue.trim();
      if (dv.includes('-')) {
        const parts = dv.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          parsedDate = new Date(dv);
        } else if (parts.length === 3) {
          parsedDate = new Date(parts[2], parts[0] - 1, parts[1]);
        } else {
          parsedDate = new Date(dv);
        }
      } else if (dv.includes('/')) {
        const [m, d, y] = dv.split('/');
        parsedDate = new Date(y, m - 1, d);
      } else {
        parsedDate = new Date(dv);
      }
    } else {
      parsedDate = new Date(dateValue);
    }
    if (isNaN(parsedDate.getTime())) return true;
    return parsedDate >= cycleStart;
  } catch {
    return true;
  }
};

const rowMatchesAcsatCycle = (row, acsatCycle) => {
  if (!acsatCycle) return true;
  const yq = String(row['YEAR - QUARTER'] || row.YEAR_QUARTER || '').trim();
  return !yq || yq === acsatCycle;
};

const rowPassesReceivedSheetDateFilter = (row, cycleStartFormatted) => {
  if (!cycleStartFormatted) return true;
  const received = row.csatReceivedDate;
  if (received == null || String(received).trim() === '') return true;
  return isDateOnOrAfterCsatStart(received, cycleStartFormatted);
};

const findAcsatTrendSheets = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sentReceivedSheetName = findAcsatSentReceivedSheetName(sheetNames) || sheetNames[0];
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames) || sheetNames[0];
  return { sentReceivedSheetName, receivedSheetName };
};

const sortTop10TrendRows = (rows, top10AccountNames) => {
  const top10OrderIndex = (customerName) => {
    const name = (customerName || '').toLowerCase();
    const idx = top10AccountNames.findIndex(
      (n) => name.includes(n.toLowerCase()) || n.toLowerCase().includes(name)
    );
    return idx === -1 ? 999 : idx;
  };
  return [...rows].sort((a, b) => {
    const posDiff = top10OrderIndex(a.customerName) - top10OrderIndex(b.customerName);
    if (posDiff !== 0) return posDiff;
    return (a.businessUnit || '').localeCompare(b.businessUnit || '');
  });
};

const findSheetColumn = (firstRow, matchers, fallback) => {
  const keys = Object.keys(firstRow || {});
  for (const matcher of matchers) {
    const found = keys.find((k) => matcher((k || '').trim()));
    if (found) return found;
  }
  const fallbackNorm = String(fallback).toLowerCase().replace(/[\s_]/g, '');
  const trimmedMatch = keys.find(
    (k) => (k || '').trim().toLowerCase().replace(/[\s_]/g, '') === fallbackNorm
  );
  return trimmedMatch || fallback;
};

const getTrendRowValue = (row, columnKey, ...fallbackNames) => {
  if (!row) return '';
  if (columnKey && row[columnKey] !== undefined && row[columnKey] !== '') return row[columnKey];
  const keys = Object.keys(row);
  const names = [columnKey, ...fallbackNames].filter(Boolean);
  for (const name of names) {
    const norm = String(name).toLowerCase().replace(/[\s_]/g, '');
    const key = keys.find((k) => (k || '').trim().toLowerCase().replace(/[\s_]/g, '') === norm);
    if (key !== undefined) return row[key];
  }
  return '';
};

const isTop10AccountRow = (row) => {
  const typeOfAccount = getTrendRowValue(row, null, 'TYPE OF ACCOUNT', 'Top 10').toString().trim();
  return typeOfAccount === 'Top 10' || typeOfAccount.toUpperCase() === 'Y';
};

const isOtherAccountRow = (row) => !isTop10AccountRow(row);

const buildAcsatTrendSummaryRow = (label, polled, responded, perspectiveAgg, perspectives) => {
  const row = {
    businessUnit: label,
    customerName: '-',
    Polled: polled,
    Responded: responded
  };
  (perspectives || []).forEach((p) => {
    const st = perspectiveAgg[p];
    row[p] = st && st.count > 0 ? Math.round((st.sum / st.count) * 100) / 100 : '-';
  });
  return row;
};

const buildAcsatTop10TrendFromFile = (file, { top10AccountNames }) => {
  const { sentReceivedSheetName, receivedSheetName } = findAcsatTrendSheets(file);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];
  const sentData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];

  if (!Array.isArray(receivedData) || receivedData.length === 0) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      hasData: false,
      error: 'CSAT received Report sheet not found or empty in uploaded trend file.'
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  const top10Sent = { polled: 0, responded: 0 };
  const otherSent = { polled: 0, responded: 0 };
  const top10PerspectiveAgg = {};
  const otherPerspectiveAgg = {};

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        customerName: meta.customerName,
        polled: 0,
        responded: 0,
        perspectiveAgg: {}
      });
    }
    return groups.get(key);
  };

  if (Array.isArray(sentData) && sentData.length > 0) {
    const firstSent = sentData[0] || {};
    const sentBuCol = findSheetColumn(
      firstSent,
      [
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
        k => (k || '').toLowerCase().includes('business unit')
      ],
      'BUSINESS UNIT'
    );
    const sentCustNameCol = findSheetColumn(
      firstSent,
      [
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
        k => (k || '').toLowerCase() === 'cust_nm'
      ],
      'CUSTOMER NAME'
    );
    const sentDateCol = findSheetColumn(
      firstSent,
      [
        k => {
          const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
        }
      ],
      'CSAT SENT DATE'
    );
    const receivedDateCol = findSheetColumn(
      firstSent,
      [
        k => {
          const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
        }
      ],
      'CSAT RECEIVED DATE'
    );

    sentData.forEach((row) => {
      const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, sentBuCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
      const sentDateValid = parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'));
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      const receivedDateValid = isCompletedStatus && !!parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'));

      if (isTop10AccountRow(row)) {
        if (bu && bu !== 'N/A') {
          if (sentDateValid) top10Sent.polled += 1;
          if (receivedDateValid) top10Sent.responded += 1;
        }
        if (!bu || bu === 'N/A') return;
        const accountName = getTrendRowValue(row, sentCustNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
        if (!accountName) return;

        const key = `${accountName}|||${bu}`;
        const agg = ensureGroup(key, { businessUnit: bu, customerName: accountName });
        if (sentDateValid) agg.polled += 1;
        if (receivedDateValid) agg.responded += 1;
      } else if (isOtherAccountRow(row)) {
        if (!bu || bu === 'N/A') return;
        if (sentDateValid) otherSent.polled += 1;
        if (receivedDateValid) otherSent.responded += 1;
      }
    });
  }

  const firstRow = receivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit'],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername'],
    'CUSTOMER NAME'
  );
  const questionCategoryCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
    'QUESTION_CATEGORY'
  );
  const perspectiveCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findSheetColumn(
    firstRow,
    [
      k => (k || '').toLowerCase() === 'rating',
      k => (k || '').toLowerCase().includes('rating')
    ],
    'RATING'
  );

  receivedData.forEach((row) => {
    const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
    if (questionCategory !== 'Criteria') return;

    const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
    if (!bu || bu === 'N/A') return;

    const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
    if (!perspective) return;
    const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
    if (isNaN(ratingNum)) return;

    perspectiveSet.add(perspective);

    if (isTop10AccountRow(row)) {
      const accountName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME').toString().trim();
      if (accountName) {
        const key = `${accountName}|||${bu}`;
        const agg = ensureGroup(key, { businessUnit: bu, customerName: accountName });
        if (!agg.perspectiveAgg[perspective]) agg.perspectiveAgg[perspective] = { sum: 0, count: 0 };
        agg.perspectiveAgg[perspective].sum += ratingNum;
        agg.perspectiveAgg[perspective].count += 1;
      }
      if (!top10PerspectiveAgg[perspective]) top10PerspectiveAgg[perspective] = { sum: 0, count: 0 };
      top10PerspectiveAgg[perspective].sum += ratingNum;
      top10PerspectiveAgg[perspective].count += 1;
    } else if (isOtherAccountRow(row)) {
      if (!otherPerspectiveAgg[perspective]) otherPerspectiveAgg[perspective] = { sum: 0, count: 0 };
      otherPerspectiveAgg[perspective].sum += ratingNum;
      otherPerspectiveAgg[perspective].count += 1;
    }
  });

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);

  const rows = sortTop10TrendRows(
    Array.from(groups.values()).map((g) => {
      const row = {
        businessUnit: g.businessUnit,
        customerName: g.customerName,
        Polled: g.polled,
        Responded: g.responded
      };
      perspectives.forEach((p) => {
        const st = g.perspectiveAgg[p];
        row[p] = st && st.count > 0 ? Math.round((st.sum / st.count) * 100) / 100 : '-';
      });
      return row;
    }),
    top10AccountNames || []
  );

  const top10AccountsTotal = rows.length > 0
    ? buildAcsatTrendSummaryRow('Top 10 Accounts', top10Sent.polled, top10Sent.responded, top10PerspectiveAgg, perspectives)
    : null;
  const otherAccountsTotal = rows.length > 0
    ? buildAcsatTrendSummaryRow('Other Accounts', otherSent.polled, otherSent.responded, otherPerspectiveAgg, perspectives)
    : null;

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    top10AccountsTotal,
    otherAccountsTotal,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No Top 10 Criteria rows found in CSAT received Report (TYPE OF ACCOUNT = Top 10, QUESTION_CATEGORY = Criteria).'
      : null
  };
};

const buildAcsatBuWiseTrendFromFile = (file) => {
  const { sentReceivedSheetName, receivedSheetName } = findAcsatTrendSheets(file);
  const sentData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];

  if (
    (!Array.isArray(sentData) || sentData.length === 0) &&
    (!Array.isArray(receivedData) || receivedData.length === 0)
  ) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      hasData: false,
      error: 'Trend file sheets not found or empty (CSAT sent and received Report / CSAT received Report).'
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  let orgPolled = 0;
  let orgResponded = 0;
  const orgPerspectiveAgg = {};

  const ensureBuGroup = (bu) => {
    if (!groups.has(bu)) {
      groups.set(bu, {
        businessUnit: bu,
        polled: 0,
        responded: 0,
        perspectiveAgg: {}
      });
    }
    return groups.get(bu);
  };

  if (Array.isArray(sentData) && sentData.length > 0) {
    const firstSent = sentData[0] || {};
    const sentBuCol = findSheetColumn(
      firstSent,
      [
        (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
        (k) => k.toLowerCase().includes('business unit')
      ],
      'BUSINESS UNIT'
    );
    const sentDateCol = findSheetColumn(
      firstSent,
      [
        (k) => {
          const kn = k.toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
        }
      ],
      'CSAT SENT DATE'
    );
    const receivedDateCol = findSheetColumn(
      firstSent,
      [
        (k) => {
          const kn = k.toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
        }
      ],
      'CSAT RECEIVED DATE'
    );

    sentData.forEach((row) => {
      const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, sentBuCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
      if (!bu || bu === 'N/A') return;
      const agg = ensureBuGroup(bu);
      if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'))) {
        agg.polled += 1;
        orgPolled += 1;
      }
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      if (isCompletedStatus && parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'))) {
        agg.responded += 1;
        orgResponded += 1;
      }
    });
  }

  if (Array.isArray(receivedData) && receivedData.length > 0) {
    const firstRow = receivedData[0] || {};
    const buCol = findSheetColumn(
      firstRow,
      [(k) => k.toLowerCase().replace(/[\s_]/g, '') === 'businessunit'],
      'BUSINESS UNIT'
    );
    const questionCategoryCol = findSheetColumn(
      firstRow,
      [(k) => k.toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
      'QUESTION_CATEGORY'
    );
    const perspectiveCol = findSheetColumn(
      firstRow,
      [(k) => k.toLowerCase().includes('perspective')],
      'PERSPECTIVE'
    );
    const ratingCol = findSheetColumn(
      firstRow,
      [
        (k) => k.toLowerCase() === 'rating',
        (k) => k.toLowerCase().includes('rating')
      ],
      'RATING'
    );

    receivedData.forEach((row) => {
      const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
      if (questionCategory !== 'Criteria') return;

      const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
      if (!bu || bu === 'N/A') return;

      const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
      if (!perspective) return;
      const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
      if (isNaN(ratingNum)) return;

      const agg = ensureBuGroup(bu);
      perspectiveSet.add(perspective);
      if (!agg.perspectiveAgg[perspective]) agg.perspectiveAgg[perspective] = { sum: 0, count: 0 };
      agg.perspectiveAgg[perspective].sum += ratingNum;
      agg.perspectiveAgg[perspective].count += 1;
      if (!orgPerspectiveAgg[perspective]) orgPerspectiveAgg[perspective] = { sum: 0, count: 0 };
      orgPerspectiveAgg[perspective].sum += ratingNum;
      orgPerspectiveAgg[perspective].count += 1;
    });
  }

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);

  const rows = Array.from(groups.values())
    .map((g) => {
      const row = {
        businessUnit: g.businessUnit,
        Polled: g.polled,
        Responded: g.responded
      };
      perspectives.forEach((p) => {
        const st = g.perspectiveAgg[p];
        row[p] = st && st.count > 0 ? Math.round((st.sum / st.count) * 100) / 100 : '-';
      });
      return row;
    })
    .sort((a, b) => (a.businessUnit || '').localeCompare(b.businessUnit || ''));

  const grandTotal = {
    businessUnit: 'Grand Total',
    Polled: orgPolled,
    Responded: orgResponded
  };
  perspectives.forEach((p) => {
    const st = orgPerspectiveAgg[p];
    grandTotal[p] = st && st.count > 0 ? Math.round((st.sum / st.count) * 100) / 100 : '-';
  });

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    grandTotal: rows.length > 0 ? grandTotal : null,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No BU-wise trend rows found (CSAT sent and received Report and/or Criteria rows in CSAT received Report).'
      : null
  };
};

const buildAcsatAccountWiseTrendFromFile = (file) => {
  const { sentReceivedSheetName, receivedSheetName } = findAcsatTrendSheets(file);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];
  const sentData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];

  if (!Array.isArray(receivedData) || receivedData.length === 0) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      hasData: false,
      error: 'CSAT received Report sheet not found or empty in uploaded trend file.'
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  let orgPolled = 0;
  let orgResponded = 0;
  const orgPerspectiveAgg = {};

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        customerId: meta.customerId || '',
        customerName: meta.customerName,
        polled: 0,
        responded: 0,
        perspectiveAgg: {}
      });
    }
    return groups.get(key);
  };

  if (Array.isArray(sentData) && sentData.length > 0) {
    const firstSent = sentData[0] || {};
    const sentBuCol = findSheetColumn(
      firstSent,
      [
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
        k => (k || '').toLowerCase().includes('business unit')
      ],
      'BUSINESS UNIT'
    );
    const sentCustNameCol = findSheetColumn(
      firstSent,
      [
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
        k => (k || '').toLowerCase() === 'cust_nm'
      ],
      'CUSTOMER NAME'
    );
    const sentCustIdCol = findSheetColumn(
      firstSent,
      [
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customerid',
        k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custid'
      ],
      'CUSTOMER_ID'
    );
    const sentDateCol = findSheetColumn(
      firstSent,
      [
        k => {
          const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
        }
      ],
      'CSAT SENT DATE'
    );
    const receivedDateCol = findSheetColumn(
      firstSent,
      [
        k => {
          const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
          return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
        }
      ],
      'CSAT RECEIVED DATE'
    );

    sentData.forEach((row) => {
      const customerName = getTrendRowValue(row, sentCustNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
      const customerId = getTrendRowValue(row, sentCustIdCol, 'CUSTOMER_ID', 'CUST_ID').toString().trim();
      const groupKey = customerId || customerName;
      if (!groupKey) return;

      const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, sentBuCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
      const sentDateValid = parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'));
      const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatus = statusVal === 'completed';
      const receivedDateValid = isCompletedStatus && !!parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'));

      const agg = ensureGroup(groupKey, {
        businessUnit: bu && bu !== 'N/A' ? bu : 'N/A',
        customerId: normalizeCustomerIdKey(customerId),
        customerName: customerName || groupKey
      });
      if (sentDateValid) {
        agg.polled += 1;
        orgPolled += 1;
      }
      if (receivedDateValid) {
        agg.responded += 1;
        orgResponded += 1;
      }
    });
  }

  const firstRow = receivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit'],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [
      k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
      k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      k => (k || '').toLowerCase() === 'cust_nm'
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findSheetColumn(
    firstRow,
    [
      k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custid'
    ],
    'CUSTOMER_ID'
  );
  const questionCategoryCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
    'QUESTION_CATEGORY'
  );
  const perspectiveCol = findSheetColumn(
    firstRow,
    [k => (k || '').toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findSheetColumn(
    firstRow,
    [
      k => (k || '').toLowerCase() === 'rating',
      k => (k || '').toLowerCase().includes('rating')
    ],
    'RATING'
  );

  receivedData.forEach((row) => {
    const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
    if (questionCategory !== 'Criteria') return;

    const bu = normalizeBusinessUnitDisplay(getTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A');
    const customerName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const customerId = getTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID').toString().trim();
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
    if (!perspective) return;
    const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
    if (isNaN(ratingNum)) return;

    perspectiveSet.add(perspective);
    const agg = ensureGroup(groupKey, {
      businessUnit: bu && bu !== 'N/A' ? bu : 'N/A',
      customerId: normalizeCustomerIdKey(customerId),
      customerName: customerName || groupKey
    });
    if (!agg.perspectiveAgg[perspective]) agg.perspectiveAgg[perspective] = { sum: 0, count: 0 };
    agg.perspectiveAgg[perspective].sum += ratingNum;
    agg.perspectiveAgg[perspective].count += 1;
    if (!orgPerspectiveAgg[perspective]) orgPerspectiveAgg[perspective] = { sum: 0, count: 0 };
    orgPerspectiveAgg[perspective].sum += ratingNum;
    orgPerspectiveAgg[perspective].count += 1;
  });

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);

  const rows = Array.from(groups.values())
    .filter((g) => Object.keys(g.perspectiveAgg).length > 0)
    .map((g) => {
      const row = {
        businessUnit: g.businessUnit,
        customerId: g.customerId || '',
        customerName: g.customerName,
        Polled: g.polled,
        Responded: g.responded
      };
      perspectives.forEach((p) => {
        const st = g.perspectiveAgg[p];
        row[p] = st && st.count > 0 ? Math.round((st.sum / st.count) * 100) / 100 : '-';
      });
      return row;
    })
    .sort((a, b) => {
      const buDiff = (a.businessUnit || '').localeCompare(b.businessUnit || '');
      if (buDiff !== 0) return buDiff;
      return (a.customerName || '').localeCompare(b.customerName || '');
    });

  const grandTotal = rows.length > 0
    ? buildAcsatTrendSummaryRow('Grand Total', orgPolled, orgResponded, orgPerspectiveAgg, perspectives)
    : null;

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    grandTotal,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No account-wise Criteria rows found in CSAT received Report (QUESTION_CATEGORY = Criteria).'
      : null
  };
};

const applyTrendRatingCellStyle = (cell, rating) => {
  if (rating !== null && !isNaN(rating) && isFinite(rating)) {
    if (rating < 4) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    } else if (rating < 4.5) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
    }
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cell.font = { color: { argb: 'FF6B7280' } };
  }
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

const appendTop10TrendSummaryRowToSheet = (trendSheet, summaryRow, perspectives, fillArgb) => {
  const dataRow = [
    '',
    summaryRow.businessUnit || '',
    summaryRow.customerName || '-',
    summaryRow.Polled ?? 0,
    summaryRow.Responded ?? 0,
    ...(perspectives || []).map((p) => {
      const val = summaryRow[p];
      if (val === '-' || val == null) return '-';
      return val;
    })
  ];
  const addedRow = trendSheet.addRow(dataRow);
  addedRow.height = 30;
  const ratingStartCol = 6;
  addedRow.eachCell((cell, colNumber) => {
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
    if (colNumber <= 3) {
      cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle', wrapText: true };
    } else if (colNumber === 4 || colNumber === 5) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.numFmt = '0';
    } else if (colNumber >= ratingStartCol) {
      const val = cell.value;
      const rating = (val === '-' || val == null) ? null : parseFloat(val);
      applyTrendRatingCellStyle(cell, rating);
      if (rating !== null && !isNaN(rating)) cell.numFmt = '0.00';
    }
  });
};

const addTop10TrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `Top10_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const headers = ['Sr. No.', 'Business Unit', 'Account Name', 'Polled', 'Responded', ...(fileData.perspectives || [])];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });
  trendHeaderRow.height = 40;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      row.businessUnit || '',
      row.customerName || '',
      row.Polled ?? 0,
      row.Responded ?? 0,
      ...(fileData.perspectives || []).map((p) => {
        const val = row[p];
        if (val === '-' || val == null) return '-';
        return val;
      })
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    const ratingStartCol = 6;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber <= 3) {
        cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= ratingStartCol) {
        const val = cell.value;
        const rating = (val === '-' || val == null) ? null : parseFloat(val);
        applyTrendRatingCellStyle(cell, rating);
        if (rating !== null && !isNaN(rating)) cell.numFmt = '0.00';
      }
    });
  });

  if (fileData.top10AccountsTotal) {
    appendTop10TrendSummaryRowToSheet(trendSheet, fileData.top10AccountsTotal, fileData.perspectives, 'FFE2E8F0');
  }
  if (fileData.otherAccountsTotal) {
    appendTop10TrendSummaryRowToSheet(trendSheet, fileData.otherAccountsTotal, fileData.perspectives, 'FFFED7AA');
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 25 },
    { width: 35 },
    { width: 12 },
    { width: 14 },
    ...(fileData.perspectives || []).map(() => ({ width: 22 }))
  ];
};

const addBuWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `BU_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const headers = ['Sr. No.', 'Business Unit', 'Polled', 'Responded', ...(fileData.perspectives || [])];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });
  trendHeaderRow.height = 40;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      row.businessUnit || '',
      row.Polled ?? 0,
      row.Responded ?? 0,
      ...(fileData.perspectives || []).map((p) => {
        const val = row[p];
        if (val === '-' || val == null) return '-';
        return val;
      })
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    const ratingStartCol = 5;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber <= 2) {
        cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle', wrapText: colNumber === 2 };
      } else if (colNumber === 3 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= ratingStartCol) {
        const val = cell.value;
        const rating = (val === '-' || val == null) ? null : parseFloat(val);
        applyTrendRatingCellStyle(cell, rating);
        if (rating !== null && !isNaN(rating)) cell.numFmt = '0.00';
      }
    });
  });

  if (fileData.grandTotal) {
    const gt = fileData.grandTotal;
    const grandRow = [
      '',
      gt.businessUnit || 'Grand Total',
      gt.Polled ?? 0,
      gt.Responded ?? 0,
      ...(fileData.perspectives || []).map((p) => {
        const val = gt[p];
        if (val === '-' || val == null) return '-';
        return val;
      })
    ];
    const addedGrandRow = trendSheet.addRow(grandRow);
    addedGrandRow.height = 30;
    const ratingStartCol = 5;
    addedGrandRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber <= 2) {
        cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle', wrapText: colNumber === 2 };
      } else if (colNumber === 3 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= ratingStartCol) {
        const val = cell.value;
        const rating = (val === '-' || val == null) ? null : parseFloat(val);
        applyTrendRatingCellStyle(cell, rating);
        if (rating !== null && !isNaN(rating)) cell.numFmt = '0.00';
      }
    });
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 28 },
    { width: 12 },
    { width: 14 },
    ...(fileData.perspectives || []).map(() => ({ width: 22 }))
  ];
};

const addAccountWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `Account_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const headers = ['Sr. No.', 'Business Unit', 'Account Name', 'Polled', 'Responded', ...(fileData.perspectives || [])];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' }
    };
  });
  trendHeaderRow.height = 40;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      row.businessUnit || '',
      row.customerName || '',
      row.Polled ?? 0,
      row.Responded ?? 0,
      ...(fileData.perspectives || []).map((p) => {
        const val = row[p];
        if (val === '-' || val == null) return '-';
        return val;
      })
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    const ratingStartCol = 6;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
      if (colNumber <= 3) {
        cell.alignment = { horizontal: colNumber === 1 ? 'center' : 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= ratingStartCol) {
        const val = cell.value;
        const rating = (val === '-' || val == null) ? null : parseFloat(val);
        applyTrendRatingCellStyle(cell, rating);
        if (rating !== null && !isNaN(rating)) cell.numFmt = '0.00';
      }
    });
  });

  if (fileData.grandTotal) {
    appendTop10TrendSummaryRowToSheet(trendSheet, fileData.grandTotal, fileData.perspectives, 'FFE2E8F0');
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 28 },
    { width: 35 },
    { width: 12 },
    { width: 14 },
    ...(fileData.perspectives || []).map(() => ({ width: 22 }))
  ];
};

function AccountLevelRatingDashboard({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, trendAnalysisFiles = [], onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupByBU, setGroupByBU] = useState(false);
  const [showTop10, setShowTop10] = useState(false);
  const [showAcsatTrendAnalysis, setShowAcsatTrendAnalysis] = useState(false);
  const acsatTrendSectionRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [secondSheetData, setSecondSheetData] = useState([]);
  
  // Top 10 account names in order
  const top10AccountNames = [
    'Premier Healthcare Solutions Inc (L80)',
    'Blue Cross Blue Shield Association BCBSA',
    'Frontier Airlines INC',
    'Tufts Medicine',
    'Premier - Horizon II - Covenant Health',
    'AgFirst Farm Credit Bank',
    'embecta MEDICAL II LLC',
    'BronxCare Health System',
    'Northern Trust Company',
    'Jewish Board of Family and Childrens Services JBFCS'
  ];
  
  // Account order for account-wise dashboard (only for account-wise view, not Top 10)
  const accountOrder = [
    'Premier Healthcare Solutions Inc (L80)',
    'Blue Cross Blue Shield Association BCBSA',
    'Frontier Airlines INC',
    'Tufts Medicine',
    'Premier - Horizon II - Covenant Health',
    'BronxCare Health System',
    'AgFirst Farm Credit Bank',
    'embecta MEDICAL II LLC',
    'Avaya LLC',
    'Northern Trust Company',
    'Jewish Board of Family and Childrens Services JBFCS',
    'Apollo Hospitals',
    'Aditya Birla Capital Digital Limited',
    'Healthfirst',
    'Firstsource Solutions Ltd',
    'Ooma Inc.',
    'Palo Alto Networks',
    'Hachette Book Group',
    'INFOBLOX INC.',
    'Arista Networks India Private Limited',
    'AthenaHealth',
    'VOCERA COMMUNICATIONS INDIA PRIVATE LIMITED',
    'Zoll Data Systems',
    'Foundation Building Materials, LLC',
    'CINQ CONNECT LLC',
    'ESSEN CARE MANAGEMENT LLC',
    'AgileOne',
    'Resonetics',
    'General Mills Private Limited',
    'Computer Data Source LLC',
    'Aditya Birla Sunlife AMC Limited',
    'Nerdio, Inc.',
    'CloudCall Ltd'
  ];
  
  // Get ACSAT cycle from global context
  const { acsatCycle } = useCSATContext();

  // Load second sheet data
  useEffect(() => {
    if (excelData && excelData.SheetNames) {
      const secondSheetName = findAcsatSentReceivedSheetName(excelData.SheetNames);

      if (secondSheetName) {
        console.log('Found second sheet:', secondSheetName);
        const sheet = excelData.Sheets[secondSheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        
        if (jsonData && jsonData.length > 0) {
          // Find the header row
          let headerRowIndex = -1;
          let headers = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length > 0) {
              const rowStr = row.join(' ').toLowerCase();
              if (
                rowStr.includes('customer') ||
                rowStr.includes('cust_') ||
                rowStr.includes('css_sent') ||
                rowStr.includes('csat sent') ||
                rowStr.includes('css_received') ||
                rowStr.includes('csat received') ||
                rowStr.includes('business unit')
              ) {
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
              .map(row => {
                const rowData = {};
                headers.forEach((header, index) => {
                  if (header) {
                    const key = String(header).trim();
                    rowData[key] = row[index];
                  }
                });
                return rowData;
              })
              .filter(
                (row) =>
                  row.CUSTOMER_ID ||
                  row.CUST_ID ||
                  row['CUSTOMER ID'] ||
                  row.CUST_NM ||
                  row['CUSTOMER NAME'] ||
                  row.BUSINESS_UNIT ||
                  row['BUSINESS UNIT']
              )
              .filter(row => {
                // Filter by YEAR - QUARTER if acsatCycle is provided
                if (acsatCycle && (row['YEAR - QUARTER'] || row['YEAR_QUARTER'])) {
                  return (row['YEAR - QUARTER'] || row['YEAR_QUARTER']) === acsatCycle;
                }
                return true; // Include all rows if no acsatCycle specified
              });
            
            setSecondSheetData(processedSecondSheet);
            console.log('Second sheet data loaded:', processedSecondSheet.length, 'rows');
            console.log('ACSAT Cycle for filtering:', acsatCycle);
            console.log('Sample filtered data:', processedSecondSheet.slice(0, 3));
            if (processedSecondSheet.length > 0) {
              console.log('Available columns in second sheet:', Object.keys(processedSecondSheet[0]));
              console.log('YEAR - QUARTER values in filtered data:', [...new Set(processedSecondSheet.map(row => row['YEAR - QUARTER'] || row['YEAR_QUARTER'] || row['Year Quarter']))]);
              
              // Debug: Check for BUSSINESS_UNIT column and values
              const businessUnitColumn = Object.keys(processedSecondSheet[0]).find(key => 
                key.toLowerCase().includes('business') || key.toLowerCase().includes('unit')
              );
              console.log('Business Unit column found:', businessUnitColumn);
              if (businessUnitColumn) {
                const businessUnits = [...new Set(processedSecondSheet.map(row => row[businessUnitColumn]))];
                console.log('Business Units in second sheet:', businessUnits);
              }
              
              // Debug: Check for CSS_SENT_DATE and CSS_RECEIVED_DATE columns
              const sentDateColumn = Object.keys(processedSecondSheet[0]).find(key => 
                key.toLowerCase().includes('css_sent') || key.toLowerCase().includes('sent')
              );
              const receivedDateColumn = Object.keys(processedSecondSheet[0]).find(key => 
                key.toLowerCase().includes('css_received') || key.toLowerCase().includes('received')
              );
              console.log('CSS_SENT_DATE column found:', sentDateColumn);
              console.log('CSS_RECEIVED_DATE column found:', receivedDateColumn);
              
              // Debug: Show sample data with all relevant columns
              console.log('Sample row with all columns:', processedSecondSheet[0]);
            }
          }
        }
      } else {
        console.log('Second sheet not found. Available sheets:', excelData.SheetNames);
        setSecondSheetData([]);
      }
    }
  }, [excelData]);

  // Process Excel data
  const processedData = useMemo(() => {
    if (!excelData) {
      console.log('No excelData provided to AccountLevelRatingDashboard');
      return null;
    }

    try {
      console.log('Processing ACSAT data for Account Level Rating Dashboard');
      console.log('Current view - showTop10:', showTop10, 'groupByBU:', groupByBU);
      console.log('Excel data:', excelData);
      console.log('Sheet names:', excelData.SheetNames);

      const targetSheetName = findAcsatReceivedReportSheetName(excelData.SheetNames);

      if (!targetSheetName) {
        console.log('CSAT received Report sheet not found. Available sheets:', excelData.SheetNames);
        return { error: `CSAT received Report sheet not found. Available sheets: ${excelData.SheetNames.join(', ')}` };
      }

      console.log('Found target sheet:', targetSheetName);

      const sheet = excelData.Sheets[targetSheetName];
      console.log('Sheet object:', sheet);
      
      if (!sheet) {
        console.log('Sheet object is null or undefined');
        return { error: 'Sheet object is null or undefined' };
      }
      
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      console.log('JSON data length:', jsonData ? jsonData.length : 'null');

      if (!jsonData || jsonData.length === 0) {
        console.log('No data found in the sheet');
        return { error: 'No data found in the sheet' };
      }

      console.log('Raw sheet data (first 5 rows):', jsonData.slice(0, 5));

      // Find the header row
      let headerRowIndex = -1;
      let headers = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          const rowStr = row.join(' ').toLowerCase();
          if (
            rowStr.includes('s no') ||
            rowStr.includes('sr') ||
            rowStr.includes('business unit') ||
            rowStr.includes('customer') ||
            rowStr.includes('perspective') ||
            rowStr.includes('rating') ||
            rowStr.includes('question')
          ) {
            headerRowIndex = i;
            headers = row.map((h) => (h != null ? String(h).trim() : h));
            break;
          }
        }
      }

      if (headerRowIndex === -1) {
        console.log('Header row not found');
        return { error: 'Header row not found' };
      }

      console.log('Found header row at index:', headerRowIndex);
      console.log('Headers:', headers);

      // Find column indices for the required columns (trimmed header labels)
      const businessUnitIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('business unit') || s === 'bu' || s.includes('businessunit')
      );

      const customerIdIndex = findHeaderIndexInRow(headers, (s) =>
        s === 'customer_id' ||
        s === 'customer id' ||
        s === 'customerid' ||
        s === 'cust_id' ||
        s === 'cust id'
      );

      const customerNameIndex = findHeaderIndexInRow(headers, (s) =>
        s === 'customer name' ||
        s === 'customername' ||
        s === 'cust_nm' ||
        s === 'cust nm' ||
        s === 'client name' ||
        s === 'clientname'
      );

      const perspectiveIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('perspective')
      );

      const ratingIndex = findHeaderIndexInRow(headers, (s) =>
        (s.includes('rating') || s.includes('score')) && !s.includes('category')
      );

      const typeOfAccountIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('type of account') || s.includes('account type') || s.includes('typeofaccount')
      );

      const questionCategoryIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('question_category') || s.includes('question category')
      );

      const csatSentDateIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('csat sent') || s.includes('css sent') || s.includes('csat_sent') || s.includes('css_sent')
      );

      const csatReceivedDateIndex = findHeaderIndexInRow(headers, (s) =>
        s.includes('csat received') || s.includes('css received') || s.includes('csat_received') || s.includes('css_received')
      );

      console.log('Available headers:', headers);
      console.log('Column indices found:', {
        businessUnitIndex,
        customerIdIndex,
        customerNameIndex,
        perspectiveIndex,
        ratingIndex,
        typeOfAccountIndex,
        csatSentDateIndex,
        csatReceivedDateIndex
      });

      // Check which columns are missing
      const missingColumns = [];
      if (businessUnitIndex === -1) missingColumns.push('BUSINESS UNIT');
      if (customerIdIndex === -1 && customerNameIndex === -1) missingColumns.push('CUSTOMER_ID or CUSTOMER NAME');
      if (perspectiveIndex === -1) missingColumns.push('PERSPECTIVE');
      if (ratingIndex === -1) missingColumns.push('RATING');

      if (missingColumns.length > 0) {
        console.log('Missing columns:', missingColumns);
        console.log('Available columns:', headers);
        
        // Try to use first 3 columns as fallback
        if (headers.length >= 3) {
          console.log('Using first 3 columns as fallback');
          return {
            data: jsonData.slice(headerRowIndex + 1)
              .filter(row => row && row.length > 0)
              .map((row, index) => ({
                businessUnit: row[0] || '',
                customerId: row[1] || '',
                customerName: row[2] || ''
              }))
              .filter(row => row.customerId && row.customerName),
            headers: {
              businessUnit: headers[0] || 'BUSINESS UNIT',
              customerId: headers[1] || 'CUSTOMER_ID',
              customerName: headers[2] || 'CUSTOMER NAME'
            }
          };
        } else {
          return { error: `Required columns not found: ${missingColumns.join(', ')}. Available columns: ${headers.join(', ')}` };
        }
      } else {
        // Extract data rows
        const dataRows = jsonData.slice(headerRowIndex + 1);
        
        const yearQuarterIndex = findHeaderIndexInRow(headers, (s) =>
          s.includes('year') && s.includes('quarter')
        );

        const rawDataBeforeFilters = dataRows
          .filter((row) => row && row.length > 0)
          .map((row) => {
            const yearQuarterVal =
              yearQuarterIndex !== -1 ? (row[yearQuarterIndex] || '').toString().trim() : '';
            const customerIdVal = normalizeCustomerIdKey(
              customerIdIndex !== -1 ? row[customerIdIndex] : ''
            );
            const customerNameVal =
              customerNameIndex !== -1 ? (row[customerNameIndex] || '').toString().trim() : '';
            const questionCategory =
              questionCategoryIndex !== -1
                ? (row[questionCategoryIndex] || '').toString().trim()
                : '';
            return {
              businessUnit: normalizeBusinessUnitDisplay(
                (row[businessUnitIndex] || '').toString().trim()
              ),
              customerId: customerIdVal,
              customerName: customerNameVal,
              perspective: (row[perspectiveIndex] || '').toString().trim(),
              rating: (row[ratingIndex] || '').toString().trim(),
              'YEAR - QUARTER': yearQuarterVal,
              YEAR_QUARTER: yearQuarterVal,
              csatSentDate: csatSentDateIndex !== -1 ? row[csatSentDateIndex] : '',
              csatReceivedDate: csatReceivedDateIndex !== -1 ? row[csatReceivedDateIndex] : '',
              typeOfAccount:
                typeOfAccountIndex !== -1
                  ? (row[typeOfAccountIndex] || '').toString().trim()
                  : '',
              questionCategory
            };
          });

        let rawData = rawDataBeforeFilters
          .filter(
            (row) =>
              row.businessUnit &&
              (row.customerId || row.customerName) &&
              row.perspective &&
              row.rating
          )
          .filter((row) => {
            if (questionCategoryIndex === -1) return true;
            const qc = (row.questionCategory || '').trim();
            return !qc || qc.toLowerCase() === 'criteria';
          })
          .filter((row) => rowMatchesAcsatCycle(row, acsatCycle))
          .filter((row) => rowPassesReceivedSheetDateFilter(row, acsatCycleStartDateFormatted));

        if (rawData.length === 0 && rawDataBeforeFilters.length > 0) {
          console.log('All rows filtered out; retrying with relaxed date/cycle filters');
          rawData = rawDataBeforeFilters.filter(
            (row) =>
              row.businessUnit &&
              (row.customerId || row.customerName) &&
              row.perspective &&
              row.rating
          );
        }

        console.log('Raw data count:', rawData.length);
        console.log('Sample raw data:', rawData.slice(0, 3));

        // Group data based on current view mode
        let processedRows = [];
        const targetPerspectives = ['Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business'];
        
        if (groupByBU) {
          // Group by Business Unit only
          const buGroups = {};
          
          rawData.forEach(row => {
            const bu = row.businessUnit;
            if (!buGroups[bu]) {
              buGroups[bu] = {
                businessUnit: bu,
                perspectives: {}
              };
            }
            
            const perspective = (row.perspective || '').toString().trim();
            const rating = parseFloat(row.rating || 0);
            
            if (!isNaN(rating)) {
              if (!buGroups[bu].perspectives[perspective]) {
                buGroups[bu].perspectives[perspective] = {
                  ratings: [],
                  count: 0
                };
              }
              buGroups[bu].perspectives[perspective].ratings.push(rating);
              buGroups[bu].perspectives[perspective].count++;
            }
          });

          // Debug: Log business units found in first sheet
          console.log('Business Units found in first sheet:', Object.keys(buGroups));

          // Calculate average ratings for each perspective by BU
          processedRows = Object.values(buGroups).map(bu => {
            const result = {
              businessUnit: bu.businessUnit,
              customerId: '', // Empty for BU view
              customerName: '' // Empty for BU view
            };
            
            // Calculate CSAT counts from second sheet for this BU
            const businessUnit = bu.businessUnit;
            
            // Debug: Log filtering details for BU
            console.log(`🔍 Calculating CSAT survey counts for BU: ${businessUnit}`);
            console.log(`  ACSAT Cycle: ${acsatCycle}`);
            console.log(`  Second sheet data length: ${secondSheetData.length}`);
            
            // Debug: Show sample second sheet data structure
            if (secondSheetData.length > 0) {
              console.log(`  Sample second sheet row:`, secondSheetData[0]);
              console.log(`  Available columns:`, Object.keys(secondSheetData[0]));
            }
            
            const cssSentCount = secondSheetData.filter(row => {
              const rowBusinessUnit = row.BUSINESS_UNIT || row['BUSINESS UNIT'] || row['Business Unit'];
              // Priority: Use "CSAT SENT DATE" column, fallback to "CSS SENT DATE" for backward compatibility
              const csatSentDate = row['CSAT SENT DATE'] || row['CSAT_SENT_DATE'] || row.CSS_SENT_DATE || row['CSS_SENT_DATE'] || row['CSS SENT DATE'];
              const yearQuarter = row['YEAR - QUARTER'] || row['YEAR_QUARTER'] || row['Year Quarter'];
              
              const matchesBU = rowBusinessUnit === businessUnit;
              const hasValidDate = csatSentDate && isDateOnOrAfterCsatStart(csatSentDate, acsatCycleStartDateFormatted);
              const matchesYearQuarter = !acsatCycle || !yearQuarter || yearQuarter === acsatCycle;
              
              // Debug: Log date parsing details for BU calculation
              if (csatSentDate && secondSheetData.indexOf(row) < 3) {
                console.log(`    Date parsing for BU row ${secondSheetData.indexOf(row)}:`, {
                  csatSentDate,
                  acsatCycleStartDateFormatted,
                  hasValidDate
                });
              }
              
              // Debug: Log every row for the first few to understand the data structure
              if (secondSheetData.indexOf(row) < 5) {
                console.log(`    Row ${secondSheetData.indexOf(row)} for BU ${businessUnit}:`, {
                  rowBusinessUnit,
                  csatSentDate,
                  yearQuarter,
                  matchesBU,
                  matchesYearQuarter,
                  hasValidDate,
                  include: matchesBU && hasValidDate && matchesYearQuarter,
                  fullRow: row
                });
              }
              
              return matchesBU && hasValidDate && matchesYearQuarter;
            }).length;
            
            const cssReceivedCount = secondSheetData.filter(row => {
              const rowBusinessUnit = row.BUSINESS_UNIT || row['BUSINESS UNIT'] || row['Business Unit'];
              // Priority: Use "CSAT RECEIVED DATE" column, fallback to "CSS RECEIVED DATE" for backward compatibility
              const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSAT_RECEIVED_DATE'] || row.CSS_RECEIVED_DATE || row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'];
              const yearQuarter = row['YEAR - QUARTER'] || row['YEAR_QUARTER'] || row['Year Quarter'];
              
              const matchesBU = rowBusinessUnit === businessUnit;
              const statusVal = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
              const isCompletedStatus = statusVal === 'completed';
              const hasValidDate = isCompletedStatus && (csatReceivedDate && isDateOnOrAfterCsatStart(csatReceivedDate, acsatCycleStartDateFormatted));
              const matchesYearQuarter = !acsatCycle || !yearQuarter || yearQuarter === acsatCycle;

              // Debug: Log date parsing details for BU received calculation
              if (csatReceivedDate && secondSheetData.indexOf(row) < 3) {
                console.log(`    Date parsing for BU received row ${secondSheetData.indexOf(row)}:`, {
                  csatReceivedDate,
                  acsatCycleStartDateFormatted,
                  hasValidDate
                });
              }
              
              // Debug: Log every row for the first few to understand the data structure
              if (secondSheetData.indexOf(row) < 5) {
                console.log(`    Row ${secondSheetData.indexOf(row)} for BU ${businessUnit} (Received):`, {
                  rowBusinessUnit,
                  csatReceivedDate,
                  yearQuarter,
                  matchesBU,
                  matchesYearQuarter,
                  hasValidDate,
                  include: matchesBU && hasValidDate && matchesYearQuarter,
                  fullRow: row
                });
              }
              
              return matchesBU && hasValidDate && matchesYearQuarter;
            }).length;
            
            console.log(`  Final counts for BU ${businessUnit}: CSAT Sent=${cssSentCount}, CSAT Received=${cssReceivedCount}`);
            
            result['Polled'] = cssSentCount;
            result['Responded'] = cssReceivedCount;
            
            // Calculate average rating for each target perspective
            const allRatings = [];
            targetPerspectives.forEach(perspective => {
              const perspectiveData = bu.perspectives[perspective];
              if (perspectiveData && perspectiveData.ratings.length > 0) {
                const averageRating = perspectiveData.ratings.reduce((sum, rating) => sum + rating, 0) / perspectiveData.ratings.length;
                result[perspective] = Math.round(averageRating * 100) / 100; // Round to 2 decimal places
                allRatings.push(...perspectiveData.ratings);
              } else {
                result[perspective] = null; // No data for this perspective
              }
            });
            
            
            return result;
          });
        } else {
          // Group by CUSTOMER_ID or CUST_ID from the second sheet (CSAT sent and received Report)
          // This ensures we include all customers that have sent/received surveys, even if they have no ratings
          const customerGroupsFromSecondSheet = {};
          
          // Find TYPE OF ACCOUNT column in second sheet for Top 10 filtering
          let typeOfAccountColumn = null;
          if (secondSheetData && secondSheetData.length > 0) {
            const firstRow = secondSheetData[0] || {};
            typeOfAccountColumn = Object.keys(firstRow).find(key => {
              const lowerKey = key.toLowerCase();
              return lowerKey.includes('type of account') ||
                     lowerKey.includes('typeofaccount') ||
                     lowerKey.includes('account type') ||
                     lowerKey.includes('type_of_account');
            });
          }
          
          // First, group all customers from second sheet by CUSTOMER_ID or CUST_ID
          secondSheetData.forEach(row => {
            const rowCustomerId = row.CUSTOMER_ID || row['CUSTOMER_ID'] || row['Customer ID'] || row.CUST_ID || row['CUST_ID'];
            if (!rowCustomerId) return;
            
            // For Top 10 view, filter by TYPE OF ACCOUNT = "Top 10" from second sheet
            if (showTop10) {
              let typeOfAccount = '';
              if (typeOfAccountColumn && row[typeOfAccountColumn] !== undefined && row[typeOfAccountColumn] !== null) {
                typeOfAccount = row[typeOfAccountColumn].toString().trim();
              }
              
              // Only include rows where TYPE OF ACCOUNT = "Top 10"
              if (typeOfAccount !== 'Top 10') {
                return; // Skip non-Top 10 accounts
              }
            }
            
            const customerId = rowCustomerId.toString().trim();
            
            // Get BUSINESS UNIT and CUSTOMER NAME (or CUST_NM) from second sheet
            const businessUnit = row.BUSINESS_UNIT || row['BUSINESS UNIT'] || row['Business Unit'] || '';
            // Priority: CUSTOMER NAME, then CUST_NM, then other variations
            const customerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'] || 
                                 row.CUST_NM || row['CUST_NM'] || row['CUST_NM'] || '';
            
            if (!customerGroupsFromSecondSheet[customerId]) {
              customerGroupsFromSecondSheet[customerId] = {
                customerId: customerId,
                businessUnit: businessUnit,
                customerName: customerName,
                sentDates: [],
                receivedDates: []
              };
            }
            
            // Collect valid sent dates
            const csatSentDate = row['CSAT SENT DATE'] || row['CSAT_SENT_DATE'] || row.CSS_SENT_DATE || row['CSS_SENT_DATE'] || row['CSS SENT DATE'];
            const yearQuarter = row['YEAR - QUARTER'] || row['YEAR_QUARTER'] || row['Year Quarter'];
            const matchesYearQuarter = !acsatCycle || !yearQuarter || yearQuarter === acsatCycle;
            
            if (csatSentDate && matchesYearQuarter && isDateOnOrAfterCsatStart(csatSentDate, acsatCycleStartDateFormatted)) {
              customerGroupsFromSecondSheet[customerId].sentDates.push(csatSentDate);
            }
            
            // Collect valid received dates
            const csatReceivedDate = row['CSAT RECEIVED DATE'] || row['CSAT_RECEIVED_DATE'] || row.CSS_RECEIVED_DATE || row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'];
            const statusValSecond = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
            const isCompletedStatusSecond = statusValSecond === 'completed';
            if (matchesYearQuarter && (isCompletedStatusSecond && (csatReceivedDate && isDateOnOrAfterCsatStart(csatReceivedDate, acsatCycleStartDateFormatted)))) {
              customerGroupsFromSecondSheet[customerId].receivedDates.push(csatReceivedDate || 'COMPLETED_STATUS_OVERRIDE');
            }
          });

          if (Object.keys(customerGroupsFromSecondSheet).length === 0 && rawData.length > 0) {
            console.log('Second sheet empty or unmatched; building account list from CSAT received Report');
            rawData.forEach((row) => {
              if (showTop10) {
                const typeOfAccount = (row.typeOfAccount || '').trim();
                if (typeOfAccount && typeOfAccount !== 'Top 10') return;
              }
              const customerId =
                normalizeCustomerIdKey(row.customerId) ||
                (row.customerName || '').toString().trim();
              if (!customerId) return;
              if (!customerGroupsFromSecondSheet[customerId]) {
                customerGroupsFromSecondSheet[customerId] = {
                  customerId,
                  businessUnit: row.businessUnit || '',
                  customerName: row.customerName || '',
                  sentDates: [],
                  receivedDates: []
                };
              }
            });
          }
          
          // Now, group ratings from first sheet by customer for perspective calculations
          const customerRatings = {};
          rawData.forEach(row => {
            const customerId =
              normalizeCustomerIdKey(row.customerId) ||
              (row.customerName || '').toString().trim();
            if (!customerId) return;
            
            if (!customerRatings[customerId]) {
              customerRatings[customerId] = {
                perspectives: {}
              };
            }
            
            const perspective = (row.perspective || '').toString().trim();
            const rating = parseFloat(row.rating || 0);
            
            if (!isNaN(rating) && perspective) {
              if (!customerRatings[customerId].perspectives[perspective]) {
                customerRatings[customerId].perspectives[perspective] = {
                  ratings: [],
                  count: 0
                };
              }
              customerRatings[customerId].perspectives[perspective].ratings.push(rating);
              customerRatings[customerId].perspectives[perspective].count++;
            }
          });

          // Calculate average ratings for each perspective
          processedRows = Object.values(customerGroupsFromSecondSheet).map((customer, index) => {
            const result = {
              businessUnit: customer.businessUnit || '',
              customerId: customer.customerId,
              customerName: customer.customerName || ''
            };
            
            // Count CSS_SENT_DATE and CSS_RECEIVED_DATE
            const cssSentCount = customer.sentDates.length;
            const cssReceivedCount = customer.receivedDates.length;
            
            console.log(`  Final counts for ${customer.customerId}: CSAT Sent=${cssSentCount}, CSAT Received=${cssReceivedCount}`);
            
            result['Polled'] = cssSentCount;
            result['Responded'] = cssReceivedCount;
            
            // Calculate average rating for each target perspective
            const allRatings = [];
            const customerRatingData = customerRatings[customer.customerId] || { perspectives: {} };
            
            targetPerspectives.forEach(perspective => {
              const perspectiveData = customerRatingData.perspectives[perspective];
              if (perspectiveData && perspectiveData.ratings.length > 0) {
                const averageRating = perspectiveData.ratings.reduce((sum, rating) => sum + rating, 0) / perspectiveData.ratings.length;
                result[perspective] = Math.round(averageRating * 100) / 100; // Round to 2 decimal places
                allRatings.push(...perspectiveData.ratings);
              } else {
                // If "Responded" = 0, show "-" (hyphen) for perspective values
                if (cssReceivedCount === 0) {
                  result[perspective] = '-';
                } else {
                  result[perspective] = null; // No data for this perspective but received count > 0
                }
              }
            });
            
            return result;
          });
        }

        console.log('Processed rows count:', processedRows.length);
        console.log('Sample processed data:', processedRows.slice(0, 3));
        

        // Calculate summary data
        const summaryData = {
          orgLevel: {
            perspectivesAbove4: [],
            perspectivesBelow4: []
          },
          buLevel: {}
        };

        // Calculate org level summary - only consider ratings > 4 for average calculation
        targetPerspectives.forEach(perspective => {
          // Get all ratings for this perspective
          const allRatings = processedRows.map(row => parseFloat(row[perspective] || 0)).filter(r => !isNaN(r));
          
          // Filter only ratings > 4
          const ratingsAbove4 = allRatings.filter(r => r > 4);
          const ratingsBelow4 = allRatings.filter(r => r < 4);
          
          // Calculate average of ratings > 4
          if (ratingsAbove4.length > 0) {
            const avgRatingAbove4 = ratingsAbove4.reduce((sum, r) => sum + r, 0) / ratingsAbove4.length;
            summaryData.orgLevel.perspectivesAbove4.push({
              name: perspective,
              rating: Math.round(avgRatingAbove4 * 100) / 100,
              count: ratingsAbove4.length,
              totalCount: allRatings.length
            });
          }
          
          // Calculate average of ratings < 4
          if (ratingsBelow4.length > 0) {
            const avgRatingBelow4 = ratingsBelow4.reduce((sum, r) => sum + r, 0) / ratingsBelow4.length;
            summaryData.orgLevel.perspectivesBelow4.push({
              name: perspective,
              rating: Math.round(avgRatingBelow4 * 100) / 100,
              count: ratingsBelow4.length,
              totalCount: allRatings.length
            });
          }
        });

        // Calculate BU level summary - only consider ratings > 4 for average calculation
        const buOrder = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
        buOrder.forEach(buName => {
          // Handle both "Health Care" and "Healthcare" for backward compatibility
          const buData = processedRows.filter(row => {
            const rowBU = (row.businessUnit || '').toString().trim();
            if (buName === 'Healthcare') {
              return rowBU === 'Healthcare' || rowBU === 'Health Care';
            }
            return rowBU === buName;
          });
          if (buData.length > 0) {
            const buPerspectives = {};
            const buPerspectivesAbove4 = {};
            const buPerspectivesBelow4 = {};
            
            targetPerspectives.forEach(perspective => {
              const allRatings = buData.map(row => parseFloat(row[perspective] || 0)).filter(r => !isNaN(r));
              
              if (allRatings.length > 0) {
                // Calculate overall average for highest rated perspective
                const avgRating = allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length;
                buPerspectives[perspective] = avgRating;
                
                // Filter only ratings > 4 for above4 calculation
                const ratingsAbove4 = allRatings.filter(r => r > 4);
                if (ratingsAbove4.length > 0) {
                  const avgRatingAbove4 = ratingsAbove4.reduce((sum, r) => sum + r, 0) / ratingsAbove4.length;
                  buPerspectivesAbove4[perspective] = {
                    name: perspective,
                    rating: Math.round(avgRatingAbove4 * 100) / 100,
                    count: ratingsAbove4.length,
                    totalCount: allRatings.length
                  };
                }
                
                // Filter only ratings < 4 for below4 calculation
                const ratingsBelow4 = allRatings.filter(r => r < 4);
                if (ratingsBelow4.length > 0) {
                  const avgRatingBelow4 = ratingsBelow4.reduce((sum, r) => sum + r, 0) / ratingsBelow4.length;
                  buPerspectivesBelow4[perspective] = {
                    name: perspective,
                    rating: Math.round(avgRatingBelow4 * 100) / 100,
                    count: ratingsBelow4.length,
                    totalCount: allRatings.length
                  };
                }
              }
            });

            // Find highest rated perspective (using overall average)
            const highestRated = Object.entries(buPerspectives).reduce((max, [perspective, rating]) => 
              rating > max.rating ? { perspective, rating } : max, 
              { perspective: 'N/A', rating: 0 }
            );

            summaryData.buLevel[buName] = {
              highestRated: {
                name: highestRated.perspective,
                rating: Math.round(highestRated.rating * 100) / 100
              },
              above4: Object.values(buPerspectivesAbove4),
              below4: Object.values(buPerspectivesBelow4)
            };
          }
        });

        console.log('Summary data calculated:', summaryData);
        console.log('Processed rows count:', processedRows.length);
        console.log('ShowTop10:', showTop10);

        // For Top 10 accounts view, the filtering is already done during grouping from second sheet
        // But we still need to sort by predefined order and ensure we have the correct data
        let finalProcessedRows = processedRows;
        if (showTop10) {
          console.log('Sorting Top 10 accounts by predefined order:', top10AccountNames);
          
          try {
            // Sort by the predefined order (filtering already done during grouping)
            finalProcessedRows.sort((a, b) => {
              const aIndex = top10AccountNames.findIndex(name => 
                (a.customerName || '').toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes((a.customerName || '').toLowerCase())
              );
              const bIndex = top10AccountNames.findIndex(name => 
                (b.customerName || '').toLowerCase().includes(name.toLowerCase()) ||
                name.toLowerCase().includes((b.customerName || '').toLowerCase())
              );
              // If not found in predefined list, put at the end
              const aPos = aIndex === -1 ? 999 : aIndex;
              const bPos = bIndex === -1 ? 999 : bIndex;
              return aPos - bPos;
            });
            
            console.log('Top 10 sorted data:', finalProcessedRows);
          } catch (sortError) {
            console.error('Error sorting Top 10 data:', sortError);
            // If sorting fails, use original data
            finalProcessedRows = processedRows;
          }
        }

        console.log('Final processed rows count:', finalProcessedRows.length);
        console.log('Returning data with', finalProcessedRows.length, 'rows');

        // Ensure we have data to return
        if (finalProcessedRows.length === 0) {
          console.log('No data to return, using original processedRows');
          finalProcessedRows = processedRows;
        }

        return {
          data: finalProcessedRows,
          rawData: rawData, // Store rawData for grand total calculations
          headers: {
            businessUnit: headers[businessUnitIndex],
            customerId: headers[customerIdIndex],
            customerName: headers[customerNameIndex],
            perspectives: [...targetPerspectives],
            cssColumns: ['Polled', 'Responded']
          },
          summary: summaryData
        };
      }

    } catch (error) {
      console.error('Error processing ACSAT data:', error);
      return { error: 'Error processing data: ' + error.message };
    }
  }, [excelData, groupByBU, secondSheetData, acsatCycleStartDateFormatted, acsatCycle, showTop10]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!processedData?.data) return null;
    
    if (!sortConfig.key) return processedData.data;
    
    return [...processedData.data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle different data types for sorting
      if (sortConfig.key === 'businessUnit' || sortConfig.key === 'customerName') {
        // String sorting (case-insensitive)
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortConfig.key === 'cssSentCount' || sortConfig.key === 'cssReceivedCount') {
        // Numeric sorting for survey counts
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortConfig.key.startsWith('rating_') || sortConfig.key.includes('Rating')) {
        // Numeric sorting for rating columns
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        // Default string sorting
        aValue = aValue?.toString().toLowerCase() || '';
        bValue = bValue?.toString().toLowerCase() || '';
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [processedData?.data, sortConfig]);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!sortedData) return null;
    
    if (!searchTerm.trim()) {
      const base = sortedData;
      if (groupByBU) {
        const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
        return [...base].sort((a, b) => {
          const aBU = (a.businessUnit || '').toString().trim();
          const bBU = (b.businessUnit || '').toString().trim();
          const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
          const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
          // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return 0;
        });
      } else if (!showTop10 && !sortConfig.key) {
        // Account-wise (not Top 10) and no manual sorting: sort by accountOrder
        return [...base].sort((a, b) => {
          const aCustomerName = (a.customerName || '').toString().trim();
          const bCustomerName = (b.customerName || '').toString().trim();
          
          const aIndex = accountOrder.findIndex(name => 
            aCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(aCustomerName.toLowerCase())
          );
          const bIndex = accountOrder.findIndex(name => 
            bCustomerName.toLowerCase().includes(name.toLowerCase()) ||
            name.toLowerCase().includes(bCustomerName.toLowerCase())
          );
          
          // If not found in predefined list, put at the end
          const aPos = aIndex === -1 ? 999 : aIndex;
          const bPos = bIndex === -1 ? 999 : bIndex;
          return aPos - bPos;
        });
      }
      return base;
    }
    
    if (showTop10) {
      // Search by Customer Name when in Top 10 view
      return sortedData.filter(row => 
        row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else if (groupByBU) {
      // Search by Business Unit when in BU view
      const filtered = sortedData.filter(row => 
        row.businessUnit.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
      return filtered.sort((a, b) => {
        const aBU = (a.businessUnit || '').toString().trim();
        const bBU = (b.businessUnit || '').toString().trim();
        const aIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
        const bIndex = BU_ORDER.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
        // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    } else {
      // Search by Customer Name when in customer view
      return sortedData.filter(row => 
        row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [sortedData, searchTerm, groupByBU, showTop10]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    if (!processedData || !processedData.rawData) return null;
    
    const totals = {
      cssSentCount: 0,
      cssReceivedCount: 0,
      perspectives: {}
    };
    
    // Calculate totals for CSS columns
    filteredData.forEach(row => {
      if (processedData.headers.cssColumns) {
        processedData.headers.cssColumns.forEach(column => {
          if (column === 'Polled') {
            totals.cssSentCount += row[column] || 0;
          } else if (column === 'Responded') {
            totals.cssReceivedCount += row[column] || 0;
          }
        });
      }
    });
    
    // Calculate averages for the three specific perspectives only
    // Using rawData filtered by date and YEAR-QUARTER
    const targetPerspectives = [
      'Meeting Delivery Commitments',
      'Customer Engagement and Relationship',
      'Partner adding value to Customer Business'
    ];
    
    // Get rawData with all filters already applied (from processedData)
    let rawDataForGrandTotal = processedData?.rawData || [];
    
    // For Top 10 accounts view, filter by TYPE OF ACCOUNT = "Top 10"
    if (showTop10) {
      rawDataForGrandTotal = rawDataForGrandTotal.filter(row => {
        const typeOfAccount = (row.typeOfAccount || '').toString().trim();
        return typeOfAccount === 'Top 10';
      });
    }
    
    // Calculate average rating for each target perspective from rawData
    targetPerspectives.forEach(perspective => {
      // Get all ratings for this perspective from filtered raw data
      const ratingsForPerspective = rawDataForGrandTotal
        .filter(row => (row.perspective || '').toString().trim() === perspective)
        .map(row => {
          const rating = parseFloat(row.rating || 0);
          return isNaN(rating) ? null : rating;
        })
        .filter(rating => rating !== null && rating !== undefined);
      
      // Calculate average: sum of ratings / count of ratings
      if (ratingsForPerspective.length > 0) {
        const sum = ratingsForPerspective.reduce((acc, rating) => acc + rating, 0);
        const count = ratingsForPerspective.length;
        totals.perspectives[perspective] = (sum / count).toFixed(2);
      } else {
        totals.perspectives[perspective] = 'N/A';
      }
    });
    
    // For other perspectives (if any), calculate from filteredData as before
    if (processedData.headers.perspectives) {
      processedData.headers.perspectives.forEach(perspective => {
        // Skip if already calculated above
        if (targetPerspectives.includes(perspective)) {
          return;
        }
        const validRatings = filteredData
          .map(row => row[perspective])
          .filter(rating => rating !== null && rating !== undefined && !isNaN(rating) && rating !== 'N/A');
        
        if (validRatings.length > 0) {
          const sum = validRatings.reduce((acc, rating) => acc + parseFloat(rating), 0);
          totals.perspectives[perspective] = (sum / validRatings.length).toFixed(2);
        } else {
          totals.perspectives[perspective] = 'N/A';
        }
      });
    }
    
    return totals;
  }, [filteredData, processedData, showTop10]);

  // Compute Other Account totals (TYPE OF ACCOUNT != 'Top 10') for Top 10 view
  const otherAccountTotals = useMemo(() => {
    if (!showTop10 || !processedData) return null;
    const rawData = processedData.rawData || [];

    // Aggregate CSS counts from second sheet for non-top10
    // Count rows where:
    // - TYPE OF ACCOUNT ≠ "Top 10" (from second sheet column)
    // - YEAR - QUARTER = acsatCycle
    // - CSAT SENT DATE >= acsatCycleStartDateFormatted
    // - CSAT RECEIVED DATE >= acsatCycleStartDateFormatted
    let cssSentCount = 0;
    let cssReceivedCount = 0;
    
    if (secondSheetData && secondSheetData.length > 0) {
      // Find TYPE OF ACCOUNT column in second sheet
      const firstRow = secondSheetData[0] || {};
      const typeOfAccountColumn = Object.keys(firstRow).find(key => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes('type of account') ||
               lowerKey.includes('typeofaccount') ||
               lowerKey.includes('account type') ||
               lowerKey.includes('type_of_account');
      });
      
      console.log('🔍 Other Account - Column detection:', {
        typeOfAccountColumn,
        acsatCycle,
        acsatCycleStartDateFormatted
      });
      
      (secondSheetData || []).forEach((row, rowIndex) => {
        // Filter by YEAR - QUARTER if acsatCycle is provided
      const yearQ = row['YEAR - QUARTER'] || row['YEAR_QUARTER'] || row['Year Quarter'];
        if (acsatCycle && yearQ) {
          const rowYearQuarter = yearQ.toString().trim();
          const selectedCycle = acsatCycle.toString().trim();
          if (rowYearQuarter !== selectedCycle) {
            return; // Skip this row if YEAR - QUARTER doesn't match
          }
        }
        
        // Check TYPE OF ACCOUNT - prefer column from second sheet
        let typeOfAccount = '';
        if (typeOfAccountColumn && row[typeOfAccountColumn] !== undefined && row[typeOfAccountColumn] !== null) {
          typeOfAccount = row[typeOfAccountColumn].toString().trim();
        }
        
        // Only include rows where TYPE OF ACCOUNT is NOT "Top 10"
        if (typeOfAccount === 'Top 10') {
          return; // Skip Top 10 accounts
        }
        
        // Check if CSAT SENT DATE is valid (>= cycle start date)
        const sentDate = row['CSAT SENT DATE'] || row['CSAT_SENT_DATE'] || row.CSS_SENT_DATE || row['CSS_SENT_DATE'] || row['CSS SENT DATE'];
      const validSent = sentDate && isDateOnOrAfterCsatStart(sentDate, acsatCycleStartDateFormatted);
        
        // Check if CSAT RECEIVED DATE is valid (>= cycle start date)
        const receivedDate = row['CSAT RECEIVED DATE'] || row['CSAT_RECEIVED_DATE'] || row.CSS_RECEIVED_DATE || row['CSS_RECEIVED_DATE'] || row['CSS RECEIVED DATE'];
      const statusValOther = (row['STATUS'] ?? row['Status'] ?? '').toString().trim().toLowerCase();
      const isCompletedStatusOther = statusValOther === 'completed';
      const validReceived = isCompletedStatusOther && (receivedDate && isDateOnOrAfterCsatStart(receivedDate, acsatCycleStartDateFormatted));

        // Count surveys sent - each row with a valid CSAT SENT DATE counts as one
        if (validSent) {
          cssSentCount++;
        }
        
        // Count surveys received - each row with a valid CSAT RECEIVED DATE counts as one
        if (validReceived) {
          cssReceivedCount++;
        }
      });
      
      console.log('🔍 Other Account - Final counts:', {
        cssSentCount,
        cssReceivedCount
      });
    }

    // Compute averages for specified perspectives from first sheet non-top10
    const perspectives = ['Meeting Delivery Commitments','Customer Engagement and Relationship','Partner adding value to Customer Business'];
    const perspectiveAverages = {};
    perspectives.forEach(p => {
      const ratings = rawData
        .filter(r => (r.typeOfAccount || '').toString().trim() !== 'Top 10' && (r.perspective || '').toString().trim() === p)
        .map(r => parseFloat(r.rating))
        .filter(v => !isNaN(v));
      if (ratings.length > 0) {
        const avg = ratings.reduce((s, v) => s + v, 0) / ratings.length;
        perspectiveAverages[p] = avg.toFixed(2);
      } else {
        perspectiveAverages[p] = 'N/A';
      }
    });

    return {
      cssSentCount,
      cssReceivedCount,
      perspectives: perspectiveAverages
    };
  }, [showTop10, processedData, secondSheetData, acsatCycle, acsatCycleStartDateFormatted]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const acsatTrendViewMode = showTop10 ? 'top10' : groupByBU ? 'bu' : 'account';

  const acsatTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length || !acsatTrendViewMode) return [];
    if (acsatTrendViewMode === 'top10') {
      return trendAnalysisFiles.map((file) => buildAcsatTop10TrendFromFile(file, { top10AccountNames }));
    }
    if (acsatTrendViewMode === 'bu') {
      return trendAnalysisFiles.map((file) => buildAcsatBuWiseTrendFromFile(file));
    }
    return trendAnalysisFiles.map((file) => buildAcsatAccountWiseTrendFromFile(file));
  }, [showAcsatTrendAnalysis, trendAnalysisFiles, top10AccountNames, acsatTrendViewMode]);

  const showBuWiseMainTrendColumns = groupByBU && !showTop10 && showAcsatTrendAnalysis;
  const showTop10MainTrendColumns = showTop10 && !groupByBU && showAcsatTrendAnalysis;
  const showAccountMainTrendColumns = !groupByBU && !showTop10 && showAcsatTrendAnalysis;

  const buWiseMainTrendSource = useMemo(() => {
    if (!showBuWiseMainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showBuWiseMainTrendColumns, acsatTrendAnalysisData]);

  const top10MainTrendSource = useMemo(() => {
    if (!showTop10MainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showTop10MainTrendColumns, acsatTrendAnalysisData]);

  const accountMainTrendSource = useMemo(() => {
    if (!showAccountMainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showAccountMainTrendColumns, acsatTrendAnalysisData]);

  const getBuWiseMainTrendValue = (businessUnit, perspective) => {
    if (!buWiseMainTrendSource) return null;
    const trendRow = findBuWiseTrendRowForBusinessUnit(businessUnit, buWiseMainTrendSource.rows);
    return getBuWiseTrendRatingFromRow(trendRow, perspective);
  };

  const getBuWisePerspectiveTrendDiff = (dashboardRow, perspective) => {
    const mainValue = parseDashboardPerspectiveValue(dashboardRow, perspective);
    const trendRaw = getBuWiseMainTrendValue(dashboardRow?.businessUnit, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getTop10MainTrendValue = (businessUnit, customerName, perspective) => {
    if (!top10MainTrendSource) return null;
    const trendRow = findTop10TrendRowForAccount(businessUnit, customerName, top10MainTrendSource.rows);
    return getBuWiseTrendRatingFromRow(trendRow, perspective);
  };

  const getTop10PerspectiveTrendDiff = (dashboardRow, perspective) => {
    const mainValue = parseDashboardPerspectiveValue(dashboardRow, perspective);
    const trendRaw = getTop10MainTrendValue(dashboardRow?.businessUnit, dashboardRow?.customerName, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getAccountMainTrendValue = (businessUnit, customerId, customerName, perspective) => {
    if (!accountMainTrendSource) return null;
    const trendRow = findAccountWiseTrendRowForCustomer(
      businessUnit,
      customerId,
      customerName,
      accountMainTrendSource.rows
    );
    return getBuWiseTrendRatingFromRow(trendRow, perspective);
  };

  const getAccountPerspectiveTrendDiff = (dashboardRow, perspective) => {
    const mainValue = parseDashboardPerspectiveValue(dashboardRow, perspective);
    const trendRaw = getAccountMainTrendValue(
      dashboardRow?.businessUnit,
      dashboardRow?.customerId,
      dashboardRow?.customerName,
      perspective
    );
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getBuWiseOrgPerspectiveTrendDiff = (perspective) => {
    if (!grandTotals?.perspectives || !buWiseMainTrendSource) return null;
    const mainRaw = grandTotals.perspectives[perspective];
    const mainValue =
      mainRaw === 'N/A' || mainRaw == null || mainRaw === ''
        ? null
        : parseFloat(mainRaw);
    const trendRaw = getBuWiseTrendRatingFromRow(buWiseMainTrendSource.grandTotal, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue == null || Number.isNaN(mainValue) ? null : mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getTop10AccountsPerspectiveTrendDiff = (perspective) => {
    if (!grandTotals?.perspectives || !top10MainTrendSource) return null;
    const mainRaw = grandTotals.perspectives[perspective];
    const mainValue =
      mainRaw === 'N/A' || mainRaw == null || mainRaw === ''
        ? null
        : parseFloat(mainRaw);
    const trendRaw = getBuWiseTrendRatingFromRow(top10MainTrendSource.top10AccountsTotal, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue == null || Number.isNaN(mainValue) ? null : mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getTop10OtherAccountsPerspectiveTrendDiff = (perspective) => {
    if (!otherAccountTotals?.perspectives || !top10MainTrendSource) return null;
    const mainRaw = otherAccountTotals.perspectives[perspective];
    const mainValue =
      mainRaw === 'N/A' || mainRaw == null || mainRaw === ''
        ? null
        : parseFloat(mainRaw);
    const trendRaw = getBuWiseTrendRatingFromRow(top10MainTrendSource.otherAccountsTotal, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue == null || Number.isNaN(mainValue) ? null : mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const getAccountOrgPerspectiveTrendDiff = (perspective) => {
    if (!grandTotals?.perspectives || !accountMainTrendSource) return null;
    const mainRaw = grandTotals.perspectives[perspective];
    const mainValue =
      mainRaw === 'N/A' || mainRaw == null || mainRaw === ''
        ? null
        : parseFloat(mainRaw);
    const trendRaw = getBuWiseTrendRatingFromRow(accountMainTrendSource.grandTotal, perspective);
    const trendValue = trendRaw == null ? null : parseFloat(trendRaw);
    return computeBuPerspectiveTrendDiff(
      mainValue == null || Number.isNaN(mainValue) ? null : mainValue,
      trendValue == null || Number.isNaN(trendValue) ? null : trendValue
    );
  };

  const renderBuWiseTrendDiffCell = (diff, { bold = false, cellKey }) => {
    const display = formatBuTrendDiffDisplay(diff);
    return (
      <Td
        key={cellKey}
        isNumeric
        style={{
          textAlign: 'center',
          fontWeight: bold ? 'bold' : 600,
          color: display.color,
          backgroundColor: bold ? '#e2e8f0' : undefined
        }}
      >
        {display.text}
      </Td>
    );
  };

  const renderBuWiseMainTrendCells = (dashboardRow, { bold = false, keyPrefix = 'bu-trend' } = {}) => {
    if (!showBuWiseMainTrendColumns) return null;
    return ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
      renderBuWiseTrendDiffCell(getBuWisePerspectiveTrendDiff(dashboardRow, perspective), {
        bold,
        cellKey: `${keyPrefix}-${perspective}`
      })
    );
  };

  const renderTop10MainTrendCells = (dashboardRow, { bold = false, keyPrefix = 'top10-trend' } = {}) => {
    if (!showTop10MainTrendColumns) return null;
    return ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
      renderBuWiseTrendDiffCell(getTop10PerspectiveTrendDiff(dashboardRow, perspective), {
        bold,
        cellKey: `${keyPrefix}-${perspective}`
      })
    );
  };

  const renderAccountMainTrendCells = (dashboardRow, { bold = false, keyPrefix = 'account-trend' } = {}) => {
    if (!showAccountMainTrendColumns) return null;
    return ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
      renderBuWiseTrendDiffCell(getAccountPerspectiveTrendDiff(dashboardRow, perspective), {
        bold,
        cellKey: `${keyPrefix}-${perspective}`
      })
    );
  };

  const downloadBuWiseTrendAnalysisExcel = async () => {
    const buTrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!buTrendFiles.length) {
      alert('No BU wise trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    buTrendFiles.forEach((fileData, idx) => addBuWiseTrendSheetToWorkbook(workbook, fileData, idx));
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_BU_Wise_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTop10TrendAnalysisExcel = async () => {
    const top10TrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!top10TrendFiles.length) {
      alert('No Top 10 trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    top10TrendFiles.forEach((fileData, idx) => addTop10TrendSheetToWorkbook(workbook, fileData, idx));
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_Top10_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadAccountWiseTrendAnalysisExcel = async () => {
    const accountTrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!accountTrendFiles.length) {
      alert('No account-wise trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    accountTrendFiles.forEach((fileData, idx) => addAccountWiseTrendSheetToWorkbook(workbook, fileData, idx));
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_Account_Wise_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const scrollToAcsatTrendSection = () => {
    requestAnimationFrame(() => {
      acsatTrendSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleViewAcsatTrendAnalysis = () => {
    if (!trendAnalysisFiles?.length) {
      alert('Please upload ACSAT trend files using "Upload data for ACSAT trend analysis" on the Upload ACSAT Data page.');
      return;
    }
    if (showAcsatTrendAnalysis) {
      scrollToAcsatTrendSection();
      return;
    }
    setShowAcsatTrendAnalysis(true);
    setTimeout(scrollToAcsatTrendSection, 150);
  };

  // Helper function to get color based on rating
  const getRatingColor = (rating) => {
    if (rating === null || rating === undefined) return { bg: '#f3f4f6', text: '#6b7280' };
    if (rating < 4) return { bg: '#FF0000', text: '#ffffff' }; // Red - White text (Excel standard)
    if (rating >= 4 && rating < 4.5) return { bg: '#FFA500', text: '#000000' }; // Orange - Black text (Excel standard)
    if (rating >= 4.5) return { bg: '#C6EFCE', text: '#000000' }; // Light Green 2 - Black text (Excel standard)
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Download Excel function with color coding using ExcelJS
  const downloadExcel = async () => {
    if (!filteredData || filteredData.length === 0) {
      alert('No data available to download');
      return;
    }

    console.log('Downloading data with color coding using ExcelJS...');
    console.log('Filtered data:', filteredData);
    console.log('Group by BU:', groupByBU);

    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(groupByBU ? 'BU_wise_Ratings' : 'Account_wise_Ratings');

    const includeBuMainTrendCols = groupByBU && !showTop10 && showAcsatTrendAnalysis && buWiseMainTrendSource;
    const includeTop10MainTrendCols = !groupByBU && showTop10 && showAcsatTrendAnalysis && top10MainTrendSource;
    const includeAccountMainTrendCols = !groupByBU && !showTop10 && showAcsatTrendAnalysis && accountMainTrendSource;

    const buMainTrendHeaderLabels = includeBuMainTrendCols
      ? ACSAT_MAIN_BU_PERSPECTIVES.map(getBuWiseMainTrendColumnLabel)
      : [];

    // Prepare headers based on view type
    const headers = groupByBU 
      ? [
          'Sr. No.',
          'Business Unit',
          ...(processedData.headers.cssColumns || []),
          ...(processedData.headers.perspectives || []),
          ...buMainTrendHeaderLabels
        ]
      : (() => {
          const base = [
            'Sr. No.',
            'Business Unit',
            'Account Name',
            ...(processedData.headers.cssColumns || [])
          ];
          const perspectives = processedData.headers.perspectives || [];
          const extendedPerspectives = [];
          perspectives.forEach((p) => {
            extendedPerspectives.push(p);
            if (includeTop10MainTrendCols && p === 'Partner adding value to Customer Business') {
              ACSAT_MAIN_BU_PERSPECTIVES.forEach((tp) => extendedPerspectives.push(getBuWiseMainTrendColumnLabel(tp)));
            }
            if (includeAccountMainTrendCols && p === 'Partner adding value to Customer Business') {
              ACSAT_MAIN_BU_PERSPECTIVES.forEach((tp) => extendedPerspectives.push(getBuWiseMainTrendColumnLabel(tp)));
            }
          });
          return [...base, ...extendedPerspectives];
        })();

    // Add headers to worksheet
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E3A8A' } // Navy blue background
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' } // White text
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: true // Enable word wrapping
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
    });
    
    // Set header row height for better text wrapping
    headerRow.height = 50;

    // Add data rows
    filteredData.forEach((row, rowIndex) => {
      const dataRow = groupByBU 
        ? [
            rowIndex + 1,
      row.businessUnit || '',
            ...(processedData.headers.cssColumns || []).map(column => 
              row[column] || 0
            ),
            ...(processedData.headers.perspectives || []).map(perspective => {
              const perspectiveValue = row[perspective];
              // Show '-' when received count is 0, otherwise show value or 'N/A'
              if (perspectiveValue === '-') return '-';
              return perspectiveValue !== null && perspectiveValue !== undefined ? perspectiveValue : 'N/A';
            }),
            ...(includeBuMainTrendCols
              ? ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
                  formatBuTrendDiffDisplay(getBuWisePerspectiveTrendDiff(row, perspective)).text
                )
              : [])
          ]
        : [
            rowIndex + 1,
      row.businessUnit || '',
      row.customerName || '',
      ...(processedData.headers.cssColumns || []).map(column => 
        row[column] || 0
      ),
      ...(() => {
        const out = [];
        (processedData.headers.perspectives || []).forEach((perspective) => {
              const perspectiveValue = row[perspective];
              // Show '-' when received count is 0, otherwise show value or 'N/A'
          if (perspectiveValue === '-') out.push('-');
          else out.push(perspectiveValue !== null && perspectiveValue !== undefined ? perspectiveValue : 'N/A');

          if (includeTop10MainTrendCols && perspective === 'Partner adding value to Customer Business') {
            ACSAT_MAIN_BU_PERSPECTIVES.forEach((p) => {
              out.push(formatBuTrendDiffDisplay(getTop10PerspectiveTrendDiff(row, p)).text);
            });
          }
          if (includeAccountMainTrendCols && perspective === 'Partner adding value to Customer Business') {
            ACSAT_MAIN_BU_PERSPECTIVES.forEach((p) => {
              out.push(formatBuTrendDiffDisplay(getAccountPerspectiveTrendDiff(row, p)).text);
            });
          }
        });
        return out;
      })()
          ];


      const addedRow = worksheet.addRow(dataRow);
      
      // Apply word wrapping and alignment to all cells in the data row
      addedRow.eachCell((cell, colNumber) => {
        // Determine if this column is numeric
        // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
        // CSS columns: numeric, Perspective columns: numeric
        const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
        
        // Set number format for numeric columns
        if (isNumericColumn) {
          // Check if it's a CSS column (Polled, Responded) or rating column
          const cssColumnsCount = processedData.headers.cssColumns ? processedData.headers.cssColumns.length : 0;
          const ratingColumnStartIndex = groupByBU ? (2 + cssColumnsCount) : (4 + cssColumnsCount);
          if (colNumber <= (groupByBU ? (2 + cssColumnsCount) : (4 + cssColumnsCount))) {
            // CSS columns (Polled, Responded) - integers
            cell.numFmt = '0';
          } else {
            // Rating columns - decimals
            cell.numFmt = '0.00';
          }
        }
        
        cell.alignment = {
          horizontal: isNumericColumn ? 'center' : 'left', // Text: left, Numeric: center
          vertical: 'middle', // All cells: middle vertical alignment
          wrapText: !isNumericColumn, // Enable word wrapping only for text cells
          indent: !isNumericColumn ? 1 : 0,
          readingOrder: 'left-to-right'
        };
      });
      
      // Set row height for better text wrapping
      addedRow.height = 35;
      
      // Apply color coding to rating columns (excluding CSS columns)
    const ratingColumns = processedData.headers.perspectives || [];
      const cssColumnsCount = processedData.headers.cssColumns ? processedData.headers.cssColumns.length : 0;
      const ratingColumnStartIndex = groupByBU ? (2 + cssColumnsCount) : (4 + cssColumnsCount); // 1-based indexing (after Sr. No., Business Unit, Account Name)
      
      console.log(`🎨 Color formatting for row ${rowIndex + 2}:`);
      console.log(`  - Rating columns: ${ratingColumns.length}`);
      console.log(`  - Rating columns list: ${JSON.stringify(ratingColumns)}`);
      console.log(`  - CSS columns count: ${cssColumnsCount}`);
      console.log(`  - Rating column start index: ${ratingColumnStartIndex}`);
      console.log(`  - Group by BU: ${groupByBU}`);
      
      // Debug the data row to see what values are being processed
      console.log(`📊 Data row values: ${JSON.stringify(dataRow)}`);
      console.log(`📊 Data row length: ${dataRow.length}`);
      console.log(`📊 Rating columns in data row:`, dataRow.slice(ratingColumnStartIndex - 1));
      
      // Apply color formatting only to rating columns (perspectives + Average Rating)
      // Match perspective to actual column by checking header row to ensure correct mapping
      const headerRow = worksheet.getRow(1);
      
      ratingColumns.forEach((perspective, colIndex) => {
        // Calculate expected column index
        const expectedColIndex = ratingColumnStartIndex + colIndex;
        const cell = addedRow.getCell(expectedColIndex);
        const cellValue = cell.value;
        
        // Verify the header matches the perspective name
        const headerCell = headerRow.getCell(expectedColIndex);
        const headerValue = headerCell ? headerCell.value : null;
        
        // Debug column mapping
        if (perspective === 'Partner adding value to Customer Business') {
          console.log(`🔍 Column mapping check for "${perspective}":`);
          console.log(`  - Expected column index: ${expectedColIndex}`);
          console.log(`  - Cell address: ${cell.address}`);
          console.log(`  - Header value at this column: ${headerValue}`);
          console.log(`  - Perspective matches header: ${headerValue === perspective}`);
          console.log(`  - Cell value: ${cellValue}`);
        }
        
        // If header doesn't match, try to find the correct column
        let actualCell = cell;
        if (headerValue !== perspective) {
          // Try to find the column with matching header
          for (let col = 1; col <= worksheet.columnCount; col++) {
            const testHeader = headerRow.getCell(col);
            if (testHeader && testHeader.value === perspective) {
              actualCell = addedRow.getCell(col);
              console.log(`🔧 Found correct column for "${perspective}": ${actualCell.address} (was ${cell.address})`);
              break;
            }
          }
        }
        
        const actualCellValue = actualCell.value;
        console.log(`🎨 Processing cell ${actualCell.address}: value=${actualCellValue}, perspective=${perspective}, expected header: ${headerValue}`);
        
        // Special debugging for Average Rating column
        if (perspective === 'Average Rating') {
          console.log(`🔍 Average Rating column processing:`);
          console.log(`  - Cell address: ${cell.address}`);
          console.log(`  - Cell value: ${cellValue}`);
          console.log(`  - Value type: ${typeof cellValue}`);
          console.log(`  - Is NaN: ${isNaN(cellValue)}`);
          console.log(`  - Is empty: ${cellValue === ''}`);
          console.log(`  - Is N/A: ${cellValue === 'N/A'}`);
          console.log(`  - Column index: ${colIndex}`);
          console.log(`  - Rating column start index: ${ratingColumnStartIndex}`);
          console.log(`  - Actual cell position: ${ratingColumnStartIndex + colIndex}`);
          console.log(`  - Data row value at this position: ${dataRow[ratingColumnStartIndex + colIndex - 1]}`);
        }
        
        // Special debugging for Meeting Delivery Commitments column
        if (perspective === 'Meeting Delivery Commitments') {
          console.log(`🔍 Meeting Delivery Commitments column processing:`);
          console.log(`  - Cell address: ${cell.address}`);
          console.log(`  - Cell value: ${cellValue}`);
          console.log(`  - Value type: ${typeof cellValue}`);
          console.log(`  - Is NaN: ${isNaN(cellValue)}`);
          console.log(`  - Is empty: ${cellValue === ''}`);
          console.log(`  - Is N/A: ${cellValue === 'N/A'}`);
          console.log(`  - Column index: ${colIndex}`);
          console.log(`  - Rating column start index: ${ratingColumnStartIndex}`);
          console.log(`  - Actual cell position: ${ratingColumnStartIndex + colIndex}`);
          console.log(`  - Data row value at this position: ${dataRow[ratingColumnStartIndex + colIndex - 1]}`);
        }
        
        // Special debugging for Partner adding value to Customer Business column
        if (perspective === 'Partner adding value to Customer Business') {
          console.log(`🔍 Partner adding value to Customer Business column processing:`);
          console.log(`  - Cell address: ${cell.address}`);
          console.log(`  - Cell value: ${cellValue}`);
          console.log(`  - Value type: ${typeof cellValue}`);
          console.log(`  - Is NaN: ${isNaN(cellValue)}`);
          console.log(`  - Is empty: ${cellValue === ''}`);
          console.log(`  - Is N/A: ${cellValue === 'N/A'}`);
          console.log(`  - Column index: ${colIndex}`);
          console.log(`  - Rating column start index: ${ratingColumnStartIndex}`);
          console.log(`  - Actual cell position: ${ratingColumnStartIndex + colIndex}`);
          console.log(`  - Data row value at this position: ${dataRow[ratingColumnStartIndex + colIndex - 1]}`);
          console.log(`  - Raw row perspective value: ${row[perspective]}`);
          console.log(`  - Perspective !== 'Average Rating': ${perspective !== 'Average Rating'}`);
        }
        
        // Apply color formatting for perspective columns
        if (perspective !== 'Average Rating') {
          // Regular perspective columns
          // Use actualCell and actualCellValue (which may have been corrected if header didn't match)
          
          // Parse the value to a number - prioritize actualCellValue since it's what Excel has
          let rating = null;
          
          // First try actualCellValue (most reliable - what ExcelJS sees in the correct cell)
          if (actualCellValue !== null && actualCellValue !== undefined && actualCellValue !== '' && actualCellValue !== 'N/A') {
            const numCellValue = typeof actualCellValue === 'number' ? actualCellValue : parseFloat(String(actualCellValue).trim());
            if (!isNaN(numCellValue) && isFinite(numCellValue)) {
              rating = numCellValue;
            }
          }
          
          // Fallback to row[perspective] (the actual data from our row object)
          if (rating === null) {
            const rowPerspectiveValue = row[perspective];
            if (rowPerspectiveValue !== null && rowPerspectiveValue !== undefined && rowPerspectiveValue !== '' && rowPerspectiveValue !== 'N/A') {
              const numRowValue = typeof rowPerspectiveValue === 'number' ? rowPerspectiveValue : parseFloat(String(rowPerspectiveValue).trim());
              if (!isNaN(numRowValue) && isFinite(numRowValue)) {
                rating = numRowValue;
              }
            }
          }
          
          // Debug for Partner adding value column
          if (perspective === 'Partner adding value to Customer Business') {
            console.log(`🔍 Partner adding value column - actualCellValue: ${actualCellValue} (type: ${typeof actualCellValue}), actualCell.address: ${actualCell.address}, row[perspective]: ${row[perspective]}, FINAL rating: ${rating}`);
            console.log(`🔍 Condition checks - rating < 4: ${rating < 4}, rating >= 4: ${rating >= 4}, rating < 4.5: ${rating < 4.5}, rating >= 4 && rating < 4.5: ${rating >= 4 && rating < 4.5}`);
          }
          
          // Apply color coding based on rating value - FORCE APPLICATION for all perspective columns
          // Use actualCell instead of cell to ensure we're applying to the correct column
          if (rating !== null && !isNaN(rating) && isFinite(rating)) {
            if (rating < 4) {
              // Red - <4 (White Text) (Excel standard)
              actualCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' }
              };
              actualCell.font = {
              bold: true,
                color: { argb: 'FFFFFFFF' }
              };
              console.log(`✅ Applied Dark Red to ${actualCell.address} (rating: ${rating}) - <4 for ${perspective}`);
            } else if (rating >= 4 && rating < 4.5) {
              // Orange - 4 to 4.49 (Black Text) (Excel standard)
              // Explicitly set fill pattern and color
              actualCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFA500' }
              };
              actualCell.font = {
                bold: true,
                color: { argb: 'FF000000' }
              };
              // Verify the fill was set
              console.log(`✅ Applied Orange to ${actualCell.address} (rating: ${rating}) - 4 to 4.49 for ${perspective}`);
              console.log(`🔍 Verification - actualCell.fill.fgColor: ${JSON.stringify(actualCell.fill.fgColor)}, actualCell.font.color: ${JSON.stringify(actualCell.font.color)}`);
            } else if (rating >= 4.5) {
              // Light Green 2 - >=4.5 (Black Text) - Excel standard
              actualCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC6EFCE' }
              };
              actualCell.font = {
                bold: true,
                color: { argb: 'FF000000' }
              };
              console.log(`✅ Applied Light Green 2 to ${actualCell.address} (rating: ${rating}) - >=4.5 for ${perspective}`);
            } else {
              // Rating > 5 or unexpected value - apply default styling but log warning
              console.log(`⚠️ Unexpected rating value: ${rating} for ${actualCell.address} in ${perspective}`);
            }
            
            // Log for Partner adding value column
            if (perspective === 'Partner adding value to Customer Business') {
              console.log(`✅ Applied color to Partner adding value column: ${actualCell.address}, rating: ${rating}, row[perspective]: ${row[perspective]}`);
            }
          } else {
            // N/A or empty values
            actualCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF3F4F6' }
            };
            actualCell.font = {
              color: { argb: 'FF6B7280' }
            };
            console.log(`✅ Applied N/A styling to ${actualCell.address} for ${perspective}`);
            
            // Log for Partner adding value column
            if (perspective === 'Partner adding value to Customer Business') {
              console.log(`⚠️ Partner adding value column has N/A/empty value - actualCellValue: ${actualCellValue}, row[perspective]: ${row[perspective]}`);
            }
          }
          
          // Ensure common styling is applied AFTER color coding to preserve colors
          actualCell.alignment = {
          horizontal: 'center', // Numeric values (ratings) should be center-aligned
          vertical: 'middle' // Middle vertical alignment for numeric values
        };
          actualCell.border = {
          top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
          right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
        };
          
          // FORCE re-apply fill and font AFTER common styling to ensure colors persist
          if (perspective !== 'Average Rating' && rating !== null && !isNaN(rating) && isFinite(rating)) {
            if (rating < 4) {
              // Re-apply Red (Excel standard)
              actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              actualCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            } else if (rating >= 4 && rating < 4.5) {
              // Re-apply Orange - FORCE APPLICATION (Excel standard)
              actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              actualCell.font = { bold: true, color: { argb: 'FF000000' } };
              if (perspective === 'Partner adding value to Customer Business') {
                console.log(`🔄 FORCED Orange re-apply to ${actualCell.address} (rating: ${rating})`);
              }
            } else if (rating >= 4.5) {
              // Re-apply Light Green 2
              actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              actualCell.font = { bold: true, color: { argb: 'FF000000' } };
            }
          } else if (perspective !== 'Average Rating') {
            // Re-apply N/A or '-' (hyphen) styling
            const perspectiveValue = row[perspective];
            if (actualCellValue === null || actualCellValue === undefined || actualCellValue === '' || actualCellValue === 'N/A' || actualCellValue === '-' ||
                (perspectiveValue !== null && perspectiveValue !== undefined && (perspectiveValue === '' || perspectiveValue === 'N/A' || perspectiveValue === '-'))) {
              actualCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
              actualCell.font = { color: { argb: 'FF6B7280' } };
            }
          }
        }
      });
      
      // FINAL PASS: Force apply colors to ALL perspective columns one more time to ensure they persist
      // This is a safety measure to ensure colors aren't overwritten
      // Use header matching to find the correct column for each perspective
      ratingColumns.forEach((perspective, colIndex) => {
        if (perspective !== 'Average Rating') {
          // Find the correct column by matching header
          let finalCell = null;
          const expectedColIndex = ratingColumnStartIndex + colIndex;
          
          // Check if expected column has correct header
          const expectedHeader = headerRow.getCell(expectedColIndex);
          if (expectedHeader && expectedHeader.value === perspective) {
            finalCell = addedRow.getCell(expectedColIndex);
          } else {
            // Search for the column with matching header
            for (let col = 1; col <= worksheet.columnCount; col++) {
              const testHeader = headerRow.getCell(col);
              if (testHeader && testHeader.value === perspective) {
                finalCell = addedRow.getCell(col);
                if (perspective === 'Partner adding value to Customer Business') {
                  console.log(`🎯 FINAL PASS: Found correct column for "${perspective}" at ${finalCell.address} (expected was column ${expectedColIndex})`);
                }
                break;
              }
            }
            // Fallback to expected column if not found
            if (!finalCell) {
              finalCell = addedRow.getCell(expectedColIndex);
              if (perspective === 'Partner adding value to Customer Business') {
                console.log(`⚠️ FINAL PASS: Could not find column for "${perspective}", using expected column ${expectedColIndex}`);
              }
            }
          }
          
          if (!finalCell) return;
          
          const cellVal = finalCell.value;
          
          // Parse rating (skip if value is '-' or 'N/A')
          let finalRating = null;
          if (cellVal !== null && cellVal !== undefined && cellVal !== '' && cellVal !== 'N/A' && cellVal !== '-') {
            const numVal = typeof cellVal === 'number' ? cellVal : parseFloat(String(cellVal).trim());
            if (!isNaN(numVal) && isFinite(numVal)) {
              finalRating = numVal;
            }
          }
          
          // Fallback to row[perspective] if cell value is not available
          if (finalRating === null && row[perspective] !== null && row[perspective] !== undefined && row[perspective] !== '-' && row[perspective] !== 'N/A') {
            const numRowValue = typeof row[perspective] === 'number' ? row[perspective] : parseFloat(String(row[perspective]).trim());
            if (!isNaN(numRowValue) && isFinite(numRowValue)) {
              finalRating = numRowValue;
            }
          }
          
          // Apply color based on rating - FINAL APPLICATION
          // If value is '-' or 'N/A', apply gray styling
          if (finalRating !== null && !isNaN(finalRating) && isFinite(finalRating)) {
            if (finalRating < 4) {
              finalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel standard)
              finalCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            } else if (finalRating >= 4 && finalRating < 4.5) {
              finalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange (Excel standard)
              finalCell.font = { bold: true, color: { argb: 'FF000000' } };
              if (perspective === 'Partner adding value to Customer Business') {
                console.log(`🎯 FINAL PASS: Orange applied to ${finalCell.address} (rating: ${finalRating}, cellVal: ${cellVal}, row[perspective]: ${row[perspective]})`);
              }
            } else if (finalRating >= 4.5) {
              finalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
              finalCell.font = { bold: true, color: { argb: 'FF000000' } };
            }
            // Ensure alignment is preserved - numeric values should be center-aligned
            finalCell.alignment = { horizontal: 'center', vertical: 'middle' }; // Numeric values: center horizontal, middle vertical
            finalCell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          } else {
            // Apply gray styling for '-' (hyphen) or 'N/A' values
            const perspectiveValue = row[perspective];
            const cellValue = finalCell.value;
            if (cellValue === '-' || cellValue === 'N/A' || perspectiveValue === '-' || perspectiveValue === 'N/A' ||
                (cellValue === null && (perspectiveValue === null || perspectiveValue === undefined))) {
              finalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
              finalCell.font = { color: { argb: 'FF6B7280' } };
            }
            if (perspective === 'Partner adding value to Customer Business') {
              console.log(`⚠️ FINAL PASS: Rating is null/hyphen for "${perspective}" - cellVal: ${cellVal}, row[perspective]: ${row[perspective]}`);
            }
          }
        }
      });
      
      // Apply neutral styling to CSS columns (no color formatting)
      if (processedData.headers.cssColumns && processedData.headers.cssColumns.length > 0) {
        const cssColumnStartIndex = groupByBU ? 3 : 4; // 1-based indexing (after Sr. No., Business Unit, Account Name)
        
        processedData.headers.cssColumns.forEach((cssColumn, cssColIndex) => {
          const cell = addedRow.getCell(cssColumnStartIndex + cssColIndex);
          
          // Apply neutral styling (no background color)
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFFFFF' } // White background
          };
          cell.font = {
            color: { argb: 'FF000000' } // Black text
          };
          cell.alignment = {
            horizontal: 'center', // Polled and Responded are numeric values - center align
            vertical: 'middle' // Middle vertical alignment
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          console.log(`✅ Applied neutral styling to CSS column ${cell.address}: ${cssColumn}`);
        });
      }

      if (includeBuMainTrendCols) {
        const perspectiveCount = ratingColumns.length;
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective, trendColIndex) => {
          const colIndex1Based = ratingColumnStartIndex + perspectiveCount + trendColIndex;
          const cell = addedRow.getCell(colIndex1Based);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getBuWisePerspectiveTrendDiff(row, perspective))
          );
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      }

      if (includeTop10MainTrendCols) {
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective) => {
          const headerLabel = getBuWiseMainTrendColumnLabel(perspective);
          let colIndex1Based = null;
          for (let col = 1; col <= worksheet.columnCount; col++) {
            const headerVal = headerRow.getCell(col)?.value;
            if (headerVal === headerLabel) {
              colIndex1Based = col;
              break;
            }
          }
          if (!colIndex1Based) return;
          const cell = addedRow.getCell(colIndex1Based);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getTop10PerspectiveTrendDiff(row, perspective))
          );
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      }

      if (includeAccountMainTrendCols) {
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective) => {
          const headerLabel = getBuWiseMainTrendColumnLabel(perspective);
          let colIndex1Based = null;
          for (let col = 1; col <= worksheet.columnCount; col++) {
            const headerVal = headerRow.getCell(col)?.value;
            if (headerVal === headerLabel) {
              colIndex1Based = col;
              break;
            }
          }
          if (!colIndex1Based) return;
          const cell = addedRow.getCell(colIndex1Based);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getAccountPerspectiveTrendDiff(row, perspective))
          );
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
            right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
          };
        });
      }
    });

    // Ensure all color formatting is applied
    console.log('🎨 Color formatting completed for all rows');
    
    // Add Grand Total Row to Excel (before legend)
    if (grandTotals) {
      const grandTotalRow = groupByBU 
        ? [
            '',
            'Org Level',
            ...(processedData.headers.cssColumns || []).map(column => 
              column === 'Polled' ? grandTotals.cssSentCount :
              column === 'Responded' ? grandTotals.cssReceivedCount :
              0
            ),
            ...(processedData.headers.perspectives || []).map(perspective => 
              grandTotals.perspectives[perspective] || 'N/A'
            ),
            ...(includeBuMainTrendCols
              ? ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
                  formatBuTrendDiffDisplay(getBuWiseOrgPerspectiveTrendDiff(perspective)).text
            )
              : [])
          ]
        : (() => {
            const base = [
            '',
            showTop10 ? 'Top 10 Accounts' : 'Grand Total',
            '-',
            ...(processedData.headers.cssColumns || []).map(column => 
              column === 'Polled' ? grandTotals.cssSentCount :
              column === 'Responded' ? grandTotals.cssReceivedCount :
              0
              )
            ];
            const out = [];
            (processedData.headers.perspectives || []).forEach((perspective) => {
              out.push(grandTotals.perspectives[perspective] || 'N/A');
              if (includeTop10MainTrendCols && perspective === 'Partner adding value to Customer Business') {
                ACSAT_MAIN_BU_PERSPECTIVES.forEach((p) => {
                  out.push(formatBuTrendDiffDisplay(getTop10AccountsPerspectiveTrendDiff(p)).text);
                });
              }
              if (includeAccountMainTrendCols && perspective === 'Partner adding value to Customer Business') {
                ACSAT_MAIN_BU_PERSPECTIVES.forEach((p) => {
                  out.push(formatBuTrendDiffDisplay(getAccountOrgPerspectiveTrendDiff(p)).text);
                });
              }
            });
            return [...base, ...out];
          })();
      
      const grandTotalExcelRow = worksheet.addRow(grandTotalRow);
      
      // Style the grand total row
      grandTotalExcelRow.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE2E8F0' } // Light gray background
        };
        cell.font = {
          bold: true,
          size: 11,
          color: { argb: 'FF000000' } // Black font color
        };
        
        // Determine if this column is numeric
        const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
        
        cell.alignment = {
          horizontal: isNumericColumn ? 'center' : 'left',
          vertical: 'middle',
          wrapText: !isNumericColumn
        };
        cell.border = {
          top: { style: 'medium', color: { argb: 'FF1D4ED8' } },
          bottom: { style: 'medium', color: { argb: 'FF1D4ED8' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      });
      
      // Apply color coding to perspective columns in grand total row
      if (processedData.headers.perspectives && processedData.headers.perspectives.length > 0) {
        const cssColumnsCount = processedData.headers.cssColumns ? processedData.headers.cssColumns.length : 0;
        const ratingColumnStartIndex = groupByBU ? (2 + cssColumnsCount) : (4 + cssColumnsCount);
        
        processedData.headers.perspectives.forEach((perspective, colIndex) => {
          // Find the correct column by matching header (similar to regular rows)
          let cell = null;
          const expectedColIndex = ratingColumnStartIndex + colIndex;
          
          // Check if expected column has correct header
          const expectedHeader = headerRow.getCell(expectedColIndex);
          if (expectedHeader && expectedHeader.value === perspective) {
            cell = grandTotalExcelRow.getCell(expectedColIndex);
          } else {
            // Search for the column with matching header
            for (let col = 1; col <= worksheet.columnCount; col++) {
              const testHeader = headerRow.getCell(col);
              if (testHeader && testHeader.value === perspective) {
                cell = grandTotalExcelRow.getCell(col);
                if (perspective === 'Partner adding value to Customer Business') {
                  console.log(`🔍 Grand Total: Found correct column for "${perspective}" at ${cell.address} (expected was column ${expectedColIndex})`);
                }
                break;
              }
            }
            // Fallback to expected column if not found
            if (!cell) {
              cell = grandTotalExcelRow.getCell(expectedColIndex);
              if (perspective === 'Partner adding value to Customer Business') {
                console.log(`⚠️ Grand Total: Could not find column for "${perspective}", using expected column ${expectedColIndex}`);
              }
            }
          }
          
          if (!cell) return;
          
          const cellValue = cell.value;
          
          if (cellValue !== 'N/A' && cellValue !== null && cellValue !== undefined && !isNaN(cellValue) && cellValue !== '') {
            const rating = parseFloat(cellValue);
            
            if (rating < 4) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' } // Red (Excel standard)
              };
              cell.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' } // White font color for Red
              };
            } else if (rating >= 4 && rating < 4.5) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFA500' } // Orange (Excel standard)
              };
              cell.font = {
                bold: true,
                color: { argb: 'FF000000' } // Black font color
              };
              if (perspective === 'Partner adding value to Customer Business') {
                console.log(`✅ Grand Total: Applied Orange to ${cell.address} (rating: ${rating}) for "${perspective}"`);
              }
            } else if (rating >= 4.5) {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFC6EFCE' }
              };
              cell.font = {
                bold: true,
                color: { argb: 'FF000000' } // Black font color
              };
            }
          } else {
            // N/A or empty values for Grand Total
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
              fgColor: { argb: 'FFF3F4F6' }
              };
              cell.font = {
                bold: true,
              color: { argb: 'FF6B7280' }
              };
          }
          
          // Ensure alignment is preserved - numeric values should be center-aligned
          cell.alignment = {
            horizontal: 'center', // Numeric values: center horizontal
            vertical: 'middle' // Middle vertical alignment
          };
        });
      }

      if (includeBuMainTrendCols) {
        const cssColumnsCount = processedData.headers.cssColumns ? processedData.headers.cssColumns.length : 0;
        const ratingColumnStartIndex = 2 + cssColumnsCount;
        const perspectiveCount = (processedData.headers.perspectives || []).length;
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective, trendColIndex) => {
          const cell = grandTotalExcelRow.getCell(ratingColumnStartIndex + perspectiveCount + trendColIndex);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getBuWiseOrgPerspectiveTrendDiff(perspective))
          );
        });
      }

      if (includeTop10MainTrendCols) {
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective) => {
          const headerLabel = getBuWiseMainTrendColumnLabel(perspective);
          let colIndex1Based = null;
          for (let col = 1; col <= worksheet.columnCount; col++) {
            const headerVal = headerRow.getCell(col)?.value;
            if (headerVal === headerLabel) {
              colIndex1Based = col;
              break;
            }
          }
          if (!colIndex1Based) return;
          const cell = grandTotalExcelRow.getCell(colIndex1Based);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getTop10AccountsPerspectiveTrendDiff(perspective))
          );
        });
      }

      if (includeAccountMainTrendCols) {
        ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective) => {
          const headerLabel = getBuWiseMainTrendColumnLabel(perspective);
          let colIndex1Based = null;
          for (let col = 1; col <= worksheet.columnCount; col++) {
            const headerVal = headerRow.getCell(col)?.value;
            if (headerVal === headerLabel) {
              colIndex1Based = col;
              break;
            }
          }
          if (!colIndex1Based) return;
          const cell = grandTotalExcelRow.getCell(colIndex1Based);
          applyBuTrendDiffExcelCellStyle(
            cell,
            formatBuTrendDiffDisplay(getAccountOrgPerspectiveTrendDiff(perspective))
          );
        });
      }

      // Add Other Account row (only for Top 10 view)
      if (showTop10 && otherAccountTotals) {
        const otherRow = groupByBU 
          ? [
              '',
              'Other Accounts',
              ...(processedData.headers.cssColumns || []).map(column => 
                column === 'Polled' ? otherAccountTotals.cssSentCount :
                column === 'Responded' ? otherAccountTotals.cssReceivedCount :
                0
              ),
              ...(processedData.headers.perspectives || []).map(perspective => 
                otherAccountTotals.perspectives[perspective] || 'N/A'
              )
            ]
          : (() => {
              const base = [
              '',
              'Other Accounts',
              '-',
              ...(processedData.headers.cssColumns || []).map(column => 
                column === 'Polled' ? otherAccountTotals.cssSentCount :
                column === 'Responded' ? otherAccountTotals.cssReceivedCount :
                0
                )
              ];
              const out = [];
              (processedData.headers.perspectives || []).forEach((perspective) => {
                out.push(otherAccountTotals.perspectives[perspective] || 'N/A');
                if (includeTop10MainTrendCols && perspective === 'Partner adding value to Customer Business') {
                  ACSAT_MAIN_BU_PERSPECTIVES.forEach((p) => {
                    out.push(formatBuTrendDiffDisplay(getTop10OtherAccountsPerspectiveTrendDiff(p)).text);
                  });
                }
              });
              return [...base, ...out];
            })();
        const otherExcelRow = worksheet.addRow(otherRow);
        otherExcelRow.eachCell((cell, colNumber) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          
          // Determine if this column is numeric
          const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
          
          cell.alignment = {
            horizontal: isNumericColumn ? 'center' : 'left', // Text: left, Numeric: center
            vertical: 'middle', // All cells: middle vertical alignment
            wrapText: !isNumericColumn // Enable word wrapping only for text cells
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });

        if (includeTop10MainTrendCols && !groupByBU) {
          ACSAT_MAIN_BU_PERSPECTIVES.forEach((perspective) => {
            const headerLabel = getBuWiseMainTrendColumnLabel(perspective);
            let colIndex1Based = null;
            for (let col = 1; col <= worksheet.columnCount; col++) {
              const headerVal = headerRow.getCell(col)?.value;
              if (headerVal === headerLabel) {
                colIndex1Based = col;
                break;
              }
            }
            if (!colIndex1Based) return;
            const cell = otherExcelRow.getCell(colIndex1Based);
            applyBuTrendDiffExcelCellStyle(
              cell,
              formatBuTrendDiffDisplay(getTop10OtherAccountsPerspectiveTrendDiff(perspective))
            );
          });
        }
      }
    }

    // Add legend below the data and grand total
    const legendStartRow = filteredData.length + 6; // 5 rows gap after data + grand total
    
    // Add legend title
    const legendTitleRow = worksheet.getRow(legendStartRow);
    legendTitleRow.getCell(1).value = 'Legend';
    legendTitleRow.getCell(1).font = {
      bold: true,
      size: 14,
      color: { argb: 'FF1F2937' }
    };
    
    // Add legend headers
    const legendHeaderRow = worksheet.getRow(legendStartRow + 2);
    legendHeaderRow.getCell(1).value = 'Rating Range';
    legendHeaderRow.getCell(2).value = 'Color';
    legendHeaderRow.getCell(3).value = 'Description';
    
    // Style legend headers
    [1, 2, 3].forEach(colNum => {
      const cell = legendHeaderRow.getCell(colNum);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' }
      };
      cell.font = {
                bold: true,
        color: { argb: 'FF374151' }
      };
      cell.alignment = { horizontal: 'left' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
    });
    
    // Add legend items
    const legendItems = [
      { range: '< 4', description: 'Red (White Text)' },
      { range: '4 to 4.49', description: 'Orange (Black Text)' },
      { range: '>= 4.5', description: 'Green (Black Text)' },
      { range: 'N/A', description: 'No Data Available' }
    ];
    
    const legendColors = [
      { bg: 'FFFF0000', text: 'FFFFFFFF' }, // Red - <4 (White Text) (Excel standard)
      { bg: 'FFFFA500', text: 'FF000000' }, // Orange - 4 to 4.49 (Black Text) (Excel standard)
      { bg: 'FFC6EFCE', text: 'FF000000' }, // Light Green 2 - >=4.5 (Black Text) - Excel standard
      { bg: 'FFF3F4F6', text: 'FF6B7280' }  // N/A - No Data Available
    ];
    
    legendItems.forEach((item, index) => {
      const rowIndex = legendStartRow + 3 + index;
      const legendRow = worksheet.getRow(rowIndex);
      
      legendRow.getCell(1).value = item.range;
      legendRow.getCell(3).value = item.description;
      
      // Style the color cell
      const colorCell = legendRow.getCell(2);
      const colors = legendColors[index];
      
      colorCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.bg }
      };
      colorCell.font = {
                bold: true,
        color: { argb: colors.text }
      };
      colorCell.alignment = { horizontal: 'left' };
      colorCell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
      };
      
      // Style other cells in the legend row
      [1, 3].forEach(colNum => {
        const cell = legendRow.getCell(colNum);
        cell.font = { color: { argb: 'FF374151' } };
        cell.alignment = { horizontal: colNum === 1 ? 'left' : 'center' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
          right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
        };
      });
    });
    
    // Set column widths for better word wrapping
    const colWidths = groupByBU 
      ? [
          { width: 10 }, // Sr. No.
          { width: 25 }, // Business Unit
          ...(processedData.headers.cssColumns || []).map(() => ({ width: 22 })), // CSS columns
          ...(processedData.headers.perspectives || []).map(() => ({ width: 20 })), // Rating columns
          ...(includeBuMainTrendCols ? ACSAT_MAIN_BU_PERSPECTIVES.map(() => ({ width: 22 })) : [])
        ]
      : [
          { width: 10 }, // Sr. No.
          { width: 25 }, // Business Unit
          { width: 30 }, // Account Name
          ...(processedData.headers.cssColumns || []).map(() => ({ width: 22 })), // CSS columns
          ...(processedData.headers.perspectives || []).map(() => ({ width: 20 })), // Rating columns
          ...(includeTop10MainTrendCols ? ACSAT_MAIN_BU_PERSPECTIVES.map(() => ({ width: 22 })) : []),
          ...(includeAccountMainTrendCols ? ACSAT_MAIN_BU_PERSPECTIVES.map(() => ({ width: 22 })) : [])
        ];
    worksheet.columns = colWidths;
    
    // Set narrower width for legend color column (column 2 in legend section)
    // Note: Column 2 is also used for Business Unit in data rows, but we reduce it for the legend color cell
    // The legend uses column 2 for the color cell, so we set it to a narrower width (12)
    worksheet.getColumn(2).width = 12; // Reduced width for color column in legend

    // Summary section removed

    if (trendAnalysisFiles?.length) {
      const trendExportData =
        showAcsatTrendAnalysis && acsatTrendAnalysisData.length > 0
          ? acsatTrendAnalysisData
          : showTop10
            ? trendAnalysisFiles.map((file) => buildAcsatTop10TrendFromFile(file, { top10AccountNames }))
            : groupByBU
              ? trendAnalysisFiles.map((file) => buildAcsatBuWiseTrendFromFile(file))
              : !groupByBU && !showTop10
                ? trendAnalysisFiles.map((file) => buildAcsatAccountWiseTrendFromFile(file))
                : [];
      trendExportData.forEach((fileData, idx) => {
        if (!fileData.hasData) return;
        if (showTop10) addTop10TrendSheetToWorkbook(workbook, fileData, idx);
        else if (groupByBU) addBuWiseTrendSheetToWorkbook(workbook, fileData, idx);
        else if (!groupByBU && !showTop10) addAccountWiseTrendSheetToWorkbook(workbook, fileData, idx);
      });
    }

    // Generate and download file
    let fileName;
    const todayStr = new Date().toISOString().split('T')[0];
    if (showTop10) {
      fileName = `ACSAT_Top10_Account_Average_CSAT_Scores_Perspective_Wise_${todayStr}.xlsx`;
    } else if (groupByBU) {
      fileName = `Org_level_BU_wise_rating_Dashboard_${todayStr}.xlsx`;
    } else {
      fileName = `Org_level_Account_wise_rating_Dashboard_${todayStr}.xlsx`;
    }
    
    console.log('🎨 Excel file generated with ExcelJS color coding:');
    console.log(`  - File name: ${fileName}`);
    console.log(`  - View type: ${groupByBU ? 'BU-wise' : 'Account-wise'}`);
    console.log(`  - Rating columns: ${(processedData.headers.perspectives || []).length}`);
    console.log(`  - Data rows: ${filteredData.length}`);
    
    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Excel file downloaded successfully with ExcelJS color formatting!');
    } catch (error) {
      console.error('❌ Error downloading Excel file:', error);
      alert('Error downloading Excel file. Please try again.');
    }
  };

  if (!excelData) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT: Org & BU Level Average CSAT Scores (Perspective-Wise)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <LoadingMessage>
          Loading dashboard data...
        </LoadingMessage>
      </DashboardContainer>
    );
  }

  if (processedData?.error) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT: Org & BU Level Average CSAT Scores (Perspective-Wise)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <ErrorMessage>
          {processedData.error}
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  if (!processedData?.data || processedData.data.length === 0) {
    const receivedSheet = excelData?.SheetNames
      ? findAcsatReceivedReportSheetName(excelData.SheetNames)
      : null;
    return (
      <DashboardContainer>
        <Header>
          <Title>📊 ACSAT: Org & BU Level Average CSAT Scores (Perspective-Wise)</Title>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </Header>
        <ErrorMessage>
          No dashboard rows after processing
          {receivedSheet ? ` (sheet: "${receivedSheet}")` : ''}.
          Confirm the file has a &quot;CSAT received Report&quot; sheet with Business Unit, Customer, Perspective, and Rating
          {acsatCycle ? `, and rows for CSAT cycle ${acsatCycle}` : ''}
          {acsatCycleStartDateFormatted ? ` on or after ${acsatCycleStartDateFormatted}` : ''}.
        </ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
        <Title>
          📊 ACSAT: {showTop10 ? 'Top 10 Account' : 'Org & BU Level'} Average CSAT Scores (Perspective-Wise)
        </Title>
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
            active={!groupByBU}
            onClick={() => {
              setGroupByBU(false);
              setShowTop10(false);
              setShowAcsatTrendAnalysis(false);
            }}
          >
            👥 Show by Account
          </ToggleButton>
          <ToggleButton 
            active={groupByBU}
            onClick={() => {
              setGroupByBU(true);
              setShowTop10(false);
              setShowAcsatTrendAnalysis(false);
            }}
          >
            📈 Show by Business Unit
          </ToggleButton>
          <DownloadButton
            onClick={() => {
              if (showTop10) return;
                setGroupByBU(false);
              setShowTop10(true);
            }}
          >
            🏆 Top 10 account -Average CSAT Scores (Perspective-Wise)
          </DownloadButton>
          <DownloadButton onClick={handleViewAcsatTrendAnalysis}>
            <TrendingUp size={16} />
            View ACSAT trend analysis
          </DownloadButton>
          <DownloadButton onClick={downloadExcel}>
            <Download size={16} />
            Download Excel
          </DownloadButton>
          <BackButton onClick={onBack}>
            Back
          </BackButton>
        </div>
      </Header>

      <SearchContainer>
        <SearchTitle>
          🔍 {showTop10 ? 'Search Top 10 Account' : (groupByBU ? 'Search Business Unit' : 'Search Customer Name')}
        </SearchTitle>
        <SearchInputContainer>
          <SearchInput
            type="text"
            placeholder={showTop10 ? "Type top 10 account name to search..." : (groupByBU ? "Type business unit to search..." : "Type customer name to search...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: searchTerm ? '4rem' : '1rem' }}
          />
          {searchTerm && (
            <ClearButton
              onClick={() => setSearchTerm('')}
              title="Clear search"
            >
              ✕ Clear
            </ClearButton>
          )}
        </SearchInputContainer>
        <SearchResults>
          {filteredData ? (
            searchTerm.trim() ? (
              `Found ${filteredData.length} of ${processedData.data.length} ${showTop10 ? 'top 10 accounts' : (groupByBU ? 'business units' : 'customers')}`
            ) : (
              `Showing all ${processedData.data.length} ${showTop10 ? 'top 10 accounts' : (groupByBU ? 'business units' : 'customers')}`
            )
          ) : (
            'No data available'
          )}
        </SearchResults>
      </SearchContainer>

      <LegendContainer>
        <LegendTitle>
          Legend
        </LegendTitle>
        <LegendGrid>
          <LegendItem>
            <LegendColor style={{ backgroundColor: '#FF0000', borderColor: '#FF0000', color: '#ffffff' }} />
            <LegendText>&lt; 4 (Red - White Text)</LegendText>
          </LegendItem>
          <LegendItem>
            <LegendColor style={{ backgroundColor: '#FFA500', borderColor: '#FFA500', color: '#000000' }} />
            <LegendText>4 to 4.49 (Orange - Black Text)</LegendText>
          </LegendItem>
          <LegendItem>
            <LegendColor style={{ backgroundColor: '#C6EFCE', borderColor: '#C6EFCE', color: '#000000' }} />
            <LegendText>&gt;= 4.5 (Green - Black Text)</LegendText>
          </LegendItem>
        </LegendGrid>
      </LegendContainer>


      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <Th>Sr. No.</Th>
              <Th 
                style={{ cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleSort('businessUnit')}
              >
                {processedData.headers.businessUnit || 'BUSINESS UNIT'}
                {sortConfig.key === 'businessUnit' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </Th>
              {!groupByBU && (
                <Th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('customerName')}
                >
                  Account Name
                  {sortConfig.key === 'customerName' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Th>
              )}
              {processedData.headers.cssColumns && processedData.headers.cssColumns.map(column => (
                <Th 
                  key={column}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort(column)}
                >
                  {column}
                  {sortConfig.key === column && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Th>
              ))}
              {processedData.headers.perspectives && processedData.headers.perspectives.map(perspective => (
                <React.Fragment key={perspective}>
                <Th 
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort(perspective)}
                >
                  {perspective}
                  {sortConfig.key === perspective && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </Th>
                  {showTop10MainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                    ACSAT_MAIN_BU_PERSPECTIVES.map((p) => (
                      <Th
                        key={`top10-trend-header-${p}`}
                        style={{ background: '#0f766e' }}
                      >
                        {getBuWiseMainTrendColumnLabel(p)}
                      </Th>
                    ))}
                  {showAccountMainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                    ACSAT_MAIN_BU_PERSPECTIVES.map((p) => (
                      <Th
                        key={`account-trend-header-${p}`}
                        style={{ background: '#0f766e' }}
                      >
                        {getBuWiseMainTrendColumnLabel(p)}
                      </Th>
                    ))}
                </React.Fragment>
              ))}
              {showBuWiseMainTrendColumns &&
                ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) => (
                  <Th
                    key={`trend-header-${perspective}`}
                    style={{ background: '#0f766e' }}
                  >
                    {getBuWiseMainTrendColumnLabel(perspective)}
                  </Th>
              ))}
            </tr>
          </TableHeader>
          <Tbody>
            {filteredData && filteredData.length > 0 ? (
              <>
                {filteredData.map((row, index) => (
                <Tr key={index}>
                    <Td>{index + 1}</Td>
                  <BusinessUnitTd>{row.businessUnit}</BusinessUnitTd>
                  {!groupByBU && <CustomerNameTd>{row.customerName}</CustomerNameTd>}
                  {processedData.headers.cssColumns && processedData.headers.cssColumns.map(column => (
                    <Td key={column} isNumeric>{row[column] || 0}</Td>
                  ))}
                  {processedData.headers.perspectives && processedData.headers.perspectives.map(perspective => {
                    const perspectiveValue = row[perspective];
                    // Handle '-' (hyphen) for display - show '-' when received count is 0
                    const displayValue = perspectiveValue === '-' ? '-' : (perspectiveValue !== null && perspectiveValue !== undefined ? perspectiveValue : 'N/A');
                    // Convert to number for RatingCell styling (null for '-' or null values)
                    const ratingForCell = (perspectiveValue === '-' || perspectiveValue === null || perspectiveValue === undefined) ? null : 
                                          (typeof perspectiveValue === 'number' ? perspectiveValue : parseFloat(perspectiveValue));
                    return (
                      <React.Fragment key={perspective}>
                        <RatingCell rating={ratingForCell}>
                        {displayValue}
                    </RatingCell>
                        {showTop10MainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                          renderTop10MainTrendCells(row, { keyPrefix: `row-${index}` })}
                        {showAccountMainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                          renderAccountMainTrendCells(row, { keyPrefix: `row-${index}` })}
                      </React.Fragment>
                    );
                  })}
                  {renderBuWiseMainTrendCells(row, { keyPrefix: `row-${index}` })}
                </Tr>
                ))}
                {/* Grand Total Row */}
                {grandTotals && (
                  <Tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                    <Td style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}></Td>
                    <BusinessUnitTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                      {groupByBU ? 'Org Level' : (showTop10 ? 'Top 10 Accounts' : 'Grand Total')}
                    </BusinessUnitTd>
                    {!groupByBU && <CustomerNameTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>-</CustomerNameTd>}
                    {processedData.headers.cssColumns && processedData.headers.cssColumns.map(column => (
                      <Td key={column} isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                        {column === 'Polled' ? grandTotals.cssSentCount :
                         column === 'Responded' ? grandTotals.cssReceivedCount :
                         '-'}
                      </Td>
                    ))}
                    {processedData.headers.perspectives && processedData.headers.perspectives.map(perspective => {
                      const ratingValue = grandTotals.perspectives[perspective];
                      const parsedRating = ratingValue === 'N/A' || ratingValue === null || ratingValue === undefined || ratingValue === '' 
                        ? null 
                        : parseFloat(ratingValue);
                      return (
                        <React.Fragment key={perspective}>
                      <RatingCell 
                          rating={parsedRating}
                          style={{ fontWeight: 'bold' }}
                      >
                          {ratingValue || 'N/A'}
                      </RatingCell>
                          {showTop10MainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                            ACSAT_MAIN_BU_PERSPECTIVES.map((p) =>
                              renderBuWiseTrendDiffCell(getTop10AccountsPerspectiveTrendDiff(p), {
                                bold: true,
                                cellKey: `top10-grand-trend-${p}`
                              })
                            )}
                          {showAccountMainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                            ACSAT_MAIN_BU_PERSPECTIVES.map((p) =>
                              renderBuWiseTrendDiffCell(getAccountOrgPerspectiveTrendDiff(p), {
                                bold: true,
                                cellKey: `account-grand-trend-${p}`
                              })
                            )}
                        </React.Fragment>
                      );
                    })}
                    {showBuWiseMainTrendColumns &&
                      ACSAT_MAIN_BU_PERSPECTIVES.map((perspective) =>
                        renderBuWiseTrendDiffCell(getBuWiseOrgPerspectiveTrendDiff(perspective), {
                          bold: true,
                          cellKey: `grand-trend-${perspective}`
                        })
                      )}
                  </Tr>
                )}
                {/* Other Account Row - only for Top 10 view */}
                {showTop10 && otherAccountTotals && (
                  <Tr style={{ backgroundColor: '#fff7ed', fontWeight: 'bold', borderTop: '2px solid #f59e0b' }}>
                    <Td style={{ fontWeight: 'bold', color: '#000000' }}></Td>
                    <BusinessUnitTd style={{ fontWeight: 'bold', color: '#000000' }}>Other Accounts</BusinessUnitTd>
                    {!groupByBU && <CustomerNameTd style={{ fontWeight: 'bold', color: '#000000' }}>-</CustomerNameTd>}
                    {processedData.headers.cssColumns && processedData.headers.cssColumns.map(column => (
                      <Td key={column} isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>
                        {column === 'Polled' ? otherAccountTotals.cssSentCount :
                         column === 'Responded' ? otherAccountTotals.cssReceivedCount :
                         '-'}
                      </Td>
                    ))}
                    {processedData.headers.perspectives && processedData.headers.perspectives.map(perspective => {
                      const ratingValue = otherAccountTotals.perspectives[perspective];
                      const parsedRating = ratingValue === 'N/A' || ratingValue === null || ratingValue === undefined || ratingValue === ''
                        ? null
                        : parseFloat(ratingValue);
                      return (
                        <React.Fragment key={perspective}>
                      <RatingCell 
                            rating={parsedRating}
                        style={{ fontWeight: 'bold', color: '#000000' }}
                      >
                            {ratingValue}
                      </RatingCell>
                          {showTop10MainTrendColumns && perspective === 'Partner adding value to Customer Business' &&
                            ACSAT_MAIN_BU_PERSPECTIVES.map((p) =>
                              renderBuWiseTrendDiffCell(getTop10OtherAccountsPerspectiveTrendDiff(p), {
                                bold: true,
                                cellKey: `top10-other-trend-${p}`
                              })
                            )}
                        </React.Fragment>
                      );
                    })}
                  </Tr>
                )}
              </>
            ) : (
              <Tr>
                <Td colSpan={
                    (groupByBU ? 2 : 3) +
                    (processedData.headers.cssColumns ? processedData.headers.cssColumns.length : 0) +
                    (processedData.headers.perspectives ? processedData.headers.perspectives.length : 0) +
                    (showBuWiseMainTrendColumns ? ACSAT_MAIN_BU_PERSPECTIVES.length : 0) +
                    (showTop10MainTrendColumns ? ACSAT_MAIN_BU_PERSPECTIVES.length : 0) +
                    (showAccountMainTrendColumns ? ACSAT_MAIN_BU_PERSPECTIVES.length : 0)
                  }
                     style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  {searchTerm.trim() ? (groupByBU ? 'No business units found matching your search' : 'No customers found matching your search') : 'No data available'}
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {(showTop10 || groupByBU) && showAcsatTrendAnalysis && (
        <div ref={acsatTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              {showTop10
                ? 'ACSAT: Top 10 Trend Analysis (Criteria perspectives from uploaded trend files)'
                : 'ACSAT: BU Wise Trend Analysis (Criteria perspectives from uploaded trend files)'}
            </div>
            {groupByBU && !showTop10 && (
              <DownloadButton
                onClick={downloadBuWiseTrendAnalysisExcel}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Download Excel
              </DownloadButton>
            )}
            {showTop10 && !groupByBU && (
              <DownloadButton
                onClick={downloadTop10TrendAnalysisExcel}
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Download Excel
              </DownloadButton>
            )}
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px'
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{ fontWeight: 600, color: '#0f766e', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    {fileData.saveName}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <TableContainer style={{ maxHeight: '50vh' }}>
                      <Table>
                        <TableHeader>
                          <tr>
                            <Th>Sr. No.</Th>
                            <Th>Business Unit</Th>
                            {showTop10 && <Th>Account Name</Th>}
                            <Th>Polled</Th>
                            <Th>Responded</Th>
                            {(fileData.perspectives || []).map((p) => (
                              <Th key={`${fileData.saveName}-${p}`}>{p}</Th>
                            ))}
                          </tr>
                        </TableHeader>
                        <Tbody>
                          {fileData.rows.map((row, rowIdx) => (
                            <Tr key={`${fileData.saveName}-row-${rowIdx}`}>
                              <Td isNumeric>{rowIdx + 1}</Td>
                              <BusinessUnitTd>{row.businessUnit}</BusinessUnitTd>
                              {showTop10 && <CustomerNameTd>{row.customerName}</CustomerNameTd>}
                              <Td isNumeric>{row.Polled ?? 0}</Td>
                              <Td isNumeric>{row.Responded ?? 0}</Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = row[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell key={`${rowIdx}-${p}`} rating={ratingForCell}>
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          ))}
                          {groupByBU && !showTop10 && fileData.grandTotal && (
                            <Tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                              <Td style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}></Td>
                              <BusinessUnitTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.businessUnit}
                              </BusinessUnitTd>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.Polled ?? 0}
                              </Td>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.Responded ?? 0}
                              </Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = fileData.grandTotal[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell
                                    key={`grand-${p}`}
                                    rating={ratingForCell}
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          )}
                          {showTop10 && !groupByBU && fileData.top10AccountsTotal && (
                            <Tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                              <Td style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}></Td>
                              <BusinessUnitTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.top10AccountsTotal.businessUnit}
                              </BusinessUnitTd>
                              <CustomerNameTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.top10AccountsTotal.customerName}
                              </CustomerNameTd>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.top10AccountsTotal.Polled ?? 0}
                              </Td>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.top10AccountsTotal.Responded ?? 0}
                              </Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = fileData.top10AccountsTotal[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell
                                    key={`top10-total-${p}`}
                                    rating={ratingForCell}
                                    style={{ fontWeight: 'bold' }}
                                  >
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          )}
                          {showTop10 && !groupByBU && fileData.otherAccountsTotal && (
                            <Tr style={{ backgroundColor: '#fff7ed', fontWeight: 'bold', borderTop: '2px solid #f59e0b' }}>
                              <Td style={{ fontWeight: 'bold', color: '#000000' }}></Td>
                              <BusinessUnitTd style={{ fontWeight: 'bold', color: '#000000' }}>
                                {fileData.otherAccountsTotal.businessUnit}
                              </BusinessUnitTd>
                              <CustomerNameTd style={{ fontWeight: 'bold', color: '#000000' }}>
                                {fileData.otherAccountsTotal.customerName}
                              </CustomerNameTd>
                              <Td isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>
                                {fileData.otherAccountsTotal.Polled ?? 0}
                              </Td>
                              <Td isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>
                                {fileData.otherAccountsTotal.Responded ?? 0}
                              </Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = fileData.otherAccountsTotal[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell
                                    key={`other-total-${p}`}
                                    rating={ratingForCell}
                                    style={{ fontWeight: 'bold', color: '#000000' }}
                                  >
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!groupByBU && !showTop10 && showAcsatTrendAnalysis && (
        <div ref={acsatTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: Account Wise Trend Analysis (Criteria perspectives from uploaded trend files)
            </div>
            <DownloadButton
              onClick={downloadAccountWiseTrendAnalysisExcel}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Download size={16} />
              Download Excel
            </DownloadButton>
          </div>
          <div style={{
            padding: '1rem',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px'
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-account-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{ fontWeight: 600, color: '#0f766e', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    {fileData.saveName}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <TableContainer style={{ maxHeight: '50vh' }}>
                      <Table>
                        <TableHeader>
                          <tr>
                            <Th>Sr. No.</Th>
                            <Th>Business Unit</Th>
                            <Th>Account Name</Th>
                            <Th>Polled</Th>
                            <Th>Responded</Th>
                            {(fileData.perspectives || []).map((p) => (
                              <Th key={`${fileData.saveName}-acct-${p}`}>{p}</Th>
                            ))}
                          </tr>
                        </TableHeader>
                        <Tbody>
                          {fileData.rows.map((row, rowIdx) => (
                            <Tr key={`${fileData.saveName}-acct-row-${rowIdx}`}>
                              <Td isNumeric>{rowIdx + 1}</Td>
                              <BusinessUnitTd>{row.businessUnit}</BusinessUnitTd>
                              <CustomerNameTd>{row.customerName}</CustomerNameTd>
                              <Td isNumeric>{row.Polled ?? 0}</Td>
                              <Td isNumeric>{row.Responded ?? 0}</Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = row[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell key={`acct-${rowIdx}-${p}`} rating={ratingForCell}>
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          ))}
                          {fileData.grandTotal && (
                            <Tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>
                              <Td style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}></Td>
                              <BusinessUnitTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.businessUnit}
                              </BusinessUnitTd>
                              <CustomerNameTd style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.customerName}
                              </CustomerNameTd>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.Polled ?? 0}
                              </Td>
                              <Td isNumeric style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}>
                                {fileData.grandTotal.Responded ?? 0}
                              </Td>
                              {(fileData.perspectives || []).map((p) => {
                                const val = fileData.grandTotal[p];
                                const ratingForCell = (val === '-' || val == null) ? null : parseFloat(val);
                                return (
                                  <RatingCell
                                    key={`acct-grand-${p}`}
                                    rating={ratingForCell}
                                    style={{ fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#000000' }}
                                  >
                                    {val === '-' || val == null ? '-' : val}
                                  </RatingCell>
                                );
                              })}
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </DashboardContainer>
  );
}

export default AccountLevelRatingDashboard;
