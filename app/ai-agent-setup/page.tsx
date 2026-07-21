import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ClickUp AI Agent Setup | World Shift Technologies",
  description:
    "Drew Griffiths builds ClickUp AI agent systems for agencies and operations teams. Discovery call maps your top automation opportunities in 30 minutes.",
};

const useCases = [
  {
    title: "Operations support agent",
    description:
      "Answers team questions about SOPs, workflows, and process nuances by searching your ClickUp knowledge base. Replaces \"who do I ask?\" with an answer that's always there.",
  },
  {
    title: "Meeting notes to tasks agent",
    description:
      "Reads a meeting transcript or summary, pulls the action items, and creates assigned tasks in the right list with the meeting context attached. No copy-pasting. No dropped follow-ups.",
  },
  {
    title: "Intake triage agent",
    description:
      "Checks incoming requests against your established templates and past project patterns before they reach your team. Flags gaps at intake, not after the work has started.",
  },
  {
    title: "Production status agent",
    description:
      "Gives any team member a live read on where a specific job or project stands, pulling directly from active task data. No pinging the PM. No hunting through lists.",
  },
];

export default function ClickUpAgentSetupPage() {
  return (
    <div style={{ background: "#F4F2EE", minHeight: "100vh", fontFamily: "var(--font-poppins)" }}>
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2rem",
          borderBottom: "1px solid rgba(75,133,142,0.15)",
        }}
      >
        <Link href="/">
          <Image
            src="/World_shift_tech_LOGO_PRIMARY.png"
            alt="World Shift Technologies"
            width={180}
            height={46}
            style={{ objectFit: "contain" }}
          />
        </Link>
        <a
          href="https://calendly.com/fractionalbusinesscompanion/wst"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.55rem 1.25rem",
            background: "var(--color-teal)",
            borderRadius: 999,
            color: "#080C14",
            fontFamily: "var(--font-poppins)",
            fontSize: "0.875rem",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Book a Call
        </a>
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "4rem 2rem 6rem" }}>
        {/* Eyebrow */}
        <p
          style={{
            color: "var(--color-teal)",
            fontSize: "0.75rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: "1.25rem",
          }}
        >
          ClickUp Workspace / AI Agent Setup
        </p>

        {/* Headline */}
        <h1
          style={{
            color: "var(--color-navy)",
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 300,
            lineHeight: 1.25,
            marginBottom: "2rem",
          }}
        >
          Your ClickUp workspace already knows everything. It just can&apos;t act on it yet.
        </h1>

        {/* Divider */}
        <div
          style={{
            height: 2,
            background: "var(--color-teal)",
            width: 64,
            borderRadius: 1,
            marginBottom: "3rem",
          }}
        />

        {/* Problem */}
        <section style={{ marginBottom: "2.5rem" }}>
          <p
            style={{
              color: "var(--color-teal)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            The Problem
          </p>
          <div
            style={{
              color: "var(--color-navy)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
            }}
          >
            <p style={{ marginBottom: "1rem" }}>
              ClickUp Brain exists. Your team probably already has it turned on. And it&apos;s
              probably still just answering one-off questions when someone remembers to ask.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              That&apos;s not an AI agent. That&apos;s a search bar with a personality.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              The gap isn&apos;t the tool. It&apos;s the setup. Most ClickUp workspaces
              weren&apos;t built to give an AI agent what it needs: organized task data, written
              process docs, named roles, defined workflows, escalation rules, and the nuances only
              your team knows. Without that foundation, Brain gives generic answers to specific
              problems.
            </p>
            <p>
              I build the layer underneath. The knowledge base, the structure, the agent logic.
              Then Brain stops answering questions and starts doing work.
            </p>
          </div>
        </section>

        {/* Solution */}
        <section style={{ marginBottom: "3rem" }}>
          <p
            style={{
              color: "var(--color-teal)",
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: "0.75rem",
            }}
          >
            What I&apos;d Build
          </p>
          <div
            style={{
              color: "var(--color-navy)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
            }}
          >
            <p style={{ marginBottom: "1rem" }}>
              A ClickUp intelligence system built around how your business actually runs.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              That starts with a knowledge foundation: process docs written into ClickUp Docs, org
              structure mapped so the agent knows who owns what, workflow stages defined so the
              agent knows what &quot;done&quot; means in your context.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              From there, I build agents for the jobs your team keeps doing manually. That might be
              an operations support agent that answers &quot;who do I ask about X&quot; so you stop
              being the answer to that question. Or a meeting notes agent that reads a Fireflies
              transcript, pulls the action items, and drops assigned tasks into the right list with
              context attached. Or a brief validation agent that checks incoming creative requests
              against your intake template before they hit the design queue.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Each agent does one job. It does it without being asked. And it gets smarter as your
              docs get better.
            </p>
            <p>
              I hold all three ClickUp certifications: Verified Consultant, Power User, AI Power
              User. I&apos;m not configuring a feature. I&apos;m building a system.
            </p>
          </div>
        </section>

        {/* Use Cases */}
        <section style={{ marginBottom: "4rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {useCases.map((uc, i) => (
              <div
                key={i}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(0,32,92,0.08)",
                  borderTop: "3px solid var(--color-teal)",
                  borderRadius: 10,
                  padding: "1.5rem",
                }}
              >
                <p
                  style={{
                    color: "var(--color-navy)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    marginBottom: "0.6rem",
                  }}
                >
                  {uc.title}
                </p>
                <p
                  style={{
                    color: "#00205C",
                    fontSize: "0.9rem",
                    lineHeight: 1.65,
                  }}
                >
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ textAlign: "center" }}>
          <h2
            style={{
              color: "var(--color-navy)",
              fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
              fontWeight: 300,
              lineHeight: 1.35,
              marginBottom: "1rem",
            }}
          >
            Ready to see what this looks like in your workspace?
          </h2>
          <p
            style={{
              color: "var(--color-navy)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
              maxWidth: 520,
              margin: "0 auto 1.75rem",
              opacity: 0.85,
            }}
          >
            I start with a 30-minute discovery call. We look at your current setup and map the top
            two or three agent opportunities. Whether you work with me or not, you&apos;ll leave
            with a clear picture of what&apos;s worth building.
          </p>
          <a
            href="https://calendly.com/fractionalbusinesscompanion/wst"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.9rem 2.25rem",
              background: "var(--color-teal)",
              borderRadius: 8,
              color: "#080C14",
              fontFamily: "var(--font-poppins)",
              fontSize: "1rem",
              fontWeight: 700,
              textDecoration: "none",
              marginBottom: "1.25rem",
            }}
          >
            Book a Free Discovery Call
          </a>
          <p
            style={{
              color: "var(--color-navy)",
              fontSize: "0.8rem",
              opacity: 0.6,
            }}
          >
            Save this page. Bookmark the URL to come back to it anytime.
          </p>
        </section>
      </main>
    </div>
  );
}
