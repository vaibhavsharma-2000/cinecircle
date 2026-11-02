# Piwik PRO rrweb Session Replay

## Testing only

This skill supports a **time-limited evaluation** of rrweb Cloud as a potential Hotjar replacement.

It is **not approved for production use or personal-data processing**. Do not deploy it beyond an approved test environment until the product's privacy, legal, security, vendor, data-residency, retention, access-control, and deletion requirements have been reviewed and approved.

rrweb's capabilities do not establish compliance. Compliance depends on the particular workspace, contract, data location, configuration, consent implementation, data categories, access model, and operational controls.

## What it does

The skill creates two Piwik PRO custom tags without changing an application's build pipeline:

- An opt-in modal shown only on eligible app pages from a user's third tracked visit onward.
- A recorder that starts rrweb Cloud only after that user has opted in.

The default evaluation configuration uses a 14-day dismissal cooldown, 30-day recording-retention copy only when that matches the rrweb workspace, masked inputs, blocked private areas, and a Piwik event allowlist for replay markers.

## Before use

1. Install and authenticate the Piwik PRO MCP server with [piwik-pro-mcp-setup](../piwik-pro-mcp-setup/).
2. Confirm the product has separate DEV and STAGE or production Piwik sites.
3. Obtain an rrweb Cloud **public browser key**. Never use a secret key in browser code.
4. Obtain written approval for the evaluation environment and the consent wording.
5. Identify sensitive UI regions and selectors to block or mask.
6. Confirm the rrweb workspace retention setting. The documented default may not match the workspace configuration.

## Install

```bash
mkdir -p ~/.cursor/skills
cp -r path/to/UX-Team-AI-Harness/skills/piwik-rrweb-session-replay ~/.cursor/skills/
```

Use `.cursor/skills/` instead of `~/.cursor/skills/` to share it within one project.

## Evaluation workflow

1. Gather the product's Piwik DEV app ID, public rrweb key, consent copy, privacy-policy URL, route exclusions, retention setting, sensitive selectors, and marker allowlist.
2. Inspect the DEV Piwik container and reuse safe existing resources.
3. Create or update the consent status variable, session custom dimension, popup tag, and recorder tag.
4. Request explicit approval before publishing DEV. A Piwik publish releases every pending container draft change.
5. Test opt-in, decline, close cooldown, route exclusion, visit threshold, masking, event allowlist, and rrweb Cloud ingestion.
6. Report the DEV version and findings. Do not promote to STAGE or production without a separate approval.

## Safety checklist

- [ ] The environment is approved for testing only.
- [ ] The Piwik target is DEV, not STAGE or production.
- [ ] The public rrweb key is the only rrweb credential used in the tag.
- [ ] `maskAllInputs` is enabled.
- [ ] Sensitive regions are blocked or masked before any recording.
- [ ] The popup collects affirmative consent before rrweb loads.
- [ ] Recording retention copy matches the configured workspace value.
- [ ] rrweb marker events are a reviewed category/action allowlist.
- [ ] The evaluation has a documented end date and removal owner.

## Files

- [SKILL.md](SKILL.md): Agent workflow and safety gates.
- [reference.md](reference.md): Safe templates and browser verification helpers.
- [cinecircle.md](cinecircle.md): CineCircle product binding. Read this before changing Piwik.
- [CHANGELOG.md](CHANGELOG.md): Version history.
