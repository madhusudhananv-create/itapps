using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class TimesheetDetailsMonthly
    {
        public int DATE_ID { get; set; }
        public string CLNDR_DATE { get; set; }
        public string CLNDR_DAY_NAME { get; set; }
        public string CLNDR_DATE_DAY { get; set; }
        public int? PROJ_RESRC_TIME_ENTRY_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string BILLING_PROJ_ID { get; set; }
        public string EMP_ID { get; set; }
        public Int16? PROJ_TASK_ID { get; set; }
        public string TASK_DESC { get; set; }
        public Decimal? CLOCKED_MINS { get; set; }
        public string TIME_ENTRY_STATUS { get; set; }
        public string OTHER_DETAILS { get; set; }
        public DateTime? APPRL_DATE { get; set; }
        public DateTime? REJECT_DATE { get; set; }
        public string REJECT_DESC { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public string PROJ_TASK { get; set; }
        public int TASK_COUNT { get; set; }
        public string FRST_NM { get; set; }
        public bool DUMMY { get; set; }
    }
}
