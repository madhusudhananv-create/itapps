import { isDateGreaterThanOrEqual } from './dateUtils';

const normalizeHeaderKey = (key) => (
  key == null ? '' : String(key).trim().toLowerCase().replace(/\s+/g, ' ').replace(/_/g, ' ')
);

const getRowValueByExactKeys = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value != null && String(value).trim() !== '') return value;
  }
  return undefined;
};

const findRowKeyByHeaderMatcher = (row, matcher) => {
  if (!row) return null;
  return Object.keys(row).find((key) => {
    const norm = normalizeHeaderKey(key);
    return norm && matcher(norm);
  }) || null;
};

export const normalizeYearQuarterValue = (value) => {
  if (value == null) return '';
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ');
};

export const yearQuarterMatchesCycle = (rowYearQuarter, acsatCycle) => {
  if (!acsatCycle) return true;
  const rowNorm = normalizeYearQuarterValue(rowYearQuarter);
  if (!rowNorm) return true;
  return normalizeYearQuarterValue(acsatCycle) === rowNorm;
};

const isYearQuarterHeader = (norm) => (
  norm === 'year - quarter' || norm === 'year quarter' || norm === 'year-quarter'
);

export const getYearQuarterFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, ['YEAR - QUARTER', 'YEAR_QUARTER', 'Year Quarter', 'YEAR QUARTER']);
  if (exact !== undefined) return String(exact).trim();
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isYearQuarterHeader);
  if (fuzzyKey) return String(row[fuzzyKey]).trim();
  return '';
};

const isCsatSentDateHeader = (norm) => (
  norm === 'csat sent date' || norm === 'css sent date' ||
  norm === 'csat sent' || norm === 'css sent' ||
  norm === 'sent date' ||
  (norm.includes('sent') && norm.includes('date') && !norm.includes('received'))
);

const isCsatReceivedDateHeader = (norm) => (
  norm === 'csat received date' || norm === 'css received date' ||
  norm === 'csat received' || norm === 'css received' ||
  norm === 'received date' ||
  (norm.includes('received') && norm.includes('date'))
);

export const getCsatSentDateFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, [
    'CSAT SENT DATE', 'CSAT_SENT_DATE', 'CSS SENT DATE', 'CSS_SENT_DATE',
    'CSAT SENT', 'CSAT_SENT', 'SENT DATE', 'SENT_DATE',
  ]);
  if (exact !== undefined) return exact;
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCsatSentDateHeader);
  return fuzzyKey ? row[fuzzyKey] : undefined;
};

export const getCsatReceivedDateFromRow = (row) => {
  const exact = getRowValueByExactKeys(row, [
    'CSAT RECEIVED DATE', 'CSAT_RECEIVED_DATE', 'CSS RECEIVED DATE', 'CSS_RECEIVED_DATE',
    'CSAT RECEIVED', 'CSAT_RECEIVED', 'CSS RECEIVED', 'CSS_RECEIVED',
    'RECEIVED DATE', 'RECEIVED_DATE',
  ]);
  if (exact !== undefined) return exact;
  const fuzzyKey = findRowKeyByHeaderMatcher(row, isCsatReceivedDateHeader);
  return fuzzyKey ? row[fuzzyKey] : undefined;
};

export const buildRowFromHeaders = (headers, row) => {
  const obj = {};
  headers.forEach((header, index) => {
    const trimmedHeader = header != null ? String(header).trim() : '';
    if (trimmedHeader) obj[trimmedHeader] = row[index];
  });
  return obj;
};

export const rowsFromSheetJson = (jsonData) => {
  if (!jsonData?.length) return [];
  return jsonData.slice(1).map((row) => buildRowFromHeaders(jsonData[0], row));
};

export const normalizeAcsatRowCanonicalFields = (row) => {
  if (!row) return row;
  const sent = getCsatSentDateFromRow(row);
  const received = getCsatReceivedDateFromRow(row);
  const yearQuarter = getYearQuarterFromRow(row);
  if (sent !== undefined) row['CSAT SENT DATE'] = sent;
  if (received !== undefined) row['CSAT RECEIVED DATE'] = received;
  if (yearQuarter) row['YEAR - QUARTER'] = yearQuarter;
  return row;
};

export const parseExcelDateToMMDDYYYY = (dateValue) => {
  if (!dateValue || dateValue === '' || dateValue === 'N/A') return '';
  try {
    let date;
    if (typeof dateValue === 'number') {
      date = new Date((dateValue - 25569) * 86400 * 1000);
    } else if (typeof dateValue === 'string') {
      const dv = dateValue.trim();
      if (dv.includes('/')) {
        const parts = dv.split('/');
        if (parts.length === 3) {
          date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else {
          date = new Date(dv);
        }
      } else if (dv.includes('-')) {
        const parts = dv.split('-');
        if (parts.length === 3 && parts[0].length === 4) {
          date = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
        } else if (parts.length === 3) {
          const monthNames = {
            Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
            Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
          };
          if (parts[1] in monthNames) {
            date = new Date(parseInt(parts[2], 10), monthNames[parts[1]], parseInt(parts[0], 10));
          } else {
            date = new Date(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
          }
        } else {
          date = new Date(dv);
        }
      } else {
        date = new Date(dv);
      }
    } else {
      date = new Date(dateValue);
    }
    if (isNaN(date.getTime())) return '';
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  } catch {
    return '';
  }
};

export const isDateOnOrAfterAcsatCycleStart = (dateValue, cycleStartDate) => {
  if (dateValue == null || dateValue === '' || String(dateValue).trim() === '' || dateValue === 'N/A') {
    return false;
  }
  const parsed = parseExcelDateToMMDDYYYY(dateValue);
  if (!parsed) return false;
  if (!cycleStartDate) return true;
  return isDateGreaterThanOrEqual(parsed, cycleStartDate);
};

export const rowPassesBothCsatCycleDates = (row, cycleStartDate) =>
  isDateOnOrAfterAcsatCycleStart(getCsatSentDateFromRow(row), cycleStartDate) &&
  isDateOnOrAfterAcsatCycleStart(getCsatReceivedDateFromRow(row), cycleStartDate);

export const filterRowsByAcsatCycle = (rows, cycle) => {
  const filtered = (rows || []).filter((row) => yearQuarterMatchesCycle(getYearQuarterFromRow(row), cycle));
  if (filtered.length === 0 && rows?.length > 0 && cycle) {
    console.log('acsatExcelRowUtils: all rows filtered by acsatCycle; using unfiltered rows');
    return rows;
  }
  return filtered;
};
