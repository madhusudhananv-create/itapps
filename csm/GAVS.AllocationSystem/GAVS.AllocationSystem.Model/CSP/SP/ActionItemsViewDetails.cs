using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class ActionItemsViewDetails : EntityBase
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }

        public string PROJ_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public int ACTION_ITEM_ID { get; set; }
        public string RAG { get; set; }
        public string DESCRIPTION { get; set; }
        public string SOURCE { get; set; }

        public string SOURCE_DESCRIPTION { get; set; }
        public string OWNER { get; set; }
        public DateTime IDENTIFIED_DATE { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public string ROOT_CAUSE { get; set; }
        public string RATING_DESCRIPTION { get; set; }
        public int RATING { get; set; }
        public string QUESTION { get; set; }
        public string PREVENTIVE_ACTION_PLAN { get; set; }

        public string STATUS { get; set; }
        public string PRIORITY { get; set; }
        public Nullable<DateTime> COMPLETION_DATE { get; set; }
        public string COMMENTS { get; set; }
        public string STATUS_TYPE { get; set; }
        public int? BATCH_CUSTOMER_ID { get; set; }
        public int? BATCH_CUSTOMER_MONTHLY_ID { get; set; }
        public int? RISK_ID { get; set; }
        public string ORIGINAL_DESCRIPTION { get; set; }
        public DateTime? NEW_RISK_ASSESSMENT_DATE { get; set; }
        public string RISK_TREATMENT_EFFECTIVENESS_STATUS { get; set; }
        public string RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY { get; set; }
        public DateTime? RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE { get; set; }
        public DateTime? PLANNED_TARGET_DATE { get; set; }
        public DateTime? PLANNED_ACTUAL_DATE { get; set; }       
        public bool SEND_MAIL { get; set; }
        public string CSS_REFERENCE { get; set; }
        [NotMapped]
        public string CUSTOMER_REMARKS { get; set; }
        [NotMapped]
        public int? SCORE { get; set; }
        [NotMapped]
        public string PERSPECTIVE { get; set; }
        public DateTime? ACTUAL_CUST_DATE { get; set; }
        public DateTime? PLANNED_CUST_DATE { get; set; }
        public DateTime? CLOSURE_ACTUAL_CUST_DATE { get; set; }
        public Nullable<bool> ACTUAL_PLAN_DECLARATION { get; set; }
        public Nullable<bool> PLANNED_DECLARATION { get; set; }
        public Nullable<bool> CLOSURE_ACKNOWLEDGE { get; set; }

    }

    public class ActionItemsAreaVaue
    {
        public string MONTH_NAME { get; set; }
        public int STATUS { get; set; }

    }
    public class AccountHealthOutput
    {
        public List<AccountHealth> Need_Control { get; set; }
        public List<AccountHealth> Under_Control { get; set; }
    }
    public class AccountHealth
    {
        public int? PROJECT_COUNT { get; set; }
        public int? PORTFOLIO_COUNT { get; set; }

        public string FOCUS_TYPE { get; set; }
    }

    public class ProjectResourceCount
    {
        public string CUST_NM { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PROJ_ID { get; set; }

        public string PEOPLE_TYPE { get; set; }

        public int? MEMBER_COUNT { get; set; }
    }
   
}
