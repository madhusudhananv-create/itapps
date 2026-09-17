import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import { Psychology } from '@mui/icons-material';
import type {
  AIToolMetrics,
  SDLCPhaseAITools,
} from '../../../shared/types/dashboardTypes';

interface AIToolsAnalysisProps {
  aiToolMetrics: AIToolMetrics[];
  sdlcPhaseTools: SDLCPhaseAITools[];
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
  card: {
    background: 'white',
    border: '1px solid #e0e0e0',
  },
  beneficialToolCard: {
    mb: 3,
    background: 'white',
    border: '1px solid #e0e0e0',
  },
  metricsCard: {
    mb: 3,
    background: 'white',
    border: '1px solid #e0e0e0',
  },
  cardTitle: {
    fontWeight: 600,
    mb: 2,
    color: '#333',
    fontSize: '1rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
    gap: 2,
  },
  metricLabel: {
    color: '#666',
  },
  metricValue: {
    fontWeight: 700,
    color: '#4caf50',
  },
  tableContainer: {
    boxShadow: 'none',
  },
  tableHeaderCell: {
    fontWeight: 600,
  },
  tableBodyCell: {
    fontWeight: 500,
  },
  sdlcGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 2,
  },
  phaseBox: {
    p: 2,
    border: '1px solid #e0e0e0',
    borderRadius: 2,
  },
  phaseTitle: {
    fontWeight: 600,
    mb: 1,
    color: '#333',
    fontSize: '1rem',
  },
  toolsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
  },
  toolChip: {
    backgroundColor: 'primary.main',
    color: 'white',
    '&:hover': { backgroundColor: 'primary.dark' },
  },
  noToolsText: {
    color: '#666',
    fontStyle: 'italic',
  },
};

const AIToolsAnalysis = ({
  aiToolMetrics,
  sdlcPhaseTools,
}: AIToolsAnalysisProps) => {
  const mostBeneficialTool = aiToolMetrics[0];

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Psychology sx={styles.headerIcon} />
        <Typography variant="h5" sx={styles.headerTitle}>
          AI Tools Analysis
        </Typography>
      </Box>

      {/* Most Beneficial AI Tool */}
      {mostBeneficialTool && (
        <Card sx={styles.beneficialToolCard}>
          <CardContent>
            <Typography variant="h6" sx={styles.cardTitle}>
              Most Beneficial AI Tool: {mostBeneficialTool.toolName}
            </Typography>
            <Box sx={styles.metricsGrid}>
              <Box>
                <Typography variant="body2" sx={styles.metricLabel}>
                  Hours Saved
                </Typography>
                <Typography variant="h6" sx={styles.metricValue}>
                  {mostBeneficialTool.hoursSaved}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={styles.metricLabel}>
                  Activities
                </Typography>
                <Typography variant="h6" sx={styles.metricValue}>
                  {mostBeneficialTool.activitiesCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={styles.metricLabel}>
                  Avg Work Done
                </Typography>
                <Typography variant="h6" sx={styles.metricValue}>
                  {mostBeneficialTool.averageWorkDone}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* AI Tools Metrics Table */}
      <Card sx={styles.metricsCard}>
        <CardContent>
          <Typography variant="h6" sx={styles.cardTitle}>
            Individual AI Tool Metrics
          </Typography>
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeaderCell}>AI Tool</TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Activities
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Hours Saved
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Revenue Activities
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Avg Work Done
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {aiToolMetrics.map((tool) => (
                  <TableRow key={tool.toolName} hover>
                    <TableCell sx={styles.tableBodyCell}>
                      {tool.toolName}
                    </TableCell>
                    <TableCell align="right">{tool.activitiesCount}</TableCell>
                    <TableCell align="right">{tool.hoursSaved}</TableCell>
                    <TableCell align="right">
                      {tool.revenueActivities}
                    </TableCell>
                    <TableCell align="right">{tool.averageWorkDone}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* AI Tools by SDLC Phase */}
      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" sx={styles.cardTitle}>
            AI Tools by SDLC Phase
          </Typography>
          <Box sx={styles.sdlcGrid}>
            {sdlcPhaseTools.map((phase) => (
              <Box key={phase.phase} sx={styles.phaseBox}>
                <Typography variant="subtitle1" sx={styles.phaseTitle}>
                  {phase.phase}
                </Typography>
                {phase.tools.length > 0 ? (
                  <Box sx={styles.toolsContainer}>
                    {phase.tools.map((tool) => (
                      <Chip
                        key={tool}
                        label={tool}
                        size="small"
                        sx={styles.toolChip}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" sx={styles.noToolsText}>
                    No AI tools used in this phase
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export { AIToolsAnalysis };
