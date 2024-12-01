using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public class ReminderRecord
    {
            public int ID { get; set; }

            public string CUSTOMER_ID { get; set; }

            public string PROJECT_ID { get; set; }

            public DateTime? START_DATE { get; set; }
            public DateTime? END_DATE { get; set; }
            public string DESCRIPTION { get; set; }

            public string CSM_NAME { get; set; }

            public string PM_NAME { get; set; }

            public string CSM_EMAIL_ID { get; set; }

            public string PM_EMAIL_ID { get; set; }
    }
}
