import { useProjectData } from './useProjectData';
import { useMemo, useCallback } from 'react';
import type { ProjectData } from '@shared/projects/types/projectDataSchema';
import type { ProjectMapping } from '@shared/projects/types/projectMappingTypes';

// Hierarchical data structure interfaces
interface ManagerInfo {
  name: string;
  email?: string;
}

interface ProjectInfo {
  name: string;
  manager: ManagerInfo;
  csm?: string;
  projectId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface AccountInfo {
  name: string;
  projects: Record<string, ProjectInfo>;
}

interface BusinessUnitInfo {
  name: string;
  accounts: Record<string, AccountInfo>;
}

// Canonical business unit labels used for display and dropdown filtering
const ALLOWED_BUSINESS_UNITS = [
  'CIT',
  'Tech',
  'Health care',
  'India & GCC',
  'AI&ML',
  'Sead',
];

// DB values may differ in casing (e.g. 'SEAD'); map them to the canonical label
const normalizeBusinessUnit = (raw: string): string => {
  const match = ALLOWED_BUSINESS_UNITS.find(
    (bu) => bu.toLowerCase() === raw.trim().toLowerCase()
  );
  return match ?? raw;
};

export const useProjectHierarchy = () => {
  const { data: projectData, loading, error } = useProjectData();

  // Memoize hierarchical project data construction and project mapping
  const { hierarchicalData, projectMapping, businessUnitHeads } = useMemo(() => {
    if (!projectData || projectData.length === 0) {
      return {
        hierarchicalData: { businessUnits: {} },
        projectMapping: new Map<string, ProjectMapping>(),
        businessUnitHeads: {} as Record<string, string>,
      };
    }

    const businessUnits: Record<string, BusinessUnitInfo> = {};
    const projectMapping = new Map<string, ProjectMapping>();
    // How many projects name each person as BU Head, per business unit
    const buHeadCounts: Record<string, Map<string, number>> = {};

    projectData.forEach((project: ProjectData) => {
      const businessUnit = normalizeBusinessUnit(project.businessUnit || 'Other');

      // BU Head is stored on every project, so a changed BU Head can still be on some
      // projects as the old person. Count them so the one most projects agree on wins.
      const buHeadName = project.buHead?.trim();
      if (buHeadName) {
        const counts = (buHeadCounts[businessUnit] ??= new Map<string, number>());
        counts.set(buHeadName, (counts.get(buHeadName) ?? 0) + 1);
      }
      const account = project.customerName || 'Unknown Account';
      const projectName = project.projectName || 'Unknown Project';
      const manager = project.pm || 'Unassigned';
      const managerEmail = project.pmMailId ?? '';
      const csm = project.csm ?? '';

      // Create project mapping entry
      projectMapping.set(project.projectId, {
        businessHead: project.buHead ?? '',
        accountManager: csm,
        manager: manager,
        headcount: project.headcount,
      });

      // Initialize business unit if it doesn't exist
      if (!businessUnits[businessUnit]) {
        businessUnits[businessUnit] = {
          name: businessUnit,
          accounts: {},
        };
      }

      // Initialize account if it doesn't exist
      if (!businessUnits[businessUnit].accounts[account]) {
        businessUnits[businessUnit].accounts[account] = {
          name: account,
          projects: {},
        };
      }

      // Add project with manager information
      businessUnits[businessUnit].accounts[account].projects[projectName] = {
        name: projectName,
        manager: {
          name: manager,
          email: managerEmail,
        },
        csm: csm,
        projectId: project.projectId,
        status: project.projectStatus,
        startDate: project.startDate,
        endDate: project.endDate,
      };
    });

    // The most common BU Head per business unit (first one seen wins a tie)
    const businessUnitHeads: Record<string, string> = {};
    Object.entries(buHeadCounts).forEach(([businessUnit, counts]) => {
      let best = '';
      let bestCount = 0;
      counts.forEach((count, name) => {
        if (count > bestCount) {
          best = name;
          bestCount = count;
        }
      });
      businessUnitHeads[businessUnit] = best;
    });

    return {
      hierarchicalData: { businessUnits },
      projectMapping,
      businessUnitHeads,
    };
  }, [projectData]);

  // Memoized helper functions for accessing the hierarchical data
  const getBusinessUnits = useCallback((): string[] => {
    if (loading) return [];
    console.log(hierarchicalData.businessUnits);
    console.log('---------------------------------------------------');
    return Object.keys(hierarchicalData.businessUnits).filter(
      (bu) => bu && ALLOWED_BUSINESS_UNITS.includes(bu)
    );
  }, [hierarchicalData.businessUnits, loading]);

  const getAccounts = useCallback(
    (businessUnit: string): string[] => {
      if (!businessUnit || loading) return [];
      const buData = hierarchicalData.businessUnits[businessUnit];
      if (buData) {
        return Object.keys(buData.accounts).sort();
      }
      return [];
    },
    [hierarchicalData.businessUnits, loading]
  );

  const getProjects = useCallback(
    (businessUnit: string, account: string): string[] => {
      if (!businessUnit || !account || loading) return [];
      const buData = hierarchicalData.businessUnits[businessUnit];
      if (buData) {
        const accountData = buData.accounts[account];
        if (accountData) {
          return Object.keys(accountData.projects).sort();
        }
      }
      return [];
    },
    [hierarchicalData.businessUnits, loading]
  );

  const getProjectInfo = useCallback(
    (
      businessUnit: string,
      account: string,
      project: string
    ): ProjectInfo | null => {
      if (!businessUnit || !account || !project || loading) return null;

      const buData = hierarchicalData.businessUnits[businessUnit];
      if (buData) {
        const accountData = buData.accounts[account];
        if (accountData?.projects?.[project]) {
          return accountData.projects[project];
        }
      }
      return null;
    },
    [hierarchicalData.businessUnits, loading]
  );

  const getManagerForProject = useCallback(
    (
      businessUnit: string,
      account: string,
      project: string
    ): ManagerInfo | null => {
      const projectInfo = getProjectInfo(businessUnit, account, project);
      return projectInfo?.manager ?? null;
    },
    [getProjectInfo]
  );

  const getCSMForAccount = useCallback(
    (businessUnit: string, account: string): string => {
      if (!businessUnit || !account || loading) return '';

      const buData = hierarchicalData.businessUnits[businessUnit];
      if (buData) {
        const accountData = buData.accounts[account];
        if (accountData) {
          // Get the first project's CSM for this account
          const firstProject = Object.values(accountData.projects)[0];
          if (firstProject) {
            return firstProject.csm ?? '';
          }
        }
      }
      return '';
    },
    [hierarchicalData.businessUnits, loading]
  );

  const getBUHeadForBusinessUnit = useCallback(
    (businessUnit: string): string => {
      if (!businessUnit || loading) return '';

      // The BU Head is stored per project in CSM (the project's BU Head), so one BU can carry
      // more than one name when a few projects have stale/odd data. Use the name most of the
      // BU's projects carry instead of whichever project happens to be first, and look projects
      // up by their business unit rather than by project name (names repeat across BUs).
      const counts = new Map<string, number>();
      projectData.forEach((p: ProjectData) => {
        if (normalizeBusinessUnit(p.businessUnit || 'Other') !== businessUnit) return;
        const head = (p.buHead ?? '').trim();
        if (head) counts.set(head, (counts.get(head) ?? 0) + 1);
      });

      let best = '';
      let bestCount = 0;
      counts.forEach((count, head) => {
        if (count > bestCount) {
          best = head;
          bestCount = count;
        }
      });
      return best;
    },
    [projectData, loading]
  );

  // Get original project data including headcount
  const getOriginalProjectData = useCallback(
    (
      businessUnit: string,
      account: string,
      project: string
    ): ProjectData | null => {
      if (!businessUnit || !account || !project || loading) return null;

      // Find the original project data from the API response (BU casing may differ from the DB)
      const originalProjectData = projectData.find(
        (p: ProjectData) =>
          normalizeBusinessUnit(p.businessUnit || '') === businessUnit &&
          p.customerName === account &&
          p.projectName === project
      );

      return originalProjectData || null;
    },
    [projectData, loading]
  );

  // Get all managers for a business unit
  const getManagersForBusinessUnit = useCallback(
    (businessUnit: string): ManagerInfo[] => {
      if (!businessUnit || loading) return [];

      const managers: ManagerInfo[] = [];
      const buData = hierarchicalData.businessUnits[businessUnit];

      if (buData) {
        Object.values(buData.accounts).forEach((account) => {
          Object.values(account.projects).forEach((project) => {
            if (
              project.manager &&
              !managers.find((m) => m.name === project.manager.name)
            ) {
              managers.push(project.manager);
            }
          });
        });
      }

      return managers;
    },
    [hierarchicalData.businessUnits, loading]
  );

  // Get summary statistics
  const getSummaryStats = useCallback(() => {
    if (loading) return null;

    const stats = {
      totalBusinessUnits: Object.keys(hierarchicalData.businessUnits).length,
      totalAccounts: 0,
      totalProjects: 0,
      totalManagers: new Set<string>(),
    };

    Object.values(hierarchicalData.businessUnits).forEach((bu) => {
      Object.values(bu.accounts).forEach((account) => {
        stats.totalAccounts++;
        Object.values(account.projects).forEach((project) => {
          stats.totalProjects++;
          if (project.manager.name) {
            stats.totalManagers.add(project.manager.name);
          }
        });
      });
    });

    return {
      ...stats,
      totalManagers: stats.totalManagers.size,
    };
  }, [hierarchicalData.businessUnits, loading]);

  return {
    hierarchicalData,
    projectData, // Expose raw project data for enrichment
    getBusinessUnits,
    getAccounts,
    getProjects,
    getProjectInfo,
    getManagerForProject,
    getCSMForAccount,
    getBUHeadForBusinessUnit,
    getOriginalProjectData,
    getManagersForBusinessUnit,
    projectMapping, // Expose project mapping Map
    getSummaryStats,
    loading,
    error,
  };
};
