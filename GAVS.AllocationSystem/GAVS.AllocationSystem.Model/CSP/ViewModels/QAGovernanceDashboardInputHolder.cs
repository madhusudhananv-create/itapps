using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    public class QAGovernanceDashboardInputHolder
    {
        public string CHART_TITLE { get; set; }
        public string XAXIS { get; set; }
        public string YAXIS { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string CUSTOMER_IDS { get; set; }
        public string FREQUENCY { get; set; }
        public string FINDING_STATUS { get; set; }
        public string[] FINDING_TYPE { get; set; }
        public string FINDING_AGE { get; set; } 
        public string TOWER { get; set; }       
    }


   
    public class AssessmentFindingViewDetailsInputHolder
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string YEAR_QUARTER { get; set; }
        public bool ISEXPANDED { get; set; }
        public decimal STRENGTH_FOR_CUSTOMER { get; set; }
        public decimal WEAKNESS_FOR_CUSTOMER { get; set; }
        public decimal OPPORTUNITY_FOR_CUSTOMER { get; set; }
        public decimal THREAT_FOR_CUSTOMER { get; set; }
        public string STRENGTH_URL_FOR_CUSTOMER { get; set; }
        public string WEAKNESS_URL_FOR_CUSTOMER { get; set; }
        public string OPPORTUNITY_URL_FOR_CUSTOMER { get; set; }
        public string THREAT_URL_FOR_CUSTOMER { get; set; }
        public List<AssessmentFindingViewDetailsProjectWise> PROJECT_ASSESSMENT_DETAILS { get; set; }
    }

    public class AssessmentFindingViewDetailsProjectWise
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string DISPLAY_TEXT { get; set; }
        public string URL { get; set; }
        public decimal STRENGTH_FOR_PROJECT { get; set; }
        public decimal WEAKNESS_FOR_PROJECT { get; set; }
        public decimal OPPORTUNITY_FOR_PROJECT { get; set; }
        public decimal THREAT_FOR_PROJECT { get; set; }
        public string STRENGTH_URL_FOR_PROJECT { get; set; }
        public string WEAKNESS_URL_FOR_PROJECT { get; set; }
        public string OPPORTUNITY_URL_FOR_PROJECT { get; set; }
        public string THREAT_URL_FOR_PROJECT { get; set; }


    }

    public class AssessmentFindingsViewDetails
    {
        public List<CustomerBase> CUSTOMER_LIST { get; set; }        
        public List<AssessmentFindingViewDetailsInputHolder> ASSESSMENT_FINDINGS_DETAILS { get; set; }

    }

}
