/**
 * Normalize BUSINESS UNIT display values across ACSAT dashboards.
 * Treats Health Care / Health care / Healthcare (and minor punctuation/spacing) as "Healthcare".
 */
export const normalizeBusinessUnitDisplay = (bu) => {
  if (bu == null || bu === '') return bu;
  const s = String(bu).trim();
  const buNorm = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (buNorm === 'healthcare') return 'Healthcare';
  if (s.toLowerCase() === 'sead') return 'SEAD';
  return bu;
};

export const businessUnitsMatch = (a, b) =>
  normalizeBusinessUnitDisplay(a) === normalizeBusinessUnitDisplay(b);

export const getBusinessUnitFromRow = (row, fallback = 'Unknown') => {
  if (!row) return fallback;
  const raw =
    row['BUSINESS UNIT'] ||
    row['BUSSINESS UNIT'] ||
    row['BUSINESS_UNIT'] ||
    row['Business Unit'] ||
    row.BUSINESS_UNIT ||
    '';
  const trimmed = raw.toString().trim();
  return trimmed ? normalizeBusinessUnitDisplay(trimmed) : fallback;
};
