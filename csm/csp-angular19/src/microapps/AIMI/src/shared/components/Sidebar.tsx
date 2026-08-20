import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  Assessment,
  Backup,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@auth/hooks/useAuth';
import { UserProfile } from '@auth/components/UserProfile';
import { useFeatureFlags } from '@shared/hooks/useFeatureFlags';
import aiLogo from '../assets/ai-4.png';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const DRAWER_WIDTH = 300;
const COLLAPSED_WIDTH = 90;

const styles = {
  sidebar: (isOpen: boolean) => ({
    width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
    height: '100vh',
    background: 'linear-gradient(180deg, #764ba2 0%, #667eea 100%)',
    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'width 0.2s ease-in-out',
    overflowX: 'hidden',
    overflowY: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 1200,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    minHeight: 64,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  logo: (isOpen: boolean) => ({
    width: isOpen ? 100 : 40,
    height: isOpen ? 100 : 40,
    backgroundImage: `url(${aiLogo})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
  }),
  brandTextContainer: (isOpen: boolean) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
    overflow: 'hidden',
    maxHeight: isOpen ? '100px' : '0px',
  }),
  brandTitle: {
    fontWeight: 700,
    color: 'white',
    fontSize: '1.1rem',
    lineHeight: 1.2,
    mb: 0.5,
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '0.8rem',
    lineHeight: 1.2,
  },

  navList: {
    pt: 1,
    flexGrow: 1,
  },
  navItem: {
    mx: 1,
    mb: 0.5,
    borderRadius: 1,
  },
  navButton: (isActive: boolean) => ({
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    '&:hover': {
      backgroundColor: isActive
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(255, 255, 255, 0.1)',
    },
    minHeight: 48,
    px: '26px',
  }),
  navIcon: (isActive: boolean) => ({
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
    minWidth: 40,
  }),
  navText: (isActive: boolean, isOpen: boolean) => ({
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)',
    fontWeight: isActive ? 600 : 400,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateX(0)' : 'translateX(10px)',
    transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  }),
  badge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#f44336',
      color: 'white',
      fontSize: '0.75rem',
    },
  },
  userSection: {
    p: 2,
    pl: '26px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleSection: {
    p: 0,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  toggleButton: {
    color: 'rgba(255, 255, 255, 0.8)',
    width: '100%',
    borderRadius: 0,
    py: 1.5,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
};

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get feature flags for navigation
  const dashboardFlags = useFeatureFlags('dashboard');
  const activitiesFlags = useFeatureFlags('activities');
  const reportsFlags = useFeatureFlags('reports');
  const backupFlags = useFeatureFlags('backup');

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Dashboard />,
      badge: null,
      enabled: dashboardFlags.enabled,
    },
    {
      label: 'Manage Activities',
      path: '/activities',
      icon: <Assignment />,
      badge: null,
      enabled: activitiesFlags.enabled,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <Assessment />,
      badge: null,
      enabled: reportsFlags.enabled,
    },
    {
      label: 'Data Backup',
      path: '/backup',
      icon: <Backup />,
      badge: null,
      enabled: backupFlags.enabled,
    },
  ].filter((item) => item.enabled);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={styles.sidebar(isOpen)}>
      {/* Header */}
      <Box sx={styles.header}>
        <Box sx={styles.logoContainer}>
          <Box sx={styles.logo(isOpen)} />
          <Box sx={styles.brandTextContainer(isOpen)}>
            <Typography sx={styles.brandTitle}>AI Maturity Index</Typography>
            <Typography sx={styles.brandSubtitle}>
              Track and measure AI adoption
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Items */}
      <List sx={styles.navList}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={styles.navItem}>
              <Tooltip
                title={!isOpen ? item.label : ''}
                placement="right"
                disableHoverListener={isOpen}
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={styles.navButton(isActive)}
                >
                  <ListItemIcon sx={styles.navIcon(isActive)}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} sx={styles.badge}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={styles.navText(isActive, isOpen)}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile Section */}
      {user && (
        <Box sx={styles.userSection}>
          <UserProfile isLoading={false} compact={!isOpen} />
        </Box>
      )}

      {/* Toggle Button */}
      <Box sx={styles.toggleSection}>
        <IconButton onClick={onToggle} sx={styles.toggleButton} size="small">
          {isOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Box>
    </Box>
  );
};

export { Sidebar };
