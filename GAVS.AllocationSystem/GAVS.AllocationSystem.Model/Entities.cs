   
 



using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.Base;

namespace GAVS.AllocationSystem.Model.AllSys
{
    public partial class BASE_MEASURE_EXTERNAL_KPI_DATA : EntityBase
    {
        public int KPI_BASE_MEASURE_VALUE_ID {get; set;}
        public int? EXTERNAL_KPI_DATA_ID {get; set;}
        public string KPI_DATA_JSON {get; set;}
        public int KPI_DATATYPE {get; set;}
    }





    public partial class PRODUCT_RESPONSIBLE : EntityBase
    {
        public int PRODUCT_ID {get; set;}
        public string EMP_ID {get; set;}
        public string PROJECT_ID {get; set;}
        public int MANAGEMENT_TYPE {get; set;}
    }





    public partial class ASSESSMENT_STATUS_HISTORY : EntityBase
    {
        public int ASSESSMENT_ID {get; set;}
        public string STATUS {get; set;}
        public string REQUESTED_EMP_ID {get; set;}
        public string APPROVER_EMP_ID {get; set;}
        public string REQUEST_COMMENTS {get; set;}
        public string APPROVE_REJECT_COMMENTS {get; set;}
        public bool IS_RETAIN_CAPA {get; set;}
    }





    public partial class KPI_DETAILS_COMMENT : EntityBase
    {
        public int KPI_DETAILS_ID {get; set;}
        public string COMMENT {get; set;}
        public string COMMENT_BY {get; set;}
        public DateTime COMMENT_TIMESTAMP {get; set;}
    }





    public partial class RISK_REPOSITORY : EntityBase
    {
        public string RISK_DESCRIPTION {get; set;}
        public string RISK_IMPACT {get; set;}
        public int LIKELIHOOD {get; set;}
        public int CONSEQUENCES {get; set;}
        public string RISK_TREATMENT_STRATEGY {get; set;}
        public string THREATS {get; set;}
        public string VULNERABILITIES {get; set;}
    }





    public partial class RISK_REPOSITORY2SERVICE_TOWER : EntityBase
    {
        public int RISK_REPOSITORY_ID {get; set;}
        public int SERVICE_TOWER_ID {get; set;}
    }





    public partial class PORTFOLIO_PROJECT : EntityBase
    {
        public int PORTFOLIO_ID {get; set;}
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
    }





    public partial class FOLDER_DATA : EntityBase
    {
        public string FOLDER_NAME {get; set;}
        public string PROJ_ID {get; set;}
        public string CUSTOMER_ID {get; set;}
        public int PARENT_FOLDER_ID {get; set;}
        public DateTime ADDED_DATE {get; set;}
        public string ADDED_BY {get; set;}
    }





    public partial class FILE_DATA : EntityBase
    {
        public string FILE_NAME {get; set;}
        public int FOLDER_ID {get; set;}
        public string FILE_GUID {get; set;}
        public string FILE_EXTENSION {get; set;}
        public string FILE_TYPE {get; set;}
        public DateTime UPLOAD_DATE {get; set;}
        public string UPLOADED_BY {get; set;}
    }





    public partial class PROCESS_MODEL_REFERENCE : EntityBase
    {
        public string SECTION_REFERENCE {get; set;}
        public string CONTROL_REFERENCE {get; set;}
        public int PROCESS_MODEL_ID {get; set;}
    }





    public partial class PROCESS_AREA_MODEL_REFERENCE : EntityBase
    {
        public int PROCESS_ID {get; set;}
        public int PROCESS_MODEL_REFERENCE_ID {get; set;}
    }





    public partial class KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS : EntityBase
    {
        public int KPI_MASTER_ID {get; set;}
        public int PRODUCT_SERVICE_LEVEL_METRICS_ID {get; set;}
    }





    public partial class KPI_MASTER2BASE_MEASURE_CONFIG : EntityBase
    {
        public int BASE_MEASURE_ID {get; set;}
        public int KPI_MASTER_ID {get; set;}
        public int DISPLAY_ORDER {get; set;}
    }





