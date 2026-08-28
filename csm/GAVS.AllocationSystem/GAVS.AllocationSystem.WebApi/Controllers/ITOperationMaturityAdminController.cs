using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;

namespace GAVS.AllocationSystem.WebApi.Controllers
{
    // ---------------------------------------------------------------------
    // IT Operations Maturity Assessment - ADMIN SETUP endpoints.
    //
    // Backs the five-step Admin Setup flow in the Angular micro-app
    // (Configure Roles -> Configure Cycle -> Configure Scope -> Configure
    // Assessment -> Assign Assessor/Reviewer). The assessment/scoring/review
    // endpoints themselves live in ITOperationMaturityController.cs; this file
    // is the same partial AllSysController, split out purely so the master-data
    // /configuration surface stays readable next to the runtime workflow.
    //
    // Conventions are identical to the sibling file: AttributeRouting
    // [GET("...")]/[POST("...")] + [ActionName("...")], repository access via
    // CSPdb/Cldb, UpdateAuditFields() for audit columns, and the
    // UpdateAuditFieldsExt quirk that ISACTIVE is unconditionally set to true -
    // so every soft-delete audits FIRST and clears ISACTIVE AFTERWARDS.
    // Responses are serialized camelCase (GlobalConfig installs
    // CamelCasePropertyNamesContractResolver), same as every other DTO here.
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
        // null PROJECT_ID = org-wide grant; otherwise the grant only applies to this project.
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Scope { get; set; }
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

    public class ITOPS_DomainProjectMappingRow
    {
        public string ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string CustId { get; set; }
        public string AccountName { get; set; }
        public List<ITOPS_MappedDomainRow> Domains { get; set; }
    }

    public class ITOPS_SaveDomainProjectMappingRequest
    {
        public string ProjectId { get; set; }
        // The FULL desired set of active domains for this project - anything
        // active but absent here is deactivated (replace semantics, not append).
        public List<int> DomainIds { get; set; }
    }

    // Additive bulk sibling of ITOPS_SaveDomainProjectMappingRequest: every
    // (project x domain) combination is added/reactivated and NOTHING already
    // mapped to those projects is removed. Use the single-project Save request
    // above when the project's domain set must end up EXACTLY as sent.
    public class ITOPS_BulkAddDomainProjectMappingRequest
    {
        public List<string> ProjectIds { get; set; }
        public List<int> DomainIds { get; set; }
    }

    public class ITOPS_RemoveDomainProjectMappingRequest
    {
        public string ProjectId { get; set; }
        public int DomainId { get; set; }
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
        // One bulk-create action may cover SEVERAL projects. Every selected
        // domain is applied to every selected project (the picker only offers
        // domains mapped to ALL of them), and the same assessee team spans them.
        public List<string> ProjectIds { get; set; }
        public List<int> DomainIds { get; set; }
        // Assessees are PROJECT-wide, not per-domain (deliberate design decision
        // from the mockup review): the same set is applied identically to every
        // domain's assessment row created/ensured by this call - and, with
        // multi-project selection, to every selected project's rows too.
        public List<string> AssesseeEmpIds { get; set; }
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
        public string Status { get; set; }
    }

    public class ITOPS_AddTeamMemberRequest
    {
        public int AssessmentId { get; set; }
        public string EmpId { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ITOPS_TeamMemberRow
    {
        public int Id { get; set; }
        public int AssessmentId { get; set; }
        public string EmpId { get; set; }
        public string EmpName { get; set; }
        public bool IsPrimary { get; set; }
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
        /// on (ASSESSMENT_ID, EMP_ID) WHERE ISACTIVE = 1 forbids two live rows),
        /// and Y inherits IS_PRIMARY if X held it.
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
    }

    public partial class AllSysController
    {
        // ------------------------------------------------------------------
        // Shared helpers for the admin surface
        // ------------------------------------------------------------------

        // Step 1 (Configure Roles) is superuser-only - it's the screen that grants
        // every other IT-Ops role, so it must not be self-grantable via the normal
        // Grant-a-role flow (that would let a Cycle Administrator grant themselves
        // Configure-Roles access). Superuser is itself just an ITOPS_ROLE
        // (ROLE_CODE = 'SUPERUSER') granted via ITOPS_ROLE_ASSIGNMENT like any other
        // IT Ops role - see ITOperationMaturity_V2_07_SuperuserRole.sql - it just
        // isn't grantable from the Configure Roles screen itself, only by inserting
        // the assignment row directly. Falls back to a hardcoded email allowlist
        // (same pattern as GdhEmailsByBusinessUnit in ITOperationMaturityController.cs)
        // only if no SUPERUSER assignment exists yet in the DB, so a fresh/pre-migration
        // environment doesn't lock everyone out.
        private static readonly HashSet<string> ITOpsSuperuserEmailsFallback = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "srividhya.b@neurealm.com",
        };

        private bool IsITOpsSuperuser(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return false;

            var hasSuperuserRole = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Join(CSPdb.ITOPS_ROLE.GetAll(), ra => ra.ROLE_ID, r => r.ID, (ra, r) => new { ra, r })
                .Any(x => x.ra.ISACTIVE && x.r.ISACTIVE && x.r.ROLE_CODE == "SUPERUSER" && x.ra.EMP_ID == empId);
            if (hasSuperuserRole) return true;

            // Fallback only kicks in while no SUPERUSER role assignment exists at all -
            // once one does, the DB is authoritative and this list is ignored entirely.
            var anySuperuserRoleAssigned = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Join(CSPdb.ITOPS_ROLE.GetAll(), ra => ra.ROLE_ID, r => r.ID, (ra, r) => new { ra, r })
                .Any(x => x.ra.ISACTIVE && x.r.ISACTIVE && x.r.ROLE_CODE == "SUPERUSER");
            if (anySuperuserRoleAssigned) return false;

            var email = GetEmpEmail(empId);
            return !string.IsNullOrWhiteSpace(email) && ITOpsSuperuserEmailsFallback.Contains(email.Trim());
        }

        // ------------------------------------------------------------------
        // Access control for the Admin Setup surface
        // ------------------------------------------------------------------
        //
        // Before this existed, only GrantITOpsRole/RevokeITOpsRole checked
        // anything at all: every GET below was open, so an assessor with no IT
        // Ops admin role could browse the whole configuration surface. The
        // model now is:
        //   - reads (GetITOps...) require ANY active IT Ops admin role (or
        //     superuser) - any admin may LOOK at any step;
        //   - writes require the specific role that conceptually owns that step
        //     (or superuser, who is allowed everywhere).

        /// <summary>Active non-SUPERUSER ITOPS_ROLE codes this emp currently holds.</summary>
        private List<string> GetITOpsRoleCodes(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return new List<string>();

            return CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Join(CSPdb.ITOPS_ROLE.GetAll(), ra => ra.ROLE_ID, r => r.ID, (ra, r) => new { ra, r })
                .Where(x => x.ra.ISACTIVE && x.r.ISACTIVE && x.ra.EMP_ID == empId)
                .Select(x => x.r.ROLE_CODE)
                .ToList()
                .Where(code => !string.IsNullOrWhiteSpace(code) && code != "SUPERUSER")
                .Distinct()
                .OrderBy(code => code)
                .ToList();
        }

        /// <summary>Superuser, or holder of at least one active IT Ops role assignment.</summary>
        private bool HasAnyITOpsAdminRole(string empId)
        {
            if (string.IsNullOrWhiteSpace(empId)) return false;
            if (IsITOpsSuperuser(empId)) return true;
            return GetITOpsRoleCodes(empId).Any();
        }

        /// <summary>Superuser, or holder of this specific active role code.</summary>
        private bool HasITOpsRole(string empId, string roleCode)
        {
            if (string.IsNullOrWhiteSpace(empId)) return false;
            if (IsITOpsSuperuser(empId)) return true;
            return GetITOpsRoleCodes(empId).Contains(roleCode);
        }

        private const string ITOPS_ADMIN_FORBIDDEN =
            "You do not have an IT Ops Maturity administrator role. Ask a superuser to grant one in Admin Setup > Configure Roles.";

        /// <summary>
        /// Gate for every Admin Setup read. Returns null when the caller may
        /// proceed, otherwise the 403 to return straight back to the client.
        /// </summary>
        private IHttpActionResult DenyIfNotITOpsAdmin()
        {
            var callerEmpId = GetHeaderDetails_String("empId");
            if (HasAnyITOpsAdminRole(callerEmpId)) return null;
            return Content(HttpStatusCode.Forbidden, ITOPS_ADMIN_FORBIDDEN);
        }

        /// <summary>Gate for a mutation owned by one specific role (superuser always allowed).</summary>
        private IHttpActionResult DenyIfNotITOpsRole(string roleCode, string what)
        {
            var callerEmpId = GetHeaderDetails_String("empId");
            if (HasITOpsRole(callerEmpId, roleCode)) return null;
            return Content(HttpStatusCode.Forbidden, "You do not have permission to " + what + ".");
        }

        // What the signed-in user may do - the Angular app calls this once on
        // load to decide whether to show the Admin Setup nav link at all and
        // which of the five steps to offer. empId is optional: the header
        // (set by every request this micro-app makes) is authoritative, the
        // query arg is only a convenience for manual/testing calls.
        [GET("GetITOpsMyRoleCodes")]
        [ActionName("GetITOpsMyRoleCodes")]
        [HttpGet]
        public IHttpActionResult GetITOpsMyRoleCodes(string empId = null)
        {
            var callerEmpId = GetHeaderDetails_String("empId");
            if (string.IsNullOrWhiteSpace(callerEmpId)) callerEmpId = empId;

            var isSuperuser = IsITOpsSuperuser(callerEmpId);
            var roleCodes = GetITOpsRoleCodes(callerEmpId);

            return Ok(new ITOPS_MyAccessRow
            {
                EmpId = callerEmpId,
                IsSuperuser = isSuperuser,
                RoleCodes = roleCodes,
                IsAdmin = isSuperuser || roleCodes.Any()
            });
        }

        private Dictionary<string, string> GetITOpsEmpNameMap(List<string> empIds)
        {
            var ids = (empIds ?? new List<string>()).Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
            if (!ids.Any()) return new Dictionary<string, string>();

            // EMP_INFO can carry more than one row per EMP_ID (rehire history) -
            // prefer the currently-active row (DOR IS NULL) inside each group,
            // same defence GetEmpName/GetITOpsDomainTracker use.
            return Cldb.EMP_INFO.GetAll()
                .Where(e => ids.Contains(e.EMP_ID))
                .ToList()
                .GroupBy(e => e.EMP_ID)
                .ToDictionary(g => g.Key, g => (g.FirstOrDefault(e => e.DOR == null) ?? g.First()).FRST_NM);
        }

        private Dictionary<string, string> GetITOpsProjectNameMap(List<string> projectIds)
        {
            var ids = (projectIds ?? new List<string>()).Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();
            if (!ids.Any()) return new Dictionary<string, string>();

            return Cldb.PROJECT.GetAll()
                .Where(p => ids.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.PROJ_NM })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First().PROJ_NM);
        }

        // Walks the InnerException chain looking for a SQL Server unique-key
        // violation (2601 = unique index, 2627 = unique/PK constraint). EF
        // wraps these in a DbUpdateException, so the raw SqlException is never
        // the outermost type - without unwrapping, a duplicate cycle label
        // would surface to the UI as a 500 instead of a clean 400/409.
        private static bool IsUniqueViolation(Exception ex)
        {
            for (var e = ex; e != null; e = e.InnerException)
            {
                var sqlEx = e as System.Data.SqlClient.SqlException;
                if (sqlEx != null && (sqlEx.Number == 2601 || sqlEx.Number == 2627)) return true;
            }
            return false;
        }

        // ==================================================================
        // Shared employee roster for every people-picker on this admin surface
        // ==================================================================

        // The Angular admin screens used the legacy shared /EmpInfo route for
        // this (four GET overloads on AllSysController share that same route
        // template, all with optional/nullable parameters - which overload
        // Web API's action selector actually resolves to for a zero-query-param
        // call is not something this file controls or can guarantee, and one of
        // the other three overloads pulls from a completely different source
        // with no DOR filter at all). Rather than depend on that ambiguity, IT
        // Ops gets its own unambiguous roster endpoint: every employee's
        // currently-active row (DOR IS NULL - an EMP_ID can have more than one
        // historical row from rehires), same convention already used
        // everywhere else in this codebase (GetEmpName/GetEmpEmail etc.).
        [GET("GetITOpsEmployeeRoster")]
        [ActionName("GetITOpsEmployeeRoster")]
        [HttpGet]
        public IHttpActionResult GetITOpsEmployeeRoster()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var rows = Cldb.EMP_INFO.GetAll()
                .Where(e => e.DOR == null)
                .OrderBy(e => e.FRST_NM)
                .Select(e => new ITOPS_EmployeeRosterRow
                {
                    EmpId = e.EMP_ID,
                    Name = e.FRST_NM,
                    Title = e.EMP_CSP_ROLE
                })
                .ToList();

