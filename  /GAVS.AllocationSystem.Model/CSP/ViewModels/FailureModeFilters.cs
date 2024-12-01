using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class FailureModeFilters
    {
        public string ProjectId { get; set; }

        public int ServiceAreaId { get; set; }

        public int ProcessId { get; set; }

        public int ServiceLevel { get; set; }

        public int TaskId { get; set; }
    }
}
