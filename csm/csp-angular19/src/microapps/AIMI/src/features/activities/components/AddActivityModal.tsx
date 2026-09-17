import React, { useState } from 'react';
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
import type { ActivityFormData, ActivityData } from '../types/activityTypes';
import {
  AI_ADOPTION_SCORES,
  REVENUE_GENERATED_OPTIONS,
  BENEFIT_TO_OPTIONS,
  APPLICABILITY_OPTIONS,
  COMMON_AI_TOOLS,
  COMMON_ACCELERATORS,
} from '../types/activityTypes';
import { CommonAutocomplete } from '@shared/components/CommonAutocomplete';
import { AIAdoptionGuidelinesModal } from '@shared/components/AIAdoptionGuidelines/AIAdoptionGuidelinesModal';
import { ApplicabilityGuidelinesModal } from '@shared/components/ApplicabilityGuidelines/ApplicabilityGuidelinesModal';
import { useActivityForm } from '../hooks/useActivityForm';
import {
  isFormValid,
  hasFormChanges,
  isApplicable,
  isNoAIAdoption,
  validateAIToolsOrAccelerators,
} from '../utils/formValidationUtils';
import {
  SelectField,
  NumberField,
  AIScoreField,
  ApplicabilityField,
  TextAreaField,
} from './FormFieldComponents';
import { QualitativeBenefitsField } from './QualitativeBenefitsField';
import { modalStyles } from '../styles/formStyles';

interface AddActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activityData: ActivityFormData) => void;
  onSaveAndAddNew: (activityData: ActivityFormData) => void;
  selectedPractice: string;
  editingActivity?: ActivityData | null;
  existingActivities?: ActivityData[];
}

