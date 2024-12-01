using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IDEA_IMPLEMENTATION_PLAN :EntityBase
    {
        public int IDEA_ID { get; set; }

        public string DESCRIPTION { get; set; }
        public decimal? ESTIMATED_EFFORTS { get; set; }
        public string RESPONSIBLE { get; set; }

        public DateTime? ESTIMATED_START_DATE { get; set; }
        public DateTime? ESTIMATED_TARGET_DATE { get; set; }

        public DateTime? ACTUAL_START_DATE { get; set; }
        public DateTime? ACTUAL_END_DATE { get; set; }

        public string COMMENTS { get; set; }

        public string MILESTONE { get; set; }

        public int IDEA_STATUS_ID { get; set; }
        [NotMapped]
        public bool ISSUBMITTED { get; set; }
    }
}
