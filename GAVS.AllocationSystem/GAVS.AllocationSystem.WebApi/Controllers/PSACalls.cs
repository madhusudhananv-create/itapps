using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using Newtonsoft.Json;
using RestSharp;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using EF = GAVS.AllocationSystem.WebApi.DBContext;

namespace GAVS.AllocationSystem.WebApi.Controllers
{

    public partial class AllSysController
    {



        private readonly List<string> _allowedBusinessUnits = new List<string> { "Health care", "India & UK", "New Growth", "CIT", "Tech" };
        private void LogRequest(Exception exception = null, string prefix = "PSA:", string content = "")
        {
            var l = new Logger(Request, exception, prefix, content);
        }
        #region Customer
        [GET("GetCustomerById")]
        [ActionName("GetCustomerById")]
        [HttpGet]
        public IHttpActionResult GetCustomerById(string CustomerId)
        {

            //LogRequest();
            // int iCustomer = Convert.ToInt32(CustomerId.Replace("-", ""));
            string errMsg = string.Empty;
            CUSTOMER customer = null;
            try
            {
                customer = Cldb.CUSTOMER.GetById(CustomerId);
            }
            catch (Exception exp)
            {
                errMsg = GetException(exp, CustomerId);
            }
            return GetResult<CUSTOMER>(customer, errMsg);
            //if (string.IsNullOrEmpty(errMsg))
            //{
            //    return Ok(customer);
            //}
            //else
            //{
            //    return Content(HttpStatusCode.Conflict, errMsg);
            //}
        }
        [POST("AddNewCustomer")]
        [ActionName("AddNewCustomer")]
        [HttpPost]
        public IHttpActionResult AddNewCustomer(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(content: jsonContent);
            dynamic json = jsonContent;
            EF.CUSTOMER customer = JsonConvert.DeserializeObject<EF.CUSTOMER>(json);

            if (customer != null)
            {
                using (EF.RasEntities context = new EF.RasEntities())
                {
                    try
                    {
                        var existing = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == customer.CUST_ID);
                        if (existing != null)
                            // return Content(HttpStatusCode.Conflict, $"Cust ID {customer.CUST_ID}   exists already.");
                            return UpdateCustomer(request);
                        var ety = new CUSTOMER
                        {
                            CUST_ID = customer.CUST_ID,
                            CUST_NM = customer.CUST_NM,
                            URL = customer.URL,
                            INDUSTRY_TYPE = customer.INDUSTRY_TYPE,
                            CREATED_DATE = DateTime.Now,
                            CREATED_BY = customer.CREATED_BY ?? "99999",
                            UPDATED_BY = customer.UPDATED_BY ?? "99999",
                            EP_ID = GetOldEMPId(customer.EP_ID),
                            BUSINESS_UNIT = customer.BUSINESS_UNIT,
                            UPDATED_DATE = DateTime.Now,

                        };
                        Cldb.CUSTOMER.Add(ety);
                        Cldb.Commit();

                        //context.CUSTOMERs.Add(customer);
                        //context.SaveChanges();
                        //Cldb.AppRepo.AddCustomer(customer);  

                        try
                        {
                            SendMailWhenNewAccountAdded(ety);
                        }
                        catch (Exception ex)
                        {

                            var l = new Logger(request, ex, prefix: "PSA:");
                        }
                    }
                    catch (Exception exp)
                    {
                        errMsg = GetException(exp, jsonContent);
                    }


                }
            }
            return GetResult<CUSTOMER>(null, errMsg);
        }

        [POST("UpdateCustomer")]
        [ActionName("UpdateCustomer")]
        [HttpPost]
        public IHttpActionResult UpdateCustomer(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(content: jsonContent);
            dynamic json = jsonContent;
            CUSTOMER customer = JsonConvert.DeserializeObject<CUSTOMER>(json);
            if (customer != null)
            {
                try
                {
                    customer.UPDATED_DATE = DateTime.Now;
                    Cldb.CUSTOMER.Update(customer);
                    Cldb.Commit();
                }
                catch (Exception exp)
                {
                    errMsg = GetException(exp, jsonContent);
                }
            }
            return GetResult<CUSTOMER>(null, errMsg);
        }
        #endregion
        #region Project
        [GET("GetProjectById")]
        [ActionName("GetProjectById")]
        [HttpGet]
        public IHttpActionResult GetProjectById(string ProjectId)
        {
            //LogRequest();
            string errMsg = string.Empty;
            PROJECT project = null;
            try
            {
                project = Cldb.PROJECT.GetAll().Where(t => t.PROJ_ID == ProjectId).FirstOrDefault();
                if (project == null)
                    return Content(HttpStatusCode.Conflict, "Project not exists.");
            }
            catch (Exception exp)
            {
                errMsg = GetException(exp, ProjectId);

            }
            return GetResult<PROJECT>(project, errMsg);
        }

