using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ContractStatusDetails
    {
        public string EMP_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? EMP_NAME { get; set; }
        public string PROJ_NM { get; set; } 
        public DateTime END_DATE { get; set; }
        public string TITLE { get; set; } 
        public string MNGR_NM { get; set; }
    }
}
