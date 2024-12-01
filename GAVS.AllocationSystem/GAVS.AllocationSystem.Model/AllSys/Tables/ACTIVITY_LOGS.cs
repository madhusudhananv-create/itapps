using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class ACTIVITY_LOGS
    {
        [Key]
        public int ID { get; set; }
        public string EMAIL_ID { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string REQUEST_URL { get; set; }
        public string METHOD { get; set; }
        public string EXCEPTION { get; set; }
        public string INNER_EXCEPTION { get; set; }
        public string STACK_TRACE { get; set; }
        public string CONTENT { get; set; }

    }
}
