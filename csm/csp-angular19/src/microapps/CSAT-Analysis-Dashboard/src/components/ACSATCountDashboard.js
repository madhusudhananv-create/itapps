import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Download, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import {
  buildRowFromHeaders,
  filterRowsByAcsatCycle,
  getCsatReceivedDateFromRow,
  getCsatSentDateFromRow,
  getYearQuarterFromRow,
  isDateOnOrAfterAcsatCycleStart,
  normalizeAcsatRowCanonicalFields,
  parseExcelDateToMMDDYYYY,
  yearQuarterMatchesCycle,
} from '../utils/acsatExcelRowUtils';

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

  &:hover {
    background: #2563eb;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ToggleButton = styled.button`
  background: ${props => props.active ? '#10b981' : '#e5e7eb'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#059669' : '#d1d5db'};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 300px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ClearButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: auto;
  max-height: 70vh;
  overflow-y: auto;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 2px solid #374151;
`;

const TableHeader = styled.thead`
  background: #1e3a8a;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: #ffffff;
  border: 1px solid #ffffff;
  background: #1e3a8a;
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  z-index: ${props => props.isFirstColumn ? '11' : '10'};
  min-width: ${props => props.isFirstColumn ? '80px' : '120px'};
  
  &:hover {
    background: #1e40af !important;
    cursor: pointer;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: #f9fafb;
  }

  &:hover {
    background: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border: 1px solid #6b7280;
  color: #374151;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
  position: ${props => props.isFirstColumn ? 'sticky' : 'static'};
  left: ${props => props.isFirstColumn ? '0' : 'auto'};
  z-index: ${props => props.isFirstColumn ? '11' : '10'};
  background: ${props => props.isFirstColumn ? 'inherit' : 'transparent'};
  min-width: ${props => props.isFirstColumn ? '80px' : '120px'};
  background-color: ${props => {
    if (props.isPercentage) {
      // If Responded (cssReceivedCount) is 0, cell color should be white
      if (props.responded === 0 || props.responded === '0') {
        return '#FFFFFF'; // White background
      }
      const value = parseFloat(props.value);
      if (value > 90) return '#C6EFCE'; // Light Green 2 >90% (Excel standard)
      if (value >= 70 && value <= 90) return '#FFA500'; // Orange 70-90% (Excel standard)
      return '#FF0000'; // Red <70% (Excel standard)
    }
    return 'transparent';
  }};
  color: ${props => {
    if (props.isPercentage) {
      // If Responded (cssReceivedCount) is 0, use default text color
      if (props.responded === 0 || props.responded === '0') {
        return '#374151';
      }
      const value = parseFloat(props.value);
      if (value > 90) return '#000000'; // Black for Light Green
      if (value >= 70 && value <= 90) return '#000000'; // Black for Orange
      return '#ffffff'; // White for Red
    }
    return '#374151';
  }};
  font-weight: ${props => props.isPercentage ? '600' : 'normal'};
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background: #059669;
  }
`;

const TrendAnalysisButton = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  }
`;

const ScrollIndicator = styled.div`
  text-align: center;
  padding: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid #d1d5db;
`;

const SummaryContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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

const PerspectivePercentage = styled.span`
  font-weight: 700;
  color: ${props => props.percentage >= 90 ? '#047857' : '#059669'};
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
  border-bottom: 2px solid #10b981;
`;

const BUAnalysis = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  color: ${props => {
    if (props.percentage >= 90) return '#047857';
    if (props.percentage >= 75) return '#059669';
    return '#6b7280';
  }};
  line-height: 1.3;
  font-weight: ${props => props.percentage >= 75 ? '600' : '400'};
`;

const ConcernItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
  margin-bottom: 0.5rem;
`;

const ConcernName = styled.span`
  font-weight: 600;
  color: #FF0000; // Red (Excel standard)
  font-size: 0.9rem;
`;

const ConcernPercentage = styled.span`
  font-weight: 700;
  color: #FF0000; // Red (Excel standard)
  font-size: 0.9rem;
`;

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

const getCustomerKeyFromRow = (row) => {
  const customerId = normalizeCustomerIdKey(
    row['CUSTOMER_ID'] || row['CUST_ID'] || row['Customer ID'] || row.CUSTOMER_ID || row.CUST_ID || ''
  );
  const customerName = (row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'] ||
    row.CUST_NM || row['CUST_NM'] || '').toString().trim();
  return customerId || customerName;
};

const ACSAT_SATISFIED_TARGET_PERSPECTIVES = [
  'Meeting Delivery Commitments',
  'Customer Engagement and Relationship',
  'Partner adding value to Customer Business',
];

const getPerspectiveFromRow = (row) =>
  (row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'] || '')
    .toString()
    .trim();

const getRatingFromRow = (row) => {
  const rating = parseFloat(
    row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']
  );
  return Number.isNaN(rating) ? null : rating;
};

const getQuestionCategoryFromRow = (row) => {
  if (!row) return '';
  const exact =
    row['QUESTION_CATEGORY'] ||
    row['QUESTION CATEGORY'] ||
    row['Question Category'] ||
    row['question_category'] ||
    row['QUESTION-CATEGORY'];
  if (exact != null && String(exact).trim() !== '') return String(exact).trim();
  const fuzzyKey = Object.keys(row).find(
    (k) => (k || '').trim().toLowerCase().replace(/[\s_-]/g, '') === 'questioncategory'
  );
  return fuzzyKey ? String(row[fuzzyKey]).trim() : '';
};

const getTypeOfAccountFromRow = (row) =>
  (row['TYPE OF ACCOUNT'] || row['TYPE_OF_ACCOUNT'] || row['Type of Account'] || row['type_of_account'] || '')
    .toString()
    .trim();

const isCriteriaCsatRow = (row) => getQuestionCategoryFromRow(row) === 'Criteria';

const calculatePerspectiveSatisfiedPercent = (satisfiedCount, inputCount) => {
  if (!inputCount || inputCount <= 0) return '0.00';
  return ((satisfiedCount / inputCount) * 100).toFixed(2);
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

const getSatisfiedMainTrendColumnLabel = (perspective) => `Trend for ${perspective} (%)`;

const isTop10TypeOfAccount = (value) => {
  const normalized = (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
  return normalized === 'top 10' || normalized === 'top10';
};

const isBlankEmptyOrNaTypeOfAccount = (value) => {
  const trimmed = (value ?? '').toString().trim();
  if (!trimmed) return true;
  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ');
  return normalized === 'n/a' || normalized === 'na' || normalized === '-' || normalized === 'null';
};

const matchesTop10AccountName = (customerName, top10Name) => {
  const customer = (customerName ?? '').toString().trim().toLowerCase();
  const target = (top10Name ?? '').toString().trim().toLowerCase();
  if (!customer || !target) return false;
  return customer === target || customer.includes(target) || target.includes(customer);
};

const getTop10AccountSortIndex = (customerName, top10AccountNames) => {
  const index = top10AccountNames.findIndex((name) => matchesTop10AccountName(customerName, name));
  return index === -1 ? 999 : index;
};

const sortTop10SatisfiedTrendRows = (rows, top10AccountNames = []) =>
  [...rows].sort((a, b) => {
    const aIndex = getTop10AccountSortIndex(a.customerName, top10AccountNames);
    const bIndex = getTop10AccountSortIndex(b.customerName, top10AccountNames);
    if (aIndex !== bIndex) return aIndex - bIndex;
    const buDiff = (a.businessUnit || '').localeCompare(b.businessUnit || '');
    if (buDiff !== 0) return buDiff;
    return (a.customerName || '').localeCompare(b.customerName || '');
  });

const normalizeBuTrendKey = (businessUnit) =>
  normalizeBusinessUnitDisplay(businessUnit)?.toString().trim().toLowerCase() || '';

const normalizeAccountNameKey = (value) =>
  (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

const findTop10TrendRowForAccount = (businessUnit, customerName, trendRows) => {
  if (!trendRows?.length) return null;
  const buKey = normalizeBuTrendKey(businessUnit);
  const custKey = normalizeAccountNameKey(customerName);
  const key = `${buKey}|||${custKey}`;
  if (!key || key === '|||') return null;
  const exact = trendRows.find(
    (tr) => `${normalizeBuTrendKey(tr.businessUnit)}|||${normalizeAccountNameKey(tr.customerName)}` === key
  );
  if (exact) return exact;
  return (
    trendRows.find((tr) => {
      const tk = `${normalizeBuTrendKey(tr.businessUnit)}|||${normalizeAccountNameKey(tr.customerName)}`;
      return tk.includes(key) || key.includes(tk);
    }) || null
  );
};

const findBuWiseSatisfiedTrendRowForBusinessUnit = (businessUnit, trendRows) => {
  if (!trendRows?.length) return null;
  const buKey = normalizeBuTrendKey(businessUnit);
  if (!buKey) return null;

  const exact = trendRows.find((tr) => normalizeBuTrendKey(tr.businessUnit) === buKey);
  if (exact) return exact;

  return (
    trendRows.find((tr) => {
      const trBu = normalizeBuTrendKey(tr.businessUnit);
      return trBu.includes(buKey) || buKey.includes(trBu);
    }) || null
  );
};

const findAccountWiseSatisfiedTrendRowForCustomer = (businessUnit, customerId, customerName, trendRows) => {
  if (!trendRows?.length) return null;
  const buKey = normalizeBuTrendKey(businessUnit);
  if (!buKey) return null;

  const idKey = normalizeCustomerIdKey(customerId)?.toString().trim().toLowerCase() || '';
  const nameKey = normalizeAccountNameKey(customerName);

  if (idKey) {
    const byId = trendRows.find((tr) => {
      const trBu = normalizeBuTrendKey(tr.businessUnit);
      if (trBu !== buKey && !trBu.includes(buKey) && !buKey.includes(trBu)) return false;
      const trId = normalizeCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
      const trName = normalizeAccountNameKey(tr.customerName);
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

const parseSatisfiedTrendPercent = (value) => {
  if (value == null || value === '' || value === '-') return null;
  const n = parseFloat(String(value).replace('%', '').trim());
  return Number.isNaN(n) ? null : n;
};

const formatSatisfiedPerspectiveTrendDiff = (currentPercent, trendPercent) => {
  if (currentPercent == null || trendPercent == null) {
    return {
      diffText: '-',
      arrow: '',
      diffColor: '#6b7280',
      arrowColor: '#6b7280',
      excelColor: 'FF6B7280',
    };
  }
  const diff = Math.round((currentPercent - trendPercent) * 100) / 100;
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;
  const sign = diff > 0 ? '+' : '';
  const diffText = `${sign}${diff.toFixed(2)}%`;
  const arrow = isIncrease ? '↑' : isDecrease ? '↓' : '';
  const arrowColor = isIncrease ? '#16a34a' : isDecrease ? '#dc2626' : '#6b7280';
  const excelColor = isIncrease ? 'FF16A34A' : isDecrease ? 'FFDC2626' : 'FF6B7280';
  return {
    diffText,
    arrow,
    diffColor: '#1f2937',
    arrowColor,
    excelColor,
    excelValue: arrow ? `${diffText} ${arrow}` : diffText,
  };
};

const applySatisfiedTrendDiffExcelCellStyle = (cell, diffDisplay) => {
  if (diffDisplay.arrow && diffDisplay.diffText && diffDisplay.diffText !== '-') {
    cell.value = {
      richText: [
        { font: { bold: true, color: { argb: 'FF1F2937' } }, text: diffDisplay.diffText },
        { font: { bold: true, color: { argb: diffDisplay.excelColor || 'FF6B7280' } }, text: ` ${diffDisplay.arrow}` },
      ],
    };
  } else {
    cell.value = diffDisplay.excelValue || diffDisplay.diffText;
    cell.font = {
      bold: true,
      color: { argb: diffDisplay.excelColor || 'FF6B7280' },
    };
  }
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

const applySatisfiedTrendPercentExcelCellStyle = (cell, percentageStr) => {
  if (percentageStr === '-' || percentageStr == null || percentageStr === '') {
    cell.value = '-';
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    cell.font = { color: { argb: 'FF6B7280' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    return;
  }
  const percentageValue = parseFloat(String(percentageStr).replace('%', ''));
  cell.value = `${Number.isNaN(percentageValue) ? '0.00' : percentageValue.toFixed(2)}%`;
  if (Number.isNaN(percentageValue)) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
    cell.font = { bold: true, color: { argb: 'FF000000' } };
  } else if (percentageValue > 90) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    cell.font = { bold: true, color: { argb: 'FF000000' } };
  } else if (percentageValue >= 70) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
    cell.font = { bold: true, color: { argb: 'FF000000' } };
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  }
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
};

const addSatisfiedAccountWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `Account_Satisfied_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const perspectives = fileData.perspectives?.length
    ? fileData.perspectives
    : ACSAT_SATISFIED_TARGET_PERSPECTIVES;
  const headers = [
    'Sr. No.',
    'Business Unit',
    'Account Name',
    ...perspectives.map((p) => `${p} (%)`),
  ];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  trendHeaderRow.height = 40;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.customerName || '',
      ...perspectives.map((p) => {
        const val = row.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    const percentStartCol = 4;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2 || colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, row.perspectivePercentages?.[p] || '0.00');
      }
    });
  });

  if (fileData.grandTotal) {
    const grandRow = [
      '',
      '',
      fileData.grandTotal.customerName || 'Grand Total',
      ...perspectives.map((p) => {
        const val = fileData.grandTotal.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedGrandRow = trendSheet.addRow(grandRow);
    addedGrandRow.height = 30;
    const percentStartCol = 4;
    addedGrandRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      if (colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, fileData.grandTotal.perspectivePercentages?.[p] || '0.00');
        cell.font = { bold: true, color: { argb: 'FF000000' } };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 28 },
    { width: 36 },
    ...perspectives.map(() => ({ width: 24 })),
  ];
};

const addSatisfiedBuWiseTrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `BU_Satisfied_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const perspectives = fileData.perspectives?.length
    ? fileData.perspectives
    : ACSAT_SATISFIED_TARGET_PERSPECTIVES;
  const headers = [
    'Sr. No.',
    'Business Unit',
    'Polled',
    'Responded',
    ...perspectives.map((p) => `${p} (%)`),
  ];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4338CA' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  trendHeaderRow.height = 40;

  const percentStartCol = 5;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.polled ?? 0,
      row.responded ?? 0,
      ...perspectives.map((p) => {
        const val = row.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 3 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, row.perspectivePercentages?.[p] || '0.00');
      }
    });
  });

  if (fileData.grandTotal) {
    const grandRow = [
      '',
      fileData.grandTotal.customerName || 'Org Level',
      fileData.grandTotal.polled ?? 0,
      fileData.grandTotal.responded ?? 0,
      ...perspectives.map((p) => {
        const val = fileData.grandTotal.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedGrandRow = trendSheet.addRow(grandRow);
    addedGrandRow.height = 30;
    addedGrandRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      if (colNumber === 2) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNumber === 3 || colNumber === 4) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, fileData.grandTotal.perspectivePercentages?.[p] || '0.00');
        cell.font = { bold: true, color: { argb: 'FF000000' } };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 28 },
    { width: 12 },
    { width: 12 },
    ...perspectives.map(() => ({ width: 24 })),
  ];
};

const addSatisfiedTop10TrendSheetToWorkbook = (workbook, fileData, sheetIndex) => {
  if (!fileData?.hasData || !fileData.rows?.length) return;
  const safeName = `Top10_Satisfied_Trend_${sheetIndex + 1}`.slice(0, 31);
  const trendSheet = workbook.addWorksheet(safeName);
  const perspectives = fileData.perspectives?.length
    ? fileData.perspectives
    : ACSAT_SATISFIED_TARGET_PERSPECTIVES;
  const headers = [
    'Sr. No.',
    'Business Unit',
    'Account Name',
    'Polled',
    'Responded',
    ...perspectives.map((p) => `${p} (%)`),
  ];
  trendSheet.addRow(headers);

  const trendHeaderRow = trendSheet.getRow(1);
  trendHeaderRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB45309' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  trendHeaderRow.height = 40;

  const percentStartCol = 6;

  fileData.rows.forEach((row, rowIndex) => {
    const dataRow = [
      rowIndex + 1,
      normalizeBusinessUnitDisplay(row.businessUnit) || '',
      row.customerName || '',
      row.polled ?? 0,
      row.responded ?? 0,
      ...perspectives.map((p) => {
        const val = row.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedRow = trendSheet.addRow(dataRow);
    addedRow.height = 30;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (colNumber === 1) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2 || colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      } else if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, row.perspectivePercentages?.[p] || '0.00');
      }
    });
  });

  const appendTop10TrendSummaryRowToSheet = (summaryRow, fillArgb) => {
    if (!summaryRow) return;
    const rowValues = [
      '',
      '',
      summaryRow.customerName || '',
      summaryRow.polled ?? 0,
      summaryRow.responded ?? 0,
      ...perspectives.map((p) => {
        const val = summaryRow.perspectivePercentages?.[p];
        if (val == null || val === '') return '0.00%';
        return `${val}%`;
      }),
    ];
    const addedRow = trendSheet.addRow(rowValues);
    addedRow.height = 30;
    addedRow.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillArgb } };
      cell.font = { bold: true, color: { argb: 'FF000000' } };
      if (colNumber === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNumber === 4 || colNumber === 5) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.numFmt = '0';
      } else if (colNumber >= percentStartCol) {
        const pIndex = colNumber - percentStartCol;
        const p = perspectives[pIndex];
        applySatisfiedTrendPercentExcelCellStyle(cell, summaryRow.perspectivePercentages?.[p] || '0.00');
        cell.font = { bold: true, color: { argb: 'FF000000' } };
      } else {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      }
    });
  };

  if (fileData.grandTotal) {
    appendTop10TrendSummaryRowToSheet(fileData.grandTotal, 'FFE2E8F0');
  }
  if (fileData.otherAccountsRow) {
    appendTop10TrendSummaryRowToSheet(fileData.otherAccountsRow, 'FFFED7AA');
  }

  trendSheet.columns = [
    { width: 10 },
    { width: 28 },
    { width: 36 },
    { width: 12 },
    { width: 12 },
    ...perspectives.map(() => ({ width: 24 })),
  ];
};

