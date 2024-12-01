using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public class UserInfo
    {
        public string EMP_ID { get; set; }
        public string EMP_NAME { get; set; }
        public string EMP_ROLE { get; set; }
        public string EMP_BAS_ROLE { get; set; }
        public string EMP_CSP_ROLE { get; set; }
        public string ADDCLNT { get; set; }
        public int ADDPROJ { get; set; }
        public bool SUPERADMIN { get; set; }
        public int CSM_TITLE_ID { get; set; }
    }
}
