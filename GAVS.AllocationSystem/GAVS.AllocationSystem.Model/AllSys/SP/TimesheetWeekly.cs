using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class TimesheetWeekly
    {
        public int DATE_ID { get; set; }
        public string STARTDATE { get; set; }
        public string ENDDATE { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public Decimal CLOCKED_MINS { get; set; }
        public string TIME_ENTRY_STATUS { get; set; }
        public int PROJ_TASK_ID { get; set; }
        public string PROJ_TASK_NAME { get; set; }
    }
}
