import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';
import type { CorrelationData } from '../types/dashboardTypes';

interface CorrelationCardProps {
  correlation: CorrelationData;
}

// Global styling object
const styles = {
  card: {
    height: '100%',
    background: 'white',
    border: '1px solid #e0e0e0',
    borderRadius: 3,
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
  },
  cardContent: {
    p: 3,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  iconContainer: (color: string) => ({
    p: 1,
    borderRadius: '50%',
    backgroundColor: `${color}15`,
    color: color,
    mb: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  label: {
    fontWeight: 500,
    color: '#333',
    mb: 1,
    fontSize: '0.875rem',
  },
  value: (color: string) => ({
    fontWeight: 700,
    color: color,
    mb: 1.5,
  }),
  progress: (color: string) => ({
    height: 6,
    borderRadius: 3,
    backgroundColor: `${color}15`,
    width: '100%',
    mb: 1.5,
    '& .MuiLinearProgress-bar': {
      backgroundColor: color,
      borderRadius: 3,
    },
  }),
  description: {
    color: '#666',
    fontStyle: 'italic',
    fontSize: '0.75rem',
  },
};

const CorrelationCard = ({ correlation }: CorrelationCardProps) => {
  const getCorrelationColor = (correlation: number) => {
    if (correlation > 0.7) return '#2e7d32'; // Strong positive - green
    if (correlation > 0.4) return '#1976d2'; // Moderate positive - blue
    if (correlation > 0.2) return '#ed6c02'; // Weak positive - orange
    if (correlation > -0.2) return '#757575'; // No correlation - gray
    if (correlation > -0.4) return '#ed6c02'; // Weak negative - orange
    if (correlation > -0.7) return '#1976d2'; // Moderate negative - blue
    return '#d32f2f'; // Strong negative - red
  };

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.2) return <TrendingUp />;
    if (correlation < -0.2) return <TrendingDown />;
    return <Remove />;
  };

  const color = getCorrelationColor(correlation.correlation);
  const icon = getCorrelationIcon(correlation.correlation);

  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Box sx={styles.container}>
          <Box sx={styles.iconContainer(color)}>{icon}</Box>
          <Typography variant="body1" sx={styles.label}>
            {correlation.label}
          </Typography>

          <Typography variant="h4" sx={styles.value(color)}>
            {correlation.correlation.toFixed(2)}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={Math.abs(correlation.correlation) * 100}
            sx={styles.progress(color)}
          />

          <Typography variant="body2" sx={styles.description}>
            {correlation.description}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export { CorrelationCard };
