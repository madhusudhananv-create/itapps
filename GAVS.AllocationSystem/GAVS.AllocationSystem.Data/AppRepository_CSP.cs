using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.AllSys.Tables;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.Tables;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Dynamic;
using System.Linq;
using System.Reflection;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace GAVS.AllocationSystem.Data
{
    public class AppRepository_CSP : EFRepository_CSP<MetaData>, IAppRepository_CSP
    {
        public AppRepository_CSP(DbContext dbContext) : base(dbContext) { }
        public IEnumerable<PROJECT_CSAT_DATA> GetCSSTable(string YearQuarter)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@YEAR_QUARTER", YearQuarter);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_CSAT_DATA>("[dbo].[getCSSTable] @YEAR_QUARTER ", param1).ToList();

            return TemplateDetails;
        }

        public IEnumerable<PROJECT_CUSTOMER_NPS_DATA> GetCSSTable(string YearQuarter, string pQuarter, string cQuarter, string custIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@YEAR_QUARTER", YearQuarter);
            SqlParameter param2 = new SqlParameter("@pQUARTER", pQuarter);
            SqlParameter param3 = new SqlParameter("@cQuarter", cQuarter);
            SqlParameter param4;
            if (custIds != null && custIds != "undefined")
                param4 = new SqlParameter("@custIds", custIds);
            else
                param4 = new SqlParameter("@custIds", "0");

            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_CUSTOMER_NPS_DATA>("[dbo].[getCSSTable] @YEAR_QUARTER, @pQUARTER,@cQuarter,@custIds", param1, param2, param3, param4).ToList();

            return TemplateDetails;
        }


        public IEnumerable<CRISP_RAG_SUMMARY> getCrispRagSummary()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CRISP_RAG_SUMMARY>("[dbo].[getCRISP_RAG_summary]").ToList();
            return TemplateDetails;
        }

        public IEnumerable<CRISP_RAG_SUMMARY> dashboard_getCrispRagSummary(DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@STARTDATE", StartDate);
            SqlParameter param2 = new SqlParameter("@ENDDATE", EndDate);
            var TemplateDetails = dbContext.Database.SqlQuery<CRISP_RAG_SUMMARY>("[dbo].[dashboard_getCRISP_RAG_summary] @STARTDATE, @ENDDATE ", param1, param2).ToList();
            return TemplateDetails;
        }
        public IEnumerable<CRISP_CATEGORY_RAG_SUMMARY> getCrispCategoryRagSummary()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CRISP_CATEGORY_RAG_SUMMARY>("[dbo].[get_CRISP_category_RAG_summary]").ToList();
            return TemplateDetails;
        }

        public List<ProjectStatusDetails> GetProjectStartAndEndDate()
        {
            var dbContext = new CSPDbContext();
            var projectstatus = dbContext.Database.SqlQuery<ProjectStatusDetails>("[dbo].[getProjectStartAndEndDate]").ToList();
            return projectstatus;
        }

        public List<Findings> GetAllFindingsByTime()
        {
            var dbContext = new CSPDbContext();
            var findingsbytime = dbContext.Database.SqlQuery<Findings>("[dbo].[getAllFindingsByTimeforCustomer]").ToList();
            return findingsbytime;
        }

        public List<FindingsByTime> GetAllFindingByTimeCustomerWise(string custId, string projIds)
        {
            var dbContext = new CSPDbContext();
            var param1 = new SqlParameter("@custId", custId);
            var param2 = new SqlParameter("@projIds", projIds);
            var findingsByTime = dbContext.Database.SqlQuery<FindingsByTime>("[dbo].[getMonthlyFindingsByTime] @custId,@projIds", param1, param2).ToList();
            return findingsByTime;
        }

        public List<Findings> GetAllFindingsByType()
        {
            var dbContext = new CSPDbContext();
            var findingsbytime = dbContext.Database.SqlQuery<Findings>("[dbo].[getAllFindingsByTypeforCustomer]").ToList();
            return findingsbytime;
        }

        public List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> GetAllAuditRows()
        {
            var dbContext = new CSPDbContext();
            var auditrows = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED>("[dbo].[getallauditrows]").ToList();
            return auditrows;
        }

        public List<TASK_EXTENDED> GetAllAssessments(string CustId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", CustId);
            SqlParameter param2 = new SqlParameter("@startdate", StartDate);
            SqlParameter param3 = new SqlParameter("@enddate", EndDate);
            var assessmentrows = dbContext.Database.SqlQuery<TASK_EXTENDED>("[dbo].[getallassessment] @custid, @startdate, @enddate", param1, param2, param3).ToList();
            return assessmentrows;
        }

        public List<PROJECT_ISSUEEXT> GetAllIssuesForCustomer(string ProjIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJIDS", ProjIds);
            //  SqlParameter param2 = new SqlParameter("@empid", EmpId);
            //  SqlParameter param3 = new SqlParameter("@allproj", AllProj);
            var allIssues = dbContext.Database.SqlQuery<PROJECT_ISSUEEXT>("[dbo].[getIssuesByCustomerId] @PROJIDS", param1).ToList();
            return allIssues;
        }

        public List<FindingsForCustomer> GetAllFindingsForCustomer(string custid, string startdate, string enddate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", custid);
            SqlParameter param2 = new SqlParameter("@startdate", startdate);
            SqlParameter param3 = new SqlParameter("@enddate", enddate);

            var findings = dbContext.Database.SqlQuery<FindingsForCustomer>("[dbo].[getAllFindingsForCustomer] @custid, @startdate,@enddate", param1, param2, param3).ToList();
            return findings;
        }

        public string GetPortfolioName(string ProjId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjId", ProjId);
            string title = DbContext.Database.SqlQuery<string>("[dbo].[getPortfolioNamefromProjId] @ProjId", param1).FirstOrDefault();
            return title;
        }

        public List<ProjectStatusViewDetails> GetProjectStartAndEndDateForViewDetails()
        {
            var dbContext = new CSPDbContext();
            var projectstatus = dbContext.Database.SqlQuery<ProjectStatusViewDetails>("[dbo].[getProjectStartAndEndDateForViewDetails]").ToList();
            return projectstatus;
        }

        public IEnumerable<CSAT_SURVEY_DATA> getCSSResponseSummary(int Year)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@YEAR", Year);
            var TemplateDetails = dbContext.Database.SqlQuery<CSAT_SURVEY_DATA>("[dbo].[getCSSResponseSummary] @YEAR ", param1).ToList();

            return TemplateDetails;
        }
        public IEnumerable<CSAT_INITIATED_SUMMARY> getCSSInitiatedSummary()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CSAT_INITIATED_SUMMARY>("[dbo].[getCSS_initiated_summary]").ToList();

            return TemplateDetails;
        }
        public IEnumerable<CSAT_RECEIVED_SUMMARY> getCSSReceivedSummary()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CSAT_RECEIVED_SUMMARY>("[dbo].[getCSS_received_summary]").ToList();

            return TemplateDetails;
        }
        public IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> getCustomerProjectPorfolioList(DateTime startDate, string customerId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@customerId", customerId);
            var TemplateDetails = dbContext.Database.SqlQuery<CUSTOMER_PROJECT_PORTFOLIO>("[dbo].[getCustomerProjectPortfolioList] @startDate, @customerID", param1, param2).ToList();
            return TemplateDetails;
        }

        public List<PROJECT_ISSUEEXT> GetOpenEscalationsByDate(string CustIds, DateTime StartDate, DateTime EndDate, string Status)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CustIds", CustIds);
            SqlParameter param2 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param3 = new SqlParameter("@EndDate", EndDate);
            SqlParameter param4 = new SqlParameter("@Status", Status);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_ISSUEEXT>("[dbo].[getOpenEscalationsForWeekByCustomer] @CustIds, @StartDate, @EndDate, @Status", param1, param2, param3, param4).ToList();
            return TemplateDetails;
        }
        public List<ActionItemsViewDetails> GetActionItemsStatus()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsViewDetails>("[dbo].[getActionItemsStatus]").ToList();
            return TemplateDetails;
        }

        public List<PlannedAudits> GetPlannedAudits(string Custid, string Projid)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", Custid);
            SqlParameter param2 = new SqlParameter("@projid", Projid);
            var TemplateDetails = dbContext.Database.SqlQuery<PlannedAudits>("[dbo].[getListofPlannedAudits] @custid, @projid", param1, param2).ToList();
            return TemplateDetails;
        }

        public List<ActionItemsViewDetails> GetActionItemsViewDetails(string ProjIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsViewDetails>("[dbo].[getActionItemsViewDetails] @ProjIds", param1).ToList();
            return TemplateDetails;
        }


        public List<PROJECT_ISSUEEXT> GetIssuesDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@EndDate", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_ISSUEEXT>("[dbo].[getIssuesForProjects] @startDate,@EndDate,@ProjIds", param1, param2, param3).ToList();
            return TemplateDetails;
        }
        public List<ContractStatusDetails> GetContractStatusDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@EndDate", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ContractStatusDetails>("[dbo].[getContractStatusForProjects]  @startDate,@EndDate,@ProjIds", param1, param2, param3).ToList();
            return TemplateDetails;
        }
        public List<PROJECT_RISK_EXT> GetRisksDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@EndDate", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_RISK_EXT>("[dbo].[getRisksForProjects]  @startDate,@EndDate,@ProjIds", param1, param2, param3).ToList();
            return TemplateDetails;
        }

        public List<ActionItemsViewDetails> GetActionitemsDetailsForProjects(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@EndDate", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsViewDetails>("[dbo].[getActionItemsForProjects]  @startDate,@EndDate,@ProjIds", param1, param2, param3).ToList();
            return TemplateDetails;
        }

        public List<PROJECT_BEST_PRACTICES_EXT> GetAllBestPracticesForCustomer(string ProjIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", ProjIds);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_BEST_PRACTICES_EXT>("[dbo].[getBestPracticesByCustomer] @ProjIds", param1).ToList();
            return TemplateDetails;
        }
        public List<OverAllData> GetOverAllIssuesData()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<OverAllData>("[dbo].[getOverAllIssuesData]").ToList();
            return TemplateDetails;
        }

        public List<OverAllData> GetOverAllRisksData()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<OverAllData>("[dbo].[getOverAllRisksData]").ToList();
            return TemplateDetails;
        }
        public IEnumerable<PROJECT_RISK_EXT> GetRiskDetailsByCustomerId(string projIds, bool allProj)
        {
            var context = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJIDS", projIds);

            SqlParameter param2 = new SqlParameter("@allproj", allProj);
            var riskDetails = context.Database.SqlQuery<PROJECT_RISK_EXT>("[dbo].[get_RiskDetailsByCustomerId] @PROJIDS, @allproj", param1, param2).ToList();
            return riskDetails;
        }
        public IEnumerable<TASK_DETAILS> getTaskDetailsByDateRange(DateTime StartDate, DateTime EndDate, string empId, string customerId, string projectId, string taskCategory, string range)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", EndDate);
            SqlParameter param3 = new SqlParameter("@EMP_ID", empId);
            SqlParameter param4 = new SqlParameter("@CUSTOMER_ID", customerId);
            SqlParameter param5 = new SqlParameter("@PROJECT_ID", projectId);
            SqlParameter param6 = new SqlParameter("@TASK_CATEGORY", taskCategory);
            SqlParameter param7 = new SqlParameter("@Range", range);
            var TemplateDetails = dbContext.Database.SqlQuery<TASK_DETAILS>("[dbo].[getTaskDetailsByDateRange] @START_DATE, @END_DATE, @EMP_ID, @CUSTOMER_ID, @PROJECT_ID, @TASK_CATEGORY, @Range", param1, param2, param3, param4, param5, param6, param7);
            return TemplateDetails;
        }
        public List<TasksEventsSummary> GetTasksEventsSummary(string customerId, string empId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerID", customerId);
            SqlParameter param2 = new SqlParameter("@empID", empId);
            var results = dbContext.Database.SqlQuery<TasksEventsSummary>("[dbo].[getTasksEventsSummary] @customerID, @empID  ", param1, param2).ToList();
            return results;
        }
        public List<TasksEventsDetails> GetTasksEventsDetails(string customerId, string empId, string projectId, int eventTypeId, string period)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerID", customerId);
            SqlParameter param2 = new SqlParameter("@projectID", projectId);
            SqlParameter param3 = new SqlParameter("@empID", empId);
            SqlParameter param4 = new SqlParameter("@eventTypeID", eventTypeId);
            SqlParameter param5 = new SqlParameter("@period", period);
            var results = dbContext.Database.SqlQuery<TasksEventsDetails>("[dbo].[getTasksEventsDetails] @customerID,@projectID, @empID,@eventTypeID,@period  ", param1, param2, param3, param4, param5).ToList();
            return results;
        }
        public IEnumerable<string> GetprojectsNameForAPortfolio(int PortfolioId, bool Projflag, string EmpId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PortfolioId", PortfolioId);
            SqlParameter param2 = new SqlParameter("@EmpId", EmpId);
            SqlParameter param3 = new SqlParameter("@Projflag", Projflag);
            var TemplateDetails = dbContext.Database.SqlQuery<string>("[dbo].[getAllprojectsNameForAPortfolio] @PortfolioId, @EmpId, @Projflag  ", param1, param2, param3);
            return TemplateDetails;
        }

        public List<CUSTOMER_PROJECT_PORTFOLIO> GetprojectsNameForAPortfolioNew(int portfolioId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PortfolioId", portfolioId);
            var TemplateDetails = dbContext.Database.SqlQuery<CUSTOMER_PROJECT_PORTFOLIO>("[dbo].[getAllProjectsNameForAPortfolioNew] @PortfolioId", param1).ToList();
            return TemplateDetails;
        }

        public string LastUpdatedDate(string ProjectId)
        {
            var dbContext = new CSPDbContext();
            var dateString = string.Empty;
            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = dbContext.Database.SqlQuery<DateTime>("[dbo].[usp_get_lastUpdatedDate] @ProjectId ", param1).ToList();
            if (TemplateDetails != null && TemplateDetails.Count > 0)
                dateString = TemplateDetails[0].ToString("dd-MMM-yyy hh:mm tt");
            else
                dateString = "Not updated";
            return dateString;
        }
        private void UpdateDB(DataTable records, string type)
        {
            string updatesp = "[dbo].[usp_update_tbl_" + type + "] ";
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo." + type + "_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>(updatesp + "@Table ", param1).ToList();
        }
        public bool UpdateTable<T>(IEnumerable<T> List, string type)
        {
            bool success = true;
            DataTable dt = ToDataTable(List.ToList());
            UpdateDB(dt, type);
            return success;
        }
        private DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Defining type of data column gives proper data table 
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }
        public void DeleteAccessControls(string Ids, string Delimiter)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Ids", Ids);
            SqlParameter param2 = new SqlParameter("@Delimiter", Delimiter);
            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_delete_AccessControls] @Ids, @Delimiter ", param1, param2).ToList();
        }


        public List<RisksIssuesForProject> GetRisksAndIssuesDetails()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<RisksIssuesForProject>("[dbo].[getRisksAndIssuesDetails]").ToList();

            return QueryResult;
        }

        public List<IdeasAndInnovationsData> GetIdeasAndInnovationsDetails()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<IdeasAndInnovationsData>("[dbo].[getIdeasAndInnovationsDetails]").ToList();

            return QueryResult;
        }

        public List<PROJECT_INNOVATIONEXT> GetAllIdeasDetails(string ProjIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJIDS", ProjIds);
            //SqlParameter param2 = new SqlParameter("@empid", Empid);
            //SqlParameter param3 = new SqlParameter("@allproj", Projflag);
            var QueryResult = dbContext.Database.SqlQuery<PROJECT_INNOVATIONEXT>("[dbo].[getIdeasByProjectId] @PROJIDS", param1).ToList();

            return QueryResult;
        }

        public void Insert_SQA_DATA_REPOSITORY(DataTable records)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.SQA_DATA_REPOSITORY_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[insert_tbl_SQA_DATA_REPOSITORY] @Table", param1).ToList();
        }

        public void Insert_DASHBOARD_DETAILS(DataTable records)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.DASHBOARD_DETAILS_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[insert_tbl_DASHBOARD_DETAILS] @Table", param1).ToList();
        }
        public void Delete_DASHBOARD_DETAILS(DataTable records)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@Table";
            param1.Value = records;
            param1.SqlDbType = SqlDbType.Structured;
            param1.TypeName = "dbo.DASHBOARD_DETAILS_TYPE";
            param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[delete_tbl_DASHBOARD_DETAILS] @Table", param1).ToList();
        }
        public IEnumerable<ProjectScope> ProjectScope(string ProjectId)
        {
            var dbContext = new CSPDbContext();
            if (ProjectId == null)
                ProjectId = "";
            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            var TemplateDetails = dbContext.Database.SqlQuery<ProjectScope>("[dbo].[usp_get_projectScope] @ProjectId ", param1).ToList();

            return TemplateDetails;
        }
        public IEnumerable<CustomerProjects> CustomerProjects()
        {
            var dbContext = new CSPDbContext();
            var TemplateDetails = dbContext.Database.SqlQuery<CustomerProjects>("[dbo].[usp_get_CustomerProjects]").ToList();
            return TemplateDetails;
        }
        public IEnumerable<ChartDataMonthly> GetChartDetails(string DateField, string xAxis, string yAxis, string Level1, string Level2, string xAxisType, string frequency, int reportId, DateTime startDate, DateTime endDate, string filtersXml)
        {
            if (Level1 == null)
                Level1 = string.Empty;
            if (Level2 == null)
                Level2 = string.Empty;
            var dbContext = new CSPDbContext();
            dbContext.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);
            SqlParameter param1 = new SqlParameter("@DATE_FIELD_NAME", DateField);
            SqlParameter param2 = new SqlParameter("@XAXIS_FIELD_NAME", xAxis);
            SqlParameter param3 = new SqlParameter("@YAXIS_FIELD_NAME", yAxis);
            SqlParameter param4 = new SqlParameter("@LEVEL1_FIELD_NAME", Level1);
            SqlParameter param5 = new SqlParameter("@LEVEL2_FIELD_NAME", Level2);
            SqlParameter param6 = new SqlParameter("@XAXIS_FIELD_TYPE", xAxisType);
            SqlParameter param7 = new SqlParameter("@FREQUENCY", frequency);
            SqlParameter param8 = new SqlParameter("@REPORTID", reportId);
            SqlParameter param9 = new SqlParameter("@STARTDATE", startDate.ToString("dd-MMM-yyy") + " 00:00");
            SqlParameter param10 = new SqlParameter("@ENDDATE", endDate.ToString("dd-MMM-yyy") + " 23:59");
            SqlParameter param11 = new SqlParameter("@FILTERSXML", filtersXml);

            dbContext.Database.CommandTimeout = 360;
            var QueryResult = dbContext.Database.SqlQuery<ChartDataMonthly>("[dbo].[usp_get_sqa_chartdetails] @DATE_FIELD_NAME, @XAXIS_FIELD_NAME, @YAXIS_FIELD_NAME, @LEVEL1_FIELD_NAME, @LEVEL2_FIELD_NAME, @XAXIS_FIELD_TYPE, @FREQUENCY, @REPORTID, @STARTDATE, @ENDDATE, @FILTERSXML ", param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11).ToList();
            return QueryResult;
        }
        public IEnumerable<MonthDetails> GetMonthDetails(DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@STARTDATE", startDate);
            SqlParameter param2 = new SqlParameter("@ENDDATE", endDate);

            var QueryResult = dbContext.Database.SqlQuery<MonthDetails>("[dbo].[usp_get_Month_Numbers] @STARTDATE, @ENDDATE ", param1, param2).ToList();
            return QueryResult;
        }
        public List<string> GetKPIForCRISP(string projId, DateTime period)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@PERIOD", period);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispkpi] @PROJECT_ID, @PERIOD ", param1, param2).ToList();
            return QueryResult;
        }

        public List<KpiTargetsBase> GetKPIForCRISPNew(string projId, DateTime period, bool isSowCommitment)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@projectid", projId);
            SqlParameter param2 = new SqlParameter("@period", period);
            SqlParameter param3 = new SqlParameter("@isSowCommitment", isSowCommitment);

            var QueryResult = dbContext.Database.SqlQuery<KpiTargetsBase>("[dbo].[getProjectKpiActualsForPeriod] @projectid, @period, @isSowCommitment ", param1, param2, param3).ToList();
            return QueryResult;
        }


        public string GetRiskForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrisprisk] @PROJECT_ID, @START_DATE, @END_DATE ", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }
        public string GetIssueForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispissues] @PROJECT_ID, @START_DATE, @END_DATE ", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }

        public string GetIdeasForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispideas] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }

        public string GetImprovementsForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispimprovements] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }

        public string GetConcernsForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispconcerns] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }
        public string GetCSATForCRISP(string projId, int month, int year)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@MONTH", month);
            SqlParameter param3 = new SqlParameter("@YEAR", year);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispcsat] @PROJECT_ID, @MONTH, @YEAR", param1, param2, param3).ToList();
            if (QueryResult != null || QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }
        public string GetMandatoryTrainingForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispmandatorycompliance] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null && QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }

        public string GetSecurityComplainceTrainingForCRISP(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getcrispsecuritycompliance] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null && QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }

        public string GetMandatoryAuditStatus(string projId, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            string result = "";
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", projId);
            SqlParameter param2 = new SqlParameter("@START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", EndDate);

            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[usp_getMandatoryAuditStatus] @PROJECT_ID, @START_DATE, @END_DATE", param1, param2, param3).ToList();
            if (QueryResult != null && QueryResult.Count > 0)
                result = QueryResult[0];
            return result;
        }


        public List<BESTPRACTICE_MATRIX> GetFilteredBestPractices(int referenceId, int deptId)
        {
            var dbContext = new CSPDbContext();
            BESTPRACTICE_MATRIX result = new BESTPRACTICE_MATRIX();
            SqlParameter param1 = new SqlParameter("@REFERENCE_ID", referenceId);
            SqlParameter param2 = new SqlParameter("@DEPT_ID", deptId);
            var QueryResult = dbContext.Database.SqlQuery<BESTPRACTICE_MATRIX>("[dbo].[usp_getbestpracticeswithdescription] @REFERENCE_ID ,@DEPT_ID", param1, param2).ToList<BESTPRACTICE_MATRIX>();
            if (QueryResult != null && QueryResult.Count > 0)
                result = QueryResult[0];
            return QueryResult;
        }
        public List<INNOVATIONS_MATRIX> GetFilteredIdeas(int referenceId, int deptId)
        {
            var dbContext = new CSPDbContext();
            INNOVATIONS_MATRIX result = new INNOVATIONS_MATRIX();
            SqlParameter param1 = new SqlParameter("@REFERENCE_ID", referenceId);
            SqlParameter param2 = new SqlParameter("@DEPT_ID", deptId);
            var QueryResult = dbContext.Database.SqlQuery<INNOVATIONS_MATRIX>("[dbo].[usp_getinnovationswithdescription] @REFERENCE_ID ,@DEPT_ID", param1, param2).ToList<INNOVATIONS_MATRIX>();
            if (QueryResult != null && QueryResult.Count > 0)
                result = QueryResult[0];
            return QueryResult;
        }
        public void AddCRISPDetails(string projId, string empId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@proj", projId);
            SqlParameter param2 = new SqlParameter("@emp_id", empId);
            var QueryResult = dbContext.Database.ExecuteSqlCommand("[dbo].[usp_add_crispProjectDetails] @proj, @emp_id", param1, param2);
        }
        public List<KPI_DETAILS_EXTENDED> GetKPIDetails(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@START_DATE", startDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var QueryResult = dbContext.Database.SqlQuery<KPI_DETAILS_EXTENDED>("[dbo].[getKPIDetails] @START_DATE,@END_DATE,@ProjIds ", param1, param2, param3).ToList<KPI_DETAILS_EXTENDED>();
            return QueryResult;
        }
        public List<CSSData> GetCSSTableForProjects(DateTime startDate, DateTime endDate, String ProjIds = "")
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@START_DATE", startDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", endDate);
            SqlParameter param3 = new SqlParameter("@ProjIds", ProjIds);
            var QueryResult = dbContext.Database.SqlQuery<CSSData>("[dbo].[getCSSTableForProjects] @START_DATE,@END_DATE,@ProjIds ", param1, param2, param3).ToList<CSSData>();
            return QueryResult;
        }
        public List<GlobalKPIData> GetGlobalKPIDetails(DateTime Startdate, DateTime Enddate, string GlobalKpis, string Customerids, string Projectids, string ServiceTowerIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Startdate", Startdate);
            SqlParameter param2 = new SqlParameter("@Enddate", Enddate);
            SqlParameter param3 = new SqlParameter("@GlobalKpis", GlobalKpis);
            SqlParameter param4 = new SqlParameter("@Customerids", Customerids);
            SqlParameter param5 = new SqlParameter("@Projectids", Projectids);
            SqlParameter param6 = new SqlParameter("@ServiceTowerIds", ServiceTowerIds);
            var QueryResult = dbContext.Database.SqlQuery<GlobalKPIData>("[dbo].[getKPIDataAcrossProjects] @Startdate, @Enddate, @GlobalKpis, @Customerids, @Projectids,@ServiceTowerIds", param1, param2, param3, param4, param5, param6).ToList();
            return QueryResult;
        }

        public List<GlobalKPIData> GetGlobalKPIDetailsNew(DateTime Startdate, DateTime Enddate, string GlobalKpis, string Customerids, string Projectids)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Startdate", Startdate);
            SqlParameter param2 = new SqlParameter("@Enddate", Enddate);
            SqlParameter param3 = new SqlParameter("@GlobalKpis", GlobalKpis);
            SqlParameter param4 = new SqlParameter("@Customerids", Customerids);
            SqlParameter param5 = new SqlParameter("@Projectids", Projectids);
            var QueryResult = dbContext.Database.SqlQuery<GlobalKPIData>("[dbo].[getKPIDataAcrossProjectsNew] @Startdate, @Enddate, @GlobalKpis, @Customerids, @Projectids", param1, param2, param3, param4, param5).ToList();
            return QueryResult;
        }
        public List<CRISPScores> GetCrispScores(DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@START_DATE", startDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", endDate);
            var QueryResult = dbContext.Database.SqlQuery<CRISPScores>("[dbo].[getCRISPScores] @START_DATE, @END_DATE ", param1, param2).ToList<CRISPScores>();
            return QueryResult;
        }
        public List<CRISPScores> GetCrispScoresForProject(string projId, DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param0 = new SqlParameter("@projId", projId);
            SqlParameter param1 = new SqlParameter("@START_DATE", startDate);
            SqlParameter param2 = new SqlParameter("@END_DATE", endDate);
            var QueryResult = dbContext.Database.SqlQuery<CRISPScores>("[dbo].[getCRISPScoresForProject] @projId, @START_DATE, @END_DATE ", param0, param1, param2).ToList<CRISPScores>();
            return QueryResult;
        }
        public List<KPI> GetKPIWithTargets(int goalId, DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@GOAL_ID", goalId);
            SqlParameter param2 = new SqlParameter("@START_DATE", startDate);
            SqlParameter param3 = new SqlParameter("@END_DATE", endDate);
            var QueryResult = dbContext.Database.SqlQuery<KPI>("[dbo].[getkpiswithtargetforperiod] @GOAL_ID ,@START_DATE,@END_DATE ", param1, param2, param3).ToList<KPI>(); ;
            return QueryResult;
        }
        public List<PARAMETER_TABLE> GetFrequencyAudit()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PARAMETER_TABLE>("[dbo].[getFrequencyAudit]").ToList<PARAMETER_TABLE>();
            return QueryResult;
        }
        public List<PARAMETER_TABLE> GetAuditType()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PARAMETER_TABLE>("[dbo].[getAuditType]").ToList<PARAMETER_TABLE>();
            return QueryResult;
        }
        public List<PARAMETER_TABLE> GetAuditSupportFunctions()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PARAMETER_TABLE>("[dbo].[getAuditSupportFunctions]").ToList<PARAMETER_TABLE>();
            return QueryResult;
        }
        public List<PROCESS_MODEL> GetScopeOfAudit()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_MODEL>("[dbo].[getAuditScope]").ToList<PROCESS_MODEL>();
            return QueryResult;
        }

        public List<CustomerProjectData> GetCustomerProjectDetails()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<CustomerProjectData>("[dbo].[getCustomerProjectDetails]").ToList<CustomerProjectData>();
            return QueryResult;
        }
        public IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> GetCustomerProjectDetailsByEmpId(string EmpId, bool projFlag)
        {
            var context = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@EMPID", EmpId);
            SqlParameter param2 = new SqlParameter("@ProjFlag", projFlag);
            var staffSummaryDetails = context.Database.SqlQuery<CUSTOMER_PROJECT_PORTFOLIO>("[dbo].[getCustomerProjectDetailsByEmpId] @EMPID, @ProjFlag", param1, param2).ToList();
            return staffSummaryDetails;
        }
        public IEnumerable<CUSTOMER_PROJECT_PORTFOLIO> GetCustomerProjectDetailsByCustomerEmailId(string EmailId)
        {
            var context = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@EMAILID", EmailId);
            var staffSummaryDetails = context.Database.SqlQuery<CUSTOMER_PROJECT_PORTFOLIO>("[dbo].[getCustomerProjectDetailsByCustomerEmailId] @EMAILID", param1).ToList();
            return staffSummaryDetails;
        }
        public List<PARAMETER_TABLE> GetStatusOfAudit()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PARAMETER_TABLE>("[dbo].[getAuditStatus]").ToList<PARAMETER_TABLE>();
            return QueryResult;
        }
        public List<KAIZEN_DASHBOARD> GetInnovationForProject(string CustomerId, string ProjId, int Year, int Quarter, string RadioOption)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param2 = new SqlParameter("@PROJECT_ID", ProjId);
            SqlParameter param3 = new SqlParameter("@YEAR", Year);
            SqlParameter param4 = new SqlParameter("@QUARTER", Quarter);
            SqlParameter param5 = new SqlParameter("@RADIO_OPTION", RadioOption);
            var QueryResult = dbContext.Database.SqlQuery<KAIZEN_DASHBOARD>("[dbo].[kaizan_dashboard] @CUSTOMER_ID,@PROJECT_ID,@YEAR,@QUARTER,@RADIO_OPTION", param1, param2, param3, param4, param5).ToList<KAIZEN_DASHBOARD>();
            return QueryResult;
        }
        public List<ANALYSIS_TOTAL> GetAnalyzedInsights(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CustomerId", CustomerId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@ReportType", ReportType);
            SqlParameter param4 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param5 = new SqlParameter("@EndDate", EndDate);
            var QueryResult = dbContext.Database.SqlQuery<ANALYSIS_TOTAL>("[dbo].[getinsightstatuscount] @CustomerId,@ProjectId,@ReportType,@StartDate,@EndDate", param1, param2, param3, param4, param5).ToList<ANALYSIS_TOTAL>();
            return QueryResult;
        }
        public List<SQA_DATA_REPOSITORY> GetEngineerwiseTotalCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CustomerId", CustomerId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@ReportType", ReportType);
            SqlParameter param4 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param5 = new SqlParameter("@EndDate", EndDate);
            var QueryResult = dbContext.Database.SqlQuery<SQA_DATA_REPOSITORY>("[dbo].[getengineertotalcountinsights] @CustomerId,@ProjectId,@ReportType,@StartDate,@EndDate", param1, param2, param3, param4, param5).ToList<SQA_DATA_REPOSITORY>();
            return QueryResult;
        }
        public List<SQA_DATA_REPOSITORY> GetEngineerComplainceCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CustomerId", CustomerId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@ReportType", ReportType);
            SqlParameter param4 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param5 = new SqlParameter("@EndDate", EndDate);
            var QueryResult = dbContext.Database.SqlQuery<SQA_DATA_REPOSITORY>("[dbo].[getengineercompliancecountinsights] @CustomerId,@ProjectId,@ReportType,@StartDate,@EndDate", param1, param2, param3, param4, param5).ToList<SQA_DATA_REPOSITORY>();
            return QueryResult;
        }
        public List<SQA_DATA_REPOSITORY> GetEngineerNonComplainceCount(string CustomerId, string ProjectId, string ReportType, DateTime StartDate, DateTime EndDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CustomerId", CustomerId);
            SqlParameter param2 = new SqlParameter("@ProjectId", ProjectId);
            SqlParameter param3 = new SqlParameter("@ReportType", ReportType);
            SqlParameter param4 = new SqlParameter("@StartDate", StartDate);
            SqlParameter param5 = new SqlParameter("@EndDate", EndDate);
            var QueryResult = dbContext.Database.SqlQuery<SQA_DATA_REPOSITORY>("[dbo].[getengineernoncompliancecountinsights] @CustomerId,@ProjectId,@ReportType,@StartDate,@EndDate", param1, param2, param3, param4, param5).ToList<SQA_DATA_REPOSITORY>();
            return QueryResult;
        }
        public List<INSIGHTS_FILTER> GetReportCondition(string ReportType)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ReportType", ReportType);
            var QueryResult = dbContext.Database.SqlQuery<INSIGHTS_FILTER>("[dbo].[getreportconditions] @ReportType", param1).ToList<INSIGHTS_FILTER>();
            return QueryResult;
        }
        public List<PROCESS_MODEL> GetProcessModel()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_MODEL>("[dbo].[getProcessModel]").ToList<PROCESS_MODEL>();
            return QueryResult;
        }

        public List<AllProcessList> GetAllMappedProcess()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<AllProcessList>("[dbo].[getAllMappedProcessByProcessModel]").ToList();
            return QueryResult;
        }

        public List<AllProcessByServiceAreaList> GetAllProcessByServiceArea(int serviceTowerId = 0)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@serviceAreaId", serviceTowerId);
            var QueryResult = dbContext.Database.SqlQuery<AllProcessByServiceAreaList>("[dbo].[getAllMappedProcessByServiceArea] @serviceAreaId", param1).ToList();
            return QueryResult;
        }

        public List<PROCESS_MODEL_OBJECTIVES> GetProcessModelObjectives()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_MODEL_OBJECTIVES>("[dbo].[getProcessModelObjective]").ToList<PROCESS_MODEL_OBJECTIVES>();
            return QueryResult;
        }

        public List<PROCESS_MODEL_OBJECTIVES_NEW> GetObjectivesFromServiceAreaId(int ServiceAreaId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@id", ServiceAreaId);
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_MODEL_OBJECTIVES_NEW>("[dbo].[getObjectivesFromServiceAreaId] @id", param1).ToList<PROCESS_MODEL_OBJECTIVES_NEW>();
            return QueryResult;
        }

        public List<PROCESS_SERVICE_AREA> GetServiceAreaForModel(string processModelId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROCESS_MODEL_ID", processModelId);
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_SERVICE_AREA>("[dbo].[getServiceAreaForModel] @PROCESS_MODEL_ID", param1).ToList<PROCESS_SERVICE_AREA>();
            return QueryResult;
        }
        public List<PROCESS_DESCRIPTION> GetProcessDescription(string CustomerId, string ProjectId, string serviceAreaId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param2 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param3 = new SqlParameter("@SERVICE_AREA_ID", serviceAreaId);
            var QueryResult = dbContext.Database.SqlQuery<PROCESS_DESCRIPTION>("[dbo].[getprocessdescription] @CUSTOMER_ID,@PROJECT_ID,@SERVICE_AREA_ID", param1, param2, param3).ToList<PROCESS_DESCRIPTION>();
            return QueryResult;
        }

        public List<ProcessDetails> GetProcessByServiceArea(int ServiceAreaId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@SERVICE_AREA_ID", ServiceAreaId);
            var QueryResult = dbContext.Database.SqlQuery<ProcessDetails>("[dbo].[getProcessByServiceArea] @SERVICE_AREA_ID ", param1).ToList<ProcessDetails>();
            return QueryResult;
        }
        public void DeleteProcessProjectConfig(string ProjectId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjectId", ProjectId);
            var QueryResult = dbContext.Database.SqlQuery<int>("[dbo].[usp_delete_processprojectconfig] @ProjectId", param1).ToList();
        }
        public List<AUDIT_PROCESS_TESTS> GetAuditProcessTests(int ProcessModelId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROCESS_MODEL_ID", ProcessModelId);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_PROCESS_TESTS>("[dbo].[sp_getTestsForProcessModel] @PROCESS_MODEL_ID", param1).ToList();
            return QueryResult;
        }

        public List<PROCESS_MODEL_SUMMARY> GetProcessModelSummaryReport(string ProjectId, DateTime StartDate, string AuditTitle, string CustomerId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param2 = new SqlParameter("@AUDIT_START_DATE", StartDate);
            SqlParameter param3 = new SqlParameter("@AUDIT_TITLE", AuditTitle);
            SqlParameter param4 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            List<PROCESS_MODEL_SUMMARY> QueryResult = dbContext.Database.SqlQuery<PROCESS_MODEL_SUMMARY>("[dbo].[getProcessModelSummary] @PROJECT_ID, @AUDIT_START_DATE, @AUDIT_TITLE, @CUSTOMER_ID ", param1, param2, param3, param4).ToList();
            return QueryResult;
        }

        public List<TESTS_VIEW_MODEL> GetTestsData(string CustomerId, string ProjectId, string ServiceAreas, string AuditTitle)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", CustomerId);
            SqlParameter param2 = new SqlParameter("@projid", ProjectId);
            SqlParameter param3 = new SqlParameter("@sa", ServiceAreas);
            SqlParameter param4 = new SqlParameter("@audittitle", AuditTitle);
            List<TESTS_VIEW_MODEL> QueryResult = dbContext.Database.SqlQuery<TESTS_VIEW_MODEL>("[dbo].[getListOfTestsFromProcessId] @custid, @projid, @sa, @audittitle", param1, param2, param3, param4).ToList();
            return QueryResult;
        }

        public List<TEST_REPORT_SUMMARY> GetTestsResults(string CustomerId, string ProjectId, string AuditTitle)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", CustomerId);
            SqlParameter param2 = new SqlParameter("@projid", ProjectId);
            SqlParameter param3 = new SqlParameter("@audittitle", AuditTitle);
            List<TEST_REPORT_SUMMARY> QueryResult = dbContext.Database.SqlQuery<TEST_REPORT_SUMMARY>("[dbo].[getTestsReport] @custid, @projid, @audittitle ", param1, param2, param3).ToList();
            return QueryResult;
        }
        public List<PERSPECTIVE_LIST> GetGlobalCategory()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<PERSPECTIVE_LIST>("[dbo].[getGlobalCategory]").ToList();
            return QueryResult;
        }
        public List<KPI> GetTotalKPIMonthCount(DateTime month)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@MONTH", month);
            var QueryResult = dbContext.Database.SqlQuery<KPI>("[dbo].[sp_gettotalKPICountMonth] @MONTH", param1).ToList();
            return QueryResult;
        }
        public List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCount(string ProjectId, DateTime month)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param2 = new SqlParameter("@AUDIT_START_DATE", month);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CONTROL_TEST_COUNT>("[dbo].[getAuditControlandTestCount] @PROJECT_ID ,@AUDIT_START_DATE", param1, param2).ToList();
            return QueryResult;
        }

        public List<AUDIT_CONTROL_TEST_COUNT> GetAuditControlandTestCountReport(string ProjectId, DateTime month, string CustomerId, string AuditTitle)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param2 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param3 = new SqlParameter("@AUDIT_START_DATE", month);
            SqlParameter param4 = new SqlParameter("@AUDIT_TITLE", AuditTitle);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CONTROL_TEST_COUNT>("[dbo].[getAuditControlandTestCountReport] @CUSTOMER_ID, @PROJECT_ID ,@AUDIT_START_DATE, @AUDIT_TITLE ", param1, param2, param3, param4).ToList();
            return QueryResult;
        }
        public List<AUDIT_EXECUTION_REPORT> GetAuditExecutionReport(string ProjectId, DateTime month)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param2 = new SqlParameter("@START_DATE", month);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_EXECUTION_REPORT>("[dbo].[getAuditReportExecution] @PROJECT_ID ,@START_DATE", param1, param2).ToList();
            return QueryResult;
        }
        public List<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED> GetChecklistAudit(string CustomerId, string ProjectId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param2 = new SqlParameter("@PROJECT_ID", ProjectId);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_PROJECT_EXECUTION_EXTENDED>("[dbo].[getCheckPointsforProject] @CUSTOMER_ID ,@PROJECT_ID ", param1, param2).ToList();
            return QueryResult;
        }

        public List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetChecklistAuditNew(string CustomerId, string ProjectId, int auditId, string ServiceAreaIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTOMER_ID", CustomerId);
            SqlParameter param2 = new SqlParameter("@PROJECT_ID", ProjectId);
            SqlParameter param2a = new SqlParameter("@AUDIT_ID", auditId);
            SqlParameter param3 = new SqlParameter("@SERVICE_AREAS", ServiceAreaIds);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>("[dbo].[getCheckPointsforProjectNew] @CUSTOMER_ID ,@PROJECT_ID, @AUDIT_ID,  @SERVICE_AREAS", param1, param2, param2a, param3).ToList();
            return QueryResult;
        }



        public List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> GetFindingsForAuditWithStatus(int AuditId, int QuestionId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@audit_id", AuditId);
            SqlParameter param2 = new SqlParameter("@question_id", QuestionId);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM>("[dbo].[getFindingsForAuditWithStatus] @audit_id, @question_id", param1, param2).ToList();
            return QueryResult;
        }

        public List<object> GetReports()
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@StartDate", "1-May-2019");
            SqlParameter param2 = new SqlParameter("@EndDate", "1-June=2019");
            TypeBuilder builder = CreateTypeBuilder(
                   "MyDynamicAssembly", "MyModule", "MyType");
            CreateAutoImplementedProperty(builder, "name", typeof(string));
            CreateAutoImplementedProperty(builder, "type", typeof(string));
            CreateAutoImplementedProperty(builder, "id", typeof(int));
            Type resultType = builder.CreateType();
            dynamic QueryResult = dbContext.Database.SqlQuery(resultType,
               "[dbo].[getCheckPointsforProject] @StartDate ,@EndDate ", param1, param2
               );

            foreach (dynamic item in QueryResult)
            {
                Console.WriteLine("{0,10} {1,4} {2,10}", item.name, item.type, item.id);
            }
            return QueryResult;
        }
        public static TypeBuilder CreateTypeBuilder(
           string assemblyName, string moduleName, string typeName)
        {
            TypeBuilder typeBuilder = AppDomain
                .CurrentDomain
                .DefineDynamicAssembly(new AssemblyName(assemblyName), AssemblyBuilderAccess.Run)
                .DefineDynamicModule(moduleName)
                .DefineType(typeName, TypeAttributes.Public);
            typeBuilder.DefineDefaultConstructor(MethodAttributes.Public);
            return typeBuilder;
        }
        public static void CreateAutoImplementedProperty(
           TypeBuilder builder, string propertyName, Type propertyType)
        {
            const string PrivateFieldPrefix = "m_";
            const string GetterPrefix = "get_";
            const string SetterPrefix = "set_";

            // Generate the field.
            FieldBuilder fieldBuilder = builder.DefineField(
                string.Concat(PrivateFieldPrefix, propertyName), propertyType, FieldAttributes.Private);

            //// Generate the property
            //PropertyBuilder propertyBuilder = builder.DefineProperty(
            //    propertyName, System.Data.PropertyAttributes.HasDefault, propertyType, null);

            // Property getter and setter attributes.
            MethodAttributes propertyMethodAttributes =
                MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.HideBySig;

            // Define the getter method.
            MethodBuilder getterMethod = builder.DefineMethod(
                string.Concat(GetterPrefix, propertyName),
                propertyMethodAttributes, propertyType, Type.EmptyTypes);

            // Emit the IL code.
            // ldarg.0
            // ldfld,_field
            // ret
            ILGenerator getterILCode = getterMethod.GetILGenerator();
            getterILCode.Emit(OpCodes.Ldarg_0);
            getterILCode.Emit(OpCodes.Ldfld, fieldBuilder);
            getterILCode.Emit(OpCodes.Ret);

            // Define the setter method.
            MethodBuilder setterMethod = builder.DefineMethod(
                string.Concat(SetterPrefix, propertyName),
                propertyMethodAttributes, null, new Type[] { propertyType });

            // Emit the IL code.
            // ldarg.0
            // ldarg.1
            // stfld,_field
            // ret
            ILGenerator setterILCode = setterMethod.GetILGenerator();
            setterILCode.Emit(OpCodes.Ldarg_0);
            setterILCode.Emit(OpCodes.Ldarg_1);
            setterILCode.Emit(OpCodes.Stfld, fieldBuilder);
            setterILCode.Emit(OpCodes.Ret);

            //propertyBuilder.SetGetMethod(getterMethod);
            //propertyBuilder.SetSetMethod(setterMethod);
        }
        public void Delete_SQA_DATA_REPOSITORY(int reportId, string DateField, DateTime startDate, DateTime endDate)
        {
            throw new NotImplementedException();
        }
        public void UpdateCSSBatchCustomers(int ID, int SURVEY_ID, DateTime SURVEY_SENT_DATE, DateTime? SURVEY_RECEIVED_DATE, string STATUS, string EMP_ID, DateTime? MEETING_DATE, bool? IS_CSM_NOTIFIED, int questionModelId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ID", ID);
            SqlParameter param2 = new SqlParameter("@SURVEY_ID", SURVEY_ID);
            SqlParameter param3 = new SqlParameter("@SURVEY_SENT_DATE", SURVEY_SENT_DATE);
            SqlParameter param4 = new SqlParameter("@SURVEY_RECEIVED_DATE", SURVEY_RECEIVED_DATE ?? Convert.DBNull);
            SqlParameter param5 = new SqlParameter("@STATUS", STATUS);
            SqlParameter param6 = new SqlParameter("@EMP_ID", string.IsNullOrEmpty(EMP_ID) ? (object)DBNull.Value : EMP_ID);
            SqlParameter param7 = new SqlParameter("@MEETING_DATE", MEETING_DATE ?? Convert.DBNull);
            SqlParameter param8 = new SqlParameter("@IS_CSM_NOTIFIED", IS_CSM_NOTIFIED.HasValue ? (object)IS_CSM_NOTIFIED.Value : DBNull.Value);
            SqlParameter param9 = new SqlParameter("@QUESTION_MODEL_ID", questionModelId);
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_update_CSSBatchCustomers] @ID, @SURVEY_ID, @SURVEY_SENT_DATE, @SURVEY_RECEIVED_DATE, @STATUS, @EMP_ID, @MEETING_DATE, @IS_CSM_NOTIFIED, @QUESTION_MODEL_ID", param1, param2, param3, param4, param5, param6, param7, param8, param9).ToList();
        }

        public void UpdateCSSBatchCustomersMonthly(int ID, int SURVEY_ID, DateTime SURVEY_SENT_DATE, DateTime? SURVEY_RECEIVED_DATE, string STATUS, string EMP_ID, DateTime? MEETING_DATE, bool? IS_CSM_NOTIFIED)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ID", ID);
            SqlParameter param2 = new SqlParameter("@SURVEY_ID", SURVEY_ID);
            SqlParameter param3 = new SqlParameter("@SURVEY_SENT_DATE", SURVEY_SENT_DATE);
            SqlParameter param4 = new SqlParameter("@SURVEY_RECEIVED_DATE", SURVEY_RECEIVED_DATE ?? Convert.DBNull);
            SqlParameter param5 = new SqlParameter("@STATUS", STATUS);
            SqlParameter param6 = new SqlParameter("@EMP_ID", string.IsNullOrEmpty(EMP_ID) ? (object)DBNull.Value : EMP_ID);
            SqlParameter param7 = new SqlParameter("@MEETING_DATE", MEETING_DATE ?? Convert.DBNull);
            SqlParameter param8 = new SqlParameter("@IS_CSM_NOTIFIED", IS_CSM_NOTIFIED.HasValue ? (object)IS_CSM_NOTIFIED.Value : DBNull.Value);
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[usp_update_CSSBatchCustomersMonthly] @ID, @SURVEY_ID, @SURVEY_SENT_DATE, @SURVEY_RECEIVED_DATE, @STATUS, @EMP_ID, @MEETING_DATE, @IS_CSM_NOTIFIED", param1, param2, param3, param4, param5, param6, param7, param8).ToList();
        }


        public void AddServiceLevelIdentifier(string service_Level_Identifier, string service_Level_Title, int service_Area_Id, string Empid)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@SERVICE_LEVEL_IDENTIFIER", service_Level_Identifier);

            SqlParameter param2 = new SqlParameter("@SERVICE_LEVEL_TITLE", service_Level_Title);

            SqlParameter param3 = new SqlParameter("@SERVICE_AREA_ID", service_Area_Id);


            SqlParameter param4 = new SqlParameter("@EMPID", Empid);


            //param1.TypeName = "dbo.usp_Migrate_project_data";
            //param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[USP_ADD_SERVICELEVELIDENTIFIER] @SERVICE_LEVEL_IDENTIFIER, @SERVICE_LEVEL_TITLE,@SERVICE_AREA_ID, @EMPID", param1, param2, param3, param4).ToList();
        }


        public void AddFMEATask(int serviceAreaId, int processId, int serviceIdentifierId, string taskTitle, int taskCategoryId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@SERVICE_AREA_ID";
            param1.Value = serviceAreaId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@PROCESS_ID";
            param2.Value = processId;
            param2.SqlDbType = SqlDbType.Int;

            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@SERVICE_LEVEL_IDENTIFIER_ID";
            param3.Value = serviceIdentifierId;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@TASK_TITLE";
            param4.Value = taskTitle;
            param4.SqlDbType = SqlDbType.VarChar;

            SqlParameter param5 = new SqlParameter();
            param5.ParameterName = "@TASK_CATEGORY_ID";
            param5.Value = taskCategoryId;
            param5.SqlDbType = SqlDbType.Int;

            //param1.TypeName = "dbo.usp_Migrate_project_data";
            //param1.Direction = ParameterDirection.Input;
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[USP_FMEA_ADD_TASKS]   @SERVICE_AREA_ID, @PROCESS_ID,@SERVICE_LEVEL_IDENTIFIER_ID, @TASK_TITLE,@TASK_CATEGORY_ID", param1, param2, param3, param4, param5).ToList();
        }

        public List<FMEADataModel> GetFMEADATA(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param0 = new SqlParameter();
            param0.ParameterName = "@FMEA_TYPE_ID";
            param0.Value = fmeaTypeId;
            param0.SqlDbType = SqlDbType.Int;

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@SERVICE_AREA_ID";
            param1.Value = serviceAreaId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@PROCESS_ID";
            param2.Value = processId;
            param2.SqlDbType = SqlDbType.Int;

            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@SERVICE_LEVEL_IDENTIFIER_ID";
            param3.Value = serviceIdentifierId;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@TASK_ID";
            param4.Value = taskId;
            param4.SqlDbType = SqlDbType.Int;

            var QueryResult = dbContext.Database.SqlQuery<FMEADataModel>("[dbo].[USP_GET_FMEA_DATA] @FMEA_TYPE_ID, @SERVICE_AREA_ID, @PROCESS_ID,@SERVICE_LEVEL_IDENTIFIER_ID, @TASK_ID", param0, param1, param2, param3, param4).ToList();
            return QueryResult;
        }


        public List<GET_FMEA_DATA_STAGE2> GetFMEADATAStage2(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param0 = new SqlParameter();
            param0.ParameterName = "@FMEA_TYPE_ID";
            param0.Value = fmeaTypeId;
            param0.SqlDbType = SqlDbType.Int;

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@SERVICE_AREA_ID";
            param1.Value = serviceAreaId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@PROCESS_ID";
            param2.Value = processId;
            param2.SqlDbType = SqlDbType.Int;

            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@SERVICE_LEVEL_IDENTIFIER_ID";
            param3.Value = serviceIdentifierId;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@TASK_ID";
            param4.Value = taskId;
            param4.SqlDbType = SqlDbType.Int;

            var QueryResult = dbContext.Database.SqlQuery<GET_FMEA_DATA_STAGE2>("[dbo].[USP_GET_FMEA_DATA_STAGE2] @FMEA_TYPE_ID, @SERVICE_AREA_ID, @PROCESS_ID,@SERVICE_LEVEL_IDENTIFIER_ID, @TASK_ID", param0, param1, param2, param3, param4).ToList();
            return QueryResult;
        }


        public List<ProjectSpecificFailures> GetProjectSpecificFailures(FailureModeFilters filters)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@ProjectId";
            param1.Value = filters.ProjectId;
            param1.SqlDbType = SqlDbType.VarChar;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@ServiceAreaId";
            param2.Value = filters.ServiceAreaId;
            param2.SqlDbType = SqlDbType.Int;

            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@ProcessId";
            param3.Value = filters.ProcessId;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@ServiceLevel";
            param4.Value = filters.ServiceLevel;
            param4.SqlDbType = SqlDbType.Int;

            SqlParameter param5 = new SqlParameter();
            param5.ParameterName = "@Taskid";
            param5.Value = filters.TaskId;
            param5.SqlDbType = SqlDbType.Int;


            var QueryResult = dbContext.Database.SqlQuery<ProjectSpecificFailures>("[dbo].[getProjectSpecificFailures] @ProjectId, @ServiceAreaId, @ProcessId, @ServiceLevel, @Taskid", param1, param2, param3, param4, param5).ToList();
            return QueryResult;
        }



        public void UpdateApproval(int fmeaDataId, int fmeaStatus, string rejectionComments)
        {

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@FMEA_DATA_ID";
            param1.Value = fmeaDataId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@FMEA_STATUS";
            param2.Value = fmeaStatus;
            param2.SqlDbType = SqlDbType.VarChar;

            SqlParameter param3 = new SqlParameter();

            if (rejectionComments != null)
            {
                param3.ParameterName = "@REJECT_COMMENTS";
                param3.Value = rejectionComments;
                param3.SqlDbType = SqlDbType.VarChar;
            }

            if (rejectionComments != null)
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL] @FMEA_DATA_ID, @FMEA_STATUS,@REJECT_COMMENTS", param1, param2, param3).ToList();
            }
            else
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL] @FMEA_DATA_ID, @FMEA_STATUS", param1, param2).ToList();
            }
        }

        public void UpdateApprovalStage2(int fmeaDataId, int fmeaStatus, string rejectionComments, string empId)
        {
            //if (rejectionComments == null)
            // rejectionComments = "";


            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@FMEA_DATA_ID";
            param1.Value = fmeaDataId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@FMEA_STATUS_STAGE2";
            param2.Value = fmeaStatus;
            param2.SqlDbType = SqlDbType.VarChar;


            SqlParameter param3 = new SqlParameter();


            if (rejectionComments != null)
            {
                param3.ParameterName = "@REJECT_COMMENTS_STAGE2";
                param3.Value = rejectionComments;
                param3.SqlDbType = SqlDbType.VarChar;
            }

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@REVIEWER_STAGE2";
            param4.Value = empId;
            param4.SqlDbType = SqlDbType.VarChar;

            if (rejectionComments != null)
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL_STAGE2] @FMEA_DATA_ID, @FMEA_STATUS_STAGE2,@REJECT_COMMENTS_STAGE2,@REVIEWER_STAGE2", param1, param2, param3, param4).ToList();
            }
            else
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL_STAGE2] @FMEA_DATA_ID, @FMEA_STATUS_STAGE2,@REVIEWER_STAGE2", param1, param2, param4).ToList();
            }
        }

        public void UpdateApprovalStage3(int fmeaDataId, int fmeaStatus, string rejectionComments, string empId)
        {

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@FMEA_DATA_ID";
            param1.Value = fmeaDataId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@FMEA_STATUS_STAGE3";
            param2.Value = fmeaStatus;
            param2.SqlDbType = SqlDbType.VarChar;

            SqlParameter param3 = new SqlParameter();

            if (rejectionComments == null)
            {
                param3.ParameterName = "@REJECT_COMMENTS_STAGE3";
                param3.Value = rejectionComments;
                param3.SqlDbType = SqlDbType.VarChar;
            }

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@REVIEWER_STAGE3";
            param4.Value = empId;
            param4.SqlDbType = SqlDbType.VarChar;


            if (rejectionComments == null)
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL_STAGE3] @FMEA_DATA_ID, @FMEA_STATUS_STAGE3,@REJECT_COMMENTS_STAGE3,@REVIEWER_STAGE3", param1, param2, param3, param4).ToList();
            }
            else
            {
                var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPROVAL_STAGE3] @FMEA_DATA_ID,@FMEA_STATUS_STAGE3,@REVIEWER_STAGE3", param1, param2, param4).ToList();
            }
        }


        public void UpdateApplicable(int Id, bool status)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ID", Id);
            SqlParameter param2 = new SqlParameter("@STATUS", status);
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_APPLICABLE] @ID,@STATUS", param1, param2).ToList();
        }


        public bool VerifyFMEAStage2Data(int fmeaDataId, string cusT_ID, string proJ_ID)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@FMEA_DATA_ID", fmeaDataId);
            SqlParameter param2 = new SqlParameter("@CUST_ID", cusT_ID);
            SqlParameter param3 = new SqlParameter("@PROJ_ID", proJ_ID);
            var QueryResult = dbContext.Database.SqlQuery<string>("[dbo].[FMEA_UPDATE_APPLICABLE] @FMEA_DATA_ID,@CUST_ID,@PROJ_ID", param1, param2, param3);
            return true;
        }


        public List<GET_FMEA_DATA_STAGE3> GetFMEADATAStage3(int fmeaTypeId, int serviceAreaId, int processId, int serviceIdentifierId, int taskId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param0 = new SqlParameter();
            param0.ParameterName = "@FMEA_TYPE_ID";
            param0.Value = fmeaTypeId;
            param0.SqlDbType = SqlDbType.Int;

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@SERVICE_AREA_ID";
            param1.Value = serviceAreaId;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@PROCESS_ID";
            param2.Value = processId;
            param2.SqlDbType = SqlDbType.Int;

            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@SERVICE_LEVEL_IDENTIFIER_ID";
            param3.Value = serviceIdentifierId;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@TASK_ID";
            param4.Value = taskId;
            param4.SqlDbType = SqlDbType.Int;

            var QueryResult = dbContext.Database.SqlQuery<GET_FMEA_DATA_STAGE3>("[dbo].[USP_GET_FMEA_DATA_STAGE3] @FMEA_TYPE_ID, @SERVICE_AREA_ID, @PROCESS_ID,@SERVICE_LEVEL_IDENTIFIER_ID, @TASK_ID", param0, param1, param2, param3, param4).ToList();
            return QueryResult;
        }


        public void UpdateFMEADataStage3Model(FMEA_DATA_STAGE3_MODEL results)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter();
            param1.ParameterName = "@FMEA_DATA_ID";
            param1.Value = results.FMEA_DATA_ID;
            param1.SqlDbType = SqlDbType.Int;

            SqlParameter param2 = new SqlParameter();
            param2.ParameterName = "@FUTURE_RF_OCCURRENCE_ID";
            param2.Value = results.FUTURE_RF_OCCURRENCE_ID;
            param2.SqlDbType = SqlDbType.Int;


            SqlParameter param3 = new SqlParameter();
            param3.ParameterName = "@FUTURE_RF_SEVERITY_ID";
            param3.Value = results.FUTURE_RF_SEVERITY_ID;
            param3.SqlDbType = SqlDbType.Int;

            SqlParameter param4 = new SqlParameter();
            param4.ParameterName = "@FUTURE_RF_DETECTION_ID";
            param4.Value = results.FUTURE_RF_DETECTION_ID;
            param4.SqlDbType = SqlDbType.Int;

            float fl = 0;

            SqlParameter param5 = new SqlParameter();
            param5.ParameterName = "@FUTURE_RPN";
            if (results.FUTURE_RPN != null)
                param5.Value = results.FUTURE_RPN;
            else
                param5.Value = fl;
            param5.SqlDbType = SqlDbType.Float;



            SqlParameter param7 = new SqlParameter();
            param7.ParameterName = "@FUTURE_ACTION_TAKEN";
            param7.Value = results.FUTURE_ACTION_TAKEN;
            param7.SqlDbType = SqlDbType.VarChar;

            SqlParameter param8 = new SqlParameter();
            param8.ParameterName = "@FUTURE_ACTION_TAKEN_BY";
            param8.Value = results.FUTURE_ACTION_TAKEN_BY;
            param8.SqlDbType = SqlDbType.Int;

            SqlParameter param9 = new SqlParameter();
            param9.ParameterName = "@FUTURE_ACTION_TAKEN_ON";
            param9.Value = results.FUTURE_ACTION_TAKEN_ON;
            param9.SqlDbType = SqlDbType.DateTime;


            //SqlParameter param2 = new SqlParameter("@FUTURE_RF_OCCURRENCE_ID", results.FUTURE_RF_OCCURRENCE_ID);
            //SqlParameter param3 = new SqlParameter("@FUTURE_RF_SEVERITY_ID", results.FUTURE_RF_SEVERITY_ID);
            //SqlParameter param4 = new SqlParameter("@FUTURE_RF_DETECTION_ID", results.FUTURE_RF_DETECTION_ID);
            //SqlParameter param5 = new SqlParameter("@FUTURE_RPN", results.FUTURE_RPN);
            //SqlParameter param6 = new SqlParameter("@FUTURE_FAILURE_CATEGORY_ID", results.FUTURE_FAILURE_CATEGORY_ID);
            //SqlParameter param7 = new SqlParameter("@FUTURE_ACTION_TAKEN", results.FUTURE_ACTION_TAKEN);
            //SqlParameter param8 = new SqlParameter("@FUTURE_ACTION_TAKEN_BY", results.FUTURE_ACTION_TAKEN_BY);
            //SqlParameter param9 = new SqlParameter("@FUTURE_ACTION_TAKEN_ON", results.FUTURE_ACTION_TAKEN_ON);    


            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[UPDATE_FMEA_DATA_STAGE3] @FMEA_DATA_ID,@FUTURE_RF_OCCURRENCE_ID,@FUTURE_RF_SEVERITY_ID,@FUTURE_RF_DETECTION_ID,@FUTURE_RPN,@FUTURE_ACTION_TAKEN,@FUTURE_ACTION_TAKEN_BY,@FUTURE_ACTION_TAKEN_ON", param1, param2, param3, param4, param5, param7, param8, param9).ToList();

        }

        public List<CI_TRACKER> GetCITracker(bool automate, bool customerSavings, DateTime startDate, DateTime endDate, string[] projectIds, string custid, bool innovation, bool improvement, bool all, int viewBy, int[] iistatus)
        {
            string ProjIds = "";
            if (projectIds != null && projectIds.Any())
            {
                ProjIds = string.Join(",", projectIds);
            }

            string iistatusIds = "";

            if (iistatus != null && iistatus.Any())
            {
                iistatusIds = string.Join(",", iistatus);
            }


            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@AUTOMATE", automate);
            SqlParameter param2 = new SqlParameter("@CUSTOMER_SAVINGS", customerSavings);
            SqlParameter param3 = new SqlParameter("@STARTDATE", startDate);
            SqlParameter param4 = new SqlParameter("@ENDDATE", endDate);
            SqlParameter param5 = new SqlParameter("@PROJECTIDS", ProjIds);
            SqlParameter param6 = new SqlParameter("@CUSTID", custid);
            SqlParameter param7 = new SqlParameter("@INNOVATION", innovation);
            SqlParameter param8 = new SqlParameter("@IMPROVEMENT", improvement);
            SqlParameter param9 = new SqlParameter("@ALL", all);
            SqlParameter param10 = new SqlParameter("@VIEWBY", viewBy);
            SqlParameter param11 = new SqlParameter("@IISTATUS", iistatusIds);

            var QueryResult = dbContext.Database.SqlQuery<CI_TRACKER>("[dbo].[GET_CI_TRACKER_DATA] @AUTOMATE,@CUSTOMER_SAVINGS,@STARTDATE,@ENDDATE,@PROJECTIDS,@CUSTID,@INNOVATION,@IMPROVEMENT, @ALL,@VIEWBY,@IISTATUS", param1, param2, param3, param4, param5, param6, param7, param8, param9, param10, param11).ToList();
            return QueryResult;

        }

        public List<CI_TRACKER> GetCILBoard(bool all, string custId, string[] projectIds, DateTime startDate, DateTime endDate, int[] cilCategory, int[] iiStatus, int beneficiary, int uom)
        {
            string projIds = "";
            if (projectIds != null && projectIds.Any())
            {
                projIds = string.Join(",", projectIds);
            }

            string iiStatusIds = "";

            if (iiStatus != null && iiStatus.Any())
            {
                iiStatusIds = string.Join(",", iiStatus);
            }

            string cilCategoryId = "";
            if (cilCategory != null && cilCategory.Any())
            {
                cilCategoryId = string.Join(",", cilCategory);
            }

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@CUSTID", custId);
            SqlParameter param2 = new SqlParameter("@PROJIDS", projIds);
            SqlParameter param3 = new SqlParameter("@STARTDATE", startDate);
            SqlParameter param4 = new SqlParameter("@ENDDATE", endDate);
            SqlParameter param5 = new SqlParameter("@ImprovementType", cilCategoryId);
            SqlParameter param6 = new SqlParameter("@Status", iiStatusIds);
            SqlParameter param7 = new SqlParameter("@beneficiary", beneficiary);
            SqlParameter param8 = new SqlParameter("@Uom", uom);
            SqlParameter param9 = new SqlParameter("@ALL", all);
            var QueryResult = dbContext.Database.SqlQuery<CI_TRACKER>("[dbo].[usp_get_CIL_data] @CUSTID,@PROJIDS,@STARTDATE,@ENDDATE,@ImprovementType,@STATUS,@beneficiary,@Uom,@ALL", param1, param2, param3, param4, param5, param6, param7, param8, param9).ToList();
            return QueryResult;


        }

        public void UpdateMultipleRequests(int id, bool status, string request)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ID", id);
            SqlParameter param2 = new SqlParameter("@STATUS", status);
            SqlParameter param3 = new SqlParameter("@REQUEST", request);
            var QueryResult = dbContext.Database.SqlQuery<List<string>>("[dbo].[FMEA_UPDATE_REQUESTS] @ID,@STATUS,@REQUEST", param1, param2, param3).ToList();
        }

        public List<PlannedAudits> GetTasksForFMEA(string customerId, string projectId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custid", customerId);
            SqlParameter param2 = new SqlParameter("@projid", projectId);
            var TemplateDetails = dbContext.Database.SqlQuery<PlannedAudits>("[dbo].[GET_TASKS_FOR_FMEA] @custid, @projid", param1, param2).ToList();
            return TemplateDetails;
        }

        public void GetFMEAStage2DataByTask(int taskId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@TASK_SCH_ID", taskId);
            dbContext.Database.SqlQuery<List<string>>("[dbo].[GET_FMEA_STAGE2_DATA_BY_TASK] @TASK_SCH_ID", param1).ToList();
        }


        public void DeleteFMEAStage1(int fmeaDataId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@FMEADATAID", fmeaDataId);
            dbContext.Database.SqlQuery<List<string>>("[dbo].[DELETE_FMEA_STAGE1] @FMEADATAID", param1).ToList();
        }

        public List<Benefits> GetApplicableBenefits(string Categoryids)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@category_id", Categoryids);
            var mappings = dbContext.Database.SqlQuery<Benefits>("[dbo].[getUoMForIdeaCategory] @category_id", param1).ToList();
            return mappings;
        }

        public List<ServiceAres_VM> GetServiceAreasForproject(string ProjId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@proj_id", ProjId);
            var mappings = dbContext.Database.SqlQuery<ServiceAres_VM>("[dbo].[getServiceAreasForProject] @proj_id", param1).ToList();
            return mappings;
        }

        public List<IdeaViewModel> GetAllIdeas(string customerId, DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerid", customerId);
            SqlParameter param2 = new SqlParameter("@startdate", startDate);
            SqlParameter param3 = new SqlParameter("@enddate", endDate);
            var mappings = dbContext.Database.SqlQuery<IdeaViewModel>("[dbo].[getAllIdeas] @customerid,@startdate,@enddate", param1, param2, param3).ToList();
            return mappings;
        }

        public List<IdeaViewModel> GetAllIdeasByCustomer(string customerId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerid", customerId);
            var mappings = dbContext.Database.SqlQuery<IdeaViewModel>("[dbo].[getAllIdeasByCustomer] @customerid", param1).ToList();
            return mappings;
        }
        public List<IdeaViewModel> GetIdeasDetailById(int ideaId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ideaId", ideaId);
            var mappings = dbContext.Database.SqlQuery<IdeaViewModel>("[dbo].[getIdeasDetailbyId] @ideaId", param1).ToList();
            return mappings;
        }
        public List<IdentifiedBy_People> GetIdentifiedBy(string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerid", custId);
            var mappings = dbContext.Database.SqlQuery<IdentifiedBy_People>("getIdentifiedBy @customerid", param1).ToList();
            return mappings;

        }

        public List<IdeaViewModel> UpdateIdeaStatus(string Ideaids, string Status)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Id", Ideaids);
            SqlParameter param2 = new SqlParameter("@Status", Status);
            var mappings = dbContext.Database.SqlQuery<IdeaViewModel>("[dbo].[usp_updateIdeaStatus] @Id,@Status", param1, param2).ToList();
            return mappings;
        }



        public IdeaModel GetIdeabyId(int Ideaid)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@id", Ideaid);
            var mappings = dbContext.Database.SqlQuery<IdeaModel>("[dbo].[getIdeabyId] @id", param1).FirstOrDefault();
            return mappings;
        }

        public ImplementedIdea GetImplementedIdea(int Ideaid)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Id", Ideaid);
            var mappings = dbContext.Database.SqlQuery<ImplementedIdea>("[dbo].[getImplementedIdea] @Id", param1).FirstOrDefault();
            return mappings;
        }

        public List<IdeaStages> GetIdeaStageStatus(int Ideaid)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ideaId", Ideaid);
            var mappings = dbContext.Database.SqlQuery<IdeaStages>("[dbo].[getIdeaStageStatus] @ideaId", param1).ToList();
            return mappings;
        }

        public List<GET_REQ_STAGE_STATUS> GetReqStageStatus(int ReqID)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ReqId", ReqID);
            var mappings = dbContext.Database.SqlQuery<GET_REQ_STAGE_STATUS>("[dbo].[getReqStageStatus] @ReqId", param1).ToList();
            return mappings;
        }

        public List<QualitativeBenefitTitle> GetQualitativeBenefit(BenefitQualitativeDetails qualitativeBenefits)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@beneficiaryid", qualitativeBenefits.Beneficiary);
            SqlParameter param2 = new SqlParameter("@customerid", qualitativeBenefits.CustomerId);
            SqlParameter param3 = new SqlParameter("@projectid", qualitativeBenefits.ProjectId);
            SqlParameter param4 = new SqlParameter("@identifiedby", qualitativeBenefits.IdentifiedBy);
            SqlParameter param5 = new SqlParameter("@benefitpillarid", qualitativeBenefits.BenefitPillar);
            SqlParameter param6 = new SqlParameter("@statusid", qualitativeBenefits.Status);
            SqlParameter param7 = new SqlParameter("@startdate", qualitativeBenefits.StartDate);
            SqlParameter param8 = new SqlParameter("@enddate", qualitativeBenefits.EndDate);

            var QueryResult = dbContext.Database.SqlQuery<QualitativeBenefitTitle>("usp_qualitative_benefits1 @beneficiaryid,@customerid,@projectid,@identifiedby,@benefitpillarid,@statusid,@startdate,@enddate ", param1, param2, param3, param4, param5, param6, param7, param8).ToList();
            return QueryResult;
        }

        public List<QualitativeBenefitTitle> GetQualitativeBenefitDetail(BenefitQualitativeDetails qualitativeBenefits)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@beneficiaryid", qualitativeBenefits.Beneficiary);
            SqlParameter param2 = new SqlParameter("@customerid", qualitativeBenefits.CustomerId);
            SqlParameter param3 = new SqlParameter("@projectid", qualitativeBenefits.ProjectId);
            SqlParameter param4 = new SqlParameter("@identifiedby", qualitativeBenefits.IdentifiedBy);
            SqlParameter param5 = new SqlParameter("@benefitpillarid", qualitativeBenefits.BenefitPillar);
            SqlParameter param6 = new SqlParameter("@statusid", qualitativeBenefits.Status);
            SqlParameter param7 = new SqlParameter("@startdate", qualitativeBenefits.StartDate);
            SqlParameter param8 = new SqlParameter("@enddate", qualitativeBenefits.EndDate);

            var QueryResult = dbContext.Database.SqlQuery<QualitativeBenefitTitle>("usp_qualitative_benefits_detail @beneficiaryid, @customerid,@projectid,@identifiedby, @benefitpillarid,@statusid,@startdate,@enddate ", param1, param2, param3, param4, param5, param6, param7, param8).ToList();
            return QueryResult;
        }

        public List<QuantitativeNetBenefits> GetValuePieChart(BenefitQuantitativeDetails quantitativeBenefits)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@beneficiaryid", quantitativeBenefits.Beneficiary);
            SqlParameter param2 = new SqlParameter("@customerid", quantitativeBenefits.CustomerId);
            SqlParameter param3 = new SqlParameter("@projectid", quantitativeBenefits.ProjectId);
            SqlParameter param4 = new SqlParameter("@identifiedby", quantitativeBenefits.IdentifiedBy);
            SqlParameter param5 = new SqlParameter("@benefitPillarid", quantitativeBenefits.BenefitPillar);
            SqlParameter param6 = new SqlParameter("@statusid", quantitativeBenefits.Status);
            SqlParameter param7 = new SqlParameter("@startdate", quantitativeBenefits.StartDate);
            SqlParameter param8 = new SqlParameter("@enddate", quantitativeBenefits.EndDate);
            SqlParameter param9 = new SqlParameter("@uom", quantitativeBenefits.UOMID);

            var QueryResult = dbContext.Database.SqlQuery<QuantitativeNetBenefits>("usp_quantitative_benefits @beneficiaryid,@customerid,@projectid,@identifiedby,@benefitPillarid,@statusid,@startdate,@enddate,@uom", param1, param2, param3, param4, param5, param6, param7, param8, param9).ToList();
            return QueryResult;
        }


        public List<QuantitativeMonthlyNetBenefits> GetValueColumnChart(BenefitQuantitativeDetails quantitativeColumnBenefits)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@beneficiaryid", quantitativeColumnBenefits.Beneficiary);
            SqlParameter param2 = new SqlParameter("@customerid", quantitativeColumnBenefits.CustomerId);
            SqlParameter param3 = new SqlParameter("@projectid", quantitativeColumnBenefits.ProjectId);
            SqlParameter param4 = new SqlParameter("@identifiedby", quantitativeColumnBenefits.IdentifiedBy);
            SqlParameter param5 = new SqlParameter("@benefitPillarid", quantitativeColumnBenefits.BenefitPillar);
            SqlParameter param6 = new SqlParameter("@statusid", quantitativeColumnBenefits.Status);
            SqlParameter param7 = new SqlParameter("@startdate", quantitativeColumnBenefits.StartDate);
            SqlParameter param8 = new SqlParameter("@enddate", quantitativeColumnBenefits.EndDate);
            SqlParameter param9 = new SqlParameter("@uom", quantitativeColumnBenefits.UOMID);
            var queryResult = dbContext.Database.SqlQuery<QuantitativeMonthlyNetBenefits>("usp_quantitative_benefit_monthly @beneficiaryid,@customerid,@projectid,@identifiedby,@benefitPillarid,@statusid,@startdate,@enddate,@uom", param1, param2, param3, param4, param5, param6, param7, param8, param9).ToList();
            return queryResult;
        }


        public List<QuantitativeNetBenefits> GetQuantitativeBenefitsDetail(BenefitQuantitativeDetails quantitativeBenefits)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@beneficiaryid", quantitativeBenefits.Beneficiary);
            SqlParameter param2 = new SqlParameter("@customerid", quantitativeBenefits.CustomerId);
            SqlParameter param3 = new SqlParameter("@projectid", quantitativeBenefits.ProjectId);
            SqlParameter param4 = new SqlParameter("@identifiedby", quantitativeBenefits.IdentifiedBy);
            SqlParameter param5 = new SqlParameter("@benefitpillarid", quantitativeBenefits.BenefitPillar);
            SqlParameter param6 = new SqlParameter("@statusid", quantitativeBenefits.Status);
            SqlParameter param7 = new SqlParameter("@startdate", quantitativeBenefits.StartDate);
            SqlParameter param8 = new SqlParameter("@enddate", quantitativeBenefits.EndDate);
            SqlParameter param9 = new SqlParameter("@uom", quantitativeBenefits.UOMID);

            var QueryResult = dbContext.Database.SqlQuery<QuantitativeNetBenefits>("usp_quantitative_benefits_detail @beneficiaryid, @customerid,@projectid,@identifiedby,@benefitpillarid,@statusid,@startdate,@enddate,@uom", param1, param2, param3, param4, param5, param6, param7, param8, param9).ToList();
            return QueryResult;
        }

        public List<UOM_Title> GetAllUOM()
        {
            var dbContext = new CSPDbContext();
            var queryResult = dbContext.Database.SqlQuery<UOM_Title>("usp_GetAllUOM").ToList();
            return queryResult;
        }

        public List<IdeaStatusCount> GetIdeasStatusCount(IdeasSPFilter ideas)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerid", ideas.CustomerId);
            SqlParameter param2 = new SqlParameter("@projectid", ideas.ProjectId);
            SqlParameter param3 = new SqlParameter("@identifiedby", ideas.IdentifiedBy);
            SqlParameter param4 = new SqlParameter("@startdate", ideas.StartDate);
            SqlParameter param5 = new SqlParameter("@enddate", ideas.EndDate);
            SqlParameter param6 = new SqlParameter("@beneficiaryid", ideas.Beneficiary);
            SqlParameter param7 = new SqlParameter("@benefitpillarid", ideas.BenefitPillar);
            var queryResult = dbContext.Database.SqlQuery<IdeaStatusCount>("getIdeaStatusCountByImprovementType @customerid,@projectid,@identifiedby,@startdate,@enddate, @beneficiaryid, @benefitpillarid", param1, param2, param3, param4, param5, param6, param7).ToList();
            return queryResult;
        }

        //public void UpdateResponsiblePerson(int IdeaId, int PersonId, int AreaId)
        //{
        //    var dbContext = new CSPDbContext();
        //    SqlParameter param1 = new SqlParameter("@IdeaId", IdeaId);
        //    SqlParameter param2 = new SqlParameter("@ResponsibleId", PersonId);
        //    SqlParameter param3 = new SqlParameter("@AreaId", AreaId);
        //    dbContext.Database.SqlQuery<int>("usp_updateIdea_ResponsiblePerson @IdeaId,@ResponsibleId,@AreaId", param1, param2, param3);

        //}

        public List<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM> GetFindingsForProject(string projId, int serviceAreaId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@projId", projId);
            SqlParameter param2 = new SqlParameter("@serviceAreaId", serviceAreaId);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_PROJECT_FINDINGS_VM>("[dbo].[getFindingsForProject] @projId ,@serviceAreaId", param1, param2).ToList();
            return QueryResult;
        }

        public List<CSMDashboardDetailsModel> GetIdeasInnovationsImprovements(string projIds, string startDate, int endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@projIds", projIds);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            var queryRes = dbContext.Database.SqlQuery<CSMDashboardDetailsModel>("usp_getIdeaInnovationCount @projIds,@startDate,@endDate", param1, param2, param3).ToList();
            return queryRes;
        }

        public List<CSMDashboardDetailsModel> GetProcessCompilanceScore(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@projIds", projIds);
            var queryRes = dbContext.Database.SqlQuery<CSMDashboardDetailsModel>("usp_get_ProcessCompilance_Score @projIds", param1).ToList();
            return queryRes;
        }

        public List<ActionItemsAreaVaue> GetActionitemArea(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", projIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsAreaVaue>("[dbo].[getMonthActionItems] @ProjIds", param1).ToList();
            return TemplateDetails;
        }

        public List<AccountHealth> GetAccountHealth(string projIds, int month, int year)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", projIds);
            SqlParameter param2 = new SqlParameter("@Month", month);
            SqlParameter param3 = new SqlParameter("@Year", year);
            var TemplateDetails = dbContext.Database.SqlQuery<AccountHealth>("[dbo].[usp_getProject_FocusCount] @ProjIds ,@Month ,@Year", param1, param2, param3).ToList();
            return TemplateDetails;
        }

        public List<ActionItemsAreaVaue> GetRiskAreaChart(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", projIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsAreaVaue>("[dbo].[getMonthlyRisksData] @ProjIds", param1).ToList();
            return TemplateDetails;
        }

        public List<ActionItemsAreaVaue> GetIssueAreaChart(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjIds", projIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ActionItemsAreaVaue>("[dbo].[getMonthlyIssuesData] @ProjIds", param1).ToList();
            return TemplateDetails;
        }

        public List<ProjectResourceCount> GetProjectTeamCount(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProjId", projIds);
            var TemplateDetails = dbContext.Database.SqlQuery<ProjectResourceCount>("[dbo].[usp_project_talent_count] @ProjId", param1).ToList();
            return TemplateDetails;
        }

        public List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetSubmitedAssessmentsForCustomerandProject(string custId, string projId, int serviceAreaId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@customerId", custId);
            SqlParameter param2 = new SqlParameter("@projectId", projId);
            SqlParameter param3 = new SqlParameter("@serviceAreaId", serviceAreaId);
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>("[dbo].[getSubmitedAssessmentsForCustomerandProject]  @projectId,@serviceAreaId", param1, param2, param3).ToList();
            return QueryResult;
        }

        public List<KPI_SERVICE_LEVEL_METRICS> GetKpiMetrics(int prodId, int modeId, string stDate, string enDate)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@productId", prodId);
            SqlParameter param2 = new SqlParameter("@modeId", modeId);
            SqlParameter param3 = new SqlParameter("@startDate", stDate);
            SqlParameter param4 = new SqlParameter("@endDate", enDate);
            var QueryResult = dbContext.Database.SqlQuery<KPI_SERVICE_LEVEL_METRICS>("[dbo].[usp_get_servicelevel_Metrics] @productId,@modeId,@startDate,@endDate", param1, param2, param3, param4).ToList();
            return QueryResult;
        }
        public List<KPI_REFERENCES_PRODUCT> GetKPIReferencesByCustomer(string kpiSLAIds, string customerId, string stDate, string enDate)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@custId", customerId);
            SqlParameter param2 = new SqlParameter("@kpiSLAIds", kpiSLAIds);
            SqlParameter param3 = new SqlParameter("@startDate", stDate);
            SqlParameter param4 = new SqlParameter("@endDate", enDate);
            var QueryResult = dbContext.Database.SqlQuery<KPI_REFERENCES_PRODUCT>("[dbo].[usp_get_KPIReference_ByCustomer] @custId,@kpiSLAIds,@startDate,@endDate", param1, param2, param3, param4).ToList();
            return QueryResult;
        }
        public List<AUDIT_DETAILS_VM> GetAuditNotCompleted()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_DETAILS_VM>("[dbo].usp_getAuditsNotCompleted").ToList();
            return QueryResult;
        }
        public List<AUDIT_DETAILS_VM> GetAuditScoreNotSubmitted()
        {
            var dbContext = new CSPDbContext();
            var QueryResult = dbContext.Database.SqlQuery<AUDIT_DETAILS_VM>("[dbo].usp_getAuditScoreNotSubmitted").ToList();
            return QueryResult;
        }
        public void InsertExternalKPIData(DataTable extTable, string empId, string custId, DateTime ipDate, string source, string fileName)
        {
            SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ToString());
            SqlCommand cmd = new SqlCommand("usp_insert_ExternalKPIData", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            //Pass table Valued parameter to Store Procedure
            SqlParameter param = cmd.Parameters.AddWithValue("@extTable", extTable);
            SqlParameter param1 = cmd.Parameters.AddWithValue("@empId", empId);
            SqlParameter param2 = cmd.Parameters.AddWithValue("@custId", custId);
            SqlParameter param3 = cmd.Parameters.AddWithValue("@ipDate", ipDate);
            SqlParameter param4 = cmd.Parameters.AddWithValue("@source", source);
            SqlParameter param5 = cmd.Parameters.AddWithValue("@fileName", fileName);
            param.SqlDbType = SqlDbType.Structured;
            conn.Open();
            cmd.CommandTimeout = 300;
            cmd.ExecuteNonQuery();
            conn.Close();
        }
        public void UpdateExistingBaseMeasureKPIdataMap(DataTable extTable, string empId)
        {
            SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings["DefaultConnection"].ToString());
            SqlCommand cmd = new SqlCommand("usp_update_ExistingBaseMeasureKPIdataMap", conn);
            cmd.CommandType = CommandType.StoredProcedure;
            //Pass table Valued parameter to Store Procedure
            SqlParameter param = cmd.Parameters.AddWithValue("@extTable", extTable);
            SqlParameter param1 = cmd.Parameters.AddWithValue("@empId", empId);
            param.SqlDbType = SqlDbType.Structured;
            conn.Open();
            cmd.CommandTimeout = 300;
            cmd.ExecuteNonQuery();
            conn.Close();
        }
        public List<EXTERNAL_KPI_DATA> GetExternalKPIstoProcess(string customerId, string source, DateTime stDate, DateTime enDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custId", customerId);
            SqlParameter param2 = new SqlParameter("@source", source);
            SqlParameter param3 = new SqlParameter("@startDate", stDate);
            SqlParameter param4 = new SqlParameter("@endDate", enDate);
            var QueryResult = dbContext.Database.SqlQuery<EXTERNAL_KPI_DATA>("[dbo].[usp_get_ExternalKPIstoProcess] @custId,@source,@startDate,@endDate", param1, param2, param3, param4).ToList();
            return QueryResult;
        }
        public List<KPI_SERVICE_LEVEL_METRICS> GetAllKpiByModeId(int modeId, int serviceLevelId, int prodId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@modeId", modeId);
            SqlParameter param2 = new SqlParameter("@servicelvlId", serviceLevelId);
            SqlParameter param3 = new SqlParameter("@prodId", prodId);
            var QueryResult = dbContext.Database.SqlQuery<KPI_SERVICE_LEVEL_METRICS>("[dbo].[usp_get_AllKPIBy_Mode] @modeId,@servicelvlId,@prodId", param1, param2, param3).ToList();
            return QueryResult;
        }
        public List<PORTFOLIO_WISE_KPI> GetPortfolioWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<PORTFOLIO_WISE_KPI>("[dbo].[getPortfolioWiseKPICount] @customerId,@startDate,@endDate,@isCustomer", param1, param2, param3, param4).ToList<PORTFOLIO_WISE_KPI>();
            return QueryResult;
        }
        public List<KPI_WISE_DATA> GetKPIWiseDataForPeriod(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<KPI_WISE_DATA>("[dbo].[GetKPIWiseDataForPeriod] @customerId,@startDate,@endDate,@isCustomer", param1, param2, param3, param4).ToList<KPI_WISE_DATA>();
            return QueryResult;
        }

        public int GetOverallKPICountForPortfolio(int portfolioId, DateTime startDate, DateTime endDate, bool isCustomer)
        {

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@Portfolio_ID", portfolioId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<int>("[dbo].[GetOverallKPICountForPortfolio] @Portfolio_ID,@startDate,@endDate,@isCustomer", param1, param2, param3, param4).FirstOrDefault();
            return QueryResult;
        }
        public List<PRODUCTWISEKPIDATA> GetOverallProductWiseKPIData(int prodId, DateTime startDate, DateTime endDate, bool isCustomer, bool excludeExclusions)
        {

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@ProductID", prodId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            SqlParameter param5 = new SqlParameter("@excludeExclusions", excludeExclusions);
            return dbContext.Database.SqlQuery<PRODUCTWISEKPIDATA>("[dbo].[getOverallProductWiseKPIData] @startDate,@endDate,@ProductID ", param2, param3, param1).ToList();

        }


        public List<PRODUCT_WISE_KPI> GetProductWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<PRODUCT_WISE_KPI>("[dbo].[getProductWiseKPICount] @customerId,@startDate,@endDate,@isCustomer", param1, param2, param3, param4).ToList<PRODUCT_WISE_KPI>();
            return QueryResult;
        }

        public List<ENGAGEMENT_WISE_KPI> GetEngagementWiseKPICount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<ENGAGEMENT_WISE_KPI>("[dbo].[getEngagementLevelKPI] @customerId,@startDate,@endDate", param1, param2, param3, param4).ToList<ENGAGEMENT_WISE_KPI>();
            return QueryResult;
        }

        public List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED> GetWeightageForChecklist(int checklistId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@checklistId", checklistId);
            var weightageScoresForChecklist = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED>("[dbo].[getWeightageForChecklist] @checklistId", param1).ToList();
            return weightageScoresForChecklist;
        }

        public List<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED> GetWeightageForAllChecklist()
        {
            var dbContext = new CSPDbContext();
            var weightageScoresForChecklist = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_WEIGHTAGE_SCORES_EXTENDED>("[dbo].[getWeightageForAllChecklist]").ToList();
            return weightageScoresForChecklist;
        }
        public List<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED> GetChecklistUsedInAssessment()
        {
            var dbContext = new CSPDbContext();
            var getChecklistUsedInAssessment = dbContext.Database.SqlQuery<AUDIT_CHECKLIST_EXECUTION_DETAILS_EXTENDED>("[dbo].[getChecklistUsedInAssessment]").ToList();
            return getChecklistUsedInAssessment;
        }

        public List<PRODUCT_RESPONSIBLE_LIST> GetPortfolioProductResponsibleList(string custId, int managementType = 0)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custId", custId);
            SqlParameter param2 = new SqlParameter("@managementType", managementType);
            var QueryResult = dbContext.Database.SqlQuery<PRODUCT_RESPONSIBLE_LIST>("[dbo].[getPortfolioProductResponsibleList] @custId,@managementType", param1, param2).ToList();
            return QueryResult;
        }

        public List<CUSTOMER_USERS_LIST> GetCustomerUsersList(string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@custId", custId);
            var QueryResult = dbContext.Database.SqlQuery<CUSTOMER_USERS_LIST>("[dbo].[getCustomerUsersList] @custId", param1).ToList();
            return QueryResult;
        }

        public List<PRODUCT_RESPONSIBLE_EXTENDED> GetProductManagerByProductId(int productId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@productId", productId);
            var QueryResult = dbContext.Database.SqlQuery<PRODUCT_RESPONSIBLE_EXTENDED>("[dbo].[getProductManagerByProductId] @productId", param1).ToList();
            return QueryResult;
        }
        public decimal GetExpectedServiceLevel(int kpiId)
        {
            var dbContext = new CSPDbContext();
            decimal result = 0;
            if (kpiId != 0)
            {
                SqlParameter param1 = new SqlParameter("@kpiId", kpiId);
                var queryResult = dbContext.Database.SqlQuery<decimal>("[dbo].[getMinimumServiceLevelByKpiId] @kpiId", param1).ToList();
                if (queryResult != null || queryResult.Count > 0)
                    result = queryResult[0];
            }
            return result;
        }

        public IEnumerable<PROJECT_CSAT_DATA> GetCSSTableForPeriod(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_CSAT_DATA>("[dbo].[getCSSTableForPeriod] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return TemplateDetails;
        }

        public IEnumerable<PROJECT_CSAT_DATA_EXTENDED> GetCSSTableForPeriod1(string startDate, string endDate, string custId, string csmId, string frequency)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            SqlParameter param4 = new SqlParameter("@csmIds", csmId);
            SqlParameter param5 = new SqlParameter("@frequency", frequency);
            var TemplateDetails = dbContext.Database.SqlQuery<PROJECT_CSAT_DATA_EXTENDED>("[dbo].[getCSSTableForPeriod1] @startDate,@endDate,@custIds,@csmIds,@frequency", param1, param2, param3, param4, param5).ToList();
            return TemplateDetails;
        }

        public IEnumerable<CSAT_SURVEY_DATA_PERIODWISE> GetCSSResponseSummaryForPeriod(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var TemplateDetails = dbContext.Database.SqlQuery<CSAT_SURVEY_DATA_PERIODWISE>("[dbo].[getCSSResponseSummaryForPeriod]  @startDate,@endDate,@custIds", param1, param2, param3).ToList();

            return TemplateDetails;
        }

        public IEnumerable<CSAT_SURVEY_DATA_PERIODWISE_MONTHLY> GetCSSResponseSummaryForPremierMonthly(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var TemplateDetails = dbContext.Database.SqlQuery<CSAT_SURVEY_DATA_PERIODWISE_MONTHLY>("[dbo].[getCSSResponseSummaryForPremierMonthly]  @startDate,@endDate,@custIds", param1, param2, param3).ToList();

            return TemplateDetails;
        }
        public List<ENGAGEMENT_WISE_KPI_DETAILS> GetEngagementWiseKPIDetails(string custId, string kpiName, string status, DateTime startDate, DateTime endDate, string viewBy)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", custId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@kpiName", kpiName);
            SqlParameter param5 = new SqlParameter("@status", status);
            SqlParameter param6 = new SqlParameter("@viewBy", viewBy);
            var QueryResult = dbContext.Database.SqlQuery<ENGAGEMENT_WISE_KPI_DETAILS>("[dbo].[GetEngagementKPIDetails] @customerId,@startDate,@endDate,@kpiName,@status,@viewBy", param1, param2, param3, param4, param5, param6).ToList<ENGAGEMENT_WISE_KPI_DETAILS>();
            return QueryResult;
        }
        public List<KPI_WISE_DATA> GetPortfolioWiseKPIDetails(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<KPI_WISE_DATA>("[dbo].[GetKPIWiseDetailDataForPeriod] @customerId,@startDate,@endDate, @isCustomer", param1, param2, param3, param4).ToList<KPI_WISE_DATA>();
            return QueryResult;
        }
        public List<KPI_WISE_DATA> GetTrendDetails(string customerId, int portId, string kpiName, DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@kpiName", kpiName);
            SqlParameter param3 = new SqlParameter("@portfolioId", portId);
            SqlParameter param4 = new SqlParameter("@startDate", startDate);
            SqlParameter param5 = new SqlParameter("@endDate", endDate);
            var QueryResult = dbContext.Database.SqlQuery<KPI_WISE_DATA>("[dbo].[GetTrendDataForPortfolio] @customerId,@kpiName,@portfolioId,@startDate,@endDate", param1, param2, param3, param4, param5).ToList<KPI_WISE_DATA>();
            return QueryResult;
        }
        public List<CSS_VIEW_DETAILS> GetCSSViewDetails(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var cssDetails = dbContext.Database.SqlQuery<CSS_VIEW_DETAILS>("[dbo].[getViewCssDetailsForCSATInsights] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return cssDetails;
        }

        public List<CSS_VIEW_DETAILS_MONTHLY> GetCSSViewDetailsForMonthly(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var cssDetails = dbContext.Database.SqlQuery<CSS_VIEW_DETAILS_MONTHLY>("[dbo].[getViewCssDetailsMonthlyForCSATInsights] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return cssDetails;
        }

        public List<CSS_QUESTION_RATINGS> GetCSSQuestionRatings(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var cssRatings = dbContext.Database.SqlQuery<CSS_QUESTION_RATINGS>("[dbo].[getQuestionRatingsForCSATInsights] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return cssRatings;
        }

        public List<CSS_QUESTION_RATINGS_MONTHLY> GetCSSQuestionRatingsForMonthly(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var cssRatings = dbContext.Database.SqlQuery<CSS_QUESTION_RATINGS_MONTHLY>("[dbo].[getMonthlyQuestionRatingsForCSATInsights] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return cssRatings;
        }

        public List<ASSESSMENT_FINDINGS> GetAssessmentFindingsData(string startDate, string endDate, string custId)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@startDate", startDate);
            SqlParameter param2 = new SqlParameter("@endDate", endDate);
            SqlParameter param3 = new SqlParameter("@custIds", custId);
            var findings = dbContext.Database.SqlQuery<ASSESSMENT_FINDINGS>("[dbo].[getAssessmentFindingsForQAGovernanceDashboard] @startDate,@endDate,@custIds", param1, param2, param3).ToList();
            return findings;
        }

        public List<PRODUCT_WISE_CAPA_DETAILS> GetProductWiseCAPACount(string customerId, DateTime startDate, DateTime endDate, bool isCustomer)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@isCustomer", isCustomer);
            var QueryResult = dbContext.Database.SqlQuery<PRODUCT_WISE_CAPA_DETAILS>("[dbo].[getProductWiseCAPACount] @customerId,@startDate,@endDate", param1, param2, param3, param4).ToList();
            return QueryResult;
        }
        public List<PROJECT_CAPA_DETAILS> GetProjectCAPACount(string customerId, DateTime startDate, DateTime endDate)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            var QueryResult = dbContext.Database.SqlQuery<PROJECT_CAPA_DETAILS>("[dbo].[getProjectWiseCAPACount] @customerId,@startDate,@endDate", param1, param2, param3).ToList();
            return QueryResult;
        }

        public List<ProductKPIDetails> GetProductKPIDetails(int kpiDetailsId)
        {
            var dbContext = new CSPDbContext();

            SqlParameter param1 = new SqlParameter("@kpiDetailsId", kpiDetailsId);

            var QueryResult = dbContext.Database.SqlQuery<ProductKPIDetails>("[dbo].[getProductKPIDetails] @kpiDetailsId", param1).ToList();
            return QueryResult;
        }

        public List<ENGAGEMENT_WISE_KPI> GetTrendDataForEngagementLevelKPI(string customerId, DateTime startDate, DateTime endDate, string kpiName)
        {

            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@customerId", customerId);
            SqlParameter param2 = new SqlParameter("@startDate", startDate);
            SqlParameter param3 = new SqlParameter("@endDate", endDate);
            SqlParameter param4 = new SqlParameter("@kpiName", kpiName);
            var QueryResult = dbContext.Database.SqlQuery<ENGAGEMENT_WISE_KPI>("[dbo].[getTrendDataForEngagementLevelKPI] @customerId,@startDate,@endDate,@kpiName", param1, param2, param3, param4).ToList();
            return QueryResult;
        }

        public List<APPRECIATIONDETAILS> GetAppreciationDetails(string projIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@projIds", projIds);
            var appreciationDetails = dbContext.Database.SqlQuery<APPRECIATIONDETAILS>("[dbo].[getAppreciationDetails] @projIds", param1).ToList();
            return appreciationDetails;
        }
        public List<CSS_CUSTOMER_VERIFICATION> GetCSSForVerification(DateTime startDate, DateTime endDate)
        {
            var context = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@StartDate", startDate.ToString("MM/dd/yyyy"));
            SqlParameter param2 = new SqlParameter("@EndDate", endDate.ToString("MM/dd/yyyy"));
            var cssVerificationDetails = context.Database.SqlQuery<CSS_CUSTOMER_VERIFICATION>("[dbo].[CSS_Readiness_Report] @StartDate, @EndDate", param1, param2).ToList();
            return cssVerificationDetails;
        }

        public List<AllProcessList> GetProcessModelListByProcessAreaIds(string processAreaIds)
        {
            var dbContext = new CSPDbContext();
            SqlParameter param1 = new SqlParameter("@processAreaIds", processAreaIds);
            var QueryResult = dbContext.Database.SqlQuery<AllProcessList>("[dbo].[getProcessModelListByProcessAreaIds] @processAreaIds",param1).ToList();
            return QueryResult;
        }
    }
}
