import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import {
  AI_ADOPTION_SCORES,
  REVENUE_GENERATED_OPTIONS,
  BENEFIT_TO_OPTIONS,
  APPLICABILITY_OPTIONS,
  COMMON_AI_TOOLS,
  COMMON_ACCELERATORS,
} from '../types/activityTypes';
import type { ActivityData } from '../types/activityTypes';
import {
  activityDetailsModalStyles,
  typographyStyles,
  layoutStyles,
  chipStyles,
} from '../styles/activityCardStyles';

interface ActivityDetailsModalProps {
  open: boolean;
  onClose: () => void;
  activity: ActivityData | null;
  onEdit?: (activity: ActivityData) => void;
  onDelete?: (activity: ActivityData) => void;
  isUnsaved?: boolean;
}

const getLabelFromValue = (
  value: string,
  options: Array<{ value: string; label: string }>
): string => {
  const option = options.find((opt) => opt.value === value);
  return option ? option.label : value;
};

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  open,
  onClose,
  activity,
  onEdit,
  onDelete,
  isUnsaved = false,
}) => {
  if (!activity) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if activity is applicable
  const isApplicable = activity.applicability === 'Yes';
  const isNotApplicable =
    activity.applicability === 'No' ||
    activity.applicability === 'Activity NA' ||
    activity.applicability === 'Customer NA';

  // Check if AI Adoption score is 0 (No AI Adoption)
  const isNoAIAdoption = activity.aiAdoptionScore === '0';

  // Get AI Adoption Score info
  const aiAdoptionScore = AI_ADOPTION_SCORES.find(
    (score) => score.value === activity.aiAdoptionScore
  );

  let applicabilityColor: 'success' | 'warning' | 'default' = 'default';

  if (isApplicable) {
    applicabilityColor = 'success';
  }
  if (isNotApplicable) {
    applicabilityColor = 'warning';
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={activityDetailsModalStyles.drawer}
    >
      <Box sx={activityDetailsModalStyles.header}>
        <Box sx={activityDetailsModalStyles.headerTitleContainer}>
          <Typography variant="h6" component="div" sx={typographyStyles.title}>
            Activity Details
          </Typography>
          {isUnsaved && (
            <Chip
              label="Unsaved"
              color="warning"
              size="small"
              sx={chipStyles.unsaved}
            />
          )}
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={activityDetailsModalStyles.content}>
        {/* Activity Name */}
        <Box sx={activityDetailsModalStyles.section}>
          <Typography
            variant="body1"
            component="div"
            sx={activityDetailsModalStyles.activityTitle}
          >
            {activity.activity}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Added on {formatDate(activity.createdAt)}
          </Typography>
        </Box>

        <Divider sx={activityDetailsModalStyles.divider} />

        {/* Basic Information */}
        <Box sx={activityDetailsModalStyles.section}>
          <Typography variant="h6" sx={activityDetailsModalStyles.sectionTitle}>
            Basic Information
          </Typography>

          <Box sx={activityDetailsModalStyles.field}>
            <Typography sx={activityDetailsModalStyles.fieldLabel}>
              SDLC Phase / Services
            </Typography>
            <Typography sx={activityDetailsModalStyles.fieldValue}>
              {activity.sdlcPhase}
            </Typography>
          </Box>

          <Box sx={activityDetailsModalStyles.field}>
            <Typography sx={activityDetailsModalStyles.fieldLabel}>
              Applicability
            </Typography>
            <Chip
              label={getLabelFromValue(
                activity.applicability,
                APPLICABILITY_OPTIONS
              )}
              color={applicabilityColor}
              size="small"
              sx={chipStyles.applicability}
            />
          </Box>

          {isApplicable && (
            <Box sx={activityDetailsModalStyles.field}>
              <Typography sx={activityDetailsModalStyles.fieldLabel}>
                AI Adoption Score
              </Typography>
              <Box sx={layoutStyles.aiScoreContainer}>
                <Chip
                  label={aiAdoptionScore?.value ?? activity.aiAdoptionScore}
                  size="small"
                  sx={chipStyles.aiScore(activity.aiAdoptionScore)}
                />
                <Typography variant="body2" sx={chipStyles.aiScoreLabel}>
                  {aiAdoptionScore?.label ?? activity.aiAdoptionScore}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Activity Details - Only show if applicable and AI Adoption score is not 0 */}
        {isApplicable && !isNoAIAdoption && (
          <>
            <Divider sx={activityDetailsModalStyles.divider} />

            <Box sx={activityDetailsModalStyles.section}>
              <Typography
                variant="h6"
                sx={activityDetailsModalStyles.sectionTitle}
              >
                Implementation Details
              </Typography>

              <Box sx={activityDetailsModalStyles.detailsGrid}>
                {/* AI Tool Used */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    AI Tools Used
                  </Typography>
                  {Array.isArray(activity.aiToolUsed) ? (
                    <Box sx={layoutStyles.chipsContainer}>
                      {activity.aiToolUsed.map((tool, index) => (
                        <Chip
                          key={`${index}-${tool}`}
                          label={tool}
                          size="small"
                          color={
                            COMMON_AI_TOOLS.includes(tool)
                              ? 'default'
                              : 'primary'
                          }
                          variant={
                            COMMON_AI_TOOLS.includes(tool)
                              ? 'filled'
                              : 'outlined'
                          }
                          sx={chipStyles.small}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={activityDetailsModalStyles.fieldValue}>
                      {activity.aiToolUsed}
                    </Typography>
                  )}
                </Box>

                {/* Accelerators Used */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    Accelerators Used
                  </Typography>
                  {Array.isArray(activity.acceleratorsUsed) ? (
                    <Box sx={layoutStyles.chipsContainer}>
                      {activity.acceleratorsUsed.map((accelerator, index) => (
                        <Chip
                          key={`${index}-${accelerator}`}
                          label={accelerator}
                          size="small"
                          color={
                            COMMON_ACCELERATORS.includes(accelerator)
                              ? 'default'
                              : 'primary'
                          }
                          variant={
                            COMMON_ACCELERATORS.includes(accelerator)
                              ? 'filled'
                              : 'outlined'
                          }
                          sx={chipStyles.small}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography sx={activityDetailsModalStyles.fieldValue}>
                      {activity.acceleratorsUsed}
                    </Typography>
                  )}
                </Box>

                {/* % Work Done by AI */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    % Work Done by AI
                  </Typography>
                  <Typography sx={activityDetailsModalStyles.fieldValue}>
                    {activity.workDoneByAI}%
                  </Typography>
                </Box>

                {/* Hours Saved */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    Hours Saved
                  </Typography>
                  <Typography sx={activityDetailsModalStyles.fieldValue}>
                    {activity.hoursSaved} hours
                  </Typography>
                </Box>

                {/* Revenue Generated */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    Revenue Generated
                  </Typography>
                  <Typography sx={activityDetailsModalStyles.fieldValue}>
                    {getLabelFromValue(
                      activity.revenueGenerated,
                      REVENUE_GENERATED_OPTIONS
                    )}
                  </Typography>
                </Box>

                {/* Benefit To */}
                <Box sx={activityDetailsModalStyles.field}>
                  <Typography sx={activityDetailsModalStyles.fieldLabel}>
                    Benefit To
                  </Typography>
                  <Typography sx={activityDetailsModalStyles.fieldValue}>
                    {getLabelFromValue(activity.benefitTo, BENEFIT_TO_OPTIONS)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Qualitative Benefits */}
            <Box sx={activityDetailsModalStyles.section}>
              <Typography
                variant="h6"
                sx={activityDetailsModalStyles.sectionTitle}
              >
                Qualitative Benefits
              </Typography>
              <Box sx={layoutStyles.chipsContainer}>
                {activity.qualitativeBenefits.map((benefit) => (
                  <Chip
                    key={benefit}
                    label={benefit}
                    size="small"
                    variant="outlined"
                    sx={chipStyles.qualitative}
                  />
                ))}
              </Box>
            </Box>

            {/* Comments */}
            {activity.comments && (
              <Box sx={activityDetailsModalStyles.section}>
                <Typography
                  variant="h6"
                  sx={activityDetailsModalStyles.sectionTitle}
                >
                  Comments
                </Typography>
                <Typography
                  variant="body1"
                  sx={activityDetailsModalStyles.commentsText}
                >
                  {activity.comments}
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Not Applicable Message */}
        {isNotApplicable && (
          <Box sx={activityDetailsModalStyles.section}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={activityDetailsModalStyles.notApplicableText}
            >
              This activity is not applicable for this project.
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        {(onEdit || onDelete) && (
          <Box sx={activityDetailsModalStyles.actionButtons}>
            {onEdit && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => onEdit(activity)}
                sx={activityDetailsModalStyles.editButton}
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(activity)}
                sx={activityDetailsModalStyles.deleteButton}
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
