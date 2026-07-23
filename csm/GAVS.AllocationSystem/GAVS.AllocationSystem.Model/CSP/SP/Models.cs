   
 


using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;

namespace GAVS.AllocationSystem.Model.CSP.SP
{
    public partial class RiskDashboardInputHolder  
    {
        public string CUSTOMER_IDS {get; set;}
        public DateTime? START_DATE {get; set;}
        public DateTime? END_DATE {get; set;}
        public string RISK_STATUS {get; set;}
        public string PROJECT_IDS {get; set;}
        public string BUSINESS_UNITS {get; set;}
    }

    public partial class GetOverallRiskForRiskDashboard  
    {
        public int ID {get; set;}
        public string PROJ_ID {get; set;}
        public string CUST_ID {get; set;}
        public string CUST_NM {get; set;}
        public string PROJ_NM {get; set;}
        public string BUSINESS_UNIT {get; set;}
        public string DESCRIPTION {get; set;}
        public int PROBABILITY_SCALE {get; set;}
        public int IMPACT_SCALE {get; set;}
        public string IMPACT {get; set;}
        public string OWNER {get; set;}
        public string AREA {get; set;}
        public string IDENTIFIED_BY {get; set;}
        public DateTime? IDENTIFIED_DATE {get; set;}
        public string RISK_TREATMENT_STRATEGY {get; set;}
        public DateTime? TARGET_DATE {get; set;}
        public string STATUS {get; set;}
        public string ACTION_TAKEN {get; set;}
        public string LINK {get; set;}
        public string RISK_LEVEL {get; set;}
    }

    public partial class PlannedAudits  
    {
        public int ID {get; set;}
        public string DESCRIPTION {get; set;}
        public string PRIORITY {get; set;}
        public DateTime? SCHEDULED_START_DATE {get; set;}
        public DateTime? DUE_DATE {get; set;}
        public DateTime? ACTUAL_START_DATE {get; set;}
        public DateTime? ACTUAL_END_DATE {get; set;}
        public decimal? SCHEDULED_DURATION {get; set;}
        public decimal? ACTUAL_DURATION {get; set;}
        public string STATUS {get; set;}
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public string AUDITOR_EMP_ID {get; set;}
        public bool? ISSUBMITTED {get; set;}
        public string KEY {get; set;}
        public string VALUE {get; set;}
        public decimal? PROCESS_COMPLIANCE_AS_ON_AUDIT_DATE {get; set;}
        public decimal? CURRENT_PROCESS_COMPLIANCE {get; set;}
        public DateTime? ACTUAL_AUDIT_START_DATE {get; set;}
        public DateTime? ACTUAL_AUDIT_END_DATE {get; set;}
    }

    public partial class PlannedAuditsConsolidated  
    {
        public int ID {get; set;}
        public string DESCRIPTION {get; set;}
        public string PRIORITY {get; set;}
        public DateTime? SCHEDULED_START_DATE {get; set;}
        public DateTime? DUE_DATE {get; set;}
        public DateTime? ACTUAL_START_DATE {get; set;}
        public DateTime? ACTUAL_END_DATE {get; set;}
        public decimal? SCHEDULED_DURATION {get; set;}
        public decimal? ACTUAL_DURATION {get; set;}
        public string STATUS {get; set;}
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public string AUDITOR_ID {get; set;}
        public List<string> AUDITESS_ID {get; set;}
        public List<string> SERVICE_AREA_ID {get; set;}
        public DateTime? ACTUAL_AUDIT_START_DATE {get; set;}
        public DateTime? ACTUAL_AUDIT_END_DATE {get; set;}
        public  string EMP_ID {get; set;}
        public string ASSESSMENT_STATUS {get; set;}
        public string COMMENTS {get; set;}
        public decimal? PROCESS_COMPLIANCE_AS_ON_AUDIT_DATE {get; set;}
        public decimal? CURRENT_PROCESS_COMPLIANCE {get; set;}
        public bool IS_RETAIN_CAPA {get; set;}
        public bool ISSUBMITTED {get; set;}
    }

