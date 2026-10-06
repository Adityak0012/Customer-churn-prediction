import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { pct } from "../profile.js";

export function Skeleton() {
  const pulse = { animate: { opacity: [0.5, 1, 0.5] }, transition: { duration: 1.2, repeat: Infinity } };
  return (
    <div className="results" aria-busy="true" aria-label="Loading prediction">
      <div className="hero">
        <motion.div className="skeleton" style={{ height: 212 }} {...pulse} />
        <motion.div className="skeleton" style={{ height: 212 }} {...pulse} />
      </div>
      <motion.div className="skeleton" style={{ height: 260 }} {...pulse} />
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <motion.section className="panel state" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="state-icon"><AlertTriangle size={24} aria-hidden="true" /></div>
      <h3>Couldn't score this customer</h3>
      <p>{message}. Make sure the Flask server (python app/app.py) is running, then try again.</p>
      <button type="button" className="retry" onClick={onRetry}><RefreshCw size={15} aria-hidden="true" /> Try again</button>
    </motion.section>
  );
}

export function Toast({ toast, onUndo }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div key={toast.id} className="toast" role="status"
          initial={{ opacity: 0, y: 24, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 16, x: "-50%" }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}>
          <span>{toast.text}</span>
          <button type="button" onClick={onUndo}>Undo</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function MobileBar({ r, onJump }) {
  if (!r) return null;
  return (
    <div className="mobile-bar" aria-hidden="true">
      <span>Churn risk <b className="mono">{pct(r.probability)}</b> · {r.tier_label}</span>
      <button type="button" tabIndex={-1} onClick={onJump}>See results</button>
    </div>
  );
}
