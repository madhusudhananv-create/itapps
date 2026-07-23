using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class ProductPortfolioDetails : EntityBase
    {
        public int PORTFOLIO_ID { get; set; }
        public string Portfolio { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public int SERVICE_AREA_TYPE_ID { get; set; }
        public string SERVICE_AREA_TYPE { get; set; }
        public int TIER_ID { get; set; }
        public string MTTR { get; set; }
        public string MODE_TITLE { get; set; }
        public string MODE_TYPE { get; set; }

        public int MODE_ID { get; set; }
        public bool IS_SERVICE_COMMENCED { get; set; }
        public DateTime? SERVICE_COMMENCEMENT_DATE { get; set; }


    }
}
