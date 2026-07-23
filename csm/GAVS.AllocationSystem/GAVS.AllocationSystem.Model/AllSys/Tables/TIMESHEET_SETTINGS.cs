using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class TIMESHEET_SETTINGS
    {
        public int ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string TIME_ENTRY_PERIOD { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
        public int? DAY_LIMIT { get; set; } //
        public int? MONTH_LIMIT { get; set; } //
    }
}
