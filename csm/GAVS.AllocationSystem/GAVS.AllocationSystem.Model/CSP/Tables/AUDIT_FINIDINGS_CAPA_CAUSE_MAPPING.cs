using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING
    {
        public int ID { get; set; }
        public int AUDIT_ID { get; set; }
        public int QUESTION_ID { get; set; }
        public int CAPA_ID { get; set; }
        public int CAUSE_ID { get; set; }
        public int ROOT_CAUSE_ID { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
