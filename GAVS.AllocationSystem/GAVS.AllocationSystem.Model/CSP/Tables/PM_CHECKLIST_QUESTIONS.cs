using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_CHECKLIST_QUESTIONS : EntityBase
    {
       
        public int CHECKLIST_ID { get; set; }
        public string TITLE { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public int WEIGHTAGE_ID { get; set; }
        public int GLOBAL_PERSPECTIVE_ID { get; set; }
        public int MATURITY_LEVEL_ID { get; set; }
       
        [NotMapped]
        public decimal? DISPLAY_ORDER { get; set; }
    }
}
