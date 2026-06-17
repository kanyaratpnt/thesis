import { apiUrl } from "./http.js";

const BACKEND_PATH_PREFIXES = [
  "/api",
  "/auth",
  "/school",
  "/admin",
  "/upload",
  "/donations",
  "/certificates",
  "/notifications",
  "/seller",
];

function isBackendPath(url) {
  if (typeof url !== "string" || !url.startsWith("/")) return false;
  return BACKEND_PATH_PREFIXES.some(
    (prefix) => url === prefix || url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`)
  );
}

export function installFetchBase() {
  if (typeof window === "undefined" || window.__unieedFetchBaseInstalled) return;

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    if (isBackendPath(input)) {
      return originalFetch(apiUrl(input), init);
    }
    return originalFetch(input, init);
  };

  window.__unieedFetchBaseInstalled = true;
}
