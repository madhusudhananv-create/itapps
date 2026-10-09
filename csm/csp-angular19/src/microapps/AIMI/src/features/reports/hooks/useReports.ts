import { useState, useCallback, useMemo } from 'react';
import { reportService } from '../services/reportService';
import { generateAndDownloadMultiReport } from '../utils/csvExportUtils';
import type { EnrichedActivityWithProjectInfo } from '../utils/activityEnrichmentUtils';
import { useProjectHierarchy } from '@shared/projects/hooks/useProjectHierarchy';
import { useAllocatedAccounts } from '@shared/projects/hooks/useAllocatedAccounts';
import { useQuestionnaireLookup } from '@shared/lookups/useQuestionnaireLookup';

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
  const { allocatedAccountNames } = useAllocatedAccounts();
  const { getPracticesFromQuestionnaire } = useQuestionnaireLookup();

  const questionnairePractices = getPracticesFromQuestionnaire();

  // Only show business units/accounts the logged-in employee is allocated to
  // (same restriction the CSM Angular app applies via GetCustomerIds, and the
  // same filter the Project Information screen uses). null while the
  // allocation list hasn't loaded yet.
  const allowedAccounts = useMemo(() => {
    if (allocatedAccountNames === null) return null;
    return new Set(allocatedAccountNames.map((name) => name.trim().toLowerCase()));
  }, [allocatedAccountNames]);

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
  const businessUnits = useMemo(() => {
    const allBusinessUnits = getBusinessUnits();
    // Show nothing until the allocation list has loaded rather than briefly
    // showing every business unit first.
    if (!allowedAccounts) return [];
    return allBusinessUnits.filter((businessUnit) =>
      getAccounts(businessUnit).some((account) =>
        allowedAccounts.has(account.trim().toLowerCase())
      )
    );
  }, [getBusinessUnits, getAccounts, allowedAccounts]);

  // Get accounts based on selected business units
  const availableAccounts = useMemo(() => {
    if (formData.businessUnits.length === 0 || !allowedAccounts) return [];

    const accounts = new Set<string>();
    formData.businessUnits.forEach((bu) => {
      const buAccounts = getAccounts(bu);
      buAccounts.forEach((account) => {
        if (allowedAccounts.has(account.trim().toLowerCase())) {
          accounts.add(account);
        }
      });
    });

    return Array.from(accounts).sort();
  }, [formData.businessUnits, getAccounts, allowedAccounts]);

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
      let reportType: 'business-units' | 'accounts' | 'projects';
      let selectedItems: string[];
      const practices =
        formData.practices.length > 0 ? formData.practices : undefined;

      // Determine which filter dimension to report on, same priority as
      // before: Projects > Accounts > Business Units, Practice always narrows
      // further - usp_AIMI_GetReportData.sql applies that same rule server-side.
      if (formData.projects.length > 0) {
        reportType = 'projects';
        selectedItems = formData.projects;
      } else if (formData.accounts.length > 0) {
        reportType = 'accounts';
        selectedItems = formData.accounts;
      } else if (formData.businessUnits.length > 0) {
        reportType = 'business-units';
        selectedItems = formData.businessUnits;
      } else {
        throw new Error('Please select at least one filter option');
      }

      // One API call: the SP already joins activities with their project's AI
      // Adoption Metrics server-side, replacing the old fetch-activities +
      // fetch-every-ProjectInfo + fetch-every-PracticeInfo + client-side-join flow.
      const enrichedActivities = await reportService.getReportData(
        {
          businessUnits:
            formData.businessUnits.length > 0
              ? formData.businessUnits
              : undefined,
          accounts: formData.accounts.length > 0 ? formData.accounts : undefined,
          projects: formData.projects.length > 0 ? formData.projects : undefined,
          practices,
        },
        projectMapping
      );

      if (enrichedActivities.length === 0) {
        setSnackbar({
          open: true,
          message: 'No activities found for the selected filters',
          severity: 'warning',
        });
        return;
      }

      // Sort activities based on applied filter
      const sortedActivities = sortActivitiesByFilter(
        enrichedActivities,
        reportType
      );
      // Generate and download the CSV report with generic filename
      generateAndDownloadMultiReport(sortedActivities, reportType);

      setSnackbar({
        open: true,
        message: `Report generated successfully! ${enrichedActivities.length} activities exported.`,
        severity: 'success',
      });

      return {
        reportType,
        selectedItems,
        activitiesCount: enrichedActivities.length,
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
