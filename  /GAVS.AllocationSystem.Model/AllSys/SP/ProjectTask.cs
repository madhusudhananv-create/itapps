using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class ProjectTask
    {
        public short PROJ_TASK_ID { get; set; }
        public string PROJ_TASK_NAME { get; set; }
        public string PROJ_TASK_DESC { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public List<Dates> Dates { get; set; } = new List<Dates>();
    }

    public class Dates
    {
        public int DATE_ID { get; set; }
        public string CLNDR_DAY_NAME { get; set; }
        public bool ENABLE { get; set; }
        public bool ISHOLIDAY { get; set; }
        public string DATE { get; set; }

    }

}
