using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.Charts
{
    public class OverallAccountHealth
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NAME { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NAME { get; set; }
        public int PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public decimal SCORE { get; set; }
    }

    public class OverallAccountHealthResullts
    {
        public decimal OVERALL_SCORE { get; set; }
        public List<OverallAccountHealth> CUST_KPIS { get; set; }
        public List<OverallAccountHealth> PORTFOLIO_KPIS { get; set; }
        public List<OverallAccountHealth> PROJECT_KPIS { get; set; }
    }

    public class KPIPerspectives
    {
        public decimal OVERALL_SCORE { get; set; }
        public List<PerspectivesByKPICategory> PerspectivesByKPICategory { get; set; }
    }
    public class PerspectivesByKPICategory
    {
        public decimal SCORE { get; set; }
        public int KPI_CATEGORYID { get; set; }
        public string KPI_CATEGORY { get; set; }
    }

    public class AchievementsByCustomerSuccessGoal
    {
        public decimal SCORE { get; set; }
        public int GOAL_ID { get; set; }
        public string GOAL_NAME { get; set; }
    }

    public class CustomerSuccessScores
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NAME { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NAME { get; set; }
        public int PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public decimal SCORE { get; set; }
    }


    public class CSS
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NAME { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NAME { get; set; }
        public int PORTFOLIO_ID { get; set; }
        public string PORTFOLIO_NAME { get; set; }
        public decimal SCORE { get; set; }
        public decimal SCORE_NEW { get; set; }
        public decimal NPS { get; set; }
    }

    public class CustomerSuccessScoresResults
    {
        public List<CSS> CUST_CSAT { get; set; }
        public List<CSS> PORTFOLIO_CSAT { get; set; }
        public List<CSS> PROJECT_CSAT { get; set; }
    }
    public class CSATSummary
    {
        public decimal OVERALL_SCORE { get; set; }
        public decimal OVERALL_NEWSCORE { get; set; }
        public decimal NPS_SCORE { get; set; }
        public int NO_OF_SURVEYS { get; set; }
        public int NO_OF_RESPONDED { get; set; }
        public int NO_OF_YET_TO_RESPOND { get; set; }

    }
    public class CustomerSuccessSurvey
    {
        public CustomerSuccessScoresResults customerSuccessScoresResults { get; set; }
        public List<CSSData> csat { get; set; } 
        public CSATSummary CSAT_SUMMARY { get; set; }
    }


}
