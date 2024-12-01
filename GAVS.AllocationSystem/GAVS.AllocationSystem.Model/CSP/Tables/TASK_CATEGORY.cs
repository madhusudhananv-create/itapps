using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class TASK_CATEGORY
    {
        [Key]
        public int ID { get; set; }
        public int TASK_TYPE_ID { get; set; }
        public string TITLE { get; set; }
        public string COLOR_BG { get; set; }
        public string COLOR_MG { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }
        public int SORT_ORDER { get; set; }
    }
}
