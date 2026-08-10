import React, { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { Download, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList, ScatterChart, Scatter, ZAxis, ReferenceLine, ReferenceArea } from 'recharts';
import html2canvas from 'html2canvas';

const DashboardContainer = styled.div`
  padding: 1rem;
  background: #f8fafc;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.85rem 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
`;

const BackButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  &:hover { background: #2563eb; }
`;

const ContentContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const HEADER_BG = '#1e3a8a';

const TableContainer = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 70vh;
  width: 100%;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
  &::-webkit-scrollbar { height: 10px; }
  &::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 4px; }
`;

const Table = styled.table`
  width: 100%;
  min-width: max-content;
  border-collapse: collapse;
  font-size: 0.875rem;
  border: 2px solid #6b7280;
  table-layout: auto;
  th, td {
    word-wrap: break-word;
    overflow-wrap: break-word;
    word-break: break-word;
    white-space: normal;
    box-sizing: border-box;
    padding: 0.75rem 1rem;
    min-width: 4rem;
    max-width: 320px;
  }
`;

const CombinedCategoryTable = styled(Table)``;

const TableHeader = styled.th`
  background: ${HEADER_BG};
  padding: 1rem;
  text-align: center;
  vertical-align: middle;
  font-weight: 600;
  color: white;
  border: 1px solid #9ca3af;
  position: sticky;
  top: 0;
  z-index: 10;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
`;

const TableCell = styled.td`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  color: #374151;
  text-align: ${props => props.isNumeric ? 'center' : 'left'};
  vertical-align: top;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
`;

const RemarksTableCell = styled.td`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  background: ${props => props.$bg || 'transparent'};
  color: ${props => props.$textColor || '#374151'};
  font-weight: 500;
  vertical-align: top;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  white-space: normal;
  line-height: 1.4;
`;

const ChartWrap = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
`;

const BubbleChartCard = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const BubbleLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem 0;
  font-size: 0.8rem;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
`;
const BubbleLegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`;
const BubbleLegendDot = styled.span`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.$color};
  border: 1px solid #64748b;
  flex-shrink: 0;
`;

const TableRow = styled.tr`
  &:hover { background: #f9fafb; }
`;

const ExportButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover { background: #059669; }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BucketToggleButton = styled.button`
  background: ${props => props.$active ? '#6366f1' : '#e5e7eb'};
  color: ${props => props.$active ? 'white' : '#374151'};
  border: 1px solid ${props => props.$active ? '#4f46e5' : '#d1d5db'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
  &:hover { background: ${props => props.$active ? '#4f46e5' : '#d1d5db'}; }
`;

const BucketSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const BucketSectionTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  color: #1e293b;
`;

const ViewToggleWrap = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
`;

const RemarksUploadContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: #eff6ff;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const FileNameDisplay = styled.span`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 500;
`;

const RemarksBucketButton = styled.button`
  background: #0ea5e9;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  font-weight: 500;
  border-radius: 7px;
  box-shadow: 0 2px 6px rgba(14, 165, 233, 0.3);
  cursor: pointer;
  transition: background 0.2s;
  font-size: 1rem;
  white-space: nowrap;
  &:hover { background: #0284c7; }
`;

const RemarksBucketSection = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #bae6fd;
`;

const MainDashboardSection = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  & > * + * { margin-top: 1rem; }
`;

const MainDashboardTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
`;

const SearchInput = styled.input`
  width: 300px;
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ClearButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  &:hover { background: #4b5563; }
`;

const StatusContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
`;

function isDateGreaterThanOrEqual(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return false;
  const parseDate = (dateStr) => {
    if (dateStr === undefined || dateStr === null || dateStr === '') return null;
    if (typeof dateStr === 'number') {
      const excelEpoch = new Date(1900, 0, 1);
      return new Date(excelEpoch.getTime() + (dateStr - 2) * 24 * 60 * 60 * 1000);
    }
    if (typeof dateStr === 'string') {
      const trimmed = dateStr.trim();
      if (/^\d+$/.test(trimmed)) return parseDate(parseFloat(trimmed));
      const parts = trimmed.split('-');
      if (parts.length === 3) {
        if (parts[1].length === 3 && isNaN(parts[1])) {
          const [day, monthStr, year] = parts;
          const monthMap = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
          const month = monthMap[monthStr];
          if (month !== undefined && day && year) return new Date(year, month, day);
        } else {
          const [month, day, year] = parts;
          if (month && day && year) return new Date(year, month - 1, day);
        }
      }
      const slashParts = trimmed.split('/');
      if (slashParts.length === 3) {
        const [month, day, year] = slashParts;
        if (month && day && year) return new Date(year, month - 1, day);
      }
      if (trimmed.length >= 10 && trimmed[4] === '-') {
        const [year, month, day] = trimmed.split('-');
        if (year && month && day) return new Date(year, month - 1, day);
      }
      return new Date(trimmed);
    }
    return new Date(dateStr);
  };
  const date1 = parseDate(dateStr1);
  const date2 = parseDate(dateStr2);
  if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) return false;
  return date1 >= date2;
}

const buOrder = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];

// PERSPECTIVE column names (values from "CSAT received Report"); RATING_DESCRIPTION fills the cell
const PERSPECTIVE_COLUMNS = [
  'Overall Experience',
  'Quality of Delivery',
  'Risk Management & Responsiveness',
  'Thought Leadership',
  'Timeline Adherence',
  'Timely Resource Fulfillment',
  'Resource Competency'
];
const PERSPECTIVE_SET = new Set(PERSPECTIVE_COLUMNS.map(p => p.toLowerCase().trim()));
PERSPECTIVE_SET.add('quality of deliverables'); // treat same as Quality of Delivery

function normalizePerspective(p) {
  if (!p) return p;
  const s = (p || '').toString().trim();
  if (s.toLowerCase() === 'quality of deliverables' || s.toLowerCase() === 'quality of delivery') return 'Quality of Delivery';
  return s;
}

// Get value from row object by matching key (case-insensitive, flexible)
function getRowValue(row, ...candidates) {
  if (!row || typeof row !== 'object') return '';
  const keys = Object.keys(row);
  const lower = (s) => (s || '').toString().toLowerCase().replace(/\s|_/g, '');
  for (const name of candidates) {
    const nn = lower(name);
    const key = keys.find(k => {
      const kk = lower(k);
      return kk.includes(nn) || nn.includes(kk);
    });
    if (key != null && row[key] != null) return (row[key] || '').toString().trim();
  }
  return '';
}

// PERSPECTIVE columns must use RATING_DESCRIPTION only (not RATING). Match key that contains "description".
function getRatingDescriptionFromRow(row) {
  if (!row || typeof row !== 'object') return '';
  const lower = (s) => (s || '').toString().toLowerCase().replace(/\s|_/g, '');
  const key = Object.keys(row).find(k => {
    const kk = lower(k);
    return (kk.includes('rating') && kk.includes('description')) || kk === 'ratingdescription';
  });
  return key != null && row[key] != null ? (row[key] || '').toString().trim() : '';
}

// Categorize RATING_DESCRIPTION (from sheet "CSAT received Report") into negative/positive category per PERSPECTIVE.
// Uses overall sentiment: positive -> Strength only; negative -> Areas of improvement only.
// E.g. "Vignesh is great. He learns quickly and strives for continuous improvement of our work." -> positive -> Strength.
function categorizeRatingDescription(ratingDescription, perspective) {
  if (!ratingDescription || typeof ratingDescription !== 'string') {
    return { areasOfImprovement: '', strength: '' };
  }
  const description = ratingDescription.toLowerCase().trim();

  // Strong negative phrases (improvement needed / problem) – count as negative
  const negativePhrases = [
    'needs improvement', 'room for improvement', 'scope for improvement', 'could use improvement',
    'should be improved', 'must improve', 'needs to improve', 'lacks improvement',
    'not good', 'not great', 'could be better', 'should be better', 'not satisfied',
    'disappointed', 'frustrated', 'unsatisfied', 'poor', 'bad', 'terrible', 'awful',
    'worst', 'unhappy', 'angry', 'horrible', 'unacceptable', 'failing', 'broken',
    'issue', 'problem', 'concern', 'challenge', 'difficult', 'slow', 'delay',
    'lack of', 'missing', 'insufficient', 'missing'
  ];
  // Strong positive phrases – count as positive (incl. positive use of "improvement")
  const positivePhrases = [
    'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding',
    'perfect', 'satisfied', 'happy', 'pleased', 'impressed', 'exceeded', 'above',
    'beyond', 'exceptional', 'superb', 'brilliant', 'marvelous', 'top-notch',
    'first-class', 'premium', 'quality', 'professional', 'reliable',
    'learns quickly', 'strives for', 'continuous improvement', 'improvement of our work',
    'continuous improvement of', 'strives for continuous improvement', 'quick to learn'
  ];
  // Single words that are clearly negative (avoid matching inside positive phrases)
  const negativeWords = [
    'disappointed', 'frustrated', 'unsatisfied', 'poor', 'bad', 'terrible', 'awful',
    'worst', 'unhappy', 'horrible', 'unacceptable', 'failing', 'broken', 'insufficient'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const phrase of positivePhrases) {
    if (description.includes(phrase)) positiveScore += 1;
  }
  for (const phrase of negativePhrases) {
    if (description.includes(phrase)) negativeScore += 1;
  }
  for (const word of negativeWords) {
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (re.test(description)) negativeScore += 1;
  }

  // Strong positive lead: "X is great", "X was excellent", "learns quickly", "strives for continuous improvement" -> treat as clearly positive
  if (/\b(is|was|are|has been)\s+(great|excellent|good|amazing|outstanding|perfect)\b/.test(description) ||
      /\blearns\s+quickly\b/.test(description) ||
      /\bstrives\s+for\s+(continuous\s+)?improvement\b/.test(description)) {
    positiveScore += 2;
  }

  let areasOfImprovement = '';
  let strength = '';
  if (positiveScore > negativeScore) {
    strength = perspective;
  } else if (negativeScore > positiveScore) {
    areasOfImprovement = perspective;
  } else {
    if (description.length > 50) areasOfImprovement = perspective;
    else if (description.length < 30) strength = perspective;
  }
  return { areasOfImprovement, strength };
}

// Positive sentiment scorer for Top 10 Positive Feedback.
// Returns a numeric score (higher = more positive). Score <= 0 means not positive.
function scorePositiveSentiment(text) {
  if (!text || typeof text !== 'string') return -1;
  const desc = text.toLowerCase().trim();
  if (!desc || desc === 'na' || desc === 'n/a' || desc === '-' || desc.length < 3) return -1;

  const strongPositivePhrases = [
    'highly satisfied', 'high-quality work', 'high quality work', 'above and beyond',
    'exceeded expectations', 'exceeds expectations', 'outstanding work', 'outstanding performance',
    'top-notch', 'first-class', 'world-class', 'best in class',
    'delivery up to expectation', 'delivery up to expectations', 'able to deliver',
    'expected timelines', 'met all expectations', 'meets all expectations',
    'overall satisfied', 'very satisfied', 'extremely satisfied', 'completely satisfied',
    'very happy', 'extremely happy', 'really happy', 'truly happy',
    'some improvement', 'continuous improvement', 'strives for continuous improvement',
    'improvement of our work', 'improvement in our work'
  ];
  const positivePhrases = [
    'great', 'excellent', 'good', 'amazing', 'wonderful', 'fantastic', 'outstanding',
    'perfect', 'satisfied', 'happy', 'pleased', 'impressed', 'appreciate', 'appreciated',
    'appreciation', 'effective', 'efficiently', 'efficient', 'glad', 'grateful',
    'remarkable', 'exceptional', 'superb', 'brilliant', 'marvelous',
    'quality', 'professional', 'reliable', 'dependable', 'responsive',
    'proactive', 'dedicated', 'committed', 'diligent', 'thorough',
    'knowledgeable', 'skilled', 'competent', 'capable', 'talented',
    'timely', 'prompt', 'quick', 'fast', 'swift',
    'helpful', 'supportive', 'collaborative', 'cooperative',
    'smooth', 'seamless', 'well done', 'well managed', 'well handled',
    'positive', 'commendable', 'kudos', 'bravo', 'terrific',
    'delighted', 'thrilled', 'love', 'awesome', 'stellar',
    'learns quickly', 'quick to learn', 'fast learner',
    'good job', 'great job', 'nice job', 'good work', 'great work', 'nice work',
    'keep up', 'keep it up', 'well structured', 'well organized'
  ];
  const negativeWords = [
    'disappointed', 'frustrated', 'unsatisfied', 'poor', 'bad', 'terrible', 'awful',
    'worst', 'unhappy', 'horrible', 'unacceptable', 'failing', 'broken', 'insufficient',
    'slow', 'delay', 'delayed', 'late', 'lacking', 'weak', 'mediocre',
    'concern', 'problem', 'issue', 'bug', 'error', 'miss', 'missed', 'missing',
    'gap', 'gaps', 'struggle', 'difficult', 'challenge', 'challenged',
    'below expectation', 'below expectations', 'not good', 'not great', 'not satisfied',
    'not happy', 'could be better', 'should be better', 'needs improvement',
    'room for improvement', 'scope for improvement', 'needs to improve', 'must improve',
    'not up to the mark', 'not up to mark', 'not recommended',
    'average', 'ordinary', 'nothing special'
  ];
  const negationWords = ['not', 'no', 'never', 'neither', 'nor', 'hardly', 'barely', 'scarcely', "n't", 'dont', "don't", 'doesnt', "doesn't", 'didnt', "didn't", 'wasnt', "wasn't", 'werent', "weren't", 'isnt', "isn't", 'arent', "aren't", 'wont', "won't", 'cant', "can't", 'couldnt', "couldn't", 'shouldnt', "shouldn't", 'wouldnt', "wouldn't", 'without'];
  const negationNeutralizers = ['not a concern', 'not an issue', 'not a problem', 'no issues', 'no concerns', 'no problems', 'no complaints', 'nothing to complain', 'no worries'];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const phrase of negationNeutralizers) {
    if (desc.includes(phrase)) positiveScore += 3;
  }
  for (const phrase of strongPositivePhrases) {
    if (desc.includes(phrase)) positiveScore += 4;
  }
  for (const phrase of positivePhrases) {
    const re = new RegExp('\\b' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (re.test(desc)) {
      const idx = desc.search(re);
      const preceding = desc.substring(Math.max(0, idx - 20), idx).toLowerCase();
      const hasNegation = negationWords.some(nw => {
        const nre = new RegExp('\\b' + nw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        return nre.test(preceding);
      });
      const isNeutralized = negationNeutralizers.some(nn => desc.includes(nn) && desc.indexOf(nn) <= idx && desc.indexOf(nn) + nn.length >= idx);
      if (hasNegation && !isNeutralized) {
        negativeScore += 1;
      } else {
        positiveScore += 2;
      }
    }
  }
  for (const word of negativeWords) {
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (re.test(desc)) {
      const idx = desc.search(re);
      const preceding = desc.substring(Math.max(0, idx - 20), idx).toLowerCase();
      const hasNegation = negationWords.some(nw => {
        const nre = new RegExp('\\b' + nw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
        return nre.test(preceding);
      });
      const isNeutralized = negationNeutralizers.some(nn => desc.includes(nn));
      if (hasNegation && !isNeutralized) {
        positiveScore += 1;
      } else if (!isNeutralized) {
        negativeScore += 2;
      }
    }
  }

  if (/\b(is|was|are|has been|have been)\s+(great|excellent|good|amazing|outstanding|perfect|wonderful|fantastic|superb|brilliant|exceptional)\b/.test(desc)) {
    positiveScore += 3;
  }
  if (/\bappreciate\b|\bappreciation\b|\bglad\b|\bthank\b|\bthanks\b|\bthankful\b|\bgrateful\b/.test(desc)) {
    positiveScore += 2;
  }

  if (positiveScore <= 0 && negativeScore <= 0) return 0;
  return positiveScore - negativeScore;
}

const BU_ORDER = ['Healthcare', 'CIT', 'Tech', 'India & GCC'];

// Valid categories for Sub Areas of Improvement / Sub Strength / Neutral columns
const VALID_SUB_CATEGORIES = new Set([
  'Collaborative Partnership', 'Team Collaboration', 'Team Commitment',
  'Communication Skills', 'Proactive Approach', 'Resource On-boarding',
  'Relationship', 'Risk Management & Responsiveness', 'Thought Leadership',
  'Timeline Adherence', 'Timely Resource Fulfillment', 'Overall Experience',
  'Quality of Delivery', 'Resource Competency'
]);

// Normalize category name to match VALID_SUB_CATEGORIES (case-insensitive)
function normalizeSubCategory(cat) {
  if (!cat) return '';
  const trimmed = cat.toString().trim();
  for (const valid of VALID_SUB_CATEGORIES) {
    if (valid.toLowerCase() === trimmed.toLowerCase()) return valid;
  }
  return '';
}

// Load and parse the Sentiment_analysis_word_bank.xlsx into lookup structures.
// Returns { strengthEntries, improvementEntries, neutralEntries } where each entry is { keywords: string[], category: string }
async function loadSentimentWordBank() {
  const WORD_BANK_URL = (process.env.PUBLIC_URL || '') + '/data/Sentiment_analysis_word_bank.xlsx';
  try {
    const res = await fetch(WORD_BANK_URL);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: 'array' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (data.length < 2) return null;

    const strengthEntries = [];
    const improvementEntries = [];
    const neutralEntries = [];

    for (let i = 1; i < data.length; i++) {
      const desc = (data[i][1] || '').toString().trim().toLowerCase();
      if (!desc) continue;
      // Extract significant keywords (3+ chars) from the description
      const keywords = desc.split(/\s+/)
        .map(w => w.replace(/[^a-z0-9'-]/g, ''))
        .filter(w => w.length >= 3);
      if (keywords.length === 0) continue;

      const subStrength = normalizeSubCategory(data[i][2]);
      const subImprovement = normalizeSubCategory(data[i][3]);
      const subNeutral = normalizeSubCategory(data[i][4]);

      if (subStrength) strengthEntries.push({ keywords, fullText: desc, category: subStrength });
      if (subImprovement) improvementEntries.push({ keywords, fullText: desc, category: subImprovement });
      if (subNeutral) neutralEntries.push({ keywords, fullText: desc, category: subNeutral });
    }
    return { strengthEntries, improvementEntries, neutralEntries };
  } catch (err) {
    console.error('Failed to load Sentiment_analysis_word_bank.xlsx:', err);
    return null;
  }
}

// Score how well a word bank entry matches a given description (0 = no match)
function matchScore(entryKeywords, entryFullText, targetDesc) {
  if (!targetDesc) return 0;
  const targetLower = targetDesc.toLowerCase().trim();
  // Exact full-text match gets highest score
  if (targetLower === entryFullText) return 1000;
  // High partial containment: target contains the full entry text
  if (targetLower.includes(entryFullText)) return 500 + entryKeywords.length;
  // Keyword overlap scoring
  const targetWords = new Set(targetLower.split(/\s+/).map(w => w.replace(/[^a-z0-9'-]/g, '')).filter(w => w.length >= 3));
  let matched = 0;
  for (const kw of entryKeywords) {
    if (targetWords.has(kw)) matched++;
    else {
      for (const tw of targetWords) {
        if (tw.includes(kw) || kw.includes(tw)) { matched += 0.5; break; }
      }
    }
  }
  const ratio = entryKeywords.length > 0 ? matched / entryKeywords.length : 0;
  // Require at least 30% keyword overlap for a meaningful match
  return ratio >= 0.3 ? matched * 10 + ratio * 50 : 0;
}

// Classify a RATING_DESCRIPTION using the word bank entries.
// Returns { subStrength: string, subImprovement: string, subNeutral: string }
function classifyWithWordBank(ratingDescription, perspective, wordBank) {
  if (!ratingDescription || !wordBank) return { subStrength: '', subImprovement: '', subNeutral: '' };
  const desc = ratingDescription.toString().trim();
  if (!desc || desc.toLowerCase() === 'na' || desc.toLowerCase() === 'n/a') return { subStrength: '', subImprovement: '', subNeutral: '' };

  const findBestMatch = (entries) => {
    let bestScore = 0;
    let bestCategory = '';
    for (const entry of entries) {
      const score = matchScore(entry.keywords, entry.fullText, desc);
      if (score > bestScore) { bestScore = score; bestCategory = entry.category; }
    }
    return bestScore >= 5 ? bestCategory : '';
  };

  let subStrength = findBestMatch(wordBank.strengthEntries);
  let subImprovement = findBestMatch(wordBank.improvementEntries);
  let subNeutral = findBestMatch(wordBank.neutralEntries);

  // Fallback: use the existing simple sentiment analysis with the perspective as category
  if (!subStrength && !subImprovement && !subNeutral) {
    const cat = categorizeRatingDescription(desc, perspective);
    if (cat.strength && VALID_SUB_CATEGORIES.has(cat.strength)) subStrength = cat.strength;
    if (cat.areasOfImprovement && VALID_SUB_CATEGORIES.has(cat.areasOfImprovement)) subImprovement = cat.areasOfImprovement;
  }

  return { subStrength, subImprovement, subNeutral };
}

// Legend: Delta > 50% Strength; 20% ≤ Delta ≤ 50% Need to build on; Delta ≤ -50% Area for Improvement; -50% < Delta ≤ -20% Needs focus; -19% ≤ Delta ≤ 19% Subjective Decision
const REMARKS_COLORS = {
  'Strength': { bg: '#006400', text: '#ffffff' },
  'Need to build on (Potential to become Strength)': { bg: '#90EE90', text: '#1f2937' },
  'Area for Improvement': { bg: '#DC2626', text: '#ffffff' },
  'Needs focus (Likely to become Area of Improvement)': { bg: '#F59E0B', text: '#1f2937' },
  'Subjective Decision': { bg: '#E5E7EB', text: '#1f2937' }
};
const REMARKS_KEYS = Object.keys(REMARKS_COLORS);
function getRemarksCellProps(remarks) {
  const r = (remarks || '').toString().trim();
  const key = REMARKS_KEYS.find(k => k.toLowerCase() === r.toLowerCase());
  const style = key ? REMARKS_COLORS[key] : null;
  if (!style) return { $bg: 'transparent', $textColor: '#374151' };
  return { $bg: style.bg, $textColor: style.text };
}
function getRemarksExcelFill(remarks) {
  const r = (remarks || '').toString().trim().toLowerCase();
  const map = {
    'strength': 'FF006400',
    'need to build on (potential to become strength)': 'FF90EE90',
    'area for improvement': 'FFDC2626',
    'needs focus (likely to become area of improvement)': 'FFF59E0B',
    'subjective decision': 'FFE5E7EB'
  };
  const argb = map[r];
  return argb ? { argb } : null;
}
const COMBINED_GREEN = '#006400';
const COMBINED_RED = '#DC2626';
const ARROW_UP_COLOR = '#16a34a';
const ARROW_DOWN_COLOR = '#dc2626';
function getDeltaPercentFontColor(remarks) {
  const r = (remarks || '').toString().trim();
  const key = REMARKS_KEYS.find(k => k.toLowerCase() === r.toLowerCase());
  const style = key ? REMARKS_COLORS[key] : null;
  return style ? style.bg : '#374151';
}
function getDeltaArrowAndDisplay(deltaPercent) {
  const val = deltaPercent != null ? (typeof deltaPercent === 'number' ? deltaPercent : parseFloat(deltaPercent)) : null;
  if (val == null || isNaN(val)) return { arrow: '', display: '', arrowColor: null };
  if (val > 0) return { arrow: '↑', display: `${val}`, arrowColor: ARROW_UP_COLOR };
  if (val < 0) return { arrow: '↓', display: `${val}`, arrowColor: ARROW_DOWN_COLOR };
  return { arrow: '−', display: `${val}`, arrowColor: '#6b7280' };
}

const PCSATQualitativeAnalysisDashboard = ({ excelData: uploadedExcelData, acsatCycleStartDateFormatted, onBack }) => {
  const [processedData, setProcessedData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAreasOfImprovementBucket, setShowAreasOfImprovementBucket] = useState(false);
  const [areasBucketViewType, setAreasBucketViewType] = useState('account');
  const [remarksFileName, setRemarksFileName] = useState('');
  const [remarksData, setRemarksData] = useState([]);
  const remarksInputRef = useRef(null);
  const combinedChartRef = useRef(null);
  const bubbleChartRef = useRef(null);
  const bubbleChartInnerRef = useRef(null);
  const [bubbleChartSize, setBubbleChartSize] = useState({ width: 0, height: 0 });
  const [showRemarksBucketAnalysis, setShowRemarksBucketAnalysis] = useState(false);
  const [sentimentWordBank, setSentimentWordBank] = useState(null);
  const [top10PositiveFeedback, setTop10PositiveFeedback] = useState([]);

  // Load Sentiment_analysis_word_bank.xlsx once on mount
  useEffect(() => {
    loadSentimentWordBank().then(wb => {
      if (wb) {
        console.log('Sentiment word bank loaded:', {
          strengthEntries: wb.strengthEntries.length,
          improvementEntries: wb.improvementEntries.length,
          neutralEntries: wb.neutralEntries.length
        });
        setSentimentWordBank(wb);
      }
    });
  }, []);

  // Helper: compute top 10 positive feedback from object-row arrays (uploaded data)
  const computeTop10PositiveFromObjects = (data, cycleStart) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const seen = new Set();
    const scored = [];
    data.forEach(row => {
      const ratingDesc = getRatingDescriptionFromRow(row);
      if (!ratingDesc || ratingDesc.toLowerCase() === 'na' || ratingDesc.toLowerCase() === 'n/a' || ratingDesc.trim().length < 5) return;
      if (cycleStart) {
        const sentDate = getRowValue(row, 'csat sent date', 'css sent date', 'sent date');
        const receivedDate = getRowValue(row, 'csat received date', 'css received date', 'received date');
        if (sentDate && !isDateGreaterThanOrEqual(sentDate, cycleStart)) return;
        if (receivedDate && !isDateGreaterThanOrEqual(receivedDate, cycleStart)) return;
      }
      const dedupeKey = ratingDesc.toLowerCase().trim();
      if (seen.has(dedupeKey)) return;
      seen.add(dedupeKey);
      const score = scorePositiveSentiment(ratingDesc);
      if (score <= 0) return;
      const bu = getRowValue(row, 'business unit', 'bussiness unit');
      const customerName = getRowValue(row, 'customer name', 'cust_nm', 'account name', 'CUSTOMER NAME', 'Customer Name');
      const projectName = getRowValue(row, 'project name', 'project name', 'project') || '';
      const respondentName = getRowValue(row, 'respondent name', 'respondent name') || '';
      scored.push({ businessUnit: bu, customerName, projectName, respondentName, ratingDescription: ratingDesc, score });
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 10).map((item, idx) => ({ sNo: idx + 1, ...item }));
  };

  useEffect(() => {
    const cycleStart = acsatCycleStartDateFormatted || null;

    const processFromUploadedData = () => {
      // Use only sheet "CSAT received Report" for perspective columns; group by CUSTOMER_ID/CUST_ID
      const sheetNames = uploadedExcelData?.sheetNames || [];
      const firstIsReceived = /csat\s*received\s*report/i.test((sheetNames[0] || '').trim());
      const secondIsReceived = /csat\s*received\s*report/i.test((sheetNames[1] || '').trim());
      const data = firstIsReceived
        ? uploadedExcelData?.data
        : secondIsReceived
          ? uploadedExcelData?.secondSheetData
          : uploadedExcelData?.data;
      if (!Array.isArray(data) || data.length === 0) return [];
      const byRespondent = new Map();
      data.forEach(row => {
        const perspective = getRowValue(row, 'perspective');
        if (!perspective || !PERSPECTIVE_SET.has(perspective.toLowerCase().trim())) return;
        if (cycleStart) {
          const sentDate = getRowValue(row, 'csat sent date', 'css sent date', 'sent date');
          const receivedDate = getRowValue(row, 'csat received date', 'css received date', 'received date');
          if (sentDate && !isDateGreaterThanOrEqual(sentDate, cycleStart)) return;
          if (receivedDate && !isDateGreaterThanOrEqual(receivedDate, cycleStart)) return;
        }
        const customerId = getRowValue(row, 'customer_id', 'cust_id', 'customer id');
        const bu = getRowValue(row, 'business unit', 'bussiness unit');
        const customerName = getRowValue(row, 'customer name', 'cust_nm', 'account name', 'CUSTOMER NAME', 'Customer Name');
        const respondentName = getRowValue(row, 'respondent name', 'respondent name') || 'Unknown';
        const projectName = getRowValue(row, 'project name', 'project name', 'project') || '';
        const ratingDesc = getRatingDescriptionFromRow(row);
        if (!customerId && !customerName) return;
        const key = `${customerId || `name_${customerName}`}|||${respondentName}|||${projectName}`;
        if (!byRespondent.has(key)) {
          byRespondent.set(key, {
            customerId: customerId || `name_${customerName}`,
            businessUnit: bu,
            customerName,
            respondentName,
            projectName,
            areasOfImprovementSet: new Set(),
            strengthSet: new Set(),
            subAreasOfImprovementSet: new Set(),
            subStrengthSet: new Set(),
            subNeutralSet: new Set(),
            ...Object.fromEntries(PERSPECTIVE_COLUMNS.map(p => [p, '']))
          });
        }
        const rec = byRespondent.get(key);
        const persNorm = normalizePerspective(perspective);
        if (PERSPECTIVE_COLUMNS.includes(persNorm)) {
          const existing = rec[persNorm];
          rec[persNorm] = existing ? `${existing} | ${ratingDesc}` : ratingDesc;
        }
        const cat = categorizeRatingDescription(ratingDesc, persNorm);
        if (cat.areasOfImprovement) {
          rec.areasOfImprovementSet.add(cat.areasOfImprovement);
          rec.strengthSet.delete(cat.areasOfImprovement);
        }
        if (cat.strength) {
          rec.strengthSet.add(cat.strength);
          rec.areasOfImprovementSet.delete(cat.strength);
        }
        // Classify for Sub columns using word bank
        if (ratingDesc && sentimentWordBank) {
          const subCat = classifyWithWordBank(ratingDesc, persNorm, sentimentWordBank);
          if (subCat.subImprovement) rec.subAreasOfImprovementSet.add(subCat.subImprovement);
          if (subCat.subStrength) rec.subStrengthSet.add(subCat.subStrength);
          if (subCat.subNeutral) rec.subNeutralSet.add(subCat.subNeutral);
        }
      });
      return Array.from(byRespondent.values()).map((r, i) => {
        const { areasOfImprovementSet, strengthSet, subAreasOfImprovementSet, subStrengthSet, subNeutralSet, ...rest } = r;
        return {
          id: i + 1,
          ...rest,
          areasOfImprovement: areasOfImprovementSet ? Array.from(areasOfImprovementSet).filter(Boolean).join(', ') : '',
          strength: strengthSet ? Array.from(strengthSet).filter(Boolean).join(', ') : '',
          subAreasOfImprovement: subAreasOfImprovementSet ? Array.from(subAreasOfImprovementSet).filter(Boolean).join(', ') : '',
          subStrength: subStrengthSet ? Array.from(subStrengthSet).filter(Boolean).join(', ') : '',
          subNeutral: subNeutralSet ? Array.from(subNeutralSet).filter(Boolean).join(', ') : ''
        };
      });
    };

    if (uploadedExcelData && (Array.isArray(uploadedExcelData.data) || Array.isArray(uploadedExcelData.secondSheetData))) {
      try {
        setLoading(true);
        setError(null);
        const list = processFromUploadedData();
        setProcessedData(list);
        setFilteredData(list);
        // Compute top 10 positive feedback from the same raw sheet data
        const sheetNames = uploadedExcelData?.sheetNames || [];
        const firstIsReceived = /csat\s*received\s*report/i.test((sheetNames[0] || '').trim());
        const secondIsReceived = /csat\s*received\s*report/i.test((sheetNames[1] || '').trim());
        const rawData = firstIsReceived
          ? uploadedExcelData?.data
          : secondIsReceived
            ? uploadedExcelData?.secondSheetData
            : uploadedExcelData?.data;
        setTop10PositiveFeedback(computeTop10PositiveFromObjects(rawData, cycleStart));
      } catch (err) {
        console.error('Error processing uploaded PCSAT Qualitative data:', err);
        setError(err.message || 'Failed to process uploaded file.');
        setProcessedData([]);
        setFilteredData([]);
        setTop10PositiveFeedback([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    const REFERENCE_FILE_URL = (process.env.PUBLIC_URL || '') + '/data/New_customer_feedback_analysis_New.xlsx';
    const RECEIVED_SHEET_NAMES = ['CSAT received Report', 'CSAT received Report '];

    const processReferenceFile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(REFERENCE_FILE_URL);
        if (!res.ok) {
          throw new Error('Reference file not found. Place New_customer_feedback_analysis_New.xlsx in public/data/');
        }
        const arrayBuffer = await res.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });

        const findCol = (headers, ...candidates) => {
          const lower = (h) => (h || '').toString().toLowerCase().replace(/\s|_/g, '');
          for (const name of candidates) {
            const nn = lower(name);
            const idx = headers.findIndex(h => {
              const hh = lower(h);
              return hh.includes(nn) || nn.includes(hh);
            });
            if (idx !== -1) return idx;
          }
          return -1;
        };
        const findRatingDescriptionCol = (headers) => {
          const lower = (h) => (h || '').toString().toLowerCase().replace(/\s|_/g, '');
          return headers.findIndex(h => {
            const hh = lower(h);
            return (hh.includes('rating') && hh.includes('description')) || hh === 'ratingdescription';
          });
        };

        const byRespondent = new Map();
        let ws = null;
        for (const name of RECEIVED_SHEET_NAMES) {
          if (wb.SheetNames.includes(name)) {
            ws = wb.Sheets[name];
            break;
          }
        }
        if (!ws) {
          setProcessedData([]);
          setFilteredData([]);
          setLoading(false);
          return;
        }
        const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (jsonData.length < 2) {
          setProcessedData([]);
          setFilteredData([]);
          setLoading(false);
          return;
        }
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1);
        const buIdx = findCol(headers, 'business unit', 'bussiness unit');
        const custIdIdx = findCol(headers, 'customer_id', 'cust_id', 'customer id');
        const custNameIdx = findCol(headers, 'customer name', 'cust_nm', 'account name', 'CUSTOMER NAME', 'Customer Name');
        const respondentNameIdx = findCol(headers, 'respondent name', 'respondent name');
        const projectNameIdx = findCol(headers, 'project name', 'project name', 'project');
        const perspectiveIdx = findCol(headers, 'perspective');
        const ratingDescIdx = findRatingDescriptionCol(headers);
        const sentIdx = findCol(headers, 'csat sent date', 'css sent date', 'sent date');
        const receivedIdx = findCol(headers, 'csat received date', 'css received date', 'received date');
        if (perspectiveIdx === -1 || ratingDescIdx === -1) {
          setProcessedData([]);
          setFilteredData([]);
          setLoading(false);
          return;
        }
        for (const row of dataRows) {
          const perspective = (row[perspectiveIdx] || '').toString().trim();
          if (!perspective || !PERSPECTIVE_SET.has(perspective.toLowerCase())) continue;
          if (cycleStart) {
            const sentDate = row[sentIdx];
            const receivedDate = row[receivedIdx];
            if (sentDate && !isDateGreaterThanOrEqual(sentDate, cycleStart)) continue;
            if (receivedDate && !isDateGreaterThanOrEqual(receivedDate, cycleStart)) continue;
          }
          const customerId = (row[custIdIdx] ?? row[custNameIdx] ?? '').toString().trim();
          const bu = (row[buIdx] || '').toString().trim();
          const customerName = (row[custNameIdx] || '').toString().trim();
          const respondentName = (row[respondentNameIdx] || '').toString().trim() || 'Unknown';
          const projectName = projectNameIdx >= 0 ? (row[projectNameIdx] || '').toString().trim() : '';
          const ratingDesc = (row[ratingDescIdx] || '').toString().trim();
          if (!customerId && !customerName) continue;
          const key = `${customerId || `name_${customerName}`}|||${respondentName}|||${projectName}`;
          if (!byRespondent.has(key)) {
            byRespondent.set(key, {
              customerId: customerId || `name_${customerName}`,
              businessUnit: bu,
              customerName,
              respondentName,
              projectName,
              areasOfImprovementSet: new Set(),
              strengthSet: new Set(),
              subAreasOfImprovementSet: new Set(),
              subStrengthSet: new Set(),
              subNeutralSet: new Set(),
              ...Object.fromEntries(PERSPECTIVE_COLUMNS.map(p => [p, '']))
            });
          }
          const rec = byRespondent.get(key);
          const persNorm = normalizePerspective(perspective);
          if (PERSPECTIVE_COLUMNS.includes(persNorm)) {
            const existing = rec[persNorm];
            rec[persNorm] = existing ? `${existing} | ${ratingDesc}` : ratingDesc;
          }
          const cat = categorizeRatingDescription(ratingDesc, persNorm);
          if (cat.areasOfImprovement) {
            rec.areasOfImprovementSet.add(cat.areasOfImprovement);
            rec.strengthSet.delete(cat.areasOfImprovement);
          }
          if (cat.strength) {
            rec.strengthSet.add(cat.strength);
            rec.areasOfImprovementSet.delete(cat.strength);
          }
          // Classify for Sub columns using word bank
          if (ratingDesc && sentimentWordBank) {
            const subCat = classifyWithWordBank(ratingDesc, persNorm, sentimentWordBank);
            if (subCat.subImprovement) rec.subAreasOfImprovementSet.add(subCat.subImprovement);
            if (subCat.subStrength) rec.subStrengthSet.add(subCat.subStrength);
            if (subCat.subNeutral) rec.subNeutralSet.add(subCat.subNeutral);
          }
        }
        const list = Array.from(byRespondent.values()).map((r, i) => {
          const { areasOfImprovementSet, strengthSet, subAreasOfImprovementSet, subStrengthSet, subNeutralSet, ...rest } = r;
          return {
            id: i + 1,
            ...rest,
            areasOfImprovement: areasOfImprovementSet ? Array.from(areasOfImprovementSet).filter(Boolean).join(', ') : '',
            strength: strengthSet ? Array.from(strengthSet).filter(Boolean).join(', ') : '',
            subAreasOfImprovement: subAreasOfImprovementSet ? Array.from(subAreasOfImprovementSet).filter(Boolean).join(', ') : '',
            subStrength: subStrengthSet ? Array.from(subStrengthSet).filter(Boolean).join(', ') : '',
            subNeutral: subNeutralSet ? Array.from(subNeutralSet).filter(Boolean).join(', ') : ''
          };
        });
        setProcessedData(list);
        setFilteredData(list);
        // Compute top 10 positive feedback from reference file rows
        const objRows = dataRows.map(row => {
          const obj = {};
          headers.forEach((h, i) => { if (h != null) obj[h] = row[i]; });
          return obj;
        });
        setTop10PositiveFeedback(computeTop10PositiveFromObjects(objRows, cycleStart));
      } catch (err) {
        console.error('Error loading PCSAT Qualitative reference file:', err);
        setError(err.message || 'Failed to load reference file. Place New_customer_feedback_analysis_New.xlsx in public/data/');
        setProcessedData([]);
        setFilteredData([]);
        setTop10PositiveFeedback([]);
      } finally {
        setLoading(false);
      }
    };

    processReferenceFile();
  }, [acsatCycleStartDateFormatted, uploadedExcelData, sentimentWordBank]);

  useEffect(() => {
    let filtered = processedData;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = processedData.filter(row =>
        (row.customerName || '').toLowerCase().includes(term)
      );
    }
    filtered = [...filtered].sort((a, b) => {
      const aBU = (a.businessUnit || '').toString().trim();
      const bBU = (b.businessUnit || '').toString().trim();
      const aIndex = buOrder.findIndex(bu => bu.toLowerCase() === aBU.toLowerCase() || aBU.toLowerCase().includes(bu.toLowerCase()) || bu.toLowerCase().includes(aBU.toLowerCase()));
      const bIndex = buOrder.findIndex(bu => bu.toLowerCase() === bBU.toLowerCase() || bBU.toLowerCase().includes(bu.toLowerCase()) || bu.toLowerCase().includes(bBU.toLowerCase()));
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
    const withId = filtered.map((row, index) => ({ ...row, id: index + 1 }));
    setFilteredData(withId);
  }, [searchTerm, processedData]);

  useEffect(() => {
    try {
      const dataStr = sessionStorage.getItem('pcsatRemarksQualitativeData');
      const fileName = sessionStorage.getItem('pcsatRemarksQualitativeFileName');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        setRemarksData(Array.isArray(data) ? data : []);
      }
      if (fileName) setRemarksFileName(fileName);
    } catch (err) {
      console.warn('Could not restore remarks from sessionStorage:', err);
    }
  }, []);

  // (top10PositiveFeedback is computed inside the main useEffect for both uploaded and reference file paths)

  const downloadTop10PositiveFeedbackExcel = async () => {
    if (!top10PositiveFeedback.length) return;
    try {
      const workbook = new ExcelJS.Workbook();
      const ws = workbook.addWorksheet('Top 10 Positive Feedback');
      const headerRow = ws.addRow(['S No.', 'Business Unit', 'Account Name', 'Project Name', 'Respondent Name', 'Top 10 Positive Feedback']);
      headerRow.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
      });
      top10PositiveFeedback.forEach(item => {
        const row = ws.addRow([item.sNo, item.businessUnit, item.customerName, item.projectName, item.respondentName, item.ratingDescription]);
        row.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle', wrapText: true, horizontal: colNumber === 1 ? 'center' : 'left' };
          cell.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
          if (colNumber === 6) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6FFED' } };
            cell.font = { color: { argb: 'FF15803D' } };
          }
        });
      });
      ws.columns = [
        { width: 8 },
        { width: 20 },
        { width: 25 },
        { width: 25 },
        { width: 22 },
        { width: 60 }
      ];
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PCSAT_Top10_Positive_Feedback_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading Top 10 Positive Feedback Excel:', err);
    }
  };

  const downloadExcel = async () => {
    const hasMain = filteredData && filteredData.length > 0;
    const hasRemarks = remarksData && remarksData.length > 0;
    if (!hasMain && !hasRemarks) {
      alert('No data available to download. Add qualitative data and/or upload Remarks for different perspectives.');
      return;
    }
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const fileName = `PCSAT_Qualitative_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
    try {
      if (hasRemarks) {
        const workbook = new ExcelJS.Workbook();
        const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        const pcsatHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
        const headerStyle = { horizontal: 'center', vertical: 'middle', wrapText: true };
        const applyHeaderRow = (ws, colCount, fill) => {
          const headerFill = fill || pcsatHeaderFill;
          const row = ws.getRow(1);
          row.height = 28;
          const n = colCount != null ? colCount : (row.cellCount || 0);
          for (let col = 1; col <= n; col++) {
            const c = row.getCell(col);
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
            c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            c.alignment = headerStyle;
            c.border = thinBorder;
          }
        };
        if (hasMain) {
          const wsMain = workbook.addWorksheet('PCSAT Qual. analysis', { views: [{ state: 'frozen', ySplit: 1 }] });
          const mainHeaders = ['Sr.No.', 'Business Unit', 'Account Name', 'Respondent Name', 'Project Name', ...PERSPECTIVE_COLUMNS, 'Areas of improvement', 'Strength', 'Sub Areas of Improvement', 'Sub Strength', 'Neutral'];
          wsMain.addRow(mainHeaders);
          applyHeaderRow(wsMain, mainHeaders.length);
          // Color the Sub columns headers distinctly
          const subAoiIdx = mainHeaders.indexOf('Sub Areas of Improvement') + 1;
          const subStrIdx = mainHeaders.indexOf('Sub Strength') + 1;
          const subNeuIdx = mainHeaders.indexOf('Neutral') + 1;
          const headerRow = wsMain.getRow(1);
          if (subAoiIdx > 0) { headerRow.getCell(subAoiIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } }; }
          if (subStrIdx > 0) { headerRow.getCell(subStrIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } }; }
          if (subNeuIdx > 0) { headerRow.getCell(subNeuIdx).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } }; }
          const wrapText = { wrapText: true };
          filteredData.forEach(row => {
            const rowNum = wsMain.addRow([
              row.id,
              row.businessUnit || '',
              row.customerName || '',
              row.respondentName || '',
              row.projectName || '',
              ...PERSPECTIVE_COLUMNS.map(p => row[p] || ''),
              row.areasOfImprovement || '',
              row.strength || '',
              row.subAreasOfImprovement || '',
              row.subStrength || '',
              row.subNeutral || ''
            ]);
            rowNum.eachCell((cell, colNumber) => {
              cell.border = thinBorder;
              cell.alignment = { vertical: 'middle', ...wrapText, horizontal: colNumber === 1 ? 'center' : 'left' };
              // Color text for sub columns
              if (colNumber === subAoiIdx && cell.value) cell.font = { color: { argb: 'FFB91C1C' } };
              if (colNumber === subStrIdx && cell.value) cell.font = { color: { argb: 'FF15803D' } };
              if (colNumber === subNeuIdx && cell.value) cell.font = { color: { argb: 'FF4B5563' } };
            });
          });
          const mainColCount = mainHeaders.length;
          const mainWidths = [8, 18, 28, 22, 28, ...PERSPECTIVE_COLUMNS.map(() => 35), 35, 35, 30, 30, 30];
          for (let c = 1; c <= mainColCount; c++) wsMain.getColumn(c).width = mainWidths[c - 1] ?? 18;
        }
        const wsRemarks = workbook.addWorksheet('Remarks for different perspectives');
        const remarksHeaders = remarksData[0] ? Object.keys(remarksData[0]) : [];
        if (remarksHeaders.length) wsRemarks.addRow(remarksHeaders);
        applyHeaderRow(wsRemarks, remarksHeaders.length);
        remarksData.forEach(row => {
          const rowNum = wsRemarks.addRow(remarksHeaders.map(h => row[h] ?? ''));
          rowNum.eachCell((cell) => {
            cell.border = thinBorder;
            cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
          });
        });
        for (let c = 1; c <= remarksHeaders.length; c++) wsRemarks.getColumn(c).width = 28;
        const combinedData = combinedRemarksByCategory || [];
        const wsCombined = workbook.addWorksheet('Combined Category (Account-wise)');
        const combinedHeaders = ['Category', '# Positive Customer Comments (P)', '# Negative Customer Comments (N)', 'P%', 'N%', 'Delta %', 'Remarks'];
        wsCombined.addRow(combinedHeaders);
        const combinedRow1 = wsCombined.getRow(1);
        combinedRow1.height = 28;
        const darkCornflowerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
        for (let col = 1; col <= combinedHeaders.length; col++) {
          const c = combinedRow1.getCell(col);
          c.fill = darkCornflowerFill;
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
          c.border = thinBorder;
        }
        const greenArgb = 'FF006400';
        const redArgb = 'FFDC2626';
        combinedData.forEach((row) => {
          const { arrow, display } = getDeltaArrowAndDisplay(row.deltaPercent);
          const deltaDisplay = arrow && display !== '' ? `${arrow} ${display}` : (row.deltaPercent ?? '');
          const rowNum = wsCombined.addRow([
            row.category || '',
            row.P ?? 0,
            row.N ?? 0,
            row.Ppercent ?? '',
            row.Npercent ?? '',
            deltaDisplay,
            row.remarks || ''
          ]);
          rowNum.alignment = { vertical: 'middle' };
          const wrapAlign = { wrapText: true };
          rowNum.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', ...wrapAlign };
          rowNum.getCell(1).border = thinBorder;
          rowNum.getCell(2).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
          rowNum.getCell(2).font = { color: { argb: greenArgb }, bold: true };
          rowNum.getCell(2).border = thinBorder;
          rowNum.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
          rowNum.getCell(3).font = { color: { argb: redArgb }, bold: true };
          rowNum.getCell(3).border = thinBorder;
          rowNum.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
          rowNum.getCell(4).font = { color: { argb: greenArgb }, bold: true };
          rowNum.getCell(4).border = thinBorder;
          rowNum.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
          rowNum.getCell(5).font = { color: { argb: redArgb }, bold: true };
          rowNum.getCell(5).border = thinBorder;
          const deltaCell = rowNum.getCell(6);
          deltaCell.alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
          deltaCell.border = thinBorder;
          const { arrowColor } = getDeltaArrowAndDisplay(row.deltaPercent);
          if (arrowColor) {
            const excelColor = arrowColor === ARROW_UP_COLOR ? 'FF16A34A' : (arrowColor === ARROW_DOWN_COLOR ? 'FFDC2626' : 'FF6B7280');
            deltaCell.font = { color: { argb: excelColor }, bold: true };
          } else {
            const remarksFill = getRemarksExcelFill(row.remarks);
            if (remarksFill) deltaCell.font = { color: { argb: remarksFill.argb }, bold: true };
          }
          const remarksCol = 7;
          const cell = rowNum.getCell(remarksCol);
          cell.alignment = { horizontal: 'left', vertical: 'middle', ...wrapAlign };
          cell.border = thinBorder;
          if (remarksFill) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: remarksFill };
            const darkBg = remarksFill.argb === 'FF006400' || remarksFill.argb === 'FFDC2626';
            cell.font = { color: { argb: darkBg ? 'FFFFFFFF' : 'FF1f2937' }, bold: true };
          }
        });
        [20, 28, 28, 10, 10, 12, 18].forEach((w, i) => { wsCombined.getColumn(i + 1).width = w; });
        const bucketToRows = (arr, groupLabel) =>
          (arr || []).map((row, idx) => ({
            'Category': row.category || '',
            'Sr. No.': idx + 1,
            'Count': row.count ?? '',
            [groupLabel]: (row.groups || []).join(', ') || '-',
            'Respondent Names': (row.respondentNames || []).join(', ') || '-'
          }));
        [
          { name: 'Sub AoI Account-wise', data: remarksSubImpAccountData, label: 'Accounts' },
          { name: 'Sub AoI BU-wise', data: remarksSubImpBUData, label: 'Business Units' },
          { name: 'Sub Strength Account-wise', data: remarksSubStrAccountData, label: 'Accounts' },
          { name: 'Sub Strength BU-wise', data: remarksSubStrBUData, label: 'Business Units' }
        ].forEach(({ name, data, label }) => {
          const ws = workbook.addWorksheet(name.slice(0, 31));
          const rows = bucketToRows(data, label);
          const h = rows[0] ? Object.keys(rows[0]) : [];
          if (h.length) ws.addRow(h);
          applyHeaderRow(ws, h.length, pcsatHeaderFill);
          rows.forEach(r => {
            const rowNum = ws.addRow(h.map(k => r[k] ?? ''));
            rowNum.eachCell((cell, colNumber) => {
              cell.border = thinBorder;
              cell.alignment = { vertical: 'middle', wrapText: true, horizontal: colNumber <= 2 ? (colNumber === 2 ? 'center' : 'left') : (colNumber === 3 ? 'center' : 'left') };
            });
          });
          [20, 8, 10, 38, 38].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
        return;
      }
      const workbook = new ExcelJS.Workbook();
      const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const pcsatHeaderFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF26428B' }, bgColor: { argb: 'FF26428B' } };
      const headerStyle = { horizontal: 'center', vertical: 'middle', wrapText: true };
      if (hasMain) {
        const wsMain = workbook.addWorksheet('PCSAT Qual. analysis', { views: [{ state: 'frozen', ySplit: 1 }] });
        const mainHeaders = ['Sr.No.', 'Business Unit', 'Account Name', 'Respondent Name', 'Project Name', ...PERSPECTIVE_COLUMNS, 'Areas of improvement', 'Strength', 'Sub Areas of Improvement', 'Sub Strength', 'Neutral'];
        wsMain.addRow(mainHeaders);
        const row1 = wsMain.getRow(1);
        row1.height = 28;
        for (let col = 1; col <= mainHeaders.length; col++) {
          const c = row1.getCell(col);
          c.fill = pcsatHeaderFill;
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          c.alignment = headerStyle;
          c.border = thinBorder;
        }
        // Color the Sub columns headers distinctly
        const subAoiIdx2 = mainHeaders.indexOf('Sub Areas of Improvement') + 1;
        const subStrIdx2 = mainHeaders.indexOf('Sub Strength') + 1;
        const subNeuIdx2 = mainHeaders.indexOf('Neutral') + 1;
        if (subAoiIdx2 > 0) { row1.getCell(subAoiIdx2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB91C1C' } }; }
        if (subStrIdx2 > 0) { row1.getCell(subStrIdx2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } }; }
        if (subNeuIdx2 > 0) { row1.getCell(subNeuIdx2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6B7280' } }; }
        const wrapText = { wrapText: true };
        filteredData.forEach(row => {
          const rowNum = wsMain.addRow([
            row.id,
            row.businessUnit || '',
            row.customerName || '',
            row.respondentName || '',
            row.projectName || '',
            ...PERSPECTIVE_COLUMNS.map(p => row[p] || ''),
            row.areasOfImprovement || '',
            row.strength || '',
            row.subAreasOfImprovement || '',
            row.subStrength || '',
            row.subNeutral || ''
          ]);
          rowNum.eachCell((cell, colNumber) => {
            cell.border = thinBorder;
            cell.alignment = { vertical: 'middle', ...wrapText, horizontal: colNumber === 1 ? 'center' : 'left' };
            if (colNumber === subAoiIdx2 && cell.value) cell.font = { color: { argb: 'FFB91C1C' } };
            if (colNumber === subStrIdx2 && cell.value) cell.font = { color: { argb: 'FF15803D' } };
            if (colNumber === subNeuIdx2 && cell.value) cell.font = { color: { argb: 'FF4B5563' } };
          });
        });
        const mainWidths = [8, 18, 28, 22, 28, ...PERSPECTIVE_COLUMNS.map(() => 35), 35, 35, 30, 30, 30];
        for (let c = 1; c <= mainHeaders.length; c++) wsMain.getColumn(c).width = mainWidths[c - 1] ?? 18;
      }
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
      alert('Error downloading Excel');
    }
  };

  const safeSheetName = (name) => {
    const sanitized = String(name || 'Sheet').replace(/[\/*?:\\[\]]/g, ' ').trim();
    return sanitized.slice(0, 31) || 'Sheet';
  };

  const downloadRemarksBucketAnalysisExcel = async () => {
    if (!remarksData || remarksData.length === 0) {
      alert('No remarks data available. Please upload Remarks for different perspectives first.');
      return;
    }
    try {
      const workbook = new ExcelJS.Workbook();
      const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      const DARK_CORNFLOWER_ARGB = 'FF26428B';
      const headerStyle = { horizontal: 'center', vertical: 'middle', wrapText: true };
      const applyHeaderRow = (ws, colCount) => {
        const row = ws.getRow(1);
        row.height = 28;
        const n = colCount != null ? colCount : (row.cellCount || 0);
        for (let col = 1; col <= n; col++) {
          const c = row.getCell(col);
          c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK_CORNFLOWER_ARGB }, bgColor: { argb: DARK_CORNFLOWER_ARGB } };
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          c.alignment = headerStyle;
          c.border = thinBorder;
        }
      };
      const combinedData = combinedRemarksByCategory || [];
      const wsCombined = workbook.addWorksheet(safeSheetName('Combined Category Analysis (Account-wise)'));
      const combinedHeaders = ['Category', '# Positive Customer Comments (P)', '# Negative Customer Comments (N)', 'P%', 'N%', 'Delta %', 'Remarks'];
      wsCombined.addRow(combinedHeaders);
      applyHeaderRow(wsCombined, combinedHeaders.length);
      const greenArgb = 'FF006400';
      const redArgb = 'FFDC2626';
      const wrapAlign = { wrapText: true };
      (combinedData.length > 0 ? combinedData : [{ category: '', P: '', N: '', Ppercent: '', Npercent: '', deltaPercent: '', remarks: '' }]).forEach((row) => {
        const { arrow, display } = getDeltaArrowAndDisplay(row.deltaPercent);
        const deltaDisplay = arrow && display !== '' ? `${arrow} ${display}` : (row.deltaPercent ?? '');
        const rowNum = wsCombined.addRow([
          row.category || '',
          row.P ?? 0,
          row.N ?? 0,
          row.Ppercent ?? '',
          row.Npercent ?? '',
          deltaDisplay,
          row.remarks || ''
        ]);
        rowNum.alignment = { vertical: 'middle' };
        rowNum.getCell(1).alignment = { horizontal: 'left', vertical: 'middle', ...wrapAlign };
        rowNum.getCell(1).border = thinBorder;
        rowNum.getCell(2).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
        rowNum.getCell(2).font = { color: { argb: greenArgb }, bold: true };
        rowNum.getCell(2).border = thinBorder;
        rowNum.getCell(3).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
        rowNum.getCell(3).font = { color: { argb: redArgb }, bold: true };
        rowNum.getCell(3).border = thinBorder;
        rowNum.getCell(4).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
        rowNum.getCell(4).font = { color: { argb: greenArgb }, bold: true };
        rowNum.getCell(4).border = thinBorder;
        rowNum.getCell(5).alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
        rowNum.getCell(5).font = { color: { argb: redArgb }, bold: true };
        rowNum.getCell(5).border = thinBorder;
        const deltaCell = rowNum.getCell(6);
        deltaCell.alignment = { horizontal: 'center', vertical: 'middle', ...wrapAlign };
        deltaCell.border = thinBorder;
        const { arrowColor } = getDeltaArrowAndDisplay(row.deltaPercent);
        if (arrowColor) {
          const excelColor = arrowColor === ARROW_UP_COLOR ? 'FF16A34A' : (arrowColor === ARROW_DOWN_COLOR ? 'FFDC2626' : 'FF6B7280');
          deltaCell.font = { color: { argb: excelColor }, bold: true };
        } else {
          const remarksFill = getRemarksExcelFill(row.remarks);
          if (remarksFill) deltaCell.font = { color: { argb: remarksFill.argb }, bold: true };
        }
        const cell = rowNum.getCell(7);
        cell.alignment = { horizontal: 'left', vertical: 'middle', ...wrapAlign };
        cell.border = thinBorder;
        if (remarksFill) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: remarksFill };
          const darkBg = remarksFill.argb === 'FF006400' || remarksFill.argb === 'FFDC2626';
          cell.font = { color: { argb: darkBg ? 'FFFFFFFF' : 'FF1f2937' }, bold: true };
        }
      });
      [20, 28, 28, 10, 10, 12, 18].forEach((w, i) => { wsCombined.getColumn(i + 1).width = w; });
      
      // Add legend
      const lastRow = wsCombined.lastRow ? wsCombined.lastRow.number : 0;
      wsCombined.addRow([]); // Empty row for spacing
      wsCombined.addRow(['Legend (by Delta %):']);
      const legendTitleRow = wsCombined.lastRow.number;
      wsCombined.getRow(legendTitleRow).getCell(1).font = { bold: true, size: 11 };
      wsCombined.addRow(['• Delta > 50%: Strength(Dark Green)']);
      wsCombined.addRow(['• 20% ≤ Delta ≤ 50%: Need to build on (Potential to become Strength(Light Green))']);
      wsCombined.addRow(['• Delta ≤ -50%: Area for Improvement(Red)']);
      wsCombined.addRow(['• -50% < Delta ≤ -20%: Needs focus (Likely to become Area of Improvement(Amber))']);
      wsCombined.addRow(['• -19% ≤ Delta ≤ 19%: Subjective Decision(Grey)']);
      // Style legend rows
      for (let i = legendTitleRow; i <= legendTitleRow + 5; i++) {
        const row = wsCombined.getRow(i);
        if (row) {
          row.getCell(1).font = { size: 10 };
          row.getCell(1).alignment = { vertical: 'middle', wrapText: true };
        }
      }
      const bucketToRows = (arr, groupLabel) => {
        const list = Array.isArray(arr) ? arr : [];
        const rows = list.map((row, idx) => ({
          'Category': row && row.category != null ? String(row.category) : '',
          'Sr. No.': idx + 1,
          'Count': row && row.count != null ? row.count : '',
          [groupLabel]: (row && Array.isArray(row.groups) ? row.groups : []).join(', ') || '-',
          'Respondent Names': (row && Array.isArray(row.respondentNames) ? row.respondentNames : []).join(', ') || '-'
        }));
        return rows.length > 0 ? rows : [{ 'Category': '', 'Sr. No.': '', 'Count': '', [groupLabel]: '', 'Respondent Names': '' }];
      };
      [
        { name: 'Remarks - Sub AoI (Account)', data: remarksSubImpAccountData, label: 'Accounts' },
        { name: 'Remarks - Sub AoI (BU)', data: remarksSubImpBUData, label: 'Business Units' },
        { name: 'Remarks - Sub Strength (Account)', data: remarksSubStrAccountData, label: 'Accounts' },
        { name: 'Remarks - Sub Strength (BU)', data: remarksSubStrBUData, label: 'Business Units' }
      ].forEach(({ name, data, label }) => {
        const ws = workbook.addWorksheet(safeSheetName(name));
        const rows = bucketToRows(data, label);
        const h = rows[0] ? Object.keys(rows[0]) : [];
        if (h.length) ws.addRow(h);
        applyHeaderRow(ws, h.length);
        rows.forEach((r) => {
          const rowNum = ws.addRow(h.map((k) => r[k] ?? ''));
          rowNum.eachCell((cell, colNumber) => {
            cell.border = thinBorder;
            cell.alignment = { vertical: 'middle', wrapText: true, horizontal: colNumber === 2 || colNumber === 3 ? 'center' : 'left' };
          });
        });
        [20, 8, 10, 38, 38].forEach((w, i) => { ws.getColumn(i + 1).width = w; });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      link.download = `Remarks_Bucket_Analysis_${yyyy}-${mm}-${dd}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error('Remarks Bucket Analysis download error:', e);
      alert('Error downloading Remarks-based Bucket Analysis: ' + (e && e.message ? e.message : String(e)));
    }
  };

  const clearSearch = () => setSearchTerm('');

  const handleRemarksUpload = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setRemarksData(Array.isArray(json) ? json : []);
        setRemarksFileName(file.name);
        try {
          sessionStorage.setItem('pcsatRemarksQualitativeData', JSON.stringify(json));
          sessionStorage.setItem('pcsatRemarksQualitativeFileName', file.name);
        } catch (err) {
          console.warn('Unable to persist remarks to sessionStorage:', err);
        }
      } catch (err) {
        console.error('Failed to read Remarks file:', err);
        alert('Failed to read the Remarks file. Please ensure it is a valid Excel/CSV file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const clearRemarksUpload = () => {
    setRemarksFileName('');
    setRemarksData([]);
    setShowRemarksBucketAnalysis(false);
    if (remarksInputRef.current) {
      remarksInputRef.current.value = '';
    }
    try {
      sessionStorage.removeItem('pcsatRemarksQualitativeData');
      sessionStorage.removeItem('pcsatRemarksQualitativeFileName');
    } catch (err) {
      console.warn('Unable to clear remarks from sessionStorage:', err);
    }
  };

  const downloadCombinedChartImage = async () => {
    if (!combinedChartRef.current) {
      alert('No chart available to download');
      return;
    }
    try {
      const canvas = await html2canvas(combinedChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        link.href = url;
        link.download = `PCSAT_Combined_Category_Analysis_Chart_${yyyy}-${mm}-${dd}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading chart:', error);
      alert('Error downloading chart image');
    }
  };

  const downloadBubbleChartImage = async () => {
    if (!bubbleChartRef.current) {
      alert('No bubble chart available to download');
      return;
    }
    try {
      const canvas = await html2canvas(bubbleChartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });
      canvas.toBlob((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        link.href = url;
        link.download = `PCSAT_Bubble_Chart_${yyyy}-${mm}-${dd}.png`;
        link.click();
        window.URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Error downloading bubble chart:', error);
      alert('Error downloading bubble chart image');
    }
  };

  const getRemarksValue = (row, targetHeader) => {
    if (!row || !targetHeader) return '';
    const headers = Array.isArray(targetHeader) ? targetHeader : [targetHeader];
    const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s|_|-/g, '');
    for (const header of headers) {
      if (!header) continue;
      const targetNorm = normalize(header);
      for (const key of Object.keys(row)) {
        if (!key) continue;
        if (normalize(key) === targetNorm) return row[key] ?? '';
      }
    }
    for (const header of headers) {
      if (!header) continue;
      const targetNorm = normalize(header);
      for (const key of Object.keys(row)) {
        if (!key) continue;
        if (normalize(key).includes(targetNorm)) return row[key] ?? '';
      }
    }
    return '';
  };

  const buildRemarksCategorySummary = (data, viewType, targetColumnKey) => {
    if (!Array.isArray(data) || data.length === 0) return [];
    const resultMap = new Map();
    data.forEach((row) => {
      const categoryRaw = getRemarksValue(row, targetColumnKey);
      if (!categoryRaw) return;
      const categories = (categoryRaw + '').split(',').map((p) => p.trim()).filter(Boolean);
      const bu = getRemarksValue(row, 'BUSINESS UNIT');
      const account = getRemarksValue(row, 'ACCOUNT NAME') || getRemarksValue(row, 'CUSTOMER NAME') || getRemarksValue(row, 'Customer Name') || getRemarksValue(row, 'CUSTOMER');
      const respondentName = getRemarksValue(row, 'RESPONDENT NAME') || getRemarksValue(row, 'RESPONDENT');
      const groupName = viewType === 'bu' ? bu : account;
      if (!groupName) return;
      categories.forEach((cat) => {
        const key = cat || 'Uncategorized';
        if (!resultMap.has(key)) {
          resultMap.set(key, { category: key, count: 0, groups: new Set(), respondents: new Set() });
        }
        const entry = resultMap.get(key);
        entry.count += 1;
        entry.groups.add(groupName);
        if (respondentName) entry.respondents.add(respondentName);
      });
    });
    let rows = Array.from(resultMap.values()).map((r) => ({
      category: r.category,
      count: r.count,
      groups: Array.from(r.groups),
      respondentNames: Array.from(r.respondents)
    }));
    if (viewType === 'bu') {
      rows.forEach((r) => {
        r.groups.sort((a, b) => {
          const ai = BU_ORDER.findIndex(x => (a || '').toLowerCase().includes((x || '').toLowerCase()));
          const bi = BU_ORDER.findIndex(x => (b || '').toLowerCase().includes((x || '').toLowerCase()));
          if (ai !== -1 && bi !== -1) return ai - bi;
          if (ai !== -1) return -1;
          if (bi !== -1) return 1;
          return (a || '').localeCompare(b || '');
        });
      });
      rows.sort((a, b) => a.category.localeCompare(b.category));
    } else {
      rows.forEach((r) => {
        r.groups.sort((a, b) => (a || '').localeCompare(b || ''));
        r.respondentNames.sort((a, b) => (a || '').localeCompare(b || ''));
      });
      rows.sort((a, b) => a.category.localeCompare(b.category));
    }
    return rows;
  };

  const remarksSubImpAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', 'Sub Areas of Improvement'), [remarksData]);
  const remarksSubImpBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', 'Sub Areas of Improvement'), [remarksData]);
  const remarksSubStrAccountData = useMemo(() => buildRemarksCategorySummary(remarksData, 'account', 'Sub Strength'), [remarksData]);
  const remarksSubStrBUData = useMemo(() => buildRemarksCategorySummary(remarksData, 'bu', 'Sub Strength'), [remarksData]);

  const combinedRemarksByCategory = useMemo(() => {
    const categoryMap = new Map();
    (remarksSubImpAccountData || []).forEach((row) => {
      categoryMap.set(row.category, { category: row.category, P: categoryMap.get(row.category)?.P ?? 0, N: row.count ?? 0 });
    });
    (remarksSubStrAccountData || []).forEach((row) => {
      const existing = categoryMap.get(row.category);
      categoryMap.set(row.category, {
        category: row.category,
        P: row.count ?? 0,
        N: existing?.N ?? 0
      });
    });
    return Array.from(categoryMap.values())
      .map((row) => {
        const sum = row.P + row.N;
        const pPercent = sum > 0 ? (row.P / sum) * 100 : 0;
        const nPercent = sum > 0 ? (row.N / sum) * 100 : 0;
        const deltaPercent = pPercent - nPercent;
        const roundedDelta = Math.round(deltaPercent * 100) / 100;
        let remarks = '';
        if (roundedDelta > 50) remarks = 'Strength';
        else if (roundedDelta >= 20 && roundedDelta <= 50) remarks = 'Need to build on (Potential to become Strength)';
        else if (roundedDelta <= -50) remarks = 'Area for Improvement';
        else if (roundedDelta <= -20) remarks = 'Needs focus (Likely to become Area of Improvement)';
        else remarks = 'Subjective Decision'; // -19 <= roundedDelta <= 19
        return {
          ...row,
          Ppercent: Math.round(pPercent * 100) / 100,
          Npercent: Math.round(nPercent * 100) / 100,
          deltaPercent: roundedDelta,
          remarks
        };
      })
      .sort((a, b) => (a.category || '').localeCompare(b.category || ''));
  }, [remarksSubImpAccountData, remarksSubStrAccountData]);

  const combinedChartData = useMemo(() => {
    if (!combinedRemarksByCategory || combinedRemarksByCategory.length === 0) return [];
    return combinedRemarksByCategory
      .filter(row => row.category && String(row.category).trim() !== '')
      .map(row => {
        let p = typeof row.Ppercent === 'number' ? row.Ppercent : parseFloat(row.Ppercent) || 0;
        let n = typeof row.Npercent === 'number' ? row.Npercent : parseFloat(row.Npercent) || 0;
        p = Math.max(0, Math.min(100, Number(p)));
        n = Math.max(0, Math.min(100, Number(n)));
        if (isNaN(p)) p = 0;
        if (isNaN(n)) n = 0;
        return {
          category: String(row.category || '').trim(),
          pPercent: parseFloat(p.toFixed(2)),
          nPercent: parseFloat(n.toFixed(2))
        };
      });
  }, [combinedRemarksByCategory]);

  // Bubble chart: Z scale matches ZAxis range so we can compute radius in pixels for overlap check
  const BUBBLE_Z_RANGE = [6000, 28000]; // area → radius ~44–94px to reduce overlap
  const BUBBLE_REF_INNER = { width: 800, height: 500 };
  const BUBBLE_Y_DOMAIN = [-8, 8];
  const BUBBLE_ROW_STEP = 2.2; // y-units between rows so bubbles don't overlap at ref size

  const { bubbleChartData, bubbleChartYDomain } = useMemo(() => {
    if (!combinedRemarksByCategory || combinedRemarksByCategory.length === 0) {
      return { bubbleChartData: [], bubbleChartYDomain: [-1, 1] };
    }
    const filtered = combinedRemarksByCategory.filter(row => row.category && String(row.category).trim() !== '');
    if (filtered.length === 0) return { bubbleChartData: [], bubbleChartYDomain: [-1, 1] };

    const totalCounts = filtered.map(row => (row.P || 0) + (row.N || 0));
    const minCount = Math.min(...totalCounts, 1);
    const maxCount = Math.max(...totalCounts, 1);
    const countRange = maxCount - minCount || 1;

    const xDomain = [-100, 100];
    const yRange = BUBBLE_Y_DOMAIN[1] - BUBBLE_Y_DOMAIN[0];
    const pxPerX = BUBBLE_REF_INNER.width / (xDomain[1] - xDomain[0]);
    const pxPerY = BUBBLE_REF_INNER.height / yRange;

    const zToArea = (z) => BUBBLE_Z_RANGE[0] + ((z - 500) / 2500) * (BUBBLE_Z_RANGE[1] - BUBBLE_Z_RANGE[0]);
    const radiusPx = (z) => Math.sqrt(Math.max(zToArea(z), 0) / Math.PI);

    const rowOffsets = [0, 1, -1, 2, -2, 3, -3, 4, -4];
    const rows = rowOffsets.map((k) => k * BUBBLE_ROW_STEP).filter((y) => y >= BUBBLE_Y_DOMAIN[0] && y <= BUBBLE_Y_DOMAIN[1]);

    const withMeta = filtered.map((row) => {
      const deltaPercent = typeof row.deltaPercent === 'number' ? row.deltaPercent : parseFloat(row.deltaPercent) || 0;
      const totalCount = (row.P || 0) + (row.N || 0);
      const normalizedCount = countRange > 0 ? ((totalCount - minCount) / countRange) : 0.5;
      const scaledZ = 500 + (normalizedCount * 2500);

      let color = '#E5E7EB';
      if (deltaPercent > 50) color = '#006400';
      else if (deltaPercent >= 20 && deltaPercent <= 50) color = '#90EE90';
      else if (deltaPercent <= -50) color = '#DC2626';
      else if (deltaPercent <= -20) color = '#F59E0B';

      return {
        x: deltaPercent,
        z: scaledZ,
        r: radiusPx(scaledZ),
        category: String(row.category || '').trim(),
        deltaPercent,
        totalCount,
        remarks: row.remarks || '',
        color
      };
    });

    const sorted = [...withMeta].sort((a, b) => a.x - b.x);
    const placed = [];

    const overlaps = (x, y, r) => {
      for (let i = 0; i < placed.length; i++) {
        const p = placed[i];
        const dx = (x - p.x) * pxPerX;
        const dy = (y - p.y) * pxPerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < r + p.r) return true;
      }
      return false;
    };

    for (let i = 0; i < sorted.length; i++) {
      const b = sorted[i];
      let chosenY = null;
      for (const rowY of rows) {
        if (overlaps(b.x, rowY, b.r)) continue;
        chosenY = rowY;
        break;
      }
      if (chosenY == null) chosenY = rows.length ? rows[rows.length - 1] : 0;
      placed.push({ x: b.x, y: chosenY, r: b.r });
      b.y = chosenY;
    }

    const ys = placed.map((p) => p.y);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padding = 0.8;
    const bubbleChartYDomain = [Math.max(BUBBLE_Y_DOMAIN[0], minY - padding), Math.min(BUBBLE_Y_DOMAIN[1], maxY + padding)];

    const bubbleChartData = sorted.map((b) => ({
      x: b.x,
      y: b.y,
      z: b.z,
      category: b.category,
      deltaPercent: b.deltaPercent,
      totalCount: b.totalCount,
      remarks: b.remarks,
      color: b.color
    }));

    return { bubbleChartData, bubbleChartYDomain };
  }, [combinedRemarksByCategory]);

  // Measure bubble chart container (must be after bubbleChartData is defined)
  useEffect(() => {
    if (!bubbleChartInnerRef.current || !bubbleChartData.length) return;
    const el = bubbleChartInnerRef.current;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setBubbleChartSize({ width, height });
    };
    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(el);
    measure();
    const t = setTimeout(measure, 100);
    return () => {
      clearTimeout(t);
      resizeObserver.disconnect();
    };
  }, [bubbleChartData.length, showRemarksBucketAnalysis]);

  // Label positions at center of each bubble (category inside bubble only)
  const bubbleLabelPositions = useMemo(() => {
    if (!bubbleChartData.length || bubbleChartSize.width <= 0 || bubbleChartSize.height <= 0) return [];
    const margin = { top: 32, right: 32, bottom: 56, left: 80 };
    const innerWidth = bubbleChartSize.width - margin.left - margin.right;
    const innerHeight = bubbleChartSize.height - margin.top - margin.bottom;
    const xDomain = [-100, 100];
    const yDomain = bubbleChartYDomain && bubbleChartYDomain[0] !== bubbleChartYDomain[1]
      ? bubbleChartYDomain
      : [-1, 1];
    return bubbleChartData.map((entry, index) => {
      const xPixel = margin.left + ((entry.x - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerWidth;
      const yPixel = margin.top + ((entry.y - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerHeight;
      const isDarkBubble = (entry.color === '#006400' || entry.color === '#DC2626');
      return {
        category: entry.category,
        x: xPixel,
        y: yPixel,
        index,
        textColor: isDarkBubble ? '#ffffff' : '#1f2937'
      };
    });
  }, [bubbleChartData, bubbleChartSize, bubbleChartYDomain]);

  const generateBucketAnalysis = () => {
    const accountWiseAnalysis = {};
    const buWiseAnalysis = {};
    const data = (Array.isArray(filteredData) && filteredData.length > 0)
      ? filteredData
      : (Array.isArray(processedData) ? processedData : []);
    if (!Array.isArray(data) || data.length === 0) return { accountWiseAnalysis, buWiseAnalysis };
    data.forEach(row => {
      const account = (row.customerName || '').toString().trim();
      const businessUnit = (row.businessUnit || '').toString().trim();
      const respondentName = (row.respondentName || '').toString().trim();
      const areasStr = (row.areasOfImprovement || '').toString().trim();
      if (areasStr !== '') {
        const rawAreas = areasStr.split(/[,;|]/).map(a => a.trim()).filter(Boolean);
        const areas = [...new Set(rawAreas)];
        areas.forEach(bucket => {
          const key = bucket || 'Uncategorized';
          if (!accountWiseAnalysis[key]) {
            accountWiseAnalysis[key] = { count: 0, entries: [] };
          }
          accountWiseAnalysis[key].count++;
          accountWiseAnalysis[key].entries.push({ account, respondentName });
          if (!buWiseAnalysis[key]) {
            buWiseAnalysis[key] = { count: 0, entries: [] };
          }
          buWiseAnalysis[key].count++;
          buWiseAnalysis[key].entries.push({ businessUnit, respondentName });
        });
      } else {
        const bucket = 'No Areas Identified';
        if (!accountWiseAnalysis[bucket]) {
          accountWiseAnalysis[bucket] = { count: 0, entries: [] };
        }
        accountWiseAnalysis[bucket].count++;
        accountWiseAnalysis[bucket].entries.push({ account, respondentName });
        if (!buWiseAnalysis[bucket]) {
          buWiseAnalysis[bucket] = { count: 0, entries: [] };
        }
        buWiseAnalysis[bucket].count++;
        buWiseAnalysis[bucket].entries.push({ businessUnit, respondentName });
      }
    });
    return { accountWiseAnalysis, buWiseAnalysis };
  };

  const areasBucketTableData = useMemo(() => {
    const { accountWiseAnalysis, buWiseAnalysis } = generateBucketAnalysis();
    const accountGroups = [];
    const sortedAccountCategories = Object.keys(accountWiseAnalysis).sort((a, b) => {
      const ai = PERSPECTIVE_COLUMNS.indexOf(a);
      const bi = PERSPECTIVE_COLUMNS.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    sortedAccountCategories.forEach(area => {
      const data = accountWiseAnalysis[area];
      const rows = data.entries
        .map(({ account, respondentName }) => ({ accountName: account || '', respondentName: respondentName || '' }))
        .sort((a, b) => (a.accountName || '').localeCompare(b.accountName || '') || (a.respondentName || '').localeCompare(b.respondentName || ''));
      accountGroups.push({ category: area, count: data.count, rows });
    });
    const buGroups = [];
    const sortedBUCategories = Object.keys(buWiseAnalysis).sort((a, b) => {
      const ai = PERSPECTIVE_COLUMNS.indexOf(a);
      const bi = PERSPECTIVE_COLUMNS.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    sortedBUCategories.forEach(area => {
      const data = buWiseAnalysis[area];
      const sorted = [...data.entries].sort((a, b) => {
        const aVal = a.businessUnit || '';
        const bVal = b.businessUnit || '';
        const ai = BU_ORDER.findIndex(x => (aVal || '').toLowerCase().includes((x || '').toLowerCase()));
        const bi = BU_ORDER.findIndex(x => (bVal || '').toLowerCase().includes((x || '').toLowerCase()));
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return (aVal || '').localeCompare(bVal || '');
      });
      buGroups.push({
        category: area,
        count: data.count,
        rows: sorted.map(({ businessUnit, respondentName }) => ({
          buName: (businessUnit || '').toString(),
          respondentName: (respondentName || '').toString()
        }))
      });
    });
    return { accountGroups, buGroups };
  }, [filteredData, processedData]);

  if (loading) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📝 PCSAT: Qualitative analysis</Title>
          <BackButton onClick={onBack}><ArrowLeft size={20} /> Back</BackButton>
        </Header>
        <StatusContainer><div>Loading data...</div></StatusContainer>
      </DashboardContainer>
    );
  }

  if (error) {
    return (
      <DashboardContainer>
        <Header>
          <Title>📝 PCSAT: Qualitative analysis</Title>
          <BackButton onClick={onBack}><ArrowLeft size={20} /> Back</BackButton>
        </Header>
        <ErrorMessage>Error: {error}</ErrorMessage>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <RemarksUploadContainer>
        <label htmlFor="pcsat-remarks-upload-input" style={{ fontWeight: 500 }}>
          Remarks for different perspectives:
        </label>
        <input
          id="pcsat-remarks-upload-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          ref={remarksInputRef}
          onChange={handleRemarksUpload}
          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff' }}
        />
        {remarksFileName && <FileNameDisplay>{remarksFileName}</FileNameDisplay>}
        {remarksFileName && (
          <>
            <ClearButton type="button" onClick={clearRemarksUpload} title="Clear to upload a new file">
              Clear
            </ClearButton>
            <RemarksBucketButton
              type="button"
              onClick={() => setShowRemarksBucketAnalysis((prev) => !prev)}
            >
              {showRemarksBucketAnalysis ? 'Hide Bucket Analysis' : 'Show Bucket Analysis'}
            </RemarksBucketButton>
          </>
        )}
      </RemarksUploadContainer>
      <Header>
        <BackButton onClick={onBack}><ArrowLeft size={22} /> Back</BackButton>
        <Title>📝 PCSAT: Qualitative analysis</Title>
        <HeaderRight>
          <BucketToggleButton
            $active={showAreasOfImprovementBucket}
            onClick={() => setShowAreasOfImprovementBucket(!showAreasOfImprovementBucket)}
          >
            Areas of Improvement Bucket Analysis
          </BucketToggleButton>
          {showAreasOfImprovementBucket && (
            <>
              <BucketToggleButton
                $active={areasBucketViewType === 'account'}
                onClick={() => setAreasBucketViewType('account')}
              >
                Account-wise
              </BucketToggleButton>
              <BucketToggleButton
                $active={areasBucketViewType === 'bu'}
                onClick={() => setAreasBucketViewType('bu')}
              >
                BU-wise
              </BucketToggleButton>
            </>
          )}
          <ExportButton onClick={downloadExcel}>
            <Download size={20} />
            Download Excel
          </ExportButton>
        </HeaderRight>
      </Header>
      <ContentContainer style={{ padding: '1rem' }}>
        {showRemarksBucketAnalysis && remarksData.length > 0 && (
          <RemarksBucketSection>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Remarks-based Bucket Analysis</div>
                <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: 4 }}>
                  Based on uploaded file: <strong>{remarksFileName || 'Remarks for different perspectives'}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <ExportButton onClick={downloadRemarksBucketAnalysisExcel} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                  <Download size={18} />
                  Download Remarks-based Bucket Analysis
                </ExportButton>
                <ClearButton type="button" onClick={() => setShowRemarksBucketAnalysis(false)} style={{ padding: '0.5rem 1rem' }}>
                  Hide
                </ClearButton>
              </div>
            </div>

            {/* Combined Category Analysis (Account-wise): P%, N%, Delta %, Remarks */}
            {/* Legend (by Delta %) */}
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: 16, fontSize: '0.85rem', color: '#64748b', justifyContent: 'flex-start', flexWrap: 'wrap', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#006400', marginRight: 4, verticalAlign: 'middle', borderRadius: '50%' }} /> Delta &gt; 50%: Strength(Dark Green)</span>
              <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#90EE90', marginRight: 4, verticalAlign: 'middle', borderRadius: '50%' }} /> 20% ≤ Delta ≤ 50%: Need to build on (Potential to become Strength(Light Green))</span>
              <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#DC2626', marginRight: 4, verticalAlign: 'middle', borderRadius: '50%' }} /> Delta ≤ -50%: Area for Improvement(Red)</span>
              <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#F59E0B', marginRight: 4, verticalAlign: 'middle', borderRadius: '50%' }} /> -50% &lt; Delta ≤ -20%: Needs focus (Likely to become Area of Improvement(Amber))</span>
              <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#E5E7EB', marginRight: 4, verticalAlign: 'middle', borderRadius: '50%' }} /> -19% ≤ Delta ≤ 19%: Subjective Decision(Grey)</span>
            </div>
            <div style={{ marginBottom: 8, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              Combined Category Analysis (Account-wise)
            </div>
            <TableContainer>
              <CombinedCategoryTable>
                <thead>
                  <tr>
                    <TableHeader>Category</TableHeader>
                    <TableHeader># Positive Customer Comments (P)</TableHeader>
                    <TableHeader># Negative Customer Comments (N)</TableHeader>
                    <TableHeader>P%</TableHeader>
                    <TableHeader>N%</TableHeader>
                    <TableHeader>Delta %</TableHeader>
                    <TableHeader>Remarks</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {combinedRemarksByCategory.map((row, idx) => (
                    <TableRow key={`combined-cat-${idx}-${row.category}`}>
                      <TableCell style={{ textAlign: 'left', border: '1px solid #d1d5db' }}>{row.category}</TableCell>
                      <TableCell isNumeric style={{ color: COMBINED_GREEN, fontWeight: 600, border: '1px solid #d1d5db' }}>{row.P}</TableCell>
                      <TableCell isNumeric style={{ color: COMBINED_RED, fontWeight: 600, border: '1px solid #d1d5db' }}>{row.N}</TableCell>
                      <TableCell isNumeric style={{ color: COMBINED_GREEN, fontWeight: 600, border: '1px solid #d1d5db' }}>{row.Ppercent != null ? row.Ppercent : ''}</TableCell>
                      <TableCell isNumeric style={{ color: COMBINED_RED, fontWeight: 600, border: '1px solid #d1d5db' }}>{row.Npercent != null ? row.Npercent : ''}</TableCell>
                      <TableCell isNumeric style={{ fontWeight: 600, border: '1px solid #d1d5db' }}>
                        {(() => {
                          const { arrow, display, arrowColor } = getDeltaArrowAndDisplay(row.deltaPercent);
                          if (display === '' && !arrow) return '';
                          return (
                            <span>
                              {arrow && <span style={{ color: arrowColor, marginRight: 4 }}>{arrow}</span>}
                              <span style={{ color: getDeltaPercentFontColor(row.remarks) }}>{display}</span>
                            </span>
                          );
                        })()}
                      </TableCell>
                      <RemarksTableCell {...getRemarksCellProps(row.remarks)} style={{ border: '1px solid #d1d5db' }}>{row.remarks || ''}</RemarksTableCell>
                    </TableRow>
                  ))}
                  {combinedRemarksByCategory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} style={{ textAlign: 'center', color: '#64748b' }}>No common category data</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </CombinedCategoryTable>
            </TableContainer>

            {/* Bubble Chart: Combined Category Analysis (Account-wise) */}
            {bubbleChartData.length > 0 && (
              <BubbleChartCard>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
                    Combined Category Analysis (Account-wise) – Bubble Chart
                  </div>
                  <ExportButton type="button" onClick={downloadBubbleChartImage} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    <Download size={18} />
                    Download Chart
                  </ExportButton>
                </div>
                <BubbleLegend>
                  <BubbleLegendItem><BubbleLegendDot $color="#DC2626" /> Area for Improvement (Δ ≤ -50%)</BubbleLegendItem>
                  <BubbleLegendItem><BubbleLegendDot $color="#F59E0B" /> Needs focus (-50% &lt; Δ ≤ -20%)</BubbleLegendItem>
                  <BubbleLegendItem><BubbleLegendDot $color="#E5E7EB" /> Neutral (-20% &lt; Δ &lt; 20%)</BubbleLegendItem>
                  <BubbleLegendItem><BubbleLegendDot $color="#90EE90" /> Need to build on (20% ≤ Δ ≤ 50%)</BubbleLegendItem>
                  <BubbleLegendItem><BubbleLegendDot $color="#006400" /> Strength (Δ &gt; 50%)</BubbleLegendItem>
                </BubbleLegend>
                <div ref={bubbleChartRef} style={{ padding: '12px 8px', overflow: 'visible', position: 'relative' }}>
                  <div ref={bubbleChartInnerRef} style={{ width: '100%', height: 560, minHeight: 560, overflow: 'visible', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart
                        data={bubbleChartData}
                        margin={{ top: 32, right: 32, bottom: 80, left: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={true} horizontal={false} />
                        <ReferenceLine
                          x={0}
                          stroke="#1e293b"
                          strokeWidth={2.5}
                          label={{ value: 'Neutral', position: 'top', fontSize: 12, fontWeight: 800, fill: '#1e293b' }}
                        />
                        <XAxis
                          type="number"
                          dataKey="x"
                          name="Delta %"
                          domain={[-100, 100]}
                          tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                          ticks={[-100, -50, -20, 0, 20, 50, 100]}
                          label={{ value: 'Delta % (Area for Improvement ← Left | Neutral | Right → Strength)', position: 'insideBottom', offset: -8, style: { textAnchor: 'middle', fontSize: 10, fill: '#475569', fontWeight: 600 } }}
                          stroke="#94a3b8"
                        />
                        <YAxis
                          type="number"
                          dataKey="y"
                          name="Category"
                          domain={bubbleChartYDomain}
                          tick={false}
                          width={1}
                          stroke="#94a3b8"
                        />
                        <ZAxis
                          type="number"
                          dataKey="z"
                          range={BUBBLE_Z_RANGE}
                          name="Total Count"
                        />
                        <Tooltip
                          cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload[0]) {
                              const data = payload[0].payload;
                              return (
                                <div style={{
                                  backgroundColor: '#fff',
                                  border: '1px solid #94a3b8',
                                  borderRadius: 8,
                                  padding: '10px 14px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                  minWidth: 200
                                }}>
                                  <p style={{ margin: 0, fontWeight: 700, marginBottom: 6, fontSize: '0.95rem' }}>{data.category}</p>
                                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>Delta %: <strong>{data.deltaPercent.toFixed(1)}%</strong></p>
                                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569' }}>Total Count: <strong>{data.totalCount}</strong></p>
                                  {data.remarks && <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Remarks: {data.remarks}</p>}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {bubbleChartData.map((entry, index) => (
                          <Scatter
                            key={`scatter-${index}`}
                            name={entry.category}
                            data={[entry]}
                            fill={entry.color}
                            stroke="#334155"
                            strokeWidth={1.5}
                          />
                        ))}
                      </ScatterChart>
                    </ResponsiveContainer>
                    {/* Labels below chart: Area for Improvement (left) and Strength (right) */}
                    <div style={{
                      position: 'absolute',
                      bottom: 8,
                      left: 0,
                      right: 0,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0 80px',
                      pointerEvents: 'none',
                      zIndex: 5
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#DC2626'
                      }}>
                        <span style={{ fontSize: '16px' }}>←</span>
                        <span>Area for Improvement</span>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#475569',
                        padding: '0 12px'
                      }}>
                        Neutral
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: '#006400'
                      }}>
                        <span>Strength</span>
                        <span style={{ fontSize: '16px' }}>→</span>
                      </div>
                    </div>
                    {bubbleLabelPositions.length > 0 && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 10
                      }}>
                        {bubbleLabelPositions.map((pos) => (
                          <div
                            key={`overlay-label-${pos.index}`}
                            style={{
                              position: 'absolute',
                              left: pos.x,
                              top: pos.y,
                              transform: 'translate(-50%, -50%)',
                              padding: 0,
                              maxWidth: '80%',
                              fontSize: 11,
                              fontWeight: 700,
                              color: pos.textColor || '#1f2937',
                              fontFamily: 'Arial, sans-serif',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              pointerEvents: 'none',
                              userSelect: 'none',
                              textAlign: 'center',
                              textShadow: '0 0 2px rgba(255,255,255,0.8), 0 1px 2px rgba(0,0,0,0.2)',
                              lineHeight: 1.2
                            }}
                          >
                            {pos.category}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </BubbleChartCard>
            )}

            {/* Vertical stacked bar chart: P% and N% on horizontal x-axis, two colors */}
            {combinedChartData.length > 0 && (
              <ChartWrap>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                    Combined Category Analysis (Account-wise) – P% vs N%
                  </div>
                  <ExportButton type="button" onClick={downloadCombinedChartImage} style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                    <Download size={18} />
                    Download Chart
                  </ExportButton>
                </div>
                <div ref={combinedChartRef} style={{ padding: 8, background: '#fff' }}>
                  <div style={{ width: '100%', height: Math.max(400, combinedChartData.length * 42), minHeight: 350 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                      data={combinedChartData}
                      layout="vertical"
                      margin={{ top: 16, right: 24, left: 8, bottom: 24 }}
                      barCategoryGap={combinedChartData.length > 10 ? 6 : 10}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: '#374151' }}
                        ticks={[0, 20, 40, 60, 80, 100]}
                        tickFormatter={(v) => `${v}%`}
                        allowDataOverflow
                      />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#374151' }} width={140} interval={0} />
                      <Tooltip
                        formatter={(value, name) => [typeof value === 'number' ? value.toFixed(2) + '%' : value, name === 'pPercent' ? 'P%' : 'N%']}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #94a3b8', borderRadius: 8 }}
                        labelStyle={{ fontWeight: 600 }}
                      />
                      <Legend formatter={(v) => (v === 'pPercent' ? 'P%' : 'N%')} iconType="rect" />
                      <Bar dataKey="pPercent" name="pPercent" fill="#90EE90" stackId="a" barSize={28} radius={[0, 0, 0, 0]}>
                        {combinedChartData.map((_, i) => (
                          <Cell key={`p-${i}`} fill="#90EE90" />
                        ))}
                        <LabelList dataKey="pPercent" position="center" formatter={(v) => (v > 0 ? `${v}%` : '')} fill="#1f2937" fontSize={11} />
                      </Bar>
                      <Bar dataKey="nPercent" name="nPercent" fill="#FF0000" stackId="a" barSize={28} radius={[0, 4, 4, 0]}>
                        {combinedChartData.map((_, i) => (
                          <Cell key={`n-${i}`} fill="#FF0000" />
                        ))}
                        <LabelList dataKey="nPercent" position="center" formatter={(v) => (v > 0 ? `${v}%` : '')} fill="#fff" fontSize={11} />
                      </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: 8, fontSize: '0.8rem', color: '#64748b' }}>
                    <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#90EE90', marginRight: 4, verticalAlign: 'middle' }} /> P% (Positive / Sub Strength)</span>
                    <span><span style={{ display: 'inline-block', width: 14, height: 14, background: '#FF0000', marginRight: 4, verticalAlign: 'middle' }} /> N% (Negative / Sub Areas of Improvement)</span>
                  </div>
                </div>
              </ChartWrap>
            )}

            {/* Section 1: Remarks - Sub Areas of Improvement Bucket Analysis (group by Category, Category 1st column, Respondent Names) */}
            <div style={{ marginBottom: 12, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              Remarks - Sub Areas of Improvement Bucket Analysis
            </div>
            <div style={{ marginBottom: 8, fontWeight: 600, color: '#1e40af' }}>Account-wise</div>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Sr. No.</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>Accounts</TableHeader>
                    <TableHeader>Respondent Names</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {remarksSubImpAccountData.map((row, idx) => (
                    <TableRow key={`subimp-account-${idx}-${row.category}`}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell isNumeric>{idx + 1}</TableCell>
                      <TableCell isNumeric>{row.count}</TableCell>
                      <TableCell>{(row.groups || []).join(', ') || '-'}</TableCell>
                      <TableCell>{(row.respondentNames || []).join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {remarksSubImpAccountData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No data found for Sub Areas of Improvement (Account-wise)</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
            <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, color: '#1e40af' }}>BU-wise</div>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Sr. No.</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>Business Units</TableHeader>
                    <TableHeader>Respondent Names</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {remarksSubImpBUData.map((row, idx) => (
                    <TableRow key={`subimp-bu-${idx}-${row.category}`}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell isNumeric>{idx + 1}</TableCell>
                      <TableCell isNumeric>{row.count}</TableCell>
                      <TableCell>{(row.groups || []).join(', ') || '-'}</TableCell>
                      <TableCell>{(row.respondentNames || []).join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {remarksSubImpBUData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No data found for Sub Areas of Improvement (BU-wise)</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>

            {/* Section 2: Remarks - Sub Strength Bucket Analysis (group by Category, Category 1st column, Respondent Names) */}
            <div style={{ marginTop: 24, marginBottom: 12, fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
              Remarks - Sub Strength Bucket Analysis
            </div>
            <div style={{ marginBottom: 8, fontWeight: 600, color: '#1e40af' }}>Account-wise</div>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Sr. No.</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>Accounts</TableHeader>
                    <TableHeader>Respondent Names</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {remarksSubStrAccountData.map((row, idx) => (
                    <TableRow key={`substr-account-${idx}-${row.category}`}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell isNumeric>{idx + 1}</TableCell>
                      <TableCell isNumeric>{row.count}</TableCell>
                      <TableCell>{(row.groups || []).join(', ') || '-'}</TableCell>
                      <TableCell>{(row.respondentNames || []).join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {remarksSubStrAccountData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No data found for Sub Strength (Account-wise)</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
            <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, color: '#1e40af' }}>BU-wise</div>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Category</TableHeader>
                    <TableHeader>Sr. No.</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>Business Units</TableHeader>
                    <TableHeader>Respondent Names</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {remarksSubStrBUData.map((row, idx) => (
                    <TableRow key={`substr-bu-${idx}-${row.category}`}>
                      <TableCell>{row.category}</TableCell>
                      <TableCell isNumeric>{idx + 1}</TableCell>
                      <TableCell isNumeric>{row.count}</TableCell>
                      <TableCell>{(row.groups || []).join(', ') || '-'}</TableCell>
                      <TableCell>{(row.respondentNames || []).join(', ') || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {remarksSubStrBUData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} style={{ textAlign: 'center', color: '#64748b' }}>No data found for Sub Strength (BU-wise)</TableCell>
                    </TableRow>
                  )}
                </tbody>
              </Table>
            </TableContainer>
          </RemarksBucketSection>
        )}

        <MainDashboardSection>
          <MainDashboardTitle>PCSAT: Qualitative analysis</MainDashboardTitle>
          <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 8 }}>
            Qualitative data from CSAT received Report. Search by Account Name below.
          </div>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Search by Account Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ClearButton onClick={clearSearch}>Clear</ClearButton>
          </SearchContainer>
          {filteredData.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Sr.No.</TableHeader>
                    <TableHeader>Business Unit</TableHeader>
                    <TableHeader>Account Name</TableHeader>
                    <TableHeader>Respondent Name</TableHeader>
                    <TableHeader>Project Name</TableHeader>
                    {PERSPECTIVE_COLUMNS.map(p => (
                      <TableHeader key={p}>{p}</TableHeader>
                    ))}
                    <TableHeader>Areas of improvement</TableHeader>
                    <TableHeader>Strength</TableHeader>
                    <TableHeader style={{ background: '#b91c1c', color: '#fff' }}>Sub Areas of Improvement</TableHeader>
                    <TableHeader style={{ background: '#15803d', color: '#fff' }}>Sub Strength</TableHeader>
                    <TableHeader style={{ background: '#6b7280', color: '#fff' }}>Neutral</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell isNumeric>{row.id}</TableCell>
                      <TableCell>{row.businessUnit}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.respondentName || ''}</TableCell>
                      <TableCell>{row.projectName || ''}</TableCell>
                      {PERSPECTIVE_COLUMNS.map(p => (
                        <TableCell key={p}>{row[p] || ''}</TableCell>
                      ))}
                      <TableCell>{row.areasOfImprovement || ''}</TableCell>
                      <TableCell>{row.strength || ''}</TableCell>
                      <TableCell style={{ color: row.subAreasOfImprovement ? '#b91c1c' : '#9ca3af' }}>{row.subAreasOfImprovement || ''}</TableCell>
                      <TableCell style={{ color: row.subStrength ? '#15803d' : '#9ca3af' }}>{row.subStrength || ''}</TableCell>
                      <TableCell style={{ color: row.subNeutral ? '#4b5563' : '#9ca3af' }}>{row.subNeutral || ''}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          ) : (
            <StatusContainer>
              <div>No data found matching the criteria</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                Data is from the Customer Success Survey All PCSAT report. Use PERSPECTIVE and RATING_DESCRIPTION; filter by CSAT cycle start date. Search by Account Name above.
              </div>
            </StatusContainer>
          )}
        </MainDashboardSection>

        {/* Top 10 Positive Feedback – sentiment analysis on RATING_DESCRIPTION */}
        <MainDashboardSection>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <MainDashboardTitle style={{ margin: 0 }}>Top 10 Positive Feedback</MainDashboardTitle>
            {top10PositiveFeedback.length > 0 && (
              <button
                type="button"
                onClick={downloadTop10PositiveFeedbackExcel}
                style={{
                  background: '#10b981',
                  border: 'none',
                  color: 'white',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Download size={16} />
                Download Excel
              </button>
            )}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#475569', marginBottom: 8 }}>
            Top 10 positive customer feedback from RATING_DESCRIPTION (CSAT received Report), ranked by sentiment analysis.
          </div>
          {top10PositiveFeedback.length > 0 ? (
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader style={{ width: '50px', textAlign: 'center' }}>S No.</TableHeader>
                    <TableHeader>Business Unit</TableHeader>
                    <TableHeader>Account Name</TableHeader>
                    <TableHeader>Project Name</TableHeader>
                    <TableHeader>Respondent Name</TableHeader>
                    <TableHeader style={{ minWidth: '350px' }}>Top 10 Positive Feedback</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {top10PositiveFeedback.map(item => (
                    <TableRow key={`pos-fb-${item.sNo}`}>
                      <TableCell isNumeric style={{ textAlign: 'center' }}>{item.sNo}</TableCell>
                      <TableCell>{item.businessUnit}</TableCell>
                      <TableCell>{item.customerName}</TableCell>
                      <TableCell>{item.projectName}</TableCell>
                      <TableCell>{item.respondentName}</TableCell>
                      <TableCell style={{ color: '#15803d', fontStyle: 'italic' }}>{item.ratingDescription}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          ) : (
            <StatusContainer>
              <div>No positive feedback data found</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9ca3af' }}>
                No RATING_DESCRIPTION data found in the Customer Success Survey All PCSAT report.
              </div>
            </StatusContainer>
          )}
        </MainDashboardSection>

        {showAreasOfImprovementBucket && (
          <BucketSection>
            <BucketSectionTitle>Areas of Improvement Bucket Analysis</BucketSectionTitle>
            <ViewToggleWrap>
              <span style={{ fontWeight: 600, color: '#475569' }}>View:</span>
              <BucketToggleButton $active={areasBucketViewType === 'account'} onClick={() => setAreasBucketViewType('account')}>Account-wise</BucketToggleButton>
              <BucketToggleButton $active={areasBucketViewType === 'bu'} onClick={() => setAreasBucketViewType('bu')}>BU-wise</BucketToggleButton>
            </ViewToggleWrap>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Sr. No.</TableHeader>
                    <TableHeader>Area of Improvement</TableHeader>
                    <TableHeader>Count</TableHeader>
                    <TableHeader>{areasBucketViewType === 'account' ? 'Account Name' : 'BU Name'}</TableHeader>
                    <TableHeader>Respondent Name</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const groups = areasBucketViewType === 'account' ? areasBucketTableData.accountGroups : areasBucketTableData.buGroups;
                    let sno = 0;
                    return groups.flatMap((group, gIdx) =>
                      group.rows.map((row, rIdx) => (
                        <TableRow key={`${areasBucketViewType}-${gIdx}-${rIdx}`}>
                          <TableCell isNumeric>{++sno}</TableCell>
                          {rIdx === 0 ? (
                            <>
                              <TableCell rowSpan={group.rows.length} style={{ verticalAlign: 'top' }}>{group.category}</TableCell>
                              <TableCell rowSpan={group.rows.length} isNumeric style={{ verticalAlign: 'top' }}>{group.count}</TableCell>
                            </>
                          ) : null}
                          <TableCell>{areasBucketViewType === 'account' ? row.accountName : row.buName}</TableCell>
                          <TableCell>{row.respondentName}</TableCell>
                        </TableRow>
                      ))
                    );
                  })()}
                </tbody>
              </Table>
            </TableContainer>
            {((areasBucketViewType === 'account' ? areasBucketTableData.accountGroups : areasBucketTableData.buGroups).length === 0) && (
              <div style={{ padding: '1rem', color: '#64748b' }}>No bucket data to display.</div>
            )}
          </BucketSection>
        )}
      </ContentContainer>
    </DashboardContainer>
  );
};

export default PCSATQualitativeAnalysisDashboard;
