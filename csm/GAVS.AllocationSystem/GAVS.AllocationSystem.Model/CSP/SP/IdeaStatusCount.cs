using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IdeaStatusCount
    {
        public string Type { get; set; }
        public string Improvement_Type { get; set; }
        public int Submitted { get; set; }
        public int Execution { get; set; }
        public int Implemented { get; set; }
    }
}
