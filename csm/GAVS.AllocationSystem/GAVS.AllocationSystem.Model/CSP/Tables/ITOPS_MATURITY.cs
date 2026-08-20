using GAVS.AllocationSystem.Model.Base;
using System;

namespace GAVS.AllocationSystem.Model.CSP
{
    // Reference: Technology Domains (Network, ITSM, Cloud, Linux, VMware, ...)
    public class ITOPS_DOMAIN : EntityBase
    {
        public string CODE { get; set; } // stable slug used by the Angular route, e.g. "windows", "citrix-vdi"
        public string NAME { get; set; }
        public string DESCRIPTION { get; set; }
        public int? MIN_REQUIRED_SCORE { get; set; }
        public int DISPLAY_ORDER { get; set; }
        // Default owners applied to a new assessment the first time an account opens this domain.
        public string DEFAULT_COE_SPOC_EMP_ID { get; set; }
        public string DEFAULT_REVIEWER_EMP_ID { get; set; }
    }

    // Sub-grouping within a domain (Control Environment, Access Controls, ...)
    public class ITOPS_CATEGORY : EntityBase
    {
        public int DOMAIN_ID { get; set; }
        public string NAME { get; set; }
        public int DISPLAY_ORDER { get; set; }
    }

    // Parameter / KPI - the individual item being scored, with its 1-5 rubric
    public class ITOPS_PARAMETER : EntityBase
    {
        public int CATEGORY_ID { get; set; }
        public string NAME { get; set; }
        public string DEFINITION { get; set; }
        public string LEVEL1_ADHOC { get; set; }
        public string LEVEL2_DEVELOPING { get; set; }
        public string LEVEL3_DEFINED { get; set; }
        public string LEVEL4_MANAGED { get; set; }
        public string LEVEL5_OPTIMIZED { get; set; }
        public int? MIN_REQUIRED_SCORE { get; set; }
        public int DISPLAY_ORDER { get; set; }
    }

    // One assessment cycle instance per Domain (e.g. per BU/Account/month)
    public class ITOPS_ASSESSMENT : EntityBase
    {
        public int DOMAIN_ID { get; set; }
        public string CUST_ID { get; set; } // links to CUSTOMER.CUST_ID - the real account this instance belongs to
        public string BUSINESS_UNIT { get; set; }
        public string ACCOUNT_NAME { get; set; }
        public string COE_SPOC_EMP_ID { get; set; }
        public string REVIEWER_EMP_ID { get; set; }
        public string ASSESSEE_EMP_ID { get; set; }
        public string STATUS { get; set; } // NotStarted | Draft | PendingReview | Approved | ReturnedForRevision | Suspended | Closed
        public string CYCLE_LABEL { get; set; }
        public DateTime? SUBMITTED_DATE { get; set; }
        public DateTime? APPROVED_DATE { get; set; }
        public string RETURN_COMMENT { get; set; }
    }

    // Score entered by the assessor for one parameter within one assessment
    public class ITOPS_SCORE : EntityBase
    {
        public int ASSESSMENT_ID { get; set; }
        public int PARAMETER_ID { get; set; }
        public int? SCORE_VALUE { get; set; } // null = NA; 1-5 otherwise
        public string NOTES { get; set; } // mandatory regardless of score
        public bool IS_IMPROVEMENT_AREA { get; set; } // auto-set when SCORE_VALUE < 5
        public string IMPROVEMENT_STATUS { get; set; } // Proposed | Accepted | Rejected
        public string REJECTION_JUSTIFICATION { get; set; }
    }

    // Evidence attachments (PDF/JPG/PNG, max 10MB, enforced in the controller)
    public class ITOPS_EVIDENCE : EntityBase
    {
        public int SCORE_ID { get; set; }
        public string FILE_NAME { get; set; }
        public string STORAGE_PATH { get; set; } // blob/file-share path; binary not stored in SQL
        public long FILE_SIZE_BYTES { get; set; }
        public string CONTENT_TYPE { get; set; }
    }

    // Findings - the trackable action item derived from a below-target score
    public class ITOPS_FINDING : EntityBase
    {
        public int SCORE_ID { get; set; }
        public int ASSESSMENT_ID { get; set; }
        public int GAP { get; set; } // 5 - SCORE_VALUE
        public string RECOMMENDED_ACTION { get; set; }
        public string STATUS { get; set; } // Open | Accepted | Rejected | InProgress | PastDue | Retarget | Closed | Suspended
        public string ASSESSEE_EMP_ID { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public DateTime? REVISED_TARGET_DATE { get; set; }
        public string RETARGET_APPROVED_BY { get; set; }
        public string RETARGET_REASON { get; set; }
        public string ACTION_TAKEN { get; set; }
        public string REJECTION_COMMENT { get; set; }
        public DateTime? LAST_MANAGEMENT_UPDATE { get; set; }
        public DateTime? CLOSED_DATE { get; set; }
    }

    // Free-form activity/audit trail on a finding (comment, escalation, delegation, retarget)
    public class ITOPS_FINDING_ACTIVITY : EntityBase
    {
        public int FINDING_ID { get; set; }
        public string ACTIVITY_TYPE { get; set; } // Comment | Escalation | Delegation | Retarget | Closure
        public string COMMENTS { get; set; }
        public string FROM_EMP_ID { get; set; }
        public string TO_EMP_ID { get; set; }
    }

    // Notification queue/log - drives reminders and escalations
    public class ITOPS_NOTIFICATION : EntityBase
    {
        public string NOTIFICATION_TYPE { get; set; }
        public int? ASSESSMENT_ID { get; set; }
        public int? FINDING_ID { get; set; }
        public string RECIPIENT_EMP_ID { get; set; }
        public string MESSAGE { get; set; }
        public bool IS_SENT { get; set; }
        public DateTime? SENT_DATE { get; set; }
    }
}
