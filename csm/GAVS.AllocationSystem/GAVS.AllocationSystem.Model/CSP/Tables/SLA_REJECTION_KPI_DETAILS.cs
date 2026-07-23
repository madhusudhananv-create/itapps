using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP.Tables
{
    public class SLA_REJECTION_KPI_DETAILS : EntityBase
    {
        public int REJECTION_ID { get; set; }
        public int KPI_DETAILS_ID { get; set; }

        public string COMMENT { get; set; }

        public int STATUS_ID { get; set; }

        [NotMapped]
        public string REJECTION_STATUS { get; set; }
    }
}
