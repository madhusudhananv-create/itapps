using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.Base;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Web.Http;
using System.Web.UI.WebControls;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Html2pdf;



namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("ProcessExternalKPI"), ActionName("ProcessExternalKPI"), HttpGet]
        public IHttpActionResult ProcessExternalKPI(string Month, string Year)
        {
            var stopwatch = Stopwatch.StartNew();
            var emp = GetHeaderDetails_String("empid");
            string date = "1-" + Month + "-" + Year;
            DateTime dt = Convert.ToDateTime(date);
            ProcessExternalKPIs("202100121", dt, "ZIF");
            ProcessExternalKPIsByFormula("202100121", dt, "FRESHWORKS");
            return Ok();
        }

        [GET("DownloadFile")]
        [ActionName("DownloadFile")]
        [HttpGet]
        public HttpResponseMessage DownloadFile(string category, string custId, string projectId, int id)
        {
            try
            {

                var result = new byte[] { };
                switch (category.ToLower())
                {
                    case "assessment":
                        result =   ConvertStringtoFile((x=> { }), GenerateInternalAuditReport(custId, projectId, id));
                        break;
                    default:
                        break;
                }


                using (MemoryStream ms = new MemoryStream())
                {
                    HttpResponseMessage httpResponseMessage = new HttpResponseMessage();
                    httpResponseMessage.Content = new ByteArrayContent(result.ToArray());
                    httpResponseMessage.Content.Headers.Add("x-filename", "assesment");
                    httpResponseMessage.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
                    httpResponseMessage.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                    //httpResponseMessage.Content.Headers.ContentDisposition.FileName = fileName;
                    //httpResponseMessage.Content.Headers.Add("Content-Disposition", $" attachment; filename={fileName}");
                    httpResponseMessage.StatusCode = HttpStatusCode.OK;
                    return httpResponseMessage;

                }

                return this.Request.CreateResponse(HttpStatusCode.NotFound, "File not found.");
            }
            catch (Exception ex)
            {
                return this.Request.CreateResponse(HttpStatusCode.InternalServerError, ex);
            }
        }

        private byte[] ConvertStringtoFile(Action<Document> pdfModifier, string content)
        {
            var stream = new MemoryStream();
            var writer = new PdfWriter(stream);
            var pdf = new PdfDocument(writer);
            ConverterProperties converterProperties = new ConverterProperties();
            converterProperties.SetBaseUri(Path.GetFullPath(System.Web.Hosting.HostingEnvironment.MapPath("~/UploadFile/")));
            using (var workStream = new MemoryStream())
            using (var pdfWriter = new PdfWriter(workStream))
            {
                using (var document = HtmlConverter.ConvertToDocument(content, pdfWriter, converterProperties))
                {
                    //Passes the document to a delegated function to perform some content, margin or page size manipulation
                    pdfModifier(document);
                }

                //Returns the written-to MemoryStream containing the PDF.   
                return workStream.ToArray();
            }
        }
        private byte[] CreatePdf(Action<Document> pdfModifier)
        {
            var stream = new MemoryStream();
            var writer = new PdfWriter(stream);
            var pdf = new PdfDocument(writer);

            var etys = CSPdb.CSS_BATCH_CUSTOMERS.GetAll().Where(x => x.ID == 11130 || x.ID == 11129 || x.ID == 11128).ToArray();
            var content = SendCSSGroupVerificationApprovalMailDummy(etys, "test comment", "Q3 - 2024");

            ConverterProperties converterProperties = new ConverterProperties();
            //var document = HtmlConverter.ConvertToDocument(content, pdf, converterProperties);


            //// List<IElement> elements2 = (List<IElement>)HtmlConverter.ConvertToElements(content);
            //foreach (var element in elements2)
            //{
            //    document.Add((IBlockElement)element);
            //}
            //document.Add(new Paragraph(content));


            using (var workStream = new MemoryStream())
            using (var pdfWriter = new PdfWriter(workStream))
            {
                using (var document = HtmlConverter.ConvertToDocument(content, pdfWriter, converterProperties))
                {
                    //Passes the document to a delegated function to perform some content, margin or page size manipulation
                    pdfModifier(document);
                }

                //Returns the written-to MemoryStream containing the PDF.   
                return workStream.ToArray();
            }


        }
        private string SendCSSGroupVerificationApprovalMailDummy(iBatchCustomer[] cssBatchCustomers, string comments, string period)
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
            return mailContent;
        }



        [POST("GetEntityGeneralInfo"), ActionName("GetEntityGeneralInfo"), HttpPost]
        public IHttpActionResult GetEntityGeneralInfo([FromBody] EntityBase entity, string entityType)
        {
            EntityBase result = null;
            if (entity.ID > 0)
            {
                switch (entityType.ToLower())
                {
                    case "risk":
                        result = CSPdb.PROJECT_RISK.GetById(entity.ID) as EntityBase;
                        break;

                    case "actionitem":
                        result = CSPdb.PROJECT_ACTIONITEM.GetById(entity.ID) as EntityBase;
                        break;

                    case "issue":
                        result = CSPdb.PROJECT_ISSUE.GetById(entity.ID) as EntityBase;
                        break;

                    case "appreciation":
                        result = CSPdb.APPRECIATION.GetById(entity.ID) as EntityBase;
                        break;

                    default:
                        break;
                }

                if (result != null)
                {
                    var empIdList = new List<string> { result.CREATED_BY, result.UPDATED_BY };
                    var employees = Cldb.EMP_INFO.GetAll().Where(x => empIdList.Contains(x.EMP_ID) || empIdList.Contains(x.EMP_ID_NEW)).ToList();

                    if (employees.Any(x => x.EMP_ID == result.CREATED_BY))
                        result.CREATED_BY = employees.Single(x => x.EMP_ID == result.CREATED_BY).FRST_NM;

                    if (employees.Any(x => x.EMP_ID == result.UPDATED_BY))
                        result.UPDATED_BY = employees.Single(x => x.EMP_ID == result.UPDATED_BY).FRST_NM;
                }
            }


            return Ok(result);

        }

        [GET("GeneralMethod"), ActionName("GeneralMethod"), HttpGet]
        public IHttpActionResult GeneralMethod()
        {
            //SendCSSBatchReminderMailsPremier(Request);
            //GenerateMissingBatchCustomersPremier(37, "Quarterly", "102802");
            //var ids = new List<int> { 6244, 6243, 6242, 6241, 6240 };
            //var actionItems = CSPdb.PROJECT_ACTIONITEM.GetAll().Where(x => ids.Contains(x.ID)).ToList();
            //var projId = actionItems.First().PROJECT_ID;
            //var projects = Cldb.PROJECT.GetAll().Where(x => x.PROJ_ID == projId).ToList();
            //SendActionItemGroupMail(actionItems, projects, "");
            //GenerateCSSReadinessReport();
            ////GenerateAutoRisk(31, "batch");
            //// GenerateAutoRisk(35, "batchmonthly");
            //return Ok();
            //

            //string jsonContent =// "{\"GUID\":\"c66c92fd - 3660 - ed11 - 9562 - 000d3af07bf2\",\"PROJ_ID\":\"PROJ0852\",\"CUST_ADDR_ID\":1,\"BILL_CRNCY_ID\":2,\"BILL_CRNCY\":\"USD\",\"PROJ_NM\":\"Andromeda 360 - SOW1 - AIML\",\"proJ_ALIAS_NM\":\"Andromeda 360 - SOW1 - AIML\",\"START_DATE\":\"2022 - 04 - 18T00: 00:00\",\"END_DATE\":\"2023 - 09 - 15T00: 00:00\",\"BILL_TYPE\":true,\"PROC_TYPE\":\"Billable\",\"PROJ_BUHEAD_EMP_ID\":\"1000064\",\"PROJ_DM_EMP_ID\":\"1000064\",\"PROJ_PM_EMP_ID\":\"1000064\",\"PROJ_AM_EMP_ID\":\"1000064\",\"CREATED_BY\":\"1000064\",\"CREATED_DATE\":\"2022 - 11 - 09 19: 41:05 \",\"UPDATED_BY\":\"1000064\",\"UPDATED_DATE\":\"2024 - 06 - 13 10: 17:31 \",\"DEPT_ID\":null,\"DEPT\":\"IDMCD\",\"CUST_ID\":\"CUST0210\",\"CUST_ID_S\":\"CUST0210\",\"BU_ID\":null,\"BU\":\"IDM\",\"PROJ_STATUS\":\"Close\",\"PROJECT_GROUP\":\"Time & Material – Onsite\",\"BUSINESS_UNIT\":\"IDM\",\"PROJECT_TYPE\":\"Time and Material\",\"DEPARTMENT\":\"IDMCD\",\"CONTRACTING_UNIT\":\"GS Lab USA\",\"COUNTRY\":\"United States\",\"METHODOLOGY\":null}";
            //"{\"PROJ_ID\":\"PROJ1259\",\"EMP_ID\":null,\"PROJ_RM_EMP_ID\":1000219,\"PROJ_REVIEWER_EMP_ID\":1000271,\"START_DATE\":null,\"END_DATE\":null,\"BILL_FLG\":null,\"ALLCT_PCT\":null,\"ALLOCATION_HOURS\":null,\"CURR_INDC\":\"\u0000\",\"CREATED_DATE\":null,\"UPDATED_DATE\":null,\"ID\":\"177d6496-f872-ee11-8179-6045bdad4ae1\",\"ORG_CODE\":null}";

            string jsonContent = "{\"PROJ_ID\":\"201P000695\",\"EMP_ID\":1000865,\"PROJ_RM_EMP_ID\":1000066,\"PROJ_REVIEWER_EMP_ID\":1000066,\"START_DATE\":\"2024-08-02T00:00:00\",\"END_DATE\":\"2024-08-30T00:00:00\",\"BILL_FLG\":true,\"ALLCT_PCT\":100.0,\"ALLOCATION_HOURS\":168.0000000000,\"CURR_INDC\":\"Y\",\"CREATED_DATE\":\"2024-08-06T15:14:52+05:30\",\"UPDATED_DATE\":\"2025-04-21T17:07:37+05:30\",\"ID\":\"24cbec86-d853-ef11-bfe2-000d3a3de228\",\"ORG_CODE\":201}";

            UpdateProjResourcePrivate(jsonContent);
            return Ok();
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

                    existing.BILL_CRNCY_ID = project.BILL_CRNCY_ID;
                    existing.BILL_TYPE = project.BILL_TYPE;
                    existing.BU_ID = project.BU_ID;
                    existing.CUST_ADDR_ID = project.CUST_ADDR_ID;
                    existing.CUST_ID = project.CUST_ID;
                    existing.DEPT_ID = project.DEPT_ID;

                    existing.BUSINESS_UNIT = project.BUSINESS_UNIT;
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
                    Cldb.PROJECT.Update(existing);
                    //Cldb.Commit();
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

            }
            catch (Exception exp)
            {


            }

            //SendUnsentMails();
            //var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == "202P000994");
            //SendProjClosureMailtoMarketTeam(project);
            // GenerateMissingBatchCustomers(27, "Monthly", "102802");
            //var emp = new EMP_INFO_DETAILED();

            //emp.CSM_TITLE_ID = 1;
            //emp.EMP_ID = "909090";
            //emp.FRST_NM = "test";
            //emp.CREATED_DATE = DateTime.Now;
            //emp.UPDATED_DATE = DateTime.Now;
            //emp.DOB = DateTime.Now;
            //emp.DOJ = DateTime.Now;
            //emp.GENDER = 'M';
            //emp.BASE_CNTRY_ID = 1;
            //emp.MANAGER_EMP_ID = string.Empty;
            //emp.REVIEWER_EMP_ID = string.Empty;
            //emp.APPRAISAL_RATING = string.Empty;
            //emp.UPDATED_BY = string.Empty;
            //emp.CREATED_BY = string.Empty;
            //emp.UNBILL_CLASSIFY = string.Empty;
            //emp.PROMOTION_INFO = string.Empty;
            //emp.MOBILE_NBR = string.Empty;
            //emp.LEVEL = string.Empty;
            //emp.MIDDLE_NM = string.Empty;
            //emp.LAST_NM = string.Empty;
            //emp.EXPERIENCE = string.Empty;
            //emp.EMP_ROLE = string.Empty;
            //emp.EMP_CSP_ROLE = string.Empty;
            //emp.EMP_BAS_ROLE = string.Empty;
            //emp.EMPL_TYPE = string.Empty;
            //emp.EMAIL_ID = string.Empty;
            //emp.TITLE = string.Empty;
            //emp.POTENTIAL_TO_BILL = false;
            //emp.SUPERADMIN = false;
            //Cldb.AppRepo.AddEmployee(emp);

            //ProcessMonthlyKPIDataByKeyword("", DateTime.Today);
            //using (EF.RasEntities context = new EF.RasEntities())
            //{

            //    EF.EMP_INFO existingRow = context.EMP_INFO.Where(t => t.EMP_ID == "102802").FirstOrDefault();
            //}

            return Ok();
        }

        public void SendUnsentMails()
        {
            //&& new int[]{8346,8660,10093 }.Contains(x.ID)
            var dateToCheck = DateTime.Now.AddMonths(-1);
            var unsent = CSPdb.EMAIL_LOG.GetAll().Where(x => x.MAILSENT == false && x.CREATED_DATE > dateToCheck).ToList();
            foreach (var item in unsent)
            {
                string mailContent = item.CONTENT;
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.ReSendEmail
                (
                new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                new EmailContent { from = _email, to = item.TOADDRESS, cc = item.CC, bcc = item.BCC, content = mailContent, subject = item.SUBJECTLINE, hasAttachments = false, attachmentFilePath = "" },
                item,
                Request
                );
            }
        }

        private DataTable GetDatatableFromJsonList(List<string> jsonArray)
        {
            var toReturn = new List<string>();
            //refactor without for loop
            foreach (var item in jsonArray)
            {
                var attributesAsJObject = JObject.Parse(item);
                var values = attributesAsJObject.ToObject<Dictionary<string, object>>();
                foreach (string key in values.Keys)
                {
                    if (!toReturn.Any(x => x == key))
                        toReturn.Add(key);
                }
            }
            var table = new DataTable();

            foreach (var item in toReturn)
            {
                table.Columns.Add(item, typeof(string));
            }
            foreach (var item in jsonArray)
            {
                var attributesAsJObject = JObject.Parse(item);
                var values = attributesAsJObject.ToObject<Dictionary<string, object>>();
                var row = table.NewRow();
                foreach (var c in table.Columns)
                {
                    if (values.Any(x => x.Key == c.ToString()))
                        row[c.ToString()] = values[c.ToString()];
                }
                table.Rows.Add(row);
            }
            return table;
        }

        private void FillResponseTime(Stopwatch watch)
        {
            watch.Stop();

            var timeElapsed = watch.Elapsed;
            var duration = Convert.ToDecimal(watch.ElapsedMilliseconds / 1000M);
            if (duration < 7) return;
            var url = Request.RequestUri.AbsoluteUri;
            var empId = GetEmpIdFromRequest(Request);
            try
            {
                Cldb.API_RESPONSE_DURATION.Add(new Model.AllSys.API_RESPONSE_DURATION
                {
                    duration = duration,
                    CREATED_BY = empId,
                    CREATED_DATE = DateTime.Now,
                    URL = url,
                    CONTENT = Request.Content.ReadAsStringAsync().Result,
                });
                Cldb.Commit(CanCommit);
            }
            catch (Exception ex)
            {

                Logger l = new Logger(Request, ex);
            }

        }

        private string GetEmpIdFromRequest(HttpRequestMessage request)
        {
            var result = "Logger";
            if (request == null) return result;
            if (request.Headers.Contains("empId"))
            {
                try
                {
                    return request.Headers.GetValues("empId").ToList()[0];
                }
                catch { }
            }

            return result;
        }

        private void CheckUserHasAccess(string empId, string custId, string projId, IEnumerable<ProjectBase> projects = null)
        {
            // return Content(HttpStatusCode.Conflict, $"There are no resources allocated for the selected project -{projectName}. Please make sure allocations are added to choose Auditees.");
            if (IsGavs(empId))
            {
                if (projects == null)
                    projects = Cldb.AppRepo.GetProjectIdsForUser(empId, custId, "");

                //projects = Cldb.AppRepo.Projects(empId, "");

                if (!string.IsNullOrWhiteSpace(custId) && string.IsNullOrWhiteSpace(projId))
                {
                    if (!projects.Any(x => x.CUST_ID == custId))
                    {
                        var cust = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == custId)?.CUST_NM;
                        throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Authorization Issue: Access to information related to account ({custId}) not allowed for the employee ({empId})."));

                    }

                }
                else if (!string.IsNullOrEmpty(projId))
                {
                    if (!projects.Any(x => x.PROJ_ID == projId))
                    {
                        throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Authorization Issue: Access to information related to Project ({projId}) not allowed for the employee ({empId})."));

                    }
                }

            }

        }

        private void CheckAccessForFeature(int resourceId)
        {
            string empId = this.GetHeaderDetails_String("empId");
            //string iEmpId;
            //if (int.TryParse(empId, out iEmpId))

            var role = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId)?.CSM_TITLE_ID;
            if (role.HasValue)
            {
                var access = CSPdb.APP_ACCESS_CONTROLS.GetAll().Where(t => t.RESOURCE_ID == resourceId && (t.VIEW_ACCESS || t.CREATE_ACCESS || t.EDIT_ACCESS || t.DELETE_ACCESS) && (t.ROLE_ID == role.Value || t.EMP_ID.Contains(empId)) && t.ISACTIVE == true)
                            .ToList<APP_ACCESS_CONTROLS>();
                if (!access.Any())
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Authorization Issue: Access to information related to this page not allowed for the employee ({empId})."));

                }

            }

            //customer login - Logic to be updated
            else
            {

            }
        }
        private void SendUpdateMail<T>(T oldObj, T newObj, PROJECT project, Tuple<string, string>[] fieldNameWithCaptionList, string mailSubject) where T : GAVS.AllocationSystem.Model.Base.EntityBase, new()

        {

            var updateSetting = helper.GetProjectConfigurationDataForSetting("SKIP_UPDATE_NOTIFICATIONS", project.PROJ_ID);

            if (updateSetting.Bit_Value == true)
            {
                return;
            }
            // find csm, pm, quality spoc of the project
            var mails = helper.getProjectResposnibleMailIds(project, true, true, true);

            var toMail = string.Join(",", mails);
            // read the properties of both old and new objects
            var oldProperties = oldObj.GetType().GetProperties();
            var newProperties = newObj.GetType().GetProperties();
            // loop through the fieldnames array and build each line of <tr>
            var sb = new StringBuilder();
            bool isChangeThere = false;
            foreach (var item in fieldNameWithCaptionList)
            {
                var oldProp = GetPrintValue(oldProperties.First(x => x.Name == item.Item2).GetValue(oldObj, null), item.Item2);
                var newProp = GetPrintValue(newProperties.First(x => x.Name == item.Item2).GetValue(newObj, null), item.Item2);
                if (string.IsNullOrWhiteSpace(oldProp) && string.IsNullOrWhiteSpace(newProp))
                    continue;

                sb.Append("<tr>");
                sb.Append($"<td>{item.Item1}</td>");
                if (oldProp != newProp)
                {
                    sb.Append($"<td style=\"color:#FF0000\">{oldProp} </td>");
                    isChangeThere = true;
                }
                else
                    sb.Append($"<td>{oldProp} </td>");
                sb.Append($"<td>{newProp} </td>");
                sb.Append("</tr>");
                //sb.AppendLine();

            }
            if (!isChangeThere) return;
            // substitute the values in template file and send the mail. EntityUpdateInfo.htm
            var stringValue = sb.ToString();
            Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
            EmailContentValues.Add("PROJECT", project.PROJ_NM);
            EmailContentValues.Add("CONTENT", stringValue);
            var mailContent = helper.GetEmailContent("EntityUpdateInfo.htm", EmailContentValues);
            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
            (
            new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
            new EmailContent { from = _email, to = toMail, cc = "", bcc = Constants.BCC, content = mailContent, subject = mailSubject, hasAttachments = false, attachmentFilePath = "" },
            Request
            )) ;

        }

        private string GetPrintValue(object obj, string propertyName)
        {
            var result = string.Empty;
            if (obj == null) return result;
            if (propertyName.ToLower().EndsWith("date"))
                result = ((DateTime)obj).ToString(_dateformat);
            else if (propertyName.ToLower().EndsWith("by"))

            {
                var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == obj.ToString());
                if (emp != null)
                    result = emp.FRST_NM;
                else
                    result = obj.ToString();
            }
            else
                result = obj.ToString();
            return result;
        }


        private PROJECT_ACTIONITEM CreateActionItem(string custId, string projId, int batchId, string batchType, DateTime targetDate, int id, string pmName)
        {
            var actionItem = new PROJECT_ACTIONITEM
            {
                CUSTOMER_ID = custId,
                PROJECT_ID = projId,
                RAG = "Red",
                DESCRIPTION = "Customer success/satisfaction level would not be known in the absence of customer feedback on the service delivered in the last quarter may lead to missed opportunities for improvement and potential loss of business from the customer.",
                SOURCE = "Risk",
                OWNER = pmName,
                IDENTIFIED_DATE = DateTime.Now,
                TARGET_DATE = targetDate,
                STATUS = "Identified",
                PRIORITY = "High",
                COMMENTS = "",
                BATCH_CUSTOMER_ID = batchType == "batch" ? batchId : 0,
                BATCH_CUSTOMER_MONTHLY_ID = batchType == "batchmonthly" ? batchId : 0,
                RISK_ID = id
            };
            UpdateAuditFields(actionItem);
            CSPdb.PROJECT_ACTIONITEM.Add(actionItem);
            return actionItem;
        }

    }
    public partial class AuthController
    {

        public override bool CanCommit
        {
            get { return true; }
        }

        private void FillResponseTime(Stopwatch watch, string empid)
        {

            var timeElapsed = watch.Elapsed;

            var url = Request.RequestUri.AbsoluteUri;

            Cldb.API_RESPONSE_DURATION.Add(new Model.AllSys.API_RESPONSE_DURATION
            {
                duration = Convert.ToDecimal(timeElapsed.TotalSeconds),
                CREATED_BY = !string.IsNullOrWhiteSpace(empid) ? empid : GetEmpIdFromRequest(Request),
                CREATED_DATE = DateTime.Now,
                URL = url
            });
            Cldb.Commit();
        }

        private string GetEmpIdFromRequest(HttpRequestMessage request)
        {
            var result = "Logger";
            if (request == null) return result;
            if (request.Headers.Contains("empId"))
            {
                try
                {
                    return request.Headers.GetValues("empId").ToList()[0];
                }
                catch { }
            }

            return result;
        }
    }

    public class CRISP_PROJECT_CRITERIA_Compare : IEqualityComparer<CRISP_PROJECT_CRITERIA>
    {
        public bool Equals(CRISP_PROJECT_CRITERIA x, CRISP_PROJECT_CRITERIA y)
        {
            if (x.CRITERIA_ID == y.CRITERIA_ID)
            {
                return true;
            }
            else { return false; }
        }
        public int GetHashCode(CRISP_PROJECT_CRITERIA codeh)
        {
            return 0;
        }
    }


}