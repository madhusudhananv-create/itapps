using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public interface iBatch
    {
        int ID { get; set; }
       
       
        int YEAR { get; set; }
        DateTime START_DATE { get; set; }
        DateTime END_DATE { get; set; }
        string STATUS { get; set; }
     


    }
    public interface iBatchCustomer
    {
        int ID { get; set; }
        int BATCH_ID { get; set; }

        int BATCH_MONTHLY_ID { get; set; }
        string CUST_ID { get; set; }
        string PROJ_ID { get; set; }

        DateTime? SURVEY_SENT_DATE { get; set; }

        bool IS_VERIFIED { get; set; }

        string COMMENTS { get; set; }

        string STATUS { get; set; }

        string DISPLAY_NAME { get; set; }

        string EMAIL_ID { get; set; }

          string SPOC { get; set; }

    }
}
