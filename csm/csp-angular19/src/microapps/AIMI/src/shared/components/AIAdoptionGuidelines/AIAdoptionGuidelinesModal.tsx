import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AI_ADOPTION_SCORES } from '@activities/types/activityTypes';
import { getScoreColor } from '@shared/utils/scoreColorUtils';

interface AIAdoptionGuidelinesModalProps {
  open: boolean;
  onClose: () => void;
}

export const AIAdoptionGuidelinesModal: React.FC<
  AIAdoptionGuidelinesModalProps
> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: '#333' }}
        >
          AI Maturity Scoring Guidelines
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Understand how to score AI adoption across different Phases and
          activities
        </Typography>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 2, borderRadius: 2 }}
        >
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
          Use these guidelines to assess the current level of AI adoption in
          your activities and phases.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};
