using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_AREA: EntityBase
    {
        
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
       
     
        //public IList<PROCESS> PROCESSES { get; set; }
        public bool SHOW_IN_MASTER { get; set; }
    }
}
