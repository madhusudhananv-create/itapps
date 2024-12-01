using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_SCORES: CUSTOMER_PROJECT_PORTFOLIO
    {
        public string SCORE { get; set; }
        public decimal dSCORE { get; set; }
        public string COLOR { get; set; }
    }
    public class SUCCESS_GOALS_SCORES : CUSTOMER_PROJECT_PORTFOLIO
    {
        public string GOAL_NAME { get; set; }
        public int GOAL_ID { get; set; }
        public string SCORE { get; set; }
        public decimal DSCORE { get; set; }
        public string COLOR { get; set; }
    }
}
