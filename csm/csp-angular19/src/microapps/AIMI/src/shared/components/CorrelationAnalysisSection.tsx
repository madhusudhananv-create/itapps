import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Analytics } from '@mui/icons-material';
import { CorrelationCard } from './CorrelationCard';
import type { CorrelationData } from '../types/dashboardTypes';

interface CorrelationAnalysisSectionProps {
  correlations: CorrelationData[];
  isLoading?: boolean;
  title?: string;
}

const styles = {
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

export const CorrelationAnalysisSection: React.FC<
  CorrelationAnalysisSectionProps
> = ({ correlations, isLoading = false, title = 'Statistical Analysis' }) => {
  if (isLoading) {
    return (
      <Box sx={styles.analysisSection}>
        <Box sx={styles.analysisHeader}>
          <Analytics sx={styles.analysisIcon} />
          <Typography variant="h5" sx={styles.analysisTitle}>
            {title}
          </Typography>
        </Box>
        <Box sx={styles.loadingContainer}>
          <Typography variant="body1" color="text.secondary">
            Loading correlations...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (correlations.length === 0) {
    return (
      <Box sx={styles.analysisSection}>
        <Box sx={styles.analysisHeader}>
          <Analytics sx={styles.analysisIcon} />
          <Typography variant="h5" sx={styles.analysisTitle}>
            {title}
          </Typography>
        </Box>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No correlation data available. Add some activities to see statistical
          analysis.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={styles.analysisSection}>
      <Box sx={styles.analysisHeader}>
        <Analytics sx={styles.analysisIcon} />
        <Typography variant="h5" sx={styles.analysisTitle}>
          {title}
        </Typography>
      </Box>
      <Box sx={styles.correlationGrid}>
        {correlations.map((correlation, index) => (
          <Box key={`${index}-${correlation.label}`}>
            <CorrelationCard correlation={correlation} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
