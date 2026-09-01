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

export default function WeArePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0b0b0b] text-white">
      {/* =========================================================
          GLOBAL BACKGROUND
      ========================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        {/* warm cinematic glow */}
        <div className="absolute -left-40 top-20 h-[550px] w-[550px] rounded-full bg-orange-500/[0.08] blur-[140px]" />

        {/* cool secondary glow */}
        <div className="absolute -right-40 top-[45%] h-[600px] w-[600px] rounded-full bg-blue-500/[0.06] blur-[160px]" />

        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* top vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_0%,rgba(0,0,0,0.35)_70%)]" />
      </div>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative border-b border-white/10 px-6 pb-28 pt-36 sm:px-10 md:px-16 lg:px-24 lg:pb-40 lg:pt-48">
        <div className="mx-auto max-w-[1500px]">
          <div className="max-w-6xl">
            <p
              className="mb-8 text-xs font-semibold tracking-[0.35em] text-white/45 opacity-0"
              style={{
                animation: "fadeUp 0.8s ease forwards",
                animationDelay: "0.1s",
              }}
            >
              WE ARE PROP DUE
            </p>

            <h1
              className="text-[clamp(3.7rem,9vw,9.5rem)] font-light leading-[0.9] tracking-[-0.055em] opacity-0"
              style={{
                animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) forwards",
                animationDelay: "0.2s",
              }}
            >
              Property
              <br />

              <span className="font-medium text-white">
                intelligence,
              </span>

              <br />

              <span className="text-white/35">made clear.</span>
            </h1>

            <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
              <p
                className="max-w-3xl text-lg font-light leading-8 text-white/50 md:text-xl md:leading-9 opacity-0"
                style={{
                  animation: "fadeUp 0.9s ease forwards",
                  animationDelay: "0.45s",
                }}
              >
                PropDue is building a smarter way to understand property
                risk. We bring ownership records, tax history, zoning,
                environmental information, permits, nearby properties and
                supporting documents into one structured due-diligence
                experience.
              </p>

              <div
                className="border-l border-white/15 pl-6 opacity-0"
                style={{
                  animation: "fadeUp 0.9s ease forwards",
                  animationDelay: "0.55s",
                }}
              >
                <p className="text-xs font-semibold tracking-[0.25em] text-white/35">
                  OUR PURPOSE
                </p>

                <p className="mt-4 text-xl font-light leading-8 text-white/75">
                  Turn fragmented property information into a clearer basis
                  for better decisions.
                </p>
              </div>
            </div>
          </div>

          {/* scroll indicator */}
          <div className="mt-24 flex items-center gap-4 text-[10px] font-medium tracking-[0.35em] text-white/30">
            <span className="h-px w-12 bg-white/20" />
            SCROLL TO DISCOVER
          </div>
        </div>
      </section>

      {/* =========================================================
          MISSION
      ========================================================== */}

      <section className="px-6 py-28 sm:px-10 md:px-16 lg:px-24 lg:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-28">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/35">
                WHY WE EXIST
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl text-4xl font-light leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
                Real estate decisions deserve
                <span className="text-white/35"> more than scattered data.</span>
              </h2>

              <p className="mt-10 max-w-3xl text-lg leading-8 text-white/45">
                Buying or evaluating a property can require research across
                multiple records, systems and sources. PropDue is designed to
                simplify that process by organizing the available evidence
                around a property into a single, understandable experience.
              </p>

              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/45">
                Our goal is not to replace professional judgment. It is to
                make the information behind that judgment easier to discover,
                compare and understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRINCIPLES
      ========================================================== */}

      <section className="border-y border-white/10 px-6 py-28 sm:px-10 md:px-16 lg:px-24 lg:py-36">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-20">
            <p className="mb-6 text-xs font-semibold tracking-[0.35em] text-white/35">
              WHAT DRIVES US
            </p>

            <h2 className="max-w-4xl text-4xl font-light leading-tight md:text-6xl">
              Built around three
              <span className="font-medium"> simple principles.</span>
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 md:grid-cols-3">
            {principles.map((item) => (
              <article
                key={item.number}
                className="group min-h-[330px] bg-[#0d0d0d] p-8 transition duration-500 hover:bg-[#151515] md:p-10"
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs tracking-[0.2em] text-white/25">
                    {item.number}
                  </span>

                  <span className="text-white/20 transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-white/70">
                    ↗
                  </span>
                </div>

                <div className="mt-24">
                  <h3 className="text-3xl font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-5 max-w-sm text-sm leading-7 text-white/40">
                    {item.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT WE BRING TOGETHER
      ========================================================== */}

      <section className="px-6 py-28 sm:px-10 md:px-16 lg:px-24 lg:py-40">
        <div className="mx-auto max-w-[1500px]">
          <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:gap-28">
            <div>
              <p className="mb-6 text-xs font-semibold tracking-[0.35em] text-white/35">
                THE PROP DUE APPROACH
              </p>

              <h2 className="text-4xl font-light leading-tight md:text-6xl">
                From an
                <br />
                <span className="font-medium">address</span>
                <br />
                to a clearer
                <br />
                <span className="text-white/35">picture.</span>
              </h2>
            </div>

            <div className="lg:pt-16">
              <p className="max-w-xl text-lg leading-8 text-white/45">
                A property address is only the starting point. Our platform
                is designed to organize the information around that address
                and help users understand the factors that may influence a
                property decision.
              </p>

              <div className="mt-12 grid grid-cols-2 border-l border-t border-white/10">
                {capabilities.map((item, index) => (
                  <div
                    key={item}
                    className="border-b border-r border-white/10 p-5 transition duration-300 hover:bg-white/[0.03] md:p-6"
                  >
                    <span className="mb-3 block text-[10px] tracking-[0.2em] text-white/20">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-sm text-white/65">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          STATEMENT
      ========================================================== */}

      <section className="border-y border-white/10 px-6 py-28 sm:px-10 md:px-16 lg:px-24 lg:py-44">
        <div className="mx-auto max-w-[1500px]">
          <p className="mb-10 text-xs font-semibold tracking-[0.35em] text-white/35">
            OUR VISION
          </p>

          <blockquote className="max-w-6xl text-4xl font-light leading-[1.08] tracking-tight md:text-6xl lg:text-8xl">
            “Make property due diligence
            <span className="text-white/30">
              {" "}
              easier to navigate,
            </span>
            <br />
            easier to understand,
            <br />
            and easier to act on.”
          </blockquote>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}

      <section className="px-6 py-32 sm:px-10 md:px-16 lg:px-24 lg:py-48">
        <div className="mx-auto max-w-[1100px] text-center">
          <p className="mb-8 text-xs font-semibold tracking-[0.35em] text-white/30">
            THE NEXT STEP
          </p>

          <h2 className="text-5xl font-light leading-[0.98] tracking-tight md:text-7xl lg:text-8xl">
            Know the property.
            <br />
            <span className="font-medium">Know the risks.</span>
          </h2>

          <p className="mx-auto mt-10 max-w-2xl text-lg leading-8 text-white/40">
            Explore a property with a clearer view of the information that
            matters before the decision.
          </p>

          <a
            href="/property-search"
            className="mt-10 inline-flex items-center gap-3 rounded-full border border-white/20 px-8 py-4 text-sm font-medium text-white transition duration-300 hover:bg-white hover:text-black"
          >
            Search a Property
            <span>↗</span>
          </a>
        </div>
      </section>

      {/* =========================================================
          ANIMATION
      ========================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes fadeUp {
              from {
                opacity: 0;
                transform: translateY(28px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
              }
            }
          `,
        }}
      />
    </main>
  );
}