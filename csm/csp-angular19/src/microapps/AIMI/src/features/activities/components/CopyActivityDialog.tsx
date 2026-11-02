import React, { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormHelperText,
} from '@mui/material';
import type { ActivityData } from '../types/activityTypes';
import {
  getSDLCPhasesForPractice,
  getActivitiesForSDLCPhase,
} from '../../../shared/utils/questionnaireUtils';
import { SelectField } from './FormFieldComponents';
import { modalStyles } from '../styles/formStyles';

interface CopyActivityDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (targetSdlcPhase: string, targetActivity: string) => void;
  selectedPractice: string;
  sourceActivity: ActivityData | null;
  existingActivities: ActivityData[];
}

export const CopyActivityDialog: React.FC<CopyActivityDialogProps> = ({
  open,
  onClose,
  onConfirm,
  selectedPractice,
  sourceActivity,
  existingActivities,
}) => {
  const [targetSdlcPhase, setTargetSdlcPhase] = useState('');
  const [targetActivity, setTargetActivity] = useState('');

  // Reset selections whenever the dialog is opened for a (possibly new) source activity
  useEffect(() => {
    if (open) {
      setTargetSdlcPhase('');
      setTargetActivity('');
    }
  }, [open, sourceActivity]);

  const sdlcPhases = useMemo(
    () => (selectedPractice ? getSDLCPhasesForPractice(selectedPractice) : []),
    [selectedPractice]
  );

  const existingActivityNamesForPhase = useMemo(() => {
    if (!targetSdlcPhase) return [];
    return existingActivities
      .filter((activity) => activity.sdlcPhase === targetSdlcPhase)
      .map((activity) => activity.activity);
  }, [existingActivities, targetSdlcPhase]);

  // Show every activity for the phase - the user can still copy onto an
  // already-used activity and adjust the other fields afterward
  const availableActivities = useMemo(() => {
    if (!selectedPractice || !targetSdlcPhase) return [];
    return [...getActivitiesForSDLCPhase(selectedPractice, targetSdlcPhase)].sort(
      (a, b) => a.localeCompare(b)
    );
  }, [selectedPractice, targetSdlcPhase]);

  const isTargetTaken =
    !!targetActivity && existingActivityNamesForPhase.includes(targetActivity);

  const handlePhaseChange = (value: string) => {
    setTargetSdlcPhase(value);
    setTargetActivity('');
  };

  const handleClose = () => {
    setTargetSdlcPhase('');
    setTargetActivity('');
    onClose();
  };

  const handleConfirm = () => {
    if (!targetSdlcPhase || !targetActivity) return;
    onConfirm(targetSdlcPhase, targetActivity);
    setTargetSdlcPhase('');
    setTargetActivity('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" component="div">
          Copy Activity
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ ...modalStyles.dialogContent, display: 'grid', gap: 3 }}>
          {sourceActivity && (
            <Typography variant="body2" color="text.secondary">
              Copying "{sourceActivity.activity}" ({sourceActivity.sdlcPhase})
              to a new phase and activity.
            </Typography>
          )}

          <Box>
            <SelectField
              label="Target SDLC Phase"
              value={targetSdlcPhase}
              onChange={handlePhaseChange}
              options={sdlcPhases.map((phase) => ({
                value: phase,
                label: phase.replace(/:/g, ''),
              }))}
              required
            />
          </Box>

          <Box>
            <SelectField
              label="Target Activity"
              value={targetActivity}
              onChange={setTargetActivity}
              options={availableActivities.map((activity) => ({
                value: activity,
                label: activity,
              }))}
              disabled={!targetSdlcPhase}
              required
            />
            {targetSdlcPhase && availableActivities.length === 0 && (
              <FormHelperText>
                No activities are configured for this phase
              </FormHelperText>
            )}
            {isTargetTaken && (
              <FormHelperText>
                This activity already exists for the selected phase - you can
                still copy it and adjust the other fields afterward
              </FormHelperText>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={modalStyles.dialogActions}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!targetSdlcPhase || !targetActivity}
          sx={modalStyles.primaryButton}
        >
          Copy
        </Button>
      </DialogActions>
    </Dialog>
  );
};
