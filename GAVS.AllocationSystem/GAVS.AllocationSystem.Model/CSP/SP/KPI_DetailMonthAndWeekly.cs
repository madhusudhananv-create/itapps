using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KPI_DetailMonthandWeekly
    {
        [Key]
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int GOAL_ID { get; set; }
        public string GOAL_NAME { get; set; }
        public List<KPI_Month_List> KPI_Month { get; set; } = new List<KPI_Month_List>();
        public List<KPI_Quarterly_List> KPI_Quaterly { get; set; } = new List<KPI_Quarterly_List>();
        public List<KPI_Week_List> KPI_week { get; set; } = new List<KPI_Week_List>();

    }

    public class KPI_Quarterly_List
    {
        public string SERVICE_AREA { get; set; }
        public List<KPI> kpilist { get; set; } = new List<KPI>();
        public List<KPIWithTargets> KPIWithTargets { get; set; } = new List<KPIWithTargets>();
        public List<KPI_DETAILS> Quarterly { get; set; } = new List<KPI_DETAILS>();
        public List<string> colorCode { get; set; } = new List<string>();
    }
    public class KPI_Month_List
    {
        public string SERVICE_AREA { get; set; }
        public List<KPI> kpilist { get; set; } = new List<KPI>();
        public List<KPIWithTargets> KPIWithTargets { get; set; } = new List<KPIWithTargets>();
        public List<KPI_DETAILS> Monthly { get; set; } = new List<KPI_DETAILS>();
        public List<string> colorCode { get; set; } = new List<string>();
    }
    public class KPI_Week_List
    {
        public string SERVICE_AREA { get; set; }
        public List<KPI> kpilist { get; set; } = new List<KPI>();
        public List<KPIWithTargets> KPIWithTargets { get; set; } = new List<KPIWithTargets>();
        public List<KPI_DETAILS> Week1 { get; set; } = new List<KPI_DETAILS>();
        public List<KPI_DETAILS> Week2 { get; set; } = new List<KPI_DETAILS>();
        public List<KPI_DETAILS> Week3 { get; set; } = new List<KPI_DETAILS>();
        public List<KPI_DETAILS> Week4 { get; set; } = new List<KPI_DETAILS>();
        public List<KPI_DETAILS> Week5 { get; set; } = new List<KPI_DETAILS>();
        public List<string> colorCode { get; set; } = new List<string>();
    }
}
