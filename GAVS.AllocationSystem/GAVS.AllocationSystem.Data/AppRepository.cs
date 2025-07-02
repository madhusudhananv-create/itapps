using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.AllSys.SP;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public class AppRepository : EFRepository<MetaData>, IAppRepository
    {
        private CloudDbContext _cloudDBContext { get; }
        public AppRepository(DbContext context) : base(context)
        {
            _cloudDBContext = new CloudDbContext();
        }
        public void AddEmployee(EMP_INFO_DETAILED employee)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@EMP_ID", employee.EMP_ID);
            SqlParameter param2 = new SqlParameter("@BASE_CNTRY_ID", employee.BASE_CNTRY_ID);
            SqlParameter param3 = new SqlParameter("@MANAGER_EMP_ID", employee.MANAGER_EMP_ID);
            SqlParameter param4 = new SqlParameter("@REVIEWER_EMP_ID", employee.REVIEWER_EMP_ID);
            SqlParameter param5 = new SqlParameter("@EMPL_TYPE", employee.EMPL_TYPE);
            SqlParameter param6 = new SqlParameter("@FRST_NM", employee.FRST_NM);
            SqlParameter param7 = new SqlParameter("@MIDDLE_NM", employee.MIDDLE_NM);
            SqlParameter param8 = new SqlParameter("@LAST_NM", employee.LAST_NM);
            SqlParameter param9 = new SqlParameter("@GENDER", employee.GENDER);
            SqlParameter param10 = new SqlParameter("@DOB", employee.DOB);
            SqlParameter param11 = new SqlParameter("@DOJ", employee.DOJ);
            //SqlParameter param12 = new SqlParameter("@DOR", employee.DOR);
            SqlParameter param13 = new SqlParameter("@LEVEL", employee.LEVEL);
            SqlParameter param14 = new SqlParameter("@TITLE", employee.TITLE);
            SqlParameter param15 = new SqlParameter("@CSM_TITLE_ID", employee.CSM_TITLE_ID);
            SqlParameter param16 = new SqlParameter("@EXPERIENCE", employee.EXPERIENCE);
            SqlParameter param17 = new SqlParameter("@EMAIL_ID", employee.EMAIL_ID);
            SqlParameter param18 = new SqlParameter("@MOBILE_NBR", employee.MOBILE_NBR);
            SqlParameter param19 = new SqlParameter("@POTENTIAL_TO_BILL", employee.POTENTIAL_TO_BILL);
            SqlParameter param20 = new SqlParameter("@UNBILL_CLASSIFY", employee.UNBILL_CLASSIFY);
            SqlParameter param21 = new SqlParameter("@EMP_ROLE", employee.EMP_ROLE);
            SqlParameter param22 = new SqlParameter("@EMP_BAS_ROLE", employee.EMP_BAS_ROLE);
            SqlParameter param23 = new SqlParameter("@EMP_CSP_ROLE", employee.EMP_CSP_ROLE);
            SqlParameter param24 = new SqlParameter("@APPRAISAL_RATING", employee.APPRAISAL_RATING);
            SqlParameter param25 = new SqlParameter("@PROMOTION_INFO", employee.PROMOTION_INFO);
            SqlParameter param26 = new SqlParameter("@CREATED_BY", employee.CREATED_BY);
            SqlParameter param27 = new SqlParameter("@CREATED_DATE", employee.CREATED_DATE);
            SqlParameter param28 = new SqlParameter("@UPDATED_BY", employee.UPDATED_BY);
            SqlParameter param29 = new SqlParameter("@UPDATED_DATE", employee.UPDATED_DATE);
            SqlParameter param30 = new SqlParameter("@SUPERADMIN", employee.SUPERADMIN);

            //var TemplateDetails = context.Database.SqlQuery<EMP_INFO_DETAILED>("[dbo].[usp_insert_employee] @EMP_ID,@BASE_CNTRY_ID, @MANAGER_EMP_ID, @REVIEWER_EMP_ID, @EMPL_TYPE, @FRST_NM , @MIDDLE_NM, @LAST_NM , @GENDER, @DOB,  @DOJ, @DOR,  @LEVEL,  @TITLE,  @CSM_TITLE_ID,  @EXPERIENCE, @EMAIL_ID , @MOBILE_NBR , @POTENTIAL_TO_BILL, @UNBILL_CLASSIFY , @EMP_ROLE , @EMP_BAS_ROLE , @EMP_CSP_ROLE, @APPRAISAL_RATING , @PROMOTION_INFO , @CREATED_BY , @CREATED_DATE , @UPDATED_BY, @UPDATED_DATE, @SUPERADMIN ", param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param12, param13, param14, param15, param16, param17, param18, param19, param20, param21, param22, param23, param24, param25, param26, param27, param28, param29, param30).ToList();

            var templateDetails = context.Database.SqlQuery<EMP_INFO_DETAILED>("[dbo].[usp_insert_employee] @EMP_ID,@BASE_CNTRY_ID, @MANAGER_EMP_ID, @REVIEWER_EMP_ID, @EMPL_TYPE, @FRST_NM , @MIDDLE_NM, @LAST_NM , @GENDER, @DOB,  @DOJ, @LEVEL,  @TITLE,  @CSM_TITLE_ID,  @EXPERIENCE, @EMAIL_ID , @MOBILE_NBR , @POTENTIAL_TO_BILL, @UNBILL_CLASSIFY , @EMP_ROLE , @EMP_BAS_ROLE , @EMP_CSP_ROLE, @APPRAISAL_RATING , @PROMOTION_INFO , @CREATED_BY , @CREATED_DATE , @UPDATED_BY, @UPDATED_DATE, @SUPERADMIN ", param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11, param13, param14, param15, param16, param17, param18, param19, param20, param21, param22, param23, param24, param25, param26, param27, param28, param29, param30).ToList();

        }
        public void AddCustomer(CUSTOMER customer)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@CUST_ID", customer.CUST_ID);
            SqlParameter param2 = new SqlParameter("@CUST_NM", customer.CUST_NM);
            SqlParameter param3 = new SqlParameter("@INDUSTRY_TYPE", customer.INDUSTRY_TYPE);
            SqlParameter param4 = new SqlParameter("@URL", customer.URL);
            SqlParameter param5 = new SqlParameter("@CREATED_BY", customer.CREATED_BY);
            SqlParameter param6 = new SqlParameter("@CREATED_DATE", customer.CREATED_DATE);
            SqlParameter param7 = new SqlParameter("@UPDATED_BY", customer.UPDATED_BY);
            SqlParameter param8 = new SqlParameter("@UPDATED_DATE", customer.UPDATED_DATE);
            var TemplateDetails = context.Database.SqlQuery<EMP_INFO_DETAILED>("[dbo].[usp_insert_customer] @CUST_ID, @CUST_NM, @INDUSTRY_TYPE, @URL, @CREATED_BY, @CREATED_DATE, @UPDATED_BY, @UPDATED_DATE ", param1, param2, param3, param4, param5, param6, param7, param8).ToList();
        }
        public List<Projects> GetEmployeeProjects(string EmpId, string CustId, Boolean AllProjects, Boolean IncludeChildProjects)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@CustId", CustId);
            SqlParameter param3 = new SqlParameter("@AllProjects", AllProjects);
            SqlParameter param4 = new SqlParameter("@IncludeChildProjects", IncludeChildProjects);
            var Projects = context.Database.SqlQuery<Projects>("[dbo].[usp_getEmployeeProjects] @EmpId, @CustId, @AllProjects, @IncludeChildProjects ", param1, param2, param3, param4).ToList();
            return Projects;
        }
        public void Insert_PROJ_RESRC_TIME_ENTRY(DataTable records)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.PROJ_RESRC_TIME_ENTRY_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_insert_tbl_PROJ_RESRC_TIME_ENTRY] @Table", param1).ToList();
        }
        public void Insert_PROJ_RESRC_TIME_ENTRY_PSA(DataTable records)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.PROJ_RESRC_TIME_ENTRY_TYPE_PSA";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_insert_tbl_PROJ_RESRC_TIME_ENTRY_PSA] @Table", param1).ToList();
        }
        public void Update_PROJ_RESRC_TIME_ENTRY(DataTable records)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.PROJ_RESRC_TIME_ENTRY_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_update_tbl_PROJ_RESRC_TIME_ENTRY] @Table ", param1).ToList();
        }
        public void Update_PROJ_RESRC_TIME_ENTRY_PSA(DataTable records)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.PROJ_RESRC_TIME_ENTRY_TYPE_PSA";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_update_tbl_PROJ_RESRC_TIME_ENTRY_PSA] @Table ", param1).ToList();
        }
        public List<CSM_INFO> GetCSMList()
        {
            var dbContext = new CloudDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CSM_INFO>("[dbo].[get_CSMList]").ToList();
            return TemplateDetails;
        }
        public DataTable GetTable(string spName, List<REPORTS_PARAMS> lstparams)
        {
            var dbContext = new CSPDbContext();
            var dt = new DataTable();
            if (string.IsNullOrWhiteSpace(spName)) throw new Exception("SP Name not found - AppRepository.cs - GetTable");
            using (var context = new CloudDbContext())
            {
                var conn = context.Database.Connection;
                var connectionState = conn.State;
                try
                {
                    if (connectionState != ConnectionState.Open) conn.Open();
                    using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = spName;
                        cmd.CommandType = CommandType.StoredProcedure;
                        cmd.CommandTimeout = 360;
                        foreach (REPORTS_PARAMS p in lstparams)
                        {
                            cmd.Parameters.Add(new SqlParameter("@" + p.PARAM_NAME, p.PARAM_VALUE));
                        }

                        using (var reader = cmd.ExecuteReader())
                        {
                            dt.Load(reader);
                        }
                    }
                }
                catch (Exception ex)
                {
                    // error handling
                    throw;
                }
                finally
                {
                    if (connectionState != ConnectionState.Closed) conn.Close();
                }
                return dt;
            }

        }

        public IEnumerable<StaffingSummary> GetStaffingSummaryDetails(string custId, string ProjectId = null)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@CustId", custId);
            // SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId?? string.Empty);
            var staffSummaryDetails = context.Database.SqlQuery<StaffingSummary>("[dbo].[usp_get_BAS_Staff_Summary] @CustId ", param1).ToList();
            return staffSummaryDetails;
        }

        public IEnumerable<StaffingSummaryForAllCustomers> GetStaffingSummaryDetailsForAllCustomers()
        {
            var context = new CloudDbContext();
            var staffSummaryDetails = context.Database.SqlQuery<StaffingSummaryForAllCustomers>("[dbo].[usp_get_BAS_Staff_Summary_For_AllCustomers]").ToList();
            return staffSummaryDetails;
        }

        public IEnumerable<CustomerProjectDetails> GetCustomerProjectDetails()
        {
            var context = new CloudDbContext();
            var staffSummaryDetails = context.Database.SqlQuery<CustomerProjectDetails>("[dbo].[usp_get_CustomerProjectDetails]").ToList();
            return staffSummaryDetails;
        }

        public IEnumerable<StaffingProject> GetStaffingProjectSummary(string custId, string ProjectId = null)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@CustId", custId);
            // SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId?? string.Empty);
            var staffProjectSummary = context.Database.SqlQuery<StaffingProject>("[dbo].[usp_get_BAS_Staff_Project_Summary] @CustId ", param1).ToList();
            return staffProjectSummary;
        }

        public IEnumerable<StaffingProject> GetStaffingProjectDetails(string projectId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@ProjId", projectId);
            // SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId?? string.Empty);
            var staffProjectDetail = context.Database.SqlQuery<StaffingProject>("[dbo].[usp_get_BAS_Staff_Project_Details] @ProjId ", param1).ToList();
            return staffProjectDetail;
        }
        public IEnumerable<StaffingSummary> GetStaffingAssignedProjects(string custId, string ProjectId = null)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@CustId", custId);
            // SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId?? string.Empty);
            var staffProjectDetail = context.Database.SqlQuery<StaffingSummary>("[dbo].[usp_get_BAS_Staff_Assigned_Projects] @CustId ", param1).ToList();
            return staffProjectDetail;
        }
        public IEnumerable<StaffingProject> GetStaffingAssignedProjectDetails(string projectId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@ProjId", projectId);
            // SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId?? string.Empty);
            var staffProjectDetail = context.Database.SqlQuery<StaffingProject>("[dbo].[usp_get_BAS_Staff_Assigned_ProjectDetails] @ProjId ", param1).ToList();
            return staffProjectDetail;
        }
        public IEnumerable<ProjectTask> GetProjectTasks(string taskId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@taskId", taskId);
            var projTaks = context.Database.SqlQuery<ProjectTask>("[dbo].[usp_get_Proj_Tasks] @taskId ", param1).ToList();
            return projTaks;
        }

        public void InsertProjectResource(string EmpId, string ProjectId, bool IsBillable, Decimal AllctPct, string CurrIndc, string CreatedBy, DateTime StartDate, DateTime EndDate)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@IsBillable", IsBillable);
            SqlParameter param4 = new SqlParameter("@AllctPct", AllctPct);
            SqlParameter param5 = new SqlParameter("@CurrIndc", CurrIndc);
            SqlParameter param6 = new SqlParameter("@CreatedBy", CreatedBy);
            SqlParameter param7 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param8 = new SqlParameter("@EndDate", EndDate);

            var QueryResult = context.Database.SqlQuery<string>("[dbo].[usp_insert_project_resource] @EmpId, @ProjectId, @IsBillable, @AllctPct, @CurrIndc, @CreatedBy,@StartDate,@EndDate ", param1, param2, param3, param4, param5, param6, param7, param8).ToList();
        }
        public IEnumerable<Token> Token(string EmailId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmailId", EmailId);
            var TemplateDetails = context.Database.SqlQuery<Token>("[dbo].[usp_get_token] @EmailId ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<Projects> Projects(string EmpId, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<Projects>("[dbo].[usp_get_project] @EmpId, @ProjectId ", param1, param2).ToList();
            return TemplateDetails;
        }
        public IEnumerable<ProjectsBaseCustomer> GetEmployeeAccounts(string EmpId, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<ProjectsBaseCustomer>("[dbo].[usp_get_project_new] @EmpId, @ProjectId ", param1, param2).ToList();
            return TemplateDetails;
        }
        public IEnumerable<ProjectBase> GetProjectIdsForUser(string empId, string customerId, string projectId)
        {
            //using (var context = new CloudDbContext() )
            {
                SqlParameter param1 = new SqlParameter("@EmpId", empId);
                SqlParameter param2 = new SqlParameter("@CustomerId", customerId);
                SqlParameter param3 = new SqlParameter("@ProjectId", projectId);
                return _cloudDBContext.Database.SqlQuery<ProjectBase>("[dbo].[usp_get_projectIds] @EmpId, @CustomerId, @ProjectId ", param1, param2, param3).ToList();
            }



        }


        public IEnumerable<CustomerProjectIds> CustomerProjectIds(string EmpId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            var TemplateDetails = context.Database.SqlQuery<CustomerProjectIds>("[dbo].[usp_get_customerprojectids] @EmpId ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<Projects> ProjectsWithBillingProj(string EmpId, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<Projects>("[dbo].[usp_get_project_withBillingProj] @EmpId, @ProjectId ", param1, param2).ToList();
            return TemplateDetails;
        }
        public IEnumerable<Projects> CustomerProjects(string EmailId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EMAILID", EmailId);
            var TemplateDetails = context.Database.SqlQuery<Projects>("[dbo].[usp_get_project_cspcustomer] @EMAILID ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<ProjectResourceByEmpId> ProjectResourceByEmpId(string EmpId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            var TemplateDetails = context.Database.SqlQuery<ProjectResourceByEmpId>("[dbo].[csp_get_ProjectResourceByEmpid] @EmpId ", param1).ToList();
            return TemplateDetails;
        }

        public IEnumerable<ProjectResourceByEmpId> ProjectResourceByProjId(string ProjId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@ProjId", ProjId);
            var TemplateDetails = context.Database.SqlQuery<ProjectResourceByEmpId>("[dbo].[csp_get_ProjectResourceByProjId] @ProjId ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<Projects> ProjectList(string CustomerId, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            SqlParameter param1 = new SqlParameter("@ClientID", CustomerId);
            SqlParameter param2 = new SqlParameter("@ProjectID", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<Projects>("[dbo].[usp_get_project_List] @ClientID, @ProjectId ", param1, param2).ToList();

            return TemplateDetails;

        }
        public IEnumerable<ProjectDetails> ProjectDetails(string EmpId, string ProjectId, string Category)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            if (Category == null)
                Category = "";

            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param2 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param3 = new SqlParameter("@Category", Category);
            var TemplateDetails = context.Database.SqlQuery<ProjectDetails>("[dbo].[usp_get_ProjectDetails] @ProjectId, @EmpId, @Category ", param1, param2, param3).ToList();
            return TemplateDetails;
        }
        public IEnumerable<ReportingDetails> ReportingDetails(string EmpId, string ProjectId, string Category)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";
            if (Category == null)
                Category = "";

            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param2 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param3 = new SqlParameter("@Category", Category);
            var TemplateDetails = context.Database.SqlQuery<ReportingDetails>("[dbo].[usp_get_ProjectDetails] @ProjectId, @EmpId, @Category ", param1, param2, param3).ToList();
            return TemplateDetails;
        }
        public IEnumerable<EMP_INFO> ResourceDetailsByManager(string EmpId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);

            var TemplateDetails = context.Database.SqlQuery<EMP_INFO>("[dbo].[csp_get_ResourceDetailsByManager] @EmpId ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<TimesheetDatewise> TimesheetDatewise(DateTime StartDate, DateTime EndDate, string EmpId, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";

            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@StartDate", StartDate.ToString());
            SqlParameter param3 = new SqlParameter("@EndDate", EndDate.ToString());
            SqlParameter param4 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<TimesheetDatewise>("[dbo].[usp_get_MytimesheetDatewise] @EmpId, @StartDate, @EndDate, @ProjectId ", param1, param2, param3, param4).ToList();
            return TemplateDetails;
        }
        public IEnumerable<TimesheetDetails> TimesheetDetails(DateTime StartDate, DateTime EndDate, string EmpId, string Category, string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";

            SqlParameter param1 = new SqlParameter("@StartDate", StartDate.ToString());
            SqlParameter param2 = new SqlParameter("@EndDate", EndDate.ToString());
            SqlParameter param3 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param4 = new SqlParameter("@Category", Category);
            SqlParameter param5 = new SqlParameter("@ProjectId", ProjectId);


            var TemplateDetails = context.Database.SqlQuery<TimesheetDetails>("[dbo].[usp_get_Timesheet_Details] @StartDate, @EndDate, @EmpId, @Category, @ProjectId ", param1, param2, param3, param4, param5).ToList();
            return TemplateDetails;
        }

        //public IEnumerable<TimesheetDetailsMonthly> TimesheetDetailsMonthly(string EmpId, string ProjId, string BillingProjId, int Month, int Year)
        public IEnumerable<TimesheetDetailsMonthly> TimesheetDetailsMonthly(string EmpId, string ProjId, string BillingProjId, DateTime StartDate, DateTime EndDate)
        {
            var context = new CloudDbContext();
            if (ProjId == null)
                ProjId = "";

            SqlParameter param1 = new SqlParameter("@EMPID", EmpId);
            SqlParameter param2 = new SqlParameter("@PROJID", ProjId);
            SqlParameter param3 = new SqlParameter("@BILLINGPROJID", BillingProjId);
            SqlParameter param4 = new SqlParameter("@STARTDATE", StartDate);
            SqlParameter param5 = new SqlParameter("@ENDDATE", EndDate);

            var TemplateDetails = context.Database.SqlQuery<TimesheetDetailsMonthly>("[dbo].[usp_get_Timesheet_Details_Monthly_Emp] @EMPID, @PROJID, @BILLINGPROJID, @STARTDATE, @ENDDATE ", param1, param2, param3, param4, param5).ToList();
            return TemplateDetails;
        }

        public IEnumerable<PROJECT_RESOURCE> TimeSheetTaggedProject(DateTime StartDate, DateTime EndDate, string empid)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@startdatefromdd", StartDate);
            SqlParameter param2 = new SqlParameter("@enddatefromdd", EndDate);
            SqlParameter param3 = new SqlParameter("@empid", empid);

            var TemplateDetails = context.Database.SqlQuery<PROJECT_RESOURCE>("[dbo].[spGetTimeSheetTaggedProject] @startdatefromdd, @enddatefromdd,@empid", param1, param2, param3).ToList();
            return TemplateDetails;
        }


        public IEnumerable<PROJECT_RESOURCE> TimeSheetTaggedProjectByProjId(DateTime StartDate, DateTime EndDate, DateTime empStartDate, DateTime empEndDate, string projectid)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@startdatefromdd", StartDate);
            SqlParameter param2 = new SqlParameter("@enddatefromdd", EndDate);
            //SqlParameter param3 = new SqlParameter("@projectid", projectid);
            //SqlParameter param4 = new SqlParameter("@empid", empid);
            SqlParameter param3 = new SqlParameter("@empStartDate", empStartDate);
            SqlParameter param4 = new SqlParameter("@empEndDate", empEndDate);
            SqlParameter param5 = new SqlParameter("@projectid", projectid);

            //var TemplateDetails = context.Database.SqlQuery<PROJECT_RESOURCE>("[dbo].[spGetTimeSheetTaggedProjectForTeamPMO] @startdatefromdd, @enddatefromdd,@projectid,@empid,@empStartDate,@empEndDate", param1, param2, param3,param4,param5,param6).ToList();
            var TemplateDetails = context.Database.SqlQuery<PROJECT_RESOURCE>("[dbo].[spGetTimeSheetTaggedProjectForTeamPMO] @startdatefromdd, @enddatefromdd,@empStartDate,@empEndDate,@projectid", param1, param2, param3, param4, param5).ToList();
            return TemplateDetails;
        }


        public IEnumerable<PROJECT_RESOURCE> CheckIfResourceAlreadyAllocatedWithinSameTimeRange(DateTime StartDate, DateTime EndDate, string projectid, string empid)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@startdate", StartDate);
            SqlParameter param2 = new SqlParameter("@enddate", EndDate);
            SqlParameter param3 = new SqlParameter("@projectid", projectid);
            SqlParameter param4 = new SqlParameter("@empid", empid);
            var TemplateDetails = context.Database.SqlQuery<PROJECT_RESOURCE>("[dbo].[spCheckIfResourceAlreadyInWithinSameTimeRange] @startdate, @enddate,@projectid,@empid", param1, param2, param3, param4).ToList();
            return TemplateDetails;
        }


        public IEnumerable<TimesheetWeekly> TimesheetWeekly(string EmpId, int DateId, int TaskYear)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@DateId", DateId);
            SqlParameter param2 = new SqlParameter("@TaskYear", TaskYear);
            SqlParameter param3 = new SqlParameter("@EmpId", EmpId);

            var TemplateDetails = context.Database.SqlQuery<TimesheetWeekly>("[dbo].[usp_get_Mytimesheet] @DateId, @TaskYear, @EmpId ", param1, param2, param3).ToList();
            return TemplateDetails;
        }
        public IEnumerable<TeamTimesheetDetails> TeamTimesheetDetails(string EmpId, string ProjectId, int DateId, int ResourceId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";

            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@DateId", DateId);
            SqlParameter param4 = new SqlParameter("@ResourceId", ResourceId);

            var TemplateDetails = context.Database.SqlQuery<TeamTimesheetDetails>("[dbo].[usp_get_MyTeamTimesheet] @EmpId, @ProjectId, @DateId, @ResourceId ", param1, param2, param3, param4).ToList();
            return TemplateDetails;
        }

        public IEnumerable<ResourceDetails> ResourceDetails(string EmpId, string ProjectId, string ManagerId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";

            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param2 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param3 = new SqlParameter("@ManagerId", ManagerId);
            var TemplateDetails = context.Database.SqlQuery<ResourceDetails>("[dbo].[usp_get_all_Resource] @ProjectId, @EmpId, @ManagerId ", param1, param2, param3).ToList();
            return TemplateDetails;
        }

        public IEnumerable<Resource> ResourceCount(string ProjectId)
        {
            var context = new CloudDbContext();
            if (ProjectId == null)
                ProjectId = "";

            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<Resource>("[dbo].[csp_get_ProjectResource] @ProjectId ", param1).ToList();
            return TemplateDetails;
        }

        public IEnumerable<UserInfo> UserInfo(string EmailId)
        {
            var context = new CloudDbContext();

            SqlParameter param1 = new SqlParameter("@Email", EmailId);
            var TemplateDetails = context.Database.SqlQuery<UserInfo>("[dbo].[usp_get_UserInfo] @email ", param1).ToList();
            return TemplateDetails;
        }
        public IEnumerable<EMP_INFO> GetAuditorDetails()
        {
            var context = new CloudDbContext();
            var TemplateDetails = context.Database.SqlQuery<EMP_INFO>("[dbo].[getAuditorDetails]").ToList<EMP_INFO>();
            return TemplateDetails;
        }

        public IEnumerable<EMP_INFO> GetAuditeeDetails(string ProjectId, string CustomerId, bool inlcudeCustomer)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param2 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param3 = new SqlParameter("@INCLUDECUSTOMER", inlcudeCustomer);
            var TemplateDetails = context.Database.SqlQuery<EMP_INFO>("[dbo].[getauditeesdetails] @PROJECT_ID,@CUSTOMER_ID, @INCLUDECUSTOMER", param1, param2, param3).ToList<EMP_INFO>();
            return TemplateDetails;
        }


        public IEnumerable<EMP_INFO> GetAuditorDetailsByCertifiedStandards(string CustomerId, string ProjectId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@custid", CustomerId);
            SqlParameter param2 = new SqlParameter("@projid", ProjectId);
            var TemplateDetails = context.Database.SqlQuery<EMP_INFO>("[dbo].[getAuditorDetailsByCertifiedStandards] @custid, @projid", param1, param2).ToList();
            return TemplateDetails;
        }

        public DateTime GetOldestTimesheetdateAvailableforApproval(string customerid)
        {
            DateTime oldesttimesheetdate;
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@CustId", customerid);
            var TemplateDetails = context.Database.SqlQuery<DateTime>("[dbo].[usp_get_oldestTimesheetAvailableForApproval] @CustId", param1).SingleOrDefault();
            if (DateTime.TryParse(TemplateDetails.ToString(), out oldesttimesheetdate))
                return oldesttimesheetdate;
            else
                return DateTime.Today.AddDays(-7);
        }

        public bool UpdateProjectAliasName(string projectid, string projectaliasname)
        {
            bool oldesttimesheetdate = false;
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@projectid", projectid);
            SqlParameter param2 = new SqlParameter("@projectaliasname", projectaliasname);
            var TemplateDetails = context.Database.SqlQuery<string>("[dbo].[usp_update_ProjectAliasName] @projectid,@projectaliasname", param1, param2).SingleOrDefault();
            if (bool.TryParse(TemplateDetails.ToString(), out oldesttimesheetdate))
                return oldesttimesheetdate;
            else
                return oldesttimesheetdate;
        }

        public IEnumerable<EMP_INFO_FOR_CUSTOMER> RemainderEmail(DateTime StartDate, DateTime EndDate, string CustomerId, string projectId)
        {
            SqlParameter param1 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param2 = new SqlParameter("@EndDate", EndDate);
            SqlParameter param3 = new SqlParameter("@CustomerId", CustomerId);
            SqlParameter param4 = new SqlParameter("@projectId", projectId);
            var context = new CloudDbContext();
            var TemplateDetails = context.Database.SqlQuery<EMP_INFO_FOR_CUSTOMER>("[dbo].[TimesheetReminderBulkEmail] @StartDate, @EndDate, @CustomerId, @projectId", param1, param2, param3, param4).ToList();
            return TemplateDetails;
        }

        public IEnumerable<EMP_RISK_ADD_SEND_EMAIL> AddRiskEmail()
        {
            var context = new CloudDbContext();
            var TemplateDetails = context.Database.SqlQuery<EMP_RISK_ADD_SEND_EMAIL>("[dbo].[Add_Risk_Send_Email]").ToList();
            return TemplateDetails;
        }

        public EMP_INFO_DETAILED GetEmployeeById(string EmpId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@EmpId", EmpId);
            var employee = context.Database.SqlQuery<EMP_INFO_DETAILED>("[dbo].[get_EmployeeById] @EmpId ", param1).FirstOrDefault();
            return employee;
        }


        public void MigrateProjectData(string oldProjectId, string newProjectId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@oldval";
            param1.Value = oldProjectId;
            param1.SqlDbType = SqlDbType.VarChar;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@newval";
            param2.Value = newProjectId;
            param2.SqlDbType = SqlDbType.VarChar;

            //param1.TypeName = "dbo.usp_Migrate_project_data";
            //param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_Migrate_project_data] @oldval, @newval", param1, param2).ToList();
        }

        public List<EMP_INFO> GetEmpIdsForAccount(string custId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@custId", custId);
            var employees = context.Database.SqlQuery<EMP_INFO>("[dbo].[getEmpIdsForAccount] @custId", param1).ToList();
            return employees;
        }

        public List<CUST_EMP_INFO> GetEmpIdsForCustomerAccount(string customerId)
        {
            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@custId", customerId);
            var employees = context.Database.SqlQuery<CUST_EMP_INFO>("[dbo].[GetEmpIdsForCustomerAccount] @custId", param1).ToList();
            return employees;
        }



        public List<MandatoryTrainingReport> GetMandatoryTrainingDetails(DateTime starDate, DateTime endDate, string custId, string projIds)
        {
            if (projIds == null)
                projIds = "";

            var context = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@startdate", starDate);
            SqlParameter param2 = new SqlParameter("@enddate", endDate);
            SqlParameter param3 = new SqlParameter("@customerid", custId);
            SqlParameter param4 = new SqlParameter("@projectid", projIds);

            var report = context.Database.SqlQuery<MandatoryTrainingReport>("[dbo].[getMandatoryTrainingComplianceReport] @startdate, @enddate, @customerid, @projectid", param1, param2, param3, param4).ToList();
            return report;

        }

        public List<CustomerBase> GetAllAccounts()
        {
            var context = new CloudDbContext();
            var accounts = context.Database.SqlQuery<CustomerBase>("[dbo].[getAllAccounts]").ToList();
            return accounts;
        }

        public List<PortfolioDetails> GetPortfolioDetails()

        {
            var dbContext = new CloudDbContext();
            var portfolioDetails = dbContext.Database.SqlQuery<PortfolioDetails>("[dbo].[usp_GetPortfolioTitle]").ToList();
            return portfolioDetails;

        }

        public List<GetCAPAStage> getCAPAStages(string detailIds)

        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@detailIds", detailIds);
            var capastageId = dbContext.Database.SqlQuery<GetCAPAStage>("[dbo].[getCAPAStageID] @detailIds", param1).ToList();
            return capastageId;
        }

        public List<CONFIGEXTDETAILS> GetConfigExtDetails()
        {
            var dbContext = new CloudDbContext();
            var configextdetails = dbContext.Database.SqlQuery<CONFIGEXTDETAILS>("[dbo].[getConfigExtDetails]").ToList();
            return configextdetails;
        }

        public List<AuditorQualityStandardSummary> GetAuditorQualifiedStandardSummary()
        {
            var dbContext = new CloudDbContext();
            var auditorQualityStandardDetails = dbContext.Database.SqlQuery<AuditorQualityStandardSummary>("[dbo].[getAuditQualityStandards]").ToList();
            return auditorQualityStandardDetails;
        }

        public List<ProductResponsibleDetails> GetProductResponsibleDetails(int productId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@productId", productId);
            var productResponsibleList = dbContext.Database.SqlQuery<ProductResponsibleDetails>("[dbo].[getProductResponsibleList] @productId", param1).ToList();
            return productResponsibleList;
        }

        public List<EmployeeListfromCustomer> GetEmployeeDetailsfromCustomer(string customerId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            var productResponsibleList = dbContext.Database.SqlQuery<EmployeeListfromCustomer>("[dbo].[getEmployeeListfromCustomer] @customerId", param1).ToList();
            return productResponsibleList;
        }

        public ProjectHeads GetProjectMembersByProject(string projectId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@projectId", projectId);
            var projectpeople = dbContext.Database.SqlQuery<ProjectHeads>("[dbo].[GetProjectMembersByProject] @projectId", param1).FirstOrDefault();
            return projectpeople;
        }

        public List<GetOverallRiskForRiskDashboard> GetOverallRisksForRiskDashboard(DateTime? startDate, DateTime? endDate, string custId, string riskStatus, string projIds, string businessUnits)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate.HasValue ? (object)startDate : DBNull.Value);
            SqlParameter param2 = new SqlParameter("@endDate", endDate.HasValue ? (object)endDate : DBNull.Value);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            SqlParameter param4 = new SqlParameter("@riskStatus", riskStatus);
            SqlParameter param5 = new SqlParameter("@projIds", projIds);
            SqlParameter param6 = new SqlParameter("@businessUnits", businessUnits);
            var overallRisk = dbContext.Database.SqlQuery<GetOverallRiskForRiskDashboard>("[dbo].[getOverallRisksForRiskDashboard] @startDate,@endDate,@custIds,@riskStatus,@projIds,@businessUnits", param1, param2, param3, param4, param5, param6).ToList();
            return overallRisk;
        }

        public List<ProductPortfolioDetails> GetProductByPortfolioId(string custId, int? portId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param2 = new SqlParameter("@custid", custId);
            SqlParameter param1 = new SqlParameter("@portfolio", portId.HasValue ? (object)portId.Value : DBNull.Value);
            var productPortfolioDetails = dbContext.Database.SqlQuery<ProductPortfolioDetails>("[dbo].[getProductsbyPorfolio] @portfolio , @custid", param1, param2).ToList();
            return productPortfolioDetails;
        }
        public List<RiskRepository> GetAllRiskFromRepository(string customerId, string projectId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@projectId", projectId);
            var riskDetails = dbContext.Database.SqlQuery<RiskRepository>("[dbo].[getAllRiskFromRepository] @customerId , @projectId", param1, param2).ToList();
            return riskDetails;
        }
        public List<ProcessModelReference> GetAllProcessModelReferenceList()
        {
            var dbContext = new CloudDbContext();
            var processModelReferenceList = dbContext.Database.SqlQuery<ProcessModelReference>("[dbo].[getProcessModelReferences]").ToList();
            return processModelReferenceList;
        }
        public List<KPIMasterList> GetAllKPIList()
        {
            var dbContext = new CloudDbContext();
            var kpiList = dbContext.Database.SqlQuery<KPIMasterList>("[dbo].[getAllMasterKPIs]").ToList();
            return kpiList;
        }
        public List<ProjectCertificationScopes> GetProjectCertificationScopes()
        {
            var dbContext = new CloudDbContext();
            var projectCertificationScopesList = dbContext.Database.SqlQuery<ProjectCertificationScopes>("[dbo].[getProjectCertificationScopes]").ToList();
            return projectCertificationScopesList;
        }
        public List<OverallTaskDetails> getOverallTaskDetails(DateTime StartDate, DateTime EndDate, string customerId, string projectId, string taskCategory)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", EndDate);
            SqlParameter param3 = new SqlParameter("@CUSTOMER_ID", customerId);
            SqlParameter param4 = new SqlParameter("@PROJECT_ID", projectId);
            SqlParameter param5 = new SqlParameter("@TASK_CATEGORY", taskCategory);
            var overallTaskDetailsList = dbContext.Database.SqlQuery<OverallTaskDetails>("[dbo].[getOverallTaskDetails] @START_DATE, @END_DATE, @CUSTOMER_ID, @PROJECT_ID, @TASK_CATEGORY", param1, param2, param3, param4, param5).ToList();
            return overallTaskDetailsList;
        }
        public List<OpenFindingsCount> getOpenFindingsCount(string auditIds)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@auditIds", auditIds);
            var openFindings = dbContext.Database.SqlQuery<OpenFindingsCount>("[dbo].[getOpenFindingsForEachAudit] @auditIds", param1).ToList();
            return openFindings;
        }
        public List<GetSimilarIdeas> getSimilarIdeas(string description)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@description", description);
            var similarIdeasList = dbContext.Database.SqlQuery<GetSimilarIdeas>("[dbo].[getSimilarIdeas] @description", param1).ToList();
            return similarIdeasList;
        }
        public List<OverallKPIList> GetOverallKPIList()
        {
            var dbContext = new CloudDbContext();
            var kpiList = dbContext.Database.SqlQuery<OverallKPIList>("[dbo].[getOverallKPIList]").ToList();
            return kpiList;
        }

        public List<ScpConfiguration> getSCPConfigurationValues()
        {
            var dbContext = new CloudDbContext();
            var scpList = dbContext.Database.SqlQuery<ScpConfiguration>("[dbo].[getSCPConfigurationValues]").ToList();
            return scpList;
        }
        public List<Model.CSP.CUSTOMER_PROJECTS> getProductMappedCSATProjects()
        {
            var dbContext = new CloudDbContext();
            var csatProjects = dbContext.Database.SqlQuery<Model.CSP.CUSTOMER_PROJECTS>("[dbo].[getProductMappedCSATProjects]").ToList();
            return csatProjects;
        }
        public int? getQuestionModelId(string projectId, int batchId, string emailId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@projectId", projectId);
            SqlParameter param2 = new SqlParameter("@batchId", batchId);
            SqlParameter param3 = new SqlParameter("@emailid", emailId);
            var questionModelId = dbContext.Database.SqlQuery<GET_QUESTION_MODEL>("[dbo].[getCSATQuestionModel] @projectId, @batchId, @emailid", param1, param2, param3).FirstOrDefault()?.QUESTION_MODEL_ID;
            return questionModelId;
        }
        public List<CSS_Readiness_Info> getCSS_Readiness_Info(DateTime startDate, DateTime endDate)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@STARTDATE", startDate);
            SqlParameter param2 = new SqlParameter("@ENDDATE", endDate);
            var result = dbContext.Database.SqlQuery<CSS_Readiness_Info>("[dbo].[CSS_Readiness_Report] @STARTDATE, @ENDDATE", param1, param2).ToList();
            return result;
        }
        public List<CUSTOMER_CONTACTS> GetCustomerContactsForAccount(string custId)
        {
            var dbContext = new CloudDbContext();
            SqlParameter param1 = new SqlParameter("@custId", custId);
           
            var result = dbContext.Database.SqlQuery<CUSTOMER_CONTACTS>("[dbo].[usp_getContactsForAccount] @custId", param1 ).ToList();
            return result;
        }

        //**********************************
        //I M P O R T A N T
        //**********************************
        //N O T E: Return ***TYPE*** from db should match the ***TYPE*** in model
        //**********************************
    }
}