const sortAcsatTrendPerspectives = (perspectives) => {
  const list = [...perspectives];
  return list.sort((a, b) => {
    const aTrim = String(a).trim();
    const bTrim = String(b).trim();
    const aIndex = ACSAT_SATISFIED_TARGET_PERSPECTIVES.indexOf(aTrim);
    const bIndex = ACSAT_SATISFIED_TARGET_PERSPECTIVES.indexOf(bTrim);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return aTrim.localeCompare(bTrim);
  });
};

const recordCriteriaPerspectiveRating = (perspectives, perspective, ratingNum) => {
  if (!perspectives[perspective]) perspectives[perspective] = { satisfied: 0, input: 0 };
  perspectives[perspective].input += 1;
  if (ratingNum === 4 || ratingNum === 5) perspectives[perspective].satisfied += 1;
};

const recordAccountPerspectiveRating = (perspectives, perspective, ratingNum) => {
  if (!perspectives[perspective]) perspectives[perspective] = { satisfiedCount: 0, inputCount: 0 };
  perspectives[perspective].inputCount += 1;
  if (ratingNum === 4 || ratingNum === 5) perspectives[perspective].satisfiedCount += 1;
};

/** CSAT received Report rows where QUESTION_CATEGORY = Criteria, grouped by CUSTOMER_ID/CUST_ID. */
const buildAccountWiseCriteriaPerspectiveRatingsFromRows = (
  rows,
  { targetPerspectives = ACSAT_SATISFIED_TARGET_PERSPECTIVES } = {}
) => {
  const customerRatings = {};
  const orgPerspectiveStats = {};

  (rows || []).forEach((row) => {
    if (!isCriteriaCsatRow(row)) return;

    const customerKey = getCustomerKeyFromRow(row);
    if (!customerKey) return;

    const perspective = getPerspectiveFromRow(row);
    if (!perspective) return;
    if (targetPerspectives?.length && !targetPerspectives.includes(perspective)) return;

    const ratingNum = getRatingFromRow(row);
    if (ratingNum === null) return;

    if (!customerRatings[customerKey]) {
      customerRatings[customerKey] = { perspectives: {} };
    }
    recordAccountPerspectiveRating(customerRatings[customerKey].perspectives, perspective, ratingNum);
    recordAccountPerspectiveRating(orgPerspectiveStats, perspective, ratingNum);
  });

  return { customerRatings, orgPerspectiveStats };
};

const mapAccountWiseTrendGroupToRow = (group, perspectives) => {
  const perspectivePercentages = {};
  const perspectiveInputCounts = {};
  perspectives.forEach((p) => {
    const st = group.perspectives[p] || { satisfied: 0, input: 0 };
    perspectiveInputCounts[p] = st.input;
    perspectivePercentages[p] = calculatePerspectiveSatisfiedPercent(st.satisfied, st.input);
  });
  return {
    businessUnit: group.businessUnit,
    customerId: group.customerId,
    customerName: group.customerName,
    perspectivePercentages,
    perspectiveInputCounts,
  };
};

const mapBuWiseTrendGroupToRow = (group, perspectives) => {
  const perspectivePercentages = {};
  const perspectiveInputCounts = {};
  perspectives.forEach((p) => {
    const st = group.perspectives[p] || { satisfied: 0, input: 0 };
    perspectiveInputCounts[p] = st.input;
    perspectivePercentages[p] = calculatePerspectiveSatisfiedPercent(st.satisfied, st.input);
  });
  return {
    businessUnit: group.businessUnit,
    perspectivePercentages,
    perspectiveInputCounts,
  };
};

const ACSAT_BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];

const sortBuWiseTrendRows = (rows) =>
  [...rows].sort((a, b) => {
    const aBU = (a.businessUnit || '').toString().trim();
    const bBU = (b.businessUnit || '').toString().trim();
    const aIndex = ACSAT_BU_ORDER.findIndex((bu) => bu.toLowerCase() === aBU.toLowerCase());
    const bIndex = ACSAT_BU_ORDER.findIndex((bu) => bu.toLowerCase() === bBU.toLowerCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return aBU.localeCompare(bBU);
  });

const buildAccountWiseSatisfiedCustomersTrendFromFile = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];

  if (!receivedData.length) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      grandTotal: null,
      hasData: false,
      error: 'CSAT received Report sheet not found or empty in uploaded trend file.',
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  const orgPerspectiveStats = {};

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        customerId: meta.customerId || '',
        customerName: meta.customerName,
        perspectives: {},
      });
    }
    return groups.get(key);
  };

  const firstRow = receivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => (k || '').toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => (k || '').toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const questionCategoryCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
    'QUESTION_CATEGORY'
  );
  const perspectiveCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase() === 'rating',
      (k) => (k || '').toLowerCase().includes('rating'),
    ],
    'RATING'
  );

  receivedData.forEach((row) => {
    const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
    if (questionCategory !== 'Criteria') return;

    const businessUnit = normalizeBusinessUnitDisplay(
      getTrendRowValue(row, buCol, 'BUSINESS UNIT', 'BUSSINESS UNIT').toString().trim() || 'N/A'
    );
    const customerName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const customerId = normalizeCustomerIdKey(getTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID'));
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
    if (!perspective) return;

    const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
    if (Number.isNaN(ratingNum)) return;

    perspectiveSet.add(perspective);
    const agg = ensureGroup(groupKey, {
      businessUnit: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
      customerId,
      customerName: customerName || groupKey,
    });
    recordCriteriaPerspectiveRating(agg.perspectives, perspective, ratingNum);
    recordCriteriaPerspectiveRating(orgPerspectiveStats, perspective, ratingNum);
  });

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);

  const rows = Array.from(groups.values())
    .filter((g) => Object.keys(g.perspectives).length > 0)
    .map((g) => mapAccountWiseTrendGroupToRow(g, perspectives))
    .sort((a, b) => {
      const buDiff = (a.businessUnit || '').localeCompare(b.businessUnit || '');
      if (buDiff !== 0) return buDiff;
      return (a.customerName || '').localeCompare(b.customerName || '');
    });

  const grandTotal = rows.length > 0
    ? {
        businessUnit: '',
        customerName: 'Grand Total',
        ...mapAccountWiseTrendGroupToRow({ perspectives: orgPerspectiveStats }, perspectives),
      }
    : null;

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    grandTotal,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No account-wise Criteria rows found in CSAT received Report (QUESTION_CATEGORY = Criteria).'
      : null,
  };
};

const buildBuWiseSatisfiedCustomersTrendFromFile = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];

  if (!receivedData.length) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      grandTotal: null,
      hasData: false,
      error: 'CSAT received Report sheet not found or empty in uploaded trend file.',
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  const orgPerspectiveStats = {};

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        perspectives: {},
      });
    }
    return groups.get(key);
  };

  const firstRow = receivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => (k || '').toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const questionCategoryCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
    'QUESTION_CATEGORY'
  );
  const perspectiveCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase() === 'rating',
      (k) => (k || '').toLowerCase().includes('rating'),
    ],
    'RATING'
  );

  receivedData.forEach((row) => {
    const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
    if (questionCategory !== 'Criteria') return;

    const businessUnit = normalizeBusinessUnitDisplay(
      getTrendRowValue(row, buCol, 'BUSINESS UNIT', 'BUSSINESS UNIT').toString().trim() || 'N/A'
    );
    const groupKey = businessUnit || 'N/A';

    const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
    if (!perspective) return;

    const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
    if (Number.isNaN(ratingNum)) return;

    perspectiveSet.add(perspective);
    const agg = ensureGroup(groupKey, { businessUnit: groupKey });
    recordCriteriaPerspectiveRating(agg.perspectives, perspective, ratingNum);
    recordCriteriaPerspectiveRating(orgPerspectiveStats, perspective, ratingNum);
  });

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);
  const sentReceivedLookup = buildBuWiseSentReceivedLookupFromFile(file);

  const rows = sortBuWiseTrendRows(
    Array.from(groups.values())
      .filter((g) => Object.keys(g.perspectives).length > 0)
      .map((g) => {
        const baseRow = mapBuWiseTrendGroupToRow(g, perspectives);
        return attachBuWiseSentReceivedCounts(baseRow, sentReceivedLookup);
      })
  );

  const grandTotal = rows.length > 0
    ? {
        businessUnit: '',
        customerName: 'Org Level',
        polled: rows.reduce((sum, r) => sum + (r.polled || 0), 0),
        responded: rows.reduce((sum, r) => sum + (r.responded || 0), 0),
        ...mapBuWiseTrendGroupToRow({ perspectives: orgPerspectiveStats }, perspectives),
      }
    : null;

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    grandTotal,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No BU-wise Criteria rows found in CSAT received Report (QUESTION_CATEGORY = Criteria).'
      : null,
  };
};

const hasTrendSheetDateValue = (row, columnKey, ...fallbackNames) => {
  const val = getTrendRowValue(row, columnKey, ...fallbackNames);
  if (val == null || val === '') return false;
  const parsed = parseExcelDateToMMDDYYYY(val);
  return !!parsed && parsed !== 'N/A';
};

const buildBuWiseSentReceivedLookupFromFile = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sentReceivedSheetName = findAcsatSentReceivedSheetName(sheetNames);
  const sentReceivedData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];
  const lookup = new Map();

  if (!sentReceivedData.length) return lookup;

  const firstRow = sentReceivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => (k || '').toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const sentDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
      },
    ],
    'CSAT SENT DATE'
  );
  const receivedDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
      },
    ],
    'CSAT RECEIVED DATE'
  );

  sentReceivedData.forEach((row) => {
    const businessUnit = normalizeBusinessUnitDisplay(
      getTrendRowValue(row, buCol, 'BUSINESS UNIT', 'BUSSINESS UNIT').toString().trim() || 'N/A'
    );
    const groupKey = normalizeBuTrendKey(businessUnit) || businessUnit;
    if (!groupKey) return;

    if (!lookup.has(groupKey)) {
      lookup.set(groupKey, {
        businessUnit,
        polled: 0,
        responded: 0,
      });
    }

    const agg = lookup.get(groupKey);
    if (hasTrendSheetDateValue(row, sentDateCol, 'CSAT SENT DATE')) {
      agg.polled += 1;
    }
    if (hasTrendSheetDateValue(row, receivedDateCol, 'CSAT RECEIVED DATE')) {
      agg.responded += 1;
    }
  });

  return lookup;
};

const attachBuWiseSentReceivedCounts = (row, sentReceivedLookup) => {
  const buKey = normalizeBuTrendKey(row.businessUnit);
  const sr = sentReceivedLookup.get(buKey);
  return {
    ...row,
    polled: sr?.polled ?? 0,
    responded: sr?.responded ?? 0,
  };
};

const buildTop10SentReceivedLookupFromFile = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sentReceivedSheetName = findAcsatSentReceivedSheetName(sheetNames);
  const sentReceivedData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];
  const lookup = new Map();

  if (!sentReceivedData.length) return lookup;

  const firstRow = sentReceivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => (k || '').toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => (k || '').toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const typeOfAccountCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount',
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('type') && kn.includes('account');
      },
    ],
    'TYPE OF ACCOUNT'
  );
  const sentDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
      },
    ],
    'CSAT SENT DATE'
  );
  const receivedDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
      },
    ],
    'CSAT RECEIVED DATE'
  );

  sentReceivedData.forEach((row) => {
    const typeOfAccount = getTrendRowValue(row, typeOfAccountCol, 'TYPE OF ACCOUNT').toString().trim();
    if (!isTop10TypeOfAccount(typeOfAccount)) return;

    const customerId = normalizeCustomerIdKey(getTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID'));
    const customerName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    if (!lookup.has(groupKey)) {
      lookup.set(groupKey, {
        businessUnit: normalizeBusinessUnitDisplay(
          getTrendRowValue(row, buCol, 'BUSINESS UNIT', 'BUSSINESS UNIT').toString().trim() || 'N/A'
        ),
        customerId,
        customerName: customerName || groupKey,
        polled: 0,
        responded: 0,
      });
    }

    const agg = lookup.get(groupKey);
    if (hasTrendSheetDateValue(row, sentDateCol, 'CSAT SENT DATE')) {
      agg.polled += 1;
    }
    if (hasTrendSheetDateValue(row, receivedDateCol, 'CSAT RECEIVED DATE')) {
      agg.responded += 1;
    }
  });

  return lookup;
};

const aggregateOtherAccountsSentReceivedFromFile = (file) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sentReceivedSheetName = findAcsatSentReceivedSheetName(sheetNames);
  const sentReceivedData = sentReceivedSheetName ? (file.sheets?.[sentReceivedSheetName] || []) : [];
  let polled = 0;
  let responded = 0;

  if (!sentReceivedData.length) return { polled, responded };

  const firstRow = sentReceivedData[0] || {};
  const typeOfAccountCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount',
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('type') && kn.includes('account');
      },
    ],
    'TYPE OF ACCOUNT'
  );
  const sentDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
      },
    ],
    'CSAT SENT DATE'
  );
  const receivedDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
      },
    ],
    'CSAT RECEIVED DATE'
  );

  sentReceivedData.forEach((row) => {
    const typeOfAccount = getTrendRowValue(row, typeOfAccountCol, 'TYPE OF ACCOUNT').toString().trim();
    if (!isBlankEmptyOrNaTypeOfAccount(typeOfAccount)) return;
    if (hasTrendSheetDateValue(row, sentDateCol, 'CSAT SENT DATE')) polled += 1;
    if (hasTrendSheetDateValue(row, receivedDateCol, 'CSAT RECEIVED DATE')) responded += 1;
  });

  return { polled, responded };
};

const attachTop10SentReceivedCounts = (row, groupKey, sentReceivedLookup) => {
  const sr = sentReceivedLookup.get(groupKey);
  return {
    ...row,
    polled: sr?.polled ?? 0,
    responded: sr?.responded ?? 0,
  };
};

