using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_WEIGHTAGE
    {
        public int ID { get; set; }
        public int WEIGHTAGE_ID { get; set; }
        public string WEIGHTAGE_TITLE { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        public decimal WEIGHTAGE_SCORE { get; set; }        
    }

    //[NotMapped]
    //public class AUDIT_CHECKLIST_WEIGHTAGE_EXTENDED : AUDIT_CHECKLIST_WEIGHTAGE
    //{
    //    public int CHECKLIST_ID { get; set; }       
    //    public bool IsUsedInChecklist { get; set; }

    //}
}
