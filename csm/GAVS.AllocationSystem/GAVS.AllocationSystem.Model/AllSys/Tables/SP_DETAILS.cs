using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
   public class SP_DETAILS
    {
        [Key]
        public int SPID { get; set; }
        public string ProcedureName { get; set; }
        public string DisplayName { get; set; }
        public string DBName { get; set; }
    }
}
