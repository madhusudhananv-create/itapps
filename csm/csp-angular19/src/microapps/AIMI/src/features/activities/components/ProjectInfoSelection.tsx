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
  //RadioGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import {
  BusinessRounded,
  PsychologyRounded,
  AccountBalanceRounded,
  FolderRounded,
  PersonRounded,
  //TimelineRounded,
  BlockRounded,
 // Radio,
} from '@mui/icons-material';
import {
  getPracticesFromQuestionnaire,
  //getSDLCPhasesForPractice,
} from '@shared/utils/questionnaireUtils';
import { useProjectPracticeInfo } from '../hooks/useProjectPracticeInfo';
import type { PracticeInfo } from '@shared/practices/services/practiceInfoService';
import type { ProjectInfo } from '@shared/projects/services/projectInfoService';
import { CommonSnackbar } from '@shared/components/CommonSnackbar';
import { useAuth } from '@auth/hooks/useAuth';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


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
  isProjectNA?: boolean;
  naComments?: string;
  runOpsAutoResolved?: string;
  runOpsMTTRReduction?: string;
  runOpsAIAgents?: string;
  runOpsAutomatedWorkflows?: string;
  runOpsMTTD?: string;
  runOpsMTTR?: string;
  licenseCount?: number;
  licenseProvider?: string;
  engineerAIAgents?: string;
  engineerDeliveryCycleTime?: string;
  engineerContractTestCasePassRate?: string;
  engineerPerformanceDefectsPreRelease?: string;
  commonAdoptionWorkforceCertification?: string;
  commonGrossMarginUplift?: string;
  commonRevenuePerFTE?: string;
  commonMarginDifferential?: string;
  commonAdoptionEffortsSaved?: string;
  commonDeploymentEngineer?: string;
  presentationDone?: boolean;
  projectFY?: string;
  acceptedScore?: number;
  scoreReviewed?: boolean;
  acceptedScoreComment?: string;

}

