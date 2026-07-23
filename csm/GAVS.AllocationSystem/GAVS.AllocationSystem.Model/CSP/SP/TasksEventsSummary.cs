using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class TasksEventsSummary
    {
        public string priority { get; set; }
        public int dueEvents { get; set; }
        public int overdueEvents { get; set; }
        public int nextWeekEvents { get; set; }
        public int nextMonthEvents { get; set; }
        public int dueTasks { get; set; }
        public int overdueTasks { get; set; }
        public int nextWeekTasks { get; set; }
        public int nextMonthTasks { get; set; }
        public int thisWeekEvents { get; set; }
        public int thisMonthEvents { get; set; }
        public int thisWeekTasks { get; set; }
        public int thisMonthTasks { get; set; }
    }
}
