using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PM_MATURITY_LEVEL
    {
        public int ID { get; set; }
        public string TITLE { get; set; }

        public string DESCRIPTION { get; set; }
        public string CREATED_BY { get; set; }

        public DateTime CREATED_DATE { get; set; }

        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }

        public bool ISACTIVE { get; set; }
    }
}
