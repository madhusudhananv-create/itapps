import { Box, Paper, Typography, Button, Alert } from '@mui/material';
import { Circle, CloudDownload, RestoreFromTrash } from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { CommonSnackbar } from '../../../shared/components/CommonSnackbar';
import { performClientBackup } from '../utils/backupUtils';
import { performRestore } from '../utils/restoreUtils';
import { RestoreModal } from './RestoreModal';
import { StatusDisplay } from './StatusDisplay';

// Global styling object - following the same pattern as Activities.tsx
const styles = {
  paper: {
    p: 3,
    mt: 3,
    borderRadius: 2,
    bgcolor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  headerContainer: {
    mb: 4,
  },
  headerTitleContainer: {
    mb: 2,
  },
  headerTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    fontSize: '1.5rem',
  },
  headerDescription: {
    color: '#666',
    fontSize: '0.95rem',
  },
  backupSection: {
    mt: 3,
  },
  backupButton: {
    py: 1.5,
    px: 3,
    mt: 2,
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 2,
    textTransform: 'none',
    minWidth: 200,
  },
  restoreButton: {
    py: 1.5,
    px: 3,
    mt: 2,
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: 2,
    textTransform: 'none',
    minWidth: 200,
  },
  restoreSection: {
    mt: 3,
  },
  instructions: {
    mt: 2,
    p: 2,
    borderRadius: 2,
    bgcolor: '#f8f9fa',
    border: '1px solid #e9ecef',
  },
  instructionTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    mb: 1,
    fontSize: '0.9rem',
  },
  instructionText: {
    color: '#666',
    fontSize: '0.85rem',
    lineHeight: 1.4,
  },
  statusContainer: {
    mt: 3,
    p: 2,
    borderRadius: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  statusIcon: {
    fontSize: '1.5rem',
  },
  statusText: {
    fontWeight: 500,
  },
  infoTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    mb: 1,
  },
  infoText: {
    color: '#666',
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    mt: 2,
  },
  alertContainer: {
    mt: 2,
  },
  alertTitle: {
    fontWeight: 600,
    mb: 1,
  },
  alertSubtitle: {
    mb: 1,
  },
  alertCollectionTitle: {
    fontWeight: 600,
    mb: 0.5,
  },
  alertCollectionItem: {
    ml: 1,
    fontSize: '0.8rem',
  },
  errorText: {
    color: '#f44336',
  },
  circleIcon: {
    fontSize: '0.5rem',
  },
};

interface BackupStatus {
  isBackingUp: boolean;
  isSuccess: boolean;
  isError: boolean;
  message: string;
  lastBackupDate?: string;
  totalDocuments?: number;
  collections?: Record<string, { count: number; error?: string }>;
}

