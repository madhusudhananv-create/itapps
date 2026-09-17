import {
  Injectable,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import type {
  NeurealmNewsBundle,
  NeurealmNewsSource,
} from '../models/neurealm-news.model';
import { environment } from '../../../environments/environment';
import { RiskService } from './risk.service';

interface OpenAiResponsesResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      annotations?: Array<{
        type?: string;
        title?: string;
        url?: string;
      }>;
    }>;
  }>;
}

function extractJsonObject(text: string): string {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    return fence[1]!.trim();
  }
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return t.slice(start, end + 1);
  }
  return t;
}

function readSources(value: unknown): NeurealmNewsSource[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((s) => {
      if (!s || typeof s !== 'object') return null;
      const r = s as Record<string, unknown>;
      const title = r['title'];
      const uri = r['uri'];
      if (typeof uri !== 'string' || !uri.trim()) return null;
      return {
        title: typeof title === 'string' && title.trim() ? title.trim() : uri.trim(),
        uri: uri.trim(),
      };
    })
    .filter((s): s is NeurealmNewsSource => s != null);
}

function dedupeSources(sources: NeurealmNewsSource[]): NeurealmNewsSource[] {
  const seen = new Set<string>();
  const out: NeurealmNewsSource[] = [];
  for (const s of sources) {
    if (seen.has(s.uri)) continue;
    seen.add(s.uri);
    out.push(s);
  }
  return out;
}

function openAiText(payload: OpenAiResponsesResponse): string {
  if (payload.output_text?.trim()) {
    return payload.output_text.trim();
  }
  return (
    payload.output
      ?.flatMap((o) => o.content ?? [])
      .map((c) => c.text ?? '')
      .join('')
      .trim() ?? ''
  );
}

function openAiCitationSources(payload: OpenAiResponsesResponse): NeurealmNewsSource[] {
  const annotations =
    payload.output?.flatMap((o) => o.content?.flatMap((c) => c.annotations ?? []) ?? []) ?? [];
  return dedupeSources(
    annotations
      .filter((a) => a.type === 'url_citation' && typeof a.url === 'string' && a.url.trim())
      .map((a) => ({
        title: a.title?.trim() || a.url!.trim(),
        uri: a.url!.trim(),
      }))
  );
}

function friendlyOpenAiError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const lower = raw.toLowerCase();
  if (raw.includes('(401)') || lower.includes('incorrect api key') || lower.includes('invalid api key')) {
    return 'OpenAI rejected the API key. Check that the key is valid and active for the selected project.';
  }
  if (raw.includes('(403)') || lower.includes('permission')) {
    return 'OpenAI denied access for this key or model. Check project permissions and model access.';
  }
  if (raw.includes('(429)') || lower.includes('rate limit') || lower.includes('quota')) {
    return 'OpenAI quota or rate limit reached. Please retry later or use a project with available quota.';
  }
  if (raw.includes('(400)') && lower.includes('web_search_preview')) {
    return 'The selected OpenAI model does not support web search. Choose a model with Responses API web search support.';
  }
  if (lower.includes('openai_api_key is not set')) {
    return 'OpenAI API key is not configured on the server. Set OPENAI_API_KEY in the server environment or .env.local, then restart the dev server.';
  }
  if (lower.includes('failed to fetch')) {
    return 'OpenAI request could not be reached from the browser. For production, use a backend proxy to call OpenAI securely.';
  }
  if (raw.length > 280) {
    return `${raw.slice(0, 277)}...`;
  }
  return raw || 'OpenAI request failed. Check API key, model name, quota, and network.';
}

