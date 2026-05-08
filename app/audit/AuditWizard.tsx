"use client";

import { useState, useEffect, useRef } from "react";
import AuthModal from "./AuthModal";
import { getSupabaseBrowser } from "@/lib/supabase";

// â”€â”€â”€ Department â†’ tool mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const DEPT_TOOLS: Record<string, string[]> = {
  "Operations": [
    "ClickUp", "Asana", "Monday.com", "Notion", "Airtable", "Trello",
    "Smartsheet", "Basecamp", "Zapier", "Make", "n8n",
    "Google Drive", "Dropbox", "Microsoft 365",
  ],
  "Sales": [
    "HubSpot", "Salesforce", "Pipedrive", "Close.com", "Zoho CRM",
    "Slack", "Zoom", "Google Meet", "Calendly", "LinkedIn Sales Navigator",
  ],
  "Marketing": [
    "HubSpot", "Mailchimp", "ActiveCampaign", "Klaviyo", "ConvertKit",
    "Beehiiv", "Buffer", "Hootsuite", "Later",
    "Canva", "Google Analytics", "Semrush", "Jasper", "Copy.ai",
  ],
  "Customer Support": [
    "Intercom", "Zendesk", "Freshdesk", "Crisp",
    "HubSpot", "Slack", "Zoom", "WhatsApp Business",
  ],
  "Finance and Accounting": [
    "QuickBooks", "Xero", "FreshBooks", "Wave", "Stripe",
    "Gusto", "Rippling", "Bill.com", "Expensify",
  ],
  "HR and People": [
    "Gusto", "Rippling", "BambooHR", "Lattice",
    "Notion", "Google Workspace", "Slack", "Zoom",
  ],
  "Product or Development": [
    "GitHub", "Vercel", "Supabase", "AWS", "Heroku", "Netlify",
    "Notion", "Linear", "Jira", "Figma",
    "Slack", "Claude", "Claude Code", "GitHub Copilot", "Cursor",
  ],
  "Creative and Design": [
    "Figma", "Canva", "Adobe Creative Cloud", "Midjourney", "DALL-E",
    "Loom", "Frame.io",
  ],
  "Legal and Compliance": [
    "DocuSign", "PandaDoc", "Clio", "Notion", "Google Drive", "Microsoft 365",
  ],
  "Executive or Leadership": [
    "Slack", "Zoom", "Google Workspace", "Microsoft 365", "Notion",
    "Loom", "Fireflies.ai", "Otter.ai", "Fathom",
  ],
};

const BUSINESS_TYPES = [
  "Agency or consultancy",
  "Professional services (legal, accounting, HR, finance)",
  "E-commerce or retail",
  "SaaS or software company",
  "Healthcare or wellness",
  "Nonprofit or social enterprise",
  "Solo operator or freelancer",
  "Other",
];

const TEAM_SIZES = [
  "Just me",
  "2 to 5 people",
  "6 to 15 people",
  "16 to 50 people",
  "50 or more",
];

const DEPARTMENTS = [
  "Operations",
  "Sales",
  "Marketing",
  "Customer Support",
  "Finance and Accounting",
  "HR and People",
  "Product or Development",
  "Creative and Design",
  "Legal and Compliance",
  "Executive or Leadership",
];

const SPEND_RANGES = [
  "Under $500",
  "$500 to $1,500",
  "$1,500 to $3,000",
  "$3,000 to $7,500",
  "$7,500 to $15,000",
  "Over $15,000",
];

const PHASES = [
  "About Your Business",
  "Your Departments",
  "Your Tools",
  "AI and Spend",
  "Your Report",
];

const LOADING_LINES = [
  "Mapping your tools against the registry...",
  "Identifying overlap and redundancy...",
  "Calculating waste and environmental impact...",
];

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface Finding {
  tool: string;
  department: string;
  issue: string;
  impact: "low" | "medium" | "high";
  recommendation: string;
}

