# rrweb Session Replay Templates

> **Testing-only template.** Replace every `<<...>>` value. Do not put rrweb private keys, credentials, or real user identifiers in this file or a Piwik tag.

## Piwik resources

### Replay Consent Status variable

Create a custom JavaScript variable named `Replay Consent Status` with this exact function wrapper:

```javascript
function() {
  try {
    return localStorage.getItem('replay_consent_status') || '';
  } catch (e) {
    return '';
  }
}
```

Create a session custom dimension named `Replay Consent`. Record its returned **tracking ID** as `<<CONSENT_DIMENSION_TRACKING_ID>>`. The tracking ID can differ from the displayed slot number.

## Template A: consent popup tag

Attach to the existing All page views trigger. Replace the route expression, consent copy, retention copy, privacy URL, and `<<...>>` placeholders for the product.

```html
<script>
(function() {
  'use strict';
  var STATUS_KEY = 'replay_consent_status';
  var LAST_SHOWN_KEY = 'replay-optin-last-shown';
  var COOLDOWN_MS = <<COOLDOWN_DAYS>> * 24 * 60 * 60 * 1000;
  var MIN_VISITS = <<MIN_VISITS>>;
  var DIMENSION_ID = <<CONSENT_DIMENSION_TRACKING_ID>>;
  var ROOT_ID = 'session-replay-optin';
  var OVERLAY_ID = ROOT_ID + '-overlay';

  function get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function set(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function track(action) {
    try { window._paq = window._paq || []; window._paq.push(['trackEvent', 'Session Replay Consent', action]); } catch (e) {}
  }
  function setConsent(status, action) {
    set(STATUS_KEY, status);
    try { window._paq.push(['setCustomDimensionValue', DIMENSION_ID, status]); } catch (e) {}
    track(action);
  }
  function inCooldown() {
    var ts = Number(get(LAST_SHOWN_KEY));
    return Number.isFinite(ts) && Date.now() - ts < COOLDOWN_MS;
  }
  function isEligibleRoute() {
    var path = window.location.pathname || '/';
    return !/^\/(?:tests\/[^/]+\/(?:run|preview)(?:\/|$)|join(?:\/|$)|unsubscribe(?:\/|$)|legal(?:\/|$))/.test(path);
  }
  function getVisitCount(callback) {
    if (!window._paq) { callback(0); return; }
    var done = false;
    function finish(count) { if (!done) { done = true; callback(count); } }
    window.setTimeout(function() { finish(0); }, 2000);
    window._paq.push([function() {
      try {
        var info = this.getVisitorInfo();
        var priorVisits = parseInt(info[3], 10);
        finish((isNaN(priorVisits) ? 0 : priorVisits) + 1);
      } catch (e) { finish(0); }
    }]);
  }
  function remove() {
    var root = document.getElementById(ROOT_ID);
    var overlay = document.getElementById(OVERLAY_ID);
    if (root && root.parentNode) root.parentNode.removeChild(root);
    if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
  function show() {
    if (document.getElementById(ROOT_ID)) return;
    set(LAST_SHOWN_KEY, String(Date.now()));
    var overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.setAttribute('aria-hidden', 'true');
    var root = document.createElement('section');
    root.id = ROOT_ID;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', ROOT_ID + '-title');
    root.innerHTML = '<button type="button" class="close" aria-label="Close session recording request">&times;</button>' +
      '<h2 id="' + ROOT_ID + '-title">Help us improve this product</h2>' +
      '<p>With your permission, we will record future sessions so our research team can identify usability issues and understand your experience. Recordings are retained for <<RETENTION_DAYS>> days.</p>' +
      '<ul><li>We record page content, clicks, scrolling and selected product actions.</li><li>Passwords and text you type are masked. Areas marked private are excluded.</li><li>You can opt out at any time in the data privacy settings.</li></ul>' +
      '<p><a class="<<DESIGN_SYSTEM_LINK_CLASS>>" href="<<PRIVACY_POLICY_URL>>" target="_blank" rel="noreferrer">Privacy policy</a></p>' +
      '<div class="actions"><button class="<<DESIGN_SYSTEM_PRIMARY_BUTTON_CLASS>> allow" type="button">Allow session recording</button><button class="<<DESIGN_SYSTEM_PRIMARY_BUTTON_CLASS>> decline" type="button">No thanks</button></div>';
    document.body.appendChild(overlay);
    document.body.appendChild(root);
    root.querySelector('.allow').addEventListener('click', function() {
      setConsent('granted', 'consent-granted');
      remove();
      window.setTimeout(function() { window.location.reload(); }, 100);
    });
    root.querySelector('.decline').addEventListener('click', function() {
      setConsent('declined', 'consent-declined');
      remove();
    });
    function dismiss() { track('consent-dismissed'); remove(); }
    root.querySelector('.close').addEventListener('click', dismiss);
    overlay.addEventListener('click', dismiss);
    track('consent-shown');
    root.querySelector('.allow').focus();
  }

  if (!isEligibleRoute()) return;
  var status = get(STATUS_KEY);
  if (status === 'granted' || status === 'declined' || inCooldown()) return;
  getVisitCount(function(visits) {
    if (visits < MIN_VISITS) return;
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show, { once: true });
    else show();
  });
})();
</script>
```