const buildTop10SatisfiedCustomersTrendFromFile = (file, { top10AccountNames = [] } = {}) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const receivedSheetName = findAcsatReceivedReportSheetName(sheetNames);
  const receivedData = receivedSheetName ? (file.sheets?.[receivedSheetName] || []) : [];

  if (!receivedData.length) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      perspectives: [],
      grandTotal: null,
      hasData: false,
      error: 'CSAT received Report sheet not found or empty in uploaded trend file.',
    };
  }

  const groups = new Map();
  const perspectiveSet = new Set();
  const top10PerspectiveStats = {};
  const otherPerspectiveStats = {};

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        businessUnit: meta.businessUnit,
        customerId: meta.customerId || '',
        customerName: meta.customerName,
        perspectives: {},
      });
    }
    return groups.get(key);
  };

  const firstRow = receivedData[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => (k || '').toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => (k || '').toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const typeOfAccountCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount',
      (k) => {
        const kn = (k || '').toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('type') && kn.includes('account');
      },
    ],
    'TYPE OF ACCOUNT'
  );
  const questionCategoryCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().replace(/[\s_]/g, '') === 'questioncategory'],
    'QUESTION_CATEGORY'
  );
  const perspectiveCol = findSheetColumn(
    firstRow,
    [(k) => (k || '').toLowerCase().includes('perspective')],
    'PERSPECTIVE'
  );
  const ratingCol = findSheetColumn(
    firstRow,
    [
      (k) => (k || '').toLowerCase() === 'rating',
      (k) => (k || '').toLowerCase().includes('rating'),
    ],
    'RATING'
  );

  receivedData.forEach((row) => {
    const questionCategory = String(getTrendRowValue(row, questionCategoryCol, 'QUESTION_CATEGORY')).trim();
    if (questionCategory !== 'Criteria') return;

    const typeOfAccount = getTrendRowValue(row, typeOfAccountCol, 'TYPE OF ACCOUNT').toString().trim();
    const perspective = String(getTrendRowValue(row, perspectiveCol, 'PERSPECTIVE')).trim();
    if (!perspective) return;

    const ratingNum = parseFloat(getTrendRowValue(row, ratingCol, 'RATING'));
    if (Number.isNaN(ratingNum)) return;

    perspectiveSet.add(perspective);

    if (isBlankEmptyOrNaTypeOfAccount(typeOfAccount)) {
      recordCriteriaPerspectiveRating(otherPerspectiveStats, perspective, ratingNum);
      return;
    }

    if (!isTop10TypeOfAccount(typeOfAccount)) return;

    const businessUnit = normalizeBusinessUnitDisplay(
      getTrendRowValue(row, buCol, 'BUSINESS UNIT', 'BUSSINESS UNIT').toString().trim() || 'N/A'
    );
    const customerName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const customerId = normalizeCustomerIdKey(getTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID'));
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    const agg = ensureGroup(groupKey, {
      businessUnit: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
      customerId,
      customerName: customerName || groupKey,
    });
    recordCriteriaPerspectiveRating(agg.perspectives, perspective, ratingNum);
    recordCriteriaPerspectiveRating(top10PerspectiveStats, perspective, ratingNum);
  });

  const perspectives = sortAcsatTrendPerspectives(perspectiveSet);
  const sentReceivedLookup = buildTop10SentReceivedLookupFromFile(file);

  const rows = sortTop10SatisfiedTrendRows(
    Array.from(groups.values())
      .filter((g) => Object.keys(g.perspectives).length > 0)
      .map((g) => {
        const groupKey = g.customerId || g.customerName;
        const baseRow = mapAccountWiseTrendGroupToRow(g, perspectives);
        return attachTop10SentReceivedCounts(baseRow, groupKey, sentReceivedLookup);
      }),
    top10AccountNames
  );

  const grandTotal = rows.length > 0
    ? {
        businessUnit: '',
        customerName: 'Top 10 Accounts',
        polled: rows.reduce((sum, r) => sum + (r.polled || 0), 0),
        responded: rows.reduce((sum, r) => sum + (r.responded || 0), 0),
        ...mapAccountWiseTrendGroupToRow({ perspectives: top10PerspectiveStats }, perspectives),
      }
    : null;

  const otherSentReceived = aggregateOtherAccountsSentReceivedFromFile(file);
  const otherAccountsRow = grandTotal
    ? {
        businessUnit: '',
        customerName: 'Other Accounts',
        polled: otherSentReceived.polled,
        responded: otherSentReceived.responded,
        ...mapAccountWiseTrendGroupToRow({ perspectives: otherPerspectiveStats }, perspectives),
      }
    : null;

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    perspectives,
    grandTotal,
    otherAccountsRow,
    hasData: rows.length > 0,
    error: rows.length === 0
      ? 'No Top 10 Criteria rows found in CSAT received Report (QUESTION_CATEGORY = Criteria, TYPE OF ACCOUNT = Top 10).'
      : null,
  };
};

const normalizeBusinessUnitDisplay = (bu) => {
  if (bu == null || bu === '') return bu;
  const s = String(bu).trim();
  const buNorm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (buNorm === 'healthcare') return 'Healthcare';
  if (s.toLowerCase() === 'sead') return 'SEAD';
  return s;
};

const getBusinessUnitFromRow = (row) => {
  const raw = row['BUSSINESS UNIT'] || row['BUSINESS UNIT'] || row['Business Unit'] || row.BUSINESS_UNIT || '';
  return normalizeBusinessUnitDisplay(raw);
};

