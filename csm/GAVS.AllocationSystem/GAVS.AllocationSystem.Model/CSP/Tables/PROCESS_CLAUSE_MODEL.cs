using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_CLAUSE_MODEL
    {
        public int ID { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
        public string CLAUSE_DESCRIPTION { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATE_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }
}
