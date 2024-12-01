using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.SP
{
    public class ProductResponsibleDetails
    {
        public int ID { get; set; }

        public string PORTFOLIO_NAME { get; set; }

        public string PRODUCT_TITLE { get; set; }

        public string NAME { get; set; }

        public string MAIL { get; set; }

        public int MANAGEMENT_TYPE_ID { get; set; }

        public string MANAGEMENT_TYPE { get; set; }

        public DateTime EFFECTIVE_FROM { get; set; }

        public string CREATED_BY { get; set; }

        public DateTime CREATED_DATE { get; set; }

    }
}
