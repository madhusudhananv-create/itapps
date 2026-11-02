import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Chip,
  Box,
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { formFieldStyles } from '../styles/formStyles';
import { getScoreColor } from '../../../shared/utils/scoreColorUtils';

// Global styles object for form field components
const styles = {
  aiScoreInfoButton: {
    color: '#667eea',
    mr: 1,
  },
  aiScoreMenuItemContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
  },
  getAiScoreChip: (score: string) => ({
    backgroundColor: getScoreColor(score),
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    minWidth: '32px',
  }),
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
  required?: boolean;
  sx?: Record<string, unknown>;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
  required = false,
  sx = {},
}) => (
  <FormControl fullWidth required={required}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      disabled={disabled}
      required={required}
      sx={{
        ...formFieldStyles.dropdownSelect,
        ...(disabled && formFieldStyles.disabled),
        ...sx,
      }}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          sx={formFieldStyles.menuItem}
        >
          <Typography sx={formFieldStyles.menuItemText}>
            {option.label}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number | '' | string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  min = 0,
  max,
  placeholder,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target;

    // Allow clearing the field (empty string)
    if (inputValue === '') {
      onChange('');
      return;
    }

    const numericValue = Number(inputValue);

    // Only proceed if input is a valid number and within min/max bounds
    if (
      numericValue &&
      !isNaN(numericValue) &&
      (min === undefined || numericValue >= min) &&
      (max === undefined || numericValue <= max)
    ) {
      onChange(numericValue);
    }
    // Otherwise, do nothing (invalid input or out of bounds)
  };

  return (
    <TextField
      fullWidth
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      inputProps={{ min, max }}
      placeholder={placeholder}
      sx={{
        ...formFieldStyles.textField,
        ...(disabled && formFieldStyles.disabled),
      }}
      disabled={disabled}
      onBlur={(e) => (e.target.value === '' ? onChange(0) : null)}
      onFocus={(e) => (e.target.value === '0' ? onChange('') : null)}
    />
  );
};

interface AIScoreFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  onInfoClick: () => void;
  options: Array<{ value: string; label: string }>;
}

export const AIScoreField: React.FC<AIScoreFieldProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  onInfoClick,
  options,
}) => (
  <FormControl fullWidth required={required} disabled={disabled}>
    <InputLabel sx={formFieldStyles.aiScoreLabel}>AI Adoption Score</InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      sx={{
        ...formFieldStyles.aiScoreSelect,
        ...(disabled && formFieldStyles.disabled),
      }}
      // prevent info icon from being clickable when disabled
      endAdornment={
        <IconButton
          size="small"
          sx={{
            ...styles.aiScoreInfoButton,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1,
          }}
          onClick={!disabled ? onInfoClick : undefined}
          disabled={disabled}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      }
    >
      {options.map((score) => (
        <MenuItem key={score.value} value={score.value}>
          <Box sx={styles.aiScoreMenuItemContainer}>
            <Chip
              label={score.value}
              size="small"
              sx={styles.getAiScoreChip(score.value)}
            />
            <Typography variant="body2">{score.label}</Typography>
          </Box>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}

interface ApplicabilityFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  onInfoClick: () => void;
  options: Array<{ value: string; label: string }>;
}

export const ApplicabilityField: React.FC<ApplicabilityFieldProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  onInfoClick,
  options,
}) => (
  <FormControl fullWidth required={required} disabled={disabled}>
    <InputLabel sx={formFieldStyles.aiScoreLabel}>Applicability</InputLabel>
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      sx={{
        ...formFieldStyles.aiScoreSelect,
        ...(disabled && formFieldStyles.disabled),
      }}
      endAdornment={
        <IconButton
          size="small"
          sx={{
            ...styles.aiScoreInfoButton,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.4 : 1,
          }}
          onClick={!disabled ? onInfoClick : undefined}
          disabled={disabled}
        >
          <InfoIcon fontSize="small" />
        </IconButton>
      }
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Typography variant="body2">{option.label}</Typography>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  rows = 4,
}) => (
  <TextField
    fullWidth
    label={label}
    multiline
    rows={rows}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    sx={{
      ...formFieldStyles.textField,
      ...(disabled && formFieldStyles.disabled),
    }}
    disabled={disabled}
  />
);
