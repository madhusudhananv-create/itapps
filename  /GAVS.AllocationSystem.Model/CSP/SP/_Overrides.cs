using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public partial class FolderData : EntityBase
    {
      
    }

    public partial class FileData : EntityBase
    {
    }
    public partial class AUDIT_DETAILS_VM
    {
        public int ID { get; set; }
        public string CUST_ID { get; set; }
        public string CUST_NM { get; set; }
        public string PROJ_ID { get; set; }
        public string PROJ_NM { get; set; }
        public string TASK_CATEGORY { get; set; }
        public string DESCRIPTION { get; set; }
        public string STATUS { get; set; }
        public string PRIORITY { get; set; }
        public DateTime? SCHEDULED_START_DATE { get; set; }
        public DateTime? DUE_DATE { get; set; }
        public string OWNER { get; set; }
        public string ASSIGNED_TO { get; set; }
        public string AUDITOR_EMP_ID { get; set; }
        public string MANAGER_EMP_ID { get; set; }
        public string FREQUENCY { get; set; }
        public string COMMENTS { get; set; }
    }
}