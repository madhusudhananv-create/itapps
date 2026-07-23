using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class ResourceDetails
    {
        public int PROJ_RESRC_ID { get; set; }
        public string EMP_ID { get; set; }
        public string EMP_NAME { get; set; }
        public string LEVEL { get; set; }
        public string EMPL_TYPE { get; set; }
        public string CNTRY_NM { get; set; }
        public bool BILL_FLG { get; set; }
        public string Emp_ReviewingManagerID { get; set; }
        public string Emp_ReviewingManager { get; set; }
        public string Emp_ReportingManagerID { get; set; }
        public string Emp_ReportingManager { get; set; }
        public string Emp_ProjectManager { get; set; }
        public decimal ALLOCATION { get; set; }
        public string STARTDATE { get; set; }
        public string ENDDATE { get; set; }
        public char ISACTIVE { get; set; }
        public string COMMENTS { get; set; }
    }
}
