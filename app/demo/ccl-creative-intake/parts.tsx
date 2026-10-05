"use client";

import { useState } from "react";
import styles from "./intake.module.css";
import {
  FOLDER_GUIDE,
  GROUP_CODES,
  MARKETING_CODES,
  asList,
  asText,
  codeOf,
  needsSpecify,
  otherKey,
  type Field,
  type FormValues,
  type Level,
  type Section,
} from "./spec";

// Inline icons (stroke style) so the demo needs no icon dependency.
const ICONS = {
  arrowLeft: ["m12 19-7-7 7-7", "M19 12H5"],
  arrowRight: ["M5 12h14", "m12 5 7 7-7 7"],
  check: ["M20 6 9 17l-5-5"],
  chevronDown: ["m6 9 6 6 6-6"],
  folderOpen: [
    "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
  ],
  info: ["M12 16v-4", "M12 8h.01"],
  rotateCcw: ["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", "M3 3v5h5"],
} as const;

export function Icon({ name, size = 16, className }: { name: keyof typeof ICONS; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === "info" && <circle cx="12" cy="12" r="10" />}
      {ICONS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function Globe() {
  return (
    <svg viewBox="0 0 40 40" className={styles.globe} aria-hidden="true">
      <circle cx="20" cy="20" r="17" />
      <ellipse cx="20" cy="20" rx="7.5" ry="17" />
      <path d="M3 20h34M6 11h28M6 29h28" />
    </svg>
  );
}

// ---------------------------------------------------------------------------------------------

export function FolderGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.folderBox}>
      <button type="button" className={styles.folderToggle} onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name="folderOpen" size={17} /> {FOLDER_GUIDE.title}{" "}
        <Icon name="chevronDown" size={16} className={open ? styles.flipUp : ""} />
      </button>
      {open && (
        <div className={styles.folderBody}>
          <p className={styles.folderName}>{FOLDER_GUIDE.name}</p>
          <ul>
            {FOLDER_GUIDE.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{FOLDER_GUIDE.body}</p>
        </div>
      )}
    </div>
  );
}

