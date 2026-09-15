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
    value: 'Not-Licensed',
    label: 'Not-Licensed',
  }
];

const NETWORK_TYPE_OPTIONS = [
  {
    value: 'Customer',
    label: 'Customer',
  },
  {
    value: 'Neurealm',
    label: 'Neurealm',
  }
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
    field: 'accessType' | 'licenseCount' | 'networkType',
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

        networkType:
          field === 'networkType'
            ? String(value)
            : aiToolDetails?.[tool]?.networkType || '',
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
                <TableCell width="300px">
                  <SelectField
                    label=""
                    value={
                      aiToolDetails?.[tool]?.networkType || ''
                    }
                    onChange={(value) =>
                      updateToolDetails(
                        tool,
                        'networkType',
                        value
                      )
                    }
                    options={NETWORK_TYPE_OPTIONS}
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