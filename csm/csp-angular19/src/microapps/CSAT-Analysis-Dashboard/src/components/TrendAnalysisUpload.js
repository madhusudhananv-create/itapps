import React, { useState, useRef, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, TrendingUp, Edit3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getHalfYearOptions, getHalfYearLabel } from '../utils/dateUtils';

const Container = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  margin: 0.75rem 0;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  margin: 0;
  color: #1e3a5f;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BackButton = styled.button`
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  &:hover { background: #5a6fd6; }
`;

const Description = styled.p`
  color: #64748b;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const UploadArea = styled.div`
  padding: 2.5rem 2rem;
  border: 2px dashed ${props => props.$isDragOver ? '#667eea' : '#cbd5e1'};
  border-radius: 8px;
  text-align: center;
  background: ${props => props.$isDragOver ? '#f0f4ff' : '#fafbfc'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 1.5rem;
  &:hover {
    border-color: #667eea;
    background: #f0f4ff;
  }
`;

const UploadIcon = styled.div`
  color: #94a3b8;
  margin-bottom: 0.75rem;
`;

const UploadText = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #334155;
  margin: 0 0 0.25rem 0;
`;

const UploadSubtext = styled.p`
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const FilesSection = styled.div`
  margin-top: 1.5rem;
`;

const FilesSectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e3a5f;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileCard = styled.div`
  padding: 1rem 1.25rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  margin-bottom: 0.75rem;
`;

const FileCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const FileCardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const FileCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SavedName = styled.div`
  font-weight: 700;
  color: #1e3a5f;
  font-size: 0.95rem;
`;

const OriginalName = styled.div`
  color: #64748b;
  font-size: 0.8rem;
  margin-top: 0.15rem;
`;

const FileMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.4rem;
`;

const MetaBadge = styled.span`
  background: #e0f2fe;
  color: #0369a1;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  &:hover { background: #fecaca; }
`;

const RenameButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  &:hover { background: #dbeafe; }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  background: ${props => props.$type === 'success' ? '#f0fdf4' : props.$type === 'error' ? '#fef2f2' : '#eff6ff'};
  color: ${props => props.$type === 'success' ? '#166534' : props.$type === 'error' ? '#991b1b' : '#1e40af'};
  border: 1px solid ${props => props.$type === 'success' ? '#bbf7d0' : props.$type === 'error' ? '#fecaca' : '#bfdbfe'};
`;

const CountBadge = styled.span`
  background: #667eea;
  color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const RenameModal = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const RenameBox = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  width: 400px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
`;

const RenameTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #1e3a5f;
`;

const RenameInput = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  box-sizing: border-box;
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const RenameActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
`;

const ModalButton = styled.button`
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${props => props.$primary ? '#667eea' : '#cbd5e1'};
  background: ${props => props.$primary ? '#667eea' : 'white'};
  color: ${props => props.$primary ? 'white' : '#475569'};
  &:hover {
    background: ${props => props.$primary ? '#5a6fd6' : '#f1f5f9'};
  }
`;

const FetchSection = styled.div`
  padding: 1.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const FetchRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
  margin-top: 0.75rem;
`;

const FetchField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FetchLabel = styled.label`
  font-size: 0.75rem;
  color: #6b7280;
`;

const FetchInput = styled.input`
  padding: 0.5rem 0.75rem;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
`;

const FetchButton = styled.button`
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TrendAnalysisUpload = ({
  onBack,
  trendFiles,
  onAddTrendFile,
  onRemoveTrendFile,
  onRenameTrendFile,
  title = 'Upload data for trend analysis',
  backLabel = '← Back to Dashboards',
  description = 'Upload one or more historical CSAT data Excel files. Each file is saved with a unique name and the data persists for the entire session so other dashboards can use it for trend analysis. You can rename files after upload for easy identification.',
  filesSectionTitle = 'Uploaded Files (saved for this session)',
  showSessionPersistenceNote = false,
  // When provided, replaces the manual Excel upload with a Start/End Date
  // fetch that pulls the same live detail+status data the main dashboards use.
  onFetchRange,
  // Start date (yyyy-MM-dd) of whatever period is currently selected on the main
  // "Fetch CSAT Data from Server" screen. When provided, the default comparison
  // period here is set to ONE half-year BEFORE that selection (e.g. main screen
  // = H2 2025 → trend default = H1 2025), not a fixed "last completed" period.
  currentPeriodStartDate
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingCount, setProcessingCount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const halfYearOptions = useMemo(() => getHalfYearOptions(), []);
  // Default comparison period = one half-year before the currently selected main
  // period, when that's available and found in the option list. Otherwise fall
  // back to the half-year before the last completed one (options[1] / options[0]).
  const currentPeriodIndex = currentPeriodStartDate
    ? halfYearOptions.findIndex(o => o.startDate === currentPeriodStartDate)
    : -1;
  const defaultComparisonOption = currentPeriodIndex !== -1
    ? (halfYearOptions[currentPeriodIndex + 1] || halfYearOptions[currentPeriodIndex])
    : (halfYearOptions[1] || halfYearOptions[0]);
  const [fetchStartDate, setFetchStartDate] = useState(defaultComparisonOption?.startDate || '');
  const [fetchEndDate, setFetchEndDate] = useState(defaultComparisonOption?.endDate || '');
  const [fetchLoading, setFetchLoading] = useState(false);
  const fileInputRef = useRef(null);
  const trendFilesRef = useRef(trendFiles);
  const autoFetchAttemptedRef = useRef(false);

  const handlePeriodChange = (label) => {
    const option = halfYearOptions.find(o => o.label === label);
    if (option) {
      setFetchStartDate(option.startDate);
      setFetchEndDate(option.endDate);
    }
  };

  const handleFetchClick = async () => {
    if (!fetchStartDate || !fetchEndDate) {
      setError('Please select a period.');
      return;
    }
    const rangeSignature = `API Fetch (${fetchStartDate} to ${fetchEndDate})`;
    const alreadyFetched = (trendFilesRef.current || []).some(f => f.originalName === rangeSignature);
    if (alreadyFetched) {
      setError(`"${getHalfYearLabel(fetchStartDate)}" has already been fetched for trend analysis. Please select a different period, or remove the existing entry first if you want to re-fetch it.`);
      setSuccess('');
      return;
    }
    setFetchLoading(true);
    setError('');
    setSuccess('');
    try {
      await onFetchRange(fetchStartDate, fetchEndDate);
      setSuccess(`Data for ${getHalfYearLabel(fetchStartDate)} fetched and saved for trend analysis.`);
    } catch (err) {
      setError(err.message || 'Failed to fetch data for the selected range.');
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    trendFilesRef.current = trendFiles;
  }, [trendFiles]);

  // Auto-fetch the default comparison period once on mount, so trend analysis has data
  // ready immediately without requiring the user to click "Fetch" first.
  useEffect(() => {
    if (!onFetchRange || autoFetchAttemptedRef.current) return;
    if (trendFilesRef.current && trendFilesRef.current.length > 0) return;
    if (!fetchStartDate || !fetchEndDate) return;
    autoFetchAttemptedRef.current = true;
    (async () => {
      setFetchLoading(true);
      setError('');
      setSuccess('');
      try {
        await onFetchRange(fetchStartDate, fetchEndDate);
        setSuccess(`Data for ${getHalfYearLabel(fetchStartDate)} fetched and saved for trend analysis.`);
      } catch (err) {
        setError(err.message || 'Failed to fetch data for the selected range.');
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [onFetchRange, fetchStartDate, fetchEndDate]);

  const processExcelFile = async (file) => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const allSheetsData = {};
      let totalRows = 0;

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        allSheetsData[sheetName] = jsonData;
        totalRows += jsonData.length;
        
        // Debug: Log columns and AgileOne data for Sheet2
        if (sheetName.toLowerCase().includes('sent and received') || workbook.SheetNames.indexOf(sheetName) === 1) {
          console.log('=== TREND UPLOAD DEBUG: Sheet2 ===');
          console.log('Sheet name:', sheetName);
          console.log('Total rows:', jsonData.length);
          console.log('Columns:', jsonData.length > 0 ? Object.keys(jsonData[0]) : []);
          
          // Find AgileOne rows and count Polled
          const agileOneRows = jsonData.filter(r => {
            const name = (r['CUST_NM'] || r['CUSTOMER NAME'] || '').toString().toLowerCase();
            return name.includes('agileone');
          });
          console.log('AgileOne rows found:', agileOneRows.length);
          
          let agileOnePolled = 0;
          agileOneRows.forEach((r, i) => {
            const typeOfAccount = r['TYPE OF ACCOUNT'] || '';
            const sentDate = r['CSAT SENT DATE'];
            const isTop10 = typeOfAccount.toString().toLowerCase() === 'top 10';
            const hasSentDate = sentDate !== null && sentDate !== '' && sentDate !== undefined;
            console.log(`AgileOne Row ${i+1}: TYPE OF ACCOUNT="${typeOfAccount}", isTop10=${isTop10}, CSAT SENT DATE="${sentDate}", hasValue=${hasSentDate}`);
            if (isTop10 && hasSentDate) agileOnePolled++;
          });
          console.log('AgileOne Polled count at upload:', agileOnePolled);
        }
      });

      const baseName = file.name.replace(/\.(xlsx|xls)$/i, '');
      let saveName = baseName;
      let counter = 1;
      while (trendFilesRef.current.some(f => f.saveName === saveName)) {
        saveName = `${baseName} (${counter})`;
        counter += 1;
      }

      const fileEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        saveName,
        originalName: file.name,
        fileSize: file.size,
        sheetNames: workbook.SheetNames,
        sheets: allSheetsData,
        totalRows,
        uploadedAt: new Date().toISOString()
      };

      onAddTrendFile(fileEntry);
      trendFilesRef.current = [...trendFilesRef.current, fileEntry];
      setSuccess(`"${file.name}" uploaded and saved as "${saveName}". ${workbook.SheetNames.length} sheet(s), ${totalRows} rows. Data kept for this session.`);
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(`Error processing file: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const validateTrendFile = (file) => {
    if (!file) return 'No file selected.';
    const validExtensions = ['.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) return 'Please upload a valid Excel file (.xlsx or .xls)';
    if (file.size > 10 * 1024 * 1024) return 'File size exceeds 10MB limit';
    return null;
  };

  const handleMultipleFiles = async (files) => {
    const list = Array.from(files || []).filter(Boolean);
    if (list.length === 0) return;
    setProcessingCount(list.length);
    for (let i = 0; i < list.length; i++) {
      const validationError = validateTrendFile(list[i]);
      if (validationError) {
        setError(`${list[i].name}: ${validationError}`);
        continue;
      }
      await processExcelFile(list[i]);
    }
    setProcessingCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    const validationError = validateTrendFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setProcessingCount(1);
    processExcelFile(file).finally(() => setProcessingCount(0));
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleMultipleFiles(e.dataTransfer.files);
  };

  const openRename = (file) => {
    setRenameTarget(file.id);
    setRenameValue(file.saveName);
  };

  const confirmRename = () => {
    if (renameTarget && renameValue.trim()) {
      const trimmed = renameValue.trim();
      const isDuplicate = trendFiles.some(f => f.id !== renameTarget && f.saveName === trimmed);
      if (isDuplicate) {
        setError(`Name "${trimmed}" is already used. Please choose a different name.`);
        return;
      }
      onRenameTrendFile(renameTarget, trimmed);
      setSuccess(`File renamed to "${trimmed}" successfully.`);
    }
    setRenameTarget(null);
    setRenameValue('');
  };

  const handleRemove = (file) => {
    onRemoveTrendFile(file.id);
    setSuccess(`"${file.saveName}" removed.`);
  };

  return (
    <Container>
      <HeaderRow>
        <Title>
          <TrendingUp size={22} />
          {title}
        </Title>
        <BackButton onClick={onBack}>
          {backLabel}
        </BackButton>
      </HeaderRow>

      <Description>
        {description}
      </Description>

      {showSessionPersistenceNote && (
        <StatusMessage $type="info">
          <CheckCircle size={16} />
          Excel data is stored in memory for this browser session. Upload multiple files; each is saved under a distinct name. Other ACSAT dashboards read these files for trend analysis until you close or refresh the app.
        </StatusMessage>
      )}

      {onFetchRange ? (
        <FetchSection>
          <FetchLabel style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
            Fetch a comparison period from the server
          </FetchLabel>
          <FetchRow>
            <FetchField>
              <FetchLabel>Period</FetchLabel>
              <FetchInput
                as="select"
                value={getHalfYearLabel(fetchStartDate)}
                onChange={(e) => handlePeriodChange(e.target.value)}
              >
                {halfYearOptions.map(o => (
                  <option key={o.label} value={o.label}>{o.label}</option>
                ))}
              </FetchInput>
            </FetchField>
            <FetchButton onClick={handleFetchClick} disabled={fetchLoading}>
              {fetchLoading ? '⏳ Fetching...' : '📥 Fetch & Save'}
            </FetchButton>
          </FetchRow>
        </FetchSection>
      ) : (
        <>
          <UploadArea
            $isDragOver={isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon>
              <Upload size={42} />
            </UploadIcon>
            <UploadText>Drag &amp; Drop Excel File(s) Here</UploadText>
            <UploadSubtext>or click to browse &bull; Multiple files supported &bull; .xlsx, .xls &bull; Max 10MB each</UploadSubtext>
          </UploadArea>

          <FileInput
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={(e) => handleMultipleFiles(e.target.files)}
          />
        </>
      )}

      {(isProcessing || processingCount > 0) && (
        <StatusMessage $type="info">
          <Upload size={16} />
          {processingCount > 1 ? `Processing ${processingCount} file(s)...` : 'Processing file...'}
        </StatusMessage>
      )}

      {error && (
        <StatusMessage $type="error">
          <AlertCircle size={16} />
          {error}
        </StatusMessage>
      )}

      {success && (
        <StatusMessage $type="success">
          <CheckCircle size={16} />
          {success}
        </StatusMessage>
      )}

      {trendFiles.length > 0 && (
        <FilesSection>
          <FilesSectionTitle>
            <FileSpreadsheet size={18} color="#667eea" />
            {filesSectionTitle}
            <CountBadge>{trendFiles.length}</CountBadge>
          </FilesSectionTitle>

          {trendFiles.map((file) => (
            <FileCard key={file.id}>
              <FileCardHeader>
                <FileCardLeft>
                  <FileSpreadsheet size={20} color="#10b981" />
                  <div>
                    <SavedName>{file.saveName}</SavedName>
                    <OriginalName>Original: {file.originalName}</OriginalName>
                  </div>
                </FileCardLeft>
                <FileCardActions>
                  <RenameButton onClick={() => openRename(file)}>
                    <Edit3 size={13} />
                    Rename
                  </RenameButton>
                  <RemoveButton onClick={() => handleRemove(file)}>
                    <X size={13} />
                    Remove
                  </RemoveButton>
                </FileCardActions>
              </FileCardHeader>
              <FileMetaRow>
                <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                <span>&bull;</span>
                <span>{file.totalRows.toLocaleString()} rows</span>
                <span>&bull;</span>
                {file.sheetNames.map(name => (
                  <MetaBadge key={name}>{name} ({file.sheets[name]?.length || 0})</MetaBadge>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                  Uploaded: {new Date(file.uploadedAt).toLocaleTimeString()}
                </span>
              </FileMetaRow>
            </FileCard>
          ))}
        </FilesSection>
      )}

      {renameTarget && (
        <RenameModal onClick={() => { setRenameTarget(null); setRenameValue(''); }}>
          <RenameBox onClick={(e) => e.stopPropagation()}>
            <RenameTitle>Rename File</RenameTitle>
            <RenameInput
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); }}
              autoFocus
              placeholder="Enter a name for this file"
            />
            <RenameActions>
              <ModalButton onClick={() => { setRenameTarget(null); setRenameValue(''); }}>
                Cancel
              </ModalButton>
              <ModalButton $primary onClick={confirmRename}>
                Save
              </ModalButton>
            </RenameActions>
          </RenameBox>
        </RenameModal>
      )}
    </Container>
  );
};

export default TrendAnalysisUpload;
