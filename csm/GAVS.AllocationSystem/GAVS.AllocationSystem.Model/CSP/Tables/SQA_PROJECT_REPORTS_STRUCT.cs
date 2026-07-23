using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class SQA_PROJECT_REPORTS_STRUCT
    {
        public int ID { get; set; }
        public int REPORT_ID { get; set; }
        public int FIELD_SORT { get; set; }
        public string FIELD_NAME { get; set; }
        public string FIELD_DISPLAY_NAME { get; set; }
        public string CHART_FIELD_NAME { get; set; }
        public string DATA_TYPE { get; set; }
        public Boolean REQUIRED_FIELD { get; set; }
        public Boolean DB_INCLUDE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }
}
