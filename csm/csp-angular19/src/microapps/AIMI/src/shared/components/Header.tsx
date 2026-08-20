import { Box, Container, Typography } from '@mui/material';
import { useAuth } from '@auth/hooks/useAuth';
import { UserProfile } from '@auth/components/UserProfile';

interface HeaderProps {
  isLoading?: boolean;
}

// Global styles object
const styles = {
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    py: 3,
    px: 4,
    position: 'relative' as const,
  },
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontWeight: 700,
    mb: 0.5,
  },
  headerSubtitle: {
    opacity: 0.9,
    fontSize: '0.9rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
};

const Header = ({ isLoading = false }: HeaderProps) => {
  const { user } = useAuth();

  return (
    <Box sx={styles.header}>
      <Container maxWidth="xl">
        <Box sx={styles.headerContainer}>
          {/* Left side - Application Title */}
          <Box sx={styles.headerLeft}>
            <Typography variant="h4" sx={styles.headerTitle}>
              AI Maturity Index Platform
            </Typography>
            <Typography variant="body2" sx={styles.headerSubtitle}>
              Track and measure AI adoption
            </Typography>
          </Box>

          {/* Right side - Scoring Guidelines Button and Profile Avatar */}
          <Box sx={styles.headerRight}>
            {user && <UserProfile isLoading={isLoading} />}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export { Header };
