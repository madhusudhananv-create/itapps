using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    // API surface for the AIMI (AI Maturity Index) module, backing the usp_AIMI_*
    // stored procedures added in DB Scripts/2026/Release 2.6/Release 2.6.2.sql. AIMI
    // has no C# backend of its own yet (the React client still talks to Firestore
    // directly) - this is the first step of that migration: read/write endpoints
    // over the SQL Server tables, so the client can be pointed at these instead.
    //
    // A partial-class file of AllSysController, not a standalone controller, purely
    // so CheckAccessForFeature(833) (see _overrides.cs) is available for the
    // admin-gated delete action - matching the AIMI_ADMIN_RESOURCE_ID = 833 comment
    // in Release 2.6.2.sql, and the same resource id the client already gates its
    // own UI with (shared/utils/accessControl.ts).
    public partial class AllSysController
    {
        // ------------------------------------------------------------------
        // JSON sub-column deserialization helpers
        // ------------------------------------------------------------------
        // FOR JSON PATH always wraps each row as an object keyed by column name,
        // even for a single-column SELECT - so ACCELERATORS_JSON/QUALITATIVE_
        // BENEFITS_JSON/ASSOCIATED_TOOLS_JSON come back as e.g.
        // [{"ACCELERATOR_NAME":"Docker"}], not ["Docker"]. These small row shapes
        // exist only to unwrap that, and are private to this controller.

        private class AcceleratorJsonRow { public string ACCELERATOR_NAME { get; set; } }
        private class QualitativeBenefitJsonRow { public string BENEFIT_NAME { get; set; } }
        private class AssociatedToolJsonRow { public string TOOL_NAME { get; set; } }

        private static List<AimiAiToolDto> ParseAimiAiTools(string json)
        {
            return string.IsNullOrWhiteSpace(json)
                ? new List<AimiAiToolDto>()
                : JsonConvert.DeserializeObject<List<AimiAiToolDto>>(json);
        }

        private static List<string> ParseAimiNameArray<TRow>(string json, Func<TRow, string> nameSelector)
        {
            return string.IsNullOrWhiteSpace(json)
                ? new List<string>()
                : JsonConvert.DeserializeObject<List<TRow>>(json).Select(nameSelector).ToList();
        }

        private static AimiActivityResponse ToAimiActivityResponse(AimiActivitySpRow row)
        {
            return new AimiActivityResponse
            {
                ID = row.ID,
                PROJECT_ID = row.PROJECT_ID,
                PROJECT = row.PROJECT,
                ACCOUNT = row.ACCOUNT,
                BUSINESS_UNIT = row.BUSINESS_UNIT,
                PRACTICE = row.PRACTICE,
                SDLC_PHASE = row.SDLC_PHASE,
                ACTIVITY = row.ACTIVITY,
                APPLICABILITY = row.APPLICABILITY,
                AI_ADOPTION_SCORE = row.AI_ADOPTION_SCORE,
                WORK_DONE_BY_AI = row.WORK_DONE_BY_AI,
                HOURS_SAVED = row.HOURS_SAVED,
                REVENUE_GENERATED = row.REVENUE_GENERATED,
                BENEFIT_TO = row.BENEFIT_TO,
                COMMENTS = row.COMMENTS,
                STATUS = row.STATUS,
                CREATED_BY = row.CREATED_BY,
                CREATED_DATE = row.CREATED_DATE,
                UPDATED_BY = row.UPDATED_BY,
                UPDATED_DATE = row.UPDATED_DATE,
                ACCEPTED_SCORE = row.ACCEPTED_SCORE,
                SCORE_REVIEWED = row.SCORE_REVIEWED,
                ACCEPTED_SCORE_COMMENT = row.ACCEPTED_SCORE_COMMENT,
                AI_TOOLS = ParseAimiAiTools(row.AI_TOOLS_JSON),
                ACCELERATORS = ParseAimiNameArray<AcceleratorJsonRow>(row.ACCELERATORS_JSON, r => r.ACCELERATOR_NAME),
                QUALITATIVE_BENEFITS = ParseAimiNameArray<QualitativeBenefitJsonRow>(row.QUALITATIVE_BENEFITS_JSON, r => r.BENEFIT_NAME),
            };
        }

        private static AimiReportRowResponse ToAimiReportRowResponse(AimiReportDataSpRow row)
        {
            return new AimiReportRowResponse
            {
                BUSINESS_UNIT = row.BUSINESS_UNIT,
                ACCOUNT = row.ACCOUNT,
                PROJECT = row.PROJECT,
                PROJECT_ID = row.PROJECT_ID,
                PRACTICE = row.PRACTICE,
                PEOPLE_USING_AI = row.PEOPLE_USING_AI,
                LICENSE_COUNT = row.LICENSE_COUNT,
                LICENSE_PROVIDER = row.LICENSE_PROVIDER,
                RUNOPS_AUTO_RESOLVED = row.RUNOPS_AUTO_RESOLVED,
                RUNOPS_MTTR_REDUCTION = row.RUNOPS_MTTR_REDUCTION,
                RUNOPS_AI_AGENTS = row.RUNOPS_AI_AGENTS,
                RUNOPS_AUTOMATED_WORKFLOWS = row.RUNOPS_AUTOMATED_WORKFLOWS,
                RUNOPS_MTTD = row.RUNOPS_MTTD,
                RUNOPS_MTTR = row.RUNOPS_MTTR,
                ENGINEER_AI_AGENTS = row.ENGINEER_AI_AGENTS,
                ENGINEER_DELIVERY_CYCLE_TIME = row.ENGINEER_DELIVERY_CYCLE_TIME,
                ENGINEER_CONTRACT_TEST_CASE_PASS_RATE = row.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
                ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE = row.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE,
                COMMON_ADOPTION_WORKFORCE_CERTIFICATION = row.COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
                COMMON_ADOPTION_EFFORTS_SAVED = row.COMMON_ADOPTION_EFFORTS_SAVED,
                COMMON_DEPLOYMENT_ENGINEER = row.COMMON_DEPLOYMENT_ENGINEER,
                ACCEPTED_SCORE = row.ACCEPTED_SCORE,
                ACCEPTED_SCORE_COMMENT = row.ACCEPTED_SCORE_COMMENT,
                ACTIVITY_ID = row.ACTIVITY_ID,
                SDLC_PHASE = row.SDLC_PHASE,
                ACTIVITY = row.ACTIVITY,
                APPLICABILITY = row.APPLICABILITY,
                AI_ADOPTION_SCORE = row.AI_ADOPTION_SCORE,
                AI_TOOLS = ParseAimiAiTools(row.AI_TOOLS_JSON),
                ACCELERATORS = ParseAimiNameArray<AcceleratorJsonRow>(row.ACCELERATORS_JSON, r => r.ACCELERATOR_NAME),
                WORK_DONE_BY_AI = row.WORK_DONE_BY_AI,
                HOURS_SAVED = row.HOURS_SAVED,
                REVENUE_GENERATED = row.REVENUE_GENERATED,
                BENEFIT_TO = row.BENEFIT_TO,
                QUALITATIVE_BENEFITS = ParseAimiNameArray<QualitativeBenefitJsonRow>(row.QUALITATIVE_BENEFITS_JSON, r => r.BENEFIT_NAME),
                COMMENTS = row.COMMENTS,
                CREATED_DATE = row.CREATED_DATE,
                UPDATED_DATE = row.UPDATED_DATE,
            };
        }

        // ------------------------------------------------------------------
        // Activities
        // ------------------------------------------------------------------

        // Covers the three single-project Firestore reads AIMI used to run
        // (getActivityById / getActivitiesByProjectIdAndPractice / getActivitiesByProjectId) -
        // pass whichever of id/projectId/practice apply, leave the rest null.
        [GET("GetAimiActivities")]
        [ActionName("GetAimiActivities")]
        [HttpGet]
        public IHttpActionResult GetAimiActivities(int? id = null, string projectId = null, string practice = null)
        {
            var rows = CSPdb.AppRepo.AimiGetActivities(id, projectId, practice);
            return Ok(rows.Select(ToAimiActivityResponse).ToList());
        }

        // Cross-project read backing the Reports page and Dashboard/Project Statistics -
        // replaces the old client-side getActivitiesByBusinessUnits/getActivitiesByAccounts/
        // getActivitiesByProjects (and the Firestore 30-value 'in' batching workaround) with
        // one set-based query; an empty/omitted list on any dimension means "no filter there".
        [POST("GetAimiActivitiesByFilter")]
        [ActionName("GetAimiActivitiesByFilter")]
        [HttpPost]
        public IHttpActionResult GetAimiActivitiesByFilter([FromBody] AimiActivitiesByFilterRequest request)
        {
            request = request ?? new AimiActivitiesByFilterRequest();
            var rows = CSPdb.AppRepo.AimiGetActivitiesByFilter(
                request.BusinessUnits, request.Accounts, request.Projects, request.Practices);
            return Ok(rows.Select(ToAimiActivityResponse).ToList());
        }

        // Insert (ID null) or update (ID supplied) one activity, replacing its AI
        // Tool/Accelerator/Qualitative Benefit selections wholesale in the same call -
        // equivalent to the old Firestore addDoc/updateDoc on the activities collection.
        [POST("UpsertAimiActivity")]
        [ActionName("UpsertAimiActivity")]
        [HttpPost]
        public IHttpActionResult UpsertAimiActivity([FromBody] AimiActivityUpsertRequest request)
        {
            if (request == null) return BadRequest("Request body is required.");
            if (string.IsNullOrWhiteSpace(request.PROJECT_ID) || string.IsNullOrWhiteSpace(request.PRACTICE)
                || string.IsNullOrWhiteSpace(request.SDLC_PHASE) || string.IsNullOrWhiteSpace(request.ACTIVITY))
                return BadRequest("PROJECT_ID, PRACTICE, SDLC_PHASE and ACTIVITY are required.");

            var empId = GetHeaderDetails_String("empId");
            var newId = CSPdb.AppRepo.AimiUpsertActivity(
                request.ID, request.PROJECT_ID, request.PROJECT, request.ACCOUNT, request.BUSINESS_UNIT,
                request.PRACTICE, request.SDLC_PHASE, request.ACTIVITY, request.APPLICABILITY,
                request.AI_ADOPTION_SCORE, request.WORK_DONE_BY_AI, request.HOURS_SAVED, request.REVENUE_GENERATED,
                request.BENEFIT_TO, request.COMMENTS, request.STATUS,
                (request.AI_TOOLS ?? new List<AimiAiToolDto>())
                    .Select(t => new AimiAiToolTvpRow { TOOL_NAME = t.TOOL_NAME, ACCESS_TYPE = t.ACCESS_TYPE, LICENSE_COUNT = t.LICENSE_COUNT, NETWORK_TYPE = t.NETWORK_TYPE })
                    .ToList(),
                request.ACCELERATORS, request.QUALITATIVE_BENEFITS, empId);

            return Ok(new AimiIdResult { ID = newId });
        }

        // Soft-deletes one activity (ID) and/or a batch (IDS) - admin-gated per the
        // AIMI_ADMIN_RESOURCE_ID = 833 comment in Release 2.6.2.sql (covers both the
        // single "Delete Activity" action and the admin "bulk delete selected in phase").
        [POST("DeleteAimiActivity")]
        [ActionName("DeleteAimiActivity")]
        [HttpPost]
        public IHttpActionResult DeleteAimiActivity([FromBody] AimiDeleteActivityRequest request)
        {
            CheckAccessForFeature(833);

            request = request ?? new AimiDeleteActivityRequest();
            if (request.ID == null && (request.IDS == null || !request.IDS.Any()))
                return BadRequest("ID or IDS is required.");

            var empId = GetHeaderDetails_String("empId");
            CSPdb.AppRepo.AimiDeleteActivity(request.ID, request.IDS, empId);
            return Ok();
        }

        // ------------------------------------------------------------------
        // Project Info (AI Adoption Metrics panel)
        // ------------------------------------------------------------------

        // projectId null returns every project's info (covers both getProjectInfo and
        // getAllProjectInfo).
        [GET("GetAimiProjectInfo")]
        [ActionName("GetAimiProjectInfo")]
        [HttpGet]
        public IHttpActionResult GetAimiProjectInfo(string projectId = null)
        {
            return Ok(CSPdb.AppRepo.AimiGetProjectInfo(projectId));
        }

        [POST("UpsertAimiProjectInfo")]
        [ActionName("UpsertAimiProjectInfo")]
        [HttpPost]
        public IHttpActionResult UpsertAimiProjectInfo([FromBody] AimiProjectInfoUpsertRequest request)
        {
            if (request == null) return BadRequest("Request body is required.");
            if (string.IsNullOrWhiteSpace(request.PROJECT_ID)) return BadRequest("PROJECT_ID is required.");

            var empId = GetHeaderDetails_String("empId");

            // PPT Status / Presentation Done are editable by AIMI admins (resource 833, which includes
            // the DevX team) only. For anyone else keep the stored values, whatever the client sent.
            if (!IsAimiAdmin(empId))
            {
                var existing = CSPdb.AppRepo.AimiGetProjectInfo(request.PROJECT_ID).FirstOrDefault();
                request.PPT_STATUS = existing != null && existing.PPT_STATUS;
                request.PRESENTATION_DONE = existing != null && existing.PRESENTATION_DONE;
            }

            var newId = CSPdb.AppRepo.AimiUpsertProjectInfo(
                request.ID, request.PROJECT_ID, request.PEOPLE_USING_AI, request.IS_PROJECT_NA, request.NA_COMMENTS,
                request.LICENSE_COUNT, request.LICENSE_PROVIDER, request.RUNOPS_AUTO_RESOLVED, request.RUNOPS_MTTR_REDUCTION,
                request.RUNOPS_AI_AGENTS, request.RUNOPS_AUTOMATED_WORKFLOWS, request.RUNOPS_MTTD, request.RUNOPS_MTTR,
                request.ENGINEER_AI_AGENTS, request.ENGINEER_DELIVERY_CYCLE_TIME, request.ENGINEER_CONTRACT_TEST_CASE_PASS_RATE,
                request.ENGINEER_PERFORMANCE_DEFECTS_PRE_RELEASE, request.COMMON_ADOPTION_WORKFORCE_CERTIFICATION,
                request.COMMON_ADOPTION_EFFORTS_SAVED, request.COMMON_DEPLOYMENT_ENGINEER, request.PPT_STATUS, request.PRESENTATION_DONE,
                request.PROJECT_FY, empId);

            return Ok(new AimiIdResult { ID = newId });
        }

        // Admin review of the Overall Score (Accepted Score / Score Reviewed / Comments).
        // Stored on the project's activities and written through its own proc so saving a
        // review can't touch any other data.
        [POST("UpdateAimiAcceptedScore")]
        [ActionName("UpdateAimiAcceptedScore")]
        [HttpPost]
        public IHttpActionResult UpdateAimiAcceptedScore([FromBody] AimiAcceptedScoreUpdateRequest request)
        {
            if (request == null) return BadRequest("Request body is required.");
            if (string.IsNullOrWhiteSpace(request.PROJECT_ID) || string.IsNullOrWhiteSpace(request.PRACTICE))
                return BadRequest("PROJECT_ID and PRACTICE are required.");

            var empId = GetHeaderDetails_String("empId");
            var updatedCount = CSPdb.AppRepo.AimiUpdateAcceptedScore(
                request.PROJECT_ID, request.PRACTICE, request.ACCEPTED_SCORE, request.SCORE_REVIEWED,
                request.ACCEPTED_SCORE_COMMENT, empId);

            return Ok(new AimiIdResult { ID = updatedCount });
        }

        // ------------------------------------------------------------------
        // Analytics dashboard: monthly score history (AIMI_SCORE_HISTORY)
        // ------------------------------------------------------------------
        // Admin only (same resource id 833 as the delete action). The dashboard reads stored
        // monthly snapshots. The current month's snapshot is kept up to date by the trigger
        // TR_AIMI_ACTIVITY_ScoreSnapshot on every activity change, and again when the dashboard loads.

        // Writes a mail problem to AIMI_ERROR_LOG (the same table the AIMI app's own error log uses).
        private void LogAimiMailError(string empId, string action, string message, Exception ex = null)
        {
            try
            {
                CSPdb.AppRepo.AimiInsertErrorLog(empId, "ActivityMail", Truncate(action, 100),
                    Truncate(Request?.RequestUri?.ToString(), 500), Truncate(message, 4000),
                    Truncate(ex?.GetType().ToString(), 200), Truncate(ex?.ToString(), 8000));
            }
            catch { }
        }

        // Sent once per "Submit Activities" (not on every draft save, edit or delete). Lists what was added,
        // updated and deleted since the previous submit, using AIMI_ACTIVITY.CHANGE_TYPE, which the save/delete
        // procs maintain. Nothing is sent when nothing changed.
        [POST("SendAimiSubmitMail")]
        [ActionName("SendAimiSubmitMail")]
        [HttpPost]
        public IHttpActionResult SendAimiSubmitMail([FromBody] AimiSubmitMailRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.PROJECT_ID) || string.IsNullOrWhiteSpace(request.PRACTICE))
                return BadRequest("PROJECT_ID and PRACTICE are required.");

            SendAimiSubmitMailInternal(GetHeaderDetails_String("empId"), request.PROJECT_ID, request.PRACTICE, request.CC_EMAILS);
            return Ok();
        }

        // The person who submitted is on To; the AIMI admin mail IDs (configuration_ext key AIMI_admin_mail) and
        // the DevX mailbox are on CC, so we don't list every employee holding admin access. Mail trouble must
        // never fail the submit itself, so it is written to AIMI_ERROR_LOG instead of being thrown. A mail that
        // was sent also gets its row in EMAIL_LOG from EmailProvider. The change flags are cleared only after a
        // successful send, so a failed mail is retried with the next submit.
        private void SendAimiSubmitMailInternal(string empId, string projectId, string practice, string extraCc = null)
        {
            try
            {
                var changes = CSPdb.AppRepo.AimiGetPendingActivityChanges(projectId, practice);
                if (!changes.Any()) return;

                var submitter = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId);
                var submitterName = submitter == null ? empId : ((submitter.FRST_NM + " " + submitter.LAST_NM).Trim());
                if (submitter == null || string.IsNullOrWhiteSpace(submitter.EMAIL_ID))
                {
                    LogAimiMailError(empId, "Submit", "Mail not sent: no email address found for employee " + empId);
                    return;
                }
                var to = submitter.EMAIL_ID.Trim();
                // Project manager / DPE come from the project data the screen already has; keep only
                // well-formed addresses and skip anyone already on To so nobody gets the mail twice.
                // Delivery Partner = PROJECT.PROJ_DM_EMP_ID (same join the CSAT reports use); skipped if left the company
                var projectRow = Cldb.PROJECT.GetAll().FirstOrDefault(x => x.PROJ_ID == projectId);
                var dpEmpId = projectRow == null ? null : projectRow.PROJ_DM_EMP_ID;
                var dp = string.IsNullOrWhiteSpace(dpEmpId) ? null
                    : Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == dpEmpId && x.DOR == null);
                var dpEmail = dp == null ? "" : dp.EMAIL_ID;

                var extraCcList = ((extraCc ?? "") + "," + dpEmail)
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(x => x.Trim())
                    .Where(x => x.Contains("@") && !x.Equals(to, StringComparison.OrdinalIgnoreCase))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();
                var ccList = new List<string> { helper.GetDBConfig("AIMI_admin_mail", "-1"), Constants.DEVX_MAIL };
                ccList.AddRange(extraCcList);
                var cc = helper.ConcatEmails(ccList);

                Func<string, string> enc = s => System.Web.HttpUtility.HtmlEncode(s ?? "");
                var added = changes.Where(c => c.CHANGE_TYPE == "Added").ToList();
                var updated = changes.Where(c => c.CHANGE_TYPE == "Updated").ToList();
                var deleted = changes.Where(c => c.CHANGE_TYPE == "Deleted").ToList();

                var summary = new List<string>();
                if (added.Any()) summary.Add(added.Count + " added");
                if (updated.Any()) summary.Add(updated.Count + " updated");
                if (deleted.Any()) summary.Add(deleted.Count + " deleted");

                var sections = new System.Text.StringBuilder();
                sections.Append(BuildAimiChangeSection("Added", "Newly added activities", "#2e7d32", "#ffffff", "none", added, enc));
                sections.Append(BuildAimiChangeSection("Updated", "Updated activities", "#b26a00", "#fff4d6", "none", updated, enc));
                sections.Append(BuildAimiChangeSection("Deleted", "Deleted activities", "#c62828", "#ffffff", "line-through", deleted, enc));

                var first = changes.First();
                var mailContent = helper.GetEmailContent("AimiActivityUpdate.htm", new Dictionary<string, string>
                {
                    { "Submitted_By", enc(submitterName) },
                    { "Date", DateTime.Now.ToString("dd MMM yyyy HH:mm") },
                    { "Account", enc(first.ACCOUNT) },
                    { "Project", enc(first.PROJECT) },
                    { "Practice", enc(first.PRACTICE) },
                    { "Summary", enc(string.Join(", ", summary)) },
                    { "CHANGE_SECTIONS", sections.ToString() },
                });

                var subject = "AIMI - Activities submitted : " + first.PROJECT + " (" + first.PRACTICE + ")";

                var ep = new EmailProvider(Cldb, CSPdb);
                // ProjId is left empty on purpose: a "PROJ..." id makes EmailProvider add the whole GSLab
                // DEVEX_CC_LIST, which this mail doesn't want.
                var sent = ep.SendEmail(
                    new EmailConfig { environment = enumEnvironment.Dev, smtpAccount = _email, smtpHost = "smtp.office365.com", smtpPassword = _password, smtpPortValue = "587" },
                    new EmailContent { from = _email, to = to, cc = cc, content = mailContent, subject = subject, hasAttachments = false, attachmentFilePath = "" },
                    Request);

                if (sent)
                    CSPdb.AppRepo.AimiClearActivityChanges(projectId, practice);
                else
                    LogAimiMailError(empId, "Submit", "Submit mail not sent for project " + first.PROJECT + ". See EMAIL_LOG for the SMTP error.");
            }
            catch (Exception ex)
            {
                LogAimiMailError(empId, "Submit", "Submit mail failed: " + ex.Message, ex);
            }
        }

        // One coloured table (heading + rows) for the submit mail; empty string when there is nothing in it.
        // Inline styles only - mail clients ignore most <style> blocks.
        private static string BuildAimiChangeSection(string label, string heading, string accent, string rowBackground,
            string textDecoration, List<AimiActivityChangeSpRow> rows, Func<string, string> enc)
        {
            if (rows == null || !rows.Any()) return "";

            var cell = "padding:8px 12px;border:1px solid #d9d9d9;text-align:left;vertical-align:top;";
            var sb = new System.Text.StringBuilder();
            sb.Append("<p style=\"margin:22px 0 6px 0;font-size:14px;font-weight:bold;color:" + accent + ";\">"
                + "<span style=\"background:" + accent + ";color:#ffffff;padding:2px 10px;border-radius:10px;font-size:12px;\">" + label + "</span>"
                + "&nbsp; " + heading + " (" + rows.Count + ")</p>");
            sb.Append("<table cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;width:100%;font-size:13px;\">");
            sb.Append("<tr style=\"background:#f2f2f2;\">"
                + "<th style=\"" + cell + "\">SDLC Phase</th><th style=\"" + cell + "\">Activity</th>"
                + "<th style=\"" + cell + "\">Applicability</th><th style=\"" + cell + "\">AI Adoption Score</th></tr>");
            foreach (var r in rows)
            {
                sb.Append("<tr style=\"background:" + rowBackground + ";text-decoration:" + textDecoration + ";\">"
                    + "<td style=\"" + cell + "\">" + enc(r.SDLC_PHASE) + "</td>"
                    + "<td style=\"" + cell + "\">" + enc(r.ACTIVITY) + "</td>"
                    + "<td style=\"" + cell + "\">" + enc(r.APPLICABILITY) + "</td>"
                    + "<td style=\"" + cell + "\">" + (r.AI_ADOPTION_SCORE.HasValue ? r.AI_ADOPTION_SCORE.Value.ToString() : "-") + "</td></tr>");
            }
            sb.Append("</table>");
            return sb.ToString();
        }

        // Non-throwing twin of CheckAccessForFeature(833): true only for company employees whose role
        // or employee id holds an active AIMI admin access row. Customer logins are never admins.
        private bool IsAimiAdmin(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return false;
            var role = Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId)?.CSM_TITLE_ID;
            if (!role.HasValue) return false;
            return CSPdb.APP_ACCESS_CONTROLS.GetAll().Any(t => t.RESOURCE_ID == 833
                && (t.VIEW_ACCESS || t.CREATE_ACCESS || t.EDIT_ACCESS || t.DELETE_ACCESS)
                && (t.ROLE_ID == role.Value || t.EMP_ID.Contains(empId)) && t.ISACTIVE == true);
        }

        private void RequireAimiAdmin()
        {
            var empId = GetHeaderDetails_String("empId");
            // CheckAccessForFeature lets customer logins (no EMP_INFO row) through, which is
            // not acceptable for company-wide score history.
            if (string.IsNullOrWhiteSpace(empId) || Cldb.EMP_INFO.GetAll().FirstOrDefault(x => x.EMP_ID == empId) == null)
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Forbidden, "AIMI Analytics is available to administrators only."));
            CheckAccessForFeature(833);
        }

        // Values for the BU / Account / Project / Practice filter popups.
        [GET("GetAimiScoreFilterOptions")]
        [ActionName("GetAimiScoreFilterOptions")]
        [HttpGet]
        public IHttpActionResult GetAimiScoreFilterOptions()
        {
            RequireAimiAdmin();
            return Ok(CSPdb.AppRepo.AimiGetScoreFilterOptions());
        }

        // Monthly history for the chosen level and filters (see usp_AIMI_GetScoreAnalytics.sql).
        [POST("GetAimiScoreAnalytics")]
        [ActionName("GetAimiScoreAnalytics")]
        [HttpPost]
        public IHttpActionResult GetAimiScoreAnalytics([FromBody] AimiScoreAnalyticsRequest request)
        {
            RequireAimiAdmin();
            request = request ?? new AimiScoreAnalyticsRequest();

            var level = (request.Level ?? "").Trim().ToUpperInvariant();
            if (level != "BU" && level != "ACCOUNT" && level != "PROJECT" && level != "PRACTICE")
                return BadRequest("Level must be BU, ACCOUNT, PROJECT or PRACTICE.");

            var rows = CSPdb.AppRepo.AimiGetScoreAnalytics(
                level, request.Months ?? 12, request.BusinessUnits, request.Accounts, request.Projects, request.Practices);
            return Ok(rows);
        }

        // Report rows for "Download report" (see usp_AIMI_GetScoreReport.sql): one row per group at the
        // requested Level, with the same filters as GetAimiScoreAnalytics so it matches the dashboard.
        [POST("GetAimiScoreReport")]
        [ActionName("GetAimiScoreReport")]
        [HttpPost]
        public IHttpActionResult GetAimiScoreReport([FromBody] AimiScoreAnalyticsRequest request)
        {
            RequireAimiAdmin();
            request = request ?? new AimiScoreAnalyticsRequest();

            var level = (request.Level ?? "").Trim().ToUpperInvariant();
            if (level != "BU" && level != "ACCOUNT" && level != "PROJECT" && level != "PRACTICE")
                return BadRequest("Level must be BU, ACCOUNT, PROJECT or PRACTICE.");

            // The database decides the columns and their titles (AIMI_SCORE_REPORT_COLUMN) and returns
            // the rows as JSON; pass it through untouched so the global camelCase serializer
            // can't rename those titles.
            var json = CSPdb.AppRepo.AimiGetScoreReport(
                level, request.Months ?? 12, request.BusinessUnits, request.Accounts, request.Projects, request.Practices);
            return ResponseMessage(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            });
        }

        // Captures (or refreshes) a month's snapshot for every project and practice. Used for
        // an on-demand refresh and by a month-end scheduler.
        [POST("CaptureAimiScoreSnapshot")]
        [ActionName("CaptureAimiScoreSnapshot")]
        [HttpPost]
        public IHttpActionResult CaptureAimiScoreSnapshot([FromBody] AimiScoreSnapshotRequest request)
        {
            RequireAimiAdmin();
            CSPdb.AppRepo.AimiCaptureScoreSnapshot(request?.Month, null, null, GetHeaderDetails_String("empId"));
            return Ok();
        }

        // ------------------------------------------------------------------
        // Usage / error logging (AIMI_USER_ACTIVITY_LOG, AIMI_ERROR_LOG)
        // ------------------------------------------------------------------
        // Best-effort: logging must never break the user's action, so failures are
        // swallowed and the call always returns 200. The user comes from the empId
        // header; the stored procs resolve the e-mail from EMP_INFO.

        private static string Truncate(string value, int maxLength)
        {
            return string.IsNullOrEmpty(value) || value.Length <= maxLength ? value : value.Substring(0, maxLength);
        }

        [POST("LogAimiUserActivity")]
        [ActionName("LogAimiUserActivity")]
        [HttpPost]
        public IHttpActionResult LogAimiUserActivity([FromBody] AimiUserActivityLogRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.MODULE) || string.IsNullOrWhiteSpace(request.ACTION))
                return BadRequest("MODULE and ACTION are required.");

            try
            {
                string ip = null;
                try
                {
                    if (System.Web.HttpContext.Current != null)
                        ip = System.Web.HttpContext.Current.Request.UserHostAddress;
                }
                catch { }

                CSPdb.AppRepo.AimiInsertUserActivityLog(
                    GetHeaderDetails_String("empId"), Truncate(request.MODULE, 50), Truncate(request.ACTION, 100),
                    Truncate(request.PROJECT_ID, 20), Truncate(request.PRACTICE, 100),
                    Truncate(request.REQUEST_URL, 500), Truncate(ip, 50));
            }
            catch { }

            return Ok();
        }

        [POST("LogAimiError")]
        [ActionName("LogAimiError")]
        [HttpPost]
        public IHttpActionResult LogAimiError([FromBody] AimiErrorLogRequest request)
        {
            if (request == null) return BadRequest("Request body is required.");

            try
            {
                CSPdb.AppRepo.AimiInsertErrorLog(
                    GetHeaderDetails_String("empId"), Truncate(request.MODULE, 50), Truncate(request.ACTION, 100),
                    Truncate(request.REQUEST_URL, 500), Truncate(request.ERROR_MESSAGE, 4000),
                    Truncate(request.EXCEPTION_TYPE, 200), Truncate(request.STACK_TRACE, 8000));
            }
            catch { }

            return Ok();
        }

        // ------------------------------------------------------------------
        // Practice Info (per-project, per-practice current phase)
        // ------------------------------------------------------------------

        [GET("GetAimiPracticeInfo")]
        [ActionName("GetAimiPracticeInfo")]
        [HttpGet]
        public IHttpActionResult GetAimiPracticeInfo(string projectId = null, string practice = null)
        {
            return Ok(CSPdb.AppRepo.AimiGetPracticeInfo(projectId, practice));
        }

        [POST("UpsertAimiPracticeInfo")]
        [ActionName("UpsertAimiPracticeInfo")]
        [HttpPost]
        public IHttpActionResult UpsertAimiPracticeInfo([FromBody] AimiPracticeInfoUpsertRequest request)
        {
            if (request == null) return BadRequest("Request body is required.");
            if (string.IsNullOrWhiteSpace(request.PROJECT_ID) || string.IsNullOrWhiteSpace(request.PRACTICE))
                return BadRequest("PROJECT_ID and PRACTICE are required.");

            var empId = GetHeaderDetails_String("empId");
            var newId = CSPdb.AppRepo.AimiUpsertPracticeInfo(request.ID, request.PROJECT_ID, request.PRACTICE, request.CURRENT_PHASE, empId);
            return Ok(new AimiIdResult { ID = newId });
        }

        // ------------------------------------------------------------------
        // Analytics (Dashboard / Project Statistics)
        // ------------------------------------------------------------------

        [GET("GetAimiAIToolMetrics")]
        [ActionName("GetAimiAIToolMetrics")]
        [HttpGet]
        public IHttpActionResult GetAimiAIToolMetrics(string projectId = null, string practice = null)
        {
            return Ok(CSPdb.AppRepo.AimiGetAIToolMetrics(projectId, practice));
        }

        [GET("GetAimiAIToolsBySDLCPhase")]
        [ActionName("GetAimiAIToolsBySDLCPhase")]
        [HttpGet]
        public IHttpActionResult GetAimiAIToolsBySDLCPhase(string projectId = null, string practice = null)
        {
            return Ok(CSPdb.AppRepo.AimiGetAIToolsBySDLCPhase(projectId, practice));
        }

        // projectId/practice both null -> portfolio-wide Dashboard; projectId (optionally
        // + practice) -> one project's "Project Statistics" tab.
        [GET("GetAimiDashboardSummary")]
        [ActionName("GetAimiDashboardSummary")]
        [HttpGet]
        public IHttpActionResult GetAimiDashboardSummary(string projectId = null, string practice = null)
        {
            return Ok(CSPdb.AppRepo.AimiGetDashboardSummary(projectId, practice));
        }

        [GET("GetAimiQualitativeBenefitAnalysis")]
        [ActionName("GetAimiQualitativeBenefitAnalysis")]
        [HttpGet]
        public IHttpActionResult GetAimiQualitativeBenefitAnalysis(string projectId = null, string practice = null)
        {
            var rows = CSPdb.AppRepo.AimiGetQualitativeBenefitAnalysis(projectId, practice);
            var result = rows.Select(r => new AimiQualitativeBenefitAnalysisResponse
            {
                BENEFIT_NAME = r.BENEFIT_NAME,
                FREQUENCY = r.FREQUENCY,
                TOTAL_HOURS_SAVED = r.TOTAL_HOURS_SAVED,
                MOST_FREQUENT_TOOL = r.MOST_FREQUENT_TOOL,
                ASSOCIATED_TOOLS = ParseAimiNameArray<AssociatedToolJsonRow>(r.ASSOCIATED_TOOLS_JSON, t => t.TOOL_NAME),
            }).ToList();
            return Ok(result);
        }

        // ------------------------------------------------------------------
        // Report Data (Reports page "Generate Reports" / Manage Activities
        // "Generate Report") - the single set-based query these two entry points
        // share; see usp_AIMI_GetReportData.sql's header note.
        // ------------------------------------------------------------------

        // Activity reports with their columns and titles configured in the database
        // (AIMI_ACTIVITY_REPORT_COLUMN, see usp_AIMI_GetActivityReport.sql). Returns a JSON array of
        // row objects keyed by column title, passed through untouched so the global camelCase
        // serializer can't rename those titles.
        [POST("GetAimiActivityReport")]
        [ActionName("GetAimiActivityReport")]
        [HttpPost]
        public IHttpActionResult GetAimiActivityReport([FromBody] AimiActivityReportRequest request)
        {
            request = request ?? new AimiActivityReportRequest();
            var reportType = (request.ReportType ?? "").Trim().ToUpperInvariant();
            if (reportType != "PROJECT" && reportType != "MULTI")
                return BadRequest("ReportType must be PROJECT or MULTI.");

            var json = CSPdb.AppRepo.AimiGetActivityReport(
                reportType, request.ProjectId, request.Practice,
                request.BusinessUnits, request.Accounts, request.Projects, request.Practices);
            return ResponseMessage(new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json")
            });
        }

        [POST("GetAimiReportData")]
        [ActionName("GetAimiReportData")]
        [HttpPost]
        public IHttpActionResult GetAimiReportData([FromBody] AimiReportDataRequest request)
        {
            request = request ?? new AimiReportDataRequest();
            var rows = CSPdb.AppRepo.AimiGetReportData(
                request.ProjectId, request.Practice, request.BusinessUnits, request.Accounts, request.Projects, request.Practices);
            return Ok(rows.Select(ToAimiReportRowResponse).ToList());
        }

        // ------------------------------------------------------------------
        // Lookup/master data - the questionnaire practice/phase/activity catalog
        // and option-list suggestion tables that used to be hardcoded/derived
        // from a static questionnaire.json in the React client (see
        // Release 2.6.3.sql). Each endpoint returns flat rows; the client
        // reassembles the practice -> phase -> activity tree itself, the same
        // way it already pivots flat SDLC_PHASE/TOOL_NAME rows elsewhere.
        // ------------------------------------------------------------------

        [GET("GetAimiPractices")]
        [ActionName("GetAimiPractices")]
        [HttpGet]
        public IHttpActionResult GetAimiPractices()
        {
            return Ok(CSPdb.AppRepo.AimiGetPractices());
        }

        [GET("GetAimiSdlcPhases")]
        [ActionName("GetAimiSdlcPhases")]
        [HttpGet]
        public IHttpActionResult GetAimiSdlcPhases()
        {
            return Ok(CSPdb.AppRepo.AimiGetSdlcPhases());
        }

        [GET("GetAimiQuestionnaireActivities")]
        [ActionName("GetAimiQuestionnaireActivities")]
        [HttpGet]
        public IHttpActionResult GetAimiQuestionnaireActivities()
        {
            return Ok(CSPdb.AppRepo.AimiGetQuestionnaireActivities());
        }

        [GET("GetAimiQualitativeBenefitOptions")]
        [ActionName("GetAimiQualitativeBenefitOptions")]
        [HttpGet]
        public IHttpActionResult GetAimiQualitativeBenefitOptions()
        {
            return Ok(CSPdb.AppRepo.AimiGetQualitativeBenefits());
        }

        [GET("GetAimiAiAdoptionScoreOptions")]
        [ActionName("GetAimiAiAdoptionScoreOptions")]
        [HttpGet]
        public IHttpActionResult GetAimiAiAdoptionScoreOptions()
        {
            return Ok(CSPdb.AppRepo.AimiGetAiAdoptionScores());
        }

        [GET("GetAimiAiToolOptions")]
        [ActionName("GetAimiAiToolOptions")]
        [HttpGet]
        public IHttpActionResult GetAimiAiToolOptions()
        {
            return Ok(CSPdb.AppRepo.AimiGetAiTools());
        }

        [GET("GetAimiAcceleratorOptions")]
        [ActionName("GetAimiAcceleratorOptions")]
        [HttpGet]
        public IHttpActionResult GetAimiAcceleratorOptions()
        {
            return Ok(CSPdb.AppRepo.AimiGetAccelerators());
        }

    }
}
