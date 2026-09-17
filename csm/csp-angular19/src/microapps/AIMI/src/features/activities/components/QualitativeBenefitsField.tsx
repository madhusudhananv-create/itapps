/* import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  FormHelperText,
  type SelectChangeEvent,
  IconButton,
} from '@mui/material';
import { QUALITATIVE_BENEFITS } from '../types/activityTypes';
import { formFieldStyles } from '../styles/formStyles';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

interface QualitativeBenefitsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const QualitativeBenefitsField: React.FC<
  QualitativeBenefitsFieldProps
> = ({ value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValue = event.target.value;
    const newValue =
      typeof selectedValue === 'string'
        ? selectedValue.split(',')
        : selectedValue;
    onChange(newValue);
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Qualitative Benefits</InputLabel>
      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label="Qualitative Benefits" />}
        renderValue={(selected) => (
          <Box sx={formFieldStyles.chipContainer}>
            {selected.map((benefit) => (
              <Chip key={benefit} label={benefit} size="small" />
            ))}
          </Box>
        )}
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={{ ...(disabled && formFieldStyles.disabled) }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'grey', // Example: Set the color to red
              paddingRight: '10px',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        {QUALITATIVE_BENEFITS.map((benefit) => (
          <MenuItem key={benefit.value} value={benefit.value}>
            {benefit.label}
          </MenuItem>
        ))}
      </Select>
      <FormHelperText>Select multiple benefits that apply</FormHelperText>
    </FormControl>
  );
}; */

import React, { useState } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  OutlinedInput,
  FormHelperText,
  type SelectChangeEvent,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { QUALITATIVE_BENEFITS } from '../types/activityTypes';
import { formFieldStyles } from '../styles/formStyles';

interface QualitativeBenefitsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const QualitativeBenefitsField: React.FC<
  QualitativeBenefitsFieldProps
> = ({ value, onChange, disabled = false }) => {
  const [open, setOpen] = useState(false);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const selectedValue = event.target.value;

    const newValue =
      typeof selectedValue === 'string'
        ? selectedValue.split(',')
        : selectedValue;

    onChange(newValue);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <FormControl fullWidth>
      <InputLabel>Qualitative Benefits</InputLabel>

      <Select
        multiple
        value={value}
        onChange={handleChange}
        input={<OutlinedInput label="Qualitative Benefits" />}
        renderValue={(selected) => (
          <Box sx={formFieldStyles.chipContainer}>
            {selected.map((benefit) => (
              <Chip
                key={benefit}
                label={benefit}
                size="small"
              />
            ))}
          </Box>
        )}
        disabled={disabled}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        sx={{ ...(disabled && formFieldStyles.disabled) }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'grey',
              paddingRight: '10px',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {QUALITATIVE_BENEFITS.map((benefit) => (
          <MenuItem
            key={benefit.value}
            value={benefit.value}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',

              '&.Mui-selected': {
                backgroundColor: 'transparent',
              },

              '&.Mui-selected:hover': {
                backgroundColor: 'rgba(0,0,0,0.04)',
              },
            }}
          >
            {benefit.label}

            {value.includes(benefit.value) && (
              <CheckIcon
                fontSize="small"
                sx={{ color: 'text.primary' }}
              />
            )}
          </MenuItem>
        ))}
      </Select>

      <FormHelperText>
        Select multiple benefits that apply
      </FormHelperText>
    </FormControl>
  );
};