/**
 * Customer info for a manager's portal users
 * Backed by GET /GetCustomerInfo?ManagerId= (AllSysController -> CUSTOMER_USERS entity).
 * Field casing reflects the global CamelCasePropertyNamesContractResolver transform
 * (see access-control.model.ts for the full explanation).
 */
export interface CustomerProjectsModel {
  id: number;
  emailid: string;
  displaY_NAME: string;
  isverified: boolean;
}
