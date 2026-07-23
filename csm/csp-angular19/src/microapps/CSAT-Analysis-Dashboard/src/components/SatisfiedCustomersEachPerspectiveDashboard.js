import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft, Search } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { isDateGreaterThanOrEqual } from '../utils/dateUtils';

// Parse Excel/string date to MM-DD-YYYY for trend file comparison with csatCycleStartDateFormatted
const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  try {
    let date;
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
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

// BUSINESS UNIT display order: Healthcare, CIT, Tech, India & UK, Sead/SEAD (account-wise, Top 10, BU-wise; dashboard + Excel). Treat Healthcare/Health care/Health Care and SEAD/Sead as same.
const BUSINESS_UNIT_DISPLAY_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & UK', 'Sead'];
const getBusinessUnitOrderIndex = (bu) => {
  if (bu == null || bu === '') return -1;
  const n = normalizeBU(String(bu).trim());
  if (n === 'Healthcare') return 0;
  if (n === 'Sead') return 4;
  const idx = BUSINESS_UNIT_DISPLAY_ORDER.indexOf(n);
  return idx >= 0 ? idx : 999;
};
// Normalize BU so Healthcare/Health care/Health Care (any case) and SEAD/Sead (any case) are treated as same in grouping, dashboard, and Excel.
const normalizeBU = (bu) => {
  if (bu == null || bu === '') return '';
  const s = String(bu).trim();
  if (/^health\s*care$/i.test(s) || s.toLowerCase().replace(/\s/g, '') === 'healthcare') return 'Healthcare';
  if (/^sead$/i.test(s)) return 'Sead';
  return s;
};

const matchesBusinessUnitFilter = (row, businessUnitFilter) => {
  if (!businessUnitFilter) return true;
  const bu = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? '').toString().trim();
  return bu.toLowerCase().includes(businessUnitFilter.toLowerCase());
};

