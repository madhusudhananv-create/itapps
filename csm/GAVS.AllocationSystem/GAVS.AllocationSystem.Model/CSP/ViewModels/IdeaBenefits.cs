using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class IdeaBenefits
    {
        public IDEA_BENEFIT_SUMMARY IDEA_BENEFIT_SUMMARY { get; set; }
        public BENEFIT_DETAILS_QUANTITATIVE_VM BENEFIT_DETAILS_QUANTITATIVE_VM { get; set; }
        public BENEFIT_DETAILS_QUALITATIVE BENEFIT_DETAILS_QUALITATIVE { get; set; }
    }
}
