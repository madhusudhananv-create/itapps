using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KPI_GOALS
    {
        [Key]
        public int ID { get; set; }
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string DESCRIPTION { get; set; }
        public int DISPLAY_ORDER { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
        public Boolean ISINTERNAL { get; set; }
    }
}
