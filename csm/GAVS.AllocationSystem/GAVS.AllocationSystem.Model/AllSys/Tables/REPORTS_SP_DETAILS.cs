using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
   public class REPORTS_SP_DETAILS
    {
        [Key]
        public int ID { get; set; }
        public string SP_NAME { get; set; }
        public string SP_DISPLAY_NAME { get; set; }
        public string DB_NAME { get; set; }
    }
}
