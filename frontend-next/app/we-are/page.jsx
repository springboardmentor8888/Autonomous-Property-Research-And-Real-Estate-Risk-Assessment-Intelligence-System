
export const metadata = {
  title: "We Are | PropDue",
  description:
    "Discover PropDue and our mission to simplify real estate due diligence through intelligent property research.",
};

const principles = [
  {
    number: "01",
    title: "Clarity",
    description:
      "Property decisions often depend on information spread across multiple records and sources. We bring those findings together into one clear view.",
  },
  {
    number: "02",
    title: "Intelligence",
    description:
      "We combine structured property information with automated analysis to help users identify important findings faster.",
  },
  {
    number: "03",
    title: "Confidence",
    description:
      "Better property decisions start with better information. Our platform is designed to make due diligence more understandable and actionable.",
  },
];

const capabilities = [
  "Ownership Records",
  "Property Tax History",
  "Zoning & Regulations",
  "Flood Risk",
  "Environmental Data",
  "Permit History",
  "Nearby Properties",
  "Legal Documents",
];

const DISPLAY_FONT =
  "'Syne', 'Arial Black', system-ui, sans-serif";

const BODY_FONT =
  "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif";

export default function WeArePage() {
  return (
    <main
      className="relative min-h-screen overflow-hidden bg-[#2B1740] text-white selection:bg-[#D174D2]/40"
      style={{ fontFamily: BODY_FONT }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');

        @keyframes propdueFadeUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes propdueFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .propdue-reveal {
          animation: propdueFadeUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .propdue-glass {
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.13),
            rgba(255,255,255,0.045)
          );
          border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .propdue-glass-hover {
          transition:
            transform 300ms ease,
            border-color 300ms ease,
            background 300ms ease,
            box-shadow 300ms ease;
        }

        .propdue-glass-hover:hover {
          transform: translateY(-5px);
          border-color: rgba(209,116,210,0.65);
          background: linear-gradient(
            135deg,
            rgba(209,116,210,0.13),
            rgba(255,255,255,0.055)
          );
          box-shadow: 0 22px 55px -28px rgba(0,0,0,0.65);
        }

        .propdue-primary {
          background: linear-gradient(135deg, #E0563F, #c94a34);
          box-shadow: 0 12px 32px -12px rgba(224,86,63,0.85);
          transition:
            transform 250ms ease,
            box-shadow 250ms ease,
            filter 250ms ease;
        }

        .propdue-primary:hover {
          transform: translateY(-3px);
          filter: brightness(1.08);
          box-shadow: 0 18px 38px -12px rgba(224,86,63,0.8);
        }

        .propdue-outline {
          background: rgba(255,255,255,0.075);
          border: 1px solid rgba(255,255,255,0.36);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition:
            background 250ms ease,
            color 250ms ease,
            border-color 250ms ease,
            transform 250ms ease;
        }

        .propdue-outline:hover {
          background: rgba(255,255,255,0.95);
          border-color: rgba(255,255,255,0.95);
          color: #412653;
          transform: translateY(-3px);
        }

        @media (prefers-reduced-motion: reduce) {
          .propdue-reveal,
          .propdue-glass-hover,
          .propdue-primary,
          .propdue-outline {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* PROPERTY SEARCH MATCHING GRADIENT BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]" />

        <div className="absolute -left-48 top-24 h-[540px] w-[540px] rounded-full bg-[#D174D2]/20 blur-[150px]" />

        <div className="absolute -right-48 top-[28%] h-[620px] w-[620px] rounded-full bg-[#E0563F]/15 blur-[160px]" />

        <div className="absolute -bottom-48 left-[25%] h-[600px] w-[600px] rounded-full bg-[#3F567F]/40 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(43,23,64,0.20)_65%,rgba(43,23,64,0.55)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* HERO */}
        <section className="relative border-b border-white/15 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-24 lg:pb-36 lg:pt-44">
          <div className="mx-auto max-w-[1400px]">
            <div className="max-w-6xl">
              <p
                className="propdue-reveal mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/[0.09] px-5 py-2 text-xs font-semibold tracking-[0.2em] text-white"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="h-2 w-2 rounded-full bg-[#D174D2] shadow-[0_0_12px_rgba(209,116,210,0.9)]" />
                WE ARE PROP DUE
              </p>

              <h1
              className="propdue-reveal text-[clamp(2.5rem,6vw,6rem)] font-extrabold leading-[1.05] tracking-[-0.045em]"
                style={{
                  fontFamily: DISPLAY_FONT,
                  animationDelay: "0.2s",
                }}
              >
                Property
                <br />
                <span className="text-[#D174D2]">
                  intelligence,
                </span>
                <br />
                <span className="text-white/65">
                  made clear.
                </span>
              </h1>

              <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-end lg:gap-16">
                <p
                  className="propdue-reveal max-w-3xl text-lg leading-8 text-white/80 md:text-xl md:leading-9"
                  style={{ animationDelay: "0.35s" }}
                >
                  PropDue is building a smarter way to understand
                  property risk. We bring ownership records, tax
                  history, zoning, environmental information,
                  permits, nearby properties and supporting
                  documents into one structured due-diligence
                  experience.
                </p>

                <div
                  className="propdue-glass propdue-reveal rounded-2xl p-6 md:p-7"
                  style={{ animationDelay: "0.45s" }}
                >
                  <p className="text-xs font-bold tracking-[0.22em] text-[#D174D2]">
                    OUR PURPOSE
                  </p>

                  <p
                    className="mt-4 text-xl font-semibold leading-8 text-white"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    Turn fragmented property information into a
                    clearer basis for better decisions.
                  </p>
                </div>
              </div>

              <a
                href="#our-mission"
                className="propdue-outline mt-10 inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
              >
                Discover our mission
                <span aria-hidden="true" className="text-lg">
                  ↓
                </span>
              </a>
            </div>

            <div className="mt-20 flex items-center gap-4 text-[10px] font-bold tracking-[0.3em] text-white/60">
              <span className="h-px w-12 bg-[#D174D2]" />
              BUILT FOR CLEARER PROPERTY DECISIONS
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section
          id="our-mission"
          className="px-6 py-24 sm:px-10 md:px-16 lg:px-24 lg:py-36"
        >
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
              <div>
                <p className="inline-flex items-center gap-3 text-xs font-bold tracking-[0.25em] text-[#D174D2]">
                  <span className="h-px w-8 bg-[#D174D2]" />
                  WHY WE EXIST
                </p>

                <div className="propdue-glass mt-10 hidden max-w-[310px] rounded-3xl p-7 lg:block">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D174D2]/40 bg-[#D174D2]/15 text-[#D174D2]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      className="h-7 w-7"
                      aria-hidden="true"
                    >
                      <path d="M3 10.5 12 3l9 7.5" />
                      <path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7" />
                    </svg>
                  </div>
                  <p
                    className="mt-6 text-xl font-bold text-white"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    Every property has a story.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    We help bring the information behind that
                    story into clearer view.
                  </p>
                </div>
              </div>

              <div>
                <h2
                  className="text-4xl font-bold leading-[1.12] tracking-tight md:text-6xl"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  Real estate decisions deserve{" "}
                  <span className="text-[#D174D2]">
                    more than scattered data.
                  </span>
                </h2>

                <p className="mt-8 max-w-3xl text-lg leading-8 text-white/75">
                  Buying or evaluating a property can require
                  research across multiple records, systems and
                  sources. PropDue is designed to simplify that
                  process by organizing the available evidence
                  around a property into a single, understandable
                  experience.
                </p>

                <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
                  Our goal is not to replace professional judgment.
                  It is to make the information behind that
                  judgment easier to discover, compare and
                  understand.
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  {["Explore", "Understand", "Decide"].map(
                    (item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#D174D2]/35 bg-[#D174D2]/10 px-5 py-2.5 text-sm font-semibold text-white/90"
                      >
                        <span className="mr-2 text-[#D174D2]">
                          ✓
                        </span>
                        {item}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section className="border-y border-white/15 bg-white/[0.025] px-6 py-24 sm:px-10 md:px-16 lg:px-24 lg:py-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-14 max-w-3xl md:mb-20">
              <p className="mb-6 text-xs font-bold tracking-[0.25em] text-[#D174D2]">
                WHAT DRIVES US
              </p>

              <h2
                className="text-4xl font-bold leading-tight md:text-6xl"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Built around three{" "}
                <span className="text-white/65">
                  simple principles.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                The way we approach property research starts with
                making complex information more accessible and
                useful.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {principles.map((item, index) => (
                <article
                  key={item.number}
                  className="propdue-glass propdue-glass-hover group relative flex min-h-[330px] flex-col overflow-hidden rounded-3xl p-7 md:p-9"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[#D174D2]/10 blur-3xl transition duration-500 group-hover:bg-[#D174D2]/20" />

                  <div className="relative flex items-center justify-between">
                    <span className="text-sm font-bold tracking-[0.18em] text-[#D174D2]">
                      {item.number}
                    </span>

                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] text-xl text-white/75 transition duration-300 group-hover:border-[#D174D2]/60 group-hover:text-[#D174D2]">
                      ↗
                    </span>
                  </div>

                  <div className="relative mt-auto pt-16">
                    <div className="mb-5 h-1 w-12 rounded-full bg-[#E0563F] transition-all duration-300 group-hover:w-20" />

                    <h3
                      className="text-2xl font-bold md:text-3xl"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-5 text-sm leading-7 text-white/70">
                      {item.description}
                    </p>
                  </div>

                  <span className="absolute bottom-5 right-7 text-7xl font-extrabold text-white/[0.035]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CAPABILITIES */}
        <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-24 lg:py-36">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
              <div>
                <p className="mb-7 text-xs font-bold tracking-[0.25em] text-[#D174D2]">
                  THE PROP DUE APPROACH
                </p>

                <h2
                  className="text-4xl font-bold leading-[1.12] md:text-6xl"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  From an
                  <br />
                  <span className="text-[#D174D2]">
                    address
                  </span>
                  <br />
                  to a clearer
                  <br />
                  <span className="text-white/65">
                    picture.
                  </span>
                </h2>

                <p className="mt-8 max-w-xl text-lg leading-8 text-white/75">
                  A property address is only the starting point.
                  Our platform is designed to organize the
                  information around that address and help users
                  understand the factors that may influence a
                  property decision.
                </p>

                <div className="propdue-glass mt-10 rounded-2xl p-6">
                  <p className="text-xs font-bold tracking-[0.2em] text-[#D174D2]">
                    ONE STRUCTURED EXPERIENCE
                  </p>
                  <p className="mt-3 text-base leading-7 text-white/80">
                    Bring important property research categories
                    together so information is easier to navigate.
                  </p>
                </div>
              </div>

              <div className="lg:pt-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <h3
                    className="text-xl font-bold md:text-2xl"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    Research capabilities
                  </h3>

                  <span className="rounded-full border border-[#D174D2]/40 bg-[#D174D2]/10 px-3 py-1.5 text-xs font-bold text-[#D174D2]">
                    08 AREAS
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {capabilities.map((item, index) => (
                    <div
                      key={item}
                      className="propdue-glass propdue-glass-hover flex min-h-[100px] items-center gap-4 rounded-2xl p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D174D2]/35 bg-[#D174D2]/10 text-xs font-bold text-[#D174D2]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-sm font-semibold leading-6 text-white/90">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VISION */}
        <section className="px-6 py-20 sm:px-10 md:px-16 lg:px-24 lg:py-28">
          <div className="mx-auto max-w-[1400px]">
            <div className="propdue-glass relative overflow-hidden rounded-[2rem] p-8 sm:p-12 md:p-16 lg:p-20">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D174D2]/15 blur-[100px]" />
              <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#E0563F]/10 blur-[100px]" />

              <div className="relative">
                <p className="mb-10 text-xs font-bold tracking-[0.25em] text-[#D174D2]">
                  OUR VISION
                </p>

                <blockquote
                  className="max-w-6xl text-3xl font-bold leading-[1.2] tracking-tight sm:text-4xl md:text-6xl lg:text-7xl"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  Make property due diligence{" "}
                  <span className="text-[#D174D2]">
                    easier to navigate,
                  </span>{" "}
                  easier to understand, and easier to act on.
                </blockquote>

                <div className="mt-12 flex items-center gap-4">
                  <span className="h-1 w-14 rounded-full bg-[#E0563F]" />
                  <span className="text-xs font-bold tracking-[0.2em] text-white/55">
                    THE FUTURE OF CLEARER PROPERTY RESEARCH
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-6 pb-28 pt-12 sm:px-10 md:px-16 lg:px-24 lg:pb-36 lg:pt-20">
          <div className="mx-auto max-w-[1400px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-gradient-to-br from-[#3F567F]/90 via-[#412653]/90 to-[#2B1740]/95 px-6 py-16 text-center shadow-[0_30px_90px_-35px_rgba(0,0,0,0.65)] sm:px-10 md:py-24">
              <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-[#D174D2]/20 blur-[100px]" />

              <div className="pointer-events-none absolute -bottom-36 -right-20 h-96 w-96 rounded-full bg-[#E0563F]/15 blur-[120px]" />

              <div className="relative mx-auto max-w-4xl">
                <p className="mb-7 text-xs font-bold tracking-[0.25em] text-[#D174D2]">
                  THE NEXT STEP
                </p>

                <h2
                  className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl md:text-7xl"
                  style={{ fontFamily: DISPLAY_FONT }}
                >
                  Know the property.
                  <br />
                  <span className="text-[#D174D2]">
                    Know the risks.
                  </span>
                </h2>

                <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/75 md:text-lg">
                  Explore a property with a clearer view of the
                  information that matters before the decision.
                </p>

                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                  <a
                    href="/property-search"
                    className="propdue-primary inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/60"
                  >
                    Search a Property
                    <span aria-hidden="true" className="text-xl">
                      →
                    </span>
                  </a>

                  <a
                    href="#our-mission"
                    className="propdue-outline inline-flex min-h-[58px] items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/60"
                  >
                    Learn About Us
                    <span aria-hidden="true" className="text-xl">
                      ↗
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/15 bg-[#2B1740]/50 px-6 py-8 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-3 text-xs font-semibold text-white/60 sm:flex-row sm:items-center">
            <span
              className="text-sm font-extrabold tracking-[0.18em] text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              PROP<span className="text-[#D174D2]">DUE</span>
            </span>

            <span>
                    AUTONOMOUS PROPERTY RISK INTELLIGENCE
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