export function SectionIntro({ section }: { section: Section }) {
  return (
    <div className={styles.secHead}>
      <span className={styles.kicker}>{section.kicker}</span>
      <h2>{section.title}</h2>
      {section.intro.map((p) => (
        <p key={p} className={styles.lead}>
          {p}
        </p>
      ))}
      {section.guidance && (
        <div className={styles.guide}>
          <span className={styles.guideTitle}>
            <Icon name="info" size={15} /> Before you answer
          </span>
          <dl>
            {section.guidance.map(([term, def]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {section.note && <p className={styles.callout}>{section.note}</p>}
      {section.folder && <FolderGuide />}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

function GroupPicker({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const [showAll, setShowAll] = useState(false);
  return (
    <>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Please select</option>
        {GROUP_CODES.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>
      <button type="button" className={styles.linkBtn} onClick={() => setShowAll(!showAll)}>
        {showAll ? "Hide" : "View"} existing Group Codes ({GROUP_CODES.length})
      </button>
      {showAll && (
        <div className={styles.codeList}>
          {GROUP_CODES.map((g) => (
            <span key={g} className={MARKETING_CODES.includes(codeOf(g)) ? styles.mk : ""}>
              {g}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

interface FieldProps {
  field: Field;
  values: FormValues;
  set: (id: string, value: string | boolean) => void;
  toggle: (id: string, option: string) => void;
  error: string | null;
}

export function FieldInput({ field, values, set, toggle, error }: FieldProps) {
  const inputId = `f-${field.id}`;
  const labelId = `${inputId}-l`;
  const text = asText(values[field.id]);
  const picked = asList(values[field.id]);

  let control: React.ReactNode = null;

  if (field.type === "text" || field.type === "email" || field.type === "url") {
    control = (
      <input
        id={inputId}
        type={field.type}
        value={text}
        onChange={(e) => set(field.id, e.target.value)}
        placeholder={field.type === "url" ? "https://" : ""}
      />
    );
  } else if (field.type === "textarea") {
    control = <textarea id={inputId} rows={4} value={text} onChange={(e) => set(field.id, e.target.value)} />;
  } else if (field.type === "date") {
    control = <input id={inputId} type="date" value={text} onChange={(e) => set(field.id, e.target.value)} />;
  } else if (field.type === "group") {
    control = <GroupPicker id={inputId} value={text} onChange={(v) => set(field.id, v)} />;
  } else if (field.type === "radio") {
    control = (
      <div className={styles.opts} role="radiogroup" aria-labelledby={labelId}>
        {field.options?.map((opt) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={text === opt}
            className={`${styles.opt} ${text === opt ? styles.on : ""}`}
            onClick={() => set(field.id, opt)}
          >
            <span className={styles.dot} />
            {opt}
          </button>
        ))}
      </div>
    );
  } else if (field.type === "multi") {
    control = (
      <>
        <div className={styles.opts}>
          {field.options?.map((opt) => {
            const on = picked.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                aria-pressed={on}
                className={`${styles.opt} ${styles.chip} ${on ? styles.on : ""}`}
                onClick={() => toggle(field.id, opt)}
              >
                <span className={styles.box}>{on && <Icon name="check" size={12} />}</span>
                {opt}
              </button>
            );
          })}
        </div>
        {picked.some(needsSpecify) && (
          <input
            className={styles.specify}
            aria-label="Please specify"
            placeholder="Please specify"
            value={asText(values[otherKey(field.id)])}
            onChange={(e) => set(otherKey(field.id), e.target.value)}
          />
        )}
      </>
    );
  } else if (field.type === "checkbox") {
    const on = !!values[field.id];
    control = (
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        className={`${styles.check} ${on ? styles.on : ""}`}
        onClick={() => set(field.id, !on)}
      >
        <span className={styles.box}>{on && <Icon name="check" size={13} />}</span>
        <span>{field.text}</span>
      </button>
    );
  }

  return (
    <div className={styles.field} data-invalid={error ? "true" : undefined}>
      <label id={labelId} htmlFor={inputId}>
        {field.label}
        {field.optional ? <em>Optional</em> : <b aria-hidden="true">*</b>}
      </label>
      {field.help && <p className={styles.help}>{field.help}</p>}
      {control}
      {field.note && <p className={styles.note}>{field.note}</p>}
      {error && (
        <p className={styles.err} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

export function LevelCard({ level, chosen, onChoose }: { level: Level; chosen: boolean; onChoose: () => void }) {
  const [flipped, setFlipped] = useState(false);

  const choose = (
    <button type="button" className={styles.pill} onClick={onChoose} data-testid={`choose-${level.id}`}>
      {chosen ? (
        <>
          <Icon name="check" size={15} /> Selected
        </>
      ) : (
        <>Choose {level.value}</>
      )}
    </button>
  );

  return (
    <div className={`${styles.flip} ${flipped ? styles.isFlipped : ""} ${chosen ? styles.isChosen : ""}`}>
      <div className={styles.flipInner}>
        <div className={`${styles.face} ${styles.front}`} inert={flipped}>
          <span className={styles.lvl}>{level.title}</span>
          <h3>{level.tag}</h3>
          <p>{level.desc}</p>
          <span className={styles.timing}>{level.timing}</span>
          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setFlipped(true)}
              aria-label={`When to choose ${level.value}`}
            >
              <Icon name="rotateCcw" size={14} /> When to choose
            </button>
            {choose}
          </div>
        </div>
        <div className={`${styles.face} ${styles.back}`} inert={!flipped}>
          <span className={styles.lvl}>CHOOSE {level.value.toUpperCase()} WHEN:</span>
          <ul>
            {level.when.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <div className={styles.cardActions}>
            <button type="button" className={styles.ghostBtn} onClick={() => setFlipped(false)}>
              <Icon name="rotateCcw" size={14} /> Back
            </button>
            {choose}
          </div>
        </div>
      </div>
    </div>
  );
}
