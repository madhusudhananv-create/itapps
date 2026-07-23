using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROCESS
    {
        [Key]
        public int ID { get; set; }
        public int PROCESS_AREA_ID { get; set; }
        public string TITLE { get; set; }
        public string DESCRIPTION { get; set; }
        public string CLAUSE_REFERENCE { get; set; }
        public string CONTROL_REFERENCE { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
        public bool SHOW_IN_MASTER { get; set; }
        
        [NotMapped]
        public int[] PROCESS_MODEL_REFERENCE_LIST { get; set; }

    }
}
