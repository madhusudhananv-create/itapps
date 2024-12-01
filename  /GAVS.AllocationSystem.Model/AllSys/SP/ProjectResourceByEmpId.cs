using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class ProjectResourceByEmpId
    {
        public int ID { get; set; }
        public string FRST_NM {get;set;} 
        public string EMP_ID { get; set; }
        public string CUST_NM { get; set; }
        public string CUST_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string PROJ_ID { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public bool BILL_FLG { get; set; }
        public string CURR_INDC { get; set; }
        public int PROJ_RESRC_ID { get; set; }

    }
}
