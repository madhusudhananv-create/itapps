/**
 * Audit Finding Stage Models
 * Used for CAPA (Corrective and Preventive Action) workflow
 * Migration Status: ✅ Basic structure created
 */

export class AuditFindingStage {
  audiT_REPORT_FINDING: AuditFindingReport = new AuditFindingReport();
  auditeE_ACCEPTANCE_STATUS: auditeE_ACCEPTANCE_STATUS = new auditeE_ACCEPTANCE_STATUS();
  capA_SUBMISSION: CapaSubmission = new CapaSubmission();
  capA_REVIEW: AuditFindingCappaReview = new AuditFindingCappaReview();
  caP_IMPLEMENTATION: AuditFindingCapaImplementation = new AuditFindingCapaImplementation();
  caP_VERIFICATION: AuditFindingCapaVerification = new AuditFindingCapaVerification();
  capA_CUSTOMER_APPROVAL: CapaApprovalByCustomer = new CapaApprovalByCustomer();
}

export class auditeE_ACCEPTANCE_STATUS {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  auditeE_ACCEPTANCE: any = null;
}

export class AuditFindingReport {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  findings: any = null;
}

export class CapaSubmission {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  capa: AuditFindingCapaExt[] = [];
}

export class AuditFindingCapaExt {
  causE_ID: number = 0;
  cappalist: any = {};
}

export class AuditFindingCappaReview {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  capa: any[] = [];
}

export class AuditFindingCapaImplementation {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  capa: any[] = [];
}

export class AuditFindingCapaVerification {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  capa: any[] = [];
}

export class CapaApprovalByCustomer {
  status: AuditFindingStagesMapping = new AuditFindingStagesMapping();
  capa: any[] = [];
}

export class AuditFindingStagesMapping {
  id?: number;
  findinG_ID?: number;
  stagE_ID: number = 0;
  stagE_NAME: string = '';
  stagE_STATUS: string = '';
  iscomplete?: boolean;
  createD_DATE?: Date | null;
  createD_BY?: string;
  updateD_BY: string = '';
  updateD_DATE: Date | null = null;
  isactive?: boolean;
}