function validateBundle(
  data: unknown,
  fallbackSources: NeurealmNewsSource[],
  searchQueries: string[]
): NeurealmNewsBundle | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  const title = o['briefingTitle'];
  const contextNote = o['contextNote'];
  const disclaimer = o['disclaimer'];
  const items = o['items'];
  if (typeof title !== 'string' || !title.trim()) return null;
  if (typeof contextNote !== 'string') return null;
  if (typeof disclaimer !== 'string') return null;
  if (!Array.isArray(items) || items.length === 0) return null;
  const outItems: NeurealmNewsBundle['items'] = [];
  for (const it of items) {
    if (!it || typeof it !== 'object') continue;
    const r = it as Record<string, unknown>;
    const headline = r['headline'];
    const summary = r['summary'];
    const neurealmImpact = r['neurealmImpact'];
    const whyItMatters = r['whyItMatters'];
    const actionItems = r['actionItems'];
    const tags = r['tags'];
    const itemSources = readSources(r['sources']);
    if (typeof headline !== 'string' || !headline.trim()) continue;
    if (typeof summary !== 'string') continue;
    if (neurealmImpact !== 'High' && neurealmImpact !== 'Medium' && neurealmImpact !== 'Low') {
      continue;
    }
    if (typeof whyItMatters !== 'string') continue;
    const actions = Array.isArray(actionItems)
      ? actionItems.filter((a): a is string => typeof a === 'string' && a.trim() !== '')
      : [];
    const tagList = Array.isArray(tags)
      ? tags.filter((a): a is string => typeof a === 'string' && a.trim() !== '')
      : [];
    outItems.push({
      headline: headline.trim(),
      summary: summary.trim(),
      neurealmImpact,
      whyItMatters: whyItMatters.trim(),
      actionItems: actions,
      tags: tagList,
      sources: itemSources.length ? itemSources : fallbackSources.slice(0, 3),
    });
  }
  if (!outItems.length) return null;
  return {
    briefingTitle: title.trim(),
    contextNote: contextNote.trim(),
    items: outItems,
    disclaimer: disclaimer.trim(),
    searchQueries,
  };
}

const SYSTEM_INSTRUCTION = `You are a corporate strategy and risk analyst for Neurealm.
Neurealm is a technology company with Princeton and India delivery hubs, offering NeuGAIN and related services across:
enterprise modernization, agentic/GenAI, healthcare IT, silicon/embedded, and managed operations (e.g. RunOps, AIOps themes).
Your audience is executive leadership preparing for ERM and account decisions.

You must output ONLY valid JSON (no markdown fences) matching the schema the user provides.
Use current public developments from web search when available.
Be specific to Neurealm; avoid generic consulting fluff. Action items must be verifiable and role-oriented (sales, delivery, security, legal, talent).
`;

/**
 * Fetches a structured latest-news briefing via OpenAI Responses API + web search.
 * Note: this browser call exposes the API key; use a backend proxy for production.
 */
@Injectable({ providedIn: 'root' })
export class NeurealmOpenAiInsightsService {
  private readonly risks = inject(RiskService);
  private readonly firstLoadDone = { v: false };

  readonly bundle = signal<NeurealmNewsBundle | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastGeneratedAt = signal<string | null>(null);
  readonly focusTheme = signal('All');

  constructor() {
    afterNextRender(() => {
      if (this.hasApiKey() && !this.firstLoadDone.v) {
        this.firstLoadDone.v = true;
        void this.refresh();
      }
    });
  }

  hasApiKey(): boolean {
    return true;
  }

  setFocusTheme(theme: string): void {
    this.focusTheme.set(theme);
    void this.refresh();
  }

