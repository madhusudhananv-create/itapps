using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AttributeRouting.Helpers;
using Newtonsoft.Json;
using GAVS.AllocationSystem.Model.CSP.Tables;
using System.Net.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class ControllerHelper
    {
        private List<string> GetSelectedDays(TASK task)
        {
            List<string> days = new List<string>();
            if (task.RECURRENCE.DAILY_IS_MONDAY != null && task.RECURRENCE.DAILY_IS_MONDAY.Value == true)
                days.Add("Monday");
            if (task.RECURRENCE.DAILY_IS_TUESDAY != null && task.RECURRENCE.DAILY_IS_TUESDAY.Value == true)
                days.Add("Tuesday");
            if (task.RECURRENCE.DAILY_IS_WEDNESDAY != null && task.RECURRENCE.DAILY_IS_WEDNESDAY.Value == true)
                days.Add("Wednesday");
            if (task.RECURRENCE.DAILY_IS_THURSDAY != null && task.RECURRENCE.DAILY_IS_THURSDAY.Value == true)
                days.Add("Thursday");
            if (task.RECURRENCE.DAILY_IS_FRIDAY != null && task.RECURRENCE.DAILY_IS_FRIDAY.Value == true)
                days.Add("Friday");
            if (task.RECURRENCE.DAILY_IS_SATURDAY != null && task.RECURRENCE.DAILY_IS_SATURDAY.Value == true)
                days.Add("Saturday");
            if (task.RECURRENCE.DAILY_IS_SUNDAY != null && task.RECURRENCE.DAILY_IS_SUNDAY.Value == true)
                days.Add("Sunday");
            return days;
        }
        
        private List<DateTime> GetYearlyDates(DateTime StartDate, DateTime EndDate)
        {
            List<DateTime> yearlyDates = new List<DateTime>();

            for (DateTime dt = StartDate; dt <= EndDate; dt = dt.AddYears(1))
            {
                yearlyDates.Add(new DateTime(dt.Year, dt.Month, dt.Day));
            }
            return yearlyDates;
        }

        private List<DateTime> GetDates(string frequency, DateTime StartDate, DateTime EndDate)
        {
            List<DateTime> dates = new List<DateTime>();
            int interval = 1;
            switch (frequency)
            {
                case "quarterly":
                    interval = 3;
                    break;
                case "halfyearly":
                    interval = 6;
                    break;
                default:
                    break;
            }

            for (DateTime dt = StartDate; dt <= EndDate; dt = dt.AddMonths(interval))
            {
                dates.Add(new DateTime(dt.Year, dt.Month, 1));
            }
            return dates;
        }

        private List<DateTime> GetSkipDayOfMonth(List<DateTime> MonthDates, int SkipDays, string WeekDay)
        {
            List<DateTime> WeekDays = new List<DateTime>();
            //Get Days
            foreach (DateTime dt in MonthDates)
            {
                int tmpSkpiCount = 1;
                DateTime temp = dt;
                do
                {
                    if (temp.DayOfWeek.ToString() == WeekDay)
                    {
                        if (tmpSkpiCount == SkipDays)
                        {
                            WeekDays.Add(temp);
                            break;
                        }
                        else
                            tmpSkpiCount += 1;
                    }

                    temp = temp.AddDays(1);
                } while (dt.Month == temp.Month);
            }
            return WeekDays;
        }


        internal TASK AddTaskandAudit(TASK_AUDIT_VM taskAudit, HttpRequestMessage request, bool canCommit, string empid, out string strMessage, string custId = null, string projId = null)
        {
            TASK task = taskAudit.Task;
            AUDIT_SCHEDULE audit = taskAudit.Audit;
            var isAudit = taskAudit.isAudit;
            strMessage = string.Empty;
            task.COMMENTS = audit.COMMENTS;

            if (!string.IsNullOrWhiteSpace(projId) && !string.IsNullOrWhiteSpace(custId))
            {
                //shaloow copy audit and task
                task = new TASK
                {
                    TASK_TYPE_ID = taskAudit.Task.TASK_TYPE_ID,
                    TASK_CATEGORY_ID = taskAudit.Task.TASK_CATEGORY_ID,
                    CUST_ID = custId,
                    PROJ_ID = projId,
                    DESCRIPTION = taskAudit.Task.DESCRIPTION,
                    PRIORITY = taskAudit.Task.PRIORITY,
                    SCHEDULED_START_DATE = taskAudit.Task.SCHEDULED_START_DATE,
                    DUE_DATE = taskAudit.Task.DUE_DATE,
                    SCHEDULED_DURATION = taskAudit.Task.SCHEDULED_DURATION,
                    STATUS = taskAudit.Task.STATUS,
                    SET_RECURRENCE = taskAudit.Task.SET_RECURRENCE,
                    RECURRENCE = taskAudit.Task.RECURRENCE,
                    CREATED_BY = taskAudit.Task.CREATED_BY,
                    CREATED_DATE = taskAudit.Task.CREATED_DATE,
                    UPDATED_BY = taskAudit.Task.UPDATED_BY,
                    UPDATED_DATE = taskAudit.Task.UPDATED_DATE,
                    ISACTIVE = taskAudit.Task.ISACTIVE,
                    PARENT_EVENT_ID = taskAudit.Task.PARENT_EVENT_ID,
                    OWNER = taskAudit.Task.OWNER,
                    COMMENTS = taskAudit.Task.COMMENTS,
                    ACTUAL_START_DATE = taskAudit.Task.ACTUAL_START_DATE,
                    ACTUAL_END_DATE = taskAudit.Task.ACTUAL_END_DATE,
                    ACTUAL_DURATION = taskAudit.Task.ACTUAL_DURATION,
                    ASSIGNED_TO = taskAudit.Task.ASSIGNED_TO,
                    IS_DRAFT = taskAudit.Task.IS_DRAFT
                };

                audit = new AUDIT_SCHEDULE
                {
                    TITLE = taskAudit.Audit.TITLE,
                    SCHEDULED_DATE = taskAudit.Audit.SCHEDULED_DATE,
                    SCHEDULED_DURATION = taskAudit.Audit.SCHEDULED_DURATION,
                    CUST_ID = custId,
                    PROJ_ID = projId,
                    CREATED_BY = taskAudit.Audit.CREATED_BY,
                    CREATED_DATE = taskAudit.Audit.CREATED_DATE,
                    UPDATED_BY = taskAudit.Audit.UPDATED_BY,
                    UPDATED_DATE = taskAudit.Audit.UPDATED_DATE,
                    ISACTIVE = taskAudit.Audit.ISACTIVE,
                    TASK_ID = taskAudit.Audit.TASK_ID,
                    STATUS = taskAudit.Audit.STATUS
                };

                task.CUST_ID = custId;
                task.PROJ_ID = projId;
                audit.CUST_ID = custId;
                audit.PROJ_ID = projId;
            }

            bool isnew = false;
            if (task != null)
            {
                if (task.RECURRENCE != null)
                {
                    //task.RECURRENCE.START_DATE = task.RECURRENCE.START_DATE.ToLocalTime();
                    //task.RECURRENCE.END_DATE = task.RECURRENCE.END_DATE.ToLocalTime();                    
                }
                if (task.ID == 0)
                {
                    isnew = true;
                    CSPdb.TASK.Add(task);
                }
                else
                {
                    InsertTaskStatusHistory(task, empid);
                    CSPdb.TASK.Update(task);
                }
                CSPdb.Commit(canCommit);
                if (task.SET_RECURRENCE)
                {
                    CleanupRecurrence(task.RECURRENCE);
                    task.RECURRENCE.TASK_ID = task.ID;
                    if (task.RECURRENCE.ID == 0)
                    {
                        CSPdb.TASK_RECURRENCE.Add(task.RECURRENCE);
                    }
                    else
                    {
                        CSPdb.TASK_RECURRENCE.Update(task.RECURRENCE);
                        DeleteScheduledTask(task, canCommit);
                    }
                    var resultText = CreateScheduledTask(task, canCommit);
                    if (!string.IsNullOrEmpty(resultText))
                    {
                        strMessage = resultText;
                        return null;
                    }
                }
                else
                {
                    DeleteScheduledTask(task, canCommit);
                    task.PARENT_TASK_ID = task.ID;
                    CSPdb.TASK.Update(task);
                }
                CSPdb.Commit(canCommit);
            }

            //Audit Merge
            audit.TASK_ID = task.ID;

            if (isAudit && audit != null)
            {
                if (audit.ID > 0)
                    CSPdb.AUDIT_SCHEDULE.Update(audit);
                else
                    CSPdb.AUDIT_SCHEDULE.Add(audit);
                CSPdb.Commit(canCommit);
                DeleteAuditScheduleRef(audit.ID);

                List<AUDIT_SCHEDULE_REF> AuditRef = new List<AUDIT_SCHEDULE_REF>();
                if (audit.AUDITEE_EMP_ID != null)
                {
                    foreach (string i in audit.AUDITEE_EMP_ID)
                    {
                        AuditRef.Add(getNewAuditRef(audit, "AUDITEE_EMP_ID", i.ToString()));
                    }
                }
                if (audit.SERVICE_AREA_ID != null)
                {
                    foreach (int i in audit.SERVICE_AREA_ID)
                    {
                        AuditRef.Add(getNewAuditRef(audit, "SERVICE_AREA_ID", i.ToString()));
                    }
                }
                CSPdb.AUDIT_SCHEDULE_REF.AddList(AuditRef);
                CSPdb.Commit(canCommit);
            }

            if(task != null && !task.IS_DRAFT.GetValueOrDefault())
            {
                SendMailToTaskPersons(taskAudit = new TASK_AUDIT_VM
                {
                    Task = task,
                    Audit = audit,
                    TASK_CATEGORY_TITLE = taskAudit.TASK_CATEGORY_TITLE,
                    isAudit = taskAudit.isAudit,
                    CSS_SCORE = taskAudit.CSS_SCORE,
                    CSS_URL = taskAudit.CSS_URL,
                    IS_SUBMIT = taskAudit.IS_SUBMIT
                }, request, isnew);
            }
            
            return task;
        }
        internal void DeleteAuditScheduleRef(int AuditScheduleId)
        {
            List<AUDIT_SCHEDULE_REF> oldRef = CSPdb.AUDIT_SCHEDULE_REF.GetAll().Where(t => t.AUDIT_SCHEDULE_ID == AuditScheduleId).ToList();
            if (oldRef != null && oldRef.Count > 0)
            {
                CSPdb.AUDIT_SCHEDULE_REF.DeleteList(oldRef);
            }
        }
        internal AUDIT_SCHEDULE_REF getNewAuditRef(AUDIT_SCHEDULE audit, string key, string value)
        {
            var AuditRef = new AUDIT_SCHEDULE_REF()
            {
                AUDIT_SCHEDULE_ID = audit.ID,
                KEY = key,
                VALUE = value,
                CREATED_BY = audit.CREATED_BY,
                CREATED_DATE = audit.CREATED_DATE,
                UPDATED_BY = audit.UPDATED_BY,
                UPDATED_DATE = audit.UPDATED_DATE,
                ISACTIVE = true
            };
            return AuditRef;
        }
        internal string CreateScheduledTask(TASK task, bool canCommit)
        {
            List<DateTime> weekDates = new List<DateTime>();

            string sTask = Newtonsoft.Json.JsonConvert.SerializeObject(task);
            List<TASK> TaskList = new List<TASK>();
            if (task.RECURRENCE.FREQUENCY == "Daily")
            {
                List<string> days = GetSelectedDays(task);
                for (DateTime dt = task.RECURRENCE.START_DATE.ToLocalTime(); dt <= task.RECURRENCE.END_DATE.ToLocalTime(); dt = dt.AddDays(1.0))
                {
                    if (days.Contains(dt.DayOfWeek.ToString()))
                    {
                        weekDates.Add(dt);
                    }
                }
            }
            else if (task.RECURRENCE.FREQUENCY == "Weekly")
            {

                for (DateTime dt = task.RECURRENCE.START_DATE.ToLocalTime(); dt <= task.RECURRENCE.END_DATE.ToLocalTime(); dt = dt.AddDays(1.0))
                {
                    if (dt.DayOfWeek.ToString() == task.RECURRENCE.WEEKLY_SELECTED_DAY)
                    {
                        weekDates.Add(dt);
                    }
                }
            }
            else if (task.RECURRENCE.FREQUENCY == "Fortnightly")
            {
                var skip = true;
                for (DateTime dt = task.RECURRENCE.START_DATE; dt < task.RECURRENCE.END_DATE.ToLocalTime(); dt = dt.AddDays(1))
                {
                    if (dt.DayOfWeek.ToString() == task.RECURRENCE.FORTNIGHTLY_SELECTED_DAY)
                    {
                        if (!skip)
                        {
                            weekDates.Add(dt);
                        }
                        skip = !skip;
                    }
                }
            }
            else if (task.RECURRENCE.FREQUENCY == "Monthly")
            {
                List<DateTime> monthDates = GetDates(task.RECURRENCE.FREQUENCY.ToLower(), task.RECURRENCE.START_DATE.ToLocalTime(), task.RECURRENCE.END_DATE.ToLocalTime());
                weekDates = GetSkipDayOfMonth(monthDates, task.RECURRENCE.MONTHLY_SKIP_DAYS.Value, task.RECURRENCE.MONTHLY_SELECTED_DAY);
            }
            else if (task.RECURRENCE.FREQUENCY == "Quarterly")
            {
                List<DateTime> quarterlyDates = GetDates(task.RECURRENCE.FREQUENCY.ToLower(), task.RECURRENCE.START_DATE.ToLocalTime(), task.RECURRENCE.END_DATE.ToLocalTime());
                weekDates = GetSkipDayOfMonth(quarterlyDates, task.RECURRENCE.QUARTERLY_SKIP_DAYS.Value, task.RECURRENCE.QUARTERLY_SELECTED_DAY);
            }
            else if (task.RECURRENCE.FREQUENCY == "HalfYearly")
            {
                List<DateTime> halfYearlyDates = GetDates(task.RECURRENCE.FREQUENCY.ToLower(), task.RECURRENCE.START_DATE.ToLocalTime(), task.RECURRENCE.END_DATE.ToLocalTime());
                weekDates = GetSkipDayOfMonth(halfYearlyDates, task.RECURRENCE.BIANNUAL_FIRST_SKIP_DAYS.Value, task.RECURRENCE.BIANNUAL_FIRST_SELECTED_DAY);
            }
            else if (task.RECURRENCE.FREQUENCY == "Annual")
            {
                List<DateTime> yearlydates = GetYearlyDates(task.RECURRENCE.START_DATE.ToLocalTime(), task.RECURRENCE.END_DATE.ToLocalTime());
                weekDates = GetSkipDayOfMonth(yearlydates, task.RECURRENCE.ANNUAL_SKIP_DAYS.Value, task.RECURRENCE.ANNUAL_SELECTED_DAY);
            }
            bool first = true;
            if (weekDates.Count > 100)
            {
                return string.Format("Recurrent Event/Task cannot be created beyond 100 instances");
            }
            foreach (DateTime dt in weekDates)
            {
                if (first)
                {
                    task.SCHEDULED_START_DATE = dt;
                    CSPdb.TASK.Update(task);
                    first = false;
                }
                else
                {
                    TASK newTask = JsonConvert.DeserializeObject<TASK>(sTask);
                    newTask.PARENT_TASK_ID = task.ID;
                    newTask.SCHEDULED_START_DATE = dt;
                    newTask.DUE_DATE = dt;
                    newTask.SET_RECURRENCE = false;
                    TaskList.Add(newTask);
                }
            }
            if (TaskList.Count > 0)
            {
                CSPdb.TASK.AddList(TaskList);
                CSPdb.Commit(canCommit);
            }
            return string.Empty;
        }

        internal void CleanupRecurrence(Model.CSP.TASK_RECURRENCE rec)
        {
            if (rec.FREQUENCY.ToUpper() == "DAILY")
            {
                rec.WEEKLY_SELECTED_DAY = null;
                rec.FORTNIGHTLY_SELECTED_DAY = null;
                rec.MONTHLY_SELECTED_DAY = null;
                rec.QUARTERLY_SELECTED_DAY = null;
                rec.ANNUAL_SELECTED_DAY = null;
                rec.MONTHLY_SKIP_DAYS = null;
                rec.QUARTERLY_SKIP_DAYS = null;
                rec.ANNUAL_SKIP_DAYS = null;
            }
            else if (rec.FREQUENCY.ToUpper() == "WEEKLY")
            {
                rec.DAILY_IS_SUNDAY = null;
                rec.DAILY_IS_MONDAY = null;
                rec.DAILY_IS_TUESDAY = null;
                rec.DAILY_IS_WEDNESDAY = null;
                rec.DAILY_IS_THURSDAY = null;
                rec.DAILY_IS_FRIDAY = null;
                rec.DAILY_IS_SATURDAY = null;
                rec.FORTNIGHTLY_SELECTED_DAY = null;
                rec.MONTHLY_SELECTED_DAY = null;
                rec.QUARTERLY_SELECTED_DAY = null;
                rec.ANNUAL_SELECTED_DAY = null;
                rec.MONTHLY_SKIP_DAYS = null;
                rec.QUARTERLY_SKIP_DAYS = null;
                rec.ANNUAL_SKIP_DAYS = null;

            }
            else if (rec.FREQUENCY.ToUpper() == "FORTNIGHTLY")
            {
                rec.DAILY_IS_SUNDAY = null;
                rec.DAILY_IS_MONDAY = null;
                rec.DAILY_IS_TUESDAY = null;
                rec.DAILY_IS_WEDNESDAY = null;
                rec.DAILY_IS_THURSDAY = null;
                rec.DAILY_IS_FRIDAY = null;
                rec.DAILY_IS_SATURDAY = null;
                rec.WEEKLY_SELECTED_DAY = null;
                rec.MONTHLY_SELECTED_DAY = null;
                rec.QUARTERLY_SELECTED_DAY = null;
                rec.ANNUAL_SELECTED_DAY = null;
                rec.MONTHLY_SKIP_DAYS = null;
                rec.QUARTERLY_SKIP_DAYS = null;
                rec.ANNUAL_SKIP_DAYS = null;
            }
            else if (rec.FREQUENCY.ToUpper() == "MONTHLY")
            {
                rec.DAILY_IS_SUNDAY = null;
                rec.DAILY_IS_MONDAY = null;
                rec.DAILY_IS_TUESDAY = null;
                rec.DAILY_IS_WEDNESDAY = null;
                rec.DAILY_IS_THURSDAY = null;
                rec.DAILY_IS_FRIDAY = null;
                rec.DAILY_IS_SATURDAY = null;
                rec.FORTNIGHTLY_SELECTED_DAY = null;
                rec.WEEKLY_SELECTED_DAY = null;
                rec.QUARTERLY_SELECTED_DAY = null;
                rec.ANNUAL_SELECTED_DAY = null;
                rec.QUARTERLY_SKIP_DAYS = null;
                rec.ANNUAL_SKIP_DAYS = null;
            }
            else if (rec.FREQUENCY.ToUpper() == "QUARTERLY")
            {
                rec.DAILY_IS_SUNDAY = null;
                rec.DAILY_IS_MONDAY = null;
                rec.DAILY_IS_TUESDAY = null;
                rec.DAILY_IS_WEDNESDAY = null;
                rec.DAILY_IS_THURSDAY = null;
                rec.DAILY_IS_FRIDAY = null;
                rec.DAILY_IS_SATURDAY = null;
                rec.WEEKLY_SELECTED_DAY = null;
                rec.FORTNIGHTLY_SELECTED_DAY = null;
                rec.ANNUAL_SELECTED_DAY = null;
                rec.ANNUAL_SKIP_DAYS = null;
            }
            else if (rec.FREQUENCY.ToUpper() == "ANNUAL")
            {
                rec.DAILY_IS_SUNDAY = null;
                rec.DAILY_IS_MONDAY = null;
                rec.DAILY_IS_TUESDAY = null;
                rec.DAILY_IS_WEDNESDAY = null;
                rec.DAILY_IS_THURSDAY = null;
                rec.DAILY_IS_FRIDAY = null;
                rec.DAILY_IS_SATURDAY = null;
                rec.WEEKLY_SELECTED_DAY = null;
                rec.FORTNIGHTLY_SELECTED_DAY = null;
                rec.QUARTERLY_SELECTED_DAY = null;
                rec.QUARTERLY_SKIP_DAYS = null;
            }
        }

        internal void DeleteScheduledTask(TASK task, bool canCommit)
        {
            var tobeDeleted = CSPdb.TASK.GetAll().Where(x => x.ID != task.ID && x.PARENT_TASK_ID == task.ID).ToList();
            CSPdb.TASK.DeleteList(tobeDeleted);
            CSPdb.Commit(canCommit);
        }
        internal void InsertTaskStatusHistory(TASK task, string empid)
        {
            if (task.STATUS != task.STATUS_PREV || (task.STATUS == task.STATUS_PREV && task.STATUS_PREV.ToLower() == "re-schedule" && task.RESCHEDULE_DATE != task.RESCHEDULE_DATE_PREV))
            {
                var history = new TASK_STATUS_HISTORY
                {
                    //ID = null,
                    TASK_ID = task.ID,
                    USER_ID = task.UPDATED_BY,
                    STATUS_DATE = task.UPDATED_DATE,
                    STATUS = task.STATUS_PREV,
                    RESCHEDULE_DATE = task.RESCHEDULE_DATE_PREV,
                    RESCHEDULE_REQUESTER = task.RESCHEDULE_REQUESTER_PREV,
                    RESCHEDULE_REASON = task.RESCHEDULE_REASON_PREV
                };
                history.UpdateAuditFieldsExt(empid);
                CSPdb.TASK_STATUS_HISTORY.Add(history);
                CSPdb.Commit(true);
            }
        }

        internal void SendMailToTaskPersons(TASK_AUDIT_VM taskAudit, HttpRequestMessage request, bool isNew)
        {
            var task = taskAudit.Task;
            string iId;
            var recipients = new List<string>();
            var toMail = string.Empty;
            var owner = string.Empty;
            var responsible = string.Empty;
            var auditInvolved = string.Empty;
            var projectPMName = string.Empty;
            var qaSpocName = string.Empty;
            var projectCSMName = string.Empty;
            var peoplePageUrl = string.Empty;

            var empIds = new List<string>();
            var auditEmpIds = new List<string>();
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == taskAudit.Task.PROJ_ID);
            empIds.Add(project.PROJ_PM_EMP_ID);
            empIds.Add(project.QUALITY_SPOC);
            empIds.Add(task.OWNER);
            empIds.Add(task.ASSIGNED_TO);
            empIds.Add(project.PROJ_DM_EMP_ID);

            if (string.IsNullOrEmpty(taskAudit.PROJ_NM))
                taskAudit.PROJ_NM = project.PROJ_NM;
            if (string.IsNullOrEmpty(taskAudit.CUST_NM))
                taskAudit.CUST_NM = Cldb.CUSTOMER.GetById(taskAudit.Task.CUST_ID).CUST_NM;

            var auditText = string.Empty;
            var subject = string.Empty;
            if (taskAudit.isAudit)
            {
                auditText = "Audit ";
            }

            if(isNew && taskAudit.IS_SUBMIT)
            {
                subject = $"New {auditText}task Added - {taskAudit.PROJ_NM} - {taskAudit.TASK_CATEGORY_TITLE}";
            }
            else if(!isNew && taskAudit.IS_SUBMIT)
            {
                subject = $"{auditText}Task Updated for {taskAudit.PROJ_NM} - {taskAudit.TASK_CATEGORY_TITLE}";
            }
            else
            {
                return;
            }

            if (taskAudit.Audit.AUDITOR_EMP_ID.HasNoValue())
            {
                var auditInfo = CSPdb.AUDIT_SCHEDULE.GetAll().FirstOrDefault(x => x.TASK_ID == task.ID);
                if (auditInfo != null)
                {
                    if (auditInfo.AUDITOR_EMP_ID != null)
                    {
                        auditEmpIds.Add(auditInfo.AUDITOR_EMP_ID.ToString());
                        var auditees = CSPdb.AUDIT_SCHEDULE_REF.GetAll().Where(x => x.AUDIT_SCHEDULE_ID == auditInfo.ID && x.KEY == "AUDITEE_EMP_ID").ToList();
                        auditEmpIds.AddRange(auditees.Select(x => x.VALUE));
                    }
                }
            }
            else
            {
                auditEmpIds.Add(taskAudit.Audit.AUDITOR_EMP_ID.ToString());
                foreach (string auditeeEmpId in taskAudit.Audit.AUDITEE_EMP_ID)
                    auditEmpIds.Add(auditeeEmpId);
            }
            if (auditEmpIds.Count() > 0)
                empIds.AddRange(auditEmpIds);
            var empList = Cldb.EMP_INFO.GetAll().Where(x => empIds.Contains(x.EMP_ID.ToString()));
            var audits = empList.Where(x => auditEmpIds.Contains(x.EMP_ID.ToString())).ToList();

            if (audits != null)
            {
                auditInvolved = string.Join(", ", audits.Select(x => x.FRST_NM));
                recipients.AddRange(audits.Select(x => x.EMAIL_ID));
            }

            var projectPMRec = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_PM_EMP_ID);
            if (projectPMRec != null)
            {
                toMail = projectPMRec.EMAIL_ID;
                projectPMName = projectPMRec.FRST_NM;
            }

            var projectQARec = empList.FirstOrDefault(x => x.EMP_ID == project.QUALITY_SPOC);
            if (projectQARec != null)
            {
                recipients.Add(projectQARec.EMAIL_ID);
                qaSpocName = projectQARec.FRST_NM;
            }
            else
            {
                if (!string.IsNullOrEmpty(taskAudit.Task.CUST_ID))
                {
                    var defaultQA = GetDBConfig("DEFAULT_TASKAUDITQA_MAILID", taskAudit.Task.CUST_ID);
                    recipients.Add(defaultQA);
                }

            }

            iId = task.OWNER;
            var ownerrec = empList.FirstOrDefault(x => x.EMP_ID == iId);
            if (ownerrec != null)
            {
                recipients.Add(ownerrec.EMAIL_ID);
                owner = ownerrec.FRST_NM;
            }

            iId = task.ASSIGNED_TO;
            var assigned = empList.FirstOrDefault(x => x.EMP_ID == iId);
            if (assigned != null)
            {
                responsible = assigned.FRST_NM;
                recipients.Add(assigned.EMAIL_ID);
            }

            var projectCSMRec = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_DM_EMP_ID);
            if (projectCSMRec != null)
            {
                recipients.Add(projectCSMRec.EMAIL_ID);
                projectCSMName = projectCSMRec.FRST_NM;
            }

            if (taskAudit.Task.TASK_CATEGORY_ID == 26)
            {
                var requestDomain = GetAbsoulteUri();
                var path = "layout/people";
                peoplePageUrl = $"{requestDomain}/{path}/{project.CUST_ID}";
                subject = $"{taskAudit.PROJ_NM} Team achieved {taskAudit.CSS_SCORE} out 5 in all criteria - Arrange for issuing Spot award to the team";
            }

            var cclist = taskAudit.Task.TASK_CATEGORY_ID == 22 ? GetDBConfig("DEFAULT_STARTUP_AUDIT_CCLIST", project.CUST_ID) : GetDBConfig("QUALITY_HEAD_MAIL", project.CUST_ID);
            recipients.Add(cclist);
            recipients.Add(Constants.AUDITOR_LEAD);

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CATEGORY", taskAudit.TASK_CATEGORY_TITLE);
            EmailContentValues.Add("DESCRIPTION", task.DESCRIPTION);
            EmailContentValues.Add("PROJECT_NAME", taskAudit.PROJ_NM);
            EmailContentValues.Add("CUSTOMER_NAME", taskAudit.CUST_NM);
            EmailContentValues.Add("OWNER", owner);
            EmailContentValues.Add("PROJECT_PM_NAME", projectPMName);
            EmailContentValues.Add("SCHEDULED_START_DATE", task.SCHEDULED_START_DATE.HasValue ? task.SCHEDULED_START_DATE.Value.ToString(_dateformat) : string.Empty);
            EmailContentValues.Add("DUE_DATE", task.DUE_DATE.HasValue ? task.DUE_DATE.Value.ToString(_dateformat) : string.Empty);
            EmailContentValues.Add("STATUS", task.STATUS);
            EmailContentValues.Add("REQUIREMENT REFERENCE", task.REQUIREMENT_REFERENCE);
            EmailContentValues.Add("RECURRENCE", task.RECURRENCE != null ? "Yes" : "No");
            EmailContentValues.Add("AUDIT SCHEDULE", taskAudit.Audit != null ? "Yes" : "No");
            EmailContentValues.Add("PRIORITY", task.PRIORITY);
            EmailContentValues.Add("RESPONSIBLE", responsible);
            EmailContentValues.Add("AUDITS", auditInvolved);
            EmailContentValues.Add("COMMENTS", task.COMMENTS);
            EmailContentValues.Add("PROJECT_CSM_NAME", projectCSMName);
            EmailContentValues.Add("PROJECT_START_DATE", project.START_DATE.ToString(_dateformat));
            EmailContentValues.Add("PROJECT_END_DATE", project.END_DATE.ToString(_dateformat));
            //below are for csat template
            EmailContentValues.Add("CSS_SCORE", taskAudit.CSS_SCORE);
            EmailContentValues.Add("CSS_URL", taskAudit.CSS_URL);
            EmailContentValues.Add("PEOPLE_URL", peoplePageUrl);

            var templateName = taskAudit.PROJ_NM != null && taskAudit.Task.TASK_CATEGORY_ID != 26 ? "AddNewTask.htm" : "AddAuditTaskForCSAT.htm";
            string mailContent = GetEmailContent(templateName, EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587", },
                new EmailContent { from = Constants._csmSupportMail, to = toMail, cc = string.Join(",", recipients), content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                request
                );
        }
    }
}
