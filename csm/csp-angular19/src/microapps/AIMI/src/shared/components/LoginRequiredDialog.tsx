import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface LoginRequiredDialogProps {
  open: boolean;
  redirectUrl?: string;
}

// Styled to match the equivalent popup in the CSAT Analysis Dashboard microapp
// (see CSAT-Analysis-Dashboard/src/services/reportsApi.js: showLoginRequiredPopup)
// so both apps present the same "not logged in" experience.
export function LoginRequiredDialog({
  open,
  redirectUrl = '/login',
}: Readonly<LoginRequiredDialogProps>) {
  const goToLogin = () => {
    window.location.href = redirectUrl;
  };

  return (
    <Dialog
      open={open}
      onClose={goToLogin}
      PaperProps={{
        sx: {
          borderRadius: '14px',
          padding: '0.5rem 0.25rem',
          maxWidth: '440px',
          width: '90%',
          textAlign: 'center',
        },
      }}
    >
      <DialogTitle
        sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}
      >
        Login Required
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#4b5563' }}
        >
          You're not logged in. Click OK to log in to the CSM Platform Home
          screen, then
          open this app from Integrated Apps in the navbar.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', paddingBottom: '1.5rem' }}>
        <Button
          onClick={goToLogin}
          autoFocus
          sx={{
            background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
            color: '#ffffff',
            borderRadius: '8px',
            padding: '0.65rem 2.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': {
              background: 'linear-gradient(135deg,#5a67d8 0%,#6b46a3 100%)',
            },
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
