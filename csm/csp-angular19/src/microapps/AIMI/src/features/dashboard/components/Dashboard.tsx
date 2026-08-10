import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
} from '@mui/material';
import { Circle, Refresh } from '@mui/icons-material';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatisticsSection } from '@shared/components/StatisticsSection';
import { CorrelationAnalysisSection } from '@shared/components/CorrelationAnalysisSection';
import { AIToolsAnalysis } from './AIToolsAnalysis';
import { QualitativeBenefitsAnalysis } from './QualitativeBenefitsAnalysis';
import { CorrelationInsights } from './CorrelationInsights';
import { useFeatureFlags } from '@shared/hooks/useFeatureFlags';

// Global styling object
const styles = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  headerContainer: {
    mb: 4,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2,
    position: 'relative',
  },
  headerTitle: {
    fontWeight: 700,
    color: '#333',
    fontSize: '1.5rem',
  },
  headerDescription: {
    color: '#666',
  },
  refreshButton: {
    position: 'absolute',
    right: '0px',
    borderRadius: 1.5,
    textTransform: 'none',
    fontWeight: 500,
    px: 2,
    py: 1,
    fontSize: '0.875rem',
    color: '#1976d2',
    '&:hover': {
      color: '#1565c0',
    },
  },
  sectionContainer: {
    mb: 6,
  },
  sectionTitle: {
    fontWeight: 600,
    mb: 3,
    color: '#333',
    fontSize: '1.1rem',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: {
      xs: '1fr',
      sm: 'repeat(2, 1fr)',
      md: 'repeat(4, 1fr)',
    },
    gap: 3,
  },
  analysisSection: {
    mb: 4,
  },
  analysisHeader: {
    display: 'flex',
    alignItems: 'center',
    mb: 3,
  },
  analysisIcon: {
    mr: 2,
    color: 'primary.main',
  },
  analysisTitle: {
    fontWeight: 600,
    color: '#333',
    fontSize: '1.1rem',
  },
  correlationGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 3,
  },
  insightsPaper: {
    p: 4,
    borderRadius: 3,
    background: 'white',
    border: '1px solid #e0e0e0',
  },
  insightsTitle: {
    fontWeight: 600,
    mb: 2,
    color: '#333',
    fontSize: '1.1rem',
  },
  insightsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 2,
  },
  insightText: {
    color: '#666',
    mb: 1,
  },
  insightTextLast: {
    color: '#666',
  },
  circleIcon: {
    fontSize: '0.5rem',
  },
};

const Dashboard = () => {
  const {
    summaryStats,
    correlations,
    aiToolMetrics,
    sdlcPhaseTools,
    qualitativeBenefits,
    correlationInsights,
    isLoading,
    refreshData,
  } = useDashboardData();

  const dashboardFlags = useFeatureFlags('dashboard');

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Dashboard Header */}
      <Box sx={styles.headerContainer}>
        <Box sx={styles.headerContent}>
          <Typography variant="body1" sx={styles.headerTitle}>
            Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={refreshData}
            sx={styles.refreshButton}
          >
            Refresh Data
          </Button>
        </Box>
        <Typography variant="body1" sx={styles.headerDescription}>
          Statistical analysis and insights from your AI maturity activities
        </Typography>
      </Box>

      {/* Summary Statistics */}
      <StatisticsSection
        summaryStats={summaryStats}
        isLoading={isLoading}
        title="Summary Statistics"
        showLoading={false}
      />

      {/* Statistical Analysis */}
      {dashboardFlags.showCorrelationAnalysis && (
        <CorrelationAnalysisSection
          correlations={correlations}
          isLoading={isLoading}
          title="Statistical Analysis"
        />
      )}

      {/* AI Tools Analysis */}
      {summaryStats.totalActivities > 0 && (
        <AIToolsAnalysis
          aiToolMetrics={aiToolMetrics}
          sdlcPhaseTools={sdlcPhaseTools}
        />
      )}

      {/* Qualitative Benefits Analysis */}
      {summaryStats.totalActivities > 0 && (
        <QualitativeBenefitsAnalysis
          qualitativeBenefits={qualitativeBenefits}
        />
      )}

      {/* Correlation Insights */}
      {summaryStats.totalActivities > 0 && (
        <CorrelationInsights correlationInsights={correlationInsights} />
      )}

      {/* Additional Insights */}
      {summaryStats.totalActivities > 0 && (
        <Paper sx={styles.insightsPaper}>
          <Typography variant="h6" sx={styles.insightsTitle}>
            Key Insights
          </Typography>
          <Box sx={styles.insightsGrid}>
            <Box>
              <Typography variant="body2" sx={styles.insightText}>
                <Circle style={styles.circleIcon} />{' '}
                {`Average hours saved per activity:
                ${
                  summaryStats.totalActivities > 0
                    ? (
                        summaryStats.totalHoursSaved /
                        summaryStats.totalActivities
                      ).toFixed(1)
                    : 0
                } hours`}
              </Typography>
              <Typography variant="body2" sx={styles.insightText}>
                <Circle style={styles.circleIcon} /> Revenue generation rate:{' '}
                {summaryStats.totalActivities > 0
                  ? (
                      (summaryStats.revenueGenerated /
                        summaryStats.totalActivities) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={styles.insightText}>
                <Circle style={styles.circleIcon} /> High adoption rate:{' '}
                {summaryStats.totalActivities > 0
                  ? (
                      (summaryStats.highAdoption /
                        summaryStats.totalActivities) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </Typography>
              <Typography variant="body2" sx={styles.insightTextLast}>
                <Circle style={styles.circleIcon} /> Total efficiency gain:{' '}
                {summaryStats.totalHoursSaved} hours saved across all activities
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export { Dashboard };
