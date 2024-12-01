using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface ICloudDB
    {
        void Commit(bool canCommit = true);

        IRepository<ACTIVITY_LOGS> ACTIVITY_LOGS { get; }
        IRepository<CSM_TITLES> CSM_TITLES { get; }
        IRepository<ProjectIssues> ProjectIssues { get; }
        IRepository<CUSTOMER> CUSTOMER { get; }
        IRepository<CONFIGURATION_EXT> CONFIGURATION_EXT { get; }
        IRepository<NeedFocusData> NeedFocusData { get; }
        IRepository<EMP_INFO> EMP_INFO { get; }
        IRepository<PROJECT> PROJECT { get; }
        IRepository<COMPLIANCE_TRAINING_ASSESSMENT_HEADER> COMPLIANCE_TRAINING_ASSESSMENT_HEADER { get; }
        IRepository<COMPLIANCE_TRAINING_ASSESSMENT_RESULT> COMPLIANCE_TRAINING_ASSESSMENT_RESULT { get; }
        IRepository<PROJECT_COMPLIANCE_INFO> PROJECT_COMPLIANCE_INFO { get; }
        IRepository<PROJECT_PREFERENCE> PROJECT_PREFERENCE { get; }
        IRepository<PROJECT_RESOURCE> PROJECT_RESOURCE { get; }
        IRepository<PROJMGT_ITERATION> PROJMGT_ITERATION { get; }
        IRepository<PROJMGT_RELEASE> PROJMGT_RELEASE { get; }
        IRepository<PROJMGT_USERSTORY> PROJMGT_USERSTORY { get; }
        IRepository<PROJECT_CSAT_COUNT> PROJECT_CSAT_COUNT { get; }
        IRepository<PROJ_RESRC_TIME_ENTRY> PROJ_RESRC_TIME_ENTRY { get; }
        IRepository<PROJECT_COURSE_MAPPING> PROJECT_COURSE_MAPPING { get; }
        IRepository<REPORTS_PARAMS> REPORTS_PARAMS { get; }
        IRepository<DEPT_INFO> DEPT_INFO { get; }
        IRepository<BU_INFO> BU_INFO { get; }
        IRepository<REPORTS_SP_DETAILS> REPORTS_SP_DETAILS { get; }
        IRepository<TIMESHEET_SETTINGS> TIMESHEET_SETTINGS { get; }
        IRepository<Token> Token { get; }
        IAppRepository AppRepo { get; }
        IRepository<EMP_INFO_FOR_CUSTOMER> EMP_INFO_FOR_CUSTOMER { get; }
        IRepository<PSA_TIMESHEET_SYNC> PSA_TIMESHEET_SYNC { get; }
        IRepository<API_RESPONSE_DURATION> API_RESPONSE_DURATION { get; }
        IRepository<AUDITOR_QUALIFIED_STANDARDS> AUDITOR_QUALIFIED_STANDARDS { get; }
        IRepository<PROCESS_MODEL_AUDITOR> PROCESS_MODEL_AUDITOR { get; }
        IRepository<KPI_SERVICETOWER_MAPPING> KPI_SERVICETOWER_MAPPING { get; }
        IRepository<LMS_COURSE> LMS_COURSE { get; }
        IRepository<LMS_COURSE_ENROLLMENT> LMS_COURSE_ENROLLMENT { get; }
        IRepository<LMS_COURSE_COMPLETION> LMS_COURSE_COMPLETION { get; }
        IRepository<EXTERNAL_KPI_DATA> EXTERNAL_KPI_DATA { get; }
        IRepository<EXTERNAL_KPI_DATA_MASTER> EXTERNAL_KPI_DATA_MASTER { get; }
        IRepository<EXTERNAL_KPI_FORMULAS> EXTERNAL_KPI_FORMULAS { get; }
        IRepository<BASE_MEASURE_EXTERNAL_KPI_DATA> BASE_MEASURE_EXTERNAL_KPI_DATA { get; }
        IRepository<KPI_KEYWORDS> KPI_KEYWORDS { get; }
        IRepository<ASSESSMENT_STATUS_HISTORY> ASSESSMENT_STATUS_HISTORY { get; }
        IRepository<KPI_DETAILS_COMMENT> KPI_DETAILS_COMMENT { get; }
        IRepository<RISK_REPOSITORY> RISK_REPOSITORY { get; }
        IRepository<RISK_REPOSITORY2SERVICE_TOWER> RISK_REPOSITORY2SERVICE_TOWER { get; }
        IRepository<FOLDER_DATA> FOLDER_DATA { get; }
        IRepository<FILE_DATA> FILE_DATA { get; }
        IRepository<PROCESS_MODEL_REFERENCE> PROCESS_MODEL_REFERENCE { get; }
        IRepository<PROCESS_AREA_MODEL_REFERENCE> PROCESS_AREA_MODEL_REFERENCE { get; }
        IRepository<PROJECT_CERTIFICATION_SCOPE> PROJECT_CERTIFICATION_SCOPE { get; }
        IRepository<PROJECT_ISO_STANDARD> PROJECT_ISO_STANDARD { get; }
        IRepository<PROJECT_CERTIFICATION_SCOPE_MAPPING> PROJECT_CERTIFICATION_SCOPE_MAPPING { get; }
        IRepository<PROJECT_ISO_STANDARD_MAPPING> PROJECT_ISO_STANDARD_MAPPING { get; }
        IRepository<LOCATION> LOCATION { get; }
        IRepository<RISK_CATEGORY> RISK_CATEGORY { get; }
        IRepository<IDEA_IDENTIFIER> IDEA_IDENTIFIER { get; }
        IRepository<PROJECT_INSCOPE_DETAILS> PROJECT_INSCOPE_DETAILS { get; }
        IRepository<KPI_MASTER> KPI_MASTER { get; }
        IRepository<KPI_MASTER2BASE_MEASURE_CONFIG> KPI_MASTER2BASE_MEASURE_CONFIG { get; }
        IRepository<SCP_APPLICABLE_CONFIG> SCP_APPLICABLE_CONFIG { get; }
        IRepository<SCP_PROJECT_SERVICE_TOWER> SCP_PROJECT_SERVICE_TOWER { get; }
        IRepository<RISK_ISO_STANDARD_MAPPING> RISK_ISO_STANDARD_MAPPING { get; }


    }
}
