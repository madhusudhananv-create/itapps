import * as XLSX from 'xlsx';
import { ACCESS_TYPE_OPTIONS, NETWORK_TYPE_OPTIONS } from '../types/activityTypes';

// Questionnaire data now comes from SQL via useQuestionnaireLookup (a hook), so the
// caller passes these getters in rather than this util importing static JSON helpers.
export interface QuestionnaireGetters {
  getSDLCPhasesForPractice: (practice: string) => string[];
  getActivitiesForSDLCPhase: (practice: string, phase: string) => string[];
}

// Option lists (from the AIMI lookup tables) printed on the Guidelines sheet
export interface TemplateLookups {
  aiTools: string[];
  accelerators: string[];
  qualitativeBenefits: string[];
  aiAdoptionScores: { value: string; label: string; description: string }[];
}

export const GUIDELINES_SHEET_NAME = 'Guidelines';

// Column order for the practice sheet's activity table (0-indexed).
// Import parsing (ImportActivites.tsx) relies on this exact order.
export const TEMPLATE_COLUMNS = [
  'Category/ Phases',
  'SiDLC Activity/ Question',
  'Applicability',
  'Specific AI Tools used',
  'Benefit to',
  'Hours saved',
  'Revenue Generated',
  'Qualitative Benefits',
  'Accelarators  Used',
  'Comments (Optional)',
  'AI Adoption Score',
  '% of Work done by AI',
  // Per-tool details (mandatory when AI tools are selected). Appended after the original
  // columns so templates downloaded earlier still import correctly.
  'Access Type',
  'No. of Licenses',
  'Network Type',
] as const;

// Row 0 and 1 make up the merged, two-row column header; row 2 is the
// instructional note; rows 3-9 are the Project Info block; row 10 is a
// blank spacer. Activity rows start at row 11 (0-indexed) — this constant
// must stay in sync with the layout built by buildPracticeSheetRows below.
export const TEMPLATE_DATA_START_ROW = 11;

interface TemplateProjectInfo {
  project?: string;
  manager?: string;
  account?: string;
  businessUnit?: string;
  headcount?: number;
  peopleUsingAI?: number;
}

// Excel sheet names can't contain \ / ? * [ ] : and must be 31 characters or fewer
const sanitizeSheetName = (name: string): string => {
  const cleaned = name.replace(/[\\/?*[\]:]/g, ' ').trim();
  return (cleaned || 'Practice').slice(0, 31);
};

type GuidelineRow = (string | number)[];

const APPLICABILITY_DEFINITIONS: [string, string][] = [
  ['Yes', 'The activity is currently being performed and is supported by AI capabilities.'],
  ['No', 'The activity is not feasible for AI enablement due to technical, operational, or strategic constraints.'],
  ['Activity NA', 'The activity is out of scope and not part of the current operational or delivery framework.'],
  ['Customer NA', 'The activity has been explicitly excluded based on customer requirements or preferences.'],
];

// Guidelines sheet: left block (Applicability / AI Adoption Score / Qualitative Benefits)
// and right block (AI Tools / Accelerators) side by side. Every option list comes from
// the AIMI lookup tables, so the template always matches what the app accepts.
//
// Column layout: A-C = left block, D-E = spacer, F-G = right block. Each block is a
// "table": a merged title row, a header row, then the data rows.
const GUIDELINES_LEFT_COLS = 3;
const GUIDELINES_RIGHT_COLS = 2;
const GUIDELINES_RIGHT_START_COL = 5;

interface GuidelinesLayout {
  rows: (string | number)[][];
  merges: XLSX.Range[];
  cols: XLSX.ColInfo[];
}

