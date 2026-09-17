/** Mandatory risk approver roles (Risk log dropdown). */
export const RISK_APPROVER_ROLES = [
  'GDH',
  'DP',
  'Function Head',
  'CEO',
  'COO',
  'CFO',
  'CIO',
  'CISO',
] as const;

export type RiskApproverRole = (typeof RISK_APPROVER_ROLES)[number];

export const RISK_APPROVER_OPTIONS: { label: string; value: RiskApproverRole }[] =
  RISK_APPROVER_ROLES.map((r) => ({ label: r, value: r }));

/** Demo inboxes per role — replace with API-driven resolution in production. */
export const RISK_APPROVER_MAILBOX: Record<RiskApproverRole, string> = {
  GDH: 'gdh@neuronaut.corp',
  DP: 'dp@neuronaut.corp',
  'Function Head': 'function-head@neuronaut.corp',
  CEO: 'ceo@neuronaut.corp',
  COO: 'coo@neuronaut.corp',
  CFO: 'cfo@neuronaut.corp',
  CIO: 'cio@neuronaut.corp',
  CISO: 'ciso@neuronaut.corp',
};
