using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CRISP_RAG_SUMMARY : DashboardSummary
    {
        public DateTime PUBLISHED_DATE { get; set; }
        public int SCORE { get; set; }
    }
    public class CRISP_CATEGORY_RAG_SUMMARY : DashboardSummary
    {
        public int CATEGORY_ID { get; set; }
        public int SCORE { get; set; }
        public int TARGET_SCORE { get; set; }
    }
    public class DashboardSummary
    {
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public int? PORTFOLIO_ID { get; set; }
        public string VALUE { get; set; }
    }
    public class CRISPScores
    {
        public string CSM { get; set; }
        public string EMAIL_ID { get; set; }
        public string QUALITY_SPOC { get; set; }
        public string CUST_NM { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PORTFOLIO { get; set; }
        public DateTime PUBLISH_DATE { get; set; }
        public string STATUS { get; set; }
        public int? C { get; set; }
        public int? R { get; set; }
        public int? I { get; set; }
        public int? S { get; set; }
        public int? P { get; set; }
        public int? TOTAL { get; set; }
        public Boolean? NEED_FOCUS { get; set; }
        public string COMMENTS { get; set; }
        public Boolean? HR_NEED_FOCUS { get; set; }
        public string HR_NEED_FOCUS_COMMENTS { get; set; }
        public string CRISP_COMMENTS { get; set; }
        public string PROJ_ID { get; set; }
        public string CSM_GENERATED_COMMENTS { get; set; }
    }
}
