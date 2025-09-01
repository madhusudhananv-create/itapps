using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class TasksEventsDetails
    {
        public int ID { get; set; }
        public string customerID { get; set; }
        public string customerName { get; set; }
        public string projectID { get; set; }
        public string projectName { get; set; }
        public string taskType { get; set; }
        public string taskCategory { get; set; }
        public string description { get; set; }
        public string status { get; set; }
        public DateTime? scheduledStartDate { get; set; }
        public decimal? scheduledDuration { get; set; }
        public string priority { get; set; }
        public DateTime? dueDate { get; set; }
        public string owner { get; set; }
        public string assignedTo { get; set; }
        public string auditorEmpId { get; set; }
    }
}
