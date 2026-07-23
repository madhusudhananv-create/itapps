using System;
using System.ComponentModel.DataAnnotations;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PSA_TIMESHEET_SYNC
    {
        [Key]
        public int ID { get; set; }

        public string JSON_CONTENT { get; set; }
        public string PSA_ID { get; set; }
        public bool? ISREJECT { get; set; }
        public bool? SYNCED { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string ERROR { get; set; }
    }
}