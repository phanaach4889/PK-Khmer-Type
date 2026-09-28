import { useState } from 'react';
/** Same-origin host keeps Phase 9 input behavior and localStorage schemas intact. */
export function LegacyApplication() {
  const [loaded, setLoaded] = useState(false);
  return <main className="app-shell bg-slate-950" aria-busy={!loaded}>
    {!loaded && <div className="boot-screen text-amber-200">Loading PK Khmer Type…</div>}
    <iframe className={loaded ? 'legacy-app is-ready' : 'legacy-app'} title="PK Khmer Type" src="/legacy.html" onLoad={() => setLoaded(true)} />
  </main>;
}