    public partial class PlannedAuditData  
    {
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public int ASSESSMENT_ID {get; set;}
        public string EMP_ID {get; set;}
        public string STATUS {get; set;}
        public string COMMENTS {get; set;}
    }

    public partial class TASK_AUDIT_VM  
    {
        public TASK Task {get; set;}
        public AUDIT_SCHEDULE Audit {get; set;}
        public string TASK_CATEGORY_TITLE {get; set;}
        public string CUST_NM {get; set;}
        public string PROJ_NM {get; set;}
        public List<string> PROJ_IDS {get; set;}
        public bool isAudit {get; set;}
        public string CSS_SCORE {get; set;}
        public string CSS_URL {get; set;}
        public bool IS_SUBMIT {get; set;}
    }

    public partial class AuditTaskInputs  
    {
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public string PROJ_NM {get; set;}
        public string PROJ_PM_ID {get; set;}
        public int CATEGORY_ID {get; set;}
        public string CREATED_BY {get; set;}
        public string AUDITOR_EMP_ID {get; set;}
        public string TASK_DESCRIPTION {get; set;}
        public DateTime SCHEDULED_START_DATE {get; set;}
        public DateTime DUE_DATE {get; set;}
        public string CSS_SCORE {get; set;}
        public string CSS_URL {get; set;}
    }

    public partial class IdeaViewModel  
    {
        public int ID {get; set;}
        public string PROJECT_NAME {get; set;}
        public string PROJ_ID {get; set;}
        public string STATUS {get; set;}
        public int IDEA_STATUS_ID {get; set;}
        public string DESCRIPTION {get; set;}
        public string POTENTIAL_SOLUTION_DESCRIPTION {get; set;}
        public DateTime? IDENTIFIED_DATE {get; set;}
        public DateTime? TARGET_DATE {get; set;}
        public string RESPONSIBLE {get; set;}
        public string Identified_By {get; set;}
        public string TYPE {get; set;}
        public string BENEFIT_TYPE {get; set;}
    }

    public partial class IdeaStatusUpdate  
    {
        public int[] IdeaId {get; set;}
        public int Status {get; set;}
    }

    public partial class RiskRepository  
    {
        public string SERVICE_TOWER_TITLE {get; set;}
        public string DESCRIPTION {get; set;}
        public string IMPACT {get; set;}
        public int PROBABILITY_SCALE {get; set;}
        public int IMPACT_SCALE {get; set;}
        public string RISK_TREATMENT_STRATEGY {get; set;}
        public int RISK_REPOSITORY_ID {get; set;}
        public int SERVICE_TOWER_ID {get; set;}
        public string THREATS {get; set;}
        public string VULNERABILITIES {get; set;}
    }

    public partial class FolderData  
    {
        public string FolderName {get; set;}
        public int ParentFolderId {get; set;}
        public List<FolderData> FolderList {get; set;}
        public List<FileData> FileList {get; set;}
    }

    public partial class FileData  
    {
        public string FileName {get; set;}
        public int FolderId {get; set;}
        public string FilePath {get; set;}
        public string FileExtension {get; set;}
        public string FileType {get; set;}
    }

    public partial class ProcessModelReference  
    {
        public string PROCESS_MODEL_NAME {get; set;}
        public string SECTION_REFERENCE {get; set;}
        public int PROCESS_MODEL_ID {get; set;}
        public int PROCESS_MODEL_REFERENCE_LIST {get; set;}
    }

    public partial class AllProcessList  
    {
        public int? PROCESS_MODEL_ID {get; set;}
        public string PROCESS_MODEL_NAME {get; set;}
        public string PROCESS_AREA {get; set;}
        public int PROCESS_AREA_ID {get; set;}
        public int PROCESS_ID {get; set;}
        public string PROCESS_TITLE {get; set;}
        public string PROCESS_DESCRIPTION {get; set;}
        public string REFERENCE_COLUMN {get; set;}
        public int[] REFERENCE_LIST {get; set;}
    }

