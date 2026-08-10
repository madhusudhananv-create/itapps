import { Box, Typography, CircularProgress } from '@mui/material';
import { CheckCircle, Error } from '@mui/icons-material';
import { sharedStyles } from '../styles/sharedStyles';

type StatusDisplayProps = Readonly<{
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
}>;

export function StatusDisplay({
  isLoading,
  isSuccess,
  isError,
  message,
}: StatusDisplayProps) {
  const getStatusIcon = () => {
    if (isLoading) {
      return <CircularProgress size={24} />;
    }
    if (isSuccess) {
      return (
        <CheckCircle
          sx={{
            ...sharedStyles.status.icon,
            color: sharedStyles.colors.success,
          }}
        />
      );
    }
    if (isError) {
      return (
        <Error
          sx={{ ...sharedStyles.status.icon, color: sharedStyles.colors.error }}
        />
      );
    }
    return null;
  };

  const getStatusTextStyle = () => {
    if (isSuccess)
      return {
        ...sharedStyles.status.text,
        color: sharedStyles.colors.success,
      };
    if (isError)
      return { ...sharedStyles.status.text, color: sharedStyles.colors.error };
    return {
      ...sharedStyles.status.text,
      color: sharedStyles.colors.text.secondary,
    };
  };

  if (!isLoading && !isSuccess && !isError) {
    return null;
  }

  return (
    <Box sx={sharedStyles.status.container}>
      {getStatusIcon()}
      <Typography variant="body2" sx={getStatusTextStyle()}>
        {message}
      </Typography>
    </Box>
  );
}
