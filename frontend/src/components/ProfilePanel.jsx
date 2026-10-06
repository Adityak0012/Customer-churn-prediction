import { motion } from "motion/react";
import { Shield, Headphones, CloudUpload, Smartphone, Tv, Film } from "lucide-react";
import { Segmented, Toggle, Slider, Chip } from "./Controls.jsx";
import { SERVICES, PAYMENT_METHODS, PRESETS, inr } from "../profile.js";

const ICONS = { OnlineSecurity: Shield, TechSupport: Headphones, OnlineBackup: CloudUpload, DeviceProtection: Smartphone, StreamingTV: Tv, StreamingMovies: Film };
const yn = (b) => (b ? "Yes" : "No");

function tenureText(m) {
  if (m === 0) return "New this month";
  const y = Math.floor(m / 12), r = m % 12;
  return [y && `${y} yr`, r && `${r} mo`].filter(Boolean).join(" ");
}

export default function ProfilePanel({ profile, activePreset, onChange, onPreset, busy }) {
  const set = (k) => (v) => onChange({ [k]: v });
  const noInternet = profile.InternetService === "No";

  return (
    <motion.aside
      className="panel profile" aria-label="Customer profile"
      initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="profile-head">
        <h2>Customer profile</h2>
        <span className="live" aria-live="polite">
          <motion.span className="live-dot" animate={busy ? { opacity: [1, 0.3, 1] } : { opacity: 1 }} transition={busy ? { duration: 0.9, repeat: Infinity } : {}} />
          {busy ? "Scoring…" : "Live"}
        </span>
      </div>
      <p className="hint">Change anything and the churn score updates instantly.</p>

      <div className="presets" role="group" aria-label="Sample customers">
        {PRESETS.map((p) => (
          <motion.button key={p.id} type="button" className="preset" aria-pressed={activePreset === p.id} whileTap={{ scale: 0.96 }} onClick={() => onPreset(p)}>
            {p.label}
          </motion.button>
        ))}
      </div>

      <section className="group" aria-labelledby="g-account">
        <h3 className="group-title" id="g-account">Account</h3>
        <Slider label="Tenure" value={profile.tenure} min={0} max={72} format={tenureText} ticks={["0", "1y", "2y", "3y", "4y", "5y", "6y"]} onChange={set("tenure")} />
        <Segmented label="Contract" value={profile.Contract} onChange={set("Contract")}
          options={[["Month-to-month", "Monthly"], ["One year", "1 year"], ["Two year", "2 years"]]} />
        <Slider label="Monthly bill" value={profile.MonthlyCharges} min={300} max={3000} step={50} format={inr}
          help="All amounts in ₹ (see note at the bottom of the page)" onChange={set("MonthlyCharges")} />
        <div className="row">
          <label className="row-label" htmlFor="pay">Payment method</label>
          <select id="pay" value={profile.PaymentMethod} onChange={(e) => onChange({ PaymentMethod: e.target.value })}>
            {PAYMENT_METHODS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
          </select>
        </div>
        <div className="toggles">
          <Toggle label="Paperless billing" checked={profile.PaperlessBilling === "Yes"} onChange={(b) => onChange({ PaperlessBilling: yn(b) })} />
        </div>
      </section>

      <section className="group" aria-labelledby="g-services">
        <h3 className="group-title" id="g-services">Services</h3>
        <Segmented label="Internet" value={profile.InternetService} onChange={set("InternetService")}
          options={[["Fiber optic", "Fiber"], ["DSL", "DSL"], ["No", "None"]]} />
        <div className="row">
          <div className="row-label">Add-ons {noInternet && <span className="row-help">Need internet</span>}</div>
          <div className="chips">
            {SERVICES.map(([k, label]) => (
              <Chip key={k} label={label} icon={ICONS[k]} on={!noInternet && profile[k] === "Yes"} disabled={noInternet}
                onToggle={() => onChange({ [k]: profile[k] === "Yes" ? "No" : "Yes" })} />
            ))}
          </div>
        </div>
        <div className="toggles">
          <Toggle label="Phone line" checked={profile.PhoneService === "Yes"} onChange={(b) => onChange({ PhoneService: yn(b), ...(b ? {} : { MultipleLines: "No" }) })} />
          <Toggle label="Multiple lines" checked={profile.MultipleLines === "Yes"} onChange={(b) => onChange({ MultipleLines: yn(b), ...(b ? { PhoneService: "Yes" } : {}) })} />
        </div>
      </section>

      <section className="group" aria-labelledby="g-people">
        <h3 className="group-title" id="g-people">Customer</h3>
        <Segmented label="Gender" value={profile.gender} onChange={set("gender")} options={[["Female", "Female"], ["Male", "Male"]]} />
        <div className="toggles">
          <Toggle label="Senior citizen" checked={profile.SeniorCitizen === "Yes"} onChange={(b) => onChange({ SeniorCitizen: yn(b) })} />
          <Toggle label="Has partner" checked={profile.Partner === "Yes"} onChange={(b) => onChange({ Partner: yn(b) })} />
          <Toggle label="Has dependents" checked={profile.Dependents === "Yes"} onChange={(b) => onChange({ Dependents: yn(b) })} />
        </div>
      </section>
    </motion.aside>
  );
}
