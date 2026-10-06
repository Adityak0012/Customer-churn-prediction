import { useEffect } from "react";
import { motion, AnimatePresence, animate, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import { Loader2, ShieldCheck, Eye, AlertOctagon } from "lucide-react";
import { pct } from "../profile.js";

const COLOR = { low: "var(--low)", medium: "var(--medium-mark)", high: "var(--high-mark)" };
const ICON = { low: ShieldCheck, medium: Eye, high: AlertOctagon };
const NOTE = {
  low: "This customer looks settled. Keep the relationship warm; no urgent action needed.",
  medium: "Some warning signs. A light-touch offer now is cheaper than winning them back later.",
  high: "Strong churn signals. Contact this customer first; the playbook below shows what helps most.",
};
const ease = [0.22, 1, 0.36, 1];
const R = 70, C = 2 * Math.PI * R;

export default function RiskCard({ r, busy }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, pct);
  useEffect(() => {
    const c = animate(mv, r.probability, reduce ? { duration: 0 } : { duration: 0.7, ease });
    return () => c.stop();
  }, [r.probability, reduce, mv]);
  const Icon = ICON[r.tier];

  return (
    <section className="panel risk" aria-live="polite">
      <AnimatePresence>
        {busy && (
          <motion.span className="updating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Loader2 size={13} className="spin" aria-hidden="true" /> Updating
          </motion.span>
        )}
      </AnimatePresence>
      <div className="ring-wrap">
        <svg viewBox="0 0 168 168" className="ring" role="img" aria-label={`Churn probability ${pct(r.probability)}`}>
          <circle cx="84" cy="84" r={R} fill="none" stroke="var(--surface-2)" strokeWidth="14" />
          <motion.circle
            cx="84" cy="84" r={R} fill="none" strokeWidth="14" strokeLinecap="round" strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - Math.max(r.probability, 0.005)), stroke: COLOR[r.tier] }}
            transition={{ strokeDashoffset: { duration: 0.7, ease }, stroke: { duration: 0.3 } }}
          />
        </svg>
        <div className="ring-center" aria-hidden="true">
          <motion.span className="ring-value">{text}</motion.span>
          <span className="ring-caption">chance of churning</span>
        </div>
      </div>
      <div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={r.tier} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <span className={`tier-pill ${r.tier}`}><Icon size={13} aria-hidden="true" /> {r.tier_label}</span>
            <h3>{r.headline}</h3>
            <p>{NOTE[r.tier]}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