export function Backup() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus>({
    isBackingUp: false,
    isSuccess: false,
    isError: false,
    message: '',
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  );
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);

  const handleBackup = useCallback(async () => {
    setBackupStatus({
      isBackingUp: true,
      isSuccess: false,
      isError: false,
      message: 'Starting backup process...',
    });

    try {
      // Call the client-side backup function
      const result = await performClientBackup();

      if (result.success) {
        setBackupStatus({
          isBackingUp: false,
          isSuccess: true,
          isError: false,
          message: `Backup completed successfully! Downloaded ${result.totalDocuments} documents.`,
          lastBackupDate: new Date().toISOString(),
          totalDocuments: result.totalDocuments,
          collections: result.collections,
        });

        setSnackbarMessage(
          'Data backup completed and downloaded successfully!'
        );
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw result.message;
      }
    } catch (error) {
      console.error('Backup error:', error);

      setBackupStatus({
        isBackingUp: false,
        isSuccess: false,
        isError: true,
        message: 'Backup failed. Please try again.',
      });

      setSnackbarMessage('Backup failed. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const handleRestoreModalOpen = useCallback(() => {
    setRestoreModalOpen(true);
  }, []);

  const handleRestoreModalClose = useCallback(() => {
    setRestoreModalOpen(false);
  }, []);

  const handleRestore = useCallback(
    async (file: File, selectedCollections: string[]) => {
      try {
        const result = await performRestore(file, selectedCollections);

        if (result.success) {
          setSnackbarMessage(result.message);
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } else {
          setSnackbarMessage(result.message);
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Restore error:', error);
        setSnackbarMessage('Restore failed. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    },
    []
  );

  return (
    <Box>
      {/* Backup Header */}
      <Box sx={styles.headerContainer}>
        <Box sx={styles.headerTitleContainer}>
          <Typography variant="body1" sx={styles.headerTitle}>
            Data Backup
          </Typography>
        </Box>
        <Typography variant="body1" sx={styles.headerDescription}>
          Create backups of your AI maturity data to ensure data safety and
          recovery
        </Typography>
      </Box>

      {/* Backup Section */}
      <Paper elevation={2} sx={styles.paper}>
        <Typography variant="h6" sx={styles.infoTitle}>
          Create Data Backup
        </Typography>
        <Typography variant="body2" sx={styles.infoText}>
          This will create a complete backup of all your activities, project
          information, and practice data. The backup will be downloaded as a
          JSON file to your device and can be used for data recovery or
          migration purposes.
        </Typography>

        {/* Backup Instructions */}
        <Box sx={styles.instructions}>
          <Typography variant="subtitle2" sx={styles.instructionTitle}>
            Backup Information:
          </Typography>
          <Typography variant="body2" sx={styles.instructionText}>
            <Circle style={styles.circleIcon} /> <strong>Data Included:</strong>{' '}
            All activities, project information, and practice data
            <br />
            <Circle style={styles.circleIcon} /> <strong>File Format:</strong>{' '}
            JSON files downloaded to your device
            <br />
            <Circle style={styles.circleIcon} /> <strong>File Naming:</strong>{' '}
            Automatically named with timestamp for easy identification
            <br />
            <Circle style={styles.circleIcon} /> <strong>Process Time:</strong>{' '}
            May take a few minutes depending on data size
            <br />
            <Circle style={styles.circleIcon} /> <strong>Usage:</strong> Can be
            used for data recovery or system migration
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<CloudDownload />}
          onClick={handleBackup}
          disabled={backupStatus.isBackingUp}
          sx={styles.backupButton}
        >
          {backupStatus.isBackingUp ? 'Creating Backup...' : 'Create Backup'}
        </Button>

        {/* Status Display */}
        <StatusDisplay
          isLoading={backupStatus.isBackingUp}
          isSuccess={backupStatus.isSuccess}
          isError={backupStatus.isError}
          message={backupStatus.message}
        />

        {/* Last Backup Info */}
        {backupStatus.lastBackupDate && (
          <Alert severity="success" sx={styles.alertContainer}>
            <Typography variant="body2" sx={styles.alertTitle}>
              Last backup created:{' '}
              {new Date(backupStatus.lastBackupDate).toLocaleString()}
            </Typography>
            {backupStatus.totalDocuments && (
              <Typography variant="body2" sx={styles.alertSubtitle}>
                Total documents backed up: {backupStatus.totalDocuments}
              </Typography>
            )}
            {backupStatus.collections && (
              <Box>
                <Typography variant="body2" sx={styles.alertCollectionTitle}>
                  Collection breakdown:
                </Typography>
                {Object.entries(backupStatus.collections).map(
                  ([collection, stats]) => (
                    <Typography
                      key={collection}
                      variant="body2"
                      sx={styles.alertCollectionItem}
                    >
                      <Circle style={styles.circleIcon} /> {collection}:{' '}
                      {stats.count} documents
                      {stats.error && (
                        <span style={styles.errorText}>
                          ` (Error: ${stats.error})`
                        </span>
                      )}
                    </Typography>
                  )
                )}
              </Box>
            )}
          </Alert>
        )}
      </Paper>

      {/* Restore Section */}
      <Paper elevation={2} sx={styles.paper}>
        <Typography variant="h6" sx={styles.infoTitle}>
          Restore from Backup
        </Typography>
        <Typography variant="body2" sx={styles.infoText}>
          Upload a previously created backup file to restore your data. You can
          select which collections to restore and the process will validate the
          data before restoration.
        </Typography>

        {/* Restore Instructions */}
        <Box sx={styles.instructions}>
          <Typography variant="subtitle2" sx={styles.instructionTitle}>
            Important Instructions:
          </Typography>
          <Typography variant="body2" sx={styles.instructionText}>
            <Circle style={styles.circleIcon} />{' '}
            <strong>Data Validation:</strong> The system will validate your
            backup file before restoration
            <br />
            <Circle style={styles.circleIcon} />{' '}
            <strong>Collection Selection:</strong> Choose which collections to
            restore (all selected by default)
            <br />
            <Circle style={styles.circleIcon} /> <strong>Data Safety:</strong>{' '}
            Existing collections will be completely cleared before restoration
            <br />
            <Circle style={styles.circleIcon} />{' '}
            <strong>Backup Recommended:</strong> Create a backup before
            restoring to avoid data loss
            <br />
            <Circle style={styles.circleIcon} /> <strong>Process Time:</strong>{' '}
            Restoration may take several minutes for large datasets
            <br />
            <Circle style={styles.circleIcon} /> <strong>File Format:</strong>{' '}
            Only JSON backup files created by this system are supported
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RestoreFromTrash />}
          onClick={handleRestoreModalOpen}
          sx={styles.restoreButton}
        >
          Restore from Backup
        </Button>
      </Paper>

      {/* Restore Modal */}
      <RestoreModal
        open={restoreModalOpen}
        onClose={handleRestoreModalClose}
        onRestore={handleRestore}
      />

      {/* Success/Error Message Snackbar */}
      <CommonSnackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </Box>
  );
}
