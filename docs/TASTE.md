# TASTE

## Azure deployment should remain optional in local/dev workflows

- Preference:
  Treat `AZURE_OPENAI_DEPLOYMENT` as optional. If missing, fall back to the model name (`OPENAI_MODEL`, default `gpt-5-mini`).
- Decision rule:
  Env validation must require `AZURE_OPENAI_ENDPOINT` when Azure key is set, but must not hard-fail on missing `AZURE_OPENAI_DEPLOYMENT`.

## Use a single model variable for all non-Azure providers

- Preference:
  Do not use `BIFROST_MODEL`; use `OPENAI_MODEL` for Bifrost model selection as well.
- Decision rule:
  For `openai` and `bifrost` providers, read only `OPENAI_MODEL` (default `gpt-5-mini`) as the model override.

## Prefer boutique luxury travel UI direction

- Preference:
  When redesigning travel-planning surfaces, favor a boutique luxury / private concierge aesthetic over generic SaaS blue gradients.
- Decision rule:
  Use warm neutrals, refined spacing, and restrained concierge-oriented copy for travel UX unless the user asks for a different mood.

## Prioritize user tasks over brand theater

- Preference:
  Authenticated dashboards should foreground the user's trips, gaps, and next actions instead of brand self-promotion, eyebrow labels, or stacked marketing modules.
- Decision rule:
  Prefer deleting decorative/meta copy before adding new panels; reserve warm orange/brown accents for primary CTAs and todo states.
