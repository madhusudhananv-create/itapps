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
  Insights,
  Backup,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { keyframes } from '@mui/material/styles';
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
const GAP = 12; // floating inset around the panel (Layout margins still use the full widths)

// Apple-style motion: a spring-like ease-out used for every transition in the panel
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SF_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, sans-serif";

// Fixed row metrics so the active "pill" can slide to an item by index
const NAV_ITEM_HEIGHT = 48;
const NAV_ITEM_GAP = 4;
const NAV_LIST_PADDING = 8;

const itemEnter = keyframes`
  from { opacity: 0; transform: translateX(-14px); }
  to { opacity: 1; transform: translateX(0); }
`;

const panelEnter = keyframes`
  from { opacity: 0; transform: translateX(-16px) scale(0.98); }
  to { opacity: 1; transform: translateX(0) scale(1); }
`;

const glassBorder = '1px solid rgba(255, 255, 255, 0.18)';

const styles = {
  sidebar: (isOpen: boolean) => ({
    width: (isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH) - GAP * 2,
    height: `calc(100vh - ${GAP * 2}px)`,
    top: GAP,
    left: GAP,
    background:
      'linear-gradient(160deg, rgba(118, 75, 162, 0.78) 0%, rgba(102, 126, 234, 0.78) 100%)',
    backdropFilter: 'saturate(180%) blur(28px)',
    WebkitBackdropFilter: 'saturate(180%) blur(28px)',
    border: glassBorder,
    borderRadius: '24px',
    boxShadow:
      '0 20px 50px rgba(60, 40, 120, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.28)',
    transition: `width 0.5s ${EASE}`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'fixed',
    zIndex: 1200,
    fontFamily: SF_FONT,
    animation: `${panelEnter} 0.6s ${EASE} both`,
  }),
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pt: 2.5,
    pb: 1.5,
    px: 2,
    minHeight: 64,
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  logo: (isOpen: boolean) => ({
    width: isOpen ? 88 : 40,
    height: isOpen ? 88 : 40,
    backgroundImage: `url(${aiLogo})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    filter: 'drop-shadow(0 6px 14px rgba(0, 0, 0, 0.22))',
    transition: `width 0.5s ${EASE}, height 0.5s ${EASE}`,
    flexShrink: 0,
    '@media (max-height: 760px)': {
      width: isOpen ? 56 : 36,
      height: isOpen ? 56 : 36,
    },
  }),
  brandTextContainer: (isOpen: boolean) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateY(0)' : 'translateY(-8px)',
    transition: `opacity 0.4s ${EASE}, transform 0.5s ${EASE}, max-height 0.5s ${EASE}, margin-top 0.5s ${EASE}`,
    overflow: 'hidden',
    maxHeight: isOpen ? '90px' : '0px',
    mt: isOpen ? 1 : 0,
  }),
  brandTitle: {
    fontFamily: SF_FONT,
    fontWeight: 600,
    color: 'white',
    fontSize: '1.05rem',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
    mb: 0.25,
  },
  brandSubtitle: {
    fontFamily: SF_FONT,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.78rem',
    lineHeight: 1.3,
  },

  navWrapper: {
    position: 'relative',
    flexGrow: 1,
    mt: 1,
    // Short windows (e.g. DevTools docked): let the menu scroll instead of clipping the panel
    minHeight: 0,
    overflowY: 'auto',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  navList: {
    p: `${NAV_LIST_PADDING}px 0`,
    position: 'relative',
    zIndex: 1,
  },
  // Single highlight that glides between items (iOS segmented-control feel)
  activeIndicator: (index: number) => ({
    position: 'absolute',
    left: 8,
    right: 8,
    top: NAV_LIST_PADDING + Math.max(index, 0) * (NAV_ITEM_HEIGHT + NAV_ITEM_GAP),
    height: NAV_ITEM_HEIGHT,
    borderRadius: '14px',
    background: 'rgba(255, 255, 255, 0.24)',
    border: '1px solid rgba(255, 255, 255, 0.28)',
    boxShadow:
      '0 6px 18px rgba(40, 20, 90, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
    opacity: index < 0 ? 0 : 1,
    transform: index < 0 ? 'scale(0.9)' : 'scale(1)',
    transition: `top 0.5s ${EASE}, opacity 0.3s ${EASE}, transform 0.4s ${EASE}`,
    pointerEvents: 'none',
    zIndex: 0,
  }),
  navItem: (order: number) => ({
    mx: 1,
    mb: `${NAV_ITEM_GAP}px`,
    width: 'auto',
    animation: `${itemEnter} 0.55s ${EASE} both`,
    animationDelay: `${0.12 + order * 0.07}s`,
  }),
  navButton: (isActive: boolean) => ({
    height: NAV_ITEM_HEIGHT,
    minHeight: NAV_ITEM_HEIGHT,
    borderRadius: '14px',
    px: '5px',
    color: isActive ? 'white' : 'rgba(255, 255, 255, 0.78)',
    transition: `background-color 0.25s ${EASE}, transform 0.25s ${EASE}, color 0.25s ${EASE}`,
    '&:hover': {
      backgroundColor: isActive ? 'transparent' : 'rgba(255, 255, 255, 0.12)',
      color: 'white',
      transform: 'translateX(2px)',
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
    '&:hover .nav-icon': {
      transform: 'scale(1.12)',
    },
  }),
  navIcon: (isActive: boolean) => ({
    color: 'inherit',
    minWidth: 40,
    width: 40,
    justifyContent: 'center',
    transition: `transform 0.3s ${EASE}`,
    transform: isActive ? 'scale(1.08)' : 'scale(1)',
  }),
  navText: (isActive: boolean, isOpen: boolean) => ({
    m: 0,
    ml: 0.5,
    '& .MuiTypography-root': {
      fontFamily: SF_FONT,
      fontSize: '0.95rem',
      letterSpacing: '-0.01em',
      color: 'inherit',
      fontWeight: isActive ? 600 : 500,
      whiteSpace: 'nowrap',
    },
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'translateX(0)' : 'translateX(-8px)',
    transition: `opacity 0.35s ${EASE}, transform 0.45s ${EASE}`,
    overflow: 'hidden',
  }),
  badge: {
    '& .MuiBadge-badge': {
      backgroundColor: '#ff453a',
      color: 'white',
      fontSize: '0.72rem',
    },
  },
  userSection: (isOpen: boolean) => ({
    mx: 1,
    mb: 1,
    p: 1,
    pl: isOpen ? 1.25 : '5px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.12)',
    border: glassBorder,
    transition: `background-color 0.25s ${EASE}, padding 0.5s ${EASE}`,
    '&:hover': { background: 'rgba(255, 255, 255, 0.18)' },
    display: 'flex',
    justifyContent: isOpen ? 'flex-start' : 'center',
  }),
  toggleSection: {
    display: 'flex',
    justifyContent: 'center',
    pb: 1.5,
  },
  toggleButton: {
    color: 'rgba(255, 255, 255, 0.85)',
    width: 34,
    height: 34,
    background: 'rgba(255, 255, 255, 0.14)',
    border: glassBorder,
    transition: `background-color 0.25s ${EASE}, transform 0.35s ${EASE}`,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.26)',
      transform: 'scale(1.1)',
    },
    '&:active': { transform: 'scale(0.92)' },
  },
};

const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // Get feature flags for navigation
  const dashboardFlags = useFeatureFlags('dashboard');
  const activitiesFlags = useFeatureFlags('activities');
  const reportsFlags = useFeatureFlags('reports');
  const backupFlags = useFeatureFlags('backup');
  const analyticsFlags = useFeatureFlags('analytics');

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
      label: 'Analytics',
      path: '/analytics',
      icon: <Insights />,
      badge: null,
      enabled: analyticsFlags.enabled && isAdmin,
    },
    {
      label: 'Data Backup',
      path: '/backup',
      icon: <Backup />,
      badge: null,
      enabled: backupFlags.enabled && isAdmin,
    },
  ].filter((item) => item.enabled);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const activeIndex = navItems.findIndex(
    (item) => location.pathname === item.path
  );

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
      <Box sx={styles.navWrapper}>
        <Box sx={styles.activeIndicator(activeIndex)} />
        <List sx={styles.navList}>
          {navItems.map((item, order) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.path}
                disablePadding
                sx={styles.navItem(order)}
              >
                <Tooltip
                  title={!isOpen ? item.label : ''}
                  placement="right"
                  disableHoverListener={isOpen}
                  arrow
                >
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={styles.navButton(isActive)}
                  >
                    <ListItemIcon
                      className="nav-icon"
                      sx={styles.navIcon(isActive)}
                    >
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
      </Box>

      {/* User Profile Section */}
      {user && (
        <Box sx={styles.userSection(isOpen)}>
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
