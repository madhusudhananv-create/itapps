import {
  Box,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from '@mui/material';
import { Person, AccountCircle, LogoutRounded } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

// Global styles object
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    bgcolor: 'rgba(255, 255, 255, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      border: '2px solid rgba(255, 255, 255, 0.8)',
      bgcolor: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(1.05)',
    },
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    py: 1.5,
    px: 2,
    minHeight: 48,
    '&:hover': {
      bgcolor: 'rgba(103, 126, 234, 0.08)',
    },
  },
  userInfoItem: {
    pointerEvents: 'none',
    opacity: 0.9,
    py: 2,
    px: 2,
    minHeight: 60,
    bgcolor: 'rgba(103, 126, 234, 0.05)',
  },
  logoutMenuItem: {
    color: '#d32f2f',
    '&:hover': {
      bgcolor: 'rgba(211, 47, 47, 0.08)',
    },
  },
  userAvatar: {
    width: 32,
    height: 32,
    bgcolor: 'primary.main',
    fontSize: '0.875rem',
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  userInfoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  userName: {
    fontWeight: 600,
    color: 'text.primary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  userEmail: {
    color: 'text.secondary',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  menuPaper: {
    mt: 1,
    minWidth: 240,
    maxWidth: 280,
    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
    borderRadius: 2,
    border: '1px solid rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  logoutText: {
    fontWeight: 500,
  },
};

type UserProfileProps = Readonly<{
  isLoading?: boolean;
  compact?: boolean;
}>;

export function UserProfile({
  isLoading = false,
  compact = false,
}: UserProfileProps) {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!user) {
    return null;
  }

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      handleClose();
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: compact ? 0 : 1,
          width: '100%',
        }}
      >
        <IconButton
          onClick={handleProfileClick}
          sx={{
            p: 0,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          disabled={authLoading ?? isLoading}
        >
          <Avatar
            src={user.image}
            alt={user.name}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                border: '2px solid rgba(255, 255, 255, 0.8)',
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                transform: 'scale(1.05)',
              },
            }}
          >
            {!user.image && <Person />}
          </Avatar>
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            opacity: compact ? 0 : 1,
            transform: compact ? 'translateX(20px)' : 'translateX(0)',
            transition: 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '0.875rem',
            }}
          >
            {user.name}
          </Typography>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: styles.menuPaper,
        }}
      >
        {/* User Info Section */}
        <MenuItem sx={styles.userInfoItem}>
          <Box sx={styles.userInfoContainer}>
            <Avatar src={user.image} alt={user.name} sx={styles.userAvatar}>
              {!user.image && <AccountCircle />}
            </Avatar>
            <Box sx={styles.userInfoTextContainer}>
              <Typography variant="subtitle2" sx={styles.userName}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={styles.userEmail}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        {/* Logout Option */}
        <MenuItem
          onClick={handleLogout}
          disabled={authLoading}
          sx={{ ...styles.menuItem, ...styles.logoutMenuItem }}
        >
          <>
            <LogoutRounded fontSize="small" />
            <Typography variant="body2" sx={styles.logoutText}>
              Sign Out
            </Typography>
          </>
        </MenuItem>
      </Menu>
    </>
  );
}
