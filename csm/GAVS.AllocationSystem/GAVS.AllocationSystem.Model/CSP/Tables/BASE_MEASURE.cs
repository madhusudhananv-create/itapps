using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class BASE_MEASURE: EntityBase
    {
        public string NUMERATORDESCRIPTION { get; set; }
        public string DENOMINATORDESCRIPTION { get; set; }
        public int BASE_MEASURE_FORMULA_TYPE_ID { get; set; }

    }
}
