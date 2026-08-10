import { Box, Typography, IconButton } from '@mui/material';
import { CloudUpload, RestoreFromTrash, Close } from '@mui/icons-material';
import { useState, useCallback, useRef } from 'react';
import { sharedStyles } from '../styles/sharedStyles';

type FileUploadProps = Readonly<{
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onRemoveFile: () => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
}>;

const styles = {
  uploadArea: {
    border: `2px dashed ${sharedStyles.colors.border.light}`,
    borderRadius: 2,
    p: 3,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease-in-out',
    '&:hover': {
      borderColor: sharedStyles.colors.primary,
    },
  },
  uploadAreaDragOver: {
    borderColor: sharedStyles.colors.primary,
    backgroundColor: sharedStyles.colors.background.hover,
  },
  uploadIcon: {
    fontSize: '3rem',
    color: sharedStyles.colors.text.secondary,
    mb: 1,
  },
  uploadText: {
    color: sharedStyles.colors.text.secondary,
    mb: 1,
  },
  uploadSubtext: {
    color: sharedStyles.colors.text.disabled,
    fontSize: '0.875rem',
  },
  fileInput: {
    display: 'none',
  },
  selectedFile: {
    p: 2,
    borderRadius: 2,
    bgcolor: sharedStyles.colors.background.light,
    border: `1px solid ${sharedStyles.colors.border.medium}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  },
  fileName: {
    fontWeight: 500,
    color: sharedStyles.colors.text.primary,
  },
  fileSize: {
    color: sharedStyles.colors.text.secondary,
    fontSize: '0.875rem',
  },
  removeButton: {
    color: sharedStyles.colors.error,
    p: 0.5,
  },
};

export function FileUpload({
  selectedFile,
  onFileSelect,
  onRemoveFile,
  disabled = false,
  accept = '.json',
  maxSize = 10 * 1024 * 1024, // 10MB default
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (file.size > maxSize) {
          alert(
            `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
          );
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        if (file.size > maxSize) {
          alert(
            `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
          );
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const handleUploadClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleRemoveFile = useCallback(() => {
    if (!disabled) {
      onRemoveFile();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onRemoveFile, disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {!selectedFile ? (
        <Box
          sx={[styles.uploadArea, dragOver && styles.uploadAreaDragOver]}
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudUpload sx={styles.uploadIcon} />
          <Typography sx={styles.uploadText}>
            Click to upload or drag and drop your backup file
          </Typography>
          <Typography sx={styles.uploadSubtext}>
            Only JSON files are supported (max{' '}
            {Math.round(maxSize / 1024 / 1024)}MB)
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            style={styles.fileInput}
            disabled={disabled}
          />
        </Box>
      ) : (
        <Box sx={styles.selectedFile}>
          <Box sx={styles.fileInfo}>
            <RestoreFromTrash color="primary" />
            <Box>
              <Typography sx={styles.fileName}>{selectedFile.name}</Typography>
              <Typography sx={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleRemoveFile}
            disabled={disabled}
            sx={styles.removeButton}
          >
            <Close />
          </IconButton>
        </Box>
      )}
    </>
  );
}
