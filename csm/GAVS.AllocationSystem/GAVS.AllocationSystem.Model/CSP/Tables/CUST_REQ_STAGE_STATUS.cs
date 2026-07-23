using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUST_REQ_STAGE_STATUS : EntityBase
    {
         public int Req_ID { get; set; }
        public string Status { get; set; }
       
    }
}
