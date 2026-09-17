import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  preloadComponents,
  COMPONENT_NAMES,
} from '@shared/utils/preloadComponents';

// Version is now available as a global constant from Vite
const VERSION = __APP_VERSION__;

// Global styles object
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 2,
    p: 2,
  },
  paper: {
    width: '100%',
    maxWidth: 550,
    p: 4,
    borderRadius: 3,
    textAlign: 'center',
    bgcolor: 'white',
  },
  title: {
    color: '#764ba2',
    mb: 1,
    fontWeight: 700,
    fontSize: '2rem',
  },
  subtitle: {
    color: '#666',
    mb: 3,
    fontWeight: 400,
    fontSize: '1.1rem',
  },
  objectiveContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    mb: 4,
    p: 2,
    bgcolor: '#eff1f4',
    borderRadius: 2,
    textAlign: 'left',
  },
  lightbulbIcon: {
    color: '#ffc107',
    mr: 1,
    mt: 0.2,
    fontSize: '1rem',
  },
  objectiveText: {
    color: '#666',
    fontSize: '0.8rem',
    lineHeight: 1.4,
    textAlign: 'left',
  },
  errorAlert: {
    mb: 3,
    borderRadius: 2,
  },
  loginButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    py: 1.5,
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
    },
    '&:disabled': {
      background: 'linear-gradient(135deg, #b0b0b0 0%, #808080 100%)',
    },
    borderRadius: 2,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    mb: 3,
  },
  bottomText: {
    color: '#999',
    fontSize: '0.85rem',
    lineHeight: 1.4,
  },
  versionText: {
    color: '#d8d8d8',
    fontSize: '0.85rem',
    fontWeight: 400,
  },
};

export function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/activities');
    }
  }, [isAuthenticated, navigate]);

  // Preload components after Login mounts
  useEffect(() => {
    // Preload likely next components in background
    preloadComponents([
      COMPONENT_NAMES.PROTECTED_ROUTE,
      COMPONENT_NAMES.LAYOUT,
      COMPONENT_NAMES.ACTIVITIES,
      COMPONENT_NAMES.REPORTS,
    ]);
  }, []);

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.'
      );
    }
  };

  return (
    <Box sx={styles.container}>
      <Paper elevation={8} sx={styles.paper}>
        {/* Title */}
        <Typography variant="h4" sx={styles.title}>
          AI Maturity Index
        </Typography>

        {/* Subtitle */}
        <Typography variant="h6" sx={styles.subtitle}>
          Platform Login
        </Typography>

        {/* Objective Section */}
        <Box sx={styles.objectiveContainer}>
          <LightbulbIcon sx={styles.lightbulbIcon} />
          <Typography variant="body2" sx={styles.objectiveText}>
            Objective: Accelerate digital transformation by measuring, tracking,
            and optimizing AI adoption across your enterprise projects and
            portfolios.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={styles.errorAlert}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* SSO Login Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleLogin}
          disabled={isLoading}
          sx={styles.loginButton}
          startIcon={
            isLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <GoogleIcon />
            )
          }
        >
          {isLoading ? 'Signing In...' : 'Sign In with Google'}
        </Button>

        {/* Bottom Text */}
        <Typography variant="body2" sx={styles.bottomText}>
          Transform your organization's AI adoption journey with comprehensive
          maturity assessment and strategic insights.
        </Typography>
      </Paper>

      {/* Version Number */}
      <Typography variant="caption" sx={styles.versionText}>
        v{VERSION}
      </Typography>
    </Box>
  );
}
