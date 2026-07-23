using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class TIMEFORMAT_CONFIG
    {        
        public int ID { get; set; }
        public int MINVALUE { get; set; }
        public int MAXVALUE { get; set; }
        public string MODE { get; set; }
        public string ALIAS { get; set; }
        public string FORMULE { get; set; }
        
    }
}
