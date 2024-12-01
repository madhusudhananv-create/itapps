using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUSTOMER_PROJECTS : EntityBase
    {
      
        public int CUSTOMER_USER_ID { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public Boolean REPORTING { get; set; }
        public Boolean CSAT_SURVEY { get; set; }
        public string CSAT_FREQUENCY { get; set; }
       
    }
    [NotMapped]
    public class CUSTOMER_PROJECTS_EXT: CUSTOMER_PROJECTS
    {
        public string PROJ_ALIAS_NM { get; set; }
    }
}
