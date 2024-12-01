using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        #region ProjectConfigurationSetting

        [GET("GetAllProjectConfigurationSettings")]
        [ActionName("GetAllProjectConfigurationSettings")]
        [HttpGet]
        public IHttpActionResult GetAllProjectConfigurationSettings()
        {
            List<PROJECT_CONFIGURATION_SETTING> result = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().Where(x => x.isActive).ToList();
            return Ok(result);
        }

        [POST("AddProjectConfigurationSetting")]
        [ActionName("AddProjectConfigurationSetting")]
        [HttpPost]
        public IHttpActionResult AddProjectConfigurationSetting(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;

            dynamic json = jsonContent;
            var results = JsonConvert.DeserializeObject<PROJECT_CONFIGURATION_SETTING>(json);

            string empId = GetHeaderDetails_String("empId");

            PROJECT_CONFIGURATION_SETTING projSetting = new PROJECT_CONFIGURATION_SETTING();

            if (results != null)
            {
                projSetting.Setting_Name = results.Setting_Name;
                projSetting.Setting_Key = results.Setting_Name.Replace(" ", "_");
                projSetting.Setting_Type = results.Setting_Type;
                projSetting.Min_Threshhold = results.Min_Threshhold;
                projSetting.Max_Threshhold = results.Max_Threshhold;
                projSetting.Values_Collection = results.Values_Collection;
                projSetting.isActive = true;
                projSetting.Created_Date = DateTime.Now;
                projSetting.Created_By = empId;
                projSetting.Updated_Date = DateTime.Now;
                projSetting.Updated_By = empId;

                CSPdb.PROJECT_CONFIGURATION_SETTING.Add(projSetting);
                CSPdb.Commit(CanCommit);
            }
            return Ok(projSetting);

        }


        [POST("UpdateProjectConfigurationSetting")]
        [ActionName("UpdateProjectConfigurationSetting")]
        [HttpPost]
        public IHttpActionResult UpdateProjectConfigurationSetting([FromBody] PROJECT_CONFIGURATION_SETTING projSetting)
        {
            if (projSetting != null)
            {
                string empId = GetHeaderDetails_String("empId");
                var record = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == projSetting.Id);

                if (record != null)
                {
                    // record.Setting_Name = projSetting.Setting_Name;
                    record.Setting_Type = projSetting.Setting_Type;
                    record.Min_Threshhold = projSetting.Min_Threshhold;
                    record.Max_Threshhold = projSetting.Max_Threshhold;
                    record.Values_Collection = projSetting.Values_Collection;
                    record.Updated_By = empId;
                    record.Updated_Date = DateTime.Now;

                    CSPdb.PROJECT_CONFIGURATION_SETTING.Update(record);
                    CSPdb.Commit(CanCommit);
                }
            }
            return Ok(projSetting);
        }

        #endregion


        #region ProjectConfigurationData

        [GET("GetProjectConfigurationData")]
        [ActionName("GetProjectConfigurationData")]
        [HttpGet]
        public IHttpActionResult GetProjectConfigurationData(string projID)
        {
            List<PROJECT_CONFIGURATION_DATA> projData = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll().Where(x => x.Proj_Id == projID).ToList();
            foreach (var item in projData)
            {
                int id = 0;

                if (int.TryParse(item.Approved_By, out id))
                    item.Approved_By_Name = GetEmployeeNamebyId(item.Approved_By);
            }
            return Ok(projData);
        }


        [POST("AddProjectConfigurationData")]
        [ActionName("AddProjectConfigurationData")]
        [HttpPost]
        public IHttpActionResult AddProjectConfigurationData(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            var newrecord = JsonConvert.DeserializeObject<PROJECT_CONFIGURATION_DATA>(json);

            PROJECT_CONFIGURATION_DATA projData = new PROJECT_CONFIGURATION_DATA();
            PROJECT_CONFIGURATION_SETTING data = projData.PROJECT_CONFIGURATION_SETTING;


            if (newrecord != null)
            {
                //string empId = Request.Headers.GetValues("empId").ToList()[0];
                string empId = GetHeaderDetails_String("empId");

                //int settingType = Convert.ToInt32(GetHeaderDetails_String("settingType"));
                string settingValue = string.Empty;

                projData.Cust_Id = newrecord.Cust_Id;
                projData.Proj_Id = newrecord.Proj_Id;
                projData.Configuration_Setting_Id = newrecord.Configuration_Setting_Id;


                string settingName = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == projData.Configuration_Setting_Id)?.Setting_Name;
                int? settingType = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == projData.Configuration_Setting_Id)?.Setting_Type;

                var mainUrl = $"{helper.GetAbsoulteUri()}/layout/projectdataconfigurationApproval/{projData.Cust_Id}/{projData.Proj_Id}/{projData.Configuration_Setting_Id}/";
                string approveUrl = mainUrl + "1";

                string rejectUrl = mainUrl + "0";

                if (settingType == 1)
                {//Integer
                    projData.Int_Value = newrecord.Int_Value;
                    settingValue = Convert.ToString(projData.Int_Value);
                }
                else if (settingType == 2)//String
                {
                    projData.String_Value = newrecord.String_Value;
                    settingValue = projData.String_Value;
                }
                else if (settingType == 3)//Bool
                {
                    projData.Bit_Value = newrecord.Bit_Value;
                    settingValue = projData.Bit_Value.Value ? "Yes" : "No";
                }

                projData.Comments = newrecord.Comments;




                projData.End_date = newrecord.End_date;
                //if (projData.End_date.HasValue)
                //    projData.End_date = projData.End_date.Value.ToLocalTime();

                //projData.Approved_By = newrecord.Approved_By;                
                //projData.Approval_Comments = newrecord.Approval_Comments;

                projData.Is_Approved = false;
                projData.ISACTIVE = true;
                projData.CREATED_DATE = DateTime.Now;
                projData.CREATED_BY = empId;
                projData.UPDATED_DATE = DateTime.Now;
                projData.UPDATED_BY = empId;

                CSPdb.PROJECT_CONFIGURATION_DATA.Add(projData);

                CSPdb.Commit(CanCommit);

                //Approval Call Section goes here


                //send mail

                var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projData.Proj_Id);

                if (project == null)
                    return Ok(projData);



                //var projects = Cldb.PROJECT.GetAll().Where(t => t.CUST_ID == projData.Cust_Id).ToList();

                var csmMails = new List<string>();// ;
                var pmMails = new List<string>();
                var spoc = new List<string>();
                var createrMailId = new List<string>();
                string personNM = string.Empty;

                //foreach (var item in projects)
                //{
                csmMails.Add(helper.GetCSMMailsFromProject(project));
                pmMails.AddRange(helper.GetPMFromProject(project));
                spoc.Add(helper.GetQualitySpocMailForProject(project));
                createrMailId.Add(helper.GetEmployeeMailId(empId));
                //}

                var approvers = helper.GetDBConfig("PROJECTSETTING_APPROVERS", "-1").Split(',').ToList();
                personNM = helper.GetEmployeeNames(approvers).ToString();
                var toList = new List<string>();
                foreach (var item in approvers)
                {
                    toList.Add(helper.GetEmployeeMailId(item));

                }
                string tomail = string.Join(",", toList);
                string ccmail = string.Join(",", spoc.Union(csmMails).Union(pmMails).Union(createrMailId).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray());



                string statusMsg = string.Empty;

                string customerName = string.Empty;
                string projectName = string.Empty;

                var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
                customerName = customer?.CUST_NM;
                projectName = project.PROJ_NM;

                string subject = $"New Project Setting Data Added : {customerName}";

                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("PROJECT NAME", projectName);
                EmailContentValues.Add("SETTING NAME", settingName);
                EmailContentValues.Add("SETTING VALUE", settingValue);
                EmailContentValues.Add("COMMENTS", projData.Comments);
                EmailContentValues.Add("END DATE", projData.End_date.HasValue ? projData.End_date.Value.ToLocalTime().ToString("dd-MMM-yyyy") : "-");
                EmailContentValues.Add("CREATED BY", GetEmployeeNamebyId(projData.CREATED_BY));
                EmailContentValues.Add("CREATED DATE", projData.CREATED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
                EmailContentValues.Add("Approve", approveUrl);
                EmailContentValues.Add("Reject", rejectUrl);
                EmailContentValues.Add("PERSONNM", personNM);


                string mailContent = helper.GetEmailContent("ProjectDataOnAddition.htm", EmailContentValues);
                var ep = new EmailProvider(Cldb, CSPdb);
                if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                    Request
                    );


            }
            return Ok(projData);
        }

        [POST("AddProjectConfigurationDataMultiple")]
        [ActionName("AddProjectConfigurationDataMultiple")]
        [HttpPost]
        public IHttpActionResult AddProjectConfigurationDataMultiple(HttpRequestMessage request)
        {
            var content = request.Content;
            string jsonContent = content.ReadAsStringAsync().Result;
            dynamic json = jsonContent;
            List<PROJECT_CONFIGURATION_DATA> newrecords = JsonConvert.DeserializeObject<List<PROJECT_CONFIGURATION_DATA>>(json);


            //validations
            PerformConfigurationDataValidations(newrecords);
            string empId = GetHeaderDetails_String("empId");
            var firstNewRecord = newrecords.First();
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == firstNewRecord.Proj_Id);
            var settingType = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == firstNewRecord.Configuration_Setting_Id)?.Setting_Type;
            if (project == null)
                return Ok(newrecords);

            string customerName = string.Empty;
            string projectName = string.Empty;

            var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;

            string subject = $"{projectName} - Project Setting Data Added";

            var addedRecords = new List<PROJECT_CONFIGURATION_DATA>();

            foreach (var newrecord in newrecords)

            {
                var projData = new PROJECT_CONFIGURATION_DATA();
                addedRecords.Add(projData);

                projData.Cust_Id = newrecord.Cust_Id;
                projData.Proj_Id = newrecord.Proj_Id;
                projData.Configuration_Setting_Id = newrecord.Configuration_Setting_Id;

                string settingValue = string.Empty;
                
                if (settingType == 1)
                {
                    projData.Int_Value = newrecord.Int_Value;
                }
                else if (settingType == 2)//String
                {
                    projData.String_Value = newrecord.String_Value;
                }
                else if (settingType == 3)//Bool
                {
                    projData.Bit_Value = newrecord.Bit_Value;
                }
                settingValue = GetSettingValue(projData, settingType);
                projData.Comments = newrecord.Comments;
                projData.End_date = newrecord.End_date;
                projData.Is_Approved = false;
                UpdateAuditFields(projData);
                CSPdb.PROJECT_CONFIGURATION_DATA.Add(projData);

            }
            CSPdb.Commit(CanCommit);

            var csmMails = new List<string>();// ;
            var pmMails = new List<string>();
            var spoc = new List<string>();
            var createrMailId = new List<string>();
            string personNM = string.Empty;

            csmMails.Add(helper.GetCSMMailsFromProject(project));
            pmMails.AddRange(helper.GetPMFromProject(project));
            spoc.Add(helper.GetQualitySpocMailForProject(project));
            createrMailId.Add(helper.GetEmployeeMailId(empId));

            var approvers = helper.GetDBConfig("PROJECTSETTING_APPROVERS", "-1").Split(',').ToList();
            personNM = helper.GetEmployeeNames(approvers).ToString();
            var toList = new List<string>();
            foreach (var item in approvers)
            {
                toList.Add(helper.GetEmployeeMailId(item));

            }
            string tomail = string.Join(",", toList);
            string ccmail = string.Join(",", spoc.Union(csmMails).Union(pmMails).Union(createrMailId).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray());

            string statusMsg = string.Empty;
            var ep = new EmailProvider(Cldb, CSPdb);
            var employeeName = GetEmployeeNamebyId(firstNewRecord.CREATED_BY);
            var configSettingIds = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().ToList();
            foreach (var projData in addedRecords)
            {                
                string settingName = configSettingIds.FirstOrDefault(x => x.Id == projData.Configuration_Setting_Id)?.Setting_Name;               
                var mainUrl = $"{helper.GetAbsoulteUri()}/layout/projectdataconfigurationApproval/{projData.Cust_Id}/{projData.Proj_Id}/{projData.Configuration_Setting_Id}/";
                string approveUrl = mainUrl + "1";

                string rejectUrl = mainUrl + "0";

                string settingValue = string.Empty;

                settingValue = GetSettingValue(projData, settingType);

                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("PROJECT NAME", projectName);
                EmailContentValues.Add("SETTING NAME", settingName);
                EmailContentValues.Add("SETTING VALUE", settingValue);
                EmailContentValues.Add("COMMENTS", projData.Comments);
                EmailContentValues.Add("END DATE", projData.End_date.HasValue ? projData.End_date.Value.ToLocalTime().ToString("dd-MMM-yyyy") : "-");
                //todo: move outside loop - anways all created_by will be the same employee only
                EmailContentValues.Add("CREATED BY", employeeName);
                EmailContentValues.Add("CREATED DATE", projData.CREATED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
                EmailContentValues.Add("Approve", approveUrl);
                EmailContentValues.Add("Reject", rejectUrl);
                EmailContentValues.Add("PERSONNM", personNM);

                string mailContent = helper.GetEmailContent("ProjectDataOnAddition.htm", EmailContentValues);

                if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                    Request
                    );
            }
            return Ok(newrecords);
        }

        private string GetSettingValue(PROJECT_CONFIGURATION_DATA projData, int? settingType)
        {
            var settingValue = string.Empty;
            if (settingType == 1)//Integer
            {

                settingValue = projData.Int_Value.ToString();
            }
            else if (settingType == 2)//String
            {
                settingValue = projData.String_Value;
            }
            else if (settingType == 3)//Bool
            {

                settingValue = projData.Bit_Value.Value ? "Yes" : "No";
            }

            return settingValue;
        }

        private void PerformConfigurationDataValidations(List<PROJECT_CONFIGURATION_DATA> newrecords)
        {

            if (newrecords.Any())
            {
                var firstRecord = newrecords.First();
                var projectId = firstRecord.Proj_Id;
                var configSettingId = firstRecord.Configuration_Setting_Id;

                var configSettingIds = newrecords.Select(x => x.Configuration_Setting_Id).ToList();
                var configSettings = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().Where(x => configSettingIds.Contains(x.Id)).ToList();
                var firstSettingType = configSettings.FirstOrDefault(x => x.Id == configSettingId)?.Setting_Type;
                var existingRecords = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll().Where(t => t.Proj_Id == projectId);
                var conflictingSettings = newrecords.Where(y => existingRecords.Any(x => x.Configuration_Setting_Id == y.Configuration_Setting_Id)).ToList();
                //To Get existing Setting name                
                if (conflictingSettings.Count > 0)
                {
                    var conflictSettingNames = configSettings.Where(x => conflictingSettings.Any(y => y.Configuration_Setting_Id == x.Id)).Select(s => s.Setting_Name).ToList();
                    if (conflictSettingNames.Any())
                    {
                        string conflictingSettingNames = string.Join(", ", conflictSettingNames);
                        throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Selected Setting(s) '{conflictingSettingNames}' is/are already being used for the project."));
                    }
                }
                //todo: Check all reocrds having same project ID
                bool projResults = newrecords.TrueForAll(x => x.Proj_Id == projectId);
                if (!projResults)
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Please select records with same Project."));
                }
                //todo: Check all reocrds having same setting type
                var settingTypes = configSettings.Select(x => x.Setting_Type).ToList();
                bool settingResults = settingTypes.TrueForAll(x => x == firstSettingType);

                if (!settingResults)
                {
                    throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"Please select Configuration settings with same Setting type."));
                }

            }
            else
            {
                throw new HttpResponseException(this.Request.CreateResponse(System.Net.HttpStatusCode.BadRequest, $"No record is selected"));
            }
        }

        [POST("UpdateProjectConfigurationData")]
        [ActionName("UpdateProjectConfigurationData")]
        [HttpPost]
        public IHttpActionResult UpdateProjectConfigurationData([FromBody] PROJECT_CONFIGURATION_DATA projData)
        {
            if (projData != null)
            {
                PROJECT_CONFIGURATION_DATA existing; bool isReject = false;
                var empId = GetHeaderDetails_String("empId");

                var mainUrl = $"{helper.GetAbsoulteUri()}/layout/projectdataconfigurationApproval/{projData.Cust_Id}/{projData.Proj_Id}/{projData.Configuration_Setting_Id}/";

                string approveUrl = mainUrl + "1";

                string rejectUrl = mainUrl + "0";

                if (projData.ID == 0 && projData.Approval_Comments != null)
                {
                    List<PROJECT_CONFIGURATION_DATA> projData1 = CSPdb.PROJECT_CONFIGURATION_DATA.GetAll().Where(x => x.Proj_Id == projData.Proj_Id && x.Configuration_Setting_Id == projData.Configuration_Setting_Id).ToList();
                    existing = CSPdb.PROJECT_CONFIGURATION_DATA.GetById(projData1[0].ID);
                    isReject = !projData.isMailApproveReject ? true : false;

                }
                else
                {
                    // Update
                    existing = CSPdb.PROJECT_CONFIGURATION_DATA.GetById(projData.ID);
                    PROJECT_CONFIGURATION_SETTING data = projData.PROJECT_CONFIGURATION_SETTING;
                    isReject = false;
                }

                if (existing == null) return Ok(projData);

                if (existing.Is_Approved.GetValueOrDefault() && projData.Is_Approval && IsGavs(empId))
                {
                    return Content(HttpStatusCode.Conflict, "Already approved.");
                }
                //newData.Id = projData.
                //newData.Cust_Id = projData.Cust_Id;
                //newData.Proj_Id = projData.Proj_Id;
                //newData.Configuration_Setting_Id = projData.Configuration_Setting_Id;

                string settingName = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == projData.Configuration_Setting_Id)?.Setting_Name;
                int? settingType = CSPdb.PROJECT_CONFIGURATION_SETTING.GetAll().FirstOrDefault(x => x.Id == projData.Configuration_Setting_Id)?.Setting_Type;


                if (projData.Is_Approval)
                {
                    if (projData.Is_Approved.GetValueOrDefault())
                    {
                        existing.Approval_Comments = projData.Approval_Comments;
                        existing.Approved_By = empId;
                        existing.Is_Approved = true;
                    }
                    else
                    {
                        existing.Is_Approved = false;
                        existing.Approval_Comments = null;
                        existing.Approved_By = null;
                    }
                }
                else
                {

                    if (projData.End_date.HasValue)
                        existing.End_date = projData.End_date.Value.ToLocalTime();
                    //re initiate approval 
                    existing.Is_Approved = false;
                    existing.Approval_Comments = projData.Approval_Comments;
                    existing.Approved_By = null;



                }
                existing.Comments = projData.Comments == null ? existing.Comments : projData.Comments;
                existing.ISACTIVE = true;
                existing.UPDATED_DATE = DateTime.Now;
                existing.UPDATED_BY = empId;
                if (settingType == 1) //Integer
                {
                    existing.Int_Value = projData.Int_Value;
                    existing.Bit_Value = null;
                    existing.String_Value = null;

                }
                else if (settingType == 2) //String
                {
                    existing.String_Value = projData.String_Value;
                    existing.Bit_Value = null;
                    existing.Int_Value = null;
                }
                else if (settingType == 3) //Bool
                {
                    existing.Bit_Value = projData.Bit_Value;
                    existing.Int_Value = null;
                    existing.String_Value = null;

                }

                CSPdb.PROJECT_CONFIGURATION_DATA.Update(existing);
                CSPdb.Commit(CanCommit);

                SendMailOnUpdate(existing, projData.Is_Approval, settingName, isReject);

            }

            return Ok(projData);
        }

        [GET("GetProjectDataConfigurationValues")]
        [ActionName("GetProjectDataConfigurationValues")]
        [HttpGet]
        public IHttpActionResult GetProjectDataConfigurationValues(string settingVal, string custId, string projId)
        {
            var settingKeys = new List<string>() { settingVal };
            var projectList = helper.GetProjectConfigurationDataForSetting(settingKeys).Where(x => x.Bit_Value == true).Select(x => x.Proj_Id).Distinct().ToList();
            return Ok(projectList);
        }

        private void SendMailOnUpdate(PROJECT_CONFIGURATION_DATA projData, bool isApproval, string settingName, bool isReject)
        {

            var project = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projData.Proj_Id);

            if (project == null)
                return;

            var csmMails = new List<string>();
            var pmMails = new List<string>();
            var spoc = new List<string>();
            var createrMailId = new List<string>();
            string personNM = string.Empty;

            csmMails.Add(helper.GetCSMMailsFromProject(project));
            pmMails.AddRange(helper.GetPMFromProject(project));
            spoc.Add(helper.GetQualitySpocMailForProject(project));
            createrMailId.Add(helper.GetEmployeeMailId(projData.CREATED_BY));

            var approvers = helper.GetDBConfig("PROJECTSETTING_APPROVERS", "-1").Split(',').ToList();
            personNM = helper.GetEmployeeNames(approvers).ToString();
            var toList = new List<string>();
            foreach (var item in approvers)
            {
                toList.Add(helper.GetEmployeeMailId(item));
            }

            string statusMsg = string.Empty;
            string customerName = string.Empty;
            string projectName = string.Empty;

            var mainUrl = $"{helper.GetAbsoulteUri()}/layout/projectdataconfigurationApproval/{projData.Cust_Id}/{projData.Proj_Id}/{projData.Configuration_Setting_Id}/";
            string approveUrl = mainUrl + "1";

            string rejectUrl = mainUrl + "0";

            var customer = Cldb.CUSTOMER.GetAll().FirstOrDefault(t => t.CUST_ID == project.CUST_ID);
            customerName = customer?.CUST_NM;
            projectName = project.PROJ_NM;



            string tomail = string.Join(",", toList);
            string ccmail = string.Join(",", spoc.Union(csmMails).Union(pmMails).Union(createrMailId).Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray());

            if (!isApproval)
            {
                string mailContent = "";

                string subject = "";

                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("PROJECT NAME", projectName);
                EmailContentValues.Add("SETTING NAME", settingName);

                if (projData.Int_Value != null)
                    EmailContentValues.Add("SETTING VALUE", Convert.ToString(projData.Int_Value));
                else if (!string.IsNullOrWhiteSpace(projData.String_Value))
                    EmailContentValues.Add("SETTING VALUE", projData.String_Value);
                else if (projData.Bit_Value.HasValue)
                    EmailContentValues.Add("SETTING VALUE", projData.Bit_Value.Value ? "Yes" : "No");


                EmailContentValues.Add("END DATE", projData.End_date.HasValue ? projData.End_date.Value.ToLocalTime().ToString("dd-MMM-yyyy") : "-");
                EmailContentValues.Add("UPDATED BY", GetEmployeeNamebyId(projData.UPDATED_BY));
                EmailContentValues.Add("UPDATED DATE", projData.UPDATED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
                EmailContentValues.Add("PERSONNM", personNM);

                if (isReject)
                {
                    EmailContentValues.Add("COMMENTS", projData.Approval_Comments);
                    subject = $"Project Setting Data Rejected : {customerName}";
                    mailContent = helper.GetEmailContent("ProjectDataRejected.htm", EmailContentValues);

                }
                else
                {
                    subject = $"Project Setting Data Updated : {customerName}";
                    EmailContentValues.Add("COMMENTS", projData.Comments);
                    EmailContentValues.Add("Approve", approveUrl);
                    EmailContentValues.Add("Reject", rejectUrl);
                    mailContent = helper.GetEmailContent("ProjectDataOnUpdate.htm", EmailContentValues);
                }

                var ep = new EmailProvider(Cldb, CSPdb);
                if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                    Request
                    );
            }
            else
            {
                string subject = $"Project Setting Data Approved : {customerName}";

                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("PROJECT NAME", projectName);
                EmailContentValues.Add("SETTING NAME", settingName);

                if (projData.Int_Value != null)
                    EmailContentValues.Add("SETTING VALUE", Convert.ToString(projData.Int_Value));
                else if (!string.IsNullOrWhiteSpace(projData.String_Value))
                    EmailContentValues.Add("SETTING VALUE", projData.String_Value);
                else if (projData.Bit_Value.HasValue)
                    EmailContentValues.Add("SETTING VALUE", projData.Bit_Value.Value ? "Yes" : "No");

                EmailContentValues.Add("END DATE", projData.End_date.HasValue ? projData.End_date.Value.ToLocalTime().ToString("dd-MMM-yyyy") : "-");
                EmailContentValues.Add("COMMENTS", projData.Comments);
                EmailContentValues.Add("APPROVED BY", GetEmployeeNamebyId(projData.Approved_By));
                EmailContentValues.Add("APPROVED DATE", projData.UPDATED_DATE.ToLocalTime().ToString("dd-MMM-yyyy"));
                EmailContentValues.Add("PERSONNM", personNM);

                string mailContent = helper.GetEmailContent("ProjectDataApproved.htm", EmailContentValues);

                var ep = new EmailProvider(Cldb, CSPdb);
                if (string.IsNullOrWhiteSpace(tomail)) tomail = _email;
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = tomail, cc = ccmail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "", ProjId = project.PROJ_ID },
                    Request
                    );
            }

        }

        #endregion       

    }
}