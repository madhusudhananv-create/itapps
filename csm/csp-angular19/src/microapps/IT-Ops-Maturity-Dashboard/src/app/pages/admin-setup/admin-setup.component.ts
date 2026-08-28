import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SpinnerComponent } from '../../components/spinner/spinner.component';
import {
  SearchableSelectComponent,
  SearchableSelectOption,
} from '../../components/searchable-select/searchable-select.component';
import { ToastService } from '../../services/toast.service';
import {
  ItOpsAdminSetupService,
  ItOpsAssessmentCycle,
  ItOpsBulkReassignResult,
  ItOpsCategoryRow,
  ItOpsParameterLevel,
  ItOpsParameterRow,
  ItOpsCycleAssessment,
  ItOpsCycleStatusCount,
  ItOpsDomainAdminRow,
  ItOpsDomainProjectMapping,
  ItOpsEmployee,
  ItOpsMyAccess,
  ItOpsProject,
  ItOpsRole,
  ItOpsRoleAssignment,
  ItOpsRoleAssignmentHistory,
  ItOpsTeamMember,
} from '../../services/itops-admin-setup.service';

type StepKey = 'roles' | 'cycle' | 'scope' | 'assessment' | 'team';

/** One domain's assessment row plus its live assessor/reviewer join rows (Step 5 accordion). */
interface DomainTeam {
  assessmentId: number;
  domainId: number;
  name: string;
  status: 'Ready' | 'Needs setup';
  assessors: ItOpsTeamMember[];
  reviewers: ItOpsTeamMember[];
}

/**
 * One ROLE an employee holds, plus every scope they hold it at. A person granted
 * "Assessment Coordinator" on three projects is one of these with three grants -
 * the role name is rendered once and the scopes become chips.
 */
interface RoleGrantGroup {
  /** roleId when present, else roleCode - stable key for trackBy and grouping. */
  key: string;
  roleId: number;
  roleCode: string | null;
  roleName: string | null;
  /** Every ITOPS_ROLE_ASSIGNMENT row for this (employee, role) - one per scope. */
  grants: ItOpsRoleAssignment[];
  /** Earliest grantedOn in the group (the whole group's date column is meaningless otherwise). */
  grantedOn: string;
}

/**
 * One ticked role inside the per-employee "Edit roles" modal, with its OWN
 * scope. An employee legitimately holds some roles org-wide and others scoped
 * to a handful of projects, so scope cannot be a single value shared by the
 * whole selection - each ticked role carries its own.
 */
interface RoleScopeEdit {
  roleId: number;
  roleName: string;
  scope: 'org' | 'project';
  /** Only meaningful when scope === 'project'. */
  projectIds: string[];
  /** Customer filter for this role's own project checklist (display only). */
  accountName: string;
  /** Free-text filter over this role's own project checklist. */
  projectSearch: string;
}

/**
 * One row of the "Preview access" summary: an Admin Setup step, whether this
 * employee can reach it, and - when they can - the scope they reach it at.
 * Entirely derived client-side from grants already loaded into roleGrants.
 */
interface AccessPreviewStep {
  key: StepKey;
  label: string;
  role: string;
  /** 1-based position in the full five-step flow. */
  number: number;
  canReach: boolean;
  /** True when reachability comes from the SUPERUSER role rather than the step's own role. */
  viaSuperuser: boolean;
  /** True when at least one grant for this step's role is org-wide. */
  allProjects: boolean;
  /** Only populated when every grant for this role is project-scoped. */
  projectNames: string[];
}

/** One employee plus every grant they hold (Step 1 table is grouped by employee). */
interface EmployeeGrants {
  empId: string;
  empName: string;
  grants: ItOpsRoleAssignment[];
  /** The same grants, re-grouped by role for rendering (see groupedRoleGrants). */
  roleGroups: RoleGrantGroup[];
}

/**
 * Admin Setup - five-step configuration flow for the IT Ops Maturity V2 schema
 * (roles -> cycle -> scope -> assessment -> per-domain team assignment).
 *
 * Every screen reads and writes through ItOpsAdminSetupService against the real
 * V2 endpoints in ITOperationMaturityAdminController (ITOPS_ROLE_ASSIGNMENT,
 * ITOPS_ASSESSMENT_MASTER, ITOPS_DOMAIN_PROJECT_MAP, ITOPS_ASSESSMENT and its
 * assessor/reviewer/assessee join tables) - no mock data remains. Each step
 * lazy-loads what it needs the first time it becomes active, and every mutating
 * action re-reads the affected list from the server rather than patching the
 * local array, so the screen can never drift from what was actually persisted.
 */
@Component({
  selector: 'app-admin-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, SearchableSelectComponent],
  templateUrl: './admin-setup.component.html',
  styleUrl: './admin-setup.component.scss',
})
export class AdminSetupComponent implements OnInit {
  /**
   * The five steps, each tagged with the ITOPS_ROLE code that owns it.
   * 'SUPERUSER' means step 1, which is not granteable from this screen at all.
   * The same mapping is enforced server-side on every mutating endpoint - this
   * only decides what's worth showing.
   */
  readonly steps: { key: StepKey; label: string; role: string }[] = [
    { key: 'roles', label: 'Configure Roles', role: 'SUPERUSER' },
    { key: 'cycle', label: 'Configure Cycle', role: 'CYCLE_ADMINISTRATOR' },
    // 'scope' isn't owned by one role - see scopeSubTabRoles - so this entry's
    // role is only a display fallback; canUseStep/visibleSteps special-case it.
    { key: 'scope', label: 'Configure Scope', role: 'DOMAIN_PROJECT_MAPPER' },
    { key: 'assessment', label: 'Configure Assessment', role: 'RUNOPS_INITIATOR' },
    { key: 'team', label: 'Assign Assessor / Reviewer', role: 'TEAM_ASSIGNMENT_COORDINATOR' },
  ];

  /**
   * Configure Scope has 3 independent sub-tabs, each requiring its own role -
   * Domains and Categories & Parameters must each be invisible to anyone
   * without that specific role, not just to non-admins in general. Enforced
   * again server-side on every mutating endpoint for the matching tab.
   */
  readonly scopeSubTabRoles: Record<'domains' | 'mapping' | 'catalog', string> = {
    domains: 'DOMAIN_ADMINISTRATOR',
    mapping: 'DOMAIN_PROJECT_MAPPER',
    catalog: 'CATEGORY_PARAMETER_ADMINISTRATOR',
  };

  activeStep: StepKey = 'roles';

  // ---- Access ----
  /** Null until GetITOpsMyRoleCodes answers; the screen renders nothing until then. */
  access: ItOpsMyAccess | null = null;
  accessResolved = false;

  // ---- Step 1: Configure Roles ----
  roleGrants: ItOpsRoleAssignment[] = [];
  roleOptions: ItOpsRole[] = [];
  loadingRoles = false;
  rolesError: string | null = null;
  roleModalOpen = false;
  savingRole = false;
  revokingRoleId: number | null = null;

  // "Assign a role" modal form state
  /**
   * Multi-select: one grant action can cover several EMPLOYEES at once
   * (search -> add to this list -> removable chips), the same
   * search-and-add-to-a-chip-list pattern the Step 4 assessee picker uses.
   */
  roleFormEmps: ItOpsEmployee[] = [];
  roleFormEmpSearch = '';
  roleFormEmpResults: ItOpsEmployee[] = [];
  /** Multi-select: one grant action can cover several roles at once. */
  roleFormRoleIds: number[] = [];
  roleFormScope: 'org' | 'project' = 'org';
  /** Multi-select: one grant action can cover several projects at once. */
  roleFormProjectIds: string[] = [];
  /** Customer filter above the project checklist in the assign modal. */
  roleFormAccountName = '';
  /** Free-text filter over the assign modal's project checklist. */
  roleFormProjectSearch = '';

  // "Edit roles" modal - ONE entry point per EMPLOYEE covering their entire
  // role/scope picture at once. Real data has one person holding some roles
  // org-wide and other roles scoped to several projects, so the modal carries a
  // PER-ROLE scope picker (roleEditEntries) rather than one flat scope for the
  // whole selection.
  roleEditModalOpen = false;
  savingRoleEdit = false;
  roleEditEmpId = '';
  roleEditEmpName = '';
  /** One entry per role currently ticked in the modal, each with its own scope. */
  roleEditEntries: RoleScopeEdit[] = [];

  // ---- Step 1: audit trail (grant/revoke history) ----
  // Backed by GetITOpsRoleAssignmentHistory, which returns EVERY
  // ITOPS_ROLE_ASSIGNMENT row (active and revoked). Opened from the "View audit
  // trail" button next to "+ Assign role"; kept in its own modal so the main
  // table stays a live-state view rather than a log.
  auditModalOpen = false;
  loadingAudit = false;
  auditError: string | null = null;
  auditRows: ItOpsRoleAssignmentHistory[] = [];
  /** Non-null when the trail was opened for one person rather than everyone. */
  auditEmpName: string | null = null;

  // ---- Step 1: effective access preview ----
  // Purely derived from roleGrants - no backend call.
  accessPreviewOpen = false;
  accessPreviewEmpName = '';
  accessPreviewSuperuser = false;
  accessPreviewSteps: AccessPreviewStep[] = [];

  // ---- Step 2: Configure Cycle ----
  cycleMode: 'existing' | 'new' = 'new';
  existingCycles: ItOpsAssessmentCycle[] = [];
  loadingCycles = false;
  cyclesError: string | null = null;
  selectedCycleId: number | null = null;
  savingCycle = false;
  newCycleLabel = '';
  newCycleStart = '';
  newCycleEnd = '';

  // ---- Step 3: Configure Scope ----
  scopeSubTab: 'domains' | 'mapping' | 'catalog' = 'domains';
  domains: ItOpsDomainAdminRow[] = [];
  mappings: ItOpsDomainProjectMapping[] = [];
  projects: ItOpsProject[] = [];
  loadingScope = false;
  scopeError: string | null = null;
  /** Rename-domain modal. Creation was removed from this screen - only editing remains. */
  domainEditModalOpen = false;
  savingDomain = false;
  domainFormName = '';
  domainEditId: number | null = null;
  mappingModalOpen = false;
  savingMapping = false;
  /** Customer/account filter sitting above the project picker in the mapping modal. */
  mappingModalAccountName = '';
  mappingModalProjectId = '';
  mappingModalDomainIds: number[] = [];

  // ---- Step 3: bulk mapping (many domains x many projects, ADDITIVE) ----
  // Separate entry point from the single-project modal above on purpose: that
  // one is REPLACE ("this project's domains are exactly these"), this one only
  // ever ADDS. Mixing the two behind one button would make a bulk save able to
  // silently wipe domain sets on projects the admin never inspected.
  bulkMapModalOpen = false;
  savingBulkMap = false;
  /** Customer filter above the bulk project checklist (display only). */
  bulkMapAccountName = '';
  /** Free-text filter over the bulk-map project checklist. */
  bulkMapProjectSearch = '';
  bulkMapProjectIds: string[] = [];
  bulkMapDomainIds: number[] = [];

  // ---- Step 3: copy mapping from another project ----
  // REPLACE per target: "copy" means the target ends up matching the source
  // exactly. Implemented with the existing single-project replace endpoint,
  // called once per target - no new backend needed.
  copyMapModalOpen = false;
  savingCopyMap = false;
  copyMapSourceAccountName = '';
  copyMapSourceProjectId = '';
  copyMapTargetAccountName = '';
  /** Free-text filter over the copy-mapping target project checklist. */
  copyMapTargetProjectSearch = '';
  copyMapTargetProjectIds: string[] = [];

  // ---- Step 3c: Categories & Parameters (effective-dated master data) ----
  //
  // Its own sub-tab rather than a drill-down off the Domains row: it is a
  // two-level drill (domain -> category -> parameters + rubric) and needs the
  // full width, which a modal opened from a table row would not have. The
  // domain picker at the top of the tab is the entry point instead.
  //
  // Everything here is VERSIONED master data. "Save changes" on a parameter's
  // definition or rubric text does NOT rewrite the row - it end-dates it and
  // inserts a new one - because ITOPS_SCORE points at one specific parameter
  // row and reports resolve a historical score's wording by reading it back.
  catalogDomainId: number | null = null;
  catalogCategories: ItOpsCategoryRow[] = [];
  catalogShowRetired = false;
  loadingCatalog = false;
  catalogError: string | null = null;
  /** The category whose parameters are expanded below the category table. */
  catalogCategoryId: number | null = null;
  catalogParameters: ItOpsParameterRow[] = [];
  loadingCatalogParameters = false;

