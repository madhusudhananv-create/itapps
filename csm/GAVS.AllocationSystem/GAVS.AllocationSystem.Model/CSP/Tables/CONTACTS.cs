using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CONTACTS : EntityBase
    {
         
        public string CUSTOMER_ID { get; set; }
        public string CONTACT_NAME { get; set; }
        public string CONTACT_ROLE { get; set; }
        public string CONTACT_EMAILID { get; set; }
        public string CONTACT_PHONE { get; set; }
        public string CONTACT_TYPE { get; set; }
       
        public string CONTACT_EMP_ID { get; set; }
        public int? ROLE_ID { get; set; }

        [NotMapped]
        public bool? SPECIFIC_SURVEY_OPTED { get; set; }
        [NotMapped]
        public bool  ACSAT { get; set; }

        public string CATEGORY { get; set; }

    } 
}