const buildGuidelinesLayout = (lookups: TemplateLookups): GuidelinesLayout => {
  const left: GuidelineRow[] = [];
  const right: GuidelineRow[] = [];
  const titles: { block: 'left' | 'right'; row: number }[] = [];

  const width = (block: 'left' | 'right') =>
    block === 'left' ? GUIDELINES_LEFT_COLS : GUIDELINES_RIGHT_COLS;

  const addSection = (
    block: 'left' | 'right',
    title: string,
    header: GuidelineRow,
    data: GuidelineRow[]
  ) => {
    const target = block === 'left' ? left : right;
    const pad = (row: GuidelineRow): GuidelineRow => [
      ...row,
      ...Array(Math.max(width(block) - row.length, 0)).fill(''),
    ];
    titles.push({ block, row: target.length });
    target.push(pad([title]));
    target.push(pad(header));
    data.forEach((row) => target.push(pad(row)));
  };
  const addGap = (block: 'left' | 'right') =>
    (block === 'left' ? left : right).push(Array(width(block)).fill(''));

  addSection(
    'left',
    'Applicability',
    ['SN', 'Applicability', 'Definition'],
    APPLICABILITY_DEFINITIONS.map(([value, definition], i) => [i + 1, value, definition])
  );
  addGap('left');
  addSection(
    'left',
    'AI Adoption Score',
    ['Score', 'Label', 'Description'],
    lookups.aiAdoptionScores.map((score) => [score.value, score.label, score.description])
  );
  addGap('left');
  addSection(
    'left',
    'Qualitative Benefits',
    ['SN', 'Value'],
    lookups.qualitativeBenefits.map((benefit, i) => [i + 1, benefit])
  );
  addGap('left');
  addSection(
    'left',
    'Access Type (per AI tool)',
    ['SN', 'Value'],
    ACCESS_TYPE_OPTIONS.map((o, i) => [i + 1, o.value])
  );
  addGap('left');
  addSection(
    'left',
    'Network Type (per AI tool)',
    ['SN', 'Value'],
    NETWORK_TYPE_OPTIONS.map((o, i) => [i + 1, o.value])
  );

  addSection(
    'right',
    'AI Tools used',
    ['SN', 'Value'],
    [
      ...lookups.aiTools.map((tool, i): GuidelineRow => [i + 1, tool]),
      [lookups.aiTools.length + 1, 'If Any other - ADD'],
    ]
  );
  addGap('right');
  addSection(
    'right',
    'Accelerators Used',
    ['SN', 'Value'],
    [
      ...lookups.accelerators.map((acc, i): GuidelineRow => [i + 1, acc]),
      [lookups.accelerators.length + 1, 'If Any other - ADD'],
    ]
  );

  const rowCount = Math.max(left.length, right.length);
  const rows = Array.from({ length: rowCount }, (_, i) => [
    ...(left[i] ?? Array(GUIDELINES_LEFT_COLS).fill('')),
    '',
    '',
    ...(right[i] ?? Array(GUIDELINES_RIGHT_COLS).fill('')),
  ]);

  // Merge each title across its block's columns
  const merges: XLSX.Range[] = titles.map(({ block, row }) => {
    const startCol = block === 'left' ? 0 : GUIDELINES_RIGHT_START_COL;
    return { s: { r: row, c: startCol }, e: { r: row, c: startCol + width(block) - 1 } };
  });

  // Size each column to its widest data cell (merged titles don't count) so nothing is
  // cut off when the sheet opens.
  const titleRows = new Set(titles.map((t) => `${t.block}:${t.row}`));
  const widest = (col: number, block: 'left' | 'right'): number =>
    rows.reduce((max, row, rowIndex) => {
      if (titleRows.has(`${block}:${rowIndex}`)) return max;
      return Math.max(max, String(row[col] ?? '').length);
    }, 0);
  const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

  const cols: XLSX.ColInfo[] = [
    { wch: clamp(widest(0, 'left') + 2, 8, 12) }, // SN / Score
    { wch: clamp(widest(1, 'left') + 2, 18, 60) }, // Applicability / Label / Value
    { wch: clamp(widest(2, 'left') + 2, 30, 110) }, // Definition / Description
    { wch: 3 }, // spacer
    { wch: 3 }, // spacer
    { wch: clamp(widest(5, 'right') + 2, 8, 12) }, // SN
    { wch: clamp(widest(6, 'right') + 2, 28, 70) }, // Value
  ];

  return { rows, merges, cols };
};

const BLANK_ROW = Array(TEMPLATE_COLUMNS.length).fill('') as string[];

const buildPracticeSheetHeaderRows = (
  projectInfo: TemplateProjectInfo
): (string | number)[][] => {
  const reportingDate = new Date().toLocaleDateString();

  return [
    [...TEMPLATE_COLUMNS.slice(0, 5), 'Quantitative Benefits', '', ...TEMPLATE_COLUMNS.slice(7)],
    ['', '', '', '', '', 'Hours saved', 'Revenue Generated', ...Array(TEMPLATE_COLUMNS.length - 7).fill('')],
    [
      '',
      'Please refer Guidelines tab when filling  Applicability, AI Adoption Score, AI Tools used, Accelarators used, Access Type & Network Type.\n Add comment for Hours saved like ( daily/ per person/ per sprint / overall)\n If an activity uses several AI tools, enter one Access Type / No. of Licenses / Network Type for all of them, or a comma-separated list in the same order as the tools. No. of Licenses is needed only when Access Type is Licensed.',
      ...Array(TEMPLATE_COLUMNS.length - 2).fill(''),
    ],
    ['Project Info', 'Project Name:', projectInfo.project ?? '', '', '', '', '', '', '', '', '', ''],
    ['', 'Project Manager:', projectInfo.manager ?? '', '', '', '', '', '', '', '', '', ''],
    ['', 'Account Name:', projectInfo.account ?? '', '', '', '', '', '', '', '', '', ''],
    ['', 'Business Unit Name:', projectInfo.businessUnit ?? '', '', '', '', '', '', '', '', '', ''],
    ['', 'Reporting Date:', reportingDate, '', '', '', '', '', '', '', '', ''],
    ['', 'Project Headcount', projectInfo.headcount ?? '', '', '', '', '', '', '', '', '', ''],
    ['', '# people using AI', projectInfo.peopleUsingAI ?? '', '', '', '', '', '', '', '', '', ''],
    [...BLANK_ROW],
  ];
};

