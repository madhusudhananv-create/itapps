import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import Header from './components/Header';
import AcsatAlertModal from './components/AcsatAlertModal';
import { Calendar, Check, CheckCircle2, RefreshCw, Loader2, BarChart3, TrendingUp, FileText, Target, Star, Link2 } from 'lucide-react';
import FilterPanel from './components/FilterPanel';
import AnalyticsCharts from './components/AnalyticsCharts';
import DataTable from './components/DataTable';
import FileUpload from './components/FileUpload';
import ExcelDataTable from './components/ExcelDataTable';
import GoldenStarDashboard from './components/GoldenStarDashboard';
import ScoreBasedDashboard from './components/ScoreBasedDashboard';
import AvgRatingDashboard from './components/AvgRatingDashboard';
import SentimentsDashboard from './components/SentimentsDashboard';
import SentimentsFeedbackDashboard from './components/SentimentsFeedbackDashboard';
import Golden5StarScoreDashboard from './components/Golden5StarScoreDashboard';
import Golden5StarSentimentsDashboard from './components/Golden5StarSentimentsDashboard';
import Perfect5RaterDashboard from './components/Perfect5RaterDashboard';
import LowScoreDashboard from './components/LowScoreDashboard';
import Top10AccountsDashboard from './components/Top10AccountsDashboard';
import Top10FiveRaterAccountsDashboard from './components/Top10FiveRaterAccountsDashboard';
import AccountWiseAvgDashboard from './components/AccountWiseAvgDashboard';
import CSATSurveyDashboard from './components/CSATSurveyDashboard';
import AccountWiseResponseRateDashboard from './components/AccountWiseResponseRateDashboard';
import BUWiseResponseRateDashboard from './components/BUWiseResponseRateDashboard';
import AccountwisePercentageDataForLessThan4RaterDashboard from './components/AccountwisePercentageDataForLessThan4RaterDashboard';
import AccountBUWiseResponseRateDashboard from './components/AccountBUWiseResponseRateDashboard';
import SatisfiedCustomersEachPerspectiveDashboard from './components/SatisfiedCustomersEachPerspectiveDashboard';
import AccountBUWiseOverallCSATScoreDistributionDashboard from './components/AccountBUWiseOverallCSATScoreDistributionDashboard';
import RespondentWiseAverageCSATScoresDashboard from './components/RespondentWiseAverageCSATScoresDashboard';
import QualitativeAnalysisDashboard from './components/QualitativeAnalysisDashboard';
import AccountLevelRatingDashboard from './components/AccountLevelRatingDashboard';
import ACSATSatisfiedCustomersEachPerspectiveDashboard from './components/ACSATSatisfiedCustomersEachPerspectiveDashboard';
import ACSATCountDashboard from './components/ACSATCountDashboard';
import NPSDashboard from './components/NPSDashboard';
import TopExpectationsAnalysisDashboard from './components/TopExpectationsAnalysisDashboard';
import NPSCorrelationDashboard from './components/NPSCorrelationDashboard';
import OrgLevelQualitativeAnalysisDashboard from './components/OrgLevelQualitativeAnalysisDashboard';
import PCSATQualitativeAnalysisDashboard from './components/PCSATQualitativeAnalysisDashboard';
import ACSATResponseRateDashboard from './components/ACSATResponseRateDashboard';
import TrendAnalysisUpload from './components/TrendAnalysisUpload';
import { csatData, accounts, projects, businessUnits } from './data/dummyData';
import { fetchPCSATReportData, fetchACSATReportData } from './services/csatReportsService';
import { getAllAccessibleCustomers } from './services/reportsApi';
import { formatDateToMMDDYYYY, getHalfYearLabel, getHalfYearOptions, getAnnualOptions } from './utils/dateUtils';
import { useCSATContext } from './context/CSATContext';

const AppContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  overflow-x: hidden;
`;

const NavigationMenu = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
`;

const NavButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 1px solid #d1d5db;
  background: ${props => props.active ? '#667eea' : 'white'};
  color: ${props => props.active ? 'white' : '#374151'};
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#5a67d8' : '#f3f4f6'};
    border-color: ${props => props.active ? '#5a67d8' : '#9ca3af'};
  }
`;

// New styled components for the home page
const HomeContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
`;

const HomeTitle = styled.h1`
  text-align: center;
  color: #1f2937;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
`;

const UploadSection = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  margin: 0.25rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CSATDateSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 1rem;
  margin: 0.75rem 0;
  text-align: center;
`;

const DateSectionTitle = styled.h3`
  margin: 0 0 0.35rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const DateInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 0.75rem 1rem;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  color: #374151;
  margin: 1rem 0;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;


const DateDisplay = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: #166534;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;





