/**
 * Business Unit -> GDH (Global Delivery Head) email(s), verbatim from the
 * bu_head_mail CASE statement. Some BUs map to more than one address
 * (semicolon-separated in the source, split here into an array). BU name
 * matching is case-insensitive since the real GetBusinessUnits values may
 * not match this casing exactly.
 */
const BU_HEAD_MAP_RAW: Record<string, string> = {
  'health care': 'balakrishnan.s@neurealm.com',
  tech: 'prashant.muley@neurealm.com',
  'india & gcc': 'sriram.radhakrishnan@neurealm.com',
  cit: 'nandagopal.kumar@neurealm.com',
  sead: 'pradeep.sukumaran@ignitarium.com;sujith@ignitarium.com;ramesh@ignitarium.com;sanjayjk@ignitarium.com;sujeeth.joseph@ignitarium.com',
};

export function getGdhEmailsForBusinessUnit(businessUnit: string | null | undefined): string[] {
  if (!businessUnit) return [];
  const key = businessUnit.trim().toLowerCase();
  const raw = BU_HEAD_MAP_RAW[key];
  if (!raw) return [];
  return raw
    .split(';')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
