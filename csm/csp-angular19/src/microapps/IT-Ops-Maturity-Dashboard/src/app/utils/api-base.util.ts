/**
 * Resolves the CSM AllSys API base URL from the page's own runtime origin,
 * rather than trusting whichever Angular environment file (environment.ts vs
 * environment.prod.ts) this micro-app happened to be built with.
 *
 * This micro-app is always opened via window.open(window.location.origin + ...)
 * from the shell, so its runtime origin always matches the shell's own origin -
 * meaning it's the one reliable signal for which backend to call, regardless of
 * which `ng build` configuration produced this bundle. Building with
 * `--configuration production` (as this app's deploy pipeline always does)
 * bakes in environment.prod.ts's csmapi.neurealm.com URL even when the bundle
 * ends up served from a local dev shell (localhost:4201 -> localhost:53505) -
 * a token issued by one backend is never valid against the other, so getting
 * this wrong causes silent 401s instead of a build-time-obvious problem.
 */
export function resolveWebApiUri(): string {
  const origin = window.location.origin;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin) || origin.includes('127.0.0.1')) {
    return 'http://localhost:53505/api/AllSys/';
  }
  if (origin.includes('csmuat.neurealm.com')) {
    return 'https://csmuatapi.neurealm.com/api/AllSys/';
  }
  return 'https://csmapi.neurealm.com/api/AllSys/';
}
