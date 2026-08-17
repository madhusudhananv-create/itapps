import React, { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Download, ChevronLeft, Search, ChevronDown, X } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';

const RESPONDENT_BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC', 'SEAD'];
const getRespondentBuOrderIndex = (bu) => {
  const normalized = (bu || '').toString().trim().toLowerCase();
  const idx = RESPONDENT_BU_ORDER.findIndex((b) => b.toLowerCase() === normalized);
  return idx === -1 ? RESPONDENT_BU_ORDER.length : idx;
};

// ============================================================
// Styled components — matches AccountBUWiseResponseRateDashboard.js conventions
// ============================================================
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0.75rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.65rem;
  padding: 0.55rem 0.9rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  gap: 0.35rem;
`;

const HeaderTitle = styled.h1`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  line-height: 1.25;
  flex-shrink: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  padding: 0.3rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 28px;
  &:hover { background: rgba(255, 255, 255, 0.35); }
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.45rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 32px;
  white-space: nowrap;
  &:hover { background: #059669; transform: translateY(-1px); }
`;

const FilterContainer = styled.div`
  background: white;
  border-radius: 10px;
  padding: 0.75rem;
  margin: 0.65rem 0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.65rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
`;

const FilterLabel = styled.label`
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
`;

const MultiSelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid ${props => props.$open ? '#667eea' : '#d1d5db'};
  border-radius: 8px;
  background: white;
  font-size: 0.8rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  box-shadow: ${props => props.$open ? '0 0 0 3px rgba(102, 126, 234, 0.1)' : 'none'};
  &:hover { border-color: #9ca3af; }
`;

const MultiSelectPanel = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 40;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 320px;
  display: flex;
  flex-direction: column;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid #e5e7eb;
  input {
    border: none;
    outline: none;
    font-size: 0.85rem;
    width: 100%;
    color: #374151;
  }
`;

const OptionsList = styled.div`
  overflow-y: auto;
  flex: 1;
  padding: 0.25rem 0;
`;

const OptionRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.85rem;
  color: #374151;
  cursor: pointer;
  &:hover { background: #f0f4ff; }
  input { cursor: pointer; }
`;

const PanelActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.6rem;
  border-top: 1px solid #e5e7eb;
  button {
    background: none;
    border: none;
    color: #667eea;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    &:hover { text-decoration: underline; }
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
  max-height: 640px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
  border: 1px solid #9ca3af;
`;

const Th = styled.th`
  background: #1e3a8a;
  color: #ffffff;
  font-weight: 600;
  padding: 0.5rem 0.6rem;
  text-align: center;
  border: 1px solid #9ca3af;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: normal;
  word-wrap: break-word;
`;

const Td = styled.td`
  padding: 0.4rem 0.6rem;
  border: 1px solid #9ca3af;
  color: #374151;
  white-space: nowrap;
  text-align: center;
`;

// Average rating cell: < 4 Red/White, 4 to 4.49 Orange/Black, >= 4.5 Green/Black; no data -> hyphen (transparent)
const parseScore = (v) => {
  if (v == null || v === '' || v === '-') return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
};
const AvgScoreTd = styled.td`
  padding: 0.6rem 0.75rem;
  border: 1px solid #9ca3af;
  white-space: nowrap;
  font-weight: 600;
  text-align: center;
  color: ${props => {
    if (props.$score === null) return '#374151';
    if (props.$score < 4) return '#ffffff';
    return '#000000';
  }};
  background-color: ${props => {
    if (props.$score === null) return 'transparent';
    if (props.$score < 4) return '#FF0000';
    if (props.$score < 4.5) return '#FFA500';
    return '#c6efce';
  }};
`;

// Legend now lives in the top-right corner of the blue header bar.
const HeaderTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1.25rem;
  flex-wrap: wrap;
`;

const HeaderLeftCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 260px;
`;

const HeaderLegendCorner = styled.div`
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
  align-items: flex-start;
  flex-shrink: 0;
`;

const HeaderLegendBox = styled.div`
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  padding: 0.3rem 0.55rem;
  min-width: 135px;
`;

const HeaderLegendTitle = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  color: #ffffff;
  opacity: 0.9;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const HeaderLegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.68rem;
  color: #ffffff;
  line-height: 1.3;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background-color: ${props => props.color};
  border: 1px solid rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
`;

// ============================================================
// Searchable multi-select filter — no shared component exists in this
// codebase for this pattern, so it's built self-contained here.
// ============================================================
const SearchableMultiSelect = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(opt => opt.toLowerCase().includes(q));
  }, [options, search]);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const buttonLabel = selected.length === 0
    ? 'All'
    : selected.length === options.length
      ? 'All'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} selected`;

  return (
    <FilterGroup ref={containerRef}>
      <FilterLabel>{label}</FilterLabel>
      <MultiSelectButton type="button" $open={open} onClick={() => setOpen(prev => !prev)}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>{buttonLabel}</span>
        <ChevronDown size={14} style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </MultiSelectButton>
      {open && (
        <MultiSelectPanel>
          <SearchBox>
            <Search size={14} color="#9ca3af" />
            <input
              type="text"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <X size={14} color="#9ca3af" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => setSearch('')} />
            )}
          </SearchBox>
          <OptionsList>
            {filteredOptions.length === 0 && (
              <div style={{ padding: '0.6rem 0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>No matches</div>
            )}
            {filteredOptions.map(opt => (
              <OptionRow key={opt}>
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggleOption(opt)}
                />
                {opt}
              </OptionRow>
            ))}
          </OptionsList>
          <PanelActions>
            <button type="button" onClick={() => onChange(options)}>Select All</button>
            <button type="button" onClick={() => onChange([])}>Clear</button>
          </PanelActions>
        </MultiSelectPanel>
      )}
    </FilterGroup>
  );
};

// ============================================================
// Column detection helpers — mirrors conventions used across this app's
// other dashboards (regex-based, tolerant of naming/casing variations)
// ============================================================
const findCol = (firstRow, patterns, fallback) => {
  const keys = Object.keys(firstRow || {});
  for (const p of patterns) {
    const found = keys.find(k => p.test(String(k)));
    if (found) return found;
  }
  return fallback;
};

const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  try {
    let date;
    if (typeof dateValue === 'number') {
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch (e) {
    return '';
  }
};

const isDateGreaterThanOrEqual = (d1, d2) => {
  if (!d1 || !d2) return false;
  const [m1, day1, y1] = d1.split('-').map(Number);
  const [m2, day2, y2] = d2.split('-').map(Number);
  return new Date(y1, m1 - 1, day1) >= new Date(y2, m2 - 1, day2);
};

/**
 * Build respondent-level average-rating rows from a single "CSAT received Report"
 * sheet (Sheet1-equivalent). PERSPECTIVE = "Overall Experience" only, grouped by
 * (CUST_ID + RESPONDENT NAME) so the same person at the same account is one row.
 */
const buildRespondentAverages = (rows, csatCycleStartDateFormatted, applyDateFilter) => {
  const map = new Map();
  if (!Array.isArray(rows) || rows.length === 0) return map;

  const firstRow = rows[0] || {};
  const questionCategoryColumn = 'QUESTION_CATEGORY';
  const ratingColumn = findCol(firstRow, [/^rating$/i], 'RATING');
  const perspectiveCol = findCol(firstRow, [/perspective/i], 'PERSPECTIVE');
  const businessUnitColumn = findCol(firstRow, [/business\s*unit|bussiness\s*unit/i], 'BUSINESS UNIT');
  const practiceCol = findCol(firstRow, [/practice/i], 'Practice');
  const customerNameCol = findCol(firstRow, [/customer\s*name|cust_nm/i], 'CUSTOMER NAME');
  const respondentNameCol = findCol(firstRow, [/respondent\s*name/i], 'RESPONDENT NAME');
  const emailCol = findCol(firstRow, [/email/i], 'EMAIL_ID');
  const sentCol = findCol(firstRow, [/csat\s*sent\s*date|css_sent_date/i], 'CSAT SENT DATE');
  const receivedCol = findCol(firstRow, [/csat\s*received\s*date|css_received_date/i], 'CSAT RECEIVED DATE');

  rows.forEach(row => {
    if (row[questionCategoryColumn] === 'Qualitative Feedback') return;
    const perspectiveVal = (row[perspectiveCol] ?? row['PERSPECTIVE'] ?? row['Perspective'] ?? '').toString().trim();
    if (perspectiveVal !== 'Overall Experience') return;

    if (applyDateFilter && csatCycleStartDateFormatted) {
      const sentFormatted = parseExcelDateToMMDDYYYY(row[sentCol]);
      const receivedFormatted = parseExcelDateToMMDDYYYY(row[receivedCol]);
      const bothValid = sentFormatted && receivedFormatted &&
        isDateGreaterThanOrEqual(sentFormatted, csatCycleStartDateFormatted) &&
        isDateGreaterThanOrEqual(receivedFormatted, csatCycleStartDateFormatted);
      if (!bothValid) return;
    }

    const ratingResolved = parseInt(row[ratingColumn], 10);
    if (isNaN(ratingResolved) || ratingResolved < 1 || ratingResolved > 5) return;

    const custId = (row['CUST_ID'] ?? row['CUSTOMER_ID'] ?? '').toString();
    const respondentName = (row[respondentNameCol] ?? row['RESPONDENT NAME'] ?? 'Unknown').toString().trim();
    const key = `${custId}|||${respondentName.toLowerCase()}`;

    if (!map.has(key)) {
      map.set(key, {
        businessUnit: (row[businessUnitColumn] ?? row['BUSINESS UNIT'] ?? row['BUSSINESS UNIT'] ?? 'N/A').toString().trim() || 'N/A',
        practice: (row[practiceCol] ?? row['Practice'] ?? row['PRACTICE'] ?? 'N/A').toString().trim() || 'N/A',
        customerName: (row[customerNameCol] ?? row['CUSTOMER NAME'] ?? row['CUST_NM'] ?? 'N/A').toString().trim() || 'N/A',
        respondentName,
        email: (row[emailCol] ?? row['EMAIL_ID'] ?? row['Email'] ?? '').toString().trim(),
        sum: 0,
        count: 0
      });
    }
    const entry = map.get(key);
    entry.sum += ratingResolved;
    entry.count += 1;
  });

  return map;
};

/** Finds the "CSAT received Report" sheet (Sheet1-equivalent) inside a trend file entry. */
const findReceivedSheetRows = (file) => {
  if (!file) return [];
  const sheetName = file.sheetNames?.find(s => {
    const lower = String(s).toLowerCase().trim();
    return (lower.includes('csat received') && !lower.includes('sent and received')) || lower === 'sheet1' || lower === 'sheet 1';
  }) || file.sheetNames?.[0];
  return (sheetName && file.sheets?.[sheetName]) || [];
};

const RespondentWiseAverageCSATScoresDashboard = ({ excelData, trendAnalysisFiles = [], onBack }) => {
  const { csatCycleStartDateFormatted, acsatCycle } = useCSATContext();
  const [selectedBUs, setSelectedBUs] = useState([]);
  const [selectedPractices, setSelectedPractices] = useState([]);
  const [selectedRespondents, setSelectedRespondents] = useState([]);

  const currentLabel = acsatCycle || 'Current Cycle';
  const trendFile = trendAnalysisFiles && trendAnalysisFiles.length > 0 ? trendAnalysisFiles[trendAnalysisFiles.length - 1] : null;
  const trendLabel = trendFile ? (trendFile.saveName || trendFile.originalName || 'Last Cycle') : 'Last Cycle';

  const currentMap = useMemo(() => {
    const rows = excelData && Array.isArray(excelData.data) ? excelData.data : [];
    return buildRespondentAverages(rows, csatCycleStartDateFormatted, true);
  }, [excelData, csatCycleStartDateFormatted]);

  const trendMap = useMemo(() => {
    const rows = findReceivedSheetRows(trendFile);
    return buildRespondentAverages(rows, null, false);
  }, [trendFile]);

  // Merge current + trend into one row set (union of keys)
  const allRows = useMemo(() => {
    const keys = new Set([...currentMap.keys(), ...trendMap.keys()]);
    const merged = [];
    keys.forEach(key => {
      const cur = currentMap.get(key);
      const trd = trendMap.get(key);
      const base = cur || trd;
      const currentAvg = cur && cur.count > 0 ? Math.round((cur.sum / cur.count) * 100) / 100 : null;
      const trendAvg = trd && trd.count > 0 ? Math.round((trd.sum / trd.count) * 100) / 100 : null;
      merged.push({
        businessUnit: base.businessUnit,
        practice: base.practice,
        customerName: base.customerName,
        respondentName: base.respondentName,
        email: base.email,
        currentAvg,
        trendAvg
      });
    });
    return merged.sort((a, b) => {
      const buA = getRespondentBuOrderIndex(a.businessUnit);
      const buB = getRespondentBuOrderIndex(b.businessUnit);
      if (buA !== buB) return buA - buB;
      const c = (a.customerName || '').localeCompare(b.customerName || '');
      return c !== 0 ? c : (a.respondentName || '').localeCompare(b.respondentName || '');
    });
  }, [currentMap, trendMap]);

  const buOptions = useMemo(() => [...new Set(allRows.map(r => r.businessUnit))].sort(), [allRows]);
  const practiceOptions = useMemo(() => [...new Set(allRows.map(r => r.practice))].sort(), [allRows]);
  const respondentOptions = useMemo(() => [...new Set(allRows.map(r => r.respondentName))].sort(), [allRows]);

  const filteredRows = useMemo(() => {
    return allRows.filter(r =>
      (selectedBUs.length === 0 || selectedBUs.includes(r.businessUnit)) &&
      (selectedPractices.length === 0 || selectedPractices.includes(r.practice)) &&
      (selectedRespondents.length === 0 || selectedRespondents.includes(r.respondentName))
    );
  }, [allRows, selectedBUs, selectedPractices, selectedRespondents]);

  const grandTotal = useMemo(() => {
    const curVals = filteredRows.filter(r => r.currentAvg !== null).map(r => r.currentAvg);
    const trdVals = filteredRows.filter(r => r.trendAvg !== null).map(r => r.trendAvg);
    const currentAvg = curVals.length > 0 ? Math.round((curVals.reduce((a, b) => a + b, 0) / curVals.length) * 100) / 100 : null;
    const trendAvg = trdVals.length > 0 ? Math.round((trdVals.reduce((a, b) => a + b, 0) / trdVals.length) * 100) / 100 : null;
    return { currentAvg, trendAvg };
  }, [filteredRows]);

  // Trend cell: '-' when no comparison data; no color (inherit) at exactly zero diff;
  // green '#16a34a' + up arrow for improvement; red '#dc2626' + down arrow for decline.
  const renderTrendCell = (currentAvg, trendAvg) => {
    if (currentAvg === null || trendAvg === null) {
      return <Td>-</Td>;
    }
    const diff = Math.round((currentAvg - trendAvg) * 100) / 100;
    let display = `(0.00) −`;
    let color = 'inherit';
    if (diff > 0) { display = `(+${diff.toFixed(2)}) ↑`; color = '#16a34a'; }
    else if (diff < 0) { display = `(${diff.toFixed(2)}) ↓`; color = '#dc2626'; }
    return <Td style={{ color, fontWeight: 600 }}>{display}</Td>;
  };

  const formatAvg = (v) => (v === null ? '-' : v.toFixed(2));

  const downloadData = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Respondent wise Avg CSAT', { views: [{ state: 'frozen', ySplit: 1 }] });
      const headers = ['Sr.No.', 'Business Unit', 'Practice Mapped', 'Account Name', 'Respondent Name', 'Email ID', `${currentLabel} Avg Rating`, `${trendLabel} Avg Rating`, 'Trend'];
      worksheet.addRow(headers);
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      });
      headerRow.height = 30;

      const applyScoreStyle = (cell, value) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (value === null) { cell.value = '-'; return; }
        cell.value = Number(value.toFixed(2));
        cell.numFmt = '0.00';
        if (value < 4) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
          cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        } else if (value < 4.5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
          cell.font = { color: { argb: 'FF000000' }, bold: true };
        }
      };

      const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

      filteredRows.forEach((row, idx) => {
        const excelRow = worksheet.addRow([
          idx + 1, row.businessUnit, row.practice, row.customerName, row.respondentName, row.email, '', '', ''
        ]);
        applyScoreStyle(excelRow.getCell(7), row.currentAvg);
        applyScoreStyle(excelRow.getCell(8), row.trendAvg);
        const trendCell = excelRow.getCell(9);
        trendCell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (row.currentAvg === null || row.trendAvg === null) {
          trendCell.value = '-';
        } else {
          const diff = Math.round((row.currentAvg - row.trendAvg) * 100) / 100;
          if (diff > 0) { trendCell.value = `(+${diff.toFixed(2)}) UP`; trendCell.font = { color: { argb: 'FF16A34A' }, bold: true }; }
          else if (diff < 0) { trendCell.value = `(${diff.toFixed(2)}) DOWN`; trendCell.font = { color: { argb: 'FFDC2626' }, bold: true }; }
          else { trendCell.value = '(0.00)'; }
        }
        excelRow.eachCell(cell => { cell.border = thinBorder; });
      });

      // Grand Total row
      const grandRow = worksheet.addRow(['', '', '', '', '', 'Grand Total', '', '', '']);
      grandRow.getCell(6).value = 'Grand Total';
      applyScoreStyle(grandRow.getCell(7), grandTotal.currentAvg);
      applyScoreStyle(grandRow.getCell(8), grandTotal.trendAvg);
      const grandTrendCell = grandRow.getCell(9);
      grandTrendCell.alignment = { horizontal: 'center', vertical: 'middle' };
      if (grandTotal.currentAvg !== null && grandTotal.trendAvg !== null) {
        const diff = Math.round((grandTotal.currentAvg - grandTotal.trendAvg) * 100) / 100;
        if (diff > 0) { grandTrendCell.value = `(+${diff.toFixed(2)}) UP`; grandTrendCell.font = { color: { argb: 'FF16A34A' }, bold: true }; }
        else if (diff < 0) { grandTrendCell.value = `(${diff.toFixed(2)}) DOWN`; grandTrendCell.font = { color: { argb: 'FFDC2626' }, bold: true }; }
        else { grandTrendCell.value = '(0.00)'; }
      } else {
        grandTrendCell.value = '-';
      }
      grandRow.eachCell(cell => {
        cell.border = thinBorder;
        cell.font = { ...(cell.font || {}), bold: true };
        cell.fill = cell.fill || { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4DFEC' } };
      });

      worksheet.getColumn(1).width = 8;
      worksheet.getColumn(2).width = 20;
      worksheet.getColumn(3).width = 22;
      worksheet.getColumn(4).width = 28;
      worksheet.getColumn(5).width = 24;
      worksheet.getColumn(6).width = 28;
      worksheet.getColumn(7).width = 18;
      worksheet.getColumn(8).width = 18;
      worksheet.getColumn(9).width = 16;

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Respondent_wise_Average_CSAT_Scores_${csatCycleStartDateFormatted || 'export'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download Respondent wise Average CSAT Scores error:', err);
      alert('Failed to download data');
    }
  };

  return (
    <DashboardContainer data-component="RespondentWiseAverageCSATScoresDashboard">
      <DashboardHeader>
        <HeaderTopRow>
          <HeaderLeftCol>
            <HeaderTitle>📊 Respondent wise Average CSAT Scores Dashboard</HeaderTitle>
            <div style={{ fontSize: '0.875rem', opacity: 0.95 }}>
              Average of RATING (Overall Experience) per respondent — {currentLabel} vs {trendLabel}
            </div>
            <ButtonContainer>
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
            </ButtonContainer>
          </HeaderLeftCol>

          <HeaderLegendCorner>
            <HeaderLegendBox>
              <HeaderLegendTitle>Legend — Avg Rating</HeaderLegendTitle>
              <HeaderLegendRow><LegendColor color="#FF0000" />&lt; 4</HeaderLegendRow>
              <HeaderLegendRow><LegendColor color="#FFA500" />4 to 4.49</HeaderLegendRow>
              <HeaderLegendRow><LegendColor color="#c6efce" />&gt;= 4.5</HeaderLegendRow>
            </HeaderLegendBox>
            <HeaderLegendBox>
              <HeaderLegendTitle>Legend — Trend</HeaderLegendTitle>
              <HeaderLegendRow><span style={{ color: '#bbf7d0', fontWeight: 700 }}>↑</span> Improved vs {trendLabel}</HeaderLegendRow>
              <HeaderLegendRow><span style={{ color: '#fecaca', fontWeight: 700 }}>↓</span> Declined vs {trendLabel}</HeaderLegendRow>
              <HeaderLegendRow><span style={{ fontWeight: 700 }}>−</span> No change (zero difference)</HeaderLegendRow>
              <HeaderLegendRow><span style={{ fontWeight: 700 }}>-</span> No {trendLabel} data to compare</HeaderLegendRow>
            </HeaderLegendBox>
          </HeaderLegendCorner>
        </HeaderTopRow>
      </DashboardHeader>

      <FilterContainer>
        <SearchableMultiSelect
          label="Business Unit"
          options={buOptions}
          selected={selectedBUs}
          onChange={setSelectedBUs}
        />
        <SearchableMultiSelect
          label="Practice Mapped"
          options={practiceOptions}
          selected={selectedPractices}
          onChange={setSelectedPractices}
        />
        <SearchableMultiSelect
          label="Respondent Name"
          options={respondentOptions}
          selected={selectedRespondents}
          onChange={setSelectedRespondents}
        />
      </FilterContainer>

      <TableContainer>
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Sr.No.</Th>
                <Th>Business Unit</Th>
                <Th>Practice Mapped</Th>
                <Th>Account Name</Th>
                <Th>Respondent Name</Th>
                <Th>Email ID</Th>
                <Th>{currentLabel}<br />Avg Rating</Th>
                <Th>{trendLabel}<br />Avg Rating</Th>
                <Th>Trend analysis<br />({currentLabel} Vs {trendLabel})</Th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <Td colSpan={9} style={{ color: '#9ca3af', padding: '2rem' }}>No data available for the selected filters.</Td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={`${row.customerName}-${row.respondentName}-${idx}`}>
                    <Td>{idx + 1}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.practice}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.respondentName}</Td>
                    <Td style={{ textAlign: 'left' }}>{row.email || '-'}</Td>
                    <AvgScoreTd $score={row.currentAvg}>{formatAvg(row.currentAvg)}</AvgScoreTd>
                    <AvgScoreTd $score={row.trendAvg}>{formatAvg(row.trendAvg)}</AvgScoreTd>
                    {renderTrendCell(row.currentAvg, row.trendAvg)}
                  </tr>
                ))
              )}
              {filteredRows.length > 0 && (
                <tr style={{ fontWeight: 700, backgroundColor: '#E4DFEC' }}>
                  <Td></Td>
                  <Td></Td>
                  <Td></Td>
                  <Td></Td>
                  <Td style={{ textAlign: 'left' }}>Grand Total</Td>
                  <Td></Td>
                  <AvgScoreTd $score={grandTotal.currentAvg}>{formatAvg(grandTotal.currentAvg)}</AvgScoreTd>
                  <AvgScoreTd $score={grandTotal.trendAvg}>{formatAvg(grandTotal.trendAvg)}</AvgScoreTd>
                  {renderTrendCell(grandTotal.currentAvg, grandTotal.trendAvg)}
                </tr>
              )}
            </tbody>
          </Table>
        </TableWrapper>
      </TableContainer>
    </DashboardContainer>
  );
};

export default RespondentWiseAverageCSATScoresDashboard;
