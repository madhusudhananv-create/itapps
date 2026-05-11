/**
 * Contacts Model - Customer contact information
 */
export class ContactsModel {
  id: number = 0;
  customeR_ID: string = '';
  contacT_NAME: string = '';
  contacT_ROLE: string = '';
  contacT_EMAILID: string = '';
  contacT_PHONE: string = '';
  contacT_TYPE: string = '';
  contacT_EMP_ID: string = '';
  emP_ID: string = ''; // Employee ID - displayed in template
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  isactive: boolean = true;
  rolE_ID: number = 0;
  specifiC_SURVEY_OPTED: boolean = false;
  acsat: boolean = false;
  category: string = '';
}

/**
 * Contact Roles Model - Contact role types
 */
export class ContactsRolesModel {
  rolE_ID: number = 0;
  rolE_NAME: string = '';
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_BY: string = '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
}
