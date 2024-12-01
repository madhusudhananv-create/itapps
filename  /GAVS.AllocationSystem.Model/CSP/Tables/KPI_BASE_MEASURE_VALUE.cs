using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class KPI_BASE_MEASURE_VALUE : EntityBase
    {

        public int BASE_MEASURE_ID { get; set; }

        public int KPI_DETAILS_ID { get; set; }

        //public decimal? MEASURE_VALUE { get; set; }

        public decimal? NUMERATOR { get; set; }

        public decimal? DENOMINATOR { get; set; }

        public bool? IS_EXCLUSION { get; set; }

    }
}
