using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{


    public class CSATInsightsInputHolder
    {
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string CUSTOMER_IDS { get; set; }
        public string FREQUENCY { get; set; } 
        public string CSM_IDS { get; set; }

        public string BUSINESS_UNIT { get; set; }
    }

    public class CSATViewDetailsInputHolder
    {
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string YEAR_QUARTER { get; set; }       
        public bool ISEXPANDED { get; set; }
        public ActionPlanDetails ACTION_PLAN_FOR_CUSTOMER { get; set; }
        public string NO_OF_SURVEY_INITIATED_RESPONDED_FOR_CUSTOMER { get; set; }       
        public List<FrequencyWiseData> FREQUENCY_WISE_DATA_FOR_CUSTOMER { get; set; }
        public List<CSATViewDetailsProjectWise> PROJECT_CSS_DETAILS { get; set; }
        public string SURVEY_FEEDBACK_URL_FOR_CUSTOMER { get; set; }
    }

    public class CSATViewDetailsProjectWise
    {
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string DISPLAY_TEXT { get; set; }
        public string URL { get; set; }

        public ActionPlanDetails ACTION_PLAN { get; set; }

        public List<string> NO_OF_SURVEY_INITIATED_RESPONDED { get; set; }
        public List<FrequencyWiseData> FREQUENCY_WISE_DATA_FOR_PROJECT { get; set; }

    }

    public class CSATViewDetails
    {
        public List<CustomerBase> CUSTOMER_LIST { get; set; }
        public string FREQUENCY_TEXT { get; set; }
        public List<string> FREQUENCY_LIST { get; set; }
        public List<CSATViewDetailsInputHolder> CSAT_DETAILS { get; set; }

    }

    public class FrequencyWiseData
    {
        public string RATING { get; set; }
        public string COLOR { get; set; }
        public int? ACTION_PLAN_SUBMITTED_COUNT { get; set; }
        public int? ACTION_PLAN_NOT_SUBMITTED_COUNT { get; set; }
    }

    public class ActionPlanDetails
    {
        public int? COUNT { get; set; }
        public string COLOR { get; set; }
        public string ACTION_ITEM_URL { get; set; }
    }
}

