import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Circle, Close, RestoreFromTrash } from '@mui/icons-material';
import { useState, useCallback } from 'react';
import { FileUpload } from './FileUpload';
import { CollectionSelector } from './CollectionSelector';

// Styling following the same pattern as other components
const styles = {
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: 2,
      minWidth: 600,
      maxWidth: 800,
    },
  },
  dialogTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pb: 1,
  },
  titleText: {
    fontWeight: 600,
    color: '#1a1a1a',
    fontSize: '1.25rem',
  },
  closeButton: {
    color: '#666',
  },
  dialogContent: {
    p: 3,
  },
  section: {
    mb: 3,
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#1a1a1a',
    mb: 2,
    fontSize: '1rem',
  },
  validationSection: {
    mt: 2,
  },
  validationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 1,
  },
  validationIcon: {
    fontSize: '1.25rem',
  },
  validationText: {
    fontSize: '0.9rem',
  },
  actionsContainer: {
    p: 3,
    pt: 0,
    display: 'flex',
    gap: 2,
    justifyContent: 'flex-end',
  },
  restoreButton: {
    minWidth: 150,
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  alertContainer: {
    mb: 2,
  },
  alertTitle: {
    fontWeight: 600,
    mb: 1,
  },
  alertBody: {
    fontSize: '0.9rem',
  },
  circleIcon: {
    fontSize: '0.5rem',
  },
};

type RestoreModalProps = Readonly<{
  open: boolean;
  onClose: () => void;
  onRestore: (file: File, selectedCollections: string[]) => Promise<void>;
}>;

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  collections: string[];
  totalDocuments: number;
}

