import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  BusinessRounded,
  PsychologyRounded,
  AccountBalanceRounded,
  FolderRounded,
  PersonRounded,
  TimelineRounded,
} from '@mui/icons-material';
import {
  getPracticesFromQuestionnaire,
  getSDLCPhasesForPractice,
} from '@shared/utils/questionnaireUtils';
import { useProjectPracticeInfo } from '../hooks/useProjectPracticeInfo';
import type { PracticeInfo } from '@shared/practices/services/practiceInfoService';
import type { ProjectInfo } from '@shared/projects/services/projectInfoService';
import { CommonSnackbar } from '@shared/components/CommonSnackbar';

// Type definitions for better type safety
interface FormData {
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  projectId?: string;
  practice: string;
  manager: string;
  currentPhase: string;
  headcount?: number;
  peopleUsingAI?: number;
}

interface ProjectInfoSelectionProps {
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string | number) => void;
  businessUnits: string[];
  accounts: string[];
  projects: string[];
  hasUnsavedChanges?: boolean;
}

// Global styling object
const styles = {
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 4,
  },
  inputLabel: {
    fontWeight: 500,
    color: '#333',
    fontSize: '0.875rem',
  },
  select: {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#667eea',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-root': {
      backgroundColor: 'white',
      px: 0.5,
      color: '#333',
      fontSize: '0.875rem',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#667eea',
        backgroundColor: 'white',
        px: 0.5,
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    },
    '& .MuiSelect-select': {
      py: 1.5,
    },
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      '& .MuiOutlinedInput-root': {
        cursor: 'not-allowed',
      },
    },
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      '&:hover fieldset': {
        borderColor: '#667eea',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-root': {
      backgroundColor: 'white',
      px: 0.5,
      color: '#333',
      fontSize: '0.875rem',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#667eea',
        backgroundColor: 'white',
        px: 0.5,
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    },
    '& .MuiInputBase-input': {
      py: 1.5,
    },
    '&.Mui-disabled': {
      cursor: 'not-allowed',
      '& .MuiOutlinedInput-root': {
        cursor: 'not-allowed',
      },
    },
  },
  icon: {
    color: '#667eea',
    mr: 1,
  },
  emptyField: {
    cursor: 'pointer',
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      '& fieldset': {
        borderColor: '#ccc',
      },
      '&:hover fieldset': {
        borderColor: '#999',
      },
    },
    '& .MuiInputLabel-root': {
      color: '#999',
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    '& .MuiSelect-icon': {
      color: '#999',
    },
  },
  emptyIcon: {
    color: '#999',
    mr: 1,
  },
  formHeader: {
    mb: 4,
    fontWeight: 600,
    color: '#333',
  },
  // New styles for AI Adoption Metrics section
  aiAdoptionSection: {
    mt: 4,
  },
  sectionHeader: {
    fontWeight: 600,
    color: '#333',
    fontSize: '1.1rem',
    mb: 2,
  },
  saveButtonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    mt: 2,
  },
  saveButton: {
    borderRadius: 1.5,
    textTransform: 'none',
    fontWeight: 500,
    px: 1.5,
    py: 0.75,
    fontSize: '0.8rem',
    background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
    },
    '&:disabled': {
      background: '#ccc',
      color: '#666',
    },
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    py: 2,
  },
};

