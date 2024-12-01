using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data.Contracts
{
    public interface IAppRepository
    {
        void AddCustomer(CUSTOMER customer);
        void AddEmployee(EMP_INFO_DETAILED employee);       
        IEnumerable<Projects> CustomerProjects(string EmailId);
        IEnumerable<CustomerProjectIds> CustomerProjectIds(string EmpId);
        List<Projects> GetEmployeeProjects(string EmpId, string CustId, Boolean AllProjects, Boolean IncludeChildProjects);
        List<CSM_INFO> GetCSMList();
        IEnumerable<CustomerProjectDetails> GetCustomerProjectDetails();
        DataTable GetTable(string spName, List<REPORTS_PARAMS> lstparams);
        IEnumerable<StaffingSummary> GetStaffingSummaryDetails(string custId, string ProjectId = null);
        IEnumerable<StaffingProject> GetStaffingProjectSummary(string custId, string ProjectId = null);
        IEnumerable<StaffingProject> GetStaffingProjectDetails(string projectId);
        IEnumerable<StaffingSummary> GetStaffingAssignedProjects(string custid, string projectId = null);
        IEnumerable<StaffingProject> GetStaffingAssignedProjectDetails(string projectId);
        IEnumerable<ProjectTask> GetProjectTasks(string taskId);
        void InsertProjectResource(string EmpId, string ProjectId, bool IsBillable, Decimal AllctPct, string CurrIndc, string CreatedBy, DateTime StartDate, DateTime EndDate);
        IEnumerable<ProjectDetails> ProjectDetails(string EmpId, string ProjectId, string Category);
        IEnumerable<ProjectResourceByEmpId> ProjectResourceByEmpId(string EmpId);
        IEnumerable<ProjectResourceByEmpId> ProjectResourceByProjId(string ProjectId);
        IEnumerable<Projects> ProjectList(string CustomerId, string ProjectId);
        IEnumerable<Projects> Projects(string EmpId, string ProjectId);
        IEnumerable<ProjectsBaseCustomer> GetEmployeeAccounts(string EmpId, string ProjectId);
        IEnumerable<ProjectBase> GetProjectIdsForUser(string empId, string customerId, string projectId);
        IEnumerable<Projects> ProjectsWithBillingProj(string EmpId, string ProjectId);
        void Insert_PROJ_RESRC_TIME_ENTRY(DataTable records);
        void Insert_PROJ_RESRC_TIME_ENTRY_PSA(DataTable records);
        void Update_PROJ_RESRC_TIME_ENTRY(DataTable records);
        void Update_PROJ_RESRC_TIME_ENTRY_PSA(DataTable records);
        IEnumerable<ReportingDetails> ReportingDetails(string EmpId, string ProjectId, string Category);
        IEnumerable<EMP_INFO> ResourceDetailsByManager(string EmpId);
        IEnumerable<Model.AllSys.ResourceDetails> ResourceDetails(string EmpId, string ProjectId, string ManagerId);
        IEnumerable<Resource> ResourceCount(string ProjectId);
        IEnumerable<TeamTimesheetDetails> TeamTimesheetDetails(string EmpId, string ProjectId, int DateId, int ResourceId);
        IEnumerable<TimesheetDatewise> TimesheetDatewise(DateTime StartDate, DateTime EndDate, string EmpId, string ProjectId);
        IEnumerable<TimesheetWeekly> TimesheetWeekly(string EmpId, int DateId, int TaskYear);
        IEnumerable<TimesheetDetails> TimesheetDetails(DateTime StartDate, DateTime EndDate, string EmpId, string Category, string ProjectId);
        //IEnumerable<TimesheetDetailsMonthly> TimesheetDetailsMonthly(string EmpId, string ProjId, string BillingProjId, int Month, int Year);
        IEnumerable<TimesheetDetailsMonthly> TimesheetDetailsMonthly(string EmpId, string ProjId, string BillingProjId, DateTime StartDate, DateTime EndDate);
        IEnumerable<Token> Token(string EmailId);
        IEnumerable<UserInfo> UserInfo(string EmailId);
        //IEnumerable<EMP_INFO> GetAuditorDetails();
        IEnumerable<EMP_INFO> GetAuditeeDetails(string ProjectId , string CustomerId, bool includeCustomer);
        DateTime GetOldestTimesheetdateAvailableforApproval(string customerid);
        bool UpdateProjectAliasName(string projectid, string projectaliasname);

        IEnumerable<StaffingSummaryForAllCustomers> GetStaffingSummaryDetailsForAllCustomers();

       // List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCountReport(string ProjectId, DateTime month);
        // List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCountReport(string ProjectId, DateTime month);
        IEnumerable<PROJECT_RESOURCE> TimeSheetTaggedProject(DateTime StartDate, DateTime EndDate, string EmpId);        
        IEnumerable<PROJECT_RESOURCE> TimeSheetTaggedProjectByProjId(DateTime StartDate, DateTime EndDate, DateTime empStartDate, DateTime empEndDate, string projectid);
        IEnumerable<PROJECT_RESOURCE> CheckIfResourceAlreadyAllocatedWithinSameTimeRange(DateTime StartDate, DateTime EndDate, string projectid, string EmpId);
        IEnumerable<EMP_INFO_FOR_CUSTOMER> RemainderEmail(DateTime StartDate, DateTime EndDate, string CustomerId, string projectId);
        IEnumerable<EMP_RISK_ADD_SEND_EMAIL> AddRiskEmail();

        //psa related
        EMP_INFO_DETAILED GetEmployeeById(string EmpId);

        void MigrateProjectData(string oldProjectId, string newProjectId);
        List<EMP_INFO> GetEmpIdsForAccount(string custId);
        List<CUST_EMP_INFO> GetEmpIdsForCustomerAccount(string customerId);
        IEnumerable<EMP_INFO> GetAuditorDetailsByCertifiedStandards(string CustomerId, string ProjectId);

        IEnumerable<EMP_INFO> GetAuditorDetails();

        List<MandatoryTrainingReport> GetMandatoryTrainingDetails(DateTime starDate, DateTime endDate, string custId, string projIds);

        List<CustomerBase> GetAllAccounts();

        List<GetCAPAStage> getCAPAStages(string detailIds);
        List<PortfolioDetails> GetPortfolioDetails();
        List<CONFIGEXTDETAILS> GetConfigExtDetails();
        List<AuditorQualityStandardSummary> GetAuditorQualifiedStandardSummary();
        List<ProductResponsibleDetails> GetProductResponsibleDetails(int productId);
        List<EmployeeListfromCustomer> GetEmployeeDetailsfromCustomer(string customerId);
        ProjectHeads GetProjectMembersByProject(string projectId);
        List<GetOverallRiskForRiskDashboard> GetOverallRisksForRiskDashboard(DateTime? startDate, DateTime? endDate, string custId, string riskStatus,string projIds, string businessUnits);
        List<ProductPortfolioDetails> GetProductByPortfolioId(string custId, int? portId);
        List<RiskRepository> GetAllRiskFromRepository(string customerId, string projectId);
        List<ProcessModelReference> GetAllProcessModelReferenceList();
        List<KPIMasterList> GetAllKPIList();
        List<ProjectCertificationScopes> GetProjectCertificationScopes();
        List<OverallTaskDetails> getOverallTaskDetails(DateTime StartDate, DateTime EndDate, string customerId, string projectId, string taskCategory);
        List<OpenFindingsCount> getOpenFindingsCount(string auditIds);
        List<GetSimilarIdeas> getSimilarIdeas(string description);
        List<OverallKPIList> GetOverallKPIList();
        List<ScpConfiguration> getSCPConfigurationValues();
        List<CUSTOMER_PROJECTS> getProductMappedCSATProjects();
        int? getQuestionModelId(string projectId, int batchId, string emailId);

        List<CSS_Readiness_Info> getCSS_Readiness_Info(DateTime startDate, DateTime endDate);
    }
}