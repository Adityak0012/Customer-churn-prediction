import { useId } from "react";
import { motion } from "motion/react";

const spring = { type: "spring", stiffness: 500, damping: 35 };

/** Segmented control, built as an accessible radio group with a sliding highlight. */
export function Segmented({ label, value, options, onChange }) {
  const id = useId();
  const idx = options.findIndex(([v]) => v === value);
  const onKey = (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const next = (idx + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length;
    onChange(options[next][0]);
    e.currentTarget.parentElement.children[next]?.focus();
  };
  return (
    <div className="row">
      <div className="row-label" id={id}>{label}</div>
      <div className="seg" role="radiogroup" aria-labelledby={id}>
        {options.map(([v, text]) => {
          const on = v === value;
          return (
            <button key={v} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1} onClick={() => onChange(v)} onKeyDown={onKey}>
              {on && <motion.span layoutId={`thumb-${id}`} className="seg-thumb" transition={spring} />}
              {text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** On/off switch with a spring-animated knob. */
export function Toggle({ label, checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} className="switch" onClick={() => onChange(!checked)}>
      <span>{label}</span>
      <span className="switch-track" aria-hidden="true">
        <motion.span layout className="switch-knob" transition={spring} />
      </span>
    </button>
  );
}

/** Labelled range slider with a filled track. */
export function Slider({ label, value, min, max, step = 1, format, ticks, help, onChange }) {
  const id = useId();
  const fill = `${((value - min) / (max - min)) * 100}%`;
  return (
    <div className="row">
      <div className="row-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        id={id} type="range" min={min} max={max} step={step} value={value} style={{ "--fill": fill }}
        aria-valuetext={format(value)} onChange={(e) => onChange(Number(e.target.value))}
      />
      {ticks && <div className="ticks" aria-hidden="true">{ticks.map((t) => <span key={t}>{t}</span>)}</div>}
      {help && <div className="row-help">{help}</div>}
    </div>
  );
}

/** Toggleable add-on chip. */
export function Chip({ label, on, disabled, onToggle, icon: Icon }) {
  return (
    <motion.button type="button" className="chip" aria-pressed={on} disabled={disabled} onClick={onToggle} whileTap={disabled ? undefined : { scale: 0.95 }}>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {label}
    </motion.button>
  );
}