const PRACTICE_SATISFIED_FILE_URL = '/data/New_customer_feedback_analysis_New.xlsx';
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
const normalizePracticePerspective = (p) => {
  if (!p) return p;
  const s = String(p).trim();
  if (!s) return p;
  const lower = s.toLowerCase();
  if (s === 'Quality of deliverables' || lower === 'quality of delivery' || lower === 'quality of deliverables') return 'Quality of Delivery';
  if (lower === 'resource competency') return 'Resource Competency';
  if (lower === 'overall experience') return 'Overall Experience';
  if (lower === 'timeline adherence') return 'Timeline Adherence';
  if (lower === 'timely resource fulfillment') return 'Timely Resource Fulfillment';
  if (lower === 'risk management & responsiveness' || lower === 'risk management and responsiveness') return 'Risk Management & Responsiveness';
  if (lower === 'thought leadership') return 'Thought Leadership';
  return p;
};
const PRACTICE_PERSPECTIVE_ORDER = [
  'Overall Experience',
  'Timeline Adherence',
  'Quality of Delivery',
  'Timely Resource Fulfillment',
  'Resource Competency',
  'Risk Management & Responsiveness',
  'Thought Leadership'
];
const resolvePracticePerspectiveKey = (raw) => {
  const norm = normalizePracticePerspective(raw);
  if (!norm) return null;
  if (PRACTICE_PERSPECTIVE_ORDER.includes(norm)) return norm;
  if (String(norm).toLowerCase() === 'risk management & responsivenes') return 'Risk Management & Responsiveness';
  return PRACTICE_PERSPECTIVE_ORDER.find(p => p.toLowerCase() === String(norm).toLowerCase()) || null;
};
const buildPracticeWiseSatisfiedFromReceivedReport = (source, csatCycleStartDateFormatted, secondSheetSource = null) => {
  if (!source || !Array.isArray(source) || source.length === 0) {
    return { rows: [], orgLevelRow: null, perspectives: PRACTICE_PERSPECTIVE_ORDER };
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
      const practiceVal = (row['Practice'] ?? row['PRACTICE'] ?? row['practice'] ?? '').toString().trim();
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
  const satisfiedByPractice = new Map();
  const totalByPractice = new Map();
  const ensurePractice = (practice) => {
    if (!satisfiedByPractice.has(practice)) {
      satisfiedByPractice.set(practice, {});
      totalByPractice.set(practice, {});
      PRACTICE_PERSPECTIVE_ORDER.forEach(p => {
        satisfiedByPractice.get(practice)[p] = 0;
        totalByPractice.get(practice)[p] = 0;
      });
    }
  };
  // Sheet "CSAT received Report": NO date filter. % = (count RATING 4 or 5 per perspective per Practice) / (count of data input for that perspective per Practice) × 100.
  source.forEach(row => {
    const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
    if (qc === 'Qualitative Feedback') return;
    const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
    const rawPractice = (row[practiceCol] ?? row['Practice'] ?? row['PRACTICE'] ?? '').toString().trim();
    const practiceFromSecond = customerId ? (practiceByCustomerId.get(String(customerId).trim()) || '') : '';
    const practice = rawPractice && rawPractice.toLowerCase() !== 'n/a'
      ? rawPractice
      : (practiceFromSecond || '');
    if (!practice || practice.toLowerCase() === 'n/a') return;
    const perspectiveNorm = resolvePracticePerspectiveKey(row[perspectiveCol] ?? row['PERSPECTIVE']);
    if (!perspectiveNorm) return;
    ensurePractice(practice);
    const ratingNum = parseFloat(row[ratingCol] ?? row['RATING'] ?? row['Rating'] ?? row['rating']);
    const isSatisfied = !Number.isNaN(ratingNum) && (ratingNum === 4 || ratingNum === 5);
    totalByPractice.get(practice)[perspectiveNorm]++;
    if (isSatisfied) {
      satisfiedByPractice.get(practice)[perspectiveNorm]++;
    }
  });
  const hasSecondSheet = secondSheetSource && secondSheetSource.length > 0;
  const allPractices = new Set([...satisfiedByPractice.keys(), ...polledRespondedByPractice.keys()]);
  let rows = [...allPractices]
    .filter(practice => {
      const pr = polledRespondedByPractice.get(practice) || { polled: 0, responded: 0 };
      return !hasSecondSheet || pr.polled > 0;
    })
    .map((practice) => {
      const pr = polledRespondedByPractice.get(practice) || { polled: 0, responded: 0 };
      const satisfied = satisfiedByPractice.get(practice) || {};
      const totals = totalByPractice.get(practice) || {};
      const resultRow = {
        practice,
        Polled: pr.polled,
        Responded: pr.responded
      };
      PRACTICE_PERSPECTIVE_ORDER.forEach(p => {
        const dataInput = totals[p] || 0;
        const count = satisfied[p] || 0;
        if (dataInput > 0) {
          const pct = Math.round((count / dataInput) * 100);
          resultRow[p] = (pct === 0 || count === 0) ? '-' : `${pct}%`;
        } else {
          resultRow[p] = '-';
        }
      });
      return resultRow;
    });
  rows.sort((a, b) => {
    const ia = getPracticeOrderIndex(a.practice);
    const ib = getPracticeOrderIndex(b.practice);
    if (ia !== ib) return ia - ib;
    return (a.practice || '').localeCompare(b.practice || '');
  });
  rows = rows.map((r, i) => ({ ...r, sNo: i + 1 }));

  const orgSatisfied = {};
  const orgTotals = {};
  PRACTICE_PERSPECTIVE_ORDER.forEach(p => {
    orgSatisfied[p] = 0;
    orgTotals[p] = 0;
  });
  source.forEach(row => {
    const qc = row['QUESTION_CATEGORY'] ?? row['Question Category'] ?? row['question_category'];
    if (qc === 'Qualitative Feedback') return;
    const perspectiveNorm = resolvePracticePerspectiveKey(row[perspectiveCol] ?? row['PERSPECTIVE']);
    if (!perspectiveNorm) return;
    const ratingNum = parseFloat(row[ratingCol] ?? row['RATING'] ?? row['Rating'] ?? row['rating']);
    const isSatisfied = !Number.isNaN(ratingNum) && (ratingNum === 4 || ratingNum === 5);
    orgTotals[perspectiveNorm]++;
    if (isSatisfied) orgSatisfied[perspectiveNorm]++;
  });

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

  const orgLevelRow = {
    practice: 'Org level',
    sNo: '',
    isOrgLevel: true,
    Polled: orgPolled,
    Responded: orgResponded
  };
  PRACTICE_PERSPECTIVE_ORDER.forEach(p => {
    const dataInput = orgTotals[p] || 0;
    const count = orgSatisfied[p] || 0;
    if (dataInput > 0) {
      const pct = Math.round((count / dataInput) * 100);
      orgLevelRow[p] = (pct === 0 || count === 0) ? '-' : `${pct}%`;
    } else {
      orgLevelRow[p] = '-';
    }
  });

  return { rows, orgLevelRow, perspectives: PRACTICE_PERSPECTIVE_ORDER };
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

const findTrendAnalysisH12025File = (trendAnalysisFiles) => {
  const nameLower = (s) => (s || '').toLowerCase();
  return (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis-h12025'))
    || (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis-h12025'))
    || (trendAnalysisFiles || []).find(f => nameLower(f.saveName).includes('trend-analysis') && nameLower(f.saveName).includes('h12025'))
    || (trendAnalysisFiles || []).find(f => nameLower(f.originalName).includes('trend-analysis') && nameLower(f.originalName).includes('h12025'))
    // No file matches the old fixed naming convention — fall back to the most
    // recently fetched/uploaded comparison period.
    || (trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null);
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
const sortByPortfolioOrder = (a, b) => {
  const iA = PORTFOLIO_DISPLAY_ORDER.findIndex(p => p.toLowerCase() === (a.portfolio || '').toLowerCase());
  const iB = PORTFOLIO_DISPLAY_ORDER.findIndex(p => p.toLowerCase() === (b.portfolio || '').toLowerCase());
  const oA = iA >= 0 ? iA : 999;
  const oB = iB >= 0 ? iB : 999;
  if (oA !== oB) return oA - oB;
  return (a.portfolio || '').localeCompare(b.portfolio || '');
};

// Display: "Health care" / "Health Care" as "Healthcare", "Sead" as "SEAD" (dashboard and Excel).
const normalizeBusinessUnitDisplay = (bu) => {
  if (bu == null || bu === '') return bu;
  const s = String(bu).trim();
  if (/^health\s*care$/i.test(s) || s.toLowerCase().replace(/\s/g, '') === 'healthcare') return 'Healthcare';
  if (/^sead$/i.test(s)) return 'SEAD';
  return s;
};

// When BUSINESS UNIT is SEAD (or Sead) and Polled = 0, show hyphen for entire row (dashboard and Excel).
const isSeadAndPolledZero = (row) => {
  if (!row) return false;
  const bu = String(row.businessUnit ?? row['BUSINESS UNIT'] ?? '').trim();
  const isSead = /^sead$/i.test(bu);
  const polled = row.cssSentCount ?? row.Polled ?? 0;
  return isSead && (polled === 0 || polled === '0');
};

// When perspective value is 0 or 0%, display hyphen (-) in dashboard and Excel (Account/BU wise % Satisfied).
const formatPerspectiveValue = (value) => {
  if (value === null || value === undefined) return '-';
  const s = String(value).trim();
  if (s === '' || s === '0' || s === '0%') return '-';
  const num = parseFloat(value);
  if (!isNaN(num) && num === 0) return '-';
  return value;
};

// Parse perspective % to number for trend comparison (e.g. "85%" or 85 -> 85; "-" -> null).
const parsePercentForTrend = (value) => {
  if (value == null || value === '' || value === '-' || value === '－') return null;
  const s = String(value).trim().replace('%', '');
  const num = parseFloat(s);
  return isNaN(num) ? null : num;
};

const formatPracticeTrendDiff = (currentValue, trendValue) => {
  const currentNum = parsePercentForTrend(currentValue);
  const trendNum = parsePercentForTrend(trendValue);
  if (currentNum == null || trendNum == null) {
    return { text: '-', color: '#6b7280' };
  }
  const diff = Math.round(currentNum - trendNum);
  const isIncrease = diff > 0;
  const isDecrease = diff < 0;
  const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
  const arrow = isIncrease ? ' ↑' : isDecrease ? ' ↓' : '';
  const color = isIncrease ? '#15803d' : isDecrease ? '#dc2626' : '#6b7280';
  return { text: diffStr + arrow, color };
};

const DashboardContainer = styled.div`
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Title = styled.h1`
  color: white;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    background: #2563eb;
  }
`;

const ControlPanel = styled.div`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 12px;
  padding: 0.85rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
  }
`;

const BuWiseButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
  text-align: center;
  min-width: fit-content;
  max-width: 200px;
  height: auto;
  line-height: 1.2;
  
  &:hover {
    background: #1d4ed8;
  }
  
  @media (max-width: 768px) {
    white-space: normal;
    max-width: 150px;
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 200px;
`;

const Select = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  max-height: 70vh; /* Set maximum height to 70% of viewport height */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  min-width: 800px;
`;

const Th = styled.th`
  background: #1e3a8a; /* Navy blue - same as ACSAT: Org & BU Level Average CSAT Scores (ARGB: FF1E3A8A) */
  color: #ffffff;
  padding: 0.6rem 0.75rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid #9ca3af;
  white-space: nowrap;
  &:hover {
    background: #1e3a8a !important;
    cursor: pointer;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.75rem;
  border: 1px solid #e2e8f0;
  color: #374151;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;
  font-size: 0.85rem;
  line-height: 1.4;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  
  &:hover {
    background: #f9fafb;
  }
  
  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  &.active {
    background: #2563eb;
    color: white;
    border-color: #2563eb;
  }
`;

const ResultsSummary = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #0c4a6e;
  font-size: 0.875rem;
  line-height: 1.5;
`;

const SatisfiedCustomersEachPerspectiveDashboard = ({ excelData, onBack, trendAnalysisFiles = [] }) => {
  const [uploadedData, setUploadedData] = useState([]);
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [showBuWise, setShowBuWise] = useState(false);
  const [showTop10, setShowTop10] = useState(false);
  const [showScrollable, setShowScrollable] = useState(false);
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false);
  const [showPracticeWise, setShowPracticeWise] = useState(false);
  const [practiceFileReceivedData, setPracticeFileReceivedData] = useState(null);
  const [practiceFileSheet2Data, setPracticeFileSheet2Data] = useState(null);
  const itemsPerPage = 20;
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  // Dynamic "Trend analysis (<main period> Vs <comparison period>)" header label, driven by the
  // actual selected main period (acsatCycle) and the most recently fetched/uploaded comparison period.
  const trendComparisonPeriodLabel = (trendAnalysisFiles && trendAnalysisFiles.length > 0)
    ? (trendAnalysisFiles[trendAnalysisFiles.length - 1].saveName || trendAnalysisFiles[trendAnalysisFiles.length - 1].originalName || 'comparison period')
    : 'comparison period';
  const trendHeaderLabel = `Trend analysis (${acsatCycle || 'current period'} Vs ${trendComparisonPeriodLabel})`;

  useEffect(() => {
    console.log('=== SatisfiedCustomersEachPerspectiveDashboard useEffect ===');
    console.log('excelData received:', excelData);
    
    if (!excelData) {
      console.log('No excelData provided to SatisfiedCustomersEachPerspectiveDashboard');
      return;
    }

    // Use the same logic as PCSAT - use already processed data from FileUpload
    if (excelData.data && Array.isArray(excelData.data)) {
      console.log('✅ Using pre-processed data from FileUpload (same as PCSAT)');
      console.log('Data length:', excelData.data.length);
      console.log('First row sample:', excelData.data[0]);
      console.log('Column names:', excelData.data[0] ? Object.keys(excelData.data[0]) : 'No columns');
      
      // Check for required columns
      if (excelData.data[0]) {
        console.log('Required columns check:');
        console.log('- BUSINESS UNIT:', excelData.data[0]['BUSINESS UNIT'] ?? excelData.data[0]['BUSSINESS UNIT'] ?? excelData.data[0]['Business Unit'] ?? 'NOT FOUND');
        console.log('- CUSTOMER_ID:', excelData.data[0]['CUST_ID'] ?? excelData.data[0]['CUSTOMER_ID'] ?? 'NOT FOUND');
        console.log('- CUSTOMER NAME / CUST_NM:', excelData.data[0]['CUSTOMER NAME'] ?? excelData.data[0]['CUST_NM'] ?? 'NOT FOUND');
        console.log('- PERSPECTIVE:', Object.keys(excelData.data[0]).find(key => key.toLowerCase().includes('perspective')) || 'NOT FOUND');
        console.log('- RATING:', excelData.data[0]['RATING'] || 'NOT FOUND');
      }
      
      setUploadedData(excelData.data);
      
      // Second sheet data is already available in excelData.secondSheetData
      if (excelData.secondSheetData) {
        console.log('Second sheet data already available:', excelData.secondSheetData.length, 'rows');
      }
    } else {
      console.log('❌ No valid pre-processed data found in excelData:', {
        hasExcelData: !!excelData,
        hasData: !!(excelData && excelData.data),
        isArray: !!(excelData && excelData.data && Array.isArray(excelData.data)),
        dataLength: excelData?.data?.length || 0,
        excelDataKeys: excelData ? Object.keys(excelData) : 'null'
      });
    }
  }, [excelData]);

  useEffect(() => {
    const base = typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    const url = (base.replace(/\/$/, '') || '') + PRACTICE_SATISFIED_FILE_URL;
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
  }, []);

  // Normalize date value to YYYY-MM-DD string for distinct count keys (same parsing as isDateOnOrAfterCsatStart)
  const toDateKey = (dateValue) => {
    if (dateValue == null || String(dateValue).trim() === '') return '';
    try {
      let date;
      if (typeof dateValue === 'string') {
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(String(dateValue).trim())) {
          const [month, day, year] = dateValue.split('-').map(Number);
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateValue);
        }
      } else if (typeof dateValue === 'number') {
        const epoch = new Date(Date.UTC(1899, 11, 30));
        const ms = Math.round(dateValue * 24 * 60 * 60 * 1000);
        date = new Date(epoch.getTime() + ms);
      } else {
        date = new Date(dateValue);
      }
      const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
      if (isNaN(date.getTime())) return '';
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  // Helper function for date comparison
  const isDateOnOrAfterCsatStart = (dateValue) => {
    if (!csatCycleStartDateFormatted || !dateValue) return true;
    
    try {
      let date;
      
      // Handle different date formats
      if (typeof dateValue === 'string') {
        // If it's already in MM-DD-YYYY format (allow 1 or 2 digit month/day)
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(String(dateValue).trim())) {
          const [month, day, year] = dateValue.split('-').map(Number);
          date = new Date(year, month - 1, day);
        }
        // If it's in other formats, try to parse
        else {
          date = new Date(dateValue);
        }
      } else if (typeof dateValue === 'number') {
        // Handle Excel serial dates
        const epoch = new Date(Date.UTC(1899, 11, 30));
        const ms = Math.round(dateValue * 24 * 60 * 60 * 1000);
        date = new Date(epoch.getTime() + ms);
      } else {
        date = new Date(dateValue);
      }
      
      // Parse CSAT start date (MM-DD-YYYY format)
      const [mm, dd, yyyy] = csatCycleStartDateFormatted.split('-').map(Number);
      const csatStartDate = new Date(yyyy, mm - 1, dd);
      
      // Compare dates (ignore time)
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startDateOnly = new Date(csatStartDate.getFullYear(), csatStartDate.getMonth(), csatStartDate.getDate());
      
      return dateOnly >= startDateOnly;
    } catch (error) {
      console.log('Date parsing error:', error, 'for value:', dateValue);
      return true;
    }
  };

  // Normalize perspective names so counts aggregate correctly: e.g. "Resource competency" -> "Resource Competency", "Quality of deliverables" -> "Quality of Delivery"
  const normalizePerspective = (p) => {
    if (!p) return p;
    const s = String(p).trim();
    if (!s) return p;
    const lower = s.toLowerCase();
    if (s === 'Quality of deliverables' || lower === 'quality of delivery' || lower === 'quality of deliverables') return 'Quality of Delivery';
    if (lower === 'resource competency') return 'Resource Competency';
    if (lower === 'overall experience') return 'Overall Experience';
    if (lower === 'timeline adherence') return 'Timeline Adherence';
    if (lower === 'timely resource fulfillment') return 'Timely Resource Fulfillment';
    if (lower === 'risk management & responsiveness' || lower === 'risk management and responsiveness') return 'Risk Management & Responsiveness';
    if (lower === 'thought leadership') return 'Thought Leadership';
    return p;
  };

  const normalizeCustomerIdKey = (value) => {
    if (value == null) return '';
    const raw = String(value).trim();
    if (!raw) return '';
    // Normalize integer-like numbers (e.g., "123.0" -> "123")
    if (/^-?\d+(\.\d+)?$/.test(raw)) {
      const num = Number(raw);
      if (!Number.isNaN(num) && Number.isInteger(num)) return String(num);
    }
    return raw;
  };

  const normalizeAccountNameKey = (value) => {
    if (value == null) return '';
    const raw = String(value).trim().toLowerCase();
    if (!raw) return '';
    return raw.replace(/\s+/g, ' ');
  };

  const getTrendPerspectiveHeaderLabel = (p) => {
    const normalized = normalizePerspective(p);
    if (normalized === 'Timely Resource Fulfillment') return 'Trend for Timely Resource Fulfillment';
    return normalized;
  };

  // Perspective column order for all views (account-wise, BU-wise, Top 10). Quality of deliverables = Quality of Delivery.
  const PERSPECTIVE_COLUMN_ORDER = [
    'Overall Experience',
    'Timeline Adherence',
    'Quality of Delivery',
    'Timely Resource Fulfillment',
    'Resource Competency',
    'Risk Management & Responsiveness',
    'Thought Leadership'
  ];

  // Fully Managed / Co-Managed: perspective columns (by ENGAGEMENT TYPE) – same set for both; exclude Resource Competency for FM and CM.
  // Display order: Overall Experience, Timeline Adherence, Quality of Delivery, Timely Resource Fulfillment, Risk Management & Responsiveness, Thought Leadership.
  const FULLY_MANAGED_PERSPECTIVES = PERSPECTIVE_COLUMN_ORDER.filter(p => p !== 'Resource Competency');
  const CO_MANAGED_PERSPECTIVES = [...FULLY_MANAGED_PERSPECTIVES];
  // Staff Augmentation – BU Wise: perspective columns by ENGAGEMENT TYPE = "Staff Augmentation" only
  const STAFF_AUGMENTATION_PERSPECTIVES = [
    'Overall Experience',
    'Resource Competency',
    'Timely Resource Fulfillment'
  ];

  const processBuWiseData = () => {
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
      return { data: [], allUniquePerspectiveValues: [] };
    }

    // Find the PERSPECTIVE column
    const perspectiveColumn = Object.keys(uploadedData[0]).find(key => 
      key.toLowerCase().includes('perspective')
    );

    if (!perspectiveColumn) {
      console.log('No PERSPECTIVE column found');
      return { data: [], allUniquePerspectiveValues: [] };
    }

    // Get unique perspective values from data, then apply fixed column order (Quality of deliverables = Quality of Delivery)
    const fromData = [...new Set(uploadedData.map(row => normalizePerspective(row[perspectiveColumn])))]
      .filter(value => value && value !== 'Qualitative Feedback' && isNaN(value));
    const uniquePerspectiveValues = [
      ...PERSPECTIVE_COLUMN_ORDER.filter(p => fromData.includes(p)),
      ...fromData.filter(p => !PERSPECTIVE_COLUMN_ORDER.includes(p))
    ];

    // Group data by BUSINESS UNIT (prefer BUSINESS UNIT, support BUSSINESS UNIT)
    const buGroups = {};
    const buTotalCountByPerspective = {}; // Total data inputs per perspective per BU (for Count row)
    const buCssCounts = new Map();
    const buNonStaffingCounts = new Map();
    const buStaffingCounts = new Map();

    // Process CSS counts for each BU from second sheet (guard: excelData may be undefined)
    const buSecondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    if (buSecondSheet.length > 0) {
      const secondSheetFirst = buSecondSheet[0] || {};
      const cssSentColumn = Object.keys(secondSheetFirst).find(key => {
        const k = key.toLowerCase();
        return k === 'csat sent date' || k.includes('csat_sent_date') || k.includes('css_sent_date');
      }) || Object.keys(secondSheetFirst).find(key => key.toLowerCase().includes('css_sent_date'));
      const cssReceivedColumn = Object.keys(secondSheetFirst).find(key => {
        const k = key.toLowerCase();
        return k === 'csat received date' || k.includes('csat_received_date') || k.includes('css_received_date');
      }) || Object.keys(secondSheetFirst).find(key => key.toLowerCase().includes('css_received_date'));
      // Prefer BUSINESS UNIT; support BUSSINESS UNIT and Business Unit
      const buColumn = Object.keys(secondSheetFirst).find(key =>
        key === 'BUSINESS UNIT' || key === 'BUSSINESS UNIT' ||
        key === 'Business Unit' || key.toLowerCase() === 'business unit' || key.toLowerCase() === 'bussiness unit'
      );
      const revenueTypeColumn = Object.keys(secondSheetFirst).find(key => 
        key === 'REVENUE_TYPE' || 
        key === 'Revenue Type' ||
        key.toLowerCase() === 'revenue_type' ||
        key.toLowerCase() === 'revenue type'
      );

      console.log('BU-wise CSS columns found:', { cssSentColumn, cssReceivedColumn, buColumn, revenueTypeColumn });
      console.log('CSAT Cycle Start Date:', csatCycleStartDateFormatted);
      console.log('Second sheet sample row:', buSecondSheet[0]);
      console.log('All second sheet columns:', Object.keys(buSecondSheet[0] || {}));

      buSecondSheet.forEach((secondRow, index) => {
        let bu = 'Unknown';
        
        if (buColumn && secondRow[buColumn]) {
          bu = normalizeBU(String(secondRow[buColumn]).trim()) || 'Unknown';
        } else {
          // Fallback: try to find business unit from first sheet using customer ID
          const customerIdColumn = Object.keys(secondRow).find(key => 
            key.toLowerCase().includes('customer_id') || key.toLowerCase().includes('cust_id')
          );
          if (customerIdColumn && secondRow[customerIdColumn]) {
            const customerId = secondRow[customerIdColumn];
            const firstSheetRow = uploadedData.find(row =>
              (row['CUST_ID'] ?? row['CUSTOMER_ID']) === customerId
            );
            if (firstSheetRow) {
              const raw = firstSheetRow['BUSINESS UNIT'] ?? firstSheetRow['BUSSINESS UNIT'] ?? firstSheetRow['Business Unit'] ?? 'Unknown';
              bu = normalizeBU(String(raw).trim()) || 'Unknown';
            }
          }
        }
        
        if (!buCssCounts.has(bu)) {
          buCssCounts.set(bu, { cssSentCount: 0, cssReceivedCount: 0 });
        }
        if (!buNonStaffingCounts.has(bu)) {
          buNonStaffingCounts.set(bu, 0);
        }
        if (!buStaffingCounts.has(bu)) {
          buStaffingCounts.set(bu, 0);
        }

        const sentDateVal = (cssSentColumn ? secondRow[cssSentColumn] : null) ?? secondRow['CSAT SENT DATE'] ?? secondRow['CSS_SENT_DATE'];
        const receivedDateVal = (cssReceivedColumn ? secondRow[cssReceivedColumn] : null) ?? secondRow['CSAT RECEIVED DATE'] ?? secondRow['CSS_RECEIVED_DATE'];
        const hasSent = sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A' && sentDateVal != null;
        const hasReceived = receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A' && receivedDateVal != null;
        const sentOk = !hasSent || isDateOnOrAfterCsatStart(sentDateVal);
        const receivedOk = !hasReceived || isDateOnOrAfterCsatStart(receivedDateVal);
        // Only consider row when both dates (if present) are >= CSAT cycle start (MM-DD-YYYY)
        if (sentOk && receivedOk) {
          if (hasSent) buCssCounts.get(bu).cssSentCount++;
          if (hasReceived) {
            buCssCounts.get(bu).cssReceivedCount++;
            const revenueType = revenueTypeColumn ? secondRow[revenueTypeColumn] : '';
            if (revenueType === 'Fixed Monthly') {
              buStaffingCounts.set(bu, buStaffingCounts.get(bu) + 1);
            } else if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
              buNonStaffingCounts.set(bu, buNonStaffingCounts.get(bu) + 1);
            }
          }
        }
      });
      
      console.log('Final BU CSS counts:', Array.from(buCssCounts.entries()));
    }

    // First sheet "CSAT received Report": NO date filter. "Number of CSATs considered" = count of all rows per perspective per BU from this sheet.
    // % = (count RATING 4 or 5 for that perspective in this BU) / (that count of rows) * 100. Do NOT use #Responded (sheet 2) for division.
    uploadedData.forEach(row => {
      const bu = normalizeBU(String(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? 'Unknown').trim()) || 'Unknown';
      const perspective = row[perspectiveColumn];
      const rating = row['RATING'];

      if (!buGroups[bu]) {
        buGroups[bu] = {};
        uniquePerspectiveValues.forEach(pv => {
          buGroups[bu][pv] = 0;
        });
      }
      if (!buTotalCountByPerspective[bu]) {
        buTotalCountByPerspective[bu] = {};
        uniquePerspectiveValues.forEach(pv => { buTotalCountByPerspective[bu][pv] = 0; });
      }

      const perspectiveNorm = normalizePerspective(perspective);
      const ratingNum = Number(rating);
      const isSatisfied = (ratingNum === 4 || ratingNum === 5);
      if (perspectiveNorm && uniquePerspectiveValues.includes(perspectiveNorm)) {
        if (isSatisfied) buGroups[bu][perspectiveNorm]++;
        buTotalCountByPerspective[bu][perspectiveNorm]++;
      }
    });

    // When second sheet is present, filter out BUs with 0 CSS surveys sent; include BUs that appear only in second sheet (Polled > 0)
    const hasBuSecondSheet = buSecondSheet.length > 0;
    const buKeysFromSecondSheet = hasBuSecondSheet
      ? Array.from(buCssCounts.entries()).filter(([, c]) => c.cssSentCount > 0).map(([bu]) => bu)
      : [];
    const allBuKeys = [...new Set([...Object.keys(buGroups), ...buKeysFromSecondSheet])];

    const result = allBuKeys
      .filter(bu => {
        const cssCounts = buCssCounts.get(bu) || { cssSentCount: 0, cssReceivedCount: 0 };
        return !hasBuSecondSheet || cssCounts.cssSentCount > 0;
      })
      .map((bu, index) => {
        // Ensure BU has an entry (from first sheet or second-sheet-only with 0 counts)
        if (!buGroups[bu]) {
          buGroups[bu] = {};
          uniquePerspectiveValues.forEach(pv => {
            buGroups[bu][pv] = 0;
          });
        }
        const buData = buGroups[bu];
        const cssCounts = buCssCounts.get(bu) || { cssSentCount: 0, cssReceivedCount: 0 };
        const nonStaffingCount = buNonStaffingCounts.get(bu) || 0;
        const staffingCount = buStaffingCounts.get(bu) || 0;
        
        const row = {
          sNo: index + 1,
          'BUSINESS UNIT': bu,
          cssSentCount: cssCounts.cssSentCount,
          cssReceivedCount: cssCounts.cssReceivedCount,
          nonStaffingCount: nonStaffingCount,
          staffingCount: staffingCount
        };

      // % = (count of RATING 4 or 5 for that perspective, group by BUSINESS UNIT) / (count of data input for that perspective in this BU from "CSAT received Report") * 100. Do NOT use #Responded.
      uniquePerspectiveValues.forEach(pv => {
        const count = buData[pv] || 0;
        const dataInputForPerspective = buTotalCountByPerspective[bu]?.[pv] || 0;
        if (dataInputForPerspective > 0) {
          const percentage = Math.round((count / dataInputForPerspective) * 100);
          row[pv] = `${percentage}%`;
        } else {
          row[pv] = '-';
        }
      });

      return row;
    });

    // Sort by BUSINESS UNIT order: Healthcare, CIT, Tech, India & UK, Sead/SEAD
    const sortedResult = result.sort((a, b) => {
      const buA = a['BUSINESS UNIT'] ?? a['BUSSINESS UNIT'];
      const buB = b['BUSINESS UNIT'] ?? b['BUSSINESS UNIT'];
      const indexA = getBusinessUnitOrderIndex(buA);
      const indexB = getBusinessUnitOrderIndex(buB);
      if (indexA !== indexB) return indexA - indexB;
      return (buA || '').localeCompare(buB || '');
    });
    
    // Update S.No. after sorting
    let finalResult = sortedResult.map((item, index) => ({
      ...item,
      sNo: index + 1
    }));

    // Org level row: Polled/Responded from sheet 2; perspective % = (sum of count 4,5 per perspective across BUs) / (sum of "Number of CSATs considered" per perspective across BUs) * 100 — not #Responded.
    let totalSent = 0;
    let totalReceived = 0;
    let totalNonStaffing = 0;
    let totalStaffing = 0;
    const orgCountByPerspective = {};
    uniquePerspectiveValues.forEach(pv => { orgCountByPerspective[pv] = 0; });
    finalResult.forEach(r => {
      const bu = r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'];
      totalSent += r.cssSentCount || 0;
      totalReceived += r.cssReceivedCount || 0;
      totalNonStaffing += r.nonStaffingCount || 0;
      totalStaffing += r.staffingCount || 0;
      if (bu && buGroups[bu]) {
        uniquePerspectiveValues.forEach(pv => {
          orgCountByPerspective[pv] += buGroups[bu][pv] || 0;
        });
      }
    });
    const orgRow = {
      sNo: '', // No Sr. No. for Org level grand total row
      'BUSINESS UNIT': 'Org level',
      cssSentCount: totalSent,
      cssReceivedCount: totalReceived,
      nonStaffingCount: totalNonStaffing,
      staffingCount: totalStaffing
    };
    const orgTotalCountByPerspectiveForPct = {};
    uniquePerspectiveValues.forEach(pv => { orgTotalCountByPerspectiveForPct[pv] = 0; });
    finalResult.forEach(r => {
      const bu = r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'];
      if (bu && bu !== 'Org level' && bu !== 'Count' && buTotalCountByPerspective[bu]) {
        uniquePerspectiveValues.forEach(pv => {
          orgTotalCountByPerspectiveForPct[pv] += buTotalCountByPerspective[bu][pv] || 0;
        });
      }
    });
    // Org level % = (sum of count 4,5 per perspective across BUs) / (sum of data input per perspective across BUs) * 100, for each perspective
    uniquePerspectiveValues.forEach(pv => {
      const totalDataInput = orgTotalCountByPerspectiveForPct[pv] || 0;
      orgRow[pv] = totalDataInput > 0 ? `${Math.round((orgCountByPerspective[pv] / totalDataInput) * 100)}%` : '-';
    });

    // Count row: number of data inputs per perspective across all BUs
    const orgTotalCountByPerspective = {};
    uniquePerspectiveValues.forEach(pv => { orgTotalCountByPerspective[pv] = 0; });
    finalResult.forEach(r => {
      const bu = r['BUSINESS UNIT'] ?? r['BUSSINESS UNIT'];
      if (bu && bu !== 'Org level' && bu !== 'Count' && buTotalCountByPerspective[bu]) {
        uniquePerspectiveValues.forEach(pv => {
          orgTotalCountByPerspective[pv] += buTotalCountByPerspective[bu][pv] || 0;
        });
      }
    });
    const countRow = {
      sNo: '',
      'BUSINESS UNIT': '',
      'BUSSINESS UNIT': '',
      cssSentCount: '',
      cssReceivedCount: 'Number of CSATs considered==>',
      nonStaffingCount: '',
      staffingCount: '',
      isCountRow: true
    };
    uniquePerspectiveValues.forEach(pv => {
      countRow[pv] = orgTotalCountByPerspective[pv] ?? 0;
    });

    finalResult = [...finalResult, orgRow, countRow];

    return { data: finalResult, allUniquePerspectiveValues: uniquePerspectiveValues };
  };

  const processTop10Data = () => {
    console.log('Processing Top 10 data...');
    
    // Find the PERSPECTIVE column specifically
    const perspectiveColumn = Object.keys(uploadedData[0]).find(key => 
      key.toLowerCase().includes('perspective')
    );
    
    if (!perspectiveColumn) {
      console.log('No perspective column found');
      return { data: [], allUniquePerspectiveValues: [] };
    }

    console.log('Perspective column found:', perspectiveColumn);

    // Get unique perspective values from data, then apply fixed column order for Top 10 view
    const fromDataTop10 = [...new Set(uploadedData.map(row => normalizePerspective(row[perspectiveColumn])).filter(Boolean))]
      .filter(value => value !== 'Qualitative Feedback');
    const uniquePerspectiveValues = [
      ...PERSPECTIVE_COLUMN_ORDER.filter(p => fromDataTop10.includes(p)),
      ...fromDataTop10.filter(p => !PERSPECTIVE_COLUMN_ORDER.includes(p))
    ];
    console.log('Unique perspective values (Top 10, ordered):', uniquePerspectiveValues);

    // Group by customer ID
    const customerGroups = {};
    
    uploadedData.forEach(row => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? 'Unknown';
      const customerName = row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A';
      const businessUnit = normalizeBU(String(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? 'N/A').trim()) || 'N/A';
      
      if (!customerGroups[customerId]) {
        customerGroups[customerId] = {
          customerId,
          customerName,
          businessUnit,
          cssSentCount: 0,
          cssReceivedCount: 0,
          nonStaffingCount: 0,
          staffingCount: 0,
          totalCountByPerspective: {}
        };
        uniquePerspectiveValues.forEach(pv => {
          customerGroups[customerId][pv] = 0;
          customerGroups[customerId].totalCountByPerspective[pv] = 0;
        });
      }

      const perspectiveNorm = normalizePerspective(row[perspectiveColumn]);
      if (perspectiveNorm && customerGroups[customerId][perspectiveNorm] !== undefined) {
        customerGroups[customerId].totalCountByPerspective[perspectiveNorm]++;
        const rating = parseFloat(row['RATING']) || 0;
        if (rating >= 4) {
          customerGroups[customerId][perspectiveNorm]++;
        }
      }
    });

    // Top 10 Accounts row: Polled/Responded from 2nd sheet (CSAT sent and received Report), perspective % from 1st sheet (CSAT received Report) where TYPE OF ACCOUNT = Top 10
    let top10AccountsFromSheets = null;

    // Get CSS counts from second sheet and filter by Top 10
    if (excelData && excelData.secondSheetData && Array.isArray(excelData.secondSheetData)) {
      const customerCSSCounts = {};
      const customerNonStaffingCounts = {};
      const customerStaffingCounts = {};
      const top10Customers = new Set();

      // First, identify customers with TYPE OF ACCOUNT = "Top 10" or Top 10 = "Y"
      excelData.secondSheetData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        const typeOfAccountVal = (row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
        if (customerId && (typeOfAccountVal === 'Top 10' || typeOfAccountVal.toUpperCase() === 'Y')) {
          top10Customers.add(customerId);
        }
      });

      console.log('Top 10 customers from second sheet:', Array.from(top10Customers));

      // Top 10 Accounts row: Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from 2nd sheet where TYPE OF ACCOUNT = Top 10
      let top10Polled = 0, top10Responded = 0;
      const top10SatisfiedByPerspective = {};
      const top10TotalCountByPerspective = {};
      uniquePerspectiveValues.forEach(pv => {
        top10SatisfiedByPerspective[pv] = 0;
        top10TotalCountByPerspective[pv] = 0;
      });

      // Other Accounts row: Polled/Responded from 2nd sheet where TYPE OF ACCOUNT = blank or empty
      let otherPolled = 0, otherResponded = 0;
      const otherSatisfiedByPerspective = {};
      const otherTotalCountByPerspective = {};
      uniquePerspectiveValues.forEach(pv => {
        otherSatisfiedByPerspective[pv] = 0;
        otherTotalCountByPerspective[pv] = 0;
      });

      // Process CSS counts for all customers (Top 10 and Others)
      excelData.secondSheetData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        const typeOfAccountVal = (row['TYPE OF ACCOUNT'] ?? row['Top 10'] ?? '').toString().trim();
        const isTop10Row = customerId && (typeOfAccountVal === 'Top 10' || typeOfAccountVal.toUpperCase() === 'Y');
        const isOtherRow = (typeOfAccountVal === '' || typeOfAccountVal === null || typeOfAccountVal === undefined);
        const cssSentDate = row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        const cssReceivedDate = row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        const revenueType = row['REVENUE_TYPE'];

        if (isTop10Row) {
          if (cssSentDate && isDateOnOrAfterCsatStart(cssSentDate)) top10Polled++;
          if (cssReceivedDate && isDateOnOrAfterCsatStart(cssReceivedDate)) top10Responded++;
        }
        if (isOtherRow) {
          if (cssSentDate && isDateOnOrAfterCsatStart(cssSentDate)) otherPolled++;
          if (cssReceivedDate && isDateOnOrAfterCsatStart(cssReceivedDate)) otherResponded++;
        }

        if (customerId) {
          if (!customerCSSCounts[customerId]) {
            customerCSSCounts[customerId] = { sent: 0, received: 0 };
            customerNonStaffingCounts[customerId] = 0;
            customerStaffingCounts[customerId] = 0;
          }

          if (cssSentDate && isDateOnOrAfterCsatStart(cssSentDate)) {
            customerCSSCounts[customerId].sent++;
          }
          if (cssReceivedDate && isDateOnOrAfterCsatStart(cssReceivedDate)) {
            customerCSSCounts[customerId].received++;
            
            if (revenueType && ['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
              customerNonStaffingCounts[customerId]++;
            } else if (revenueType === 'Fixed Monthly') {
              customerStaffingCounts[customerId]++;
            }
          }
        }
      });

      // Top 10 total count by perspective: count of all data inputs (all ratings) per perspective where TYPE OF ACCOUNT = Top 10
      uploadedData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!top10Customers.has(customerId)) return;
        const pv = normalizePerspective(row[perspectiveColumn]);
        if (pv && top10TotalCountByPerspective[pv] !== undefined) top10TotalCountByPerspective[pv]++;
      });

      // Perspective columns for Top 10 Accounts: count(RATING 4 or 5) / Responded * 100 from 1st sheet (CSAT received Report) where customer in Top 10
      uploadedData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (!top10Customers.has(customerId)) return;
        const rating = parseFloat(row['RATING']) || 0;
        if (rating < 4) return;
        const pv = normalizePerspective(row[perspectiveColumn]);
        if (pv && top10SatisfiedByPerspective[pv] !== undefined) top10SatisfiedByPerspective[pv]++;
      });

      // Other total count by perspective: count of all data inputs (all ratings) per perspective where TYPE OF ACCOUNT = Blank or Empty or N/A (customer NOT in Top 10)
      uploadedData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (top10Customers.has(customerId)) return;
        const pv = normalizePerspective(row[perspectiveColumn]);
        if (pv && otherTotalCountByPerspective[pv] !== undefined) otherTotalCountByPerspective[pv]++;
      });

      // Perspective columns for Other Accounts: count(RATING 4 or 5) / Responded * 100 from 1st sheet where customer NOT in Top 10 (TYPE OF ACCOUNT = blank/empty on 2nd sheet implies "Other")
      uploadedData.forEach(row => {
        const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
        if (top10Customers.has(customerId)) return;
        const rating = parseFloat(row['RATING']) || 0;
        if (rating < 4) return;
        const pv = normalizePerspective(row[perspectiveColumn]);
        if (pv && otherSatisfiedByPerspective[pv] !== undefined) otherSatisfiedByPerspective[pv]++;
      });

      top10AccountsFromSheets = { polled: top10Polled, responded: top10Responded, satisfiedByPerspective: { ...top10SatisfiedByPerspective }, totalCountByPerspective: { ...top10TotalCountByPerspective } };

      // Filter customer groups to only include Top 10 customers
      const filteredCustomerGroups = {};
      // Other Accounts row: Polled/Responded from 2nd sheet (TYPE OF ACCOUNT blank/empty); perspective = count from 1st sheet (non–Top 10) / Responded * 100
      const otherAccountGroup = {
        customerId: 'OTHER',
        customerName: 'Other Accounts',
        businessUnit: '',
        cssSentCount: otherPolled,
        cssReceivedCount: otherResponded,
        nonStaffingCount: 0,
        staffingCount: 0,
        totalCountByPerspective: { ...otherTotalCountByPerspective }
      };
      uniquePerspectiveValues.forEach(pv => {
        otherAccountGroup[pv] = otherSatisfiedByPerspective[pv] || 0;
      });
      Object.keys(customerGroups).forEach(customerId => {
        if (top10Customers.has(customerId)) {
          const cssCounts = customerCSSCounts[customerId] || { sent: 0, received: 0 };
          customerGroups[customerId].cssSentCount = cssCounts.sent;
          customerGroups[customerId].cssReceivedCount = cssCounts.received;
          customerGroups[customerId].nonStaffingCount = customerNonStaffingCounts[customerId] || 0;
          customerGroups[customerId].staffingCount = customerStaffingCounts[customerId] || 0;
          filteredCustomerGroups[customerId] = customerGroups[customerId];
        } else {
          otherAccountGroup.nonStaffingCount += customerNonStaffingCounts[customerId] || 0;
          otherAccountGroup.staffingCount += customerStaffingCounts[customerId] || 0;
        }
      });

      // Include Top 10 customers that appear only in second sheet (Polled > 0) so rows with Responded=0 show hyphen
      top10Customers.forEach(cid => {
        if (filteredCustomerGroups[cid]) return;
        const cssCounts = customerCSSCounts[cid];
        if (!cssCounts || cssCounts.sent <= 0) return;
        const firstRow = excelData.secondSheetData.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === cid) || {};
        const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
        const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
        const newGroup = {
          customerId: cid,
          customerName: (firstRow[customerNameKey] ?? firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? cid).toString().trim(),
          businessUnit: normalizeBU(String(firstRow[businessUnitKey] ?? firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A').trim()) || 'N/A',
          cssSentCount: cssCounts.sent,
          cssReceivedCount: cssCounts.received || 0,
          nonStaffingCount: customerNonStaffingCounts[cid] || 0,
          staffingCount: customerStaffingCounts[cid] || 0,
          totalCountByPerspective: {}
        };
        uniquePerspectiveValues.forEach(pv => {
          newGroup[pv] = 0;
          newGroup.totalCountByPerspective[pv] = 0;
        });
        filteredCustomerGroups[cid] = newGroup;
      });

      // Replace customerGroups with filtered data
      Object.keys(customerGroups).forEach(key => delete customerGroups[key]);
      Object.assign(customerGroups, filteredCustomerGroups);
      
      // Always add Other Account (even if it has 0 CSS surveys)
      console.log('=== OTHER ACCOUNT DEBUG ===');
      console.log('otherAccountGroup before adding:', otherAccountGroup);
      console.log('otherAccountGroup.cssSentCount:', otherAccountGroup.cssSentCount);
      console.log('otherAccountGroup.cssReceivedCount:', otherAccountGroup.cssReceivedCount);
      console.log('otherAccountGroup.nonStaffingCount:', otherAccountGroup.nonStaffingCount);
      console.log('otherAccountGroup.staffingCount:', otherAccountGroup.staffingCount);
      
      customerGroups['OTHER'] = otherAccountGroup;
      console.log('Other Account data added:', otherAccountGroup);
      console.log('=== END OTHER ACCOUNT DEBUG ===');
    } else {
      // If no second sheet data, still add an empty Other Account row
      const emptyOtherTotalCountByPerspective = {};
      uniquePerspectiveValues.forEach(pv => { emptyOtherTotalCountByPerspective[pv] = 0; });
      const emptyOtherAccountGroup = {
        customerId: 'OTHER',
        customerName: 'Other Accounts',
        businessUnit: '',
        cssSentCount: 0,
        cssReceivedCount: 0,
        nonStaffingCount: 0,
        staffingCount: 0,
        totalCountByPerspective: { ...emptyOtherTotalCountByPerspective }
      };
      
      // Initialize perspective counts for Other Account
      uniquePerspectiveValues.forEach(pv => {
        emptyOtherAccountGroup[pv] = 0;
      });
      
      customerGroups['OTHER'] = emptyOtherAccountGroup;
      console.log('Empty Other Account data added (no second sheet data)');
    }

    // Hardcoded Top 10 order (Sr. No. 1–12)
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


    // Helper: convert a group object to a row with % logic. When denomByPerspective is provided (e.g. row "Number of CSATs considered==>"), use it as denominator; else use (count data input for perspective) * 100.
    const groupToRow = (obj, sNoVal, denomByPerspective) => {
      const row = {
        sNo: sNoVal,
        customerId: obj.customerId,
        customerName: obj.customerName,
        businessUnit: obj.businessUnit,
        cssSentCount: obj.cssSentCount,
        cssReceivedCount: obj.cssReceivedCount,
        nonStaffingCount: obj.nonStaffingCount,
        staffingCount: obj.staffingCount
      };
      const totalCountByPerspective = obj.totalCountByPerspective || {};
      uniquePerspectiveValues.forEach(pv => {
        const count = obj[pv] || 0;
        const totalDataInputForPerspective = (denomByPerspective && denomByPerspective[pv] != null) ? denomByPerspective[pv] : (totalCountByPerspective[pv] || 0);
        if (totalDataInputForPerspective > 0) {
          const pct = Math.round((count / totalDataInputForPerspective) * 100);
          row[pv] = `${pct}%`;
        } else {
          row[pv] = '-';
        }
      });
      return row;
    };

    // Top 10 only (exclude Other Accounts), include only if they have CSS surveys sent
    const top10Only = Object.values(customerGroups)
      .filter(obj => obj.customerId !== 'OTHER' && obj.cssSentCount > 0);
    const otherGroup = customerGroups['OTHER'];

    // Sort Top 10 by hardcoded order
    const sortedTop10 = [...top10Only].sort((a, b) => {
      const indexA = top10Order.indexOf(a.customerName);
      const indexB = top10Order.indexOf(b.customerName);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.customerName.localeCompare(b.customerName);
    });

    // Build Top 10 rows: % = (count of RATING 4 or 5 for that perspective where TYPE OF ACCOUNT = Top 10, per customer) / (count of data input for that perspective for that customer) * 100. Do NOT use #Responded.
    const top10Rows = sortedTop10.map((obj, i) => ({
      ...groupToRow(obj, i + 1),
      top10: 'Y'
    }));

    // Grand total row "Top 10 Accounts": Polled/Responded from 2nd sheet. Perspective % = (count RATING 4 or 5 / count of data input for that perspective) * 100 — do NOT use #Responded.
    let grandTotalRow;
    if (top10AccountsFromSheets) {
      const { polled, responded, satisfiedByPerspective, totalCountByPerspective: top10TotalCountByPerspective } = top10AccountsFromSheets;
      const totalNonStaffing = sortedTop10.reduce((s, g) => s + (g.nonStaffingCount || 0), 0);
      const totalStaffing = sortedTop10.reduce((s, g) => s + (g.staffingCount || 0), 0);
      const grandTotalGroup = {
        customerId: 'TOP10_TOTAL',
        customerName: 'Top 10 Accounts',
        businessUnit: '',
        cssSentCount: polled,
        cssReceivedCount: responded,
        nonStaffingCount: totalNonStaffing,
        staffingCount: totalStaffing
      };
      const totalCountByPerspective = top10TotalCountByPerspective || {};
      uniquePerspectiveValues.forEach(pv => {
        const dataInput = totalCountByPerspective[pv] || 0;
        grandTotalGroup[pv] = dataInput > 0 ? `${Math.round((satisfiedByPerspective[pv] || 0) / dataInput * 100)}%` : '-';
      });
      grandTotalRow = { ...grandTotalGroup, sNo: '', top10: 'N' };
    } else {
      // Fallback: sum across Top 10 when no second sheet
      let totalSent = 0, totalReceived = 0, totalNonStaffing = 0, totalStaffing = 0;
      const top10SatisfiedByPerspective = {};
      const top10TotalCountByPerspective = {};
      uniquePerspectiveValues.forEach(pv => {
        top10SatisfiedByPerspective[pv] = 0;
        top10TotalCountByPerspective[pv] = 0;
      });
      sortedTop10.forEach(g => {
        totalSent += g.cssSentCount || 0;
        totalReceived += g.cssReceivedCount || 0;
        totalNonStaffing += g.nonStaffingCount || 0;
        totalStaffing += g.staffingCount || 0;
        uniquePerspectiveValues.forEach(pv => {
          top10SatisfiedByPerspective[pv] += g[pv] || 0;
          top10TotalCountByPerspective[pv] += (g.totalCountByPerspective && g.totalCountByPerspective[pv]) || 0;
        });
      });
      const grandTotalGroup = {
        customerId: 'TOP10_TOTAL',
        customerName: 'Top 10 Accounts',
        businessUnit: '',
        cssSentCount: totalSent,
        cssReceivedCount: totalReceived,
        nonStaffingCount: totalNonStaffing,
        staffingCount: totalStaffing,
        totalCountByPerspective: { ...top10TotalCountByPerspective }
      };
      uniquePerspectiveValues.forEach(pv => {
        grandTotalGroup[pv] = top10SatisfiedByPerspective[pv] || 0;
      });
      grandTotalRow = {
        ...groupToRow(grandTotalGroup, ''),
        top10: 'N'
      };
    }

    // Other Accounts row: no Sr. No., placed after "Top 10 Accounts"
    const otherRow = otherGroup ? {
      ...groupToRow({ ...otherGroup, customerName: 'Other Accounts' }, ''),
      top10: 'N'
    } : null;

    // Overall row: grand total across Top 10 + Other Accounts, % = (sum satisfied) / (sum total data input per perspective) * 100
    const allForOverall = otherGroup ? [...sortedTop10, otherGroup] : sortedTop10;
    let overallSent = 0, overallReceived = 0, overallNonStaffing = 0, overallStaffing = 0;
    const overallCountByPerspective = {};
    const overallTotalCountByPerspective = {};
    uniquePerspectiveValues.forEach(pv => {
      overallCountByPerspective[pv] = 0;
      overallTotalCountByPerspective[pv] = 0;
    });
    allForOverall.forEach(g => {
      overallSent += g.cssSentCount || 0;
      overallReceived += g.cssReceivedCount || 0;
      overallNonStaffing += g.nonStaffingCount || 0;
      overallStaffing += g.staffingCount || 0;
      uniquePerspectiveValues.forEach(pv => {
        overallCountByPerspective[pv] += g[pv] || 0;
        overallTotalCountByPerspective[pv] += (g.totalCountByPerspective && g.totalCountByPerspective[pv]) || 0;
      });
    });
    const overallGroup = {
      customerId: 'OVERALL',
      customerName: 'Overall',
      businessUnit: '',
      cssSentCount: overallSent,
      cssReceivedCount: overallReceived,
      nonStaffingCount: overallNonStaffing,
      staffingCount: overallStaffing,
      totalCountByPerspective: { ...overallTotalCountByPerspective }
    };
    uniquePerspectiveValues.forEach(pv => {
      overallGroup[pv] = overallCountByPerspective[pv] || 0;
    });
    const overallRow = {
      ...groupToRow(overallGroup, ''),
      top10: 'N'
    };

    // Top 10 count row: number of data inputs per perspective where TYPE OF ACCOUNT = Top 10
    let top10CountRow = null;
    if (top10AccountsFromSheets && top10AccountsFromSheets.totalCountByPerspective) {
      const totalCountByPerspective = top10AccountsFromSheets.totalCountByPerspective;
      top10CountRow = {
        sNo: '',
        customerId: 'TOP10_COUNT',
        customerName: '',
        businessUnit: '',
        cssSentCount: '',
        cssReceivedCount: 'Number of CSATs considered==>',
        nonStaffingCount: '',
        staffingCount: '',
        isTop10CountRow: true
      };
      uniquePerspectiveValues.forEach(pv => {
        top10CountRow[pv] = totalCountByPerspective[pv] ?? 0;
      });
    }

    // Other Account count row: number of data inputs per perspective where TYPE OF ACCOUNT = Blank or Empty or N/A
    let otherCountRow = null;
    if (otherGroup && otherGroup.totalCountByPerspective) {
      const totalCountByPerspective = otherGroup.totalCountByPerspective;
      otherCountRow = {
        sNo: '',
        customerId: 'OTHER_COUNT',
        customerName: '',
        businessUnit: '',
        cssSentCount: '',
        cssReceivedCount: 'Number of CSATs considered==>',
        nonStaffingCount: '',
        staffingCount: '',
        isOtherCountRow: true
      };
      uniquePerspectiveValues.forEach(pv => {
        otherCountRow[pv] = totalCountByPerspective[pv] ?? 0;
      });
    }

    // Overall count row: number of data inputs per perspective across all accounts (reuse overallTotalCountByPerspective from overall row)
    const overallCountRow = {
      sNo: '',
      customerId: 'OVERALL_COUNT',
      customerName: '',
      businessUnit: '',
      cssSentCount: '',
      cssReceivedCount: 'Number of CSATs considered==>',
      nonStaffingCount: '',
      staffingCount: '',
      isOverallCountRow: true
    };
    uniquePerspectiveValues.forEach(pv => {
      overallCountRow[pv] = overallTotalCountByPerspective[pv] ?? 0;
    });

    const resultWithTop10 = otherRow
      ? (top10CountRow
          ? (otherCountRow
              ? [...top10Rows, grandTotalRow, top10CountRow, otherRow, otherCountRow, overallRow, overallCountRow]
              : [...top10Rows, grandTotalRow, top10CountRow, otherRow, overallRow, overallCountRow])
          : (otherCountRow
              ? [...top10Rows, grandTotalRow, otherRow, otherCountRow, overallRow, overallCountRow]
              : [...top10Rows, grandTotalRow, otherRow, overallRow, overallCountRow]))
      : (top10CountRow
          ? [...top10Rows, grandTotalRow, top10CountRow, overallRow, overallCountRow]
          : [...top10Rows, grandTotalRow, overallRow, overallCountRow]);

    console.log('=== FINAL RESULT DEBUG ===');
    console.log('Final result length:', resultWithTop10.length);
    console.log('Final result customer names:', resultWithTop10.map(row => row.customerName));
    console.log('=== END FINAL RESULT DEBUG ===');

    return { data: resultWithTop10, allUniquePerspectiveValues: uniquePerspectiveValues };
  };

  const processedData = useMemo(() => {
    console.log('=== processedData useMemo called ===');
    console.log('uploadedData:', uploadedData);
    console.log('uploadedData length:', uploadedData?.length);
    console.log('isArray:', Array.isArray(uploadedData));
    console.log('showBuWise:', showBuWise);
    console.log('showTop10:', showTop10);
    
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
      console.log('❌ No valid uploadedData, returning empty data');
      return { data: [], allUniquePerspectiveValues: [] };
    }

    console.log('✅ Processing uploadedData...');
    console.log('Sample data row:', uploadedData[0]);
    console.log('Required columns check:');
    console.log('- BUSINESS UNIT:', uploadedData[0]['BUSINESS UNIT'] ?? uploadedData[0]['BUSSINESS UNIT'] ?? uploadedData[0]['Business Unit'] ?? 'NOT FOUND');
    console.log('- CUSTOMER_ID:', uploadedData[0]['CUST_ID'] ?? uploadedData[0]['CUSTOMER_ID'] ?? 'NOT FOUND');
    console.log('- CUSTOMER NAME / CUST_NM:', uploadedData[0]['CUSTOMER NAME'] ?? uploadedData[0]['CUST_NM'] ?? 'NOT FOUND');
    console.log('- PERSPECTIVE:', Object.keys(uploadedData[0]).find(key => key.toLowerCase().includes('perspective')) || 'NOT FOUND');
    console.log('- RATING:', uploadedData[0]['RATING'] || 'NOT FOUND');

    console.log('Processing data...');
    console.log('Uploaded data length:', uploadedData.length);
    console.log('First row sample:', uploadedData[0]);
    console.log('Show BU-wise:', showBuWise);

    // If showing BU-wise data, process differently
    if (showBuWise) {
      return processBuWiseData();
    }

    // If showing Top 10 data, process differently
    if (showTop10) {
      return processTop10Data();
    }

    // Find the PERSPECTIVE column specifically
    const perspectiveColumn = Object.keys(uploadedData[0]).find(key => 
      key.toLowerCase().includes('perspective')
    );

    if (!perspectiveColumn) {
      console.log('No PERSPECTIVE column found');
      return { data: [], allUniquePerspectiveValues: [] };
    }

    // Account-wise: use fixed perspective column order (value = (count RATING 4 or 5 / Responded) * 100)
    const perspectiveValues = [...PERSPECTIVE_COLUMN_ORDER];

    console.log('Perspective values (account-wise):', perspectiveValues);

    const firstRow = uploadedData[0] || {};

    // Group data by CUSTOMER_ID
    const customerGroups = {};
    const customerCSSCounts = new Map();
    const customerNonStaffingCounts = new Map();
    const customerStaffingCounts = new Map();

    // Define column variables at the top level
    let cssSentColumn, cssReceivedColumn, customerIdColumn, revenueTypeColumn, top10Column;
    let top10Customers = new Set();

    // Process CSS counts for each customer from second sheet (guard: excelData may be undefined)
    const secondSheetData = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    if (secondSheetData.length > 0) {
      const secondSheetFirst = secondSheetData[0] || {};
      cssSentColumn = Object.keys(secondSheetFirst).find(key => {
        const k = key.toLowerCase();
        return k === 'csat sent date' || k.includes('csat_sent_date') || k.includes('css_sent_date');
      });
      cssReceivedColumn = Object.keys(secondSheetFirst).find(key => 
        key.toLowerCase().includes('csat received date') || key.toLowerCase().includes('css_received_date')
      );
      customerIdColumn = Object.keys(secondSheetData[0] || {}).find(key =>
        key.toLowerCase().includes('customer_id') || key.toLowerCase().includes('cust_id')
      );
      revenueTypeColumn = Object.keys(secondSheetData[0] || {}).find(key =>
        key === 'REVENUE_TYPE' ||
        key === 'Revenue Type' ||
        key.toLowerCase() === 'revenue_type' ||
        key.toLowerCase() === 'revenue type'
      );
      // Prefer TYPE OF ACCOUNT; support Top 10 (legacy)
      top10Column = Object.keys(secondSheetFirst).find(key =>
        key === 'TYPE OF ACCOUNT' || key === 'Top 10' || key.toLowerCase() === 'top 10'
      );

      console.log('CSS columns found:', { cssSentColumn, cssReceivedColumn, customerIdColumn, revenueTypeColumn, top10Column });

      // First, identify customers with TYPE OF ACCOUNT = "Top 10" or Top 10 = "Y"
      if (top10Column) {
        secondSheetData.forEach(row => {
          const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? row[customerIdColumn];
          const typeOfAccountVal = (row['TYPE OF ACCOUNT'] ?? row[top10Column] ?? '').toString().trim();
          if (customerId && (typeOfAccountVal === 'Top 10' || typeOfAccountVal.toUpperCase() === 'Y')) {
            top10Customers.add(customerId);
          }
        });
        console.log('Top 10 customers for account-wise view:', Array.from(top10Customers));
      }

      secondSheetData.forEach(secondRow => {
        const customerId = secondRow['CUST_ID'] ?? secondRow['CUSTOMER_ID'] ?? secondRow[customerIdColumn];
        
        // Process all customers for account-wise view (no Top 10 filtering)
        
        if (!customerCSSCounts.has(customerId)) {
          customerCSSCounts.set(customerId, { cssSentCount: 0, cssReceivedCount: 0 });
        }
        if (!customerNonStaffingCounts.has(customerId)) {
          customerNonStaffingCounts.set(customerId, 0);
        }
        if (!customerStaffingCounts.has(customerId)) {
          customerStaffingCounts.set(customerId, 0);
        }

        const sentDateVal = (cssSentColumn ? secondRow[cssSentColumn] : null) ?? secondRow['CSAT SENT DATE'] ?? secondRow['CSS_SENT_DATE'];
        const receivedDateVal = (cssReceivedColumn ? secondRow[cssReceivedColumn] : null) ?? secondRow['CSAT RECEIVED DATE'] ?? secondRow['CSS_RECEIVED_DATE'];
        const hasSent = sentDateVal && sentDateVal !== '' && sentDateVal !== 'N/A' && sentDateVal != null;
        const hasReceived = receivedDateVal && receivedDateVal !== '' && receivedDateVal !== 'N/A' && receivedDateVal != null;
        const sentOk = !hasSent || isDateOnOrAfterCsatStart(sentDateVal);
        const receivedOk = !hasReceived || isDateOnOrAfterCsatStart(receivedDateVal);
        // Only consider row when both dates (if present) are >= CSAT cycle start (MM-DD-YYYY)
        if (sentOk && receivedOk) {
          if (hasSent) customerCSSCounts.get(customerId).cssSentCount++;
          if (hasReceived) {
            customerCSSCounts.get(customerId).cssReceivedCount++;
            const revenueType = revenueTypeColumn ? secondRow[revenueTypeColumn] : '';
            if (revenueType === 'Fixed Monthly') {
              customerStaffingCounts.set(customerId, customerStaffingCounts.get(customerId) + 1);
            } else if (['Time and Material', 'Fixed Bid', 'Managed Services'].includes(revenueType)) {
              customerNonStaffingCounts.set(customerId, customerNonStaffingCounts.get(customerId) + 1);
            }
          }
        }
      });
    }

    // Process first sheet data grouped by customer. % = (count RATING 4 or 5) / (count data input for that perspective) * 100 from "CSAT received Report". Use ALL rows (no date filter) per user requirement.
    uploadedData.forEach(row => {
      const customerId = row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? 'Unknown';
      const perspective = row[perspectiveColumn];
      const rating = row['RATING'];

      if (!customerGroups[customerId]) {
        customerGroups[customerId] = {
          customerId,
          customerName: row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A',
          businessUnit: normalizeBU(String(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? 'N/A').trim()) || 'N/A',
          ...perspectiveValues.reduce((acc, pv) => { acc[pv] = 0; return acc; }, {}),
          totalCountByPerspective: perspectiveValues.reduce((acc, pv) => { acc[pv] = 0; return acc; }, {}),
          cssSentCount: 0,
          cssReceivedCount: 0
        };
      }

      const perspectiveNorm = normalizePerspective(perspective);
      const ratingNum = Number(rating);
      const isSatisfied = ratingNum === 4 || ratingNum === 5;
      if (perspectiveNorm && perspectiveValues.includes(perspectiveNorm)) {
        customerGroups[customerId].totalCountByPerspective[perspectiveNorm]++;
        if (isSatisfied) {
          customerGroups[customerId][perspectiveNorm]++;
        }
      }
    });

    // Include customers that appear only in second sheet (Polled > 0, Responded may be 0) so hyphen shows when Responded=0
    if (secondSheetData.length > 0) {
      customerCSSCounts.forEach((cssCounts, customerId) => {
        if (cssCounts.cssSentCount > 0 && !customerGroups[customerId]) {
          const firstRow = secondSheetData.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === customerId) || {};
          customerGroups[customerId] = {
            customerId,
            customerName: firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? customerId,
            businessUnit: normalizeBU(String(firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? firstRow['Business Unit'] ?? 'N/A').trim()) || 'N/A',
            ...perspectiveValues.reduce((acc, pv) => { acc[pv] = 0; return acc; }, {}),
            totalCountByPerspective: perspectiveValues.reduce((acc, pv) => { acc[pv] = 0; return acc; }, {}),
            cssSentCount: 0,
            cssReceivedCount: 0
          };
        }
      });
    }

    // Merge CSS counts
    Object.values(customerGroups).forEach((customerData) => {
      const customerId = customerData.customerId;
      const cssCounts = customerCSSCounts.get(customerId) || { cssSentCount: 0, cssReceivedCount: 0 };
      const nonStaffingCount = customerNonStaffingCounts.get(customerId) || 0;
      const staffingCount = customerStaffingCounts.get(customerId) || 0;
      
      customerData.cssSentCount = cssCounts.cssSentCount;
      customerData.cssReceivedCount = cssCounts.cssReceivedCount;
      customerData.nonStaffingCount = nonStaffingCount;
      customerData.staffingCount = staffingCount;
    });

    // Convert to array format; when second sheet is present, filter out rows with 0 CSS surveys sent
    const result = Object.values(customerGroups)
      .filter(obj => secondSheetData.length === 0 || obj.cssSentCount > 0)
      .map((obj, index) => {
        const row = {
          sNo: index + 1,
          customerId: obj.customerId,
          customerName: obj.customerName,
          businessUnit: obj.businessUnit,
          cssSentCount: obj.cssSentCount,
          cssReceivedCount: obj.cssReceivedCount,
          nonStaffingCount: obj.nonStaffingCount,
          staffingCount: obj.staffingCount
        };

      // Value = (count of RATING 4 or 5 for perspective / count of data input for that perspective from CSAT received Report) * 100
      perspectiveValues.forEach(pv => {
        const count = obj[pv] || 0;
        const totalDataInputForPerspective = (obj.totalCountByPerspective && obj.totalCountByPerspective[pv]) || 0;
        if (totalDataInputForPerspective > 0) {
          const pct = Math.round((count / totalDataInputForPerspective) * 100);
          row[pv] = (pct === 0 || count === 0) ? '-' : `${pct}%`;
        } else {
          row[pv] = '-';
        }
      });

      return row;
    });

    return { data: result, allUniquePerspectiveValues: perspectiveValues };
  }, [uploadedData, showBuWise, showTop10, excelData, csatCycleStartDateFormatted]);

  const practiceWiseData = useMemo(() => {
    const source = (practiceFileReceivedData && practiceFileReceivedData.length > 0)
      ? practiceFileReceivedData
      : (uploadedData && uploadedData.length > 0 ? uploadedData : null);
    const secondSheet = (practiceFileSheet2Data && practiceFileSheet2Data.length > 0)
      ? practiceFileSheet2Data
      : (excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : null);
    if (!source) return { rows: [], orgLevelRow: null, perspectives: PRACTICE_PERSPECTIVE_ORDER, dataSource: 'none' };
    const built = buildPracticeWiseSatisfiedFromReceivedReport(source, csatCycleStartDateFormatted, secondSheet);
    return {
      ...built,
      dataSource: practiceFileReceivedData && practiceFileReceivedData.length > 0 ? 'file' : 'uploaded'
    };
  }, [practiceFileReceivedData, practiceFileSheet2Data, uploadedData, excelData, csatCycleStartDateFormatted]);

  const practiceWiseSortedRows = useMemo(() => {
    const rows = practiceWiseData.rows || [];
    if (!sortConfig.key) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.key === 'practice') {
        const ia = getPracticeOrderIndex(aVal);
        const ib = getPracticeOrderIndex(bVal);
        if (ia !== ib) return sortConfig.direction === 'asc' ? ia - ib : ib - ia;
      }
      if (typeof aVal === 'string' && aVal.includes('%') && typeof bVal === 'string' && bVal.includes('%')) {
        const an = parseFloat(aVal) || 0;
        const bn = parseFloat(bVal) || 0;
        return sortConfig.direction === 'asc' ? an - bn : bn - an;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const as = String(aVal ?? '');
      const bs = String(bVal ?? '');
      return sortConfig.direction === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [practiceWiseData.rows, sortConfig]);

  const practiceWiseTrendData = useMemo(() => {
    if (!showPracticeWise || !showTrendAnalysis) {
      return { rows: [], perspectives: PRACTICE_PERSPECTIVE_ORDER, sourceName: '', error: null };
    }
    if (!csatCycleStartDateFormatted) {
      return { rows: [], perspectives: PRACTICE_PERSPECTIVE_ORDER, sourceName: '', error: 'CSAT cycle start date is required.' };
    }
    const h12025File = findTrendAnalysisH12025File(trendAnalysisFiles);
    if (!h12025File) {
      return {
        rows: [],
        perspectives: PRACTICE_PERSPECTIVE_ORDER,
        sourceName: '',
        error: 'Upload "Trend-Analysis-H12025.xlsx" in "Upload data for trend analysis" to view trend data.'
      };
    }
    const { sheet1, sheet2 } = getTrendFilePracticeSheets(h12025File);
    if (!sheet1.length && !sheet2.length) {
      return {
        rows: [],
        perspectives: PRACTICE_PERSPECTIVE_ORDER,
        sourceName: h12025File.saveName || h12025File.originalName || 'Trend-Analysis-H12025.xlsx',
        error: 'No data found in trend file sheets "CSAT received Report" or "CSAT sent and received Report".'
      };
    }
    const built = buildPracticeWiseSatisfiedFromReceivedReport(sheet1, csatCycleStartDateFormatted, sheet2);
    return {
      ...built,
      sourceName: h12025File.saveName || h12025File.originalName || 'Trend-Analysis-H12025.xlsx',
      error: built.rows.length === 0 ? 'No rows with date ≥ CSAT cycle start in trend file.' : null
    };
  }, [showPracticeWise, showTrendAnalysis, trendAnalysisFiles, csatCycleStartDateFormatted]);

  const practiceWiseTrendByPractice = useMemo(() => {
    const map = {};
    (practiceWiseTrendData.rows || []).forEach((row) => {
      const key = String(row.practice || '').trim();
      if (key) map[key] = row;
    });
    return map;
  }, [practiceWiseTrendData.rows]);

  const practiceWiseTrendSortedRows = useMemo(() => {
    const rows = practiceWiseTrendData.rows || [];
    if (!sortConfig.key) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (sortConfig.key === 'practice') {
        const ia = getPracticeOrderIndex(aVal);
        const ib = getPracticeOrderIndex(bVal);
        if (ia !== ib) return sortConfig.direction === 'asc' ? ia - ib : ib - ia;
      }
      if (typeof aVal === 'string' && aVal.includes('%') && typeof bVal === 'string' && bVal.includes('%')) {
        const an = parseFloat(aVal) || 0;
        const bn = parseFloat(bVal) || 0;
        return sortConfig.direction === 'asc' ? an - bn : bn - an;
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const as = String(aVal ?? '');
      const bs = String(bVal ?? '');
      return sortConfig.direction === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
  }, [practiceWiseTrendData.rows, sortConfig]);

  const filteredData = useMemo(() => {
    let filtered = processedData.data;

    if (showBuWise) {
      // For BU-wise view, only apply business unit filter (always include Org level and Count rows)
      if (businessUnitFilter) {
        filtered = filtered.filter(item => {
          const bu = (item['BUSINESS UNIT'] ?? item['BUSSINESS UNIT']) || '';
          return bu === 'Org level' || item.isCountRow || bu.toLowerCase().includes(businessUnitFilter.toLowerCase());
        });
      }
    } else {
      // For customer-wise view, apply both filters (always include Top 10 structural rows: TOP10_TOTAL, TOP10_COUNT, OTHER, OTHER_COUNT, OVERALL, OVERALL_COUNT)
      if (customerNameSearch) {
        filtered = filtered.filter(item => 
          (showTop10 && ['TOP10_TOTAL', 'TOP10_COUNT', 'OTHER', 'OTHER_COUNT', 'OVERALL', 'OVERALL_COUNT'].includes(item.customerId)) || (item.customerName || '').toLowerCase().includes(customerNameSearch.toLowerCase())
        );
      }
      if (businessUnitFilter) {
        filtered = filtered.filter(item => 
          (showTop10 && ['TOP10_TOTAL', 'TOP10_COUNT', 'OTHER', 'OTHER_COUNT', 'OVERALL', 'OVERALL_COUNT'].includes(item.customerId)) || (item.businessUnit || '').toLowerCase().includes(businessUnitFilter.toLowerCase())
        );
      }
    }

    // Default order by BUSINESS UNIT for account-wise only; Top 10 keeps order from processTop10Data (and preserves empty Sr. No. for Other Accounts)
    if (!showBuWise && !showTop10 && filtered.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const buKey = 'businessUnit';
        const indexA = getBusinessUnitOrderIndex(a[buKey]);
        const indexB = getBusinessUnitOrderIndex(b[buKey]);
        if (indexA !== indexB) return indexA - indexB;
        return (a.customerName || '').localeCompare(b.customerName || '');
      });
      filtered = filtered.map((row, i) => ({ ...row, sNo: i + 1 }));
    }

    return filtered;
  }, [processedData.data, customerNameSearch, businessUnitFilter, showBuWise, showTop10]);

  // Fully Managed – BU Wise % Satisfied: from "CSAT received Report", ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT; Polled/Responded from sheet 2 "CSAT sent and received Report" (date >= CSAT cycle start, MM-DD-YYYY)
  const fullyManagedBuWiseData = useMemo(() => {
    const dataLen = uploadedData && Array.isArray(uploadedData) ? uploadedData.length : 0;
    console.log('Fully Managed – BU Wise useMemo ran | uploadedData.length:', dataLen);
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const customerIdKey = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k))) || 'CUSTOMER_ID';
    
    // Console: Fully Managed – BU Wise (for debugging)
    const uniqueEngagementValues = [...new Set((uploadedData || []).map(r => String(r[engagementKey] ?? '').trim()).filter(Boolean))];
    console.log('[Fully Managed – BU Wise] engagementKey:', engagementKey, '| unique ENGAGEMENT TYPE values in sheet 1:', uniqueEngagementValues);
    
    if (!perspectiveColumn || !engagementKey) {
      console.log('[Fully Managed – BU Wise] Skipped: missing perspectiveColumn or engagementKey');
      return [];
    }

    const isFullyManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'fully managed' || v === 'fullymanaged';
    };

    const fullyManagedRows = uploadedData.filter(row => isFullyManaged(row[engagementKey]));
    console.log('[Fully Managed – BU Wise] Rows with Fully Managed (sheet 1):', fullyManagedRows.length, '| BUs:', [...new Set(fullyManagedRows.map(r => normalizeBU((r[businessUnitKey] ?? r['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A'))]);
    const customerToBU = {};
    const byBu = {};
    fullyManagedRows.forEach(row => {
      const bu = normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A';
      const cid = (row[customerIdKey] ?? row['CUST_ID'] ?? '').toString().trim();
      if (cid) customerToBU[cid] = bu;
      if (!byBu[bu]) {
        byBu[bu] = { totalRows: 0, satisfied: {}, distinctResponses: new Set() };
        FULLY_MANAGED_PERSPECTIVES.forEach(p => { byBu[bu].satisfied[p] = 0; });
      }
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      byBu[bu].totalRows++;
      if (pv && byBu[bu].satisfied[pv] !== undefined && rating >= 4) byBu[bu].satisfied[pv]++;
      if (receivedDateKey && row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') {
        byBu[bu].distinctResponses.add(`${cid}|${String(row[receivedDateKey]).trim()}`);
      }
    });

    const polledByBu = {};
    const respondedByBu = {};
    Object.keys(byBu).forEach(bu => { polledByBu[bu] = 0; respondedByBu[bu] = 0; });

    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondFirst = secondSheet[0] || {};
    const sentDateCol = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k))) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k))) || 'CSAT RECEIVED DATE';
    const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const secondBuKey = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k)));
    
    // Count Polled and Responded from sheet 2 "CSAT sent and received Report" where ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT
    // Polled = count(CSAT SENT DATE) where CSAT SENT DATE >= CSAT cycle start date (MM-DD-YYYY)
    // Responded = count(CSAT RECEIVED DATE) where CSAT RECEIVED DATE >= CSAT cycle start date (MM-DD-YYYY)
    secondSheet.forEach(row => {
      // Filter by ENGAGEMENT TYPE = "Fully Managed"
      if (secondEngagementKey) {
        const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? row['Project Engagement Type'] ?? '').toString().trim();
        if (!isFullyManaged(engVal)) return;
      }
      const cid = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString().trim();
      const bu = secondBuKey ? (normalizeBU((row[secondBuKey] ?? '').toString().trim()) || 'N/A') : (customerToBU[cid] || '');
      if (!bu) return;
      if (!(bu in polledByBu)) polledByBu[bu] = 0;
      if (!(bu in respondedByBu)) respondedByBu[bu] = 0;

      // Count Polled: CSAT SENT DATE exists and is >= CSAT cycle start date
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        polledByBu[bu]++;
      }

      // Count Responded: CSAT RECEIVED DATE exists and is >= CSAT cycle start date
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        respondedByBu[bu]++;
      }
    });

    // Include BUs that appear only in sheet 2 (Polled > 0) so rows with Responded=0 show hyphen
    Object.keys(polledByBu).forEach(bu => {
      if (polledByBu[bu] > 0 && !byBu[bu]) {
        byBu[bu] = { totalRows: 0, satisfied: {}, distinctResponses: new Set() };
        FULLY_MANAGED_PERSPECTIVES.forEach(p => { byBu[bu].satisfied[p] = 0; });
      }
    });

    const rows = Object.keys(byBu)
      .filter(bu => (polledByBu[bu] || 0) > 0)
      .map(bu => {
        const responded = respondedByBu[bu] || 0;
        const out = { 'BUSINESS UNIT': bu, sNo: 0, Polled: polledByBu[bu] || 0, Responded: responded };
        FULLY_MANAGED_PERSPECTIVES.forEach(p => {
          out[p] = responded > 0 ? `${Math.round((byBu[bu].satisfied[p] || 0) / responded * 100)}%` : '-';
        });
        return out;
      });

    let filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;

    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['BUSINESS UNIT'] || '').localeCompare(b['BUSINESS UNIT'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    // Org level row: grand total Polled, Responded, and count(RATING 4 or 5 per perspective)/count(CSAT RECEIVED DATE)*100 at org level
    let totalPolled = 0, totalResponded = 0;
    const totalSatisfiedFM = {};
    FULLY_MANAGED_PERSPECTIVES.forEach(p => { totalSatisfiedFM[p] = 0; });
    filteredRows.forEach(r => {
      totalPolled += r.Polled || 0;
      totalResponded += r.Responded || 0;
      const bu = r['BUSINESS UNIT'];
      if (byBu[bu]) FULLY_MANAGED_PERSPECTIVES.forEach(p => { totalSatisfiedFM[p] += byBu[bu].satisfied[p] || 0; });
    });
    const orgRowFM = { sNo: '', 'BUSINESS UNIT': 'Org level', Polled: totalPolled, Responded: totalResponded };
    FULLY_MANAGED_PERSPECTIVES.forEach(p => {
      orgRowFM[p] = totalResponded > 0 ? `${Math.round((totalSatisfiedFM[p] || 0) / totalResponded * 100)}%` : '-';
    });
    filteredRows.push(orgRowFM);
    console.log('[Fully Managed – BU Wise] Result rows (dashboard table):', filteredRows.length, '| Polled/Responded by BU:', filteredRows.map(r => ({ BU: r['BUSINESS UNIT'], Polled: r.Polled, Responded: r.Responded })));
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Co-Managed – BU Wise % Satisfied: Perspective % = count(RATING 4 or 5 for that perspective, from "CSAT received Report", Co-Managed, group by BU) / count(CSAT RECEIVED DATE) from "CSAT sent and received Report" (same filters, group by BU) × 100. Only rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY). #Polled/#Responded = count(CSAT SENT DATE) / count(CSAT RECEIVED DATE) from sheet 2.
  const coManagedBuWiseData = useMemo(() => {
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const customerIdKey = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k))) || 'CUSTOMER_ID';
    if (!perspectiveColumn || !engagementKey) return [];

    const isCoManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'co-managed' || v === 'comanaged';
    };

    const coManagedRows = uploadedData.filter(row => isCoManaged(row[engagementKey]));
    const customerToBU = {};
    const byBu = {};
    coManagedRows.forEach(row => {
      // Only include rows where CSAT RECEIVED DATE >= CSAT cycle start (MM-DD-YYYY)
      if (receivedDateKey) {
        const rv = row[receivedDateKey];
        if (rv == null || String(rv).trim() === '' || String(rv).trim() === 'N/A' || !isDateOnOrAfterCsatStart(rv)) return;
      }
      const bu = normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A';
      const cid = (row[customerIdKey] ?? row['CUST_ID'] ?? '').toString().trim();
      if (cid) customerToBU[cid] = bu;
      if (!byBu[bu]) {
        byBu[bu] = { totalRows: 0, satisfied: {}, distinctResponses: new Set() };
        CO_MANAGED_PERSPECTIVES.forEach(p => { byBu[bu].satisfied[p] = 0; });
      }
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      byBu[bu].totalRows++;
      if (pv && byBu[bu].satisfied[pv] !== undefined && rating >= 4) byBu[bu].satisfied[pv]++;
      if (receivedDateKey && row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') {
        byBu[bu].distinctResponses.add(`${cid}|${String(row[receivedDateKey]).trim()}`);
      }
    });

    const polledByBu = {};
    const respondedByBu = {};
    Object.keys(byBu).forEach(bu => { polledByBu[bu] = 0; respondedByBu[bu] = 0; });

    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondFirst = secondSheet[0] || {};
    const sentDateCol = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k))) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k))) || 'CSAT RECEIVED DATE';
    const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const secondBuKey = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k)));

    // Count Polled and Responded from sheet 2 "CSAT sent and received Report" where ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT
    // Polled = count(CSAT SENT DATE) where CSAT SENT DATE >= CSAT cycle start date (MM-DD-YYYY)
    // Responded = count(CSAT RECEIVED DATE) where CSAT RECEIVED DATE >= CSAT cycle start date (MM-DD-YYYY)
    secondSheet.forEach(row => {
      if (secondEngagementKey) {
        const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? row['Project Engagement Type'] ?? '').toString().trim();
        if (!isCoManaged(engVal)) return;
      }
      const cid = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString().trim();
      const bu = secondBuKey ? (normalizeBU((row[secondBuKey] ?? '').toString().trim()) || 'N/A') : (customerToBU[cid] || '');
      if (!bu) return;
      if (!(bu in polledByBu)) polledByBu[bu] = 0;
      if (!(bu in respondedByBu)) respondedByBu[bu] = 0;

      // Count Polled: CSAT SENT DATE exists and is >= CSAT cycle start date
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        polledByBu[bu]++;
      }

      // Count Responded: CSAT RECEIVED DATE exists and is >= CSAT cycle start date
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        respondedByBu[bu]++;
      }
    });

    // Include BUs that appear only in sheet 2 (Polled > 0) so rows with Responded=0 show hyphen
    Object.keys(polledByBu).forEach(bu => {
      if (polledByBu[bu] > 0 && !byBu[bu]) {
        byBu[bu] = { totalRows: 0, satisfied: {}, distinctResponses: new Set() };
        CO_MANAGED_PERSPECTIVES.forEach(p => { byBu[bu].satisfied[p] = 0; });
      }
    });

    const rows = Object.keys(byBu)
      .filter(bu => (polledByBu[bu] || 0) > 0)
      .map(bu => {
        const responded = respondedByBu[bu] || 0;
        const out = { 'BUSINESS UNIT': bu, sNo: 0, Polled: polledByBu[bu] || 0, Responded: responded };
        CO_MANAGED_PERSPECTIVES.forEach(p => {
          out[p] = responded > 0 ? `${Math.round((byBu[bu].satisfied[p] || 0) / responded * 100)}%` : '-';
        });
        return out;
      });

    let filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;

    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['BUSINESS UNIT'] || '').localeCompare(b['BUSINESS UNIT'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    // Org level row: grand total Polled, Responded, and count(RATING 4 or 5 per perspective)/count(CSAT RECEIVED DATE)*100 at org level
    let totalPolledCM = 0, totalRespondedCM = 0;
    const totalSatisfiedCM = {};
    CO_MANAGED_PERSPECTIVES.forEach(p => { totalSatisfiedCM[p] = 0; });
    filteredRows.forEach(r => {
      totalPolledCM += r.Polled || 0;
      totalRespondedCM += r.Responded || 0;
      const bu = r['BUSINESS UNIT'];
      if (byBu[bu]) CO_MANAGED_PERSPECTIVES.forEach(p => { totalSatisfiedCM[p] += byBu[bu].satisfied[p] || 0; });
    });
    const orgRowCM = { sNo: '', 'BUSINESS UNIT': 'Org level', Polled: totalPolledCM, Responded: totalRespondedCM };
    CO_MANAGED_PERSPECTIVES.forEach(p => {
      orgRowCM[p] = totalRespondedCM > 0 ? `${Math.round((totalSatisfiedCM[p] || 0) / totalRespondedCM * 100)}%` : '-';
    });
    filteredRows.push(orgRowCM);
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Staff Augmentation – BU Wise % Satisfied: Perspective % = count(RATING 4 or 5 for that perspective, from "CSAT received Report", Staff Augmentation, group by BU) / count(CSAT RECEIVED DATE) from "CSAT sent and received Report" (same filters, group by BU) × 100. Only rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY). #Polled/#Responded table columns = count(CSAT SENT DATE) / count(CSAT RECEIVED DATE) from sheet 2.
  const staffAugmentationBuWiseData = useMemo(() => {
    const dataLen = uploadedData && Array.isArray(uploadedData) ? uploadedData.length : 0;
    console.log('Staff Augmentation – BU Wise useMemo ran | uploadedData.length:', dataLen);
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const sentDateKeyFirst = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
    const receivedDateKeyFirst = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });

    if (!perspectiveColumn || !engagementKey) {
      console.log('[Staff Augmentation – BU Wise] Skipped: missing perspectiveColumn or engagementKey');
      return [];
    }

    const isStaffAugmentation = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'staff augmentation' || v === 'staffaugmentation' || (v.includes('staff') && v.includes('augmentation'));
    };

    // Sheet 2 "CSAT sent and received Report": #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE), ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT, dates >= csatCycleStartDateFormatted (MM-DD-YYYY)
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const polledByBu = {};
    const respondedByBu = {};
    if (secondSheet.length > 0) {
      const secondFirst = secondSheet[0] || {};
      const sentDateColS2 = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
      const receivedDateColS2 = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k)));
      const buColS2 = Object.keys(secondFirst).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
      const engagementKeyS2 = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
        Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
      secondSheet.forEach(row => {
        if (engagementKeyS2 && !isStaffAugmentation(row[engagementKeyS2])) return;
        const bu = normalizeBU((row[buColS2] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A';
        if (!polledByBu[bu]) { polledByBu[bu] = 0; respondedByBu[bu] = 0; }
        const sentVal = row[sentDateColS2] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
        if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A') {
          const sentFormatted = parseExcelDateToMMDDYYYY(sentVal);
          if (sentFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted))) polledByBu[bu]++;
        }
        const receivedVal = row[receivedDateColS2] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A') {
          const receivedFormatted = parseExcelDateToMMDDYYYY(receivedVal);
          if (receivedFormatted && (!csatCycleStartDateFormatted || isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted))) respondedByBu[bu]++;
        }
      });
    }

    // Sheet 1 "CSAT received Report": satisfied counts (RATING 4 or 5 per perspective), ENGAGEMENT TYPE = "Staff Augmentation", both dates >= cycle start, group by BU
    const dateFilterSheet1 = (row) => {
      if (!csatCycleStartDateFormatted) return true;
      if (receivedDateKeyFirst) {
        const receivedVal = (row[receivedDateKeyFirst] != null && String(row[receivedDateKeyFirst]).trim() !== '') ? String(row[receivedDateKeyFirst]).trim() : null;
        if (!receivedVal) return false;
        const receivedFormatted = parseExcelDateToMMDDYYYY(row[receivedDateKeyFirst]);
        if (!receivedFormatted || !isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted)) return false;
      }
      if (sentDateKeyFirst) {
        const sentVal = (row[sentDateKeyFirst] != null && String(row[sentDateKeyFirst]).trim() !== '') ? String(row[sentDateKeyFirst]).trim() : null;
        if (!sentVal) return false;
        const sentFormatted = parseExcelDateToMMDDYYYY(row[sentDateKeyFirst]);
        if (!sentFormatted || !isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted)) return false;
      }
      return true;
    };

    const staffAugRows = uploadedData.filter(row => isStaffAugmentation(row[engagementKey]) && dateFilterSheet1(row));
    const byBu = {};
    // #Responded from sheet 1 "CSAT received Report" per BU (count of rows with both dates >= cycle start) – used as denominator for perspective %
    const respondedByBuSheet1 = {};
    staffAugRows.forEach(row => {
      const bu = normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A';
      if (!byBu[bu]) {
        byBu[bu] = { satisfied: {} };
        STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { byBu[bu].satisfied[p] = 0; });
        respondedByBuSheet1[bu] = 0;
      }
      respondedByBuSheet1[bu]++;
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING'] ?? row['Rating'] ?? row['rating'] ?? '') || 0;
      if (pv && byBu[bu].satisfied[pv] !== undefined && rating >= 4) byBu[bu].satisfied[pv]++;
    });

    // All BUs from sheet 2 "CSAT sent and received Report" or sheet 1 (so we show every BU with Staff Augmentation data)
    const allBus = new Set([...Object.keys(polledByBu), ...Object.keys(byBu)]);
    const rows = Array.from(allBus).map(bu => {
        const polled = polledByBu[bu] || 0;
        const responded = respondedByBu[bu] || 0; // count(CSAT RECEIVED DATE) from sheet 2 – used as denominator for perspective %
        const out = { 'BUSINESS UNIT': bu, sNo: 0, Polled: polled, Responded: responded };
        STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => {
          out[p] = responded > 0 ? `${Math.round((byBu[bu]?.satisfied?.[p] || 0) / responded * 100)}%` : '-';
        });
        return out;
      });

    let filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;

    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['BUSINESS UNIT'] || '').localeCompare(b['BUSINESS UNIT'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    // Org level row: Polled/Responded from sheet 2; perspective % = sum(satisfied per perspective from sheet 1) / total count(CSAT RECEIVED DATE) from sheet 2
    let totalPolledSA = 0, totalRespondedSA = 0;
    const totalSatisfiedSA = {};
    STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { totalSatisfiedSA[p] = 0; });
    filteredRows.forEach(r => {
      const bu = r['BUSINESS UNIT'];
      if (bu === 'Org level') return;
      totalPolledSA += r.Polled || 0;
      totalRespondedSA += r.Responded || 0;
      if (byBu[bu]) STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { totalSatisfiedSA[p] += byBu[bu].satisfied[p] || 0; });
    });
    const orgRowSA = { sNo: '', 'BUSINESS UNIT': 'Org level', Polled: totalPolledSA, Responded: totalRespondedSA };
    STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => {
      orgRowSA[p] = totalRespondedSA > 0 ? `${Math.round((totalSatisfiedSA[p] || 0) / totalRespondedSA * 100)}%` : '-';
    });
    filteredRows.push(orgRowSA);
    console.log('[Staff Augmentation – BU Wise] Result rows (dashboard table):', filteredRows.length, '| data:', filteredRows);
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Fully Managed – Account Wise % Satisfied (by Perspective): Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID or CUST_ID. Columns: Sr.No., Account Name, BUSINESS UNIT, Polled, Responded (from sheet 2), then perspective columns. Polled/Responded = count(CSAT SENT DATE)/count(CSAT RECEIVED DATE) from sheet 2 where date >= CSAT cycle start (MM-DD-YYYY).
  const fullyManagedAccountWiseData = useMemo(() => {
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const customerIdKey = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k))) || 'CUSTOMER_ID';
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    if (!perspectiveColumn || !engagementKey) return [];

    const isFullyManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'fully managed' || v === 'fullymanaged';
    };

    const fmRows = uploadedData.filter(row => isFullyManaged(row[engagementKey]));
    const byAccount = {};
    fmRows.forEach(row => {
      const cid = (row[customerIdKey] ?? row['CUST_ID'] ?? '').toString().trim() || 'Unknown';
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!byAccount[cid]) {
        byAccount[cid] = {
          customerId: cid,
          accountName: (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A').toString().trim(),
          businessUnit: normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A',
          responseDates: new Set(),
          satisfied: {}
        };
        FULLY_MANAGED_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
      }
      if (receivedVal) byAccount[cid].responseDates.add(receivedVal);
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && byAccount[cid].satisfied[pv] !== undefined && (rating === 4 || rating === 5)) {
        byAccount[cid].satisfied[pv]++;
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report", ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID or CUST_ID, dates >= CSAT cycle start (MM-DD-YYYY)
    const polledByCid = {};
    const respondedByCid = {};
    Object.keys(byAccount).forEach(cid => { polledByCid[cid] = 0; respondedByCid[cid] = 0; });
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondFirst = secondSheet[0] || {};
    const sentDateCol = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k))) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k))) || 'CSAT RECEIVED DATE';
    const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    secondSheet.forEach(row => {
      if (secondEngagementKey) {
        const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
        if (!isFullyManaged(engVal)) return;
      }
      const cid = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString().trim();
      if (!cid) return;
      if (!(cid in polledByCid)) polledByCid[cid] = 0;
      if (!(cid in respondedByCid)) respondedByCid[cid] = 0;
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        polledByCid[cid]++;
      }
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        respondedByCid[cid]++;
      }
    });

    // Include accounts that appear only in sheet 2 (Polled > 0) so rows with Responded=0 show hyphen
    if (secondSheet.length > 0) {
      const customerNameKey2 = Object.keys(secondSheet[0] || {}).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const businessUnitKey2 = Object.keys(secondSheet[0] || {}).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
      Object.keys(polledByCid).forEach(cid => {
        if (polledByCid[cid] > 0 && !byAccount[cid]) {
          const firstRow = secondSheet.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === cid) || {};
          byAccount[cid] = {
            customerId: cid,
            accountName: (firstRow[customerNameKey2] ?? firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? cid).toString().trim(),
            businessUnit: normalizeBU(String(firstRow[businessUnitKey2] ?? firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A').trim()) || 'N/A',
            responseDates: new Set(),
            satisfied: {}
          };
          FULLY_MANAGED_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
        }
      });
    }

    const rows = Object.values(byAccount)
      .filter(acc => (polledByCid[acc.customerId] ?? 0) > 0)
      .map((acc, idx) => {
      const cid = acc.customerId;
      const responded = respondedByCid[cid] ?? 0;
      const out = {
        sNo: idx + 1,
        'Account Name': acc.accountName,
        'BUSINESS UNIT': acc.businessUnit,
        Polled: polledByCid[cid] ?? 0,
        Responded: responded,
        customerId: cid
      };
      FULLY_MANAGED_PERSPECTIVES.forEach(p => {
        out[p] = responded > 0 ? `${Math.round((acc.satisfied[p] || 0) / responded * 100)}%` : '-';
      });
      return out;
    });

    const filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;
    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['Account Name'] || '').localeCompare(b['Account Name'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Co-Managed – Account Wise % Satisfied (by Perspective): Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Co-Managed", group by CUSTOMER_ID or CUST_ID. Polled/Responded from sheet 2 where date >= CSAT cycle start (MM-DD-YYYY). Same perspective columns as Fully Managed.
  const coManagedAccountWiseData = useMemo(() => {
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const customerIdKey = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k))) || 'CUSTOMER_ID';
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    if (!perspectiveColumn || !engagementKey) return [];

    const isCoManaged = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'co-managed' || v === 'comanaged';
    };

    const cmRows = uploadedData.filter(row => isCoManaged(row[engagementKey]));
    const byAccount = {};
    cmRows.forEach(row => {
      const cid = (row[customerIdKey] ?? row['CUST_ID'] ?? '').toString().trim() || 'Unknown';
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!byAccount[cid]) {
        byAccount[cid] = {
          customerId: cid,
          accountName: (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A').toString().trim(),
          businessUnit: normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A',
          responseDates: new Set(),
          satisfied: {}
        };
        CO_MANAGED_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
      }
      if (receivedVal) byAccount[cid].responseDates.add(receivedVal);
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && byAccount[cid].satisfied[pv] !== undefined && (rating === 4 || rating === 5)) {
        byAccount[cid].satisfied[pv]++;
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report", ENGAGEMENT TYPE = "Co-Managed", group by CUSTOMER_ID or CUST_ID, dates >= CSAT cycle start (MM-DD-YYYY)
    const polledByCid = {};
    const respondedByCid = {};
    Object.keys(byAccount).forEach(cid => { polledByCid[cid] = 0; respondedByCid[cid] = 0; });
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondFirst = secondSheet[0] || {};
    const sentDateCol = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k))) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k))) || 'CSAT RECEIVED DATE';
    const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    secondSheet.forEach(row => {
      if (secondEngagementKey) {
        const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
        if (!isCoManaged(engVal)) return;
      }
      const cid = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString().trim();
      if (!cid) return;
      if (!(cid in polledByCid)) polledByCid[cid] = 0;
      if (!(cid in respondedByCid)) respondedByCid[cid] = 0;
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        polledByCid[cid]++;
      }
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        respondedByCid[cid]++;
      }
    });

    // Include accounts that appear only in sheet 2 (Polled > 0) so rows with Responded=0 show hyphen
    if (secondSheet.length > 0) {
      const customerNameKey2 = Object.keys(secondSheet[0] || {}).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const businessUnitKey2 = Object.keys(secondSheet[0] || {}).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
      Object.keys(polledByCid).forEach(cid => {
        if (polledByCid[cid] > 0 && !byAccount[cid]) {
          const firstRow = secondSheet.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === cid) || {};
          byAccount[cid] = {
            customerId: cid,
            accountName: (firstRow[customerNameKey2] ?? firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? cid).toString().trim(),
            businessUnit: normalizeBU(String(firstRow[businessUnitKey2] ?? firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A').trim()) || 'N/A',
            responseDates: new Set(),
            satisfied: {}
          };
          CO_MANAGED_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
        }
      });
    }

    const rows = Object.values(byAccount)
      .filter(acc => (polledByCid[acc.customerId] ?? 0) > 0)
      .map((acc, idx) => {
        const cid = acc.customerId;
        const responded = respondedByCid[cid] ?? 0;
        const out = {
          sNo: idx + 1,
          'Account Name': acc.accountName,
          'BUSINESS UNIT': acc.businessUnit,
          Polled: polledByCid[cid] ?? 0,
          Responded: responded,
          customerId: cid
        };
        CO_MANAGED_PERSPECTIVES.forEach(p => {
          out[p] = responded > 0 ? `${Math.round((acc.satisfied[p] || 0) / responded * 100)}%` : '-';
        });
        return out;
      });

    const filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;
    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['Account Name'] || '').localeCompare(b['Account Name'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Staff Augmentation – Account Wise % Satisfied (by Perspective): Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by CUSTOMER_ID or CUST_ID. Polled/Responded from sheet 2 where date >= CSAT cycle start (MM-DD-YYYY). Perspectives: Overall Experience, Resource Competency, Timely Resource Fulfillment.
  const staffAugmentationAccountWiseData = useMemo(() => {
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) return [];
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const businessUnitKey = Object.keys(firstRow).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const customerIdKey = Object.keys(firstRow).find(k => /cust_id|customer_id/i.test(String(k))) || 'CUSTOMER_ID';
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    if (!perspectiveColumn || !engagementKey) return [];

    const isStaffAugmentation = (val) => {
      const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : '';
      return v === 'staff augmentation' || v === 'staffaugmentation' || (v.includes('staff') && v.includes('augmentation'));
    };

    const saRows = uploadedData.filter(row => isStaffAugmentation(row[engagementKey]));
    const byAccount = {};
    saRows.forEach(row => {
      const cid = (row[customerIdKey] ?? row['CUST_ID'] ?? '').toString().trim() || 'Unknown';
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!byAccount[cid]) {
        byAccount[cid] = {
          customerId: cid,
          accountName: (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A').toString().trim(),
          businessUnit: normalizeBU((row[businessUnitKey] ?? row['BUSSINESS UNIT'] ?? '').toString().trim()) || 'N/A',
          responseDates: new Set(),
          satisfied: {}
        };
        STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
      }
      if (receivedVal) byAccount[cid].responseDates.add(receivedVal);
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && byAccount[cid].satisfied[pv] !== undefined && (rating === 4 || rating === 5)) {
        byAccount[cid].satisfied[pv]++;
      }
    });

    // Polled and Responded from sheet 2 "CSAT sent and received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by CUSTOMER_ID or CUST_ID, dates >= CSAT cycle start (MM-DD-YYYY)
    const polledByCid = {};
    const respondedByCid = {};
    Object.keys(byAccount).forEach(cid => { polledByCid[cid] = 0; respondedByCid[cid] = 0; });
    const secondSheet = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const secondFirst = secondSheet[0] || {};
    const sentDateCol = Object.keys(secondFirst).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k))) || 'CSAT SENT DATE';
    const receivedDateCol = Object.keys(secondFirst).find(k => /csat received date|css_received_date|received date/i.test(String(k))) || 'CSAT RECEIVED DATE';
    const secondEngagementKey = Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(secondFirst).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    secondSheet.forEach(row => {
      if (secondEngagementKey) {
        const engVal = (row[secondEngagementKey] ?? row['ENGAGEMENT TYPE'] ?? '').toString().trim();
        if (!isStaffAugmentation(engVal)) return;
      }
      const cid = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString().trim();
      if (!cid) return;
      if (!(cid in polledByCid)) polledByCid[cid] = 0;
      if (!(cid in respondedByCid)) respondedByCid[cid] = 0;
      const sentVal = row[sentDateCol] ?? row['CSAT SENT DATE'] ?? row['CSS_SENT_DATE'];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        polledByCid[cid]++;
      }
      const receivedVal = row[receivedDateCol] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        respondedByCid[cid]++;
      }
    });

    // Include accounts that appear only in sheet 2 (Polled > 0) so rows with Responded=0 show hyphen
    if (secondSheet.length > 0) {
      const customerNameKey2 = Object.keys(secondSheet[0] || {}).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const businessUnitKey2 = Object.keys(secondSheet[0] || {}).find(k => /business\s*unit|bussiness\s*unit/i.test(String(k))) || 'BUSINESS UNIT';
      Object.keys(polledByCid).forEach(cid => {
        if (polledByCid[cid] > 0 && !byAccount[cid]) {
          const firstRow = secondSheet.find(r => (r['CUST_ID'] ?? r['CUSTOMER_ID']) === cid) || {};
          byAccount[cid] = {
            customerId: cid,
            accountName: (firstRow[customerNameKey2] ?? firstRow['CUSTOMER NAME'] ?? firstRow['CUST_NM'] ?? cid).toString().trim(),
            businessUnit: normalizeBU(String(firstRow[businessUnitKey2] ?? firstRow['BUSINESS UNIT'] ?? firstRow['BUSSINESS UNIT'] ?? 'N/A').trim()) || 'N/A',
            responseDates: new Set(),
            satisfied: {}
          };
          STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { byAccount[cid].satisfied[p] = 0; });
        }
      });
    }

    const rows = Object.values(byAccount)
      .filter(acc => (polledByCid[acc.customerId] ?? 0) > 0)
      .map((acc, idx) => {
        const cid = acc.customerId;
        const responded = respondedByCid[cid] ?? 0;
        const out = {
          sNo: idx + 1,
          'Account Name': acc.accountName,
          'BUSINESS UNIT': acc.businessUnit,
          Polled: polledByCid[cid] ?? 0,
          Responded: responded,
          customerId: cid
        };
        STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => {
          out[p] = responded > 0 ? `${Math.round((acc.satisfied[p] || 0) / responded * 100)}%` : '-';
        });
        return out;
      });

    const filteredRows = businessUnitFilter
      ? rows.filter(r => (r['BUSINESS UNIT'] || '').toString().toLowerCase().includes(businessUnitFilter.toLowerCase()))
      : rows;
    filteredRows.sort((a, b) => {
      const idxA = getBusinessUnitOrderIndex(a['BUSINESS UNIT']);
      const idxB = getBusinessUnitOrderIndex(b['BUSINESS UNIT']);
      if (idxA !== idxB) return idxA - idxB;
      return (a['Account Name'] || '').localeCompare(b['Account Name'] || '');
    });
    filteredRows.forEach((r, i) => { r.sNo = i + 1; });
    return filteredRows;
  }, [uploadedData, excelData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Grand Total for Account Wise % Satisfied: #Polleded = sum(rows.Polled), #Responded = sum(rows.Responded), perspective % = (count of RATING 4 or 5 in sheet 1 "CSAT received Report" for that perspective, ENGAGEMENT TYPE = dashboard, where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY)) / #Responded * 100.
  const grandTotalFullyManagedAccountWise = useMemo(() => {
    if (!fullyManagedAccountWiseData || fullyManagedAccountWiseData.length === 0) return null;
    const totalPolled = fullyManagedAccountWiseData.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const totalResponded = fullyManagedAccountWiseData.reduce((s, r) => s + (r.Responded ?? 0), 0);
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
      const perspectiveValues = {};
      FULLY_MANAGED_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => { const kk = String(k).toLowerCase(); return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date'); });
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
    if (!perspectiveColumn || !engagementKey) {
      const perspectiveValues = {};
      FULLY_MANAGED_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const isFullyManaged = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'fully managed' || v === 'fullymanaged'; };
    // Only count rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY)
    const filteredRows = uploadedData.filter(row => {
      if (!isFullyManaged(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!receivedVal || !isDateOnOrAfterCsatStart(receivedVal)) return false;
      if (sentDateKey) {
        const sentVal = row[sentDateKey] != null && String(row[sentDateKey]).trim() !== '' ? String(row[sentDateKey]).trim() : null;
        if (sentVal == null || !isDateOnOrAfterCsatStart(sentVal)) return false;
      }
      return true;
    });
    const countByPerspective = {};
    FULLY_MANAGED_PERSPECTIVES.forEach(p => { countByPerspective[p] = 0; });
    filteredRows.forEach(row => {
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && countByPerspective[pv] !== undefined && (rating === 4 || rating === 5)) countByPerspective[pv]++;
    });
    const perspectiveValues = {};
    FULLY_MANAGED_PERSPECTIVES.forEach(p => {
      perspectiveValues[p] = totalResponded > 0 ? `${Math.round((countByPerspective[p] || 0) / totalResponded * 100)}%` : '-';
    });
    return { totalPolled, totalResponded, perspectiveValues };
  }, [fullyManagedAccountWiseData, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  const grandTotalCoManagedAccountWise = useMemo(() => {
    if (!coManagedAccountWiseData || coManagedAccountWiseData.length === 0) return null;
    const totalPolled = coManagedAccountWiseData.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const totalResponded = coManagedAccountWiseData.reduce((s, r) => s + (r.Responded ?? 0), 0);
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
      const perspectiveValues = {};
      CO_MANAGED_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => { const kk = String(k).toLowerCase(); return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date'); });
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
    if (!perspectiveColumn || !engagementKey) {
      const perspectiveValues = {};
      CO_MANAGED_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const isCoManaged = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'co-managed' || v === 'comanaged'; };
    // Only count rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY)
    const filteredRows = uploadedData.filter(row => {
      if (!isCoManaged(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!receivedVal || !isDateOnOrAfterCsatStart(receivedVal)) return false;
      if (sentDateKey) {
        const sentVal = row[sentDateKey] != null && String(row[sentDateKey]).trim() !== '' ? String(row[sentDateKey]).trim() : null;
        if (sentVal == null || !isDateOnOrAfterCsatStart(sentVal)) return false;
      }
      return true;
    });
    const countByPerspective = {};
    CO_MANAGED_PERSPECTIVES.forEach(p => { countByPerspective[p] = 0; });
    filteredRows.forEach(row => {
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && countByPerspective[pv] !== undefined && (rating === 4 || rating === 5)) countByPerspective[pv]++;
    });
    const perspectiveValues = {};
    CO_MANAGED_PERSPECTIVES.forEach(p => {
      perspectiveValues[p] = totalResponded > 0 ? `${Math.round((countByPerspective[p] || 0) / totalResponded * 100)}%` : '-';
    });
    return { totalPolled, totalResponded, perspectiveValues };
  }, [coManagedAccountWiseData, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  const grandTotalStaffAugmentationAccountWise = useMemo(() => {
    if (!staffAugmentationAccountWiseData || staffAugmentationAccountWiseData.length === 0) return null;
    const totalPolled = staffAugmentationAccountWiseData.reduce((s, r) => s + (r.Polled ?? 0), 0);
    const totalResponded = staffAugmentationAccountWiseData.reduce((s, r) => s + (r.Responded ?? 0), 0);
    if (!uploadedData || !Array.isArray(uploadedData) || uploadedData.length === 0) {
      const perspectiveValues = {};
      STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const firstRow = uploadedData[0] || {};
    const perspectiveColumn = Object.keys(firstRow).find(k => String(k).toLowerCase().includes('perspective'));
    const engagementKey = Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'engagementtype') ||
      Object.keys(firstRow).find(k => String(k).toLowerCase().replace(/\s/g, '') === 'projectengagementtype');
    const receivedDateKey = Object.keys(firstRow).find(k => { const kk = String(k).toLowerCase(); return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date'); });
    const sentDateKey = Object.keys(firstRow).find(k => /csat sent date|css_sent_date|sent date/i.test(String(k)));
    if (!perspectiveColumn || !engagementKey) {
      const perspectiveValues = {};
      STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { perspectiveValues[p] = totalResponded > 0 ? '0%' : '-'; });
      return { totalPolled, totalResponded, perspectiveValues };
    }
    const isStaffAugmentation = (val) => { const v = (val != null && val !== '') ? String(val).trim().toLowerCase().replace(/\s+/g, ' ') : ''; return v === 'staff augmentation' || v === 'staffaugmentation' || (v.includes('staff') && v.includes('augmentation')); };
    // Only count rows where CSAT SENT DATE and CSAT RECEIVED DATE >= csatCycleStartDateFormatted (MM-DD-YYYY)
    const filteredRows = uploadedData.filter(row => {
      if (!isStaffAugmentation(row[engagementKey])) return false;
      if (!matchesBusinessUnitFilter(row, businessUnitFilter)) return false;
      const receivedVal = receivedDateKey ? (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '') ? String(row[receivedDateKey]).trim() : null : null;
      if (!receivedVal || !isDateOnOrAfterCsatStart(receivedVal)) return false;
      if (sentDateKey) {
        const sentVal = row[sentDateKey] != null && String(row[sentDateKey]).trim() !== '' ? String(row[sentDateKey]).trim() : null;
        if (sentVal == null || !isDateOnOrAfterCsatStart(sentVal)) return false;
      }
      return true;
    });
    const countByPerspective = {};
    STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => { countByPerspective[p] = 0; });
    filteredRows.forEach(row => {
      const pv = normalizePerspective(row[perspectiveColumn]);
      const rating = parseFloat(row['RATING']) || 0;
      if (pv && countByPerspective[pv] !== undefined && (rating === 4 || rating === 5)) countByPerspective[pv]++;
    });
    const perspectiveValues = {};
    STAFF_AUGMENTATION_PERSPECTIVES.forEach(p => {
      perspectiveValues[p] = totalResponded > 0 ? `${Math.round((countByPerspective[p] || 0) / totalResponded * 100)}%` : '-';
    });
    return { totalPolled, totalResponded, perspectiveValues };
  }, [staffAugmentationAccountWiseData, uploadedData, csatCycleStartDateFormatted, businessUnitFilter]);

  // Trend Analysis (from uploaded trend file): Sheet2 "CSAT sent and received Report", group by BUSINESS UNIT. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted (MM-DD-YYYY).
  const trendBuWiseData = useMemo(() => {
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
      if (!buGroups[businessUnit]) buGroups[businessUnit] = { businessUnit, polled: 0, responded: 0 };
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) buGroups[businessUnit].polled++;
      if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) buGroups[businessUnit].responded++;
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

  // Trend Analysis – Top 10: from uploaded trend file sheet "CSAT sent and received Report", filter TYPE OF ACCOUNT = "Top 10", group by Account (CUSTOMER NAME or CUST_NM) and BUSINESS UNIT. #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted.
  const trendTop10Data = useMemo(() => {
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
    const accountNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || Object.keys(firstRow).find(k => k === 'CUSTOMER NAME' || k === 'CUST_NM') || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account/i.test(String(k))) || 'TYPE OF ACCOUNT';
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
      const typeOfAccount = String(row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').trim();
      if (typeOfAccount !== 'Top 10') return;
      const accountName = String(row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').trim() || 'N/A';
      const buRaw = row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? 'N/A';
      const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const key = `${accountName}|${businessUnit}`;
      if (!groups[key]) groups[key] = { accountName, businessUnit, polled: 0, responded: 0 };
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) groups[key].polled++;
      if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) groups[key].responded++;
    });
    const rows = Object.values(groups)
      .filter(g => g.polled > 0 || g.responded > 0)
      .map(g => ({ accountName: g.accountName, businessUnit: g.businessUnit, polled: g.polled, responded: g.responded }));
    rows.sort((a, b) => {
      const cmpAccount = (a.accountName || '').localeCompare(b.accountName || '');
      if (cmpAccount !== 0) return cmpAccount;
      const idxA = getBusinessUnitOrderIndex(a.businessUnit);
      const idxB = getBusinessUnitOrderIndex(b.businessUnit);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    return rows;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Account-wise Trend Analysis (H1 2025 reference): from uploaded Trend-Analysis-H12025.xlsx
  // Sheet2 "CSAT sent and received Report", group by CUSTOMER_ID/CUST_ID (+ BUSINESS UNIT).
  // Columns: Account Name (CUSTOMER NAME), Business Unit, #Polled=count(CSAT SENT DATE), #Responded=count(CSAT RECEIVED DATE),
  // plus perspective % columns after #Responded where % = (count of RATING 4/5 for that perspective from Sheet1 "CSAT received Report") / #Responded × 100
  const trendAccountWiseH1Reference = useMemo(() => {
    if (!showTrendAnalysis || showBuWise || showTop10) return { rows: [], hasData: false, sourceName: '', error: null };
    if (!trendAnalysisFiles?.length) return { rows: [], hasData: false, sourceName: '', error: 'No trend data uploaded.' };

    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sourceName = file.saveName || '';

    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return { rows: [], hasData: false, sourceName, error: 'No "CSAT sent and received Report" sheet found.' };

    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return { rows: [], hasData: false, sourceName, error: 'No rows in trend sheet.' };

    const firstRow = sheetData[0] || {};
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const custNameCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'customername') ||
      (String(k).toLowerCase() === 'customer name')
    ) || 'CUSTOMER NAME';
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
      const buRaw = row[buCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || 'N/A';
      const businessUnit = buRaw && buRaw !== 'N/A' ? (normalizeBU(String(buRaw).trim()) || 'N/A') : 'N/A';
      if (!businessUnit || businessUnit === 'N/A') return;
      const accountName = row[custNameCol] || row['CUSTOMER NAME'] || row['Customer Name'] || row['CUST_NM'] || 'N/A';
      const custId = row[custIdCol] ?? row['CUSTOMER_ID'] ?? row['CUST_ID'] ?? '';
      const keyId = (custId != null && String(custId).trim() !== '') ? String(custId).trim() : String(accountName).trim();
      const key = `${keyId}|||${businessUnit}`;

      if (!groups.has(key)) groups.set(key, { keyId, accountName: String(accountName).trim() || 'N/A', businessUnit, polled: 0, responded: 0, perspectives: {} });

      const sentVal = row[sentCol];
      const receivedVal = row[receivedCol];
      if (sentVal != null && String(sentVal).trim() !== '' && String(sentVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(sentVal)) {
        groups.get(key).polled += 1;
      }
      if (receivedVal != null && String(receivedVal).trim() !== '' && String(receivedVal).trim() !== 'N/A' && isDateOnOrAfterCsatStart(receivedVal)) {
        groups.get(key).responded += 1;
      }
    });

    // Sheet1: "CSAT received Report" for satisfied counts + total data input by perspective,
    // grouped by CUSTOMER_ID/CUST_ID (+ BUSINESS UNIT).
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];

    const satisfiedByKey = {};
    const dataInputByKey = {};
    if (receivedSheetName && file.sheets) {
      let receivedSheetData = file.sheets[receivedSheetName];
      if (!receivedSheetData && file.sheets) {
        const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
        if (exactKey) receivedSheetData = file.sheets[exactKey];
      }
      if (receivedSheetData && Array.isArray(receivedSheetData) && receivedSheetData.length > 0) {
        const rFirst = receivedSheetData[0] || {};
        const rBuCol = Object.keys(rFirst).find(k =>
          (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
          (String(k).toLowerCase() === 'business unit') ||
          (String(k).toLowerCase() === 'bussiness unit')
        ) || 'BUSINESS UNIT';
        const rCustNameCol = Object.keys(rFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
        const rCustIdCol = Object.keys(rFirst).find(k => {
          const n = String(k).toLowerCase().replace(/[\s_]/g, '');
          return n === 'customerid' || n === 'custid';
        }) || 'CUSTOMER_ID';
        const perspectiveCol = Object.keys(rFirst).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
        const receivedDateKey = Object.keys(rFirst).find(k => {
          const kk = String(k).toLowerCase();
          return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
        });

        receivedSheetData.forEach(row => {
          if (receivedDateKey && (row[receivedDateKey] != null && String(row[receivedDateKey]).trim() !== '')) {
            const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
            if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
          }
          const buRaw = row[rBuCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || '';
          const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
          if (!businessUnit || businessUnit === 'N/A') return;

          const accountName = row[rCustNameCol] || row['CUSTOMER NAME'] || row['Customer Name'] || row['CUST_NM'] || 'N/A';
          const custId = row[rCustIdCol] ?? row['CUSTOMER_ID'] ?? row['CUST_ID'] ?? '';
          const keyId = (custId != null && String(custId).trim() !== '') ? String(custId).trim() : String(accountName).trim();
          const key = `${keyId}|||${businessUnit}`;
          if (!groups.has(key)) return; // only compute for keys that exist in Sheet2

          const perspective = normalizePerspective(row[perspectiveCol]);
          if (!perspective || !PERSPECTIVE_COLUMN_ORDER.includes(perspective)) return;

          const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
          if (Number.isNaN(rating)) return;
          if (!dataInputByKey[key]) dataInputByKey[key] = {};
          dataInputByKey[key][perspective] = (dataInputByKey[key][perspective] || 0) + 1;
          if (rating !== 4 && rating !== 5) return;

          if (!satisfiedByKey[key]) satisfiedByKey[key] = {};
          satisfiedByKey[key][perspective] = (satisfiedByKey[key][perspective] || 0) + 1;
        });
      }
    }

    // Attach perspective % values after #Responded using per-perspective data input as denominator
    groups.forEach((g, key) => {
      PERSPECTIVE_COLUMN_ORDER.forEach(p => {
        const satisfied = satisfiedByKey[key]?.[p] || 0;
        const dataInputCount = dataInputByKey[key]?.[p] || 0;
        g.perspectives[p] = dataInputCount > 0 ? `${Math.round((satisfied / dataInputCount) * 100)}%` : '-';
      });
    });

    const rows = Array.from(groups.values()).sort((a, b) => {
      const an = (a.accountName || '').localeCompare(b.accountName || '');
      if (an !== 0) return an;
      return (a.businessUnit || '').localeCompare(b.businessUnit || '');
    });
    return { rows, hasData: rows.length > 0, sourceName, error: null, perspectives: [...PERSPECTIVE_COLUMN_ORDER] };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, showTrendAnalysis, showBuWise, showTop10]);

  const trendAccountWiseLookup = useMemo(() => {
    const lookup = {};
    const rows = trendAccountWiseH1Reference?.rows || [];
    rows.forEach(r => {
      const buKey = normalizeBusinessUnitDisplay(r.businessUnit || '').toString().trim().toLowerCase();
      const idKey = normalizeCustomerIdKey(r.keyId || '');
      const nameKey = normalizeAccountNameKey(r.accountName || '');
      if (buKey && idKey) lookup[`id|||${idKey}|||${buKey}`] = r;
      if (buKey && nameKey) lookup[`name|||${nameKey}|||${buKey}`] = r;
      if (nameKey) lookup[`nameOnly|||${nameKey}`] = r;
    });
    return lookup;
  }, [trendAccountWiseH1Reference]);

  // Trend Top 10 perspective % (per account): from trend file "CSAT received Report", TYPE OF ACCOUNT = "Top 10", group by account+BU. Value = (count RATING 4 or 5 per perspective / count of data input for that perspective) × 100. Do NOT use #Responded for per-account rows. "Top 10 Accounts" aggregate row keeps its own calculation (trendTop10SummaryPerspectives).
  const trendTop10PerspectiveData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted || !trendTop10Data.length) return {};
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
    const accountNameCol = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account/i.test(String(k)));
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const top10Keys = new Set(trendTop10Data.map(r => `${r.accountName}|${r.businessUnit}`));
    const satisfiedByKey = {};
    const dataInputByKey = {};
    sheetData.forEach(row => {
      if (typeOfAccountCol != null) {
        const typeOfAccount = String(row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').trim();
        if (typeOfAccount !== 'Top 10') return;
      }
      const accountName = String(row[accountNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').trim() || 'N/A';
      const buRaw = row[buCol] ?? row['BUSSINESS UNIT'] ?? row['Business Unit'] ?? '';
      const businessUnit = normalizeBU(String(buRaw).trim()) || 'N/A';
      const key = `${accountName}|${businessUnit}`;
      if (!top10Keys.has(key)) return;
      if (receivedDateKey && (row[receivedDateKey] != null && row[receivedDateKey] !== '')) {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol]);
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective || !PERSPECTIVE_COLUMN_ORDER.includes(perspective)) return;
      if (Number.isNaN(rating)) return;
      if (!dataInputByKey[key]) dataInputByKey[key] = {};
      dataInputByKey[key][perspective] = (dataInputByKey[key][perspective] || 0) + 1;
      if (rating === 4 || rating === 5) {
        if (!satisfiedByKey[key]) satisfiedByKey[key] = {};
        satisfiedByKey[key][perspective] = (satisfiedByKey[key][perspective] || 0) + 1;
      }
    });
    const result = {};
    const allKeys = new Set([...Object.keys(satisfiedByKey), ...Object.keys(dataInputByKey)]);
    allKeys.forEach(key => {
      result[key] = {};
      PERSPECTIVE_COLUMN_ORDER.forEach(p => {
        const satisfied = satisfiedByKey[key]?.[p] || 0;
        const dataInputCount = dataInputByKey[key]?.[p] || 0;
        result[key][p] = dataInputCount === 0 ? '-' : `${Math.round((satisfied / dataInputCount) * 100)}%`;
      });
    });
    return result;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, trendTop10Data]);

  // Trend "Other Accounts": from uploaded trend file sheet "CSAT sent and received Report", where TYPE OF ACCOUNT is blank, empty, or N/A. Single aggregate row: #Polled, #Responded.
  const trendOtherData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return null;
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let sentReceivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat sent and received') || sheetLower.includes('sent and received') || sheetLower === 'sheet2' || sheetLower === 'sheet 2';
    });
    if (!sentReceivedSheetName && sheetNamesToCheck.length >= 2) sentReceivedSheetName = sheetNamesToCheck[1];
    if (!sentReceivedSheetName || !file.sheets) return null;
    let sheetData = file.sheets[sentReceivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(sentReceivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) return null;
    const firstRow = sheetData[0] || {};
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account/i.test(String(k))) || 'TYPE OF ACCOUNT';
    const sentCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatsentdate') || kNorm.includes('sentdate') || (kNorm.includes('sent') && kNorm.includes('date'));
    }) || 'CSAT SENT DATE';
    const receivedCol = Object.keys(firstRow).find(k => {
      const kNorm = (k || '').toLowerCase().replace(/[\s_]/g, '');
      return kNorm.includes('csatreceiveddate') || kNorm.includes('receiveddate') || (kNorm.includes('received') && kNorm.includes('date'));
    }) || 'CSAT RECEIVED DATE';
    let polled = 0, responded = 0;
    sheetData.forEach(row => {
      const typeVal = String(row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').trim();
      const isOther = typeVal === '' || typeVal.toLowerCase() === 'n/a';
      if (!isOther) return;
      const sentDateFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedDateFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      if (sentDateFormatted && isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted)) polled++;
      if (receivedDateFormatted && isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted)) responded++;
    });
    return { polled, responded };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted]);

  // Trend: from "CSAT received Report" – satisfied and data input counts for Top 10 (TYPE OF ACCOUNT = "Top 10") and Other (TYPE OF ACCOUNT blank/empty/N/A). Used for "Top 10 Accounts", "Other Accounts", and "Overall" rows. Do NOT use #Responded.
  const trendTop10OtherOverallPerspectiveCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) {
      const empty = PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
      return { top10Satisfied: { ...empty }, top10DataInput: { ...empty }, otherSatisfied: { ...empty }, otherDataInput: { ...empty } };
    }
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) {
      const empty = PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
      return { top10Satisfied: { ...empty }, top10DataInput: { ...empty }, otherSatisfied: { ...empty }, otherDataInput: { ...empty } };
    }
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
      const empty = PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {});
      return { top10Satisfied: { ...empty }, top10DataInput: { ...empty }, otherSatisfied: { ...empty }, otherDataInput: { ...empty } };
    }
    const firstRow = sheetData[0] || {};
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const typeOfAccountCol = Object.keys(firstRow).find(k => /type\s*of\s*account/i.test(String(k)));
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });
    const top10Satisfied = {};
    const top10DataInput = {};
    const otherSatisfied = {};
    const otherDataInput = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => { top10Satisfied[p] = 0; top10DataInput[p] = 0; otherSatisfied[p] = 0; otherDataInput[p] = 0; });
    sheetData.forEach(row => {
      const typeVal = typeOfAccountCol != null ? String(row[typeOfAccountCol] ?? row['TYPE OF ACCOUNT'] ?? '').trim() : '';
      if (typeOfAccountCol == null) return;
      const isTop10 = typeVal === 'Top 10';
      const isOther = typeVal === '' || typeVal.toLowerCase() === 'n/a';
      if (!isTop10 && !isOther) return;
      if (receivedDateKey && (row[receivedDateKey] != null && row[receivedDateKey] !== '')) {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }
      const perspective = normalizePerspective(row[perspectiveCol]);
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective || !PERSPECTIVE_COLUMN_ORDER.includes(perspective) || Number.isNaN(rating)) return;
      if (isTop10) {
        top10DataInput[perspective] = (top10DataInput[perspective] || 0) + 1;
        if (rating === 4 || rating === 5) top10Satisfied[perspective] = (top10Satisfied[perspective] || 0) + 1;
      } else {
        otherDataInput[perspective] = (otherDataInput[perspective] || 0) + 1;
        if (rating === 4 || rating === 5) otherSatisfied[perspective] = (otherSatisfied[perspective] || 0) + 1;
      }
    });
    return { top10Satisfied, top10DataInput, otherSatisfied, otherDataInput };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, PERSPECTIVE_COLUMN_ORDER]);

  // Trend Other perspective %: from trend file "CSAT received Report", TYPE OF ACCOUNT blank/empty/N/A. (count RATING 4 or 5 / count of data input for that perspective) × 100. Do NOT use #Responded.
  const trendOtherPerspectiveData = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) return null;
    const { otherSatisfied, otherDataInput } = trendTop10OtherOverallPerspectiveCounts;
    const result = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => {
      const dataInput = otherDataInput[p] || 0;
      const satisfied = otherSatisfied[p] || 0;
      result[p] = dataInput === 0 ? '-' : `${Math.round((satisfied / dataInput) * 100)}%`;
    });
    return result;
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, trendTop10OtherOverallPerspectiveCounts]);

  // Trend: from "CSAT received Report" – satisfied (RATING 4 or 5) counts and data input counts, grouped by BUSINESS UNIT and PERSPECTIVE.
  // BU rows and Org level: % = (satisfied / data input count for that perspective) × 100. Do NOT use #Responded.
  const trendBuWisePerspectiveSatisfiedCounts = useMemo(() => {
    if (!trendAnalysisFiles?.length || !csatCycleStartDateFormatted) {
      return { byBu: {}, byBuDataInput: {}, org: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}), orgDataInput: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}) };
    }
    const file = trendAnalysisFiles[trendAnalysisFiles.length - 1];
    const sheetNamesToCheck = file.sheetNames || (file.sheets ? Object.keys(file.sheets) : []);
    let receivedSheetName = sheetNamesToCheck.find(s => {
      const sheetLower = String(s).toLowerCase().trim();
      return sheetLower.includes('csat received') && !sheetLower.includes('sent and received');
    });
    if (!receivedSheetName) receivedSheetName = sheetNamesToCheck.find(s => String(s).toLowerCase().trim() === 'sheet1' || String(s).toLowerCase().trim() === 'sheet 1');
    if (!receivedSheetName && sheetNamesToCheck.length >= 1) receivedSheetName = sheetNamesToCheck[0];
    if (!receivedSheetName || !file.sheets) {
      return { byBu: {}, byBuDataInput: {}, org: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}), orgDataInput: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}) };
    }
    let sheetData = file.sheets[receivedSheetName];
    if (!sheetData && file.sheets) {
      const exactKey = Object.keys(file.sheets).find(k => String(k).toLowerCase().trim() === String(receivedSheetName).toLowerCase().trim());
      if (exactKey) sheetData = file.sheets[exactKey];
    }
    if (!sheetData || !Array.isArray(sheetData) || sheetData.length === 0) {
      return { byBu: {}, byBuDataInput: {}, org: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}), orgDataInput: PERSPECTIVE_COLUMN_ORDER.reduce((acc, p) => ({ ...acc, [p]: 0 }), {}) };
    }

    const firstRow = sheetData[0] || {};
    const buCol = Object.keys(firstRow).find(k =>
      (String(k).toLowerCase().replace(/[\s_]/g, '') === 'businessunit') ||
      (String(k).toLowerCase() === 'business unit') ||
      (String(k).toLowerCase() === 'bussiness unit')
    ) || 'BUSINESS UNIT';
    const perspectiveCol = Object.keys(firstRow).find(k => k === 'PERSPECTIVE' || String(k).toLowerCase().includes('perspective')) || 'PERSPECTIVE';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });

    const byBu = {};
    const byBuDataInput = {};
    const org = {};
    const orgDataInput = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => { org[p] = 0; orgDataInput[p] = 0; });

    sheetData.forEach(row => {
      const buRaw = row[buCol] || row['BUSSINESS UNIT'] || row['Business Unit'] || '';
      if (!buRaw) return;
      const bu = normalizeBU(String(buRaw).trim()) || 'N/A';

      if (receivedDateKey && (row[receivedDateKey] != null && row[receivedDateKey] !== '')) {
        const d = parseExcelDateToMMDDYYYY(row[receivedDateKey]);
        if (d && !isDateGreaterThanOrEqual(d, csatCycleStartDateFormatted)) return;
      }

      const perspective = normalizePerspective(row[perspectiveCol]);
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!perspective || !PERSPECTIVE_COLUMN_ORDER.includes(perspective)) return;
      if (Number.isNaN(rating)) return;

      if (!byBu[bu]) { byBu[bu] = {}; byBuDataInput[bu] = {}; }
      byBuDataInput[bu][perspective] = (byBuDataInput[bu][perspective] || 0) + 1;
      orgDataInput[perspective] = (orgDataInput[perspective] || 0) + 1;
      if (rating === 4 || rating === 5) {
        byBu[bu][perspective] = (byBu[bu][perspective] || 0) + 1;
        org[perspective] = (org[perspective] || 0) + 1;
      }
    });

    return { byBu, byBuDataInput, org, orgDataInput };
  }, [trendAnalysisFiles, csatCycleStartDateFormatted, PERSPECTIVE_COLUMN_ORDER]);

  // Trend % satisfied by BU and by perspective: (count RATING 4 or 5 / count of data input for that perspective) × 100 per BU. Do NOT use #Responded for BU rows.
  const trendBuWisePerspectiveData = useMemo(() => {
    if (!trendBuWiseData.length) return {};
    const result = {};
    trendBuWiseData.forEach(r => {
      const bu = r.businessUnit;
      const countsByPerspective = trendBuWisePerspectiveSatisfiedCounts.byBu?.[bu] || {};
      const dataInputByPerspective = trendBuWisePerspectiveSatisfiedCounts.byBuDataInput?.[bu] || {};
      result[bu] = {};
      PERSPECTIVE_COLUMN_ORDER.forEach(p => {
        const satisfied = countsByPerspective[p] || 0;
        const dataInputCount = dataInputByPerspective[p] || 0;
        result[bu][p] = dataInputCount === 0 ? '-' : `${Math.round((satisfied / dataInputCount) * 100)}%`;
      });
    });
    return result;
  }, [trendBuWiseData, trendBuWisePerspectiveSatisfiedCounts, PERSPECTIVE_COLUMN_ORDER]);

  // Trend perspective % at Org level: (count RATING 4 or 5 for that perspective / count of data input for that perspective) × 100 from "CSAT received Report". Do NOT use #Responded.
  const trendOrgLevelPerspectives = useMemo(() => {
    if (!trendBuWiseData?.length) return {};
    const result = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => {
      const totalSatisfied = trendBuWisePerspectiveSatisfiedCounts.org?.[p] || 0;
      const dataInputCount = trendBuWisePerspectiveSatisfiedCounts.orgDataInput?.[p] || 0;
      result[p] = dataInputCount > 0 ? `${Math.round((totalSatisfied / dataInputCount) * 100)}%` : '-';
    });
    return result;
  }, [trendBuWiseData, trendBuWisePerspectiveSatisfiedCounts, PERSPECTIVE_COLUMN_ORDER]);

  // Trend perspective % for "Top 10 Accounts" row: from "CSAT received Report", TYPE OF ACCOUNT = "Top 10". (count RATING 4 or 5 / count of data input for that perspective) × 100. Do NOT use #Responded.
  const trendTop10SummaryPerspectives = useMemo(() => {
    const { top10Satisfied, top10DataInput } = trendTop10OtherOverallPerspectiveCounts;
    const result = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => {
      const dataInput = top10DataInput[p] || 0;
      const satisfied = top10Satisfied[p] || 0;
      result[p] = dataInput === 0 ? '-' : `${Math.round((satisfied / dataInput) * 100)}%`;
    });
    return result;
  }, [trendTop10OtherOverallPerspectiveCounts]);

  // Trend perspective % for "Overall" row: from "CSAT received Report", all rows (Top 10 + Other). (count RATING 4 or 5 / count of data input for that perspective) × 100. Do NOT use #Responded.
  const trendOverallPerspectivesTop10 = useMemo(() => {
    const { top10Satisfied, top10DataInput, otherSatisfied, otherDataInput } = trendTop10OtherOverallPerspectiveCounts;
    const result = {};
    PERSPECTIVE_COLUMN_ORDER.forEach(p => {
      const satisfied = (top10Satisfied[p] || 0) + (otherSatisfied[p] || 0);
      const dataInput = (top10DataInput[p] || 0) + (otherDataInput[p] || 0);
      result[p] = dataInput === 0 ? '-' : `${Math.round((satisfied / dataInput) * 100)}%`;
    });
    return result;
  }, [trendTop10OtherOverallPerspectiveCounts]);

  // Premier Healthcare Solutions Inc (L80) – Portfolio-wise % Satisfied (by Perspective): from "CSAT received Report", CUSTOMER NAME = "Premier Healthcare Solutions Inc (L80)", group by PORTFOLIO. Perspective % = (count of RATING 4 or 5 per perspective / count of data input for that perspective) × 100. Grand Total = sum(satisfied per perspective) / sum(data input per perspective). Do NOT use #Responded for perspective %. Responded from sheet 2 only for table column; date >= csatCycleStartDateFormatted (MM-DD-YYYY).
  const premierHealthcarePortfolioSatisfiedData = useMemo(() => {
    if (!uploadedData || uploadedData.length === 0) return { data: [], perspectives: [], grandTotal: null };
    const firstRow = uploadedData[0] || {};
    const customerNameKey = Object.keys(firstRow).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
    const portfolioKey = Object.keys(firstRow).find(k => /^portfolio$/i.test(String(k).trim())) || 'PORTFOLIO';
    const businessUnitCol = Object.prototype.hasOwnProperty.call(firstRow, 'BUSINESS UNIT') ? 'BUSINESS UNIT' : 'BUSSINESS UNIT';
    const perspectiveColumn = Object.keys(firstRow).find(key =>
      key === 'PERSPECTIVE' || key === 'Perspective' || key.toLowerCase().includes('perspective')
    ) || 'PERSPECTIVE';
    const receivedDateKey = Object.keys(firstRow).find(k => {
      const kk = String(k).toLowerCase();
      return kk.includes('csat received date') || kk.includes('css_received_date') || kk.includes('received date');
    });

    const PREMIER_HEALTHCARE_NAME = 'Premier Healthcare Solutions Inc (L80)';
    const filtered = uploadedData.filter(row => {
      const custName = (row[customerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
      if (custName !== PREMIER_HEALTHCARE_NAME) return false;
      const questionCategory = row['QUESTION_CATEGORY'] || row['Question Category'] || row['question_category'];
      if (questionCategory === 'Qualitative Feedback') return false;
      if (csatCycleStartDateFormatted && receivedDateKey) {
        const receivedVal = row[receivedDateKey] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
        if (receivedVal != null && String(receivedVal).trim() !== '' && !isDateOnOrAfterCsatStart(receivedVal)) return false;
      }
      return true;
    });

    if (filtered.length === 0) return { data: [], perspectives: [], grandTotal: null };

    const groups = new Map();
    const allPerspectives = new Set();
    filtered.forEach(row => {
      const portfolio = (row[portfolioKey] ?? row['PORTFOLIO'] ?? '').toString().trim() || 'N/A';
      const businessUnit = (row[businessUnitCol] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A').toString().trim() || 'N/A';
      const perspective = row[perspectiveColumn];
      const rating = parseFloat(row['RATING'] || row['Rating'] || row['rating']);
      if (!portfolio) return;
      if (!groups.has(portfolio)) {
        groups.set(portfolio, { portfolio, businessUnit, satisfied: {}, totals: {} });
      }
      const g = groups.get(portfolio);
      const normPerspective = perspective ? normalizePerspective(perspective) : null;
      if (normPerspective && !Number.isNaN(rating)) {
        allPerspectives.add(normPerspective);
        g.totals[normPerspective] = (g.totals[normPerspective] || 0) + 1;
        if (rating === 4 || rating === 5) {
          g.satisfied[normPerspective] = (g.satisfied[normPerspective] || 0) + 1;
        }
      }
    });

    // Responded from sheet 2 "CSAT sent and received Report": count(CSAT RECEIVED DATE) where date >= csatCycleStartDateFormatted, group by PORTFOLIO
    const secondSheetDataRaw = excelData?.secondSheetData && Array.isArray(excelData.secondSheetData) ? excelData.secondSheetData : [];
    const premierHealthcareCustomerId = filtered.length > 0 ? (filtered[0]['CUST_ID'] ?? filtered[0]['CUSTOMER_ID']) : null;
    const respondedByPortfolio = {};
    if (secondSheetDataRaw.length > 0 && csatCycleStartDateFormatted) {
      const secondFirst = secondSheetDataRaw[0] || {};
      const secondCustomerNameKey = Object.keys(secondFirst).find(k => /customer\s*name|cust_nm/i.test(String(k))) || 'CUSTOMER NAME';
      const secondPortfolioKey = Object.keys(secondFirst).find(k => /^portfolio$/i.test(String(k).trim()));
      const receivedDateKey2 = Object.keys(secondFirst).find(k => {
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
          const receivedVal = row[receivedDateKey2] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          if (receivedVal != null && String(receivedVal).trim() !== '' && isDateOnOrAfterCsatStart(receivedVal)) {
            respondedByPortfolio[portfolio] = (respondedByPortfolio[portfolio] || 0) + 1;
          }
        });
      } else {
        let totalResponded = 0;
        secondSheetDataRaw.forEach(row => {
          const custName = (row[secondCustomerNameKey] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? '').toString().trim();
          const custId = row['CUST_ID'] ?? row['CUSTOMER_ID'];
          const isPremierHealthcare = custName === PREMIER_HEALTHCARE_NAME || (premierHealthcareCustomerId && custId && String(custId).trim() === String(premierHealthcareCustomerId).trim());
          if (!isPremierHealthcare) return;

          const receivedVal = row[receivedDateKey2] ?? row['CSAT RECEIVED DATE'] ?? row['CSS_RECEIVED_DATE'];
          if (receivedVal != null && String(receivedVal).trim() !== '' && isDateOnOrAfterCsatStart(receivedVal)) totalResponded++;
        });
        groups.forEach((g, portfolio) => { respondedByPortfolio[portfolio] = totalResponded; });
      }
    }

    const perspectives = [
      ...PERSPECTIVE_COLUMN_ORDER.filter(p => allPerspectives.has(p)),
      ...Array.from(allPerspectives).filter(p => !PERSPECTIVE_COLUMN_ORDER.includes(p))
    ];
    const data = Array.from(groups.values())
      .map((g, idx) => {
        const row = { sNo: idx + 1, businessUnit: g.businessUnit, portfolio: g.portfolio || 'N/A' };
        perspectives.forEach(p => {
          const satisfied = g.satisfied[p] || 0;
          const dataInputCount = g.totals[p] || 0;
          row[p] = dataInputCount > 0 ? `${Math.round((satisfied / dataInputCount) * 100)}%` : '-';
        });
        return row;
      })
      .sort(sortByPortfolioOrder)
      .map((row, idx) => ({ ...row, sNo: idx + 1 }));

    const isHealthcareBU = (bu) => {
      if (!bu) return false;
      const s = String(bu).trim().toLowerCase().replace(/\s/g, '');
      return s === 'healthcare';
    };
    const healthcareGroups = Array.from(groups.values()).filter(g => isHealthcareBU(g.businessUnit));
    let grandTotal = null;
    if (healthcareGroups.length > 0) {
      const globalSatisfied = {};
      const globalDataInput = {};
      perspectives.forEach(p => { globalSatisfied[p] = 0; globalDataInput[p] = 0; });
      healthcareGroups.forEach(g => {
        perspectives.forEach(p => {
          globalSatisfied[p] += g.satisfied[p] || 0;
          globalDataInput[p] += g.totals[p] || 0;
        });
      });
      grandTotal = {
        sNo: '',
        businessUnit: 'Grand Total',
        portfolio: ''
      };
      perspectives.forEach(p => {
        const dataInputCount = globalDataInput[p] || 0;
        grandTotal[p] = dataInputCount > 0 ? `${Math.round((globalSatisfied[p] || 0) / dataInputCount * 100)}%` : '-';
      });
    }

    return { data, perspectives, grandTotal };
  }, [uploadedData, excelData, csatCycleStartDateFormatted]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    // If sorting by BUSINESS UNIT, use order: Healthcare, CIT, Tech, India & UK, Sead/SEAD
    if (sortConfig.key === 'BUSINESS UNIT' || sortConfig.key === 'BUSSINESS UNIT' || sortConfig.key === 'businessUnit') {
      const businessUnitKey = showBuWise ? 'BUSINESS UNIT' : 'businessUnit';
      const sorted = [...filteredData].sort((a, b) => {
        const aValue = a[businessUnitKey];
        const bValue = b[businessUnitKey];
        if (showBuWise && (aValue === 'Org level' || bValue === 'Org level' || a.isCountRow || b.isCountRow)) {
          if (a.isCountRow) return 1;
          if (b.isCountRow) return -1;
          if (aValue === 'Org level') return 1;
          if (bValue === 'Org level') return -1;
        }
        if (showTop10) {
          if (a.customerId === 'OVERALL_COUNT') return 1;
          if (b.customerId === 'OVERALL_COUNT') return -1;
          if (a.customerId === 'OVERALL') return 1;
          if (b.customerId === 'OVERALL') return -1;
          if (a.customerId === 'OTHER_COUNT') return 1;
          if (b.customerId === 'OTHER_COUNT') return -1;
          if (a.customerId === 'OTHER') return 1;
          if (b.customerId === 'OTHER') return -1;
          if (a.customerId === 'TOP10_COUNT') return 1;
          if (b.customerId === 'TOP10_COUNT') return -1;
          if (a.customerId === 'TOP10_TOTAL') return 1;
          if (b.customerId === 'TOP10_TOTAL') return -1;
        }
        const indexA = getBusinessUnitOrderIndex(aValue);
        const indexB = getBusinessUnitOrderIndex(bValue);
        if (indexA !== indexB) {
          return sortConfig.direction === 'asc' ? indexA - indexB : indexB - indexA;
        }
        return sortConfig.direction === 'asc' ? (aValue || '').localeCompare(bValue || '') : (bValue || '').localeCompare(aValue || '');
      });
      
      // Update Sr. No. after sorting (preserve empty for BU-wise Org level; Top 10: Top 10 Accounts, Other Accounts, Overall)
      return sorted.map((item, index) => ({
        ...item,
        sNo: (showBuWise && ((item['BUSINESS UNIT'] ?? item['BUSSINESS UNIT']) === 'Org level' || item.isCountRow)) || (showTop10 && ['TOP10_TOTAL', 'TOP10_COUNT', 'OTHER', 'OTHER_COUNT', 'OVERALL', 'OVERALL_COUNT'].includes(item.customerId)) ? '' : index + 1
      }));
    }

    // For other columns, sort normally but maintain Business Unit order as secondary sort
    const sorted = [...filteredData].sort((a, b) => {
      const businessUnitKey = showBuWise ? 'BUSINESS UNIT' : 'businessUnit';
      if (showBuWise && ((a[businessUnitKey] === 'Org level') || (b[businessUnitKey] === 'Org level') || a.isCountRow || b.isCountRow)) {
        if (a.isCountRow) return 1;
        if (b.isCountRow) return -1;
        if (a[businessUnitKey] === 'Org level') return 1;
        if (b[businessUnitKey] === 'Org level') return -1;
      }
      // Top 10 view: keep "Top 10 Accounts", count row, "Other Accounts", Other count row, "Overall", Overall count row at the end (in that order)
      if (showTop10) {
        if (a.customerId === 'OVERALL_COUNT') return 1;
        if (b.customerId === 'OVERALL_COUNT') return -1;
        if (a.customerId === 'OVERALL') return 1;
        if (b.customerId === 'OVERALL') return -1;
        if (a.customerId === 'OTHER_COUNT') return 1;
        if (b.customerId === 'OTHER_COUNT') return -1;
        if (a.customerId === 'OTHER') return 1;
        if (b.customerId === 'OTHER') return -1;
        if (a.customerId === 'TOP10_COUNT') return 1;
        if (b.customerId === 'TOP10_COUNT') return -1;
        if (a.customerId === 'TOP10_TOTAL') return 1;
        if (b.customerId === 'TOP10_TOTAL') return -1;
      }
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const result = sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        if (result !== 0) return result;
      } else {
        // Handle string values
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();

        if (aValue < bValue) {
          const result = sortConfig.direction === 'asc' ? -1 : 1;
          if (result !== 0) return result;
        }
        if (aValue > bValue) {
          const result = sortConfig.direction === 'asc' ? 1 : -1;
          if (result !== 0) return result;
        }
      }
      
      // If values are equal, maintain BUSINESS UNIT order (Healthcare, CIT, Tech, India & UK, Sead/SEAD)
      const indexA = getBusinessUnitOrderIndex(a[businessUnitKey]);
      const indexB = getBusinessUnitOrderIndex(b[businessUnitKey]);
      if (indexA !== indexB) return indexA - indexB;
      return (a[businessUnitKey] || '').localeCompare(b[businessUnitKey] || '');
    });
    
    // Update Sr. No. after sorting (preserve empty for BU-wise Org level; Top 10: Top 10 Accounts, count row, Other Accounts, Other count row, Overall, Overall count row)
    return sorted.map((item, index) => ({
      ...item,
      sNo: (showBuWise && ((item['BUSINESS UNIT'] ?? item['BUSSINESS UNIT']) === 'Org level' || item.isCountRow)) || (showTop10 && ['TOP10_TOTAL', 'TOP10_COUNT', 'OTHER', 'OTHER_COUNT', 'OVERALL', 'OVERALL_COUNT'].includes(item.customerId)) ? '' : index + 1
    }));
  }, [filteredData, sortConfig, showBuWise, showTop10]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  // Account-wise: always show all data (single view). BU-wise/Top10: use scrollable or paginated
  const isAccountWise = !showBuWise && !showTop10;
  const showAllData = isAccountWise || showScrollable;
  const currentData = showAllData
    ? sortedData.map((item, index) => ({
        ...item,
        sNo: item.sNo === '' ? '' : index + 1
      }))
    : sortedData.slice(startIndex, endIndex).map((item, index) => ({
        ...item,
        sNo: item.sNo === '' ? '' : startIndex + index + 1
      }));

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  };

  const handleDownloadTrendAnalysisTop10Table = async () => {
    if (!trendTop10Data || trendTop10Data.length === 0) {
      alert('No trend analysis data for Top 10 to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const trendSheet = workbook.addWorksheet('Trend_Analysis_Top10_Accounts', { pageSetup: { fitToPage: true } });
      const trendHeaders = ['Account Name', 'Business Unit', '#Polled', '#Responded', ...PERSPECTIVE_COLUMN_ORDER.map(p => `${p} (%)`)];
      trendSheet.addRow(trendHeaders);
      const trendHeaderRow = trendSheet.getRow(1);
      trendHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      trendHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      trendHeaderRow.eachCell((c, colNumber) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
      });
      trendTop10Data.forEach(row => {
        const key = `${row.accountName}|${row.businessUnit}`;
        const trendByRow = trendTop10PerspectiveData[key] || {};
        const rowData = [row.accountName, normalizeBusinessUnitDisplay(row.businessUnit), row.polled, row.responded, ...PERSPECTIVE_COLUMN_ORDER.map(p => trendByRow[p] ?? '-')];
        const dataRow = trendSheet.addRow(rowData);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
          const val = trendByRow[p];
          if (val == null || val === '-') return;
          const percentage = parseFloat(String(val).replace('%', ''));
          if (isNaN(percentage)) return;
          const cell = dataRow.getCell(5 + i);
          if (percentage < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (percentage >= 75 && percentage < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
      });
      const applyPercentStyle = (dataRow, startCol) => {
        PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
          const val = dataRow.getCell(startCol + i).value;
          if (val == null || val === '-') return;
          const percentage = parseFloat(String(val).replace('%', ''));
          if (isNaN(percentage)) return;
          const cell = dataRow.getCell(startCol + i);
          if (percentage < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (percentage >= 75 && percentage < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
      };
      let dataRowNum = trendTop10Data.length + 2;
      if (trendTop10Data.length > 0) {
        const totalPolled = trendTop10Data.reduce((s, r) => s + (r.polled || 0), 0);
        const totalResponded = trendTop10Data.reduce((s, r) => s + (r.responded || 0), 0);
        const perspectivePcts = PERSPECTIVE_COLUMN_ORDER.map(p => trendTop10SummaryPerspectives[p] ?? '-');
        const top10TotalRow = trendSheet.addRow(['Top 10 Accounts', '', totalPolled, totalResponded, ...perspectivePcts]);
        top10TotalRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.font = { bold: true };
        });
        top10TotalRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        top10TotalRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        top10TotalRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        top10TotalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
        applyPercentStyle(top10TotalRow, 5);
        dataRowNum++;
      }
      if (trendOtherData && (trendOtherData.polled > 0 || trendOtherData.responded > 0)) {
        const otherPcts = trendOtherPerspectiveData
          ? PERSPECTIVE_COLUMN_ORDER.map(p => trendOtherPerspectiveData[p] ?? '-')
          : PERSPECTIVE_COLUMN_ORDER.map(() => '-');
        const otherRow = trendSheet.addRow(['Other Accounts', '', trendOtherData.polled, trendOtherData.responded, ...otherPcts]);
        otherRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.font = { bold: true };
        });
        otherRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        otherRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        otherRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        otherRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFBDD7EE' } };
        applyPercentStyle(otherRow, 5);
        dataRowNum++;
      }
      const top10Polled = trendTop10Data.reduce((s, r) => s + (r.polled || 0), 0);
      const top10Responded = trendTop10Data.reduce((s, r) => s + (r.responded || 0), 0);
      const otherPolled = trendOtherData?.polled || 0;
      const otherResponded = trendOtherData?.responded || 0;
      const totalPolled = top10Polled + otherPolled;
      const totalResponded = top10Responded + otherResponded;
      if (totalPolled > 0 || totalResponded > 0) {
        const overallPcts = PERSPECTIVE_COLUMN_ORDER.map(p => trendOverallPerspectivesTop10[p] ?? '-');
        const overallRow = trendSheet.addRow(['Overall', '', totalPolled, totalResponded, ...overallPcts]);
        overallRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.font = { bold: true };
        });
        overallRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
        overallRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
        overallRow.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
        overallRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
        applyPercentStyle(overallRow, 5);
        dataRowNum++;
      }
      const legendStart = dataRowNum + 2;
      trendSheet.getRow(legendStart).getCell(1).value = 'Legend:';
      trendSheet.getRow(legendStart).getCell(1).font = { bold: true };
      trendSheet.getRow(legendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      trendSheet.getRow(legendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      trendSheet.getRow(legendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      trendSheet.getRow(legendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      trendSheet.getRow(legendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      trendSheet.getRow(legendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      trendSheet.getRow(legendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      trendSheet.getRow(legendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      trendSheet.getRow(legendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      trendSheet.getColumn(1).width = 28;
      trendSheet.getColumn(2).width = 22;
      trendSheet.getColumn(3).width = 12;
      trendSheet.getColumn(4).width = 12;
      PERSPECTIVE_COLUMN_ORDER.forEach((_, i) => { trendSheet.getColumn(5 + i).width = 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Trend_Analysis_Top10_Accounts_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download trend analysis (Top 10)');
    }
  };

  const handleDownloadTrendAnalysisTable = async () => {
    if (!trendBuWiseData || trendBuWiseData.length === 0) {
      alert('No trend analysis data to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const trendSheet = workbook.addWorksheet('Trend_Analysis_BU_Wise', { pageSetup: { fitToPage: true } });
      const trendHeaders = ['Business Unit', '#Polled', '#Responded', ...PERSPECTIVE_COLUMN_ORDER];
      trendSheet.addRow(trendHeaders);
      const trendHeaderRow = trendSheet.getRow(1);
      trendHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      trendHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      trendHeaderRow.eachCell((c, colNumber) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
      });
      trendBuWiseData.forEach(row => {
        const trendByBu = trendBuWisePerspectiveData[row.businessUnit] || {};
        const rowData = [normalizeBusinessUnitDisplay(row.businessUnit), row.polled, row.responded, ...PERSPECTIVE_COLUMN_ORDER.map(p => trendByBu[p] ?? '-')];
        const dataRow = trendSheet.addRow(rowData);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
          const val = trendByBu[p];
          if (val == null || val === '-') return;
          const percentage = parseFloat(String(val).replace('%', ''));
          if (isNaN(percentage)) return;
          const cell = dataRow.getCell(4 + i);
          if (percentage < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (percentage >= 75 && percentage < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
      });
      const totalPolled = trendBuWiseData.reduce((s, r) => s + (r.polled || 0), 0);
      const totalResponded = trendBuWiseData.reduce((s, r) => s + (r.responded || 0), 0);
      const orgPerspectives = PERSPECTIVE_COLUMN_ORDER.map(p => trendOrgLevelPerspectives[p] ?? '-');
      const orgRow = trendSheet.addRow(['Org level', totalPolled, totalResponded, ...orgPerspectives]);
      orgRow.eachCell((c, colNumber) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        c.font = { bold: true, color: { argb: 'FF000000' } };
        if (colNumber <= 3) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      });
      PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
        const val = orgPerspectives[i];
        if (val == null || val === '-') return;
        const percentage = parseFloat(String(val).replace('%', ''));
        if (isNaN(percentage)) return;
        const cell = orgRow.getCell(4 + i);
        if (percentage < 75) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (percentage >= 75 && percentage < 90) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        }
      });
      const legendStart = trendBuWiseData.length + 3;
      trendSheet.getRow(legendStart).getCell(1).value = 'Legend:';
      trendSheet.getRow(legendStart).getCell(1).font = { bold: true };
      trendSheet.getRow(legendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      trendSheet.getRow(legendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      trendSheet.getRow(legendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      trendSheet.getRow(legendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      trendSheet.getRow(legendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      trendSheet.getRow(legendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      trendSheet.getRow(legendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      trendSheet.getRow(legendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      trendSheet.getRow(legendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      trendSheet.getColumn(1).width = 22;
      trendSheet.getColumn(2).width = 12;
      trendSheet.getColumn(3).width = 12;
      PERSPECTIVE_COLUMN_ORDER.forEach((_, i) => { trendSheet.getColumn(4 + i).width = 18; });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Trend_Analysis_BU_Wise_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download trend analysis');
    }
  };

  const handleDownloadTrendAnalysisAccountWiseH1Reference = async () => {
    const rows = trendAccountWiseH1Reference?.rows || [];
    if (!rows.length) {
      alert('No trend analysis (H1 reference) data to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Trend_Analysis_H1_Reference', { pageSetup: { fitToPage: true } });

      const perspectives = (trendAccountWiseH1Reference?.perspectives || PERSPECTIVE_COLUMN_ORDER) || [];
      const headers = ['Account Name', 'Business Unit', '#Polled', '#Responded', ...perspectives.map(p => `${p} (%)`)];
      sheet.addRow(headers);

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((c, colNumber) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
      });

      const applyPercentStyle = (excelRow, startColIdx) => {
        perspectives.forEach((_, i) => {
          const cell = excelRow.getCell(startColIdx + i);
          const val = cell.value;
          if (val == null || val === '-' || val === '－') return;
          const pct = parseFloat(String(val).replace('%', ''));
          if (Number.isNaN(pct)) return;
          if (pct < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (pct >= 75 && pct < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
      };

      rows.forEach(r => {
        const rowData = [
          r.accountName ?? 'N/A',
          normalizeBusinessUnitDisplay(r.businessUnit ?? ''),
          r.polled ?? 0,
          r.responded ?? 0,
          ...perspectives.map(p => (r?.perspectives?.[p] ?? '-'))
        ];
        const dataRow = sheet.addRow(rowData);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber <= 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        applyPercentStyle(dataRow, 5);
      });

      sheet.getColumn(1).width = 34;
      sheet.getColumn(2).width = 22;
      sheet.getColumn(3).width = 12;
      sheet.getColumn(4).width = 12;
      perspectives.forEach((_, i) => { sheet.getColumn(5 + i).width = 18; });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Trend_Analysis_H1_Reference_${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to download trend analysis (H1 reference)');
    }
  };

  const handleDownload = async () => {
    if (showPracticeWise) {
      await handleDownloadPracticeWise();
      return;
    }
    if (!sortedData || sortedData.length === 0) {
      alert('No data to download');
      return;
    }

    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      let sheetName;
      if (showBuWise) {
        sheetName = 'BU_Wise_Satisfied_Customers';
      } else if (showTop10) {
        sheetName = 'Top_10_Account_Satisfied_Customers';
      } else {
        sheetName = 'Customer_Wise_Satisfied_Customers';
      }
      const worksheet = workbook.addWorksheet(sheetName);
      
      // Create ordered headers array with Sr. No. first (exclude customerId from export)
      const firstRow = sortedData[0];
      const rawHeaders = ['sNo', ...Object.keys(firstRow).filter(key => 
        key !== 'sNo' && key !== 'customerId' && key !== 'nonStaffingCount' && key !== 'staffingCount'
      )];
      
      // Map raw column names to display names for Excel headers: Account Name, Business Unit, #Polled, #Responded
      const headerMapping = {
        'sNo': 'Sr. No.',
        'customerName': 'Account Name',
        'businessUnit': 'Business Unit',
        'BUSINESS UNIT': 'Business Unit',
        'BUSSINESS UNIT': 'Business Unit',
        'customerId': 'CUSTOMER_ID',
        'CUST_ID': 'CUSTOMER_ID',
        'CUSTOMER_ID': 'CUSTOMER_ID',
        'CUSTOMER NAME': 'Account Name',
        'CUST_NM': 'Account Name',
        'cssSentCount': '#Polled',
        'cssReceivedCount': '#Responded',
        'Polled': '#Polled',
        'Responded': '#Responded',
        'top10': 'Top10 Accounts',
        'Top 10': 'Top10 Accounts',
        'TYPE OF ACCOUNT': 'Top10 Accounts',
        'ENGAGEMENT TYPE': 'ENGAGEMENT TYPE',
        'Project Engagement Type': 'ENGAGEMENT TYPE'
      };
      
      // Create display headers for Excel
      const headers = rawHeaders.map(header => headerMapping[header] || header);
      const PERCENTAGE_COLUMNS = [
        'Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness',
        'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment',
        'Resource Competency'
      ];

      if (showBuWise) {
        // BU wise: two-row header with merged "H2 2025" and optionally "Trend analysis (H2 Vs H1)" (when showTrendAnalysis)
        const h2ColSpan = rawHeaders.length - 2; // #Polled, #Responded, and all perspective columns
        const trendColCount = showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.length : 0;
        const row1Values = [
          'Sr. No.',
          'Business Unit',
          (acsatCycle || 'H2 2025'),
          ...Array(h2ColSpan - 1).fill(''),
          ...(showTrendAnalysis ? [trendHeaderLabel] : [])
        ];
        worksheet.addRow(row1Values);
        if (h2ColSpan > 1) {
          worksheet.mergeCells(1, 3, 1, 3 + h2ColSpan - 1);
        }
        if (showTrendAnalysis && trendColCount >= 1) {
          const trendStartCol = 3 + h2ColSpan;
          worksheet.mergeCells(1, trendStartCol, 1, trendStartCol + trendColCount - 1);
        }
        const row2Values = ['', '', ...rawHeaders.slice(2).map(h => headerMapping[h] || (PERCENTAGE_COLUMNS.includes(h) ? `${h} (%)` : h)), ...(showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.map(p => p) : [])];
        worksheet.addRow(row2Values);
        [1, 2].forEach(rowNum => {
          const headerRow = worksheet.getRow(rowNum);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          headerRow.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
        });
      } else if (showTop10) {
        // Top 10: two-row header with merged "H2 2025" over #Polled, #Responded, and perspective columns; optionally "Trend analysis (H2 Vs H1)" when showTrendAnalysis
        const h2ColSpanTop10 = rawHeaders.length - 3; // sNo, customerName, businessUnit then #Polled, #Responded, perspectives
        const trendColCountTop10 = showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.length : 0;
        const row1ValuesTop10 = [
          'Sr. No.',
          'Account Name',
          'Business Unit',
          (acsatCycle || 'H2 2025'),
          ...Array(h2ColSpanTop10 - 1).fill(''),
          ...(showTrendAnalysis ? [trendHeaderLabel] : [])
        ];
        worksheet.addRow(row1ValuesTop10);
        if (h2ColSpanTop10 > 1) {
          worksheet.mergeCells(1, 4, 1, 4 + h2ColSpanTop10 - 1);
        }
        if (showTrendAnalysis && trendColCountTop10 >= 1) {
          const trendStartColTop10 = 4 + h2ColSpanTop10;
          worksheet.mergeCells(1, trendStartColTop10, 1, trendStartColTop10 + trendColCountTop10 - 1);
        }
        const row2ValuesTop10 = ['', '', '', ...rawHeaders.slice(3).map(h => headerMapping[h] || (PERCENTAGE_COLUMNS.includes(h) ? `${h} (%)` : h)), ...(showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.map(p => p) : [])];
        worksheet.addRow(row2ValuesTop10);
        [1, 2].forEach(rowNum => {
          const headerRow = worksheet.getRow(rowNum);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
          headerRow.eachCell((cell) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
        });
      } else {
        if (showTrendAnalysis) {
          // Account-wise: two-row header with merged "H2 2025" and "Trend analysis (H2 Vs H1)"
          const h2ColSpanAccount = rawHeaders.length - 3; // after sNo, customerName, businessUnit
          const trendColCountAccount = PERSPECTIVE_COLUMN_ORDER.length;
          const row1ValuesAccount = [
            'Sr. No.',
            'Account Name',
            'Business Unit',
            (acsatCycle || 'H2 2025'),
            ...Array(h2ColSpanAccount - 1).fill(''),
            trendHeaderLabel,
            ...Array(trendColCountAccount - 1).fill('')
          ];
          worksheet.addRow(row1ValuesAccount);
          if (h2ColSpanAccount > 1) {
            worksheet.mergeCells(1, 4, 1, 4 + h2ColSpanAccount - 1);
          }
          if (trendColCountAccount >= 1) {
            const trendStartColAccount = 4 + h2ColSpanAccount;
            worksheet.mergeCells(1, trendStartColAccount, 1, trendStartColAccount + trendColCountAccount - 1);
          }
          const row2ValuesAccount = [
            '',
            '',
            '',
            ...rawHeaders.slice(3).map(h => headerMapping[h] || (PERCENTAGE_COLUMNS.includes(h) ? `${h} (%)` : h)),
            ...PERSPECTIVE_COLUMN_ORDER.map(p => getTrendPerspectiveHeaderLabel(p))
          ];
          worksheet.addRow(row2ValuesAccount);
          [1, 2].forEach(rowNum => {
            const headerRow = worksheet.getRow(rowNum);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
            headerRow.eachCell((cell) => {
              cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
              cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            });
          });
        } else {
          // Add headers (single row) – Account-wise
          worksheet.addRow(headers);
          const headerRow = worksheet.getRow(1);
          headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A8A' }
          };
          headerRow.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          });
        }
      }
      
      // Top 10 summary row fill colors (Excel theme: Light Cornflower Blue 3, Light Yellow 2, Light Purple 3) - no legend applied
      const top10RowFillArgbs = { OTHER: 'FFBDD7EE', TOP10_TOTAL: 'FFFFF2CC', OVERALL: 'FFE4DFEC' };

      // Trend at Org level: (count RATING 4 or 5 / count of data input per perspective) × 100 — use same values as trendOrgLevelPerspectives
      const excelTrendOrgLevel = (showBuWise && showTrendAnalysis && trendBuWiseData?.length && trendOrgLevelPerspectives && Object.keys(trendOrgLevelPerspectives).length > 0) ? trendOrgLevelPerspectives : null;

      // Add data rows with color coding for percentage columns
      sortedData.forEach((row, index) => {
        const isCountRow = (showBuWise && row.isCountRow) || (showTop10 && (row.isTop10CountRow || row.isOtherCountRow || row.isOverallCountRow));
        const hyphenRow = !isCountRow && !(showTop10 && (row.customerId === 'OTHER' || row.customerId === 'OTHER_COUNT' || row.customerId === 'TOP10_TOTAL' || row.customerId === 'TOP10_COUNT' || row.customerId === 'OVERALL' || row.customerId === 'OVERALL_COUNT')) && !(showBuWise && (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) === 'Org level') && isSeadAndPolledZero(row);
        const rowWithCorrectSNo = {
          ...row,
          sNo: row.sNo === '' ? '' : index + 1,
          businessUnit: row.businessUnit != null ? normalizeBusinessUnitDisplay(row.businessUnit) : row.businessUnit,
          'BUSINESS UNIT': row['BUSINESS UNIT'] != null ? normalizeBusinessUnitDisplay(row['BUSINESS UNIT']) : row['BUSINESS UNIT']
        };
        let orderedRowData = hyphenRow
          ? rawHeaders.map(() => '-')
          : rawHeaders.map(rawHeader => rowWithCorrectSNo[rawHeader]);
        if (!showBuWise && !showTop10 && showTrendAnalysis) {
          if (isCountRow) {
            orderedRowData = [...orderedRowData, ...PERSPECTIVE_COLUMN_ORDER.map(() => '')];
          } else {
            const buKeyExcel = normalizeBusinessUnitDisplay(rowWithCorrectSNo.businessUnit ?? '').toString().trim().toLowerCase();
            const idKeyExcel = normalizeCustomerIdKey(rowWithCorrectSNo.customerId);
            const nameKeyExcel = normalizeAccountNameKey(rowWithCorrectSNo.customerName || '');
            const accountWiseTrendRowExcel =
              (idKeyExcel ? trendAccountWiseLookup[`id|||${idKeyExcel}|||${buKeyExcel}`] : null) ||
              (nameKeyExcel ? trendAccountWiseLookup[`name|||${nameKeyExcel}|||${buKeyExcel}`] : null) ||
              ((!buKeyExcel && nameKeyExcel) ? trendAccountWiseLookup[`nameOnly|||${nameKeyExcel}`] : null);

            const trendRow = PERSPECTIVE_COLUMN_ORDER.map(p => {
              if (!accountWiseTrendRowExcel) return '-';
              const currentParsed = parsePercentForTrend(rowWithCorrectSNo[p]);
              const trendParsed = accountWiseTrendRowExcel?.perspectives ? parsePercentForTrend(accountWiseTrendRowExcel.perspectives[p]) : null;
              const currentNum = (currentParsed == null ? 0 : currentParsed);
              const trendNum = (trendParsed == null ? 0 : trendParsed);
              const diff = Math.round(currentNum - trendNum);
              const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
              const arrow = diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : '';
              return diffStr + arrow;
            });
            orderedRowData = [...orderedRowData, ...trendRow];
          }
        }

        if (showBuWise && showTrendAnalysis && trendBuWisePerspectiveData) {
          if (isCountRow) {
            orderedRowData = [...orderedRowData, ...PERSPECTIVE_COLUMN_ORDER.map(() => '')];
          } else {
          const buKeyRaw = rowWithCorrectSNo['BUSINESS UNIT'] ?? rowWithCorrectSNo['BUSSINESS UNIT'] ?? rowWithCorrectSNo.businessUnit;
          const isOrgLevelRow = buKeyRaw === 'Org level';
          const buKeyForLookup = isOrgLevelRow ? buKeyRaw : (normalizeBU(buKeyRaw) || buKeyRaw);
          const trendByBu = isOrgLevelRow && excelTrendOrgLevel ? excelTrendOrgLevel : (trendBuWisePerspectiveData[buKeyForLookup] || trendBuWisePerspectiveData[buKeyRaw] || {});
          const trendRow = PERSPECTIVE_COLUMN_ORDER.map(p => {
            const currentNum = parsePercentForTrend(rowWithCorrectSNo[p]);
            const trendNum = parsePercentForTrend(trendByBu[p]);
            if (currentNum == null || trendNum == null) return '-';
            const diff = Math.round(currentNum - trendNum);
            const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
            const arrow = diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : '';
            return diffStr + arrow;
          });
          orderedRowData = [...orderedRowData, ...trendRow];
          }
        }
        if (showTop10 && showTrendAnalysis && (trendTop10PerspectiveData || trendTop10SummaryPerspectives || trendOverallPerspectivesTop10 || trendOtherPerspectiveData)) {
          if (isCountRow) {
            orderedRowData = [...orderedRowData, ...PERSPECTIVE_COLUMN_ORDER.map(() => '')];
          } else {
            let trendByRow = {};
            if (row.customerId === 'TOP10_TOTAL' && trendTop10SummaryPerspectives) trendByRow = trendTop10SummaryPerspectives;
            else if (row.customerId === 'OVERALL' && trendOverallPerspectivesTop10) trendByRow = trendOverallPerspectivesTop10;
            else if (row.customerId === 'OTHER' && trendOtherPerspectiveData) trendByRow = trendOtherPerspectiveData;
            else {
              const buPart = rowWithCorrectSNo.businessUnit ?? rowWithCorrectSNo['BUSINESS UNIT'] ?? rowWithCorrectSNo['BUSSINESS UNIT'] ?? '';
              const top10Key = `${rowWithCorrectSNo.customerName}|${normalizeBU(buPart) || buPart}`;
              trendByRow = trendTop10PerspectiveData?.[top10Key] || trendTop10PerspectiveData?.[`${rowWithCorrectSNo.customerName}|${buPart}`] || {};
            }
            const trendRow = PERSPECTIVE_COLUMN_ORDER.map(p => {
              const currentNum = parsePercentForTrend(rowWithCorrectSNo[p]);
              const trendNum = parsePercentForTrend(trendByRow[p]);
              if (currentNum == null || trendNum == null) return '-';
              const diff = Math.round(currentNum - trendNum);
              const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
              const arrow = diff > 0 ? ' ↑' : diff < 0 ? ' ↓' : '';
              return diffStr + arrow;
            });
            orderedRowData = [...orderedRowData, ...trendRow];
          }
        }
        const dataRow = worksheet.addRow(orderedRowData);
        const isTop10SummaryRow = showTop10 && (row.customerId === 'OTHER' || row.customerId === 'TOP10_TOTAL' || row.customerId === 'OVERALL');
        const summaryRowFillArgB = isTop10SummaryRow ? top10RowFillArgbs[row.customerId] : null;

        const countRowFillArgB = isCountRow ? 'FFDBEAFE' : null;
        dataRow.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          if (summaryRowFillArgB) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: summaryRowFillArgB } };
          } else if (countRowFillArgB) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: countRowFillArgB } };
            cell.font = { bold: true, color: { argb: 'FF1E3A8A' } };
          }
          const rawHeader = rawHeaders[colNumber - 1];
          const isTextLeft = rawHeader && ['customerName', 'businessUnit', 'BUSINESS UNIT', 'BUSSINESS UNIT'].includes(rawHeader);
          const isCountRowResponded = isCountRow && rawHeader === 'cssReceivedCount';
          cell.alignment = { horizontal: isCountRowResponded ? 'right' : (isTextLeft ? 'left' : 'center'), vertical: 'middle', wrapText: true };
        });

        if (summaryRowFillArgB) {
          rawHeaders.forEach((rawHeader, colIndex) => {
            const cell = dataRow.getCell(colIndex + 1);
            if (typeof rowWithCorrectSNo[rawHeader] === 'number' || !isNaN(parseFloat(rowWithCorrectSNo[rawHeader]))) {
              cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
          });
        }

        if (hyphenRow) return;
        if (isCountRow) return; // Count row: no percentage legend or trend styling

        // Apply legend color coding to percentage columns (including Org level, Top 10 Accounts, Other Accounts, Overall)
        rawHeaders.forEach((rawHeader, colIndex) => {
          const isPercentageColumn = [
            'Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 
            'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 
            'Resource Competency'
          ].includes(rawHeader) || rawHeader.includes('%') || rawHeader.includes('Percentage');

          if (isPercentageColumn) {
            const percentageValue = rowWithCorrectSNo[rawHeader];
            const percentage = parseFloat(percentageValue.toString().replace('%', ''));
            const cell = dataRow.getCell(colIndex + 1);

            if (!isNaN(percentage)) {
              if (percentage < 75) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } }; // Red (Excel)
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              } else if (percentage >= 75 && percentage < 90) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } }; // Amber/Orange (same as ACSAT)
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else if (percentage >= 90) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } }; // Green (close to Excel Green 11)
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              }
              cell.alignment = { horizontal: 'center' };
            }
          } else {
            const cell = dataRow.getCell(colIndex + 1);
            if (typeof rowWithCorrectSNo[rawHeader] === 'number' || !isNaN(parseFloat(rowWithCorrectSNo[rawHeader]))) {
              cell.alignment = { horizontal: 'center' };
            }
          }
        });

        // Trend columns: green for increase (↑), red for decrease (↓). Use org-level trend for Org level row.
        if (!hyphenRow && !showBuWise && !showTop10 && showTrendAnalysis) {
          const buKeyExcel = normalizeBusinessUnitDisplay(rowWithCorrectSNo.businessUnit ?? '').toString().trim().toLowerCase();
          const idKeyExcel = normalizeCustomerIdKey(rowWithCorrectSNo.customerId);
          const nameKeyExcel = normalizeAccountNameKey(rowWithCorrectSNo.customerName || '');
          const accountWiseTrendRowExcel =
            (idKeyExcel ? trendAccountWiseLookup[`id|||${idKeyExcel}|||${buKeyExcel}`] : null) ||
            (nameKeyExcel ? trendAccountWiseLookup[`name|||${nameKeyExcel}|||${buKeyExcel}`] : null) ||
            ((!buKeyExcel && nameKeyExcel) ? trendAccountWiseLookup[`nameOnly|||${nameKeyExcel}`] : null);
          PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
            if (!accountWiseTrendRowExcel) return;
            const currentParsed = parsePercentForTrend(rowWithCorrectSNo[p]);
            const trendParsed = accountWiseTrendRowExcel?.perspectives ? parsePercentForTrend(accountWiseTrendRowExcel.perspectives[p]) : null;
            const currentNum = (currentParsed == null ? 0 : currentParsed);
            const trendNum = (trendParsed == null ? 0 : trendParsed);
            const diff = Math.round(currentNum - trendNum);
            const cell = dataRow.getCell(rawHeaders.length + i + 1);
            if (diff > 0) {
              cell.font = { color: { argb: 'FF15803d' }, bold: true }; // green
            } else if (diff < 0) {
              cell.font = { color: { argb: 'FFdc2626' }, bold: true }; // red
            }
            cell.alignment = { horizontal: 'center' };
          });
        }
        if (!hyphenRow && showBuWise && showTrendAnalysis && trendBuWisePerspectiveData) {
          const buKeyRaw = rowWithCorrectSNo['BUSINESS UNIT'] ?? rowWithCorrectSNo['BUSSINESS UNIT'] ?? rowWithCorrectSNo.businessUnit;
          const isOrgLevelRow = buKeyRaw === 'Org level';
          const buKeyForLookup = isOrgLevelRow ? buKeyRaw : (normalizeBU(buKeyRaw) || buKeyRaw);
          const trendByBu = isOrgLevelRow && excelTrendOrgLevel ? excelTrendOrgLevel : (trendBuWisePerspectiveData[buKeyForLookup] || trendBuWisePerspectiveData[buKeyRaw] || {});
          PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
            const currentNum = parsePercentForTrend(rowWithCorrectSNo[p]);
            const trendNum = parsePercentForTrend(trendByBu[p]);
            if (currentNum == null || trendNum == null) return;
            const diff = Math.round(currentNum - trendNum);
            const cell = dataRow.getCell(rawHeaders.length + i + 1);
            if (diff > 0) {
              cell.font = { color: { argb: 'FF15803d' }, bold: true }; // green
            } else if (diff < 0) {
              cell.font = { color: { argb: 'FFdc2626' }, bold: true }; // red
            }
            cell.alignment = { horizontal: 'center' };
          });
        }
        if (!hyphenRow && showTop10 && showTrendAnalysis && (trendTop10PerspectiveData || trendTop10SummaryPerspectives || trendOverallPerspectivesTop10 || trendOtherPerspectiveData)) {
          let trendByRowExcel = {};
          if (row.customerId === 'TOP10_TOTAL' && trendTop10SummaryPerspectives) trendByRowExcel = trendTop10SummaryPerspectives;
          else if (row.customerId === 'OVERALL' && trendOverallPerspectivesTop10) trendByRowExcel = trendOverallPerspectivesTop10;
          else if (row.customerId === 'OTHER' && trendOtherPerspectiveData) trendByRowExcel = trendOtherPerspectiveData;
          else {
            const buPartExcel = rowWithCorrectSNo.businessUnit ?? rowWithCorrectSNo['BUSINESS UNIT'] ?? rowWithCorrectSNo['BUSSINESS UNIT'] ?? '';
            const top10KeyExcel = `${rowWithCorrectSNo.customerName}|${normalizeBU(buPartExcel) || buPartExcel}`;
            trendByRowExcel = trendTop10PerspectiveData?.[top10KeyExcel] || trendTop10PerspectiveData?.[`${rowWithCorrectSNo.customerName}|${buPartExcel}`] || {};
          }
          PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
            const currentNum = parsePercentForTrend(rowWithCorrectSNo[p]);
            const trendNum = parsePercentForTrend(trendByRowExcel[p]);
            if (currentNum == null || trendNum == null) return;
            const diff = Math.round(currentNum - trendNum);
            const cell = dataRow.getCell(rawHeaders.length + i + 1);
            if (diff > 0) {
              cell.font = { color: { argb: 'FF15803d' }, bold: true }; // green
            } else if (diff < 0) {
              cell.font = { color: { argb: 'FFdc2626' }, bold: true }; // red
            }
            cell.alignment = { horizontal: 'center' };
          });
        }
      });
      
      // Add legend rows. When the sheet uses a 2-row header (BU-wise, Top10, or Account-wise with Trend Analysis),
      // data starts after 2 header rows, so the legend needs to start 1 row lower.
      const hasTwoRowHeader = showBuWise || showTop10 || (!showBuWise && !showTop10 && showTrendAnalysis);
      const legendStartRow = hasTwoRowHeader ? sortedData.length + 4 : sortedData.length + 3;
      
      // Add legend title
      const legendTitleRow = worksheet.addRow(['Legend:']);
      legendTitleRow.getCell(1).font = { bold: true, size: 12 };
      
      // Add legend items (Red = Excel, Amber = same as ACSAT: Org & BU Level Average CSAT Scores, Green = close to Excel Green 11)
      const legendRow1 = worksheet.addRow(['Red: <75%']);
      const legendRow2 = worksheet.addRow(['Amber: 75% to 90%']);
      const legendRow3 = worksheet.addRow(['Green: >=90%']);
      
      const redCell = legendRow1.getCell(1);
      redCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      redCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      
      const amberCell = legendRow2.getCell(1);
      amberCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      amberCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      const greenCell = legendRow3.getCell(1);
      greenCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      greenCell.font = { color: { argb: 'FF000000' }, bold: true };
      
      // Set column widths
      headers.forEach((header, index) => {
        if (header === 'Sr. No.') {
          worksheet.getColumn(index + 1).width = 10; // Sr. No. column
        } else if (header === 'Account Name' || header === 'Business Unit' || header === 'ENGAGEMENT TYPE') {
          worksheet.getColumn(index + 1).width = 20;
        } else if (header.includes('%') || header.includes('Percentage')) {
          worksheet.getColumn(index + 1).width = 18;
        } else {
          worksheet.getColumn(index + 1).width = 15;
        }
      });
      if ((showBuWise || showTop10) && showTrendAnalysis) {
        PERSPECTIVE_COLUMN_ORDER.forEach((_, i) => {
          worksheet.getColumn(rawHeaders.length + i + 1).width = 18;
        });
      }

      // Trend Analysis – from uploaded trend file: "CSAT sent and received Report" (#Polled, #Responded) and "CSAT received Report" (perspective %), group by BUSINESS UNIT
      if (showBuWise && showTrendAnalysis && trendBuWiseData.length > 0) {
        const trendSheet = workbook.addWorksheet('Trend_Analysis_BU_Wise', { pageSetup: { fitToPage: true } });
        const trendHeaders = ['Business Unit', '#Polled', '#Responded', ...PERSPECTIVE_COLUMN_ORDER];
        trendSheet.addRow(trendHeaders);
        const trendHeaderRow = trendSheet.getRow(1);
        trendHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        trendHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        trendHeaderRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        trendBuWiseData.forEach(row => {
          const trendByBu = trendBuWisePerspectiveData[row.businessUnit] || {};
          const rowData = [normalizeBusinessUnitDisplay(row.businessUnit), row.polled, row.responded, ...PERSPECTIVE_COLUMN_ORDER.map(p => trendByBu[p] ?? '-')];
          const dataRow = trendSheet.addRow(rowData);
          dataRow.eachCell((c, colNumber) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          });
          PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
            const val = trendByBu[p];
            if (val == null || val === '-') return;
            const percentage = parseFloat(String(val).replace('%', ''));
            if (isNaN(percentage)) return;
            const cell = dataRow.getCell(4 + i);
            if (percentage < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (percentage >= 75 && percentage < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          });
        });
        const totalPolled = trendBuWiseData.reduce((s, r) => s + (r.polled || 0), 0);
        const totalResponded = trendBuWiseData.reduce((s, r) => s + (r.responded || 0), 0);
        const orgPerspectives = PERSPECTIVE_COLUMN_ORDER.map(p => trendOrgLevelPerspectives[p] ?? '-');
        const orgRow = trendSheet.addRow(['Org level', totalPolled, totalResponded, ...orgPerspectives]);
        orgRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 1 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          c.font = { bold: true, color: { argb: 'FF000000' } };
          if (colNumber <= 3) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        });
        PERSPECTIVE_COLUMN_ORDER.forEach((p, i) => {
          const val = orgPerspectives[i];
          if (val == null || val === '-') return;
          const percentage = parseFloat(String(val).replace('%', ''));
          if (isNaN(percentage)) return;
          const cell = orgRow.getCell(4 + i);
          if (percentage < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (percentage >= 75 && percentage < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
        const trendLegendStart = trendBuWiseData.length + 3;
        trendSheet.getRow(trendLegendStart).getCell(1).value = 'Legend:';
        trendSheet.getRow(trendLegendStart).getCell(1).font = { bold: true };
        trendSheet.getRow(trendLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
        trendSheet.getRow(trendLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        trendSheet.getRow(trendLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        trendSheet.getRow(trendLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
        trendSheet.getRow(trendLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        trendSheet.getRow(trendLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
        trendSheet.getRow(trendLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
        trendSheet.getRow(trendLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        trendSheet.getRow(trendLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
        trendSheet.getColumn(1).width = 22;
        trendSheet.getColumn(2).width = 12;
        trendSheet.getColumn(3).width = 12;
        PERSPECTIVE_COLUMN_ORDER.forEach((_, i) => { trendSheet.getColumn(4 + i).width = 18; });
      }

      // Fully Managed – BU Wise % Satisfied: second sheet when in BU-wise view (Polled/Responded from sheet 2, date >= CSAT cycle start)
      if (showBuWise && fullyManagedBuWiseData && fullyManagedBuWiseData.length > 0) {
        const fmSheet = workbook.addWorksheet('Fully_Managed_BU_Wise', { pageSetup: { fitToPage: true } });
        const fmHeaders = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...FULLY_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
        fmSheet.addRow(fmHeaders);
        const fmHeaderRow = fmSheet.getRow(1);
        fmHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        fmHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        fmHeaderRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        fullyManagedBuWiseData.forEach(row => {
          const hyphenRow = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) !== 'Org level' && isSeadAndPolledZero(row);
          const rowData = hyphenRow
            ? fmHeaders.map(() => '-')
            : [row.sNo, normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']), row.Polled ?? 0, row.Responded ?? 0, ...FULLY_MANAGED_PERSPECTIVES.map(p => row[p] || '0%')];
          const dataRow = fmSheet.addRow(rowData);
          dataRow.eachCell((c, colNumber) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          });
          const isOrgLevelRow = row['BUSINESS UNIT'] === 'Org level';
          if (isOrgLevelRow) {
            dataRow.eachCell((c, colNumber) => {
              if (colNumber <= 4) {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
              }
              c.font = { bold: true, color: { argb: 'FF000000' } };
            });
            FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
          } else if (!hyphenRow) {
            FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
          }
        });
        fmSheet.getColumn(1).width = 10;
        fmSheet.getColumn(2).width = 20;
        fmSheet.getColumn(3).width = 12;
        fmSheet.getColumn(4).width = 12;
        FULLY_MANAGED_PERSPECTIVES.forEach((_, i) => { fmSheet.getColumn(i + 5).width = 18; });
        const fmLegendStart = fullyManagedBuWiseData.length + 3;
        fmSheet.getRow(fmLegendStart).getCell(1).value = 'Legend:';
        fmSheet.getRow(fmLegendStart).getCell(1).font = { bold: true };
        fmSheet.getRow(fmLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
        fmSheet.getRow(fmLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        fmSheet.getRow(fmLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        fmSheet.getRow(fmLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
        fmSheet.getRow(fmLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        fmSheet.getRow(fmLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
        fmSheet.getRow(fmLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
        fmSheet.getRow(fmLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        fmSheet.getRow(fmLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      }
      if (showBuWise && coManagedBuWiseData && coManagedBuWiseData.length > 0) {
        const cmSheet = workbook.addWorksheet('Co_Managed_BU_Wise', { pageSetup: { fitToPage: true } });
        const cmHeaders = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...CO_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
        cmSheet.addRow(cmHeaders);
        const cmHeaderRow = cmSheet.getRow(1);
        cmHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cmHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cmHeaderRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        coManagedBuWiseData.forEach(row => {
          const hyphenRowCM = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) !== 'Org level' && isSeadAndPolledZero(row);
          const rowDataCM = hyphenRowCM ? cmHeaders.map(() => '-') : [row.sNo, normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']), row.Polled ?? 0, row.Responded ?? 0, ...CO_MANAGED_PERSPECTIVES.map(p => row[p] || '0%')];
          const dataRow = cmSheet.addRow(rowDataCM);
          dataRow.eachCell((c, colNumber) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
          });
          const isOrgLevelRowCM = row['BUSINESS UNIT'] === 'Org level';
          if (isOrgLevelRowCM) {
            dataRow.eachCell((c, colNumber) => {
              if (colNumber <= 4) {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
              }
              c.font = { bold: true, color: { argb: 'FF000000' } };
            });
            CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
          } else if (!hyphenRowCM) {
            CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
              }
            });
          }
        });
        cmSheet.getColumn(1).width = 10;
        cmSheet.getColumn(2).width = 20;
        cmSheet.getColumn(3).width = 12;
        cmSheet.getColumn(4).width = 12;
        CO_MANAGED_PERSPECTIVES.forEach((_, i) => { cmSheet.getColumn(i + 5).width = 18; });
        const cmLegendStart = coManagedBuWiseData.length + 3;
        cmSheet.getRow(cmLegendStart).getCell(1).value = 'Legend:';
        cmSheet.getRow(cmLegendStart).getCell(1).font = { bold: true };
        cmSheet.getRow(cmLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
        cmSheet.getRow(cmLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        cmSheet.getRow(cmLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cmSheet.getRow(cmLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
        cmSheet.getRow(cmLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        cmSheet.getRow(cmLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
        cmSheet.getRow(cmLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
        cmSheet.getRow(cmLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        cmSheet.getRow(cmLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      }
      if (showBuWise && staffAugmentationBuWiseData && staffAugmentationBuWiseData.length > 0) {
        const saSheet = workbook.addWorksheet('Staff_Augmentation_BU_Wise', { pageSetup: { fitToPage: true } });
        const saHeaders = ['Sr. No.', 'BUSINESS UNIT', '#Polled', '#Responded', ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => `${p} (%)`)];
        saSheet.addRow(saHeaders);
        const saHeaderRow = saSheet.getRow(1);
        saHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        saHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        saHeaderRow.eachCell((c) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: 'center' };
        });
        staffAugmentationBuWiseData.forEach(row => {
          const dataRow = saSheet.addRow([row.sNo, (row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])), row.Polled ?? 0, row.Responded ?? 0, ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
          dataRow.eachCell((c, colNumber) => {
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center' };
          });
          const isOrgLevelRowSA = row['BUSINESS UNIT'] === 'Org level';
          if (isOrgLevelRowSA) {
            dataRow.eachCell((c, colNumber) => {
              if (colNumber <= 4) {
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
              }
              c.font = { bold: true, color: { argb: 'FF000000' } };
            });
            STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            });
          } else {
            STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
              const cell = dataRow.getCell(colIndex + 5);
              const val = (row[p] || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            });
          }
        });
        saSheet.getColumn(1).width = 10;
        saSheet.getColumn(2).width = 20;
        saSheet.getColumn(3).width = 12;
        saSheet.getColumn(4).width = 12;
        STAFF_AUGMENTATION_PERSPECTIVES.forEach((_, i) => { saSheet.getColumn(i + 5).width = 18; });
        const saLegendStart = staffAugmentationBuWiseData.length + 3;
        saSheet.getRow(saLegendStart).getCell(1).value = 'Legend:';
        saSheet.getRow(saLegendStart).getCell(1).font = { bold: true };
        saSheet.getRow(saLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
        saSheet.getRow(saLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
        saSheet.getRow(saLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        saSheet.getRow(saLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
        saSheet.getRow(saLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        saSheet.getRow(saLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
        saSheet.getRow(saLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
        saSheet.getRow(saLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
        saSheet.getRow(saLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      }

      // Generate and download the file with name according to current view (Account Wise, Top 10 Accounts, or BU Wise)
      const viewSuffix = showBuWise ? 'BU_Wise' : (showTop10 ? 'Top10_Accounts' : 'Account_Wise');
      const downloadFileName = `Account_BU_Wise_Satisfied_Customers_Each_Perspective_${viewSuffix}.xlsx`;
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Data exported successfully with color coding');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadFullyManaged = async () => {
    if (!fullyManagedBuWiseData || fullyManagedBuWiseData.length === 0) {
      alert('No Fully Managed data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const fmSheet = workbook.addWorksheet('Fully_Managed_BU_Wise', { pageSetup: { fitToPage: true } });
      const fmHeaders = ['Sr. No.', 'Business Unit', '#Polled', '#Responded', ...FULLY_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
      fmSheet.addRow(fmHeaders);
      const fmHeaderRow = fmSheet.getRow(1);
      fmHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      fmHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      fmHeaderRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      });
      fullyManagedBuWiseData.forEach(row => {
        const hyphenRow = (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) !== 'Org level' && isSeadAndPolledZero(row);
        const rowData = hyphenRow ? fmHeaders.map(() => '-') : [row.sNo, (row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])), row.Polled ?? 0, row.Responded ?? 0, ...FULLY_MANAGED_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')];
        const dataRow = fmSheet.addRow(rowData);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle', wrapText: true };
        });
        const isOrgLevelRow = row['BUSINESS UNIT'] === 'Org level';
        if (isOrgLevelRow) {
          dataRow.eachCell((c, colNumber) => {
            if (colNumber <= 4) {
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            }
            c.font = { bold: true, color: { argb: 'FF000000' } };
          });
          FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        } else {
          FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        }
      });
      fmSheet.getColumn(1).width = 10;
      fmSheet.getColumn(2).width = 20;
      fmSheet.getColumn(3).width = 12;
      fmSheet.getColumn(4).width = 12;
      FULLY_MANAGED_PERSPECTIVES.forEach((_, i) => { fmSheet.getColumn(i + 5).width = 18; });
      const fmLegendStart = fullyManagedBuWiseData.length + 3;
      fmSheet.getRow(fmLegendStart).getCell(1).value = 'Legend:';
      fmSheet.getRow(fmLegendStart).getCell(1).font = { bold: true };
      fmSheet.getRow(fmLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      fmSheet.getRow(fmLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      fmSheet.getRow(fmLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      fmSheet.getRow(fmLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      fmSheet.getRow(fmLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      fmSheet.getRow(fmLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      fmSheet.getRow(fmLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      fmSheet.getRow(fmLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      fmSheet.getRow(fmLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Fully_Managed_BU_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Fully Managed data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadCoManaged = async () => {
    if (!coManagedBuWiseData || coManagedBuWiseData.length === 0) {
      alert('No Co-Managed data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const cmSheet = workbook.addWorksheet('Co_Managed_BU_Wise', { pageSetup: { fitToPage: true } });
      const cmHeaders = ['Sr. No.', 'BUSINESS UNIT', '#Polled', '#Responded', ...CO_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
      cmSheet.addRow(cmHeaders);
      const cmHeaderRow = cmSheet.getRow(1);
      cmHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cmHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cmHeaderRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      coManagedBuWiseData.forEach(row => {
        const dataRow = cmSheet.addRow([row.sNo, (row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])), row.Polled ?? 0, row.Responded ?? 0, ...CO_MANAGED_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        });
        const isOrgLevelRowCM = row['BUSINESS UNIT'] === 'Org level';
        if (isOrgLevelRowCM) {
          dataRow.eachCell((c, colNumber) => {
            if (colNumber <= 4) {
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            }
            c.font = { bold: true, color: { argb: 'FF000000' } };
          });
          CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        } else {
          CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        }
      });
      cmSheet.getColumn(1).width = 10;
      cmSheet.getColumn(2).width = 20;
      cmSheet.getColumn(3).width = 12;
      cmSheet.getColumn(4).width = 12;
      CO_MANAGED_PERSPECTIVES.forEach((_, i) => { cmSheet.getColumn(i + 5).width = 18; });
      const cmLegendStart = coManagedBuWiseData.length + 3;
      cmSheet.getRow(cmLegendStart).getCell(1).value = 'Legend:';
      cmSheet.getRow(cmLegendStart).getCell(1).font = { bold: true };
      cmSheet.getRow(cmLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      cmSheet.getRow(cmLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      cmSheet.getRow(cmLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cmSheet.getRow(cmLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      cmSheet.getRow(cmLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      cmSheet.getRow(cmLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      cmSheet.getRow(cmLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      cmSheet.getRow(cmLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      cmSheet.getRow(cmLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Co_Managed_BU_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Co-Managed data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadStaffAugmentation = async () => {
    if (!staffAugmentationBuWiseData || staffAugmentationBuWiseData.length === 0) {
      alert('No Staff Augmentation data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const saSheet = workbook.addWorksheet('Staff_Augmentation_BU_Wise', { pageSetup: { fitToPage: true } });
      const saHeaders = ['Sr. No.', 'BUSINESS UNIT', '#Polled', '#Responded', ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => `${p} (%)`)];
      saSheet.addRow(saHeaders);
      const saHeaderRow = saSheet.getRow(1);
      saHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      saHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      saHeaderRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      staffAugmentationBuWiseData.forEach(row => {
        const dataRow = saSheet.addRow([row.sNo, (row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])), row.Polled ?? 0, row.Responded ?? 0, ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 ? 'left' : 'center', vertical: 'middle' };
        });
        const isOrgLevelRowSA = row['BUSINESS UNIT'] === 'Org level';
        if (isOrgLevelRowSA) {
          dataRow.eachCell((c, colNumber) => {
            if (colNumber <= 4) {
              c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
            }
            c.font = { bold: true, color: { argb: 'FF000000' } };
          });
          STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        } else {
          STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
            const cell = dataRow.getCell(colIndex + 5);
            const raw = row[p];
            if (raw === '-') {
              cell.value = '-';
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
              cell.font = { color: { argb: 'FF6B7280' } };
              cell.alignment = { horizontal: 'center' };
            } else {
              const val = (raw || '0%').toString().replace('%', '');
              const num = parseFloat(val);
              if (!isNaN(num)) {
                if (num < 75) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                  cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
                } else if (num >= 75 && num < 90) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                } else {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                  cell.font = { color: { argb: 'FF000000' }, bold: true };
                }
                cell.alignment = { horizontal: 'center' };
              }
            }
          });
        }
      });
      saSheet.getColumn(1).width = 10;
      saSheet.getColumn(2).width = 20;
      saSheet.getColumn(3).width = 12;
      saSheet.getColumn(4).width = 12;
      STAFF_AUGMENTATION_PERSPECTIVES.forEach((_, i) => { saSheet.getColumn(i + 5).width = 18; });
      const saLegendStart = staffAugmentationBuWiseData.length + 3;
      saSheet.getRow(saLegendStart).getCell(1).value = 'Legend:';
      saSheet.getRow(saLegendStart).getCell(1).font = { bold: true };
      saSheet.getRow(saLegendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      saSheet.getRow(saLegendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      saSheet.getRow(saLegendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      saSheet.getRow(saLegendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      saSheet.getRow(saLegendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      saSheet.getRow(saLegendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      saSheet.getRow(saLegendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      saSheet.getRow(saLegendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      saSheet.getRow(saLegendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Staff_Augmentation_BU_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Staff Augmentation data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadFullyManagedAccountWise = async () => {
    if (!fullyManagedAccountWiseData || fullyManagedAccountWiseData.length === 0) {
      alert('No Fully Managed Account Wise data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Fully_Managed_Account_Wise', { pageSetup: { fitToPage: true } });
      const headers = ['Sr. No.', 'Account Name', 'BUSINESS UNIT', '#Polled', '#Responded', ...FULLY_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
      sheet.addRow(headers);
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      fullyManagedAccountWiseData.forEach(row => {
        const dataRow = sheet.addRow([row.sNo, row['Account Name'], normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']), row.Polled ?? 0, row.Responded ?? 0, ...FULLY_MANAGED_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = dataRow.getCell(colIndex + 6);
          const raw = row[p];
          if (raw === '-') {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
            cell.alignment = { horizontal: 'center' };
          } else {
            const val = (raw || '0%').toString().replace('%', '');
            const num = parseFloat(val);
            if (!isNaN(num)) {
              if (num < 75) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              } else if (num >= 75 && num < 90) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              }
              cell.alignment = { horizontal: 'center' };
            }
          }
        });
      });
      if (grandTotalFullyManagedAccountWise) {
        const gtRow = sheet.addRow(['', 'Grand Total', '', grandTotalFullyManagedAccountWise.totalPolled, grandTotalFullyManagedAccountWise.totalResponded, ...FULLY_MANAGED_PERSPECTIVES.map(p => grandTotalFullyManagedAccountWise.perspectiveValues[p] || '-')]);
        gtRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.font = { bold: true, color: { argb: 'FF000000' } };
          if (colNumber <= 5) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        FULLY_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = gtRow.getCell(colIndex + 6);
          const val = (grandTotalFullyManagedAccountWise.perspectiveValues[p] || '-').toString().replace('%', '');
          const num = parseFloat(val);
          if (val !== '-' && !isNaN(num)) {
            if (num < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (num >= 75 && num < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
      }
      sheet.getColumn(1).width = 10;
      sheet.getColumn(2).width = 28;
      sheet.getColumn(3).width = 20;
      sheet.getColumn(4).width = 12;
      sheet.getColumn(5).width = 12;
      FULLY_MANAGED_PERSPECTIVES.forEach((_, i) => { sheet.getColumn(i + 6).width = 18; });
      const legendStart = fullyManagedAccountWiseData.length + (grandTotalFullyManagedAccountWise ? 3 : 2);
      sheet.getRow(legendStart).getCell(1).value = 'Legend:';
      sheet.getRow(legendStart).getCell(1).font = { bold: true };
      sheet.getRow(legendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      sheet.getRow(legendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      sheet.getRow(legendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      sheet.getRow(legendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      sheet.getRow(legendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      sheet.getRow(legendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      sheet.getRow(legendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      sheet.getRow(legendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      sheet.getRow(legendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Fully_Managed_Account_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Fully Managed Account Wise data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadCoManagedAccountWise = async () => {
    if (!coManagedAccountWiseData || coManagedAccountWiseData.length === 0) {
      alert('No Co-Managed Account Wise data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Co_Managed_Account_Wise', { pageSetup: { fitToPage: true } });
      const headers = ['Sr. No.', 'Account Name', 'BUSINESS UNIT', '#Polled', '#Responded', ...CO_MANAGED_PERSPECTIVES.map(p => `${p} (%)`)];
      sheet.addRow(headers);
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      coManagedAccountWiseData.forEach(row => {
        const dataRow = sheet.addRow([row.sNo, row['Account Name'], normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']), row.Polled ?? 0, row.Responded ?? 0, ...CO_MANAGED_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = dataRow.getCell(colIndex + 6);
          const raw = row[p];
          if (raw === '-') {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
            cell.alignment = { horizontal: 'center' };
          } else {
            const val = (raw || '0%').toString().replace('%', '');
            const num = parseFloat(val);
            if (!isNaN(num)) {
              if (num < 75) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              } else if (num >= 75 && num < 90) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              }
              cell.alignment = { horizontal: 'center' };
            }
          }
        });
      });
      if (grandTotalCoManagedAccountWise) {
        const gtRow = sheet.addRow(['', 'Grand Total', '', grandTotalCoManagedAccountWise.totalPolled, grandTotalCoManagedAccountWise.totalResponded, ...CO_MANAGED_PERSPECTIVES.map(p => grandTotalCoManagedAccountWise.perspectiveValues[p] || '-')]);
        gtRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.font = { bold: true, color: { argb: 'FF000000' } };
          if (colNumber <= 5) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        CO_MANAGED_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = gtRow.getCell(colIndex + 6);
          const val = (grandTotalCoManagedAccountWise.perspectiveValues[p] || '-').toString().replace('%', '');
          const num = parseFloat(val);
          if (val !== '-' && !isNaN(num)) {
            if (num < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (num >= 75 && num < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
      }
      sheet.getColumn(1).width = 10;
      sheet.getColumn(2).width = 28;
      sheet.getColumn(3).width = 20;
      sheet.getColumn(4).width = 12;
      sheet.getColumn(5).width = 12;
      CO_MANAGED_PERSPECTIVES.forEach((_, i) => { sheet.getColumn(i + 6).width = 18; });
      const legendStart = coManagedAccountWiseData.length + (grandTotalCoManagedAccountWise ? 3 : 2);
      sheet.getRow(legendStart).getCell(1).value = 'Legend:';
      sheet.getRow(legendStart).getCell(1).font = { bold: true };
      sheet.getRow(legendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      sheet.getRow(legendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      sheet.getRow(legendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      sheet.getRow(legendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      sheet.getRow(legendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      sheet.getRow(legendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      sheet.getRow(legendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      sheet.getRow(legendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      sheet.getRow(legendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Co_Managed_Account_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Co-Managed Account Wise data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleDownloadStaffAugmentationAccountWise = async () => {
    if (!staffAugmentationAccountWiseData || staffAugmentationAccountWiseData.length === 0) {
      alert('No Staff Augmentation Account Wise data to download.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Staff_Augmentation_Account_Wise', { pageSetup: { fitToPage: true } });
      const headers = ['Sr. No.', 'Account Name', 'BUSINESS UNIT', '#Polled', '#Responded', ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => `${p} (%)`)];
      sheet.addRow(headers);
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((c) => {
        c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        c.alignment = { horizontal: 'center', vertical: 'middle' };
      });
      staffAugmentationAccountWiseData.forEach(row => {
        const dataRow = sheet.addRow([row.sNo, row['Account Name'], normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']), row.Polled ?? 0, row.Responded ?? 0, ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => formatPerspectiveValue(row[p]) || '0%')]);
        dataRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = dataRow.getCell(colIndex + 6);
          const raw = row[p];
          if (raw === '-') {
            cell.value = '-';
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' } };
            cell.alignment = { horizontal: 'center' };
          } else {
            const val = (raw || '0%').toString().replace('%', '');
            const num = parseFloat(val);
            if (!isNaN(num)) {
              if (num < 75) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
                cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
              } else if (num >= 75 && num < 90) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
                cell.font = { color: { argb: 'FF000000' }, bold: true };
              }
              cell.alignment = { horizontal: 'center' };
            }
          }
        });
      });
      if (grandTotalStaffAugmentationAccountWise) {
        const gtRow = sheet.addRow(['', 'Grand Total', '', grandTotalStaffAugmentationAccountWise.totalPolled, grandTotalStaffAugmentationAccountWise.totalResponded, ...STAFF_AUGMENTATION_PERSPECTIVES.map(p => grandTotalStaffAugmentationAccountWise.perspectiveValues[p] || '-')]);
        gtRow.eachCell((c, colNumber) => {
          c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          c.font = { bold: true, color: { argb: 'FF000000' } };
          if (colNumber <= 5) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
          c.alignment = { horizontal: colNumber === 2 || colNumber === 3 ? 'left' : 'center', vertical: 'middle' };
        });
        STAFF_AUGMENTATION_PERSPECTIVES.forEach((p, colIndex) => {
          const cell = gtRow.getCell(colIndex + 6);
          const val = (grandTotalStaffAugmentationAccountWise.perspectiveValues[p] || '-').toString().replace('%', '');
          const num = parseFloat(val);
          if (val !== '-' && !isNaN(num)) {
            if (num < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (num >= 75 && num < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
      }
      sheet.getColumn(1).width = 10;
      sheet.getColumn(2).width = 28;
      sheet.getColumn(3).width = 20;
      sheet.getColumn(4).width = 12;
      sheet.getColumn(5).width = 12;
      STAFF_AUGMENTATION_PERSPECTIVES.forEach((_, i) => { sheet.getColumn(i + 6).width = 18; });
      const legendStart = staffAugmentationAccountWiseData.length + (grandTotalStaffAugmentationAccountWise ? 3 : 2);
      sheet.getRow(legendStart).getCell(1).value = 'Legend:';
      sheet.getRow(legendStart).getCell(1).font = { bold: true };
      sheet.getRow(legendStart + 1).getCell(1).value = '<75% (Red - White Text)';
      sheet.getRow(legendStart + 1).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
      sheet.getRow(legendStart + 1).getCell(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
      sheet.getRow(legendStart + 2).getCell(1).value = '75% to 90% (Amber - Black Text)';
      sheet.getRow(legendStart + 2).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
      sheet.getRow(legendStart + 2).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      sheet.getRow(legendStart + 3).getCell(1).value = '>=90% (Green - Black Text)';
      sheet.getRow(legendStart + 3).getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
      sheet.getRow(legendStart + 3).getCell(1).font = { color: { argb: 'FF000000' }, bold: true };
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Staff_Augmentation_Account_Wise_Satisfied_Customers_By_Perspective.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Staff Augmentation Account Wise data:', error);
      alert(`Error exporting: ${error.message}. Please try again.`);
    }
  };

  const handleBuWiseClick = () => {
    setShowBuWise(true);
    setShowTop10(false);
    setShowScrollable(false);
    setCurrentPage(1);
    setCustomerNameSearch('');
    setBusinessUnitFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleTop10Click = () => {
    setShowBuWise(false);
    setShowTop10(true);
    setShowScrollable(false);
    setCurrentPage(1);
    setCustomerNameSearch('');
    setBusinessUnitFilter('');
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleShowAccountWiseClick = () => {
    setShowBuWise(false);
    setShowTop10(false);
    setShowScrollable(true); // Account-wise: single view, all data (scrollable)
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handlePracticeWiseClick = () => {
    setShowPracticeWise(true);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleBackToAccountBuDashboard = () => {
    setShowPracticeWise(false);
    setCurrentPage(1);
    setSortConfig({ key: null, direction: 'asc' });
  };

  const handleDownloadPracticeWise = async () => {
    const rows = practiceWiseData.rows || [];
    if (!rows.length) {
      alert('No practice-wise data available to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise % Satisfied');
      const pList = PRACTICE_PERSPECTIVE_ORDER;
      const trendByPractice = practiceWiseTrendByPractice;
      const stylePracticeHeaderRow = (rowNum) => {
        const headerRow = worksheet.getRow(rowNum);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        headerRow.eachCell((cell) => {
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
      };
      let perspectiveColStart = 5;
      if (showTrendAnalysis) {
        const h2ColSpan = 2 + pList.length;
        worksheet.addRow([
          'Sr. No.',
          'Practice',
          (acsatCycle || 'H2 2025'),
          ...Array(h2ColSpan - 1).fill(''),
          trendHeaderLabel,
          ...Array(pList.length - 1).fill('')
        ]);
        if (h2ColSpan > 1) {
          worksheet.mergeCells(1, 3, 1, 3 + h2ColSpan - 1);
        }
        const trendStartCol = 3 + h2ColSpan;
        worksheet.mergeCells(1, trendStartCol, 1, trendStartCol + pList.length - 1);
        worksheet.addRow([
          '',
          '',
          '#Polled',
          '#Responded',
          ...pList.map(p => `${p} (%)`),
          ...pList.map(p => getTrendPerspectiveHeaderLabel(p))
        ]);
        stylePracticeHeaderRow(1);
        stylePracticeHeaderRow(2);
      } else {
        const headers = ['Sr. No.', 'Practice', '#Polled', '#Responded', ...pList.map(p => `${p} (%)`)];
        worksheet.addRow(headers);
        stylePracticeHeaderRow(1);
      }
      rows.forEach((row) => {
        const practiceKey = String(row.practice || '').trim();
        const trendRow = trendByPractice[practiceKey];
        const perspectiveValues = pList.map(p => formatPerspectiveValue(row[p] ?? '-'));
        const trendValues = showTrendAnalysis
          ? pList.map(p => formatPracticeTrendDiff(row[p], trendRow?.[p]).text)
          : [];
        const dataRow = worksheet.addRow([
          row.sNo,
          row.practice,
          row.Polled ?? 0,
          row.Responded ?? 0,
          ...perspectiveValues,
          ...trendValues
        ]);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        pList.forEach((p, idx) => {
          const val = perspectiveValues[idx];
          const cell = dataRow.getCell(idx + perspectiveColStart);
          cell.value = val;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          const numericValue = parseFloat(String(val).replace('%', ''));
          if (val === '-' || val === '－' || Number.isNaN(numericValue)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else if (numericValue < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (numericValue >= 75 && numericValue < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (numericValue >= 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
        if (showTrendAnalysis) {
          pList.forEach((p, idx) => {
            const { text, color } = formatPracticeTrendDiff(row[p], trendRow?.[p]);
            const cell = dataRow.getCell(perspectiveColStart + pList.length + idx);
            cell.value = text;
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            const argb = color === '#15803d' ? 'FF15803D' : color === '#dc2626' ? 'FFDC2626' : 'FF6B7280';
            cell.font = { color: { argb }, bold: true };
          });
        }
      });
      if (practiceWiseData.orgLevelRow) {
        const orgRow = practiceWiseData.orgLevelRow;
        const trendOrgRow = practiceWiseTrendData.orgLevelRow;
        const perspectiveValues = pList.map(p => formatPerspectiveValue(orgRow[p] ?? '-'));
        const trendValues = showTrendAnalysis
          ? pList.map(p => formatPracticeTrendDiff(orgRow[p], trendOrgRow?.[p]).text)
          : [];
        const dataRow = worksheet.addRow([
          orgRow.sNo ?? '',
          orgRow.practice,
          orgRow.Polled ?? 0,
          orgRow.Responded ?? 0,
          ...perspectiveValues,
          ...trendValues
        ]);
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          cell.font = { ...(cell.font || {}), bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        pList.forEach((p, idx) => {
          const val = perspectiveValues[idx];
          const cell = dataRow.getCell(idx + perspectiveColStart);
          const numericValue = parseFloat(String(val).replace('%', ''));
          if (!(val === '-' || val === '－' || Number.isNaN(numericValue))) {
            if (numericValue < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (numericValue >= 75 && numericValue < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (numericValue >= 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            }
          }
        });
        if (showTrendAnalysis) {
          pList.forEach((p, idx) => {
            const { text, color } = formatPracticeTrendDiff(orgRow[p], trendOrgRow?.[p]);
            const cell = dataRow.getCell(perspectiveColStart + pList.length + idx);
            cell.value = text;
            const argb = color === '#15803d' ? 'FF15803D' : color === '#dc2626' ? 'FFDC2626' : 'FF6B7280';
            cell.font = { color: { argb }, bold: true };
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
      a.download = `Practice_wise_Percentage_Satisfied_Customers_Each_Perspective_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise satisfied customers Excel export error:', err);
      alert('Failed to export practice-wise data to Excel.');
    }
  };

  const handleDownloadPracticeWiseTrendAnalysis = async () => {
    const rows = practiceWiseTrendData.rows || [];
    if (!rows.length) {
      alert('No practice-wise trend analysis data available to download');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Practice wise % Satisfied (Trend)');
      const pList = PRACTICE_PERSPECTIVE_ORDER;
      const headers = ['Sr. No.', 'Practice', '#Polled', '#Responded', ...pList.map(p => `${p} (%)`)];
      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      headerRow.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      rows.forEach((row) => {
        const perspectiveValues = pList.map(p => formatPerspectiveValue(row[p] ?? '-'));
        const dataRow = worksheet.addRow([
          row.sNo,
          row.practice,
          row.Polled ?? 0,
          row.Responded ?? 0,
          ...perspectiveValues
        ]);
        dataRow.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        dataRow.getCell(3).alignment = { horizontal: 'center', vertical: 'middle' };
        dataRow.getCell(4).alignment = { horizontal: 'center', vertical: 'middle' };
        pList.forEach((p, idx) => {
          const val = perspectiveValues[idx];
          const cell = dataRow.getCell(idx + 5);
          cell.value = val;
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
          const numericValue = parseFloat(String(val).replace('%', ''));
          if (val === '-' || val === '－' || Number.isNaN(numericValue)) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
            cell.font = { color: { argb: 'FF6B7280' }, bold: true };
          } else if (numericValue < 75) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
          } else if (numericValue >= 75 && numericValue < 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          } else if (numericValue >= 90) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
            cell.font = { color: { argb: 'FF000000' }, bold: true };
          }
        });
      });
      if (practiceWiseTrendData.orgLevelRow) {
        const orgRow = practiceWiseTrendData.orgLevelRow;
        const perspectiveValues = pList.map(p => formatPerspectiveValue(orgRow[p] ?? '-'));
        const dataRow = worksheet.addRow([
          orgRow.sNo ?? '',
          orgRow.practice,
          orgRow.Polled ?? 0,
          orgRow.Responded ?? 0,
          ...perspectiveValues
        ]);
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
          cell.font = { ...(cell.font || {}), bold: true };
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        dataRow.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        pList.forEach((p, idx) => {
          const val = perspectiveValues[idx];
          const cell = dataRow.getCell(idx + 5);
          const numericValue = parseFloat(String(val).replace('%', ''));
          if (!(val === '-' || val === '－' || Number.isNaN(numericValue))) {
            if (numericValue < 75) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
              cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
            } else if (numericValue >= 75 && numericValue < 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
              cell.font = { color: { argb: 'FF000000' }, bold: true };
            } else if (numericValue >= 90) {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
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
      a.download = `Practice_wise_Percentage_Satisfied_Customers_Each_Perspective_Trend_Analysis_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Practice-wise trend analysis Excel export error:', err);
      alert('Failed to export practice-wise trend analysis data to Excel.');
    }
  };

  // Color coding function for percentage columns
  const getPercentageCellStyle = (value, isPercentageColumn) => {
    if (!isPercentageColumn) return {};
    if (value === '-' || value === '－' || value === undefined) return { backgroundColor: '#f9fafb', color: '#6b7280' };
    const numericValue = parseFloat(String(value).replace('%', ''));
    if (isNaN(numericValue)) return {};
    if (numericValue < 75) {
      return { backgroundColor: '#FF0000', color: '#ffffff' }; // Red (Excel) - White text
    } else if (numericValue >= 75 && numericValue < 90) {
      return { backgroundColor: '#FFA500', color: '#000000' }; // Amber/Orange (same as ACSAT: Org & BU Level Average CSAT Scores)
    } else if (numericValue >= 90) {
      return { backgroundColor: '#70AD47', color: '#000000' }; // Green (close to Excel Green 11)
    }
    return {};
  };

  // Debug data availability
  console.log('=== DASHBOARD RENDER DEBUG ===');
  console.log('uploadedData:', uploadedData);
  console.log('uploadedData length:', uploadedData?.length);
  console.log('processedData:', processedData);
  console.log('processedData.data length:', processedData?.data?.length);
  console.log('excelData:', excelData);
  console.log('excelData.data length:', excelData?.data?.length);
  console.log('Fully Managed – BU Wise: fullyManagedBuWiseData.length =', fullyManagedBuWiseData?.length ?? 0, '| showBuWise =', showBuWise);
  console.log('Staff Augmentation – BU Wise: staffAugmentationBuWiseData.length =', staffAugmentationBuWiseData?.length ?? 0, '| showBuWise =', showBuWise);

  if (!uploadedData || uploadedData.length === 0) {
    console.log('❌ No uploadedData available, showing no data message');
    return (
      <DashboardContainer>
        <Header>
          <Title>Account/BU wise percentage of Satisfied Customers(Each Perspective)</Title>
          <BackButton onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </BackButton>
        </Header>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>No data available</h3>
          <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Please upload an Excel file first using the "Upload ACSAT Data" section.</p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Expected columns: BUSINESS UNIT (or BUSSINESS UNIT), CUSTOMER_ID/CUST_ID, CUSTOMER NAME or CUST_NM (same), PERSPECTIVE, RATING; second sheet: Polled (or CSAT SENT DATE/CSS_SENT_DATE), Responded (or CSAT RECEIVED DATE/CSS_RECEIVED_DATE), TYPE OF ACCOUNT (or Top 10). Dates in MM-DD-YYYY; only rows with both dates >= CSAT cycle start are counted.
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'left' }}>
            <h4 style={{ color: '#374151', marginBottom: '0.5rem' }}>Debug Information:</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              uploadedData: {uploadedData ? 'exists' : 'null'} | 
              Length: {uploadedData?.length || 0} | 
              excelData: {excelData ? 'exists' : 'null'} | 
              excelData.data: {excelData?.data ? 'exists' : 'null'}
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
              excelData keys: {excelData ? Object.keys(excelData).join(', ') : 'null'}
            </p>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  // Check if processedData is empty but uploadedData exists
  if (uploadedData && uploadedData.length > 0 && (!processedData || !processedData.data || processedData.data.length === 0)) {
    console.log('⚠️ uploadedData exists but processedData is empty, showing raw data');
  return (
    <DashboardContainer>
      <ControlPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Title>Account/BU wise percentage of Satisfied Customers(Each Perspective)</Title>
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#f59e0b', 
              marginTop: '0.5rem',
              fontWeight: '500',
              padding: '0.75rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              border: '1px solid #f59e0b'
            }}>
              ⚠️ Data loaded but processing failed. Showing raw data preview.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
              <BackButton onClick={onBack}>
                <ArrowLeft size={20} />
                Back
              </BackButton>
            </div>
          </div>
        </ControlPanel>
        
        <div style={{ margin: '1rem 0', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <h4 style={{ color: '#374151', marginBottom: '1rem' }}>Raw Data Preview (First 5 rows):</h4>
          <div style={{ overflow: 'auto', maxHeight: '400px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  {uploadedData[0] && Object.keys(uploadedData[0]).map((key, index) => (
                    <th key={index} style={{ padding: '0.5rem', border: '1px solid #d1d5db', textAlign: 'left' }}>
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uploadedData.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td key={cellIndex} style={{ padding: '0.5rem', border: '1px solid #d1d5db' }}>
                        {String(value || '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <ControlPanel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Title>
            {showPracticeWise
              ? 'Practice wise percentage of Satisfied Customers(Each Perspective)'
              : 'Account/BU wise percentage of Satisfied Customers(Each Perspective)'}
          </Title>
          {!showPracticeWise && uploadedData && uploadedData.length > 0 && (
            <div style={{ 
              fontSize: '0.875rem', 
              color: '#10b981', 
              marginTop: '0.5rem',
              fontWeight: '500'
            }}>
              ✅ Data loaded: {uploadedData.length} records from uploaded Excel file
            </div>
          )}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            {!showPracticeWise && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <button
                type="button"
                onClick={handleShowAccountWiseClick}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: !showBuWise && !showTop10 && !showPracticeWise ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                onMouseOut={(e) => { e.target.style.background = !showBuWise && !showTop10 && !showPracticeWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'; }}
              >
                Display Account Wise Satisfied Customers(Each Perspective)
              </button>
              <button
                type="button"
                onClick={handleBuWiseClick}
                style={{
                  padding: '0.5rem 1rem',
                  border: '2px solid white',
                  background: showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)',
                  color: showBuWise ? '#1e3a8a' : 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                onMouseOut={(e) => { e.target.style.background = showBuWise ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'; }}
              >
                Display BU Wise Satisfied Customers(Each Perspective)
              </button>
              <button
                type="button"
                onClick={handleTop10Click}
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
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                onMouseOut={(e) => { e.target.style.background = showTop10 ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'; }}
              >
                Top10 Accounts - percentage of Satisfied Customers(Each Perspective)
              </button>
              <button
                type="button"
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
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                onMouseOut={(e) => { e.target.style.background = showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'; }}
                aria-label="View trend analysis"
                title="View trend analysis"
              >
                {showTrendAnalysis ? 'Hide trend analysis' : 'View trend analysis'}
              </button>
            </div>
            )}
            {showPracticeWise && (
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <button
                type="button"
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
                  whiteSpace: 'nowrap'
                }}
                onMouseOver={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.35)'; }}
                onMouseOut={(e) => { e.target.style.background = showTrendAnalysis ? '#ffffff' : 'rgba(255, 255, 255, 0.12)'; }}
                aria-label="View trend analysis"
                title="View trend analysis"
              >
                {showTrendAnalysis ? 'Hide trend analysis' : 'View trend analysis'}
              </button>
            </div>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', flexShrink: 0 }}>
              <DownloadButton onClick={handleDownload}>
                <Download size={20} />
                Download Excel
              </DownloadButton>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                {showPracticeWise ? (
                  <BackButton onClick={handleBackToAccountBuDashboard}>
                    <ArrowLeft size={20} />
                    Back to Account/BU Dashboard
                  </BackButton>
                ) : (
                  <>
                <BackButton onClick={onBack}>
                  <ArrowLeft size={20} />
                  Back
                </BackButton>
                <button
                  type="button"
                  onClick={handlePracticeWiseClick}
                  style={{
                    padding: '0.5rem 1rem',
                    border: 'none',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.7rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    lineHeight: '1.3',
                    maxWidth: '220px'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#3b82f6';
                  }}
                  aria-label="Practice wise percentage of Satisfied Customers(Each Perspective)"
                  title="Practice wise percentage of Satisfied Customers(Each Perspective)"
                >
                  Practice wise percentage of Satisfied Customers(Each Perspective)
                </button>
                  </>
                )}
                {showPracticeWise && (
                  <BackButton onClick={onBack}>
                    <ArrowLeft size={20} />
                    Back
                  </BackButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </ControlPanel>

      {showPracticeWise ? (
        <>
          <div style={{ margin: '1rem 0', padding: '1rem', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '0.875rem', color: '#166534' }}>
            <strong>Customer Success Survey All PCSAT report</strong>:
            each perspective % = (count of <strong>RATING</strong> 4 or 5 for that <strong>PERSPECTIVE</strong>, grouped by <strong>Practice</strong>) ÷ (count of data input rows for that <strong>PERSPECTIVE</strong> in that <strong>Practice</strong>) × 100.
            <strong>Customer Success Survey Status report</strong>: <strong>#Polled</strong> = count(CSAT SENT DATE), <strong>#Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
            {csatCycleStartDateFormatted && <> Dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
          </div>
          <ResultsSummary>
            <strong>Results Summary:</strong> Showing {practiceWiseData.rows.length} practice{practiceWiseData.rows.length !== 1 ? 's' : ''}.
            <span style={{ marginLeft: '1rem', fontWeight: '600' }}>• Grouped by Practice</span>
          </ResultsSummary>
          <div style={{
            margin: '1rem 0',
            padding: '1rem',
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Percentage Color Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', border: '1px solid #FF0000', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt;75% (Red - White Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', border: '1px solid #FFA500', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>75% to 90% (Amber - Black Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#70AD47', border: '1px solid #70AD47', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;=90% (Green - Black Text)</span>
            </div>
          </div>
          {practiceWiseData.rows.length === 0 && (
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
              No practice data found in the Customer Success Survey All PCSAT / Status reports.
            </div>
          )}
          {showTrendAnalysis && practiceWiseTrendData.error && (
            <div style={{ margin: '1rem 0', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
              {practiceWiseTrendData.error}
            </div>
          )}
          {showTrendAnalysis && !practiceWiseTrendData.error && practiceWiseTrendData.sourceName && (
            <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '8px', fontSize: '0.875rem', color: '#1d4ed8' }}>
              Trend columns (after Thought Leadership (%)) compare H2 vs H1 using <strong>{practiceWiseTrendData.sourceName}</strong>.
              {csatCycleStartDateFormatted && <> Sheet2 dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
            </div>
          )}
          <TableContainer>
            <Table>
              <thead>
                {showTrendAnalysis ? (
                  <>
                    <tr>
                      <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                        Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th rowSpan={2} onClick={() => handleSort('practice')} style={{ cursor: 'pointer', textAlign: 'left', verticalAlign: 'middle' }}>
                        Practice {sortConfig.key === 'practice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th colSpan={2 + PRACTICE_PERSPECTIVE_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {acsatCycle || 'H2 2025'}
                      </Th>
                      <Th colSpan={PRACTICE_PERSPECTIVE_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        {trendHeaderLabel}
                      </Th>
                    </tr>
                    <tr>
                      <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        #Polled {sortConfig.key === 'Polled' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        #Responded {sortConfig.key === 'Responded' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                      {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => (
                        <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          {perspective} (%) {sortConfig.key === perspective && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </Th>
                      ))}
                      {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => (
                        <Th key={`trend-${perspective}`} style={{ textAlign: 'center' }}>
                          {getTrendPerspectiveHeaderLabel(perspective)}
                        </Th>
                      ))}
                    </tr>
                  </>
                ) : (
                <tr>
                  <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('practice')} style={{ cursor: 'pointer', textAlign: 'left' }}>
                    Practice {sortConfig.key === 'practice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('Polled')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    #Polled {sortConfig.key === 'Polled' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('Responded')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    #Responded {sortConfig.key === 'Responded' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => (
                    <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      {perspective} (%) {sortConfig.key === perspective && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                  ))}
                </tr>
                )}
              </thead>
              <tbody>
                {practiceWiseSortedRows.map((row) => {
                  const practiceKey = String(row.practice || '').trim();
                  const trendRow = practiceWiseTrendByPractice[practiceKey];
                  return (
                  <tr key={row.practice}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                      const val = formatPerspectiveValue(row[perspective] ?? '-');
                      const isHyphen = val === '-' || val === '－';
                      const cellStyle = getPercentageCellStyle(isHyphen ? '-' : val, true);
                      return (
                        <Td key={perspective} style={{ textAlign: 'center', fontWeight: '600', ...cellStyle }}>
                          {isHyphen ? '-' : val}
                        </Td>
                      );
                    })}
                    {showTrendAnalysis && PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                      const { text, color } = formatPracticeTrendDiff(row[perspective], trendRow?.[perspective]);
                      return (
                        <Td key={`trend-${row.practice}-${perspective}`} style={{ textAlign: 'center', color, fontWeight: 500 }}>
                          {text}
                        </Td>
                      );
                    })}
                  </tr>
                  );
                })}
                {practiceWiseData.orgLevelRow && (() => {
                  const row = practiceWiseData.orgLevelRow;
                  const trendRow = practiceWiseTrendData.orgLevelRow;
                  const orgStyle = { fontWeight: 'bold', backgroundColor: '#eff6ff' };
                  return (
                    <tr key="practice-org-level">
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.sNo}</Td>
                      <Td style={{ textAlign: 'left', ...orgStyle }}>{row.practice}</Td>
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Polled ?? 0}</Td>
                      <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Responded ?? 0}</Td>
                      {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                        const val = formatPerspectiveValue(row[perspective] ?? '-');
                        const isHyphen = val === '-' || val === '－';
                        const cellStyle = getPercentageCellStyle(isHyphen ? '-' : val, true);
                        return (
                          <Td key={`org-${perspective}`} style={{ textAlign: 'center', fontWeight: 'bold', ...orgStyle, ...cellStyle }}>
                            {isHyphen ? '-' : val}
                          </Td>
                        );
                      })}
                      {showTrendAnalysis && PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                        const { text, color } = formatPracticeTrendDiff(row[perspective], trendRow?.[perspective]);
                        return (
                          <Td key={`org-trend-${perspective}`} style={{ textAlign: 'center', color, fontWeight: 600, ...orgStyle }}>
                            {text}
                          </Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>

          {showTrendAnalysis && (
            <div style={{ margin: '2rem 0 1rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e40af' }}>
                  Practice wise percentage of Satisfied Customers(Each Perspective) (Trend Analysis)
                </h2>
                {practiceWiseTrendData.rows.length > 0 && (
                  <DownloadButton onClick={handleDownloadPracticeWiseTrendAnalysis}>
                    <Download size={20} />
                    Download Excel
                  </DownloadButton>
                )}
              </div>
              <p style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: '#1d4ed8' }}>
                Data from <strong>Trend-Analysis-H12025.xlsx</strong> uploaded in <strong>&quot;Upload data for trend analysis&quot;</strong>
                {practiceWiseTrendData.sourceName ? <> ({practiceWiseTrendData.sourceName})</> : null}.
                <strong>Customer Success Survey All PCSAT report</strong>: % Satisfied per <strong>PERSPECTIVE</strong>, grouped by <strong>Practice</strong>.
                <strong>Customer Success Survey Status report</strong>: <strong>#Polled</strong> = count(CSAT SENT DATE), <strong>#Responded</strong> = count(CSAT RECEIVED DATE), grouped by <strong>Practice</strong>.
                {csatCycleStartDateFormatted && <> Dates counted only when ≥ {csatCycleStartDateFormatted} (MM-DD-YYYY).</>}
              </p>
              {practiceWiseTrendData.error && (
                <div style={{ padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  {practiceWiseTrendData.error}
                </div>
              )}
              {practiceWiseTrendData.rows.length > 0 && (
                <>
                  <div style={{
                    margin: '0 0 1rem',
                    padding: '1rem',
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Percentage Color Legend:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', border: '1px solid #FF0000', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt;75% (Red - White Text)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', border: '1px solid #FFA500', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>75% to 90% (Amber - Black Text)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', backgroundColor: '#70AD47', border: '1px solid #70AD47', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;=90% (Green - Black Text)</span>
                    </div>
                  </div>
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                          <Th style={{ textAlign: 'left' }}>Practice</Th>
                          <Th style={{ textAlign: 'center' }}>#Polled</Th>
                          <Th style={{ textAlign: 'center' }}>#Responded</Th>
                          {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => (
                            <Th key={`trend-table-${perspective}`} style={{ textAlign: 'center' }}>
                              {perspective} (%)
                            </Th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {practiceWiseTrendSortedRows.map((row) => (
                          <tr key={`trend-table-${row.practice}`}>
                            <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                            <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                            <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                            {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                              const val = formatPerspectiveValue(row[perspective] ?? '-');
                              const isHyphen = val === '-' || val === '－';
                              const cellStyle = getPercentageCellStyle(isHyphen ? '-' : val, true);
                              return (
                                <Td key={`trend-table-${row.practice}-${perspective}`} style={{ textAlign: 'center', fontWeight: '600', ...cellStyle }}>
                                  {isHyphen ? '-' : val}
                                </Td>
                              );
                            })}
                          </tr>
                        ))}
                        {practiceWiseTrendData.orgLevelRow && (() => {
                          const row = practiceWiseTrendData.orgLevelRow;
                          const orgStyle = { fontWeight: 'bold', backgroundColor: '#eff6ff' };
                          return (
                            <tr key="practice-trend-org-level">
                              <Td style={{ textAlign: 'center', ...orgStyle }}>{row.sNo}</Td>
                              <Td style={{ textAlign: 'left', ...orgStyle }}>{row.practice}</Td>
                              <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Polled ?? 0}</Td>
                              <Td style={{ textAlign: 'center', ...orgStyle }}>{row.Responded ?? 0}</Td>
                              {PRACTICE_PERSPECTIVE_ORDER.map((perspective) => {
                                const val = formatPerspectiveValue(row[perspective] ?? '-');
                                const isHyphen = val === '-' || val === '－';
                                const cellStyle = getPercentageCellStyle(isHyphen ? '-' : val, true);
                                return (
                                  <Td key={`trend-org-${perspective}`} style={{ textAlign: 'center', fontWeight: 'bold', ...orgStyle, ...cellStyle }}>
                                    {isHyphen ? '-' : val}
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
            </div>
          )}
        </>
      ) : (
      <>

      <ResultsSummary>
        <strong>Results Summary:</strong> 
        {showBuWise 
          ? `Showing count of satisfied customers (ratings 4 or 5) for each perspective grouped by Business Unit. % = (count RATING 4 or 5 / count of data input for that perspective in that BU from "CSAT received Report") × 100 — do not use #Responded. Total BUs: ${processedData.data.length},`
          : showTop10
          ? `Showing Top10 Accounts - percentage of satisfied customers (ratings 4 or 5) for each perspective. Excludes rows with 0 CSS surveys sent. All percentage columns: Timeline Adherence, Quality of Delivery, Risk Management & Responsiveness, Thought Leadership, Overall Experience, Timely Resource Fulfillment, Resource Competency (% = count RATING 4 or 5 / count data input for that perspective from "CSAT received Report" * 100). CSS data filtered by CSAT cycle start date (${csatCycleStartDateFormatted}). Total customers: ${processedData.data.length},`
          : `Showing count of satisfied customers (ratings 4 or 5) for each perspective for all valid accounts. Excludes rows with 0 CSS surveys sent. All percentage columns: Timeline Adherence, Quality of Delivery, Risk Management & Responsiveness, Thought Leadership, Overall Experience, Timely Resource Fulfillment, Resource Competency (% = count RATING 4 or 5 / count data input for that perspective from "CSAT received Report" * 100). CSS data filtered by CSAT cycle start date (${csatCycleStartDateFormatted}). Total customers: ${processedData.data.length},`
        }
        Total perspectives: {processedData.allUniquePerspectiveValues.length}
        {!showBuWise && customerNameSearch && ` (filtered by Customer Name: "${customerNameSearch}")`}
        {businessUnitFilter && ` (filtered by Business Unit: "${businessUnitFilter}")`}
        <br />
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
          Data source: Uploaded Excel file | Columns: BUSINESS UNIT, CUSTOMER_ID/CUST_ID, CUSTOMER NAME or CUST_NM (same), PERSPECTIVE, RATING; ENGAGEMENT TYPE (or Project Engagement Type)
        </span>
      </ResultsSummary>

      <FilterContainer>
        {!showBuWise && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Search size={20} color="#6b7280" />
            <SearchInput
              type="text"
              placeholder="Search by Customer Name..."
              value={customerNameSearch}
              onChange={(e) => setCustomerNameSearch(e.target.value)}
            />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', color: '#374151' }}>Filter by Business Unit:</label>
          <Select
            value={businessUnitFilter}
            onChange={(e) => setBusinessUnitFilter(e.target.value)}
          >
            <option value="">All Business Units</option>
            {processedData && Array.from(new Set(processedData.data.map(item =>
              showBuWise ? (item['BUSINESS UNIT'] ?? item['BUSSINESS UNIT']) : item.businessUnit
            )))
              .filter(bu => bu && bu !== 'N/A')
              .sort()
              .map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))
            }
          </Select>
        </div>
      </FilterContainer>

      {/* Color Legend */}
      <div style={{ 
        margin: '1rem 0', 
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
        <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Percentage Color Legend:</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FF0000', 
            border: '1px solid #FF0000',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt;75% (Red - White Text)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#FFA500', 
            border: '1px solid #FFA500',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>75% to 90% (Amber - Black Text)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: '#70AD47', 
            border: '1px solid #70AD47',
            borderRadius: '4px'
          }}></div>
          <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;=90% (Green - Black Text)</span>
        </div>
      </div>

      <TableContainer>
        <Table>
          <thead>
            {showBuWise ? (
              <>
                <tr>
                  <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                    Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('BUSINESS UNIT')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                    Business Unit {sortConfig.key === 'BUSINESS UNIT' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th colSpan={2 + (processedData?.allUniquePerspectiveValues?.length ?? 0)} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {acsatCycle || 'H2 2025'}
                  </Th>
                  {showTrendAnalysis && (
                    <Th colSpan={PERSPECTIVE_COLUMN_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                  {processedData?.allUniquePerspectiveValues?.map(perspectiveValue => {
                    const isPercentageColumn = ['Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 'Resource Competency'].includes(perspectiveValue);
                    return (
                      <Th key={perspectiveValue} onClick={() => handleSort(perspectiveValue)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        {perspectiveValue}{isPercentageColumn ? ' (%)' : ''} {sortConfig.key === perspectiveValue && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                    );
                  })}
                  {showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => (
                    <Th key={`trend-${p}`} style={{ textAlign: 'center' }}>{p}</Th>
                  ))}
                </tr>
              </>
            ) : showTop10 ? (
              <>
                <tr>
                  <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                    Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                    Account Name {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                    Business Unit {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th colSpan={2 + (processedData?.allUniquePerspectiveValues?.length ?? 0)} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    {acsatCycle || 'H2 2025'}
                  </Th>
                  {showTrendAnalysis && (
                    <Th colSpan={PERSPECTIVE_COLUMN_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
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
                  {processedData?.allUniquePerspectiveValues?.map(perspectiveValue => {
                    const isPercentageColumn = ['Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 'Resource Competency'].includes(perspectiveValue);
                    return (
                      <Th key={perspectiveValue} onClick={() => handleSort(perspectiveValue)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        {perspectiveValue}{isPercentageColumn ? ' (%)' : ''} {sortConfig.key === perspectiveValue && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                    );
                  })}
                  {showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => (
                    <Th key={`trend-${p}`} style={{ textAlign: 'center' }}>{p}</Th>
                  ))}
                </tr>
              </>
            ) : (
              showTrendAnalysis ? (
                <>
                  <tr>
                    <Th rowSpan={2} onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th rowSpan={2} onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Account Name {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th rowSpan={2} onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', textAlign: 'center', verticalAlign: 'middle' }}>
                      Business Unit {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th colSpan={2 + (processedData?.allUniquePerspectiveValues?.length ?? 0)} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      {acsatCycle || 'H2 2025'}
                    </Th>
                    <Th colSpan={PERSPECTIVE_COLUMN_ORDER.length} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      {trendHeaderLabel}
                    </Th>
                  </tr>
                  <tr>
                    <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Polled {sortConfig.key === 'cssSentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                      #Responded {sortConfig.key === 'cssReceivedCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </Th>
                    {processedData?.allUniquePerspectiveValues?.map(perspectiveValue => {
                      const isPercentageColumn = ['Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 'Resource Competency'].includes(perspectiveValue);
                      return (
                        <Th key={perspectiveValue} onClick={() => handleSort(perspectiveValue)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          {perspectiveValue}{isPercentageColumn ? ' (%)' : ''} {sortConfig.key === perspectiveValue && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </Th>
                      );
                    })}
                    {PERSPECTIVE_COLUMN_ORDER.map(p => (
                      <Th key={`trend-account-${p}`} style={{ textAlign: 'center' }}>
                        {getTrendPerspectiveHeaderLabel(p)}
                      </Th>
                    ))}
                  </tr>
                </>
              ) : (
                <tr>
                  <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Sr. No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Account Name {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    Business Unit {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('cssSentCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    #Polled {sortConfig.key === 'cssSentCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  <Th onClick={() => handleSort('cssReceivedCount')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                    #Responded {sortConfig.key === 'cssReceivedCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                  {processedData?.allUniquePerspectiveValues?.map(perspectiveValue => {
                    const isPercentageColumn = ['Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 'Resource Competency'].includes(perspectiveValue);
                    return (
                      <Th key={perspectiveValue} onClick={() => handleSort(perspectiveValue)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        {perspectiveValue} {isPercentageColumn && '(%)'} {sortConfig.key === perspectiveValue && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </Th>
                    );
                  })}
                </tr>
              )
            )}
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => {
                const isOrgLevel = showBuWise && (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) === 'Org level';
                const isCountRow = (showBuWise && row.isCountRow) || (showTop10 && (row.isTop10CountRow || row.isOtherCountRow || row.isOverallCountRow));
                const hyphenRow = !isOrgLevel && !isCountRow && !(showTop10 && (row.customerId === 'OTHER' || row.customerId === 'OTHER_COUNT' || row.customerId === 'TOP10_TOTAL' || row.customerId === 'TOP10_COUNT' || row.customerId === 'OVERALL' || row.customerId === 'OVERALL_COUNT')) && isSeadAndPolledZero(row);
                // Top 10 summary row colors (Excel: Light Cornflower Blue 3, Light Yellow 2, Light Purple 3); no legend color on these rows
                const top10SummaryRowColor = showTop10 && (row.customerId === 'OTHER' || row.customerId === 'TOP10_TOTAL' || row.customerId === 'OVERALL')
                  ? (row.customerId === 'OTHER' ? '#BDD7EE' : row.customerId === 'TOP10_TOTAL' ? '#FFF2CC' : '#E4DFEC') // Other Accounts, Top 10 Accounts, Overall (exclude TOP10_COUNT - uses count row style)
                  : null;
                const rowStyle = isOrgLevel ? { fontWeight: 'bold', backgroundColor: '#eff6ff' } : isCountRow ? { fontWeight: 'bold', backgroundColor: '#DBEAFE' } : (top10SummaryRowColor ? { backgroundColor: top10SummaryRowColor } : undefined);
                const perspectiveValues = processedData && processedData.allUniquePerspectiveValues ? processedData.allUniquePerspectiveValues : [];
                if (hyphenRow) {
                  return (
                    <tr key={index}>
                      <Td style={{ textAlign: 'center' }}>-</Td>
                      {!showBuWise && <Td style={{ textAlign: 'left' }}>-</Td>}
                      <Td style={{ textAlign: 'left' }}>-</Td>
                      <Td style={{ textAlign: 'center' }}>-</Td>
                      <Td style={{ textAlign: 'center' }}>-</Td>
                      {perspectiveValues.map(pv => <Td key={pv} style={{ textAlign: 'center' }}>-</Td>)}
                      {!showBuWise && !showTop10 && showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => (
                        <Td key={`trend-account-hyphen-${p}`} style={{ textAlign: 'center' }}>-</Td>
                      ))}
                      {(showBuWise || showTop10) && showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => <Td key={`trend-${p}`} style={{ textAlign: 'center' }}>-</Td>)}
                    </tr>
                  );
                }
                const buKey = showBuWise ? (row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) : null;
                const top10Key = showTop10 && row.customerName != null && row.businessUnit != null ? `${row.customerName}|${row.businessUnit}` : null;
                let trendByBu = (showBuWise && showTrendAnalysis && trendBuWisePerspectiveData) ? trendBuWisePerspectiveData[buKey] || {} : (showTop10 && showTrendAnalysis && trendTop10PerspectiveData && top10Key ? trendTop10PerspectiveData[top10Key] || {} : null);
                if (showTop10 && showTrendAnalysis && row.customerId === 'TOP10_TOTAL' && trendTop10SummaryPerspectives && Object.keys(trendTop10SummaryPerspectives).length > 0) trendByBu = trendTop10SummaryPerspectives;
                if (showTop10 && showTrendAnalysis && row.customerId === 'OVERALL' && trendOverallPerspectivesTop10 && Object.keys(trendOverallPerspectivesTop10).length > 0) trendByBu = trendOverallPerspectivesTop10;
                if (showTop10 && showTrendAnalysis && row.customerId === 'OTHER' && trendOtherPerspectiveData) trendByBu = trendOtherPerspectiveData;
                const trendForRow = isCountRow ? null : (isOrgLevel && showTrendAnalysis && trendOrgLevelPerspectives ? trendOrgLevelPerspectives : trendByBu);
                const accountWiseTrendRow = (!showBuWise && !showTop10 && showTrendAnalysis && !isCountRow)
                  ? (
                      (normalizeCustomerIdKey(row.customerId) ? trendAccountWiseLookup[`id|||${normalizeCustomerIdKey(row.customerId)}|||${normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase()}`] : null) ||
                      (normalizeAccountNameKey(row.customerName || '') ? trendAccountWiseLookup[`name|||${normalizeAccountNameKey(row.customerName || '')}|||${normalizeBusinessUnitDisplay(row.businessUnit || '').toString().trim().toLowerCase()}`] : null) ||
                      (((row.businessUnit == null || String(row.businessUnit).trim() === '') && normalizeAccountNameKey(row.customerName || ''))
                        ? trendAccountWiseLookup[`nameOnly|||${normalizeAccountNameKey(row.customerName || '')}`]
                        : null)
                    )
                  : null;
                return (
                <tr key={index} style={rowStyle}>
                  <Td style={{ textAlign: 'center', ...(isCountRow && { backgroundColor: '#DBEAFE', fontWeight: 'bold' }) }}>{(isOrgLevel || isCountRow || (showTop10 && row.sNo === '')) ? '' : row.sNo}</Td>
                  {!showBuWise && (
                      <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                  )}
                  <Td style={{ textAlign: 'left', ...(isCountRow && { backgroundColor: '#DBEAFE', fontWeight: 'bold' }) }}>{showBuWise ? normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT']) : normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                  <Td style={{ textAlign: 'center', ...(isCountRow && { backgroundColor: '#DBEAFE', fontWeight: 'bold' }) }}>{isCountRow ? '' : row.cssSentCount}</Td>
                  <Td style={{ textAlign: isCountRow ? 'right' : 'center', ...(isCountRow && { backgroundColor: '#DBEAFE', fontWeight: 'bold' }) }}>{isCountRow ? (row.cssReceivedCount || '') : row.cssReceivedCount}</Td>
                  {perspectiveValues.map(perspectiveValue => {
                    if (isCountRow) {
                      const countVal = row[perspectiveValue] != null ? row[perspectiveValue] : '';
                      return (
                        <Td key={perspectiveValue} style={{ textAlign: 'center', backgroundColor: '#DBEAFE', fontWeight: 'bold', color: '#1e3a8a' }}>
                          {countVal}
                        </Td>
                      );
                    }
                    const isPercentageColumn = ['Timeline Adherence', 'Quality of Delivery', 'Risk Management & Responsiveness', 'Thought Leadership', 'Overall Experience', 'Timely Resource Fulfillment', 'Resource Competency'].includes(perspectiveValue);
                    const responded = row.cssReceivedCount ?? row['Responded'];
                    const forceHyphen = (responded === 0 || responded === '0') && isPercentageColumn;
                    const rawVal = forceHyphen ? '-' : (row[perspectiveValue] ?? (isPercentageColumn ? '' : ''));
                    const val = formatPerspectiveValue(rawVal);
                    const displayVal = (val === '-' || val === '－') ? '-' : (isPercentageColumn ? (val || '0.00%') : (val || '0'));
                    const cellStyle = isPercentageColumn ? getPercentageCellStyle((val === '-' || val === '－') ? '-' : (val || '0.00%'), isPercentageColumn) : (top10SummaryRowColor ? { backgroundColor: top10SummaryRowColor } : {});
                    return (
                      <Td key={perspectiveValue} style={{ ...cellStyle, textAlign: 'center' }}>
                        {displayVal}
                      </Td>
                    );
                  })}
                  {!showBuWise && !showTop10 && showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => {
                    if (isCountRow) return <Td key={`trend-account-${p}-${index}`} style={{ textAlign: 'center', backgroundColor: '#DBEAFE' }}>{''}</Td>;
                    if (!accountWiseTrendRow) {
                      return <Td key={`trend-account-${p}-${index}`} style={{ textAlign: 'center', color: '#6b7280' }}>-</Td>;
                    }
                    const currentParsed = parsePercentForTrend(row[p]);
                    const trendParsed = accountWiseTrendRow?.perspectives ? parsePercentForTrend(accountWiseTrendRow.perspectives[p]) : null;
                    const currentNum = (currentParsed == null ? 0 : currentParsed);
                    const trendNum = (trendParsed == null ? 0 : trendParsed);
                    const diff = Math.round(currentNum - trendNum);
                    const isIncrease = diff > 0;
                    const isDecrease = diff < 0;
                    const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
                    const arrow = isIncrease ? ' ↑' : isDecrease ? ' ↓' : '';
                    const color = isIncrease ? '#15803d' : isDecrease ? '#dc2626' : '#6b7280';
                    return (
                      <Td key={`trend-account-${p}-${index}`} style={{ textAlign: 'center', color, fontWeight: 500 }}>
                        {diffStr}{arrow}
                      </Td>
                    );
                  })}
                  {(showBuWise || showTop10) && showTrendAnalysis && PERSPECTIVE_COLUMN_ORDER.map(p => {
                    if (isCountRow) {
                      return <Td key={`trend-${p}`} style={{ textAlign: 'center', backgroundColor: '#DBEAFE' }}>{''}</Td>;
                    }
                    const currentNum = parsePercentForTrend(row[p]);
                    const trendNum = trendForRow ? parsePercentForTrend(trendForRow[p]) : null;
                    if (currentNum == null || trendNum == null) {
                      return <Td key={`trend-${p}`} style={{ textAlign: 'center', color: '#6b7280' }}>-</Td>;
                    }
                    const diff = Math.round(currentNum - trendNum);
                    const isIncrease = diff > 0;
                    const isDecrease = diff < 0;
                    const diffStr = diff >= 0 ? `(+${diff}%)` : `(${diff}%)`;
                    const arrow = isIncrease ? ' ↑' : isDecrease ? ' ↓' : '';
                    const color = isIncrease ? '#15803d' : isDecrease ? '#dc2626' : '#6b7280';
                    return (
                      <Td key={`trend-${p}`} style={{ textAlign: 'center', color, fontWeight: 500 }}>
                        {diffStr}{arrow}
                      </Td>
                    );
                  })}
                </tr>
              );
              })
            ) : (
              <tr>
                <td colSpan={
                  processedData && processedData.allUniquePerspectiveValues
                    ? (showBuWise
                        ? (4 + processedData.allUniquePerspectiveValues.length + (showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.length : 0))
                        : showTop10
                          ? (5 + processedData.allUniquePerspectiveValues.length + (showTrendAnalysis ? PERSPECTIVE_COLUMN_ORDER.length : 0))
                          : (5 + processedData.allUniquePerspectiveValues.length))
                    : (showBuWise ? 4 : showTop10 ? 5 : 5)
                } style={{ textAlign: 'center', padding: '2rem' }}>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>

      {totalPages > 1 && !showAllData && (
        <PaginationContainer>
          <PageButton
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            First
          </PageButton>
          <PageButton
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </PageButton>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <PageButton
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={currentPage === pageNum ? 'active' : ''}
              >
                {pageNum}
              </PageButton>
            );
          })}
          
          <PageButton
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </PageButton>
          <PageButton
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            Last
          </PageButton>
        </PaginationContainer>
      )}

      {/* Trend Analysis Section - Account-wise (H1 2025 reference from uploaded Trend-Analysis-H12025.xlsx) */}
      {!showBuWise && !showTop10 && !showPracticeWise && showTrendAnalysis && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{
            padding: '1rem 1.25rem',
            background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div>Trend Analysis ({trendAccountWiseH1Reference?.sourceName || 'reference'})</div>
            <DownloadButton onClick={handleDownloadTrendAnalysisAccountWiseH1Reference}>
              <Download size={20} />
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
            {trendAccountWiseH1Reference?.error ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.875rem' }}>
                {trendAccountWiseH1Reference.error}
              </div>
            ) : !trendAccountWiseH1Reference?.hasData ? (
              <div style={{ padding: '0.9rem 1rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', color: '#9a3412', fontSize: '0.875rem' }}>
                No trend rows found in Customer Success Survey Status report after date filter.
              </div>
            ) : (
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th style={{ textAlign: 'left' }}>Account Name</Th>
                      <Th style={{ textAlign: 'left' }}>Business Unit</Th>
                      <Th style={{ textAlign: 'center' }}>#Polled</Th>
                      <Th style={{ textAlign: 'center' }}>#Responded</Th>
                      {(trendAccountWiseH1Reference?.perspectives || PERSPECTIVE_COLUMN_ORDER).map(p => (
                        <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trendAccountWiseH1Reference.rows.map((r, idx) => (
                      <tr key={`${r.accountName}|||${r.businessUnit}|||${idx}`}>
                        <Td style={{ textAlign: 'left' }}>{r.accountName}</Td>
                        <Td style={{ textAlign: 'left' }}>{r.businessUnit}</Td>
                        <Td style={{ textAlign: 'center' }}>{r.polled}</Td>
                        <Td style={{ textAlign: 'center' }}>{r.responded}</Td>
                        {(trendAccountWiseH1Reference?.perspectives || PERSPECTIVE_COLUMN_ORDER).map(p => {
                          const val = r?.perspectives?.[p] ?? '-';
                          const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                          return (
                            <Td key={`${p}|||${idx}`} style={{ textAlign: 'center', ...cellStyle }}>
                              {val}
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

      {/* Trend Analysis – Top 10: from uploaded trend file "CSAT sent and received Report" (#Polled, #Responded) and "CSAT received Report" (perspective %), TYPE OF ACCOUNT = "Top 10". Shown below Top 10 dashboard when "View trend analysis" is on. */}
      {showTop10 && showTrendAnalysis && trendTop10Data.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Trend Analysis – CSAT sent and received Report (Top 10 Accounts)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
            Data from uploaded trend file (e.g. Trend-Analysis-H12025.xlsx). #Polled and #Responded: the Customer Success Survey Status report where TYPE OF ACCOUNT = &quot;Top 10&quot; (or blank/N/A for Other). Perspective columns: the Customer Success Survey All PCSAT report — (count of RATING 4 or 5 for that perspective / count of data input for that perspective) × 100. Per account: group by account and Business Unit (TYPE OF ACCOUNT = &quot;Top 10&quot;). Top 10 Accounts row: TYPE OF ACCOUNT = &quot;Top 10&quot;. Other Accounts row: TYPE OF ACCOUNT blank/empty/N/A. Overall row: all rows. Do NOT use #Responded for perspective %.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadTrendAnalysisTop10Table}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Percentage Color Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', border: '1px solid #FF0000', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt;75% (Red - White Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', border: '1px solid #FFA500', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>75% to 90% (Amber - Black Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#70AD47', border: '1px solid #70AD47', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;=90% (Green - Black Text)</span>
            </div>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {PERSPECTIVE_COLUMN_ORDER.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trendTop10Data.map((row, idx) => {
                  const key = `${row.accountName}|${row.businessUnit}`;
                  const trendByRow = trendTop10PerspectiveData[key] || {};
                  return (
                    <tr key={`trend-top10-${idx}-${row.accountName}-${row.businessUnit}`}>
                      <Td style={{ textAlign: 'left' }}>{row.accountName}</Td>
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                      {PERSPECTIVE_COLUMN_ORDER.map(p => {
                        const val = trendByRow[p] ?? '-';
                        const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                        return (
                          <Td key={p} style={{ ...cellStyle, textAlign: 'center' }}>{val}</Td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Top 10 Accounts: grand total row for all Top 10 accounts – use trendTop10SummaryPerspectives (data input count), same as Excel */}
                {trendTop10Data.length > 0 && (() => {
                  const totalPolled = trendTop10Data.reduce((s, r) => s + (r.polled || 0), 0);
                  const totalResponded = trendTop10Data.reduce((s, r) => s + (r.responded || 0), 0);
                  const perspectivePcts = PERSPECTIVE_COLUMN_ORDER.map(p => trendTop10SummaryPerspectives[p] ?? '-');
                  return (
                    <tr key="trend-top10-total" style={{ backgroundColor: '#FFF2CC' }}>
                      <Td style={{ textAlign: 'left', fontWeight: 'bold' }}>Top 10 Accounts</Td>
                      <Td style={{ textAlign: 'left' }}></Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalPolled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalResponded}</Td>
                      {PERSPECTIVE_COLUMN_ORDER.map((p, i) => {
                        const val = perspectivePcts[i];
                        const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                        return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>{val}</Td>;
                      })}
                    </tr>
                  );
                })()}
                {/* Other Accounts: grand total where TYPE OF ACCOUNT = blank/empty/N/A */}
                {trendOtherData && (trendOtherData.polled > 0 || trendOtherData.responded > 0) && (
                  <tr key="trend-other" style={{ backgroundColor: '#BDD7EE' }}>
                    <Td style={{ textAlign: 'left', fontWeight: 'bold' }}>Other Accounts</Td>
                    <Td style={{ textAlign: 'left' }}></Td>
                    <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{trendOtherData.polled}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{trendOtherData.responded}</Td>
                    {PERSPECTIVE_COLUMN_ORDER.map(p => {
                      const val = trendOtherPerspectiveData ? (trendOtherPerspectiveData[p] ?? '-') : '-';
                      const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                      return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>{val}</Td>;
                    })}
                  </tr>
                )}
                {/* Overall: grand total for all rows (Top 10 + Other) */}
                {(trendTop10Data.length > 0 || (trendOtherData && (trendOtherData.polled > 0 || trendOtherData.responded > 0))) && (() => {
                  const top10Polled = trendTop10Data.reduce((s, r) => s + (r.polled || 0), 0);
                  const top10Responded = trendTop10Data.reduce((s, r) => s + (r.responded || 0), 0);
                  const otherPolled = trendOtherData?.polled || 0;
                  const otherResponded = trendOtherData?.responded || 0;
                  const totalPolled = top10Polled + otherPolled;
                  const totalResponded = top10Responded + otherResponded;
                  const perspectivePcts = PERSPECTIVE_COLUMN_ORDER.map(p => trendOverallPerspectivesTop10[p] ?? '-');
                  return (
                    <tr key="trend-overall" style={{ backgroundColor: '#E4DFEC' }}>
                      <Td style={{ textAlign: 'left', fontWeight: 'bold' }}>Overall</Td>
                      <Td style={{ textAlign: 'left' }}></Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalPolled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold' }}>{totalResponded}</Td>
                      {PERSPECTIVE_COLUMN_ORDER.map((p, i) => {
                        const val = perspectivePcts[i];
                        const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                        return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>{val}</Td>;
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </div>
      )}
      {showTop10 && showTrendAnalysis && trendAnalysisFiles?.length > 0 && trendTop10Data.length === 0 && csatCycleStartDateFormatted && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
          No trend data for Top 10 in the selected cycle. Ensure the trend file has the Customer Success Survey Status report with TYPE OF ACCOUNT = &quot;Top 10&quot; and dates ≥ {csatCycleStartDateFormatted}.
        </div>
      )}

      {/* Trend Analysis dashboard: from uploaded trend file "CSAT sent and received Report" (#Polled, #Responded) and "CSAT received Report" (perspective %), group by BUSINESS UNIT. Shown below BU wise dashboard when "View trend analysis" is on. */}
      {showBuWise && showTrendAnalysis && trendBuWiseData.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Trend Analysis – CSAT sent and received Report (by Business Unit)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                Data from uploaded trend file (e.g. Trend-Analysis-H12025.xlsx). #Polled and #Responded: the Customer Success Survey Status report — #Polled = count(CSAT SENT DATE), #Responded = count(CSAT RECEIVED DATE) where date ≥ CSAT cycle start ({csatCycleStartDateFormatted || 'MM-DD-YYYY'}). Perspective columns: the Customer Success Survey All PCSAT report — (count of RATING 4 or 5 for that perspective / count of data input for that perspective) × 100. BU rows: group by BUSINESS UNIT. Org level: same formula (count satisfied / count data input per perspective) × 100.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadTrendAnalysisTable}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          {/* Legend for Trend Analysis table */}
          <div style={{
            margin: '0 0 1rem',
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ fontWeight: '600', color: '#374151', marginRight: '0.5rem' }}>Percentage Color Legend:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FF0000', border: '1px solid #FF0000', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&lt;75% (Red - White Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA500', border: '1px solid #FFA500', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>75% to 90% (Amber - Black Text)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', backgroundColor: '#70AD47', border: '1px solid #70AD47', borderRadius: '4px' }} />
              <span style={{ fontSize: '0.875rem', color: '#374151' }}>&gt;=90% (Green - Black Text)</span>
            </div>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {PERSPECTIVE_COLUMN_ORDER.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p}</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trendBuWiseData.map((row, idx) => {
                  const trendByBu = trendBuWisePerspectiveData[row.businessUnit] || {};
                  return (
                    <tr key={`trend-bu-${idx}-${row.businessUnit}`}>
                      <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row.businessUnit)}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.polled}</Td>
                      <Td style={{ textAlign: 'center' }}>{row.responded}</Td>
                      {PERSPECTIVE_COLUMN_ORDER.map(p => {
                        const val = trendByBu[p] ?? '-';
                        const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : {};
                        return (
                          <Td key={p} style={{ ...cellStyle, textAlign: 'center' }}>{val}</Td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Org level grand total row */}
                {(() => {
                  const totalPolled = trendBuWiseData.reduce((s, r) => s + (r.polled || 0), 0);
                  const totalResponded = trendBuWiseData.reduce((s, r) => s + (r.responded || 0), 0);
                  const orgPerspectives = PERSPECTIVE_COLUMN_ORDER.map(p => trendOrgLevelPerspectives[p] ?? '-');
                  return (
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#eff6ff' }} key="trend-org-level">
                      <Td style={{ textAlign: 'left', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>Org level</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>{totalPolled}</Td>
                      <Td style={{ textAlign: 'center', fontWeight: 'bold', backgroundColor: '#eff6ff' }}>{totalResponded}</Td>
                      {orgPerspectives.map((val, i) => {
                        const cellStyle = (val !== '-' && val !== '－') ? getPercentageCellStyle(val, true) : { backgroundColor: '#eff6ff' };
                        return (
                          <Td key={PERSPECTIVE_COLUMN_ORDER[i]} style={{ ...cellStyle, textAlign: 'center', fontWeight: 'bold' }}>{val}</Td>
                        );
                      })}
                    </tr>
                  );
                })()}
              </tbody>
            </Table>
          </TableContainer>
        </div>
      )}
      {showBuWise && showTrendAnalysis && trendAnalysisFiles?.length > 0 && trendBuWiseData.length === 0 && csatCycleStartDateFormatted && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
          No trend data for the selected cycle. Ensure the trend file has the Customer Success Survey Status report and rows with CSAT SENT DATE / CSAT RECEIVED DATE ≥ {csatCycleStartDateFormatted}.
        </div>
      )}

      {/* Fully Managed – Account Wise % Satisfied (by Perspective): Account wise view only (not Top 10, not BU Wise). Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Fully Managed", group by CUSTOMER_ID or CUST_ID. */}
      {!showBuWise && !showTop10 && fullyManagedAccountWiseData.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Fully Managed – Account Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                From the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by CUSTOMER_ID or CUST_ID. One row per account. Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report (dates ≥ CSAT cycle start, MM-DD-YYYY). Perspective % = count(RATING 4 or 5 for perspective) / count(CSAT RECEIVED DATE) × 100.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadFullyManagedAccountWise}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {FULLY_MANAGED_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fullyManagedAccountWiseData.map((row, idx) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={idx}>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        {FULLY_MANAGED_PERSPECTIVES.map(p => <Td key={p} style={{ textAlign: 'center' }}>-</Td>)}
                      </tr>
                    );
                  }
                  return (
                  <tr key={idx}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row['Account Name']}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {FULLY_MANAGED_PERSPECTIVES.map(p => {
                      const responded = row.Responded ?? 0;
                      const val = formatPerspectiveValue((responded === 0 || responded === '0') ? '-' : (row[p] || '0%'));
                      const isHyphen = (val === '-' || val === '－');
                      const num = parseFloat(String(val).replace('%', ''));
                      const style = { textAlign: 'center' };
                      if (isHyphen) {
                        Object.assign(style, { backgroundColor: '#f9fafb', color: '#6b7280' });
                      } else if (!isNaN(num)) {
                        if (num < 75) Object.assign(style, { backgroundColor: '#FF0000', color: '#ffffff' });
                        else if (num >= 90) Object.assign(style, { backgroundColor: '#70AD47', color: '#000000' });
                        else Object.assign(style, { backgroundColor: '#FFA500', color: '#000000' });
                      }
                      return <Td key={p} style={style}>{isHyphen ? '-' : val}</Td>;
                    })}
                  </tr>
                  );
                })}
                {grandTotalFullyManagedAccountWise && (
                  <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>Grand Total</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalFullyManagedAccountWise.totalPolled}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalFullyManagedAccountWise.totalResponded}</Td>
                    {FULLY_MANAGED_PERSPECTIVES.map(p => {
                      const val = grandTotalFullyManagedAccountWise.perspectiveValues[p] || '-';
                      const cellStyle = getPercentageCellStyle(val === '-' ? '-' : (val || '0.00%'), true);
                      return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: '700' }}>{val}</Td>;
                    })}
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}

      {/* Co-Managed – Account Wise % Satisfied (by Perspective): Account wise view only (not Top 10, not BU Wise). Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Co-Managed", group by CUSTOMER_ID or CUST_ID. Polled/Responded from sheet 2. */}
      {!showBuWise && !showTop10 && coManagedAccountWiseData.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Co-Managed – Account Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                From the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by CUSTOMER_ID or CUST_ID. Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report (dates ≥ CSAT cycle start, MM-DD-YYYY). Perspective % = count(RATING 4 or 5 for perspective) / count(CSAT RECEIVED DATE) × 100.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadCoManagedAccountWise}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {CO_MANAGED_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coManagedAccountWiseData.map((row, idx) => {
                  const hyphenRow = isSeadAndPolledZero(row);
                  if (hyphenRow) {
                    return (
                      <tr key={idx}>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        {CO_MANAGED_PERSPECTIVES.map(p => <Td key={p} style={{ textAlign: 'center' }}>-</Td>)}
                      </tr>
                    );
                  }
                  return (
                  <tr key={idx}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row['Account Name']}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {CO_MANAGED_PERSPECTIVES.map(p => {
                      const responded = row.Responded ?? 0;
                      const val = formatPerspectiveValue((responded === 0 || responded === '0') ? '-' : (row[p] || '0%'));
                      const isHyphen = (val === '-' || val === '－');
                      const num = parseFloat(String(val).replace('%', ''));
                      const style = { textAlign: 'center' };
                      if (isHyphen) {
                        Object.assign(style, { backgroundColor: '#f9fafb', color: '#6b7280' });
                      } else if (!isNaN(num)) {
                        if (num < 75) Object.assign(style, { backgroundColor: '#FF0000', color: '#ffffff' });
                        else if (num >= 90) Object.assign(style, { backgroundColor: '#70AD47', color: '#000000' });
                        else Object.assign(style, { backgroundColor: '#FFA500', color: '#000000' });
                      }
                      return <Td key={p} style={style}>{isHyphen ? '-' : val}</Td>;
                    })}
                  </tr>
                  );
                })}
                {grandTotalCoManagedAccountWise && (
                  <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>Grand Total</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalCoManagedAccountWise.totalPolled}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalCoManagedAccountWise.totalResponded}</Td>
                    {CO_MANAGED_PERSPECTIVES.map(p => {
                      const val = grandTotalCoManagedAccountWise.perspectiveValues[p] || '-';
                      const cellStyle = getPercentageCellStyle(val === '-' ? '-' : (val || '0.00%'), true);
                      return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: '700' }}>{val}</Td>;
                    })}
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}

      {/* Staff Augmentation – Account Wise % Satisfied (by Perspective): Account wise view only (not Top 10, not BU Wise). Sheet 1 "CSAT received Report", ENGAGEMENT TYPE = "Staff Augmentation", group by CUSTOMER_ID or CUST_ID. Polled/Responded from sheet 2. */}
      {!showBuWise && !showTop10 && staffAugmentationAccountWiseData.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Staff Augmentation – Account Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                From the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by CUSTOMER_ID or CUST_ID. Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report (dates ≥ CSAT cycle start, MM-DD-YYYY). Perspective % = count(RATING 4 or 5 for perspective) / count(CSAT RECEIVED DATE) × 100.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadStaffAugmentationAccountWise}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Account Name</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {STAFF_AUGMENTATION_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffAugmentationAccountWiseData.map((row, idx) => (
                  <tr key={idx}>
                    <Td style={{ textAlign: 'center' }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left' }}>{row['Account Name']}</Td>
                    <Td style={{ textAlign: 'left' }}>{normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center' }}>{row.Responded ?? 0}</Td>
                    {STAFF_AUGMENTATION_PERSPECTIVES.map(p => {
                      const responded = row.Responded ?? 0;
                      const val = formatPerspectiveValue((responded === 0 || responded === '0') ? '-' : (row[p] || '0%'));
                      const isHyphen = (val === '-' || val === '－');
                      const num = parseFloat(String(val).replace('%', ''));
                      const style = { textAlign: 'center' };
                      if (isHyphen) {
                        Object.assign(style, { backgroundColor: '#f9fafb', color: '#6b7280' });
                      } else if (!isNaN(num)) {
                        if (num < 75) Object.assign(style, { backgroundColor: '#FF0000', color: '#ffffff' });
                        else if (num >= 90) Object.assign(style, { backgroundColor: '#70AD47', color: '#000000' });
                        else Object.assign(style, { backgroundColor: '#FFA500', color: '#000000' });
                      }
                      return <Td key={p} style={style}>{isHyphen ? '-' : val}</Td>;
                    })}
                  </tr>
                ))}
                {grandTotalStaffAugmentationAccountWise && (
                  <tr style={{ fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>Grand Total</Td>
                    <Td style={{ textAlign: 'left', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>-</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalStaffAugmentationAccountWise.totalPolled}</Td>
                    <Td style={{ textAlign: 'center', fontWeight: '700', backgroundColor: '#E2E8F0', color: '#000000' }}>{grandTotalStaffAugmentationAccountWise.totalResponded}</Td>
                    {STAFF_AUGMENTATION_PERSPECTIVES.map(p => {
                      const val = grandTotalStaffAugmentationAccountWise.perspectiveValues[p] || '-';
                      const cellStyle = getPercentageCellStyle(val === '-' ? '-' : (val || '0.00%'), true);
                      return <Td key={p} style={{ ...cellStyle, textAlign: 'center', fontWeight: '700' }}>{val}</Td>;
                    })}
                  </tr>
                )}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}

      {/* Fully Managed – BU Wise % Satisfied (by Perspective): different dashboard below BU-wise; ENGAGEMENT TYPE = "Fully Managed", group by BUSINESS UNIT */}
      {showBuWise && fullyManagedBuWiseData.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Fully Managed – BU Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                From the Customer Success Survey All PCSAT report, ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT. Polled = count(CSAT SENT DATE), Responded = count(CSAT RECEIVED DATE) from the Customer Success Survey Status report where ENGAGEMENT TYPE = &quot;Fully Managed&quot;, group by BUSINESS UNIT (dates ≥ CSAT cycle start, MM-DD-YYYY). Perspective % = count(RATING 4 or 5 for perspective) / count(CSAT RECEIVED DATE) × 100. Cell colors: &lt;75% Red (white text), 75%–90% Amber (black text), ≥90% Green (black text).
              </p>
            </div>
            <DownloadButton onClick={handleDownloadFullyManaged}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {FULLY_MANAGED_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fullyManagedBuWiseData.map((row, idx) => {
                  const isOrgLevelFM = row['BUSINESS UNIT'] === 'Org level';
                  const hyphenRowFM = !isOrgLevelFM && isSeadAndPolledZero(row);
                  if (hyphenRowFM) {
                    return (
                      <tr key={idx}>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        {FULLY_MANAGED_PERSPECTIVES.map(p => <Td key={p} style={{ textAlign: 'center' }}>-</Td>)}
                      </tr>
                    );
                  }
                  const rowStyleFM = isOrgLevelFM ? { fontWeight: 'bold', backgroundColor: '#E2E8F0' } : undefined;
                  return (
                  <tr key={idx} style={rowStyleFM}>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelFM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', ...(isOrgLevelFM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelFM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelFM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Responded ?? 0}</Td>
                    {FULLY_MANAGED_PERSPECTIVES.map(p => {
                      const val = formatPerspectiveValue(row[p] ?? '');
                      const isHyphen = (val === '-' || val === '－');
                      const cellStyle = getPercentageCellStyle((val === '-' || val === '－') ? '-' : (val || '0.00%'), true);
                      const style = { textAlign: 'center', ...cellStyle, ...(isOrgLevelFM && { fontWeight: 'bold' }) };
                      return <Td key={p} style={style}>{isHyphen ? '-' : (val || '0%')}</Td>;
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}

      {/* Co-Managed – BU Wise % Satisfied (by Perspective): below Fully Managed; ENGAGEMENT TYPE = "Co-Managed", group by BUSINESS UNIT */}
      {showBuWise && coManagedBuWiseData.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Co-Managed – BU Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                Perspective columns = count(RATING 4 or 5 for that perspective from the Customer Success Survey All PCSAT report) / count(CSAT RECEIVED DATE) from the Customer Success Survey Status report × 100, where ENGAGEMENT TYPE = &quot;Co-Managed&quot;, group by BUSINESS UNIT. Only rows where CSAT SENT DATE and CSAT RECEIVED DATE ≥ CSAT cycle start date (csatCycleStartDateFormatted, MM-DD-YYYY). #Polled/#Responded (table) = count(CSAT SENT DATE) / count(CSAT RECEIVED DATE) from sheet 2.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadCoManaged}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {CO_MANAGED_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coManagedBuWiseData.map((row, idx) => {
                  const isOrgLevelCM = row['BUSINESS UNIT'] === 'Org level';
                  const rowStyleCM = isOrgLevelCM ? { fontWeight: 'bold', backgroundColor: '#E2E8F0' } : undefined;
                  return (
                  <tr key={idx} style={rowStyleCM}>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelCM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', ...(isOrgLevelCM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelCM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelCM && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Responded ?? 0}</Td>
                    {CO_MANAGED_PERSPECTIVES.map(p => {
                      const val = formatPerspectiveValue(row[p] ?? '');
                      const isHyphen = (val === '-' || val === '－');
                      const cellStyle = getPercentageCellStyle((val === '-' || val === '－') ? '-' : (val || '0.00%'), true);
                      const style = { textAlign: 'center', ...cellStyle, ...(isOrgLevelCM && { fontWeight: 'bold' }) };
                      return <Td key={p} style={style}>{isHyphen ? '-' : (val || '0%')}</Td>;
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}

      {/* Staff Augmentation – BU Wise % Satisfied (by Perspective): below Co-Managed; ENGAGEMENT TYPE = "Staff Augmentation", group by BUSINESS UNIT */}
      {showBuWise && staffAugmentationBuWiseData.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1e293b' }}>
                Staff Augmentation – BU Wise % Satisfied Customers (by Perspective)
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
                Perspective columns = count(RATING 4 or 5 for that perspective from the Customer Success Survey All PCSAT report) / count(CSAT RECEIVED DATE) from the Customer Success Survey Status report × 100, where ENGAGEMENT TYPE = &quot;Staff Augmentation&quot;, group by BUSINESS UNIT. Only rows where CSAT SENT DATE and CSAT RECEIVED DATE ≥ CSAT cycle start date (csatCycleStartDateFormatted, MM-DD-YYYY). #Polled/#Responded (table) = count(CSAT SENT DATE) / count(CSAT RECEIVED DATE) from sheet 2.
              </p>
            </div>
            <DownloadButton onClick={handleDownloadStaffAugmentation}>
              <Download size={20} />
              Download Excel
            </DownloadButton>
          </div>
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th style={{ textAlign: 'center' }}>Sr. No.</Th>
                  <Th style={{ textAlign: 'center' }}>Business Unit</Th>
                  <Th style={{ textAlign: 'center' }}>#Polled</Th>
                  <Th style={{ textAlign: 'center' }}>#Responded</Th>
                  {STAFF_AUGMENTATION_PERSPECTIVES.map(p => (
                    <Th key={p} style={{ textAlign: 'center' }}>{p} (%)</Th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffAugmentationBuWiseData.map((row, idx) => {
                  const isOrgLevelSA = row['BUSINESS UNIT'] === 'Org level';
                  const hyphenRowSA = !isOrgLevelSA && isSeadAndPolledZero(row);
                  if (hyphenRowSA) {
                    return (
                      <tr key={idx}>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'left' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        <Td style={{ textAlign: 'center' }}>-</Td>
                        {STAFF_AUGMENTATION_PERSPECTIVES.map(p => <Td key={p} style={{ textAlign: 'center' }}>-</Td>)}
                      </tr>
                    );
                  }
                  const rowStyleSA = isOrgLevelSA ? { fontWeight: 'bold', backgroundColor: '#E2E8F0' } : undefined;
                  return (
                  <tr key={idx} style={rowStyleSA}>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelSA && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.sNo}</Td>
                    <Td style={{ textAlign: 'left', ...(isOrgLevelSA && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row['BUSINESS UNIT'] === 'Org level' ? 'Org level' : normalizeBusinessUnitDisplay(row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'])}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelSA && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Polled ?? 0}</Td>
                    <Td style={{ textAlign: 'center', ...(isOrgLevelSA && { backgroundColor: '#E2E8F0', fontWeight: 'bold' }) }}>{row.Responded ?? 0}</Td>
                    {STAFF_AUGMENTATION_PERSPECTIVES.map(p => {
                      const val = formatPerspectiveValue(row[p] ?? '');
                      const isHyphen = (val === '-' || val === '－');
                      const cellStyle = getPercentageCellStyle((val === '-' || val === '－') ? '-' : (val || '0.00%'), true);
                      const style = { textAlign: 'center', ...cellStyle, ...(isOrgLevelSA && { fontWeight: 'bold' }) };
                      return <Td key={p} style={style}>{isHyphen ? '-' : (val || '0%')}</Td>;
                    })}
                  </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b' }}>
            Legend: &lt;75% (Red - White Text) · 75% to 90% (Amber - Black Text) · &gt;=90% (Green - Black Text)
          </p>
        </div>
      )}
      </>
      )}
    </DashboardContainer>
  );
};

export default SatisfiedCustomersEachPerspectiveDashboard;