using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_QUESTIONS
    {
        public int ID { get; set; }
        public int CHECKLIST_ID { get; set; }
        public decimal? VERSIONID { get; set; }
        public int WEIGHTAGE_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public string LOOK_FOR { get; set; }
        public bool ISAPPLICABLE { get; set; }
        public int CATEGORY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
        public bool ISSUBMITTED { get; set; }
        [NotMapped]
        public List<int> CLAUSES { get; set; } = new List<int>();

    }
}
