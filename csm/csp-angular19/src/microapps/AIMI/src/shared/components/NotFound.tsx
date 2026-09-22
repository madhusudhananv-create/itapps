import { Box, Button, Typography, Paper } from '@mui/material';
import { ArrowBackRounded, Assignment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/activities');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      width: '100%',
    },
    paper: {
      width: '100%',
      maxWidth: 500,
      p: 4,
      borderRadius: 3,
      textAlign: 'center' as const,
      bgcolor: 'white',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e0e0e0',
    },
    errorCode: {
      fontSize: '4rem',
      fontWeight: 700,
      color: '#0066FF',
      mb: 1,
      lineHeight: 1,
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#333',
      mb: 2,
    },
    subtitle: {
      fontSize: '1rem',
      color: '#666',
      mb: 4,
      lineHeight: 1.6,
    },
    buttonContainer: {
      display: 'flex',
      gap: 2,
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      px: 3,
      py: 1.5,
      '&:hover': {
        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      },
      borderRadius: 2,
      textTransform: 'none' as const,
      fontSize: '1rem',
      fontWeight: 600,
    },
    secondaryButton: {
      color: '#666',
      borderColor: '#ddd',
      px: 3,
      py: 1.5,
      '&:hover': {
        borderColor: '#0066FF',
        color: '#0066FF',
        bgcolor: 'rgba(0, 102, 255, 0.04)',
      },
      borderRadius: 2,
      textTransform: 'none' as const,
      fontSize: '1rem',
      fontWeight: 500,
    },
  };

  return (
    <Box sx={styles.container}>
      <Paper elevation={2} sx={styles.paper}>
        {/* Error Code */}
        <Typography variant="h1" sx={styles.errorCode}>
          404
        </Typography>

        {/* Title */}
        <Typography variant="h4" sx={styles.title}>
          Page Not Found
        </Typography>

        {/* Subtitle */}
        <Typography variant="body1" sx={styles.subtitle}>
          Oops! The page you're looking for doesn't exist. It might have been
          moved, deleted, or you entered the wrong URL.
        </Typography>

        {/* Action Buttons */}
        <Box sx={styles.buttonContainer}>
          <Button
            variant="contained"
            startIcon={<Assignment />}
            onClick={handleGoHome}
            sx={styles.primaryButton}
          >
            Go to Manage Activities
          </Button>

          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={handleGoBack}
            sx={styles.secondaryButton}
          >
            Go Back
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
