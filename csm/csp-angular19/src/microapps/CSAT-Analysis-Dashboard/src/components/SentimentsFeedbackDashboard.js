import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, X, Download, BarChart3, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY } from '../utils/dateUtils';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
`;

const HeaderTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: flex-start;
  text-align: left;
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const UploadContainer = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const UploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  padding: 3rem 2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: #f9fafb;
  
  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
`;

const FileDetails = styled.div`
  text-align: left;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #0c4a6e;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: #0369a1;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc2626;
  }
`;

const ActionButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin: 1rem 0;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  font-size: 0.875rem;
`;

const DownloadButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #059669;
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  overflow-y: auto;
  max-width: 100%;
  max-height: 600px; /* Set maximum height to enable vertical scrolling */
  
  &::-webkit-scrollbar {
    height: 12px;
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 6px;
    
    &:hover {
      background: #94a3b8;
    }
  }
  
  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1600px;
  table-layout: auto;
`;

const Th = styled.th`
  background: #dbeafe; /* Light blue 1 */
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e2e8f0;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  position: sticky;
  top: 0;
  z-index: 10;
  vertical-align: top;
  
  /* Set specific widths for different column types */
  &:nth-child(1) { width: 80px; }   /* S No. */
  &:nth-child(2) { width: 150px; }  /* CUSTOMER_ID */
  &:nth-child(3) { width: 120px; }  /* PROJ_ID */
  &:nth-child(4) { width: 200px; }  /* PROJECT NAME */
  &:nth-child(5) { width: 150px; }  /* RESPONDENT NAME */
  &:nth-child(6) { width: 100px; }  /* Category */
  &:nth-child(7) { width: 150px; }  /* BUSSINESS UNIT */
  
  /* Perspective columns get flexible width */
  &:nth-child(n+8):not(:nth-last-child(-n+3)) { 
    min-width: 150px; 
    max-width: 250px;
    line-height: 1.3;
    hyphens: auto;
  }
  
  /* Sentiment analysis columns */
  &:nth-last-child(-n+3) {
    min-width: 200px;
    max-width: 300px;
    line-height: 1.3;
    hyphens: auto;
  }
`;

const Td = styled.td`
  padding: 0.5rem 0.6rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #e2e8f0;
  color: #374151;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  vertical-align: top;
  text-align: center;
`;

