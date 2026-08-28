import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { resolveWebApiUri } from '../utils/api-base.util';

// ---------------------------------------------------------------------------
// Response shapes for the Admin Setup endpoints in
// ITOperationMaturityAdminController.cs (partial AllSysController).
// Property names are camelCase because the Web API installs
// CamelCasePropertyNamesContractResolver globally (App_Start/GlobalConfig.cs),
// same as every other DTO this micro-app consumes.
// ---------------------------------------------------------------------------

export interface ItOpsRole {
  roleId: number;
  roleCode: string;
  roleName: string;
  description: string | null;
}

export interface ItOpsRoleAssignment {
  id: number;
  empId: string;
  empName: string;
  roleId: number;
  roleCode: string | null;
  roleName: string | null;
  projectId: string | null;
  projectName: string | null;
  scope: string;
  grantedOn: string;
}

/**
 * One ITOPS_ROLE_ASSIGNMENT row - active or revoked - as an audit-trail entry
 * (GetITOpsRoleAssignmentHistory). Revokes are soft-deletes, so a single row
 * carries BOTH events: it was granted by createdBy/createdDate and, when
 * isActive is false, revoked by updatedBy/updatedDate.
 */
export interface ItOpsRoleAssignmentHistory {
  id: number;
  empId: string;
  empName: string;
  roleId: number;
  roleCode: string | null;
  roleName: string | null;
  projectId: string | null;
  projectName: string | null;
  scope: string;
  isActive: boolean;
  createdBy: string | null;
  createdByName: string | null;
  createdDate: string;
  updatedBy: string | null;
  updatedByName: string | null;
  updatedDate: string;
  lastActivityDate: string;
}

/** One ITOPS_ASSESSMENT.STATUS value and how many of the cycle's assessments sit on it. */
export interface ItOpsCycleStatusCount {
  status: string;
  count: number;
}

export interface ItOpsAssessmentCycle {
  id: number;
  cycleLabel: string;
  startDate: string;
  endDate: string;
  status: string | null;
  description: string | null;
  assessmentCount: number;
  /**
   * Completion breakdown across EVERY project in the cycle, so Step 2 can show
   * how far a cycle has actually got without a trip to Reports. Only statuses
   * actually present are returned - never a padded fixed enum.
   */
  statusCounts: ItOpsCycleStatusCount[];
  /** Assessments in a terminal state (Approved or Closed). */
  completedCount: number;
  /** completedCount / assessmentCount as a whole percent; 0 for an empty cycle. */
  completionPercent: number;
}

export interface ItOpsDomainAdminRow {
  domainId: number;
  code: string;
  name: string;
  description: string | null;
  minRequiredScore: number | null;
  displayOrder: number;
  defaultAssessorId: string | null;
  defaultAssessorName: string | null;
  defaultReviewerId: string | null;
  defaultReviewerName: string | null;
  categoryCount: number;
}

/**
 * One ITOPS_CATEGORY ROW - i.e. one VERSION of a category, not a "category".
 * Categories are effective-dated: `isCurrent` is the row the assessment form
 * would actually show today, and `versionCount` is how many rows share this
 * one's lineage (see the versioning note in ITOperationMaturityAdminController).
 */
export interface ItOpsCategoryRow {
  categoryId: number;
  domainId: number;
  name: string;
  displayOrder: number;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  parameterCount: number;
  versionCount: number;
}

/** One rubric level (1-5) of one parameter version. */
export interface ItOpsParameterLevel {
  levelNo: number;
  description: string | null;
}

/**
 * One ITOPS_PARAMETER ROW - one VERSION of a parameter. `scoreCount` is how
 * many live ITOPS_SCORE rows point at THIS exact row: that is precisely the
 * history that "save creates a new version" exists to protect.
 */
export interface ItOpsParameterRow {
  parameterId: number;
  categoryId: number;
  categoryName: string | null;
  domainId: number;
  name: string;
  definition: string | null;
  minRequiredScore: number | null;
  displayOrder: number;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  /** Always five entries, LEVEL_NO 1-5. */
  levels: ItOpsParameterLevel[];
  scoreCount: number;
  versionCount: number;
}

/** What VersionITOpsParameter reports back. `versioned: false` = same-day in-place correction. */
export interface ItOpsVersionParameterResult {
  parameter: ItOpsParameterRow;
  versioned: boolean;
  retiredParameterId: number | null;
}

