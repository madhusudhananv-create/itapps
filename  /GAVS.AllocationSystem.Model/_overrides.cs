using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public partial class KPI_DETAILS_COMMENT
    {

        [NotMapped]
        public bool IsRejected { get; set; }

        [NotMapped]
        public bool CAN_ADD_COMMENTS { get; set; }
    }

    public partial class RISK_REPOSITORY
    {
        [NotMapped]
        public int[] SERVICE_TOWER_LIST { get; set; }
        [NotMapped]
        public string SERVICE_TOWER_NAME { get; set; }
    }
}
