import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material';

interface MaintenanceNoticeDialogProps {
  open: boolean;
  message: string;
}

// Shown while the AIMI_MAINTENANCE row is active in CONFIGURATION_EXT. It cannot be closed
// (no button, Escape and backdrop clicks are ignored): access stays blocked until the row is
// deactivated. Styled like LoginRequiredDialog so the app's popups look the same.
export function MaintenanceNoticeDialog({
  open,
  message,
}: Readonly<MaintenanceNoticeDialogProps>) {
  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      onClose={() => undefined}
      PaperProps={{
        sx: {
          borderRadius: '14px',
          padding: '0.5rem 0.25rem 1rem',
          maxWidth: '480px',
          width: '90%',
          textAlign: 'center',
        },
      }}
    >
      <DialogTitle
        sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#1f2937' }}
      >
        Maintenance Notice
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ fontSize: '0.95rem', lineHeight: 1.5, color: '#4b5563' }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