export interface ItOpsVersionCategoryResult {
  category: ItOpsCategoryRow;
  retiredCategoryId: number;
  parametersCarriedForward: number;
}

/** Preview/result of BulkReassignITOpsTeamMember. */
export interface ItOpsBulkReassignResult {
  fromEmpId: string;
  fromEmpName: string | null;
  toEmpId: string;
  toEmpName: string | null;
  preview: boolean;
  assessorRows: number;
  reviewerRows: number;
  assessmentCount: number;
  /** Rows where the target was already on the same assessment, so the source row is retired instead. */
  mergedRows: number;
  totalRows: number;
}

export interface ItOpsProject {
  projectId: string;
  projectName: string;
  custId: string | null;
  accountName: string | null;
  businessUnit: string | null;
}

export interface ItOpsMappedDomain {
  mappingId: number;
  domainId: number;
  domainCode: string;
  domainName: string;
}

export interface ItOpsDomainProjectMapping {
  projectId: string;
  projectName: string | null;
  custId: string | null;
  accountName: string | null;
  domains: ItOpsMappedDomain[];
  assessees: { empId: string; name: string }[];
}

/** What BulkAddITOpsDomainProjectMappings reports back about one bulk-add. */
export interface ItOpsBulkMappingResult {
  added: number;
  reactivated: number;
  unchanged: number;
}

/** One row of the append-only Domain-Project Mapping change log. */
export interface ItOpsMappingAuditRow {
  projectId: string;
  projectName: string | null;
  accountName: string | null;
  domainId: number;
  domainName: string | null;
  action: string;
  reason: string | null;
  changedBy: string;
  changedByName: string | null;
  changedDate: string | null;
}

export interface ItOpsCycleAssessment {
  assessmentId: number;
  assessmentMasterId: number;
  cycleLabel: string | null;
  projectId: string;
  projectName: string | null;
  accountName: string | null;
  domainId: number;
  domainCode: string | null;
  domainName: string | null;
  assessorCount: number;
  reviewerCount: number;
  assesseeCount: number;
  assessorNames: string[];
  reviewerNames: string[];
  status: string;
}

export interface ItOpsTeamMember {
  id: number;
  assessmentId: number;
  empId: string;
  empName: string;
}

export interface ItOpsAssessmentTeam {
  assessmentId: number;
  assessors: ItOpsTeamMember[];
  reviewers: ItOpsTeamMember[];
  assessees: ItOpsTeamMember[];
}

/**
 * What the signed-in user may do on the Admin Setup screen
 * (GetITOpsMyRoleCodes). `roleCodes` are the active ITOPS_ROLE.ROLE_CODEs held
 * via ITOPS_ROLE_ASSIGNMENT, e.g. ['CYCLE_ADMINISTRATOR']; SUPERUSER is
 * reported through `isSuperuser` rather than appearing in the list.
 */
export interface ItOpsMyAccess {
  empId: string | null;
  isSuperuser: boolean;
  roleCodes: string[];
  isAdmin: boolean;
}

/**
 * The granteable admin role codes (step 1/SUPERUSER excluded - not self-grantable
 * from this screen). Configure Scope (step 3) is split across three of these -
 * DOMAIN_ADMINISTRATOR, DOMAIN_PROJECT_MAPPER, CATEGORY_PARAMETER_ADMINISTRATOR -
 * one per sub-tab, rather than a single role owning the whole step.
 */
export type ItOpsAdminRoleCode =
  | 'CYCLE_ADMINISTRATOR'
  | 'DOMAIN_ADMINISTRATOR'
  | 'DOMAIN_PROJECT_MAPPER'
  | 'CATEGORY_PARAMETER_ADMINISTRATOR'
  | 'RUNOPS_INITIATOR'
  | 'TEAM_ASSIGNMENT_COORDINATOR';

const NO_ACCESS: ItOpsMyAccess = { empId: null, isSuperuser: false, roleCodes: [], isAdmin: false };

/** Minimal employee shape for the people-picker / search inputs. */
export interface ItOpsEmployee {
  empId: string;
  name: string;
  title: string;
}

function readEmpId(row: any): string | undefined {
  return row?.empId ?? row?.emP_ID ?? row?.EMP_ID ?? row?.empid;
}

function readFirstName(row: any): string | undefined {
  return row?.name ?? row?.frsT_NM ?? row?.FRST_NM ?? row?.firstName;
}

