using AttributeRouting.Web.Mvc;
using GAVS.AllocationSystem.Model.CSP;
using GAVS.AllocationSystem.Model.CSP.SP;
using GAVS.AllocationSystem.Model.CSP.ViewModels;
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
    //
    // View models used by these endpoints live in
    // GAVS.AllocationSystem.Model/CSP/ViewModels/ITOperationMaturityAdminModels.cs
    // (namespace GAVS.AllocationSystem.Model.CSP.ViewModels, same place every
    // other CSM view model lives - see the `using` above), not in this project.

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
            // Cleared: a real SUPERUSER assignment now exists in ITOPS_ROLE_ASSIGNMENT,
            // so this fallback is already a no-op (see anySuperuserRoleAssigned below).
            // Leave empty rather than deleting the mechanism, so the bootstrap safety
            // net is still there for a genuinely fresh/pre-migration environment.
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

        /// <summary>
        /// The IT Ops Superuser role is restricted to people who are already a
        /// CSM SuperAdmin (VW_EMP_INFO_Active.SuperAdmin) - Superuser bypasses
        /// every project/account scoping filter in this app, so it should only
        /// ever land on someone who already has that same unrestricted reach
        /// on the CSM side.
        /// </summary>
        private bool IsCsmSuperAdmin(string empId)
        {
            return !string.IsNullOrWhiteSpace(empId) && Cldb.AppRepo.IsSuperAdmin(empId);
        }

        /// <summary>
        /// Rejects a grant that would hand the SUPERUSER role to someone who
        /// isn't a CSM SuperAdmin. Returns the conflict message to return to
        /// the caller, or null when the grant may proceed.
        /// </summary>
        private string ValidateSuperuserGrantTargets(IEnumerable<int> roleIds, IEnumerable<string> targetEmpIds)
        {
            var superuserRoleId = CSPdb.ITOPS_ROLE.GetAll().FirstOrDefault(r => r.ROLE_CODE == "SUPERUSER")?.ID;
            if (superuserRoleId == null || !roleIds.Contains(superuserRoleId.Value)) return null;

            var nonSuperAdmins = targetEmpIds.Where(id => !IsCsmSuperAdmin(id)).Distinct().ToList();
            if (!nonSuperAdmins.Any()) return null;

            var names = string.Join(", ", nonSuperAdmins.Select(id => GetEmpName(id) ?? id));
            var verb = nonSuperAdmins.Count == 1 ? "is" : "are";
            return $"{names} {verb} not a Superuser in CSM, so they could not be assigned as an IT Ops Superuser.";
        }

        /// <summary>
        /// Reflects an object's public properties (an anonymous type, typically) into a
        /// {{PropertyName}} -> value dictionary for GetEmailContent - so a row builder
        /// computes its values ONCE, as one object, instead of also hand-maintaining a
        /// second "{{Key}}", value list that mirrors it and can drift out of sync. Every
        /// property becomes an available placeholder automatically; a row/email .htm
        /// template can then reference, drop, or reorder any of them with NO C# change.
        /// Null becomes "". Not just for row templates - any GetEmailContent caller can use it.
        /// </summary>
        private static Dictionary<string, string> ToEmailValues(object row)
        {
            var dict = new Dictionary<string, string>();
            if (row == null) return dict;
            foreach (var prop in row.GetType().GetProperties())
            {
                dict[prop.Name] = prop.GetValue(row)?.ToString() ?? "";
            }
            return dict;
        }

        // ------------------------------------------------------------------
        // Admin Setup email notifications
        //
        // Reuses the SAME EmailProvider/GetEmailContent pipeline (and the
        // SendITOpsNotificationEmail/ToMany helpers) that ITOperationMaturityController.cs
        // already sends real workflow emails through - not a new mechanism. The
        // in-app bell (CreateITOpsNotification/NotifyITOps) is skipped here on
        // purpose: ITOPS_NOTIFICATION has a CHECK constraint requiring exactly
        // one of ASSESSMENT_ID/FINDING_ID, and role grants/revokes and domain-
        // mapping changes have no assessment to hang a bell row on. Step 4
        // (assessments created) and Step 5 (assessor/reviewer assigned) DO have
        // a real assessment id, so those go through the full NotifyITOps(Many)
        // (email + bell) instead of the email-only helpers below.
        // ------------------------------------------------------------------

        // The scope label is keyed off the GRANT HOLDER's own Superuser status, not
        // the grant's stored PROJECT_ID - a non-Superuser is always bounded by their
        // real CSM project allocation regardless of what this grant's scope says
        // (see GetITOpsDomainProjectMappings/GetITOpsProjects), so naming a specific
        // project here would be misleading. Only a Superuser is genuinely org-wide.
        private string ITOpsScopeLabel(string empId)
        {
            return IsITOpsSuperuser(empId) ? "Org-wide" : "All allocated projects";
        }

        /// <summary>
        /// One email per employee covering every role touched in this call - a
        /// bulk grant/revoke across several roles was sending one email per
        /// (employee x role) pair before, which reads as spam when someone is
        /// granted/revoked several roles at once.
        /// </summary>
        private void NotifyITOpsRoleChange(string empId, List<KeyValuePair<string, string>> roleScopePairs, string byEmpId, bool granted)
        {
            if (roleScopePairs == null || !roleScopePairs.Any()) return;

            // The actual grant/revoke has already been committed by the time this runs (see
            // every call site) - a template-file read failure or any other notification-only
            // problem here must never surface as "could not update the roles" to the caller,
            // same as SendITOpsNotificationEmail(ToMany)/WithCc already guard their own send.
            // This wraps the parts of this method (HTML building) that run BEFORE reaching
            // those guarded helpers, which previously could throw unguarded.
            try
            {
                var rolesListHtml = string.Join("", roleScopePairs.Select(rs =>
                    helper.GetEmailContent("ITOpsRoleListItem.htm", ToEmailValues(new { RoleName = rs.Key, Scope = rs.Value }))));
                var subject = granted
                    ? (roleScopePairs.Count == 1
                        ? $"IT Ops Maturity: you've been granted the {roleScopePairs[0].Key} role"
                        : $"IT Ops Maturity: you've been granted {roleScopePairs.Count} role(s)")
                    : (roleScopePairs.Count == 1
                        ? $"IT Ops Maturity: your {roleScopePairs[0].Key} role has been revoked"
                        : $"IT Ops Maturity: {roleScopePairs.Count} of your roles have been revoked");

                SendITOpsNotificationEmail(
                    empId,
                    subject,
                    granted ? "ITOpsRoleGranted.htm" : "ITOpsRoleRevoked.htm",
                    ToEmailValues(new
                    {
                        EmpName = GetEmpName(empId),
                        ByName = GetEmpName(byEmpId),
                        RolesList = rolesListHtml
                    }));
            }
            catch (Exception ex)
            {
                LogRequest(ex, "ITOpsMaturity:NotifyITOpsRoleChange");
            }
        }

        /// <summary>
        /// One email PER PROJECT (not one consolidated email across every project
        /// touched) covering only what actually changed for that project, sent when
        /// the admin clicks "Submit and Continue to Configure Assessment" - NOT fired
        /// per individual add/remove during editing (that read as spam), and NOT
        /// fired at all for a project with nothing new to report (clicking Submit
        /// again with no edits sent a duplicate email before this fix). "Changed" is
        /// driven off ITOPS_DOMAIN_PROJECT_MAP_AUDIT's NOTIFIED flag: only rows not
        /// yet included in a previous email are considered, and they're stamped
        /// NOTIFIED = true once that project's send succeeds, so the next submit
        /// only ever reports what's new since - per project, independently.
        /// </summary>
        private bool NotifyITOpsMappingSubmitted(List<string> projectIds)
        {
            if (projectIds == null || !projectIds.Any()) return false;

            var allAudit = CSPdb.ITOPS_DOMAIN_PROJECT_MAP_AUDIT.GetAll()
                .Where(a => projectIds.Contains(a.PROJECT_ID))
                .ToList();
            var pendingAudit = allAudit.Where(a => !a.NOTIFIED).ToList();
            if (!pendingAudit.Any()) return false;

            var allDomains = CSPdb.ITOPS_DOMAIN.GetAll().ToDictionary(d => d.ID, d => d.NAME);
            var assesseeRows = CSPdb.ITOPS_PROJECT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && projectIds.Contains(a.PROJECT_ID))
                .ToList();
            // Current active domain count per project - tells "every domain was
            // just removed" (the project is now fully unmapped) apart from "some
            // domains were removed but others remain" (still just an update).
            var activeDomainCountByProject = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.ISACTIVE && projectIds.Contains(m.PROJECT_ID))
                .GroupBy(m => m.PROJECT_ID)
                .ToDictionary(g => g.Key, g => g.Count());
            var projects = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .ToDictionary(p => p.PROJ_ID);
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => c.CUST_ID != null)
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var anySent = false;

            foreach (var group in pendingAudit.GroupBy(a => a.PROJECT_ID))
            {
                var projectId = group.Key;
                if (!projects.ContainsKey(projectId)) continue;

                // Reactivated (a previously-removed mapping re-added) reads as
                // "Added" to the recipient - the ISACTIVE history behind it
                // isn't meaningful to them.
                var added = group.Where(a => a.ACTION == "Added" || a.ACTION == "Reactivated")
                    .Select(a => allDomains.ContainsKey(a.DOMAIN_ID) ? allDomains[a.DOMAIN_ID] : null)
                    .Where(n => n != null).Distinct().ToList();
                var removed = group.Where(a => a.ACTION == "Removed")
                    .Select(a => allDomains.ContainsKey(a.DOMAIN_ID) ? allDomains[a.DOMAIN_ID] : null)
                    .Where(n => n != null).Distinct().ToList();
                if (!added.Any() && !removed.Any()) continue;

                var assesseeIds = assesseeRows.Where(a => a.PROJECT_ID == projectId).Select(a => a.EMP_ID).Distinct().ToList();
                if (!assesseeIds.Any()) continue; // no one to tell yet - leave these rows pending for a later submit

                var project = projects[projectId];
                var accountName = project.CUST_ID != null && accountNames.ContainsKey(project.CUST_ID)
                    ? accountNames[project.CUST_ID]
                    : "-";
                // "Never notified before" doesn't mean "newly mapped" - a project can
                // have been mapped/notified long ago, fully unmapped later, and is
                // only now being mapped again, which should still read as "Added"
                // rather than "Updated". So instead of previouslyNotifiedProjectIds,
                // derive it from the actual before/after domain counts: back out
                // this batch's additions from the current active count to see
                // whether the project had zero mapped domains right before this
                // change (i.e. it just transitioned from unmapped to mapped).
                var currentActiveCount = activeDomainCountByProject.ContainsKey(projectId) ? activeDomainCountByProject[projectId] : 0;
                var activeCountBeforeThisBatch = currentActiveCount - added.Count;
                var stillHasDomains = currentActiveCount > 0;
                var isNewProject = stillHasDomains && activeCountBeforeThisBatch <= 0;
                // Added: had zero domains mapped before this change, now has some.
                // Removed: now has zero active domains left (fully unmapped).
                // Updated: everything else (some domains added/removed but the
                // project was already mapped and still is).
                // Spelled out rather than a single word ("Added"/"Removed"/"Updated")
                // so a reader scanning the table doesn't have to infer from the
                // domain bullets below whether the whole project dropped out of
                // mapping (e.g. its one remaining domain got unmapped) versus
                // just having some domains change while it's still mapped.
                var statusLabel = isNewProject
                    ? "Project added to mapping"
                    : (!stillHasDomains ? "Project removed from mapping" : "Domains updated");
                var statusColor = !stillHasDomains && !isNewProject ? "#c62828" : "#1F497D";

                // The mapping itself is already saved by the time this runs (see the caller) -
                // a template-file read failure or any other notification-only problem for THIS
                // project must never stop the submit or block the other projects' emails in
                // this same batch. Leaves this project's audit rows NOTIFIED=false so the next
                // submit retries the email rather than silently losing it.
                try
                {
                    var changeLines = new List<string>
                    {
                        helper.GetEmailContent("ITOpsMappingStatusLine.htm", ToEmailValues(new { StatusColor = statusColor, StatusLabel = statusLabel }))
                    };
                    if (added.Any())
                        changeLines.Add(helper.GetEmailContent("ITOpsMappingAddedLine.htm", ToEmailValues(new { Names = string.Join(", ", added) })));
                    if (removed.Any())
                        changeLines.Add(helper.GetEmailContent("ITOpsMappingRemovedLine.htm", ToEmailValues(new { Names = string.Join(", ", removed) })));

                    // Every value this row could plausibly show is passed through, not just the
                    // ones ITOpsMappingSubmittedRow.htm currently uses - so adding, removing, or
                    // reordering a column is purely an edit to that .htm file (add/drop a <td>
                    // referencing one of these keys) and never needs a C# change. A key the
                    // template doesn't reference is simply never substituted - see GetEmailContent.
                    var row = helper.GetEmailContent("ITOpsMappingSubmittedRow.htm", ToEmailValues(new
                    {
                        SNo = 1,
                        AccountName = accountName,
                        ProjectId = projectId,
                        ProjectName = project.PROJ_NM ?? projectId,
                        StatusLabel = statusLabel,
                        StatusColor = statusColor,
                        AddedNames = string.Join(", ", added),
                        RemovedNames = string.Join(", ", removed),
                        ChangeLines = string.Join("", changeLines),
                        AssesseeIds = string.Join(", ", assesseeIds),
                        Assessees = string.Join(", ", GetEmpNames(assesseeIds))
                    }));

                    // "Dex Partners" - the project's Quality SPOC - gets the same mapping
                    // notification as the assessees, so they see scope changes on projects
                    // they own without needing to be an assessee themselves.
                    var recipientIds = assesseeIds.ToList();
                    if (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC)) recipientIds.Add(project.QUALITY_SPOC);
                    recipientIds = recipientIds.Distinct().ToList();

                    SendITOpsNotificationEmailToMany(
                        recipientIds,
                        $"IT Ops Maturity: domain-project mapping updated - {project.PROJ_NM ?? projectId}",
                        "ITOpsMappingSubmitted.htm",
                        ToEmailValues(new { RowsHtml = row }));

                    foreach (var audit in group)
                    {
                        audit.NOTIFIED = true;
                        CSPdb.ITOPS_DOMAIN_PROJECT_MAP_AUDIT.Update(audit);
                    }
                    anySent = true;
                }
                catch (Exception ex)
                {
                    LogRequest(ex, "ITOpsMaturity:NotifyITOpsMappingSubmitted:" + projectId);
                }
            }

            if (anySent) CSPdb.Commit(CanCommit);
            return anySent;
        }

        /// <summary>
        /// Renaming a domain touches every project it's mapped to - one email
        /// to the union of their assessees rather than one per project, same
        /// reasoning as the assessments-created consolidation.
        /// </summary>
        private void NotifyITOpsDomainRenamed(int domainId, string oldName, string newName)
        {
            var projectIds = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.ISACTIVE && m.DOMAIN_ID == domainId)
                .Select(m => m.PROJECT_ID)
                .Distinct()
                .ToList();
            if (!projectIds.Any()) return;

            var assesseeIds = CSPdb.ITOPS_PROJECT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && projectIds.Contains(a.PROJECT_ID))
                .Select(a => a.EMP_ID)
                .Distinct()
                .ToList();
            if (!assesseeIds.Any()) return;

            var projectNames = GetITOpsProjectNameMap(projectIds);
            var projectNamesJoined = string.Join(", ", projectIds.Select(id => projectNames.ContainsKey(id) ? projectNames[id] : id));

            SendITOpsNotificationEmailToMany(
                assesseeIds,
                $"IT Ops Maturity: {oldName} domain renamed to {newName}",
                "ITOpsDomainRenamed.htm",
                ToEmailValues(new { OldName = oldName, NewName = newName, ProjectNames = projectNamesJoined }));
        }

        /// <summary>Step 5: notifies the person just assigned as assessor/reviewer on one domain assessment (email + bell - a real assessment id exists here).</summary>
        private void NotifyITOpsTeamAssignment(ITOPS_ASSESSMENT assessment, string roleLabel, string empId)
        {
            var domainName = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID)?.NAME ?? "domain";
            var projectName = Cldb.PROJECT.GetAll().FirstOrDefault(p => p.PROJ_ID == assessment.PROJECT_ID)?.PROJ_NM ?? assessment.PROJECT_ID;
            var cycleLabel = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().FirstOrDefault(m => m.ID == assessment.ASSESSMENT_MASTER_ID)?.CYCLE_LABEL;

            NotifyITOps(
                empId,
                $"IT Ops Maturity: you're the {roleLabel.ToLowerInvariant()} for {domainName} — {projectName}",
                "ITOpsTeamAssigned.htm",
                ToEmailValues(new
                {
                    EmpName = GetEmpName(empId),
                    RoleLabel = roleLabel,
                    DomainName = domainName,
                    ProjectName = projectName,
                    CycleLabel = cycleLabel
                }),
                "TeamAssigned", assessment.ID, null,
                $"You've been assigned as {roleLabel} for {domainName} — {projectName}, cycle {cycleLabel}.");
        }

        /// <summary>
        /// Same idea as NotifyITOpsTeamAssignment, but for several assignments at
        /// once (e.g. picking someone as assessor for a domain that's mapped to
        /// many projects, a bulk reassignment, or a bulk removal) - ONE email
        /// listing every domain/project/role touched, instead of one email per
        /// assessment. `action` is "Added" or "Removed" and drives both the
        /// subject and the intro line - when every row shares the same role
        /// (the common case: assigning/removing someone for one domain) the
        /// intro names that role directly rather than the generic "assessor/
        /// reviewer" phrasing, which only applies to the mixed-role case (e.g.
        /// a bulk reassignment that moved both assessor and reviewer seats).
        /// `fromEmpId` is set only for a bulk reassignment - it names the
        /// outgoing person in the table/intro and Ccs them, so they know their
        /// seat was handed to someone else. The bell still logs one row per
        /// assessment for "Added" (removals don't get a bell - there's nothing
        /// left to click through to).
        /// </summary>
        private void NotifyITOpsTeamAssignmentBulk(List<Tuple<ITOPS_ASSESSMENT, string>> items, string empId, string action = "Added", string fromEmpId = null)
        {
            if (items == null || !items.Any()) return;
            var isRemoved = string.Equals(action, "Removed", StringComparison.OrdinalIgnoreCase);
            var fromEmpName = !string.IsNullOrWhiteSpace(fromEmpId) ? GetEmpName(fromEmpId) : null;

            var domainIds = items.Select(i => i.Item1.DOMAIN_ID).Distinct().ToList();
            var domainNames = CSPdb.ITOPS_DOMAIN.GetAll().Where(d => domainIds.Contains(d.ID)).ToDictionary(d => d.ID, d => d.NAME);
            var projectNames = GetITOpsProjectNameMap(items.Select(i => i.Item1.PROJECT_ID).ToList());
            var masterIds = items.Select(i => i.Item1.ASSESSMENT_MASTER_ID).Distinct().ToList();
            var cycleLabels = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().Where(m => masterIds.Contains(m.ID)).ToDictionary(m => m.ID, m => m.CYCLE_LABEL);
            var distinctRoles = items.Select(i => i.Item2).Distinct().ToList();

            // The assessor/reviewer seat(s) are already saved by the time this runs (see every
            // call site) - a template-file read failure or any other notification-only problem
            // must never surface as a failure of the underlying add/remove/reassign action, and
            // must not stop the bell notifications below either (kept outside this try).
            try
            {
                var previouslyCell = fromEmpName != null
                    ? helper.GetEmailContent("ITOpsTeamAssignedBulkPreviouslyCell.htm", ToEmailValues(new { FromEmpName = fromEmpName }))
                    : "";
                // Superset object, reflected via ToEmailValues: every value a row could show is
                // passed through so the .htm row template is free to add/drop/reorder <td>
                // columns on its own - no C# change needed unless a genuinely new value (not
                // already computed here) is required.
                var orderedRows = items
                    .Select(i => new
                    {
                        DomainId = i.Item1.DOMAIN_ID,
                        Domain = domainNames.ContainsKey(i.Item1.DOMAIN_ID) ? domainNames[i.Item1.DOMAIN_ID] : "domain",
                        ProjectId = i.Item1.PROJECT_ID,
                        Project = projectNames.ContainsKey(i.Item1.PROJECT_ID) ? projectNames[i.Item1.PROJECT_ID] : i.Item1.PROJECT_ID,
                        AssessmentMasterId = i.Item1.ASSESSMENT_MASTER_ID,
                        Cycle = cycleLabels.ContainsKey(i.Item1.ASSESSMENT_MASTER_ID) ? cycleLabels[i.Item1.ASSESSMENT_MASTER_ID] : "-",
                        Role = i.Item2,
                        FromEmpName = fromEmpName ?? "",
                        PreviouslyCell = previouslyCell
                    })
                    .OrderBy(r => r.Domain).ThenBy(r => r.Project)
                    .ToList();
                // SNo is assigned AFTER ordering, so it matches the row numbers a reader
                // actually sees top to bottom in the table, not the original items order.
                var rowsHtml = string.Join("", orderedRows
                    .Select((r, idx) => helper.GetEmailContent("ITOpsTeamAssignedBulkRow.htm", ToEmailValues(new
                    {
                        SNo = idx + 1,
                        r.DomainId,
                        r.Domain,
                        r.ProjectId,
                        r.Project,
                        r.AssessmentMasterId,
                        r.Cycle,
                        r.Role,
                        r.FromEmpName,
                        r.PreviouslyCell
                    }))));

                var previouslyHeaderCell = fromEmpName != null
                    ? helper.GetEmailContent("ITOpsTeamAssignedBulkPreviouslyHeader.htm", new Dictionary<string, string>())
                    : "";

                string introText;
                if (distinctRoles.Count == 1)
                {
                    var roleLower = distinctRoles[0].ToLowerInvariant();
                    var article = roleLower == "assessor" ? "an" : "a";
                    var replacingClause = fromEmpName != null ? $", replacing {fromEmpName}" : "";
                    introText = isRemoved
                        ? $"You have been removed as {article} {roleLower} for the below domain(s) - see the respective project(s) and cycle in the table below."
                        : $"You have been assigned as {article} {roleLower} for the below domain(s){replacingClause} - see the respective project(s) and cycle in the table below.";
                }
                else
                {
                    var replacingClause = fromEmpName != null ? $" (replacing {fromEmpName})" : "";
                    introText = isRemoved
                        ? "Your assessor/reviewer assignments have been removed in the IT Operations Maturity Dashboard:"
                        : $"Your assessor/reviewer assignments have been updated in the IT Operations Maturity Dashboard{replacingClause}:";
                }

                var subject = distinctRoles.Count == 1 && domainIds.Count == 1
                    ? $"IT Ops Maturity: you've been {(isRemoved ? "removed as" : "assigned as")} {distinctRoles[0].ToLowerInvariant()} for {domainNames.Values.FirstOrDefault()} across {items.Count} project(s)"
                    : $"IT Ops Maturity: you're {(isRemoved ? "off" : "now on")} {items.Count} assessment(s) as {(distinctRoles.Count == 1 ? distinctRoles[0].ToLowerInvariant() : "assessor/reviewer")}";

                var values = ToEmailValues(new
                {
                    EmpName = GetEmpName(empId),
                    IntroText = introText,
                    PreviouslyHeaderCell = previouslyHeaderCell,
                    RowsHtml = rowsHtml
                });

                if (fromEmpId != null)
                    SendITOpsNotificationEmailWithCc(new List<string> { empId }, new List<string> { fromEmpId }, subject, "ITOpsTeamAssignedBulk.htm", values);
                else
                    SendITOpsNotificationEmail(empId, subject, "ITOpsTeamAssignedBulk.htm", values);
            }
            catch (Exception ex)
            {
                LogRequest(ex, "ITOpsMaturity:NotifyITOpsTeamAssignmentBulk");
            }

            if (isRemoved) return; // nothing left to click through to - no bell for a removal

            foreach (var item in items)
            {
                var domainName = domainNames.ContainsKey(item.Item1.DOMAIN_ID) ? domainNames[item.Item1.DOMAIN_ID] : "domain";
                var projectName = projectNames.ContainsKey(item.Item1.PROJECT_ID) ? projectNames[item.Item1.PROJECT_ID] : item.Item1.PROJECT_ID;
                CreateITOpsNotification(
                    empId, "TeamAssigned", item.Item1.ID, null,
                    $"You've been assigned as {item.Item2} for {domainName} — {projectName}.");
            }
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

            // A DEACTIVATED role definition turns that step off system-wide - even
            // Superuser's blanket "every step is open regardless of individual
            // grants" bypass only ever meant to skip checking whether THIS PERSON
            // was granted it, not whether the role still exists at all. Without
            // this check, deactivating ITOPS_ROLE.ISACTIVE for a role had no
            // observable effect for any Superuser, which reads as the setting
            // being ignored entirely.
            if (!CSPdb.ITOPS_ROLE.GetAll().Any(r => r.ISACTIVE && r.ROLE_CODE == roleCode)) return false;

            if (IsITOpsSuperuser(empId)) return true;
            return GetITOpsRoleCodes(empId).Contains(roleCode);
        }

        // Per-role project-scope enforcement (ORG/OWN/PROJECT grant scoping on
        // reads/writes across the mapping and assessment screens) was tried and
        // reverted - it introduced a regression (an empty project list for at
        // least one superuser) that wasn't worth chasing further right now.
        // Reads are gated only by DenyIfNotITOpsAdmin/DenyIfNotITOpsRole again,
        // same as before that work started. SCOPE_TYPE stays on
        // ITOPS_ROLE_ASSIGNMENT (harmless, unused for OWN) since dropping a
        // column is a separate, riskier step than reverting the code that read
        // it - grants are only ever written as ORG or PROJECT now.
        private const string ITOPS_SCOPE_ORG = "ORG";
        private const string ITOPS_SCOPE_PROJECT = "PROJECT";

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

        /// <summary>Same as DenyIfNotITOpsRole, but passes if the caller holds ANY of several roles - e.g. assigning Assessor/Reviewer is now done both from Configure Assessment (RUNOPS_INITIATOR) and, if ever re-enabled, from Step 5 (TEAM_ASSIGNMENT_COORDINATOR).</summary>
        private IHttpActionResult DenyIfNotAnyITOpsRole(string[] roleCodes, string what)
        {
            var callerEmpId = GetHeaderDetails_String("empId");
            if (roleCodes.Any(rc => HasITOpsRole(callerEmpId, rc))) return null;
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
            var activeRoleCodes = CSPdb.ITOPS_ROLE.GetAll().Where(r => r.ISACTIVE).Select(r => r.ROLE_CODE).ToList();

            return Ok(new ITOPS_MyAccessRow
            {
                EmpId = callerEmpId,
                IsSuperuser = isSuperuser,
                RoleCodes = roleCodes,
                IsAdmin = isSuperuser || roleCodes.Any(),
                ActiveRoleCodes = activeRoleCodes
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

        /// <summary>
        /// Distinct people who currently hold at least one active assessor or
        /// reviewer assignment - what the "Reassign" modal's "Replace" (from)
        /// search should offer, since reassigning only makes sense starting from
        /// someone who actually holds an assignment (the "With" / to field stays
        /// on the full roster via GetITOpsEmployeeRoster).
        /// </summary>
        [GET("GetITOpsAssignedTeamMembers")]
        [ActionName("GetITOpsAssignedTeamMembers")]
        [HttpGet]
        public IHttpActionResult GetITOpsAssignedTeamMembers()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            // string.IsNullOrWhiteSpace doesn't translate to SQL under LINQ to
            // Entities - materialize with ToList() first, then apply that filter
            // in-memory.
            var empIds = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll().Where(a => a.ISACTIVE).Select(a => a.ASSESSOR_EMP_ID)
                .Concat(CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll().Where(r => r.ISACTIVE).Select(r => r.REVIEWER_EMP_ID))
                .ToList()
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Distinct()
                .ToList();
            if (!empIds.Any()) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var rows = Cldb.EMP_INFO.GetAll()
                .Where(e => empIds.Contains(e.EMP_ID) && e.DOR == null)
                .OrderBy(e => e.FRST_NM)
                .Select(e => new ITOPS_EmployeeRosterRow { EmpId = e.EMP_ID, Name = e.FRST_NM, Title = e.EMP_CSP_ROLE })
                .ToList();

            return Ok(rows);
        }

        // The IT Ops Superuser role is restricted to CSM SuperAdmins (see
        // IsCsmSuperAdmin/ValidateSuperuserGrantTargets) - this narrows the
        // roster down to just that set, for the last-Superuser replacement
        // picker (revoking the only remaining Superuser can only hand it to
        // someone eligible in the first place).
        [GET("GetITOpsCsmSuperAdmins")]
        [ActionName("GetITOpsCsmSuperAdmins")]
        [HttpGet]
        public IHttpActionResult GetITOpsCsmSuperAdmins()
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var superAdminIds = Cldb.AppRepo.GetSuperAdminEmpIds();
            if (!superAdminIds.Any()) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var rows = Cldb.EMP_INFO.GetAll()
                .Where(e => e.DOR == null && superAdminIds.Contains(e.EMP_ID))
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

            // Same "currently allocated" filter the rest of this Allocation System
            // uses everywhere else (AllSysController.cs, ~10 call sites) - BILL_FLG
            // matters here: without it this pulled in every historical resource row
            // that merely hasn't reached its END_DATE yet, not just people actually
            // billed/staffed on the project right now.
            var staffedEmpIds = Cldb.PROJECT_RESOURCE.GetAll()
                .Where(pr => ids.Contains(pr.PROJ_ID) && pr.BILL_FLG == true && pr.END_DATE >= DateTime.Now)
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

        // Standing assessee list for one project, set in Configure Scope's "New
        // mapping" modal alongside its domains rather than re-picked every cycle
        // in Configure Assessment.
        [GET("GetITOpsProjectAssessees")]
        [ActionName("GetITOpsProjectAssessees")]
        [HttpGet]
        public IHttpActionResult GetITOpsProjectAssessees(string projectId)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            if (string.IsNullOrWhiteSpace(projectId)) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var empIds = CSPdb.ITOPS_PROJECT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && a.PROJECT_ID == projectId.Trim())
                .Select(a => a.EMP_ID)
                .ToList();
            if (!empIds.Any()) return Ok(new List<ITOPS_EmployeeRosterRow>());

            var rows = Cldb.EMP_INFO.GetAll()
                .Where(e => empIds.Contains(e.EMP_ID) && e.DOR == null)
                .OrderBy(e => e.FRST_NM)
                .Select(e => new ITOPS_EmployeeRosterRow { EmpId = e.EMP_ID, Name = e.FRST_NM, Title = e.EMP_CSP_ROLE })
                .ToList();

            return Ok(rows);
        }

        // Replace semantics, same convention as SaveITOpsDomainProjectMapping:
        // EmpIds is the complete desired assessee set for the project.
        [POST("SaveITOpsProjectAssessees")]
        [ActionName("SaveITOpsProjectAssessees")]
        [HttpPost]
        public IHttpActionResult SaveITOpsProjectAssessees([FromBody] ITOPS_SaveProjectAssesseesRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_PROJECT_MAPPER", "change project assessees");
            if (denied != null) return denied;

            if (request == null || string.IsNullOrWhiteSpace(request.ProjectId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var projectId = request.ProjectId.Trim();
            var wanted = (request.EmpIds ?? new List<string>())
                .Where(id => !string.IsNullOrWhiteSpace(id))
                .Select(id => id.Trim())
                .Distinct()
                .ToList();
            var empId = GetHeaderDetails_String("empId");

            var existingRows = CSPdb.ITOPS_PROJECT_ASSESSEE.GetAll()
                .Where(a => a.PROJECT_ID == projectId)
                .ToList();

            foreach (var row in existingRows.Where(r => r.ISACTIVE && !wanted.Contains(r.EMP_ID)))
            {
                UpdateAuditFields(row, empId);
                row.ISACTIVE = false;
                CSPdb.ITOPS_PROJECT_ASSESSEE.Update(row);
            }

            foreach (var assesseeEmpId in wanted)
            {
                var existing = existingRows.FirstOrDefault(r => r.EMP_ID == assesseeEmpId);
                if (existing != null)
                {
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_PROJECT_ASSESSEE.Update(existing);
                }
                else
                {
                    var row = new ITOPS_PROJECT_ASSESSEE { PROJECT_ID = projectId, EMP_ID = assesseeEmpId };
                    UpdateAuditFields(row, empId);
                    CSPdb.ITOPS_PROJECT_ASSESSEE.Add(row);
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok();
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
            // Memoized per employee - IsITOpsSuperuser is a DB check, and the same
            // employee can appear on several assignment rows in this list.
            var superuserCache = new Dictionary<string, bool>();
            Func<string, bool> isSuperuser = id =>
            {
                if (string.IsNullOrWhiteSpace(id)) return false;
                bool cached;
                if (superuserCache.TryGetValue(id, out cached)) return cached;
                cached = IsITOpsSuperuser(id);
                superuserCache[id] = cached;
                return cached;
            };

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
                    Scope = isSuperuser(a.EMP_ID) ? "Org-wide" : "All allocated projects",
                    ScopeType = a.SCOPE_TYPE,
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
            var superuserCache = new Dictionary<string, bool>();
            Func<string, bool> isSuperuser = id =>
            {
                if (string.IsNullOrWhiteSpace(id)) return false;
                bool cached;
                if (superuserCache.TryGetValue(id, out cached)) return cached;
                cached = IsITOpsSuperuser(id);
                superuserCache[id] = cached;
                return cached;
            };

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
                    Scope = isSuperuser(a.EMP_ID) ? "Org-wide" : "All allocated projects",
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

            var superuserError = ValidateSuperuserGrantTargets(new[] { request.RoleId }, new[] { targetEmpId });
            if (superuserError != null) return Content(HttpStatusCode.Conflict, superuserError);

            var projectId = string.IsNullOrWhiteSpace(request.ProjectId) ? null : request.ProjectId.Trim();

            // Re-granting an identical (emp, role, scope) grant reactivates the existing
            // row rather than stacking duplicates - UpdateAuditFields sets ISACTIVE = true.
            var existing = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .FirstOrDefault(a => a.EMP_ID == targetEmpId && a.ROLE_ID == request.RoleId && a.PROJECT_ID == projectId);

            var scopeType = projectId == null ? ITOPS_SCOPE_ORG : ITOPS_SCOPE_PROJECT;
            if (existing != null)
            {
                existing.SCOPE_TYPE = scopeType;
                UpdateAuditFields(existing, callerEmpId);
                CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(existing);
            }
            else
            {
                existing = new ITOPS_ROLE_ASSIGNMENT
                {
                    ROLE_ID = request.RoleId,
                    EMP_ID = targetEmpId,
                    PROJECT_ID = projectId,
                    SCOPE_TYPE = scopeType
                };
                UpdateAuditFields(existing, callerEmpId);
                CSPdb.ITOPS_ROLE_ASSIGNMENT.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            NotifyITOpsRoleChange(
                targetEmpId,
                new List<KeyValuePair<string, string>> { new KeyValuePair<string, string>(role.ROLE_NAME, ITOpsScopeLabel(targetEmpId)) },
                callerEmpId, granted: true);

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

            var superuserError = ValidateSuperuserGrantTargets(activeRoleIds, targetEmpIds);
            if (superuserError != null) return Content(HttpStatusCode.Conflict, superuserError);

            // No projects picked = a single org-wide grant (PROJECT_ID = NULL) per role.
            var projectIds = (request.ProjectIds ?? new List<string>())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Distinct()
                .ToList();
            var scopeType = projectIds.Any() ? ITOPS_SCOPE_PROJECT : ITOPS_SCOPE_ORG;
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
                            existing.SCOPE_TYPE = scopeType;
                            UpdateAuditFields(existing, callerEmpId);
                            CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(existing);
                        }
                        else
                        {
                            var row = new ITOPS_ROLE_ASSIGNMENT
                            {
                                ROLE_ID = roleId,
                                EMP_ID = targetEmpId,
                                PROJECT_ID = projectId,
                                SCOPE_TYPE = scopeType
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

            // One email per EMPLOYEE listing every role just granted - the scope
            // label is keyed off THAT employee's own Superuser status, so it's
            // computed per recipient rather than once for the whole batch.
            foreach (var targetEmpId in targetEmpIds)
            {
                var grantScopeLabel = ITOpsScopeLabel(targetEmpId);
                var roleScopePairs = requestedRoles
                    .Select(role => new KeyValuePair<string, string>(role.ROLE_NAME, grantScopeLabel))
                    .ToList();
                NotifyITOpsRoleChange(targetEmpId, roleScopePairs, callerEmpId, granted: true);
            }

            return Ok(new { EmpIds = targetEmpIds, Granted = granted });
        }

        // Mixed-scope variant of GrantITOpsRoles for a single employee: each
        // entry carries its own role and its own scope (org-wide or a project
        // list), so e.g. "role A org-wide + role B on two projects" lands as
        // one call and one consolidated email, instead of the caller having to
        // issue one GrantITOpsRoles call per distinct scope.
        [POST("GrantITOpsRolesMulti")]
        [ActionName("GrantITOpsRolesMulti")]
        [HttpPost]
        public IHttpActionResult GrantITOpsRolesMulti([FromBody] ITOPS_GrantRolesMultiRequest request)
        {
            var targetEmpId = request?.EmpId?.Trim();
            var entries = (request?.Entries ?? new List<ITOPS_GrantRoleEntry>())
                .Where(e => e.RoleId > 0)
                .ToList();
            if (string.IsNullOrWhiteSpace(targetEmpId) || !entries.Any())
                return Content(HttpStatusCode.Conflict, "Pick an employee and at least one role.");

            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can grant IT Ops roles.");

            var roleIds = entries.Select(e => e.RoleId).Distinct().ToList();
            var requestedRoles = CSPdb.ITOPS_ROLE.GetAll()
                .Where(r => r.ISACTIVE && roleIds.Contains(r.ID))
                .ToList();
            var missing = roleIds.Where(id => !requestedRoles.Any(r => r.ID == id)).ToList();
            if (missing.Any())
                return Content(HttpStatusCode.Conflict, "One or more of the selected roles no longer exists.");

            var superuserError = ValidateSuperuserGrantTargets(roleIds, new List<string> { targetEmpId });
            if (superuserError != null) return Content(HttpStatusCode.Conflict, superuserError);

            var existingRows = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll()
                .Where(a => a.EMP_ID == targetEmpId)
                .ToList();

            var granted = 0;
            var roleScopePairs = new List<KeyValuePair<string, string>>();
            foreach (var entry in entries)
            {
                var role = requestedRoles.First(r => r.ID == entry.RoleId);
                var projectIds = (entry.ProjectIds ?? new List<string>())
                    .Where(p => !string.IsNullOrWhiteSpace(p))
                    .Select(p => p.Trim())
                    .Distinct()
                    .ToList();
                var entryScopeType = projectIds.Any() ? ITOPS_SCOPE_PROJECT : ITOPS_SCOPE_ORG;
                var scopes = projectIds.Any() ? projectIds : new List<string> { null };

                foreach (var projectId in scopes)
                {
                    var existing = existingRows
                        .FirstOrDefault(a => a.ROLE_ID == entry.RoleId && a.EMP_ID == targetEmpId && a.PROJECT_ID == projectId);

                    if (existing != null)
                    {
                        existing.SCOPE_TYPE = entryScopeType;
                        UpdateAuditFields(existing, callerEmpId);
                        CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(existing);
                    }
                    else
                    {
                        var row = new ITOPS_ROLE_ASSIGNMENT
                        {
                            ROLE_ID = entry.RoleId,
                            EMP_ID = targetEmpId,
                            PROJECT_ID = projectId,
                            SCOPE_TYPE = entryScopeType
                        };
                        UpdateAuditFields(row, callerEmpId);
                        CSPdb.ITOPS_ROLE_ASSIGNMENT.Add(row);
                        existingRows.Add(row);
                    }
                    granted++;
                }

                roleScopePairs.Add(new KeyValuePair<string, string>(role.ROLE_NAME, ITOpsScopeLabel(targetEmpId)));
            }

            CSPdb.Commit(CanCommit);

            NotifyITOpsRoleChange(targetEmpId, roleScopePairs, callerEmpId, granted: true);

            return Ok(new { EmpId = targetEmpId, Granted = granted });
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

            var roleName = CSPdb.ITOPS_ROLE.GetAll().FirstOrDefault(r => r.ID == assignment.ROLE_ID)?.ROLE_NAME ?? "role";
            var scopeLabel = ITOpsScopeLabel(assignment.EMP_ID);

            // UpdateAuditFieldsExt unconditionally sets ISACTIVE = true, so it must
            // run BEFORE the revocation or it silently stomps it back to active.
            UpdateAuditFields(assignment, callerEmpId);
            assignment.ISACTIVE = false;
            CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(assignment);
            CSPdb.Commit(CanCommit);

            NotifyITOpsRoleChange(
                assignment.EMP_ID,
                new List<KeyValuePair<string, string>> { new KeyValuePair<string, string>(roleName, scopeLabel) },
                callerEmpId, granted: false);

            return Ok();
        }

        // Bulk sibling of RevokeITOpsRole above, for the Revoke checklist modal:
        // one or more grants (possibly spanning several roles) removed in one
        // call, with ONE consolidated email per affected employee rather than
        // one email per grant.
        [POST("RevokeITOpsRoles")]
        [ActionName("RevokeITOpsRoles")]
        [HttpPost]
        public IHttpActionResult RevokeITOpsRoles([FromBody] ITOPS_RevokeRolesRequest request)
        {
            var ids = (request?.Ids ?? new List<int>()).Distinct().ToList();
            if (!ids.Any()) return Content(HttpStatusCode.Conflict, "Pick at least one role to revoke.");

            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
                return Content(HttpStatusCode.Forbidden, "Only a superuser can revoke IT Ops roles.");

            var assignments = CSPdb.ITOPS_ROLE_ASSIGNMENT.GetAll().Where(a => ids.Contains(a.ID)).ToList();
            if (!assignments.Any()) return NotFound();

            var roleNames = CSPdb.ITOPS_ROLE.GetAll()
                .ToList()
                .GroupBy(r => r.ID)
                .ToDictionary(g => g.Key, g => g.First().ROLE_NAME);

            foreach (var assignment in assignments)
            {
                // UpdateAuditFieldsExt unconditionally sets ISACTIVE = true, so it must
                // run BEFORE the revocation or it silently stomps it back to active.
                UpdateAuditFields(assignment, callerEmpId);
                assignment.ISACTIVE = false;
                CSPdb.ITOPS_ROLE_ASSIGNMENT.Update(assignment);
            }
            CSPdb.Commit(CanCommit);

            foreach (var empGroup in assignments.GroupBy(a => a.EMP_ID))
            {
                var roleScopePairs = empGroup
                    .Select(a => new KeyValuePair<string, string>(
                        roleNames.ContainsKey(a.ROLE_ID) ? roleNames[a.ROLE_ID] : "role",
                        ITOpsScopeLabel(a.EMP_ID)))
                    .ToList();
                NotifyITOpsRoleChange(empGroup.Key, roleScopePairs, callerEmpId, granted: false);
            }

            return Ok(new { Revoked = assignments.Count });
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

            // usp_ITOpsGetAssessmentCycles does the cycle x per-status-count join
            // and aggregation in one round trip (see ITOperationMaturity_V2_13);
            // this is a flat (cycle, status) row per group, folded back into the
            // nested shape the client expects.
            var flatRows = CSPdb.AppRepo.ITOpsGetAssessmentCycles();
            if (!flatRows.Any()) return Ok(new List<ITOPS_AssessmentCycleRow>());

            var rows = flatRows
                .GroupBy(r => r.CycleId)
                .Select(g =>
                {
                    var first = g.First();
                    var statusCounts = g
                        .Where(r => r.AssessmentStatus != null)
                        .Select(r => new ITOPS_CycleStatusCountRow { Status = r.AssessmentStatus, Count = r.StatusCount ?? 0 })
                        .ToList();
                    var total = statusCounts.Sum(s => s.Count);
                    var completed = statusCounts
                        .Where(s => s.Status == "Approved" || s.Status == "Closed")
                        .Sum(s => s.Count);

                    return new ITOPS_AssessmentCycleRow
                    {
                        Id = first.CycleId,
                        CycleLabel = first.CycleLabel,
                        StartDate = first.StartDate,
                        EndDate = first.EndDate,
                        Status = first.CycleStatus,
                        Description = first.Description,
                        AssessmentCount = total,
                        StatusCounts = statusCounts,
                        CompletedCount = completed,
                        CompletionPercent = total > 0 ? (int)Math.Round(completed * 100.0 / total) : 0
                    };
                })
                .OrderByDescending(r => r.StartDate)
                .ThenByDescending(r => r.Id)
                .ToList();

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
            var oldName = domain.NAME;
            domain.NAME = name;
            UpdateAuditFields(domain, empId);
            CSPdb.ITOPS_DOMAIN.Update(domain);
            CSPdb.Commit(CanCommit);

            if (!string.Equals(oldName, name, StringComparison.Ordinal))
                NotifyITOpsDomainRenamed(domain.ID, oldName, name);

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

            var empId = GetHeaderDetails_String("empId");

            // Scoped to the caller's own allocated projects, same as the main
            // CSM app's account/project dropdowns (GetCustomerIds /
            // GetAllProjectsForCustomer in AllSysController.cs, both backed by
            // usp_get_project_new / usp_get_projectIds): an admin only sees
            // customers/projects they're actually staffed on (PROJECT_RESOURCE)
            // or hold a management role on (AM/BUHead/DM/PM), not every
            // project org-wide. That SP already bypasses this for a
            // SuperAdmin/manager-tier CSM_TITLE_ID; ITOps Superusers get the
            // same full-visibility bypass here regardless of their CSM title,
            // since Superuser is this app's own equivalent top-level role.
            HashSet<string> allowedProjectIds = null;
            if (!IsITOpsSuperuser(empId))
            {
                allowedProjectIds = new HashSet<string>(
                    Cldb.AppRepo.GetProjectIdsForUser(empId, custId ?? "", "")
                        .Select(p => p.PROJ_ID)
                        .Where(id => id != null));
            }

            var projects = Cldb.PROJECT.GetAll().AsQueryable();
            if (!string.IsNullOrWhiteSpace(custId))
                projects = projects.Where(p => p.CUST_ID == custId);
            if (allowedProjectIds != null)
                projects = projects.Where(p => allowedProjectIds.Contains(p.PROJ_ID));

            var list = projects
                .Select(p => new { p.PROJ_ID, p.PROJ_NM, p.CUST_ID, p.PARENT_PROJ_ID, p.BUSINESS_UNIT, p.PROJ_STATUS })
                .ToList()
                .Where(p => p.PROJ_STATUS == null || p.PROJ_STATUS.ToLower() != "closed")
                .ToList();

            // A "child"/billing-line project under a hierarchy often has its own
            // CUST_ID left null, with only the root project (PARENT_PROJ_ID ==
            // PROJ_ID) carrying it - same pattern GetProjectList and several
            // other AllSysController lookups already rely on. Without this
            // fallback those child projects showed up with a null account name
            // (and dropped out of the Customer picker's grouping entirely).
            var parentIdsToResolve = list
                .Where(p => p.CUST_ID == null && !string.IsNullOrWhiteSpace(p.PARENT_PROJ_ID) && p.PARENT_PROJ_ID != p.PROJ_ID)
                .Select(p => p.PARENT_PROJ_ID)
                .Distinct()
                .ToList();
            var parentCustIds = parentIdsToResolve.Any()
                ? Cldb.PROJECT.GetAll()
                    .Where(p => parentIdsToResolve.Contains(p.PROJ_ID))
                    .Select(p => new { p.PROJ_ID, p.CUST_ID })
                    .ToList()
                    .Where(p => p.CUST_ID != null)
                    .GroupBy(p => p.PROJ_ID)
                    .ToDictionary(g => g.Key, g => g.First().CUST_ID)
                : new Dictionary<string, string>();

            var effectiveCustId = list.ToDictionary(
                p => p.PROJ_ID,
                p => p.CUST_ID ?? (p.PARENT_PROJ_ID != null && parentCustIds.ContainsKey(p.PARENT_PROJ_ID) ? parentCustIds[p.PARENT_PROJ_ID] : null));

            var custIds = effectiveCustId.Values.Where(c => c != null).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            var rows = list.Select(p =>
            {
                var resolvedCustId = effectiveCustId[p.PROJ_ID];
                return new ITOPS_ProjectRow
                {
                    ProjectId = p.PROJ_ID,
                    ProjectName = p.PROJ_NM,
                    CustId = resolvedCustId,
                    AccountName = resolvedCustId != null && accountNames.ContainsKey(resolvedCustId) ? accountNames[resolvedCustId] : null,
                    BusinessUnit = p.BUSINESS_UNIT
                };
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

            // usp_ITOpsGetDomainProjectMapDomains/Assessees do the CSPdb-side joins
            // (map x domain, project-scoped assessees) in one round trip each (see
            // ITOperationMaturity_V2_13). PROJECT/CUSTOMER/employee-name lookups
            // stay against Cldb here - it's a different physical SQL Server, so a
            // single SP can't join across both (see that script's header note).
            var normalizedProjectId = string.IsNullOrWhiteSpace(projectId) ? null : projectId;
            var domainRows = CSPdb.AppRepo.ITOpsGetDomainProjectMapDomains(normalizedProjectId);

            // Same project-allocation scoping as GetITOpsProjects: a non-Superuser
            // (e.g. a Scope Administrator/Domain-Project Mapper who isn't also a
            // Superuser) only ever sees mappings for projects they're actually
            // staffed on or hold a management role on, not every project org-wide.
            // Without this, this screen showed the whole org's mappings to anyone
            // holding the role, regardless of their own project allocation.
            var callerEmpId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(callerEmpId))
            {
                var allowedProjectIds = new HashSet<string>(
                    Cldb.AppRepo.GetProjectIdsForUser(callerEmpId, "", "")
                        .Select(p => p.PROJ_ID)
                        .Where(id => id != null));
                domainRows = domainRows.Where(m => allowedProjectIds.Contains(m.ProjectId)).ToList();
            }

            if (!domainRows.Any()) return Ok(new List<ITOPS_DomainProjectMappingRow>());

            var projectIds = domainRows.Select(m => m.ProjectId).Distinct().ToList();
            var projects = Cldb.PROJECT.GetAll()
                .Where(p => projectIds.Contains(p.PROJ_ID))
                .Select(p => new { p.PROJ_ID, p.PROJ_NM, p.CUST_ID, p.PARENT_PROJ_ID })
                .ToList()
                .GroupBy(p => p.PROJ_ID)
                .ToDictionary(g => g.Key, g => g.First());

            // Same hierarchy-child fallback as GetITOpsProjects: a project whose
            // own CUST_ID is null inherits it from its root project
            // (PARENT_PROJ_ID == PROJ_ID there) instead of showing a blank account.
            var parentIdsToResolve = projects.Values
                .Where(p => p.CUST_ID == null && !string.IsNullOrWhiteSpace(p.PARENT_PROJ_ID) && p.PARENT_PROJ_ID != p.PROJ_ID)
                .Select(p => p.PARENT_PROJ_ID)
                .Distinct()
                .ToList();
            var parentCustIds = parentIdsToResolve.Any()
                ? Cldb.PROJECT.GetAll()
                    .Where(p => parentIdsToResolve.Contains(p.PROJ_ID))
                    .Select(p => new { p.PROJ_ID, p.CUST_ID })
                    .ToList()
                    .Where(p => p.CUST_ID != null)
                    .GroupBy(p => p.PROJ_ID)
                    .ToDictionary(g => g.Key, g => g.First().CUST_ID)
                : new Dictionary<string, string>();
            var effectiveCustId = projects.ToDictionary(
                kv => kv.Key,
                kv => kv.Value.CUST_ID ?? (kv.Value.PARENT_PROJ_ID != null && parentCustIds.ContainsKey(kv.Value.PARENT_PROJ_ID) ? parentCustIds[kv.Value.PARENT_PROJ_ID] : null));

            var custIds = effectiveCustId.Values.Where(c => c != null).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .Select(c => new { c.CUST_ID, c.CUST_NM })
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            // Assessees, so the Domain-Project Mapping grid can show and search on
            // who's been set up for a project without a separate round trip.
            var assesseeRows = CSPdb.AppRepo.ITOpsGetDomainProjectMapAssessees(normalizedProjectId);
            var assesseeEmpNames = GetITOpsEmpNameMap(assesseeRows.Select(a => a.EmpId).ToList());

            var rows = domainRows
                .GroupBy(m => m.ProjectId)
                .Select(g =>
                {
                    var project = projects.ContainsKey(g.Key) ? projects[g.Key] : null;
                    var custId = effectiveCustId.ContainsKey(g.Key) ? effectiveCustId[g.Key] : null;

                    return new ITOPS_DomainProjectMappingRow
                    {
                        ProjectId = g.Key,
                        ProjectName = project != null ? project.PROJ_NM : null,
                        CustId = custId,
                        AccountName = custId != null && accountNames.ContainsKey(custId) ? accountNames[custId] : null,
                        Domains = g
                            .Select(m => new ITOPS_MappedDomainRow
                            {
                                MappingId = m.MappingId,
                                DomainId = m.DomainId,
                                DomainCode = m.DomainCode,
                                DomainName = m.DomainName
                            })
                            .OrderBy(d => d.DomainName)
                            .ToList(),
                        Assessees = assesseeRows
                            .Where(a => a.ProjectId == g.Key)
                            .Select(a => new ITOPS_ProjectAssesseeRow
                            {
                                EmpId = a.EmpId,
                                Name = assesseeEmpNames.ContainsKey(a.EmpId) ? assesseeEmpNames[a.EmpId] : a.EmpId
                            })
                            .OrderBy(a => a.Name)
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
            var empId = GetHeaderDetails_String("empId");

            var wanted = (request.DomainIds ?? new List<int>()).Distinct().ToList();

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
                LogDomainProjectMappingChange(projectId, row.DOMAIN_ID, "Removed", request.Reason, empId);
            }

            foreach (var domainId in wanted)
            {
                var existing = existingRows.FirstOrDefault(r => r.DOMAIN_ID == domainId);
                if (existing != null)
                {
                    var wasActive = existing.ISACTIVE;
                    // Reactivates a previously removed mapping (UpdateAuditFields sets ISACTIVE = true).
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_DOMAIN_PROJECT_MAP.Update(existing);
                    if (!wasActive) LogDomainProjectMappingChange(projectId, domainId, "Reactivated", request.Reason, empId);
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
                    LogDomainProjectMappingChange(projectId, domainId, "Added", request.Reason, empId);
                }
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // Fired once when the admin clicks "Submit and Continue to Configure
        // Assessment" on the mapping screen - sends ONE consolidated email
        // (see NotifyITOpsMappingSubmitted) instead of one per mapping edit.
        [POST("SubmitITOpsDomainProjectMappings")]
        [ActionName("SubmitITOpsDomainProjectMappings")]
        [HttpPost]
        public IHttpActionResult SubmitITOpsDomainProjectMappings([FromBody] ITOPS_SubmitMappingsRequest request)
        {
            var denied = DenyIfNotITOpsRole("DOMAIN_PROJECT_MAPPER", "submit domain-project mappings");
            if (denied != null) return denied;

            var projectIds = (request?.ProjectIds ?? new List<string>())
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Select(p => p.Trim())
                .Distinct()
                .ToList();

            var sent = NotifyITOpsMappingSubmitted(projectIds);
            return Ok(new { Sent = sent });
        }

        // Writes one append-only ITOPS_DOMAIN_PROJECT_MAP_AUDIT row per actual
        // state change. Not committed here - the caller's own CSPdb.Commit(...)
        // persists this alongside the mapping row change in the same transaction.
        private void LogDomainProjectMappingChange(string projectId, int domainId, string action, string reason, string empId)
        {
            var entry = new ITOPS_DOMAIN_PROJECT_MAP_AUDIT
            {
                PROJECT_ID = projectId,
                DOMAIN_ID = domainId,
                ACTION = action,
                REASON = string.IsNullOrWhiteSpace(reason) ? null : reason.Trim()
            };
            UpdateAuditFields(entry, empId);
            CSPdb.ITOPS_DOMAIN_PROJECT_MAP_AUDIT.Add(entry);

            // No per-change email here anymore - firing one for every single
            // add/remove read as spam while an admin was still iterating on a
            // project's domain set. NotifyITOpsMappingSubmitted sends ONE
            // consolidated email covering everything, triggered when the admin
            // clicks "Submit and Continue to Configure Assessment" instead.
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
                        if (existing.ISACTIVE)
                        {
                            unchanged++;
                        }
                        else
                        {
                            reactivated++;
                            LogDomainProjectMappingChange(projectId, domainId, "Reactivated", request.Reason, empId);
                        }
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
                        LogDomainProjectMappingChange(projectId, domainId, "Added", request.Reason, empId);
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
                LogDomainProjectMappingChange(projectId, row.DOMAIN_ID, "Removed", request.Reason, empId);
            }
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        // Full change history for Domain-Project Mapping, newest first. Reads
        // from the append-only audit log, not the mapping table itself, so a
        // domain that was removed and never re-added still shows here even
        // though it no longer appears in GetITOpsDomainProjectMappings.
        [GET("GetITOpsDomainProjectMappingHistory")]
        [ActionName("GetITOpsDomainProjectMappingHistory")]
        [HttpGet]
        public IHttpActionResult GetITOpsDomainProjectMappingHistory(string projectId = null)
        {
            var denied = DenyIfNotITOpsAdmin();
            if (denied != null) return denied;

            var filterProjectId = string.IsNullOrWhiteSpace(projectId) ? null : projectId.Trim();

            var entries = CSPdb.ITOPS_DOMAIN_PROJECT_MAP_AUDIT.GetAll()
                .Where(a => filterProjectId == null || a.PROJECT_ID == filterProjectId)
                .OrderByDescending(a => a.CREATED_DATE)
                .ToList();
            if (!entries.Any()) return Ok(new List<ITOPS_DomainProjectMapAuditRow>());

            var domainIds = entries.Select(a => a.DOMAIN_ID).Distinct().ToList();
            var domains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => domainIds.Contains(d.ID))
                .ToList()
                .GroupBy(d => d.ID)
                .ToDictionary(g => g.Key, g => g.First().NAME);

            var projectIds = entries.Select(a => a.PROJECT_ID).Distinct().ToList();
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

            var empNames = GetITOpsEmpNameMap(entries.Select(a => a.CREATED_BY).ToList());

            var rows = entries.Select(a =>
            {
                projects.TryGetValue(a.PROJECT_ID, out var project);
                var custId = project != null ? project.CUST_ID : null;
                return new ITOPS_DomainProjectMapAuditRow
                {
                    ProjectId = a.PROJECT_ID,
                    ProjectName = project != null ? project.PROJ_NM : null,
                    AccountName = custId != null && accountNames.ContainsKey(custId) ? accountNames[custId] : null,
                    DomainId = a.DOMAIN_ID,
                    DomainName = domains.ContainsKey(a.DOMAIN_ID) ? domains[a.DOMAIN_ID] : null,
                    Action = a.ACTION,
                    Reason = a.REASON,
                    ChangedBy = a.CREATED_BY,
                    ChangedByName = !string.IsNullOrWhiteSpace(a.CREATED_BY) && empNames.ContainsKey(a.CREATED_BY) ? empNames[a.CREATED_BY] : a.CREATED_BY,
                    ChangedDate = a.CREATED_DATE
                };
            }).ToList();

            return Ok(rows);
        }

        // ==================================================================
        // STEP 4 - Configure Assessment (bulk create for a project)
        // ==================================================================

        // Bulk sibling of GetOrCreateITOpsAssessment: one ITOPS_ASSESSMENT row
        // per (cycle, project, domain), each seeded with the domain's default
        // assessor/reviewer, plus the assessee set applied identically across
        // every one of them. Domains and assessees
        // are no longer supplied by the caller - each project reads its OWN
        // standing config (ITOPS_DOMAIN_PROJECT_MAP / ITOPS_PROJECT_ASSESSEE,
        // both set up in Configure Scope), so a project with nothing mapped
        // yet simply produces nothing here rather than being asked twice.
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

            var callerEmpId = GetHeaderDetails_String("empId");

            var masterId = request.AssessmentMasterId ?? request.CycleId ?? 0;
            var master = masterId > 0
                ? CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().FirstOrDefault(m => m.ID == masterId && m.ISACTIVE)
                : GetCurrentITOpsAssessmentMaster();
            if (master == null)
                return Content(HttpStatusCode.Conflict, "No open IT Ops Maturity assessment cycle exists. Create one in Configure Cycle first.");

            var allProjects = Cldb.PROJECT.GetAll()
                .Where(p => requestedProjectIds.Contains(p.PROJ_ID))
                .ToList();
            var missingProject = requestedProjectIds.FirstOrDefault(id => !allProjects.Any(p => p.PROJ_ID == id));
            if (missingProject != null) return NotFound();

            var mapsForProjects = CSPdb.ITOPS_DOMAIN_PROJECT_MAP.GetAll()
                .Where(m => m.ISACTIVE && requestedProjectIds.Contains(m.PROJECT_ID))
                .ToList();
            if (!mapsForProjects.Any())
                return Content(HttpStatusCode.Conflict,
                    "None of the selected project(s) have any domains mapped yet. Map them in Configure Scope first.");

            var allDomainIds = mapsForProjects.Select(m => m.DOMAIN_ID).Distinct().ToList();
            var allDomains = CSPdb.ITOPS_DOMAIN.GetAll()
                .Where(d => d.ISACTIVE && allDomainIds.Contains(d.ID))
                .ToList()
                .GroupBy(d => d.ID)
                .ToDictionary(g => g.Key, g => g.First());

            var assesseesForProjects = CSPdb.ITOPS_PROJECT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && requestedProjectIds.Contains(a.PROJECT_ID))
                .ToList();

            var empId = GetHeaderDetails_String("empId");
            var custIds = allProjects.Select(p => p.CUST_ID).Distinct().ToList();
            var accountNames = Cldb.CUSTOMER.GetAll()
                .Where(c => custIds.Contains(c.CUST_ID))
                .ToList()
                .GroupBy(c => c.CUST_ID)
                .ToDictionary(g => g.Key, g => g.First().CUST_NM);

            // When Pairs is given, each project only creates the specific domain(s)
            // requested for it, not everything mapped to it - e.g. a project with 2
            // mapped domains can have just one ticked in the Add staging screen,
            // leaving the other one staged/untouched instead of both being created.
            var requestedDomainIdsByProject = (request.Pairs ?? new List<ITOPS_CreateAssessmentPair>())
                .Where(p => !string.IsNullOrWhiteSpace(p.ProjectId))
                .GroupBy(p => p.ProjectId.Trim())
                .ToDictionary(g => g.Key, g => new HashSet<int>(g.Select(p => p.DomainId)));

            // Configure Assessment's Add/Stage/Create screen stages an Assessor/Reviewer per
            // (project, domain) row BEFORE this call - keyed here so a brand-new assessment can
            // be seeded with them in this same call, letting the "assessment(s) created" email
            // name them (and include them as recipients) without a separate AddITOpsAssessor/
            // AddITOpsReviewer round trip - and the "you've been assigned" email that round trip
            // used to also send, duplicating the one consolidated email below.
            var stagedTeamByPair = (request.Pairs ?? new List<ITOPS_CreateAssessmentPair>())
                .Where(p => !string.IsNullOrWhiteSpace(p.ProjectId))
                .ToDictionary(
                    p => p.ProjectId.Trim() + "|" + p.DomainId,
                    p => new Tuple<List<string>, List<string>>(p.AssessorIds ?? new List<string>(), p.ReviewerIds ?? new List<string>()));

            // Each project gets its OWN domain set (whatever is mapped to it in
            // Configure Scope, narrowed further by Pairs when given) and its OWN
            // assessee set - no longer forced to be identical across a
            // multi-project selection the way the old caller-supplied lists were.
            foreach (var project in allProjects)
            {
            var projectId = project.PROJ_ID;
            var accountName = project.CUST_ID != null && accountNames.ContainsKey(project.CUST_ID)
                ? accountNames[project.CUST_ID]
                : null;
            // Every domain CURRENTLY mapped to this project in Configure Scope, unrestricted by
            // Pairs - this is the set the "retire stale assessments" step below must compare
            // against. domainIds (Pairs-narrowed) says which domains THIS call should create;
            // it does NOT say which domains are still wanted overall, so reusing it for
            // retirement used to deactivate a project's earlier, separate submissions every
            // time a later submission for the same project ticked a narrower domain subset -
            // e.g. creating Citrix VDI today, then DR & BC tomorrow, silently retired today's
            // still-valid, still-mapped, Not Started Citrix VDI assessment.
            var currentlyMappedDomainIds = mapsForProjects.Where(m => m.PROJECT_ID == projectId).Select(m => m.DOMAIN_ID).Distinct().ToList();
            HashSet<int> requestedDomainIds;
            var domainIds = currentlyMappedDomainIds
                .Where(id => !requestedDomainIdsByProject.TryGetValue(projectId, out requestedDomainIds) || requestedDomainIds.Contains(id))
                .ToList();
            var domains = domainIds.Where(allDomains.ContainsKey).Select(id => allDomains[id]).ToList();
            var wantedAssessees = assesseesForProjects.Where(a => a.PROJECT_ID == projectId).Select(a => a.EMP_ID).Distinct().ToList();
            var assessmentIds = new List<int>();
            var newAssessments = new List<ITOPS_ASSESSMENT>();

            if (!domains.Any()) continue; // nothing mapped to this project - skip it rather than error the whole batch

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
                        try
                        {
                            CSPdb.Commit(CanCommit); // need the identity before the join rows can reference it
                        }
                        catch (Exception ex)
                        {
                            if (!IsUniqueViolation(ex)) throw;
                            // Same race as EnsureAssessmentsForAccount: the in-process
                            // lock only covers this worker process, so another process/
                            // server can still win the insert first. Detach so the change
                            // tracker drops the failed row, then re-fetch the one that
                            // actually landed instead of leaving this project's assessment
                            // list short an entry.
                            // EF6 special-cases Added -> Deleted as an immediate Detach (no
                            // DB round trip, since the row was never actually inserted).
                            CSPdb.ITOPS_ASSESSMENT.Delete(assessment);
                            assessment = CSPdb.ITOPS_ASSESSMENT.GetAll()
                                .FirstOrDefault(a => a.ISACTIVE
                                                  && a.ASSESSMENT_MASTER_ID == master.ID
                                                  && a.DOMAIN_ID == domain.ID
                                                  && a.PROJECT_ID == projectId);
                            if (assessment == null) continue; // shouldn't happen, but don't reference a null row below
                            assessmentIds.Add(assessment.ID);
                            continue;
                        }

                        // Deliberately NOT seeding the domain's DEFAULT assessor/reviewer here:
                        // this endpoint is the Configure Assessment staging flow, where the
                        // caller explicitly picks Assessor/Reviewer per row instead. Seeding
                        // defaults too used to leave BOTH the domain default and the staged pick
                        // as reviewers/assessors on the same assessment (e.g. a default reviewer
                        // plus whoever was staged). SeedITOpsDefaultOwners still fires from the
                        // scope-change auto-sync path, which has no staging UI to override it.
                        //
                        // The STAGED pick itself (stagedTeamByPair, built from request.Pairs
                        // above) IS seeded here, in this same call/transaction, instead of via a
                        // separate AddITOpsAssessor/AddITOpsReviewer round trip right after this
                        // returns - that used to fire its own "you've been assigned" email per
                        // person, duplicating the one consolidated "assessment(s) created" email
                        // built below (which now names the assessor/reviewer directly).
                        if (stagedTeamByPair.TryGetValue(projectId + "|" + domain.ID, out var stagedTeam))
                        {
                            foreach (var assessorEmpId in stagedTeam.Item1.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
                            {
                                var assessorRow = new ITOPS_ASSESSMENT_ASSESSOR { ASSESSMENT_ID = assessment.ID, ASSESSOR_EMP_ID = assessorEmpId };
                                UpdateAuditFields(assessorRow, empId);
                                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Add(assessorRow);
                            }
                            foreach (var reviewerEmpId in stagedTeam.Item2.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct())
                            {
                                var reviewerRow = new ITOPS_ASSESSMENT_REVIEWER { ASSESSMENT_ID = assessment.ID, REVIEWER_EMP_ID = reviewerEmpId };
                                UpdateAuditFields(reviewerRow, empId);
                                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Add(reviewerRow);
                            }
                        }
                        CSPdb.Commit(CanCommit);
                        newAssessments.Add(assessment);
                    }

                    assessmentIds.Add(assessment.ID);
                }

                // Apply the identical assessee set to every one of this project's
                // assessments in this cycle - including ones created by an earlier
                // call - so "assessees are project-wide" holds even across re-runs.
                var priorActiveAssesseeIds = new List<string>();
                if (assessmentIds.Any())
                {
                    var existingAssessees = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                        .Where(a => assessmentIds.Contains(a.ASSESSMENT_ID))
                        .ToList();
                    // Snapshot before the mutation loop below flips ISACTIVE, so the
                    // "assessee list updated" email (below) can report what actually
                    // changed rather than just the final set.
                    priorActiveAssesseeIds = existingAssessees.Where(r => r.ISACTIVE).Select(r => r.ASSESSEE_EMP_ID).Distinct().ToList();

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

                // ONE consolidated email per project covering every domain newly created in
                // this call, with ONE TABLE ROW PER ASSESSMENT (i.e. per domain) - a project
                // with several new domains can have a different assessor/reviewer on each, so
                // each domain's row shows only ITS OWN assessor/reviewer rather than merging
                // every domain's people into one shared cell. EVERYONE (assessees, every
                // assessor/reviewer just seeded on these new assessments, and the project's
                // Quality SPOC "Dex Partner" / DP (PROJ_DM_EMP_ID) / PM (PROJ_PM_EMP_ID) / CSM
                // (DP_ID)) is on the To line - no Cc split. The shared platform mailbox is still
                // Cc'd automatically by SendITOpsNotificationEmailToMany (see
                // GetITOpsPlatformCcEmails). The bell still logs one row per new assessment for
                // the assessees (so the in-app count matches reality); it doesn't send its own
                // separate email for anyone, since the assessor(s)/reviewer(s) were seeded
                // directly above instead of via a separate AddITOpsAssessor/AddITOpsReviewer
                // call that would have sent one.
                if (newAssessments.Any() && wantedAssessees.Any())
                {
                    var newAssessmentIds = newAssessments.Select(a => a.ID).ToList();

                    // The assessment rows (and their staged assessor/reviewer) are already saved
                    // by this point - a template-file read failure here must never fail the
                    // whole create action, and must not skip the bell notifications below either
                    // (kept outside this try, same pattern as NotifyITOpsTeamAssignmentBulk).
                    try
                    {
                        // Per-ASSESSMENT (i.e. per domain), not merged across the whole project -
                        // a project with several new domains can have a different assessor/reviewer
                        // on each one (that's the whole point of staging them per row in Configure
                        // Assessment), so lumping every domain's people into one shared cell would
                        // misrepresent who owns which domain.
                        var assessorRowsByAssessment = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                            .Where(a => a.ISACTIVE && newAssessmentIds.Contains(a.ASSESSMENT_ID))
                            .ToList();
                        var reviewerRowsByAssessment = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                            .Where(r => r.ISACTIVE && newAssessmentIds.Contains(r.ASSESSMENT_ID))
                            .ToList();

                        var assessseeNamesJoined = string.Join(", ", GetEmpNames(wantedAssessees));
                        var tableRows = newAssessments
                            .OrderBy(a => allDomains.ContainsKey(a.DOMAIN_ID) ? allDomains[a.DOMAIN_ID].NAME : "")
                            .Select((a, idx) =>
                            {
                                var assessorNamesForThis = GetEmpNames(assessorRowsByAssessment
                                    .Where(x => x.ASSESSMENT_ID == a.ID).Select(x => x.ASSESSOR_EMP_ID).Distinct().ToList());
                                var reviewerNamesForThis = GetEmpNames(reviewerRowsByAssessment
                                    .Where(x => x.ASSESSMENT_ID == a.ID).Select(x => x.REVIEWER_EMP_ID).Distinct().ToList());
                                return helper.GetEmailContent("ITOpsAssessmentsCreatedRow.htm", ToEmailValues(new
                                {
                                    SNo = idx + 1,
                                    AccountName = accountName ?? "-",
                                    ProjectName = project.PROJ_NM ?? projectId,
                                    DomainName = allDomains.ContainsKey(a.DOMAIN_ID) ? allDomains[a.DOMAIN_ID].NAME : "domain",
                                    AssesseeNames = assessseeNamesJoined,
                                    AssessorNames = string.Join(", ", assessorNamesForThis),
                                    ReviewerNames = string.Join(", ", reviewerNamesForThis)
                                }));
                            });
                        var rowsHtml = string.Join("", tableRows);

                        // "Dex Partner" (PROJECT.QUALITY_SPOC), "DP" (PROJECT.PROJ_DM_EMP_ID),
                        // "PM" (PROJECT.PROJ_PM_EMP_ID), and "CSM" (PROJECT.DP_ID) - the project's
                        // own ownership fields, same four added to NotifyITOpsAssesseesUpdated below.
                        var ownerIds = new List<string>();
                        if (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC)) ownerIds.Add(project.QUALITY_SPOC);
                        if (!string.IsNullOrWhiteSpace(project.PROJ_DM_EMP_ID)) ownerIds.Add(project.PROJ_DM_EMP_ID);
                        if (!string.IsNullOrWhiteSpace(project.PROJ_PM_EMP_ID)) ownerIds.Add(project.PROJ_PM_EMP_ID);
                        if (!string.IsNullOrWhiteSpace(project.DP_ID)) ownerIds.Add(project.DP_ID);

                        var allRecipientIds = wantedAssessees
                            .Concat(assessorRowsByAssessment.Select(x => x.ASSESSOR_EMP_ID))
                            .Concat(reviewerRowsByAssessment.Select(x => x.REVIEWER_EMP_ID))
                            .Concat(ownerIds)
                            .Where(id => !string.IsNullOrWhiteSpace(id))
                            .Distinct()
                            .ToList();

                        SendITOpsNotificationEmailToMany(
                            allRecipientIds,
                            $"IT Ops Maturity: assessment(s) created for {project.PROJ_NM ?? projectId}",
                            "ITOpsAssessmentsCreated.htm",
                            ToEmailValues(new
                            {
                                CycleLabel = master.CYCLE_LABEL,
                                RowsHtml = rowsHtml
                            }));
                    }
                    catch (Exception ex)
                    {
                        LogRequest(ex, "ITOpsMaturity:NotifyITOpsAssessmentsCreated:" + projectId);
                    }

                    foreach (var assesseeEmpId in wantedAssessees)
                    {
                        foreach (var newAssessment in newAssessments)
                        {
                            CreateITOpsNotification(
                                assesseeEmpId, "AssessmentsCreated", newAssessment.ID, null,
                                $"{(allDomains.ContainsKey(newAssessment.DOMAIN_ID) ? allDomains[newAssessment.DOMAIN_ID].NAME : "domain")} assessment created for {project.PROJ_NM ?? projectId}, cycle {master.CYCLE_LABEL}.");
                        }
                    }
                }
                else if (assessmentIds.Any())
                {
                    // No brand-new assessment was created this call (e.g. the "Update
                    // assessees" / Save & sync action on a project that's already been
                    // assessed) - the assessee roster on its existing assessments can
                    // still have changed, and that has no other email covering it, so
                    // report it here instead of staying silent.
                    var addedAssessees = wantedAssessees.Except(priorActiveAssesseeIds).ToList();
                    var removedAssessees = priorActiveAssesseeIds.Except(wantedAssessees).ToList();
                    if (addedAssessees.Any() || removedAssessees.Any())
                    {
                        // The assessee roster change is already saved by this point - a
                        // template-file read failure here must never fail the whole save,
                        // and must not skip the stale-assessment retirement step below either.
                        try
                        {
                            var changeLines = new List<string>();
                            if (addedAssessees.Any())
                                changeLines.Add(helper.GetEmailContent("ITOpsMappingAddedLine.htm", ToEmailValues(new { Names = string.Join(", ", GetEmpNames(addedAssessees)) })));
                            if (removedAssessees.Any())
                                changeLines.Add(helper.GetEmailContent("ITOpsMappingRemovedLine.htm", ToEmailValues(new { Names = string.Join(", ", GetEmpNames(removedAssessees)) })));

                            var ccEmpIds = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                                .Where(a => a.ISACTIVE && assessmentIds.Contains(a.ASSESSMENT_ID))
                                .Select(a => a.ASSESSOR_EMP_ID)
                                .Concat(CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                                    .Where(r => r.ISACTIVE && assessmentIds.Contains(r.ASSESSMENT_ID))
                                    .Select(r => r.REVIEWER_EMP_ID))
                                .ToList();
                            // "Dex Partner" / "DP" / "PM" / "CSM" - same four fields as the
                            // "assessments created" branch above.
                            if (!string.IsNullOrWhiteSpace(project.QUALITY_SPOC)) ccEmpIds.Add(project.QUALITY_SPOC);
                            if (!string.IsNullOrWhiteSpace(project.PROJ_DM_EMP_ID)) ccEmpIds.Add(project.PROJ_DM_EMP_ID);
                            if (!string.IsNullOrWhiteSpace(project.PROJ_PM_EMP_ID)) ccEmpIds.Add(project.PROJ_PM_EMP_ID);
                            if (!string.IsNullOrWhiteSpace(project.DP_ID)) ccEmpIds.Add(project.DP_ID);
                            ccEmpIds = ccEmpIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToList();

                            // To both the current and the just-removed assessees, so someone
                            // taken off the project still finds out rather than only the
                            // people who remain on it.
                            var toEmpIds = wantedAssessees.Concat(removedAssessees).Distinct().ToList();

                            SendITOpsNotificationEmailWithCc(
                                toEmpIds,
                                ccEmpIds,
                                $"IT Ops Maturity: assessee list updated for {project.PROJ_NM ?? projectId}",
                                "ITOpsAssesseesUpdated.htm",
                                ToEmailValues(new
                                {
                                    AccountName = accountName ?? "-",
                                    ProjectName = project.PROJ_NM ?? projectId,
                                    ChangeLines = string.Join("", changeLines)
                                }));
                        }
                        catch (Exception ex)
                        {
                            LogRequest(ex, "ITOpsMaturity:NotifyITOpsAssesseesUpdated:" + projectId);
                        }
                    }
                }

                // Retire assessments for domains that are no longer mapped to this project in
                // Configure Scope AT ALL - e.g. the admin unmapped a domain there since the last
                // Create. Deliberately compares against currentlyMappedDomainIds (the project's
                // FULL current mapping), not domainIds (narrowed to just this call's ticked
                // Pairs) - a domain merely left unticked in THIS submission (because it was
                // already created by an earlier, separate one, or is still staged for later)
                // must not be treated as "no longer wanted" and retired. Only NotStarted
                // assessments are retired: one with real work already on it (scored/submitted/
                // approved/findings) is left alone rather than silently discarded - the admin
                // can deactivate it deliberately elsewhere if that's genuinely what they want.
                var staleAssessments = CSPdb.ITOPS_ASSESSMENT.GetAll()
                    .Where(a => a.ISACTIVE
                             && a.ASSESSMENT_MASTER_ID == master.ID
                             && a.PROJECT_ID == projectId
                             && !currentlyMappedDomainIds.Contains(a.DOMAIN_ID)
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

            var rows = BuildITOpsCycleAssessmentRows(cycleId, projectId);

            // Same project-allocation scoping as GetITOpsProjects: a non-Superuser
            // only sees rows for projects they're actually staffed on or hold a
            // management role on, not every project's assessments in the cycle.
            // Feeds both Step 4's "Assessments in this cycle" table and Step 5's
            // domain-team accordion (both call this same endpoint).
            var empId = GetHeaderDetails_String("empId");
            if (!IsITOpsSuperuser(empId))
            {
                var allowedProjectIds = new HashSet<string>(
                    Cldb.AppRepo.GetProjectIdsForUser(empId, "", "")
                        .Select(p => p.PROJ_ID)
                        .Where(id => id != null));
                rows = rows.Where(r => r.ProjectId != null && allowedProjectIds.Contains(r.ProjectId)).ToList();
            }

            return Ok(rows);
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
                    .Concat(assesseeRows.Select(x => x.ASSESSEE_EMP_ID))
                    .ToList());
            Func<string, string> nameOf = id => id != null && empNames.ContainsKey(id) ? empNames[id] : id;

            return assessments.Select(a =>
            {
                var assessorIds = assessorRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderBy(x => x.ID).Select(x => x.ASSESSOR_EMP_ID).ToList();
                var reviewerIds = reviewerRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderBy(x => x.ID).Select(x => x.REVIEWER_EMP_ID).ToList();
                var assesseeIds = assesseeRows.Where(x => x.ASSESSMENT_ID == a.ID)
                    .OrderBy(x => x.ID).Select(x => x.ASSESSEE_EMP_ID).ToList();

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
                    AssesseeCount = assesseeIds.Count,
                    AssessorNames = assessorIds.Select(nameOf).ToList(),
                    ReviewerNames = reviewerIds.Select(nameOf).ToList(),
                    AssesseeNames = assesseeIds.Select(nameOf).ToList(),
                    Status = a.STATUS
                };
            })
            .OrderBy(r => r.ProjectName)
            .ThenBy(r => r.DomainName)
            .ToList();
        }

        // Deliberately restricted to Not Started assessments: once any scoring,
        // review, or findings work has begun, removing the row would silently
        // destroy that work with no trace - the admin should retarget/reassign
        // instead. A domain removed from Configure Scope after assessments exist
        // does NOT auto-remove them, for the same reason.
        [POST("RemoveITOpsAssessment")]
        [ActionName("RemoveITOpsAssessment")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsAssessment(int assessmentId)
        {
            var denied = DenyIfNotITOpsRole("RUNOPS_INITIATOR", "remove assessments");
            if (denied != null) return denied;

            var assessment = CSPdb.ITOPS_ASSESSMENT.GetAll().FirstOrDefault(a => a.ID == assessmentId && a.ISACTIVE);
            if (assessment == null) return Ok();

            if (!string.Equals(assessment.STATUS, "NotStarted", StringComparison.OrdinalIgnoreCase))
                return Content(HttpStatusCode.Conflict, "Only a Not Started assessment can be removed - it already has scoring, review, or findings history.");

            var empId = GetHeaderDetails_String("empId");
            UpdateAuditFields(assessment, empId);
            assessment.ISACTIVE = false;
            CSPdb.ITOPS_ASSESSMENT.Update(assessment);
            CSPdb.Commit(CanCommit);

            NotifyITOpsAssessmentRemoved(assessment);

            return Ok();
        }

        /// <summary>
        /// One email for a single removed (Not Started) assessment - to whoever
        /// was already on it (its assessees, assessor, reviewer) plus the
        /// project's Quality SPOC, same Cc convention as
        /// NotifyITOpsAssessmentsCreated/NotifyITOpsAssesseesUpdated.
        /// </summary>
        private void NotifyITOpsAssessmentRemoved(ITOPS_ASSESSMENT assessment)
        {
            var project = Cldb.PROJECT.GetAll().FirstOrDefault(p => p.PROJ_ID == assessment.PROJECT_ID);
            var domainName = CSPdb.ITOPS_DOMAIN.GetAll().FirstOrDefault(d => d.ID == assessment.DOMAIN_ID)?.NAME ?? "domain";
            var projectName = project?.PROJ_NM ?? assessment.PROJECT_ID;
            var cycleLabel = CSPdb.ITOPS_ASSESSMENT_MASTER.GetAll().FirstOrDefault(m => m.ID == assessment.ASSESSMENT_MASTER_ID)?.CYCLE_LABEL;
            var accountName = project?.CUST_ID != null
                ? Cldb.CUSTOMER.GetAll().FirstOrDefault(c => c.CUST_ID == project.CUST_ID)?.CUST_NM
                : null;

            var toEmpIds = CSPdb.ITOPS_ASSESSMENT_ASSESSEE.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessment.ID)
                .Select(a => a.ASSESSEE_EMP_ID)
                .Distinct()
                .ToList();
            if (!toEmpIds.Any()) return; // no one to tell

            var ccEmpIds = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => a.ISACTIVE && a.ASSESSMENT_ID == assessment.ID)
                .Select(a => a.ASSESSOR_EMP_ID)
                .Concat(CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                    .Where(r => r.ISACTIVE && r.ASSESSMENT_ID == assessment.ID)
                    .Select(r => r.REVIEWER_EMP_ID))
                .ToList();
            if (project != null && !string.IsNullOrWhiteSpace(project.QUALITY_SPOC)) ccEmpIds.Add(project.QUALITY_SPOC);
            ccEmpIds = ccEmpIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().Except(toEmpIds).ToList();

            SendITOpsNotificationEmailWithCc(
                toEmpIds,
                ccEmpIds,
                $"IT Ops Maturity: {domainName} assessment removed for {projectName}",
                "ITOpsAssessmentRemoved.htm",
                ToEmailValues(new
                {
                    AccountName = accountName ?? "-",
                    ProjectName = projectName,
                    DomainName = domainName,
                    CycleLabel = cycleLabel
                }));
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

            // usp_ITOpsGetAssessmentTeam unions assessor/reviewer/assessee in one
            // round trip, tagged by RoleType (see ITOperationMaturity_V2_13).
            var flatRows = CSPdb.AppRepo.ITOpsGetAssessmentTeam(assessmentId);

            var empNames = GetITOpsEmpNameMap(flatRows.Select(r => r.EmpId).ToList());
            Func<string, string> nameOf = id => id != null && empNames.ContainsKey(id) ? empNames[id] : id;

            Func<string, List<ITOPS_TeamMemberRow>> toRows = roleType => flatRows
                .Where(r => r.RoleType == roleType)
                .OrderBy(r => r.ID)
                .Select(r => new ITOPS_TeamMemberRow
                {
                    Id = r.ID,
                    AssessmentId = r.AssessmentId,
                    EmpId = r.EmpId,
                    EmpName = nameOf(r.EmpId)
                })
                .ToList();

            return Ok(new
            {
                AssessmentId = assessmentId,
                Assessors = toRows("Assessor"),
                Reviewers = toRows("Reviewer"),
                Assessees = toRows("Assessee")
            });
        }

        [POST("AddITOpsAssessor")]
        [ActionName("AddITOpsAssessor")]
        [HttpPost]
        public IHttpActionResult AddITOpsAssessor([FromBody] ITOPS_AddTeamMemberRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "assign assessors");
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

            // Every assessor on a domain is an equal owner now - no primary/backup
            // distinction, so this is just add-or-reactivate.
            var existing = rows.FirstOrDefault(a => a.ASSESSOR_EMP_ID == targetEmpId);
            if (existing != null)
            {
                // UpdateAuditFields sets ISACTIVE = true, which re-adds a previously removed assessor.
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(existing);
            }
            else
            {
                existing = new ITOPS_ASSESSMENT_ASSESSOR
                {
                    ASSESSMENT_ID = request.AssessmentId,
                    ASSESSOR_EMP_ID = targetEmpId
                };
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            NotifyITOpsTeamAssignment(assessment, "Assessor", targetEmpId);

            return Ok(new ITOPS_TeamMemberRow
            {
                Id = existing.ID,
                AssessmentId = existing.ASSESSMENT_ID,
                EmpId = existing.ASSESSOR_EMP_ID,
                EmpName = GetEmpName(existing.ASSESSOR_EMP_ID)
            });
        }

        /// <summary>
        /// Adds one person to every listed assessment as assessor, in one call -
        /// this is what the domain-level "Add" picker uses so assigning someone
        /// to a domain that's mapped to N projects sends ONE consolidated email
        /// (NotifyITOpsTeamAssignmentBulk) instead of N separate ones.
        /// </summary>
        [POST("AddITOpsAssessorsBulk")]
        [ActionName("AddITOpsAssessorsBulk")]
        [HttpPost]
        public IHttpActionResult AddITOpsAssessorsBulk([FromBody] ITOPS_AddTeamMemberBulkRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "assign assessors");
            if (denied != null) return denied;

            var assessmentIds = (request?.AssessmentIds ?? new List<int>()).Distinct().ToList();
            if (!assessmentIds.Any() || string.IsNullOrWhiteSpace(request?.EmpId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var targetEmpId = request.EmpId.Trim();
            var empId = GetHeaderDetails_String("empId");

            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID) && a.ISACTIVE).ToList();
            if (!assessments.Any()) return NotFound();

            var existingRows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll()
                .Where(a => assessmentIds.Contains(a.ASSESSMENT_ID))
                .ToList();

            var entities = new List<ITOPS_ASSESSMENT_ASSESSOR>();
            foreach (var assessment in assessments)
            {
                var existing = existingRows.FirstOrDefault(a => a.ASSESSMENT_ID == assessment.ID && a.ASSESSOR_EMP_ID == targetEmpId);
                if (existing != null)
                {
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(existing);
                }
                else
                {
                    existing = new ITOPS_ASSESSMENT_ASSESSOR { ASSESSMENT_ID = assessment.ID, ASSESSOR_EMP_ID = targetEmpId };
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Add(existing);
                }
                entities.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            var created = entities.Select(e => new ITOPS_TeamMemberRow
            {
                Id = e.ID,
                AssessmentId = e.ASSESSMENT_ID,
                EmpId = e.ASSESSOR_EMP_ID,
                EmpName = GetEmpName(e.ASSESSOR_EMP_ID)
            }).ToList();

            NotifyITOpsTeamAssignmentBulk(assessments.Select(a => Tuple.Create(a, "Assessor")).ToList(), targetEmpId);

            return Ok(created);
        }

        [POST("RemoveITOpsAssessor")]
        [ActionName("RemoveITOpsAssessor")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsAssessor(int id)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "remove assessors");
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

        /// <summary>
        /// Removes one person from every listed assessor row in one call and
        /// sends ONE consolidated "removed" email (NotifyITOpsTeamAssignmentBulk)
        /// - the "Remove" action on a domain's team member removes them from
        /// every project under that domain at once, so this is the vice-versa of
        /// AddITOpsAssessorsBulk.
        /// </summary>
        [POST("RemoveITOpsAssessorsBulk")]
        [ActionName("RemoveITOpsAssessorsBulk")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsAssessorsBulk([FromBody] ITOPS_RemoveTeamMemberBulkRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "remove assessors");
            if (denied != null) return denied;

            var ids = (request?.Ids ?? new List<int>()).Distinct().ToList();
            if (!ids.Any()) return Ok();

            var rows = CSPdb.ITOPS_ASSESSMENT_ASSESSOR.GetAll().Where(a => ids.Contains(a.ID) && a.ISACTIVE).ToList();
            if (!rows.Any()) return Ok();

            var empId = GetHeaderDetails_String("empId");
            var targetEmpId = rows.First().ASSESSOR_EMP_ID;
            var assessmentIds = rows.Select(r => r.ASSESSMENT_ID).Distinct().ToList();
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID)).ToList().ToDictionary(a => a.ID);

            var notifyItems = new List<Tuple<ITOPS_ASSESSMENT, string>>();
            foreach (var row in rows)
            {
                UpdateAuditFields(row, empId);
                row.ISACTIVE = false;
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                if (assessments.ContainsKey(row.ASSESSMENT_ID)) notifyItems.Add(Tuple.Create(assessments[row.ASSESSMENT_ID], "Assessor"));
            }
            CSPdb.Commit(CanCommit);

            NotifyITOpsTeamAssignmentBulk(notifyItems, targetEmpId, "Removed");

            return Ok();
        }

        [POST("AddITOpsReviewer")]
        [ActionName("AddITOpsReviewer")]
        [HttpPost]
        public IHttpActionResult AddITOpsReviewer([FromBody] ITOPS_AddTeamMemberRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "assign reviewers");
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

            // Every reviewer on a domain is an equal owner now - no primary/backup
            // distinction, so this is just add-or-reactivate.
            var existing = rows.FirstOrDefault(r => r.REVIEWER_EMP_ID == targetEmpId);
            if (existing != null)
            {
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(existing);
            }
            else
            {
                existing = new ITOPS_ASSESSMENT_REVIEWER
                {
                    ASSESSMENT_ID = request.AssessmentId,
                    REVIEWER_EMP_ID = targetEmpId
                };
                UpdateAuditFields(existing, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            NotifyITOpsTeamAssignment(assessment, "Reviewer", targetEmpId);

            return Ok(new ITOPS_TeamMemberRow
            {
                Id = existing.ID,
                AssessmentId = existing.ASSESSMENT_ID,
                EmpId = existing.REVIEWER_EMP_ID,
                EmpName = GetEmpName(existing.REVIEWER_EMP_ID)
            });
        }

        /// <summary>Same as AddITOpsAssessorsBulk, but for reviewers.</summary>
        [POST("AddITOpsReviewersBulk")]
        [ActionName("AddITOpsReviewersBulk")]
        [HttpPost]
        public IHttpActionResult AddITOpsReviewersBulk([FromBody] ITOPS_AddTeamMemberBulkRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "assign reviewers");
            if (denied != null) return denied;

            var assessmentIds = (request?.AssessmentIds ?? new List<int>()).Distinct().ToList();
            if (!assessmentIds.Any() || string.IsNullOrWhiteSpace(request?.EmpId))
                return Content(HttpStatusCode.Conflict, ERROR_MSG);

            var targetEmpId = request.EmpId.Trim();
            var empId = GetHeaderDetails_String("empId");

            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID) && a.ISACTIVE).ToList();
            if (!assessments.Any()) return NotFound();

            var existingRows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll()
                .Where(r => assessmentIds.Contains(r.ASSESSMENT_ID))
                .ToList();

            var entities = new List<ITOPS_ASSESSMENT_REVIEWER>();
            foreach (var assessment in assessments)
            {
                var existing = existingRows.FirstOrDefault(r => r.ASSESSMENT_ID == assessment.ID && r.REVIEWER_EMP_ID == targetEmpId);
                if (existing != null)
                {
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(existing);
                }
                else
                {
                    existing = new ITOPS_ASSESSMENT_REVIEWER { ASSESSMENT_ID = assessment.ID, REVIEWER_EMP_ID = targetEmpId };
                    UpdateAuditFields(existing, empId);
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Add(existing);
                }
                entities.Add(existing);
            }
            CSPdb.Commit(CanCommit);

            var created = entities.Select(e => new ITOPS_TeamMemberRow
            {
                Id = e.ID,
                AssessmentId = e.ASSESSMENT_ID,
                EmpId = e.REVIEWER_EMP_ID,
                EmpName = GetEmpName(e.REVIEWER_EMP_ID)
            }).ToList();

            NotifyITOpsTeamAssignmentBulk(assessments.Select(a => Tuple.Create(a, "Reviewer")).ToList(), targetEmpId);

            return Ok(created);
        }

        [POST("RemoveITOpsReviewer")]
        [ActionName("RemoveITOpsReviewer")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsReviewer(int id)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "remove reviewers");
            if (denied != null) return denied;

            var row = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll().FirstOrDefault(r => r.ID == id);
            if (row == null) return NotFound();

            UpdateAuditFields(row, GetHeaderDetails_String("empId"));
            row.ISACTIVE = false;
            CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
            CSPdb.Commit(CanCommit);

            return Ok();
        }

        /// <summary>Same as RemoveITOpsAssessorsBulk, but for reviewers.</summary>
        [POST("RemoveITOpsReviewersBulk")]
        [ActionName("RemoveITOpsReviewersBulk")]
        [HttpPost]
        public IHttpActionResult RemoveITOpsReviewersBulk([FromBody] ITOPS_RemoveTeamMemberBulkRequest request)
        {
            var denied = DenyIfNotAnyITOpsRole(new[] { "RUNOPS_INITIATOR", "TEAM_ASSIGNMENT_COORDINATOR" }, "remove reviewers");
            if (denied != null) return denied;

            var ids = (request?.Ids ?? new List<int>()).Distinct().ToList();
            if (!ids.Any()) return Ok();

            var rows = CSPdb.ITOPS_ASSESSMENT_REVIEWER.GetAll().Where(r => ids.Contains(r.ID) && r.ISACTIVE).ToList();
            if (!rows.Any()) return Ok();

            var empId = GetHeaderDetails_String("empId");
            var targetEmpId = rows.First().REVIEWER_EMP_ID;
            var assessmentIds = rows.Select(r => r.ASSESSMENT_ID).Distinct().ToList();
            var assessments = CSPdb.ITOPS_ASSESSMENT.GetAll().Where(a => assessmentIds.Contains(a.ID)).ToList().ToDictionary(a => a.ID);

            var notifyItems = new List<Tuple<ITOPS_ASSESSMENT, string>>();
            foreach (var row in rows)
            {
                UpdateAuditFields(row, empId);
                row.ISACTIVE = false;
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                if (assessments.ContainsKey(row.ASSESSMENT_ID)) notifyItems.Add(Tuple.Create(assessments[row.ASSESSMENT_ID], "Reviewer"));
            }
            CSPdb.Commit(CanCommit);

            NotifyITOpsTeamAssignmentBulk(notifyItems, targetEmpId, "Removed");

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

        /// <summary>Maps one usp_ITOpsGetCategoriesForDomain row straight across - the proc already computed IsCurrent/ParameterCount/VersionCount.</summary>
        private static ITOPS_CategoryRow ToITOpsCategoryRow(ITOpsCategoryForDomainSpRow r)
        {
            return new ITOPS_CategoryRow
            {
                CategoryId = r.CategoryId,
                DomainId = r.DomainId,
                Name = r.Name,
                DisplayOrder = r.DisplayOrder,
                StartDate = r.StartDate,
                EndDate = r.EndDate,
                IsCurrent = r.IsCurrent,
                ParameterCount = r.ParameterCount,
                VersionCount = r.VersionCount
            };
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

            // usp_ITOpsGetCategoriesForDomain does the filter, IsCurrent flag, and
            // both count aggregates (ParameterCount, VersionCount) set-based in one
            // round trip, replacing the per-row dictionary lookups
            // BuildITOpsCategoryRows built in C# (see ITOperationMaturity_V2_13).
            var spRows = CSPdb.AppRepo.ITOpsGetCategoriesForDomain(domainId, null, includeExpired);
            return Ok(spRows.Select(ToITOpsCategoryRow).ToList());
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

            // usp_ITOpsGetCategoriesForDomain(@CategoryId set) resolves the lineage
            // key (DOMAIN_ID + NAME) and returns every row in it server-side - see
            // ITOperationMaturity_V2_13. NotFound still needs one row to confirm
            // the id itself exists (an unknown id resolves an empty lineage).
            var spRows = CSPdb.AppRepo.ITOpsGetCategoriesForDomain(null, categoryId, true);
            if (!spRows.Any() && CSPdb.ITOPS_CATEGORY.GetAll().All(c => c.ID != categoryId)) return NotFound();

            var rows = spRows
                .Select(ToITOpsCategoryRow)
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

            // In-place correction, no new version, whenever there is no scoring
            // history to protect - either because the row only became effective
            // TODAY (can't be end-dated today anyway: CK_ITOPS_PARAMETER_DATES
            // requires END_DATE > START_DATE), or because nobody has scored
            // against it yet regardless of how old it is. The moment even one
            // ITOPS_SCORE references it, editing must go through the version
            // path below instead.
            var hasBeenScored = CSPdb.ITOPS_SCORE.GetAll().Any(s => s.ISACTIVE && s.PARAMETER_ID == parameter.ID);
            if (parameter.START_DATE.Date >= today || !hasBeenScored)
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
        /// with ToEmpId, across every assessment.
        /// Send Preview = true to get the same counts without writing anything -
        /// that is what the confirmation screen calls first.
        ///
        /// Collision handling: UQ_ITOPS_ASSESSMENT_ASSESSOR / _REVIEWER are
        /// unique on (ASSESSMENT_ID, EMP_ID) WHERE ISACTIVE = 1, so where the
        /// target is ALREADY on the same assessment in the same role the source
        /// row is deactivated (a merge) rather than re-pointed.
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

            // Tracks which assessments the target ends up newly holding (as opposed
            // to ones they were already on before this reassignment - the merge
            // case below - which shouldn't generate a "you're now on this" email
            // since nothing changed for them there).
            var newlyAssessorAssessmentIds = new List<int>();
            var newlyReviewerAssessmentIds = new List<int>();

            foreach (var row in assessorRows)
            {
                var incumbent = targetAssessorRows.FirstOrDefault(a => a.ASSESSMENT_ID == row.ASSESSMENT_ID);
                if (incumbent != null && incumbent.ISACTIVE)
                {
                    // Target already holds this seat - retire the source row, nothing else to merge.
                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                    continue;
                }

                if (incumbent != null)
                {
                    // An INACTIVE row for the target on this assessment would still
                    // collide once re-pointed, so reuse it instead of re-pointing.
                    UpdateAuditFields(incumbent, empId); // sets ISACTIVE = true
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(incumbent);

                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                    newlyAssessorAssessmentIds.Add(row.ASSESSMENT_ID);
                    continue;
                }

                row.ASSESSOR_EMP_ID = toEmpId;
                UpdateAuditFields(row, empId);
                CSPdb.ITOPS_ASSESSMENT_ASSESSOR.Update(row);
                newlyAssessorAssessmentIds.Add(row.ASSESSMENT_ID);
            }

            foreach (var row in reviewerRows)
            {
                var incumbent = targetReviewerRows.FirstOrDefault(r => r.ASSESSMENT_ID == row.ASSESSMENT_ID);
                if (incumbent != null && incumbent.ISACTIVE)
                {
                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                    continue;
                }

                if (incumbent != null)
                {
                    UpdateAuditFields(incumbent, empId);
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(incumbent);

                    UpdateAuditFields(row, empId);
                    row.ISACTIVE = false;
                    CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                    newlyReviewerAssessmentIds.Add(row.ASSESSMENT_ID);
                    continue;
                }

                row.REVIEWER_EMP_ID = toEmpId;
                UpdateAuditFields(row, empId);
                CSPdb.ITOPS_ASSESSMENT_REVIEWER.Update(row);
                newlyReviewerAssessmentIds.Add(row.ASSESSMENT_ID);
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

            if (newlyAssessorAssessmentIds.Any() || newlyReviewerAssessmentIds.Any())
            {
                var notifyIds = newlyAssessorAssessmentIds.Concat(newlyReviewerAssessmentIds).Distinct().ToList();
                var notifyAssessments = CSPdb.ITOPS_ASSESSMENT.GetAll()
                    .Where(a => notifyIds.Contains(a.ID))
                    .ToList()
                    .ToDictionary(a => a.ID);

                var items = new List<Tuple<ITOPS_ASSESSMENT, string>>();
                items.AddRange(newlyAssessorAssessmentIds.Where(notifyAssessments.ContainsKey)
                    .Select(id => Tuple.Create(notifyAssessments[id], "Assessor")));
                items.AddRange(newlyReviewerAssessmentIds.Where(notifyAssessments.ContainsKey)
                    .Select(id => Tuple.Create(notifyAssessments[id], "Reviewer")));

                NotifyITOpsTeamAssignmentBulk(items, toEmpId, "Added", fromEmpId);
            }

            return Ok(result);
        }
    }
}
