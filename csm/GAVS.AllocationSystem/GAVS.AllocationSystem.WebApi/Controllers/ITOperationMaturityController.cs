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
    //
    // V2 SCHEMA MIGRATION NOTE (backend): assessments are now project-scoped and
    // cycle-versioned, and assessor/reviewer/assessee are multi-select join
    // tables rather than single columns. Every route/verb/parameter below is
    // preserved exactly, but the DTOs marked "BREAKING RESPONSE-SHAPE CHANGE"
    // gained list-valued properties. The pre-existing singular properties are
    // still populated (with the PRIMARY assessor/reviewer, or a CSV for
    // assessees) so the current Angular frontend keeps working unchanged - but
    // the frontend should move to the list properties, since only those can
    // represent more than one person.
    public class ITOPS_DomainTrackerRow
    {
        public int AssessmentId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        // Singular fields = the IS_PRIMARY row of the corresponding join table (legacy shape).
        public string CoeSpocEmpId { get; set; }
        public string CoeSpocName { get; set; }
        public string ReviewerEmpId { get; set; }
        public string ReviewerName { get; set; }
        // BREAKING RESPONSE-SHAPE CHANGE (additive): full multi-select lists.
        public List<string> CoeSpocEmpIds { get; set; }
        public List<string> CoeSpocNames { get; set; }
        public List<string> ReviewerEmpIds { get; set; }
        public List<string> ReviewerNames { get; set; }
        // New in V2: which project this assessment row belongs to, and its cycle.
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public int AssessmentMasterId { get; set; }
        public string CycleLabel { get; set; }
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
        // Still five flat fields on the wire (frontend unchanged), but now sourced
        // from ITOPS_PARAMETER_LEVEL rows (LEVEL_NO 1-5) instead of five columns.
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

    // One row per assessment the logged-in employee is personally assigned to,
    // in any of the three V2 join-table roles. Roles is the set of roles THIS
    // employee holds on THIS assessment ("Assessor"/"Reviewer"/"Assessee") -
    // one row per assessment rather than one per role, so the "My Assignments"
    // landing table never shows the same domain x project twice.
    public class ITOPS_MyAssignmentRow
    {
        public int AssessmentId { get; set; }
        public int AssessmentMasterId { get; set; }
        public string CycleLabel { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        // CustId is what the Angular assessment/review pages scope on
        // (AccountService.selectedAccount -> GetOrCreateITOpsAssessment(domainCode, custId)),
        // so it must travel with every row for click-through to work.
        public string CustId { get; set; }
        public string AccountName { get; set; }
        public string Status { get; set; }
        public List<string> Roles { get; set; }
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
        public string CustId { get; set; }   // still resolved, now via ITOPS_ASSESSMENT.PROJECT_ID -> PROJECT.CUST_ID
        public string ProjectId { get; set; } // new in V2
        public string AccountName { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    // BREAKING RESPONSE-SHAPE CHANGE (additive): CoeSpocEmpIds / ReviewerEmpIds /
    // AssesseeEmpIds are the authoritative multi-select lists. CoeSpocEmpId /
    // ReviewerEmpId hold the IS_PRIMARY member, AssesseeEmpId is the legacy CSV.
    public class ITOPS_AssessmentInfo
    {
        public int AssessmentId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string CustId { get; set; }
        public string ProjectId { get; set; }
        public int AssessmentMasterId { get; set; }
        public string CycleLabel { get; set; }
        public string CoeSpocEmpId { get; set; }
        public string CoeSpocName { get; set; }
        public string ReviewerEmpId { get; set; }
        public string ReviewerName { get; set; }
        public string AssesseeEmpId { get; set; }
        public List<string> CoeSpocEmpIds { get; set; }
        public List<string> CoeSpocNames { get; set; }
        public List<string> ReviewerEmpIds { get; set; }
        public List<string> ReviewerNames { get; set; }
        public List<string> AssesseeEmpIds { get; set; }
        public string Status { get; set; }
        public string ReturnComment { get; set; }
    }

    public partial class AllSysController
    {
        private static readonly string[] ITOPS_COMPLETED_STATUSES = { "Approved", "PendingReview", "Closed" };

        // Seeded ITOPS_ROLE.ROLE_CODE values (ITOperationMaturity_V2_04_SeedRoles.sql)
        private const string ITOPS_ROLE_RUNOPS_INITIATOR = "RUNOPS_INITIATOR";
        private const string ITOPS_ROLE_DOMAIN_PROJECT_MAPPER = "DOMAIN_PROJECT_MAPPER";

        private static string GetMaturityLevel(decimal? maturityPercent)
        {
            if (!maturityPercent.HasValue) return null;
            if (maturityPercent <= 20) return "Ad Hoc";
            if (maturityPercent <= 40) return "Developing";
            if (maturityPercent <= 60) return "Defined";
            if (maturityPercent <= 80) return "Managed";
            return "Optimized";
        }

        // ------------------------------------------------------------------
        // V2 lookup helpers
        // ------------------------------------------------------------------

        // Assessments are project-scoped in V2, while the screens (and every existing
        // route) still speak in accounts - PROJECT.CUST_ID is the bridge.
        private List<string> GetITOpsProjectIdsForCustomer(string custId)
        {
            if (string.IsNullOrWhiteSpace(custId)) return new List<string>();
            return Cldb.PROJECT.GetAll()
                .Where(p => p.CUST_ID == custId)
                .Select(p => p.PROJ_ID)
                .Distinct()
                .ToList();
        }

        // The cycle new/implicit assessment rows are created under: the most recent
        // active, not-Closed ITOPS_ASSESSMENT_MASTER. Creating cycles themselves is a
        // RUNOPS_INITIATOR action and has no endpoint yet - if no cycle exists, the
        // module has nothing to seed into and every ensure/create below no-ops.
        private ITOPS_ASSESSMENT_MASTER GetCurrentITOpsAssessmentMaster()
        {
            return CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll()
                .Where(m => m.ISACTIVE && m.STATUS != "Closed")
                .OrderByDescending(m => m.START_DATE)
                .ThenByDescending(m => m.ID)
                .FirstOrDefault();
        }

        private List<string> GetITOpsAssessorIds(int assessmentId)
        {
            return CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessmentId)
                .OrderByDescending(a => a.IS_PRIMARY)
                .Select(a => a.ASSESSOR_EMP_ID)
                .ToList();
        }

        private List<string> GetITOpsReviewerIds(int assessmentId)
        {
            return CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.ISACTIVE && r.ASSESSMENT_ID == assessmentId)
                .OrderByDescending(r => r.IS_PRIMARY)
                .Select(r => r.REVIEWER_EMP_ID)
                .ToList();
        }

        private List<string> GetITOpsAssesseeIds(int assessmentId)
        {
            return CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessmentId)
                .Select(a => a.ASSESSEE_EMP_ID)
                .ToList();
        }

        // The primary member is the IS_PRIMARY row; falls back to the first active row
        // so a mis-seeded assessment still resolves someone for the legacy singular DTO fields.
        private string GetITOpsPrimaryAssessorId(int assessmentId)
        {
            return GetITOpsAssessorIds(assessmentId).FirstOrDefault();
        }

        private string GetITOpsPrimaryReviewerId(int assessmentId)
        {
            return GetITOpsReviewerIds(assessmentId).FirstOrDefault();
        }

        // "Is this employee a COE SPOC or Reviewer" - the old single-column access gate,
        // now expressed as membership in either join table. Optionally narrowed to a
        // specific set of assessments (e.g. only one account's).
        private bool IsITOpsAssessorOrReviewer(string empId, List<int> assessmentIds = null)
        {
            if (string.IsNullOrWhiteSpace(empId)) return false;

            var assessors = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll().Where(a => a.ISACTIVE && a.ASSESSOR_EMP_ID == empId);
            var reviewers = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll().Where(r => r.ISACTIVE && r.REVIEWER_EMP_ID == empId);
            if (assessmentIds != null)
            {
                assessors = assessors.Where(a => assessmentIds.Contains(a.ASSESSMENT_ID));
                reviewers = reviewers.Where(r => assessmentIds.Contains(r.ASSESSMENT_ID));
            }
            return assessors.Any() || reviewers.Any();
        }

        // RBAC replacement for the old hardcoded-person / generic-CSM-role checks.
        // A grant with PROJECT_ID null applies org-wide; otherwise it applies only
        // to that project.
        private bool HasITOpsRole(string empId, string roleCode, string projectId = null)
        {
            if (string.IsNullOrWhiteSpace(empId) || string.IsNullOrWhiteSpace(roleCode)) return false;

            var roleIds = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => r.ISACTIVE && r.ROLE_CODE == roleCode)
                .Select(r => r.ID)
                .ToList();
            if (!roleIds.Any()) return false;

            return CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Any(a => a.ISACTIVE
                       && a.EMP_ID == empId
                       && roleIds.Contains(a.ROLE_ID)
                       && (a.PROJECT_ID == null || projectId == null || a.PROJECT_ID == projectId));
        }

        // V2: ITOPS_FINDING has no ASSESSMENT_ID - it only resolves to its assessment
        // through SCORE_ID -> ITOPS_SCORE.ASSESSMENT_ID.
        private int? GetITOpsAssessmentIdForScore(int scoreId)
        {
            return CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ID == scoreId)
                .Select(s => (int?)s.ASSESSMENT_ID)
                .FirstOrDefault();
        }

        private List<int> GetITOpsScoreIdsForAssessment(int assessmentId)
        {
            return CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ISACTIVE && s.ASSESSMENT_ID == assessmentId)
                .Select(s => s.ID)
                .ToList();
        }

        private List<int> GetITOpsAssessmentIdsForCustomer(string custId)
        {
            var projectIds = GetITOpsProjectIdsForCustomer(custId);
            if (!projectIds.Any()) return new List<int>();
            return CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && projectIds.Contains(a.PROJECT_ID))
                .Select(a => a.ID)
                .ToList();
        }

        // One lock per account, so the several near-simultaneous requests the landing page
        // fires on account selection (domain tracker, assessees, top risks) can't all read
        // "no assessment row yet" before any of them commits and insert the same domain
        // twice - this was the cause of the duplicate ITOPS_ASSESSMENT rows per domain.
        private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, object> _ensureAssessmentsLocks =
            new System.Collections.Concurrent.ConcurrentDictionary<string, object>();

        // Backs the Domain Tracker/Executive Dashboard: for the current cycle, every
        // project of this account must have a row for each domain mapped to it in
        // ITOPS_DOMAIN_PROJECT_MAP, even before its assessor has opened it, so
        // "Not Started" domains show up too.
        //
        // V2 changes vs V1: keyed on (cycle, domain, project) rather than (domain,
        // account); the domain list comes from ITOPS_DOMAIN_PROJECT_MAP rather than
        // "every active domain"; and the domain's default assessor/reviewer are
        // inserted as IS_PRIMARY join rows rather than flat columns.
        private void EnsureAssessmentsForAccount(string custId)
        {
            var gate = _ensureAssessmentsLocks.GetOrAdd(custId ?? string.Empty, _ => new object());
            lock (gate)
            {
                var master = GetCurrentITOpsAssessmentMaster();
                if (master == null) return; // no open cycle -> nothing to seed

                var projectIds = GetITOpsProjectIdsForCustomer(custId);
                if (!projectIds.Any()) return;

                var mappings = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                    .Where(m => m.ISACTIVE && projectIds.Contains(m.PROJECT_ID))
                    .Select(m => new { m.DOMAIN_ID, m.PROJECT_ID })
                    .ToList();
                if (!mappings.Any()) return;

                var activeDomainIds = CSPdb.ITOPS_DOMAIN.GetAll()
                    .Where(d => d.ISACTIVE)
                    .Select(d => d.ID)
                    .ToList();

                var existing = CSPdb.ITOPS_ASSESSMENT.GetAll()
                    .Where(a => a.ISACTIVE && a.ASSESSMENT_MASTER_ID == master.ID && projectIds.Contains(a.PROJECT_ID))
                    .Select(a => new { a.DOMAIN_ID, a.PROJECT_ID })
                    .ToList();

                var missing = mappings
                    .Where(m => activeDomainIds.Contains(m.DOMAIN_ID))
                    .Where(m => !existing.Any(e => e.DOMAIN_ID == m.DOMAIN_ID && e.PROJECT_ID == m.PROJECT_ID))
                    .ToList();
                if (!missing.Any()) return;

                var empId = GetHeaderDetails_String("empId");
                var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => d.ISACTIVE).ToList();
                var accountName = Cldb.CUSTOMER.GetAll().Where(c => c.CUST_ID == custId).Select(c => c.CUST_NM).FirstOrDefault();
                var projects = Cldb.PROJECT.GetAll().Where(p => projectIds.Contains(p.PROJ_ID)).ToList();

                foreach (var m in missing)
                {
                    var domain = domains.FirstOrDefault(d => d.ID == m.DOMAIN_ID);
                    if (domain == null) continue;
                    var project = projects.FirstOrDefault(p => p.PROJ_ID == m.PROJECT_ID);

                    var assessment = new ITOPS_ASSESSMENT
                    {
                        ASSESSMENT_MASTER_ID = master.ID,
                        DOMAIN_ID = domain.ID,
                        PROJECT_ID = m.PROJECT_ID,
                        BUSINESS_UNIT = project != null ? project.BUSINESS_UNIT : null,
                        ACCOUNT_NAME = accountName,
                        STATUS = "NotStarted"
                    };
                    UpdateAuditFields(assessment, empId);
                    CSPdb.ITOPS_ASSESSMENT.Add(assessment);
                    CSPdb.Commit(CanCommit); // need the identity before the join rows can reference it

                    SeedITOpsDefaultOwners(assessment, domain, empId);
                }
                CSPdb.Commit(CanCommit);
            }
        }

        // Inserts the domain's DEFAULT_ASSESSOR_ID / DEFAULT_REVIEWER_ID as the single
        // IS_PRIMARY row in each join table (V1 set flat columns on the assessment).
        private void SeedITOpsDefaultOwners(ITOPS_ASSESSMENT assessment, ITOPS_DOMAIN domain, string empId)
        {
            if (assessment == null || domain == null || assessment.ID == 0) return;

            if (!string.IsNullOrWhiteSpace(domain.DEFAULT_ASSESSOR_ID))
            {
                var assessor = new ITOPS_ASSESSMENT_ASSESSOR
                {
                    ASSESSMENT_ID = assessment.ID,
                    ASSESSOR_EMP_ID = domain.DEFAULT_ASSESSOR_ID,
                    IS_PRIMARY = true
                };
                UpdateAuditFields(assessor, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Add(assessor);
            }

            if (!string.IsNullOrWhiteSpace(domain.DEFAULT_REVIEWER_ID))
            {
                var reviewer = new ITOPS_ASSESSMENT_REVIEWER
                {
                    ASSESSMENT_ID = assessment.ID,
                    REVIEWER_EMP_ID = domain.DEFAULT_REVIEWER_ID,
                    IS_PRIMARY = true
                };
                UpdateAuditFields(reviewer, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Add(reviewer);
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

        private List<string> GetEmpNames(List<string> empIds)
        {
            return (empIds ?? new List<string>()).Select(GetEmpName).ToList();
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
        /// The table carries a CHECK constraint that exactly one of ASSESSMENT_ID /
        /// FINDING_ID is non-null, so a findingId always wins over the assessmentId.
        /// </summary>
        private void CreateITOpsNotification(string recipientEmpId, string notificationType, int? assessmentId, int? findingId, string message)
        {
            if (string.IsNullOrWhiteSpace(recipientEmpId)) return;
            if (!assessmentId.HasValue && !findingId.HasValue) return;
            try
            {
                var notification = new ITOPS_NOTIFICATION
                {
                    NOTIFICATION_TYPE = notificationType,
                    // CK_ITOPS_NOTIFICATION_TARGET: exactly one target column may be set.
                    ASSESSMENT_ID = findingId.HasValue ? (int?)null : assessmentId,
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
            foreach (var empId in (toEmpIds ?? new List<string>()).Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
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
        // where an employee is only assigned as IT Ops assessor / reviewer without
        // being staffed on that account's projects. This surfaces those accounts too,
        // based on real ITOPS_ASSESSMENT_ASSESSOR / ITOPS_ASSESSMENT_REVIEWER rows,
        // resolved account-ward through ITOPS_ASSESSMENT.PROJECT_ID -> PROJECT.CUST_ID.
        [GET("GetITOpsAccountsForEmp")]
        [ActionName("GetITOpsAccountsForEmp")]
        [HttpGet]
        public IHttpActionResult GetITOpsAccountsForEmp(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok(new List<ProjectsBaseCustomer>());

            var assessmentIds = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSOR_EMP_ID == empId)
                .Select(a => a.ASSESSMENT_ID)
                .ToList()
                .Concat(CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                    .Where(r => r.ISACTIVE && r.REVIEWER_EMP_ID == empId)
                    .Select(r => r.ASSESSMENT_ID)
                    .ToList())
                .Distinct()
                .ToList();

            if (!assessmentIds.Any()) return Ok(new List<ProjectsBaseCustomer>());

            var projectIds = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && assessmentIds.Contains(a.ID))
                .Select(a => a.PROJECT_ID)
                .Distinct()
                .ToList();

            var custIds = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => p.CUST_ID)
                .Distinct()
                .ToList();

            var result = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new ProjectsBaseCustomer { CUST_ID = c.CUST_ID, CUST_NM = c.CUST_NM })
                .OrderBy(c => c.CUST_NM)
                .ToList();

            return Ok(result);
        }

        // Landing page "My Assignments": the actual assignment ROWS for one employee.
        // GetITOpsAccountsForEmp only returns accounts (too coarse to render a work
        // list, and it ignores assessee membership entirely) and GetITOpsHasAccess
        // only returns a bool - neither can drive a clickable per-assessment table.
        //
        // Reads all three V2 join tables (active rows only) for this empId, joins
        // to the active ITOPS_ASSESSMENT, then out to ITOPS_DOMAIN (code/name),
        // PROJECT (name + CUST_ID) / CUSTOMER (account name) and
        // ITOPS_ASSESSMENT_MASTER (cycle label). One row per assessment, with the
        // employee's role(s) on it collapsed into Roles[].
        [GET("GetITOpsMyAssignments")]
        [ActionName("GetITOpsMyAssignments")]
        [HttpGet]
        public IHttpActionResult GetITOpsMyAssignments(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return Ok(new List<ITOPS_MyAssignmentRow>());

            var rolesByAssessmentId = new Dictionary<int, List<string>>();
            Action<int, string> addRole = (assessmentId, role) =>
            {
                List<string> roles;
                if (!rolesByAssessmentId.TryGetValue(assessmentId, out roles))
                {
                    roles = new List<string>();
                    rolesByAssessmentId[assessmentId] = roles;
                }
                if (!roles.Contains(role)) roles.Add(role);
            };

            foreach (var id in CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                        .Where(a => a.ISACTIVE && a.ASSESSOR_EMP_ID == empId)
                        .Select(a => a.ASSESSMENT_ID).ToList())
                addRole(id, "Assessor");

            foreach (var id in CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                        .Where(r => r.ISACTIVE && r.REVIEWER_EMP_ID == empId)
                        .Select(r => r.ASSESSMENT_ID).ToList())
                addRole(id, "Reviewer");

            foreach (var id in CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                        .Where(a => a.ISACTIVE && a.ASSESSEE_EMP_ID == empId)
                        .Select(a => a.ASSESSMENT_ID).ToList())
                addRole(id, "Assessee");

            if (!rolesByAssessmentId.Any()) return Ok(new List<ITOPS_MyAssignmentRow>());

            var assessmentIds = rolesByAssessmentId.Keys.ToList();
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && assessmentIds.Contains(a.ID))
                .ToList();
            if (!assessments.Any()) return Ok(new List<ITOPS_MyAssignmentRow>());

            var domainIds = assessments.Select(a => a.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => domainIds.Contains(d.ID))
                .ToList()
                .GroupBy(d => d.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var masterIds = assessments.Select(a => a.ASSESSMENT_MASTER_ID).Distinct().ToList();
            var cycleLabels = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll()
                .Where(m => masterIds.Contains(m.ID))
                .Select(m => new { m.ID, m.CYCLE_LABEL })
                .ToList()
                .GroupBy(m => m.ID)
                .ToDictionary(g => g.Key, g => g.First().CYCLE_LABEL);

            var projectIds = assessments.Select(a => a.PROJECT_ID).Where(p => !string.IsNullOrWhiteSpace(p)).Distinct().ToList();
            var projects = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.PROJ_NM, p.CUST_ID })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First());

            var custIds = projects.Values.Select(p => p.CUST_ID).Where(c => !string.IsNullOrWhiteSpace(c)).Distinct().ToList();
            var custNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var rows = assessments.Select(a =>
            {
                var projectId = a.PROJECT_ID;
                var project = projectId != null && projects.ContainsKey(projectId) ? projects[projectId] : null;
                var custId = project != null ? project.CUST_ID : null;

                return new ITOPS_MyAssignmentRow
                {
                    AssessmentId = a.ID,
                    AssessmentMasterId = a.ASSESSMENT_MASTER_ID,
                    CycleLabel = cycleLabels.ContainsKey(a.ASSESSMENT_MASTER_ID) ? cycleLabels[a.ASSESSMENT_MASTER_ID] : null,
                    DomainId = a.DOMAIN_ID,
                    DomainCode = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].CODE : null,
                    DomainName = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].NAME : null,
                    ProjectId = projectId,
                    ProjectName = project != null ? project.PROJ_NM : null,
                    CustId = custId,
                    AccountName = !string.IsNullOrWhiteSpace(custId) && custNames.ContainsKey(custId)
                        ? custNames[custId]
                        : a.ACCOUNT_NAME,
                    Status = a.STATUS,
                    Roles = rolesByAssessmentId[a.ID]
                };
            })
            .OrderBy(r => r.AccountName)
            .ThenBy(r => r.ProjectName)
            .ThenBy(r => r.DomainName)
            .ToList();

            return Ok(rows);
        }

        // The nav's "IT Operations Maturity" icon (shell navbar-new.component) is gated
        // on the shared APP_ACCESS_CONTROLS resource 830, which today only grants
        // VIEW_ACCESS to one static CSM role - anyone actually assigned as assessor,
        // reviewer, GDH, assessee, or holding an ITOPS_ROLE should see the icon too.
        // The shell calls this alongside the normal access-control check and shows the
        // icon if either says yes.
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

            // V2: membership lives in the three join tables, not in single columns on
            // ITOPS_ASSESSMENT (that shape is what made this endpoint throw
            // "Invalid column name 'COE_SPOC_EMP_ID'").
            var assignedAsAssessorOrReviewer = IsITOpsAssessorOrReviewer(empId);
            if (assignedAsAssessorOrReviewer) return Ok(true);

            var assignedAsAssessee = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Any(a => a.ISACTIVE && a.ASSESSEE_EMP_ID == empId);
            if (assignedAsAssessee) return Ok(true);

            // New in V2: an IT-Ops functional role grant is access in its own right,
            // even before the holder is on any specific assessment.
            if (HasITOpsRole(empId, ITOPS_ROLE_RUNOPS_INITIATOR) || HasITOpsRole(empId, ITOPS_ROLE_DOMAIN_PROJECT_MAPPER))
                return Ok(true);

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
        //
        // TODO (V2 migration, out of scope here): the registered stored procedure
        // report_getITOpsMaturityReport still queries the OLD account-scoped V1
        // shape (ITOPS_ASSESSMENT.CUST_ID / COE_SPOC_EMP_ID / REVIEWER_EMP_ID and
        // ITOPS_FINDING.ASSESSMENT_ID) and WILL error at runtime until it is
        // rewritten against the project-scoped, join-table V2 schema. The three
        // endpoints below are pass-throughs and need no C# change themselves.
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
        // of the logged-in user's own project staffing/allocation - assessor and
        // reviewer assignments for this module are managed independently of that
        // (per-domain, per-project), so any user should be able to pick any account.
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
        // reviewer/assessor who is assigned to a domain on an account he isn't
        // otherwise allocated to. This mirrors GetAccountAssesseeDetails but grants
        // access whenever the caller has a real ITOPS assessor/reviewer assignment on
        // the account too, falling back to the normal staffing check for everyone else.
        [GET("GetITOpsAssesseesForAccount")]
        [ActionName("GetITOpsAssesseesForAccount")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssesseesForAccount(string custId)
        {
            string empId = GetHeaderDetails_String("empId");

            // Assessment rows (and their assessor/reviewer join rows, seeded from each
            // domain's defaults) only exist for an account once someone has opened it here
            // before - ensure they exist first, otherwise an assessor/reviewer opening an
            // account for the very first time would wrongly fail the check below and fall
            // through to the staffing-based access check they were never meant to need.
            EnsureAssessmentsForAccount(custId);

            var accountAssessmentIds = GetITOpsAssessmentIdsForCustomer(custId);
            bool isItOpsAssigned = IsITOpsAssessorOrReviewer(empId, accountAssessmentIds);

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

        // Assessee selection is an account-wide choice (not per-domain). V2: it lives in
        // ITOPS_ASSESSMENT_ASSESSEE rows against each of the account's assessments rather
        // than in a CSV column, so a assessor's choice is persisted once and reused by
        // anyone else opening the same account (e.g. the reviewer).
        [GET("GetITOpsSelectedAssessees")]
        [ActionName("GetITOpsSelectedAssessees")]
        [HttpGet]
        public IHttpActionResult GetITOpsSelectedAssessees(string custId)
        {
            var accountAssessmentIds = GetITOpsAssessmentIdsForCustomer(custId);
            if (!accountAssessmentIds.Any()) return Ok(new List<string>());

            var empIds = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && accountAssessmentIds.Contains(a.ASSESSMENT_ID))
                .Select(a => a.ASSESSEE_EMP_ID)
                .Distinct()
                .ToList();

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
            var wanted = (request.AssesseeEmpIds ?? new List<string>())
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct()
                .ToList();

            var accountAssessmentIds = GetITOpsAssessmentIdsForCustomer(request.CustId);
            if (!accountAssessmentIds.Any()) return Ok();

            var existingRows = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(a => accountAssessmentIds.Contains(a.ASSESSMENT_ID))
                .ToList();

            foreach (var assessmentId in accountAssessmentIds)
            {
                var rowsForAssessment = existingRows.Where(r => r.ASSESSMENT_ID == assessmentId).ToList();

                // Deactivate the ones no longer selected. UpdateAuditFieldsExt always sets
                // ISACTIVE = true, so audit first and clear ISACTIVE afterwards.
                foreach (var row in rowsForAssessment.Where(r => r.ISACTIVE && !wanted.Contains(r.ASSESSEE_EMP_ID)))
                {
                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_ASSESSEE.Update(row);
                }

                foreach (var assesseeEmpId in wanted)
                {
                    var existing = rowsForAssessment.FirstOrDefault(r => r.ASSESSEE_EMP_ID == assesseeEmpId);
                    if (existing != null)
                    {
                        // Reactivates a previously removed assessee (UpdateAuditFields sets ISACTIVE = true).
                        UpdateAuditFields(existing, empId);
                        CSPdb.ITOPS_ASSESSMENT_ASSESSEE.Update(existing);
                    }
                    else
                    {
                        var row = new ITOPS_ASSESSMENT_ASSESSEE
                        {
                            ASSESSMENT_ID = assessmentId,
                            ASSESSEE_EMP_ID = assesseeEmpId
                        };
                        UpdateAuditFields(row, empId);
                        CSPdb.ITOPS_ASSESSMENT_ASSESSEE.Add(row);
                    }
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // Finds this account's assessment instance for a domain in the current cycle,
        // creating one (with the domain's default owners seeded as IS_PRIMARY join rows)
        // the first time it's opened.
        //
        // V2: an assessment belongs to a PROJECT, not an account. The route still takes
        // custId (the frontend is unchanged), so the project is resolved as the account's
        // first project that ITOPS_DOMAIN_PROJECT_MAP maps this domain to.
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

            var master = GetCurrentITOpsAssessmentMaster();
            if (master == null)
                return Content(HttpStatusCode.Conflict, "No open IT Ops Maturity assessment cycle exists. A RunOps Initiator must create one first.");

            var projectIds = GetITOpsProjectIdsForCustomer(custId);
            if (!projectIds.Any())
                return Content(HttpStatusCode.Conflict, "This account has no projects to assess.");

            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .FirstOrDefault(a => a.ISACTIVE
                                  && a.ASSESSMENT_MASTER_ID == master.ID
                                  && a.DOMAIN_ID == domain.ID
                                  && projectIds.Contains(a.PROJECT_ID));

            if (assessment == null)
            {
                var mappedProjectId = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                    .Where(m => m.ISACTIVE && m.DOMAIN_ID == domain.ID && projectIds.Contains(m.PROJECT_ID))
                    .Select(m => m.PROJECT_ID)
                    .FirstOrDefault();

                if (string.IsNullOrWhiteSpace(mappedProjectId))
                    return Content(HttpStatusCode.Conflict, "This domain is not mapped to any project on this account.");

                var empId = GetHeaderDetails_String("empId");
                var project = Cldb.PROJECT.GetAll().FirstOrDefault(p => p.PROJ_ID == mappedProjectId);
                var accountName = Cldb.CUSTOMER.GetAll().Where(c => c.CUST_ID == custId).Select(c => c.CUST_NM).FirstOrDefault();

                assessment = new ITOPS_ASSESSMENT
                {
                    ASSESSMENT_MASTER_ID = master.ID,
                    DOMAIN_ID = domain.ID,
                    PROJECT_ID = mappedProjectId,
                    BUSINESS_UNIT = project != null ? project.BUSINESS_UNIT : null,
                    ACCOUNT_NAME = accountName,
                    STATUS = "NotStarted"
                };
                UpdateAuditFields(assessment, empId);
                CSPdb.ITOPS_ASSESSMENT.Add(assessment);
                CSPdb.Commit(CanCommit);

                SeedITOpsDefaultOwners(assessment, domain, empId);
                CSPdb.Commit(CanCommit);
            }

            return Ok(BuildITOpsAssessmentInfo(assessment, domain, custId, master));
        }

        private ITOPS_AssessmentInfo BuildITOpsAssessmentInfo(ITOPS_ASSESSMENT assessment, ITOPS_DOMAIN domain, string custId, ITOPS_ASSESSMENT_MASTER master)
        {
            var assessorIds = GetITOpsAssessorIds(assessment.ID);
            var reviewerIds = GetITOpsReviewerIds(assessment.ID);
            var assesseeIds = GetITOpsAssesseeIds(assessment.ID);

            if (string.IsNullOrWhiteSpace(custId))
            {
                custId = Cldb.PROJECT.GetAll()
                    .Where(p => p.PROJ_ID == assessment.PROJECT_ID)
                    .Select(p => p.CUST_ID)
                    .FirstOrDefault();
            }

            return new ITOPS_AssessmentInfo
            {
                AssessmentId = assessment.ID,
                DomainId = assessment.DOMAIN_ID,
                DomainCode = domain?.CODE,
                DomainName = domain?.NAME,
                CustId = custId,
                ProjectId = assessment.PROJECT_ID,
                AssessmentMasterId = assessment.ASSESSMENT_MASTER_ID,
                CycleLabel = master?.CYCLE_LABEL,
                CoeSpocEmpId = assessorIds.FirstOrDefault(),
                CoeSpocName = GetEmpName(assessorIds.FirstOrDefault()),
                ReviewerEmpId = reviewerIds.FirstOrDefault(),
                ReviewerName = GetEmpName(reviewerIds.FirstOrDefault()),
                AssesseeEmpId = string.Join(",", assesseeIds), // legacy CSV shape, kept for the current frontend
                CoeSpocEmpIds = assessorIds,
                CoeSpocNames = GetEmpNames(assessorIds),
                ReviewerEmpIds = reviewerIds,
                ReviewerNames = GetEmpNames(reviewerIds),
                AssesseeEmpIds = assesseeIds,
                Status = assessment.STATUS,
                ReturnComment = assessment.RETURN_COMMENT
            };
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

            var projectIds = GetITOpsProjectIdsForCustomer(custId);
            if (!projectIds.Any()) return Ok(new List<ITOPS_DomainTrackerRow>());

            var assessmentList = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && projectIds.Contains(a.PROJECT_ID))
                .ToList();

            // The coeSpocEmpId filter now means "assessments this person is an assessor on".
            if (!string.IsNullOrWhiteSpace(coeSpocEmpId))
            {
                var myAssessmentIds = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                    .Where(a => a.ISACTIVE && a.ASSESSOR_EMP_ID == coeSpocEmpId)
                    .Select(a => a.ASSESSMENT_ID)
                    .ToList();
                assessmentList = assessmentList.Where(a => myAssessmentIds.Contains(a.ID)).ToList();
            }

            if (!assessmentList.Any()) return Ok(new List<ITOPS_DomainTrackerRow>());

            var assessmentIds = assessmentList.Select(a => a.ID).ToList();

            var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => d.ISACTIVE).ToDictionary(d => d.ID);
            var masters = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().ToList().ToDictionary(m => m.ID, m => m.CYCLE_LABEL);
            var projectNames = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.PROJ_NM })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First().PROJ_NM);

            var allScores = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ISACTIVE && assessmentIds.Contains(s.ASSESSMENT_ID))
                .ToList();

            // Only currently-effective (END_DATE null or future) categories/parameters count
            // toward the denominator, per the V2 effective-dating of master data.
            var today = DateTime.Today;
            var activeCategories = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.ISACTIVE && (c.END_DATE == null || c.END_DATE > today))
                .Select(c => new { c.ID, c.DOMAIN_ID })
                .ToList();
            var activeCategoryIds = activeCategories.Select(c => c.ID).ToList();
            var paramCountByDomain = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.ISACTIVE && (p.END_DATE == null || p.END_DATE > today) && activeCategoryIds.Contains(p.CATEGORY_ID))
                .Select(p => p.CATEGORY_ID)
                .ToList()
                .Join(activeCategories, categoryId => categoryId, c => c.ID, (categoryId, c) => c.DOMAIN_ID)
                .GroupBy(domainId => domainId)
                .ToDictionary(g => g.Key, g => g.Count());

            // Bulk-load the join tables once rather than per row.
            var assessorRows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && assessmentIds.Contains(a.ASSESSMENT_ID))
                .ToList();
            var reviewerRows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.ISACTIVE && assessmentIds.Contains(r.ASSESSMENT_ID))
                .ToList();

            var empIds = assessorRows.Select(a => a.ASSESSOR_EMP_ID)
                .Concat(reviewerRows.Select(r => r.REVIEWER_EMP_ID))
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

            Func<string, string> nameOf = id => id != null && empNames.ContainsKey(id) ? empNames[id] : id;

            var rows = assessmentList.Select(a =>
            {
                var scored = allScores.Where(s => s.ASSESSMENT_ID == a.ID && s.SCORE_VALUE != null).ToList();
                decimal? avg = scored.Count == 0 ? (decimal?)null : (decimal)scored.Sum(s => s.SCORE_VALUE.Value) / scored.Count;
                decimal? maturityPct = avg.HasValue ? avg.Value / 5 * 100 : (decimal?)null;
                var paramCount = paramCountByDomain.ContainsKey(a.DOMAIN_ID) ? paramCountByDomain[a.DOMAIN_ID] : 0;

                var assessorIds = assessorRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderByDescending(x => x.IS_PRIMARY).Select(x => x.ASSESSOR_EMP_ID).ToList();
                var reviewerIds = reviewerRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderByDescending(x => x.IS_PRIMARY).Select(x => x.REVIEWER_EMP_ID).ToList();

                return new ITOPS_DomainTrackerRow
                {
                    AssessmentId = a.ID,
                    DomainId = a.DOMAIN_ID,
                    DomainCode = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].CODE : null,
                    DomainName = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].NAME : null,
                    CoeSpocEmpId = assessorIds.FirstOrDefault(),
                    CoeSpocName = nameOf(assessorIds.FirstOrDefault()),
                    ReviewerEmpId = reviewerIds.FirstOrDefault(),
                    ReviewerName = nameOf(reviewerIds.FirstOrDefault()),
                    CoeSpocEmpIds = assessorIds,
                    CoeSpocNames = assessorIds.Select(nameOf).ToList(),
                    ReviewerEmpIds = reviewerIds,
                    ReviewerNames = reviewerIds.Select(nameOf).ToList(),
                    ProjectId = a.PROJECT_ID,
                    ProjectName = a.PROJECT_ID != null && projectNames.ContainsKey(a.PROJECT_ID) ? projectNames[a.PROJECT_ID] : null,
                    AssessmentMasterId = a.ASSESSMENT_MASTER_ID,
                    CycleLabel = masters.ContainsKey(a.ASSESSMENT_MASTER_ID) ? masters[a.ASSESSMENT_MASTER_ID] : null,
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

            var today = DateTime.Today;
            var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);

            // V2: category/parameter master data is effective-dated - only rows still in
            // effect (END_DATE null or in the future) belong on the assessment form.
            var categories = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.DOMAIN_ID == assessment.DOMAIN_ID && c.ISACTIVE && (c.END_DATE == null || c.END_DATE > today))
                .ToList()
                .ToDictionary(c => c.ID);
            var categoryIds = categories.Keys.ToList();

            var parameters = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => categoryIds.Contains(p.CATEGORY_ID) && p.ISACTIVE && (p.END_DATE == null || p.END_DATE > today))
                .OrderBy(p => p.DISPLAY_ORDER)
                .ToList();
            var parameterIds = parameters.Select(p => p.ID).ToList();

            // V2: the five rubric-text columns became one row per (PARAMETER_ID, LEVEL_NO).
            var levelsByParameter = CSPdb.ITOPS_PARAMETER_LEVEL.GetAll()
                .Where(l => parameterIds.Contains(l.PARAMETER_ID))
                .ToList()
                .GroupBy(l => l.PARAMETER_ID)
                .ToDictionary(g => g.Key, g => g.ToDictionary(l => (int)l.LEVEL_NO, l => l.DESCRIPTION));

            var scores = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ASSESSMENT_ID == assessmentId && s.ISACTIVE)
                .ToList()
                .GroupBy(s => s.PARAMETER_ID)
                .ToDictionary(g => g.Key, g => g.First());

            // V2: ITOPS_FINDING has no ASSESSMENT_ID - reach it through this assessment's score ids.
            var scoreIds = scores.Values.Select(s => s.ID).ToList();
            var findingsByScoreId = CSPdb.ITOPS_FINDING.GetAll()
                .Where(f => scoreIds.Contains(f.SCORE_ID) && f.ISACTIVE)
                .ToList()
                .GroupBy(f => f.SCORE_ID)
                .ToDictionary(g => g.Key, g => g.OrderByDescending(f => f.ID).First());

            var result = parameters.Select(p =>
            {
                ITOPS_SCORE s;
                scores.TryGetValue(p.ID, out s);
                var category = categories[p.CATEGORY_ID];
                ITOPS_FINDING finding = null;
                if (s != null) findingsByScoreId.TryGetValue(s.ID, out finding);

                Dictionary<int, string> levels;
                if (!levelsByParameter.TryGetValue(p.ID, out levels)) levels = new Dictionary<int, string>();
                Func<int, string> level = n => levels.ContainsKey(n) ? levels[n] : null;

                return new ITOPS_ParameterScoreRow
                {
                    ParameterId = p.ID,
                    Category = category.NAME,
                    ParameterName = p.NAME,
                    Definition = p.DEFINITION,
                    Level1_AdHoc = level(1),
                    Level2_Developing = level(2),
                    Level3_Defined = level(3),
                    Level4_Managed = level(4),
                    Level5_Optimized = level(5),
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
            // NOTES is NOT NULL in V2 - persist an empty string rather than null for a
            // draft save that hasn't got notes yet.
            score.NOTES = request.Notes ?? string.Empty;
            score.IS_IMPROVEMENT_AREA = request.ScoreValue.HasValue && request.ScoreValue.Value < 5;
            score.IMPROVEMENT_STATUS = score.IS_IMPROVEMENT_AREA ? "Proposed" : null;

            UpdateAuditFields(score, empId);

            if (isNew)
                CSPdb.ITOPS_SCORE.Add(score);
            else
                CSPdb.ITOPS_SCORE.Update(score);
            CSPdb.Commit(CanCommit);

            // Auto-create/refresh the Finding driving the Gap Analysis section.
            // V2: the finding carries only SCORE_ID - its assessment is derived from the score.
            if (score.IS_IMPROVEMENT_AREA)
            {
                var gap = 5 - request.ScoreValue.Value;
                var finding = CSPdb.ITOPS_FINDING.GetAll().FirstOrDefault(f => f.SCORE_ID == score.ID);
                if (finding == null)
                {
                    finding = new ITOPS_FINDING
                    {
                        SCORE_ID = score.ID,
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

            var assessorIds = GetITOpsAssessorIds(assessmentId);
            var reviewerIds = GetITOpsReviewerIds(assessmentId);

            // Per US-005 note 5: skip the review gate when the reviewer is the same person
            // as the assessor. With multi-select that generalises to "there is nobody left
            // to review it" - i.e. no reviewers at all, or every reviewer is also an assessor.
            var skipReview = !reviewerIds.Any() || reviewerIds.All(r => assessorIds.Contains(r));
            assessment.STATUS = skipReview ? "Approved" : "PendingReview";
            assessment.SUBMITTED_DATE = DateTime.Now;
            UpdateAuditFields(assessment);
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

            // Re-submitting is the assessor's response to a return-for-revision - that
            // notification is now acted on, so clear it (for every assessor).
            foreach (var assessorId in assessorIds)
                ResolveITOpsNotifications(assessment.ID, "AssessmentReturned", assessorId);

            if (!skipReview)
            {
                var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);
                var assessorNames = string.Join(", ", GetEmpNames(assessorIds));
                NotifyITOpsMany(
                    reviewerIds,
                    $"IT Ops Maturity: {domain?.NAME} assessment submitted for review",
                    "ITOpsSubmittedForReview.htm",
                    new Dictionary<string, string>
                    {
                        { "ReviewerName", string.Join(", ", GetEmpNames(reviewerIds)) },
                        { "CoeSpocName", assessorNames },
                        { "DomainName", domain?.NAME }
                    },
                    "SubmittedForReview", assessment.ID, null,
                    $"{domain?.NAME} assessment submitted for your review by {assessorNames}.");
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

            var assessorIds = GetITOpsAssessorIds(assessmentId);
            var reviewerIds = GetITOpsReviewerIds(assessmentId);

            // The reviewers have now acted on it - clear their "submitted for review" items.
            foreach (var reviewerId in reviewerIds)
                ResolveITOpsNotifications(assessment.ID, "SubmittedForReview", reviewerId);

            var reviewedDomain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID);
            var reviewerNames = string.Join(", ", GetEmpNames(reviewerIds));
            NotifyITOpsMany(
                assessorIds,
                $"IT Ops Maturity: {reviewedDomain?.NAME} assessment {(request.Approve ? "approved" : "returned for revision")}",
                "ITOpsReviewDecision.htm",
                new Dictionary<string, string>
                {
                    { "CoeSpocName", string.Join(", ", GetEmpNames(assessorIds)) },
                    { "ReviewerName", reviewerNames },
                    { "DomainName", reviewedDomain?.NAME },
                    { "Decision", request.Approve ? "Approved" : "Returned for Revision" },
                    { "Comment", request.Approve ? "-" : request.Comment }
                },
                request.Approve ? "AssessmentApproved" : "AssessmentReturned", assessment.ID, null,
                $"{reviewedDomain?.NAME} assessment {(request.Approve ? "approved" : "returned for revision")} by {reviewerNames}.");

            // Once approved, every assessee on this assessment needs to act on any probable
            // areas of improvement (findings) already raised while scoring - notify each
            // of them by email and log a matching bell-dropdown entry, same as the other
            // review-workflow notifications above.
            if (request.Approve)
            {
                // V2: findings reach their assessment only via ITOPS_SCORE.
                var scoreIds = GetITOpsScoreIdsForAssessment(assessment.ID);
                var openFindingCount = scoreIds.Any()
                    ? CSPdb.ITOPS_FINDING.GetAll().Count(f => f.ISACTIVE && scoreIds.Contains(f.SCORE_ID) && f.STATUS == "Open")
                    : 0;

                var assesseeIds = GetITOpsAssesseeIds(assessment.ID).Distinct().ToList();

                if (openFindingCount > 0 && assesseeIds.Any())
                {
                    var findingWord = openFindingCount == 1 ? "finding" : "findings";
                    var assesseeNames = string.Join(", ", GetEmpNames(assesseeIds));
                    // One shared email to every assessee on the assessment (not one per person) -
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

            // V2: the finding's assessment is resolved through its score.
            var assessmentId = GetITOpsAssessmentIdForScore(finding.SCORE_ID);

            if (assessmentId.HasValue)
            {
                // The assessee's "findings need action" item only clears once every finding
                // on this assessment has actually been decided, not just this one.
                var scoreIds = GetITOpsScoreIdsForAssessment(assessmentId.Value);
                var anyOpenFindingsRemain = scoreIds.Any()
                    && CSPdb.ITOPS_FINDING.GetAll().Any(f => f.ISACTIVE && scoreIds.Contains(f.SCORE_ID) && f.STATUS == "Open");
                if (!anyOpenFindingsRemain)
                    ResolveITOpsNotifications(assessmentId.Value, "FindingsNeedAction");
            }

            var findingAssessment = assessmentId.HasValue
                ? CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId.Value)
                : null;
            var findingScore = CSPdb.ITOPS_SCORE.GetAll().FirstOrDefault(s => s.ID == finding.SCORE_ID);
            var findingParameter = findingScore != null ? CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == findingScore.PARAMETER_ID) : null;
            var findingDomain = findingAssessment != null ? CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == findingAssessment.DOMAIN_ID) : null;
            if (findingAssessment != null)
            {
                var assessorIds = GetITOpsAssessorIds(findingAssessment.ID);
                NotifyITOpsMany(
                    assessorIds,
                    $"IT Ops Maturity: finding {(request.Accept ? "accepted" : "rejected")} - {findingDomain?.NAME}",
                    "ITOpsFindingDecision.htm",
                    new Dictionary<string, string>
                    {
                        { "CoeSpocName", string.Join(", ", GetEmpNames(assessorIds)) },
                        { "ParameterName", findingParameter?.NAME },
                        { "DomainName", findingDomain?.NAME },
                        { "Decision", request.Accept ? "Accepted" : "Rejected" },
                        { "Comment", request.Accept ? "-" : request.Comment }
                    },
                    request.Accept ? "FindingAccepted" : "FindingRejected", null, finding.ID,
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
        // text, with the full history in ITOPS_FINDING_ACTIVITY. Notifies the assessors and
        // reviewers so they know there's progress to look at (and potentially close it).
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

            // V2: resolve the assessment through the score, not a FINDING.ASSESSMENT_ID column.
            var assessmentId = GetITOpsAssessmentIdForScore(finding.SCORE_ID);
            var findingAssessment = assessmentId.HasValue
                ? CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId.Value)
                : null;
            var findingScore = CSPdb.ITOPS_SCORE.GetAll().FirstOrDefault(s => s.ID == finding.SCORE_ID);
            var findingParameter = findingScore != null ? CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == findingScore.PARAMETER_ID) : null;
            var findingDomain = findingAssessment != null ? CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == findingAssessment.DOMAIN_ID) : null;

            if (findingAssessment != null)
            {
                var recipients = GetITOpsAssessorIds(findingAssessment.ID)
                    .Concat(GetITOpsReviewerIds(findingAssessment.ID))
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
                    "FindingActionUpdate", null, finding.ID,
                    $"Action update submitted on \"{findingParameter?.NAME}\" in {findingDomain?.NAME}.");
            }

            return Ok(finding);
        }

        // BEHAVIOUR CHANGE (V2 schema): ITOPS_EVIDENCE lost its FINDING_ID column - it is
        // SCORE_ID-only now (an approved regression from V1). Evidence for a finding is
        // therefore the evidence attached to the finding's own score, so this endpoint
        // returns the score's evidence. The route and response shape are unchanged.
        [GET("GetITOpsFindingEvidence")]
        [ActionName("GetITOpsFindingEvidence")]
        [HttpGet]
        public IHttpActionResult GetITOpsFindingEvidence(int findingId)
        {
            var scoreId = CSPdb.ITOPS_FINDING.GetAll()
                .Where(f => f.ID == findingId && f.ISACTIVE)
                .Select(f => (int?)f.SCORE_ID)
                .FirstOrDefault();
            if (!scoreId.HasValue) return Ok(new List<ITOPS_EvidenceRow>());

            var rows = CSPdb.ITOPS_EVIDENCE.GetAll()
                .Where(e => e.ISACTIVE && e.SCORE_ID == scoreId.Value)
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
        // V2: stored against the finding's SCORE_ID (see GetITOpsFindingEvidence above).
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
                    SCORE_ID = finding.SCORE_ID,
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

        // Notification bell - assessor/reviewer/assessee all read from the same
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

            // V2: a notification targets EITHER an assessment or a finding (CHECK
            // constraint), so finding-targeted rows resolve their assessment through
            // ITOPS_FINDING.SCORE_ID -> ITOPS_SCORE.ASSESSMENT_ID.
            var findingIds = notifications.Where(n => n.FINDING_ID.HasValue).Select(n => n.FINDING_ID.Value).Distinct().ToList();
            var findingScoreIds = CSPdb.ITOPS_FINDING.GetAll()
                .Where(f => findingIds.Contains(f.ID))
                .Select(f => new { f.ID, f.SCORE_ID })
                .ToList();
            var scoreIds = findingScoreIds.Select(f => f.SCORE_ID).Distinct().ToList();
            var scoreAssessment = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => scoreIds.Contains(s.ID))
                .Select(s => new { s.ID, s.ASSESSMENT_ID })
                .ToList()
                .GroupBy(s => s.ID)
                .ToDictionary(g => g.Key, g => g.First().ASSESSMENT_ID);
            var assessmentIdByFindingId = findingScoreIds
                .Where(f => scoreAssessment.ContainsKey(f.SCORE_ID))
                .ToDictionary(f => f.ID, f => scoreAssessment[f.SCORE_ID]);

            var assessmentIds = notifications.Where(n => n.ASSESSMENT_ID.HasValue).Select(n => n.ASSESSMENT_ID.Value)
                .Concat(assessmentIdByFindingId.Values)
                .Distinct()
                .ToList();
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID)).ToList();
            var domainIds = assessments.Select(a => a.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => domainIds.Contains(d.ID)).ToDictionary(d => d.ID, d => d);

            // V2: the account is reached through PROJECT, not a CUST_ID column on the assessment.
            var projectIds = assessments.Where(a => a.PROJECT_ID != null).Select(a => a.PROJECT_ID).Distinct().ToList();
            var custIdByProject = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.CUST_ID })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_ID);
            var custIds = custIdByProject.Values.Where(c => c != null).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var rows = notifications.Select(n =>
            {
                int? resolvedAssessmentId = n.ASSESSMENT_ID;
                if (!resolvedAssessmentId.HasValue && n.FINDING_ID.HasValue && assessmentIdByFindingId.ContainsKey(n.FINDING_ID.Value))
                    resolvedAssessmentId = assessmentIdByFindingId[n.FINDING_ID.Value];

                var assessment = resolvedAssessmentId.HasValue ? assessments.FirstOrDefault(a => a.ID == resolvedAssessmentId.Value) : null;
                var domain = assessment != null && domains.ContainsKey(assessment.DOMAIN_ID) ? domains[assessment.DOMAIN_ID] : null;
                var custId = assessment != null && assessment.PROJECT_ID != null && custIdByProject.ContainsKey(assessment.PROJECT_ID)
                    ? custIdByProject[assessment.PROJECT_ID]
                    : null;

                return new ITOPS_NotificationRow
                {
                    Id = n.ID,
                    NotificationType = n.NOTIFICATION_TYPE,
                    Message = n.MESSAGE,
                    AssessmentId = resolvedAssessmentId,
                    FindingId = n.FINDING_ID,
                    DomainId = assessment?.DOMAIN_ID,
                    DomainCode = domain?.CODE,
                    DomainName = domain?.NAME,
                    CustId = custId,
                    ProjectId = assessment?.PROJECT_ID,
                    AccountName = custId != null && accountNames.ContainsKey(custId) ? accountNames[custId] : null,
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

            // UpdateAuditFields(...) -> UpdateAuditFieldsExt always sets ISACTIVE = true,
            // so it must run BEFORE the dismissal is applied.
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

            List<ITOPS_ASSESSMENT> allAssessments;
            if (!string.IsNullOrWhiteSpace(custId))
            {
                var projectIds = GetITOpsProjectIdsForCustomer(custId);
                allAssessments = projectIds.Any()
                    ? CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => a.ISACTIVE && projectIds.Contains(a.PROJECT_ID)).ToList()
                    : new List<ITOPS_ASSESSMENT>();
            }
            else
            {
                allAssessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => a.ISACTIVE).ToList();
            }

            var completedAssessmentIds = allAssessments
                .Where(a => ITOPS_COMPLETED_STATUSES.Contains(a.STATUS))
                .Select(a => a.ID)
                .ToList();

            var scores = completedAssessmentIds.Any()
                ? CSPdb.ITOPS_SCORE.GetAll()
                    .Where(s => s.ISACTIVE && completedAssessmentIds.Contains(s.ASSESSMENT_ID) && s.SCORE_VALUE != null)
                    .Select(s => s.SCORE_VALUE.Value)
                    .ToList()
                : new List<int>();

            var sum = scores.Sum();
            var max = scores.Count * 5;
            decimal? avg = scores.Count == 0 ? (decimal?)null : (decimal)sum / scores.Count;
            decimal? maturityPct = max == 0 ? (decimal?)null : (decimal)sum / max * 100;

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
            var scores = CSPdb.ITOPS_SCORE.GetAll().ToList().GroupBy(s => s.ID).ToDictionary(g => g.Key, g => g.First());
            var parameters = CSPdb.ITOPS_PARAMETER.GetAll().ToList().GroupBy(p => p.ID).ToDictionary(g => g.Key, g => g.First());
            var categories = CSPdb.ITOPS_CATEGORY.GetAll().ToList().GroupBy(c => c.ID).ToDictionary(g => g.Key, g => g.First());
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().ToList().GroupBy(a => a.ID).ToDictionary(g => g.Key, g => g.First());
            var domains = CSPdb.ITOPS_DOMAIN.GetAll().ToList().GroupBy(d => d.ID).ToDictionary(g => g.Key, g => g.First());

            var findings = CSPdb.ITOPS_FINDING.GetAll().Where(f => f.ISACTIVE && f.STATUS != "Closed").ToList();

            // V2: a finding reaches its assessment (and hence its account) only through
            // SCORE_ID -> ITOPS_SCORE.ASSESSMENT_ID -> ITOPS_ASSESSMENT.PROJECT_ID -> PROJECT.CUST_ID.
            Func<ITOPS_FINDING, ITOPS_ASSESSMENT> assessmentOf = f =>
            {
                ITOPS_SCORE s;
                if (!scores.TryGetValue(f.SCORE_ID, out s)) return null;
                ITOPS_ASSESSMENT a;
                return assessments.TryGetValue(s.ASSESSMENT_ID, out a) ? a : null;
            };

            if (!string.IsNullOrWhiteSpace(custId))
            {
                var projectIds = GetITOpsProjectIdsForCustomer(custId);
                findings = findings
                    .Where(f =>
                    {
                        var a = assessmentOf(f);
                        return a != null && projectIds.Contains(a.PROJECT_ID);
                    })
                    .ToList();
            }

            var rows = findings
                .OrderByDescending(f => f.GAP)
                .Take(take)
                .Select(f =>
                {
                    var score = scores.ContainsKey(f.SCORE_ID) ? scores[f.SCORE_ID] : null;
                    var parameter = score != null && parameters.ContainsKey(score.PARAMETER_ID) ? parameters[score.PARAMETER_ID] : null;
                    var category = parameter != null && categories.ContainsKey(parameter.CATEGORY_ID) ? categories[parameter.CATEGORY_ID] : null;
                    var assessment = assessmentOf(f);
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
