import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  AI_ADOPTION_SCORES,
  APPLICABILITY_OPTIONS,
} from '../types/activityTypes';
import type { ActivityData } from '../types/activityTypes';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import {
  activityCardStyles,
  typographyStyles,
  layoutStyles,
  chipStyles,
} from '../styles/activityCardStyles';
import { useFeatureFlags } from '../../../shared/hooks/useFeatureFlags';

interface ActivityCardProps {
  activity: ActivityData;
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

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onDelete,
  isUnsaved = false,
}) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const featureFlags = useFeatureFlags('activities');

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

  const applicabilityColor = useMemo<'success' | 'warning' | 'default'>(() => {
    if (isApplicable) {
      return 'success';
    }
    if (isNotApplicable) {
      return 'warning';
    }
    return 'default';
  }, [isApplicable, isNotApplicable]);

  const handleViewDetails = () => {
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
  };

  return (
    <>
      <Card sx={activityCardStyles.card}>
        {activity.status === 'draft' && (
          <Chip
            label="Draft"
            color="info"
            size="small"
            sx={activityCardStyles.draftChip}
          />
        )}
        {isUnsaved && (
          <Chip
            label="Unsaved"
            color="warning"
            size="small"
            sx={activityCardStyles.unsavedChip}
          />
        )}
        <CardContent sx={activityCardStyles.cardContent}>
          {/* Header */}
          <Box sx={activityCardStyles.header}>
            <Typography
              variant="body1"
              component="div"
              sx={typographyStyles.title}
            >
              {activity.activity}
            </Typography>
            <Typography variant="caption" sx={typographyStyles.caption}>
              Added on {formatDate(activity.createdAt)}
            </Typography>
          </Box>

          <Divider sx={layoutStyles.divider} />

          {/* Important Fields Grid */}
          <Box sx={activityCardStyles.fieldsGrid}>
            {/* Applicability */}
            <Box>
              <Typography variant="caption" sx={typographyStyles.fieldLabel}>
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

            {/* AI Adoption Score - Show for all applicable activities */}
            {isApplicable && (
              <Box>
                <Typography variant="caption" sx={typographyStyles.fieldLabel}>
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

            {/* % Work Done by AI - Only show if applicable and AI Adoption score is not 0 */}
            {isApplicable && !isNoAIAdoption && (
              <Box>
                <Typography variant="caption" sx={typographyStyles.fieldLabel}>
                  % Work Done by AI
                </Typography>
                <Typography variant="body1" sx={typographyStyles.fieldValue}>
                  {activity.workDoneByAI}%
                </Typography>
              </Box>
            )}

            {/* Hours Saved - Only show if applicable and AI Adoption score is not 0 */}
            {isApplicable && !isNoAIAdoption && (
              <Box>
                <Typography variant="caption" sx={typographyStyles.fieldLabel}>
                  Hours Saved
                </Typography>
                <Typography variant="body1" sx={typographyStyles.fieldValue}>
                  {activity.hoursSaved} hours
                </Typography>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={activityCardStyles.actionButtonsContainer}>
            <Tooltip title="View Details">
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={handleViewDetails}
                sx={activityCardStyles.viewButton}
              >
                View Details
              </Button>
            </Tooltip>
            {onEdit && (
              <Tooltip title="Edit Activity">
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEdit(activity)}
                  sx={activityCardStyles.editButton}
                >
                  Edit
                </Button>
              </Tooltip>
            )}
            {onDelete && featureFlags.showDeleteButton && (
              <Tooltip title="Delete Activity">
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => onDelete(activity)}
                  sx={activityCardStyles.deleteButton}
                >
                  Delete
                </Button>
              </Tooltip>
            )}
          </Box>

          {/* Not Applicable Message */}
          {isNotApplicable && (
            <Box sx={activityCardStyles.notApplicableMessage}>
              <Typography
                variant="body2"
                sx={activityCardStyles.notApplicableText}
              >
                This activity is not applicable for this project.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        activity={activity}
        onEdit={onEdit}
        onDelete={featureFlags.showDeleteButton ? onDelete : undefined}
        isUnsaved={isUnsaved}
      />
    </>
  );
};
