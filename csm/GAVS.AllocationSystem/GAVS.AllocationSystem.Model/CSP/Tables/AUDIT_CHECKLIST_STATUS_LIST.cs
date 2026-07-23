using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_CHECKLIST_STATUS_LIST
    {
        [Key]
        public int ID { get; set; }

        public string STATUS_TITLE { get; set; }

        public string CREATED_BY { get; set; }

        public DateTime CREATED_DATE { get; set; } = new DateTime();

        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; } = new DateTime();
        public bool ISACTIVE { get; set; }
    }
}
