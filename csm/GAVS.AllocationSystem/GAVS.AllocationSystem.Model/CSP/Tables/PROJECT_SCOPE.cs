using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_SCOPE : EntityBase
    {
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public string DESCRIPTION { get; set; }
        public string TECHNOLOGY_USED { get; set; }
        public string SCOPE { get; set; }
        public string OBJECTIVES { get; set; }
        public string DELIVERABLES { get; set; }
        public string INSCOPE_ID { get; set; }
        public string CONSTRAINTS { get; set; }
        public string ASSUMPTIONS { get; set; }
        public string OUT_SCOPE { get; set; }

    }



}
