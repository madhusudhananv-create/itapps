using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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

    public class ITOPS_AssessmentInfo
    {
        public int AssessmentId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public string CustId { get; set; }
        public string CoeSpocEmpId { get; set; }
        public string ReviewerEmpId { get; set; }
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

        // Backs the Domain Tracker/Executive Dashboard: every active domain must have a row for
        // this account even before its COE SPOC has opened it, so "Not Started" domains show up too.
        private void EnsureAssessmentsForAccount(string custId)
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
                ReviewerEmpId = assessment.REVIEWER_EMP_ID,
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
            // same EMP_ID (historical/duplicate records), which would otherwise throw here.
            var empNames = Cldb.EMP_INFO.GetAll()
                .Where(e => empIds.Contains(e.EMP_ID))
                .ToList()
                .GroupBy(e => e.EMP_ID)
                .ToDictionary(g => g.Key, g => g.First().FRST_NM);

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

            var result = parameters.Select(p =>
            {
                scores.TryGetValue(p.ID, out var s);
                var category = categories[p.CATEGORY_ID];
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
                    Notes = s?.NOTES
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

            var scoresMissingNotes = CSPdb.ITOPS_SCORE.GetAll()
                .Any(s => s.ASSESSMENT_ID == assessmentId && s.ISACTIVE && s.SCORE_VALUE != null && string.IsNullOrWhiteSpace(s.NOTES));
            if (scoresMissingNotes)
                return Content(HttpStatusCode.Conflict, "Notes are mandatory for every scored parameter before submitting for review.");

            // Per US-005 note 5: skip the review gate when the reviewer is the same person as the COE SPOC
            assessment.STATUS = assessment.REVIEWER_EMP_ID == assessment.COE_SPOC_EMP_ID ? "Approved" : "PendingReview";
            assessment.SUBMITTED_DATE = DateTime.Now;
            UpdateAuditFields(assessment);
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

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
