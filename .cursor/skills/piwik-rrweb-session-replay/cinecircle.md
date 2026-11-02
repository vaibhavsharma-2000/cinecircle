# CineCircle product binding

Read this before Step 0 in [SKILL.md](SKILL.md). Recording is **not enabled**. Do not create or publish Piwik tags until the owner supplies the missing values below and explicitly approves a DEV publish.

Source skill: [UX-Team-AI-Harness PR 49](https://github.com/pwc-de-ifs-pds/UX-Team-AI-Harness/pull/49) at `df6a7b27c73f77674187ac2cdd47689ffdc98ec2` (`feat/piwik-rrweb-session-replay`).

## Already true in this repo

| Setting | CineCircle value |
| --- | --- |
| Product identifier for `meta.product` | `cinecircle` |
| App routes | `/` is the whole product. Discover, Feeds, Library, Matcher, and Friends are in-page tabs, not routes. |
| Excluded route | `/reset-password`. The harness default (`/tests/.../run`, `/join`, `/unsubscribe`, `/legal`) does not exist here. Also exclude any URL whose query contains `auth=` (sign-in, sign-up, forgot password). Do not copy invite usernames from `?invite=` into rrweb `meta`. |
| `blockSelector` | `[data-private]` |
| `maskTextSelector` | `[data-mask]` |
| `maskAllInputs` | `true` |
| Marker allowlist | Empty. This app does not emit Piwik `trackEvent` calls. |
| Analytics today | `@vercel/analytics` in the root layout. That is not a Piwik container and must not load rrweb. |
| Cookie consent | `localStorage` key `cinecircle_cookie_consent`. This is **not** replay consent. Do not treat `analytics: true` as `replay_consent_status = granted`. |
| Replay consent key | Still `replay_consent_status`, written only by the opt-in popup after a clear choice. |

`data-private` already wraps sign-in, account settings, profile setup, and the password-reset page. The account-menu email uses `data-mask`.

## Missing — stop until the owner provides these

1. DEV Piwik app ID. A search for `cine` in Piwik PRO returned no app. There is no STAGE or production Piwik app either.
2. rrweb Cloud public browser key (`public_key_rr_...` only).
3. Approved retention period. Do not assume 30 days.
4. Approved consent copy and a privacy-policy URL. This product has no privacy-policy route.
5. Written approval that the evaluation environment may process session recordings.
6. A reachable opt-out in privacy settings. The cookie banner is first-visit only; after dismiss it cannot currently revoke `replay_consent_status`. Add that control before publishing the popup, because the popup copy says people can opt out there.
7. Evaluation end date and removal owner.

Do not put a secret key, email, name, or account id in a tag or in `meta`.
