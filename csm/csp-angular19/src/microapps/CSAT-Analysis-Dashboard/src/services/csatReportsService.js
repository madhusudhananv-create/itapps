import { fetchReportData } from './reportsApi';

// REPORTS_SP_DETAILS.SP_NAME values for the PCSAT report pair.
const PCSAT_DETAIL_SP = 'reports_CSAT_Combined';       // per-question rating detail
const PCSAT_STATUS_SP = 'reports_getCSSInitatedDetails'; // survey status/tracking

// The backend's JSON serializer camelCases every DataTable column name coming
// out of the stored procedures (e.g. "CUST_NM" -> "cusT_NM", "BUSINESS UNIT"
// -> "businesS UNIT", "TYPE OF ACCOUNT"-style aliases -> "type of Account").
// The dashboards check for the original ALL-CAPS column names verbatim, so
// mirror every key as its uppercase form — that reconstructs the exact
// canonical name regardless of how the camelCasing mangled it, for every
// column at once, instead of patching individual names one at a time.
function normalizeRow(row) {
  const out = { ...row };
  Object.keys(row).forEach(key => {
    const upperKey = key.toUpperCase();
    if (upperKey !== key && !Object.prototype.hasOwnProperty.call(out, upperKey)) {
      out[upperKey] = row[key];
    }
  });
  return out;
}

// Builds the same { data, headers, secondSheetData, fileName, fileSize, sheetNames }
// shape that FileUpload.js currently produces from an uploaded Excel file, so
// downstream dashboards consume it unchanged.
function toUploadShape(detailRows, statusRows, fileLabel) {
  const rows = (Array.isArray(detailRows) ? detailRows : []).map(normalizeRow);
  const statusNormalized = (Array.isArray(statusRows) ? statusRows : []).map(normalizeRow);
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return {
    data: rows,
    headers,
    secondSheetData: statusNormalized.length > 0 ? statusNormalized : null,
    fileName: fileLabel,
    fileSize: 0,
    sheetNames: ['Detail', 'Status'],
  };
}

export async function fetchPCSATReportData({ startDate, endDate, customerIds }) {
  const [detail, status] = await Promise.all([
    fetchReportData(PCSAT_DETAIL_SP, { startDate, endDate, customerIds }),
    fetchReportData(PCSAT_STATUS_SP, { startDate, endDate, customerIds }),
  ]);
  return toUploadShape(detail, status, 'PCSAT Report Data');
}