export const ProjectInfoSelection: React.FC<ProjectInfoSelectionProps> = ({
  formData,
  onFormChange,
  businessUnits,
  accounts,
  projects,
  hasUnsavedChanges = false,
}) => {
  const [practiceChangeDialog, setPracticeChangeDialog] = useState<{
    open: boolean;
    field: keyof FormData;
    value: string;
  }>({
    open: false,
    field: 'practice',
    value: '',
  });

  // Get practices and SDLC phases from questionnaire data
  const questionnairePractices = getPracticesFromQuestionnaire();
  const [availablePhases, setAvailablePhases] = useState<string[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const lastProjectInfo = useRef<ProjectInfo | null>(null);
  const lastPracticeInfo = useRef<PracticeInfo | null>(null);

  // Use the project practice info hook
  const {
    projectInfo,
    practiceInfo,
    isLoading: isInfoLoading,
    error: infoError,
    saveProjectInfo,
    savePracticeInfo,
  } = useProjectPracticeInfo({
    projectId: formData.projectId ?? '',
    practice: formData.practice,
  });

  // Validation for people using AI vs headcount
  const isPeopleUsingAIValid = () => {
    if (!formData.peopleUsingAI || !formData.headcount) return true;

    return (
      formData.peopleUsingAI > 0 && formData.peopleUsingAI <= formData.headcount
    );
  };

  const getPeopleUsingAIError = () => {
    if (!formData.peopleUsingAI || !formData.headcount) return '';
    if (formData.peopleUsingAI < 0) {
      return `The value cannot be negative`;
    }
    if (formData.peopleUsingAI > formData.headcount) {
      return `Number of people using AI cannot be greater than total headcount (${formData.headcount})`;
    }
    return '';
  };

  // Check if there are unsaved changes in AI metrics
  const hasUnsavedAIMetrics = () => {
    // Only check if we have loaded data and form has meaningful values
    if (!formData.project && !formData.practice) {
      return false;
    }

    // Only check peopleUsingAI changes if head count is valid
    const peopleUsingAIChanged =
      formData.headcount &&
      formData.headcount > 0 &&
      formData.peopleUsingAI !== undefined &&
      projectInfo?.peopleUsingAI !== formData.peopleUsingAI;

    const currentPhaseChanged =
      formData.currentPhase &&
      practiceInfo?.currentPhase !== formData.currentPhase;

    return peopleUsingAIChanged || currentPhaseChanged;
  };

  // Memoized check for any unsaved changes
  const hasAnyUnsavedChanges = hasUnsavedChanges || hasUnsavedAIMetrics();

  // Update available phases when practice changes
  useEffect(() => {
    if (formData.practice) {
      const phases = getSDLCPhasesForPractice(formData.practice);
      setAvailablePhases(phases);
      // Reset current phase if not in available phases and it's non-empty
      if (formData.currentPhase && !phases.includes(formData.currentPhase)) {
        onFormChange('currentPhase', '');
      }
    } else {
      setAvailablePhases([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.practice, onFormChange]);

  // Auto-populate fields when project info or practice info is loaded
  useEffect(() => {
    // Only auto-populate if the database value has actually changed
    if (projectInfo !== lastProjectInfo.current) {
      onFormChange('peopleUsingAI', projectInfo?.peopleUsingAI ?? '');
      lastProjectInfo.current = projectInfo;
    }
  }, [projectInfo, onFormChange]);

  useEffect(() => {
    // Only auto-populate if the database value has actually changed
    if (practiceInfo !== lastPracticeInfo.current) {
      onFormChange('currentPhase', practiceInfo?.currentPhase ?? '');
      lastPracticeInfo.current = practiceInfo;
    }
  }, [practiceInfo, onFormChange]);

  // Handle beforeunload event to warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasAnyUnsavedChanges) {
        event.preventDefault();
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasAnyUnsavedChanges]); // Dependencies for the unsaved changes check

  const handleFieldChange = (field: keyof FormData, value: string | number) => {
    // Convert number fields properly
    const finalValue =
      field === 'peopleUsingAI' || field === 'headcount'
        ? value === ''
          ? ''
          : Number(value)
        : value;
    if (hasUnsavedChanges && formData[field] !== finalValue) {
      setPracticeChangeDialog({
        open: true,
        field,
        value: String(value),
      });
    } else {
      onFormChange(field, finalValue);
    }
  };
  const handleBlur = (field: keyof FormData, value: string | number) => {
    // Convert number fields properly
    const finalValue =
      field === 'peopleUsingAI' || field === 'headcount'
        ? value === ''
          ? 0
          : Number(value)
        : value;
    onFormChange(field, finalValue);
  };
  const handleFocus = (field: keyof FormData, value: string | number) => {
    // Convert number fields properly
    const finalValue =
      field === 'peopleUsingAI' || field === 'headcount'
        ? value === '0'
          ? ''
          : Number(value)
        : value;
    onFormChange(field, finalValue);
  };

  const handlePracticeChange = (newPractice: string) => {
    handleFieldChange('practice', newPractice);
  };

  const handleConfirmPracticeChange = () => {
    // Call the parent's onFormChange which handles dependent field resets
    onFormChange(practiceChangeDialog.field, practiceChangeDialog.value);
    setPracticeChangeDialog({ open: false, field: 'practice', value: '' });
  };

  const handleCancelPracticeChange = () => {
    setPracticeChangeDialog({ open: false, field: 'practice', value: '' });
  };

  const handleSaveAIMetrics = async () => {
    try {
      // Only save if there are actual changes
      if (!hasUnsavedAIMetrics()) {
        return;
      }

      // Save both project info and practice info
      const promises = [];

      // Only save project info if it has changed
      if (
        projectInfo?.peopleUsingAI !== formData.peopleUsingAI &&
        formData.peopleUsingAI !== undefined
      ) {
        promises.push(saveProjectInfo(formData.peopleUsingAI));
      }

      // Only save practice info if it has changed
      if (
        practiceInfo?.currentPhase !== formData.currentPhase &&
        formData.currentPhase
      ) {
        promises.push(savePracticeInfo(formData.currentPhase));
      }

      // Only proceed if there are actual API calls to make
      if (promises.length > 0) {
        await Promise.all(promises);
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error saving AI metrics:', error);
      // You might want to show an error message here
    }
  };

  // Helper to avoid nested ternaries in JSX (dialog field label)
  const getPracticeChangeFieldLabel = () => {
    switch (practiceChangeDialog.field) {
      case 'businessUnit':
        return 'business unit';
      case 'account':
        return 'account';
      case 'project':
        return 'project';
      default:
        return 'practice';
    }
  };

  // Helper to avoid nested ternary inside Tooltip title
  let peopleUsingAITooltip = '';
  if (!formData.project) {
    peopleUsingAITooltip = 'Please select project first.';
  } else if (!formData.headcount || formData.headcount === 0) {
    peopleUsingAITooltip =
      'Head count must be greater than 0 to enable AI usage tracking.';
  }

  return (
    <Box>
      {/* Form Header */}
      <Typography
        variant="body1"
        sx={{ ...styles.formHeader, fontSize: '1.1rem' }}
      >
        Project Information
      </Typography>

      {/* Form Fields */}
      <Box sx={styles.formGrid}>
        {/* First Row - Main Selection Fields */}
        <Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={styles.inputLabel}>Business Unit</InputLabel>
            <Select
              value={formData.businessUnit}
              onChange={(e) =>
                handleFieldChange('businessUnit', e.target.value)
              }
              label="Business Unit"
              startAdornment={
                <BusinessRounded
                  sx={formData.businessUnit ? styles.icon : styles.emptyIcon}
                />
              }
              sx={
                formData.businessUnit
                  ? styles.select
                  : { ...styles.select, ...styles.emptyField }
              }
            >
              {businessUnits.map(
                (unit) =>
                  [
                    'CIT',
                    'Tech',
                    'Health care',
                    'India & GCC',
                    'AI&ML',
                    'Sead',
                  ].includes(unit) && (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  )
              )}
            </Select>
          </FormControl>
        </Box>

        <Box>
          <Tooltip
            title={
              !formData.businessUnit ? 'Please select business unit first.' : ''
            }
            placement="top"
          >
            <TextField
              fullWidth
              label="Business Head:"
              value={formData.businessHead}
              variant="outlined"
              disabled={!formData.businessUnit}
              InputProps={{
                startAdornment: (
                  <PersonRounded
                    sx={formData.businessHead ? styles.icon : styles.emptyIcon}
                  />
                ),
                readOnly: true,
              }}
              placeholder="Select business unit to auto-populate"
              sx={
                formData.businessHead
                  ? styles.textField
                  : { ...styles.textField, ...styles.emptyField }
              }
            />
          </Tooltip>
        </Box>

        <Box>
          <Tooltip
            title={
              !formData.businessUnit ? 'Please select business unit first.' : ''
            }
            placement="top"
          >
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={styles.inputLabel}>Account</InputLabel>
              <Select
                value={formData.account}
                onChange={(e) => handleFieldChange('account', e.target.value)}
                label="Account"
                disabled={!formData.businessUnit}
                startAdornment={
                  <AccountBalanceRounded
                    sx={formData.account ? styles.icon : styles.emptyIcon}
                  />
                }
                sx={
                  formData.account
                    ? styles.select
                    : { ...styles.select, ...styles.emptyField }
                }
              >
                {accounts.map((account: string) => (
                  <MenuItem key={account} value={account}>
                    {account}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
        </Box>

        <Box>
          <Tooltip
            title={!formData.account ? 'Please select account first.' : ''}
            placement="top"
          >
            <TextField
              fullWidth
              label="CSM:"
              value={formData.accountManager}
              variant="outlined"
              disabled={!formData.account}
              InputProps={{
                startAdornment: (
                  <PersonRounded
                    sx={
                      formData.accountManager ? styles.icon : styles.emptyIcon
                    }
                  />
                ),
                readOnly: true,
              }}
              placeholder="Select account to auto-populate"
              sx={
                formData.accountManager
                  ? styles.textField
                  : { ...styles.textField, ...styles.emptyField }
              }
            />
          </Tooltip>
        </Box>

        <Box>
          <Tooltip
            title={!formData.account ? 'Please select account first.' : ''}
            placement="top"
          >
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={styles.inputLabel}>Project</InputLabel>
              <Select
                value={formData.project}
                onChange={(e) => handleFieldChange('project', e.target.value)}
                label="Project"
                disabled={!formData.account}
                startAdornment={
                  <FolderRounded
                    sx={formData.project ? styles.icon : styles.emptyIcon}
                  />
                }
                sx={
                  formData.project
                    ? styles.select
                    : { ...styles.select, ...styles.emptyField }
                }
              >
                {projects.map((project: string) => (
                  <MenuItem key={project} value={project}>
                    {project}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Tooltip>
        </Box>

        {/* Second Row - Auto-populated Fields */}
        <Box>
          <Tooltip
            title={!formData.project ? 'Please select project first.' : ''}
            placement="top"
          >
            <TextField
              fullWidth
              label="Manager:"
              value={formData.manager}
              variant="outlined"
              disabled={!formData.project}
              InputProps={{
                startAdornment: (
                  <PersonRounded
                    sx={formData.manager ? styles.icon : styles.emptyIcon}
                  />
                ),
                readOnly: true,
              }}
              placeholder="Select project to auto-populate"
              sx={
                formData.manager
                  ? styles.textField
                  : { ...styles.textField, ...styles.emptyField }
              }
            />
          </Tooltip>
        </Box>

        <Box>
          <Tooltip
            title={!formData.project ? 'Please select project first.' : ''}
            placement="top"
          >
            <TextField
              fullWidth
              label="Head Count:"
              value={formData.headcount ?? ''}
              variant="outlined"
              disabled={!formData.project}
              InputProps={{
                startAdornment: (
                  <PersonRounded
                    sx={formData.headcount ? styles.icon : styles.emptyIcon}
                  />
                ),
                readOnly: true,
              }}
              placeholder="Select project to auto-populate"
              sx={
                formData.headcount
                  ? styles.textField
                  : { ...styles.textField, ...styles.emptyField }
              }
            />
          </Tooltip>
        </Box>

        <Box>
          <FormControl fullWidth variant="outlined">
            <InputLabel sx={styles.inputLabel}>Practice</InputLabel>
            <Select
              value={formData.practice}
              onChange={(e) => handlePracticeChange(e.target.value)}
              label="Practice"
              startAdornment={
                <PsychologyRounded
                  sx={formData.practice ? styles.icon : styles.emptyIcon}
                />
              }
              sx={
                formData.practice
                  ? styles.select
                  : { ...styles.select, ...styles.emptyField }
              }
            >
              {questionnairePractices.map((practice: string) => (
                <MenuItem key={practice} value={practice}>
                  {practice === 'End-user Computing & Service De'
                    ? 'End-user Computing & Service Desk'
                    : practice}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* AI Adoption Metrics Section */}
      <Box sx={styles.aiAdoptionSection}>
        <Typography variant="body1" sx={styles.sectionHeader}>
          AI Adoption Metrics
        </Typography>

        {/* Error Message */}
        {infoError && (
          <CommonSnackbar
            message={infoError}
            open={!!infoError}
            autoHideDuration={3000}
            severity="error"
          />
        )}

        <Box sx={styles.formGrid}>
          <Box>
            <Tooltip title={peopleUsingAITooltip} placement="top">
              <TextField
                fullWidth
                label="# of People using AI"
                type="number"
                value={formData.peopleUsingAI ?? '0'}
                onChange={(e) =>
                  handleFieldChange('peopleUsingAI', e.target.value)
                }
                onBlur={(e) => handleBlur('peopleUsingAI', e.target.value)}
                onFocus={(e) => handleFocus('peopleUsingAI', e.target.value)}
                variant="outlined"
                autoComplete="off"
                disabled={
                  !formData.project ||
                  isInfoLoading ||
                  !formData.headcount ||
                  formData.headcount === 0
                }
                error={!isPeopleUsingAIValid()}
                helperText={getPeopleUsingAIError()}
                InputProps={{
                  startAdornment: isInfoLoading ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <PersonRounded
                      sx={
                        formData.peopleUsingAI ? styles.icon : styles.emptyIcon
                      }
                    />
                  ),
                  inputProps: {
                    min: 0,
                    autoComplete: 'off',
                    'data-lpignore': 'true',
                    'data-form-type': 'other',
                  },
                }}
                placeholder="Enter number of people using AI"
                sx={
                  formData.peopleUsingAI
                    ? styles.textField
                    : { ...styles.textField, ...styles.emptyField }
                }
              />
            </Tooltip>
          </Box>

          <Box>
            <Tooltip
              title={!formData.practice ? 'Please select practice first.' : ''}
              placement="top"
            >
              <FormControl fullWidth variant="outlined">
                <InputLabel sx={styles.inputLabel}>
                  Current Phase / Services
                </InputLabel>
                <Select
                  value={formData.currentPhase}
                  onChange={(e) =>
                    handleFieldChange('currentPhase', e.target.value)
                  }
                  label="Current Phase / Services"
                  disabled={!formData.practice || isInfoLoading}
                  startAdornment={
                    isInfoLoading ? (
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                    ) : (
                      <TimelineRounded
                        sx={
                          formData.currentPhase ? styles.icon : styles.emptyIcon
                        }
                      />
                    )
                  }
                  sx={
                    formData.currentPhase
                      ? styles.select
                      : { ...styles.select, ...styles.emptyField }
                  }
                >
                  {availablePhases.map((phase) => (
                    <MenuItem key={phase} value={phase}>
                      {phase.replace(/:/g, '')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Tooltip>
          </Box>
        </Box>

        {/* Save Button */}
        <Box sx={styles.saveButtonContainer}>
          <Button
            onClick={handleSaveAIMetrics}
            disabled={
              !formData.project ||
              isInfoLoading ||
              !isPeopleUsingAIValid() ||
              !hasUnsavedAIMetrics()
            }
            sx={styles.saveButton}
            startIcon={
              isInfoLoading ? <CircularProgress size={16} /> : undefined
            }
          >
            {isInfoLoading ? 'Saving...' : 'Save Metrics'}
          </Button>
        </Box>
      </Box>

      {/* Success Message Snackbar */}
      <CommonSnackbar
        message="AI adoption metrics saved successfully!"
        open={showSaveSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSaveSuccess(false)}
      />

      {/* Practice Change Confirmation Dialog */}
      <Dialog
        open={practiceChangeDialog.open}
        onClose={handleCancelPracticeChange}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Unsaved Changes
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`You have unsaved changes in your activities. Changing the ${getPracticeChangeFieldLabel()} will cause these changes to be lost. Are you sure you want to continue?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCancelPracticeChange} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPracticeChange}
            variant="contained"
            color="warning"
            sx={{
              background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #e0a800 0%, #d39e00 100%)',
              },
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
