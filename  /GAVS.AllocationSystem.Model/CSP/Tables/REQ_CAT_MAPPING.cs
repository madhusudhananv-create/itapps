using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class REQ_CAT_MAPPING
    {
        public int ID { get; set; }
        public int REQ_REF_ID { get; set; }
        public int REQ_CAT_ID { get; set; }
        public string Created_By { get; set; }
        public DateTime Created_Date { get; set; }
        public string Updated_By { get; set; }
        public DateTime Updated_Date { get; set; }
        public Boolean isActive { get; set; }
    }
}
