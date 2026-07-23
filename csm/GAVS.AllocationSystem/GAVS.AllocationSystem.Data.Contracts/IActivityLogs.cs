using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface IActivityLogs
    {
        bool logWithToken(ACTIVITY_LOGS LOG);
        bool logWithEmailid(ACTIVITY_LOGS LOG);
    }
}
