import React, {
  useState,
  useMemo,
  useCallback,
  memo,
  useRef,
  useEffect,
} from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  TextField,
  InputAdornment,
  Checkbox,
  ListItemText,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import { Search, ArrowDropDown } from '@mui/icons-material';

// Type definitions
interface MultiSelectDropdownProps {
  label: string;
  icon: React.ReactNode;
  options: string[];
  selected: string[];
  searchTerm: string;
  onSelectionChange: (value: string[]) => void;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
}

// Styles
const styles = {
  inputLabel: {
    fontWeight: 500,
    color: '#333',
    fontSize: '0.875rem',
  },
  select: {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#1976d2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        borderWidth: 2,
      },
    },
    '& .MuiInputLabel-root': {
      backgroundColor: 'white',
      px: 0.5,
      color: '#333',
      fontSize: '0.875rem',
      fontWeight: 500,
      '&.Mui-focused': {
        color: '#1976d2',
        backgroundColor: 'white',
        px: 0.5,
        fontSize: '0.875rem',
        fontWeight: 500,
      },
    },
    '& .MuiInputBase-input': {
      py: 1.5,
      cursor: 'pointer',
    },
  },
  searchField: {
    mb: 1,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
    },
  },
  menuItem: {
    py: 0.5,
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
  allOption: {
    fontWeight: 600,
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.12)',
    },
  },
  selectedOption: {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.08)',
    },
  },
  listItemText: {
    '& .MuiListItemText-primary': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  dropdownIcon: {
    color: 'rgba(0, 0, 0, 0.54)',
    transition: 'transform 0.2s ease-in-out',
  },
  dropdownIconOpen: {
    transform: 'rotate(180deg)',
  },
};

// Helper function to format selected values display
const formatSelectedDisplay = (
  selected: string[],
  allOptions: string[],
  maxDisplay: number = 1
): string => {
  if (selected.length === 0) return '';
  if (selected.length === allOptions.length && allOptions.length > 0)
    return 'All';
  if (selected.length <= maxDisplay) return selected.join(', ');

  // Truncate the first option if it's too long to make room for the count
  const firstOption = selected[0];
  const maxFirstOptionLength = 15; // Maximum characters for first option
  const truncatedFirstOption =
    firstOption.length > maxFirstOptionLength
      ? `${firstOption.substring(0, maxFirstOptionLength)}...`
      : firstOption;

  return `${truncatedFirstOption} +${selected.length - maxDisplay} more`;
};

