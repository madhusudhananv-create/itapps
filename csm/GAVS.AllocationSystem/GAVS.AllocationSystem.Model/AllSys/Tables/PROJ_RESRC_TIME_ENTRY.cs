using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJ_RESRC_TIME_ENTRY
    {
        [Key]
        public int? PROJ_RESRC_TIME_ENTRY_ID { get; set; }
        public string ID { get; set; }
        public string PROJ_ID { get; set; }
        public string BILLING_PROJ_ID { get; set; }
        public string EMP_ID { get; set; }
        public int DATE_ID { get; set; }
        public Int16? PROJ_TASK_ID { get; set; }
        public string TASK_DESC { get; set; }
        public decimal? CLOCKED_MINS { get; set; }
        public string TIME_ENTRY_STATUS { get; set; }
        public string OTHER_DETAILS { get; set; }
        public DateTime? APPRL_DATE { get; set; }
        public DateTime? REJECT_DATE { get; set; }
        public string REJECT_DESC { get; set; }
        public DateTime? CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime? UPDATED_DATE { get; set; }
        public bool? CHARGEABLE { get; set; }
        public string TASK_NAME { get; set; }
        public string TASK_CATEGORY { get; set; }
    }
}
