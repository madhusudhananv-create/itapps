   
  


 

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

    public partial class CloudDbContext
    {
        public void CreateModelsFromTemplate(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BASE_MEASURE_EXTERNAL_KPI_DATA>().ToTable("dbo.BASE_MEASURE_EXTERNAL_KPI_DATA");
            modelBuilder.Entity<PRODUCT_RESPONSIBLE>().ToTable("dbo.PRODUCT_RESPONSIBLE");
            modelBuilder.Entity<ASSESSMENT_STATUS_HISTORY>().ToTable("dbo.ASSESSMENT_STATUS_HISTORY");
            modelBuilder.Entity<KPI_DETAILS_COMMENT>().ToTable("dbo.KPI_DETAILS_COMMENT");
            modelBuilder.Entity<RISK_REPOSITORY>().ToTable("dbo.RISK_REPOSITORY");
            modelBuilder.Entity<RISK_REPOSITORY2SERVICE_TOWER>().ToTable("dbo.RISK_REPOSITORY2SERVICE_TOWER");
            modelBuilder.Entity<PORTFOLIO_PROJECT>().ToTable("dbo.PORTFOLIO_PROJECT");
            modelBuilder.Entity<FOLDER_DATA>().ToTable("dbo.FOLDER_DATA");
            modelBuilder.Entity<FILE_DATA>().ToTable("dbo.FILE_DATA");
            modelBuilder.Entity<PROCESS_MODEL_REFERENCE>().ToTable("dbo.PROCESS_MODEL_REFERENCE");
            modelBuilder.Entity<PROCESS_AREA_MODEL_REFERENCE>().ToTable("dbo.PROCESS_AREA_MODEL_REFERENCE");
            modelBuilder.Entity<KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS>().ToTable("dbo.KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS");
            modelBuilder.Entity<KPI_MASTER2BASE_MEASURE_CONFIG>().ToTable("dbo.KPI_MASTER2BASE_MEASURE_CONFIG");
            modelBuilder.Entity<PROJECT_CERTIFICATION_SCOPE>().ToTable("dbo.PROJECT_CERTIFICATION_SCOPE");
            modelBuilder.Entity<PROJECT_ISO_STANDARD>().ToTable("dbo.PROJECT_ISO_STANDARD");
            modelBuilder.Entity<PROJECT_CERTIFICATION_SCOPE_MAPPING>().ToTable("dbo.PROJECT_CERTIFICATION_SCOPE_MAPPING");
            modelBuilder.Entity<PROJECT_ISO_STANDARD_MAPPING>().ToTable("dbo.PROJECT_ISO_STANDARD_MAPPING");
            modelBuilder.Entity<LOCATION>().ToTable("dbo.LOCATION");
            modelBuilder.Entity<RISK_CATEGORY>().ToTable("dbo.RISK_CATEGORY");
            modelBuilder.Entity<IDEA_IDENTIFIER>().ToTable("dbo.IDEA_IDENTIFIER");
            modelBuilder.Entity<PROJECT_INSCOPE_DETAILS>().ToTable("dbo.PROJECT_INSCOPE_DETAILS");
            modelBuilder.Entity<KPI_MASTER>().ToTable("dbo.KPI_MASTER");
            modelBuilder.Entity<KPI_MASTER2BASE_MEASURE_CONFIG>().ToTable("dbo.KPI_MASTER2BASE_MEASURE_CONFIG");
            modelBuilder.Entity<SCP_APPLICABLE_CONFIG>().ToTable("dbo.SCP_APPLICABLE_CONFIG");
            modelBuilder.Entity<SCP_PROJECT_SERVICE_TOWER>().ToTable("dbo.SCP_PROJECT_SERVICE_TOWER");
        }
        public virtual DbSet<BASE_MEASURE_EXTERNAL_KPI_DATA> BASE_MEASURE_EXTERNAL_KPI_DATA { get; set; }
        public virtual DbSet<PRODUCT_RESPONSIBLE> PRODUCT_RESPONSIBLE { get; set; }
        public virtual DbSet<ASSESSMENT_STATUS_HISTORY> ASSESSMENT_STATUS_HISTORY { get; set; }
        public virtual DbSet<KPI_DETAILS_COMMENT> KPI_DETAILS_COMMENT { get; set; }
        public virtual DbSet<RISK_REPOSITORY> RISK_REPOSITORY { get; set; }
        public virtual DbSet<RISK_REPOSITORY2SERVICE_TOWER> RISK_REPOSITORY2SERVICE_TOWER { get; set; }
        public virtual DbSet<PORTFOLIO_PROJECT> PORTFOLIO_PROJECT { get; set; }
        public virtual DbSet<FOLDER_DATA> FOLDER_DATA { get; set; }
        public virtual DbSet<FILE_DATA> FILE_DATA { get; set; }
        public virtual DbSet<PROCESS_MODEL_REFERENCE> PROCESS_MODEL_REFERENCE { get; set; }
        public virtual DbSet<PROCESS_AREA_MODEL_REFERENCE> PROCESS_AREA_MODEL_REFERENCE { get; set; }
        public virtual DbSet<KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS> KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS { get; set; }
        public virtual DbSet<KPI_MASTER2BASE_MEASURE_CONFIG> KPI_MASTER2BASE_MEASURE_CONFIG { get; set; }
        public virtual DbSet<PROJECT_CERTIFICATION_SCOPE> PROJECT_CERTIFICATION_SCOPE { get; set; }
        public virtual DbSet<PROJECT_ISO_STANDARD> PROJECT_ISO_STANDARD { get; set; }
        public virtual DbSet<PROJECT_CERTIFICATION_SCOPE_MAPPING> PROJECT_CERTIFICATION_SCOPE_MAPPING { get; set; }
        public virtual DbSet<PROJECT_ISO_STANDARD_MAPPING> PROJECT_ISO_STANDARD_MAPPING { get; set; }
        public virtual DbSet<LOCATION> LOCATION { get; set; }
        public virtual DbSet<RISK_CATEGORY> RISK_CATEGORY { get; set; }
        public virtual DbSet<IDEA_IDENTIFIER> IDEA_IDENTIFIER { get; set; }
        public virtual DbSet<PROJECT_INSCOPE_DETAILS> PROJECT_INSCOPE_DETAILS { get; set; }
        public virtual DbSet<KPI_MASTER> KPI_MASTER { get; set; }
        public virtual DbSet<SCP_APPLICABLE_CONFIG> SCP_APPLICABLE_CONFIG { get; set; }
        public virtual DbSet<SCP_PROJECT_SERVICE_TOWER> SCP_PROJECT_SERVICE_TOWER { get; set; }
}
}
 