  // Category modals
  categoryModalOpen = false;
  savingCategory = false;
  /** null = creating, otherwise the category row being renamed. */
  categoryEditId: number | null = null;
  categoryFormName = '';

  // Parameter modals. The create form and the "new version" form share the same
  // fields, so they share the same state; parameterEditId decides which.
  parameterModalOpen = false;
  savingParameter = false;
  /** null = creating a brand-new parameter, otherwise versioning this row. */
  parameterEditId: number | null = null;
  /** The row being versioned, so the modal can warn about its live score count. */
  parameterEditing: ItOpsParameterRow | null = null;
  parameterFormName = '';
  parameterFormDefinition = '';
  parameterFormMinScore: number | null = null;
  /** Always five entries, LEVEL_NO 1-5. */
  parameterFormLevels: ItOpsParameterLevel[] = [];

  // Rename-only modal (in-place, no version)
  parameterRenameModalOpen = false;
  savingParameterRename = false;
  parameterRenameId: number | null = null;
  parameterRenameName = '';

  // Version history
  versionModalOpen = false;
  loadingVersions = false;
  versionTitle = '';
  parameterVersions: ItOpsParameterRow[] = [];

  // ---- Step 4: Configure Assessment ----
  /** Customer/account filter sitting above the Step 4 project picker. */
  assessmentAccountName = '';
  /** Free-text filter over the Step 4 project checklist. */
  assessmentProjectSearch = '';
  /** Whether the Step 4 project checklist is expanded - collapsed by default, like the Customer picker. */
  assessmentProjectsPickerOpen = false;
  /**
   * Step 5's single project (and the "current" project for Step 4's own
   * derivations). Step 4 itself selects a SET - see assessmentProjectIds - and
   * keeps this pointed at the first of them.
   */
  assessmentProjectId = '';
  /**
   * Step 4's multi-select: one Create action can seed assessments for several
   * projects at once. Same checkbox-checklist pattern as the Step 3 domain
   * mapping modal and the Step 1 project scope picker.
   */
  assessmentProjectIds: string[] = [];
  assessmentDomainPicks: number[] = [];
  assessees: ItOpsEmployee[] = [];
  assesseeSearch = '';
  assesseeResults: ItOpsEmployee[] = [];
  /** People actually staffed on the selected project(s) - what the assessee search filters over. */
  assesseeCandidates: ItOpsEmployee[] = [];
  loadingAssesseeCandidates = false;
  assessmentRows: ItOpsCycleAssessment[] = [];
  loadingAssessments = false;
  assessmentsError: string | null = null;
  creatingAssessments = false;

  // ---- Step 5: Assign Assessor / Reviewer ----
  domainTeams: DomainTeam[] = [];
  loadingTeams = false;
  teamsError: string | null = null;

  // ---- Shared people-picker modal (assessor/reviewer add) ----
  pickerModalOpen = false;
  pickerRole: 'Assessor' | 'Reviewer' = 'Assessor';
  pickerDomain = '';
  pickerAssessmentId: number | null = null;
  pickerSearch = '';
  pickerCandidates: ItOpsEmployee[] = [];
  pickerPrimaryEmpId: string | null = null;
  savingPicker = false;
  /**
   * The domain's configured DEFAULT_ASSESSOR_ID / DEFAULT_REVIEWER_ID, offered
   * as a one-click chip at the top of the picker. Null when the domain has no
   * default for this role or that person is already on the team - in both cases
   * the shortcut would be noise.
   */
  pickerDefaultEmpId: string | null = null;
  pickerDefaultName: string | null = null;

  // ---- Step 5: bulk reassignment (person X -> person Y, everywhere) ----
  // Deliberately NOT per-domain: the whole point is "this person left / changed
  // team", which spans every assessment in every cycle. Two-phase - the backend
  // is asked for a preview count first, and only a second click writes.
  reassignModalOpen = false;
  reassignFromSearch = '';
  reassignFromResults: ItOpsEmployee[] = [];
  reassignFrom: ItOpsEmployee | null = null;
  reassignToSearch = '';
  reassignToResults: ItOpsEmployee[] = [];
  reassignTo: ItOpsEmployee | null = null;
  loadingReassignPreview = false;
  savingReassign = false;
  reassignPreview: ItOpsBulkReassignResult | null = null;

  private loadedSteps = new Set<StepKey>();

  constructor(
    private api: ItOpsAdminSetupService,
    private toast: ToastService,
    private router: Router,
    private host: ElementRef<HTMLElement>,
  ) {}

  /** Closes the Step 4 project checklist when the user clicks anywhere outside it, same as the searchable-select combobox above it. */
  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDownForAssessmentProjectsPicker(event: MouseEvent): void {
    if (!this.assessmentProjectsPickerOpen) return;
    const picker = this.host.nativeElement.querySelector('.assessment-projects-picker');
    if (picker && !picker.contains(event.target as Node)) this.assessmentProjectsPickerOpen = false;
  }

  toggleAssessmentProjectsPicker(): void {
    this.assessmentProjectsPickerOpen = !this.assessmentProjectsPickerOpen;
  }

  /**
   * Nothing loads until we know what this user may do. Someone with no IT Ops
   * admin role at all is bounced back to the dashboard - the nav link is hidden
   * for them, so this only catches a direct /admin URL (and every endpoint
   * behind the screen 403s for them anyway).
   */
  ngOnInit(): void {
    this.api.getMyAccess().subscribe((access) => {
      this.access = access;
      this.accessResolved = true;

      if (!access.isAdmin) {
        this.toast.error(
          'Admin Setup is restricted.',
          'You need an IT Ops Maturity administrator role. Ask a superuser to grant one.',
        );
        this.router.navigate(['/']);
        return;
      }

      // Land on the first step this user can actually act on, not always step 1.
      const first = this.visibleSteps[0];
      if (!first) return;
      this.activeStep = first.key;
      if (first.key === 'scope') {
        const firstSubTab = this.visibleScopeSubTabs[0];
        if (firstSubTab) this.scopeSubTab = firstSubTab;
      }
      this.ensureStepLoaded(first.key);
    });
  }

  // ---- Role checks ----

  /** True if the user owns this step (superuser owns all five). */
  canUseStep(step: StepKey): boolean {
    if (!this.access) return false;
    if (this.access.isSuperuser) return true;
    if (step === 'scope') {
      return Object.values(this.scopeSubTabRoles).some((role) => this.access!.roleCodes.includes(role));
    }
    const def = this.steps.find((s) => s.key === step);
    if (!def || def.role === 'SUPERUSER') return false;
    return this.access.roleCodes.includes(def.role);
  }

  /** True if the user owns this specific Configure Scope sub-tab (superuser owns all three). */
  canUseScopeSubTab(tab: 'domains' | 'mapping' | 'catalog'): boolean {
    if (!this.access) return false;
    if (this.access.isSuperuser) return true;
    return this.access.roleCodes.includes(this.scopeSubTabRoles[tab]);
  }

  /** The Configure Scope sub-tabs this user may see, in their fixed display order. */
  get visibleScopeSubTabs(): ('domains' | 'mapping' | 'catalog')[] {
    return (['domains', 'mapping', 'catalog'] as const).filter((t) => this.canUseScopeSubTab(t));
  }

  /**
   * Only the steps this user owns are offered. Hiding beats disabling here: a
   * Cycle Administrator has no legitimate reason to browse Configure Roles, and
   * every endpoint behind a step they don't own would 403 anyway - a visible
   * but dead tab would just render an error state.
   */
  get visibleSteps(): { key: StepKey; label: string; role: string }[] {
    return this.steps.filter((s) => this.canUseStep(s.key));
  }

  get isSuperuser(): boolean {
    return !!this.access?.isSuperuser;
  }

  goToStep(step: StepKey): void {
    if (!this.canUseStep(step)) {
      this.toast.error('You do not have the role for that step.');
      return;
    }
    this.activeStep = step;
    if (step === 'scope' && !this.canUseScopeSubTab(this.scopeSubTab)) {
      const firstAllowed = this.visibleScopeSubTabs[0];
      if (firstAllowed) this.scopeSubTab = firstAllowed;
    }
    this.ensureStepLoaded(step);
  }

  /**
   * Steps load lazily on first activation. Scope/Assessment/Team always
   * re-read on every visit rather than just the first: Configure Scope's
   * domain-project mapping can change on one visit and be relied on by
   * Configure Assessment's "Domains to assess" picker on the next, so reusing
   * a stale in-memory list there let the picker show a domain as mapped
   * (checked, selectable) after it had actually been unmapped - the create
   * call then correctly rejected it server-side, but the picker itself had
   * already lied about what was safe to select.
   */
  private ensureStepLoaded(step: StepKey): void {
    if (this.loadedSteps.has(step)) {
      if (step === 'team') this.loadDomainTeams();
      if (step === 'scope') this.loadScope();
      if (step === 'assessment') {
        this.loadScope();
        this.loadAssessments();
      }
      return;
    }
    this.loadedSteps.add(step);

    switch (step) {
      case 'roles':
        this.loadRoles();
        break;
      case 'cycle':
        this.loadCycles();
        break;
      case 'scope':
        this.loadScope();
        break;
      case 'assessment':
        this.loadScope();
        this.loadCycles();
        this.loadAssessments();
        break;
      case 'team':
        this.ensureTeamContext();
        break;
    }
  }

  /**
   * Step 5 needs a cycle and a project, which normally arrive from steps 2 and
   * 4. A user who only holds TEAM_ASSIGNMENT_COORDINATOR never sees those steps,
   * so the cycle/project list is loaded here as well and defaulted - the step 5
   * pickers then let them switch.
   */
  private ensureTeamContext(): void {
    if (this.selectedCycleId && this.assessmentProjectId) {
      this.loadDomainTeams();
      return;
    }
    this.loadingTeams = true;
    forkJoin({
      cycles: this.api.getCycles().pipe(catchError(() => of([] as ItOpsAssessmentCycle[]))),
      projects: this.api.getProjects().pipe(catchError(() => of([] as ItOpsProject[]))),
      // Step 5's "Use default" shortcut in the people picker reads
      // defaultAssessorId / defaultReviewerId off the domain, and a user who only
      // holds TEAM_ASSIGNMENT_COORDINATOR never visits Step 3 to load them.
      domains: this.api.getDomains().pipe(catchError(() => of([] as ItOpsDomainAdminRow[]))),
    }).subscribe(({ cycles, projects, domains }) => {
      this.existingCycles = cycles;
      this.projects = projects;
      if (domains.length) this.domains = domains;
      if (this.selectedCycleId === null && cycles.length) {
        this.selectedCycleId = (cycles.find((c) => c.status !== 'Closed') ?? cycles[0]).id;
      }
      if (!this.assessmentProjectId && projects.length) this.assessmentProjectId = projects[0].projectId;
      this.assessmentAccountName = this.accountNameOf(this.assessmentProjectId);
      this.loadingTeams = false;
      this.loadDomainTeams();
    });
  }

  /** Step 5's own project picker (a team-only user has no Step 4 to set it from). */
  onTeamProjectChange(): void {
    this.loadDomainTeams();
  }

  onTeamCustomerChange(): void {
    this.assessmentProjectId = '';
    this.domainTeams = [];
  }

  /** 1-based position in the full five-step flow, so hidden steps don't renumber the visible ones. */
  stepNumber(step: StepKey): number {
    return this.steps.findIndex((s) => s.key === step) + 1;
  }

