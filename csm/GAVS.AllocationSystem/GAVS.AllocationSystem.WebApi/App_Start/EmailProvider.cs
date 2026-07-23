using GAVS.AllocationSystem.Data.Contracts;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.WebApi.Controllers;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;

namespace GAVS.AllocationSystem.WebApi
{
    public struct EmailConfig
    {
        public string smtpAccount;
        public string smtpPassword;
        public string smtpHost;
        public string smtpPortValue;
        public enumEnvironment environment;
        public bool excludeSender;
    }

    public struct EmailContent
    {
        public string subject;
        public string from;
        public string to;
        public string cc;
        public string bcc;
        public string content;
        public string returnpath;
        public bool hasAttachments;
        public string attachmentFilePath;
        public string fromAddress;
        public string fromPerson;
        public string ProjId { get; set; }
    }

    public enum enumEnvironment
    {
        Dev,
        Test,
        Stage,
        Prod
    }

    public class EmailProvider
    {
        private ICSPDB CSPDB = null;
        private ICloudDB CLDB = null;
        private ControllerHelper helper;
        private EmailProvider()
        { }

        public EmailProvider(ICloudDB clDB, ICSPDB cspDB)
        {
            CLDB = clDB;
            CSPDB = cspDB;
            helper = new Controllers.ControllerHelper(CLDB, CSPDB);
        }

        private void RemoveDuplicateEmails(ref EmailContent email)
        {

            email.to = String.Join(",", email.to.ToLower().Trim(',').Split(',').Distinct());
            if (!string.IsNullOrWhiteSpace(email.cc))
                email.cc = String.Join(",", email.cc.ToLower().Trim(',').Split(',').Distinct());

            List<string> to = email.to.Trim().Split(',').ToList<string>();
            List<string> cc = !string.IsNullOrWhiteSpace(email.cc) ? email.cc.Trim().Split(',').ToList<string>() : new List<string>();
            List<string> FilteredCC = cc.Where(t => !to.Contains(t)).ToList();
            email.cc = String.Join(",", FilteredCC);
        }

        private string GetTruncatedMailSubject(string subject)
        {
            string result = string.Empty;

            if (!string.IsNullOrEmpty(subject))
            {
                subject = subject.Replace('\n', ' ');
                subject = subject.Replace('\r', ' ');
                int len = subject.Length;
                if (len > 160)
                    result = $"{subject.Substring(0, 160)}...";
                else
                    result = subject;
            }

            return result;
        }

