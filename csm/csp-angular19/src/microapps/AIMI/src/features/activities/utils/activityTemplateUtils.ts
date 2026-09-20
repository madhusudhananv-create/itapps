import * as XLSX from 'xlsx';

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

const buildGuidelinesRows = (): (string | number)[][] => [
  ['Applicability', '', '', '', '', 'AI Tools used', ''],
  ['SN', 'Applicability', 'Definition', '', '', 'SN', 'Value'],
  [
    1,
    'Yes',
    'The activity is currently being performed and is supported by AI capabilities.',
    '',
    '',
    1,
    'Chat GPT',
  ],
  [
    2,
    'No',
    'The activity is not feasible for AI enablement due to technical, operational, or strategic constraints.',
    '',
    '',
    2,
    'Bard',
  ],
  [
    3,
    'Activity NA',
    'The activity is out of scope and not part of the current operational or delivery framework.',
    '',
    '',
    3,
    'Claude',
  ],
  [
    4,
    'Customer NA',
    'The activity has been explicitly excluded based on customer requirements or preferences.',
    '',
    '',
    4,
    'Copy.ai',
  ],
  ['', '', '', '', '', 5, 'Dall E'],
  ['', '', '', '', '', 6, 'Git Hub Co pilot'],
  ['AI Adoption Score', '', '', '', '', 7, 'Grammarly'],
  ['Score', 'Label', 'Description', '', '', 8, 'Jasper'],
  [
    0,
    'No AI Adopted',
    'No AI tools or techniques are being used. Traditional manual processes are in place.',
    '',
    '',
    9,
    'Mid Journey',
  ],
  [
    1,
    'Basic Awareness',
    'The team is aware of AI capabilities, but no implementation has occurred. Planning or research phase.',
    '',
    '',
    10,
    'Notion',
  ],
  [
    2,
    'Initial Implementation',
    'Basic AI tools are used occasionally. Limited integration with existing processes.',
    '',
    '',
    11,
    'If Any other - ADD',
  ],
  [
    3,
    'Partial Adoption',
    'AI tools are regularly used and integrated into some workflows. Clear benefits are observed. Start on agents & agentic',
    '',
    '',
    '',
    '',
  ],
  [
    4,
    'Full Adoption',
    'AI is deeply integrated into most processes. Significant efficiency gains and innovation. Agentic Runops',
    '',
    '',
    'Accelators Used',
    '',
  ],
  [
    5,
    'Optimized/Automated',
    'Cutting-edge AI implementation. Industry-leading practices and maximum automation. ',
    '',
    '',
    'SN',
    'Value',
  ],
  ['', '', '', '', '', 1, 'Azure Devops'],
  ['', 'Qualitative Benefits ', '', '', '', 2, 'AWS code Pipeline'],
  ['', 'SN', 'Value', '', '', 3, 'Bamboo'],
  ['', 1, 'Better Compliance', '', '', 4, 'CircleCI'],
  ['', 2, 'Better Resource Utilization', '', '', 5, 'Git Hub action'],
  ['', 3, 'Enhanced Scalability', '', '', 6, 'Git hub CI / CD'],
  ['', 4, 'Enhanced Customer Experience', '', '', 7, 'Go CD'],
  ['', 5, 'Faster Delivery', '', '', 8, 'Jenkins'],
  ['', 6, 'Faster Time to Market', '', '', 9, 'Team City'],
  ['', 7, 'Improved Accuracy', '', '', 10, 'Travis CI'],
  ['', 8, 'Improved Collaboration', '', '', 11, 'If Any other - ADD'],
  ['', 9, 'Improved Decision-Making', '', '', '', ''],
  ['', 10, 'Improved Quality', '', '', '', ''],
  ['', 11, 'Improved Risk Management', '', '', '', ''],
  ['', 12, 'Improved Monitoring and Reporting', '', '', '', ''],
  ['', 13, 'Increased Efficiency', '', '', '', ''],
  ['', 14, 'Reduced Cost', '', '', '', ''],
  ['', 15, 'Reduced Manual Effort', '', '', '', ''],
];

const buildPracticeSheetRows = (
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
    ['', '', '', '', '', '', '', '', '', '', '', ''],
  ];
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
  projectInfo: TemplateProjectInfo = {}
): void => {
  const workbook = XLSX.utils.book_new();

  const guidelinesSheet = XLSX.utils.aoa_to_sheet(buildGuidelinesRows());
  XLSX.utils.book_append_sheet(workbook, guidelinesSheet, GUIDELINES_SHEET_NAME);

  const practiceSheet = XLSX.utils.aoa_to_sheet(buildPracticeSheetRows(projectInfo));
  practiceSheet['!merges'] = PRACTICE_SHEET_MERGES;
  XLSX.utils.book_append_sheet(
    workbook,
    practiceSheet,
    sanitizeSheetName(practice || 'Practice')
  );

  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Activities_Template_${sanitizeSheetName(practice || 'Practice')}_${timestamp}.xlsx`);
};
