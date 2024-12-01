using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class GET_REQ_STAGE_STATUS
    {
        public int ID { get; set; }
        public int Req_ID { get; set; }
        public string Status { get; set; }

        public string Updated_Person { get; set; }
        public DateTime? Updated_Format_Date { get; set; }
        public string Updated_By { get; set; }
        public DateTime? Updated_Date { get; set; }
        public Boolean isActive { get; set; }

    }
}
