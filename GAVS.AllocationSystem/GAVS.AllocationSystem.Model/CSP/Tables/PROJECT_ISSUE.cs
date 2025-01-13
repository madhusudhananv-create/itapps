using GAVS.AllocationSystem.Model.Base;
using System;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_ISSUE : EntityBase
    {
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }

        public string DESCRIPTION { get; set; }
        public string IMPACT_SUMMARY { get; set; }
        public Boolean IS_POTENTIAL_RISK { get; set; }
        public string BUSINESS_IMPACT { get; set; }
        public string GEO_LOCATION { get; set; }
        public string ISSUE_TYPE { get; set; }
        public string SEVERITY { get; set; }
        public string ACTION_PLAN { get; set; }
        public string ASSIGNED_TO { get; set; }
        public string IDENTIFIED_BY { get; set; }
        public string REPORTED_BY { get; set; }
        public string LEVEL { get; set; }
        public DateTime IDENTIFIED_DATE { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public string STATUS { get; set; }
        public DateTime? ISSUE_RESOLVED_DATE { get; set; }
        public string COMMENTS { get; set; }

        //public Boolean ISCUSTOMERESCALATED { get; set; }

        public string SUBVERTICAL { get; set; }

        public string ROOTCAUSE { get; set; }

        public DateTime? ACK_DATE { get; set; }

        public string SERVICE_IMPACT { get; set; }

        public bool? FINANCIAL_IMPACT { get; set; }

        public string FINANCIAL_IMPACT_DESCRIPTION { get; set; }

        public string ISSUE_SOURCE { get; set; }

        public string LOCATION_SELECTION { get; set; }

        public string ISSUE_SOURCE_OTHER { get; set; }
    }
}