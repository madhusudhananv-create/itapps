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
 * Backed by GET /GetAppControls (AllSysController -> APP_CONTROLS entity).
 * NOTE: this endpoint goes through the standard Web API pipeline, which has a global
 * CamelCasePropertyNamesContractResolver configured (see WebApi/App_Start/GlobalConfig.cs).
 * That resolver only lowercases LEADING uppercase letters up to the first underscore
 * (Newtonsoft's ToCamelCase algorithm), so "RESOURCE_ID" -> "resourcE_ID", not "resourceId"
 * and not "RESOURCE_ID". This is the same convention the legacy Angular 7 app relied on.
 */
export interface AppControlsModel {
  id: number;
  resourcE_ID: number;
  resourcE_TYPE: string;
  resourcE_NAME: string;
  comments: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Application control features model
 * Backed by GET /GetControlFeatures (AllSysController -> APP_CONTROL_FEATURES entity).
 * Same camelCase-transform convention as AppControlsModel above.
 */
export interface AppControlFeaturesModel {
  id: number;
  resourcE_ID: number;
  feature: string;
  comments: string;
  createD_BY: string;
  createD_DATE: Date;
  updateD_BY: string;
  updateD_DATE: Date;
  isactive: boolean;
}

/**
 * Access control row as returned by AllSysController's Get/Update/Delete access-control
 * endpoints (APP_ACCESS_CONTROLS entity, transformed casing - see AppControlsModel note above).
 *
 * This is intentionally a SEPARATE type from AppAccessControlsModel below: that one models the
 * access list embedded in the login payload, which AuthController builds via a manual
 * JsonConvert.SerializeObject() call that does NOT go through the Web API pipeline's
 * CamelCasePropertyNamesContractResolver, so it keeps the original ALL-CAPS C# casing.
 */
export interface AccessControlRowModel {
  id: number;
  resourcE_ID: number;
  accesS_LEVEL: number;
  rolE_ID: number | null;
  cusT_ID: string;
  proJ_ID: string;
  emP_ID: string;
  vieW_ACCESS: boolean;
  creatE_ACCESS: boolean;
  ediT_ACCESS: boolean;
  deletE_ACCESS: boolean;
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
