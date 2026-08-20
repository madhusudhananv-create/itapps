import type {
  ExecutiveInsightBundle,
  ExecutiveInsightCategoryId,
} from '../models/executive-insight.model';
import type { RiskRecord } from '../models/risk.model';

const CRISP_MAX = 96;

function topKey(map: Map<string, number>): { key: string; n: number } | null {
  let best: { key: string; n: number } | null = null;
  for (const [k, n] of map) {
    if (n <= 0) continue;
    if (!best || n > best.n) best = { key: k, n };
  }
  return best;
}

function countWhere(risks: RiskRecord[], pred: (r: RiskRecord) => boolean): number {
  return risks.reduce((a, r) => a + (pred(r) ? 1 : 0), 0);
}

function truncate(s: string, max: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function byHeat(risks: RiskRecord[]): RiskRecord[] {
  return [...risks].sort(
    (a, b) =>
      b.inherentRating * b.likelihood - a.inherentRating * a.likelihood ||
      b.inherentRating - a.inherentRating
  );
}

function neurealmRelevant(r: RiskRecord): boolean {
  const blob = `${r.title} ${r.description} ${r.category} ${r.businessUnit}`.toLowerCase();
  return (
    /neurealm|neugain|neuronaut|silicon|embedded|edge|agent|llm|augment|staff aug|offshore|india|uk|healthcare|tech|finance|cyber|infosec/.test(
      blob
    )
  );
}

/**
 * Ultra-short register-backed lines for Key Insights (header-scoped risks / risk log).
 */
export function registerCrispAdditions(
  risks: RiskRecord[]
): Partial<Record<ExecutiveInsightCategoryId, readonly string[]>> {
  if (!risks.length) {
    return {};
  }

  const total = risks.length;
  const open = countWhere(risks, (r) => r.status === 'open');
  const hot = countWhere(risks, (r) => r.inherentRating >= 10);
  const sumResidual = risks.reduce((s, r) => s + r.residualRating, 0);
  const sumInherent = risks.reduce((s, r) => s + r.inherentRating, 0);
  const neuPick = risks.filter(neurealmRelevant);
  const neuTop = neuPick.length ? byHeat(neuPick)[0]! : byHeat(risks)[0]!;
  const neuLine = `Neurealm lens: “${truncate(neuTop.title, 44)}” (${neuTop.businessUnit}; inh. ${neuTop.inherentRating}).`;
  const hottest = byHeat(risks)[0]!;
  const hotRow = `Hottest row: “${truncate(hottest.title, 42)}” (${hottest.businessUnit}; inh. ${hottest.inherentRating}).`;

  const byCat = new Map<string, number>();
  const byBu = new Map<string, number>();
  for (const r of risks) {
    byCat.set(r.category, (byCat.get(r.category) ?? 0) + 1);
    byBu.set(r.businessUnit, (byBu.get(r.businessUnit) ?? 0) + 1);
  }
  const topC = topKey(byCat);
  const topB = topKey(byBu);

  const indiaUk = countWhere(
    risks,
    (r) =>
      /india|uk|bangalore|kochi|chennai|hyderabad/i.test(r.businessUnit) ||
      /india|uk/i.test(r.title)
  );
  const cyber = countWhere(
    risks,
    (r) =>
      /cyber|security|infosec|information/i.test(r.category) ||
      /security|infosec|breach|dlp/i.test(r.title)
  );
  const fin = countWhere(
    risks,
    (r) => /financial|credit|revenue|contract/i.test(r.category)
  );
  const draft = countWhere(risks, (r) => r.riskLifecycleStatus === 'Draft');
  const meanCe = Math.round(
    risks.reduce((s, r) => s + r.controlEffectiveness, 0) / Math.max(1, total)
  );

  const lines: Partial<Record<ExecutiveInsightCategoryId, readonly string[]>> = {};

  lines.geopolitical = [
    `Register: ${open}/${total} open · ${indiaUk} India/UK-tagged.`,
    hotRow,
  ];

  lines.financial = [
    `Σ inh ${sumInherent} / Σ res ${sumResidual} · ${hot} row(s) inh ≥10.`,
    fin > 0 ? `${fin} finance-tagged in cut.` : `No finance tags — still gate NeuGAIN ROI.`,
  ];

  lines.business = [
    topC && topB ? `${topC.key} #1 (${topC.n}); ${topB.key} busiest (${topB.n}).` : `${total} scoped rows.`,
    `${neuLine}${draft > 0 ? ` · ${draft} Draft.` : ''}`,
  ];

  lines.people = [
    `Mean control ${meanCe}% · ${total} row(s).`,
    topB ? `${topB.key}: ${topB.n} — bench / attrition.` : `BU load spread.`,
  ];

  lines.technical = [
    `${hot} inh ≥10 — agent SLOs + evals; ${cyber} sec-tagged.`,
    `Neurealm tie-in: “${truncate(neuTop.title, 52)}”.`,
  ];

  lines.security = [
    cyber > 0 ? `${cyber} cyber-tagged — DLP + PAM.` : `Sparse sec tags — RTL exfil tabletops.`,
    `${open} open — high-residual paths pre-audit.`,
  ];

  return lines;
}

/** Prepends register one-liners; keeps bullets short for the UI. */
export function mergeRegisterCrispLines(
  bundle: ExecutiveInsightBundle,
  risks: RiskRecord[]
): ExecutiveInsightBundle {
  const add = registerCrispAdditions(risks);
  return {
    ...bundle,
    insights: bundle.insights.map((ins) => {
      const reg = [...(add[ins.id] ?? [])];
      const narrative = ins.insightBullets.map((s) => oneLine(s));
      const merged = [...reg, ...narrative];
      return { ...ins, insightBullets: merged.slice(0, 4).map(oneLine) };
    }),
  };
}

function oneLine(s: string): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= CRISP_MAX) return t;
  return `${t.slice(0, CRISP_MAX - 1)}…`;
}
