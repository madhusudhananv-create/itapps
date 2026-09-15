using System;
using System.Collections.Generic;

namespace GAVS.AllocationSystem.Model.CSP.ViewModels
{
    // ---------------------------------------------------------------------
    // View models for the IT Operations Maturity Assessment ADMIN SETUP
    // endpoints (ITOperationMaturityAdminController.cs). Kept in a separate
    // file, same as ITOperationMaturityModels.cs for the runtime workflow
    // controller, so the controller files hold methods only.
    // ---------------------------------------------------------------------

    /// <summary>One employee's current (DOR IS NULL) row, for every people-picker on this admin surface.</summary>
    public class ITOPS_EmployeeRosterRow
    {
        public string EmpId { get; set; }
        public string Name { get; set; }
        public string Title { get; set; }
    }

    public class ITOPS_RoleRow
    {
        public int RoleId { get; set; }
        public string RoleCode { get; set; }
        public string RoleName { get; set; }
        public string Description { get; set; }
    }

    public class ITOPS_RoleAssignmentRow
    {
        public int Id { get; set; }
        public string EmpId { get; set; }
        public string EmpName { get; set; }
        public int RoleId { get; set; }
        public string RoleCode { get; set; }
        public string RoleName { get; set; }
        // null PROJECT_ID = org-wide or own-access grant (see ScopeType); otherwise the grant only applies to this project.
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Scope { get; set; }
        // Raw "ORG" | "OWN" | "PROJECT", alongside the display-friendly Scope label above.
        public string ScopeType { get; set; }
        public DateTime GrantedOn { get; set; }
    }

    public class ITOPS_GrantRoleRequest
    {
        public string EmpId { get; set; }
        public int RoleId { get; set; }
        public string ProjectId { get; set; } // null/empty = org-wide
    }

    // Bulk variant of ITOPS_GrantRoleRequest: one call grants every
    // (employee x role x project) combination. Empty/null ProjectIds means a
    // single org-wide grant per (employee, role) pair (PROJECT_ID = NULL).
    // EmpIds (plural) replaced the old single EmpId - the Angular Configure
    // Roles screen is the only consumer, and its "Assign a role" modal now picks
    // several employees at once.
    public class ITOPS_GrantRolesRequest
    {
        public List<string> EmpIds { get; set; }
        public List<int> RoleIds { get; set; }
        public List<string> ProjectIds { get; set; }
    }

    public class ITOPS_RevokeRolesRequest
    {
        public List<int> Ids { get; set; }
    }

    // One (role, scope) entry inside a mixed-scope batch grant for a single
    // employee - e.g. role A org-wide and role B scoped to two projects, in
    // the same call. ITOPS_GrantRolesRequest can't express this because it is
    // one RoleIds x ProjectIds cartesian product shared by every role.
    public class ITOPS_GrantRoleEntry
    {
        public int RoleId { get; set; }
        public List<string> ProjectIds { get; set; } // null/empty = org-wide
    }

    // Grants several roles, each with its own scope, to one employee in a
    // single call - used by the Configure Roles "edit" diff so adding
    // multiple roles at once results in ONE consolidated notification email,
    // not one per role.
    public class ITOPS_GrantRolesMultiRequest
    {
        public string EmpId { get; set; }
        public List<ITOPS_GrantRoleEntry> Entries { get; set; }
    }

    // Projects to email about when the admin clicks "Submit and Continue to
    // Configure Assessment" on the domain-project mapping screen.
    public class ITOPS_SubmitMappingsRequest
    {
        public List<string> ProjectIds { get; set; }
    }

