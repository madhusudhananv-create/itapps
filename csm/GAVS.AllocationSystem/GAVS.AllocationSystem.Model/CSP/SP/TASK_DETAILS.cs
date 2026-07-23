using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class TASK_DETAILS
    {
        public int ID { get; set; }
        public int MONTH_ID { get; set; }
        public int QUARTER_ID { get; set; }
        public int WEEK_ID { get; set; }
        public int DAY_ID { get; set; }
        public string DATE_NAME { get; set; }
        public string WEEK_START_DATE { get; set; }
        public string WEEK_END_DATE { get; set; }
        public string CUST_ID { get; set; }
        public String CUST_NM { get; set; }
        public String PROJ_ID { get; set; }
        public String PROJ_NM { get; set; }
        public int TASK_TYPE_ID { get; set; }
        public String TASK_TYPE { get; set; }
        public int TASK_CATEGORY_ID { get; set; }
        public String TASK_CATEGORY { get; set; }
        public String DESCRIPTION { get; set; }
        public decimal? SCHEDULED_DURATION { get; set; }
        public String STATUS { get; set; }
        public string COLOR_BG { get; set;}
        public string COLOR_MG { get; set; }
        public DateTime? SCHEDULED_START_DATE { get; set; }
        public DateTime DUE_DATE { get; set; }
        public string ASSIGNED_TO { get; set; }
        public string OWNER { get; set; }
        public string FREQUENCY { get; set; }
        public bool? IS_DRAFT { get; set; }

    }
}