// Pre-fills one row per SDLC phase/activity question from this practice's
// questionnaire, matching the reference template (Category/Phases merged
// down each phase's row block, one blank spacer row between phases) so the
// user only has to fill in the data columns, not retype the structure.
const buildPhaseActivityRows = (
  practice: string,
  startRow: number,
  { getSDLCPhasesForPractice, getActivitiesForSDLCPhase }: QuestionnaireGetters
): { rows: (string | number)[][]; merges: XLSX.Range[] } => {
  const rows: (string | number)[][] = [];
  const merges: XLSX.Range[] = [];
  let currentRow = startRow;

  const phases = getSDLCPhasesForPractice(practice);

  phases.forEach((phase, phaseIndex) => {
    const activities = getActivitiesForSDLCPhase(practice, phase);
    if (activities.length === 0) return;

    const phaseLabel = phase.replace(/:/g, '');
    activities.forEach((activity, activityIndex) => {
      rows.push([
        activityIndex === 0 ? phaseLabel : '',
        activity,
        ...Array(TEMPLATE_COLUMNS.length - 2).fill(''),
      ]);
    });

    if (activities.length > 1) {
      merges.push({
        s: { r: currentRow, c: 0 },
        e: { r: currentRow + activities.length - 1, c: 0 },
      });
    }
    currentRow += activities.length;

    if (phaseIndex < phases.length - 1) {
      rows.push([...BLANK_ROW]);
      currentRow += 1;
    }
  });

  return { rows, merges };
};

const PRACTICE_SHEET_MERGES: XLSX.Range[] = [
  { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // Category/ Phases
  { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // SiDLC Activity/ Question
  { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Applicability
  { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Specific AI Tools used
  { s: { r: 0, c: 4 }, e: { r: 1, c: 4 } }, // Benefit to
  { s: { r: 0, c: 5 }, e: { r: 0, c: 6 } }, // Quantitative Benefits (spans Hours saved / Revenue Generated)
  { s: { r: 0, c: 7 }, e: { r: 1, c: 7 } }, // Qualitative Benefits
  { s: { r: 0, c: 8 }, e: { r: 1, c: 8 } }, // Accelarators  Used
  { s: { r: 0, c: 9 }, e: { r: 1, c: 9 } }, // Comments (Optional)
  { s: { r: 0, c: 10 }, e: { r: 1, c: 10 } }, // AI Adoption Score
  { s: { r: 0, c: 11 }, e: { r: 1, c: 11 } }, // % of Work done by AI
  { s: { r: 0, c: 12 }, e: { r: 1, c: 12 } }, // Access Type
  { s: { r: 0, c: 13 }, e: { r: 1, c: 13 } }, // No. of Licenses
  { s: { r: 0, c: 14 }, e: { r: 1, c: 14 } }, // Network Type
  { s: { r: 2, c: 1 }, e: { r: 2, c: 9 } }, // Instructional note
  { s: { r: 3, c: 0 }, e: { r: 9, c: 0 } }, // "Project Info" label
];

export const generateAndDownloadActivityTemplate = (
  practice: string,
  projectInfo: TemplateProjectInfo = {},
  questionnaire: QuestionnaireGetters,
  lookups: TemplateLookups
): void => {
  const workbook = XLSX.utils.book_new();

  const guidelines = buildGuidelinesLayout(lookups);
  const guidelinesSheet = XLSX.utils.aoa_to_sheet(guidelines.rows);
  guidelinesSheet['!cols'] = guidelines.cols;
  guidelinesSheet['!merges'] = guidelines.merges;
  XLSX.utils.book_append_sheet(workbook, guidelinesSheet, GUIDELINES_SHEET_NAME);

  const headerRows = buildPracticeSheetHeaderRows(projectInfo);
  const { rows: phaseRows, merges: phaseMerges } = buildPhaseActivityRows(
    practice,
    headerRows.length,
    questionnaire
  );

  const practiceSheet = XLSX.utils.aoa_to_sheet([...headerRows, ...phaseRows]);
  practiceSheet['!merges'] = [...PRACTICE_SHEET_MERGES, ...phaseMerges];
  XLSX.utils.book_append_sheet(
    workbook,
    practiceSheet,
    sanitizeSheetName(practice || 'Practice')
  );

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Activities_Template_${sanitizeSheetName(practice || 'Practice')}_${timestamp}.xlsx`);
};
