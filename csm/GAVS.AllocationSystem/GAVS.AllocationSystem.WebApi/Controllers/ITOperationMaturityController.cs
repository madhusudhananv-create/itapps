using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.AllSys;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    // View models for the IT Operations Maturity Assessment screens (BRD: IT Ops Maturity Assessment)
    public class ITOPS_DomainTrackerRow
    {
        public int AssessmentId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string CoeSpocEmpId { get; set; }
        public string CoeSpocName { get; set; }
        public string ReviewerEmpId { get; set; }
        public string ReviewerName { get; set; }
        public string Status { get; set; }
        public int ParamCount { get; set; }
        public int SumScores { get; set; }
        public int MaxPossible { get; set; }
        public decimal? AverageScore { get; set; }
        public decimal? MaturityPercent { get; set; }
        public string MaturityLevel { get; set; }
    }

    public class ITOPS_ParameterScoreRow
    {
        public int ParameterId { get; set; }
        public string Category { get; set; }
        public string ParameterName { get; set; }
        public string Definition { get; set; }
        public string Level1_AdHoc { get; set; }
        public string Level2_Developing { get; set; }
        public string Level3_Defined { get; set; }
        public string Level4_Managed { get; set; }
        public string Level5_Optimized { get; set; }
        public int? MinRequiredScore { get; set; }
        public int? ScoreId { get; set; }
        public int? ScoreValue { get; set; }
        public string Notes { get; set; }
        public int? FindingId { get; set; }
        public string FindingStatus { get; set; }
        public string FindingRejectionComment { get; set; }
        public string FindingActionTaken { get; set; }
    }

    public class ITOPS_UpsertScoreRequest
    {
        public int AssessmentId { get; set; }
        public int ParameterId { get; set; }
        public int? ScoreValue { get; set; }
        public string Notes { get; set; }
    }

    public class ITOPS_ReviewDecisionRequest
    {
        public bool Approve { get; set; }
        public string Comment { get; set; }
    }

    public class ITOPS_FindingDecisionRequest
    {
        public bool Accept { get; set; }
        public string Comment { get; set; }
        public string ActionTaken { get; set; }
    }

    public class ITOPS_ExecutiveDashboard
    {
        public int SumOfScores { get; set; }
        public int MaxPossibleScore { get; set; }
        public decimal? AverageScore { get; set; }
        public decimal? MaturityPercent { get; set; }
        public string MaturityLevel { get; set; }
        public int DomainsCompleted { get; set; }
        public int DomainsInProgress { get; set; }
        public int DomainsNotStarted { get; set; }
    }

    public class ITOPS_TopRiskRow
    {
        public string DomainName { get; set; }
        public string Category { get; set; }
        public string ParameterName { get; set; }
        public int? CurrentScore { get; set; }
        public int Gap { get; set; }
        public string RecommendedAction { get; set; }
    }

    public class ITOPS_DomainListRow
    {
        public int DomainId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int? MinRequiredScore { get; set; }
    }

    public class ITOPS_EvidenceRow
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
        public long FileSizeBytes { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ITOPS_NotificationRow
    {
        public int Id { get; set; }
        public string NotificationType { get; set; }
        public string Message { get; set; }
        public int? AssessmentId { get; set; }
        public int? FindingId { get; set; }
        public int? DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string CustId { get; set; }
        public string AccountName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class ITOPS_AssessmentInfo
    {
        public int AssessmentId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string CustId { get; set; }
        public string CoeSpocEmpId { get; set; }
        public string CoeSpocName { get; set; }
        public string ReviewerEmpId { get; set; }
        public string ReviewerName { get; set; }
        public string AssesseeEmpId { get; set; }
        public string Status { get; set; }
        public string ReturnComment { get; set; }
    }

    public partial class AllSysController
    {
        private static readonly string[] ITOPS_COMPLETED_STATUSES = { "Approved", "PendingReview", "Closed" };

        private static string GetMaturityLevel(decimal? maturityPercent)
        {
            if (!maturityPercent.HasValue) return null;
            if (maturityPercent <= 20) return "Ad Hoc";
            if (maturityPercent <= 40) return "Developing";
            if (maturityPercent <= 60) return "Defined";
            if (maturityPercent <= 80) return "Managed";
            return "Optimized";
        }

        // One lock per account, so the several near-simultaneous requests the landing page
        // fires on account selection (domain tracker, assessees, top risks) can't all read
        // "no assessment row yet" before any of them commits and insert the same domain
        // twice - this was the cause of the duplicate ITOPS_ASSESSMENT rows per domain.
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, object> _ensureAssessmentsLocks =
            new System.Collections.Concurrent.ConcurrentDictionary<string, object>();

        // Backs the Domain Tracker/Executive Dashboard: every active domain must have a row for
        // this account even before its COE SPOC has opened it, so "Not Started" domains show up too.
        private void EnsureAssessmentsForAccount(string custId)
        {
            var gate = _ensureAssessmentsLocks.GetOrAdd(custId ?? string.Empty, _ => new object());
            lock (gate)
            {
                var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => d.ISACTIVE).ToList();
                var existingDomainIds = CSPdb.ITOPS_ASSESSMENT.GetAll()
                    .Where(a => a.ISACTIVE && a.CUST_ID == custId)
                    .Select(a => a.DOMAIN_ID)
                    .ToList();
                var missing = domains.Where(d => !existingDomainIds.Contains(d.ID)).ToList();
                if (!missing.Any()) return;

                var empId = GetHeaderDetails_String("empId");
                foreach (var domain in missing)
                {
                    var assessment = new ITOPS_ASSESSMENT
                    {
                        DOMAIN_ID = domain.ID,
                        CUST_ID = custId,
                        COE_SPOC_EMP_ID = domain.DEFAULT_COE_SPOC_EMP_ID,
                        REVIEWER_EMP_ID = domain.DEFAULT_REVIEWER_EMP_ID,
                        STATUS = "NotStarted"
                    };
                    UpdateAuditFields(assessment, empId);
                    CSPdb.ITOPS_ASSESSMENT.Add(assessment);
                }
                CSPdb.Commit(CanCommit);
            }
        }

        // EMP_INFO can carry more than one row per EMP_ID (rehire history) - DOR (date of
        // relieving) is null on the currently-active record and set on old/stale ones.
        // Without this filter, FirstOrDefault() can non-deterministically resolve a stale
        // row's EMAIL_ID/FRST_NM instead of the employee's real current one.
        private string GetEmpEmail(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return null;
            return Cldb.EMP_INFO.GetAll().FirstOrDefault(e => e.EMP_ID == empId && e.DOR == null)?.EMAIL_ID;
        }

        private string GetEmpName(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return empId;
            return Cldb.EMP_INFO.GetAll().FirstOrDefault(e => e.EMP_ID == empId && e.DOR == null)?.FRST_NM ?? empId;
        }

        /// <summary>
        /// Sends one IT Ops Maturity notification email using the same EmailProvider/GetEmailContent
        /// pipeline every other CSM notification already goes through. Resolves toEmpId to an email
        /// via EMP_INFO; if that lookup fails (no email on file), the send is skipped rather than
        /// erroring the calling action out - notification delivery should never block a save/decision.
        /// </summary>
        private void SendITOpsNotificationEmail(string toEmpId, string subject, string templateFileName, Dictionary<string, string> values)
        {
            SendITOpsNotificationEmailToMany(new List<string> { toEmpId }, subject, templateFileName, values);
        }

        /// <summary>
        /// Same as SendITOpsNotificationEmail, but for a group of recipients (e.g. every
        /// assessee on an account) - sends ONE email with all resolved addresses on the To
        /// line (EmailProvider already accepts a comma-separated "to"), instead of one
        /// separate email per person.
        /// </summary>
        private void SendITOpsNotificationEmailToMany(List<string> toEmpIds, string subject, string templateFileName, Dictionary<string, string> values)
        {
            try
            {
                var toEmails = (toEmpIds ?? new List<string>())
                    .Select(GetEmpEmail)
                    .Where(e => !string.IsNullOrWhiteSpace(e))
                    .Distinct()
                    .ToList();
                if (!toEmails.Any()) return;

                var fromEmail = ConfigurationManager.AppSettings["emailid"];
                var fromPassword = ConfigurationManager.AppSettings["emailpassword"];
                var content = helper.GetEmailContent(templateFileName, values);

                var ep = new EmailProvider(Cldb, CSPdb);
                ep.SendEmail(
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = fromEmail, smtpHost = "smtp.office365.com", smtpPassword = fromPassword, smtpPortValue = "587" },
                    new EmailContent { from = fromEmail, to = string.Join(",", toEmails), cc = "", content = content, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                    Request
                );
            }
            catch (Exception ex)
            {
                LogRequest(ex, "ITOpsMaturity:SendNotificationEmail");
            }
        }

        /// <summary>
        /// Logs one ITOPS_NOTIFICATION row so the recipient sees it in the in-app bell
        /// dropdown (GetITOpsMyNotifications), independent of whether the email send
        /// itself succeeds - the bell is the durable record, email is best-effort.
        /// </summary>
        private void CreateITOpsNotification(string recipientEmpId, string notificationType, int? assessmentId, int? findingId, string message)
        {
            if (string.IsNullOrWhiteSpace(recipientEmpId)) return;
            try
            {
                var notification = new ITOPS_NOTIFICATION
                {
                    NOTIFICATION_TYPE = notificationType,
                    ASSESSMENT_ID = assessmentId,
                    FINDING_ID = findingId,
                    RECIPIENT_EMP_ID = recipientEmpId,
                    MESSAGE = message,
                    IS_SENT = true,
                    SENT_DATE = DateTime.Now
                };
                UpdateAuditFields(notification);
                CSPdb.ITOPS_NOTIFICATION.Add(notification);
                CSPdb.Commit(CanCommit);
            }
            catch (Exception ex)
            {
                LogRequest(ex, "ITOpsMaturity:CreateNotification");
            }
        }

        /// <summary>Sends the notification email and logs the matching bell-dropdown row in one call.</summary>
        private void NotifyITOps(string toEmpId, string subject, string templateFileName, Dictionary<string, string> values, string notificationType, int? assessmentId, int? findingId, string message)
        {
            SendITOpsNotificationEmail(toEmpId, subject, templateFileName, values);
            CreateITOpsNotification(toEmpId, notificationType, assessmentId, findingId, message);
        }

        /// <summary>
        /// Same idea as NotifyITOps, but for a group of recipients: one shared email to
        /// everyone (SendITOpsNotificationEmailToMany), plus one ITOPS_NOTIFICATION bell
        /// row per person - each person's bell is still their own, only the email is shared.
        /// </summary>
        private void NotifyITOpsMany(List<string> toEmpIds, string subject, string templateFileName, Dictionary<string, string> values, string notificationType, int? assessmentId, int? findingId, string message)
        {
            SendITOpsNotificationEmailToMany(toEmpIds, subject, templateFileName, values);
            foreach (var empId in toEmpIds ?? new List<string>())
            {
                CreateITOpsNotification(empId, notificationType, assessmentId, findingId, message);
            }
        }

        /// <summary>
        /// Resolves ("clears") a still-pending notification once its underlying action is actually
        /// taken - e.g. the "submitted for review" bell entry disappears when the reviewer reviews
        /// it, not just when they view/click it. The bell should only ever clear an item because the
        /// work behind it is done, never merely because the user opened the dropdown.
        /// </summary>
        private void ResolveITOpsNotifications(int assessmentId, string notificationType, string recipientEmpId = null)
        {
            var query = CSPdb.ITOPS_NOTIFICATION.GetAll()
                .Where(n => n.ISACTIVE && n.ASSESSMENT_ID == assessmentId && n.NOTIFICATION_TYPE == notificationType);
            if (!string.IsNullOrWhiteSpace(recipientEmpId))
                query = query.Where(n => n.RECIPIENT_EMP_ID == recipientEmpId);

            foreach (var notification in query.ToList())
            {
                // UpdateAuditFieldsExt unconditionally sets ISACTIVE = true (it's a generic
                // "touch" helper, not resolve-aware) - it must run BEFORE clearing ISACTIVE,
                // or it silently stomps the dismissal back to active.
                UpdateAuditFields(notification);
                notification.ISACTIVE = false;
                CSPdb.ITOPS_NOTIFICATION.Update(notification);
            }
            CSPdb.Commit(CanCommit);
        }

        // Static list of the 14 technology domains (master data), for building the account picker.
        [GET("GetITOpsDomainList")]
        [ActionName("GetITOpsDomainList")]
        [HttpGet]
        public IHttpActionResult GetITOpsDomainList()
        {
            var rows = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => d.ISACTIVE)
                .OrderBy(d => d.DISPLAY_ORDER)
                .Select(d => new ITOPS_DomainListRow
                {
                    DomainId = d.ID,
                    Code = d.CODE,
                    Name = d.NAME,
                    MinRequiredScore = d.MIN_REQUIRED_SCORE
                }).ToList();

            return Ok(rows);
        }

        // Accounts list scoped to project staffing (GetCustomerIds) misses accounts
        // where an employee is only assigned as IT Ops COE SPOC / Reviewer without
        // being staffed on that account's projects - e.g. a Reviewer covering a
        // domain for an account he isn't otherwise allocated to. This surfaces
        // those accounts too, based on real ITOPS_ASSESSMENT assignments, so they
        // can be merged into the account picker on the frontend.
        [GET("GetITOpsAccountsForEmp")]
        [ActionName("GetITOpsAccountsForEmp")]
        [HttpGet]
        public IHttpActionResult GetITOpsAccountsForEmp(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok(new List<ProjectsBaseCustomer>());

            var custIds = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && (a.COE_SPOC_EMP_ID == empId || a.REVIEWER_EMP_ID == empId))
                .Select(a => a.CUST_ID)
                .Distinct()
                .ToList();

            var result = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new ProjectsBaseCustomer { CUST_ID = c.CUST_ID, CUST_NM = c.CUST_NM })
                .OrderBy(c => c.CUST_NM)
                .ToList();

            return Ok(result);
        }

        // The nav's "IT Operations Maturity" icon (shell navbar-new.component) is gated
        // on the shared APP_ACCESS_CONTROLS resource 830, which today only grants
        // VIEW_ACCESS to one static CSM role - anyone actually assigned as COE SPOC,
        // Reviewer, GDH, or Assessee on any assessment should see the icon too, even if
        // their CSM role isn't otherwise granted that resource. The shell calls this
        // alongside the normal access-control check and shows the icon if either says yes.
        private static readonly Dictionary<string, string[]> GdhEmailsByBusinessUnit = new Dictionary<string, string[]>
        {
            { "health care", new[] { "balakrishnan.s@neurealm.com" } },
            { "tech", new[] { "prashant.muley@neurealm.com" } },
            { "india & gcc", new[] { "sriram.radhakrishnan@neurealm.com" } },
            { "cit", new[] { "nandagopal.kumar@neurealm.com" } },
            { "sead", new[] { "pradeep.sukumaran@ignitarium.com", "sujith@ignitarium.com", "ramesh@ignitarium.com", "sanjayjk@ignitarium.com", "sujeeth.joseph@ignitarium.com" } },
        };

        [GET("GetITOpsHasAccess")]
        [ActionName("GetITOpsHasAccess")]
        [HttpGet]
        public IHttpActionResult GetITOpsHasAccess(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok(false);

            var assignedAsSpocOrReviewer = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Any(a => a.ISACTIVE && (a.COE_SPOC_EMP_ID == empId || a.REVIEWER_EMP_ID == empId));
            if (assignedAsSpocOrReviewer) return Ok(true);

            var assigneeCsvValues = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSEE_EMP_ID != null && a.ASSESSEE_EMP_ID.Contains(empId))
                .Select(a => a.ASSESSEE_EMP_ID)
                .ToList();
            var assignedAsAssessee = assigneeCsvValues.Any(csv => csv.Split(',').Select(id => id.Trim()).Contains(empId));
            if (assignedAsAssessee) return Ok(true);

            var email = GetEmpEmail(empId);
            if (!string.IsNullOrWhiteSpace(email))
            {
                var isGdh = GdhEmailsByBusinessUnit.Values.Any(list => list.Contains(email.Trim(), StringComparer.OrdinalIgnoreCase));
                if (isGdh) return Ok(true);
            }

            return Ok(false);
        }

        // Reports page (real backend data) - registered the same way every other
        // CSM report is, via a REPORTS_SP_DETAILS/REPORTS_PARAMS-shaped table pair
        // and AppRepository.GetTable(), except this module keeps its own copy
        // (ITOPS_REPORT_SP_DETAILS/ITOPS_REPORT_PARAMS) instead of sharing the
        // app-wide ones, so IT Ops report registrations stay isolated.
        [GET("GetITOpsReportSps")]
        [ActionName("GetITOpsReportSps")]
        [HttpGet]
        public IHttpActionResult GetITOpsReportSps()
        {
            var rows = CSPdb.ITOPS_REPORT_SP_DETAILS.GetAll().OrderBy(x => x.SP_DISPLAY_NAME).ToList();
            return Ok(rows);
        }

        [GET("GetITOpsReportParams")]
        [ActionName("GetITOpsReportParams")]
        [HttpGet]
        public IHttpActionResult GetITOpsReportParams(int spId)
        {
            var rows = CSPdb.ITOPS_REPORT_PARAMS.GetAll().Where(p => p.REPORT_SP_ID == spId).ToList();
            return Ok(rows);
        }

        [POST("GetITOpsReportData")]
        [ActionName("GetITOpsReportData")]
        [HttpPost]
        public IHttpActionResult GetITOpsReportData([FromBody] List<ITOPS_REPORT_PARAMS> lstParams)
        {
            string spName = GetHeaderDetails_String("spname");
            if (string.IsNullOrWhiteSpace(spName)) return Content(HttpStatusCode.Conflict, ERROR_MSG);

            if (lstParams != null && lstParams.Any())
            {
                CSPdb.ITOPS_REPORT_PARAMS.Update(lstParams);
                CSPdb.Commit(CanCommit);
            }

            // AppRepository.GetTable() takes the shared REPORTS_PARAMS shape - build
            // throwaway instances from our own params purely to pass PARAM_NAME/
            // PARAM_VALUE through; nothing here touches the shared REPORTS_PARAMS table.
            var sharedShapeParams = (lstParams ?? new List<ITOPS_REPORT_PARAMS>())
                .Select(p => new REPORTS_PARAMS { PARAM_NAME = p.PARAM_NAME, PARAM_TYPE = p.PARAM_TYPE, PARAM_VALUE = p.PARAM_VALUE })
                .ToList();

            var table = Cldb.AppRepo.GetTable(spName, sharedShapeParams);
            return Ok(table);
        }

        // The IT Ops Maturity account picker should list every account regardless
        // of the logged-in user's own project staffing/allocation - COE SPOC and
        // Reviewer assignments for this module are managed independently of that
        // (per-domain, per-account), so any user should be able to pick any account.
        [GET("GetITOpsAllAccounts")]
        [ActionName("GetITOpsAllAccounts")]
        [HttpGet]
        public IHttpActionResult GetITOpsAllAccounts()
        {
            var result = Cldb.CUSTOMER.GetAll()
                .Where(c => c.CUST_ID != "202100062")
                .OrderBy(c => c.CUST_NM)
                .ToList();

            return Ok(result);
        }

        // The shared GetAccountAssesseeDetails endpoint gates on CheckUserHasAccess,
        // which throws for anyone not staffed on the account's projects - blocking a
        // Reviewer/COE SPOC who is assigned to a domain on an account he isn't
        // otherwise allocated to. This mirrors GetAccountAssesseeDetails but grants
        // access whenever the caller has a real ITOPS_ASSESSMENT assignment on the
        // account too, falling back to the normal staffing check for everyone else.
        [GET("GetITOpsAssesseesForAccount")]
        [ActionName("GetITOpsAssesseesForAccount")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssesseesForAccount(string custId)
        {
            string empId = GetHeaderDetails_String("empId");

            // Assessment rows (and their COE_SPOC_EMP_ID/REVIEWER_EMP_ID, seeded from each
            // domain's defaults) only exist for an account once someone has opened it here
            // before - ensure they exist first, otherwise a COE SPOC/Reviewer opening an
            // account for the very first time would wrongly fail the check below and fall
            // through to the staffing-based access check they were never meant to need.
            EnsureAssessmentsForAccount(custId);

            bool isItOpsAssigned = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Any(a => a.ISACTIVE && a.CUST_ID == custId && (a.COE_SPOC_EMP_ID == empId || a.REVIEWER_EMP_ID == empId));

            if (!isItOpsAssigned)
            {
                CheckUserHasAccess(empId, custId, "");
            }

            // The underlying getAccountAssesseeDetails SP can surface stale/relieved
            // EMP_INFO rows (rehire history) - only offer currently-active people
            // (DOR IS NULL) as assessees.
            var result = Cldb.AppRepo.GetAccountAssesseeDetails(custId).Where(e => e.DOR == null).ToList();
            return Ok(result);
        }

        // Assessee selection is an account-wide choice (not per-domain), but it lives on
        // each domain's ITOPS_ASSESSMENT row - reads/writes it via any one active row for
        // the account so a COE SPOC's choice is persisted once and reused by anyone else
        // opening the same account (e.g. the Reviewer), instead of every login re-picking it.
        [GET("GetITOpsSelectedAssessees")]
        [ActionName("GetITOpsSelectedAssessees")]
        [HttpGet]
        public IHttpActionResult GetITOpsSelectedAssessees(string custId)
        {
            var csv = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && a.CUST_ID == custId && !string.IsNullOrEmpty(a.ASSESSEE_EMP_ID))
                .Select(a => a.ASSESSEE_EMP_ID)
                .FirstOrDefault();

            var empIds = string.IsNullOrWhiteSpace(csv)
                ? new List<string>()
                : csv.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToList();

            return Ok(empIds);
        }

        public class ITOPS_SaveAssesseesRequest
        {
            public string CustId { get; set; }
            public List<string> AssesseeEmpIds { get; set; }
        }

        [POST("SaveITOpsSelectedAssessees")]
        [ActionName("SaveITOpsSelectedAssessees")]
        [HttpPost]
        public IHttpActionResult SaveITOpsSelectedAssessees([FromBody] ITOPS_SaveAssesseesRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.CustId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            EnsureAssessmentsForAccount(request.CustId);

            string empId = GetHeaderDetails_String("empId");
            var csv = string.Join(",", (request.AssesseeEmpIds ?? new List<string>()).Distinct());

            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => a.ISACTIVE && a.CUST_ID == request.CustId).ToList();
            foreach (var assessment in assessments)
            {
                assessment.ASSESSEE_EMP_ID = csv;
                UpdateAuditFields(assessment, empId);
                CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // Finds this account's assessment instance for a domain, creating one (seeded with the
        // domain's default owners) the first time a COE SPOC opens it for that account.
        [GET("GetOrCreateITOpsAssessment")]
        [ActionName("GetOrCreateITOpsAssessment")]
        [HttpGet]
        public IHttpActionResult GetOrCreateITOpsAssessment(string domainCode, string custId)
        {
            if (string.IsNullOrWhiteSpace(domainCode) || string.IsNullOrWhiteSpace(custId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.CODE == domainCode && d.ISACTIVE);
            if (domain == null)
                return NotFound();

            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .FirstOrDefault(a => a.DOMAIN_ID == domain.ID && a.CUST_ID == custId && a.ISACTIVE);

            if (assessment == null)
            {
                var empId = GetHeaderDetails_String("empId");
                assessment = new ITOPS_ASSESSMENT
                {
                    DOMAIN_ID = domain.ID,
                    CUST_ID = custId,
                    COE_SPOC_EMP_ID = domain.DEFAULT_COE_SPOC_EMP_ID,
                    REVIEWER_EMP_ID = domain.DEFAULT_REVIEWER_EMP_ID,
                    STATUS = "NotStarted"
                };
                UpdateAuditFields(assessment, empId);
                CSPdb.ITOPS_ASSESSMENT.Add(assessment);
                CSPdb.Commit(CanCommit);
            }

            return Ok(new ITOPS_AssessmentInfo
            {
                AssessmentId = assessment.ID,
                DomainId = domain.ID,
                DomainCode = domain.CODE,
                DomainName = domain.NAME,
                CustId = assessment.CUST_ID,
                CoeSpocEmpId = assessment.COE_SPOC_EMP_ID,
                CoeSpocName = GetEmpName(assessment.COE_SPOC_EMP_ID),
                ReviewerEmpId = assessment.REVIEWER_EMP_ID,
                ReviewerName = GetEmpName(assessment.REVIEWER_EMP_ID),
                AssesseeEmpId = assessment.ASSESSEE_EMP_ID,
                Status = assessment.STATUS,
                ReturnComment = assessment.RETURN_COMMENT
            });
        }

        // Landing page Domain Tracker table
        [GET("GetITOpsDomainTracker")]
        [ActionName("GetITOpsDomainTracker")]
        [HttpGet]
        public IHttpActionResult GetITOpsDomainTracker(string custId, string coeSpocEmpId = null)
        {
            if (string.IsNullOrWhiteSpace(custId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            EnsureAssessmentsForAccount(custId);

            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => a.ISACTIVE && a.CUST_ID == custId);
            if (!string.IsNullOrWhiteSpace(coeSpocEmpId))
                assessments = assessments.Where(a => a.COE_SPOC_EMP_ID == coeSpocEmpId);

            var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => d.ISACTIVE).ToDictionary(d => d.ID);
            var allScores = CSPdb.ITOPS_SCORE.GetAll().Where(s => s.ISACTIVE).ToList();
            var paramCountByDomain = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.ISACTIVE)
                .Join(CSPdb.ITOPS_CATEGORY.GetAll().Where(c => c.ISACTIVE), p => p.CATEGORY_ID, c => c.ID, (p, c) => c.DOMAIN_ID)
                .GroupBy(domainId => domainId)
                .ToDictionary(g => g.Key, g => g.Count());

            var assessmentList = assessments.ToList();
            var empIds = assessmentList.Select(a => a.COE_SPOC_EMP_ID)
                .Concat(assessmentList.Select(a => a.REVIEWER_EMP_ID))
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();
            // GroupBy rather than ToDictionary directly: EMP_INFO can carry more than one row for the
            // same EMP_ID (rehire history), which would otherwise throw here. Prefer the currently-
            // active row (DOR IS NULL) within each group so a stale/relieved duplicate never wins.
            var empNames = Cldb.EMP_INFO.GetAll()
                .Where(e => empIds.Contains(e.EMP_ID))
                .ToList()
                .GroupBy(e => e.EMP_ID)
                .ToDictionary(g => g.Key, g => (g.FirstOrDefault(e => e.DOR == null) ?? g.First()).FRST_NM);

            var rows = assessmentList.Select(a =>
            {
                var scored = allScores.Where(s => s.ASSESSMENT_ID == a.ID && s.SCORE_VALUE != null).ToList();
                decimal? avg = scored.Count == 0 ? (decimal?)null : (decimal)scored.Sum(s => s.SCORE_VALUE.Value) / scored.Count;
                decimal? maturityPct = avg.HasValue ? avg.Value / 5 * 100 : (decimal?)null;
                var paramCount = paramCountByDomain.ContainsKey(a.DOMAIN_ID) ? paramCountByDomain[a.DOMAIN_ID] : 0;

                return new ITOPS_DomainTrackerRow
                {
                    AssessmentId = a.ID,
                    DomainId = a.DOMAIN_ID,
                    DomainCode = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].CODE : null,
                    DomainName = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].NAME : null,
                    CoeSpocEmpId = a.COE_SPOC_EMP_ID,
                    CoeSpocName = a.COE_SPOC_EMP_ID != null && empNames.ContainsKey(a.COE_SPOC_EMP_ID) ? empNames[a.COE_SPOC_EMP_ID] : a.COE_SPOC_EMP_ID,
                    ReviewerEmpId = a.REVIEWER_EMP_ID,
                    ReviewerName = a.REVIEWER_EMP_ID != null && empNames.ContainsKey(a.REVIEWER_EMP_ID) ? empNames[a.REVIEWER_EMP_ID] : a.REVIEWER_EMP_ID,
                    Status = a.STATUS,
                    ParamCount = paramCount,
                    SumScores = scored.Sum(s => s.SCORE_VALUE.Value),
                    MaxPossible = paramCount * 5,
                    AverageScore = avg,
                    MaturityPercent = maturityPct,
                    MaturityLevel = GetMaturityLevel(maturityPct)
                };
            }).ToList();

            return Ok(rows);
        }

        // Assessment View: rubric + current score per parameter for one assessment (US-002)
        [GET("GetITOpsAssessmentParameters")]
        [ActionName("GetITOpsAssessmentParameters")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssessmentParameters(int assessmentId)
        {
            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId && a.ISACTIVE);
            if (assessment == null)
                return NotFound();

            var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);
            var categories = CSPdb.ITOPS_CATEGORY.GetAll().Where(c => c.DOMAIN_ID == assessment.DOMAIN_ID && c.ISACTIVE).ToDictionary(c => c.ID);
            var parameters = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => categories.Keys.Contains(p.CATEGORY_ID) && p.ISACTIVE)
                .OrderBy(p => p.DISPLAY_ORDER)
                .ToList();

            var scores = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ASSESSMENT_ID == assessmentId && s.ISACTIVE)
                .ToDictionary(s => s.PARAMETER_ID);

            var findingsByScoreId = CSPdb.ITOPS_FINDING.GetAll()
                .Where(f => f.ASSESSMENT_ID == assessmentId && f.ISACTIVE)
                .ToList()
                .GroupBy(f => f.SCORE_ID)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(f => f.ID).First());

            var result = parameters.Select(p =>
            {
                scores.TryGetValue(p.ID, out var s);
                var category = categories[p.CATEGORY_ID];
                ITOPS_FINDING finding = null;
                if (s != null) findingsByScoreId.TryGetValue(s.ID, out finding);

                return new ITOPS_ParameterScoreRow
                {
                    ParameterId = p.ID,
                    Category = category.NAME,
                    ParameterName = p.NAME,
                    Definition = p.DEFINITION,
                    Level1_AdHoc = p.LEVEL1_ADHOC,
                    Level2_Developing = p.LEVEL2_DEVELOPING,
                    Level3_Defined = p.LEVEL3_DEFINED,
                    Level4_Managed = p.LEVEL4_MANAGED,
                    Level5_Optimized = p.LEVEL5_OPTIMIZED,
                    MinRequiredScore = p.MIN_REQUIRED_SCORE ?? (domain != null ? domain.MIN_REQUIRED_SCORE : null),
                    ScoreId = s?.ID,
                    ScoreValue = s?.SCORE_VALUE,
                    Notes = s?.NOTES,
                    FindingId = finding?.ID,
                    FindingStatus = finding?.STATUS,
                    FindingRejectionComment = finding?.REJECTION_COMMENT,
                    FindingActionTaken = finding?.ACTION_TAKEN
                };
            }).ToList();

            return Ok(result);
        }

        // US-003: assessor enters score + mandatory notes; score < 5 auto-raises a Finding
        [POST("UpsertITOpsScore")]
        [ActionName("UpsertITOpsScore")]
        [HttpPost]
        public IHttpActionResult UpsertITOpsScore([FromBody] ITOPS_UpsertScoreRequest request)
        {
            LogRequest(prefix: "UpsertITOpsScore", content: JsonConvert.SerializeObject(request));

            if (request == null)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            // Notes are mandated by US-003 before the assessment can be submitted for review
            // (enforced client-side in openSubmitModal() and re-checked in SubmitITOpsAssessment
            // below) - but an in-progress draft save must not be blocked on that yet.
            var empId = GetHeaderDetails_String("empId");

            var score = CSPdb.ITOPS_SCORE.GetAll()
                .FirstOrDefault(s => s.ASSESSMENT_ID == request.AssessmentId && s.PARAMETER_ID == request.ParameterId);

            var isNew = score == null;
            if (isNew)
                score = new ITOPS_SCORE { ASSESSMENT_ID = request.AssessmentId, PARAMETER_ID = request.ParameterId };

            score.SCORE_VALUE = request.ScoreValue;
            score.NOTES = request.Notes;
            score.IS_IMPROVEMENT_AREA = request.ScoreValue.HasValue && request.ScoreValue.Value < 5;
            score.IMPROVEMENT_STATUS = score.IS_IMPROVEMENT_AREA ? "Proposed" : null;

            UpdateAuditFields(score, empId);

            if (isNew)
                CSPdb.ITOPS_SCORE.Add(score);
            else
                CSPdb.ITOPS_SCORE.Update(score);
            CSPdb.Commit(CanCommit);

            // Auto-create/refresh the Finding driving the Gap Analysis section
            if (score.IS_IMPROVEMENT_AREA)
            {
                var gap = 5 - request.ScoreValue.Value;
                var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.SCORE_ID == score.ID);
                if (finding == null)
                {
                    finding = new ITOPS_FINDING
                    {
                        SCORE_ID = score.ID,
                        ASSESSMENT_ID = request.AssessmentId,
                        GAP = gap,
                        STATUS = "Open"
                    };
                    UpdateAuditFields(finding, empId);
                    CSPdb.ITOPS_FINDING.Add(finding);
                }
                else
                {
                    finding.GAP = gap;
                    UpdateAuditFields(finding, empId);
                    CSPdb.ITOPS_FINDING.Update(finding);
                }
                CSPdb.Commit(CanCommit);
            }

            return Ok(score);
        }

        // US-004: Save Draft - persists progress without triggering the review workflow/notification
        [POST("SaveITOpsAssessmentDraft")]
        [ActionName("SaveITOpsAssessmentDraft")]
        [HttpPost]
        public IHttpActionResult SaveITOpsAssessmentDraft(int assessmentId)
        {
            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId && a.ISACTIVE);
            if (assessment == null)
                return NotFound();

            if (assessment.STATUS == "NotStarted")
                assessment.STATUS = "Draft";
            UpdateAuditFields(assessment);
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

            return Ok(assessment);
        }

        // US-004: Save Draft / Submit for Review
        [POST("SubmitITOpsAssessment")]
        [ActionName("SubmitITOpsAssessment")]
        [HttpPost]
        public IHttpActionResult SubmitITOpsAssessment(int assessmentId)
        {
            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId && a.ISACTIVE);
            if (assessment == null)
                return NotFound();

            // string.IsNullOrWhiteSpace() can't be translated by LINQ to Entities - spelled out
            // as a null/trim check instead, which SQL Server can translate directly.
            var scoresMissingNotes = CSPdb.ITOPS_SCORE.GetAll()
                .Any(s => s.ASSESSMENT_ID == assessmentId && s.ISACTIVE && s.SCORE_VALUE != null
                    && (s.NOTES == null || s.NOTES.Trim().Length == 0));
            if (scoresMissingNotes)
                return Content(HttpStatusCode.Conflict, "Notes are mandatory for every scored parameter before submitting for review.");

            // Per US-005 note 5: skip the review gate when the reviewer is the same person as the COE SPOC
            var skipReview = assessment.REVIEWER_EMP_ID == assessment.COE_SPOC_EMP_ID;
            assessment.STATUS = skipReview ? "Approved" : "PendingReview";
            assessment.SUBMITTED_DATE = DateTime.Now;
            UpdateAuditFields(assessment);
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

            // Re-submitting is the COE SPOC's response to a return-for-revision - that
            // notification is now acted on, so clear it.
            ResolveITOpsNotifications(assessment.ID, "AssessmentReturned", assessment.COE_SPOC_EMP_ID);

            if (!skipReview)
            {
                var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);
                NotifyITOps(
                    assessment.REVIEWER_EMP_ID,
                    $"IT Ops Maturity: {domain?.NAME} assessment submitted for review",
                    "ITOpsSubmittedForReview.htm",
                    new Dictionary<string, string>
                    {
                        { "ReviewerName", GetEmpName(assessment.REVIEWER_EMP_ID) },
                        { "CoeSpocName", GetEmpName(assessment.COE_SPOC_EMP_ID) },
                        { "DomainName", domain?.NAME }
                    },
                    "SubmittedForReview", assessment.ID, null,
                    $"{domain?.NAME} assessment submitted for your review by {GetEmpName(assessment.COE_SPOC_EMP_ID)}.");
            }

            return Ok(assessment);
        }

        // US-005: Reviewer approves or returns for revision
        [POST("ReviewITOpsAssessment")]
        [ActionName("ReviewITOpsAssessment")]
        [HttpPost]
        public IHttpActionResult ReviewITOpsAssessment(int assessmentId, [FromBody] ITOPS_ReviewDecisionRequest request)
        {
            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId && a.ISACTIVE);
            if (assessment == null)
                return NotFound();

            if (request == null)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            if (!request.Approve && string.IsNullOrWhiteSpace(request.Comment))
                return Content(HttpStatusCode.Conflict, "A comment is required when returning an assessment for revision.");

            assessment.STATUS = request.Approve ? "Approved" : "ReturnedForRevision";
            assessment.RETURN_COMMENT = request.Approve ? null : request.Comment;
            assessment.APPROVED_DATE = request.Approve ? DateTime.Now : (DateTime?)null;
            UpdateAuditFields(assessment);
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

            // The reviewer has now acted on it - clear their "submitted for review" item.
            ResolveITOpsNotifications(assessment.ID, "SubmittedForReview", assessment.REVIEWER_EMP_ID);

            var reviewedDomain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);
            NotifyITOps(
                assessment.COE_SPOC_EMP_ID,
                $"IT Ops Maturity: {reviewedDomain?.NAME} assessment {(request.Approve ? "approved" : "returned for revision")}",
                "ITOpsReviewDecision.htm",
                new Dictionary<string, string>
                {
                    { "CoeSpocName", GetEmpName(assessment.COE_SPOC_EMP_ID) },
                    { "ReviewerName", GetEmpName(assessment.REVIEWER_EMP_ID) },
                    { "DomainName", reviewedDomain?.NAME },
                    { "Decision", request.Approve ? "Approved" : "Returned for Revision" },
                    { "Comment", request.Approve ? "-" : request.Comment }
                },
                request.Approve ? "AssessmentApproved" : "AssessmentReturned", assessment.ID, null,
                $"{reviewedDomain?.NAME} assessment {(request.Approve ? "approved" : "returned for revision")} by {GetEmpName(assessment.REVIEWER_EMP_ID)}.");

            // Once approved, every assessee on this account needs to act on any probable
            // areas of improvement (findings) already raised while scoring - notify each
            // of them by email and log a matching bell-dropdown entry, same as the other
            // review-workflow notifications above.
            if (request.Approve)
            {
                var openFindingCount = CSPdb.ITOPS_FINDING.GetAll()
                    .Count(f => f.ISACTIVE && f.ASSESSMENT_ID == assessment.ID && f.STATUS == "Open");

                if (openFindingCount > 0 && !string.IsNullOrWhiteSpace(assessment.ASSESSEE_EMP_ID))
                {
                    var assesseeIds = assessment.ASSESSEE_EMP_ID.Split(',')
                        .Select(id => id.Trim())
                        .Where(id => id.Length > 0)
                        .Distinct()
                        .ToList();

                    var findingWord = openFindingCount == 1 ? "finding" : "findings";
                    var assesseeNames = string.Join(", ", assesseeIds.Select(GetEmpName));
                    // One shared email to every assessee on the account (not one per person) -
                    // the bell dropdown still logs a separate entry per assessee below.
                    NotifyITOpsMany(
                        assesseeIds,
                        $"IT Ops Maturity: {openFindingCount} {findingWord} need your action - {reviewedDomain?.NAME}",
                        "ITOpsFindingsNeedAction.htm",
                        new Dictionary<string, string>
                        {
                            { "AssesseeName", assesseeNames },
                            { "DomainName", reviewedDomain?.NAME },
                            { "FindingCount", openFindingCount.ToString() }
                        },
                        "FindingsNeedAction", assessment.ID, null,
                        $"{openFindingCount} probable area{(openFindingCount == 1 ? "" : "s")} of improvement raised in {reviewedDomain?.NAME} need your review.");
                }
            }

            return Ok(assessment);
        }

        // US-006: Assessee accepts or rejects a finding
        [GET("GetITOpsFindingsForAssessee")]
        [ActionName("GetITOpsFindingsForAssessee")]
        [HttpGet]
        public IHttpActionResult GetITOpsFindingsForAssessee(string assesseeEmpId)
        {
            var findings = CSPdb.ITOPS_FINDING.GetAll()
                .Where(f => f.ASSESSEE_EMP_ID == assesseeEmpId && f.ISACTIVE)
                .ToList();
            return Ok(findings);
        }

        [POST("DecideITOpsFinding")]
        [ActionName("DecideITOpsFinding")]
        [HttpPost]
        public IHttpActionResult DecideITOpsFinding(int findingId, [FromBody] ITOPS_FindingDecisionRequest request)
        {
            var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.ID == findingId && f.ISACTIVE);
            if (finding == null)
                return NotFound();

            if (request == null)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            if (!request.Accept && string.IsNullOrWhiteSpace(request.Comment))
                return Content(HttpStatusCode.Conflict, "A comment is required when rejecting a finding.");

            var empId = GetHeaderDetails_String("empId");

            finding.STATUS = request.Accept ? "Accepted" : "Rejected";
            finding.REJECTION_COMMENT = request.Accept ? null : request.Comment;
            finding.ACTION_TAKEN = request.ActionTaken;
            UpdateAuditFields(finding, empId);
            CSPdb.ITOPS_FINDING.Update(finding);

            var activity = new ITOPS_FINDING_ACTIVITY
            {
                FINDING_ID = findingId,
                ACTIVITY_TYPE = "Comment",
                COMMENTS = request.Comment,
                FROM_EMP_ID = empId
            };
            UpdateAuditFields(activity, empId);
            CSPdb.ITOPS_FINDING_ACTIVITY.Add(activity);
            CSPdb.Commit(CanCommit);

            // The assessee's "findings need action" item only clears once every finding
            // on this assessment has actually been decided, not just this one.
            var anyOpenFindingsRemain = CSPdb.ITOPS_FINDING.GetAll()
                .Any(f => f.ISACTIVE && f.ASSESSMENT_ID == finding.ASSESSMENT_ID && f.STATUS == "Open");
            if (!anyOpenFindingsRemain)
                ResolveITOpsNotifications(finding.ASSESSMENT_ID, "FindingsNeedAction");

            var findingAssessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == finding.ASSESSMENT_ID);
            var findingScore = CSPdb.ITOPS_SCORE.GetAll().FirstOrDefault(s => s.ID == finding.SCORE_ID);
            var findingParameter = findingScore != null ? CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == findingScore.PARAMETER_ID) : null;
            var findingDomain = findingAssessment != null ? CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == findingAssessment.DOMAIN_ID) : null;
            if (findingAssessment != null)
            {
                NotifyITOps(
                    findingAssessment.COE_SPOC_EMP_ID,
                    $"IT Ops Maturity: finding {(request.Accept ? "accepted" : "rejected")} - {findingDomain?.NAME}",
                    "ITOpsFindingDecision.htm",
                    new Dictionary<string, string>
                    {
                        { "CoeSpocName", GetEmpName(findingAssessment.COE_SPOC_EMP_ID) },
                        { "ParameterName", findingParameter?.NAME },
                        { "DomainName", findingDomain?.NAME },
                        { "Decision", request.Accept ? "Accepted" : "Rejected" },
                        { "Comment", request.Accept ? "-" : request.Comment }
                    },
                    request.Accept ? "FindingAccepted" : "FindingRejected", finding.ASSESSMENT_ID, finding.ID,
                    $"Finding \"{findingParameter?.NAME}\" in {findingDomain?.NAME} was {(request.Accept ? "accepted" : "rejected")} by the assessee.");
            }

            CSPdb.Commit(CanCommit);
            return Ok(finding);
        }

        [POST("CloseITOpsFinding")]
        [ActionName("CloseITOpsFinding")]
        [HttpPost]
        public IHttpActionResult CloseITOpsFinding(int findingId)
        {
            var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.ID == findingId && f.ISACTIVE);
            if (finding == null)
                return NotFound();

            finding.STATUS = "Closed";
            finding.CLOSED_DATE = DateTime.Now;
            UpdateAuditFields(finding);
            CSPdb.ITOPS_FINDING.Update(finding);
            CSPdb.Commit(CanCommit);

            return Ok(finding);
        }

        public class ITOPS_UpdateFindingActionRequest
        {
            public string ActionTaken { get; set; }
        }

        // Lets the assessee record/update remediation progress on an accepted finding -
        // separate from DecideITOpsFinding (accept/reject), which only runs once. This can
        // be called repeatedly as work progresses; ACTION_TAKEN always holds the latest
        // text, with the full history in ITOPS_FINDING_ACTIVITY. Notifies the COE SPOC and
        // Reviewer so they know there's progress to look at (and potentially close it).
        [POST("UpdateITOpsFindingAction")]
        [ActionName("UpdateITOpsFindingAction")]
        [HttpPost]
        public IHttpActionResult UpdateITOpsFindingAction(int findingId, [FromBody] ITOPS_UpdateFindingActionRequest request)
        {
            var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.ID == findingId && f.ISACTIVE);
            if (finding == null) return NotFound();

            if (finding.STATUS != "Accepted")
                return Content(HttpStatusCode.Conflict, "An action update can only be submitted for an accepted finding.");

            if (request == null || string.IsNullOrWhiteSpace(request.ActionTaken))
                return Content(HttpStatusCode.Conflict, "Describe the action taken before submitting.");

            var empId = GetHeaderDetails_String("empId");
            finding.ACTION_TAKEN = request.ActionTaken.Trim();
            finding.LAST_MANAGEMENT_UPDATE = DateTime.Now;
            UpdateAuditFields(finding, empId);
            CSPdb.ITOPS_FINDING.Update(finding);

            var activity = new ITOPS_FINDING_ACTIVITY
            {
                FINDING_ID = findingId,
                ACTIVITY_TYPE = "ActionUpdate",
                COMMENTS = finding.ACTION_TAKEN,
                FROM_EMP_ID = empId
            };
            UpdateAuditFields(activity, empId);
            CSPdb.ITOPS_FINDING_ACTIVITY.Add(activity);
            CSPdb.Commit(CanCommit);

            var findingAssessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == finding.ASSESSMENT_ID);
            var findingScore = CSPdb.ITOPS_SCORE.GetAll().FirstOrDefault(s => s.ID == finding.SCORE_ID);
            var findingParameter = findingScore != null ? CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == findingScore.PARAMETER_ID) : null;
            var findingDomain = findingAssessment != null ? CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == findingAssessment.DOMAIN_ID) : null;

            if (findingAssessment != null)
            {
                var recipients = new[] { findingAssessment.COE_SPOC_EMP_ID, findingAssessment.REVIEWER_EMP_ID }
                    .Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();

                NotifyITOpsMany(
                    recipients,
                    $"IT Ops Maturity: action update on finding - {findingDomain?.NAME}",
                    "ITOpsFindingActionUpdate.htm",
                    new Dictionary<string, string>
                    {
                        { "ParameterName", findingParameter?.NAME },
                        { "DomainName", findingDomain?.NAME },
                        { "ActionTaken", finding.ACTION_TAKEN }
                    },
                    "FindingActionUpdate", finding.ASSESSMENT_ID, finding.ID,
                    $"Action update submitted on \"{findingParameter?.NAME}\" in {findingDomain?.NAME}.");
            }

            return Ok(finding);
        }

        [GET("GetITOpsFindingEvidence")]
        [ActionName("GetITOpsFindingEvidence")]
        [HttpGet]
        public IHttpActionResult GetITOpsFindingEvidence(int findingId)
        {
            var rows = CSPdb.ITOPS_EVIDENCE.GetAll()
                .Where(e => e.ISACTIVE && e.FINDING_ID == findingId)
                .OrderByDescending(e => e.CREATED_DATE)
                .Select(e => new ITOPS_EvidenceRow
                {
                    Id = e.ID,
                    FileName = e.FILE_NAME,
                    ContentType = e.CONTENT_TYPE,
                    FileSizeBytes = e.FILE_SIZE_BYTES,
                    CreatedDate = e.CREATED_DATE
                })
                .ToList();
            return Ok(rows);
        }

        // Multipart upload (classic Request.Files, same pattern as FileManagerController.UploadFile)
        // saved to the shared ~/UploadFile/ folder under a random GUID name - kept as an
        // isolated ITOPS_EVIDENCE row rather than reusing the shared FILE_DATA table, same
        // "don't share tables across modules" approach used for the ITOPS report tables.
        [POST("UploadITOpsFindingEvidence")]
        [ActionName("UploadITOpsFindingEvidence")]
        [HttpPost]
        public IHttpActionResult UploadITOpsFindingEvidence(int findingId)
        {
            var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.ID == findingId && f.ISACTIVE);
            if (finding == null) return NotFound();

            var empId = GetHeaderDetails_String("empId");
            var httpRequest = HttpContext.Current.Request;
            if (httpRequest.Files.Count == 0)
                return Content(HttpStatusCode.Conflict, "No file was included in the upload.");

            const long maxBytes = 10 * 1024 * 1024;
            var saved = new List<ITOPS_EVIDENCE>();

            for (int i = 0; i < httpRequest.Files.Count; i++)
            {
                var postedFile = httpRequest.Files[i];
                if (postedFile.ContentLength > maxBytes)
                    return Content(HttpStatusCode.Conflict, $"\"{postedFile.FileName}\" exceeds the 10MB upload limit.");

                var serverFileName = Guid.NewGuid().ToString();
                var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/" + serverFileName);
                postedFile.SaveAs(filePath);

                var evidence = new ITOPS_EVIDENCE
                {
                    FINDING_ID = findingId,
                    FILE_NAME = postedFile.FileName,
                    STORAGE_PATH = serverFileName,
                    FILE_SIZE_BYTES = postedFile.ContentLength,
                    CONTENT_TYPE = postedFile.ContentType
                };
                UpdateAuditFields(evidence, empId);
                CSPdb.ITOPS_EVIDENCE.Add(evidence);
                saved.Add(evidence);
            }
            CSPdb.Commit(CanCommit);

            var result = saved.Select(e => new ITOPS_EvidenceRow
            {
                Id = e.ID,
                FileName = e.FILE_NAME,
                ContentType = e.CONTENT_TYPE,
                FileSizeBytes = e.FILE_SIZE_BYTES,
                CreatedDate = e.CREATED_DATE
            }).ToList();

            return Ok(result);
        }

        [GET("DownloadITOpsEvidence")]
        [ActionName("DownloadITOpsEvidence")]
        [HttpGet]
        public HttpResponseMessage DownloadITOpsEvidence(int evidenceId)
        {
            var evidence = CSPdb.ITOPS_EVIDENCE.GetAll().FirstOrDefault(e => e.ID == evidenceId && e.ISACTIVE);
            if (evidence == null) return new HttpResponseMessage(HttpStatusCode.NotFound);

            var filePath = HttpContext.Current.Server.MapPath("~/UploadFile/" + evidence.STORAGE_PATH);
            if (!File.Exists(filePath)) return new HttpResponseMessage(HttpStatusCode.NotFound);

            var bytes = File.ReadAllBytes(filePath);
            var response = new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent(bytes) };
            response.Content.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrWhiteSpace(evidence.CONTENT_TYPE) ? "application/octet-stream" : evidence.CONTENT_TYPE);
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment") { FileName = evidence.FILE_NAME };
            return response;
        }

        // Notification bell - COE SPOC/Reviewer/Assessee all read from the same
        // ITOPS_NOTIFICATION log; DecideITOpsFinding/ReviewITOpsAssessment/
        // SubmitITOpsAssessment each write to it via NotifyITOps() above.
        [GET("GetITOpsMyNotifications")]
        [ActionName("GetITOpsMyNotifications")]
        [HttpGet]
        public IHttpActionResult GetITOpsMyNotifications(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok(new List<ITOPS_NotificationRow>());

            var notifications = CSPdb.ITOPS_NOTIFICATION.GetAll()
                .Where(n => n.ISACTIVE && n.RECIPIENT_EMP_ID == empId)
                .OrderByDescending(n => n.CREATED_DATE)
                .Take(50)
                .ToList();

            var assessmentIds = notifications.Where(n => n.ASSESSMENT_ID.HasValue).Select(n => n.ASSESSMENT_ID.Value).Distinct().ToList();
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID)).ToList();
            var domainIds = assessments.Select(a => a.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => domainIds.Contains(d.ID)).ToDictionary(d => d.ID, d => d);
            var custIds = assessments.Where(a => a.CUST_ID != null).Select(a => a.CUST_ID).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll().Where(c => custIds.Contains(c.CUST_ID)).ToDictionary(c => c.CUST_ID, c => c.CUST_NM);

            var rows = notifications.Select(n =>
            {
                var assessment = n.ASSESSMENT_ID.HasValue ? assessments.FirstOrDefault(a => a.ID == n.ASSESSMENT_ID.Value) : null;
                var domain = assessment != null && domains.ContainsKey(assessment.DOMAIN_ID) ? domains[assessment.DOMAIN_ID] : null;
                return new ITOPS_NotificationRow
                {
                    Id = n.ID,
                    NotificationType = n.NOTIFICATION_TYPE,
                    Message = n.MESSAGE,
                    AssessmentId = n.ASSESSMENT_ID,
                    FindingId = n.FINDING_ID,
                    DomainId = assessment?.DOMAIN_ID,
                    DomainCode = domain?.CODE,
                    DomainName = domain?.NAME,
                    CustId = assessment?.CUST_ID,
                    AccountName = assessment != null && assessment.CUST_ID != null && accountNames.ContainsKey(assessment.CUST_ID) ? accountNames[assessment.CUST_ID] : null,
                    CreatedDate = n.CREATED_DATE
                };
            }).ToList();

            return Ok(rows);
        }

        [POST("DismissITOpsNotification")]
        [ActionName("DismissITOpsNotification")]
        [HttpPost]
        public IHttpActionResult DismissITOpsNotification(int id)
        {
            var notification = CSPdb.ITOPS_NOTIFICATION.GetAll().FirstOrDefault(n => n.ID == id);
            if (notification == null) return NotFound();

            UpdateAuditFields(notification);
            notification.ISACTIVE = false;
            CSPdb.ITOPS_NOTIFICATION.Update(notification);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        [POST("DismissAllITOpsNotifications")]
        [ActionName("DismissAllITOpsNotifications")]
        [HttpPost]
        public IHttpActionResult DismissAllITOpsNotifications(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok();

            var notifications = CSPdb.ITOPS_NOTIFICATION.GetAll().Where(n => n.ISACTIVE && n.RECIPIENT_EMP_ID == empId).ToList();
            foreach (var notification in notifications)
            {
                UpdateAuditFields(notification);
                notification.ISACTIVE = false;
                CSPdb.ITOPS_NOTIFICATION.Update(notification);
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // US-007: Executive Dashboard - excludes NotStarted/Draft assessments per acceptance criteria
        [GET("GetITOpsExecutiveSummary")]
        [ActionName("GetITOpsExecutiveSummary")]
        [HttpGet]
        public IHttpActionResult GetITOpsExecutiveSummary(string custId = null)
        {
            if (!string.IsNullOrWhiteSpace(custId))
                EnsureAssessmentsForAccount(custId);

            var scoped = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => a.ISACTIVE);
            if (!string.IsNullOrWhiteSpace(custId))
                scoped = scoped.Where(a => a.CUST_ID == custId);

            var completedAssessmentIds = scoped
                .Where(a => ITOPS_COMPLETED_STATUSES.Contains(a.STATUS))
                .Select(a => a.ID)
                .ToList();

            var scores = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ISACTIVE && completedAssessmentIds.Contains(s.ASSESSMENT_ID) && s.SCORE_VALUE != null)
                .Select(s => s.SCORE_VALUE.Value)
                .ToList();

            var sum = scores.Sum();
            var max = scores.Count * 5;
            decimal? avg = scores.Count == 0 ? (decimal?)null : (decimal)sum / scores.Count;
            decimal? maturityPct = max == 0 ? (decimal?)null : (decimal)sum / max * 100;

            var allAssessments = scoped.ToList();
            var completed = allAssessments.Count(a => a.STATUS == "Approved" || a.STATUS == "Closed");
            var inProgress = allAssessments.Count(a => a.STATUS == "Draft" || a.STATUS == "PendingReview" || a.STATUS == "ReturnedForRevision");
            var notStarted = allAssessments.Count(a => a.STATUS == "NotStarted");

            return Ok(new ITOPS_ExecutiveDashboard
            {
                SumOfScores = sum,
                MaxPossibleScore = max,
                AverageScore = avg,
                MaturityPercent = maturityPct,
                MaturityLevel = GetMaturityLevel(maturityPct),
                DomainsCompleted = completed,
                DomainsInProgress = inProgress,
                DomainsNotStarted = notStarted
            });
        }

        // US-008: Top Risks / Largest Gaps table
        [GET("GetITOpsTopRisks")]
        [ActionName("GetITOpsTopRisks")]
        [HttpGet]
        public IHttpActionResult GetITOpsTopRisks(string custId = null, int take = 20)
        {
            var scores = CSPdb.ITOPS_SCORE.GetAll().ToDictionary(s => s.ID);
            var parameters = CSPdb.ITOPS_PARAMETER.GetAll().ToDictionary(p => p.ID);
            var categories = CSPdb.ITOPS_CATEGORY.GetAll().ToDictionary(c => c.ID);
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().ToDictionary(a => a.ID);
            var domains = CSPdb.ITOPS_DOMAIN.GetAll().ToDictionary(d => d.ID);

            var findings = CSPdb.ITOPS_FINDING.GetAll().Where(f => f.ISACTIVE && f.STATUS != "Closed").ToList();
            if (!string.IsNullOrWhiteSpace(custId))
                findings = findings
                    .Where(f => assessments.ContainsKey(f.ASSESSMENT_ID) && assessments[f.ASSESSMENT_ID].CUST_ID == custId)
                    .ToList();

            var rows = findings
                .OrderByDescending(f => f.GAP)
                .Take(take)
                .Select(f =>
                {
                    var score = scores.ContainsKey(f.SCORE_ID) ? scores[f.SCORE_ID] : null;
                    var parameter = score != null && parameters.ContainsKey(score.PARAMETER_ID) ? parameters[score.PARAMETER_ID] : null;
                    var category = parameter != null && categories.ContainsKey(parameter.CATEGORY_ID) ? categories[parameter.CATEGORY_ID] : null;
                    var assessment = assessments.ContainsKey(f.ASSESSMENT_ID) ? assessments[f.ASSESSMENT_ID] : null;
                    var domain = assessment != null && domains.ContainsKey(assessment.DOMAIN_ID) ? domains[assessment.DOMAIN_ID] : null;

                    return new ITOPS_TopRiskRow
                    {
                        DomainName = domain?.NAME,
                        Category = category?.NAME,
                        ParameterName = parameter?.NAME,
                        CurrentScore = score?.SCORE_VALUE,
                        Gap = f.GAP,
                        RecommendedAction = f.RECOMMENDED_ACTION
                    };
                }).ToList();

            return Ok(rows);
        }
    }
}