function readRole(row: any): string | undefined {
  return row?.title ?? row?.emP_CSP_ROLE ?? row?.EMP_CSP_ROLE ?? row?.designation ?? row?.role;
}

/**
 * Real backend calls behind the five-step Admin Setup flow
 * (Configure Roles -> Cycle -> Scope -> Assessment -> Assign Assessor/Reviewer),
 * backed by ITOperationMaturityAdminController in GAVS.AllocationSystem.WebApi.
 * Replaces the local mock arrays AdminSetupComponent used to run on.
 */
@Injectable({ providedIn: 'root' })
export class ItOpsAdminSetupService {
  private readonly apiurl = resolveWebApiUri();

  /** The full active-employee roster is a large, rarely-changing payload - fetch it once. */
  private employees$?: Observable<ItOpsEmployee[]>;

  /** Cached per-session answer to "what may I do on Admin Setup?" - see getMyAccess(). */
  private myAccess$?: Observable<ItOpsMyAccess>;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Accept: 'application/json',
      token: localStorage.getItem('token') || '',
      empId: localStorage.getItem('empid') || '',
    });
  }

  // ---- Access control ----

  /**
   * The caller's own IT Ops admin access. Fetched once per session
   * (shareReplay, same pattern as the roster below / IdentityService.getMyEmail)
   * because the nav menu and the Admin Setup page both need it on load, and it
   * cannot change without a re-login-worthy role grant. Any failure - including
   * the 403 the backend now returns to a non-admin - degrades to "no access",
   * so a broken call can never accidentally open the admin surface.
   */
  getMyAccess(): Observable<ItOpsMyAccess> {
    if (!this.myAccess$) {
      const empId = localStorage.getItem('empid') || '';
      this.myAccess$ = this.http
        .get<ItOpsMyAccess>(`${this.apiurl}GetITOpsMyRoleCodes?empId=${encodeURIComponent(empId)}`, {
          headers: this.getHeaders(),
        })
        .pipe(
          map((row) => ({
            empId: row?.empId ?? null,
            isSuperuser: !!row?.isSuperuser,
            roleCodes: row?.roleCodes ?? [],
            isAdmin: !!row?.isAdmin,
          })),
          catchError(() => of(NO_ACCESS)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
    }
    return this.myAccess$;
  }

  // ---- Step 1: Configure Roles ----

  getRoles(): Observable<ItOpsRole[]> {
    return this.http.get<ItOpsRole[]>(`${this.apiurl}GetITOpsRoles`, { headers: this.getHeaders() });
  }

  getRoleAssignments(): Observable<ItOpsRoleAssignment[]> {
    return this.http.get<ItOpsRoleAssignment[]>(`${this.apiurl}GetITOpsRoleAssignments`, { headers: this.getHeaders() });
  }

  grantRole(empId: string, roleId: number, projectId: string | null): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}GrantITOpsRole`,
      { EmpId: empId, RoleId: roleId, ProjectId: projectId },
      { headers: this.getHeaders() },
    );
  }

  /**
   * The full grant/revoke audit trail (every row, active and revoked), newest
   * activity first. Pass empId to narrow it to one person.
   */
  getRoleAssignmentHistory(empId?: string): Observable<ItOpsRoleAssignmentHistory[]> {
    const qs = empId ? `?empId=${encodeURIComponent(empId)}` : '';
    return this.http.get<ItOpsRoleAssignmentHistory[]>(`${this.apiurl}GetITOpsRoleAssignmentHistory${qs}`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Bulk grant: N employees x N roles x (N projects, or org-wide when
   * projectIds is empty). The backend creates/reactivates one
   * ITOPS_ROLE_ASSIGNMENT row per (employee x role x project) combination in a
   * single commit and returns only a count, so callers re-read
   * getRoleAssignments() afterwards.
   */
  grantRoles(empIds: string[], roleIds: number[], projectIds: string[]): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}GrantITOpsRoles`,
      { EmpIds: empIds, RoleIds: roleIds, ProjectIds: projectIds },
      { headers: this.getHeaders() },
    );
  }

  /**
   * Edits one existing grant in place (same row ID, so the "Granted" date is
   * preserved). Returns a 409 if the new (role, scope) would duplicate another
   * active grant for the same employee.
   */
  updateRoleAssignment(id: number, roleId: number, projectId: string | null): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}UpdateITOpsRoleAssignment`,
      { Id: id, RoleId: roleId, ProjectId: projectId },
      { headers: this.getHeaders() },
    );
  }

  revokeRole(id: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}RevokeITOpsRole?id=${id}`, null, { headers: this.getHeaders() });
  }

  // ---- Step 2: Configure Cycle ----

  getCycles(): Observable<ItOpsAssessmentCycle[]> {
    return this.http.get<ItOpsAssessmentCycle[]>(`${this.apiurl}GetITOpsAssessmentCycles`, { headers: this.getHeaders() });
  }

  /** Backend validates endDate > startDate and rejects a duplicate cycleLabel with a 409. */
  createCycle(cycleLabel: string, startDate: string, endDate: string, description?: string): Observable<ItOpsAssessmentCycle> {
    return this.http.post<ItOpsAssessmentCycle>(
      `${this.apiurl}CreateITOpsAssessmentCycle`,
      { CycleLabel: cycleLabel, StartDate: startDate, EndDate: endDate, Description: description ?? null },
      { headers: this.getHeaders() },
    );
  }

  // ---- Step 3: Configure Scope ----

  getDomains(): Observable<ItOpsDomainAdminRow[]> {
    return this.http.get<ItOpsDomainAdminRow[]>(`${this.apiurl}GetITOpsDomainsForAdmin`, { headers: this.getHeaders() });
  }

  /**
   * Default assessor/reviewer are optional server-side (CreateITOpsDomain nulls
   * blanks out). The admin UI no longer collects them - assessors and reviewers
   * are assigned per assessment in Step 5 - so they are omitted by default.
   */
  createDomain(
    name: string,
    defaultAssessorId: string | null = null,
    defaultReviewerId: string | null = null,
  ): Observable<ItOpsDomainAdminRow> {
    return this.http.post<ItOpsDomainAdminRow>(
      `${this.apiurl}CreateITOpsDomain`,
      { Name: name, DefaultAssessorId: defaultAssessorId, DefaultReviewerId: defaultReviewerId },
      { headers: this.getHeaders() },
    );
  }

  /** Rename only - CODE and the default assessor/reviewer are left untouched server-side. */
  updateDomain(domainId: number, name: string): Observable<ItOpsDomainAdminRow> {
    return this.http.post<ItOpsDomainAdminRow>(
      `${this.apiurl}UpdateITOpsDomain`,
      { DomainId: domainId, Name: name },
      { headers: this.getHeaders() },
    );
  }

  // ---- Step 3c: Categories & Parameters (effective-dated master data) ----
  //
  // Every "edit" of substantive content here is RETIRE-AND-REPLACE server-side,
  // never an in-place rewrite: an assessment that already scored a parameter
  // must keep resolving to the exact definition/rubric text it was scored
  // against. Only name and display order are genuine in-place updates.

  /** Category VERSIONS for a domain. By default only rows in effect today. */
  getCategoriesForDomain(domainId: number, includeExpired = false): Observable<ItOpsCategoryRow[]> {
    return this.http.get<ItOpsCategoryRow[]>(
      `${this.apiurl}GetITOpsCategoriesForDomain?domainId=${domainId}&includeExpired=${includeExpired}`,
      { headers: this.getHeaders() },
    );
  }

  /** Parameter VERSIONS under one category version, each with its five rubric levels. */
  getParametersForCategory(categoryId: number, includeExpired = false): Observable<ItOpsParameterRow[]> {
    return this.http.get<ItOpsParameterRow[]>(
      `${this.apiurl}GetITOpsParametersForCategory?categoryId=${categoryId}&includeExpired=${includeExpired}`,
      { headers: this.getHeaders() },
    );
  }

  /** Every row that has ever existed in this parameter's lineage, oldest first. */
  getParameterVersions(parameterId: number): Observable<ItOpsParameterRow[]> {
    return this.http.get<ItOpsParameterRow[]>(`${this.apiurl}GetITOpsParameterVersions?parameterId=${parameterId}`, {
      headers: this.getHeaders(),
    });
  }

  getCategoryVersions(categoryId: number): Observable<ItOpsCategoryRow[]> {
    return this.http.get<ItOpsCategoryRow[]>(`${this.apiurl}GetITOpsCategoryVersions?categoryId=${categoryId}`, {
      headers: this.getHeaders(),
    });
  }

  createCategory(domainId: number, name: string, startDate?: string): Observable<ItOpsCategoryRow> {
    return this.http.post<ItOpsCategoryRow>(
      `${this.apiurl}CreateITOpsCategory`,
      { DomainId: domainId, Name: name, StartDate: startDate ?? null },
      { headers: this.getHeaders() },
    );
  }

  /** In-place, NO new version - name and display order carry no scoring history. */
  updateCategoryMetadata(categoryId: number, name?: string, displayOrder?: number): Observable<ItOpsCategoryRow> {
    return this.http.post<ItOpsCategoryRow>(
      `${this.apiurl}UpdateITOpsCategoryMetadata`,
      { CategoryId: categoryId, Name: name ?? null, DisplayOrder: displayOrder ?? null },
      { headers: this.getHeaders() },
    );
  }

  /** Retire + replace this category version, carrying every live parameter forward as a new version. */
  versionCategory(categoryId: number, displayOrder?: number): Observable<ItOpsVersionCategoryResult> {
    return this.http.post<ItOpsVersionCategoryResult>(
      `${this.apiurl}VersionITOpsCategory`,
      { CategoryId: categoryId, DisplayOrder: displayOrder ?? null },
      { headers: this.getHeaders() },
    );
  }

  createParameter(
    categoryId: number,
    name: string,
    definition: string | null,
    minRequiredScore: number | null,
    levels: ItOpsParameterLevel[],
    startDate?: string,
  ): Observable<ItOpsParameterRow> {
    return this.http.post<ItOpsParameterRow>(
      `${this.apiurl}CreateITOpsParameter`,
      {
        CategoryId: categoryId,
        Name: name,
        Definition: definition,
        MinRequiredScore: minRequiredScore,
        StartDate: startDate ?? null,
        Levels: levels.map((l) => ({ LevelNo: l.levelNo, Description: l.description })),
      },
      { headers: this.getHeaders() },
    );
  }

  /**
   * Saves a NEW VERSION of the parameter's definition / minimum score / rubric
   * text. The current row is end-dated today and left otherwise untouched, so
   * anything already scored against it keeps its original wording. The name is
   * deliberately not accepted - rename through updateParameterMetadata().
   */
  versionParameter(
    parameterId: number,
    definition: string | null,
    minRequiredScore: number | null,
    levels: ItOpsParameterLevel[],
  ): Observable<ItOpsVersionParameterResult> {
    return this.http.post<ItOpsVersionParameterResult>(
      `${this.apiurl}VersionITOpsParameter`,
      {
        ParameterId: parameterId,
        Definition: definition,
        MinRequiredScore: minRequiredScore,
        Levels: levels.map((l) => ({ LevelNo: l.levelNo, Description: l.description })),
      },
      { headers: this.getHeaders() },
    );
  }

  /** In-place, NO new version. A rename is applied across the whole lineage server-side. */
  updateParameterMetadata(parameterId: number, name?: string, displayOrder?: number): Observable<ItOpsParameterRow> {
    return this.http.post<ItOpsParameterRow>(
      `${this.apiurl}UpdateITOpsParameterMetadata`,
      { ParameterId: parameterId, Name: name ?? null, DisplayOrder: displayOrder ?? null },
      { headers: this.getHeaders() },
    );
  }

  getProjects(custId?: string): Observable<ItOpsProject[]> {
    const qs = custId ? `?custId=${encodeURIComponent(custId)}` : '';
    return this.http.get<ItOpsProject[]>(`${this.apiurl}GetITOpsProjects${qs}`, { headers: this.getHeaders() });
  }

  getDomainProjectMappings(projectId?: string): Observable<ItOpsDomainProjectMapping[]> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.get<ItOpsDomainProjectMapping[]>(`${this.apiurl}GetITOpsDomainProjectMappings${qs}`, {
      headers: this.getHeaders(),
    });
  }

  /** Replace semantics: domainIds is the complete desired set for the project; the backend diffs add/remove. */
  saveDomainProjectMapping(projectId: string, domainIds: number[], reason?: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}SaveITOpsDomainProjectMapping`,
      { ProjectId: projectId, DomainIds: domainIds, Reason: reason || null },
      { headers: this.getHeaders() },
    );
  }

  /**
   * ADDITIVE bulk mapping: adds/reactivates one mapping row per
   * (project x domain) combination and removes NOTHING that is already mapped
   * to those projects. Deliberately not the bulk form of
   * saveDomainProjectMapping() above - a bulk REPLACE across several projects
   * would silently wipe domain sets the admin never looked at. Combinations
   * that already exist are reactivated rather than duplicated, so it is
   * idempotent. Returns { added, reactivated, unchanged } counts.
   */
  bulkAddDomainProjectMappings(projectIds: string[], domainIds: number[], reason?: string): Observable<ItOpsBulkMappingResult> {
    return this.http.post<ItOpsBulkMappingResult>(
      `${this.apiurl}BulkAddITOpsDomainProjectMappings`,
      { ProjectIds: projectIds, DomainIds: domainIds, Reason: reason || null },
      { headers: this.getHeaders() },
    );
  }

  removeDomainProjectMapping(projectId: string, domainId: number, reason?: string): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}RemoveITOpsDomainProjectMapping`,
      { ProjectId: projectId, DomainId: domainId, Reason: reason || null },
      { headers: this.getHeaders() },
    );
  }

  /** Full Domain-Project Mapping change history, newest first; optionally scoped to one project. */
  getDomainProjectMappingHistory(projectId?: string): Observable<ItOpsMappingAuditRow[]> {
    const qs = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.get<ItOpsMappingAuditRow[]>(`${this.apiurl}GetITOpsDomainProjectMappingHistory${qs}`, {
      headers: this.getHeaders(),
    });
  }

  // ---- Step 4: Configure Assessment ----

  /**
   * Creates/ensures one assessment per (project x domain) for this cycle,
   * across every selected project. Domains and assessees are no longer picked
   * here - each project reads its own standing config from Configure Scope
   * (domain mapping + project assessees), so a project with nothing mapped
   * yet simply produces nothing rather than being asked about it twice.
   * Returns the refreshed table rows for all selected projects.
   */
  createAssessmentsForProjects(cycleId: number, projectIds: string[]): Observable<ItOpsCycleAssessment[]> {
    return this.http.post<ItOpsCycleAssessment[]>(
      `${this.apiurl}CreateITOpsAssessmentsForProject`,
      { AssessmentMasterId: cycleId, ProjectIds: projectIds },
      { headers: this.getHeaders() },
    );
  }

  getAssessmentsForCycle(cycleId: number, projectId?: string): Observable<ItOpsCycleAssessment[]> {
    const qs = projectId ? `&projectId=${encodeURIComponent(projectId)}` : '';
    return this.http.get<ItOpsCycleAssessment[]>(`${this.apiurl}GetITOpsAssessmentsForCycle?cycleId=${cycleId}${qs}`, {
      headers: this.getHeaders(),
    });
  }

  /** Only a Not Started assessment can be removed - the backend rejects anything with review/scoring history. */
  removeAssessment(assessmentId: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}RemoveITOpsAssessment?assessmentId=${assessmentId}`, null, {
      headers: this.getHeaders(),
    });
  }

  // ---- Step 5: Assign Assessor / Reviewer ----

  getAssessmentTeam(assessmentId: number): Observable<ItOpsAssessmentTeam> {
    return this.http.get<ItOpsAssessmentTeam>(`${this.apiurl}GetITOpsAssessmentTeam?assessmentId=${assessmentId}`, {
      headers: this.getHeaders(),
    });
  }

  addAssessor(assessmentId: number, empId: string): Observable<ItOpsTeamMember> {
    return this.http.post<ItOpsTeamMember>(
      `${this.apiurl}AddITOpsAssessor`,
      { AssessmentId: assessmentId, EmpId: empId },
      { headers: this.getHeaders() },
    );
  }

  removeAssessor(id: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}RemoveITOpsAssessor?id=${id}`, null, { headers: this.getHeaders() });
  }

  addReviewer(assessmentId: number, empId: string): Observable<ItOpsTeamMember> {
    return this.http.post<ItOpsTeamMember>(
      `${this.apiurl}AddITOpsReviewer`,
      { AssessmentId: assessmentId, EmpId: empId },
      { headers: this.getHeaders() },
    );
  }

  removeReviewer(id: number): Observable<unknown> {
    return this.http.post(`${this.apiurl}RemoveITOpsReviewer?id=${id}`, null, { headers: this.getHeaders() });
  }

  /**
   * Replaces EVERY active assessor/reviewer assignment held by `fromEmpId` with
   * `toEmpId`, across every assessment in every cycle, preserving IS_PRIMARY per
   * row. Call it with preview = true first to get the same counts without
   * writing anything - that is what the confirmation step shows.
   */
  bulkReassignTeamMember(fromEmpId: string, toEmpId: string, preview: boolean): Observable<ItOpsBulkReassignResult> {
    return this.http.post<ItOpsBulkReassignResult>(
      `${this.apiurl}BulkReassignITOpsTeamMember`,
      { FromEmpId: fromEmpId, ToEmpId: toEmpId, Preview: preview },
      { headers: this.getHeaders() },
    );
  }

  // ---- Employee lookup (people pickers / "search employees" inputs) ----

  /**
   * GetITOpsEmployeeRoster - a dedicated endpoint, not the shared legacy
   * /EmpInfo route. /EmpInfo has four GET overloads on AllSysController all
   * sharing that same route template with optional/nullable parameters; which
   * one Web API's action selector resolves to for a zero-query-param call is
   * ambiguous, and at least one of the other three pulls from a source with no
   * DOR filter at all (duplicate/stale names showed up in this picker before
   * this endpoint existed). GetITOpsEmployeeRoster always filters DOR IS NULL
   * server-side, unambiguously. Fetched once (shareReplay), filtered
   * client-side by searchEmployees() below - there is no server-side search.
   */
  getEmployees(): Observable<ItOpsEmployee[]> {
    if (!this.employees$) {
      this.employees$ = this.http.get<any[]>(`${this.apiurl}GetITOpsEmployeeRoster`, { headers: this.getHeaders() }).pipe(
        map((rows) => {
          const byId = new Map<string, ItOpsEmployee>();
          for (const row of rows ?? []) {
            const empId = readEmpId(row);
            const name = readFirstName(row);
            if (!empId || !name || byId.has(empId)) continue;
            byId.set(empId, { empId, name, title: readRole(row) ?? '' });
          }
          return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.employees$;
  }

  /**
   * Step 4's Assessee picker: candidates actually staffed on the selected
   * project(s), not the whole org roster (GetITOpsAssesseeCandidates, backed
   * by the same staffing lookup the runtime side of this module already uses
   * for account-level assessee suggestions). Not cached - it depends on which
   * projects are picked, unlike the fairly-static global roster above.
   */
  getAssesseeCandidates(projectIds: string[]): Observable<ItOpsEmployee[]> {
    const ids = (projectIds ?? []).filter((id) => !!id);
    if (!ids.length) return of([]);
    return this.http
      .get<any[]>(`${this.apiurl}GetITOpsAssesseeCandidates?projectIds=${encodeURIComponent(ids.join(','))}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((rows) =>
          (rows ?? [])
            .map((row) => ({ empId: readEmpId(row) ?? '', name: readFirstName(row) ?? '', title: readRole(row) ?? '' }))
            .filter((e) => e.empId && e.name),
        ),
        catchError(() => of([])),
      );
  }

  /** Standing assessee list for one project, set in Configure Scope's "New mapping" modal rather than re-picked every cycle. */
  getProjectAssessees(projectId: string): Observable<ItOpsEmployee[]> {
    if (!projectId) return of([]);
    return this.http
      .get<any[]>(`${this.apiurl}GetITOpsProjectAssessees?projectId=${encodeURIComponent(projectId)}`, {
        headers: this.getHeaders(),
      })
      .pipe(
        map((rows) =>
          (rows ?? [])
            .map((row) => ({ empId: readEmpId(row) ?? '', name: readFirstName(row) ?? '', title: readRole(row) ?? '' }))
            .filter((e) => e.empId && e.name),
        ),
        catchError(() => of([])),
      );
  }

  /** Replace semantics: empIds is the complete desired assessee set for the project. */
  saveProjectAssessees(projectId: string, empIds: string[]): Observable<unknown> {
    return this.http.post(
      `${this.apiurl}SaveITOpsProjectAssessees`,
      { ProjectId: projectId, EmpIds: empIds },
      { headers: this.getHeaders() },
    );
  }

  /**
   * Client-side filter over the cached roster. An empty/short term returns the
   * first `limit` names (alphabetical) instead of nothing, so clicking into a
   * search box shows a browsable list immediately rather than an empty dropdown
   * until the admin types 2+ characters.
   */
  searchEmployees(term: string, limit = 25): Observable<ItOpsEmployee[]> {
    const needle = (term ?? '').trim().toLowerCase();
    return this.getEmployees().pipe(
      map((list) =>
        (needle.length < 2
          ? list
          : list.filter((e) => e.name.toLowerCase().includes(needle) || e.empId.toLowerCase().includes(needle))
        ).slice(0, limit),
      ),
    );
  }
}
