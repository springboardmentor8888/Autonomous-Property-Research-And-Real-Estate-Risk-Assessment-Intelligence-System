'use client'

export default function HomeContent() {
  return (
    <div className="relative z-10 bg-[#0a0e16]">
      {/* ── ABOUT THE PLATFORM ── */}
      <section className="border-t border-white/10 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto grid max-w-[1400px] gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-white/35">
              THE PLATFORM
            </p>
            <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
              Property intelligence,{' '}
              <span className="text-white/35">made simple.</span>
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-lg font-light leading-8 text-white/55 md:text-xl">
              PropDue gives buyers, agents, legal teams, and financial
              institutions one place to understand a property before making a
              commitment. Enter an address — receive a structured view of
              ownership, tax records, zoning, permits, environmental exposure,
              and market context.
            </p>
            <p className="mt-7 text-sm leading-7 text-white/35">
              We consolidate data from multiple public and third-party sources
              into clear, downloadable reports with configurable risk
              indicators. Designed for the moments when a property decision
              demands more than a listing — a repeatable research process,
              transparent source data, and a report where nothing is left to
              assumption.
            </p>
          </div>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section
        id="capabilities"
        className="scroll-mt-[72px] px-6 pb-24 sm:px-10 md:px-16 lg:px-24"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 flex flex-col justify-between gap-5 border-t border-white/10 pt-10 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                CAPABILITIES
              </p>
              <h2 className="mt-5 text-3xl font-light tracking-tight md:text-5xl">
                Everything you need, in one place.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-white/35">
              Each capability is designed to work independently and together —
              creating a seamless workflow from search to decision.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['01', 'Secure Access', 'Role-based authentication for buyers, agents, legal teams, financial institutions, and administrators — with enterprise-grade security.'],
              ['02', 'Smart Search', 'Real-time address validation with autocomplete, geographic coordinates, and instant property detail retrieval powered by advanced mapping.'],
              ['03', 'Automated Research', 'Ownership records, tax history, building permits, zoning, flood zones, environmental data, and utility info — aggregated automatically.'],
              ['04', 'Risk Scoring', 'Configurable risk indicators across legal, financial, environmental, and compliance dimensions — computed and presented clearly.'],
              ['05', 'Market Intelligence', 'Nearby listings, price comparisons, value history, and market trends that frame every property in its local context.'],
              ['06', 'Report Generation', 'Comprehensive reports with executive summaries, risk scores, property timelines, and full documentation — exportable as PDF or Excel.'],
              ['07', 'Smart Alerts', 'Instant notifications for completed reports, property changes, and scheduled monitoring — delivered in-app and via email.'],
              ['08', 'Full Audit Trail', 'Every search, API call, report version, and user action logged for complete transparency and regulatory compliance.'],
            ].map(([num, title, text]) => (
              <div
                key={num}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {num}
                </p>
                <h3 className="mt-12 text-xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DUE DILIGENCE COVERAGE ── */}
      <section className="px-6 pb-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                WHAT WE COVER
              </p>
              <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                Every critical layer,{' '}
                <span className="text-white/35">in one review.</span>
              </h2>
            </div>
            <div className="flex items-end">
              <p className="max-w-lg text-sm leading-7 text-white/35">
                Our due diligence engine connects to multiple public record
                services and third-party sources to retrieve, validate, and
                organize comprehensive property information — with built-in
                reliability and automatic retry mechanisms.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Ownership & Title', 'Trace recorded ownership, title transfers, liens, encumbrances, and supporting legal documentation from public land registries.'],
              ['Tax & Assessment', 'Access complete tax payment records, assessed valuations, outstanding liabilities, and historical assessment trends.'],
              ['Zoning & Permits', 'Confirm zoning designations, permitted uses, building permit history, code compliance, and open or expired permits.'],
              ['Flood & Environment', 'Surface flood zone classifications, environmental hazard reports, contamination history, and remediation status.'],
              ['Market & Comparables', 'Compare nearby listings, price per square foot, market movement, and property value history in the surrounding area.'],
              ['Utility & Infrastructure', 'Verify utility availability and providers — water, sewer, electric, gas, and internet — for complete evaluation.'],
            ].map(([title, text], i) => (
              <div
                key={title}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-12 text-xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
            HOW IT WORKS
          </p>
          <h2 className="mt-5 max-w-3xl text-3xl font-light tracking-tight md:text-5xl">
            From address to actionable insight — in four steps.
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-4">
            {[
              ['01', 'Search', 'Enter and validate any property address with real-time autocomplete and geographic resolution.'],
              ['02', 'Collect', 'We automatically aggregate ownership, tax, zoning, permit, flood, and environmental records from verified sources.'],
              ['03', 'Assess', 'Our risk engine analyzes the data and surfaces clear, configurable risk indicators across every dimension.'],
              ['04', 'Decide', 'Receive a comprehensive due diligence report — complete with scores, timelines, and exportable documentation.'],
            ].map(([num, title, text]) => (
              <div
                key={num}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-9"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {num}
                </p>
                <h3 className="mt-14 text-2xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── RISK INTELLIGENCE ── */}
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                RISK INTELLIGENCE
              </p>
              <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                Know what needs attention{' '}
                <span className="text-white/35">before it costs time.</span>
              </h2>
              <p className="mt-8 text-sm leading-7 text-white/35">
                Our risk assessment engine transforms raw property data into
                actionable intelligence. Every indicator is configurable,
                traceable to its source, and presented as a clear signal — not
                noise.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                ['LEGAL', 'Ownership verification gaps, unresolved liens, title defects, missing documentation, and litigation history.'],
                ['FINANCIAL', 'Outstanding tax amounts, delinquency history, assessment appeal outcomes, and projected tax burden.'],
                ['ENVIRONMENTAL', 'Flood zone classification, proximity to water bodies, contamination records, and mandatory insurance.'],
                ['COMPLIANCE', 'Open or expired permits, unpermitted modifications, zoning conflicts, and certificate of occupancy status.'],
                ['OWNERSHIP', 'Chain of title integrity, identity verification, power of attorney checks, and entity ownership confirmation.'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
                >
                  <p className="text-xs tracking-[0.2em] text-white/25">
                    {label}
                  </p>
                  <p className="mt-4 text-sm font-medium leading-6 text-white/70">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── REPORTING ── */}
      <section className="border-y border-white/10 bg-white/[0.02] px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                REPORTING
              </p>
              <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                Reports built for{' '}
                <span className="text-white/35">confident decisions.</span>
              </h2>
            </div>
            <div className="flex items-end">
              <p className="max-w-lg text-sm leading-7 text-white/35">
                Every report includes a structured executive summary,
                composite risk score, chronological property timeline, and
                full source documentation — ready to share as PDF or Excel.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Executive Summary', 'A clear overview highlighting key findings, risk score, and recommended next steps for every stakeholder.'],
              ['Risk Score', 'A composite score calculated from legal, financial, environmental, and compliance indicators — with configurable weighting.'],
              ['Property Timeline', 'A chronological view of ownership changes, permits, tax events, and other recorded milestones.'],
              ['Source Documentation', 'All source records organized and linked within the report for full traceability and defensibility.'],
              ['PDF Export', 'Professionally formatted, print-ready reports for sharing with clients, stakeholders, and legal teams.'],
              ['Excel Export', 'Structured data export for analysts and institutions who need raw data for modeling and integration.'],
            ].map(([title, text], i) => (
              <div
                key={title}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-12 text-xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MONITORING & ALERTS ── */}
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                MONITORING &amp; ALERTS
              </p>
              <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                Stay informed,{' '}
                <span className="text-white/35">effortlessly.</span>
              </h2>
            </div>
            <div className="flex items-end">
              <p className="max-w-lg text-sm leading-7 text-white/35">
                No critical property update goes unnoticed — from completed
                reports to ownership changes, delivered through in-app alerts,
                email, and scheduled monitoring.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2">
            {[
              ['Instant Report Alerts', 'Get notified the moment a due diligence report is ready for review — in-app and via email.'],
              ['Property Change Tracking', 'Automated alerts when monitored properties have new records, ownership changes, or risk updates.'],
              ['Email Digest', 'Configurable email delivery for report completions, scheduled summaries, and administrative alerts.'],
              ['Scheduled Monitoring', 'Set recurring checks — daily, weekly, or monthly — to track changes over time without manual effort.'],
            ].map(([title, text], i) => (
              <div
                key={title}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-10 text-2xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRANSPARENCY & COMPLIANCE ── */}
      <section className="border-t border-white/10 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
              TRANSPARENCY &amp; COMPLIANCE
            </p>
            <h2 className="mt-7 max-w-4xl text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
              Full accountability,{' '}
              <span className="text-white/35">at every step.</span>
            </h2>
            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/35">
              Every action, data request, report generation, and user session
              is logged — providing a complete, tamper-evident audit trail for
              regulatory compliance and internal review.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Activity Logs', 'Complete record of every search, report, and action across the platform.'],
              ['Data Source Logs', 'Detailed tracking of every external request, response, and retry attempt.'],
              ['Report History', 'Version-controlled archive of all generated reports with full metadata.'],
              ['User Analytics', 'Per-user activity summaries, session history, and role-based access tracking.'],
            ].map(([title, text], i) => (
              <div
                key={title}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-12 text-xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px] rounded-2xl border border-white/10 bg-white/[0.025] p-8 md:p-12">
          <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
            WHO IT&apos;S FOR
          </p>
          <h2 className="mt-5 text-3xl font-light tracking-tight md:text-4xl">
            Built for every stakeholder in the transaction.
          </h2>

          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <h3 className="text-xl font-medium text-white">
                Buyers &amp; Investors
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                Move from initial interest to informed offer with ownership,
                tax, zoning, flood risk, and market data — all in one view.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">
                Real Estate Agents
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                Bring source-backed intelligence to every client conversation.
                Access due diligence reports instantly to build trust and close
                faster.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">Legal Teams</h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                Focus on the records, documents, and exceptions that matter.
                Every finding is traceable to its source with full audit
                support.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">
                Banks &amp; Lenders
              </h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                Standardize property evaluation with configurable risk scores,
                version-controlled reports, and compliance-ready documentation.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-white">Administrators</h3>
              <p className="mt-3 text-sm leading-7 text-white/40">
                Manage users, roles, and configurations. Monitor platform
                health with dashboards, activity logs, and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY PROPDUE ── */}
      <section className="border-t border-white/10 px-6 py-24 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                WHY PROPDUE
              </p>
              <h2 className="mt-7 text-4xl font-light leading-[0.95] tracking-[-0.04em] md:text-6xl">
                What sets us <span className="text-white/35">apart.</span>
              </h2>
            </div>
            <div className="flex items-end">
              <p className="max-w-lg text-sm leading-7 text-white/35">
                From centralized research to secure cloud infrastructure —
                PropDue is designed to transform how professionals evaluate
                properties at every stage of a transaction.
              </p>
            </div>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['One Platform', 'A single hub for all property due diligence — no more switching between fragmented tools and scattered data sources.'],
              ['Secure by Design', 'Role-based access with enterprise-grade authentication — every user sees exactly what they need, nothing more.'],
              ['Automated Workflows', 'From address search to report delivery, every step is automated, repeatable, and fully auditable.'],
              ['Multi-Source Data', 'Ownership, tax, permits, zoning, flood zones, and environmental records — pulled from verified external services.'],
              ['Actionable Reports', 'Executive summaries, risk scores, timelines, and supporting documents — exportable as PDF or Excel.'],
              ['Market Context', 'Comparable analysis with pricing intelligence, market trends, and value history from the surrounding area.'],
              ['Proactive Monitoring', 'Configurable dashboards and alerts for ongoing property risk monitoring and scheduled checks.'],
              ['Cloud Infrastructure', 'Containerized and deployed on enterprise cloud with CI/CD pipelines and high-availability architecture.'],
            ].map(([title, text], i) => (
              <div
                key={title}
                className="bg-[rgba(10,14,22,0.95)] p-8 md:p-10"
              >
                <p className="text-xs tracking-[0.25em] text-white/25">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-12 text-xl font-medium text-white">
                  {title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/40">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section
        id="contact"
        className="scroll-mt-[72px] border-t border-white/10 px-6 py-24 sm:px-10 md:px-16 lg:px-24"
      >
        <div className="mx-auto max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-24">
            <div>
              <p className="text-xs font-semibold tracking-[0.35em] text-white/30">
                GET IN TOUCH
              </p>

              <h2 className="mt-7 text-4xl font-light leading-[0.98] tracking-[-0.05em] md:text-6xl">
                Make your next property decision{' '}
                <span className="text-white/35">clearer.</span>
              </h2>

              <p className="mt-7 max-w-lg text-sm leading-7 text-white/45">
                Tell us what you’re working on. Whether you’re evaluating a
                property, supporting clients, or exploring PropDue for your
                organization, our team is ready to help.
              </p>

              <div className="mt-10 space-y-6">
                <div>
                  <p className="text-xs tracking-[0.2em] text-white/30">
                    EMAIL
                  </p>
                  <a
                    href="mailto:hello@propdue.com"
                    className="mt-2 inline-block text-sm text-white/75 transition hover:text-white"
                  >
                    hello@propdue.com
                  </a>
                </div>

                <div>
                  <p className="text-xs tracking-[0.2em] text-white/30">
                    RESPONSE TIME
                  </p>
                  <p className="mt-2 text-sm text-white/60">
                    Within one business day
                  </p>
                </div>
              </div>
            </div>

            <form
              action="mailto:hello@propdue.com"
              method="post"
              encType="text/plain"
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
            >
              <h3 className="text-xl font-medium text-white">
                Send us a message
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Share a few details and we’ll get back to you.
              </p>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm text-white/65"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    name="Full name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm text-white/65"
                  >
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    name="Email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    className="w-full rounded-lg border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-company"
                    className="mb-2 block text-sm text-white/65"
                  >
                    Company
                  </label>
                  <input
                    id="contact-company"
                    name="Company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Company name"
                    className="w-full rounded-lg border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-400/70"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-interest"
                    className="mb-2 block text-sm text-white/65"
                  >
                    I’m interested in
                  </label>
                  <select
                    id="contact-interest"
                    name="Topic"
                    defaultValue=""
                    className="w-full rounded-lg border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/70"
                  >
                    <option value="" disabled>
                      Choose a topic
                    </option>
                    <option>Property due diligence</option>
                    <option>Business or enterprise</option>
                    <option>Partnerships</option>
                    <option>General inquiry</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm text-white/65"
                  >
                    How can we help?
                  </label>
                  <textarea
                    id="contact-message"
                    name="Message"
                    rows={5}
                    placeholder="Tell us a little about what you need…"
                    required
                    className="w-full resize-y rounded-lg border border-white/10 bg-[#0a0f19] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/30 focus:border-blue-400/70"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#101722] transition hover:bg-blue-100"
              >
                Send message <span aria-hidden="true">→</span>
              </button>

              <p className="mt-4 text-xs leading-5 text-white/35">
                Submitting opens your email app to send the message.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/10 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs text-white/25 md:flex-row">
          <span>PROPDUE</span>
          <span>AUTONOMOUS PROPERTY RISK INTELLIGENCE</span>
        </div>
      </footer>
    </div>
  )
}