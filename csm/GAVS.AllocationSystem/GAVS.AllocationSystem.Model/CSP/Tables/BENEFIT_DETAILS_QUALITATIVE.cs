using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class BENEFIT_DETAILS_QUALITATIVE : EntityBase
    {
        public int BENEFIT_SUMMARY_ID { get; set; }
        public string BENEFIT_TITLE { get; set; }

        public string BENEFIT_DESCRIPTION { get; set; }

        public string TAG { get; set; }

    }
}