interface ProjectInfoSelectionProps {
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string | number | boolean) => void;
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
  //const [availablePhases, setAvailablePhases] = useState<string[]>([]);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const lastProjectInfo = useRef<ProjectInfo | null>(null);
  const lastPracticeInfo = useRef<PracticeInfo | null>(null);
  const { isAdmin } = useAuth();

  // Use the project practice info hook
  const {
    projectInfo,
    practiceInfo,
    isLoading: isInfoLoading,
    error: infoError,
    saveProjectInfo,
    //savePracticeInfo,
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
    console.log('Save Metrics clicked');
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

    /* const currentPhaseChanged =
      formData.currentPhase &&
      practiceInfo?.currentPhase !== formData.currentPhase;
 */
    const projectNAChanged =
      !!formData.isProjectNA !== !!projectInfo?.isProjectNA;

    const naCommentsChanged =
      !!formData.isProjectNA &&
      (formData.naComments ?? '') !== (projectInfo?.naComments ?? '');
    const runOpsChanged =
    !!formData.runOpsAutoResolved ||
    !!formData.runOpsMTTRReduction ||
    !!formData.runOpsAIAgents ||
    !!formData.runOpsAutomatedWorkflows ||
    !!formData.runOpsMTTD ||
    !!formData.runOpsMTTR;

  const engineeringChanged =
    !!formData.engineerDeliveryCycleTime ||
    !!formData.engineerAIAgents ||
    !!formData.engineerContractTestCasePassRate ||
    !!formData.engineerPerformanceDefectsPreRelease;

  const commonChanged =
    !!formData.commonAdoptionWorkforceCertification ||
    !!formData.commonAdoptionEffortsSaved ||
    !!formData.commonDeploymentEngineer ||
    !!formData.commonGrossMarginUplift ||
    !!formData.commonRevenuePerFTE ||
    !!formData.commonMarginDifferential;

  const licenseChanged =
    !!formData.licenseCount ||
    !!formData.licenseProvider;

  return (
    peopleUsingAIChanged ||
    projectNAChanged ||
    naCommentsChanged ||
    runOpsChanged ||
    engineeringChanged ||
    commonChanged ||
    licenseChanged
  );
    
  };

  // Comments are mandatory once the project is marked as Not Applicable
  const isNACommentsValid = () =>
    !formData.isProjectNA || !!formData.naComments?.trim();

  // Memoized check for any unsaved changes
  const hasAnyUnsavedChanges = hasUnsavedChanges || hasUnsavedAIMetrics();

  // Update available phases when practice changes
  /* useEffect(() => {
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
  }, [formData.practice, onFormChange]); */

  // Auto-populate fields when project info or practice info is loaded
  useEffect(() => {
  if (projectInfo !== lastProjectInfo.current) {
    onFormChange('peopleUsingAI', projectInfo?.peopleUsingAI ?? '');
    onFormChange('isProjectNA', projectInfo?.isProjectNA ?? false);
    onFormChange('naComments', projectInfo?.naComments ?? '');

    // License Info
    onFormChange('licenseCount', projectInfo?.licenseCount ?? 0);
    onFormChange(
      'licenseProvider',
      projectInfo?.licenseProvider ?? ''
    );

    // RunOps Metrics
    onFormChange(
      'runOpsAutoResolved',
      projectInfo?.runOpsAutoResolved ?? ''
    );
    onFormChange(
      'runOpsMTTRReduction',
      projectInfo?.runOpsMTTRReduction ?? ''
    );
    onFormChange(
      'runOpsAIAgents',
      projectInfo?.runOpsAIAgents ?? ''
    );
    onFormChange(
      'runOpsAutomatedWorkflows',
      projectInfo?.runOpsAutomatedWorkflows ?? ''
    );
    onFormChange(
      'runOpsMTTD',
      projectInfo?.runOpsMTTD ?? ''
    );
    onFormChange(
      'runOpsMTTR',
      projectInfo?.runOpsMTTR ?? ''
    );

    // Engineering Metrics
    onFormChange(
      'engineerDeliveryCycleTime',
      projectInfo?.engineerDeliveryCycleTime ?? ''
    );
    onFormChange(
      'engineerAIAgents',
      projectInfo?.engineerAIAgents ?? ''
    );
    onFormChange(
      'engineerContractTestCasePassRate',
      projectInfo?.engineerContractTestCasePassRate ?? ''
    );
    onFormChange(
      'engineerPerformanceDefectsPreRelease',
      projectInfo?.engineerPerformanceDefectsPreRelease ?? ''
    );

    // Common Metrics
    onFormChange(
      'commonAdoptionWorkforceCertification',
      projectInfo?.commonAdoptionWorkforceCertification ?? ''
    );
    onFormChange(
      'commonAdoptionEffortsSaved',
      projectInfo?.commonAdoptionEffortsSaved ?? ''
    );
    onFormChange(
      'commonDeploymentEngineer',
      projectInfo?.commonDeploymentEngineer ?? ''
    );
    onFormChange(
      'commonGrossMarginUplift',
      projectInfo?.commonGrossMarginUplift ?? ''
    );
    onFormChange(
      'commonRevenuePerFTE',
      projectInfo?.commonRevenuePerFTE ?? ''
    );
    onFormChange(
      'commonMarginDifferential',
      projectInfo?.commonMarginDifferential ?? ''
    );

    // Project Level Fields
    onFormChange(
      'presentationDone',
      projectInfo?.presentationDone ?? false
    );
    onFormChange(
      'projectFY',
      projectInfo?.projectFY ?? ''
    );

    // Review Score
    onFormChange(
      'acceptedScore',
      projectInfo?.acceptedScore ?? ''
    );
    onFormChange(
      'scoreReviewed',
      projectInfo?.scoreReviewed ?? false
    );
    onFormChange(
      'acceptedScoreComment',
      projectInfo?.acceptedScoreComment ?? ''
    );
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

  const handleFieldChange = (field: keyof FormData, value: string | number | boolean) => {
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

  // Marking a project NA doesn't cascade/reset other fields, so it can bypass
  // the "unsaved activity changes" confirmation dialog used for cascading fields
  const handleProjectApplicableChange = (value: string) => {
    onFormChange('isProjectNA', value === 'No');
  };

  const handleNACommentsChange = (value: string) => {
    onFormChange('naComments', value);
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
      if (!hasUnsavedAIMetrics() || !isNACommentsValid()) {
        return;
      }

      // Save both project info and practice info
      const promises = [];

      // Only save project info if peopleUsingAI or the NA flag/comments changed
      const peopleUsingAIChanged =
        projectInfo?.peopleUsingAI !== formData.peopleUsingAI &&
        formData.peopleUsingAI !== undefined;
      const projectNAChanged =
        !!formData.isProjectNA !== !!projectInfo?.isProjectNA ||
        ((formData.isProjectNA ?? false) &&
          (formData.naComments ?? '') !== (projectInfo?.naComments ?? ''));
          const runOpsChanged =
  !!formData.runOpsAutoResolved ||
  !!formData.runOpsMTTRReduction ||
  !!formData.runOpsAIAgents ||
  !!formData.runOpsAutomatedWorkflows ||
  !!formData.runOpsMTTD ||
  !!formData.runOpsMTTR;

const engineeringChanged =
  !!formData.engineerDeliveryCycleTime ||
  !!formData.engineerAIAgents ||
  !!formData.engineerContractTestCasePassRate ||
  !!formData.engineerPerformanceDefectsPreRelease;

const commonChanged =
  !!formData.commonAdoptionWorkforceCertification ||
  !!formData.commonAdoptionEffortsSaved ||
  !!formData.commonDeploymentEngineer ||
  !!formData.commonGrossMarginUplift ||
  !!formData.commonRevenuePerFTE ||
  !!formData.commonMarginDifferential;

const licenseChanged =
  formData.licenseCount !== undefined ||
  !!formData.licenseProvider;

const presentationChanged =
  formData.presentationDone !== undefined;

const fyChanged =
  !!formData.projectFY;

      if (
  peopleUsingAIChanged ||
  projectNAChanged ||
  runOpsChanged ||
  engineeringChanged ||
  commonChanged ||
  licenseChanged ||
  presentationChanged ||
  fyChanged
) { 
        promises.push(
          saveProjectInfo({
            peopleUsingAI: formData.peopleUsingAI ?? projectInfo?.peopleUsingAI ?? 0,
            isProjectNA: formData.isProjectNA ?? false,
            naComments: formData.naComments ?? '',
 

            licenseCount: formData.licenseCount,
            licenseProvider: formData.licenseProvider,

            runOpsAutoResolved: formData.runOpsAutoResolved,
            runOpsMTTRReduction: formData.runOpsMTTRReduction,
            runOpsAIAgents: formData.runOpsAIAgents,
            runOpsAutomatedWorkflows: formData.runOpsAutomatedWorkflows,
            runOpsMTTD: formData.runOpsMTTD,
            runOpsMTTR: formData.runOpsMTTR,

            engineerDeliveryCycleTime: formData.engineerDeliveryCycleTime,
            engineerAIAgents: formData.engineerAIAgents,
            engineerContractTestCasePassRate:
              formData.engineerContractTestCasePassRate,
            engineerPerformanceDefectsPreRelease:
              formData.engineerPerformanceDefectsPreRelease,

            commonAdoptionWorkforceCertification:
              formData.commonAdoptionWorkforceCertification,
            commonAdoptionEffortsSaved:
              formData.commonAdoptionEffortsSaved,
            commonDeploymentEngineer:
              formData.commonDeploymentEngineer,
            commonGrossMarginUplift:
              formData.commonGrossMarginUplift,
            commonRevenuePerFTE:
              formData.commonRevenuePerFTE,
            commonMarginDifferential:
              formData.commonMarginDifferential,

            presentationDone: formData.presentationDone,
            projectFY: formData.projectFY,

          })
        );
      }

      // Only save practice info if it has changed
      /* if (
        practiceInfo?.currentPhase !== formData.currentPhase &&
        formData.currentPhase
      ) {
        promises.push(savePracticeInfo(formData.currentPhase));
      } */
      console.log('Promises Length:', promises.length);
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
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            mr: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600 }}
          >
            Project Information
          </Typography>

          {isAdmin && (
            <FormControl
              size="small"
              sx={{ minWidth: 140 }}
              onClick={(e) => e.stopPropagation()}
            >
              <InputLabel>Financial Year</InputLabel>

              <Select
                value={formData.projectFY ?? ''}
                label="FY"
                onChange={(e) =>
                  onFormChange('projectFY', e.target.value)
                }
              >
                <MenuItem value="FY26">FY-2026</MenuItem>
                <MenuItem value="FY27">FY-2027</MenuItem>
                <MenuItem value="FY28">FY-2028</MenuItem>
                <MenuItem value="FY29">FY-2029</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>

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
                  !formData.businessUnit ? 'Please select business unit first.' : formData.account || ''
                }
                placement="top"
                arrow
                disableHoverListener={!!formData.businessUnit && !formData.account}
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
                title={!formData.account ? 'Please select account first.' : formData.project || ''
                }
                placement="top"
                arrow
                disableHoverListener={!!formData.businessUnit && !formData.project}
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
              <Tooltip
                title={
                  formData.practice || ''
                }
                placement="top"
                slotProps={{
                  tooltip: {
                  sx: {
                  maxWidth: 'none',
                  whiteSpace: 'nowrap',
                  },
                  },
                }}
              >
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
              </Tooltip>
            </Box>

            <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: 2,
              alignItems: 'center',
            }}
          >
            {/* Project Applicable */}
            <FormControl fullWidth variant="outlined">
              <InputLabel sx={styles.inputLabel}>
                Project Applicable
              </InputLabel>

              <Select
                value={formData.isProjectNA ? 'No' : 'Yes'}
                onChange={(e) =>
                  handleProjectApplicableChange(e.target.value)
                }
                label="Project Applicable"
                disabled={!formData.project}
                startAdornment={
                  <BlockRounded
                    sx={
                      formData.isProjectNA
                        ? styles.icon
                        : styles.emptyIcon
                    }
                  />
                }
                sx={
                  formData.project
                    ? styles.select
                    : { ...styles.select, ...styles.emptyField }
                }
              >
                <MenuItem value="Yes">Yes</MenuItem>
                <MenuItem value="No">No (Project NA)</MenuItem>
              </Select>
            </FormControl>

            {/* Presentation Done */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.presentationDone ?? false}
                  onChange={(e) =>
                    onFormChange(
                      'presentationDone',
                      e.target.checked
                    )
                  }
                  disabled={!formData.project || formData.isProjectNA}
                />
              }
              label="Presentation Status"
              sx={{
                mt: 1.5,
                ml: 1,
              }}
            />
          </Box>
          </Box>

          {/* Comments - mandatory when the project is marked Not Applicable */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Comments"
              value={formData.naComments ?? ''}
              onChange={(e) => handleNACommentsChange(e.target.value)}
              variant="outlined"
              error={!isNACommentsValid()}
              helperText={
                formData.isProjectNA && !isNACommentsValid()
                  ? 'Comments are mandatory when the project is marked as Not Applicable'
                  : ''
              }
              //placeholder="Provide a reason when marking the project as Not Applicable"
              sx={
                formData.isProjectNA
                  ? styles.textField
                  : { ...styles.textField, ...styles.emptyField }
              }
            />
          </Box>
      </AccordionDetails>
    </Accordion>
    <Accordion
    defaultExpanded
    sx={{ mt: 2 }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography
        variant="body1"
        sx={styles.sectionHeader}
      >
        AI Adoption Metrics
      </Typography>
    </AccordionSummary>

    <AccordionDetails>
        {/* AI Adoption Metrics Section */}
        <Box sx={styles.aiAdoptionSection}>
          

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
                    formData.headcount === 0 || formData.isProjectNA
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
            {/* License count input field */}
            <Box>
            <Tooltip
              title={!formData.project ? 'Please select project first.' : ''}
              placement="top"
            >
              <TextField
                fullWidth
                label="No. of Licenses"
                type="number"
                value={formData.licenseCount ?? ''}
                onChange={(e) =>
                  handleFieldChange('licenseCount', e.target.value)
                }
                variant="outlined"
                disabled={!formData.project || isInfoLoading || formData.isProjectNA}
                InputProps={{
                  startAdornment: (
                    <PersonRounded
                      sx={
                        formData.licenseCount
                          ? styles.icon
                          : styles.emptyIcon
                      }
                    />
                  ),
                  inputProps: {
                    min: 0,
                  },
                }}
                placeholder="Enter number of licenses"
                sx={
                  formData.licenseCount
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
                <FormControl
                  fullWidth
                  disabled={!formData.project || formData.isProjectNA || isInfoLoading}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      ...styles.inputLabel,
                      mb: 1,
                    }}
                  >
                    License Provider
                  </Typography>
                  <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.licenseProvider === 'Client'}
                      onChange={(e) =>
                        handleFieldChange(
                          'licenseProvider',
                          e.target.checked ? 'Client' : ''
                        )
                      }
                      disabled ={formData.isProjectNA}
                    />
                  }
                  label="Client"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.licenseProvider === 'Neurealm'}
                      onChange={(e) =>
                        handleFieldChange(
                          'licenseProvider',
                          e.target.checked ? 'Neurealm' : ''
                        )
                      }
                    disabled ={formData.isProjectNA}
                    />
                  }
                  label="Neurealm"
                />
                </FormControl>
              </Tooltip>
            </Box>

            {/* <Box>
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
                    disabled={!formData.practice || isInfoLoading || !!formData.isProjectNA}
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
            </Box> */}
          </Box>
          
        {/* RunOps Adoption Metrics */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#333',
              fontSize: '1rem',
              mb: 2,
            }}
          >
            RunOps Adoption Metrics
          </Typography>

          <Box sx={styles.formGrid}>
            <TextField
              fullWidth
              label="% Tickets Auto-Resolved by AI"
              value={formData.runOpsAutoResolved ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsAutoResolved' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter percentage or NA"
              sx={styles.textField} disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="MTTR Reduction vs Traditional Model"
              value={formData.runOpsMTTRReduction ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsMTTRReduction' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField} disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# AI Agents in Production (Not Pilots)"
              value={formData.runOpsAIAgents ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsAIAgents' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField} disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# End-to-End Workflows Re-imagined and Automated"
              value={formData.runOpsAutomatedWorkflows ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsAutomatedWorkflows' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField} disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# MTTD (Mean Time to Detect)"
              value={formData.runOpsMTTD ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsMTTD' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField} disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# MTTR (Mean Time to Respond or Repair)"
              value={formData.runOpsMTTR ?? ''}
              onChange={(e) =>
                onFormChange(
                  'runOpsMTTR' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField} 
              disabled = {formData.isProjectNA}
            />
          </Box>
        </Box>
        
        {/* Engineering Adoption Metrics */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#333',
              fontSize: '1rem',
              mb: 2,
            }}
          >
            Engineering Adoption Metrics
          </Typography>

          <Box sx={styles.formGrid}>
            <TextField
              fullWidth
              label="Delivery cycle-time reduction attributable to AI "
              value={formData.engineerDeliveryCycleTime ?? ''}
              onChange={(e) =>
                onFormChange(
                  'engineerDeliveryCycleTime' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# AI agents in production — not pilots / POC"
              value={formData.engineerAIAgents ?? ''}
              onChange={(e) =>
                onFormChange(
                  'engineerAIAgents' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="Contract Test case Pass Rate (%)
                      (Passed Tests / Total Executed Tests) × 100"
              value={formData.engineerContractTestCasePassRate ?? ''}
              onChange={(e) =>
                onFormChange(
                  'engineerContractTestCasePassRate' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="Performance Defects Detected Pre-release (%)"
              value={formData.engineerPerformanceDefectsPreRelease ?? ''}
              onChange={(e) =>
                onFormChange(
                  'engineerPerformanceDefectsPreRelease' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />
          </Box>
        </Box>
        
        {/* Common Adoption Metrics */}
        <Box sx={{ mt: 4 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#333',
              fontSize: '1rem',
              mb: 2,
            }}
          >
            Common Adoption Metrics
          </Typography>

          <Box sx={styles.formGrid}>
            <TextField
              fullWidth
              label="% workforce with externally validated AI / GenAI / Agentic AI certification"
              value={formData.commonAdoptionWorkforceCertification ?? ''}
              onChange={(e) =>
                onFormChange(
                  'commonAdoptionWorkforceCertification' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter percentage or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="Efforts saved in hours"
              value={formData.commonAdoptionEffortsSaved ?? ''}
              onChange={(e) =>
                onFormChange(
                  'commonAdoptionEffortsSaved' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />

            <TextField
              fullWidth
              label="# FDE ( Forward Deployment Engineer)
                        penetration as % of client-facing headcount"
              value={formData.commonDeploymentEngineer ?? ''}
              onChange={(e) =>
                onFormChange(
                  'commonDeploymentEngineer' as keyof FormData,
                  e.target.value
                )
              }
              placeholder="Enter value or NA"
              sx={styles.textField}
              disabled = {formData.isProjectNA}
            />
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
              !isNACommentsValid() ||
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
</AccordionDetails>
          </Accordion>
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
