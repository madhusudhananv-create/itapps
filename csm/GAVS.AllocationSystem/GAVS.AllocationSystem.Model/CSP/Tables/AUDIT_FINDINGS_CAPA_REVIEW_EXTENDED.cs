using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    [NotMapped]
    public class AUDIT_FINDINGS_CAPA_REVIEW_EXTENDED : AUDIT_FINDINGS_CAPA
    {
        public bool? ISCAPAPPROVED { get; set; }
        public bool? ISCAPREJECTED { get; set; }
        public bool? ISCHECKED { get; set; }
        public string REMARKS { get; set; }
        public string REVIEW_UPDATED_BY { get; set; }
        public DateTime REVIEW_UPDATED_DATE { get; set; }
    }
}
