// Shared info-popup channel for ACSAT dashboards, replacing native window.alert().
// Any component calls showAcsatAlert(message); AcsatAlertModal (mounted once in
// App.js) listens and renders the styled popup. No context/provider wiring
// needed since dashboards are deep in a large conditional render tree.
const listeners = new Set();

export function showAcsatAlert(message) {
  listeners.forEach((fn) => fn(message));
}

export function subscribeAcsatAlert(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
