using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class LMS_COURSE_COMPLETION : EntityBase
    {
        public int ENROLLMENT_ID { get; set; }
        public string EMP_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime? COMPLETED_DATE { get; set; }
    }
}