    // One ITOPS_ROLE_ASSIGNMENT row, ACTIVE OR NOT, projected as an audit-trail
    // entry. Revokes are soft-deletes (ISACTIVE = false) that leave the row and
    // its audit columns intact, so a single row carries both events: it was
    // GRANTED by CreatedBy on CreatedDate, and - when IsActive is false - last
    // touched (i.e. revoked) by UpdatedBy on UpdatedDate. There is no separate
    // history table; this is the history.
    public class ITOPS_RoleAssignmentHistoryRow
    {
        public int Id { get; set; }
        public string EmpId { get; set; }
        public string EmpName { get; set; }
        public int RoleId { get; set; }
        public string RoleCode { get; set; }
        public string RoleName { get; set; }
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Scope { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedByName { get; set; }
        public DateTime CreatedDate { get; set; }
        public string UpdatedBy { get; set; }
        public string UpdatedByName { get; set; }
        public DateTime UpdatedDate { get; set; }
        // The stamp the list is sorted on: UPDATED_DATE when it is later than
        // CREATED_DATE, else CREATED_DATE.
        public DateTime LastActivityDate { get; set; }
    }

    // Edits ONE existing ITOPS_ROLE_ASSIGNMENT row in place - the row keeps its
    // ID (and therefore its CREATED_DATE / "Granted" date); only ROLE_ID and
    // PROJECT_ID change. Deliberately single-role/single-scope: a row IS one
    // role at one scope, so "edit into three roles" has no meaning here.
    public class ITOPS_UpdateRoleAssignmentRequest
    {
        public int Id { get; set; }
        public int RoleId { get; set; }
        public string ProjectId { get; set; } // null/empty = org-wide
    }

    public class ITOPS_AssessmentCycleRow
    {
        public int Id { get; set; }
        public string CycleLabel { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public int AssessmentCount { get; set; }
        // Cycle-level completion dashboard (Step 2 list). One entry per DISTINCT
        // ITOPS_ASSESSMENT.STATUS actually present in the cycle, across every
        // project in it - never a fixed enum, so a status added later still shows.
        public List<ITOPS_CycleStatusCountRow> StatusCounts { get; set; }
        // "Done" = Approved or Closed - the two terminal states the review flow
        // (SubmitITOpsAssessmentForReview / ReviewITOpsAssessment) can leave a row in.
        public int CompletedCount { get; set; }
        // CompletedCount / AssessmentCount as a whole percent; 0 when the cycle is empty.
        public int CompletionPercent { get; set; }
    }

    public class ITOPS_CycleStatusCountRow
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }

    public class ITOPS_CreateCycleRequest
    {
        public string CycleLabel { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string Description { get; set; }
    }

    // Step 3 (domains sub-tab). Richer than ITOPS_DomainListRow (which the
    // landing page uses) - the setup screen also shows the default owners and
    // how many categories hang off the domain.
    public class ITOPS_DomainAdminRow
    {
        public int DomainId { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int? MinRequiredScore { get; set; }
        public int DisplayOrder { get; set; }
        public string DefaultAssessorId { get; set; }
        public string DefaultAssessorName { get; set; }
        public string DefaultReviewerId { get; set; }
        public string DefaultReviewerName { get; set; }
        public int CategoryCount { get; set; }
    }

    public class ITOPS_CreateDomainRequest
    {
        public string Name { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
        public int? MinRequiredScore { get; set; }
        public string DefaultAssessorId { get; set; }
        public string DefaultReviewerId { get; set; }
    }

    // Rename-only: CODE stays frozen because the Angular route
    // (/assessment/:domainCode) and every stored mapping key off it.
    public class ITOPS_UpdateDomainRequest
    {
        public int DomainId { get; set; }
        public string Name { get; set; }
    }

    public class ITOPS_ProjectRow
    {
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string CustId { get; set; }
        public string AccountName { get; set; }
        public string BusinessUnit { get; set; }
    }

    public class ITOPS_MappedDomainRow
    {
        public int MappingId { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
    }

    public class ITOPS_ProjectAssesseeRow
    {
        public string EmpId { get; set; }
        public string Name { get; set; }
    }

    public class ITOPS_DomainProjectMappingRow
    {
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string CustId { get; set; }
        public string AccountName { get; set; }
        public List<ITOPS_MappedDomainRow> Domains { get; set; }
        public List<ITOPS_ProjectAssesseeRow> Assessees { get; set; }
    }

    public class ITOPS_SaveDomainProjectMappingRequest
    {
        public string ProjectId { get; set; }
        // The FULL desired set of active domains for this project - anything
        // active but absent here is deactivated (replace semantics, not append).
        public List<int> DomainIds { get; set; }
        // Optional free-text reason, logged to ITOPS_DOMAIN_PROJECT_MAP_AUDIT
        // against every domain actually added/reactivated/removed by this call.
        public string Reason { get; set; }
    }

