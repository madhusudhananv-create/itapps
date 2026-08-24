import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Calendar, Building2, BarChart3, Users, TrendingUp, MessageCircle, Calculator, Target, Star, PieChart, Home, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCSATContext } from '../context/CSATContext';
import { formatDateToMMDDYYYY } from '../utils/dateUtils';

// Dashboards not yet ready for use; disabled on the selection grid until re-enabled.
const TEMPORARILY_DISABLED_DASHBOARD_IDS = new Set([]);

const UploadContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 1.5rem 0;
  overflow: hidden;
`;

const UploadHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  text-align: center;
  position: relative;
`;

const BackToHomeButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const HeaderTitle = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  font-size: 1rem;
  opacity: 0.9;
  color: #ffffff;
`;

const UploadContent = styled.div`
  padding: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.isDragOver ? '#667eea' : '#d1d5db'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.isDragOver ? '#f0f4ff' : '#f9fafb'};
  margin: 1.5rem 0;

  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #667eea;
`;

const UploadText = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
`;

const CSATCycleDateSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const DateSectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #374151;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const DashboardSelection = styled.div`
  margin-top: 2rem;
  background-color: #e0f2fe;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #b3e5fc;
`;

const DashboardTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const DASHBOARD_CARD_COLORS = {
  red:    { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',    border: 'rgba(220, 38, 38, 0.5)' },
  green:  { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',    border: 'rgba(22, 163, 74, 0.5)' },
  yellow: { bg: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',    border: 'rgba(202, 138, 4, 0.5)' },
  orange: { bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',     border: 'rgba(234, 88, 12, 0.5)' },
  pink:   { bg: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',     border: 'rgba(219, 39, 119, 0.5)' }
};
const CARD_VARIANTS = ['red', 'green', 'yellow', 'orange', 'pink'];

const DashboardCard = styled.button`
  background: ${props => DASHBOARD_CARD_COLORS[props.$variant]?.bg || DASHBOARD_CARD_COLORS.red.bg};
  color: white;
  border: 1px solid ${props => DASHBOARD_CARD_COLORS[props.$variant]?.border || DASHBOARD_CARD_COLORS.red.border};
  border-radius: 8px;
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    filter: brightness(1.08);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    filter: none;
  }
`;

const DashboardIcon = styled.div`
  color: rgba(255, 255, 255, 0.95);
  font-size: 1.25rem;
`;

const DashboardInfo = styled.div`
  flex: 1;
`;

const DashboardName = styled.div`
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
`;

const DashboardDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  ${props => props.type === 'success' && `
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #166534;
  `}
  
  ${props => props.type === 'error' && `
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  `}
  
  ${props => props.type === 'info' && `
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1d4ed8;
  `}
`;

const FileInfo = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FileDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #374151;
`;

const FileSize = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const RemoveButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;

  &:hover {
    background: #dc2626;
  }
`;


