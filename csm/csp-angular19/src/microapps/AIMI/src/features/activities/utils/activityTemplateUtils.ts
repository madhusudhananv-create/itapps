import * as XLSX from 'xlsx';

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
const buildGuidelinesRows = (lookups: TemplateLookups): (string | number)[][] => {
  const left: GuidelineRow[] = [
    ['Applicability', '', ''],
    ['SN', 'Applicability', 'Definition'],
    ...APPLICABILITY_DEFINITIONS.map(
      ([value, definition], index): GuidelineRow => [index + 1, value, definition]
    ),
    ['', '', ''],
    ['AI Adoption Score', '', ''],
    ['Score', 'Label', 'Description'],
    ...lookups.aiAdoptionScores.map(
      (score): GuidelineRow => [score.value, score.label, score.description]
    ),
    ['', '', ''],
    ['', 'Qualitative Benefits', ''],
    ['', 'SN', 'Value'],
    ...lookups.qualitativeBenefits.map(
      (benefit, index): GuidelineRow => ['', index + 1, benefit]
    ),
  ];

  const right: GuidelineRow[] = [
    ['AI Tools used', ''],
    ['SN', 'Value'],
    ...lookups.aiTools.map((tool, index): GuidelineRow => [index + 1, tool]),
    [lookups.aiTools.length + 1, 'If Any other - ADD'],
    ['', ''],
    ['Accelerators Used', ''],
    ['SN', 'Value'],
    ...lookups.accelerators.map(
      (accelerator, index): GuidelineRow => [index + 1, accelerator]
    ),
    [lookups.accelerators.length + 1, 'If Any other - ADD'],
  ];

  const rowCount = Math.max(left.length, right.length);
  return Array.from({ length: rowCount }, (_, i) => [
    ...(left[i] ?? ['', '', '']),
    '',
    '',
    ...(right[i] ?? ['', '']),
  ]);
};

const BLANK_ROW = ['', '', '', '', '', '', '', '', '', '', '', ''];

const buildPracticeSheetHeaderRows = (
  projectInfo: TemplateProjectInfo
): (string | number)[][] => {
  const reportingDate = new Date().toLocaleDateString();

  return [
    [...TEMPLATE_COLUMNS.slice(0, 5), 'Quantitative Benefits', '', ...TEMPLATE_COLUMNS.slice(7)],
    ['', '', '', '', '', 'Hours saved', 'Revenue Generated', '', '', '', '', ''],
    [
      '',
      'Please refer Guidelines tab when filling  Applicability, AI Adoption Score, AI Tools used & Accelarators used.\n Add comment for Hours saved like ( daily/ per person/ per sprint / overall)',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
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
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
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

  const guidelinesSheet = XLSX.utils.aoa_to_sheet(buildGuidelinesRows(lookups));
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
