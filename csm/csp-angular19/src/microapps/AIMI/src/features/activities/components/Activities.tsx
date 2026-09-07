import { Box, Paper, Typography, Tabs, Tab, Button } from '@mui/material';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
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
import { useActivitySubmission } from '../hooks/useActivitySubmission';
import { useActivityState } from '../hooks/useActivityState';
import { CommonSnackbar } from '@shared/components/CommonSnackbar';
import { useFeatureFlags } from '@shared/hooks/useFeatureFlags';
import { Loading } from '@shared/components/Loading';
import UploadFileIcon from '@mui/icons-material/UploadFile';
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
    });

  // Memoize computed values to prevent unnecessary re-renders
  const businessUnits = useMemo(() => getBusinessUnits(), [getBusinessUnits]);
  const accounts = useMemo(
    () => getAccounts(projectInfoFormData.businessUnit),
    [getAccounts, projectInfoFormData.businessUnit]
  );
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
    (field: keyof ProjectInfoFormData, value: string | number) => {
      setProjectInfoFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Reset dependent fields when parent field changes
        if (field === 'businessUnit') {
          newData.businessHead = '';
          newData.account = '';
          newData.accountManager = '';
          newData.project = '';
          newData.manager = '';
          newData.practice = '';
          newData.headcount = undefined;
          newData.peopleUsingAI = undefined;
          // Auto-populate business head when business unit is selected
          if (value) {
            const buHead = getBUHeadForBusinessUnit(value as string);
            newData.businessHead = buHead;
          }
        } else if (field === 'account') {
          newData.accountManager = '';
          newData.project = '';
          newData.manager = '';
          newData.practice = '';
          newData.headcount = undefined;
          newData.peopleUsingAI = undefined;
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
            newData.project
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

          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            disabled={!projectInfoFormData.project}
            onClick={() => setImportDialogOpen(true)}
          >
            Import Excel
          </Button>
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
                <ManageActivities {...manageActivitiesProps} />
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
  onImport={(rows) => {
    const invalidRows = rows
  .map((row, index) => ({
    row,
    rowNumber: index + 2, // Excel row number after header
  }))
  .filter(
    ({ row }) =>
      !row['SDLC Phase'] ||
      !row['Activity']
  );

if (invalidRows.length > 0) {
  setImportValidationMessage(
    `Invalid data found in row(s): ${invalidRows
      .map((r) => r.rowNumber)
      .join(', ')}. SDLC Phase and Activity are mandatory.`
  );

  setImportValidationOpen(true);
  return;
}
    rows.forEach((row) => {
      addActivity({
        id: crypto.randomUUID(),
        createdAt: new Date(),
        status: 'draft',

        sdlcPhase: row['SDLC Phase'] || '',
        activity: row['Activity'] || '',
        applicability: row['Applicability'] || '',
        aiAdoptionScore: row['AI Adoption Score'] || '',

        aiToolUsed: row['AI Tools Used']
          ? String(row['AI Tools Used'])
              .split(',')
              .map((x) => x.trim())
          : [],

        clientApproved: row['Client Approved'] || '',

        acceleratorsUsed: row['Accelerators Used']
          ? String(row['Accelerators Used'])
              .split(',')
              .map((x) => x.trim())
          : [],

        workDoneByAI: Number(row['% Work Done by AI']) || 0,

        hoursSaved: Number(row['Hours Saved']) || 0,

        revenueGenerated: row['Revenue Generated'] || '',

        benefitTo: row['Benefit To'] || '',

        qualitativeBenefits: row['Qualitative Benefits']
          ? String(row['Qualitative Benefits'])
              .split(',')
              .map((x) => x.trim())
          : [],

        comments: row['Comments'] || '',

        aiToolDetails: {},
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
