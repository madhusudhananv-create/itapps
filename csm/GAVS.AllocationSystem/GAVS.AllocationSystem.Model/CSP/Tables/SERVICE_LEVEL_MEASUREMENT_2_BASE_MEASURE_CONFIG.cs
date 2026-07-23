using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG : EntityBase
    {
        public int KPI_ID { get; set; }

        public int BASE_MEASURE_ID { get; set; }

        public int DISPLAY_ORDER { get; set; }
        public int? MASTER_ID { get; set; }
    }
}
