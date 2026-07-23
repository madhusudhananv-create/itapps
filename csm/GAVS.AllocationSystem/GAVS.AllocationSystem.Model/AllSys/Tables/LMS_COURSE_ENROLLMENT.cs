using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class LMS_COURSE_ENROLLMENT : EntityBase
    {
        public int COURSE_ID { get; set; }
        public int LMS_ENROLLMENT_ID { get; set; }
        public DateTime ENROLLMENT_DATE { get; set; }
        public string PROJ_ID { get; set; }
        public string EMP_ID { get; set; }
        public bool STATUS { get; set; }
    }
}