    public partial class AllProcessByServiceAreaList  
    {
        public int? SERVICE_AREA_ID {get; set;}
        public string SERVICE_AREA_NAME {get; set;}
        public string PROCESS_AREA {get; set;}
        public int PROCESS_AREA_ID {get; set;}
        public int PROCESS_ID {get; set;}
        public string PROCESS_TITLE {get; set;}
        public string PROCESS_DESCRIPTION {get; set;}
        public string REFERENCE_COLUMN {get; set;}
        public int[] REFERENCE_LIST {get; set;}
    }

    public partial class KPIMasterList  
    {
        public int KPI_MASTER_ID {get; set;}
        public int KPI_TARGET_MASTER_ID {get; set;}
        public string CUSTOMER_ID {get; set;}
        public string PROJECT_ID {get; set;}
        public int PRODUCT_ID {get; set;}
        public int GOAL_ID {get; set;}
        public int? MODE_ID {get; set;}
        public int GLOBAL_KPI_CATEGORY_ID {get; set;}
        public int PRODUCT_SERVICE_LEVEL_METRICS_ID {get; set;}
        public int BASE_MEASURE_ID {get; set;}
        public string SERVICE_AREA {get; set;}
        public string KPI_NAME {get; set;}
        public decimal? EXPECTED_SERVICE_LEVEL {get; set;}
        public decimal? MINIMUM_SERVICE_LEVEL {get; set;}
        public string SLA_TARGET_UNIT_OF_MEASUREMENT {get; set;}
        public string FREQUENCY {get; set;}
        public string SPECIFICATION_LIMIT {get; set;}
        public string SERVICE_LEVEL {get; set;}
        public string SLA_CATEGORY {get; set;}
        public string REFERENCE {get; set;}
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
    }

    public partial class ProjectInputHolder  
    {
        public List<EMP_INFO> QAList {get; set;}
        public List<PROJECT_CERTIFICATION_SCOPE> CertificationScopeList {get; set;}
        public List<PROJECT_ISO_STANDARD> IsoStandardList {get; set;}
    }

    public partial class ProjectInputDetails  
    {
        public string PROJECT_ID {get; set;}
        public string QA_SPOC {get; set;}
        public int[] CERTIFICATION_SCOPE {get; set;}
        public int[] ISO_STANDARD {get; set;}
        public string GOVERNANCE_APPLICABILITY {get; set;}
    }

    public partial class ProjectHeads  
    {
        public string BUHEAD {get; set;}
        public string CSM {get; set;}
        public string PM {get; set;}
        public string AM {get; set;}
        public string QA {get; set;}
        public string BUHEAD_NAME {get; set;}
        public string CSM_NAME {get; set;}
        public string PJT_MNGR_NAME {get; set;}
        public string ACNT_MNGR_NAME {get; set;}
        public string QSPOC_NAME {get; set;}
        public string CERTIFICATION_SCOPES {get; set;}
        public string ISO_STANDARDS {get; set;}
        public string CERTIFICATION_SCOPES_NAME {get; set;}
        public string ISO_STANDARDS_NAME {get; set;}
        public string DP {get; set;}
        public string DP_NAME {get; set;}
        public string GOVERNANCE_APPLICABILITY {get; set;}
    }

    public partial class ProjectCertificationScopes  
    {
        public string STANDARD_NAME {get; set;}
        public string SCOPE_NAME {get; set;}
        public int PROJECT_SCOPE_ID {get; set;}
        public int ISO_STANDARD_ID {get; set;}
    }

    public partial class OverallTaskDetails  
    {
        public string CUST_NM {get; set;}
        public string PROJ_NM {get; set;}
        public string ISO_STANDARDS {get; set;}
        public string CERTIFICATION_SCOPES {get; set;}
        public string START_DATE {get; set;}
        public string END_DATE {get; set;}
        public int? HEADCOUNT {get; set;}
        public string LAST_AUDITED_DATE {get; set;}
        public string AUDIT_STATUS {get; set;}
        public string FREQUENCY {get; set;}
        public string PROJ_ID {get; set;}
        public string CUST_ID {get; set;}
        public string AUDIT_TITLE {get; set;}
        public int? AUDITS_PLANNED {get; set;}
        public int? AUDITS_COMPLETED {get; set;}
    }

