using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT_COURSE_MAPPING
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int COURSE_ID { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
