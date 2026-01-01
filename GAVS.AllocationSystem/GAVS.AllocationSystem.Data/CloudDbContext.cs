using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public partial class CloudDbContext : DbContext
    {
        static CloudDbContext()
        {
        }
        public CloudDbContext()
               : base(nameOrConnectionString: "DefaultConnection")
        {
            Database.SetInitializer<CloudDbContext>(null);
            Database.CommandTimeout = 120;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ACTIVITY_LOGS>().ToTable("dbo.ACTIVITY_LOGS");
            modelBuilder.Entity<CONFIGURATION_EXT>().ToTable("dbo.CONFIGURATION_EXT");
            modelBuilder.Entity<CSM_TITLES>().ToTable("dbo.CSM_TITLES");
            modelBuilder.Entity<CUSTOMER>().ToTable("dbo.CUSTOMER");
            modelBuilder.Entity<EMP_INFO>().ToTable("dbo.EMP_INFO");
            modelBuilder.Entity<EMP_INFO_FOR_CUSTOMER>().ToTable("dbo.EMP_INFO_FOR_CUSTOMER");
            modelBuilder.Entity<PROJECT>().ToTable("dbo.PROJECT");
            modelBuilder.Entity<PROJECT_RESOURCE>().ToTable("dbo.PROJ_RESOURCE");
            modelBuilder.Entity<COMPLIANCE_TRAINING_ASSESSMENT_HEADER>().ToTable("dbo.COMPLIANCE_TRAINING_ASSESSMENT_HEADER");
            modelBuilder.Entity<COMPLIANCE_TRAINING_ASSESSMENT_RESULT>().ToTable("dbo.COMPLIANCE_TRAINING_ASSESSMENT_RESULT");
            modelBuilder.Entity<PROJECT_PREFERENCE>().ToTable("dbo.PROJECT_PREFERENCE");
            modelBuilder.Entity<PROJMGT_ITERATION>().ToTable("dbo.PROJMGT_ITERATION");
            modelBuilder.Entity<PROJMGT_RELEASE>().ToTable("dbo.PROJMGT_RELEASE");
            modelBuilder.Entity<PROJECT_COURSE_MAPPING>().ToTable("dbo.PROJECT_COURSE_MAPPING");
            modelBuilder.Entity<PROJMGT_USERSTORY>().ToTable("dbo.PROJMGT_USERSTORY");
            modelBuilder.Entity<PROJ_RESRC_TIME_ENTRY>().ToTable("dbo.PROJ_RESRC_TIME_ENTRY");
            modelBuilder.Entity<REPORTS_PARAMS>().ToTable("dbo.REPORTS_PARAMS");
            modelBuilder.Entity<DEPT_INFO>().ToTable("dbo.DEPT_INFO");
            modelBuilder.Entity<BU_INFO>().ToTable("dbo.BU_INFO");
            modelBuilder.Entity<TIMESHEET_SETTINGS>().ToTable("dbo.TIMESHEET_SETTINGS");
            modelBuilder.Entity<REPORTS_SP_DETAILS>().ToTable("dbo.REPORTS_SP_DETAILS");
            modelBuilder.Entity<Token>().ToTable("dbo.TOKEN");
            modelBuilder.Entity<PSA_TIMESHEET_SYNC>().ToTable("dbo.PSA_TIMESHEET_SYNC");
            modelBuilder.Entity<API_RESPONSE_DURATION>().ToTable("dbo.API_RESPONSE_DURATION");
            modelBuilder.Entity<AUDITOR_QUALIFIED_STANDARDS>().ToTable("dbo.AUDITOR_QUALIFIED_STANDARDS");
            modelBuilder.Entity<PROCESS_MODEL_AUDITOR>().ToTable("dbo.PROCESS_MODEL_AUDITOR");
            modelBuilder.Entity<KPI_SERVICETOWER_MAPPING>().ToTable("dbo.KPI_SERVICETOWER_MAPPING");
            modelBuilder.Entity<LMS_COURSE>().ToTable("dbo.LMS_COURSE");
            modelBuilder.Entity<LMS_COURSE_ENROLLMENT>().ToTable("dbo.LMS_COURSE_ENROLLMENT");
            modelBuilder.Entity<LMS_COURSE_COMPLETION>().ToTable("dbo.LMS_COURSE_COMPLETION");
            modelBuilder.Entity<EXTERNAL_KPI_DATA>().ToTable("dbo.EXTERNAL_KPI_DATA");
            modelBuilder.Entity<EXTERNAL_KPI_DATA_MASTER>().ToTable("dbo.EXTERNAL_KPI_DATA_MASTER");
            modelBuilder.Entity<BASE_MEASURE_EXTERNAL_KPI_DATA>().ToTable("dbo.BASE_MEASURE_EXTERNAL_KPI_DATA");
            modelBuilder.Entity<KPI_KEYWORDS>().ToTable("dbo.KPI_KEYWORDS");
            modelBuilder.Entity<RISK_ISO_STANDARD_MAPPING>().ToTable("dbo.RISK_ISO_STANDARD_MAPPING");
            CreateModelsFromTemplate(modelBuilder);
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
        public virtual DbSet<ACTIVITY_LOGS> ACTIVITY_LOGS { get; set; }
        public virtual DbSet<CONFIGURATION_EXT> CONFIGURATION_EXT { get; set; }
        public virtual DbSet<CSM_TITLES> CSM_TITLES { get; set; }
        public virtual DbSet<CUSTOMER> CUSTOMER { get; set; }
        public virtual DbSet<EMP_INFO> EMP_INFO { get; set; }
        public virtual DbSet<EMP_INFO_FOR_CUSTOMER> EMP_INFO_FOR_CUSTOMER { get; set; }
        public virtual DbSet<PROJECT> PROJECT { get; set; }
        public virtual DbSet<COMPLIANCE_TRAINING_ASSESSMENT_HEADER> COMPLIANCE_TRAINING_ASSESSMENT_HEADER { get; set; }
        public virtual DbSet<COMPLIANCE_TRAINING_ASSESSMENT_RESULT> COMPLIANCE_TRAINING_ASSESSMENT_RESULT { get; set; }
        public virtual DbSet<PROJECT_PREFERENCE> PROJECT_PREFERENCE { get; set; }
        public virtual DbSet<PROJECT_RESOURCE> PROJECT_RESOURCE { get; set; }
        public virtual DbSet<PROJMGT_ITERATION> PROJMGT_ITERATION { get; set; }
        public virtual DbSet<PROJMGT_RELEASE> PROJMGT_RELEASE { get; set; }
        public virtual DbSet<PROJMGT_USERSTORY> PROJMGT_USERSTORY { get; set; }
        public virtual DbSet<PROJ_RESRC_TIME_ENTRY> PROJ_RESRC_TIME_ENTRY { get; set; }
        public virtual DbSet<REPORTS_PARAMS> REPORTS_PARAMS { get; set; }
        public virtual DbSet<DEPT_INFO> DEPT_INFO { get; set; }
        public virtual DbSet<BU_INFO> BU_INFO { get; set; }
        public virtual DbSet<TIMESHEET_SETTINGS> TIMESHEET_SETTINGS { get; set; }
        public virtual DbSet<REPORTS_SP_DETAILS> REPORTS_SP_DETAILS { get; set; }
        public virtual DbSet<Token> Token { get; set; }
        public virtual DbSet<PSA_TIMESHEET_SYNC> PSA_TIMESHEET_SYNC { get; set; }
        public virtual DbSet<API_RESPONSE_DURATION> API_RESPONSE_DURATION { get; set; }
        public virtual DbSet<KPI_SERVICETOWER_MAPPING> KPI_SERVICETOWER_MAPPING { get; set; }
        public virtual DbSet<LMS_COURSE> LMS_COURSE { get; set; }
        public virtual DbSet<LMS_COURSE_ENROLLMENT> LMS_COURSE_ENROLLMENT { get; set; }
        public virtual DbSet<LMS_COURSE_COMPLETION> LMS_COURSE_COMPLETION { get; set; }
        public virtual DbSet<EXTERNAL_KPI_DATA> EXTERNAL_KPI_DATA { get; set; }
        public virtual DbSet<EXTERNAL_KPI_DATA_MASTER> EXTERNAL_KPI_DATA_MASTER { get; set; }
        public virtual DbSet<EXTERNAL_KPI_FORMULAS> EXTERNAL_KPI_FORMULAS { get; set; }
        public virtual DbSet<KPI_KEYWORDS> KPI_KEYWORDS { get; set; }
        //public virtual DbSet<RISK_ISO_STANDARD_MAPPING> RISK_ISO_STANDARD_MAPPING { get; set; }


    }
}
