using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{

    public class CustomerBase
    {
        [Key]
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
    }
    public class CUSTOMER :CustomerBase
    {
       
        public string INDUSTRY_TYPE { get; set; }
        public string URL { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }

        public string EP_ID { get; set; }

        public string  BUSINESS_UNIT { get; set; }
    }
    public class CustomerProjectIds
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
    }
}
