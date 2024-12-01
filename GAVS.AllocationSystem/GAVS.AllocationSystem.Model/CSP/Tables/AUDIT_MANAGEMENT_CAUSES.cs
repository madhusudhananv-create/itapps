using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class AUDIT_MANAGEMENT_CAUSES
    {
        public int ID { get; set; }
        public string CAUSES { get; set; }
        public bool ISACTIVE { get; set; }
        [NotMapped]
        public List<AUDIT_MANAGEMENT_ROOTCAUSES> ROOT_CAUSE { get; set; } = new List<AUDIT_MANAGEMENT_ROOTCAUSES>();
    }
}
