using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CustomerProjects
    {
        public int ID { get; set; }
        public string DISPLAY_NAME { get; set; }
        public string EMAILID { get; set; }
        public Boolean ISVERIFIED { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJECTS { get; set; }
        public string PROJECTIDS { get; set; }
        public List<CUSTOMER_PROJECTS> CUSTOMER_PROJECTS = new List<CUSTOMER_PROJECTS>();
        public bool SPECIFIC_SURVEY_OPTED { get; set; }
        public bool ACSAT { get; set; }
    }
}
