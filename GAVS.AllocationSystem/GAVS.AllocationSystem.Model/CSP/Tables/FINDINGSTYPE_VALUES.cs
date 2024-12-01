using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class FINDINGSTYPE_VALUES
    {
        public int ID { get; set; }
        public int FINDINGSTYPE_ID { get; set; }
        public string FINDINGTYPE_VALUE { get; set; }
        public string CREATED_BY { get; set; }

        public DateTime CREATED_DATE { get; set; } = new DateTime();

        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; } = new DateTime();
        public bool ISACTIVE { get; set; }

        public string FINDINGTYPE_CATEGORY { get; set; }

        public string GO_CATEGORY { get; set; }
        public bool MANDATORYTYPE_FOR_FAILED_STATUS { get; set; }
    }
}
