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
  'Healthfirst',
  'The Northern Trust Company',
  'FIRSTSOURCE SOLUTIONS LIMITED',
  'Ooma Inc.',
  'Arista Networks India Private Limited',
  'INFOBLOX INC.'
];

// The original fixed "Top 10" survey roster (first 10 entries above). The 5 accounts appended
// after 'Healthfirst' extend Top-10 grouping/membership/sorting everywhere, but the CSAT survey
// itself only ever polls these original 10 — so the "not polled" footnote (which reports which
// survey accounts had zero Polled count) must check ONLY this list, never the full 15-account
// TOP10_ACCOUNT_ORDER.
export const TOP10_SURVEY_ACCOUNT_ORDER = TOP10_ACCOUNT_ORDER.slice(0, 10);

// CONFIG: fixed, ordered fallback list used to backfill a missing Top 10 survey account (see
// computeEffectiveTop10AccountNames below). When one of the 10 survey accounts has zero Polled,
// the next entry in THIS list that itself has Polled > 0 takes its place — always in this exact
// order, never re-ranked by Responded/Polled count or any other metric. To change which accounts
// are eligible to backfill, or their priority order, edit ONLY this array — everything else in
// this file/derived from it picks up the change automatically. Must be a subset of the extra
// accounts in TOP10_ACCOUNT_ORDER (ranks 11+).
export const TOP10_BACKFILL_FALLBACK_ORDER = [
  'The Northern Trust Company',
  'FIRSTSOURCE SOLUTIONS LIMITED',
  'Ooma Inc.',
  'Arista Networks India Private Limited',
  'INFOBLOX INC.'
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

// Computes the *effective* Top 10 roster for the currently-loaded dataset: normally the original
// 10 survey accounts (TOP10_SURVEY_ACCOUNT_ORDER), but any of those 10 with zero Polled (or absent
// from the data entirely) is swapped out for the next ELIGIBLE (Polled > 0) account in
// TOP10_BACKFILL_FALLBACK_ORDER — strictly in that config list's fixed order, never re-ranked by
// Responded/Polled count or any other metric. To change backfill behavior, edit
// TOP10_BACKFILL_FALLBACK_ORDER above, not this function.
//
// `polledByAccountName` maps a normalizeTop10AccountName(...) key to that account's Polled count
// in the currently loaded data (0/undefined = not polled = ineligible). The second parameter is
// accepted for backward compatibility with older call sites that pass a Responded map, but it is
// no longer used — backfill order is config-driven, not data-ranked.
//
// Returns a Set of normalizeTop10AccountName(...) keys — use `isEffectiveTop10AccountName` (below)
// to test membership. This must be recomputed per dataset/table (current cycle vs last cycle vs
// trend file each have their own Polled counts), never cached globally.
export const computeEffectiveTop10AccountNames = (polledByAccountName, _respondedByAccountNameUnused) => {
  const polledOf = (name) => {
    const key = normalizeTop10AccountName(name);
    const v = polledByAccountName instanceof Map ? polledByAccountName.get(key) : polledByAccountName?.[key];
    return v || 0;
  };
  const original10 = TOP10_SURVEY_ACCOUNT_ORDER;
  const active = original10.filter((name) => polledOf(name) > 0);
  const missingCount = original10.length - active.length;
  const backfill = missingCount > 0
    ? TOP10_BACKFILL_FALLBACK_ORDER.filter((name) => polledOf(name) > 0).slice(0, missingCount)
    : [];
  return new Set([...active, ...backfill].map(normalizeTop10AccountName));
};

// Membership test against a Set produced by computeEffectiveTop10AccountNames.
export const isEffectiveTop10AccountName = (accountName, effectiveTop10Set) =>
  effectiveTop10Set.has(normalizeTop10AccountName(accountName));
