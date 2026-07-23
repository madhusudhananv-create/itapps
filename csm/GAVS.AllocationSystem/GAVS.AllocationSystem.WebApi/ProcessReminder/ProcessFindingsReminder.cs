using GAVS.AllocationSystem.Data;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace GAVS.AllocationSystem.WebApi.ProcessReminder
{
    public class ProcessAutoAcceptFindings : IProcessReminder
    {
        public IList<ReminderRecord> ProcessReminderRecords()
        {
            throw new NotImplementedException();
        }
    }

    public class ProcessFindingsCAPSubmissionReminder : IProcessReminder
    {
        public IList<ReminderRecord> ProcessReminderRecords()
        {
            var dbContext = new CSPDbContext();
            var queryResult = dbContext.Database.SqlQuery<ReminderRecord>("getAllPendingCAPAudits").ToList();
            return queryResult;
        }
    }

    public class ProcessOpenFindingsReminder : IProcessReminder
    {
        public IList<ReminderRecord> ProcessReminderRecords()
        {
            throw new NotImplementedException();
        }
    }
}