const FileFormatInfo = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
`;

const FileFormatTitle = styled.div`
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const FileFormatList = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
`;

const FileUpload = ({ 
  onDataUpload, 
  onDashboardSelect, 
  onCSATCycleStartDateChange,
  csatCycleStartDate,
  onCSATSurveyRequest,
  onBackToHome,
  uploadedData,
  uploadedFileName
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const { csatCycleStartDate: contextDate, csatCycleStartDateFormatted, updateCSATCycleStartDate, acsatCycle } = useCSATContext();

  // Effect to set uploaded file when coming back from dashboard
  useEffect(() => {
    if (uploadedData && uploadedFileName) {
      // Create a mock file object for display
      const mockFile = {
        name: uploadedFileName,
        size: 0, // We don't have the original file size
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      setUploadedFile(mockFile);
      setSuccess(`File already uploaded: ${uploadedFileName}`);
    }
  }, [uploadedData, uploadedFileName]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setSuccess(null);
    setUploadedFile(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
      handleFileSelect(file);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processExcelFile = async (file) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];
      const firstSheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Get headers from first row
      const headers = firstSheetData[0] || [];
      const dataRows = firstSheetData.slice(1);
            
            // Convert to objects
            const processedData = dataRows.map(row => {
              const obj = {};
              headers.forEach((header, index) => {
                obj[header] = row[index] || '';
              });
              return obj;
      }).filter(row => Object.values(row).some(value => value !== ''));

      // Check for second sheet
            let secondSheetData = null;
      if (workbook.SheetNames.length > 1) {
        const secondSheetName = workbook.SheetNames[1];
        const secondSheet = workbook.Sheets[secondSheetName];
        const secondSheetRawData = XLSX.utils.sheet_to_json(secondSheet, { header: 1 });
        
        if (secondSheetRawData.length > 0) {
          const secondHeaders = secondSheetRawData[0] || [];
          const secondDataRows = secondSheetRawData.slice(1);
                
                secondSheetData = secondDataRows.map(row => {
                  const obj = {};
                  secondHeaders.forEach((header, index) => {
                    obj[header] = row[index] || '';
                  });
                  return obj;
          }).filter(row => Object.values(row).some(value => value !== ''));
              }
            }

            const result = {
              data: processedData,
        headers: headers,
              secondSheetData: secondSheetData,
        fileName: file.name,
        fileSize: file.size,
        sheetNames: workbook.SheetNames
      };
      
      setSuccess(`File processed successfully! Found ${processedData.length} records.`);
      
      // Call the appropriate callback based on context
      if (onCSATSurveyRequest) {
        onCSATSurveyRequest(result);
      } else if (onDataUpload) {
        onDataUpload(result);
      }
      
      return result;
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error processing file. Please make sure it\'s a valid Excel file.');
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessFile = async () => {
    if (!uploadedFile) return;
    
    try {
      await processExcelFile(uploadedFile);
    } catch (err) {
      // Error already handled in processExcelFile
    }
  };

  const handleCSATCycleDateChange = (e) => {
    const date = e.target.value;
    const formattedDate = formatDateToMMDDYYYY(date);
    
    if (onCSATCycleStartDateChange) {
      onCSATCycleStartDateChange(date);
    }
    
    if (updateCSATCycleStartDate) {
      updateCSATCycleStartDate(date, formattedDate);
    }
  };

  const dashboardOptions = [
    {
      id: 'accountBUWiseAvg',
      name: 'Account/BU wise Average CSAT Scores - Perspective Wise',
      description: 'Average CSAT scores by account and business unit perspective',
      icon: <Calculator size={20} />,
      requiresData: true
    },
    {
      id: 'accountBUWiseResponseRate',
      name: 'Account/BU wise Response Rate Dashboard',
      description: 'Response rates by account and business unit',
      icon: <TrendingUp size={20} />,
      requiresData: true
    },
    {
      id: 'satisfiedCustomersEachPerspective',
      name: 'Account/BU wise percentage of Satisfied Customers(Each Perspective)',
      description: 'Satisfied customer analysis by perspective',
      icon: <Users size={20} />,
      requiresData: true
    },
    {
      id: 'accountwisePercentageDataForLessThan4Rater',
      name: 'Accountwise percentage for <4 rater:',
      description: 'Percentage analysis for ratings below 4',
      icon: <PieChart size={20} />,
      requiresData: true
    },
    {
      id: 'accountBUWiseOverallCSATScoreDistribution',
      name: 'Account/BU wise Overall CSAT score -Distribution(Score 1 to 5)',
      description: 'CSAT score distribution analysis',
      icon: <Target size={20} />,
      requiresData: true
    },
    {
      id: 'respondentWiseAverageCSATScores',
      name: 'Respondent wise Average CSAT Scores',
      description: 'Average CSAT rating per respondent with trend vs the last cycle',
      icon: <Star size={20} />,
      requiresData: true
    },
    {
      id: 'pcsatQualitativeAnalysis',
      name: 'PCSAT: Qualitative analysis',
      description: 'Business Unit and Customer Name from reference file (CSAT received/sent and received)',
      icon: <FileText size={20} />,
      requiresData: true
    },
    {
      id: 'qualitativeAnalysis',
      name: 'Org level/BU wise Qualitative analysis',
      description: 'Advanced qualitative feedback analysis and insights',
      icon: <FileText size={20} />,
      requiresData: true
    },
    {
      id: 'trendAnalysis',
      name: 'Fetch data for trend analysis',
      description: 'Fetch a comparison period from the Customer Success Survey All PCSAT report for CSAT trend analysis',
      icon: <TrendingUp size={20} />,
      requiresData: true
    }
  ];

  const handleDashboardClick = (dashboardId) => {
    console.log('=== handleDashboardClick called ===');
    console.log('dashboardId:', dashboardId);
    console.log('csatCycleStartDateFormatted:', csatCycleStartDateFormatted);
    console.log('onDashboardSelect:', !!onDashboardSelect);
    console.log('uploadedFile:', !!uploadedFile);
    console.log('uploadedData:', uploadedData);
    console.log('uploadedData type:', typeof uploadedData);
    console.log('uploadedData keys:', uploadedData ? Object.keys(uploadedData) : 'null');
    
    if (!csatCycleStartDateFormatted) {
      alert('Please set a CSAT Cycle Start Date before accessing dashboards.');
      return;
    }
    
    if (onDashboardSelect && (uploadedFile || uploadedData)) {
      if (uploadedData) {
        // Use already processed data
        console.log('Using uploadedData:', uploadedData);
        onDashboardSelect(dashboardId, uploadedData);
      } else {
        // Process file first, then navigate to dashboard
        console.log('Processing file first...');
        processExcelFile(uploadedFile).then(result => {
          console.log('File processed, calling onDashboardSelect with result:', result);
          onDashboardSelect(dashboardId, result);
        }).catch(err => {
          console.error('Error processing file for dashboard:', err);
        });
      }
    } else {
      console.log('Cannot proceed - missing onDashboardSelect or data');
    }
  };


  return (
    <UploadContainer>
      <UploadHeader>
        <HeaderTitle>
          <FileSpreadsheet size={24} />
          {uploadedData ? 'CSAT Data' : 'Upload CSAT Data'}
        </HeaderTitle>
        <HeaderSubtitle>
          {uploadedData
            ? 'Select a dashboard below to view the fetched CSAT data'
            : 'Upload your Excel file to analyze CSAT data across multiple dashboards'}
        </HeaderSubtitle>
        {onBackToHome && (
          <BackToHomeButton onClick={onBackToHome}>
            <Home size={16} />
            Back to Home
          </BackToHomeButton>
        )}
      </UploadHeader>

      <UploadContent>
      {!uploadedData && (
        <>
        <UploadArea
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
            <UploadIcon>
              <Upload size={48} />
            </UploadIcon>
            <UploadText>
              {uploadedFile ? 'File Selected' : 'Drag & Drop Excel File Here'}
            </UploadText>
            <UploadSubtext>
              or click to browse files
            </UploadSubtext>
            <UploadButton>
              <FileSpreadsheet size={16} />
              Choose File
            </UploadButton>
          </UploadArea>

          <FileInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInputChange}
          />

          {uploadedFile && (
          <FileInfo>
            <FileDetails>
                <FileSpreadsheet size={20} color="#667eea" />
                <div>
                  <FileName>{uploadedFile.name}</FileName>
                  <FileSize>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</FileSize>
                </div>
            </FileDetails>
            <RemoveButton onClick={removeFile}>
                <X size={14} />
                Remove
            </RemoveButton>
          </FileInfo>
        )}

        {error && (
            <StatusMessage type="error">
              <AlertCircle size={16} />
            {error}
            </StatusMessage>
        )}

        {success && (
            <StatusMessage type="success">
              <CheckCircle size={16} />
            {success}
            </StatusMessage>
          )}


          {isProcessing && (
            <StatusMessage type="info">
              <Upload size={16} />
              Processing file...
            </StatusMessage>
          )}



          <FileFormatInfo>
            <FileFormatTitle>Supported File Formats:</FileFormatTitle>
            <FileFormatList>
              • Microsoft Excel (.xlsx)<br/>
              • Microsoft Excel 97-2003 (.xls)<br/>
              • Maximum file size: 10MB<br/>
              • Supports multiple sheets
            </FileFormatList>
          </FileFormatInfo>
        </>
      )}

        {acsatCycle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8rem',
            color: '#6b7280',
            margin: '0.25rem 0 0.75rem 0'
          }}>
            <Calendar size={14} />
            <span>{acsatCycle}</span>
          </div>
        )}

        <DashboardSelection>
          <DashboardTitle>
            <BarChart3 size={16} />
            Available Dashboards
            {!csatCycleStartDateFormatted && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#dc2626', 
                fontWeight: 'normal',
                marginLeft: '0.5rem'
              }}>
                (CSAT Cycle Start Date required)
              </span>
            )}
          </DashboardTitle>
          <DashboardGrid>
            {dashboardOptions.map((dashboard, index) => {
              const isTemporarilyDisabled = TEMPORARILY_DISABLED_DASHBOARD_IDS.has(dashboard.id);
              const isDisabled = isTemporarilyDisabled || (!uploadedFile && !uploadedData) || !csatCycleStartDateFormatted;
              return (
              <DashboardCard
                key={dashboard.id}
                $variant={CARD_VARIANTS[index % CARD_VARIANTS.length]}
                onClick={() => { if (!isTemporarilyDisabled) handleDashboardClick(dashboard.id); }}
                disabled={isDisabled}
                title={isTemporarilyDisabled ? 'This dashboard is temporarily unavailable' : undefined}
                style={{
                  opacity: isDisabled ? 0.5 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer'
                }}
              >
                <DashboardIcon>
                  {dashboard.icon}
                </DashboardIcon>
                <DashboardInfo>
                <DashboardName>{dashboard.name}</DashboardName>
                <DashboardDescription>{dashboard.description}</DashboardDescription>
                </DashboardInfo>
              </DashboardCard>
              );
            })}
          </DashboardGrid>
        </DashboardSelection>
      </UploadContent>
    </UploadContainer>
  );
};

export default FileUpload;