export const AddActivityModal: React.FC<AddActivityModalProps> = ({
  open,
  onClose,
  onSave,
  onSaveAndAddNew,
  selectedPractice,
  editingActivity,
  existingActivities = [],
}) => {
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(false);
  const [
    applicabilityGuidelinesModalOpen,
    setApplicabilityGuidelinesModalOpen,
  ] = useState(false);

  const {
    formData,
    originalFormData,
    sdlcPhases,
    availableActivities,
    handleFormChange,
    resetForm,
    isPhaseNA,
  } = useActivityForm(selectedPractice, editingActivity, existingActivities);

  const handleQualitativeBenefitsChange = (value: string[]) => {
    handleFormChange('qualitativeBenefits', value);
  };

  // Check if fields should be enabled based on applicability
  const applicable = isApplicable(formData.applicability);
  const noAIAdoption = isNoAIAdoption(formData.aiAdoptionScore);

  // Check if at least one of AI Tools or Accelerators is required
  const needsAIToolsOrAccelerators = applicable && !noAIAdoption;
  const hasAIToolsOrAccelerators = validateAIToolsOrAccelerators(formData);

  const handleSave = () => {
    if (isPhaseNA || isFormValid(formData)) {
      // Ensure applicability is NA when phase is NA
      const updatedData = isPhaseNA
        ? { ...formData, applicability: 'NA' }
        : formData;

      onSave(updatedData);
      resetForm();
    }
  };

  const handleSaveAndAddNew = () => {
    if (isPhaseNA || isFormValid(formData)) {
      const updatedData = isPhaseNA
        ? { ...formData, applicability: 'NA' }
        : formData;

      onSaveAndAddNew(updatedData);
      resetForm();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDialogClose = (_event: React.SyntheticEvent, reason: string) => {
    // Only allow closing via the Cancel button
    if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
      return;
    }
    handleClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            {editingActivity ? 'Edit Activity' : 'Add Activity'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={modalStyles.dialogContent}>
            <Box sx={modalStyles.formGrid}>
              {/* SDLC Phase */}
              <Box>
                <SelectField
                  label="SDLC Phase / Services"
                  value={formData.sdlcPhase}
                  onChange={(value) => handleFormChange('sdlcPhase', value)}
                  options={sdlcPhases.map((phase) => ({
                    value: phase,
                    label: phase.replace(/:/g, ''),
                  }))}
                  required={true}
                />
              </Box>

              {/* Activity */}
              <Box>
                <SelectField
                  label="Activity"
                  value={formData.activity}
                  onChange={(value) => handleFormChange('activity', value)}
                  options={availableActivities.map((activity) => ({
                    value: activity,
                    label: activity,
                  }))}
                  disabled={!formData.sdlcPhase || isPhaseNA}
                  required={!isPhaseNA}
                />
                {availableActivities.length === 0 && formData.sdlcPhase && (
                  <FormHelperText>
                    All activities for this phase have already been added
                  </FormHelperText>
                )}
              </Box>

              {/* Applicability */}
              <Box>
                <ApplicabilityField
                  value={formData.applicability}
                  onChange={(value) => handleFormChange('applicability', value)}
                  disabled={isPhaseNA || !formData.activity}
                  required={!isPhaseNA}
                  onInfoClick={() => setApplicabilityGuidelinesModalOpen(true)}
                  options={APPLICABILITY_OPTIONS}
                />
              </Box>

              {/* AI Adoption Score */}
              <Box>
                <AIScoreField
                  value={formData.aiAdoptionScore}
                  onChange={(value) =>
                    handleFormChange('aiAdoptionScore', value)
                  }
                  disabled={isPhaseNA || !applicable}
                  required={!isPhaseNA && applicable}
                  onInfoClick={() => setGuidelinesModalOpen(true)}
                  options={AI_ADOPTION_SCORES}
                />
              </Box>

              {/* % Work Done by AI */}
              <Box>
                <NumberField
                  label="% Work Done by AI"
                  value={formData.workDoneByAI}
                  onChange={(value) => handleFormChange('workDoneByAI', value)}
                  disabled={!applicable || noAIAdoption}
                  min={0}
                  max={100}
                  placeholder="0-100"
                />
              </Box>

              {/* Hours Saved */}
              <Box>
                <NumberField
                  label="Hours Saved"
                  value={formData.hoursSaved}
                  onChange={(value) => handleFormChange('hoursSaved', value)}
                  disabled={!applicable || noAIAdoption}
                  min={0}
                  placeholder="Enter hours saved"
                />
              </Box>

              {/* Revenue Generated */}
              <Box>
                <SelectField
                  label="Revenue / New Opportunity Generated"
                  value={formData.revenueGenerated}
                  onChange={(value) =>
                    handleFormChange('revenueGenerated', value)
                  }
                  options={REVENUE_GENERATED_OPTIONS}
                  disabled={!applicable || noAIAdoption}
                />
              </Box>

              {/* Benefit To */}
              <Box>
                <SelectField
                  label="Benefit To"
                  value={formData.benefitTo}
                  onChange={(value) => handleFormChange('benefitTo', value)}
                  options={BENEFIT_TO_OPTIONS}
                  disabled={!applicable || noAIAdoption}
                />
              </Box>
            </Box>

            {/* AI Tools and Accelerators - Full Width */}
            <Box sx={{ mt: 3, mx: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 3,
                }}
              >
                <CommonAutocomplete
                  value={formData.aiToolUsed}
                  onChange={(value: string | string[]) =>
                    handleFormChange('aiToolUsed', value)
                  }
                  disabled={!applicable || noAIAdoption}
                  required={
                    needsAIToolsOrAccelerators && !hasAIToolsOrAccelerators
                  }
                  label="AI Tools Used"
                  placeholder="Search or type AI tool name"
                  multiple={true}
                  options={COMMON_AI_TOOLS}
                  helperText={
                    needsAIToolsOrAccelerators && !hasAIToolsOrAccelerators
                      ? 'At least one of AI Tools or Accelerators is required. Type to search or press Enter to add custom tools'
                      : 'At least one of AI Tools or Accelerators is required. Type to search or press Enter to add custom tools'
                  }
                />
                <CommonAutocomplete
                  value={formData.acceleratorsUsed}
                  onChange={(value: string | string[]) =>
                    handleFormChange('acceleratorsUsed', value)
                  }
                  disabled={!applicable || noAIAdoption}
                  required={
                    needsAIToolsOrAccelerators && !hasAIToolsOrAccelerators
                  }
                  label="Accelerators Used"
                  placeholder="Search or type accelerator name"
                  multiple={true}
                  options={COMMON_ACCELERATORS}
                  helperText={
                    needsAIToolsOrAccelerators && !hasAIToolsOrAccelerators
                      ? 'At least one of AI Tools or Accelerators is required. Type to search or press Enter to add custom accelerators'
                      : 'At least one of AI Tools or Accelerators is required. Type to search or press Enter to add custom accelerators'
                  }
                />
              </Box>
            </Box>

            {/* Qualitative Benefits */}
            <Box sx={modalStyles.fullWidthSection}>
              <QualitativeBenefitsField
                value={formData.qualitativeBenefits}
                onChange={handleQualitativeBenefitsChange}
                disabled={!applicable || noAIAdoption}
              />
            </Box>

            {/* Comments */}
            <Box sx={modalStyles.fullWidthSection}>
              <TextAreaField
                label="Comments"
                value={formData.comments}
                onChange={(value) => handleFormChange('comments', value)}
                disabled={false}
                placeholder="Enter additional comments or notes"
                rows={4}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={modalStyles.dialogActions}>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={
              (!isPhaseNA && !isFormValid(formData)) ||
              (!!editingActivity && !hasFormChanges(formData, originalFormData))
            }
            sx={modalStyles.primaryButton}
          >
            {editingActivity ? 'Update' : 'Save'}
          </Button>

          {!editingActivity && (
            <Button
              onClick={handleSaveAndAddNew}
              variant="outlined"
              disabled={!isPhaseNA && !isFormValid(formData)}
              sx={modalStyles.secondaryButton}
            >
              Save and Add New
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* AI Adoption Guidelines Modal */}
      <AIAdoptionGuidelinesModal
        open={guidelinesModalOpen}
        onClose={() => setGuidelinesModalOpen(false)}
      />

      {/* Applicability Guidelines Modal */}
      <ApplicabilityGuidelinesModal
        open={applicabilityGuidelinesModalOpen}
        onClose={() => setApplicabilityGuidelinesModalOpen(false)}
      />
    </>
  );
};
