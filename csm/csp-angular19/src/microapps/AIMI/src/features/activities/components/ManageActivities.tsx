import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Checkbox,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControlLabel,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Reviews,
  UploadFile as UploadFileIcon,
} from '@mui/icons-material';
import { generateAndDownloadReport } from '../../reports/utils/csvExportUtils';
import { AddActivityModal } from './AddActivityModal';
import { ActivityCard } from './ActivityCard';
import { CopyActivityDialog } from './CopyActivityDialog';
import type {
  ActivityFormData,
  ActivityData,
  ActivityWithProjectInfo,
} from '../types/activityTypes';
import {
  activityStorageUtils,
  calculateAverageAIAdoptionScore,
  calculateAverageAIAdoptionScoreByPhase,
  areAllActivitiesNotApplicable,
} from '../utils/activityStorageUtils';
import { CommonSnackbar } from '../../../shared/components/CommonSnackbar';
import { useAuth } from '@auth/hooks/useAuth';
import { useFeatureFlags } from '../../../shared/hooks/useFeatureFlags';
import { getActivitiesForSDLCPhase } from '../../../shared/utils/questionnaireUtils';
//import ScoreIcon from '@mui/icons-material/Score';

interface ManageActivitiesProps {
  selectedPractice: string;
  activities: ActivityData[];
  hasUnsavedChanges: boolean;
  onAddActivity: (activity: ActivityData) => void;
  onUpdateActivity: (activity: ActivityData) => void;
  onDeleteActivity: (activityId: string) => void;
  onCommitActivity?: (oldId: string, activity: ActivityData) => void;
  isActivityUnsaved: (activityId: string) => boolean;
  onSubmit?: (activities: ActivityData[]) => Promise<void>;
  onSaveDraft?: (activities: ActivityData[]) => Promise<void>;
  projectInfo?: {
    businessUnit: string;
    businessHead: string;
    account: string;
    accountManager: string;
    project: string;
    projectId: string;
    practice: string;
    manager: string;
    currentPhase: string;
    isProjectNA?: boolean;
    naComments?: string;
    acceptedScore?: number;
    scoreReviewed?: boolean;
    acceptedScoreComment?: string;
  };
  onSaveReviewInfo?: (reviewInfo: {
  acceptedScore?: number;
  scoreReviewed?: boolean;
  acceptedScoreComment?: string;
}) => Promise<void>;
  onImportActivities?: () => void;
}