    public partial class PROJECT_CERTIFICATION_SCOPE : EntityBase
    {
        public string SCOPE_NAME {get; set;}
        public int ISO_STANDARD_ID {get; set;}
    }





    public partial class PROJECT_ISO_STANDARD : EntityBase
    {
        public string STANDARD_NAME {get; set;}
    }





    public partial class PROJECT_CERTIFICATION_SCOPE_MAPPING : EntityBase
    {
        public string PROJECT_ID {get; set;}
        public int CERTIFICATION_SCOPE_ID {get; set;}
    }





    public partial class PROJECT_ISO_STANDARD_MAPPING : EntityBase
    {
        public string PROJECT_ID {get; set;}
        public int ISO_STANDARD_ID {get; set;}
    }





    public partial class LOCATION : EntityBase
    {
        public string LOCATION_NAME {get; set;}
    }





    public partial class RISK_CATEGORY : EntityBase
    {
        public string CATEGORY {get; set;}
    }





    public partial class IDEA_IDENTIFIER : EntityBase
    {
        public int IDEA_ID {get; set;}
        public string IDENTIFIED_BY {get; set;}
    }





    public partial class PROJECT_INSCOPE_DETAILS : EntityBase
    {
        public int SERVICE_AREA_ID {get; set;}
        public string TOOLS {get; set;}
        public string TECHNOLOGY {get; set;}
        public string PROJECT_ID {get; set;}
    }





    public partial class KPI_MASTER : EntityBase
    {
        public string SERVICE_AREA {get; set;}
        public string ABBREVIATION {get; set;}
        public string KPI_NAME {get; set;}
        public string SUPPORT_WINDOW {get; set;}
        public string FREQUENCY {get; set;}
        public string PRIORITY {get; set;}
        public string SLA_TARGET_UNIT_OF_MEASUREMENT {get; set;}
        public int GLOBAL_KPI_CATEGORY_ID {get; set;}
        public int MODE_ID {get; set;}
    }





    public partial class SCP_APPLICABLE_CONFIG : EntityBase
    {
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
        public string PROJ_ID {get; set;}
        public bool IS_SCP_APPLICABLE {get; set;}
        public string FREQUENCY {get; set;}
    }





    public partial class SCP_PROJECT_SERVICE_TOWER : EntityBase
    {
        public int SCP_CONFIG_ID {get; set;}
        public int SERVICE_TOWER_ID {get; set;}
    }





    public partial class RISK_ISO_STANDARD_MAPPING : EntityBase
    {
        public int ID {get; set;}
        public int RISK_ID  {get; set;}
        public int ISO_STANDARD_ID {get; set;}
    }





    public partial class ACCESS_REQUEST : EntityBase
    {
        public string RESOURCE_ID {get; set;}
        public int ACCESS_LEVEL {get; set;}
        public string FEATURE {get; set;}
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public string STATUS {get; set;}
        public string APPROVER_ID  {get; set;}
        public  DateTime? APPROVAL_DATE {get; set;}
        public  string REJECT_REASON  {get; set;}
        public string REQUESTED_BY  {get; set;}
        public  DateTime? REQUESTED_DATE  {get; set;}
    }





    public partial class PROJECT_SCOPE_VALUES : EntityBase
    {
        public string PROJ_ID {get; set;}
        public string FIELD_NAME {get; set;}
        public string FIELD_VALUE  {get; set;}
        public  string FIELD_TYPE {get; set;}
        public  bool IS_MANDATORY  {get; set;}
    }





    public partial class INTEGRATION_REQUEST_DATA : EntityBase
    {
        public string REQUEST_TYPE {get; set;}
        public string REQUEST_DATA {get; set;}
        public string PROJ_ID {get; set;}
        public bool IS_PROCESSED  {get; set;}
        public  DateTime? PROCESSED_DATE {get; set;}
        public  string ERROR_INFO {get; set;}
    }






}
 