        public bool SendEmail(EmailConfig config, EmailContent email, HttpRequestMessage request)
        {
            MailMessage message = new MailMessage();

            string smtpAccount = config.smtpAccount;
            string smtpPassword = config.smtpPassword;
            string smtpHost = "smtp.office365.com";
            string smtpPortValue = config.smtpPortValue;
            int smtpPort = 587;// Convert.ToInt32(smtpPortValue);

            //string sHeader = "";
            //email.content = sHeader + email.content;

            RemoveDuplicateEmails(ref email);

            if (string.IsNullOrWhiteSpace(email.to))
            {
                if (request != null)
                {
                    Logger log = new Logger(request, email.subject + " - Mail not sent as TO address is empty");
                }
                return false;
            }
            bool isProd;
            bool.TryParse(ConfigurationManager.AppSettings["IsProd"], out isProd);
            var empId = getEmpId(request);


            if (!string.IsNullOrEmpty(smtpAccount) && !string.IsNullOrEmpty(smtpPassword) && !string.IsNullOrEmpty(smtpPortValue))
            {
                message.From = new MailAddress(email.from);

                message.DeliveryNotificationOptions = DeliveryNotificationOptions.OnFailure;
                //message.Headers.Add("Disposition-Notification-To", "csmplatformsupport@gavstech.com");

                //message.ReplyToList.Add( new MailAddress( "csmplatformsupport@gavstech.com"));
                message.To.Add(email.to.Trim());
                if (!string.IsNullOrWhiteSpace(email.cc))
                {
                    email.cc = email.cc.Replace(",,", ",").Trim();
                    message.CC.Add(email.cc);
                }
                //logic for sender
                if (!config.excludeSender)
                {
                    var sendermailId = helper.GetEmployeeMailId(empId);
                    if (!string.IsNullOrWhiteSpace(sendermailId))
                        message.CC.Add(sendermailId);
                }
                //logic for gslab
                if (!string.IsNullOrWhiteSpace(email.ProjId) && email.ProjId.StartsWith("PROJ"))
                {
                    message.CC.Add(helper.GetDBConfig("DEVEX_CC_LIST", "-1"));
                }
                if (!string.IsNullOrWhiteSpace(email.bcc))
                    message.Bcc.Add(email.bcc);
                else
                    message.Bcc.Add(Constants.CSS_BCC);

                message.Subject = GetTruncatedMailSubject(email.subject);
                message.Body = email.content;
                message.IsBodyHtml = true;
                //message.Bcc.Add("quality@gavstech.com");
                EMAIL_LOG email_log = new EMAIL_LOG
                {
                    FROMADDRESS = message.From.Address,
                    TOADDRESS = string.Join(",", message.To),
                    CC = string.Join(",", message.CC),
                    BCC = string.Join(",", message.Bcc),
                    SUBJECTLINE = message.Subject,
                    CONTENT = message.Body,
                    CREATED_BY = empId,
                    CREATED_DATE = DateTime.Now,
                    UPDATED_BY = empId,
                    UPDATED_DATE = DateTime.Now,
                    URL = request != null && request.RequestUri != null ? request.RequestUri.ToString() : string.Empty,
                    MAILSENT = true,
                };
                CSPDB.EMAIL_LOG.Add(email_log);
                CSPDB.Commit();
                if (!isProd)
                {
                    message.To.Clear();
                    message.CC.Clear();
                    message.Bcc.Clear();
                    message.To.Add(ConfigurationManager.AppSettings["DefaultMail"]);
                    message.Body += new StringBuilder().AppendLine().AppendLine("TO:" + email_log.TOADDRESS).AppendLine("CC:" + email_log.CC).AppendLine("BCC:" + email.bcc).ToString();
                    message.Subject = "UAT: " + message.Subject;
                }
                if (email.hasAttachments)
                {
                    message.Attachments.Add(new Attachment(email.attachmentFilePath));
                }
                try
                {
                    if (isProd && email.content.Contains("localhost")) throw new Exception("Invalid localhost URL in mail content");
                    ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls
                                     | SecurityProtocolType.Tls11
                                     | SecurityProtocolType.Tls12;
                    using (SmtpClient smtpClient = new SmtpClient())
                    {


                        //smtpClient.UseDefaultCredentials = false;
                        //smtpClient.Credentials = new NetworkCredential(smtpAccount, smtpPassword);
                        //smtpClient.Host = smtpHost;
                        //smtpClient.Port = smtpPort;
                        //smtpClient.EnableSsl = true;
                        smtpClient.Host = smtpHost;
                        smtpClient.Port = smtpPort;
                        smtpClient.EnableSsl = true;
                        smtpClient.UseDefaultCredentials = false;
                        var credentials = new System.Net.NetworkCredential(smtpAccount, smtpPassword);
                        smtpClient.Credentials = credentials;

                        smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;
                        if (!string.IsNullOrWhiteSpace(email.fromAddress) && !string.IsNullOrWhiteSpace(email.fromPerson))
                            message.From = new MailAddress(email.fromAddress, email.fromPerson);
                        else
                            message.From = new MailAddress(Constants.QUALITY_MAIL, "Neurealm Quality Assurance");
                        if (!string.IsNullOrWhiteSpace(email.returnpath))
                            message.ReplyToList.Add(email.returnpath);
                        smtpClient.Send(message);
                        return true;
                    }
                }
#pragma warning disable CS0168 // The variable 'ex' is declared but never used
                catch (Exception ex)
#pragma warning restore CS0168 // The variable 'ex' is declared but never used
                {
                    email_log.EXCEPTION = ex.GetType().ToString() + ":" + ex.Message;
                    email_log.STACKTRACE = ex.StackTrace;
                    email_log.MAILSENT = false;
                    CSPDB.EMAIL_LOG.Update(email_log);
                    CSPDB.Commit();
                }

            }

            return false;
        }