export function RestoreModal({ open, onClose, onRestore }: RestoreModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const validateFile = useCallback(async (file: File) => {
    setIsValidating(true);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const validation: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        collections: [],
        totalDocuments: 0,
      };

      // Check if it's a valid backup file structure
      if (!data.metadata) {
        validation.errors.push('Invalid backup file: Missing metadata section');
        validation.isValid = false;
      }

      if (!data.collections) {
        validation.errors.push(
          'Invalid backup file: Missing collections section'
        );
        validation.isValid = false;
      }

      if (validation.isValid) {
        // Validate metadata
        if (!data.metadata.backupDate) {
          validation.warnings.push('Backup date not found in metadata');
        }

        if (
          !data.metadata.collections ||
          !Array.isArray(data.metadata.collections)
        ) {
          validation.warnings.push('Collections list not found in metadata');
        }

        // Validate collections
        const expectedCollections = [
          'activities',
          'projectInfo',
          'practiceInfo',
        ];
        const foundCollections: string[] = [];

        for (const [collectionName, collectionData] of Object.entries(
          data.collections
        )) {
          if (typeof collectionData === 'object' && collectionData !== null) {
            const collection = collectionData as {
              count?: number;
              documents?: unknown[];
              error?: string;
            };

            if (collection.error) {
              validation.warnings.push(
                `Collection '${collectionName}' has errors: ${collection.error}`
              );
            } else if (
              collection.documents &&
              Array.isArray(collection.documents)
            ) {
              foundCollections.push(collectionName);
              validation.totalDocuments += collection.documents.length;

              // Validate document structure
              collection.documents.forEach((doc, index) => {
                if (typeof doc !== 'object' || doc === null) {
                  validation.warnings.push(
                    `Invalid document at index ${index} in collection '${collectionName}'`
                  );
                } else if (!('id' in doc)) {
                  validation.warnings.push(
                    `Document at index ${index} in collection '${collectionName}' missing ID`
                  );
                }
              });
            } else {
              validation.warnings.push(
                `Collection '${collectionName}' has no documents or invalid structure`
              );
            }
          }
        }

        validation.collections = foundCollections;

        // Check for unexpected collections
        const unexpectedCollections = foundCollections.filter(
          (col) => !expectedCollections.includes(col)
        );
        if (unexpectedCollections.length > 0) {
          validation.warnings.push(
            `Unexpected collections found: ${unexpectedCollections.join(', ')}`
          );
        }

        // Set default selected collections to all found collections
        setSelectedCollections(foundCollections);
      }

      setValidationResult(validation);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: [
          'Invalid JSON file: ' +
            (error instanceof Error ? error.message : 'Unknown error'),
        ],
        warnings: [],
        collections: [],
        totalDocuments: 0,
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (file.type !== 'application/json') {
        alert('Please select a valid JSON file.');
        return;
      }

      setSelectedFile(file);
      setValidationResult(null);
      setSelectedCollections([]);
      validateFile(file);
    },
    [validateFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setValidationResult(null);
    setSelectedCollections([]);
  }, []);

  const handleCollectionChange = useCallback((collections: string[]) => {
    setSelectedCollections(collections);
  }, []);

  const handleRestore = useCallback(async () => {
    if (
      !selectedFile ||
      !validationResult?.isValid ||
      selectedCollections.length === 0
    ) {
      return;
    }

    setIsRestoring(true);
    try {
      await onRestore(selectedFile, selectedCollections);
      onClose();
    } catch (error) {
      console.error('Restore failed:', error);
    } finally {
      setIsRestoring(false);
    }
  }, [selectedFile, validationResult, selectedCollections, onRestore, onClose]);

  const handleClose = useCallback(() => {
    if (!isRestoring) {
      setSelectedFile(null);
      setValidationResult(null);
      setSelectedCollections([]);
      onClose();
    }
  }, [isRestoring, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      sx={styles.dialog}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <Typography sx={styles.titleText}>Restore Data from Backup</Typography>
        <IconButton
          onClick={handleClose}
          disabled={isRestoring}
          sx={styles.closeButton}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={styles.dialogContent}>
        {/* File Upload Section */}
        <Box sx={styles.section}>
          <Typography sx={styles.sectionTitle}>
            1. Upload Backup File
          </Typography>

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onRemoveFile={handleRemoveFile}
            disabled={isValidating ?? isRestoring}
            accept=".json"
          />
        </Box>

        {/* Validation Section */}
        {isValidating && (
          <Box sx={styles.section}>
            <Box sx={styles.loadingContainer}>
              <CircularProgress size={20} />
              <Typography>Validating backup file...</Typography>
            </Box>
          </Box>
        )}

        {validationResult && (
          <Box sx={styles.section}>
            <Typography sx={styles.sectionTitle}>
              2. Validation Results
            </Typography>

            {validationResult.errors.length > 0 && (
              <Alert severity="error" sx={styles.alertContainer}>
                <Typography variant="subtitle2" sx={styles.alertTitle}>
                  Errors Found:
                </Typography>
                {validationResult.errors.map((error, index) => (
                  <Typography
                    key={`${index}-${error}`}
                    variant="body2"
                    sx={styles.alertBody}
                  >
                    <Circle style={styles.circleIcon} /> {error}
                  </Typography>
                ))}
              </Alert>
            )}

            {validationResult.warnings.length > 0 && (
              <Alert severity="warning" sx={styles.alertContainer}>
                <Typography variant="subtitle2" sx={styles.alertTitle}>
                  Warnings:
                </Typography>
                {validationResult.warnings.map((warning, index) => (
                  <Typography
                    key={`${index}-${warning}`}
                    variant="body2"
                    sx={styles.alertBody}
                  >
                    <Circle style={styles.circleIcon} /> {warning}
                  </Typography>
                ))}
              </Alert>
            )}

            {validationResult.isValid && (
              <Alert severity="success" sx={styles.alertContainer}>
                <Typography variant="subtitle2" sx={styles.alertTitle}>
                  File Validation Successful
                </Typography>
                <Typography variant="body2" sx={styles.alertBody}>
                  {`Found ${validationResult.collections.length} collections with ${validationResult.totalDocuments} total documents`}
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {/* Collection Selection Section */}
        {validationResult?.isValid &&
          validationResult.collections.length > 0 && (
            <Box sx={styles.section}>
              <Typography sx={styles.sectionTitle}>
                3. Select Collections to Restore
              </Typography>

              <CollectionSelector
                collections={validationResult.collections}
                selectedCollections={selectedCollections}
                onSelectionChange={handleCollectionChange}
                disabled={isRestoring}
              />
            </Box>
          )}
      </DialogContent>

      <DialogActions sx={styles.actionsContainer}>
        <Button onClick={handleClose} disabled={isRestoring}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleRestore}
          disabled={
            !selectedFile ||
            !validationResult?.isValid ||
            selectedCollections.length === 0 ||
            isRestoring
          }
          startIcon={
            isRestoring ? <CircularProgress size={16} /> : <RestoreFromTrash />
          }
          sx={styles.restoreButton}
        >
          {isRestoring ? 'Restoring...' : 'Start Restore Process'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
