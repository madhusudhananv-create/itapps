using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;

namespace GAVS.AllocationSystem.Model.AllSys
{ 
    
    public class EMP_INFO_FOR_CUSTOMER
    {           
        [Key]     
        public string EMP_ID { get; set; }
        public string EMAIL_ID { get; set; }
        public string DISPLAY_NAME { get; set; }
        public string PROJ_ID { get; set; }
    }

    public class EMP_RISK_ADD_SEND_EMAIL
    {
        [Key]
        public string EMP_ID { get; set; }
        public string Proj_ID { get; set; }
        public string EMAIL_ID { get; set; }
        public string PREMIER_EMAIL_ID { get; set; }
    }
}
