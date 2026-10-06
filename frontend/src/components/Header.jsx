import { motion } from "motion/react";

export default function Header({ meta }) {
  const m = meta?.metrics;
  const items = m ? [["ROC-AUC", m["ROC-AUC"].toFixed(3)], ["Recall", `${Math.round(m.Recall * 100)}%`], ["Model", "XGBoost"]] : [];
  return (
    <header className="top">
      <div className="top-inner">
        <div className="brand">
          <svg viewBox="0 0 32 32" className="brand-mark" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#0d1726" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="#5b8def" strokeWidth="2" />
            <circle cx="16" cy="16" r="4" fill="none" stroke="#5b8def" strokeWidth="2" />
            {/* radar sweep */}
            <motion.line x1="16" y1="16" x2="23" y2="9" stroke="#ffb020" strokeWidth="2.4" strokeLinecap="round"
              style={{ originX: "16px", originY: "16px" }} animate={{ rotate: 360 }} transition={{ duration: 4, ease: "linear", repeat: Infinity }} />
          </svg>
          <div>
            <h1>ChurnRadar</h1>
            <p>Customer churn prediction &amp; retention playbook</p>
          </div>
        </div>
        <div className="metrics" aria-label="Model performance on the test set">
          {items.map(([k, v], i) => (
            <motion.span key={k} className="metric" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}>
              {k} <b>{v}</b>
            </motion.span>
          ))}
        </div>
      </div>
    </header>
  );
}
