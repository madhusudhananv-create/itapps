using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class GlobalKPIData
    {
        public int PERSPECTIVE_ID { get; set; }

        public string KPI_CATEGORY { get; set; }

        public int GLOBAL_KPI_ID { get; set; }
        public string GLOBAL_KPI_NAME { get; set; }

        public string CUST_ID { get; set; }

        public string CUST_NM { get; set; }

        public string PROJ_ID { get; set; }

        public string PROJ_NM { get; set; }
        public string CSM_NAME { get; set; }

        public string CSM_EMP_ID { get; set; }
        public int GOAL_ID { get; set; }

        public string GOAL_DESC { get; set; }

        public int KPI_ID { get; set; }

        public string KPI_NAME { get; set; }

        public DateTime PERIOD { get; set; }

        public string PERIOD_TYPE { get; set; }

        public string ABBREVIATION { get; set; }
        public string SERVICE_AREA { get; set; }

        public decimal? SLA_TARGET_VERYHIGH_VALUE { get; set; }
        public string SLA_TARGET_VERYHIGH_OPERATOR { get; set; }
        public decimal? SLA_TARGET_HIGH_VALUE { get; set; }
        public string SLA_TARGET_HIGH_OPERATOR { get; set; }
        public decimal? SLA_TARGET_MEDIUM_VALUE { get; set; }
        public string SLA_TARGET_MEDIUM_OPERATOR { get; set; }
        public decimal? SLA_TARGET_LOW_VALUE { get; set; }
        public string SLA_TARGET_LOW_OPERATOR { get; set; }

        public string KPI_ACTUAL { get; set; }
        public string MONTH_NM { get; set; }

        public DateTime MONTH_YEAR { get; set; }

        public int YEAR { get; set; }

        public string SLA_TARGET_UNIT_OF_MEASUREMENT { get; set; }

        public string PRIORITY { get; set; }

        public string SUPPORT_WINDOW { get; set; }

        public bool IS_SOW_COMMITMENT { get; set; }
        public string SLA_TARGET_VERYHIGH_DESCRIPTION { get; set; }
        public string SLA_TARGET_HIGH_DESCRIPTION { get; set; }

        public string SLA_TARGET_MEDIUM_DESCRIPTION { get; set; }

        public string SLA_TARGET_LOW_DESCRIPTION { get; set; }

        public bool ISFLAG { get; set; }
    }
}
