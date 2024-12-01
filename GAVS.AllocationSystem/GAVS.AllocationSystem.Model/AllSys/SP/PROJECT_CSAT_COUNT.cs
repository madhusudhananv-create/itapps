using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT_CSAT_COUNT
    {
        public List<CSP.PROJECT_CSAT_DATA> CSAT_4_DATA { get; set; } = new List<CSP.PROJECT_CSAT_DATA>();
        public List<CSP.PROJECT_CSAT_DATA> CSAT_5_DATA { get; set; } = new List<CSP.PROJECT_CSAT_DATA>();
        public List<CSP.PROJECT_CSAT_DATA> CSAT_3_DATA { get; set; } = new List<CSP.PROJECT_CSAT_DATA>();
        public List<CSP.PROJECT_CSAT_DATA> NPS_HIGH_DATA { get; set; } = new List<CSP.PROJECT_CSAT_DATA>();
        public List<CSP.PROJECT_CSAT_DATA> NPS_LOW_DATA { get; set; } = new List<CSP.PROJECT_CSAT_DATA>();
        public string QUARTER { get; set; }

    }

}
