import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
import { useAllocatedAccounts } from '@shared/projects/hooks/useAllocatedAccounts';
import { ProjectInfoSelection } from './ProjectInfoSelection';
import {
  useCallback,
  useState,
  useMemo,
  useEffect,
  lazy,
  Suspense,
} from 'react';
import type { ActivityData } from '../types/activityTypes';
import { useAimiOptionLists } from '../../../shared/lookups/useAimiOptionLists';
import { normalizeImportedRow } from '../utils/importNormalizeUtils';
import type { NormalizedImportFields } from '../utils/importNormalizeUtils';
import { useActivitySubmission } from '../hooks/useActivitySubmission';
import { useActivityState } from '../hooks/useActivityState';
import { useAcceptedScore } from '../hooks/useAcceptedScore';
import { CommonSnackbar } from '@shared/components/CommonSnackbar';
import { useFeatureFlags } from '@shared/hooks/useFeatureFlags';
import { Loading } from '@shared/components/Loading';
//import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  COMPONENT_NAMES,
  preloadComponents,
  type ComponentName,
} from '@shared/utils/preloadComponents';
import { ImportActivitiesDialog } from './ImportActivites';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useQuestionnaireLookup } from '../../../shared/lookups/useQuestionnaireLookup';

const ManageActivities = lazy(() =>
  import('./ManageActivities').then((module) => ({
    default: module.ManageActivities,
  }))
);

const ProjectStatistics = lazy(() =>
  import('./ProjectStatistics').then((module) => ({
    default: module.ProjectStatistics,
  }))
);

