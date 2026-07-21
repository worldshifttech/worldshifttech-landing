export default function ImpactPage() {
  return (
    <div className="min-h-screen" style={{ background: "#F4F2EE" }}>
      <main className="max-w-4xl mx-auto px-6 py-20">

        {/* Section label */}
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase mb-5"
          style={{ color: "#4B858E" }}
        >
          WHERE THE MONEY GOES
        </p>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl font-light leading-[1.15] tracking-tight mb-10"
          style={{ color: "#00205C" }}
        >
          I put a portion of every project into organizations actually fighting this.
        </h1>

        {/* Body */}
        <p className="text-base leading-relaxed mb-5" style={{ color: "#76777A" }}>
          Most AI is being built and deployed without any accountability for what it costs — in energy, in water, in who bears the consequences. I&apos;m not going to pretend a software build fixes that. But I can be precise about where the dollars go and why.
        </p>
        <p className="text-base leading-relaxed mb-12" style={{ color: "#76777A" }}>
          These four organizations are doing specific, verifiable work on the AI accountability fight. Not general environmental causes. Not carbon offsets. The actual fight.
        </p>

        {/* Divider */}
        <div className="border-t mb-14" style={{ borderColor: "#4B858E", opacity: 0.4 }} />

        {/* Org cards */}
        <div className="flex flex-col gap-8">

          {/* Card 1 — AI Now Institute */}
          <div
            className="rounded-xl p-8 border border-[#00205C]/10"
            style={{ background: "#FFFFFF", borderTop: "2px solid #4B858E" }}
          >
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: "#00205C" }}
            >
              AI Now Institute
            </h2>
            <p className="text-xs mb-4" style={{ color: "rgba(0,32,92,0.7)" }}>
              New York, NY &middot; 501(c)(3) &middot; Founded 2017
            </p>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ background: "#4B858E", color: "#080C14" }}
            >
              AI accountability
            </span>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#00205C" }}>
              Research institute studying how AI concentrates power and who pays the price. They accept zero funding from the tech companies they study.
            </p>
            <p
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
              style={{ color: "rgba(0,32,92,0.7)" }}
            >
              WHAT THEY&apos;VE DONE
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#00205C" }}>
              Published the 2023 Landscape report on tech power concentration that shaped how regulators approach AI oversight. In 2021, three of their senior staff were appointed to the FTC&apos;s Office of Policy Planning to advise on AI policy. Their 2026 work focuses directly on AI infrastructure&apos;s energy and grid implications.
            </p>
            <a
              href="https://ainowinstitute.org/about"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: "#4B858E" }}
            >
              Learn more
            </a>
          </div>

          {/* Card 2 — DAIR */}
          <div
            className="rounded-xl p-8 border border-[#00205C]/10"
            style={{ background: "#FFFFFF", borderTop: "2px solid #4B858E" }}
          >
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: "#00205C" }}
            >
              Distributed AI Research Institute (DAIR)
            </h2>
            <p className="text-xs mb-4" style={{ color: "rgba(0,32,92,0.7)" }}>
              Oakland, CA &middot; Fiscally sponsored 501(c)(3) &middot; Founded 2021
            </p>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ background: "#4B858E", color: "#080C14" }}
            >
              AI accountability
            </span>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#00205C" }}>
              Founded by Dr. Timnit Gebru after Google fired her for publishing research they didn&apos;t like. Built explicitly to operate outside Big Tech&apos;s funding orbit.
            </p>
            <p
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
              style={{ color: "rgba(0,32,92,0.7)" }}
            >
              WHAT THEY&apos;VE DONE
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#00205C" }}>
              Launched Surveillance Watch, tracking who builds and deploys surveillance AI globally. Produced peer-reviewed research using satellite imagery to document the geographic legacy of apartheid in South Africa — led by a researcher from the townships being studied. One of the only AI research institutes with no corporate tech funders and a community-first research model.
            </p>
            <a
              href="https://dair-institute.org/about/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: "#4B858E" }}
            >
              Learn more
            </a>
          </div>

          {/* Card 3 — Southern Environmental Law Center */}
          <div
            className="rounded-xl p-8 border border-[#00205C]/10"
            style={{ background: "#FFFFFF", borderTop: "2px solid #4B858E" }}
          >
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: "#00205C" }}
            >
              Southern Environmental Law Center
            </h2>
            <p className="text-xs mb-4" style={{ color: "rgba(0,32,92,0.7)" }}>
              Charlottesville, VA &middot; 501(c)(3) &middot; Founded 1986
            </p>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ background: "#4B858E", color: "#080C14" }}
            >
              Legal / litigation
            </span>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#00205C" }}>
              Over 160 legal and policy experts across the Southeast. When research and policy aren&apos;t enough, someone has to file the brief.
            </p>
            <p
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
              style={{ color: "rgba(0,32,92,0.7)" }}
            >
              WHAT THEY&apos;VE DONE
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#00205C" }}>
              Representing the NAACP in an April 2026 federal Clean Air Act lawsuit against xAI for operating 27 unpermitted methane gas turbines in Southaven, Mississippi to power its Colossus 2 data center. After SELC sent a prior notice of intent to sue over Colossus 1, xAI removed its unpermitted turbines there and obtained permits. A preliminary injunction request is now before the court seeking to halt the Colossus 2 turbines immediately.
            </p>
            <a
              href="https://www.selc.org/about-us/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: "#4B858E" }}
            >
              Learn more
            </a>
          </div>

          {/* Card 4 — Public Citizen Energy Program */}
          <div
            className="rounded-xl p-8 border border-[#00205C]/10"
            style={{ background: "#FFFFFF", borderTop: "2px solid #4B858E" }}
          >
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: "#00205C" }}
            >
              Public Citizen Energy Program
            </h2>
            <p className="text-xs mb-4" style={{ color: "rgba(0,32,92,0.7)" }}>
              Washington, DC &middot; 501(c)(3) &middot; Founded 1971
            </p>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5"
              style={{ background: "#4B858E", color: "#080C14" }}
            >
              Policy / regulatory
            </span>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "#00205C" }}>
              The only consumer watchdog consistently showing up at FERC on AI infrastructure. Grassroots-funded. No corporate sponsors.
            </p>
            <p
              className="text-xs font-semibold tracking-[0.15em] uppercase mb-3"
              style={{ color: "rgba(0,32,92,0.7)" }}
            >
              WHAT THEY&apos;VE DONE
            </p>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "#00205C" }}>
              Intervened as a party in FERC proceedings on transmission rate agreements between ComEd and data center developers including PowerHouse, Equinix, and QTS — cases that would determine whether households absorb the cost of AI infrastructure. In April 2026, also called on FERC to impose a moratorium on new data center grid interconnections, citing reliability risks confirmed by NERC.
            </p>
            <a
              href="https://www.citizen.org/topic/climate-energy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: "#4B858E" }}
            >
              Learn more
            </a>
          </div>

        </div>
      </main>
    </div>
  );
}
