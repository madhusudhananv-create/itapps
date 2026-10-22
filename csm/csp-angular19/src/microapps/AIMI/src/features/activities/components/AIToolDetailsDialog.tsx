import React, { useEffect, useState } from 'react';
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
import { validateAIToolDetails } from '../utils/formValidationUtils';

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
  // Edits are held here until Save, so Cancel can discard them and it is clear when they were applied.
  const [draft, setDraft] = useState<AIToolDetails>(aiToolDetails);

  useEffect(() => {
    if (open) setDraft(aiToolDetails);
    // Only reset when the pop-up opens, not on every edit
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const detailsComplete = validateAIToolDetails(aiTools, draft);

  const handleSave = () => {
    onChange(draft);
    onClose();
  };

  const updateToolDetails = (
    tool: string,
    field: 'accessType' | 'licenseCount' | 'networkType',
    value: string | number
  ) => {
    setDraft({
      ...draft,

      [tool]: {
accessType:
          field === 'accessType'
            ? String(value)
            : draft?.[tool]?.accessType || '',

        licenseCount:
          field === 'licenseCount'
            ? Number(value)
            : draft?.[tool]?.licenseCount || 0,

        networkType:
          field === 'networkType'
            ? String(value)
            : draft?.[tool]?.networkType || '',
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

              <TableCell>
                <strong>Network Type</strong>
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
                      draft?.[tool]?.accessType || ''
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
                      draft?.[tool]?.licenseCount || 0
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
                      draft?.[tool]?.accessType !==
                      'Licensed'
                    }
                  />
                </TableCell>
                <TableCell width="300px">
                  <SelectField
                    label=""
                    value={
                      draft?.[tool]?.networkType || ''
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
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!detailsComplete}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};