import { useState, useCallback, useMemo } from 'react';
import { activityService } from '@activities/services/activityService';
import { projectInfoService } from '@shared/projects/services/projectInfoService';
import { practiceInfoService } from '@shared/practices/services/practiceInfoService';
import { generateAndDownloadMultiReport } from '../utils/csvExportUtils';
import {
  enrichActivitiesWithProjectInfo,
  type EnrichedActivityWithProjectInfo,
} from '../utils/activityEnrichmentUtils';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
import { getPracticesFromQuestionnaire } from '@shared/utils/questionnaireUtils';

// Type definitions for the reports form data
type ReportType = 'business-units' | 'accounts' | 'projects';

export interface ReportsFormData {
  businessUnits: string[];
  accounts: string[];
  projects: string[];
  practices: string[];
}

// Type for snackbar state
export interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Type for report generation result
export interface ReportGenerationResult {
  reportType: ReportType;
  selectedItems: string[];
  activitiesCount: number;
}

export const useReports = () => {
  const { projectMapping, getBusinessUnits, getAccounts, getProjects } =
    useProjectHierarchy();

  const questionnairePractices = getPracticesFromQuestionnaire();

  // Form state
  const [formData, setFormData] = useState<ReportsFormData>({
    businessUnits: [],
    accounts: [],
    projects: [],
    practices: [],
  });

  // Search state for each dropdown
  const [searchTerms, setSearchTerms] = useState({
    businessUnits: '',
    accounts: '',
    projects: '',
    practices: '',
  });

  // Loading and notification state
  const [isGenerating, setIsGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Sort activities based on applied filter
  const sortActivitiesByFilter = useCallback(
    (
      activities: EnrichedActivityWithProjectInfo[],
      reportType: 'business-units' | 'accounts' | 'projects'
    ) => {
      return [...activities].sort((a, b) => {
        switch (reportType) {
          case 'business-units': {
            // Sort by business unit, then by account, then by project
            const buComparison = a.businessUnit.localeCompare(b.businessUnit);
            if (buComparison !== 0) return buComparison;

            const accountComparison = a.account.localeCompare(b.account);
            if (accountComparison !== 0) return accountComparison;

            return a.project.localeCompare(b.project);
          }

          case 'accounts': {
            // Sort by account, then by project, then by business unit
            const accComparison = a.account.localeCompare(b.account);
            if (accComparison !== 0) return accComparison;

            const projComparison = a.project.localeCompare(b.project);
            if (projComparison !== 0) return projComparison;

            return a.businessUnit.localeCompare(b.businessUnit);
          }

          case 'projects': {
            // Sort by project, then by account, then by business unit
            const projectComparison = a.project.localeCompare(b.project);
            if (projectComparison !== 0) return projectComparison;

            const accComp = a.account.localeCompare(b.account);
            if (accComp !== 0) return accComp;

            return a.businessUnit.localeCompare(b.businessUnit);
          }

          default:
            return 0;
        }
      });
    },
    []
  );

  // Get all available options
  const businessUnits = useMemo(() => getBusinessUnits(), [getBusinessUnits]);

  // Get accounts based on selected business units
  const availableAccounts = useMemo(() => {
    if (formData.businessUnits.length === 0) return [];

    const accounts = new Set<string>();
    formData.businessUnits.forEach((bu) => {
      const buAccounts = getAccounts(bu);
      buAccounts.forEach((account) => accounts.add(account));
    });

    return Array.from(accounts).sort();
  }, [formData.businessUnits, getAccounts]);

  // Get projects based on selected business units and accounts
  const availableProjects = useMemo(() => {
    if (formData.businessUnits.length === 0 || formData.accounts.length === 0)
      return [];

    const projects = new Set<string>();
    formData.businessUnits.forEach((bu) => {
      formData.accounts.forEach((account) => {
        const accountProjects = getProjects(bu, account);
        accountProjects.forEach((project) => projects.add(project));
      });
    });

    return Array.from(projects).sort();
  }, [formData.businessUnits, formData.accounts, getProjects]);

  // Handle search term changes
  const handleSearchChange = useCallback(
    (field: keyof typeof searchTerms, value: string) => {
      setSearchTerms((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  // Handle form field changes
  const handleFieldChange = useCallback(
    (field: keyof ReportsFormData, value: string[]) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Reset dependent fields when parent field changes
        if (field === 'businessUnits') {
          newData.accounts = [];
          newData.projects = [];
        } else if (field === 'accounts') {
          newData.projects = [];
        }

        return newData;
      });
    },
    []
  );

  // Check if generate button should be enabled
  const isGenerateEnabled = useMemo(() => {
    return (
      formData.businessUnits.length > 0 ||
      formData.accounts.length > 0 ||
      formData.projects.length > 0 ||
      formData.practices.length > 0
    );
  }, [formData]);

  // Handle generate reports
  const handleGenerateReports = useCallback(async () => {
    setIsGenerating(true);

    try {
      let activities;
      let reportType: 'business-units' | 'accounts' | 'projects';
      let selectedItems: string[];

      // Determine which API to call based on selected filters
      if (formData.projects.length > 0) {
        // If projects are selected, get activities by projects and practices
        activities = await activityService.getActivitiesByProjects(
          formData.projects,
          formData.practices.length > 0 ? formData.practices : undefined
        );
        reportType = 'projects';
        selectedItems = formData.projects;
      } else if (formData.accounts.length > 0) {
        // If accounts are selected, get activities by accounts and practices
        activities = await activityService.getActivitiesByAccounts(
          formData.accounts,
          formData.practices.length > 0 ? formData.practices : undefined
        );
        reportType = 'accounts';
        selectedItems = formData.accounts;
      } else if (formData.businessUnits.length > 0) {
        // If only business units are selected, get activities by business units and practices
        activities = await activityService.getActivitiesByBusinessUnits(
          formData.businessUnits,
          formData.practices.length > 0 ? formData.practices : undefined
        );
        reportType = 'business-units';
        selectedItems = [...formData.businessUnits, 'New Growth'];
      } else {
        throw new Error('Please select at least one filter option');
      }

      if (activities.length === 0) {
        setSnackbar({
          open: true,
          message: 'No activities found for the selected filters',
          severity: 'warning',
        });
        return;
      }

      // Fetch additional project and practice information
      const [projectInfoList, practiceInfoList] = await Promise.all([
        projectInfoService.getAllProjectInfo(),
        practiceInfoService.getAllPracticeInfo(),
      ]);

      // Enrich activities with all project and practice information in a single pass
      const enrichedActivities = enrichActivitiesWithProjectInfo(
        activities,
        projectMapping,
        projectInfoList,
        practiceInfoList
      );

      // Sort activities based on applied filter
      const sortedActivities = sortActivitiesByFilter(
        enrichedActivities,
        reportType
      );
      // Generate and download the CSV report with generic filename
      generateAndDownloadMultiReport(sortedActivities, reportType);

      setSnackbar({
        open: true,
        message: `Report generated successfully! ${activities.length} activities exported.`,
        severity: 'success',
      });

      return {
        reportType,
        selectedItems,
        activitiesCount: activities.length,
      } as ReportGenerationResult;
    } catch (error) {
      console.error('Error generating report:', error);
      setSnackbar({
        open: true,
        message:
          error instanceof Error ? error.message : 'Failed to generate report',
        severity: 'error',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [projectMapping, sortActivitiesByFilter, formData]);

  // Close snackbar
  const closeSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return {
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
  };
};