interface AuditReport {
  headline: string;
  waste_score: "low" | "medium" | "high" | "critical";
  estimated_monthly_waste_low: number;
  estimated_monthly_waste_high: number;
  estimated_hours_wasted_per_month: number;
  summary: string;
  findings: Finding[];
  quick_wins: string[];
  environmental_note: string;
  redirect_estimate_usd: number;
}

// â”€â”€â”€ Style helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const WASTE_COLORS: Record<string, string> = {
  low: "#4ade80",
  medium: "#facc15",
  high: "#fb923c",
  critical: "#f87171",
};

const IMPACT_COLORS: Record<string, string> = {
  low: "#4ade80",
  medium: "#facc15",
  high: "#fb923c",
};

function pill(selected: boolean): React.CSSProperties {
  return {
    padding: "0.6rem 1.1rem",
    borderRadius: 99,
    border: selected ? "1.5px solid var(--color-teal)" : "1.5px solid rgba(255,255,255,0.12)",
    background: selected ? "rgba(75,133,142,0.18)" : "transparent",
    color: selected ? "var(--color-offwhite)" : "var(--color-gray)",
    fontFamily: "var(--font-dm-sans)",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap" as const,
  };
}

function checkbox(checked: boolean): React.CSSProperties {
  return {
    padding: "0.5rem 0.875rem",
    borderRadius: 8,
    border: checked ? "1.5px solid var(--color-teal)" : "1.5px solid rgba(255,255,255,0.10)",
    background: checked ? "rgba(75,133,142,0.15)" : "transparent",
    color: checked ? "var(--color-offwhite)" : "var(--color-gray)",
    fontFamily: "var(--font-dm-sans)",
    fontSize: "0.825rem",
    cursor: "pointer",
    transition: "all 0.15s ease",
    textAlign: "left" as const,
  };
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  background: "var(--color-dark)",
  border: "1.5px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "var(--color-offwhite)",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const ctaButton: React.CSSProperties = {
  width: "100%",
  padding: "0.9rem 1.25rem",
  background: "var(--color-teal)",
  border: "none",
  borderRadius: 8,
  color: "var(--color-dark)",
  fontFamily: "var(--font-dm-sans)",
  fontSize: "0.975rem",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background 0.15s ease",
};

