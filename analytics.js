/* Set this to your public GoatCounter site address to enable tracking.
   Example: https://your-site.goatcounter.com
   This is a public site address, never an API key. Leave empty to disable. */
const GOATCOUNTER_SITE = 'https://beerpong.goatcounter.com';

(() => {
  'use strict';
  const events = new Set([
    'game-start-desktop', 'game-start-touch', 'game-win', 'game-loss',
    'rematch', 'restart', 'help-open', 'sink-player', 'sink-opponent',
    'viner-player', 'viner-opponent',
  ]);
  const pending = [];
  let endpoint = '', failed = false;
  try {
    const site = new URL(GOATCOUNTER_SITE);
    if (site.protocol === 'https:' && /^[a-z0-9-]+\.goatcounter\.com$/.test(site.hostname)) {
      endpoint = site.origin + '/count';
    }
  } catch (_) {}

  function send(name) {
    try {
      window.goatcounter.count({
        path: 'beer-pong-' + name,
        title: 'Beer Pong: ' + name.replace(/-/g, ' '),
        event: true,
        no_session: true,
      });
    } catch (_) {} // Analytics must never interrupt a rally.
  }

  window.beerPongTrack = name => {
    if (!endpoint || failed || !events.has(name)) return;
    if (typeof window.goatcounter?.count === 'function') send(name);
    else if (pending.length < 50) pending.push(name);
  };
  if (!endpoint) return;

  // Group cache-busting query strings under one page in the dashboard.
  window.goatcounter = { path: location.pathname };
  const script = document.createElement('script');
  script.src = 'https://gc.zgo.at/count.js';
  script.async = true;
  script.dataset.goatcounter = endpoint;
  script.onload = () => {
    if (typeof window.goatcounter?.count !== 'function') {
      failed = true;
      pending.length = 0;
      return;
    }
    pending.splice(0).forEach(send);
  };
  script.onerror = () => { failed = true; pending.length = 0; };
  document.head.appendChild(script);
})();
