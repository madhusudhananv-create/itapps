import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Assessment,
  BusinessRounded,
  AccountBalanceRounded,
  FolderRounded,
  PsychologyRounded,
} from '@mui/icons-material';
import { useMemo, memo } from 'react';
import { MultiSelectDropdown } from '../../../shared/components/MultiSelectDropdown';
import { useReports } from '../hooks/useReports';
import { CommonSnackbar } from '../../../shared/components/CommonSnackbar';

// Global styling object
const styles = {
  paper: {
    p: 3,
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
  formHeader: {
    mb: 4,
    fontWeight: 600,
    color: '#333',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 4,
    mb: 4,
  },
  icon: {
    color: '#667eea',
    mr: 1,
  },
  generateButton: {
    borderRadius: 2,
    textTransform: 'none',
    fontWeight: 500,
    px: 4,
    py: 1.5,
    fontSize: '1rem',
    background: 'linear-gradient(135deg, #0066FF 0%, #0052CC 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #0052CC 0%, #003D99 100%)',
    },
    '&:disabled': {
      background: '#ccc',
      color: '#666',
    },
  },
};

// Memoized icons to prevent re-renders
const BusinessUnitIcon = memo(() => <BusinessRounded sx={styles.icon} />);
const AccountIcon = memo(() => <AccountBalanceRounded sx={styles.icon} />);
const ProjectIcon = memo(() => <FolderRounded sx={styles.icon} />);
const PracticeIcon = memo(() => <PsychologyRounded sx={styles.icon} />);

BusinessUnitIcon.displayName = 'BusinessUnitIcon';
AccountIcon.displayName = 'AccountIcon';
ProjectIcon.displayName = 'ProjectIcon';
PracticeIcon.displayName = 'PracticeIcon';

export const Reports = memo(() => {
  // Use custom hook for all reports logic
  const {
    // Form data and state
    formData,
    searchTerms,

    // Available options
    businessUnits,
    availableAccounts,
    availableProjects,
    questionnairePractices,

    // Handlers
    handleSearchChange,
    handleFieldChange,
    handleGenerateReports,
    closeSnackbar,

    // UI state
    isGenerating,
    isGenerateEnabled,
    snackbar,
  } = useReports();

  // Memoized dropdown props to prevent unnecessary re-renders
  const businessUnitProps = useMemo(
    () => ({
      label: 'Business Unit',
      icon: <BusinessUnitIcon />,
      options: businessUnits,
      selected: formData.businessUnits,
      searchTerm: searchTerms.businessUnits,
      onSelectionChange: (value: string[]) =>
        handleFieldChange('businessUnits', value),
      onSearchChange: (value: string) =>
        handleSearchChange('businessUnits', value),
    }),
    [
      businessUnits,
      formData.businessUnits,
      searchTerms.businessUnits,
      handleFieldChange,
      handleSearchChange,
    ]
  );

  const accountProps = useMemo(
    () => ({
      label: 'Account',
      icon: <AccountIcon />,
      options: availableAccounts,
      selected: formData.accounts,
      searchTerm: searchTerms.accounts,
      onSelectionChange: (value: string[]) =>
        handleFieldChange('accounts', value),
      onSearchChange: (value: string) => handleSearchChange('accounts', value),
      disabled: formData.businessUnits.length === 0,
    }),
    [
      availableAccounts,
      formData.accounts,
      formData.businessUnits.length,
      searchTerms.accounts,
      handleFieldChange,
      handleSearchChange,
    ]
  );

  const projectProps = useMemo(
    () => ({
      label: 'Project',
      icon: <ProjectIcon />,
      options: availableProjects,
      selected: formData.projects,
      searchTerm: searchTerms.projects,
      onSelectionChange: (value: string[]) =>
        handleFieldChange('projects', value),
      onSearchChange: (value: string) => handleSearchChange('projects', value),
      disabled: formData.accounts.length === 0,
    }),
    [
      availableProjects,
      formData.projects,
      formData.accounts.length,
      searchTerms.projects,
      handleFieldChange,
      handleSearchChange,
    ]
  );

  const practiceProps = useMemo(
    () => ({
      label: 'Practice',
      icon: <PracticeIcon />,
      options: questionnairePractices,
      selected: formData.practices,
      searchTerm: searchTerms.practices,
      onSelectionChange: (value: string[]) =>
        handleFieldChange('practices', value),
      onSearchChange: (value: string) => handleSearchChange('practices', value),
    }),
    [
      questionnairePractices,
      formData.practices,
      searchTerms.practices,
      handleFieldChange,
      handleSearchChange,
    ]
  );

  return (
    <Box>
      {/* Reports Header */}
      <Box sx={styles.headerContainer}>
        <Box sx={styles.headerTitleContainer}>
          <Typography variant="body1" sx={styles.headerTitle}>
            Reports
          </Typography>
        </Box>
        <Typography variant="body1" sx={styles.headerDescription}>
          Generate comprehensive reports based on your selected filters
        </Typography>
      </Box>

      {/* Reports Form */}
      <Paper elevation={2} sx={styles.paper}>
        {/* Form Header */}
        <Typography
          variant="body1"
          sx={{ ...styles.formHeader, fontSize: '1.1rem' }}
        >
          Project Information
        </Typography>

        <Box sx={styles.formGrid}>
          {/* Business Unit Multi-Select */}
          <MultiSelectDropdown {...businessUnitProps} />

          {/* Account Multi-Select */}
          <MultiSelectDropdown {...accountProps} />

          {/* Project Multi-Select */}
          <MultiSelectDropdown {...projectProps} />

          {/* Practice Multi-Select */}
          <MultiSelectDropdown {...practiceProps} />
        </Box>

        {/* Generate Reports Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleGenerateReports}
            disabled={!isGenerateEnabled || isGenerating}
            startIcon={
              isGenerating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Assessment />
              )
            }
            sx={styles.generateButton}
          >
            {isGenerating ? 'Generating...' : 'Generate Reports'}
          </Button>
        </Box>
      </Paper>

      {/* Success/Error Message Snackbar */}
      <CommonSnackbar
        open={snackbar.open}
        onClose={closeSnackbar}
        message={snackbar.message}
        severity={snackbar.severity}
      />
    </Box>
  );
});

Reports.displayName = 'Reports';