    // Additive bulk sibling of ITOPS_SaveDomainProjectMappingRequest: every
    // (project x domain) combination is added/reactivated and NOTHING already
    // mapped to those projects is removed. Use the single-project Save request
    // above when the project's domain set must end up EXACTLY as sent.
    public class ITOPS_BulkAddDomainProjectMappingRequest
    {
        public List<string> ProjectIds { get; set; }
        public List<int> DomainIds { get; set; }
        public string Reason { get; set; }
    }

    public class ITOPS_RemoveDomainProjectMappingRequest
    {
        public string ProjectId { get; set; }
        public int DomainId { get; set; }
        public string Reason { get; set; }
    }

    public class ITOPS_SaveProjectAssesseesRequest
    {
        public string ProjectId { get; set; }
        // The FULL desired assessee set for this project - same replace
        // semantics as ITOPS_SaveDomainProjectMappingRequest.DomainIds.
        public List<string> EmpIds { get; set; }
    }

    public class ITOPS_DomainProjectMapAuditRow
    {
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string AccountName { get; set; }
        public int DomainId { get; set; }
        public string DomainName { get; set; }
        public string Action { get; set; }
        public string Reason { get; set; }
        public string ChangedBy { get; set; }
        public string ChangedByName { get; set; }
        public DateTime? ChangedDate { get; set; }
    }

    public class ITOPS_CreateAssessmentsRequest
    {
        // Either name works - the Angular admin screen speaks in "cycle",
        // the schema calls it ASSESSMENT_MASTER_ID.
        public int? AssessmentMasterId { get; set; }
        public int? CycleId { get; set; }
        // Legacy single-project field, kept so an older caller still works. The
        // Angular admin screen now sends ProjectIds; when both are absent the
        // request is rejected.
        public string ProjectId { get; set; }
        // One bulk-create action may cover several projects at once. Domains and
        // assessees are no longer picked here - they are read straight from each
        // project's own standing configuration (ITOPS_DOMAIN_PROJECT_MAP and
        // ITOPS_PROJECT_ASSESSEE, both set up in Configure Scope), so a project
        // with no domains mapped and no assessees picked yet simply creates
        // nothing rather than being asked about it twice.
        public List<string> ProjectIds { get; set; }
        // Optional: restricts this call to exactly these (project, domain) pairs
        // instead of every domain mapped to each project in ProjectIds - the
        // Configure Assessment "Add" staging screen tickable per row, not just
        // per project, so a project with 2 mapped domains can have just one of
        // them created now and the other left for later. When null/empty, every
        // mapped domain for each requested project is created (unchanged legacy
        // behavior - e.g. the "Update assessees" quick-sync action still relies
        // on this to resync a whole project's assessments at once).
        public List<ITOPS_CreateAssessmentPair> Pairs { get; set; }
    }

    public class ITOPS_CreateAssessmentPair
    {
        public string ProjectId { get; set; }
        public int DomainId { get; set; }
    }

    public class ITOPS_CycleAssessmentRow
    {
        public int AssessmentId { get; set; }
        public int AssessmentMasterId { get; set; }
        public string CycleLabel { get; set; }
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string AccountName { get; set; }
        public int DomainId { get; set; }
        public string DomainCode { get; set; }
        public string DomainName { get; set; }
        public int AssessorCount { get; set; }
        public int ReviewerCount { get; set; }
        public int AssesseeCount { get; set; }
        public List<string> AssessorNames { get; set; }
        public List<string> ReviewerNames { get; set; }
        public List<string> AssesseeNames { get; set; }
        public string Status { get; set; }
    }

    public class ITOPS_AddTeamMemberRequest
    {
        public int AssessmentId { get; set; }
        public string EmpId { get; set; }
    }

    public class ITOPS_AddTeamMemberBulkRequest
    {
        public List<int> AssessmentIds { get; set; }
        public string EmpId { get; set; }
    }

