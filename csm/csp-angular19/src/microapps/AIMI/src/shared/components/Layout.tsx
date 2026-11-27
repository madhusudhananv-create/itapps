import { Box, Container } from '@mui/material';
import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Loading } from './Loading';
import { logUserActivity } from '@shared/services/aimiLogService';
import { MaintenanceNoticeDialog } from './MaintenanceNoticeDialog';
import { useMaintenanceNotice } from '@shared/hooks/useMaintenanceNotice';

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
  maintenanceContainer: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
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
  const maintenance = useMaintenanceNotice();

  // Record one LOGIN entry per browser session
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

  // While the AIMI_MAINTENANCE row is active (see usp_AIMI_GetMaintenanceStatus) nothing of the
  // app is rendered or loaded - no sidebar, no pages - only the notice, which cannot be closed.
  if (maintenance.isMaintenanceActive) {
    return (
      <Box sx={styles.maintenanceContainer}>
        <MaintenanceNoticeDialog open message={maintenance.message} />
      </Box>
    );
  }

  // Hold the app back until the first status check has finished, so it never flashes
  // before a maintenance block.
  if (!maintenance.isChecked) {
    return <Loading text="Loading..." />;
  }

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
