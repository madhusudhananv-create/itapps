using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class TASK_STATUS_HISTORY : EntityBase
    { 
        public int TASK_ID { get; set; } 
        public string USER_ID { get; set; }
        public DateTime STATUS_DATE { get; set; }
        public string STATUS { get; set; } 
        public String RESCHEDULE_REASON { get; set; }
        public string RESCHEDULE_REQUESTER { get; set; }
        public DateTime? RESCHEDULE_DATE { get; set; }
         
    }
}
