using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class AllIdeaDetails
    {
        public IDEA IDEA { get; set; }
        public List<IdeaBenefits> IDEA_BENEFITS { get; set; }
        public List<IDEA_IMPLEMENTATION_PLAN> IMPLEMENTATION_SCHDULES { get; set; }

        public List<IdeaStages> IdeaStages { get; set; }
    }
}
