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
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ApplicabilityGuidelinesModalProps {
  open: boolean;
  onClose: () => void;
}

const APPLICABILITY_DEFINITIONS = [
  {
    value: 'Yes',
    label: 'Yes',
    definition:
      'The activity is currently being performed and is supported by AI capabilities.',
  },
  {
    value: 'No',
    label: 'No',
    definition:
      'The activity is not feasible for AI enablement due to technical, operational, or strategic constraints.',
  },
  {
    value: 'Activity NA',
    label: 'Activity NA',
    definition:
      'The activity is out of scope and not part of the current operational or delivery framework.',
  },
  {
    value: 'Customer NA',
    label: 'Customer NA',
    definition:
      'The activity has been explicitly excluded based on customer requirements or preferences.',
  },
];

// Global styles object
const styles = {
  dialog: {
    borderRadius: 3,
    maxHeight: '90vh',
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    pb: 1,
  },
  title: {
    fontWeight: 600,
    color: '#333',
  },
  dialogContent: {
    pt: 2,
  },
  description: {
    mb: 3,
  },
  tableContainer: {
    boxShadow: 2,
    borderRadius: 2,
  },
  tableHead: {
    backgroundColor: '#f8f9fa',
  },
  tableHeadCell: {
    fontWeight: 600,
    width: '20%',
  },
  tableHeadCellDefinition: {
    fontWeight: 600,
    width: '80%',
  },
  tableRow: {
    '&:hover': {
      backgroundColor: '#f8f9fa',
    },
  },
  tableCellLabel: {
    fontWeight: 500,
  },
  tableCellDefinition: {
    color: 'text.secondary',
  },
  footerNote: {
    mt: 2,
    display: 'block',
    fontStyle: 'italic',
  },
  dialogActions: {
    p: 3,
    pt: 1,
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    },
  },
};

export const ApplicabilityGuidelinesModal: React.FC<
  ApplicabilityGuidelinesModalProps
> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: styles.dialog,
      }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <Typography variant="h6" component="div" sx={styles.title}>
          Applicability Guidelines
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={styles.description}
        >
          Understand the different applicability options and their definitions
        </Typography>

        {/* Table */}
        <TableContainer component={Paper} sx={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow sx={styles.tableHead}>
                <TableCell sx={styles.tableHeadCell}>Applicability</TableCell>
                <TableCell sx={styles.tableHeadCellDefinition}>
                  Definition
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {APPLICABILITY_DEFINITIONS.map((option) => (
                <TableRow key={option.value} sx={styles.tableRow}>
                  <TableCell>
                    <Typography variant="body2" sx={styles.tableCellLabel}>
                      {option.label}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={styles.tableCellDefinition}
                    >
                      {option.definition}
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
          sx={styles.footerNote}
        >
          Use these guidelines to determine the applicability of activities in
          your project.
        </Typography>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} variant="contained" sx={styles.button}>
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  );
};
