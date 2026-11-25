'use client'

import { useState, useEffect, useRef } from 'react'

const STATS = [
  { id: 'stat1', num: 50, suffix: 'K+', label: 'Properties Analyzed' },
  { id: 'stat2', num: 98, suffix: '%', label: 'Data Accuracy' },
  { id: 'stat3', num: 200, suffix: '+', label: 'Institutional Clients' },
  { id: 'stat4', num: 15, suffix: ' min', label: 'Avg. Report Time' },
]

function Counter({ target, suffix }) {
  const [count, setCount] = useState(0)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const duration = 1800
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target])

  return <>{count}{suffix}</>
}

export default function StatsBar() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.4 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="stats-bar"
      ref={ref}
      className="relative z-10 border-y border-white/25 bg-white/[0.12] py-7 shadow-[0_18px_55px_-25px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center justify-between gap-6 px-6 sm:px-10">
        {STATS.map((stat, index) => (
          <div
            key={stat.id}
            className="flex min-w-[120px] flex-1 items-center gap-6"
          >
            <div className="flex flex-1 flex-col items-center gap-2 text-center">
              <span
                id={stat.id}
                className="text-[28px] font-semibold leading-none tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.2)] sm:text-[30px]"
              >
                {visible ? (
                  <Counter target={stat.num} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </span>
              <span className="text-center text-xs font-medium tracking-wide text-white/75 sm:text-sm">
                {stat.label}
              </span>
            </div>

            {index < STATS.length - 1 && (
              <div
                aria-hidden="true"
                className="hidden h-10 w-px flex-shrink-0 bg-white/25 sm:block"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
