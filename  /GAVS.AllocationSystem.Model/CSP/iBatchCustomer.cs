using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public interface iBatchCustomer
    {
        int ID { get; set; }
        int BATCH_ID { get; set; }

        int BATCH_MONTHLY_ID { get; set; }
        string CUST_ID { get; set; }
        string PROJ_ID { get; set; }

        DateTime? SURVEY_SENT_DATE { get; set; }

    }
}
