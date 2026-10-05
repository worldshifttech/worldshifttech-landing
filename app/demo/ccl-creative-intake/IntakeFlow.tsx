"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./intake.module.css";
import { FieldInput, Globe, Icon, LevelCard, SectionIntro } from "./parts";
import {
  BASICS,
  CHAPTERS,
  LEVELS,
  LEVEL_PROMPT,
  LEVEL_RULES,
  MARKETING_CODES,
  REVIEW_NOTES,
  TURNAROUND_NOTE,
  WELCOME_COPY,
  WELCOME_HELP,
  asList,
  asText,
  displayValue,
  errorFor,
  isMarketingGroup,
  isVisible,
  type FormValues,
  type LevelId,
  type Section,
} from "./spec";

const CONTACT_EMAIL = "drew@worldshifttech.com";

const HOW_IT_WORKS = [
  {
    title: "Tell us the basics",
    body: "Your name, the project, and a group code. The group code decides which workflow your request follows.",
  },
  {
    title: "Pick a workflow level",
    body: "Efficient execution, guided creative support, or a strategic partnership. Each card explains when to choose it.",
  },
  {
    title: "Answer only what applies",
    body: "One page for Level 1, three chapters for Level 2, four for Level 3. Follow-up questions appear only when they are relevant.",
  },
];

function Header() {
  return (
    <>
      <div className={styles.demoBar}>
        <strong>Demonstration</strong>
        Working prototype. Nothing you enter is saved or sent.
      </div>
      <header className={styles.top}>
        <Link href="/" aria-label="World Shift Technologies home" className={styles.logoLink}>
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
            alt="World Shift Technologies"
            width={1773}
            height={435}
            className={styles.logo}
            priority
          />
        </Link>
        <span className={styles.badge}>CCL Creative Studio &middot; Creative Intake</span>
      </header>
    </>
  );
}

function Footer() {
  return (
    <footer className={styles.foot}>
      <span>Built by World Shift Technologies &middot; Fractional Business Companion</span>
      <span>{CONTACT_EMAIL} &middot; worldshifttech.com</span>
    </footer>
  );
}

