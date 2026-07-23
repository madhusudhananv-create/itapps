using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PORTFOLIO
    {
        public int ID { get; set; }
        public string TITLE { get; set; }
        public string CONTACT_NAME { get; set; }
        public string CONTACT_EMAILID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }

        public string LEAD_EMP_ID { get; set; }
    }
}
