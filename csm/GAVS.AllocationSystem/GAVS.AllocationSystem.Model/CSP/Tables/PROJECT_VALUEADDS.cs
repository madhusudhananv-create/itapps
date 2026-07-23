using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_VALUEADDS
    {
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public string DESCRIPTION { get; set; }
        public string BENEFITS { get; set; }
        public string VALUEADD_BY { get; set; }
        public string ACTION_PLAN { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public string STATUS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
