using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS_SERVICE_AREA
    {
        [Key]
        public int ID { get; set; }
        public int PROCESS_MODEL_ID { get; set; }
        public string PROCESS_AREA_DESCRIPTION { get; set; }
        public int MATURITY_LEVEL { get; set; }
        public int GAVS_SERVICE_AREA { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public bool ISACTIVE { get; set; }
    }

    public class PROCESS_SERVICE_AREA_NEW : EntityBase
    {

        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }

        public bool SHOW_IN_MASTER { get; set; }

        
        public DateTime? RETIREMENT_DATE { get; set; }
    }
}
