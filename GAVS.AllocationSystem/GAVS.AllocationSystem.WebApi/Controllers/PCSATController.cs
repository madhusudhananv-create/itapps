using AttributeRouting.Web.Mvc;
using System;
using System.Web.Http;
using System.Linq;
using GAVS.AllocationSystem.Model.CSP;
using System.Collections.Generic;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.AllSys.SP;
using System.Text;
using System.Configuration;
using System.Diagnostics;
using Newtonsoft.Json;


namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        //step 1
        [GET("GetCSATListForDP")]
        [ActionName("GetCSATListForDP")]
        [HttpGet]
        public IHttpActionResult GetCSATListForDP(string dpId, int batchId)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = new List<CSS_BATCH_PROJECTS>();
            var batch = CSPdb.CSS_BATCHES.GetById(batchId);
            if (batch == null) return Ok();
            //1. call the new SP and get the results
            var spResult = Cldb.AppRepo.GetAccountProjectSelectionCSAT(batch.START_DATE, batch.END_DATE, dpId);
            var batchprojects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId && x.DP_ID == dpId).ToList();

            //2. check if all the records in SP are available in css_batch_Projects, if not add new record.
            foreach (var item in spResult)
            {
                var existing = batchprojects.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID);
                if (existing != null)
                {
                    item.IS_SELECTED = existing.IS_SELECTED;
                    if (!existing.IS_SELECTED)
                    {
                        item.REASON = existing.REASON;
                    }

                }
                //else
                //{
                //    item.IS_SELECTED = false;
                //}

                //result.Add(item);
            }
            //3.
            FillResponseTime(stopwatch);
            return Ok(spResult);
        }

        [POST("SaveCSATListForDP")]
        [ActionName("SaveCSATListForDP")]
        [HttpPost]
        public IHttpActionResult SaveCSATListForDP([FromBody] List<CSS_BATCH_PROJECTS> batchProjectList, string dpID, int batchId)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(content: JsonConvert.SerializeObject(batchProjectList));
            var existingRecords = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.BATCH_ID == batchId && (x.DP_ID == dpID || x.PROJ_PM_EMP_ID == dpID || x.QUALITY_SPOC == dpID ) && x.ISACTIVE).ToList();
            //loop the results and save.
            foreach (var item in batchProjectList)
            {
                var existingRecord = existingRecords.FirstOrDefault(x => x.PROJ_ID == item.PROJ_ID && x.CUST_ID == item.CUST_ID);

                if (existingRecord == null)
                {
                    item.BATCH_ID = batchId;
                    UpdateAuditFields(item);
                    Cldb.CSS_BATCH_PROJECTS.Add(item);
                }
                else
                {
                    existingRecord.IS_SELECTED = item.IS_SELECTED;
                    existingRecord.REASON = item.REASON;
                    existingRecord.ISACTIVE = item.ISACTIVE;
                    existingRecord.DP_ID = item.DP_ID;
                    existingRecord.PROJ_PM_EMP_ID = item.PROJ_PM_EMP_ID;
                    existingRecord.QUALITY_SPOC = item.QUALITY_SPOC;
                    UpdateAuditFields(existingRecord);
                    Cldb.CSS_BATCH_PROJECTS.Update(existingRecord);
                }
            }
            Cldb.Commit();
            FillResponseTime(stopwatch);
            return Ok();
        }

        //step 2
        [GET("GetCSATContactListForDP")]
        [ActionName("GetCSATContactListForDP")]
        [HttpGet]
        public IHttpActionResult GetCSATContactListForDP(string dpId, int batchId)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest();
            var firstResult = new List<CSS_BATCH_CUSTOMERS>();
            var result = new List<CSS_BATCH_CUSTOMERS_EXTENDED>();
            var batch = CSPdb.CSS_BATCHES.GetById(batchId);
            if (batch == null) return Ok();
            var batchprojects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId && (x.DP_ID == dpId || x.PROJ_PM_EMP_ID == dpId || x.QUALITY_SPOC == dpId) && x.IS_SELECTED).ToList();
            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == batchId).ToList();
            var custIds = batchprojects.Select(x => x.CUST_ID).Distinct().ToList();
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && x.CONTACT_TYPE == "CUSTOMER" && custIds.Contains(x.CUSTOMER_ID)).ToList();

            //write logic to find the real id

            int oldBatchId = 35;
            int.TryParse(helper.GetDBConfig("LAST_PCSAT_BATCH_ID", "-1"), out oldBatchId);
            var oldBatchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.BATCH_ID == oldBatchId && x.SURVEY_SENT_DATE.HasValue).ToList();
            var oldBatchCustomerIds = oldBatchCustomers.Select(x => x.ID).ToList();
            var oldReplies = CSPdb.CSS_QUESTION_REPLIES.GetAll().Where(x => x.ISACTIVE && x.PERSPECTIVE.ToLower() == "overall experience" && oldBatchCustomerIds.Contains(x.BATCH_CUSTOMER_ID)).ToList();
            foreach (var item in batchprojects)
            {
                // var batchProjectsForCustomer = batchprojects.Where(x => x.CUST_ID == item).ToList();
                // var contactsForCustomer = contacts.Where(x => x.CUSTOMER_ID == item).ToList();
                //var cartesianProduct = batchProjectsForCustomer.SelectMany(item1 => contactsForCustomer,
                //                                  (item1, item2) => new { Item1 = item1, Item2 = item2 }).ToList();

                var savedBatchRecords = batchCustomers.Where(x => x.PROJ_ID == item.PROJ_ID).ToList();

                if (savedBatchRecords.Any())
                {
                    firstResult.AddRange(savedBatchRecords);
                }
                else
                {
                    var existing = oldBatchCustomers.Where(x => x.PROJ_ID == item.PROJ_ID && x.IS_VERIFIED && x.ISACTIVE).ToList();
                    if (!existing.Any())
                    {
                        firstResult.Add(new CSS_BATCH_CUSTOMERS
                        {
                            BATCH_ID = batchId,
                            ID = 0,
                            CUST_ID = item.CUST_ID,
                            PROJ_ID = item.PROJ_ID,
                            EMAIL_ID = "",
                            DISPLAY_NAME = "",

                        });
                    }
                    else

                    {
                        foreach (var item2 in existing)
                        {

                            var predictedValues = GetPredcitedScoreAndReason(item2.EMAIL_ID, oldBatchCustomers, oldReplies);
                            firstResult.Add(new CSS_BATCH_CUSTOMERS
                            {
                                BATCH_ID = batchId,
                                ID = 0,
                                CUST_ID = item2.CUST_ID,
                                PROJ_ID = item2.PROJ_ID,
                                EMAIL_ID = item2.EMAIL_ID,
                                DISPLAY_NAME = item2.DISPLAY_NAME,
                                SPOC = predictedValues.Item3,
                                PREDICTED_SCORE = predictedValues.Item1.GetValueOrDefault(),
                                PREDICTED_REASON = predictedValues.Item2,
                            });

                        }
                    }

                }

            }
            result = helper.FillCustomerAndProjectNames(firstResult);
            foreach (var row in result)
            {
                row.CONTACT_ROLE = contacts.FirstOrDefault(c => string.Equals(c.CONTACT_EMAILID, row.EMAIL_ID, StringComparison.OrdinalIgnoreCase))?.CONTACT_ROLE;
            }
            FillResponseTime(stopwatch);
            return Ok(result);
        }

        [POST("SaveCSATContactListForDP")]
        [ActionName("SaveCSATContactListForDP")]
        [HttpPost]
        public IHttpActionResult SaveCSATContactListForDP([FromBody] List<CSS_BATCH_CUSTOMERS> batchCustomerList, string dpId, int batchId)
        {
            var stopwatch = Stopwatch.StartNew();
            LogRequest(content: JsonConvert.SerializeObject(batchCustomerList));
            //perform validation
            var existingRecords = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.BATCH_ID == batchId && x.ISACTIVE).ToList();
            var cssProjIds = batchCustomerList.Select(x => x.PROJ_ID).Distinct().ToList();
            var projIds = batchCustomerList.Where(x => x.ID > 0).Select(x => x.ID).ToList();
            var recordsToDelete = existingRecords.Where(x => cssProjIds.Contains(x.PROJ_ID) && !projIds.Contains(x.ID)).ToList();
            foreach (var delItem in recordsToDelete)
            {

                UpdateAuditFields(delItem);
                delItem.ISACTIVE = false;
                CSPdb.CSS_BATCH_CUSTOMERS.Update(delItem);
            }
            var lastAcsatBatchId = 36;
            int.TryParse(helper.GetDBConfig("LAST_ACSAT_BATCH_ID", "-1"), out lastAcsatBatchId);

            var batchCustomers = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ISACTIVE && x.SURVEY_SENT_DATE.HasValue && x.BATCH_ID == lastAcsatBatchId).ToList();

            //loop the results and save.
            foreach (var item in batchCustomerList)
            {
                if (batchCustomers.Any(x => x.EMAIL_ID == item.EMAIL_ID))
                {
                    return BadRequest($"Please choose a different CSAT Respondent as {item.DISPLAY_NAME} - {item.EMAIL_ID} was polled during last ACSAT cycle");
                }
                int countList = batchCustomerList.Count(x => x.PROJ_ID == item.PROJ_ID && x.EMAIL_ID.ToLower() == item.EMAIL_ID.ToLower());
                bool alreadyExists = existingRecords.Any(x => x.PROJ_ID == item.PROJ_ID && x.EMAIL_ID.ToLower() == item.EMAIL_ID.ToLower() && x.ID != item.ID);

                if (countList > 1 || alreadyExists)
                {
                    return BadRequest($"Duplicate Error: Respondent {item.EMAIL_ID} is already added to the project: {GetProjectName(item.PROJ_ID)}");
                }

                if (item.ID == 0)
                {
                    item.BATCH_ID = batchId;
                    item.STATUS = "CREATED";
                    UpdateAuditFields(item);
                    CSPdb.CSS_BATCH_CUSTOMERS.Add(item);
                }
                else
                {
                    var batchRecords = existingRecords.FirstOrDefault(x => x.ID == item.ID);

                    if (batchRecords != null)
                    {
                        batchRecords.DISPLAY_NAME = item.DISPLAY_NAME;
                        batchRecords.EMAIL_ID = item.EMAIL_ID;
                        batchRecords.SPOC = item.SPOC;
                        batchRecords.PREDICTED_SCORE = item.PREDICTED_SCORE;
                        batchRecords.PREDICTED_REASON = item.PREDICTED_REASON;
                        batchRecords.REMARKS = item.REMARKS;
                        UpdateAuditFields(batchRecords);
                        CSPdb.CSS_BATCH_CUSTOMERS.Update(batchRecords);
                    }

                }
            }
            CSPdb.Commit();

            var batchProjects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.BATCH_ID == batchId && (x.DP_ID == dpId || x.QUALITY_SPOC == dpId) && x.IS_SELECTED && x.ISACTIVE).ToList();
            bool isQualitySpoc = batchProjects.Any(x => x.QUALITY_SPOC == dpId);
            var mailList = new List<string>();
            if (!isQualitySpoc)
            {
                SendPCSATAcknowledgementEmail(dpId, null, batchId, false);
                mailList.Add(dpId);
            }

            if (batchProjects.Any())
            {
                foreach (var item in batchProjects.GroupBy(x => x.PROJ_PM_EMP_ID))
                {
                    string pmId = item.Key;
                    if (!string.IsNullOrEmpty(pmId) && !mailList.Contains(pmId))
                    {
                        SendPCSATAcknowledgementEmail(pmId, dpId, batchId, true);
                        mailList.Add(pmId);
                    }
                }

                foreach (var item in batchProjects.GroupBy(x => x.DP_ID))
                {
                    string accountDpId = item.Key;
                    if (!string.IsNullOrEmpty(accountDpId) && !mailList.Contains(accountDpId))
                    {
                        SendPCSATAcknowledgementEmail(accountDpId, dpId, batchId, false);
                        mailList.Add(accountDpId);
                    }
                }

            }
            FillResponseTime(stopwatch);
            return Ok();
        }

        [POST("GetContactListForCustIds")]
        [ActionName("GetContactListForCustIds")]
        [HttpPost]
        public IHttpActionResult GetContactListForCustIds([FromBody] List<string> custIds)
        {
            var contacts = CSPdb.CONTACTS.GetAll().Where(x => x.ISACTIVE && custIds.Contains(x.CUSTOMER_ID) && x.CONTACT_TYPE.ToLower() == "customer").ToList();

            return Ok(contacts);
        }

        [GET("GetCurrentActiveBatch")]
        [ActionName("GetCurrentActiveBatch")]
        [HttpGet]
        public IHttpActionResult GetCurrentActiveBatch()
        {

            return Ok(new { batch_id = 37, batch_name = "Half-Yearly June - Dec 2025" });
        }

        [GET("GetDropdownOptions")]
        [ActionName("GetDropdownOptions")]
        [HttpGet]
        public IHttpActionResult GetDropdownOptions(string dropdownName)
        {

            var result = new List<DROPDOWN_OPTION>()
               {
                new DROPDOWN_OPTION(){ DD_VALUE ="ALREADY_COVERED", DD_TEXT="Project covered in another project" },
                new DROPDOWN_OPTION(){ DD_VALUE ="JUST_STARTED", DD_TEXT="Project started recently" },
                new DROPDOWN_OPTION(){ DD_VALUE ="IN_TRANSITION", DD_TEXT="Project in transition phase" },
                new DROPDOWN_OPTION(){ DD_VALUE ="ACCOUNT_CLOSED", DD_TEXT="Account getting closed" },
                new DROPDOWN_OPTION(){ DD_VALUE ="ZIF_ONLY", DD_TEXT="ZIF only project" },
                new DROPDOWN_OPTION(){ DD_VALUE ="INVOICING_ONLY", DD_TEXT="Project created for invoicing" },
                new DROPDOWN_OPTION(){ DD_VALUE ="LESS_HEADCOUNT", DD_TEXT="Project has less headcount" },
                new DROPDOWN_OPTION(){ DD_VALUE ="OTHERS", DD_TEXT="Others" }
               };


            return Ok(result);
        }

        public Tuple<int?, string, string> GetPredcitedScoreAndReason(string emailId, List<CSS_BATCH_CUSTOMERS> batchCustomers, List<CSS_QUESTION_REPLIES> replies)
        {
            var customerRecord = batchCustomers.FirstOrDefault(x => x.EMAIL_ID == emailId);
            Tuple<int?, string, string> result = new Tuple<int?, string, string>(null, "", "");
            if (customerRecord != null)
            {
                var reply = replies.FirstOrDefault(x => x.ISACTIVE && x.BATCH_CUSTOMER_ID == customerRecord.ID);
                if (reply != null)
                {
                    result = new Tuple<int?, string, string>((int?)reply.RATING, "Actual Score from last Survey", customerRecord.SPOC);

                }
                else
                {
                    result = new Tuple<int?, string, string>((int?)customerRecord.PREDICTED_SCORE, "Predicted Score from last Survey", customerRecord.SPOC);
                }
            }

            return result;
        }
        private void SendPCSATAcknowledgementEmail(string dpId, string qualitySpoc, int batchId, bool isForPM)
        {
            try
            {
                var selectedProjects = Cldb.CSS_BATCH_PROJECTS.GetAll().Where(x => x.BATCH_ID == batchId && (x.DP_ID == dpId || x.PROJ_PM_EMP_ID == dpId) && (qualitySpoc == null || x.QUALITY_SPOC == qualitySpoc) && x.ISACTIVE && x.IS_SELECTED).ToList();
                //if (isForPM)
                //{ 
                //    selectedProjects = selectedProjects.Where(x=>x.)
                //}

                if (!selectedProjects.Any()) return;

                bool isQualitySpoc = selectedProjects.Any(x => x.QUALITY_SPOC == dpId);

                var selectedProjIds = selectedProjects.Select(x => x.PROJ_ID).ToList();

                var respondents = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.BATCH_ID == batchId && x.ISACTIVE && selectedProjIds.Contains(x.PROJ_ID)).ToList();

                var sbProjects = new StringBuilder();
                int sno = 1;
                var custIds = selectedProjects.Select(p => p.CUST_ID).Distinct().ToList();
                var projIds = selectedProjects.Select(p => p.PROJ_ID).Distinct().ToList();

                var accounts = Cldb.CUSTOMER.GetAll().Where(t => custIds.Contains(t.CUST_ID)).ToList();
                var projects = Cldb.PROJECT.GetAll().Where(t => projIds.Contains(t.PROJ_ID)).ToList();

                foreach (var proj in selectedProjects)
                {
                    var accName = accounts.FirstOrDefault(c => c.CUST_ID == proj.CUST_ID)?.CUST_NM;
                    var projectDetails = projects.FirstOrDefault(p => p.PROJ_ID == proj.PROJ_ID);
                    string isChosenPCSAT = proj.IS_SELECTED ? "Yes" : "No";
                    sbProjects.Append("<tr>");
                    sbProjects.Append($"<td style = 'text-align:center;'>{sno++}</td>");
                    sbProjects.Append($"<td>{accName}</td>");
                    sbProjects.Append($"<td>{projectDetails?.PROJ_NM}</td>");
                    sbProjects.Append($"<td>{projectDetails?.EXECUTION_TYPE ?? "-"}</td>");
                    sbProjects.Append($"<td>{projectDetails?.ENGAGAMENT_TYPE ?? "-"}</td>");
                    sbProjects.Append($"<td>{isChosenPCSAT}</td>");
                    sbProjects.Append("</tr>");
                }

                var sbRespondents = new StringBuilder();
                int respSNo = 1;
                string updatedBy = qualitySpoc;
                foreach (var row in respondents)
                {
                    string projName = GetProjectName(row.PROJ_ID);
                    
                    sbRespondents.Append("<tr>");
                    sbRespondents.Append($"<td style = text-align:center;'>{respSNo++}</td>");
                    sbRespondents.Append($"<td>{projName}</td>");
                    sbRespondents.Append($"<td>{row.DISPLAY_NAME}</td>");
                    sbRespondents.Append($"<td>{row.EMAIL_ID}</td>");
                    sbRespondents.Append($"<td style = 'text-align:center;'>{row.PREDICTED_SCORE}</td>");
                    sbRespondents.Append($"<td>{row.SPOC}</td>");
                    sbRespondents.Append("</tr>");
                }
                string baseImageUrl = ConfigurationManager.AppSettings["BaseImageUrl"];
                string ccMail = string.Empty;
                string validityDate = string.Empty;
                validityDate = helper.GetDBConfig("PCSAT_ACK_MAIL_VALIDITY", "-1");
                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("PROJECT_TABLE", sbProjects.ToString());
                EmailContentValues.Add("VALIDATION_TABLE", sbRespondents.ToString());
                EmailContentValues.Add("BASE_URL", baseImageUrl);
                EmailContentValues.Add("UPDATED_BY", GetEmployeeNamebyId(updatedBy.ToString()));
                EmailContentValues.Add("VALID_DATE", validityDate);
                var mailContent = helper.GetEmailContent("PCSATAcknowledgementTemplate.htm", EmailContentValues);
                string toMail = string.Empty;
                toMail = helper.GetEmployeeMailId(dpId);
                var ccList = new List<string>();
                foreach (var proj in selectedProjIds)
                {
                    if (!isForPM)
                    {
                        ccList.Add(helper.GetCSMMailsFromProject(proj));
                    }
                    // ccList.AddRange(helper.GetPMFromProject(proj));
                    ccList.Add(helper.GetQualitySpocMailForProject(proj, false));

                }

                ccMail = string.Join(",", ccList);
                string bcc = string.Empty;
                bcc = helper.GetDBConfig("CSS_BCC", "-1");
                var batchObj = CSPdb.CSS_BATCHES.GetById(batchId);
                var subject = $" {batchObj.FREQUENCY} PCSAT Survey (H{batchObj.SEQUENCE} - {batchObj.YEAR}) Project and Respondent Configuration Submitted";
                var ep = new EmailProvider(Cldb, CSPdb);
                if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

                if (ep.SendEmail
                          (
                          new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587", excludeSender = isForPM },
                          new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = bcc, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                          Request
                          )) ;
            }
            catch (Exception ex)
            {
                // Log error (System.Diagnostics.Debug.WriteLine(ex.Message))
            }
        }
    }
}