/**
 * LLM configuration and mock/LLM mode switch.
 *
 * Set USE_MOCK_AI=false and add an API key to use real LLM providers.
 */

export const USE_MOCK_AI =
  process.env.USE_MOCK_AI !== "false" && process.env.USE_MOCK_AI !== "0";

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
export const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? "";

/** Provider to use when USE_MOCK_AI=false. */
export const LLM_PROVIDER = (process.env.LLM_PROVIDER ?? "openai") as
  | "openai"
  | "anthropic";

export function isMockMode(): boolean {
  return USE_MOCK_AI;
}

export function hasLLMApiKey(): boolean {
  if (LLM_PROVIDER === "openai") return !!OPENAI_API_KEY;
  if (LLM_PROVIDER === "anthropic") return !!ANTHROPIC_API_KEY;
  return false;
}
