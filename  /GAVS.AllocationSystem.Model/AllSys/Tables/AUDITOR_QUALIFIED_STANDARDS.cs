using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public  class AUDITOR_QUALIFIED_STANDARDS : EntityBase
    {
        public string EMP_ID { get; set; }
        public string QUALIFICATION_STATUS { get; set; }
        public int QUALIFIED_STANDARDS { get; set; }
        public DateTime EFFECTIVE_FROM { get; set; }
        public DateTime? INACTIVE_FROM { get; set; }
        [NotMapped]
        public string PROCESS_MODEL_ID { get; set; }
    }
}
