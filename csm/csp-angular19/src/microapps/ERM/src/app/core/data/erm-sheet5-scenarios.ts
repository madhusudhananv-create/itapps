/**
 * ERM Requirements workbook — **Sheet5** (`ERM Requirements (1).xlsx`).
 * Rows: **A** = Category, **B** = Risk description, **C** = Mitigation / remediation plan.
 * (Column D is empty in the source file; B/C are the paired narrative fields.)
 */
import { RISK_CATEGORIES } from '../risk-rating.constants';

export type RiskLogCategoryValue = (typeof RISK_CATEGORIES)[number];

export interface ErmSheet5Row {
  readonly id: string;
  readonly category: string;
  readonly description: string;
  readonly remediation: string;
}

export const ERM_SHEET5_ROWS: readonly ErmSheet5Row[] = [
  {
    id: 's5-1',
    category: 'Geopolitical',
    description:
      'Trade Restrictions on Semiconductor Tech: Changes in US-India trade policies or export controls on AI/Silicon IP.',
    remediation:
      'Maintain diversified IP portfolios and establish a "Geopolitical Watch" committee to pivot R&D based on emerging regulations.',
  },
  {
    id: 's5-2',
    category: 'Geopolitical',
    description:
      'Cross-Border Regulatory Divergence: Conflicting AI ethics and data residency laws between North America and India.',
    remediation:
      'Implement a Global Compliance Framework that adopts the "highest common denominator" standards (e.g., GDPR + EU AI Act).',
  },
  {
    id: 's5-3',
    category: 'Financial',
    description:
      'Currency Exchange Volatility: Significant fluctuations between the USD and INR affecting profitability of offshore delivery.',
    remediation:
      'Utilize forward contracts and hedging strategies; maintain a balanced mix of onshore and offshore billing.',
  },
  {
    id: 's5-4',
    category: 'Financial',
    description:
      'High R&D Burn Rate: Excessive capital expenditure in "Neurealm Labs" for unproven AI/Robotics prototypes.',
    remediation:
      'Adopt a "Gate-Stage" funding model for innovation; kill low-performing projects early based on ROI metrics.',
  },
  {
    id: 's5-5',
    category: 'Strategic',
    description:
      'Rapid Tech Obsolescence: The fast pace of GenAI (LLMs) making current "NeuGAIN" platform features redundant.',
    remediation:
      'Continuous integration of open-source models and modular architecture to allow "hot-swapping" of underlying AI engines.',
  },
  {
    id: 's5-6',
    category: 'Strategic',
    description:
      'Brand Dilution Post-Merger: Loss of market identity during the transition from GS Lab/GAVS/Ignitarium to Neurealm.',
    remediation:
      'Execute a multi-phase global rebranding campaign focused on the "Silicon to Agentic AI" unified value proposition.',
  },
  {
    id: 's5-7',
    category: 'Technical',
    description:
      "AI Model Hallucinations in Healthcare: Neurealm's AI tools providing inaccurate medical insights (e.g., HAI Predictor).",
    remediation:
      'Implement "Human-in-the-loop" validation and rigorous adversarial testing of models before clinical deployment.',
  },
  {
    id: 's5-8',
    category: 'Technical',
    description:
      'Silicon Design Flaws: Errors in embedded system designs leading to expensive physical recalls for automotive clients.',
    remediation:
      'Shift-left testing methodologies and high-fidelity digital twin simulations prior to physical tape-out.',
  },
  {
    id: 's5-9',
    category: 'Security',
    description:
      'Data Breach of Sensitive Health Records: Unauthorized access to PII/PHI managed during healthcare digital transformation.',
    remediation:
      'End-to-end encryption, zero-trust architecture, and regular third-party HIPAA/HITRUST audits.',
  },
  {
    id: 's5-10',
    category: 'Security',
    description:
      'Adversarial AI Attacks: External actors poisoning training data or manipulating "Agentic AI" workflows.',
    remediation:
      'Deploy AI-specific firewalls and anomaly detection systems that monitor model behavior for "concept drift" or manipulation.',
  },
  {
    id: 's5-11',
    category: 'Business Growth',
    description:
      'Client Concentration Risk: Over-reliance on a few "Large-Cap" clients for a majority of revenue.',
    remediation:
      'Aggressive sales diversification into mid-market enterprises and expansion into the European/APAC markets.',
  },
  {
    id: 's5-12',
    category: 'Business Growth',
    description:
      'Sales Cycle Stagnation: Extended decision-making times by enterprises hesitant to commit to large-scale AI shifts.',
    remediation:
      'Offer "AI Discovery Workshops" (low-cost entry) to demonstrate immediate POC value and build trust for larger contracts.',
  },
  {
    id: 's5-13',
    category: 'IT & Operations',
    description:
      'Cloud Cost Inefficiency: Rising infrastructure costs from training large-scale AI models on AWS/Azure/GCP.',
    remediation:
      'Use Neurealm\'s own "CloudGain" tool for automated cost optimization and spot instance utilization.',
  },
  {
    id: 's5-14',
    category: 'IT & Operations',
    description:
      'Systemic Downtime of Managed Services: Failure of AIOps (ZIF platform) leading to SLA breaches for "RunOps" clients.',
    remediation:
      'Implement multi-region failover and "Self-healing" automation scripts to resolve L1/L2 issues without human intervention.',
  },
  {
    id: 's5-15',
    category: 'Human Capital',
    description:
      'Specialized Talent Attrition: Loss of key "Neuronauts" (AI/Silicon experts) to tech giants (Google, NVIDIA).',
    remediation:
      'Competitive "Innovation-linked" bonuses and a robust internal "Neurealm Academy" for continuous upskilling.',
  },
  {
    id: 's5-16',
    category: 'Human Capital',
    description:
      'Post-Acquisition Cultural Friction: Disconnect between the "Agile Startup" mindset of Ignitarium and the "Scale" mindset of GS Lab.',
    remediation:
      'Unified leadership off-sites and cross-functional project teams to blend engineering cultures.',
  },
  {
    id: 's5-17',
    category: 'Sourcing',
    description:
      'Vendor Lock-in (Cloud/AI Platforms): Over-dependence on a single LLM provider (e.g., OpenAI) for AI-as-a-Service.',
    remediation:
      'Adopt a Multi-LLM strategy, utilizing both proprietary and open-source models (Llama, Mistral) for redundancy.',
  },
  {
    id: 's5-18',
    category: 'Supply Chain',
    description:
      'Hardware Component Shortages: Delays in obtaining specialized GPUs or sensors for Robotics/IoT projects.',
    remediation:
      'Establish "Buffer Stock" for critical hardware and build strategic partnerships with Tier-1 silicon manufacturers.',
  },
  {
    id: 's5-19',
    category: 'Legal',
    description:
      'IP Infringement Claims: Disputes over ownership of code/designs generated by AI-assisted SDLC tools.',
    remediation:
      'Strict "Clean Room" development protocols and legal clauses clarifying IP ownership in client contracts.',
  },
  {
    id: 's5-20',
    category: 'Compliance',
    description:
      'Non-compliance with ESG Standards: Failure to meet growing investor/client demands for sustainable (Green) AI.',
    remediation:
      'Optimize AI training for energy efficiency and publish annual Sustainability/ESG impact reports.',
  },
  {
    id: 's5-21',
    category: 'Compliance',
    description:
      'Automotive Safety Standards (ISO 26262): Non-compliance in embedded software for autonomous driving clients.',
    remediation:
      'Dedicated "Safety-Critical" compliance team to oversee all automotive engineering deliverables.',
  },
  {
    id: 's5-22',
    category: 'People',
    description:
      'Workforce Burnout: High pressure from rapid delivery cycles in the "AI-first" modernization space.',
    remediation:
      'Implementation of "Wellness Credits" and strictly enforced "No-Meeting Fridays" to allow deep-work time.',
  },
  {
    id: 's5-23',
    category: 'People',
    description:
      'Unconscious Bias in AI Hiring: Use of biased AI tools for internal recruitment of "Neuronauts."',
    remediation:
      'Regular auditing of recruitment algorithms and mandatory diversity training for all hiring managers.',
  },
  {
    id: 's5-24',
    category: 'Security',
    description:
      'Physical Security of Labs: Theft of proprietary hardware/Silicon prototypes from Neurealm Labs.',
    remediation:
      'Biometric access controls and 24/7 surveillance of R&D facilities with restricted "Clean Room" access.',
  },
  {
    id: 's5-25',
    category: 'Strategic',
    description:
      'Inability to Scale "Custom AI": Difficulty in turning bespoke client solutions into scalable, repeatable products.',
    remediation:
      'Standardization of "Accelerators" and "Frameworks" (like AI Assembly) to ensure 60-70% of code is reusable.',
  },
] as const;

