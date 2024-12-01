   
  


 using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
            
namespace GAVS.AllocationSystem.Data
{

     public partial class CloudDB
    {
   
            public IRepository<BASE_MEASURE_EXTERNAL_KPI_DATA> BASE_MEASURE_EXTERNAL_KPI_DATA { get { return GetStandardRepo<BASE_MEASURE_EXTERNAL_KPI_DATA>(); } }
  
   
            public IRepository<PRODUCT_RESPONSIBLE> PRODUCT_RESPONSIBLE { get { return GetStandardRepo<PRODUCT_RESPONSIBLE>(); } }
  
   
            public IRepository<ASSESSMENT_STATUS_HISTORY> ASSESSMENT_STATUS_HISTORY { get { return GetStandardRepo<ASSESSMENT_STATUS_HISTORY>(); } }
  
   
            public IRepository<KPI_DETAILS_COMMENT> KPI_DETAILS_COMMENT { get { return GetStandardRepo<KPI_DETAILS_COMMENT>(); } }
  
   
            public IRepository<RISK_REPOSITORY> RISK_REPOSITORY { get { return GetStandardRepo<RISK_REPOSITORY>(); } }
  
   
            public IRepository<RISK_REPOSITORY2SERVICE_TOWER> RISK_REPOSITORY2SERVICE_TOWER { get { return GetStandardRepo<RISK_REPOSITORY2SERVICE_TOWER>(); } }
  
   
            public IRepository<PORTFOLIO_PROJECT> PORTFOLIO_PROJECT { get { return GetStandardRepo<PORTFOLIO_PROJECT>(); } }
  
   
            public IRepository<FOLDER_DATA> FOLDER_DATA { get { return GetStandardRepo<FOLDER_DATA>(); } }
  
   
            public IRepository<FILE_DATA> FILE_DATA { get { return GetStandardRepo<FILE_DATA>(); } }
  
   
            public IRepository<PROCESS_MODEL_REFERENCE> PROCESS_MODEL_REFERENCE { get { return GetStandardRepo<PROCESS_MODEL_REFERENCE>(); } }
  
   
            public IRepository<PROCESS_AREA_MODEL_REFERENCE> PROCESS_AREA_MODEL_REFERENCE { get { return GetStandardRepo<PROCESS_AREA_MODEL_REFERENCE>(); } }
  
   
            public IRepository<KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS> KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS { get { return GetStandardRepo<KPI_MASTER2PRODUCT_SERVICE_LEVEL_METRICS>(); } }
  
   
            public IRepository<KPI_MASTER2BASE_MEASURE_CONFIG> KPI_MASTER2BASE_MEASURE_CONFIG { get { return GetStandardRepo<KPI_MASTER2BASE_MEASURE_CONFIG>(); } }
  
   
            public IRepository<PROJECT_CERTIFICATION_SCOPE> PROJECT_CERTIFICATION_SCOPE { get { return GetStandardRepo<PROJECT_CERTIFICATION_SCOPE>(); } }
  
   
            public IRepository<PROJECT_ISO_STANDARD> PROJECT_ISO_STANDARD { get { return GetStandardRepo<PROJECT_ISO_STANDARD>(); } }
  
   
            public IRepository<PROJECT_CERTIFICATION_SCOPE_MAPPING> PROJECT_CERTIFICATION_SCOPE_MAPPING { get { return GetStandardRepo<PROJECT_CERTIFICATION_SCOPE_MAPPING>(); } }
  
   
            public IRepository<PROJECT_ISO_STANDARD_MAPPING> PROJECT_ISO_STANDARD_MAPPING { get { return GetStandardRepo<PROJECT_ISO_STANDARD_MAPPING>(); } }
  
   
            public IRepository<LOCATION> LOCATION { get { return GetStandardRepo<LOCATION>(); } }
  
   
            public IRepository<RISK_CATEGORY> RISK_CATEGORY { get { return GetStandardRepo<RISK_CATEGORY>(); } }
  
   
            public IRepository<IDEA_IDENTIFIER> IDEA_IDENTIFIER { get { return GetStandardRepo<IDEA_IDENTIFIER>(); } }
  
   
            public IRepository<PROJECT_INSCOPE_DETAILS> PROJECT_INSCOPE_DETAILS { get { return GetStandardRepo<PROJECT_INSCOPE_DETAILS>(); } }
  
   
            public IRepository<KPI_MASTER> KPI_MASTER { get { return GetStandardRepo<KPI_MASTER>(); } }
  
   
            public IRepository<SCP_APPLICABLE_CONFIG> SCP_APPLICABLE_CONFIG { get { return GetStandardRepo<SCP_APPLICABLE_CONFIG>(); } }
  
   
            public IRepository<SCP_PROJECT_SERVICE_TOWER> SCP_PROJECT_SERVICE_TOWER { get { return GetStandardRepo<SCP_PROJECT_SERVICE_TOWER>(); } }
  
    }
}
 