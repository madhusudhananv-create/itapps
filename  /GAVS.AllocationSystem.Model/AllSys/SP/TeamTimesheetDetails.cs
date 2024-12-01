using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class TeamTimesheetDetails
    {
        public int DATE_ID { get; set; }
        public string STARTDATE { get; set; }
        public string ENDDATE { get; set; }
        public string PROJ_ID { get; set; }
        public Decimal CLOCKED_MINS { get; set; }
        public string TIME_ENTRY_STATUS { get; set; }
        public string EMP_ID { get; set; }
        public string EMP_NAME { get; set; }
        public string PROJ_NM { get; set; }
    }
}
