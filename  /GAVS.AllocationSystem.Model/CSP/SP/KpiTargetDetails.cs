using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class KpiTargetsBase
    {
        public decimal? Targetveryhighvalue { get; set; }
        public string Targetveryhighoperator { get; set; }
        public decimal? Targethighvalue { get; set; }
        public string Targethighoperator { get; set; }
        public decimal? Targetlowvalue { get; set; }
        public string Targetlowoperator { get; set; }
        public decimal? Targetmediumvalue { get; set; }
        public string Targetmediumoperator { get; set; }
        public decimal? KpiActualValue { get; set; }

        public DateTime Kpistartdate { get; set; }
        public DateTime Kpienddate { get; set; }

        public string Veryhighdesc { get; set; }
        public string Highdesc { get; set; }
        public string Mediumdesc { get; set; }
        public string Lowdesc { get; set; }
    }
}
