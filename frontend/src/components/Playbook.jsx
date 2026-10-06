import { motion, AnimatePresence } from "motion/react";
import { Sparkles, PartyPopper } from "lucide-react";
import { pct } from "../profile.js";

const ease = [0.22, 1, 0.36, 1];

export default function Playbook({ r, onApply }) {
  return (
    <section className="panel card" aria-labelledby="pb-title">
      <div className="card-head">
        <h2 id="pb-title"><Sparkles size={17} aria-hidden="true" /> Retention playbook</h2>
      </div>
      <p className="card-note">The model re-scores this customer with each change. These are model-based estimates, not guaranteed outcomes.</p>

      {r.actions.length === 0 ? (
        <motion.div className="empty-actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PartyPopper size={20} aria-hidden="true" /> No action needed. None of the standard offers would lower this customer's risk meaningfully.
        </motion.div>
      ) : (
        <ul className="actions">
          <AnimatePresence initial={false} mode="popLayout">
            {r.actions.map((a, i) => (
              <motion.li
                key={a.id} className="action" layout
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3, ease } }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
              >
                <div>
                  <div className="action-title">{a.title}</div>
                  <div className="action-detail">{a.detail}</div>
                </div>
                <div className="delta" aria-label={`Churn risk from ${pct(r.probability)} to ${pct(a.new_probability)}`}>
                  <div className="delta-nums"><span>{pct(r.probability)} → <b>{pct(a.new_probability)}</b></span><span>−{a.reduction_pp} pts</span></div>
                  <div className="delta-bar" aria-hidden="true">
                    <span className="before" style={{ width: `${r.probability * 100}%` }} />
                    <motion.span className="after" style={{ width: `${r.probability * 100}%` }}
                      initial={false} animate={{ scaleX: r.probability ? a.new_probability / r.probability : 0 }} transition={{ duration: 0.6, ease }} />
                  </div>
                </div>
                <motion.button type="button" className="apply" whileTap={{ scale: 0.95 }} onClick={() => onApply(a)}>
                  Apply
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