    public class ITOPS_RemoveTeamMemberBulkRequest
    {
        public List<int> Ids { get; set; }
    }

    public class ITOPS_TeamMemberRow
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string EmpId { get; set; }
        public string EmpName { get; set; }
    }

    // ------------------------------------------------------------------
    // Step 3c - Categories & Parameters (ITOPS_CATEGORY / ITOPS_PARAMETER /
    // ITOPS_PARAMETER_LEVEL).
    //
    // VERSIONING MODEL - read this before touching anything below.
    //
    // ITOPS_CATEGORY and ITOPS_PARAMETER are EFFECTIVE-DATED, not freely
    // mutable. ITOPS_SCORE.PARAMETER_ID points at ONE specific parameter row,
    // and the reporting projection (GetITOpsAssessmentSummary and friends in
    // ITOperationMaturityController) resolves a historical score's wording by
    // reading that exact row - it does NOT date-filter. So rewriting a
    // parameter's DEFINITION or rubric text in place would retroactively change
    // what an already-approved assessment says it was scored against.
    //
    // Therefore "Save changes" on substantive content is RETIRE-AND-REPLACE:
    //   old row: END_DATE = today          (drops out of the assessment form,
    //                                       which filters END_DATE > today)
    //   new row: START_DATE = today, END_DATE = NULL, edited content
    // The old row (and its ITOPS_PARAMETER_LEVEL rows) is never touched
    // otherwise, so every score that referenced it still resolves to the exact
    // wording it was scored against.
    //
    // Versioned (retire + replace): DEFINITION, MIN_REQUIRED_SCORE, and all five
    //   ITOPS_PARAMETER_LEVEL rubric texts. MIN_REQUIRED_SCORE is versioned
    //   deliberately even though it is a number: it is the bar a Finding's GAP
    //   was raised against, so changing it in place would silently restate
    //   whether a past score met the requirement.
    // In-place (safe to mutate): NAME and DISPLAY_ORDER. DISPLAY_ORDER is pure
    //   presentation - nothing historical is derived from it. NAME is in-place
    //   because it doubles as the LINEAGE KEY (below) and because reports label
    //   a score by reading the live row's name; a rename is a label correction,
    //   not a change to what was being asked.
    //
    // LINEAGE. The schema has no PREVIOUS_VERSION_ID and adding one would mean a
    // column EF selects on EVERY category/parameter read - including the live
    // assessment form - which would hard-fail in any environment where the
    // migration had not been run. So lineage is a HEURISTIC instead:
    //   category lineage  = (DOMAIN_ID, NAME)
    //   parameter lineage = (DOMAIN_ID, category NAME, parameter NAME)
    // For that to be exact rather than approximate, NAME is IMMUTABLE ACROSS
    // VERSIONS: the Version* endpoints reject a name change, and the rename
    // endpoints apply the new name to EVERY row in the lineage at once so all
    // versions keep sharing one key.
    // ------------------------------------------------------------------

    public class ITOPS_CategoryRow
    {
        public int CategoryId { get; set; }
        public int DomainId { get; set; }
        public string Name { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        /// <summary>ISACTIVE and still in effect today - i.e. what the assessment form would show.</summary>
        public bool IsCurrent { get; set; }
        /// <summary>Parameters currently in effect under this category row.</summary>
        public int ParameterCount { get; set; }
        /// <summary>How many rows exist in this category's lineage (see the versioning note).</summary>
        public int VersionCount { get; set; }
    }

    public class ITOPS_ParameterLevelRow
    {
        public int LevelNo { get; set; }
        public string Description { get; set; }
    }

    public class ITOPS_ParameterRow
    {
        public int ParameterId { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int DomainId { get; set; }
        public string Name { get; set; }
        public string Definition { get; set; }
        public int? MinRequiredScore { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsCurrent { get; set; }
        /// <summary>Always five entries (LEVEL_NO 1-5), blank where no rubric row exists.</summary>
        public List<ITOPS_ParameterLevelRow> Levels { get; set; }
        /// <summary>Active ITOPS_SCORE rows pointing at THIS exact parameter row - what versioning protects.</summary>
        public int ScoreCount { get; set; }
        public int VersionCount { get; set; }
    }

    public class ITOPS_CreateCategoryRequest
    {
        public int DomainId { get; set; }
        public string Name { get; set; }
        public int? DisplayOrder { get; set; }
        /// <summary>Defaults to today. A future date creates a not-yet-effective row.</summary>
        public DateTime? StartDate { get; set; }
    }

    /// <summary>In-place metadata edit - NO new version. Name is applied to the whole lineage.</summary>
    public class ITOPS_UpdateCategoryMetaRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public int? DisplayOrder { get; set; }
    }

