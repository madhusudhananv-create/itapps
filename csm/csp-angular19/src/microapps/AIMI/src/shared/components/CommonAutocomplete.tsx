import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Box, Chip, Typography } from '@mui/material';

interface CommonAutocompleteProps {
  value: string | string[];
  onChange: (value: string | string[]) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  placeholder?: string;
  multiple?: boolean;
  options: string[];
  helperText?: string;
}

// Global styling object
const styles = {
  container: {
    position: 'relative' as const,
  },
  textField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      '&:hover fieldset': {
        borderColor: '#667eea',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#667eea',
      },
    },
    '& .MuiInputLabel-root': {
      backgroundColor: 'white',
      px: 0.5,
      color: '#333',
      fontSize: '0.875rem',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#667eea',
        backgroundColor: 'white',
        px: 0.5,
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    },
  },
  disabled: {
    cursor: 'not-allowed !important',
    '& .MuiOutlinedInput-root': {
      borderRadius: '4px',
      cursor: 'not-allowed !important',
    },
    '& .MuiInputBase-input': {
      cursor: 'not-allowed !important',
    },
    '& .MuiChip-root': {
      cursor: 'not-allowed !important',
    },
  },
  optionContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  optionText: {
    flexGrow: 1,
  },
  customChip: {
    ml: 1,
    fontSize: '0.7rem',
  },
  autocomplete: {
    '& .MuiAutocomplete-popupIndicator': {
      color: '#667eea',
    },
    '& .MuiAutocomplete-clearIndicator': {
      color: '#667eea',
    },
  },
  helperText: {
    mt: 0.5,
    display: 'block',
  },
};

export const CommonAutocomplete: React.FC<CommonAutocompleteProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  label = 'Field',
  placeholder = 'Search or type to add',
  multiple = false,
  options = [],
  helperText,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(
        [...options].sort((a, b) => a.localeCompare(b))
      );
    }
  }, [inputValue, options]);

  const handleInputChange = (
    _event: React.SyntheticEvent,
    newInputValue: string
  ) => {
    setInputValue(newInputValue);
  };

  // Separate handlers for single vs multiple selection
  const handleSingleChange = (
    _event: React.SyntheticEvent,
    newValue: string | string[] | null
  ) => {
    onChange((newValue as string) || '');
  };

  const handleMultipleChange = (
    _event: React.SyntheticEvent,
    newValue: string | string[] | null
  ) => {
    onChange((newValue as string[]) || []);
  };

  const handleKeyPressSingle = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      onChange(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPressMultiple = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && inputValue.trim()) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = [...currentValue, inputValue.trim()];
      onChange(newValue);
      setInputValue('');
    }
  };

  // Ensure value is properly formatted
  let displayValue: string | string[];
  if (multiple) {
    displayValue = Array.isArray(value) ? value : [];
  } else {
    displayValue = typeof value === 'string' ? value : '';
  }

  // Choose handlers based on mode
  const onChangeHandler = multiple ? handleMultipleChange : handleSingleChange;
  const onKeyPressHandler = multiple
    ? handleKeyPressMultiple
    : handleKeyPressSingle;

  return (
    <Box sx={styles.container}>
      <Autocomplete
        freeSolo
        multiple={multiple}
        options={suggestions}
        value={displayValue}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={onChangeHandler}
        onKeyPress={onKeyPressHandler}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            required={required}
            sx={{
              ...styles.textField,
              ...(disabled && styles.disabled),
            }}
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box component="li" key={key} {...otherProps}>
              <Box sx={styles.optionContainer}>
                <Typography variant="body2" sx={styles.optionText}>
                  {option}
                </Typography>
                {!options.includes(option) && (
                  <Chip
                    label="Custom"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={styles.customChip}
                  />
                )}
              </Box>
            </Box>
          );
        }}
        renderTags={(value, getTagProps) =>
          Array.isArray(value)
            ? value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option}
                  label={option}
                  size="small"
                  color={options.includes(option) ? 'default' : 'primary'}
                  variant={options.includes(option) ? 'filled' : 'outlined'}
                />
              ))
            : []
        }
        sx={styles.autocomplete}
      />

      {/* Helper text */}
      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={styles.helperText}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
