using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.WebApi.ProcessReminder
{
    public interface IProcessReminder
    {
        IList<ReminderRecord> ProcessReminderRecords();
    }

    
}
