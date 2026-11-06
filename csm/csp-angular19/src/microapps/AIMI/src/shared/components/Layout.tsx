import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { logUserActivity } from '@shared/services/aimiLogService';

interface LayoutProps {
  children: React.ReactNode;
}

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

  // Usage log: one LOGIN entry per browser session
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('aimiLoginLogged')) {
        sessionStorage.setItem('aimiLoginLogged', '1');
        logUserActivity({ module: 'Auth', action: 'LOGIN' });
      }
    } catch {
      // sessionStorage unavailable - skip the once-per-session login entry
    }
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
    </Box>
  );
};

export { Layout };
