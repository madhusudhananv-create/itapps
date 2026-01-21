using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GAVS.AllocationSystem.Model.CSP;
using System.Data;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using GAVS.AllocationSystem.Model.AllSys.Tables;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface IAppRepository_CSP
    {
        List<PROJECT_ISSUEEXT> GetOpenEscalationsByDate(string CustIds, DateTime StartDate, DateTime EndDate, string Status);
        IEnumerable<PROJECT_CSAT_DATA> GetCSSTable(string YearQuarter); //Customer satisfaction survey in flat format

        IEnumerable<PROJECT_CSAT_DATA> GetCSSTableForPeriod(string startDate, string endDate, string custId);

        IEnumerable<PROJECT_CSAT_DATA_EXTENDED> GetCSSTableForPeriod1(string startDate, string endDate, string custId, string csmId, string frequency);

        IEnumerable<PROJECT_CUSTOMER_NPS_DATA> GetCSSTable(string YearQuarter, string pQuarter, string cQuarter, string custIds);

        IEnumerable<CRISP_RAG_SUMMARY> getCrispRagSummary();
        IEnumerable<CRISP_RAG_SUMMARY> dashboard_getCrispRagSummary(DateTime StartDate, DateTime EndDate);
        IEnumerable<CRISP_CATEGORY_RAG_SUMMARY> getCrispCategoryRagSummary();
        IEnumerable<CSAT_SURVEY_DATA> getCSSResponseSummary(int Year); //Customer satisfaction survey in flat format
        IEnumerable<CSAT_SURVEY_DATA_PERIODWISE> GetCSSResponseSummaryForPeriod(string startDate, string endDate, string custId);
        IEnumerable<CSAT_SURVEY_DATA_PERIODWISE_MONTHLY> GetCSSResponseSummaryForPremierMonthly(string startDate, string endDate, string custId);
        IEnumerable<CSAT_INITIATED_SUMMARY> getCSSInitiatedSummary();
        IEnumerable<CSAT_RECEIVED_SUMMARY> getCSSReceivedSummary();
        IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> getCustomerProjectPorfolioList(DateTime startDate, string customerId);
        IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> GetCustomerProjectDetailsByEmpId(string EmpId, bool projFlag);
        IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> GetCustomerProjectDetailsByCustomerEmailId(string EmailId);
        List<CRISPScores> GetCrispScores(DateTime startDate, DateTime endDate);
        List<CRISPScores> GetCrispScoresForProject(string projId, DateTime startDate, DateTime endDate);
        IEnumerable<TASK_DETAILS> getTaskDetailsByDateRange(DateTime StartDate, DateTime EndDate, string empId, string customerId, string projectId, string taskCategory, string range);
        string LastUpdatedDate(string ProjectId);
        bool UpdateTable<T>(IEnumerable<T> List, string type);
        void DeleteAccessControls(string Ids, string Delimiter);
        void Insert_SQA_DATA_REPOSITORY(DataTable records);
        void Insert_DASHBOARD_DETAILS(DataTable records);
        void Delete_DASHBOARD_DETAILS(DataTable records);
        void Delete_SQA_DATA_REPOSITORY(int reportId, string DateField, DateTime startDate, DateTime endDate);
        IEnumerable<ProjectScope> ProjectScope(string ProjectId);
        IEnumerable<CustomerProjects> CustomerProjects();
        IEnumerable<ChartDataMonthly> GetChartDetails(string DateField, string xAxis, string yAxis, string Level1, string Level2, string xAxisType, string frequency, int reportId, DateTime startDate, DateTime endDate, string filtersXml);
        IEnumerable<MonthDetails> GetMonthDetails(DateTime startDate, DateTime endDate);
        List<string> GetKPIForCRISP(string projId, DateTime period);
        string GetRiskForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetIssueForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetCSATForCRISP(string projId, int month, int year);
        string GetIdeasForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetImprovementsForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetConcernsForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetMandatoryTrainingForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetSecurityComplainceTrainingForCRISP(string projId, DateTime StartDate, DateTime EndDate);
        string GetMandatoryAuditStatus(string projId, DateTime StartDate, DateTime EndDate);
        List<BESTPRACTICE_MATRIX> GetFilteredBestPractices(int referenceId, int deptId);
        List<INNOVATIONS_MATRIX> GetFilteredIdeas(int referenceId, int deptId);
        void AddCRISPDetails(string projId, string empId);
        List<KPI> GetKPIWithTargets(int goalId, DateTime startDate, DateTime endDate);
        List<KPI_DETAILS_EXTENDED> GetKPIDetails(DateTime startDate, DateTime endDate, String ProjIds = "");
        List<CSSData> GetCSSTableForProjects(DateTime startDate, DateTime endDate, String ProjIds = "");
        IEnumerable<PROJECT_RISK_EXT> GetRiskDetailsByCustomerId(string projIds, bool allProj);
        List<PARAMETER_TABLE> GetFrequencyAudit();
        List<PARAMETER_TABLE> GetAuditType();
        List<PARAMETER_TABLE> GetAuditSupportFunctions();
        List<PROCESS_MODEL> GetScopeOfAudit();
        List<PARAMETER_TABLE> GetStatusOfAudit();
        List<KAIZEN_DASHBOARD> GetInnovationForProject(string CustomerId, string ProjId, int Year, int Quarter, string RadioOption);
        List<ANALYSIS_TOTAL> GetAnalyzedInsights(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate);
        List<SQA_DATA_REPOSITORY> GetEngineerwiseTotalCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate);
        List<SQA_DATA_REPOSITORY> GetEngineerComplainceCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate);
        List<SQA_DATA_REPOSITORY> GetEngineerNonComplainceCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate);
        List<INSIGHTS_FILTER> GetReportCondition(string ReportType);
        List<RisksIssuesForProject> GetRisksAndIssuesDetails();
        List<object> GetReports();
        List<PROCESS_MODEL> GetProcessModel();

        List<PROCESS_MODEL_OBJECTIVES> GetProcessModelObjectives();
        List<PROCESS_SERVICE_AREA> GetServiceAreaForModel(string serviceAreaId);
        List<ProcessDetails> GetProcessByServiceArea(int ServiceAreaId);
        List<PROCESS_DESCRIPTION> GetProcessDescription(string customerId, string projectId, string serviceAreaId);
        void DeleteProcessProjectConfig(string ProjectId);
        List<AUDIT_PROCESS_TESTS> GetAuditProcessTests(int ProcessModelId);

        List<TESTS_VIEW_MODEL> GetTestsData(string CustomerId, string ProjectId, string ServiceAreas, string AuditTitle);
        List<PERSPECTIVE_LIST> GetGlobalCategory();
        List<KPI> GetTotalKPIMonthCount(DateTime month);
        List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCount(string ProjectId, DateTime month);
        List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCountReport(string ProjectId, DateTime month, string CustomerId, string AuditTitle);

        List<PROCESS_MODEL_SUMMARY> GetProcessModelSummaryReport(string ProjectId, DateTime StartDate, string AuditTitle, string CustomerId);
        void UpdateCSSBatchCustomers(int ID, int SURVEY_ID, DateTime SURVEY_SENT_DATE, DateTime? SURVEY_RECEIVED_DATE, string STATUS, string EMP_ID, DateTime? MEETING_DATE, bool? IS_CSM_NOTIFIED, int questionModelId);
        void UpdateCSSBatchCustomersMonthly(int ID, int SURVEY_ID, DateTime SURVEY_SENT_DATE, DateTime? SURVEY_RECEIVED_DATE, string STATUS, string EMP_ID, DateTime? MEETING_DATE, bool? IS_CSM_NOTIFIED);
        List<AUDIT_EXECUTION_REPORT> GetAuditExecutionReport(string ProjectId, DateTime month);
        List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> GetChecklistAudit(string CustomerId, string ProjectId);

        List<TEST_REPORT_SUMMARY> GetTestsResults(string CustomerId, string ProjectId, string AuditTitle);

        List<PROCESS_MODEL_OBJECTIVES_NEW> GetObjectivesFromServiceAreaId(int ServiceAreaId);

        List<IdeasAndInnovationsData> GetIdeasAndInnovationsDetails();

        List<ActionItemsViewDetails> GetActionItemsStatus();

        List<ActionItemsViewDetails> GetActionItemsViewDetails(string ProjIds);

        List<ProjectStatusDetails> GetProjectStartAndEndDate();

        List<ProjectStatusViewDetails> GetProjectStartAndEndDateForViewDetails();

        List<CustomerProjectData> GetCustomerProjectDetails();

        List<OverAllData> GetOverAllIssuesData();

        List<OverAllData> GetOverAllRisksData();

        List<PROJECT_ISSUEEXT> GetAllIssuesForCustomer(string ProjIds);

        string GetPortfolioName(string ProjId);

        IEnumerable<string> GetprojectsNameForAPortfolio(int PortfolioId, bool Projflag, string EmpId);
        List<TasksEventsSummary> GetTasksEventsSummary(string customerId, string empId);
        List<TasksEventsDetails> GetTasksEventsDetails(string customerId, string empId, string projectId, int eventTypeId, string period);
        List<CUSTOMER_PROJECT_PORTFOLIO> GetprojectsNameForAPortfolioNew(int portfolioId);

        List<PROJECT_INNOVATIONEXT> GetAllIdeasDetails(string ProjIds);

        List<PROJECT_BEST_PRACTICES_EXT> GetAllBestPracticesForCustomer(string ProjIds);

        List<AllProcessList> GetAllMappedProcess();

        List<AllProcessByServiceAreaList> GetAllProcessByServiceArea(int ServiceTowerId = 0);

        List<PlannedAudits> GetPlannedAudits(string Custid, string Projid);

        List<GlobalKPIData> GetGlobalKPIDetails(DateTime startDate, DateTime endDate, string GlobalKpis, string Customerids, string Projectids, string ServiceTowerIds);

        //List<GlobalKPIData> GetGlobalKPIDetailsNew(DateTime Startdate, DateTime Enddate, string GlobalKpis, string Customerids, string Projectids);
        //List<GlobalKPIData> GetGlobalKPIDetails(DateTime startDate, DateTime endDate, string GlobalKpis, string Customerids, string Projectids);

        List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetChecklistAuditNew(string CustomerId, string ProjectId, int auditId, string ServiceAreaIds);

        //List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> GetChecklistAuditNew(string CustomerId, string ProjectId, string ServiceAreaIds);
        List<FindingsForCustomer> GetAllFindingsForCustomer(string custid, string startdate, string enddate);
        List<Findings> GetAllFindingsByTime();
        List<FindingsByTime> GetAllFindingByTimeCustomerWise(string custId, string projIds);

        void AddServiceLevelIdentifier(string service_Level_Identifier, string service_Level_Title, int service_Area_Id, string Empid);

        void AddFMEATask(int serviceAreaId, int processId, int serviceIdentifierId, string taskTitle, int taskCategoryId);

        List<FMEADataModel> GetFMEADATA(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId);
        List<Findings> GetAllFindingsByType();
        List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> GetAllAuditRows();
        List<TASK_EXTENDED> GetAllAssessments(string CustId, DateTime StartDate, DateTime EndDate);


        List<GET_FMEA_DATA_STAGE2> GetFMEADATAStage2(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId);

        void UpdateApproval(int fmeaDataId, int fmeaStatus, string rejectionComments);

        void UpdateApprovalStage2(int fmeaDataId, int fmeaStatus, string rejectionComments, string empId);

        void UpdateApprovalStage3(int fmeaDataId, int fmeaStatus, string rejectionComments, string empId);

        void UpdateApplicable(int Id, Boolean status);

        List<GET_FMEA_DATA_STAGE3> GetFMEADATAStage3(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId);

        void UpdateFMEADataStage3Model(FMEA_DATA_STAGE3_MODEL results);

        bool VerifyFMEAStage2Data(int fmeaDataId, string cusT_ID, string proJ_ID);

        List<CI_TRACKER> GetCITracker(bool automate, bool customerSavings, DateTime startDate, DateTime endDate, string[] projectIds, string custid, bool innovation, bool improvement, bool all, int viewBy, int[] iistatus);

        List<CI_TRACKER> GetCILBoard(bool all, string custId, string[] projectIds, DateTime startDate, DateTime endDate, int[] cilCategory, int[] iiStatus, int beneficiary, int uom);

        List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> GetFindingsForAuditWithStatus(int AuditId, int QuestionId);

        void UpdateMultipleRequests(int id, bool status, string request);

        List<PlannedAudits> GetTasksForFMEA(string custid, string projid);

        void GetFMEAStage2DataByTask(int taskId);

        void DeleteFMEAStage1(int fmeaDataId);
        List<KpiTargetsBase> GetKPIForCRISPNew(string projId, DateTime period, bool isSowCommitment);

        List<Benefits> GetApplicableBenefits(string Categoryids);
        List<ServiceAres_VM> GetServiceAreasForproject(string ProjId);
        List<IdeaViewModel> GetAllIdeas(string customerId, DateTime startDate, DateTime endDate);

        List<IdeaViewModel> GetAllIdeasByCustomer(string customerId);
        List<IdeaViewModel> GetIdeasDetailById(int ideaId);

        List<IdentifiedBy_People> GetIdentifiedBy(string custId);

        IdeaModel GetIdeabyId(int Ideaid);
        ImplementedIdea GetImplementedIdea(int Ideaid);
        List<IdeaStages> GetIdeaStageStatus(int Ideaid);
        List<GET_REQ_STAGE_STATUS> GetReqStageStatus(int ReqId);

        List<IdeaViewModel> UpdateIdeaStatus(string Ideaids, string Status);

        List<QualitativeBenefitTitle> GetQualitativeBenefit(BenefitQualitativeDetails qualitativeBenefits);

        List<QualitativeBenefitTitle> GetQualitativeBenefitDetail(BenefitQualitativeDetails qualitativeBenefits);

        List<QuantitativeNetBenefits> GetValuePieChart(BenefitQuantitativeDetails quantitativeBenefits);

        List<QuantitativeMonthlyNetBenefits> GetValueColumnChart(BenefitQuantitativeDetails quantitativeColumnBenefits);

        List<QuantitativeNetBenefits> GetQuantitativeBenefitsDetail(BenefitQuantitativeDetails quantitativeBenefits);

        List<UOM_Title> GetAllUOM();
        List<IdeaStatusCount> GetIdeasStatusCount(IdeasSPFilter ideas);
        List<ProjectSpecificFailures> GetProjectSpecificFailures(FailureModeFilters filters);
        List<CSMDashboardDetailsModel> GetIdeasInnovationsImprovements(string projIds, string startDate, int endDate);

        List<CSMDashboardDetailsModel> GetProcessCompilanceScore(string projIds);
        List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> GetFindingsForProject(string projId, int serviceAreaId);

        List<ActionItemsAreaVaue> GetActionitemArea(string projIds);

        List<AccountHealth> GetAccountHealth(string projIds, int month, int year);
        List<ActionItemsAreaVaue> GetRiskAreaChart(string projIds);

        List<ActionItemsAreaVaue> GetIssueAreaChart(string projIds);

        List<PROJECT_ISSUEEXT> GetIssuesDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "");

        List<ContractStatusDetails> GetContractStatusDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "");
        List<PROJECT_RISK_EXT> GetRisksDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "");

        List<ActionItemsViewDetails> GetActionitemsDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "");

        List<ProjectResourceCount> GetProjectTeamCount(string projIds);

        List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetSubmitedAssessmentsForCustomerandProject(string custId, string projId, int serviceAreaId);

        List<KPI_SERVICE_LEVEL_METRICS> GetKpiMetrics(int prodId, int modeId, string stDate, string enDate);
        List<KPI_REFERENCES_PRODUCT> GetKPIReferencesByCustomer(string kpiSLAIds, string customerId, string stDate, string enDate);
        List<AUDIT_DETAILS_VM> GetAuditNotCompleted();
        List<AUDIT_DETAILS_VM> GetAuditScoreNotSubmitted();
        void InsertExternalKPIData(DataTable extTable, string empId, string custId, DateTime ipDate, string source, string fileName);
        void UpdateExistingBaseMeasureKPIdataMap(DataTable extTable, string empId);
        List<EXTERNAL_KPI_DATA> GetExternalKPIstoProcess(string customerId, string source, DateTime startDate, DateTime endDate);
        List<KPI_SERVICE_LEVEL_METRICS> GetAllKpiByModeId(int modeId, int serviceLevelId, int prodId);

        List<PORTFOLIO_WISE_KPI> GetPortfolioWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer);
        List<KPI_WISE_DATA> GetKPIWiseDataForPeriod(string customerId, DateTime startDate, DateTime endDate, bool isCustomer);
        List<PRODUCT_WISE_KPI> GetProductWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCsutomer);
        List<ENGAGEMENT_WISE_KPI> GetEngagementWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer);

        List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED> GetWeightageForChecklist(int checklistId);

        List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED> GetWeightageForAllChecklist();

        List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetChecklistUsedInAssessment();

        List<PRODUCT_RESPONSIBLE_EXTENDED> GetProductManagerByProductId(int productId);
        List<PRODUCT_RESPONSIBLE_LIST> GetPortfolioProductResponsibleList(string custId, int managementType = 0);
        List<CUSTOMER_USERS_LIST> GetCustomerUsersList(string custId);
        decimal GetExpectedServiceLevel(int kpiId);

        int GetOverallKPICountForPortfolio(int portfolioId, DateTime startDate, DateTime endDate, bool isCustomer);
        List<ENGAGEMENT_WISE_KPI_DETAILS> GetEngagementWiseKPIDetails(string custId, string kpiName, string status, DateTime startDate, DateTime endDate, string viewBy);
        List<KPI_WISE_DATA> GetPortfolioWiseKPIDetails(string customerId, DateTime startDate, DateTime endDate, bool isCustomer);
        List<KPI_WISE_DATA> GetTrendDetails(string customerId, int portId, string KpiName, DateTime startDate, DateTime endDate);
        List<CSS_VIEW_DETAILS> GetCSSViewDetails(string startDate, string endDate, string custId);
        List<CSS_VIEW_DETAILS_MONTHLY> GetCSSViewDetailsForMonthly(string startDate, string endDate, string custId);
        List<CSS_QUESTION_RATINGS> GetCSSQuestionRatings(string startDate, string endDate, string custId);
        List<CSS_QUESTION_RATINGS_MONTHLY> GetCSSQuestionRatingsForMonthly(string startDate, string endDate, string custId);
        List<ASSESSMENT_FINDINGS> GetAssessmentFindingsData(string startDate, string endDate, string custId);
        List<PRODUCT_WISE_CAPA_DETAILS> GetProductWiseCAPACount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer);
        List<PROJECT_CAPA_DETAILS> GetProjectCAPACount(string customerId, DateTime startDate, DateTime endDate);
        List<PRODUCTWISEKPIDATA> GetOverallProductWiseKPIData(int prodId, DateTime startDate, DateTime endDate, bool isCustomer, bool excludeExclusions);
        List<ProductKPIDetails> GetProductKPIDetails(int kpiDetailsId);
        List<ENGAGEMENT_WISE_KPI> GetTrendDataForEngagementLevelKPI(string customerId, DateTime startDate, DateTime endDate, string KpiName);
        List<APPRECIATIONDETAILS> GetAppreciationDetails(string projIds);

        List<CSS_CUSTOMER_VERIFICATION> GetCSSForVerification(DateTime startDate, DateTime endDate);

        List<AllProcessList> GetProcessModelListByProcessAreaIds(string processAreaIds);

    }
}
