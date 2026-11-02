---
name: piwik-rrweb-session-replay
description: Adds a testing-only rrweb Cloud session-replay evaluation through Piwik PRO custom tags, with explicit research opt-in, privacy masking, safe Piwik event markers, and DEV-first verification. Use when evaluating rrweb Cloud as a Hotjar replacement or adding consent-gated session recording without changing application code. In CineCircle, read cinecircle.md before changing anything.
---

# Piwik PRO rrweb Session Replay

> **Testing only.** This skill evaluates rrweb Cloud as a potential Hotjar replacement. Do not use it in production or for personal-data processing until privacy, legal, security, data-residency, retention, and vendor approval are complete.

Deploy two self-contained Piwik PRO custom tags. The app code is unchanged unless the product needs new `data-private` or `data-mask` selectors.

1. **Session Replay Opt-in Popup** requests research consent.
2. **Session Replay Recorder** loads rrweb Cloud only after the user has opted in.

Read [reference.md](reference.md) before creating either tag. See [README.md](README.md) for the evaluation boundary and installation. In this repo, read [cinecircle.md](cinecircle.md) before Step 0.

## Non-negotiable safeguards

- Work in the product's **DEV** Piwik site first. Never copy the setup to STAGE or production without separate user approval after DEV verification.
- Never use an rrweb secret key. A browser tag may contain only a `public_key_rr_...` key.
- Do not load the rrweb client, create a recording, or attach event hooks unless local consent is exactly `granted`.
- Set `maskAllInputs: true`. Add product-specific `blockSelector` and `maskTextSelector` values before recording sensitive views.
- Forward only an explicit Piwik event `category` and `action` allowlist as rrweb custom events. Never forward event names, values, free text, custom dimensions, URLs with identifiers, or user profile data.
- Do not claim the setup is GDPR-compliant. The product owner must obtain the required approvals.

## Defaults

Use these only when the product owner accepts them. Otherwise collect a product-specific value.

| Setting | Default |
| --- | --- |
| Scope | Authenticated app pages only. Exclude runner, preview, public join, unsubscribe, and legal routes. |
| Popup threshold | Third tracked visit or later. |
| Close cooldown | 14 days. |
| Accept / decline | Persisted per app domain/browser in `localStorage`. |
| Recording retention copy | 30 days, only if the rrweb workspace is configured for 30 days. |
| Input protection | `maskAllInputs: true` plus product selectors. |
| Piwik markers | Reviewed allowlist only. |

## Step 0: Gather configuration

**Stop before changing Piwik.** Use `AskQuestion` for choices and collect the following.

1. DEV Piwik app ID and the corresponding STAGE or production app ID, if one exists.
2. rrweb Cloud public browser key and a non-sensitive product identifier.
3. Whether the target is an authenticated internal product. If not, obtain the privacy and consent approach before continuing.
4. The approved retention period in the rrweb workspace. Do not assume 30 days.
5. Routes that are app pages and all exclusions. Confirm runner, preview, public, and legal routes.
6. Sensitive selectors to block or mask. Start with `data-private` and `data-mask`; add product-specific selectors.
7. Consent copy, privacy-policy URL, language, and the organisation's approved privacy wording.
8. The reviewed Piwik event category/action pairs allowed as rrweb markers. The default is an empty allowlist.
9. Whether an existing `Replay Consent` custom dimension, `Replay Consent Status` variable, or session-replay tags already exist.

Confirm that the work is an evaluation only. If the owner requests production rollout, stop and request the required approval evidence.

## Step 1: Inspect the DEV Piwik container

Use the Piwik MCP server configured for the product. List tags, variables, triggers, custom dimensions, and the latest published version for the **DEV** app ID. Reuse equivalent resources when safe. Do not duplicate tags or variables.

Confirm there is an All page views trigger and the Piwik analytics tag is present. The popup and recorder both attach to All page views. The recorder's JavaScript performs the actual privacy gate.

## Step 2: Create consent resources

Create or verify:

1. `Replay Consent Status`, a custom JavaScript variable that reads `replay_consent_status` from local storage. Its value must be wrapped in `function() { ... }`.
2. `Replay Consent`, a **session** custom dimension accepting `granted` and `declined`.
3. Optionally, `Replay Consent Granted`, a page-view trigger where `{{ Replay Consent Status }}` equals `granted`. Keep it for reporting, but do not rely on it as the recorder's only gate.

Use the custom dimension's **tracking ID**, not its UI slot number, in `setCustomDimensionValue`.

## Step 3: Create or update the popup tag

Use Template A in [reference.md](reference.md). Attach it to All page views.

The popup must:

- return immediately on excluded routes, declined/granted consent, or an active cooldown;
- wait until Piwik reports at least the configured visit count;
- set `granted` or `declined` only after a clear user action;
- write the decision to the session custom dimension and track a consent event;
- use the product's loaded design-system classes for controls where available;
- link to the product privacy policy; and
- state that users can opt out at any time in the data privacy settings; and
- treat close or overlay dismissal as a cooldown, not consent.

## Step 4: Create or update the recorder tag

Use Template B in [reference.md](reference.md). Attach it to All page views.

The first executable recorder operation must read local storage and return unless consent is `granted`. Guard repeat initialization in SPAs. Load the rrweb UMD browser client only after that gate passes.

Do not pass a raw user identifier in `meta`. Omit `user_id` unless the product owner has approved a documented, non-reversible pseudonymous identifier and its deletion process.

## Step 5: Publish and verify DEV

Before publishing, explain that `versions_publish_draft` publishes every pending change in that Piwik container. Obtain explicit approval to publish DEV.

Verify in a fresh browser profile or after clearing the two local-storage keys:

1. The popup stays hidden on excluded routes and before the visit threshold.
2. It appears on an eligible app page on the configured visit.
3. Decline suppresses it permanently for that app domain/browser.
4. Close or overlay dismissal suppresses it only for the cooldown.
5. Accept writes `granted`; the next page view starts rrweb once.
6. An rrweb Cloud recording arrives with masking and block selectors working.
7. An allowed Piwik event creates a `piwik-event` marker. A disallowed event does not.
8. Console output contains no Piwik variable evaluation errors.

For user-facing layout, verify the rendered popup and computed foreground/background pairs. Do not declare contrast compliance from source inspection alone.

## Step 6: Handle future environments

Report the DEV Piwik version, resources changed, and verification result. STAGE or production requires a separate decision, privacy review, and publish approval. Recreate the resources in the target's separate Piwik site. Never assume Piwik sites share IDs, variables, or dimensions.

## Piwik publishing safety

- Create/update Piwik resources only after the user confirms the target environment.
- Publish DEV only with explicit approval.
- Publish STAGE or production only after successful DEV verification and a new explicit approval.
- A publish is not an undo mechanism. Roll back through a corrective draft and publish.

## Additional resources

- CineCircle routes, selectors, and missing approvals: [cinecircle.md](cinecircle.md)
- Templates and Piwik resource details: [reference.md](reference.md)
- Evaluation scope and installation: [README.md](README.md)
- Piwik click instrumentation: [../piwik-pro-event-tracking/SKILL.md](../piwik-pro-event-tracking/SKILL.md)
- Piwik MCP setup: [../piwik-pro-mcp-setup/SKILL.md](../piwik-pro-mcp-setup/SKILL.md)
