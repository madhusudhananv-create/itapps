using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    [NotMapped]
    public class TASK_EXTENDED : TASK
    {
        public string CUST_NM { get; set; }
        public string PROJ_NM { get; set; }

        public string OWNER_NAME { get; set; }
        public string ASSIGNED_TO_NAME { get; set; }
    }
}
