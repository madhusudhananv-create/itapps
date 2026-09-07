import React, { useState } from 'react';
import * as XLSX from 'xlsx';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
} from '@mui/material';

interface ImportActivitiesDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (activities: any[]) => void;
}

export const ImportActivitiesDialog: React.FC<
  ImportActivitiesDialogProps
> = ({ open, onClose, onImport }) => {
  const [fileName, setFileName] = useState('');
  const [activities, setActivities] = useState<any[]>([]);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, {
        type: 'array',
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(
        worksheet
      );

      setActivities(rows);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    onImport(activities);
    onClose();
  };

  const downloadTemplate = () => {
    alert(
      'Template download functionality can be added here.'
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Import Activities
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            component="label"
          >
            Choose Excel File

            <input
              hidden
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
            />
          </Button>

          <Button
            sx={{ ml: 2 }}
            onClick={downloadTemplate}
          >
            Download Template
          </Button>
        </Box>

        {fileName && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Selected File: {fileName}
          </Alert>
        )}

        {activities.length > 0 && (
          <>
            <Typography
              variant="subtitle1"
              sx={{ mb: 2 }}
            >
              Preview ({activities.length} rows)
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  {Object.keys(
                    activities[0]
                  ).map((column) => (
                    <TableCell key={column}>
                      <strong>{column}</strong>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {activities
                  .slice(0, 10)
                  .map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map(
                        (value, idx) => (
                          <TableCell key={idx}>
                            {String(value)}
                          </TableCell>
                        )
                      )}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {activities.length > 10 && (
              <Typography
                variant="caption"
                sx={{ mt: 2, display: 'block' }}
              >
                Showing first 10 rows
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleImport}
          disabled={activities.length === 0}
        >
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};