  /**
   * The role pill already shows the human-readable name (e.g. "Superuser") -
   * the role-code caption next to it is only useful when it actually adds
   * information (e.g. "Scope Administrator" / DOMAIN_PROJECT_MAPPER). When the
   * code is just the name shouted in caps ("Superuser" / SUPERUSER) showing
   * both reads as the same word printed twice in one row.
   */
  isRedundantRoleCode(roleName: string | null, roleCode: string | null): boolean {
    const normalize = (s: string | null) => (s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    return normalize(roleName) === normalize(roleCode);
  }

  private errorText(err: any, fallback: string): string {
    return typeof err?.error === 'string' && err.error ? err.error : err?.error?.Message || fallback;
  }

  // ==================================================================
  // Step 1: Configure Roles
  // ==================================================================

  loadRoles(): void {
    this.loadingRoles = true;
    this.rolesError = null;
    forkJoin({
      grants: this.api.getRoleAssignments().pipe(catchError(() => of(null))),
      roles: this.api.getRoles().pipe(catchError(() => of([] as ItOpsRole[]))),
    })
      .pipe(finalize(() => (this.loadingRoles = false)))
      .subscribe(({ grants, roles }) => {
        if (grants === null) {
          this.rolesError = 'Could not load role assignments.';
          this.roleGrants = [];
        } else {
          this.roleGrants = grants;
        }
        this.roleOptions = roles;
      });
  }

  /**
   * Step 1's table is one row per EMPLOYEE, not one row per grant: the same
   * person holding three roles used to repeat their name down three rows. Each
   * individual grant is still its own ITOPS_ROLE_ASSIGNMENT row with its own
   * scope, granted date and Edit/Revoke actions, so the grouping only nests
   * them under the employee - it never collapses them into one piece of text.
   *
   * Cached on the identity of roleGrants (same trick as customerSelectOptions)
   * so the template getter doesn't rebuild the array on every change-detection
   * pass and re-run *ngFor's diff.
   */
  private groupedGrantsCache: { source: ItOpsRoleAssignment[]; groups: EmployeeGrants[] } | null = null;

  get groupedRoleGrants(): EmployeeGrants[] {
    if (this.groupedGrantsCache?.source !== this.roleGrants) {
      const byEmp = new Map<string, EmployeeGrants>();
      for (const grant of this.roleGrants) {
        let entry = byEmp.get(grant.empId);
        if (!entry) {
          entry = { empId: grant.empId, empName: grant.empName, grants: [], roleGroups: [] };
          byEmp.set(grant.empId, entry);
        }
        entry.grants.push(grant);
      }
      const groups = Array.from(byEmp.values());
      for (const emp of groups) emp.roleGroups = this.groupGrantsByRole(emp.grants);
      this.groupedGrantsCache = { source: this.roleGrants, groups };
    }
    return this.groupedGrantsCache.groups;
  }

  /**
   * Second level of the Step 1 grouping: within one employee, collapse every
   * grant of the SAME role into one line. Granting "Assessment Coordinator" on
   * three projects is three DB rows that used to render as three near-identical
   * lines repeating the role name and code; they are now one line whose scopes
   * are chips. Each grant object is kept intact inside the group, so Revoke (and
   * Edit, on a single-scope group) still acts on one specific assignment id.
   */
  private groupGrantsByRole(grants: ItOpsRoleAssignment[]): RoleGrantGroup[] {
    const byRole = new Map<string, RoleGrantGroup>();
    for (const grant of grants) {
      const key = grant.roleId != null ? String(grant.roleId) : grant.roleCode ?? grant.roleName ?? '';
      let group = byRole.get(key);
      if (!group) {
        group = {
          key,
          roleId: grant.roleId,
          roleCode: grant.roleCode,
          roleName: grant.roleName,
          grants: [],
          grantedOn: grant.grantedOn,
        };
        byRole.set(key, group);
      }
      group.grants.push(grant);
      // Show the date this person first got the role, not whichever row sorted last.
      if (grant.grantedOn && (!group.grantedOn || grant.grantedOn < group.grantedOn)) {
        group.grantedOn = grant.grantedOn;
      }
    }
    return Array.from(byRole.values());
  }

  trackByEmpId(_i: number, row: EmployeeGrants): string {
    return row.empId;
  }

  trackByRoleGroup(_i: number, group: RoleGrantGroup): string {
    return group.key;
  }

  trackByGrantId(_i: number, grant: ItOpsRoleAssignment): number {
    return grant.id;
  }

  openRoleModal(): void {
    this.roleFormEmps = [];
    this.roleFormEmpSearch = '';
    this.roleFormEmpResults = [];
    this.roleFormRoleIds = [];
    this.roleFormScope = 'org';
    this.roleFormProjectIds = [];
    this.roleFormAccountName = '';
    if (!this.projects.length) this.loadProjects();
    this.roleModalOpen = true;
  }

  closeRoleModal(): void {
    this.roleModalOpen = false;
  }

  // ---- Assign-role multi-pickers ----

  isRoleFormRolePicked(roleId: number): boolean {
    return this.roleFormRoleIds.includes(roleId);
  }

  toggleRoleFormRole(roleId: number): void {
    this.roleFormRoleIds = this.isRoleFormRolePicked(roleId)
      ? this.roleFormRoleIds.filter((id) => id !== roleId)
      : [...this.roleFormRoleIds, roleId];
  }

  isRoleFormProjectPicked(projectId: string): boolean {
    return this.roleFormProjectIds.includes(projectId);
  }

  toggleRoleFormProject(projectId: string): void {
    this.roleFormProjectIds = this.isRoleFormProjectPicked(projectId)
      ? this.roleFormProjectIds.filter((id) => id !== projectId)
      : [...this.roleFormProjectIds, projectId];
  }

  /**
   * The customer filter only narrows which projects are listed - already-ticked
   * projects stay ticked so an admin can build a selection spanning customers.
   */
  onRoleFormCustomerChange(): void {
    // no-op beyond re-filtering the list the template reads
  }

  /**
   * How many ITOPS_ROLE_ASSIGNMENT rows the current selection would create -
   * one per (employee x role x scope) combination.
   */
  get roleGrantRowCount(): number {
    const scopes = this.roleFormScope === 'project' ? this.roleFormProjectIds.length : 1;
    return this.roleFormEmps.length * this.roleFormRoleIds.length * scopes;
  }

  searchRoleFormEmp(): void {
    this.api.searchEmployees(this.roleFormEmpSearch).subscribe((rows) => (this.roleFormEmpResults = rows));
  }

  /** Search-and-add: the picked employee joins the chip list, the box clears for the next one. */
  addRoleFormEmp(emp: ItOpsEmployee): void {
    if (!this.roleFormEmps.some((e) => e.empId === emp.empId)) this.roleFormEmps = [...this.roleFormEmps, emp];
    this.roleFormEmpSearch = '';
    this.roleFormEmpResults = [];
  }

  removeRoleFormEmp(emp: ItOpsEmployee): void {
    this.roleFormEmps = this.roleFormEmps.filter((e) => e.empId !== emp.empId);
  }

  isRoleFormEmpPicked(empId: string): boolean {
    return this.roleFormEmps.some((e) => e.empId === empId);
  }

  /**
   * One call grants every picked role at every picked scope to every picked
   * employee - the backend writes one row per (employee x role x project)
   * combination (or one row per employee/role with a null PROJECT_ID when
   * org-wide) in a single commit. The list is then re-read rather than patched
   * locally, same as every other mutation on this screen.
   */
  grantRole(): void {
    if (!this.roleFormEmps.length || !this.roleFormRoleIds.length) {
      this.toast.error('Pick at least one employee and at least one role first.');
      return;
    }
    const projectIds = this.roleFormScope === 'project' ? this.roleFormProjectIds : [];
    if (this.roleFormScope === 'project' && !projectIds.length) {
      this.toast.error('Pick at least one project this grant is limited to.');
      return;
    }

    const expected = this.roleGrantRowCount;
    this.savingRole = true;
    this.api
      .grantRoles(this.roleFormEmps.map((e) => e.empId), this.roleFormRoleIds, projectIds)
      .pipe(finalize(() => (this.savingRole = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            'Roles granted.',
            `${expected} grant(s) saved across ${this.roleFormEmps.length} employee(s).`,
          );
          this.closeRoleModal();
          this.loadRoles();
        },
        error: (err) => this.toast.error('Could not grant the roles.', this.errorText(err, 'Please try again.')),
      });
  }

  // ---- Edit ALL of one employee's roles (per-role scope picker) ----

  /**
   * Opens the edit modal on one EMPLOYEE, not one grant. Every role they
   * currently hold is pre-ticked and seeded with its own real scope: a role held
   * org-wide opens as "Org-wide", a role held on three projects opens as
   * "One or more projects…" with those three ticked. The two are independent, so
   * the modal can express the real mixed picture ("Cycle Administrator org-wide
   * + Assessment Coordinator on 3 projects") that the old per-grant modal could
   * not.
   */
  openEmployeeRoleEditModal(emp: EmployeeGrants): void {
    this.roleEditEmpId = emp.empId;
    this.roleEditEmpName = `${emp.empName} (${emp.empId})`;
    this.roleEditEntries = emp.roleGroups
      .filter((g) => g.roleId != null)
      .map((g) => {
        const projectIds = g.grants.map((x) => x.projectId).filter((p): p is string => !!p);
        return {
          roleId: g.roleId,
          roleName: g.roleName ?? g.roleCode ?? String(g.roleId),
          scope: projectIds.length ? ('project' as const) : ('org' as const),
          projectIds,
          accountName: '',
          projectSearch: '',
        };
      });

    const seedAccounts = () => {
      for (const entry of this.roleEditEntries) {
        entry.accountName = this.accountNameOf(entry.projectIds[0] ?? '');
      }
    };
    if (this.projects.length) {
      seedAccounts();
    } else {
      // loadProjects() is async - accountNameOf() would run against an empty
      // list if called right after firing it, leaving each customer field blank
      // even though projects are already ticked. Backfill once it resolves.
      this.loadProjects(seedAccounts);
    }
    this.roleEditModalOpen = true;
  }

  closeRoleEditModal(): void {
    this.roleEditModalOpen = false;
    this.roleEditEntries = [];
  }

  // ---- Per-role edit state helpers ----

  isRoleEditRolePicked(roleId: number): boolean {
    return this.roleEditEntries.some((e) => e.roleId === roleId);
  }

  roleEditEntry(roleId: number): RoleScopeEdit | null {
    return this.roleEditEntries.find((e) => e.roleId === roleId) ?? null;
  }

  /**
   * Ticking a role the employee doesn't hold adds an entry defaulted to
   * org-wide (the simplest default - the admin can switch it before saving);
   * unticking removes the entry entirely, which is what "remove this role from
   * this person" means on save.
   */
  toggleRoleEditRole(roleId: number): void {
    if (this.isRoleEditRolePicked(roleId)) {
      this.roleEditEntries = this.roleEditEntries.filter((e) => e.roleId !== roleId);
      return;
    }
    const opt = this.roleOptions.find((r) => r.roleId === roleId);
    this.roleEditEntries = [
      ...this.roleEditEntries,
      { roleId, roleName: opt?.roleName ?? String(roleId), scope: 'org', projectIds: [], accountName: '', projectSearch: '' },
    ];
  }

  isRoleEditProjectPicked(roleId: number, projectId: string): boolean {
    return !!this.roleEditEntry(roleId)?.projectIds.includes(projectId);
  }

  toggleRoleEditProject(roleId: number, projectId: string): void {
    const entry = this.roleEditEntry(roleId);
    if (!entry) return;
    entry.projectIds = entry.projectIds.includes(projectId)
      ? entry.projectIds.filter((id) => id !== projectId)
      : [...entry.projectIds, projectId];
  }

  trackByRoleEditEntry(_i: number, entry: RoleScopeEdit): number {
    return entry.roleId;
  }

  /** How many ITOPS_ROLE_ASSIGNMENT rows this employee will end up with. */
  get roleEditRowCount(): number {
    return this.roleEditEntries.reduce(
      (sum, e) => sum + (e.scope === 'project' ? e.projectIds.length : 1),
      0,
    );
  }

  /** Stable key for one desired/current grant: role + scope. */
  private grantKey(roleId: number, projectId: string | null): string {
    return `${roleId}|${projectId ?? ''}`;
  }

