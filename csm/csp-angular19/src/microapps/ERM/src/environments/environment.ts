/**
 * App configuration. Secrets must stay server-side. The OpenAI key is read by
 * the dev/server proxy from OPENAI_API_KEY, never from this browser bundle.
 */
export const environment = {
  production: false,
  /** Browser-safe placeholder only. Do not put real API keys in this file. */
  geminiApiKey: '',
  /** Model id used by the legacy Gemini service if a backend proxy is added for it. */
  geminiModel: 'gemini-2.0-flash',
  /** Model used for OpenAI real-time insights. */
  openAiModel: 'gpt-4.1-mini',
};
