/**
 * Access Control Models
 * Migrated from LEGACY-SOURCE/src/app/models/access-control-model.ts
 * 
 * These models define the structure for application access controls,
 * role-based permissions, and feature-level access management.
 */

/**
 * Main access control model for managing user/role permissions
 * Used by AppsService for access control operations
 */
export interface AppAccessControlsModel {
  ID: number;
  RESOURCE_ID: number;
  ACCESS_LEVEL: number;
  ROLE_ID: number;
  CUST_ID: string[];
  PROJ_ID: string[];
  EMP_ID: string[];
  VIEW_ACCESS: boolean;
  CREATE_ACCESS: boolean;
  EDIT_ACCESS: boolean;
  DELETE_ACCESS: boolean;
  COMMENTS: string;
  CREATED_BY: string;
  CREATED_DATE: Date;
  UPDATED_BY: string;
  UPDATED_DATE: Date;
  ISACTIVE: boolean;
}

/**
 * Application controls/resources model
 * Defines available application resources (screens, modules, features)
 */
export interface AppControlsModel {
  id: number;
  resourcE_ID: number;
  resourcE_TYPE: number;
  resourcE_NAME: number;
  comments: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Application control features model
 * Maps features to application resources for granular access control
 */
export interface AppControlFeaturesModel {
  id: number;
  resourcE_ID: number;
  feature: number;
  comments: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Access request model for handling user access requests
 * Used for workflow where users request access and approvers grant/deny
 */
export interface AccessRequestModel {
  id: number;
  resourcE_ID: number;
  proJ_ID: string;
  cusT_ID: string;
  accesS_LEVEL: number;
  status: string;
  feature: string;
  approveR_ID: string;
  approvaL_DATE: Date;
  rejecT_REASON: string;
  requesteD_BY: string;
  requesteD_DATE: Date;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Helper type for initializing new access control records
 * Makes all fields optional except the required ones
 */
export type NewAppAccessControlsModel = Partial<AppAccessControlsModel> & {
  RESOURCE_ID: number;
  ROLE_ID: number;
};

/**
 * Access control permission summary (computed from AppAccessControlsModel)
 * Used for quick permission checks in components
 */
export interface AccessPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  accessLevel: number;
}