const MultiSelectDropdown = memo<MultiSelectDropdownProps>(
  ({
    label,
    icon,
    options,
    selected,
    searchTerm,
    onSelectionChange,
    onSearchChange,
    disabled = false,
  }) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const listRef = useRef<HTMLUListElement>(null);

    // Memoize filtered options to prevent unnecessary recalculations
    const filteredOptions = useMemo(() => {
      const searchValue = localSearchTerm ?? searchTerm;
      if (!searchValue) return options;
      return options.filter((option) =>
        option.toLowerCase().includes(searchValue.toLowerCase())
      );
    }, [options, localSearchTerm, searchTerm]);

    // Memoize selection states
    const selectionStates = useMemo(() => {
      const isAllSelected =
        selected.length === options.length && options.length > 0;
      const isIndeterminate =
        selected.length > 0 && selected.length < options.length;

      return {
        isAllSelected,
        isIndeterminate,
      };
    }, [selected.length, options.length]);

    // Memoize handlers to prevent unnecessary re-renders
    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (!disabled) {
          setAnchorEl(event.currentTarget);
        }
      },
      [disabled]
    );

    const handleClose = useCallback(() => {
      setAnchorEl(null);
      setLocalSearchTerm('');
      setFocusedIndex(-1);
      onSearchChange(''); // Clear search when closing
    }, [onSearchChange]);

    const handleAllSelection = useCallback(() => {
      if (selectionStates.isAllSelected) {
        onSelectionChange([]);
      } else {
        onSelectionChange(options);
      }
    }, [selectionStates.isAllSelected, onSelectionChange, options]);

    const handleItemSelection = useCallback(
      (value: string) => {
        const newSelected = selected.includes(value)
          ? selected.filter((item) => item !== value)
          : [...selected, value];
        onSelectionChange(newSelected);
      },
      [selected, onSelectionChange]
    );

    const handleSearchChange = useCallback(
      (value: string) => {
        setLocalSearchTerm(value);
        setFocusedIndex(-1); // Reset focus when searching
        onSearchChange(value);
      },
      [onSearchChange]
    );

    const open = Boolean(anchorEl);

    // Efficient scroll-into-view using querySelector
    useEffect(() => {
      if (focusedIndex >= 0 && open && listRef.current) {
        const focusedElement = listRef.current.querySelector(
          `[data-focused-index="${focusedIndex}"]`
        );
        if (focusedElement) {
          focusedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }, [focusedIndex, open]);

    // Keyboard navigation handler
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (!open) return;

        const totalOptions =
          filteredOptions.length + (options.length > 1 ? 1 : 0); // +1 for "All" option
        let newFocusedIndex = focusedIndex;

        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            newFocusedIndex =
              focusedIndex < totalOptions - 1 ? focusedIndex + 1 : 0;
            setFocusedIndex(newFocusedIndex);
            break;
          case 'ArrowUp':
            event.preventDefault();
            newFocusedIndex =
              focusedIndex > 0 ? focusedIndex - 1 : totalOptions - 1;
            setFocusedIndex(newFocusedIndex);
            break;
          case 'Enter':
          case ' ':
            event.preventDefault();
            if (focusedIndex === 0 && options.length > 1) {
              handleAllSelection();
            } else {
              const optionIndex =
                options.length > 1 ? focusedIndex - 1 : focusedIndex;
              if (optionIndex >= 0 && optionIndex < filteredOptions.length) {
                handleItemSelection(filteredOptions[optionIndex]);
              }
            }
            break;
          case 'Escape':
            event.preventDefault();
            handleClose();
            break;
        }
      },
      [
        open,
        focusedIndex,
        filteredOptions,
        options.length,
        handleAllSelection,
        handleItemSelection,
        handleClose,
      ]
    );

    return (
      <FormControl fullWidth variant="outlined">
        <InputLabel sx={styles.inputLabel}>{label}</InputLabel>
        <OutlinedInput
          label={label}
          value={formatSelectedDisplay(selected, options, 1)}
          onClick={handleClick}
          startAdornment={icon}
          endAdornment={
            <ArrowDropDown
              sx={{
                ...styles.dropdownIcon,
                ...(open ? styles.dropdownIconOpen : {}),
              }}
            />
          }
          sx={{
            ...styles.select,
            cursor: disabled ? 'not-allowed' : 'pointer',
            '& input': {
              cursor: disabled ? 'not-allowed' : 'pointer',
            },
          }}
          disabled={disabled}
          readOnly
        />

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          slotProps={{
            paper: {
              sx: {
                width: 320, // Fixed width to prevent width changes
                maxHeight: 400,
                mt: 1,
                minWidth: 280,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
              },
            },
          }}
          onKeyDown={handleKeyDown}
        >
          <Box sx={{ p: 1, borderBottom: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={styles.searchField}
              autoFocus
              autoComplete="off"
            />
          </Box>

          <List ref={listRef} sx={{ maxHeight: 300, overflow: 'auto' }}>
            {/* All Option */}
            {options.length > 1 && (
              <ListItem disablePadding>
                <ListItemButton
                  data-focused-index={0}
                  onClick={handleAllSelection}
                  sx={{
                    ...styles.allOption,
                    ...(focusedIndex === 0
                      ? { backgroundColor: 'rgba(25, 118, 210, 0.12)' }
                      : {}),
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Checkbox
                      checked={selectionStates.isAllSelected}
                      indeterminate={selectionStates.isIndeterminate}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="All"
                    title="Select/Deselect all options"
                  />
                </ListItemButton>
              </ListItem>
            )}

            {/* Filtered Options */}
            {filteredOptions.map((option, index) => {
              const isSelected = selected.includes(option);
              const itemIndex = options.length > 1 ? index + 1 : index; // +1 if "All" option exists
              return (
                <ListItem key={option} disablePadding>
                  <ListItemButton
                    data-focused-index={itemIndex}
                    onClick={() => handleItemSelection(option)}
                    sx={{
                      ...(isSelected ? styles.selectedOption : styles.menuItem),
                      ...(focusedIndex === itemIndex
                        ? { backgroundColor: 'rgba(25, 118, 210, 0.08)' }
                        : {}),
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox checked={isSelected} size="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={option}
                      sx={styles.listItemText}
                      title={option}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}

            {/* No results message */}
            {filteredOptions.length === 0 &&
              (localSearchTerm || searchTerm) && (
                <ListItem>
                  <ListItemText primary="No results found" />
                </ListItem>
              )}
          </List>
        </Popover>
      </FormControl>
    );
  }
);

MultiSelectDropdown.displayName = 'MultiSelectDropdown';

export { MultiSelectDropdown };
export type { MultiSelectDropdownProps };