const ctaDisabled: React.CSSProperties = {
  ...ctaButton,
  background: "rgba(75,133,142,0.3)",
  color: "var(--color-gray)",
  cursor: "not-allowed",
};

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AuditWizard() {
  const [phase, setPhase] = useState(1);

  // Phase 1
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [showTeamSize, setShowTeamSize] = useState(false);

  // Phase 2
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);

  // Phase 3
  const [deptIndex, setDeptIndex] = useState(0);
  const [toolsByDept, setToolsByDept] = useState<Record<string, string[]>>({});
  const [additionalByDept, setAdditionalByDept] = useState<Record<string, string>>({});

  // Phase 4
  const [aiUsage, setAiUsage] = useState<Record<string, boolean>>({});
  const [monthlySpend, setMonthlySpend] = useState("");

  // Phase 5
  const [auditId, setAuditId] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [apiDone, setApiDone] = useState(false);
  const [barDone, setBarDone] = useState(false);
  const [apiError, setApiError] = useState("");
  const [loadingLineIndex, setLoadingLineIndex] = useState(0);

  // Auth modal / save state
  const [showAuth, setShowAuth] = useState(false);
  const [reportSaved, setReportSaved] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Derived
  const allSelectedTools = [...new Set(Object.values(toolsByDept).flat())];
  const showReport = barDone && apiDone && !apiError;
  const currentDept = selectedDepts[deptIndex];

  // Phase 5: animate progress bar (3s), then cycle loading lines
  useEffect(() => {
    if (phase !== 5) return;
    const barTimer = setTimeout(() => setBarDone(true), 3000);
    const lineTimer = setInterval(
      () => setLoadingLineIndex((i) => (i + 1) % LOADING_LINES.length),
      2000
    );
    return () => {
      clearTimeout(barTimer);
      clearInterval(lineTimer);
    };
  }, [phase]);

  // Scroll report into view once revealed
  useEffect(() => {
    if (showReport && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showReport]);

  // â”€â”€ Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  function handleBusinessTypeSelect(type: string) {
    setBusinessType(type);
    setShowTeamSize(true);
  }

  function handleTeamSizeSelect(size: string) {
    setTeamSize(size);
    setPhase(2);
  }

  function toggleDept(dept: string) {
    setSelectedDepts((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  }

  function toggleTool(dept: string, tool: string) {
    setToolsByDept((prev) => {
      const current = prev[dept] ?? [];
      const updated = current.includes(tool)
        ? current.filter((t) => t !== tool)
        : [...current, tool];
      return { ...prev, [dept]: updated };
    });
  }

  function handleNextDept() {
    // Parse additional tools and merge into dept list
    const raw = additionalByDept[currentDept] ?? "";
    if (raw.trim()) {
      const extras = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      setToolsByDept((prev) => {
        const current = prev[currentDept] ?? [];
        const merged = [...new Set([...current, ...extras])];
        return { ...prev, [currentDept]: merged };
      });
    }

    if (deptIndex < selectedDepts.length - 1) {
      setDeptIndex((i) => i + 1);
    } else {
      // Initialize AI usage toggles from all selected tools
      const allTools = [...new Set(Object.values(toolsByDept).flat())];
      const initialAi: Record<string, boolean> = {};
      allTools.forEach((t) => (initialAi[t] = false));
      setAiUsage(initialAi);
      setPhase(4);
    }
  }

  function toggleAi(tool: string) {
    setAiUsage((prev) => ({ ...prev, [tool]: !prev[tool] }));
  }

  async function handleGenerateAudit() {
    if (!monthlySpend) return;
    setPhase(5);
    setApiDone(false);
    setBarDone(false);
    setApiError("");

    // Build merged tools by department (checkbox + additional)
    const mergedTools: Record<string, string[]> = {};
    for (const dept of selectedDepts) {
      const raw = additionalByDept[dept] ?? "";
      const extras = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      mergedTools[dept] = [...new Set([...(toolsByDept[dept] ?? []), ...extras])];
    }

    const allAdditional = Object.values(additionalByDept)
      .filter(Boolean)
      .join(", ");

    // Insert to Supabase (if configured)
    let currentAuditId = "";
    if (
      typeof window !== "undefined" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      try {
        const supabase = getSupabaseBrowser();
        const { data } = await supabase
          .from("audit_estimates")
          .insert({
            guest: true,
            user_id: null,
            business_name: businessName,
            business_type: businessType,
            team_size: teamSize,
            departments: selectedDepts,
            tools_by_department: mergedTools,
            ai_usage: aiUsage,
            monthly_spend_range: monthlySpend,
            status: "pending",
          })
          .select("id")
          .single();
        if (data?.id) currentAuditId = data.id;
      } catch {
        // Non-fatal â€” continue without DB row
      }
    }

    setAuditId(currentAuditId);

    // Call Claude
    try {
      const res = await fetch("/api/generate-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: currentAuditId,
          answers: {
            business_name: businessName,
            business_type: businessType,
            team_size: teamSize,
            departments: selectedDepts,
            tools_by_department: mergedTools,
            ai_usage: aiUsage,
            monthly_spend_range: monthlySpend,
            additional_tools: allAdditional,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setApiError(err.error ?? "Report generation failed. Please try again.");
        setApiDone(true);
        return;
      }

      const data = await res.json();
      setReport(data as AuditReport);
      setApiDone(true);
    } catch {
      setApiError("Network error. Please try again.");
      setApiDone(true);
    }
  }

  // â”€â”€ Layout shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-dark)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          padding: "1.5rem 1.5rem 0",
          maxWidth: 680,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {PHASES.map((label, i) => {
            const num = i + 1;
            const active = phase === num;
            const done = phase > num;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: i < 4 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: done
                        ? "var(--color-teal)"
                        : active
                        ? "rgba(75,133,142,0.25)"
                        : "rgba(255,255,255,0.06)",
                      border: active ? "2px solid var(--color-teal)" : "2px solid transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: done ? "var(--color-dark)" : active ? "var(--color-teal)" : "var(--color-gray)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {done ? "✓": num}
                  </div>
                  <span
                    style={{
                      fontSize: "0.65rem",
                      color: active ? "var(--color-teal)" : done ? "var(--color-gray)" : "rgba(255,255,255,0.3)",
                      whiteSpace: "nowrap",
                      textAlign: "center",
                      fontFamily: "var(--font-dm-sans)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < 4 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: done ? "var(--color-teal)" : "rgba(255,255,255,0.08)",
                      marginBottom: "1.2rem",
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase content */}
      <div
        style={{
          flex: 1,
          maxWidth: 640,
          margin: "0 auto",
          width: "100%",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        {/* â”€â”€ Phase 1: About Your Business â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {phase === 1 && (
          <div>
            <p style={{ color: "var(--color-teal)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
              About Your Business
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.6rem, 4vw, 2.1rem)",
                fontWeight: 700,
                lineHeight: 1.25,
                marginBottom: "2rem",
              }}
            >
              Let&apos;s start with the basics.
            </h1>

            {/* Q1: Business name */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "0.5rem", fontFamily: "var(--font-dm-sans)" }}>
                What is your business name?
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Operations Co."
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-teal)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>

            {/* Q2: Business type */}
            <div style={{ marginBottom: "1.75rem" }}>
              <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
                What type of business are you?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {BUSINESS_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleBusinessTypeSelect(type)}
                    style={pill(businessType === type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Q3: Team size â€” appears after Q2 is answered */}
            {showTeamSize && (
              <div>
                <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
                  How big is your team?
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {TEAM_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleTeamSizeSelect(size)}
                      style={pill(teamSize === size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* â”€â”€ Phase 2: Departments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {phase === 2 && (
          <div>
            <p style={{ color: "var(--color-teal)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
              Your Departments
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "0.5rem",
              }}
            >
              Which departments or functions exist in your business?
            </h1>
            <p style={{ color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "1.5rem", fontFamily: "var(--font-dm-sans)" }}>
              Select all that apply.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "0.6rem", marginBottom: "2rem" }}>
              {DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  onClick={() => toggleDept(dept)}
                  style={{
                    ...checkbox(selectedDepts.includes(dept)),
                    padding: "0.75rem 1rem",
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setDeptIndex(0);
                setPhase(3);
              }}
              disabled={selectedDepts.length === 0}
              style={selectedDepts.length === 0 ? ctaDisabled : ctaButton}
            >
              Set Up My Tools
            </button>
          </div>
        )}

        {/* â”€â”€ Phase 3: Tools per department â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {phase === 3 && currentDept && (
          <div>
            <p style={{ color: "var(--color-teal)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
              Your Tools, {deptIndex + 1} of {selectedDepts.length}
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "0.4rem",
              }}
            >
              What tools does your {currentDept} team use?
            </h1>
            <p style={{ color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "1.5rem", fontFamily: "var(--font-dm-sans)" }}>
              Check everything that applies. Add anything not listed.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(DEPT_TOOLS[currentDept] ?? []).map((tool) => (
                <button
                  key={tool}
                  onClick={() => toggleTool(currentDept, tool)}
                  style={checkbox((toolsByDept[currentDept] ?? []).includes(tool))}
                >
                  {tool}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "0.5rem", fontFamily: "var(--font-dm-sans)" }}>
                Any other tools this team uses?
              </label>
              <input
                type="text"
                value={additionalByDept[currentDept] ?? ""}
                onChange={(e) =>
                  setAdditionalByDept((prev) => ({
                    ...prev,
                    [currentDept]: e.target.value,
                  }))
                }
                placeholder="e.g. Webflow, Stripe, Calendly"
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--color-teal)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>

            <button onClick={handleNextDept} style={ctaButton}>
              {deptIndex < selectedDepts.length - 1
                ? `Next: ${selectedDepts[deptIndex + 1]}`
                : "Continue to AI and Spend"}
            </button>
          </div>
        )}

        {/* â”€â”€ Phase 4: AI usage + spend â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {phase === 4 && (
          <div>
            <p style={{ color: "var(--color-teal)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
              AI and Spend
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                color: "var(--color-offwhite)",
                fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
                fontWeight: 700,
                lineHeight: 1.3,
                marginBottom: "2rem",
              }}
            >
              Two more questions.
            </h1>

            {/* AI usage toggles */}
            <div style={{ marginBottom: "2.5rem" }}>
              <label style={{ display: "block", color: "var(--color-offwhite)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.4rem", fontFamily: "var(--font-dm-sans)" }}>
                Which tools are you using AI features inside?
              </label>
              <p style={{ color: "var(--color-gray)", fontSize: "0.825rem", marginBottom: "1rem", fontFamily: "var(--font-dm-sans)" }}>
                We use this to understand where AI is already running in your stack.
              </p>
              {allSelectedTools.length === 0 ? (
                <p style={{ color: "var(--color-gray)", fontSize: "0.875rem", fontFamily: "var(--font-dm-sans)" }}>
                  No tools selected yet.
                </p>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {allSelectedTools.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => toggleAi(tool)}
                      style={pill(!!aiUsage[tool])}
                    >
                      {aiUsage[tool] ? "✓" : “”}{tool}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly spend */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", color: "var(--color-offwhite)", fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem", fontFamily: "var(--font-dm-sans)" }}>
                Roughly how much does your business spend on software per month?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {SPEND_RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setMonthlySpend(range)}
                    style={pill(monthlySpend === range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateAudit}
              disabled={!monthlySpend}
              style={!monthlySpend ? ctaDisabled : ctaButton}
            >
              Generate My Audit Report
            </button>
          </div>
        )}

        {/* â”€â”€ Phase 5: Loading + Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {phase === 5 && (
          <div>
            {/* Loading state */}
            {!showReport && !apiError && (
              <div style={{ paddingTop: "2rem" }}>
                {/* Progress bar */}
                <div
                  style={{
                    height: 4,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 99,
                    overflow: "hidden",
                    marginBottom: "2.5rem",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: barDone ? "100%" : "0%",
                      background: "var(--color-teal)",
                      borderRadius: 99,
                      transition: barDone ? "none" : "width 3s linear",
                    }}
                    ref={(el) => {
                      if (el) {
                        requestAnimationFrame(() => {
                          el.style.width = "100%";
                        });
                      }
                    }}
                  />
                </div>

                <h2
                  style={{
                    fontFamily: "var(--font-playfair)",
                    color: "var(--color-offwhite)",
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Analyzing your stack...
                </h2>

                <p
                  key={loadingLineIndex}
                  style={{
                    color: "var(--color-teal)",
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.95rem",
                    animation: "fadeIn 0.4s ease",
                  }}
                >
                  {LOADING_LINES[loadingLineIndex]}
                </p>

                <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
              </div>
            )}

            {/* Error state */}
            {apiError && (
              <div style={{ paddingTop: "2rem" }}>
                <p style={{ color: "#f87171", fontFamily: "var(--font-dm-sans)", marginBottom: "1rem" }}>
                  {apiError}
                </p>
                <button
                  onClick={() => {
                    setPhase(4);
                    setApiError("");
                    setBarDone(false);
                    setApiDone(false);
                  }}
                  style={ctaButton}
                >
                  Try again
                </button>
              </div>
            )}

            {/* Report card */}
            {showReport && report && (
              <div ref={reportRef}>
                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                  <h1
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "var(--color-offwhite)",
                      fontSize: "clamp(1.5rem, 4vw, 2rem)",
                      fontWeight: 700,
                      marginBottom: "0.75rem",
                    }}
                  >
                    {businessName}
                  </h1>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.3rem 0.9rem",
                      borderRadius: 99,
                      background: WASTE_COLORS[report.waste_score] + "22",
                      border: `1.5px solid ${WASTE_COLORS[report.waste_score]}`,
                      color: WASTE_COLORS[report.waste_score],
                      fontFamily: "var(--font-dm-sans)",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "1rem",
                    }}
                  >
                    {report.waste_score} waste
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "var(--color-offwhite)",
                      fontSize: "1.2rem",
                      lineHeight: 1.45,
                    }}
                  >
                    {report.headline}
                  </p>
                </div>

                {/* Waste estimate card */}
                <div
                  style={{
                    border: "1.5px solid var(--color-teal)",
                    borderRadius: 12,
                    padding: "1.5rem",
                    marginBottom: "2rem",
                    background: "rgba(75,133,142,0.06)",
                  }}
                >
                  <p style={{ color: "var(--color-gray)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-dm-sans)", marginBottom: "0.5rem" }}>
                    Estimated monthly waste
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-playfair)",
                      color: "var(--color-teal)",
                      fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                      fontWeight: 700,
                      marginBottom: "0.25rem",
                    }}
                  >
                    ${report.estimated_monthly_waste_low.toLocaleString()} to ${report.estimated_monthly_waste_high.toLocaleString()}
                  </p>
                  <p style={{ color: "var(--color-gray)", fontSize: "0.875rem", fontFamily: "var(--font-dm-sans)", marginBottom: "1rem" }}>
                    {report.estimated_hours_wasted_per_month} hours wasted per month
                  </p>
                  <p style={{ color: "var(--color-gray)", fontSize: "0.925rem", lineHeight: 1.6, fontFamily: "var(--font-dm-sans)" }}>
                    {report.summary}
                  </p>
                </div>

                {/* Findings */}
                {report.findings?.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-playfair)",
                        color: "var(--color-offwhite)",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                      }}
                    >
                      What we found
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {report.findings
                        .sort((a, b) => {
                          const order = { high: 0, medium: 1, low: 2 };
                          return order[a.impact] - order[b.impact];
                        })
                        .slice(0, 6)
                        .map((finding, i) => (
                          <div
                            key={i}
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 10,
                              padding: "1rem 1.25rem",
                            }}
                          >
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                              <span style={{ color: "var(--color-offwhite)", fontFamily: "var(--font-dm-sans)", fontWeight: 600, fontSize: "0.9rem" }}>
                                {finding.tool}
                              </span>
                              <span style={{ color: "var(--color-gray)", fontSize: "0.775rem", fontFamily: "var(--font-dm-sans)", background: "rgba(255,255,255,0.06)", padding: "0.2rem 0.6rem", borderRadius: 99 }}>
                                {finding.department}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  color: IMPACT_COLORS[finding.impact],
                                  fontFamily: "var(--font-dm-sans)",
                                }}
                              >
                                {finding.impact} impact
                              </span>
                            </div>
                            <p style={{ color: "var(--color-gray)", fontSize: "0.875rem", lineHeight: 1.55, fontFamily: "var(--font-dm-sans)", marginBottom: "0.4rem" }}>
                              {finding.issue}
                            </p>
                            <p style={{ color: "var(--color-teal)", fontSize: "0.85rem", fontFamily: "var(--font-dm-sans)", lineHeight: 1.5 }}>
                              {finding.recommendation}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Quick wins */}
                {report.quick_wins?.length > 0 && (
                  <div style={{ marginBottom: "2rem" }}>
                    <h2
                      style={{
                        fontFamily: "var(--font-playfair)",
                        color: "var(--color-offwhite)",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                      }}
                    >
                      Quick wins
                    </h2>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {report.quick_wins.map((win, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "flex-start",
                            color: "var(--color-gray)",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "0.9rem",
                            lineHeight: 1.55,
                          }}
                        >
                          <span style={{ color: "var(--color-teal)", flexShrink: 0, marginTop: "0.1rem" }}>
                            &rarr;
                          </span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Environmental note */}
                {report.environmental_note && (
                  <div
                    style={{
                      borderLeft: "3px solid var(--color-teal)",
                      paddingLeft: "1.25rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <p style={{ color: "var(--color-gray)", fontSize: "0.9rem", lineHeight: 1.6, fontFamily: "var(--font-dm-sans)", marginBottom: "0.4rem" }}>
                      {report.environmental_note}
                    </p>
                    <p style={{ color: "var(--color-teal)", fontSize: "0.875rem", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
                      Estimated redirect potential: ${report.redirect_estimate_usd?.toLocaleString()}/month
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    paddingTop: "2rem",
                    marginTop: "1rem",
                  }}
                >
                  {reportSaved ? (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ color: “var(--color-teal)”, fontSize: “1.5rem”, marginBottom: “0.5rem” }}>✓</p>
                      <p style={{ color: "var(--color-offwhite)", fontFamily: "var(--font-dm-sans)", fontWeight: 600, marginBottom: "0.5rem" }}>
                        Your report is saved.
                      </p>
                      <a
                        href="https://calendly.com/fractionalbusinesscompanion/wst"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-teal)", fontFamily: "var(--font-dm-sans)", fontSize: "0.9rem", textDecoration: "underline" }}
                      >
                        Book a call to go deeper
                      </a>
                    </div>
                  ) : (
                    <div>
                      <h2
                        style={{
                          fontFamily: "var(--font-playfair)",
                          color: "var(--color-offwhite)",
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          marginBottom: "0.6rem",
                        }}
                      >
                        Want the full picture?
                      </h2>
                      <p style={{ color: "var(--color-gray)", fontSize: "0.9rem", lineHeight: 1.6, fontFamily: "var(--font-dm-sans)", marginBottom: "1.5rem" }}>
                        This is an estimate. A full audit goes deeper: line-by-line tool analysis, usage data, team interviews, and a redesign plan. Save your report first, then book a call.
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <button
                          onClick={() => setShowAuth(true)}
                          style={ctaButton}
                        >
                          Save My Report
                        </button>
                        <a
                          href="https://calendly.com/fractionalbusinesscompanion/wst"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            textAlign: "center",
                            padding: "0.875rem 1.25rem",
                            border: "1.5px solid var(--color-teal)",
                            borderRadius: 8,
                            color: "var(--color-teal)",
                            fontFamily: "var(--font-dm-sans)",
                            fontSize: "0.975rem",
                            fontWeight: 600,
                            textDecoration: "none",
                            transition: "background 0.15s ease",
                          }}
                        >
                          Book a Call
                        </a>
                      </div>
                      <p style={{ textAlign: "center", color: "var(--color-gray)", fontSize: "0.8rem", marginTop: "1rem", fontFamily: "var(--font-dm-sans)" }}>
                        Already have an account?{" "}
                        <button
                          onClick={() => setShowAuth(true)}
                          style={{ background: "none", border: "none", color: "var(--color-teal)", cursor: "pointer", fontSize: "0.8rem", padding: 0, textDecoration: "underline" }}
                        >
                          Log in to save.
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Auth modal overlay */}
      {showAuth && auditId !== null && (
        <AuthModal
          auditId={auditId}
          onSuccess={() => {
            setShowAuth(false);
            setReportSaved(true);
          }}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

