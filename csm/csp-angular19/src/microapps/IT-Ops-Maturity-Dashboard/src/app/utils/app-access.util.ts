/**
 * Local re-implementation of the CSM shell's AccessControl.IsAllowed() (view-access branch
 * only) - csp-angular19/src/app/shared/access-control.ts. This microapp is a separate
 * Angular project and can't import that class directly, but it shares the same origin/
 * localStorage as the shell, which already caches the caller's full APP_ACCESS_CONTROLS
 * rows (as JSON) in localStorage['access'] at login - so this reads that same cache
 * instead of a backend round trip per check.
 *
 * This MUST mirror all three tiers IsAllowed() checks, in the same order, not just the
 * plain role-based one - a resource can be granted to a SPECIFIC employee (EMP_ID on an
 * APP_ACCESS_CONTROLS row, independent of that row's own ROLE_ID) as an override, same as
 * "make user X a delegate for resource Y" in the real CSM shell. An earlier version of
 * this check only implemented the pure-role tier, which silently ignored any EMP_ID-based
 * grant - see AuthController.cs's GetEmpIds()/GetAccessControlsModel() for how EMP_ID
 * ends up as a string[] on the cached row (comma-split from APP_ACCESS_CONTROLS.EMP_ID,
 * plus APP_ACCESS_CONTROLS_DETAILS KEY='EMP_ID' rows) by the time it reaches localStorage.
 *
 *   1. Customer-specific access (non-GAVS login only): a row where EMP_ID includes this
 *      employee, ACCESS_LEVEL = 3, matching RESOURCE_ID.
 *   2. Employee delegation: a row where EMP_ID includes this employee and
 *      ACCESS_LEVEL = 1, matching RESOURCE_ID - tried first requiring ROLE_ID to also
 *      match the caller's own role, then again ignoring ROLE_ID entirely (an EMP_ID grant
 *      overrides regardless of which role the row happens to sit under).
 *   3. Pure role-based access: a row where ROLE_ID matches the caller's own role and
 *      ACCESS_LEVEL = 1, matching RESOURCE_ID - no EMP_ID involved at all.
 *
 * Deliberately does NOT replicate IsAllowed()'s CUST_ID/PROJ_ID scoping - every caller of
 * this so far is a plain tab-visibility check (custid/projid always ''), same simplification
 * nav-menu.component.ts's original hasTabViewAccess already made.
 */
export function hasAppResourceViewAccess(resourceId: number): boolean {
  try {
    const raw = localStorage.getItem('access');
    if (!raw) return false;
    const rows: any[] = JSON.parse(raw);
    if (!Array.isArray(rows)) return false;

    const empId = (localStorage.getItem('empid') || '').toLowerCase();
    const roleIdStr = localStorage.getItem('role') || '';
    const isGavs = localStorage.getItem('logintype') === 'gavs';

    const matchesResource = (r: any) => r.RESOURCE_ID === resourceId;
    const empIdMatches = (r: any) =>
      Array.isArray(r.EMP_ID) && r.EMP_ID.some((e: string) => (e ?? '').toLowerCase() === empId);

    if (!isGavs) {
      const custAccess = rows.find((r) => empIdMatches(r) && r.ACCESS_LEVEL === 3 && matchesResource(r));
      if (custAccess) return custAccess.VIEW_ACCESS === true;
    }

    let empDelegate = rows.find(
      (r) => r.ROLE_ID?.toString() === roleIdStr && empIdMatches(r) && r.ACCESS_LEVEL === 1 && matchesResource(r),
    );
    if (!empDelegate) {
      empDelegate = rows.find((r) => empIdMatches(r) && r.ACCESS_LEVEL === 1 && matchesResource(r));
    }
    if (empDelegate) return empDelegate.VIEW_ACCESS === true;

    const roleId = parseInt(roleIdStr || '0', 10);
    return rows.some((r) => matchesResource(r) && r.ACCESS_LEVEL === 1 && r.ROLE_ID === roleId && r.VIEW_ACCESS === true);
  } catch {
    return false;
  }
}
