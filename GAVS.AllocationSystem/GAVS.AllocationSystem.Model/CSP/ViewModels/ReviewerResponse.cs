using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class ReviewerResponse
    {
        public int IDEA_ID { get; set; }

        public string REVIEW_COMMENTS { get; set; }
        public int IDEA_STATUS_ID { get; set; }

        public string IDEA_STATUS_TITLE { get; set; }
    }
}
