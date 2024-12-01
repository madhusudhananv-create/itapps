using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class SQA_CHART_GROUPS
    {
        [Key]
        public int ID { get; set; }
        public string GROUP_ID { get; set; }
        public string GROUP_TYPE { get; set; }
        public string GROUP_DESCRIPTION { get; set; }
        public string DATA_DUMP_TYPE { get; set; }
        public int CHART_PARAMS_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
