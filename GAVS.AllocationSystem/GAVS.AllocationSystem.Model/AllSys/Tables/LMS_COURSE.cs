using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys.Tables
{
    public class LMS_COURSE : EntityBase
    {
        public int LMS_COURSE_ID { get; set; }
        public string CATEGORY { get; set; }
        public string FULL_NAME { get; set; }
        public string SHORT_NAME { get; set; }
        public string SUMMARY { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime? END_DATE { get; set; }
    }
}
