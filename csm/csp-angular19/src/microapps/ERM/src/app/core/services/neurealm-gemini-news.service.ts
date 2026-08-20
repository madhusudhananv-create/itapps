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

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    groundingMetadata?: {
      webSearchQueries?: string[];
      groundingChunks?: Array<{
        web?: {
          uri?: string;
          title?: string;
        };
      }>;
    };
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

function friendlyGeminiError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  const lower = raw.toLowerCase();
  if (raw.includes('(429)') || lower.includes('quota') || lower.includes('rate limit')) {
    return [
      'Gemini quota/rate limit reached for this API key or Google Cloud project.',
      'Please wait and retry, switch to a key/project with available Gemini quota, or enable billing / request quota in Google AI Studio or Google Cloud.',
    ].join(' ');
  }
  if (raw.includes('(403)') || lower.includes('permission') || lower.includes('api key')) {
    return 'Gemini rejected the request. Check that the API key is valid and that Gemini API access is enabled for the Google Cloud project.';
  }
  if (raw.includes('(400)') && lower.includes('google_search')) {
    return 'The selected Gemini model does not support Google Search grounding. Use a Gemini 2.x model such as gemini-2.0-flash.';
  }
  if (raw.length > 280) {
    return `${raw.slice(0, 277)}...`;
  }
  return raw || 'Gemini request failed. Check API key, model name, quota, and network.';
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
Use current, search-grounded public developments when the Google Search tool is available.
Be specific to Neurealm; avoid generic consulting fluff. Action items must be verifiable and role-oriented (sales, delivery, security, legal, talent).
`;

/**
 * Fetches a structured latest-news briefing via Gemini REST + Google Search grounding.
 * Note: this browser call exposes the API key; use a backend proxy for production.
 */
@Injectable({ providedIn: 'root' })
export class NeurealmGeminiNewsService {
  private readonly risks = inject(RiskService);
  private readonly firstLoadDone = { v: false };

  readonly bundle = signal<NeurealmNewsBundle | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly lastGeneratedAt = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      if (this.hasApiKey() && !this.firstLoadDone.v) {
        this.firstLoadDone.v = true;
        void this.refresh();
      }
    });
  }

  hasApiKey(): boolean {
    return Boolean(environment.geminiApiKey?.trim());
  }

  async refresh(): Promise<void> {
    const key = environment.geminiApiKey?.trim();
    if (!key) {
      this.error.set(
        'Add a Gemini API key in src/environments/environment.ts (field geminiApiKey), then reload.'
      );
      this.bundle.set(null);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    try {
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);
      const buContext = this.risks
        .businessUnits()
        .slice(0, 8)
        .join(', ');

      const userPrompt = `Today is ${dateStr} (ISO). Use Google Search grounding to find recent public news / policy / market developments from roughly the last 30-90 days that could materially affect Neurealm's strategy, delivery, revenue, security, compliance, or risk posture.
Context: key business / BU themes seen in the app: ${buContext || 'General enterprise + tech'}.
Neurealm context: Princeton + India hubs; enterprise modernization, agentic/GenAI, healthcare IT, silicon/embedded, cloud/managed operations, AIOps/RunOps.

Return JSON with this exact shape (no extra keys at top level):
{
  "briefingTitle": "Short title for the whole briefing",
  "contextNote": "One sentence naming the time horizon and that Google Search grounding was used.",
  "items": [
    {
      "headline": "Crisp headline",
      "summary": "2-4 sentence plain-language summary of the development.",
      "neurealmImpact": "High" | "Medium" | "Low",
      "whyItMatters": "2-5 sentences on how this could affect Neurealm specifically (clients, delivery, security, compliance, India/US footprint, GenAI, healthcare, silicon).",
      "actionItems": [ "2-4 concrete next steps" ],
      "tags": [ "1-3 short theme tags" ],
      "sources": [ { "title": "Source name", "uri": "https://..." } ]
    }
  ],
  "disclaimer": "One sentence: verify against primary sources; not legal/financial advice."
}

Supply exactly 5 items, ordered with highest business relevance to Neurealm first. neurealmImpact should reflect materiality to Neurealm, not the whole world.
Prefer credible sources such as official regulators, hyperscaler/security/vendor blogs, standards bodies, reputable business/technology press, and industry analysts.`;

      const model = environment.geminiModel || 'gemini-2.0-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(key)}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
          },
        }),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Gemini request failed (${response.status}): ${body || response.statusText}`);
      }
      const payload = (await response.json()) as GeminiGenerateContentResponse;
      const candidate = payload.candidates?.[0];
      const text =
        candidate?.content?.parts
          ?.map((p) => p.text ?? '')
          .join('')
          .trim() ?? '';
      if (!text) {
        throw new Error('Empty response from Gemini.');
      }
      const grounding = candidate?.groundingMetadata;
      const groundedSources = dedupeSources(
        grounding?.groundingChunks
          ?.map((c) => c.web)
          .filter((w): w is { uri?: string; title?: string } => w != null)
          .map((w) => ({
            uri: w.uri?.trim() ?? '',
            title: w.title?.trim() || w.uri?.trim() || 'Source',
          }))
          .filter((s) => s.uri !== '') ?? []
      );
      const searchQueries = grounding?.webSearchQueries ?? [];
      const raw = JSON.parse(extractJsonObject(text)) as unknown;
      const valid = validateBundle(raw, groundedSources, searchQueries);
      if (!valid) {
        throw new Error('Could not parse valid briefing from model response.');
      }
      this.bundle.set(valid);
      this.lastGeneratedAt.set(new Date().toISOString());
    } catch (e) {
      this.error.set(friendlyGeminiError(e));
      // Keep the last successful briefing visible if a later refresh hits quota/rate limits.
      if (!this.bundle()) {
        this.lastGeneratedAt.set(null);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