const ResultsSummary = styled.div`
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  text-align: center;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #0c4a6e;
  font-size: 1.25rem;
  font-weight: 600;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 0.5rem;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const SentimentsFeedbackDashboard = ({ onBackToDashboard, excelData }) => {
  // Define the specific perspective columns we want to display
  const expectedPerspectives = [
    'Risk Management & Responsiveness',
    'Thought Leadership',
    'Timeline Adherence',
    'Timely Resource Fulfillment',
    'Overall Experience',
    'Quality of Delivery',
    'Resource Competency',
    'Qualitative Feedback'
  ];

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedData, setUploadedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [businessUnitFilter, setBusinessUnitFilter] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerNameSearch, setCustomerNameSearch] = useState('');
  const [projectNameSearch, setProjectNameSearch] = useState('');

  // Get CSAT cycle start date from context
  const { csatCycleStartDateFormatted } = useCSATContext();

  // Word bank state for sentiment analysis from Sentiment_analysis_word_bank.xlsx
  const [sentimentWordBank, setSentimentWordBank] = useState(null);

  // Load Sentiment_analysis_word_bank.xlsx once on mount
  useEffect(() => {
    const loadWordBank = async () => {
      const WORD_BANK_URL = (process.env.PUBLIC_URL || '') + '/data/Sentiment_analysis_word_bank.xlsx';
      try {
        const res = await fetch(WORD_BANK_URL);
        if (!res.ok) return;
        const arrayBuffer = await res.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        if (data.length < 2) return;

        const VALID_CATS = new Set([
          'Collaborative Partnership', 'Team Collaboration', 'Team Commitment',
          'Communication Skills', 'Proactive Approach', 'Resource On-boarding',
          'Relationship', 'Risk Management & Responsiveness', 'Thought Leadership',
          'Timeline Adherence', 'Timely Resource Fulfillment', 'Overall Experience',
          'Quality of Delivery', 'Resource Competency'
        ]);
        const normCat = (c) => {
          if (!c) return '';
          const t = c.toString().trim();
          for (const v of VALID_CATS) { if (v.toLowerCase() === t.toLowerCase()) return v; }
          return '';
        };

        const strengthEntries = [];
        const improvementEntries = [];
        const neutralEntries = [];

        for (let i = 1; i < data.length; i++) {
          const desc = (data[i][1] || '').toString().trim().toLowerCase();
          if (!desc) continue;
          const keywords = desc.split(/\s+/).map(w => w.replace(/[^a-z0-9'-]/g, '')).filter(w => w.length >= 3);
          if (keywords.length === 0) continue;

          const subStr = normCat(data[i][2]);
          const subImp = normCat(data[i][3]);
          const subNeu = normCat(data[i][4]);

          if (subStr) strengthEntries.push({ keywords, fullText: desc, category: subStr });
          if (subImp) improvementEntries.push({ keywords, fullText: desc, category: subImp });
          if (subNeu) neutralEntries.push({ keywords, fullText: desc, category: subNeu });
        }
        console.log('SentimentsFeedback word bank loaded:', { strength: strengthEntries.length, improvement: improvementEntries.length, neutral: neutralEntries.length });
        setSentimentWordBank({ strengthEntries, improvementEntries, neutralEntries });
      } catch (err) {
        console.error('Failed to load Sentiment_analysis_word_bank.xlsx:', err);
      }
    };
    loadWordBank();
  }, []);

  // Word-bank-based matching: score how well an entry matches a description
  const wbMatchScore = (entryKeywords, entryFullText, targetDesc) => {
    if (!targetDesc) return 0;
    const targetLower = targetDesc.toLowerCase().trim();
    if (targetLower === entryFullText) return 1000;
    if (targetLower.includes(entryFullText)) return 500 + entryKeywords.length;
    const targetWords = new Set(targetLower.split(/\s+/).map(w => w.replace(/[^a-z0-9'-]/g, '')).filter(w => w.length >= 3));
    let matched = 0;
    for (const kw of entryKeywords) {
      if (targetWords.has(kw)) matched++;
      else { for (const tw of targetWords) { if (tw.includes(kw) || kw.includes(tw)) { matched += 0.5; break; } } }
    }
    const ratio = entryKeywords.length > 0 ? matched / entryKeywords.length : 0;
    return ratio >= 0.3 ? matched * 10 + ratio * 50 : 0;
  };

  // Classify a RATING_DESCRIPTION using word bank. Returns { positive, negative, neutral } category strings
  const classifyWithWordBank = (comment, perspective) => {
    if (!comment || !sentimentWordBank || comment === 'N/A') return { positive: '', negative: '', neutral: '' };
    const desc = comment.toString().trim();
    if (!desc || desc.toLowerCase() === 'na' || desc.toLowerCase() === 'n/a') return { positive: '', negative: '', neutral: '' };

    const findBest = (entries) => {
      let bestScore = 0, bestCat = '';
      for (const e of entries) {
        const score = wbMatchScore(e.keywords, e.fullText, desc);
        if (score > bestScore) { bestScore = score; bestCat = e.category; }
      }
      return bestScore >= 5 ? bestCat : '';
    };

    let positive = findBest(sentimentWordBank.strengthEntries);
    let negative = findBest(sentimentWordBank.improvementEntries);
    let neutral = findBest(sentimentWordBank.neutralEntries);

    // Fallback to keyword-based analysis if word bank has no match
    if (!positive && !negative && !neutral) {
      const sentiment = analyzeSentimentKeyword(desc);
      const mapped = mapFeedbackToCategoryKeyword(desc);
      if (mapped) {
        if (sentiment === 'positive') positive = mapped;
        else if (sentiment === 'negative') negative = mapped;
        else neutral = mapped;
      }
    }

    return { positive, negative, neutral };
  };

  // Utility function to compare dates (MM-DD-YYYY format)
  const isDateGreaterThanOrEqual = (date1, date2) => {
    if (!date1 || !date2) return false;
    
    const [month1, day1, year1] = date1.split('-').map(Number);
    const [month2, day2, year2] = date2.split('-').map(Number);
    
    if (year1 !== year2) return year1 > year2;
    if (month1 !== month2) return month1 > month2;
    return day1 >= day2;
  };

  // Fallback sentiment analysis keywords (used when word bank has no match)
  const positiveKeywords = [
    'excellent', 'fantastic', 'great', 'good', 'satisfied', 'happy', 'pleased', 
    'outstanding', 'amazing', 'wonderful', 'perfect', 'confident', 'proactive',
    'skilled', 'competent', 'reliable', 'timely', 'quality', 'professional',
    'impressed', 'delighted', 'thrilled', 'ecstatic', 'overjoyed', 'content', 
    'grateful', 'brilliant', 'superb', 'exceptional', 'remarkable', 'commendable',
    'investing', 'invested', 'investment', 'heart', 'soul', 'heart and soul',
    'dedicated', 'dedication', 'devoted', 'devotion', 'committed', 'commitment',
    'passionate', 'passion', 'enthusiastic', 'enthusiasm', 'motivated', 'motivation',
    'driven', 'determined', 'determination', 'focused', 'focus', 'concentrated',
    'all developers', 'developers', 'team', 'team members', 'everyone', 'every member',
    'witnessed', 'witness', 'witnessing', 'seen', 'observed', 'noticed', 'experienced',
    'hits', 'success', 'successful', 'successes', 'achievement', 'achievements',
    'accomplished', 'accomplishment', 'accomplishments', 'delivered', 'delivering',
    'delivery', 'development', 'developing', 'progress', 'progressing', 'improvement',
    'improvements', 'better', 'best', 'better than', 'exceeded', 'exceeding',
    'surpassed', 'surpassing', 'outperformed', 'outperforming', 'exceeded expectations',
    'met expectations', 'exceeded goals', 'achieved goals', 'reached goals',
    'positive', 'positively', 'favorably', 'well', 'very well', 'extremely well',
    'highly', 'very', 'quite', 'really', 'truly', 'genuinely', 'sincerely',
    'appreciate', 'appreciated', 'appreciation', 'thankful', 'grateful', 'gratitude',
    'proud', 'proudly', 'pride', 'honored', 'honor', 'privileged', 'privilege',
    'valued', 'valuable', 'treasured', 'cherished', 'esteemed', 'respected',
    'admired', 'admiration', 'respected', 'respect', 'trusted', 'trust',
    'reliable', 'dependable', 'consistent', 'consistency', 'steady', 'steadily',
    'continuous', 'continuously', 'ongoing', 'persistent', 'persistence',
    'perseverance', 'persevering', 'resilient', 'resilience', 'strong', 'strength',
    'capable', 'capability', 'able', 'ability', 'skilled', 'skillful', 'expert',
    'expertise', 'proficient', 'proficiency', 'competent', 'competence',
    'talented', 'talent', 'gifted', 'gift', 'natural', 'naturally', 'innate',
    'creative', 'creativity', 'innovative', 'innovation', 'original', 'originality',
    'effective', 'effectiveness', 'efficient', 'efficiency', 'productive', 'productivity',
    'results', 'result', 'outcomes', 'outcome', 'performance', 'performances',
    'excellence', 'excellent', 'superior', 'superiority', 'premium', 'premium quality',
    'top', 'top notch', 'first class', 'world class', 'industry leading',
    'cutting edge', 'state of the art', 'advanced', 'sophisticated', 'refined'
  ];
  
  const negativeKeywords = [
    'poor', 'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'worst',
    'frustrated', 'angry', 'upset', 'dissatisfied', 'unhappy', 'displeased',
    'annoyed', 'irritated', 'furious', 'livid', 'disgusted', 'disappointed',
    'let down', 'incompetent', 'unskilled', 'unreliable', 'slow', 'low quality',
    'problem', 'issue', 'concern', 'delay', 'late', 'missing', 'replacement',
    'sometimes', 'occasionally', 'frequently', 'often', 'constantly', 'repeatedly',
    'rejig', 'rejigging', 'rejigged', 'reshuffle', 'reshuffling', 'reshuffled',
    'reorganization', 'reorganizing', 'reorganized', 'restructuring', 'restructure',
    'pumping', 'pump', 'pumped', 'injecting', 'inject', 'injected', 'adding',
    'need to', 'have to', 'must', 'should', 'required', 'requirement', 'necessary',
    'challenge', 'challenges', 'challenging', 'difficult', 'difficulty', 'difficulties',
    'struggle', 'struggling', 'struggled', 'hard', 'tough', 'rough', 'strain',
    'stress', 'stressed', 'pressure', 'pressured', 'overwhelmed', 'overwhelming',
    'shortage', 'shortages', 'lack', 'lacking', 'insufficient', 'inadequate',
    'limited', 'limitation', 'limitations', 'constraint', 'constraints', 'restriction',
    'gap', 'gaps', 'deficiency', 'deficiencies', 'weakness', 'weaknesses',
    'improvement', 'improve', 'improving', 'better', 'enhance', 'enhancement',
    'fix', 'fixing', 'fixed', 'resolve', 'resolving', 'resolved', 'address',
    'concern', 'concerns', 'worry', 'worries', 'worried', 'anxious', 'anxiety',
    'uncertain', 'uncertainty', 'unclear', 'confusion', 'confused', 'confusing',
    'inconsistent', 'inconsistency', 'unstable', 'instability', 'unreliable',
    'unpredictable', 'unpredictability', 'volatile', 'volatility', 'risky', 'risk',
    'hope', 'hoping', 'wish', 'wishing', 'expect', 'expecting', 'anticipate',
    'asap', 'soon', 'quickly', 'fast', 'urgent', 'urgency', 'immediate',
    'critical', 'crucial', 'important', 'essential', 'vital', 'necessary',
    'facing', 'faced', 'face', 'encountering', 'encountered', 'encounter',
    'experiencing', 'experienced', 'experience', 'dealing with', 'coping with',
    'struggling with', 'struggled with', 'struggle with', 'battling', 'battled',
    'fighting', 'fought', 'grappling with', 'grappled with', 'grapple with',
    'resources competencies', 'resource competencies', 'competency issues',
    'competency problems', 'competency challenges', 'competency gaps',
    'skill gaps', 'knowledge gaps', 'expertise gaps', 'capability gaps',
    'mature', 'maturity', 'matured', 'immature', 'immaturity', 'inexperienced',
    'inexperience', 'lack of experience', 'insufficient experience',
    'limited experience', 'minimal experience', 'basic experience',
    'beginner', 'beginners', 'novice', 'novices', 'rookie', 'rookies',
    'junior', 'juniors', 'entry level', 'entry-level', 'new to', 'new at',
    'learning', 'learn', 'learned', 'studying', 'study', 'studied',
    'training', 'train', 'trained', 'developing', 'develop', 'developed',
    'improving', 'improve', 'improved', 'enhancing', 'enhance', 'enhanced',
    'growing', 'grow', 'grew', 'evolving', 'evolve', 'evolved',
    'progressing', 'progress', 'progressed', 'advancing', 'advance', 'advanced',
    'roadmap', 'road map', 'project roadmap', 'development roadmap',
    'technical roadmap', 'strategic roadmap', 'future roadmap',
    'contribute', 'contribution', 'contributing', 'contributed', 'participation',
    'participate', 'participated', 'participating', 'involvement', 'involve',
    'involved', 'involving', 'engagement', 'engage', 'engaged', 'engaging',
    'mobile app development', 'web development', 'app development',
    'web app development', 'cross platform', 'multi platform', 'platform development',
    'one code', 'single code', 'unified code', 'shared code', 'common code',
    'app and web', 'mobile and web', 'both app and web', 'app and web development',
    'challenges with', 'problems with', 'issues with', 'concerns with',
    'difficulties with', 'troubles with', 'struggles with', 'obstacles with',
    'barriers with', 'limitations with', 'constraints with', 'restrictions with',
    'when it comes to', 'regarding', 'concerning', 'about', 'related to',
    'pertaining to', 'in terms of', 'with respect to', 'in relation to',
    'we hope', 'we wish', 'we expect', 'hoping that', 'wishing that', 'expecting that',
    'get mature', 'become mature', 'mature enough', 'mature and', 'mature to',
    'contribute to', 'contribute asap', 'contribute soon', 'contribute quickly',
    'facing challenges', 'facing problems', 'facing issues', 'facing difficulties',
    'challenges with resources', 'problems with resources', 'issues with resources',
    'difficulties with resources', 'resource challenges', 'resource problems',
    'resource issues', 'resource difficulties', 'competency challenges',
    'competency problems', 'competency issues', 'competency difficulties'
  ];

  const neutralKeywords = [
    'okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'satisfactory',
    'adequate', 'decent', 'reasonable', 'moderate', 'fair', 'tolerable', 
    'passable', 'mediocre', 'average', 'standard', 'typical', 'regular'
  ];

  // Fallback keyword-based sentiment analysis (used when word bank has no match)
  const analyzeSentimentKeyword = (comment) => {
    if (!comment || comment === 'N/A' || comment === '') return 'neutral';
    
    const words = comment.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    const matchedWords = { positive: [], negative: [], neutral: [] };
    
    words.forEach(word => {
      if (positiveKeywords.includes(word)) {
        positiveCount++;
        matchedWords.positive.push(word);
      } else if (negativeKeywords.includes(word)) {
        negativeCount++;
        matchedWords.negative.push(word);
      } else if (neutralKeywords.includes(word)) {
        neutralCount++;
        matchedWords.neutral.push(word);
      }
    });
    
    // Debug logging for specific feedback patterns
    if (comment.toLowerCase().includes('rejig') || comment.toLowerCase().includes('pumping') || 
        comment.toLowerCase().includes('sometimes') || comment.toLowerCase().includes('hope') ||
        comment.toLowerCase().includes('heart and soul') || comment.toLowerCase().includes('hits and misses') ||
        comment.toLowerCase().includes('investing') || comment.toLowerCase().includes('witnessed') ||
        comment.toLowerCase().includes('facing challenges') || comment.toLowerCase().includes('resources competencies') ||
        comment.toLowerCase().includes('matured') || comment.toLowerCase().includes('roadmap')) {
      console.log('Sentiment analysis debug for:', comment);
      console.log('Words:', words);
      console.log('Counts:', { positive: positiveCount, negative: negativeCount, neutral: neutralCount });
      console.log('Matched words:', matchedWords);
    }
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      return 'positive';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      return 'negative';
    } else {
      return 'neutral';
    }
  };

  // Fallback keyword-based category mapping (used when word bank has no match)
  const mapFeedbackToCategoryKeyword = (comment) => {
    if (!comment || comment === 'N/A' || comment === '') return null;
    
    const commentLower = comment.toLowerCase();
    
    // Define category keywords
    const categoryKeywords = {
      'Quality of Delivery': [
        'quality', 'delivery', 'delivered', 'delivering', 'performance', 'outcome', 'application', 'developed', 'development',
        'excellent work', 'great work', 'outstanding work', 'impressive work', 'quality work', 'high quality',
        'well developed', 'well built', 'solid work', 'professional work', 'expertise', 'technical skills',
        'code quality', 'software quality', 'product quality', 'delivery quality', 'work quality',
        'delivery performance', 'delivery excellence', 'delivery capability', 'delivery standards',
        'product delivery', 'service delivery', 'project delivery', 'solution delivery', 'delivery process',
        'delivery methodology', 'delivery approach', 'delivery strategy', 'delivery execution'
      ],
      'Team Collaboration': [
        'team', 'collaboration', 'collaborative', 'working together', 'partnership', 'cooperation', 'cooperative',
        'teamwork', 'team work', 'team effort', 'joint effort', 'collective', 'unified', 'together',
        'supportive team', 'great team', 'excellent team', 'wonderful team', 'amazing team', 'outstanding team',
        'team spirit', 'team dynamics', 'team chemistry', 'team coordination', 'team communication',
        'gavs team', 'development team', 'dev team', 'development shop', 'best development', 'impressed with team',
        'work of team', 'team work', 'team performance', 'team quality', 'team excellence', 'team capability',
        'team expertise', 'team skills', 'team talent', 'team professionalism', 'team dedication',
        'team commitment', 'team reliability', 'team consistency', 'team innovation', 'team creativity',
        'best development shop', 'impressed with work', 'work of gavs', 'gavs work', 'team impressed',
        'impressed team', 'best team', 'excellent team work', 'outstanding team work', 'amazing team work',
        'wonderful team work', 'great team work', 'team collaboration', 'collaborative team', 'team partnership'
      ],
      'Risk Management & Responsiveness': [
        'risk', 'risks', 'risk management', 'proactive', 'proactively', 'responsive', 'responsiveness', 'quick response',
        'fast response', 'timely response', 'immediate response', 'rapid response', 'quickly', 'swiftly',
        'agile', 'flexible', 'adaptable', 'adaptability', 'changes', 'releases', 'direction', 'guidance',
        'risk mitigation', 'risk assessment', 'risk control', 'crisis management', 'emergency response'
      ],
      'Thought Leadership': [
        'leadership', 'thought leadership', 'innovative', 'innovation', 'creative', 'creativity', 'vision',
        'strategic', 'strategy', 'strategic thinking', 'forward thinking', 'insightful', 'insights',
        'expertise', 'knowledge', 'expert knowledge', 'domain expertise', 'subject matter expert',
        'best practices', 'industry knowledge', 'technical leadership', 'solution architect'
      ],
      'Timeline Adherence': [
        'timeline', 'timelines', 'schedule', 'scheduled', 'on time', 'punctual', 'punctuality', 'deadline',
        'deadlines', 'delivery time', 'completion time', 'project timeline', 'milestone', 'milestones',
        'schedule adherence', 'time management', 'timely delivery', 'on schedule', 'ahead of schedule',
        'project schedule', 'delivery schedule', 'completion schedule'
      ],
      'Timely Resource Fulfillment': [
        'resource', 'resources', 'fulfillment', 'fulfilled', 'fulfilling', 'allocation', 'allocated',
        'staffing', 'staff', 'personnel', 'team members', 'skilled resources', 'qualified resources',
        'resource management', 'resource allocation', 'resource planning', 'resource availability',
        'talent acquisition', 'recruitment', 'hiring', 'onboarding', 'resource onboarding',
        'rejig', 'rejigging', 'rejigged', 'reshuffle', 'reshuffling', 'reshuffled', 'reorganization',
        'reorganizing', 'reorganized', 'restructuring', 'restructure', 'restructuring',
        'existing resources', 'current resources', 'present resources', 'available resources',
        'pumping', 'pump', 'pumped', 'injecting', 'inject', 'injected', 'adding', 'add', 'added',
        'new talented resources', 'new resources', 'talented resources', 'fresh resources',
        'additional resources', 'extra resources', 'supplementary resources', 'backup resources',
        'delivery standard', 'delivery standards', 'quality standard', 'quality standards',
        'performance standard', 'performance standards', 'service standard', 'service standards',
        'maintain standard', 'maintaining standard', 'keep standard', 'keeping standard',
        'standard intact', 'standards intact', 'maintain quality', 'maintaining quality',
        'resource shortage', 'resource constraint', 'resource limitation', 'resource gap',
        'resource need', 'resource needs', 'resource requirement', 'resource requirements',
        'resource capacity', 'resource capability', 'resource readiness', 'resource preparedness',
        'timely resource', 'resource timing', 'resource schedule', 'resource timeline',
        'resource deployment', 'resource utilization', 'resource optimization', 'resource efficiency',
        'workforce', 'workforce management', 'workforce planning', 'workforce allocation',
        'human resources', 'hr', 'human capital', 'talent pool', 'talent pipeline',
        'resource scaling', 'scaling resources', 'resource expansion', 'expanding resources',
        'resource adjustment', 'adjusting resources', 'resource modification', 'modifying resources'
      ],
      'Overall Experience': [
        'experience', 'overall', 'overall experience', 'satisfied', 'satisfaction', 'pleased', 'happy',
        'impressed', 'impressive', 'excellent', 'outstanding', 'wonderful', 'amazing', 'fantastic',
        'great experience', 'positive experience', 'satisfying experience', 'pleasing experience',
        'user experience', 'customer experience', 'client experience', 'service experience'
      ],
      'Resource Competency': [
        'competent', 'competency', 'competencies', 'skilled', 'skills', 'expertise', 'proficient',
        'capable', 'ability', 'abilities', 'talent', 'talented', 'qualified', 'professional',
        'technical skills', 'domain skills', 'functional skills', 'soft skills', 'hard skills',
        'skill level', 'competency level', 'proficiency level', 'expert level', 'senior level',
        'resources competencies', 'resource competencies', 'resource competency', 'resources competency',
        'challenges', 'challenge', 'challenging', 'difficulties', 'difficulty', 'difficult',
        'mature', 'maturity', 'maturation', 'matured', 'immature', 'immaturity', 'inexperienced',
        'experience level', 'experience', 'experienced', 'inexperience', 'lack of experience',
        'development skills', 'development competency', 'development expertise', 'development knowledge',
        'mobile app development', 'web development', 'app development', 'web app development',
        'one code', 'single code', 'unified code', 'shared code', 'common code', 'cross platform',
        'app and web', 'mobile and web', 'platform development', 'multi platform', 'cross platform development',
        'roadmap', 'road map', 'project roadmap', 'development roadmap', 'technical roadmap',
        'contribute', 'contribution', 'contributing', 'contributed', 'participation', 'participate',
        'team maturity', 'team skills', 'team competency', 'team expertise', 'team knowledge',
        'technical competency', 'technical expertise', 'technical knowledge', 'technical ability',
        'skill gap', 'competency gap', 'knowledge gap', 'expertise gap', 'training needs',
        'learning curve', 'skill development', 'competency development', 'knowledge development',
        'resource skills', 'resource expertise', 'resource knowledge', 'resource ability',
        'developer skills', 'developer competency', 'developer expertise', 'developer knowledge'
      ],
      'Collaborative Partnership': [
        'partnership', 'collaborative', 'collaboration', 'partner', 'partners', 'partnerships',
        'working relationship', 'business relationship', 'client relationship', 'vendor relationship',
        'strategic partnership', 'long term partnership', 'mutual partnership', 'beneficial partnership',
        'trusted partner', 'reliable partner', 'valued partner', 'key partner'
      ],
      'Team Commitment': [
        'commitment', 'committed', 'dedicated', 'dedication', 'devoted', 'devotion', 'loyal', 'loyalty',
        'reliable', 'reliability', 'consistent', 'consistency', 'persistent', 'persistence',
        'team commitment', 'project commitment', 'client commitment', 'service commitment',
        'work commitment', 'delivery commitment', 'quality commitment',
        'heart and soul', 'investing', 'invested', 'investment', 'witnessed', 'witness', 'witnessing',
        'hits and misses', 'hits', 'misses', 'success rate', 'successful', 'success', 'achievement',
        'achievements', 'accomplished', 'accomplishment', 'delivered', 'delivering', 'delivery',
        'all developers', 'developers', 'team members', 'everyone', 'every member', 'entire team',
        'full commitment', 'complete dedication', 'total dedication', 'full dedication', 'complete commitment',
        'total commitment', 'unwavering commitment', 'strong commitment', 'deep commitment',
        'passionate', 'passion', 'passionate about', 'enthusiastic', 'enthusiasm', 'motivated',
        'motivation', 'driven', 'determined', 'determination', 'focused', 'focus', 'concentrated',
        'concentration', 'intense', 'intensity', 'fervent', 'fervor', 'zealous', 'zeal'
      ],
      'Communication Skills': [
        'communication', 'communicate', 'communicating', 'communicative', 'clear', 'clarity', 'transparent',
        'transparency', 'open', 'openness', 'responsive', 'responsiveness', 'accessible', 'availability',
        'communication skills', 'communication style', 'communication approach', 'communication quality',
        'effective communication', 'clear communication', 'timely communication', 'regular communication'
      ],
      'Proactive Approach': [
        'proactive', 'proactively', 'initiative', 'initiatives', 'self motivated', 'self driven',
        'independent', 'independently', 'autonomous', 'autonomously', 'self sufficient', 'self reliant',
        'proactive approach', 'proactive management', 'proactive communication', 'proactive planning',
        'proactive problem solving', 'proactive support', 'proactive service'
      ],
      'Resource On-boarding': [
        'onboarding', 'on boarding', 'on board', 'onboard', 'induction', 'orientation', 'training',
        'mentoring', 'mentorship', 'guidance', 'support', 'assistance', 'help', 'helping',
        'resource onboarding', 'team onboarding', 'new member', 'new team member', 'integration',
        'team integration', 'project integration', 'workplace integration'
      ],
      'Relationship': [
        'relationship', 'relationships', 'rapport', 'bond', 'connection', 'connections', 'trust',
        'trusted', 'trustworthy', 'reliable', 'dependable', 'respect', 'respectful', 'courteous',
        'professional relationship', 'working relationship', 'business relationship', 'client relationship',
        'long term relationship', 'strong relationship', 'positive relationship', 'healthy relationship'
      ]
    };
    
    // Find the best matching category
    let bestMatch = null;
    let maxScore = 0;
    const debugScores = {};
    
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      const matchedKeywords = [];
      
      keywords.forEach(keyword => {
        if (commentLower.includes(keyword)) {
          // Give higher score for exact matches and longer keywords
          const keywordScore = keyword.length;
          score += keywordScore;
          matchedKeywords.push(`${keyword}(${keywordScore})`);
        }
      });
      
      debugScores[category] = { score, matchedKeywords };
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = category;
      }
    });
    
    // Debug logging for the specific feedback
    if (commentLower.includes('gavs team') || commentLower.includes('development shop') || 
        commentLower.includes('heart and soul') || commentLower.includes('hits and misses') ||
        commentLower.includes('resources competencies') || commentLower.includes('challenges') ||
        commentLower.includes('mature') || commentLower.includes('roadmap') ||
        commentLower.includes('rejig') || commentLower.includes('pumping') || 
        commentLower.includes('delivery standard') || commentLower.includes('talented resources')) {
      console.log('Category mapping debug for:', comment);
      console.log('Scores:', debugScores);
      console.log('Best match:', bestMatch, 'with score:', maxScore);
    }
    
    // Only return a category if there's a meaningful match (score > 0)
    return maxScore > 0 ? bestMatch : null;
  };

  // Process excelData when it's received
  useEffect(() => {
    if (excelData) {
      console.log('=== SENTIMENTS FEEDBACK DASHBOARD: Processing excelData ===');
      console.log('excelData structure:', excelData);
      console.log('excelData keys:', Object.keys(excelData));
      
      // Check if excelData has the expected structure with .data property
      let dataToProcess;
      if (excelData.data && Array.isArray(excelData.data)) {
        // excelData is the full result object with .data property
        dataToProcess = excelData.data;
        console.log('Excel data received (from excelData.data):', dataToProcess.length, 'rows');
      } else if (Array.isArray(excelData)) {
        // excelData is directly the data array
        dataToProcess = excelData;
        console.log('Excel data received (direct array):', dataToProcess.length, 'rows');
      } else {
        console.error('excelData is neither an object with .data property nor an array');
        return;
      }
      
      if (dataToProcess && dataToProcess.length > 0) {
        console.log('Sample data:', dataToProcess[0]);
        // Process the data using the same logic as before
        processExcelData(dataToProcess);
      } else {
        console.error('No data to process');
      }
    }
  }, [excelData, sentimentWordBank]);

  const processExcelData = (data) => {
    try {
      if (!data || data.length === 0) {
        console.error('No data to process');
        return;
      }
      
      console.log('Processing Excel data:', data.length, 'rows');
      
      // Find required columns
      const columns = Object.keys(data[0]);
      const businessUnitColumn = columns.find(col => 
        col === 'BUSSINESS UNIT' || col === 'BUSINESS UNIT' || col === 'business_unit' || col === 'Business Unit' ||
        col === 'BU' || col === 'bu' || col === 'BUSSINESS_UNIT' || col === 'BUSINESS_UNIT' ||
        col.toLowerCase().includes('business') && col.toLowerCase().includes('unit') ||
        col.toLowerCase().includes('bussiness') && col.toLowerCase().includes('unit')
      );
      
      // Find date columns for filtering
      const csatSentDateColumn = columns.find(col => 
        col === 'CSAT SENT DATE' || col === 'CSAT_SENT_DATE' || col === 'csat_sent_date' ||
        col.toLowerCase().includes('csat') && col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')
      );
      
      const csatReceivedDateColumn = columns.find(col => 
        col === 'CSAT RECEIVED DATE' || col === 'CSAT_RECEIVED_DATE' || col === 'csat_received_date' ||
        col.toLowerCase().includes('csat') && col.toLowerCase().includes('received') && col.toLowerCase().includes('date')
      );
      
      // Use actual column names from the Excel file
      const customerIdColumn = 'CUSTOMER_ID';
      const customerNameColumn = 'CUSTOMER NAME';
      const projIdColumn = 'PROJ_ID';
      const projectNameColumn = 'PROJECT NAME';
      const respondentNameColumn = 'RESPONDENT NAME';
      const ratingDescriptionColumn = 'RATING_DESCRIPTION';
      const perspectiveColumn = 'PERSPECTIVE';
      
      console.log('Column detection:', {
        businessUnitColumn,
        customerIdColumn,
        customerNameColumn,
        projIdColumn,
        projectNameColumn,
        respondentNameColumn,
        ratingDescriptionColumn,
        perspectiveColumn,
        csatSentDateColumn,
        csatReceivedDateColumn
      });
      
      if (!customerIdColumn || !ratingDescriptionColumn) {
        console.error('Required columns not found');
        return;
      }
      
      // Process data rows
      const customerData = new Map();
      
      data.forEach((row, index) => {
        const businessUnit = businessUnitColumn ? row[businessUnitColumn] : 'N/A';
        const customerId = row[customerIdColumn];
        const customerName = customerNameColumn ? row[customerNameColumn] : 'N/A';
        const projId = projIdColumn ? row[projIdColumn] : 'N/A';
        const projectName = projectNameColumn ? row[projectNameColumn] : 'N/A';
        const respondentName = respondentNameColumn ? row[respondentNameColumn] : 'N/A';
        const ratingDescription = row[ratingDescriptionColumn];
        const perspectiveValue = perspectiveColumn ? row[perspectiveColumn] : '';
        
        if (!customerId || !ratingDescription) return;
        
        // Apply date filtering if CSAT cycle start date is set
        if (csatCycleStartDateFormatted) {
          const csatSentDate = csatSentDateColumn ? row[csatSentDateColumn] : null;
          const csatReceivedDate = csatReceivedDateColumn ? row[csatReceivedDateColumn] : null;
          
          // Check if both dates are available and greater than or equal to CSAT cycle start date
          let shouldInclude = false;
          
          if (csatSentDate && csatReceivedDate) {
            const sentDateFormatted = formatDateToMMDDYYYY(csatSentDate);
            const receivedDateFormatted = formatDateToMMDDYYYY(csatReceivedDate);
            
            if (sentDateFormatted && receivedDateFormatted) {
              shouldInclude = isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted) &&
                            isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
            }
          }
          
          if (!shouldInclude) return; // Skip this row if it doesn't meet date criteria
        }
        
        // Create a unique key combining customerId and respondentName
        const uniqueKey = `${customerId}_${respondentName}`;
        
        // Store data for aggregation
        if (!customerData.has(uniqueKey)) {
          customerData.set(uniqueKey, {
            customerId,
            customerName,
            businessUnit,
            projId,
            projectName,
            respondentName,
            perspectives: {},
            ratingDescriptions: {}
          });
        }
        
        const customer = customerData.get(uniqueKey);
        
        // Store RATING_DESCRIPTION for each expected perspective
        if (perspectiveValue && perspectiveValue !== '') {
          expectedPerspectives.forEach(expectedPerspective => {
            // Special handling for Qualitative Feedback
            if (expectedPerspective === 'Qualitative Feedback') {
              if (perspectiveValue.toLowerCase() === 'qualitative feedback') {
                if (!customer.perspectives[expectedPerspective]) {
                  customer.perspectives[expectedPerspective] = [];
                  customer.ratingDescriptions[expectedPerspective] = [];
                }
                customer.perspectives[expectedPerspective].push(perspectiveValue);
                customer.ratingDescriptions[expectedPerspective].push(ratingDescription);
              }
            } else {
              // Regular perspective matching
              if (perspectiveValue.toLowerCase().includes(expectedPerspective.toLowerCase()) ||
                  expectedPerspective.toLowerCase().includes(perspectiveValue.toLowerCase())) {
                if (!customer.perspectives[expectedPerspective]) {
                  customer.perspectives[expectedPerspective] = [];
                  customer.ratingDescriptions[expectedPerspective] = [];
                }
                customer.perspectives[expectedPerspective].push(perspectiveValue);
                customer.ratingDescriptions[expectedPerspective].push(ratingDescription);
              }
            }
          });
        }
      });
      
      // Convert to final format
      const finalData = Array.from(customerData.values()).map((customer, index) => {
        const result = {
          sNo: index + 1,
          customerId: customer.customerId,
          customerName: customer.customerName,
          projId: customer.projId,
          projectName: customer.projectName,
          respondentName: customer.respondentName,
          businessUnit: customer.businessUnit
        };
        
        // Add RATING_DESCRIPTION for each expected perspective
        expectedPerspectives.forEach(perspective => {
          if (customer.ratingDescriptions[perspective] && customer.ratingDescriptions[perspective].length > 0) {
            // Join all rating descriptions for this perspective with semicolon separator
            result[perspective] = customer.ratingDescriptions[perspective].join('; ');
          } else {
            result[perspective] = 'N/A';
          }
        });
        
        // Calculate Category based on Resource Competency, Timely Resource Fulfillment, Overall Experience
        const resourceCompetency = result['Resource Competency'];
        const timelyResourceFulfillment = result['Timely Resource Fulfillment'];
        const overallExperience = result['Overall Experience'];
        
        let category = 2; // Default to category 2
        if ((resourceCompetency === '0' || resourceCompetency === '' || resourceCompetency === 'N/A' || resourceCompetency === null || resourceCompetency === undefined) ||
            (timelyResourceFulfillment === '0' || timelyResourceFulfillment === '' || timelyResourceFulfillment === 'N/A' || timelyResourceFulfillment === null || timelyResourceFulfillment === undefined) ||
            (overallExperience === '0' || overallExperience === '' || overallExperience === 'N/A' || overallExperience === null || overallExperience === undefined)) {
          category = 1;
        }
        
        result.category = category;

        // Analyze sentiment for each perspective using word bank
        const positiveCategories = new Set();
        const negativeCategories = new Set();
        const neutralCategories = new Set();

        expectedPerspectives.forEach(perspective => {
          const comment = result[perspective];
          if (comment && comment !== 'N/A' && comment !== '') {
            const cls = classifyWithWordBank(comment, perspective);
            if (cls.positive) positiveCategories.add(cls.positive);
            if (cls.negative) negativeCategories.add(cls.negative);
            if (cls.neutral) neutralCategories.add(cls.neutral);
          }
        });

        result['POSITIVE (Strength)'] = [...positiveCategories].join(', ') || 'N/A';
        result['NEGATIVE (Areas of Improvement)'] = [...negativeCategories].join(', ') || 'N/A';
        result['NEUTRAL'] = [...neutralCategories].join(', ') || 'N/A';
        
        return result;
      });
      
      console.log('Sample processed data:', finalData[0]);
      
      setUploadedData({
        headers: ['S No.', 'CUSTOMER_ID', 'CUSTOMER NAME', 'PROJ_ID', 'PROJECT NAME', 'RESPONDENT NAME', 'Category', 'BUSSINESS UNIT', ...expectedPerspectives, 'POSITIVE (Strength)', 'NEGATIVE (Areas of Improvement)', 'NEUTRAL'],
        data: finalData
      });
      
    } catch (error) {
      console.error('Error processing Excel data:', error);
    }
  };

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadedData(null);
      setUploadStatus(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedData(null);
    setUploadStatus(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Look for "CSAT received Report" sheet
          let sheetName = 'CSAT received Report';
          let worksheet = workbook.Sheets[sheetName];
          
          if (!worksheet) {
            // Try to find sheet with similar name
            const sheetNames = workbook.SheetNames;
            const foundSheet = sheetNames.find(name => 
              name.toLowerCase().includes('csat') && 
              name.toLowerCase().includes('received') && 
              name.toLowerCase().includes('report')
            );
            
            if (foundSheet) {
              sheetName = foundSheet;
              worksheet = workbook.Sheets[foundSheet];
              console.log(`Using sheet: ${foundSheet}`);
            } else {
              // Use first sheet as fallback
              sheetName = sheetNames[0];
              worksheet = workbook.Sheets[sheetNames[0]];
              console.log(`Sheet 'CSAT received Report' not found. Using first sheet: ${sheetName}`);
            }
          }
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve({ data: jsonData, sheetName });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setUploadStatus({ type: 'info', message: 'Processing file...' });
    
    try {
      const { data, sheetName } = await readExcelFile(selectedFile);
      
      if (!data || data.length < 2) {
        throw new Error('Invalid Excel file structure. Please ensure the file contains data.');
      }
      
      // Extract headers and data
      const headers = data[0];
      const rows = data.slice(1);
      
      console.log('Headers found:', headers);
      console.log('Sample row:', rows[0]);
      
      // Find required columns first
      const businessUnitColumn = headers.findIndex(col => 
        col === 'BUSSINESS UNIT' || col === 'BUSINESS UNIT' || col === 'business_unit' || col === 'Business Unit' ||
        col === 'BU' || col === 'bu' || col === 'BUSSINESS_UNIT' || col === 'BUSINESS_UNIT' ||
        col.toLowerCase().includes('business') && col.toLowerCase().includes('unit') ||
        col.toLowerCase().includes('bussiness') && col.toLowerCase().includes('unit')
      );
      
      const customerIdColumn = headers.findIndex(col => 
        col === 'CUST_ID' || col === 'CUSTOMER_ID' || col === 'Customer ID' || col === 'customer_id' || col === 'C_ID' ||
        col.toLowerCase().includes('customer') && col.toLowerCase().includes('id')
      );
      
      const projIdColumn = headers.findIndex(col => 
        col === 'PROJ_ID' || col === 'Project ID' || col === 'proj_id' || col === 'P_ID' ||
        col.toLowerCase().includes('project') && col.toLowerCase().includes('id')
      );
      
      const projectNameColumn = headers.findIndex(col => 
        col === 'PROJECT NAME' || col === 'Project Name' || col === 'project_name' || col === 'PROJECT_NAME' ||
        col.toLowerCase().includes('project') && col.toLowerCase().includes('name')
      );
      
      const respondentNameColumn = headers.findIndex(col => 
        col === 'RESPONDENT NAME' || col === 'Respondent Name' || col === 'respondent_name' || col === 'RESPONDENT_NAME' ||
        col.toLowerCase().includes('respondent') && col.toLowerCase().includes('name')
      );
      
      const ratingDescriptionColumn = headers.findIndex(col => 
        col === 'RATING_DESCRIPTION' || col === 'rating_description' || col === 'Rating Description' ||
        col.toLowerCase().includes('rating') && col.toLowerCase().includes('description')
      );
      
      const perspectiveColumn = headers.findIndex(col => 
        col === 'PERSPECTIVE' || col === 'perspective' || col === 'Perspective' ||
        col === 'QUESTION_PERSPECTIVE' || col === 'question_perspective' ||
        col.toLowerCase().includes('perspective')
      );
      
      // Find date columns for filtering
      const csatSentDateColumn = headers.findIndex(col => 
        col === 'CSAT SENT DATE' || col === 'CSAT_SENT_DATE' || col === 'csat_sent_date' ||
        col.toLowerCase().includes('csat') && col.toLowerCase().includes('sent') && col.toLowerCase().includes('date')
      );
      
      const csatReceivedDateColumn = headers.findIndex(col => 
        col === 'CSAT RECEIVED DATE' || col === 'CSAT_RECEIVED_DATE' || col === 'csat_received_date' ||
        col.toLowerCase().includes('csat') && col.toLowerCase().includes('received') && col.toLowerCase().includes('date')
      );
      
      console.log('Column indices:', {
        businessUnitColumn,
        customerIdColumn,
        projIdColumn,
        projectNameColumn,
        ratingDescriptionColumn,
        perspectiveColumn,
        csatSentDateColumn,
        csatReceivedDateColumn
      });
      
      if (customerIdColumn === -1 || ratingDescriptionColumn === -1) {
        throw new Error('Required columns not found. Please ensure the file contains CUSTOMER_ID and RATING_DESCRIPTION columns.');
      }
      
      if (businessUnitColumn !== -1) {
        console.log('Business Unit column found:', headers[businessUnitColumn]);
        const uniqueBusinessUnits = [...new Set(rows.map(row => row[businessUnitColumn]).filter(Boolean))];
        console.log('Unique Business Units found:', uniqueBusinessUnits);
      } else {
        console.log('No Business Unit column found');
      }
      
      // Process data rows
      const customerData = new Map();
      
      rows.forEach((row, index) => {
        if (row.length < Math.max(businessUnitColumn, customerIdColumn, ratingDescriptionColumn, projIdColumn) + 1) return;
        
        const businessUnit = businessUnitColumn !== -1 ? row[businessUnitColumn] : 'N/A';
        const customerId = row[customerIdColumn];
        const projId = projIdColumn !== -1 ? row[projIdColumn] : 'N/A';
        const projectName = projectNameColumn !== -1 ? row[projectNameColumn] : 'N/A';
        const respondentName = respondentNameColumn !== -1 ? row[respondentNameColumn] : 'N/A';
        const ratingDescription = row[ratingDescriptionColumn];
        const perspectiveValue = perspectiveColumn !== -1 ? row[perspectiveColumn] : '';
        
        if (!customerId || !ratingDescription) return;
        
        // Apply date filtering if CSAT cycle start date is set
        if (csatCycleStartDateFormatted) {
          const csatSentDate = csatSentDateColumn !== -1 ? row[csatSentDateColumn] : null;
          const csatReceivedDate = csatReceivedDateColumn !== -1 ? row[csatReceivedDateColumn] : null;
          
          // Check if both dates are available and greater than or equal to CSAT cycle start date
          let shouldInclude = false;
          
          if (csatSentDate && csatReceivedDate) {
            const sentDateFormatted = formatDateToMMDDYYYY(csatSentDate);
            const receivedDateFormatted = formatDateToMMDDYYYY(csatReceivedDate);
            
            if (sentDateFormatted && receivedDateFormatted) {
              shouldInclude = isDateGreaterThanOrEqual(sentDateFormatted, csatCycleStartDateFormatted) &&
                            isDateGreaterThanOrEqual(receivedDateFormatted, csatCycleStartDateFormatted);
            }
          }
          
          if (!shouldInclude) return; // Skip this row if it doesn't meet date criteria
        }
        
        // Create a unique key combining customerId and respondentName
        const uniqueKey = `${customerId}_${respondentName}`;
        
        // Store data for aggregation
        if (!customerData.has(uniqueKey)) {
          customerData.set(uniqueKey, {
            customerId,
            businessUnit,
            projId,
            projectName,
            respondentName,
            perspectives: {},
            ratingDescriptions: {}
          });
        }
        
        const customer = customerData.get(uniqueKey);
        
        // Store RATING_DESCRIPTION for each expected perspective
        if (perspectiveValue && perspectiveValue !== '') {
          expectedPerspectives.forEach(expectedPerspective => {
            // Special handling for Qualitative Feedback
            if (expectedPerspective === 'Qualitative Feedback') {
              if (perspectiveValue.toLowerCase() === 'qualitative feedback') {
                if (!customer.perspectives[expectedPerspective]) {
                  customer.perspectives[expectedPerspective] = [];
                  customer.ratingDescriptions[expectedPerspective] = [];
                }
                customer.perspectives[expectedPerspective].push(perspectiveValue);
                customer.ratingDescriptions[expectedPerspective].push(ratingDescription);
              }
            } else {
              // Regular perspective matching
              if (perspectiveValue.toLowerCase().includes(expectedPerspective.toLowerCase()) ||
                  expectedPerspective.toLowerCase().includes(perspectiveValue.toLowerCase())) {
                if (!customer.perspectives[expectedPerspective]) {
                  customer.perspectives[expectedPerspective] = [];
                  customer.ratingDescriptions[expectedPerspective] = [];
                }
                customer.perspectives[expectedPerspective].push(perspectiveValue);
                customer.ratingDescriptions[expectedPerspective].push(ratingDescription);
              }
            }
          });
        }
      });
      
      // Convert to final format
      const finalData = Array.from(customerData.values()).map((customer, index) => {
        const result = {
          sNo: index + 1,
          businessUnit: customer.businessUnit,
          customerId: customer.customerId,
          projId: customer.projId,
          projectName: customer.projectName,
          respondentName: customer.respondentName
        };
        
        // Add RATING_DESCRIPTION for each expected perspective
        expectedPerspectives.forEach(perspective => {
          if (customer.ratingDescriptions[perspective] && customer.ratingDescriptions[perspective].length > 0) {
            // Join all rating descriptions for this perspective with semicolon separator
            result[perspective] = customer.ratingDescriptions[perspective].join('; ');
          } else {
            result[perspective] = 'N/A';
          }
        });
        
        // Analyze sentiment for each perspective using word bank
        const positiveCategories = new Set();
        const negativeCategories = new Set();
        const neutralCategories = new Set();

        expectedPerspectives.forEach(perspective => {
          const comment = result[perspective];
          if (comment && comment !== 'N/A' && comment !== '') {
            const cls = classifyWithWordBank(comment, perspective);
            if (cls.positive) positiveCategories.add(cls.positive);
            if (cls.negative) negativeCategories.add(cls.negative);
            if (cls.neutral) neutralCategories.add(cls.neutral);
          }
        });

        result['POSITIVE (Strength)'] = [...positiveCategories].join(', ') || 'N/A';
        result['NEGATIVE (Areas of Improvement)'] = [...negativeCategories].join(', ') || 'N/A';
        result['NEUTRAL'] = [...neutralCategories].join(', ') || 'N/A';
        
        return result;
      });
      
      console.log('Sample processed data:', finalData[0]);
      
      setUploadedData({
        headers: ['S No.', 'CUSTOMER_ID', 'CUSTOMER NAME', 'PROJ_ID', 'PROJECT NAME', 'RESPONDENT NAME', 'Category', 'BUSSINESS UNIT', ...expectedPerspectives, 'POSITIVE (Strength)', 'NEGATIVE (Areas of Improvement)', 'NEUTRAL'],
        data: finalData
      });
      
      setUploadStatus({ 
        type: 'success', 
        message: `Successfully processed ${finalData.length} customer records from ${sheetName}` 
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      setUploadStatus({ 
        type: 'error', 
        message: `Error processing file: ${error.message}` 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Get unique business units for filter
  const uniqueBusinessUnits = useMemo(() => {
    if (!uploadedData || !uploadedData.data || uploadedData.data.length === 0) return [];
    
    // Get unique business units from the processed data
    return [...new Set(uploadedData.data.map(row => row.businessUnit).filter(Boolean))].sort();
  }, [uploadedData]);

  // Apply filters
  const filteredData = useMemo(() => {
    if (!uploadedData || !uploadedData.data || uploadedData.data.length === 0) return [];
    
    let filtered = uploadedData.data;
    
    // Apply business unit filter if available
    if (businessUnitFilter && uniqueBusinessUnits.length > 0) {
      filtered = filtered.filter(item => 
        item.businessUnit && 
        item.businessUnit.toString() === businessUnitFilter
      );
    }
    
    // Apply category filter if available
    if (categoryFilter) {
      filtered = filtered.filter(item => 
        item.category && 
        item.category.toString() === categoryFilter
      );
    }
    
    // Apply customer name search filter
    if (customerNameSearch) {
      filtered = filtered.filter(item => 
        item.customerName && 
        item.customerName.toString().toLowerCase().includes(customerNameSearch.toLowerCase())
      );
    }
    
    // Apply project name search filter
    if (projectNameSearch) {
      filtered = filtered.filter(item => 
        item.projectName && 
        item.projectName.toString().toLowerCase().includes(projectNameSearch.toLowerCase())
      );
    }
    
    return filtered;
  }, [uploadedData, businessUnitFilter, categoryFilter, customerNameSearch, projectNameSearch, uniqueBusinessUnits]);

  // Sorting functionality
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle numeric values
      if (typeof aVal === 'string' && !isNaN(parseFloat(aVal))) {
        aVal = parseFloat(aVal);
      }
      if (typeof bVal === 'string' && !isNaN(parseFloat(bVal))) {
        bVal = parseFloat(bVal);
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Download functionality
  const downloadData = async () => {
    if (!uploadedData || !uploadedData.data || uploadedData.data.length === 0) return;
    
    try {
      // Create a new workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sentiments Feedback Analysis');
      
      // Get headers from the first row of data
      const headers = Object.keys(uploadedData.data[0]);
      
      // Add headers
      worksheet.addRow(headers);
      
      // Style the header row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE5E7EB' }
      };
      
      // Add data rows
      uploadedData.data.forEach((row, index) => {
        const dataRow = worksheet.addRow(Object.values(row));
        
        // Apply word wrap to perspective description columns
        headers.forEach((header, colIndex) => {
          if (expectedPerspectives.includes(header)) {
            const cell = dataRow.getCell(colIndex + 1);
            cell.alignment = { 
              horizontal: 'left',
              vertical: 'top',
              wrapText: true 
            };
          }
        });
      });
      
      // Set column widths
      headers.forEach((header, index) => {
        if (header === 'sNo') {
          worksheet.getColumn(index + 1).width = 10;
        } else if (header.includes('CUSTOMER NAME') || header.includes('BUSSINESS UNIT')) {
          worksheet.getColumn(index + 1).width = 25;
        } else if (header.includes('PROJECT NAME')) {
          worksheet.getColumn(index + 1).width = 30; // PROJECT NAME column
        } else if (header.includes('RESPONDENT NAME')) {
          worksheet.getColumn(index + 1).width = 25; // RESPONDENT NAME column
        } else if (header === 'category') {
          worksheet.getColumn(index + 1).width = 15;
        } else if (expectedPerspectives.includes(header)) {
          worksheet.getColumn(index + 1).width = 40; // Perspective columns with descriptions
        } else if (header.includes('POSITIVE') || header.includes('NEGATIVE') || header.includes('NEUTRAL')) {
          worksheet.getColumn(index + 1).width = 35; // Sentiment analysis columns
        } else {
          worksheet.getColumn(index + 1).width = 20;
        }
      });
      
      // Generate and download the file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Sentiments_Feedback_Analysis_Dashboard.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
      
      console.log('Data exported successfully with formatting');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Error exporting data: ${error.message}. Please try again.`);
    }
  };

  // Handle table scroll to hide scroll hint
  const handleTableScroll = (event) => {
    if (event.target.scrollLeft > 0) {
      setShowScrollHint(false);
    }
  };

  if (!excelData || !uploadedData) {
    return (
      <DashboardContainer>
        <DashboardHeader>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <HeaderTitle>
              <BarChart3 size={24} /> Sentiments based on Avg Sentiments(Feedback) - Perspective Wise
            </HeaderTitle>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <DownloadButton onClick={downloadData}>
              <Download size={16} />
              Download Data
            </DownloadButton>
            {onBackToDashboard && (
              <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
                <ChevronLeft size={16} /> Back
              </BackButton>
            )}
          </div>
        </DashboardHeader>

        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          color: '#6b7280',
          background: '#f9fafb',
          borderRadius: '12px',
          margin: '2rem 0'
        }}>
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>
            Loading dashboard data...
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Please wait while we process your uploaded Excel file.
          </p>
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', fontSize: '0.75rem' }}>
            <p><strong>Debug Info:</strong></p>
            <p>excelData prop: {excelData ? `Received (${excelData.data?.length || 0} rows)` : 'Not received'}</p>
            <p>uploadedData state: {uploadedData ? `Set (${uploadedData.data?.length || 0} rows)` : 'Not set'}</p>
            <p>excelData type: {typeof excelData}</p>
            <p>excelData keys: {excelData ? Object.keys(excelData).join(', ') : 'null'}</p>
          </div>
        </div>
      </DashboardContainer>
    );
  }

  const sortedData = getSortedData(filteredData);

  return (
    <DashboardContainer>
      <DashboardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <HeaderTitle>
            <BarChart3 size={24} /> Sentiments based on Avg Sentiments(Feedback) - Perspective Wise
          </HeaderTitle>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <DownloadButton onClick={downloadData}>
            <Download size={16} />
            Download Data
          </DownloadButton>
          {onBackToDashboard && (
            <BackButton onClick={onBackToDashboard} aria-label="Back to Home" title="Back to Home">
              <ChevronLeft size={16} /> Back
            </BackButton>
          )}
        </div>
      </DashboardHeader>

      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <label htmlFor="bu-filter" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Filter by Business Unit:
            </label>
            <FilterSelect
              id="bu-filter"
              value={businessUnitFilter}
              onChange={(e) => setBusinessUnitFilter(e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <option value="">All Business Units</option>
              {uniqueBusinessUnits.map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))}
            </FilterSelect>
          </div>
          
          <div>
            <label htmlFor="category-filter" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Filter by Category:
            </label>
            <FilterSelect
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="">All Categories</option>
              <option value="1">Category 1</option>
              <option value="2">Category 2</option>
            </FilterSelect>
          </div>
          
          {(businessUnitFilter || categoryFilter || customerNameSearch || projectNameSearch) && (
            <button
              onClick={() => {
                setBusinessUnitFilter('');
                setCategoryFilter('');
                setCustomerNameSearch('');
                setProjectNameSearch('');
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
        
        {/* Search filters row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <div>
            <label htmlFor="customer-search" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Search Customer Name:
            </label>
            <input
              id="customer-search"
              type="text"
              value={customerNameSearch}
              onChange={(e) => setCustomerNameSearch(e.target.value)}
              placeholder="Enter customer name..."
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            />
          </div>
          
          <div>
            <label htmlFor="project-search" style={{ marginRight: '0.5rem', fontWeight: '500', color: '#374151' }}>
              Search Project Name:
            </label>
            <input
              id="project-search"
              type="text"
              value={projectNameSearch}
              onChange={(e) => setProjectNameSearch(e.target.value)}
              placeholder="Enter project name..."
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem',
                minWidth: '200px'
              }}
            />
          </div>
          
          {(customerNameSearch || projectNameSearch) && (
            <button
              onClick={() => {
                setCustomerNameSearch('');
                setProjectNameSearch('');
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Clear Search
            </button>
          )}
        </div>
        
      </FilterContainer>

      <ResultsSummary>
        <SummaryTitle>Sentiments Feedback Analysis Results</SummaryTitle>
        <SummaryGrid>
          <SummaryItem>
            <SummaryValue>{filteredData.length}</SummaryValue>
            <SummaryLabel>Total Customers</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {filteredData.reduce((sum, item) => {
                const validPerspectives = expectedPerspectives.filter(p => item[p] && item[p] !== 'N/A');
                return sum + validPerspectives.length;
              }, 0)}
            </SummaryValue>
            <SummaryLabel>Total Feedback Entries</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {expectedPerspectives.length}
            </SummaryValue>
            <SummaryLabel>Perspectives Covered</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {filteredData.filter(item => item.category === 1).length}
            </SummaryValue>
            <SummaryLabel>Category 1</SummaryLabel>
          </SummaryItem>
          <SummaryItem>
            <SummaryValue>
              {filteredData.filter(item => item.category === 2).length}
            </SummaryValue>
            <SummaryLabel>Category 2</SummaryLabel>
          </SummaryItem>
        </SummaryGrid>
      </ResultsSummary>

      <TableContainer>
        {showScrollHint && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem', 
            background: '#f0f9ff', 
            border: '1px solid #0ea5e9', 
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#0c4a6e'
          }}>
            💡 <strong>Tip:</strong> Use the horizontal scroll bar below to view all columns in the table
          </div>
        )}
        <TableWrapper onScroll={handleTableScroll}>
          <Table>
            <thead>
              <tr>
                <Th onClick={() => handleSort('sNo')} style={{ cursor: 'pointer' }}>
                  S No. {sortConfig.key === 'sNo' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('customerId')} style={{ cursor: 'pointer' }}>
                  CUSTOMER_ID {sortConfig.key === 'customerId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>
                  CUSTOMER NAME {sortConfig.key === 'customerName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('projId')} style={{ cursor: 'pointer' }}>
                  PROJ_ID {sortConfig.key === 'projId' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('projectName')} style={{ cursor: 'pointer' }}>
                  PROJECT NAME {sortConfig.key === 'projectName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('respondentName')} style={{ cursor: 'pointer' }}>
                  RESPONDENT NAME {sortConfig.key === 'respondentName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('category')} style={{ cursor: 'pointer' }}>
                  Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('businessUnit')} style={{ cursor: 'pointer' }}>
                  BUSSINESS UNIT {sortConfig.key === 'businessUnit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                
                {/* Expected perspective columns */}
                {expectedPerspectives.map(perspective => (
                  <Th key={perspective} onClick={() => handleSort(perspective)} style={{ cursor: 'pointer' }}>
                    {perspective} {sortConfig.key === perspective && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </Th>
                ))}
                
                {/* Sentiment analysis columns */}
                <Th onClick={() => handleSort('POSITIVE (Strength)')} style={{ cursor: 'pointer' }}>
                  POSITIVE (Strength) {sortConfig.key === 'POSITIVE (Strength)' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('NEGATIVE (Areas of Improvement)')} style={{ cursor: 'pointer' }}>
                  NEGATIVE (Areas of Improvement) {sortConfig.key === 'NEGATIVE (Areas of Improvement)' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th onClick={() => handleSort('NEUTRAL')} style={{ cursor: 'pointer' }}>
                  NEUTRAL {sortConfig.key === 'NEUTRAL' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </Th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, index) => (
                <tr key={index}>
                  <Td>{row.sNo}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.customerId}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.customerName}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.projId}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.projectName}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.respondentName}</Td>
                  <Td>{row.category}</Td>
                  <Td style={{ textAlign: 'left' }}>{row.businessUnit}</Td>
                  
                  {/* Expected perspective columns */}
                  {expectedPerspectives.map(perspective => (
                    <Td key={perspective}>{row[perspective] || 'N/A'}</Td>
                  ))}
                  
                  {/* Sentiment analysis columns */}
                  <Td style={{ color: '#059669', fontWeight: '500' }}>
                    {row['POSITIVE (Strength)'] || 'N/A'}
                  </Td>
                  <Td style={{ color: '#dc2626', fontWeight: '500' }}>
                    {row['NEGATIVE (Areas of Improvement)'] || 'N/A'}
                  </Td>
                  <Td style={{ color: '#6b7280', fontWeight: '500' }}>
                    {row['NEUTRAL'] || 'N/A'}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
        
        {/* Scroll indicator */}
        {showScrollHint && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#6b7280'
          }}>
            🔄 Scroll horizontally to view all columns
          </div>
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default SentimentsFeedbackDashboard;
