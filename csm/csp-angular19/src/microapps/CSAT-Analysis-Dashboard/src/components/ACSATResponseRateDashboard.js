import React, { useState, useEffect, useMemo, useRef } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft, Search, X, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { normalizeBusinessUnitDisplay } from '../utils/normalizeBusinessUnitDisplay';
import { parseExcelDateToMMDDYYYY } from '../utils/acsatExcelRowUtils';

const DashboardContainer = styled.div`
  max-width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
`;

const BackButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
`;

const TrendAnalysisButton = styled.button`
  background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
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

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.35);
  }
`;

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

const buildTrendAccountLookup = (fileData) => {
  const byId = {};
  const byName = {};
  (fileData?.rows || []).forEach((r) => {
    const id = normalizeCustomerIdKey(r.customerId);
    if (id) byId[id] = r;
    const name = (r.customerName || '').trim().toLowerCase();
    if (name) byName[name] = r;
  });
  return { byId, byName };
};

const getTrendRowForAccount = (lookup, accountRow) => {
  if (!lookup) return null;
  const id = normalizeCustomerIdKey(accountRow?.customerId);
  if (id && lookup.byId[id]) return lookup.byId[id];
  const name = (accountRow?.customerName || '').trim().toLowerCase();
  if (name && lookup.byName[name]) return lookup.byName[name];
  return null;
};

const buildTrendBuLookup = (fileData) => {
  const map = {};
  (fileData?.rows || []).forEach((r) => {
    const key = normalizeBusinessUnitDisplay(r.businessUnit) || (r.businessUnit || '').trim();
    if (key) map[key] = r;
  });
  return map;
};

const getTrendRowForBu = (lookup, buRow) => {
  if (!lookup) return null;
  const key = normalizeBusinessUnitDisplay(buRow?.businessUnit);
  return key ? lookup[key] || null : null;
};

const getTrendRowForDashboard = (fileIdx, row, groupByBU, accountLookups, buLookups) =>
  groupByBU
    ? getTrendRowForBu(buLookups[fileIdx], row)
    : getTrendRowForAccount(accountLookups[fileIdx], row);

const roundResponseRateOneDecimal = (rate) => Math.round((rate ?? 0) * 10) / 10;

const computeResponseRateTrendDiff = (dashboardRate, trendRow) => {
  if (!trendRow) return null;
  const dashRate = roundResponseRateOneDecimal(dashboardRate);
  const trendRate = roundResponseRateOneDecimal(trendRow.responseRatePct);
  return roundResponseRateOneDecimal(dashRate - trendRate);
};

const formatResponseRateTrendDiffDisplay = (diff) => {
  if (diff == null) return { text: '-', color: '#6b7280' };
  if (diff > 0) return { text: `(+${diff.toFixed(1)}%) ↑`, color: '#16a34a' };
  if (diff < 0) return { text: `(${diff.toFixed(1)}%) ↓`, color: '#dc2626' };
  return { text: '(0%) −', color: '#374151' };
};

const trendColumnHeaderLabel = (fileData, fileCount) => {
  if (fileCount <= 1) return 'Trend for Response Rate %';
  const name = (fileData?.saveName || 'Trend file').replace(/\.[^.]+$/, '');
  return `Trend for Response Rate % (${name})`;
};

const styleTrendAnalysisResponseRateExcelCell = (cell, rate, responded) => {
  const rateVal = responded === 0 ? 0 : roundResponseRateOneDecimal(rate);
  cell.value = rateVal;
  cell.numFmt = '0.0"%"';
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  if (responded === 0 || rateVal === 0) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  } else if (rateVal >= 75) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
    cell.font = { color: { argb: 'FF000000' }, bold: true };
  } else if (rateVal >= 50) {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
    cell.font = { color: { argb: 'FF000000' }, bold: true };
  } else {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
  }
};

const styleTrendDiffExcelCell = (cell, diff) => {
  const display = formatResponseRateTrendDiffDisplay(diff);
  cell.value = display.text;
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  if (diff != null && diff > 0) {
    cell.font = { bold: true, color: { argb: 'FF16A34A' } };
  } else if (diff != null && diff < 0) {
    cell.font = { bold: true, color: { argb: 'FFDC2626' } };
  } else {
    cell.font = { color: { argb: 'FF374151' }, bold: true };
  }
};

const ACSAT_BU_DISPLAY_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];

const sortBuTrendRows = (rows) => {
  return [...rows].sort((a, b) => {
    const aBU = (a.businessUnit || '').toString().trim();
    const bBU = (b.businessUnit || '').toString().trim();
    const aIndex = ACSAT_BU_DISPLAY_ORDER.findIndex((bu) => bu.toLowerCase() === aBU.toLowerCase());
    const bIndex = ACSAT_BU_DISPLAY_ORDER.findIndex((bu) => bu.toLowerCase() === bBU.toLowerCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return aBU.localeCompare(bBU);
  });
};

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

const isTop10DashboardAccount = (row, top10AccountNames, typeOfAccountMap = {}) => {
  const customerName = (row?.customerName ?? '').toString().trim();
  if (top10AccountNames.some((name) => matchesTop10AccountName(customerName, name))) {
    return true;
  }
  const mappedType = typeOfAccountMap[customerName];
  return isTop10TypeOfAccount(mappedType);
};

const sortTop10TrendRows = (rows, top10AccountNames = []) => {
  return [...rows].sort((a, b) => {
    const aIndex = getTop10AccountSortIndex(a.customerName, top10AccountNames);
    const bIndex = getTop10AccountSortIndex(b.customerName, top10AccountNames);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return (a.customerName || '').localeCompare(b.customerName || '');
  });
};

const buildResponseRateTrendFromFile = (file, { groupBy = 'account', top10AccountNames = [] } = {}) => {
  const sheetNames = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
  const sheetName = findAcsatSentReceivedSheetName(sheetNames);
  const data = sheetName ? (file.sheets?.[sheetName] || []) : [];

  if (!data.length) {
    return {
      saveName: file.saveName || file.originalName || 'Trend file',
      rows: [],
      grandTotal: null,
      otherAccountsRow: null,
      hasData: false,
      groupBy,
      error: 'CSAT sent and received Report sheet not found or empty in uploaded trend file.',
    };
  }

  const firstRow = data[0] || {};
  const buCol = findSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'businessunit',
      (k) => k.toLowerCase().includes('business unit'),
    ],
    'BUSINESS UNIT'
  );
  const custNameCol = findSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customername',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custnm',
      (k) => k.toLowerCase() === 'cust_nm',
    ],
    'CUSTOMER NAME'
  );
  const custIdCol = findSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'customerid',
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'custid',
    ],
    'CUSTOMER_ID'
  );
  const sentDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = k.toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatsentdate') || (kn.includes('sent') && kn.includes('date') && !kn.includes('received'));
      },
    ],
    'CSAT SENT DATE'
  );
  const receivedDateCol = findSheetColumn(
    firstRow,
    [
      (k) => {
        const kn = k.toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('csatreceiveddate') || (kn.includes('received') && kn.includes('date'));
      },
    ],
    'CSAT RECEIVED DATE'
  );
  const typeOfAccountCol = findSheetColumn(
    firstRow,
    [
      (k) => k.toLowerCase().replace(/[\s_]/g, '') === 'typeofaccount',
      (k) => {
        const kn = k.toLowerCase().replace(/[\s_]/g, '');
        return kn.includes('type') && kn.includes('account');
      },
    ],
    'TYPE OF ACCOUNT'
  );

  const groups = new Map();
  let otherAccountsPolled = 0;
  let otherAccountsResponded = 0;

  const ensureGroup = (key, meta) => {
    if (!groups.has(key)) {
      groups.set(key, {
        customerId: meta.customerId || '',
        businessUnit: meta.businessUnit,
        customerName: meta.customerName || '',
        polled: 0,
        responded: 0,
      });
    }
    return groups.get(key);
  };

  data.forEach((row) => {
    const businessUnit = normalizeBusinessUnitDisplay(
      getTrendRowValue(row, buCol, 'BUSINESS UNIT').toString().trim() || 'N/A'
    );

    if (groupBy === 'bu') {
      const groupKey = businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A';
      const agg = ensureGroup(groupKey, { businessUnit: groupKey });
      if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'))) {
        agg.polled += 1;
      }
      if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'))) {
        agg.responded += 1;
      }
      return;
    }

    if (groupBy === 'top10') {
      const typeOfAccount = getTrendRowValue(row, typeOfAccountCol, 'TYPE OF ACCOUNT').toString().trim();
      if (isBlankEmptyOrNaTypeOfAccount(typeOfAccount)) {
        if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'))) {
          otherAccountsPolled += 1;
        }
        if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'))) {
          otherAccountsResponded += 1;
        }
        return;
      }
      if (!isTop10TypeOfAccount(typeOfAccount)) return;
    }

    const customerId = normalizeCustomerIdKey(
      getTrendRowValue(row, custIdCol, 'CUSTOMER_ID', 'CUST_ID').toString().trim()
    );
    const customerName = getTrendRowValue(row, custNameCol, 'CUSTOMER NAME', 'CUST_NM').toString().trim();
    const groupKey = customerId || customerName;
    if (!groupKey) return;

    const agg = ensureGroup(groupKey, {
      customerId: customerId || '',
      businessUnit: businessUnit && businessUnit !== 'N/A' ? businessUnit : 'N/A',
      customerName: customerName || groupKey,
    });

    if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, sentDateCol, 'CSAT SENT DATE'))) {
      agg.polled += 1;
    }
    if (parseExcelDateToMMDDYYYY(getTrendRowValue(row, receivedDateCol, 'CSAT RECEIVED DATE'))) {
      agg.responded += 1;
    }
  });

  const mappedRows = Array.from(groups.values()).map((g) => ({
    ...g,
    responseRatePct: g.polled > 0 ? (g.responded / g.polled) * 100 : 0,
  }));

  const rows =
    groupBy === 'bu'
      ? sortBuTrendRows(mappedRows)
      : groupBy === 'top10'
        ? sortTop10TrendRows(mappedRows, top10AccountNames)
        : mappedRows.sort((a, b) => (a.customerName || '').localeCompare(b.customerName || ''));

  const totalPolled = rows.reduce((s, r) => s + (r.polled || 0), 0);
  const totalResponded = rows.reduce((s, r) => s + (r.responded || 0), 0);
  const grandTotal =
    groupBy === 'bu'
      ? {
          businessUnit: 'Org Level',
          customerName: '',
          polled: totalPolled,
          responded: totalResponded,
          responseRatePct: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : 0,
        }
      : groupBy === 'top10'
        ? {
            businessUnit: '',
            customerName: 'Top 10 Accounts',
            polled: totalPolled,
            responded: totalResponded,
            responseRatePct: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : 0,
          }
        : {
            businessUnit: '',
            customerName: 'Grand Total',
            polled: totalPolled,
            responded: totalResponded,
            responseRatePct: totalPolled > 0 ? (totalResponded / totalPolled) * 100 : 0,
          };

  const otherAccountsRow =
    groupBy === 'top10'
      ? {
          businessUnit: '',
          customerName: 'Other Accounts',
          polled: otherAccountsPolled,
          responded: otherAccountsResponded,
          responseRatePct:
            otherAccountsPolled > 0 ? (otherAccountsResponded / otherAccountsPolled) * 100 : 0,
        }
      : null;

  const emptyError =
    groupBy === 'bu'
      ? 'No BU trend rows found in CSAT sent and received Report.'
      : groupBy === 'top10'
        ? 'No Top 10 account trend rows found (TYPE OF ACCOUNT = Top 10) in CSAT sent and received Report.'
        : 'No account trend rows found in CSAT sent and received Report.';

  return {
    saveName: file.saveName || file.originalName || 'Trend file',
    rows,
    grandTotal,
    otherAccountsRow,
    hasData: rows.length > 0,
    groupBy,
    error: rows.length === 0 ? emptyError : null,
  };
};

const Top10Button = styled.button`
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const BUWiseButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
`;

const ShowAllButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
`;

const CXOAnalysisButton = styled.button`
  background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
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
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(236, 72, 153, 0.3);
  }
`;

const SuccessMessage = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #166534;
  font-weight: 500;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #dc2626;
  font-weight: 500;
  text-align: center;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-top: 2rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 2px solid #6b7280;
`;

const TableHeader = styled.thead`
  background: #1e3a8a;
  color: white;
`;

const TableHeaderCell = styled.th`
  padding: 1rem 0.75rem;
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  border: 1px solid #ffffff;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: #1e40af;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9fafb;
  }
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  color: #374151;
`;

const TrendDiffCell = styled.td`
  padding: 0.75rem;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.diffColor || '#374151'};
  background: #ffffff;
`;

const ResponseRateCell = styled.td`
  padding: 0.75rem;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#ffffff'; // White text for zero Response %
    if (props.rate >= 75) return '#000000'; // Black text for Green >=75%
    if (props.rate >= 50 && props.rate < 75) return '#000000'; // Black text for Orange 50%-75%
    return '#ffffff'; // White text for Red <50%
  }};
  background: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#FF0000'; // Red for zero Response %
    if (props.rate >= 75) return '#C6EFCE'; // Green >=75% (Excel standard)
    if (props.rate >= 50 && props.rate < 75) return '#FFA500'; // Orange 50%-75% (Excel standard)
    return '#FF0000'; // Red <50% (Excel standard)
  }};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 1.125rem;
`;

const ScrollableTableContainer = styled.div`
  overflow: auto;
  max-height: 70vh;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const FormulaContainer = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
`;

const FormulaTitle = styled.h3`
  color: #374151;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
`;

const FormulaText = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SearchInput = styled.input`
  width: 200px;
  padding: 0.5rem;
  border: 1px solid #6b7280;
  border-radius: 6px;
  font-size: 0.875rem;
  
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
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #dc2626;
  }
`;

const SortableHeader = styled.th`
  padding: 1rem 0.75rem;
  text-align: center;
  vertical-align: middle;
  font-weight: bold;
  border: 1px solid #9ca3af;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.875rem;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    background: #1e40af;
  }
`;

const SortIcon = styled.span`
  margin-left: 0.5rem;
  font-size: 0.75rem;
`;

const GrandTotalRow = styled.tr`
  background: #f8fafc;
  font-weight: bold;
  border-top: 2px solid #3b82f6;
`;

const GrandTotalCell = styled.td`
  padding: 0.75rem;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: bold;
  color: #000000;
  background: #f8fafc;
`;

const GrandTotalResponseRateCell = styled.td`
  padding: 0.75rem;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: bold;
  color: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#ffffff'; // White text for zero Response %
    if (props.rate >= 75) return '#000000'; // Black text for Green >=75%
    if (props.rate >= 50 && props.rate < 75) return '#000000'; // Black text for Orange 50%-75%
    return '#ffffff'; // White text for Red <50%
  }};
  background: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#FF0000'; // Red for zero Response %
    if (props.rate >= 75) return '#C6EFCE'; // Green >=75% (Excel standard)
    if (props.rate >= 50 && props.rate < 75) return '#FFA500'; // Orange 50%-75% (Excel standard)
    return '#FF0000'; // Red <50% (Excel standard)
  }};
`;

const OtherAccountRow = styled.tr`
  background: #fff7ed;
  font-weight: bold;
  border-top: 2px solid #f59e0b;
`;

const OtherAccountCell = styled.td`
  padding: 0.75rem;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: bold;
  color: #000000;
  background: #fed7aa;
`;

const OtherAccountResponseRateCell = styled.td`
  padding: 0.75rem;
  text-align: center;
  vertical-align: middle;
  border: 1px solid #6b7280;
  font-size: 0.875rem;
  font-weight: bold;
  color: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#ffffff'; // White text for zero Response %
    if (props.rate >= 75) return '#000000'; // Black text for Green >=75%
    if (props.rate >= 50 && props.rate < 75) return '#000000'; // Black text for Orange 50%-75%
    return '#ffffff'; // White text for Red <50%
  }};
  background: ${props => {
    if (props.surveysReceived === 0 || props.rate === 0) return '#FF0000'; // Red for zero Response %
    if (props.rate >= 75) return '#C6EFCE'; // Green >=75% (Excel standard)
    if (props.rate >= 50 && props.rate < 75) return '#FFA500'; // Orange 50%-75% (Excel standard)
    return '#FF0000'; // Red <50% (Excel standard)
  }};
`;

const LegendContainer = styled.div`
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  padding: 1rem;
  margin: 1rem 0;
`;

const LegendTitle = styled.h3`
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const LegendColor = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  margin-right: 0.75rem;
  border: 1px solid #6b7280;
