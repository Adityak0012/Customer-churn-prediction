import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Header from "./components/Header.jsx";
import ProfilePanel from "./components/ProfilePanel.jsx";
import RiskCard from "./components/RiskCard.jsx";
import Kpis from "./components/Kpis.jsx";
import Playbook from "./components/Playbook.jsx";
import Drivers from "./components/Drivers.jsx";
import { Skeleton, ErrorState, Toast, MobileBar } from "./components/States.jsx";
import { getMeta, predict } from "./api.js";
import { DEFAULT_PROFILE, pct } from "./profile.js";

export default function App() {
  const [meta, setMeta] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [activePreset, setActivePreset] = useState("newcomer");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const reqId = useRef(0);
  const toastTimer = useRef();

  useEffect(() => { getMeta().then(setMeta).catch(() => {}); }, []);

  const score = useCallback(async (p) => {
    const id = ++reqId.current;
    setBusy(true);
    try {
      const r = await predict(p);
      if (id !== reqId.current) return;          // a newer request is in flight; ignore this one
      setResult(r); setError("");
    } catch (e) {
      if (id === reqId.current) setError(e.message || "Something went wrong");
    } finally {
      if (id === reqId.current) setBusy(false);
    }
  }, []);

  // Live scoring: re-score shortly after the profile stops changing (e.g. while dragging a slider)
  useEffect(() => {
    const t = setTimeout(() => score(profile), 220);
    return () => clearTimeout(t);
  }, [profile, score]);

  const showToast = (text, undo) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, undo });
    toastTimer.current = setTimeout(() => setToast(null), 6000);
  };

  const onChange = (patch) => { setProfile((p) => ({ ...p, ...patch })); setActivePreset(null); };

  const onPreset = (preset) => { setProfile(preset.profile); setActivePreset(preset.id); };

  const onApply = (action) => {
    const before = profile;
    setProfile({ ...profile, ...action.patch });
    setActivePreset(null);
    showToast(
      <>Applied “{action.title}” · risk <b>{pct(result.probability)}</b> → <b>{pct(action.new_probability)}</b></>,
      () => { setProfile(before); setToast(null); }
    );
  };

  const jumpToResults = () => {
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("results")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

  return (
    <>
      <Header meta={meta} />
      <main className="layout">
        <ProfilePanel profile={profile} activePreset={activePreset} onChange={onChange} onPreset={onPreset} busy={busy} />
        <div id="results" className="results">
          {error && !result ? (
            <ErrorState message={error} onRetry={() => score(profile)} />
          ) : !result ? (
            <Skeleton />
          ) : (
            <motion.div className="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              {error && <ErrorState message={error} onRetry={() => score(profile)} />}
              <div className="hero">
                <RiskCard r={result} busy={busy} />
                <Kpis r={result} />
              </div>
              <Playbook r={result} onApply={onApply} />
              <Drivers drivers={result.drivers} />
            </motion.div>
          )}
        </div>
      </main>
      <footer>
        Educational project · Trained on the IBM Telco Customer Churn dataset (7,043 customers) · Amounts in ₹ are converted at a
        purchasing-power rate of ₹{meta?.currency?.inr_per_usd ?? 21} = $1 because the model was trained on US data · Not business advice
      </footer>
      <MobileBar r={result} onJump={jumpToResults} />
      <Toast toast={toast} onUndo={() => toast?.undo?.()} />
    </>
  );
}
