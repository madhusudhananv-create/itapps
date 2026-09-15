// Port of the CSM Angular app's AccessControl.IsAllowed() (src/app/shared/access-control.ts)
// so AIMI can use the same APP_ACCESS_CONTROLS backend table/UI instead of hardcoded lists.
// The `access` localStorage key is bridged from the same CSM session AuthProvider already reads.

// Object literal + derived union type stands in for an enum ('erasableSyntaxOnly' forbids real enums)
export const AccessType = {
  view: 1,
  create: 2,
  edit: 3,
  delete: 4,
} as const;

export type AccessType = (typeof AccessType)[keyof typeof AccessType];

interface AppAccessControlsModel {
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
}

const getAccessList = (): AppAccessControlsModel[] => {
  try {
    const access = localStorage.getItem('access');
    return access ? JSON.parse(access) : [];
  } catch (error) {
    console.error('Error parsing access controls:', error);
    return [];
  }
};

const isGavsUser = (): boolean => localStorage.getItem('logintype') === 'gavs';

const checkAccessByType = (
  access: AppAccessControlsModel,
  type: AccessType
): boolean => {
  switch (type) {
    case AccessType.view:
      return access.VIEW_ACCESS === true;
    case AccessType.create:
      return access.CREATE_ACCESS === true;
    case AccessType.edit:
      return access.EDIT_ACCESS === true;
    case AccessType.delete:
      return access.DELETE_ACCESS === true;
    default:
      return false;
  }
};

// Mirrors AccessControl.IsAllowed(controlId, type, custid, projid) from the Angular app.
export const isAllowed = (
  controlId: number,
  type: AccessType,
  custId = '',
  projId = ''
): boolean => {
  void projId; // kept for signature parity with the Angular version, unused there too

  const empId = (localStorage.getItem('empid') || '').toLowerCase();
  if (!empId) return false;

  const accessControlRepository = getAccessList();
  if (accessControlRepository.length === 0) return false;

  const role = localStorage.getItem('role');

  // Customer-specific access control
  if (!isGavsUser()) {
    const custAccess = accessControlRepository.find(
      (x) =>
        x.EMP_ID?.some((e) => e?.toLowerCase() === empId) &&
        x.ACCESS_LEVEL === 3 &&
        x.RESOURCE_ID === controlId
    );
    if (custAccess) {
      return checkAccessByType(custAccess, type);
    }
  }

  // Role-based access with employee delegation
  let empDelegate = accessControlRepository.find(
    (x) =>
      x.ROLE_ID?.toString() === role &&
      x.EMP_ID?.some((e) => e?.toLowerCase() === empId) &&
      x.ACCESS_LEVEL === 1 &&
      x.RESOURCE_ID === controlId
  );
  if (!empDelegate) {
    empDelegate = accessControlRepository.find(
      (x) =>
        x.EMP_ID?.some((e) => e?.toLowerCase() === empId) &&
        x.ACCESS_LEVEL === 1 &&
        x.RESOURCE_ID === controlId
    );
  }
  if (empDelegate) {
    if (!checkAccessByType(empDelegate, type)) return false;
    if (empDelegate.CUST_ID && empDelegate.CUST_ID.length > 0) {
      return empDelegate.CUST_ID.some((t) => t.toString() === custId.toString());
    }
    return true;
  }

  // Pure role-based access
  const userRoleId = parseInt(role || '0', 10);
  const roleAccess = accessControlRepository.find(
    (x) =>
      x.RESOURCE_ID === controlId &&
      x.ACCESS_LEVEL === 1 &&
      x.ROLE_ID === userRoleId &&
      checkAccessByType(x, type)
  );
  if (roleAccess) {
    if (roleAccess.CUST_ID && roleAccess.CUST_ID.length > 0) {
      return roleAccess.CUST_ID.some((t) => t.toString() === custId.toString());
    }
    return true;
  }

  return false;
};

// Resource ID provisioned in APP_ACCESS_CONTROLS for the AIMI admin role
// (Mangesh, Ambrish, DevX team - granted view access to control ID 832).
const AIMI_ADMIN_RESOURCE_ID = 833;

export const isAdminUser = (): boolean =>
  isAllowed(AIMI_ADMIN_RESOURCE_ID, AccessType.view, '', '');
