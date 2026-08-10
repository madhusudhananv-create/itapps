export const formFieldStyles = {
  dropdownSelect: {
    maxWidth: 400,
    '& .MuiSelect-select': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
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
  aiScoreLabel: {
    backgroundColor: 'white',
    px: 0.5,
    '&.Mui-focused': {
      backgroundColor: 'white',
      px: 0.5,
    },
  },
  aiScoreSelect: {
    maxWidth: 400,
    '& .MuiSelect-select': {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
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
      '&.Mui-focused': {
        backgroundColor: 'white',
        px: 0.5,
      },
    },
  },
  menuItem: {
    maxWidth: '100%',
  },
  menuItemText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
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
  chipContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 0.5,
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
    '& .MuiSelect-select': {
      cursor: 'not-allowed !important',
    },
    '& .MuiChip-root': {
      cursor: 'not-allowed !important',
    },
  },
};

export const modalStyles = {
  dialogContent: {
    pt: 2,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
    gap: 3,
    maxWidth: '800px',
    mx: 'auto',
  },
  fullWidthSection: {
    mt: 3,
    maxWidth: '800px',
    mx: 'auto',
  },
  dialogActions: {
    p: 3,
    pt: 0,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    color: 'white',
    '&:hover': {
      backgroundColor: '#5a6fd8',
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      color: '#666',
    },
  },
  secondaryButton: {
    borderColor: '#667eea',
    color: '#667eea',
    '&:hover': {
      borderColor: '#5a6fd8',
      backgroundColor: 'rgba(102, 126, 234, 0.04)',
    },
  },
};
