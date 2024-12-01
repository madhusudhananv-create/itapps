using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.AllSys;

namespace GAVS.AllocationSystem.Model.CSP
{
    public class PORTFOLIO_PRODUCT : EntityBase
    {
        //public int ID { get; set; }
        public int PORTFOLIO_ID { get; set; }
        public string CUST_ID { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public int SERVICE_AREA_TYPE_ID { get; set; }
        public int TIER_ID { get; set; }
        //public Boolean ISACTIVE { get; set; }

        public bool? IS_SERVICE_COMMENCED { get; set; }

        public DateTime? SERVICE_COMMENCEMENT_DATE { get; set; }
    }

    public class KPI_SERVICE_LEVEL_METRICS
    {
        [Key]
        public int KPI_ID { get; set; }
        public int PRODUCT_ID { get; set; }
        public int SERVICE_AREA_ID { get; set; }
        public string SERVICE_LEVEL_METRICS { get; set; }
        public string SPECIFICATION_LIMIT { get; set; }
        public decimal? EXPECTED_SERVICE_LEVEL { get; set; }
        public decimal? MINIMUM_SERVICE_LEVEL { get; set; }
        public string UNIT_OF_MEASUREMENT { get; set; }
        public string KPI_ACTUAL { get; set; }
        public int? CAPA_STAGE_ID { get; set; }
        public string KPI_ACTUAL_EXCLUSION { get; set; }
        public string SERVICE_LEVEL_METRIC_DESCRIPTION { get; set; }
        public string SERVICE_AREA_TYPE { get; set; }
        public int SERVICE_LEVEL_ID { get; set; }
        public string SERVICE_LEVEL { get; set; }
        public int CATEGORY_ID { get; set; }
        public string SLA_CATEGORY { get; set; }
        public string SUPPORT_WINDOW { get; set; }
        public string PRIORITY { get; set; }
        public int REFERENCE_ID { get; set; }
        public string REFERENCE { get; set; }
        public string RISK_POOL_ALLOCATION { get; set; }
        public string FREQUENCY { get; set; }
        public string MINIMUM_TARGET_OPERATOR { get; set; }
        public string EXPECTED_TARGET_OPERATOR { get; set; }
        public DateTime START_DATE { get; set; }
        public DateTime END_DATE { get; set; }
        public string SLA_STATUS { get; set; }
        public Boolean IS_NOT_APPLICABLE { get; set; }
        public string REMARKS { get; set; }
        public string EXREMARKS { get; set; }
        public string SECONDARY_SLA_STATUS { get; set; }
        public Boolean IS_DRAFT { get; set; }
        public Boolean IS_NO_DATA { get; set; }
        public Boolean IS_EX_NO_DATA { get; set; }
        public bool IS_EXCLUSION { get; set; }
        public string EXCLUSION_COMMENT { get; set; }

        [NotMapped]
        public int? DETAIL_ID { get; set; }
        public int? MODE_ID { get; set; }

        [NotMapped]
        public string GUID { get; set; }

        public List<BaseMeasureData> BaseMeasureDataList { get; set; }
        public List<BaseMeasureData> ExclusionBaseMeasureDataList { get; set; }
        public FINDING_STAGE_DATA CapaStage { get; set; }
        [NotMapped]
        public bool IS_NOT_FILLED { get; set; }

        [NotMapped]
        public string TIER { get; set; }

        public string EXCLUSION_KPI_ACTUAL { get; set; }
        public string EXCLUSION_SLA_STATUS { get; set; }
        public string EXCLUSION_SECONDARY_SLA_STATUS { get; set; }

        [NotMapped]
        public bool HIDE_UOM { get; set; }
    }

    //move this class to relevant model
    public class BaseMeasureData
    {
        public int BaseMeasureId { get; set; }
        public int? BaseMeasureValueId { get; set; }
        public decimal? Numerator { get; set; }
        public decimal? Denominator { get; set; }
        public string NumeratorDescription { get; set; }
        public string DenominatorDescription { get; set; }

        public int BaseMeasureFormulaTypeId { get; set; }
        public int DisplayOrder { get; set; }

        public bool IsExclusion { get; set; }
    }

    public class KpiAchievement
    {
        public string KPI_ACTUAL { get; set; }
        public string KPI_ACTUAL_EXCLUSION { get; set; }
        public string SLA_STATUS { get; set; }
        public string SECONDARY_SLA_STATUS { get; set; }

        public string EXCLUSION_KPI_ACTUAL { get; set; }
        public string EXCLUSION_SLA_STATUS { get; set; }
        public string EXCLUSION_SECONDARY_SLA_STATUS { get; set; }
    }

    public class CAPASendMail
    {
        public int? PRODUCT_ID { get; set; }
        public int KPI_ID { get; set; }
        public string PRODUCT_NAME { get; set; }
        public string SERVICE_LEVEL_METRIC_DESCRIPTION { get; set; }
        public string URL { get; set; }
        public string SUBJECT { get; set; }
        public string RESPONSIBILE_NAME { get; set; }
        public List<string> RESPONSIBILE_ID { get; set; }
        public string ACTION { get; set; }
        public string STAGE { get; set; }
        public string STATUS { get; set; }
        public string CLASS { get; set; }
        public string NEXT_ACTION { get; set; }
        public string ACTION_CLASS { get; set; }
        public string NOTE_MSG { get; set; }
        public string QUERY_MSG { get; set; }
        public string PERIOD_TYPE { get; set; }
        public DateTime PERIOD_DATE { get; set; }
        public int CAP_STAGE_ID { get; set; }
        public int PORTFOLIO_ID { get; set; }        
        public string REJECTION_COMMENTS { get; set; }
        public int? REJECTION_STATUS { get; set; }
    }
    public class KPIDetailsHolder
    {
        public int KPI_ID { get; set; }
        public int? DETAIL_ID { get; set; }
        public string GUID { get; set; }

        public bool IS_EXCLUSION { get; set; }

        public string EXCLUSION_COMMENT { get; set; }
        public List<BaseMeasureData> BaseMeasureDataList { get; set; }

        public List<BaseMeasureData> ExclusionBaseMeasureDataList { get; set; }
        public FINDING_STAGE_DATA CapaStage { get; set; }
      
        public int PRODUCT_ID { get; set; }

        public SLA_Rejection_data SLA_Rejection_data { get; set; }

        public KPI_DETAILS_COMMENT KPI_DETAILS_COMMENT { get; set; }
    }
    

    public class SLA_Rejection_data {
        public List<string> REJECTION_COMMENTS { get; set; }
      

       

      
        public SLA_REJECTION_KPI_DETAILS SLA_REJECTION_KPI_DETAILS { get; set; }

    }

    public class ProductKPIDetails
    {
        public string CUST_ID { get; set; }
        public int KPI_ID { get; set; }
        public int MODE_ID { get; set; }
        public int PRODUCT_ID { get; set; }
        public int PORTFOLIO_ID { get; set; }
        public string PRODUCT_TITLE { get; set; }
        public string KPI_NAME { get; set; }
        public string PERIOD_TYPE { get; set; }
        public DateTime PERIOD { get; set; }
    }
}
