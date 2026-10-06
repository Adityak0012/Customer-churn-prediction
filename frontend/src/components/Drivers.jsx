import { motion } from "motion/react";
import { Activity } from "lucide-react";

const ease = [0.22, 1, 0.36, 1];

export default function Drivers({ drivers }) {
  const max = Math.max(...drivers.map((d) => Math.abs(d.impact)), 0.01);
  return (
    <section className="panel card" aria-labelledby="dr-title">
      <div className="card-head">
        <h2 id="dr-title"><Activity size={17} aria-hidden="true" /> What drives this score</h2>
        <span className="legend" aria-hidden="true">
          <span><i style={{ background: "var(--high-mark)" }} />raises risk</span>
          <span><i style={{ background: "var(--low)" }} />lowers risk</span>
        </span>
      </div>
      <p className="card-note">SHAP values: how far each factor pushed this customer away from the average prediction.</p>
      <ul className="drivers">
        {drivers.map((d) => {
          const up = d.impact > 0;
          return (
            <motion.li key={d.feature} className="driver" layout transition={{ layout: { duration: 0.35, ease } }}>
              <span>{d.feature}</span>
              <span className="track" aria-hidden="true">
                <motion.span className={`bar ${up ? "up" : "down"}`} initial={{ scaleX: 0 }} animate={{ scaleX: Math.abs(d.impact) / max }} transition={{ duration: 0.5, ease }} />
              </span>
              <span className="impact">
                <span className="sr-only">{up ? "raises risk by" : "lowers risk by"} </span>{up ? "+" : "−"}{Math.abs(d.impact).toFixed(2)}
              </span>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
