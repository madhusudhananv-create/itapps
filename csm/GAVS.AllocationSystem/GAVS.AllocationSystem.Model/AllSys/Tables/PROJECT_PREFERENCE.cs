using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT_PREFERENCE
    {
        [Key]
        public string PROJ_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PREFERENCE_TITLE { get; set; }
        public Boolean ALLOW { get; set; }
    }
}