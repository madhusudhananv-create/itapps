using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Tables;
//using GAVS.AllocationSystem.Model.CSP.Tables;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public class CSPDB : ICSPDB, IDisposable
    {
        public CSPDB(IRepositoryProvider_CSP repositoryProvider)
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
        public IRepository_CSP<APP_ACCESS_CONTROLS> APP_ACCESS_CONTROLS { get { return GetStandardRepo<APP_ACCESS_CONTROLS>(); } }
        public IRepository_CSP<APP_ACCESS_CONTROLS_DETAILS> APP_ACCESS_CONTROLS_DETAILS { get { return GetStandardRepo<APP_ACCESS_CONTROLS_DETAILS>(); } }
        public IRepository_CSP<APP_CONTROL_FEATURES> APP_CONTROL_FEATURES { get { return GetStandardRepo<APP_CONTROL_FEATURES>(); } }
        public IRepository_CSP<APP_CONTROLS> APP_CONTROLS { get { return GetStandardRepo<APP_CONTROLS>(); } }
        public IRepository_CSP<AUDIT_SCHEDULE> AUDIT_SCHEDULE { get { return GetStandardRepo<AUDIT_SCHEDULE>(); } }
        public IRepository_CSP<AUDIT_SCHEDULE_REF> AUDIT_SCHEDULE_REF { get { return GetStandardRepo<AUDIT_SCHEDULE_REF>(); } }
        public IRepository_CSP<CONTACTS> CONTACTS { get { return GetStandardRepo<CONTACTS>(); } }
        public IRepository_CSP<CRISP_CATEGORY> CRISP_CATEGORY { get { return GetStandardRepo<CRISP_CATEGORY>(); } }
        public IRepository_CSP<CRISP_CRITERIA> CRISP_CRITERIA { get { return GetStandardRepo<CRISP_CRITERIA>(); } }
        public IRepository_CSP<CRISP_PROJECT_CATEGORY> CRISP_PROJECT_CATEGORY { get { return GetStandardRepo<CRISP_PROJECT_CATEGORY>(); } }
        public IRepository_CSP<CRISP_PROJECT_CRITERIA> CRISP_PROJECT_CRITERIA { get { return GetStandardRepo<CRISP_PROJECT_CRITERIA>(); } }
        public IRepository_CSP<CRISP_PROJECT_VALIDATIONS> CRISP_PROJECT_VALIDATIONS { get { return GetStandardRepo<CRISP_PROJECT_VALIDATIONS>(); } }
        public IRepository_CSP<CRISP_SCORES_CATEGORY> CRISP_SCORES_CATEGORY { get { return GetStandardRepo<CRISP_SCORES_CATEGORY>(); } }
        public IRepository_CSP<CRISP_SCORES_CRITERIA> CRISP_SCORES_CRITERIA { get { return GetStandardRepo<CRISP_SCORES_CRITERIA>(); } }
        public IRepository_CSP<CRISP_SCORES_PROJECT> CRISP_SCORES_PROJECT { get { return GetStandardRepo<CRISP_SCORES_PROJECT>(); } }
        public IRepository_CSP<CRISP_SCORES_VALIDATIONS> CRISP_SCORES_VALIDATIONS { get { return GetStandardRepo<CRISP_SCORES_VALIDATIONS>(); } }
        public IRepository_CSP<CRISP_VALIDATIONS> CRISP_VALIDATIONS { get { return GetStandardRepo<CRISP_VALIDATIONS>(); } }
        public IRepository_CSP<CSS_BATCHES> CSS_BATCHES { get { return GetStandardRepo<CSS_BATCHES>(); } }
        public IRepository_CSP<CSS_BATCH_CUSTOMERS> CSS_BATCH_CUSTOMERS { get { return GetStandardRepo<CSS_BATCH_CUSTOMERS>(); } }
        public IRepository_CSP<CSS_BATCH_MONTHLY> CSS_BATCH_MONTHLY { get { return GetStandardRepo<CSS_BATCH_MONTHLY>(); } }
        public IRepository_CSP<CSS_BATCH_CUSTOMER_MONTHLY> CSS_BATCH_CUSTOMER_MONTHLY { get { return GetStandardRepo<CSS_BATCH_CUSTOMER_MONTHLY>(); } }
        public IRepository_CSP<CSS_QUESTION_REPLIES> CSS_QUESTION_REPLIES { get { return GetStandardRepo<CSS_QUESTION_REPLIES>(); } }
        public IRepository_CSP<CSS_QUESTION_MASTER> CSS_QUESTION_MASTER { get { return GetStandardRepo<CSS_QUESTION_MASTER>(); } }
        public IRepository_CSP<CSS_SURVEY_ITERATION> CSS_SURVEY_ITERATION { get { return GetStandardRepo<CSS_SURVEY_ITERATION>(); } }
        public IRepository_CSP<CUSTOMER_FEEDBACK> CUSTOMER_FEEDBACK { get { return GetStandardRepo<CUSTOMER_FEEDBACK>(); } }
        public IRepository_CSP<CUSTOMER_MOM_DETAILS> CUSTOMER_MOM_DETAILS { get { return GetStandardRepo<CUSTOMER_MOM_DETAILS>(); } }
        public IRepository_CSP<CUSTOMER_PROJECTS> CUSTOMER_PROJECTS { get { return GetStandardRepo<CUSTOMER_PROJECTS>(); } }
        public IRepository_CSP<CUSTOMER_USERS> CUSTOMER_USERS { get { return GetStandardRepo<CUSTOMER_USERS>(); } }
        public IRepository_CSP<CUSTOMER_REPORTS> CUSTOMER_REPORTS { get { return GetStandardRepo<CUSTOMER_REPORTS>(); } }
        public IRepository_CSP<DASHBOARD_DETAILS> DASHBOARD_DETAILS { get { return GetStandardRepo<DASHBOARD_DETAILS>(); } }
        public IRepository_CSP<ENGAGEMENT_OVERVIEW> ENGAGEMENT_OVERVIEW { get { return GetStandardRepo<ENGAGEMENT_OVERVIEW>(); } }
        public IRepository_CSP<FILTER_PREFERENCE> FILTER_PREFERENCE { get { return GetStandardRepo<FILTER_PREFERENCE>(); } }
        public IRepository_CSP<SQA_REPORT_FILES> SQA_REPORT_FILES { get { return GetStandardRepo<SQA_REPORT_FILES>(); } }
        public IRepository_CSP<GLOBAL_KPI_CATEGORY> GLOBAL_KPI_CATEGORY { get { return GetStandardRepo<GLOBAL_KPI_CATEGORY>(); } }
        public IRepository_CSP<GLOBAL_PERSPECTIVE> GLOBAL_PERSPECTIVE { get { return GetStandardRepo<GLOBAL_PERSPECTIVE>(); } }
        public IRepository_CSP<GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING> GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING { get { return GetStandardRepo<GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING>(); } }
        public IRepository_CSP<HIGHLIGHTS> HIGHLIGHTS { get { return GetStandardRepo<HIGHLIGHTS>(); } }
        public IRepository_CSP<KPI> KPI { get { return GetStandardRepo<KPI>(); } }
        public IRepository_CSP<KPI_DETAILS> KPI_DETAILS { get { return GetStandardRepo<KPI_DETAILS>(); } }
        public IRepository_CSP<KPI_TARGETS> KPI_TARGETS { get { return GetStandardRepo<KPI_TARGETS>(); } }
        public IRepository_CSP<KPI_DetailMonthandWeekly> KPI_DetailMonthandWeekly { get { return GetStandardRepo<KPI_DetailMonthandWeekly>(); } }
        public IRepository_CSP<KPI_GOALS> KPI_GOALS { get { return GetStandardRepo<KPI_GOALS>(); } }
        public IRepository_CSP<LAST_UPDATED_DETAILS> LAST_UPDATED_DETAILS { get { return GetStandardRepo<LAST_UPDATED_DETAILS>(); } }
        public IRepository_CSP<MOM> MOM { get { return GetStandardRepo<MOM>(); } }
        public IRepository_CSP<NOTES> NOTES { get { return GetStandardRepo<NOTES>(); } }
        public IRepository_CSP<PORTFOLIO> PORTFOLIO { get { return GetStandardRepo<PORTFOLIO>(); } }

        public IRepository_CSP<PORTFOLIO_PRODUCT> PORTFOLIO_PRODUCTS { get { return GetStandardRepo<PORTFOLIO_PRODUCT>(); } }
        public IRepository_CSP<PORTFOLIO_PROJECT> PORTFOLIO_PROJECT { get { return GetStandardRepo<PORTFOLIO_PROJECT>(); } }

        public IRepository_CSP<PORTFOLIOS> PORTFOLIOS { get { return GetStandardRepo<PORTFOLIOS>(); } }
        public IRepository_CSP<PORTFOLIOS_OWNERS> PORTFOLIOS_OWNERS { get { return GetStandardRepo<PORTFOLIOS_OWNERS>(); } }
        public IRepository_CSP<PORTFOLIOS_OWNERS_PROJECT> PORTFOLIOS_OWNERS_PROJECT { get { return GetStandardRepo<PORTFOLIOS_OWNERS_PROJECT>(); } }
        public IRepository_CSP<PROCESS> PROCESS { get { return GetStandardRepo<PROCESS>(); } }
        public IRepository_CSP<PROCESS_MODEL_TESTS_NEW> PROCESS_MODEL_TESTS_NEW { get { return GetStandardRepo<PROCESS_MODEL_TESTS_NEW>(); } }
        public IRepository_CSP<PROCESS_AREA> PROCESS_AREA { get { return GetStandardRepo<PROCESS_AREA>(); } }
        public IRepository_CSP<PROCESS_OBJECTIVE_MAPPING> PROCESS_OBJECTIVE_MAPPING { get { return GetStandardRepo<PROCESS_OBJECTIVE_MAPPING>(); } }
        public IRepository_CSP<PROJECT_BEST_PRACTICES> PROJECT_BEST_PRACTICES { get { return GetStandardRepo<PROJECT_BEST_PRACTICES>(); } }
        public IRepository_CSP<PROJECT_DELIVERY> PROJECT_DELIVERY { get { return GetStandardRepo<PROJECT_DELIVERY>(); } }
        public IRepository_CSP<PROJECT_INNOVATION> PROJECT_INNOVATION { get { return GetStandardRepo<PROJECT_INNOVATION>(); } }
        public IRepository_CSP<PROJECT_ISSUE> PROJECT_ISSUE { get { return GetStandardRepo<PROJECT_ISSUE>(); } }
        public IRepository_CSP<PROJECT_LESSON_LEARNT> PROJECT_LESSON_LEARNT { get { return GetStandardRepo<PROJECT_LESSON_LEARNT>(); } }
        public IRepository_CSP<PROJECT_PEOPLE> PROJECT_PEOPLE { get { return GetStandardRepo<PROJECT_PEOPLE>(); } }
        public IRepository_CSP<PROJECT_PROCESS> PROJECT_PROCESS { get { return GetStandardRepo<PROJECT_PROCESS>(); } }
        public IRepository_CSP<PROJECT_RISK> PROJECT_RISK { get { return GetStandardRepo<PROJECT_RISK>(); } }
        public IRepository_CSP<PROJECT_SCOPE> PROJECT_SCOPE { get { return GetStandardRepo<PROJECT_SCOPE>(); } }
        public IRepository_CSP<PROJECT_SUCCESS> PROJECT_SUCCESS { get { return GetStandardRepo<PROJECT_SUCCESS>(); } }
        public IRepository_CSP<PROJECT_VALUEADDS> PROJECT_VALUEADDS { get { return GetStandardRepo<PROJECT_VALUEADDS>(); } }
        public IRepository_CSP<PROJECT_ACTIONITEM> PROJECT_ACTIONITEM { get { return GetStandardRepo<PROJECT_ACTIONITEM>(); } }
        public IRepository_CSP<PROJECT_RAGS> PROJECT_RAGS { get { return GetStandardRepo<PROJECT_RAGS>(); } }
        public IRepository_CSP<PROJECT_CSAT_DATA> PROJECT_CSAT_DATA { get { return GetStandardRepo<PROJECT_CSAT_DATA>(); } }
        public IRepository_CSP<SQA_CHART_FILTER> SQA_CHART_FILTER { get { return GetStandardRepo<SQA_CHART_FILTER>(); } }
        public IRepository_CSP<SQA_CHART_GROUPS> SQA_CHART_GROUPS { get { return GetStandardRepo<SQA_CHART_GROUPS>(); } }
        public IRepository_CSP<SQA_DATA_REPOSITORY> SQA_DATA_REPOSITORY { get { return GetStandardRepo<SQA_DATA_REPOSITORY>(); } }
        public IRepository_CSP<SQA_PROJECT_CHART_PARAMS> SQA_PROJECT_CHART_PARAMS { get { return GetStandardRepo<SQA_PROJECT_CHART_PARAMS>(); } }
        public IRepository_CSP<SQA_PROJECT_REPORTS> SQA_PROJECT_REPORTS { get { return GetStandardRepo<SQA_PROJECT_REPORTS>(); } }
        public IRepository_CSP<SQA_PROJECT_REPORTS_STRUCT> SQA_PROJECT_REPORTS_STRUCT { get { return GetStandardRepo<SQA_PROJECT_REPORTS_STRUCT>(); } }
        public IRepository_CSP<PARAMETER_TABLE> PARAMETER_TABLE { get { return GetStandardRepo<PARAMETER_TABLE>(); } }
        public IRepository_CSP<CSAT_SURVEY_DATA> CSAT_SURVEY_DATA { get { return GetStandardRepo<CSAT_SURVEY_DATA>(); } }
        //public IRepository_CSP<PROCESS_MODEL_AUDITOR_DATA> PROCESS_MODEL_AUDITOR_DATA { get { return GetStandardRepo<PROCESS_MODEL_AUDITOR_DATA>(); } }
        public IRepository_CSP<INNOVATION_SERVICE_MAPPING> INNOVATION_SERVICE_MAPPING { get { return GetStandardRepo<INNOVATION_SERVICE_MAPPING>(); } }
        public IAppRepository_CSP AppRepo { get { return GetRepo<IAppRepository_CSP>(); } }
        public IRepository_CSP<PROCESS_MODEL> PROCESS_MODEL { get { return GetStandardRepo<PROCESS_MODEL>(); } }

        public IRepository_CSP<CONTROL_REFERENCE> CONTROL_REFERENCE { get { return GetStandardRepo<CONTROL_REFERENCE>(); } }
        public IRepository_CSP<PROCESS_MODEL_OBJECTIVES> PROCESS_MODEL_OBJECTIVES { get { return GetStandardRepo<PROCESS_MODEL_OBJECTIVES>(); } }

        public IRepository_CSP<PROCESS_MODEL_OBJECTIVES_NEW> PROCESS_MODEL_OBJECTIVES_NEW { get { return GetStandardRepo<PROCESS_MODEL_OBJECTIVES_NEW>(); } }
        public IRepository_CSP<PROCESS_MODEL_PROCESS_MAPPING> PROCESS_MODEL_PROCESS_MAPPING { get { return GetStandardRepo<PROCESS_MODEL_PROCESS_MAPPING>(); } }
        public IRepository_CSP<PROCESS_SERVICE_AREA_PROJECT_MAPPING> PROCESS_SERVICE_AREA_PROJECT_MAPPING { get { return GetStandardRepo<PROCESS_SERVICE_AREA_PROJECT_MAPPING>(); } }
        public IRepository_CSP<PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING> PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING { get { return GetStandardRepo<PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING>(); } }
        public IRepository_CSP<PM_PROCESS_CHECKLIST_MAPPING> PM_PROCESS_CHECKLIST_MAPPING { get { return GetStandardRepo<PM_PROCESS_CHECKLIST_MAPPING>(); } }
        public IRepository_CSP<PM_CHECKLIST> PM_CHECKLIST { get { return GetStandardRepo<PM_CHECKLIST>(); } }
        public IRepository_CSP<PM_CHECKLIST_QUESTIONS> PM_CHECKLIST_QUESTIONS { get { return GetStandardRepo<PM_CHECKLIST_QUESTIONS>(); } }
        public IRepository_CSP<PROCESS_MODEL_CONTROL_NEW> PROCESS_MODEL_CONTROL_NEW { get { return GetStandardRepo<PROCESS_MODEL_CONTROL_NEW>(); } }
        //public IRepository_CSP<PROCESS_OBJECTIVE_MAPPING> PROCESS_OBJECTIVE_MAPPING { get { return GetStandardRepo<PROCESS_OBJECTIVE_MAPPING>(); } }
        public IRepository_CSP<PROCESS_OBJECTIVES_MAPPING> PROCESS_OBJECTIVES_MAPPING { get { return GetStandardRepo<PROCESS_OBJECTIVES_MAPPING>(); } }
        public IRepository_CSP<CONTROL_RISKS_MAPPING> CONTROL_RISKS_MAPPING { get { return GetStandardRepo<CONTROL_RISKS_MAPPING>(); } }

        public IRepository_CSP<CONTROL_CLASSIFICATIONS> CONTROL_CLASSIFICATIONS { get { return GetStandardRepo<CONTROL_CLASSIFICATIONS>(); } }

        //public IRepository_CSP<PROCESS_MODEL_TESTS_NEW> PROCESS_MODEL_TESTS_NEW { get { return GetStandardRepo<PROCESS_MODEL_TESTS_NEW>(); } }

        public IRepository_CSP<TEST_CONTROL_MAPPING> TEST_CONTROL_MAPPING { get { return GetStandardRepo<TEST_CONTROL_MAPPING>(); } }

        public IRepository_CSP<PROCESS_SERVICE_AREA_MAPPING> PROCESS_SERVICE_AREA_MAPPING { get { return GetStandardRepo<PROCESS_SERVICE_AREA_MAPPING>(); } }

        public IRepository_CSP<RISKS_OBJECTIVES_MAPPING> RISKS_OBJECTIVES_MAPPING { get { return GetStandardRepo<RISKS_OBJECTIVES_MAPPING>(); } }
        public IRepository_CSP<PROCESS_MODEL_RISKS> PROCESS_MODEL_RISKS { get { return GetStandardRepo<PROCESS_MODEL_RISKS>(); } }
        public IRepository_CSP<PROCESS_MODEL_CONTROL> PROCESS_MODEL_CONTROL { get { return GetStandardRepo<PROCESS_MODEL_CONTROL>(); } }

        public IRepository_CSP<CONTROL_CATEGORY> CONTROL_CATEGORY { get { return GetStandardRepo<CONTROL_CATEGORY>(); } }
        public IRepository_CSP<PROCESS_MODEL_TESTS> PROCESS_MODEL_TESTS { get { return GetStandardRepo<PROCESS_MODEL_TESTS>(); } }
        public IRepository_CSP<PROCESS_SERVICE_AREA> PROCESS_SERVICE_AREA { get { return GetStandardRepo<PROCESS_SERVICE_AREA>(); } }
        public IRepository_CSP<PROCESS_SERVICE_AREA_NEW> PROCESS_SERVICE_AREA_NEW { get { return GetStandardRepo<PROCESS_SERVICE_AREA_NEW>(); } }

        public IRepository_CSP<PROCESS_MODEL_RISKS_NEW> PROCESS_MODEL_RISKS_NEW { get { return GetStandardRepo<PROCESS_MODEL_RISKS_NEW>(); } }

        public IRepository_CSP<CSM_TITLES> CSM_TITLES { get { return GetStandardRepo<CSM_TITLES>(); } }

        public IRepository_CSP<RISKS_LEVEL1_DETAILS> RISKS_LEVEL1_DETAILS { get { return GetStandardRepo<RISKS_LEVEL1_DETAILS>(); } }

        public IRepository_CSP<RISKS_LEVEL2_DETAILS> RISKS_LEVEL2_DETAILS { get { return GetStandardRepo<RISKS_LEVEL2_DETAILS>(); } }
        public IRepository_CSP<RISKS_LEVEL3_DETAILS> RISKS_LEVEL3_DETAILS { get { return GetStandardRepo<RISKS_LEVEL3_DETAILS>(); } }

        public IRepository_CSP<GAVS_SERVICE> GAVS_SERVICE { get { return GetStandardRepo<GAVS_SERVICE>(); } }
        public IRepository_CSP<SUBPROJECT> SUBPROJECT { get { return GetStandardRepo<SUBPROJECT>(); } }
        public IRepository_CSP<SUBPROJECT_TASK> SUBPROJECT_TASK { get { return GetStandardRepo<SUBPROJECT_TASK>(); } }
        public IRepository_CSP<PROCESS_MODEL_PROJECT_CONFIG> PROCESS_MODEL_PROJECT_CONFIG { get { return GetStandardRepo<PROCESS_MODEL_PROJECT_CONFIG>(); } }
        public IRepository_CSP<AUDIT_EXECUTION_MODEL> AUDIT_EXECUTION_MODEL { get { return GetStandardRepo<AUDIT_EXECUTION_MODEL>(); } }
        public IRepository_CSP<EXECUTION_IMPACT_MAPPING> EXECUTION_IMPACT_MAPPING { get { return GetStandardRepo<EXECUTION_IMPACT_MAPPING>(); } }
        public IRepository_CSP<AUDIT_EXECUTION_AUDITEE_DETAILS> AUDIT_EXECUTION_AUDITEE_DETAILS { get { return GetStandardRepo<AUDIT_EXECUTION_AUDITEE_DETAILS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_PROJECT_EXECUTION> AUDIT_CHECKLIST_PROJECT_EXECUTION { get { throw new Exception("table AUDIT_CHECKLIST_PROJECT_EXECUTION has been replaced by AUDIT_CHECKLIST_EXECUTION_SUMMARY"); } }
        public IRepository_CSP<GAVS_SERVICE_AREA> GAVS_SERVICE_AREA { get { return GetStandardRepo<GAVS_SERVICE_AREA>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_WEIGHT_NC_TABLE> AUDIT_CHECKLIST_WEIGHT_NC_TABLE { get { return GetStandardRepo<AUDIT_CHECKLIST_WEIGHT_NC_TABLE>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_PROJECT_FINDINGS> AUDIT_CHECKLIST_PROJECT_FINDINGS { get { return GetStandardRepo<AUDIT_CHECKLIST_PROJECT_FINDINGS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED { get { return GetStandardRepo<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>(); } }
        public IRepository_CSP<CHECKLIST_EXECUTION_AUDITEE_DETAILS> CHECKLIST_EXECUTION_AUDITEE_DETAILS { get { return GetStandardRepo<CHECKLIST_EXECUTION_AUDITEE_DETAILS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_QUESTIONS> AUDIT_CHECKLIST_QUESTIONS { get { return GetStandardRepo<AUDIT_CHECKLIST_QUESTIONS>(); } }
        public IRepository_CSP<PROCESS_MODEL_PROCESS> PROCESS_MODEL_PROCESS { get { return GetStandardRepo<PROCESS_MODEL_PROCESS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_WEIGHTAGE> AUDIT_CHECKLIST_WEIGHTAGE { get { return GetStandardRepo<AUDIT_CHECKLIST_WEIGHTAGE>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_STATUS_MAPPING> AUDIT_CHECKLIST_STATUS_MAPPING { get { return GetStandardRepo<AUDIT_CHECKLIST_STATUS_MAPPING>(); } }
        public IRepository_CSP<AUDIT_FINDING_STAGES> AUDIT_FINDING_STAGES { get { return GetStandardRepo<AUDIT_FINDING_STAGES>(); } }
        public IRepository_CSP<AUDIT_FINDING_STAGES_MAPPING> AUDIT_FINDING_STAGES_MAPPING { get { return GetStandardRepo<AUDIT_FINDING_STAGES_MAPPING>(); } }
        public IRepository_CSP<AUDIT_FINDINGS_CAPA> AUDIT_FINDINGS_CAPA { get { return GetStandardRepo<AUDIT_FINDINGS_CAPA>(); } }
        public IRepository_CSP<AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING> AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING { get { return GetStandardRepo<AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING>(); } }
        public IRepository_CSP<AUDIT_MANAGEMENT_CAUSES> AUDIT_MANAGEMENT_CAUSES { get { return GetStandardRepo<AUDIT_MANAGEMENT_CAUSES>(); } }
        public IRepository_CSP<AUDIT_MANAGEMENT_ROOTCAUSES> AUDIT_MANAGEMENT_ROOTCAUSES { get { return GetStandardRepo<AUDIT_MANAGEMENT_ROOTCAUSES>(); } }
        public IRepository_CSP<AUDIT_FINDING_CAPA_REVIEW> AUDIT_FINDING_CAPA_REVIEW { get { return GetStandardRepo<AUDIT_FINDING_CAPA_REVIEW>(); } }
        public IRepository_CSP<AUDIT_FINDING_CAPA_IMPLEMENTATION> AUDIT_FINDING_CAPA_IMPLEMENTATION { get { return GetStandardRepo<AUDIT_FINDING_CAPA_IMPLEMENTATION>(); } }
        public IRepository_CSP<AUDIT_FINDING_CAPA_VERIFICATION> AUDIT_FINDING_CAPA_VERIFICATION { get { return GetStandardRepo<AUDIT_FINDING_CAPA_VERIFICATION>(); } }
        public IRepository_CSP<AUDIT_FINDING_CAPA_STATUS_HISTORY> AUDIT_FINDING_CAPA_STATUS_HISTORY { get { return GetStandardRepo<AUDIT_FINDING_CAPA_STATUS_HISTORY>(); } }
        public IRepository_CSP<PROCESS_MODEL_CLAUSES> PROCESS_MODEL_CLAUSES { get { return GetStandardRepo<PROCESS_MODEL_CLAUSES>(); } }
        public IRepository_CSP<PROCESS_MODEL_QUESTIONS> PROCESS_MODEL_QUESTIONS { get { return GetStandardRepo<PROCESS_MODEL_QUESTIONS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING> AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING { get { return GetStandardRepo<AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING>(); } }
        public IRepository_CSP<TASK> TASK { get { return GetStandardRepo<TASK>(); } }
        public IRepository_CSP<TASK_CATEGORY> TASK_CATEGORY { get { return GetStandardRepo<TASK_CATEGORY>(); } }
        public IRepository_CSP<TASK_RECURRENCE> TASK_RECURRENCE { get { return GetStandardRepo<TASK_RECURRENCE>(); } }
        public IRepository_CSP<TASK_TYPE> TASK_TYPE { get { return GetStandardRepo<TASK_TYPE>(); } }
        public IRepository_CSP<EMAIL_LOG> EMAIL_LOG { get { return GetStandardRepo<EMAIL_LOG>(); } }

        public IRepository_CSP<PM_MATURITY_LEVEL> PM_MATURITY_LEVEL { get { return GetStandardRepo<PM_MATURITY_LEVEL>(); } }
        public IRepository_CSP<PM_MATURITYLEVEL_MAPPING> PM_MATURITYLEVEL_MAPPING { get { return GetStandardRepo<PM_MATURITYLEVEL_MAPPING>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_STATUS_LIST> AUDIT_CHECKLIST_STATUS_LIST { get { return GetStandardRepo<AUDIT_CHECKLIST_STATUS_LIST>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_STATUS_LIST_VALUES> AUDIT_CHECKLIST_STATUS_LIST_VALUES { get { return GetStandardRepo<AUDIT_CHECKLIST_STATUS_LIST_VALUES>(); } }
        public IRepository_CSP<PM_PROCESS_QUESTIONS_MAPPING> PM_PROCESS_QUESTIONS_MAPPING { get { return GetStandardRepo<PM_PROCESS_QUESTIONS_MAPPING>(); } }
        public IRepository_CSP<FINDINGSTYPE> FINDINGSTYPE { get { return GetStandardRepo<FINDINGSTYPE>(); } }
        public IRepository_CSP<FINDINGSTYPE_VALUES> FINDINGSTYPE_VALUES { get { return GetStandardRepo<FINDINGSTYPE_VALUES>(); } }
        public IRepository_CSP<AUDITEE_ACCEPTANCE> AUDITEE_ACCEPTANCE { get { return GetStandardRepo<AUDITEE_ACCEPTANCE>(); } }



        public IRepository_CSP<CUST_REQ_REF> CUST_REQ_REF { get { return GetStandardRepo<CUST_REQ_REF>(); } }
        public IRepository_CSP<CUST_REQ_STATUS> CUST_REQ_STATUS { get { return GetStandardRepo<CUST_REQ_STATUS>(); } }
        public IRepository_CSP<CUST_REQ_STAGE_STATUS> CUST_REQ_STAGE_STATUS { get { return GetStandardRepo<CUST_REQ_STAGE_STATUS>(); } }
        public IRepository_CSP<REQ_CATEGORY> REQ_CATEGORY { get { return GetStandardRepo<REQ_CATEGORY>(); } }
        public IRepository_CSP<REQ_CAT_MAPPING> REQ_CAT_MAPPING { get { return GetStandardRepo<REQ_CAT_MAPPING>(); } }
        public IRepository_CSP<REQ_LEVEL> REQ_LEVEL { get { return GetStandardRepo<REQ_LEVEL>(); } }
        public IRepository_CSP<REQ_LEVEL_MAPPING> REQ_LEVEL_MAPPING { get { return GetStandardRepo<REQ_LEVEL_MAPPING>(); } }

        public IRepository_CSP<SERVICE_LEVEL_IDENTIFIER_MODEL> SERVICE_LEVEL_IDENTIFIER_MODEL { get { return GetStandardRepo<SERVICE_LEVEL_IDENTIFIER_MODEL>(); } }

        public IRepository_CSP<FMEA_Task_Model> FMEA_Task_Model { get { return GetStandardRepo<FMEA_Task_Model>(); } }


        public IRepository_CSP<FMEAModel> FMEAModel { get { return GetStandardRepo<FMEAModel>(); } }
        public IRepository_CSP<Failure_Mode_Master> Failure_Mode_Master { get { return GetStandardRepo<Failure_Mode_Master>(); } }
         
        public IRepository_CSP<CHECKLIST_SCORES_BY_AUDIT> CHECKLIST_SCORES_BY_AUDIT { get { throw new Exception("Table is retired"); } }

        
        public IRepository_CSP<FMEA_DATA_STAGE2_MODEL> FMEA_DATA_STAGE2_MODEL { get { return GetStandardRepo<FMEA_DATA_STAGE2_MODEL>(); } }

        public IRepository_CSP<FMEA_Rating_Factors_Model> FMEA_Rating_Factors_Model { get { return GetStandardRepo<FMEA_Rating_Factors_Model>(); } }

        public IRepository_CSP<TIMEFORMAT_CONFIG> TIMEFORMAT_CONFIG { get { return GetStandardRepo<TIMEFORMAT_CONFIG>(); } }

        public IRepository_CSP<CHECKLIST_EXECUTION_CC_DETAILS> CHECKLIST_EXECUTION_CC_DETAILS { get { return GetStandardRepo<CHECKLIST_EXECUTION_CC_DETAILS>(); } }

        public IRepository_CSP<PROJECT_CONFIGURATION_SETTING> PROJECT_CONFIGURATION_SETTING { get { return GetStandardRepo<PROJECT_CONFIGURATION_SETTING>(); } }

        public IRepository_CSP<PROJECT_CONFIGURATION_DATA> PROJECT_CONFIGURATION_DATA { get { return GetStandardRepo<PROJECT_CONFIGURATION_DATA>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_EXECUTION_DETAILS> AUDIT_CHECKLIST_EXECUTION_DETAILS { get { return GetStandardRepo<AUDIT_CHECKLIST_EXECUTION_DETAILS>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_EXECUTION_SUMMARY> AUDIT_CHECKLIST_EXECUTION_SUMMARY { get { return GetStandardRepo<AUDIT_CHECKLIST_EXECUTION_SUMMARY>(); } }
        public IRepository_CSP<IDEA> IDEA { get { return GetStandardRepo<IDEA>(); } }
        public IRepository_CSP<IDEA_STATUS> IDEA_STATUS { get { return GetStandardRepo<IDEA_STATUS>(); } }
        public IRepository_CSP<IDEA_IMPROVEMENT_TYPE> IDEA_IMPROVEMENT_TYPE { get { return GetStandardRepo<IDEA_IMPROVEMENT_TYPE>(); } }
        public IRepository_CSP<POTENTIAL_SOLUTION_CATEGORY> POTENTIAL_SOLUTION_CATEGORY { get { return GetStandardRepo<POTENTIAL_SOLUTION_CATEGORY>(); } }

        public IRepository_CSP<BENEFIT_DETAILS_QUANTITATIVE> BENEFIT_DETAILS_QUANTITATIVE { get { return GetStandardRepo<BENEFIT_DETAILS_QUANTITATIVE>(); } }
        public IRepository_CSP<IDEA_BENEFIT_SUMMARY> IDEA_BENEFIT_SUMMARY { get { return GetStandardRepo<IDEA_BENEFIT_SUMMARY>(); } }
        public IRepository_CSP<IDEA_CATEGORY_UOM_MAPPING> IDEA_CATEGORY_UOM_MAPPING { get { return GetStandardRepo<IDEA_CATEGORY_UOM_MAPPING>(); } }
        public IRepository_CSP<UOM> UOM { get { return GetStandardRepo<UOM>(); } }
        public IRepository_CSP<IDEA_CATEGORY> IDEA_CATEGORY { get { return GetStandardRepo<IDEA_CATEGORY>(); } }
        public IRepository_CSP<BENEFIT_DETAILS_QUALITATIVE> BENEFIT_DETAILS_QUALITATIVE { get { return GetStandardRepo<BENEFIT_DETAILS_QUALITATIVE>(); } }
        public IRepository_CSP<IDEA_IMPLEMENTATION_PLAN> IDEA_IMPLEMENTATION_PLAN { get { return GetStandardRepo<IDEA_IMPLEMENTATION_PLAN>(); } }
        public IRepository_CSP<IDEA_STAGE_STATUS> IDEA_STAGE_STATUS { get { return GetStandardRepo<IDEA_STAGE_STATUS>(); } }
        public IRepository_CSP<PROJECT_FAILURES_MAPPING> PROJECT_FAILURES_MAPPING { get { return GetStandardRepo<PROJECT_FAILURES_MAPPING>(); } }
        public IRepository_CSP<FAILURE_ASSESSMENT> FAILURE_ASSESSMENT { get { return GetStandardRepo<FAILURE_ASSESSMENT>(); } }
        public IRepository_CSP<CONTACT_ROLES> CONTACT_ROLES { get { return GetStandardRepo<CONTACT_ROLES>(); } }
        public IRepository_CSP<AUDIT_CHECKLIST_WEIGHTAGE_SCORES> AUDIT_CHECKLIST_WEIGHTAGE_SCORES { get { return GetStandardRepo<AUDIT_CHECKLIST_WEIGHTAGE_SCORES>(); } }

        public IRepository_CSP<PRODUCT_MODE_MAPPING> PRODUCT_MODE_MAPPING { get { return GetStandardRepo<PRODUCT_MODE_MAPPING>(); } }
        public IRepository_CSP<MODE_KPI_MAPPING> MODE_KPI_MAPPING { get { return GetStandardRepo<MODE_KPI_MAPPING>(); } }

        public IRepository_CSP<PRODUCT_TIER> PRODUCT_TIER { get { return GetStandardRepo<PRODUCT_TIER>(); } }

        public IRepository_CSP<TIER_LEVEL_MATRIX> TIER_LEVEL_MATRIX { get { return GetStandardRepo<TIER_LEVEL_MATRIX>(); } }

        public IRepository_CSP<PRODUCTS_SERVICE_AREA> PRODUCTS_SERVICE_AREA { get { return GetStandardRepo<PRODUCTS_SERVICE_AREA>(); } }

        public IRepository_CSP<PRODUCTS_SLA_CATEGORY> PRODUCTS_SLA_CATEGORY { get { return GetStandardRepo<PRODUCTS_SLA_CATEGORY>(); } }

        public IRepository_CSP<PRODUCTS_SERVICE_LEVEL_MODE> PRODUCTS_SERVICE_LEVEL_MODE { get { return GetStandardRepo<PRODUCTS_SERVICE_LEVEL_MODE>(); } }

        public IRepository_CSP<PRODUCTS_SERVICE_LEVEL_TYPE> PRODUCTS_SERVICE_LEVEL_TYPE { get { return GetStandardRepo<PRODUCTS_SERVICE_LEVEL_TYPE>(); } }

        public IRepository_CSP<PRODUCT_SERVICE_LEVEL_METRICS> PRODUCT_SERVICE_LEVEL_METRICS { get { return GetStandardRepo<PRODUCT_SERVICE_LEVEL_METRICS>(); } }
        public IRepository_CSP<REFERENCE_MASTER> REFERENCE_MASTER { get { return GetStandardRepo<REFERENCE_MASTER>(); } }

        public IRepository_CSP<BASE_MEASURE> BASE_MEASURE { get { return GetStandardRepo<BASE_MEASURE>(); } }
        public IRepository_CSP<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG> SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG { get { return GetStandardRepo<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG>(); } }
        public IRepository_CSP<KPI_BASE_MEASURE_VALUE> KPI_BASE_MEASURE_VALUE { get { return GetStandardRepo<KPI_BASE_MEASURE_VALUE>(); } }

        public IRepository_CSP<KPI2PRODUCT_SERVICE_LEVEL_METRICS> KPI2PRODUCT_SERVICE_LEVEL_METRICS { get { return GetStandardRepo<KPI2PRODUCT_SERVICE_LEVEL_METRICS>(); } }

        public IRepository_CSP<PRODUCT_RESPONSIBLE> PRODUCT_RESPONSIBLE { get { return GetStandardRepo<PRODUCT_RESPONSIBLE>(); } }

        public IRepository_CSP<PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE> PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE { get { return GetStandardRepo<PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE>(); } }
        public IRepository_CSP<SUPPORT_VALUE_TYPE> SUPPORT_VALUE_TYPE { get { return GetStandardRepo<SUPPORT_VALUE_TYPE>(); } }
        public IRepository_CSP<SUPPORT_VALUE_REQUEST> SUPPORT_VALUE_REQUEST { get { return GetStandardRepo<SUPPORT_VALUE_REQUEST>(); } }
        public IRepository_CSP<BASE_MEASURE_FORMULA_TYPE> BASE_MEASURE_FORMULA_TYPE { get { return GetStandardRepo<BASE_MEASURE_FORMULA_TYPE>(); } }

        public IRepository_CSP<CUSTOMER_CAPA_APPROVAL> CUSTOMER_CAPA_APPROVAL { get { return GetStandardRepo<CUSTOMER_CAPA_APPROVAL>(); } }

        public IRepository_CSP<CUSTOMER_CAPA_APPROVAL_STATUS> CUSTOMER_CAPA_APPROVAL_STATUS { get { return GetStandardRepo<CUSTOMER_CAPA_APPROVAL_STATUS>(); } }

        public IRepository_CSP<SLA_REJECTION> SLA_REJECTION { get { return GetStandardRepo<SLA_REJECTION>(); } }
        public IRepository_CSP<SLA_REJECTION_KPI_DETAILS> SLA_REJECTION_KPI_DETAILS { get { return GetStandardRepo<SLA_REJECTION_KPI_DETAILS>(); } }
        public IRepository_CSP<SLA_REJECTION_STATUS_HISTORY> SLA_REJECTION_STATUS_HISTORY { get { return GetStandardRepo<SLA_REJECTION_STATUS_HISTORY>(); } }
        public IRepository_CSP<SLA_REJECTION_STATUS> SLA_REJECTION_STATUS { get { return GetStandardRepo<SLA_REJECTION_STATUS>(); } }
        public IRepository_CSP<TASK_STATUS_HISTORY> TASK_STATUS_HISTORY { get { return GetStandardRepo<TASK_STATUS_HISTORY>(); } }
        public IRepository_CSP<APPRECIATION> APPRECIATION { get { return GetStandardRepo<APPRECIATION>(); } }
        public IRepository_CSP<PROJECT_INSCOPE_DETAILS> PROJECT_INSCOPE_DETAILS { get { return GetStandardRepo<PROJECT_INSCOPE_DETAILS>(); } }
        public IRepository_CSP<CSS_QUESTION_MODELS> CSS_QUESTION_MODELS { get { return GetStandardRepo<CSS_QUESTION_MODELS>(); } }

        public IRepository_CSP<ACCESS_REQUEST> ACCESS_REQUEST { get { return GetStandardRepo<ACCESS_REQUEST>(); } }

        public IRepository_CSP<PROJECT_SCOPE_VALUES> PROJECT_SCOPE_VALUES { get { return GetStandardRepo<PROJECT_SCOPE_VALUES>(); } }

        public IRepository_CSP<INTEGRATION_REQUEST_DATA> INTEGRATION_REQUEST_DATA { get { return GetStandardRepo<INTEGRATION_REQUEST_DATA>(); } }

        public IRepository_CSP<ENTITY_HISTORY> ENTITY_HISTORY { get { return GetStandardRepo<ENTITY_HISTORY>(); } }

        public IRepository_CSP<DROPDOWN_OPTIONS> DROPDOWN_OPTIONS { get { return GetStandardRepo<DROPDOWN_OPTIONS>(); } }

        public IRepository_CSP<ITOPS_DOMAIN> ITOPS_DOMAIN { get { return GetStandardRepo<ITOPS_DOMAIN>(); } }
        public IRepository_CSP<ITOPS_CATEGORY> ITOPS_CATEGORY { get { return GetStandardRepo<ITOPS_CATEGORY>(); } }
        public IRepository_CSP<ITOPS_PARAMETER> ITOPS_PARAMETER { get { return GetStandardRepo<ITOPS_PARAMETER>(); } }
        public IRepository_CSP<ITOPS_PARAMETER_LEVEL> ITOPS_PARAMETER_LEVEL { get { return GetStandardRepo<ITOPS_PARAMETER_LEVEL>(); } }
        public IRepository_CSP<ITOPS_ROLE> ITOPS_ROLE { get { return GetStandardRepo<ITOPS_ROLE>(); } }
        public IRepository_CSP<ITOPS_ROLE_ASSIGNMENT> ITOPS_ROLE_ASSIGNMENT { get { return GetStandardRepo<ITOPS_ROLE_ASSIGNMENT>(); } }
        public IRepository_CSP<ITOPS_DOMAIN_PROJECT_MAP> ITOPS_DOMAIN_PROJECT_MAP { get { return GetStandardRepo<ITOPS_DOMAIN_PROJECT_MAP>(); } }
        public IRepository_CSP<ITOPS_DOMAIN_PROJECT_MAP_AUDIT> ITOPS_DOMAIN_PROJECT_MAP_AUDIT { get { return GetStandardRepo<ITOPS_DOMAIN_PROJECT_MAP_AUDIT>(); } }
        public IRepository_CSP<ITOPS_PROJECT_ASSESSEE> ITOPS_PROJECT_ASSESSEE { get { return GetStandardRepo<ITOPS_PROJECT_ASSESSEE>(); } }
        public IRepository_CSP<ITOPS_ASSESSMENT_MASTER> ITOPS_ASSESSMENT_MASTER { get { return GetStandardRepo<ITOPS_ASSESSMENT_MASTER>(); } }
        public IRepository_CSP<ITOPS_ASSESSMENT> ITOPS_ASSESSMENT { get { return GetStandardRepo<ITOPS_ASSESSMENT>(); } }
        public IRepository_CSP<ITOPS_ASSESSMENT_ASSESSOR> ITOPS_ASSESSMENT_ASSESSOR { get { return GetStandardRepo<ITOPS_ASSESSMENT_ASSESSOR>(); } }
        public IRepository_CSP<ITOPS_ASSESSMENT_REVIEWER> ITOPS_ASSESSMENT_REVIEWER { get { return GetStandardRepo<ITOPS_ASSESSMENT_REVIEWER>(); } }
        public IRepository_CSP<ITOPS_ASSESSMENT_ASSESSEE> ITOPS_ASSESSMENT_ASSESSEE { get { return GetStandardRepo<ITOPS_ASSESSMENT_ASSESSEE>(); } }
        public IRepository_CSP<ITOPS_SCORE> ITOPS_SCORE { get { return GetStandardRepo<ITOPS_SCORE>(); } }
        public IRepository_CSP<ITOPS_EVIDENCE> ITOPS_EVIDENCE { get { return GetStandardRepo<ITOPS_EVIDENCE>(); } }
        public IRepository_CSP<ITOPS_FINDING> ITOPS_FINDING { get { return GetStandardRepo<ITOPS_FINDING>(); } }
        public IRepository_CSP<ITOPS_FINDING_ACTIVITY> ITOPS_FINDING_ACTIVITY { get { return GetStandardRepo<ITOPS_FINDING_ACTIVITY>(); } }
        public IRepository_CSP<ITOPS_NOTIFICATION> ITOPS_NOTIFICATION { get { return GetStandardRepo<ITOPS_NOTIFICATION>(); } }
        public IRepository_CSP<ITOPS_REPORT_SP_DETAILS> ITOPS_REPORT_SP_DETAILS { get { return GetStandardRepo<ITOPS_REPORT_SP_DETAILS>(); } }
        public IRepository_CSP<ITOPS_REPORT_PARAMS> ITOPS_REPORT_PARAMS { get { return GetStandardRepo<ITOPS_REPORT_PARAMS>(); } }


        protected void CreateDbContext()
        {
            // DbContextFactory = new CloudDbContextFactory();
            DbContext = new CSPDbContext();

            DbContext.Configuration.ProxyCreationEnabled = false;

            DbContext.Configuration.LazyLoadingEnabled = true;

            DbContext.Configuration.ValidateOnSaveEnabled = false;
        }
        protected IRepositoryProvider_CSP RepositoryProvider { get; set; }

        private IRepository_CSP<T> GetStandardRepo<T>() where T : class
        {
            return RepositoryProvider.GetRepositoryForEntityType<T>();
        }
        private T GetRepo<T>() where T : class
        {
            return RepositoryProvider.GetRepository<T>();
        }

        public CSPDbContext DbContext { get; set; }

        
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