The HTML deliberately has no product styling. Add a scoped style block or use the product's already-loaded design-system classes. Ensure the modal has a visible focus state, an accessible close control, and sufficient rendered contrast.

## Template B: consent-gated rrweb recorder tag

Attach to All page views. This is the enforcement point. Do not replace the early return with a Piwik trigger alone.

```html
<script>
(function() {
  'use strict';
  var status = '';
  try { status = localStorage.getItem('replay_consent_status') || ''; } catch (e) {}
  if (status !== 'granted' || window.__rrwebReplayStarted || window.__rrwebReplayLoading) return;

  window.__rrwebReplayLoading = true;
  var script = document.createElement('script');
  script.src = 'https://cdn.rrweb.com/browser-client/next/browser-client.umd.min.cjs';
  script.async = true;
  script.onload = function() {
    var client = window.rrwebBrowserClient;
    if (!client) { window.__rrwebReplayLoading = false; return; }
    window.__rrwebReplayStarted = true;

    client.start({
      publicApiKey: '<<RRWEB_CLOUD_PUBLIC_KEY>>',
      maskAllInputs: true,
      blockSelector: '<<BLOCK_SELECTOR>>',
      maskTextSelector: '<<MASK_TEXT_SELECTOR>>',
      meta: { product: '<<PRODUCT_IDENTIFIER>>' }
    });

    var ALLOWED_EVENTS = {
      // 'UI Interaction': ['approved-action']
    };
    if (window._paq && !window.__rrwebReplayPiwikHooked) {
      var originalPush = window._paq.push;
      window.__rrwebReplayPiwikHooked = true;
      window._paq.push = function() {
        var command = arguments[0];
        if (Array.isArray(command) && command[0] === 'trackEvent' &&
            ALLOWED_EVENTS[command[1]] && ALLOWED_EVENTS[command[1]].indexOf(command[2]) !== -1) {
          try { client.addCustomEvent('piwik-event', { category: command[1], action: command[2] }); } catch (e) {}
        }
        return originalPush.apply(window._paq, arguments);
      };
    }
  };
  script.onerror = function() { window.__rrwebReplayLoading = false; };
  (document.head || document.documentElement).appendChild(script);
})();
</script>
```

### Required selector review

| Setting | Required action |
| --- | --- |
| `maskAllInputs` | Keep `true`. |
| `blockSelector` | Include `data-private` and product screens or regions that must never be captured. Blocking removes the DOM subtree from replay. |
| `maskTextSelector` | Include `data-mask` and product text regions whose visible text must be replaced. |
| `meta` | Keep non-sensitive. Do not add email, name, account ID, URL query values, or free-text content. |
| `ALLOWED_EVENTS` | Begin empty. Add only a reviewed category/action pair. Never forward names, values, dimensions, or arbitrary event payloads. |

## Browser verification helpers

Clear state before testing:

```javascript
localStorage.removeItem('replay_consent_status');
localStorage.removeItem('replay-optin-last-shown');
```

Check the recorder after accepting and reloading:

```javascript
window.__rrwebReplayStarted
```

Check Piwik visit count manually only for troubleshooting:

```javascript
window._paq.push([function() { console.log(this.getVisitorInfo()); }]);
```

Do not use console overrides or fabricated visit data as proof of an end-to-end evaluation.
