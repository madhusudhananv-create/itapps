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

    public partial class CSS_BATCH_PROJECTS
    {
        [NotMapped]
        public string CUST_NM { get; set; }
        [NotMapped]
        public string PROJ_NM { get; set; }
        [NotMapped]
        public int PROJECT_HEAD_COUNT { get; set; }
        [NotMapped]
        public int ACCOUNT_HEAD_COUNT { get; set; }
        [NotMapped]
        public string DEFAULT_REASON { get; set; }
        [NotMapped]
        public int PREDICTED_SCORE { get; set; }
        [NotMapped]
        public string PREDICTED_REASON { get; set; }
        [NotMapped]
        public bool PROJECT_IN_PCSAT { get; set; }
        [NotMapped]
        public bool ACCOUNT_IN_ACSAT { get; set; }
        [NotMapped]
        public DateTime? START_DATE { get; set; }
        [NotMapped]
        public DateTime? END_DATE { get; set; }
        [NotMapped]
        public string FREQUENCY { get; set; }
        [NotMapped]
        public string PROJ_STATUS { get; set; }
        [NotMapped]
        public string PROJECT_TYPE { get; set; }
        [NotMapped]
        public string EXECUTION_TYPE { get; set; }
        [NotMapped]
        public string ENGAGAMENT_TYPE { get; set; }
        [NotMapped]
        public string BUSINESS_UNIT { get; set; }
        [NotMapped]
        public string DEPARTMENT { get; set; }
        [NotMapped]
        public string PROJECT_GROUP { get; set; }
        [NotMapped]
        public string CONTRACTING_UNIT { get; set; }
        [NotMapped]
        public string REVENUE_TYPE { get; set; }
        [NotMapped]
        public string COUNTRY { get; set; }
        [NotMapped]
        public string METHODOLOGY { get; set; }
    }
}
