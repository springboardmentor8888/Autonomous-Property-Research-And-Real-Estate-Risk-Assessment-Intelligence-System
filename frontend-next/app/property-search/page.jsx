'use client'

import { useState } from 'react'

const BASE_URL = '/api'
const MAX_RECENT_PROPERTIES = 20

/*
  Palette (from the reference image)
  white   #FFFFFF
  orchid  #D174D2   -> accents, labels, focus
  ember   #E0563F   -> primary buttons
  slate   #3F567F   -> gradient start, cards
  plum    #412653   -> main background
  night   #2B1740   -> deeper plum for inputs / depth (darker shade of plum)
*/

const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT = "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

function getHistoryKey() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    const identity = user?.id ?? user?.email ?? 'guest'
    return `propdue:recent-properties:${String(identity).toLowerCase()}`
  } catch {
    return 'propdue:recent-properties:guest'
  }
}

function savePropertyToHistory(property) {
  const key = getHistoryKey()
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  const list = Array.isArray(existing) ? existing : []

  const updatedProperty = {
    ...property,
    searchedAt: new Date().toISOString(),
  }

  const isSameProperty = (item) => {
    if (updatedProperty.propertyId != null && item.propertyId != null) {
      return String(item.propertyId) === String(updatedProperty.propertyId)
    }

    return (
      String(item.formattedAddress || '').trim().toLowerCase() ===
      String(updatedProperty.formattedAddress || '').trim().toLowerCase()
    )
  }

  const updatedList = [
    updatedProperty,
    ...list.filter((item) => !isSameProperty(item)),
  ].slice(0, MAX_RECENT_PROPERTIES)

  localStorage.setItem(key, JSON.stringify(updatedList))
  sessionStorage.setItem('selectedProperty', JSON.stringify(updatedProperty))

  window.dispatchEvent(new Event('property-history-updated'))
}

