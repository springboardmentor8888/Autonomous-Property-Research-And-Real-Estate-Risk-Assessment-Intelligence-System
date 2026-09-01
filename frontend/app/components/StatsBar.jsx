'use client'

import { useState, useEffect, useRef } from 'react'

const STATS = [
  { id: 'stat1', num: 50,  suffix: 'K+',  label: 'Properties Analyzed'   },
  { id: 'stat2', num: 98,  suffix: '%',   label: 'Data Accuracy'          },
  { id: 'stat3', num: 200, suffix: '+',   label: 'Institutional Clients'  },
  { id: 'stat4', num: 15,  suffix: ' min',label: 'Avg. Report Time'       },
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
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target])

  return <>{count}{suffix}</>
}

export default function StatsBar() {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.4 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      id="stats-bar"
      ref={ref}
      className="relative z-10 bg-[rgba(10,16,28,0.80)] backdrop-blur-xl border-t border-white/10 py-7"
    >
      <div className="max-w-[1000px] mx-auto px-10 flex flex-wrap items-center justify-between gap-6">
        {STATS.map((stat, i) => (
          <div key={stat.id} className="flex items-center gap-6 flex-1 min-w-[120px]">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span
                id={stat.id}
                className="text-[28px] font-semibold text-white tracking-tight leading-none"
              >
                {visible ? <Counter target={stat.num} suffix={stat.suffix} /> : `0${stat.suffix}`}
              </span>
              <span className="text-xs text-white/50 tracking-wide text-center">
                {stat.label}
              </span>
            </div>
            {i < STATS.length - 1 && (
              <div className="hidden sm:block w-px h-10 bg-white/20 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
