import { AuditFindingStagesMapping } from "./audit-finding-stages-mapping";
import { AuditExecutionFindings } from "./audit-execution-findings";
import { AuditFindingCappa } from "./audit-finding-capa";
import { AuditFindingImplementation } from "./audit-finding-implementation";
import { AuditFindingVerification } from "./audit-finding-verification";
import { auditeE_ACCEPTANCE } from "./auditee-acceptance";
import { CapaCustomerApproval } from "./capa-customer-approval";

export class AuditFindingStage {
    audiT_REPORT_FINDING: AuditFindingReport
    auditeE_ACCEPTANCE_STATUS : auditeE_ACCEPTANCE_STATUS
    capA_SUBMISSION: CapaSubmission
    capA_REVIEW: AuditFindingCappaReview
    caP_IMPLEMENTATION :AuditFindingCapaImplementation;
    caP_VERIFICATION :AuditFindingCapaVerification;
    capA_CUSTOMER_APPROVAL :CapaApprovalByCustomer;
}
export class auditeE_ACCEPTANCE_STATUS
{
    status: AuditFindingStagesMapping;
    auditeE_ACCEPTANCE : auditeE_ACCEPTANCE;
    
}
export class AuditFindingReport {
    status: AuditFindingStagesMapping
    findings: AuditExecutionFindings
}
export class CapaSubmission {
    status: AuditFindingStagesMapping
    capa: AuditFindingCapaExt[]
}
export class AuditFindingCapaExt {
    causE_ID: number;
    cappalist: AuditFindingCappa
}
export class AuditFindingCappaReview{
    status: AuditFindingStagesMapping
    capa: AuditFindingCapaReviewExt[]
}
export class AuditFindingCapaImplementation{
    status: AuditFindingStagesMapping
    capa: AuditFindingImplementation[]
}
export class AuditFindingCapaVerification{
    status: AuditFindingStagesMapping
    capa: AuditFindingVerification[]
}
export class AuditFindingCapaReviewExt extends AuditFindingCappa{
    iscapapproved :boolean;
    iscaprejected :boolean;
    ischecked:boolean
    remarks:string
    revieW_UPDATED_BY :string;
    revieW_UPDATED_DATE :Date
    issubmitted: boolean;
}

export class CapaApprovalByCustomer{
    status: AuditFindingStagesMapping
    capa: CapaCustomerApproval[]
}
