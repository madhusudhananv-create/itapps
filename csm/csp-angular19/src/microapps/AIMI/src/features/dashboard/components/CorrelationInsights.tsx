import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
import { Star } from '@mui/icons-material';
import type { CorrelationInsights as CorrelationInsightsType } from '../../../shared/types/dashboardTypes';

interface CorrelationInsightsProps {
  correlationInsights: CorrelationInsightsType;
}

// Global styling object
const styles = {
  container: {
    mb: 4,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    mb: 3,
  },
  headerIcon: {
    mr: 2,
    color: 'primary.main',
  },
  headerTitle: {
    fontWeight: 600,
    color: '#333',
    fontSize: '1.1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 3,
  },
  card: {
    background: 'white',
    border: '1px solid #e0e0e0',
  },
  cardTitle: {
    fontWeight: 600,
    mb: 2,
    color: '#333',
    fontSize: '1rem',
  },
  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLabel: {
    fontWeight: 500,
  },
  hoursChip: {
    backgroundColor: '#4caf50',
    color: 'white',
    fontWeight: 600,
  },
  revenueChip: {
    backgroundColor: '#ff9800',
    color: 'white',
    fontWeight: 600,
  },
  benefitChip: {
    backgroundColor: '#9c27b0',
    color: 'white',
    fontWeight: 600,
  },
  dualChipsContainer: {
    display: 'flex',
    gap: 1,
  },
  toolNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
};

export const CorrelationInsights = ({
  correlationInsights,
}: CorrelationInsightsProps) => {
  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Star sx={styles.headerIcon} />
        <Typography variant="h5" sx={styles.headerTitle}>
          Correlation Insights
        </Typography>
      </Box>

      <Box sx={styles.grid}>
        {/* Hours Saved Leaders */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.cardTitle}>
              Hours Saved Leaders
            </Typography>
            <Box sx={styles.listContainer}>
              {correlationInsights.hoursSavedLeaders.map((tool, index) => (
                <Box key={tool.toolName} sx={styles.listItem}>
                  <Box sx={styles.toolNameContainer}>
                    <Typography variant="body2" sx={styles.itemLabel}>
                      {index + 1}. {tool.toolName}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${tool.hoursSaved}h`}
                    size="small"
                    sx={styles.hoursChip}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Revenue Generation Leaders */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.cardTitle}>
              Revenue Generation Leaders
            </Typography>
            <Box sx={styles.listContainer}>
              {correlationInsights.revenueGenerationLeaders.map(
                (tool, index) => (
                  <Box key={tool.toolName} sx={styles.listItem}>
                    <Box sx={styles.toolNameContainer}>
                      <Typography variant="body2" sx={styles.itemLabel}>
                        {index + 1}. {tool.toolName}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${tool.revenueActivities} activities`}
                      size="small"
                      sx={styles.revenueChip}
                    />
                  </Box>
                )
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Most Beneficial to Both */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.cardTitle}>
              Most Beneficial to Both (Hours Saved & Revenue Generation)
            </Typography>
            <Box sx={styles.listContainer}>
              {correlationInsights.mostBeneficialToBoth.map((tool, index) => (
                <Box key={tool.toolName} sx={styles.listItem}>
                  <Box sx={styles.toolNameContainer}>
                    <Typography variant="body2" sx={styles.itemLabel}>
                      {index + 1}. {tool.toolName}
                    </Typography>
                  </Box>
                  <Box sx={styles.dualChipsContainer}>
                    <Chip
                      label={`${tool.hoursSaved}h`}
                      size="small"
                      sx={styles.hoursChip}
                    />
                    <Chip
                      label={`${tool.revenueActivities} rev`}
                      size="small"
                      sx={styles.revenueChip}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Most Impactful Benefits */}
        <Card sx={styles.card}>
          <CardContent>
            <Typography variant="h6" sx={styles.cardTitle}>
              Most Impactful Qualitative Benefits
            </Typography>
            <Box sx={styles.listContainer}>
              {correlationInsights.mostImpactfulBenefits.map(
                (benefit, index) => (
                  <Box key={benefit.benefit} sx={styles.listItem}>
                    <Box sx={styles.toolNameContainer}>
                      <Typography variant="body2" sx={styles.itemLabel}>
                        {index + 1}. {benefit.benefit}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${benefit.frequency} activity`}
                      size="small"
                      sx={styles.benefitChip}
                    />
                  </Box>
                )
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};