export const ManageActivities: React.FC<ManageActivitiesProps> = ({
  selectedPractice,
  activities,
  hasUnsavedChanges,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  onCommitActivity,
  isActivityUnsaved,
  onSubmit,
  onSaveDraft,
  projectInfo,
  onSaveReviewInfo,
  onImportActivities,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [editingActivity, setEditingActivity] = useState<ActivityData | null>(
    null
  );
  const [copySourceActivity, setCopySourceActivity] =
    useState<ActivityData | null>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    activityId: string | null;
    activityName: string;
  }>({
    open: false,
    activityId: null,
    activityName: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [acceptedScore, setAcceptedScore] = useState('');
const [scoreReviewed, setScoreReviewed] = useState(false);
const [acceptedScoreComment, setAcceptedScoreComment] = useState('');
const [commentDialogOpen, setCommentDialogOpen] = useState(false);

useEffect(() => {
  if (projectInfo) {
    setAcceptedScore(
      String(projectInfo.acceptedScore ?? '')
    );

    setScoreReviewed(
      projectInfo.scoreReviewed ?? false
    );

    setAcceptedScoreComment(
      projectInfo.acceptedScoreComment ?? ''
    );
  }
}, [projectInfo]);
const hasAcceptedScoreChanges =
  acceptedScore !== String(projectInfo?.acceptedScore ?? '') ||
  scoreReviewed !== (projectInfo?.scoreReviewed ?? false) ||
  acceptedScoreComment !== (projectInfo?.acceptedScoreComment ?? '');

  // Ids of activities auto-saved as drafts (on add/edit/copy) that haven't been
  // explicitly confirmed via the "Save as Draft" button yet - these still show as Unsaved
  const [pendingAutoSaveIds, setPendingAutoSaveIds] = useState<Set<string>>(
    new Set()
  );

  const { isAdmin, isAuthenticated } = useAuth();
  const featureFlags = useFeatureFlags('activities');
  const canBulkDelete = isAdmin && featureFlags.showDeleteButton;

  // Ids of activities checked via the admin bulk-select checkboxes
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(
    new Set()
  );
  const [bulkDeleteConfirmation, setBulkDeleteConfirmation] = useState<{
    open: boolean;
    phase: string;
    activityIds: string[];
  }>({ open: false, phase: '', activityIds: [] });

  
  // Drop selections for activities that no longer exist (deleted/project switch)
  useEffect(() => {
    setSelectedActivityIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(activities.map((activity) => activity.id));
      const next = new Set<string>();
      let changed = false;
      prev.forEach((id) => {
        if (validIds.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [activities]);

  // Activities already persisted as drafts can still be submitted even with no local edits
  const hasDraftActivities = useMemo(
    () => activities.some((activity) => activity.status !== 'submitted'),
    [activities]
  );
  const canSubmitOrSaveDraft =
  hasUnsavedChanges ||
  hasDraftActivities ||
  hasAcceptedScoreChanges;
  const isProjectNA = !!projectInfo?.isProjectNA;

  // Group activities by SDLC Phase
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityData[]> = {};

    activities.forEach((activity) => {
      if (!groups[activity.sdlcPhase]) {
        groups[activity.sdlcPhase] = [];
      }
      groups[activity.sdlcPhase].push(activity);
    });

    return groups;
  }, [activities]);

  const totalActivities = activities.length;

  // Global styling object
  const styles = {
    container: {
      p: 3,
      bgcolor: 'white',
      borderRadius: '0 0 8px 8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    header: {
      mb: 3,
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 2,
      mb: 2,
      flexWrap: 'wrap',
    },
    actionButtons: {
      display: 'flex',
      gap: 2,
      flexWrap: 'wrap',
    },
    addButton: {
      borderRadius: 1.5,
      textTransform: 'none',
      fontWeight: 500,
      px: 2,
      py: 1,
      fontSize: '0.875rem',
      bgcolor: '#1976d2',
      '&:hover': {
        bgcolor: '#1565c0',
      },
      '&:disabled': {
        bgcolor: '#e0e0e0',
        color: '#9e9e9e',
      },
    },
    generateReportButton: {
      borderRadius: 1.5,
      textTransform: 'none',
      fontWeight: 500,
      px: 2,
      py: 1,
      fontSize: '0.875rem',
      border: '1px solid #1976d2',
      color: '#1976d2',
      '&:hover': {
        border: '1px solid #1565c0',
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
      '&:disabled': {
        border: '1px solid #e0e0e0',
        color: '#9e9e9e',
      },
    },
    overallScoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      p: 1.5,
      borderRadius: 2,
      bgcolor: '#f8f9fa',
      border: '1px solid #e9ecef',
    },
    projectName: {
      fontWeight: 600,
      color: '#333',
      fontSize: '0.9rem',
    },
    overallScoreLabel: {
      fontWeight: 500,
      color: '#495057',
    },
    overallScoreValue: {
      fontWeight: 600,
      bgcolor: '#4caf50',
      color: 'white',
      px: 1.5,
      py: 0.25,
      borderRadius: 1,
      minWidth: '50px',
      textAlign: 'center',
      fontSize: '0.9rem',
    },
    projectScoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    scoreContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    phaseTitleContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    phaseActionsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 1,
    },
    helperText: {
      mt: 1,
      fontSize: '0.875rem',
    },
    emptyState: {
      p: 4,
      textAlign: 'center',
      borderRadius: 2,
      bgcolor: '#fafafa',
    },
    emptyStateTitle: {
      mb: 1,
    },
    submitButtonContainer: {
      mt: 4,
      display: 'flex',
      justifyContent: 'center',
      gap: 2,
    },
    submitButton: {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      px: 4,
      py: 1.5,
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #218838 0%, #1ea085 100%)',
      },
      '&:disabled': {
        background: 'linear-gradient(135deg, #ccc 0%, #999 100%)',
      },
    },
    saveDraftButton: {
      borderRadius: 2,
      textTransform: 'none',
      fontWeight: 500,
      px: 4,
      py: 1.5,
      border: '1px solid #1976d2',
      color: '#1976d2',
      '&:hover': {
        border: '1px solid #1565c0',
        backgroundColor: 'rgba(25, 118, 210, 0.04)',
      },
      '&:disabled': {
        border: '1px solid #e0e0e0',
        color: '#9e9e9e',
      },
    },
    accordion: {
      '&:before': {
        display: 'none',
      },
      boxShadow: 'none',
      border: '1px solid #e0e0e0',
      borderRadius: 2,
      mb: 2,
      '&:last-child': {
        mb: 0,
      },
    },
    accordionSummary: {
      backgroundColor: '#f5f5f5',
      borderRadius: 2,
      '&:hover': {
        backgroundColor: '#e0e0e0',
      },
    },
    accordionSummaryContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
    },
    phaseTitle: {
      fontWeight: 600,
      color: '#333',
      fontSize: '1.1rem',
    },
    phaseScore: {
      fontWeight: 600,
      background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      color: 'white',
      px: 1.5,
      py: 0.25,
      borderRadius: 1,
      fontSize: '0.875rem',
    },
    activityCount: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      borderRadius: '12px',
      px: 1.5,
      py: 0.5,
      fontSize: '0.875rem',
      fontWeight: 500,
      ml: 2,
    },
    warningIcon: {
      color: '#ff9800',
      fontSize: '1.2rem',
      animation: 'pulse 2s infinite',
    },
    accordionDetails: {
      pt: 2,
      pb: 1,
    },
    deleteButton: {
      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
      color: 'white',
      '&:hover': {
        background: 'linear-gradient(135deg, #c82333 0%, #a71e2a 100%)',
      },
    },
  };

  const handleAddActivity = () => {
    setIsModalOpen(true);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleEditActivity = (activity: ActivityData) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleCopyClick = (activity: ActivityData) => {
    setCopySourceActivity(activity);
    setIsCopyDialogOpen(true);
  };

  const handleCloseCopyDialog = () => {
    setIsCopyDialogOpen(false);
    setCopySourceActivity(null);
  };

  const handleConfirmCopy = (
    targetSdlcPhase: string,
    targetActivity: string
  ) => {
    if (!copySourceActivity) return;

    // Copy every field from the source but assign a fresh id/createdAt so the original is untouched
    const newActivity: ActivityData = {
      ...copySourceActivity,
      id: Date.now().toString(),
      sdlcPhase: targetSdlcPhase,
      activity: targetActivity,
      createdAt: new Date(),
      updatedAt: undefined,
      status: 'draft',
    };

    handleCloseCopyDialog();
    void persistAndCommitActivity(newActivity, 'Activity copied successfully!');
  };

  const handleDeleteClick = (activity: ActivityData) => {
    setDeleteConfirmation({
      open: true,
      activityId: activity.id,
      activityName: activity.activity,
    });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmation.activityId) {
      onDeleteActivity(deleteConfirmation.activityId);
      setPendingAutoSaveIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteConfirmation.activityId!);
        return next;
      });
      showSnackbar('Activity deleted successfully!', 'success');
    }
    setDeleteConfirmation({ open: false, activityId: null, activityName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, activityId: null, activityName: '' });
  };

  const handleToggleActivitySelection = (
    activityId: string,
    checked: boolean
  ) => {
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(activityId);
      } else {
        next.delete(activityId);
      }
      return next;
    });
  };

  const handleTogglePhaseSelection = (
    phaseActivityIds: string[],
    checked: boolean
  ) => {
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      phaseActivityIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  };

  const handleBulkDeleteClick = (phase: string, activityIds: string[]) => {
    if (activityIds.length === 0) return;
    setBulkDeleteConfirmation({ open: true, phase, activityIds });
  };

  const handleConfirmBulkDelete = () => {
    const { activityIds } = bulkDeleteConfirmation;
    activityIds.forEach((id) => onDeleteActivity(id));
    setSelectedActivityIds((prev) => {
      const next = new Set(prev);
      activityIds.forEach((id) => next.delete(id));
      return next;
    });
    setPendingAutoSaveIds((prev) => {
      const next = new Set(prev);
      activityIds.forEach((id) => next.delete(id));
      return next;
    });
    showSnackbar(
      `${activityIds.length} ${activityIds.length === 1 ? 'activity' : 'activities'} deleted successfully!`,
      'success'
    );
    setBulkDeleteConfirmation({ open: false, phase: '', activityIds: [] });
  };

  const handleCancelBulkDelete = () => {
    setBulkDeleteConfirmation({ open: false, phase: '', activityIds: [] });
  };

  // Persists a single activity to Firestore as a draft so it isn't lost if the connection drops
  const persistActivityAsDraft = async (
    activity: ActivityData
  ): Promise<ActivityData> => {
    if (!projectInfo?.projectId) return activity;

    const activityToSave: ActivityWithProjectInfo = {
      ...activity,
      status: 'draft',
      projectId: projectInfo.projectId,
      project: projectInfo.project,
      practice: projectInfo.practice,
      account: projectInfo.account,
      businessUnit: projectInfo.businessUnit,
    };

    const [savedActivity] = await activityStorageUtils.upsertActivitiesForProject([
      activityToSave,
    ]);

    return {
      ...activity,
      id: savedActivity.id,
      status: savedActivity.status,
      createdAt: new Date(savedActivity.createdAt),
      updatedAt: savedActivity.updatedAt
        ? new Date(savedActivity.updatedAt)
        : undefined,
    };
  };

  // Auto-saves the activity as a draft and syncs local state with the persisted result
  const persistAndCommitActivity = async (
    baseActivity: ActivityData,
    successMessage: string
  ) => {
    const oldId = baseActivity.id;
    const isExisting = activities.some((activity) => activity.id === oldId);

    try {
      const savedActivity = await persistActivityAsDraft(baseActivity);
      if (onCommitActivity) {
        onCommitActivity(oldId, savedActivity);
      } else if (isExisting) {
        onUpdateActivity(savedActivity);
      } else {
        onAddActivity(savedActivity);
      }
      // Auto-saved, but not yet explicitly confirmed via Save as Draft
      setPendingAutoSaveIds((prev) => {
        const next = new Set(prev);
        next.delete(oldId);
        next.add(savedActivity.id);
        return next;
      });
      showSnackbar(successMessage, 'success');
    } catch (error) {
      console.error('Error saving activity:', error);
      // Keep the entry locally so nothing is lost; it will show as unsaved until retried
      if (isExisting) {
        onUpdateActivity(baseActivity);
      } else {
        onAddActivity(baseActivity);
      }
      showSnackbar(
        'Saved locally. We will retry saving automatically.',
        'error'
      );
    }
  };

  const handleSaveActivity = (activityData: ActivityFormData) => {
    const isEditing = !!editingActivity;
    const baseActivity: ActivityData = isEditing
      ? {
          ...activityData,
          id: editingActivity!.id,
          createdAt: editingActivity!.createdAt,
          updatedAt: editingActivity!.updatedAt,
          status: editingActivity!.status,
        }
      : {
          ...activityData,
          id: Date.now().toString(),
          createdAt: new Date(),
          status: 'draft',
        };

    setEditingActivity(null);
    setIsModalOpen(false);
    void persistAndCommitActivity(
      baseActivity,
      isEditing
        ? 'Activity updated successfully!'
        : 'Activity added successfully!'
    );
  };

  const handleSaveAndAddNew = (activityData: ActivityFormData) => {
    const isEditing = !!editingActivity;
    const baseActivity: ActivityData = isEditing
      ? {
          ...activityData,
          id: editingActivity!.id,
          createdAt: editingActivity!.createdAt,
          updatedAt: editingActivity!.updatedAt,
          status: editingActivity!.status,
        }
      : {
          ...activityData,
          id: Date.now().toString(),
          createdAt: new Date(),
          status: 'draft',
        };

    setEditingActivity(null);
    void persistAndCommitActivity(
      baseActivity,
      isEditing
        ? 'Activity updated successfully!'
        : 'Activity added successfully!'
    );
    // Modal will stay open for adding another activity
  };

  const handleCloseModal = () => {
    setEditingActivity(null);
    setIsModalOpen(false);
  };

  // Bulk-marks every activity in a phase as "Activity NA", overwriting any existing
  // data for those activities in this phase
  const handleMarkPhaseAsNA = async (phase: string) => {
    const activityNames = getActivitiesForSDLCPhase(selectedPractice, phase);
    if (activityNames.length === 0) return;

    const now = new Date();
    const naActivities: ActivityData[] = activityNames.map((activityName) => {
      const existing = activities.find(
        (activity) =>
          activity.sdlcPhase === phase && activity.activity === activityName
      );

      return {
        sdlcPhase: phase,
        activity: activityName,
        applicability: 'Activity NA',
        aiAdoptionScore: '',
        aiToolUsed: '',
        acceleratorsUsed: '',
        workDoneByAI: 0,
        hoursSaved: 0,
        revenueGenerated: '',
        benefitTo: '',
        qualitativeBenefits: [],
        comments: '',
        id: existing?.id ?? `${Date.now()}-${activityName}`,
        createdAt: existing?.createdAt ?? now,
        status: existing?.status ?? 'draft',
      };
    });

    setEditingActivity(null);
    setIsModalOpen(false);

    if (!projectInfo?.projectId) {
      naActivities.forEach((activity) => {
        if (activities.some((existing) => existing.id === activity.id)) {
          onUpdateActivity(activity);
        } else {
          onAddActivity(activity);
        }
      });
      showSnackbar(
        `All activities under "${phase.replace(/:/g, '')}" marked as Activity NA.`,
        'success'
      );
      return;
    }

    const activitiesToSave: ActivityWithProjectInfo[] = naActivities.map(
      (activity) => ({
        ...activity,
        status: 'draft',
        projectId: projectInfo.projectId,
        project: projectInfo.project,
        practice: projectInfo.practice,
        account: projectInfo.account,
        businessUnit: projectInfo.businessUnit,
      })
    );

    try {
      const savedActivities =
        await activityStorageUtils.upsertActivitiesForProject(
          activitiesToSave
        );

      savedActivities.forEach((saved, index) => {
        const original = naActivities[index];
        const existedBefore = activities.some(
          (activity) => activity.id === original.id
        );
        const committed: ActivityData = {
          ...original,
          id: saved.id,
          status: saved.status,
          createdAt: new Date(saved.createdAt),
          updatedAt: saved.updatedAt ? new Date(saved.updatedAt) : undefined,
        };

        if (onCommitActivity && original.id !== saved.id) {
          onCommitActivity(original.id, committed);
        } else if (existedBefore) {
          onUpdateActivity(committed);
        } else {
          onAddActivity(committed);
        }
      });

      setPendingAutoSaveIds((prev) => {
        const next = new Set(prev);
        savedActivities.forEach((saved) => next.add(saved.id));
        return next;
      });

      showSnackbar(
        `All activities under "${phase.replace(/:/g, '')}" marked as Activity NA.`,
        'success'
      );
    } catch (error) {
      console.error('Error marking phase as NA:', error);
      naActivities.forEach((activity) => {
        if (activities.some((existing) => existing.id === activity.id)) {
          onUpdateActivity(activity);
        } else {
          onAddActivity(activity);
        }
      });
      showSnackbar(
        'Saved locally. We will retry saving automatically.',
        'error'
      );
    }
  };

  const handleGenerateReport = () => {
    try {
      generateAndDownloadReport(activities, projectInfo);
      showSnackbar('Report generated and downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating report:', error);
      showSnackbar('Error generating report. Please try again.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (activities.length === 0) {
      showSnackbar(
        'Please add at least one activity before submitting',
        'error'
      );
      return;
    }

    if (!selectedPractice) {
      showSnackbar('Please select a practice before submitting', 'error');
      return;
    }

    if (!canSubmitOrSaveDraft) {
      showSnackbar('No changes to submit', 'error');
      return;
    }

    // Validate that all required project information is filled
    if (projectInfo) {
      const requiredFields = ['project', 'projectId', 'practice'];
      const missingFields = requiredFields.filter(
        (field) => !projectInfo[field as keyof typeof projectInfo]
      );

      if (missingFields.length > 0) {
        showSnackbar(
          `Please fill in all required project information: ${missingFields.join(', ')}`,
          'error'
        );
        return;
      }
    }

    // Set submitting state to prevent multiple clicks
    setIsSubmitting(true);

    try {
       
      if (onSubmit) {
        await onSubmit(activities);
      }
      setPendingAutoSaveIds((prev) => {
        const next = new Set(prev);
        activities.forEach((activity) => next.delete(activity.id));
        return next;
      });
    } catch (error) {
      console.error('Error submitting activities:', error);
      showSnackbar('Error submitting activities. Please try again.', 'error');
    } finally {
      // Reset submitting state regardless of success or failure
      setIsSubmitting(false);
    }
  };

  const handleSaveDraftClick = async () => {
    if (activities.length === 0) {
      showSnackbar(
        'Please add at least one activity before saving a draft',
        'error'
      );
      return;
    }

    if (!selectedPractice) {
      showSnackbar('Please select a practice before saving a draft', 'error');
      return;
    }

    if (!canSubmitOrSaveDraft) {
      showSnackbar('No changes to save', 'error');
      return;
    }

    setIsSavingDraft(true);

    try {
      if (onSaveDraft) {
        await onSaveDraft(activities);
      }
      // Explicitly confirmed as drafts - clear the pending auto-save flag so the Draft label shows
      setPendingAutoSaveIds((prev) => {
        const next = new Set(prev);
        activities.forEach((activity) => next.delete(activity.id));
        return next;
      });
    } catch (error) {
      console.error('Error saving draft activities:', error);
      showSnackbar('Error saving draft. Please try again.', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        {/* Add Activity Button, Generate Report Button, and Overall Score */}
        <Box sx={styles.headerActions}>
          <Box sx={styles.actionButtons}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddActivity}
              disabled={!selectedPractice || isProjectNA}
              sx={styles.addButton}
            >
              Add Activity
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleGenerateReport}
              disabled={activities.length === 0 || hasUnsavedChanges}
              sx={styles.generateReportButton}
            >
              Generate Report
            </Button>

            {onImportActivities && (
              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={onImportActivities}
                disabled={!selectedPractice || isProjectNA}
              >
                Import Excel
              </Button>
            )}
          </Box>

          {activities.length > 0 && (
            <Box sx={styles.overallScoreContainer}>
              <Box sx={styles.projectScoreContainer}>
                {projectInfo?.project && (
                  <Typography variant="body2" sx={styles.projectName}>
                    {projectInfo.project}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={styles.scoreContainer}>
                    <Typography variant="body2" sx={styles.overallScoreLabel}>
                      Overall Score:
                    </Typography>

                    <Typography variant="h6" sx={styles.overallScoreValue}>
                      {areAllActivitiesNotApplicable(activities)
                        ? 'N/A'
                        : calculateAverageAIAdoptionScore(activities).toFixed(2)}
                    </Typography>
                  </Box>
                  {isAuthenticated && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={styles.overallScoreLabel}>
                        Click this icon to review the accepted score
                      </Typography>
                      <Tooltip title={isAdmin ? 'Review Score' : 'View Score'}>
                        <IconButton
                          color="primary"
                          onClick={() => setCommentDialogOpen(true)}
                          disabled={projectInfo?.isProjectNA}
                        >
                          <Reviews />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>

        {!selectedPractice && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.helperText}
          >
            Please select a practice to enable adding activities
          </Typography>
        )}

        {activities.length === 0 && selectedPractice && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.helperText}
          >
            Add activities to enable report generation
          </Typography>
        )}

        {hasUnsavedChanges && activities.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={styles.helperText}
          >
            Save your changes to enable report generation
          </Typography>
        )}
      </Box>

      {/* Activities List */}
      <Box>
        {totalActivities === 0 ? (
          <Paper elevation={1} sx={styles.emptyState}>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={styles.emptyStateTitle}
            >
              No activities added yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click "Add Activity" to start managing your AI activities
            </Typography>
          </Paper>
        ) : (
          <Box>
            {/* Grouped Activities by SDLC Phase */}
            {Object.entries(groupedActivities).map(
              ([sdlcPhase, phaseActivities]) => {
                const phaseScores =
                  calculateAverageAIAdoptionScoreByPhase(activities);
                const phaseScore = phaseScores[sdlcPhase] || 0;

                // Check if any activity in this phase is unsaved
                const hasUnsavedActivities = phaseActivities.some((activity) =>
                  isActivityUnsaved(activity.id)
                );

                const phaseActivityIds = phaseActivities.map(
                  (activity) => activity.id
                );
                const selectedInPhaseCount = phaseActivityIds.filter((id) =>
                  selectedActivityIds.has(id)
                ).length;
                const isPhaseFullySelected =
                  phaseActivityIds.length > 0 &&
                  selectedInPhaseCount === phaseActivityIds.length;
                const isPhasePartiallySelected =
                  selectedInPhaseCount > 0 && !isPhaseFullySelected;

                return (
                  <Accordion
                    key={sdlcPhase}
                    sx={styles.accordion}
                    defaultExpanded
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={styles.accordionSummary}
                    >
                      <Box sx={styles.accordionSummaryContent}>
                        <Box sx={styles.phaseTitleContainer}>
                          {canBulkDelete && (
                            <Checkbox
                              size="small"
                              checked={isPhaseFullySelected}
                              indeterminate={isPhasePartiallySelected}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) =>
                                handleTogglePhaseSelection(
                                  phaseActivityIds,
                                  e.target.checked
                                )
                              }
                              aria-label={`Select all activities in ${sdlcPhase}`}
                              sx={{ p: 0, mr: 0.5 }}
                            />
                          )}
                          <Typography variant="body1" sx={styles.phaseTitle}>
                            {sdlcPhase}
                          </Typography>
                          {phaseScore > 0 && (
                            <Typography variant="body2" sx={styles.phaseScore}>
                              Avg: {phaseScore.toFixed(2)}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={styles.phaseActionsContainer}>
                          <Chip
                            label={`${phaseActivities.length} ${phaseActivities.length === 1 ? 'activity' : 'activities'}`}
                            sx={styles.activityCount}
                          />
                          {hasUnsavedActivities && (
                            <WarningIcon sx={styles.warningIcon} />
                          )}
                          {canBulkDelete && (
                            <Tooltip
                              title={
                                selectedInPhaseCount === 0
                                  ? 'Select activities to delete'
                                  : `Delete ${selectedInPhaseCount} selected`
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  color="error"
                                  disabled={selectedInPhaseCount === 0 || projectInfo?.isProjectNA}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBulkDeleteClick(
                                      sdlcPhase,
                                      phaseActivityIds.filter((id) =>
                                        selectedActivityIds.has(id)
                                      )
                                    );
                                  }}
                                  aria-label={`Delete selected activities in ${sdlcPhase}`}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={styles.accordionDetails}>
                      {phaseActivities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          onEdit={handleEditActivity}
                          onDelete={handleDeleteClick}
                          onCopy={handleCopyClick}
                          actionsDisabled={isProjectNA}
                          selectable={canBulkDelete}
                          selected={selectedActivityIds.has(activity.id)}
                          onSelectChange={handleToggleActivitySelection}
                          isUnsaved={isActivityUnsaved(activity.id)}
                          isPendingDraftConfirmation={pendingAutoSaveIds.has(
                            activity.id
                          )}
                        />
                      ))}
                    </AccordionDetails>
                  </Accordion>
                );
              }
            )}
          </Box>
        )}
      </Box>

      {/* Submit Button */}
      {totalActivities > 0 && (
        <Box sx={styles.submitButtonContainer}>
          <Button
            variant="outlined"
            onClick={handleSaveDraftClick}
            disabled={!selectedPractice || !canSubmitOrSaveDraft || isSavingDraft || isSubmitting}
            sx={styles.saveDraftButton}
          >
            {isSavingDraft ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={!selectedPractice || !canSubmitOrSaveDraft || isSubmitting || isSavingDraft}
            sx={styles.submitButton}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Activities'}
          </Button>
        </Box>
      )}

      {/* Add/Edit Activity Modal */}
      <AddActivityModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveActivity}
        onSaveAndAddNew={handleSaveAndAddNew}
        onMarkPhaseAsNA={handleMarkPhaseAsNA}
        selectedPractice={selectedPractice}
        editingActivity={editingActivity}
        existingActivities={activities}
      />

      {/* Copy Activity Dialog */}
      <CopyActivityDialog
        open={isCopyDialogOpen}
        onClose={handleCloseCopyDialog}
        onConfirm={handleConfirmCopy}
        selectedPractice={selectedPractice}
        sourceActivity={copySourceActivity}
        existingActivities={activities}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Confirm Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the activity "
            {deleteConfirmation.activityName}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            sx={styles.deleteButton}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog
        open={bulkDeleteConfirmation.open}
        onClose={handleCancelBulkDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            Confirm Bulk Delete
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{' '}
            {bulkDeleteConfirmation.activityIds.length}{' '}
            {bulkDeleteConfirmation.activityIds.length === 1
              ? 'activity'
              : 'activities'}{' '}
            from "{bulkDeleteConfirmation.phase}"? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCancelBulkDelete} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmBulkDelete}
            variant="contained"
            color="error"
            sx={styles.deleteButton}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
     
      <Dialog
  open={commentDialogOpen}
  onClose={() => setCommentDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    Review Score
  </DialogTitle>

  <DialogContent>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        mt: 1,
      }}
    >
      <TextField
        label="Accepted Score"
        value={acceptedScore}
        onChange={(e) => {
          const value = e.target.value;

          if (
            value === '' ||
            /^\d*\.?\d*$/.test(value)
          ) {
            setAcceptedScore(value);
          }
        }}
        inputProps={{
          inputMode: 'decimal',
        }}
        disabled={!isAdmin}
        fullWidth
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={scoreReviewed}
            onChange={(e) =>
              setScoreReviewed(e.target.checked)
            }
            disabled={!isAdmin}
          />
        }
        label="Score Reviewed"
      />

      <TextField
        fullWidth
        multiline
        rows={4}
        label="Comments"
        value={acceptedScoreComment}
        onChange={(e) =>
          setAcceptedScoreComment(
            e.target.value
          )
        }
        placeholder="Enter review comments"
        disabled={!isAdmin}
      />
    </Box>
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setCommentDialogOpen(false)}
      color="inherit"
    >
      {isAdmin ? 'Cancel' : 'Close'}
    </Button>

    {isAdmin && (
      <Button
        variant="contained"
        onClick={async () => {
          try {
            if (onSaveReviewInfo) {
              await onSaveReviewInfo({
                acceptedScore:
                  acceptedScore === ''
                    ? undefined
                    : Number(acceptedScore),

                scoreReviewed,
                acceptedScoreComment,
              });
            }

            setCommentDialogOpen(false);

            showSnackbar(
              'Review score saved successfully!',
              'success'
            );
          } catch (error) {
            console.error(error);

            showSnackbar(
              'Error saving review score.',
              'error'
            );
          }
        }}
      >
        Save
      </Button>
    )}
  </DialogActions>
</Dialog>
      {/* Snackbar for notifications */}
      <CommonSnackbar
        open={snackbar.open}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
};
