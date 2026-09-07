import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

import { SelectField, NumberField } from './FormFieldComponents';
import type { AIToolDetails } from '../types/activityTypes';

interface AIToolDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  aiTools: string[];
  aiToolDetails: AIToolDetails;
  onChange: (value: AIToolDetails) => void;
}

const ACCESS_TYPE_OPTIONS = [
  {
    value: 'Licensed',
    label: 'Licensed',
  },
  {
    value: 'Customer Network',
    label: 'Customer Network',
  },
  {
    value: 'Neurealm Network',
    label: 'Neurealm Network',
  },
];

export const AIToolDetailsDialog: React.FC<
  AIToolDetailsDialogProps
> = ({
  open,
  onClose,
  aiTools,
  aiToolDetails,
  onChange,
}) => {
  const updateToolDetails = (
    tool: string,
    field: 'accessType' | 'licenseCount',
    value: string | number
  ) => {
    onChange({
      ...aiToolDetails,

      [tool]: {
accessType:
          field === 'accessType'
            ? String(value)
            : aiToolDetails?.[tool]?.accessType || '',

        licenseCount:
          field === 'licenseCount'
            ? Number(value)
            : aiToolDetails?.[tool]?.licenseCount || 0,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Configure AI Tool Details
      </DialogTitle>

      <DialogContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>AI Tool</strong>
              </TableCell>

              <TableCell>
                <strong>Access Type</strong>
              </TableCell>

              <TableCell>
                <strong>No. of Licenses</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {aiTools.map((tool) => (
              <TableRow key={tool}>
                <TableCell>{tool}</TableCell>

                <TableCell width="300px">
                  <SelectField
                    label=""
                    value={
                      aiToolDetails?.[tool]?.accessType || ''
                    }
                    onChange={(value) =>
                      updateToolDetails(
                        tool,
                        'accessType',
                        value
                      )
                    }
                    options={ACCESS_TYPE_OPTIONS}
                  />
                </TableCell>

                <TableCell width="200px">
                  <NumberField
                    label=""
                    value={
                      aiToolDetails?.[tool]?.licenseCount || 0
                    }
                    onChange={(value) =>
                      updateToolDetails(
                        tool,
                        'licenseCount',
                        value
                      )
                    }
                    min={0}
                    disabled={
                      aiToolDetails?.[tool]?.accessType !==
                      'Licensed'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};