    public partial class OpenFindingsCount  
    {
        public int AUDIT_ID {get; set;}
        public int OPEN_FINDINGS {get; set;}
        public int CLOSED_FINDINGS {get; set;}
        public int TOTAL_FINDINGS {get; set;}
    }

    public partial class GetSimilarIdeas  
    {
        public int IDEA_ID {get; set;}
        public string DESCRIPTION {get; set;}
        public DateTime? IDENTIFIED_DATE {get; set;}
        public string STATUS {get; set;}
        public string IDENTIFIED_BY {get; set;}
        public string PROJECT_NAME {get; set;}
        public string CUSTOMER_NAME {get; set;}
    }

    public partial class PROJECT_SCOPES  
    {
        public PROJECT_SCOPE PROJECT_SCOPE {get; set;}
        public List<PROJECT_INSCOPE_DETAILS> PROJECT_INSCOPE_DETAILS {get; set;}
    }

    public partial class IdeaInputs  
    {
        public string CUSTOMER_ID {get; set;}
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
    }

    public partial class OverallKPIList  
    {
        public int KPI_ID {get; set;}
        public string KPI_NAME {get; set;}
        public string FREQUENCY {get; set;}
        public string SLA_TARGET_UNIT_OF_MEASUREMENT {get; set;}
        public string SERVICE_AREA {get; set;}
        public int BASE_MEASURE_ID {get; set;}
        public string NUMERATORDESCRIPTION {get; set;}
        public string DENOMINATORDESCRIPTION {get; set;}
        public int BASE_MEASURE_FORMULA_TYPE_ID {get; set;}
        public string FORMULA_DESCRIPTION {get; set;}
        public string FORMULA {get; set;}
        public string SLA_FORMULA {get; set;}
    }

    public partial class ScpConfiguration  
    {
        public string CUST_NM {get; set;}
        public string PROJ_NM {get; set;}
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
        public string FREQUENCY {get; set;}
        public string SERVICE_TOWER {get; set;}
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public string SERVICE_TOWER_ID {get; set;}
        public bool IS_SCP_APPLICABLE {get; set;}
    }

    public partial class ScpInputDetails  
    {
        public string CUST_ID {get; set;}
        public string PROJ_ID {get; set;}
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
        public string FREQUENCY {get; set;}
        public bool IS_SCP_APPLICABLE {get; set;}
        public int [] SERVICE_TOWER {get; set;}
    }

    public partial class PROJECT_CAPA_DETAILS  
    {
        public string PROJECT_ID {get; set;}
        public string PROJECT_TITLE {get; set;}
        public int NOT_MET {get; set;}
        public int DUE_FOR_SUBMISSION {get; set;}
        public int DUE_FOR_REVIEW {get; set;}
        public int DUE_FOR_QA_APPROVAL {get; set;}
        public int DUE_FOR_IMPLEMENTATION {get; set;}
        public int DUE_FOR_VERIFICATION {get; set;}
        public int CLOSED {get; set;}
    }

    public partial class BATCH_DATA_FORMATTED  
    {
        public string BATCH_NAME {get; set;}
        public DateTime START_DATE {get; set;}
        public DateTime END_DATE {get; set;}
    }

    public partial class CUSTOMER_CONTACTS  
    {
        public string EMAIL_ID {get; set;}
        public string DISPLAY_NAME {get; set;}
        public bool IS_ACTIVE {get; set;}
    }

    public partial class GET_QUESTION_MODEL  
    {
        public int QUESTION_MODEL_ID {get; set;}
    }

    public partial class PROJECT_BY_RESOURCE  
    {
        public string PROJ_ID {get; set;}
        public int CNT {get; set;}
    }

