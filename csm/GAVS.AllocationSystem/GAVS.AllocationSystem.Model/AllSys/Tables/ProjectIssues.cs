using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
   public class ProjectIssues
    {
        public int ID { get; set; }
        public int count { get; set; }
        public string PROJ_ID { get; set; }
        public string PRJ_NM { get; set; }
        public string Level { get; set; }
        public string Severity { get; set; }
        public bool IsNeedFocus { get; set; }
        public string RAG { get; set; }
    }
}