  /**
   * Saves the employee's WHOLE role picture as a diff, never as a blanket
   * revoke-and-regrant: a role whose desired scope already matches what's in the
   * DB is skipped entirely, so its GRANTED_ON date is left alone. Everything the
   * employee has that the desired state no longer contains is revoked (a role
   * dropped, a project dropped from a role's scope, or a scope-type flip in
   * either direction); everything desired that doesn't already exist is granted.
   * GrantITOpsRoles is a single RoleIds x ProjectIds cartesian product, so it
   * cannot mix scopes - it is called once per role with that role's own project
   * list (empty for org-wide). Only this employee's rows are ever touched.
   */
  saveRoleEdit(): void {
    if (!this.roleEditEmpId) return;
    const empId = this.roleEditEmpId;
    const badScope = this.roleEditEntries.find((e) => e.scope === 'project' && !e.projectIds.length);
    if (badScope) {
      this.toast.error(`Pick at least one project for ${badScope.roleName}, or set it to org-wide.`);
      return;
    }

    // Desired state: one (role, scope) pair per row this employee should have.
    const desired = new Map<string, { roleId: number; projectId: string | null }>();
    for (const entry of this.roleEditEntries) {
      if (entry.scope === 'org') {
        desired.set(this.grantKey(entry.roleId, null), { roleId: entry.roleId, projectId: null });
      } else {
        for (const projectId of entry.projectIds) {
          desired.set(this.grantKey(entry.roleId, projectId), { roleId: entry.roleId, projectId });
        }
      }
    }

    const current = this.roleGrants.filter((g) => g.empId === empId);
    const currentKeys = new Set(current.map((g) => this.grantKey(g.roleId, g.projectId ?? null)));

    const toRevoke = current.filter((g) => !desired.has(this.grantKey(g.roleId, g.projectId ?? null)));

    // Group the missing grants back up by role: one grantRoles call per role,
    // carrying only that role's own scope.
    const calls: Observable<unknown>[] = toRevoke.map((g) => this.api.revokeRole(g.id));
    let grantedRows = 0;
    for (const entry of this.roleEditEntries) {
      if (entry.scope === 'org') {
        if (currentKeys.has(this.grantKey(entry.roleId, null))) continue; // no-op role
        calls.push(this.api.grantRoles([empId], [entry.roleId], []));
        grantedRows += 1;
      } else {
        const missing = entry.projectIds.filter((p) => !currentKeys.has(this.grantKey(entry.roleId, p)));
        if (!missing.length) continue; // no-op role (or only shrunk, handled by toRevoke)
        calls.push(this.api.grantRoles([empId], [entry.roleId], missing));
        grantedRows += missing.length;
      }
    }

    // Identical desired vs. current across the whole employee - write nothing.
    if (!calls.length) {
      this.closeRoleEditModal();
      return;
    }

    const revokedRows = toRevoke.length;
    this.savingRoleEdit = true;
    forkJoin(calls)
      .pipe(finalize(() => (this.savingRoleEdit = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            'Roles updated.',
            `${grantedRows} grant(s) added, ${revokedRows} revoked. Unchanged roles were left as they were.`,
          );
          this.closeRoleEditModal();
          this.loadRoles();
        },
        error: (err) => {
          this.toast.error('Could not update the roles.', this.errorText(err, 'Please try again.'));
          // Some of the parallel calls may already have landed - re-read so the
          // table shows what is actually persisted rather than the pre-edit state.
          this.loadRoles();
        },
      });
  }

  revokeRole(grant: ItOpsRoleAssignment): void {
    this.revokingRoleId = grant.id;
    this.api
      .revokeRole(grant.id)
      .pipe(finalize(() => (this.revokingRoleId = null)))
      .subscribe({
        next: () => {
          this.toast.success('Role revoked.', `${grant.empName} no longer holds ${grant.roleName}.`);
          this.loadRoles();
        },
        error: (err) => this.toast.error('Could not revoke the role.', this.errorText(err, 'Please try again.')),
      });
  }

  // ---- Audit trail (grant / revoke history) ----

  /**
   * Opens the history panel. Passing an employee narrows the trail to that one
   * person (the backend takes an optional empId); with no argument the whole
   * trail is loaded. Every row is one ITOPS_ROLE_ASSIGNMENT that was ever
   * created, active or since revoked - revokes are soft-deletes, so an inactive
   * row's UPDATED_BY/UPDATED_DATE IS the revoke event.
   */
  openAuditTrail(emp?: EmployeeGrants): void {
    this.auditEmpName = emp ? `${emp.empName} (${emp.empId})` : null;
    this.auditRows = [];
    this.auditError = null;
    this.auditModalOpen = true;
    this.loadingAudit = true;
    this.api
      .getRoleAssignmentHistory(emp?.empId)
      .pipe(finalize(() => (this.loadingAudit = false)))
      .subscribe({
        next: (rows) => (this.auditRows = rows),
        error: () => {
          this.auditError = 'Could not load the role audit trail.';
          this.auditRows = [];
        },
      });
  }

  closeAuditTrail(): void {
    this.auditModalOpen = false;
    this.auditRows = [];
  }

  trackByAuditRow(_i: number, row: ItOpsRoleAssignmentHistory): number {
    return row.id;
  }

  /** "Currently active" vs "Granted then revoked" - the row's own state says which. */
  auditStateLabel(row: ItOpsRoleAssignmentHistory): string {
    return row.isActive ? 'Currently active' : 'Granted then revoked';
  }

  auditStateTone(row: ItOpsRoleAssignmentHistory): 'good' | 'critical' {
    return row.isActive ? 'good' : 'critical';
  }

  /**
   * An active row whose UPDATED stamp is later than its CREATED stamp was
   * re-granted or edited rather than revoked, so it must not be captioned as a
   * revoke. Only an INACTIVE row's update is a revoke.
   */
  auditWasRevoked(row: ItOpsRoleAssignmentHistory): boolean {
    return !row.isActive;
  }

  /** True when an active row has been touched since it was created (re-grant / scope edit). */
  auditWasUpdated(row: ItOpsRoleAssignmentHistory): boolean {
    return row.isActive && !!row.updatedDate && row.updatedDate > row.createdDate;
  }

  // ---- Effective access preview ----

  /**
   * "What can this person actually do?" - answered entirely from grants already
   * in memory, no extra call. A grant of a step's owning role reaches that step;
   * holding SUPERUSER reaches all five. Scope is collapsed per role: if ANY
   * grant of that role is org-wide the effective scope is "All projects",
   * because the org-wide row already covers everything the project-scoped rows
   * would have limited them to; only when EVERY grant is project-scoped does a
   * project list mean anything.
   */
  openAccessPreview(emp: EmployeeGrants): void {
    this.accessPreviewEmpName = `${emp.empName} (${emp.empId})`;
    this.accessPreviewSuperuser = emp.roleGroups.some((g) => g.roleCode === 'SUPERUSER');
    this.accessPreviewSteps = this.steps.map((step) => {
      const group = emp.roleGroups.find((g) => g.roleCode === step.role);
      // Step 1 is owned by SUPERUSER, so its own mapping already covers it.
      const canReach = !!group || this.accessPreviewSuperuser;
      const viaSuperuser = this.accessPreviewSuperuser && step.role !== 'SUPERUSER';
      const allProjects = this.accessPreviewSuperuser || !group || group.grants.some((g) => !g.projectId);
      const projectNames = allProjects
        ? []
        : Array.from(
            new Set((group?.grants ?? []).map((g) => g.projectName || g.projectId).filter((n): n is string => !!n)),
          );
      return {
        key: step.key,
        label: step.label,
        role: step.role,
        number: this.stepNumber(step.key),
        canReach,
        viaSuperuser,
        allProjects,
        projectNames,
      };
    });
    this.accessPreviewOpen = true;
  }

  closeAccessPreview(): void {
    this.accessPreviewOpen = false;
    this.accessPreviewSteps = [];
  }

  trackByPreviewStep(_i: number, step: AccessPreviewStep): string {
    return step.key;
  }

  /** How many of the five steps this person can reach (preview header caption). */
  get accessPreviewReachCount(): number {
    return this.accessPreviewSteps.filter((s) => s.canReach).length;
  }

  // ==================================================================
  // Step 2: Configure Cycle
  // ==================================================================

  setCycleMode(mode: 'existing' | 'new'): void {
    this.cycleMode = mode;
  }

  loadCycles(): void {
    this.loadingCycles = true;
    this.cyclesError = null;
    this.api
      .getCycles()
      .pipe(finalize(() => (this.loadingCycles = false)))
      .subscribe({
        next: (rows) => {
          this.existingCycles = rows;
          if (this.selectedCycleId === null && rows.length) {
            // Default to the newest still-open cycle - that's the one assessments seed into.
            const open = rows.find((c) => c.status !== 'Closed') ?? rows[0];
            this.selectedCycleId = open.id;
          }
          // Nothing to select yet -> the "existing" tab is useless, land on "new".
          if (!rows.length) this.cycleMode = 'new';
        },
        error: () => {
          this.cyclesError = 'Could not load assessment cycles.';
          this.existingCycles = [];
        },
      });
  }

  get selectedCycle(): ItOpsAssessmentCycle | null {
    return this.existingCycles.find((c) => c.id === this.selectedCycleId) ?? null;
  }

  cycleLabelFor(cycle: ItOpsAssessmentCycle): string {
    const start = cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : '';
    const end = cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : '';
    return `${cycle.cycleLabel} — ${start} to ${end} (${cycle.status ?? 'Open'})`;
  }

  // ---- Cycle completion dashboard (Step 2 list) ----
  // Everything below reads straight off GetITOpsAssessmentCycles, which now
  // returns the per-status breakdown and completion % across every project in
  // the cycle - so "how far has this cycle got?" is answered here rather than
  // only in Reports.

  trackByCycleId(_i: number, cycle: ItOpsAssessmentCycle): number {
    return cycle.id;
  }

  trackByCycleStatus(_i: number, row: ItOpsCycleStatusCount): string {
    return row.status;
  }

  /** Completion is "Approved or Closed" over all assessments in the cycle. */
  cycleCompletionTone(cycle: ItOpsAssessmentCycle): 'good' | 'warning' | 'muted' {
    if (!cycle.assessmentCount) return 'muted';
    if (cycle.completionPercent >= 100) return 'good';
    return cycle.completionPercent > 0 ? 'warning' : 'muted';
  }

  createCycle(): void {
    if (!this.newCycleLabel.trim()) {
      this.toast.error('A cycle label is required.');
      return;
    }
    if (!this.newCycleStart || !this.newCycleEnd) {
      this.toast.error('Both a start date and an end date are required.');
      return;
    }
    if (this.newCycleEnd <= this.newCycleStart) {
      this.toast.error('The end date must be later than the start date.');
      return;
    }

    this.savingCycle = true;
    this.api
      .createCycle(this.newCycleLabel.trim(), this.newCycleStart, this.newCycleEnd)
      .pipe(finalize(() => (this.savingCycle = false)))
      .subscribe({
        next: (created) => {
          this.toast.success('Cycle created.', created.cycleLabel);
          this.newCycleLabel = '';
          this.selectedCycleId = created.id;
          this.loadCycles();
          // Only advance if this user actually owns Configure Scope - a plain
          // Cycle Administrator's job ends here.
          if (this.canUseStep('scope')) this.goToStep('scope');
        },
        error: (err) =>
          // The backend returns a clean 409 for a duplicate label / bad date range.
          this.toast.error('Could not create the cycle.', this.errorText(err, 'Please try again.')),
      });
  }

  /** Step 2's primary button: create-then-continue in "new" mode, plain continue in "existing" mode. */
  saveCycleAndContinue(): void {
    if (this.cycleMode === 'new') {
      this.createCycle();
      return;
    }
    if (!this.selectedCycleId) {
      this.toast.error('Pick a cycle first, or start a new one.');
      return;
    }
    if (this.canUseStep('scope')) this.goToStep('scope');
  }

  // ==================================================================
  // Step 3: Configure Scope
  // ==================================================================

  setScopeSubTab(tab: 'domains' | 'mapping' | 'catalog'): void {
    if (!this.canUseScopeSubTab(tab)) return;
    this.scopeSubTab = tab;
    if (tab === 'catalog') {
      if (this.catalogDomainId === null && this.domains.length) this.catalogDomainId = this.domains[0].domainId;
      if (this.catalogDomainId !== null && !this.catalogCategories.length) this.loadCatalog();
    }
  }

  loadScope(): void {
    this.loadingScope = true;
    this.scopeError = null;
    forkJoin({
      domains: this.api.getDomains().pipe(catchError(() => of(null))),
      mappings: this.api.getDomainProjectMappings().pipe(catchError(() => of(null))),
      projects: this.api.getProjects().pipe(catchError(() => of([] as ItOpsProject[]))),
    })
      .pipe(finalize(() => (this.loadingScope = false)))
      .subscribe(({ domains, mappings, projects }) => {
        if (domains === null || mappings === null) this.scopeError = 'Could not load scope configuration.';
        this.domains = domains ?? [];
        this.mappings = mappings ?? [];
        this.projects = projects;
        // Categories & Parameters is a sub-tab of this same step, so seed its
        // domain picker from the same load rather than making it fetch again.
        if (this.catalogDomainId === null && this.domains.length) this.catalogDomainId = this.domains[0].domainId;
        // Neither "+ New mapping" (Step 3) nor "Configure Assessment" (Step 4)
        // auto-selects any project, ever - not the first one in the list, and
        // not whatever was most recently configured. Every project choice on
        // this screen is an explicit admin action; a silent default (of any
        // kind) was confusing precisely because it looked like a real
        // selection when it wasn't one.
        // Keep each customer picker in step with whatever project is already selected,
        // otherwise the project would sit outside its own (empty) filtered list.
        this.mappingModalAccountName = this.accountNameOf(this.mappingModalProjectId);
        this.assessmentAccountName = this.accountNameOf(this.assessmentProjectId);
        // Mapping may have changed since assessmentDomainPicks was last set (e.g.
        // a domain was unmapped on a prior visit to this same tab) - drop any pick
        // that's no longer actually mapped to the selected project, so the picker
        // can never show a checked domain the backend would reject.
        const stillMappable = new Set(this.mappableDomains.map((d) => d.domainId));
        this.assessmentDomainPicks = this.assessmentDomainPicks.filter((id) => stillMappable.has(id));
        // Same bypass as above applies to the assessee candidate pool - only
        // fetch if it hasn't been loaded for this project set yet.
        if (this.assessmentProjectIds.length && !this.assesseeCandidates.length && !this.loadingAssesseeCandidates) {
          this.loadAssesseeCandidates();
        }
      });
  }

  /**
   * Distinct customer/account names, derived client-side from the already-loaded
   * project list - GetITOpsProjects already returns accountName per project, so
   * no separate customer endpoint is needed.
   */
  get customerOptions(): string[] {
    return Array.from(new Set(this.projects.map((p) => p.accountName).filter((n): n is string => !!n))).sort((a, b) =>
      a.localeCompare(b),
    );
  }

  /**
   * Projects belonging to the given customer, further narrowed by a free-text
   * search over the project id/name (the customer filter alone isn't enough
   * once one customer has dozens of projects - e.g. BCBSA). Blank customer or
   * search means "no filter" for that part.
   */
  projectsForCustomer(accountName: string, search?: string): ItOpsProject[] {
    let rows = accountName ? this.projects.filter((p) => p.accountName === accountName) : this.projects;
    const needle = (search ?? '').trim().toLowerCase();
    if (needle) {
      rows = rows.filter(
        (p) => p.projectId.toLowerCase().includes(needle) || (p.projectName ?? '').toLowerCase().includes(needle),
      );
    }
    return rows;
  }

  private accountNameOf(projectId: string): string {
    return this.projects.find((p) => p.projectId === projectId)?.accountName ?? '';
  }

  private loadProjects(onLoaded?: () => void): void {
    this.api
      .getProjects()
      .pipe(catchError(() => of([] as ItOpsProject[])))
      .subscribe((rows) => {
        this.projects = rows;
        onLoaded?.();
      });
  }

  // ---- Options for the searchable customer/project comboboxes ----
  // Cached by (projects identity + customer filter) so the template getters
  // don't hand <app-searchable-select> a brand-new array on every change
  // detection pass.
  private customerOptionCache: { source: ItOpsProject[]; options: SearchableSelectOption[] } | null = null;
  private projectOptionCache = new Map<string, { source: ItOpsProject[]; options: SearchableSelectOption[] }>();

  get customerSelectOptions(): SearchableSelectOption[] {
    if (this.customerOptionCache?.source !== this.projects) {
      this.customerOptionCache = {
        source: this.projects,
        options: this.customerOptions.map((c) => ({ value: c, label: c })),
      };
    }
    return this.customerOptionCache.options;
  }

  projectSelectOptions(accountName: string): SearchableSelectOption[] {
    const key = accountName ?? '';
    const cached = this.projectOptionCache.get(key);
    if (cached?.source === this.projects) return cached.options;
    const options = this.projectsForCustomer(key).map((p) => ({ value: p.projectId, label: this.projectLabel(p) }));
    this.projectOptionCache.set(key, { source: this.projects, options });
    return options;
  }

  projectLabel(project: ItOpsProject): string {
    return `${project.projectId} — ${project.projectName}${project.accountName ? ' (' + project.accountName + ')' : ''}`;
  }

  // ---- Domains sub-tab ----

  /**
   * A domain carries only its name here. Assessors and reviewers are assigned per
   * assessment in Step 5, so exposing a competing "default assessor/reviewer" on
   * the domain itself only made the two places look interchangeable. Creating
   * domains is no longer done from this screen either - only renaming.
   */
  openDomainEditModal(domain: ItOpsDomainAdminRow): void {
    this.domainEditId = domain.domainId;
    this.domainFormName = domain.name;
    this.domainEditModalOpen = true;
  }

  closeDomainEditModal(): void {
    this.domainEditModalOpen = false;
    this.domainEditId = null;
  }

  saveDomainName(): void {
    if (this.domainEditId === null) return;
    if (!this.domainFormName.trim()) {
      this.toast.error('A domain name is required.');
      return;
    }
    this.savingDomain = true;
    this.api
      .updateDomain(this.domainEditId, this.domainFormName.trim())
      .pipe(finalize(() => (this.savingDomain = false)))
      .subscribe({
        next: (row) => {
          this.toast.success('Domain renamed.', row?.name ?? this.domainFormName.trim());
          this.closeDomainEditModal();
          this.loadScope();
        },
        error: (err) => this.toast.error('Could not rename the domain.', this.errorText(err, 'Please try again.')),
      });
  }

  // ---- Domain-Project mapping sub-tab ----

  /**
   * Opens with no project pre-selected unless one is passed explicitly (e.g. a
   * row's "Edit" button) - it should never silently default to an arbitrary
   * "first project in the list" that has nothing to do with what the admin
   * actually wants to map.
   */
  openMappingModal(projectId?: string): void {
    this.mappingModalProjectId = projectId ?? '';
    this.mappingModalAccountName = this.accountNameOf(this.mappingModalProjectId);
    // Pre-tick whatever is already mapped - the save is replace-semantics, so the
    // modal must open showing the CURRENT set, not an empty one.
    this.syncMappingModalSelection();
    this.mappingModalOpen = true;
  }

  onMappingModalProjectChange(): void {
    this.syncMappingModalSelection();
  }

  /** Changing the customer narrows the project list, so the old project no longer applies. */
  onMappingModalCustomerChange(): void {
    this.mappingModalProjectId = '';
    this.syncMappingModalSelection();
  }

  private syncMappingModalSelection(): void {
    const existing = this.mappings.find((m) => m.projectId === this.mappingModalProjectId);
    this.mappingModalDomainIds = existing ? existing.domains.map((d) => d.domainId) : [];
  }

  isMappingDomainSelected(domainId: number): boolean {
    return this.mappingModalDomainIds.includes(domainId);
  }

  toggleMappingDomain(domainId: number): void {
    this.mappingModalDomainIds = this.isMappingDomainSelected(domainId)
      ? this.mappingModalDomainIds.filter((id) => id !== domainId)
      : [...this.mappingModalDomainIds, domainId];
  }

  closeMappingModal(): void {
    this.mappingModalOpen = false;
  }

  saveMapping(): void {
    if (!this.mappingModalProjectId) {
      this.toast.error('Pick a project first.');
      return;
    }
    this.savingMapping = true;
    this.api
      .saveDomainProjectMapping(this.mappingModalProjectId, this.mappingModalDomainIds)
      .pipe(finalize(() => (this.savingMapping = false)))
      .subscribe({
        next: () => {
          this.toast.success('Mapping saved.');
          this.closeMappingModal();
          this.loadScope();
        },
        error: (err) => this.toast.error('Could not save the mapping.', this.errorText(err, 'Please try again.')),
      });
  }

  removeMappedDomain(row: ItOpsDomainProjectMapping, domain: { domainId: number; domainName: string }): void {
    this.api.removeDomainProjectMapping(row.projectId, domain.domainId).subscribe({
      next: () => {
        this.toast.success('Domain unmapped.', `${domain.domainName} removed from ${row.projectName ?? row.projectId}.`);
        this.loadScope();
      },
      error: (err) => this.toast.error('Could not remove the mapping.', this.errorText(err, 'Please try again.')),
    });
  }

  // ---- Bulk mapping: many domains x many projects, ADDITIVE ----
  //
  // Why additive rather than the bulk form of saveMapping()'s replace: mapping
  // domain D to project P is always a valid standalone addition - there is no
  // "must be common to every project" constraint like Step 4's assessment
  // picker has (there the domain has to already BE mapped everywhere). A bulk
  // REPLACE, by contrast, would deactivate every domain a selected project has
  // that isn't in the ticked list, across projects the admin never opened. So
  // this action only ever adds/reactivates, and the single-project modal stays
  // the tool for "this project's set should be exactly these three".

  openBulkMapModal(): void {
    this.bulkMapAccountName = '';
    this.bulkMapProjectIds = [];
    this.bulkMapDomainIds = [];
    if (!this.projects.length) this.loadProjects();
    this.bulkMapModalOpen = true;
  }

  closeBulkMapModal(): void {
    this.bulkMapModalOpen = false;
  }

  /** The customer filter only narrows the list - already-ticked projects stay ticked. */
  onBulkMapCustomerChange(): void {
    // no-op beyond re-filtering the list the template reads
  }

  isBulkMapProjectPicked(projectId: string): boolean {
    return this.bulkMapProjectIds.includes(projectId);
  }

  toggleBulkMapProject(projectId: string): void {
    this.bulkMapProjectIds = this.isBulkMapProjectPicked(projectId)
      ? this.bulkMapProjectIds.filter((id) => id !== projectId)
      : [...this.bulkMapProjectIds, projectId];
  }

  toggleAllBulkMapProjects(): void {
    const visible = this.projectsForCustomer(this.bulkMapAccountName, this.bulkMapProjectSearch).map((p) => p.projectId);
    this.bulkMapProjectIds = this.allVisibleBulkMapProjectsPicked
      ? this.bulkMapProjectIds.filter((id) => !visible.includes(id))
      : Array.from(new Set([...this.bulkMapProjectIds, ...visible]));
  }

  get allVisibleBulkMapProjectsPicked(): boolean {
    const visible = this.projectsForCustomer(this.bulkMapAccountName, this.bulkMapProjectSearch).map((p) => p.projectId);
    return visible.length > 0 && visible.every((id) => this.bulkMapProjectIds.includes(id));
  }

  isBulkMapDomainPicked(domainId: number): boolean {
    return this.bulkMapDomainIds.includes(domainId);
  }

  toggleBulkMapDomain(domainId: number): void {
    this.bulkMapDomainIds = this.isBulkMapDomainPicked(domainId)
      ? this.bulkMapDomainIds.filter((id) => id !== domainId)
      : [...this.bulkMapDomainIds, domainId];
  }

  /** Every (project x domain) combination the current selection covers. */
  get bulkMapPlannedCount(): number {
    return this.bulkMapProjectIds.length * this.bulkMapDomainIds.length;
  }

  /** How many of those are already mapped and will simply be left alone. */
  get bulkMapExistingCount(): number {
    let count = 0;
    for (const projectId of this.bulkMapProjectIds) {
      const mapped = new Set((this.mappings.find((m) => m.projectId === projectId)?.domains ?? []).map((d) => d.domainId));
      for (const domainId of this.bulkMapDomainIds) if (mapped.has(domainId)) count++;
    }
    return count;
  }

  /** Combinations that would actually become new mappings (the headline number). */
  get bulkMapNewCount(): number {
    return this.bulkMapPlannedCount - this.bulkMapExistingCount;
  }

  saveBulkMapping(): void {
    if (!this.bulkMapProjectIds.length) {
      this.toast.error('Pick at least one project first.');
      return;
    }
    if (!this.bulkMapDomainIds.length) {
      this.toast.error('Pick at least one domain first.');
      return;
    }

    const added = this.bulkMapNewCount;
    const unchanged = this.bulkMapExistingCount;
    const projectCount = this.bulkMapProjectIds.length;
    this.savingBulkMap = true;
    this.api
      .bulkAddDomainProjectMappings(this.bulkMapProjectIds, this.bulkMapDomainIds)
      .pipe(finalize(() => (this.savingBulkMap = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            'Mappings added.',
            `${added} new mapping(s) across ${projectCount} project(s); ${unchanged} already existed. Nothing else was removed.`,
          );
          this.closeBulkMapModal();
          this.loadScope();
        },
        error: (err) => this.toast.error('Could not add the mappings.', this.errorText(err, 'Please try again.')),
      });
  }

  // ---- Copy one project's domain set onto other projects ----
  //
  // REPLACE per target, not additive: "copy P1's mapping to P2" reads as "make
  // P2 match P1", and the primary case is onboarding a project with no mappings
  // at all, where the two are identical anyway. A target that already has extra
  // domains loses them, so the modal says so explicitly before the click.
  // Implemented on the existing single-project replace endpoint, once per
  // target - no new backend code.

  openCopyMapModal(sourceProjectId?: string): void {
    this.copyMapSourceProjectId = sourceProjectId ?? '';
    this.copyMapSourceAccountName = this.accountNameOf(this.copyMapSourceProjectId);
    this.copyMapTargetAccountName = '';
    this.copyMapTargetProjectIds = [];
    if (!this.projects.length) this.loadProjects();
    this.copyMapModalOpen = true;
  }

  closeCopyMapModal(): void {
    this.copyMapModalOpen = false;
  }

  /** Changing the customer narrows the source list, so the old source no longer applies. */
  onCopyMapSourceCustomerChange(): void {
    this.copyMapSourceProjectId = '';
  }

  /** A project can't be both source and target, so picking a new source drops it from the targets. */
  onCopyMapSourceChange(): void {
    this.copyMapTargetProjectIds = this.copyMapTargetProjectIds.filter((id) => id !== this.copyMapSourceProjectId);
  }

  onCopyMapTargetCustomerChange(): void {
    // Filter only - ticked targets are kept, so a copy can span customers.
  }

  isCopyMapTargetPicked(projectId: string): boolean {
    return this.copyMapTargetProjectIds.includes(projectId);
  }

  /** The source can never be one of its own targets - copying onto itself is a no-op. */
  toggleCopyMapTarget(projectId: string): void {
    if (projectId === this.copyMapSourceProjectId) return;
    this.copyMapTargetProjectIds = this.isCopyMapTargetPicked(projectId)
      ? this.copyMapTargetProjectIds.filter((id) => id !== projectId)
      : [...this.copyMapTargetProjectIds, projectId];
  }

  /** The source project's CURRENT active domain mappings - what would be copied. */
  get copyMapSourceDomains(): { domainId: number; domainName: string }[] {
    return this.mappings.find((m) => m.projectId === this.copyMapSourceProjectId)?.domains ?? [];
  }

  /**
   * Targets that already have mappings of their own, and so would LOSE domains
   * the source doesn't have. Surfaced in the modal so replace is never silent.
   */
  get copyMapOverwriteTargets(): string[] {
    const sourceIds = new Set(this.copyMapSourceDomains.map((d) => d.domainId));
    return this.copyMapTargetProjectIds
      .map((projectId) => this.mappings.find((m) => m.projectId === projectId))
      .filter((row): row is ItOpsDomainProjectMapping => !!row && row.domains.some((d) => !sourceIds.has(d.domainId)))
      .map((row) => row.projectName ?? row.projectId);
  }

  copyMapping(): void {
    if (!this.copyMapSourceProjectId) {
      this.toast.error('Pick the project to copy from first.');
      return;
    }
    if (!this.copyMapTargetProjectIds.length) {
      this.toast.error('Pick at least one project to copy onto.');
      return;
    }
    const domainIds = this.copyMapSourceDomains.map((d) => d.domainId);
    if (!domainIds.length) {
      this.toast.error('That project has no mapped domains to copy.');
      return;
    }

    const targets = [...this.copyMapTargetProjectIds];
    this.savingCopyMap = true;
    forkJoin(targets.map((projectId) => this.api.saveDomainProjectMapping(projectId, domainIds)))
      .pipe(finalize(() => (this.savingCopyMap = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            'Mapping copied.',
            `${targets.length} project(s) now carry the same ${domainIds.length} domain(s).`,
          );
          this.closeCopyMapModal();
          this.loadScope();
        },
        error: (err) => {
          this.toast.error('Could not copy the mapping.', this.errorText(err, 'Please try again.'));
          // Some targets may already have been written - re-read so the table
          // shows what actually persisted.
          this.loadScope();
        },
      });
  }

  // ==================================================================
  // Step 3c: Categories & Parameters (versioned master data)
  // ==================================================================
  //
  // The one thing to understand here: ITOPS_CATEGORY and ITOPS_PARAMETER rows
  // are VERSIONS, not records. A row's substantive content (a parameter's
  // definition, its minimum required score, and its five rubric levels) is
  // never rewritten - saving it end-dates the current row and inserts a new one
  // effective today, so an assessment that already scored the old row keeps
  // resolving to the exact wording it was scored against. Only the name and the
  // display order are true in-place edits, because nothing historical is
  // reconstructed from either.

  loadCatalog(): void {
    if (this.catalogDomainId === null) {
      this.catalogCategories = [];
      this.catalogParameters = [];
      return;
    }
    this.loadingCatalog = true;
    this.catalogError = null;
    this.api
      .getCategoriesForDomain(this.catalogDomainId, this.catalogShowRetired)
      .pipe(finalize(() => (this.loadingCatalog = false)))
      .subscribe({
        next: (rows) => {
          this.catalogCategories = rows;
          // Keep the expanded category if it survived the reload, otherwise collapse.
          if (this.catalogCategoryId !== null && !rows.some((r) => r.categoryId === this.catalogCategoryId)) {
            this.catalogCategoryId = null;
            this.catalogParameters = [];
          } else if (this.catalogCategoryId !== null) {
            this.loadCatalogParameters();
          }
        },
        error: () => {
          this.catalogError = 'Could not load categories for this domain.';
          this.catalogCategories = [];
          this.catalogParameters = [];
        },
      });
  }

  onCatalogDomainChange(): void {
    this.catalogCategoryId = null;
    this.catalogParameters = [];
    this.loadCatalog();
  }

  /** Reveal/hide expired (end-dated) versions alongside the ones in effect today. */
  toggleCatalogRetired(): void {
    this.catalogShowRetired = !this.catalogShowRetired;
    this.loadCatalog();
  }

  get catalogDomainName(): string {
    return this.domains.find((d) => d.domainId === this.catalogDomainId)?.name ?? '';
  }

  trackByCategoryId(_i: number, row: ItOpsCategoryRow): number {
    return row.categoryId;
  }

  trackByParameterId(_i: number, row: ItOpsParameterRow): number {
    return row.parameterId;
  }

  trackByLevelNo(_i: number, level: ItOpsParameterLevel): number {
    return level.levelNo;
  }

  /** Clicking a category row expands its parameters underneath it; clicking again collapses. */
  toggleCategory(row: ItOpsCategoryRow): void {
    if (this.catalogCategoryId === row.categoryId) {
      this.catalogCategoryId = null;
      this.catalogParameters = [];
      return;
    }
    this.catalogCategoryId = row.categoryId;
    this.loadCatalogParameters();
  }

  private loadCatalogParameters(): void {
    if (this.catalogCategoryId === null) return;
    this.loadingCatalogParameters = true;
    this.api
      .getParametersForCategory(this.catalogCategoryId, this.catalogShowRetired)
      .pipe(finalize(() => (this.loadingCatalogParameters = false)))
      .subscribe({
        next: (rows) => (this.catalogParameters = rows),
        error: (err) => {
          this.catalogParameters = [];
          this.toast.error('Could not load parameters.', this.errorText(err, 'Please try again.'));
        },
      });
  }

  get expandedCategory(): ItOpsCategoryRow | null {
    return this.catalogCategories.find((c) => c.categoryId === this.catalogCategoryId) ?? null;
  }

  /** Effective-date range as one human string: "from 01/04/2026" / "01/04/2026 – 12/08/2026". */
  effectiveRange(startDate: string, endDate: string | null): string {
    const start = startDate ? new Date(startDate).toLocaleDateString() : '';
    if (!endDate) return `From ${start}`;
    return `${start} – ${new Date(endDate).toLocaleDateString()}`;
  }

  // ---- Categories ----

  openCategoryCreateModal(): void {
    if (this.catalogDomainId === null) {
      this.toast.error('Pick a domain first.');
      return;
    }
    this.categoryEditId = null;
    this.categoryFormName = '';
    this.categoryModalOpen = true;
  }

  openCategoryRenameModal(row: ItOpsCategoryRow): void {
    this.categoryEditId = row.categoryId;
    this.categoryFormName = row.name;
    this.categoryModalOpen = true;
  }

  closeCategoryModal(): void {
    this.categoryModalOpen = false;
    this.categoryEditId = null;
  }

  /**
   * Create inserts a row effective today; rename is an in-place update applied
   * across every version in the lineage (the name is the lineage key, so all
   * versions must carry the same one).
   */
  saveCategory(): void {
    const name = this.categoryFormName.trim();
    if (!name) {
      this.toast.error('A category name is required.');
      return;
    }
    this.savingCategory = true;
    const call =
      this.categoryEditId === null
        ? this.api.createCategory(this.catalogDomainId as number, name)
        : this.api.updateCategoryMetadata(this.categoryEditId, name);

    call.pipe(finalize(() => (this.savingCategory = false))).subscribe({
      next: () => {
        this.toast.success(
          this.categoryEditId === null ? 'Category created.' : 'Category renamed.',
          this.categoryEditId === null
            ? `${name} is effective from today.`
            : 'Applied to every version of this category, so its history stays in one lineage.',
        );
        this.closeCategoryModal();
        this.loadCatalog();
      },
      error: (err) => this.toast.error('Could not save the category.', this.errorText(err, 'Please try again.')),
    });
  }

  /**
   * Retire-and-replace the whole category: the current row is end-dated today, a
   * fresh one takes its place, and every live parameter under it is carried
   * forward as its own new version. Used when a rubric refresh should draw a
   * clean line under everything scored so far.
   */
  versionCategory(row: ItOpsCategoryRow): void {
    this.savingCategory = true;
    this.api
      .versionCategory(row.categoryId)
      .pipe(finalize(() => (this.savingCategory = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(
            'New version created.',
            `${row.name} now runs on a new version effective today; ${res?.parametersCarriedForward ?? 0} parameter(s) were carried forward. Every earlier version stays exactly as it was.`,
          );
          this.catalogCategoryId = res?.category?.categoryId ?? null;
          this.loadCatalog();
        },
        error: (err) => this.toast.error('Could not version the category.', this.errorText(err, 'Please try again.')),
      });
  }

  openCategoryVersions(row: ItOpsCategoryRow): void {
    this.versionTitle = `${row.name} — category versions`;
    this.parameterVersions = [];
    this.versionModalOpen = true;
    this.loadingVersions = true;
    this.api
      .getCategoryVersions(row.categoryId)
      .pipe(finalize(() => (this.loadingVersions = false)))
      .subscribe({
        next: (rows) => (this.categoryVersions = rows),
        error: (err) => {
          this.categoryVersions = [];
          this.toast.error('Could not load the version history.', this.errorText(err, 'Please try again.'));
        },
      });
  }

  categoryVersions: ItOpsCategoryRow[] = [];

  // ---- Parameters ----

  private blankLevels(): ItOpsParameterLevel[] {
    return [1, 2, 3, 4, 5].map((levelNo) => ({ levelNo, description: '' }));
  }

  /** The maturity ladder's fixed labels, matching the assessment form's rubric columns. */
  levelLabel(levelNo: number): string {
    switch (levelNo) {
      case 1:
        return 'Ad hoc';
      case 2:
        return 'Developing';
      case 3:
        return 'Defined';
      case 4:
        return 'Managed';
      default:
        return levelNo === 5 ? 'Optimized' : `Level ${levelNo}`;
    }
  }

  openParameterCreateModal(): void {
    if (this.catalogCategoryId === null) {
      this.toast.error('Open a category first.');
      return;
    }
    this.parameterEditId = null;
    this.parameterEditing = null;
    this.parameterFormName = '';
    this.parameterFormDefinition = '';
    this.parameterFormMinScore = null;
    this.parameterFormLevels = this.blankLevels();
    this.parameterModalOpen = true;
  }

  /**
   * Opens the SAME form pre-filled for an existing parameter - but saving it
   * creates a NEW VERSION rather than editing this row. The name field is not
   * offered here (it is the lineage key); "Rename" is its own in-place action.
   */
  openParameterVersionModal(row: ItOpsParameterRow): void {
    this.parameterEditId = row.parameterId;
    this.parameterEditing = row;
    this.parameterFormName = row.name;
    this.parameterFormDefinition = row.definition ?? '';
    this.parameterFormMinScore = row.minRequiredScore;
    this.parameterFormLevels = this.blankLevels().map((l) => ({
      levelNo: l.levelNo,
      description: row.levels?.find((x) => x.levelNo === l.levelNo)?.description ?? '',
    }));
    this.parameterModalOpen = true;
  }

  closeParameterModal(): void {
    this.parameterModalOpen = false;
    this.parameterEditId = null;
    this.parameterEditing = null;
  }

  saveParameter(): void {
    const levels = this.parameterFormLevels.map((l) => ({ levelNo: l.levelNo, description: l.description ?? '' }));
    const definition = this.parameterFormDefinition.trim() || null;
    const minScore = this.parameterFormMinScore ?? null;
    if (minScore !== null && (minScore < 1 || minScore > 5)) {
      this.toast.error('The minimum required score must be between 1 and 5.');
      return;
    }

    if (this.parameterEditId === null) {
      const name = this.parameterFormName.trim();
      if (!name) {
        this.toast.error('A parameter name is required.');
        return;
      }
      this.savingParameter = true;
      this.api
        .createParameter(this.catalogCategoryId as number, name, definition, minScore, levels)
        .pipe(finalize(() => (this.savingParameter = false)))
        .subscribe({
          next: () => {
            this.toast.success('Parameter created.', `${name} is effective from today.`);
            this.closeParameterModal();
            this.loadCatalog();
          },
          error: (err) => this.toast.error('Could not create the parameter.', this.errorText(err, 'Please try again.')),
        });
      return;
    }

    this.savingParameter = true;
    this.api
      .versionParameter(this.parameterEditId, definition, minScore, levels)
      .pipe(finalize(() => (this.savingParameter = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(
            res?.versioned ? 'New version saved.' : 'Parameter updated.',
            res?.versioned
              ? 'A new version is effective from today. The previous version and its rubric text are untouched, so anything already scored against it still reads exactly as it did.'
              : 'This version only became effective today, so it was corrected in place - nothing had been scored against it yet.',
          );
          this.closeParameterModal();
          this.loadCatalog();
        },
        error: (err) => this.toast.error('Could not save the parameter.', this.errorText(err, 'Please try again.')),
      });
  }

  openParameterRenameModal(row: ItOpsParameterRow): void {
    this.parameterRenameId = row.parameterId;
    this.parameterRenameName = row.name;
    this.parameterRenameModalOpen = true;
  }

  closeParameterRenameModal(): void {
    this.parameterRenameModalOpen = false;
    this.parameterRenameId = null;
  }

  saveParameterRename(): void {
    if (this.parameterRenameId === null) return;
    const name = this.parameterRenameName.trim();
    if (!name) {
      this.toast.error('A parameter name is required.');
      return;
    }
    this.savingParameterRename = true;
    this.api
      .updateParameterMetadata(this.parameterRenameId, name)
      .pipe(finalize(() => (this.savingParameterRename = false)))
      .subscribe({
        next: () => {
          this.toast.success(
            'Parameter renamed.',
            'Applied to every version of this parameter — the wording each assessment was scored against is unchanged.',
          );
          this.closeParameterRenameModal();
          this.loadCatalog();
        },
        error: (err) => this.toast.error('Could not rename the parameter.', this.errorText(err, 'Please try again.')),
      });
  }

  openParameterVersions(row: ItOpsParameterRow): void {
    this.versionTitle = `${row.name} — version history`;
    this.categoryVersions = [];
    this.parameterVersions = [];
    this.versionModalOpen = true;
    this.loadingVersions = true;
    this.api
      .getParameterVersions(row.parameterId)
      .pipe(finalize(() => (this.loadingVersions = false)))
      .subscribe({
        next: (rows) => (this.parameterVersions = rows),
        error: (err) => {
          this.parameterVersions = [];
          this.toast.error('Could not load the version history.', this.errorText(err, 'Please try again.'));
        },
      });
  }

  closeVersionModal(): void {
    this.versionModalOpen = false;
    this.parameterVersions = [];
    this.categoryVersions = [];
  }

  // ==================================================================
  // Step 4: Configure Assessment
  // ==================================================================

  /**
   * Only domains mapped to EVERY selected project may be assessed - the
   * INTERSECTION, not the union.
   *
   * Projects legitimately carry different domain sets, so a union picker would
   * have to silently skip a ticked domain for whichever projects it isn't mapped
   * to, and the "N assessments will be created" preview could no longer be read
   * off (projects x domains). The intersection keeps one Create action
   * unambiguous - every ticked domain applies cleanly to every ticked project -
   * and an admin who genuinely needs a project-specific domain can still create
   * that project on its own, which is exactly the old single-project flow.
   * (The backend still validates per project as a defensive check.)
   */
  get mappableDomains(): ItOpsDomainAdminRow[] {
    if (!this.assessmentProjectIds.length) return [];
    const perProject = this.assessmentProjectIds.map(
      (projectId) => new Set((this.mappings.find((m) => m.projectId === projectId)?.domains ?? []).map((d) => d.domainId)),
    );
    return this.domains.filter((d) => perProject.every((ids) => ids.has(d.domainId)));
  }

  isAssessmentProjectPicked(projectId: string): boolean {
    return this.assessmentProjectIds.includes(projectId);
  }

  /**
   * Ticking/unticking a project changes the domain INTERSECTION under it, so the
   * domain picks are re-derived every time rather than left pointing at a domain
   * that is no longer common to the whole selection.
   */
  toggleAssessmentProject(projectId: string): void {
    this.assessmentProjectIds = this.isAssessmentProjectPicked(projectId)
      ? this.assessmentProjectIds.filter((id) => id !== projectId)
      : [...this.assessmentProjectIds, projectId];
    this.onAssessmentProjectsChange();
  }

  /** Bulk tick/untick for the currently filtered (by customer) project list. */
  toggleAllAssessmentProjects(): void {
    const visible = this.projectsForCustomer(this.assessmentAccountName, this.assessmentProjectSearch).map((p) => p.projectId);
    const allPicked = visible.length > 0 && visible.every((id) => this.assessmentProjectIds.includes(id));
    this.assessmentProjectIds = allPicked
      ? this.assessmentProjectIds.filter((id) => !visible.includes(id))
      : Array.from(new Set([...this.assessmentProjectIds, ...visible]));
    this.onAssessmentProjectsChange();
  }

  get allVisibleAssessmentProjectsPicked(): boolean {
    const visible = this.projectsForCustomer(this.assessmentAccountName, this.assessmentProjectSearch).map((p) => p.projectId);
    return visible.length > 0 && visible.every((id) => this.assessmentProjectIds.includes(id));
  }

  isDomainPicked(domainId: number): boolean {
    return this.assessmentDomainPicks.includes(domainId);
  }

  toggleDomainPick(domainId: number): void {
    this.assessmentDomainPicks = this.isDomainPicked(domainId)
      ? this.assessmentDomainPicks.filter((id) => id !== domainId)
      : [...this.assessmentDomainPicks, domainId];
  }

  /**
   * The project SET changed. Domain picks are scoped to that set (they're the
   * intersection of every selected project's mapped domains), so they're
   * re-derived rather than carried over, and the table below re-reads.
   */
  onAssessmentProjectsChange(): void {
    this.assessmentProjectId = this.assessmentProjectIds[0] ?? '';
    // Default to every domain common to the whole selection (still individually
    // togglable) rather than starting empty - that's almost always what the
    // admin wants to assess.
    this.assessmentDomainPicks = this.mappableDomains.map((d) => d.domainId);
    this.loadAssessments();
    this.loadAssesseeCandidates();
  }

  /**
   * The assessee picker should only offer people actually staffed on the
   * project(s) being assessed, not the whole org roster - re-fetched every
   * time the project selection changes. A previously-added assessee who isn't
   * in the new candidate list (e.g. the project set narrowed) is left alone;
   * this only affects who can be newly added going forward.
   */
  private loadAssesseeCandidates(): void {
    this.assesseeSearch = '';
    this.assesseeResults = [];
    if (!this.assessmentProjectIds.length) {
      this.assesseeCandidates = [];
      return;
    }
    this.loadingAssesseeCandidates = true;
    this.api
      .getAssesseeCandidates(this.assessmentProjectIds)
      .pipe(finalize(() => (this.loadingAssesseeCandidates = false)))
      .subscribe((rows) => (this.assesseeCandidates = rows));
  }

  /**
   * Changing the customer narrows the PROJECT PICKER (and clears the domain/
   * assessee selections that depended on the old project choice), but the
   * "Assessments in this cycle" table below is cycle-wide, not tied to this
   * filter - it stays exactly as it was rather than blanking out.
   */
  onAssessmentCustomerChange(): void {
    this.assessmentProjectId = '';
    this.assessmentProjectIds = [];
    this.assessmentDomainPicks = [];
    this.assessees = [];
  }

  /**
   * "Assessments in this cycle" shows the WHOLE cycle, not just the currently
   * selected project(s) - it's a browse/manage list (every "Assign team" row
   * needs to be reachable regardless of what's ticked above), not a preview of
   * the current selection. The pre-create summary getters below key off
   * (projectId, domainId) pairs, so extra rows from other projects never
   * pollute those counts - only the assessee sync needs an explicit
   * project-scoped subset, since "first row with assessees" would otherwise
   * happily pick one from an unrelated project.
   */
  loadAssessments(): void {
    if (!this.selectedCycleId) {
      this.assessmentRows = [];
      this.assessees = [];
      return;
    }
    const picked = [...this.assessmentProjectIds];
    this.loadingAssessments = true;
    this.assessmentsError = null;
    this.api
      .getAssessmentsForCycle(this.selectedCycleId, undefined)
      .pipe(finalize(() => (this.loadingAssessments = false)))
      .subscribe({
        next: (rows) => {
          this.assessmentRows = rows;
          this.syncAssesseesFromAssessments(rows.filter((r) => picked.includes(r.projectId)));
        },
        error: () => {
          this.assessmentsError = 'Could not load the assessments for this cycle.';
          this.assessmentRows = [];
        },
      });
  }

  // ---- Pre-create summary ----
  // Computed live from what GetITOpsAssessmentsForCycle already returned for the
  // selected cycle + projects, so the admin sees exactly what a Create will do
  // BEFORE clicking - no extra call, no extra confirmation click.

  /** (project x domain) pairs that already have an assessment in this cycle. */
  private get existingPairKeys(): Set<string> {
    return new Set(this.assessmentRows.map((r) => `${r.projectId}|${r.domainId}`));
  }

  /** Total (project x domain) combinations the current selection covers. */
  get plannedAssessmentCount(): number {
    return this.assessmentProjectIds.length * this.assessmentDomainPicks.length;
  }

  /** How many of those already exist and will be left untouched (their team stays as-is). */
  get existingAssessmentCount(): number {
    const existing = this.existingPairKeys;
    let count = 0;
    for (const projectId of this.assessmentProjectIds) {
      for (const domainId of this.assessmentDomainPicks) {
        if (existing.has(`${projectId}|${domainId}`)) count++;
      }
    }
    return count;
  }

  /** How many brand-new ITOPS_ASSESSMENT rows the Create would actually add. */
  get newAssessmentCount(): number {
    return this.plannedAssessmentCount - this.existingAssessmentCount;
  }

  /**
   * Assessments already in this cycle for a SELECTED project whose domain is NOT
   * in the current pick. The backend retires those (only while still NotStarted),
   * so it is worth warning about before the click rather than after.
   */
  get retiredAssessmentCount(): number {
    const picked = new Set(this.assessmentDomainPicks);
    return this.assessmentRows.filter(
      (r) => this.assessmentProjectIds.includes(r.projectId) && !picked.has(r.domainId) && r.status === 'NotStarted',
    ).length;
  }

  /**
   * Assessees are project-wide, so any one of the project's assessments carries
   * the authoritative set - read it back off the first row's team so re-opening
   * the screen shows what was actually persisted rather than an empty picker.
   */
  private syncAssesseesFromAssessments(rows: ItOpsCycleAssessment[]): void {
    const first = rows.find((r) => r.assesseeCount > 0);
    if (!first) {
      this.assessees = [];
      return;
    }
    this.api
      .getAssessmentTeam(first.assessmentId)
      .pipe(catchError(() => of(null)))
      .subscribe((team) => {
        this.assessees = (team?.assessees ?? []).map((a) => ({ empId: a.empId, name: a.empName, title: '' }));
      });
  }

  /**
   * Filters over assesseeCandidates (people staffed on the selected
   * project(s)), not the org-wide roster - clicking/typing with no projects
   * selected yet shows nothing rather than everyone.
   */
  searchAssessee(): void {
    const needle = this.assesseeSearch.trim().toLowerCase();
    const pool = needle.length
      ? this.assesseeCandidates.filter(
          (e) => e.name.toLowerCase().includes(needle) || e.empId.toLowerCase().includes(needle),
        )
      : this.assesseeCandidates;
    this.assesseeResults = pool.slice(0, 25);
  }

  addAssessee(emp: ItOpsEmployee): void {
    if (!this.assessees.some((a) => a.empId === emp.empId)) this.assessees = [...this.assessees, emp];
    this.assesseeSearch = '';
    this.assesseeResults = [];
  }

  removeAssessee(emp: ItOpsEmployee): void {
    this.assessees = this.assessees.filter((a) => a.empId !== emp.empId);
  }

  createAssessments(): void {
    if (!this.selectedCycleId) {
      this.toast.error('Pick a cycle in Configure Cycle first.');
      return;
    }
    if (!this.assessmentProjectIds.length) {
      this.toast.error('Pick at least one project first.');
      return;
    }
    if (!this.assessmentDomainPicks.length) {
      this.toast.error('Select at least one domain to assess.');
      return;
    }

    const created = this.newAssessmentCount;
    const unchanged = this.existingAssessmentCount;
    const projectCount = this.assessmentProjectIds.length;
    this.creatingAssessments = true;
    this.api
      .createAssessmentsForProjects(
        this.selectedCycleId,
        this.assessmentProjectIds,
        this.assessmentDomainPicks,
        this.assessees.map((a) => a.empId),
      )
      .pipe(finalize(() => (this.creatingAssessments = false)))
      .subscribe({
        next: (rows) => {
          this.assessmentRows = rows;
          this.toast.success(
            'Assessments created.',
            `${created} new across ${projectCount} project(s); ${unchanged} already existed and were left unchanged.`,
          );
        },
        error: (err) => this.toast.error('Could not create the assessments.', this.errorText(err, 'Please try again.')),
      });
  }

  teamLabel(row: ItOpsCycleAssessment): string {
    const total = row.assessorCount + row.reviewerCount;
    return total ? `${total} assigned` : 'Unassigned';
  }

  teamTone(row: ItOpsCycleAssessment): 'critical' | 'good' {
    return row.assessorCount + row.reviewerCount ? 'good' : 'critical';
  }

  statusTone(row: ItOpsCycleAssessment): 'muted' | 'accent' {
    return row.status === 'NotStarted' ? 'muted' : 'accent';
  }

  statusLabel(row: ItOpsCycleAssessment): string {
    return this.assessmentStatusLabel(row.status);
  }

  /**
   * The real ITOPS_ASSESSMENT.STATUS vocabulary, as written by
   * ITOperationMaturityController: NotStarted -> Draft (first score saved) ->
   * PendingReview (submitted) -> Approved | ReturnedForRevision (review), plus
   * Closed. Anything unrecognised is shown verbatim rather than swallowed.
   */
  assessmentStatusLabel(status: string): string {
    switch (status) {
      case 'NotStarted':
        return 'Not started';
      case 'Draft':
        return 'In progress';
      case 'PendingReview':
        return 'Pending review';
      case 'ReturnedForRevision':
        return 'Returned';
      case 'Approved':
        return 'Approved';
      case 'Closed':
        return 'Closed';
      default:
        return status;
    }
  }

  /** Pill tone for one status in the Step 2 cycle breakdown. */
  assessmentStatusTone(status: string): 'good' | 'warning' | 'accent' | 'critical' | 'muted' {
    switch (status) {
      case 'Approved':
      case 'Closed':
        return 'good';
      case 'PendingReview':
        return 'warning';
      case 'Draft':
        return 'accent';
      case 'ReturnedForRevision':
        return 'critical';
      default:
        return 'muted';
    }
  }

  assignTeamFor(row: ItOpsCycleAssessment): void {
    this.assessmentProjectId = row.projectId;
    this.goToStep('team');
  }

  // ==================================================================
  // Step 5: Assign Assessor / Reviewer
  // ==================================================================

  loadDomainTeams(): void {
    if (!this.selectedCycleId || !this.assessmentProjectId) {
      this.domainTeams = [];
      return;
    }
    this.loadingTeams = true;
    this.teamsError = null;

    this.api
      .getAssessmentsForCycle(this.selectedCycleId, this.assessmentProjectId)
      .pipe(catchError(() => of(null)))
      .subscribe((rows) => {
        if (rows === null) {
          this.teamsError = 'Could not load the assessments for this project.';
          this.domainTeams = [];
          this.loadingTeams = false;
          return;
        }
        this.assessmentRows = rows;
        if (!rows.length) {
          this.domainTeams = [];
          this.loadingTeams = false;
          return;
        }

        forkJoin(rows.map((r) => this.api.getAssessmentTeam(r.assessmentId).pipe(catchError(() => of(null)))))
          .pipe(finalize(() => (this.loadingTeams = false)))
          .subscribe((teams) => {
            this.domainTeams = rows.map((row, i) => {
              const team = teams[i];
              const assessors = team?.assessors ?? [];
              const reviewers = team?.reviewers ?? [];
              return {
                assessmentId: row.assessmentId,
                domainId: row.domainId,
                name: row.domainName ?? row.domainCode ?? '',
                status: assessors.length || reviewers.length ? 'Ready' : 'Needs setup',
                assessors,
                reviewers,
              };
            });
            // Assessees are project-wide: any assessment's list is the whole set.
            const withAssessees = teams.find((t) => t && t.assessees.length);
            if (withAssessees) {
              this.assessees = withAssessees.assessees.map((a) => ({ empId: a.empId, name: a.empName, title: '' }));
            }
          });
      });
  }

  removeTeamMember(dom: DomainTeam, role: 'Assessor' | 'Reviewer', member: ItOpsTeamMember): void {
    const call = role === 'Assessor' ? this.api.removeAssessor(member.id) : this.api.removeReviewer(member.id);
    call.subscribe({
      next: () => {
        this.toast.success(`${role} removed.`, `${member.empName} removed from ${dom.name}.`);
        this.loadDomainTeams();
      },
      error: (err) => this.toast.error(`Could not remove the ${role.toLowerCase()}.`, this.errorText(err, 'Please try again.')),
    });
  }

  /** Promote an already-assigned member to primary (re-posting the same person with isPrimary demotes the incumbent server-side). */
  makePrimaryMember(dom: DomainTeam, role: 'Assessor' | 'Reviewer', member: ItOpsTeamMember): void {
    const call =
      role === 'Assessor'
        ? this.api.addAssessor(dom.assessmentId, member.empId, true)
        : this.api.addReviewer(dom.assessmentId, member.empId, true);
    call.subscribe({
      next: () => {
        this.toast.success(`${member.empName} is now the primary ${role.toLowerCase()}.`);
        this.loadDomainTeams();
      },
      error: (err) => this.toast.error('Could not set the primary.', this.errorText(err, 'Please try again.')),
    });
  }

  // ---- People picker ----

  openPicker(role: 'Assessor' | 'Reviewer', dom: DomainTeam): void {
    this.pickerRole = role;
    this.pickerDomain = dom.name;
    this.pickerAssessmentId = dom.assessmentId;
    this.pickerSearch = '';
    this.pickerCandidates = [];
    const current = role === 'Assessor' ? dom.assessors : dom.reviewers;
    this.pickerPrimaryEmpId = current.find((m) => m.isPrimary)?.empId ?? null;

    // One-click shortcut for the domain's configured default owner - the same
    // person SeedITOpsDefaultOwners would have seeded when the assessment was
    // first created. Suppressed when the domain has no default for this role or
    // that person is already on the team, where the chip would only be noise.
    const domain = this.domains.find((d) => d.domainId === dom.domainId);
    const defaultId = role === 'Assessor' ? domain?.defaultAssessorId : domain?.defaultReviewerId;
    const defaultName = role === 'Assessor' ? domain?.defaultAssessorName : domain?.defaultReviewerName;
    const alreadyOnTeam = !!defaultId && current.some((m) => m.empId === defaultId);
    this.pickerDefaultEmpId = defaultId && !alreadyOnTeam ? defaultId : null;
    this.pickerDefaultName = this.pickerDefaultEmpId ? defaultName || defaultId || null : null;

    this.pickerModalOpen = true;
  }

  closePicker(): void {
    this.pickerModalOpen = false;
    this.pickerDefaultEmpId = null;
    this.pickerDefaultName = null;
  }

  /**
   * Adds the domain's default assessor/reviewer straight away, down exactly the
   * same call path as picking them out of the search results - no search step.
   * Not marked primary: an existing primary stays primary unless the admin says
   * otherwise (posting isPrimary would silently demote them).
   */
  addPickerDefault(): void {
    if (!this.pickerDefaultEmpId) return;
    this.addPickedMember(
      { empId: this.pickerDefaultEmpId, name: this.pickerDefaultName ?? this.pickerDefaultEmpId, title: '' },
      false,
    );
  }

  // ---- Bulk reassignment: replace everything person X holds with person Y ----

  openReassignModal(): void {
    this.reassignFrom = null;
    this.reassignTo = null;
    this.reassignFromSearch = '';
    this.reassignToSearch = '';
    this.reassignFromResults = [];
    this.reassignToResults = [];
    this.reassignPreview = null;
    this.reassignModalOpen = true;
  }

  closeReassignModal(): void {
    this.reassignModalOpen = false;
    this.reassignPreview = null;
  }

  searchReassignFrom(): void {
    this.api.searchEmployees(this.reassignFromSearch).subscribe((rows) => (this.reassignFromResults = rows));
  }

  searchReassignTo(): void {
    this.api.searchEmployees(this.reassignToSearch).subscribe((rows) => (this.reassignToResults = rows));
  }

  pickReassignFrom(emp: ItOpsEmployee): void {
    this.reassignFrom = emp;
    this.reassignFromSearch = '';
    this.reassignFromResults = [];
    this.reassignPreview = null;
    this.loadReassignPreview();
  }

  pickReassignTo(emp: ItOpsEmployee): void {
    this.reassignTo = emp;
    this.reassignToSearch = '';
    this.reassignToResults = [];
    this.reassignPreview = null;
    this.loadReassignPreview();
  }

  /**
   * Asks the backend how much this reassignment would touch WITHOUT writing
   * anything, so the confirm button can state the real blast radius. Re-run
   * whenever either person changes.
   */
  private loadReassignPreview(): void {
    if (!this.reassignFrom || !this.reassignTo) return;
    if (this.reassignFrom.empId === this.reassignTo.empId) {
      this.reassignPreview = null;
      return;
    }
    this.loadingReassignPreview = true;
    this.api
      .bulkReassignTeamMember(this.reassignFrom.empId, this.reassignTo.empId, true)
      .pipe(finalize(() => (this.loadingReassignPreview = false)))
      .subscribe({
        next: (res) => (this.reassignPreview = res),
        error: (err) => {
          this.reassignPreview = null;
          this.toast.error('Could not preview the reassignment.', this.errorText(err, 'Please try again.'));
        },
      });
  }

  confirmReassign(): void {
    if (!this.reassignFrom || !this.reassignTo) {
      this.toast.error('Pick both the person to replace and their replacement.');
      return;
    }
    if (this.reassignFrom.empId === this.reassignTo.empId) {
      this.toast.error('Pick two different people.');
      return;
    }
    const from = this.reassignFrom;
    const to = this.reassignTo;
    this.savingReassign = true;
    this.api
      .bulkReassignTeamMember(from.empId, to.empId, false)
      .pipe(finalize(() => (this.savingReassign = false)))
      .subscribe({
        next: (res) => {
          this.toast.success(
            'Assignments reassigned.',
            `${res?.totalRows ?? 0} assignment(s) across ${res?.assessmentCount ?? 0} assessment(s) moved from ${from.name} to ${to.name}.` +
              (res?.mergedRows ? ` ${res.mergedRows} were merged because ${to.name} was already on that assessment.` : ''),
          );
          this.closeReassignModal();
          this.loadDomainTeams();
        },
        error: (err) => this.toast.error('Could not reassign the assignments.', this.errorText(err, 'Please try again.')),
      });
  }

  searchPicker(): void {
    this.api.searchEmployees(this.pickerSearch).subscribe((rows) => (this.pickerCandidates = rows));
  }

  /** Adds the picked person to the assessment straight away, then refreshes the accordion. */
  addPickedMember(candidate: ItOpsEmployee, isPrimary: boolean): void {
    if (!this.pickerAssessmentId) return;
    this.savingPicker = true;
    const call =
      this.pickerRole === 'Assessor'
        ? this.api.addAssessor(this.pickerAssessmentId, candidate.empId, isPrimary)
        : this.api.addReviewer(this.pickerAssessmentId, candidate.empId, isPrimary);

    call.pipe(finalize(() => (this.savingPicker = false))).subscribe({
      next: () => {
        this.toast.success(`${this.pickerRole} added.`, `${candidate.name} on ${this.pickerDomain}.`);
        this.closePicker();
        this.loadDomainTeams();
      },
      error: (err) => this.toast.error(`Could not add the ${this.pickerRole.toLowerCase()}.`, this.errorText(err, 'Please try again.')),
    });
  }

  initials(name: string): string {
    return (name ?? '')
      .split(' ')
      .filter((p) => p)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  get assessmentProjectLabel(): string {
    const project = this.projects.find((p) => p.projectId === this.assessmentProjectId);
    return project ? this.projectLabel(project) : this.assessmentProjectId;
  }
}
