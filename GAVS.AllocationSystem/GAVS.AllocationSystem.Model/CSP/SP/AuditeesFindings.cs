using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class AuditeesFindings
    {
        public string EMP_ID { get; set; }

        public string FRST_NM { get; set; }

        public string EMAIL_ID { get; set; }
        public int FINDING_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public string TYPE { get; set; }
        public DateTime? CREATED_DATE { get; set; }
    }

    public class FindingsByAuditee
    {
        public string EMP_ID { get; set; }

        public string FRST_NM { get; set; }

        public string EMAIL_ID { get; set; }

        public FindingsByAuditee(string empid, string frstnm, string emailid)
        {
            this.EMP_ID = empid;
            this.FRST_NM = frstnm;
            this.EMAIL_ID = emailid;
        }

        public List<AuditeesFindings> FINDINGS { get; set; }
    }
}