export default function IntakeFlow() {
  const [values, setValues] = useState<FormValues>({});
  const [level, setLevel] = useState<LevelId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const set = (id: string, value: string | boolean) => setValues((v) => ({ ...v, [id]: value }));
  const toggle = (id: string, option: string) =>
    setValues((v) => {
      const current = asList(v[id]);
      return { ...v, [id]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });

  const group = asText(values.group);
  const marketing = isMarketingGroup(group);
  const chapters: Section[] = level ? CHAPTERS[level] : [];

  // welcome > basics > (level > chapters > review) for Marketing codes, or welcome > basics > bau
  const steps = useMemo(
    () => ["welcome", "basics", ...(group && !marketing ? ["bau"] : ["level", ...chapters.map((c) => c.id), "review"])],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [group, marketing, level],
  );
  const stepId = steps[Math.min(stepIndex, steps.length - 1)];
  const section = stepId === "basics" ? BASICS : chapters.find((c) => c.id === stepId);
  const fields = section ? section.fields.filter((f) => isVisible(f, values)) : [];
  const errors = Object.fromEntries(
    fields.map((f) => [f.id, errorFor(f, values)] as const).filter(([, e]) => e),
  ) as Record<string, string>;
  const blocked = stepId === "level" ? !level : Object.keys(errors).length > 0;
  const levelInfo = LEVELS.find((l) => l.id === level);

  useEffect(() => {
    window.scrollTo(0, 0);
    rootRef.current?.focus({ preventScroll: true });
  }, [stepId, submitted]);

  const next = () => {
    if (blocked) {
      setShowErrors(true);
      requestAnimationFrame(() =>
        document.querySelector("[data-invalid]")?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      return;
    }
    setShowErrors(false);
    if (stepId === "review") {
      setSubmitted(true);
      return;
    }
    setStepIndex(stepIndex + 1);
  };

  const back = () => {
    setShowErrors(false);
    setStepIndex(Math.max(0, stepIndex - 1));
  };

  const restart = () => {
    setValues({});
    setLevel(null);
    setStepIndex(0);
    setShowErrors(false);
    setSubmitted(false);
  };

  const editSection = (id: string) => {
    const i = steps.indexOf(id);
    if (i >= 0) setStepIndex(i);
  };

  // What would be written to ClickUp: one row per answered field, labelled with its ClickUp field.
  const payload = (): [string, string][] => {
    const rows: [string, string][] = [
      ["Task name", asText(values.request)],
      ["Requester Name", asText(values.name)],
      ["Requester Email", asText(values.email)],
      ["Group Code", group],
      ["Project ID", asText(values.project)],
      ["Workflow Level", levelInfo?.value ?? ""],
    ];
    chapters.forEach((c) =>
      c.fields.filter((f) => isVisible(f, values)).forEach((f) => rows.push([f.cu, displayValue(f, values)])),
    );
    return rows.filter(([, v]) => v);
  };

  // ---- Submitted ----------------------------------------------------------------------------
  if (submitted) {
    const rows = payload();
    return (
      <div className={styles.app} ref={rootRef} tabIndex={-1}>
        <Header />
        <main className={`${styles.wrap} ${styles.success}`}>
          <div className={styles.okMark}>
            <Icon name="check" size={26} />
          </div>
          <span className={styles.kicker}>Request received</span>
          <h1>
            Thanks, {asText(values.name).split(" ")[0] || "there"}.
            <br />
            <span className={styles.teal}>Creative Studio has it from here.</span>
          </h1>
          <p className={styles.lead}>{TURNAROUND_NOTE}</p>
          <div className={styles.summary} data-testid="payload">
            <div className={styles.sumHead}>
              <span>Submission preview</span>
              <span>
                {rows.length} values &rarr; ClickUp &middot; {levelInfo?.value}
              </span>
            </div>
            {rows.map(([label, value], i) => (
              <div key={label + i} className={styles.sumRow}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
          <button type="button" className={`${styles.pill} ${styles.outline}`} onClick={restart}>
            Submit another request
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // ---- Wizard -------------------------------------------------------------------------------
  const progressSteps = steps.slice(1);
  const progressIndex = Math.max(0, progressSteps.indexOf(stepId));

  return (
    <div className={styles.app} ref={rootRef} tabIndex={-1}>
      <Header />
      <main className={styles.wrap}>
        {stepId === "welcome" ? (
          <section className={styles.hero}>
            <Globe />
            <span className={styles.kicker}>Center for Creative Leadership &middot; Creative Studio</span>
            <h1>
              Creative Intake
              <br />
              <span className={styles.teal}>for Marketing requests.</span>
            </h1>
            <p className={styles.lead}>{WELCOME_COPY}</p>
            <p className={styles.helpLine}>
              {WELCOME_HELP.lead}{" "}
              <span className={styles.fakeLink} title="SharePoint guide link to be added">
                {WELCOME_HELP.link}
              </span>
            </p>
            <button type="button" className={`${styles.pill} ${styles.big}`} onClick={next} data-testid="start">
              Get started <Icon name="arrowRight" size={17} />
            </button>

            <ol className={styles.how}>
              {HOW_IT_WORKS.map((item, i) => (
                <li key={item.title}>
                  <i>{i + 1}</i>
                  <b>{item.title}</b>
                  {item.body}
                </li>
              ))}
            </ol>
            <p className={styles.howNote}>
              Every answer maps to a ClickUp field. At the end you will see exactly what would be created.
            </p>
          </section>
        ) : (
          <>
            <div className={styles.progress} aria-label="Progress">
              <div className={styles.bar}>
                <i style={{ width: `${((progressIndex + 1) / progressSteps.length) * 100}%` }} />
              </div>
              <span>
                {levelInfo
                  ? `${levelInfo.value} · Step ${progressIndex + 1} of ${progressSteps.length}`
                  : stepId === "bau"
                    ? "Standard intake"
                    : `Step ${progressIndex + 1} · Getting started`}
              </span>
            </div>

            {section && <SectionIntro section={section} />}
            {section &&
              fields.map((f) => (
                <FieldInput
                  key={f.id}
                  field={f}
                  values={values}
                  set={set}
                  toggle={toggle}
                  error={showErrors ? (errors[f.id] ?? null) : null}
                />
              ))}

            {stepId === "basics" && group && (
              <p className={`${styles.route} ${marketing ? styles.mk : ""}`} data-testid="route">
                {marketing
                  ? "Marketing group code: you'll choose a workflow level next."
                  : "This group code follows the standard Creative Studio intake."}
              </p>
            )}

            {stepId === "bau" && (
              <div className={styles.secHead} data-testid="bau">
                <span className={styles.kicker}>Standard intake</span>
                <h2>This request follows the standard Creative Studio intake.</h2>
                <p className={styles.lead}>
                  The Marketing workflow levels apply to group codes {MARKETING_CODES.join(", ")}. Requests under {group}{" "}
                  continue through the existing intake flow.
                </p>
                <p className={styles.callout}>In the live build, this step hands off to the existing BAU intake form.</p>
              </div>
            )}

            {stepId === "level" && (
              <>
                <div className={styles.secHead}>
                  <span className={styles.kicker}>Workflow level</span>
                  <h2>{LEVEL_PROMPT}</h2>
                </div>
                <div className={styles.cards}>
                  {LEVELS.map((l) => (
                    <LevelCard key={l.id} level={l} chosen={level === l.id} onChoose={() => setLevel(l.id)} />
                  ))}
                </div>
                {showErrors && !level && (
                  <p className={`${styles.err} ${styles.levelError}`} role="alert" data-invalid="true">
                    Select a workflow level to continue.
                  </p>
                )}
                <div className={styles.rule}>
                  {LEVEL_RULES.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </>
            )}

            {stepId === "review" && levelInfo && level && (
              <>
                <div className={styles.secHead}>
                  <span className={styles.kicker}>{levelInfo.title}</span>
                  <h2>Review and submit.</h2>
                  {REVIEW_NOTES[level].map((p) => (
                    <p key={p} className={styles.lead}>
                      {p}
                    </p>
                  ))}
                </div>
                <div className={styles.rule}>
                  <p>
                    <strong>Turnaround.</strong> {TURNAROUND_NOTE}
                  </p>
                  {LEVEL_RULES.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
                <div className={styles.summary}>
                  <div className={styles.sumHead}>
                    <span>Your answers</span>
                    <span>{levelInfo.value}</span>
                  </div>
                  {[BASICS, ...chapters].map((s) => (
                    <div key={s.id} className={styles.sumGroup}>
                      <div className={styles.sumGroupHead}>
                        <span>{s.kicker}</span>
                        <button type="button" className={styles.linkBtn} onClick={() => editSection(s.id)}>
                          Edit
                        </button>
                      </div>
                      {s.fields
                        .filter((f) => isVisible(f, values))
                        .map((f) => (
                          <div key={f.id} className={styles.sumRow}>
                            <span>{f.label}</span>
                            <strong>{displayValue(f, values) || "Not provided"}</strong>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className={styles.nav}>
              <button type="button" className={styles.ghostBtn} onClick={back}>
                <Icon name="arrowLeft" size={15} /> Back
              </button>
              {stepId !== "bau" ? (
                <button type="button" className={styles.pill} onClick={next} data-testid="next">
                  {stepId === "review" ? "Submit request" : "Continue"} <Icon name="arrowRight" size={16} />
                </button>
              ) : (
                <button type="button" className={`${styles.pill} ${styles.outline}`} onClick={restart}>
                  Start over
                </button>
              )}
            </div>
            {showErrors && blocked && stepId !== "level" && (
              <p className={`${styles.err} ${styles.center}`} role="alert">
                Complete the highlighted fields to continue.
              </p>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
