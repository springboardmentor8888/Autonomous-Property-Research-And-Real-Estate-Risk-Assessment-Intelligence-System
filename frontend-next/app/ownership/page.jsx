'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  UserRound,
  FileText,
  Clock3,
} from 'lucide-react'

const API_URL = 'http://localhost:8080/api'
const DISPLAY_FONT = "'Syne', 'Arial Black', system-ui, sans-serif"
const BODY_FONT = "'Red Hat Display', system-ui, -apple-system, 'Segoe UI', sans-serif"

export default function OwnershipPage() {
  const [property, setProperty] = useState(null)
  const [ownershipHistory, setOwnershipHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOwnership() {
      try {
        setLoading(true)
        setError('')

        const savedProperty = sessionStorage.getItem('selectedProperty')

        if (!savedProperty) {
          throw new Error(
            'No property selected. Please search for a property first.'
          )
        }

        const selected = JSON.parse(savedProperty)
        setProperty(selected)

        const rawId =
          selected.propertyDbId ??
          selected.id ??
          selected.propertyId

        if (
          rawId === null ||
          rawId === undefined ||
          !/^\d+$/.test(String(rawId))
        ) {
          throw new Error(
            'A valid numeric property database ID was not found. Please select a property from Property Search.'
          )
        }

        const token = localStorage.getItem('token')

        if (!token) {
          throw new Error(
            'Authentication token not found. Please log in again.'
          )
        }

        const response = await fetch(`${API_URL}/properties/${rawId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json().catch(() => null)

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              '401 Unauthorized. Your login token may be invalid or expired. Please log in again.'
            )
          }

          if (response.status === 403) {
            throw new Error(
              '403 Forbidden. You do not have permission to view these records.'
            )
          }

          throw new Error(
            data?.message ||
            data?.error?.message ||
            `Unable to load ownership records. Server returned ${response.status}.`
          )
        }

        const details = data?.data ?? data
        let history = []

        if (Array.isArray(details?.ownershipHistory)) {
          history = details.ownershipHistory
        } else if (Array.isArray(details?.ownership)) {
          history = details.ownership
        } else if (
          details?.ownership &&
          typeof details.ownership === 'object'
        ) {
          history = [details.ownership]
        }

        history = history
          .filter(Boolean)
          .map((record) => ({
            ...record,
            ownerName:
              record.ownerName ??
              record.owner ??
              record.name ??
              '',
            acquiredDate:
              record.acquiredDate ??
              record.acquisitionDate ??
              null,
            transferDate:
              record.transferDate ??
              record.transferredDate ??
              null,
            id: record.id ?? record.recordId ?? null,
          }))

        history.sort((a, b) =>
          (a?.acquiredDate || '').localeCompare(b?.acquiredDate || '')
        )

        setOwnershipHistory(history)
      } catch (err) {
        console.error('Ownership loading error:', err)
        setError(err.message || 'Unable to load ownership records.')
      } finally {
        setLoading(false)
      }
    }

    loadOwnership()
  }, [])

  const address =
    property?.formattedAddress ||
    property?.address ||
    'Property Address'

  const mapUrl =
    property?.latitude != null && property?.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${property.latitude}&mlon=${property.longitude}#map=17/${property.latitude}/${property.longitude}`
      : `https://www.openstreetmap.org/search?query=${encodeURIComponent(address)}`

  const sortedOwnershipHistory = [...ownershipHistory].sort((a, b) =>
    (a?.acquiredDate || '').localeCompare(b?.acquiredDate || '')
  )

  const recordsWithoutTransferDate = sortedOwnershipHistory.filter(
    (record) => record?.transferDate == null
  )

  let currentOwner = null

  if (recordsWithoutTransferDate.length > 0) {
    currentOwner =
      recordsWithoutTransferDate[recordsWithoutTransferDate.length - 1]
  } else if (sortedOwnershipHistory.length > 0) {
    currentOwner =
      sortedOwnershipHistory[sortedOwnershipHistory.length - 1]
  }

  const hasTransferDates = sortedOwnershipHistory.some(
    (record) => record?.transferDate != null
  )

  const previousOwners =
    currentOwner == null
      ? []
      : sortedOwnershipHistory.filter((record) => record !== currentOwner)

  const inferredPreviousOwners =
    !hasTransferDates && previousOwners.length > 0

  return (
    <main
      className="min-h-screen text-white selection:bg-[#D174D2]/40"
      style={{ fontFamily: BODY_FONT }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');`}</style>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[linear-gradient(135deg,#3F567F_0%,#412653_50%,#2B1740_100%)]">
        <div className="absolute -left-40 bottom-[-10%] h-[600px] w-[600px] rounded-full bg-[#E0563F]/25 blur-[160px]" />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/15 px-6 pb-24 pt-32 sm:px-10 md:px-16 lg:px-24">
        <div className="relative mx-auto max-w-[1400px]">
          <Link
            href="/property-search"
            className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Property Search
          </Link>

          <p className="mb-8 mt-16 block w-fit rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#D174D2]" />
            Ownership / Land registry
          </p>

          <h1
            className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-[-0.02em] text-white"
            style={{ fontFamily: DISPLAY_FONT }}
          >
            Verify
            <br />
            <span className="text-[#D174D2]">ownership.</span>
          </h1>

          <p className="mt-10 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
            Review current and previous ownership information and available
            registry records for the selected property.
          </p>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px] border-t border-white/15 pt-16">
            <div className="flex items-center gap-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-[#D174D2]" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  Loading ownership records...
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Retrieving registry information for the selected property.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Error */}
      {error && !loading && (
        <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
          <div className="mx-auto max-w-[1400px] rounded-2xl border border-[#E0563F]/60 bg-[#E0563F]/15 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              Ownership records unavailable
            </h2>

            <p className="mt-4 text-base leading-7 text-white/80">{error}</p>

            <Link
              href="/property-search"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#E0563F] px-7 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
            >
              <ArrowLeft size={16} />
              Go to Property Search
            </Link>
          </div>
        </section>
      )}

      {!loading && !error && property && (
        <>
          {/* Property overview */}
          <section className="px-6 py-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#D174D2]" />
                <span className="text-sm font-semibold text-[#D174D2]">
                  Selected property
                </span>
              </div>

              <h2
                className="mt-6 max-w-5xl text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                {address}
              </h2>

              <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-4">
                <DetailCard label="City" value={property.city} />
                <DetailCard label="State" value={property.state} />
                <DetailCard
                  label="Postal code"
                  value={property.postalCode ?? property.zipCode}
                />
                <DetailCard
                  label="Property ID"
                  value={
                    property.propertyDbId ??
                    property.id ??
                    property.propertyId
                  }
                />
              </div>
            </div>
          </section>

          {/* Ownership records */}
          <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                Ownership records
              </p>

              {ownershipHistory.length === 0 ? (
                <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                  <ShieldCheck size={28} className="text-[#D174D2]" />
                  <h3
                    className="mt-5 text-2xl font-bold text-white"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    No ownership data available
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    The backend did not return ownership information for this
                    property.
                  </p>
                </div>
              ) : (
                <>
                  {/* Current owner */}
                  <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-10">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <UserRound size={20} className="text-[#D174D2]" />
                        <p className="text-sm font-semibold text-[#D174D2]">
                          Current owner
                        </p>
                      </div>
                      <span className="rounded-full border border-[#D174D2]/50 bg-[#D174D2]/10 px-4 py-2 text-xs font-semibold text-white">
                        Current
                      </span>
                    </div>

                    <h3
                      className="mt-5 break-words text-2xl font-bold text-white md:text-4xl"
                      style={{ fontFamily: DISPLAY_FONT }}
                    >
                      {currentOwner?.ownerName ||
                        currentOwner?.owner ||
                        currentOwner?.name ||
                        'Not available'}
                    </h3>

                    <p className="mt-4 text-sm text-white/70">
                      Current ownership information returned by the backend.
                    </p>

                    <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-white/20 bg-white/20 sm:grid-cols-2 lg:grid-cols-3">
                      <DetailCard
                        label="Acquired date"
                        value={currentOwner?.acquiredDate}
                      />
                      <DetailCard
                        label="Transfer date"
                        value={currentOwner?.transferDate ?? 'Current owner'}
                      />
                      <DetailCard label="Record ID" value={currentOwner?.id} />
                    </div>
                  </div>

                  {/* Ownership timeline */}
                  <div className="mt-16">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#D174D2]">
                          Ownership timeline
                        </p>
                        <h2
                          className="mt-4 text-3xl font-extrabold text-white md:text-4xl"
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          Previous owners
                        </h2>
                      </div>

                      <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/80">
                        {previousOwners.length}{' '}
                        {previousOwners.length === 1
                          ? 'Previous owner'
                          : 'Previous owners'}
                      </span>
                    </div>

                    {inferredPreviousOwners && (
                      <p className="mt-6 rounded-xl border border-[#D174D2]/30 bg-[#D174D2]/10 px-5 py-4 text-sm leading-6 text-white/80">
                        Transfer dates were not provided. Previous owners are
                        shown based on acquisition dates and should be verified
                        with the backend records.
                      </p>
                    )}

                    {previousOwners.length === 0 ? (
                      <div className="mt-8 rounded-2xl border border-white/20 bg-white/[0.09] p-8">
                        <p className="text-lg font-semibold text-white">
                          No previous ownership records found.
                        </p>
                        <p className="mt-3 text-sm leading-7 text-white/70">
                          No earlier ownership records could be identified.
                        </p>
                      </div>
                    ) : (
                      <div className="mt-8 space-y-5">
                        {previousOwners.map((owner, index) => (
                          <div
                            key={
                              owner.id ??
                              `${owner.ownerName}-${owner.acquiredDate}-${index}`
                            }
                            className="rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-[#D174D2]/50 md:p-9"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10">
                                  <UserRound
                                    size={18}
                                    className="text-[#D174D2]"
                                  />
                                </div>
                                <span className="text-sm font-semibold text-[#D174D2]">
                                  Previous owner {index + 1}
                                </span>
                              </div>
                              <span className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs text-white/75">
                                Ownership ended
                              </span>
                            </div>

                            <h3
                              className="mt-6 break-words text-2xl font-bold text-white md:text-3xl"
                              style={{ fontFamily: DISPLAY_FONT }}
                            >
                              {owner.ownerName ||
                                owner.owner ||
                                owner.name ||
                                'Not available'}
                            </h3>

                            {/* Two-column grid fills the row when there is no transfer date. */}
                            <div className="mt-8 grid gap-px overflow-hidden rounded-xl border border-white/20 bg-white/20 sm:grid-cols-2">
                              <DetailCard
                                label="Acquired date"
                                value={owner.acquiredDate}
                              />
                              {owner.transferDate != null &&
                                owner.transferDate !== '' && (
                                  <DetailCard
                                    label="Transfer date"
                                    value={owner.transferDate}
                                  />
                                )}
                              <DetailCard label="Record ID" value={owner.id} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Record summary */}
                  <div className="mt-16 rounded-2xl border border-white/20 bg-white/[0.09] p-7 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl md:p-9">
                    <div className="flex items-center gap-3">
                      <Clock3 size={20} className="text-[#D174D2]" />
                      <p className="text-sm font-semibold text-[#D174D2]">
                        Record summary
                      </p>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm text-white/70">
                          Total ownership records
                        </p>
                        <p
                          className="mt-3 text-4xl font-bold text-white"
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {ownershipHistory.length}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-white/70">
                          Previous owners
                        </p>
                        <p
                          className="mt-3 text-4xl font-bold text-white"
                          style={{ fontFamily: DISPLAY_FONT }}
                        >
                          {previousOwners.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Property location */}
          <section className="px-6 pb-16 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <p className="mb-6 text-sm font-semibold text-[#D174D2]">
                Property location
              </p>

              <div className="rounded-2xl border border-white/20 bg-white/[0.09] p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] backdrop-blur-xl transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-10">
                <p className="text-sm font-medium text-white/70">
                  Map location
                </p>
                <p className="mt-4 break-words text-lg text-white">
                  {address}
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
          </section>

          {/* Next research stage */}
          <section className="px-6 pb-32 sm:px-10 md:px-16 lg:px-24">
            <div className="mx-auto max-w-[1400px]">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-[#3F567F]/80 via-[#412653]/80 to-[#2B1740]/90 p-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] transition duration-300 hover:shadow-[0_0_35px_rgba(43,23,64,0.75),0_20px_60px_-20px_rgba(0,0,0,0.5)] md:p-12 lg:p-14">
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[#D174D2]" />
                    <p className="text-sm font-semibold text-[#D174D2]">
                      Next research stage
                    </p>
                  </div>

                  <h2
                    className="mt-5 text-3xl font-extrabold text-white md:text-5xl"
                    style={{ fontFamily: DISPLAY_FONT }}
                  >
                    Tax history &amp; property records
                  </h2>

                  <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
                    Review historical property tax assessments, tax amounts,
                    payment status, and changes across previous tax years.
                  </p>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                    <Link
                      href="/tax-history"
                      className="inline-flex items-center justify-center gap-3 rounded-full bg-[#E0563F] px-8 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-8px_rgba(224,86,63,0.7)] transition hover:bg-[#c94a34] focus-visible:ring-4 focus-visible:ring-white/40"
                    >
                      Go to Tax History <span className="text-lg">→</span>
                    </Link>

                    <Link
                      href="/property-search"
                      className="inline-flex items-center justify-center gap-3 rounded-full border border-white/50 bg-white/10 px-8 py-4 text-sm font-semibold text-white transition hover:bg-white hover:text-[#412653] focus-visible:ring-4 focus-visible:ring-[#D174D2]/50"
                    >
                      <ArrowLeft size={16} />
                      Property Search
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="border-t border-white/15 bg-[#2B1740]/60 px-6 py-10 sm:px-10 md:px-16 lg:px-24">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-4 text-xs font-medium text-white/60 md:flex-row">
          <span>PROP DUE</span>
          <span>Ownership &amp; land registry</span>
        </div>
      </footer>
    </main>
  )
}

function DetailCard({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === ''
      ? 'Not available'
      : String(value)

  return (
    <div className="bg-[#341D47] p-6">
      <p className="text-sm text-white/65">{label}</p>
      <p className="mt-3 break-words text-base font-semibold text-white">
        {displayValue}
      </p>
    </div>
  )
}