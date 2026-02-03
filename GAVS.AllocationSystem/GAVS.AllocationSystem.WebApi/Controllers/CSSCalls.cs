using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Configuration;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    //[BearerTokenAuthorization]
    //[ExceptionFilter]
    public partial class AllSysController
    {

        private const string CSS_COMPLETED = "COMPLETED";
        private const string CSS_MAIL_SENT = "MAIL SENT";
        private const string CSS_MAIL_RESENT = "MAIL RE-SENT";
        private const string CSS_CREATED = "CREATED";
        private const string CSS_DRAFT = "DRAFT";

        [POST("SendCSSBatchVerification")]
        [ActionName("SendCSSBatchVerification")]
        [HttpPost]
        public IHttpActionResult SendCSSBatchVerification(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();

            CSS_BATCHES batch = JsonConvert.DeserializeObject<CSS_BATCHES>(json);
            string Period = GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR);
            List<CSS_BATCH_CUSTOMERS> batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batch.ID && t.STATUS == "CREATED" && t.ISACTIVE).ToList();
            batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerVerified = batchCustomers.Any(x => x.IS_VERIFIED);
            if (hasAnyCustomerVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are some verified customer contacts in the selected list. " +
                    "Please remove those customer contacts before sending Verification mails.");
            }
            List<CSS_BATCH_CUSTOMERS_EXTENDED> batchCustomersExt = helper.FillCustomerAndProjectNames(batchCustomers);

            foreach (var cust in batchCustomersExt)
            {
                try
                {
                    SendCSSVerificationMail(cust.CUST_ID, cust.PROJ_ID, cust.DISPLAY_NAME, cust.PROD_ID, cust.EMAIL_ID, cust.CUST_NM, cust.ID, cust.BATCH_ID, "css", batch.FREQUENCY, Period);
                }
                catch (Exception ex)
                {
                    LogRequest(ex, $"CSS : {cust.ID}: {cust.PROJ_ID}:");
                }
            }
            return Ok();
        }

        [POST("SendCSSBatchVerificationForPremier")]
        [ActionName("SendCSSBatchVerificationForPremier")]
        [HttpPost]
        public IHttpActionResult SendCSSBatchVerificationForPremier(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();

            CSS_BATCH_MONTHLY batch = JsonConvert.DeserializeObject<CSS_BATCH_MONTHLY>(json);
            string Period = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batch.ID && t.STATUS == "CREATED" && t.ISACTIVE).ToList();
            batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerVerified = batchCustomers.Any(x => x.IS_VERIFIED);
            if (hasAnyCustomerVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are some verified customer contacts in the selected list. " +
                    "Please remove those customer contacts before sending Verification mails.");
            }
            var batchCustomersExt = helper.FillCustomerAndProjectNames(batchCustomers);

            foreach (var cust in batchCustomersExt)
            {
                try
                {
                    SendCSSVerificationMail(cust.CUST_ID, cust.PROJ_ID, cust.DISPLAY_NAME, cust.PROD_ID, cust.EMAIL_ID, cust.CUST_NM, cust.ID, cust.BATCH_MONTHLY_ID, "cssmonthly", "Quarter", Period);
                }
                catch (Exception ex)
                {
                    LogRequest(ex, $"CSS : {cust.ID}: {cust.PROJ_ID}:");
                }
            }
            return Ok();
        }

        private void SendCSSVerificationMail(string customerId, string projectId, string customerName, int? productId, string mailId, string accountName, int id, int batchId, string url, string frequency, string Period)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;
            string toMail = "";
            string ccMail = "";
            string csmName = string.Empty;
            string projectName = string.Empty;
            PROJECT project = null;

            if (!string.IsNullOrWhiteSpace(projectId))
            {
                project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
            }

            if (productId.HasValue)
            {
                var productName = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productId && x.ISACTIVE)?.PRODUCT_TITLE;
                projectName = $"{productName} (Product)";
                toMail = string.Join(",", helper.GetCSMMailsFromAccount(customerId));
                ccMail = string.Join(",", helper.GetCCEmailIDsForPremier(mailId, ""));
                csmName = "Team";
            }
            else if (project != null)
            {
                projectName = project.PROJ_NM;
                var csmlist = helper.GetCSMFromProject(project);
                toMail = string.Join(",", csmlist.Select(x => x.EMAIL_ID));
                csmName = string.Join(",", csmlist.Select(x => x.FRST_NM));

                List<string> cclist = new List<string>();
                cclist = helper.GetPMFromProject(project);
                var qualitySpoc = helper.GetQualitySpocMailForProject(project);
                if (!string.IsNullOrWhiteSpace(qualitySpoc))
                    cclist.Add(qualitySpoc);

                ccMail = string.Join(",", cclist);
            }
            else
            {
                toMail = string.Join(",", helper.GetCSMMailsFromAccount(customerId));
                ccMail = string.Join(",", helper.GetQualitySPOCMailsFromAccount(customerId));
                csmName = "Team";
            }

            if (frequency == "Quarterly")
                frequency = "Quarter";

            subject = $"CSS Customer Contact Verification - {accountName} - {customerName} - Review and update the Customer Contact details, Customer Satisfaction Survey email will be sent to all customers soon";

            var mainUrl = $"{helper.GetAbsoulteUri()}/{url}/{batchId}/{id}/";
            string approveUrl = mainUrl + "1";
            string rejectUrl = mainUrl + "0";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("MAIL_TRIGGER_DATE", GetSecondWorkingDay());
            EmailContentValues.Add("CSM_NAME", csmName);
            EmailContentValues.Add("FREQUENCY", frequency);
            EmailContentValues.Add("PERIOD", Period);
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            EmailContentValues.Add("EMAIL_ID", mailId);
            EmailContentValues.Add("ACCOUNT_NAME", accountName);
            EmailContentValues.Add("PROJECT_NAME", projectName);
            EmailContentValues.Add("PROJECT_STATUS", project != null && project.PROJ_STATUS != null ? project.PROJ_STATUS : "");
            EmailContentValues.Add("APPROVE", approveUrl);
            EmailContentValues.Add("REJECT", rejectUrl);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveyVerification.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.CSS_BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projectId },
                this.Request
                );

        }

        private string GetSecondWorkingDay()
        {
            DateTime dt = DateTime.Now.AddDays(2);
            while (dt.DayOfWeek == DayOfWeek.Saturday || dt.DayOfWeek == DayOfWeek.Sunday)
                dt = dt.AddDays(1);
            return string.Format("{0:dd}{1} {0:MMMM yyyy}", dt, GetDateSuffix(dt));
        }

        public string GetDateSuffix(DateTime date)
        {
            string ordinal;
            switch (date.Day)
            {
                case 1:
                case 21:
                case 31:
                    ordinal = "st";
                    break;

                case 2:
                case 22:
                    ordinal = "nd";
                    break;

                case 3:
                case 23:
                    ordinal = "rd";
                    break;

                default:
                    ordinal = "th";
                    break;
            }

            return ordinal;
        }


        [POST("SendCSSBatchSurveyMails")]
        [ActionName("SendCSSBatchSurveyMails")]
        [HttpPost]
        public IHttpActionResult SendCSSBatchSurveyMails(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            string EmpId = GetHeaderDetails_String("empid");
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();
            CSS_BATCHES batchjson = JsonConvert.DeserializeObject<CSS_BATCHES>(json);
            var batch = CSPdb.CSS_BATCHES.GetById(batchjson.ID);
            var validationResult = ValidateBatch(batch);
            if (!string.IsNullOrWhiteSpace(validationResult))
                return BadRequest(validationResult);
            List<CSS_BATCH_CUSTOMERS> batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batch.ID && t.STATUS == "CREATED" && t.ISACTIVE == true).ToList();
            batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerNotVerified = batchCustomers.Any(x => !x.IS_VERIFIED);
            if (hasAnyCustomerNotVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are unverified customer contacts in the selected list. " +
                    "Please verify all customer contacts with respective CSM before sending the Survey.");
            }
            batchCustomers = batchCustomers.Where(x => x.IS_VERIFIED).ToList();
            List<CSS_BATCH_CUSTOMERS_EXTENDED> batchCustomersExt = helper.FillCustomerAndProjectNames(batchCustomers);

            List<CSS_SURVEY_ITERATION> CreatedSurveys = new List<CSS_SURVEY_ITERATION>();
            //check if we are past date if not return error

            foreach (CSS_BATCH_CUSTOMERS_EXTENDED cust in batchCustomersExt)
            {
                //CSS_SURVEY_ITERATION survey = new CSS_SURVEY_ITERATION()
                //{
                //    BATCH_CUSTOMERS_ID = cust.ID,
                //    BATCH_CUSTOMER_MONTHLY_ID = 0,
                //    SURVEY_ID = Guid.NewGuid().ToString(),
                //    SURVEY_SENT_DATE = DateTime.Now,
                //    STATUS = CSS_MAIL_SENT,

                //};
                //UpdateAuditFields(survey);
                //CSPdb.CSS_SURVEY_ITERATION.Add(survey);
                //CSPdb.Commit(CanCommit);
                var survey = AddSurvey(EmpId, cust.ID, 0, cust.CUST_ID);
                CreatedSurveys.Add(survey);
                var questionmodel = helper.GetQuestionModel(cust.CUST_ID, cust.PROJ_ID, false, batch.START_DATE, batch.END_DATE, cust.EMAIL_ID, batch.ID, batch.FREQUENCY, batch.CATEGORY);
                CSPdb.AppRepo.UpdateCSSBatchCustomers(cust.ID, survey.ID, survey.SURVEY_SENT_DATE, null, survey.STATUS, null, null, null, questionmodel);

            }
            string baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
            foreach (var cust in batchCustomersExt)
            {
                string SurveyId = CreatedSurveys.FirstOrDefault(t => t.BATCH_CUSTOMERS_ID == cust.ID).SURVEY_ID;
                string SurveyLink = baseUrl + "/CustomerSuccessSurvey/" + SurveyId;
                SendCSSSurveyMail(cust, SurveyLink, batch, GetCurrentPeriodStringNew(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR), GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR));
            }
            if (batch.STATUS.ToUpper() == "CREATED")
            {
                batch.STATUS = "SURVEY SENT";
                CSPdb.CSS_BATCHES.Update(batch);
                CSPdb.Commit();
            }
            return Ok();
        }

        private void SendCSSSurveyMail(CSS_BATCH_CUSTOMERS_EXTENDED cust, string SurveyLink, CSS_BATCHES batch, string CurrentPeriod, string PreviousPeriod)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;
            string tomail = cust.EMAIL_ID;
            string ccmail = string.Empty; //helper.GetDBConfig("CSS_LINK_CC", cust.CUST_ID);

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == cust.PROJ_ID);
            var projectText = string.Empty;
            if (cust.PROD_ID.HasValue)
            {
                var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == cust.PROD_ID);
                if (product == null) return; //throw err
                projectText = product.PRODUCT_TITLE;
            }
            else if (project == null)
            {
                if (string.IsNullOrWhiteSpace(cust.PROJ_ID))
                {
                    projectText = cust.PROJ_NM;
                    project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.CUST_ID == cust.CUST_ID && x.PROJ_STATUS.ToLower() != "close");
                    if (project == null) return;
                }
                else
                {
                    var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID.ToString() == cust.PROJ_ID);
                    if (portfolio == null) return;
                    var projectId = CSPdb.PORTFOLIO_PROJECT.GetAll().FirstOrDefault(x => x.PORTFOLIO_ID.ToString() == cust.PROJ_ID)?.PROJ_ID;
                    if (string.IsNullOrWhiteSpace(projectId)) return;
                    project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
                    projectText = "portfolio " + cust.PROJ_NM;
                }
            }
            else
            {
                projectText = cust.PROJ_NM;
            }

            string csmMails = helper.GetCSMMailsFromProject(project);
            //var pmMails = helper.GetPMFromProject(project).FirstOrDefault();
            var am = helper.GetAMFromProject(project);
            var pm = helper.GetPMMailsFromProject(project);
            var qualitySpoc = helper.GetQualitySpocMailForProject(project, false);


            subject = $"Neurealm {batch.FREQUENCY} Customer Satisfaction Survey for the period: " + PreviousPeriod;
            var additionlCC = helper.GetDBConfig("CSS_REQUEST_CC", cust.CUST_ID);
            if (!string.IsNullOrWhiteSpace(additionlCC))
                csmMails += "," + additionlCC;
            ccmail = helper.ConcatEmails(new List<string>() { csmMails, pm, qualitySpoc, cust.SPOC });
            string bcc = string.Empty;
            bcc = helper.GetDBConfig("CSS_BCC", "-1");
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();

            var templateFile = "CustomerSuccessSurveySurveyRequest.htm";
            var period = $"{batch.START_DATE.ToString("MMM-yyyy")} to {batch.END_DATE.ToString("MMM-yyyy") }";
            if (batch.FREQUENCY.ToLower() == "halfyearly" || batch.FREQUENCY.ToLower() == "half-yearly")
            {
                string projectList = string.Empty;

                //var projIds = helper.GetProjIdsForProduct(cust.PROD_ID);
                //var projects = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID)).Select(x => x.PROJ_NM).OrderBy(x => x).ToList();
                //EmailContentValues.Add("PROJECTLIST", string.Join(",", projects));
                //subject = $"Half yearly Pulse Survey for {cust.CUST_NM} | {projectText}, Feedback period {period}";

                templateFile = project?.BUSINESS_UNIT.ToLower() == "sead" ? "CustomerSuccessSurveyRequestIGN.htm" : "CustomerSuccessSurveySurveyRequestHalfYearly.htm";

                if (project?.BUSINESS_UNIT != null && project.BUSINESS_UNIT.ToLower() == "sead")
                {                    
                    var ignccMail = string.Join(", ", helper.GetDBConfig("CSS_CC_LIST_SEAD", "-1"));
                    if (!string.IsNullOrWhiteSpace(ignccMail))
                    {
                        var allccList = (ccmail + "," + ignccMail).Split(',').Select(e => e.Trim()).Where(e => !string.IsNullOrWhiteSpace(e)).Distinct(StringComparer.OrdinalIgnoreCase);
                        ccmail = string.Join(",", allccList);
                    }
                    subject = $" Ignitarium (A Neurealm Company) {batch.FREQUENCY} Customer Satisfaction Survey for the period: " + PreviousPeriod;
                }
                else 
                {
                    subject = $"Neurealm {batch.FREQUENCY} Customer Satisfaction Survey for the period: " + PreviousPeriod;
                }
              
            }
            else if (batch.FREQUENCY == "Annual")
            {
                templateFile = "CustomerSuccessSurveySurveyRequestAnnual.htm";

                //subject = $"Neurealm {batch.FREQUENCY} Customer Satisfaction Survey for the Account {projectText}";
                subject = $"Neurealm {batch.FREQUENCY} Customer Satisfaction Survey {batch.YEAR}";
            }

            string baseImageUrl = ConfigurationManager.AppSettings["BaseImageUrl"];
            EmailContentValues.Add("CUSTOMER", cust.DISPLAY_NAME);
            // EmailContentValues.Add("FREQUENCY", batch.Frequency.Substring(0, Frequency.Length - 2));
            EmailContentValues.Add("CURRENT_PERIOD", CurrentPeriod);
            EmailContentValues.Add("PREVIOUS_PERIOD", PreviousPeriod);
            EmailContentValues.Add("PERIOD", period);
            EmailContentValues.Add("SURVEY_LINK", SurveyLink);
            EmailContentValues.Add("ACCOUNT_NAME", cust.CUST_NM);
            EmailContentValues.Add("PROJECT_NAME", projectText);
            EmailContentValues.Add("FREQUENCY", batch.FREQUENCY);
            EmailContentValues.Add("YEAR", batch.YEAR.ToString());
            EmailContentValues.Add("BASE_URL", baseImageUrl);
            //if (batch.FREQUENCY.ToLower() == "annual")
            //{
            var batchValidityDate = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batch.ID).CSS_VALIDITY_ENDDATE;
            EmailContentValues.Add("END_DATE", batchValidityDate?.ToString("dd-MMM-yyyy"));
            //}
            //else
            //{
            //    EmailContentValues.Add("END_DATE", helper.GetLaterDateTextForCSSValidity(DateTime.Today, cust.CUST_ID));
            //}


            mailContent = helper.GetEmailContent(templateFile, EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, bcc = bcc, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = cust.PROJ_ID }
                , Request
                );
        }

        private void SendCSSSurveyMailMonthly(CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED cust, string surveyLink, string currentPeriod, string prefix = "")
        {
            var subject = string.Empty;
            var statusMsg = string.Empty;
            var mailContent = string.Empty;
            var tomail = cust.EMAIL_ID;
            var ccmail = string.Empty;

            bool sendCCmail = bool.Parse(helper.GetDBConfig("CSS_LINK_CC_ENABLE", "-1"));
            var ccList = new List<string>();

            var projectText = string.Empty;
            ccList.Add(helper.GetDBConfig("CUSTOMER_SUCCESS_SURVEY_REQUEST_CC", cust.CUST_ID));

            if (!string.IsNullOrWhiteSpace(cust.PROJ_ID))
            {
                var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == cust.PROJ_ID);

                if (project != null)
                {
                    projectText = project.PROJ_NM;
                    ccList.Add(helper.GetPMMailsFromProject(project));
                    ccList.Add(helper.GetQualitySpocMailForProject(project, false));
                    ccList.Add(helper.GetCSMMailsFromProject(project));
                }
            }
            else
            {
                ccList.AddRange(helper.GetCCEmailIDsForPremier(cust.EMAIL_ID, ""));
                ccList.AddRange(helper.GetCSMMailsFromAccount(cust.CUST_ID));
            }
            //var csmMails = helper.GetCSMMailsFromAccount(cust.CUST_ID);

            //var am = helper.GetAMMailsFromAccount(cust.CUST_ID);
            //var qualitySpoc = helper.GetQualitySPOCMailsFromAccount(cust.CUST_ID);
            ccmail = string.Join(",", ccList);
            var specStr = string.IsNullOrEmpty(cust.PROJ_NM) && string.IsNullOrEmpty(cust.PROD_NM) ? "Long 80" : (string.IsNullOrEmpty(cust.PROD_NM) ? cust.PROJ_NM : cust.PROD_NM);
            if (!string.IsNullOrWhiteSpace(projectText))
                subject = prefix + $"{specStr} - Customer Satisfaction Survey for the project {projectText} for the period of {currentPeriod}";
            else
                subject = prefix + $"{specStr} - Customer Satisfaction Survey for the period of {currentPeriod}";


            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER", cust.DISPLAY_NAME);
            EmailContentValues.Add("CURRENT_PERIOD", currentPeriod);
            EmailContentValues.Add("PREVIOUS_PERIOD", currentPeriod);
            EmailContentValues.Add("SURVEY_LINK", surveyLink);
            EmailContentValues.Add("END_DATE", helper.GetLaterDateTextForCSSValidity(DateTime.Today, cust.CUST_ID));
            mailContent = helper.GetEmailContent("CustomerSuccessSurveySurveyRequestMonthly.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = sendCCmail ? ccmail : string.Empty, bcc = Constants.CSS_BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = cust.PROJ_ID }
                , Request
                );
        }

        private string ValidateBatch(iBatch batch)
        {
            if (batch == null)
                return "Invalid Batch. Unable to trigger.";
            if (_isProd && batch != null && batch.END_DATE > DateTime.Today)
                return "CSS Period not ended yet. Could not trigger CSS.";
            if (batch.STATUS.ToLower() == "COMPLETED")
                return "CSS is closed. Could not trigger CSS.";

            return string.Empty;
        }


        [POST("SendCSSBatchReminderMails")]
        [ActionName("SendCSSBatchReminderMails")]
        [HttpPost]
        public IHttpActionResult SendCSSBatchReminderMails(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            string EmpId = GetHeaderDetails_String("empid");
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();
            CSS_BATCHES batch = JsonConvert.DeserializeObject<CSS_BATCHES>(json);
            var validationResult = ValidateBatch(batch);
            if (!string.IsNullOrWhiteSpace(validationResult))
                return BadRequest(validationResult);

            List<CSS_BATCH_CUSTOMERS> batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batch.ID && (t.STATUS == CSS_MAIL_SENT) && t.ISACTIVE).ToList();
            batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerNotVerified = batchCustomers.Any(x => !x.IS_VERIFIED);
            if (hasAnyCustomerNotVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are unverified customer contacts in the selected list. " +
                    "Please verify all customer contacts with respective CSM before sending the Survey.");
            }
            List<CSS_BATCH_CUSTOMERS_EXTENDED> batchCustomersExt = helper.FillCustomerAndProjectNames(batchCustomers);
            var configKey = "CSS_LINK_VALIDITY_DAYS";


            int validity = 20;

            var configValues = helper.GetDBConfig(configKey, "");
            int.TryParse(configValues, out validity);

            //List<CSS_SURVEY_ITERATION> CreatedSurveys = new List<CSS_SURVEY_ITERATION>();
            string baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            foreach (CSS_BATCH_CUSTOMERS_EXTENDED cust in batchCustomersExt)
            {
                if (skipRecords.Any(x => x.Proj_Id == cust.PROJ_ID)) continue;
                CSS_SURVEY_ITERATION oldSurvey = CSPdb.CSS_SURVEY_ITERATION.GetById(cust.SURVEY_ID.GetValueOrDefault());
                oldSurvey.STATUS = "CLOSED";
                CSPdb.CSS_SURVEY_ITERATION.Update(oldSurvey);

                var survey = new CSS_SURVEY_ITERATION()
                {
                    BATCH_CUSTOMERS_ID = cust.ID,
                    BATCH_CUSTOMER_MONTHLY_ID = 0,
                    SURVEY_ID = Guid.NewGuid().ToString(),
                    SURVEY_SENT_DATE = DateTime.Now,
                    STATUS = CSS_MAIL_RESENT,
                    VALIDITY_DAYS = validity,
                };
                UpdateAuditFields(survey);
                CSPdb.CSS_SURVEY_ITERATION.Add(survey);
                CSPdb.Commit(CanCommit);
                CSPdb.AppRepo.UpdateCSSBatchCustomers(cust.ID, survey.ID, survey.SURVEY_SENT_DATE, null, survey.STATUS, null, null, null, 0);
                string SurveyLink = baseUrl + "/CustomerSuccessSurvey/" + survey.SURVEY_ID;
                SendCSSSurveyReminderMail(cust, SurveyLink, batch.FREQUENCY, GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR), GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR), oldSurvey.CREATED_DATE.ToString("dd-MMM-yyy"));
            }

            return Ok();
        }

        [GET("SendCSSBatchReminderMailsPremier")]
        [ActionName("SendCSSBatchReminderMailsPremier")]
        [HttpGet]
        public IHttpActionResult SendCSSBatchReminderMailsPremier(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            string EmpId = GetHeaderDetails_String("empid");
            //var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();
            int batchid = 37;
            //var batch = CSPdb.CSS_BATCH_MONTHLY.GetById(batchid);
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchid && t.STATUS == CSS_MAIL_SENT && t.ISACTIVE).Take(5).ToList();
            // batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerNotVerified = batchCustomers.Any(x => !x.IS_VERIFIED);
            if (hasAnyCustomerNotVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are unverified customer contacts in the selected list. " +
                    "Please verify all customer contacts with respective CSM before sending the Survey.");
            }
            var batchCustomersExt = helper.FillCustomerAndProjectNames(batchCustomers);

            //List<CSS_SURVEY_ITERATION> CreatedSurveys = new List<CSS_SURVEY_ITERATION>();
            string baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            foreach (var cust in batchCustomersExt)
            {
                if (skipRecords.Any(x => x.Proj_Id == cust.PROJ_ID)) continue;
                CSS_SURVEY_ITERATION oldSurvey = CSPdb.CSS_SURVEY_ITERATION.GetById(cust.SURVEY_ID.GetValueOrDefault());
                oldSurvey.STATUS = CSS_MAIL_RESENT;
                UpdateAuditFields(oldSurvey);
                CSPdb.CSS_SURVEY_ITERATION.Update(oldSurvey);

                var ety = batchCustomers.Single(x => x.ID == cust.ID);
                ety.STATUS = CSS_MAIL_RESENT;
                UpdateAuditFields(ety);
                CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Update(ety);
                string SurveyLink = baseUrl + "/CustomerSuccessSurvey/" + oldSurvey.SURVEY_ID;
                SendCSSSurveyReminderMailMonthly(cust, SurveyLink, "Quarterly", GetCurrentPeriod("Quarterly"), GetPreviousPeriod("Quarterly"), oldSurvey.CREATED_DATE.ToString("dd-MMM-yyy"));
            }
            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [GET("GetCSSBatches")]
        [ActionName("GetCSSBatches")]
        [HttpGet]
        public IHttpActionResult GetCSSBatches(string csmId = "")
        {

            var batches = CSPdb.CSS_BATCHES.GetAll().OrderByDescending(t => t.ID).ToList();
            var batchIds = batches.Select(x => x.ID).ToList();
            List<iBatchCustomer> totalRecords = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && batchIds.Contains(x.BATCH_ID) && (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT || x.STATUS == CSS_COMPLETED || x.STATUS == CSS_CREATED || x.STATUS == CSS_DRAFT)).ToList<iBatchCustomer>();
            //if (totalRecords.Count == 0)
            //    totalRecords = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(x => x.ISACTIVE && batchIds.Contains(x.BATCH_MONTHLY_ID) && (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT || x.STATUS == CSS_COMPLETED || x.STATUS == CSS_CREATED)).ToList<iBatchCustomer>();

            var csmIdExists = !string.IsNullOrWhiteSpace(csmId);
            var projects = csmIdExists ? Cldb.PROJECT.GetAll().Where(x => x.PROJ_DM_EMP_ID == csmId).Select(x => x.PROJ_ID).ToList() : new List<string>();
            foreach (var item in batches)
            {

                var batchRecords = totalRecords.Where(x => x.BATCH_ID == item.ID).ToList();
                if (csmIdExists)
                {
                    batchRecords = batchRecords.Where(x => projects.Contains(x.PROJ_ID)).ToList();
                }

                item.TOTAL_RECORDS = batchRecords.Count;
                item.SURVEY_SENT = batchRecords.Count(x => (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT || x.STATUS == CSS_COMPLETED || x.STATUS == CSS_DRAFT));
                item.SURVEY_RECD = batchRecords.Count(x => x.STATUS == CSS_COMPLETED);
                item.PENDING = batchRecords.Count(x => x.STATUS == CSS_CREATED && !x.IS_VERIFIED && string.IsNullOrWhiteSpace(x.COMMENTS));
                item.VERIFIED = batchRecords.Count(x => x.IS_VERIFIED);
                item.REJECTED = batchRecords.Count(x => !x.IS_VERIFIED && !string.IsNullOrWhiteSpace(x.COMMENTS));

            }

            return Ok(batches);
        }


        private void SendCSSSurveyReminderMail(CSS_BATCH_CUSTOMERS_EXTENDED cust, string SurveyLink, string Frequency, string CurrentPeriod, string PreviousPeriod, String PreviousSurveyDate)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;
            string tomail = cust.EMAIL_ID;

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == cust.PROJ_ID);
            //if (project.PROJ_STATUS != null && (project.PROJ_STATUS.ToUpper() == "CLOSE" || project.PROJ_STATUS.Trim().ToUpper() == "COMPLETE"))
            //    return;
            //var skipCSATSetting = getprojectconfi("SKIP_CSAT",pro);
            var projectText = string.Empty;
            if (cust.PROD_ID.HasValue)
            {
                var product = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == cust.PROD_ID);
                if (product == null) return; //throw err
                projectText = product.PRODUCT_TITLE;
            }
            else if (project == null)
            {
                if (string.IsNullOrWhiteSpace(cust.PROJ_ID))
                {
                    project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.CUST_ID == cust.CUST_ID && x.PROJ_STATUS.ToLower() != "close");
                    if (project == null) return;
                }
                else
                {
                    var portfolio = CSPdb.PORTFOLIO.GetAll().FirstOrDefault(x => x.ID.ToString() == cust.PROJ_ID);
                    if (portfolio == null) return;
                    var projectId = CSPdb.PORTFOLIO_PROJECT.GetAll().FirstOrDefault(x => x.PORTFOLIO_ID.ToString() == cust.PROJ_ID)?.PROJ_ID;
                    if (string.IsNullOrWhiteSpace(projectId)) return;
                    project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
                    projectText = cust.PROJ_NM;
                }
            }
            else
            {
                projectText = cust.PROJ_NM;
            }

            string ccmail = helper.GetDBConfig("CSS_LINK_CC", "-1");
            var cclist = helper.getProjectResposnibleMailIds(project, true, true, true);
            cclist.Add(ccmail);
            var templateFile = string.Empty;
            if (Frequency.ToLower() == "annual")
            {
                templateFile = "CustomerSuccessSurveySurveyReminderAnnual.htm";
                subject = " A Friendly Reminder - Neurealm " + Frequency + " Yearly Customer Satisfaction Survey " + PreviousPeriod;
            }
            else
            {
                templateFile = "CustomerSuccessSurveySurveyReminder.htm";
                subject = " A Friendly Reminder - Neurealm " + Frequency + " Customer Satisfaction Survey for the period: " + PreviousPeriod;
            }

            ccmail = helper.ConcatEmails(cclist);
            if (!string.IsNullOrWhiteSpace(cust.SPOC))
                ccmail += "," + cust.SPOC;
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER", cust.DISPLAY_NAME);
            EmailContentValues.Add("PREVIOUS_SURVEY_DATE", PreviousSurveyDate);
            EmailContentValues.Add("FREQUENCY", Frequency);
            EmailContentValues.Add("CURRENT_PERIOD", CurrentPeriod);
            EmailContentValues.Add("PREVIOUS_PERIOD", PreviousPeriod);
            EmailContentValues.Add("SURVEY_LINK", SurveyLink);
            EmailContentValues.Add("CUSTOMER_NAME", cust.CUST_NM);
            EmailContentValues.Add("PROJECT", projectText);
            var batchValidityDate = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == cust.BATCH_ID).CSS_VALIDITY_ENDDATE;
            EmailContentValues.Add("END_DATE", batchValidityDate?.ToString("dd-MMM-yyyy"));
            string baseImageUrl = ConfigurationManager.AppSettings["BaseImageUrl"];
            EmailContentValues.Add("BASE_URL", baseImageUrl);
            //EmailContentValues.Add("END_DATE", helper.GetLaterDateTextForCSSValidity(cust.SURVEY_SENT_DATE.Value, cust.CUST_ID));
            mailContent = helper.GetEmailContent(templateFile, EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, bcc = Constants.CSS_BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = cust.PROJ_ID }
                , Request
                );

        }

        private void SendCSSSurveyReminderMailMonthly(CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED cust, string SurveyLink, string Frequency, string CurrentPeriod, string PreviousPeriod, String PreviousSurveyDate)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;
            string tomail = cust.EMAIL_ID;
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == cust.PROJ_ID);


            var projectText = "";
            if (project == null)
            {

            }
            else
            {
                projectText = "for ";
                if (project.PROJ_STATUS != null && (project.PROJ_STATUS.ToUpper() == "CLOSE"))
                    return;
            }


            string ccmail = helper.GetDBConfig("CSS_LINK_CC", "-1");
            var cclist = helper.getProjectResposnibleMailIds(project, true, true, true);
            cclist.Add(ccmail);

            subject = Frequency + " Customer Satisfaction Survey " + projectText + " " + cust.PROJ_NM + " for the period of " + PreviousPeriod;
            ccmail = helper.ConcatEmails(cclist);

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CUSTOMER", cust.DISPLAY_NAME);
            EmailContentValues.Add("PREVIOUS_SURVEY_DATE", PreviousSurveyDate);
            EmailContentValues.Add("FREQUENCY", Frequency);
            EmailContentValues.Add("CURRENT_PERIOD", CurrentPeriod);
            EmailContentValues.Add("PREVIOUS_PERIOD", PreviousPeriod);
            EmailContentValues.Add("SURVEY_LINK", SurveyLink);

            mailContent = helper.GetEmailContent("CustomerSuccessSurveySurveyReminder.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = tomail, cc = ccmail, bcc = Constants.CSS_BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = cust.PROJ_ID }
                , Request
                );

        }
        private Tuple<DateTime, DateTime> QuarterDates(int quarter, int year)
        {
            DateTime periodstDate = DateTime.Today;
            DateTime periodedDate = DateTime.Today;

            if (quarter == 1)
            {
                periodstDate = new DateTime(year, 4, 1);
                periodedDate = new DateTime(year, 6, 30);
            }
            else if (quarter == 2)
            {
                periodstDate = new DateTime(year, 7, 1);
                periodedDate = new DateTime(year, 9, 30);
            }
            else if (quarter == 3)
            {
                periodstDate = new DateTime(year, 10, 1);
                periodedDate = new DateTime(year, 12, 31);
            }
            else if (quarter == 4)
            {
                year += 1;
                periodstDate = new DateTime(year, 1, 1);
                periodedDate = new DateTime(year, 3, 31);
            }
            else if (quarter == 5)
            {

                periodstDate = new DateTime(year, 1, 1);
                periodedDate = new DateTime(year, 6, 30);
            }
            else if (quarter == 6)
            {

                periodstDate = new DateTime(year, 7, 1);
                periodedDate = new DateTime(year, 12, 31);
            }
            else { }

            return new Tuple<DateTime, DateTime>(periodstDate, periodedDate);

        }

        [POST("AddCSSBatch")]
        [ActionName("AddCSSBatch")]
        [HttpPost]
        public IHttpActionResult AddCSSBatch([FromBody] CSS_BATCHES css_batch)
        {
            LogRequest(prefix: "AddCSSBatch", content: JsonConvert.SerializeObject(css_batch));
            if (css_batch == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            else
            {
                var quarterlyDates = QuarterDates(css_batch.SEQUENCE, css_batch.YEAR);
                css_batch.START_DATE = quarterlyDates.Item1;
                css_batch.END_DATE = quarterlyDates.Item2;
                var isStartDateExists = CSPdb.CSS_BATCHES.GetAll().Any(batch => batch.START_DATE == css_batch.START_DATE);

                var currentDate = DateTime.Now;

                if (isStartDateExists)
                {
                    return Content(HttpStatusCode.Conflict, "Entered period already exists in table");
                }
                else if (currentDate < css_batch.START_DATE)
                {
                    return Content(HttpStatusCode.Conflict, "Cannot enter for future period");
                }
                else
                {

                    css_batch.FREQUENCY = "Quarterly";
                    css_batch.STATUS = "CREATED";
                    UpdateAuditFields(css_batch);
                    CSPdb.CSS_BATCHES.Add(css_batch);
                    CSPdb.Commit(CanCommit);
                    return Ok();
                }
            }
        }

        [GET("GetCSSBatchCustomers")]
        [ActionName("GetCSSBatchCustomers")]
        [HttpGet]
        public IHttpActionResult GetCSSBatchCustomers(int BatchId)
        {

            List<CSS_BATCH_CUSTOMERS> batches = new List<CSS_BATCH_CUSTOMERS>();
            List<CSS_BATCH_CUSTOMERS_EXTENDED> batchesExt = new List<CSS_BATCH_CUSTOMERS_EXTENDED>();
            string empid = this.GetHeaderValue("empid");
            var batch = CSPdb.CSS_BATCHES.GetById(BatchId);
            batches = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == BatchId && t.ISACTIVE).ToList();
            if (batches.Count == 0)
            {
                if (batch.CATEGORY.ToLower() == "project")
                    GenerateBatchCustomers(BatchId, batch.FREQUENCY, empid);
                else if (batch.CATEGORY.ToLower() == "account")
                    GenerateBatchCustomersAccount(BatchId, batch.FREQUENCY, empid);
                else if (batch.FREQUENCY.ToLower() == "pulse")
                    GenerateBatchCustomersHalfyearly(BatchId, empid);

                batches = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == BatchId && t.ISACTIVE).ToList();
            }

            batchesExt = helper.FillCustomerAndProjectNames(batches);
            var emailIds = batchesExt.Select(b => b.EMAIL_ID).ToList();
            var contactsList = CSPdb.CONTACTS.GetAll()
                  .Where(x => emailIds.Contains(x.CONTACT_EMAILID))
                  .ToList();

            foreach (var b in batchesExt)
            {
                var matchingContact = contactsList
                                      .FirstOrDefault(contact => contact.CONTACT_EMAILID == b.EMAIL_ID);

                if (matchingContact != null)
                {
                    b.CONTACT_ROLE = matchingContact.CONTACT_ROLE;
                }
            }

            var sortedbatchesExt = batchesExt.OrderBy(x => x.DISPLAY_NAME.Trim()).ToList();

            return Ok(sortedbatchesExt);
        }
        [POST("UpdateCssLinkValidity")]
        [ActionName("UpdateCssLinkValidity")]
        [HttpPost]
        public IHttpActionResult UpdateCssLinkValidity(int batchId, string type)
        {
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => int.Parse(x)).ToList();
            var surveyIterations = new List<CSS_SURVEY_ITERATION>();
            if (type == "batch")
            {
                var batches = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == batchId && t.ISACTIVE).ToList();
                var batchCustomers = batches.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
                var invalidBatches = batchCustomers.Where(t => t.STATUS != CSS_MAIL_SENT && t.STATUS != CSS_MAIL_RESENT).ToList();

                if (invalidBatches.Any())
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, "Please select customer(s) with Mail sent or Mail Re-sent Status"));
                }
                surveyIterations = CSPdb.CSS_SURVEY_ITERATION.GetAll().Where(x => selectedIds.Any(a => x.BATCH_CUSTOMERS_ID == a) && (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT) && x.ISACTIVE).ToList();

                foreach (var b in batchCustomers)
                {
                    b.SURVEY_SENT_DATE = DateTime.Now;
                    UpdateAuditFields(b);
                    CSPdb.CSS_BATCH_CUSTOMERS.Update(b);
                }
            }
            else if (type == "batchmonthly")
            {
                var batches = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId && (t.STATUS == CSS_MAIL_SENT || t.STATUS == CSS_MAIL_RESENT)).ToList();
                var batchCustomersMonthly = batches.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
                var invalidBatches = batchCustomersMonthly.Where(t => t.STATUS != CSS_MAIL_SENT && t.STATUS != CSS_MAIL_RESENT).ToList();
                if (invalidBatches.Any())
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, "Please select customer(s) with Mail sent or Mail Re-sent Status"));
                }
                surveyIterations = CSPdb.CSS_SURVEY_ITERATION.GetAll().Where(x => selectedIds.Any(a => x.BATCH_CUSTOMER_MONTHLY_ID == a) && (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT) && x.ISACTIVE).ToList();
                foreach (var b in batchCustomersMonthly)
                {
                    b.SURVEY_SENT_DATE = DateTime.Now;
                    UpdateAuditFields(b);
                    CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Update(b);
                }
            }
            foreach (var s in surveyIterations)
            {
                s.SURVEY_SENT_DATE = DateTime.Now;
                UpdateAuditFields(s);
                CSPdb.CSS_SURVEY_ITERATION.Update(s);
            }

            CSPdb.Commit(CanCommit);
            return Ok();
        }

        [GET("RefreshCSSBatchCustomers")]
        [ActionName("RefreshCSSBatchCustomers")]
        [HttpGet]
        public IHttpActionResult RefreshCSSBatchCustomers(int BatchId)
        {
            string empid = this.GetHeaderValue("empid");
            CSS_BATCHES batch = CSPdb.CSS_BATCHES.GetById(BatchId);
            if (batch.STATUS != "CREATED")
                return Content(HttpStatusCode.Conflict, "Cannot recreate list, Mails are already triggered to customers");
            List<CSS_BATCH_CUSTOMERS> batches = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(t => t.BATCH_ID == BatchId).ToList();
            if (empid != "102802") return Ok();
            CSPdb.CSS_BATCH_CUSTOMERS.DeleteList(batches);
            CSPdb.Commit(CanCommit);
            if (batch.CATEGORY.ToLower() == "project")
                GenerateBatchCustomers(BatchId, batch.FREQUENCY, empid);
            else if (batch.CATEGORY.ToLower() == "account")
                GenerateBatchCustomersAccount(BatchId, batch.FREQUENCY, empid);
            else if (batch.FREQUENCY.ToLower() == "pulse")
                GenerateBatchCustomersHalfyearly(BatchId, empid);


            List<CSS_BATCH_CUSTOMERS_EXTENDED> batchesExt = new List<CSS_BATCH_CUSTOMERS_EXTENDED>();
            batchesExt = helper.FillCustomerAndProjectNames(batches);
            return Ok(batchesExt);
        }

        [GET("GenerateMissingCustomerContacts")]
        [ActionName("GenerateMissingCustomerContacts")]
        [HttpGet]
        public IHttpActionResult GenerateMissingCustomerContacts(int batchId)
        {
            string empid = this.GetHeaderValue("empid");
            var batch = CSPdb.CSS_BATCHES.GetById(batchId);
            GenerateMissingBatchCustomers(batchId, batch.FREQUENCY, empid, batch.CATEGORY);
            return Ok();
        }

        [GET("GenerateMissingCustomerContactsPremier")]
        [ActionName("GenerateMissingCustomerContactsPremier")]
        [HttpGet]
        public IHttpActionResult GenerateMissingCustomerContactsPremier(int batchId)
        {
            string empid = this.GetHeaderValue("empid");

            GenerateMissingBatchCustomersPremier(batchId, "Quarterly", empid);
            return Ok();
        }

        [GET("GetCSSSurveyQuestionsMonthly")]
        [ActionName("GetCSSSurveyQuestionsMonthly")]
        [HttpGet]
        public IHttpActionResult GetCSSSurveyQuestionsMonthly(string code)
        {
            //Get survery Iteration Id
            var Iteration = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.SURVEY_ID == code);

            //Get BatchCustomer
            var batchCust = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(t => t.ID == Iteration.BATCH_CUSTOMER_MONTHLY_ID && t.ISACTIVE);
            var batchesExt = helper.FillCustomerAndProjectNames(batchCust);

            //Get Question mode based on project
            // By default - 1
            List<CSS_QUESTION_MASTER> questions = new List<CSS_QUESTION_MASTER>();
            //Logic needs to be correct to get latest questions.
            questions = CSPdb.CSS_QUESTION_MASTER.GetAll().Where(t => t.MODEL_ID == 1 && t.EFFECTIVE_FROM <= DateTime.Now && t.ISACTIVE == true).ToList();

            BatchCustomerAndQuestions batchCustomerAndQuestions = new BatchCustomerAndQuestions();
            batchCustomerAndQuestions.CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED = batchesExt;
            batchCustomerAndQuestions.CSS_QUESTION_MASTER = questions;

            return Ok(batchCustomerAndQuestions);
        }

        [GET("GetCSSSurveyQuestions")]
        [ActionName("GetCSSSurveyQuestions")]
        [HttpGet]
        public IHttpActionResult GetCSSSurveyQuestions(string code)
        {
            //Get survery Iteration Id
            CSS_SURVEY_ITERATION Iteration = CSPdb.CSS_SURVEY_ITERATION.GetAll().FirstOrDefault(t => t.SURVEY_ID == code);

            //Get BatchCustomer
            CSS_BATCH_CUSTOMERS batchCust = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(t => t.ID == Iteration.BATCH_CUSTOMERS_ID && t.ISACTIVE == true);
            CSS_BATCH_CUSTOMERS_EXTENDED batchesExt = helper.FillCustomerAndProjectNames(batchCust);

            //Get Question mode based on project
            // By default - 1
            List<CSS_QUESTION_MASTER> questions = new List<CSS_QUESTION_MASTER>();
            //Logic needs to be correct to get latest questions.
            questions = CSPdb.CSS_QUESTION_MASTER.GetAll().Where(t => t.MODEL_ID == 1 && t.EFFECTIVE_FROM <= DateTime.Now && t.ISACTIVE == true).ToList();

            BatchCustomerAndQuestions batchCustomerAndQuestions = new BatchCustomerAndQuestions();
            batchCustomerAndQuestions.CSS_BATCH_CUSTOMERS_EXTENDED = batchesExt;
            batchCustomerAndQuestions.CSS_QUESTION_MASTER = questions;

            return Ok(batchCustomerAndQuestions);
        }

        //monthly
        [GET("GetCSSBatchesMonthly")]
        [ActionName("GetCSSBatchesMonthly")]
        [HttpGet]
        public IHttpActionResult GetCSSBatchesMonthly()
        {
            var batches = CSPdb.CSS_BATCH_MONTHLY.GetAll().OrderByDescending(t => t.ID).ToList();
            var batchIds = batches.Select(x => x.ID).ToList();
            var totalRecords = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(x => x.ISACTIVE && batchIds.Contains(x.BATCH_MONTHLY_ID) && (x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT || x.STATUS == CSS_COMPLETED || x.STATUS == CSS_CREATED)).ToList();

            foreach (var item in batches)
            {
                var batchRecords = totalRecords.Where(x => x.BATCH_MONTHLY_ID == item.ID).ToList();

                item.TOTAL_RECORDS = batchRecords.Count;
                item.SURVEY_SENT = batchRecords.Count(x => x.STATUS == CSS_MAIL_SENT || x.STATUS == CSS_MAIL_RESENT || x.STATUS == CSS_COMPLETED);
                item.SURVEY_RECD = batchRecords.Count(x => x.STATUS == CSS_COMPLETED);
                item.PENDING = batchRecords.Count(x => x.STATUS == CSS_CREATED && !x.IS_VERIFIED && string.IsNullOrWhiteSpace(x.COMMENTS));
                item.VERIFIED = batchRecords.Count(x => x.IS_VERIFIED);
                item.REJECTED = batchRecords.Count(x => !x.IS_VERIFIED && !string.IsNullOrWhiteSpace(x.COMMENTS));
            }
            return Ok(batches);
        }
        [POST("AddCSSBatchesMonthly")]
        [ActionName("AddCSSBatchesMonthly")]
        [HttpPost]
        public IHttpActionResult AddCSSBatchesMonthly([FromBody] CSS_BATCH_MONTHLY css_batch_monthly)
        {
            LogRequest(prefix: "AddCSSBatchesMonthly", content: JsonConvert.SerializeObject(css_batch_monthly));
            if (css_batch_monthly == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            else
            {
                css_batch_monthly.START_DATE = new DateTime(css_batch_monthly.YEAR, css_batch_monthly.MONTH, 1);
                css_batch_monthly.END_DATE = css_batch_monthly.START_DATE.AddMonths(3).AddDays(-1);
                var currentDate = DateTime.Now;
                var isStartDateExists = CSPdb.CSS_BATCH_MONTHLY.GetAll().Any(batch => batch.START_DATE == css_batch_monthly.START_DATE);

                if (isStartDateExists)
                {
                    return Content(HttpStatusCode.Conflict, "Entered period already exists in table");
                }
                else if (currentDate < css_batch_monthly.START_DATE)
                {
                    return Content(HttpStatusCode.Conflict, "Cannot enter for future period");
                }
                else
                {
                    css_batch_monthly.STATUS = "CREATED";
                    UpdateAuditFields(css_batch_monthly);
                    CSPdb.CSS_BATCH_MONTHLY.Add(css_batch_monthly);
                    CSPdb.Commit(CanCommit);
                    return Ok();
                }
            }
        }
        [GET("GetCSSBatchCustomersMonthly")]
        [ActionName("GetCSSBatchCustomersMonthly")]
        [HttpGet]
        public IHttpActionResult GetCSSBatchCustomersMonthly(int batchId)
        {

            var batches = new List<CSS_BATCH_CUSTOMER_MONTHLY>();
            var batchesExt = new List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>();
            var empid = GetHeaderDetails_String("empid");
            var batch = CSPdb.CSS_BATCH_MONTHLY.GetById(batchId);
            batches = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId && t.ISACTIVE).ToList();
            if (batches.Count == 0)
            {
                GenerateBatchCustomersMonthly(batchId, empid);
                batches = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId && t.ISACTIVE).ToList();
            }

            batchesExt = FillCustomerAndProjectNames(batches);

            var surveyProjIds = batches.Where(x => x.PROJ_ID != null).Select(x => x.PROJ_ID);
            var surveyProdIds = batches.Where(x => x.PROD_ID != null).Select(x => x.PROD_ID);
            var surveyProds = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => surveyProdIds.Contains(x.ID)).ToList();
            var surveyProjs = Cldb.PROJECT.GetAll().Where(x => surveyProjIds.Contains(x.PROJ_ID)).ToList();

            var emailIds = batchesExt.Select(b => b.EMAIL_ID).ToList();
            var contactsList = CSPdb.CONTACTS.GetAll()
                  .Where(x => emailIds.Contains(x.CONTACT_EMAILID))
                  .ToList();

            foreach (CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED bacth in batchesExt)
            {
                if (bacth.PROD_ID != null)
                    bacth.PROD_NM = surveyProds.FirstOrDefault(x => x.ID == bacth.PROD_ID)?.PRODUCT_TITLE;
                if (bacth.PROJ_ID != null)
                    bacth.PROJ_NM = surveyProjs.FirstOrDefault(x => x.PROJ_ID == bacth.PROJ_ID)?.PROJ_NM;
                var matchingContact = contactsList
                                     .FirstOrDefault(contact => contact.CONTACT_EMAILID == bacth.EMAIL_ID);
                if (matchingContact != null)
                {
                    bacth.CONTACT_ROLE = matchingContact.CONTACT_ROLE;
                }
            }

            var sortedbatchesExt = batchesExt.OrderBy(x => x.DISPLAY_NAME.Trim()).ToList();

            return Ok(sortedbatchesExt);
        }

        [POST("CreateDuplicateBatchCustomer")]
        [ActionName("CreateDuplicateBatchCustomer")]
        [HttpPost]
        public IHttpActionResult CreateDuplicateBatchCustomer([FromBody] CSS_BATCH_CUSTOMERS_EXTENDED batchcustomer)
        {
            var batchMonthly = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchcustomer.BATCH_ID);
            var customerUser = CSPdb.CUSTOMER_USERS.GetAll().FirstOrDefault(x => x.EMAILID == batchcustomer.EMAIL_ID);

            var empId = GetHeaderDetails_String("empid");
            //perform valiadtions for retrived objs

            // add duplicate row
            AddBatchCustomer(batchMonthly, customerUser.EMAILID, customerUser.DISPLAY_NAME, empId, batchcustomer.CUST_ID, batchcustomer.PROJ_ID, batchcustomer.PROD_ID, batchcustomer.SPOC);
            return Ok();

        }

        [POST("CreateDuplicateBatchCustomerMonthly")]
        [ActionName("CreateDuplicateBatchCustomerMonthly")]
        [HttpPost]
        public IHttpActionResult CreateDuplicateBatchCustomerMonthly([FromBody] CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED batchcustomer)
        {

            var batchMonthly = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchcustomer.BATCH_ID);
            var customerUser = CSPdb.CUSTOMER_USERS.GetAll().FirstOrDefault(x => x.EMAILID == batchcustomer.EMAIL_ID);

            var empId = GetHeaderDetails_String("empid");
            //perform valiadtions for retrived objs

            // add duplicate row
            AddBatchCustomerMonthly(batchMonthly, customerUser, empId, batchcustomer.CUST_ID, batchcustomer.PROJ_ID, batchcustomer.PROD_ID);
            return Ok();

        }
        [GET("RefreshCSSBatchCustomersMonthly")]
        [ActionName("RefreshCSSBatchCustomersMonthly")]
        [HttpGet]
        public IHttpActionResult RefreshCSSBatchCustomersMonthly(int batchId)
        {
            LogRequest();
            string empid = GetHeaderDetails_String("empid");
            var batch = CSPdb.CSS_BATCH_MONTHLY.GetById(batchId);
            if (batch.STATUS != "CREATED")
                return Content(HttpStatusCode.Conflict, "Cannot recreate list, Mails are already triggered to customers");
            var batches = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batchId).ToList();
            CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.DeleteList(batches);
            CSPdb.Commit(CanCommit);
            GenerateBatchCustomersMonthly(batchId, empid);
            var batchesExt = new List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>();
            batchesExt = FillCustomerAndProjectNames(batches);
            return Ok(batchesExt);
        }



        [POST("SendCSSBatchSurveyMailsMonthly")]
        [ActionName("SendCSSBatchSurveyMailsMonthly")]
        [HttpPost]
        public IHttpActionResult SendCSSBatchSurveyMailsMonthly(HttpRequestMessage request)
        {

            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            string empId = GetHeaderDetails_String("empid");
            var selectedIds = GetHeaderDetails_Array("selectedIds").Select(x => Convert.ToInt32(x)).ToList();
            CSS_BATCH_MONTHLY batch = JsonConvert.DeserializeObject<CSS_BATCH_MONTHLY>(json);
            var validationResult = ValidateBatch(batch);
            if (!string.IsNullOrWhiteSpace(validationResult))
                return BadRequest(validationResult);
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batch.ID && t.STATUS == "CREATED" && t.ISACTIVE).ToList();
            batchCustomers = batchCustomers.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
            bool hasAnyCustomerNotVerified = batchCustomers.Any(x => !x.IS_VERIFIED);
            if (hasAnyCustomerNotVerified)
            {
                return Content(HttpStatusCode.Conflict, "There are unverified customer contacts in the selected list. " +
                    "Please verify all customer contacts with respective CSM before sending the Survey.");
            }
            batchCustomers = batchCustomers.Where(x => x.IS_VERIFIED).ToList();
            if (batchCustomers.Count > 0)
            {
                var batchCustomersExt = FillCustomerAndProjectNames(batchCustomers);
                string custId = batchCustomers.FirstOrDefault().CUST_ID;
                var custUsers = CSPdb.AppRepo.GetCustomerUsersList(custId);
                var prodResponsible = CSPdb.AppRepo.GetPortfolioProductResponsibleList(custId, 6); // 6=CUSTOMER_CSAT
                List<CSS_SURVEY_ITERATION> CreatedSurveys = new List<CSS_SURVEY_ITERATION>();
                foreach (var cust in batchCustomersExt)
                {
                    var survey = AddSurvey(empId, 0, cust.ID, custId);
                    CreatedSurveys.Add(survey);
                    CSPdb.AppRepo.UpdateCSSBatchCustomersMonthly(cust.ID, survey.ID, survey.SURVEY_SENT_DATE, null, survey.STATUS, null, null, null);
                }
                string baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
                foreach (var cust in batchCustomersExt)
                {
                    string SurveyId = CreatedSurveys.FirstOrDefault(t => t.BATCH_CUSTOMER_MONTHLY_ID == cust.ID).SURVEY_ID;
                    string SurveyLink = baseUrl + "/CustomerSuccessSurvey/" + SurveyId;
                    if (cust.PROD_ID != null)
                        cust.PROD_NM = prodResponsible.FirstOrDefault(x => x.PRODUCT_ID == cust.PROD_ID).PRODUCT_TITLE;
                    if (cust.PROJ_ID != null)
                        cust.PROJ_NM = custUsers.FirstOrDefault(x => x.PROJ_ID == cust.PROJ_ID).PROJ_NM;
                    SendCSSSurveyMailMonthly(cust, SurveyLink, GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR));
                }

                //resend part
                var batchCustomersSent = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(t => t.BATCH_MONTHLY_ID == batch.ID && t.STATUS == CSS_MAIL_SENT && t.ISACTIVE).ToList();
                batchCustomers = batchCustomersSent.Where(x => selectedIds.Any(a => x.ID == a)).ToList();
                var batchCustomersExtSent = FillCustomerAndProjectNames(batchCustomers);
                if (batch.STATUS.ToUpper() == "CREATED")
                {
                    batch.STATUS = "SURVEY SENT";
                    CSPdb.CSS_BATCH_MONTHLY.Update(batch);
                    CSPdb.Commit();
                }
            }
            else
            {
                return Content(HttpStatusCode.Conflict, "Survey already sent to the customer");
            }
            return Ok();
        }

        //monthly end

        private CSS_SURVEY_ITERATION AddSurvey(string empId, int batchCustId, int batchcustMonthlyId, string custId)

        {
            var configKey = "CSS_LINK_VALIDITY_DAYS";


            int validity = 20;

            var configValues = helper.GetDBConfig(configKey, custId);
            int.TryParse(configValues, out validity);


            CSS_SURVEY_ITERATION survey = new CSS_SURVEY_ITERATION()
            {
                BATCH_CUSTOMER_MONTHLY_ID = batchcustMonthlyId,
                BATCH_CUSTOMERS_ID = batchCustId,
                SURVEY_ID = Guid.NewGuid().ToString(),
                SURVEY_SENT_DATE = DateTime.Now,
                STATUS = CSS_MAIL_SENT,
                VALIDITY_DAYS = validity
            };
            UpdateAuditFields(survey, empId);
            CSPdb.CSS_SURVEY_ITERATION.Add(survey);
            CSPdb.Commit(CanCommit);
            return survey;
        }

        private List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED> FillCustomerAndProjectNames(IList<CSS_BATCH_CUSTOMER_MONTHLY> batches)
        {
            List<string> CustIds = batches.Select(t => t.CUST_ID).Distinct().ToList();
            List<string> ProjIds = batches.Select(t => t.PROJ_ID).Distinct().ToList();
            var UpdatedByList = batches.Select(t => t.UPDATED_BY).Distinct().ToList();
            var employeeInfoList = Cldb.EMP_INFO.GetAll().Where(t => UpdatedByList.Contains(t.EMP_ID)).ToList();
            List<CUSTOMER> custDetails = Cldb.CUSTOMER.GetAll().Where(t => CustIds.Contains(t.CUST_ID)).ToList();
            List<PROJECT> projDetails = Cldb.PROJECT.GetAll().Where(t => ProjIds.Contains(t.PROJ_ID)).ToList();
            //List<PORTFOLIO> portfolios = CSPdb.PORTFOLIO.GetAll().ToList();

            var ids = batches.Where(x => x.SURVEY_ID.HasValue).Select(x => x.SURVEY_ID.Value).ToList();
            var surveyItems = CSPdb.CSS_SURVEY_ITERATION.GetAll().Where(x => ids.Contains(x.ID)).ToList();

            var ext = new List<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>();
            foreach (var c in batches)
            {
                string s = JsonConvert.SerializeObject(c);
                var newExt = JsonConvert.DeserializeObject<CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED>(s);
                newExt.CUST_NM = custDetails.FirstOrDefault(t => t.CUST_ID == c.CUST_ID)?.CUST_NM;
                newExt.APPROVER = employeeInfoList.FirstOrDefault(t => t.EMP_ID == c.UPDATED_BY)?.FRST_NM;
                var surveyItem = surveyItems.FirstOrDefault(x => x.ID == c.SURVEY_ID);
                if (surveyItem != null)
                    newExt.URL = $"{helper.GetAbsoulteUri()}/CustomerSuccessSurvey/{surveyItem.SURVEY_ID}";
                // newExt.csm = helper.GetCSMNamesFromProject(projDetails.FirstOrDefault(x =>

                if (c.PROJ_ID != null)
                {
                    var proj = projDetails.FirstOrDefault(t => t.PROJ_ID == c.PROJ_ID.Trim());

                    if (proj != null)
                    {
                        newExt.PROJ_NM = proj.PROJ_NM;
                        newExt.PROJ_STATUS = proj.PROJ_STATUS;
                        newExt.CONTRACTING_UNIT = proj.CONTRACTING_UNIT;
                        newExt.REVENUE_TYPE = proj.REVENUE_TYPE;
                        newExt.BUSINESS_UNIT = proj.BUSINESS_UNIT;
                    }

                }


                // x.PROJ_ID == c.PROJ_ID));
                newExt.PROJ_ID = c.PROJ_ID;

                ext.Add(newExt);
            }
            ext = ext.OrderBy(x => x.CUST_NM).ThenBy(x => x.PROJ_NM).ToList();
            return ext;
        }

        private void GenerateBatchCustomersAccount(int batchId, string frequency, string empId)
        {

            var customersProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CSAT_SURVEY && t.CSAT_FREQUENCY == frequency && t.PROJ_ID == null).ToList();
            var CustomerId = customersProjects.Select(t => t.CUSTOMER_USER_ID).Distinct().ToList();
            var customers = CSPdb.CUSTOMER_USERS.GetAll().Where(t => CustomerId.Contains(t.ID)).ToList();
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchId);

            foreach (var c in customersProjects)
            {
                var cust = customers.FirstOrDefault(t => t.ID == c.CUSTOMER_USER_ID);
                if (cust != null)
                {
                    AddBatchCustomer(batch, cust.EMAILID, cust.DISPLAY_NAME, empId, c.CUST_ID, null, null, c.SPOC);
                }
            }
            CSPdb.Commit(CanCommit);
        }

        private void GenerateBatchCustomers(int BatchId, string Frequency, string EmpId)
        {

            List<CUSTOMER_PROJECTS> customersProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CSAT_SURVEY && t.CSAT_FREQUENCY == Frequency).ToList();
            List<int> CustomerId = customersProjects.Select(t => t.CUSTOMER_USER_ID).Distinct().ToList();
            List<CUSTOMER_USERS> customers = CSPdb.CUSTOMER_USERS.GetAll().Where(t => CustomerId.Contains(t.ID)).ToList();
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == BatchId);
            var projects = Cldb.PROJECT.GetAll().ToList();//change this

            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            foreach (CUSTOMER_PROJECTS c in customersProjects)
            {
                CUSTOMER_USERS cust = customers.FirstOrDefault(t => t.ID == c.CUSTOMER_USER_ID);
                var project = projects.FirstOrDefault(x => x.PROJ_ID == c.PROJ_ID);

                if (cust != null && project != null && project.START_DATE < batch.END_DATE && project.END_DATE > batch.START_DATE)
                {
                    if (!string.IsNullOrWhiteSpace(project.PROJ_STATUS) && (project.PROJ_STATUS.Trim().ToUpper() == "CLOSE")) continue;
                    if (skipRecords.Any(x => x.Proj_Id == project.PROJ_ID)) continue;
                    //skipping premier for first quarter of 2021. Remove the below code for next quarter onwards
                    //if (project.CUST_ID == PREMIER_CUSTOMER_ID) continue;
                    AddBatchCustomer(batch, cust.EMAILID, cust.DISPLAY_NAME, EmpId, c.CUST_ID, c.PROJ_ID, null, c.SPOC);

                }
            }
            CSPdb.Commit(CanCommit);

            //products

        }

        private void AddBatchCustomer(CSS_BATCHES batch, string emailId, string displayName, string empId, string cust_id, string proj_id, int? prod_id, string spoc)
        {
            var existing = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(x => x.CUST_ID == cust_id && x.PROJ_ID == proj_id && x.EMAIL_ID == emailId && x.BATCH_ID == batch.ID && x.ISACTIVE);
            if (existing != null) return;
            var batchCustomer = new CSS_BATCH_CUSTOMERS()
            {
                BATCH_ID = batch.ID,
                CUST_ID = cust_id,
                PROJ_ID = proj_id,
                QUESTION_MODEL_ID = helper.GetQuestionModel(cust_id, proj_id, false, batch.START_DATE, batch.END_DATE, emailId, batch.ID, batch.FREQUENCY, batch.CATEGORY),
                EMAIL_ID = emailId,
                DISPLAY_NAME = displayName,
                STATUS = "CREATED",
                PROD_ID = prod_id,
                CREATED_BY = empId,
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = empId,
                UPDATED_DATE = DateTime.Now,
                ISACTIVE = true,
                SPOC = spoc,
            };
            UpdateAuditFields(batchCustomer);
            CSPdb.CSS_BATCH_CUSTOMERS.Add(batchCustomer);
        }

        private void AddBatchCustomerAccount(CSS_BATCHES batch, string emailId, string displayName, string empId, string cust_id, string spoc)
        {
            var existing = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(x => x.CUST_ID == cust_id && x.EMAIL_ID == emailId && x.BATCH_ID == batch.ID && x.ISACTIVE);
            if (existing != null) return;
            var batchCustomer = new CSS_BATCH_CUSTOMERS()
            {
                BATCH_ID = batch.ID,
                CUST_ID = cust_id,

                QUESTION_MODEL_ID = 99,//should take from configuration
                EMAIL_ID = emailId,
                DISPLAY_NAME = displayName,
                STATUS = "CREATED",

                CREATED_BY = empId,
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = empId,
                UPDATED_DATE = DateTime.Now,
                ISACTIVE = true,
                SPOC = spoc,
            };
            UpdateAuditFields(batchCustomer);
            CSPdb.CSS_BATCH_CUSTOMERS.Add(batchCustomer);
        }

        private void GenerateMissingBatchCustomers(int batchId, string frequency, string EmpId, string category)
        {
            if (frequency.ToLower() == "pulse")
                GenerateBatchCustomersHalfyearly(batchId, EmpId);
            if (category.ToLower() == "account")
            {

                GenerateBatchCustomersAccount(batchId, frequency, EmpId);
                return;
            }
            List<CUSTOMER_PROJECTS> customersProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CSAT_SURVEY && t.CSAT_FREQUENCY == frequency && t.ISACTIVE).ToList();
            List<int> CustomerId = customersProjects.Select(t => t.CUSTOMER_USER_ID).Distinct().ToList();
            List<CUSTOMER_USERS> customers = CSPdb.CUSTOMER_USERS.GetAll().Where(t => CustomerId.Contains(t.ID)).ToList();
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchId);
            //todo: take only active projects
            var projects = Cldb.PROJECT.GetAll().ToList();
            var existingCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.BATCH_ID == batchId && x.ISACTIVE).ToList();
            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            bool isCommitRequired = false;

            
            foreach (var c in customersProjects)
            {
                var cust = customers.FirstOrDefault(t => t.ID == c.CUSTOMER_USER_ID);

                if (cust == null) continue;


                PROJECT project = projects.FirstOrDefault(x => x.PROJ_ID == c.PROJ_ID);
                if (cust != null && project != null && project.BUSINESS_UNIT!= null && project.BUSINESS_UNIT.ToLower() == "sead")
                {

                    if (!string.IsNullOrWhiteSpace(project.PROJ_STATUS) && (project.PROJ_STATUS.Trim().ToUpper() == "CLOSE" || project.PROJ_STATUS.Trim().ToUpper() == "COMPLETE")

                        && project.END_DATE < DateTime.Today.AddDays(-90)) continue;
                    if (skipRecords.Any(x => x.Proj_Id == project.PROJ_ID && x.Is_Approved.GetValueOrDefault() && x.Bit_Value.GetValueOrDefault())) continue;
                    //skipping premier for first quarter of 2021. Remove the below code for next quarter onwards
                    // if (project.CUST_ID == PREMIER_CUSTOMER_ID) continue;
                    if (existingCustomers.Any(x => x.PROJ_ID == c.PROJ_ID && x.EMAIL_ID == cust.EMAILID)) continue;
                    var BatchCustomer = new CSS_BATCH_CUSTOMERS()
                    {
                        BATCH_ID = batchId,
                        CUST_ID = c.CUST_ID,
                        PROJ_ID = c.PROJ_ID,
                        QUESTION_MODEL_ID = helper.GetQuestionModel(c.CUST_ID, c.PROJ_ID, false, batch.START_DATE, batch.END_DATE, cust.EMAILID, batch.ID, batch.FREQUENCY, batch.CATEGORY),
                        EMAIL_ID = cust.EMAILID,
                        DISPLAY_NAME = cust.DISPLAY_NAME,
                        STATUS = "CREATED",
                        CREATED_BY = EmpId,
                        CREATED_DATE = DateTime.Now,
                        UPDATED_BY = EmpId,
                        UPDATED_DATE = DateTime.Now,
                        ISACTIVE = true,
                        SPOC = c.SPOC
                    };
                    CSPdb.CSS_BATCH_CUSTOMERS.Add(BatchCustomer);
                    isCommitRequired = true;
                }
            }
            //for prod based
            var prodResponsible = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && (x.MANAGEMENT_TYPE == 6 || x.MANAGEMENT_TYPE == 7)).ToList(); // 6=CUSTOMER_CSAT
            foreach (var cust in prodResponsible.Where(x => x.MANAGEMENT_TYPE == 6).ToList())
            {
                var prods = prodResponsible.Where(x => x.EMP_ID == cust.EMP_ID).ToList();
                if (cust != null && prods.Any())
                {
                    foreach (var cp in prods)
                    {

                        var proj = prodResponsible.FirstOrDefault(x => x.PRODUCT_ID == cp.PRODUCT_ID && x.MANAGEMENT_TYPE == 7);
                        if (proj == null) continue;
                        PROJECT project = projects.FirstOrDefault(x => x.PROJ_ID == proj.PROJECT_ID);
                        // if (project.CUST_ID == PREMIER_CUSTOMER_ID) continue;
                        if (!string.IsNullOrWhiteSpace(project.PROJ_STATUS) && (project.PROJ_STATUS.Trim().ToUpper() == "CLOSE" || project.PROJ_STATUS.Trim().ToUpper() == "COMPLETE")) continue;
                        if (skipRecords.Any(x => x.Proj_Id == project.PROJ_ID)) continue;
                        //skipping premier for first quarter of 2021. Remove the below code for next quarter onwards

                        if (existingCustomers.Any(x => x.PROD_ID == cp.PRODUCT_ID && x.EMAIL_ID == cust.EMP_ID)) continue;
                        var cuser = CSPdb.CUSTOMER_USERS.GetAll().FirstOrDefault(x => x.EMAILID == cust.EMP_ID);
                        if (cuser == null) continue;
                        var BatchCustomer = new CSS_BATCH_CUSTOMERS()
                        {
                            BATCH_ID = batchId,
                            CUST_ID = project.CUST_ID,
                            PROJ_ID = project.PROJ_ID,
                            PROD_ID = cp.PRODUCT_ID,
                            QUESTION_MODEL_ID = helper.GetQuestionModel(project.CUST_ID, project.PROJ_ID, false, batch.START_DATE, batch.END_DATE, cust.EMP_ID, batch.ID, batch.FREQUENCY, batch.CATEGORY),
                            EMAIL_ID = cust.EMP_ID,
                            DISPLAY_NAME = cuser.DISPLAY_NAME,
                            STATUS = "CREATED",
                            CREATED_BY = EmpId,
                            CREATED_DATE = DateTime.Now,
                            UPDATED_BY = EmpId,
                            UPDATED_DATE = DateTime.Now,
                            ISACTIVE = true
                        };
                        CSPdb.CSS_BATCH_CUSTOMERS.Add(BatchCustomer);
                        isCommitRequired = true;
                    }
                }

            }
            if (isCommitRequired)
                CSPdb.Commit(CanCommit);
        }

        private void GenerateBatchCustomersHalfyearly(int batchId, string empId)
        {
            //for prod based
            var prodResponsible = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => x.ISACTIVE && (x.MANAGEMENT_TYPE == 7 || x.MANAGEMENT_TYPE == 8)).ToList(); // 8=CUSTOMER_CSAT_Halfyearly
            //var projects = Cldb.PROJECT.GetAll().ToList();
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchId);
            if (batch == null) return;
            var existingCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.BATCH_ID == batchId && x.ISACTIVE).ToList();
            var prodIds = prodResponsible.Select(x => x.PRODUCT_ID);
            var products = CSPdb.PORTFOLIO_PRODUCTS.GetAll().Where(x => prodIds.Contains(x.ID)).ToList();
            var halfyearlyCustomers = prodResponsible.Where(x => x.MANAGEMENT_TYPE == 8).ToList();
            foreach (var item in halfyearlyCustomers)
            {
                //var prods = prodResponsible.Where(x => x.EMP_ID == item.EMP_ID).ToList();
                //if (!prods.Any()) continue;

                //foreach (var cp in prods)
                //{
                if (existingCustomers.Any(x => x.PROD_ID == item.PRODUCT_ID && x.EMAIL_ID.ToLower().Trim() == item.EMP_ID.ToLower().Trim())) continue;
                var product = products.FirstOrDefault(x => x.ID == item.PRODUCT_ID);
                var cuser = CSPdb.CONTACTS.GetAll().FirstOrDefault(x => x.CONTACT_EMAILID == item.EMP_ID);
                if (cuser == null) continue;
                var projId = prodResponsible.FirstOrDefault(x => x.PRODUCT_ID == product.ID && x.MANAGEMENT_TYPE == 7);
                AddBatchCustomer(batch, cuser.CONTACT_EMAILID, cuser.CONTACT_NAME, empId, product.CUST_ID, projId != null ? projId.PROJECT_ID : "", product.ID, null);
                // }


            }

            CSPdb.Commit(CanCommit);
        }
        private void GenerateMissingBatchCustomersPremier(int batchId, string frequency, string EmpId)
        {

            List<CUSTOMER_PROJECTS> customersProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CSAT_SURVEY && t.CSAT_FREQUENCY == frequency && t.CUST_ID == PREMIER_CUSTOMER_ID).ToList();
            List<int> CustomerId = customersProjects.Select(t => t.CUSTOMER_USER_ID).Distinct().ToList();
            List<CUSTOMER_USERS> customers = CSPdb.CUSTOMER_USERS.GetAll().Where(t => CustomerId.Contains(t.ID)).ToList();
            var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchId);
            var projects = Cldb.PROJECT.GetAll().ToList();
            var existingCustomers = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(x => x.BATCH_MONTHLY_ID == batchId && x.ISACTIVE).ToList();
            var skipRecords = helper.GetProjectConfigurationDataForSetting("SKIP_CSAT");
            bool isCommitRequired = false;

            foreach (var c in customersProjects)
            {
                var cust = customers.FirstOrDefault(t => t.ID == c.CUSTOMER_USER_ID);



                if (cust != null)
                {
                    if (c.PROJ_ID != null)
                    {
                        var project = projects.FirstOrDefault(x => x.PROJ_ID == c.PROJ_ID);
                        if (!string.IsNullOrWhiteSpace(project.PROJ_STATUS) && (project.PROJ_STATUS.Trim().ToUpper() == "CLOSE" || project.PROJ_STATUS.Trim().ToUpper() == "COMPLETE")) continue;
                        if (skipRecords.Any(x => x.Proj_Id == project.PROJ_ID && x.Bit_Value.GetValueOrDefault())) continue;
                        if (existingCustomers.Any(x => x.PROJ_ID == c.PROJ_ID && x.EMAIL_ID == cust.EMAILID)) continue;
                    }
                    else
                    {
                        if (existingCustomers.Any(x => string.IsNullOrWhiteSpace(x.PROJ_ID) && x.PROD_ID.HasValue == false && x.EMAIL_ID == cust.EMAILID)) continue;
                    }



                    var BatchCustomer = new CSS_BATCH_CUSTOMER_MONTHLY()
                    {
                        BATCH_MONTHLY_ID = batchId,
                        CUST_ID = c.CUST_ID,
                        PROJ_ID = c.PROJ_ID,
                        QUESTION_MODEL_ID = helper.GetQuestionModel(c.CUST_ID, c.PROJ_ID, false, batch.START_DATE, batch.END_DATE, cust.EMAILID, batch.ID, "quarterly", ""),
                        EMAIL_ID = cust.EMAILID,
                        DISPLAY_NAME = cust.DISPLAY_NAME,
                        STATUS = "CREATED",
                        CREATED_BY = EmpId,
                        CREATED_DATE = DateTime.Now,
                        UPDATED_BY = EmpId,
                        UPDATED_DATE = DateTime.Now,
                        ISACTIVE = true
                    };
                    CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Add(BatchCustomer);
                    isCommitRequired = true;
                }
            }
            if (isCommitRequired)
                CSPdb.Commit(CanCommit);
        }

        private void GenerateBatchCustomersMonthly(int batchId, string empId)
        {
            string[] customerList = csvToStringArray(helper.GetDBConfig("MONTHLYCSS", "-1"));
            foreach (var item in customerList)
            {
                List<CUSTOMER_PROJECTS> customersProjects = CSPdb.CUSTOMER_PROJECTS.GetAll().Where(t => t.CSAT_SURVEY && t.CUST_ID == item).ToList();
                List<int> CustomerId = customersProjects.Select(t => t.CUSTOMER_USER_ID).Distinct().ToList();
                List<CUSTOMER_USERS> customers = CSPdb.CUSTOMER_USERS.GetAll().Where(t => CustomerId.Contains(t.ID)).ToList();
                var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchId);
                var custUsers = CSPdb.AppRepo.GetCustomerUsersList(item);
                var prodResponsible = CSPdb.AppRepo.GetPortfolioProductResponsibleList(item, 6); // 6=CUSTOMER_CSAT
                var projectsLinked = CSPdb.AppRepo.GetPortfolioProductResponsibleList(item, 6);
                foreach (var c in customersProjects.Select(x => x.CUSTOMER_USER_ID).Distinct().ToList())
                {
                    var cust = customers.FirstOrDefault(t => t.ID == c);
                    if (cust != null)
                    {
                        //if (!string.IsNullOrWhiteSpace(project.PROJ_STATUS) && project.PROJ_STATUS.Trim().ToUpper() == "CLOSE") continue;
                        //if (skipRecords.Any(x => x.Proj_Id == project.PROJ_ID)) continue;
                        //skipping premier for first quarter of 2021. Remove the below code for next quarter onwards

                        //check if user opted for product/project wise survey
                        if (cust.SPECIFIC_SURVEY_OPTED == true)
                        {
                            var custProjs = custUsers.Where(x => x.EMAILID == cust.EMAILID).ToList();
                            foreach (var cp in custProjs)
                            {
                                AddBatchCustomerMonthly(batch, cust, empId, item, cp.PROJ_ID, null);
                            }
                            var prods = prodResponsible.Where(x => x.MailID == cust.EMAILID).ToList();
                            foreach (var cp in prods)
                            {
                                AddBatchCustomerMonthly(batch, cust, empId, item, null, cp.PRODUCT_ID);
                                var proj = prodResponsible.Where(x => x.PRODUCT_ID == cp.PRODUCT_ID).ToList();



                            }
                        }
                        else

                        {
                            AddBatchCustomerMonthly(batch, cust, empId, item);

                        }
                    }
                }
            }

            CSPdb.Commit(CanCommit);
        }

        [POST("UpdateCustomerContactsVerificationList")]
        [ActionName("UpdateCustomerContactsVerificationList")]
        [HttpPost]
        public IHttpActionResult UpdateCustomerContactsVerificationList([FromBody] CSS_BATCH_CUSTOMERS[] batchCustomers)
        {
            CheckAccessForFeature(114);
            //do business validation here

            //logic
            foreach (var item in batchCustomers)
            {
                UpdateCustomerContactVerificationPrivate(item);
            }

            return Ok();
        }


        [GET("GetCSSForVerification")]
        [ActionName("GetCSSForVerification")]
        [HttpGet]
        public IHttpActionResult GetCSSForVerification(HttpRequestMessage request)
        {
            DateTime endDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, DateTime.DaysInMonth(DateTime.Now.Year, DateTime.Now.Month));
            DateTime startDate = endDate.AddMonths(-3).AddDays(1);

            var headers = request.Headers;

            string emp_Id = GetHeaderDetails_String("empId");
            var emailId = helper.GetEmployeeMailId(emp_Id);
            DateTime.TryParse(GetHeaderDetails_String("startDate"), out startDate);
            DateTime.TryParse(GetHeaderDetails_String("endDate"), out endDate);

            var cssVerificationList = CSPdb.AppRepo.GetCSSForVerification(startDate, endDate).Where(x => x.CSM_EMP_ID == emp_Id || x.BU_MAIL == emailId || x.AM_MAIL_ID == emailId).ToList().OrderBy(verification => verification.CUST_NM).OrderBy(verification => verification.PROJ_NM).OrderBy(verification => verification.RESPONDENT_NAME);
            var uri = helper.GetAbsoulteUri();

            foreach (var item in cssVerificationList)
            {
                item.SKIP_CSAT_LINK = $"{uri}/layout/projectdataconfiguration/{item.CUST_ID}";
                item.CONTACTS_LINK = $"{uri}/layout/contacts/{item.CUST_ID}";
            }
            return Ok(cssVerificationList);
        }

        [ActionName("UpdateCustomerContactsVerificationListForPremier")]
        [HttpPost]
        public IHttpActionResult UpdateCustomerContactsVerificationListForPremier(CSS_CUSTOMER_VERIFICATION[] batchCustomers, bool csmAction, string comments)
        {
            if (batchCustomers == null || batchCustomers.Count() == 0)
                return Ok();
            string emp_Id = GetHeaderDetails_String("empId");

            if (string.IsNullOrWhiteSpace(comments) && csmAction == false)
            {
                return Content(HttpStatusCode.Conflict, "Comments is mandatory while Rejecting. Please enter comments and try again.");
            }
            var batchCustomerIds = batchCustomers.Select(ele => ele.BATCH_CUSTOMER_MONTHLY_ID).ToList();
            //logic
            var batchCustomerEntities = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().Where(ele => batchCustomerIds.Contains(ele.ID)).ToList();
            if (!batchCustomerEntities.Any()) return Ok();
            var valResult = ValidateCSSVerficationPremier(batchCustomerEntities.ToArray(), emp_Id);
            if (!string.IsNullOrWhiteSpace(valResult))
            {
                return Content(HttpStatusCode.Conflict, valResult);
            }

            foreach (var item in batchCustomerEntities)
            {
                item.IS_VERIFIED = csmAction;
                if (csmAction)
                    item.COMMENTS = null;
                else if (!string.IsNullOrWhiteSpace(comments))
                    item.COMMENTS = comments;
                UpdateCustomerContactVerificationPremierPrivate(item, false);
            }
            CSPdb.Commit(CanCommit);
            var batchId = batchCustomerEntities.First().BATCH_MONTHLY_ID;
            var batch = CSPdb.CSS_BATCH_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchId);
            string Period = GetCurrentPeriodStringNew("quarterly", (batch.MONTH - 1) / 3, batch.YEAR);
            SendCSSGroupVerificationApprovalMail(batchCustomerEntities.ToArray(), comments, Period);
            return Ok();
        }

        [POST("UpdateCustomerContactsVerificationList")]
        [ActionName("UpdateCustomerContactsVerificationList")]
        [HttpPost]
        public IHttpActionResult UpdateCustomerContactsVerificationList([FromBody] CSS_CUSTOMER_VERIFICATION[] batchCustomers, bool csmAction, string comments)
        {
            if (batchCustomers == null || batchCustomers.Count() == 0)
                return Ok();
            string emp_Id = GetHeaderDetails_String("empId");
            if (string.IsNullOrWhiteSpace(comments) && csmAction == false)
            {
                return Content(HttpStatusCode.Conflict, "Comments is mandatory while Rejecting. Please enter comments and try again.");
            }
            var batchCustomerIds = batchCustomers.Select(ele => ele.BATCH_CUSTOMER_ID).ToList();
            //logic
            var batchCustomerEntities = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(ele => batchCustomerIds.Contains(ele.ID)).ToList();
            if (!batchCustomerEntities.Any()) return Ok();
            var valResult = ValidateCSSVerfication(batchCustomerEntities.ToArray(), emp_Id);
            if (!string.IsNullOrWhiteSpace(valResult))
            {
                return Content(HttpStatusCode.Conflict, valResult);
            }
            foreach (var item in batchCustomerEntities)
            {
                item.IS_VERIFIED = csmAction;
                if (csmAction)
                    item.COMMENTS = null;
                else if (!string.IsNullOrWhiteSpace(comments))
                    item.COMMENTS = comments;
                UpdateCustomerContactVerificationPrivate(item, false);
            }
            CSPdb.Commit(CanCommit);
            var batchId = batchCustomerEntities.First().BATCH_ID;
            var batch = CSPdb.CSS_BATCHES.GetAll().FirstOrDefault(x => x.ID == batchId);
            string Period = GetSurveyPeriodString(batch.FREQUENCY, batch.SEQUENCE, batch.YEAR);
            SendCSSGroupVerificationApprovalMail(batchCustomerEntities.ToArray(), comments, Period);
            return Ok();
        }


        [POST("UpdateCustomerContactsVerification")]
        [ActionName("UpdateCustomerContactsVerification")]
        [HttpPost]
        public IHttpActionResult UpdateCustomerContactsVerification([FromBody] CSS_BATCH_CUSTOMERS batchCustomers)
        {
            CheckAccessForFeature(114);

            var result = UpdateCustomerContactVerificationPrivate(batchCustomers);
            if (string.IsNullOrWhiteSpace(result))
                return Ok();
            else return Content(HttpStatusCode.Conflict, result);
        }


        internal string UpdateCustomerContactVerificationPrivate(CSS_BATCH_CUSTOMERS batchCustomers, bool sendMail = true)
        {
            if (batchCustomers != null)
            {
                var exist = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().FirstOrDefault(x => x.ID == batchCustomers.ID && x.BATCH_ID == batchCustomers.BATCH_ID && x.ISACTIVE);
                //CheckUserHasAccess(GetHeaderDetails_String("empId"), exist.CUST_ID, exist.PROJ_ID);

                if (exist != null)
                {
                    //if (exist.IS_VERIFIED)
                    //{
                    //    return "Already verified.";
                    //}
                    //else
                    {
                        exist.IS_VERIFIED = batchCustomers.IS_VERIFIED;
                        exist.COMMENTS = batchCustomers.COMMENTS;
                        UpdateAuditFields(exist);
                        CSPdb.CSS_BATCH_CUSTOMERS.Update(exist);
                        CSPdb.Commit(CanCommit);
                    }
                    if (sendMail)
                        SendCSSVerificationApprovalMail(exist.CUST_ID, exist.PROJ_ID, exist.PROD_ID, exist.DISPLAY_NAME, exist.EMAIL_ID, exist.IS_VERIFIED, exist.COMMENTS);

                }
            }

            return string.Empty;
        }

        internal string UpdateCustomerContactVerificationPremierPrivate(CSS_BATCH_CUSTOMER_MONTHLY batchCustomers, bool sendMail = true)
        {
            if (batchCustomers != null)
            {
                var exist = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchCustomers.ID && x.BATCH_MONTHLY_ID == batchCustomers.BATCH_MONTHLY_ID && x.ISACTIVE);
                //CheckUserHasAccess(GetHeaderDetails_String("empId"), exist.CUST_ID, exist.PROJ_ID);

                if (exist != null)
                {
                    //if (exist.IS_VERIFIED)
                    //{
                    //    return "Already verified.";
                    //}
                    //else
                    {
                        exist.IS_VERIFIED = batchCustomers.IS_VERIFIED;
                        exist.COMMENTS = batchCustomers.COMMENTS;
                        UpdateAuditFields(exist);
                        CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Update(exist);
                        CSPdb.Commit(CanCommit);
                    }
                    if (sendMail)
                        SendCSSVerificationApprovalMail(exist.CUST_ID, exist.PROJ_ID, exist.PROD_ID, exist.DISPLAY_NAME, exist.EMAIL_ID, exist.IS_VERIFIED, exist.COMMENTS);

                }
            }

            return string.Empty;
        }



        [ActionName("UpdateCustomerContactsVerificationForPremier")]
        [HttpPost]
        public IHttpActionResult UpdateCustomerContactsVerificationForPremier([FromBody] CSS_BATCH_CUSTOMER_MONTHLY batchCustomers)
        {
            CheckAccessForFeature(115);
            var result = UpdateCustomerContactsVerificationForPremierPrivate(batchCustomers);

            if (string.IsNullOrWhiteSpace(result))
                return Ok();
            else return Content(HttpStatusCode.Conflict, result);

            return Ok();
        }
        private string UpdateCustomerContactsVerificationForPremierPrivate(CSS_BATCH_CUSTOMER_MONTHLY batchCustomers)
        {


            if (batchCustomers != null)
            {
                var exist = CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.GetAll().FirstOrDefault(x => x.ID == batchCustomers.ID && x.BATCH_MONTHLY_ID == batchCustomers.BATCH_MONTHLY_ID && x.ISACTIVE);
                CheckUserHasAccess(GetHeaderDetails_String("empId"), exist.CUST_ID, exist.PROJ_ID);

                if (exist != null)
                {
                    if (exist.IS_VERIFIED)
                    {
                        return "Already verified.";
                    }
                    else
                    {
                        exist.IS_VERIFIED = batchCustomers.IS_VERIFIED;
                        exist.COMMENTS = batchCustomers.COMMENTS;
                        UpdateAuditFields(exist);
                        CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Update(exist);
                        CSPdb.Commit(CanCommit);
                    }
                    SendCSSVerificationApprovalMail(exist.CUST_ID, exist.PROJ_ID, exist.PROD_ID, exist.DISPLAY_NAME, exist.EMAIL_ID, exist.IS_VERIFIED, exist.COMMENTS);
                }
            }

            return string.Empty;
        }

        private void SendCSSVerificationApprovalMail(string customerId, string projectId, int? productId, string customerName, string customerMail, bool isVerified, string comments)
        {
            string subject = string.Empty;
            string mailContent;
            string toMail = "";
            string ccMail = "";
            string projectName = string.Empty;
            string csmName = string.Empty;
            PROJECT project = null;
            CUSTOMER customer = null;

            if (!string.IsNullOrWhiteSpace(projectId))
                project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);

            if (!string.IsNullOrWhiteSpace(customerId))
                customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == customerId);

            if (productId.HasValue)
            {
                var productName = CSPdb.PORTFOLIO_PRODUCTS.GetAll().FirstOrDefault(x => x.ID == productId && x.ISACTIVE)?.PRODUCT_TITLE;
                projectName = $"{productName} (Product)";
                toMail = string.Join(",", helper.GetCSMMailsFromAccount(customerId));
                ccMail = string.Join(",", helper.GetCCEmailIDsForPremier(customerMail, ""));
                csmName = "Team";
            }
            else if (project != null)
            {
                projectName = project.PROJ_NM;
                var csmlist = helper.GetCSMFromProject(project);
                toMail = string.Join(",", csmlist.Select(x => x.EMAIL_ID));
                csmName = string.Join(",", csmlist.Select(x => x.FRST_NM));

                List<string> cclist = new List<string>();
                cclist = helper.GetPMFromProject(project);
                var qualitySpoc = helper.GetQualitySpocMailForProject(project);
                if (!string.IsNullOrWhiteSpace(qualitySpoc))
                    cclist.Add(qualitySpoc);

                ccMail = string.Join(",", cclist);
            }
            else
            {
                toMail = string.Join(",", helper.GetCSMMailsFromAccount(customerId));
                ccMail = string.Join(",", helper.GetQualitySPOCMailsFromAccount(customerId));
                csmName = "Team";
            }
            var status = isVerified ? "Approved" : "Rejected";
            subject = $"{customerName} : CSS Customer Contact {status}";

            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("CSM_NAME", csmName);
            EmailContentValues.Add("CUSTOMER_NAME", customerName);
            EmailContentValues.Add("EMAIL_ID", customerMail);
            EmailContentValues.Add("ACCOUNT_NAME", customer.CUST_NM);
            EmailContentValues.Add("PROJECT_NAME", projectName);
            EmailContentValues.Add("STATUS", status);
            EmailContentValues.Add("COMMENTS", comments);
            EmailContentValues.Add("PROJECT_STATUS", project != null && project.PROJ_STATUS != null ? project.PROJ_STATUS : "");

            mailContent = helper.GetEmailContent("SendCSSVerificationApprovalMail.htm", EmailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.CSS_BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = projectId },
                this.Request
                );

        }


        private void SendCSSGroupVerificationApprovalMail(iBatchCustomer[] cssBatchCustomers, string comments, string period)
        {
            string subject = string.Empty;
            string mailContent;
            string status = string.Empty;
            var EmailContentValues = new Dictionary<string, string>();
            var empId = GetHeaderDetails_String("empId");

            var projIds = cssBatchCustomers.Where(x => !string.IsNullOrWhiteSpace(x.PROJ_ID)).Select(x => x.PROJ_ID).ToList();
            var customerIds = cssBatchCustomers.Where(x => !string.IsNullOrWhiteSpace(x.CUST_ID)).Select(x => x.CUST_ID).ToList();

            var projects = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID)).ToList();
            var customers = Cldb.CUSTOMER.GetAll().Where(x => customerIds.Contains(x.CUST_ID)).ToList();

            var csm = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
            List<string> cclist = new List<string>();
            var toMail = csm.EMAIL_ID;
            var csmName = csm.FRST_NM;

            int i = 1;
            var tableContent = new StringBuilder();
            foreach (var item in cssBatchCustomers.Where(x => !string.IsNullOrWhiteSpace(x.PROJ_ID)).OrderBy(x => x.DISPLAY_NAME))
            {
                CheckUserHasAccess(empId, item.CUST_ID, item.PROJ_ID);
                if (i == 1)
                    status = item.IS_VERIFIED ? "Approved" : "Rejected";
                var project = projects.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID);
                if (project == null) continue;
                var customer = customers.FirstOrDefault(x => x.CUST_ID == item.CUST_ID);
                cclist.AddRange(helper.GetPMFromProject(project));
                var qualitySpoc = helper.GetQualitySpocMailForProject(project);
                if (!string.IsNullOrWhiteSpace(qualitySpoc))
                    cclist.Add(qualitySpoc);
                tableContent.Append(GenerateHtmlTableForCustomerVerification(i++, item.DISPLAY_NAME, item.EMAIL_ID,
                         customer.CUST_NM, project.PROJ_NM, status, !string.IsNullOrWhiteSpace(comments) ? comments : string.Empty, !string.IsNullOrWhiteSpace(project.PROJ_STATUS) ? project.PROJ_STATUS : string.Empty));
            }
            string ccMail = string.Join(",", cclist.Distinct().ToList());
            EmailContentValues.Add("TABLE", tableContent.ToString());
            subject = $"{period} CSS Customer Contacts {status}";
            EmailContentValues.Add("CSM_NAME", csmName);
            EmailContentValues.Add("STATUS", status);
            mailContent = helper.GetEmailContent("SendCSSGroupVerificationApprovalMail.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            ep.SendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = toMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                this.Request
                );
        }

        private string GenerateHtmlTableForCustomerVerification(int rowNum, string custName, string cutEmailId,
                         string accountName, string projectName, string status, string comments, string projectStatus)
        {
            var sb = new StringBuilder();
            sb.Append("<tr>");
            sb.Append($"<td>{ rowNum }</td>");
            sb.Append($"<td>{ custName }</td>");
            sb.Append($"<td>{ cutEmailId }</td>");
            sb.Append($"<td>{ accountName }</td>");
            sb.Append($"<td>{ projectName }</td>");
            sb.Append($"<td>{ status }</td>");
            sb.Append($"<td>{ comments }</td>");
            sb.Append($"<td>{ projectStatus }</td>");
            sb.AppendLine("</tr>");

            return sb.ToString();
        }

        private CSS_BATCH_CUSTOMER_MONTHLY AddBatchCustomerMonthly(CSS_BATCH_MONTHLY batch, CUSTOMER_USERS cust, string empId, string custId, String projId = null, int? prodId = null)
        {
            var batchCustomer = new CSS_BATCH_CUSTOMER_MONTHLY()
            {
                BATCH_MONTHLY_ID = batch.ID,
                CUST_ID = custId,

                QUESTION_MODEL_ID = helper.GetQuestionModel(custId, null, true, batch.START_DATE, batch.END_DATE, cust.EMAILID, batch.ID, "quarterly", ""),  //By Default model 1 is considered (Product/ADM/IMS)
                EMAIL_ID = cust.EMAILID,
                DISPLAY_NAME = cust.DISPLAY_NAME,
                STATUS = "CREATED",
                CREATED_BY = empId,
                CREATED_DATE = DateTime.Now,
                UPDATED_BY = empId,
                UPDATED_DATE = DateTime.Now,
                ISACTIVE = true,
                PROD_ID = prodId,
                PROJ_ID = projId
            };
            CSPdb.CSS_BATCH_CUSTOMER_MONTHLY.Add(batchCustomer);
            return batchCustomer;
        }

        private int[] ParseIntValues(string value)
        {
            List<int> result = new List<int>();
            foreach (var item in value.Split(','))
            {
                int a = 0;

                if (int.TryParse(item, out a))
                    result.Add(a);
            }

            return result.ToArray();
        }

        private string[] csvToStringArray(string value)
        {
            List<string> result = new List<string>();
            foreach (var item in value.Split(','))
            {
                result.Add(item);
            }

            return result.ToArray();
        }

        private string ValidateCSSVerfication(CSS_BATCH_CUSTOMERS[] batchCustomers, string empId)
        {
            CheckAccessForFeature(121);
            //chk any premier ids are there
            if (batchCustomers.Any(x => x.CUST_ID == PREMIER_CUSTOMER_ID))
            {
                return "Premier CSS batches cannot be verified in this lot.";
            }
            return ValidateCSSVerificationForProjects(batchCustomers, empId);
        }

        private string ValidateCSSVerficationPremier(CSS_BATCH_CUSTOMER_MONTHLY[] batchCustomers, string empId)
        {
            CheckAccessForFeature(121);
            //chk any premier ids are there
            if (batchCustomers.Any(x => x.CUST_ID != PREMIER_CUSTOMER_ID))
            {
                return "Premier CSS batches can only be verified in this lot.";
            }
            return ValidateCSSVerificationForProjects(batchCustomers, empId);
        }

        private string ValidateCSSVerificationForProjects(iBatchCustomer[] batchCustomers, string empId)
        {
            var projIds = batchCustomers.Select(x => x.PROJ_ID).ToArray();
            var projects = Cldb.PROJECT.GetAll().Where(x => projIds.Contains(x.PROJ_ID)).ToList();
            //check if the user is the csm for all projects - if not throw error saying only csm can approve or reject
            var userrole = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId).CSM_TITLE_ID;

            if (userrole != 7)
                if (!projects.Any(x => x.PROJ_DM_EMP_ID == empId))
                    return "CSMs of the project can only Approve/Reject the contact verification. Please make sure to select the correct records.";
            //chck all status in creatd
            if (batchCustomers.Any(x => x.STATUS != CSS_CREATED))
                return "Records which are in created status alone can be updated. If CSS sent already, it cannot be updated";
            ////check if any of the record is approved already - if yes then throw error to select only unverified records
            //if (batchCustomers.Any(x => x.IS_VERIFIED))
            //    return "Records which are already Approved/Rejected cannot be updated again. Please make sure to select the correct records.";

            ////check if any of the records is rejected already(is_verified = false and comments not null) - if yes throw error to select only un verified records
            //if (batchCustomers.Any(x => !x.IS_VERIFIED && !string.IsNullOrWhiteSpace(x.COMMENTS)))
            //    return "Records which are already Rejected cannot be updated again. Please make sure to select the correct records.";

            //check if the customer is available as part of halfyearly
            var mailIds = batchCustomers.Select(x => x.EMAIL_ID).ToList();
            var productResponsible = CSPdb.PRODUCT_RESPONSIBLE.GetAll().Where(x => mailIds.Contains(x.EMP_ID) && x.MANAGEMENT_TYPE == 8).ToList();
            if (productResponsible.Any())
            {
                return $"The customers who are configured to recieve Half yearly surveys cannot be approved. Please remove the following Id(s) and try again - {string.Join(",", productResponsible.Select(x => x.EMP_ID)) }";
            }
            return string.Empty;
        }
    }

    public class BatchCustomerAndQuestions
    {
        public CSS_BATCH_CUSTOMERS_EXTENDED CSS_BATCH_CUSTOMERS_EXTENDED { get; set; }
        public CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED CSS_BATCH_CUSTOMER_MONTHLY_EXTENDED { get; set; }
        public List<CSS_QUESTION_MASTER> CSS_QUESTION_MASTER { get; set; } = new List<Model.CSP.CSS_QUESTION_MASTER>();
    }

}
