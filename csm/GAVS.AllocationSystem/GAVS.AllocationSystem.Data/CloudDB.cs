using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public partial class CloudDB : ICloudDB, IDisposable
    {
        public CloudDB(IRepositoryProvider repositoryProvider)
        {
            CreateDbContext();

            repositoryProvider.DbContext = DbContext;
            RepositoryProvider = repositoryProvider;
        }
        public void Commit(bool canCommit = true)
        {
            if (!canCommit)
                throw new Exception($"Authorization issue: This user profile doesnot have rights to update data in CSM Platform.");
            DbContext.SaveChanges();
        }
        public IRepository<ACTIVITY_LOGS> ACTIVITY_LOGS { get { return GetStandardRepo<ACTIVITY_LOGS>(); } }
        public IRepository<NeedFocusData> NeedFocusData { get { return GetStandardRepo<NeedFocusData>(); } }
        public IRepository<CONFIGURATION_EXT> CONFIGURATION_EXT { get { return GetStandardRepo<CONFIGURATION_EXT>(); } }
        public IRepository<CSM_TITLES> CSM_TITLES { get { return GetStandardRepo<CSM_TITLES>(); } }
        public IRepository<CUSTOMER> CUSTOMER { get { return GetStandardRepo<CUSTOMER>(); } }
        public IRepository<ProjectIssues> ProjectIssues { get { return GetStandardRepo<ProjectIssues>(); } }
        public IRepository<EMP_INFO> EMP_INFO { get { return GetStandardRepo<EMP_INFO>(); } }
        public IRepository<PROJECT> PROJECT { get { return GetStandardRepo<PROJECT>(); } }
        public IRepository<PROJECT_RESOURCE> PROJECT_RESOURCE { get { return GetStandardRepo<PROJECT_RESOURCE>(); } }
        public IRepository<COMPLIANCE_TRAINING_ASSESSMENT_HEADER> COMPLIANCE_TRAINING_ASSESSMENT_HEADER { get { return GetStandardRepo<COMPLIANCE_TRAINING_ASSESSMENT_HEADER>(); } }
        public IRepository<COMPLIANCE_TRAINING_ASSESSMENT_RESULT> COMPLIANCE_TRAINING_ASSESSMENT_RESULT { get { return GetStandardRepo<COMPLIANCE_TRAINING_ASSESSMENT_RESULT>(); } }
        public IRepository<PROJECT_PREFERENCE> PROJECT_PREFERENCE { get { return GetStandardRepo<PROJECT_PREFERENCE>(); } }
        public IRepository<PROJECT_COMPLIANCE_INFO> PROJECT_COMPLIANCE_INFO { get { return GetStandardRepo<PROJECT_COMPLIANCE_INFO>(); } }
        public IRepository<PROJMGT_ITERATION> PROJMGT_ITERATION { get { return GetStandardRepo<PROJMGT_ITERATION>(); } }
        public IRepository<PROJMGT_RELEASE> PROJMGT_RELEASE { get { return GetStandardRepo<PROJMGT_RELEASE>(); } }
        public IRepository<PROJMGT_USERSTORY> PROJMGT_USERSTORY { get { return GetStandardRepo<PROJMGT_USERSTORY>(); } }
        public IRepository<PROJECT_CSAT_COUNT> PROJECT_CSAT_COUNT { get { return GetStandardRepo<PROJECT_CSAT_COUNT>(); } }
        public IRepository<PROJ_RESRC_TIME_ENTRY> PROJ_RESRC_TIME_ENTRY { get { return GetStandardRepo<PROJ_RESRC_TIME_ENTRY>(); } }
        public IRepository<PROJECT_COURSE_MAPPING> PROJECT_COURSE_MAPPING { get { return GetStandardRepo<PROJECT_COURSE_MAPPING>(); } }
        public IRepository<REPORTS_PARAMS> REPORTS_PARAMS { get { return GetStandardRepo<REPORTS_PARAMS>(); } }
        public IRepository<REPORTS_SP_DETAILS> REPORTS_SP_DETAILS { get { return GetStandardRepo<REPORTS_SP_DETAILS>(); } }
        public IRepository<DEPT_INFO> DEPT_INFO { get { return GetStandardRepo<DEPT_INFO>(); } }
        public IRepository<BU_INFO> BU_INFO { get { return GetStandardRepo<BU_INFO>(); } }
        public IRepository<TIMESHEET_SETTINGS> TIMESHEET_SETTINGS { get { return GetStandardRepo<TIMESHEET_SETTINGS>(); } }
        public IRepository<EMP_INFO_FOR_CUSTOMER> EMP_INFO_FOR_CUSTOMER { get { return GetStandardRepo<EMP_INFO_FOR_CUSTOMER>(); } }
        public IRepository<PSA_TIMESHEET_SYNC> PSA_TIMESHEET_SYNC { get { return GetStandardRepo<PSA_TIMESHEET_SYNC>(); } }
        public IRepository<API_RESPONSE_DURATION> API_RESPONSE_DURATION { get { return GetStandardRepo<API_RESPONSE_DURATION>(); } }
        public IRepository<LMS_COURSE> LMS_COURSE { get { return GetStandardRepo<LMS_COURSE>(); } }
        public IRepository<LMS_COURSE_ENROLLMENT> LMS_COURSE_ENROLLMENT { get { return GetStandardRepo<LMS_COURSE_ENROLLMENT>(); } }
        public IRepository<LMS_COURSE_COMPLETION> LMS_COURSE_COMPLETION { get { return GetStandardRepo<LMS_COURSE_COMPLETION>(); } }

        public IRepository<Token> Token { get { return GetStandardRepo<Token>(); } }
        public IRepository<PROCESS_MODEL_AUDITOR> PROCESS_MODEL_AUDITOR { get { return GetStandardRepo<PROCESS_MODEL_AUDITOR>(); } }
        public IRepository<AUDITOR_QUALIFIED_STANDARDS> AUDITOR_QUALIFIED_STANDARDS { get { return GetStandardRepo<AUDITOR_QUALIFIED_STANDARDS>(); } }
        public IAppRepository AppRepo { get { return GetRepo<IAppRepository>(); } }
        public IRepository<KPI_SERVICETOWER_MAPPING> KPI_SERVICETOWER_MAPPING { get { return GetStandardRepo<KPI_SERVICETOWER_MAPPING>(); } }
        public IRepository<EXTERNAL_KPI_DATA_MASTER> EXTERNAL_KPI_DATA_MASTER { get { return GetStandardRepo<EXTERNAL_KPI_DATA_MASTER>(); } }
        public IRepository<EXTERNAL_KPI_DATA> EXTERNAL_KPI_DATA { get { return GetStandardRepo<EXTERNAL_KPI_DATA>(); } }
        public IRepository<EXTERNAL_KPI_FORMULAS> EXTERNAL_KPI_FORMULAS { get { return GetStandardRepo<EXTERNAL_KPI_FORMULAS>(); } }

        public IRepository<KPI_KEYWORDS> KPI_KEYWORDS { get { return GetStandardRepo<KPI_KEYWORDS>(); } }
        //public IRepository<RISK_ISO_STANDARD_MAPPING> RISK_ISO_STANDARD_MAPPING { get { return GetStandardRepo<RISK_ISO_STANDARD_MAPPING>(); } }        

        protected void CreateDbContext()
        {
            // DbContextFactory = new CloudDbContextFactory();
            DbContext = new CloudDbContext();

            DbContext.Configuration.ProxyCreationEnabled = false;

            DbContext.Configuration.LazyLoadingEnabled = true;

            DbContext.Configuration.ValidateOnSaveEnabled = false;


        }
        protected IRepositoryProvider RepositoryProvider { get; set; }

        private IRepository<T> GetStandardRepo<T>() where T : class
        {
            return RepositoryProvider.GetRepositoryForEntityType<T>();
        }
        private T GetRepo<T>() where T : class
        {
            return RepositoryProvider.GetRepository<T>();
        }

        public CloudDbContext DbContext { get; set; }

        

        #region IDisposable
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
        protected virtual void Dispose(bool disposing)
        {
            if (disposing)
            {
                if (DbContext != null)
                {
                    DbContext.Dispose();
                }
            }
        }
        #endregion
    }
}