const UploadStatus = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  color: #166534;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const App = () => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBU, setSelectedBU] = useState('');
  const [excelData, setExcelData] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState(null);
  const [excelFileName, setExcelFileName] = useState(null);
  const [showExcelData, setShowExcelData] = useState(false);
  const [showGoldenStar, setShowGoldenStar] = useState(false);
  const [showScoreBased, setShowScoreBased] = useState(false);
  const [showAvgRating, setShowAvgRating] = useState(false);
  const [showSentiments, setShowSentiments] = useState(false);
  const [showGolden5StarScore, setShowGolden5StarScore] = useState(false);
  const [showGolden5StarSentiments, setShowGolden5StarSentiments] = useState(false);
  const [showPerfect5Rater, setShowPerfect5Rater] = useState(false);
  const [showLowScore, setShowLowScore] = useState(false);
  const [showTop10Accounts, setShowTop10Accounts] = useState(false);
  const [showTop10FiveRaterAccounts, setShowTop10FiveRaterAccounts] = useState(false);
  const [showAccountWiseAvg, setShowAccountWiseAvg] = useState(false);
  const [showCSATSurvey, setShowCSATSurvey] = useState(false);
  const [showAccountWiseResponseRate, setShowAccountWiseResponseRate] = useState(false);
  const [showBUWiseResponseRate, setShowBUWiseResponseRate] = useState(false);
  const [showAccountwisePercentageDataForLessThan4Rater, setShowAccountwisePercentageDataForLessThan4Rater] = useState(false);
  const [showAccountBUWiseResponseRate, setShowAccountBUWiseResponseRate] = useState(false);
  const [showSentimentsFeedback, setShowSentimentsFeedback] = useState(false);
  const [showSatisfiedCustomersEachPerspective, setShowSatisfiedCustomersEachPerspective] = useState(false);
  const [showAccountBUWiseOverallCSATScoreDistribution, setShowAccountBUWiseOverallCSATScoreDistribution] = useState(false);
  const [showRespondentWiseAverageCSATScores, setShowRespondentWiseAverageCSATScores] = useState(false);
  const [showQualitativeAnalysis, setShowQualitativeAnalysis] = useState(false);
  const [qualitativeAnalysisData, setQualitativeAnalysisData] = useState(null);
  const [pcsatQualitativeExcelData, setPcsatQualitativeExcelData] = useState(null);
  const [currentDashboard, setCurrentDashboard] = useState(null);
  const [showHomePage, setShowHomePage] = useState(true);
  const [showPCSATView, setShowPCSATView] = useState(false);
  const [showACSATUpload, setShowACSATUpload] = useState(false);
  const [acsatFileUploaded, setAcsatFileUploaded] = useState(false);
  const [acsatExcelData, setAcsatExcelData] = useState(null);
  const [acsatFileName, setAcsatFileName] = useState(null);
  const [showAccountLevelRating, setShowAccountLevelRating] = useState(false);
  const [showACSATSatisfiedCustomersEachPerspective, setShowACSATSatisfiedCustomersEachPerspective] = useState(false);
  const [showACSATCountDashboard, setShowACSATCountDashboard] = useState(false);
  const [showNPSDashboard, setShowNPSDashboard] = useState(false);
  const [showTopExpectationsAnalysis, setShowTopExpectationsAnalysis] = useState(false);
  const [showNPSCorrelation, setShowNPSCorrelation] = useState(false);
  const [showOrgLevelQualitativeAnalysis, setShowOrgLevelQualitativeAnalysis] = useState(false);
  const [showACSATResponseRateDashboard, setShowACSATResponseRateDashboard] = useState(false);
  
  // Trend analysis files (persists for entire session, array of file entries)
  const [trendAnalysisFiles, setTrendAnalysisFiles] = useState([]);
  const [showACSATTrendAnalysis, setShowACSATTrendAnalysis] = useState(false);
  
  // ACSAT-specific CSAT date state (derived from the Annual/Year dropdown below,
  // kept for the ACSAT dashboard components that already expect these props)
  const [acsatCycleStartDate, setAcsatCycleStartDate] = useState(null);
  const [acsatCycleStartDateFormatted, setAcsatCycleStartDateFormatted] = useState('');

  // ACSAT report-fetch state (live API data instead of manual Excel upload)
  const [acsatFetchLoading, setAcsatFetchLoading] = useState(false);
  const [acsatFetchError, setAcsatFetchError] = useState(null);
  const annualOptions = useMemo(() => getAnnualOptions(), []);
  const [acsatReportPeriod, setAcsatReportPeriod] = useState(annualOptions[0] || null);

  // ACSAT customer filter (mirrors PCSAT's, reuses the same accessible-customer
  // list loaded below — [] means "All Customers")
  const [acsatSelectedCustomers, setAcsatSelectedCustomers] = useState([]);
  const [acsatCustomerSearchTerm, setAcsatCustomerSearchTerm] = useState('');
  const [acsatCustomerDropdownOpen, setAcsatCustomerDropdownOpen] = useState(false);
  const acsatReportCustomerIds = acsatSelectedCustomers.length > 0
    ? acsatSelectedCustomers.map(c => c.id).join(',')
    : '-1';
  const toggleAcsatCustomer = (customer) => {
    setAcsatSelectedCustomers(prev =>
      prev.some(c => c.id === customer.id)
        ? prev.filter(c => c.id !== customer.id)
        : [...prev, customer]
    );
  };
  const acsatCustomerDropdownRef = React.useRef(null);
  useEffect(() => {
    if (acsatCustomerDropdownOpen && acsatCustomerDropdownRef.current) {
      acsatCustomerDropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [acsatCustomerDropdownOpen]);

  // PCSAT report-fetch filters (Phase 1: live API data instead of Excel upload)
  const halfYearOptions = useMemo(() => getHalfYearOptions(), []);
  const [pcsatReportStartDate, setPcsatReportStartDate] = useState(halfYearOptions[0]?.startDate || '');
  const [pcsatReportEndDate, setPcsatReportEndDate] = useState(halfYearOptions[0]?.endDate || '');

  const handlePcsatPeriodChange = (label) => {
    const option = halfYearOptions.find(o => o.label === label);
    if (option) {
      setPcsatReportStartDate(option.startDate);
      setPcsatReportEndDate(option.endDate);
    }
  };
  const [pcsatFetchLoading, setPcsatFetchLoading] = useState(false);
  const [pcsatFetchError, setPcsatFetchError] = useState(null);
  const [pcsatCustomerOptions, setPcsatCustomerOptions] = useState([]);
  const [pcsatCustomerOptionsLoading, setPcsatCustomerOptionsLoading] = useState(false);
  const [pcsatSelectedCustomers, setPcsatSelectedCustomers] = useState([]); // [] means "All Customers"
  const [pcsatCustomerSearchTerm, setPcsatCustomerSearchTerm] = useState('');
  const [pcsatCustomerDropdownOpen, setPcsatCustomerDropdownOpen] = useState(false);

  // Comma-joined customer id list derived from the multi-select; '-1' means
  // "resolve to all accessible customers" (handled by reportsApi).
  const pcsatReportCustomerIds = pcsatSelectedCustomers.length > 0
    ? pcsatSelectedCustomers.map(c => c.id).join(',')
    : '-1';

  const togglePcsatCustomer = (customer) => {
    setPcsatSelectedCustomers(prev =>
      prev.some(c => c.id === customer.id)
        ? prev.filter(c => c.id !== customer.id)
        : [...prev, customer]
    );
  };

  const filteredPcsatCustomerOptions = pcsatCustomerOptions.filter(c =>
    c.name.toLowerCase().includes(pcsatCustomerSearchTerm.toLowerCase())
  );

  const filteredAcsatCustomerOptions = pcsatCustomerOptions.filter(c =>
    c.name.toLowerCase().includes(acsatCustomerSearchTerm.toLowerCase())
  );

  const pcsatCustomerDropdownRef = React.useRef(null);
  useEffect(() => {
    if (pcsatCustomerDropdownOpen && pcsatCustomerDropdownRef.current) {
      pcsatCustomerDropdownRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [pcsatCustomerDropdownOpen]);

  // Load the accessible customer list once, for the Customer dropdown on
  // the PCSAT fetch panel (used to filter all dashboards by account).
  useEffect(() => {
    setPcsatCustomerOptionsLoading(true);
    getAllAccessibleCustomers()
      .then(setPcsatCustomerOptions)
      .catch(err => console.error('Failed to load customer list for dropdown:', err))
      .finally(() => setPcsatCustomerOptionsLoading(false));
  }, []);
  
  // Get CSAT cycle start date and ACSAT cycle from context
  const { 
    csatCycleStartDate: pcsatCycleStartDate, 
    csatCycleStartDateFormatted: pcsatCycleStartDateFormatted, 
    updateCSATCycleStartDate,
    acsatCycle,
    updateAcsatCycle,
    acsatTrendAnalysisFiles,
    addAcsatTrendFile,
    removeAcsatTrendFile,
    renameAcsatTrendFile
  } = useCSATContext();
  
  // Local state for CSAT date input
  const [localCSATDate, setLocalCSATDate] = useState('');
  
  // Navigation history for back button functionality
  const [navigationHistory, setNavigationHistory] = useState(['home']);
  const [currentPage, setCurrentPage] = useState('home');

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return csatData.filter(item => {
      const accountMatch = !selectedAccount || item.account === selectedAccount;
      const projectMatch = !selectedProject || item.project === selectedProject;
      const buMatch = !selectedBU || item.bu === selectedBU;
      
      return accountMatch && projectMatch && buMatch;
    });
  }, [selectedAccount, selectedProject, selectedBU]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (showExcelData && excelData) {
      return {
        totalRecords: excelData.length,
        averageScore: 0, // Not applicable for Excel data
        totalAccounts: 0 // Not applicable for Excel data
      };
    }
    
    if (showGoldenStar && excelData) {
      return {
        totalRecords: excelData.length,
        averageScore: 0, // Not applicable for Golden Star data
        totalAccounts: 0 // Not applicable for Golden Star data
      };
    }
    
    if (showScoreBased && excelData) {
      return {
        totalRecords: excelData.length,
        averageScore: 0, // Not applicable for Score Based data
        totalAccounts: 0 // Not applicable for Score Based data
      };
    }
    
    if (showAvgRating && excelData) {
      return {
        totalRecords: excelData.length,
        averageScore: 0, // Not applicable for Avg Rating data
        totalAccounts: 0 // Not applicable for Avg Rating data
      };
    }
    
    if (showSentiments && excelData) {
      return {
        totalRecords: excelData.length,
        averageScore: 0, // Not applicable for Sentiments data
        totalAccounts: 0 // Not applicable for Sentiments data
      };
    }
    
    const totalRecords = filteredData.length;
    const averageScore = totalRecords > 0 
      ? filteredData.reduce((sum, item) => sum + item.score, 0) / totalRecords 
      : 0;
    const totalAccounts = new Set(filteredData.map(item => item.account)).size;

    return { totalRecords, averageScore, totalAccounts };
  }, [filteredData, showExcelData, showGoldenStar, showScoreBased, showAvgRating, showSentiments, excelData]);

  const handleAccountChange = (account) => {
    setSelectedAccount(account);
  };

  const handleProjectChange = (project) => {
    setSelectedProject(project);
  };

  const handleBUChange = (bu) => {
    setSelectedBU(bu);
  };

  const handleClearFilters = () => {
    setSelectedAccount('');
    setSelectedProject('');
    setSelectedBU('');
  };

  const handleExcelDataUpload = (result) => {
    console.log('=== handleExcelDataUpload called ===');
    console.log('result:', result);
    console.log('result type:', typeof result);
    console.log('result.data:', result?.data);
    console.log('result.data type:', typeof result?.data);
    console.log('isArray result.data:', Array.isArray(result?.data));
    
    // Handle both old format (data, headers, originalColumnCount, fileName) and new format (result object)
    if (typeof result === 'object' && result.data) {
      // New format: result object with {data, headers, secondSheetData, fileName, etc.}
      console.log('Using new format - setting excelData to full result object');
      setExcelData(result);
      setExcelHeaders(result.headers);
      setExcelFileName(result.fileName || 'Uploaded File');
    } else {
      // Old format: individual parameters (for backward compatibility)
      console.log('Using old format - individual parameters');
      const [data, headers, originalColumnCount, fileName] = arguments;
      setExcelData(data);
      setExcelHeaders(headers);
      setExcelFileName(fileName || 'Uploaded File');
    }
    setShowExcelData(true);
    setShowHomePage(false);
    console.log('=== handleExcelDataUpload completed ===');
  };

  const handleFetchPCSATReportData = async () => {
    if (!pcsatReportStartDate || !pcsatReportEndDate) {
      setPcsatFetchError('Please select both Start Date and End Date.');
      return;
    }
    setPcsatFetchLoading(true);
    setPcsatFetchError(null);
    try {
      // Auto-derive the CSAT cycle start date / period label (e.g. "H1 2026")
      // from the selected Start Date, instead of asking for it separately.
      updateCSATCycleStartDate(pcsatReportStartDate, formatDateToMMDDYYYY(pcsatReportStartDate));
      updateAcsatCycle(getHalfYearLabel(pcsatReportStartDate));

      const result = await fetchPCSATReportData({
        startDate: pcsatReportStartDate,
        endDate: pcsatReportEndDate,
        customerIds: pcsatReportCustomerIds || '-1',
      });
      console.log('=== PCSAT fetched report data ===');
      console.log('Detail rows:', result.data?.length, result.data?.[0]);
      console.log('Status rows:', result.secondSheetData?.length, result.secondSheetData?.[0]);
      console.log('Full result:', result);
      handleExcelDataUpload(result);
      setShowPCSATView(false);
      navigateToPage('excelData');
    } catch (err) {
      console.error('Failed to fetch PCSAT report data:', err);
      setPcsatFetchError(err.message || 'Failed to fetch CSAT data from the server.');
    } finally {
      setPcsatFetchLoading(false);
    }
  };

  const handleFetchACSATReportData = async () => {
    if (!acsatReportPeriod) {
      setAcsatFetchError('Please select an Annual cycle before proceeding.');
      return;
    }
    setAcsatFetchLoading(true);
    setAcsatFetchError(null);
    try {
      const { startDate: startDateStr, endDate: endDateStr, label } = acsatReportPeriod;
      const dateObj = new Date(startDateStr);
      setAcsatCycleStartDate(dateObj);
      setAcsatCycleStartDateFormatted(formatDateToMMDDYYYY(dateObj));
      updateAcsatCycle(label);

      const workbook = await fetchACSATReportData({
        startDate: startDateStr,
        endDate: endDateStr,
        customerIds: acsatReportCustomerIds,
      });
      console.log('=== ACSAT fetched report data ===');
      console.log('Sheet names:', workbook.SheetNames);

      setAcsatExcelData(workbook);
      setAcsatFileUploaded(true);
      setAcsatFileName(`ACSAT_${label}.xlsx`);
    } catch (err) {
      console.error('Failed to fetch ACSAT report data:', err);
      setAcsatFetchError(err.message || 'Failed to fetch ACSAT data from the server.');
    } finally {
      setAcsatFetchLoading(false);
    }
  };

  const handleCSATCycleStartDateChange = (date) => {
    setCsatCycleStartDate(date);
    // Also store the formatted date in MM-DD-YYYY format for global access
    const formattedDate = formatDateToMMDDYYYY(date);
    setCsatCycleStartDateFormatted(formattedDate);
    console.log('CSAT Cycle Start Date:', { raw: date, formatted: formattedDate });
  };

  const handleLocalCSATDateChange = (e) => {
    const date = e.target.value;
    setLocalCSATDate(date);
    
    // Automatically store the date when selected
    if (date) {
      const formattedDate = formatDateToMMDDYYYY(date);
      updateCSATCycleStartDate(date, formattedDate);
      console.log('CSAT Cycle Start Date updated:', { raw: date, formatted: formattedDate });
    }
  };


  const switchToDummyData = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setExcelData(null);
    setExcelHeaders(null);
    setExcelFileName(null);
    setShowHomePage(true);
  };

  const reloadExcelData = () => {
    setExcelData(null);
    setExcelHeaders(null);
    setExcelFileName(null);
  };

  const switchToGoldenStar = () => {
    setShowExcelData(false);
    setShowGoldenStar(true);
    setShowScoreBased(false);
    setShowHomePage(false);
  };

  const switchToScoreBased = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(true);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowHomePage(false);
  };

  const switchToAvgRating = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(true);
    setShowSentiments(false);
    setShowHomePage(false);
  };

  const switchToSentiments = (data) => {
    console.log('=== switchToSentiments called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('data structure:', data);
    console.log('data keys:', data ? Object.keys(data) : 'null');
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(true);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      console.log('excelData will contain:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasHeaders: !!data.headers,
        hasSecondSheet: !!data.secondSheetData
      });
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToGolden5StarScore = (data) => {
    console.log('=== switchToGolden5StarScore called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(true);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10FiveRaterAccounts(false);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToGolden5StarSentiments = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(true);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowHomePage(false);
  };

  const switchToPerfect5Rater = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(true);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowHomePage(false);
  };

  const switchToLowScore = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(true);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowHomePage(false);
  };

  const switchToTop10Accounts = () => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(true);
    setShowTop10FiveRaterAccounts(false);
    setShowHomePage(false);
  };

  const switchToTop10FiveRaterAccounts = () => {
    console.log('switchToTop10FiveRaterAccounts called');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(true);
    setShowHomePage(false);
    console.log('showTop10FiveRaterAccounts set to true');
  };
  
  const switchToAccountWiseAvg = (data) => {
    console.log('Switching to Account-wise Avg (Questions) view with data:', data);
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(true);
    setShowCSATSurvey(false);
    setShowHomePage(false);
    
    // Store the uploaded data for the dashboard to use
    if (data) {
      setExcelData(data);
    }
  };
  
  const switchToCSATSurvey = () => {
    console.log('Switching to CSAT Survey Dashboard view');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(true);
    setShowHomePage(false);
  };

  const switchToAccountWiseResponseRate = (data) => {
    console.log('Switching to Account Wise Response Rate Dashboard view with data:', data);
    console.log('Current state before switch:', {
      showExcelData,
      showAccountWiseResponseRate,
      showHomePage
    });
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(true);
    setShowHomePage(false);
    
    // Store the uploaded data for the dashboard to use
    if (data) {
      setExcelData(data);
    }
    
    console.log('State after switch - showAccountWiseResponseRate should be true');
  };

  const switchToBUWiseResponseRate = () => {
    console.log('Switching to BU Wise Response Rate Dashboard view');
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(true);
    setShowHomePage(false);
  };

  const switchToAccountwisePercentageDataForLessThan4Rater = (data) => {
    console.log('=== switchToAccountwisePercentageDataForLessThan4Rater called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(true);
    setShowAccountBUWiseResponseRate(false);
    setShowSentimentsFeedback(false);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      setExcelData(data);
      console.log('excelData state should now be set to:', data);
    } else {
      console.log('No data provided, excelData not set');
      console.log('Current excelData state:', excelData);
    }
    
    console.log('=== After setting states ===');
    console.log('showAccountwisePercentageDataForLessThan4Rater:', true);
    console.log('showHomePage:', false);
    console.log('excelData state after setExcelData:', excelData);
  };

  const switchToAccountBUWiseResponseRate = (data) => {
    console.log('=== switchToAccountBUWiseResponseRate called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowAccountBUWiseResponseRate(true);
    setShowSentimentsFeedback(false);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToSentimentsFeedback = (data) => {
    console.log('=== switchToSentimentsFeedback called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('data structure:', data);
    console.log('data keys:', data ? Object.keys(data) : 'null');
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(true);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      console.log('excelData will contain:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasHeaders: !!data.headers,
        hasSecondSheet: !!data.secondSheetData
      });
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToSatisfiedCustomersEachPerspective = (data) => {
    console.log('=== switchToSatisfiedCustomersEachPerspective called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('data structure:', data);
    console.log('data keys:', data ? Object.keys(data) : 'null');
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(false);
    setShowSatisfiedCustomersEachPerspective(true);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      console.log('excelData will contain:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasHeaders: !!data.headers,
        hasSecondSheet: !!data.secondSheetData
      });
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToAccountBUWiseOverallCSATScoreDistribution = (data) => {
    console.log('=== switchToAccountBUWiseOverallCSATScoreDistribution called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('data structure:', data);
    console.log('data keys:', data ? Object.keys(data) : 'null');
    
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(false);
    setShowSatisfiedCustomersEachPerspective(false);
    setShowAccountBUWiseResponseRate(false);
    setShowAccountBUWiseOverallCSATScoreDistribution(true);
    setShowHomePage(false);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      console.log('excelData will contain:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasHeaders: !!data.headers,
        hasSecondSheet: !!data.secondSheetData
      });
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const switchToRespondentWiseAverageCSATScores = (data) => {
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(false);
    setShowSatisfiedCustomersEachPerspective(false);
    setShowAccountBUWiseResponseRate(false);
    setShowAccountBUWiseOverallCSATScoreDistribution(false);
    setShowRespondentWiseAverageCSATScores(true);
    setShowHomePage(false);
    if (data) {
      setExcelData(data);
    }
  };

  const switchToQualitativeAnalysis = (data) => {
    console.log('=== switchToQualitativeAnalysis called ===');
    console.log('data parameter:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('data structure:', data);
    console.log('data keys:', data ? Object.keys(data) : 'null');
    console.log('data.data:', data?.data);
    console.log('data.data type:', typeof data?.data);
    console.log('isArray data.data:', Array.isArray(data?.data));
    
    // Set the excelData state with the full data object
    setExcelData(data);
    // Also store the data specifically for Qualitative Analysis dashboard
    setQualitativeAnalysisData(data);
    
    // Use a single state to track current dashboard
    setCurrentDashboard('qualitativeAnalysis');
    
    // Set all other show states to false
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(false);
    setShowSatisfiedCustomersEachPerspective(false);
    setShowAccountBUWiseResponseRate(false);
    setShowAccountBUWiseOverallCSATScoreDistribution(false);
    setShowQualitativeAnalysis(true);
    setShowHomePage(false);
    
    console.log('=== switchToQualitativeAnalysis completed ===');
    console.log('currentDashboard will be set to: qualitativeAnalysis');
    console.log('qualitativeAnalysisData will be set to:', data);
    
    // Store the data for the dashboard
    if (data) {
      console.log('Setting excelData to:', data);
      console.log('excelData will contain:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        hasHeaders: !!data.headers,
        hasSecondSheet: !!data.secondSheetData
      });
      setExcelData(data);
    } else {
      console.log('No data provided, excelData not set');
    }
  };

  const navigateToPage = (pageName) => {
    setNavigationHistory(prev => [...prev, pageName]);
    setCurrentPage(pageName);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = [...navigationHistory];
      newHistory.pop(); // Remove current page
      const previousPage = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentPage(previousPage);
      
      // Navigate to previous page
      navigateToPreviousPage(previousPage);
    } else {
      // If no previous page, go to home
    setShowHomePage(true);
      setShowExcelData(false);
      setShowGoldenStar(false);
      setShowScoreBased(false);
      setShowAvgRating(false);
      setShowSentiments(false);
      setShowGolden5StarScore(false);
      setShowGolden5StarSentiments(false);
      setShowPerfect5Rater(false);
      setShowLowScore(false);
      setShowTop10Accounts(false);
      setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
      setShowSentimentsFeedback(false);
      setShowSatisfiedCustomersEachPerspective(false);
    }
  };

  const navigateToPreviousPage = (pageName) => {
    // Reset all page states
    setShowHomePage(false);
    setShowExcelData(false);
    setShowGoldenStar(false);
    setShowScoreBased(false);
    setShowAvgRating(false);
    setShowSentiments(false);
    setShowGolden5StarScore(false);
    setShowGolden5StarSentiments(false);
    setShowPerfect5Rater(false);
    setShowLowScore(false);
    setShowTop10Accounts(false);
    setShowTop10FiveRaterAccounts(false);
    setShowAccountWiseAvg(false);
    setShowCSATSurvey(false);
    setShowAccountWiseResponseRate(false);
    setShowBUWiseResponseRate(false);
    setShowAccountwisePercentageDataForLessThan4Rater(false);
    setShowSentimentsFeedback(false);
    
    // Set the previous page
    switch (pageName) {
      case 'home':
        setShowHomePage(true);
        break;
      case 'excelData':
        // Only show excelData page if we have valid data
        if (excelData && Array.isArray(excelData) && excelData.length > 0) {
          setShowExcelData(true);
        } else {
          // If no valid data, go back to home page
          setShowHomePage(true);
        }
        break;
      case 'accountWiseResponseRate':
        setShowAccountWiseResponseRate(true);
        break;
      case 'buWiseResponseRate':
        setShowBUWiseResponseRate(true);
        break;
      case 'golden5StarScore':
        setShowGolden5StarScore(true);
        break;
      case 'accountwisePercentageDataForLessThan4Rater':
        setShowAccountwisePercentageDataForLessThan4Rater(true);
        break;
      case 'sentiments':
        setShowSentiments(true);
        break;
      case 'sentimentsFeedback':
        setShowSentimentsFeedback(true);
        break;
      case 'csatSurvey':
        setShowCSATSurvey(true);
        break;
      case 'qualitativeAnalysis':
        setShowQualitativeAnalysis(true);
        break;
      case 'trendAnalysis':
        setCurrentDashboard('trendAnalysis');
        break;
      default:
        setShowHomePage(true);
    }
  };

  const handleAddTrendFile = (fileEntry) => {
    setTrendAnalysisFiles(prev => [...prev, fileEntry]);
  };

  // Fetches the same two live PCSAT reports (detail + status) used by the
  // main dashboards, for a comparison period, and saves it as a "trend file"
  // entry — replaces manually uploading a historical Excel file.
  const handleFetchPCSATTrendRange = async (startDate, endDate) => {
    const result = await fetchPCSATReportData({
      startDate,
      endDate,
      customerIds: pcsatReportCustomerIds || '-1',
    });
    const detailRows = Array.isArray(result.data) ? result.data : [];
    const statusRows = Array.isArray(result.secondSheetData) ? result.secondSheetData : [];

    const baseName = getHalfYearLabel(startDate) || `${startDate} to ${endDate}`;
    let saveName = baseName;
    let counter = 1;
    while (trendAnalysisFiles.some(f => f.saveName === saveName)) {
      saveName = `${baseName} (${counter})`;
      counter += 1;
    }

    handleAddTrendFile({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      saveName,
      originalName: `API Fetch (${startDate} to ${endDate})`,
      fileSize: 0,
      sheetNames: ['Detail', 'Status'],
      sheets: { Detail: detailRows, Status: statusRows },
      totalRows: detailRows.length + statusRows.length,
      uploadedAt: new Date().toISOString()
    });
  };

  // Fetches the live ACSAT reports (detail + status) for a comparison Annual
  // cycle and saves it as a trend file entry, mirroring handleFetchPCSATTrendRange
  // — replaces manually uploading a historical ACSAT Excel file. Sheet names
  // match the real workbook shape used elsewhere so ACSAT dashboards' existing
  // findAcsatReceivedReportSheetName/findAcsatSentReceivedSheetName lookups work unchanged.
  const handleFetchACSATTrendRange = async (startDate, endDate) => {
    const workbook = await fetchACSATReportData({
      startDate,
      endDate,
      customerIds: acsatReportCustomerIds,
    });
    const detailRows = XLSX.utils.sheet_to_json(workbook.Sheets['CSAT Received Report']);
    const statusRows = XLSX.utils.sheet_to_json(workbook.Sheets['CSAT Sent and Received Report']);

    const baseName = annualOptions.find(o => o.startDate === startDate)?.label || `${startDate} to ${endDate}`;
    let saveName = baseName;
    let counter = 1;
    while (acsatTrendAnalysisFiles.some(f => f.saveName === saveName)) {
      saveName = `${baseName} (${counter})`;
      counter += 1;
    }

    addAcsatTrendFile({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      saveName,
      originalName: `API Fetch (${startDate} to ${endDate})`,
      fileSize: 0,
      sheetNames: ['CSAT Received Report', 'CSAT Sent and Received Report'],
      sheets: { 'CSAT Received Report': detailRows, 'CSAT Sent and Received Report': statusRows },
      totalRows: detailRows.length + statusRows.length,
      uploadedAt: new Date().toISOString()
    });
  };

  const handleRemoveTrendFile = (fileId) => {
    setTrendAnalysisFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleRenameTrendFile = (fileId, newName) => {
    setTrendAnalysisFiles(prev => prev.map(f => f.id === fileId ? { ...f, saveName: newName } : f));
  };

  const handleUploadCSATSurvey = () => {
    setShowHomePage(false);
    setShowCSATSurvey(true);
    navigateToPage('csatSurvey');
  };

  const handleDashboardSelect = (dashboardType, data) => {
    console.log('=== handleDashboardSelect called ===');
    console.log('dashboardType:', dashboardType);
    console.log('data:', data);
    console.log('data length:', data?.length);
    console.log('data type:', typeof data);
    console.log('Current excelData state before switch:', excelData);
    console.log('Current excelData length before switch:', excelData?.length);
    
    switch (dashboardType) {
      case 'accountBUWiseAvg':
        navigateToPage('accountWiseAvg');
        switchToAccountWiseAvg(data);
        break;
      case 'accountWiseResponseRate':
        navigateToPage('accountWiseResponseRate');
        switchToAccountWiseResponseRate(data);
        break;
      case 'golden5StarScore':
        navigateToPage('golden5StarScore');
        switchToGolden5StarScore(data);
        break;
      case 'accountwisePercentageDataForLessThan4Rater':
        console.log('=== Switching to AccountwisePercentageDataForLessThan4Rater ===');
        console.log('Data being passed:', data);
        navigateToPage('accountwisePercentageDataForLessThan4Rater');
        switchToAccountwisePercentageDataForLessThan4Rater(data);
        break;
      case 'sentiments':
        console.log('=== handleDashboardSelect: sentiments case ===');
        console.log('About to call switchToSentiments with data:', data);
        console.log('Data structure check:', {
          isArray: Array.isArray(data),
          hasData: !!(data && data.data),
          dataLength: data?.data?.length,
          dataType: typeof data
        });
        navigateToPage('sentiments');
        switchToSentiments(data);
        break;
      case 'sentimentsFeedback':
        navigateToPage('sentimentsFeedback');
        switchToSentimentsFeedback(data);
        break;
      case 'satisfiedCustomersEachPerspective':
        navigateToPage('satisfiedCustomersEachPerspective');
        switchToSatisfiedCustomersEachPerspective(data);
        break;
      case 'accountBUWiseResponseRate':
        navigateToPage('accountBUWiseResponseRate');
        switchToAccountBUWiseResponseRate(data);
        break;
      case 'accountBUWiseOverallCSATScoreDistribution':
        navigateToPage('accountBUWiseOverallCSATScoreDistribution');
        switchToAccountBUWiseOverallCSATScoreDistribution(data);
        break;
      case 'respondentWiseAverageCSATScores':
        navigateToPage('respondentWiseAverageCSATScores');
        switchToRespondentWiseAverageCSATScores(data);
        break;
      case 'pcsatQualitativeAnalysis':
        setPcsatQualitativeExcelData(data || null);
        setCurrentDashboard('pcsatQualitativeAnalysis');
        setShowExcelData(false);
        setShowQualitativeAnalysis(true);
        setShowHomePage(false);
        break;
      case 'qualitativeAnalysis':
        navigateToPage('qualitativeAnalysis');
        switchToQualitativeAnalysis(data);
        break;
      case 'trendAnalysis':
        navigateToPage('trendAnalysis');
        setCurrentDashboard('trendAnalysis');
        setShowExcelData(false);
        setShowHomePage(false);
        break;
      default:
        console.log('Unknown dashboard type:', dashboardType);
    }
  };

  const handleBackToHome = () => {
    goBack(); // Use the centralized back navigation
  };

  const handleBackToDashboard = () => {
    goBack(); // Use the centralized back navigation
  };

  // Debug: Log all show states
  console.log('=== App Render Debug ===');
  console.log('currentDashboard:', currentDashboard);
  console.log('showQualitativeAnalysis:', showQualitativeAnalysis);
  console.log('showSentimentsFeedback:', showSentimentsFeedback);
  console.log('showSatisfiedCustomersEachPerspective:', showSatisfiedCustomersEachPerspective);
  console.log('showAccountBUWiseOverallCSATScoreDistribution:', showAccountBUWiseOverallCSATScoreDistribution);
  console.log('showExcelData:', showExcelData);
  console.log('showHomePage:', showHomePage);
  console.log('qualitativeAnalysisData:', qualitativeAnalysisData);

  return (
    <AppContainer>
      <AcsatAlertModal />
      <Header
        totalRecords={stats.totalRecords}
        averageScore={stats.averageScore}
        totalAccounts={stats.totalAccounts}
        isExcelData={showExcelData || showGoldenStar || showScoreBased || showAvgRating || showSentiments}
        isGoldenStar={showGoldenStar}
        isScoreBased={showScoreBased}
        isAvgRating={showAvgRating}
        isSentiments={showSentiments}
        hideStats={true}
      />
      
      <MainContent>
        {showHomePage ? (
          <HomeContainer>
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <ActionButton
                onClick={() => {
                  setShowACSATUpload(true);
                  setShowHomePage(false);
                }}
              >
                🏢 Account level CSAT (ACSAT)
              </ActionButton>
              
              <ActionButton
                onClick={() => {
                  setShowPCSATView(true);
                  setShowHomePage(false);
                }}
              >
                📋 Project level CSAT (PCSAT)
              </ActionButton>
            </div>
          </HomeContainer>
        ) : showPCSATView ? (
          <HomeContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <HomeTitle style={{ margin: 0 }}>Project level CSAT (PCSAT)</HomeTitle>
              <ActionButton
                onClick={() => {
                  setShowPCSATView(false);
                  setShowHomePage(true);
                }}
                style={{ 
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                  color: 'white'
                }}
              >
                ← Back to Home
              </ActionButton>
            </div>
            
            <CSATDateSection>
              <DateSectionTitle>
                📥 Fetch CSAT Data from Server
              </DateSectionTitle>
              <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                Select a period to pull live Customer Success Survey data
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Period</label>
                  <DateInput
                    as="select"
                    value={getHalfYearLabel(pcsatReportStartDate)}
                    onChange={(e) => handlePcsatPeriodChange(e.target.value)}
                  >
                    {halfYearOptions.map(o => (
                      <option key={o.label} value={o.label}>{o.label}</option>
                    ))}
                  </DateInput>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>Customer</label>
                  <DateInput
                    type="text"
                    placeholder={
                      pcsatCustomerOptionsLoading
                        ? 'Loading customers...'
                        : pcsatSelectedCustomers.length > 0
                          ? `${pcsatSelectedCustomers.length} selected`
                          : 'All Customers'
                    }
                    value={pcsatCustomerSearchTerm}
                    onChange={(e) => { setPcsatCustomerSearchTerm(e.target.value); setPcsatCustomerDropdownOpen(true); }}
                    onFocus={() => setPcsatCustomerDropdownOpen(true)}
                    disabled={pcsatCustomerOptionsLoading}
                    style={{ minWidth: '220px' }}
                  />
                  {pcsatCustomerDropdownOpen && (
                    <div
                      ref={pcsatCustomerDropdownRef}
                      style={{
                        position: 'absolute',
                        zIndex: 30,
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        marginTop: '2px',
                        width: '260px',
                        maxHeight: '260px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                      <div
                        onClick={() => setPcsatSelectedCustomers([])}
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          color: pcsatSelectedCustomers.length === 0 ? '#667eea' : '#374151'
                        }}
                      >
                        ✓ All Customers {pcsatSelectedCustomers.length === 0 ? '(selected)' : ''}
                      </div>
                      <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                        {filteredPcsatCustomerOptions.length === 0 ? (
                          <div style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', color: '#94a3b8' }}>No matches</div>
                        ) : (
                          filteredPcsatCustomerOptions.map(c => (
                            <label
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={pcsatSelectedCustomers.some(s => s.id === c.id)}
                                onChange={() => togglePcsatCustomer(c)}
                              />
                              {c.name}
                            </label>
                          ))
                        )}
                      </div>
                      <div style={{ textAlign: 'right', padding: '0.35rem 0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => { setPcsatCustomerDropdownOpen(false); setPcsatCustomerSearchTerm(''); }}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {pcsatFetchError && (
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.5rem' }}>{pcsatFetchError}</p>
              )}
            </CSATDateSection>

            <UploadSection>
              <UploadButton
                onClick={() => {
                  if (!pcsatReportStartDate || !pcsatReportEndDate) {
                    showAcsatAlert('Please select both Start Date and End Date before proceeding.');
                    return;
                  }
                  handleFetchPCSATReportData();
                }}
                disabled={!pcsatReportStartDate || !pcsatReportEndDate || pcsatFetchLoading}
                style={{
                  opacity: (!pcsatReportStartDate || !pcsatReportEndDate || pcsatFetchLoading) ? 0.5 : 1,
                  cursor: (!pcsatReportStartDate || !pcsatReportEndDate || pcsatFetchLoading) ? 'not-allowed' : 'pointer'
                }}
              >
                {pcsatFetchLoading ? '⏳ Fetching...' : '📊 Fetch CSAT Data'}
              </UploadButton>
            </UploadSection>
          </HomeContainer>
        ) : showACSATUpload ? (
          (() => {
            return (
          <HomeContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: acsatFileUploaded ? '0.75rem' : '2rem' }}>
              <HomeTitle style={{ margin: 0, fontSize: acsatFileUploaded ? '1.1rem' : undefined }}>{acsatFileUploaded ? 'ACSAT Dashboards' : 'Fetch ACSAT Data'}</HomeTitle>
              <ActionButton
                onClick={() => {
                  setShowACSATUpload(false);
                  setShowHomePage(true);
                  // Reset fetched data when going back
                  setAcsatFileUploaded(false);
                  setAcsatExcelData(null);
                  setAcsatFileName(null);
                }}
                style={{
                  background: 'transparent',
                  color: '#16233D',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#7c3aed'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#16233D'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
              >
                ← Back to Home
              </ActionButton>
            </div>

            {!acsatFileUploaded && (
            <div style={{
              background: 'white',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              margin: '1rem 0',
              textAlign: 'center'
            }}>
              <p style={{ margin: '0 0 1.25rem', color: '#6b7280', fontSize: '0.85rem' }}>
                Select an annual cycle and, optionally, a customer to retrieve ACSAT data from the CSM Reports API.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>
                    <Calendar size={14} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Select Cycle
                  </label>
                  <select
                    value={acsatReportPeriod?.label || ''}
                    onChange={(e) => setAcsatReportPeriod(annualOptions.find(o => o.label === e.target.value) || null)}
                    style={{ minWidth: '180px', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                  >
                    {annualOptions.map(o => (
                      <option key={o.label} value={o.label}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#374151', fontSize: '0.8rem' }}>
                    Customer
                  </label>
                  <input
                    type="text"
                    placeholder={
                      pcsatCustomerOptionsLoading
                        ? 'Loading customers...'
                        : acsatSelectedCustomers.length > 0
                          ? `${acsatSelectedCustomers.length} selected`
                          : 'All Customers'
                    }
                    value={acsatCustomerSearchTerm}
                    onChange={(e) => { setAcsatCustomerSearchTerm(e.target.value); setAcsatCustomerDropdownOpen(true); }}
                    onFocus={() => setAcsatCustomerDropdownOpen(true)}
                    disabled={pcsatCustomerOptionsLoading}
                    style={{ minWidth: '220px', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
                  />
                  {acsatCustomerDropdownOpen && (
                    <div
                      ref={acsatCustomerDropdownRef}
                      style={{
                        position: 'absolute',
                        zIndex: 30,
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        marginTop: '2px',
                        width: '260px',
                        maxHeight: '260px',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                      <div
                        onClick={() => setAcsatSelectedCustomers([])}
                        style={{
                          padding: '0.4rem 0.6rem',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderBottom: '1px solid #f1f5f9',
                          color: acsatSelectedCustomers.length === 0 ? '#667eea' : '#374151'
                        }}
                      >
                        <Check size={14} style={{ marginRight: '0.2rem', verticalAlign: 'text-bottom' }} />All Customers {acsatSelectedCustomers.length === 0 ? '(selected)' : ''}
                      </div>
                      <div style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                        {filteredAcsatCustomerOptions.length === 0 ? (
                          <div style={{ padding: '0.5rem 0.6rem', fontSize: '0.8rem', color: '#94a3b8' }}>No matches</div>
                        ) : (
                          filteredAcsatCustomerOptions.map(c => (
                            <label
                              key={c.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.3rem 0.6rem',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={acsatSelectedCustomers.some(s => s.id === c.id)}
                                onChange={() => toggleAcsatCustomer(c)}
                              />
                              {c.name}
                            </label>
                          ))
                        )}
                      </div>
                      <div style={{ textAlign: 'right', padding: '0.35rem 0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <button
                          onClick={() => { setAcsatCustomerDropdownOpen(false); setAcsatCustomerSearchTerm(''); }}
                          style={{
                            padding: '0.25rem 0.75rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
               <p style={{
                 marginBottom: '1.25rem',
                 color: '#1D4ED8',
                 fontSize: '0.8rem',
                 background: '#eff6ff',
                 border: '1px solid #bfdbfe',
                 padding: '0.6rem 0.9rem',
                 borderRadius: '6px',
                 fontWeight: '500'
               }}>
                 This will retrieve ACSAT data for <strong>{acsatReportPeriod?.label || 'the selected cycle'}</strong> from the CSM Reports API.
               </p>

              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1.5rem',
                margin: '1rem 0',
                background: '#fafbfc',
                textAlign: 'center'
              }}>
                <UploadButton
                  onClick={handleFetchACSATReportData}
                  disabled={acsatFetchLoading}
                  style={{
                    background: '#1D4ED8',
                    boxShadow: 'none',
                    opacity: acsatFetchLoading ? 0.5 : 1,
                    cursor: acsatFetchLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {acsatFetchLoading ? <><Loader2 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />Fetching...</> : acsatFileUploaded ? <><RefreshCw size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />Re-fetch ACSAT Data</> : <><BarChart3 size={16} style={{ marginRight: '0.4rem', verticalAlign: 'text-bottom' }} />Fetch ACSAT Data</>}
                </UploadButton>
                {acsatFileUploaded && !acsatFetchLoading && (
                  <p style={{ color: '#065f46', fontSize: '0.875rem', marginTop: '1rem' }}>
                    <CheckCircle2 size={14} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Data loaded for {acsatFileName}
                  </p>
                )}
                {acsatFetchError && (
                  <p style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '1rem' }}>{acsatFetchError}</p>
                )}
              </div>
            </div>
            )}

              {acsatFileUploaded && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  background: '#f0f9ff',
                  borderRadius: '8px',
                  border: '1px solid #0ea5e9',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#0c4a6e', fontSize: '0.95rem' }}>
                      Available Dashboards for ACSAT ({acsatReportPeriod?.label})
                    </h4>
                    <button
                      onClick={() => {
                        setAcsatFileUploaded(false);
                        setAcsatExcelData(null);
                        setAcsatFileName(null);
                      }}
                      style={{
                        padding: '0.3rem 0.75rem',
                        background: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer'
                      }}
                    >
                      <RefreshCw size={14} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Change Cycle
                    </button>
                  </div>

                  <div style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '0.4rem 0.9rem',
                        background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
                        borderRadius: '8px',
                        border: '1px solid #0d9488',
                        cursor: 'pointer',
                        minHeight: '34px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: '420px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)';
                      }}
                      onClick={() => {
                        setShowACSATUpload(false);
                        setShowACSATTrendAnalysis(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.currentTarget.click();
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.75rem', textAlign: 'center', lineHeight: '1.2' }}>
                        <TrendingUp size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Fetch ACSAT Trend Analysis
                        {acsatTrendAnalysisFiles.length > 0 ? ` (${acsatTrendAnalysisFiles.length} file${acsatTrendAnalysisFiles.length === 1 ? '' : 's'})` : ''}
                      </strong>
                    </div>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '0.5rem',
                    maxWidth: '100%',
                    padding: '0.75rem',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      padding: '0.65rem 0.9rem', 
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', 
                      borderRadius: '8px', 
                      border: '1px solid #3b82f6',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      opacity: 1,
                      minHeight: '54px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      maxWidth: '100%',
                      justifySelf: 'stretch'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}
                    onClick={() => {
                      if (!acsatCycle) {
                        showAcsatAlert('Please select a CSAT cycle before proceeding!');
                        return;
                      }
                      // Navigate to the Account Level Rating Dashboard
                      setShowACSATUpload(false);
                      setShowAccountLevelRating(true);
                    }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><TrendingUp size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise rating for each perspective Dashboard</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                        borderRadius: '8px', 
                        border: '1px solid #f59e0b',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 1,
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        justifySelf: 'stretch'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #d97706 0%, #b45309 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to Org level Qualitative analysis Dashboard
                        if (acsatFileUploaded && acsatExcelData) {
                          setShowACSATUpload(false);
                          setShowOrgLevelQualitativeAnalysis(true);
                        } else {
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><FileText size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise Qualitative analysis with bucket analysis</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                        borderRadius: '8px', 
                        border: '1px solid #ef4444',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 1,
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        justifySelf: 'stretch'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to Top Expectations Analysis Dashboard
                        console.log('🎯 Top Expectations Analysis button clicked');
                        console.log('acsatFileUploaded:', acsatFileUploaded);
                        console.log('acsatExcelData:', acsatExcelData);
                        
                        if (acsatFileUploaded && acsatExcelData) {
                          console.log('✅ Navigating to Top Expectations Analysis Dashboard');
                          setShowACSATUpload(false);
                          setShowTopExpectationsAnalysis(true);
                        } else {
                          console.log('❌ No Excel file uploaded');
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><Target size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise Top Expectations Analysis</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', 
                        borderRadius: '8px', 
                        border: '1px solid #06b6d4',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 1,
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        justifySelf: 'stretch'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to NPS Dashboard
                        if (acsatFileUploaded && acsatExcelData) {
                          setShowACSATUpload(false);
                          setShowNPSDashboard(true);
                        } else {
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><Star size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise dashboard for NPS</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s ease',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        textAlign: 'center',
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to NPS Correlation Dashboard
                        if (acsatFileUploaded && acsatExcelData) {
                          setShowACSATUpload(false);
                          setShowNPSCorrelation(true);
                        } else {
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><Link2 size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise Co-relation of NPS rating and perspective score</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                        borderRadius: '8px', 
                        border: '1px solid #10b981',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 1,
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        justifySelf: 'stretch'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to ACSAT Count Dashboard
                        if (acsatFileUploaded && acsatExcelData) {
                          setShowACSATUpload(false);
                          setShowACSATCountDashboard(true);
                        } else {
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><BarChart3 size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise % of 4,5 rater for Each Perspective</strong>
                    </div>
                    <div
                      style={{
                        padding: '0.65rem 0.9rem', 
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                        borderRadius: '8px', 
                        border: '1px solid #f97316',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        opacity: 1,
                        minHeight: '54px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        maxWidth: '100%',
                        justifySelf: 'stretch'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)'}
                      onClick={() => {
                        if (!acsatCycle) {
                          showAcsatAlert('Please select a CSAT cycle before proceeding!');
                          return;
                        }
                        // Navigate to Response Rate Dashboard
                        if (acsatFileUploaded && acsatExcelData) {
                          setShowACSATUpload(false);
                          setShowACSATResponseRateDashboard(true);
                        } else {
                          showAcsatAlert('Please upload an Excel file first!');
                        }
                      }}
                    >
                      <strong style={{ color: 'white', fontSize: '0.8rem', textAlign: 'center', lineHeight: '1.25' }}><TrendingUp size={16} style={{ marginRight: '0.3rem', verticalAlign: 'text-bottom' }} />Org level/BU wise dashboard for Response Rate</strong>
                    </div>
                  </div>
                </div>
              )}

              {!acsatFileUploaded && (
                <div style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 0.75rem',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.8rem',
                  color: '#64748b'
                }}>
                  <strong>Data source:</strong> CSM Reports API (live) &bull; <strong>Features:</strong> Account-level analysis, perspective-based insights, comprehensive reporting
                </div>
              )}
          </HomeContainer>
            );
          })()
        ) : showACSATTrendAnalysis ? (
          <TrendAnalysisUpload
            title="Fetch data for ACSAT trend analysis"
            backLabel="← Back to ACSAT"
            description="Fetch a comparison Annual cycle's ACSAT data (detail + status reports) from the server. Each fetch is saved with a unique name and persists for the entire session so ACSAT dashboards can use it for trend analysis."
            showSessionPersistenceNote
            onBack={() => {
              setShowACSATTrendAnalysis(false);
              setShowACSATUpload(true);
            }}
            trendFiles={acsatTrendAnalysisFiles}
            onAddTrendFile={addAcsatTrendFile}
            onRemoveTrendFile={removeAcsatTrendFile}
            onRenameTrendFile={renameAcsatTrendFile}
            onFetchRange={handleFetchACSATTrendRange}
            currentPeriodStartDate={acsatReportPeriod?.startDate}
            periodOptions={annualOptions}
            periodLabelFn={(startDate) => annualOptions.find(o => o.startDate === startDate)?.label || ''}
            filesSectionTitle="Fetched ACSAT trend cycles (saved for this session)"
          />
        ) : showAccountLevelRating ? (
          <AccountLevelRatingDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            trendAnalysisFiles={acsatTrendAnalysisFiles}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowAccountLevelRating(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showACSATSatisfiedCustomersEachPerspective ? (
          <ACSATSatisfiedCustomersEachPerspectiveDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowACSATSatisfiedCustomersEachPerspective(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showACSATCountDashboard ? (
          <ACSATCountDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            trendAnalysisFiles={acsatTrendAnalysisFiles}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowACSATCountDashboard(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showNPSDashboard ? (
          <NPSDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            trendAnalysisFiles={acsatTrendAnalysisFiles}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowNPSDashboard(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showTopExpectationsAnalysis ? (
          <TopExpectationsAnalysisDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowTopExpectationsAnalysis(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showNPSCorrelation ? (
          <NPSCorrelationDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowNPSCorrelation(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showOrgLevelQualitativeAnalysis ? (
          <OrgLevelQualitativeAnalysisDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowOrgLevelQualitativeAnalysis(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : showACSATResponseRateDashboard ? (
          <ACSATResponseRateDashboard 
            excelData={acsatExcelData}
            acsatCycleStartDate={acsatCycleStartDate}
            acsatCycleStartDateFormatted={acsatCycleStartDateFormatted}
            acsatCycle={acsatCycle}
            trendAnalysisFiles={acsatTrendAnalysisFiles}
            onBack={() => {
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                setShowACSATResponseRateDashboard(false);
                setShowACSATUpload(true);
              }, 0);
              
              // Don't reset file upload state - keep the uploaded file
            }}
          />
        ) : currentDashboard === 'pcsatQualitativeAnalysis' ? (
          <PCSATQualitativeAnalysisDashboard
            excelData={pcsatQualitativeExcelData}
            acsatCycleStartDateFormatted={pcsatCycleStartDateFormatted}
            onBack={() => {
              setCurrentDashboard(null);
              setPcsatQualitativeExcelData(null);
              setShowQualitativeAnalysis(false);
              setShowExcelData(true);
              setShowHomePage(false);
            }}
          />
        ) : currentDashboard === 'qualitativeAnalysis' ? (
          (() => {
            console.log('=== Rendering Qualitative Analysis Dashboard (Priority) ===');
            console.log('currentDashboard:', currentDashboard);
            console.log('qualitativeAnalysisData:', qualitativeAnalysisData);
            console.log('qualitativeAnalysisData type:', typeof qualitativeAnalysisData);
            console.log('qualitativeAnalysisData keys:', qualitativeAnalysisData ? Object.keys(qualitativeAnalysisData) : 'null');
            return (
              <QualitativeAnalysisDashboard 
                excelData={qualitativeAnalysisData}
                onBack={() => {
                  setCurrentDashboard(null);
                  setShowQualitativeAnalysis(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            );
          })()
        ) : currentDashboard === 'trendAnalysis' ? (
          <TrendAnalysisUpload
            title="Fetch data for trend analysis"
            onBack={() => {
              setCurrentDashboard(null);
              setShowExcelData(true);
              setShowHomePage(false);
            }}
            trendFiles={trendAnalysisFiles}
            onAddTrendFile={handleAddTrendFile}
            onRemoveTrendFile={handleRemoveTrendFile}
            onRenameTrendFile={handleRenameTrendFile}
            onFetchRange={handleFetchPCSATTrendRange}
            currentPeriodStartDate={pcsatReportStartDate}
            description="Fetch a comparison period's CSAT data (detail + status reports) from the server. Each fetch is saved with a unique name and persists for the entire session so other dashboards can use it for trend analysis."
          />
        ) : (
          <>
            
            {!showExcelData && !showGoldenStar && !showScoreBased && !showAvgRating && !showSentiments && !showGolden5StarScore && !showGolden5StarSentiments && !showPerfect5Rater && !showLowScore && !showTop10Accounts && !showTop10FiveRaterAccounts && !showAccountWiseAvg && !showAccountWiseResponseRate && !showBUWiseResponseRate && !showAccountwisePercentageDataForLessThan4Rater && !showAccountBUWiseResponseRate && !showSentimentsFeedback && !showCSATSurvey && !showSatisfiedCustomersEachPerspective && !showAccountBUWiseOverallCSATScoreDistribution && !showRespondentWiseAverageCSATScores ? (
              <FilterPanel
                selectedAccount={selectedAccount}
                selectedProject={selectedProject}
                selectedBU={selectedBU}
                onAccountChange={handleAccountChange}
                onProjectChange={handleProjectChange}
                onBUChange={handleBUChange}
                onClearFilters={handleClearFilters}
                accounts={accounts}
                projects={projects}
                businessUnits={businessUnits}
              />
            ) : showGoldenStar ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <GoldenStarDashboard data={excelData} />
                )}
              </>
            ) : showScoreBased ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <ScoreBasedDashboard data={excelData} />
                )}
              </>
            ) : showAvgRating ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <AvgRatingDashboard data={excelData} />
                )}
              </>
            ) : showSentiments ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <SentimentsDashboard onBackToDashboard={handleBackToDashboard} excelData={excelData} />
                )}
              </>
            ) : showGolden5StarScore ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                    onCSATCycleStartDateChange={handleCSATCycleStartDateChange}
                    csatCycleStartDate={csatCycleStartDate}
                  />
                ) : (
                  <Golden5StarScoreDashboard onBackToDashboard={handleBackToDashboard} excelData={excelData} />
                )}
              </>
            ) : showGolden5StarSentiments ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                    onCSATCycleStartDateChange={handleCSATCycleStartDateChange}
                    csatCycleStartDate={csatCycleStartDate}
                  />
                ) : (
                  <Golden5StarSentimentsDashboard 
                    data={excelData} 
                    onBackToDashboard={() => {
                      console.log('Back to Dashboard clicked - Golden 5 Star Sentiments');
                      setShowGolden5StarSentiments(false);
                      setShowExcelData(true);
                    }}
                  />
                )}
              </>
            ) : showPerfect5Rater ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <Perfect5RaterDashboard 
                    data={excelData} 
                    onBackToDashboard={() => {
                      console.log('Back to Dashboard clicked - Perfect 5 Rater');
                      setShowPerfect5Rater(false);
                      setShowExcelData(true);
                    }}
                    onSwitchToTop10Accounts={() => {
                      setShowPerfect5Rater(false);
                      setShowTop10Accounts(true);
                    }}
                  />
                )}
              </>
            ) : showLowScore ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <LowScoreDashboard 
                    data={excelData} 
                    onBackToDashboard={() => {
                      setShowLowScore(false);
                      setShowExcelData(true);
                    }}
                  />
                )}
              </>
            ) : showTop10Accounts ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <Top10AccountsDashboard 
                    data={excelData} 
                    onBackToDashboard={() => {
                      setShowTop10Accounts(false);
                      setShowExcelData(true);
                    }}
                  />
                )}
              </>
            ) : showTop10FiveRaterAccounts ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <Top10FiveRaterAccountsDashboard 
                    data={excelData} 
                    onBackToDashboard={() => {
                      setShowTop10FiveRaterAccounts(false);
                      setShowExcelData(true);
                    }}
                  />
                )}
              </>
            ) : showAccountWiseAvg ? (
              <AccountWiseAvgDashboard 
                excelData={excelData}
                trendAnalysisFiles={trendAnalysisFiles}
                onBack={() => {
                  setShowAccountWiseAvg(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showAccountWiseResponseRate ? (
              <div>
                {console.log('Rendering AccountwisePercentageDataForLessThan4RaterDashboard for Response Rate, showAccountWiseResponseRate:', showAccountWiseResponseRate)}
                <AccountwisePercentageDataForLessThan4RaterDashboard 
                  excelData={excelData}
                  onBack={() => {
                    setShowAccountWiseResponseRate(false);
                    setShowExcelData(true);
                    setShowHomePage(false);
                  }}
                />
              </div>
            ) : showBUWiseResponseRate ? (
              <BUWiseResponseRateDashboard 
                onBackToDashboard={() => {
                  setShowBUWiseResponseRate(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showAccountwisePercentageDataForLessThan4Rater ? (
              <div>
                {console.log('=== RENDERING AccountwisePercentageDataForLessThan4RaterDashboard ===')}
                {console.log('showAccountwisePercentageDataForLessThan4Rater:', showAccountwisePercentageDataForLessThan4Rater)}
                {console.log('excelData being passed to component:', excelData)}
                {console.log('excelData length being passed:', excelData?.length)}
              <AccountwisePercentageDataForLessThan4RaterDashboard 
                  excelData={excelData}
                onBack={() => {
                  setShowAccountwisePercentageDataForLessThan4Rater(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
              </div>
            ) : showAccountBUWiseResponseRate ? (
              <AccountBUWiseResponseRateDashboard 
                excelData={excelData}
                trendAnalysisFiles={trendAnalysisFiles}
                onBack={() => {
                  setShowAccountBUWiseResponseRate(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showSentimentsFeedback ? (
              <SentimentsFeedbackDashboard 
                excelData={excelData}
                onBackToDashboard={() => {
                  setShowSentimentsFeedback(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showSatisfiedCustomersEachPerspective ? (
              (() => {
                console.log('🎯 RENDERING SatisfiedCustomersEachPerspectiveDashboard');
                console.log('showSatisfiedCustomersEachPerspective:', showSatisfiedCustomersEachPerspective);
                console.log('excelData for dashboard:', excelData);
                console.log('excelData.data length:', excelData?.data?.length || 0);
                return (
                  <SatisfiedCustomersEachPerspectiveDashboard 
                    excelData={excelData}
                    trendAnalysisFiles={trendAnalysisFiles}
                    onBack={() => {
                      console.log('Back button clicked');
                      setShowSatisfiedCustomersEachPerspective(false);
                      setShowExcelData(true);
                      setShowHomePage(false);
                    }}
                  />
                );
              })()
            ) : showAccountBUWiseOverallCSATScoreDistribution ? (
              <AccountBUWiseOverallCSATScoreDistributionDashboard
                excelData={excelData}
                trendAnalysisFiles={trendAnalysisFiles}
                onBack={() => {
                  setShowAccountBUWiseOverallCSATScoreDistribution(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showRespondentWiseAverageCSATScores ? (
              <RespondentWiseAverageCSATScoresDashboard
                excelData={excelData}
                trendAnalysisFiles={trendAnalysisFiles}
                onBack={() => {
                  setShowRespondentWiseAverageCSATScores(false);
                  setShowExcelData(true);
                  setShowHomePage(false);
                }}
              />
            ) : showCSATSurvey ? (
              <>
                {!excelData ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload}
                    onCSATSurveyRequest={(data) => {
                      setExcelData(data);
                      setExcelHeaders(null);
                      // Now the dashboard will show since excelData is set
                    }}
                    onDashboardSelect={handleDashboardSelect}
                  />
                ) : (
                  <CSATSurveyDashboard 
                    data={excelData}
                    onBack={() => {
                      setShowCSATSurvey(false);
                      setShowExcelData(true);
                    }}
                  />
                )}
              </>
            ) : showExcelData ? (
              <>
                <FileUpload
                  onDataUpload={handleExcelDataUpload}
                  onDashboardSelect={handleDashboardSelect}
                  onBackToHome={() => {
                    setShowExcelData(false);
                    setShowHomePage(true);
                  }}
                  uploadedData={excelData}
                  uploadedFileName={excelFileName}
                />
              </>
            ) : (
              <>
                {!excelData || !Array.isArray(excelData) || excelData.length === 0 ? (
                  <FileUpload 
                    onDataUpload={handleExcelDataUpload} 
                    onDashboardSelect={handleDashboardSelect}
                    uploadedData={excelData}
                    uploadedFileName={excelFileName}
                  />
                ) : (
                  <ExcelDataTable 
                    data={excelData} 
                    headers={excelHeaders} 
                    onReload={reloadExcelData}
                    onSwitchToPerfect5Rater={switchToPerfect5Rater}
                    onSwitchToLowScore={() => {
                      setShowLowScore(false);
                      setShowExcelData(true);
                    }}
                    onSwitchToTop10Accounts={switchToTop10Accounts}
                    onSwitchToTop10FiveRaterAccounts={switchToTop10FiveRaterAccounts}
                    onSwitchToAccountWiseAvg={switchToAccountWiseAvg}
                    onSwitchToCSATSurvey={switchToCSATSurvey}
                  />
                )}
              </>
            )}
          </>
        )}
      </MainContent>
    </AppContainer>
  );
};

export default App; 