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
import { TrendingUp } from '@mui/icons-material';
import type { QualitativeBenefitAnalysis } from '../../../shared/types/dashboardTypes';

interface QualitativeBenefitsAnalysisProps {
  qualitativeBenefits: QualitativeBenefitAnalysis[];
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
  cardTitle: {
    fontWeight: 600,
    mb: 2,
    color: '#333',
    fontSize: '1rem',
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
  toolChip: {
    backgroundColor: 'success.main',
    color: 'white',
    '&:hover': { backgroundColor: 'success.dark' },
  },
  noToolsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  toolsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
  },
  associatedToolChip: {
    borderColor: 'primary.main',
    color: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.main',
      color: 'white',
    },
  },
};

const QualitativeBenefitsAnalysis = ({
  qualitativeBenefits,
}: QualitativeBenefitsAnalysisProps) => {
  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <TrendingUp sx={styles.headerIcon} />
        <Typography variant="h5" sx={styles.headerTitle}>
          Qualitative Benefits Analysis
        </Typography>
      </Box>

      <Card sx={styles.card}>
        <CardContent>
          <Typography variant="h6" sx={styles.cardTitle}>
            Benefits Achieved and Associated Tools
          </Typography>
          <TableContainer component={Paper} sx={styles.tableContainer}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={styles.tableHeaderCell}>
                    Qualitative Benefit
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Frequency
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell} align="right">
                    Total Hours Saved
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell}>
                    Most Frequent Tool
                  </TableCell>
                  <TableCell sx={styles.tableHeaderCell}>
                    Associated Tools
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {qualitativeBenefits.map((benefit) => (
                  <TableRow key={benefit.benefit} hover>
                    <TableCell sx={styles.tableBodyCell}>
                      {benefit.benefit}
                    </TableCell>
                    <TableCell align="right">{benefit.frequency}</TableCell>
                    <TableCell align="right">
                      {benefit.totalHoursSaved}
                    </TableCell>
                    <TableCell>
                      {benefit.mostFrequentTool ? (
                        <Chip
                          label={benefit.mostFrequentTool}
                          size="small"
                          sx={styles.toolChip}
                        />
                      ) : (
                        <Typography variant="body2" sx={styles.noToolsText}>
                          No tools
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={styles.toolsContainer}>
                        {benefit.associatedTools.length > 0 ? (
                          benefit.associatedTools.map((tool) => (
                            <Chip
                              key={tool}
                              label={tool}
                              size="small"
                              variant="outlined"
                              sx={styles.associatedToolChip}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" sx={styles.noToolsText}>
                            No tools
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export { QualitativeBenefitsAnalysis };
