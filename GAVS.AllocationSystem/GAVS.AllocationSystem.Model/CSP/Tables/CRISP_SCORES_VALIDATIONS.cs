using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class CRISP_SCORES_VALIDATIONS
    {
        [Key]
        public int ID { get; set; }
        public int CRISP_SCORES_PROJECT_ID { get; set; }
        public int VALIDATION_ID { get; set; }
        public bool ACHIEVED { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
        [NotMapped]
        public string CSM_SYSTEM_COMMENTS { get; set; }
    }
}
