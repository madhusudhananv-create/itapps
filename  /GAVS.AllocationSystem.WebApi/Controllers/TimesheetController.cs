using AttributeRouting.Web.Mvc;

using GAVS.AllocationSystem.Model.AllSys;

using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;

using System.Collections.Generic;

using System.Diagnostics;

using System.Linq;
using System.Net.Http;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers

{
    public partial class AllSysController

    {
        private static DateTime FIRST_DATE = new DateTime(2000, 1, 1);

        [POST("GetCalendarDateRangeForReports")]
        [ActionName("GetCalendarDateRangeForReports")]
        [HttpPost]
        public IHttpActionResult GetCalendarDateRangeForReports(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            TimesheetType timesheetType = JsonConvert.DeserializeObject<TimesheetType>(json);

            if (timesheetType.Period == enDateRange.Weekly)
            {
                timesheetType.DateRange = GetCalendarDateRangeList(timesheetType.SelectedDateRange.StartDate, timesheetType.Period);
                timesheetType.SelectedDateRange = timesheetType.DateRange.FirstOrDefault(t => t.Current == true);
                timesheetType.SelectedDates = new List<string>();
                for (DateTime date = timesheetType.SelectedDateRange.StartDate; date <= timesheetType.SelectedDateRange.EndDate; date = date.AddDays(1))
                    timesheetType.SelectedDates.Add(date.ToString("dd-MMM-yyyy"));
            }
            else if (timesheetType.Period == enDateRange.Monthly)
            {
                DateRange range = new DateRange(timesheetType.SelectedDateRange.StartDate, timesheetType.Period);
                timesheetType.DateRange = GetCalendarDateRangeList(range.StartDate, timesheetType.Period);
                timesheetType.SelectedDateRange = new CalendarDateRange() { Current = true, StartDate = range.StartDate, EndDate = range.EndDate };
                timesheetType.SelectedDates = new List<string>();
                for (DateTime date = timesheetType.SelectedDateRange.StartDate; date <= timesheetType.SelectedDateRange.EndDate; date = date.AddDays(1))
                    timesheetType.SelectedDates.Add(date.ToString("dd-MMM-yyyy"));
            }
            else if (timesheetType.Period == enDateRange.Custom)
            {
                timesheetType.SelectedDates = new List<string>();
                for (DateTime date = timesheetType.SelectedDateRange.StartDate; date <= timesheetType.SelectedDateRange.EndDate; date = date.AddDays(1))
                    timesheetType.SelectedDates.Add(date.ToString("dd-MMM-yyyy"));
            }
            return Ok(timesheetType);
        }

        [GET("GetTimesheetDetailedReportByTask")]
        [ActionName("GetTimesheetDetailedReportByTask")]
        [HttpGet]
        public IHttpActionResult GetTimesheetDetailsByTask()
        {
            var watch = Stopwatch.StartNew();
            string projectId = this.GetHeaderDetails_String("projectId");
            string PeriodType = GetHeaderDetails_String("periodType");
            DateTime StartDate = this.GetHeaderDetails_Date("startDate");
            DateTime EndDate = this.GetHeaderDetails_Date("endDate");
            var projectIds = this.GetHeaderDetails_Array("projectIds");
            var projects = GetTimesheetdata(projectId, PeriodType, StartDate, EndDate, null, projectIds);
            FillResponseTime(watch);
            return Ok(projects);
        }

        [POST("GetTimesheetNewDetailsForApproval")]
        [ActionName("GetTimesheetNewDetailsForApproval")]
        [HttpPost]
        public IHttpActionResult GetTimesheetNewDetailsForApproval(HttpRequestMessage request)
        {
            var watch = Stopwatch.StartNew();
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;

            string customerId = GetHeaderDetails_String("CustId");
            string empId = GetHeaderDetails_String("empid");
            var isGavs = IsGavs(empId);
            var statusCheck = isGavs ? "FOR REVIEW" : "FOR APPROVAL";
            var projectIdList = GetHeaderDetails_Array("projectId");

            DateTime StartDate = this.GetHeaderDetails_Date("startDate");

            DateTime EndDate = this.GetHeaderDetails_Date("endDate");

          var Projects = GetProjectListForUser(empId);
            List<string> projectIds = Projects.Select(t => t.PROJ_ID).Where(x => projectIdList.Contains(x)).ToList();

            var globalProjects = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == customerId).ToList();
            List<EMP_INFO_FOR_CUSTOMER> displayNames = Cldb.EMP_INFO_FOR_CUSTOMER.GetAll().ToList();
            var allCustomerProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(x => x.CUST_ID == customerId).ToList();
            var customerUser = CSPdb.CUSTOMER_USERS.GetAll().FirstOrDefault(x => x.EMAILID == empId);
            var approverProjects = new List<string>();

            if (customerUser != null)
            {
                var customerProjects = allCustomerProjects.Where(x => x.REPORTING && x.CUSTOMER_USER_ID == customerUser.ID).ToList();

                approverProjects = projectIds.Where(x => customerProjects.Any(c => c.PROJ_ID == x)).ToList();

                foreach (var item in projectIds)
                {
                    if (!allCustomerProjects.Any(x => x.PROJ_ID == item && x.REPORTING))
                        approverProjects.Add(item);

                }
            }
            if (isGavs)
            {
                approverProjects = projectIds;
            }

            List<PROJECT> allProjects = globalProjects.Where(t => approverProjects.Contains(t.PARENT_PROJ_ID)).ToList();
            if (isGavs && allProjects.Count > 15)
            {
                //string intEmpId = "0";
              //  if (int.TryParse(empId, out intEmpId))
                    allProjects = allProjects.Where(x => x.PROJ_PM_EMP_ID == empId).ToList();
            }
            projectIds = allProjects.Select(t => t.PROJ_ID).ToList();

            TimesheetType timesheetType = new TimesheetType();
            TIMESHEET_SETTINGS timesheetSettings = Cldb.TIMESHEET_SETTINGS.GetAll().FirstOrDefault(t => t.CUST_ID == customerId);
            timesheetType.Period = (enDateRange)Enum.Parse(typeof(enDateRange), timesheetSettings.TIME_ENTRY_PERIOD, true);

            DateTime dtoldesttimesheetdateforapproval;
            //dtoldesttimesheetdateforapproval = Cldb.AppRepo.GetOldestTimesheetdateAvailableforApproval(cutomerId.ToString());
            var daystoCheck = helper.GetDBConfig("TIMESHEET_DAYS_TO_CHECK", "-1");
            dtoldesttimesheetdateforapproval = DateTime.Now.AddDays(-1 * Convert.ToInt32( daystoCheck));

            List<ProjectTimesheetDetailsEmpByDateRange> lstProjectTimesheetDetailsEmpByDateRange = new List<ProjectTimesheetDetailsEmpByDateRange>();

            if (timesheetType.Period == enDateRange.Monthly)
            {
                dtoldesttimesheetdateforapproval = DateTime.Now.AddDays(-45);
                ProjectTimesheetDetailsEmpByDateRange objprojTimesheet;
                DateRangeModel dtrange = new DateRangeModel(dtoldesttimesheetdateforapproval, enDateRange.Monthly);
                objprojTimesheet = new ProjectTimesheetDetailsEmpByDateRange();
                objprojTimesheet.dtrange = dtrange;

                for (DateTime date = dtrange.startDate; date <= dtrange.endDate; date = date.AddDays(1))
                    objprojTimesheet.tmpSelectedDates.Add(date.ToString("yyyy") + "-" + date.ToString("MMM") + '-' + date.ToString("dd"));

                lstProjectTimesheetDetailsEmpByDateRange.Add(objprojTimesheet);
            }
            else if (timesheetType.Period == enDateRange.Weekly)
            {
                ProjectTimesheetDetailsEmpByDateRange objprojTimesheet;

                DateRangeModel dtrange = new DateRangeModel(dtoldesttimesheetdateforapproval, enDateRange.Weekly);
                objprojTimesheet = new ProjectTimesheetDetailsEmpByDateRange();
                objprojTimesheet.dtrange = dtrange;

                for (DateTime date = dtrange.startDate; date <= dtrange.endDate; date = date.AddDays(1))
                    objprojTimesheet.tmpSelectedDates.Add(date.ToString("yyyy") + "-" + date.ToString("MMM") + '-' + date.ToString("dd"));

                lstProjectTimesheetDetailsEmpByDateRange.Add(objprojTimesheet);

                while (!(DateTime.Today >= dtrange.startDate && DateTime.Today <= dtrange.endDate))
                {
                    dtrange = new DateRangeModel(dtrange.endDate.AddDays(1), enDateRange.Weekly);
                    objprojTimesheet = new ProjectTimesheetDetailsEmpByDateRange();
                    objprojTimesheet.dtrange = dtrange;

                    for (DateTime date = dtrange.startDate; date <= dtrange.endDate; date = date.AddDays(1))
                        objprojTimesheet.tmpSelectedDates.Add(date.ToString("yyyy") + "-" + date.ToString("MMM") + '-' + date.ToString("dd"));

                    lstProjectTimesheetDetailsEmpByDateRange.Add(objprojTimesheet);
                }

            }

            List<PROJECT> projDetails = globalProjects.Where(proj => proj.CUST_ID == customerId).ToList<PROJECT>();

            projDetails = projDetails.Where(t => projectIds.Contains(t.PROJ_ID)).ToList();

            List<string> ProjIdsWithBillingProjId = projDetails.Select(t => t.PROJ_ID).ToList();

            List<PROJECT_RESOURCE> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => (ProjIdsWithBillingProjId.Contains(t.PROJ_ID)) && t.BILL_FLG == true && t.ID != null && t.END_DATE >= dtoldesttimesheetdateforapproval).ToList();

            List<PROJECT_RESOURCE_EXT> employeesWithBillingProjId = new List<PROJECT_RESOURCE_EXT>();
            foreach (PROJECT_RESOURCE PR in employees)
            {
                string s = JsonConvert.SerializeObject(PR);
                PROJECT_RESOURCE_EXT tmp = JsonConvert.DeserializeObject<PROJECT_RESOURCE_EXT>(s);
                tmp.PARENT_PROJ_ID = globalProjects.FirstOrDefault(t => t.PROJ_ID == PR.PROJ_ID).PARENT_PROJ_ID;
                if (!employeesWithBillingProjId.Any(x => x.EMP_ID == tmp.EMP_ID && x.PROJ_ID == tmp.PROJ_ID))
                    employeesWithBillingProjId.Add(tmp);
            }

            var projectGroup = employeesWithBillingProjId.GroupBy(t => t.PARENT_PROJ_ID);

            foreach (ProjectTimesheetDetailsEmpByDateRange objtimesheetbydaterange in lstProjectTimesheetDetailsEmpByDateRange)
            {
                List<ProjectTimesheetDetailsEmp> projectTimesheet = new List<ProjectTimesheetDetailsEmp>();
                int startDateId = GetDateDim(objtimesheetbydaterange.dtrange.startDate);
                int endDateId = GetDateDim(objtimesheetbydaterange.dtrange.endDate);

                foreach (var p in projectGroup)
                {
                    ProjectTimesheetDetailsEmp timesheets = new ProjectTimesheetDetailsEmp();
                    timesheets.PROJ_ID = p.Key;
                    var proj = projDetails.FirstOrDefault(t => t.PROJ_ID == p.Key);
                    timesheets.PROJ_NM = proj.PROJ_NM;

                    timesheets.displayName = objtimesheetbydaterange.dtrange.startDate.ToString("dd") + "-" + objtimesheetbydaterange.dtrange.startDate.ToString("MMM") + "-" + objtimesheetbydaterange.dtrange.startDate.ToString("yyyy");
                    timesheets.displayName = timesheets.displayName + " - " + objtimesheetbydaterange.dtrange.endDate.ToString("dd") + "-" + objtimesheetbydaterange.dtrange.endDate.ToString("MMM") + "-" + objtimesheetbydaterange.dtrange.endDate.ToString("yyyy");

                    timesheets.PROJ_ALIAS_NM = proj.PROJ_ALIAS_NM;
                    timesheets.employees = new List<EmployeeTimesheetDetails>();
                    foreach (PROJECT_RESOURCE_EXT emp in p.ToList())
                    {
                        var timeEntries = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(x => x.EMP_ID == emp.EMP_ID && x.DATE_ID >= startDateId && x.DATE_ID <= endDateId
                                                         && x.PROJ_ID == emp.PROJ_ID && x.TIME_ENTRY_STATUS.ToUpper() == statusCheck).ToList();
                        if (!isGavs && !timeEntries.Any()) continue;
                        EmployeeTimesheetDetails employee = new EmployeeTimesheetDetails();
                        employee.EMP_ID = emp.EMP_ID;
                        employee.PROJ_ID = timesheets.PROJ_ID;
                        employee.BILLING_PROJ_ID = emp.PROJ_ID;

                        var emp_info = Cldb.EMP_INFO.GetById(emp.EMP_ID);
                        var displayName = displayNames.FirstOrDefault(x => x.EMP_ID == emp.EMP_ID)?.DISPLAY_NAME;
                        employee.FRST_NM = emp_info.NAME_IN_US_FORMAT ?? displayName ?? emp_info.FRST_NM;

                        //employee.TIMESHEET = Cldb.AppRepo.TimesheetDetailsMonthly(emp.EMP_ID, emp.PARENT_PROJ_ID, emp.PROJ_ID, objtimesheetbydaterange.dtrange.startDate, objtimesheetbydaterange.dtrange.endDate).ToList();

                        foreach (var item in timeEntries.Where(x => string.IsNullOrWhiteSpace( x.TASK_NAME ) || x.PROJ_TASK_ID!=1))
                        {
                            if (item.PROJ_TASK_ID == 5)
                                item.TASK_NAME = "Holiday";
                            else if (item.PROJ_TASK_ID == 3)
                                item.TASK_NAME = "Leave";
                            
                        }
                        employee.TIMESHEET = new List<TimesheetDetailsMonthly>();

                        foreach (var g in timeEntries.GroupBy(x => x.TASK_NAME))
                        {
                            for (int i = startDateId; i <= endDateId; i++)
                            {
                                if (g.Any(x => x.DATE_ID == i))
                                {
                                    employee.TIMESHEET.Add(CreateTimesheetDetailsMonthly(g, employee.FRST_NM));
                                }
                                else
                                {
                                    var newrecord = new TimesheetDetailsMonthly
                                    {
                                        DATE_ID = i,
                                        EMP_ID = employee.EMP_ID,
                                        FRST_NM = employee.FRST_NM,
                                        PROJ_TASK = g.Key,
                                    };
                                    FillDateDetails(newrecord);
                                    employee.TIMESHEET.Add(newrecord);
                                }
                            }
                        }

                        employee.TIMESHEET = timeEntries.GroupBy(x => new { x.TASK_NAME, x.DATE_ID }).Select(x => CreateTimesheetDetailsMonthly(x, employee.FRST_NM)).ToList();

                        if (employee.TIMESHEET.Any(x => x.TIME_ENTRY_STATUS == statusCheck))
                        {
                            foreach (var item in employee.TIMESHEET)
                            {
                                if (item.TIME_ENTRY_STATUS != statusCheck)
                                {
                                    item.PROJ_RESRC_TIME_ENTRY_ID = null;
                                    item.CLOCKED_MINS = null;
                                    item.TIME_ENTRY_STATUS = null;
                                }
                            }
                        }
                        else
                        {
                            var newrecord = new TimesheetDetailsMonthly
                            {
                                DATE_ID = startDateId,
                                EMP_ID = employee.EMP_ID,
                                FRST_NM = employee.FRST_NM,
                                PROJ_ID = timesheets.PROJ_ID,
                                PROJ_TASK = "General",
                                DUMMY = true,
                            };
                            FillDateDetails(newrecord);
                            employee.TIMESHEET = new List<TimesheetDetailsMonthly> { newrecord };
                            employee.DUMMY = true;
                        }

                        employee.TOTAL = employee.TIMESHEET.Select(t => t.CLOCKED_MINS ?? 0).Sum();
                        //employee.WAITING_FOR_APPROVAL = employee.TIMESHEET.Select(t => t.TIME_ENTRY_STATUS == "FOR APPROVAL").Count();

                        timesheets.TOTAL_HOURS += employee.TOTAL;
                        //timesheets.WAITING_FOR_APPROVAL = employee.TIMESHEET.Select(t => t.TIME_ENTRY_STATUS == "FOR APPROVAL").Count();

                        employee.STATUS = GetTimesheetStatus(employee.TIMESHEET);
                        employee.COMMENTS = GetTimesheetComments(employee.TIMESHEET);
                        employee.REJECT_DESC = GetTimesheetRejectDescription(employee.TIMESHEET);
                        //if (Status == string.Empty)
                        //    timesheets.employees.Add(employee);
                        //else if (employee.TIMESHEET.Count > 0 && lstStatus.Contains(GetTimesheetStatus(employee.TIMESHEET)))

                        employee.startdate = emp.START_DATE;
                        employee.enddate = emp.END_DATE;

                        //if (employee.TOTAL > 0) //bk30Aug2019
                        //if (employee.STATUS != string.Empty) //bk30Aug2019
                        timesheets.employees.Add(employee);

                    }
                    timesheets.employees = timesheets.employees.OrderBy(t => t.EMP_ID).ToList<EmployeeTimesheetDetails>();

                    if (timesheets.employees.Any())
                    {
                        timesheets.TOTAL_EMPLOYEES = timesheets.employees.Count;
                        projectTimesheet.Add(timesheets);
                    }
                }
                projectTimesheet = projectTimesheet.OrderBy(t => t.PROJ_NM).ToList();

                objtimesheetbydaterange.multipleProjectTimesheets = projectTimesheet;
            }
            var result = lstProjectTimesheetDetailsEmpByDateRange.Where(temp => temp.multipleProjectTimesheets.Where(x => x.employees.Any() && x.employees.Any(e => e.TIMESHEET.Any(a => a.DUMMY == false))).Any()).OrderByDescending(sel => sel.dtrange.startDate).ToList();
            FillResponseTime(watch);
            return Ok(result);
        }

        private List<ProjectTimesheetDetailsEmp> GetTimesheetdata(string projectIdOld, string PeriodType, DateTime StartDate, DateTime EndDate, string status, List<string> projectIds)
        {
            if (projectIds == null || !projectIds.Any()) projectIds = new List<string> { projectIdOld };
            string Status = string.Empty;
            List<string> lstStatus = new List<string>();
            if (Request.Headers.Contains("status"))
            {
                Status = Request.Headers.GetValues("status").ToList()[0];
                lstStatus = Status.Split(',').ToList<string>();
            }
            string empStatus = string.Empty;

            List<string> projectsWithParent = Cldb.PROJECT.GetAll().Where(t => projectIds.Contains(t.PROJ_ID)).Select(t => t.PROJ_ID).ToList();
            var result = new List<ProjectTimesheetDetailsEmp>();
            foreach (var projectId in projectIds)
            {
                PROJECT proj = Cldb.PROJECT.GetAll().Where(t => t.PROJ_ID == projectId).FirstOrDefault();

                ProjectTimesheetDetailsEmp projects = new ProjectTimesheetDetailsEmp();
                projects.PROJ_ID = projectId;
                projects.PROJ_NM = proj.PROJ_NM;
                projects.PROJ_ALIAS_NM = proj.PROJ_ALIAS_NM;
                projects.employees = new List<EmployeeTimesheetDetails>();

                List<PROJECT_RESOURCE> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => projectsWithParent.Contains(t.PROJ_ID) && t.BILL_FLG == true
                && ((StartDate >= t.START_DATE && StartDate <= t.END_DATE) || (EndDate >= t.START_DATE && EndDate <= t.END_DATE))).ToList();
                var empIds = employees.Select(x => x.EMP_ID).ToList();
                List<EMP_INFO_FOR_CUSTOMER> empInfoList = Cldb.EMP_INFO_FOR_CUSTOMER.GetAll().Where(t => empIds.Contains(t.EMP_ID)).ToList();

                int startDateId = GetDateDim(StartDate);
                int endDateId = GetDateDim(EndDate);

                var alltimeEntries = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(x => empIds.Contains(x.EMP_ID) && x.DATE_ID >= startDateId && x.DATE_ID <= endDateId
                                                                && x.PROJ_ID == projectId).ToList();

                foreach (var item in alltimeEntries.Where(x => string.IsNullOrWhiteSpace( x.TASK_NAME) || x.PROJ_TASK_ID != 1))
                {
                    if (item.PROJ_TASK_ID == 5)
                        item.TASK_NAME = "Holiday";
                    else if (item.PROJ_TASK_ID == 3)
                        item.TASK_NAME = "Leave";
                    else
                        item.TASK_NAME = "General";
                }
                projects.TASKNAMES = alltimeEntries.Select(x => x.TASK_NAME ?? "General").Distinct().ToList();
                foreach (var taskname in projects.TASKNAMES)
                {
                    foreach (PROJECT_RESOURCE emp in employees)
                    {
                        var timeentries = alltimeEntries.Where(x => x.EMP_ID == emp.EMP_ID && x.DATE_ID >= startDateId && x.DATE_ID <= endDateId
                                                                  && x.PROJ_ID == emp.PROJ_ID && x.TASK_NAME == taskname).ToList();

                        if (!timeentries.Any()) continue;
                        EmployeeTimesheetDetails employee = new EmployeeTimesheetDetails();
                        employee.EMP_ID = emp.EMP_ID;
                        employee.BILLING_PROJ_ID = emp.PROJ_ID;
                        employee.TASK_NAME = taskname ?? "General";
                        employee.PROJ_NM = projects.PROJ_NM;
                        if (empInfoList.Any(x => x.EMP_ID == employee.EMP_ID))
                        {
                            employee.FRST_NM = empInfoList.First(x => x.EMP_ID == employee.EMP_ID).DISPLAY_NAME;
                        }
                        else
                        {
                            employee.FRST_NM = Cldb.EMP_INFO.GetById(emp.EMP_ID).FRST_NM;
                        }
                        //List<EMP_INFO_FOR_CUSTOMER> DISPLAYNAME = Cldb.EMP_INFO_FOR_CUSTOMER.GetAll().Where(t => t.EMP_ID == employee.EMP_ID).ToList();

                        //if (DISPLAYNAME.Count == 0)
                        //{
                        //    employee.FRST_NM = Cldb.EMP_INFO.GetById(emp.EMP_ID).FRST_NM;
                        //}

                        //foreach (var DNAME in DISPLAYNAME)
                        //{
                        //    if (emp.EMP_ID == DNAME.EMP_ID)
                        //    {
                        //        employee.FRST_NM = Cldb.EMP_INFO_FOR_CUSTOMER.GetById(emp.EMP_ID).DISPLAY_NAME;
                        //    }
                        //}

                        //employee.TIMESHEET = Cldb.AppRepo.TimesheetDetailsMonthly(emp.EMP_ID, projectId, emp.PROJ_ID, StartDate, EndDate).ToList<TimesheetDetailsMonthly>(); //bak

                        employee.TIMESHEET = timeentries.GroupBy(x => new { x.TASK_NAME, x.DATE_ID }).Select(x => CreateTimesheetDetailsMonthly(x, employee.FRST_NM)).ToList();

                        employee.startdate = emp.START_DATE;
                        employee.enddate = emp.END_DATE;

                        employee.TOTAL = employee.TIMESHEET.Select(t => t.CLOCKED_MINS ?? 0).Sum();
                        employee.STATUS = GetTimesheetStatus(employee.TIMESHEET);
                        employee.COMMENTS = GetTimesheetComments(employee.TIMESHEET);
                        employee.REJECT_DESC = GetTimesheetRejectDescription(employee.TIMESHEET);
                        employee.APPROVED_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "APPROVED").Sum(x => x.CLOCKED_MINS.Value);
                        employee.FORREVIEW_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "FOR REVIEW").Sum(x => x.CLOCKED_MINS.Value);
                        employee.FORAPPROVAL_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "FOR APPROVAL").Sum(x => x.CLOCKED_MINS.Value);
                        employee.REJECTED_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "CUSTOMER REJECT").Sum(x => x.CLOCKED_MINS.Value);
                        if (Status == string.Empty)
                        {
                            projects.employees.Add(employee);
                        }
                        else if (employee.TIMESHEET.Count > 0 && employee.TOTAL > 0 && lstStatus.Contains(this.GetTimesheetStatus(employee.TIMESHEET)))
                        {
                            projects.employees.Add(employee);
                        }
                        else if (employee.TOTAL > 0 && employee.STATUS.Contains(","))
                        {
                            projects.employees.Add(employee);
                        }
                    }
                }
                projects.employees = projects.employees.ToList<EmployeeTimesheetDetails>();
                result.Add(projects);
            }

            return result;
        }

        [GET("GetTimesheetDetailsNew")]
        [ActionName("GetTimesheetDetailsNew")]
        [HttpGet]
        public IHttpActionResult GetTimesheetDetailsNew()

        {
            var watch = Stopwatch.StartNew();

            string projectId = this.GetHeaderDetails_String("projectId");

            string PeriodType = GetHeaderDetails_String("periodType");

            DateTime StartDate = this.GetHeaderDetails_Date("startDate");

            DateTime EndDate = this.GetHeaderDetails_Date("endDate");

            if (PeriodType != string.Empty)

            {
                enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), PeriodType, true);

                if (enPeriod == enDateRange.Monthly)

                {
                    DateRange dtRange = new DateRange(StartDate, enPeriod);

                    EndDate = dtRange.EndDate;
                }
            }

            string Status = string.Empty;

            List<string> lstStatus = new List<string>();

            if (Request.Headers.Contains("status"))

            {
                Status = Request.Headers.GetValues("status").ToList()[0];

                lstStatus = Status.Split(',').ToList<string>();
            }

            string empStatus = string.Empty;

            List<string> projectsWithParent = Cldb.PROJECT.GetAll().Where(t => t.PROJ_ID == projectId || t.PARENT_PROJ_ID == projectId).Select(t => t.PROJ_ID).ToList();

            PROJECT proj = Cldb.PROJECT.GetAll().Where(t => t.PROJ_ID == projectId).FirstOrDefault();

            ProjectTimesheetDetailsEmp projects = new ProjectTimesheetDetailsEmp();

            projects.PROJ_ID = projectId;

            projects.PROJ_NM = proj.PROJ_NM;

            projects.PROJ_ALIAS_NM = proj.PROJ_ALIAS_NM;

            projects.employees = new List<EmployeeTimesheetDetails>();

            List<PROJECT_RESOURCE> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => projectsWithParent.Contains(t.PROJ_ID) && t.BILL_FLG == true

            && ((StartDate >= t.START_DATE && StartDate <= t.END_DATE) || (EndDate >= t.START_DATE && EndDate <= t.END_DATE))).ToList();

            //List<int> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => projectsWithParent.Contains(t.PROJ_ID) && t.BILL_FLG == true).Select(t => t.EMP_ID).Distinct().ToList<int>();

            foreach (PROJECT_RESOURCE emp in employees)

            {
                if ((StartDate >= emp.START_DATE && StartDate <= emp.END_DATE) ||

                                (EndDate >= emp.START_DATE && EndDate <= emp.END_DATE))

                {
                    EmployeeTimesheetDetails employee = new EmployeeTimesheetDetails();

                    //PROJECT_RESOURCE filterEmployeeData = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projectId && t.EMP_ID == emp.EMP_ID).FirstOrDefault();

                    employee.EMP_ID = emp.EMP_ID;

                    employee.BILLING_PROJ_ID = emp.PROJ_ID;

                    var empEty = Cldb.EMP_INFO.GetById(emp.EMP_ID);

                    //employee.FRST_NM = empEty.us

                    //foreach (var DNAME in DISPLAYNAME)

                    //{
                    //    if (emp.EMP_ID == DNAME.EMP_ID)

                    // {
                    // = Cldb.EMP_INFO_FOR_CUSTOMER.GetById(emp.EMP_ID).DISPLAY_NAME;

                    // }

                    //}

                    // employee.FRST_NM = Cldb.EMP_INFO.GetById(emp.EMP_ID).FRST_NM;

                    employee.TIMESHEET = Cldb.AppRepo.TimesheetDetailsMonthly(emp.EMP_ID, projectId, emp.PROJ_ID, StartDate, EndDate).ToList<TimesheetDetailsMonthly>(); //bak

                    if (employee.TIMESHEET.Count > 0 && Status != string.Empty)

                    {
                        // employee.TIMESHEET = employee.TIMESHEET.Where(t => lstStatus.Contains(t.TIME_ENTRY_STATUS)).ToList();

                        foreach (TimesheetDetailsMonthly objtsdmonth in employee.TIMESHEET)

                        {
                            //if (!lstStatus.Contains(objtsdmonth.TIME_ENTRY_STATUS))

                            //{
                            //    objtsdmonth.TIME_ENTRY_STATUS = Status;

                            // objtsdmonth.CLOCKED_MINS = 0;

                            //}
                        }
                    }

                    employee.startdate = emp.START_DATE;//

                    employee.enddate = emp.END_DATE; //

                    var statuses = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS)).Select(x => x.TIME_ENTRY_STATUS).Distinct().ToList();

                    if (statuses.Count > 1)

                    {
                        projects.employees.AddRange(CreateMultipleTimesheetRecords(employee));

                        continue;
                    }

                    employee.TOTAL = employee.TIMESHEET.Select(t => t.CLOCKED_MINS ?? 0).Sum();

                    employee.STATUS = GetTimesheetStatus(employee.TIMESHEET);

                    employee.COMMENTS = GetTimesheetComments(employee.TIMESHEET);

                    employee.REJECT_DESC = GetTimesheetRejectDescription(employee.TIMESHEET);

                    //List<PROJECT_RESOURCE> lstObj = Cldb.AppRepo.TimeSheetTaggedProjectByProjId(StartDate,EndDate,employee.startdate,employee.enddate,projectId).ToList<PROJECT_RESOURCE>();

                    if (Status == string.Empty)  //&& employee.TOTAL > 0

                    {
                        projects.employees.Add(employee);
                    }
                    else if (employee.TIMESHEET.Count > 0 && employee.TOTAL > 0 && lstStatus.Contains(this.GetTimesheetStatus(employee.TIMESHEET)))

                    {
                        projects.employees.Add(employee);
                    }
                    else if (employee.TOTAL > 0 && employee.STATUS.Contains(","))

                    {
                        //foreach (TimesheetDetailsMonthly objtsdmonth2 in employee.TIMESHEET)

                        //{
                        //    if (!string.IsNullOrWhiteSpace(objtsdmonth2.TIME_ENTRY_STATUS) &&!objtsdmonth2.TIME_ENTRY_STATUS.Contains(","))

                        // { empStatus = objtsdmonth2.TIME_ENTRY_STATUS;

                        // }

                        //}

                        //if (!string.IsNullOrEmpty(empStatus))

                        //{
                        //    employee.STATUS = empStatus;

                        //}

                        projects.employees.Add(employee);
                    }
                }
            }

            projects.employees = projects.employees.OrderBy(t => t.FRST_NM).ToList<EmployeeTimesheetDetails>();

            FillResponseTime(watch);

            return Ok(projects);
        }

        [GET("GetTimesheetReportByProjectId")]
        [ActionName("GetTimesheetReportByProjectId")]
        [HttpGet]
        public IHttpActionResult GetTimesheetReportByProjectId()
        {
            string projectIdOld = this.GetHeaderDetails_String("projectId");
            string PeriodType = GetHeaderDetails_String("periodType");
            DateTime StartDate = this.GetHeaderDetails_Date("startDate");
            DateTime EndDate = this.GetHeaderDetails_Date("endDate");
            var projectIds = this.GetHeaderDetails_Array("projectIds");
            if (projectIds == null || projectIds.Count == 0)
                projectIds = new List<string> { projectIdOld };
            if (PeriodType != string.Empty)
            {
                enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), PeriodType, true);
                if (enPeriod == enDateRange.Monthly)
                {
                    DateRange dtRange = new DateRange(StartDate, enPeriod);
                    EndDate = dtRange.EndDate;
                }
            }

            string Status = string.Empty;
            List<string> lstStatus = new List<string>();
            if (Request.Headers.Contains("status"))
            {
                Status = Request.Headers.GetValues("status").ToList()[0];
                lstStatus = Status.Split(',').ToList<string>();
            }
            string empStatus = string.Empty;

            List<string> projectsWithParent = Cldb.PROJECT.GetAll().Where(t => projectIds.Contains(t.PROJ_ID)).Select(t => t.PROJ_ID).ToList();
            var result = new List<ProjectTimesheetDetailsEmp>();

            foreach (var projectId in projectIds)
            {


                PROJECT proj = Cldb.PROJECT.GetAll().Where(t => t.PROJ_ID == projectId).FirstOrDefault();
                ProjectTimesheetDetailsEmp projects = new ProjectTimesheetDetailsEmp();
                projects.PROJ_ID = projectId;
                projects.PROJ_NM = proj.PROJ_NM;
                projects.PROJ_ALIAS_NM = proj.PROJ_ALIAS_NM;
                projects.employees = new List<EmployeeTimesheetDetails>();

                //List<PROJECT_RESOURCE> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => projectsWithParent.Contains(t.PROJ_ID) && t.BILL_FLG == true
                //&& ((StartDate >= t.START_DATE && StartDate <= t.END_DATE) || (EndDate >= t.START_DATE && EndDate <= t.END_DATE))).ToList();
             
    List<PROJECT_RESOURCE> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projectId && t.BILL_FLG == true
                && ((StartDate >= t.START_DATE && StartDate <= t.END_DATE) || (EndDate >= t.START_DATE && EndDate <= t.END_DATE))).ToList();
 

                var empIds = employees.Select(x => x.EMP_ID).ToList();
                //List<int> employees = Cldb.PROJECT_RESOURCE.GetAll().Where(t => projectsWithParent.Contains(t.PROJ_ID) && t.BILL_FLG == true).Select(t => t.EMP_ID).Distinct().ToList<int>();
                List<EMP_INFO_FOR_CUSTOMER> empInfoList = Cldb.EMP_INFO_FOR_CUSTOMER.GetAll().Where(t => empIds.Contains(t.EMP_ID)).ToList();

                foreach (PROJECT_RESOURCE emp in employees)
                {
                    EmployeeTimesheetDetails employee = new EmployeeTimesheetDetails();
                    //PROJECT_RESOURCE filterEmployeeData = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.PROJ_ID == projectId && t.EMP_ID == emp.EMP_ID).FirstOrDefault();
                    employee.EMP_ID = emp.EMP_ID;
                    employee.BILLING_PROJ_ID = emp.PROJ_ID;
                    if (empInfoList.Any(x => x.EMP_ID == employee.EMP_ID))
                    {
                        employee.FRST_NM = empInfoList.First(x => x.EMP_ID == employee.EMP_ID).DISPLAY_NAME;
                    }
                    else
                    {
                        employee.FRST_NM = Cldb.EMP_INFO.GetById(emp.EMP_ID).FRST_NM;
                    }

                    //foreach (var DNAME in DISPLAYNAME)
                    //{
                    //    if (emp.EMP_ID == DNAME.EMP_ID)
                    //    {
                    //        employee.FRST_NM = Cldb.EMP_INFO_FOR_CUSTOMER.GetById(emp.EMP_ID).DISPLAY_NAME;
                    //    }
                    //}

                    // employee.FRST_NM = Cldb.EMP_INFO.GetById(emp.EMP_ID).FRST_NM;
                    employee.TIMESHEET = Cldb.AppRepo.TimesheetDetailsMonthly(emp.EMP_ID, projectId, emp.PROJ_ID, StartDate, EndDate).ToList<TimesheetDetailsMonthly>(); //bak
                    foreach (var ti in employee.TIMESHEET)
                    {
                        if (string.IsNullOrWhiteSpace(ti.TASK_DESC))
                            ti.PROJ_TASK = "General";
                        //ti.FIRST_NAME = employee.FRST_NM;
                        //ti.TOTAL = employee.TOTAL;
                    }

                    employee.startdate = emp.START_DATE;//
                    employee.enddate = emp.END_DATE; //
                                                     //var statuses = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS)).Select(x => x.TIME_ENTRY_STATUS).Distinct().ToList();
                                                     //if (statuses.Count > 1)
                                                     //{
                                                     //    projects.employees.AddRange(CreateMultipleTimesheetRecords(employee));
                                                     //    continue;
                                                     //}
                    employee.APPROVED_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "APPROVED").Sum(x => x.CLOCKED_MINS.Value);
                    employee.FORREVIEW_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "FOR REVIEW").Sum(x => x.CLOCKED_MINS.Value);
                    employee.FORAPPROVAL_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "FOR APPROVAL").Sum(x => x.CLOCKED_MINS.Value);
                    employee.REJECTED_TOTAL = employee.TIMESHEET.Where(x => !string.IsNullOrWhiteSpace(x.TIME_ENTRY_STATUS) && x.TIME_ENTRY_STATUS.ToUpper() == "CUSTOMER REJECT").Sum(x => x.CLOCKED_MINS.Value);
                    employee.TOTAL = employee.TIMESHEET.Select(t => t.CLOCKED_MINS ?? 0).Sum();
                    employee.STATUS = GetTimesheetStatus(employee.TIMESHEET);
                    employee.COMMENTS = GetTimesheetComments(employee.TIMESHEET);
                    employee.REJECT_DESC = GetTimesheetRejectDescription(employee.TIMESHEET);

                    if (Status == string.Empty)
                    {
                        projects.employees.Add(employee);
                    }
                    else if (employee.TIMESHEET.Count > 0 && employee.TOTAL > 0 && lstStatus.Contains(this.GetTimesheetStatus(employee.TIMESHEET)))
                    {
                        projects.employees.Add(employee);
                    }
                    else if (employee.TOTAL > 0 && employee.STATUS.Contains(","))
                    {


                        projects.employees.Add(employee);
                    }
                }
                projects.employees = projects.employees.OrderBy(t => t.FRST_NM).ToList<EmployeeTimesheetDetails>();
                result.Add(projects);
            }
            return Ok(result);
        }

        [POST("ApproveMultipleProjectTimesheetsMultipleRangeNew")]
        [ActionName("ApproveMultipleProjectTimesheetsMultipleRangeNew")]
        [HttpPost]
        public IHttpActionResult ApproveMultipleProjectTimesheetsMultipleRangeNew(HttpRequestMessage request)
        {
            var watch = Stopwatch.StartNew();
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            string period = this.GetHeaderDetails_String("period");
            // string period = this.GetHeaderDetails_String("period");
            //enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), period, true);
            //DateTime StartDate = this.GetHeaderDetails_Date("startDate");
            //DateTime EndDate = this.GetHeaderDetails_Date("endDate");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            bool returnStatus = true; //test
            try
            {
                List<ProjectTimesheetDetailsEmpMultipleRange> ProjectTimesheetsMultipleRange = JsonConvert.DeserializeObject<List<ProjectTimesheetDetailsEmpMultipleRange>>(json);
                List<PROJ_RESRC_TIME_ENTRY> updateRecords = new List<PROJ_RESRC_TIME_ENTRY>();

                foreach (ProjectTimesheetDetailsEmpMultipleRange objProjectTimesheetDetailsEmp in ProjectTimesheetsMultipleRange)
                {
                    List<ProjectTimesheetDetailsEmp> ProjectTimesheets = new List<ProjectTimesheetDetailsEmp>();
                    ProjectTimesheets = objProjectTimesheetDetailsEmp.multipleProjectTimesheets;

                    foreach (ProjectTimesheetDetailsEmp projectTimesheet in ProjectTimesheets)
                    {
                        List<EmployeeTimesheetDetails> lstEmployees = projectTimesheet.employees.Where(t => t.SELECTED == true).ToList();

                        foreach (EmployeeTimesheetDetails employee in lstEmployees)
                        {
                            foreach (TimesheetDetailsMonthly timesheet in employee.TIMESHEET)
                            {
                                if (timesheet != null && timesheet.PROJ_RESRC_TIME_ENTRY_ID != null)
                                {
                                    PROJ_RESRC_TIME_ENTRY newTS = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(t => t.PROJ_RESRC_TIME_ENTRY_ID == timesheet.PROJ_RESRC_TIME_ENTRY_ID);
                                    if (newTS.TIME_ENTRY_STATUS == timesheet.TIME_ENTRY_STATUS) continue;
                                    //newTS.PROJ_ID = timesheet.PROJ_ID;
                                    //newTS.BILLING_PROJ_ID = employee.BILLING_PROJ_ID;
                                    //newTS.EMP_ID = timesheet.EMP_ID;
                                    //newTS.DATE_ID = timesheet.DATE_ID;
                                    //newTS.PROJ_TASK_ID = timesheet.PROJ_TASK_ID;
                                    //newTS.TASK_DESC = timesheet.TASK_DESC;
                                    //if (timesheet.CLOCKED_MINS == null)
                                    //    newTS.CLOCKED_MINS = 0;
                                    //else
                                    //    newTS.CLOCKED_MINS = timesheet.CLOCKED_MINS;
                                    newTS.TIME_ENTRY_STATUS = timesheet.TIME_ENTRY_STATUS;
                                    newTS.OTHER_DETAILS = timesheet.OTHER_DETAILS;
                                    newTS.APPRL_DATE = timesheet.APPRL_DATE;
                                    newTS.REJECT_DATE = timesheet.REJECT_DATE;
                                    newTS.REJECT_DESC = timesheet.REJECT_DESC;
                                    timesheet.PROJ_TASK = newTS.TASK_NAME;
                                    newTS.UPDATED_BY = empId;
                                    newTS.UPDATED_DATE = DateTime.Now;
                                    updateRecords.Add(newTS);
                                }
                            }
                        }
                    }

                    if (updateRecords.Any())
                    {
                        enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), period, true);
                        DateTime StartDate = objProjectTimesheetDetailsEmp.dtrange.startDate;
                        DateTime EndDate = objProjectTimesheetDetailsEmp.dtrange.endDate;
                        Cldb.AppRepo.Update_PROJ_RESRC_TIME_ENTRY_PSA(ToDataTable(updateRecords));
                        UpdatePSANew(updateRecords, empId);
                        SendTimeSheetMailMultipleProjects(ProjectTimesheets, empId, enPeriod, StartDate, EndDate);
                    }

                }

            }
            catch (Exception ex)
            {
                Logger l = new Logger(Request, ex);
                returnStatus = false;
                SendErrorNotificationMail(ex.Message, ex.StackTrace);
            }
            FillResponseTime(watch);
            return Ok(returnStatus);
        }

        [POST("UpdateMultipleProjectTimesheetsMultipleRange")]
        [ActionName("UpdateMultipleProjectTimesheetsMultipleRange")]
        [HttpPost]
        public IHttpActionResult UpdateMultipleProjectTimesheetsMultipleRange(HttpRequestMessage request)
        {
            var watch = Stopwatch.StartNew();
            string empId = Request.Headers.GetValues("empId").ToList()[0];
            string period = this.GetHeaderDetails_String("period");
            // string period = this.GetHeaderDetails_String("period");
            //enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), period, true);
            //DateTime StartDate = this.GetHeaderDetails_Date("startDate");
            //DateTime EndDate = this.GetHeaderDetails_Date("endDate");
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            bool returnStatus = true; //test
            string status = null;
            try
            {
                List<ProjectTimesheetDetailsEmpMultipleRange> ProjectTimesheetsMultipleRange = JsonConvert.DeserializeObject<List<ProjectTimesheetDetailsEmpMultipleRange>>(json);
                List<PROJ_RESRC_TIME_ENTRY> updateRecords = new List<PROJ_RESRC_TIME_ENTRY>();

                foreach (ProjectTimesheetDetailsEmpMultipleRange objProjectTimesheetDetailsEmp in ProjectTimesheetsMultipleRange)
                {
                    List<ProjectTimesheetDetailsEmp> ProjectTimesheets = new List<ProjectTimesheetDetailsEmp>();
                    ProjectTimesheets = objProjectTimesheetDetailsEmp.multipleProjectTimesheets;

                    foreach (ProjectTimesheetDetailsEmp projectTimesheet in ProjectTimesheets)
                    {
                        List<EmployeeTimesheetDetails> lstEmployees = projectTimesheet.employees.Where(t => t.SELECTED == true).ToList();

                        foreach (EmployeeTimesheetDetails employee in lstEmployees)
                        {
                            employee.DUMMY = true;
                            foreach (TimesheetDetailsMonthly timesheet in employee.TIMESHEET)
                            {
                                if (timesheet != null && timesheet.PROJ_RESRC_TIME_ENTRY_ID != null)
                                {
                                    PROJ_RESRC_TIME_ENTRY newTS = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(t => t.PROJ_RESRC_TIME_ENTRY_ID == timesheet.PROJ_RESRC_TIME_ENTRY_ID);
                                    if (newTS.TIME_ENTRY_STATUS == timesheet.TIME_ENTRY_STATUS) continue;
                                    //newTS.PROJ_ID = timesheet.PROJ_ID;
                                    //newTS.BILLING_PROJ_ID = employee.BILLING_PROJ_ID;
                                    //newTS.EMP_ID = timesheet.EMP_ID;
                                    //newTS.DATE_ID = timesheet.DATE_ID;
                                    //newTS.PROJ_TASK_ID = timesheet.PROJ_TASK_ID;
                                    //newTS.TASK_DESC = timesheet.TASK_DESC;
                                    //if (timesheet.CLOCKED_MINS == null)
                                    //    newTS.CLOCKED_MINS = 0;
                                    //else
                                    //    newTS.CLOCKED_MINS = timesheet.CLOCKED_MINS;
                                    newTS.TIME_ENTRY_STATUS = timesheet.TIME_ENTRY_STATUS;
                                    newTS.OTHER_DETAILS = timesheet.OTHER_DETAILS;
                                    //newTS.APPRL_DATE = timesheet.APPRL_DATE;
                                    //newTS.REJECT_DATE = timesheet.REJECT_DATE;
                                    //newTS.REJECT_DESC = timesheet.REJECT_DESC;
                                    newTS.UPDATED_BY = empId;
                                    newTS.UPDATED_DATE = DateTime.Now;
                                    status = timesheet.TIME_ENTRY_STATUS;
                                    updateRecords.Add(newTS);
                                    employee.DUMMY = false;
                                }
                            }
                        }
                    }

                    if (updateRecords.Any())
                    {
                        enDateRange enPeriod = (enDateRange)Enum.Parse(typeof(enDateRange), period, true);
                        DateTime StartDate = objProjectTimesheetDetailsEmp.dtrange.startDate;
                        DateTime EndDate = objProjectTimesheetDetailsEmp.dtrange.endDate;
                        Cldb.AppRepo.Update_PROJ_RESRC_TIME_ENTRY_PSA(ToDataTable(updateRecords));
                        UpdatePSANew(updateRecords, empId);
                        SendTimeSheetMailMultipleProjects(ProjectTimesheets, empId, enPeriod, StartDate, EndDate, status);
                    }

                }

            }
            catch (Exception ex)
            {
                Logger l = new Logger(Request, ex);
                returnStatus = false;
                SendErrorNotificationMail(ex.Message, ex.StackTrace);
            }
            FillResponseTime(watch);
            return Ok(returnStatus);
        }

        private void UpdatePSANew(List<PROJ_RESRC_TIME_ENTRY> timesheets, string emp)
        {
            foreach (PROJ_RESRC_TIME_ENTRY ts in timesheets)
            {
                var allentries = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(x => x.PROJ_ID == ts.PROJ_ID && x.EMP_ID == ts.EMP_ID && x.DATE_ID == ts.DATE_ID && x.TASK_NAME == ts.TASK_NAME).ToList();
                foreach (var t in allentries)
                {
                    if (t.TIME_ENTRY_STATUS.ToUpper() != "APPROVED" && t.TIME_ENTRY_STATUS != "CUSTOMER REJECT")
                        t.TIME_ENTRY_STATUS = ts.TIME_ENTRY_STATUS;
                    t.REJECT_DESC = ts.REJECT_DESC;
                    t.REJECT_DATE = ts.REJECT_DATE;
                    //t.TASK_DESC = ts.TASK_DESC;
                    t.UPDATED_DATE = DateTime.Now;

                    t.UPDATED_BY = emp;
                    if (!new int[] { 3, 5 }.Any(x => x == t.PROJ_TASK_ID))
                    {
                        if (ts.TIME_ENTRY_STATUS == "APPROVED")
                        {
                            PSA_APPROVAL status = new PSA_APPROVAL(t.ID, DateTime.Now, null, null);
                            UpdateTimesheetApprovalToPSA(status, emp);
                        }
                        else if (ts.TIME_ENTRY_STATUS == "CUSTOMER REJECT")
                        {

                            PSA_APPROVAL status = new PSA_APPROVAL(t.ID, null, DateTime.Now, t.REJECT_DESC);
                            UpdateTimesheetRejectToPSA(status, emp);
                        }
                    }
                    Cldb.PROJ_RESRC_TIME_ENTRY.Update(t);
                }

            }

            //foreach (PROJ_RESRC_TIME_ENTRY ts in timesheets.Where(x => x.PROJ_TASK_ID != 3 && x.PROJ_TASK_ID != 5))
            //{
            //    if (ts.TIME_ENTRY_STATUS == "APPROVED")
            //    {
            //        PSA_APPROVAL status = new PSA_APPROVAL(ts.ID, DateTime.Now, null, null);
            //        UpdateTimesheetApprovalToPSA(status, emp);
            //    }
            //    else if (ts.TIME_ENTRY_STATUS == "CUSTOMER REJECT")
            //    {
            //        //ts.CLOCKED_MINS = 0;
            //        //t.CLOCKED_MINS = 0;
            //        PSA_APPROVAL status = new PSA_APPROVAL(ts.ID, null, DateTime.Now, ts.REJECT_DESC);
            //        UpdateTimesheetRejectToPSA(status, emp);
            //    }
            //}
        }

        private TimesheetDetailsMonthly CreateTimesheetDetailsMonthly(IEnumerable<PROJ_RESRC_TIME_ENTRY> tslist, string name)
        {
            var ts = tslist.Last();
            var result = new TimesheetDetailsMonthly
            {
                DATE_ID = ts.DATE_ID,
                APPRL_DATE = ts.APPRL_DATE,
                BILLING_PROJ_ID = ts.BILLING_PROJ_ID,
                CLOCKED_MINS = tslist.Sum(x => x.CLOCKED_MINS),
                EMP_ID = ts.EMP_ID,
                CREATED_BY = ts.CREATED_BY,
                CREATED_DATE = ts.CREATED_DATE,
                OTHER_DETAILS = ts.OTHER_DETAILS,
                PROJ_ID = ts.PROJ_ID,
                PROJ_RESRC_TIME_ENTRY_ID = ts.PROJ_RESRC_TIME_ENTRY_ID,
                PROJ_TASK_ID = ts.PROJ_TASK_ID,
                PROJ_TASK = ts.TASK_NAME ?? "General",
                REJECT_DATE = ts.REJECT_DATE,
                REJECT_DESC = ts.REJECT_DESC,
                TASK_DESC = ts.TASK_DESC,
                TIME_ENTRY_STATUS = ts.TIME_ENTRY_STATUS,
                UPDATED_BY = ts.UPDATED_BY,
                UPDATED_DATE = ts.UPDATED_DATE,
                FRST_NM = name,

            };
            FillDateDetails(result);

            return result;
        }

        private void FillDateDetails(TimesheetDetailsMonthly details)
        {
            if (details.DATE_ID > 0)
            {
                var date = FIRST_DATE.AddDays(details.DATE_ID).AddDays(-1);
                details.CLNDR_DATE = date.ToString("dd-MMM-yyyy");
                details.CLNDR_DATE_DAY = date.DayOfWeek.ToString().Substring(0, 3);
            }
        }
    }
}