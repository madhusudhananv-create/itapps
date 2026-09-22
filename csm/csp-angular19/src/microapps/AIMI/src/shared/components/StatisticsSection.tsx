import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { SummaryStatisticsCard } from './SummaryStatisticsCard';
import {
  AccessTime,
  MonetizationOn,
  Psychology,
  Speed,
} from '@mui/icons-material';
import type { SummaryStatistics } from '../types/dashboardTypes';

interface StatisticsSectionProps {
  summaryStats: SummaryStatistics;
  isLoading?: boolean;
  title?: string;
  showLoading?: boolean;
}

const styles = {
  sectionContainer: {
    mb: 4,
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
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyState: {
    textAlign: 'center',
    py: 4,
    color: '#666',
  },
};

export const StatisticsSection: React.FC<StatisticsSectionProps> = ({
  summaryStats,
  isLoading = false,
  title = 'Summary Statistics',
  showLoading = true,
}) => {
  const summaryCards = [
    {
      title: 'Overall AI Adoption Score',
      value: summaryStats.overallAIAdoptionScore,
      icon: <Psychology />,
      color: '#1976d2',
      subtitle: 'Average score across all activities',
    },
    {
      title: 'Overall % Work Done by AI',
      value: summaryStats.overallWorkDoneByAI,
      icon: <Speed />,
      color: '#2e7d32',
      subtitle: 'Average percentage across all activities',
    },
    {
      title: 'Total Hours Saved',
      value: summaryStats.totalHoursSaved,
      icon: <AccessTime />,
      color: '#ed6c02',
    },
    {
      title: 'Revenue Generating Activities',
      value: summaryStats.revenueGenerated,
      icon: <MonetizationOn />,
      color: '#9c27b0',
    },
  ];

  if (isLoading && showLoading) {
    return (
      <Box sx={styles.sectionContainer}>
        <Typography variant="h5" sx={styles.sectionTitle}>
          {title}
        </Typography>
        <Box sx={styles.loadingContainer}>
          <CircularProgress size={40} />
        </Box>
      </Box>
    );
  }

  if (summaryStats.totalActivities === 0) {
    return (
      <Box sx={styles.sectionContainer}>
        <Typography variant="h5" sx={styles.sectionTitle}>
          {title}
        </Typography>
        <Box sx={styles.emptyState}>
          <Typography variant="body1">
            No activities data available. Add some activities to see statistics.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.sectionContainer}>
      <Typography variant="h5" sx={styles.sectionTitle}>
        {title}
      </Typography>
      <Box sx={styles.summaryGrid}>
        {summaryCards.map((card, index) => (
          <Box key={`${index}-${card.title}`}>
            <SummaryStatisticsCard {...card} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