        private string GetOldEMPId(string newEmpId)
        {
            if (string.IsNullOrWhiteSpace(newEmpId)) return string.Empty;
            var empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID_NEW == newEmpId && x.DOR == null);
            if (empInfo == null)
            {
                empInfo = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID_NEW == newEmpId);
            }


            if (empInfo != null)
            {
                return empInfo.EMP_ID;
            }
            return newEmpId;
        }



        [POST("AddNewProject")]
        [ActionName("AddNewProject")]
        [HttpPost]
        public IHttpActionResult AddNewProject(HttpRequestMessage request)
        {

            var content = request.Content;

            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            LogRequest(content: jsonContent);
            dynamic json = jsonContent;
            PROJECT project = JsonConvert.DeserializeObject<PROJECT>(json);

            if (project != null)
            {
                var existing = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == project.PROJ_ID && x.CUST_ID == project.CUST_ID);
                if (existing != null)
                {
                    return Content(HttpStatusCode.Conflict, "Unable to create as Project already exists with same project Id.");
                }
                var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == project.CUST_ID);
                if (customer == null)
                {
                    return Content(HttpStatusCode.Conflict, $"Unable to create as Project  as customer with id {project.CUST_ID} not available in CSM DB");
                }
                if (project.PARENT_PROJ_ID == null)
                    project.PARENT_PROJ_ID = project.PROJ_ID;
                //if (!string.IsNullOrWhiteSpace(project.PROJ_ALIAS_NM) && project.PROJ_ALIAS_NM.Length < 52)
                //    project.PROJ_ALIAS_NM = project.PROJ_ALIAS_NM.Trim();
                //else
                //    project.PROJ_ALIAS_NM = null;
                project.CREATED_DATE = DateTime.Now;
                project.PROJ_ALIAS_NM = null;
                project.PROJ_AM_EMP_ID = GetOldEMPId(project.PROJ_AM_EMP_ID);
                project.PROJ_PM_EMP_ID = GetOldEMPId(project.PROJ_PM_EMP_ID);
                project.PROJ_DM_EMP_ID = GetOldEMPId(project.PROJ_DM_EMP_ID);
                project.DP_ID = GetOldEMPId(project.PROJ_EP_ID);
                project.PROJ_BUHEAD_EMP_ID = GetOldEMPId(project.PROJ_BUHEAD_EMP_ID);
                project.PROJ_EP_ID = GetOldEMPId(project.PROJ_EP_ID);
                project.BUSINESS_UNIT = getUpdatedBusinessUnit(project.BUSINESS_UNIT);


                Cldb.PROJECT.Add(project);
                Cldb.Commit(CanCommit);
                var projList = Cldb.PROJECT.GetAll().Where(x => x.CUST_ID == project.CUST_ID).ToList();
                var qualitySpoc = projList.Where(x => x.QUALITY_SPOC != null).Select(x => x.QUALITY_SPOC).Distinct();
                if (qualitySpoc.Any())
                    project.QUALITY_SPOC = qualitySpoc.First();
                string strMessage = string.Empty;
                //if (!project.PROJ_ID.StartsWith("PROJ"))
                //    strMessage = StartUpAutoTaskAudit(project);
                try
                {
                    Cldb.Commit(CanCommit);
                    if (project.PROJECT_TYPE.ToLower() != "internal")
                    {
                        SendMailtoProjectCSM(project);
                        if (!project.PROJ_ID.StartsWith("PROJ"))
                            SendMailToPexTeam(project);
                        if (IsPremier(project.CUST_ID))
                        {
                            var existingPP = CSPdb.PORTFOLIO_PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == project.PROJ_ID);
                            if (existingPP == null)
                            {
                                CSPdb.PORTFOLIO_PROJECT.Add(new PORTFOLIO_PROJECT
                                {
                                    ISACTIVE = true,
                                    PORTFOLIO_ID = 99,
                                    CUST_ID = project.CUST_ID,
                                    PROJ_ID = project.PROJ_ID,
                                    CREATED_BY = "102802",
                                    CREATED_DATE = DateTime.Now,
                                    UPDATED_BY = "102802",
                                    UPDATED_DATE = DateTime.Now,
                                });
                                CSPdb.Commit(CanCommit);
                                LogRequest(content: jsonContent);
                            }
                        }
                    }
                }
                catch (Exception exp)
                {
                    GetException(exp, jsonContent);

                }



                try
                {
                    //add default access to project for selected Emps
                    var defaultAccess = helper.GetDBConfig("ADD_DEFAULT_ACCESS_TO_PROJ", "-1");
                    foreach (var item in defaultAccess.Trim().Split(','))
                    {

                        var pr = new PROJECT_RESOURCE
                        {
                            EMP_ID = item,
                            PROJ_ID = project.PROJ_ID,
                            BILL_FLG = false,
                            ALLCT_PCT = 10,
                            CURR_INDC = "N",
                            CREATED_BY = "system",
                            START_DATE = project.START_DATE,
                            END_DATE = project.START_DATE.AddYears(2),
                        };
                        Cldb.AppRepo.InsertProjectResource(pr.EMP_ID, pr.PROJ_ID, pr.BILL_FLG, pr.ALLCT_PCT, pr.CURR_INDC, pr.CREATED_BY, pr.START_DATE, pr.END_DATE);

                    }

                    Cldb.Commit();

                }
                catch (Exception ex)
                {

                    GetException(ex, jsonContent);
                }
            }
            if (string.IsNullOrEmpty(errMsg))
            {
                return Ok("Success");
            }
            else
            {
                return Content(HttpStatusCode.Conflict, errMsg);
            }
        }

        private void SendMailWhenNewAccountAdded(CUSTOMER customer)
        {
            var toMail = string.Empty;
            toMail = helper.GetDBConfig("NewAccount_ToList", "-1");
            //var qualityMail = helper.GetDBConfig("QUALITY_TEAM_MAIL", "-1");
            //var pexMail = helper.GetDBConfig("PROCESS_EXCELLENCE_TEAM_MAIL", "-1");
            var ccMail = helper.ConcatEmails(new List<string>() { Constants.QUALITY_MAIL, Constants.PEX_MAIL, Constants.DEVX_LEAD, Constants.AUDITOR_LEAD, Constants.DEVX_MAIL });
            var customerName = customer.CUST_NM;
            var customerID = customer.CUST_ID;
            var subject = $"New Customer - {customerName} has been added";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            EmailContentValues.Add("CUSTOMER_ID", customerID);
            string mailContent = helper.GetEmailContent("NewAccountNotification.htm", EmailContentValues);


            //todo: move email to template
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = Constants._csmSupportMail, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                Request
                );
        }



        private void SendMailtoProjectCSM(PROJECT project)
        {
            var dpInfo = helper.GetCSMFromProject(project).FirstOrDefault();
            var pmInfo = helper.GetPMEmpInfoFromProject(project.PROJ_ID).FirstOrDefault();
            var amInfo = helper.GetAMEmpInfoFromProject(project.PROJ_ID).FirstOrDefault();
            var csmInfo = helper.GetCustomerScuccessManagerEmpInfoFromProject(project.PROJ_ID).FirstOrDefault();

            var toMail = string.Empty;
            var toPerson = string.Empty;

            if (dpInfo != null && pmInfo != null)
            {
                if (pmInfo.EMAIL_ID == dpInfo.EMAIL_ID)
                {
                    toMail = pmInfo.EMAIL_ID;
                    toPerson = pmInfo.FRST_NM;
                }
                else
                {
                    toMail = string.Join(",", pmInfo.EMAIL_ID, dpInfo.EMAIL_ID);
                    toPerson = string.Join(",", pmInfo.FRST_NM, dpInfo.FRST_NM);
                }
            }

            var projectName = project.PROJ_ALIAS_NM ?? project.PROJ_NM;
            var accountName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == project.CUST_ID)?.CUST_NM;
            var subject = $"New Project {projectName} under {accountName} has been added; If it is renewal of SOW take necessary steps.";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("TO_PERSON", toPerson);
            EmailContentValues.Add("PROJECT_NAME", projectName);
            EmailContentValues.Add("PROJECT_ID", project.PROJ_ID);
            EmailContentValues.Add("ACCOUNT", accountName);
            EmailContentValues.Add("START_DATE", project.START_DATE.ToString("dd-MM-yyyy"));
            EmailContentValues.Add("END_DATE", project.END_DATE.ToString("dd-MM-yyyy"));
            EmailContentValues.Add("PM", pmInfo != null ? pmInfo.FRST_NM : "");
            EmailContentValues.Add("DP", dpInfo != null ? dpInfo.FRST_NM : "");
            EmailContentValues.Add("AM", amInfo != null ? amInfo.FRST_NM : "");
            EmailContentValues.Add("CSM", csmInfo != null ? csmInfo.FRST_NM : "");
            EmailContentValues.Add("REVENUE_TYPE", string.IsNullOrWhiteSpace(project.REVENUE_TYPE) ? "" : project.REVENUE_TYPE);
            EmailContentValues.Add("PROJECT_TYPE", string.IsNullOrWhiteSpace(project.PROJECT_TYPE) ? "" : project.PROJECT_TYPE);
            EmailContentValues.Add("PROJECT_GROUP", string.IsNullOrWhiteSpace(project.PROJECT_GROUP) ? "" : project.PROJECT_GROUP);
            EmailContentValues.Add("CONTRACTING_UNIT", string.IsNullOrWhiteSpace(project.CONTRACTING_UNIT) ? "" : project.CONTRACTING_UNIT);
            EmailContentValues.Add("BUSINESS_UNIT", string.IsNullOrWhiteSpace(project.BUSINESS_UNIT) ? "" : project.BUSINESS_UNIT);
            EmailContentValues.Add("DEPARTMENT", string.IsNullOrWhiteSpace(project.DEPARTMENT) ? "" : project.DEPARTMENT);

            string mailContent = helper.GetEmailContent("NewProjectNotification.htm", EmailContentValues);
            var cclist = new List<string> { Constants.QUALITY_MAIL, Constants.PEX_MAIL, Constants.DEVX_MAIL };
            var ccMail = string.Join(",", cclist);
            //todo: move email to template
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = Constants._csmSupportMail, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                Request
                );
        }

        private void SendMailToPexTeam(PROJECT project)
        {
            var empIds = new List<string>();
            empIds.Add(project.PROJ_DM_EMP_ID);
            empIds.Add(project.PROJ_PM_EMP_ID);

            var empList = helper.GetEmployeeList(empIds);
            var csmInfo = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_DM_EMP_ID);
            var pmInfo = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_PM_EMP_ID);
            var customerName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == project.CUST_ID)?.CUST_NM;

            var toMail = helper.GetDBConfig("PROCESS_EXCELLENCE_TEAM_MAIL", "-1");
            var ccMail = string.Empty;
            var subject = $"New Project - {project.PROJ_NM} has been added in the PSA";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            EmailContentValues.Add("PROJECT_NAME", project.PROJ_NM);
            EmailContentValues.Add("START_DATE", project.START_DATE.ToString(_dateformat));
            EmailContentValues.Add("END_DATE", project.END_DATE.ToString(_dateformat));
            EmailContentValues.Add("PM", pmInfo != null ? pmInfo.FRST_NM : "");
            EmailContentValues.Add("CSM", csmInfo != null ? csmInfo.FRST_NM : "");
            string mailContent = helper.GetEmailContent("ProjectMailToPexTeam.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = Constants._csmSupportMail, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                Request
                );

        }

        private void SendProjClosureMailtoMarketTeam(PROJECT project)
        {
            if (project.PROJECT_TYPE?.ToLower() == "internal") return;

            var empIds = new List<string>();
            empIds.Add(project.PROJ_DM_EMP_ID);
            empIds.Add(project.PROJ_PM_EMP_ID);
            if (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC))
                empIds.Add(project.QUALITY_SPOC);
            var empList = helper.GetEmployeeList(empIds);
            var csmInfo = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_DM_EMP_ID || x.EMP_ID_NEW == project.PROJ_DM_EMP_ID);
            var pmInfo = empList.FirstOrDefault(x => x.EMP_ID == project.PROJ_PM_EMP_ID || x.EMP_ID_NEW == project.PROJ_PM_EMP_ID);
            var qualitySpoc = (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC)) ? empList.FirstOrDefault(x => x.EMP_ID == project.QUALITY_SPOC) : null;
            var emailIds = helper.GetDBConfig("PROJECT_CLOSURE_NOTIFY_EMAILS", "-1");
            var qualityHead = string.Empty;
            if (project.PROJ_ID.ToLower().IndexOf("proj") != -1)
                qualityHead = helper.GetDBConfig("GSLAB_QUALITY_HEAD_MAIL", "-1");
            else
                qualityHead = helper.GetDBConfig("QUALITY_HEAD_MAIL", "-1");
            var toMail = csmInfo != null ? csmInfo.EMAIL_ID : Constants.QUALITY_MAIL;
            var projectName = project.PROJ_ALIAS_NM ?? project.PROJ_NM;
            var accountName = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == project.CUST_ID)?.CUST_NM;
            var subject = $"Project {projectName} of {accountName} has been marked '{project.PROJ_STATUS}' in the PSA";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("PROJECT_NAME", projectName);
            EmailContentValues.Add("STATUS", project.PROJ_STATUS);
            EmailContentValues.Add("PROJECT_ID", project.PROJ_ID);
            EmailContentValues.Add("QUALITY_PARTNER", qualitySpoc != null ? qualitySpoc.EMAIL_ID : "");
            EmailContentValues.Add("QUALITY_HEAD_MAIL", qualityHead);
            EmailContentValues.Add("ACCOUNT", accountName);
            EmailContentValues.Add("START_DATE", project.START_DATE.ToString("dd-MM-yyyy"));
            EmailContentValues.Add("END_DATE", project.END_DATE.ToString("dd-MM-yyyy"));
            EmailContentValues.Add("PM", pmInfo != null ? pmInfo.FRST_NM : "");
            EmailContentValues.Add("CSM", csmInfo != null ? csmInfo.FRST_NM : "");
            var ccMailIds = string.Join(",", new string[] { emailIds, pmInfo != null ? pmInfo.EMAIL_ID : "", qualitySpoc != null ? qualitySpoc.EMAIL_ID : "", qualityHead, Constants.QUALITY_MAIL, Constants.PEX_MAIL, Constants.DEVX_LEAD });
            string mailContent = helper.GetEmailContent("ProjectClosureNotification.htm", EmailContentValues);

            //todo: move email to template
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = Constants._csmSupportMail, to = toMail, cc = ccMailIds, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                Request
                );
        }

        [POST("UpdateProject")]
        [ActionName("UpdateProject")]
        [HttpPost]
        public IHttpActionResult UpdateProject(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;

            LogRequest(content: jsonContent);
            try
            {
                PROJECT project = JsonConvert.DeserializeObject<PROJECT>(json);

                if (project != null)
                {
                    var existing = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == project.PROJ_ID);
                    if (existing == null)
                        throw new Exception("unable to find project with id " + project.PROJ_ID);

                    if (project.PARENT_PROJ_ID == null)
                        project.PARENT_PROJ_ID = project.PROJ_ID;
                    existing.PARENT_PROJ_ID = project.PARENT_PROJ_ID;
                    //if (!string.IsNullOrWhiteSpace(project.PROJ_ALIAS_NM) && project.PROJ_ALIAS_NM.Length < 52)
                    //    existing.PROJ_ALIAS_NM = project.PROJ_ALIAS_NM.Trim();
                    existing.PROJ_NM = project.PROJ_NM;
                    existing.PROC_TYPE = project.PROC_TYPE;
                    existing.START_DATE = project.START_DATE;
                    existing.END_DATE = project.END_DATE;
                    existing.PROJ_STATUS = project.PROJ_STATUS;
                    //if (project.QUALITY_SPOC == null)
                    //    project.QUALITY_SPOC = existing.QUALITY_SPOC;
                    var projStatusList = helper.GetDBConfig("PROJECT_CLOSURE_STATUS_LIST", "-1").ToLower().Split(',');
                    existing.GUID = project.GUID;
                    //existing.PROJ_PM_EMP_ID = project.PROJ_PM_EMP_ID;
                    //existing.PROJ_DM_EMP_ID = project.PROJ_DM_EMP_ID;
                    //existing.PROJ_AM_EMP_ID = project.PROJ_AM_EMP_ID;
                    //existing.PROJ_BUHEAD_EMP_ID = project.PROJ_BUHEAD_EMP_ID;
                    //todo: check if its modified and update

                    existing.PROJ_AM_EMP_ID = GetOldEMPId(project.PROJ_AM_EMP_ID);
                    existing.PROJ_PM_EMP_ID = GetOldEMPId(project.PROJ_PM_EMP_ID);
                    existing.PROJ_DM_EMP_ID = GetOldEMPId(project.PROJ_DM_EMP_ID);
                    existing.PROJ_BUHEAD_EMP_ID = GetOldEMPId(project.PROJ_BUHEAD_EMP_ID);
                    existing.DP_ID = GetOldEMPId(project.PROJ_EP_ID);

                    existing.BILL_CRNCY_ID = project.BILL_CRNCY_ID;
                    existing.BILL_TYPE = project.BILL_TYPE;
                    existing.BU_ID = project.BU_ID;
                    existing.CUST_ADDR_ID = project.CUST_ADDR_ID;
                    existing.CUST_ID = project.CUST_ID;
                    existing.DEPT_ID = project.DEPT_ID;

                    existing.BUSINESS_UNIT = getUpdatedBusinessUnit(project.BUSINESS_UNIT);
                    existing.PROJECT_TYPE = project.PROJECT_TYPE;
                    existing.DEPARTMENT = project.DEPARTMENT;
                    existing.PROJECT_GROUP = project.PROJECT_GROUP;

                    existing.LVL_1_APPR_EMP_ID = project.LVL_1_APPR_EMP_ID;
                    existing.LVL_2_APPR_EMP_ID = project.LVL_2_APPR_EMP_ID;
                    existing.LVL_3_APPR_EMP_ID = project.LVL_3_APPR_EMP_ID;
                    existing.LVL_4_APPR_EMP_ID = project.LVL_4_APPR_EMP_ID;

                    existing.CONTRACTING_UNIT = project.CONTRACTING_UNIT;
                    existing.COUNTRY = project.COUNTRY;
                    existing.METHODOLOGY = project.METHODOLOGY;

                    existing.UPDATED_BY = project.UPDATED_BY;

                    existing.UPDATED_DATE = DateTime.Now;
                    existing.REVENUE_TYPE = project.REVENUE_TYPE;

                    existing.ENGAGAMENT_TYPE = project.ENGAGAMENT_TYPE;
                    existing.EXECUTION_TYPE = project.EXECUTION_TYPE;
                    Cldb.PROJECT.Update(existing);
                    Cldb.Commit();
                    if (projStatusList.Contains(existing.PROJ_STATUS.ToLower()))
                    {
                        try
                        {
                            //todo: remove allocations for this project??

                            SendProjClosureMailtoMarketTeam(project);
                        }
                        catch (Exception e)
                        {

                            LogRequest(e);
                        }

                    }

                }
            }
            catch (JsonSerializationException exp)
            {
                errMsg = exp.Message;
            }
            catch (Exception exp)
            {

                errMsg = GetException(exp, jsonContent);
            }

            return GetResult<PROJECT>(null, errMsg);
        }
        #endregion
        private string getUpdatedBusinessUnit(string businessUnit)
        {
            if (_allowedBusinessUnits.Any(x => x == businessUnit)) return businessUnit;
            switch (businessUnit.ToLower())
            {
                case "ngrow":
                    return "CIT";
                case "heal":
                    return "Health care";
                case "tech":
                    return "Tech";
                case "inuk":
                    return "India & UK";
                default:
                    break;
            }

            return businessUnit;
        }

        #region Employee
        [GET("GetEmployeeById")]
        [ActionName("GetEmployeeById")]
        [HttpGet]
        public IHttpActionResult GetEmployeeById(string EmpId)
        {
            //LogRequest();
            string errMsg = string.Empty;
            EMP_INFO_DETAILED employee = null;
            try
            {
                employee = Cldb.AppRepo.GetEmployeeById(EmpId);
                if (employee == null)
                    return Content(HttpStatusCode.Conflict, "Employee not exists.");
            }
            catch (Exception exp)
            {
                errMsg = GetException(exp, EmpId.ToString());
            }
            return GetResult<EMP_INFO_DETAILED>(employee, errMsg);
        }

        [POST("AddEmployee")]
        [ActionName("AddEmployee")]
        [HttpPost]
        public IHttpActionResult AddEmployee(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            EMP_INFO_DETAILED employee = JsonConvert.DeserializeObject<EMP_INFO_DETAILED>(json);

            if (employee != null)
            {
                var existing = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == employee.EMP_ID || x.EMAIL_ID == employee.EMAIL_ID);
                if (existing != null)
                    return Content(HttpStatusCode.Conflict, "Employee Already exists with same Emp ID/ EMail Id");
                Cldb.AppRepo.AddEmployee(employee);
            }
            return Ok();
        }




        [POST("AddNewEmployee")]
        [ActionName("AddNewEmployee")]
        [HttpPost]
        public IHttpActionResult AddNewEmployee(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            LogRequest(content: jsonContent);
            EF.EMP_INFO employee = JsonConvert.DeserializeObject<EF.EMP_INFO>(json);
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            if (employee != null)
            {
                employee.LAST_NM = null;
                if (employee.SUPERADMIN.HasValue == false)
                    employee.SUPERADMIN = false;

                UpdateCSMTitle(employee);

                var existing = GetCorrectEmployeeRecord(employee.EMAIL_ID);
                if (existing != null)
                    //return GetResult<EMP_INFO>(null, $"Emp Id {employee.EMP_ID} already exists.");
                    return UpdateEmployee(request);
                else
                {
                    var newEMP = new EMP_INFO_DETAILED();
                    newEMP.EMP_ID = employee.EMP_ID;

                    newEMP.BASE_CNTRY_ID = employee.BASE_CNTRY_ID;
                    newEMP.MANAGER_EMP_ID = GetOldEMPId(employee.MANAGER_EMP_ID);
                    newEMP.REVIEWER_EMP_ID = GetOldEMPId(employee.REVIEWER_EMP_ID);
                    newEMP.EMPL_TYPE = employee.EMPL_TYPE;
                    newEMP.FRST_NM = employee.FRST_NM;
                    //existingRow.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
                    newEMP.MIDDLE_NM = string.Empty; ;
                    newEMP.LAST_NM = string.Empty;
                    if (!string.IsNullOrWhiteSpace(employee.GENDER))
                        newEMP.GENDER = employee.GENDER.ToCharArray()[0];
                    newEMP.DOB = employee.DOB;
                    newEMP.DOJ = employee.DOJ;
                    newEMP.DOR = employee.DOR;
                    newEMP.LEVEL = string.Empty;
                    newEMP.TITLE = employee.TITLE ?? string.Empty;
                    if (employee.CSM_TITLE_ID.HasValue)
                        newEMP.CSM_TITLE_ID = employee.CSM_TITLE_ID.GetValueOrDefault();
                    newEMP.EXPERIENCE = employee.EXPERIENCE ?? string.Empty;
                    newEMP.EMAIL_ID = employee.EMAIL_ID;
                    newEMP.MOBILE_NBR = employee.MOBILE_NBR ?? string.Empty;
                    newEMP.POTENTIAL_TO_BILL = employee.POTENTIAL_TO_BILL;
                    newEMP.UNBILL_CLASSIFY = string.Empty;
                    newEMP.EMP_ROLE = string.Empty;
                    newEMP.EMP_BAS_ROLE = string.Empty;
                    newEMP.EMP_CSP_ROLE = string.Empty;
                    newEMP.APPRAISAL_RATING = string.Empty;
                    newEMP.PROMOTION_INFO = string.Empty;
                    newEMP.CREATED_BY = employee.CREATED_BY ?? "99999";
                    newEMP.CREATED_DATE = DateTime.Now;
                    newEMP.UPDATED_BY = employee.UPDATED_BY ?? "99999";
                    newEMP.UPDATED_DATE = DateTime.Now;
                    newEMP.EMP_ID_NEW = employee.EMP_ID_NEW;
                    if (employee.SUPERADMIN.HasValue)
                        newEMP.SUPERADMIN = employee.SUPERADMIN;
                    else
                        newEMP.SUPERADMIN = newEMP.SUPERADMIN.GetValueOrDefault();

                    try
                    {

                        Cldb.AppRepo.AddEmployee(newEMP);
                        Cldb.Commit();


                    }
                    catch (Exception exp)
                    {
                        errMsg = GetException(exp, jsonContent);
                    }
                }


            }
            return GetResult<EMP_INFO>(null, errMsg);
        }

        private void UpdateCSMTitle(EF.EMP_INFO employee)
        {
            if (!employee.CSM_TITLE_ID.HasValue)
            {
                if (!string.IsNullOrWhiteSpace(employee.TITLE) && (employee.TITLE.ToLower().Contains("customer success") || employee.TITLE.ToLower().Contains("group manager")))
                    employee.CSM_TITLE_ID = 1;
                else if (!string.IsNullOrWhiteSpace(employee.TITLE) && employee.TITLE.ToLower().Contains("group manager"))
                    employee.CSM_TITLE_ID = 1;
                else if (!string.IsNullOrWhiteSpace(employee.TITLE) && employee.TITLE.ToLower().Contains("manager"))
                    employee.CSM_TITLE_ID = 2;
                else
                    employee.CSM_TITLE_ID = 3;
            }
        }

        private EMP_INFO GetCorrectEmployeeRecord(string emailId)
        {
            EMP_INFO result = null;
            var empRecords = Cldb.EMP_INFO.GetAll().Where(t => t.EMAIL_ID == emailId).ToList();

            if (empRecords.Count == 1)
            {
                if (empRecords.First().DOR == null)
                    result = empRecords.First();
            }
            else
            {

                if (empRecords.All(x => x.DOR == null))
                {
                    //take the old record
                    result = empRecords.FirstOrDefault(x => x.EMP_ID_NEW != null);
                }
                else
                {
                    result = empRecords.FirstOrDefault(x => x.EMP_ID_NEW != null && x.DOR == null);
                }

                if (result == null)
                {
                    result = empRecords.FirstOrDefault(x => x.DOR == null);
                }
            }

            return result;
        }


        [POST("UpdateEmployee")]
        [ActionName("UpdateEmployee")]
        [HttpPost]
        public IHttpActionResult UpdateEmployee(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            EF.EMP_INFO employee = JsonConvert.DeserializeObject<EF.EMP_INFO>(json);
            LogRequest(content: jsonContent);
            if (employee != null)
            {
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                //var existingRow = Cldb.EMP_INFO.GetAll().FirstOrDefault(t => (t.EMP_ID == employee.EMP_ID && t.DOR == null));
                //if (existingRow == null)
                //    existingRow = Cldb.EMP_INFO.GetAll().FirstOrDefault(t => (t.EMP_ID_NEW == employee.EMP_ID && t.DOR != null) && t.EMAIL_ID == employee.EMAIL_ID);

                //if (existingRow == null)
                //    existingRow = Cldb.EMP_INFO.GetAll().FirstOrDefault(t => t.EMP_ID_NEW == employee.EMP_ID && t.EMAIL_ID == employee.EMAIL_ID);
                var existingRow = GetCorrectEmployeeRecord(employee.EMAIL_ID);
                if (existingRow == null)
                {
                    return GetResult<EMP_INFO>(null, $"Employee with {employee.EMAIL_ID} doesnt exists");
                }
                if (existingRow.DOR != null)
                {
                    return GetResult<EMP_INFO>(null, $"Employee with {employee.EMAIL_ID} set as relieved from Neurealm. Unable to update.");
                }
                if (existingRow != null)
                {
                    // existingRow.EMP_ID = employee.EMP_ID;

                    existingRow.FRST_NM = employee.FRST_NM;
                    existingRow.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
                    existingRow.MIDDLE_NM = employee.MIDDLE_NM;
                    //existingRow.LAST_NM = employee.LAST_NM;

                    existingRow.TITLE = employee.TITLE;
                    if (employee.CSM_TITLE_ID.HasValue)
                        existingRow.CSM_TITLE_ID = employee.CSM_TITLE_ID.GetValueOrDefault();
                    else
                    {
                        UpdateCSMTitle(employee);
                    }

                    //existingRow.EMAIL_ID = employee.EMAIL_ID;
                    existingRow.DOR = employee.DOR;

                    existingRow.EMP_CSP_ROLE = employee.EMP_CSP_ROLE;
                    existingRow.UPDATED_DATE = DateTime.Now;
                    //existingRow.EMP_ID_NEW = employee.EMP_ID_NEW;
                    try
                    {
                        Cldb.EMP_INFO.Update(existingRow);
                        Cldb.Commit();
                        try
                        {
                            //var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == employee.EMP_ID);
                            //if (emp != null)
                            //{
                            //    emp.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
                            //    Cldb.EMP_INFO.Update(emp);
                            //}
                        }
                        catch { }
                        // LogRequest(content: jsonContent);
                    }

                    catch (DbEntityValidationException e)
                    {
                        errMsg = "";
                        foreach (var eve in e.EntityValidationErrors)
                        {
                            errMsg += $"Entity of type {eve.Entry?.Entity?.GetType().Name} in state {eve.Entry.State} has the following validation errors:";
                            foreach (var ve in eve.ValidationErrors)
                            {
                                errMsg += $"- Property:  {ve.PropertyName} , Error:{ve.ErrorMessage}";
                            }
                        }

                    }
                    catch (Exception exp)
                    {
                        errMsg = GetException(exp, jsonContent, "PSA:");
                    }
                }
                else
                {
                    AddNewEmployee(request);
                    // errMsg = "Emp id not found in the db (" + employee.EMP_ID.ToString() + "-" + employee.EMAIL_ID.ToString() + ")";
                }

            }
            return GetResult<EMP_INFO>(null, errMsg);
        }
        //[POST("AddNewEmployee")]
        //[ActionName("AddNewEmployee")]
        //[HttpPost]
        //public IHttpActionResult AddNewEmployee(HttpRequestMessage request)
        //{

        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    LogRequest(content: jsonContent);
        //    EF.EMP_INFO employee = JsonConvert.DeserializeObject<EF.EMP_INFO>(json);
        //    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        //    if (employee != null)
        //    {
        //        employee.LAST_NM = null;
        //        if (employee.SUPERADMIN.HasValue == false)
        //            employee.SUPERADMIN = false;
        //        if (!employee.CSM_TITLE_ID.HasValue)
        //        {
        //            if (!string.IsNullOrWhiteSpace(employee.TITLE) && employee.TITLE.ToLower().Contains("customer success"))
        //                employee.CSM_TITLE_ID = 1;
        //            else
        //                employee.CSM_TITLE_ID = 3;
        //        }
        //        using (EF.RasEntities context = new EF.RasEntities())
        //        {
        //            var existing = context.EMP_INFO.FirstOrDefault(x => x.EMP_ID == employee.EMP_ID);
        //            if (existing != null)
        //                //return GetResult<EMP_INFO>(null, $"Emp Id {employee.EMP_ID} already exists.");
        //                return UpdateEmployee(request);
        //            try
        //            {

        //                context.EMP_INFO.Add(employee);
        //                context.SaveChanges();

        //                try
        //                {
        //                    //var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == employee.EMP_ID);
        //                    //if (emp != null)
        //                    //{
        //                    //    emp.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
        //                    //    Cldb.EMP_INFO.Update(emp);
        //                    //}
        //                }
        //                catch { }

        //                //LogRequest(content: jsonContent);
        //                //Cldb.AppRepo.AddCustomer(customer);
        //            }
        //            catch (Exception exp)
        //            {
        //                errMsg = GetException(exp, jsonContent);
        //            }
        //        }

        //    }
        //    return GetResult<EMP_INFO>(null, errMsg);
        //}
        //[POST("UpdateEmployee")]
        //[ActionName("UpdateEmployee")]
        //[HttpPost]
        //public IHttpActionResult UpdateEmployee(HttpRequestMessage request)
        //{

        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    EF.EMP_INFO employee = JsonConvert.DeserializeObject<EF.EMP_INFO>(json);
        //    LogRequest(content: jsonContent);
        //    if (employee != null)
        //    {
        //        ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
        //        using (EF.RasEntities context = new EF.RasEntities())
        //        {

        //            EF.EMP_INFO existingRow = context.EMP_INFO.Where(t => t.EMP_ID == employee.EMP_ID).FirstOrDefault();
        //            if (existingRow != null)
        //            {
        //                existingRow.EMP_ID = employee.EMP_ID;
        //                existingRow.BASE_CNTRY_ID = employee.BASE_CNTRY_ID;
        //                existingRow.MANAGER_EMP_ID = employee.MANAGER_EMP_ID;
        //                existingRow.REVIEWER_EMP_ID = employee.REVIEWER_EMP_ID;
        //                existingRow.EMPL_TYPE = employee.EMPL_TYPE;
        //                existingRow.FRST_NM = employee.FRST_NM;
        //                existingRow.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
        //                existingRow.MIDDLE_NM = employee.MIDDLE_NM;
        //                //existingRow.LAST_NM = employee.LAST_NM;
        //                existingRow.GENDER = employee.GENDER;
        //                existingRow.DOB = employee.DOB;
        //                existingRow.DOJ = employee.DOJ;
        //                existingRow.DOR = employee.DOR;
        //                existingRow.LEVEL = employee.LEVEL;
        //                existingRow.TITLE = employee.TITLE;
        //                if (employee.CSM_TITLE_ID.HasValue)
        //                    existingRow.CSM_TITLE_ID = employee.CSM_TITLE_ID;
        //                existingRow.EXPERIENCE = employee.EXPERIENCE;
        //                existingRow.EMAIL_ID = employee.EMAIL_ID;
        //                //existingRow.MOBILE_NBR = employee.MOBILE_NBR;
        //                existingRow.POTENTIAL_TO_BILL = employee.POTENTIAL_TO_BILL;
        //                existingRow.UNBILL_CLASSIFY = employee.UNBILL_CLASSIFY;
        //                existingRow.EMP_ROLE = employee.EMP_ROLE;
        //                existingRow.EMP_BAS_ROLE = employee.EMP_BAS_ROLE;
        //                existingRow.EMP_CSP_ROLE = employee.EMP_CSP_ROLE;
        //                existingRow.APPRAISAL_RATING = employee.APPRAISAL_RATING;
        //                existingRow.PROMOTION_INFO = employee.PROMOTION_INFO;
        //                existingRow.CREATED_BY = employee.CREATED_BY;
        //                existingRow.CREATED_DATE = employee.CREATED_DATE;
        //                existingRow.UPDATED_BY = employee.UPDATED_BY;
        //                existingRow.UPDATED_DATE = DateTime.Now;
        //                if (employee.SUPERADMIN.HasValue)
        //                    existingRow.SUPERADMIN = employee.SUPERADMIN;
        //                else
        //                    existingRow.SUPERADMIN = existingRow.SUPERADMIN.GetValueOrDefault();
        //                try
        //                {
        //                    context.SaveChanges();
        //                    try
        //                    {
        //                        //var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == employee.EMP_ID);
        //                        //if (emp != null)
        //                        //{
        //                        //    emp.NAME_IN_US_FORMAT = employee.NAME_IN_US_FORMAT;
        //                        //    Cldb.EMP_INFO.Update(emp);
        //                        //}
        //                    }
        //                    catch { }
        //                   // LogRequest(content: jsonContent);
        //                }

        //                catch (DbEntityValidationException e)
        //                {
        //                    errMsg = "";
        //                    foreach (var eve in e.EntityValidationErrors)
        //                    {
        //                        errMsg += $"Entity of type {eve.Entry?.Entity?.GetType().Name} in state {eve.Entry.State} has the following validation errors:";
        //                        foreach (var ve in eve.ValidationErrors)
        //                        {
        //                            errMsg += $"- Property:  {ve.PropertyName} , Error:{ve.ErrorMessage}";
        //                        }
        //                    }

        //                }
        //                catch (Exception exp)
        //                {
        //                    errMsg = GetException(exp, jsonContent);
        //                }
        //            }
        //            else
        //            {
        //                errMsg = "Emp id not found in the db (" + employee.EMP_ID.ToString() + ")";
        //            }
        //        }
        //    }
        //    return GetResult<EMP_INFO>(null, errMsg);
        //}
        #endregion
        #region Project Resource
        [GET("GetProjectResourceByEmloyeeId")]
        [ActionName("GetProjectResourceByEmloyeeId")]
        [HttpGet]
        public IHttpActionResult GetProjectResourceByEmloyeeId(string EmpId)
        {
            // LogRequest();
            string errMsg = string.Empty;
            List<PROJECT_RESOURCE> employee = new List<PROJECT_RESOURCE>();
            try
            {
                employee = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.EMP_ID == EmpId).ToList();
            }
            catch (Exception exp)
            {
                errMsg = GetException(exp, EmpId.ToString());
            }
            if (string.IsNullOrEmpty(errMsg))
            {
                return Ok(employee);
            }
            else
            {
                return Content(HttpStatusCode.Conflict, errMsg);
            }
        }
        [GET("GetProjectResourceById")]
        [ActionName("GetProjectResourceById")]
        [HttpGet]
        public IHttpActionResult GetProjectResourceById(string GUId)
        {
            // LogRequest();
            string errMsg = string.Empty;
            PROJECT_RESOURCE employee = null;
            try
            {
                employee = Cldb.PROJECT_RESOURCE.GetAll().FirstOrDefault(t => t.ID == GUId);
            }
            catch (Exception exp)
            {
                errMsg = GetException(exp, GUId);
            }
            return GetResult<PROJECT_RESOURCE>(employee, errMsg);
        }
        [POST("AddNewProjectResource")]
        [ActionName("AddNewProjectResource")]
        [HttpPost]
        public IHttpActionResult AddNewProjectResource(HttpRequestMessage request)
        {
            //var json = @"{""PROJ_ID"":""PROJ1005"",""EMP_ID"":""GS-2735"",""PROJ_REVIEWER_EMP_ID"":""GS-0747"",""PROJ_RM_EMP_ID"":""GS-1294"",""START_DATE"":""2022-12-01"",""END_DATE"":""2023-05-30"",""BILL_FLG"":false,""ALLCT_PCT"":100,""ALLOCATION_HOURS"":""200"",""CREATED_DATE"":""2022-12-01 07:58:13"",""CURR_INDC"":""Y"",""ID"":"""",""ORG_CODE"":"""",""UPDATED_DATE"":""2022-12-01 07:58:13"",""CREATED_BY"":""GS-3632"",""UPDATED_BY"":""GS-3632""}";
            //var res = AddProjResourcePrivate(json);
            var content = request.Content;

            string jsonContent = content.ReadAsStringAsync().Result;

            return AddProjResourcePrivate(jsonContent);
        }

        private IHttpActionResult AddProjResourcePrivate(string jsonContent)
        {
            string errMsg = string.Empty;
            dynamic json = jsonContent;
            PROJECT_RESOURCE resource = JsonConvert.DeserializeObject<PROJECT_RESOURCE>(json);
            LogRequest(content: jsonContent);
            if (resource != null)
            {
                if (string.IsNullOrWhiteSpace(resource.EMP_ID) || string.IsNullOrWhiteSpace(resource.PROJ_ID))
                {
                    return GetResult<PROJECT_RESOURCE>(null, $"Please make sure both Project Id and Employee Id are filled.");
                }
                resource.EMP_ID = GetOldEMPId(resource.EMP_ID);
                resource.PROJ_REVIEWER_EMP_ID = GetOldEMPId(resource.PROJ_REVIEWER_EMP_ID);
                resource.PROJ_RM_EMP_ID = GetOldEMPId(resource.PROJ_RM_EMP_ID);

                var existing = Cldb.PROJECT_RESOURCE.GetAll().FirstOrDefault(x => x.EMP_ID == resource.EMP_ID && x.PROJ_ID == resource.PROJ_ID && x.BILL_FLG && x.END_DATE > DateTime.Now);
                if (existing != null)
                {
                    return GetResult<PROJECT_RESOURCE>(null, $"Project Resource allocation for {resource.EMP_ID} in {resource.PROJ_ID } already exists");
                }

                var employee = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == resource.EMP_ID);
                if (employee == null)
                    return GetResult<PROJECT_RESOURCE>(null, $"Employee with {resource.EMP_ID} doesnt exists");

                var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == resource.PROJ_ID);
                if (project == null)
                    return GetResult<PROJECT_RESOURCE>(null, $"Project with {resource.PROJ_ID} doesnt exists");


                if (!string.IsNullOrWhiteSpace(resource.ID))
                {
                    existing = Cldb.PROJECT_RESOURCE.GetAll().FirstOrDefault(x => x.ID == resource.ID);
                    if (existing != null)
                    {
                        return UpdateProjectResource(Request);
                        //return GetResult<PROJECT_RESOURCE>(null, "GUID already exists");
                    }
                }


                try
                {
                    if (resource.START_DATE < new DateTime(2020, 3, 1) && resource.END_DATE > new DateTime(2020, 3, 1)) resource.START_DATE = new DateTime(2020, 3, 1);

                    Cldb.PROJECT_RESOURCE.Add(resource);
                    Cldb.Commit();
                    LogRequest(content: jsonContent);
                }
                catch (Exception exp)
                {
                    errMsg = GetException(exp, jsonContent, "PSA:");
                    return GetResult<PROJECT_RESOURCE>(null, errMsg);
                }
            }
            return GetResult<PROJECT_RESOURCE>(resource, errMsg);
        }

        private IHttpActionResult UpdateProjResourcePrivate(string jsonContent)
        {
            dynamic json = jsonContent;
            PROJECT_RESOURCE resource = JsonConvert.DeserializeObject<PROJECT_RESOURCE>(json);
            string errMsg = string.Empty;
            if (resource != null)
            {
                PROJECT_RESOURCE existingResource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.ID == resource.ID).FirstOrDefault();
                if (existingResource != null)
                {
                    existingResource.PROJ_ID = resource.PROJ_ID;

                    existingResource.EMP_PROJ_ROLE_MAP_ID = resource.EMP_PROJ_ROLE_MAP_ID;
                    //existingResource.PROJ_RM_EMP_ID = resource.PROJ_RM_EMP_ID;
                    //existingResource.PROJ_REVIEWER_EMP_ID = resource.PROJ_REVIEWER_EMP_ID;
                    //existingResource.EMP_ID = resource.EMP_ID;
                    existingResource.EMP_ID = GetOldEMPId(resource.EMP_ID);
                    existingResource.PROJ_REVIEWER_EMP_ID = GetOldEMPId(resource.PROJ_REVIEWER_EMP_ID);
                    existingResource.PROJ_RM_EMP_ID = GetOldEMPId(resource.PROJ_RM_EMP_ID);

                    if (resource.START_DATE < new DateTime(2020, 3, 1) && resource.END_DATE > new DateTime(2020, 3, 1)) resource.START_DATE = new DateTime(2020, 3, 1);
                    existingResource.START_DATE = resource.START_DATE;
                    existingResource.END_DATE = resource.END_DATE;
                    existingResource.BILL_FLG = resource.BILL_FLG;
                    existingResource.ALLCT_PCT = resource.ALLCT_PCT;
                    existingResource.RELEASE_REMARK = resource.RELEASE_REMARK;
                    existingResource.PERF_REMARK = resource.PERF_REMARK;
                    existingResource.PERF_RATING = resource.PERF_RATING;
                    existingResource.CURR_INDC = resource.CURR_INDC;
                    existingResource.COMMENTS = resource.COMMENTS;
                    existingResource.CREATED_BY = resource.CREATED_BY;
                    existingResource.CREATED_DATE = resource.CREATED_DATE;
                    existingResource.UPDATED_BY = resource.UPDATED_BY;
                    existingResource.UPDATED_DATE = DateTime.Now;
                    existingResource.ROLE_MAPPED_STATUS = resource.ROLE_MAPPED_STATUS;
                    existingResource.ORG_CODE = resource.ORG_CODE;
                    existingResource.ALLOCATION_HOURS = resource.ALLOCATION_HOURS;
                    try
                    {
                        Cldb.PROJECT_RESOURCE.Update(existingResource);
                        Cldb.Commit();
                        LogRequest(content: jsonContent);
                    }
                    catch (Exception exp)
                    {
                        errMsg = GetException(exp, jsonContent, "PSA:");
                        return GetResult<PROJECT_RESOURCE>(null, errMsg);
                    }
                }
                else
                {

                    errMsg = "ALLOCATION id not found in the db (" + resource.ID + ")";
                    LogRequest(content: jsonContent);
                    return GetResult<PROJECT_RESOURCE>(null, errMsg);
                }

            }
            return GetResult<PROJECT_RESOURCE>(resource, errMsg);
        }
        [POST("UpdateProjectResource")]
        [ActionName("UpdateProjectResource")]
        [HttpPost]
        public IHttpActionResult UpdateProjectResource(HttpRequestMessage request)
        {

            var content = request.Content;

            string jsonContent = content.ReadAsStringAsync().Result;
            return UpdateProjResourcePrivate(jsonContent);
        }

        [POST("DeleteExistingProjectResource")]
        [ActionName("DeleteExistingProjectResource")]
        [HttpPost]
        public IHttpActionResult DeleteExistingProjectResource(HttpRequestMessage request)
        {

            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            PROJECT_RESOURCE resource = JsonConvert.DeserializeObject<PROJECT_RESOURCE>(json);
            if (resource != null)
            {
                PROJECT_RESOURCE existingResource = Cldb.PROJECT_RESOURCE.GetAll().Where(t => t.ID == resource.ID).FirstOrDefault();
                if (existingResource != null)
                {

                    try
                    {
                        Cldb.PROJECT_RESOURCE.Delete(existingResource);
                        Cldb.Commit();
                        LogRequest(content: jsonContent);
                    }
                    catch (Exception exp)
                    {
                        errMsg = GetException(exp, jsonContent, "PSA:");
                    }
                }
                else
                {
                    errMsg = "ALLOCATION id not found in the db (" + resource.ID + ")";
                }
            }
            return GetResult<PROJECT_RESOURCE>(null, errMsg);
        }

        #endregion
        #region Timesheet
        //[GET("GetTimesheetById")]
        //[ActionName("GetTimesheetById")]
        //[HttpGet]
        //public IHttpActionResult GetTimesheetById(string GUId)
        //{
        //    //LogRequest();
        //    string errMsg = string.Empty;
        //    PROJ_RESRC_TIME_ENTRY timesheet = null;
        //    try
        //    {
        //        timesheet = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(t => t.ID == GUId).FirstOrDefault();
        //    }
        //    catch (Exception exp)
        //    {
        //        errMsg = GetException(exp, GUId);
        //    }
        //    return GetResult<PROJ_RESRC_TIME_ENTRY>(timesheet, errMsg);
        //}
        //[GET("GetTimesheetByEmpId")]
        //[ActionName("GetTimesheetByEmpId")]
        //[HttpGet]
        //public IHttpActionResult GetTimesheetByEmpId(string EmpId)
        //{
        //    //LogRequest();
        //    string errMsg = string.Empty;
        //    List<PROJ_RESRC_TIME_ENTRY> employee = null;
        //    try
        //    {
        //        employee = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(t => t.EMP_ID == EmpId).ToList();
        //    }
        //    catch (Exception exp)
        //    {
        //        errMsg = GetException(exp, EmpId.ToString());
        //    }
        //    if (string.IsNullOrWhiteSpace(errMsg))
        //    {
        //        return Ok(employee);
        //    }
        //    else
        //    {
        //        return Content(HttpStatusCode.Conflict, errMsg);
        //    }
        //}
        //[GET("GetTimesheetByEmpIdAndDate")]
        //[ActionName("GetTimesheetByEmpIdAndDate")]
        //[HttpGet]
        //public IHttpActionResult GetTimesheetByEmpIdAndDate(string EmpId, DateTime StartDate, DateTime EndDate)
        //{
        //    //LogRequest();
        //    string errMsg = string.Empty;
        //    List<PROJ_RESRC_TIME_ENTRY> employee = null;
        //    try
        //    {
        //        employee = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll()
        //        .Where(t => t.EMP_ID == EmpId && t.UPDATED_DATE >= StartDate && t.UPDATED_DATE <= EndDate).ToList();
        //    }
        //    catch (Exception exp)
        //    {
        //        errMsg = GetException(exp, EmpId.ToString());
        //    }
        //    if (string.IsNullOrEmpty(errMsg))
        //    {
        //        return Ok(employee);
        //    }
        //    else
        //    {
        //        return Content(HttpStatusCode.Conflict, errMsg);
        //    }
        //}
        //[POST("AddNewTimesheet")]
        //[ActionName("AddNewTimesheet")]
        //[HttpPost]
        //public IHttpActionResult AddNewTimesheet(HttpRequestMessage request)
        //{
        //    LogRequest();
        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    PROJ_RESRC_TIME_ENTRY timesheet = JsonConvert.DeserializeObject<PROJ_RESRC_TIME_ENTRY>(json);

        //    if (timesheet != null)
        //    {
        //        try
        //        {
        //            UpdateDateId(ref timesheet);
        //            var existingRejected = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().Where(x => x.DATE_ID == timesheet.DATE_ID && x.PROJ_ID == timesheet.PROJ_ID && x.EMP_ID == timesheet.EMP_ID && x.TIME_ENTRY_STATUS.ToUpper() == "CUSTOMER REJECT").ToList();
        //            if (existingRejected.Any())
        //            {
        //                foreach (var item in existingRejected)
        //                {
        //                    item.CLOCKED_MINS = 0;
        //                    //item.TIME_ENTRY_STATUS = timesheet.TIME_ENTRY_STATUS;
        //                    //item.ID = null;
        //                    Cldb.PROJ_RESRC_TIME_ENTRY.Update(item);
        //                }
        //                Cldb.Commit();
        //            }
        //            var existing = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(x => x.ID == timesheet.ID);
        //            if (existing != null)
        //            {
        //                return UpdateTimesheet(request);
        //                //return GetResult<PROJ_RESRC_TIME_ENTRY>(null, "GUID already exists");
        //            }

        //            //var existing = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(x => x.EMP_ID == timesheet.EMP_ID && x.PROJ_ID == timesheet.PROJ_ID
        //            //&& x.PROJ_TASK_ID == timesheet.PROJ_TASK_ID);

        //            //UpdateToLocalDate(ref timesheet);
        //            Cldb.PROJ_RESRC_TIME_ENTRY.Add(timesheet);
        //            Cldb.Commit();
        //        }
        //        catch (Exception exp)
        //        {
        //            errMsg = GetException(exp, jsonContent);
        //        }
        //    }
        //    return GetResult<PROJ_RESRC_TIME_ENTRY>(null, errMsg);
        //}
        //[POST("AddNewTimesheets")]
        //[ActionName("AddNewTimesheets")]
        //[HttpPost]
        //public IHttpActionResult AddNewTimesheets(HttpRequestMessage request)
        //{
        //    LogRequest();
        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    List<PROJ_RESRC_TIME_ENTRY> timesheets = JsonConvert.DeserializeObject<List<PROJ_RESRC_TIME_ENTRY>>(json);

        //    if (timesheets != null)
        //    {
        //        try
        //        {
        //            if (timesheets.Any())
        //            {
        //                foreach (var item in timesheets)
        //                {
        //                    var existing = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(x => x.ID == item.ID);
        //                    if (existing != null)
        //                    {
        //                        return GetResult<PROJ_RESRC_TIME_ENTRY>(null, "GUID already exists");
        //                    }
        //                }
        //                UpdateDateId(ref timesheets);
        //                Cldb.AppRepo.Insert_PROJ_RESRC_TIME_ENTRY_PSA(ToDataTable(timesheets));
        //            }
        //        }
        //        catch (Exception exp)
        //        {
        //            errMsg = GetException(exp, jsonContent);
        //        }
        //    }
        //    return GetResult<PROJ_RESRC_TIME_ENTRY>(null, errMsg);
        //}
        //[POST("UpdateTimesheet")]
        //[ActionName("UpdateTimesheet")]
        //[HttpPost]
        //public IHttpActionResult UpdateTimesheet(HttpRequestMessage request)
        //{
        //    LogRequest();
        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    PROJ_RESRC_TIME_ENTRY timesheet = JsonConvert.DeserializeObject<PROJ_RESRC_TIME_ENTRY>(json);

        //    if (timesheet != null)
        //    {
        //        try
        //        {
        //            var existing = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(x => x.ID == timesheet.ID);
        //            if (existing != null && (existing.TIME_ENTRY_STATUS.ToUpper() == "APPROVED"))
        //            {
        //                return GetResult<PROJ_RESRC_TIME_ENTRY>(null, $"Timesheet with Id -{timesheet.ID} is in {existing.TIME_ENTRY_STATUS} status. Cannot update now.");
        //            }
        //            UpdateDateId(ref timesheet);
        //            timesheet.UPDATED_DATE = DateTime.Now;
        //            Cldb.AppRepo.Update_PROJ_RESRC_TIME_ENTRY_PSA(ToDataTable(new List<PROJ_RESRC_TIME_ENTRY>() { timesheet }));
        //        }
        //        catch (Exception exp)
        //        {
        //            errMsg = GetException(exp, jsonContent);
        //        }
        //    }
        //    return GetResult<PROJ_RESRC_TIME_ENTRY>(null, errMsg);
        //}
        //[POST("UpdateTimesheets")]
        //[ActionName("UpdateTimesheets")]
        //[HttpPost]
        //public IHttpActionResult UpdateTimesheets(HttpRequestMessage request)
        //{
        //    LogRequest();
        //    var content = request.Content;
        //    string errMsg = string.Empty;
        //    string jsonContent = content.ReadAsStringAsync().Result;
        //    dynamic json = jsonContent;
        //    List<PROJ_RESRC_TIME_ENTRY> timesheets = JsonConvert.DeserializeObject<List<PROJ_RESRC_TIME_ENTRY>>(json);

        //    if (timesheets != null)
        //    {
        //        try
        //        {
        //            foreach (var timesheet in timesheets)
        //            {
        //                var existing = Cldb.PROJ_RESRC_TIME_ENTRY.GetAll().FirstOrDefault(x => x.ID == timesheet.ID);
        //                if (existing != null && (existing.TIME_ENTRY_STATUS.ToUpper() == "APPROVED"))
        //                {
        //                    return GetResult<PROJ_RESRC_TIME_ENTRY>(null, $"Timesheet with Id -{timesheet.ID} is in {existing.TIME_ENTRY_STATUS} status. Cannot update now.");
        //                }
        //            }
        //            UpdateDateId(ref timesheets);
        //            Cldb.AppRepo.Update_PROJ_RESRC_TIME_ENTRY(ToDataTable(timesheets));
        //        }
        //        catch (Exception exp)
        //        {
        //            errMsg = GetException(exp, jsonContent);
        //        }
        //    }
        //    return GetResult<PROJ_RESRC_TIME_ENTRY>(null, errMsg);
        //}

        //[POST("UpdateTimesheetsToPSA")]
        //[ActionName("UpdateTimesheetsToPSA")]
        //[HttpPost]
        //public IHttpActionResult UpdateTimesheetsToPSA(HttpRequestMessage request)
        //{
        //    var urlRequest = (HttpWebRequest)WebRequest.Create("https://api.github.com/repos/restsharp/restsharp/releases");
        //    urlRequest.Method = "PATCH";
        //    urlRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
        //    urlRequest.AutomaticDecompression = DecompressionMethods.Deflate | DecompressionMethods.GZip;
        //    urlRequest.para.
        //    var response = (HttpWebResponse)request.GetResponse();
        //    string content = string.Empty;
        //    using (var stream = response.GetResponseStream())
        //    {
        //        using (var sr = new StreamReader(stream))
        //        {
        //            content = sr.ReadToEnd();
        //        }
        //    }
        //    var releases = JArray.Parse(content);
        //    return Ok();
        //}


        private void UpdateTimesheetApprovalToPSA(PSA_APPROVAL status, string emp)
        {
            try
            {

                //string serverURL = "https://csmpsa.gavstech.com/api/timesheet/" + status.ID;
                //var restClient = new RestClient(serverURL);
                //var restRequest = new RestRequest(serverURL, Method.PATCH);
                var jContent = "{ \"CSMApprovalDate\": \"" + status.CSMApprovalDate.Value.ToString("yyy-MM-dd") + "\", \"CSMRejectionDate\":null,  \"CSMRejectionComments\":null}";
                //restRequest.AddParameter("application/json", jContent, ParameterType.RequestBody);
                if (!string.IsNullOrWhiteSpace(status.ID))
                    CreatePSATimesheetSync(status.ID, jContent, false, emp);
                //if (IsPSASyncNeeded())
                //{
                //    //IRestResponse<object> result = restClient.Execute<object>(restRequest);
                //    //LogRequest(prefix: $"CUSTOMER APPROVE - {status.ID}:");
                //    ProcessPSARequests();

                //}
                //else
                //{
                //    //LogRequest(prefix: $" Not synced - CUSTOMER APPROVE - {status.ID}:");
                //}

            }
            catch (Exception ex)
            {
                LogRequest(ex);
            }
        }
        private void UpdateTimesheetRejectToPSA(PSA_APPROVAL status, string emp)
        {
            try
            {
                //string serverURL = "https://csmpsa.gavstech.com/api/timesheet/" + status.ID;
                //var restClient = new RestClient(serverURL);
                //var restRequest = new RestRequest(serverURL, Method.PATCH);

                //var jContent = "{ \"CSMApprovalDate\":null, \"CSMRejectionDate\": \"" + status.CSMRejectionDate.Value.ToString("yyy-MM-dd") + "\",  \"CSMRejectionComments\": \"" + status.CSMRejectionComments + "\"}";
                //restRequest.AddParameter("application/json", jContent, ParameterType.RequestBody);
                //if (!string.IsNullOrWhiteSpace(status.ID))
                //    CreatePSATimesheetSync(status.ID, jContent, true, emp);


                //if (IsPSASyncNeeded())
                //{
                //    //IRestResponse<object> result = restClient.Execute<object>(restRequest);
                //    //LogRequest(prefix: $"CUSTOMER Reject - {status.ID}:");
                //    ProcessPSARequests();

                //}
                //else
                //{
                //    // LogRequest(prefix: $" Not synced - CUSTOMER Reject - {status.ID}:");
                //}

            }
            catch (Exception ex)
            {
                LogRequest(ex);
            }
        }

        [POST("ProcessPSARequests")]
        [ActionName("ProcessPSARequests")]
        [HttpPost]
        public IHttpActionResult ProcessPSARequests()
        {
            SendUnsentMails();
            if (!_psaSyncNeeded) return Ok();
            var unprocessed = Cldb.PSA_TIMESHEET_SYNC.GetAll().Where(x => x.SYNCED == null || x.SYNCED == false).ToList();
            foreach (var item in unprocessed)
            {
                try
                {
                    //string serverURL = "https://csmpsa.gavstech.com/api/timesheet/" + item.PSA_ID;
                    //var restClient = new RestClient(serverURL);
                    //var restRequest = new RestRequest(serverURL, Method.PATCH);
                    ////var jContent = "{ \"CSMApprovalDate\":null, \"CSMRejectionDate\": \"" + status.CSMRejectionDate + "\",  \"CSMRejectionComments\": \"" + status.CSMRejectionComments + "\"}";
                    //var jContent = item.JSON_CONTENT;
                    //restRequest.AddParameter("application/json", jContent, ParameterType.RequestBody);
                    //IRestResponse<object> result = restClient.Execute<object>(restRequest);
                    //if (item.ISREJECT.GetValueOrDefault())
                    //    LogRequest(prefix: $"CUSTOMER REJECT - {item.PSA_ID}:");
                    //else
                    //    LogRequest(prefix: $"CUSTOMER APPROVE - {item.PSA_ID}:");
                    //dynamic jsonContent = JsonConvert.DeserializeObject(result.Content);
                    //string text = jsonContent.StatusCode;
                    //if (!string.IsNullOrWhiteSpace(text) && text.ToUpper() == "SUCCESS")
                    //{
                    //    item.SYNCED = true;
                    //    item.ERROR = null;

                    //}
                    //else
                    //{
                    //    item.ERROR = result.Content;
                    //}
                    //item.UPDATED_DATE = DateTime.Now;
                    //Cldb.PSA_TIMESHEET_SYNC.Update(item);
                    //Cldb.Commit();
                }
                catch (Exception ex)
                {
                    LogRequest(ex);
                }
            }
            return Ok();

        }

        private bool IsPSASyncNeeded()
        {
            //bool syncNeeded = true;
            //bool.TryParse(ConfigurationManager.AppSettings["SyncNeeded"], out syncNeeded);

            //return syncNeeded;
            return _psaSyncNeeded;
        }

        private PSA_TIMESHEET_SYNC CreatePSATimesheetSync(string id, string jsoncontent, bool isreject, string emp)
        {

            var ety = new PSA_TIMESHEET_SYNC
            {
                PSA_ID = id,
                ISREJECT = isreject,
                JSON_CONTENT = jsoncontent,
                CREATED_BY = emp,
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = emp,
                UPDATED_DATE = DateTime.Now
            };
            Cldb.PSA_TIMESHEET_SYNC.Add(ety);
            Cldb.Commit();
            return ety;
        }



        [POST("UpdateTimesheetApprovalToPSA")]
        [ActionName("UpdateTimesheetApprovalToPSA")]
        [HttpPost]
        public IHttpActionResult UpdateTimesheetApprovalToPSA(HttpRequestMessage request)
        {
            LogRequest();
            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            PSA_APPROVAL timesheet = JsonConvert.DeserializeObject<PSA_APPROVAL>(json);

            try
            {
                //string serverURL = "https://csmpsa.gavstech.com/api/timesheet/" + timesheet.ID;
                //var restClient = new RestClient(serverURL);
                //var restRequest = new RestRequest(serverURL, Method.PATCH);

                //var jContent = "{ \"CSMApprovalDate\": \"" + timesheet.CSMApprovalDate + "\", \"CSMRejectionDate\":null,  \"CSMRejectionComments\":null}";
                //restRequest.AddParameter("application/json", jContent, ParameterType.RequestBody);

                // To avoid the Self signed certificate errors
                //this.SSLErrorCheck(ref restClient);
                //IRestResponse<object> result = restClient.Execute<object>(restRequest);

                //if ((result.StatusCode == HttpStatusCode.OK || result.StatusCode == HttpStatusCode.Created) && !String.IsNullOrEmpty(result.Content))
                //{
                //    retValue = (JObject)JsonConvert.DeserializeObject(result.Content);
                //}
            }
            catch (Exception ex)
            {
                LogRequest(ex);
                //lg.LogException(ex);
            }

            return Ok();
        }

        [POST("UpdateTimesheetRejectToPSA")]
        [ActionName("UpdateTimesheetRejectToPSA")]
        [HttpPost]
        public IHttpActionResult UpdateTimesheetRejectToPSA(HttpRequestMessage request)
        {
            LogRequest();
            var content = request.Content;
            string errMsg = string.Empty;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            PSA_APPROVAL timesheet = JsonConvert.DeserializeObject<PSA_APPROVAL>(json);

            try
            {
                //string serverURL = "https://csmpsa.gavstech.com/api/timesheet/" + timesheet.ID;
                //var restClient = new RestClient(serverURL);
                //var restRequest = new RestRequest(serverURL, Method.PATCH);

                ////var jContent = "{ \"CSMApprovalDate\": \null, \"CSMRejectionDate\": \"" + timesheet.CSMRejectionDate + "\",  \"CSMRejectionComments\": \"" + timesheet.CSMRejectionComments + "\"";
                ////restRequest.AddParameter("application/json", jContent, ParameterType.RequestBody);

                //// To avoid the Self signed certificate errors
                ////this.SSLErrorCheck(ref restClient);
                //IRestResponse<object> result = restClient.Execute<object>(restRequest);

                //if ((result.StatusCode == HttpStatusCode.OK || result.StatusCode == HttpStatusCode.Created) && !String.IsNullOrEmpty(result.Content))
                //{
                //    retValue = (JObject)JsonConvert.DeserializeObject(result.Content);
                //}
            }
            catch (Exception ex)
            {
                LogRequest(ex);
                //lg.LogException(ex);
            }

            return Ok();
        }


        #endregion
        #region General methods
        private void UpdateDateId(ref PROJ_RESRC_TIME_ENTRY timesheet)
        {
            if (timesheet.DATE_ID == 1)
                timesheet.DATE_ID = GetDateDim(timesheet.UPDATED_DATE.Value);
        }
        private void UpdateToLocalDate(ref PROJ_RESRC_TIME_ENTRY timesheet)
        {
            //timesheet.CREATED_DATE = timesheet.CREATED_DATE.Value.ToLocalTime();
            //timesheet.UPDATED_DATE = timesheet.UPDATED_DATE.Value.ToLocalTime();
        }
        private void UpdateToLocalDate(ref List<PROJ_RESRC_TIME_ENTRY> timesheets)
        {
            foreach (PROJ_RESRC_TIME_ENTRY t in timesheets)
            {
                t.CREATED_DATE = t.CREATED_DATE.Value.ToLocalTime();
            }
        }
        private void UpdateDateId(ref List<PROJ_RESRC_TIME_ENTRY> timesheets)
        {
            foreach (PROJ_RESRC_TIME_ENTRY t in timesheets)
            {
                if (t.DATE_ID == 1)
                    t.DATE_ID = this.GetDateDim(t.UPDATED_DATE.Value);
            }
        }

        private int GetDateDim(DateTime dt)
        {
            TimeSpan? datedim = dt.AddDays(1) - Convert.ToDateTime("1-1-2000");
            return Convert.ToInt32(datedim.Value.TotalDays);
        }
        #endregion

        public class PSA_APPROVAL
        {
            public PSA_APPROVAL(string id, DateTime? cSMApprovalDate, DateTime? cSMRejectionDate, string cSMRejectionComments)
            {
                ID = id;
                CSMApprovalDate = cSMApprovalDate;
                CSMRejectionDate = cSMRejectionDate;
                CSMRejectionComments = cSMRejectionComments;
            }
            public string ID { get; set; }
            public DateTime? CSMApprovalDate { get; set; } = null;
            public DateTime? CSMRejectionDate { get; set; } = null;
            public string CSMRejectionComments { get; set; }
        }


    }
}