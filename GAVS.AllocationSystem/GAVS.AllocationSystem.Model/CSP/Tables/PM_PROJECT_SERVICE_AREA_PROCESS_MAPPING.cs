using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING
    {
        public int ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

        public string PROCESS_TAILORING_NOTES { get; set; }
        [NotMapped]
        public int PROCESS_Area_ID { get; set; }

        [NotMapped]
        public bool IS_DIRTY { get; set; }
    }
}
