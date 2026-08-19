// Single source of truth for the "Top 10 accounts" fixed order used across every dashboard's
// Top10 / Account-Practice-wise-Top10 views (current CSAT score distribution, response rate,
// satisfied-customers-per-perspective, etc). Update this ONE list when the roster changes —
// every dashboard that imports from here picks up the change automatically.
//
// Membership in this list is authoritative: an account here always counts as "Top 10", and an
// account NOT here never does, regardless of what the uploaded file's TYPE OF ACCOUNT / "Top 10"
// column says (that column can go stale when the roster changes).
export const TOP10_ACCOUNT_ORDER = [
  'Premier Healthcare Solutions Inc',
  'Blue Cross Blue Shield Association BCBSA',
  'Frontier Airlines INC',
  'Premier - Horizon II - Covenant Health',
  'Tufts Medicine',
  'BronxCare Health System',
  'AgFirst Farm Credit Bank',
  'embecta MEDICAL II LLC',
  'Jewish Board of Family and Childrens Services JBFCS',
  'Healthfirst'
];

export const normalizeTop10AccountName = (s) =>
  (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

const TOP10_ACCOUNT_NAME_SET = new Set(TOP10_ACCOUNT_ORDER.map(normalizeTop10AccountName));

// -1 when the account isn't one of the fixed 10 (caller should append it after, alphabetically,
// or otherwise treat it as "not Top 10" per this list).
export const getTop10AccountOrderIndex = (accountName) => {
  const norm = normalizeTop10AccountName(accountName);
  return TOP10_ACCOUNT_ORDER.findIndex((n) => normalizeTop10AccountName(n) === norm);
};

// Authoritative Top 10 membership check by account name — use this instead of reading a
// TYPE OF ACCOUNT / "Top 10" column from uploaded data.
export const isTop10AccountName = (accountName) => TOP10_ACCOUNT_NAME_SET.has(normalizeTop10AccountName(accountName));

// Convenience for the common case of a raw data row carrying a customer-name-ish column under
// one of several possible header spellings.
export const isTop10AccountRowByName = (row) => {
  if (!row) return false;
  const nameKey = Object.keys(row).find((k) => /customer\s*name|cust_nm/i.test(String(k)));
  const accountName = row[nameKey] ?? row['CUSTOMER NAME'] ?? row['Customer Name'] ?? row['CUST_NM'] ?? '';
  return isTop10AccountName(accountName);
};
