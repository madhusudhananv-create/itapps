using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class LAST_UPDATED_DETAILS
    {
        [Key]
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public DateTime LAST_UPDATED_DATE { get; set; }
        public string LAST_UPDATED_BY { get; set; }
    }
}
