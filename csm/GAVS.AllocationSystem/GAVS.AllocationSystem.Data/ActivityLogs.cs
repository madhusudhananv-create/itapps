using GAVS.AllocationSystem.Model.AllSys;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.Entity;
using GAVS.AllocationSystem.Data.Contracts;

namespace GAVS.AllocationSystem.Data
{
    public class ActivityLogs : EFRepository<ACTIVITY_LOGS>, IActivityLogs
    {
        public ActivityLogs(DbContext dbContext) : base(dbContext) { }

        public bool logWithToken(ACTIVITY_LOGS entry)
        {
            try
            {
                var emailid = (from t in DbContext.Set<Token>()
                               where (t.AUTHKEY == entry.EMAIL_ID)
                               select t).SingleOrDefault()?.EMAILID;
                entry.EMAIL_ID = emailid;
                Add(entry);
                DbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                string e = ex.Message;
                //do nothing;
            }
            return true;
        }
        public bool logWithEmailid(ACTIVITY_LOGS entry)
        {
            Add(entry);
            DbContext.SaveChanges();
            return true;
        }
    }

}
