using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_RISK : EntityBase
    {
       
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public string DESCRIPTION { get; set; }
        public int PROBABILITY_SCALE { get; set; }
        public int IMPACT_SCALE { get; set; }
        public string IMPACT { get; set; }
        public string OWNER { get; set; }
        public string AREA { get; set; }
        public string IDENTIFIED_BY { get; set; }
        public DateTime? IDENTIFIED_DATE { get; set; }
        public string RISK_TREATMENT_STRATEGY { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public DateTime? ACTUAL_DATE { get; set; }
        public string STATUS { get; set; }
        public string ACTION_TAKEN { get; set; }
        
        public DateTime? ACCEPT_TILL { get; set; }
        public int? RISK_REPOSITORY_ID { get; set; }
        public bool IS_DRAFT { get; set; }
        public string RISK_CATEGORY { get; set; }
        public string LOCATION { get; set; }
        public int? RISK_RATING { get; set; }
        public string RISK_LEVEL { get; set; }
        public int? NEW_CONSEQUENCES_SCALE { get; set; }
        public int? NEW_LIKELIHOOD_SCALE { get; set; }
        public int? NEW_RISK_RATING { get; set; }
        public string NEW_RISK_LEVEL { get; set; }
        public DateTime? NEW_RISK_ASSESSMENT_DATE { get; set; }
        public string RISK_TREATMENT_EFFECTIVENESS_STATUS { get; set; }
        public string RISK_TREATMENT_EFFECTIVENESS_VERIFIED_BY { get; set; }
        public DateTime? RISK_TREATMENT_EFFECTIVENESS_VERIFIED_DATE { get; set; }
        [NotMapped]
        public int ACTION_ITEM_ID { get; set; }
        [NotMapped]
        public string ACTION_ITEM_DESCRIPTION { get; set; }
        [NotMapped]
        public string ACTION_ITEM_OWNER { get; set; }
        [NotMapped]
        public string ACTION_ITEM_STATUS { get; set; }
        [NotMapped]
        public string ACTION_ITEM_COMMENTS { get; set; }
        [NotMapped]
        public DateTime? ACTION_ITEM_IDENTIFIED_DATE { get; set; }
        [NotMapped]
        public DateTime? ACTION_ITEM_TARGET_DATE { get; set; }
        [NotMapped]
        public DateTime? ACTION_ITEM_COMPLETION_DATE { get; set; }
        public int[] ISO_STD_ID { get; set; }
    }

    [NotMapped]
    public class PROJECT_RISK_EXT : PROJECT_RISK
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NM { get; set; }
        public string OWNER_NAME { get; set; }
        public string RATING { get; set; }
        public string MATRIX { get; set; }
        public bool IS_PLAN_EXISTS { get; set; }
        public bool IS_EDIT_ALLOWED { get; set; }      
        

    }
}
