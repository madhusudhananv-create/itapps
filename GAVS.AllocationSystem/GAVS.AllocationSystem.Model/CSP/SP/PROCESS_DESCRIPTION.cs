using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_DESCRIPTION
    {
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int MODEL_ID { get; set; }
        public string PROCESS_MODEL_DESCRIPTION { get; set; }
        public int AREA_ID { get; set; }
        public string PROCESS_AREA_DESCRIPTION { get; set; }
        public int GAVS_SERVICE_AREA { get; set; }
        public int DESCRIPTION_ID { get; set; }
        public string PRACTISE_DESCRIPTION { get; set; }
        public bool APPLICABLE { get; set; }
    }
}
