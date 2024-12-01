using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_LESSON_LEARNT
    {   [Key]
        public int ID { get; set; }
        public string PROJECT_ID { get; set;}
        public string PUBLISHED_BY { get; set; }
        public DateTime PUBLISHED_DATE { get; set; }
        public string CATEGORY_OF_LESSON { get; set; }
        public string DESCRIPTION { get; set; }
        public string PROCESS_AREA { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public bool ISACTIVE { get; set; }

    }

}
