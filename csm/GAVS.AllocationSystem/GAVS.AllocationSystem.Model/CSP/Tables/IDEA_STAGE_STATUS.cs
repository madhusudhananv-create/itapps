using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class IDEA_STAGE_STATUS
    {
        [Key]
        public int ID { get; set; }
        [Required]
        public int IDEA_ID { get; set; }

        public string ACTION { get; set; }
        public string COMMENTS { get; set; }
        public string UPDATED_BY { get; set; }

        public DateTime UPDATED_DATE { get; set; }
      
    }
}
