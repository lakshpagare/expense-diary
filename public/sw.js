// Deliberately minimal: this service worker exists only to satisfy the
// "installable PWA" requirement (needed for the TWA/APK wrapper). It does
// NOT cache pages or API responses - this app's data is live/dynamic
// (MongoDB-backed, session-based), so caching it could show stale or
// wrong-user data. Every request just passes straight through to the network.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // No-op: let the request go to the network normally.
});
