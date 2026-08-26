using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public class CSPDbContext : DbContext
    {
        static CSPDbContext()
        {
        }
        public CSPDbContext()
               : base(nameOrConnectionString: "Conn")
        {
            Database.SetInitializer<CSPDbContext>(null);
            Database.CommandTimeout = 120;
        }
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            modelBuilder.Entity<APP_ACCESS_CONTROLS>().ToTable("dbo.APP_ACCESS_CONTROLS");
            modelBuilder.Entity<APP_ACCESS_CONTROLS_DETAILS>().ToTable("dbo.APP_ACCESS_CONTROLS_DETAILS");
            modelBuilder.Entity<APP_CONTROL_FEATURES>().ToTable("dbo.APP_CONTROL_FEATURES");
            modelBuilder.Entity<APP_CONTROLS>().ToTable("dbo.APP_CONTROLS");
            modelBuilder.Entity<AUDIT_SCHEDULE>().ToTable("dbo.AUDIT_SCHEDULE");
            modelBuilder.Entity<AUDIT_SCHEDULE_REF>().ToTable("dbo.AUDIT_SCHEDULE_REF");
            modelBuilder.Entity<CONTACTS>().ToTable("dbo.CONTACTS");
            modelBuilder.Entity<CRISP_CATEGORY>().ToTable("dbo.CRISP_CATEGORY");
            modelBuilder.Entity<CRISP_CRITERIA>().ToTable("dbo.CRISP_CRITERIA");
            modelBuilder.Entity<CRISP_PROJECT_CATEGORY>().ToTable("dbo.CRISP_PROJECT_CATEGORY");
            modelBuilder.Entity<CRISP_PROJECT_CRITERIA>().ToTable("dbo.CRISP_PROJECT_CRITERIA");
            modelBuilder.Entity<CRISP_PROJECT_VALIDATIONS>().ToTable("dbo.CRISP_PROJECT_VALIDATIONS");
            modelBuilder.Entity<CRISP_SCORES_CATEGORY>().ToTable("dbo.CRISP_SCORES_CATEGORY");
            modelBuilder.Entity<CRISP_SCORES_CRITERIA>().ToTable("dbo.CRISP_SCORES_CRITERIA");
            modelBuilder.Entity<CRISP_SCORES_PROJECT>().ToTable("dbo.CRISP_SCORES_PROJECT");
            modelBuilder.Entity<CRISP_SCORES_VALIDATIONS>().ToTable("dbo.CRISP_SCORES_VALIDATIONS");
            modelBuilder.Entity<CRISP_VALIDATIONS>().ToTable("dbo.CRISP_VALIDATIONS");
            modelBuilder.Entity<CRISP_SCORES_PROJECT>().ToTable("dbo.CRISP_SCORES_PROJECT");
            modelBuilder.Entity<CSS_BATCHES>().ToTable("dbo.CSS_BATCHES");
            modelBuilder.Entity<CSS_BATCH_CUSTOMERS>().ToTable("dbo.CSS_BATCH_CUSTOMERS");
            modelBuilder.Entity<CSS_QUESTION_REPLIES>().ToTable("dbo.CSS_QUESTION_REPLIES");
            modelBuilder.Entity<CSS_QUESTION_MASTER>().ToTable("dbo.CSS_QUESTION_MASTER");
            modelBuilder.Entity<CSS_SURVEY_ITERATION>().ToTable("dbo.CSS_SURVEY_ITERATION");
            modelBuilder.Entity<CUSTOMER_FEEDBACK>().ToTable("dbo.CUSTOMER_FEEDBACK");
            modelBuilder.Entity<CUSTOMER_MOM_DETAILS>().ToTable("dbo.CUSTOMER_MOM_DETAILS");
            modelBuilder.Entity<CUSTOMER_PROJECTS>().ToTable("dbo.CUSTOMER_PROJECTS");
            modelBuilder.Entity<CUSTOMER_REPORTS>().ToTable("dbo.CUSTOMER_REPORTS");
            modelBuilder.Entity<CUSTOMER_USERS>().ToTable("dbo.CUSTOMER_USERS");
            modelBuilder.Entity<DASHBOARD_DETAILS>().ToTable("dbo.DASHBOARD_DETAILS");
            modelBuilder.Entity<ENGAGEMENT_OVERVIEW>().ToTable("dbo.ENGAGEMENT_OVERVIEW");
            modelBuilder.Entity<FILTER_PREFERENCE>().ToTable("dbo.FILTER_PREFERENCE");
            modelBuilder.Entity<GLOBAL_KPI_CATEGORY>().ToTable("dbo.GLOBAL_KPI_CATEGORY");
            modelBuilder.Entity<GLOBAL_PERSPECTIVE>().ToTable("dbo.GLOBAL_PERSPECTIVE");
            modelBuilder.Entity<GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING>().ToTable("dbo.GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING");
            modelBuilder.Entity<SQA_REPORT_FILES>().ToTable("dbo.SQA_REPORT_FILES");
            modelBuilder.Entity<HIGHLIGHTS>().ToTable("dbo.HIGHLIGHTS");
            modelBuilder.Entity<NOTES>().ToTable("dbo.NOTES");
            modelBuilder.Entity<KPI>().ToTable("dbo.KPI");
            modelBuilder.Entity<KPI_DETAILS>().ToTable("dbo.KPI_DETAILS");
            modelBuilder.Entity<KPI_TARGETS>().ToTable("dbo.KPI_TARGETS");
            modelBuilder.Entity<KPI_GOALS>().ToTable("dbo.KPI_GOALS");
            modelBuilder.Entity<LAST_UPDATED_DETAILS>().ToTable("dbo.LAST_UPDATED_DETAILS");
            modelBuilder.Entity<PORTFOLIO>().ToTable("dbo.PORTFOLIO");
            modelBuilder.Entity<PORTFOLIO_PROJECT>().ToTable("dbo.PORTFOLIO_PROJECT");
            modelBuilder.Entity<PORTFOLIOS>().ToTable("dbo.PORTFOLIOS");
            modelBuilder.Entity<PORTFOLIOS_OWNERS>().ToTable("dbo.PORTFOLIOS_OWNERS");
            modelBuilder.Entity<PORTFOLIOS_OWNERS_PROJECT>().ToTable("dbo.PORTFOLIOS_OWNERS_PROJECT");
            modelBuilder.Entity<PROCESS>().ToTable("dbo.PROCESS");
            modelBuilder.Entity<PROCESS_MODEL_TESTS_NEW>().ToTable("dbo.PM_PROCESS_MODEL_TESTS_NEW");
            modelBuilder.Entity<PROCESS_AREA>().ToTable("dbo.PROCESS_AREA");
            modelBuilder.Entity<PROCESS_OBJECTIVE_MAPPING>().ToTable("dbo.PROCESS_OBJECTIVE_MAPPING");
            modelBuilder.Entity<PROJECT_BEST_PRACTICES>().ToTable("dbo.PROJECT_BEST_PRACTICES");
            modelBuilder.Entity<PROJECT_DELIVERY>().ToTable("dbo.PROJECT_DELIVERY");
            modelBuilder.Entity<PROJECT_INNOVATION>().ToTable("dbo.PROJECT_INNOVATION");
            modelBuilder.Entity<PROJECT_ISSUE>().ToTable("dbo.PROJECT_ISSUE");
            modelBuilder.Entity<PROJECT_LESSON_LEARNT>().ToTable("dbo.PROJECT_LESSON_LEARNT");
            modelBuilder.Entity<PROJECT_PEOPLE>().ToTable("dbo.PROJECT_PEOPLE");
            modelBuilder.Entity<PROJECT_PROCESS>().ToTable("dbo.PROJECT_PROCESS");
            modelBuilder.Entity<PROJECT_RISK>().ToTable("dbo.PROJECT_RISK");
            modelBuilder.Entity<PROJECT_SUCCESS>().ToTable("dbo.PROJECT_SUCCESS");
            modelBuilder.Entity<PROJECT_SCOPE>().ToTable("dbo.PROJECT_SCOPE");
            modelBuilder.Entity<PROJECT_VALUEADDS>().ToTable("dbo.PROJECT_VALUEADDS");
            modelBuilder.Entity<PROJECT_ACTIONITEM>().ToTable("dbo.PROJECT_ACTIONITEM");
            modelBuilder.Entity<PROJECT_RAGS>().ToTable("dbo.PROJECT_RAGS");
            modelBuilder.Entity<PROJECT_CSAT_DATA>().ToTable("dbo.PROJECT_CSAT_DATA");
            modelBuilder.Entity<SQA_CHART_FILTER>().ToTable("dbo.SQA_CHART_FILTER");
            modelBuilder.Entity<SQA_CHART_GROUPS>().ToTable("dbo.SQA_CHART_GROUPS");
            modelBuilder.Entity<SQA_DATA_REPOSITORY>().ToTable("dbo.SQA_DATA_REPOSITORY");
            modelBuilder.Entity<SQA_PROJECT_CHART_PARAMS>().ToTable("dbo.SQA_PROJECT_CHART_PARAMS");
            modelBuilder.Entity<SQA_PROJECT_REPORTS>().ToTable("dbo.SQA_PROJECT_REPORTS");
            modelBuilder.Entity<SQA_PROJECT_REPORTS_STRUCT>().ToTable("dbo.SQA_PROJECT_REPORTS_STRUCT");
            modelBuilder.Entity<PARAMETER_TABLE>().ToTable("dbo.PARAMETER_TABLE");
            modelBuilder.Entity<CSAT_SURVEY_DATA>().ToTable("dbo.CSAT_SURVEY_DATA");
            //modelBuilder.Entity<PROCESS_MODEL_AUDITOR_DATA>().ToTable("dbo.PROCESS_MODEL_AUDITOR");
            modelBuilder.Entity<PROCESS_MODEL>().ToTable("dbo.PROCESS_MODEL");
            modelBuilder.Entity<PROCESS_MODEL_OBJECTIVES>().ToTable("dbo.PROCESS_MODEL_OBJECTIVES");
            modelBuilder.Entity<PROCESS_MODEL_OBJECTIVES_NEW>().ToTable("dbo.PROCESS_MODEL_OBJECTIVES_NEW");
            modelBuilder.Entity<PROCESS_MODEL_PROCESS_MAPPING>().ToTable("dbo.PROCESS_MODEL_PROCESS_MAPPING");
            modelBuilder.Entity<PROCESS_SERVICE_AREA_PROJECT_MAPPING>().ToTable("dbo.PROCESS_SERVICE_AREA_PROJECT_MAPPING");
            modelBuilder.Entity<PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING>().ToTable("dbo.PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING");
            modelBuilder.Entity<PM_PROCESS_CHECKLIST_MAPPING>().ToTable("dbo.PM_PROCESS_CHECKLIST_MAPPING");
            modelBuilder.Entity<PM_CHECKLIST>().ToTable("dbo.PM_CHECKLIST");
            modelBuilder.Entity<PM_CHECKLIST_QUESTIONS>().ToTable("dbo.PM_CHECKLIST_QUESTIONS");
            modelBuilder.Entity<RISKS_OBJECTIVES_MAPPING>().ToTable("dbo.RISKS_OBJECTIVES_MAPPING");
            modelBuilder.Entity<PROCESS_OBJECTIVES_MAPPING>().ToTable("dbo.PROCESS_OBJECTIVES_MAPPING");
            modelBuilder.Entity<PROCESS_SERVICE_AREA_MAPPING>().ToTable("dbo.PROCESS_SERVICE_AREA_MAPPING");
            modelBuilder.Entity<PROCESS_MODEL_RISKS>().ToTable("dbo.PROCESS_MODEL_RISKS");
            modelBuilder.Entity<CONTROL_CATEGORY>().ToTable("dbo.PM_CONTROL_CATEGORY");
            modelBuilder.Entity<CONTROL_CLASSIFICATIONS>().ToTable("dbo.PM_CONTROL_CLASSIFICATION");
            modelBuilder.Entity<CONTROL_REFERENCE>().ToTable("dbo.PM_CONTROL_REFERENCE");
         //   modelBuilder.Entity<PROCESS_OBJECTIVE_MAPPING>().ToTable("dbo.PROCESS_OBJECTIVE_MAPPING");
            modelBuilder.Entity<PROCESS_MODEL_TESTS_NEW>().ToTable("dbo.PM_PROCESS_MODEL_TESTS_NEW");
            modelBuilder.Entity<TEST_CONTROL_MAPPING>().ToTable("dbo.PM_TEST_CONTROL_MAPPING");
            modelBuilder.Entity<PROCESS_MODEL_RISKS_NEW>().ToTable("dbo.PROCESS_MODEL_RISKS_NEW");
            modelBuilder.Entity<CONTROL_RISKS_MAPPING>().ToTable("dbo.PM_CONTROL_RISKS_MAPPING");
            modelBuilder.Entity<RISKS_LEVEL1_DETAILS>().ToTable("dbo.RISKS_LEVEL1_DETAILS");
            modelBuilder.Entity<RISKS_LEVEL2_DETAILS>().ToTable("dbo.RISKS_LEVEL2_DETAILS");
            modelBuilder.Entity<RISKS_LEVEL3_DETAILS>().ToTable("dbo.RISKS_LEVEL3_DETAILS");
            modelBuilder.Entity<CSM_TITLES>().ToTable("dbo.CSM_TITLES");
            modelBuilder.Entity<PROCESS_MODEL_CONTROL>().ToTable("dbo.PROCESS_MODEL_CONTROL");
            modelBuilder.Entity<PROCESS_MODEL_CONTROL_NEW>().ToTable("dbo.PM_PROCESS_MODEL_CONTROL_NEW");
            modelBuilder.Entity<PROCESS_MODEL_TESTS>().ToTable("dbo.PROCESS_MODEL_TESTS");
            modelBuilder.Entity<GAVS_SERVICE>().ToTable("dbo.GAVS_SERVICE");
            modelBuilder.Entity<PROCESS_SERVICE_AREA>().ToTable("dbo.PROCESS_SERVICE_AREA");
            modelBuilder.Entity<PROCESS_SERVICE_AREA_NEW>().ToTable("dbo.PROCESS_SERVICE_AREA_NEW");
            modelBuilder.Entity<INNOVATION_SERVICE_MAPPING>().ToTable("dbo.INNOVATION_SERVICE_MAPPING");
            modelBuilder.Entity<SUBPROJECT>().ToTable("dbo.SUBPROJECT");
            modelBuilder.Entity<SUBPROJECT_TASK>().ToTable("dbo.SUBPROJECT_TASK");
            modelBuilder.Entity<PROCESS_MODEL_PROJECT_CONFIG>().ToTable("dbo.PROCESS_MODEL_PROJECT_CONFIG");
            modelBuilder.Entity<AUDIT_EXECUTION_MODEL>().ToTable("dbo.AUDIT_EXECUTION");
            modelBuilder.Entity<EXECUTION_IMPACT_MAPPING>().ToTable("dbo.EXECUTION_IMPACT_MAPPING");
            modelBuilder.Entity<AUDIT_EXECUTION_AUDITEE_DETAILS>().ToTable("dbo.AUDIT_EXECUTION_AUDITEE_DETAILS");
            modelBuilder.Entity<AUDIT_CHECKLIST_PROJECT_EXECUTION>().ToTable("dbo.AUDIT_CHECKLIST_PROJECT_EXECUTION");
            modelBuilder.Entity<GAVS_SERVICE_AREA>().ToTable("dbo.GAVS_SERVICE_AREA");
            modelBuilder.Entity<AUDIT_CHECKLIST_WEIGHT_NC_TABLE>().ToTable("dbo.AUDIT_CHECKLIST_WEIGHT_NC_TABLE");
            modelBuilder.Entity<AUDIT_CHECKLIST_PROJECT_FINDINGS>().ToTable("dbo.AUDIT_CHECKLIST_PROJECT_FINDINGS");
            modelBuilder.Entity<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED>().ToTable("dbo.AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED");
            modelBuilder.Entity<CHECKLIST_EXECUTION_AUDITEE_DETAILS>().ToTable("dbo.CHECKLIST_EXECUTION_AUDITEE_DETAILS");
            modelBuilder.Entity<AUDIT_CHECKLIST_QUESTIONS>().ToTable("dbo.AUDIT_CHECKLIST_QUESTIONS");
            modelBuilder.Entity<PROCESS_MODEL_PROCESS>().ToTable("dbo.PROCESS_MODEL_PROCESS");
            modelBuilder.Entity<AUDIT_CHECKLIST_WEIGHTAGE>().ToTable("dbo.AUDIT_CHECKLIST_WEIGHTAGE");
            modelBuilder.Entity<AUDIT_CHECKLIST_STATUS_MAPPING>().ToTable("dbo.AUDIT_CHECKLIST_STATUS_MAPPING");
            modelBuilder.Entity<AUDIT_FINDING_STAGES>().ToTable("dbo.AUDIT_FINDING_STAGES");
            modelBuilder.Entity<AUDIT_FINDING_STAGES_MAPPING>().ToTable("dbo.AUDIT_FINDING_STAGES_MAPPING");
            modelBuilder.Entity<AUDIT_FINDINGS_CAPA>().ToTable("dbo.AUDIT_FINDINGS_CAPA");
            modelBuilder.Entity<AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING>().ToTable("dbo.AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING");
            modelBuilder.Entity<AUDIT_MANAGEMENT_CAUSES>().ToTable("dbo.AUDIT_MANAGEMENT_CAUSES");
            modelBuilder.Entity<AUDIT_MANAGEMENT_ROOTCAUSES>().ToTable("dbo.AUDIT_MANAGEMENT_ROOTCAUSES");
            modelBuilder.Entity<AUDIT_FINDING_CAPA_REVIEW>().ToTable("dbo.AUDIT_FINDING_CAPA_REVIEW");
            modelBuilder.Entity<AUDIT_FINDING_CAPA_VERIFICATION>().ToTable("dbo.AUDIT_FINDING_CAPA_VERIFICATION");
            modelBuilder.Entity<AUDIT_FINDING_CAPA_IMPLEMENTATION>().ToTable("dbo.AUDIT_FINDING_CAPA_IMPLEMENTATION");
            modelBuilder.Entity<AUDIT_FINDING_CAPA_STATUS_HISTORY>().ToTable("dbo.AUDIT_FINDING_CAPA_STATUS_HISTORY");
            modelBuilder.Entity<PROCESS_MODEL_CLAUSES>().ToTable("dbo.PROCESS_MODEL_CLAUSES");
            modelBuilder.Entity<PROCESS_MODEL_QUESTIONS>().ToTable("dbo.PROCESS_MODEL_QUESTIONS");
            modelBuilder.Entity<AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING>().ToTable("dbo.AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING");
            modelBuilder.Entity<TASK>().ToTable("dbo.TASK");
            modelBuilder.Entity<TASK_CATEGORY>().ToTable("dbo.TASK_CATEGORY");
            modelBuilder.Entity<TASK_RECURRENCE>().ToTable("dbo.TASK_RECURRENCE");
            modelBuilder.Entity<TASK_TYPE>().ToTable("dbo.TASK_TYPE");
            modelBuilder.Entity<EMAIL_LOG>().ToTable("dbo.EMAIL_LOG");
            modelBuilder.Entity<PM_MATURITY_LEVEL>().ToTable("dbo.PM_MATURITY_LEVEL");
            modelBuilder.Entity<PM_MATURITYLEVEL_MAPPING>().ToTable("dbo.PM_MATURITYLEVEL_MAPPING");
            modelBuilder.Entity<AUDIT_CHECKLIST_STATUS_LIST>().ToTable("dbo.AUDIT_CHECKLIST_STATUS_LIST");
            modelBuilder.Entity<AUDIT_CHECKLIST_STATUS_LIST_VALUES>().ToTable("dbo.AUDIT_CHECKLIST_STATUS_LIST_VALUES");
            modelBuilder.Entity<PM_PROCESS_QUESTIONS_MAPPING>().ToTable("dbo.PM_PROCESS_QUESTIONS_MAPPING");
            modelBuilder.Entity<FINDINGSTYPE>().ToTable("dbo.FINDINGSTYPE");
            modelBuilder.Entity<FINDINGSTYPE_VALUES>().ToTable("dbo.FINDINGSTYPE_VALUES");
            modelBuilder.Entity<AUDITEE_ACCEPTANCE>().ToTable("dbo.AUDITEE_ACCEPTANCE");

            modelBuilder.Entity<CUST_REQ_REF>().ToTable("dbo.CUST_REQ_REF");
            modelBuilder.Entity<REQ_CATEGORY>().ToTable("dbo.REQ_CATEGORY");
            modelBuilder.Entity<REQ_CAT_MAPPING>().ToTable("dbo.REQ_CAT_MAPPING");
            modelBuilder.Entity<REQ_LEVEL>().ToTable("dbo.REQ_LEVEL");
            modelBuilder.Entity<REQ_LEVEL_MAPPING>().ToTable("dbo.REQ_LEVEL_MAPPING");
            modelBuilder.Entity<SERVICE_LEVEL_IDENTIFIER_MODEL>().ToTable("dbo.SERVICE_LEVEL_IDENTIFIER");

            modelBuilder.Entity<FMEA_Task_Model>().ToTable("dbo.FMEA_TASKS");

            modelBuilder.Entity<FMEAModel>().ToTable("dbo.FMEA_DATA");
            modelBuilder.Entity<Failure_Mode_Master>().ToTable("dbo.Failure_Mode_Master");
            modelBuilder.Entity<CHECKLIST_SCORES_BY_AUDIT>().ToTable("dbo.CHECKLIST_SCORES_BY_AUDIT");

            modelBuilder.Entity<FMEA_Rating_Factors_Model>().ToTable("dbo.FMEA_RATING_FACTORS");

            modelBuilder.Entity<FMEA_DATA_STAGE2_MODEL>().ToTable("dbo.FMEA_DATA_STAGE2");
            modelBuilder.Entity<CHECKLIST_EXECUTION_CC_DETAILS>().ToTable("dbo.CHECKLIST_EXECUTION_CC_DETAILS");

            modelBuilder.Entity<PROJECT_CONFIGURATION_SETTING>().ToTable("dbo.PROJECT_CONFIGURATION_SETTING");
            modelBuilder.Entity<PROJECT_CONFIGURATION_DATA>().ToTable("dbo.PROJECT_CONFIGURATION_DATA");

            modelBuilder.Entity<AUDIT_CHECKLIST_EXECUTION_DETAILS>().ToTable("dbo.AUDIT_CHECKLIST_EXECUTION_DETAILS");
            modelBuilder.Entity<AUDIT_CHECKLIST_EXECUTION_SUMMARY>().ToTable("dbo.AUDIT_CHECKLIST_EXECUTION_SUMMARY");
            modelBuilder.Entity<IDEA>().ToTable("dbo.IDEA");
            modelBuilder.Entity<IDEA_STATUS>().ToTable("dbo.IDEA_STATUS");
            modelBuilder.Entity<IDEA_IMPROVEMENT_TYPE>().ToTable("dbo.IDEA_IMPROVEMENT_TYPE");
            modelBuilder.Entity<POTENTIAL_SOLUTION_CATEGORY>().ToTable("dbo.POTENTIAL_SOLUTION_CATEGORY");
            modelBuilder.Entity<BENEFIT_DETAILS_QUANTITATIVE>().ToTable("dbo.BENEFIT_DETAILS_QUANTITATIVE");
            modelBuilder.Entity<IDEA_BENEFIT_SUMMARY>().ToTable("dbo.IDEA_BENEFIT_SUMMARY");
            modelBuilder.Entity<IDEA_CATEGORY_UOM_MAPPING>().ToTable("dbo.IDEA_CATEGORY_UOM_MAPPING");
            modelBuilder.Entity<UOM>().ToTable("dbo.UOM");
            modelBuilder.Entity<IDEA_CATEGORY>().ToTable("dbo.IDEA_CATEGORY");
            modelBuilder.Entity<BENEFIT_DETAILS_QUALITATIVE>().ToTable("dbo.BENEFIT_DETAILS_QUALITATIVE");
            modelBuilder.Entity<IDEA_IMPLEMENTATION_PLAN>().ToTable("dbo.IDEA_IMPLEMENTATION_PLAN");
            modelBuilder.Entity<IDEA_STAGE_STATUS>().ToTable("dbo.IDEA_STAGE_STATUS");
            modelBuilder.Entity<PROJECT_FAILURES_MAPPING>().ToTable("dbo.PROJECT_FAILURES_MAPPING");
            modelBuilder.Entity<FAILURE_ASSESSMENT>().ToTable("dbo.FAILURE_ASSESSMENT");
            modelBuilder.Entity<CONTACT_ROLES>().ToTable("dbo.CONTACT_ROLES"); 
            modelBuilder.Entity<AUDIT_CHECKLIST_WEIGHTAGE_SCORES>().ToTable("dbo.AUDIT_CHECKLIST_WEIGHTAGE_SCORES");
            modelBuilder.Entity<PORTFOLIO_PRODUCT>().ToTable("dbo.PORTFOLIO_PRODUCTS");
            modelBuilder.Entity<PRODUCT_MODE_MAPPING>().ToTable("dbo.PRODUCT_MODE_MAPPING");
            modelBuilder.Entity<MODE_KPI_MAPPING>().ToTable("dbo.MODE_KPI_MAPPING");
            modelBuilder.Entity<REFERENCE_MASTER>().ToTable("dbo.REFERENCE_MASTER");

            modelBuilder.Entity<PRODUCT_TIER>().ToTable("dbo.PRODUCT_TIER"); 
            modelBuilder.Entity<TIER_LEVEL_MATRIX>().ToTable("dbo.TIER_LEVEL_MATRIX");
            modelBuilder.Entity<PRODUCTS_SERVICE_AREA>().ToTable("dbo.PRODUCTS_SERVICE_AREA");
            modelBuilder.Entity<PRODUCTS_SLA_CATEGORY>().ToTable("dbo.PRODUCTS_SLA_CATEGORY");
            modelBuilder.Entity<PRODUCTS_SERVICE_LEVEL_MODE>().ToTable("dbo.PRODUCTS_SERVICE_LEVEL_MODE");
            modelBuilder.Entity<PRODUCTS_SERVICE_LEVEL_TYPE>().ToTable("dbo.PRODUCTS_SERVICE_LEVEL_TYPE");
            modelBuilder.Entity<PRODUCT_SERVICE_LEVEL_METRICS>().ToTable("dbo.PRODUCT_SERVICE_LEVEL_METRICS");

            modelBuilder.Entity<BASE_MEASURE>().ToTable("dbo.BASE_MEASURE");
            modelBuilder.Entity<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG>().ToTable("dbo.SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG");
            modelBuilder.Entity<KPI_BASE_MEASURE_VALUE>().ToTable("dbo.KPI_BASE_MEASURE_VALUE");
            modelBuilder.Entity<KPI2PRODUCT_SERVICE_LEVEL_METRICS>().ToTable("dbo.KPI2PRODUCT_SERVICE_LEVEL_METRICS");
            modelBuilder.Entity<PRODUCT_RESPONSIBLE>().ToTable("dbo.PRODUCT_RESPONSIBLE");
            modelBuilder.Entity<PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE>().ToTable("dbo.PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE");
            modelBuilder.Entity<SUPPORT_VALUE_TYPE>().ToTable("dbo.SUPPORT_VALUE_TYPE");
            modelBuilder.Entity<SUPPORT_VALUE_REQUEST>().ToTable("dbo.SUPPORT_VALUE_REQUEST");
            modelBuilder.Entity<BASE_MEASURE_FORMULA_TYPE>().ToTable("dbo.BASE_MEASURE_FORMULA_TYPE");

            modelBuilder.Entity<CUSTOMER_CAPA_APPROVAL>().ToTable("dbo.CUSTOMER_CAPA_APPROVAL");
            modelBuilder.Entity<CUSTOMER_CAPA_APPROVAL_STATUS>().ToTable("dbo.CUSTOMER_CAPA_APPROVAL_STATUS");

            modelBuilder.Entity<SLA_REJECTION>().ToTable("dbo.SLA_REJECTION");
            modelBuilder.Entity<SLA_REJECTION_KPI_DETAILS>().ToTable("dbo.SLA_REJECTION_KPI_DETAILS");
            modelBuilder.Entity<SLA_REJECTION_STATUS_HISTORY>().ToTable("dbo.SLA_REJECTION_STATUS_HISTORY");
            modelBuilder.Entity<SLA_REJECTION_STATUS>().ToTable("dbo.SLA_REJECTION_STATUS");
            modelBuilder.Entity<APPRECIATION>().ToTable("dbo.APPRECIATION");
            modelBuilder.Entity<ACCESS_REQUEST>().ToTable("dbo.ACCESS_REQUEST");
            modelBuilder.Entity<PROJECT_SCOPE_VALUES>().ToTable("dbo.PROJECT_SCOPE_VALUES");
            modelBuilder.Entity<INTEGRATION_REQUEST_DATA>().ToTable("dbo.INTEGRATION_REQUEST_DATA");
            modelBuilder.Entity<DROPDOWN_OPTIONS>().ToTable("dbo.DROPDOWN_OPTIONS");

            modelBuilder.Entity<ITOPS_DOMAIN>().ToTable("dbo.ITOPS_DOMAIN");
            modelBuilder.Entity<ITOPS_CATEGORY>().ToTable("dbo.ITOPS_CATEGORY");
            modelBuilder.Entity<ITOPS_PARAMETER>().ToTable("dbo.ITOPS_PARAMETER");
            modelBuilder.Entity<ITOPS_ASSESSMENT>().ToTable("dbo.ITOPS_ASSESSMENT");
            modelBuilder.Entity<ITOPS_SCORE>().ToTable("dbo.ITOPS_SCORE");
            modelBuilder.Entity<ITOPS_EVIDENCE>().ToTable("dbo.ITOPS_EVIDENCE");
            modelBuilder.Entity<ITOPS_FINDING>().ToTable("dbo.ITOPS_FINDING");
            modelBuilder.Entity<ITOPS_FINDING_ACTIVITY>().ToTable("dbo.ITOPS_FINDING_ACTIVITY");
            modelBuilder.Entity<ITOPS_NOTIFICATION>().ToTable("dbo.ITOPS_NOTIFICATION");
            modelBuilder.Entity<ITOPS_REPORT_SP_DETAILS>().ToTable("dbo.ITOPS_REPORT_SP_DETAILS");
            modelBuilder.Entity<ITOPS_REPORT_PARAMS>().ToTable("dbo.ITOPS_REPORT_PARAMS");
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();
        }
        public virtual DbSet<APP_ACCESS_CONTROLS> APP_ACCESS_CONTROLS { get; set; }
        public virtual DbSet<APP_ACCESS_CONTROLS_DETAILS> APP_ACCESS_CONTROLS_DETAILS { get; set; }
        public virtual DbSet<APP_CONTROL_FEATURES> APP_CONTROL_FEATURES { get; set; }
        public virtual DbSet<APP_CONTROLS> APP_CONTROLS { get; set; }
        public virtual DbSet<AUDIT_SCHEDULE> AUDIT_SCHEDULE { get; set; }
        public virtual DbSet<AUDIT_SCHEDULE_REF> AUDIT_SCHEDULE_REF { get; set; }
        public virtual DbSet<CONTACTS> CONTACTS { get; set; }
        public virtual DbSet<CRISP_CATEGORY> CRISP_CATEGORY { get; set; }
        public virtual DbSet<CRISP_CRITERIA> CRISP_CRITERIA { get; set; }
        public virtual DbSet<CRISP_PROJECT_CATEGORY> CRISP_PROJECT_CATEGORY { get; set; }
        public virtual DbSet<CRISP_PROJECT_CRITERIA> CRISP_PROJECT_CRITERIA { get; set; }
        public virtual DbSet<CRISP_PROJECT_VALIDATIONS> CRISP_PROJECT_VALIDATIONS { get; set; }
        public virtual DbSet<CRISP_SCORES_CATEGORY> CRISP_SCORES_CATEGORY { get; set; }
        public virtual DbSet<CRISP_SCORES_CRITERIA> CRISP_SCORES_CRITERIA { get; set; }
        public virtual DbSet<CRISP_SCORES_PROJECT> CRISP_SCORES_PROJECT { get; set; }
        public virtual DbSet<CRISP_SCORES_VALIDATIONS> CRISP_SCORES_VALIDATIONS { get; set; }
        public virtual DbSet<CRISP_VALIDATIONS> CRISP_VALIDATIONS { get; set; }
        public virtual DbSet<CSS_BATCHES> CSS_BATCHES { get; set; }
        public virtual DbSet<CSS_BATCH_CUSTOMERS> CSS_BATCH_CUSTOMERS { get; set; }
        public virtual DbSet<CSS_BATCH_MONTHLY> CSS_BATCH_MONTHLY { get; set; }
        public virtual DbSet<CSS_BATCH_CUSTOMER_MONTHLY> CSS_BATCH_CUSTOMER_MONTHLY { get; set; }
        public virtual DbSet<CSS_QUESTION_REPLIES> CSS_QUESTION_REPLIES { get; set; }
        public virtual DbSet<CSS_QUESTION_MASTER> CSS_QUESTION_MASTER { get; set; }
        public virtual DbSet<CSS_SURVEY_ITERATION> CSS_SURVEY_ITERATION { get; set; }
        public virtual DbSet<CUSTOMER_FEEDBACK> CUSTOMER_FEEDBACK { get; set; }
        public virtual DbSet<CUSTOMER_MOM_DETAILS> CUSTOMER_MOM_DETAILS { get; set; }
        public virtual DbSet<CUSTOMER_PROJECTS> CUSTOMER_PROJECTS { get; set; }
        public virtual DbSet<CUSTOMER_USERS> CUSTOMER_USERS { get; set; }
        public virtual DbSet<CUSTOMER_REPORTS> CUSTOMER_REPORTS { get; set; }
        public virtual DbSet<DASHBOARD_DETAILS> DASHBOARD_DETAILS { get; set; }
        public virtual DbSet<ENGAGEMENT_OVERVIEW> ENGAGEMENT_OVERVIEW { get; set; }
        public virtual DbSet<FILTER_PREFERENCE> FILTER_PREFERENCE { get; set; }
        public virtual DbSet<GLOBAL_KPI_CATEGORY> GLOBAL_KPI_CATEGORY { get; set; }
        public virtual DbSet<GLOBAL_PERSPECTIVE> GLOBAL_PERSPECTIVE { get; set; }
        public virtual DbSet<GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING> GLOBAL_PERSPECTIVE_KPI_CATEGORY_MAPPING { get; set; }
        public virtual DbSet<SQA_REPORT_FILES> SQA_REPORT_FILES { get; set; }
        public virtual DbSet<HIGHLIGHTS> HIGHLIGHTS { get; set; }
        public virtual DbSet<KPI> KPI { get; set; }
        public virtual DbSet<KPI_DETAILS> KPI_DETAILS { get; set; }
        public virtual DbSet<KPI_TARGETS> KPI_TARGETS { get; set; }
        public virtual DbSet<PORTFOLIO> PORTFOLIO { get; set; }

        public virtual DbSet<PORTFOLIO_PROJECT> PORTFOLIO_PROJECT { get; set; }

        public virtual DbSet<PORTFOLIOS> PORTFOLIOS { get; set; }
        public virtual DbSet<PORTFOLIOS_OWNERS> PORTFOLIOS_OWNERS { get; set; }
        public virtual DbSet<PORTFOLIOS_OWNERS_PROJECT> PORTFOLIOS_OWNERS_PROJECT { get; set; }
        public virtual DbSet<PROCESS> PROCESS { get; set; }
        public virtual DbSet<PROCESS_MODEL_TESTS_NEW> PROCESS_MODEL_TESTS_NEW { get; set; }
        public virtual DbSet<PROCESS_AREA> PROCESS_AREA { get; set; }
        public virtual DbSet<PROCESS_OBJECTIVE_MAPPING> PROCESS_OBJECTIVE_MAPPING { get; set; }
        public virtual DbSet<PROJECT_DELIVERY> PROJECT_DELIVERY { get; set; }
        public virtual DbSet<PROJECT_INNOVATION> PROJECT_INNOVATION { get; set; }
        public virtual DbSet<PROJECT_ISSUE> PROJECT_ISSUE { get; set; }
        public virtual DbSet<PROJECT_LESSON_LEARNT> PROJECT_LESSON_LEARNT { get; set; }
        public virtual DbSet<PROJECT_PEOPLE> PROJECT_PEOPLE { get; set; }
        public virtual DbSet<PROJECT_PROCESS> PROJECT_PROCESS { get; set; }
        public virtual DbSet<PROJECT_RISK> PROJECT_RISK { get; set; }
        
        public virtual DbSet<PROJECT_SCOPE> PROJECT_SCOPE { get; set; }
        public virtual DbSet<PROJECT_SUCCESS> PROJECT_SUCCESS { get; set; }
        public virtual DbSet<PROJECT_VALUEADDS> PROJECT_VALUEADDS { get; set; }
        public virtual DbSet<PROJECT_ACTIONITEM> PROJECT_ACTIONITEM { get; set; }
        public virtual DbSet<PROJECT_RAGS> PROJECT_RAGS { get; set; }

        public virtual DbSet<NOTES> NOTES { get; set; }
        public virtual DbSet<PROJECT_CSAT_DATA> PROJECT_CSAT_DATA { get; set; }
        public virtual DbSet<SQA_CHART_FILTER> SQA_CHART_FILTER { get; set; }
        public virtual DbSet<SQA_CHART_GROUPS> SQA_CHART_GROUPS { get; set; }
        public virtual DbSet<SQA_DATA_REPOSITORY> SQA_DATA_REPOSITORY { get; set; }
        public virtual DbSet<SQA_PROJECT_CHART_PARAMS> SQA_PROJECT_CHART_PARAMS { get; set; }
        public virtual DbSet<SQA_PROJECT_REPORTS> SQA_PROJECT_REPORTS { get; set; }
        public virtual DbSet<SQA_PROJECT_REPORTS_STRUCT> SQA_PROJECT_REPORTS_STRUCT { get; set; }
        public virtual DbSet<PROJECT_BEST_PRACTICES> PROJECT_BEST_PRACTICES { get; set; }
        public virtual DbSet<GAVS_SERVICE> GAVS_SERVICE { get; set; }
        public virtual DbSet<INNOVATION_SERVICE_MAPPING> INNOVATION_SERVICE_MAPPING { get; set; }
        public virtual DbSet<SUBPROJECT> SUBPROJECT { get; set; }
        public virtual DbSet<SUBPROJECT_TASK> SUBPROJECT_TASK { get; set; }
        public virtual DbSet<PROCESS_MODEL> PROCESS_MODEL { get; set; }
        public virtual DbSet<PROCESS_MODEL_OBJECTIVES> PROCESS_MODEL_OBJECTIVES { get; set; }
        public virtual DbSet<PROCESS_MODEL_PROCESS_MAPPING> PROCESS_MODEL_PROCESS_MAPPING { get; set; }
        public virtual DbSet<PROCESS_SERVICE_AREA_PROJECT_MAPPING> PROCESS_SERVICE_AREA_PROJECT_MAPPING { get; set; }
        public virtual DbSet<PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING> PM_PROJECT_SERVICE_AREA_PROCESS_MAPPING { get; set; }
        public virtual DbSet<PM_PROCESS_CHECKLIST_MAPPING> PM_PROCESS_CHECKLIST_MAPPING { get; set; }
        public virtual DbSet<PM_CHECKLIST> PM_CHECKLIST { get; set; }
        public virtual DbSet<PM_CHECKLIST_QUESTIONS> PM_CHECKLIST_QUESTIONS { get; set; }
        public virtual DbSet<PROCESS_SERVICE_AREA_MAPPING> PROCESS_SERVICE_AREA_MAPPING { get; set; }
        public virtual DbSet<PROCESS_MODEL_RISKS> PROCESS_MODEL_RISKS { get; set; }
        public virtual DbSet<PROCESS_MODEL_CONTROL> PROCESS_MODEL_CONTROL { get; set; }
        public virtual DbSet<PROCESS_MODEL_TESTS> PROCESS_MODEL_TESTS { get; set; }
        public virtual DbSet<PROCESS_SERVICE_AREA_NEW> PROCESS_SERVICE_AREA_NEW { get; set; }
        public virtual DbSet<AUDIT_EXECUTION_MODEL> AUDIT_EXECUTION_MODEL { get; set; }
        public virtual DbSet<AUDIT_EXECUTION_AUDITEE_DETAILS> AUDIT_EXECUTION_AUDITEE_DETAILS { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_PROJECT_EXECUTION> AUDIT_CHECKLIST_PROJECT_EXECUTION { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_WEIGHT_NC_TABLE> AUDIT_CHECKLIST_WEIGHT_NC_TABLE { get; set; }
        public virtual DbSet<GAVS_SERVICE_AREA> GAVS_SERVICE_AREA { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_PROJECT_FINDINGS> AUDIT_CHECKLIST_PROJECT_FINDINGS { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED> AUDIT_CHECKLIST_PROJECT_SAMPLES_AUDITED { get; set; }
        public virtual DbSet<CHECKLIST_EXECUTION_AUDITEE_DETAILS> CHECKLIST_EXECUTION_AUDITEE_DETAILS { get; set; }
        public virtual DbSet<PROCESS_MODEL_PROCESS> PROCESS_MODEL_PROCESS { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_WEIGHTAGE> AUDIT_CHECKLIST_WEIGHTAGE { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_STATUS_MAPPING> AUDIT_CHECKLIST_STATUS_MAPPING { get; set; }
        public virtual DbSet<AUDIT_FINDING_STAGES> AUDIT_FINDING_STAGES { get; set; }
        public virtual DbSet<AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING> AUDIT_FINIDINGS_CAPA_CAUSE_MAPPING { get; set; }
        public virtual DbSet<AUDIT_FINDINGS_CAPA> AUDIT_FINDINGS_CAPA { get; set; }
        public virtual DbSet<AUDIT_FINDING_STAGES_MAPPING> AUDIT_FINDING_STAGES_MAPPING { get; set; }
        public virtual DbSet<AUDIT_MANAGEMENT_CAUSES> AUDIT_MANAGEMENT_CAUSES { get; set; }
        public virtual DbSet<AUDIT_MANAGEMENT_ROOTCAUSES> AUDIT_MANAGEMENT_ROOTCAUSES { get; set; }
        public virtual DbSet<AUDIT_FINDING_CAPA_REVIEW> AUDIT_FINDING_CAPA_REVIEW { get; set; }
        public virtual DbSet<AUDIT_FINDING_CAPA_IMPLEMENTATION> AUDIT_FINDING_CAPA_IMPLEMENTATION { get; set; }
        public virtual DbSet<AUDIT_FINDING_CAPA_VERIFICATION> AUDIT_FINDING_CAPA_VERIFICATION { get; set; }
        public virtual DbSet<AUDIT_FINDING_CAPA_STATUS_HISTORY> AUDIT_FINDING_CAPA_STATUS_HISTORY { get; set; }
        public virtual DbSet<PROCESS_MODEL_CLAUSES> PROCESS_MODEL_CLAUSES { get; set; }
        public virtual DbSet<PROCESS_MODEL_QUESTIONS> PROCESS_MODEL_QUESTIONS { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING> AUDIT_CHECKLIST_QUESTION_CLAUSES_MAPPING { get; set; }
        public virtual DbSet<TASK> TASK { get; set; }
        public virtual DbSet<TASK_CATEGORY> TASK_CATEGORY { get; set; }
        public virtual DbSet<TASK_RECURRENCE> TASK_RECURRENCE { get; set; }
        public virtual DbSet<TASK_TYPE> TASK_TYPE { get; set; }
        public virtual DbSet<EMAIL_LOG> EMAIL_LOG { get; set; }
        public virtual DbSet<PM_MATURITY_LEVEL> PM_MATURITY_LEVEL { get; set; }
        public virtual DbSet<PM_MATURITYLEVEL_MAPPING> PM_MATURITYLEVEL_MAPPING { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_STATUS_LIST> AUDIT_CHECKLIST_STATUS_LIST { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_STATUS_LIST_VALUES> AUDIT_CHECKLIST_STATUS_LIST_VALUES { get; set; }
        public virtual DbSet<PM_PROCESS_QUESTIONS_MAPPING> PM_PROCESS_QUESTIONS_MAPPING { get; set; }
        public virtual DbSet<FINDINGSTYPE> FINDINGSTYPE { get; set; }
        public virtual DbSet<FINDINGSTYPE_VALUES> FINDINGSTYPE_VALUES { get; set; }
        public virtual DbSet<AUDITEE_ACCEPTANCE> AUDITEE_ACCEPTANCE { get; set; }

        public virtual DbSet<CUST_REQ_REF> CUST_REQ_REF { get; set; }
        public virtual DbSet<CUST_REQ_STATUS> CUST_REQ_STATUS { get; set; }
        public virtual DbSet<CUST_REQ_STAGE_STATUS> CUST_REQ_STAGE_STATUS { get; set; }
        public virtual DbSet<REQ_CATEGORY> REQ_CATEGORY { get; set; }
        public virtual DbSet<REQ_CAT_MAPPING> REQ_CAT_MAPPING { get; set; }
        public virtual DbSet<REQ_LEVEL> REQ_LEVEL { get; set; }
        public virtual DbSet<REQ_LEVEL_MAPPING> REQ_LEVEL_MAPPING { get; set; }

        public virtual DbSet<SERVICE_LEVEL_IDENTIFIER_MODEL> SERVICE_LEVEL_IDENTIFIER_MODEL { get; set; }

        public virtual DbSet<FMEA_Task_Model> FMEA_Task_Model { get; set; }

        public virtual DbSet<FMEAModel> FMEAModel { get; set; }
        public virtual DbSet<Failure_Mode_Master> Failure_Mode_Master { get; set; }
        public virtual DbSet<CHECKLIST_SCORES_BY_AUDIT> CHECKLIST_SCORES_BY_AUDIT { get; set; }

        public virtual DbSet<FMEA_Rating_Factors_Model> FMEA_Rating_Factors_Model { get; set; }

        public virtual DbSet<FMEA_DATA_STAGE2_MODEL> FMEA_DATA_STAGE2_MODEL { get; set; }

        public virtual DbSet<TIMEFORMAT_CONFIG> TIMEFORMAT_CONFIG { get; set; }
        public virtual DbSet<CHECKLIST_EXECUTION_CC_DETAILS> CHECKLIST_EXECUTION_CC_DETAILS { get; set; }

        public virtual DbSet<PROJECT_CONFIGURATION_SETTING> PROJECT_CONFIGURATION_SETTING { get; set; }
        public virtual DbSet<PROJECT_CONFIGURATION_DATA> PROJECT_CONFIGURATION_DATA { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_EXECUTION_DETAILS> AUDIT_CHECKLIST_EXECUTION_DETAILS { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_EXECUTION_SUMMARY> AUDIT_CHECKLIST_EXECUTION_SUMMARY { get; set; }
        public virtual DbSet<IDEA> IDEA { get; set; }
        public virtual DbSet<IDEA_STATUS> IDEA_STATUS { get; set; }
        public virtual DbSet<IDEA_IMPROVEMENT_TYPE> IDEA_IMPROVEMENT_TYPE { get; set; }
        public virtual DbSet<POTENTIAL_SOLUTION_CATEGORY> POTENTIAL_SOLUTION_CATEGORY { get; set; }
        public virtual DbSet<BENEFIT_DETAILS_QUANTITATIVE> BENEFIT_DETAILS_QUANTITATIVE { get; set; }
        public virtual DbSet<IDEA_BENEFIT_SUMMARY> IDEA_BENEFIT_SUMMARY { get; set; }
        public virtual DbSet<IDEA_CATEGORY_UOM_MAPPING> IDEA_CATEGORY_UOM_MAPPING { get; set; }
        public virtual DbSet<UOM> UOMs { get; set; }
        public virtual DbSet<IDEA_CATEGORY> IDEA_CATEGORY { get; set; }
        public virtual DbSet<BENEFIT_DETAILS_QUALITATIVE> BENEFIT_DETAILS_QUALITATIVE { get; set; }
        public virtual DbSet<IDEA_STAGE_STATUS> IDEA_STAGE_STATUS { get; set; }
        public virtual DbSet<PROJECT_FAILURES_MAPPING> PROJECT_FAILURES_MAPPING { get; set; }
        public virtual DbSet<FAILURE_ASSESSMENT> FAILURE_ASSESSMENT { get; set; }
        public virtual DbSet<CONTACT_ROLES> CONTACT_ROLES { get; set; }
        public virtual DbSet<AUDIT_CHECKLIST_WEIGHTAGE_SCORES> AUDIT_CHECKLIST_WEIGHTAGE_SCORES { get; set; }
        public virtual DbSet<PORTFOLIO_PRODUCT> PORTFOLIO_PRODUCTS { get; set; }
        public virtual DbSet<PRODUCT_MODE_MAPPING> PRODUCT_MODE_MAPPING { get; set; }
        public virtual DbSet<MODE_KPI_MAPPING> MODE_KPI_MAPPING { get; set; }

        public virtual DbSet<PRODUCT_TIER> PRODUCT_TIER { get; set; }

        public virtual DbSet<TIER_LEVEL_MATRIX> TIER_LEVEL_MATRIX { get; set; }
        public virtual DbSet<PRODUCTS_SERVICE_AREA> PRODUCTS_SERVICE_AREA { get; set; }
        public virtual DbSet<PRODUCTS_SLA_CATEGORY> PRODUCTS_SLA_CATEGORY { get; set; }

        public virtual DbSet<PRODUCTS_SERVICE_LEVEL_MODE> PRODUCTS_SERVICE_LEVEL_MODE { get; set; }
        public virtual DbSet<PRODUCTS_SERVICE_LEVEL_TYPE> PRODUCTS_SERVICE_LEVEL_TYPE { get; set; }
        public virtual DbSet<PRODUCT_SERVICE_LEVEL_METRICS> PRODUCT_SERVICE_LEVEL_METRICS { get; set; }
        public virtual DbSet<REFERENCE_MASTER> REFERENCE_MASTER { get; set; }

        public virtual DbSet<BASE_MEASURE> BASE_MEASURE { get; set; }
        public virtual DbSet<SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG> SERVICE_LEVEL_MEASUREMENT_2_BASE_MEASURE_CONFIG { get; set; }
        public virtual DbSet<KPI_BASE_MEASURE_VALUE> KPI_BASE_MEASURE_VALUE { get; set; }

        public virtual DbSet<KPI2PRODUCT_SERVICE_LEVEL_METRICS> KPI2PRODUCT_SERVICE_LEVEL_METRICS { get; set; }
        public virtual DbSet<PRODUCT_RESPONSIBLE> PRODUCT_RESPONSIBLE { get; set; }

        public virtual DbSet<PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE> PRODUCT_RESPONSIBLE_MANAGEMENT_TYPE { get; set; }

        public virtual DbSet<SUPPORT_VALUE_TYPE> SUPPORT_VALUE_TYPE { get; set; }
        public virtual DbSet<SUPPORT_VALUE_REQUEST> SUPPORT_VALUE_REQUEST { get; set; }
        public virtual DbSet<BASE_MEASURE_FORMULA_TYPE> BASE_MEASURE_FORMULA_TYPE { get; set; }

        public virtual DbSet<SLA_REJECTION> SLA_REJECTION { get; set; }
        public virtual DbSet<SLA_REJECTION_KPI_DETAILS> SLA_REJECTION_KPI_DETAILS { get; set; }
        public virtual DbSet<SLA_REJECTION_STATUS_HISTORY> SLA_REJECTION_STATUS_HISTORY { get; set; }
        public virtual DbSet<SLA_REJECTION_STATUS> SLA_REJECTION_STATUS { get; set; }
        public virtual DbSet<TASK_STATUS_HISTORY> TASK_STATUS_HISTORY { get; set; }
        public virtual DbSet<APPRECIATION> APPRECIATION { get; set; }
        public virtual DbSet<CSS_QUESTION_MODELS> CSS_QUESTION_MODELS { get; set; }

        public virtual DbSet<ACCESS_REQUEST> ACCESS_REQUEST { get; set; }

        public virtual DbSet<PROJECT_SCOPE_VALUES> PROJECT_SCOPE_VALUES { get; set; }

        public virtual DbSet<INTEGRATION_REQUEST_DATA> INTEGRATION_REQUEST_DATA { get; set; }

        public virtual DbSet<DROPDOWN_OPTIONS> DROPDOWN_OPTIONS { get; set; }

        public virtual DbSet<ITOPS_DOMAIN> ITOPS_DOMAIN { get; set; }
        public virtual DbSet<ITOPS_CATEGORY> ITOPS_CATEGORY { get; set; }
        public virtual DbSet<ITOPS_PARAMETER> ITOPS_PARAMETER { get; set; }
        public virtual DbSet<ITOPS_ASSESSMENT> ITOPS_ASSESSMENT { get; set; }
        public virtual DbSet<ITOPS_SCORE> ITOPS_SCORE { get; set; }
        public virtual DbSet<ITOPS_EVIDENCE> ITOPS_EVIDENCE { get; set; }
        public virtual DbSet<ITOPS_FINDING> ITOPS_FINDING { get; set; }
        public virtual DbSet<ITOPS_FINDING_ACTIVITY> ITOPS_FINDING_ACTIVITY { get; set; }
        public virtual DbSet<ITOPS_NOTIFICATION> ITOPS_NOTIFICATION { get; set; }
        public virtual DbSet<ITOPS_REPORT_SP_DETAILS> ITOPS_REPORT_SP_DETAILS { get; set; }
        public virtual DbSet<ITOPS_REPORT_PARAMS> ITOPS_REPORT_PARAMS { get; set; }

    }
}