import React from 'react';
import {
  Box,
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
import { AI_ADOPTION_SCORES } from '@activities/types/activityTypes';
import { getScoreColor } from '@shared/utils/scoreColorUtils';

export const AIAdoptionGuidelines: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 800, p: 2 }}>
      {/* Header */}
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#333', mb: 1 }}>
        AI Maturity Scoring Guidelines
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Understand how to score AI adoption across different Phases and
        activities
      </Typography>

      {/* Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: 600, width: '10%' }}>
                Score
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: '25%' }}>
                Label
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: '65%' }}>
                Description
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {AI_ADOPTION_SCORES.map((score) => (
              <TableRow
                key={score.value}
                sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}
              >
                <TableCell>
                  <Chip
                    label={score.value}
                    size="small"
                    sx={{
                      backgroundColor: getScoreColor(score.value),
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {score.label}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {score.description}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer note */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 2, display: 'block', fontStyle: 'italic' }}
      >
        Use these guidelines to assess the current level of AI adoption in your
        activities and phases.
      </Typography>
    </Box>
  );
};
