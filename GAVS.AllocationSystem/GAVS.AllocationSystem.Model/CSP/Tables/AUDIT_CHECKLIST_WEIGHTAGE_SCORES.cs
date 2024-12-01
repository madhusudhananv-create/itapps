using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class AUDIT_CHECKLIST_WEIGHTAGE_SCORES
    {
        public int ID { get; set; }
        public int CHECKLIST_ID { get; set; }
        public int WEIGHTAGE_ID { get; set; }
        public decimal WEIGHTAGE_SCORE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
    }

    [NotMapped]
    public class AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED : AUDIT_CHECKLIST_WEIGHTAGE_SCORES
    {
        public string WEIGHTAGE_TITLE { get; set; }
        public bool IS_CHECKED { get; set; }
        public bool IS_USED_IN_SUMBITTED_ASSESSMENT { get; set; }
    }
}
