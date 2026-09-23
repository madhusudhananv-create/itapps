import type {
  ExecutiveInsight,
  ExecutiveInsightBundle,
  ExecutiveInsightCategoryId,
  ExecutiveInsightRiskLevel,
} from '../models/executive-insight.model';

/** Simple string hash for stable daily picks (0..n-1). */
function hashDateKey(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pick<T>(arr: readonly T[], key: string, salt: string): T {
  const idx = hashDateKey(`${key}|${salt}`) % arr.length;
  return arr[idx]!;
}

/** Daily-varying level; geopolitical & security skew slightly hotter given 2026 context. */
function levelFromHash(key: string, id: ExecutiveInsightCategoryId): ExecutiveInsightRiskLevel {
  const h = hashDateKey(`${key}|level|${id}`);
  const skew = id === 'geopolitical' || id === 'security' ? 2 : 0;
  const v = (h + skew) % 9;
  if (v <= 2) return 'High';
  if (v <= 5) return 'Medium';
  return 'Low';
}

/**
 * Mock / offline provider for executive insights.
 * Swap for `HttpClient` → LLM orchestration behind `KeyInsightsEngineService`.
 */
export function buildMockExecutiveInsightBundle(effectiveDate: string): ExecutiveInsightBundle {
  const key = effectiveDate;
  const geopoliticalLevel = levelFromHash(key, 'geopolitical');
  const financialLevel = levelFromHash(key, 'financial');
  const businessLevel = levelFromHash(key, 'business');
  const peopleLevel = levelFromHash(key, 'people');
  const technicalLevel = levelFromHash(key, 'technical');
  const securityLevel = levelFromHash(key, 'security');

  const icet = pick(
    [
      'iCET: US–India silicon + R&D lanes advance, but PRC ecosystem dependence is only offset—not removed.',
      'iCET defense-tech roadmaps accelerate; export-control paperwork still paces GPU-class bring-up in India.',
    ],
    key,
    'geo1'
  );

  const exportCtrl = pick(
    [
      'Chip controls split EDA + foundry timelines—cross-border tape-outs stay volatile quarter to quarter.',
      'HBM / advanced packaging under heavier allied scrutiny—assume quarterly BIS-style rule deltas.',
    ],
    key,
    'geo2'
  );

  const energyLogistics = pick(
    [
      'Logistics + energy stress lifts fab inputs—stress-test Middle East disruption through year-end.',
      'Air-freight / fuel volatility hits NRE and mask turns—bake contingency bands into NeuGAIN commercials.',
    ],
    key,
    'geo3'
  );

  const insights: ExecutiveInsight[] = [
    {
      id: 'geopolitical',
      title: 'Geopolitical',
      headline: 'US–India iCET alignment vs. global export restrictions',
      registerCategory: 'Sourcing',
      insightBullets: [icet, exportCtrl, energyLogistics],
      riskLevel: geopoliticalLevel,
      mitigations: [
        'Maintain a dual-vendor silicon roadmap (US/EU + India partners) with documented “red team” assumptions on license lead times and foundry slots.',
        'Publish a quarterly geopolitical risk brief to delivery hubs (Bangalore, Kochi, Chennai) with explicit escalation triggers tied to export-rule changes.',
      ],
      signals: ['BIS / allied rule updates', 'Foundry allocation letters', 'iCET working-group outputs'],
    },
    {
      id: 'financial',
      title: 'Financial',
      headline: 'Silicon cost vs. NeuGAIN ROI',
      registerCategory: 'Financial',
      insightBullets: [
        pick(
          [
            'Accelerator pricing outruns generic IT budgets—buyers want $ ROI per agent workflow, not vanity pilots.',
            'Fab energy + logistics hit CapEx reviews—tie NeuGAIN spend to throughput, defects, revenue KPIs.',
          ],
          key,
          'finA'
        ),
        pick(
          [
            'CFOs want $ / inference hour + $ / automated ticket—efficiency decks alone fail gates.',
            'GPU lease vs. buy + burst premia swing quarterly—hedged capacity beats static commits.',
          ],
          key,
          'finB'
        ),
        pick(
          [
            'Long-lead silicon before SOWs drags WC—tighten milestone billing on NeuGAIN racks.',
            'FX / duty on accelerators can zero fixed-price margin—index clauses by default.',
          ],
          key,
          'finC'
        ),
      ],
      riskLevel: financialLevel,
      mitigations: [
        'Standard NeuGAIN TCO (HW + MLOps + support) with ±20% silicon shock bands.',
        'Phase-2 scale only after ROI proof: baseline, counterfactual, signed “AI utility” definition.',
      ],
      signals: ['GPU lease vs. buy curves', 'Customer ROI dashboards', 'Cloud burst premia'],
    },
    {
      id: 'business',
      title: 'Business',
      headline: 'Ignitarium integration & brand transition (April 2026)',
      registerCategory: 'Business',
      insightBullets: [
        pick(
          [
            'Silicon design + perception AI under one roof increases cross-sell potential but strains messaging, pipeline attribution, and delivery governance during the brand cutover.',
            'Princeton HQ alignment with India hubs must stay crisp on ownership for mixed NeuGAIN + silicon engagements to avoid revenue leakage and duplicate solutioning.',
          ],
          key,
          'busA'
        ),
        pick(
          [
            'Account teams need a single story for “why Neurealm + Ignitarium” without diluting NeuGAIN’s enterprise modernization proof points.',
            'Joint pursuits require clear rules on who owns P&L, delivery PMO, and escalation—especially for mixed silicon + software SOWs.',
          ],
          key,
          'busB'
        ),
        pick(
          [
            'Pipeline hygiene suffers when CRM stages are not retagged post-merger—forecast accuracy and commit calls need explicit migration checkpoints.',
            'Partner ecosystems (EDA, cloud, ISVs) expect one contracting entity and one NDA stack; fragmentation slows time-to-paper.',
          ],
          key,
          'busC'
        ),
      ],
      riskLevel: businessLevel,
      mitigations: [
        'Run a single integrated GTM narrative (NeuGAIN + silicon/perception) with joint RACI for pursuits >$250k and shared risk registers.',
        'Execute a 90-day customer comms plan: naming, contracts, escalation paths, and Ignitarium heritage proof points without slowing delivery velocity.',
      ],
      signals: ['Win/loss themes', 'Cross-practice staffing', 'Contract novation queue'],
    },
    {
      id: 'people',
      title: 'People',
      headline: 'Silicon / edge talent squeeze',
      registerCategory: 'Human Capital',
      insightBullets: [
        pick(
          [
            'RTL / edge ML skills hot—hyperscalers + funded startups shorten hub tenure.',
            'Post-Ignitarium ladders + bands feel fuzzy—senior IC flight risk spikes.',
          ],
          key,
          'peoA'
        ),
        pick(
          [
            'Bench skews generalist cloud; silicon wins need specialists—mobility alone won’t close gap.',
            'VLSI offer cycles compress; counters + sign-ons reset anchors faster than comp cycles.',
          ],
          key,
          'peoB'
        ),
        pick(
          [
            'Tape-out crunch + agent pushes without caps = burnout.',
            'Guilds + visible tech talks retain seniors—radio silence reads as M&A fear.',
          ],
          key,
          'peoC'
        ),
      ],
      riskLevel: peopleLevel,
      mitigations: [
        'Silicon & Edge guild: ladders, paid agentic upskill, rotations into NeuGAIN pods.',
        'Refresh VLSI / perception / embedded-security offers vs. US + India tier-1 benchmarks.',
      ],
      signals: ['Voluntary attrition', 'Bench depth by skill', 'Offer accept rates'],
    },
    {
      id: 'technical',
      title: 'Technical',
      headline: 'NeuGAIN autonomous agent frameworks',
      registerCategory: 'IT',
      insightBullets: [
        pick(
          [
            'Agentic orchestration increases blast radius: tool misuse, runaway privilege scopes, and brittle eval harnesses are now production-grade concerns, not demos.',
            'EU AI Act final compliance phase for agentic systems overlaps with India DPDPA enforcement—cross-border data flows in agents need privacy-by-design proofs.',
          ],
          key,
          'tecA'
        ),
        pick(
          [
            'Observability for multi-step agents is immature: failures often surface as silent quality decay rather than hard errors, evading classic SRE dashboards.',
            'Third-party tool connectors expand the attack surface faster than static APIs; each new MCP-style integration needs threat modeling and rollback plans.',
          ],
          key,
          'tecB'
        ),
        pick(
          [
            'Model and prompt versioning drift between environments causes “works in staging” incidents in production agent flows.',
            'Latency SLOs for real-time agents conflict with retrieval-heavy chains—architecture reviews must pick explicit tradeoffs per use case.',
          ],
          key,
          'tecC'
        ),
      ],
      riskLevel: technicalLevel,
      mitigations: [
        'Ship mandatory guardrails: tool allow-lists, human-in-the-loop for irreversible actions, prompt/response logging with PII minimization.',
        'Adopt continuous red-teaming for agent policies (jailbreak + prompt injection) with release gates tied to eval scorecards.',
      ],
      signals: ['Agent failure modes', 'Latency SLO breaches', 'Model / tool version drift'],
    },
    {
      id: 'security',
      title: 'Security',
      headline: 'RTL + silicon IP protection',
      registerCategory: 'Security',
      insightBullets: [
        pick(
          [
            'Poisoning + adversarial AI hit train/verify pipelines; RTL leak = trust + export breach.',
            'Ignitarium merge widens partitioned assets—zero-trust between NeuGAIN + silicon workspaces.',
          ],
          key,
          'secA'
        ),
        pick(
          [
            'Insider / contractor paths drive RTL exfil—PAM reviews must match onboarding speed.',
            'Customers want SBOM-style traceability on silicon deliverables—not just containers.',
          ],
          key,
          'secB'
        ),
        pick(
          [
            'Multi-region build farms multiply copy/leave paths—geo-fence + watermark with legal sign-off.',
            'Support tickets leak paths/filenames—red teams use them for targeted theft recon.',
          ],
          key,
          'secC'
        ),
      ],
      riskLevel: securityLevel,
      mitigations: [
        'DLP on RTL repos + signed artifacts + geo-fenced farms + break-glass admin audit.',
        'Tabletop IP exfil + model-poisoning; legal + customer comms templates ≤24h.',
      ],
      signals: ['DLP alerts', 'Anomalous clone activity', 'Third-party VPN access'],
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    effectiveDate: key,
    insights,
  };
}
