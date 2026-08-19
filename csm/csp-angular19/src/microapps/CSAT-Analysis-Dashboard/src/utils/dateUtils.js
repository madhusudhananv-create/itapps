// Date utility functions for CSAT Analysis Application

/**
 * Formats a date string to MM-DD-YYYY format
 * @param {string} dateString - Date string in YYYY-MM-DD format (from HTML date input)
 * @returns {string} Date in MM-DD-YYYY format
 */
export const formatDateToMMDDYYYY = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}-${day}-${year}`;
};

/**
 * Formats a date string to MM/DD/YYYY format
 * @param {string} dateString - Date string in YYYY-MM-DD format (from HTML date input)
 * @returns {string} Date in MM/DD/YYYY format
 */
export const formatDateToMMDDYYYYSlash = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Gets current date in MM-DD-YYYY format
 * @returns {string} Current date in MM-DD-YYYY format
 */
export const getCurrentDateMMDDYYYY = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  
  return `${month}-${day}-${year}`;
};

/**
 * Converts MM-DD-YYYY format back to YYYY-MM-DD for HTML date input
 * @param {string} mmddyyyy - Date string in MM-DD-YYYY format
 * @returns {string} Date in YYYY-MM-DD format
 */
export const convertMMDDYYYYToYYYYMMDD = (mmddyyyy) => {
  if (!mmddyyyy || !mmddyyyy.includes('-')) return '';
  
  const [month, day, year] = mmddyyyy.split('-');
  if (!month || !day || !year) return '';
  
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Computes an "H1 YYYY" / "H2 YYYY" label from a selected start date
 * (YYYY-MM-DD, from an HTML date input), so period labels shown in
 * dashboard headers/exports reflect the actual selected range instead
 * of being hardcoded.
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @returns {string} e.g. "H1 2026" or "H2 2025"
 */
export const getHalfYearLabel = (startDate) => {
  if (!startDate) return '';

  const date = new Date(startDate);
  if (isNaN(date.getTime())) return '';

  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  const half = month <= 6 ? 'H1' : 'H2';

  return `${half} ${year}`;
};

/**
 * Builds the list of selectable half-year periods (H1/H2) from 2025 up to
 * the current "last completed" half-year, newest first — for a period
 * dropdown instead of manual Start/End Date entry.
 * @returns {Array<{label: string, startDate: string, endDate: string}>}
 *   startDate/endDate are in YYYY-MM-DD format (HTML date input compatible).
 */
export const getHalfYearOptions = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();

  // Last *completed* half-year: if we're in H1 (Jan-Jun), the last completed
  // half is H2 of the previous year; if in H2 (Jul-Dec), it's H1 of this year.
  const lastCompleted = currentMonth <= 6
    ? { half: 2, year: currentYear - 1 }
    : { half: 1, year: currentYear };

  const makeOption = (half, year) => (
    half === 1
      ? { label: `H1 ${year}`, startDate: `${year}-01-01`, endDate: `${year}-06-30` }
      : { label: `H2 ${year}`, startDate: `${year}-07-01`, endDate: `${year}-12-31` }
  );

  const options = [];
  for (let year = lastCompleted.year; year >= 2025; year--) {
    const startHalf = (year === lastCompleted.year) ? lastCompleted.half : 2;
    for (let half = startHalf; half >= 1; half--) {
      options.push(makeOption(half, year));
    }
  }
  return options;
};

/**
 * Given a selected CSAT cycle start date (YYYY-MM-DD, the start of the
 * *current* H1/H2 period), computes the immediately preceding half-year
 * period — used to dynamically fetch/display "last cycle" PCSAT data
 * (e.g. current = H1 2026 -> previous = H2 2025) without any manual upload.
 * @param {string} startDate - Current cycle start date in YYYY-MM-DD format
 * @returns {{label: string, startDate: string, endDate: string} | null}
 */
export const getPreviousHalfYearOption = (startDate) => {
  if (!startDate) return null;

  const date = new Date(startDate);
  if (isNaN(date.getTime())) return null;

  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();
  const isCurrentH1 = month <= 6;
  const prevYear = isCurrentH1 ? year - 1 : year;
  const prevHalf = isCurrentH1 ? 2 : 1;

  return prevHalf === 1
    ? { label: `H1 ${prevYear}`, startDate: `${prevYear}-01-01`, endDate: `${prevYear}-06-30` }
    : { label: `H2 ${prevYear}`, startDate: `${prevYear}-07-01`, endDate: `${prevYear}-12-31` };
};

/**
 * Compares two dates in MM-DD-YYYY format
 * @param {string} date1 - First date in MM-DD-YYYY format
 * @param {string} date2 - Second date in MM-DD-YYYY format
 * @returns {boolean} True if date1 >= date2, false otherwise
 */
export const isDateGreaterThanOrEqual = (date1, date2) => {
  if (!date1 || !date2) return false;
  
  try {
    const [mm1, dd1, yyyy1] = date1.split('-').map(Number);
    const [mm2, dd2, yyyy2] = date2.split('-').map(Number);
    
    const d1 = new Date(yyyy1, mm1 - 1, dd1);
    const d2 = new Date(yyyy2, mm2 - 1, dd2);
    
    return d1 >= d2;
  } catch (error) {
    console.error('Error comparing dates:', date1, date2, error);
    return false;
  }
};
