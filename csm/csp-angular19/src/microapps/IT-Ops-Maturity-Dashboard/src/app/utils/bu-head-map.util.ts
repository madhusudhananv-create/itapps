// GDH (Global Delivery Head) emails per Business Unit, DB-sourced (CONFIGURATION_EXT
// rows ITOPS_GDH_EMAILS_<BU>, see ITOperationMaturity_V2_24_GdhEmailsConfig.sql) rather
// than hardcoded here. `setGdhEmailsByBusinessUnit` should be called once, early in the
// session (see maturity-landing.component.ts), with the map returned by the backend's
// GetITOpsGdhEmailsByBusinessUnit endpoint. Until it's called, this returns no matches -
// callers that rely on `getGdhEmailsForBusinessUnit` for access decisions should wait for
// that fetch to complete first.
let buHeadMap: Record<string, string[]> = {};

export function setGdhEmailsByBusinessUnit(map: Record<string, string[]> | null | undefined): void {
  const normalized: Record<string, string[]> = {};
  for (const [bu, emails] of Object.entries(map ?? {})) {
    const key = bu.trim().toLowerCase();
    normalized[key] = (emails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  buHeadMap = normalized;
}

export function getGdhEmailsForBusinessUnit(businessUnit: string | null | undefined): string[] {
  if (!businessUnit) return [];
  const key = businessUnit.trim().toLowerCase();
  return buHeadMap[key] ?? [];
}
