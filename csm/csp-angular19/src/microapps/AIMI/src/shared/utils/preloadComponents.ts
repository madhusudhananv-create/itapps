/**
 * Simple preload utility for lazy components
 * Maps component names to their import functions and preloads them asynchronously
 */

// Component name constants for better maintainability
export const COMPONENT_NAMES = {
  // Route-level components
  ACTIVITIES: 'Activities',
  DASHBOARD: 'Dashboard',
  REPORTS: 'Reports',
  BACKUP: 'Backup',
  PROTECTED_ROUTE: 'ProtectedRoute',
  LAYOUT: 'Layout',
  NOT_FOUND: 'NotFound',

  // Feature-level components
  MANAGE_ACTIVITIES: 'ManageActivities',
  ADD_ACTIVITY_MODAL: 'AddActivityModal',
  PROJECT_STATISTICS: 'ProjectStatistics',
} as const;

// Map of all lazy components with their import statements
const COMPONENT_IMPORTS = {
  // Route-level components (these are preloaded by default)
  [COMPONENT_NAMES.ACTIVITIES]: () =>
    import('@activities/components/Activities').then((module) => ({
      default: module.Activities,
    })),
  [COMPONENT_NAMES.DASHBOARD]: () =>
    import('../../features/dashboard/components/Dashboard').then((module) => ({
      default: module.Dashboard,
    })),
  [COMPONENT_NAMES.REPORTS]: () =>
    import('../../features/reports/components/Reports').then((module) => ({
      default: module.Reports,
    })),
  [COMPONENT_NAMES.BACKUP]: () =>
    import('../../features/backup/components/Backup').then((module) => ({
      default: module.Backup,
    })),
  [COMPONENT_NAMES.PROTECTED_ROUTE]: () =>
    import('../../features/auth/components/ProtectedRoute').then((module) => ({
      default: module.ProtectedRoute,
    })),
  [COMPONENT_NAMES.LAYOUT]: () =>
    import('../components/Layout').then((module) => ({
      default: module.Layout,
    })),
  [COMPONENT_NAMES.NOT_FOUND]: () =>
    import('../components/NotFound').then((module) => ({
      default: module.NotFound,
    })),

  // Feature-level components
  [COMPONENT_NAMES.MANAGE_ACTIVITIES]: () =>
    import('../../features/activities/components/ManageActivities').then(
      (module) => ({ default: module.ManageActivities })
    ),
  [COMPONENT_NAMES.ADD_ACTIVITY_MODAL]: () =>
    import('../../features/activities/components/AddActivityModal').then(
      (module) => ({ default: module.AddActivityModal })
    ),
  [COMPONENT_NAMES.PROJECT_STATISTICS]: () =>
    import('../../features/activities/components/ProjectStatistics').then(
      (module) => ({ default: module.ProjectStatistics })
    ),
} as const;

export type ComponentName = keyof typeof COMPONENT_IMPORTS;

/**
 * Preload components by name - runs asynchronously without blocking main thread
 * @param componentNames - Array of component names to preload
 */
export const preloadComponents = (componentNames: ComponentName[]): void => {
  // Run asynchronously to avoid blocking main thread
  setTimeout(() => {
    componentNames.forEach((componentName) => {
      const importFn = COMPONENT_IMPORTS[componentName];
      if (importFn) {
        importFn().catch((error) => {
          console.warn(`⚠️ Failed to preload ${componentName}:`, error);
        });
      } else {
        console.warn(`⚠️ Component not found: ${componentName}`);
      }
    });
  }, 3000);
};
