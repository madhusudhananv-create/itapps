using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CHECKLIST_SCORES_BY_AUDIT
    {
        public int ID { get; set; }
        public int CHECKLIST_ID { get; set; }
        public int AUDIT_ID { get; set; }
        public decimal SCORE { get; set; }
        public decimal PERCENTAGE_SCORE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }

        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

        public bool MAIL_SENT { get; set; }
    }
}
