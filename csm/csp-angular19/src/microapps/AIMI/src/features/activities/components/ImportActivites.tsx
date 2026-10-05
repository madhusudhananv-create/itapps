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
import {
  GUIDELINES_SHEET_NAME,
  TEMPLATE_DATA_START_ROW,
  generateAndDownloadActivityTemplate,
} from '../utils/activityTemplateUtils';

interface ImportProjectInfo {
  project?: string;
  manager?: string;
  account?: string;
  businessUnit?: string;
  headcount?: number;
  peopleUsingAI?: number;
}

interface ImportActivitiesDialogProps {
  open: boolean;
  onClose: () => void;
  onImport: (activities: any[]) => void;
  selectedPractice: string;
  projectInfo?: ImportProjectInfo;
}

// Maps a raw practice-sheet row (fixed column order, see activityTemplateUtils)
// to the field names the rest of the import pipeline (Activities.tsx) expects.
const mapTemplateRow = (row: unknown[]): Record<string, unknown> => ({
  'SDLC Phase': row[0] ?? '',
  Activity: row[1] ?? '',
  Applicability: row[2] ?? '',
  'AI Tools Used': row[3] ?? '',
  'Benefit To': row[4] ?? '',
  'Hours Saved': row[5] ?? '',
  'Revenue Generated': row[6] ?? '',
  'Qualitative Benefits': row[7] ?? '',
  'Accelerators Used': row[8] ?? '',
  Comments: row[9] ?? '',
  'AI Adoption Score': row[10] ?? '',
  '% Work Done by AI': row[11] ?? '',
});

const isRowBlank = (row: unknown[]): boolean =>
  row.every((cell) => String(cell ?? '').trim() === '');

export const ImportActivitiesDialog: React.FC<
  ImportActivitiesDialogProps
> = ({ open, onClose, onImport, selectedPractice, projectInfo }) => {
  const [fileName, setFileName] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const [uploadError, setUploadError] = useState('');

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setFileName(file.name);
    setUploadError('');
    setActivities([]);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, {
        type: 'array',
      });

      // The template's first sheet is always "Guidelines" - the activity data
      // lives on the sheet named after the practice, so pick that one instead
      // of always defaulting to the first sheet.
      const sheetName =
        workbook.SheetNames.find(
          (name) => name.toLowerCase() === selectedPractice.toLowerCase()
        ) ??
        workbook.SheetNames.find(
          (name) => name.toLowerCase() !== GUIDELINES_SHEET_NAME.toLowerCase()
        ) ??
        workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const allRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
        header: 1,
        raw: false,
        defval: '',
      });

      let lastPhase = '';
      const rows = allRows
        .slice(TEMPLATE_DATA_START_ROW)
        .filter((row) => !isRowBlank(row))
        .filter((row) => String(row[1] ?? '').trim() !== '')
        .map((row) => {
          const phase = String(row[0] ?? '').trim();
          if (phase) {
            lastPhase = phase;
          }
          return mapTemplateRow([lastPhase, ...row.slice(1)]);
        });

      if (rows.length === 0) {
        setUploadError(
          `No activity rows found on sheet "${sheetName}". Make sure the SDLC Activity / Question column is filled in.`
        );
      }

      setActivities(rows);
    };

    reader.readAsArrayBuffer(file);

    // Reset the input so re-selecting the same file (even after editing it) fires onChange again
    event.target.value = '';
  };

  const handleImport = () => {
    onImport(activities);
    setFileName('');
    setActivities([]);
    setUploadError('');
    onClose();
  };

  const handleCancel = () => {
    setFileName('');
    setActivities([]);
    setUploadError('');
    onClose();
  };

  const downloadTemplate = () => {
    generateAndDownloadActivityTemplate(selectedPractice, projectInfo);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
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
            disabled={!selectedPractice}
          >
            Download Template
          </Button>
        </Box>

        {fileName && !uploadError && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Selected File: {fileName}
          </Alert>
        )}

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {uploadError}
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
        <Button onClick={handleCancel}>
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