        public void ReSendEmail(EmailConfig config, EmailContent email, EMAIL_LOG email_log, HttpRequestMessage request = null)
        {
            MailMessage message = new MailMessage();

            string smtpAccount = config.smtpAccount;
            string smtpPassword = config.smtpPassword;
            string smtpHost = "smtp.gmail.com";
            string smtpPortValue = config.smtpPortValue;
            int smtpPort = 587;// Convert.ToInt32(smtpPortValue);

            string sHeader = "";
            email.content = sHeader + email.content;

            RemoveDuplicateEmails(ref email);

            if (string.IsNullOrWhiteSpace(email.to))
            {
                if (request != null)
                {
                    Logger log = new Logger(request, email.subject + " - Mail not sent as TO address is empty");
                }
                return;
            }
            bool isProd;
            bool.TryParse(ConfigurationManager.AppSettings["IsProd"], out isProd);

            if (!string.IsNullOrEmpty(smtpAccount) && !string.IsNullOrEmpty(smtpPassword) && !string.IsNullOrEmpty(smtpPortValue))
            {
                message.From = new MailAddress(smtpAccount);
                if (isProd)
                {
                    message.To.Add(email.to);
                    if (!string.IsNullOrWhiteSpace(email.cc))
                        message.CC.Add(email.cc);
                    if (!string.IsNullOrWhiteSpace(email.bcc))
                        message.Bcc.Add(email.bcc);
                }
                else
                {
                    message.To.Add(ConfigurationManager.AppSettings["DefaultMail"]);
                    email.content += new StringBuilder().AppendLine().AppendLine("TO:" + email.to).AppendLine("CC:" + email.cc).ToString();
                }
                message.Subject = email.subject;
                message.Body = email.content;
                message.IsBodyHtml = true;
                //message.Bcc.Add("quality@gavstech.com");
                if (email.hasAttachments)
                {
                    message.Attachments.Add(new Attachment(email.attachmentFilePath));
                }

                try
                {
                    if (isProd && email.content.Contains("localhost")) throw new Exception("Invalid localhost URL in mail content");
                    using (SmtpClient smtpClient = new SmtpClient())
                    {
                        //smtpClient.UseDefaultCredentials = false;
                        //smtpClient.Credentials = new NetworkCredential(smtpAccount, smtpPassword);
                        //smtpClient.Host = smtpHost;
                        //smtpClient.Port = smtpPort;
                        //smtpClient.EnableSsl = true;
                        smtpClient.Host = smtpHost;
                        smtpClient.Port = smtpPort;
                        smtpClient.EnableSsl = true;
                        smtpClient.UseDefaultCredentials = false;
                        var credentials = new System.Net.NetworkCredential(smtpAccount, smtpPassword);
                        smtpClient.Credentials = credentials;

                        smtpClient.DeliveryMethod = SmtpDeliveryMethod.Network;

                        smtpClient.Send(message);
                        email_log.MAILSENT = true;
                        email_log.UPDATED_DATE = DateTime.Now;
                        CSPDB.EMAIL_LOG.Update(email_log);
                        CSPDB.Commit();
                    }
                }
#pragma warning disable CS0168 // The variable 'ex' is declared but never used
                catch (Exception ex)
#pragma warning restore CS0168 // The variable 'ex' is declared but never used
                {

                    email_log.EXCEPTION = ex.GetType().ToString() + ":" + ex.Message;
                    email_log.STACKTRACE = ex.StackTrace;
                    email_log.MAILSENT = false;
                    email_log.UPDATED_DATE = DateTime.Now;
                    CSPDB.EMAIL_LOG.Update(email_log);
                    CSPDB.Commit();
                }
            }
        }

        private string getEmpId(HttpRequestMessage request)
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
}