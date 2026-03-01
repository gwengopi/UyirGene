const SESSION_KEY = 'ug_sid';

function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackPageView(path) {
  fetch('/api/analytics/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      sessionId: getSessionId(),
      referrer: document.referrer || null,
      userAgent: navigator.userAgent,
    }),
  }).catch(() => {});
}