            return Ok(rows);
        }

        // Step 4's Assessee picker: candidates actually staffed on the
        // project(s) being assessed, not the entire org roster. Queries
        // PROJECT_RESOURCE directly (END_DATE >= today = currently active
        // allocation, same convention AllSysController already uses e.g.
        // around line 2433/2545) rather than the legacy getauditeesdetails SP
        // wrapper (Cldb.AppRepo.GetAuditeeDetails) - that SP's result columns
        // don't include EMP_INFO.LEVEL, so EF6's SqlQuery<EMP_INFO> throws
        // EntityCommandExecutionException on every call ("data reader is
        // incompatible ... LEVEL does not have a corresponding column").
        // Not worth patching the SP or the EF materialization for one caller;
        // a plain LINQ join sidesteps it entirely. Step 4 can select several
        // projects at once, so this takes a comma-separated project id list
        // and unions staffing across all of them, deduped, DOR-filtered same
        // as every other roster endpoint here.
        [GET("GetITOpsAssesseeCandidates")]
        [ActionName("GetITOpsAssesseeCandidates")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssesseeCandidates(string projectIds)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var ids = (projectIds ?? string.Empty)
                .Split(',')
                .Select(id => id.Trim())
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();
            if (!ids.Any()) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var staffedEmpIds = Cldb.PROJECT_RESOURCE.GetAll()
                .Where(pr => ids.Contains(pr.PROJ_ID) && pr.END_DATE >= DateTime.Now)
                .Select(pr => pr.EMP_ID)
                .Distinct()
                .ToList();
            if (!staffedEmpIds.Any()) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var rows = Cldb.EMP_INFO.GetAll()
                .Where(e => staffedEmpIds.Contains(e.EMP_ID) && e.DOR == null)
                .OrderBy(e => e.FRST_NM)
                .Select(e => new ITOPS_EmployeeRosterRow { EmpId = e.EMP_ID, Name = e.FRST_NM, Title = e.EMP_CSP_ROLE })
                .ToList();

            return Ok(rows);
        }

        // ==================================================================
        // STEP 1 - Configure Roles (ITOPS_ROLE / ITOPS_ROLE_ASSIGNMENT)
        // ==================================================================

        // The role dropdown on the "Assign a role" modal.
        [GET("GetITOpsRoles")]
        [ActionName("GetITOpsRoles")]
        [HttpGet]
        public IHttpActionResult GetITOpsRoles()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var rows = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => r.ISACTIVE)
                .OrderBy(r => r.ROLE_NAME)
                .Select(r => new ITOPS_RoleRow
                {
                    RoleId = r.ID,
                    RoleCode = r.ROLE_CODE,
                    RoleName = r.ROLE_NAME,
                    Description = r.DESCRIPTION
                })
                .ToList();

            return Ok(rows);
        }

        // Every live grant, resolved to employee name / role name / scope project name.
        [GET("GetITOpsRoleAssignments")]
        [ActionName("GetITOpsRoleAssignments")]
        [HttpGet]
        public IHttpActionResult GetITOpsRoleAssignments()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var assignments = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Where(a => a.ISACTIVE)
                .OrderByDescending(a => a.ID)
                .ToList();
            if (!assignments.Any()) return Ok(new List<ITOPS_RoleAssignmentRow>());

            var roleIds = assignments.Select(a => a.ROLE_ID).Distinct().ToList();
            var roles = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => roleIds.Contains(r.ID))
                .ToList()
                .GroupBy(r => r.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var empNames = GetITOpsEmpNameMap(assignments.Select(a => a.EMP_ID).ToList());
            var projectNames = GetITOpsProjectNameMap(assignments.Select(a => a.PROJECT_ID).ToList());

            var rows = assignments.Select(a =>
            {
                ITOPS_ROLE role;
                roles.TryGetValue(a.ROLE_ID, out role);
                var projectName = !string.IsNullOrWhiteSpace(a.PROJECT_ID) && projectNames.ContainsKey(a.PROJECT_ID)
                    ? projectNames[a.PROJECT_ID]
                    : null;

                return new ITOPS_RoleAssignmentRow
                {
                    Id = a.ID,
                    EmpId = a.EMP_ID,
                    EmpName = empNames.ContainsKey(a.EMP_ID ?? string.Empty) ? empNames[a.EMP_ID] : a.EMP_ID,
                    RoleId = a.ROLE_ID,
                    RoleCode = role != null ? role.ROLE_CODE : null,
                    RoleName = role != null ? role.ROLE_NAME : null,
                    ProjectId = a.PROJECT_ID,
                    ProjectName = projectName,
                    Scope = string.IsNullOrWhiteSpace(a.PROJECT_ID)
                        ? "Org-wide"
                        : (projectName ?? a.PROJECT_ID) + " only",
                    GrantedOn = a.CREATED_DATE
                };
            }).ToList();

            return Ok(rows);
        }

        // Audit trail for Step 1: EVERY ITOPS_ROLE_ASSIGNMENT row, active and
        // inactive. Revoking is a soft-delete that keeps the row, so one row is
        // both a "granted" event (CREATED_BY / CREATED_DATE) and, when inactive,
        // an implicit "revoked" event (UPDATED_BY / UPDATED_DATE, since the
        // revoke is the last thing that touched it). Both stamps ride on the
        // same row and the frontend renders it as one timeline entry labelled
        // off IsActive. Optional empId narrows it to one person. Same read gate
        // as GetITOpsRoleAssignments.
        [GET("GetITOpsRoleAssignmentHistory")]
        [ActionName("GetITOpsRoleAssignmentHistory")]
        [HttpGet]
        public IHttpActionResult GetITOpsRoleAssignmentHistory(string empId = null)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var filterEmpId = string.IsNullOrWhiteSpace(empId) ? null : empId.Trim();

            var assignments = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Where(a => filterEmpId == null || a.EMP_ID == filterEmpId)
                .ToList();
            if (!assignments.Any()) return Ok(new List<ITOPS_RoleAssignmentHistoryRow>());

            var roleIds = assignments.Select(a => a.ROLE_ID).Distinct().ToList();
            var roles = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => roleIds.Contains(r.ID))
                .ToList()
                .GroupBy(r => r.ID)
                .ToDictionary(g => g.Key, g => g.First());

            // Actors (CREATED_BY / UPDATED_BY) are emp ids too, so they resolve
            // through the same name map as the grant subjects.
            var peopleIds = assignments.Select(a => a.EMP_ID)
                .Concat(assignments.Select(a => a.CREATED_BY))
                .Concat(assignments.Select(a => a.UPDATED_BY))
                .ToList();
            var empNames = GetITOpsEmpNameMap(peopleIds);
            var projectNames = GetITOpsProjectNameMap(assignments.Select(a => a.PROJECT_ID).ToList());

            Func<string, string> nameOf = id =>
                !string.IsNullOrWhiteSpace(id) && empNames.ContainsKey(id) ? empNames[id] : id;

            var rows = assignments.Select(a =>
            {
                ITOPS_ROLE role;
                roles.TryGetValue(a.ROLE_ID, out role);
                var projectName = !string.IsNullOrWhiteSpace(a.PROJECT_ID) && projectNames.ContainsKey(a.PROJECT_ID)
                    ? projectNames[a.PROJECT_ID]
                    : null;

                return new ITOPS_RoleAssignmentHistoryRow
                {
                    Id = a.ID,
                    EmpId = a.EMP_ID,
                    EmpName = nameOf(a.EMP_ID),
                    RoleId = a.ROLE_ID,
                    RoleCode = role != null ? role.ROLE_CODE : null,
                    RoleName = role != null ? role.ROLE_NAME : null,
                    ProjectId = a.PROJECT_ID,
                    ProjectName = projectName,
                    Scope = string.IsNullOrWhiteSpace(a.PROJECT_ID)
                        ? "Org-wide"
                        : (projectName ?? a.PROJECT_ID) + " only",
                    IsActive = a.ISACTIVE,
                    CreatedBy = a.CREATED_BY,
                    CreatedByName = nameOf(a.CREATED_BY),
                    CreatedDate = a.CREATED_DATE,
                    UpdatedBy = a.UPDATED_BY,
                    UpdatedByName = nameOf(a.UPDATED_BY),
                    UpdatedDate = a.UPDATED_DATE,
                    LastActivityDate = a.UPDATED_DATE > a.CREATED_DATE ? a.UPDATED_DATE : a.CREATED_DATE
                };
            })
            .OrderByDescending(r => r.LastActivityDate)
            .ThenByDescending(r => r.Id)
            .ToList();

            return Ok(rows);
        }

        [POST("GrantITOpsRole")]
        [ActionName("GrantITOpsRole")]
        [HttpPost]
        public IHttpActionResult GrantITOpsRole([FromBody] ITOPS_GrantRoleRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.EmpId) || request.RoleId <= 0)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can grant IT Ops roles.");

            var role = CSPdb.ITOPS_ROLE.GetAll().FirstOrDefault(r => r.ID == request.RoleId && r.ISACTIVE);
            if (role == null) return NotFound();

            var targetEmpId = request.EmpId.Trim();
            var projectId = string.IsNullOrWhiteSpace(request.ProjectId) ? null : request.ProjectId.Trim();

            // Re-granting an identical (emp, role, scope) grant reactivates the existing
            // row rather than stacking duplicates - UpdateAuditFields sets ISACTIVE = true.
            var existing = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .FirstOrDefault(a => a.EMP_ID == targetEmpId && a.ROLE_ID == request.RoleId && a.PROJECT_ID == projectId);

            if (existing != null)
            {
                UpdateAuditFields(existing, callerEmpId);
                CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(existing);
            }
            else
            {
                existing = new ITOPS_ROLE_ASSIGNMENT
                {
                    ROLE_ID = request.RoleId,
                    EMP_ID = targetEmpId,
                    PROJECT_ID = projectId
                };
                UpdateAuditFields(existing, callerEmpId);
                CSPdb.ITOPS_ROLE_ASSIGNMENT.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            return Ok(existing);
        }

        // Bulk grant: one or more employees, one or more roles, and either
        // org-wide or one or more projects. Creates/reactivates exactly one
        // ITOPS_ROLE_ASSIGNMENT row per (employee x role x project) combination
        // - 2 employees x 2 roles x 3 projects = 12 rows - in a
        // single commit, using the same "reactivate if an identical row exists,
        // else insert" behaviour as the single-grant GrantITOpsRole above (which
        // stays in place as the per-row building block). The Angular screen
        // re-reads GetITOpsRoleAssignments afterwards, so this only reports how
        // many rows were touched rather than reprojecting them.
        [POST("GrantITOpsRoles")]
        [ActionName("GrantITOpsRoles")]
        [HttpPost]
        public IHttpActionResult GrantITOpsRoles([FromBody] ITOPS_GrantRolesRequest request)
        {
            if (request == null || request.EmpIds == null ||
                !request.EmpIds.Any(e => !string.IsNullOrWhiteSpace(e)) ||
                request.RoleIds == null || !request.RoleIds.Any(id => id > 0))
                return Content(HttpStatusCode.Conflict, "Pick at least one employee and at least one role.");

            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can grant IT Ops roles.");

            var roleIds = request.RoleIds.Where(id => id > 0).Distinct().ToList();
            var requestedRoles = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => r.ISACTIVE && roleIds.Contains(r.ID))
                .ToList();
            var missing = roleIds.Where(id => !requestedRoles.Any(r => r.ID == id)).ToList();
            if (missing.Any())
                return Content(HttpStatusCode.Conflict, "One or more of the selected roles no longer exists.");
            var activeRoleIds = requestedRoles.Select(r => r.ID).ToList();

            var targetEmpIds = request.EmpIds
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .Select(e => e.Trim())
                .Distinct()
                .ToList();

            // No projects picked = a single org-wide grant (PROJECT_ID = NULL) per role.
            var projectIds = (request.ProjectIds ?? new List<string>())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Distinct()
                .ToList();
            var scopes = projectIds.Any() ? projectIds : new List<string> { null };

            var existingRows = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Where(a => targetEmpIds.Contains(a.EMP_ID))
                .ToList();

            var granted = 0;
            foreach (var targetEmpId in targetEmpIds)
            {
                foreach (var roleId in activeRoleIds)
                {
                    foreach (var projectId in scopes)
                    {
                        var existing = existingRows
                            .FirstOrDefault(a => a.EMP_ID == targetEmpId && a.ROLE_ID == roleId && a.PROJECT_ID == projectId);

                        if (existing != null)
                        {
                            // UpdateAuditFields sets ISACTIVE = true, so this also
                            // reactivates a previously revoked identical grant.
                            UpdateAuditFields(existing, callerEmpId);
                            CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(existing);
                        }
                        else
                        {
                            var row = new ITOPS_ROLE_ASSIGNMENT
                            {
                                ROLE_ID = roleId,
                                EMP_ID = targetEmpId,
                                PROJECT_ID = projectId
                            };
                            UpdateAuditFields(row, callerEmpId);
                            CSPdb.ITOPS_ROLE_ASSIGNMENT.Add(row);
                            existingRows.Add(row);
                        }
                        granted++;
                    }
                }
            }

            CSPdb.Commit(CanCommit);

            return Ok(new { EmpIds = targetEmpIds, Granted = granted });
        }

        // Edit one existing grant in place: change its role and/or its scope.
        // The row keeps its ID, so CREATED_DATE (the "Granted" column) is
        // preserved - this is an edit, not a re-grant. Superuser-only, same as
        // Grant/Revoke.
        [POST("UpdateITOpsRoleAssignment")]
        [ActionName("UpdateITOpsRoleAssignment")]
        [HttpPost]
        public IHttpActionResult UpdateITOpsRoleAssignment([FromBody] ITOPS_UpdateRoleAssignmentRequest request)
        {
            if (request == null || request.Id <= 0 || request.RoleId <= 0)
                return Content(HttpStatusCode.Conflict, "Pick a role for this grant.");

            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can change IT Ops role assignments.");

            var assignment = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll().FirstOrDefault(a => a.ID == request.Id);
            if (assignment == null) return NotFound();

            var role = CSPdb.ITOPS_ROLE.GetAll().FirstOrDefault(r => r.ID == request.RoleId && r.ISACTIVE);
            if (role == null) return NotFound();

            var projectId = string.IsNullOrWhiteSpace(request.ProjectId) ? null : request.ProjectId.Trim();

            // Check-first 409, same shape as CreateITOpsAssessmentCycle's duplicate
            // label handling: a different active row already covering this exact
            // (emp, role, scope) would otherwise collide.
            var collision = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Any(a => a.ID != assignment.ID && a.ISACTIVE && a.EMP_ID == assignment.EMP_ID
                          && a.ROLE_ID == request.RoleId && a.PROJECT_ID == projectId);
            if (collision)
                return Content(HttpStatusCode.Conflict,
                    "This employee already holds that role at that scope. Edit or revoke the existing grant instead.");

            assignment.ROLE_ID = request.RoleId;
            assignment.PROJECT_ID = projectId;
            UpdateAuditFields(assignment, callerEmpId);
            CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(assignment);

            try
            {
                CSPdb.Commit(CanCommit);
            }
            catch (Exception ex)
            {
                if (IsUniqueViolation(ex))
                    return Content(HttpStatusCode.Conflict,
                        "This employee already holds that role at that scope. Edit or revoke the existing grant instead.");
                LogRequest(ex, "ITOpsMaturity:UpdateRoleAssignment");
                throw;
            }

            return Ok(assignment);
        }

        [POST("RevokeITOpsRole")]
        [ActionName("RevokeITOpsRole")]
        [HttpPost]
        public IHttpActionResult RevokeITOpsRole(int id)
        {
            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can revoke IT Ops roles.");

            var assignment = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll().FirstOrDefault(a => a.ID == id);
            if (assignment == null) return NotFound();

            // UpdateAuditFieldsExt unconditionally sets ISACTIVE = true, so it must
            // run BEFORE the revocation or it silently stomps it back to active.
            UpdateAuditFields(assignment, callerEmpId);
            assignment.ISACTIVE = false;
            CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(assignment);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // ==================================================================
        // STEP 2 - Configure Cycle (ITOPS_ASSESSMENT_MASTER)
        // ==================================================================

        [GET("GetITOpsAssessmentCycles")]
        [ActionName("GetITOpsAssessmentCycles")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssessmentCycles()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var cycles = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll()
                .Where(m => m.ISACTIVE)
                .OrderByDescending(m => m.START_DATE)
                .ThenByDescending(m => m.ID)
                .ToList();
            if (!cycles.Any()) return Ok(new List<ITOPS_AssessmentCycleRow>());

            var cycleIds = cycles.Select(c => c.ID).ToList();
            // One pass over the cycle's assessments feeds BOTH the total and the
            // per-status breakdown, so the Step 2 list can show completion inline
            // instead of sending the admin to Reports for it.
            var assessmentsInCycles = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && cycleIds.Contains(a.ASSESSMENT_MASTER_ID))
                .Select(a => new { a.ASSESSMENT_MASTER_ID, a.STATUS })
                .ToList();

            var byCycle = assessmentsInCycles
                .GroupBy(a => a.ASSESSMENT_MASTER_ID)
                .ToDictionary(g => g.Key, g => g.ToList());

            var rows = cycles.Select(c =>
            {
                var mine = byCycle.ContainsKey(c.ID) ? byCycle[c.ID] : null;
                var total = mine == null ? 0 : mine.Count;
                var statusCounts = mine == null
                    ? new List<ITOPS_CycleStatusCountRow>()
                    : mine.GroupBy(a => string.IsNullOrWhiteSpace(a.STATUS) ? "NotStarted" : a.STATUS)
                          .Select(g => new ITOPS_CycleStatusCountRow { Status = g.Key, Count = g.Count() })
                          .OrderByDescending(g => g.Count)
                          .ThenBy(g => g.Status)
                          .ToList();
                var completed = statusCounts
                    .Where(s => s.Status == "Approved" || s.Status == "Closed")
                    .Sum(s => s.Count);

                return new ITOPS_AssessmentCycleRow
                {
                    Id = c.ID,
                    CycleLabel = c.CYCLE_LABEL,
                    StartDate = c.START_DATE,
                    EndDate = c.END_DATE,
                    Status = c.STATUS,
                    Description = c.DESCRIPTION,
                    AssessmentCount = total,
                    StatusCounts = statusCounts,
                    CompletedCount = completed,
                    CompletionPercent = total > 0 ? (int)Math.Round(completed * 100.0 / total) : 0
                };
            }).ToList();

            return Ok(rows);
        }

        [POST("CreateITOpsAssessmentCycle")]
        [ActionName("CreateITOpsAssessmentCycle")]
        [HttpPost]
        public IHttpActionResult CreateITOpsAssessmentCycle([FromBody] ITOPS_CreateCycleRequest request)
        {
            var denied = DenyIfNotITOpsRole("CYCLE_ADMINISTRATOR", "create assessment cycles");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.CycleLabel))
                return Content(HttpStatusCode.Conflict, "A cycle label is required.");
            if (!request.StartDate.HasValue || !request.EndDate.HasValue)
                return Content(HttpStatusCode.Conflict, "Both a start date and an end date are required.");
            if (request.EndDate.Value <= request.StartDate.Value)
                return Content(HttpStatusCode.Conflict, "The end date must be later than the start date.");

            var label = request.CycleLabel.Trim();

            // The DB carries the real uniqueness guarantee (unique index on
            // CYCLE_LABEL); this pre-check just turns the common case into a
            // clean message instead of relying on the exception path below.
            var duplicate = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().Any(m => m.CYCLE_LABEL == label);
            if (duplicate)
                return Content(HttpStatusCode.Conflict, "A cycle with this label already exists. Pick a different label.");

            var empId = GetHeaderDetails_String("empId");
            var master = new ITOPS_ASSESSMENT_MASTER
            {
                CYCLE_LABEL = label,
                START_DATE = request.StartDate.Value.Date,
                END_DATE = request.EndDate.Value.Date,
                STATUS = "Open",
                DESCRIPTION = request.Description
            };
            UpdateAuditFields(master, empId);
            CSPdb.ITOPS_ASSESSMENT_MASTER.Add(master);

            try
            {
                CSPdb.Commit(CanCommit);
            }
            catch (Exception ex)
            {
                // Race with a concurrent create: the unique index is the backstop.
                // Surface it as a clean 409 rather than letting it bubble out as a 500.
                if (IsUniqueViolation(ex))
                    return Content(HttpStatusCode.Conflict, "A cycle with this label already exists. Pick a different label.");
                LogRequest(ex, "ITOpsMaturity:CreateAssessmentCycle");
                throw;
            }

            return Ok(new ITOPS_AssessmentCycleRow
            {
                Id = master.ID,
                CycleLabel = master.CYCLE_LABEL,
                StartDate = master.START_DATE,
                EndDate = master.END_DATE,
                Status = master.STATUS,
                Description = master.DESCRIPTION,
                AssessmentCount = 0,
                StatusCounts = new List<ITOPS_CycleStatusCountRow>(),
                CompletedCount = 0,
                CompletionPercent = 0
            });
        }

        // ==================================================================
        // STEP 3a - Configure Scope: Domains
        // ==================================================================

        // Richer than GetITOpsDomainList (which the landing page uses and which
        // stays untouched): the setup table also needs the default owners' names
        // and the category count per domain.
        [GET("GetITOpsDomainsForAdmin")]
        [ActionName("GetITOpsDomainsForAdmin")]
        [HttpGet]
        public IHttpActionResult GetITOpsDomainsForAdmin()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => d.ISACTIVE)
                .OrderBy(d => d.DISPLAY_ORDER)
                .ToList();
            if (!domains.Any()) return Ok(new List<ITOPS_DomainAdminRow>());

            var today = DateTime.Today;
            var categoryCounts = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.ISACTIVE && (c.END_DATE == null || c.END_DATE > today))
                .Select(c => c.DOMAIN_ID)
                .ToList()
                .GroupBy(id => id)
                .ToDictionary(g => g.Key, g => g.Count());

            var empNames = GetITOpsEmpNameMap(
                domains.Select(d => d.DEFAULT_ASSESSOR_ID)
                    .Concat(domains.Select(d => d.DEFAULT_REVIEWER_ID))
                    .ToList());

            Func<string, string> nameOf = id =>
                !string.IsNullOrWhiteSpace(id) && empNames.ContainsKey(id) ? empNames[id] : id;

            var rows = domains.Select(d => new ITOPS_DomainAdminRow
            {
                DomainId = d.ID,
                Code = d.CODE,
                Name = d.NAME,
                Description = d.DESCRIPTION,
                MinRequiredScore = d.MIN_REQUIRED_SCORE,
                DisplayOrder = d.DISPLAY_ORDER,
                DefaultAssessorId = d.DEFAULT_ASSESSOR_ID,
                DefaultAssessorName = nameOf(d.DEFAULT_ASSESSOR_ID),
                DefaultReviewerId = d.DEFAULT_REVIEWER_ID,
                DefaultReviewerName = nameOf(d.DEFAULT_REVIEWER_ID),
                CategoryCount = categoryCounts.ContainsKey(d.ID) ? categoryCounts[d.ID] : 0
            }).ToList();

            return Ok(rows);
        }

        [POST("CreateITOpsDomain")]
        [ActionName("CreateITOpsDomain")]
        [HttpPost]
        public IHttpActionResult CreateITOpsDomain([FromBody] ITOPS_CreateDomainRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_ADMINISTRATOR", "create domains");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.Name))
                return Content(HttpStatusCode.Conflict, "A domain name is required.");

            var name = request.Name.Trim();

            // CODE is the stable slug the Angular route uses (/assessment/:domainCode),
            // so derive one from the name when the caller doesn't supply it.
            var code = string.IsNullOrWhiteSpace(request.Code)
                ? new string(name.ToLowerInvariant().Select(ch => char.IsLetterOrDigit(ch) ? ch : '-').ToArray()).Trim('-')
                : request.Code.Trim();
            if (code.Length > 50) code = code.Substring(0, 50);

            if (CSPdb.ITOPS_DOMAIN.GetAll().Any(d => d.ISACTIVE && (d.CODE == code || d.NAME == name)))
                return Content(HttpStatusCode.Conflict, "A domain with this name or code already exists.");

            var empId = GetHeaderDetails_String("empId");
            var maxOrder = CSPdb.ITOPS_DOMAIN.GetAll().Select(d => (int?)d.DISPLAY_ORDER).Max() ?? 0;

            var domain = new ITOPS_DOMAIN
            {
                CODE = code,
                NAME = name,
                DESCRIPTION = request.Description,
                MIN_REQUIRED_SCORE = request.MinRequiredScore,
                DISPLAY_ORDER = maxOrder + 1,
                DEFAULT_ASSESSOR_ID = string.IsNullOrWhiteSpace(request.DefaultAssessorId) ? null : request.DefaultAssessorId.Trim(),
                DEFAULT_REVIEWER_ID = string.IsNullOrWhiteSpace(request.DefaultReviewerId) ? null : request.DefaultReviewerId.Trim()
            };
            UpdateAuditFields(domain, empId);
            CSPdb.ITOPS_DOMAIN.Add(domain);
            CSPdb.Commit(CanCommit);

            return Ok(new ITOPS_DomainAdminRow
            {
                DomainId = domain.ID,
                Code = domain.CODE,
                Name = domain.NAME,
                Description = domain.DESCRIPTION,
                MinRequiredScore = domain.MIN_REQUIRED_SCORE,
                DisplayOrder = domain.DISPLAY_ORDER,
                DefaultAssessorId = domain.DEFAULT_ASSESSOR_ID,
                DefaultAssessorName = GetEmpName(domain.DEFAULT_ASSESSOR_ID),
                DefaultReviewerId = domain.DEFAULT_REVIEWER_ID,
                DefaultReviewerName = GetEmpName(domain.DEFAULT_REVIEWER_ID),
                CategoryCount = 0
            });
        }

        // Rename an existing domain. Only NAME is editable: CODE is the slug the
        // Angular route and the assessment rows key off, and default
        // assessor/reviewer are deliberately not exposed by the admin screen
        // (they're assigned per assessment in step 5).
        [POST("UpdateITOpsDomain")]
        [ActionName("UpdateITOpsDomain")]
        [HttpPost]
        public IHttpActionResult UpdateITOpsDomain([FromBody] ITOPS_UpdateDomainRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_ADMINISTRATOR", "rename domains");
            if (denied != null) return denied;

            if (request == null || request.DomainId <= 0)
                return Content(HttpStatusCode.Conflict, "A domain is required.");
            if (string.IsNullOrWhiteSpace(request.Name))
                return Content(HttpStatusCode.Conflict, "A domain name is required.");

            var name = request.Name.Trim();

            var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == request.DomainId && d.ISACTIVE);
            if (domain == null) return NotFound();

            if (CSPdb.ITOPS_DOMAIN.GetAll().Any(d => d.ISACTIVE && d.ID != domain.ID && d.NAME == name))
                return Content(HttpStatusCode.Conflict, "Another domain already uses this name.");

            var empId = GetHeaderDetails_String("empId");
            domain.NAME = name;
            UpdateAuditFields(domain, empId);
            CSPdb.ITOPS_DOMAIN.Update(domain);
            CSPdb.Commit(CanCommit);

            var today = DateTime.Today;
            var categoryCount = CSPdb.ITOPS_CATEGORY.GetAll()
                .Count(c => c.ISACTIVE && c.DOMAIN_ID == domain.ID && (c.END_DATE == null || c.END_DATE > today));

            return Ok(new ITOPS_DomainAdminRow
            {
                DomainId = domain.ID,
                Code = domain.CODE,
                Name = domain.NAME,
                Description = domain.DESCRIPTION,
                MinRequiredScore = domain.MIN_REQUIRED_SCORE,
                DisplayOrder = domain.DISPLAY_ORDER,
                DefaultAssessorId = domain.DEFAULT_ASSESSOR_ID,
                DefaultAssessorName = GetEmpName(domain.DEFAULT_ASSESSOR_ID),
                DefaultReviewerId = domain.DEFAULT_REVIEWER_ID,
                DefaultReviewerName = GetEmpName(domain.DEFAULT_REVIEWER_ID),
                CategoryCount = categoryCount
            });
        }

        // ==================================================================
        // STEP 3b - Configure Scope: Domain-Project mapping
        // ==================================================================

        // Project picker for the mapping/assessment screens. Nothing existing
        // returns "every project with its account name" in one call (the shared
        // ones are all staffing- or customer-scoped), and this module's
        // assessor/reviewer assignments are deliberately independent of the
        // caller's own staffing - same rationale as GetITOpsAllAccounts.
        [GET("GetITOpsProjects")]
        [ActionName("GetITOpsProjects")]
        [HttpGet]
        public IHttpActionResult GetITOpsProjects(string custId = null)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var projects = Cldb.PROJECT.GetAll().AsQueryable();
            if (!string.IsNullOrWhiteSpace(custId))
                projects = projects.Where(p => p.CUST_ID == custId);

            var list = projects
                .Select(p => new { p.PROJ_ID, p.PROJ_NM, p.CUST_ID, p.BUSINESS_UNIT, p.PROJ_STATUS })
                .ToList()
                .Where(p => p.PROJ_STATUS == null || p.PROJ_STATUS.ToLower() != "closed")
                .ToList();

            var custIds = list.Select(p => p.CUST_ID).Where(c => c != null).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var rows = list.Select(p => new ITOPS_ProjectRow
            {
                ProjectId = p.PROJ_ID,
                ProjectName = p.PROJ_NM,
                CustId = p.CUST_ID,
                AccountName = p.CUST_ID != null && accountNames.ContainsKey(p.CUST_ID) ? accountNames[p.CUST_ID] : null,
                BusinessUnit = p.BUSINESS_UNIT
            })
            .OrderBy(p => p.AccountName)
            .ThenBy(p => p.ProjectName)
            .ToList();

            return Ok(rows);
        }

        // Grouped by project, with the account name resolved via PROJECT.CUST_ID -> CUSTOMER.
        [GET("GetITOpsDomainProjectMappings")]
        [ActionName("GetITOpsDomainProjectMappings")]
        [HttpGet]
        public IHttpActionResult GetITOpsDomainProjectMappings(string projectId = null)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var mappingQuery = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll().Where(m => m.ISACTIVE);
            if (!string.IsNullOrWhiteSpace(projectId))
                mappingQuery = mappingQuery.Where(m => m.PROJECT_ID == projectId);

            var mappings = mappingQuery.ToList();
            if (!mappings.Any()) return Ok(new List<ITOPS_DomainProjectMappingRow>());

            var domainIds = mappings.Select(m => m.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => domainIds.Contains(d.ID))
                .ToList()
                .GroupBy(d => d.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var projectIds = mappings.Select(m => m.PROJECT_ID).Distinct().ToList();
            var projects = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.PROJ_NM, p.CUST_ID })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First());

            var custIds = projects.Values.Select(p => p.CUST_ID).Where(c => c != null).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var rows = mappings
                .GroupBy(m => m.PROJECT_ID)
                .Select(g =>
                {
                    var project = projects.ContainsKey(g.Key) ? projects[g.Key] : null;
                    var custId = project != null ? project.CUST_ID : null;

                    return new ITOPS_DomainProjectMappingRow
                    {
                        ProjectId = g.Key,
                        ProjectName = project != null ? project.PROJ_NM : null,
                        CustId = custId,
                        AccountName = custId != null && accountNames.ContainsKey(custId) ? accountNames[custId] : null,
                        Domains = g
                            .Where(m => domains.ContainsKey(m.DOMAIN_ID))
                            .Select(m => new ITOPS_MappedDomainRow
                            {
                                MappingId = m.ID,
                                DomainId = m.DOMAIN_ID,
                                DomainCode = domains[m.DOMAIN_ID].CODE,
                                DomainName = domains[m.DOMAIN_ID].NAME
                            })
                            .OrderBy(d => d.DomainName)
                            .ToList()
                    };
                })
                .OrderBy(r => r.AccountName)
                .ThenBy(r => r.ProjectName)
                .ToList();

            return Ok(rows);
        }

        // Replace semantics: DomainIds is the complete desired set for the
        // project. Anything active and absent is deactivated, anything present
        // is added or reactivated - one call, diffed server-side, so the screen
        // never has to issue N adds + M removes.
        [POST("SaveITOpsDomainProjectMapping")]
        [ActionName("SaveITOpsDomainProjectMapping")]
        [HttpPost]
        public IHttpActionResult SaveITOpsDomainProjectMapping([FromBody] ITOPS_SaveDomainProjectMappingRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_PROJECT_MAPPER", "change domain-project mappings");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.ProjectId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var projectId = request.ProjectId.Trim();
            var wanted = (request.DomainIds ?? new List<int>()).Distinct().ToList();
            var empId = GetHeaderDetails_String("empId");

            var existingRows = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.PROJECT_ID == projectId)
                .ToList();

            // Deactivate what's no longer wanted. UpdateAuditFieldsExt always sets
            // ISACTIVE = true, so audit first and clear ISACTIVE afterwards.
            foreach (var row in existingRows.Where(r => r.ISACTIVE && !wanted.Contains(r.DOMAIN_ID)))
            {
                UpdateAuditFields(row, empId);
                row.ISACTIVE = false;
                CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Update(row);
            }

            foreach (var domainId in wanted)
            {
                var existing = existingRows.FirstOrDefault(r => r.DOMAIN_ID == domainId);
                if (existing != null)
                {
                    // Reactivates a previously removed mapping (UpdateAuditFields sets ISACTIVE = true).
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Update(existing);
                }
                else
                {
                    var row = new ITOPS_DOMAIN_PROJECT_MAP
                    {
                        DOMAIN_ID = domainId,
                        PROJECT_ID = projectId
                    };
                    UpdateAuditFields(row, empId);
                    CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Add(row);
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // ADDITIVE bulk mapping: one ITOPS_DOMAIN_PROJECT_MAP row per
        // (project x domain) combination, created or reactivated in a single
        // commit. Deliberately NOT the bulk form of
        // SaveITOpsDomainProjectMapping - nothing already mapped to any of these
        // projects is deactivated, because mapping a domain to a project is
        // always a valid standalone addition and a bulk REPLACE across several
        // projects would silently wipe domain sets the admin never looked at.
        // Combinations that already exist are reactivated/re-stamped rather than
        // duplicated, so the call is idempotent. Returns only counts; the Angular
        // screen re-reads GetITOpsDomainProjectMappings afterwards.
        [POST("BulkAddITOpsDomainProjectMappings")]
        [ActionName("BulkAddITOpsDomainProjectMappings")]
        [HttpPost]
        public IHttpActionResult BulkAddITOpsDomainProjectMappings([FromBody] ITOPS_BulkAddDomainProjectMappingRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_PROJECT_MAPPER", "change domain-project mappings");
            if (denied != null) return denied;

            if (request == null)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var projectIds = (request.ProjectIds ?? new List<string>())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Distinct()
                .ToList();
            var domainIds = (request.DomainIds ?? new List<int>())
                .Where(d => d > 0)
                .Distinct()
                .ToList();

            if (!projectIds.Any() || !domainIds.Any())
                return Content(HttpStatusCode.Conflict, "Pick at least one project and at least one domain.");

            var knownDomainIds = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => d.ISACTIVE && domainIds.Contains(d.ID))
                .Select(d => d.ID)
                .ToList();
            if (knownDomainIds.Count != domainIds.Count)
                return Content(HttpStatusCode.Conflict, "One or more of the selected domains no longer exists.");

            var empId = GetHeaderDetails_String("empId");

            var existingRows = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => projectIds.Contains(m.PROJECT_ID))
                .ToList();

            var added = 0;
            var reactivated = 0;
            var unchanged = 0;
            foreach (var projectId in projectIds)
            {
                foreach (var domainId in knownDomainIds)
                {
                    var existing = existingRows.FirstOrDefault(m => m.PROJECT_ID == projectId && m.DOMAIN_ID == domainId);
                    if (existing != null)
                    {
                        if (existing.ISACTIVE) unchanged++; else reactivated++;
                        // UpdateAuditFields sets ISACTIVE = true, so this also
                        // reactivates a previously unmapped combination.
                        UpdateAuditFields(existing, empId);
                        CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Update(existing);
                    }
                    else
                    {
                        var row = new ITOPS_DOMAIN_PROJECT_MAP
                        {
                            DOMAIN_ID = domainId,
                            PROJECT_ID = projectId
                        };
                        UpdateAuditFields(row, empId);
                        CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Add(row);
                        existingRows.Add(row);
                        added++;
                    }
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok(new { Added = added, Reactivated = reactivated, Unchanged = unchanged });
        }

        [POST("RemoveITOpsDomainProjectMapping")]
        [ActionName("RemoveITOpsDomainProjectMapping")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsDomainProjectMapping([FromBody] ITOPS_RemoveDomainProjectMappingRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_PROJECT_MAPPER", "change domain-project mappings");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.ProjectId) || request.DomainId <= 0)
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var projectId = request.ProjectId.Trim();
            var empId = GetHeaderDetails_String("empId");

            var rows = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.ISACTIVE && m.PROJECT_ID == projectId && m.DOMAIN_ID == request.DomainId)
                .ToList();
            if (!rows.Any()) return Ok();

            foreach (var row in rows)
            {
                UpdateAuditFields(row, empId);
                row.ISACTIVE = false;
                CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Update(row);
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // ==================================================================
        // STEP 4 - Configure Assessment (bulk create for a project)
        // ==================================================================

        // Bulk sibling of GetOrCreateITOpsAssessment: one ITOPS_ASSESSMENT row
        // per (cycle, project, domain), each seeded with the domain's default
        // assessor/reviewer as IS_PRIMARY join rows, plus the SAME assessee set
        // applied identically across every one of them - assessees are
        // project-wide, not per-domain (design decision from the mockup review).
        [POST("CreateITOpsAssessmentsForProject")]
        [ActionName("CreateITOpsAssessmentsForProject")]
        [HttpPost]
        public IHttpActionResult CreateITOpsAssessmentsForProject([FromBody] ITOPS_CreateAssessmentsRequest request)
        {
            var denied = DenyIfNotITOpsRole("RUNOPS_INITIATOR", "create assessments for a project");
            if (denied != null) return denied;

            if (request == null) return Content(HttpStatusCode.Conflict, ERROR_MSG);

            // ProjectIds is the current shape; ProjectId is the legacy single-project
            // one. Either is accepted, both are normalised to one distinct list.
            var requestedProjectIds = (request.ProjectIds ?? new List<string>())
                .Concat(new[] { request.ProjectId })
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Distinct()
                .ToList();
            if (!requestedProjectIds.Any())
                return Content(HttpStatusCode.Conflict, "Select at least one project to create assessments for.");

            var masterId = request.AssessmentMasterId ?? request.CycleId ?? 0;
            var master = masterId > 0
                ? CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().FirstOrDefault(m => m.ID == masterId && m.ISACTIVE)
                : GetCurrentITOpsAssessmentMaster();
            if (master == null)
                return Content(HttpStatusCode.Conflict, "No open IT Ops Maturity assessment cycle exists. Create one in Configure Cycle first.");

            var domainIds = (request.DomainIds ?? new List<int>()).Distinct().ToList();
            if (!domainIds.Any())
                return Content(HttpStatusCode.Conflict, "Select at least one domain to assess.");

            var allProjects = Cldb.PROJECT.GetAll()
                .Where(p => requestedProjectIds.Contains(p.PROJ_ID))
                .ToList();
            var missingProject = requestedProjectIds.FirstOrDefault(id => !allProjects.Any(p => p.PROJ_ID == id));
            if (missingProject != null) return NotFound();

            // Only domains actually mapped to a project in Configure Scope may be
            // assessed for it. The Angular picker only offers the INTERSECTION of
            // domains mapped to every selected project, so this is a defensive
            // check rather than a routine one - but it still runs per project.
            var mapsForProjects = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.ISACTIVE && requestedProjectIds.Contains(m.PROJECT_ID))
                .ToList();
            foreach (var pid in requestedProjectIds)
            {
                var mappedForThis = mapsForProjects.Where(m => m.PROJECT_ID == pid).Select(m => m.DOMAIN_ID).ToList();
                if (domainIds.Any(id => !mappedForThis.Contains(id)))
                    return Content(HttpStatusCode.Conflict,
                        "One or more selected domains are not mapped to project " + pid + ". Map them in Configure Scope first.");
            }

            var empId = GetHeaderDetails_String("empId");
            var custIds = allProjects.Select(p => p.CUST_ID).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => d.ISACTIVE && domainIds.Contains(d.ID))
                .ToList();

            var wantedAssessees = (request.AssesseeEmpIds ?? new List<string>())
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct()
                .ToList();

            // Every selected project gets the SAME domain set and the SAME assessee
            // team - the whole point of the bulk action. Each project is still
            // processed exactly as the old single-project path did, one at a time,
            // under its own account gate.
            foreach (var project in allProjects)
            {
            var projectId = project.PROJ_ID;
            var accountName = project.CUST_ID != null && accountNames.ContainsKey(project.CUST_ID)
                ? accountNames[project.CUST_ID]
                : null;
            var assessmentIds = new List<int>();

            // Serialised on the same per-account gate EnsureAssessmentsForAccount uses,
            // so a concurrent landing-page load can't race this into duplicate
            // (cycle, domain, project) assessment rows.
            var gate = _ensureAssessmentsLocks.GetOrAdd(project.CUST_ID ?? string.Empty, _ => new object());
            lock (gate)
            {
                foreach (var domain in domains)
                {
                    var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll()
                        .FirstOrDefault(a => a.ISACTIVE
                                          && a.ASSESSMENT_MASTER_ID == master.ID
                                          && a.DOMAIN_ID == domain.ID
                                          && a.PROJECT_ID == projectId);

                    if (assessment == null)
                    {
                        assessment = new ITOPS_ASSESSMENT
                        {
                            ASSESSMENT_MASTER_ID = master.ID,
                            DOMAIN_ID = domain.ID,
                            PROJECT_ID = projectId,
                            BUSINESS_UNIT = project.BUSINESS_UNIT,
                            ACCOUNT_NAME = accountName,
                            STATUS = "NotStarted"
                        };
                        UpdateAuditFields(assessment, empId);
                        CSPdb.ITOPS_ASSESSMENT.Add(assessment);
                        CSPdb.Commit(CanCommit); // need the identity before the join rows can reference it

                        SeedITOpsDefaultOwners(assessment, domain, empId);
                        CSPdb.Commit(CanCommit);
                    }

                    assessmentIds.Add(assessment.ID);
                }

                // Apply the identical assessee set to every one of this project's
                // assessments in this cycle - including ones created by an earlier
                // call - so "assessees are project-wide" holds even across re-runs.
                if (assessmentIds.Any())
                {
                    var existingAssessees = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                        .Where(a => assessmentIds.Contains(a.ASSESSMENT_ID))
                        .ToList();

                    foreach (var assessmentId in assessmentIds)
                    {
                        var rowsForAssessment = existingAssessees.Where(r => r.ASSESSMENT_ID == assessmentId).ToList();

                        foreach (var row in rowsForAssessment.Where(r => r.ISACTIVE && !wantedAssessees.Contains(r.ASSESSEE_EMP_ID)))
                        {
                            // Audit first, then clear ISACTIVE - UpdateAuditFieldsExt sets it back to true.
                            UpdateAuditFields(row, empId);
                            row.ISACTIVE = false;
                            CSPdb.ITOPS_ASSESSMENT_ASSESSEE.Update(row);
                        }

                        foreach (var assesseeEmpId in wantedAssessees)
                        {
                            var existing = rowsForAssessment.FirstOrDefault(r => r.ASSESSEE_EMP_ID == assesseeEmpId);
                            if (existing != null)
                            {
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
                }

                // Retire assessments for domains that were previously assessed for this
                // (cycle, project) but are no longer in the submitted selection - e.g. the
                // admin unchecked a domain here, or unmapped it in Configure Scope since
                // the last Create. Only NotStarted assessments are retired: one with real
                // work already on it (scored/submitted/approved/findings) is left alone
                // rather than silently discarded - the admin can deactivate it deliberately
                // elsewhere if that's genuinely what they want.
                var staleAssessments = CSPdb.ITOPS_ASSESSMENT.GetAll()
                    .Where(a => a.ISACTIVE
                             && a.ASSESSMENT_MASTER_ID == master.ID
                             && a.PROJECT_ID == projectId
                             && !domainIds.Contains(a.DOMAIN_ID)
                             && a.STATUS == "NotStarted")
                    .ToList();

                foreach (var stale in staleAssessments)
                {
                    // Audit first, then clear ISACTIVE - UpdateAuditFieldsExt sets it back to true.
                    UpdateAuditFields(stale, empId);
                    stale.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT.Update(stale);
                }

                if (staleAssessments.Any()) CSPdb.Commit(CanCommit);
            }
            }

            // Every selected project's rows come back in one payload, so the Step 4
            // table shows the whole bulk result rather than just the last project.
            return Ok(BuildITOpsCycleAssessmentRows(master.ID, null)
                .Where(r => requestedProjectIds.Contains(r.ProjectId))
                .ToList());
        }

        // The "Assessments in this cycle" table on Step 4, and the per-domain
        // accordion on Step 5.
        [GET("GetITOpsAssessmentsForCycle")]
        [ActionName("GetITOpsAssessmentsForCycle")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssessmentsForCycle(int cycleId, string projectId = null)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            return Ok(BuildITOpsCycleAssessmentRows(cycleId, projectId));
        }

        private List<ITOPS_CycleAssessmentRow> BuildITOpsCycleAssessmentRows(int cycleId, string projectId)
        {
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_MASTER_ID == cycleId)
                .ToList();
            if (!string.IsNullOrWhiteSpace(projectId))
                assessments = assessments.Where(a => a.PROJECT_ID == projectId).ToList();
            if (!assessments.Any()) return new List<ITOPS_CycleAssessmentRow>();

            var assessmentIds = assessments.Select(a => a.ID).ToList();

            var cycleLabel = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll()
                .Where(m => m.ID == cycleId)
                .Select(m => m.CYCLE_LABEL)
                .FirstOrDefault();

            var domainIds = assessments.Select(a => a.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => domainIds.Contains(d.ID))
                .ToList()
                .GroupBy(d => d.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var projectNames = GetITOpsProjectNameMap(assessments.Select(a => a.PROJECT_ID).ToList());

            var assessorRows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(x => x.ISACTIVE && assessmentIds.Contains(x.ASSESSMENT_ID))
                .ToList();
            var reviewerRows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(x => x.ISACTIVE && assessmentIds.Contains(x.ASSESSMENT_ID))
                .ToList();
            var assesseeRows = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(x => x.ISACTIVE && assessmentIds.Contains(x.ASSESSMENT_ID))
                .ToList();

            var empNames = GetITOpsEmpNameMap(
                assessorRows.Select(a => a.ASSESSOR_EMP_ID)
                    .Concat(reviewerRows.Select(r => r.REVIEWER_EMP_ID))
                    .ToList());
            Func<string, string> nameOf = id => id != null && empNames.ContainsKey(id) ? empNames[id] : id;

            return assessments.Select(a =>
            {
                var assessorIds = assessorRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderByDescending(x => x.IS_PRIMARY).Select(x => x.ASSESSOR_EMP_ID).ToList();
                var reviewerIds = reviewerRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderByDescending(x => x.IS_PRIMARY).Select(x => x.REVIEWER_EMP_ID).ToList();

                return new ITOPS_CycleAssessmentRow
                {
                    AssessmentId = a.ID,
                    AssessmentMasterId = a.ASSESSMENT_MASTER_ID,
                    CycleLabel = cycleLabel,
                    ProjectId = a.PROJECT_ID,
                    ProjectName = a.PROJECT_ID != null && projectNames.ContainsKey(a.PROJECT_ID) ? projectNames[a.PROJECT_ID] : null,
                    AccountName = a.ACCOUNT_NAME,
                    DomainId = a.DOMAIN_ID,
                    DomainCode = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].CODE : null,
                    DomainName = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID].NAME : null,
                    AssessorCount = assessorIds.Count,
                    ReviewerCount = reviewerIds.Count,
                    AssesseeCount = assesseeRows.Count(x => x.ASSESSMENT_ID == a.ID),
                    AssessorNames = assessorIds.Select(nameOf).ToList(),
                    ReviewerNames = reviewerIds.Select(nameOf).ToList(),
                    Status = a.STATUS
                };
            })
            .OrderBy(r => r.ProjectName)
            .ThenBy(r => r.DomainName)
            .ToList();
        }

        // ==================================================================
        // STEP 5 - Assign Assessor / Reviewer
        // ==================================================================
        //
        // Nothing existed for adding/removing ONE assessor or reviewer outside
        // the bulk-seed path (SeedITOpsDefaultOwners, which only ever writes the
        // domain's defaults when the assessment row is first created), so these
        // four endpoints are the per-person surface Step 5 needs.

        [GET("GetITOpsAssessmentTeam")]
        [ActionName("GetITOpsAssessmentTeam")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssessmentTeam(int assessmentId)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var assessors = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessmentId)
                .ToList();
            var reviewers = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.ISACTIVE && r.ASSESSMENT_ID == assessmentId)
                .ToList();
            var assessees = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessmentId)
                .ToList();

            var empNames = GetITOpsEmpNameMap(
                assessors.Select(a => a.ASSESSOR_EMP_ID)
                    .Concat(reviewers.Select(r => r.REVIEWER_EMP_ID))
                    .Concat(assessees.Select(a => a.ASSESSEE_EMP_ID))
                    .ToList());
            Func<string, string> nameOf = id => id != null && empNames.ContainsKey(id) ? empNames[id] : id;

            return Ok(new
            {
                AssessmentId = assessmentId,
                Assessors = assessors.OrderByDescending(a => a.IS_PRIMARY).Select(a => new ITOPS_TeamMemberRow
                {
                    Id = a.ID,
                    AssessmentId = a.ASSESSMENT_ID,
                    EmpId = a.ASSESSOR_EMP_ID,
                    EmpName = nameOf(a.ASSESSOR_EMP_ID),
                    IsPrimary = a.IS_PRIMARY
                }).ToList(),
                Reviewers = reviewers.OrderByDescending(r => r.IS_PRIMARY).Select(r => new ITOPS_TeamMemberRow
                {
                    Id = r.ID,
                    AssessmentId = r.ASSESSMENT_ID,
                    EmpId = r.REVIEWER_EMP_ID,
                    EmpName = nameOf(r.REVIEWER_EMP_ID),
                    IsPrimary = r.IS_PRIMARY
                }).ToList(),
                Assessees = assessees.Select(a => new ITOPS_TeamMemberRow
                {
                    Id = a.ID,
                    AssessmentId = a.ASSESSMENT_ID,
                    EmpId = a.ASSESSEE_EMP_ID,
                    EmpName = nameOf(a.ASSESSEE_EMP_ID),
                    IsPrimary = false
                }).ToList()
            });
        }

        [POST("AddITOpsAssessor")]
        [ActionName("AddITOpsAssessor")]
        [HttpPost]
        public IHttpActionResult AddITOpsAssessor([FromBody] ITOPS_AddTeamMemberRequest request)
        {
            var denied = DenyIfNotITOpsRole("TEAM_ASSIGNMENT_COORDINATOR", "assign assessors");
            if (denied != null) return denied;

            if (request == null || request.AssessmentId <= 0 || string.IsNullOrWhiteSpace(request.EmpId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == request.AssessmentId && a.ISACTIVE);
            if (assessment == null) return NotFound();

            var empId = GetHeaderDetails_String("empId");
            var targetEmpId = request.EmpId.Trim();

            var rows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ASSESSMENT_ID == request.AssessmentId)
                .ToList();

            // IS_PRIMARY is exclusive per assessment - promoting someone demotes the incumbent.
            if (request.IsPrimary)
            {
                foreach (var row in rows.Where(r => r.ISACTIVE && r.IS_PRIMARY && r.ASSESSOR_EMP_ID != targetEmpId))
                {
                    row.IS_PRIMARY = false;
                    UpdateAuditFields(row, empId);
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                }
            }

            var existing = rows.FirstOrDefault(a => a.ASSESSOR_EMP_ID == targetEmpId);
            if (existing != null)
            {
                existing.IS_PRIMARY = request.IsPrimary;
                // UpdateAuditFields sets ISACTIVE = true, which re-adds a previously removed assessor.
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(existing);
            }
            else
            {
                existing = new ITOPS_ASSESSMENT_ASSESSOR
                {
                    ASSESSMENT_ID = request.AssessmentId,
                    ASSESSOR_EMP_ID = targetEmpId,
                    IS_PRIMARY = request.IsPrimary
                };
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            return Ok(new ITOPS_TeamMemberRow
            {
                Id = existing.ID,
                AssessmentId = existing.ASSESSMENT_ID,
                EmpId = existing.ASSESSOR_EMP_ID,
                EmpName = GetEmpName(existing.ASSESSOR_EMP_ID),
                IsPrimary = existing.IS_PRIMARY
            });
        }

        [POST("RemoveITOpsAssessor")]
        [ActionName("RemoveITOpsAssessor")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsAssessor(int id)
        {
            var denied = DenyIfNotITOpsRole("TEAM_ASSIGNMENT_COORDINATOR", "remove assessors");
            if (denied != null) return denied;

            var row = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll().FirstOrDefault(a => a.ID == id);
            if (row == null) return NotFound();

            // Audit first, clear ISACTIVE after - UpdateAuditFieldsExt sets it back to true.
            UpdateAuditFields(row, GetHeaderDetails_String("empId"));
            row.ISACTIVE = false;
            CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        [POST("AddITOpsReviewer")]
        [ActionName("AddITOpsReviewer")]
        [HttpPost]
        public IHttpActionResult AddITOpsReviewer([FromBody] ITOPS_AddTeamMemberRequest request)
        {
            var denied = DenyIfNotITOpsRole("TEAM_ASSIGNMENT_COORDINATOR", "assign reviewers");
            if (denied != null) return denied;

            if (request == null || request.AssessmentId <= 0 || string.IsNullOrWhiteSpace(request.EmpId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == request.AssessmentId && a.ISACTIVE);
            if (assessment == null) return NotFound();

            var empId = GetHeaderDetails_String("empId");
            var targetEmpId = request.EmpId.Trim();

            var rows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.ASSESSMENT_ID == request.AssessmentId)
                .ToList();

            if (request.IsPrimary)
            {
                foreach (var row in rows.Where(r => r.ISACTIVE && r.IS_PRIMARY && r.REVIEWER_EMP_ID != targetEmpId))
                {
                    row.IS_PRIMARY = false;
                    UpdateAuditFields(row, empId);
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                }
            }

            var existing = rows.FirstOrDefault(r => r.REVIEWER_EMP_ID == targetEmpId);
            if (existing != null)
            {
                existing.IS_PRIMARY = request.IsPrimary;
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(existing);
            }
            else
            {
                existing = new ITOPS_ASSESSMENT_REVIEWER
                {
                    ASSESSMENT_ID = request.AssessmentId,
                    REVIEWER_EMP_ID = targetEmpId,
                    IS_PRIMARY = request.IsPrimary
                };
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            return Ok(new ITOPS_TeamMemberRow
            {
                Id = existing.ID,
                AssessmentId = existing.ASSESSMENT_ID,
                EmpId = existing.REVIEWER_EMP_ID,
                EmpName = GetEmpName(existing.REVIEWER_EMP_ID),
                IsPrimary = existing.IS_PRIMARY
            });
        }

        [POST("RemoveITOpsReviewer")]
        [ActionName("RemoveITOpsReviewer")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsReviewer(int id)
        {
            var denied = DenyIfNotITOpsRole("TEAM_ASSIGNMENT_COORDINATOR", "remove reviewers");
            if (denied != null) return denied;

            var row = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll().FirstOrDefault(r => r.ID == id);
            if (row == null) return NotFound();

            UpdateAuditFields(row, GetHeaderDetails_String("empId"));
            row.ISACTIVE = false;
            CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // ==================================================================
        // STEP 3c - Configure Scope: Categories & Parameters
        // ==================================================================
        //
        // See the long versioning note above ITOPS_CategoryRow. Short version:
        // substantive content is retire-and-replace, NAME/DISPLAY_ORDER are
        // in-place, and NAME doubles as the lineage key so it is immutable
        // across versions (renames rewrite the whole lineage at once).

        /// <summary>ISACTIVE and still in effect today - the same predicate the assessment form uses.</summary>
        private static bool IsITOpsCurrent(bool isActive, DateTime? endDate, DateTime today)
        {
            return isActive && (endDate == null || endDate > today);
        }

        /// <summary>Every ITOPS_CATEGORY row in one category's lineage: same DOMAIN_ID + same NAME.</summary>
        private List<ITOPS_CATEGORY> GetITOpsCategoryLineage(ITOPS_CATEGORY category)
        {
            return CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.DOMAIN_ID == category.DOMAIN_ID)
                .ToList()
                .Where(c => string.Equals((c.NAME ?? string.Empty).Trim(), (category.NAME ?? string.Empty).Trim(),
                                          StringComparison.OrdinalIgnoreCase))
                .OrderBy(c => c.START_DATE)
                .ThenBy(c => c.ID)
                .ToList();
        }

        /// <summary>
        /// Every ITOPS_PARAMETER row in one parameter's lineage: same parameter NAME
        /// under any category row in the same CATEGORY lineage. Chaining through the
        /// category lineage (rather than a raw CATEGORY_ID) matters because versioning
        /// a category mints new category rows for the parameters underneath it.
        /// </summary>
        private List<ITOPS_PARAMETER> GetITOpsParameterLineage(ITOPS_PARAMETER parameter)
        {
            var category = CSPdb.ITOPS_CATEGORY.GetAll().FirstOrDefault(c => c.ID == parameter.CATEGORY_ID);
            if (category == null) return new List<ITOPS_PARAMETER> { parameter };

            var categoryIds = GetITOpsCategoryLineage(category).Select(c => c.ID).ToList();

            return CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => categoryIds.Contains(p.CATEGORY_ID))
                .ToList()
                .Where(p => string.Equals((p.NAME ?? string.Empty).Trim(), (parameter.NAME ?? string.Empty).Trim(),
                                          StringComparison.OrdinalIgnoreCase))
                .OrderBy(p => p.START_DATE)
                .ThenBy(p => p.ID)
                .ToList();
        }

        /// <summary>Always five entries so the UI can bind a fixed 1-5 rubric grid.</summary>
        private static List<ITOPS_ParameterLevelRow> BuildITOpsLevelRows(List<ITOPS_PARAMETER_LEVEL> levels)
        {
            return Enumerable.Range(1, 5).Select(n =>
            {
                var hit = (levels ?? new List<ITOPS_PARAMETER_LEVEL>()).FirstOrDefault(l => l.LEVEL_NO == n);
                return new ITOPS_ParameterLevelRow { LevelNo = n, Description = hit != null ? hit.DESCRIPTION : null };
            }).ToList();
        }

        /// <summary>Writes the 1-5 ITOPS_PARAMETER_LEVEL rows for a freshly inserted parameter.</summary>
        private void AddITOpsParameterLevels(int parameterId, List<ITOPS_ParameterLevelInput> levels)
        {
            for (var n = 1; n <= 5; n++)
            {
                var input = (levels ?? new List<ITOPS_ParameterLevelInput>()).FirstOrDefault(l => l.LevelNo == n);
                // ITOPS_PARAMETER_LEVEL has no audit/ISACTIVE columns (it does not
                // derive from EntityBase), so UpdateAuditFields must NOT be called here.
                CSPdb.ITOPS_PARAMETER_LEVEL.Add(new ITOPS_PARAMETER_LEVEL
                {
                    PARAMETER_ID = parameterId,
                    LEVEL_NO = (byte)n,
                    DESCRIPTION = input != null ? input.Description : null
                });
            }
        }

        private List<ITOPS_ParameterRow> BuildITOpsParameterRows(List<ITOPS_PARAMETER> parameters)
        {
            if (parameters == null || !parameters.Any()) return new List<ITOPS_ParameterRow>();

            var today = DateTime.Today;
            var parameterIds = parameters.Select(p => p.ID).ToList();
            var categoryIds = parameters.Select(p => p.CATEGORY_ID).Distinct().ToList();

            var categories = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => categoryIds.Contains(c.ID))
                .ToList()
                .GroupBy(c => c.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var levelsByParameter = CSPdb.ITOPS_PARAMETER_LEVEL.GetAll()
                .Where(l => parameterIds.Contains(l.PARAMETER_ID))
                .ToList()
                .GroupBy(l => l.PARAMETER_ID)
                .ToDictionary(g => g.Key, g => g.ToList());

            var scoreCounts = CSPdb.ITOPS_SCORE.GetAll()
                .Where(s => s.ISACTIVE && parameterIds.Contains(s.PARAMETER_ID))
                .Select(s => s.PARAMETER_ID)
                .ToList()
                .GroupBy(id => id)
                .ToDictionary(g => g.Key, g => g.Count());

            // One lineage lookup per DISTINCT (category, name) pair rather than per row.
            var versionCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            return parameters.Select(p =>
            {
                ITOPS_CATEGORY category;
                categories.TryGetValue(p.CATEGORY_ID, out category);

                var key = (category != null ? category.DOMAIN_ID : 0) + "|" +
                          (category != null ? (category.NAME ?? string.Empty).Trim() : string.Empty) + "|" +
                          (p.NAME ?? string.Empty).Trim();
                int versionCount;
                if (!versionCounts.TryGetValue(key, out versionCount))
                {
                    versionCount = GetITOpsParameterLineage(p).Count;
                    versionCounts[key] = versionCount;
                }

                List<ITOPS_PARAMETER_LEVEL> levels;
                levelsByParameter.TryGetValue(p.ID, out levels);

                return new ITOPS_ParameterRow
                {
                    ParameterId = p.ID,
                    CategoryId = p.CATEGORY_ID,
                    CategoryName = category != null ? category.NAME : null,
                    DomainId = category != null ? category.DOMAIN_ID : 0,
                    Name = p.NAME,
                    Definition = p.DEFINITION,
                    MinRequiredScore = p.MIN_REQUIRED_SCORE,
                    DisplayOrder = p.DISPLAY_ORDER,
                    StartDate = p.START_DATE,
                    EndDate = p.END_DATE,
                    IsCurrent = IsITOpsCurrent(p.ISACTIVE, p.END_DATE, today),
                    Levels = BuildITOpsLevelRows(levels),
                    ScoreCount = scoreCounts.ContainsKey(p.ID) ? scoreCounts[p.ID] : 0,
                    VersionCount = versionCount
                };
            })
            .OrderBy(r => r.DisplayOrder)
            .ThenBy(r => r.Name)
            .ToList();
        }

        private List<ITOPS_CategoryRow> BuildITOpsCategoryRows(List<ITOPS_CATEGORY> categories)
        {
            if (categories == null || !categories.Any()) return new List<ITOPS_CategoryRow>();

            var today = DateTime.Today;
            var categoryIds = categories.Select(c => c.ID).ToList();

            var currentParamCounts = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => categoryIds.Contains(p.CATEGORY_ID) && p.ISACTIVE && (p.END_DATE == null || p.END_DATE > today))
                .Select(p => p.CATEGORY_ID)
                .ToList()
                .GroupBy(id => id)
                .ToDictionary(g => g.Key, g => g.Count());

            var versionCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            return categories.Select(c =>
            {
                var key = c.DOMAIN_ID + "|" + (c.NAME ?? string.Empty).Trim();
                int versionCount;
                if (!versionCounts.TryGetValue(key, out versionCount))
                {
                    versionCount = GetITOpsCategoryLineage(c).Count;
                    versionCounts[key] = versionCount;
                }

                return new ITOPS_CategoryRow
                {
                    CategoryId = c.ID,
                    DomainId = c.DOMAIN_ID,
                    Name = c.NAME,
                    DisplayOrder = c.DISPLAY_ORDER,
                    StartDate = c.START_DATE,
                    EndDate = c.END_DATE,
                    IsCurrent = IsITOpsCurrent(c.ISACTIVE, c.END_DATE, today),
                    ParameterCount = currentParamCounts.ContainsKey(c.ID) ? currentParamCounts[c.ID] : 0,
                    VersionCount = versionCount
                };
            })
            .OrderBy(r => r.DisplayOrder)
            .ThenBy(r => r.Name)
            .ThenByDescending(r => r.StartDate)
            .ToList();
        }

        // ---- Reads ----

        [GET("GetITOpsCategoriesForDomain")]
        [ActionName("GetITOpsCategoriesForDomain")]
        [HttpGet]
        public IHttpActionResult GetITOpsCategoriesForDomain(int domainId, bool includeExpired = false)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var today = DateTime.Today;
            var categories = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.DOMAIN_ID == domainId)
                .ToList()
                .Where(c => includeExpired || IsITOpsCurrent(c.ISACTIVE, c.END_DATE, today))
                .ToList();

            return Ok(BuildITOpsCategoryRows(categories));
        }

        [GET("GetITOpsParametersForCategory")]
        [ActionName("GetITOpsParametersForCategory")]
        [HttpGet]
        public IHttpActionResult GetITOpsParametersForCategory(int categoryId, bool includeExpired = false)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var today = DateTime.Today;
            var parameters = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.CATEGORY_ID == categoryId)
                .ToList()
                .Where(p => includeExpired || IsITOpsCurrent(p.ISACTIVE, p.END_DATE, today))
                .ToList();

            return Ok(BuildITOpsParameterRows(parameters));
        }

        /// <summary>Every row that has ever existed in this parameter's lineage, oldest first.</summary>
        [GET("GetITOpsParameterVersions")]
        [ActionName("GetITOpsParameterVersions")]
        [HttpGet]
        public IHttpActionResult GetITOpsParameterVersions(int parameterId)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var parameter = CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == parameterId);
            if (parameter == null) return NotFound();

            var rows = BuildITOpsParameterRows(GetITOpsParameterLineage(parameter))
                .OrderBy(r => r.StartDate)
                .ThenBy(r => r.ParameterId)
                .ToList();

            return Ok(rows);
        }

        /// <summary>Every row that has ever existed in this category's lineage, oldest first.</summary>
        [GET("GetITOpsCategoryVersions")]
        [ActionName("GetITOpsCategoryVersions")]
        [HttpGet]
        public IHttpActionResult GetITOpsCategoryVersions(int categoryId)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var category = CSPdb.ITOPS_CATEGORY.GetAll().FirstOrDefault(c => c.ID == categoryId);
            if (category == null) return NotFound();

            var rows = BuildITOpsCategoryRows(GetITOpsCategoryLineage(category))
                .OrderBy(r => r.StartDate)
                .ThenBy(r => r.CategoryId)
                .ToList();

            return Ok(rows);
        }

        // ---- Writes ----

        [POST("CreateITOpsCategory")]
        [ActionName("CreateITOpsCategory")]
        [HttpPost]
        public IHttpActionResult CreateITOpsCategory([FromBody] ITOPS_CreateCategoryRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "create categories");
            if (denied != null) return denied;

            if (request == null || request.DomainId <= 0)
                return Content(HttpStatusCode.Conflict, "A domain is required.");
            if (string.IsNullOrWhiteSpace(request.Name))
                return Content(HttpStatusCode.Conflict, "A category name is required.");

            var domain = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == request.DomainId && d.ISACTIVE);
            if (domain == null) return NotFound();

            var name = request.Name.Trim();
            var today = DateTime.Today;

            // A live row with the same name IS this lineage's current version -
            // creating another would fork the lineage key into two live rows.
            var clash = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.DOMAIN_ID == request.DomainId)
                .ToList()
                .Any(c => IsITOpsCurrent(c.ISACTIVE, c.END_DATE, today) &&
                          string.Equals((c.NAME ?? string.Empty).Trim(), name, StringComparison.OrdinalIgnoreCase));
            if (clash)
                return Content(HttpStatusCode.Conflict,
                    "This domain already has a category with that name. Edit that one instead - a second live row with the same name would split its version history.");

            var empId = GetHeaderDetails_String("empId");
            var maxOrder = CSPdb.ITOPS_CATEGORY.GetAll()
                .Where(c => c.DOMAIN_ID == request.DomainId)
                .Select(c => (int?)c.DISPLAY_ORDER)
                .Max() ?? 0;

            var category = new ITOPS_CATEGORY
            {
                DOMAIN_ID = request.DomainId,
                NAME = name,
                DISPLAY_ORDER = request.DisplayOrder ?? (maxOrder + 1),
                START_DATE = (request.StartDate ?? today).Date,
                END_DATE = null
            };
            UpdateAuditFields(category, empId);
            CSPdb.ITOPS_CATEGORY.Add(category);
            CSPdb.Commit(CanCommit);

            return Ok(BuildITOpsCategoryRows(new List<ITOPS_CATEGORY> { category }).FirstOrDefault());
        }

        /// <summary>
        /// In-place metadata edit: NAME and/or DISPLAY_ORDER, NO new version.
        /// Safe because nothing historical is derived from either (see the
        /// versioning note). A rename is applied to EVERY row in the lineage so
        /// the (DOMAIN_ID, NAME) lineage key stays intact across versions.
        /// </summary>
        [POST("UpdateITOpsCategoryMetadata")]
        [ActionName("UpdateITOpsCategoryMetadata")]
        [HttpPost]
        public IHttpActionResult UpdateITOpsCategoryMetadata([FromBody] ITOPS_UpdateCategoryMetaRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "edit categories");
            if (denied != null) return denied;

            if (request == null || request.CategoryId <= 0)
                return Content(HttpStatusCode.Conflict, "A category is required.");

            var category = CSPdb.ITOPS_CATEGORY.GetAll().FirstOrDefault(c => c.ID == request.CategoryId);
            if (category == null) return NotFound();

            var empId = GetHeaderDetails_String("empId");
            var today = DateTime.Today;
            var newName = string.IsNullOrWhiteSpace(request.Name) ? null : request.Name.Trim();

            if (newName != null &&
                !string.Equals(newName, (category.NAME ?? string.Empty).Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var clash = CSPdb.ITOPS_CATEGORY.GetAll()
                    .Where(c => c.DOMAIN_ID == category.DOMAIN_ID)
                    .ToList()
                    .Any(c => IsITOpsCurrent(c.ISACTIVE, c.END_DATE, today) &&
                              string.Equals((c.NAME ?? string.Empty).Trim(), newName, StringComparison.OrdinalIgnoreCase));
                if (clash)
                    return Content(HttpStatusCode.Conflict, "Another category in this domain already uses that name.");

                foreach (var row in GetITOpsCategoryLineage(category))
                {
                    var wasActive = row.ISACTIVE;
                    row.NAME = newName;
                    UpdateAuditFields(row, empId);
                    // A soft-deleted row must STAY soft-deleted - UpdateAuditFieldsExt
                    // unconditionally sets ISACTIVE = true.
                    row.ISACTIVE = wasActive;
                    CSPdb.ITOPS_CATEGORY.Update(row);
                }
            }

            if (request.DisplayOrder.HasValue)
            {
                category.DISPLAY_ORDER = request.DisplayOrder.Value;
                UpdateAuditFields(category, empId);
                CSPdb.ITOPS_CATEGORY.Update(category);
            }

            CSPdb.Commit(CanCommit);

            return Ok(BuildITOpsCategoryRows(new List<ITOPS_CATEGORY> { category }).FirstOrDefault());
        }

        /// <summary>
        /// Retire-and-replace one category row: END_DATE = today on the current
        /// row, a fresh row effective today in its place, and EVERY parameter
        /// currently under it re-versioned onto the new row (old parameter rows
        /// retired, exact copies inserted with their rubric text) so the
        /// assessment form is unchanged while every historical PARAMETER_ID keeps
        /// pointing at the wording it was scored against.
        /// </summary>
        [POST("VersionITOpsCategory")]
        [ActionName("VersionITOpsCategory")]
        [HttpPost]
        public IHttpActionResult VersionITOpsCategory([FromBody] ITOPS_VersionCategoryRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "version categories");
            if (denied != null) return denied;

            if (request == null || request.CategoryId <= 0)
                return Content(HttpStatusCode.Conflict, "A category is required.");

            var today = DateTime.Today;
            var category = CSPdb.ITOPS_CATEGORY.GetAll().FirstOrDefault(c => c.ID == request.CategoryId);
            if (category == null) return NotFound();
            if (!IsITOpsCurrent(category.ISACTIVE, category.END_DATE, today))
                return Content(HttpStatusCode.Conflict, "That category version is already retired.");

            // CK_ITOPS_CATEGORY_DATES requires END_DATE > START_DATE, so a row that
            // only became effective today cannot be end-dated today at all. Nothing
            // could have been scored against it on a PREVIOUS day either, so the
            // correct (and only legal) behaviour is a same-day in-place correction.
            if (category.START_DATE.Date >= today)
                return Content(HttpStatusCode.Conflict,
                    "This category version only became effective today, so it has no history to preserve yet. Edit it in place instead.");

            var empId = GetHeaderDetails_String("empId");

            var replacement = new ITOPS_CATEGORY
            {
                DOMAIN_ID = category.DOMAIN_ID,
                NAME = category.NAME,
                DISPLAY_ORDER = request.DisplayOrder ?? category.DISPLAY_ORDER,
                START_DATE = today,
                END_DATE = null
            };
            UpdateAuditFields(replacement, empId);
            CSPdb.ITOPS_CATEGORY.Add(replacement);

            category.END_DATE = today;
            UpdateAuditFields(category, empId);
            CSPdb.ITOPS_CATEGORY.Update(category);
            CSPdb.Commit(CanCommit); // need the replacement's identity before parameters can point at it

            var liveParameters = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.CATEGORY_ID == category.ID)
                .ToList()
                .Where(p => IsITOpsCurrent(p.ISACTIVE, p.END_DATE, today))
                .ToList();

            var carried = 0;
            foreach (var parameter in liveParameters)
            {
                // Same CK constraint applies per parameter row: one created today
                // cannot be end-dated today, so it is simply re-pointed instead.
                if (parameter.START_DATE.Date >= today)
                {
                    parameter.CATEGORY_ID = replacement.ID;
                    UpdateAuditFields(parameter, empId);
                    CSPdb.ITOPS_PARAMETER.Update(parameter);
                    carried++;
                    continue;
                }

                var copy = new ITOPS_PARAMETER
                {
                    CATEGORY_ID = replacement.ID,
                    NAME = parameter.NAME,
                    DEFINITION = parameter.DEFINITION,
                    MIN_REQUIRED_SCORE = parameter.MIN_REQUIRED_SCORE,
                    DISPLAY_ORDER = parameter.DISPLAY_ORDER,
                    START_DATE = today,
                    END_DATE = null
                };
                UpdateAuditFields(copy, empId);
                CSPdb.ITOPS_PARAMETER.Add(copy);

                parameter.END_DATE = today;
                UpdateAuditFields(parameter, empId);
                CSPdb.ITOPS_PARAMETER.Update(parameter);
                CSPdb.Commit(CanCommit); // identity needed for the level rows

                var oldLevels = CSPdb.ITOPS_PARAMETER_LEVEL.GetAll()
                    .Where(l => l.PARAMETER_ID == parameter.ID)
                    .ToList();
                AddITOpsParameterLevels(copy.ID, oldLevels
                    .Select(l => new ITOPS_ParameterLevelInput { LevelNo = l.LEVEL_NO, Description = l.DESCRIPTION })
                    .ToList());
                carried++;
            }
            CSPdb.Commit(CanCommit);

            return Ok(new
            {
                Category = BuildITOpsCategoryRows(new List<ITOPS_CATEGORY> { replacement }).FirstOrDefault(),
                RetiredCategoryId = category.ID,
                ParametersCarriedForward = carried
            });
        }

        [POST("CreateITOpsParameter")]
        [ActionName("CreateITOpsParameter")]
        [HttpPost]
        public IHttpActionResult CreateITOpsParameter([FromBody] ITOPS_CreateParameterRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "create parameters");
            if (denied != null) return denied;

            if (request == null || request.CategoryId <= 0)
                return Content(HttpStatusCode.Conflict, "A category is required.");
            if (string.IsNullOrWhiteSpace(request.Name))
                return Content(HttpStatusCode.Conflict, "A parameter name is required.");
            if (request.MinRequiredScore.HasValue && (request.MinRequiredScore.Value < 1 || request.MinRequiredScore.Value > 5))
                return Content(HttpStatusCode.Conflict, "The minimum required score must be between 1 and 5.");

            var today = DateTime.Today;
            var category = CSPdb.ITOPS_CATEGORY.GetAll().FirstOrDefault(c => c.ID == request.CategoryId);
            if (category == null) return NotFound();
            if (!IsITOpsCurrent(category.ISACTIVE, category.END_DATE, today))
                return Content(HttpStatusCode.Conflict, "That category version is retired - add the parameter to the current version instead.");

            var name = request.Name.Trim();
            var clash = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.CATEGORY_ID == request.CategoryId)
                .ToList()
                .Any(p => IsITOpsCurrent(p.ISACTIVE, p.END_DATE, today) &&
                          string.Equals((p.NAME ?? string.Empty).Trim(), name, StringComparison.OrdinalIgnoreCase));
            if (clash)
                return Content(HttpStatusCode.Conflict,
                    "This category already has a parameter with that name. Save a new version of that one instead - a second live row with the same name would split its version history.");

            var empId = GetHeaderDetails_String("empId");
            var maxOrder = CSPdb.ITOPS_PARAMETER.GetAll()
                .Where(p => p.CATEGORY_ID == request.CategoryId)
                .Select(p => (int?)p.DISPLAY_ORDER)
                .Max() ?? 0;

            var parameter = new ITOPS_PARAMETER
            {
                CATEGORY_ID = request.CategoryId,
                NAME = name,
                DEFINITION = request.Definition,
                MIN_REQUIRED_SCORE = request.MinRequiredScore,
                DISPLAY_ORDER = request.DisplayOrder ?? (maxOrder + 1),
                START_DATE = (request.StartDate ?? today).Date,
                END_DATE = null
            };
            UpdateAuditFields(parameter, empId);
            CSPdb.ITOPS_PARAMETER.Add(parameter);
            CSPdb.Commit(CanCommit); // identity needed for the level rows

            AddITOpsParameterLevels(parameter.ID, request.Levels);
            CSPdb.Commit(CanCommit);

            return Ok(BuildITOpsParameterRows(new List<ITOPS_PARAMETER> { parameter }).FirstOrDefault());
        }

        /// <summary>
        /// THE important write. Retires the current parameter row (END_DATE =
        /// today) and inserts a NEW row carrying the edited DEFINITION /
        /// MIN_REQUIRED_SCORE / rubric text, effective today. The old row and its
        /// ITOPS_PARAMETER_LEVEL rows are left byte-for-byte alone, so every
        /// ITOPS_SCORE that already referenced them still resolves to the exact
        /// wording it was scored against. NAME is NOT accepted here - it is the
        /// lineage key; rename through UpdateITOpsParameterMetadata.
        /// </summary>
        [POST("VersionITOpsParameter")]
        [ActionName("VersionITOpsParameter")]
        [HttpPost]
        public IHttpActionResult VersionITOpsParameter([FromBody] ITOPS_VersionParameterRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "version parameters");
            if (denied != null) return denied;

            if (request == null || request.ParameterId <= 0)
                return Content(HttpStatusCode.Conflict, "A parameter is required.");
            if (request.MinRequiredScore.HasValue && (request.MinRequiredScore.Value < 1 || request.MinRequiredScore.Value > 5))
                return Content(HttpStatusCode.Conflict, "The minimum required score must be between 1 and 5.");

            var today = DateTime.Today;
            var parameter = CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == request.ParameterId);
            if (parameter == null) return NotFound();
            if (!IsITOpsCurrent(parameter.ISACTIVE, parameter.END_DATE, today))
                return Content(HttpStatusCode.Conflict, "That parameter version is already retired. Version the current one instead.");

            var empId = GetHeaderDetails_String("empId");
            var levels = request.Levels ?? new List<ITOPS_ParameterLevelInput>();

            // A row that only became effective TODAY cannot be end-dated today
            // (CK_ITOPS_PARAMETER_DATES requires END_DATE > START_DATE), and no
            // assessment can have scored it on an earlier day, so there is no
            // history to protect: correct it in place and say so in the response.
            if (parameter.START_DATE.Date >= today)
            {
                parameter.DEFINITION = request.Definition;
                parameter.MIN_REQUIRED_SCORE = request.MinRequiredScore;
                UpdateAuditFields(parameter, empId);
                CSPdb.ITOPS_PARAMETER.Update(parameter);

                var existingLevels = CSPdb.ITOPS_PARAMETER_LEVEL.GetAll()
                    .Where(l => l.PARAMETER_ID == parameter.ID)
                    .ToList();
                for (var n = 1; n <= 5; n++)
                {
                    var input = levels.FirstOrDefault(l => l.LevelNo == n);
                    var row = existingLevels.FirstOrDefault(l => l.LEVEL_NO == n);
                    if (row != null)
                    {
                        row.DESCRIPTION = input != null ? input.Description : null;
                        CSPdb.ITOPS_PARAMETER_LEVEL.Update(row);
                    }
                    else
                    {
                        CSPdb.ITOPS_PARAMETER_LEVEL.Add(new ITOPS_PARAMETER_LEVEL
                        {
                            PARAMETER_ID = parameter.ID,
                            LEVEL_NO = (byte)n,
                            DESCRIPTION = input != null ? input.Description : null
                        });
                    }
                }
                CSPdb.Commit(CanCommit);

                return Ok(new
                {
                    Parameter = BuildITOpsParameterRows(new List<ITOPS_PARAMETER> { parameter }).FirstOrDefault(),
                    Versioned = false,
                    RetiredParameterId = (int?)null
                });
            }

            var replacement = new ITOPS_PARAMETER
            {
                CATEGORY_ID = parameter.CATEGORY_ID,
                NAME = parameter.NAME,
                DEFINITION = request.Definition,
                MIN_REQUIRED_SCORE = request.MinRequiredScore,
                DISPLAY_ORDER = parameter.DISPLAY_ORDER,
                START_DATE = today,
                END_DATE = null
            };
            UpdateAuditFields(replacement, empId);
            CSPdb.ITOPS_PARAMETER.Add(replacement);

            parameter.END_DATE = today;
            UpdateAuditFields(parameter, empId);
            CSPdb.ITOPS_PARAMETER.Update(parameter);
            CSPdb.Commit(CanCommit); // identity needed for the level rows

            AddITOpsParameterLevels(replacement.ID, levels);
            CSPdb.Commit(CanCommit);

            return Ok(new
            {
                Parameter = BuildITOpsParameterRows(new List<ITOPS_PARAMETER> { replacement }).FirstOrDefault(),
                Versioned = true,
                RetiredParameterId = parameter.ID
            });
        }

        /// <summary>
        /// In-place metadata edit: NAME and/or DISPLAY_ORDER, NO new version -
        /// neither is used to reconstruct what a past score was measured against.
        /// A rename rewrites every row in the lineage so the lineage key holds.
        /// </summary>
        [POST("UpdateITOpsParameterMetadata")]
        [ActionName("UpdateITOpsParameterMetadata")]
        [HttpPost]
        public IHttpActionResult UpdateITOpsParameterMetadata([FromBody] ITOPS_UpdateParameterMetaRequest request)
        {
            var denied = DenyIfNotITOpsRole("CATEGORY_PARAMETER_ADMINISTRATOR", "edit parameters");
            if (denied != null) return denied;

            if (request == null || request.ParameterId <= 0)
                return Content(HttpStatusCode.Conflict, "A parameter is required.");

            var parameter = CSPdb.ITOPS_PARAMETER.GetAll().FirstOrDefault(p => p.ID == request.ParameterId);
            if (parameter == null) return NotFound();

            var empId = GetHeaderDetails_String("empId");
            var today = DateTime.Today;
            var newName = string.IsNullOrWhiteSpace(request.Name) ? null : request.Name.Trim();

            if (newName != null &&
                !string.Equals(newName, (parameter.NAME ?? string.Empty).Trim(), StringComparison.OrdinalIgnoreCase))
            {
                var clash = CSPdb.ITOPS_PARAMETER.GetAll()
                    .Where(p => p.CATEGORY_ID == parameter.CATEGORY_ID)
                    .ToList()
                    .Any(p => IsITOpsCurrent(p.ISACTIVE, p.END_DATE, today) &&
                              string.Equals((p.NAME ?? string.Empty).Trim(), newName, StringComparison.OrdinalIgnoreCase));
                if (clash)
                    return Content(HttpStatusCode.Conflict, "Another parameter in this category already uses that name.");

                foreach (var row in GetITOpsParameterLineage(parameter))
                {
                    var wasActive = row.ISACTIVE;
                    row.NAME = newName;
                    UpdateAuditFields(row, empId);
                    // UpdateAuditFieldsExt unconditionally sets ISACTIVE = true.
                    row.ISACTIVE = wasActive;
                    CSPdb.ITOPS_PARAMETER.Update(row);
                }
            }

            if (request.DisplayOrder.HasValue)
            {
                parameter.DISPLAY_ORDER = request.DisplayOrder.Value;
                UpdateAuditFields(parameter, empId);
                CSPdb.ITOPS_PARAMETER.Update(parameter);
            }

            CSPdb.Commit(CanCommit);

            return Ok(BuildITOpsParameterRows(new List<ITOPS_PARAMETER> { parameter }).FirstOrDefault());
        }

        // ==================================================================
        // STEP 5 (bulk) - Reassign every assignment one person holds to another
        // ==================================================================

        /// <summary>
        /// Replaces EVERY active assessor/reviewer assignment held by FromEmpId
        /// with ToEmpId, across every assessment, preserving IS_PRIMARY per row.
        /// Send Preview = true to get the same counts without writing anything -
        /// that is what the confirmation screen calls first.
        ///
        /// Collision handling: UQ_ITOPS_ASSESSMENT_ASSESSOR / _REVIEWER are
        /// unique on (ASSESSMENT_ID, EMP_ID) WHERE ISACTIVE = 1, so where the
        /// target is ALREADY on the same assessment in the same role the source
        /// row is deactivated (a merge) rather than re-pointed, and the target
        /// inherits IS_PRIMARY if the source held it.
        /// </summary>
        [POST("BulkReassignITOpsTeamMember")]
        [ActionName("BulkReassignITOpsTeamMember")]
        [HttpPost]
        public IHttpActionResult BulkReassignITOpsTeamMember([FromBody] ITOPS_BulkReassignRequest request)
        {
            var denied = DenyIfNotITOpsRole("TEAM_ASSIGNMENT_COORDINATOR", "reassign assessment team members");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.FromEmpId) || string.IsNullOrWhiteSpace(request.ToEmpId))
                return Content(HttpStatusCode.Conflict, "Pick both the person to replace and their replacement.");

            var fromEmpId = request.FromEmpId.Trim();
            var toEmpId = request.ToEmpId.Trim();
            if (string.Equals(fromEmpId, toEmpId, StringComparison.OrdinalIgnoreCase))
                return Content(HttpStatusCode.Conflict, "Pick two different people.");

            // FK_..._EMP means an unknown target would blow up at commit time -
            // check first so it comes back as a clean message.
            var targetExists = Cldb.EMP_INFO.GetAll().Any(e => e.EMP_ID == toEmpId);
            if (!targetExists) return NotFound();

            var empId = GetHeaderDetails_String("empId");

            // Only assignments on LIVE assessments are in scope - a deactivated
            // assessment's team is history, not a standing assignment.
            var liveAssessmentIds = CSPdb.ITOPS_ASSESSMENT.GetAll()
                .Where(a => a.ISACTIVE)
                .Select(a => a.ID)
                .ToList();

            var assessorRows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSOR_EMP_ID == fromEmpId && liveAssessmentIds.Contains(a.ASSESSMENT_ID))
                .ToList();
            var reviewerRows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.ISACTIVE && r.REVIEWER_EMP_ID == fromEmpId && liveAssessmentIds.Contains(r.ASSESSMENT_ID))
                .ToList();

            var touchedAssessmentIds = assessorRows.Select(a => a.ASSESSMENT_ID)
                .Concat(reviewerRows.Select(r => r.ASSESSMENT_ID))
                .Distinct()
                .ToList();

            var targetAssessorRows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ASSESSOR_EMP_ID == toEmpId && touchedAssessmentIds.Contains(a.ASSESSMENT_ID))
                .ToList();
            var targetReviewerRows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => r.REVIEWER_EMP_ID == toEmpId && touchedAssessmentIds.Contains(r.ASSESSMENT_ID))
                .ToList();

            var merged = targetAssessorRows.Count(a => a.ISACTIVE && assessorRows.Any(x => x.ASSESSMENT_ID == a.ASSESSMENT_ID))
                       + targetReviewerRows.Count(r => r.ISACTIVE && reviewerRows.Any(x => x.ASSESSMENT_ID == r.ASSESSMENT_ID));

            var result = new ITOPS_BulkReassignResult
            {
                FromEmpId = fromEmpId,
                FromEmpName = GetEmpName(fromEmpId),
                ToEmpId = toEmpId,
                ToEmpName = GetEmpName(toEmpId),
                Preview = request.Preview,
                AssessorRows = assessorRows.Count,
                ReviewerRows = reviewerRows.Count,
                AssessmentCount = touchedAssessmentIds.Count,
                MergedRows = merged,
                TotalRows = assessorRows.Count + reviewerRows.Count
            };

            if (request.Preview || result.TotalRows == 0) return Ok(result);

            foreach (var row in assessorRows)
            {
                var incumbent = targetAssessorRows.FirstOrDefault(a => a.ASSESSMENT_ID == row.ASSESSMENT_ID);
                if (incumbent != null && incumbent.ISACTIVE)
                {
                    // Target already holds this seat: retire the source row and let
                    // the target inherit primary if the source was the primary.
                    if (row.IS_PRIMARY && !incumbent.IS_PRIMARY)
                    {
                        incumbent.IS_PRIMARY = true;
                        UpdateAuditFields(incumbent, empId);
                        CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(incumbent);
                    }
                    // Audit first, clear ISACTIVE after - UpdateAuditFieldsExt sets it back to true.
                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                    continue;
                }

                if (incumbent != null)
                {
                    // An INACTIVE row for the target on this assessment would still
                    // collide once re-pointed, so reuse it instead of re-pointing.
                    incumbent.IS_PRIMARY = row.IS_PRIMARY;
                    UpdateAuditFields(incumbent, empId); // sets ISACTIVE = true
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(incumbent);

                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                    continue;
                }

                row.ASSESSOR_EMP_ID = toEmpId;
                UpdateAuditFields(row, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
            }

            foreach (var row in reviewerRows)
            {
                var incumbent = targetReviewerRows.FirstOrDefault(r => r.ASSESSMENT_ID == row.ASSESSMENT_ID);
                if (incumbent != null && incumbent.ISACTIVE)
                {
                    if (row.IS_PRIMARY && !incumbent.IS_PRIMARY)
                    {
                        incumbent.IS_PRIMARY = true;
                        UpdateAuditFields(incumbent, empId);
                        CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(incumbent);
                    }
                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                    continue;
                }

                if (incumbent != null)
                {
                    incumbent.IS_PRIMARY = row.IS_PRIMARY;
                    UpdateAuditFields(incumbent, empId);
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(incumbent);

                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                    continue;
                }

                row.REVIEWER_EMP_ID = toEmpId;
                UpdateAuditFields(row, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
            }

            try
            {
                CSPdb.Commit(CanCommit);
            }
            catch (Exception ex)
            {
                if (IsUniqueViolation(ex))
                    return Content(HttpStatusCode.Conflict,
                        "That reassignment collided with an existing assignment. Refresh and try again.");
                LogRequest(ex, "ITOpsMaturity:BulkReassignTeamMember");
                throw;
            }

            return Ok(result);
        }
    }
}
