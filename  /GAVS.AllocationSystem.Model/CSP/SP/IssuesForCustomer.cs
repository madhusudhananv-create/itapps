using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IssuesForCustomer 
    {
        public int ID { get; set; }
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
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
        public string CUST_ID { get; set; }

        public string CUST_NM { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public string PROJ_NM { get; set; }
    }
}
