/**
 * Appreciation Model - Customer appreciation records
 */
export class AppreciationModel {
  id: number = 0;
  cusT_ID: string = '';
  proJ_ID: string = '';
  appreciateD_BY: string = '';
  comments: string = '';
  recipient: string = '';
  designation: string = '';
  receiveD_DATE: Date = new Date();
  createD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_BY: string = '';
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
}

/**
 * Extended Appreciation Model - includes project and portfolio details
 */
export class AppreciationModelExt extends AppreciationModel {
  proJ_NM: string = '';
  portfoliO_ID: number = 0;
  portfoliO_NAME: string = '';
  recipienT_NM: string = '';
}