const ACSATCountDashboard = ({ excelData, acsatCycleStartDate, acsatCycleStartDateFormatted, trendAnalysisFiles = [], onBack }) => {
  const [uploadedData, setUploadedData] = useState(null);
  const [secondSheetData, setSecondSheetData] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [groupByBU, setGroupByBU] = useState(false); // Default to account-wise view
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showTop10, setShowTop10] = useState(false);
  const [showAcsatTrendAnalysis, setShowAcsatTrendAnalysis] = useState(false);
  const acsatTrendSectionRef = useRef(null);

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

  const isDateOnOrAfterCsatStart = (dateValue) => {
    if (!acsatCycleStartDateFormatted || !dateValue) return true;
    return isDateOnOrAfterAcsatCycleStart(dateValue, acsatCycleStartDateFormatted);
  };

  useEffect(() => {
    if (!excelData) {
      return;
    }

    try {
      setLoadError(null);

      const targetSheetName = findAcsatReceivedReportSheetName(excelData.SheetNames);

      if (!targetSheetName) {
        console.log('CSAT received Report sheet not found. Available sheets:', excelData.SheetNames);
        setUploadedData([]);
        setSecondSheetData([]);
        setLoadError(`CSAT received Report sheet not found. Available sheets: ${excelData.SheetNames.join(', ')}`);
        return;
      }

      const sheet = excelData.Sheets[targetSheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (!jsonData || jsonData.length === 0) {
        setUploadedData([]);
        setSecondSheetData([]);
        setLoadError('No data found in CSAT received Report sheet.');
        return;
      }

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
        setUploadedData([]);
        setSecondSheetData([]);
        setLoadError('Header row not found in CSAT received Report sheet.');
        return;
      }

      // Convert to objects
      const data = [];
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length > 0) {
          data.push(buildRowFromHeaders(headers, row));
        }
      }

      const filteredData = filterRowsByAcsatCycle(data, acsatCycle);
      
      setUploadedData(filteredData);
      
      // Debug: Log first sheet data loading
      console.log('🔍 ACSATCountDashboard - First sheet data loaded:', filteredData.length, 'rows');
      console.log('ACSAT Cycle for filtering:', acsatCycle);
      console.log('Sample filtered data:', filteredData.slice(0, 3));
      if (filteredData.length > 0) {
        console.log('Available columns in first sheet:', Object.keys(filteredData[0]));
        console.log('YEAR - QUARTER values in filtered data:', [...new Set(filteredData.map((row) => getYearQuarterFromRow(row)))]);
        
        // Debug: Check for perspective data with flexible column names
        const perspectives = [...new Set(filteredData.map(row => 
          row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name']
        ).filter(p => p))];
        console.log('Perspectives found in first sheet:', perspectives);
        
        // Debug: Check for rating data with flexible column names
        const ratings = [...new Set(filteredData.map(row => 
          row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']
        ).filter(r => r))];
        console.log('Sample ratings found in first sheet:', ratings.slice(0, 10));
        
        // Debug: Check for "Meeting Delivery Commitments" specifically
        const meetingDeliveryRows = filteredData.filter(row => {
          const perspective = row['PERSPECTIVE'] || row['Perspective'] || row['perspective'] || row['PERSPECTIVE_NAME'] || row['Perspective Name'];
          return perspective === 'Meeting Delivery Commitments';
        });
        console.log('Rows with "Meeting Delivery Commitments" perspective:', meetingDeliveryRows.length);
        if (meetingDeliveryRows.length > 0) {
          console.log('Sample "Meeting Delivery Commitments" rows:', meetingDeliveryRows.slice(0, 3));
          const meetingDeliveryRatings = meetingDeliveryRows.map(row => 
            row['RATING'] || row['Rating'] || row['rating'] || row['RATING_VALUE'] || row['Rating Value']
          ).filter(r => r);
          console.log('Ratings for "Meeting Delivery Commitments":', meetingDeliveryRatings);
        }
      }

      // Load second sheet data
      const secondSheetName = findAcsatSentReceivedSheetName(excelData.SheetNames);

      if (secondSheetName) {
        const secondSheet = excelData.Sheets[secondSheetName];
        const secondJsonData = XLSX.utils.sheet_to_json(secondSheet, { header: 1 });

        if (secondJsonData && secondJsonData.length > 0) {
          let secondHeaderRowIndex = -1;
          let secondHeaders = [];

          for (let i = 0; i < secondJsonData.length; i++) {
            const row = secondJsonData[i];
            if (row && row.length > 0) {
              const rowStr = row.join(' ').toLowerCase();
              if (rowStr.includes('customer') || rowStr.includes('business unit') || rowStr.includes('sent')) {
                secondHeaderRowIndex = i;
                secondHeaders = row.map((h) => (h != null ? String(h).trim() : h));
                break;
              }
            }
          }

          if (secondHeaderRowIndex !== -1) {
            const secondData = [];
            for (let i = secondHeaderRowIndex + 1; i < secondJsonData.length; i++) {
              const row = secondJsonData[i];
              if (row && row.length > 0) {
                secondData.push(normalizeAcsatRowCanonicalFields(buildRowFromHeaders(secondHeaders, row)));
              }
            }
            const filteredSecondData = filterRowsByAcsatCycle(secondData, acsatCycle);
            
            setSecondSheetData(filteredSecondData);
            console.log('ACSATCountDashboard - Second sheet data loaded:', filteredSecondData.length, 'rows');
            console.log('ACSAT Cycle for filtering:', acsatCycle);
            console.log('Sample filtered data:', filteredSecondData.slice(0, 3));
            if (filteredSecondData.length > 0) {
              console.log('Available columns in second sheet:', Object.keys(filteredSecondData[0]));
              console.log('YEAR - QUARTER values in filtered data:', [...new Set(filteredSecondData.map((row) => getYearQuarterFromRow(row)))]);
            }
          }
        }
      } else {
        setSecondSheetData([]);
      }

    } catch (error) {
      console.error('Error processing data:', error);
      setUploadedData([]);
      setSecondSheetData([]);
      setLoadError('Error processing uploaded Excel data.');
    }
  }, [excelData, acsatCycle]);

  // Process data for display
  const processedData = useMemo(() => {
    if (!uploadedData) return { data: [] };

    const targetPerspectives = ACSAT_SATISFIED_TARGET_PERSPECTIVES;

    // Group data
    const groupedData = {};
    let customerRatings = {};
    let buRatings = {};

    if (groupByBU) {
      uploadedData.forEach((row) => {
        const businessUnit = getBusinessUnitFromRow(row);
        if (!businessUnit) return;

        if (!groupedData[businessUnit]) {
          groupedData[businessUnit] = {
            businessUnit,
            customerId: null,
            customerName: null,
            data: [],
            perspectiveCounts: {},
          };
        }

        groupedData[businessUnit].data.push(row);

        const perspective = getPerspectiveFromRow(row);
        if (!targetPerspectives.includes(perspective)) return;

        const ratingNum = getRatingFromRow(row);
        if (ratingNum === null) return;

        if (!buRatings[businessUnit]) {
          buRatings[businessUnit] = { perspectives: {} };
        }
        if (!buRatings[businessUnit].perspectives[perspective]) {
          buRatings[businessUnit].perspectives[perspective] = { satisfiedCount: 0, inputCount: 0 };
        }

        const stats = buRatings[businessUnit].perspectives[perspective];
        stats.inputCount += 1;
        if (ratingNum === 4 || ratingNum === 5) {
          stats.satisfiedCount += 1;
        }
      });
    } else {
      // For account-wise data, group by CUSTOMER_ID or CUST_ID from the second sheet (CSAT sent and received Report)
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
      
      if (secondSheetData && secondSheetData.length > 0) {
        // First, group all customers from second sheet by CUSTOMER_ID or CUST_ID
        secondSheetData.forEach(row => {
          const customerKey = getCustomerKeyFromRow(row);
          if (!customerKey) return;
          
          // For Top 10 view, filter by TYPE OF ACCOUNT = "Top 10" from second sheet
          if (showTop10) {
            let typeOfAccount = '';
            if (typeOfAccountColumn && row[typeOfAccountColumn] !== undefined && row[typeOfAccountColumn] !== null) {
              typeOfAccount = row[typeOfAccountColumn].toString().trim();
            }
            
            if (!isTop10TypeOfAccount(typeOfAccount)) {
              return;
            }
          }
          
          const customerId = customerKey;
          
          // Get BUSINESS UNIT and CUSTOMER NAME (or CUST_NM) from second sheet
          const businessUnit = getBusinessUnitFromRow(row);
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
          const csatSentDate = getCsatSentDateFromRow(row);
          const matchesYearQuarter = yearQuarterMatchesCycle(getYearQuarterFromRow(row), acsatCycle);

          if (csatSentDate && matchesYearQuarter && isDateOnOrAfterCsatStart(csatSentDate)) {
            customerGroupsFromSecondSheet[customerId].sentDates.push(csatSentDate);
          }

          const csatReceivedDate = getCsatReceivedDateFromRow(row);
          if (csatReceivedDate && matchesYearQuarter && isDateOnOrAfterCsatStart(csatReceivedDate)) {
            customerGroupsFromSecondSheet[customerId].receivedDates.push(csatReceivedDate);
          }
        });
      }

      if (Object.keys(customerGroupsFromSecondSheet).length === 0 && uploadedData.length > 0) {
        console.log('ACSATCountDashboard: second sheet empty or unmatched; building account list from CSAT received Report');
        uploadedData.forEach((row) => {
          if (showTop10) {
            if (!isTop10TypeOfAccount(getTypeOfAccountFromRow(row))) return;
          }
          const customerKey = getCustomerKeyFromRow(row);
          if (!customerKey) return;
          if (!customerGroupsFromSecondSheet[customerKey]) {
            customerGroupsFromSecondSheet[customerKey] = {
              customerId: customerKey,
              businessUnit: getBusinessUnitFromRow(row),
              customerName: (row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'] || '').toString().trim(),
              sentDates: [],
              receivedDates: []
            };
          }
        });
      }
      
      if (showTop10) {
        // Top 10: unchanged — all target-perspective rows (no QUESTION_CATEGORY filter)
        customerRatings = {};
        uploadedData.forEach((row) => {
          if (!isTop10TypeOfAccount(getTypeOfAccountFromRow(row))) return;

          const customerKey = getCustomerKeyFromRow(row);
          if (!customerKey) return;

          const perspective = getPerspectiveFromRow(row);
          if (!targetPerspectives.includes(perspective)) return;

          const ratingNum = getRatingFromRow(row);
          if (ratingNum === null) return;

          if (!customerRatings[customerKey]) {
            customerRatings[customerKey] = { perspectives: {} };
          }
          recordAccountPerspectiveRating(customerRatings[customerKey].perspectives, perspective, ratingNum);
        });
      } else {
        // Account-wise: CSAT received Report, QUESTION_CATEGORY = Criteria, group by CUSTOMER_ID/CUST_ID
        ({ customerRatings } = buildAccountWiseCriteriaPerspectiveRatingsFromRows(uploadedData, {
          targetPerspectives,
        }));
      }

      // Create groupedData from second sheet customers
      Object.values(customerGroupsFromSecondSheet).forEach(customer => {
        const customerId = customer.customerId;
        const key = customerId;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            businessUnit: customer.businessUnit || '',
            customerId: customerId,
            customerName: customer.customerName || '',
            data: [],
            perspectiveCounts: {},
            cssSentCount: customer.sentDates.length,
            cssReceivedCount: customer.receivedDates.length
          };
        }
      });
    }

      // Process each group
      Object.values(groupedData).forEach(group => {
        // Initialize perspective counts and percentages
        group.perspectiveCounts = {};
        group.perspectivePercentages = {};
        group.perspectiveInputCounts = {};

        // Count ratings 4 and 5 for each perspective
        targetPerspectives.forEach(perspective => {
          let highRatingCount = 0;
          let totalRatingCount = 0;

          if (groupByBU) {
            const buRatingData = buRatings[group.businessUnit] || { perspectives: {} };
            const perspectiveStats = buRatingData.perspectives[perspective] || { satisfiedCount: 0, inputCount: 0 };
            highRatingCount = perspectiveStats.satisfiedCount;
            totalRatingCount = perspectiveStats.inputCount;
          } else {
            const customerId = group.customerId;
            const customerRatingData = customerRatings[customerId] || { perspectives: {} };
            const perspectiveStats = customerRatingData.perspectives[perspective] || { satisfiedCount: 0, inputCount: 0 };
            highRatingCount = perspectiveStats.satisfiedCount;
            totalRatingCount = perspectiveStats.inputCount;
          }

          group.perspectiveCounts[perspective] = highRatingCount;
          group.perspectiveInputCounts[perspective] = totalRatingCount;
          group.perspectivePercentages[perspective] = calculatePerspectiveSatisfiedPercent(
            highRatingCount,
            totalRatingCount
          );
        });

      // Calculate CSS counts from second sheet
      // For account-wise data, CSS counts are already calculated from the second sheet grouping above
      // Only recalculate for BU-wise data
      if (groupByBU && secondSheetData) {
        const businessUnit = group.businessUnit;

        let cssSentCount = 0;
        let cssReceivedCount = 0;

        // Debug: Log filtering details
        console.log(`🔍 ACSATCountDashboard - Calculating CSAT survey counts for BU: ${businessUnit}`);
        console.log(`  ACSAT Cycle: ${acsatCycle}`);
        console.log(`  ACSAT Cycle Start Date: ${acsatCycleStartDateFormatted}`);
        console.log(`  Second sheet data length: ${secondSheetData.length}`);
        
        // Debug: Show sample second sheet data
        if (secondSheetData.length > 0) {
          console.log(`  Sample second sheet data:`, secondSheetData.slice(0, 2));
          console.log(`  Available columns in second sheet:`, Object.keys(secondSheetData[0]));
        }

        secondSheetData.forEach((row, rowIndex) => {
          const rowBusinessUnit = getBusinessUnitFromRow(row);
          // Priority: Use "CSAT SENT DATE" and "CSAT RECEIVED DATE" columns, fallback to "CSS" variants
          const sentDate = getCsatSentDateFromRow(row);
          const receivedDate = getCsatReceivedDateFromRow(row);
          const yearQuarter = getYearQuarterFromRow(row);

          // Debug: Log first few rows
          if (rowIndex < 3) {
            console.log(`  Row ${rowIndex + 1}:`);
            console.log(`    Business Unit: ${rowBusinessUnit} (matches: ${rowBusinessUnit === businessUnit})`);
            console.log(`    CSAT Sent Date: ${sentDate}`);
            console.log(`    CSAT Received Date: ${receivedDate}`);
            console.log(`    Year Quarter: ${yearQuarter}`);
          }

          if (rowBusinessUnit === businessUnit) {
            const hasValidSentDate = sentDate && isDateOnOrAfterCsatStart(sentDate);
            const hasValidReceivedDate = receivedDate && isDateOnOrAfterCsatStart(receivedDate);
            const matchesYearQuarter = yearQuarterMatchesCycle(yearQuarter, acsatCycle);
            
            if (rowIndex < 3) {
              console.log(`    BU Match - CSAT Sent Date Valid: ${hasValidSentDate}, CSAT Received Date Valid: ${hasValidReceivedDate}, Year Quarter Match: ${matchesYearQuarter}`);
            }
            
            if (hasValidSentDate && matchesYearQuarter) {
              cssSentCount++;
            }
            if (hasValidReceivedDate && matchesYearQuarter) {
              cssReceivedCount++;
            }
          }
        });

        console.log(`  Final counts: CSAT Sent=${cssSentCount}, CSAT Received=${cssReceivedCount}`);

        group.cssSentCount = cssSentCount;
        group.cssReceivedCount = cssReceivedCount;
      } else if (!groupByBU) {
        // For account-wise data, CSS counts are already set from the second sheet grouping
        // Just ensure they exist
        if (group.cssSentCount === undefined) {
          group.cssSentCount = 0;
        }
        if (group.cssReceivedCount === undefined) {
          group.cssReceivedCount = 0;
        }
      }
    });

    // Convert to array and filter by search term
    let result = Object.values(groupedData);

    if (searchTerm && !groupByBU) {
      result = result.filter(group => 
        group.customerName && 
        group.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Calculate summary data
    const summaryData = {
      orgLevel: {
        perspectivesAbove75: [],
        perspectivesBelow75: [],
        areasOfConcern: []
      },
      buLevel: {}
    };

    // Calculate org level summary
    const orgLevelPerspectives = {};
    targetPerspectives.forEach(perspective => {
      const percentages = result.map(group => {
        // Get percentage from group.perspectivePercentages
        const percentageStr = group.perspectivePercentages?.[perspective] || '0.00';
        return parseFloat(percentageStr);
      }).filter(p => !isNaN(p));
      
      console.log(`🔍 Summary calculation for ${perspective}:`, {
        percentages,
        avgPercentage: percentages.length > 0 ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length : 0
      });
      
      if (percentages.length > 0) {
        const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
        orgLevelPerspectives[perspective] = avgPercentage;
      }
    });

    // Categorize perspectives by average percentage
    Object.entries(orgLevelPerspectives).forEach(([perspective, avgPercentage]) => {
      const roundedPercentage = Math.round(avgPercentage * 100) / 100;
      console.log(`📊 Categorizing ${perspective}: ${roundedPercentage}% (${avgPercentage >= 75 ? 'ABOVE' : 'BELOW'} 75%)`);
      
      if (avgPercentage >= 75) {
        summaryData.orgLevel.perspectivesAbove75.push({
          name: perspective,
          percentage: roundedPercentage
        });
      } else {
        summaryData.orgLevel.perspectivesBelow75.push({
          name: perspective,
          percentage: roundedPercentage
        });
        // Add to areas of concern if below 75%
        summaryData.orgLevel.areasOfConcern.push({
          name: perspective,
          percentage: roundedPercentage
        });
      }
    });
    
    // Debug: Log final summary results
    console.log('📊 Final summary results:');
    console.log('  Perspectives above 75%:', summaryData.orgLevel.perspectivesAbove75);
    console.log('  Perspectives below 75%:', summaryData.orgLevel.perspectivesBelow75);
    console.log('  Areas of concern:', summaryData.orgLevel.areasOfConcern);

    // Calculate BU level summary for all BUs present (fix missing Healthcare and others)
    const buNames = [...new Set(result.map(r => (r.businessUnit || '').toString().trim()))];
    buNames.forEach(buName => {
      const buData = result.filter(row => (row.businessUnit || '').toString().trim() === buName);
      if (buData.length > 0) {
        const buPerspectives = {};
        targetPerspectives.forEach(perspective => {
          const percentages = buData.map(group => {
            // Get percentage from group.perspectivePercentages
            const percentageStr = group.perspectivePercentages?.[perspective] || '0.00';
            return parseFloat(percentageStr);
          }).filter(p => !isNaN(p));
          
          if (percentages.length > 0) {
            const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
            buPerspectives[perspective] = avgPercentage;
          }
        });

        // Find highest and lowest performing perspectives
        const perspectiveEntries = Object.entries(buPerspectives);
        if (perspectiveEntries.length > 0) {
          const sortedByPercentage = perspectiveEntries.sort((a, b) => b[1] - a[1]);
          const highest = sortedByPercentage[0];
          const lowest = sortedByPercentage[sortedByPercentage.length - 1];

          // Categorize perspectives
          const significantlyLess = perspectiveEntries
            .filter(([_, percentage]) => percentage < 70)
            .map(([perspective, percentage]) => ({ name: perspective, percentage: Math.round(percentage * 100) / 100 }));
          
          const higherThanRest = perspectiveEntries
            .filter(([_, percentage]) => percentage >= 70)
            .map(([perspective, percentage]) => ({ name: perspective, percentage: Math.round(percentage * 100) / 100 }));

          summaryData.buLevel[buName] = {
            highestPerforming: {
              name: highest[0],
              percentage: Math.round(highest[1] * 100) / 100
            },
            below4: significantlyLess,
            above4: higherThanRest
          };
        }
      }
    });

    console.log('Summary data calculated:', summaryData);

    // Calculate Top 10 summary if showTop10 is true
    let top10Summary = null;
    let finalResult = result;
    if (showTop10) {
      console.log('Sorting Top 10 accounts by predefined order:', top10AccountNames);
      
      // For Top 10 view, filtering is already done during grouping from second sheet
      // Just sort by predefined order
      finalResult.sort((a, b) => {
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
      
      console.log('Top 10 sorted data:', finalResult);
      
      // Calculate Top 10 summary
      const top10Perspectives = {};
      targetPerspectives.forEach(perspective => {
        const percentages = finalResult.map(group => {
          const percentageStr = group.perspectivePercentages?.[perspective] || '0.00';
          // Skip "-" (hyphen) values when calculating summary
          if (percentageStr === '-') return null;
          return parseFloat(percentageStr);
        }).filter(p => p !== null && !isNaN(p));
        
        if (percentages.length > 0) {
          const avgPercentage = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
          top10Perspectives[perspective] = avgPercentage;
        }
      });

      // Categorize perspectives for Top 10
      const perspectiveEntries = Object.entries(top10Perspectives);
      const perspectivesAbove75 = perspectiveEntries
        .filter(([_, percentage]) => percentage >= 70)
        .map(([perspective, percentage]) => ({ name: perspective, percentage: Math.round(percentage * 100) / 100 }));
      
      const perspectivesBelow75 = perspectiveEntries
        .filter(([_, percentage]) => percentage < 70)
        .map(([perspective, percentage]) => ({ name: perspective, percentage: Math.round(percentage * 100) / 100 }));

      top10Summary = {
        perspectivesAbove75,
        perspectivesBelow75
      };
      
      console.log('Top 10 summary calculated:', top10Summary);
    }

    // Apply fixed BU order when BU-wise
    const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
    let ordered = finalResult;
    
    if (groupByBU) {
      // BU-wise: sort by BU_ORDER (case-insensitive matching)
      ordered = [...finalResult].sort((a, b) => {
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
    } else if (!showTop10) {
      // Account-wise (not Top 10): sort by accountOrder
      ordered = [...finalResult].sort((a, b) => {
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
    // Top 10: already sorted above, so no additional sorting needed

    return { data: ordered, summary: summaryData, top10Summary };
  }, [uploadedData, secondSheetData, groupByBU, searchTerm, acsatCycleStartDateFormatted, acsatCycle, showTop10]);

  // Sort data based on sort configuration
  const sortedData = useMemo(() => {
    if (!processedData?.data) return [];
    
    if (!sortConfig.key) return processedData.data;
    
    return [...processedData.data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      // Handle different data types for sorting
      if (sortConfig.key === 'businessUnit' || sortConfig.key === 'customerName' || sortConfig.key === 'accountName') {
        // String sorting (case-insensitive)
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortConfig.key === 'sentCount' || sortConfig.key === 'receivedCount' || 
                 sortConfig.key.startsWith('sentCount') || sortConfig.key.startsWith('receivedCount')) {
        // Numeric sorting for survey counts
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortConfig.key.includes('%') || sortConfig.key.includes('Percent') || sortConfig.key.includes('percent')) {
        // Numeric sorting for percentage columns
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

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    if (!sortedData || sortedData.length === 0 || !uploadedData) return null;
    
    const totals = {
      cssSentCount: 0,
      cssReceivedCount: 0,
      perspectives: {},
      perspectiveInputTotals: {},
    };
    
    // Calculate totals for CSS columns
    sortedData.forEach(row => {
      totals.cssSentCount += row.cssSentCount || 0;
      totals.cssReceivedCount += row.cssReceivedCount || 0;
    });
    
    const targetPerspectives = ACSAT_SATISFIED_TARGET_PERSPECTIVES;
    const useAccountWiseCriteriaOrgTotals = !groupByBU && !showTop10 && !searchTerm?.trim();

    if (useAccountWiseCriteriaOrgTotals) {
      const { orgPerspectiveStats } = buildAccountWiseCriteriaPerspectiveRatingsFromRows(uploadedData, {
        targetPerspectives,
      });
      targetPerspectives.forEach((perspective) => {
        const st = orgPerspectiveStats[perspective] || { satisfiedCount: 0, inputCount: 0 };
        totals.perspectives[perspective] = st.inputCount > 0
          ? Math.round((st.satisfiedCount / st.inputCount) * 10000) / 100
          : 0;
        totals.perspectiveInputTotals[perspective] = st.inputCount;
      });
    } else {
      targetPerspectives.forEach((perspective) => {
        const satisfiedTotal = sortedData.reduce(
          (sum, row) => sum + (row.perspectiveCounts?.[perspective] || 0),
          0
        );
        const inputTotal = sortedData.reduce(
          (sum, row) => sum + (row.perspectiveInputCounts?.[perspective] || 0),
          0
        );
        totals.perspectives[perspective] = inputTotal > 0
          ? Math.round((satisfiedTotal / inputTotal) * 10000) / 100
          : 0;
        totals.perspectiveInputTotals[perspective] = inputTotal;
      });
    }

    return totals;
  }, [sortedData, uploadedData, groupByBU, showTop10, searchTerm]);

  // Calculate "Other Account" totals for Top 10 view (TYPE OF ACCOUNT != 'Top 10')
  const otherAccountTotals = useMemo(() => {
    if (!showTop10 || !uploadedData) return null;

    // Build sets of Top 10 IDs and Names from first sheet
    const top10Ids = new Set();
    const top10Names = new Set();
    uploadedData.forEach(row => {
      const typeOfAccount = row['TYPE OF ACCOUNT'] || row['TYPE_OF_ACCOUNT'] || row['Type of Account'] || row['type_of_account'];
      const customerId = row['CUSTOMER_ID'] || row['CUST_ID'] || row['Customer ID'];
      const customerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'];
      if (typeOfAccount && typeOfAccount.toString().trim() === 'Top 10') {
        if (customerId) top10Ids.add(customerId);
        if (customerName) top10Names.add(customerName);
      }
    });

    // Grand total received count for Other Accounts from second sheet
    let otherReceived = 0;
    let otherSent = 0;
    if (secondSheetData && secondSheetData.length > 0) {
      secondSheetData.forEach(row => {
        const rowCustomerId = row['CUSTOMER_ID'] || row['CUST_ID'];
        const rowCustomerName = row['CUSTOMER NAME'] || row['CUSTOMER_NAME'] || row['Customer Name'];
        const rowTypeOfAccount = row['TYPE OF ACCOUNT'] || row['TYPE_OF_ACCOUNT'] || row['Type of Account'] || row['type_of_account'];
        const sentDate = getCsatSentDateFromRow(row);
        const receivedDate = getCsatReceivedDateFromRow(row);
        const yearQuarter = getYearQuarterFromRow(row);

        const matchesYearQuarter = yearQuarterMatchesCycle(yearQuarter, acsatCycle);
        const hasValidSentDate = sentDate && isDateOnOrAfterCsatStart(sentDate);
        const hasValidReceivedDate = receivedDate && isDateOnOrAfterCsatStart(receivedDate);

        // Determine if this row is an Other Account row (not Top 10)
        let isOtherAccount = true;
        if (rowTypeOfAccount !== undefined && rowTypeOfAccount !== null && rowTypeOfAccount !== '') {
          isOtherAccount = rowTypeOfAccount.toString().trim() !== 'Top 10';
        } else {
          // Fallback: if present in top10 ids/names, it's not Other
          if ((rowCustomerId && top10Ids.has(rowCustomerId)) || (rowCustomerName && top10Names.has(rowCustomerName))) {
            isOtherAccount = false;
          }
        }

        if (matchesYearQuarter && isOtherAccount) {
          if (hasValidSentDate) otherSent++;
          if (hasValidReceivedDate) otherReceived++;
        }
      });
    }

    const targetPerspectives = ACSAT_SATISFIED_TARGET_PERSPECTIVES;
    const perspectiveSatisfiedCounts = Object.fromEntries(targetPerspectives.map((p) => [p, 0]));
    const perspectiveInputCounts = Object.fromEntries(targetPerspectives.map((p) => [p, 0]));

    uploadedData.forEach((row) => {
      const rowPerspective = getPerspectiveFromRow(row);
      const rowTypeOfAccount = row['TYPE OF ACCOUNT'] || row['TYPE_OF_ACCOUNT'] || row['Type of Account'] || row['type_of_account'];
      const isOther = rowTypeOfAccount ? rowTypeOfAccount.toString().trim() !== 'Top 10' : true;

      if (!isOther) return;
      if (!targetPerspectives.includes(rowPerspective)) return;

      const ratingNum = getRatingFromRow(row);
      if (ratingNum === null) return;

      perspectiveInputCounts[rowPerspective] += 1;
      if (ratingNum === 4 || ratingNum === 5) {
        perspectiveSatisfiedCounts[rowPerspective] += 1;
      }
    });

    const perspectives = {};
    targetPerspectives.forEach((p) => {
      const inputTotal = perspectiveInputCounts[p] || 0;
      const satisfiedTotal = perspectiveSatisfiedCounts[p] || 0;
      perspectives[p] = inputTotal > 0
        ? Math.round((satisfiedTotal / inputTotal) * 10000) / 100
        : 0;
    });

    return {
      cssSentCount: otherSent,
      cssReceivedCount: otherReceived,
      perspectives,
      perspectiveInputTotals: perspectiveInputCounts,
    };
  }, [showTop10, uploadedData, secondSheetData, acsatCycle, isDateOnOrAfterCsatStart]);

  const isAccountWiseSatisfiedView = !groupByBU && !showTop10;
  const isTop10SatisfiedView = !groupByBU && showTop10;
  const isBuWiseSatisfiedView = groupByBU && !showTop10;

  const acsatTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length) return [];
    if (isAccountWiseSatisfiedView) {
      return trendAnalysisFiles.map((file) => buildAccountWiseSatisfiedCustomersTrendFromFile(file));
    }
    if (isTop10SatisfiedView) {
      return trendAnalysisFiles.map((file) =>
        buildTop10SatisfiedCustomersTrendFromFile(file, { top10AccountNames })
      );
    }
    if (isBuWiseSatisfiedView) {
      return trendAnalysisFiles.map((file) => buildBuWiseSatisfiedCustomersTrendFromFile(file));
    }
    return [];
  }, [showAcsatTrendAnalysis, trendAnalysisFiles, isAccountWiseSatisfiedView, isTop10SatisfiedView, isBuWiseSatisfiedView, top10AccountNames]);

  const showAccountMainTrendColumns =
    isAccountWiseSatisfiedView && showAcsatTrendAnalysis && !!trendAnalysisFiles?.length;

  const showTop10MainTrendColumns =
    isTop10SatisfiedView && showAcsatTrendAnalysis && !!trendAnalysisFiles?.length;

  const showBuMainTrendColumns =
    isBuWiseSatisfiedView && showAcsatTrendAnalysis && !!trendAnalysisFiles?.length;

  const showMainTrendColumns =
    showAccountMainTrendColumns || showTop10MainTrendColumns || showBuMainTrendColumns;

  const accountMainTrendSource = useMemo(() => {
    if (!showAccountMainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showAccountMainTrendColumns, acsatTrendAnalysisData]);

  const top10MainTrendSource = useMemo(() => {
    if (!showTop10MainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showTop10MainTrendColumns, acsatTrendAnalysisData]);

  const buMainTrendSource = useMemo(() => {
    if (!showBuMainTrendColumns || !acsatTrendAnalysisData.length) return null;
    const fileData = acsatTrendAnalysisData.find((d) => d.hasData) || acsatTrendAnalysisData[0];
    if (!fileData?.rows?.length) return null;
    return fileData;
  }, [showBuMainTrendColumns, acsatTrendAnalysisData]);

  const accountMainTrendLookup = useMemo(() => {
    if (!accountMainTrendSource?.rows?.length) return {};
    const lookup = {};
    accountMainTrendSource.rows.forEach((tr) => {
      const buKey = normalizeBuTrendKey(tr.businessUnit);
      const idKey = normalizeCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
      const nameKey = normalizeAccountNameKey(tr.customerName);
      if (idKey) lookup[`id|||${idKey}|||${buKey}`] = tr;
      if (nameKey) lookup[`name|||${nameKey}|||${buKey}`] = tr;
    });
    return lookup;
  }, [accountMainTrendSource]);

  const top10MainTrendLookup = useMemo(() => {
    if (!top10MainTrendSource?.rows?.length) return {};
    const lookup = {};
    top10MainTrendSource.rows.forEach((tr) => {
      const buKey = normalizeBuTrendKey(tr.businessUnit);
      const idKey = normalizeCustomerIdKey(tr.customerId)?.toString().trim().toLowerCase() || '';
      const nameKey = normalizeAccountNameKey(tr.customerName);
      if (idKey) lookup[`id|||${idKey}|||${buKey}`] = tr;
      if (nameKey) lookup[`name|||${nameKey}|||${buKey}`] = tr;
    });
    return lookup;
  }, [top10MainTrendSource]);

  const buMainTrendLookup = useMemo(() => {
    if (!buMainTrendSource?.rows?.length) return {};
    const lookup = {};
    buMainTrendSource.rows.forEach((tr) => {
      const buKey = normalizeBuTrendKey(tr.businessUnit);
      if (buKey) lookup[buKey] = tr;
    });
    return lookup;
  }, [buMainTrendSource]);

  const findAccountMainTrendRow = (group) => {
    if (!accountMainTrendSource) return null;
    const buKey = normalizeBuTrendKey(group.businessUnit);
    const idKey = normalizeCustomerIdKey(group.customerId)?.toString().trim().toLowerCase() || '';
    const nameKey = normalizeAccountNameKey(group.customerName);
    if (idKey && accountMainTrendLookup[`id|||${idKey}|||${buKey}`]) {
      return accountMainTrendLookup[`id|||${idKey}|||${buKey}`];
    }
    if (nameKey && accountMainTrendLookup[`name|||${nameKey}|||${buKey}`]) {
      return accountMainTrendLookup[`name|||${nameKey}|||${buKey}`];
    }
    return findAccountWiseSatisfiedTrendRowForCustomer(
      group.businessUnit,
      group.customerId,
      group.customerName,
      accountMainTrendSource.rows
    );
  };

  const findTop10MainTrendRow = (group) => {
    if (!top10MainTrendSource) return null;
    const buKey = normalizeBuTrendKey(group.businessUnit);
    const idKey = normalizeCustomerIdKey(group.customerId)?.toString().trim().toLowerCase() || '';
    const nameKey = normalizeAccountNameKey(group.customerName);
    if (idKey && top10MainTrendLookup[`id|||${idKey}|||${buKey}`]) {
      return top10MainTrendLookup[`id|||${idKey}|||${buKey}`];
    }
    if (nameKey && top10MainTrendLookup[`name|||${nameKey}|||${buKey}`]) {
      return top10MainTrendLookup[`name|||${nameKey}|||${buKey}`];
    }
    return findAccountWiseSatisfiedTrendRowForCustomer(
      group.businessUnit,
      group.customerId,
      group.customerName,
      top10MainTrendSource.rows
    );
  };

  const getAccountPerspectiveTrendDiffDisplay = (group, perspective) => {
    const trendRow = findAccountMainTrendRow(group);
    const current = parseSatisfiedTrendPercent(group.perspectivePercentages?.[perspective]);
    const trend = trendRow
      ? parseSatisfiedTrendPercent(trendRow.perspectivePercentages?.[perspective])
      : null;
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const getTop10PerspectiveTrendDiffDisplay = (group, perspective) => {
    const trendRow = findTop10MainTrendRow(group);
    const current = parseSatisfiedTrendPercent(group.perspectivePercentages?.[perspective]);
    const trend = trendRow
      ? parseSatisfiedTrendPercent(trendRow.perspectivePercentages?.[perspective])
      : null;
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const findBuMainTrendRow = (group) => {
    if (!buMainTrendSource) return null;
    const buKey = normalizeBuTrendKey(group.businessUnit);
    if (buKey && buMainTrendLookup[buKey]) {
      return buMainTrendLookup[buKey];
    }
    return findBuWiseSatisfiedTrendRowForBusinessUnit(
      group.businessUnit,
      buMainTrendSource.rows
    );
  };

  const getBuPerspectiveTrendDiffDisplay = (group, perspective) => {
    const trendRow = findBuMainTrendRow(group);
    const current = parseSatisfiedTrendPercent(group.perspectivePercentages?.[perspective]);
    const trend = trendRow
      ? parseSatisfiedTrendPercent(trendRow.perspectivePercentages?.[perspective])
      : null;
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const getAccountGrandTotalTrendDiffDisplay = (perspective) => {
    if (!accountMainTrendSource?.grandTotal || !grandTotals) {
      return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280', excelColor: 'FF6B7280' };
    }
    const current = parseSatisfiedTrendPercent(grandTotals.perspectives?.[perspective]);
    const trend = parseSatisfiedTrendPercent(
      accountMainTrendSource.grandTotal.perspectivePercentages?.[perspective]
    );
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const getTop10GrandTotalTrendDiffDisplay = (perspective) => {
    if (!top10MainTrendSource?.grandTotal || !grandTotals) {
      return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280', excelColor: 'FF6B7280' };
    }
    const current = parseSatisfiedTrendPercent(grandTotals.perspectives?.[perspective]);
    const trend = parseSatisfiedTrendPercent(
      top10MainTrendSource.grandTotal.perspectivePercentages?.[perspective]
    );
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const getBuGrandTotalTrendDiffDisplay = (perspective) => {
    if (!buMainTrendSource?.grandTotal || !grandTotals) {
      return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280', excelColor: 'FF6B7280' };
    }
    const current = parseSatisfiedTrendPercent(grandTotals.perspectives?.[perspective]);
    const trend = parseSatisfiedTrendPercent(
      buMainTrendSource.grandTotal.perspectivePercentages?.[perspective]
    );
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const getMainPerspectiveTrendDiffDisplay = (group, perspective) => {
    if (showBuMainTrendColumns) return getBuPerspectiveTrendDiffDisplay(group, perspective);
    if (showTop10MainTrendColumns) return getTop10PerspectiveTrendDiffDisplay(group, perspective);
    return getAccountPerspectiveTrendDiffDisplay(group, perspective);
  };

  const getMainGrandTotalTrendDiffDisplay = (perspective) => {
    if (showBuMainTrendColumns) return getBuGrandTotalTrendDiffDisplay(perspective);
    if (showTop10MainTrendColumns) return getTop10GrandTotalTrendDiffDisplay(perspective);
    return getAccountGrandTotalTrendDiffDisplay(perspective);
  };

  const getMainTrendHeaderBackground = () => {
    if (showTop10MainTrendColumns) return '#b45309';
    if (showBuMainTrendColumns) return '#4338ca';
    return '#0f766e';
  };

  const getMainTrendRowCellBackground = (bold = false) => {
    if (bold) return '#e2e8f0';
    if (showTop10MainTrendColumns) return '#fff7ed';
    if (showBuMainTrendColumns) return '#eef2ff';
    return '#f0fdfa';
  };

  const getMainTrendExcelHeaderArgb = () => {
    if (showTop10MainTrendColumns) return 'FFB45309';
    if (showBuMainTrendColumns) return 'FF4338CA';
    return 'FF0F766E';
  };

  const getMainTrendExcelCellArgb = () => {
    if (showTop10MainTrendColumns) return 'FFFFF7ED';
    if (showBuMainTrendColumns) return 'FFEEF2FF';
    return 'FFF0FDFA';
  };

  const getTop10OtherAccountsTrendDiffDisplay = (perspective) => {
    if (!top10MainTrendSource?.otherAccountsRow || !otherAccountTotals) {
      return { diffText: '-', arrow: '', diffColor: '#6b7280', arrowColor: '#6b7280', excelColor: 'FF6B7280' };
    }
    const current = parseSatisfiedTrendPercent(otherAccountTotals.perspectives?.[perspective]);
    const trend = parseSatisfiedTrendPercent(
      top10MainTrendSource.otherAccountsRow.perspectivePercentages?.[perspective]
    );
    return formatSatisfiedPerspectiveTrendDiff(current, trend);
  };

  const renderSatisfiedTrendDiffContent = (display) => {
    if (display.diffText === '-') {
      return <span style={{ color: display.diffColor }}>-</span>;
    }
    return (
      <>
        <span style={{ color: display.diffColor }}>{display.diffText}</span>
        {display.arrow ? (
          <span style={{ color: display.arrowColor, marginLeft: '0.35rem', fontWeight: 700 }}>
            {display.arrow}
          </span>
        ) : null}
      </>
    );
  };

  const scrollToAcsatTrendSection = () => {
    requestAnimationFrame(() => {
      acsatTrendSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const downloadAccountWiseSatisfiedTrendExcel = async () => {
    const accountTrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!accountTrendFiles.length) {
      alert('No account-wise trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    accountTrendFiles.forEach((fileData, idx) =>
      addSatisfiedAccountWiseTrendSheetToWorkbook(workbook, fileData, idx)
    );
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_Account_Wise_Satisfied_Customers_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadBuWiseSatisfiedTrendExcel = async () => {
    const buTrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!buTrendFiles.length) {
      alert('No BU-wise trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    buTrendFiles.forEach((fileData, idx) =>
      addSatisfiedBuWiseTrendSheetToWorkbook(workbook, fileData, idx)
    );
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_BU_Wise_Satisfied_Customers_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTop10SatisfiedTrendExcel = async () => {
    const top10TrendFiles = acsatTrendAnalysisData.filter((f) => f.hasData && f.rows?.length);
    if (!top10TrendFiles.length) {
      alert('No Top 10 trend data available to download.');
      return;
    }
    const workbook = new ExcelJS.Workbook();
    top10TrendFiles.forEach((fileData, idx) =>
      addSatisfiedTop10TrendSheetToWorkbook(workbook, fileData, idx)
    );
    const todayStr = new Date().toISOString().split('T')[0];
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ACSAT_Top10_Satisfied_Customers_Trend_Analysis_${todayStr}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewAcsatTrendAnalysis = () => {
    if (!isAccountWiseSatisfiedView && !isTop10SatisfiedView && !isBuWiseSatisfiedView) {
      alert('ACSAT trend analysis is available only in Account-wise, BU-wise, or Top 10 view on this dashboard.');
      return;
    }
    if (!trendAnalysisFiles?.length) {
      alert('Please upload ACSAT trend files using "Upload data for ACSAT trend analysis" on the Upload ACSAT Data page.');
      return;
    }
    if (!showAcsatTrendAnalysis) {
      setShowAcsatTrendAnalysis(true);
      setTimeout(scrollToAcsatTrendSection, 150);
      return;
    }
    scrollToAcsatTrendSection();
  };

  const downloadExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Count Dashboard');

      // Add headers with ultra-short text and multiple line breaks for maximum visibility
      const trendHeaderLabels = showMainTrendColumns
        ? ACSAT_SATISFIED_TARGET_PERSPECTIVES.map(getSatisfiedMainTrendColumnLabel)
        : [];
      const headers = [
        'Sr. No.',
        'Business Unit',
        ...(groupByBU ? [] : ['Account\nName']),
          'Polled',
          'Responded',
          'Meeting Delivery\nCommitments\n(%)',
          'Customer Engagement\nand Relationship\n(%)',
          'Partner adding value\nto Customer Business\n(%)',
          ...trendHeaderLabels,
      ];

      console.log('Headers for Excel:', headers);
      console.log('Group by BU:', groupByBU);
      
      // Add headers with proper styling
      const headerRow = worksheet.addRow(headers);
      const mainHeaderColCount = groupByBU ? 7 : 8;
      headerRow.eachCell((cell, colNumber) => {
        const isTrendHeader = showMainTrendColumns && colNumber > mainHeaderColCount;
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            argb: isTrendHeader
              ? getMainTrendExcelHeaderArgb()
              : 'FF1E3A8A',
          },
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true, // Enable word wrapping for headers
          indent: 0, // No indentation for center alignment
          readingOrder: 'left-to-right',
          textRotation: 0 // Ensure text is not rotated
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
      
      // Set header row height for better text wrapping - reduced for compact layout
      headerRow.height = 80;

      // Add data rows - use sortedData to match dashboard order (includes account order for account-wise)
      const dataToExport = sortedData && sortedData.length > 0 ? sortedData : processedData.data;
      dataToExport.forEach((group, index) => {
        const row = [
          index + 1,
          normalizeBusinessUnitDisplay(group.businessUnit),
          ...(groupByBU ? [] : [group.customerName]),
            group.cssSentCount || 0,
            group.cssReceivedCount || 0,
            `${group.perspectivePercentages?.['Meeting Delivery Commitments'] || '0.00'}%`,
            `${group.perspectivePercentages?.['Customer Engagement and Relationship'] || '0.00'}%`,
            `${group.perspectivePercentages?.['Partner adding value to Customer Business'] || '0.00'}%`,
            ...(showMainTrendColumns
              ? ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((p) => {
                  const display = getMainPerspectiveTrendDiffDisplay(group, p);
                  return display.excelValue || display.diffText;
                })
              : []),
        ];
        const excelRow = worksheet.addRow(row);
        
        // Apply word wrapping and borders to all cells in the data row
        excelRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
          // Column 4: Polled (numeric), Column 5: Responded (numeric), Perspective columns: numeric
          const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
          
          // Set number format for numeric columns
          if (isNumericColumn && colNumber <= (groupByBU ? 5 : 6)) {
            // Polled and Responded columns - integers
            cell.numFmt = '0';
          }
          
          cell.alignment = {
            horizontal: isNumericColumn ? 'center' : 'left',
            vertical: 'middle',
            wrapText: !isNumericColumn, // Enable word wrapping only for text cells
            indent: !isNumericColumn ? 1 : 0, // Add slight indentation only for text cells
            readingOrder: 'left-to-right'
          };
          // Apply borders to all cells
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
        });
        
        // Set row height for better text wrapping - reduced for compact layout
        excelRow.height = 60;
        
        // Apply color coding to percentage columns
        // Calculate the correct column indices based on whether it's BU-wise or account-wise
        // Column order: 
        // BU-wise: Sr. No.(1), Business Unit(2), Polled(3), Responded(4), then 3 percentage columns(5,6,7)
        // Account-wise: Sr. No.(1), Business Unit(2), Account Name(3), Polled(4), Responded(5), then 3 percentage columns(6,7,8)
        const percentageColumnIndices = groupByBU ? [5, 6, 7] : [6, 7, 8]; // Indices for the three percentage columns
        
        // Apply styling to each percentage column
        const perspectives = ['Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business'];
        
        console.log(`Processing row for ${groupByBU ? 'BU' : 'Account'}: ${group.businessUnit}`);
        console.log(`Row data:`, row);
        console.log(`Percentage column indices:`, percentageColumnIndices);
        
        perspectives.forEach((perspective, index) => {
          const cellIndex = percentageColumnIndices[index];
          const cell = excelRow.getCell(cellIndex);
          const percentageStr = group.perspectivePercentages?.[perspective] || '0.00';
          
          // Handle "-" (hyphen) for zero received count
          if (percentageStr === '-') {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
            cell.font = { color: { argb: 'FF6B7280' } };
            // Percentage columns should be center-aligned
            cell.alignment = { 
              horizontal: 'center', 
              vertical: 'middle',
              wrapText: false,
              indent: 0,
              readingOrder: 'left-to-right'
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            return;
          }
          
          const perspectiveInputCount = group.perspectiveInputCounts?.[perspective] || 0;

          if (perspectiveInputCount === 0 || perspectiveInputCount === '0') {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
            cell.font = { 
              color: { argb: 'FF000000' }, 
              bold: true 
            };
            // Percentage columns should be center-aligned
            cell.alignment = { 
              horizontal: 'center', 
              vertical: 'middle',
              wrapText: false,
              indent: 0,
              readingOrder: 'left-to-right'
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
            return;
          }
          
          const percentageValue = parseFloat(percentageStr);
          
          console.log(`Applying styling to ${perspective}: ${percentageValue}% at column ${cellIndex}`);
          console.log(`Cell value before styling:`, cell.value);
          
          if (percentageValue > 90) {
            // Light Green 2 >90% (Excel standard)
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: 'FFC6EFCE' } 
            };
            cell.font = { 
              color: { argb: 'FF000000' }, 
              bold: true 
            };
          } else if (percentageValue >= 70 && percentageValue <= 90) {
            // Orange 70-90% (Excel standard)
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: 'FFFFA500' } 
            };
            cell.font = { 
              color: { argb: 'FF000000' }, 
              bold: true 
            };
          } else {
            // Red <70% (Excel standard)
            cell.fill = { 
              type: 'pattern', 
              pattern: 'solid', 
              fgColor: { argb: 'FFFF0000' } 
            };
            cell.font = { 
              color: { argb: 'FFFFFFFF' }, 
              bold: true 
            };
          }
          
          // Percentage columns should be center-aligned (middle vertical)
          // Reapply alignment after color coding to ensure it's preserved
          cell.alignment = { 
            horizontal: 'center', 
            vertical: 'middle',
            wrapText: false,
            indent: 0,
            readingOrder: 'left-to-right'
          };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          console.log(`Applied styling to column ${cellIndex}:`, {
            fill: cell.fill,
            font: cell.font,
            value: cell.value
          });
        });

        if (showMainTrendColumns) {
          const trendStartCol = groupByBU ? 8 : 9;
          ACSAT_SATISFIED_TARGET_PERSPECTIVES.forEach((perspective, trendIndex) => {
            const cell = excelRow.getCell(trendStartCol + trendIndex);
            const display = getMainPerspectiveTrendDiffDisplay(group, perspective);
            applySatisfiedTrendDiffExcelCellStyle(cell, display);
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: getMainTrendExcelCellArgb() },
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
          });
        }
        });

        // Add grand total row if grandTotals exists
        if (grandTotals) {
          const grandTotalRow = [
            '',
            groupByBU ? 'Org Level' : (showTop10 ? 'Top 10 Accounts' : 'Grand Total'),
            ...(groupByBU ? [] : ['-']),
            grandTotals.cssSentCount,
            grandTotals.cssReceivedCount,
            `${grandTotals.perspectives['Meeting Delivery Commitments']}%`,
            `${grandTotals.perspectives['Customer Engagement and Relationship']}%`,
            `${grandTotals.perspectives['Partner adding value to Customer Business']}%`,
            ...(showMainTrendColumns
              ? ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((p) => {
                  const display = getMainGrandTotalTrendDiffDisplay(p);
                  return display.excelValue || display.diffText;
                })
              : []),
          ];
          
          const excelGrandTotalRow = worksheet.addRow(grandTotalRow);
          
          // Style grand total row
          excelGrandTotalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            
            // Determine if this column is numeric
            const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
            
            // Set number format for numeric columns
            if (isNumericColumn && colNumber <= (groupByBU ? 5 : 6)) {
              // Polled and Responded columns - integers
              cell.numFmt = '0';
            }
            
            cell.alignment = { 
              horizontal: isNumericColumn ? 'center' : 'left', 
              vertical: 'middle',
              wrapText: !isNumericColumn,
              indent: !isNumericColumn ? 1 : 0,
              readingOrder: 'left-to-right'
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } }
            };
          });
          
          // Apply color coding to percentage columns in grand total row
          const percentageColumnIndices = groupByBU ? [5, 6, 7] : [6, 7, 8];
          const perspectives = ['Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business'];
          
          perspectives.forEach((perspective, index) => {
            const cellIndex = percentageColumnIndices[index];
            const cell = excelGrandTotalRow.getCell(cellIndex);
            const percentageValue = grandTotals.perspectives[perspective];
            
            // If Responded (cssReceivedCount) is 0, cell color should be white
            if (grandTotals.cssReceivedCount === 0 || grandTotals.cssReceivedCount === '0') {
              // White background, use default text color
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // White background
              cell.font = { 
                color: { argb: 'FF000000' }, 
                bold: true 
              };
              // Reapply alignment after color coding to ensure it's preserved
              cell.alignment = { 
                horizontal: 'center',
                vertical: 'middle',
                wrapText: false,
                indent: 0,
                readingOrder: 'left-to-right'
              };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
              return;
            }
            
            if (percentageValue > 90) {
              // Light Green 2 >90% (Excel standard)
              cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FFC6EFCE' } 
              };
              cell.font = { 
                color: { argb: 'FF000000' }, 
                bold: true 
              };
            } else if (percentageValue >= 70 && percentageValue <= 90) {
              // Orange 70-90% (Excel standard)
              cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FFFFA500' } 
              };
              cell.font = { 
                color: { argb: 'FF000000' }, 
                bold: true 
              };
            } else {
              // Red <70% (Excel standard)
              cell.fill = { 
                type: 'pattern', 
                pattern: 'solid', 
                fgColor: { argb: 'FFFF0000' } 
              };
              cell.font = { 
                color: { argb: 'FFFFFFFF' }, 
                bold: true 
              };
            }
            
            // Reapply alignment after color coding to ensure it's preserved
            cell.alignment = { 
              horizontal: 'center', 
              vertical: 'middle',
              wrapText: false,
              indent: 0,
              readingOrder: 'left-to-right'
            };
          });

          if (showMainTrendColumns) {
            const trendStartCol = groupByBU ? 8 : 9;
            ACSAT_SATISFIED_TARGET_PERSPECTIVES.forEach((perspective, trendIndex) => {
              const cell = excelGrandTotalRow.getCell(trendStartCol + trendIndex);
              const display = getMainGrandTotalTrendDiffDisplay(perspective);
              applySatisfiedTrendDiffExcelCellStyle(cell, display);
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
              };
            });
          }
          
          // Set row height for grand total - reduced for compact layout
          excelGrandTotalRow.height = 60;

          // Add Other Account row (only for Top 10 view)
          if (showTop10 && otherAccountTotals) {
            const otherRowValues = [
              '',
              'Other Accounts',
              ...(groupByBU ? [] : ['-']),
              otherAccountTotals.cssSentCount,
              otherAccountTotals.cssReceivedCount,
              `${otherAccountTotals.perspectives['Meeting Delivery Commitments']}%`,
              `${otherAccountTotals.perspectives['Customer Engagement and Relationship']}%`,
              `${otherAccountTotals.perspectives['Partner adding value to Customer Business']}%`,
              ...(showTop10MainTrendColumns
                ? ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((p) => {
                    const display = getTop10OtherAccountsTrendDiffDisplay(p);
                    return display.excelValue || display.diffText;
                  })
                : []),
            ];
            const otherRow = worksheet.addRow(otherRowValues);
            // Style Other row
            otherRow.eachCell((cell, colNumber) => {
              cell.font = { bold: true, color: { argb: 'FF000000' } };
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } }; // Light orange
              
              // Determine if this column is numeric
              const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
              
              // Set number format for numeric columns
              if (isNumericColumn && colNumber <= (groupByBU ? 5 : 6)) {
                // Polled and Responded columns - integers
                cell.numFmt = '0';
              }
              
              cell.alignment = { 
                horizontal: isNumericColumn ? 'center' : 'left', 
                vertical: 'middle',
                wrapText: !isNumericColumn,
                indent: !isNumericColumn ? 1 : 0,
                readingOrder: 'left-to-right'
              };
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } }
              };
            });
            // Apply color coding to percentage columns in Other row similar to data rows
            const percentageColumnIndicesOther = groupByBU ? [5, 6, 7] : [6, 7, 8];
            const perspectivesList = ['Meeting Delivery Commitments', 'Customer Engagement and Relationship', 'Partner adding value to Customer Business'];
            perspectivesList.forEach((perspective, index) => {
              const cellIndex = percentageColumnIndicesOther[index];
              const cell = otherRow.getCell(cellIndex);
              const percentageValue = otherAccountTotals.perspectives[perspective];
              
              // If Responded (cssReceivedCount) is 0, cell color should be white
              if (otherAccountTotals.cssReceivedCount === 0 || otherAccountTotals.cssReceivedCount === '0') {
                // White background, use default text color
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }; // White background
                cell.font = { 
                  color: { argb: 'FF000000' }, 
                  bold: true 
                };
                // Reapply alignment after color coding to ensure it's preserved
                cell.alignment = { 
                  horizontal: 'center', 
                  vertical: 'middle',
                  wrapText: false,
                  indent: 0,
                  readingOrder: 'left-to-right'
                };
                cell.border = {
                  top: { style: 'thin', color: { argb: 'FF000000' } },
                  left: { style: 'thin', color: { argb: 'FF000000' } },
                  bottom: { style: 'thin', color: { argb: 'FF000000' } },
                  right: { style: 'thin', color: { argb: 'FF000000' } }
                };
                return;
              }
              
              if (percentageValue > 90) {
                // Light Green 2 >90% (Excel standard)
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else if (percentageValue >= 70 && percentageValue <= 90) {
                // Orange 70-90% (Excel standard)
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else {
                // Red <70% (Excel standard)
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              }
              
              // Reapply alignment after color coding to ensure it's preserved
              cell.alignment = { 
                horizontal: 'center', 
                vertical: 'middle',
                wrapText: false,
                indent: 0,
                readingOrder: 'left-to-right'
              };
            });
            if (showTop10MainTrendColumns) {
              const trendStartColOther = groupByBU ? 8 : 9;
              ACSAT_SATISFIED_TARGET_PERSPECTIVES.forEach((perspective, trendIndex) => {
                const cell = otherRow.getCell(trendStartColOther + trendIndex);
                const display = getTop10OtherAccountsTrendDiffDisplay(perspective);
                applySatisfiedTrendDiffExcelCellStyle(cell, display);
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF7ED' } };
                cell.border = {
                  top: { style: 'thin', color: { argb: 'FF000000' } },
                  left: { style: 'thin', color: { argb: 'FF000000' } },
                  bottom: { style: 'thin', color: { argb: 'FF000000' } },
                  right: { style: 'thin', color: { argb: 'FF000000' } },
                };
              });
            }
            otherRow.height = 60;
          }
        }

        // Add legend
        const legendStartRow = processedData.data.length + (grandTotals ? 4 : 3);
      worksheet.addRow([]); // Empty row
      worksheet.addRow(['Legend:']);
      
      const legendRow1 = worksheet.addRow(['Green', '>90%']);
      const legendRow2 = worksheet.addRow(['Orange', '70% - 90%']);
      const legendRow3 = worksheet.addRow(['Red', '<70%']);
      
      // Style legend
      [legendRow1, legendRow2, legendRow3].forEach((row, index) => {
        const colorCell = row.getCell(1);
        const textCell = row.getCell(2);
        
        // Apply borders and alignment to legend cells
        [colorCell, textCell].forEach(cell => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          cell.alignment = {
            horizontal: 'left',
            vertical: 'middle',
            wrapText: true,
            readingOrder: 'left-to-right'
          };
        });
        
        if (index === 0) {
          // Light Green 2 >90% (Excel standard)
          colorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          colorCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (index === 1) {
          // Orange 70-90% (Excel standard)
          colorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          colorCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          // Red <70% (Excel standard)
          colorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          colorCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        
        textCell.font = { bold: true };
        textCell.alignment = { 
          horizontal: 'left', 
          vertical: 'middle',
          wrapText: true,
          readingOrder: 'left-to-right'
        };
        textCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } }; // Light gray background
      });

        // Set column widths for better word wrapping and text layout - reduced for compact layout
        const colWidths = [8, 20, ...(groupByBU ? [] : [25]), 15, 15, 18, 20, 20];
        worksheet.columns = colWidths.map(width => ({ width }));

      // Add summary section to Excel
      if (processedData?.summary) {
        worksheet.addRow([]);
        worksheet.addRow([]);
        
        // Record the start row for the summary section
        const summaryStartRow = worksheet.lastRow.number + 1;
        
        // Summary Title - Different titles based on view type
        let summaryTitle;
        if (groupByBU) {
          summaryTitle = '📊 ACSAT - Org level/BU wise % of 4,5 rater summary';
        } else if (showTop10) {
          summaryTitle = '📊 ACSAT - Top 10 Account % of satisfied customers summary';
        } else {
          summaryTitle = '📊 ACSAT - Account level % of satisfied customers summary';
        }
        
        const summaryTitleRow = worksheet.addRow([summaryTitle]);
        const summaryTitleRowNum = summaryTitleRow.number;
        summaryTitleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        summaryTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Navy blue
        summaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        summaryTitleRow.height = 45;
        worksheet.mergeCells(`A${summaryTitleRowNum}:F${summaryTitleRowNum}`);

        // Add Perspectives with % ≥ 70% section
        worksheet.addRow([]);
        const above75TitleRow = worksheet.addRow(['🏆 Perspectives with % ≥ 70%']);
        const above75TitleRowNum = above75TitleRow.number;
        above75TitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF059669' } };
        above75TitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        above75TitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
        above75TitleRow.height = 35;
        worksheet.mergeCells(`A${above75TitleRowNum}:F${above75TitleRowNum}`);
        
        // Use different data sources based on view type
        const safeGet = (k) => {
          const v = grandTotals && grandTotals.perspectives ? grandTotals.perspectives[k] : 0;
          return typeof v === 'number' && !isNaN(v) ? v : 0;
        };
        let perspectivesAbove75 = [];
        if (grandTotals) {
          const keys = ['Meeting Delivery Commitments','Customer Engagement and Relationship','Partner adding value to Customer Business'];
          perspectivesAbove75 = keys
            .filter(k => safeGet(k) >= 70)
            .map(k => ({ name: k, percentage: Math.round(safeGet(k) * 100) / 100 }));
        }

        if (perspectivesAbove75.length > 0) {
          perspectivesAbove75.forEach(perspective => {
            const perspectiveRow = worksheet.addRow([`• ${perspective.name}: ${perspective.percentage}%`]);
            const perspectiveRowNum = perspectiveRow.number;
            perspectiveRow.getCell(1).font = { size: 12, color: { argb: 'FF1F2937' } };
            perspectiveRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            perspectiveRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            perspectiveRow.height = 28;
            worksheet.mergeCells(`A${perspectiveRowNum}:F${perspectiveRowNum}`);
          });
        } else {
          const noPerspectivesRow = worksheet.addRow(['No perspectives above 70%']);
          const noPerspectivesRowNum = noPerspectivesRow.number;
          noPerspectivesRow.getCell(1).font = { size: 12, italic: true, color: { argb: 'FF6B7280' } };
          noPerspectivesRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          noPerspectivesRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          noPerspectivesRow.height = 28;
          worksheet.mergeCells(`A${noPerspectivesRowNum}:F${noPerspectivesRowNum}`);
        }

        // Add Perspectives with % < 70% section (or Areas of Concern for BU-wise)
        worksheet.addRow([]);
        let below75Title;
        let below75Data = [];
        
        below75Title = '⚠️ Perspectives with % < 70%';
        if (grandTotals) {
          const keys = ['Meeting Delivery Commitments','Customer Engagement and Relationship','Partner adding value to Customer Business'];
          below75Data = keys
            .filter(k => safeGet(k) < 70)
            .map(k => ({ name: k, percentage: Math.round(safeGet(k) * 100) / 100 }));
        }
        
        const below75TitleRow = worksheet.addRow([below75Title]);
        const below75TitleRowNum = below75TitleRow.number;
        below75TitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FFFF0000' } }; // Red (Excel standard)
        below75TitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        below75TitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEF2F2' } };
        below75TitleRow.height = 35;
        worksheet.mergeCells(`A${below75TitleRowNum}:F${below75TitleRowNum}`);
        
        if (below75Data.length > 0) {
          below75Data.forEach(perspective => {
            const below75Row = worksheet.addRow([`• ${perspective.name}: ${perspective.percentage}%`]);
            const below75RowNum = below75Row.number;
            below75Row.getCell(1).font = { size: 12, color: { argb: 'FF1F2937' } };
            below75Row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            below75Row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            below75Row.height = 28;
            worksheet.mergeCells(`A${below75RowNum}:F${below75RowNum}`);
          });
        } else {
          const noBelow75Row = worksheet.addRow([groupByBU ? 'No areas of concern' : 'No perspectives below 70%']);
          const noBelow75RowNum = noBelow75Row.number;
          noBelow75Row.getCell(1).font = { size: 12, italic: true, color: { argb: 'FF6B7280' } };
          noBelow75Row.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          noBelow75Row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          noBelow75Row.height = 28;
          worksheet.mergeCells(`A${noBelow75RowNum}:F${noBelow75RowNum}`);
        }

        // Add BU Level Summary - Only for BU-wise view
        if (groupByBU) {
        worksheet.addRow([]);
        const buSummaryTitleRow = worksheet.addRow(['🏢 BU Level Summary']);
        const buSummaryTitleRowNum = buSummaryTitleRow.number;
        buSummaryTitleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' } };
        buSummaryTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } }; // Navy blue
        buSummaryTitleRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        buSummaryTitleRow.height = 45;
        worksheet.mergeCells(`A${buSummaryTitleRowNum}:F${buSummaryTitleRowNum}`);

        Object.entries(processedData.summary.buLevel).forEach(([buName, buData]) => {
          worksheet.addRow([]);
          const buNameRow = worksheet.addRow([`${buName}`]);
          const buNameRowNum = buNameRow.number;
          buNameRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF10B981' } };
          buNameRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          buNameRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } };
          buNameRow.height = 30;
          worksheet.mergeCells(`A${buNameRowNum}:F${buNameRowNum}`);
          
          const significantlyLessRow = worksheet.addRow([`  Perspectives with % < 70%:`]);
          const significantlyLessRowNum = significantlyLessRow.number;
          significantlyLessRow.getCell(1).font = { size: 11, color: { argb: 'FF1F2937' } };
          significantlyLessRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          significantlyLessRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          significantlyLessRow.height = 25;
          worksheet.mergeCells(`A${significantlyLessRowNum}:F${significantlyLessRowNum}`);
          
          if (buData.below4 && buData.below4.length > 0) {
            buData.below4.forEach(perspective => {
              const perspectiveRow = worksheet.addRow([`    • ${perspective.name}: ${perspective.percentage}%`]);
              const perspectiveRowNum = perspectiveRow.number;
              perspectiveRow.getCell(1).font = { size: 11, color: { argb: 'FF1F2937' } };
              perspectiveRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
              perspectiveRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              perspectiveRow.height = 25;
              worksheet.mergeCells(`A${perspectiveRowNum}:F${perspectiveRowNum}`);
            });
          } else {
            const noneRow = worksheet.addRow([`    None`]);
            const noneRowNum = noneRow.number;
            noneRow.getCell(1).font = { size: 11, italic: true, color: { argb: 'FF6B7280' } };
            noneRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            noneRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            noneRow.height = 25;
            worksheet.mergeCells(`A${noneRowNum}:F${noneRowNum}`);
          }
          
          const higherThanRestRow = worksheet.addRow([`  Perspectives with % ≥ 70%:`]);
          const higherThanRestRowNum = higherThanRestRow.number;
          higherThanRestRow.getCell(1).font = { size: 11, color: { argb: 'FF1F2937' } };
          higherThanRestRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          higherThanRestRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          higherThanRestRow.height = 25;
          worksheet.mergeCells(`A${higherThanRestRowNum}:F${higherThanRestRowNum}`);
          
          if (buData.above4 && buData.above4.length > 0) {
            buData.above4.forEach(perspective => {
              const perspectiveRow = worksheet.addRow([`    • ${perspective.name}: ${perspective.percentage}%`]);
              const perspectiveRowNum = perspectiveRow.number;
              perspectiveRow.getCell(1).font = { size: 11, color: { argb: 'FF1F2937' } };
              perspectiveRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
              perspectiveRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              perspectiveRow.height = 25;
              worksheet.mergeCells(`A${perspectiveRowNum}:F${perspectiveRowNum}`);
            });
          } else {
            const noneRow = worksheet.addRow([`    None`]);
            const noneRowNum = noneRow.number;
            noneRow.getCell(1).font = { size: 11, italic: true, color: { argb: 'FF6B7280' } };
            noneRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
            noneRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            noneRow.height = 25;
            worksheet.mergeCells(`A${noneRowNum}:F${noneRowNum}`);
          }
          
          // Removed legacy Areas of Concern section
        });
        
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
      }

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Generate filename based on view type
      let filename;
      if (showTop10) {
        filename = `ACSAT_Top10_Account_Satisfied_Customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else if (groupByBU) {
        filename = `ACSAT_BU_Level_Satisfied_Customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else {
        filename = `ACSAT_Account_Level_Satisfied_Customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      }
      
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Error downloading Excel file');
    }
  };

  if (!uploadedData) {
    return (
      <DashboardContainer>
        <Header>
          <Title>Loading...</Title>
        </Header>
      </DashboardContainer>
    );
  }

  if (loadError) {
    return (
      <DashboardContainer>
        <Header>
          <Title>
            ACSAT: {showTop10 ? 'Top 10 Account' : 'Org & BU Level'} - % of Satisfied Customers
          </Title>
          <BackButton onClick={onBack}>Back</BackButton>
        </Header>
        <ControlsContainer>
          <p style={{ color: '#dc2626', margin: 0 }}>{loadError}</p>
        </ControlsContainer>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <Title>
          ACSAT: {showTop10 ? 'Top 10 Account' : 'Org & BU Level'} - % of Satisfied Customers
        </Title>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <BackButton onClick={onBack}>Back to ACSAT</BackButton>
          <TrendAnalysisButton type="button" onClick={handleViewAcsatTrendAnalysis}>
            <TrendingUp size={16} />
            View ACSAT trend analysis
          </TrendAnalysisButton>
        </div>
      </Header>

      <ControlsContainer>
        <ToggleButton 
          active={!groupByBU && !showTop10} 
          onClick={() => {
            setGroupByBU(false);
            setShowTop10(false);
          }}
        >
          Account-wise View
        </ToggleButton>
        <ToggleButton 
          active={groupByBU} 
          onClick={() => {
            setGroupByBU(true);
            setShowTop10(false);
          }}
        >
          BU-wise View
        </ToggleButton>
        <ToggleButton 
          active={showTop10}
          onClick={() => {
            setShowTop10(true);
            setGroupByBU(false);
          }}
        >
          ACSAT: Top 10 account -% of Satisfied Customers
        </ToggleButton>

        {!groupByBU && (
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder={showTop10 ? "Search by top 10 account name..." : "Search by customer name..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <ClearButton onClick={() => setSearchTerm('')}>
                Clear
              </ClearButton>
            )}
          </SearchContainer>
        )}

        <DownloadButton onClick={downloadExcel}>
          <Download size={16} />
          Download Excel
        </DownloadButton>
      </ControlsContainer>

      <LegendContainer>
        <LegendItem>
          <LegendColor color="#C6EFCE" />
          <span>Green &gt;90%</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FFA500" />
          <span>Orange 70% - 90%</span>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#FF0000" />
          <span>Red &lt;70%</span>
        </LegendItem>
      </LegendContainer>

      {/* ACSAT Summary - Only show when BU-wise View is active */}
      {processedData?.summary && grandTotals && groupByBU && (
        <SummaryContainer>
          <SummaryTitle>📊 ACSAT - Org level/BU wise % of 4,5 rater summary</SummaryTitle>
          
          {/* Org Level Summary */}
          <SummaryGrid>
            <SummaryCard>
              <SummaryCardTitle>🏆 Perspectives with % ≥ 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const above = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) >= 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return above.length > 0 ? (
                    above.map((perspective, index) => (
                    <PerspectiveItem key={index}>
                      <PerspectiveName>{perspective.name}</PerspectiveName>
                      <PerspectivePercentage percentage={perspective.percentage}>{perspective.percentage}%</PerspectivePercentage>
                    </PerspectiveItem>
                  ))
                ) : (
                  <PerspectiveItem>
                    <PerspectiveName>No perspectives above 70%</PerspectiveName>
                    <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                  </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardTitle>⚠️ Perspectives with % &lt; 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const below = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) < 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return below.length > 0 ? (
                    below.map((perspective, index) => (
                    <ConcernItem key={index}>
                      <ConcernName>{perspective.name}</ConcernName>
                      <ConcernPercentage>{perspective.percentage}%</ConcernPercentage>
                    </ConcernItem>
                  ))
                ) : (
                  <PerspectiveItem>
                      <PerspectiveName>No perspectives below 70%</PerspectiveName>
                    <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                  </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>
          </SummaryGrid>

          {/* BU Level Summary */}
          <BULevelContainer>
            <SummaryCardTitle>🏢 BU Level Summary</SummaryCardTitle>
            {Object.entries(processedData.summary.buLevel).map(([buName, buData]) => (
              <BUCard key={buName}>
                <BUName>{normalizeBusinessUnitDisplay(buName)}</BUName>
                <BUAnalysis>
                  <BUAnalysisItem>
                  <BUAnalysisTitle>Perspectives with % &lt; 70%</BUAnalysisTitle>
                    <BUAnalysisList>
                    {buData.below4 && buData.below4.length > 0 ? (
                      buData.below4.map((perspective, index) => (
                          <BUAnalysisText key={index} percentage={perspective.percentage}>
                            {perspective.name}: {perspective.percentage}%
                          </BUAnalysisText>
                        ))
                      ) : (
                        <BUAnalysisText percentage={0}>None</BUAnalysisText>
                      )}
                    </BUAnalysisList>
                  </BUAnalysisItem>
                  
                  <BUAnalysisItem>
                  <BUAnalysisTitle>Perspectives with % ≥ 70%</BUAnalysisTitle>
                    <BUAnalysisList>
                    {buData.above4 && buData.above4.length > 0 ? (
                      buData.above4.map((perspective, index) => (
                          <BUAnalysisText key={index} percentage={perspective.percentage}>
                            {perspective.name}: {perspective.percentage}%
                          </BUAnalysisText>
                        ))
                      ) : (
                        <BUAnalysisText percentage={0}>None</BUAnalysisText>
                      )}
                    </BUAnalysisList>
                  </BUAnalysisItem>
                </BUAnalysis>
                
                {/* Removed legacy Areas of Concern block to avoid undefined errors */}
              </BUCard>
            ))}
          </BULevelContainer>
        </SummaryContainer>
      )}

      {/* ACSAT Account-wise Summary - Only show when Account-wise View is active */}
      {processedData?.summary && grandTotals && !groupByBU && !showTop10 && (
        <SummaryContainer>
          <SummaryTitle>📊 ACSAT - Account level % of satisfied customers summary</SummaryTitle>
          
          <SummaryGrid>
            <SummaryCard>
              <SummaryCardTitle>🏆 Perspectives with % ≥ 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const above = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) >= 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return above.length > 0 ? (
                    above.map((perspective, index) => (
                    <PerspectiveItem key={index}>
                      <PerspectiveName>{perspective.name}</PerspectiveName>
                      <PerspectivePercentage percentage={perspective.percentage}>{perspective.percentage}%</PerspectivePercentage>
                    </PerspectiveItem>
                    ))
                  ) : (
                    <PerspectiveItem>
                      <PerspectiveName>No perspectives above 70%</PerspectiveName>
                      <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                    </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardTitle>⚠️ Perspectives with % &lt; 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const below = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) < 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return below.length > 0 ? (
                    below.map((perspective, index) => (
                      <PerspectiveItem key={index}>
                        <PerspectiveName>{perspective.name}</PerspectiveName>
                        <PerspectivePercentage percentage={perspective.percentage}>{perspective.percentage}%</PerspectivePercentage>
                      </PerspectiveItem>
                    ))
                  ) : (
                  <PerspectiveItem>
                    <PerspectiveName>No perspectives below 70%</PerspectiveName>
                    <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                  </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>
          </SummaryGrid>
        </SummaryContainer>
      )}

      {/* ACSAT Top 10 Summary - Only show when Top 10 view is active */}
      {processedData?.summary && grandTotals && showTop10 && (
        <SummaryContainer>
          <SummaryTitle>📊 ACSAT - Top 10 Account % of satisfied customers summary</SummaryTitle>
          
          <SummaryGrid>
            <SummaryCard>
              <SummaryCardTitle>🏆 Perspectives with % ≥ 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const above = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) >= 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return above.length > 0 ? (
                    above.map((perspective, index) => (
                      <PerspectiveItem key={index}>
                        <PerspectiveName>{perspective.name}</PerspectiveName>
                        <PerspectivePercentage percentage={perspective.percentage}>{perspective.percentage}%</PerspectivePercentage>
                      </PerspectiveItem>
                    ))
                  ) : (
                    <PerspectiveItem>
                      <PerspectiveName>No perspectives above 70%</PerspectiveName>
                      <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                    </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>

            <SummaryCard>
              <SummaryCardTitle>⚠️ Perspectives with % &lt; 70%</SummaryCardTitle>
              <PerspectiveList>
                {(() => {
                  const keys = [
                    'Meeting Delivery Commitments',
                    'Customer Engagement and Relationship',
                    'Partner adding value to Customer Business'
                  ];
                  const below = keys
                    .filter(k => (grandTotals.perspectives[k] || 0) < 70)
                    .map(k => ({ name: k, percentage: Math.round((grandTotals.perspectives[k] || 0) * 100) / 100 }));
                  return below.length > 0 ? (
                    below.map((perspective, index) => (
                      <PerspectiveItem key={index}>
                        <PerspectiveName>{perspective.name}</PerspectiveName>
                        <PerspectivePercentage percentage={perspective.percentage}>{perspective.percentage}%</PerspectivePercentage>
                      </PerspectiveItem>
                    ))
                  ) : (
                    <PerspectiveItem>
                      <PerspectiveName>No perspectives below 70%</PerspectiveName>
                      <PerspectivePercentage percentage={0}>-</PerspectivePercentage>
                    </PerspectiveItem>
                  );
                })()}
              </PerspectiveList>
            </SummaryCard>
          </SummaryGrid>
        </SummaryContainer>
      )}

      <TableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
              <TableHeaderCell 
                onClick={() => handleSort('businessUnit')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Business Unit
                {sortConfig.key === 'businessUnit' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              {!groupByBU && (
                <TableHeaderCell 
                  onClick={() => handleSort('customerName')}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                >
                  Account Name
                  {sortConfig.key === 'customerName' && (
                    <span style={{ marginLeft: '0.5rem' }}>
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHeaderCell>
              )}
              <TableHeaderCell 
                onClick={() => handleSort('cssSentCount')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Polled
                {sortConfig.key === 'cssSentCount' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              <TableHeaderCell 
                onClick={() => handleSort('cssReceivedCount')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Responded
                {sortConfig.key === 'cssReceivedCount' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              <TableHeaderCell 
                onClick={() => handleSort('Meeting Delivery Commitments')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Meeting Delivery Commitments (%)
                {sortConfig.key === 'Meeting Delivery Commitments' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              <TableHeaderCell 
                onClick={() => handleSort('Customer Engagement and Relationship')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Customer Engagement and Relationship (%)
                {sortConfig.key === 'Customer Engagement and Relationship' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              <TableHeaderCell 
                onClick={() => handleSort('Partner adding value to Customer Business')}
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                Partner adding value to Customer Business (%)
                {sortConfig.key === 'Partner adding value to Customer Business' && (
                  <span style={{ marginLeft: '0.5rem' }}>
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </TableHeaderCell>
              {showMainTrendColumns &&
                ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((perspective) => (
                  <TableHeaderCell
                    key={`main-trend-header-${perspective}`}
                    style={{
                      background: getMainTrendHeaderBackground(),
                      color: '#ffffff',
                    }}
                  >
                    {getSatisfiedMainTrendColumnLabel(perspective)}
                  </TableHeaderCell>
                ))}
            </tr>
          </TableHeader>
          <TableBody>
            {sortedData.map((group, index) => (
              <TableRow key={index}>
                <TableCell isFirstColumn>{index + 1}</TableCell>
                <TableCell>{normalizeBusinessUnitDisplay(group.businessUnit)}</TableCell>
                {!groupByBU && <TableCell>{group.customerName}</TableCell>}
                <TableCell isNumeric>{group.cssSentCount || 0}</TableCell>
                <TableCell isNumeric>{group.cssReceivedCount || 0}</TableCell>
                 <TableCell
                   isPercentage
                   isNumeric
                   value={group.perspectivePercentages?.['Meeting Delivery Commitments'] || '0.00'}
                   responded={group.perspectiveInputCounts?.['Meeting Delivery Commitments'] || 0}
                 >
                   {`${group.perspectivePercentages?.['Meeting Delivery Commitments'] || '0.00'}%`}
                 </TableCell>
                 <TableCell
                   isPercentage
                   isNumeric
                   value={group.perspectivePercentages?.['Customer Engagement and Relationship'] || '0.00'}
                   responded={group.perspectiveInputCounts?.['Customer Engagement and Relationship'] || 0}
                 >
                   {`${group.perspectivePercentages?.['Customer Engagement and Relationship'] || '0.00'}%`}
                 </TableCell>
                 <TableCell
                   isPercentage
                   isNumeric
                   value={group.perspectivePercentages?.['Partner adding value to Customer Business'] || '0.00'}
                   responded={group.perspectiveInputCounts?.['Partner adding value to Customer Business'] || 0}
                 >
                   {`${group.perspectivePercentages?.['Partner adding value to Customer Business'] || '0.00'}%`}
                 </TableCell>
                 {showMainTrendColumns &&
                   ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((perspective) => {
                     const display = getMainPerspectiveTrendDiffDisplay(group, perspective);
                     return (
                       <TableCell
                         key={`row-${index}-trend-${perspective}`}
                         isNumeric
                         style={{
                           textAlign: 'center',
                           fontWeight: 500,
                           background: getMainTrendRowCellBackground(false),
                         }}
                       >
                         {renderSatisfiedTrendDiffContent(display)}
                       </TableCell>
                     );
                   })}
              </TableRow>
            ))}
            {/* Grand Total Row */}
            {grandTotals && (
              <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                <TableCell isFirstColumn style={{ fontWeight: 'bold', color: '#000000' }}></TableCell>
                <TableCell style={{ fontWeight: 'bold', color: '#000000' }}>{groupByBU ? 'Org Level' : (showTop10 ? 'Top 10 Accounts' : 'Grand Total')}</TableCell>
                {!groupByBU && <TableCell style={{ fontWeight: 'bold', color: '#000000' }}>-</TableCell>}
                <TableCell isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>{grandTotals.cssSentCount}</TableCell>
                <TableCell isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>{grandTotals.cssReceivedCount}</TableCell>
                <TableCell isPercentage isNumeric value={grandTotals.perspectives['Meeting Delivery Commitments']} responded={grandTotals.perspectiveInputTotals?.['Meeting Delivery Commitments'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
                  {grandTotals.perspectives['Meeting Delivery Commitments']}%
                </TableCell>
                <TableCell isPercentage isNumeric value={grandTotals.perspectives['Customer Engagement and Relationship']} responded={grandTotals.perspectiveInputTotals?.['Customer Engagement and Relationship'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
                  {grandTotals.perspectives['Customer Engagement and Relationship']}%
                </TableCell>
                <TableCell isPercentage isNumeric value={grandTotals.perspectives['Partner adding value to Customer Business']} responded={grandTotals.perspectiveInputTotals?.['Partner adding value to Customer Business'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
                  {grandTotals.perspectives['Partner adding value to Customer Business']}%
                </TableCell>
                {showMainTrendColumns &&
                  ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((perspective) => {
                    const display = getMainGrandTotalTrendDiffDisplay(perspective);
                    return (
                      <TableCell
                        key={`main-gt-trend-${perspective}`}
                        isNumeric
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          background: '#e2e8f0',
                        }}
                      >
                        {renderSatisfiedTrendDiffContent(display)}
                      </TableCell>
                    );
                  })}
              </TableRow>
            )}
        {/* Other Account Row - only for Top 10 view */}
        {showTop10 && otherAccountTotals && (
          <TableRow style={{ backgroundColor: '#fff7ed', fontWeight: 'bold', borderTop: '2px solid #f59e0b' }}>
            <TableCell isFirstColumn style={{ fontWeight: 'bold', color: '#000000' }}></TableCell>
            <TableCell style={{ fontWeight: 'bold', color: '#000000' }}>Other Accounts</TableCell>
            {!groupByBU && <TableCell style={{ fontWeight: 'bold', color: '#000000' }}>-</TableCell>}
            <TableCell isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>{otherAccountTotals.cssSentCount}</TableCell>
            <TableCell isNumeric style={{ fontWeight: 'bold', color: '#000000' }}>{otherAccountTotals.cssReceivedCount}</TableCell>
            <TableCell isPercentage isNumeric value={otherAccountTotals.perspectives['Meeting Delivery Commitments']} responded={otherAccountTotals.perspectiveInputTotals?.['Meeting Delivery Commitments'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
              {otherAccountTotals.perspectives['Meeting Delivery Commitments']}%
            </TableCell>
            <TableCell isPercentage isNumeric value={otherAccountTotals.perspectives['Customer Engagement and Relationship']} responded={otherAccountTotals.perspectiveInputTotals?.['Customer Engagement and Relationship'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
              {otherAccountTotals.perspectives['Customer Engagement and Relationship']}%
            </TableCell>
            <TableCell isPercentage isNumeric value={otherAccountTotals.perspectives['Partner adding value to Customer Business']} responded={otherAccountTotals.perspectiveInputTotals?.['Partner adding value to Customer Business'] || 0} style={{ fontWeight: 'bold', color: '#000000' }}>
              {otherAccountTotals.perspectives['Partner adding value to Customer Business']}%
            </TableCell>
            {showTop10MainTrendColumns &&
              ACSAT_SATISFIED_TARGET_PERSPECTIVES.map((perspective) => {
                const display = getTop10OtherAccountsTrendDiffDisplay(perspective);
                return (
                  <TableCell
                    key={`other-trend-${perspective}`}
                    isNumeric
                    style={{ textAlign: 'center', fontWeight: 'bold', background: '#fff7ed' }}
                  >
                    {renderSatisfiedTrendDiffContent(display)}
                  </TableCell>
                );
              })}
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollIndicator>
          ← Scroll horizontally to see all columns →
        </ScrollIndicator>
      </TableContainer>

      {isBuWiseSatisfiedView && showAcsatTrendAnalysis && (
        <div ref={acsatTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: BU Wise % of 4,5 Rater Trend Analysis (from uploaded trend files)
            </div>
            <DownloadButton
              onClick={downloadBuWiseSatisfiedTrendExcel}
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
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-bu-sc-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{ fontWeight: 600, color: '#4338ca', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
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
                            <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
                            <TableHeaderCell>Business Unit</TableHeaderCell>
                            <TableHeaderCell>Polled</TableHeaderCell>
                            <TableHeaderCell>Responded</TableHeaderCell>
                            {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                              <TableHeaderCell key={`${fileData.saveName}-bu-hdr-${perspective}`}>
                                {perspective} (%)
                              </TableHeaderCell>
                            ))}
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-bu-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`${rowIdx}-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={row.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={row.perspectiveInputCounts?.[perspective] || 0}
                                >
                                  {`${row.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn></TableCell>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Org Level'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.polled ?? 0}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.responded ?? 0}
                              </TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`bu-gt-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={fileData.grandTotal.perspectiveInputCounts?.[perspective] || 0}
                                  style={{ fontWeight: 'bold' }}
                                >
                                  {`${fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isAccountWiseSatisfiedView && showAcsatTrendAnalysis && (
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
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: Account Wise % of 4,5 Rater Trend Analysis (from uploaded trend files)
            </div>
            <DownloadButton
              onClick={downloadAccountWiseSatisfiedTrendExcel}
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
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-sc-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
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
                            <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
                            <TableHeaderCell>Business Unit</TableHeaderCell>
                            <TableHeaderCell>Account Name</TableHeaderCell>
                            {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                              <TableHeaderCell key={`${fileData.saveName}-hdr-${perspective}`}>
                                {perspective} (%)
                              </TableHeaderCell>
                            ))}
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell>{row.customerName}</TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`${rowIdx}-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={row.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={row.perspectiveInputCounts?.[perspective] || 0}
                                >
                                  {`${row.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn></TableCell>
                              <TableCell></TableCell>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Grand Total'}
                              </TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`gt-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={fileData.grandTotal.perspectiveInputCounts?.[perspective] || 0}
                                  style={{ fontWeight: 'bold' }}
                                >
                                  {`${fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isTop10SatisfiedView && showAcsatTrendAnalysis && (
        <div ref={acsatTrendSectionRef} style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 600,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              ACSAT: Top 10 Account % of 4,5 Rater Trend Analysis (from uploaded trend files)
            </div>
            <DownloadButton
              onClick={downloadTop10SatisfiedTrendExcel}
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
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-top10-sc-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{ fontWeight: 600, color: '#b45309', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
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
                            <TableHeaderCell isFirstColumn>Sr. No.</TableHeaderCell>
                            <TableHeaderCell>Business Unit</TableHeaderCell>
                            <TableHeaderCell>Account Name</TableHeaderCell>
                            <TableHeaderCell>Polled</TableHeaderCell>
                            <TableHeaderCell>Responded</TableHeaderCell>
                            {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                              <TableHeaderCell key={`${fileData.saveName}-top10-hdr-${perspective}`}>
                                {perspective} (%)
                              </TableHeaderCell>
                            ))}
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-top10-trend-${rowIdx}`}>
                              <TableCell isFirstColumn>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              <TableCell>{row.customerName}</TableCell>
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`${rowIdx}-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={row.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={row.perspectiveInputCounts?.[perspective] || 0}
                                >
                                  {`${row.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <TableRow style={{ backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>
                              <TableCell isFirstColumn></TableCell>
                              <TableCell></TableCell>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.customerName || 'Top 10 Accounts'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.polled ?? 0}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.grandTotal.responded ?? 0}
                              </TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`top10-gt-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={fileData.grandTotal.perspectiveInputCounts?.[perspective] || 0}
                                  style={{ fontWeight: 'bold' }}
                                >
                                  {`${fileData.grandTotal.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                          {fileData.otherAccountsRow && (
                            <TableRow style={{ backgroundColor: '#fff7ed', fontWeight: 'bold', borderTop: '2px solid #f59e0b' }}>
                              <TableCell isFirstColumn></TableCell>
                              <TableCell></TableCell>
                              <TableCell style={{ fontWeight: 'bold' }}>
                                {fileData.otherAccountsRow.customerName || 'Other Accounts'}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.otherAccountsRow.polled ?? 0}
                              </TableCell>
                              <TableCell isNumeric style={{ fontWeight: 'bold' }}>
                                {fileData.otherAccountsRow.responded ?? 0}
                              </TableCell>
                              {(fileData.perspectives || ACSAT_SATISFIED_TARGET_PERSPECTIVES).map((perspective) => (
                                <TableCell
                                  key={`top10-other-${perspective}`}
                                  isPercentage
                                  isNumeric
                                  value={fileData.otherAccountsRow.perspectivePercentages?.[perspective] || '0.00'}
                                  responded={fileData.otherAccountsRow.perspectiveInputCounts?.[perspective] || 0}
                                  style={{ fontWeight: 'bold' }}
                                >
                                  {`${fileData.otherAccountsRow.perspectivePercentages?.[perspective] || '0.00'}%`}
                                </TableCell>
                              ))}
                            </TableRow>
                          )}
                        </TableBody>
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
};

export default ACSATCountDashboard;
