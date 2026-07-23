using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class BASE_MEASURE_FORMULA_TYPE : EntityBase
    {
        public string FORMULA_DESCRIPTION { get; set; }
        public string FORMULA { get; set; }
        public string SLA_FORMULA { get; set; }
        
    }
}
