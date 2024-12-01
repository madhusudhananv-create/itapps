using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Model.CSP
{
    [NotMapped]
    public class KPI_DETAILS_EXTENDED : KPI_DETAILS
    {
        public string CUSTOMER_ID { get; set; }
        public String CUSTOMER_NM { get; set; }
        public String PROJECT_ID { get; set; }
        public String PROJECT_NM { get; set; }
        public int GOAL_ID { get; set; }
        public int GLOBAL_KPI_CATEGORY_ID { get; set; }
        public string GLOBAL_KPI_CATEGORY_NM { get; set; }
        public int? GLOBAL_KPI_PERSPECTIVE_ID { get; set; }
        public Boolean IS_SOW_COMMITMENT { get; set; }
        public String SERVICE_AREA { get; set; }
        public string KPI_NAME { get; set; }
        public string PRIORITY { get; set; }
        public string SUPPORT_WINDOW { get; set; }
        public String SLA_TARGET_UNIT_OF_MEASUREMENT { get; set; }
        public decimal? SLA_TARGET_VERYHIGH_VALUE { get; set; }
        public string SLA_TARGET_VERYHIGH_OPERATOR { get; set; }
        public string SLA_TARGET_VERYHIGH_DESCRIPTION { get; set; }
        public decimal? SLA_TARGET_HIGH_VALUE { get; set; }
        public string SLA_TARGET_HIGH_OPERATOR { get; set; }
        public string SLA_TARGET_HIGH_DESCRIPTION { get; set; }
        public decimal? SLA_TARGET_MEDIUM_VALUE { get; set; }
        public string SLA_TARGET_MEDIUM_OPERATOR { get; set; }
        public string SLA_TARGET_MEDIUM_DESCRIPTION { get; set; }
        public decimal? SLA_TARGET_LOW_VALUE { get; set; }
        public string SLA_TARGET_LOW_OPERATOR { get; set; }
        public string SLA_TARGET_LOW_DESCRIPTION { get; set; }
        public string RAG { get; set; }
        public decimal? PERCENT { get; set; }
        public string MONTH_NM { get; set; }
        public int MONTH_VAL { get; set; }
        public int YEAR { get; set; }
        public DateTime MONTH_YEAR { get; set; }
        //public string COLOR { get; set; }

    }
    public class ProductKPIScores
    {
        public List<PORTFOLIO_WISE_KPI> PORTFOLIO_WISE_KPI { get; set; }
        public List<PRODUCT_WISE_KPI> PRODUCT_WISE_KPI { get; set; }

        public List<ENGAGEMENT_WISE_KPI> ENGAGEMENT_WISE_KPI { get; set; }
        public string MONTH { get; set; }
        public int YEAR { get; set; }
        public List<HIGHLIGHTS> HIGHLIGHTS { get; set; }
        public List<PRODUCT_WISE_CAPA_DETAILS> PRODUCT_WISE_CAPA_DETAILS { get; set; }
    }
    public class PORTFOLIO_WISE_KPI
    {
        public int PORTFOLIO_ID { get; set; }
        public string TITLE { get; set; }
        public int PRODUCT_COUNT { get; set; }
        public int OVERALL_KPI_COUNT { get; set; }
        public int? SLA_STATUS { get; set; }
        public int KEY_KPI { get; set; }
        public int CRITICAL_KPI { get; set; }
        public int? MET_KEY_KPI { get; set; }
        public int? MET_CRITICAL_KPI { get; set; }
        public int? SECONDARY_MET_KEY_KPI { get; set; }
        public int? SECONDARY_MET_CRITICAL_KPI { get; set; }
        public int EXCLUSION_SLA_STATUS { get; set; }

        public int EXCLUSION_MET_KEY_KPI { get; set; }
        public int EXCLUSION_MET_CRITICAL_KPI { get; set; }
        public int EXCLUSION_SECONDARY_MET_KEY_KPI { get; set; }
        public int EXCLUSION_SECONDARY_MET_CRITICAL_KPI { get; set; }
    }

    public class PRODUCTWISEKPIDATA
    {
        public string TITLE { get; set; }

        public string PRODUCT_TITLE { get; set; }
        public string KPI_NAME { get; set; }

        public string SERVICE_LEVEL_METRICS { get; set; }
        //public string KPI_ACTUAL { get; set; }

        public decimal  UPTIME_CALC { get; set; }

        public decimal EXPECTED_SERVICE_LEVEL { get; set; }
        public decimal? KPI_NUMERATOR { get; set; }
        public decimal? KPI_DENOMINATOR { get; set; }

        public decimal? EXCLUSION_KPI_NUMERATOR { get; set; }
        public decimal? EXCLUSION_KPI_DENOMINATOR { get; set; }
        public int PORTFOLIO_ID { get; set; }
    }
    public class KPI_WISE_DATA
    {
        public int PORTFOLIO_ID { get; set; }
        public string TITLE { get; set; }
        public int FORMULA_ID { get; set; }
        public string FORMULA { get; set; }
        public int? SERVICE_LEVEL_TYPE_ID { get; set; }
        public decimal? KPI_NUMERATOR { get; set; }
        public decimal? KPI_DENOMINATOR { get; set; }
        public decimal? EXCLUSION_KPI_NUMERATOR { get; set; }
        public decimal? EXCLUSION_KPI_DENOMINATOR { get; set; }
        public decimal? MINIMUM_SERVICE_LEVEL { get; set; }

        public string KPI_ACTUAL { get; set; }

        public string SLA_STATUS { get; set; }
        public string SECONDARY_SLA_STATUS { get; set; }
        [NotMapped]
        public string KPI_NAME { get; set; }
        public string SERVICE_LEVEL { get; set; }
        public decimal EXPECTED_SERVICE_LEVEL { get; set; }
        public string UNIT_OF_MEASUREMENT { get; set; }
        public DateTime? PERIOD { get; set; }
        public string PORTFOLIO_NAME { get; set; }

        [NotMapped]
        public string REFERENCE { get; set; }

        public bool ISNA{ get; set; }
        public bool ISNODATA { get; set; }
        public bool ISEXNODATA { get; set; }

        public int CNT { get; set; }

        public decimal UPTIME_CALC { get; set; }

        public string EXCLUSION_SLA_STATUS { get; set; }

        public string EXCLUSION_KPI_ACTUAL { get; set; }

      
        public string EXCLUSION_SECONDARY_SLA_STATUS { get; set; }

    }
    public class PRODUCT_WISE_KPI
    {
        public int PRODUCT_ID { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public int MODE_ID { get; set; }
        public int OVERALL_KPI_COUNT { get; set; }
        public int? SLA_STATUS { get; set; }
        public int? SECONDARY_SLA_STATUS { get; set; }
        public int? KEY_KPI { get; set; }
        public int? CRITICAL_KPI { get; set; }
        public int? MET_KEY_KPI { get; set; }
        public int? MET_CRITICAL_KPI { get; set; }
        public int? SECONDARY_MET_KEY_KPI { get; set; }
        public int? SECONDARY_MET_CRITICAL_KPI { get; set; }
        public int EXCLUSION_SLA_STATUS { get; set; }
        public int EXCLUSION_MET_KEY_KPI { get; set; }
        public int EXCLUSION_MET_CRITICAL_KPI { get; set; }
        public int EXCLUSION_SECONDARY_MET_KEY_KPI { get; set; }
        public int EXCLUSION_SECONDARY_MET_CRITICAL_KPI { get; set; }
    }
    public class ENGAGEMENT_WISE_KPI
    {
        public string KPI_NAME { get; set; }
        public int PRODUCT_COUNT { get; set; }
        public decimal? EXPECTED_SERVICE_LEVEL { get; set; }
        public decimal? MINIMUM_SERVICE_LEVEL { get; set; }
        
        public int? ISNA { get; set; }
        public decimal? ACHIEVEMENT_VALUE { get; set; }
        public string REFERENCE { get; set; }        
        public string UOM{ get; set; }
        public int CNT { get; set; }
        public string SERVICE_LEVEL { get; set; }
        public DateTime? PERIOD { get; set; }
        public decimal? EXCLUSION_ACHIEVEMENT_VALUE { get; set; }
        public decimal? KPI_NUMERATOR { get; set; }
        public decimal? KPI_DENOMINATOR { get; set; }
        public decimal? EXCLUSION_KPI_NUMERATOR { get; set; }
        public decimal? EXCLUSION_KPI_DENOMINATOR { get; set; }
        public string SLA_STATUS { get; set; }
    }
    public class ENGAGEMENT_WISE_KPI_DATA
    {
        public string KPINAME { get; set; }
        public string STATUS { get; set; }
        public string CUSTID { get; set; }
        public string MONTH { get; set; }
        public int YEAR { get; set; }
        public string VIEWBY { get; set; }
    }
    public class ENGAGEMENT_WISE_KPI_DETAILS
    {
        public string TITLE { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public string NUMERATORDESCRIPTION { get; set; }
        public string DENOMINATORDESCRIPTION { get; set; }
        public decimal? NUMERATOR { get; set; }
        public decimal? DENOMINATOR { get; set; }
        public decimal MINIMUM_SERVICE_LEVEL { get; set; }
        public decimal EXPECTED_SERVICE_LEVEL { get; set; }
        public string KPI_ACTUAL { get; set; }
        public string SLA_STATUS { get; set; }
    }

    public class PRODUCT_WISE_CAPA_DETAILS
    {
        public int PRODUCT_ID { get; set; }
        public int MODE_ID { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public int NOT_MET { get; set; }
        public int DUE_FOR_SUBMISSION { get; set; }
        public int DUE_FOR_REVIEW { get; set; }
        public int DUE_FOR_CUSTOMER_APPROVAL { get; set; }
        public int DUE_FOR_IMPLEMENTATION { get; set; }
        public int DUE_FOR_VERIFICATION { get; set; } 
        public int CLOSED { get; set; }
    }

    //public class PORTFOLIO_WISE_KPI_DETAILS
    //{
    //    public string KPI_NAME { get; set; }
    //    public int PORTFOLIO_ID { get; set; }
    //    public string SERVICE_AREA_TYPE  { get; set; }
    //    public string CATEGORY { get; set; }
    //    public string SERVICE_LEVEL { get; set; }
    //    public decimal? KPI_NUMERATOR { get; set; }
    //    public decimal? KPI_DENOMINATOR { get; set; }
    //    public decimal MINIMUM_SERVICE_LEVEL { get; set; }
    //    public decimal EXPECTED_SERVICE_LEVEL { get; set; }
    //    public string UNIT_OF_MEASUREMENT { get; set; }
    //    public int FORMULA_ID { get; set; }
    //    public string FORMULA { get; set; }
    //    public string KPI_ACTUAL { get; set; }
    //    public string SLA_STATUS { get; set; }

    //    [NotMapped]
    //    public DateTime? PERIOD { get; set; }
    //    public string PORTFOLIO_NAME { get; set; }
    //}


}
