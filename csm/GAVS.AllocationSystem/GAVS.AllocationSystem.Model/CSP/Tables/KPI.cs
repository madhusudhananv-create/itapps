using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KPI : KPI_MASTER
    {
         
        public string CUSTOMER_ID { get; set; }
        public string PROJECT_ID { get; set; }
        public int GOAL_ID { get; set; }
        
        public string KPI_UNIQUEID { get; set; }
        public int? DISPLAY_ORDER { get; set; }
        public string CHART_TYPE { get; set; }
        public Boolean SHOW_IN_CHART { get; set; }
        public Boolean IS_SOW_COMMITMENT { get; set; }
        
        public int? PRODUCT_ID { get; set; }
     
        [NotMapped]
        public string StartPeriod { get; set; }
        [NotMapped]
        public string EndPeriod { get; set; }
        [NotMapped]
        public List<int> SERVICE_TOWER_ID { get; set; }
        public int? KPI_MASTER_ID { get; set; }

    }

    public class KPI_MASTER : EntityBase
    {
        public string SERVICE_AREA { get; set; }
        public string ABBREVIATION { get; set; }
        public string KPI_NAME { get; set; }
        public string SUPPORT_WINDOW { get; set; }
        public string FREQUENCY { get; set; }
        public string PRIORITY { get; set; }
        public string SLA_TARGET_UNIT_OF_MEASUREMENT { get; set; }
     
        public int GLOBAL_KPI_CATEGORY_ID { get; set; }
        public int? MODE_ID { get; set; }
    }
    [NotMapped]
    public class KPIWithTargets : KPI
    {
        public List<KPI_TARGETS> KPI_TARGETS { get; set; } = new List<CSP.KPI_TARGETS>();
        public List<PRODUCT_KPI_DETAILS> PRODUCT_KPI_DETAILS { get; set; } = new List<CSP.PRODUCT_KPI_DETAILS>();
    }

    public class PRODUCT_KPI_DETAILS
    {
        [Key]
        public int ID { get; set; }
        public int KPI_ID { get; set; }
        public int REFERENCE { get; set; }

        public int SERVICE_AREA_ID { get; set; }

        public int SERVICE_LEVEL_ID { get; set; }

        public string SERVICE_LEVEL_METRIC_DESCRIPTION { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }
    }

    public class KPI_HISTORY
    {
        public int KPI_ID { get; set; }
        public string KPI_NAME { get; set; }
        public string KPI_DESCRIPTION { get; set; }
        public int PRODUCT_ID { get; set; }
        public int MODE_ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public int SERVICE_LEVEL_ID { get; set; }
        public int CATEGORY_ID { get; set; }
        public decimal? EXPECTED_SERVICE_LEVEL { get; set; }
        public decimal? MINIMUM_SERVICE_LEVEL { get; set; }
        public string SPECIFICATION_LIMIT { get; set; }
        public string SLA_TARGET_UNIT_OF_MEASUREMENT { get; set; }
        public string SLA_TARGET_HIGH_OPERATOR { get; set; }
        public string SLA_TARGET_HIGH_VALUE { get; set; }
        public string SLA_TARGET_HIGH_DESCRIPTION { get; set; }
        public string SLA_TARGET_VERYHIGH_OPERATOR { get; set; }
        public string SLA_TARGET_VERYHIGH_VALUE { get; set; }
        public string SLA_TARGET_VERYHIGH_DESCRIPTION { get; set; }
        public DateTime KPI_START_DATE { get; set; }
        public DateTime KPI_END_DATE { get; set; }
        public DateTime KPI_TARGET_START_DATE { get; set; }
        public DateTime KPI_TARGET_END_DATE { get; set; }
        public Boolean IS_EDITED { get; set; }
        public Boolean IS_DELETED { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATE_DATE { get; set; }
    }
}