    /// <summary>
    /// Retire this category row and replace it with a fresh one effective today,
    /// re-versioning every parameter currently under it so the assessment form
    /// stays intact. Name cannot change here - it is the lineage key.
    /// </summary>
    public class ITOPS_VersionCategoryRequest
    {
        public int CategoryId { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class ITOPS_ParameterLevelInput
    {
        public int LevelNo { get; set; }
        public string Description { get; set; }
    }

    public class ITOPS_CreateParameterRequest
    {
        public int CategoryId { get; set; }
        public string Name { get; set; }
        public string Definition { get; set; }
        public int? MinRequiredScore { get; set; }
        public int? DisplayOrder { get; set; }
        public DateTime? StartDate { get; set; }
        public List<ITOPS_ParameterLevelInput> Levels { get; set; }
    }

    /// <summary>Retire + replace. Definition / min score / rubric text only - see the versioning note.</summary>
    public class ITOPS_VersionParameterRequest
    {
        public int ParameterId { get; set; }
        public string Definition { get; set; }
        public int? MinRequiredScore { get; set; }
        public List<ITOPS_ParameterLevelInput> Levels { get; set; }
    }

    /// <summary>In-place metadata edit - NO new version. Name is applied to the whole lineage.</summary>
    public class ITOPS_UpdateParameterMetaRequest
    {
        public int ParameterId { get; set; }
        public string Name { get; set; }
        public int? DisplayOrder { get; set; }
    }

    /// <summary>
    /// "Replace every assignment X holds with Y." Set Preview to only count what
    /// WOULD change without writing anything.
    /// </summary>
    public class ITOPS_BulkReassignRequest
    {
        public string FromEmpId { get; set; }
        public string ToEmpId { get; set; }
        public bool Preview { get; set; }
    }

    public class ITOPS_BulkReassignResult
    {
        public string FromEmpId { get; set; }
        public string FromEmpName { get; set; }
        public string ToEmpId { get; set; }
        public string ToEmpName { get; set; }
        public bool Preview { get; set; }
        public int AssessorRows { get; set; }
        public int ReviewerRows { get; set; }
        /// <summary>Distinct assessments touched across both roles.</summary>
        public int AssessmentCount { get; set; }
        /// <summary>
        /// Rows where the target is ALREADY on the same assessment in the same
        /// role: X's row is deactivated instead of re-pointed (the unique index
        /// on (ASSESSMENT_ID, EMP_ID) WHERE ISACTIVE = 1 forbids two live rows).
        /// </summary>
        public int MergedRows { get; set; }
        public int TotalRows { get; set; }
    }

    // What the current caller is allowed to do on the Admin Setup screen.
    // The Angular app hides the nav link / step tabs off this; the server-side
    // checks below are the real enforcement.
    public class ITOPS_MyAccessRow
    {
        public string EmpId { get; set; }
        public bool IsSuperuser { get; set; }
        // Active ITOPS_ROLE.ROLE_CODEs this emp currently holds via
        // ITOPS_ROLE_ASSIGNMENT (e.g. ["CYCLE_ADMINISTRATOR"]). Excludes
        // SUPERUSER, which is reported through IsSuperuser instead.
        public List<string> RoleCodes { get; set; }
        public bool IsAdmin { get; set; }
        // EVERY ROLE_CODE currently active in ITOPS_ROLE, regardless of who
        // holds it - the frontend needs this to hide a step whose role has
        // been deactivated system-wide even for a Superuser, whose blanket
        // access otherwise bypasses individual-grant checks entirely.
        public List<string> ActiveRoleCodes { get; set; }
    }
}
