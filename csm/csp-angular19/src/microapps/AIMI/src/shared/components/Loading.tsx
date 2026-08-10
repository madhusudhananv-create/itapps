import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  size?: number;
  text?: string;
  fullScreen?: boolean;
  color?: string;
  bgColor?: string;
}

// Global styles object
const styles = {
  container: (fullScreen: boolean, bgColor: string) => ({
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      minHeight: '100vh',
      background: bgColor,
    }),
    ...(!fullScreen && {
      py: 4,
    }),
  }),
  circularProgress: (color: string) => ({
    color,
    mb: 2,
  }),
  typography: (fullScreen: boolean, color: string) => ({
    fontSize: fullScreen ? '1.25rem' : '1rem',
    fontWeight: 500,
    color,
  }),
};

export const Loading = ({
  size = 60,
  text = 'Loading...',
  fullScreen = true,
  color = 'text.secondary',
  bgColor = '#f5f5f5',
}: LoadingProps) => {
  return (
    <Box sx={styles.container(fullScreen, bgColor)}>
      <CircularProgress size={size} sx={styles.circularProgress(color)} />
      <Typography variant="h6" sx={styles.typography(fullScreen, color)}>
        {text}
      </Typography>
    </Box>
  );
};
