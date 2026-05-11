/**
 * Enumerations for CSM Application
 * Migrated from Angular 6 to Angular 19
 */

/**
 * Access type enumeration for permission control
 */
export enum enumAccessType {
  view = 1,
  create = 2,
  edit = 3,
  delete = 4
}

/**
 * User roles in the system
 */
export enum enumRoles {
  CustomerSuccessManager = 1,
  ProjectManager = 2,
  TeamMember = 3,
  BUHeadIMS = 4,
  Customer = 5,
  PMO = 6,
  Quality = 7,
  Finance = 8,
  FunctionalManager = 9,
  HR = 10,
  AccountManager = 11,
  Marketing = 12,
  GSLab = 13
}

/**
 * Date range options for filtering
 */
export enum enumDateRange {
  PreviousWeek = -1,
  Weekly = 0,
  NextWeek = 1,
  Monthly = 2,
  Custom = 3,
}

/**
 * KPI details status
 */
export enum enumKPIDetailsStatus {
  Draft = 1,
  Submitted = 2,
  Dispute = 3,
  DisputeAccepted = 4,
  DisputeRejected = 5
}
