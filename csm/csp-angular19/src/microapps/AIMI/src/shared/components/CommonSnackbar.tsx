import React, { useMemo } from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';

interface CommonSnackbarProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  onClose?: () => void;
  position?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  customPosition?: {
    top?: string;
    right?: string;
    left?: string;
    bottom?: string;
  };
}

const CommonSnackbar: React.FC<CommonSnackbarProps> = ({
  open,
  message,
  severity = 'success',
  autoHideDuration = 6000,
  onClose,
  position = { vertical: 'top', horizontal: 'right' },
  customPosition,
}) => {
  // Modularize and memoize the defaultStyles using useMemo for performance
  const defaultStyles = useMemo(() => {
    let backgroundColor = '#2196f3';
    let boxShadow = '0 4px 12px rgba(33, 150, 243, 0.3)';
    let border = '2px solid #1976d2';

    switch (severity) {
      case 'success':
        backgroundColor = '#4caf50';
        boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
        border = '2px solid #45a049';
        break;
      case 'error':
        backgroundColor = '#f44336';
        boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)';
        border = '2px solid #d32f2f';
        break;
      case 'warning':
        backgroundColor = '#ff9800';
        boxShadow = '0 4px 12px rgba(255, 152, 0, 0.3)';
        border = '2px solid #f57c00';
        break;
      default:
        break;
    }

    return {
      backgroundColor,
      color: 'white',
      fontWeight: 600,
      fontSize: '1rem',
      boxShadow,
      border,
      '& .MuiAlert-icon': {
        color: 'white',
      },
      '& .MuiAlert-action': {
        color: 'white',
      },
    };
  }, [severity]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={customPosition ? undefined : position}
    >
      <Alert onClose={onClose} severity={severity} sx={defaultStyles}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export { CommonSnackbar };
