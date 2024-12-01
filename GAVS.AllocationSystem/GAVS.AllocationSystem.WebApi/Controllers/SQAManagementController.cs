using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [POST("AddServiceAreaNew")]
        [ActionName("AddServiceAreaNew")]
        [HttpPost]
        public IHttpActionResult AddServiceAreaNew([FromBody] PROCESS_SERVICE_AREA_NEW results)
        {
            List<PROCESS_SERVICE_AREA_NEW> checkExists = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => x.TITLE == results.TITLE && x.ISACTIVE == true).ToList();
            if (checkExists.Any())
            {
                return Content(HttpStatusCode.BadRequest, "This Service Tower exists already, so it cannot be added.");
            }
            else
            {
                UpdateAuditFields(results);
                CSPdb.PROCESS_SERVICE_AREA_NEW.Add(results);
                CSPdb.Commit(CanCommit);
                return Ok(results);
            }
        }

        [POST("UpdateServiceAreaNew")]
        [ActionName("UpdateServiceAreaNew")]
        [HttpPost]
        public IHttpActionResult UpdateServiceAreaNew([FromBody] PROCESS_SERVICE_AREA_NEW results)
        {
            List<PROCESS_SERVICE_AREA_NEW> checkExists = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().Where(x => x.TITLE == results.TITLE && x.ID != results.ID && x.ISACTIVE == true).ToList();
            if (checkExists.Any())
            {
                return Content(HttpStatusCode.BadRequest, "This Service Tower exists already, so it cannot be updated.");
            }

            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> checkList = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.SERVICE_AREA_ID == results.ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();
            if (checkList.Any())
            {
                return Content(HttpStatusCode.BadRequest, "This Service Tower used in Assessment checklist that has been submitted to appraisee, so it cannot be modified.");
            }
            else
            {
                if (results != null)
                {
                    var overview = CSPdb.PROCESS_SERVICE_AREA_NEW.GetAll().FirstOrDefault(x => x.ID == results.ID && x.ISACTIVE == true);

                    //var oldItem = new PROCESS_SERVICE_AREA_NEW
                    //{
                    //    TITLE = overview.TITLE,
                    //    DESCRIPTION = overview.DESCRIPTION
                    //};

                    overview.TITLE = results.TITLE;
                    overview.DESCRIPTION = results.DESCRIPTION;
                    UpdateAuditFields(overview);
                    CSPdb.PROCESS_SERVICE_AREA_NEW.Update(overview);
                    CSPdb.Commit(CanCommit);
                    //SendServiceAreaUpdateNotification(oldItem, overview);
                    return Ok(results);
                }

                return Content(HttpStatusCode.BadRequest, "Invalid Data!");
            }
        }

        //private void SendProcessModelUpdateNotification(PROCESS_MODEL oldItem, PROCESS_MODEL newItem)
        //{
        //    var toMail = helper.GetDBConfig("DATA_UPDATE_NOTIFY_MAIL_TO", "-1");
        //    var baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
        //    var url = baseUrl + "/sqamanagement";
        //    var values = new List<Tuple<string, string, string>>{
        //         new Tuple<string, string, string>("Title", oldItem.TITLE, newItem.TITLE),
        //         new Tuple<string, string, string>("Description", oldItem.DESCRIPTION, newItem.DESCRIPTION),
        //         new Tuple<string, string, string>("Version", oldItem.RELEASE_VERSION_REFERENCE, newItem.RELEASE_VERSION_REFERENCE),
        //         new Tuple<string, string, string>("Release Date", oldItem.RELEASE_DATE.ToString("MMM dd, yyyy"), newItem.RELEASE_DATE.ToString("MMM dd, yyyy"))
        //        };
        //    SendDataUpdateNotification(values, url, "Process Model", oldItem.TITLE, toMail, string.Empty);
        //}

        //private void SendServiceAreaUpdateNotification(PROCESS_SERVICE_AREA_NEW oldItem, PROCESS_SERVICE_AREA_NEW newItem)
        //{
        //    var toMail = helper.GetDBConfig("DATA_UPDATE_NOTIFY_MAIL_TO", "-1");
        //    var baseUrl = HttpContext.Current.Request.UrlReferrer.AbsoluteUri.Replace("css", "");
        //    var url = baseUrl + "/sqamanagement";
        //    var values = new List<Tuple<string, string, string>>{
        //         new Tuple<string, string, string>("Title", oldItem.TITLE, newItem.TITLE),
        //         new Tuple<string, string, string>("Description", oldItem.DESCRIPTION, newItem.DESCRIPTION)
        //        };
        //    SendDataUpdateNotification(values, url, "Service Tower", oldItem.TITLE, toMail, string.Empty);
        //}


        private void SendServiceTowerProcessAreaMapUpdateNotification(List<AllProcessByServiceAreaList> oldMappings, List<AllProcessByServiceAreaList> newMappings, string title, string updatedBy)
        {
            StringBuilder sbNew = new StringBuilder();
            newMappings = newMappings.OrderBy(x => x.PROCESS_AREA).ThenBy(x => x.PROCESS_TITLE).ThenBy(x => x.PROCESS_DESCRIPTION).ToList();
            oldMappings = oldMappings.OrderBy(x => x.PROCESS_AREA).ThenBy(x => x.PROCESS_TITLE).ThenBy(x => x.PROCESS_DESCRIPTION).ToList();
            var rowCount = oldMappings.Count >= newMappings.Count ? oldMappings.Count : newMappings.Count;
            for (int i = 0; i < rowCount; i++)
            {
                sbNew.Append("<tr>");
                sbNew.Append($"<td>{(i + 1).ToString()}</td>");
                if (oldMappings.Count > i)
                {
                    sbNew.Append($"<td>{oldMappings[i].PROCESS_AREA.ToString()}</td>");
                    sbNew.Append($"<td>{oldMappings[i].PROCESS_TITLE.ToString()}</td>");
                    sbNew.Append($"<td>{oldMappings[i].PROCESS_DESCRIPTION.ToString()}</td>");
                }
                else
                {
                    sbNew.Append($"<td></td>");
                    sbNew.Append($"<td></td>");
                    sbNew.Append($"<td></td>");
                }
                if (newMappings.Count > i)
                {
                    sbNew.Append($"<td>{newMappings[i].PROCESS_AREA.ToString()}</td>");
                    sbNew.Append($"<td>{newMappings[i].PROCESS_TITLE.ToString()}</td>");
                    sbNew.Append($"<td>{newMappings[i].PROCESS_DESCRIPTION.ToString()}</td>");
                }
                else
                {
                    sbNew.Append($"<td></td>");
                    sbNew.Append($"<td></td>");
                    sbNew.Append($"<td></td>");
                }
                sbNew.Append("</tr>");
            }
            var toMail = helper.GetDBConfig("DATA_UPDATE_NOTIFY_MAIL_TO", "-1");
            var emp = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == updatedBy);
            var url = $"{helper.GetAbsoulteUri()}sqamanagement";

            SendMappingUpdateNotification(sbNew.ToString(), url, "Service Tower", title, toMail, emp.EMAIL_ID, emp.FRST_NM);
        }
        private void SendMappingUpdateNotification(string values, string url, string entity, String keyValue, string toMail, string ccMail, string updatedBy)
        {
            string subject = string.Empty;
            string statusMsg = string.Empty;
            string mailContent;
            StringBuilder sb = new StringBuilder();
            if (values != null)
            {
                subject = $"{entity}: {keyValue} - Update notification of applicable process area and process. ";
                Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
                EmailContentValues.Add("ENTITY_NAME", entity);
                EmailContentValues.Add("ENTITY_VALUE", keyValue);
                EmailContentValues.Add("URL", url);
                EmailContentValues.Add("TABLE_CONTENT", values);
                EmailContentValues.Add("UPDATED_BY", updatedBy);

                mailContent = helper.GetEmailContent("MappingUpdateNotification.htm", EmailContentValues);
                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail
                    (
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }
                    , Request
                    );
            }
        }

        //private void SendDataUpdateNotification(List<Tuple<string, string, string>> values, string url, string entity, String keyValue, string toMail, string ccMail)
        //{
        //    string subject = string.Empty;
        //    string statusMsg = string.Empty;
        //    string mailContent;
        //    StringBuilder sb = new StringBuilder();
        //    if (values != null)
        //    {
        //        subject = $"GAVS - Update Notification for {entity} : {keyValue}";

        //        foreach (var t in values)
        //        {
        //            sb.Append($"<tr><td>{t.Item1}</td><td>{t.Item2}</td><td>{t.Item3}</td></tr>");
        //        }

        //        Dictionary<string, string> EmailContentValues = new Dictionary<string, string>();
        //        EmailContentValues.Add("ENTITY_NAME", entity);
        //        EmailContentValues.Add("ENTITY_VALUE", keyValue);
        //        EmailContentValues.Add("URL", url);
        //        EmailContentValues.Add("TABLE_CONTENT", sb.ToString());

        //        mailContent = helper.GetEmailContent("DataUpdateNotification.htm", EmailContentValues);
        //        var ep = new EmailProvider(Cldb, CSPdb);
        //        ep.SendEmail
        //            (
        //            new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
        //            new EmailContent { from = _email, to = toMail, cc = ccMail, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" }
        //            , Request
        //            );
        //    }
        //}

        [POST("DeleteServiceAreaNew")]
        [ActionName("DeleteServiceAreaNew")]
        [HttpPost]
        public IHttpActionResult DeleteServiceAreaNew([FromBody] PROCESS_SERVICE_AREA_NEW results)
        {
            List<PM_PROCESS_QUESTIONS_MAPPING> lstQMapping = CSPdb.PM_PROCESS_QUESTIONS_MAPPING.GetAll().Where(x => x.SERVICE_AREA_ID == results.ID && x.ISACTIVE == true).ToList();
            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> lstAChecklist = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.SERVICE_AREA_ID == results.ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();
            var isMappedwithRiskRepository = Cldb.RISK_REPOSITORY2SERVICE_TOWER.GetAll().Where(x => x.SERVICE_TOWER_ID == results.ID).Any();
            var opMsg = CheckIfServiceTowerMappedToKpi(results.ID);
            if (!string.IsNullOrEmpty(opMsg))
                return Content(HttpStatusCode.Conflict, opMsg);
            if (isMappedwithRiskRepository)
            {
                return Content(HttpStatusCode.BadRequest, "This Service Tower is mapped with risk(s) in risk repository, so it cannot be deleted.");
            }
            if (lstQMapping.Any() || lstAChecklist.Any())
                return Content(HttpStatusCode.BadRequest, "This Service Tower either used in Process Question Mapping / Assessment checklist that has been submitted to appraisee, so it cannot be deleted.");
            else
            {
                if (results != null)
                {
                    results.ISACTIVE = false;
                    CSPdb.PROCESS_SERVICE_AREA_NEW.Update(results);
                    CSPdb.Commit(CanCommit);
                    return Ok(results);
                }
                return Content(HttpStatusCode.BadRequest, "Invalid Data!");
            }
        }

        [POST("AddProcessAreaNew")]
        [ActionName("AddProcessAreaNew")]
        [HttpPost]
        public IHttpActionResult AddProcessAreaNew([FromBody] PROCESS_AREA results)
        {
            List<PROCESS_AREA> checkExists = CSPdb.PROCESS_AREA.GetAll().Where(x => x.TITLE == results.TITLE && x.ISACTIVE == true && x.SHOW_IN_MASTER).ToList();
            if (checkExists.Any())
                return Content(HttpStatusCode.BadRequest, "This Process Area exists already, so it cannot be added.");
            else
            {
                CSPdb.PROCESS_AREA.Add(results);
                CSPdb.Commit(CanCommit);
                return Ok(results);
            }
        }

        [POST("UpdateProcessAreaNew")]
        [ActionName("UpdateProcessAreaNew")]
        [HttpPost]
        public IHttpActionResult UpdateProcessAreaNew([FromBody] PROCESS_AREA results)
        {
            List<PROCESS_AREA> checkExists = CSPdb.PROCESS_AREA.GetAll().Where(x => x.TITLE == results.TITLE && x.ID != results.ID && x.ISACTIVE == true && x.SHOW_IN_MASTER).ToList();

            if (checkExists.Any())
                return Content(HttpStatusCode.BadRequest, "This Process Area exists already, so it cannot be updated.");

            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> checkList = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.PROCESS_AREA_ID == results.ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();
            if (checkList.Any())
                return Content(HttpStatusCode.BadRequest, "This Process Area used in Assessment checklist that has been submitted to appraisee, so it cannot be modified.");

            if (results != null)
            {
                UpdateAuditFields(results);
                CSPdb.PROCESS_AREA.Update(results);
                CSPdb.Commit(CanCommit);
                return Ok(results);
            }

            return Content(HttpStatusCode.BadRequest, "Invalid Data!");
        }

        [POST("DeleteProcessAreaNew")]
        [ActionName("DeleteProcessAreaNew")]
        [HttpPost]
        public IHttpActionResult DeleteProcessAreaNew([FromBody] PROCESS_AREA results)
        {
            List<PM_PROCESS_QUESTIONS_MAPPING> lstQMapping = CSPdb.PM_PROCESS_QUESTIONS_MAPPING.GetAll().Where(x => x.SERVICE_AREA_ID == results.ID && x.ISACTIVE == true).ToList();
            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> lstAChecklist = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.SERVICE_AREA_ID == results.ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();
            if (lstQMapping.Any() || lstAChecklist.Any())
                return Content(HttpStatusCode.BadRequest, "This Process Area either used in Process Question Mapping / Assessment checklist that has been submitted to appraisee, so it cannot be deleted.");
            else
            {
                if (results != null)
                {
                    UpdateAuditFields(results);
                    results.ISACTIVE = false;
                    CSPdb.PROCESS_AREA.Update(results);
                    CSPdb.Commit(CanCommit);
                    return Ok(results);
                }
            }

            return Content(HttpStatusCode.BadRequest, "Invalid Data!");
        }

        [GET("GetProcessAreaList")]
        [ActionName("GetProcessAreaList")]
        [HttpGet]
        public IHttpActionResult GetProcessAreaList()
        {
            List<PROCESS_AREA> processArea = CSPdb.PROCESS_AREA.GetAll().Where(t => t.ISACTIVE && t.SHOW_IN_MASTER).OrderBy(t => t.TITLE).ToList();
            return Ok(processArea);
        }

        [POST("s")]
        [ActionName("UpdateProcessNew")]
        [HttpPost]
        public IHttpActionResult UpdateProcessNew([FromBody] PROCESS results)
        {
            ValidateReqest(results);
            var process = new PROCESS();
            var overview = new PROCESS();
            bool isUpdate = false;
            var errorMsg = "Process with same Process Area, Title, Description is already available. Please change the details and save.";
            if (results != null)
            {
                var existing = CSPdb.PROCESS.GetAll().Where(x => x.ID != results.ID && x.PROCESS_AREA_ID == results.PROCESS_AREA_ID && x.TITLE == results.TITLE && x.DESCRIPTION == results.DESCRIPTION).ToList();
                if (existing.Any())
                {
                    return Content(HttpStatusCode.BadRequest, errorMsg);
                }
            }
            if (results.ID == 0)
            {

                process = new PROCESS()
                {
                    PROCESS_AREA_ID = results.PROCESS_AREA_ID,
                    TITLE = results.TITLE,
                    DESCRIPTION = results.DESCRIPTION,
                    CLAUSE_REFERENCE = results.CLAUSE_REFERENCE,
                    CONTROL_REFERENCE = results.CONTROL_REFERENCE,
                    CREATED_BY = results.CREATED_BY,
                    CREATED_DATE = DateTime.Now,
                    UPDATED_BY = results.UPDATED_BY,
                    UPDATED_DATE = DateTime.Now,
                    ISACTIVE = true,
                    SHOW_IN_MASTER = true
                };
                CSPdb.PROCESS.Add(process);
                CSPdb.Commit(CanCommit);
            }
            else
            {
                isUpdate = true;
                List<AUDIT_CHECKLIST_EXECUTION_DETAILS> checkList = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.PROCESS_ID == results.ID && x.PROCESS_AREA_ID == results.PROCESS_AREA_ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();

                overview = CSPdb.PROCESS.GetAll().FirstOrDefault(x => x.ISACTIVE && x.ID == results.ID);


                if (checkList.Any() && overview != null)
                {
                    if (overview.PROCESS_AREA_ID != results.PROCESS_AREA_ID || overview.TITLE != results.TITLE || overview.DESCRIPTION != results.DESCRIPTION
                        || overview.SHOW_IN_MASTER != results.SHOW_IN_MASTER)
                        return Content(HttpStatusCode.BadRequest, "This Process used in Audit checklist that has been submitted to auditee, so it cannot be updated.");
                }


                if (overview != null)
                {
                    overview.PROCESS_AREA_ID = results.PROCESS_AREA_ID;
                    overview.TITLE = results.TITLE;
                    overview.DESCRIPTION = results.DESCRIPTION;
                    overview.CLAUSE_REFERENCE = results.CLAUSE_REFERENCE;
                    overview.CONTROL_REFERENCE = results.CONTROL_REFERENCE;
                    overview.UPDATED_BY = results.UPDATED_BY;
                    overview.UPDATED_DATE = DateTime.Now;
                    overview.ISACTIVE = true;
                    overview.SHOW_IN_MASTER = true;
                    CSPdb.PROCESS.Update(overview);
                    CSPdb.Commit(CanCommit);
                }
            }

            if (isUpdate)
            {
                var existingReferences = Cldb.PROCESS_AREA_MODEL_REFERENCE.GetAll().Where(x => x.PROCESS_ID == overview.ID && x.ISACTIVE).ToList();
                //UpdateMappingList(existingReferences, results.PROCESS_MODEL_REFERENCE_LIST, existingReferences.FirstOrDefault(x => x.PROCESS_MODEL_REFERENCE_ID == item), AddProcessAreaModelMapping, Cldb.PROCESS_AREA_MODEL_REFERENCE.Update);
                foreach (var item in existingReferences)
                {
                    item.ISACTIVE = false;
                }
                foreach (var item in results.PROCESS_MODEL_REFERENCE_LIST)
                {
                    var existing = existingReferences.FirstOrDefault(x => x.PROCESS_MODEL_REFERENCE_ID == item);
                    if (existing != null)
                    {
                        UpdateAuditFields(existing);
                    }
                    else
                    {
                        var modelReference = new PROCESS_AREA_MODEL_REFERENCE
                        {
                            PROCESS_ID = overview.ID,
                            PROCESS_MODEL_REFERENCE_ID = item
                        };
                        UpdateAuditFields(modelReference);
                        Cldb.PROCESS_AREA_MODEL_REFERENCE.Add(modelReference);
                    }
                }
                foreach (var item in existingReferences)
                {
                    Cldb.PROCESS_AREA_MODEL_REFERENCE.Update(item);
                }
            }
            else
            {
                foreach (var item in results.PROCESS_MODEL_REFERENCE_LIST)
                {
                    var modelReference = new PROCESS_AREA_MODEL_REFERENCE
                    {
                        PROCESS_ID = process.ID,
                        PROCESS_MODEL_REFERENCE_ID = item
                    };
                    UpdateAuditFields(modelReference);
                    Cldb.PROCESS_AREA_MODEL_REFERENCE.Add(modelReference);
                }
            }
            Cldb.Commit(CanCommit);

            return Ok();
        }

        private void AddProcessAreaModelMapping(PROCESS_AREA_MODEL_REFERENCE model, int modelReferenceId)
        {
            var modelReference = new PROCESS_AREA_MODEL_REFERENCE
            {
                PROCESS_ID = model.PROCESS_ID,
                PROCESS_MODEL_REFERENCE_ID = modelReferenceId
            };
            UpdateAuditFields(modelReference);
            Cldb.PROCESS_AREA_MODEL_REFERENCE.Add(modelReference);
        }

        [POST("DeleteProcessNew")]
        [ActionName("DeleteProcessNew")]
        [HttpPost]
        public IHttpActionResult DeleteProcessNew([FromBody] PROCESS results)
        {
            PROCESS overview = CSPdb.PROCESS.GetById(results.ID);

            List<PM_PROCESS_QUESTIONS_MAPPING> lstQMapping = CSPdb.PM_PROCESS_QUESTIONS_MAPPING.GetAll().Where(x => x.PROCESS_ID == results.ID && x.ISACTIVE == true).ToList();
            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> checkList = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.PROCESS_ID == results.ID && x.PROCESS_AREA_ID == results.PROCESS_AREA_ID && x.ISSUBMITTED == true && x.ISACTIVE == true).ToList();
            if (lstQMapping.Any() || checkList.Any())
                return Content(HttpStatusCode.BadRequest, "This Process used in Assessment checklist that has been submitted to appraisee, so it cannot be deleted.");

            if (results != null && overview != null)
            {
                overview.PROCESS_AREA_ID = results.PROCESS_AREA_ID;
                overview.TITLE = results.TITLE;
                overview.DESCRIPTION = results.DESCRIPTION;
                overview.UPDATED_BY = results.UPDATED_BY;
                overview.UPDATED_DATE = DateTime.Now;
                overview.ISACTIVE = false;
                CSPdb.PROCESS.Update(overview);
                CSPdb.Commit(CanCommit);
            }
            return Ok(overview);
        }

        [POST("UpdateProcessServiceAreaMapping")]
        [ActionName("UpdateProcessServiceAreaMapping")]
        [HttpPost]
        public IHttpActionResult UpdateProcessServiceAreaMapping([FromBody] ProcessServiceAreaMapping results)
        {
            string empId = GetHeaderDetails_String("empid");

            List<AUDIT_CHECKLIST_EXECUTION_DETAILS> checkList;
            bool status = false;

            foreach (PROCESS p in results.PROCESS)
            {
                if (!p.ISACTIVE)
                {
                    checkList = CSPdb.AUDIT_CHECKLIST_EXECUTION_DETAILS.GetAll().Where(x => x.PROCESS_ID == p.ID && x.SERVICE_AREA_ID == results.PROCESS_SERVICE_AREA_NEW.ID && x.ISACTIVE == true).ToList();
                    if (checkList.Any())
                        status = true;
                }
            }

            if (status)
                return Content(HttpStatusCode.BadRequest, "Processes are used in Audit checklist that has been submitted to auditee, so it cannot be un mapped.");

            //DELETE existing records
            List<PROCESS_SERVICE_AREA_MAPPING> delrec = CSPdb.PROCESS_SERVICE_AREA_MAPPING.GetAll().Where(t => t.SERVICE_AREA_ID == results.PROCESS_SERVICE_AREA_NEW.ID).ToList();
            var ServiceTowerId = results.PROCESS_SERVICE_AREA_NEW.ID;
            var oldProcessAreas = CSPdb.AppRepo.GetAllProcessByServiceArea(ServiceTowerId);
            delrec.ToList().ForEach(c => c.ISACTIVE = false);
            CSPdb.PROCESS_SERVICE_AREA_MAPPING.Update(delrec);
            CSPdb.Commit(CanCommit);
            //----------------
            if (results != null && results.PROCESS_SERVICE_AREA_NEW != null)
            {
                foreach (PROCESS p in results.PROCESS)
                {
                    if (p.ISACTIVE)
                    {
                        PROCESS_SERVICE_AREA_MAPPING pm = new PROCESS_SERVICE_AREA_MAPPING();
                        pm.SERVICE_AREA_ID = results.PROCESS_SERVICE_AREA_NEW.ID;
                        pm.PROCESS_ID = p.ID;
                        pm.CREATED_BY = empId;
                        pm.CREATED_DATE = DateTime.Now;
                        pm.UPDATED_BY = empId;
                        pm.UPDATED_DATE = DateTime.Now;
                        pm.ISACTIVE = true;
                        CSPdb.PROCESS_SERVICE_AREA_MAPPING.Add(pm);
                        CSPdb.Commit(CanCommit);
                    }
                }
                var serviceTower = results.PROCESS_SERVICE_AREA_NEW.TITLE;
                var newProcessAreas = CSPdb.AppRepo.GetAllProcessByServiceArea(ServiceTowerId);
                SendServiceTowerProcessAreaMapUpdateNotification(oldProcessAreas, newProcessAreas, serviceTower, empId);
            }
            return Ok(results.PROCESS);
        }

        [POST("DeleteServiceAreaProjectMapping")]
        [ActionName("DeleteServiceAreaProjectMapping")]
        [HttpPost]
        public IHttpActionResult DeleteServiceAreaProjectMapping([FromBody] PROCESS_SERVICE_AREA_PROJECT_MAPPING results)
        {
            string empId = GetHeaderDetails_String("empid");

            if (results != null)
            {
                ValidateServiceAreaDeletion(results.PROJ_ID, results.SERVICE_AREA_ID);
                List<PROCESS_SERVICE_AREA_PROJECT_MAPPING> mappingList = CSPdb.PROCESS_SERVICE_AREA_PROJECT_MAPPING.GetAll().Where(x => x.SERVICE_AREA_ID == results.SERVICE_AREA_ID && x.PROJ_ID == results.PROJ_ID && x.ISACTIVE).ToList();
                if (mappingList.Any())
                {
                    PROCESS_SERVICE_AREA_PROJECT_MAPPING mappingData = mappingList[0];
                    mappingData.ISACTIVE = false;
                    mappingData.UPDATED_BY = empId;
                    mappingData.UPDATED_DATE = DateTime.Now;
                    CSPdb.PROCESS_SERVICE_AREA_PROJECT_MAPPING.Update(mappingData);
                    CSPdb.Commit(CanCommit);
                }
            }
            return Ok(results);
        }

        [GET("GetProcessList")]
        [ActionName("GetProcessList")]
        [HttpGet]
        public IHttpActionResult GetProcessList()
        {
            var processList = CSPdb.PROCESS.GetAll().Where(t => t.ISACTIVE && t.SHOW_IN_MASTER).OrderBy(x => x.TITLE).ToList();
            var processReferenceList = Cldb.PROCESS_AREA_MODEL_REFERENCE.GetAll().Where(x => x.ISACTIVE).ToList();

            if (processReferenceList.Count > 0)
            {
                foreach (var item in processList)
                {
                    var matchingReferences = processReferenceList.Where(x => x.PROCESS_ID == item.ID).Select(x => x.PROCESS_MODEL_REFERENCE_ID).ToArray();
                    item.PROCESS_MODEL_REFERENCE_LIST = matchingReferences;
                }
            }
            return Ok(processList);
        }

        [GET("GetAllProcessModelReferenceList")]
        [ActionName("GetAllProcessModelReferenceList")]
        [HttpGet]
        public IHttpActionResult GetAllProcessModelReferenceList()
        {
            var processModelReferenceList = Cldb.AppRepo.GetAllProcessModelReferenceList().ToList();
            var groupedProcessModelData = processModelReferenceList.GroupBy(x => x.PROCESS_MODEL_ID).Select(group => new
            {
                PROCESS_MODEL_ID = group.Key,
                PROCESS_MODEL_NAME = group.First().PROCESS_MODEL_NAME,
                Items = group.ToList()
            }).OrderBy(x => x.PROCESS_MODEL_NAME).ToList();

            return Ok(groupedProcessModelData);
        }

        [GET("GetTaskDetailsByDateRange")]
        [ActionName("GetTaskDetailsByDateRange")]
        [HttpGet]
        public IHttpActionResult GetTaskDetailsByDateRange(DateTime StartDate, DateTime EndDate, string customerId, string projectId, string taskCategory, int viewBy, string viewType = "Y")
        {
            string empId = GetHeaderDetails_String("empid");

            switch (viewBy)
            {
                case 1:
                    List<TASK_DETAILS> results = CSPdb.AppRepo.getTaskDetailsByDateRange(StartDate, EndDate, empId, customerId, projectId, taskCategory, viewType).ToList();
                    TaskGroups TaskGroups = GetTaskGroups(results, empId, viewType);
                    return Ok(TaskGroups);
                case 2:
                    var taskDetails = Cldb.AppRepo.getOverallTaskDetails(StartDate, EndDate, customerId, projectId, taskCategory);
                    return Ok(taskDetails);
                default:
                    return BadRequest("Invalid ViewBy value");
            }

        }

        [GET("GetOpenFindings")]
        [ActionName("GetOpenFindings")]
        [HttpGet]
        public IHttpActionResult GetOpenFindings(string auditIds)
        {
            var openFindings = Cldb.AppRepo.getOpenFindingsCount(auditIds).ToList();
            return Ok(openFindings);
        }

        [GET("GetAllCustomerProjectsName")]
        [ActionName("GetAllCustomerProjectsName")]
        [HttpGet]
        public IHttpActionResult GetAllCustomerProjectsName()
        {
            var empId = this.GetHeaderDetails_String("empId");
            var projects = GetProjectListForUser(empId, "").OrderBy(x => x.PROJ_NM).ToList();

            return Ok(projects);
        }

    }
}