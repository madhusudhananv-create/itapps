import { Box, Container } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './Sidebar';
import { CommonSnackbar } from './CommonSnackbar';
import { getAppEnvironment } from '@shared/config/firebaseConfig';

interface LayoutProps {
  children: React.ReactNode;
}

// Human-readable notice shown once per session so users know which database they're working against
const ENVIRONMENT_NOTICE = {
  dev: {
    message: 'You are in DEV — changes here will not affect live data.',
    severity: 'info' as const,
  },
  live: {
    message: 'You are in LIVE — changes here affect production data.',
    severity: 'info' as const,
  },
  unknown: {
    message: 'Unable to determine which environment (dev/live) you are connected to.',
    severity: 'warning' as const,
  },
};

// Global styling object
const styles = {
  mainContainer: (isOpen: boolean) => ({
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    marginLeft: isOpen ? '300px' : '90px',
    transition: 'margin-left 0.2s ease-in-out',
  }),
  contentContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    transition: 'width 0.2s ease-in-out, margin-left 0.2s ease-in-out',
  },
  contentWrapper: {
    flexGrow: 1,
    py: 4,
    px: 3,
  },
};

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showEnvironmentNotice, setShowEnvironmentNotice] = useState(false);

  const environmentNotice = useMemo(
    () => ENVIRONMENT_NOTICE[getAppEnvironment()],
    []
  );

  // Notify the user which database (dev/live) they are connected to after login
  useEffect(() => {
    setShowEnvironmentNotice(true);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={styles.mainContainer(sidebarOpen)}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

      {/* Main Content */}
      <Box sx={styles.contentContainer}>
        <Container maxWidth="xl" sx={styles.contentWrapper}>
          {children}
        </Container>
      </Box>

      {/* Environment Notice */}
      <CommonSnackbar
        open={showEnvironmentNotice}
        onClose={() => setShowEnvironmentNotice(false)}
        message={environmentNotice.message}
        severity={environmentNotice.severity}
        autoHideDuration={8000}
      />
    </Box>
  );
};

export { Layout };
