import { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography,
} from '@mui/material';

interface FilterDialogProps {
  open: boolean;
  /** e.g. "business units" */
  noun: string;
  options: string[];
  /** Values ticked when the dialog opens. Everything, unless a filter is already applied. */
  selected: string[];
  onApply: (selected: string[]) => void;
  onCancel: () => void;
}

/** Multi-select popup. Remount (key) per open so the draft starts from `selected`. */
export const FilterDialog = ({
  open,
  noun,
  options,
  selected,
  onApply,
  onCancel,
}: FilterDialogProps) => {
  const [draft, setDraft] = useState<string[]>(selected);

  const allOn = draft.length === options.length;
  const toggle = (value: string) =>
    setDraft((d) =>
      d.includes(value) ? d.filter((v) => v !== value) : [...d, value]
    );

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: '20px' } } }}
    >
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography component="span" variant="h6" fontWeight={650}>
          Choose {noun}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Everything is included until you change it.
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ px: 1.5, py: 0.5 }}>
        {options.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No score history yet.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
              sx={{ mx: 0, px: 1, py: 0.5, fontWeight: 650 }}
              control={
                <Checkbox
                  checked={allOn}
                  indeterminate={draft.length > 0 && !allOn}
                  onChange={() => setDraft(allOn ? [] : options.slice())}
                />
              }
              label={<strong>All ({options.length})</strong>}
            />
            {options.map((o) => (
              <FormControlLabel
                key={o}
                sx={{ mx: 0, px: 1, py: 0.25 }}
                control={
                  <Checkbox
                    checked={draft.includes(o)}
                    onChange={() => toggle(o)}
                  />
                }
                label={o}
              />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 2.5, py: 1.5, justifyContent: 'space-between' }}>
        <Typography variant="body2" color="text.secondary">
          {draft.length} of {options.length} selected
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onCancel} sx={{ py: 0.75, px: 2, fontSize: '0.9rem' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={draft.length === 0}
            onClick={() => onApply(draft)}
            sx={{ py: 0.75, px: 2.5, fontSize: '0.9rem' }}
          >
            Apply
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};
