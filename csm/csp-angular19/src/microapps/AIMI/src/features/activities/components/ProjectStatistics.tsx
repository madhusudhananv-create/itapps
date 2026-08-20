import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useProjectStatistics } from '../hooks/useProjectStatistics';
import { StatisticsSection } from '../../../shared/components/StatisticsSection';
import { CorrelationAnalysisSection } from '../../../shared/components/CorrelationAnalysisSection';
import { AIToolsAnalysis } from '../../dashboard/components/AIToolsAnalysis';
import { QualitativeBenefitsAnalysis } from '../../dashboard/components/QualitativeBenefitsAnalysis';
import { CorrelationInsights } from '../../dashboard/components/CorrelationInsights';
import { useFeatureFlags } from '../../../shared/hooks/useFeatureFlags';
import type { ActivityData } from '../types/activityTypes';

interface ProjectStatisticsProps {
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
    headcount?: number;
    peopleUsingAI?: number;
  };
  activities?: ActivityData[];
}

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
  headerDescription: {
    color: '#666',
    fontSize: '1rem',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyState: {
    textAlign: 'center',
    py: 4,
    color: '#666',
  },
  placeholderCard: {
    height: 300,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: '#f8f9fa',
    border: '1px dashed #dee2e6',
    borderRadius: 2,
  },
  placeholderIcon: {
    fontSize: 48,
    color: '#6c757d',
    mb: 2,
  },
  placeholderTitle: {
    color: '#6c757d',
    textAlign: 'center',
    maxWidth: 400,
    mb: 1,
  },
  placeholderDescription: {
    color: '#6c757d',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 1.5,
  },
  infoAlert: {
    borderRadius: 2,
  },
};

export const ProjectStatistics: React.FC<ProjectStatisticsProps> = ({
  projectInfo,
  activities = [],
}) => {
  const {
    projectStats,
    correlations,
    aiToolMetrics,
    sdlcPhaseTools,
    qualitativeBenefits,
    correlationInsights,
    projectActivities,
    isLoading,
  } = useProjectStatistics(projectInfo, activities);

  const activitiesFlags = useFeatureFlags('activities');

  if (isLoading) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="body1" sx={styles.headerDescription}>
            Comprehensive analytics and insights for{' '}
            {projectInfo?.project ?? 'your project'}
          </Typography>
        </Box>
        <Box sx={styles.loadingContainer}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (!projectInfo || projectActivities.length === 0) {
    return (
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="body1" sx={styles.headerDescription}>
            Comprehensive analytics and insights for{' '}
            {projectInfo?.project ?? 'your project'}
          </Typography>
        </Box>
        <Box sx={styles.emptyState}>
          <Alert severity="info" sx={styles.infoAlert}>
            No project activities found. Add activities to this project to see
            detailed statistics.
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      {/* Header */}
      <Box sx={styles.header}>
        <Typography variant="body1" sx={styles.headerDescription}>
          Comprehensive analytics and insights for{' '}
          {projectInfo?.project ?? 'your project'}
        </Typography>
      </Box>

      {/* Summary Statistics */}
      <StatisticsSection
        summaryStats={projectStats}
        isLoading={isLoading}
        title="Project Summary Statistics"
        showLoading={false}
      />

      {/* Correlation Analysis */}
      {activitiesFlags.showCorrelationAnalysis && (
        <CorrelationAnalysisSection
          correlations={correlations}
          isLoading={isLoading}
          title="Project Correlation Analysis"
        />
      )}

      {/* AI Tools Analysis */}
      {projectStats.totalActivities > 0 && (
        <AIToolsAnalysis
          aiToolMetrics={aiToolMetrics}
          sdlcPhaseTools={sdlcPhaseTools}
        />
      )}

      {/* Qualitative Benefits Analysis */}
      {projectStats.totalActivities > 0 && (
        <QualitativeBenefitsAnalysis
          qualitativeBenefits={qualitativeBenefits}
        />
      )}

      {/* Correlation Insights */}
      {projectStats.totalActivities > 0 && (
        <CorrelationInsights correlationInsights={correlationInsights} />
      )}
    </Box>
  );
};
