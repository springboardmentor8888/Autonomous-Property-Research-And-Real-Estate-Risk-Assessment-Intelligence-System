'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative z-10 min-h-screen flex flex-col justify-center items-start
                 px-20 pt-[132px] pb-[120px]
                 max-md:px-7 max-md:items-center max-md:text-center"
    >
      <div className="max-w-[680px]">

        {/* Eyebrow */}
        <p
          id="hero-eyebrow"
          className="text-[12px] font-medium tracking-[0.18em] uppercase text-accent
                     mb-5 opacity-0 animate-fade-up-1"
        >
          Enterprise Real Estate Intelligence
        </p>

        {/* Headline */}
        <h1
          id="hero-headline"
          className="text-[clamp(44px,6vw,80px)] font-light leading-[1.08] tracking-[-1.5px]
                     text-white mb-6 opacity-0 animate-fade-up-2"
        >
          Your Complete<br />
          <span className="font-semibold relative inline-block headline-accent">
            Due Diligence
          </span><br />
          Partner
        </h1>

        {/* Subheading */}
        <p
          id="hero-sub"
          className="text-base font-normal leading-[1.7] text-white/70
                     mb-10 opacity-0 animate-fade-up-3"
        >
          Automated property evaluation across ownership records, tax history,
          zoning regulations, flood zones, permits, and environmental data.
        </p>

        {/* CTA Buttons */}
        <div
          id="hero-cta"
          className="flex gap-4 flex-wrap opacity-0 animate-fade-up-4 max-md:justify-center"
        >
          <Link
            href="#property-search"
            id="cta-search"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium
                       rounded-lg text-white bg-accent border border-accent tracking-wide
                       hover:bg-accent-hover hover:border-accent-hover hover:-translate-y-0.5
                       hover:shadow-[0_8px_30px_rgba(79,156,249,0.35)] transition-all duration-300"
          >
            Search a Property
          </Link>
          <Link
            href="/login"
            id="cta-learn"
            className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-medium
                       rounded-lg text-white bg-white/10 border border-white/20 backdrop-blur-sm
                       tracking-wide hover:bg-white/20 hover:border-white/50 hover:-translate-y-0.5
                       transition-all duration-300"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Scroll hint */}
      <div
        id="scroll-hint"
        className="absolute bottom-10 left-1/2 -translate-x-1/2
                   flex flex-col items-center gap-2 opacity-0 animate-fade-in-5"
        aria-hidden="true"
      >
        <div className="w-px h-[50px] bg-gradient-to-b from-transparent via-white/50 to-transparent animate-scroll-pulse" />
        <span className="text-[10px] tracking-[0.15em] uppercase text-white/50">Scroll</span>
      </div>
    </section>
  )
}
