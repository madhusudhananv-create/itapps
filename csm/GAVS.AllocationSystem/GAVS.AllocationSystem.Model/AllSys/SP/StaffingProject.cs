using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class StaffingProject
    {
        public string PROJECT_NAME { get; set; }
        public string PARENT_PROJ_ID { get; set; }
        public int? TOTAL_HEAD_COUNT { get; set; }
        public int? BILLED { get; set; }
        public int? UNBILLED { get; set; }
        public int? OFFSHORE_BILLED { get; set; }
        public int? OFFSHORE_UNBILLED { get; set; }
        public int? ONSHORE_BILLED { get; set; }
        public int? ONSHORE_UNBILLED { get; set; }
        public string EMP_NAME { get; set; }
        public string EMP_START_DATE { get; set; }
        public string BILL_FLG { get; set; }
        public string IS_ONSITE { get; set; }

    }
}
