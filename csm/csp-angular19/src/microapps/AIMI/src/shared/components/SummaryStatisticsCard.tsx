import { Box, Card, CardContent, Typography } from '@mui/material';

interface SummaryStatisticsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
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
  title: {
    fontWeight: 500,
    color: '#333',
    mb: 1,
    fontSize: '0.875rem',
  },
  value: (color: string, hasSubtitle: boolean) => ({
    fontWeight: 700,
    color: color,
    mb: hasSubtitle ? 0.5 : 0,
  }),
  subtitle: {
    color: '#666',
    fontSize: '0.75rem',
  },
};

const SummaryStatisticsCard = ({
  title,
  value,
  icon,
  color,
  subtitle,
}: SummaryStatisticsCardProps) => {
  return (
    <Card sx={styles.card}>
      <CardContent sx={styles.cardContent}>
        <Box sx={styles.container}>
          <Box sx={styles.iconContainer(color)}>{icon}</Box>
          <Typography variant="body1" sx={styles.title}>
            {title}
          </Typography>
          <Typography variant="h4" sx={styles.value(color, !!subtitle)}>
            {value.toLocaleString()}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={styles.subtitle}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export { SummaryStatisticsCard };
