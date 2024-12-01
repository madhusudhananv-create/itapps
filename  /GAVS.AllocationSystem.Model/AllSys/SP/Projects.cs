using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class Projects : ProjectBase
    {
      
        public string PROJ_ALIAS_NM { get; set; }
        public string BILLING_PROJ_ID { get; set; }
        public string BILLING_PROJ_NM { get; set; }
        public bool BILL_FLG { get; set; }
        public string UPDATED_DATE { get; set; }
       
        public string QUALITY_SPOC { get; set; }

    }

    public class ProjectBase : ProjectsBaseCustomer
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
    }

    public class ProjectsBaseCustomer
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public bool IS_SLA_AVAILABLE { get; set; }

    }
}
