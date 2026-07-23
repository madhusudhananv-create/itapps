using GAVS.AllocationSystem.Model.CSP.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class FINDING_STAGE_DATA
    {
        public AUDIT_REPORTING_FINDING AUDIT_REPORTING_FINDING { get; set; } = new AUDIT_REPORTING_FINDING();
        public AUDITEE_ACCEPTANCE_STATUS AUDITEE_ACCEPTANCE_STATUS { get; set; } = new AUDITEE_ACCEPTANCE_STATUS();
        public CAPA_SUBMISSION CAPA_SUBMISSION { get; set; } = new CAPA_SUBMISSION();
        public CAPA_REVIEW CAPA_REVIEW { get; set; } = new CAPA_REVIEW();
        public AUDIT_CAPA_IMPLEMENTATION CAP_IMPLEMENTATION { get; set; } = new AUDIT_CAPA_IMPLEMENTATION();
        public AUDIT_REPORTING_VERIFICATION CAP_VERIFICATION { get; set; } = new AUDIT_REPORTING_VERIFICATION();
        public CAPA_CUSTOMER_APPROVAL CAPA_CUSTOMER_APPROVAL { get; set; } = new CAPA_CUSTOMER_APPROVAL();
    }

    public class AUDIT_REPORTING_FINDING
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public AUDIT_CHECKLIST_PROJECT_FINDINGS FINDINGS { get; set; } = new AUDIT_CHECKLIST_PROJECT_FINDINGS();
    }

    public class AUDITEE_ACCEPTANCE_STATUS
    {
        public AUDITEE_ACCEPTANCE AUDITEE_ACCEPTANCE { get; set; } = new AUDITEE_ACCEPTANCE();
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
    }
    public class CAPA_SUBMISSION
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public List<AUDIT_FINDING_CAPPA_EXT> CAPA { get; set; } = new List<AUDIT_FINDING_CAPPA_EXT>();
    }
    public class CAPA_REVIEW
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED> CAPA { get; set; } = new List<AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED>();
    }
    public class AUDIT_CAPA_IMPLEMENTATION
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public List<AUDIT_FINDING_CAPA_IMPLEMENTATION> CAPA { get; set; } = new List<AUDIT_FINDING_CAPA_IMPLEMENTATION>();
    }

    public class AUDIT_REPORTING_VERIFICATION
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public List<AUDIT_FINDING_CAPA_VERIFICATION> CAPA { get; set; } = new List<AUDIT_FINDING_CAPA_VERIFICATION>();
    }

    public class AUDIT_FINDING_CAPPA_EXT
    {
        public int CAUSE_ID { get; set; }
        public AUDIT_FINDINGS_CAPA CAPPALIST { get; set; } = new AUDIT_FINDINGS_CAPA();
    }

    public class CAPA_CUSTOMER_APPROVAL
    {
        public AUDIT_FINDING_STAGES_MAPPING STATUS { get; set; } = new AUDIT_FINDING_STAGES_MAPPING();
        public List<CUSTOMER_CAPA_APPROVAL> CAPA { get; set; } = new List<CUSTOMER_CAPA_APPROVAL>();
    }
}
