using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IDEA :EntityBase
    {
        public string PROJECT_ID { get; set; }

        public int? SERVICE_AREA_ID { get; set; }

        public int IDEA_STATUS_ID { get; set; }

        public string DESCRIPTION { get; set; }

        public string POTENTIAL_SOLUTION_DESCRIPTION { get; set; }

        public int? POTENTIAL_SOLUTION_CATEGORY_ID { get; set; }

        public int? IDEA_IMPROVEMENT_TYPE_ID { get; set; }

        public string [] IDENTIFIED_BY { get; set; }

        public DateTime? IDENTIFIED_DATE { get; set; }

        public int? PROCESS_AREA_ID { get; set; }

        public int? PROCESS_ID { get; set; }

        public string COMMENTS { get; set; }

        public bool ISSUBMITTED { get; set; }
        public int STAGE_ID { get; set; }

        public string REVIEW_COMMENTS { get; set; }
        public object Clone()
        {
            return this.MemberwiseClone();
        }

    }
    [NotMapped]
    public class IdeaModel : IDEA
    {
        public string CUST_ID { get; set; }

        public int? PORTFOLIO_ID { get; set; }
    }

    public class ServiceAres_VM
    {
        public int ID { get; set; }

        public string TITLE { get; set; }
    }

    public class ImplementedIdea
    {
        public string CUST_ID { get; set; }

        public string PROJECT_ID { get; set; }
        
        public DateTime IDENTIFIED_DATE { get; set; }

        public string PROCESS_AREA { get; set; }

        public string DESCRIPTION { get; set; }

        public string POTENTIAL_SOLUTION_DESCRIPTION { get; set; }


        public DateTime? ACTUAL_START_DATE { get; set; }

        public DateTime? ACTUAL_TARGET_DATE { get; set; }

        public DateTime? ESTIMATED_START_DATE { get; set; }

        public DateTime? ESTIMATED_TARGET_DATE { get; set; }
        public string STATUS { get; set; }

        public string RESPONSIBLE { get; set; }

        public string APPROVER_NAME { get; set; }
    }
    
}
