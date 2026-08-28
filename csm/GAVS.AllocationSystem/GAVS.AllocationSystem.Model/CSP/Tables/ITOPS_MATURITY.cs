using GAVS.AllocationSystem.Model.Base;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    // ---------------------------------------------------------------------
    // IT Operations Maturity Assessment - V2 schema (project-scoped, cycle
    // versioned, multi-select assessor/reviewer/assessee).
    //
    // These POCOs mirror
    //   DB Scripts/2026/ITOperationMaturity/V2/ITOperationMaturity_V2_02_CreateTables.sql
    // column for column. Column widths matter: every *EMP_ID column is
    // VARCHAR(50) (matching EMP_INFO.EMP_ID's real width) and every
    // PROJECT_ID column is VARCHAR(20) (matching PROJECT.PROJ_ID).
    //
    // Table mapping is done in CSPDbContext.OnModelCreating (ToTable), same
    // as every other CSP entity - the [Column]/[MaxLength] annotations here
    // exist so EF emits varchar/date parameters instead of nvarchar/datetime2.
    // ---------------------------------------------------------------------

    // Reference: Technology Domains (Network, ITSM, Cloud, Linux, VMware, ...)
    public class ITOPS_DOMAIN : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(50)]
        public string CODE { get; set; } // stable slug used by the Angular route, e.g. "windows", "citrix-vdi"

        [Column(TypeName = "varchar"), MaxLength(150)]
        public string NAME { get; set; }

        [Column(TypeName = "varchar"), MaxLength(500)]
        public string DESCRIPTION { get; set; }

        public int? MIN_REQUIRED_SCORE { get; set; }
        public int DISPLAY_ORDER { get; set; }

        // V2 rename: DEFAULT_COE_SPOC_EMP_ID -> DEFAULT_ASSESSOR_ID,
        //            DEFAULT_REVIEWER_EMP_ID -> DEFAULT_REVIEWER_ID.
        // Applied as the single IS_PRIMARY row in the assessor/reviewer join
        // tables when an assessment row is first created for a project.
        [Column(TypeName = "varchar"), MaxLength(50)]
        public string DEFAULT_ASSESSOR_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string DEFAULT_REVIEWER_ID { get; set; }
    }

    // Sub-grouping within a domain (Control Environment, Access Controls, ...).
    // V2: effective-dated - END_DATE null means currently active.
    public class ITOPS_CATEGORY : EntityBase
    {
        public int DOMAIN_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(150)]
        public string NAME { get; set; }

        public int DISPLAY_ORDER { get; set; }

        [Column(TypeName = "date")]
        public DateTime START_DATE { get; set; }

        [Column(TypeName = "date")]
        public DateTime? END_DATE { get; set; }
    }

    // Parameter / KPI - the individual item being scored. V2: the five flat
    // rubric-text columns moved out to ITOPS_PARAMETER_LEVEL, and the row is
    // effective-dated like ITOPS_CATEGORY.
    public class ITOPS_PARAMETER : EntityBase
    {
        public int CATEGORY_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(250)]
        public string NAME { get; set; }

        [Column(TypeName = "varchar"), MaxLength(2000)]
        public string DEFINITION { get; set; }

        public int? MIN_REQUIRED_SCORE { get; set; }
        public int DISPLAY_ORDER { get; set; }

        [Column(TypeName = "date")]
        public DateTime START_DATE { get; set; }

        [Column(TypeName = "date")]
        public DateTime? END_DATE { get; set; }
    }

    // One row per (PARAMETER_ID, LEVEL_NO 1-5) holding that level's rubric text.
    // No audit/ISACTIVE columns exist on this table, so it does NOT derive from
    // EntityBase - deriving would make EF query columns that aren't there.
    public class ITOPS_PARAMETER_LEVEL
    {
        [Key]
        public int ID { get; set; }
        public int PARAMETER_ID { get; set; }
        public byte LEVEL_NO { get; set; } // TINYINT, 1-5

        [Column(TypeName = "varchar"), MaxLength(2000)]
        public string DESCRIPTION { get; set; }
    }

    // RBAC: IT-Ops-specific functional roles. Seeded codes:
    //   RUNOPS_INITIATOR      - can create assessment cycles/records
    //   DOMAIN_PROJECT_MAPPER - can maintain ITOPS_DOMAIN_PROJECT_MAP
    public class ITOPS_ROLE : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(50)]
        public string ROLE_CODE { get; set; }

        [Column(TypeName = "varchar"), MaxLength(150)]
        public string ROLE_NAME { get; set; }

        [Column(TypeName = "varchar"), MaxLength(500)]
        public string DESCRIPTION { get; set; }
    }

    // Grants a role to an employee, optionally scoped to a single project
    // (PROJECT_ID null = the role applies org-wide).
    public class ITOPS_ROLE_ASSIGNMENT : EntityBase
    {
        public int ROLE_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string EMP_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string PROJECT_ID { get; set; }
    }

    // Master data: which technology domains are eligible for which projects.
    // Drives the domain picklist when an assessment is created for a project.
    public class ITOPS_DOMAIN_PROJECT_MAP : EntityBase
    {
        public int DOMAIN_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string PROJECT_ID { get; set; }
    }

    // Master data: which employees are the assessees for a project, standing
    // config set alongside the project's domain mapping in Configure Scope -
    // Configure Assessment reads this rather than asking for assessees again
    // per cycle. Same replace-semantics convention as ITOPS_DOMAIN_PROJECT_MAP.
    public class ITOPS_PROJECT_ASSESSEE : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(20)]
        public string PROJECT_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string EMP_ID { get; set; }
    }

    // Append-only change log for ITOPS_DOMAIN_PROJECT_MAP: one row per actual
    // state change (Added/Reactivated/Removed), never updated in place - unlike
    // the mapping row itself, which is overwritten on every touch and so can't
    // answer "who removed domain X and when" once it's later re-added.
    public class ITOPS_DOMAIN_PROJECT_MAP_AUDIT : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(20)]
        public string PROJECT_ID { get; set; }

        public int DOMAIN_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string ACTION { get; set; }

        [Column(TypeName = "varchar"), MaxLength(500)]
        public string REASON { get; set; }
    }

    // An assessment cycle (e.g. "H1 2026"). Every ITOPS_ASSESSMENT belongs to one.
    public class ITOPS_ASSESSMENT_MASTER : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(50)]
        public string CYCLE_LABEL { get; set; } // unique

        [Column(TypeName = "date")]
        public DateTime START_DATE { get; set; }

        [Column(TypeName = "date")]
        public DateTime END_DATE { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string STATUS { get; set; }

        [Column(TypeName = "varchar"), MaxLength(500)]
        public string DESCRIPTION { get; set; }
    }

    // One assessment instance per (cycle, domain, project).
    // V2: PROJECT_ID replaces CUST_ID; the single COE_SPOC_EMP_ID /
    // REVIEWER_EMP_ID columns and the CSV ASSESSEE_EMP_ID column are gone -
    // see the three join tables below.
    public class ITOPS_ASSESSMENT : EntityBase
    {
        public int ASSESSMENT_MASTER_ID { get; set; }
        public int DOMAIN_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string PROJECT_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(150)]
        public string BUSINESS_UNIT { get; set; }

        [Column(TypeName = "varchar"), MaxLength(150)]
        public string ACCOUNT_NAME { get; set; }

        [Column(TypeName = "varchar"), MaxLength(30)]
        public string STATUS { get; set; } // NotStarted | Draft | PendingReview | Approved | ReturnedForRevision | Suspended | Closed

        public DateTime? SUBMITTED_DATE { get; set; }
        public DateTime? APPROVED_DATE { get; set; }

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string RETURN_COMMENT { get; set; }
    }

    // Multi-select assessors ("COE SPOCs") on one assessment; IS_PRIMARY marks
    // the lead. Replaces ITOPS_ASSESSMENT.COE_SPOC_EMP_ID.
    public class ITOPS_ASSESSMENT_ASSESSOR : EntityBase
    {
        public int ASSESSMENT_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string ASSESSOR_EMP_ID { get; set; }

        public bool IS_PRIMARY { get; set; }
    }

    // Multi-select reviewers. Replaces ITOPS_ASSESSMENT.REVIEWER_EMP_ID.
    public class ITOPS_ASSESSMENT_REVIEWER : EntityBase
    {
        public int ASSESSMENT_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string REVIEWER_EMP_ID { get; set; }

        public bool IS_PRIMARY { get; set; }
    }

    // Multi-select assessees (no primary flag). Replaces the CSV
    // ITOPS_ASSESSMENT.ASSESSEE_EMP_ID string.
    public class ITOPS_ASSESSMENT_ASSESSEE : EntityBase
    {
        public int ASSESSMENT_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string ASSESSEE_EMP_ID { get; set; }
    }

    // Score entered by the assessor for one parameter within one assessment
    public class ITOPS_SCORE : EntityBase
    {
        public int ASSESSMENT_ID { get; set; }
        public int PARAMETER_ID { get; set; }
        public int? SCORE_VALUE { get; set; } // null = NA; 1-5 otherwise

        [Column(TypeName = "varchar"), MaxLength(2000)]
        public string NOTES { get; set; } // mandatory regardless of score

        public bool IS_IMPROVEMENT_AREA { get; set; } // auto-set when SCORE_VALUE < 5

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string IMPROVEMENT_STATUS { get; set; } // Proposed | Accepted | Rejected

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string REJECTION_JUSTIFICATION { get; set; }
    }

    // Evidence attachments (PDF/JPG/PNG, max 10MB, enforced in the controller).
    // V2: SCORE_ID-only. The V1 FINDING_ID column is gone (deliberate, approved
    // regression) - finding evidence is now stored against the finding's score.
    public class ITOPS_EVIDENCE : EntityBase
    {
        public int SCORE_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(260)]
        public string FILE_NAME { get; set; }

        [Column(TypeName = "varchar"), MaxLength(500)]
        public string STORAGE_PATH { get; set; } // GUID filename under ~/UploadFile/; binary not stored in SQL

        public long FILE_SIZE_BYTES { get; set; }

        [Column(TypeName = "varchar"), MaxLength(100)]
        public string CONTENT_TYPE { get; set; }
    }

    // Findings - the trackable action item derived from a below-target score.
    // V2: no ASSESSMENT_ID column - resolve via SCORE_ID -> ITOPS_SCORE.ASSESSMENT_ID.
    public class ITOPS_FINDING : EntityBase
    {
        public int SCORE_ID { get; set; }
        public int GAP { get; set; } // 5 - SCORE_VALUE

        [Column(TypeName = "varchar"), MaxLength(2000)]
        public string RECOMMENDED_ACTION { get; set; }

        [Column(TypeName = "varchar"), MaxLength(20)]
        public string STATUS { get; set; } // Open | Accepted | Rejected | InProgress | PastDue | Retarget | Closed | Suspended

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string ASSESSEE_EMP_ID { get; set; }

        [Column(TypeName = "date")]
        public DateTime? TARGET_DATE { get; set; }

        [Column(TypeName = "date")]
        public DateTime? REVISED_TARGET_DATE { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string RETARGET_APPROVED_BY { get; set; }

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string RETARGET_REASON { get; set; }

        [Column(TypeName = "varchar"), MaxLength(2000)]
        public string ACTION_TAKEN { get; set; }

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string REJECTION_COMMENT { get; set; }

        public DateTime? LAST_MANAGEMENT_UPDATE { get; set; }
        public DateTime? CLOSED_DATE { get; set; }
    }

    // Free-form activity/audit trail on a finding (comment, escalation, delegation, retarget)
    public class ITOPS_FINDING_ACTIVITY : EntityBase
    {
        public int FINDING_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(30)]
        public string ACTIVITY_TYPE { get; set; } // Comment | Escalation | Delegation | Retarget | Closure

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string COMMENTS { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string FROM_EMP_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string TO_EMP_ID { get; set; }
    }

    // Notification queue/log - drives reminders and escalations.
    // DB CHECK constraint: exactly one of ASSESSMENT_ID / FINDING_ID is non-null.
    public class ITOPS_NOTIFICATION : EntityBase
    {
        [Column(TypeName = "varchar"), MaxLength(50)]
        public string NOTIFICATION_TYPE { get; set; }

        public int? ASSESSMENT_ID { get; set; }
        public int? FINDING_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(50)]
        public string RECIPIENT_EMP_ID { get; set; }

        [Column(TypeName = "varchar"), MaxLength(1000)]
        public string MESSAGE { get; set; }

        public bool IS_SENT { get; set; }
        public DateTime? SENT_DATE { get; set; }
    }
}
