using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_BEST_PRACTICES
    {
        [Key]
        public int ID { get; set; }
        public int REFERENCE_BEST_PRACTICE_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public string REPORTED_BY { get; set; }
        public DateTime REPORTED_DATE { get; set; }
        public string REVIEWED_BY { get; set; }
        public DateTime? REVIEWED_DATE { get; set; }
        public string APPROVED_BY { get; set; }
        public DateTime? APPROVED_DATE { get; set; }
        public string SERVICE_AREA { get; set; }
        public string PROCESS_AREA { get; set; }
        public string PROCESS { get; set; }
        public string STATUS { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public DateTime? ACTUAL_DATE { get; set; }
        public string REMARKS { get; set; }
        public string APPLICABLE_FOR { get; set; }
        public string NOT_APPLICABLE_FOR { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }       

    }
}
