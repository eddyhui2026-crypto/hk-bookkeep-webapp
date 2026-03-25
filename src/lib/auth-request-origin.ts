/** Shared guards for auth-related API routes (Origin / Referer). */

export function isAllowedSessionSyncOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const u = new URL(origin);
    if (
      u.protocol === "http:" &&
      (u.hostname === "localhost" || u.hostname === "127.0.0.1")
    )
      return true;
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    return h === "harbix.app" || /^[a-z0-9-]+bookkeep\.harbix\.app$/.test(h);
  } catch {
    return false;
  }
}

export function syncOriginFromRequest(request: Request): string | null {
  const o = request.headers.get("origin");
  if (o) return o;
  const ref = request.headers.get("referer");
  if (ref) {
    try {
      return new URL(ref).origin;
    } catch {
      /* ignore */
    }
  }
  return null;
}
