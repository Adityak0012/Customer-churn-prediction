import { motion } from "motion/react";
import { IndianRupee, Receipt, Users } from "lucide-react";
import { inr } from "../profile.js";

export default function Kpis({ r }) {
  const rel = r.probability / r.churn_rate;
  const relText = rel > 1.1 ? `${rel.toFixed(1)}× higher` : rel < 0.9 ? `${(1 / rel).toFixed(1)}× lower` : "≈ Average";
  const items = [
    { icon: IndianRupee, label: "Revenue at risk / year", value: inr(r.revenue_at_risk), sub: "monthly bill × 12 × churn chance" },
    { icon: Receipt, label: "Monthly bill", value: inr(r.monthly_revenue), sub: `${inr(r.monthly_revenue * 12)} per year` },
    { icon: Users, label: "vs. average customer", value: relText, sub: `average churn rate ${(r.churn_rate * 100).toFixed(1)}%` },
  ];
  return (
    <div className="kpis">
      {items.map(({ icon: Icon, label, value, sub }, i) => (
        <motion.div key={label} className="panel kpi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.35 }}>
          <small><Icon size={13} aria-hidden="true" /> {label}</small>
          <strong>{value}</strong>
          <span className="sub">{sub}</span>
        </motion.div>
      ))}
    </div>
  );
}
