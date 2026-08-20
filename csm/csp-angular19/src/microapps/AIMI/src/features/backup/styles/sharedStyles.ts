// Shared styles for backup components
export const sharedStyles = {
  // Common colors
  colors: {
    primary: '#1976d2',
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    text: {
      primary: '#1a1a1a',
      secondary: '#666',
      disabled: '#999',
    },
    background: {
      paper: 'white',
      light: '#f8f9fa',
      hover: '#f5f5f5',
    },
    border: {
      light: '#e0e0e0',
      medium: '#e9ecef',
    },
  },

  // Common spacing
  spacing: {
    xs: 0.5,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },

  // Common typography
  typography: {
    title: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '1.5rem',
    },
    subtitle: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '1.25rem',
    },
    sectionTitle: {
      fontWeight: 600,
      color: '#1a1a1a',
      fontSize: '1rem',
    },
    body: {
      color: '#666',
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    caption: {
      color: '#999',
      fontSize: '0.85rem',
      lineHeight: 1.4,
    },
  },

  // Common layout
  layout: {
    paper: {
      p: 3,
      mt: 3,
      borderRadius: 2,
      bgcolor: 'white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
    section: {
      mb: 3,
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
  },

  // Common buttons
  buttons: {
    primary: {
      py: 1.5,
      px: 3,
      mt: 2,
      fontSize: '1rem',
      fontWeight: 600,
      borderRadius: 2,
      textTransform: 'none',
      minWidth: 200,
    },
    secondary: {
      py: 1.5,
      px: 3,
      mt: 2,
      fontSize: '1rem',
      fontWeight: 600,
      borderRadius: 2,
      textTransform: 'none',
      minWidth: 200,
    },
  },

  // Common alerts
  alerts: {
    container: {
      mt: 2,
    },
    title: {
      fontWeight: 600,
      mb: 1,
    },
    subtitle: {
      mb: 1,
    },
    body: {
      fontSize: '0.9rem',
    },
  },

  // Common status
  status: {
    container: {
      mt: 3,
      p: 2,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    },
    icon: {
      fontSize: '1.5rem',
    },
    text: {
      fontWeight: 500,
    },
  },
};
