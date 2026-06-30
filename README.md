# Lovon Teams

> **The free-tier-first fork of [Paperclip](https://github.com/paperclipai/paperclip).**
> Build and run a company of AI agents — start with **zero API spend**, scale up to paid
> models only when you outgrow the free tiers.

[![MIT License](https://img.shields.io/badge/license-MIT-blue)](./LICENSE)
[![Upstream: Paperclip](https://img.shields.io/badge/upstream-Paperclip-7c3aed)](https://github.com/paperclipai/paperclip)
[![Lovon Free Providers](https://img.shields.io/badge/Lovon-Free%20Providers-8-green)](./packages/adapters/lovon-groq-free)

Lovon Teams is the same control plane as Paperclip — org charts, budgets, governance,
goal alignment, heartbeat execution, audit log, multi-company isolation — but with a
**provider palette optimized for free tiers** and an optional **Headroom token-optimization
layer** that lets you stretch those quotas further.

If Paperclip is the company, **Lovon Teams is the company that pays $0 to start.**

---

## What's different from upstream Paperclip

| | Upstream Paperclip | **Lovon Teams** |
|---|---|---|
| Gemini support | ✅ via `gemini_local` | ✅ via `gemini_local` (same) + documented as primary **Lovon Free** lane |
| Claude / OpenAI / Cursor | ✅ paid | ✅ paid (unchanged) |
| **Groq** (free Llama / Mixtral / Gemma) | ❌ | ✅ `lovon_groq_free` adapter |
| **GitHub Models** (free GPT-4o / Claude / Llama for devs) | ❌ | ✅ `lovon_github_models_free` |
| **Cloudflare Workers AI** (free tier) | ❌ | ✅ `lovon_cloudflare_free` |
| **Hugging Face Inference** (free for small models) | ❌ | ✅ `lovon_huggingface_free` |
| **Cohere Trial** | ❌ | ✅ `lovon_cohere_free` |
| **Mistral La Plateforme** (free tier) | ❌ | ✅ `lovon_mistral_free` |
| **OpenRouter Free Models** | ❌ | ✅ `lovon_openrouter_free` |
| **Headroom token-optimization proxy** | ❌ | ✅ optional, documented integration |
| All other Paperclip features | ✅ | ✅ (unchanged) |

> Everything else — org chart, budgets, governance, heartbeats, audit log, mobile UI,
> multi-company — is identical to upstream Paperclip. We are a derivative work, not a
> rewrite. See [`NOTICE`](./NOTICE) for license and attribution details.

---

## Quickstart

### Option A — Lovon Free (no upfront API spend)

```bash
git clone https://github.com/fjosmoreno/lovon-teams.git
cd lovon-teams
pnpm install
pnpm dev
```

The server boots with embedded PostgreSQL at `http://localhost:3100`.
The UI loads in your browser automatically.

Then:

1. Open the **Agent Configuration** screen.
2. In the **Provider** dropdown, pick one of the **Lovon Free** options:
   - `Lovon · Groq Free` — sign up at <https://console.groq.com> for a free API key.
   - `Lovon · GitHub Models Free` — use any GitHub Personal Access Token.
   - `Lovon · Gemini Free` — get a free key at <https://aistudio.google.com/app/apikey>.
   - `Lovon · Cloudflare Workers AI Free` — get a free Account ID + API token.
   - `Lovon · Hugging Face Free` — get a free Inference API token.
   - `Lovon · Cohere Trial Free` — sign up at <https://dashboard.cohere.com>.
   - `Lovon · Mistral La Plateforme Free` — sign up at <https://console.mistral.ai>.
   - `Lovon · OpenRouter Free Models` — sign up at <https://openrouter.ai>.
3. Paste the key, set a per-agent budget, and click **Hire**.

You now have a working AI agent company that runs on **free-tier inference only**.

### Option B — Headroom-optimized (recommended for production free tier)

If you want to stretch the free quotas further, run [Headroom](https://docs.headroom.sh) as
a local proxy and point your Lovon Teams providers at it:

```bash
# In a separate terminal, with the Headroom proxy running on :8787
HEADROOM_URL=http://127.0.0.1:8787 \
HEADROOM_ENABLED=1 \
pnpm dev
```

Lovon Teams will route requests through Headroom, which applies caching, deduplication,
and prompt compression to reduce token burn on every call. See
[`doc/lovon-headroom.md`](./doc/lovon-headroom.md) for full setup.

### Option C — Upstream providers (Claude / OpenAI / Cursor)

The upstream Paperclip adapters (`claude_local`, `codex_local`, `cursor`, etc.) are all
available unchanged. If you already pay for one of them, point Lovon Teams at it and
proceed.

---

## Lovon Free Provider setup (one-time per provider)

| Provider | Where to get the key | Free tier |
|---|---|---|
| Groq | <https://console.groq.com> | Generous daily token budget, fast Llama 3 / Mixtral |
| GitHub Models | <https://github.com/settings/tokens> (fine-grained, no scopes needed) | Per-model quotas for GPT-4o, Claude, Llama |
| Cloudflare Workers AI | <https://dash.cloudflare.com/?to=/:account/ai/workers-ai> | 10k neurons/day free |
| Hugging Face Inference | <https://huggingface.co/settings/tokens> | Free for many small/medium models |
| Cohere Trial | <https://dashboard.cohere.com> | Free trial credits, then rate-limited free tier |
| Mistral La Plateforme | <https://console.mistral.ai> | Free tier on `mistral-small` and friends |
| OpenRouter Free Models | <https://openrouter.ai> | Several free models, key required |

Each Lovon Free adapter accepts the key either via:

- The agent configuration form in the UI, or
- The `LOVON_<PROVIDER>_API_KEY` environment variable.

---

## Development

```bash
pnpm install              # install all workspace packages
pnpm dev                  # API + UI watch mode on http://localhost:3100
pnpm test                 # cheap vitest pass
pnpm typecheck            # full typecheck
pnpm build                # build all packages
```

Server-only:

```bash
pnpm dev:server
```

UI-only:

```bash
pnpm dev:ui
```

DB (the embedded PGlite DB lives at `./data/pglite` by default):

```bash
rm -rf data/pglite        # reset local dev DB
pnpm dev                  # re-bootstraps the schema
```

---

## Syncing with upstream Paperclip

Lovon Teams is a long-running fork. We periodically rebase against upstream `master`:

```bash
git remote add upstream https://github.com/paperclipai/paperclip.git
git fetch upstream
git rebase upstream/master
```

Rebase conflicts are expected in `package.json`, `server/src/adapters/registry.ts`,
and `ui/src/adapters/metadata.ts`. Resolve by keeping both upstream provider support
**and** the Lovon Free providers.

---

## License

Lovon Teams is released under the **MIT License** — the same license as upstream Paperclip.

- See [`LICENSE`](./LICENSE) for the full MIT text.
- See [`NOTICE`](./NOTICE) for attribution to Paperclip Labs, Inc. and a list of
  modifications made for Lovon Teams.

Copyright (c) 2025 Paperclip AI (original work)
Copyright (c) 2026 Fernando Moreno (Lovon Teams modifications)