using System;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
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
        // Singular fields = the first-added row of the corresponding join table
        // (legacy shape) - there's no primary/backup distinction any more.
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
        /// <summary>How many of ParamCount were actually scored (not left NA) - the "No of Applicable Parameters" scorecard column. MaxPossible is this count x 5, not ParamCount x 5.</summary>
        public int ApplicableParamCount { get; set; }
        public int SumScores { get; set; }
        public int MaxPossible { get; set; }
        // Populated when the tracker aggregates across every account ("All accounts" on
        // the Dashboard) so cross-account domain rows can be told apart in the UI instead
        // of silently merging two different accounts' same-named domain into one row.
        public string AccountId { get; set; }
        public string AccountName { get; set; }
        public decimal? AverageScore { get; set; }
        public decimal? MaturityPercent { get; set; }
        public string MaturityLevel { get; set; }
        // True once every finding raised on this domain's assessment(s) is Closed - drives
        // showing "Completed" instead of "Approved" once genuinely nothing is left to act on.
        public bool AllFindingsResolved { get; set; }
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
        public string AssesseeEmpId { get; set; }
        public string AssesseeName { get; set; }
        // Assessor's most recent dispute comment when they disputed the assessee's rejection
        // (reopening the finding) - the assessee's own REJECTION_COMMENT is preserved as-is
        // through a dispute so the original reason is never lost, this is the assessor's reply.
        public string DisputeComment { get; set; }
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

    // Assessor's decision on an assessee's rejection of a finding: either confirm the
    // rejection (closes the finding, no further action needed) or dispute it (reopens the
    // finding so the assessee has to reconsider).
    public class ITOPS_RejectionDecisionRequest
    {
        public bool AssessorAccepts { get; set; }
        public string Comment { get; set; }
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
        /// <summary>True when the assessor marked this parameter Not Applicable rather than scoring it - shown as "Not scored"/"Not Scored" in place of a numeric gap/recommendation, with CurrentScore reported as 0 and Gap as the max (5) for sorting purposes.</summary>
        public bool IsNotScored { get; set; }
        // Populated when the Dashboard aggregates across every account ("All accounts")
        // so the same domain name on two different accounts can be told apart instead
        // of their risks silently merging under one shared domain-name tab.
        public string AccountId { get; set; }
        public string AccountName { get; set; }
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
        // Denormalized straight off ITOPS_ASSESSMENT, same field the Dashboard/Reports
        // Business Unit filter already reads - lets the Dashboard derive an own-scope
        // employee's Business Unit list client-side instead of calling the org-wide
        // GetITOpsBusinessUnits endpoint (which isn't scoped to any one employee).
        public string BusinessUnit { get; set; }
        public string Status { get; set; }
        public List<string> Roles { get; set; }
        // How many of THIS assessee's own findings on this assessment are still Open -
        // an assessee's work isn't actually done just because the assessment itself was
        // Approved by the reviewer; it's done once every finding raised against them
        // has been accepted/rejected. 0 for a row where this employee isn't an Assessee.
        public int OpenFindingsForMe { get; set; }
        // Whole-assessment fact (not scoped to this empId): true once every finding raised
        // on this assessment is Closed - nothing left for anyone (assessee or assessor) to
        // act on. Drives showing "Completed" instead of "Approved" once genuinely done.
        public bool AllFindingsResolved { get; set; }
        // Lets "Needs Review" default-sort oldest-submitted-first, so a reviewer's queue
        // reads in the order things actually became their responsibility, not an
        // arbitrary account/domain alphabetical order.
        public DateTime? SubmittedDate { get; set; }
    }

    public class ITOPS_EvidenceRow
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string ContentType { get; set; }
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
        public List<string> AssesseeNames { get; set; }
        public string Status { get; set; }
        public string ReturnComment { get; set; }
    }

    public class ITOPS_UpdateFindingActionRequest
    {
        public string ActionTaken { get; set; }
    }
}
