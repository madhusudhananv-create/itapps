using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    public partial class AllSysController
    {
        [GET("GetConfigDetails")]
        [ActionName("GetConfigDetails")]
        [HttpGet]
        public IHttpActionResult GetConfigDetails()
        {
            var configurationExtList = Cldb.AppRepo.GetConfigExtDetails().ToList();

            return Ok(configurationExtList);
        }

        [POST("UpdateConfiguration")]
        [ActionName("UpdateConfiguration")]
        [HttpPost]
        public IHttpActionResult UpdateConfiguration([FromBody] CONFIGURATION_EXT configurationExt)
        {
            CheckAccessForFeature(91);
            LogRequest(content: JsonConvert.SerializeObject(configurationExt));
            if (configurationExt == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            var existingConfig = new CONFIGURATION_EXT();
            var existing = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(x => x.ID == configurationExt.ID);
            int flag = 0;

            if (existing != null && configurationExt.ID != 0)
            {

                existingConfig.VALUE = existing.VALUE;
                existingConfig.KEY = existing.KEY;
                existingConfig.PROJ_ID = existing.PROJ_ID;
                existingConfig.CUST_ID = existing.CUST_ID;
                existingConfig.COMMENTS = existing.COMMENTS;
                existingConfig.DESCRIPTION = existing.DESCRIPTION;
                existingConfig.ISENCRYPT = existing.ISENCRYPT;
                existingConfig.START_DATE = existing.START_DATE;
                existingConfig.END_DATE = existing.END_DATE;
                existingConfig.UPDATED_BY = existing.UPDATED_BY;
                existingConfig.UPDATED_DATE = existing.UPDATED_DATE;


                existing.VALUE = configurationExt.VALUE;
                existing.KEY = configurationExt.KEY;
                existing.PROJ_ID = configurationExt.PROJ_ID;
                existing.CUST_ID = configurationExt.CUST_ID;
                existing.COMMENTS = configurationExt.COMMENTS;
                existing.DESCRIPTION = configurationExt.DESCRIPTION;
                existing.ISENCRYPT = configurationExt.ISENCRYPT;
                existing.START_DATE = configurationExt.START_DATE;
                existing.END_DATE = configurationExt.END_DATE;
                UpdateAuditFields(existing);
                Cldb.CONFIGURATION_EXT.Update(existing);
                flag = 1;
            }
            else
            {
                UpdateAuditFields(configurationExt);
                Cldb.CONFIGURATION_EXT.Add(configurationExt);
            }

            Cldb.Commit(CanCommit);
            if (flag == 0)
                SendMailForConfigext(configurationExt, flag, existingConfig);
            else
                SendMailForConfigext(existing, flag, existingConfig);

            return Ok();
        }


        [POST("DeleteConfiguration")]
        [ActionName("DeleteConfiguration")]
        [HttpPost]
        public IHttpActionResult DeleteConfiguration([FromBody] CONFIGURATION_EXT configurationExt)
        {
            CheckAccessForFeature(91);
            LogRequest(content: JsonConvert.SerializeObject(configurationExt));
            if (configurationExt == null)
            {
                return Content(HttpStatusCode.Conflict, "Request is invalid");
            }
            int flag = 0;


            var exist = Cldb.CONFIGURATION_EXT.GetAll().FirstOrDefault(x => x.ID == configurationExt.ID && x.ISACTIVE);
            if (exist != null)
            {
                UpdateAuditFields(exist);
                exist.ISACTIVE = false;
                Cldb.CONFIGURATION_EXT.Update(exist);
                Cldb.Commit(CanCommit);
                flag = -1;
            }

            if (flag == -1)
                SendMailForConfigext(exist, flag);

            return Ok();
        }

        private void SendMailForConfigext(CONFIGURATION_EXT configurationExt, int flag = 0, CONFIGURATION_EXT existingConfig = null)
        {
            var ccMail = Constants._csmSupportMail;
            var toMail = Constants.BCC;// config

            var emailContentValues = new Dictionary<string, string>();
            var sb = new StringBuilder();
            var exstCustNm = "All";
            var oldCustNm = "All";
            var newUpdatedBy = "";
            var oldUpdatedBy = "";
            var exstProj = "";
            var oldProj = "";
            if (flag != 1)
            {
                oldCustNm = "";
            }
            if (configurationExt.CUST_ID != "-1")
            {
                exstCustNm = Cldb.CUSTOMER.GetAll().Where(x => x.CUST_ID == configurationExt.CUST_ID).Select(e => e.CUST_NM).FirstOrDefault();
            }
            if (flag == 1 && existingConfig != null && existingConfig.CUST_ID != "-1")
            {
                oldCustNm = Cldb.CUSTOMER.GetAll().FirstOrDefault(x => x.CUST_ID == existingConfig.CUST_ID)?.CUST_NM;
            }
            if (configurationExt.UPDATED_BY != null)
            {
                newUpdatedBy = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == configurationExt.UPDATED_BY)?.FRST_NM;
            }

            if (flag == 1 && existingConfig?.UPDATED_BY != null)
            {
                oldUpdatedBy = Cldb.EMP_INFO.GetAll().FirstOrDefault(e => e.EMP_ID == existingConfig.UPDATED_BY)?.FRST_NM;
            }

            if (configurationExt.PROJ_ID != null)
            {
                exstProj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == configurationExt.PROJ_ID)?.PROJ_NM;
            }
            if (flag == 1 && existingConfig?.PROJ_ID != null)
            {
                oldProj = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == existingConfig.PROJ_ID)?.PROJ_NM;
            }
            switch (flag)
            {
                case 0:
                    emailContentValues.Add("action", "created");
                    break;
                case 1:
                    emailContentValues.Add("action", "updated");
                    break;
                case -1:
                    emailContentValues.Add("action", "deleted");
                    break;
            }
            var subject = $"{configurationExt.KEY} Configuration Update";
            emailContentValues.Add("KEY", configurationExt.KEY);
            emailContentValues.Add("VALUE", configurationExt.VALUE);
            emailContentValues.Add("OLD_VALUE", existingConfig?.VALUE);
            emailContentValues.Add("CUST_ID", exstCustNm);
            emailContentValues.Add("OLD_CUST_ID", oldCustNm);

            emailContentValues.Add("PROJ_ID", exstProj);
            emailContentValues.Add("OLD_PROJ_ID", oldProj);
            emailContentValues.Add("Comment", configurationExt.COMMENTS);
            emailContentValues.Add("Old_Comment", existingConfig?.COMMENTS);
            emailContentValues.Add("Description", configurationExt.DESCRIPTION);
            emailContentValues.Add("Old_Description", existingConfig?.DESCRIPTION);
            emailContentValues.Add("StartDate", configurationExt.START_DATE?.ToString(_dateformat));
            emailContentValues.Add("Old_StartDate", existingConfig?.START_DATE?.ToString(_dateformat));
            emailContentValues.Add("EndDate", configurationExt.END_DATE?.ToString(_dateformat));
            emailContentValues.Add("Old_EndDate", existingConfig?.END_DATE?.ToString(_dateformat));
            if (existingConfig?.UPDATED_DATE == DateTime.MinValue)
            {
                emailContentValues.Add("OUD", " ");
            }
            else
            {
                emailContentValues.Add("OUD", existingConfig?.UPDATED_DATE.ToString(_dateformat));
            }

            emailContentValues.Add("UD", configurationExt.UPDATED_DATE.ToString(_dateformat));
            emailContentValues.Add("UB", newUpdatedBy);
            emailContentValues.Add("OUB", oldUpdatedBy);


            var mailContent = helper.GetEmailContent("SendMailForConfigEXT.htm", emailContentValues);

            var ep = new EmailProvider(Cldb, CSPdb);
            if (string.IsNullOrWhiteSpace(toMail)) toMail = _email;

            if (ep.SendEmail
                      (
                      new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                      new EmailContent { from = _email, to = toMail, cc = ccMail, bcc = Constants.BCC, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                      Request
                      ))
            {

            }
        }


    }
}