using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class CONFIGURATION_EXT : EntityBase
    {
      
        public string KEY { get; set; }
        public string DESCRIPTION { get; set; }
        public string VALUE { get; set; }
        public string COMMENTS { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public bool ISENCRYPT { get; set; }
       
        public DateTime? START_DATE { get; set; }
        public DateTime? END_DATE { get; set; }
    }
}