    public partial class CSS_CUSTOMER_VERIFICATION  
    {
        public string CUST_NM {get; set;}
        public string PROJ_NM {get; set;}
        public string CSS_Eligible {get; set;}
        public string REASON {get; set;}
        public int HEAD_COUNT {get; set;}
        public DateTime START_DateTime {get; set;}
        public DateTime END_DateTime {get; set;}
        public string CSS_CONFIGURED {get; set;}
        public string CUSTOMER_CONTACT_VERIFICATION {get; set;}
        public string VERIFICATION_COMMENTS {get; set;}
        public string VERIFIED_BY {get; set;}
        public DateTime APPROVAL_DateTime {get; set;}
        public string RESPONDENT_NAME {get; set;}
        public string RESPONDENT_MAIL {get; set;}
        public string ROLE {get; set;}
        public string ROLE_TYPE {get; set;}
        public string PROJ_STATUS {get; set;}
        public string PROJECT_TYPE {get; set;}
        public string BUSINESS_UNIT {get; set;}
        public string DEPARTMENT {get; set;}
        public string PROJECT_GROUP {get; set;}
        public string CONTRACTING_UNIT {get; set;}
        public string REVENUE_TYPE {get; set;}
        public string COUNTRY {get; set;}
        public string METHODOLOGY {get; set;}
        public string TYPE_OF_ACCOUNT {get; set;}
        public string ACCOUNT_OWNER {get; set;}
        public string PM {get; set;}
        public string PM_MAIL {get; set;}
        public string CSM {get; set;}
        public string CSM_MAIL_ID {get; set;}
        public string ACCOUNT_MANAGER {get; set;}
        public string AM_MAIL_ID {get; set;}
        public string BU_HEAD {get; set;}
        public string BU_MAIL {get; set;}
        public string QUALITY_SPOC {get; set;}
        public string CSM_REVIEWER_MAIL_ID {get; set;}
        public string SKIP_CSAT {get; set;}
        public string SKIP_CSAT_COMMENTS {get; set;}
        public string PROJ_ID {get; set;}
        public string CUST_ID {get; set;}
        public int? BATCH_ID {get; set;}
        public int? BATCH_CUSTOMER_ID {get; set;}
        public int? BATCH_MONTHLY_ID {get; set;}
        public int? BATCH_CUSTOMER_MONTHLY_ID {get; set;}
        public string CSM_EMP_ID {get; set;}
        public string CONTACTS_LINK {get; set;}
        public string SKIP_CSAT_LINK {get; set;}
    }

    public partial class CSAT_PROJECT_SELECTION_LIST  
    {
        public string CUST_ID {get; set;}
        public string CUST_NM {get; set;}
        public string PROJ_ID {get; set;}
        public string PROJ_NM {get; set;}
        public bool IS_SELECTED {get; set;}
        public string IS_REASON_MANDATORY {get; set;}
        public int PROJECT_HEAD_COUNT {get; set;}
        public int ACCOUNT_HEAD_COUNT {get; set;}
        public string DEFAULT_REASON {get; set;}
        public string REASON {get; set;}
        public decimal? PREDICTED_SCORE {get; set;}
        public string PREDICTED_REASON {get; set;}
        public bool PROJECT_IN_PCSAT {get; set;}
        public bool ACCOUNT_IN_ACSAT {get; set;}
        public DateTime? START_DATE {get; set;}
        public DateTime? END_DATE {get; set;}
        public string FREQUENCY {get; set;}
        public string PROJ_STATUS {get; set;}
        public string RESPONDENT_MAIL {get; set;}
        public string CONTACT_ROLE {get; set;}
        public string QUALITY_SPOC {get; set;}
        public string CSAT_SPOC_EMAIL {get; set;}
        public string PROJECT_TYPE {get; set;}
        public string EXECUTION_TYPE {get; set;}
        public string ENGAGAMENT_TYPE {get; set;}
        public string BUSINESS_UNIT {get; set;}
        public string DEPARTMENT {get; set;}
        public string PROJECT_GROUP {get; set;}
        public string CONTRACTING_UNIT {get; set;}
        public string REVENUE_TYPE {get; set;}
        public string COUNTRY {get; set;}
        public string METHODOLOGY {get; set;}
        public string PROJ_PM_EMP_ID {get; set;}
        public string DP_ID {get; set;}
    }

    public partial class DROPDOWN_OPTION  
    {
        public string DD_VALUE {get; set;}
        public string DD_TEXT {get; set;}
    }


}
 