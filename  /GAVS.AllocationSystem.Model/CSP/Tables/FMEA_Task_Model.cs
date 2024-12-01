using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class FMEA_Task_Model
    {
        public int ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int PROCESS_ID { get; set; }
        public int SERVICE_LEVEL_IDENTIFIER_ID { get; set; }
        public string TASK_TITLE { get; set; }
        public int? TASK_CATEGORY_ID { get; set; }
    }
}
