// Single source of truth for grouping raw "Practice" values from uploaded data into the display
// names used across every dashboard table. Update this ONE list when the grouping changes —
// every dashboard that imports from here picks up the change automatically.
//
// Mapping (raw practice name, case/whitespace-insensitive -> grouped display name):
//   Digital Platform Engineering, Engg           -> Engineering
//   AI, Data Analytics, Data & Analytics         -> Data & AI
//   Emb                                           -> Embedded
// RunOps and Cybersecurity are kept as separate practices (not grouped).
// Any practice not listed here is returned unchanged.
const PRACTICE_GROUP_MAP = {
  'digital platform engineering': 'Engineering',
  'engg': 'Engineering',
  'ai': 'Data & AI',
  'data analytics': 'Data & AI',
  'data & analytics': 'Data & AI',
  'emb': 'Embedded'
};

const normalizeForPracticeGroup = (s) => (s || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

// Returns the grouped display name for a raw practice value, or the original (trimmed) value
// unchanged if it isn't one of the grouped names above.
export const groupPracticeName = (rawPractice) => {
  const trimmed = (rawPractice || '').toString().trim();
  if (!trimmed) return trimmed;
  const norm = normalizeForPracticeGroup(trimmed);
  return PRACTICE_GROUP_MAP[norm] || trimmed;
};
