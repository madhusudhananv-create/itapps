import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { generateAndDownloadReport } from '../../reports/utils/csvExportUtils';
import { AddActivityModal } from './AddActivityModal';
import { ActivityCard } from './ActivityCard';
import type { ActivityFormData, ActivityData } from '../types/activityTypes';
import {
  calculateAverageAIAdoptionScore,
  calculateAverageAIAdoptionScoreByPhase,
  areAllActivitiesNotApplicable,
} from '../utils/activityStorageUtils';
import { CommonSnackbar } from '../../../shared/components/CommonSnackbar';

interface ManageActivitiesProps {
  selectedPractice: string;
  activities: ActivityData[];
  hasUnsavedChanges: boolean;
  onAddActivity: (activity: ActivityData) => void;
  onUpdateActivity: (activity: ActivityData) => void;
  onDeleteActivity: (activityId: string) => void;
  isActivityUnsaved: (activityId: string) => boolean;
  onSubmit?: (activities: ActivityData[]) => Promise<void>;
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
  };
}

export const ManageActivities: React.FC<ManageActivitiesProps> = ({
  selectedPractice,
  activities,
  hasUnsavedChanges,
  onAddActivity,
  onUpdateActivity,
  onDeleteActivity,
  isActivityUnsaved,
  onSubmit,
  projectInfo,
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
      showSnackbar('Activity deleted successfully!', 'success');
    }
    setDeleteConfirmation({ open: false, activityId: null, activityName: '' });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({ open: false, activityId: null, activityName: '' });
  };

  const handleSaveActivity = (activityData: ActivityFormData) => {
    if (editingActivity) {
      // Update existing activity
      const updatedActivity: ActivityData = {
        ...activityData,
        id: editingActivity.id,
        createdAt: editingActivity.createdAt,
        updatedAt: editingActivity.updatedAt,
      };
      onUpdateActivity(updatedActivity);
      setEditingActivity(null);
      showSnackbar('Activity updated successfully!', 'success');
    } else {
      // Add new activity
      const newActivity: ActivityData = {
        ...activityData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      onAddActivity(newActivity);
      showSnackbar('Activity added successfully!', 'success');
    }
    setIsModalOpen(false);
  };

  const handleSaveAndAddNew = (activityData: ActivityFormData) => {
    if (editingActivity) {
      // Update existing activity
      const updatedActivity: ActivityData = {
        ...activityData,
        id: editingActivity.id,
        createdAt: editingActivity.createdAt,
        updatedAt: editingActivity.updatedAt,
      };
      onUpdateActivity(updatedActivity);
      setEditingActivity(null);
      showSnackbar('Activity updated successfully!', 'success');
    } else {
      // Add new activity
      const newActivity: ActivityData = {
        ...activityData,
        id: Date.now().toString(),
        createdAt: new Date(),
      };
      onAddActivity(newActivity);
      showSnackbar('Activity added successfully!', 'success');
    }
    // Modal will stay open for adding another activity
  };

  const handleCloseModal = () => {
    setEditingActivity(null);
    setIsModalOpen(false);
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

    if (!hasUnsavedChanges) {
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
    } catch (error) {
      console.error('Error submitting activities:', error);
      showSnackbar('Error submitting activities. Please try again.', 'error');
    } finally {
      // Reset submitting state regardless of success or failure
      setIsSubmitting(false);
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
              disabled={!selectedPractice}
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
          </Box>

          {activities.length > 0 && (
            <Box sx={styles.overallScoreContainer}>
              <Box sx={styles.projectScoreContainer}>
                {projectInfo?.project && (
                  <Typography variant="body2" sx={styles.projectName}>
                    {projectInfo.project}
                  </Typography>
                )}
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
                          isUnsaved={isActivityUnsaved(activity.id)}
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
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSubmit}
            disabled={!selectedPractice || !hasUnsavedChanges || isSubmitting}
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
        selectedPractice={selectedPractice}
        editingActivity={editingActivity}
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
