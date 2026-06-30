import type { TranscriptEntry } from "@paperclipai/adapter-utils";
import type { UIAdapterModule } from "../types";
import { LovonGroqFreeConfigFields } from "./config-fields";
import { buildLovonGroqFreeConfig } from "./build-config";

function passthroughStdoutLine(line: string, ts: string): TranscriptEntry[] {
  if (!line) return [];
  return [{ kind: "stdout", ts, text: line }];
}

export const lovonGroqFreeUIAdapter: UIAdapterModule = {
  type: "lovon_groq_free",
  label: "Lovon · Groq Free",
  parseStdoutLine: passthroughStdoutLine,
  ConfigFields: LovonGroqFreeConfigFields,
  buildAdapterConfig: buildLovonGroqFreeConfig,
};