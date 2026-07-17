using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUSTOMER_PROJECT_PORTFOLIO
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }
        public string CUSTOMER_NM { get; set; }
        public string PROJECT_PLAN_URL { get; set; }
        public decimal TOTAL_KPIS { get; set; }
        public decimal MET_KPIS { get; set; }
        public decimal TOTAL_KPI_AREA { get; set; }

        public string BUSINESS_UNIT { get; set; }
    }
}
