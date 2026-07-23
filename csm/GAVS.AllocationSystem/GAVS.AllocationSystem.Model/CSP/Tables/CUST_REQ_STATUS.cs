using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class CUST_REQ_STATUS
    {
        public int ID { get; set; }
        public string Status { get; set; }
        public string Created_By { get; set; }
        public DateTime Created_Date { get; set; }
        public string Updated_By { get; set; }
        public DateTime Updated_Date { get; set; }
        public Boolean IsActive { get; set; }
    }
}