function truncateLabel(text: string, max = 110): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Normalize for matching pasted vs stored apostrophes. */
function normalizeRiskDescriptionText(s: string): string {
  return s.trim().replace(/\u2019/g, "'").replace(/\u2018/g, "'");
}

/**
 * Risk log **Risk description** dropdown: full text as `value`, shortened `label` for the panel.
 */
export function ermSheet5RiskDescriptionDropdownOptions(): {
  label: string;
  value: string;
}[] {
  return ERM_SHEET5_ROWS.map((r) => ({
    value: r.description,
    label: truncateLabel(r.description, 140),
  }));
}

/** Risk log **Risk remediation plan** dropdown: full mitigation text as `value`. */
export function ermSheet5RiskRemediationDropdownOptions(): {
  label: string;
  value: string;
}[] {
  return ERM_SHEET5_ROWS.map((r) => ({
    value: r.remediation,
    label: truncateLabel(r.remediation, 140),
  }));
}

export function ermSheet5RowById(id: string): ErmSheet5Row | undefined {
  return ERM_SHEET5_ROWS.find((r) => r.id === id);
}

export function ermSheet5RowByDescription(
  description: string
): ErmSheet5Row | undefined {
  const n = normalizeRiskDescriptionText(description);
  return ERM_SHEET5_ROWS.find(
    (r) => normalizeRiskDescriptionText(r.description) === n
  );
}

/** Map Sheet5 "Category" cell to risk log category + optional Other specify. */
export function mapErmSheetCategoryToRiskLog(
  source: string
): { category: RiskLogCategoryValue; categoryOther: string } {
  const s = source.trim();
  if ((RISK_CATEGORIES as readonly string[]).includes(s)) {
    return { category: s as RiskLogCategoryValue, categoryOther: '' };
  }
  return { category: 'Other', categoryOther: s };
}

export function suggestedTitleFromSheet5Description(description: string): string {
  const i = description.indexOf(':');
  if (i > 0) {
    return description.slice(0, i).trim();
  }
  return truncateLabel(description, 80);
}