  async refresh(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const buContext = this.risks
        .businessUnits()
        .slice(0, 8)
        .join(', ');
      const focusTheme = this.focusTheme();
      const focusInstruction =
        focusTheme && focusTheme !== 'All'
          ? `Focus area: ${focusTheme}. Prioritize public developments, risks, opportunities, and actions relevant to Neurealm's ${focusTheme} leaders and operating decisions.`
          : 'Focus area: cross-functional executive view across finance, business, IT, operations, supply chain, GTM, human capital, revenue, legal, and security.';

      const userPrompt = `Today is ${dateStr} (ISO). Use web search to find recent public news / policy / market developments from roughly the last 30-90 days that could materially affect Neurealm's strategy, delivery, revenue, security, compliance, or risk posture.
Context: key business / BU themes seen in the app: ${buContext || 'General enterprise + tech'}.
Neurealm context: Princeton + India hubs; enterprise modernization, agentic/GenAI, healthcare IT, silicon/embedded, cloud/managed operations, AIOps/RunOps.
${focusInstruction}

Return JSON with this exact shape (no extra keys at top level):
{
  "briefingTitle": "Short title for the whole briefing",
  "contextNote": "One sentence naming the time horizon and that OpenAI web search was used.",
  "items": [
    {
      "headline": "Crisp headline under 11 words",
      "summary": "1-2 short executive bullets. Each bullet must be under 14 words. Separate bullets with newline characters.",
      "neurealmImpact": "High" | "Medium" | "Low",
      "whyItMatters": "1-2 short executive bullets on Neurealm impact. Each bullet must be under 14 words. Separate bullets with newline characters.",
      "actionItems": [ "Exactly 2 concrete next steps, each under 12 words" ],
      "tags": [ "1-3 short theme tags" ],
      "sources": [ { "title": "Source name", "uri": "https://..." } ]
    }
  ],
  "disclaimer": "One sentence: verify against primary sources; not legal/financial advice."
}

Supply exactly 5 items, ordered with highest relevance to the selected focus area first. neurealmImpact should reflect materiality to Neurealm, not the whole world.
Write for CEO/COO/CxO consumption: crisp, decision-oriented, no long paragraphs, no generic commentary.
Prefer credible sources such as official regulators, hyperscaler/security/vendor blogs, standards bodies, reputable business/technology press, and industry analysts.`;

      const response = await fetch('/openai/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: environment.openAiModel || 'gpt-4.1-mini',
          input: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userPrompt },
          ],
          tools: [{ type: 'web_search_preview' }],
          temperature: 0.35,
          max_output_tokens: 8192,
          text: {
            format: {
              type: 'json_schema',
              name: 'neurealm_news_bundle',
              strict: true,
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['briefingTitle', 'contextNote', 'items', 'disclaimer'],
                properties: {
                  briefingTitle: { type: 'string' },
                  contextNote: { type: 'string' },
                  disclaimer: { type: 'string' },
                  items: {
                    type: 'array',
                    minItems: 5,
                    maxItems: 5,
                    items: {
                      type: 'object',
                      additionalProperties: false,
                      required: [
                        'headline',
                        'summary',
                        'neurealmImpact',
                        'whyItMatters',
                        'actionItems',
                        'tags',
                        'sources',
                      ],
                      properties: {
                        headline: { type: 'string' },
                        summary: { type: 'string' },
                        neurealmImpact: { type: 'string', enum: ['High', 'Medium', 'Low'] },
                        whyItMatters: { type: 'string' },
                        actionItems: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        tags: {
                          type: 'array',
                          items: { type: 'string' },
                        },
                        sources: {
                          type: 'array',
                          items: {
                            type: 'object',
                            additionalProperties: false,
                            required: ['title', 'uri'],
                            properties: {
                              title: { type: 'string' },
                              uri: { type: 'string' },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`OpenAI request failed (${response.status}): ${body || response.statusText}`);
      }
      const payload = (await response.json()) as OpenAiResponsesResponse;
      const text = openAiText(payload);
      if (!text) {
        throw new Error('Empty response from OpenAI.');
      }
      const citedSources = openAiCitationSources(payload);
      const raw = JSON.parse(extractJsonObject(text)) as unknown;
      const valid = validateBundle(raw, citedSources, ['OpenAI web search']);
      if (!valid) {
        throw new Error('Could not parse valid briefing from OpenAI response.');
      }
      this.bundle.set(valid);
      this.lastGeneratedAt.set(new Date().toISOString());
    } catch (e) {
      this.error.set(friendlyOpenAiError(e));
      // Keep the last successful briefing visible if a later refresh hits quota/rate limits.
      if (!this.bundle()) {
        this.lastGeneratedAt.set(null);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