// Type definitions for better type safety
interface ProjectInfoFormData {
  businessUnit: string;
  businessHead: string;
  account: string;
  accountManager: string;
  project: string;
  projectId: string;
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
  presentationDone?: boolean;
  commonAdoptionEffortsSaved?: string;
  commonDeploymentEngineer?: string;
  commonAdoptionWorkforceCertification?: string;
  engineerAIAgents?: string;
  engineerDeliveryCycleTime?: string;
  engineerContractTestCasePassRate?: string;
  engineerPerformanceDefectsPreRelease?: string;
  projectFY?: string;
}
// Global styling object
const styles = {
  paper: {
    p: 3,
    borderRadius: 2,
    bgcolor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  headerContainer: {
    mb: 4,
  },
  headerTitleContainer: {
    mb: 2,
  },
  headerTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    fontSize: '1.5rem',
  },
  headerDescription: {
    color: '#666',
    fontSize: '0.95rem',
  },
  manageActivitiesSection: {
    mt: 3,
  },
  tabsContainer: {
    mt: 2,
  },
  tabPanel: {
    p: 0,
  },
  tabsWrapper: {
    bgcolor: 'white',
    borderRadius: '8px 8px 0 0',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  tabs: {
    px: 3,
    pt: 1,
    '& .MuiTabs-indicator': {
      backgroundColor: '#1976d2',
      height: 3,
    },
    '& .MuiTab-root': {
      minHeight: 48,
      textTransform: 'none',
      fontSize: '1rem',
      fontWeight: 500,
      color: '#666',
      '&.Mui-selected': {
        color: '#1976d2',
        fontWeight: 600,
      },
    },
  },
  placeholderContainer: {
    mt: 2,
    bgcolor: 'white',
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    minHeight: 300,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContent: {
    textAlign: 'center',
    p: 4,
  },
  placeholderIcon: {
    fontSize: '4rem',
    mb: 2,
    opacity: 0.6,
  },
  placeholderTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    mb: 1,
  },
  placeholderDescription: {
    color: '#666',
    maxWidth: 400,
    lineHeight: 1.5,
  },
};

export function Activities() {
  const {
    getBusinessUnits,
    getAccounts,
    getProjects,
    getManagerForProject,
    getCSMForAccount,
    getBUHeadForBusinessUnit,
    getProjectInfo,
    getOriginalProjectData,
  } = useProjectHierarchy();
  const { getSDLCPhasesForPractice, getActivitiesForSDLCPhase } =
    useQuestionnaireLookup();
  const { aiTools, accelerators, qualitativeBenefits } = useAimiOptionLists();
  const [isLoading] = useState(false);
  const {
    submitSuccess,
    submitActivities,
    clearSubmitSuccess,
    draftSaveSuccess,
    saveActivitiesAsDraft,
    clearDraftSaveSuccess,
  } = useActivitySubmission();

  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  const featureFlags = useFeatureFlags('dashboard');

  //import excel state
  const [importDialogOpen, setImportDialogOpen] = useState(false);  // Form state
  const [importValidationOpen, setImportValidationOpen] =
  useState(false);

  const [importValidationMessage, setImportValidationMessage] =
  useState('');
  const [projectInfoFormData, setProjectInfoFormData] =
  useState<ProjectInfoFormData>({
    businessUnit: '',
    businessHead: '',
    account: '',
    accountManager: '',
    project: '',
    projectId: '',
    practice: '',
    manager: '',
    currentPhase: '',
    headcount: undefined,
    peopleUsingAI: undefined,

    isProjectNA: false,
    naComments: '',

    runOpsAutoResolved: '',
    runOpsMTTRReduction: '',
    runOpsAIAgents: '',
    runOpsAutomatedWorkflows: '',
    runOpsMTTD: '',
    runOpsMTTR: '',
    licenseProvider: '',  
    licenseCount: undefined,
  });

  // Memoize computed values to prevent unnecessary re-renders
  const { allocatedAccountNames } = useAllocatedAccounts();
  // Only show accounts/business units the logged-in employee is allocated to
  // (same restriction the CSM Angular app applies via GetCustomerIds). null
  // while the allocation list hasn't loaded yet.
  const allowedAccounts = useMemo(() => {
    if (allocatedAccountNames === null) return null;
    return new Set(allocatedAccountNames.map((name) => name.trim().toLowerCase()));
  }, [allocatedAccountNames]);

  const businessUnits = useMemo(() => {
    const allBusinessUnits = getBusinessUnits();
    // Show nothing until the allocation list has loaded rather than briefly
    // showing every business unit first.
    if (!allowedAccounts) return [];
    return allBusinessUnits.filter((businessUnit) =>
      getAccounts(businessUnit).some((account) =>
        allowedAccounts.has(account.trim().toLowerCase())
      )
    );
  }, [getBusinessUnits, getAccounts, allowedAccounts]);
  const accounts = useMemo(() => {
    const accountsForBU = getAccounts(projectInfoFormData.businessUnit);
    if (!allowedAccounts) return [];
    return accountsForBU.filter((account) =>
      allowedAccounts.has(account.trim().toLowerCase())
    );
  }, [getAccounts, projectInfoFormData.businessUnit, allowedAccounts]);
  const projects = useMemo(
    () =>
      getProjects(
        projectInfoFormData.businessUnit,
        projectInfoFormData.account
      ),
    [getProjects, projectInfoFormData.businessUnit, projectInfoFormData.account]
  );

  // Activity state management - lifted to parent component
  const {
    activities,
    hasUnsavedChanges,
    addActivity,
    updateActivity,
    deleteActivity,
    commitActivity,
    isActivityUnsaved,
    markActivitiesAsSaved,
  } = useActivityState({
    projectId: projectInfoFormData.projectId,
    selectedPractice: projectInfoFormData.practice,
  });

  // Admin review of the Overall Score. Stored on the activity rows and saved on its
  // own, so it never goes through (or overwrites) the project info.
  const { review: acceptedScoreInfo, saveReview: handleSaveReviewInfo } =
    useAcceptedScore({
      projectId: projectInfoFormData.projectId,
      practice: projectInfoFormData.practice,
    });

  const handleActivitiesSubmit = useCallback(
    async (activities: ActivityData[]) => {
      try {
        // Submit activities (this will handle Firestore saving)
        await submitActivities(
          activities,
          projectInfoFormData,
          markActivitiesAsSaved
        );
      } catch (error) {
        console.error('Error submitting activities:', error);
      }
    },
    [submitActivities, projectInfoFormData, markActivitiesAsSaved]
  );

  const handleActivitiesSaveDraft = useCallback(
    async (activities: ActivityData[]) => {
      try {
        // Persist as drafts immediately so data isn't lost if the connection drops
        await saveActivitiesAsDraft(
          activities,
          projectInfoFormData,
          markActivitiesAsSaved
        );
      } catch (error) {
        console.error('Error saving draft activities:', error);
      }
    },
    [saveActivitiesAsDraft, projectInfoFormData, markActivitiesAsSaved]
  );

  const handleProjectInfoFormChange = useCallback(
    (field: keyof ProjectInfoFormData, value: string | number | boolean) => {
      setProjectInfoFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Reset dependent fields when parent field changes
        if (field === 'businessUnit') {
          newData.businessHead = '';
          newData.account = '';
          newData.accountManager = '';
          newData.project = '';
          newData.projectId = '';
          newData.manager = '';
          newData.practice = '';
          newData.headcount = undefined;
          newData.peopleUsingAI = undefined;
          newData.isProjectNA = false;
          newData.naComments = '';
          newData.licenseCount = undefined;
          newData.licenseProvider = '';
          newData.commonAdoptionEffortsSaved = '';
          newData.runOpsAutoResolved = '';
          newData.runOpsMTTRReduction = '';
          newData.runOpsAIAgents = '';
          newData.runOpsAutomatedWorkflows = '';
          newData.runOpsMTTD = '';
          newData.runOpsMTTR = '';
          newData.presentationDone = false;
          newData.commonDeploymentEngineer = '';
          newData.commonAdoptionWorkforceCertification = '';
          newData.engineerAIAgents = '';
          newData.engineerDeliveryCycleTime = '';
          newData.engineerContractTestCasePassRate = '';
          newData.engineerPerformanceDefectsPreRelease = '';
          newData.projectFY = '';

          // Auto-populate business head when business unit is selected
          if (value) {
            const buHead = getBUHeadForBusinessUnit(value as string);
            newData.businessHead = buHead;
          }
        } else if (field === 'account') {
          newData.accountManager = '';
          newData.project = '';
          newData.projectId = '';
          newData.manager = '';
          newData.practice = '';
          newData.headcount = undefined;
          newData.peopleUsingAI = undefined;
          newData.isProjectNA = false;
          newData.naComments = '';
          newData.licenseCount = undefined;
          newData.licenseProvider = '';
          newData.commonAdoptionEffortsSaved = '';
          newData.runOpsAutoResolved = '';
          newData.runOpsMTTRReduction = '';
          newData.runOpsAIAgents = '';
          newData.runOpsAutomatedWorkflows = '';
          newData.runOpsMTTD = '';
          newData.runOpsMTTR = '';
          newData.presentationDone = false;
          newData.commonDeploymentEngineer = '';
          newData.commonAdoptionWorkforceCertification = '';
          newData.engineerAIAgents = '';
          newData.engineerDeliveryCycleTime = '';
          newData.engineerContractTestCasePassRate = '';
          newData.engineerPerformanceDefectsPreRelease = '';
          newData.projectFY = '';
          // Auto-populate account manager when account is selected
          if (value) {
            const csm = getCSMForAccount(newData.businessUnit, value as string);
            newData.accountManager = csm;
          }
        } else if (field === 'project') {
          // Auto-populate manager and projectId
          const manager = getManagerForProject(
            newData.businessUnit,
            newData.account,
            newData.project,
          );
          newData.manager = manager?.name ?? '';

          // Get project info to set projectId
          const projectInfo = getProjectInfo(
            newData.businessUnit,
            newData.account,
            newData.project
          );
          newData.projectId = projectInfo?.projectId ?? '';

          // Get original project data to set headcount
          const originalProjectData = getOriginalProjectData(
            newData.businessUnit,
            newData.account,
            newData.project
          );
          newData.headcount = originalProjectData?.headcount;

          // Reset practice and peopleUsingAI when project changes
          newData.practice = '';
          newData.peopleUsingAI = undefined;
          newData.isProjectNA = false;
          newData.naComments = '';
          newData.isProjectNA = false;
          newData.naComments = '';
          newData.licenseCount = undefined; 
          newData.licenseProvider = '';
          newData.commonAdoptionEffortsSaved = '';
          newData.runOpsAutoResolved = '';
          newData.runOpsMTTRReduction = '';
          newData.runOpsAIAgents = '';
          newData.runOpsAutomatedWorkflows = '';
          newData.runOpsMTTD = '';
          newData.runOpsMTTR = '';
          newData.presentationDone = false;
          newData.commonDeploymentEngineer = '';
          newData.commonAdoptionWorkforceCertification = '';
          newData.engineerAIAgents = '';
          newData.engineerDeliveryCycleTime = '';
          newData.engineerContractTestCasePassRate = '';
          newData.engineerPerformanceDefectsPreRelease = '';
          newData.projectFY = '';
        }

        return newData;
      });
    },
    [
      getBUHeadForBusinessUnit,
      getCSMForAccount,
      getManagerForProject,
      getProjectInfo,
      getOriginalProjectData,
    ]
  );

  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue);
    },
    []
  );

  // Memoize child component props to prevent unnecessary re-renders
  const projectInfoSelectionProps = useMemo(
    () => ({
      formData: projectInfoFormData,
      onFormChange: handleProjectInfoFormChange,
      businessUnits,
      accounts,
      projects,
      isLoading,
      hasUnsavedChanges,
    }),
    [
      projectInfoFormData,
      handleProjectInfoFormChange,
      businessUnits,
      accounts,
      projects,
      isLoading,
      hasUnsavedChanges,
    ]
  );

  const manageActivitiesProps = useMemo(
    () => ({
      selectedPractice: projectInfoFormData.practice,
      activities,
      hasUnsavedChanges,
      onAddActivity: addActivity,
      onUpdateActivity: updateActivity,
      onDeleteActivity: deleteActivity,
      onCommitActivity: commitActivity,
      isActivityUnsaved,
      onSubmit: handleActivitiesSubmit,
      onSaveDraft: handleActivitiesSaveDraft,
      projectInfo: projectInfoFormData,
      acceptedScoreInfo,
      onSaveReviewInfo: handleSaveReviewInfo,
      onImportActivities: () => setImportDialogOpen(true),
    }),
    [
      activities,
      hasUnsavedChanges,
      addActivity,
      updateActivity,
      deleteActivity,
      commitActivity,
      isActivityUnsaved,
      handleActivitiesSubmit,
      handleActivitiesSaveDraft,
      projectInfoFormData,
      acceptedScoreInfo,
      handleSaveReviewInfo,
    ]
  );

  const projectStatisticsProps = useMemo(
    () => ({
      projectInfo: projectInfoFormData,
      activities,
    }),
    [projectInfoFormData, activities]
  );

  const snackbarProps = useMemo(
    () => ({
      open: submitSuccess,
      onClose: clearSubmitSuccess,
      message: 'Activities submitted successfully!',
      severity: 'success' as const,
    }),
    [submitSuccess, clearSubmitSuccess]
  );

  const draftSnackbarProps = useMemo(
    () => ({
      open: draftSaveSuccess,
      onClose: clearDraftSaveSuccess,
      message: 'Activities saved as draft!',
      severity: 'success' as const,
    }),
    [draftSaveSuccess, clearDraftSaveSuccess]
  );

  useEffect(() => {
    const components: ComponentName[] = [
      COMPONENT_NAMES.MANAGE_ACTIVITIES,
      COMPONENT_NAMES.REPORTS,
    ];
    if (featureFlags.showProjectStatisticsTab) {
      components.push(COMPONENT_NAMES.PROJECT_STATISTICS);
    }
    preloadComponents(components);
  }, [featureFlags.showProjectStatisticsTab]);

  return (
    <Box>
      {/* Activities Header */}
      <Box sx={styles.headerContainer}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Typography variant="body1" sx={styles.headerTitle}>
            Manage Activities
          </Typography>

          <Tooltip title="User Manual">
            <IconButton
              aria-label="Open user manual"
              onClick={() =>
                window.open(
                  `${import.meta.env.BASE_URL}manuals/AIMI_User_Manual.html`,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            >
              <MenuBookIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography variant="body1" sx={styles.headerDescription}>
          Track and manage AI maturity activities for your projects
        </Typography>
      </Box>

      {/* Project Information Card */}
      <Paper elevation={2} sx={styles.paper}>
        <ProjectInfoSelection {...projectInfoSelectionProps} />
      </Paper>

      {/* Tabbed Content Section - Show placeholder when no project selected */}
      {!projectInfoFormData.project ? (
        <Box sx={styles.placeholderContainer}>
          <Box sx={styles.placeholderContent}>
            <Box sx={styles.placeholderIcon}>📋</Box>
            <Typography variant="h6" sx={styles.placeholderTitle}>
              Select a Project to Continue
            </Typography>
            <Typography variant="body2" sx={styles.placeholderDescription}>
              Please complete the project information above to view phases,
              activities, and project statistics.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={styles.tabsContainer}>
          <Box sx={styles.tabsWrapper}>
            <Tabs value={activeTab} onChange={handleTabChange} sx={styles.tabs}>
              <Tab label="Phases and Activities" />
              {featureFlags.showProjectStatisticsTab && (
                <Tab label="Project Statistics" />
              )}
            </Tabs>
          </Box>

          {/* Tab Panel for Phases and Activities */}
          {activeTab === 0 && (
            <Box sx={styles.tabPanel}>
              <Suspense fallback={<Loading text="Loading activities..." />}>
                <ManageActivities {...manageActivitiesProps} 
                />
              </Suspense>
            </Box>
          )}

          {/* Tab Panel for Project Statistics */}
          {activeTab === 1 && featureFlags.showProjectStatisticsTab && (
            <Box sx={styles.tabPanel}>
              <Suspense fallback={<Loading text="Loading statistics..." />}>
                <ProjectStatistics {...projectStatisticsProps} />
              </Suspense>
            </Box>
          )}
        </Box>
      )}

      {/* Import Activities Dialog */}
<ImportActivitiesDialog
  open={importDialogOpen}
  onClose={() => setImportDialogOpen(false)}
  selectedPractice={projectInfoFormData.practice}
  projectInfo={{
    project: projectInfoFormData.project,
    manager: projectInfoFormData.manager,
    account: projectInfoFormData.account,
    businessUnit: projectInfoFormData.businessUnit,
    headcount: projectInfoFormData.headcount,
    peopleUsingAI: projectInfoFormData.peopleUsingAI,
  }}
  onImport={(rows) => {
    const practice = projectInfoFormData.practice;
    const validPhases = getSDLCPhasesForPractice(practice);

    // The Select fields only bind when the value exactly matches an option from
    // questionnaire.json, so imported text must be resolved to the canonical phase/activity.
    const findMatch = (value: unknown, options: string[]) => {
      const trimmed = String(value ?? '').trim();

      const exact = options.find(
        (option) => option.toLowerCase() === trimmed.toLowerCase()
      );
      if (exact) return exact;

      // Some source spreadsheets label a phase with a trailing "Phase" word
      // (e.g. "Design & Verification Phase") even when this practice's own
      // canonical name doesn't include it (e.g. "Design & Verification").
      // Only fall back to this once the exact match has already failed, so a
      // canonical name that legitimately contains "Phase" (e.g. "Implementation
      // Phase (DFT &PD)") still matches exactly first and is never touched.
      const withoutTrailingPhase = trimmed.replace(/\s+phase\s*$/i, '').trim();
      if (withoutTrailingPhase !== trimmed) {
        return options.find(
          (option) => option.toLowerCase() === withoutTrailingPhase.toLowerCase()
        );
      }

      return undefined;
    };

    const invalidRows: { rowNumber: number; reason: string }[] = [];
    const normalizedRows: Array<{
      fields: NormalizedImportFields;
      sdlcPhase: string;
      activity: string;
    }> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number after header
      const phaseInput = row['SDLC Phase'];
      const activityInput = row['Activity'];

      if (!phaseInput || !activityInput) {
        invalidRows.push({
          rowNumber,
          reason: 'SDLC Phase and Activity are mandatory',
        });
        return;
      }

      const matchedPhase = findMatch(phaseInput, validPhases);
      if (!matchedPhase) {
        invalidRows.push({
          rowNumber,
          reason: `"${phaseInput}" is not a valid SDLC Phase for the selected practice`,
        });
        return;
      }

      const validActivities = getActivitiesForSDLCPhase(practice, matchedPhase);
      const matchedActivity = findMatch(activityInput, validActivities);
      if (!matchedActivity) {
        invalidRows.push({
          rowNumber,
          reason: `"${activityInput}" is not a valid Activity for phase "${matchedPhase}"`,
        });
        return;
      }

      // Resolve the remaining columns to canonical option values so they bind in the
      // Add/Edit form; anything that matches no option is reported instead of silently dropped.
      const { fields, errors } = normalizeImportedRow(row, {
        aiTools,
        accelerators,
        qualitativeBenefits: qualitativeBenefits.map((b) => b.value),
      });
      if (errors.length > 0) {
        invalidRows.push({ rowNumber, reason: errors.join(', ') });
        return;
      }

      normalizedRows.push({
        fields,
        sdlcPhase: matchedPhase,
        activity: matchedActivity,
      });
    });

if (invalidRows.length > 0) {
  setImportValidationMessage(
    `Invalid data found in row(s): ${invalidRows
      .map((r) => `${r.rowNumber} (${r.reason})`)
      .join('; ')}.`
  );

  setImportValidationOpen(true);
  return;
}
    normalizedRows.forEach(({ fields, sdlcPhase, activity }) => {
      addActivity({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        status: 'draft',
        sdlcPhase,
        activity,
        ...fields,
      });
    });
  }}
/>
<Dialog
  open={importValidationOpen}
  onClose={() => setImportValidationOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle sx={{ color: 'warning.main' }}>
    Import Validation Failed
  </DialogTitle>

  <DialogContent>
    <Typography>
      {importValidationMessage}
    </Typography>
  </DialogContent>

  <DialogActions>
    <Button
      variant="contained"
      onClick={() => setImportValidationOpen(false)}
    >
      OK
    </Button>
  </DialogActions>
</Dialog>
{/* Success Message Snackbar */}
<CommonSnackbar {...snackbarProps} />
<CommonSnackbar {...draftSnackbarProps} />
    </Box>
    
  );
}