export default function PropertySearchPage() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleSearch(event) {
    event.preventDefault()
    setError('')
    setResult(null)

    const cleanAddress = address.trim()

    if (!cleanAddress) {
      setError('Please enter a property address.')
      return
    }

    if (cleanAddress.length < 3) {
      setError('Please enter a valid property address.')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('token')

      const response = await fetch(
        `${BASE_URL}/properties/search?address=${encodeURIComponent(cleanAddress)}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token
              ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, '').trim()}` }
              : {}),
          },
          cache: 'no-store',
        }
      )

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(
          data?.message ||
          data?.error?.message ||
          `Search failed (${response.status})`
        )
      }

      const properties = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : []

      if (properties.length === 0) {
        throw new Error('No matching property found.')
      }

      const property = properties[0]

      const propertyResult = {
        formattedAddress: property.address || cleanAddress,
        city: property.city || 'Not available',
        state: property.state || 'Not available',
        postalCode: property.zipCode || property.zip_code || 'Not available',
        latitude: property.latitude ?? property.lat ?? null,
        longitude: property.longitude ?? property.lng ?? null,
        propertyId: property.id ?? null,
        propertyType:
          property.propertyType || property.property_type || 'Not available',
      }

      savePropertyToHistory(propertyResult)
      setResult(propertyResult)
    } catch (searchError) {
      console.error('Property search error:', searchError)
      setError(searchError.message || 'Unable to search for this property.')
    } finally {
      setLoading(false)
    }
  }

  const mapUrl =
    result?.latitude != null && result?.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=17/${result.latitude}/${result.longitude}`
      : result
        ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(result.formattedAddress)}`
        : '#'

  return (
    <main
      className="min-h-screen text-white selection:bg-[#D174D2]/40"
      style={{ fontFamily: BODY_FONT }}
    >
      {/* Fonts: Syne (wide display) + Red Hat Display (body). Falls back gracefully offline. */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]">
        <div className="absolute -left-40 bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#E0563F]/25 blur-[160px]" />
      </div>

      {/* HEADER */}
      <section className="relative overflow-hidden border-b border-white/15 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-24">
        <div className="relative mx-auto max-w-[1400px]">
          <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            <span className="h-2 w-2 rounded-full bg-[#D174D2]" />
            Property search
          </p>

          <h1
            className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Start with
            <br />
            <span className="text-[#D174D2]">the address.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
            Enter a property address to find matching records in your
            database and begin the due-diligence journey.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <form
            onSubmit={handleSearch}
            className="rounded-2xl border border-white/20 bg-white/[0.09] p-6 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-8"
          >
            <label
              htmlFor="property-address"
              className="mb-4 block text-sm font-semibold text-white"
            >
              Property address
            </label>

            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                id="property-address"
                type="text"
                value={address}
                onChange={(event) => {
                  setAddress(event.target.value)
                  setError('')
                  setResult(null)
                }}
                placeholder="Enter a property address"
                autoComplete="street-address"
                className="min-h-[62px] flex-1 rounded-xl border border-white/25 bg-[#2B1740]/70 px-5 text-base text-white outline-none transition placeholder:text-white/45 focus:border-[#D174D2] focus:ring-4 focus:ring-[#D174D2]/30"
              />

              <button
                type="submit"
                disabled={loading}
                className="min-h-[62px] rounded-xl bg-[#E0563F] px-8 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    Search property
                    <span className="text-lg">→</span>
                  </span>
                )}
              </button>
            </div>

            {error && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-[#E0563F]/60 bg-[#E0563F]/20 px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E0563F] text-lg font-bold text-white">
                  !
                </span>
                <p role="alert" className="text-base font-semibold leading-7 text-white md:text-lg">
                  {error}
                </p>
              </div>
            )}

            {result && (
              <div className="mt-6 flex items-center gap-4 rounded-xl border border-emerald-300/50 bg-emerald-400/15 px-6 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400 text-lg font-bold text-[#2B1740]">
                  ✓
                </span>
                <p role="status" className="text-base font-semibold leading-7 text-white md:text-lg">
                  Property found.
                </p>
              </div>
            )}
          </form>
        </div>
      </section>

      {!result && !loading && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto grid max-w-[1400px] gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 md:grid-cols-3">
            <InfoBlock
              number="1"
              title="Enter an address"
              text="Enter the address of a property stored in your database."
            />
            <InfoBlock
              number="2"
              title="Search database"
              text="The backend searches your existing property records for matching addresses."
            />
            <InfoBlock
              number="3"
              title="Begin due diligence"
              text="View the matching property details and continue to the next research stage."
            />
          </div>
        </section>
      )}

      {loading && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px] border-t border-white/15 pt-16">
            <div className="flex items-center gap-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#D174D2]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  Searching property records...
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Retrieving matching records from your database.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {result && (
        <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="border-t border-white/15 pt-16">
              <h2
                className="mt-6 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {result.formattedAddress}
              </h2>
            </div>

            <div className="mt-16">
              <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                Property details
              </p>
              <div className="grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
                <DetailCard label="Property ID" value={result.propertyId ?? 'Not available'} />
                <DetailCard label="Property type" value={result.propertyType} />
                <DetailCard label="City" value={result.city} />
                <DetailCard label="State" value={result.state} />
                <DetailCard
                  label="Postal code"
                  value={result.postalCode}
                  className="sm:col-span-2 lg:col-span-2"
                />
              </div>
            </div>

            <div className="mt-16">
              <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                Property location
              </p>
              <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                <p className="text-sm font-medium text-white/70">
                  Map location
                </p>
                <p className="mt-4 break-words text-lg text-white">
                  {result.formattedAddress}
                </p>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#412653] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                >
                  Open map <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* OWNERSHIP SECTION */}
      <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#3F567F]/80 via-[#412653]/80 to-[#2B1740]/90 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-12 lg:p-14">
            <div className="relative">
              <p className="text-sm font-semibold text-[#D174D2]">
                Next research stage
              </p>
              <h2
                className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Land registry &amp; ownership records
              </h2>
              <p className="mt-5 max-w-4xl text-base leading-8 text-white/80 md:text-lg">
                Review public land registry information, ownership records,
                property ownership details, and available registry information
                associated with the property.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="/ownership"
                  className="inline-flex items-center justify-center gap-4 rounded-full bg-[#E0563F] px-9 py-5 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition duration-200 hover:bg-[#c94a34] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  View ownership records <span className="text-xl">→</span>
                </a>
                <a
                  href="/property-search"
                  className="inline-flex items-center justify-center gap-4 rounded-full border border-white/50 bg-white/10 px-9 py-5 text-sm font-semibold text-white transition duration-200 hover:bg-white hover:text-[#412653] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                >
                  Property search <span className="text-xl">←</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
          <span>PROP DUE</span>
          <span>Property due diligence platform</span>
        </div>
      </footer>
    </main>
  )
}

function InfoBlock({ number, title, text }) {
  return (
    <div className="bg-[#341D47] p-8 transition-colors hover:bg-[#3b2452] md:p-10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D174D2] text-base font-bold text-[#D174D2]">
        {number}
      </span>
      <h3
        className="mt-10 text-xl font-bold text-white"
        style={{ fontFamily: DISPLAY_FONT }}
      >
        {title}
      </h3>
      <p className="mt-4 text-sm leading-7 text-white/75">{text}</p>
    </div>
  )
}

function DetailCard({ label, value, className = '' }) {
  return (
    <div className={`bg-[#341D47] p-6 ${className}`}>
      <p className="text-sm text-white/65">{label}</p>
      <p className="mt-3 break-words text-base font-semibold text-white">
        {value}
      </p>
    </div>
  )
}