`;

const LegendText = styled.span`
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
`;

const ACSATResponseRateDashboard = ({
  excelData,
  acsatCycleStartDate,
  acsatCycleStartDateFormatted,
  acsatCycle,
  trendAnalysisFiles = [],
  onBack,
}) => {
  const [processedData, setProcessedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showTop10, setShowTop10] = useState(false);
  const [groupByBU, setGroupByBU] = useState(false);
  const [showCXOAnalysis, setShowCXOAnalysis] = useState(false);
  const [showAcsatTrendAnalysis, setShowAcsatTrendAnalysis] = useState(false);
  const acsatTrendSectionRef = useRef(null);
  const [typeOfAccountMap, setTypeOfAccountMap] = useState({}); // Map customerName -> typeOfAccount
  const [rawSecondSheetData, setRawSecondSheetData] = useState(null); // Store raw data and column indices from second sheet
  const [firstSheetData, setFirstSheetData] = useState(null); // Store data from "CSAT received Report" sheet
  
  // Use the prop that's passed from App.js
  const cycleStartDateFormatted = acsatCycleStartDateFormatted;

  // Top 10 account names in order (aligned with Account/BU wise Response Rate dashboard)
  const top10AccountNames = [
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
    'AgileOne',
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

  // Helper function to check if date is on or after CSAT cycle start date (same logic as NPS Dashboard)
  const isDateOnOrAfterCycleStart = (dateValue, cycleStartDate) => {
    if (!dateValue || !cycleStartDate) {
      console.log('Missing date value or cycle start date:', { dateValue, cycleStartDate });
      return false;
    }
    
    try {
      // Parse the date value (could be string, number, or Date object)
      let dateToCheck;
      if (typeof dateValue === 'string') {
        // Clean the string
        const cleanDate = dateValue.toString().trim();
        
        // Try different date formats
        if (cleanDate.includes('/')) {
          // MM/DD/YYYY format
          const [month, day, year] = cleanDate.split('/');
          dateToCheck = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else if (cleanDate.includes('-')) {
          // Handle different dash-separated formats
          const parts = cleanDate.split('-');
          
          if (parts[0].length === 4) {
            // YYYY-MM-DD format
            dateToCheck = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          } else if (parts.length === 3) {
            // Check if it's DD-MMM-YYYY format (like "28-Jul-2025")
            const monthNames = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            
            if (parts[1] in monthNames) {
              // DD-MMM-YYYY format
              const day = parseInt(parts[0]);
              const month = monthNames[parts[1]];
              const year = parseInt(parts[2]);
              dateToCheck = new Date(year, month, day);
            } else if (parts[0].length === 2 && parts[1].length === 2) {
              // MM-DD-YYYY format
              dateToCheck = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
          } else {
              // Try parsing as regular date
              dateToCheck = new Date(cleanDate);
            }
          } else {
            // Try parsing as regular date
            dateToCheck = new Date(cleanDate);
          }
        } else {
          // Try parsing as regular date
          dateToCheck = new Date(cleanDate);
        }
      } else if (typeof dateValue === 'number') {
        // Excel serial date
        dateToCheck = new Date((dateValue - 25569) * 86400 * 1000);
      } else {
        dateToCheck = new Date(dateValue);
      }
      
      // Parse cycle start date (MM-DD-YYYY format)
      const [month, day, year] = cycleStartDate.split('-');
      const cycleStart = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Validate MM-DD-YYYY format for cycle start date
      if (month.length !== 2 || day.length !== 2 || year.length !== 4) {
        console.error('Invalid cycle start date format. Expected MM-DD-YYYY, got:', cycleStartDate);
        return false;
      }
      
      // Check if date is valid
      if (isNaN(dateToCheck.getTime()) || isNaN(cycleStart.getTime())) {
        console.log('Invalid date:', { 
          originalValue: dateValue, 
          parsedDate: dateToCheck, 
          cycleStartDate: cycleStartDate,
          parsedCycleStart: cycleStart 
        });
        return false;
      }
      
      const result = dateToCheck >= cycleStart;
      
      // Only log for debugging when needed (commented out to reduce console noise)
      // console.log('Date comparison:', {
      //   originalValue: dateValue,
      //   parsedDate: isNaN(dateToCheck.getTime()) ? 'Invalid Date' : dateToCheck.toDateString(),
      //   cycleStartDate: cycleStartDate,
      //   parsedCycleStart: cycleStart.toDateString(),
      //   result: result
      // });
      
      return result;
    } catch (error) {
      console.error('Error parsing date:', { dateValue, cycleStartDate, error });
      return false;
    }
  };

  useEffect(() => {
    const processExcelData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!excelData) {
          throw new Error('No Excel data available');
        }

        // Look for the "CSAT sent and received Report" sheet - use flexible matching like AccountLevelRatingDashboard
        let worksheet;
        let targetSheetName;
        
        // Try to find the sheet using flexible matching
        const possibleSheetNames = excelData.SheetNames || [];
        console.log('📋 Available sheets:', possibleSheetNames);
        
        targetSheetName = possibleSheetNames.find(name => 
          name.toLowerCase().includes('csat sent and received') ||
          name.toLowerCase().includes('sent and received report') ||
          name.toLowerCase().includes('sent and received') ||
          name.toLowerCase() === 'sheet2'
        );

        if (targetSheetName) {
          console.log('✅ Found target sheet:', targetSheetName);
          worksheet = excelData.Sheets[targetSheetName];
        }

        if (!worksheet) {
          const availableSheets = excelData.SheetNames ? excelData.SheetNames.join(', ') : 'No sheets found';
          throw new Error(`Sheet "CSAT sent and received Report" not found in the Excel file. Available sheets: ${availableSheets}`);
        }
        
        console.log('✅ Using sheet:', targetSheetName);

        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          throw new Error('No data found in the CSAT sent and received Report sheet');
        }

        // Find column indices
        const headerRow = jsonData[0];
        console.log('Available columns in header row:', headerRow);
        console.log('Header row length:', headerRow.length);
        
        const businessUnitIndex = headerRow.findIndex(header => 
          header && header.toString().toLowerCase().includes('business unit')
        );
        
        const customerIdIndex = headerRow.findIndex(header => 
          header && (
            header.toString().toLowerCase().includes('customer_id') || 
                    header.toString().toLowerCase().includes('cust_id') ||
            header.toString().toLowerCase().includes('customer id') ||
            header.toString().toLowerCase() === 'c_id'
          )
        );
        
        const customerNameIndex = headerRow.findIndex(header => 
          header && (
            header.toString().toLowerCase().includes('customer name') ||
                    header.toString().toLowerCase().includes('customer_name') ||
            header.toString().toLowerCase().includes('cust_nm')
          )
        );
        
        const yearQuarterIndex = headerRow.findIndex(header => 
          header && (
            header.toString().toLowerCase().includes('year') && 
            header.toString().toLowerCase().includes('quarter')
          ) || header && header.toString().toLowerCase().includes('year - quarter')
        );
        
        console.log('Year Quarter index:', yearQuarterIndex);
        if (yearQuarterIndex !== -1) {
          console.log('✅ Year-Quarter column found:', headerRow[yearQuarterIndex]);
        } else {
          console.warn('⚠️ Year-Quarter column not found');
        }
        const sentDateIndex = headerRow.findIndex(header => 
          header && (header.toString().toLowerCase().includes('csat sent date') ||
                    header.toString().toLowerCase().includes('csat_sent_date') ||
                    header.toString().toLowerCase().includes('css sent date') ||
                    header.toString().toLowerCase().includes('css_sent_date'))
        );
        console.log('🔍 Searching for SENT DATE column in:', headerRow, 'Found at index:', sentDateIndex);
        
        const receivedDateIndex = headerRow.findIndex(header => 
          header && (header.toString().toLowerCase().includes('csat received date') ||
                    header.toString().toLowerCase().includes('csat_received_date') ||
                    header.toString().toLowerCase().includes('css received date') ||
                    header.toString().toLowerCase().includes('css_received_date'))
        );
        console.log('🔍 Searching for RECEIVED DATE column in:', headerRow, 'Found at index:', receivedDateIndex);
        
        // Find TYPE OF ACCOUNT column in the second sheet
        const typeOfAccountIndex = headerRow.findIndex(header => 
          header && (
            header.toString().toLowerCase().includes('type of account') ||
            header.toString().toLowerCase().includes('typeofaccount') ||
            header.toString().toLowerCase().includes('account type') ||
            header.toString().toLowerCase().includes('type_of_account')
          )
        );
        if (typeOfAccountIndex !== -1) {
          console.log('✅ Found TYPE OF ACCOUNT column in second sheet at index:', typeOfAccountIndex, 'Column name:', headerRow[typeOfAccountIndex]);
        } else {
          console.log('⚠️ TYPE OF ACCOUNT column not found in second sheet - will use mapping from first sheet');
        }

        console.log('Column indices:', {
          businessUnitIndex,
          customerIdIndex,
          customerNameIndex,
          sentDateIndex,
          receivedDateIndex,
          headerRow: headerRow
        });
        
        // Additional debug logging for column names found
        if (businessUnitIndex !== -1) {
          console.log('✅ BUSINESS UNIT column found:', headerRow[businessUnitIndex]);
        }
        if (customerIdIndex !== -1) {
          console.log('✅ CUSTOMER_ID column found:', headerRow[customerIdIndex]);
        }
        if (customerNameIndex !== -1) {
          console.log('✅ CUSTOMER NAME column found:', headerRow[customerNameIndex]);
        }

        // Check which required columns are missing
        const missingColumns = [];
        if (businessUnitIndex === -1) missingColumns.push('BUSINESS UNIT');
        if (customerIdIndex === -1) missingColumns.push('CUSTOMER_ID or CUST_ID');
        if (customerNameIndex === -1) missingColumns.push('CUSTOMER NAME or CUST_NM');

        if (missingColumns.length > 0) {
          throw new Error(`Required columns not found in the Excel file: ${missingColumns.join(', ')}. Available columns: ${headerRow.join(', ')}`);
        }

        // Check for date columns (these might be optional)
        if (sentDateIndex === -1) {
          console.warn('❌ CSAT/CSS SENT DATE column not found - surveys sent count will be 0');
          console.warn('Available columns:', headerRow);
        } else {
          console.log('✅ Found SENT DATE column at index:', sentDateIndex, 'Column name:', headerRow[sentDateIndex]);
        }
        if (receivedDateIndex === -1) {
          console.warn('❌ CSAT RECEIVED DATE column not found - surveys received count will be 0');
          console.warn('Available columns:', headerRow);
        } else {
          console.log('✅ Found RECEIVED DATE column at index:', receivedDateIndex, 'Column name:', headerRow[receivedDateIndex]);
        }

        // Process data rows
        const dataRows = jsonData.slice(1);
        const groupedData = {};
        let customerCounter = 1;

        dataRows.forEach((row, rowIndex) => {
          const customerId = row[customerIdIndex];
          const customerName = row[customerNameIndex];
          const rawBusinessUnit = row[businessUnitIndex];
          const businessUnit = rawBusinessUnit ? normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim()) : '';
          const sentDate = row[sentDateIndex];
          const receivedDate = row[receivedDateIndex];
          const yearQuarter = row[yearQuarterIndex];

          if (!customerId || !customerName) return;
          
          // Filter by YEAR - QUARTER if acsatCycle is provided and column exists
          if (acsatCycle && yearQuarterIndex !== -1 && yearQuarter) {
            const rowYearQuarter = yearQuarter.toString().trim();
            const selectedCycle = acsatCycle.toString().trim();
            
            // Check if the year-quarter matches
            if (rowYearQuarter !== selectedCycle) {
              // Skip this row if it doesn't match the selected cycle
              if (rowIndex < 5) {
                console.log(`⏭️ Skipping row ${rowIndex + 1} - Year Quarter mismatch:`, {
                  rowYearQuarter,
                  selectedCycle,
                  matches: false
                });
              }
              return;
            } else if (rowIndex < 5) {
              console.log(`✅ Row ${rowIndex + 1} passed Year-Quarter filter:`, {
                rowYearQuarter,
                selectedCycle
              });
            }
          }

          // Debug: Log first few rows to understand data structure
          if (rowIndex < 5) {
            console.log(`🔍 Row ${rowIndex + 1} Data:`, {
              customerId,
              customerName,
              businessUnit,
              sentDate,
              receivedDate,
              sentDateIndex,
              receivedDateIndex,
              sentDateExists: sentDateIndex !== -1,
              receivedDateExists: receivedDateIndex !== -1,
              fullRow: row
            });
          }

          // Check if dates are on or after CSAT cycle start date
          const sentDateValid = (sentDateIndex !== -1 && sentDate) ? isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted) : false;
          const receivedDateValid = (receivedDateIndex !== -1 && receivedDate) ? isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted) : false;
          
          // Debug date validation for first few rows
          if (rowIndex < 5) {
            console.log(`📅 Row ${rowIndex + 1} Date Validation:`, {
              sentDate,
              sentDateValid,
              receivedDate,
              receivedDateValid,
              cycleStartDate: cycleStartDateFormatted
            });
          }
          
          // Enhanced debugging for date filtering
          if (sentDate && !sentDateValid && rowIndex < 3) {
            console.log(`🔍 Date Filtering Debug - Row ${rowIndex}:`, {
              sentDate,
              cycleStartDate: cycleStartDateFormatted,
              isValid: sentDateValid,
              reason: 'Date is before cycle start date or invalid'
            });
          }
          
          // Additional debugging for date validation
          if (rowIndex < 3) {
            console.log(`Date validation for row ${rowIndex}:`, {
              sentDate,
              receivedDate,
              cycleStartDateFormatted,
              sentDateValid,
              receivedDateValid,
              sentDateType: typeof sentDate,
              receivedDateType: typeof receivedDate
            });
          }

          // Debug logging for first few rows
          if (rowIndex < 3) {
            console.log(`Row ${rowIndex}:`, {
              customerId,
              customerName,
              businessUnit,
              sentDate,
              receivedDate,
              sentDateValid,
              receivedDateValid,
              sentDateIndex,
              receivedDateIndex,
              cycleStartDateFormatted
            });
          }

          // Special debugging for AgFirst Farm Credit Bank
          if (customerName && customerName.toString().toLowerCase().includes('agfirst')) {
            console.log(`🔍 AGFIRST Debug - Row ${rowIndex + 1}:`, {
              customerId,
              customerName,
              businessUnit,
              sentDate,
              receivedDate,
              sentDateIndex,
              receivedDateIndex,
              sentDateValid,
              receivedDateValid,
              cycleStartDateFormatted,
              'sentDate exists': sentDateIndex !== -1 && sentDate,
              'receivedDate exists': receivedDateIndex !== -1 && receivedDate,
              'will increment sent': sentDateIndex !== -1 && sentDateValid,
              'will increment received': receivedDateIndex !== -1 && receivedDateValid,
              fullRow: row
            });
          }

          if (!groupedData[customerId]) {
            groupedData[customerId] = {
              id: customerCounter++,
              customerId: customerId,
              customerName: customerName,
              businessUnit: businessUnit,
              surveysSent: 0,
              surveysReceived: 0
            };
          }

          // Count surveys sent (only if sent date column exists)
          if (sentDateIndex !== -1 && sentDateValid) {
            groupedData[customerId].surveysSent++;
            if (rowIndex < 5) {
              console.log(`✅ Incremented surveysSent for ${customerId} (Row ${rowIndex + 1}):`, {
                previousCount: groupedData[customerId].surveysSent - 1,
                newCount: groupedData[customerId].surveysSent
              });
            }
          } else if (rowIndex < 5) {
            console.log(`❌ NOT incrementing surveysSent for ${customerId} (Row ${rowIndex + 1}):`, {
              sentDateIndex,
              sentDate,
              sentDateValid,
              reason: !sentDate ? 'No sentDate value' : 
                      sentDateIndex === -1 ? 'Column not found' : 
                      !sentDateValid ? 'Date before cycle start' : 'Unknown'
            });
          }

          // Count surveys received (only if received date column exists)
          if (receivedDateIndex !== -1 && receivedDateValid) {
            groupedData[customerId].surveysReceived++;
            if (rowIndex < 5) {
              console.log(`✅ Incremented surveysReceived for ${customerId} (Row ${rowIndex + 1})`);
            }
          } else if (rowIndex < 5) {
            console.log(`❌ NOT incrementing surveysReceived for ${customerId} (Row ${rowIndex + 1}):`, {
              receivedDateIndex,
              receivedDate,
              receivedDateValid
            });
          }
        });

        // Calculate response rate and create final data
        const finalData = Object.values(groupedData).map(row => ({
          ...row,
          responseRate: row.surveysSent > 0 ? (row.surveysReceived / row.surveysSent) * 100 : 0
        }));

        // Debug summary
        console.log('Data processing summary:', {
          totalRows: dataRows.length,
          uniqueCustomers: finalData.length,
          totalSurveysSent: finalData.reduce((sum, row) => sum + row.surveysSent, 0),
          totalSurveysReceived: finalData.reduce((sum, row) => sum + row.surveysReceived, 0),
          sentDateIndex,
          receivedDateIndex,
          cycleStartDateFormatted,
          dateFilteringEnabled: !!cycleStartDateFormatted,
          acsatCycle,
          yearQuarterIndex,
          yearQuarterFilterEnabled: !!(acsatCycle && yearQuarterIndex !== -1)
        });

        // Debug: Check AgFirst specifically
        const agfirstData = finalData.find(row => 
          row.customerName && row.customerName.toString().toLowerCase().includes('agfirst')
        );
        if (agfirstData) {
          console.log('🔍 AGFIRST Final Data:', agfirstData);
        } else {
          console.log('⚠️ AGFIRST not found in final data');
          // Check if it exists in groupedData
          const agfirstInGrouped = Object.entries(groupedData).find(([id, data]) => 
            data.customerName && data.customerName.toString().toLowerCase().includes('agfirst')
          );
          if (agfirstInGrouped) {
            console.log('🔍 AGFIRST found in groupedData:', agfirstInGrouped[1]);
          }
        }

        // Debug: Show all customers with zero surveys
        const customersWithZeroSurveys = finalData.filter(row => row.surveysSent === 0 && row.surveysReceived === 0);
        console.log(`📊 Customers with zero surveys sent/received: ${customersWithZeroSurveys.length}`);
        if (customersWithZeroSurveys.length > 0 && customersWithZeroSurveys.length <= 20) {
          console.log('📊 Customers with zero surveys:', customersWithZeroSurveys.map(c => c.customerName));
        }

        // Load "CSAT received Report" sheet data for NPS calculation and TYPE OF ACCOUNT
        const typeOfAccountMapping = {};
        let firstSheetJsonData = null;
        let firstSheetHeaders = null;
        try {
          const receivedReportSheetName = possibleSheetNames.find(name => 
            name.toLowerCase().includes('csat received report') ||
            name.toLowerCase().includes('csat received') ||
            name.toLowerCase().includes('received report') ||
            name.toLowerCase() === 'sheet1'
          );

          if (receivedReportSheetName) {
            const receivedSheet = excelData.Sheets[receivedReportSheetName];
            const receivedJsonData = XLSX.utils.sheet_to_json(receivedSheet, { header: 1 });
            
            if (receivedJsonData.length > 0) {
              const receivedHeaderRow = receivedJsonData[0];
              
              // Store first sheet data for NPS calculation
              firstSheetJsonData = receivedJsonData;
              firstSheetHeaders = receivedHeaderRow;
              
              const customerNameIndexReceived = receivedHeaderRow.findIndex(header => 
                header && (
                  header.toString().toLowerCase().includes('customer name') ||
                  header.toString().toLowerCase().includes('customer_name') ||
                  header.toString().toLowerCase().includes('cust_nm')
                )
              );
              
              const typeOfAccountIndexReceived = receivedHeaderRow.findIndex(header => 
                header && (
                  header.toString().toLowerCase().includes('type of account') ||
                  header.toString().toLowerCase().includes('typeofaccount') ||
                  header.toString().toLowerCase().includes('account type')
                )
              );

              if (customerNameIndexReceived !== -1 && typeOfAccountIndexReceived !== -1) {
                receivedJsonData.slice(1).forEach(row => {
                  const customerName = row[customerNameIndexReceived];
                  const typeOfAccount = row[typeOfAccountIndexReceived];
                  if (customerName) {
                    typeOfAccountMapping[customerName.toString().trim()] = 
                      typeOfAccount ? typeOfAccount.toString().trim() : '';
                  }
                });
                console.log('✅ Loaded TYPE OF ACCOUNT mapping:', Object.keys(typeOfAccountMapping).length, 'customers');
              }
            }
          }
          
          // Store first sheet data for NPS calculation
          if (firstSheetJsonData && firstSheetHeaders) {
            setFirstSheetData({
              jsonData: firstSheetJsonData,
              headers: firstSheetHeaders
            });
          }
        } catch (error) {
          console.warn('⚠️ Could not load CSAT received Report sheet:', error);
        }

        setTypeOfAccountMap(typeOfAccountMapping);
        setProcessedData(finalData);
        
        // Find RESPONDENT CATEGORY column
        const respondentCategoryIndex = headerRow.findIndex(header => 
          header && (
            header.toString().toLowerCase().includes('respondent category') ||
            header.toString().toLowerCase().includes('respondent_category') ||
            header.toString().toLowerCase().includes('respondentcategory')
          )
        );
        if (respondentCategoryIndex !== -1) {
          console.log('✅ Found RESPONDENT CATEGORY column at index:', respondentCategoryIndex, 'Column name:', headerRow[respondentCategoryIndex]);
        } else {
          console.warn('⚠️ RESPONDENT CATEGORY column not found');
        }
        
        // Store raw second sheet data for recalculating other account totals
        setRawSecondSheetData({
          jsonData: jsonData,
          headerRow: headerRow,
          customerIdIndex,
          respondentCategoryIndex,
          customerNameIndex,
          yearQuarterIndex,
          sentDateIndex,
          receivedDateIndex,
          businessUnitIndex,
          typeOfAccountIndex
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error processing Excel data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    processExcelData();
  }, [excelData, cycleStartDateFormatted, acsatCycle]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort and filter data
  const sortedAndFilteredData = useMemo(() => {
    let filtered = processedData;
    
    // Apply Top 10 filtering (predefined list + TYPE OF ACCOUNT = Top 10 from upload)
    if (showTop10) {
      filtered = processedData.filter((row) =>
        isTop10DashboardAccount(row, top10AccountNames, typeOfAccountMap)
      );

      filtered = filtered.sort((a, b) => {
        const aIndex = getTop10AccountSortIndex(a.customerName, top10AccountNames);
        const bIndex = getTop10AccountSortIndex(b.customerName, top10AccountNames);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return (a.customerName || '').localeCompare(b.customerName || '');
      });
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(row =>
        row.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting (only if not Top 10 mode)
    if (sortConfig.key && !showTop10) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'businessUnit' || sortConfig.key === 'customerName') {
          aValue = aValue?.toLowerCase() || '';
          bValue = bValue?.toLowerCase() || '';
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else if (!groupByBU && !showTop10 && !sortConfig.key) {
      // Account-wise (not Top 10) and no manual sorting: sort by accountOrder
      filtered = [...filtered].sort((a, b) => {
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
    
    // Re-number the SNO after sorting/filtering
    return filtered.map((row, index) => ({
      ...row,
      id: index + 1
    }));
  }, [processedData, searchTerm, sortConfig, showTop10, top10AccountNames, typeOfAccountMap, groupByBU, accountOrder]);

  // Process BU-wise data
  const buWiseData = useMemo(() => {
    if (!groupByBU) return [];
    
    const buGroupedData = {};
    
    processedData.forEach(row => {
      const buKey = row.businessUnit || 'Unknown';
      
      if (!buGroupedData[buKey]) {
        buGroupedData[buKey] = {
          businessUnit: buKey,
          surveysSent: 0,
          surveysReceived: 0,
          accountCount: 0
        };
      }
      
      buGroupedData[buKey].surveysSent += row.surveysSent;
      buGroupedData[buKey].surveysReceived += row.surveysReceived;
      buGroupedData[buKey].accountCount += 1;
    });
    
    const unsorted = Object.values(buGroupedData).map((row) => ({
      ...row,
      responseRate: row.surveysSent > 0 ? (row.surveysReceived / row.surveysSent) * 100 : 0
    }));
    const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
    const sorted = unsorted.sort((a, b) => {
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
    // Re-assign Sr. No. after sorting to ensure correct order
    return sorted.map((row, index) => ({
      ...row,
      id: index + 1
    }));
  }, [processedData, groupByBU]);

  // Get the appropriate data for display
  const displayData = useMemo(() => {
    return groupByBU ? buWiseData : sortedAndFilteredData;
  }, [groupByBU, buWiseData, sortedAndFilteredData]);

  // Calculate grand totals
  const grandTotals = useMemo(() => {
    // Use displayData to respect Top 10 filtering and other filters
    const dataToUse = displayData;
    
    // Grand total for "Polled" = sum(Polled)
    const totalSent = dataToUse.reduce((sum, row) => sum + (row.surveysSent || 0), 0);
    
    // Grand total for "Responded" = sum(Responded)
    const totalReceived = dataToUse.reduce((sum, row) => sum + (row.surveysReceived || 0), 0);
    
    // Grand total for Response% = (Grand total for "Responded" / Grand total for "Polled") * 100
    const overallResponseRate = totalSent > 0 ? (totalReceived / totalSent) * 100 : 0;
    
    return {
      totalSent,
      totalReceived,
      overallResponseRate
    };
  }, [displayData]);

  const isAccountWiseView = !groupByBU && !showTop10 && !showCXOAnalysis;
  const isBuWiseView = groupByBU && !showTop10 && !showCXOAnalysis;
  const isTop10View = showTop10 && !groupByBU && !showCXOAnalysis;
  const acsatTrendViewMode = isBuWiseView ? 'bu' : isTop10View ? 'top10' : isAccountWiseView ? 'account' : null;

  const acsatTrendAnalysisData = useMemo(() => {
    if (!showAcsatTrendAnalysis || !trendAnalysisFiles?.length || !acsatTrendViewMode) return [];
    return trendAnalysisFiles.map((file) =>
      buildResponseRateTrendFromFile(file, {
        groupBy: acsatTrendViewMode,
        top10AccountNames: acsatTrendViewMode === 'top10' ? top10AccountNames : [],
      })
    );
  }, [showAcsatTrendAnalysis, trendAnalysisFiles, acsatTrendViewMode, top10AccountNames]);

  const acsatTrendAccountLookups = useMemo(
    () => acsatTrendAnalysisData.map((fileData) => buildTrendAccountLookup(fileData)),
    [acsatTrendAnalysisData]
  );

  const acsatTrendBuLookups = useMemo(
    () => acsatTrendAnalysisData.map((fileData) => buildTrendBuLookup(fileData)),
    [acsatTrendAnalysisData]
  );

  const showMainTableTrendColumns =
    (isAccountWiseView || isBuWiseView || isTop10View) &&
    showAcsatTrendAnalysis &&
    acsatTrendAnalysisData.length > 0;

  const scrollToAcsatTrendSection = () => {
    requestAnimationFrame(() => {
      acsatTrendSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleViewAcsatTrendAnalysis = () => {
    if (!acsatTrendViewMode) {
      alert('ACSAT trend analysis is available only in Show All Accounts, Top 10 Account, or BU wise dashboard view.');
      return;
    }
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

  const acsatTrendSectionTitle =
    acsatTrendViewMode === 'bu'
      ? 'ACSAT: BU Wise Response Rate Trend Analysis (from uploaded trend files)'
      : acsatTrendViewMode === 'top10'
        ? 'ACSAT: Top 10 Account Response Rate Trend Analysis (from uploaded trend files)'
        : 'ACSAT: Account Wise Response Rate Trend Analysis (from uploaded trend files)';

  // Calculate Other Account totals (for Top 10 view only)
  // Other Account = accounts where TYPE OF ACCOUNT is NOT equal to "Top 10"
  // Recalculate from raw second sheet data with proper filters:
  // - TYPE OF ACCOUNT ≠ "Top 10"
  // - YEAR - QUARTER = acsatCycle
  // - CSAT SENT DATE >= acsatCycleStartDateFormatted
  // - CSAT RECEIVED DATE >= acsatCycleStartDateFormatted
  // Count all valid CSAT SENT DATE rows (simple count, not grouped)
  const otherAccountTotals = useMemo(() => {
    // Only calculate for Top 10 view
    if (!showTop10 || !rawSecondSheetData) return null;
    
    const { jsonData, headerRow, customerIdIndex, customerNameIndex, yearQuarterIndex, sentDateIndex, receivedDateIndex, typeOfAccountIndex } = rawSecondSheetData;
    
    if (!jsonData || jsonData.length < 2) return null;
    
    // Get data rows (skip header row)
    const dataRows = jsonData.slice(1);
    
    let debugStats = {
      totalRows: dataRows.length,
      skippedYearQuarter: 0,
      skippedTop10: 0,
      skippedInvalidSentDate: 0,
      skippedInvalidReceivedDate: 0,
      countedSentRows: 0,
      countedReceivedRows: 0
    };
    
    let totalSent = 0;
    let totalReceived = 0;
    
    dataRows.forEach((row, rowIndex) => {
      const customerName = row[customerNameIndex];
      const yearQuarter = row[yearQuarterIndex];
      const sentDate = row[sentDateIndex];
      const receivedDate = row[receivedDateIndex];
      
      // Filter by YEAR - QUARTER if acsatCycle is provided and column exists
      if (acsatCycle && yearQuarterIndex !== -1 && yearQuarter) {
        const rowYearQuarter = yearQuarter.toString().trim();
        const selectedCycle = acsatCycle.toString().trim();
        if (rowYearQuarter !== selectedCycle) {
          debugStats.skippedYearQuarter++;
          return; // Skip this row if YEAR - QUARTER doesn't match
        }
      }
      
      // Check TYPE OF ACCOUNT - prefer column from second sheet, fallback to mapping from first sheet
      let typeOfAccount = '';
      let typeOfAccountSource = 'none';
      if (typeOfAccountIndex !== -1 && row[typeOfAccountIndex] !== undefined && row[typeOfAccountIndex] !== null) {
        // Use TYPE OF ACCOUNT column directly from second sheet
        typeOfAccount = row[typeOfAccountIndex].toString().trim();
        typeOfAccountSource = 'secondSheet';
      } else if (customerName) {
        // Fallback to mapping from first sheet
        const customerNameStr = customerName.toString().trim();
        typeOfAccount = (typeOfAccountMap[customerNameStr] || '').toString().trim();
        typeOfAccountSource = 'firstSheetMapping';
      }
      
      // Only include rows where TYPE OF ACCOUNT is NOT "Top 10"
      // If TYPE OF ACCOUNT is empty/null/undefined, treat it as "Other Account"
      if (typeOfAccount === 'Top 10') {
        debugStats.skippedTop10++;
        if (rowIndex < 5) {
          console.log(`⏭️ Skipping row ${rowIndex + 1} - TYPE OF ACCOUNT is "Top 10" (source: ${typeOfAccountSource})`);
        }
        return; // Skip Top 10 accounts
      }
      
      // Check if CSAT SENT DATE is valid (>= cycle start date)
      const sentDateValid = (sentDateIndex !== -1 && sentDate) ? isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted) : false;
    
      // Check if CSAT RECEIVED DATE is valid (>= cycle start date)
      const receivedDateValid = (receivedDateIndex !== -1 && receivedDate) ? isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted) : false;
      
      // Debug first few rows
      if (rowIndex < 5) {
        console.log(`🔍 Other Account Row ${rowIndex + 1}:`, {
          customerName,
          typeOfAccount,
          typeOfAccountSource,
          yearQuarter,
          sentDate,
          sentDateValid,
          receivedDate,
          receivedDateValid,
          willCountSent: sentDateValid,
          willCountReceived: receivedDateValid
        });
      }
      
      // Count surveys sent - each row with a valid CSAT SENT DATE counts as one
      if (sentDateValid) {
        totalSent++;
        debugStats.countedSentRows++;
      } else {
        debugStats.skippedInvalidSentDate++;
      }
      
      // Count surveys received - each row with a valid CSAT RECEIVED DATE counts as one
      if (receivedDateValid) {
        totalReceived++;
        debugStats.countedReceivedRows++;
      } else {
        debugStats.skippedInvalidReceivedDate++;
      }
    });
    
    // Debug logging for other account calculation
    console.log('🔍 Other Account Calculation Summary:', {
      ...debugStats,
      totalSent,
      totalReceived,
      cycleStartDate: cycleStartDateFormatted,
      acsatCycle,
      typeOfAccountMapSize: Object.keys(typeOfAccountMap).length,
      typeOfAccountColumnIndex: typeOfAccountIndex,
      usingTypeOfAccountColumn: typeOfAccountIndex !== -1
    });
    
    // If no valid rows found, return null
    if (totalSent === 0 && totalReceived === 0) return null;
    
    // Grand total for Response% = (Grand total for "Responded" / Grand total for "Polled") * 100
    const overallResponseRate = totalSent > 0 ? (totalReceived / totalSent) * 100 : 0;
    
    return {
      totalSent,
      totalReceived,
      overallResponseRate
    };
  }, [showTop10, rawSecondSheetData, typeOfAccountMap, acsatCycle, cycleStartDateFormatted]);

  // Process CXO and Non-CXO Response Rate Analysis
  const cxoAnalysisData = useMemo(() => {
    if (!showCXOAnalysis || !rawSecondSheetData || !firstSheetData) return null;
    
    const { jsonData, headerRow, businessUnitIndex, sentDateIndex, receivedDateIndex, yearQuarterIndex, respondentCategoryIndex } = rawSecondSheetData;
    
    if (!jsonData || jsonData.length < 2 || businessUnitIndex === -1 || sentDateIndex === -1 || receivedDateIndex === -1 || respondentCategoryIndex === -1) {
      console.warn('⚠️ Missing required columns for CXO analysis');
      return null;
    }
    
    // Process first sheet data for NPS calculation
    const { jsonData: firstSheetJsonData, headers: firstSheetHeaders } = firstSheetData;
    
    // Find column indices in first sheet
    const firstSheetBusinessUnitIndex = firstSheetHeaders.findIndex(header => 
      header && header.toString().toLowerCase().includes('business unit')
    );
    const firstSheetPerspectiveIndex = firstSheetHeaders.findIndex(header => 
      header && header.toString().toLowerCase().includes('perspective')
    );
    const firstSheetRatingIndex = firstSheetHeaders.findIndex(header => 
      header && (header.toString().toLowerCase().includes('rating') && !header.toString().toLowerCase().includes('description'))
    );
    const firstSheetSentDateIndex = firstSheetHeaders.findIndex(header => 
      header && (header.toString().toLowerCase().includes('csat sent date') ||
                header.toString().toLowerCase().includes('csat_sent_date') ||
                header.toString().toLowerCase().includes('css sent date') ||
                header.toString().toLowerCase().includes('css_sent_date'))
    );
    const firstSheetReceivedDateIndex = firstSheetHeaders.findIndex(header => 
      header && (header.toString().toLowerCase().includes('csat received date') ||
                header.toString().toLowerCase().includes('csat_received_date') ||
                header.toString().toLowerCase().includes('css received date') ||
                header.toString().toLowerCase().includes('css_received_date'))
    );
    const firstSheetRespondentCategoryIndex = firstSheetHeaders.findIndex(header => 
      header && (header.toString().toLowerCase().includes('respondent category') ||
                header.toString().toLowerCase().includes('respondent_category') ||
                header.toString().toLowerCase().includes('respondentcategory'))
    );
    
    // Calculate NPS by BUSINESS UNIT from first sheet (overall NPS)
    const npsByBusinessUnit = {};
    if (firstSheetBusinessUnitIndex !== -1 && firstSheetPerspectiveIndex !== -1 && firstSheetRatingIndex !== -1 && 
        firstSheetSentDateIndex !== -1 && firstSheetReceivedDateIndex !== -1) {
      const firstSheetDataRows = firstSheetJsonData.slice(1);
      
      firstSheetDataRows.forEach((row) => {
        const rawBusinessUnit = row[firstSheetBusinessUnitIndex];
        if (!rawBusinessUnit) return;
        const businessUnit = normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim());
        const perspective = row[firstSheetPerspectiveIndex];
        const rating = row[firstSheetRatingIndex];
        const sentDate = row[firstSheetSentDateIndex];
        const receivedDate = row[firstSheetReceivedDateIndex];
        
        if (!perspective || rating === undefined || rating === null || rating === '') return;
        
        // Filter by PERSPECTIVE = "NPS"
        const perspectiveStr = perspective.toString().trim();
        if (perspectiveStr.toUpperCase() !== 'NPS') return;
        
        // Filter by date - both sent and received dates should be >= cycle start date
        const sentDateValid = sentDate && isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted);
        const receivedDateValid = receivedDate && isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted);
        
        if (!sentDateValid || !receivedDateValid) return;
        
        // Initialize business unit if not exists
        if (!npsByBusinessUnit[businessUnit]) {
          npsByBusinessUnit[businessUnit] = {
            promoters: 0,
            detractors: 0
          };
        }
        
        // Parse rating
        const ratingNum = parseFloat(rating);
        if (isNaN(ratingNum)) return;
        
        // Count Promoters (rating 9-10) and Detractors (rating < 7)
        if (ratingNum >= 9 && ratingNum <= 10) {
          npsByBusinessUnit[businessUnit].promoters++;
        } else if (ratingNum < 7) {
          npsByBusinessUnit[businessUnit].detractors++;
        }
      });
    }
    
    // Calculate CXO NPS by BUSINESS UNIT from first sheet
    const cxoNpsByBusinessUnit = {};
    if (firstSheetBusinessUnitIndex !== -1 && firstSheetPerspectiveIndex !== -1 && firstSheetRatingIndex !== -1 && 
        firstSheetSentDateIndex !== -1 && firstSheetReceivedDateIndex !== -1 && firstSheetRespondentCategoryIndex !== -1) {
      const firstSheetDataRows = firstSheetJsonData.slice(1);
      
      firstSheetDataRows.forEach((row) => {
        const rawBusinessUnit = row[firstSheetBusinessUnitIndex];
        if (!rawBusinessUnit) return;
        const businessUnit = normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim());
        const perspective = row[firstSheetPerspectiveIndex];
        const rating = row[firstSheetRatingIndex];
        const sentDate = row[firstSheetSentDateIndex];
        const receivedDate = row[firstSheetReceivedDateIndex];
        const respondentCategory = row[firstSheetRespondentCategoryIndex];
        
        if (!perspective || rating === undefined || rating === null || rating === '') return;
        
        // Filter by PERSPECTIVE = "NPS"
        const perspectiveStr = perspective.toString().trim();
        if (perspectiveStr.toUpperCase() !== 'NPS') return;
        
        // Filter by RESPONDENT CATEGORY = "CXO"
        const respondentCategoryStr = respondentCategory ? respondentCategory.toString().trim().toUpperCase() : '';
        if (respondentCategoryStr !== 'CXO') return;
        
        // Filter by date - both sent and received dates should be >= cycle start date
        const sentDateValid = sentDate && isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted);
        const receivedDateValid = receivedDate && isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted);
        
        if (!sentDateValid || !receivedDateValid) return;
        
        // Initialize business unit if not exists
        if (!cxoNpsByBusinessUnit[businessUnit]) {
          cxoNpsByBusinessUnit[businessUnit] = {
            promoters: 0,
            detractors: 0
          };
        }
        
        // Parse rating
        const ratingNum = parseFloat(rating);
        if (isNaN(ratingNum)) return;
        
        // Count Promoters (rating 9-10) and Detractors (rating < 7)
        if (ratingNum >= 9 && ratingNum <= 10) {
          cxoNpsByBusinessUnit[businessUnit].promoters++;
        } else if (ratingNum < 7) {
          cxoNpsByBusinessUnit[businessUnit].detractors++;
        }
      });
    }
    
    // Calculate Non-CXO NPS by BUSINESS UNIT from first sheet
    const nonCxoNpsByBusinessUnit = {};
    if (firstSheetBusinessUnitIndex !== -1 && firstSheetPerspectiveIndex !== -1 && firstSheetRatingIndex !== -1 && 
        firstSheetSentDateIndex !== -1 && firstSheetReceivedDateIndex !== -1 && firstSheetRespondentCategoryIndex !== -1) {
      const firstSheetDataRows = firstSheetJsonData.slice(1);
      
      firstSheetDataRows.forEach((row) => {
        const rawBusinessUnit = row[firstSheetBusinessUnitIndex];
        if (!rawBusinessUnit) return;
        const businessUnit = normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim());
        const perspective = row[firstSheetPerspectiveIndex];
        const rating = row[firstSheetRatingIndex];
        const sentDate = row[firstSheetSentDateIndex];
        const receivedDate = row[firstSheetReceivedDateIndex];
        const respondentCategory = row[firstSheetRespondentCategoryIndex];
        
        if (!perspective || rating === undefined || rating === null || rating === '') return;
        
        // Filter by PERSPECTIVE = "NPS"
        const perspectiveStr = perspective.toString().trim();
        if (perspectiveStr.toUpperCase() !== 'NPS') return;
        
        // Filter by RESPONDENT CATEGORY = "Non CXO" (not "CXO")
        const respondentCategoryStr = respondentCategory ? respondentCategory.toString().trim().toUpperCase() : '';
        if (respondentCategoryStr === 'CXO' || respondentCategoryStr === '') return;
        
        // Filter by date - both sent and received dates should be >= cycle start date
        const sentDateValid = sentDate && isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted);
        const receivedDateValid = receivedDate && isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted);
        
        if (!sentDateValid || !receivedDateValid) return;
        
        // Initialize business unit if not exists
        if (!nonCxoNpsByBusinessUnit[businessUnit]) {
          nonCxoNpsByBusinessUnit[businessUnit] = {
            promoters: 0,
            detractors: 0
          };
        }
        
        // Parse rating
        const ratingNum = parseFloat(rating);
        if (isNaN(ratingNum)) return;
        
        // Count Promoters (rating 9-10) and Detractors (rating < 7)
        if (ratingNum >= 9 && ratingNum <= 10) {
          nonCxoNpsByBusinessUnit[businessUnit].promoters++;
        } else if (ratingNum < 7) {
          nonCxoNpsByBusinessUnit[businessUnit].detractors++;
        }
      });
    }
    
    // Process data rows
    const dataRows = jsonData.slice(1);
    const cxoGroupedData = {};
    const nonCxoGroupedData = {};
    
    dataRows.forEach((row) => {
      const rawBusinessUnit = row[businessUnitIndex];
      if (!rawBusinessUnit) return;
      const businessUnit = normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim());
      const sentDate = row[sentDateIndex];
      const receivedDate = row[receivedDateIndex];
      const yearQuarter = row[yearQuarterIndex];
      const respondentCategory = row[respondentCategoryIndex];
      
      // Filter by YEAR - QUARTER if acsatCycle is provided
      if (acsatCycle && yearQuarterIndex !== -1 && yearQuarter) {
        const rowYearQuarter = yearQuarter.toString().trim();
        const selectedCycle = acsatCycle.toString().trim();
        if (rowYearQuarter !== selectedCycle) {
          return; // Skip if year-quarter doesn't match
        }
      }
      
      // Filter by date - both sent and received dates should be >= cycle start date
      const sentDateValid = sentDate && isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted);
      const receivedDateValid = receivedDate && isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted);
      
      // Determine if this is CXO or Non-CXO
      const isCXO = respondentCategory && respondentCategory.toString().trim().toUpperCase() === 'CXO';
      const isNonCXO = respondentCategory && respondentCategory.toString().trim().toUpperCase() !== 'CXO';
      
      // Process CXO data
      if (isCXO) {
        if (!cxoGroupedData[businessUnit]) {
          cxoGroupedData[businessUnit] = {
            businessUnit: businessUnit.toString().trim(),
            cxoPolled: 0,
            cxoResponded: 0
          };
        }
        
        if (sentDateValid) {
          cxoGroupedData[businessUnit].cxoPolled++;
        }
        if (receivedDateValid) {
          cxoGroupedData[businessUnit].cxoResponded++;
        }
      }
      
      // Process Non-CXO data
      if (isNonCXO) {
        if (!nonCxoGroupedData[businessUnit]) {
          nonCxoGroupedData[businessUnit] = {
            businessUnit: businessUnit.toString().trim(),
            nonCxoPolled: 0,
            nonCxoResponded: 0
          };
        }
        
        if (sentDateValid) {
          nonCxoGroupedData[businessUnit].nonCxoPolled++;
        }
        if (receivedDateValid) {
          nonCxoGroupedData[businessUnit].nonCxoResponded++;
        }
      }
    });
    
    // Combine CXO and Non-CXO data by Business Unit
    const combinedData = [];
    const allBusinessUnits = new Set([
      ...Object.keys(cxoGroupedData),
      ...Object.keys(nonCxoGroupedData)
    ]);
    
    // Calculate overall Response % by BUSINESS UNIT (Polled = count(CSS_SENT_DATE), Responded = count(CSAT RECEIVED DATE))
    const overallResponseData = {};
    dataRows.forEach((row) => {
      const rawBusinessUnit = row[businessUnitIndex];
      if (!rawBusinessUnit) return;
      const businessUnit = normalizeBusinessUnitDisplay(rawBusinessUnit.toString().trim());
      const sentDate = row[sentDateIndex];
      const receivedDate = row[receivedDateIndex];
      const yearQuarter = row[yearQuarterIndex];
      
      // Filter by YEAR - QUARTER if acsatCycle is provided
      if (acsatCycle && yearQuarterIndex !== -1 && yearQuarter) {
        const rowYearQuarter = yearQuarter.toString().trim();
        const selectedCycle = acsatCycle.toString().trim();
        if (rowYearQuarter !== selectedCycle) {
          return; // Skip if year-quarter doesn't match
        }
      }
      
      // Filter by date - both sent and received dates should be >= cycle start date
      const sentDateValid = sentDate && isDateOnOrAfterCycleStart(sentDate, cycleStartDateFormatted);
      const receivedDateValid = receivedDate && isDateOnOrAfterCycleStart(receivedDate, cycleStartDateFormatted);
      
      if (!overallResponseData[businessUnit]) {
        overallResponseData[businessUnit] = {
          polled: 0,
          responded: 0
        };
      }
      
      // Count Polled (CSS_SENT_DATE)
      if (sentDateValid) {
        overallResponseData[businessUnit].polled++;
      }
      
      // Count Responded (CSAT RECEIVED DATE)
      if (receivedDateValid) {
        overallResponseData[businessUnit].responded++;
      }
    });
    
    allBusinessUnits.forEach(bu => {
      const cxoData = cxoGroupedData[bu] || { businessUnit: bu, cxoPolled: 0, cxoResponded: 0 };
      const nonCxoData = nonCxoGroupedData[bu] || { businessUnit: bu, nonCxoPolled: 0, nonCxoResponded: 0 };
      const overallData = overallResponseData[bu] || { polled: 0, responded: 0 };
      const npsData = npsByBusinessUnit[bu] || { promoters: 0, detractors: 0 };
      const cxoNpsData = cxoNpsByBusinessUnit[bu] || { promoters: 0, detractors: 0 };
      const nonCxoNpsData = nonCxoNpsByBusinessUnit[bu] || { promoters: 0, detractors: 0 };
      
      // Calculate overall Response % = Responded/Polled*100
      const overallResponseRate = overallData.polled > 0 ? (overallData.responded / overallData.polled) * 100 : 0;
      
      // Calculate NPS = (Promoters - Detractors) / count(CSAT RECEIVED DATE) * 100
      const npsValue = overallData.responded > 0 
        ? ((npsData.promoters - npsData.detractors) / overallData.responded) * 100 
        : 0;
      
      // Calculate CXO NPS = (Promoters - Detractors) / count(CSAT RECEIVED DATE) * 100
      const cxoNpsValue = cxoData.cxoResponded > 0 
        ? ((cxoNpsData.promoters - cxoNpsData.detractors) / cxoData.cxoResponded) * 100 
        : 0;
      
      // Calculate Non-CXO NPS = (Promoters - Detractors) / count(CSAT RECEIVED DATE) * 100
      const nonCxoNpsValue = nonCxoData.nonCxoResponded > 0 
        ? ((nonCxoNpsData.promoters - nonCxoNpsData.detractors) / nonCxoData.nonCxoResponded) * 100 
        : 0;
      
      combinedData.push({
        businessUnit: bu,
        polled: overallData.polled, // count(CSS_SENT_DATE) grouped by Business Unit
        responded: overallData.responded, // count(CSS_RECEIVED_DATE) grouped by Business Unit
        cxoPolled: cxoData.cxoPolled,
        cxoResponded: cxoData.cxoResponded,
        nonCxoPolled: nonCxoData.nonCxoPolled,
        nonCxoResponded: nonCxoData.nonCxoResponded,
        cxoResponseRate: cxoData.cxoPolled > 0 ? (cxoData.cxoResponded / cxoData.cxoPolled) * 100 : 0,
        cxoNps: cxoNpsValue,
        nonCxoResponseRate: nonCxoData.nonCxoPolled > 0 ? (nonCxoData.nonCxoResponded / nonCxoData.nonCxoPolled) * 100 : 0,
        nonCxoNps: nonCxoNpsValue,
        overallPolled: overallData.polled,
        overallResponded: overallData.responded,
        overallResponseRate: overallResponseRate,
        nps: npsValue
      });
    });
    
    // Sort by Business Unit (case-insensitive matching)
    const businessUnitOrder = ['Healthcare', 'CIT', 'Tech', 'India & UK'];
    combinedData.sort((a, b) => {
      const aBU = (a.businessUnit || '').toString().trim();
      const bBU = (b.businessUnit || '').toString().trim();
      const aIndex = businessUnitOrder.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase());
      const bIndex = businessUnitOrder.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase());
      // If both found, sort by order; if only one found, prioritize it; if neither found, maintain original order
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return aBU.localeCompare(bBU);
    });
    
    return combinedData;
  }, [showCXOAnalysis, rawSecondSheetData, firstSheetData, acsatCycle, cycleStartDateFormatted]);

  // Calculate Grand Totals for CXO Analysis
  const cxoAnalysisGrandTotals = useMemo(() => {
    if (!cxoAnalysisData || cxoAnalysisData.length === 0) return null;
    
    const totals = cxoAnalysisData.reduce((acc, row) => {
      acc.totalCxoPolled += row.cxoPolled;
      acc.totalCxoResponded += row.cxoResponded;
      acc.totalNonCxoPolled += row.nonCxoPolled;
      acc.totalNonCxoResponded += row.nonCxoResponded;
      acc.totalOverallPolled += row.overallPolled || 0;
      acc.totalOverallResponded += row.overallResponded || 0;
      // Sum NPS values weighted by responded count for grand total
      if (row.overallResponded > 0 && row.nps !== undefined) {
        acc.totalNpsWeighted += (row.nps * row.overallResponded);
        acc.totalNpsWeight += row.overallResponded;
      }
      // Sum CXO NPS values weighted by count(CSAT RECEIVED DATE) for grand total
      if (row.cxoResponded > 0 && row.cxoNps !== undefined) {
        acc.totalCxoNpsWeighted += (row.cxoNps * row.cxoResponded);
        acc.totalCxoNpsWeight += row.cxoResponded;
      }
      // Sum Non-CXO NPS values weighted by count(CSAT RECEIVED DATE) for grand total
      if (row.nonCxoResponded > 0 && row.nonCxoNps !== undefined) {
        acc.totalNonCxoNpsWeighted += (row.nonCxoNps * row.nonCxoResponded);
        acc.totalNonCxoNpsWeight += row.nonCxoResponded;
      }
      return acc;
    }, {
      totalCxoPolled: 0,
      totalCxoResponded: 0,
      totalNonCxoPolled: 0,
      totalNonCxoResponded: 0,
      totalOverallPolled: 0,
      totalOverallResponded: 0,
      totalNpsWeighted: 0,
      totalNpsWeight: 0,
      totalCxoNpsWeighted: 0,
      totalCxoNpsWeight: 0,
      totalNonCxoNpsWeighted: 0,
      totalNonCxoNpsWeight: 0
    });
    
    // Calculate overall response rates
    totals.cxoOverallResponseRate = totals.totalCxoPolled > 0 
      ? (totals.totalCxoResponded / totals.totalCxoPolled) * 100 
      : 0;
    totals.nonCxoOverallResponseRate = totals.totalNonCxoPolled > 0 
      ? (totals.totalNonCxoResponded / totals.totalNonCxoPolled) * 100 
      : 0;
    totals.overallResponseRate = totals.totalOverallPolled > 0 
      ? (totals.totalOverallResponded / totals.totalOverallPolled) * 100 
      : 0;
    
    // Calculate grand total NPS = weighted average
    totals.nps = totals.totalNpsWeight > 0 
      ? totals.totalNpsWeighted / totals.totalNpsWeight 
      : 0;
    
    // Calculate grand total CXO NPS = weighted average
    totals.cxoNps = totals.totalCxoNpsWeight > 0 
      ? totals.totalCxoNpsWeighted / totals.totalCxoNpsWeight 
      : 0;
    
    // Calculate grand total Non-CXO NPS = weighted average
    totals.nonCxoNps = totals.totalNonCxoNpsWeight > 0 
      ? totals.totalNonCxoNpsWeighted / totals.totalNonCxoNpsWeight 
      : 0;
    
    return totals;
  }, [cxoAnalysisData]);

  // Export CXO Analysis to Excel
  const exportCXOAnalysisToExcel = async () => {
    if (!cxoAnalysisData || cxoAnalysisData.length === 0) {
      alert('No CXO analysis data to download');
      return;
    }

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('CXO and Non-CXO Response Rate Analysis');

      // Add first header row with merged cells
      const firstHeaderRow = worksheet.addRow([
        'Sr. No.',
        'Business Unit',
        'Overall',
        '',
        '',
        '',
        'CXO',
        '',
        '',
        '',
        'Non-CXO',
        '',
        '',
        ''
      ]);

      // Add second header row with column names (Sr. No. and Business Unit are empty since they're merged)
      const headers = [
        '', // Sr. No. (merged from row 1)
        '', // Business Unit (merged from row 1)
        'Polled',
        'Responded',
        'Response %',
        'NPS',
        'CXOs Polled',
        'CXOs Responded',
        'CXO Response %',
        'CXO NPS',
        'Non-CXOs Polled',
        'Non-CXOs Responded',
        'Non-CXO Response %',
        'Non-CXO NPS'
      ];

      const headerRow = worksheet.addRow(headers);

      // Merge cells FIRST before styling
      // Merge cells for Sr. No. and Business Unit (columns 1-2) - spans 2 rows
      worksheet.mergeCells(1, 1, 2, 1); // Sr. No. spans 2 rows
      worksheet.mergeCells(1, 2, 2, 2); // Business Unit spans 2 rows

      // Merge cells for Overall (columns 3-6: Polled, Responded, Response %, NPS)
      worksheet.mergeCells(1, 3, 1, 6);
      
      // Merge cells for CXO (columns 7-10: CXOs Polled, CXOs Responded, CXO Response %, CXO NPS)
      worksheet.mergeCells(1, 7, 1, 10);
      
      // Merge cells for Non-CXO (columns 11-14: Non-CXOs Polled, Non-CXOs Responded, Non-CXO Response %, Non-CXO NPS)
      worksheet.mergeCells(1, 11, 1, 14);

      // Now style the first header row
      firstHeaderRow.eachCell((cell, colNumber) => {
        // Skip cells that are part of merged groups (they'll be styled via the master cell)
        if (colNumber === 4 || colNumber === 5 || colNumber === 6 || 
            colNumber === 8 || colNumber === 9 || colNumber === 10 ||
            colNumber === 12 || colNumber === 13 || colNumber === 14) {
          return; // These are part of merged cells
        }
        
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true,
          indent: 0,
          readingOrder: 'left-to-right'
        };
      });

      // Style the merged cells explicitly
      const srNoCell = worksheet.getCell(1, 1);
      srNoCell.value = 'Sr. No.';
      srNoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      srNoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      srNoCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      srNoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const buCell = worksheet.getCell(1, 2);
      buCell.value = 'Business Unit';
      buCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      buCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      buCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      buCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const overallCell = worksheet.getCell(1, 3);
      overallCell.value = 'Overall';
      overallCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      overallCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      overallCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      overallCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const cxoCell = worksheet.getCell(1, 7);
      cxoCell.value = 'CXO';
      cxoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cxoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cxoCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      cxoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      const nonCxoCell = worksheet.getCell(1, 11);
      nonCxoCell.value = 'Non-CXO';
      nonCxoCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      nonCxoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      nonCxoCell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };
      nonCxoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

      // Style the second header row - ALL cells need background color
      headerRow.eachCell((cell, colNumber) => {
        // Skip columns 1 and 2 as they're merged from row 1
        if (colNumber === 1 || colNumber === 2) {
          return; // These are merged from row 1
        }
        
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        // Determine if this column is numeric
        const isNumericColumn = colNumber > 2; // After Sr. No. and Business Unit
        
        // Explicitly set alignment to ensure Excel respects it
        cell.alignment = { 
          horizontal: isNumericColumn ? 'center' : 'left', 
          vertical: 'middle',
          wrapText: true,
          indent: 0,
          readingOrder: 'left-to-right'
        };
      });
      
      // Set header row heights to ensure proper vertical alignment
      firstHeaderRow.height = 30;
      headerRow.height = 30;

      // Add data rows
      cxoAnalysisData.forEach((row, index) => {
        const cxoRespondedValue = row.cxoResponded === 0 ? 0 : row.cxoResponded;
        const cxoResponseRateValue = row.cxoResponded === 0 ? 0 : Math.round(row.cxoResponseRate);
        const nonCxoRespondedValue = row.nonCxoResponded === 0 ? 0 : row.nonCxoResponded;
        const nonCxoResponseRateValue = row.nonCxoResponded === 0 ? 0 : Math.round(row.nonCxoResponseRate);

        const overallRespondedValue = (row.overallResponded || 0) === 0 ? '-' : (row.overallResponded || 0);
        const overallResponseRateValue = (row.overallResponded || 0) === 0 ? '-' : Math.round(row.overallResponseRate || 0);

        const npsValue = row.overallResponded === 0 ? '-' : Math.round((row.nps || 0) * 100) / 100;
        const cxoNpsValue = row.cxoResponded === 0 ? '-' : Math.round((row.cxoNps || 0) * 100) / 100;
        const nonCxoNpsValue = row.nonCxoResponded === 0 ? '-' : Math.round((row.nonCxoNps || 0) * 100) / 100;

        const polledValue = row.polled || 0;
        const respondedValue = row.responded || 0;

        const dataRow = worksheet.addRow([
          index + 1,
          normalizeBusinessUnitDisplay(row.businessUnit),
          polledValue,
          respondedValue,
          overallResponseRateValue,
          npsValue,
          row.cxoPolled,
          cxoRespondedValue,
          cxoResponseRateValue,
          cxoNpsValue,
          row.nonCxoPolled,
          nonCxoRespondedValue,
          nonCxoResponseRateValue,
          nonCxoNpsValue
        ]);

        // Style overall Response % cell (column 5)
        const overallResponseRateCell = dataRow.getCell(5);
        const overallResponseRate = row.overallResponseRate || 0;
        if ((row.overallResponded || 0) === 0 || overallResponseRate === 0) {
          // For zero Response %, use Red color
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
          overallResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        } else if (overallResponseRate >= 75) {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75%
          overallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if (overallResponseRate >= 50 && overallResponseRate < 75) {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          overallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          overallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          overallResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        
        // Set number format for Response % column with % symbol (no decimal)
        overallResponseRateCell.numFmt = '0"%"';
        

        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          // Determine if this column is numeric
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Polled (numeric), Column 4: Responded (numeric), Column 5: Response% (numeric), Column 6: NPS (numeric), 
          // Column 7: CXOs Polled (numeric), Column 8: CXOs Responded (numeric), Column 9: CXOs Response% (numeric), Column 10: CXO NPS (numeric), 
          // Column 11: Non-CXOs Polled (numeric), Column 12: Non-CXOs Responded (numeric), Column 13: Non-CXOs Response% (numeric), Column 14: Non-CXO NPS (numeric)
          const isNumericColumn = colNumber > 2; // After Sr. No. and Business Unit
          
          // Set cell format for numeric columns
          if (isNumericColumn) {
            if (colNumber === 5 || colNumber === 9 || colNumber === 13) {
              // Response% columns - format as number with % symbol (no decimal)
              cell.numFmt = '0"%"'; // Format as number with % symbol (no decimal)
            } else if (colNumber === 6 || colNumber === 10 || colNumber === 14) {
              // NPS columns - format as number with 2 decimal places
              cell.numFmt = '0.00'; // Format as number with 2 decimal places
            } else {
              // Polled and Responded columns - format as number
              cell.numFmt = '0'; // Format as number
            }
          }
          
          // Set alignment - this must be done after setting format
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = { 
            horizontal: isNumericColumn ? 'center' : 'left', 
            vertical: 'middle',
            wrapText: false,
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });
        
        // Reapply alignment to response rate cells after color coding to ensure it's preserved
        // Explicitly set alignment with all properties
        overallResponseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Set row height to ensure proper vertical alignment
        dataRow.height = 30;
      });

      // Add grand total row (Org Level)
      if (cxoAnalysisGrandTotals) {
        // Ensure Responded values are integers (no decimals) for Org Level row
        const grandTotalCxoResponded = cxoAnalysisGrandTotals.totalCxoResponded === 0 ? 0 : Math.round(cxoAnalysisGrandTotals.totalCxoResponded);
        const grandTotalCxoResponseRate = cxoAnalysisGrandTotals.totalCxoResponded === 0 ? 0 : Math.round(cxoAnalysisGrandTotals.cxoOverallResponseRate);
        const grandTotalNonCxoResponded = cxoAnalysisGrandTotals.totalNonCxoResponded === 0 ? 0 : Math.round(cxoAnalysisGrandTotals.totalNonCxoResponded);
        const grandTotalNonCxoResponseRate = cxoAnalysisGrandTotals.totalNonCxoResponded === 0 ? 0 : Math.round(cxoAnalysisGrandTotals.nonCxoOverallResponseRate);

        const grandTotalOverallResponded = (cxoAnalysisGrandTotals.totalOverallResponded || 0) === 0 ? '-' : Math.round(cxoAnalysisGrandTotals.totalOverallResponded || 0);
        const grandTotalOverallResponseRate = (cxoAnalysisGrandTotals.totalOverallResponded || 0) === 0 ? '-' : Math.round(cxoAnalysisGrandTotals.overallResponseRate || 0);

        const grandTotalNps = cxoAnalysisGrandTotals.totalOverallResponded === 0 ? '-' : Math.round((cxoAnalysisGrandTotals.nps || 0) * 100) / 100;
        const grandTotalCxoNps = cxoAnalysisGrandTotals.totalCxoResponded === 0 ? '-' : Math.round((cxoAnalysisGrandTotals.cxoNps || 0) * 100) / 100;
        const grandTotalNonCxoNps = cxoAnalysisGrandTotals.totalNonCxoResponded === 0 ? '-' : Math.round((cxoAnalysisGrandTotals.nonCxoNps || 0) * 100) / 100;

        const grandTotalPolled = Math.round(cxoAnalysisGrandTotals.totalOverallPolled || 0);
        const grandTotalResponded = Math.round(cxoAnalysisGrandTotals.totalOverallResponded || 0);

        const grandTotalRow = worksheet.addRow([
          '',
          'Org Level',
          grandTotalPolled,
          grandTotalResponded,
          grandTotalOverallResponseRate,
          grandTotalNps,
          Math.round(cxoAnalysisGrandTotals.totalCxoPolled || 0),
          grandTotalCxoResponded,
          grandTotalCxoResponseRate,
          grandTotalCxoNps,
          Math.round(cxoAnalysisGrandTotals.totalNonCxoPolled || 0),
          grandTotalNonCxoResponded,
          grandTotalNonCxoResponseRate,
          grandTotalNonCxoNps
        ]);

        // Style grand total row
        grandTotalRow.eachCell((cell, colNumber) => {
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          // Determine if this column is numeric
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Polled (numeric), Column 4: Responded (numeric), Column 5: Response% (numeric), Column 6: NPS (numeric), 
          // Column 7: CXOs Polled (numeric), Column 8: CXOs Responded (numeric), Column 9: CXOs Response% (numeric), Column 10: CXO NPS (numeric), 
          // Column 11: Non-CXOs Polled (numeric), Column 12: Non-CXOs Responded (numeric), Column 13: Non-CXOs Response% (numeric), Column 14: Non-CXO NPS (numeric)
          const isNumericColumn = colNumber > 2; // After Sr. No. and Business Unit
          
          // Set cell format for numeric columns
          if (isNumericColumn) {
            if (colNumber === 5 || colNumber === 9 || colNumber === 13) {
              // Response% columns - format as number with % symbol (no decimal)
              cell.numFmt = '0"%"'; // Format as number with % symbol (no decimal)
            } else if (colNumber === 6 || colNumber === 10 || colNumber === 14) {
              // NPS columns - format as number with 2 decimal places
              cell.numFmt = '0.00'; // Format as number with 2 decimal places
        } else {
              // Polled and Responded columns - format as number
              cell.numFmt = '0'; // Format as number
            }
          }
          
          // Set alignment - this must be done after all formatting
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = { 
            horizontal: isNumericColumn ? 'center' : 'left', 
            vertical: 'middle',
            wrapText: false,
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });

        // Style grand total overall Response % cell (column 5)
        const grandTotalOverallResponseRateCell = grandTotalRow.getCell(5);
        if ((cxoAnalysisGrandTotals.totalOverallResponded || 0) === 0) {
          grandTotalOverallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
          grandTotalOverallResponseRateCell.font = { color: { argb: 'FF6B7280' }, bold: true };
        } else if ((cxoAnalysisGrandTotals.overallResponseRate || 0) >= 75) {
          grandTotalOverallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          grandTotalOverallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else if ((cxoAnalysisGrandTotals.overallResponseRate || 0) >= 50 && (cxoAnalysisGrandTotals.overallResponseRate || 0) < 75) {
          grandTotalOverallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          grandTotalOverallResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          grandTotalOverallResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          grandTotalOverallResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        }
        
        // Set number format for Response % column with % symbol (no decimal)
        grandTotalOverallResponseRateCell.numFmt = '0"%"';
        
        // Style grand total CXO Response % cell (column 9)
        const grandTotalCxoResponseRateCell = grandTotalRow.getCell(9);
        grandTotalCxoResponseRateCell.numFmt = '0"%"';
        grandTotalCxoResponseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Style grand total Non-CXO Response % cell (column 13)
        const grandTotalNonCxoResponseRateCell = grandTotalRow.getCell(13);
        grandTotalNonCxoResponseRateCell.numFmt = '0"%"';
        grandTotalNonCxoResponseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Explicitly set number format for Responded columns (4, 8, 12) to ensure no decimals
        const grandTotalRespondedCell = grandTotalRow.getCell(4); // Column 4: Responded
        grandTotalRespondedCell.numFmt = '0'; // No decimals
        grandTotalRespondedCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        const grandTotalCxoRespondedCell = grandTotalRow.getCell(8); // Column 8: CXOs Responded
        grandTotalCxoRespondedCell.numFmt = '0'; // No decimals
        grandTotalCxoRespondedCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        const grandTotalNonCxoRespondedCell = grandTotalRow.getCell(12); // Column 12: Non-CXOs Responded
        grandTotalNonCxoRespondedCell.numFmt = '0'; // No decimals
        grandTotalNonCxoRespondedCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Style grand total NPS cell (column 6)
        const grandTotalNpsCell = grandTotalRow.getCell(6);
        grandTotalNpsCell.numFmt = '0.00';
        grandTotalNpsCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Style grand total CXO NPS cell (column 10)
        const grandTotalCxoNpsCell = grandTotalRow.getCell(10);
        grandTotalCxoNpsCell.numFmt = '0.00';
        grandTotalCxoNpsCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Style grand total Non-CXO NPS cell (column 14)
        const grandTotalNonCxoNpsCell = grandTotalRow.getCell(14);
        grandTotalNonCxoNpsCell.numFmt = '0.00';
        grandTotalNonCxoNpsCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };

        // Reapply alignment to grand total response rate cells after color coding to ensure it's preserved
        // Explicitly set alignment with all properties
        grandTotalOverallResponseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        
        // Set row height to ensure proper vertical alignment
        grandTotalRow.height = 30;
      }

      // Add legend section
      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['📊 Response Rate Legend']);
      const legendTitleRowNum = legendTitleRow.number;
      legendTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
      legendTitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      legendTitleRow.height = 35;
      worksheet.mergeCells(`A${legendTitleRowNum}:C${legendTitleRowNum}`);

      const legendItem1 = worksheet.addRow(['Green: ≥75%']);
      const legendItem1Num = legendItem1.number;
      legendItem1.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true };
      legendItem1.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      legendItem1.height = 25;
      worksheet.mergeCells(`A${legendItem1Num}:C${legendItem1Num}`);

      const legendItem2 = worksheet.addRow(['Orange: 50% to 74%']);
      const legendItem2Num = legendItem2.number;
      legendItem2.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true };
      legendItem2.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange (Excel standard)
      legendItem2.height = 25;
      worksheet.mergeCells(`A${legendItem2Num}:C${legendItem2Num}`);

      const legendItem3 = worksheet.addRow(['Red: < 50%']);
      const legendItem3Num = legendItem3.number;
      legendItem3.getCell(1).font = { size: 12, color: { argb: 'FFFFFFFF' }, bold: true };
      legendItem3.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel standard)
      legendItem3.height = 25;
      worksheet.mergeCells(`A${legendItem3Num}:C${legendItem3Num}`);

      const legendItem4 = worksheet.addRow(['Gray: No surveys received (0)']);
      const legendItem4Num = legendItem4.number;
      legendItem4.getCell(1).font = { size: 12, color: { argb: 'FF6B7280' }, bold: true };
      legendItem4.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem4.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      legendItem4.height = 25;
      worksheet.mergeCells(`A${legendItem4Num}:C${legendItem4Num}`);

      // Set column widths
      worksheet.columns = [
        { width: 10 },
        { width: 20 },
        { width: 15 },
        { width: 18 },
        { width: 20 },
        { width: 18 },
        { width: 20 },
        { width: 22 }
      ];

      // Note: Alignment is already set per cell above, so we don't need to override it here
      // The alignment settings from the individual cell styling will be preserved

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CXO_and_Non_CXO_Response_Rate_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CXO analysis to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  // Export to Excel
  const exportAcsatTrendAnalysisToExcel = async () => {
    if (!acsatTrendAnalysisData?.length || !acsatTrendAnalysisData.some((f) => f.hasData)) {
      alert('No ACSAT trend analysis data to download');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const cellBorder = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      };

      const isBuTrendExport = acsatTrendViewMode === 'bu';

      acsatTrendAnalysisData.forEach((fileData, fileIdx) => {
        const rawName = (fileData.saveName || `Trend ${fileIdx + 1}`).replace(/[\\/*?:\[\]]/g, '').trim();
        const sheetName = rawName.substring(0, 31) || `Trend ${fileIdx + 1}`;
        const ws = workbook.addWorksheet(sheetName);

        const headers = isBuTrendExport
          ? ['Sr. No.', 'Business Unit', 'Polled', 'Responded', 'Response%']
          : ['Sr. No.', 'Business Unit', 'Account Name', 'Polled', 'Responded', 'Response%'];
        const headerRow = ws.addRow(headers);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } };
          cell.border = cellBorder;
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });

        const responseRateColNumber = isBuTrendExport ? 5 : 6;
        const textColCount = isBuTrendExport ? 2 : 3;

        (fileData.rows || []).forEach((row, rowIdx) => {
          const responded = row.responded ?? 0;
          const dataRow = ws.addRow(
            isBuTrendExport
              ? [
                  rowIdx + 1,
                  normalizeBusinessUnitDisplay(row.businessUnit),
                  row.polled ?? 0,
                  responded,
                  responded === 0 ? 0 : roundResponseRateOneDecimal(row.responseRatePct),
                ]
              : [
                  rowIdx + 1,
                  normalizeBusinessUnitDisplay(row.businessUnit),
                  row.customerName || '',
                  row.polled ?? 0,
                  responded,
                  responded === 0 ? 0 : roundResponseRateOneDecimal(row.responseRatePct),
                ]
          );
          dataRow.eachCell((cell, colNumber) => {
            cell.border = cellBorder;
            cell.alignment = { horizontal: colNumber <= textColCount ? 'left' : 'center', vertical: 'middle' };
          });
          styleTrendAnalysisResponseRateExcelCell(dataRow.getCell(responseRateColNumber), row.responseRatePct, responded);
        });

        if (fileData.grandTotal) {
          const gt = fileData.grandTotal;
          const gtResponded = gt.responded ?? 0;
          const gtRow = ws.addRow(
            isBuTrendExport
              ? [
                  '',
                  gt.businessUnit || 'Org Level',
                  gt.polled ?? 0,
                  gtResponded,
                  gtResponded === 0 ? 0 : roundResponseRateOneDecimal(gt.responseRatePct),
                ]
              : [
                  '',
                  '',
                  gt.customerName || 'Grand Total',
                  gt.polled ?? 0,
                  gtResponded,
                  gtResponded === 0 ? 0 : roundResponseRateOneDecimal(gt.responseRatePct),
                ]
          );
          gtRow.eachCell((cell, colNumber) => {
            cell.border = cellBorder;
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
            cell.alignment = { horizontal: colNumber <= textColCount ? 'left' : 'center', vertical: 'middle' };
          });
          styleTrendAnalysisResponseRateExcelCell(gtRow.getCell(responseRateColNumber), gt.responseRatePct, gtResponded);
        }

        if (!isBuTrendExport && acsatTrendViewMode === 'top10' && fileData.otherAccountsRow) {
          const other = fileData.otherAccountsRow;
          const otherResponded = other.responded ?? 0;
          const otherRow = ws.addRow([
            '',
            '',
            other.customerName || 'Other Accounts',
            other.polled ?? 0,
            otherResponded,
            otherResponded === 0 ? 0 : roundResponseRateOneDecimal(other.responseRatePct),
          ]);
          otherRow.eachCell((cell, colNumber) => {
            cell.border = cellBorder;
            cell.font = { bold: true, color: { argb: 'FF000000' } };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
            cell.alignment = { horizontal: colNumber <= textColCount ? 'left' : 'center', vertical: 'middle' };
          });
          styleTrendAnalysisResponseRateExcelCell(
            otherRow.getCell(responseRateColNumber),
            other.responseRatePct,
            otherResponded
          );
        }

        ws.getColumn(1).width = 10;
        ws.getColumn(2).width = 22;
        if (!isBuTrendExport) ws.getColumn(3).width = 35;
        ws.getColumn(isBuTrendExport ? 3 : 4).width = 12;
        ws.getColumn(isBuTrendExport ? 4 : 5).width = 14;
        ws.getColumn(responseRateColNumber).width = 16;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download =
        isBuTrendExport
          ? `ACSAT_BU_Wise_Response_Rate_Trend_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`
          : acsatTrendViewMode === 'top10'
            ? `ACSAT_Top_10_Account_Response_Rate_Trend_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`
            : `ACSAT_Account_Wise_Response_Rate_Trend_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting ACSAT trend analysis to Excel:', error);
      alert('Error exporting trend analysis to Excel. Please try again.');
    }
  };

  const exportToExcel = async () => {
    if (!processedData || processedData.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      const ExcelJS = await import('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(
        showTop10 ? 'Top 10 Account - Response Rate Dashboard' :
        groupByBU ? 'BU wise Response Rate Dashboard' :
        'Response Rate Dashboard'
      );

      const includeTrendExportCols =
        !showCXOAnalysis &&
        showAcsatTrendAnalysis &&
        acsatTrendAnalysisData.length > 0 &&
        (isAccountWiseView || isBuWiseView || isTop10View);

      // Add headers
      const headers = [
        'Sr. No.',
        'Business Unit',
        !groupByBU ? 'Account Name' : null,
        'Polled',
        'Responded',
        'Response%',
        ...(includeTrendExportCols
          ? acsatTrendAnalysisData.map((fileData) =>
              trendColumnHeaderLabel(fileData, acsatTrendAnalysisData.length)
            )
          : []),
      ].filter(Boolean);

      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        // All headers should be center aligned both horizontally and vertically
        cell.alignment = { 
          horizontal: 'center', 
          vertical: 'middle',
          wrapText: true,
          indent: 0,
          readingOrder: 'left-to-right'
        };
      });
      
      // Set header row height to ensure proper vertical alignment
      headerRow.height = 30;

      // Add data rows
      displayData.forEach(row => {
          const surveysReceivedValue = row.surveysReceived === 0 ? 0 : (row.surveysReceived || 0);
          const responseRateValue = row.surveysReceived === 0 ? 0 : (Math.round((row.responseRate || 0) * 10) / 10);
          
        const trendExportValues = includeTrendExportCols
          ? acsatTrendAnalysisData.map((fileData, fileIdx) => {
              const trendRow = getTrendRowForDashboard(
                fileIdx, row, groupByBU, acsatTrendAccountLookups, acsatTrendBuLookups
              );
              const diff = computeResponseRateTrendDiff(responseRateValue, trendRow);
              return formatResponseRateTrendDiffDisplay(diff).text;
            })
          : [];

        const dataRow = worksheet.addRow([
          row.id,
          normalizeBusinessUnitDisplay(row.businessUnit),
          !groupByBU ? row.customerName : null,
          row.surveysSent || 0,
            surveysReceivedValue,
            responseRateValue,
            ...trendExportValues,
        ].filter(v => v !== null && v !== undefined));

        // Style response rate cell based on value
          // Calculate the correct column index based on whether account name is included
          const responseRateColumnNumber = groupByBU ? 5 : 6; // Column 5 for BU view, 6 for account view
          const respondedColumnNumber = groupByBU ? 4 : 5; // Column 4 for BU view, 5 for account view
          const responseRateCell = dataRow.getCell(responseRateColumnNumber);
          const respondedCell = dataRow.getCell(respondedColumnNumber);
          // Ensure value and format are set first for Responded column
          respondedCell.value = surveysReceivedValue;
          respondedCell.numFmt = '0';
          // Ensure value and format are set first for Response Rate column
          responseRateCell.value = responseRateValue;
          responseRateCell.numFmt = '0.0"%"';
          if (row.surveysReceived === 0 || row.responseRate === 0) {
            // For zero Response %, use Red color
            responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red for zero Response %
            responseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
          } else if (row.responseRate >= 75) {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
          responseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else if (row.responseRate >= 50 && row.responseRate < 75) {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
          responseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
        } else {
          responseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red <50% (Excel standard)
          responseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
        }

        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          // Determine if this column is numeric
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
          // Column 4: Polled (numeric), Column 5: Responded (numeric), Column 6: Response% (numeric)
          const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
          
          // Set cell format for numeric columns
          if (isNumericColumn) {
            if (colNumber === responseRateColumnNumber) {
              // Response% column - format as number with decimal and % sign
              cell.numFmt = '0.0"%"'; // Format as number with 1 decimal place and % sign
              // Ensure the value is explicitly set as a number
              if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
                cell.value = 0;
              }
            } else {
              // Polled and Responded columns - format as number
              cell.numFmt = '0'; // Format as number
              // Ensure the value is explicitly set as a number
              if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
                cell.value = 0;
              }
            }
          }
          
          // Set alignment - this must be done after setting format
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = { 
            horizontal: isNumericColumn ? 'center' : 'left', 
            vertical: 'middle',
            wrapText: false,
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });
        
        // Reapply alignment and format to response rate cell after color coding to ensure it's preserved
        // Explicitly set alignment with all properties
        responseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        // Ensure number format and value are applied
        responseRateCell.numFmt = '0.0"%"';
        responseRateCell.value = responseRateValue;
        // Ensure value is explicitly a number
        if (responseRateCell.value === 0 || responseRateCell.value === '0' || responseRateCell.value === null || responseRateCell.value === undefined) {
          responseRateCell.value = 0;
        }

        if (includeTrendExportCols) {
          const trendColStart = groupByBU ? 6 : 7;
          acsatTrendAnalysisData.forEach((fileData, fileIdx) => {
            const trendRow = getTrendRowForDashboard(
              fileIdx, row, groupByBU, acsatTrendAccountLookups, acsatTrendBuLookups
            );
            const diff = computeResponseRateTrendDiff(responseRateValue, trendRow);
            const trendCell = dataRow.getCell(trendColStart + fileIdx);
            styleTrendDiffExcelCell(trendCell, diff);
            trendCell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
          });
        }
        
        // Set row height to ensure proper vertical alignment
        dataRow.height = 30;
      });

      // Add grand total row
      const grandTotalSurveysReceived = grandTotals.totalReceived === 0 ? 0 : (grandTotals.totalReceived || 0);
      const grandTotalResponseRate = grandTotals.totalReceived === 0 ? 0 : (Math.round((grandTotals.overallResponseRate || 0) * 10) / 10);
      
      // Build grand total row based on view type
      const grandTotalRowData = [];
      
      // Sr. No. column - empty for all views
      grandTotalRowData.push('');
      
      // Business Unit column
      if (showTop10) {
        // Top 10: empty Business Unit
        grandTotalRowData.push('');
      } else if (groupByBU) {
        // BU-wise: "Org Level" in Business Unit
        grandTotalRowData.push('Org Level');
      } else {
        // Account-wise: empty Business Unit
        grandTotalRowData.push('');
      }
      
      // Account Name column (only for account-wise view)
      if (!groupByBU) {
        grandTotalRowData.push(showTop10 ? 'Top 10 Accounts' : 'Grand Total');
      }
      
      // Rest of the columns
      grandTotalRowData.push(grandTotals.totalSent);
      grandTotalRowData.push(grandTotalSurveysReceived);
      grandTotalRowData.push(grandTotalResponseRate);
      if (includeTrendExportCols) {
        acsatTrendAnalysisData.forEach((fileData) => {
          const gt = fileData.grandTotal;
          const diff = gt
            ? computeResponseRateTrendDiff(grandTotalResponseRate, gt)
            : null;
          grandTotalRowData.push(formatResponseRateTrendDiffDisplay(diff).text);
        });
      }

      const grandTotalRow = worksheet.addRow(grandTotalRowData.filter(v => v !== null));

      // Style grand total response rate cell
      // Calculate the correct column index based on whether account name is included
      const grandTotalResponseRateColumnNumber = groupByBU ? 5 : 6; // Column 5 for BU view, 6 for account view
      const grandTotalRespondedColumnNumber = groupByBU ? 4 : 5; // Column 4 for BU view, 5 for account view
      const grandTotalRespondedCell = grandTotalRow.getCell(grandTotalRespondedColumnNumber);
      // Ensure value and format are set for Responded column
      grandTotalRespondedCell.value = grandTotalSurveysReceived;
      grandTotalRespondedCell.numFmt = '0';

      // Style grand total row
      grandTotalRow.eachCell((cell, colNumber) => {
        // Determine if this column is numeric first
        // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
        // Column 4: Polled (numeric), Column 5: Responded (numeric), Column 6: Response% (numeric)
        const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
        
        // Apply formatting
        cell.font = { bold: true, color: { argb: 'FF000000' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        
        // Set cell format for numeric columns
        if (isNumericColumn) {
          if (colNumber === grandTotalResponseRateColumnNumber) {
            // Response% column - format as number with decimal and % sign
            cell.numFmt = '0.0"%"'; // Format as number with 1 decimal place and % sign
            // Ensure the value is explicitly set as a number
            if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
              cell.value = 0;
            }
          } else {
            // Polled and Responded columns - format as number
            cell.numFmt = '0'; // Format as number
            // Ensure the value is explicitly set as a number
            if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
              cell.value = 0;
            }
          }
        }
        
        // Set alignment - this must be done after all formatting
        // Explicitly set alignment to ensure Excel respects it
        cell.alignment = { 
          horizontal: isNumericColumn ? 'center' : 'left', 
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
      });
      const grandTotalResponseRateCell = grandTotalRow.getCell(grandTotalResponseRateColumnNumber);
      // Ensure number format and value are applied first
      grandTotalResponseRateCell.numFmt = '0.0"%"';
      grandTotalResponseRateCell.value = grandTotalResponseRate;
      // Ensure value is explicitly a number
      if (grandTotalResponseRateCell.value === 0 || grandTotalResponseRateCell.value === '0' || grandTotalResponseRateCell.value === null || grandTotalResponseRateCell.value === undefined) {
        grandTotalResponseRateCell.value = 0;
      }
      if (grandTotals.totalReceived === 0) {
        // For zero surveys received, use black font with no background color
        grandTotalResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
        // Remove any fill to have no background color
        grandTotalResponseRateCell.fill = undefined;
      } else if (grandTotals.overallResponseRate >= 75) {
        grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
        grandTotalResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
      } else if (grandTotals.overallResponseRate >= 50 && grandTotals.overallResponseRate < 75) {
        grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
        grandTotalResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
      } else {
        grandTotalResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red 0%-50% (Excel standard)
        grandTotalResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
      }
      
      // Reapply alignment to grand total response rate cell after color coding to ensure it's preserved
      // Explicitly set alignment with all properties
      grandTotalResponseRateCell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
        wrapText: false,
        indent: 0,
        readingOrder: 'left-to-right'
      };

      if (includeTrendExportCols) {
        const trendColStart = groupByBU ? 6 : 7;
        acsatTrendAnalysisData.forEach((fileData, fileIdx) => {
          const gt = fileData.grandTotal;
          const diff = gt ? computeResponseRateTrendDiff(grandTotalResponseRate, gt) : null;
          const trendCell = grandTotalRow.getCell(trendColStart + fileIdx);
          styleTrendDiffExcelCell(trendCell, diff);
          trendCell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } },
          };
        });
      }
      
      // Set row height to ensure proper vertical alignment
      grandTotalRow.height = 30;

      // Add Other Account Row - Only for Top 10 view
      if (showTop10 && otherAccountTotals) {
        const otherAccountSurveysReceived = otherAccountTotals.totalReceived === 0 ? 0 : (otherAccountTotals.totalReceived || 0);
        const otherAccountResponseRate = otherAccountTotals.totalReceived === 0 ? 0 : (Math.round((otherAccountTotals.overallResponseRate || 0) * 10) / 10);
        
        // For Top 10 view, groupByBU is false, so columns are: Sr. No. (1), Business Unit (2), Account Name (3), Polled (4), Responded (5), Response% (6)
        const otherAccountTrendCols = includeTrendExportCols
          ? acsatTrendAnalysisData.map((fileData) => {
              const otherTrend = fileData.otherAccountsRow;
              const diff = otherTrend
                ? computeResponseRateTrendDiff(otherAccountResponseRate, otherTrend)
                : null;
              return formatResponseRateTrendDiffDisplay(diff).text;
            })
          : [];
        const otherAccountRowData = showTop10 && !groupByBU
          ? [
              '', // Empty Sr. No. for Top 10 Other Account row
              '', // Empty Business Unit
              'Other Accounts', // Account Name
              otherAccountTotals.totalSent, // Polled
              otherAccountSurveysReceived, // Responded
              otherAccountResponseRate, // Response%
              ...otherAccountTrendCols,
            ]
          : [
              '', // Empty Sr. No.
              'Other Accounts', // Business Unit
              otherAccountTotals.totalSent, // Polled
              otherAccountSurveysReceived, // Responded
              otherAccountResponseRate // Response%
            ];
        
        const otherAccountRow = worksheet.addRow(otherAccountRowData);

        // Style other account response rate cell
        // For Top 10 view, groupByBU is false, so columns are: Sr. No. (1), Business Unit (2), Account Name (3), Polled (4), Responded (5), Response% (6)
        // For Top 10 view, the column structure is the same (6 columns), so Response% is still column 6
        const otherAccountResponseRateColumnNumber = groupByBU ? 5 : 6;
        const otherAccountRespondedColumnNumber = groupByBU ? 4 : 5; // Column 4 for BU view, 5 for account view
        const otherAccountRespondedCell = otherAccountRow.getCell(otherAccountRespondedColumnNumber);
        // Ensure value and format are set for Responded column
        otherAccountRespondedCell.value = otherAccountSurveysReceived;
        otherAccountRespondedCell.numFmt = '0';

        // Style other account row
        otherAccountRow.eachCell((cell, colNumber) => {
          // Determine if this column is numeric first
          // Column 1: Sr. No. (text), Column 2: Business Unit (text), Column 3: Account Name (text if exists), 
          // Column 4: Polled (numeric), Column 5: Responded (numeric), Column 6: Response% (numeric)
          const isNumericColumn = colNumber > (groupByBU ? 2 : 3); // After Sr. No., Business Unit, and Account Name (if exists)
          
          // Apply formatting
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } }; // Light orange/amber background
          cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } },
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
          };
          
          // Set cell format for numeric columns
          if (isNumericColumn) {
            if (colNumber === otherAccountResponseRateColumnNumber) {
              // Response% column - format as number with decimal and % sign
              cell.numFmt = '0.0"%"'; // Format as number with 1 decimal place and % sign
              // Ensure the value is explicitly set as a number
              if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
                cell.value = 0;
              }
            } else {
              // Polled and Responded columns - format as number
              cell.numFmt = '0'; // Format as number
              // Ensure the value is explicitly set as a number
              if (cell.value === 0 || cell.value === '0' || cell.value === null || cell.value === undefined) {
                cell.value = 0;
              }
            }
          }
          
          // Set alignment - this must be done after all formatting
          // Explicitly set alignment to ensure Excel respects it
          cell.alignment = { 
            horizontal: isNumericColumn ? 'center' : 'left', 
            vertical: 'middle',
            wrapText: false,
            indent: 0,
            readingOrder: 'left-to-right'
          };
        });
        const otherAccountResponseRateCell = otherAccountRow.getCell(otherAccountResponseRateColumnNumber);
        
        // Ensure the response rate value and format are set correctly first
        otherAccountResponseRateCell.value = otherAccountResponseRate;
        otherAccountResponseRateCell.numFmt = '0.0"%"';
        if (otherAccountTotals.totalReceived === 0) {
          otherAccountResponseRateCell.value = 0;
          otherAccountResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true };
          // Remove any fill to have no background color
          otherAccountResponseRateCell.fill = undefined;
        } else {
          otherAccountResponseRateCell.value = Math.round(otherAccountTotals.overallResponseRate * 10) / 10;
          if (otherAccountTotals.overallResponseRate >= 75) {
            otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // Light Green 2 >=75% (Excel standard)
            otherAccountResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
          } else if (otherAccountTotals.overallResponseRate >= 50 && otherAccountTotals.overallResponseRate < 75) {
            otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange 50%-75% (Excel standard)
            otherAccountResponseRateCell.font = { color: { argb: 'FF000000' }, bold: true }; // Black text
          } else {
            otherAccountResponseRateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red 0%-50% (Excel standard)
            otherAccountResponseRateCell.font = { color: { argb: 'FFFFFFFF' }, bold: true }; // White text
          }
        }
        
        // Reapply alignment and format to other account response rate cell after color coding to ensure it's preserved
        // Explicitly set alignment with all properties
        otherAccountResponseRateCell.alignment = {
          horizontal: 'center',
          vertical: 'middle',
          wrapText: false,
          indent: 0,
          readingOrder: 'left-to-right'
        };
        // Ensure number format and value are reapplied
        otherAccountResponseRateCell.numFmt = '0.0"%"';
        otherAccountResponseRateCell.value = otherAccountResponseRate;
        // Ensure value is explicitly a number
        if (otherAccountResponseRateCell.value === 0 || otherAccountResponseRateCell.value === '0' || otherAccountResponseRateCell.value === null || otherAccountResponseRateCell.value === undefined) {
          otherAccountResponseRateCell.value = 0;
        }

        if (includeTrendExportCols) {
          const trendColStart = 7;
          acsatTrendAnalysisData.forEach((fileData, fileIdx) => {
            const otherTrend = fileData.otherAccountsRow;
            const diff = otherTrend
              ? computeResponseRateTrendDiff(otherAccountResponseRate, otherTrend)
              : null;
            const trendCell = otherAccountRow.getCell(trendColStart + fileIdx);
            styleTrendDiffExcelCell(trendCell, diff);
            trendCell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
            trendCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFED7AA' } };
          });
        }
        
        // Set row height to ensure proper vertical alignment
        otherAccountRow.height = 30;
      }

      // Add formula section with NPS Dashboard style formatting
      worksheet.addRow([]);
      const formulaTitleRow = worksheet.addRow(['📊 Response Rate Calculation Formula']);
      const formulaTitleRowNum = formulaTitleRow.number;
      formulaTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
      formulaTitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      formulaTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      formulaTitleRow.height = 35;
      worksheet.mergeCells(`A${formulaTitleRowNum}:C${formulaTitleRowNum}`);
      
      const formulaRow = worksheet.addRow(['Response% = (Responded ÷ Polled) × 100']);
      const formulaRowNum = formulaRow.number;
      formulaRow.getCell(1).font = { size: 12, color: { argb: 'FF374151' }, bold: true };
      formulaRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      formulaRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
      formulaRow.height = 30;
      worksheet.mergeCells(`A${formulaRowNum}:C${formulaRowNum}`);

      // Add legend section with NPS Dashboard style formatting
      worksheet.addRow([]);
      const legendTitleRow = worksheet.addRow(['📊 Response Rate Legend']);
      const legendTitleRowNum = legendTitleRow.number;
      legendTitleRow.getCell(1).font = { bold: true, size: 14, color: { argb: 'FF1D4ED8' } };
      legendTitleRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendTitleRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
      legendTitleRow.height = 35;
      worksheet.mergeCells(`A${legendTitleRowNum}:C${legendTitleRowNum}`);
      
      // Add legend items in separate rows with merged cells and left alignment
      const legendItem1 = worksheet.addRow(['Green: ≥75%']);
      const legendItem1Num = legendItem1.number;
      legendItem1.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true };
      legendItem1.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem1.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
      legendItem1.height = 25;
      worksheet.mergeCells(`A${legendItem1Num}:C${legendItem1Num}`);
      
      const legendItem2 = worksheet.addRow(['Orange: 50% to 74%']);
      const legendItem2Num = legendItem2.number;
      legendItem2.getCell(1).font = { size: 12, color: { argb: 'FF000000' }, bold: true };
      legendItem2.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem2.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Orange (Excel standard)
      legendItem2.height = 25;
      worksheet.mergeCells(`A${legendItem2Num}:C${legendItem2Num}`);
      
      const legendItem3 = worksheet.addRow(['Red: < 50%']);
      const legendItem3Num = legendItem3.number;
      legendItem3.getCell(1).font = { size: 12, color: { argb: 'FFFFFFFF' }, bold: true };
      legendItem3.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem3.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel standard)
      legendItem3.height = 25;
      worksheet.mergeCells(`A${legendItem3Num}:C${legendItem3Num}`);
      
      const legendItem4 = worksheet.addRow(['Gray: No surveys received (0)']);
      const legendItem4Num = legendItem4.number;
      legendItem4.getCell(1).font = { size: 12, color: { argb: 'FF6B7280' }, bold: true };
      legendItem4.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
      legendItem4.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
      legendItem4.height = 25;
      worksheet.mergeCells(`A${legendItem4Num}:C${legendItem4Num}`);

      // Set column widths with word wrap for account names
      worksheet.columns = [
        { width: 8 },
        { width: 20 },
        { width: 35 }, // Increased width for account names
        { width: 25 },
        { width: 25 },
        { width: 18 }
      ];

      // Note: Alignment is already set per cell above, so we don't need to override it here
      // The alignment settings from the individual cell styling will be preserved

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${
        showTop10 ? 'Top_10_Account_Response_Rate_Dashboard' :
        groupByBU ? 'BU_wise_Response_Rate_Dashboard' :
        'ACSAT_Response_Rate_Dashboard'
      }_${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingMessage>Loading response rate data...</LoadingMessage>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <Title>📈 Org level/BU wise dashboard for Response Rate</Title>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <BackButton onClick={onBack}>
                <ArrowLeft size={16} />
                Back to ACSAT
              </BackButton>
            </div>
          </div>
          <ErrorMessage>{error}</ErrorMessage>
        </Header>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Title>
            {showCXOAnalysis ? '👥 CXO and Non CXO Response rate analysis' :
             showTop10 ? '🏆 Top 10 Account - Response Rate' : 
             groupByBU ? '🏢 BU wise dashboard for Response Rate' : 
             '📈 Org level/BU wise dashboard for Response Rate'}
          </Title>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <BUWiseButton onClick={() => {
              setShowCXOAnalysis(false);
              setGroupByBU(true);
              setShowTop10(false);
              setShowAcsatTrendAnalysis(false);
            }}>
              🏢 BU wise dashboard for Response Rate
            </BUWiseButton>
            <Top10Button onClick={() => {
              setShowCXOAnalysis(false);
              setShowTop10(true);
              setGroupByBU(false);
              setShowAcsatTrendAnalysis(false);
            }}>
              🏆 Top 10 Account - Response Rate
            </Top10Button>
            <ShowAllButton onClick={() => {
              setShowCXOAnalysis(false);
              if (groupByBU || showTop10) setShowAcsatTrendAnalysis(false);
              setGroupByBU(false);
              setShowTop10(false);
            }}>
              📊 Show All Accounts
            </ShowAllButton>
            <CXOAnalysisButton onClick={() => {
              setShowCXOAnalysis(true);
              setGroupByBU(false);
              setShowTop10(false);
            }}>
              👥 CXO and Non CXO Response rate analysis
            </CXOAnalysisButton>
            <DownloadButton onClick={showCXOAnalysis ? exportCXOAnalysisToExcel : exportToExcel}>
              <Download size={16} />
              Download Excel
            </DownloadButton>
            <BackButton onClick={onBack}>
              <ArrowLeft size={16} />
              Back to ACSAT
            </BackButton>
            <TrendAnalysisButton type="button" onClick={handleViewAcsatTrendAnalysis}>
              <TrendingUp size={16} />
              View ACSAT trend analysis
            </TrendAnalysisButton>
          </div>
        </div>

        {acsatCycleStartDateFormatted && (
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.75rem', 
            background: '#f0f9ff', 
            borderRadius: '6px', 
            border: '1px solid #0ea5e9',
            textAlign: 'center',
            color: '#0c4a6e',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            📅 CSAT Cycle Start Date: {acsatCycleStartDateFormatted}
          </div>
        )}
        
        {processedData.length > 0 && (
          <SuccessMessage>
            ✅ Data loaded successfully! {
              showTop10 ? `Showing Top 10 accounts: ${displayData.length} of ${processedData.length} accounts` :
              groupByBU ? `Showing ${displayData.length} business units` :
              `Showing ${displayData.length} of ${processedData.length} accounts`
            }
          </SuccessMessage>
        )}
      </Header>

      {/* Response Rate Calculation Formula */}
      {!showCXOAnalysis && (
      <FormulaContainer>
        <FormulaTitle>📊 Response Rate Calculation Formula</FormulaTitle>
        <FormulaText>
            <strong>Response% = (Responded / Polled) × 100</strong>
        </FormulaText>
        <FormulaText style={{ marginTop: '0.5rem' }}>
          This formula calculates the percentage of surveys that were completed out of the total surveys sent to each account.
        </FormulaText>
      </FormulaContainer>
      )}

       {/* Search Container */}
       {!showCXOAnalysis && (
       <SearchContainer>
         <Search size={20} color="#6b7280" />
        <SearchInput
          type="text"
          placeholder={
            showTop10 ? "Search by top 10 account name..." :
            groupByBU ? "Search by business unit..." :
            "Search by account name..."
          }
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
         {searchTerm && (
           <ClearButton onClick={() => setSearchTerm('')} title="Clear search">
             <X size={16} />
           </ClearButton>
         )}
       </SearchContainer>
       )}

       {/* Response Rate Color Legend */}
      {!showCXOAnalysis && (
       <LegendContainer>
         <LegendTitle>📊 Response Rate Color Legend</LegendTitle>
         <LegendItem>
           <LegendColor style={{ backgroundColor: '#FF0000' }} />
            <LegendText>Red &lt; 50%</LegendText>
         </LegendItem>
         <LegendItem>
           <LegendColor style={{ backgroundColor: '#FFA500' }} />
            <LegendText>Orange = 50% to 74%</LegendText>
         </LegendItem>
         <LegendItem>
            <LegendColor style={{ backgroundColor: '#C6EFCE' }} />
            <LegendText>Green &gt;= 75%</LegendText>
         </LegendItem>
        <LegendItem>
          <LegendColor style={{ backgroundColor: '#f3f4f6' }} />
          <LegendText>Gray = No surveys received (0)</LegendText>
         </LegendItem>
       </LegendContainer>
      )}

      {/* CXO and Non-CXO Response Rate Analysis Table */}
      {showCXOAnalysis && cxoAnalysisData && (
      <ScrollableTableContainer>
        <Table>
          <TableHeader>
            {/* First header row with merged cells */}
            <tr>
                <TableHeaderCell rowSpan="2">Sr. No.</TableHeaderCell>
                <TableHeaderCell rowSpan="2">Business Unit</TableHeaderCell>
                <TableHeaderCell colSpan="4">Overall</TableHeaderCell>
                <TableHeaderCell colSpan="4">CXO</TableHeaderCell>
                <TableHeaderCell colSpan="4">Non-CXO</TableHeaderCell>
              </tr>
            {/* Second header row with column names */}
            <tr>
                <TableHeaderCell>Polled</TableHeaderCell>
                <TableHeaderCell>Responded</TableHeaderCell>
                <TableHeaderCell>Response %</TableHeaderCell>
                <TableHeaderCell>NPS</TableHeaderCell>
                <TableHeaderCell>CXOs Polled</TableHeaderCell>
                <TableHeaderCell>CXOs Responded</TableHeaderCell>
                <TableHeaderCell>CXO Response %</TableHeaderCell>
                <TableHeaderCell>CXO NPS</TableHeaderCell>
                <TableHeaderCell>Non-CXOs Polled</TableHeaderCell>
                <TableHeaderCell>Non-CXOs Responded</TableHeaderCell>
                <TableHeaderCell>Non-CXO Response %</TableHeaderCell>
                <TableHeaderCell>Non-CXO NPS</TableHeaderCell>
              </tr>
            </TableHeader>
            <TableBody>
              {cxoAnalysisData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                  <TableCell isNumeric>{row.polled || 0}</TableCell>
                  <TableCell isNumeric>{row.responded || 0}</TableCell>
                  <ResponseRateCell rate={row.overallResponseRate || 0} surveysReceived={row.overallResponded || 0}>
                    {(row.overallResponded || 0) === 0 ? '-' : `${Math.round(row.overallResponseRate || 0)}%`}
                  </ResponseRateCell>
                  <TableCell isNumeric>{row.overallResponded === 0 ? '-' : (Math.round((row.nps || 0) * 100) / 100).toFixed(2)}</TableCell>
                  <TableCell isNumeric>{row.cxoPolled}</TableCell>
                  <TableCell isNumeric>{row.cxoResponded === 0 ? 0 : row.cxoResponded}</TableCell>
                  <TableCell isNumeric>{row.cxoResponded === 0 ? '0%' : `${Math.round(row.cxoResponseRate)}%`}</TableCell>
                  <TableCell isNumeric>{row.cxoResponded === 0 ? '-' : (Math.round((row.cxoNps || 0) * 100) / 100).toFixed(2)}</TableCell>
                  <TableCell isNumeric>{row.nonCxoPolled}</TableCell>
                  <TableCell isNumeric>{row.nonCxoResponded === 0 ? 0 : row.nonCxoResponded}</TableCell>
                  <TableCell isNumeric>{row.nonCxoResponded === 0 ? '0%' : `${Math.round(row.nonCxoResponseRate)}%`}</TableCell>
                  <TableCell isNumeric>{row.nonCxoResponded === 0 ? '-' : (Math.round((row.nonCxoNps || 0) * 100) / 100).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              
              {/* Grand Total Row - Org Level */}
              {cxoAnalysisGrandTotals && (
                <GrandTotalRow>
                  <GrandTotalCell></GrandTotalCell>
                  <GrandTotalCell>Org Level</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalOverallPolled || 0)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalOverallResponded || 0)}</GrandTotalCell>
                  <GrandTotalResponseRateCell rate={cxoAnalysisGrandTotals.overallResponseRate || 0} surveysReceived={cxoAnalysisGrandTotals.totalOverallResponded || 0}>
                    {(cxoAnalysisGrandTotals.totalOverallResponded || 0) === 0 ? '-' : `${Math.round(cxoAnalysisGrandTotals.overallResponseRate || 0)}%`}
                  </GrandTotalResponseRateCell>
                  <GrandTotalCell isNumeric>{cxoAnalysisGrandTotals.totalOverallResponded === 0 ? '-' : (Math.round((cxoAnalysisGrandTotals.nps || 0) * 100) / 100).toFixed(2)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalCxoPolled || 0)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalCxoResponded || 0)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{cxoAnalysisGrandTotals.totalCxoResponded === 0 ? '0%' : `${Math.round(cxoAnalysisGrandTotals.cxoOverallResponseRate)}%`}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{cxoAnalysisGrandTotals.totalCxoResponded === 0 ? '-' : (Math.round((cxoAnalysisGrandTotals.cxoNps || 0) * 100) / 100).toFixed(2)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalNonCxoPolled || 0)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{Math.round(cxoAnalysisGrandTotals.totalNonCxoResponded || 0)}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{cxoAnalysisGrandTotals.totalNonCxoResponded === 0 ? '0%' : `${Math.round(cxoAnalysisGrandTotals.nonCxoOverallResponseRate)}%`}</GrandTotalCell>
                  <GrandTotalCell isNumeric>{cxoAnalysisGrandTotals.totalNonCxoResponded === 0 ? '-' : (Math.round((cxoAnalysisGrandTotals.nonCxoNps || 0) * 100) / 100).toFixed(2)}</GrandTotalCell>
                </GrandTotalRow>
              )}
            </TableBody>
          </Table>
        </ScrollableTableContainer>
      )}

      {/* Main Response Rate Table */}
      {!showCXOAnalysis && (
      <ScrollableTableContainer>
        <Table>
          <TableHeader>
            <tr>
              <TableHeaderCell>Sr. No.</TableHeaderCell>
              <SortableHeader onClick={() => handleSort('businessUnit')}>
                Business Unit
                <SortIcon>
                  {sortConfig.key === 'businessUnit' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}
                </SortIcon>
              </SortableHeader>
              {!groupByBU && <TableHeaderCell>Account Name</TableHeaderCell>}
              <TableHeaderCell>Polled</TableHeaderCell>
              <TableHeaderCell>Responded</TableHeaderCell>
              <TableHeaderCell>Response%</TableHeaderCell>
              {showMainTableTrendColumns &&
                acsatTrendAnalysisData.map((fileData, fileIdx) => (
                  <TableHeaderCell
                    key={`trend-col-${fileIdx}`}
                    style={{ backgroundColor: '#0d9488', minWidth: '140px' }}
                  >
                    {trendColumnHeaderLabel(fileData, acsatTrendAnalysisData.length)}
                  </TableHeaderCell>
                ))}
            </tr>
          </TableHeader>
          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                {!groupByBU && <TableCell>{row.customerName}</TableCell>}
                <TableCell isNumeric>{row.surveysSent}</TableCell>
                <TableCell isNumeric>{row.surveysReceived === 0 ? 0 : row.surveysReceived}</TableCell>
                <ResponseRateCell rate={row.responseRate} surveysReceived={row.surveysReceived}>
                  {row.surveysReceived === 0 ? '0%' : `${(Math.round(row.responseRate * 10) / 10).toFixed(1)}%`}
                </ResponseRateCell>
                {showMainTableTrendColumns &&
                  acsatTrendAnalysisData.map((fileData, fileIdx) => {
                    const dashboardRate = row.surveysReceived === 0 ? 0 : roundResponseRateOneDecimal(row.responseRate);
                    const trendRow = getTrendRowForDashboard(
                      fileIdx, row, groupByBU, acsatTrendAccountLookups, acsatTrendBuLookups
                    );
                    const diff = computeResponseRateTrendDiff(dashboardRate, trendRow);
                    const display = formatResponseRateTrendDiffDisplay(diff);
                    return (
                      <TrendDiffCell key={`trend-cell-${index}-${fileIdx}`} diffColor={display.color}>
                        {display.text}
                      </TrendDiffCell>
                    );
                  })}
              </TableRow>
            ))}
            
            {/* Grand Total Row */}
            <GrandTotalRow>
              <GrandTotalCell></GrandTotalCell>
              {showTop10 ? (
                // Top 10: empty Business Unit
                <GrandTotalCell></GrandTotalCell>
              ) : groupByBU ? (
                // BU-wise: "Org Level" in Business Unit
                <GrandTotalCell>Org Level</GrandTotalCell>
              ) : (
                // Account-wise: empty Business Unit
                <GrandTotalCell></GrandTotalCell>
              )}
              {!groupByBU && <GrandTotalCell>{showTop10 ? 'Top 10 Accounts' : 'Grand Total'}</GrandTotalCell>}
              <GrandTotalCell isNumeric>{grandTotals.totalSent}</GrandTotalCell>
              <GrandTotalCell isNumeric>{grandTotals.totalReceived === 0 ? 0 : grandTotals.totalReceived}</GrandTotalCell>
              <GrandTotalResponseRateCell rate={grandTotals.overallResponseRate} surveysReceived={grandTotals.totalReceived}>
                {grandTotals.totalReceived === 0 ? '0%' : `${(Math.round(grandTotals.overallResponseRate * 10) / 10).toFixed(1)}%`}
              </GrandTotalResponseRateCell>
              {showMainTableTrendColumns &&
                acsatTrendAnalysisData.map((fileData, fileIdx) => {
                  const dashboardGtRate =
                    grandTotals.totalReceived === 0 ? 0 : roundResponseRateOneDecimal(grandTotals.overallResponseRate);
                  const gt = fileData.grandTotal;
                  const diff = gt ? computeResponseRateTrendDiff(dashboardGtRate, gt) : null;
                  const display = formatResponseRateTrendDiffDisplay(diff);
                  return (
                    <GrandTotalCell
                      key={`trend-gt-${fileIdx}`}
                      isNumeric
                      style={{ fontWeight: 600, color: display.color }}
                    >
                      {display.text}
                    </GrandTotalCell>
                  );
                })}
            </GrandTotalRow>
            {/* Other Account Row - Only for Top 10 view */}
            {showTop10 && otherAccountTotals && (
              <OtherAccountRow>
                <OtherAccountCell></OtherAccountCell>
                {showTop10 ? (
                  // Top 10: empty Business Unit, "Other Accounts" in Account Name
                  <>
                    <OtherAccountCell></OtherAccountCell>
                <OtherAccountCell>Other Accounts</OtherAccountCell>
                  </>
                ) : (
                  // Other views: "Other Accounts" in Business Unit
                  <OtherAccountCell>Other Accounts</OtherAccountCell>
                )}
                {!groupByBU && !showTop10 && <OtherAccountCell>-</OtherAccountCell>}
                <OtherAccountCell isNumeric>{otherAccountTotals.totalSent}</OtherAccountCell>
                <OtherAccountCell isNumeric>{otherAccountTotals.totalReceived === 0 ? 0 : otherAccountTotals.totalReceived}</OtherAccountCell>
                <OtherAccountResponseRateCell rate={otherAccountTotals.overallResponseRate} surveysReceived={otherAccountTotals.totalReceived}>
                  {otherAccountTotals.totalReceived === 0 ? '0%' : `${(Math.round(otherAccountTotals.overallResponseRate * 10) / 10).toFixed(1)}%`}
                </OtherAccountResponseRateCell>
                {showMainTableTrendColumns &&
                  acsatTrendAnalysisData.map((fileData, fileIdx) => {
                    const dashboardOtherRate =
                      otherAccountTotals.totalReceived === 0
                        ? 0
                        : roundResponseRateOneDecimal(otherAccountTotals.overallResponseRate);
                    const otherTrend = fileData.otherAccountsRow;
                    const diff = otherTrend
                      ? computeResponseRateTrendDiff(dashboardOtherRate, otherTrend)
                      : null;
                    const display = formatResponseRateTrendDiffDisplay(diff);
                    return (
                      <OtherAccountCell
                        key={`other-trend-${fileIdx}`}
                        isNumeric
                        style={{ fontWeight: 600, color: display.color }}
                      >
                        {display.text}
                      </OtherAccountCell>
                    );
                  })}
              </OtherAccountRow>
            )}
          </TableBody>
        </Table>
      </ScrollableTableContainer>
      )}

      {acsatTrendViewMode && showAcsatTrendAnalysis && (
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
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} />
              {acsatTrendSectionTitle}
            </div>
            {acsatTrendAnalysisData.some((f) => f.hasData) && (
              <DownloadButton type="button" onClick={exportAcsatTrendAnalysisToExcel} style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
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
            borderRadius: '0 0 12px 12px',
          }}>
            {!trendAnalysisFiles?.length ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No ACSAT trend files uploaded. Use &quot;Upload data for ACSAT trend analysis&quot; on the Upload ACSAT Data page.
              </div>
            ) : (
              acsatTrendAnalysisData.map((fileData, idx) => (
                <div key={`acsat-rr-trend-${idx}`} style={{ marginBottom: idx < acsatTrendAnalysisData.length - 1 ? '1.5rem' : 0 }}>
                  <div style={{ fontWeight: 600, color: '#0f766e', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    {fileData.saveName}
                  </div>
                  {fileData.error && !fileData.hasData ? (
                    <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                      {fileData.error}
                    </div>
                  ) : (
                    <ScrollableTableContainer>
                      <Table>
                        <TableHeader>
                          <tr>
                            <TableHeaderCell>Sr. No.</TableHeaderCell>
                            <TableHeaderCell>Business Unit</TableHeaderCell>
                            {acsatTrendViewMode !== 'bu' && <TableHeaderCell>Account Name</TableHeaderCell>}
                            <TableHeaderCell>Polled</TableHeaderCell>
                            <TableHeaderCell>Responded</TableHeaderCell>
                            <TableHeaderCell>Response%</TableHeaderCell>
                          </tr>
                        </TableHeader>
                        <TableBody>
                          {fileData.rows.map((row, rowIdx) => (
                            <TableRow key={`${fileData.saveName}-trend-${rowIdx}`}>
                              <TableCell>{rowIdx + 1}</TableCell>
                              <TableCell>{normalizeBusinessUnitDisplay(row.businessUnit)}</TableCell>
                              {acsatTrendViewMode !== 'bu' && <TableCell>{row.customerName}</TableCell>}
                              <TableCell isNumeric>{row.polled ?? 0}</TableCell>
                              <TableCell isNumeric>{row.responded ?? 0}</TableCell>
                              <ResponseRateCell rate={row.responseRatePct || 0} surveysReceived={row.responded || 0}>
                                {(row.responded || 0) === 0 ? '0%' : `${(Math.round(row.responseRatePct * 10) / 10).toFixed(1)}%`}
                              </ResponseRateCell>
                            </TableRow>
                          ))}
                          {fileData.grandTotal && (
                            <GrandTotalRow>
                              <GrandTotalCell></GrandTotalCell>
                              {acsatTrendViewMode === 'bu' ? (
                                <GrandTotalCell>{fileData.grandTotal.businessUnit || 'Org Level'}</GrandTotalCell>
                              ) : (
                                <>
                                  <GrandTotalCell></GrandTotalCell>
                                  <GrandTotalCell>
                                    {fileData.grandTotal.customerName ||
                                      (acsatTrendViewMode === 'top10' ? 'Top 10 Accounts' : 'Grand Total')}
                                  </GrandTotalCell>
                                </>
                              )}
                              <GrandTotalCell isNumeric>{fileData.grandTotal.polled ?? 0}</GrandTotalCell>
                              <GrandTotalCell isNumeric>{fileData.grandTotal.responded ?? 0}</GrandTotalCell>
                              <GrandTotalResponseRateCell
                                rate={fileData.grandTotal.responseRatePct || 0}
                                surveysReceived={fileData.grandTotal.responded || 0}
                              >
                                {(fileData.grandTotal.responded || 0) === 0
                                  ? '0%'
                                  : `${(Math.round(fileData.grandTotal.responseRatePct * 10) / 10).toFixed(1)}%`}
                              </GrandTotalResponseRateCell>
                            </GrandTotalRow>
                          )}
                          {acsatTrendViewMode === 'top10' && fileData.otherAccountsRow && (
                            <OtherAccountRow>
                              <OtherAccountCell></OtherAccountCell>
                              <OtherAccountCell></OtherAccountCell>
                              <OtherAccountCell>{fileData.otherAccountsRow.customerName || 'Other Accounts'}</OtherAccountCell>
                              <OtherAccountCell isNumeric>{fileData.otherAccountsRow.polled ?? 0}</OtherAccountCell>
                              <OtherAccountCell isNumeric>
                                {fileData.otherAccountsRow.responded === 0 ? 0 : fileData.otherAccountsRow.responded}
                              </OtherAccountCell>
                              <OtherAccountResponseRateCell
                                rate={fileData.otherAccountsRow.responseRatePct || 0}
                                surveysReceived={fileData.otherAccountsRow.responded || 0}
                              >
                                {(fileData.otherAccountsRow.responded || 0) === 0
                                  ? '0%'
                                  : `${(Math.round(fileData.otherAccountsRow.responseRatePct * 10) / 10).toFixed(1)}%`}
                              </OtherAccountResponseRateCell>
                            </OtherAccountRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollableTableContainer>
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

export default ACSATResponseRateDashboard;
