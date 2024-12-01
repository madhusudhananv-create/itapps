using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public  class PM_MATURITYLEVEL_MAPPING
    {
        public int PROCESS_MODEL_ID { get; set; }
        [Key]
        public int MATURITY_LEVEL_ID { get; set; }

        public int LEVEL_NUMBER { get; set; }

        public string LEVEL_TITLE { get; set; }

        public string LEVEL_DESC { get; set; }

        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }

        public string UPDATED_BY { get; set; }

        public DateTime UPDATED_DATE { get; set; }

        public decimal? LOWER_BOUND_SCORE { get; set; }

        public decimal? UPPER_BOUND_SCORE { get; set; }
    }
}
