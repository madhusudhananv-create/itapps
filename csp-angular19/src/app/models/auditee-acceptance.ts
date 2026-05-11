/**
 * Auditee Acceptance Model
 * Used for auditor/auditee acceptance or rejection of findings
 */
export class AuditeeAcceptance {
  id: number = 0;
  findinG_ID: number = 0;
  status: string = '';
  remarks: string = '';
  createD_BY: string = '';
  updateD_BY: string = '';
  createD_DATE: Date = new Date();
  updateD_DATE: Date = new Date();
  isactive: boolean = true;
  issubmitted: boolean = false;
  audit_ID: number = 0;
  iS_AUDITOR_ACCEPT: boolean = false;
  disablE_CAPA: boolean = false;
}
