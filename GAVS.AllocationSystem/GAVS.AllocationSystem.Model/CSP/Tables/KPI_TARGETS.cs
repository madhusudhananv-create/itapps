using GAVS.AllocationSystem.Model.Base;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class KPI_TARGETS : KPI_TARGET_BASE
    {
        public int KPI_ID { get; set; }
        public int? KPI_TARGET_MASTER_ID { get; set; }
    }

    public class KPI_TARGET_MASTER : KPI_TARGET_BASE
    {
        public int? KPI_MASTER_ID { get; set; }
    }

    public abstract class KPI_TARGET_BASE : EntityBase
    {
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string SLA_TARGET_VERYHIGH_DESCRIPTION { get; set; }
        public string SLA_TARGET_VERYHIGH_OPERATOR { get; set; }
        public decimal? SLA_TARGET_VERYHIGH_VALUE { get; set; }
        public string SLA_TARGET_HIGH_DESCRIPTION { get; set; }
        public string SLA_TARGET_HIGH_OPERATOR { get; set; }
        public decimal? SLA_TARGET_HIGH_VALUE { get; set; }
        public string SLA_TARGET_MEDIUM_DESCRIPTION { get; set; }
        public string SLA_TARGET_MEDIUM_OPERATOR { get; set; }
        public decimal? SLA_TARGET_MEDIUM_VALUE { get; set; }
        public string SLA_TARGET_LOW_DESCRIPTION { get; set; }
        public string SLA_TARGET_LOW_OPERATOR { get; set; }
        public decimal? SLA_TARGET_LOW_VALUE { get; set; }
        public decimal? EXPECTED_SERVICE_LEVEL { get; set; }
        public decimal? MINIMUM_SERVICE_LEVEL { get; set; }
        public string SPECIFICATION_LIMIT { get; set; }
    }
}
