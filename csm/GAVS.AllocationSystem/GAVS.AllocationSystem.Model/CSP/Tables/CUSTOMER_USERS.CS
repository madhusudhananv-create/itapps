using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CUSTOMER_USERS
    {
        public int ID { get; set; }
        public string EMAILID { get; set; }
        public string DISPLAY_NAME { get; set; }
        public string PASSWORD { get; set; }
        public string USER_GUID { get; set; }
        public string ACTIVATION_CODE { get; set; }
        public DateTime? ACTIVATION_VALIDITY { get; set; }
        public Boolean ISVERIFIED { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
        public Boolean? SPECIFIC_SURVEY_OPTED { get; set; }       

    }
    public class CUSTOMER_USERS_LIST
    {
        public int CUSTOMER_USER_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string EMAILID { get; set; }
        public string DISPLAY_NAME { get; set; } 
    } 
}
