using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_MODEL_PROJECT_CONFIG
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int DESCRIPITION_ID { get; set; }
        public bool APPLICABLE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set;}
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }



    }
}
