using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PROJECT_INNOVATION
    {
        [Key]
        public int ID { get; set; }
        public string PROJECT_ID { get; set; }
        public string RAG { get; set; }
        public DateTime IDENTIFIED_DATE { get; set; }
        public string DESCRIPTION { get; set; }
        public string STATUS { get; set; }
        public DateTime? TARGET_DATE { get; set; }
        public DateTime? ACTUAL_DATE { get; set; }
        public string RESPONSIBLE { get; set; }
        public string AREA { get; set; }
        public decimal? BEFORE_ERROR { get; set; }
        public decimal? BEFORE_CYCLE_TIME { get; set; }
        public decimal? BEFORE_EFFORT { get; set; }
        public decimal? AFTER_ERROR { get; set; }
        public decimal? AFTER_CYCLE_TIME { get; set; }
        public decimal? AFTER_EFFORT { get; set; }
        public decimal? CUSTOMER_SAVINGS { get; set; }
        public decimal? FINANCIAL_REVENUE { get; set; }
        public decimal? FINANCIAL_OPERATING_COST { get; set; }
        public decimal? FINANCIAL_PROFITABILITY { get; set; }
        public Boolean AUTOMATE { get; set; }
        public string TOOL_USED { get; set; }
        public int REFERENCE_IDEA_ID { get; set; }
        public Boolean ISINNOVATION { get; set; }
        public string INNOVATION_DESCRIPTION { get; set; }
        public Boolean ISPROCESSIMPROVEMENT { get; set; }
        public string PROCESS_IMPROVEMENT_DESCRIPTION { get; set; }
        public string COMMENTS { get; set; }
        public string CREATED_BY { get; set; }
        public DateTime CREATED_DATE { get; set; }
        public string UPDATED_BY { get; set; }
        public DateTime UPDATED_DATE { get; set; }
        public Boolean ISACTIVE { get; set; }

        public string APPROACH { get; set; }
        public decimal? BEFORE_CASES_COUNT { get; set; }
        public decimal? AFTER_CASES_COUNT { get; set; }
        public decimal? BEFORE_FTECOST_HOUR { get; set; }
        public decimal? AFTER_FTECOST_HOUR { get; set; }
        public decimal? BEFORE_FTECOST_MONTH { get; set; }
        public decimal? AFTER_FTECOST_MONTH { get; set; }
        public decimal? CUSTOMER_PERSONHOUR_SAVINGS { get; set; }
        public decimal? BEFORE_FTESPENT_MONTH { get; set; }
        public decimal? AFTER_FTESPENT_MONTH { get; set; }
        public decimal? BEFORE_LEAD_TIME { get; set; }
        public decimal? AFTER_LEAD_TIME { get; set; }
        public string BEFORE_COST { get; set; }
        public string AFTER_COST { get; set; }
        public string CUSTOMER_BUSINESS_VALUE { get; set; }

        public string INTERNAL_SAVINGS { get; set; }
        public int? BEFORE_OCCOURANCE_COUNT { get; set; }
        public int? AFTER_OCCOURANCE_COUNT { get; set; }
        [NotMapped]
        public List<GAVSSERVICE> GAVS_SERVICE { get; set; } = new List<GAVSSERVICE>();

        [NotMapped]
        public decimal? QUALITY_REDUCTION_OF_ERRORS { get; set; }
        [NotMapped]
        public decimal? REDUCTION_IN_LEAD_TIME { get; set; }


        [NotMapped]
        public string REDUCTION_IN_LEAD_TIME_DATA { get; set; }


        [NotMapped]
        public decimal? REDUCTION_IN_CYCLE_TIME { get; set; }

        [NotMapped]
        public string REDUCTION_IN_CYCLE_TIME_DATA { get; set; }

        [NotMapped]
        public decimal? SAVING_PER_YEAR_EFFORT { get; set; }
        [NotMapped]
        public decimal? AUTOMATION_INDEX { get; set; }
        [NotMapped]
        public decimal? SAVINGS_IN_USD { get; set; }
        [NotMapped]
        public decimal? HARD_BENEFITS { get; set; }
        [NotMapped]
        public decimal? REVENUE { get; set; }
        [NotMapped]
        public decimal? OPERATING_COST { get; set; }
        [NotMapped]
        public decimal? PROFITABILITY { get; set; }

        public decimal? BEFORE_TIME_TAKEN { get; set; }

        public decimal? AFTER_TIME_TAKEN { get; set; }

        public int? BEFORE_CYCLE_TIME_UOM { get; set; }

        public int? AFTER_CYCLE_TIME_UOM { get; set; }

        public int? BEFORE_LEAD_TIME_UOM { get; set; }

        public int? AFTER_LEAD_TIME_UOM { get; set; }

        public int? BEFORE_TIME_TAKEN_UOM { get; set; }

        public int? AFTER_TIME_TAKEN_UOM { get; set; }

        public bool? IS_ONETIME { get; set; }      


    }
    public class GAVSSERVICE
    {
        public int SERVICE_ID { get; set; }
        public bool IS_CHECKED { get; set; }
    }

}
