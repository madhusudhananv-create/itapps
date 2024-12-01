using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    public partial class TASK: EntityBase
    { 
        public int? PARENT_TASK_ID { get; set; }
        public int? PARENT_EVENT_ID { get;set; }
        public int TASK_TYPE_ID { get; set; }
        public int TASK_CATEGORY_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public string REQUIREMENT_REFERENCE{ get; set; }
        [StringLength(10)]
        public string PRIORITY { get; set; }
        public DateTime? SCHEDULED_START_DATE { get; set; }
        public DateTime? DUE_DATE { get; set; }
        public string STATUS { get; set; }
        public string COMMENTS { get; set; }
        public DateTime? ACTUAL_START_DATE { get; set; }
        public DateTime? ACTUAL_END_DATE { get; set; }
        public int? SCHEDULED_DURATION { get; set; }
        public int? ACTUAL_DURATION { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string OWNER { get; set; }
        public string ASSIGNED_TO { get; set; }
        public bool SET_REMINDER { get; set; }
        public bool SET_RECURRENCE { get; set; }
        public int? RECURRENCE_REF { get; set; } 
        public String RESCHEDULE_REASON { get; set; }
        public string RESCHEDULE_REQUESTER { get; set; }
        public DateTime? RESCHEDULE_DATE { get; set; }
        public bool? IS_DRAFT { get; set; }
        public string REASON_FOR_CANCEL { get; set; }
        [NotMapped]
        public string STATUS_PREV { get; set; }
        [NotMapped]
        public DateTime? RESCHEDULE_DATE_PREV { get; set; }
        [NotMapped]
        public String RESCHEDULE_REASON_PREV { get; set; }
        [NotMapped]
        public string RESCHEDULE_REQUESTER_PREV { get; set; }


        [NotMapped]
        public TASK_RECURRENCE RECURRENCE { get; set; }
        


    }
}
