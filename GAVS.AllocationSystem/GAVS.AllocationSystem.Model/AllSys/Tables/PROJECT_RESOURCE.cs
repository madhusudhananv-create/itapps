using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class PROJECT_RESOURCE
    {
        [Key]    
        public int PROJ_RESRC_ID { get; set; }
        public string PROJ_ID { get; set; }
        public string EMP_ID { get; set; }
        public int? EMP_PROJ_ROLE_MAP_ID { get; set; }
        public string PROJ_RM_EMP_ID { get; set; }
        public string PROJ_REVIEWER_EMP_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public Boolean BILL_FLG { get; set; }
        public Decimal ALLCT_PCT { get; set; }
        public string RELEASE_REMARK { get; set; }
        public string PERF_REMARK { get; set; }
        public int? PERF_RATING { get; set; }
        public string CURR_INDC { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string ROLE_MAPPED_STATUS { get; set; }
        public string ID { get; set; }
        public int? ORG_CODE { get; set; }
        public decimal? ALLOCATION_HOURS { get; set; }

    }

    [NotMapped]
    public class PROJECT_RESOURCE_EXT : PROJECT_RESOURCE
    {
        public string PARENT_PROJ_ID { get; set; }
    }
}
