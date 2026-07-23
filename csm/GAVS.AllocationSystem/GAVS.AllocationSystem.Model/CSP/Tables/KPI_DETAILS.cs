using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KPI_DETAILS : EntityBase
    {
        public int KPI_ID { get; set; }
        public DateTime PERIOD { get; set; }
        public string PERIOD_TYPE { get; set; }
        public string KPI_ACTUAL { get; set; }
        public int KPI_METRIC { get; set; }
        public string HIGHLIGHTS { get; set; }
        public string EX_HIGHLIGHTS { get; set; }
        public Boolean ISFLAG { get; set; }

        public int? PRODUCT_ID { get; set; }
        public int? MODE_ID { get; set; }
        public string SLA_STATUS { get; set; }
        public Boolean ISDRAFT { get; set; }
        public Boolean ISEXNODATA { get; set; }
        public string SECONDARY_SLA_STATUS { get; set; }
        [NotMapped]
        public string GUID { get; set; }
        [NotMapped]
        public bool IS_SLA_STATUS_CHANGED { get; set; }
        [NotMapped]
        public bool IS_EXCLUSION { get; set; }

        public string EXCLUSION_COMMENT { get; set; }

        public string EXCLUSION_KPI_ACTUAL { get; set; }
        public string EXCLUSION_SLA_STATUS { get; set; }
        public string EXCLUSION_SECONDARY_SLA_STATUS { get; set; }
        [NotMapped]
        public FINDING_STAGE_DATA CapaStage { get; set; }
        [NotMapped]
        public List<BaseMeasureData> BaseMeasureDataList { get; set; }
    }
}
